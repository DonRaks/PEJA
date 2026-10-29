import Image from 'next/image';
import Link from 'next/link';
import { getContentItems } from '@/lib/db';
import { PublicNav } from '@/components/PublicNav';
import { Sprout, CheckCircle2 } from 'lucide-react';

export const revalidate = 60;

export default async function PejaAgriculturePage() {
  const publishedProduce = await getContentItems({
    division: 'agriculture',
    status: 'published',
  });

  return (
    <>
      <PublicNav activeDivision="agriculture" />
      <main style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
        {/* Division Hero */}
        <section className="division-hero">
          <div className="container">
            <div className="division-hero__tag" style={{ color: '#4ade80' }}>
              <Sprout size={16} />
              <span>PEJA Agriculture • Food Security & Industrial Cultivation</span>
            </div>
            <h1 className="division-hero__headline font-serif">
              Cultivating abundance,<br />
              <em>sustaining Nigerian industry.</em>
            </h1>
            <p className="division-hero__desc">
              Harnessing mechanized precision farming, non-GMO seed selection, and direct contract farming across fertile Nigerian agricultural basins. Supplying leading industrial food processors, breweries, and wholesale grain reserves.
            </p>

            <div style={{ display: 'flex', gap: '14px', marginTop: '32px', flexWrap: 'wrap' }}>
              <a href="#produce" className="btn-primary">
                Explore Produce Listings ({publishedProduce.length})
              </a>
              <Link href="/#contact" className="btn-secondary">
                Wholesale Procurement Inquiry
              </Link>
            </div>
          </div>
        </section>

        {/* Agricultural Pillars */}
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
                { label: 'Mechanized Precision Farming', desc: 'GPS-monitored soil nutrient and moisture mapping' },
                { label: 'Direct Contract Agriculture', desc: 'Guaranteed off-take agreements with local farmer cooperatives' },
                { label: 'Export Quality Certification', desc: 'Compliant with phytosanitary and aflatoxin threshold limits' },
                { label: 'Continuous Food Supply Chain', desc: 'Nationwide buffer silos and climate-managed storage' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
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

        {/* Dynamic Published Produce & Cultivations */}
        <section id="produce" style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ marginBottom: '40px' }}>
              <div className="section-label">
                <div className="section-label__line" aria-hidden="true" />
                <span className="section-label__text">Harvest & Cultivations</span>
              </div>
              <h2 className="section-headline">
                Active Produce Listings &<br />
                <em>Industrial Sourcing.</em>
              </h2>
              <p style={{ color: 'var(--text-light)', maxWidth: '600px', fontSize: '0.95rem', marginTop: '10px' }}>
                Directly harvested from PEJA farm clusters. All availability, harvest cycles, and packaging metrics are updated via PEJA Studio.
              </p>
            </div>

            {publishedProduce.length === 0 ? (
              <div style={{ padding: '40px', background: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
                No active produce listings currently published.
              </div>
            ) : (
              <div className="division-grid">
                {publishedProduce.map((item) => {
                  const cover = item.media?.find((m) => m.isCover)?.url || item.media?.[0]?.url || '/peja-agriculture.jpg';

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
                        <span className="division-card__category" style={{ color: '#16a34a' }}>
                          {item.category}
                        </span>
                        <h3 className="division-card__title font-serif">{item.title}</h3>
                        <p className="division-card__desc">{item.description}</p>

                        <div className="division-card__meta-row">
                          {item.metadata?.produceName && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Produce: </strong>
                              {item.metadata.produceName}
                            </div>
                          )}
                          {item.metadata?.harvestSeason && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Cycle: </strong>
                              {item.metadata.harvestSeason}
                            </div>
                          )}
                          {item.metadata?.originFarm && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Origin: </strong>
                              {item.metadata.originFarm}
                            </div>
                          )}
                          {item.metadata?.packaging && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>Packaging: </strong>
                              {item.metadata.packaging}
                            </div>
                          )}
                          {item.metadata?.minimumOrder && (
                            <div>
                              <strong style={{ color: 'var(--green-dark)' }}>MOQ: </strong>
                              {item.metadata.minimumOrder}
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
                                  alt={m.alt || 'Crop angle'}
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
              Partner with PEJA for reliable, large-scale agro supply.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 32px' }}>
              Secure direct-farm off-take contracts, bulk cereal procurement, and certified industrial agro supplies.
            </p>
            <Link href="/#contact" className="btn-primary" style={{ display: 'inline-block' }}>
              Inquire for Agro Off-Take Contracts →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
