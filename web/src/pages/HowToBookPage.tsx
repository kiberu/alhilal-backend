import { useEffect } from 'react'
import { ContactBlock } from '../components/sections/ContactBlock'
import { FaqSection } from '../components/sections/FaqSection'
import { Reveal } from '../components/motion/Reveal'
import { Card } from '../components/ui/Card'
import { Container } from '../components/ui/Container'
import { SectionHeading } from '../components/ui/SectionHeading'
import { bookingChecks, bookingFaqs, bookingSteps } from '../data/site'

export function HowToBookPage() {
  useEffect(() => {
    document.title = 'How to Book | What to do before you book'
  }, [])

  return (
    <>
      <section className="section page-hero">
        <Container>
          <Reveal>
            <p className="eyebrow">How to book</p>
            <h1 className="page-hero__title">
              What to do before you book your Umrah or Hajj.
            </h1>
            <p className="page-hero__description">
              The booking path should remove uncertainty, not add to it. Start
              with a real question, then move into dates, documents, package
              approval, and final confirmation.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Booking rhythm"
              title="Three simple stages."
              description="Pilgrims do better when they know what happens first, what happens next, and what Al Hilal needs from them at each point."
            />
          </Reveal>

          <div className="process-grid process-grid--three">
            {bookingSteps.map((step) => (
              <Reveal key={step.number}>
                <Card as="article" className="process-card">
                  <h3 className="process-card__number">{step.number}</h3>
                  <h4 className="service-card__title">{step.title}</h4>
                  <p className="process-card__description">{step.description}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="section section--light">
        <Container>
          <div className="detail-body">
            <Reveal className="section-stack">
              <SectionHeading
                eyebrow="What should be clear before you pay"
                title="Know the practical details first."
                description="Good booking conversations are easier when the important questions are already on the table."
              />
            </Reveal>

            <div className="checklist">
              {bookingChecks.map((item) => (
                <Reveal key={item}>
                  <Card as="article" className="service-card">
                    <h3 className="service-card__title">{item}</h3>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <FaqSection
        items={bookingFaqs}
        title="Questions people usually ask first"
      />

      <ContactBlock
        compact
        layout="centered"
        contextLabel="how_to_book_consultation"
        ctaLabel="consultation_form_submit"
        description="A short summary from you makes the first WhatsApp conversation more useful and easier to handle."
        eyebrow="Need help before you choose?"
        shellId="consultation-form"
        source="how_to_book"
        title="Tell Al Hilal what you are trying to work out."
      />
    </>
  )
}
