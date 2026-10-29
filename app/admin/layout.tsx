'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FolderKanban,
  Image as ImageIcon,
  Layers,
  Settings,
  PlusCircle,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Download,
  Sparkles,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Fetch current user session
  useEffect(() => {
    if (isLoginPage) return;

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // middleware handles redirection
      });
  }, [isLoginPage]);

  // PWA Install prompt listener & Service Worker registration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration error:', err);
      });
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install PEJA Studio on iOS, tap the Share icon in Safari and select "Add to Home Screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // If on the login page, render cleanly without the admin dashboard shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/projects', label: 'Projects & Content', icon: FolderKanban },
    { href: '/admin/projects/new', label: 'Add New Project', icon: PlusCircle },
    { href: '/admin/media', label: 'Media Assets', icon: ImageIcon },
    { href: '/admin/divisions', label: 'Four Divisions', icon: Layers },
    { href: '/admin/settings', label: 'Studio Settings', icon: Settings },
  ];

  const divisionLinks = [
    { href: '/cleaning', label: 'Peja Cleaning' },
    { href: '/agriculture', label: 'Peja Agriculture' },
    { href: '/logistics', label: 'Peja Logistics' },
    { href: '/clothing', label: 'Peja Clothing' },
  ];

  return (
    <div className="admin-shell">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 45,
          }}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Image
            src="/logo/logo-mark.png"
            alt="PEJA"
            width={34}
            height={34}
            style={{ objectFit: 'contain' }}
          />
          <div>
            <div className="admin-sidebar__logo-title">PEJA STUDIO</div>
            <span className="admin-sidebar__logo-badge">ADMIN PWA</span>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <div className="admin-nav-section-title">Content Management</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="admin-nav-section-title" style={{ marginTop: '12px' }}>
            Live Divisions
          </div>
          {divisionLinks.map((div) => (
            <Link
              key={div.href}
              href={div.href}
              target="_blank"
              className="admin-nav-item"
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            >
              <ExternalLink size={14} style={{ color: 'var(--admin-gold)' }} />
              <span>{div.label}</span>
            </Link>
          ))}
        </nav>

        {/* PWA Install Promotion Box */}
        {!isInstalled && (
          <div style={{ padding: '0 12px 12px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.15) 0%, rgba(26, 58, 42, 0.3) 100%)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--admin-gold)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-gold)' }}>
                  Install PEJA Studio
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', lineHeight: 1.4 }}>
                Install on your phone or tablet for instant camera photo uploads and field publishing.
              </p>
              <button
                onClick={handleInstallClick}
                className="btn-admin-primary"
                style={{ width: '100%', padding: '6px 10px', fontSize: '0.75rem' }}
              >
                <Download size={13} />
                Install App
              </button>
            </div>
          </div>
        )}

        <div className="admin-sidebar__footer">
          <div className="admin-user-pill">
            <div className="admin-user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--admin-text-main)',
                }}
              >
                {user?.name || 'PEJA Administrator'}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--admin-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.email || 'admin@pejaventures.ng'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/"
              target="_blank"
              className="btn-admin-secondary"
              style={{ flex: 1, padding: '7px 10px', fontSize: '0.76rem' }}
            >
              <ExternalLink size={13} />
              Website
            </Link>
            <button
              onClick={handleLogout}
              className="btn-admin-danger"
              style={{ padding: '7px 10px', fontSize: '0.76rem' }}
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Admin Main Body */}
      <div className="admin-main">
        {/* Top Sticky Bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                color: 'var(--admin-gold)',
                display: 'none',
              }}
              className="admin-mobile-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="admin-topbar__title">
              <span>PEJA Studio</span>
              <span style={{ color: 'var(--admin-border)', margin: '0 4px' }}>/</span>
              <span style={{ color: 'var(--admin-gold)', fontSize: '0.95rem' }}>
                {navItems.find((n) => n.href === pathname)?.label || 'Administration'}
              </span>
            </div>
          </div>

          <div className="admin-topbar__actions">
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="btn-admin-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
              >
                <Download size={14} style={{ color: 'var(--admin-gold)' }} />
                <span>Install PWA</span>
              </button>
            )}

            <Link href="/admin/projects/new" className="btn-admin-primary">
              <PlusCircle size={15} />
              <span>New Project</span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">{children}</main>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .admin-mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
