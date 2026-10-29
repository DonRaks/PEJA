'use client';

import { useEffect, useState } from 'react';
import {
  Database,
  Smartphone,
  Check,
  AlertTriangle,
  Building,
  Save,
} from 'lucide-react';
import { OrganizationSettings } from '@/lib/db';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
        Loading configuration...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2rem',
            color: 'var(--admin-text-main)',
            fontWeight: 600,
          }}
        >
          Studio Settings & System Diagnostics
        </h1>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
          Configure enterprise tenant metadata, Supabase database connectivity, PWA installability, and administrative security.
        </p>
      </div>

      {saveSuccess && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#34d399',
            fontSize: '0.86rem',
          }}
        >
          <Check size={18} />
          <span>Settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Tenant Configuration */}
        <div className="admin-card-container" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Building size={20} style={{ color: 'var(--admin-gold)' }} />
            <div>
              <h2 className="admin-card-title">Organization & Tenant Profile</h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                Multi-tenant isolated container: <code>{settings.id}</code>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Organization Name</label>
              <input
                type="text"
                className="admin-form-input"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Official Contact Email</label>
              <input
                type="email"
                className="admin-form-input"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Phone Hotline</label>
              <input
                type="text"
                className="admin-form-input"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Headquarters Address</label>
              <input
                type="text"
                className="admin-form-input"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Backend & Supabase Integration Diagnostics */}
        <div className="admin-card-container" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Database size={20} style={{ color: 'var(--admin-gold)' }} />
            <div>
              <h2 className="admin-card-title">Backend Architecture & Supabase Diagnostics</h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                PostgreSQL, Supabase Auth & Supabase Storage integration
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: settings.supabaseConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: settings.supabaseConnected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {settings.supabaseConnected ? (
                <>
                  <Check size={18} style={{ color: '#34d399' }} />
                  <span style={{ fontWeight: 600, color: '#34d399', fontSize: '0.88rem' }}>
                    Active Supabase Connection Configured
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={18} style={{ color: '#fbbf24' }} />
                  <span style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.88rem' }}>
                    Persistent Local Database Active (Supabase Optional)
                  </span>
                </>
              )}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', lineHeight: 1.5 }}>
              The application is currently utilizing the zero-configuration atomic persistent storage engine in{' '}
              <code>data/content.json</code> and <code>public/uploads/</code>. To seamlessly connect Supabase, provide{' '}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in your environment variables.
              A pre-configured schema with full Row-Level Security (RLS) is provided in <code>supabase/schema.sql</code>.
            </p>
          </div>
        </div>

        {/* PWA Settings */}
        <div className="admin-card-container" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Smartphone size={20} style={{ color: 'var(--admin-gold)' }} />
            <div>
              <h2 className="admin-card-title">Installable Progressive Web App (PWA)</h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                Offline app shell, mobile camera uploads, and standalone display mode
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>PWA Manifest</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>Registered at <code>/manifest.json</code></div>
              </div>
              <span className="badge-status badge-published">Active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Service Worker</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                  Cached brand assets with administrative endpoint security exclusion
                </div>
              </div>
              <span className="badge-status badge-published">Active</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="btn-admin-primary"
            style={{ padding: '12px 24px', fontSize: '0.88rem' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
