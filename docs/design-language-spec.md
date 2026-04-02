# Al Hilal Product Design Language

## Status

Draft v1  
Date: April 3, 2026  
Applies to: `web`, `admin_dashboard`, `mobile`

## Purpose

This document defines a single design language for Al Hilal's public website, staff dashboard, and pilgrim app.

The goal is not to make the three products look identical. The goal is to make them feel like the same brand expressed through three different jobs:

- The website should build trust, explain clearly, and convert interest into consultation.
- The dashboard should help staff make correct decisions quickly with low cognitive load.
- The mobile app should feel calm, supportive, and pilgrim-centered before, during, and after travel.

## Brand North Star

Al Hilal should feel like a trusted pilgrimage companion from Kampala:

- Faith-aware, not performative
- Warm, not loud
- Premium, not flashy
- Human, not automated
- Clear, not sterile
- Structured, not bureaucratic

Working shorthand:

**Warm editorial pilgrimage hospitality**

This is the core expression across products.

## Product Roles

### Website

Primary role:

- Discovery
- Trust building
- Journey comparison
- Guidance and education
- Lead capture

Emotional target:

- Reassuring
- Dignified
- Aspirational
- Honest

The website should feel closest to boutique hospitality and editorial storytelling.

### Dashboard

Primary role:

- Operations
- Review
- Decision support
- Publishing truth
- Exception handling

Emotional target:

- Calm
- Precise
- Reliable
- Efficient

The dashboard should feel like the operational spine of the brand: more restrained than the website, but still recognizably Al Hilal.

### Mobile App

Primary role:

- Pilgrim support
- Readiness
- Trip-time guidance
- Documents and notifications
- Contact and reassurance

Emotional target:

- Steady
- Caring
- Guided
- Lightweight

The app should feel like a pocket companion, not a miniature website and not a staff tool.

## Shared Design Principles

### 1. Worship First

Design should never reduce pilgrimage to tourism packaging. Sacred purpose comes before sales energy.

### 2. Calm Clarity

Users should understand what is happening, what comes next, and where to go for help without friction.

### 3. Human Trust

The interface must repeatedly signal that real people, real support, and real accountability sit behind the experience.

### 4. Structured Warmth

Information should be ordered and disciplined, but never cold or over-systematized.

### 5. Truth Over Hype

Dates, statuses, package terms, and support expectations must be visually easy to compare and hard to misunderstand.

### 6. Belonging

The brand should feel rooted in Kampala, East African Muslim life, and the lived reality of first-timers, families, elders, and sponsor-assisted bookings.

## Visual Personality

The design language should combine:

- Hospitality warmth
- Editorial confidence
- Pilgrimage dignity
- Local specificity
- Operational discipline

It should avoid:

- Generic SaaS minimalism
- Loud luxury tropes
- Techno-futurist gradients as the main visual story
- Cartoonish religious symbolism
- Busy ornament that competes with content

## Color System

Use a shared semantic palette across products.

### Core Brand Colors

- Maroon: `#970246`
- Deep maroon: `#6C0535`
- Gold: `#F9A028`
- Deep gold: `#D4871D`

These are the emotional anchors of the brand and should remain stable.

### Neutrals

Shared warm neutrals should replace pure grayscale wherever possible:

- Page ivory: `#F7F3EE`
- Card ivory: `#FFFDFA`
- Warm surface: `#EFE5DA`
- Warm tint: `#F8EFE4`
- Strong ink: `#22181D`
- Soft ink: `#5D5056`
- Muted ink: `#6B5961`

### Semantic Usage

- `primary`: Al Hilal maroon
- `primary-strong`: deep maroon
- `accent`: gold
- `surface`: warm ivory by default
- `surface-raised`: card ivory
- `surface-muted`: warm sand
- `text-strong`: strong ink
- `text-default`: soft ink
- `text-muted`: muted ink
- `border-soft`: low-contrast warm border
- `success`: verified and complete
- `warning`: expiring, pending, caution
- `danger`: blocked, missing, rejected

### Product-Specific Use

Website:

- Use warm neutrals as the default canvas
- Use maroon and gold as emphasis, not wallpaper
- Prefer atmospheric gradients and subtle tinting over flat white

Dashboard:

- Use lighter neutral surfaces with stronger data contrast
- Maroon should mark key actions, active states, and publishing truth
- Gold should be rare and used for highlight states, never for dense UI

Mobile:

- Default to lighter surfaces for readability
- Preserve maroon as the primary action color
- Use gold as assistive emphasis for key pilgrim moments, not constant CTA color

## Typography

Typography should carry more of the brand.

### Type Roles

- Display and campaign headlines: high-character serif
- Interface headings and body copy: modern sans
- Data, codes, and admin artifacts: mono where needed in dashboard only

### Recommendation

Adopt a two-family system:

- Serif for display moments and key section headings
- Sans for body copy, controls, forms, tables, and labels

Suggested direction:

- Serif mood: elegant, warm, contemporary, editorial
- Sans mood: clean, readable, modern, humanist

### Usage Rules

- Website:
  - Use serif on H1 and selected H2 moments
  - Keep body copy sans
  - Use tighter headline tracking and stronger hierarchy than today
- Dashboard:
  - Default to sans everywhere
  - Use serif rarely, only for top-level empty states or strategic overview headings
- Mobile:
  - Default to sans for readability
  - Serif is optional for hero moments or onboarding only

### Tone

Type should feel:

- Considered
- Warm
- Adult
- Confident

It should not feel:

- Corporate
- Clinical
- Juvenile
- Hyper-luxury

## Layout Grammar

### Shared Rules

- Use clear blocks with visible grouping
- Prefer strong section rhythm over dense infinite feeds
- Keep one dominant message per screen
- Let trust proof and next-step actions appear early

### Shape Language

Primary geometry:

- Large rounded corners
- Soft rectangular cards
- Pill chips for status and proof markers
- Clean vertical stacks with generous spacing

This language already fits the website and should be normalized across dashboard and mobile.

### Spacing

Use spacious layouts that feel composed rather than crowded.

Shared rhythm:

- Tight: 8
- Standard: 16
- Sectional: 24
- Major: 32
- Hero or screen transition: 48 to 64

### Density by Product

Website:

- Lower density
- More breathing room
- Larger visual pauses between trust, education, and conversion blocks

Dashboard:

- Moderate density
- Compact enough for work, but never cramped
- Data views should still preserve section structure and scan lanes

Mobile:

- Comfortable single-column rhythm
- Thumb-friendly controls
- Strong separation between cards and support actions

## Components

### Cards

Cards are the main structural unit across all products.

Card tiers:

- Hero card
- Standard content card
- Data card
- Status card
- Support card

Shared card characteristics:

- Soft corners
- Warm borders
- Shallow to medium shadow
- Strong title hierarchy
- Limited internal decoration

### Buttons

Button hierarchy:

- Primary: maroon fill
- Secondary: bordered warm-surface button
- Accent: gold fill for special moments only
- Tertiary: inline text action

Rules:

- Gold should be reserved for the strongest or most emotionally important CTA on a screen
- Do not place multiple gold CTAs in the same block
- Dashboard should rely more on maroon and neutral actions than gold

### Status Indicators

Status should be consistent across products.

States:

- Draft
- Published
- Pending
- Verified
- Expiring
- Blocked
- Action needed

Use:

- Color plus label
- Never color alone
- Prefer pills or compact badges

### Tables and Data Views

Dashboard-specific:

- Use zebra-free clean rows by default
- Use whitespace and subtle dividers before adding more borders
- Keep action columns fixed and predictable
- Highlight exceptions and blockers before secondary data

### Forms

All forms should feel calm and intentional:

- Large, readable labels
- Strong field spacing
- Clear helper text
- One obvious submit action
- Explicit success and failure states

Avoid:

- Dense multi-column forms on mobile
- Over-decorated input states
- Low-contrast placeholders used as labels

## Imagery

Photography should move away from generic travel imagery and toward grounded, trust-building storytelling.

### Priority Subjects

- Kampala office and local team presence
- Pilgrim preparation moments
- Family groups and multigenerational travel
- Quiet devotional atmosphere
- Travel logistics shown with dignity

### Image Mood

- Warm natural light
- Soft contrast
- Real textures
- Respectful composition
- Minimal gimmick filters

### Avoid

- Stock-photo smiles with no cultural specificity
- Overly dramatic worship imagery on every screen
- Visual clichés that make the brand feel generic or exploitative

## Illustration and Ornament

Use ornament sparingly.

Allowed directions:

- Subtle geometric or arabesque-inspired borders
- Soft map, route, or archival-paper textures
- Crescent, lattice, or travel-path motifs used abstractly

Rules:

- Ornament must support hierarchy, not compete with it
- Keep decorative patterns low contrast
- Never turn sacred symbolism into novelty decoration

## Motion

Motion should guide, not entertain for its own sake.

### Motion Principles

- Gentle reveal
- Guided progression
- Clear state change
- Soft emphasis

### Recommended Use

Website:

- Hero text fade and rise
- Section reveal stagger
- Guided scroll or progress cues for long pages
- Subtle hover lift on key cards and actions

Dashboard:

- Fast state transitions
- Drawer, toast, and filter motion only where helpful
- No decorative motion in data-heavy views

Mobile:

- Haptic-backed interactions
- Smooth card transitions
- Refresh and sync states that reassure rather than alarm

Avoid across products:

- Parallax-heavy storytelling
- Long delayed animations
- Motion that hides content

## Iconography

Icons should be:

- Simple
- Slightly rounded
- Readable at small sizes
- Used for support, not replacement of labels

Use icon families that feel calm and contemporary.

## Voice and Microcopy

The interface voice should mirror the brand:

- Clear
- Respectful
- Reassuring
- Specific
- Not salesy

### Writing Rules

- Use plain language over jargon
- Use truthful qualifiers
- Explain the next step
- Say who will follow up when relevant
- Prefer human support language over abstract system language

### Avoid

- Pushy urgency
- Empty reassurance
- Corporate dashboard jargon in pilgrim-facing contexts
- Generic luxury language

## Accessibility

Accessibility is part of the design language, not a QA afterthought.

Minimum standards:

- Strong contrast on all text and controls
- Touch targets at least 44 by 44 on mobile
- Clear visible focus states on web and dashboard
- Color is never the only signal
- Motion is reduced when requested
- Charts and dashboards include labels and summaries

## Product-Specific Guidance

## Website Expression

The website should remain the richest visual expression of the brand.

Use:

- Warm atmospheric backgrounds
- Serif-led hero typography
- Editorial section intros
- Proof chips and structured comparison
- Photography with real place and people

Do not:

- Overload the home page with too many equal sections
- Use too many card styles on one screen
- Let campaign pages drift into generic travel-promo language

## Dashboard Expression

The dashboard should become an Al Hilal operations interface, not a default template.

Use:

- Warm off-white backgrounds instead of pure flat white
- Maroon active states and action accents
- Clear operational status chips
- Strong information hierarchy and filters
- Mono only for IDs, references, codes, and logs

Do not:

- Depend on neutral-only shadcn defaults as the final brand
- Use dark mode as the primary experience unless a team need proves it
- Overdecorate workflows that require fast scanning

## Mobile App Expression

The app should feel like a practical companion for pilgrims.

Use:

- Calm single-column cards
- Support-first action patterns
- Larger text and controls
- Clear sync states and readiness cues
- More tactile warmth than the dashboard, less ornament than the website

Do not:

- Mirror admin complexity
- Force too many tabs or nested flows
- Overload screens with stats when support context matters more

## Current-State Direction

### Website

The current website is already closest to the target language.

Keep:

- Warm maroon and gold palette
- Rounded card system
- Editorial section rhythm
- Trust-led copy

Improve:

- Introduce a real serif display role
- Add more local and team-specific imagery
- Tighten spacing consistency
- Add guided comparison and long-page wayfinding

### Dashboard

The dashboard currently reads as functional but generic.

Needs:

- Brand-specific token layer
- Warmer neutrals
- Clear status language
- More deliberate hierarchy

### Mobile

The mobile app already carries brand colors but still needs a more distinctive product language.

Needs:

- More warmth in surfaces and depth
- More consistent card hierarchy
- More support-oriented empty and success states
- Reduced dependence on plain system styling alone

## Implementation Priorities

### Phase 1: Shared Foundation

- Define shared semantic color tokens
- Choose final type system
- Define shared radii, shadow, spacing, and status styles
- Align iconography rules

### Phase 2: Website Refinement

- Introduce serif display typography
- Refine imagery system
- Standardize hero, section intro, and card variants
- Add wayfinding patterns for long pages and comparison flows

### Phase 3: Dashboard Re-skin

- Replace default neutral theme with Al Hilal semantic tokens
- Standardize table, filter, badge, and form styles
- Establish light mode as the reference presentation

### Phase 4: Mobile Alignment

- Apply shared semantic tokens
- Refine support cards, sync states, and status indicators
- Introduce brand-consistent empty, success, and handoff screens

## Success Criteria

The design language is successful when:

- A user can tell the website, dashboard, and app belong to the same brand
- Each product still feels purpose-built for its job
- Trust and clarity are visible before a user reads deeply
- Staff can scan and act faster
- Pilgrims feel supported, not processed

## One-Sentence Standard

Al Hilal should look like a modern, faith-aware pilgrimage company from Kampala that combines editorial warmth, operational clarity, and human support.
