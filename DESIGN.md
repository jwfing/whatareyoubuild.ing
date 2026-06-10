---
name: What Are You Building
description: A builder showcase where vibe coders post what they're shipping and the community upvotes.
colors:
  ink: "#111111"
  paper: "#f4f1ea"
  caption-gray: "#555555"
  hairline: "#dddddd"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.5rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.5px"
  body:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  none: "0px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "1.5rem"
components:
  button-rule:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.75rem"
    typography: "{typography.label}"
  vote-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
    typography: "{typography.label}"
  vote-button-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
    typography: "{typography.label}"
  input-rule:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.75rem"
    typography: "{typography.body}"
  product-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.625rem 0"
---

# Design System: What Are You Building

## 1. Overview

**Creative North Star: "The Builder's Broadsheet"**

The interface is a printed broadsheet for people who ship. A bold serif masthead runs across the top; below it, a ranked front-page index of what's being built, entries separated by hairline rules the way a newspaper separates listings. There is no color, no gradient, no shadow, no rounded corner — just ink pressed onto warm paper. The restraint is the statement: in a feed full of AI-generated SaaS pages, a black-and-white press page reads as *taste*, and taste is the first filter for the builders we want.

The system is **refined and restrained**, carried by a single confident gesture: a 2px ink rule. Surfaces are flat and quiet; the one assertive move on any element is its hard border. Monospace is reserved for the broadsheet's machinery — vote counts, ranks, section tags, nav — so numbers and metadata read as type-set, never as prose. Density is editorial: generous masthead, tight ranked rows, room to breathe around a featured headline.

This system explicitly rejects the **generic AI-SaaS look** (purple/indigo gradients, glassy cards, gradient text, identical icon-card grids, tracked-uppercase eyebrows above every block), the **corporate dashboard** (sidebar + data tables + flat gray enterprise chrome), and **crypto/Web3 maximalism** (neon-on-black, glows, aggressive motion). If it could be mistaken for any of those, it has failed.

**Key Characteristics:**
- Monochrome: warm paper + near-black ink, zero accent color.
- Zero border-radius. Everything is hard-cornered.
- No shadows; depth comes from 2px ink rules and 1px hairlines.
- Serif (Fraunces) for everything readable; monospace (JetBrains Mono) only for counts, ranks, tags, and nav.
- The ranked, hairline-ruled feed is the signature surface.

## 2. Colors

A two-tone press palette: warm paper and near-black ink, with two grays that exist only to separate and caption. There is no chromatic accent — emphasis is carried by weight, size, and the inversion of ink and paper.

### Primary
- **Ink** (`#111111`): The single dominant value. Body text, every border and rule, the masthead, the inverted "voted" state. It is simultaneously the type color and the only "accent" — the ink *is* the brand.

### Neutral
- **Paper** (`#f4f1ea`): The body surface — a warm off-white, the page everything is printed on. Also the text color when a control inverts to ink (e.g. the active vote button).
- **Caption Gray** (`#555555`): Secondary text only — taglines, meta, captions, inactive nav. Holds ~6.7:1 on Paper, so it stays legible; it is never lightened past this.
- **Hairline** (`#dddddd`): 1px dividers between ranked rows and beneath the masthead. Structural, never decorative.

### Named Rules
**The Monochrome Rule.** There is no color in this product. If a swatch has chroma, it does not belong. Emphasis is weight, scale, and ink/paper inversion — never hue.

**The Honest Gray Rule.** Caption Gray (`#555555`) is the floor for secondary text on Paper, never lighter. Light-gray-for-elegance is forbidden; it is the single biggest reason a page reads as AI-made.

## 3. Typography

**Display / Body Font:** Fraunces (with Georgia, serif fallback)
**Label / Mono Font:** JetBrains Mono (with ui-monospace, monospace fallback)

**Character:** A high-contrast modern serif doing nearly all the work — headlines and prose alike — paired on a hard contrast axis with a precise monospace that handles only the broadsheet's machinery. The serif gives editorial authority; the mono gives builder-native precision. They never blur into each other because their jobs never overlap.

### Hierarchy
- **Display** (Fraunces 800, `clamp(1.5rem, 4vw, 3rem)`, line-height 1.05, tracking -0.5px): The masthead wordmark and the featured-headline product name. The loudest type on the page.
- **Headline** (Fraunces 800, `1.875rem`, line-height 1.1, tracking -0.5px): A product's name on its detail page.
- **Body** (Fraunces 400, `1rem`, line-height 1.5): Descriptions and prose. Cap measure at 65–75ch.
- **Label** (JetBrains Mono 400, `0.75rem`): Vote counts, ranks, NEW/HOT nav, section tags, the `+ SUBMIT` control — anything that is data or chrome rather than prose.

### Named Rules
**The Mono-for-Machinery Rule.** Monospace appears only on counts, ranks, nav, tags, and metadata. Prose is always the serif. A paragraph in monospace is a bug.

**The Tight-Masthead Rule.** Display/headline weight is 800 with -0.5px tracking and `text-wrap: balance`. Never set the masthead below 800 or looser than -0.5px; it should read pressed, not typed.

## 4. Elevation

This system is flat by doctrine. There are no shadows, no blurs, no glass. Depth is conveyed entirely by **the 2px ink rule** (the framed border on cards, buttons, badges, inputs) and **the 1px hairline** (row dividers, masthead underline). A featured item is not lifted off the page — it is given a heavier frame and more space. The page is a printed surface; nothing floats above it.

### Named Rules
**The Flat Press Rule.** No `box-shadow`, no `backdrop-filter`, no glow — ever. If an element needs to stand apart, give it a rule or give it space. Shadows are how 2014 apps faked importance; this product doesn't.

## 5. Components

Components are refined and restrained: a flat paper fill, hard corners, and a single ink rule. State changes are expressed by inverting ink and paper, not by shadow or color.

### Buttons
- **Shape:** Hard-cornered (radius `0`). 2px ink border (`.rule`).
- **Primary / Default:** Paper background, ink text, monospace label, padding ~`0.25rem 0.75rem` (small) to `1rem` (vote). The `+ SUBMIT` and Google/GitHub buttons use this form.
- **Vote button:** A tall ink-ruled block, monospace `▲` + count. **Active (voted):** inverts — ink background, paper text. The inversion *is* the affordance.
- **Hover / Focus:** Keep transitions to ≤200ms. Focus must be visible (a thickened or offset ink ring is on-brand); never remove the outline. Reduced-motion: instant state swap, no transform.

### Cards / Containers
- **Corner Style:** Hard (radius `0`). Never rounded.
- **Background:** Paper. **Border:** 2px ink rule (`.rule`).
- **Shadow Strategy:** None — see The Flat Press Rule.
- **Internal Padding:** `1rem` (cards) to `1.5rem` (forms).
- Nesting cards is forbidden. The featured headline is a single framed block, not a card-in-a-card.

### Inputs / Fields
- **Style:** Paper fill, 2px ink rule, hard corners, serif text, padding `0.5rem 0.75rem`.
- **Focus:** Visible focus state required (offset/thickened ink ring). Placeholder text must hold ≥4.5:1 — Caption Gray floor, never lighter.
- **Error:** Terse line of text beneath the field; no colored stripe, no icon-heavy alert chrome.

### Navigation
- **Masthead:** Full-width header, bottom hairline only (`border-x-0 border-t-0`). Wordmark in display weight 800; controls in monospace.
- **Feed nav (NEW / HOT):** Monospace, the active tab in `font-bold` ink, the inactive in Caption Gray. URL-driven (`?sort=`), not client state.

### The Ranked Feed (signature component)
The front page: one **featured headline** (heavier 2px frame, larger product name in display type, a "TODAY'S TOP" tag, vote block) followed by **ranked rows** divided by 1px hairlines — rank number (mono), 40px thumbnail, name + tagline, vote count. It reads top-to-bottom like a newspaper's index. This is the most important surface in the product; protect its rhythm.

### The Share Card (signature component)
A 1200×630 magazine-cover OG image generated per product: left column = masthead label + "FEATURED" + product name in heavy serif + tagline + byline; right column = the product image behind a paper-ruled `▲ votes` badge (the upvote mark drawn as a CSS triangle, never a glyph that can tofu). It is the broadsheet's front page, made shareable.

## 6. Do's and Don'ts

### Do:
- **Do** keep the system monochrome — warm Paper (`#f4f1ea`) and near-black Ink (`#111`). Emphasis via weight, scale, and ink/paper inversion.
- **Do** use hard corners (radius `0`) and a 2px ink rule as the one assertive gesture on any element.
- **Do** reserve JetBrains Mono for counts, ranks, nav, tags, and metadata; set all prose in Fraunces.
- **Do** keep secondary text at Caption Gray (`#555`) or darker — it holds ~6.7:1 on Paper.
- **Do** convey depth with rules and spacing; keep every surface flat.
- **Do** give every interactive control a visible focus state and a `prefers-reduced-motion` fallback (crossfade or instant).
- **Do** treat the "TODAY'S TOP" / "FEATURED" tag as the *one* sanctioned tracked-uppercase label — a deliberate broadsheet kicker, used on the featured item only.

### Don't:
- **Don't** introduce the **generic AI-SaaS look**: no purple/indigo gradients, no glassy/glassmorphic cards, no `background-clip: text` gradient text, no identical icon-card grids, no tracked-uppercase eyebrow above every section.
- **Don't** drift toward a **corporate dashboard**: no sidebar + data-table + flat-gray enterprise chrome.
- **Don't** reach for **crypto/Web3 maximalism**: no neon-on-black, no glows, no aggressive animation.
- **Don't** add `box-shadow`, `backdrop-filter`, or blur — flat by doctrine (The Flat Press Rule).
- **Don't** round corners. Radius is `0` everywhere.
- **Don't** use a `border-left`/`border-right` color stripe as an accent — borders are full 2px ink rules or nothing.
- **Don't** lighten secondary text past `#555` "for elegance" — it's the fastest tell of an AI-made page.
- **Don't** set prose in monospace or the masthead below 800 weight.
