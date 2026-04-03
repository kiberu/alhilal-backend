import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ContactBlock } from '../components/sections/ContactBlock'
import { FaqSection } from '../components/sections/FaqSection'
import { ProjectGrid } from '../components/sections/ProjectGrid'
import { Reveal } from '../components/motion/Reveal'
import { AppIcon, appIcons } from '../components/ui/AppIcon'
import { Button } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { SectionHeading } from '../components/ui/SectionHeading'
import { bookingFaqs } from '../data/site'
import { analyticsEventNames, trackEvent } from '../lib/analytics'
import { createWebsiteLead } from '../lib/leads'
import {
  getPublicJourneys,
  type PublicJourneyListItem,
} from '../lib/trips'

function toMonthLabel(value: string): string {
  if (!value) return ''
  const parsed = new Date(`${value}-01T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-UG', { month: 'long', year: 'numeric' }).format(parsed)
}

export function JourneysPage() {
  const [journeys, setJourneys] = useState<PublicJourneyListItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [monthFilter, setMonthFilter] = useState('ALL')
  const [bookingForm, setBookingForm] = useState({
    departureMonth: '',
    travellers: '1',
    name: '',
    phone: '',
    email: '',
  })
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false)
  const [bookingFeedback, setBookingFeedback] = useState('')
  const [bookingFeedbackKind, setBookingFeedbackKind] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    document.title = 'Journeys | Umrah and Hajj departures from Kampala'
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

  const statusOptions = useMemo(
    () => Array.from(new Set(journeys.map((item) => item.status).filter(Boolean))),
    [journeys],
  )

  const monthOptions = useMemo(
    () => Array.from(new Set(journeys.map((item) => item.commercialMonthLabel).filter(Boolean))) as string[],
    [journeys],
  )

  const filteredJourneys = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase()

    return journeys.filter((journey) => {
      const matchesSearch =
        !normalizedQuery ||
        [
          journey.name,
          journey.excerpt,
          journey.commercialMonthLabel || '',
          journey.cities.join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesStatus = statusFilter === 'ALL' || journey.status === statusFilter
      const matchesMonth = monthFilter === 'ALL' || journey.commercialMonthLabel === monthFilter

      return matchesSearch && matchesStatus && matchesMonth
    })
  }, [journeys, monthFilter, searchTerm, statusFilter])

  function resetFilters() {
    setSearchTerm('')
    setStatusFilter('ALL')
    setMonthFilter('ALL')
  }

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!bookingForm.name.trim() || !bookingForm.phone.trim()) {
      setBookingFeedback('Please enter your name and phone or WhatsApp number.')
      setBookingFeedbackKind('error')
      return
    }

    if (bookingForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingForm.email.trim())) {
      setBookingFeedback('Please enter a valid email address.')
      setBookingFeedbackKind('error')
      return
    }

    const notes = [
      bookingForm.travellers ? `Travellers: ${bookingForm.travellers}` : '',
      bookingForm.departureMonth ? `Preferred month: ${toMonthLabel(bookingForm.departureMonth)}` : '',
    ]
      .filter(Boolean)
      .join(' | ')

    setIsBookingSubmitting(true)
    setBookingFeedback('')
    setBookingFeedbackKind('idle')

    trackEvent(analyticsEventNames.leadSubmitStarted, {
      pagePath: window.location.pathname,
      source: 'journeys_booking_bar',
      contextLabel: 'journeys_booking_bar',
      interestType: 'CONSULTATION',
      tripId: '',
    })

    try {
      await createWebsiteLead({
        name: bookingForm.name.trim(),
        phone: bookingForm.phone.trim(),
        email: bookingForm.email.trim(),
        interestType: 'CONSULTATION',
        travelWindow: bookingForm.departureMonth || '',
        notes,
        tripId: '',
        source: 'journeys_booking_bar',
        contextLabel: 'journeys_booking_bar',
        ctaLabel: 'journeys_booking_submit',
        campaign: 'journeys_booking',
      })

      setBookingFeedback('Thank you. Your booking request is saved and the team will follow up shortly.')
      setBookingFeedbackKind('success')
      setBookingForm({
        departureMonth: '',
        travellers: '1',
        name: '',
        phone: '',
        email: '',
      })

      trackEvent(analyticsEventNames.leadSubmitSucceeded, {
        pagePath: window.location.pathname,
        source: 'journeys_booking_bar',
        contextLabel: 'journeys_booking_bar',
        interestType: 'CONSULTATION',
        tripId: '',
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'We could not save your request. Please try again.'
      setBookingFeedback(message)
      setBookingFeedbackKind('error')

      trackEvent(analyticsEventNames.leadSubmitFailed, {
        pagePath: window.location.pathname,
        source: 'journeys_booking_bar',
        contextLabel: 'journeys_booking_bar',
        interestType: 'CONSULTATION',
        tripId: '',
      })
    } finally {
      setIsBookingSubmitting(false)
    }
  }

  return (
    <>
      <section className="section page-hero">
        <Container>
          <Reveal>
            <p className="eyebrow">Journeys</p>
            <h1 className="page-hero__title">
              Compare Umrah and Hajj departures before you message the team.
            </h1>
            <p className="page-hero__description">
              Start with dates, city mix, and price direction. Then speak to Al
              Hilal when you want help choosing the best fit for your household.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="section section--compact">
        <Container>
          <Reveal className="card booking-strip">
            <div className="booking-strip__intro">
              <p className="eyebrow">Quick booking form</p>
              <h2 className="booking-strip__title">Start a trip booking request</h2>
            </div>

            <form className="booking-strip__form" noValidate onSubmit={handleBookingSubmit}>
              <label className="booking-strip__field" htmlFor="booking-departure-month">
                <span>Departure month</span>
                <input
                  id="booking-departure-month"
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, departureMonth: event.target.value }))
                  }
                  type="month"
                  value={bookingForm.departureMonth}
                />
              </label>

              <label className="booking-strip__field" htmlFor="booking-travellers">
                <span>Travellers</span>
                <select
                  id="booking-travellers"
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, travellers: event.target.value }))
                  }
                  value={bookingForm.travellers}
                >
                  <option value="1">1 traveller</option>
                  <option value="2">2 travellers</option>
                  <option value="3">3 travellers</option>
                  <option value="4">4 travellers</option>
                  <option value="5+">5+ travellers</option>
                </select>
              </label>

              <label className="booking-strip__field" htmlFor="booking-name">
                <span>Full name *</span>
                <input
                  id="booking-name"
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Your full name"
                  required
                  value={bookingForm.name}
                />
              </label>

              <label className="booking-strip__field" htmlFor="booking-phone">
                <span>Phone or WhatsApp *</span>
                <input
                  id="booking-phone"
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="+256..."
                  required
                  value={bookingForm.phone}
                />
              </label>

              <label className="booking-strip__field" htmlFor="booking-email">
                <span>Email (optional)</span>
                <input
                  id="booking-email"
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="you@example.com"
                  type="email"
                  value={bookingForm.email}
                />
              </label>

              <div className="booking-strip__actions">
                <Button
                  data-context-label="journeys_booking_bar"
                  data-cta-label="journeys_booking_submit"
                  data-track-cta="true"
                  disabled={isBookingSubmitting}
                  icon={<AppIcon icon={appIcons.arrowUpRight} size="sm" />}
                  type="submit"
                  variant="primary"
                >
                  {isBookingSubmitting ? 'Saving...' : 'Check availability'}
                </Button>
              </div>
            </form>

            <div
              aria-live="polite"
              className={`form-feedback booking-strip__feedback ${
                bookingFeedbackKind === 'error'
                  ? 'form-feedback--error'
                  : bookingFeedbackKind === 'success'
                    ? 'form-feedback--success'
                    : ''
              }`.trim()}
            >
              {bookingFeedback}
            </div>
          </Reveal>
        </Container>
      </section>

      {filteredJourneys.length === 0 ? (
        <section className="section section--compact">
          <Container>
            <Reveal className="card journeys-empty">
              <p className="project-card__description">
                No journeys matched your current filters. Try resetting the filters or broadening your search.
              </p>
            </Reveal>
          </Container>
        </section>
      ) : null}

      <ProjectGrid
        compact
        description="The featured journey gets the strongest emphasis, but every departure should still make it easy to compare dates, support, and the next step."
        eyebrow="Current departures"
        monthFilter={monthFilter}
        monthOptions={monthOptions}
        onMonthFilterChange={setMonthFilter}
        onResetFilters={resetFilters}
        onSearchTermChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        projects={filteredJourneys}
        resultsCount={filteredJourneys.length}
        searchTerm={searchTerm}
        showFilters
        statusFilter={statusFilter}
        statusOptions={statusOptions}
        title="Featured first, then the rest."
      />

      <section className="section section--light">
        <Container>
          <Reveal className="card reassurance-card">
            <div className="detail-body">
              <SectionHeading
                eyebrow="Comparison support"
                title="If two departures look close, ask before you book."
                description="A short WhatsApp conversation can help you compare dates, rooming, pricing, and whether a journey suits your household before you commit."
              />
            </div>
          </Reveal>
        </Container>
      </section>

      <ContactBlock
        compact
        contextLabel="journeys_consultation"
        ctaLabel="consultation_form_submit"
        description="A short summary from you makes the first WhatsApp conversation more useful and easier to handle."
        eyebrow="Need help before you choose?"
        shellId="consultation-form"
        source="journeys"
        title="Tell Al Hilal what you are trying to work out."
      />

      <FaqSection
        items={bookingFaqs}
        title="Questions people usually ask first"
      />
    </>
  )
}
