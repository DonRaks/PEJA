'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PlusCircle,
  Search,
  FileEdit,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { ContentItem, ContentPlacement, ContentStatus } from '@/lib/types';
import { DIVISIONS, PLACEMENT_CONFIG } from '@/lib/constants';

export default function AdminProjectsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [placementFilter, setPlacementFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'sortOrder'>('date');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Quick Status Toggle (Publish / Unpublish / Archive)
  const handleStatusChange = async (id: string, newStatus: ContentStatus) => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update project status');
        return;
      }

      const updated = await res.json();
      setItems((prev) => prev.map((item) => (item.id === id ? updated.item : item)));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Delete / Archive item
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  // Filter & Sort Logic
  const filteredItems = items.filter((item) => {
    // Search
    if (search) {
      const q = search.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.metadata?.location && item.metadata.location.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Division
    if (divisionFilter !== 'all' && item.division !== divisionFilter) {
      return false;
    }

    // Status
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }

    // Placement
    if (placementFilter !== 'all' && !item.placements?.includes(placementFilter as ContentPlacement)) {
      return false;
    }

    return true;
  });

  filteredItems.sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'sortOrder') {
      return a.sortOrder - b.sortOrder;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div>
      {/* Title & Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2rem',
              color: 'var(--admin-text-main)',
              fontWeight: 600,
            }}
          >
            Projects & Content Management
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
            Filter, edit, publish, preview, and reorder assets across all four business divisions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchProjects} className="btn-admin-secondary" title="Refresh">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link href="/admin/projects/new" className="btn-admin-primary">
            <PlusCircle size={16} />
            <span>Add New Project</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--admin-text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search projects, categories, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-form-input"
            style={{ paddingLeft: '36px', height: '40px' }}
          />
        </div>

        {/* Division Filter */}
        <div>
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="admin-form-select"
            style={{ height: '40px' }}
          >
            <option value="all">All Business Divisions</option>
            <option value="cleaning">Peja Cleaning</option>
            <option value="agriculture">Peja Agriculture</option>
            <option value="logistics">Peja Logistics</option>
            <option value="clothing">Peja Clothing</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-form-select"
            style={{ height: '40px' }}
          >
            <option value="all">All Statuses (Live & Drafts)</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>

        {/* Placement Filter */}
        <div>
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="admin-form-select"
            style={{ height: '40px' }}
          >
            <option value="all">All Content Placements</option>
            <option value="homepage_featured">Homepage Featured</option>
            <option value="division_gallery">Division Gallery</option>
            <option value="service_category">Category Showcase</option>
            <option value="case_study">Case Study</option>
            <option value="lookbook_drop">Lookbook Drop</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'sortOrder')}
            className="admin-form-select"
            style={{ height: '40px' }}
          >
            <option value="date">Sort: Recently Updated</option>
            <option value="title">Sort: Title (A-Z)</option>
            <option value="sortOrder">Sort: Custom Order</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="admin-card-container">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-main)' }}>
              Showing {filteredItems.length} of {items.length} items
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            Loading projects repository...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            No projects matched your criteria. Try adjusting filters or search term.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Media</th>
                  <th>Title & Division</th>
                  <th>Category</th>
                  <th>Placements</th>
                  <th>Status</th>
                  <th>Ordering</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const coverImg =
                    item.media?.find((m) => m.isCover)?.url || item.media?.[0]?.url || '/logo/logo-mark.png';
                  const div = DIVISIONS[item.division];

                  return (
                    <tr key={item.id}>
                      <td style={{ width: '70px' }}>
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#09150e',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          <Image
                            src={coverImg}
                            alt={item.title}
                            fill
                            sizes="56px"
                            style={{ objectFit: 'cover' }}
                          />
                          {item.media && item.media.length > 1 && (
                            <span
                              style={{
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                background: 'rgba(0,0,0,0.7)',
                                color: '#ffffff',
                                fontSize: '0.62rem',
                                padding: '1px 4px',
                                borderRadius: '3px',
                              }}
                            >
                              +{item.media.length - 1}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text-main)', fontSize: '0.9rem' }}>
                          {item.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span
                            className="badge-division"
                            style={{ background: div.bgBadge, color: div.accentColor }}
                          >
                            {div.name}
                          </span>
                          {item.metadata?.location && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                              📍 {item.metadata.location}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.84rem' }}>
                        {item.category}
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '280px' }}>
                          {item.placements?.map((p) => {
                            const config = PLACEMENT_CONFIG[p];
                            return (
                              <span key={p} className="badge-placement">
                                {config?.label || p}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span className={`badge-status badge-${item.status}`}>
                            {item.status}
                          </span>
                          {/* Quick Toggle Action */}
                          {item.status === 'draft' ? (
                            <button
                              onClick={() => handleStatusChange(item.id, 'published')}
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--admin-success)',
                                textAlign: 'left',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                              }}
                            >
                              Publish Now
                            </button>
                          ) : item.status === 'published' ? (
                            <button
                              onClick={() => handleStatusChange(item.id, 'draft')}
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--admin-warning)',
                                textAlign: 'left',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                              }}
                            >
                              Unpublish to Draft
                            </button>
                          ) : null}
                        </div>
                      </td>

                      <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>
                        #{item.sortOrder}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <Link
                            href={`/preview/${item.id}`}
                            target="_blank"
                            className="btn-admin-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            title="Preview Content Item"
                          >
                            <Eye size={14} />
                            <span>Preview</span>
                          </Link>
                          <Link
                            href={`/admin/projects/${item.id}/edit`}
                            className="btn-admin-primary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            title="Edit Project"
                          >
                            <FileEdit size={14} />
                            <span>Edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="btn-admin-danger"
                            title="Delete Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
