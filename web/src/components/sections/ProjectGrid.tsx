import { formatDateRange, formatMoney, formatPackageCountLabel, formatStatusLabel } from '../../lib/format'
import type { PublicJourneyListItem } from '../../lib/trips'
import { Reveal } from '../motion/Reveal'
import { AppIcon, appIcons } from '../ui/AppIcon'
import { Card } from '../ui/Card'
import { Container } from '../ui/Container'
import { InlineLink } from '../ui/InlineLink'
import { SectionHeading } from '../ui/SectionHeading'

type ProjectGridProps = {
  eyebrow: string
  title: string
  description: string
  projects: PublicJourneyListItem[]
  compact?: boolean
  actionLabel?: string
  viewAllTo?: string
  viewAllLabel?: string
}

export function ProjectGrid({
  eyebrow,
  title,
  description,
  projects,
  compact = false,
  actionLabel = 'Trip and booking information',
  viewAllTo,
  viewAllLabel = 'View all journeys',
}: ProjectGridProps) {
  return (
    <section className={`section ${compact ? 'section--compact' : ''}`.trim()}>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        </Reveal>

        <div className={`projects-grid ${compact ? 'project-grid--archive' : 'project-grid--feature'}`.trim()}>
          {projects.map((project) => (
            <Reveal key={project.slug}>
              <Card as="article" className="project-card project-card--journey">
                <div className="project-card__media">
                  <img
                    alt={project.name}
                    decoding="async"
                    loading="lazy"
                    src={project.coverImage || '/assets/journeys/2026-27.jpg'}
                  />
                </div>
                <div className="project-card__body">
                  <div className="section-stack">
                    <div className="journey-card__meta journey-card__meta--summary">
                      <span className="journey-card__meta-item">
                        <AppIcon icon={appIcons.calendar} size="xs" />
                        <span>{project.commercialMonthLabel || 'Departure'}</span>
                      </span>
                      <span className="journey-card__meta-item">
                        <AppIcon icon={appIcons.badgeCheck} size="xs" />
                        <span>{formatStatusLabel(project.status)}</span>
                      </span>
                    </div>
                    <h3 className="project-card__title">{project.name}</h3>
                    <p className="project-card__description">{project.excerpt}</p>
                    <ul className="project-card__facts">
                      <li className="project-card__fact">
                        <AppIcon icon={appIcons.calendar} size="xs" />
                        <span>{formatDateRange(project.startDate, project.endDate)}</span>
                      </li>
                      <li className="project-card__fact">
                        <AppIcon icon={appIcons.users} size="xs" />
                        <span>{formatPackageCountLabel(project.packagesCount)}</span>
                      </li>
                      <li className="project-card__fact">
                        <AppIcon icon={appIcons.badgeCheck} size="xs" />
                        <span>{formatMoney(project.startingPriceMinorUnits, project.startingPriceCurrency || 'UGX')}</span>
                      </li>
                    </ul>
                  </div>
                  <InlineLink
                    data-cta-label="journey_card_click"
                    data-context-label={project.slug}
                    data-track-cta="true"
                    to={`/journeys/${project.slug}`}
                  >
                    {actionLabel}
                  </InlineLink>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {viewAllTo ? (
          <div style={{ marginTop: '2rem' }}>
            <InlineLink
              data-cta-label="journey_grid_view_all"
              data-context-label="homepage"
              data-track-cta="true"
              to={viewAllTo}
            >
              {viewAllLabel}
            </InlineLink>
          </div>
        ) : null}
      </Container>
    </section>
  )
}
