import Image from 'next/image';
import Link from 'next/link';
import { getContentItems } from '@/lib/db';
import { PublicNav } from '@/components/PublicNav';
import { Truck, CheckCircle2 } from 'lucide-react';

export const revalidate = 60;

export default async function PejaLogisticsPage() {
  const publishedCaseStudies = await getContentItems({
    division: 'logistics',
    status: 'published',
  });

  return (
    <>
      <PublicNav activeDivision="logistics" />
      <main style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
        {/* Division Hero */}
        <section className="division-hero">
          <div className="container">
            <div className="division-hero__tag" style={{ color: '#fbbf24' }}>
              <Truck size={16} />
              <span>PEJA Logistics • Inter-State Haulage & National Freight</span>
            </div>
            <h1 className="division-hero__headline font-serif">
              Connecting Nigeria&apos;s arteries,<br />
              <em>guaranteeing transit reliability.</em>
            </h1>
            <p className="division-hero__desc">
              Precision long-haul articulated freight, temperature-controlled cold chain distribution, and staging warehousing. From seaport offloading to northern commercial hubs, we move essential goods with live telematics tracking.
            </p>

            <div style={{ display: 'flex', gap: '14px', marginTop: '32px', flexWrap: 'wrap' }}>
              <a href="#corridors" className="btn-primary">
                Explore Freight Case Studies ({publishedCaseStudies.length})
              </a>
              <Link href="/#contact" className="btn-secondary">
                Request Fleet Charter
              </Link>
            </div>
          </div>
        </section>

        {/* Operational Metrics Bar */}
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
                { label: 'Real-Time Telematics Tracking', desc: 'Satellite GPS monitoring, route geo-fencing, and cargo seals' },
                { label: 'Multi-Zone Cold Chain', desc: 'Active refrigeration maintaining 2°C to 8°C for sensitive items' },
                { label: 'Major Commercial Corridors', desc: 'Daily departures between Lagos, Kano, Abuja, Port Harcourt, and Onitsha' },
                { label: 'Zero Cargo Loss Guarantee', desc: 'Comprehensive transit insurance covering all commercial freight' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
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

        {/* Dynamic Published Freight Case Studies */}
        <section id="corridors" style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ marginBottom: '40px' }}>
              <div className="section-label">
                <div className="section-label__line" aria-hidden="true" />
                <span className="section-label__text">Operational Case Studies</span>
              </div>
              <h2 className="section-headline">
                Active Freight Corridors &<br />
                <em>Heavy Haulage Case Studies.</em>
              </h2>
              <p style={{ color: 'var(--text-light)', maxWidth: '600px', fontSize: '0.95rem', marginTop: '10px' }}>
                Documented logistics operations, fleet specifications, and route turnaround times. Managed dynamically through PEJA Studio.
              </p>
            </div>

            {publishedCaseStudies.length === 0 ? (
              <div style={{ padding: '40px', background: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
                No active logistics case studies currently listed.
              </div>
            ) : (
              <div className="division-grid">
                {publishedCaseStudies.map((item) => {
                  const cover = item.media?.find((m) => m.isCover)?.url || item.media?.[0]?.url || '/peja-logistics.jpg';

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
                        <span className="division-card__category" style={{ color: '#d97706' }}>
                          {item.category}
                        </span>
                        <h3 className="division-card__title font-serif">{item.title}</h3>
                        <p className="division-card__desc">{item.description}</p>

                        <div className="division-card__meta-row">
                          {item.metadata?.origin && item.metadata?.destination && (
                            <div style={{ width: '100%', marginBottom: '4px' }}>
                              <strong style={{ color: 'var(--green-dark)' }}>Route: </strong>
                              {item.metadata.origin} → {item.metadata.destination}
                            </div>
                          )}
                          {item.metadata?.cargoType && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Cargo: </strong>
                              {item.metadata.cargoType}
                            </div>
                          )}
                          {item.metadata?.tonnage && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Tonnage: </strong>
                              {item.metadata.tonnage}
                            </div>
                          )}
                          {item.metadata?.transitTime && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Transit: </strong>
                              {item.metadata.transitTime}
                            </div>
                          )}
                          {item.metadata?.fleetType && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Fleet: </strong>
                              {item.metadata.fleetType}
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
                                  alt={m.alt || 'Fleet thumbnail'}
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
              Streamline your Nigerian freight operations.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 32px' }}>
              Book dedicated haulage trailers, continuous cold chain charters, or scheduled warehouse staging.
            </p>
            <Link href="/#contact" className="btn-primary" style={{ display: 'inline-block' }}>
              Request Freight & Haulage Rates →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
