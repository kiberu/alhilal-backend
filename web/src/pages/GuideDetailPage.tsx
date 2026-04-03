import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ContactBlock } from '../components/sections/ContactBlock'
import { Reveal } from '../components/motion/Reveal'
import { AppIcon, appIcons } from '../components/ui/AppIcon'
import { Container } from '../components/ui/Container'
import { InlineLink } from '../components/ui/InlineLink'
import { guidanceArticles } from '../data/site'
import { appEnv } from '../lib/env'

export function GuideDetailPage() {
  const { slug } = useParams()
  const guide = guidanceArticles.find((item) => item.slug === slug)
  const [copied, setCopied] = useState(false)

  const shareUrls = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }

    const articleUrl = new URL(`${window.location.pathname}${window.location.search}`, appEnv.siteUrl).toString()
    const shareText = `${guide?.title} | Al Hilal Guidance`

    return {
      articleUrl,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${articleUrl}`)}`,
      x: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(articleUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
    }
  }, [guide?.title])

  useEffect(() => {
    if (!guide) {
      return
    }

    document.title = `${guide.title} | Guidance | Al Hilal Travels Uganda`
    return () => {
      document.title = 'Al Hilal Travels Uganda'
    }
  }, [guide])

  if (!guide) {
    return <Navigate replace to="/guidance" />
  }

  const handleCopy = async () => {
    if (!shareUrls?.articleUrl || typeof navigator === 'undefined' || !navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrls.articleUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <section className="section detail-page">
        <Container>
          <div className="detail-hero">
            <Reveal className="section-stack">
              <p className="eyebrow">{guide.category}</p>
              <h1 className="page-hero__title">{guide.title}</h1>
              <ul className="detail-meta">
                <li className="detail-meta__item">
                  <AppIcon icon={appIcons.clock} size="xs" />
                  <span>{guide.readTime}</span>
                </li>
                <li className="detail-meta__item">
                  <AppIcon icon={appIcons.calendar} size="xs" />
                  <span>{guide.publishedAt}</span>
                </li>
                <li className="detail-meta__item">
                  <AppIcon icon={appIcons.users} size="xs" />
                  <span>{guide.author}</span>
                </li>
              </ul>
              <p className="page-hero__description">{guide.description}</p>
            </Reveal>

            <div className="detail-image">
              <img alt={guide.title} decoding="async" src={guide.image} />
            </div>
          </div>
        </Container>
      </section>

      <section className="section section--light">
        <Container>
          <div className="article-layout">
            <Reveal className="detail-copy card article-author-card">
              <h2 className="detail-copy__title">Article details</h2>
              <p>
                <strong>Author:</strong> {guide.author}
              </p>
              <p>
                <strong>Role:</strong> {guide.authorRole}
              </p>
              <p>
                <strong>Published:</strong> {guide.publishedAt}
              </p>
              <p>
                <strong>Updated:</strong> {guide.updatedAt}
              </p>
              <p>
                <strong>Keywords:</strong> {guide.keywords.join(', ')}
              </p>

              <h3 className="article-share__title">Share this article</h3>
              <div className="article-share">
                  <a
                    className="button button--ghost"
                    href={shareUrls?.whatsapp || '#'}
                    rel="noreferrer"
                    target="_blank"
                  >
                    WhatsApp
                  </a>
                <a className="button button--ghost" href={shareUrls?.x || '#'} rel="noreferrer" target="_blank">
                  X
                </a>
                <a
                  className="button button--ghost"
                  href={shareUrls?.facebook || '#'}
                  rel="noreferrer"
                  target="_blank"
                >
                  Facebook
                </a>
                <button className="button button--secondary" onClick={handleCopy} type="button">
                  {copied ? 'Link copied' : 'Copy link'}
                </button>
              </div>
            </Reveal>

            <Reveal className="detail-copy card article-post">
              <h2 className="detail-copy__title">Article</h2>
              {guide.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              {guide.sections.map((section) => (
                <section className="article-post__section" key={section.heading}>
                  <h3>{section.heading}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={`${section.heading}-${paragraph}`}>{paragraph}</p>
                  ))}
                  {section.checklist ? (
                    <ul className="article-post__list">
                      {section.checklist.map((item) => (
                        <li key={`${section.heading}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              <h3>Key takeaway</h3>
              <p>{guide.takeaway}</p>

              <h3>References</h3>
              <ul className="article-post__list">
                {guide.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} rel="noreferrer" target="_blank">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>

              <h3 className="detail-copy__title">Helpful next step</h3>
              <p>
                If this article sounds close to your situation, take the next step before you book so the team can
                help with timing, documents, and support expectations.
              </p>
              <div>
                <InlineLink
                  data-cta-label="guidance_detail_contact"
                  data-context-label={guide.slug}
                  data-track-cta="true"
                  to="/contact"
                >
                  Talk to Al Hilal
                </InlineLink>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <ContactBlock
        compact
        contextLabel={guide.slug}
        ctaLabel="consultation_form_submit"
        description="Use this if you want to ask a practical question after reading and move into a clearer WhatsApp conversation."
        eyebrow="Need help after reading?"
        shellId="consultation-form"
        source="guidance_detail"
        title="Tell the team what you are trying to work out."
      />
    </>
  )
}
