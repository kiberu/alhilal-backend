import { useEffect } from 'react'
import { ContactBlock } from '../components/sections/ContactBlock'
import { Reveal } from '../components/motion/Reveal'
import { AppIcon, appIcons } from '../components/ui/AppIcon'
import { Container } from '../components/ui/Container'
import { contactMethods } from '../data/site'

export function ContactPage() {
  const contactIconMap = {
    clock: appIcons.clock,
    email: appIcons.email,
    location: appIcons.location,
    phone: appIcons.phone,
  } as const

  useEffect(() => {
    document.title = 'Contact Al Hilal | Talk to a real advisor'
  }, [])

  return (
    <>
      <section className="section page-hero">
        <Container>
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h1 className="page-hero__title">Talk to a real Al Hilal advisor.</h1>
            <p className="page-hero__description">
              Use this page if you want a proper conversation about dates,
              pricing, family travel, or what journey may fit you best.
              WhatsApp is still the fastest route.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="section section--light">
        <Container>
          <Reveal>
            <div className="contact-methods-shell">
              <ul className="contact-methods-list">
                {contactMethods.map((item) => (
                  <li key={item.label} className="contact-methods-item">
                    {item.icon ? (
                      <span className="contact-methods-icon">
                        <AppIcon
                          icon={contactIconMap[item.icon as keyof typeof contactIconMap]}
                          size="md"
                        />
                      </span>
                    ) : null}
                    <div className="contact-methods-body">
                      <p className="contact-methods-label">{item.label}</p>
                      <p className="contact-methods-value">
                        {item.href ? <a href={item.href}>{item.value}</a> : item.value}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>

      <ContactBlock
        layout="centered"
        contextLabel="contact_consultation"
        ctaLabel="consultation_form_submit"
        description="Share the basics and the conversation can move faster on WhatsApp with less back-and-forth."
        eyebrow="Tell us what you need"
        shellId="consultation-form"
        source="contact"
        title="Give the team a better starting point."
      />
    </>
  )
}
