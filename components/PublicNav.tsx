'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function PublicNav({ activeDivision }: { activeDivision?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '/', label: 'The Group' },
    { href: '/cleaning', label: 'Cleaning', key: 'cleaning' },
    { href: '/agriculture', label: 'Agriculture', key: 'agriculture' },
    { href: '/logistics', label: 'Logistics', key: 'logistics' },
    { href: '/clothing', label: 'Clothing', key: 'clothing' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="container navbar__inner">
          <Link href="/" className="navbar__logo" aria-label="PEJA Ventures - Home">
            <div className="navbar__logo-icon">
              <Image
                src="/logo/logo-mark.png"
                alt="PEJA Ventures Logo"
                width={42}
                height={42}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="navbar__logo-text">
              <span className="brand-name">PEJA VENTURES</span>
              <span className="brand-sub">NIG.</span>
            </div>
          </Link>

          <ul className="navbar__nav" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={activeDivision === link.key ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/admin" className="btn-admin-secondary" style={{ padding: '6px 12px', fontSize: '0.74rem' }}>
              Studio Portal
            </Link>
            <Link href="/#contact" className="btn-talk" id="nav-cta-btn">
              LET&apos;S TALK
            </Link>
          </div>

          <button
            className="navbar__mobile-toggle"
            id="mobile-menu-toggle"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`navbar__mobile-menu ${mobileOpen ? 'open' : ''}`} role="dialog" aria-label="Mobile navigation">
        <ul className="mobile-nav-list" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/admin" onClick={() => setMobileOpen(false)} style={{ color: 'var(--gold)', fontWeight: 600 }}>
              PEJA Studio (Admin)
            </Link>
          </li>
          <li>
            <Link href="/#contact" onClick={() => setMobileOpen(false)} style={{ color: 'var(--gold)', fontWeight: 700 }}>
              LET&apos;S TALK
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
