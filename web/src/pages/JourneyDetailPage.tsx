import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Reveal } from '../components/motion/Reveal'
import { AppIcon, appIcons } from '../components/ui/AppIcon'
import { Card } from '../components/ui/Card'
import { Container } from '../components/ui/Container'
import { InlineLink } from '../components/ui/InlineLink'
import { SectionHeading } from '../components/ui/SectionHeading'
import { WhatsAppCTA } from '../components/ui/WhatsAppCTA'
import {
  contactMethods,
  journeyGeneralFaqs,
  journeyGeneralInformation,
} from '../data/site'
import {
  formatDateRange,
  formatMoney,
  formatNightsLabel,
  formatStatusLabel,
} from '../lib/format'
import {
  getPublicJourneyBySlug,
  type PublicJourneyDetail,
} from '../lib/trips'

export function JourneyDetailPage() {
  const contactIconMap = {
    clock: appIcons.clock,
    email: appIcons.email,
    location: appIcons.location,
    phone: appIcons.phone,
  } as const

  const { slug } = useParams()
  const [journey, setJourney] = useState<PublicJourneyDetail | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!slug) {
      return
    }

    let isMounted = true
    getPublicJourneyBySlug(slug)
      .then((item) => {
        if (isMounted) {
          setJourney(item)
        }
      })
      .catch(() => {
        if (isMounted) {
          setJourney(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoaded(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  useEffect(() => {
    if (!journey) {
      return
    }

    document.title = `${journey.seoTitle || journey.name} | Al Hilal Travels Uganda`
    return () => {
      document.title = 'Al Hilal Travels Uganda'
    }
  }, [journey])

  if (!slug) {
    return <Navigate replace to="/journeys" />
  }

  if (isLoaded && !journey) {
    return <Navigate replace to="/journeys" />
  }

  if (!journey) {
    return null
  }

  return (
    <>
      <section className="section detail-page">
        <Container>
          <div className="detail-hero">
            <Reveal className="section-stack">
              <p className="eyebrow">{journey.featured ? 'Featured journey' : 'Journey detail'}</p>
              <h1 className="page-hero__title">{journey.name}</h1>
              <ul className="detail-meta">
                <li className="detail-meta__item">
                  <AppIcon icon={appIcons.calendar} size="xs" />
                  <span>{formatDateRange(journey.startDate, journey.endDate)}</span>
                </li>
                <li className="detail-meta__item">
                  <AppIcon icon={appIcons.location} size="xs" />
                  <span>{journey.cities.join(', ')}</span>
                </li>
                <li className="detail-meta__item">
                  <AppIcon icon={appIcons.clock} size="xs" />
                  <span>{formatNightsLabel(journey.defaultNights)}</span>
                </li>
                <li className="detail-meta__item">
                  <AppIcon icon={appIcons.badgeCheck} size="xs" />
                  <span>{formatStatusLabel(journey.status)}</span>
                </li>
              </ul>
              <p className="page-hero__description">{journey.excerpt}</p>
            </Reveal>

            <div className="detail-image">
              <img
                alt={journey.name}
                decoding="async"
                src={journey.coverImage || '/assets/journeys/2026-27.jpg'}
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Packages"
              title="Every package, with booking guidance"
              description="Use this to compare dates, pricing, flights, hotels, capacity, and the exact booking path for each package."
            />
          </Reveal>
          <div className="checklist" style={{ marginTop: '1.5rem' }}>
            {journey.packages.length ? (
              journey.packages.map((item) => (
                <Reveal key={item.id}>
                  <Card as="article" className="detail-copy">
                    <h3 className="detail-copy__title">{item.name}</h3>
                    <p>
                      {formatDateRange(item.startDate, item.endDate)} · {formatNightsLabel(item.nights)} ·{' '}
                      {formatMoney(item.priceMinorUnits, item.currency || 'UGX') || 'Price not published'}
                    </p>
                    <p>
                      Status: {item.status ? formatStatusLabel(item.status) : 'Pending'} · Capacity:{' '}
                      {item.capacity ?? 'N/A'} · Target: {item.salesTarget ?? 'N/A'}
                    </p>
                    <p>
                      Hotel booking month: {item.hotelBookingMonth || 'N/A'} · Airline booking month:{' '}
                      {item.airlineBookingMonth || 'N/A'}
                    </p>

                    <div className="checklist">
                      <Card as="article" className="service-card">
                        <h4 className="service-card__title">How to book this package</h4>
                        <ul className="article-post__list">
                          <li>Step 1: Review this package details and travel dates.</li>
                          <li>Step 2: Confirm rooming, travellers, and budget with Al Hilal.</li>
                          <li>
                            Step 3: Submit your consultation request with this package context, then complete booking
                            confirmation.
                          </li>
                        </ul>
                        <div className="hero__actions">
                          <InlineLink
                            data-cta-label="journey_detail_package_how_to_book"
                            data-context-label={item.packageCode || journey.slug}
                            data-track-cta="true"
                            to="/how-to-book"
                          >
                            Read how to book
                          </InlineLink>
                          <WhatsAppCTA
                            contextLabel={item.packageCode || journey.slug}
                            ctaLabel="journey_detail_package_whatsapp"
                            variant="ghost"
                          />
                        </div>
                      </Card>
                    </div>

                    <div className="checklist">
                      <h4 className="service-card__title">Flights</h4>
                      {item.flights.length ? (
                        item.flights.map((flight) => (
                          <Card key={flight.id} as="article" className="service-card">
                            <p>
                              {flight.leg} · {flight.carrier} {flight.flightNo}
                            </p>
                            <p>
                              {flight.depAirport} {flight.depDt} → {flight.arrAirport} {flight.arrDt}
                            </p>
                          </Card>
                        ))
                      ) : (
                        <p className="project-card__description">No flight data published for this package yet.</p>
                      )}
                    </div>

                    <div className="checklist">
                      <h4 className="service-card__title">Hotels</h4>
                      {item.hotels.length ? (
                        item.hotels.map((hotel) => (
                          <Card key={hotel.id} as="article" className="service-card">
                            <p>{hotel.name}</p>
                            <p>
                              {[hotel.address, hotel.roomType].filter(Boolean).join(' · ') || 'Details pending'}
                            </p>
                            <p>
                              {hotel.checkIn && hotel.checkOut
                                ? formatDateRange(hotel.checkIn, hotel.checkOut)
                                : 'Stay dates pending'}
                            </p>
                          </Card>
                        ))
                      ) : (
                        <p className="project-card__description">No hotel data published for this package yet.</p>
                      )}
                    </div>
                  </Card>
                </Reveal>
              ))
            ) : (
              <Reveal>
                <Card as="article" className="service-card">
                  <h3 className="service-card__title">No public packages yet</h3>
                  <p className="project-card__description">
                    This journey exists, but package publishing is still in progress.
                  </p>
                </Card>
              </Reveal>
            )}
          </div>
        </Container>
      </section>

      <section className="section section--light">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Itinerary"
              title="Full itinerary data"
              description="These are the itinerary items currently published for this trip."
            />
          </Reveal>
          <div className="checklist" style={{ marginTop: '1.5rem' }}>
            {journey.itinerary.length ? (
              journey.itinerary.map((item) => (
                <Reveal key={item.id}>
                  <Card as="article" className="service-card">
                    <h3 className="service-card__title">
                      Day {item.dayIndex}: {item.title}
                    </h3>
                    <p className="project-card__description">
                      {[item.location, item.startTime, item.endTime].filter(Boolean).join(' · ') || 'Time pending'}
                    </p>
                    {item.notes ? <p className="project-card__description">{item.notes}</p> : null}
                  </Card>
                </Reveal>
              ))
            ) : (
              <Reveal>
                <Card as="article" className="service-card">
                  <h3 className="service-card__title">No itinerary published</h3>
                </Card>
              </Reveal>
            )}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Milestones and guide"
              title="Operational milestones and guide sections"
              description="Public milestones and published guide sections from backend are listed below."
            />
          </Reveal>
          <div className="detail-body" style={{ marginTop: '1.5rem' }}>
            <div className="checklist">
              <Card as="article" className="detail-copy">
                <h3 className="detail-copy__title">Milestones</h3>
                {journey.milestones.length ? (
                  journey.milestones.map((item) => (
                    <Card key={item.id} as="article" className="service-card">
                      <h4 className="service-card__title">{item.title}</h4>
                      <p className="project-card__description">
                        {item.milestoneType} · {formatStatusLabel(item.status)}
                      </p>
                      <p className="project-card__description">
                        Target: {item.targetDate || 'N/A'} · Actual: {item.actualDate || 'N/A'}
                      </p>
                      {item.packageName ? (
                        <p className="project-card__description">Package: {item.packageName}</p>
                      ) : null}
                      {item.notes ? <p className="project-card__description">{item.notes}</p> : null}
                    </Card>
                  ))
                ) : (
                  <p className="project-card__description">No public milestones published.</p>
                )}
              </Card>
            </div>

            <div className="checklist">
              <Card as="article" className="detail-copy">
                <h3 className="detail-copy__title">Guide sections</h3>
                {journey.guideSections.length ? (
                  journey.guideSections.map((item) => (
                    <Card key={item.id} as="article" className="service-card">
                      <h4 className="service-card__title">
                        {item.order}. {item.title}
                      </h4>
                      <p className="project-card__description" style={{ whiteSpace: 'pre-line' }}>
                        {item.contentMd}
                      </p>
                    </Card>
                  ))
                ) : (
                  <p className="project-card__description">No guide sections published.</p>
                )}
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="General support"
              title="General information, contact details, and FAQs"
              description="These apply across all journey pages and help you move faster from comparison to booking."
            />
          </Reveal>

          <div className="journey-support-shell">
            <div className="journey-support-grid">
              <section className="journey-support-block">
                <h3 className="journey-support-heading">General information</h3>
                <ul className="journey-support-list">
                  {journeyGeneralInformation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="journey-support-block">
                <h3 className="journey-support-heading">Contact details</h3>
                <ul className="journey-contact-list">
                  {contactMethods.map((item) => {
                    const icon = item.icon
                      ? contactIconMap[item.icon as keyof typeof contactIconMap]
                      : appIcons.chat

                    return (
                      <li key={item.label} className="journey-contact-item">
                        <span className="journey-contact-icon" aria-hidden="true">
                          <AppIcon icon={icon} size="sm" />
                        </span>
                        <p>
                          <strong>{item.label}:</strong>{' '}
                          {item.href ? <a href={item.href}>{item.value}</a> : item.value}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </section>
            </div>

            <section className="journey-support-faq">
              <h3 className="journey-support-heading">General FAQs</h3>
              <div className="journey-faq-list">
                {journeyGeneralFaqs.map((item) => (
                  <article key={item.question} className="journey-faq-item">
                    <h4>{item.question}</h4>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </Container>
      </section>

    </>
  )
}
