import "./styles.css";
import siteData from "./site-data.json";

const app = document.querySelector("#app");
const siteName = siteData.brand.name;
const homeTitle = collapseWhitespace(siteData.home.heroTitle);
const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
const route = resolveRoute(currentPath);
const page = route.page;
const slug = route.slug;
const currentProject = siteData.projects.find((project) => project.slug === slug) || siteData.projects[0];

document.body.dataset.theme = page === "project-detail" ? "dark" : "light";
document.title = route.title;
app.innerHTML = renderPage();
wireInteractions();
syncHashScroll();

function renderPage() {
  const pageMarkup = {
    home: renderHomePage(),
    about: renderAboutPage(),
    projects: renderProjectsPage(),
    contact: renderContactPage(),
    "project-detail": renderProjectDetailPage(),
    "not-found": renderNotFoundPage(),
  }[page];

  return `
    <div class="site-shell">
      ${page === "home" ? "" : renderHeader()}
      <main class="site-main">
        ${pageMarkup}
      </main>
      ${renderFooter()}
      <div class="toast" data-toast hidden>Placeholder link disabled in v1.</div>
    </div>
  `;
}

function resolveRoute(pathname) {
  const match = pathname.match(/^\/projects\/([^/]+)$/);
  if (pathname === "/") return { page: "home", slug: "", title: `${siteName} | ${homeTitle}` };
  if (pathname === "/about") return { page: "about", slug: "", title: `About | ${siteName}` };
  if (pathname === "/projects") return { page: "projects", slug: "", title: `Projects | ${siteName}` };
  if (pathname === "/contact") return { page: "contact", slug: "", title: `Contact | ${siteName}` };
  if (match) {
    const project = siteData.projects.find((item) => item.slug === match[1]);
    if (project) {
      return { page: "project-detail", slug: project.slug, title: `${project.title} | ${siteName}` };
    }
  }
  return { page: "not-found", slug: "", title: `Not Found | ${siteName}` };
}

function renderHeader(embedded = false) {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
  ];
  return `
    <header class="site-header ${page === "home" || page === "project-detail" ? "site-header--on-dark" : "site-header--on-light"} ${embedded ? "site-header--embedded" : ""}" data-site-header>
      <div class="site-container site-header__bar">
        ${renderBrandMark()}
        <nav class="site-header__desktop-nav" aria-label="Desktop">
          ${navItems.map((item) => `<a class="site-header__desktop-link ${isActive(item.href) ? "is-active" : ""}" href="${item.href}">${item.label}</a>`).join("")}
          <a class="site-header__desktop-cta" href="/contact">
            <span>Get in touch</span>
            <span class="site-header__desktop-cta-icon">&rarr;</span>
          </a>
        </nav>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-drawer" data-menu-toggle>
          <span></span>
          <span></span>
          <span></span>
          <span class="sr-only">Open menu</span>
        </button>
      </div>
      <div class="menu-drawer" id="site-drawer" data-menu-drawer hidden>
        <button class="menu-drawer__backdrop" type="button" aria-label="Close menu" data-menu-close></button>
        <aside class="menu-drawer__panel">
          <div class="menu-drawer__top">
            ${renderBrandMark()}
            <button class="menu-drawer__close" type="button" aria-label="Close menu" data-menu-close>&times;</button>
          </div>
          <div class="menu-drawer__hero">
            <p class="menu-drawer__tagline">${siteData.brand.tagline}</p>
            <p class="menu-drawer__copy">${siteData.brand.footerBlurb}</p>
            ${renderButton("Get in touch", "/contact", "light")}
          </div>
          <div class="menu-drawer__section">
            <span class="menu-drawer__eyebrow">Menu</span>
            <nav class="menu-drawer__nav" aria-label="Primary">
              ${siteData.navigation.drawer.map((item) => renderNavLink(item)).join("")}
            </nav>
          </div>
          <div class="menu-drawer__section menu-drawer__section--socials">
            <span class="menu-drawer__eyebrow">Social</span>
            <div class="menu-drawer__socials">
              ${siteData.navigation.social.map((item) => renderInlineLink(item.label, item.href, item.inert)).join("")}
            </div>
          </div>
          <div class="menu-drawer__footer">
            <span>&copy; 2025 Copyright</span>
          </div>
        </aside>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="site-container site-footer__inner">
        <div class="site-footer__brand">
          ${renderBrandMark("brand-mark--footer")}
          <p class="site-footer__tagline">${siteData.brand.tagline}</p>
          <p class="site-footer__copy">${siteData.brand.footerBlurb}</p>
          ${renderButton("Get in touch", "/contact")}
        </div>
        <div class="site-footer__links">
          <div>
            <span class="footer-label">Menu</span>
            ${siteData.navigation.footerMenu.map((item) => renderInlineLink(item.label, item.href, item.inert, true)).join("")}
          </div>
          <div>
            <span class="footer-label">Social</span>
            ${siteData.navigation.social.map((item) => renderInlineLink(item.label, item.href, item.inert)).join("")}
          </div>
        </div>
      </div>
      <div class="site-container site-footer__meta">
        <span>&copy; 2025 Copyright</span>
        <span>${siteName}&reg;</span>
      </div>
    </footer>
  `;
}

function renderHomePage() {
  const featuredProjects = siteData.projects.slice(0, 3);
  const heroFloatingLink = siteData.home.heroFloatingLink;

  return `
    <section class="hero hero--home">
      <div class="hero__stage">
        ${renderHeader(true)}
        <div class="hero__media" aria-hidden="true">
          <img class="hero__media-image" src="/hero-portrait.png" alt="" />
        </div>
        <div class="hero__veil"></div>
        <div class="site-container hero__overlay">
          <a class="hero__floating-link reveal" style="--reveal-delay: 0.05s" href="${heroFloatingLink.href}">${heroFloatingLink.label}</a>
          <div class="hero__headline-row">
            <div class="hero__copy hero__copy--overlay">
              <p class="section-label section-label--accent reveal" style="--reveal-delay: 0.12s">${siteData.home.heroEyebrow}</p>
              <h1 class="display-title display-title--hero reveal" style="--reveal-delay: 0.18s">${renderLineBreaks(siteData.home.heroTitle)}</h1>
            </div>
            <div class="hero__support reveal" style="--reveal-delay: 0.28s">
              <p class="hero__title">${siteData.brand.tagline}</p>
              <p class="lede lede--hero">${siteData.brand.heroLead}</p>
            </div>
          </div>
          <div class="hero__chip-grid hero__chip-grid--overlay">
            ${siteData.home.serviceChips
              .map(
                (chip, index) => `
              <article class="hero-chip reveal" style="--reveal-delay: ${0.42 + index * 0.08}s">
                <span class="hero-chip__number">#${chip.number}</span>
                <span class="hero-chip__label">${chip.label}</span>
              </article>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>

    <section class="page-section page-section--home-intro page-section--tight">
      <div class="marquee">
        <div class="marquee__track">
          <span>${siteData.home.trustedTitle}</span>
          <span>${siteData.home.trustedTitle}</span>
          <span>${siteData.home.trustedTitle}</span>
        </div>
      </div>
      <div class="site-container split-grid split-grid--feature section-shell section-shell--editorial">
        <div class="surface-card surface-card--editorial-intro reveal">
          <p class="section-label">${siteData.home.behindDesigns.eyebrow}</p>
          <h2 class="section-title">${siteData.home.behindDesigns.title}</h2>
          <p class="lede">${siteData.home.behindDesigns.text}</p>
          ${renderButton(siteData.home.behindDesigns.ctaLabel, siteData.home.behindDesigns.ctaHref, "dark")}
        </div>
        <div class="section-shell__media reveal">
          ${renderPlaceholder("Editorial showcase placeholder", "portrait", "light")}
        </div>
      </div>
    </section>

    <section class="page-section page-section--feature-lead">
      <div class="site-container">
        ${renderSectionHeader(siteData.home.featured.eyebrow, siteData.home.featured.title, siteData.home.featured.text, "", {
          className: "section-header--split",
          contentClass: "section-header__content--compact",
        })}
        <div class="project-grid project-grid--feature">
          ${featuredProjects.map((project) => renderProjectCard(project, "feature")).join("")}
        </div>
      </div>
    </section>

    <section class="page-section page-section--soft page-section--approach">
      <div class="site-container">
        ${renderSectionHeader(siteData.home.approach.eyebrow, siteData.home.approach.title, siteData.home.approach.text, "", {
          className: "section-header--narrow",
          contentClass: "section-header__content--narrow",
        })}
        <div class="card-grid card-grid--four card-grid--approach">
          ${siteData.home.approach.items
            .map(
              (item) => `
            <article class="surface-card surface-card--approach reveal">
              <h3 class="card-title">${item.title}</h3>
              <p class="card-copy">${item.text}</p>
            </article>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="page-section page-section--services-home">
      <div class="site-container split-grid split-grid--feature section-shell section-shell--services">
        <div class="surface-card surface-card--services-intro reveal">
          <p class="section-label">${siteData.home.services.eyebrow}</p>
          <h2 class="section-title">${siteData.home.services.title}</h2>
          <p class="lede">${siteData.home.services.text}</p>
          <p class="supporting-text">${siteData.home.services.subheading}</p>
          ${renderButton(siteData.home.services.ctaLabel, siteData.home.services.ctaHref, "dark")}
        </div>
        <div class="card-grid card-grid--stacked card-grid--services">
          ${siteData.home.services.items
            .map(
              (item) => `
            <article class="surface-card surface-card--service-item reveal">
              <p class="card-kicker">${item.kicker}</p>
              <h3 class="card-title">${item.title}</h3>
              <p class="card-copy">${item.text}</p>
            </article>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>

    ${renderCtaBand()}

    <section class="page-section page-section--process">
      <div class="site-container">
        ${renderSectionHeader(siteData.home.process.eyebrow, siteData.home.process.title, siteData.home.process.text, "", {
          className: "section-header--process",
          contentClass: "section-header__content--narrow",
        })}
        <div class="timeline-grid timeline-grid--process">
          ${siteData.home.process.steps
            .map(
              (step) => `
            <article class="timeline-card timeline-card--process reveal">
              <span class="timeline-card__number">${step.number}</span>
              <h3 class="card-title">${step.title}</h3>
              <p class="card-copy">${step.text}</p>
            </article>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="page-section page-section--soft">
      <div class="site-container">
        ${renderSectionHeader(
          siteData.home.moreProjects.eyebrow,
          siteData.home.moreProjects.title,
          siteData.home.moreProjects.text,
          renderButton(siteData.home.moreProjects.buttonLabel, siteData.home.moreProjects.buttonHref, "dark"),
          {
            className: "section-header--split",
            contentClass: "section-header__content--compact",
          },
        )}
        <div class="pillars-grid reveal">
          ${siteData.home.moreProjects.pillars
            .map(
              (item) => `
            <div class="pillar-pill">
              <span>#${item.number}</span>
              <span>${item.label}</span>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="carousel-shell reveal">
          <div class="carousel-actions">
            <button class="carousel-button" type="button" data-carousel-prev aria-label="Previous projects">&larr;</button>
            <button class="carousel-button" type="button" data-carousel-next aria-label="Next projects">&rarr;</button>
          </div>
          <div class="carousel-track" data-carousel-track>
            ${siteData.projects.map((project) => renderProjectCard(project, "carousel")).join("")}
          </div>
        </div>
      </div>
    </section>

    <section class="page-section page-section--about-teaser">
      <div class="site-container split-grid split-grid--feature section-shell section-shell--about-teaser">
        <div class="surface-card surface-card--values reveal">
          <p class="section-label">${siteData.home.values.eyebrow}</p>
          <h2 class="section-title">${siteData.home.values.title}</h2>
          <p class="lede">${siteData.home.values.text}</p>
          <div class="card-grid card-grid--two compact-grid">
            ${siteData.home.values.items
              .map(
                (item) => `
              <article class="mini-card">
                <h3 class="mini-card__title">${item.title}</h3>
                <p class="mini-card__copy">${item.text}</p>
              </article>
            `,
              )
              .join("")}
          </div>
        </div>
        <div class="surface-card surface-card--about-teaser reveal">
          <p class="section-label">${siteData.home.aboutTeaser.eyebrow}</p>
          <h2 class="section-title">${siteData.home.aboutTeaser.title}</h2>
          <p class="supporting-text">${siteData.home.aboutTeaser.subtitle}</p>
          ${siteData.home.aboutTeaser.body.map((paragraph) => `<p class="card-copy">${paragraph}</p>`).join("")}
          ${renderButton(siteData.home.aboutTeaser.buttonLabel, siteData.home.aboutTeaser.buttonHref, "dark")}
        </div>
      </div>
    </section>

    <section class="page-section page-section--soft page-section--services-gallery">
      <div class="site-container">
        ${renderSectionHeader(siteData.home.servicesGallery.eyebrow, siteData.home.servicesGallery.title, siteData.home.servicesGallery.text, "", {
          className: "section-header--split",
          contentClass: "section-header__content--compact",
        })}
        <div class="card-grid card-grid--three">
          ${siteData.home.servicesGallery.items
            .map(
              (item, index) => `
            <article class="surface-card reveal">
              ${renderPlaceholder(`Service image placeholder ${index + 1}`, "card", "light")}
              <h3 class="card-title">${item}</h3>
            </article>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="page-section page-section--pricing" id="pricing">
      <div class="site-container">
        ${renderSectionHeader(siteData.home.pricing.eyebrow, siteData.home.pricing.title, siteData.home.pricing.text, "", {
          className: "section-header--split",
          contentClass: "section-header__content--compact",
        })}
        <div class="pricing-grid">
          ${siteData.home.pricing.plans
            .map(
              (plan) => `
            <article class="pricing-card reveal ${plan.badge ? "pricing-card--featured" : ""}">
              <div class="pricing-card__top">
                <div>
                  <h3 class="card-title">${plan.name}</h3>
                  ${plan.badge ? `<span class="badge">${plan.badge}</span>` : ""}
                </div>
                <div>
                  <p class="pricing-card__price">${plan.price}</p>
                  <p class="pricing-card__cadence">${plan.cadence}</p>
                </div>
              </div>
              <p class="card-copy">${plan.description}</p>
              <ul class="feature-list">
                ${plan.features.map((feature) => `<li>${feature}</li>`).join("")}
              </ul>
              ${renderButton(plan.buttonLabel, plan.buttonHref, plan.badge ? "accent" : "dark")}
            </article>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>

    ${renderFaqSection()}
  `;
}

function renderAboutPage() {
  return `
    ${renderStandardHero(siteData.about.heroEyebrow, siteData.about.heroTitle, siteData.about.heroSubtitle, siteData.about.heroText)}

    <section class="page-section">
      <div class="site-container split-grid split-grid--feature section-shell section-shell--about-story">
        <div class="surface-card surface-card--story reveal">
          <p class="section-label">${siteData.about.story.eyebrow}</p>
          <h2 class="section-title">${siteData.about.story.title}</h2>
          <p class="supporting-text">${siteData.about.story.subtitle}</p>
          ${siteData.about.story.body.map((paragraph) => `<p class="card-copy">${paragraph}</p>`).join("")}
        </div>
        <div class="about-media-stack reveal">
          ${renderPlaceholder("Studio portrait placeholder", "portrait", "light")}
          ${renderPlaceholder("Process board placeholder", "card", "light")}
        </div>
      </div>
    </section>

    <section class="page-section page-section--soft">
      <div class="site-container">
        <div class="cta-panel reveal">
          <div>
            <p class="section-label">${siteData.about.ctaPanel.eyebrow}</p>
            <h2 class="section-title">${siteData.about.ctaPanel.title}</h2>
            <p class="lede">${siteData.about.ctaPanel.text}</p>
          </div>
          <div class="cta-panel__action">
            ${renderButton(siteData.about.ctaPanel.buttonLabel, siteData.about.ctaPanel.buttonHref, "accent")}
          </div>
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="site-container">
        ${renderSectionHeader(siteData.about.recentWork.eyebrow, siteData.about.recentWork.title, siteData.about.recentWork.text, "", {
          className: "section-header--split",
          contentClass: "section-header__content--compact",
        })}
        <div class="card-grid card-grid--four">
          ${siteData.about.recentWork.items
            .map(
              (item, index) => `
            <article class="surface-card reveal">
              ${renderPlaceholder(`Recent work placeholder ${index + 1}`, "card", "light")}
              <p class="card-kicker">${item.category}</p>
              <h3 class="card-title">${item.title}</h3>
              <p class="card-copy">${item.text}</p>
              <span class="year-chip">${item.year}</span>
            </article>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>

    ${renderCtaBand()}

    <section class="page-section page-section--dark" id="services">
      <div class="site-container">
        ${renderSectionHeader(
          siteData.about.services.eyebrow,
          siteData.about.services.title,
          siteData.about.services.text,
          renderButton(siteData.about.services.ctaLabel, siteData.about.services.ctaHref),
          {
            className: "section-header--split",
            contentClass: "section-header__content--compact",
          },
        )}
        <div class="card-grid card-grid--four">
          ${siteData.about.services.items
            .map(
              (item) => `
            <article class="surface-card surface-card--dark reveal">
              <h3 class="card-title">${item.title}</h3>
              <p class="card-copy">${item.text}</p>
            </article>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="page-section page-section--soft">
      <div class="site-container">
        ${renderSectionHeader(siteData.about.awards.eyebrow, siteData.about.awards.title, siteData.about.awards.text, "", {
          className: "section-header--split",
          contentClass: "section-header__content--compact",
        })}
        <div class="awards-list">
          ${siteData.about.awards.items
            .map(
              (item) => `
            <article class="award-row reveal">
              <div>
                <h3 class="card-title">${item.name}</h3>
                <p class="supporting-text">${item.year}</p>
              </div>
              <div>
                <p class="award-row__award">${item.award}</p>
                <p class="card-copy">${item.text}</p>
              </div>
            </article>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>

    ${renderCtaBand()}
    ${renderFaqSection()}
  `;
}

function renderProjectsPage() {
  return `
    ${renderStandardHero(siteData.projectsPage.heroEyebrow, siteData.projectsPage.heroTitle, siteData.projectsPage.heroSubtitle, siteData.projectsPage.heroText)}

    <section class="page-section">
      <div class="site-container">
        ${renderSectionHeader(
          siteData.projectsPage.introEyebrow,
          siteData.projectsPage.introTitle,
          siteData.projectsPage.introText,
          renderButton(siteData.projectsPage.ctaLabel, siteData.projectsPage.ctaHref, "dark"),
          {
            className: "section-header--split",
            contentClass: "section-header__content--compact",
          },
        )}
        <div class="project-grid project-grid--archive">
          ${siteData.projects.map((project) => renderProjectCard(project, "archive")).join("")}
        </div>
      </div>
    </section>

    ${renderCtaBand()}
    ${renderFaqSection()}
  `;
}

function renderContactPage() {
  return `
    ${renderStandardHero(siteData.contact.heroEyebrow, siteData.contact.heroTitle, "", siteData.contact.heroText)}

    <section class="page-section">
      <div class="site-container split-grid split-grid--feature section-shell section-shell--contact-intro">
        <div class="surface-card surface-card--contact-intro reveal">
          <p class="section-label">${siteData.contact.introEyebrow}</p>
          <h2 class="section-title">${siteData.contact.introTitle}</h2>
          <p class="lede">${siteData.contact.introText}</p>
          <p class="card-copy">${siteData.contact.introBody}</p>
          <div class="card-grid card-grid--stacked compact-grid">
            ${siteData.contact.support
              .map(
                (item) => `
              <article class="mini-card mini-card--soft">
                <h3 class="mini-card__title">${item.title}</h3>
                <p class="mini-card__copy">${item.text}</p>
              </article>
            `,
              )
              .join("")}
          </div>
        </div>
        <div class="surface-card surface-card--contact-form reveal">
          <h2 class="section-title section-title--small">${siteData.contact.form.title}</h2>
          <form class="contact-form" novalidate data-contact-form>
            ${siteData.contact.form.fields
              .map((field) =>
                field.type === "textarea"
                  ? `
              <label class="form-field">
                <span>${field.label}${field.required ? " *" : ""}</span>
                <textarea name="${field.name}" placeholder="${field.placeholder}" ${field.required ? "required" : ""} rows="6"></textarea>
              </label>
            `
                  : `
              <label class="form-field">
                <span>${field.label}${field.required ? " *" : ""}</span>
                <input type="${field.type}" name="${field.name}" placeholder="${field.placeholder}" ${field.required ? "required" : ""} />
              </label>
            `,
              )
              .join("")}
            <div class="form-feedback" data-form-feedback aria-live="polite"></div>
            <button class="button-pill button-pill--accent button-pill--submit" type="submit">
              <span>Send inquiry</span>
              <span class="button-pill__icon">&rarr;</span>
            </button>
          </form>
        </div>
      </div>
    </section>

    ${renderCtaBand()}

    <section class="page-section page-section--soft">
      <div class="site-container split-grid split-grid--feature section-shell section-shell--quick-answers">
        <div class="surface-card surface-card--quick-answers-intro reveal">
          <p class="section-label">${siteData.contact.quickAnswers.eyebrow}</p>
          <h2 class="section-title">${siteData.contact.quickAnswers.title}</h2>
          <p class="lede">${siteData.contact.quickAnswers.text}</p>
          ${renderButton(siteData.contact.quickAnswers.buttonLabel, siteData.contact.quickAnswers.buttonHref, "dark")}
        </div>
        <div class="surface-card surface-card--quick-answers-media reveal">
          ${renderPlaceholder("Contact showcase placeholder", "wide", "light")}
          <div class="card-grid card-grid--stacked compact-grid quick-answer-grid">
            ${siteData.contact.quickAnswers.items
              .map(
                (item) => `
              <article class="mini-card mini-card--soft">
                <h3 class="mini-card__title">${item.question}</h3>
                <p class="mini-card__copy">${item.answer}</p>
              </article>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderProjectDetailPage() {
  const relatedProjects = siteData.projects.filter((project) => project.slug !== currentProject.slug).slice(0, 3);

  return `
    <section class="hero hero--detail">
      <div class="site-container hero__detail-grid">
        <div class="reveal">
          <p class="section-label section-label--accent">${currentProject.year}</p>
          <h1 class="display-title display-title--detail">${currentProject.title}</h1>
          <div class="project-meta">
            <div><span>#</span><span>Client</span><strong>${currentProject.client}</strong></div>
            <div><span>#</span><span>Category</span><strong>${currentProject.category}</strong></div>
            <div><span>#</span><span>Year</span><strong>${currentProject.year}</strong></div>
          </div>
          ${renderButton("View site", "#", "light", true)}
        </div>
        <div class="reveal">
          ${renderPlaceholder("Project hero placeholder", "feature", "dark")}
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="site-container split-grid split-grid--feature">
        <div class="surface-card reveal">
          <p class="card-copy card-copy--large">${currentProject.leadA}</p>
          <p class="card-copy">${currentProject.leadB}</p>
        </div>
        <div class="surface-card reveal">
          <div class="detail-stat">
            <span>Client</span>
            <strong>${currentProject.client}</strong>
          </div>
          <div class="detail-stat">
            <span>Category</span>
            <strong>${currentProject.category}</strong>
          </div>
          <div class="detail-stat">
            <span>Year</span>
            <strong>${currentProject.year}</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="page-section page-section--soft">
      <div class="site-container card-grid card-grid--three">
        <article class="surface-card reveal">
          <p class="card-kicker">Challenge</p>
          <p class="card-copy">${currentProject.challenge}</p>
        </article>
        <article class="surface-card reveal">
          <p class="card-kicker">Goal</p>
          <p class="card-copy">${currentProject.goal}</p>
        </article>
        <article class="surface-card reveal">
          <p class="card-kicker">Result</p>
          <p class="card-copy">${currentProject.result}</p>
        </article>
      </div>
    </section>

    <section class="page-section">
      <div class="site-container">
        ${renderSectionHeader("More Projects", "Explore More Work", "Curious to see what else I’ve been working on?", renderButton("Get in touch", "/contact", "dark"), {
          className: "section-header--split",
          contentClass: "section-header__content--compact",
        })}
        <div class="project-grid project-grid--feature">
          ${relatedProjects.map((project) => renderProjectCard(project, "feature")).join("")}
        </div>
      </div>
    </section>

    ${renderCtaBand()}
    ${renderFaqSection()}
  `;
}

function renderNotFoundPage() {
  return `
    ${renderStandardHero(siteName, "Page Not Found", "This route is unavailable.", "Use the menu to jump back to the homepage, projects, contact, or one of the available project detail pages.")}
    <section class="page-section">
      <div class="site-container">
        <div class="cta-panel reveal">
          <div>
            <p class="section-label">Available Routes</p>
            <h2 class="section-title">Browse the available pages</h2>
            <p class="lede">Home, About, Projects, Contact, and the six project detail pages are all wired up in the current Vite multipage shell.</p>
          </div>
          <div class="cta-panel__action">
            ${renderButton("Back to Home", "/", "accent")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderStandardHero(eyebrow, title, subtitle, text) {
  return `
    <section class="hero hero--standard">
      <div class="site-container hero__standard-inner">
        <div class="reveal">
          <p class="section-label">${eyebrow}</p>
          <h1 class="display-title display-title--page">${title}</h1>
          ${subtitle ? `<p class="supporting-text supporting-text--hero">${subtitle}</p>` : ""}
          <p class="lede">${text}</p>
        </div>
        <div class="reveal">
          ${renderPlaceholder("Page media placeholder", "wide", "light")}
        </div>
      </div>
    </section>
  `;
}

function renderSectionHeader(eyebrow, title, text, action = "", options = {}) {
  const rootClasses = ["section-header", "reveal", options.className].filter(Boolean).join(" ");
  const contentClasses = ["section-header__content", options.contentClass].filter(Boolean).join(" ");
  const titleClasses = ["section-title", options.titleClass].filter(Boolean).join(" ");
  const textClasses = ["lede", options.textClass].filter(Boolean).join(" ");

  return `
    <div class="${rootClasses}">
      <div class="${contentClasses}">
        <p class="section-label">${eyebrow}</p>
        <h2 class="${titleClasses}">${title}</h2>
        <p class="${textClasses}">${text}</p>
      </div>
      ${action ? `<div class="section-header__action">${action}</div>` : ""}
    </div>
  `;
}

function renderProjectCard(project, variant) {
  return `
    <article class="project-card project-card--${variant} reveal">
      <a class="project-card__link" href="/projects/${project.slug}">
        ${renderPlaceholder(`${project.title} placeholder`, variant === "carousel" ? "card" : "project", "light")}
        <div class="project-card__meta">
          <div>
            <h3 class="card-title">${project.title}</h3>
            <p class="card-copy">${project.cardText}</p>
          </div>
          <span class="project-card__action">View</span>
        </div>
      </a>
    </article>
  `;
}

function renderFaqSection() {
  return `
    <section class="page-section page-section--faq">
      <div class="site-container split-grid split-grid--feature faq-layout">
        <div class="surface-card surface-card--faq-intro reveal">
          <p class="section-label">${siteData.faq.eyebrow}</p>
          <h2 class="section-title">${siteData.faq.title}</h2>
          <p class="lede">${siteData.faq.text}</p>
          ${renderButton(siteData.faq.linkLabel, siteData.faq.linkHref, "dark")}
        </div>
        <div class="faq-list reveal" data-faq-list>
          ${siteData.faq.items
            .map(
              (item, index) => `
            <article class="faq-item">
              <button class="faq-item__trigger" type="button" aria-expanded="false" aria-controls="faq-panel-${index}" data-faq-trigger>
                <span>${item.question}</span>
                <span class="faq-item__icon">+</span>
              </button>
              <div class="faq-item__panel" id="faq-panel-${index}" hidden>
                <p>${item.answer}</p>
              </div>
            </article>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderCtaBand() {
  return `
    <section class="page-section page-section--dark page-section--cta">
      <div class="site-container">
        <div class="cta-band reveal">
          <div>
            <p class="section-label section-label--accent">${siteData.globalCta.eyebrow}</p>
            <h2 class="section-title section-title--on-dark">${siteData.globalCta.title}</h2>
            <p class="lede lede--on-dark">${siteData.globalCta.text}</p>
          </div>
          <div class="cta-band__action">
            ${renderButton(siteData.globalCta.buttonLabel, siteData.globalCta.buttonHref, "accent")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPlaceholder(label, variant, tone) {
  return `
    <div class="placeholder-block placeholder-block--${variant} placeholder-block--${tone}">
      <span class="placeholder-block__eyebrow">Placeholder</span>
      <span class="placeholder-block__label">${label}</span>
    </div>
  `;
}

function renderButton(label, href, variant = "light", inert = false) {
  return `
    <a class="button-pill button-pill--${variant}" href="${inert ? "#" : href}" ${inert ? 'data-inert-link="true" aria-disabled="true"' : ""}>
      <span>${label}</span>
      <span class="button-pill__icon">&rarr;</span>
    </a>
  `;
}

function renderInlineLink(label, href, inert = false, stacked = false) {
  return `<a class="inline-link ${stacked ? "inline-link--stacked" : ""} ${isActive(href) ? "is-active" : ""}" href="${inert ? "#" : href}" ${inert ? 'data-inert-link="true" aria-disabled="true"' : ""}>${label}</a>`;
}

function renderNavLink(item) {
  const classes = ["menu-drawer__link"];
  if (isActive(item.href)) classes.push("is-active");
  if (item.primary) classes.push("menu-drawer__link--primary");
  return `<a class="${classes.join(" ")}" href="${item.href}">${item.label}</a>`;
}

function renderBrandMark(className = "") {
  const classes = ["brand-mark", className].filter(Boolean).join(" ");
  return `
    <a class="${classes}" href="/" aria-label="${siteName} home">
      <span>${siteName}</span>
      <span class="brand-mark__accent">&reg;</span>
    </a>
  `;
}

function renderLineBreaks(value) {
  return value.replace(/\n/g, "<br />");
}

function collapseWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isActive(href) {
  const baseHref = href.split("#")[0].replace(/\/$/, "") || "/";
  if (href === "/#pricing") return currentPath === "/";
  if (href === "/about/#services") return currentPath === "/about";
  return currentPath === baseHref;
}

function wireInteractions() {
  wireMenu();
  wireFaq();
  wireContactForm();
  wireCarousel();
  wireReveal();
  wireInertLinks();
  wireHeaderState();
  window.addEventListener("hashchange", syncHashScroll);
}

function syncHashScroll() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;
  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function wireMenu() {
  const drawer = document.querySelector("[data-menu-drawer]");
  const toggles = document.querySelectorAll("[data-menu-toggle]");
  const closers = document.querySelectorAll("[data-menu-close]");
  if (!drawer || toggles.length === 0) return;

  const setOpen = (open) => {
    drawer.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    toggles.forEach((toggle) => toggle.setAttribute("aria-expanded", String(open)));
  };

  toggles.forEach((toggle) => toggle.addEventListener("click", () => setOpen(true)));
  closers.forEach((closer) => closer.addEventListener("click", () => setOpen(false)));
  drawer.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function wireFaq() {
  document.querySelectorAll("[data-faq-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      const panel = trigger.parentElement.querySelector(".faq-item__panel");
      trigger.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  });
}

function wireContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const feedback = form.querySelector("[data-form-feedback]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const issues = [];

    form.querySelectorAll("[required]").forEach((field) => {
      const value = String(formData.get(field.name) || "").trim();
      field.classList.toggle("is-invalid", value.length === 0);
      if (!value.length) issues.push(field.name);
      if (field.type === "email" && value.length > 0) {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        field.classList.toggle("is-invalid", !valid);
        if (!valid) issues.push("email-format");
      }
    });

    if (issues.length) {
      feedback.textContent = "Please complete the required fields and enter a valid email address.";
      feedback.classList.add("is-error");
      feedback.classList.remove("is-success");
      return;
    }

    feedback.textContent = "Thanks. This front-end demo does not submit anywhere yet.";
    feedback.classList.remove("is-error");
    feedback.classList.add("is-success");
    form.reset();
  });
}

function wireCarousel() {
  const track = document.querySelector("[data-carousel-track]");
  const previous = document.querySelector("[data-carousel-prev]");
  const next = document.querySelector("[data-carousel-next]");
  if (!track || !previous || !next) return;

  previous.addEventListener("click", () => {
    track.scrollBy({ left: -track.clientWidth * 0.9, behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    track.scrollBy({ left: track.clientWidth * 0.9, behavior: "smooth" });
  });
}

function wireReveal() {
  const revealables = document.querySelectorAll(".reveal");
  revealables.forEach((item) => {
    const bounds = item.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.92) {
      item.classList.add("is-visible");
    }
  });
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
  );

  revealables.forEach((item) => observer.observe(item));
}

function wireInertLinks() {
  const toast = document.querySelector("[data-toast]");
  let timeoutId;

  document.querySelectorAll("[data-inert-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      toast.hidden = false;
      toast.classList.add("is-visible");
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        toast.classList.remove("is-visible");
        toast.hidden = true;
      }, 1800);
    });
  });
}

function wireHeaderState() {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}
