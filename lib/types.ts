export type DivisionId = 'cleaning' | 'agriculture' | 'logistics' | 'clothing';

export type ContentStatus = 'draft' | 'published' | 'archived';

export type ContentPlacement = 
  | 'division_gallery'
  | 'homepage_featured'
  | 'service_category'
  | 'case_study'
  | 'lookbook_drop';

export interface MediaItem {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
  isCover?: boolean;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
}

export interface DivisionSpecificMetadata {
  // Cleaning
  clientName?: string;
  completionDate?: string;
  squareMeters?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  cleaningType?: 'Commercial' | 'Residential' | 'Industrial' | 'Post-Construction' | 'Deep Clean';

  // Agriculture
  produceName?: string;
  harvestSeason?: string;
  packaging?: string;
  minimumOrder?: string;
  originFarm?: string;
  shelfLife?: string;

  // Logistics
  origin?: string;
  destination?: string;
  cargoType?: string;
  tonnage?: string;
  transitTime?: string;
  fleetType?: string;

  // Clothing
  collectionSeason?: string;
  fabric?: string;
  fit?: string;
  releaseYear?: string;
  colorways?: string[];
  stylingNotes?: string;

  // Generic
  location?: string;
}

export interface ContentItem {
  id: string;
  organizationId: string; // Multi-client tenant support (e.g. 'org_peja_group')
  title: string;
  slug: string;
  division: DivisionId;
  category: string;
  description: string;
  status: ContentStatus;
  placements: ContentPlacement[];
  media: MediaItem[];
  metadata: DivisionSpecificMetadata;
  sortOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  organizationId: string;
}

export interface DashboardStats {
  totalProjects: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  homepageFeaturedCount: number;
  divisionCounts: Record<DivisionId, number>;
  totalMediaCount: number;
  storageUsedBytes: number;
}
