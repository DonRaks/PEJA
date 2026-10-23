'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// ===== LOGO SVG COMPONENT =====
function PejaLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="4" fill="#1a3a2a" />
      {/* Arrow/chart upward */}
      <polyline points="8,34 18,20 26,26 36,12" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="30,12 36,12 36,18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Green accent line */}
      <line x1="8" y1="38" x2="36" y2="38" stroke="#3a7d52" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ===== NAVBAR =====
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '#group', label: 'The Group' },
    { href: '#businesses', label: 'Businesses' },
    { href: '#approach', label: 'Our Approach' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="container navbar__inner">
          <a href="#" className="navbar__logo" aria-label="PEJA Ventures - Home">
            <div className="navbar__logo-icon">
              <PejaLogo size={44} />
            </div>
            <div className="navbar__logo-text">
              <span className="brand-name">PEJA VENTURES</span>
              <span className="brand-sub">NIG.</span>
            </div>
          </a>

          <ul className="navbar__nav" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={link.href === '#group' ? 'active' : ''}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a href="#contact" className="btn-talk" id="nav-cta-btn">
            LET&apos;S TALK
          </a>

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

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu ${mobileOpen ? 'open' : ''}`} role="dialog" aria-label="Mobile navigation">
        <ul className="mobile-nav-list" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setMobileOpen(false)}>{link.label}</a>
            </li>
          ))}
          <li>
            <a href="#contact" onClick={() => setMobileOpen(false)} style={{ color: 'var(--gold)', fontWeight: 700 }}>
              LET&apos;S TALK
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}

// ===== HERO SLIDESHOW =====
const HERO_SLIDES = [
  {
    src: '/hero/hero1.png',
    alt: 'PEJA Ventures NIG — modern headquarters at sunset',
    label: 'The Group',
  },
  {
    src: '/hero/hero2.jpeg',
    alt: 'PEJA Cleaning — professional facility services',
    label: 'Peja Cleaning',
  },
  {
    src: '/hero/hero3.jpeg',
    alt: 'PEJA Agriculture — fresh produce and farming',
    label: 'Peja Agriculture',
  },
  {
    src: '/hero/hero4.jpeg',
    alt: 'PEJA Logistics — supply chain and transport',
    label: 'Peja Logistics',
  },
  {
    src: '/hero/hero5.jpeg',
    alt: 'PEJA Clothing — modern retail collections',
    label: 'Peja Clothing',
  },
];

const SLIDE_DURATION = 6000; // ms per slide

function Hero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = HERO_SLIDES.length;

  const goTo = (idx: number) => {
    setPrev(current);
    setCurrent(idx);
    setProgress(0);
  };

  const next = () => goTo((current + 1) % total);
  const goBack = () => goTo((current - 1 + total) % total);

  // Auto-advance
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Progress bar
  useEffect(() => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    const step = 100 / (SLIDE_DURATION / 50);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + step, 100));
    }, 50);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [current]);

  return (
    <section className="hero" id="group" aria-label="Hero slideshow">
      {/* Slide layers */}
      <div className="hero__bg" aria-hidden="true">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={`hero__slide ${i === current ? 'hero__slide--active' : ''} ${i === prev ? 'hero__slide--exit' : ''}`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              quality={85}
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
        ))}
      </div>

      <div className="hero__overlay" aria-hidden="true" />

      {/* Slide progress bar */}
      <div className="hero__progress-track" aria-hidden="true">
        <div className="hero__progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Main content */}
      <div className="hero__content container">
        <div className="hero__tag">
          <div className="hero__tag-line" aria-hidden="true" />
          <span className="hero__tag-text">A Nigerian Conglomerate</span>
        </div>

        <h1 className="hero__headline font-serif">
          Excellence,<br />
          <em>in every detail.</em>
        </h1>

        <p className="hero__sub">
          A diversified Nigerian group building cleaner spaces,
          stronger supply chains and everyday essentials.
        </p>

        <div className="hero__ctas">
          <a href="#businesses" className="btn-primary" id="hero-explore-btn">
            Explore Our Businesses
          </a>
          <a href="#contact" className="btn-secondary" id="hero-contact-btn">
            Talk to Our Team
          </a>
        </div>
      </div>

      {/* Slide controls */}
      <div className="hero__controls" aria-label="Slideshow controls">
        {/* Dot indicators + labels */}
        <div className="hero__dots" role="tablist" aria-label="Slide navigation">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide: ${slide.label}`}
              className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
              onClick={() => goTo(i)}
            >
              <span className="hero__dot-label">{slide.label}</span>
            </button>
          ))}
        </div>

        {/* Prev / Next arrows */}
        <div className="hero__arrows">
          <button
            className="hero__arrow"
            onClick={goBack}
            aria-label="Previous slide"
            id="hero-prev-btn"
          >
            ←
          </button>
          <span className="hero__counter">
            {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button
            className="hero__arrow"
            onClick={next}
            aria-label="Next slide"
            id="hero-next-btn"
          >
            →
          </button>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <div className="hero__scroll-line" />
        <span className="hero__scroll-text">Scroll to discover</span>
      </div>
    </section>
  );
}

// ===== BUSINESS CARD =====
interface BusinessCardProps {
  num: string;
  name: string;
  desc: string;
  img: string;
  alt: string;
  delay: number;
}

function BusinessCard({ num, name, desc, img, alt, delay }: BusinessCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="business-card reveal"
      style={{ transitionDelay: `${delay}ms` }}
      role="article"
      aria-label={name}
    >
      <div className="business-card__img">
        <Image
          src={img}
          alt={alt}
          width={600}
          height={800}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
        <div className="business-card__img-overlay" aria-hidden="true" />
      </div>
      <div className="business-card__body">
        <span className="business-card__num">{num}</span>
        <h3 className="business-card__name">{name}</h3>
        <p className="business-card__desc">{desc}</p>
        <a href="#contact" className="business-card__link" aria-label={`Learn more about ${name}`}>
          Learn More <span className="arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}

// ===== BUSINESSES SECTION =====
function Businesses() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll('.reveal').forEach((node) => node.classList.add('in-view'));
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const businesses = [
    {
      num: '01',
      name: 'PEJA CLEANING',
      desc: 'Professional cleaning services for homes, offices and commercial spaces.',
      img: '/peja-cleaning.jpg',
      alt: 'PEJA Cleaning professional service',
    },
    {
      num: '02',
      name: 'PEJA AGRICULTURE',
      desc: 'Quality agricultural produce and supply for a healthier tomorrow.',
      img: '/peja-agriculture.jpg',
      alt: 'PEJA Agriculture fresh produce',
    },
    {
      num: '03',
      name: 'PEJA LOGISTICS',
      desc: 'Reliable movement of goods, across Nigeria and beyond.',
      img: '/peja-logistics.jpg',
      alt: 'PEJA Logistics transport and delivery',
    },
    {
      num: '04',
      name: 'PEJA CLOTHING',
      desc: 'Modern collections for a confident and expressive you.',
      img: '/peja-clothing.jpg',
      alt: 'PEJA Clothing modern Nigerian fashion',
    },
  ];

  return (
    <section className="businesses" id="businesses" aria-label="Our businesses">
      <div className="container">
        <div className="businesses__header" ref={headerRef}>
          <div className="businesses__header-left">
            <div className="section-label reveal">
              <div className="section-label__line" aria-hidden="true" />
              <span className="section-label__text">Our Businesses</span>
            </div>
            <h2 className="section-headline reveal reveal-delay-1">
              Four businesses.<br />One shared ambition.
            </h2>
          </div>
          <p className="businesses__header-desc reveal reveal-delay-2">
            From cleaner environments to better food, smarter movement
            and style for everyday life — we build businesses that create
            real value for Nigeria.
          </p>
        </div>

        <div className="businesses__grid">
          {businesses.map((b, i) => (
            <BusinessCard
              key={b.num}
              num={b.num}
              name={b.name}
              desc={b.desc}
              img={b.img}
              alt={b.alt}
              delay={i * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== APPROACH SECTION =====
function Approach() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el) => el.classList.add('in-view'));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (leftRef.current) observer.observe(leftRef.current);
    if (rightRef.current) observer.observe(rightRef.current);
    return () => observer.disconnect();
  }, []);

  const pillars = [
    { icon: '🌿', title: 'Sustainability', desc: 'Building with the environment in mind across all our operations.' },
    { icon: '🤝', title: 'Community Impact', desc: 'Creating jobs and empowering Nigerians at every level.' },
    { icon: '⭐', title: 'Uncompromising Quality', desc: 'Setting the standard in every sector we enter.' },
  ];

  const stats = [
    { num: '4', label: 'Business Units' },
    { num: '10+', label: 'Years of Growth' },
    { num: '500+', label: 'Team Members' },
    { num: 'NG', label: 'Nationwide Reach' },
  ];

  return (
    <section className="approach" id="approach" aria-label="Our approach">
      <div className="container">
        <div className="approach__inner">
          <div className="approach__left" ref={leftRef}>
            <div className="section-label reveal">
              <div className="section-label__line" aria-hidden="true" />
              <span className="section-label__text">Our Approach</span>
            </div>
            <h2 className="approach__headline reveal reveal-delay-1">
              Built on purpose,<br />
              driven by <em>ambition.</em>
            </h2>
            <p className="approach__text reveal reveal-delay-2">
              At PEJA Ventures, we believe that business is most powerful when it serves people.
              Every venture we launch is guided by a commitment to quality, community and long-term value creation.
            </p>
            <div className="approach__pillars">
              {pillars.map((p, i) => (
                <div className="pillar reveal" key={p.title} style={{ transitionDelay: `${(i + 3) * 100}ms` }}>
                  <div className="pillar__icon" aria-hidden="true">{p.icon}</div>
                  <div>
                    <div className="pillar__title">{p.title}</div>
                    <div className="pillar__desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={rightRef}>
            <div className="approach__stats">
              {stats.map((s, i) => (
                <div className="stat-card reveal" key={s.label} style={{ transitionDelay: `${i * 120}ms` }}>
                  <div className="stat-card__num font-serif">{s.num}</div>
                  <div className="stat-card__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== CONTACT SECTION =====
function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', company: '', interest: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="contact" id="contact" aria-label="Contact us">
      <div className="container">
        <div className="contact__inner">
          <div className="contact__left">
            <div className="section-label">
              <div className="section-label__line" aria-hidden="true" />
              <span className="section-label__text">Get In Touch</span>
            </div>
            <h2 className="section-headline">
              Let&apos;s build<br />
              <em>something great</em><br />
              together.
            </h2>
            <p className="contact__desc">
              Whether you&apos;re a potential partner, client or investor — we&apos;d love to hear from you.
              Reach out and our team will get back to you within 24 hours.
            </p>

            <div className="contact__details">
              {[
                { icon: '📍', label: 'Headquarters', value: 'Lagos, Nigeria' },
                { icon: '📧', label: 'Email Address', value: 'hello@pejaventures.ng' },
                { icon: '📞', label: 'Phone Number', value: '+234 800 PEJA VTR' },
              ].map((d) => (
                <div className="contact__detail" key={d.label}>
                  <div className="contact__detail-icon" aria-hidden="true">{d.icon}</div>
                  <div>
                    <div className="contact__detail-label">{d.label}</div>
                    <div className="contact__detail-value">{d.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact__form">
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: 'var(--green-dark)', marginBottom: '12px' }}>
                  Message Sent!
                </h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  style={{ marginTop: '24px', padding: '12px 28px', background: 'var(--green-dark)', color: 'white', border: 'none', borderRadius: '2px', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
                  onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', company: '', interest: '', message: '' }); }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
                <div className="form__row">
                  <div className="form__group">
                    <label htmlFor="contact-name" className="form__label">Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      className="form__input"
                      placeholder="Your full name"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>
                  <div className="form__group">
                    <label htmlFor="contact-email" className="form__label">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      className="form__input"
                      placeholder="your@email.com"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form__group">
                  <label htmlFor="contact-company" className="form__label">Company / Organization</label>
                  <input
                    id="contact-company"
                    type="text"
                    className="form__input"
                    placeholder="Your company name"
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                  />
                </div>
                <div className="form__group">
                  <label htmlFor="contact-interest" className="form__label">Area of Interest *</label>
                  <select
                    id="contact-interest"
                    className="form__select"
                    required
                    value={formState.interest}
                    onChange={(e) => setFormState({ ...formState, interest: e.target.value })}
                  >
                    <option value="" disabled>Select a business unit</option>
                    <option value="cleaning">PEJA Cleaning</option>
                    <option value="agriculture">PEJA Agriculture</option>
                    <option value="logistics">PEJA Logistics</option>
                    <option value="clothing">PEJA Clothing</option>
                    <option value="partnership">General Partnership</option>
                    <option value="investment">Investment Inquiry</option>
                  </select>
                </div>
                <div className="form__group">
                  <label htmlFor="contact-message" className="form__label">Message *</label>
                  <textarea
                    id="contact-message"
                    className="form__textarea"
                    placeholder="Tell us how we can help you..."
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-submit" id="contact-submit-btn">
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== FOOTER =====
function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__top">
          <div>
            <a href="#" className="navbar__logo" style={{ gap: '10px', display: 'inline-flex', alignItems: 'center' }}>
              <PejaLogo size={40} />
              <div className="navbar__logo-text">
                <span className="brand-name">PEJA VENTURES</span>
                <span className="brand-sub">NIG.</span>
              </div>
            </a>
            <p className="footer__brand-tagline">
              Building cleaner spaces, stronger supply chains and everyday essentials — for Nigeria and beyond.
            </p>
          </div>

          <div>
            <h4 className="footer__col-title">Businesses</h4>
            <ul className="footer__links" role="list">
              {['PEJA Cleaning', 'PEJA Agriculture', 'PEJA Logistics', 'PEJA Clothing'].map((b) => (
                <li key={b}><a href="#businesses">{b}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer__col-title">Company</h4>
            <ul className="footer__links" role="list">
              {['The Group', 'Our Approach', 'Careers', 'Contact'].map((l) => (
                <li key={l}><a href={`#${l.toLowerCase().replace(' ', '')}`}>{l}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer__newsletter">
            <h4 className="footer__col-title">Stay Updated</h4>
            <p className="footer__newsletter-desc">
              Get news about PEJA Ventures, business updates and opportunities directly to your inbox.
            </p>
            <form
              className="footer__input-row"
              onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
              aria-label="Newsletter signup"
            >
              <input
                type="email"
                className="footer__email-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address for newsletter"
                required
              />
              <button type="submit" className="footer__subscribe-btn">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} PEJA Ventures NIG. All rights reserved.
          </p>
          <div className="footer__socials" aria-label="Social media links">
            {[
              { label: 'LinkedIn', icon: 'in' },
              { label: 'Instagram', icon: '📷' },
              { label: 'Twitter / X', icon: '✕' },
              { label: 'Facebook', icon: 'f' },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                className="social-link"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ===== MAIN PAGE =====
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Businesses />
        <Approach />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
