# SIH26099 --- UI Redefinition & Design System Specification

## Project

**National Unified Material Master --- Material Management**

This is a visual/UX redefinition specification for the existing SIH26099
application.

**Core constraint:** refine the UI without changing functionality,
features, workflows, data, business logic, routes, permissions, or
existing behavior.

------------------------------------------------------------------------

## 1. Non-Negotiable: Preserve Functionality

Do **not**: - Remove or replace existing features. - Change business
logic, APIs, database structures, AI matching, harmonization, review,
rationalization, analytics, audit, or import logic. - Change existing
workflows or permissions. - Replace functional components with static
mockups. - Replace real data with fabricated data. - Remove navigation
or pages. - Invent functionality merely for visual impact.

First inspect the existing repository, routes, components, state, data
flow, theme system, and animation system. Reuse existing components
wherever practical.

**If it works, preserve its behavior and refine its presentation.**

------------------------------------------------------------------------

## 2. Design References

Use these as **visual references only**. Do not copy their branding,
content, business logic, or functionality.

### Reference 1 --- CMS Full Form Admin Dashboard

https://v0.app/templates/cms-full-form-admin-dashboard-tailwind-templates-d7j5B58dlp4

Use for: - Clear enterprise administration - Straightforward
navigation - Strong information hierarchy - Practical tables/forms -
Modular layouts - Usability over decoration

### Reference 2 --- SalesOps Dashboard

https://v0.app/templates/salesops-dashboard-9q2Mfgu6cDi

This is the **stronger visual reference** for the target aesthetic.

Use for: - Modern dark UI - Minimal visual language - Clean spacing -
Strong hierarchy - Professional analytics - Restrained cards - Clean
charts - Subtle animation and transitions

### Target

**CMS Admin clarity + SalesOps visual quality + SIH26099's existing
identity and functionality.**

Do not turn the material-management application into a sales dashboard.

------------------------------------------------------------------------

## 3. Design Philosophy

Priority:

1.  Understandability
2.  Readability
3.  Usability
4.  Information hierarchy
5.  Consistency
6.  Professional appearance
7.  Visual polish
8.  Animation

The product should feel like a **real, mature government/enterprise
application**, not an AI-generated concept.

Desired: - Modern - Minimal - Serious - Calm - Data-focused -
Enterprise-grade - Government-appropriate - Information-dense but
readable

Avoid: - Sci-fi/cybersecurity aesthetics - Neon - Excessive glow -
Glassmorphism - Excessive gradients - Heavy shadows - Excessive pills -
Decorative 3D elements - AI sparkle effects - Futuristic jargon -
Excessive monospace - Excessive uppercase labels

------------------------------------------------------------------------

## 4. Dark & Light Themes

Light and dark modes must remain **the same layout and component
system**.

Only visual tokens change.

### Dark

-   Near-black charcoal background, not pure black
-   Slightly lighter charcoal surfaces
-   Subtle borders
-   Off-white primary text
-   Muted gray secondary text
-   Mint/green accent
-   Restrained semantic amber/red/blue

### Light

-   White / very light neutral background
-   White or subtle gray surfaces
-   Light neutral borders
-   Dark charcoal primary text
-   Muted gray secondary text
-   Same green accent
-   Same semantic colors adjusted for contrast

Do not create separate layouts for either theme.

------------------------------------------------------------------------

## 5. Layout

Preserve: - Existing sidebar - Existing top navigation - Existing page
routes - Existing information architecture

Improve: - Alignment - Vertical rhythm - Content width - Spacing -
Density - Responsive behavior

Use a consistent spacing scale around 4/8/12/16/20/24/32/40px.

Do not add whitespace merely for aesthetics if it reduces useful data
density.

------------------------------------------------------------------------

## 6. Sidebar

Keep the current navigation and functionality.

Default item: - Muted icon/text - Transparent or subtle surface

Hover: - Subtle surface transition - No glow

Active: - Slightly stronger surface - Green accent indicator - Stronger
text - Clear icon state

Do not use bright glowing outlines.

Keep secondary items such as Settings/Support visually subordinate.

------------------------------------------------------------------------

## 7. Header

Preserve: - Global search - Upload - Theme toggle - Notifications -
History/system controls - User profile

Keep the header visually quiet.

Search: - Clear - Useful width - Subtle border - Strong focus state
without glow

Buttons: - Primary = solid accent - Secondary = restrained
surface/border - Destructive = reserved for destructive actions

------------------------------------------------------------------------

## 8. Typography

Use the application's regular professional sans-serif for normal UI
text.

Use monospace **only** for: - CNMC codes - CPSE codes - Audit IDs -
Technical identifiers - Appropriate technical values

Avoid excessive letter spacing and uppercase text.

Hierarchy must be obvious: - Page title - Page description - Section
title - Primary data - Secondary data - Metadata

Important data must visually dominate decorative metadata.

------------------------------------------------------------------------

## 9. Cards and Containers

Reduce unnecessary nested cards.

Use cards only to: - Group related information - Highlight KPIs -
Separate major functional regions - Create a meaningful interactive
surface

Do not make every table row, label, badge, or small section a card.

Use: - Moderate radius - Subtle border - Subtle surface difference -
Minimal/no shadow - Consistent padding

Avoid the pattern: **card → card → card → pill → badge** unless
hierarchy genuinely requires it.

------------------------------------------------------------------------

## 10. Tables

Tables are central to this product.

Prioritize **scanability over decoration**.

Use: - Clear headings - Comfortable row height - Subtle separators -
Consistent alignment - Strong primary values - Muted secondary values -
Intentional truncation with accessible detail

Do not place every row inside a separate bordered card.

Hover and selected states should be subtle.

------------------------------------------------------------------------

## 11. Status System

Use consistent statuses across the product: - Approved - Review
Required - Auto-Flagged - Updated - Created - Imported - Harmonized -
Retired - Pending

Status indicators should be small and semantic.

Avoid giant, glowing badges.

Suggested semantics: - Green = success/approved - Amber =
attention/review - Red = error/destructive - Blue = informational/system
activity

Do not communicate important information by color alone.

------------------------------------------------------------------------

# 12. Animation & Transitions

Animation must make the product feel polished, not artificial.

### Durations

-   Micro-interaction: 120--160ms
-   Normal transition: 180--240ms
-   Drawer/modal: 250--350ms
-   Larger transition: maximum \~350--500ms only when genuinely useful

### Easing

Use natural ease-out for entering, ease-in for exiting, ease-in-out for
state changes.

### Hover

Allow subtle: - Background changes - Border changes - Text/icon
changes - Small elevation where appropriate

Do not: - Aggressively scale - Glow - Shake - Float - Bounce

### Focus

Keyboard focus must remain clearly visible.

### Page transitions

If compatible with the existing router, use a very short fade/slide.
Never delay navigation.

### Drawer

-   Smooth slide
-   Appropriate overlay
-   No layout jumping
-   Preserve scroll position

### Modal

-   Subtle overlay fade
-   Small entrance movement/scale
-   Fast exit

### Loading

Use component-appropriate skeletons/progress indicators. Never animate
fake data.

### Micro-interactions

Good: - Search focus - Table row hover - Toggle/checkbox states -
Dropdown opening - Drawer/modal - Toast - Copy confirmation - Successful
save

Avoid continuous or decorative animation.

------------------------------------------------------------------------

# 13. Dashboard / Overview

The dashboard must answer:

**How is the national material master performing, and what needs
attention?**

Preserve existing KPI concepts: - Total Source Codes - Canonical
Materials - Mapping Coverage - Review Backlog

Each KPI should clearly communicate: **What it is + value + short
context + optional next action.**

Example:

**Review Backlog**\
12,405\
Materials requiring review\
\[View Review Queue\]

Keep charts simple and readable. Do not add charts just to fill space.

------------------------------------------------------------------------

# 14. Material Harmonization

Preserve the existing workflow:

**Source Material → Recommended National Match → Related CPSE
Materials**

Make the AI recommendation immediately understandable.

Preferred hierarchy:

### Recommended Match

**CNMC-3116.1504.8920**\
**98% match**

Then show why.

### Specification Comparison

  Attribute   Source     CNMC       Result
  ----------- ---------- ---------- --------
  Material    SS304      SS304      Match
  Size        M10 × 50   M10 × 50   Match
  Type        Hex Bolt   Hex Bolt   Match
  Standard    DIN 933    ISO 4017   Review

Keep evidence/details available through the existing interaction.

Primary actions should be obvious: - Approve Match - Reject - Review
Evidence

Do not make implementation/model terminology the main focus.

------------------------------------------------------------------------

# 15. National Material Master

Preserve the table workflow.

Primary: - CNMC Code - Canonical Description

Secondary: - Material Group - UOM - Mapped CPSEs - Version

Improve row scanning, long-description handling, search, filters, and
detail presentation.

If a row-click/detail interaction already exists, preserve it.

------------------------------------------------------------------------

# 16. Review Queue

The page must answer:

**What needs human attention?**

Prioritize: - Material/code - CPSE - Issue - AI confidence - Reason -
Date - Status - Action

Make **Review** the obvious primary action.

Keep filters understandable and useful.

Avoid decorative elements competing with the queue.

------------------------------------------------------------------------

# 17. Rationalization & Migration

Preserve: - Map - Merge - Retire - Review - Split - Retain

For consequential operations, make the UI clearly communicate:

**Review → Confirm → Execute**

Do not change the underlying workflow.

Before execution, show the affected records, target, and expected result
using the existing data.

------------------------------------------------------------------------

# 18. Analytics & Savings

Preserve existing calculations and analytics.

Important metrics such as: - Estimated annual procurement savings -
Catalog redundancy reduction - Cross-CPSE interoperability - CPSE
efficiency

must have clear context.

Never show a large number without explaining what it represents.

Charts should be: - Simple - Correctly labeled - Readable - Consistent -
Lightly animated only when useful

------------------------------------------------------------------------

# 19. Governance & Audit

Optimize for **auditability and scanning**.

Use a clean audit table/list as the primary interface.

Structure:

**Governance & Audit Trail**\
Complete history of changes, approvals, and AI decisions across the
national catalog.

Summary: - Total Audit Events - AI Recommendations - Cataloger Actions -
Entities Impacted

Filters: - Search - Action - User - Material - Date - Status

Audit table: - Time / Date - Action Performed - Target Material -
Performed By - Summary - Status

Rows should be compact but readable.

Clicking an event should preserve the existing detail behavior.

Details should clearly show: - Action - Target - Actor - Timestamp -
Before state - After state - Reason - Evidence - Verification

The page should answer:

**Who changed what, when, why, and what happened?**

Do not make Governance look like a cybersecurity product.

------------------------------------------------------------------------

# 20. Settings

Preserve all existing settings.

Group visually into: - Theme - Data Ingestion - AI Matching

Keep technical model information available, but do not let
implementation details dominate the interface.

------------------------------------------------------------------------

# 21. Forms and Inputs

Use one consistent input system.

Default: - Subtle surface - Thin border - Comfortable height - Clear
label/placeholder

Focus: - Accent border/ring - No glow

Error: - Clear semantic state - Helpful message

Disabled: - Clearly non-interactive

------------------------------------------------------------------------

# 22. Dropdowns

Use a consistent dropdown component.

Opening should be fast and smooth with a subtle elevation/surface.

Selected state should be clear.

Do not create oversized menus.

------------------------------------------------------------------------

# 23. Notifications / Toasts

Use concise messages: - Material approved. - Harmonization committed. -
Spreadsheet imported successfully. - Review required. - Changes saved.

Animation: - 180--250ms entrance - Natural exit - No bounce

------------------------------------------------------------------------

# 24. Icons

Use one consistent icon family.

Keep: - Consistent stroke weight - Consistent sizing - Correct
alignment - Semantic meaning

Do not use icons merely as decoration.

------------------------------------------------------------------------

# 25. Accessibility

Ensure: - Adequate contrast - Visible keyboard focus -
Keyboard-accessible controls - Correct labels - Useful tooltips for
ambiguous icons - Color is not the only signal - Usable interactive hit
areas - Readable dark mode

------------------------------------------------------------------------

# 26. Responsive Behavior

Desktop remains the primary target.

Still ensure: - No accidental horizontal page overflow - Tables have
intentional overflow - Header remains usable - Drawers/modals fit the
viewport - Text does not overlap - Buttons do not collide

Do not turn this into a consumer mobile application.

------------------------------------------------------------------------

# 27. Empty / Loading / Error States

### Empty

Use concise explanation and next step.

Example: **No review items found**\
Try changing your filters.

No giant illustration.

### Loading

Use real component skeletons or progress states. Do not show fake
values.

### Error

Use clear, actionable language.

Example: **Unable to import spreadsheet**\
Check the file format and try again.

------------------------------------------------------------------------

# 28. Component Consistency

Where appropriate, create/reuse shared primitives: - Button - Input -
Select - Badge - Card - Table - Modal - Drawer - Toast - Tooltip -
Tabs - Progress - KPI - Navigation item

Do not create multiple visual versions of the same component without a
semantic reason.

------------------------------------------------------------------------

# 29. Design Tokens

Centralize values where the current architecture permits.

Tokens should cover: - Background - Surface - Elevated surface -
Border - Primary text - Secondary text - Muted text - Accent - Success -
Warning - Error - Info - Radius - Spacing - Shadows - Transition
duration

Light and dark themes should swap tokens, not component structures.

------------------------------------------------------------------------

# 30. Anti-AI / Anti-Overdesign Rules

If an element appears to exist mainly to make the product look
"AI-generated", remove it.

Do not add: - Neon green glow - AI sparkle icons everywhere - Gradient
text - Futuristic jargon - Excessive monospace - "SYSTEM ONLINE"
decoration - Fake technical labels - Excessive pills - Decorative
charts - Floating glass panels - Holographic effects - Continuous
animation - Glowing borders

The application can contain sophisticated AI functionality without
**looking like an AI product**.

------------------------------------------------------------------------

# 31. Preserve Product Identity

Keep recognizable: - National Unified Master - Material Management -
Existing navigation - Existing page names - CNMC / CPSE terminology -
Harmonization terminology - Rationalization terminology - Existing
green/mint identity - Existing light/dark mode - Existing workflows

The result must feel like an **evolved version of the current
application**, not a replacement product.

------------------------------------------------------------------------

# 32. Implementation Order

1.  Inspect repository and understand current architecture.
2.  Identify routes/pages.
3.  Identify shared components.
4.  Identify theme implementation.
5.  Identify current animation system.
6.  Refine design tokens.
7.  Refine shared components.
8.  Refine global layout/navigation.
9.  Refine each page.
10. Add restrained transitions/micro-interactions.
11. Test light and dark themes.
12. Test every existing workflow.
13. Perform visual regression and responsive QA.

Do not rewrite working code merely because a rewrite is easier.

------------------------------------------------------------------------

# 33. Final Visual Test

Ask:

**Does this look AI-generated?**\
If yes, remove decorative elements.

**Does this look like a real enterprise/government product?**\
If no, simplify.

**Can a new judge understand the screen within 5 seconds?**\
If no, improve hierarchy and wording.

The target is:

**SERIOUS + SIMPLE + READABLE + PRACTICAL + PROFESSIONAL**

Not:

**FUTURISTIC + FLASHY + NEON + AI-LOOKING + OVER-DESIGNED**

------------------------------------------------------------------------

# 34. Final Acceptance Criteria

The redesign is successful only if:

-   Existing functionality still works.
-   Existing features still exist.
-   Existing workflows still work.
-   Existing data is preserved.
-   Existing navigation works.
-   Light and dark modes use the same structure.
-   UI is substantially cleaner.
-   UI is easier to scan.
-   Typography is consistent.
-   Components are consistent.
-   Tables are readable.
-   Actions are clear.
-   Unnecessary jargon is reduced.
-   Animations are subtle and purposeful.
-   No excessive AI/futuristic styling remains.
-   No unnecessary decorative elements were added.
-   The application feels like a real enterprise/government product.
-   The design takes inspiration from the **CMS reference's clarity**
    and **SalesOps reference's modern minimal quality** without copying
    either.

------------------------------------------------------------------------

# Golden Rule

## DO NOT REDESIGN THE PRODUCT.

## REDEFINE THE EXPERIENCE.

Preserve:

**Features + Functionality + Data + Workflows + Architecture**

Improve:

**Visual hierarchy + Readability + Consistency + Spacing + Components +
Interaction + Animation + Polish**

The finished product should make a new user think:

> **"I understand this immediately."**

Not:

> **"This looks AI-generated."**

# Additional Design References, Motion & Interaction Specification

## Reference Websites

### Primary Visual Reference — SalesOps Dashboard
https://v0.app/templates/salesops-dashboard-9q2Mfgu6cDi

Use for the overall visual direction:
- modern enterprise dashboard quality
- clean dark surfaces
- compact but readable KPIs
- strong hierarchy
- professional tables and analytics
- restrained cards
- consistent spacing
- subtle interaction feedback
- polished but practical visual design

### Secondary Reference — CMS Full Form Admin Dashboard
https://v0.app/templates/cms-full-form-admin-dashboard-tailwind-templates-d7j5B58dlp4

Use for:
- enterprise administration
- practical forms
- data-heavy layouts
- clear navigation
- filters
- tables
- straightforward workflows
- usability over decoration

**Reference priority:** existing SIH26099 functionality → readability → SalesOps visual quality → CMS usability → existing product identity.

These are visual references only. Do not copy their branding, content, business logic, or functionality.

---

## Motion Design

The application should feel responsive and polished, but never flashy.

### Timing
- Micro interaction: 120–160ms
- Standard transition: 180–240ms
- Dropdown/tooltip: 150–200ms
- Modal/drawer: 250–350ms
- Chart entrance: 500–800ms maximum
- Navigation must never be delayed by animation.

### Easing
- Enter: `ease-out`
- Exit: `ease-in`
- State/layout change: `ease-in-out`

Avoid bounce, elastic, overshoot, dramatic zoom and cinematic movement.

### Hover
Use only subtle surface, border, icon or text changes. Interactive cards may receive minimal elevation.

Do not use glow, bounce or aggressive scaling.

### Focus
All controls need a visible keyboard-focus state. Use the accent color without neon/glowing effects.

---

## Component Transitions

### Sidebar
- Hover: 120–160ms
- Active state: 150–200ms
- Active indicator may fade/slide subtly
- No glowing active border

If sidebar collapse already exists, animate width over 200–250ms. Do not invent new functionality.

### Header
Search, upload, theme, notifications and profile controls should transition over 120–200ms.

### Cards
Only interactive cards animate on hover. Static KPI cards remain visually stable.

### Tables
- Row hover: 120–160ms
- Selection: 150–200ms
- Expand/collapse: 200–250ms
- Loading: restrained skeleton

Do not animate every table row whenever data changes.

### Dropdowns
Open with opacity + 2–4px movement over 150–200ms. Close over 100–150ms.

### Modals
Backdrop fades in. Modal fades in and moves 4–8px into position over 200–280ms.

### Drawers
Slide from the relevant edge over 250–320ms. Close over 180–250ms.

### Toasts
Fade + small movement over 180–240ms. Never bounce.

---

## Page Transitions

If compatible with the existing router:
- fade the new page in
- optional 4–8px vertical movement
- 180–240ms

Do not use full-screen slides, rotations, large zooms or long transitions.

---

## Theme Transition

Dark and light mode must use the exact same layout and component hierarchy.

Only transition:
- background
- surfaces
- borders
- text
- accent surfaces

Duration: 180–250ms.

Do not animate layout dimensions or flash the page.

---

## Data Visualization Motion

Charts may animate once when first displayed:
- bars grow to actual values
- lines draw left-to-right
- progress bars fill smoothly

Use 500–800ms maximum.

Do not continuously animate charts or replay animation on every hover.

---

## AI Matching Motion

AI must look professional, not magical.

Avoid:
- sparkles
- neon scanning
- pulsing borders
- holographic effects
- fake "AI thinking" theatrics

Preferred sequence:

**Analyzing material attributes...**

→ **98% Match**

→ reveal specification comparison/evidence.

The animation should reinforce explainability and confidence.

---

## Harmonization Motion

Preserve the existing workflow:

**Source → Proposed Match → Evidence → Decision**

After approval:
- button changes state
- status updates
- related data refreshes
- confirmation toast appears

No full-screen celebration animation.

---

## Governance Motion

Governance must feel stable and trustworthy.

Allowed:
- row hover
- filter transitions
- detail drawer
- expandable event details
- subtle insertion of a new audit event

Do not continuously animate the audit trail.

---

## Reduced Motion

Respect `prefers-reduced-motion: reduce`.

When enabled:
- remove decorative movement
- shorten transitions
- disable chart entrance animation
- remove page movement
- preserve clear state changes

Functionality must remain identical.

---

# Anti-AI / Anti-Overdesign Rules

The final interface must NOT look like an AI-generated concept.

Remove or avoid:
- neon green glow
- excessive gradients
- AI sparkle icons
- glowing borders
- glassmorphism
- holographic effects
- excessive pills
- excessive monospace
- fake technical labels
- "SYSTEM ONLINE" decoration
- continuous animation
- decorative charts
- unnecessary badges
- futuristic cybersecurity styling

The product contains sophisticated AI functionality; it does not need to visually advertise that fact everywhere.

---

# Current UI Refinement Targets

Based on the existing screens:

1. Reduce unnecessary nested bordered containers.
2. Reserve pills for statuses, codes and meaningful categorical metadata.
3. Use monospace mainly for CNMC/CPSE codes, IDs and technical values.
4. Make Governance primarily a clean audit table/detail experience.
5. Keep Analytics charts simple and correctly labeled.
6. Make Settings feel like a normal enterprise settings page.
7. Make the Dashboard first viewport immediately communicate health, attention items, progress and actions.
8. Keep light and dark modes structurally identical.
9. Reduce decorative elements that compete with important data.
10. Make every primary action visually obvious.

---

# Antigravity Implementation Rules

Before changing UI, inspect:
- existing routes
- components
- state
- APIs
- event handlers
- data sources
- theme implementation
- existing animation utilities

The existing codebase is the source of truth for functionality.

The reference websites and screenshots are the source of truth for **visual direction only**.

Do not rebuild the application from screenshots.

Do not replace working functionality with mock data.

Do not remove features.

Do not change workflows.

Do not invent functionality just to make the interface look impressive.

Prefer improving shared components and design tokens instead of creating page-specific one-off styles.

---

# Final Judge Test

For every screen:

**5-second test:** Can a new judge understand the purpose of the screen in five seconds?

**2-second action test:** Can they identify the main action immediately?

**Scan test:** Can they find the important information without reading every word?

**Professionalism test:** Does it look like a real enterprise/government application?

**AI test:** Does anything look like decoration added merely because an AI generated it?

If the answer to the last question is yes, simplify it.

## Target

**SERIOUS + SIMPLE + READABLE + PRACTICAL + PROFESSIONAL**

Not:

**FUTURISTIC + FLASHY + NEON + AI-LOOKING + OVER-DESIGNED**
