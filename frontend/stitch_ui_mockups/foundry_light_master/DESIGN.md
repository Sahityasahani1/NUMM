---
name: Foundry Light Master
colors:
  surface: '#f8fafb'
  surface-dim: '#d8dadb'
  surface-bright: '#f8fafb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f5'
  surface-container: '#eceeef'
  surface-container-high: '#e6e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3e4945'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#eff1f2'
  outline: '#6e7a74'
  outline-variant: '#bec9c3'
  surface-tint: '#016b55'
  primary: '#00513f'
  on-primary: '#ffffff'
  primary-container: '#006b55'
  on-primary-container: '#94e8cc'
  inverse-primary: '#82d6bb'
  secondary: '#5b5f64'
  on-secondary: '#ffffff'
  secondary-container: '#dde0e6'
  on-secondary-container: '#5f6368'
  tertiary: '#00513f'
  on-tertiary: '#ffffff'
  tertiary-container: '#256956'
  on-tertiary-container: '#a2e6cd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ef3d7'
  primary-fixed-dim: '#82d6bb'
  on-primary-fixed: '#002018'
  on-primary-fixed-variant: '#005140'
  secondary-fixed: '#dfe3e8'
  secondary-fixed-dim: '#c3c7cc'
  on-secondary-fixed: '#181c20'
  on-secondary-fixed-variant: '#43474c'
  tertiary-fixed: '#adf0d8'
  tertiary-fixed-dim: '#91d4bc'
  on-tertiary-fixed: '#002118'
  on-tertiary-fixed-variant: '#00513f'
  background: '#f8fafb'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  brand-teal: '#12b886'
  surface-canvas: '#f8f9fa'
  surface-card: '#ffffff'
  border-subtle: '#dadce0'
  text-primary: '#1a1c1e'
  text-secondary: '#44474e'
  relationship-identical: '#12b886'
  relationship-duplicate: '#1976d2'
  relationship-near: '#f59e0b'
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
    fontFamily: jetbrainsMono
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
  row-dense: 32px
  row-standard: 44px
---

## Brand & Style

The design system is an enterprise-grade, high-density interface optimized for technical governance and data harmonization. Transitioning to a **Minimalist / Professional** light mode, it emphasizes absolute clarity, high information density, and "Institutional Truth." The aesthetic is inspired by engineering foundry platforms, where data is the primary citizen.

The brand persona is authoritative, precise, and transparent. It avoids decorative flourishes in favor of a rigid structural grid and a "Foundry" aesthetic—characterized by thin borders, subtle tonal layering, and high-contrast typography. The light mode execution uses a palette of cool grays and whites to create a clean, focused environment that reduces cognitive load during long periods of technical analysis.

## Colors

The color strategy shifts to a high-contrast light theme to maximize legibility in data-heavy environments. 

- **Primary Canvas:** The main background is `surface-canvas` (#f8f9fa), providing a soft neutral base. Interactive surfaces and data containers use pure white (#ffffff) to pop against the background.
- **Accents:** The brand's signature teal is adjusted to `#006b55` for primary actions to meet WCAG AA accessibility standards on white backgrounds. A more vibrant `brand-teal` (#12b886) is used for non-text decorative accents and status indicators.
- **Typography & Borders:** Text uses high-contrast dark grays (`text-primary`) for maximum sharpness. Borders use a systematic gray scale to define hierarchy without adding visual weight.
- **Semantic Logic:** Status colors (Success, Warning, Error) are highly saturated to ensure they stand out in dense tables. Relationship badges maintain their specific color coding (Teal, Blue, Amber) but are optimized for light-mode backgrounds using tinted containers with high-contrast text.

## Typography

This system uses **IBM Plex Sans** for its engineered, neutral character, making it ideal for institutional software. **JetBrains Mono** is strictly reserved for technical strings (CPSE codes, CNMC sequences) to ensure character distinction (e.g., 0 vs O).

**Key Rules:**
- **Density Over Spacing:** The 13px base size for body text is non-negotiable to maintain the required information density.
- **Hierarchy:** Use `label-caps` for all secondary metadata headers to create a clear visual distinction from live data.
- **Technical Precision:** Monospaced fonts must be used in all data-entry fields and table cells containing alphanumeric IDs.

## Layout & Spacing

This system utilizes a **fixed-fluid hybrid layout** tailored for professional 1920x1080 workstations.

- **Grid:** A 12-column grid governs dashboard views. Workspace screens utilize a three-pane layout: Source (25%), Analysis (40%), and Candidate (35%).
- **Rhythm:** A strict 4px baseline grid ensures alignment. Vertical density is prioritized; data tables default to `row-dense` (32px) to maximize the "at-a-glance" data volume.
- **Responsive Behavior:** Below 1280px, the sidebars collapse to icon-only states to preserve the workspace width. The three-pane layout becomes a tabbed interface on tablet-sized devices (1024px).

## Elevation & Depth

In light mode, hierarchy is achieved through **Low-contrast outlines** and **Tonal Layers** rather than shadows, maintaining a crisp, architectural feel.

- **Base Layer:** The background canvas is a solid light gray.
- **Surface Layer:** Cards, tables, and panels are white with a 1px `border-subtle` (#dadce0).
- **Overlay Layer:** Drawers and modals use a very slight ambient shadow (4px blur, 5% opacity black) and a 1px border to separate from the workspace.
- **Contextual Depth:** Glassmorphism is used for evidence overlays to provide a 12px backdrop blur, allowing the user to maintain a sense of their location within a large dataset while focusing on a specific record.

## Shapes

The shape language is **Soft (0.25rem)**, providing a precise, professional look.

- **Interactive Elements:** Buttons and input fields use a consistent 4px radius.
- **Data Integrity:** Table rows and container edges remain sharp (0px) to reinforce the grid-like, systematic nature of the master data.
- **Categorization:** Status badges use a `rounded-full` pill shape to differentiate them from square-edged data and buttons.

## Components

### Buttons
- **Primary:** Filled `primary_color_hex` (#006b55) with white text.
- **Secondary:** White background with a 1px `border-subtle` and `text-secondary`.
- **Tertiary/Ghost:** No border, primary-colored text, used for low-priority actions in dense rows.

### Data Tables
- **Headers:** Light gray background (#f1f3f4) with `table-header` typography.
- **Row States:** Hover states use a 5% tint of the primary color. Active/Selected rows use a 2px vertical stripe of brand-teal on the far left.
- **Density:** Must support a "compact" toggle that reduces row height to 28px for extreme data auditing.

### Inputs & Fields
- **Foundry Style:** Fields use a 1px border on all sides. On focus, the border thickens to 2px in the primary color. 
- **Validation:** Errors are shown with red text and a 1px red border. Success states for "Validated Data" use a subtle teal checkmark icon within the field.

### Status & Relationship Badges
- **Relationship Type:** Displayed as high-contrast text on a 10% opacity background of the respective relationship color (e.g., Identical = Mint text on 10% Mint bg).
- **Icons:** All badges must include a 14px icon for accessibility and rapid scanning.

### Side Drawers
- Used for "Why" analysis. These should feature a vertical "Governance Trail" component that uses a monospaced font for timestamps and user IDs.