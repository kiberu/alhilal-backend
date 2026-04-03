import { useEffect, useState } from 'react'
import { ContactBlock } from '../components/sections/ContactBlock'
import { FaqSection } from '../components/sections/FaqSection'
import { ProjectGrid } from '../components/sections/ProjectGrid'
import { Reveal } from '../components/motion/Reveal'
import { Container } from '../components/ui/Container'
import { SectionHeading } from '../components/ui/SectionHeading'
import { bookingFaqs } from '../data/site'
import {
  getPublicJourneys,
  type PublicJourneyListItem,
} from '../lib/trips'

export function JourneysPage() {
  const [journeys, setJourneys] = useState<PublicJourneyListItem[]>([])

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

      <ProjectGrid
        compact
        description="The featured journey gets the strongest emphasis, but every departure should still make it easy to compare dates, support, and the next step."
        eyebrow="Current departures"
        projects={journeys}
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
