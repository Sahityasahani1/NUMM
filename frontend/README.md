# NUMM Frontend Dashboard (React 18 + Vite 6 + TypeScript + TailwindCSS)

Welcome to the frontend architecture for the **National Unified Material Master (NUMM)** platform under the **Ministry of Petroleum & Natural Gas (MoP&NG)**.

---

## 🏛 Architecture Overview

The frontend is an enterprise-grade Single Page Application (SPA) designed to serve CPSE procurement officers, national catalog stewards, and inventory planners across ONGC, IOCL, GAIL, BPCL, and HPCL.

### Key Technologies
- **Framework:** React 18 with TypeScript 5.7
- **Bundler:** Vite 6 with chunk splitting & Brotli/Gzip optimization
- **Styling:** TailwindCSS 3.4 with custom MoP&NG industrial dark/light design system
- **Animations:** Framer Motion 12 (`framer-motion`) & Lucide React icons
- **State Management:** Reactive Context API (`AppContext.tsx`)

---

## 📂 Directory Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── common/               # Badges, live sandboxes, modals, error boundaries
│   │   ├── core/                 # Animated numbers, grids, text shaders
│   │   ├── layout/               # AppShell, TopAppBar, EvidenceDrawer, Toast
│   │   ├── screens/              # 12 operational screens (Overview, Harmonization,
│   │   │                         # Review Queue, Arbitrage, Analytics, Manifold, etc.)
│   │   └── ui/                   # Reusable atomic UI buttons, theme switchers
│   ├── context/
│   │   └── AppContext.tsx        # Global enterprise state management
│   ├── services/
│   │   └── api.ts                # Type-safe Axios/Fetch client with full backend schemas
│   ├── types/
│   │   └── material.ts           # Shared TypeScript interfaces
│   ├── App.tsx                   # Root navigation router with ErrorBoundary
│   ├── index.css                 # Global CSS & Tailwind layers
│   └── main.tsx                  # React DOM entry point
├── public/                       # Static public assets, favicon, architecture diagrams
├── legacy_vanilla/               # Archived early vanilla HTML/JS prototype
├── stitch_ui_mockups/            # Stitch UI high-fidelity component specifications
├── index.html                    # HTML shell
├── package.json                  # Frontend dependencies & scripts
├── tailwind.config.js            # Design tokens & color palette
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite build and proxy settings
```

---

## 🚀 Quickstart Commands

Run inside the `frontend/` directory:

```bash
# Install dependencies
npm install

# Start local Vite development server (:3000)
npm run dev

# Build production bundle with minification
npm run build

# Preview production build locally
npm run preview
```

*(Alternatively, run `npm run dev` from the repository root to automatically delegate to `frontend`.)*
