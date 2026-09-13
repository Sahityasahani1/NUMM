You are refining the existing SIH26099 project: National Unified Material Master / Material Management.

IMPORTANT:
Do NOT rebuild the application from scratch.
Do NOT change the overall information architecture or invent new modules.
Do NOT make the UI more futuristic, flashy, or decorative.
Do NOT remove existing functionality.
Do NOT change the light/dark mode behavior. Light and dark mode must remain exactly the same layout and components, with only theme/color differences.

I want a careful PRODUCT + UX + UI refinement of the existing application based on the current implementation.

PRIMARY GOAL:
Make the application simpler, clearer, more readable, and easier for an SIH judge to understand within seconds.

DESIGN PRINCIPLE:
Simple > Clear > Readable > Functional > Professional

The application should feel like a serious government/enterprise material-management system, NOT a sci-fi/cybersecurity dashboard.

GENERAL REFINEMENT RULES:

1. PRESERVE THE EXISTING VISUAL IDENTITY
- Keep the current sidebar.
- Keep the current top navigation.
- Keep the dark/light theme system.
- Keep the existing mint/green accent.
- Keep the overall typography direction.
- Keep the current major page structure.
- Keep the existing functionality and interactions.
- Do not introduce unnecessary animations or visual effects.

2. REDUCE VISUAL CLUTTER
The current UI uses many outlined rounded cards, pills, nested containers and borders.
Refine these without destroying the existing design.

Use:
- More whitespace where useful.
- Clearer grouping.
- Fewer unnecessary nested borders.
- Stronger typography hierarchy.
- Subtle backgrounds for secondary information.
- Consistent spacing.
- Consistent border radius.
- Consistent button sizes.

Do NOT make everything into a card.

3. IMPROVE READABILITY
A judge should immediately understand:
- What page they are on.
- What the page is for.
- What the important numbers mean.
- What action they can take.
- What happened after an action.

Prefer plain, understandable language over unnecessarily technical terminology.

For example:
"Proposed National CNMC Match" → "Recommended Match"
"Standardized Specifications Alignment" → "Specification Comparison"
"Cross-CPSE Entity Network" → "Other CPSEs Using This Material"
"Cryptographically verifiable, tamper-evident audit history..." → "Complete history of changes and approvals"

Keep technical information where it is genuinely useful, but don't expose implementation terminology unnecessarily.

4. ESTABLISH A CONSISTENT DESIGN SYSTEM
Audit the existing application and make these consistent across ALL pages:
- Heading sizes
- Body text sizes
- Label sizes
- Font weights
- Spacing
- Card padding
- Border radius
- Border colors
- Button styles
- Input styles
- Status badges
- Table styles
- Icon sizing
- Alignment

Do not redesign each page independently.

5. INFORMATION HIERARCHY
Every page should have:
- Clear page title
- One-sentence explanation where useful
- Primary information
- Secondary information
- Clear primary action

Important information should visually dominate decorative metadata.

Do not give equal visual weight to everything.

==================================================
PAGE-SPECIFIC REFINEMENTS
==================================================

DASHBOARD / OVERVIEW

Keep the existing KPI structure, but make it more actionable.

Current concepts:
- Total Source Codes
- Canonical Materials
- Mapping Coverage
- Review Backlog

Keep them.

Improve them so the user can understand:
WHAT IT IS + CURRENT VALUE + WHAT TO DO NEXT

For example:
Review Backlog
12,405
Materials requiring review
[View Review Queue]

Mapping Coverage
78.4%
Materials successfully harmonized
[View Unmapped Materials]

Avoid decorative text that doesn't provide useful information.

The dashboard should answer:
"How is the national material master performing, and what needs attention?"

Keep charts simple and readable.
Do not add unnecessary charts.

==================================================

MATERIAL HARMONIZATION

This is one of the most important screens.

Preserve the current three-column workflow:
Source Record → AI Recommended Match → Related CPSE Materials

Make the AI decision much easier to understand.

The central panel should clearly communicate:

RECOMMENDED MATCH
CNMC code
98% Match

WHY THIS MATCH?
Show the important attribute comparisons.

Example:

Attribute       Source        CNMC          Result
Material        SS304         SS304         ✓
Size            M10 × 50      M10 × 50      ✓
Type            Hex Bolt      Hex Bolt      ✓
Standard        DIN 933       ISO 4017      ⚠

Make the evidence for the AI recommendation obvious.

Primary actions should be very clear:
[Approve Match]
[Reject]
[Review Evidence]

Do not make the user search through decorative UI to understand why the match was suggested.

Keep technical AI details available through an evidence/details interaction rather than making them the primary focus.

==================================================

NATIONAL MATERIAL MASTER

Keep the table-based layout.

Improve:
- Column hierarchy
- Row readability
- Description truncation
- Spacing
- Search
- Filtering
- Status visibility

The most important information should be:
CNMC Code + Canonical Description

Secondary information:
Material Group
UOM
Mapped CPSEs
Version

Rows should be easy to scan.

If an existing material detail interaction exists, improve it.
If not, add a simple detail drawer/modal triggered by clicking a material row, WITHOUT changing the overall architecture.

The detail view should clearly show:
- CNMC code
- Canonical description
- Technical specifications
- Version
- Source/CPSE mappings
- Status
- Related materials

==================================================

REVIEW QUEUE

Treat this as a major workflow screen.

The user should immediately understand:
"What materials need my attention?"

Use a clear table/list rather than excessive decorative cards.

Useful information:
- Material/code
- CPSE
- Issue
- AI confidence
- Reason for review
- Date
- Status
- Action

Provide useful filters such as:
- CPSE
- Issue type
- Confidence
- Status
- Date

Make the primary action obvious:
[Review]

Do not make this page visually complicated.

==================================================

RATIONALIZATION & MIGRATION

Keep the existing concepts:
MAP
MERGE
RETIRE
REVIEW
SPLIT
RETAIN

These are useful.

However, consequential actions such as MERGE should not appear as if they execute instantly.

Use a safe workflow:

Review → Confirm → Execute

For a merge, clearly show:
Source records
Target CNMC
Number of duplicates
Expected result
Impact

Then:
[Review Changes]
[Confirm Merge]

Do not remove existing functionality.

==================================================

ANALYTICS

Keep the existing important metrics and CPSE efficiency table.

Make analytics more understandable.

Metrics should have clear labels and context.

Avoid presenting impressive numbers without explaining what they represent.

For example:
₹4,820 Cr
Estimated annual procurement savings

68.2%
Catalog redundancy reduced

91.4%
Cross-CPSE interoperability

Keep the CPSE table readable.

If existing interactions allow drilling into a CPSE, improve them.
Do not add complicated dashboards just to make the page look sophisticated.

==================================================

GOVERNANCE & AUDIT

THIS PAGE NEEDS THE MOST IMPORTANT UX REFINEMENT.

Do NOT keep the current large timeline cards as the primary audit interface.

The audit page should be optimized for scanning many records.

Replace the large timeline presentation with a clean audit table/list.

Suggested structure:

Governance & Audit
Track changes, approvals and AI decisions.

Summary:
Total Events | AI Decisions | Pending Reviews | Changes Today

Filters:
[Date] [Action] [User] [Material] [Status]

Audit table:

Time
Action
Material
Performed By
Status
Audit ID

Example:

Today 14:32 | Flagged as Duplicate | IOCL-10098422 | AI System | Needs Review | AUD-001
Today 13:18 | Material Approved | ONGC-MAT-441-002 | S. Gupta | Approved | AUD-002
Today 11:45 | Material Updated | CNMC-00018427 | A. Kumar | Updated | AUD-003

Clicking an audit event should open a clean detail drawer/modal.

The detail view should show:
- Action
- Material
- Actor
- Timestamp
- Previous state
- New state
- Reason
- Related records
- Verification/audit information

The goal is:
"Who changed what, when, why, and what was the result?"

Do not make Governance look like a cybersecurity product.

==================================================

SETTINGS

Keep the existing settings functionality.

Simplify the presentation.

Avoid exposing implementation terminology as the main UI.

For example:
"Active Embedding Model: Technical-RoBERTa-v4.2"
can remain available, but it should not visually dominate the settings page.

Group settings logically:

THEME
- Application Theme

DATA INGESTION
- Spreadsheet Import

AI MATCHING
- Auto-Approval Threshold
- Matching Model
- UOM Conversion

Use short descriptions explaining what each setting actually affects.

==================================================
CONTENT / TERMINOLOGY
==================================================

Review the entire application for unnecessarily technical or complicated wording.

Prefer:
"Recommended Match"
over
"Proposed National CNMC Match"

Prefer:
"Specification Comparison"
over
"Standardized Specifications Alignment"

Prefer:
"Other CPSEs Using This Material"
over
"Cross-CPSE Entity Network"

Prefer:
"Review Required"
over
"Requires Action"

Use terminology consistently throughout the entire application.

Do NOT randomly rename important domain terms such as CNMC, CPSE, Harmonization, Rationalization, etc.

==================================================
IMPORTANT: DO NOT OVERDESIGN
==================================================

Do NOT:
- Add gradients everywhere.
- Add glassmorphism.
- Add excessive shadows.
- Add glowing effects.
- Add unnecessary animations.
- Add decorative charts.
- Add unnecessary badges.
- Add excessive pills.
- Add huge illustrations.
- Add unnecessary AI visualizations.
- Add more cards just to fill space.
- Make the interface look like a futuristic command center.

The current application already has enough visual identity.

The goal is REFINEMENT, not reinvention.

==================================================
RESPONSIVENESS & POLISH
==================================================

Also check:
- Horizontal overflow
- Vertical scrolling behavior
- Fixed sidebar behavior
- Header alignment
- Table overflow
- Button alignment
- Text truncation
- Long material descriptions
- Modal/drawer positioning
- Consistent spacing at different viewport sizes

Fix obvious visual bugs without changing functionality.

==================================================
FINAL REQUIREMENT
==================================================

Before changing anything, inspect the existing application and understand its current components, routes, state, and functionality.

Reuse existing components wherever possible.

Do not create duplicate components unnecessarily.

Do not break existing functionality.

Do not fabricate functionality that isn't supported by the current application.

The final result should feel like the SAME application, just significantly more:
- Simple
- Clear
- Readable
- Consistent
- Professional
- Judge-friendly

The test is simple:

A judge who has never seen this project should be able to look at each screen and understand:
1. What am I looking at?
2. What does this information mean?
3. What is the system doing?
4. What can I do next?

If any screen fails that test, refine it.