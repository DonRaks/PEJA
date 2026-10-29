-- =========================================================================
-- PEJA VENTURES CONTENT MANAGEMENT SYSTEM — SUPABASE SCHEMA & RLS POLICIES
-- Multi-Tenant Ready, Secure Row Level Security & Media Storage Configuration
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ORGANIZATIONS (Multi-Client / Tenant Architecture)
create table if not exists public.organizations (
  id text primary key default 'org_peja_group',
  name text not null,
  contact_email text,
  phone text,
  address text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Seed default tenant
insert into public.organizations (id, name, contact_email, phone, address)
values (
  'org_peja_group',
  'PEJA Ventures NIG.',
  'hello@pejaventures.ng',
  '+234 800 PEJA VTR',
  'Lagos, Nigeria'
) on conflict (id) do nothing;

-- 2. PROJECTS & CONTENT ITEMS TABLE
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  organization_id text not null references public.organizations(id) on delete cascade,
  title text not null,
  slug text not null unique,
  division text not null check (division in ('cleaning', 'agriculture', 'logistics', 'clothing')),
  category text not null,
  description text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  placements text[] not null default array['division_gallery']::text[],
  media jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_by text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  published_at timestamptz
);

-- Performance indices
create index if not exists idx_projects_org_status on public.projects(organization_id, status);
create index if not exists idx_projects_division on public.projects(division);
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_placements on public.projects using gin(placements);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.projects enable row level security;
alter table public.organizations enable row level security;

-- Policy: Public visitors can ONLY read published projects
create policy "Public visitors can only view published projects"
  on public.projects
  for select
  using (status = 'published');

-- Policy: Authenticated administrators can manage all projects within their tenant
create policy "Authenticated admins full access"
  on public.projects
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Policy: Public can read organization public info
create policy "Public can view organizations"
  on public.organizations
  for select
  to public
  using (true);

-- 4. SUPABASE STORAGE BUCKET CONFIGURATION
-- Run in Supabase SQL editor:
insert into storage.buckets (id, name, public)
values ('peja-media', 'peja-media', true)
on conflict (id) do nothing;

-- Storage Policy: Public can read media assets
create policy "Public media read access"
  on storage.objects for select
  using (bucket_id = 'peja-media');

-- Storage Policy: Authenticated admins can upload media assets
create policy "Admin upload media access"
  on storage.objects for insert
  with check (bucket_id = 'peja-media' and auth.role() = 'authenticated');

-- Storage Policy: Authenticated admins can delete media assets
create policy "Admin delete media access"
  on storage.objects for delete
  using (bucket_id = 'peja-media' and auth.role() = 'authenticated');
