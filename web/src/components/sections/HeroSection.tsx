import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Button } from '../ui/Button'
import { AppIcon, appIcons } from '../ui/AppIcon'
import { heroHighlights } from '../../data/site'
import { Reveal } from '../motion/Reveal'

export function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null)
  const [figureMotion, setFigureMotion] = useState({ scale: 1, fade: 0 })

  useEffect(() => {
    let frameId = 0

    const updateFigureScale = () => {
      const hero = heroRef.current

      if (!hero) {
        return
      }

      const rect = hero.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const distanceTravelled = Math.max(0, -rect.top)
      const travelDistance = Math.max(rect.height - viewportHeight, viewportHeight * 0.72)
      const progress = Math.min(1, distanceTravelled / travelDistance)
      const nextScale = Number((1 + progress * 0.11).toFixed(3))
      const nextFade = Number((progress * 0.8).toFixed(3))

      setFigureMotion((currentMotion) =>
        Math.abs(currentMotion.scale - nextScale) > 0.001 ||
        Math.abs(currentMotion.fade - nextFade) > 0.001
          ? { scale: nextScale, fade: nextFade }
          : currentMotion,
      )
    }

    const requestUpdate = () => {
      if (frameId) {
        return
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        updateFigureScale()
      })
    }

    updateFigureScale()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }

      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="hero hero--alhilal"
      style={
        {
          '--hero-figure-scale': figureMotion.scale,
          '--hero-figure-fade': figureMotion.fade,
        } as CSSProperties
      }
    >
      <div aria-hidden="true" className="hero__figure">
        <img alt="" src="/assets/hero/kaaba-cutout.png" />
      </div>

      <div className="hero__content hero__content--reference">
        <Reveal className="hero__intro">
          <p className="eyebrow">Answer Allah's Call with us...</p>
          <h1 className="hero__title display-title--hero">
            Best Umrah and Hajj
            <br />
            Services In Uganda
          </h1>

          <div className="hero__actions">
            <Button
              data-cta-label="homepage_hero_journey_packages"
              data-context-label="homepage_hero"
              data-track-cta="true"
              icon={<AppIcon icon={appIcons.arrowUpRight} size="sm" />}
              to="/journeys"
            >
              See Journey Packages
            </Button>
            <Button
              data-cta-label="homepage_hero_about"
              data-context-label="homepage_hero"
              data-track-cta="true"
              to="/about"
              variant="secondary"
            >
              About Al-hilal
            </Button>
          </div>
        </Reveal>

        <Reveal className="hero__support">
          <p className="hero__subtitle">
            Plan your Umrah or Hajj with a dedicated team based in Uganda with
            clarity and professionalism.
          </p>
          <p className="hero__description">
            Al Hilal helps Muslim pilgrims move from first question to final
            booking with clear dates, family-aware care, and real human support.
          </p>
        </Reveal>

        <Reveal className="hero__features hero__features--reference">
          {heroHighlights.map((item) => (
            <div className="hero-feature" key={item.number}>
              <span className="hero-feature__number">#{item.number}</span>
              <span className="hero-feature__label">{item.label}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
