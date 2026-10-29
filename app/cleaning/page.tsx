import Image from 'next/image';
import Link from 'next/link';
import { getContentItems } from '@/lib/db';
import { PublicNav } from '@/components/PublicNav';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const revalidate = 60; // ISR revalidation

export default async function PejaCleaningPage() {
  const publishedProjects = await getContentItems({
    division: 'cleaning',
    status: 'published',
  });

  return (
    <>
      <PublicNav activeDivision="cleaning" />
      <main style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
        {/* Division Hero */}
        <section className="division-hero">
          <div className="container">
            <div className="division-hero__tag">
              <Sparkles size={16} />
              <span>PEJA Cleaning • Excellence in Space Sanitization</span>
            </div>
            <h1 className="division-hero__headline font-serif">
              Elevating standards in<br />
              <em>commercial & luxury hygiene.</em>
            </h1>
            <p className="division-hero__desc">
              From multinational corporate headquarters and post-construction sanitization to private luxury estates —
              we deploy hospital-grade antimicrobial solutions, specialized restorative machinery, and rigorously trained custodians.
            </p>

            <div style={{ display: 'flex', gap: '14px', marginTop: '32px', flexWrap: 'wrap' }}>
              <a href="#projects" className="btn-primary">
                View Completed Projects ({publishedProjects.length})
              </a>
              <Link href="/#contact" className="btn-secondary">
                Request Facility Audit
              </Link>
            </div>
          </div>
        </section>

        {/* Pillars Bar */}
        <section style={{ background: '#ffffff', borderBottom: '1px solid #ede7d9', padding: '28px 0' }}>
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
              }}
            >
              {[
                { label: 'Hospital-Grade Bio-Sanitization', desc: 'WHO-certified non-toxic disinfectants' },
                { label: 'Post-Construction Detailing', desc: 'Facade glass, marble, and heavy debris extraction' },
                { label: 'Corporate Headquarter Contracts', desc: 'Continuous 24/7 day & night custodian operations' },
                { label: 'Bespoke Private Estates', desc: 'Discreet, high-touch luxury residential care' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--green-mid)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--green-dark)', marginBottom: '2px' }}>
                      {item.label}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Published Projects Gallery */}
        <section id="projects" style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ marginBottom: '40px' }}>
              <div className="section-label">
                <div className="section-label__line" aria-hidden="true" />
                <span className="section-label__text">Executed Portfolios</span>
              </div>
              <h2 className="section-headline">
                Completed Sanitization &<br />
                <em>Restorative Projects.</em>
              </h2>
              <p style={{ color: 'var(--text-light)', maxWidth: '600px', fontSize: '0.95rem', marginTop: '10px' }}>
                Every project is verified by on-site hygiene inspections and client sign-off. Managed dynamically through PEJA Studio.
              </p>
            </div>

            {publishedProjects.length === 0 ? (
              <div style={{ padding: '40px', background: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
                No published projects currently listed for PEJA Cleaning.
              </div>
            ) : (
              <div className="division-grid">
                {publishedProjects.map((project) => {
                  const cover = project.media?.find((m) => m.isCover)?.url || project.media?.[0]?.url || '/peja-cleaning.jpg';

                  return (
                    <article key={project.id} className="division-card">
                      <div className="division-card__img">
                        <Image
                          src={cover}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>

                      <div className="division-card__body">
                        <span className="division-card__category">{project.category}</span>
                        <h3 className="division-card__title font-serif">{project.title}</h3>
                        <p className="division-card__desc">{project.description}</p>

                        <div className="division-card__meta-row">
                          {project.metadata?.clientName && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Client: </strong>
                              {project.metadata.clientName}
                            </div>
                          )}
                          {project.metadata?.location && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Location: </strong>
                              {project.metadata.location}
                            </div>
                          )}
                          {project.metadata?.squareMeters && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Area: </strong>
                              {project.metadata.squareMeters}
                            </div>
                          )}
                        </div>

                        {/* Additional project gallery thumbnails if present */}
                        {project.media && project.media.length > 1 && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                            {project.media.slice(0, 3).map((m, idx) => (
                              <div
                                key={m.id || idx}
                                style={{
                                  position: 'relative',
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '3px',
                                  overflow: 'hidden',
                                }}
                              >
                                <Image
                                  src={m.url}
                                  alt={m.alt || 'Detail thumbnail'}
                                  fill
                                  sizes="50px"
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>
                            ))}
                            {project.media.length > 3 && (
                              <div
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  background: '#0d1f15',
                                  color: 'var(--gold)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '3px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                }}
                              >
                                +{project.media.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ background: 'var(--green-dark)', color: '#ffffff', padding: '80px 0', textAlign: 'center' }}>
          <div className="container">
            <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, marginBottom: '16px' }}>
              Ensure immaculate hygiene for your corporate space.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 32px' }}>
              Contact PEJA Cleaning for bespoke facility service contracts, restorative sanitization, or urgent post-construction detailing.
            </p>
            <Link href="/#contact" className="btn-primary" style={{ display: 'inline-block' }}>
              Speak with a Facility Specialist →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
