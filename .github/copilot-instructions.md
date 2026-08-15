# 🤖 Copilot Instructions for RBF Motos Sistema

## 🏗️ Project Overview
- **Fullstack system** for motorcycle shop management: React + TypeScript frontend, Express backend, Prisma ORM, SQLite database.
- **Design System V3 Premium**: Custom UI/UX with dark mode, gradients, animations, and responsive layouts. See `README-DESIGN-PREMIUM.md` and `DESIGN-SYSTEM-V3-PREMIUM.md`.
- **API**: `server.ts` (Express) exposes endpoints, uses `src/lib/prisma` for DB access.
- **Bot Integrations**: WhatsApp bot in `src/api/bot-whatsapp.ts` and `bot-integrator.js`.

## 🗂️ Key Structure
- `src/components/` — React UI components (StatCard, Dashboard, etc.)
- `src/styles/` — Design tokens, Tailwind customizations
- `prisma/` — DB schema, migrations
- `server.ts` — Express API entrypoint
- `package.json` — Scripts, dependencies
- `README.md` — General setup, DB, and workflow docs

## 🚀 Developer Workflows
- **Frontend dev**: `npm run dev` (Vite, port 5174)
- **Backend dev**: `npm run server` (Express, port 9001)
- **Fullstack dev**: `npm run dev:all` (concurrently runs both)
- **Build**: `npm run build` (Vite)
- **Lint**: `npm run lint`
- **Prisma**: `npx prisma generate|migrate dev|studio|reset` (see README)
- **Bot**: Run `bot-integrator.js` for WhatsApp integration

## 🧩 Patterns & Conventions
- **UI**: Use and extend components in `src/components/`. Follow design tokens from `src/styles/design-tokens.css`.
- **Naming**: Components PascalCase, files kebab-case or PascalCase. See `CYBER-COMPONENTS-STATUS.md` for naming and color conventions.
- **State**: Prefer React hooks in `src/hooks/` for data/state logic.
- **DB**: All schema changes via Prisma migrations. Use `prisma/schema.prisma` as source of truth.
- **API**: Add new endpoints in `server.ts` or under `src/api/`.
- **Testing**: No formal test suite; use manual QA and visual checks as per checklists in `README-DESIGN-PREMIUM.md`.

## 🎨 Design System
- **Colors**: Orange (#FF6B35), Purple (#A855F7), Blue (#3B82F6), etc. (see `README-DESIGN-PREMIUM.md`)
- **Dark mode**: All components must support dark mode.
- **Responsiveness**: Use Tailwind breakpoints and flex/grid utilities.
- **Visuals**: Use gradients, subtle shadows, and hover effects as per design docs.

## 🔗 Integrations
- **Supabase**: Used for some legacy features (see `.env.example` for config)
- **WhatsApp Bot**: Integrates via API/webhook (`bot-integrator.js`, `src/api/bot-whatsapp.ts`)

## 📚 Reference Docs
- `README.md`, `README-DESIGN-PREMIUM.md`, `RESUMO-EXECUTIVO-PREMIUM.md`, `CYBER-COMPONENTS-STATUS.md`, `GUIA-IMPLEMENTACAO-PREMIUM.md`

## ⚡ Quickstart Example
```bash
npm install
npm run dev:all
# Access frontend at http://localhost:5174, backend at http://localhost:9001
```

---
For new patterns or unclear conventions, check the design and implementation guides above or ask for clarification.