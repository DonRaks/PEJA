import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getContentItemById } from '@/lib/db';
import { DIVISIONS, PLACEMENT_CONFIG } from '@/lib/constants';
import { ArrowLeft, FileEdit } from 'lucide-react';

export default async function ProjectPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getContentItemById(id);

  if (!item) {
    notFound();
  }

  const division = DIVISIONS[item.division];
  const coverImage = item.media?.find((m) => m.isCover)?.url || item.media?.[0]?.url || '/logo/logo-mark.png';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', color: 'var(--text-dark)', fontFamily: "'Inter', sans-serif" }}>
      {/* Admin Preview Header Bar */}
      <div
        style={{
          background: '#0d1f15',
          color: '#f5f0e8',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          borderBottom: '1px solid rgba(201, 168, 76, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/admin/projects"
            style={{
              color: 'var(--admin-gold)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>Admin Directory</span>
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ fontSize: '0.82rem', color: '#9eb5a7' }}>
            Live Preview Mode ({item.status === 'published' ? 'Live Public Entry' : 'Draft / Unpublished Entry'})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '3px 8px',
              borderRadius: '4px',
              background: item.status === 'published' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: item.status === 'published' ? '#34d399' : '#fbbf24',
              border: item.status === 'published' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
            }}
          >
            {item.status}
          </span>
          <Link
            href={`/admin/projects/${item.id}/edit`}
            style={{
              background: 'var(--gold)',
              color: '#0d1f15',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileEdit size={14} />
            <span>Edit Entry</span>
          </Link>
        </div>
      </div>

      {/* Main Preview Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, #0d1f15 0%, #1a3a2a 100%)',
          color: '#f5f0e8',
          padding: '80px 24px 60px',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                padding: '4px 10px',
                borderRadius: '4px',
                background: division.bgBadge,
                color: division.accentColor,
              }}
            >
              {division.name}
            </span>
            <span style={{ color: 'var(--gold)' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>{item.category}</span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              lineHeight: 1.15,
              fontWeight: 400,
              marginBottom: '20px',
            }}
          >
            {item.title}
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'rgba(245, 240, 232, 0.85)',
              maxWidth: '800px',
              lineHeight: 1.7,
            }}
          >
            {item.description}
          </p>

          {/* Active Placements Notice */}
          <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Configured Placements:
            </span>
            {item.placements?.map((p) => (
              <span
                key={p}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '3px',
                  background: 'rgba(201, 168, 76, 0.15)',
                  color: 'var(--gold)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                }}
              >
                {PLACEMENT_CONFIG[p]?.label || p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Media Gallery Preview */}
      <section style={{ maxWidth: '1000px', margin: '-40px auto 60px', padding: '0 24px' }}>
        {/* Cover Photo */}
        <div
          style={{
            position: 'relative',
            height: '520px',
            width: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            background: '#0d1f15',
          }}
        >
          <Image
            src={coverImage}
            alt={item.title}
            fill
            priority
            sizes="1000px"
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Additional Media Grid */}
        {item.media && item.media.length > 1 && (
          <div style={{ marginTop: '32px' }}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.6rem',
                color: 'var(--green-dark)',
                marginBottom: '16px',
              }}
            >
              Gallery & Detail Angles ({item.media.length} Photos)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {item.media.map((m, idx) => (
                <div
                  key={m.id || idx}
                  style={{
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                    <Image
                      src={m.url}
                      alt={m.alt || 'Project detail'}
                      fill
                      sizes="340px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  {m.alt && (
                    <div style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-mid)' }}>
                      {m.alt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Division Specifications Summary Card */}
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <div
            style={{
              marginTop: '40px',
              background: '#ffffff',
              borderRadius: '8px',
              padding: '28px',
              border: '1px solid #ede7d9',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.6rem',
                color: 'var(--green-dark)',
                marginBottom: '18px',
              }}
            >
              Project Specifications & Metadata
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              {Object.entries(item.metadata).map(([key, val]) => {
                if (!val) return null;
                return (
                  <div key={key} style={{ padding: '10px 14px', background: '#faf8f4', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--green-dark)' }}>
                      {String(val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
