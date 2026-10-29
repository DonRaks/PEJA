import Image from 'next/image';
import Link from 'next/link';
import { getContentItems } from '@/lib/db';
import { PublicNav } from '@/components/PublicNav';
import { Shirt, CheckCircle2 } from 'lucide-react';

export const revalidate = 60;

export default async function PejaClothingPage() {
  const publishedLookbooks = await getContentItems({
    division: 'clothing',
    status: 'published',
  });

  return (
    <>
      <PublicNav activeDivision="clothing" />
      <main style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
        {/* Division Hero */}
        <section className="division-hero">
          <div className="container">
            <div className="division-hero__tag" style={{ color: '#f472b6' }}>
              <Shirt size={16} />
              <span>PEJA Clothing • Haute Craftsmanship & Contemporary Ready-to-Wear</span>
            </div>
            <h1 className="division-hero__headline font-serif">
              Sovereign silhouettes,<br />
              <em>modern Nigerian tailoring.</em>
            </h1>
            <p className="division-hero__desc">
              Bridging venerable West African textile traditions with relaxed cosmopolitan drape. We produce seasonal ready-to-wear lookbooks, limited-run couture capsules, and luxury corporate uniform programs.
            </p>

            <div style={{ display: 'flex', gap: '14px', marginTop: '32px', flexWrap: 'wrap' }}>
              <a href="#lookbook" className="btn-primary">
                View Lookbooks & Collections ({publishedLookbooks.length})
              </a>
              <Link href="/#contact" className="btn-secondary">
                Atelier Appointment Inquiry
              </Link>
            </div>
          </div>
        </section>

        {/* Tailoring Pillars */}
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
                { label: 'Artisanal Textile Heritage', desc: 'Hand-loomed organic cotton, native dye baths, and silk blends' },
                { label: 'Bespoke Sartorial Precision', desc: 'Master cutter measurements calibrated for modern comfort' },
                { label: 'Limited Capsule Editions', desc: 'Numbered seasonal drops celebrating African contemporary style' },
                { label: 'Corporate Sartorial Programs', desc: 'Elevated executive uniforms for banking and hospitality brands' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={20} style={{ color: '#db2777', flexShrink: 0, marginTop: '2px' }} />
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

        {/* Dynamic Published Lookbooks */}
        <section id="lookbook" style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ marginBottom: '40px' }}>
              <div className="section-label">
                <div className="section-label__line" aria-hidden="true" />
                <span className="section-label__text">Curated Lookbooks</span>
              </div>
              <h2 className="section-headline">
                Seasonal Capsules &<br />
                <em>Sartorial Drops.</em>
              </h2>
              <p style={{ color: 'var(--text-light)', maxWidth: '600px', fontSize: '0.95rem', marginTop: '10px' }}>
                Editorial lookbooks, fabric compositions, and release collections. Managed dynamically through PEJA Studio.
              </p>
            </div>

            {publishedLookbooks.length === 0 ? (
              <div style={{ padding: '40px', background: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
                No lookbooks currently published for PEJA Clothing.
              </div>
            ) : (
              <div className="division-grid">
                {publishedLookbooks.map((item) => {
                  const cover = item.media?.find((m) => m.isCover)?.url || item.media?.[0]?.url || '/peja-clothing.jpg';

                  return (
                    <article key={item.id} className="division-card">
                      <div className="division-card__img">
                        <Image
                          src={cover}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>

                      <div className="division-card__body">
                        <span className="division-card__category" style={{ color: '#db2777' }}>
                          {item.category}
                        </span>
                        <h3 className="division-card__title font-serif">{item.title}</h3>
                        <p className="division-card__desc">{item.description}</p>

                        <div className="division-card__meta-row">
                          {item.metadata?.collectionSeason && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Season: </strong>
                              {item.metadata.collectionSeason}
                            </div>
                          )}
                          {item.metadata?.fabric && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Fabric: </strong>
                              {item.metadata.fabric}
                            </div>
                          )}
                          {item.metadata?.fit && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Cut & Fit: </strong>
                              {item.metadata.fit}
                            </div>
                          )}
                          {item.metadata?.releaseYear && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Release: </strong>
                              {item.metadata.releaseYear}
                            </div>
                          )}
                        </div>

                        {item.media && item.media.length > 1 && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                            {item.media.slice(0, 3).map((m, idx) => (
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
                                  alt={m.alt || 'Lookbook angle'}
                                  fill
                                  sizes="50px"
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>
                            ))}
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

        {/* CTA */}
        <section style={{ background: 'var(--green-dark)', color: '#ffffff', padding: '80px 0', textAlign: 'center' }}>
          <div className="container">
            <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, marginBottom: '16px' }}>
              Experience PEJA tailoring firsthand.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 32px' }}>
              Schedule a bespoke fitting at our Lagos atelier or discuss customized corporate attire collections.
            </p>
            <Link href="/#contact" className="btn-primary" style={{ display: 'inline-block' }}>
              Book an Atelier Consultation →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
