import { services } from '../../data/site'
import { Reveal } from '../motion/Reveal'
import { AppIcon, appIcons } from '../ui/AppIcon'
import { Container } from '../ui/Container'
import { SectionHeading } from '../ui/SectionHeading'

type ServicesSectionProps = {
  eyebrow: string
  title: string
  description: string
  items?: typeof services
}

export function ServicesSection({
  eyebrow,
  title,
  description,
  items = services,
}: ServicesSectionProps) {
  const serviceIconMap = {
    calendar: appIcons.calendar,
    chat: appIcons.chat,
    shield: appIcons.shield,
    users: appIcons.users,
  } as const

  return (
    <section className="section">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        </Reveal>

        <div className="service-editorial-list">
          {items.map((service, index) => (
            <Reveal key={service.title}>
              <article className="service-feature">
                <div className="service-feature__meta">
                  <span className="service-feature__number">0{index + 1}</span>
                  {service.icon ? (
                    <span className="service-card__icon">
                      <AppIcon
                        icon={serviceIconMap[service.icon as keyof typeof serviceIconMap]}
                        size="md"
                      />
                    </span>
                  ) : null}
                </div>
                <div className="service-feature__body">
                  <p className="service-card__kicker">{service.kicker}</p>
                  <h3 className="service-card__title">{service.title}</h3>
                  <p className="service-card__description">{service.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
