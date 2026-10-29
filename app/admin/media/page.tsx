'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Upload,
  Copy,
  Check,
  Search,
  ExternalLink,
  Camera,
} from 'lucide-react';
import { MediaItem } from '@/lib/types';

interface MediaWithUsage extends MediaItem {
  usedInProjects?: Array<{ id: string; title: string; division: string }>;
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.media || []);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const files = 'target' in e ? e.target.files : e;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchMedia();
      } else {
        const data = await res.json();
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredMedia = mediaList.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.alt && m.alt.toLowerCase().includes(q)) ||
      m.url.toLowerCase().includes(q) ||
      (m.usedInProjects && m.usedInProjects.some((p) => p.title.toLowerCase().includes(q)))
    );
  });

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
            Media Asset Library
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
            Persistent storage repository for high-resolution project photography, lookbooks, and brand assets.
          </p>
        </div>

        <label className="btn-admin-primary" style={{ cursor: 'pointer' }}>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            capture="environment"
            onChange={handleUpload}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          {uploading ? <Camera size={16} className="spin" /> : <Upload size={16} />}
          <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
        </label>
      </div>

      {/* Dropzone */}
      <div style={{ marginBottom: '24px' }}>
        <label className="upload-dropzone" style={{ padding: '24px' }}>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            capture="environment"
            onChange={handleUpload}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(201, 168, 76, 0.15)',
              color: 'var(--admin-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Upload size={20} />
          </div>
          <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>
            Quick Drag & Drop or Mobile Camera Capture
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
            Upload multiple files directly to persistent object storage
          </span>
        </label>
      </div>

      {/* Filter / Search Bar */}
      <div
        style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
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
            placeholder="Search by alt text, filename, or linked project title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-form-input"
            style={{ paddingLeft: '36px', height: '38px' }}
          />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
          {filteredMedia.length} Asset{filteredMedia.length === 1 ? '' : 's'} Indexed
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          Loading asset repository...
        </div>
      ) : filteredMedia.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          No media assets found.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredMedia.map((m) => (
            <div
              key={m.id || m.url}
              style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', height: '170px', width: '100%', background: '#09150e' }}>
                <Image
                  src={m.url}
                  alt={m.alt || 'Asset'}
                  fill
                  sizes="240px"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--admin-text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={m.alt || m.url}
                >
                  {m.alt || 'PEJA Asset'}
                </div>

                {m.usedInProjects && m.usedInProjects.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--admin-gold)', fontWeight: 600 }}>
                      Used in {m.usedInProjects.length} project(s):
                    </span>
                    {m.usedInProjects.slice(0, 2).map((p) => (
                      <Link
                        key={p.id}
                        href={`/admin/projects/${p.id}/edit`}
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--admin-text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textDecoration: 'underline',
                        }}
                      >
                        {p.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                    Unassigned in projects
                  </span>
                )}

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--admin-border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <button
                    onClick={() => copyToClipboard(m.url)}
                    className="btn-admin-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                    title="Copy Image URL"
                  >
                    {copiedUrl === m.url ? (
                      <>
                        <Check size={12} style={{ color: 'var(--admin-success)' }} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-admin-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                    title="Open original"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
