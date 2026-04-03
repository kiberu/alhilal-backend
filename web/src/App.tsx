import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'
import { analyticsEventNames, trackEvent } from './lib/analytics'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { GuideDetailPage } from './pages/GuideDetailPage'
import { GuidancePage } from './pages/GuidancePage'
import { HomePage } from './pages/HomePage'
import { HowToBookPage } from './pages/HowToBookPage'
import { JourneyDetailPage } from './pages/JourneyDetailPage'
import { JourneysPage } from './pages/JourneysPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'

function App() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const tracked = target?.closest<HTMLElement>('[data-track-cta="true"]')
      if (!tracked) return

      trackEvent(analyticsEventNames.ctaClick, {
        ctaLabel: tracked.dataset.ctaLabel || '',
        contextLabel: tracked.dataset.contextLabel || '',
        pagePath: window.location.pathname,
      })
    }

    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/journeys" element={<JourneysPage />} />
        <Route path="/journeys/:slug" element={<JourneyDetailPage />} />
        <Route path="/how-to-book" element={<HowToBookPage />} />
        <Route path="/guidance" element={<GuidancePage />} />
        <Route path="/guidance/:slug" element={<GuideDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
