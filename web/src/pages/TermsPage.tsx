import { useEffect } from 'react'
import { Reveal } from '../components/motion/Reveal'
import { Card } from '../components/ui/Card'
import { Container } from '../components/ui/Container'
import { legalContent } from '../data/site'

export function TermsPage() {
  const content = legalContent.terms

  useEffect(() => {
    document.title = 'Terms | Al Hilal Travels Uganda'
  }, [])

  return (
    <>
      <section className="section page-hero">
        <Container>
          <Reveal>
            <p className="eyebrow">{content.eyebrow}</p>
            <h1 className="page-hero__title">{content.title}</h1>
            <p className="page-hero__description">{content.description}</p>
          </Reveal>
        </Container>
      </section>

      <section className="section section--light">
        <Container>
          <div className="checklist">
            {content.sections.map((section) => (
              <Reveal key={section.title}>
                <Card as="article" className="service-card">
                  <h2 className="service-card__title">{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p className="project-card__description" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
