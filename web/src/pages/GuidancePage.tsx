import { useEffect } from 'react'
import { ContactBlock } from '../components/sections/ContactBlock'
import { Reveal } from '../components/motion/Reveal'
import { AppIcon, appIcons } from '../components/ui/AppIcon'
import { Card } from '../components/ui/Card'
import { Container } from '../components/ui/Container'
import { InlineLink } from '../components/ui/InlineLink'
import { SectionHeading } from '../components/ui/SectionHeading'
import { guidanceArticles } from '../data/site'

export function GuidancePage() {
  useEffect(() => {
    document.title = 'Guidance Articles | Umrah and Hajj in Uganda and East Africa'
  }, [])

  return (
    <>
      <section className="section page-hero">
        <Container>
          <Reveal>
            <p className="eyebrow">Guidance</p>
            <h1 className="page-hero__title">
              Umrah and Hajj guidance articles for Uganda and East Africa.
            </h1>
            <p className="page-hero__description">
              Long-form editorial articles for first-timers, families,
              sponsors, and community groups preparing for sacred travel.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Start here"
              title="Read the article that matches the question already on your mind."
              description="Start with your biggest question, then move into clearer planning with practical next steps."
            />
          </Reveal>

          <div className="projects-grid">
            {guidanceArticles.map((guide) => (
              <Reveal key={guide.slug}>
                <Card as="article" className="project-card">
                  <div className="project-card__media">
                    <img alt={guide.title} decoding="async" loading="lazy" src={guide.image} />
                  </div>
                  <div className="project-card__body">
                    <div className="journey-card__meta">
                      <span className="journey-card__meta-item">
                        <AppIcon icon={appIcons.badgeCheck} size="xs" />
                        <span>{guide.category}</span>
                      </span>
                      <span className="journey-card__meta-item">
                        <AppIcon icon={appIcons.clock} size="xs" />
                        <span>{guide.readTime}</span>
                      </span>
                      <span className="journey-card__meta-item">
                        <AppIcon icon={appIcons.users} size="xs" />
                        <span>{guide.author}</span>
                      </span>
                    </div>
                    <h3 className="project-card__title">{guide.title}</h3>
                    <p className="project-card__description">{guide.description}</p>
                    <InlineLink
                      data-cta-label="guidance_card_click"
                      data-context-label={guide.slug}
                      data-track-cta="true"
                      to={`/guidance/${guide.slug}`}
                    >
                      Read article
                    </InlineLink>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ContactBlock
        compact
        contextLabel="guidance_consultation"
        ctaLabel="consultation_form_submit"
        description="Start with the question already on your mind, and the team can help you move into the right journey or booking path."
        eyebrow="Helpful next step"
        shellId="consultation-form"
        source="guidance"
        title="Talk to Al Hilal if you want help after reading."
      />
    </>
  )
}
