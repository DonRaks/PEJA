'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PlusCircle,
  ExternalLink,
  FolderKanban,
} from 'lucide-react';
import { ContentItem, DivisionId } from '@/lib/types';
import { DIVISIONS } from '@/lib/constants';

export default function AdminDivisionsPage() {
  const [projects, setProjects] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const divisionKeys: DivisionId[] = ['cleaning', 'agriculture', 'logistics', 'clothing'];

  const divisionImages: Record<DivisionId, string> = {
    cleaning: '/peja-cleaning.jpg',
    agriculture: '/peja-agriculture.jpg',
    logistics: '/peja-logistics.jpg',
    clothing: '/peja-clothing.jpg',
  };

  return (
    <div>
      {/* Header */}
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
            Four Business Divisions
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
            Independent content management, category taxonomies, and live gallery monitoring for each business unit.
          </p>
        </div>

        <Link href="/admin/projects/new" className="btn-admin-primary">
          <PlusCircle size={16} />
          <span>Add Content Item</span>
        </Link>
      </div>

      {/* Division Cards */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          Loading division analytics...
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {divisionKeys.map((key) => {
          const div = DIVISIONS[key];
          const divProjects = projects.filter((p) => p.division === key);
          const published = divProjects.filter((p) => p.status === 'published');
          const drafts = divProjects.filter((p) => p.status === 'draft');
          const featured = divProjects.filter((p) => p.placements?.includes('homepage_featured'));

          return (
            <div
              key={key}
              style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header Image & Badge */}
              <div style={{ position: 'relative', height: '140px', width: '100%', background: '#09150e' }}>
                <Image
                  src={divisionImages[key]}
                  alt={div.name}
                  fill
                  sizes="480px"
                  style={{ objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(9, 21, 14, 0.4) 0%, rgba(9, 21, 14, 0.85) 100%)',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '20px',
                    right: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        background: div.bgBadge,
                        color: div.accentColor,
                      }}
                    >
                      {div.name}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
                      {div.headline}
                    </h2>
                  </div>

                  <Link
                    href={div.route}
                    target="_blank"
                    className="btn-admin-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.74rem' }}
                    title="View Public Page"
                  >
                    <span>View Public</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', lineHeight: 1.5 }}>
                  {div.tagline}
                </p>

                {/* Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '12px',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--admin-success)' }}>
                      {published.length}
                    </span>
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>
                      Published
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--admin-warning)' }}>
                      {drafts.length}
                    </span>
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>
                      Drafts
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--admin-gold)' }}>
                      {featured.length}
                    </span>
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>
                      Homepage
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--admin-text-muted)', marginBottom: '6px' }}>
                    Default Categories:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {div.defaultCategories.map((cat) => (
                      <span
                        key={cat}
                        style={{
                          fontSize: '0.72rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          color: 'var(--admin-text-main)',
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--admin-border-subtle)',
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  <Link
                    href={`/admin/projects/new?division=${key}`}
                    className="btn-admin-primary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem' }}
                  >
                    <PlusCircle size={14} />
                    <span>Add {div.name} Content</span>
                  </Link>
                  <Link
                    href={`/admin/projects?division=${key}`}
                    className="btn-admin-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.78rem' }}
                  >
                    <FolderKanban size={14} />
                    <span>View Projects</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
