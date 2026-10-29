'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Upload,
  X,
  ArrowLeft,
  MoveLeft,
  MoveRight,
  Star,
  Check,
  AlertCircle,
  Eye,
  Camera,
} from 'lucide-react';
import { ContentItem, ContentPlacement, ContentStatus, DivisionId, MediaItem } from '@/lib/types';
import { PLACEMENT_CONFIG } from '@/lib/constants';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [division, setDivision] = useState<DivisionId>('cleaning');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [placements, setPlacements] = useState<ContentPlacement[]>([]);
  const [sortOrder, setSortOrder] = useState(0);

  // Metadata
  const [location, setLocation] = useState('');
  const [clientName, setClientName] = useState('');
  const [squareMeters, setSquareMeters] = useState('');
  const [produceName, setProduceName] = useState('');
  const [harvestSeason, setHarvestSeason] = useState('');
  const [packaging, setPackaging] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [collectionSeason, setCollectionSeason] = useState('');
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('');

  // Media
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Load project details
  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/admin/projects/${id}`);
        if (!res.ok) {
          throw new Error('Project not found');
        }
        const data = await res.json();
        const item: ContentItem = data.item;

        setTitle(item.title);
        setSlug(item.slug);
        setDivision(item.division);
        setCategory(item.category);
        setDescription(item.description);
        setStatus(item.status);
        setPlacements(item.placements || ['division_gallery']);
        setSortOrder(item.sortOrder || 0);
        setMediaItems(item.media || []);

        // Metadata
        if (item.metadata) {
          setLocation(item.metadata.location || '');
          setClientName(item.metadata.clientName || '');
          setSquareMeters(item.metadata.squareMeters || '');
          setProduceName(item.metadata.produceName || '');
          setHarvestSeason(item.metadata.harvestSeason || '');
          setPackaging(item.metadata.packaging || '');
          setOrigin(item.metadata.origin || '');
          setDestination(item.metadata.destination || '');
          setCargoType(item.metadata.cargoType || '');
          setCollectionSeason(item.metadata.collectionSeason || '');
          setFabric(item.metadata.fabric || '');
          setFit(item.metadata.fit || '');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProject();
  }, [id]);

  const togglePlacement = (placement: ContentPlacement) => {
    setPlacements((prev) =>
      prev.includes(placement) ? prev.filter((p) => p !== placement) : [...prev, placement]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const files = 'target' in e ? e.target.files : e;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(`Uploading ${files.length} asset(s)...`);
    setError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('alt', title || 'PEJA Project Asset');

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const newMedia: MediaItem[] = data.items.map((item: MediaItem, idx: number) => ({
        ...item,
        order: mediaItems.length + idx,
        isCover: mediaItems.length === 0 && idx === 0,
      }));

      setMediaItems((prev) => [...prev, ...newMedia]);
      setUploadProgress(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload media files');
    } finally {
      setUploading(false);
    }
  };

  const moveMedia = (index: number, direction: 'left' | 'right') => {
    const newItems = [...mediaItems];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    newItems.forEach((item, idx) => {
      item.order = idx;
    });

    setMediaItems(newItems);
  };

  const setCoverImage = (index: number) => {
    setMediaItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        isCover: idx === index,
      }))
    );
  };

  const removeMedia = (index: number) => {
    setMediaItems((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((m) => m.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const updateAltText = (index: number, newAlt: string) => {
    setMediaItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, alt: newAlt } : item))
    );
  };

  const handleUpdate = async (targetStatus?: ContentStatus) => {
    setError(null);
    const finalStatus = targetStatus || status;

    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }

    if (finalStatus === 'published') {
      if (mediaItems.length === 0) {
        setError('At least one media image is required to publish live.');
        return;
      }
      if (placements.length === 0) {
        setError('At least one placement slot must be selected before publishing.');
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      division,
      category: category.trim(),
      description: description.trim(),
      status: finalStatus,
      placements,
      sortOrder: Number(sortOrder) || 0,
      media: mediaItems,
      metadata: {
        location: location.trim() || undefined,
        ...(division === 'cleaning' && {
          clientName: clientName.trim() || undefined,
          squareMeters: squareMeters.trim() || undefined,
        }),
        ...(division === 'agriculture' && {
          produceName: produceName.trim() || undefined,
          harvestSeason: harvestSeason.trim() || undefined,
          packaging: packaging.trim() || undefined,
        }),
        ...(division === 'logistics' && {
          origin: origin.trim() || undefined,
          destination: destination.trim() || undefined,
          cargoType: cargoType.trim() || undefined,
        }),
        ...(division === 'clothing' && {
          collectionSeason: collectionSeason.trim() || undefined,
          fabric: fabric.trim() || undefined,
          fit: fit.trim() || undefined,
        }),
      },
    };

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update project');

      setSuccess(true);
      setStatus(finalStatus);
      setTimeout(() => {
        router.push('/admin/projects');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error updating project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
        Loading project details...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin/projects" className="btn-admin-secondary" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} />
            <span>Projects</span>
          </Link>
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '2rem',
                color: 'var(--admin-text-main)',
                fontWeight: 600,
              }}
            >
              Edit: {title}
            </h1>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
              Modify metadata, re-order imagery, adjust placements, or update publication state.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href={`/preview/${id}`}
            target="_blank"
            className="btn-admin-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Eye size={15} />
            <span>Full Preview</span>
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fca5a5',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#34d399',
          }}
        >
          <Check size={20} style={{ flexShrink: 0 }} />
          <span>Changes saved successfully!</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-card-container" style={{ padding: '24px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '16px' }}>
              Project Information
            </h2>

            <div className="admin-form-group">
              <label className="admin-form-label">Project Title *</label>
              <input
                type="text"
                className="admin-form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">URL Slug</label>
              <input
                type="text"
                className="admin-form-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Business Division</label>
              <select
                className="admin-form-select"
                value={division}
                onChange={(e) => setDivision(e.target.value as DivisionId)}
              >
                <option value="cleaning">Peja Cleaning</option>
                <option value="agriculture">Peja Agriculture</option>
                <option value="logistics">Peja Logistics</option>
                <option value="clothing">Peja Clothing</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Category</label>
              <input
                type="text"
                className="admin-form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Description</label>
              <textarea
                className="admin-form-textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Location</label>
              <input
                type="text"
                className="admin-form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Media Manager */}
          <div className="admin-card-container" style={{ padding: '24px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '8px' }}>
              Media Assets ({mediaItems.length})
            </h2>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
              Existing images are preserved. Upload additional images without re-uploading everything.
            </p>

            <label className="upload-dropzone">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(201, 168, 76, 0.15)',
                  color: 'var(--admin-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {uploading ? <Camera size={20} className="spin" /> : <Upload size={20} />}
              </div>
              <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                {uploading ? uploadProgress : 'Click to add more media assets'}
              </span>
            </label>

            {mediaItems.length > 0 && (
              <div className="media-preview-grid">
                {mediaItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`media-preview-card ${item.isCover ? 'is-cover' : ''}`}
                  >
                    <div style={{ position: 'relative', height: '100px', width: '100%' }}>
                      <Image
                        src={item.url}
                        alt={item.alt || 'Asset'}
                        fill
                        sizes="140px"
                        style={{ objectFit: 'cover' }}
                      />
                      {item.isCover && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            background: 'var(--admin-gold)',
                            color: '#0d1f15',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                          }}
                        >
                          Cover
                        </div>
                      )}
                      <button
                        onClick={() => removeMedia(index)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(0,0,0,0.7)',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div style={{ padding: '6px', background: 'rgba(0,0,0,0.4)' }}>
                      <input
                        type="text"
                        placeholder="Alt text"
                        value={item.alt}
                        onChange={(e) => updateAltText(index, e.target.value)}
                        style={{
                          width: '100%',
                          fontSize: '0.68rem',
                          padding: '2px 4px',
                          background: '#09150e',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '3px',
                          color: '#ffffff',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <button
                            disabled={index === 0}
                            onClick={() => moveMedia(index, 'left')}
                            style={{ color: index === 0 ? 'rgba(255,255,255,0.2)' : 'var(--admin-gold)' }}
                          >
                            <MoveLeft size={12} />
                          </button>
                          <button
                            disabled={index === mediaItems.length - 1}
                            onClick={() => moveMedia(index, 'right')}
                            style={{ color: index === mediaItems.length - 1 ? 'rgba(255,255,255,0.2)' : 'var(--admin-gold)' }}
                          >
                            <MoveRight size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => setCoverImage(index)}
                          style={{ color: item.isCover ? 'var(--admin-gold)' : 'rgba(255,255,255,0.4)' }}
                        >
                          <Star size={12} fill={item.isCover ? 'var(--admin-gold)' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Placement Controls */}
          <div className="admin-card-container" style={{ padding: '24px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '14px' }}>
              Content Placement Controls
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Object.keys(PLACEMENT_CONFIG) as ContentPlacement[]).map((pKey) => {
                const config = PLACEMENT_CONFIG[pKey];
                const checked = placements.includes(pKey);

                return (
                  <label
                    key={pKey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '5px',
                      border: checked ? '1px solid var(--admin-gold)' : '1px solid var(--admin-border-subtle)',
                      background: checked ? 'rgba(201, 168, 76, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlacement(pKey)}
                      style={{ accentColor: 'var(--admin-gold)' }}
                    />
                    <span style={{ fontSize: '0.84rem', color: checked ? 'var(--admin-gold)' : 'inherit', fontWeight: 500 }}>
                      {config.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Publishing state */}
          <div className="admin-card-container" style={{ padding: '24px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '14px' }}>
              Publication Status
            </h2>

            <div className="admin-form-group">
              <label className="admin-form-label">Current State</label>
              <select
                className="admin-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
              >
                <option value="draft">Draft (Private, not listed publicly)</option>
                <option value="published">Published (Live in public galleries)</option>
                <option value="archived">Archived (Unlisted)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdate()}
                className="btn-admin-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                <Check size={16} />
                {submitting ? 'Updating...' : 'Save Changes'}
              </button>

              {status === 'published' ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleUpdate('draft')}
                  className="btn-admin-secondary"
                  style={{ width: '100%', padding: '10px', color: 'var(--admin-warning)' }}
                >
                  Unpublish to Draft
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleUpdate('published')}
                  className="btn-admin-secondary"
                  style={{ width: '100%', padding: '10px', color: 'var(--admin-success)' }}
                >
                  Publish Live Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
