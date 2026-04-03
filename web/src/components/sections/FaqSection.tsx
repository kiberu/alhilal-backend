import { useState } from 'react'
import type { FaqItem } from '../../data/site'
import { Reveal } from '../motion/Reveal'
import { AppIcon, appIcons } from '../ui/AppIcon'
import { Container } from '../ui/Container'
import { SectionHeading } from '../ui/SectionHeading'
import { WhatsAppCTA } from '../ui/WhatsAppCTA'

type FaqSectionProps = {
  eyebrow?: string
  title?: string
  description?: string
  items: FaqItem[]
  contactTitle?: string
  contactDescription?: string
}

export function FaqSection({
  eyebrow = 'Frequently Asked Questions',
  title = 'Answers to Common Questions',
  description = 'From timelines to process details, here are quick answers to the most frequent questions pilgrims ask before they book.',
  items,
  contactTitle = 'Need help before you choose?',
  contactDescription = 'A short WhatsApp conversation can help you compare dates, support, and next steps before you commit.',
}: FaqSectionProps) {
  const [openQuestion, setOpenQuestion] = useState(items[0]?.question ?? '')

  return (
    <section className="section section--compact">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        </Reveal>

        <div className="faq-layout">
          <Reveal className="card contact-card surface-card--faq-intro">
            <div className="section-stack">
              <p className="eyebrow">Talk to Al Hilal</p>
              <h3 className="contact-card__title">{contactTitle}</h3>
              <p className="section-heading__description">{contactDescription}</p>
              <WhatsAppCTA contextLabel="faq_section" ctaLabel="faq_whatsapp" variant="ghost" />
            </div>
          </Reveal>

          <div className="faq-list" data-faq-list>
            {items.map((faq) => {
              const isOpen = openQuestion === faq.question

              return (
                <Reveal key={faq.question}>
                  <div className="faq-item" data-open={isOpen}>
                    <button
                      aria-expanded={isOpen}
                      className="faq-item__button"
                      data-faq-trigger
                      onClick={() => setOpenQuestion(isOpen ? '' : faq.question)}
                      type="button"
                    >
                      <span className="faq-item__question">{faq.question}</span>
                      <AppIcon
                        aria-hidden="true"
                        className="faq-item__icon"
                        icon={appIcons.chevronDown}
                        size="sm"
                      />
                    </button>
                    <div className="faq-item__answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
