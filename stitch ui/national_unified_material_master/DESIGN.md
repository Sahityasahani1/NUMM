---
name: National Unified Material Master
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#393939'
  surface-container-lowest: '#0d0e0e'
  surface-container-low: '#1b1c1c'
  surface-container: '#1f2020'
  surface-container-high: '#292a2a'
  surface-container-highest: '#343535'
  on-surface: '#e4e2e2'
  on-surface-variant: '#bdc9c3'
  inverse-surface: '#e4e2e2'
  inverse-on-surface: '#303031'
  outline: '#87948e'
  outline-variant: '#3d4944'
  surface-tint: '#6fd9b9'
  primary: '#c2ffe8'
  on-primary: '#00382b'
  primary-container: '#7fe9c8'
  on-primary-container: '#006953'
  inverse-primary: '#006b55'
  secondary: '#c5c6ca'
  on-secondary: '#2e3134'
  secondary-container: '#494c4f'
  on-secondary-container: '#babcc0'
  tertiary: '#f0f2f9'
  on-tertiary: '#2d3136'
  tertiary-container: '#d3d6dc'
  on-tertiary-container: '#595d62'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#8cf6d4'
  primary-fixed-dim: '#6fd9b9'
  on-primary-fixed: '#002118'
  on-primary-fixed-variant: '#00513f'
  secondary-fixed: '#e1e2e6'
  secondary-fixed-dim: '#c5c6ca'
  on-secondary-fixed: '#191c1f'
  on-secondary-fixed-variant: '#44474a'
  tertiary-fixed: '#e0e2e9'
  tertiary-fixed-dim: '#c3c7cd'
  on-tertiary-fixed: '#181c21'
  on-tertiary-fixed-variant: '#43474c'
  background: '#131314'
  on-background: '#e4e2e2'
  surface-variant: '#343535'
  slate-navy: '#14171A'
  status-success: '#10B981'
  status-warning: '#F59E0B'
  status-error: '#EF4444'
  status-info: '#3B82F6'
  relationship-identical: '#7FE9C8'
  relationship-duplicate: '#60A5FA'
  relationship-near: '#FBBF24'
typography:
  display-cnmc:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-section:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-standard:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-bold:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
  table-header:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 12px
  margin-page: 24px
  row-height-dense: 32px
  row-height-standard: 44px
  drawer-width-lg: 600px
  drawer-width-sm: 400px
---

## Brand & Style

The design system for the National Unified Material Master is built upon the principles of **governance, traceability, and high-density technical analysis**. It is a professional, desktop-first ecosystem designed for engineers and procurement specialists who require absolute clarity over complex entity relationships.

The visual style is **Minimalist / Professional**, drawing inspiration from high-end technical data platforms. It prioritizes information density over white space, using a rigid structural grid and subtle tonal layering to organize vast amounts of metadata. Decorative elements are strictly forbidden; every visual mark—whether a border, a badge, or a tint—serves a specific functional purpose in communicating the relationship between local CPSE data and the national canonical identity.

The aesthetic evokes a sense of "Institutional Truth," where AI-driven recommendations are presented as evidence-based suggestions rather than opaque automated decisions. The interface should feel reliable, precise, and authoritative.

## Colors

This design system utilizes a **dark-mode default** to reduce eye strain during long-form data analysis and to reinforce a technical, high-performance atmosphere.

- **Primary Canvas:** The background utilizes `slate-navy` (#14171A) to provide depth, while UI containers use `secondary_color_hex` (#1E2124) to create a layered hierarchy.
- **Accents:** The primary brand color (#7FE9C8) is used sparingly for active states, primary call-to-actions, and "Approved" status indicators, symbolizing the "clean" canonical state.
- **Functional Semantics:** Status colors (Success, Warning, Error, Info) are used strictly for system health and data validation. Relationship badges (Identical, Duplicate, Near-Duplicate) use a dedicated sub-palette to ensure users can instantly distinguish between match types in dense tables.
- **Data Tints:** Use subtle shifts in gray for "Raw Source" versus "Canonical National" backgrounds to provide a constant visual anchor of where data originated.

## Typography

The typography strategy focuses on legibility within constrained spaces. **IBM Plex Sans** is selected for its systematic, professional structure, suitable for both interface labels and descriptive text. 

**JetBrains Mono** is utilized for all technical identifiers, CPSE codes, CNMC sequences, and UOM attributes. This monospaced choice ensures that alphanumeric codes are easily scannable and that variations in long part numbers are immediately apparent.

**Key Rules:**
- **Canonical Anchor:** The CNMC ID should always be the most prominent element on any page, using `display-cnmc`.
- **Information Density:** Body text is set at 13px to allow for high row density in tables while maintaining AAA accessibility contrast ratios.
- **Metadata Labels:** Use `label-caps` for field titles in drawers and property panels to distinguish them from the data values they describe.

## Layout & Spacing

This is a **fixed-fluid hybrid layout** optimized for 1920x1080 displays. The navigation is anchored to a slim left sidebar (64px collapsed, 240px expanded).

**Grid System:**
- A 12-column grid is used for dashboard layouts.
- Workspace screens (Harmonization) use a **three-pane fluid split**: Source (25%) | Analysis (40%) | Candidate (35%). These panes are resizable by the user.

**Density:**
- Data tables use a "Dense" vertical rhythm by default (32px row height).
- Padding within table cells is kept to a 4px/8px internal margin to maximize horizontal data visibility.
- Sticky headers are mandatory for all data tables.

**Breakpoints:**
- Desktop: 1280px+
- Large Desktop: 1440px+ (Default)
- Tablet (Landscape): 1024px (Minimum supported width for functional workspace).

## Elevation & Depth

Hierarchy is established through **Tonal Layering** rather than traditional shadows. This maintains a "flat" professional aesthetic that doesn't distract from data.

- **Level 0 (Base):** `#14171A` - Used for the background canvas.
- **Level 1 (Cards/Tables):** `#1E2124` - Used for the primary surface of data tables and workspace cards.
- **Level 2 (Popovers/Drawers):** `#2A2E33` - Surfaces that sit above the main workspace. These use a 1px border of `#696969` (at 20% opacity) for definition.
- **Active State:** Elements being edited or reviewed receive a 1px primary-color border.

**Glassmorphism** is used exclusively for "Evidence Drawers" and "Review Overlays" to maintain visual context of the underlying table while the user inspects technical attributes. A 12px backdrop blur is applied to these surfaces.

## Shapes

The shape language is **Soft (0.25rem)** to provide a professional but slightly refined edge. 

- **Buttons & Inputs:** 4px border radius.
- **Status Badges:** Fully pill-shaped (rounded-full) to distinguish them from interactive buttons.
- **Data Rows:** Sharp corners to ensure the grid feels continuous and unbroken.
- **Selection Indicators:** Vertical 2px bars on the left edge of a table row indicate the "active" or "focused" record.

## Components

### Buttons
- **Primary:** Filled `#7FE9C8` with black text for "Approve" or "Commit".
- **Ghost/Outline:** Used for secondary actions like "View Evidence".
- **Destructive:** Red outline with clear impact text on hover.

### Status & Relationship Badges
- **Relationship Type:** Use unique icons + label + color. 
  - *Identical:* Check-circle + Mint.
  - *Duplicate:* Copy-icon + Blue.
  - *Near-Duplicate:* Alert-triangle + Amber.
  - *Functional Equivalent:* Interchange-icon + Purple.

### Data Tables
- **Features:** Must include multi-column sorting, column hiding, and a "Full-screen toggle".
- **Evidence Rows:** Expanding a row should reveal a sub-table comparing raw source attributes against the proposed canonical attributes side-by-side.

### Side Drawers (Evidence & Audit)
- Used for deep-dives into "Why" a match was made.
- Must contain a chronological "Governance Trail" showing which user approved what version at what timestamp.

### AI Indicators
- AI-generated suggestions are highlighted with a subtle `status-info` glow or a small sparkle icon. 
- All AI scores must be accompanied by "View Evidence" which opens the drawer; scores are never presented as final truths.

### Input Fields
- Monospaced text for technical attributes.
- Validation states must show the specific conflict (e.g., "UOM Mismatch: Source (kg) vs Canonical (lb)").