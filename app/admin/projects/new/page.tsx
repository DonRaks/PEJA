'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Camera,
} from 'lucide-react';
import { ContentPlacement, ContentStatus, DivisionId, MediaItem } from '@/lib/types';
import { DIVISIONS, PLACEMENT_CONFIG } from '@/lib/constants';

export default function AddNewProjectPage() {
  const router = useRouter();

  // Core Form Fields
  const [title, setTitle] = useState('');
  const [division, setDivision] = useState<DivisionId>('cleaning');
  const [category, setCategory] = useState(DIVISIONS.cleaning.defaultCategories[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [placements, setPlacements] = useState<ContentPlacement[]>(['division_gallery']);
  const [sortOrder, setSortOrder] = useState(0);

  // Division Specific Metadata
  const [location, setLocation] = useState('');
  const [clientName, setClientName] = useState('');
  const [squareMeters, setSquareMeters] = useState('');
  const [produceName, setProduceName] = useState('');
  const [harvestSeason, setHarvestSeason] = useState('');
  const [packaging, setPackaging] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [tonnage, setTonnage] = useState('');
  const [collectionSeason, setCollectionSeason] = useState('');
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('');

  // Media Management
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle Division Change
  const handleDivisionChange = (newDiv: DivisionId) => {
    setDivision(newDiv);
    setCategory(DIVISIONS[newDiv].defaultCategories[0]);
  };

  // Toggle Placement Checkboxes
  const togglePlacement = (placement: ContentPlacement) => {
    setPlacements((prev) =>
      prev.includes(placement) ? prev.filter((p) => p !== placement) : [...prev, placement]
    );
  };

  // Upload handler (supports drag-and-drop & mobile file picker)
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

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const newMedia: MediaItem[] = data.items.map((item: MediaItem, idx: number) => ({
        ...item,
        order: mediaItems.length + idx,
        isCover: mediaItems.length === 0 && idx === 0,
      }));

      setMediaItems((prev) => [...prev, ...newMedia]);
      setUploadProgress(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload media files';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  // Reorder media
  const moveMedia = (index: number, direction: 'left' | 'right') => {
    const newItems = [...mediaItems];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Re-index orders
    newItems.forEach((item, idx) => {
      item.order = idx;
    });

    setMediaItems(newItems);
  };

  // Set Cover Image
  const setCoverImage = (index: number) => {
    setMediaItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        isCover: idx === index,
      }))
    );
  };

  // Remove media
  const removeMedia = (index: number) => {
    setMediaItems((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((m) => m.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  // Edit Alt Text
  const updateAltText = (index: number, newAlt: string) => {
    setMediaItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, alt: newAlt } : item))
    );
  };

  // Form Submit
  const handleSubmit = async (targetStatus?: ContentStatus) => {
    setError(null);
    const finalStatus = targetStatus || status;

    // Validation
    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }

    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    if (finalStatus === 'published') {
      if (mediaItems.length === 0) {
        setError('At least one media image is required to publish live. Upload an image or save as Draft.');
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
      division,
      category: customCategory.trim() || category,
      description: description.trim(),
      status: finalStatus,
      placements,
      sortOrder: Number(sortOrder) || 0,
      media: mediaItems,
      metadata: {
        location: location.trim() || undefined,
        // Division specific
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
          tonnage: tonnage.trim() || undefined,
        }),
        ...(division === 'clothing' && {
          collectionSeason: collectionSeason.trim() || undefined,
          fabric: fabric.trim() || undefined,
          fit: fit.trim() || undefined,
        }),
      },
    };

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save project');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/projects');
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving project';
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/admin/projects" className="btn-admin-secondary" style={{ padding: '8px 12px' }}>
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
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
            Add New Content Entry
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
            Multi-division media upload and configured placement workflow.
          </p>
        </div>
      </div>

      {/* Alert Notices */}
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
            fontSize: '0.88rem',
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
            fontSize: '0.88rem',
          }}
        >
          <Check size={20} style={{ flexShrink: 0 }} />
          <span>Project saved successfully! Redirecting to content directory...</span>
        </div>
      )}

      {/* Form Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Core Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card: Basic Info */}
          <div className="admin-card-container" style={{ padding: '24px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '16px' }}>
              Project Information
            </h2>

            <div className="admin-form-group">
              <label className="admin-form-label">Project Title *</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. Zenith Corporate Tower Deep Sanitization"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Division Selection (Core Requirement) */}
            <div className="admin-form-group">
              <label className="admin-form-label">Business Division *</label>
              <select
                className="admin-form-select"
                value={division}
                onChange={(e) => handleDivisionChange(e.target.value as DivisionId)}
              >
                <option value="cleaning">Peja Cleaning</option>
                <option value="agriculture">Peja Agriculture</option>
                <option value="logistics">Peja Logistics</option>
                <option value="clothing">Peja Clothing</option>
              </select>
              <div className="admin-form-helper">
                Assigned division: <span style={{ color: 'var(--admin-gold)' }}>{DIVISIONS[division].name}</span>
              </div>
            </div>

            {/* Category */}
            <div className="admin-form-group">
              <label className="admin-form-label">Content Category *</label>
              <select
                className="admin-form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ marginBottom: '8px' }}
              >
                {DIVISIONS[division].defaultCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="custom">Other (Enter custom category below)</option>
              </select>
              {category === 'custom' && (
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Enter custom category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Description & Narrative *</label>
              <textarea
                className="admin-form-textarea"
                rows={4}
                placeholder="Detailed scope, materials, craftsmanship, operational metrics, or specifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Location / Origin (Optional)</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. Victoria Island, Lagos or Plateau Farm Hub"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Card: Division-Specific Metadata */}
          <div className="admin-card-container" style={{ padding: '24px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '16px' }}>
              {DIVISIONS[division].name} Specifications
            </h2>

            {division === 'cleaning' && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label">Client Name</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Zenith Bank HQ"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Sanitized Area / Scope</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. 15,000 sqm or 5-Bedroom Penthouse"
                    value={squareMeters}
                    onChange={(e) => setSquareMeters(e.target.value)}
                  />
                </div>
              </>
            )}

            {division === 'agriculture' && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label">Produce Variety / Spec</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Organic Yellow Maize & Sorghum"
                    value={produceName}
                    onChange={(e) => setProduceName(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Harvest Season</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Q3 Monsoon or Year-Round"
                    value={harvestSeason}
                    onChange={(e) => setHarvestSeason(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Wholesale Packaging</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. 50kg Moisture-Proof Sacks or Bulk Tipper"
                    value={packaging}
                    onChange={(e) => setPackaging(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Harvest Yield / Metric Tonnage</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. 450 Metric Tons"
                    value={tonnage}
                    onChange={(e) => setTonnage(e.target.value)}
                  />
                </div>
              </>
            )}

            {division === 'logistics' && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label">Transit Origin</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Apapa Port Terminal"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Transit Destination</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Kano Industrial Hub"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Cargo Specification & Tonnage</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. FMCG Goods, 35 Tonnes"
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                  />
                </div>
              </>
            )}

            {division === 'clothing' && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label">Collection Season</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Harmattan / Spring 2026"
                    value={collectionSeason}
                    onChange={(e) => setCollectionSeason(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Fabric / Weave</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Hand-loomed Aso-Oke & Italian Wool"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Fit / Cut</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Structured Relaxed Drape"
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Media Upload, Placement Controls, Publishing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card: Media Upload Workflow (Crucial Requirement C) */}
          <div className="admin-card-container" style={{ padding: '24px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '8px' }}>
              Media Upload & Gallery
            </h2>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
              Upload high-resolution photography. Drag to reorder, set alt text, and designate cover image.
            </p>

            {/* Dropzone with mobile camera / photo picker support */}
            <label
              className="upload-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('active');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('active');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('active');
                if (e.dataTransfer.files) {
                  handleFileUpload(e.dataTransfer.files);
                }
              }}
            >
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                capture="environment"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(201, 168, 76, 0.15)',
                  color: 'var(--admin-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {uploading ? <Camera size={24} className="spin" /> : <Upload size={24} />}
              </div>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--admin-text-main)', fontSize: '0.9rem' }}>
                  {uploading ? uploadProgress : 'Click or drag files here to upload'}
                </span>
                <p style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                  Supports JPEG, PNG, WEBP, AVIF up to 10MB each
                </p>
              </div>
            </label>

            {/* Media Items Preview & Reordering */}
            {mediaItems.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-gold)', marginBottom: '8px' }}>
                  Uploaded Assets ({mediaItems.length}) — Click star to set cover:
                </div>
                <div className="media-preview-grid">
                  {mediaItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`media-preview-card ${item.isCover ? 'is-cover' : ''}`}
                    >
                      <div style={{ position: 'relative', height: '110px', width: '100%' }}>
                        <Image
                          src={item.url}
                          alt={item.alt || 'Asset'}
                          fill
                          sizes="140px"
                          style={{ objectFit: 'cover' }}
                        />

                        {/* Cover Badge */}
                        {item.isCover && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 4,
                              left: 4,
                              background: 'var(--admin-gold)',
                              color: '#0d1f15',
                              padding: '2px 5px',
                              borderRadius: '3px',
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            Cover
                          </div>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => removeMedia(index)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'rgba(0,0,0,0.7)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>

                      {/* Card footer controls */}
                      <div style={{ padding: '6px', background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          type="text"
                          placeholder="Alt text..."
                          value={item.alt}
                          onChange={(e) => updateAltText(index, e.target.value)}
                          style={{
                            width: '100%',
                            fontSize: '0.7rem',
                            padding: '3px 6px',
                            background: '#09150e',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            color: '#ffffff',
                          }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            <button
                              disabled={index === 0}
                              onClick={() => moveMedia(index, 'left')}
                              style={{ color: index === 0 ? 'rgba(255,255,255,0.2)' : 'var(--admin-gold)' }}
                              title="Move Left"
                            >
                              <MoveLeft size={13} />
                            </button>
                            <button
                              disabled={index === mediaItems.length - 1}
                              onClick={() => moveMedia(index, 'right')}
                              style={{ color: index === mediaItems.length - 1 ? 'rgba(255,255,255,0.2)' : 'var(--admin-gold)' }}
                              title="Move Right"
                            >
                              <MoveRight size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() => setCoverImage(index)}
                            style={{
                              color: item.isCover ? 'var(--admin-gold)' : 'rgba(255,255,255,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              fontSize: '0.65rem',
                            }}
                          >
                            <Star size={12} fill={item.isCover ? 'var(--admin-gold)' : 'none'} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card: Content Placement Controls (Core Requirement D) */}
          <div className="admin-card-container" style={{ padding: '24px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '6px' }}>
              Content Placement Controls
            </h2>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
              Select where this content appears on the public website. A single content item can appear across multiple approved slots.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(Object.keys(PLACEMENT_CONFIG) as ContentPlacement[]).map((pKey) => {
                const config = PLACEMENT_CONFIG[pKey];
                const checked = placements.includes(pKey);

                return (
                  <label
                    key={pKey}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: checked ? '1px solid var(--admin-gold)' : '1px solid var(--admin-border-subtle)',
                      background: checked ? 'rgba(201, 168, 76, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlacement(pKey)}
                      style={{ marginTop: '3px', accentColor: 'var(--admin-gold)', width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem', color: checked ? 'var(--admin-gold)' : 'var(--admin-text-main)' }}>
                        {config.label}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                        {config.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card: Publishing Controls (Requirement E) */}
          <div className="admin-card-container" style={{ padding: '24px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '16px' }}>
              Publishing Status & Actions
            </h2>

            <div className="admin-form-group">
              <label className="admin-form-label">Publication Status</label>
              <select
                className="admin-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
              >
                <option value="draft">Draft (Saved privately, invisible to public)</option>
                <option value="published">Published (Live across configured slots)</option>
                <option value="archived">Archived (Stored internally, unlisted)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Sort Priority</label>
              <input
                type="number"
                className="admin-form-input"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                placeholder="0 (Lower numbers appear first)"
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit('published')}
                className="btn-admin-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                <Check size={16} />
                {submitting ? 'Saving...' : 'Publish Content Live'}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit('draft')}
                className="btn-admin-secondary"
                style={{ width: '100%', padding: '10px' }}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
