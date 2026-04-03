import { partnerLogos } from '../../data/site'

export function TrustStrip() {
  return (
    <section aria-label="Partner organisations" className="trust-strip">
      <div className="trust-strip__inner">
        <div className="trust-strip__logos">
          {partnerLogos.map((logo) => (
            <div className="trust-strip__logo-item" key={logo.name}>
              <img
                alt={logo.name}
                className={['trust-strip__logo', logo.className].filter(Boolean).join(' ')}
                decoding="async"
                loading="lazy"
                src={logo.src}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
