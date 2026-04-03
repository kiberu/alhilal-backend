import { useState } from 'react'
import type { FormEvent } from 'react'
import { analyticsEventNames, trackEvent } from '../../lib/analytics'
import { createWebsiteLead, type LeadInterestType } from '../../lib/leads'
import { Reveal } from '../motion/Reveal'
import { AppIcon, appIcons } from '../ui/AppIcon'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { SectionHeading } from '../ui/SectionHeading'
import { WhatsAppCTA } from '../ui/WhatsAppCTA'

type ContactBlockProps = {
  eyebrow: string
  title: string
  description: string
  compact?: boolean
  layout?: 'split' | 'centered'
  shellId?: string
  source?: string
  contextLabel?: string
  ctaLabel?: string
  tripId?: string
  interestType?: LeadInterestType
  submitLabel?: string
  successMessage?: string
}

export function ContactBlock({
  eyebrow,
  title,
  description,
  compact = false,
  layout = 'split',
  shellId = 'consultation-form',
  source = 'contact',
  contextLabel = 'contact_consultation',
  ctaLabel = 'consultation_form_submit',
  tripId = '',
  interestType = 'CONSULTATION',
  submitLabel = 'Request follow-up',
  successMessage = 'Your consultation request is saved.',
}: ContactBlockProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    window: '',
    help: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackKind, setFeedbackKind] = useState<'idle' | 'success' | 'error'>('idle')
  const isCenteredLayout = layout === 'centered'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim() || (interestType === 'CONSULTATION' && !form.phone.trim())) {
      setFeedback('Please complete the required fields and enter a valid email address.')
      setFeedbackKind('error')
      return
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFeedback('Please complete the required fields and enter a valid email address.')
      setFeedbackKind('error')
      return
    }

    const submission = {
      name: form.name.trim(),
      phone: interestType === 'CONSULTATION' ? form.phone.trim() : '',
      email: form.email.trim(),
      interestType,
      travelWindow: form.window.trim(),
      notes: form.help.trim(),
      tripId,
      source,
      contextLabel,
      ctaLabel,
    } as const

    setIsSubmitting(true)
    setFeedback('')
    setFeedbackKind('idle')

    trackEvent(analyticsEventNames.leadSubmitStarted, {
      pagePath: window.location.pathname,
      source,
      contextLabel,
      interestType,
      tripId,
    })

    try {
      await createWebsiteLead(submission)
      setFeedback(successMessage)
      setFeedbackKind('success')
      setForm({
        name: '',
        phone: '',
        email: '',
        window: '',
        help: '',
      })
      trackEvent(analyticsEventNames.leadSubmitSucceeded, {
        pagePath: window.location.pathname,
        source,
        contextLabel,
        interestType,
        tripId,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'We could not save your request. Please try again.'
      setFeedback(message)
      setFeedbackKind('error')
      trackEvent(analyticsEventNames.leadSubmitFailed, {
        pagePath: window.location.pathname,
        source,
        contextLabel,
        interestType,
        tripId,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`section ${compact ? 'section--compact' : ''}`.trim()}>
      <Container>
        <div className={`contact-grid ${isCenteredLayout ? 'contact-grid--centered' : ''}`.trim()}>
          <Reveal className="contact-copy section-stack">
            <SectionHeading
              align={isCenteredLayout ? 'center' : 'left'}
              eyebrow={eyebrow}
              title={title}
              description={description}
            />
            <p
              className={`project-card__description ${
                isCenteredLayout ? 'contact-copy__description--centered' : ''
              }`.trim()}
            >
              This works well for first-timers, families, and anyone comparing
              dates or budget before choosing a departure.
            </p>
          </Reveal>

          <Reveal className={`card contact-card ${isCenteredLayout ? 'contact-card--centered' : ''}`.trim()} id={shellId}>
            <div className="section-stack">
              <div className="contact-card__meta">
                <AppIcon icon={appIcons.chat} size="xs" />
                WhatsApp is still the fastest route
              </div>
              <h3 className="contact-card__title">
                Give the team a better starting point.
              </h3>
              <p className="section-heading__description">
                Share the basics and the conversation can move faster on
                WhatsApp with less back-and-forth.
              </p>

              <form
                className="contact-form"
                data-cta-label={ctaLabel}
                data-context-label={contextLabel}
                data-interest-type={interestType}
                data-lead-form
                data-source={source}
                data-trip-id={tripId}
                noValidate
                onSubmit={handleSubmit}
              >
                <div className="contact-field">
                  <label htmlFor={`${shellId}-full-name`}>Full name *</label>
                  <input
                    id={`${shellId}-full-name`}
                    name="full-name"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Full name"
                    required
                    value={form.name}
                  />
                </div>
                {interestType === 'CONSULTATION' ? (
                  <div className="contact-field">
                    <label htmlFor={`${shellId}-phone`}>Phone or WhatsApp *</label>
                    <input
                      id={`${shellId}-phone`}
                      name="phone"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      placeholder="Phone or WhatsApp"
                      required
                      value={form.phone}
                    />
                  </div>
                ) : null}
                <div className="contact-field">
                  <label htmlFor={`${shellId}-email`}>
                    {interestType === 'GUIDE_REQUEST' ? 'Email address *' : 'Email address'}
                  </label>
                  <input
                    id={`${shellId}-email`}
                    name="email"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="Email address"
                    required={interestType === 'GUIDE_REQUEST'}
                    type="email"
                    value={form.email}
                  />
                </div>
                {interestType === 'CONSULTATION' ? (
                  <>
                    <div className="contact-field">
                      <label htmlFor={`${shellId}-window`}>Preferred travel window</label>
                      <input
                        id={`${shellId}-window`}
                        name="window"
                        onChange={(event) =>
                          setForm((current) => ({ ...current, window: event.target.value }))
                        }
                        placeholder="Preferred travel window"
                        value={form.window}
                      />
                    </div>
                    <div className="contact-field">
                      <label htmlFor={`${shellId}-help`}>What would you like help with?</label>
                      <textarea
                        id={`${shellId}-help`}
                        name="help"
                        onChange={(event) =>
                          setForm((current) => ({ ...current, help: event.target.value }))
                        }
                        placeholder="Tell us what you need help with"
                        value={form.help}
                      />
                    </div>
                  </>
                ) : null}

                <div
                  aria-live="polite"
                  className={`form-feedback ${
                    feedbackKind === 'error'
                      ? 'form-feedback--error'
                      : feedbackKind === 'success'
                        ? 'form-feedback--success'
                        : ''
                  }`.trim()}
                  data-form-feedback
                >
                  {feedback}
                </div>
                <div className="contact-form__actions">
                  <Button
                    data-cta-label={ctaLabel}
                    data-context-label={contextLabel}
                    data-track-cta="true"
                    disabled={isSubmitting}
                    icon={<AppIcon icon={appIcons.chat} size="sm" />}
                    iconPosition="start"
                    type="submit"
                    variant="ghost"
                  >
                    {isSubmitting ? 'Saving...' : submitLabel}
                  </Button>
                  <WhatsAppCTA
                    contextLabel={contextLabel}
                    ctaLabel={`${ctaLabel}_whatsapp`}
                    variant="secondary"
                  />
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
