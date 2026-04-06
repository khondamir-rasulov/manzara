# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Important — Next.js version**: This project uses Next.js 16 with React 19. APIs and conventions differ from training data. Check `node_modules/next/dist/docs/` before writing any framework-specific code.

---

## Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build + type-check
npm run lint         # ESLint

# Database (Docker on port 5433 — NOT 5432, which is reserved for local Postgres)
docker compose up -d               # Start Postgres container
npm run db:push                    # Push schema changes (no migrations)
npm run db:seed                    # Seed demo data (30 projects, users, orgs)
npm run db:studio                  # Prisma Studio GUI

# Type-check only (faster than full build)
npx tsc --noEmit
```

**Prerequisites**: `DATABASE_URL` in `.env` must point to port 5433 (Docker maps `5433→5432`). The local system Postgres runs on 5432 — connecting there causes P1010 auth errors.

Demo credentials after seeding: `admin@manzara.uz / demo1234`, `manager@manzara.uz / demo1234`

---

## Architecture

### Request flow

Every page follows the same pattern: **server component fetches data → passes to `*Client.tsx`**.

```
src/app/(app)/dashboard/page.tsx   ← async server component, calls data.ts
  → DashboardClient.tsx            ← "use client", receives props, renders UI + motion
```

Server components call `getProjects()` / `getDashboardStats()` / etc. from `src/lib/data.ts`, which wraps Prisma queries. No API routes are used for page data.

### Route groups

- `(app)/` — authenticated pages (Dashboard, Projects, Board, Settings, Project detail). Wrapped by `(app)/layout.tsx` which mounts `<Sidebar>` and `<LanguageProvider>`.
- `(auth)/` — unauthenticated pages (Login). Has no layout file; login page mounts its own `<LanguageProvider>`.
- `api/auth/[...nextauth]` — NextAuth handler.

### Database layer

- **Prisma 7** with `@prisma/adapter-pg` (pg Pool). The client is **not** the standard HTTP-based one — it uses the TCP adapter directly.
- Client is instantiated once in `src/lib/prisma.ts` using a `globalThis` singleton (prevents hot-reload connection exhaustion in dev).
- Schema lives in `prisma/schema.prisma`. **No `DATABASE_URL` in schema** — the URL is injected via `prisma.config.ts` which reads from `process.env.DATABASE_URL`.
- Generated client outputs to `src/generated/prisma/client` (not the default location). Import from `@/generated/prisma/client`.

### Auth

NextAuth v5 beta with JWT strategy. `role` and `orgId` are added to the JWT in the `jwt` callback and forwarded to the session. Access them via `(session.user as { role?: string }).role` — they are not typed in the default NextAuth types.

### Animations

All animation uses the **`motion`** package (`motion/react`), not `framer-motion`.

Critical rules to avoid TypeScript errors:
1. Always annotate variant objects: `const x: Variants = { ... }` — never use inferred types.
2. Never put `transition` inside variant states (`hidden`/`show`). Put transitions on the component itself or in `MotionConfig`.
3. `ease` values must be strings (`"easeOut"`) not arrays.

`MotionProvider` wraps the whole app with `<MotionConfig reducedMotion="user">`.

### Internationalisation

Client-side i18n via React context. Three locales: `en`, `ru`, `uz` (Uzbek Latin).

- `src/lib/i18n/index.tsx` — `LanguageProvider`, `useLanguage()`, `td()` helper
- `src/lib/i18n/locales/{en,ru,uz}.ts` — typed translation objects

Usage in components:
```tsx
const { t, lang, setLang } = useLanguage();
// UI strings: t.dashboard.title
// DB-stored data (stage/sector names, statuses): td(t.data.stages, stageName)
```

`td(map, value)` falls back to the original string if the key isn't in the map. When adding new seeded stage names or sector names, add them to all three locale files under `data.stages` / `data.sectors`.

The `Translations` type is defined in `en.ts` and both `ru.ts` and `uz.ts` implement it (`const ru: Translations = { ... }`). Changing the type requires updating all three locales.

Language preference persists in `localStorage` under key `manzara-lang`.

### Styling

- **Tailwind v4** — `@import "tailwindcss"` replaces the old `@tailwind` directives. PostCSS processes it.
- Custom CSS variables defined in `:root` in `globals.css` (sidebar colour, brand palette, etc).
- Fonts loaded via `next/font/google` (`DM_Sans`, `DM_Mono`) in `app/layout.tsx` as CSS variables `--font-dm-sans` / `--font-dm-mono`.
- **Do not** add `@import url(...)` for Google Fonts to `globals.css` — Tailwind v4's PostCSS expands `@import "tailwindcss"` inline, making any subsequent `@import` a PostCSS error.
- `@custom-variant dark` must come **after** all `@import` lines.
- Remove `transition-*` Tailwind classes from any element that also uses Motion — they conflict and cause stutter.

### Data model summary

```
Org → Program → Stage → StageField
                 ↓
              Project (has currentStageId, status, sector, legalBasis, deadline)
                 ↓
           ProjectStage (enteredAt, completedAt, status)
                 ↓
            FieldValue
```

A **Program** is a named pipeline config (e.g. "ПКМ 425"). It owns an ordered list of **Stages**, each with `slaDays` and typed **StageFields**. A **Project** moves through stages; its current position is `currentStageId`. Each `ProjectStage` row tracks when it entered, when it completed, and holds the field values for that stage.
