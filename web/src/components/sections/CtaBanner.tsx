import { imagery } from '../../data/site'
import { Reveal } from '../motion/Reveal'
import { AppIcon, appIcons } from '../ui/AppIcon'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { SectionHeading } from '../ui/SectionHeading'
import { WhatsAppCTA } from '../ui/WhatsAppCTA'

type CtaBannerProps = {
  eyebrow: string
  title: string
  description: string
  image?: string
  secondaryLink?: string
  secondaryLabel?: string
}

export function CtaBanner({
  eyebrow,
  title,
  description,
  image = imagery.contact,
  secondaryLink,
  secondaryLabel,
}: CtaBannerProps) {
  return (
    <section className="cta-banner">
      <Container>
        <div className="cta-banner__panel">
          <div className="cta-banner__grid">
            <Reveal className="cta-banner__copy">
              <SectionHeading
                eyebrow={eyebrow}
                title={title}
                description={description}
              />
              <div className="hero__actions" style={{ marginTop: '1.5rem' }}>
                <WhatsAppCTA contextLabel="global_cta" ctaLabel="global_cta_whatsapp" variant="secondary" />
                {secondaryLink && secondaryLabel ? (
                  <Button
                    data-cta-label="global_cta_secondary"
                    data-context-label="global_cta"
                    data-track-cta="true"
                    icon={<AppIcon icon={appIcons.arrowUpRight} size="sm" />}
                    to={secondaryLink}
                    variant="ghost"
                  >
                    {secondaryLabel}
                  </Button>
                ) : null}
              </div>
            </Reveal>

            <div className="cta-banner__media">
              <img alt="Pilgrimage support visual" decoding="async" loading="lazy" src={image} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
