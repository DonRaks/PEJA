import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { ContentItem, ContentPlacement, ContentStatus, DashboardStats, DivisionId, UserSession } from './types';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, hashPassword, verifyPassword } from './auth';
import { DEFAULT_TENANT_ID, DEFAULT_TENANT_NAME } from './constants';
import { INITIAL_CONTENT } from './seed';
import { getSupabaseAdminClient } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Memory cache to accelerate fast reads in dev/prod
let memoryContentCache: ContentItem[] | null = null;

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data dir', err);
  }
}

/**
 * Load items from persistent file or seed if first time
 */
async function loadContentStore(): Promise<ContentItem[]> {
  if (memoryContentCache) {
    return memoryContentCache;
  }

  await ensureDataDir();

  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryContentCache = parsed;
      return parsed;
    }
  } catch {
    // File doesn't exist yet, seed with rich initial content
  }

  // Seed default
  memoryContentCache = [...INITIAL_CONTENT];
  await saveContentStore(memoryContentCache);
  return memoryContentCache;
}

/**
 * Atomic save to persistent file
 */
async function saveContentStore(items: ContentItem[]): Promise<void> {
  await ensureDataDir();
  memoryContentCache = items;
  const tempFile = `${CONTENT_FILE}.tmp.${Date.now()}`;
  await fs.writeFile(tempFile, JSON.stringify(items, null, 2), 'utf-8');
  await fs.rename(tempFile, CONTENT_FILE);
}

// User credentials store
interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  passwordHash: string;
  passwordSalt: string;
  organizationId: string;
  createdAt: string;
}

async function loadUsersStore(): Promise<StoredUser[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // Seed default admin
  }

  const { hash, salt } = hashPassword(DEFAULT_ADMIN_PASSWORD);
  const defaultAdmin: StoredUser = {
    id: 'user_admin_peja',
    email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
    name: 'PEJA Chief Administrator',
    role: 'admin',
    passwordHash: hash,
    passwordSalt: salt,
    organizationId: DEFAULT_TENANT_ID,
    createdAt: new Date().toISOString(),
  };

  const users = [defaultAdmin];
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  return users;
}

/**
 * Authenticate Administrator
 */
export async function authenticateAdmin(email: string, password: string): Promise<UserSession | null> {
  // Check Supabase Auth if credentials configured
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (!error && data.user) {
        return {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || 'Administrator',
          role: (data.user.user_metadata?.role as 'admin' | 'editor') || 'admin',
          organizationId: data.user.user_metadata?.organizationId || DEFAULT_TENANT_ID,
        };
      }
    } catch (err) {
      console.warn('Supabase Auth attempt failed, falling back to secure local store:', err);
    }
  }

  // Persistent user store
  const users = await loadUsersStore();
  const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!found) return null;

  const valid = verifyPassword(password, found.passwordHash, found.passwordSalt);
  if (!valid) return null;

  return {
    id: found.id,
    email: found.email,
    name: found.name,
    role: found.role,
    organizationId: found.organizationId,
  };
}

/**
 * Filter and query content items
 */
export async function getContentItems(options?: {
  division?: DivisionId;
  placement?: ContentPlacement;
  status?: ContentStatus;
  search?: string;
  category?: string;
  organizationId?: string;
  limit?: number;
}): Promise<ContentItem[]> {
  // Check Supabase PostgreSQL if enabled
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      let query = supabase.from('projects').select('*');

      if (options?.organizationId) {
        query = query.eq('organization_id', options.organizationId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.division) {
        query = query.eq('division', options.division);
      }
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.placement) {
        query = query.contains('placements', [options.placement]);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          organizationId: d.organization_id || DEFAULT_TENANT_ID,
          title: d.title,
          slug: d.slug,
          division: d.division,
          category: d.category,
          description: d.description,
          status: d.status,
          placements: d.placements || [],
          media: d.media || [],
          metadata: d.metadata || {},
          sortOrder: d.sort_order || 0,
          createdBy: d.created_by,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          publishedAt: d.published_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase DB fetch error, falling back to persistent local store:', err);
    }
  }

  // Persistent store query
  let items = await loadContentStore();

  if (options?.organizationId) {
    items = items.filter((item) => item.organizationId === options.organizationId);
  }

  if (options?.division) {
    items = items.filter((item) => item.division === options.division);
  }

  if (options?.placement) {
    items = items.filter((item) => item.placements.includes(options.placement!));
  }

  if (options?.status) {
    items = items.filter((item) => item.status === options.status);
  }

  if (options?.category) {
    items = items.filter((item) => item.category.toLowerCase() === options.category!.toLowerCase());
  }

  if (options?.search) {
    const term = options.search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        (item.metadata.location && item.metadata.location.toLowerCase().includes(term))
    );
  }

  // Sort by sortOrder ASC, then createdAt DESC
  items.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (options?.limit && options.limit > 0) {
    return items.slice(0, options.limit);
  }

  return items;
}

/**
 * Get single item by ID
 */
export async function getContentItemById(id: string): Promise<ContentItem | null> {
  const items = await loadContentStore();
  return items.find((i) => i.id === id) || null;
}

/**
 * Get single item by Slug
 */
export async function getContentItemBySlug(slug: string): Promise<ContentItem | null> {
  const items = await loadContentStore();
  return items.find((i) => i.slug === slug) || null;
}

/**
 * Helper to slugify string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Create new content item
 */
export async function createContentItem(
  data: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string }
): Promise<ContentItem> {
  const items = await loadContentStore();
  const id = crypto.randomUUID();
  const baseSlug = slugify(data.slug || data.title);
  let slug = baseSlug;
  let counter = 1;
  while (items.some((i) => i.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const now = new Date().toISOString();
  const newItem: ContentItem = {
    ...data,
    id,
    slug,
    organizationId: data.organizationId || DEFAULT_TENANT_ID,
    createdAt: now,
    updatedAt: now,
    publishedAt: data.status === 'published' ? (data.publishedAt || now) : undefined,
  };

  items.unshift(newItem);
  await saveContentStore(items);

  // Sync to Supabase if configured
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase.from('projects').insert({
        id: newItem.id,
        organization_id: newItem.organizationId,
        title: newItem.title,
        slug: newItem.slug,
        division: newItem.division,
        category: newItem.category,
        description: newItem.description,
        status: newItem.status,
        placements: newItem.placements,
        media: newItem.media,
        metadata: newItem.metadata,
        sort_order: newItem.sortOrder,
        created_by: newItem.createdBy,
        created_at: newItem.createdAt,
        updated_at: newItem.updatedAt,
        published_at: newItem.publishedAt,
      });
    } catch (err) {
      console.warn('Supabase DB sync insert error:', err);
    }
  }

  return newItem;
}

/**
 * Update content item
 */
export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
  const items = await loadContentStore();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const existing = items[index];
  const now = new Date().toISOString();

  let publishedAt = existing.publishedAt;
  if (updates.status === 'published' && existing.status !== 'published') {
    publishedAt = updates.publishedAt || now;
  } else if (updates.status && updates.status !== 'published') {
    publishedAt = undefined;
  }

  const updated: ContentItem = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now,
    publishedAt,
  };

  items[index] = updated;
  await saveContentStore(items);

  // Sync to Supabase if configured
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase
        .from('projects')
        .update({
          title: updated.title,
          slug: updated.slug,
          division: updated.division,
          category: updated.category,
          description: updated.description,
          status: updated.status,
          placements: updated.placements,
          media: updated.media,
          metadata: updated.metadata,
          sort_order: updated.sortOrder,
          updated_at: updated.updatedAt,
          published_at: updated.publishedAt,
        })
        .eq('id', updated.id);
    } catch (err) {
      console.warn('Supabase DB sync update error:', err);
    }
  }

  return updated;
}

/**
 * Delete / Archive content item
 */
export async function deleteContentItem(id: string): Promise<boolean> {
  const items = await loadContentStore();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;

  await saveContentStore(filtered);

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  return true;
}

/**
 * Aggregate Dashboard Statistics
 */
export async function getDashboardStats(organizationId: string = DEFAULT_TENANT_ID): Promise<DashboardStats> {
  const items = await loadContentStore();
  const orgItems = items.filter((i) => i.organizationId === organizationId);

  const stats: DashboardStats = {
    totalProjects: orgItems.length,
    publishedCount: orgItems.filter((i) => i.status === 'published').length,
    draftCount: orgItems.filter((i) => i.status === 'draft').length,
    archivedCount: orgItems.filter((i) => i.status === 'archived').length,
    homepageFeaturedCount: orgItems.filter(
      (i) => i.status === 'published' && i.placements.includes('homepage_featured')
    ).length,
    divisionCounts: {
      cleaning: orgItems.filter((i) => i.division === 'cleaning').length,
      agriculture: orgItems.filter((i) => i.division === 'agriculture').length,
      logistics: orgItems.filter((i) => i.division === 'logistics').length,
      clothing: orgItems.filter((i) => i.division === 'clothing').length,
    },
    totalMediaCount: orgItems.reduce((acc, curr) => acc + (curr.media?.length || 0), 0),
    storageUsedBytes: orgItems.reduce(
      (acc, curr) => acc + (curr.media?.reduce((mAcc, m) => mAcc + (m.fileSize || 0), 0) || 0),
      0
    ),
  };

  return stats;
}

/**
 * Organization Settings
 */
export interface OrganizationSettings {
  id: string;
  name: string;
  contactEmail: string;
  phone: string;
  address: string;
  currency: string;
  maintenanceMode: boolean;
  enablePwa: boolean;
  supabaseConnected: boolean;
}

export async function getOrganizationSettings(organizationId: string = DEFAULT_TENANT_ID): Promise<OrganizationSettings> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed[organizationId]) {
      return {
        ...parsed[organizationId],
        supabaseConnected: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      };
    }
  } catch {
    // Return default
  }

  return {
    id: organizationId,
    name: DEFAULT_TENANT_NAME,
    contactEmail: 'hello@pejaventures.ng',
    phone: '+234 800 PEJA VTR',
    address: 'Lagos, Nigeria',
    currency: 'NGN (₦)',
    maintenanceMode: false,
    enablePwa: true,
    supabaseConnected: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

export async function updateOrganizationSettings(organizationId: string, updates: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
  await ensureDataDir();
  let current: Record<string, any> = {};
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    current = JSON.parse(raw);
  } catch {
    current = {};
  }

  const existing = current[organizationId] || await getOrganizationSettings(organizationId);
  const updated = {
    ...existing,
    ...updates,
    id: organizationId,
  };

  current[organizationId] = updated;
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(current, null, 2), 'utf-8');
  return {
    ...updated,
    supabaseConnected: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}
