'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('admin@pejaventures.ng');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to authenticate';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top center, #193627 0%, #09150e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#f5f0e8',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#142a1e',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Top Gold Bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #c9a84c, #faf7f2, #c9a84c)' }} />

        <div style={{ padding: '36px 32px' }}>
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-block', marginBottom: '14px' }}>
              <Image
                src="/logo/logo-mark.png"
                alt="PEJA Ventures"
                width={56}
                height={56}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.9rem',
                color: '#c9a84c',
                fontWeight: 600,
                letterSpacing: '0.02em',
                marginBottom: '6px',
              }}
            >
              PEJA STUDIO
            </h1>
            <p style={{ color: '#9eb5a7', fontSize: '0.85rem' }}>
              Content Management & Administrative Portal
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '12px 14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#fca5a5',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  color: '#9eb5a7',
                  marginBottom: '8px',
                }}
              >
                Administrator Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9eb5a7',
                  }}
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pejaventures.ng"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    background: '#09150e',
                    border: '1px solid rgba(201, 168, 76, 0.25)',
                    borderRadius: '6px',
                    color: '#f5f0e8',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '26px' }}>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  color: '#9eb5a7',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9eb5a7',
                  }}
                />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    background: '#09150e',
                    border: '1px solid rgba(201, 168, 76, 0.25)',
                    borderRadius: '6px',
                    color: '#f5f0e8',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#9eb5a7' }}>
                Default system passkey: <code style={{ color: '#c9a84c' }}>Peja2026!Studio</code>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#c9a84c',
                color: '#09150e',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.88rem',
                letterSpacing: '0.06em',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s ease',
              }}
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  Authenticate into PEJA Studio <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#9eb5a7',
              fontSize: '0.75rem',
            }}
          >
            <ShieldCheck size={14} style={{ color: '#c9a84c' }} />
            <span>Encrypted Session & Role-Based Access Control</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#09150e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c9a84c',
          }}
        >
          Loading PEJA Studio...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

