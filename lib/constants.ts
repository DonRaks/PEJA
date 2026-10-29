import { DivisionId, ContentPlacement } from './types';

export const DIVISIONS: Record<
  DivisionId,
  {
    id: DivisionId;
    name: string;
    headline: string;
    tagline: string;
    route: string;
    accentColor: string;
    bgBadge: string;
    defaultCategories: string[];
    allowedPlacements: ContentPlacement[];
  }
> = {
  cleaning: {
    id: 'cleaning',
    name: 'PEJA Cleaning',
    headline: 'Excellence in Commercial & Luxury Space Sanitization',
    tagline: 'Professional cleaning services for corporate headquarters, industrial facilities, and residences.',
    route: '/cleaning',
    accentColor: '#38bdf8',
    bgBadge: 'rgba(56, 189, 248, 0.15)',
    defaultCategories: ['Commercial Facility', 'Industrial Deep Clean', 'Post-Construction', 'Luxury Residential', 'Facade & Glass'],
    allowedPlacements: ['division_gallery', 'homepage_featured', 'service_category', 'case_study'],
  },
  agriculture: {
    id: 'agriculture',
    name: 'PEJA Agriculture',
    headline: 'Sustainably Grown Produce & Industrial Food Supply',
    tagline: 'Cultivating food security through high-yield farming, processing, and direct wholesale delivery.',
    route: '/agriculture',
    accentColor: '#4ade80',
    bgBadge: 'rgba(74, 222, 128, 0.15)',
    defaultCategories: ['Grains & Cereals', 'Fresh Vegetables', 'Livestock Feed', 'Tubers & Cassava', 'Export Commodities'],
    allowedPlacements: ['division_gallery', 'homepage_featured', 'service_category', 'case_study'],
  },
  logistics: {
    id: 'logistics',
    name: 'PEJA Logistics',
    headline: 'Precision Haulage, Cold Chain & National Distribution',
    tagline: 'End-to-end freight and inter-state logistics powering Nigerian supply chains.',
    route: '/logistics',
    accentColor: '#fbbf24',
    bgBadge: 'rgba(251, 191, 36, 0.15)',
    defaultCategories: ['Inter-State Haulage', 'Cold Chain Transport', 'Warehousing & Staging', 'Last-Mile Express', 'Heavy Equipment'],
    allowedPlacements: ['division_gallery', 'homepage_featured', 'service_category', 'case_study'],
  },
  clothing: {
    id: 'clothing',
    name: 'PEJA Clothing',
    headline: 'Contemporary Nigerian Craftsmanship & Ready-to-Wear',
    tagline: 'Sophisticated silhouettes, premium fabrics, and sartorial expression for everyday elegance.',
    route: '/clothing',
    accentColor: '#f472b6',
    bgBadge: 'rgba(244, 114, 182, 0.15)',
    defaultCategories: ['Lookbook 2026', 'Corporate Sartorial', 'Resort & Casual', 'Traditional Contemporary', 'Limited Edition'],
    allowedPlacements: ['division_gallery', 'homepage_featured', 'service_category', 'lookbook_drop'],
  },
};

export const PLACEMENT_CONFIG: Record<
  ContentPlacement,
  {
    label: string;
    description: string;
    badgeColor: string;
  }
> = {
  division_gallery: {
    label: "Division Gallery",
    description: "Appears in the dedicated public portfolio/gallery page for this business unit.",
    badgeColor: '#10b981',
  },
  homepage_featured: {
    label: "Homepage Featured Work",
    description: "Curated showcase on the main PEJA Ventures cinematic homepage.",
    badgeColor: '#c9a84c',
  },
  service_category: {
    label: "Category Showcase",
    description: "Grouped by service category on the division's overview sections.",
    badgeColor: '#6366f1',
  },
  case_study: {
    label: "In-Depth Case Study",
    description: "Highlights key operational metrics, client problem & delivered solution.",
    badgeColor: '#f59e0b',
  },
  lookbook_drop: {
    label: "Lookbook Drop / Capsule",
    description: "Curated seasonal collection view with editorial styling.",
    badgeColor: '#ec4899',
  },
};

export const DEFAULT_TENANT_ID = 'org_peja_group';
export const DEFAULT_TENANT_NAME = 'PEJA Ventures NIG.';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
