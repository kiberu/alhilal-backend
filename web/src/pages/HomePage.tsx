import { useEffect, useMemo, useState } from 'react'
import { CtaBanner } from '../components/sections/CtaBanner'
import { FaqSection } from '../components/sections/FaqSection'
import { HeroSection } from '../components/sections/HeroSection'
import { ProjectGrid } from '../components/sections/ProjectGrid'
import { ServicesSection } from '../components/sections/ServicesSection'
import { TrustStrip } from '../components/sections/TrustStrip'
import { Reveal } from '../components/motion/Reveal'
import { AppIcon, appIcons } from '../components/ui/AppIcon'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Container } from '../components/ui/Container'
import { InlineLink } from '../components/ui/InlineLink'
import { SectionHeading } from '../components/ui/SectionHeading'
import { WhatsAppCTA } from '../components/ui/WhatsAppCTA'
import {
  brand,
  featuredDeparture,
  finalCtaCopy,
  guidanceArticles,
  homeFaqs,
  imagery,
  journeySupport,
  serviceStyleItems,
  whyAlHilalIntro,
  whyAlHilalStats,
} from '../data/site'
import { formatDateRange, formatMoney, formatNightsLabel } from '../lib/format'
import {
  featuredJourneySlug,
  getPublicJourneys,
  selectHomeFeaturedJourneys,
  type PublicJourneyListItem,
} from '../lib/trips'

export function HomePage() {
  const [journeys, setJourneys] = useState<PublicJourneyListItem[]>([])

  useEffect(() => {
    document.title = 'Al Hilal Travels Uganda | Guided Umrah and Hajj from Kampala'
  }, [])

  useEffect(() => {
    let isMounted = true
    getPublicJourneys()
      .then((items) => {
        if (isMounted) {
          setJourneys(items)
        }
      })
      .catch(() => {
        if (isMounted) {
          setJourneys([])
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const featuredJourney = journeys.find((item) => item.featured) || journeys[0]
  const guideFallbackSlug = featuredJourney?.slug || featuredJourneySlug

  const homeFeaturedJourneys = useMemo(
    () => selectHomeFeaturedJourneys(journeys),
    [journeys],
  )

  return (
    <>
      <HeroSection />
      <TrustStrip />

      <section className="section">
        <Container>
          <div className="split-callout__grid">
            <Reveal className="section-stack">
              <SectionHeading
                eyebrow={featuredDeparture.eyebrow}
                title={featuredJourney?.name || featuredDeparture.title}
                description={featuredJourney?.excerpt || featuredDeparture.description}
              />

              <ul className="trip-stats" aria-label="Trip summary">
                <li className="trip-stat">
                  <span className="trip-stat__icon" aria-hidden>
                    <AppIcon icon={appIcons.calendar} size="sm" />
                  </span>
                  <div className="trip-stat__body">
                    <span className="trip-stat__label">Departure</span>
                    <span className="trip-stat__value">
                      {featuredJourney
                        ? formatDateRange(featuredJourney.startDate, featuredJourney.endDate)
                        : featuredDeparture.departure}
                    </span>
                  </div>
                </li>
                <li className="trip-stat">
                  <span className="trip-stat__icon" aria-hidden>
                    <AppIcon icon={appIcons.clock} size="sm" />
                  </span>
                  <div className="trip-stat__body">
                    <span className="trip-stat__label">Duration</span>
                    <span className="trip-stat__value">
                      {featuredJourney ? formatNightsLabel(featuredJourney.defaultNights) : featuredDeparture.duration}
                    </span>
                  </div>
                </li>
                <li className="trip-stat">
                  <span className="trip-stat__icon" aria-hidden>
                    <AppIcon icon={appIcons.badgeCheck} size="sm" />
                  </span>
                  <div className="trip-stat__body">
                    <span className="trip-stat__label">Starting from</span>
                    <span className="trip-stat__value">
                      {featuredJourney
                        ? formatMoney(
                            featuredJourney.startingPriceMinorUnits,
                            featuredJourney.startingPriceCurrency || 'UGX',
                          ) || featuredDeparture.price
                        : featuredDeparture.price}
                    </span>
                  </div>
                </li>
              </ul>

              <div className="hero__actions">
                <Button
                  data-cta-label="homepage_featured_journey"
                  data-context-label={guideFallbackSlug}
                  data-track-cta="true"
                  icon={<AppIcon icon={appIcons.calendar} size="sm" />}
                  to={`/journeys/${guideFallbackSlug}`}
                >
                  {featuredDeparture.cta}
                </Button>
                <WhatsAppCTA contextLabel="homepage_featured_journey" variant="ghost" />
              </div>
            </Reveal>

            <div className="split-callout__media split-callout__media--tall">
              <img
                alt={featuredJourney?.name || featuredDeparture.title}
                decoding="async"
                height={606}
                loading="lazy"
                src={imagery.featured}
                width={1280}
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="section section--light">
        <Container>
          <div className="detail-body detail-body--why">
            <Reveal className="section-stack">
              <SectionHeading
                eyebrow={whyAlHilalIntro.eyebrow}
                title={whyAlHilalIntro.title}
                description={whyAlHilalIntro.description}
              />
              <p className="project-card__description">{whyAlHilalIntro.supporting}</p>
              <div>
                <InlineLink
                  data-cta-label="homepage_about"
                  data-context-label="homepage_why_al_hilal"
                  data-track-cta="true"
                  to="/about"
                >
                  Why pilgrims in Uganda trust Al Hilal
                </InlineLink>
              </div>
            </Reveal>

            <Reveal>
              <ul className="why-stats" aria-label="Why Al Hilal">
                {whyAlHilalStats.map((item) => (
                  <li key={item.label} className="why-stat">
                    <span className="why-stat__icon" aria-hidden>
                      <AppIcon
                        icon={
                          item.icon === 'calendar'
                            ? appIcons.calendar
                            : item.icon === 'chat'
                              ? appIcons.chat
                              : appIcons.shield
                        }
                        size="sm"
                      />
                    </span>
                    <div className="why-stat__body">
                      <span className="why-stat__label">{item.label}</span>
                      <span className="why-stat__title">{item.value}</span>
                      <p className="why-stat__description">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      <ProjectGrid
        actionLabel="Trip and booking information"
        description="A preview of our featured departures—upcoming journeys with published dates and clear next steps. See the full list to compare every option."
        eyebrow="Journeys"
        projects={homeFeaturedJourneys}
        title="Featured departures"
        viewAllLabel="View all journeys"
        viewAllTo="/journeys"
      />

      <section className="section section--compact">
        <Container>
          <Reveal className="card reassurance-card reassurance-card--enhanced">
            <div className="detail-body detail-body--reassurance">
              <div className="section-stack">
                <SectionHeading
                  eyebrow={journeySupport.eyebrow}
                  title={journeySupport.title}
                  description={journeySupport.description}
                />
                <ul className="reassurance-card__points">
                  <li>
                    <AppIcon icon={appIcons.calendar} size="xs" />
                    <span>Date and package clarity</span>
                  </li>
                  <li>
                    <AppIcon icon={appIcons.users} size="xs" />
                    <span>Family and rooming fit</span>
                  </li>
                  <li>
                    <AppIcon icon={appIcons.chat} size="xs" />
                    <span>Direct answers on WhatsApp</span>
                  </li>
                </ul>
              </div>
              <aside className="reassurance-card__aside" aria-label="Contact Al Hilal">
                <div className="reassurance-card__actions">
                  <WhatsAppCTA contextLabel="homepage_journey_support" />
                </div>
                <div className="reassurance-card__contact">
                  <p className="reassurance-card__contact-title">{journeySupport.contactTitle}</p>
                  <p className="reassurance-card__contact-intro">{journeySupport.contactIntro}</p>
                  <ul className="reassurance-card__contact-list">
                    <li>
                      <AppIcon icon={appIcons.phone} size="xs" />
                      <a href={brand.phoneUrl}>{brand.phone}</a>
                    </li>
                    <li>
                      <AppIcon icon={appIcons.email} size="xs" />
                      <a href={brand.emailUrl}>{brand.email}</a>
                    </li>
                    <li>
                      <AppIcon icon={appIcons.location} size="xs" />
                      <span>{brand.office}</span>
                    </li>
                    <li>
                      <AppIcon icon={appIcons.clock} size="xs" />
                      <span>{brand.hours}</span>
                    </li>
                  </ul>
                  <p className="reassurance-card__contact-foot">
                    <InlineLink
                      data-cta-label="reassurance_contact_page"
                      data-track-cta="true"
                      to="/contact"
                    >
                      Full contact form and map
                    </InlineLink>
                  </p>
                </div>
              </aside>
            </div>
          </Reveal>
        </Container>
      </section>

      <ServicesSection
        description="Good sacred-travel service should sound clear, feel human, and answer practical questions without pushing people."
        eyebrow="Service style"
        items={serviceStyleItems.map((item) => ({
          kicker: item.title,
          icon: item.icon,
          title: item.title,
          description: item.description,
        }))}
        title="What pilgrims should feel before they book."
      />

      <section className="section">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Guidance"
              title="Start with the question you already have."
              description="These editorial articles are written for Muslims planning Umrah and Hajj from Uganda and East Africa."
            />
          </Reveal>

          <div className="projects-grid">
            {guidanceArticles.slice(0, 3).map((guide) => (
              <Reveal key={guide.slug}>
                <Card as="article" className="project-card">
                  <div className="project-card__media">
                    <img alt={guide.title} decoding="async" loading="lazy" src={guide.image} />
                  </div>
                  <div className="project-card__body">
                    <div className="section-stack">
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
                    </div>
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

          <div style={{ marginTop: '1.5rem' }}>
            <InlineLink
              data-cta-label="homepage_guidance_section"
              data-context-label="homepage_guidance_intro"
              data-track-cta="true"
              to="/guidance"
            >
              Visit the guidance hub
            </InlineLink>
          </div>
        </Container>
      </section>

      <CtaBanner
        description={finalCtaCopy.description}
        eyebrow={finalCtaCopy.eyebrow}
        image={imagery.contact}
        secondaryLabel="See journeys"
        secondaryLink="/journeys"
        title={finalCtaCopy.title}
      />

      <FaqSection items={homeFaqs} />
    </>
  )
}
