---
name: folioblox-design-language
description: Use this skill when rebuilding, extending, or adapting a website to follow the Folioblox design language. Trigger for tasks that require adopting its visual system, spacing rhythm, motion tone, grid behavior, page structure, navigation model, section composition, card patterns, CTA treatment, or editorial portfolio feel across other websites. Do not trigger for backend-only work, unrelated dashboard/admin UI work, brand-new visual directions, or cases where the user explicitly wants a different design language.
---

# Folioblox Design Language Skill

You are adopting the **Folioblox** website language as a reusable system for other websites.

Your job is **not** to copy portfolio-specific text or blindly clone one page.
Your job is to transfer the **design language**, **spacing rhythm**, **motion behavior**, **grid logic**, **navigation structure**, and **page-building rules** into the target site while preserving the target brand’s own content.

This is a **design-system adaptation skill**.
Treat Folioblox as the reference grammar.

---

## What this skill is for

Use this skill when the user wants to:

- rebuild another website in the Folioblox style
- adopt the Folioblox visual language across a different brand
- transfer its spacing rhythm and page structure into another codebase
- reproduce its editorial portfolio feel in Next.js, React, Framer, Webflow, or static HTML/CSS
- create new pages that feel native to the Folioblox template
- standardize navigation, sections, cards, CTA blocks, pricing, FAQ, or footer patterns to match Folioblox

Do **not** use this skill when:

- the task is backend-only
- the user wants a different aesthetic direction
- the project is an internal dashboard, ERP, or dense data application
- the target site should be playful, brutalist, ultra-corporate, neon, or highly experimental
- the user wants a direct pixel clone rather than a reusable design adaptation

---

## Core mission

When this skill is active:

1. Extract the structural rules of the reference design.
2. Map those rules onto the target site’s content and goals.
3. Preserve the same **feel**, **composition discipline**, and **interaction tone**.
4. Avoid injecting generic SaaS UI patterns.
5. Produce work that looks like it belongs to the same design family.

---

## Non-negotiable design principles

### 1. Editorial, not corporate
The interface should feel like a carefully art-directed portfolio or creative services site.
It must feel polished, warm, and deliberate.
Do not let it drift into generic startup landing-page styling.

### 2. Spacious, not crowded
Whitespace is part of the design language.
Do not compress sections.
Do not stack content too tightly.
Large vertical breathing room is required.

### 3. Typography drives hierarchy
Large headings, restrained supporting text, and concise microcopy do most of the visual work.
Do not rely on decorative UI to create importance.

### 4. Warm minimalism
The palette is mostly light and restrained, with warm neutrals and selective accent use.
Do not make the interface cold, sterile, or over-saturated.

### 5. Motion is subtle and premium
Use soft reveal, fade, rise, hover, and micro-transition patterns.
Never use noisy, exaggerated, bouncy, or novelty motion.

### 6. Modular page construction
Pages should be built from repeatable section bands.
Each section must feel intentional and internally balanced.

### 7. CTA rhythm is consistent
CTAs recur at meaningful intervals.
They are not random.
They act as structural anchors in the page narrative.

---

## Design language to adopt

### Overall feel
Use this tone:

- premium
- calm
- warm
- modern editorial
- creative professional
- image-forward
- minimal but not sterile
- structured but not rigid
- confident without being loud

### Visual character
The site should feel like:

- a creative studio
- a portfolio-driven service business
- a polished independent designer or boutique agency
- a premium but approachable web presence

### Avoid
Do not introduce:

- glass-heavy SaaS UI
- startup gradient overload
- heavy shadow stacks
- overuse of pills, chips, and badges
- enterprise dashboard conventions
- dense boxed layouts
- gratuitous icon clutter
- loud hover gimmicks
- random visual motifs not already aligned with the reference grammar

---

## Color system

Use the reference palette family as the starting point, then adapt carefully to the target brand if needed.

### Base palette
- Background light: `#FFFFFF`
- Secondary neutral: `#BCBCBC`
- Primary text: `#0C0804`
- Warm dark secondary: `#51321E`
- Warm muted text: `#6A4F35`
- Accent rust: `#BB4426`
- Accent sand: `#C89363`

### Color rules
- The page should remain predominantly light.
- Use the darkest tone for primary text and strong anchors.
- Use warm muted brown-neutrals instead of cool gray whenever possible.
- Accent colors must be used sparingly.
- Borders should be soft and understated.
- Never let the accent dominate the page.
- The design should feel premium before it feels colorful.

### Practical token guidance
Prefer setting tokens like:

- `--bg`
- `--surface`
- `--surface-alt`
- `--text`
- `--text-muted`
- `--border`
- `--accent`
- `--accent-soft`

If the target brand has its own palette, preserve the **value structure** and **contrast logic** of Folioblox even when actual hues change.

---

## Typography system

### Typography role
Typography is the main hierarchy engine.

### Rules
- Use a clean, premium, editorial-feeling type system.
- Preserve strong contrast between hero, section heading, body text, and labels.
- Headings should feel intentional and composed, not oversized for effect alone.
- Body text should be readable, soft, and not too dense.
- Labels and small headings should feel refined and slightly structured.

### Recommended hierarchy behavior
- Eyebrow / section label: small, crisp, often uppercase or tightly styled
- Hero headline: large, dominant, minimal line count
- Section heading: clear and editorial
- Body copy: concise and clean
- Card title: strong but compact
- Metadata / labels / years / plan names: small and disciplined

### Do not
- use default-looking typography without refinement
- flatten heading hierarchy
- use extra-condensed novelty fonts
- create overly long text blocks
- make cards text-heavy

---

## Spacing rhythm

Spacing is one of the most important transferable traits.

### Section rhythm
- Major sections need generous vertical separation.
- Internal content spacing must also remain open and calm.
- Section intros should breathe before grids or cards begin.
- Repeat spacing patterns consistently.

### Spacing behavior
Use a scale like:
- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64
- 96
- 128

Bias toward:
- `24–32` for local spacing
- `48–64` for section internals
- `96–128` for large section breaks

### Important rule
Do not solve layout problems by shrinking spacing.
Solve them by restructuring content density.

---

## Grid system

### General grid behavior
The grid is clean, modular, and editorial.
It should feel flexible rather than strictly dashboard-like.

### Desktop
- Use wide containers.
- Allow image/text relationships to breathe.
- Use multi-column sections where appropriate.
- Keep alignment consistent across repeated modules.

### Tablet
- Reduce column count carefully.
- Preserve hierarchy and whitespace.
- Do not collapse everything too early.

### Mobile
- Stack naturally.
- Preserve generous padding.
- Keep major headings large enough to maintain tone.
- Avoid cramped cards and tiny spacing.

### Grid rules
- Project cards should align cleanly.
- Text blocks should not run too wide.
- Sections should share a consistent content width strategy.
- Use asymmetry only when it still feels composed.

---

## Border radius, borders, and surfaces

### Radius
Use soft, modern radius values.
Cards and media should feel gently rounded, not sharp and not bubble-like.

### Borders
Use thin, subtle borders.
They should support composition, not shout for attention.

### Surfaces
Use mostly flat light surfaces with slight differentiation when needed.
Do not rely on deep shadow to separate elements.

### Shadows
Keep shadows extremely restrained.
Only use soft elevation where it helps clarity.

---

## Motion system

### Motion tone
Motion should feel:
- deliberate
- soft
- premium
- restrained
- responsive

### Preferred motion patterns
- fade-in on entry
- slight upward translate on reveal
- staggered card reveals
- subtle hover transitions
- soft image scaling or surface shifts
- refined accordion motion
- smooth CTA hover transitions

### Motion constraints
- no bounce-heavy animation
- no parallax spectacle unless the page clearly benefits
- no random animation variety
- no flashy transform effects
- no long delayed entrances that harm usability

### Timing guidance
Keep motion snappy and polished.
Favor consistency over novelty.

---

## Navigation model

The reference uses a very simple top navigation with a brand mark and a small set of key routes.

### Navigation rules
The primary navigation should stay concise.
Typical top-level pattern:

- Home
- About
- Projects / Work
- Pricing or Services
- Get in touch / Contact

### Navigation behavior
- Keep the nav minimal
- Make the CTA visible and direct
- Avoid mega menus
- Avoid crowded nav bars
- The brand should sit clearly as a left anchor
- The right side should remain light and uncluttered

### Adaptation rule
If the target site needs more than 5–6 top-level items, compress or regroup them rather than breaking the design language.

---

## Page structure model

Adopt the reference page-building logic.

### Home page pattern
Use a sequence like:

1. Minimal navbar
2. Hero with role/value statement and primary supporting content
3. Trust / logo strip or credibility band
4. Intro or “about the work” section
5. Featured work / featured items grid
6. Approach / principles section
7. Services section
8. Mid-page CTA banner
9. Process section
10. Additional specialization or work section
11. Pricing
12. FAQ
13. Footer

### About page pattern
Use a sequence like:

1. Minimal navbar
2. About hero
3. Personal/company narrative block
4. Collaboration or values CTA
5. Recent work or highlights
6. Services recap
7. Awards / credibility / recognition if relevant
8. CTA band
9. Footer

### Projects / Work page pattern
Use a sequence like:

1. Minimal navbar
2. Page hero
3. Work intro
4. Project grid
5. CTA band
6. FAQ or secondary reassurance block
7. Footer

### Pricing page pattern
Use a sequence like:

1. Minimal navbar
2. Pricing hero
3. Pricing cards
4. FAQ or reassurance section
5. CTA
6. Footer

### Contact page pattern
Use a sequence like:

1. Minimal navbar
2. Contact hero
3. Primary contact method or form
4. Short reassurance copy
5. Footer

---

## Section composition rules

Each section should usually follow this internal rhythm:

1. Eyebrow or section label
2. Headline
3. Supporting sentence or paragraph
4. Optional CTA
5. Main visual or structured content block

### Rule
Do not skip hierarchy.
Do not dump content directly into a grid without framing it.

---

## Hero system

### Hero anatomy
A hero in this design language typically includes:

- a short intro phrase or role marker
- a strong headline
- a compact positioning paragraph
- a support block such as services, list, stats, or an image
- one clear CTA

### Hero behavior
- Keep copy short
- Let the headline dominate
- Use supporting content sparingly
- The hero should feel composed, not overloaded

### Do not
- use long multi-paragraph hero copy
- add too many buttons
- overload with badges and trust chips
- turn the hero into a dashboard of facts

---

## Project and content cards

### Project card behavior
Cards are image-first and editorial.

### Card anatomy
- image
- title
- short supporting text
- simple action such as “View”

### Rules
- keep titles short
- keep descriptions concise
- preserve image prominence
- maintain even spacing and radius
- use soft borders or surface distinction where necessary

### Do not
- pack cards with excessive metadata
- add too many inline actions
- overcrowd with tags, pills, and icons
- make every card visually different

---

## Services and principles blocks

### Services
These are usually presented as concise, premium offerings.
Each service should have:
- small preface or cue line
- service title
- short description

### Approach / principles
Use a small set of focused points.
Keep them strategic and short.
The design should suggest clarity and confidence.

### Rule
These blocks should feel curated, not encyclopedic.

---

## CTA bands

CTA sections are a repeated structural signature.

### CTA anatomy
- small label
- inviting heading
- reassuring support copy
- one primary CTA
- optional supporting image

### CTA tone
Warm, calm, collaborative.
Never aggressive.
Never salesy.

### Placement
Use CTA bands:
- after major proof sections
- after services
- before footer when appropriate

---

## Pricing module

### Pricing behavior
Pricing is simple, structured, and readable.

### Pricing anatomy
- plan name
- optional badge
- price
- period
- fit statement
- short feature list
- CTA

### Rules
- 3 plans works best
- emphasize one plan subtly
- do not over-design the cards
- keep feature lists concise
- preserve premium restraint

---

## FAQ module

### FAQ behavior
FAQs are simple reassurance blocks.

### Rules
- keep questions direct
- answers should be brief
- motion should be smooth and light
- preserve whitespace around the accordion
- include a fallback CTA such as “Contact me” or equivalent

---

## Footer model

The footer should feel structured, useful, and light.

### Footer anatomy
- brand summary
- short brand statement
- CTA or contact link
- menu
- social links
- copyright

### Rules
- avoid oversized footer complexity
- use simple grouping
- preserve alignment and whitespace
- keep tone consistent with the rest of the site

---

## Content adaptation rules

When applying this skill to a non-portfolio site:

- keep the design language
- translate the section logic to the target business
- swap “Projects” for “Case Studies,” “Programs,” “Products,” or equivalent
- swap “Services” for the target offering model
- preserve the same narrative flow:
  intro → proof → method → offering → CTA → reassurance → footer

### Example mappings
- portfolio site → projects grid
- agency site → case studies
- productized service site → offer cards
- nonprofit site → impact stories
- consultant site → engagements or outcomes

### Important rule
Preserve the structure even when labels change.

---

## Rebuild workflow

Follow this order.

### Step 1: Inspect the target
Understand:
- current pages
- current content model
- business type
- number of routes
- brand constraints
- whether the site already has components

### Step 2: Map the reference grammar
Identify what from Folioblox should transfer:
- navigation simplicity
- wide containers
- hero structure
- section rhythm
- card composition
- CTA cadence
- pricing / FAQ / footer patterns

### Step 3: Build tokens first
Define:
- colors
- typography roles
- spacing scale
- radii
- borders
- shadows
- motion presets
- container widths

### Step 4: Build shared primitives
Create reusable:
- container
- section shell
- heading group
- button
- card
- project/work card
- CTA band
- pricing card
- FAQ item
- footer group

### Step 5: Build pages with section rhythm
Compose pages using the shared shells.
Do not style each page ad hoc.

### Step 6: Tune for responsiveness
Preserve feel on mobile.
Do not let the system collapse into cramped layout behavior.

### Step 7: Polish motion
Apply a restrained, consistent motion system.

### Step 8: Review against the reference language
Check:
- visual calm
- spacing
- headline hierarchy
- card simplicity
- CTA consistency
- footer structure

---

## Implementation guidance for code agents

If you are coding:

- centralize tokens
- create reusable components
- preserve semantic HTML
- keep layout primitives consistent
- do not hardcode arbitrary spacing values all over the codebase
- keep motion reusable
- use clean naming
- prefer maintainable composition over one-off styling

### In React / Next.js
Prefer a structure like:
- `components/layout`
- `components/sections`
- `components/ui`
- `lib/design-tokens`
- `styles/globals.css` or equivalent theme layer

### In Tailwind
Create reusable design tokens through:
- theme extension
- CSS variables
- utility composition
- shared component classes where appropriate

### In Framer
Preserve the same section-level rhythm and component reuse.
Do not let the page become a loose stack of unstructured frames.

---

## Constraints

Do not:

- invent a radically new design
- use generic SaaS defaults
- over-compress page sections
- overuse accent color
- add heavy shadows
- create dense nav menus
- flatten typography hierarchy
- over-animate the interface
- replace premium restraint with loud visual tricks

---

## Done when

This skill has been applied correctly when:

- the target site clearly feels like the Folioblox design family
- spacing rhythm is consistent and spacious
- navigation is minimal and clean
- page sections follow the same editorial logic
- motion is subtle and premium
- cards are image-forward and restrained
- CTA sections feel recurring and intentional
- typography carries the hierarchy
- the result looks polished, warm, and calm
- the target brand’s content fits naturally into the system

---

## Quality checklist

Before finishing, verify:

- Does the page feel editorial rather than corporate?
- Is the whitespace generous enough?
- Are headings doing the heavy lifting?
- Are cards simple and image-led?
- Is motion subtle?
- Is the nav concise?
- Is the page narrative clear?
- Do CTA sections recur at natural points?
- Does mobile still feel premium?
- Does the result preserve the reference language without blindly copying its content?

---

## Output expectations

When using this skill, produce one or more of the following depending on the task:

- a rebuilt page or site
- a page architecture plan
- a component specification
- a style token definition
- a migration plan from the current design to the adopted system
- code implementing the adapted design language

Always explain adaptation choices in terms of:
- hierarchy
- spacing
- structure
- motion
- component reuse
- design-family consistency

Do not explain choices with vague language like “modern” or “clean” unless you tie them to actual layout or system decisions.