---
name: "Labyrinth · Protokoll-Handbuch"
description: "A flat protocol handbook with a navy register and adjacent explanation and data."
colors:
  ink: "#182e3f"
  muted: "#526474"
  line: "#dce3e8"
  paper: "#fff"
  wash: "#f3f6f8"
  navy: "#182e3f"
  nav-muted: "#b9c8d3"
  accent: "#f0c840"
  blue: "#234fb4"
  green: "#17694e"
  red: "#a33236"
  focus: "#b08400"
  version-wash: "#eaf4ed"
  error-wash: "#f7f0e7"
  error-ink: "#795025"
  json-key: "#b9d3ff"
  json-string: "#b6e1c6"
  json-number: "#f4d875"
  json-literal: "#e2bce8"
typography:
  display:
    fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(32px,3.3vw,46px)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-.035em"
  headline:
    fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "25px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-.025em"
  title:
    fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "17px"
    fontWeight: 650
    lineHeight: 1.25
  body:
    fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "12px"
    fontWeight: 550
    lineHeight: 1.5
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "13px"
    lineHeight: 1.85
  operation-description:
    fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "14px"
    lineHeight: 1.9
  operation-label:
    fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "11px"
    fontWeight: 650
    lineHeight: 1.5
rounded:
  square: "0"
  small: "3px"
  field: "4px"
  control: "5px"
  code-sample: "6px"
  dialog: "8px"
  step: "50%"
spacing:
  compact: "8px"
  control: "12px"
  related: "16px"
  pane: "20px"
  section-inset: "24px"
  split: "30px"
  group: "36px"
  document: "40px"
  section: "48px"
  page-end: "64px"
components:
  reference-link:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  reference-link-hover:
    backgroundColor: "#2c495e"
  utility-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "7px 10px"
  utility-button-hover:
    backgroundColor: "{colors.wash}"
  primary-navigation:
    textColor: "#dce5ec"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  primary-navigation-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
  message-search:
    backgroundColor: "#243f54"
    textColor: "{colors.paper}"
    rounded: "{rounded.field}"
    padding: "11px 10px"
  version-label:
    backgroundColor: "{colors.version-wash}"
    textColor: "{colors.green}"
    rounded: "{rounded.field}"
    padding: "3px 8px"
  error-chip:
    backgroundColor: "{colors.error-wash}"
    textColor: "{colors.error-ink}"
    rounded: "{rounded.small}"
    padding: "4px 6px"
  message-operation:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.square}"
  example-code:
    backgroundColor: "{colors.navy}"
    textColor: "#ebf1f7"
    typography: "{typography.code}"
    rounded: "{rounded.control}"
    padding: "20px"
---

# Design System: Labyrinth · Protokoll-Handbuch

## Overview

**Creative North Star: "Protokoll-Handbuch"**

The Protokoll-Handbuch makes dense technical reference feel like a working handbook. A navy register provides orientation; the white reading plane carries explanation, operations and data. Yellow marks the selected register entry, while blue commands and green events retain their precise semantic roles.

The system is compact and practical: ruled entries replace decorative card stacks, Public Sans carries prose and interface labels, and monospace distinguishes protocol data. Depth comes primarily from surface contrast and dividers. The self-hosted variable Public Sans font is shipped with its OFL license; there are no shipping raster illustrations.

**Key Characteristics:**
- Navy register and white reading plane.
- Yellow selected navigation; blue commands and green events.
- Flat ruled operations with adjacent explanation and example/schema views.
- Compact typography, direct keyboard paths and restrained motion.

## Colors

The palette combines a dark register, cool neutral reading materials and small, functional color signals. The frontmatter records the literal source colors; matching ink and navy values remain separate semantic roles.

### Primary
- **Register Navy:** persistent index, reference links and JSON surfaces.
- **Selected Yellow:** active page and message entries, with dark text; also numbered quickstart steps.

### Secondary
- **Command Blue:** links, client-command direction labels, schema types and GET methods.
- **Event Green:** server-event labels, version chips, authorization and POST methods.
- **Required Red:** required schema fields and DELETE methods.

### Neutral
- **Ink / Muted:** reading hierarchy and explanatory text.
- **Paper / Wash / Line:** white canvas, inset schema/note surfaces and fine separators.
- **Navigation Muted:** secondary text on the navy register.
- **Focus Gold:** the shared keyboard outline, separate from the yellow selected background.
- **Version Wash / Error Wash / Error Ink:** quiet version and error-code chips.
- **JSON Key / String / Number / Literal:** data syntax colors on navy only.

**The Selected Register Rule.** Use yellow to locate the current register entry; keep operation direction explicit in text as well as color.

## Typography

**Display Font:** self-hosted variable Public Sans, with Apple-system, BlinkMacSystemFont and sans-serif fallbacks.
**Body Font:** the same Public Sans stack.
**Label/Mono Font:** ui-monospace, SFMono-Regular, Consolas, monospace.

**Character:** a clear technical sans with compact headings and generous prose leading. Monospace is reserved for data rather than decorative headings. There is no fixed modular scale: the source uses role-specific sizes.

### Hierarchy
- **Display:** the frontmatter display role is the shared page title. WebSocket uses its own clamp (30px–42px at 3.2vw), then 31px at 480px and below. Shared titles become 34px at 760px and below.
- **Headline / Title:** shared section and subsection hierarchy; reference entries and protocol groups use 23px, with WebSocket group headings at 22px on the smallest breakpoint.
- **Body:** the shared reading base; paragraphs have a maximum measure of 72ch. Introductory leads use 17px/1.8 and a 66ch measure, reducing to 16px on mobile. Operation explanations use the separate frontmatter role.
- **Label:** compact navigation, metadata and controls vary between 11px and 13px. Operation direction uses the explicit operation-label role; labels retain readable words and arrows rather than relying on color.
- **Code:** JSON and shared examples use the code role; WebSocket JSON reduces to 11px at 480px and below. REST examples use 12px/1.8.

**The Data Voice Rule.** Use Public Sans for reading and controls, and monospace for protocol identifiers, paths, schemas and JSON.

## Layout

The standard desktop shell is a two-column grid with a sticky, full-height register (272px). The sticky utility toolbar is 64px high; shared reading content is centered within a 1320px maximum width and padded 44px 40px 64px. WebSocket content has a 1400px maximum and 40px 40px 64px padding. Collapsing the register removes its grid track and returns width to content.

The repeated rhythm uses compact gaps for related controls, medium insets for code and notes, and larger separation between document sections. Frontmatter spacing values are observed recurring dimensions, not CSS custom properties or a mandatory arithmetic scale.

- **At 1200px and below:** WebSocket explanation/example columns stack; operation summaries reflow and content padding becomes 32px 26px 48px. Above this breakpoint the split is `minmax(0,1fr) minmax(340px,.95fr)` with a 30px gap, and the example pane sticks below the toolbar at 84px. Its code area is limited to the smaller of 620px or 65vh.
- **At 1050px and below:** the shared register narrows to 240px; shared document padding becomes 32px 24px 48px and landing reference actions wrap below their description.
- **At 900px and below:** WebSocket becomes a vertical flex layout: toolbar, optional register, then document. Its register initially collapses, has a 76vh maximum when open, and the message list scrolls within 240px. Error entries stack. WebSocket content uses 28px 20px 44px padding.
- **At 760px and below:** shared home/REST shells become one column and initially collapse the index. The register is static with a 72vh maximum. The toolbar becomes 60px with 18px horizontal padding; shared documents use 30px 20px 40px. Context text and the repository's visible word disappear while accessible names remain. A compact mobile brand appears. Toggle and key action controls receive 44px minimum targets. REST operation summaries and response tables reflow for narrow screens.
- **At 480px and below:** WebSocket operation direction, identifier and description each occupy a line alongside one chevron; JSON uses 16px padding and schema panels 12px.

The initial collapsed state is chosen by the page script at load (760px shared, 900px WebSocket); it is not a continuously synchronized viewport preference. Anchor targets leave space below the sticky toolbar (82px for operations/errors, 88px for shared document sections).

## Elevation & Depth

Ordinary reading surfaces and operation rows have no shadows. Navy/white contrast, cool inset fills, one-pixel rules and nested schema guide lines establish structure. The authorization dialog is the only authored lifted surface, using `0 12px 56px #182e3f33`; its radius is the dialog token. This exception belongs to the modal, not the reading plane.

**The Ruled Plane Rule.** Keep reference operations flat and separate them with fine rules; reserve the documented shadow for the authorization dialog.

## Shapes

Reference rows remain square and ruled. Small rounding softens controls, navigation selections, chips and code panels; the frontmatter names the actual 3px–8px variants. The only recurring fully circular shape is the quickstart step number (28px diameter). No decorative raster assets are shipped.

Icons are inline 24-unit SVG paths drawn with `currentColor`, rounded caps and joins, and no fill. Standard icons are 19px with a 1.7 stroke; the brand mark is 28px/1.8 and operation chevrons 15px. Decorative icons are `aria-hidden`; action names come from visible text or an accessible label. Use the shipped paths, not glyph substitutes.

## Components

### Buttons

Reference links are solid navy with white text, the control radius and the reference-link padding. Hover uses the documented lighter navy variant. Utility actions are white, outlined and compact; hover introduces wash and a stronger border. Copy and example-selection controls use the field radius and a stronger neutral border. Disabled native buttons retain their shape with .55 opacity and a default cursor; no extra disabled animation is authored.

All interactive focus-visible targets use a 3px Focus Gold outline with a 4px offset. Ordinary links thicken their underline on hover. No authored press transform or generic transition is present.

### Chips

Version chips are quiet green-on-version-wash labels, not actions. Error chips are monospace links in warm error colors, darkening their wash on hover. REST method badges use blue GET, green POST, dark ochre PUT and red DELETE, with the method word always present. Required schema fields include an explicit text label.

### Cards / Containers

The canonical reference container is a flat ruled row, not an elevated card. Endpoint strips use top and bottom rules. Notes and schemas use wash; JSON uses navy and a local scroll area. Nested schemas use a fine vertical guide and native disclosure summaries. Error-catalog entries use the same ruled grammar; a hash-selected error gains a pale yellow wash.

### Inputs / Fields

Message search is a labeled white-text field on a slightly lighter navy surface, with a visible neutral-blue border and yellow caret. Its placeholder is a pale navigation color. Direction filters are text controls with a darker selected fill and `aria-pressed`; search result counts use a status region. Example selection remains a native select with a message-specific accessible name. No custom text-field validation style is authored.

### Navigation

The register contains page navigation and local lookup links. Page/message selections use yellow with ink text and `aria-current`; hover uses a lighter navy fill. Message direction is visible text beside each monospace identifier. One message opens at a time, with its corresponding register entry selected. Hash navigation opens the operation, clears conflicting search/direction filters, and moves focus to its summary when explicitly selected. Narrow-screen selection also collapses the WebSocket register.

The index toggle exposes `aria-controls`, `aria-expanded` and its current action label; its hidden state actually removes the index. Skip links become visible on focus. The `/` key opens and focuses message search; Escape clears a focused search. Repository links retain an accessible name when their mobile text is hidden.

### Explanation / Example Workspace

A native operation disclosure reveals an explanatory pane and a sibling example/schema pane. Opening rotates the SVG chevron without animation. The tab pair has tablist/tab/tabpanel roles, connected IDs, roving tabindex and Left/Right/Home/End keyboard controls. JSON examples retain a native selector, copy button and a live copy-status message, including a manual-copy fallback. Scrollable code is keyboard focusable. The split stacks at the documented breakpoint.

### REST Authorization and Execution

Swagger retains native authorization, server selection and request execution. The authored overrides flatten operation containers, use Public Sans controls and monospace paths/data, restyle methods and schemas, and reserve modal depth for authorization. Deep-schema expansion controls use full-opacity Muted text and Ink on hover. Vendor behavior and styles outside these explicit overrides remain Swagger-owned rather than new design tokens.

### Motion

Only the register uses an authored entrance reveal: a clipped left-to-right reveal over .22s with `cubic-bezier(.16,1,.3,1)`. It is enabled only for `prefers-reduced-motion: no-preference`; reduced-motion users receive direct state changes. Reading content has no entrance animation and no smooth-scroll rule is authored.

## Do's and Don'ts

### Do:
- **Do** keep the selected register entry and the open operation consistent.
- **Do** preserve adjacent explanation and data above the split breakpoint, then stack them for narrow reading.
- **Do** retain visible focus, labeled icon actions, text direction labels and keyboard tab navigation.
- **Do** use the shipped Public Sans font and inline stroke SVG icons.

### Don't:
- **Don't** replace ruled reference entries with a decorative card grid.
- **Don't** use color alone to communicate direction, selection or required fields.
- **Don't** add reading-content entrance animation or apply the dialog shadow to ordinary reference rows.
