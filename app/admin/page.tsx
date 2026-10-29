'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FolderKanban,
  CheckCircle2,
  FileEdit,
  Star,
  PlusCircle,
  Image as ImageIcon,
  ArrowRight,
  Clock,
  Eye,
} from 'lucide-react';
import { ContentItem, DashboardStats, DivisionId } from '@/lib/types';
import { DIVISIONS, PLACEMENT_CONFIG } from '@/lib/constants';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/projects'),
        ]);

        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s.stats);
        }

        if (projectsRes.ok) {
          const p = await projectsRes.json();
          setRecentProjects((p.items || []).slice(0, 6));
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const divisionOrder: DivisionId[] = ['cleaning', 'agriculture', 'logistics', 'clothing'];

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20, 42, 30, 0.9) 0%, rgba(14, 32, 22, 0.95) 100%)',
          border: '1px solid var(--admin-border)',
          borderRadius: '10px',
          padding: '24px 28px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--admin-gold)', fontWeight: 700 }}>
              Administration Console
            </span>
            <span style={{ color: 'var(--admin-border)' }}>•</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Real-Time Synchronization</span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2rem',
              fontWeight: 600,
              color: 'var(--admin-text-main)',
              lineHeight: 1.2,
            }}
          >
            Welcome to PEJA Studio
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage editorial portfolios, multi-division content, mobile uploads, and homepage placements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/admin/projects/new" className="btn-admin-primary">
            <PlusCircle size={16} />
            Add Content
          </Link>
          <Link href="/admin/media" className="btn-admin-secondary">
            <ImageIcon size={16} />
            Media Library
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-stat-card__label">Total Projects</span>
            <FolderKanban size={18} style={{ color: 'var(--admin-gold)' }} />
          </div>
          <div className="admin-stat-card__val">{stats?.totalProjects ?? '—'}</div>
          <div className="admin-stat-card__hint">Across all 4 business divisions</div>
        </div>

        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-stat-card__label">Published Live</span>
            <CheckCircle2 size={18} style={{ color: 'var(--admin-success)' }} />
          </div>
          <div className="admin-stat-card__val" style={{ color: 'var(--admin-success)' }}>
            {stats?.publishedCount ?? '—'}
          </div>
          <div className="admin-stat-card__hint">Visible to public visitors</div>
        </div>

        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-stat-card__label">Draft Content</span>
            <FileEdit size={18} style={{ color: 'var(--admin-warning)' }} />
          </div>
          <div className="admin-stat-card__val" style={{ color: 'var(--admin-warning)' }}>
            {stats?.draftCount ?? '—'}
          </div>
          <div className="admin-stat-card__hint">Private and unlisted</div>
        </div>

        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-stat-card__label">Homepage Featured</span>
            <Star size={18} style={{ color: 'var(--admin-gold)' }} />
          </div>
          <div className="admin-stat-card__val">{stats?.homepageFeaturedCount ?? '—'}</div>
          <div className="admin-stat-card__hint">Featured on main homepage</div>
        </div>
      </div>

      {/* Division Content Distribution */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text-main)', letterSpacing: '0.04em' }}>
            Four Business Divisions
          </h2>
          <Link
            href="/admin/divisions"
            style={{ fontSize: '0.78rem', color: 'var(--admin-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Manage Divisions <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {divisionOrder.map((divId) => {
            const div = DIVISIONS[divId];
            const count = stats?.divisionCounts?.[divId] ?? 0;
            return (
              <div
                key={divId}
                style={{
                  background: 'var(--admin-card)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '8px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: div.bgBadge,
                      color: div.accentColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {div.name}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                    {count}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', lineHeight: 1.4 }}>
                  {div.headline}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '6px' }}>
                  <Link
                    href={`/admin/projects/new?division=${divId}`}
                    className="btn-admin-secondary"
                    style={{ flex: 1, padding: '6px 8px', fontSize: '0.74rem' }}
                  >
                    <PlusCircle size={12} /> Add
                  </Link>
                  <Link
                    href={`/admin/projects?division=${divId}`}
                    className="btn-admin-secondary"
                    style={{ padding: '6px 8px', fontSize: '0.74rem' }}
                    title="View Division Projects"
                  >
                    <Eye size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="admin-card-container">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={18} style={{ color: 'var(--admin-gold)' }} />
            <h2 className="admin-card-title">Recent Publishing & Project Activity</h2>
          </div>
          <Link href="/admin/projects" className="btn-admin-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
            View All Projects ({stats?.totalProjects ?? 0})
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            Loading content repository...
          </div>
        ) : recentProjects.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            No projects found. Click &quot;Add Content&quot; to create your first portfolio entry.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title & Division</th>
                  <th>Category</th>
                  <th>Placements</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((item) => {
                  const coverImg = item.media?.find((m) => m.isCover)?.url || item.media?.[0]?.url || '/logo/logo-mark.png';
                  const div = DIVISIONS[item.division];

                  return (
                    <tr key={item.id}>
                      <td style={{ width: '60px' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#09150e',
                          }}
                        >
                          <Image
                            src={coverImg}
                            alt={item.title}
                            fill
                            sizes="46px"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text-main)', fontSize: '0.88rem' }}>
                          {item.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span
                            className="badge-division"
                            style={{ background: div.bgBadge, color: div.accentColor }}
                          >
                            {div.name}
                          </span>
                        </div>
                      </td>

                      <td style={{ color: 'var(--admin-text-muted)' }}>{item.category}</td>

                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '240px' }}>
                          {item.placements?.map((p) => (
                            <span key={p} className="badge-placement">
                              {PLACEMENT_CONFIG[p]?.label || p}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td>
                        <span className={`badge-status badge-${item.status}`}>
                          {item.status}
                        </span>
                      </td>

                      <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>
                        {new Date(item.updatedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <Link
                            href={`/preview/${item.id}`}
                            target="_blank"
                            className="btn-admin-secondary"
                            style={{ padding: '5px 8px', fontSize: '0.74rem' }}
                            title="Live Preview"
                          >
                            <Eye size={13} />
                          </Link>
                          <Link
                            href={`/admin/projects/${item.id}/edit`}
                            className="btn-admin-secondary"
                            style={{ padding: '5px 8px', fontSize: '0.74rem' }}
                            title="Edit Project"
                          >
                            <FileEdit size={13} />
                          </Link>
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
