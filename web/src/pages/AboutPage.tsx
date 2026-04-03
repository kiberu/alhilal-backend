import { useEffect } from 'react'
import { CtaBanner } from '../components/sections/CtaBanner'
import { Reveal } from '../components/motion/Reveal'
import { Card } from '../components/ui/Card'
import { Container } from '../components/ui/Container'
import { SectionHeading } from '../components/ui/SectionHeading'
import {
  aboutBiography,
  aboutIntro,
  aboutLeadSheikh,
  aboutReasons,
  imagery,
  maqasidPrinciples,
} from '../data/site'

export function AboutPage() {
  useEffect(() => {
    document.title = 'About Al Hilal | A Kampala team for Umrah and Hajj'
  }, [])

  return (
    <>
      <section className="section page-hero">
        <Container>
          <Reveal>
            <p className="eyebrow">{aboutIntro.eyebrow}</p>
            <h1 className="page-hero__title">{aboutIntro.title}</h1>
            <p className="page-hero__description">{aboutIntro.description}</p>
          </Reveal>
        </Container>
      </section>

      <section className="section section--light">
        <Container>
          <div className="about-intro">
            <Reveal className="section-stack">
              <SectionHeading
                eyebrow="Why pilgrims choose Al Hilal"
                title="Answer Allah's call with Al-Hilal"
                description="If you want a team that can guide decisions, coordinate logistics, and keep worship central, this is what Al Hilal is built to deliver."
              />

              <div className="about-stack">
                {aboutReasons.map((paragraph) => (
                  <p className="project-card__description" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            <div className="about-intro__media">
              <img alt="Al Hilal support visual" decoding="async" loading="lazy" src={imagery.about} />
            </div>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="detail-body">
            <Reveal className="section-stack">
              <SectionHeading
                eyebrow={aboutBiography.eyebrow}
                title={aboutBiography.title}
                description={aboutBiography.description}
              />
              <div className="about-stack">
                {aboutBiography.paragraphs.map((paragraph) => (
                  <p className="project-card__description" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <ul className="article-post__list article-post__list--checks">
                {aboutBiography.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal>
              <Card as="article" className="detail-copy">
                <p className="eyebrow">{aboutLeadSheikh.eyebrow}</p>
                <h3 className="detail-copy__title">{aboutLeadSheikh.name}</h3>
                <p className="project-card__description">{aboutLeadSheikh.role}</p>
                <blockquote className="about-sheikh-quote">"{aboutLeadSheikh.quote}"</blockquote>
                <p className="project-card__description">{aboutLeadSheikh.supporting}</p>
                <ul className="article-post__list">
                  {aboutLeadSheikh.commitments.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="section section--light">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="What shapes the service"
              title="Worship, safety, understanding, family, and honest money handling."
              description="The Maqasid are not just theory for Al Hilal. They are a practical standard for how a pilgrimage service should speak, plan, and care for people."
            />
          </Reveal>

          <div className="values-grid" style={{ marginTop: '2.5rem' }}>
            {maqasidPrinciples.map((item) => (
              <Reveal key={item.title}>
                <Card as="article" className="value-card">
                  <p className="eyebrow">{item.title}</p>
                  <p className="value-card__description">{item.description}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBanner
        description="Talk to a Kampala team that helps pilgrims compare journeys, understand what is included, and prepare properly before they commit."
        eyebrow="Talk to Al Hilal"
        image={imagery.contact}
        secondaryLabel="See journeys"
        secondaryLink="/journeys"
        title="Reachable support matters before, during, and after travel."
      />
    </>
  )
}
