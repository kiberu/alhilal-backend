import { Link } from 'react-router-dom'
import { Reveal } from '../components/motion/Reveal'
import { Container } from '../components/ui/Container'

export function NotFoundPage() {
  return (
    <section className="section page-hero">
      <Container>
        <Reveal>
          <p className="eyebrow">Page not found</p>
          <h1 className="page-hero__title">The page you requested is unavailable.</h1>
          <p className="page-hero__description">
            Use the main routes to continue browsing journeys, guidance, and contact options.
          </p>
          <p style={{ marginTop: '1.25rem' }}>
            <Link className="inline-link" to="/">
              Back to home
            </Link>
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
