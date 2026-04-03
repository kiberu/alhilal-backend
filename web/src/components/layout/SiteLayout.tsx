import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  brand,
  contactMethods,
  footerCopy,
  footerLinks,
  navItems,
} from '../../data/site'
import { AppIcon, appIcons } from '../ui/AppIcon'
import { WhatsAppCTA } from '../ui/WhatsAppCTA'

export function SiteLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const isHome = location.pathname === '/'
  const contactIconMap = {
    phone: appIcons.phone,
    email: appIcons.email,
    location: appIcons.location,
    clock: appIcons.clock,
  } as const

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Al Hilal Travels Uganda | Guided Umrah and Hajj from Kampala',
      '/journeys': 'Journeys | Umrah and Hajj departures from Kampala',
      '/how-to-book': 'How to Book | What to do before you book',
      '/guidance': 'Guidance Articles | Umrah and Hajj in Uganda and East Africa',
      '/about': 'About Al Hilal | A Kampala team for Umrah and Hajj',
      '/contact': 'Contact Al Hilal | Talk to a real advisor',
      '/privacy': 'Privacy | Al Hilal Travels Uganda',
      '/terms': 'Terms | Al Hilal Travels Uganda',
    }

    if (
      location.pathname.startsWith('/journeys/') ||
      location.pathname.startsWith('/guidance/')
    ) {
      return
    }

    document.title = titles[location.pathname] ?? brand.name
  }, [location.pathname])

  return (
    <div className="site-shell">
      <a className="skip-link sr-only" href="#main-content">
        Skip to content
      </a>
      <header className={`site-header ${isHome ? 'site-header--overlay' : ''}`.trim()}>
        <div className="site-header__inner">
          <Link aria-label={`${brand.name} home`} className="site-brand" to="/">
            <img
              alt={brand.shortName}
              decoding="async"
              fetchPriority="high"
              height={180}
              src={brand.logo}
              width={468}
            />
          </Link>

          <nav aria-label="Primary" className="site-nav">
            {navItems.map((item) => (
              <Link
                className="site-nav__link"
                data-cta-label="header_nav_click"
                data-context-label={item.href}
                data-track-cta="true"
                key={item.label}
                to={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <WhatsAppCTA />
            <button
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
              className="site-header__menu"
              data-menu-toggle
              onClick={() => setMenuOpen((value) => !value)}
              type="button"
            >
              <span aria-hidden="true" className="site-header__menu-icon">
                <AppIcon icon={menuOpen ? appIcons.close : appIcons.menu} size="lg" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`site-mobile-nav ${menuOpen ? 'site-mobile-nav--open' : ''}`.trim()}
        data-menu-drawer
      >
        <div className="site-mobile-nav__panel">
          <nav aria-label="Mobile" className="site-nav">
            {navItems.map((item) => (
              <Link
                className="site-nav__link"
                data-cta-label="mobile_nav_click"
                data-context-label={item.href}
                data-track-cta="true"
                key={item.label}
                onClick={() => setMenuOpen(false)}
                to={item.href}
              >
                {item.label}
              </Link>
            ))}
            <WhatsAppCTA className="site-mobile-nav__cta" onClick={() => setMenuOpen(false)} />
          </nav>
        </div>
      </div>

      <main className="site-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__grid footer__grid--wide">
            <div className="footer__section section-stack">
              <Link aria-label={`${brand.name} home`} className="site-brand" to="/">
                <img alt={brand.shortName} decoding="async" height={180} loading="lazy" src={brand.logo} width={468} />
              </Link>
              <h2 className="footer__title">
                Guided Umrah and Hajj from Kampala, with planning that feels clear
                from the first question.
              </h2>
              <p className="section-heading__description">{footerCopy}</p>
              <WhatsAppCTA />
            </div>

            <div className="footer__section">
              <p className="footer__eyebrow">Explore</p>
              <ul className="footer__list">
                {footerLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      data-cta-label="footer_nav_click"
                      data-context-label={item.href}
                      data-track-cta="true"
                      to={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__section">
              <p className="footer__eyebrow">Reach the team</p>
              <ul className="footer__list">
                {contactMethods.map((item) => (
                  <li className="footer-contact__item" key={item.label}>
                    <span className="footer-contact__icon">
                      {item.icon ? (
                        <AppIcon
                          icon={contactIconMap[item.icon as keyof typeof contactIconMap]}
                          size="sm"
                        />
                      ) : null}
                    </span>
                    <div className="footer-contact__body">
                      <strong>{item.label}</strong>
                      <div>
                        {item.href ? (
                          <a href={item.href}>{item.value}</a>
                        ) : (
                          <span>{item.value}</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
