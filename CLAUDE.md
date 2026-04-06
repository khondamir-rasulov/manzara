# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check only — run this after every edit
```

No test suite. `npx tsc --noEmit` must pass with zero errors before any task is complete.

Demo credentials: `admin@manzara.uz / demo1234`

---

## Architecture

### Stack
Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · `motion/react` (Framer Motion) · Recharts · NextAuth v5 (JWT) · `date-fns`

### Request flow

Every page follows the same pattern: **async server component fetches → passes props to `*Client.tsx`**.

```
src/app/(app)/dashboard/page.tsx   ← async server component, calls data.ts
  → DashboardClient.tsx            ← "use client", receives props, renders UI
```

No API routes are used for page data — only for mutations (comments, advance stage).

### Route groups

- `(app)/` — authenticated shell. `(app)/layout.tsx` mounts `<Sidebar>` and `<LanguageProvider>`.
- `(auth)/` — unauthenticated (login). Login page mounts its own `<LanguageProvider>`.

### Data layer — demo mode (no database)

The app runs entirely off static in-memory data. `src/lib/prisma.ts` exists but is unused at runtime.

| File | Role |
|------|------|
| `src/lib/demo-data.ts` | 30 projects, 7 pipeline stages, 3 orgs, 2 users. All dates computed relative to `new Date()` at module load so traffic-light colours stay realistic on any deploy date. |
| `src/lib/data.ts` | Async functions (`getProjects`, `getDashboardStats`, etc.) operating over `DEMO_PROJECTS`. Write operations (`createComment`, `advanceProjectStage`) are no-ops or return stub objects. |
| `src/lib/auth.ts` | NextAuth JWT. Credentials validated against `DEMO_USERS` in demo-data via bcrypt — no DB. |
| `src/app/api/projects/…` | All mutation routes return `403 demo mode`. `/api/overdue` reads from `DEMO_PROJECTS`. |

**To change demo projects**: edit `PROJECT_DESCS` in `demo-data.ts`. Use `deadline(N)` helper where `N` is days from now (negative = already overdue).

### Data model

```
Org → Program → Stage (slaDays, order, StageFields)
                  ↓
              Project (currentStageId, status, priority, sector, deadline)
                  ↓
           ProjectStage (enteredAt, completedAt, status, fieldValues[])
```

`getDashboardStats()` computes all dashboard metrics (SLA compliance, priority/executor breakdowns, deadline risk, stage distribution) in one pass over `DEMO_PROJECTS`.

### Traffic light logic

```ts
// src/lib/utils.ts
ratio = daysInStage / slaDays
< 0.5  → "green"
< 1.0  → "yellow"
≥ 1.0  → "red"
```

Used by pipeline bar chart (`Cell` fill), stuck-projects table, and stage badges.

### Key utilities (`src/lib/utils.ts`)

- `daysInStage(enteredAt)` — days from `enteredAt` to now
- `stageTrafficLight(days, slaDays)` → `"green" | "yellow" | "red"`
- `priorityBadgeClass(priority)` → Tailwind class string for URGENT/HIGH/NORMAL/LOW
- `stageBadgeClass(days, slaDays)` → Tailwind class string based on traffic light

### Auth

NextAuth v5 beta with JWT strategy. `role` and `orgId` are added in the `jwt` callback. Access via `(session.user as any).role` — not typed in default NextAuth types.

### Animations

All animation uses **`motion/react`**, not `framer-motion`. Critical rules to avoid TypeScript errors:

1. Always annotate variant objects: `const x: Variants = { ... }`.
2. Never put `transition` inside variant states — put it on the component or in `MotionConfig`.
3. `ease` values must be strings (`"easeOut"`), not arrays.

`MotionProvider` wraps the app with `<MotionConfig reducedMotion="user">`.

### Internationalisation

Client-side i18n via React context. Three locales: `en`, `ru`, `uz`.

```tsx
const { t, lang } = useLanguage();
// UI strings:        t.dashboard.title
// DB-stored values:  td(t.data.stages, stageName)  // falls back to original string
```

`td(map, value)` in `src/lib/i18n/index.tsx` translates DB-stored stage names, sectors, statuses, project names. The `Translations` type is defined once in `en.ts` — `ru.ts` and `uz.ts` implement it, so TypeScript enforces completeness. **Adding a key requires updating the type definition and all three locale files.**

Language preference persists in `localStorage` under key `manzara-lang`.

### Styling

- Tailwind v4: use `@import "tailwindcss"` — not the old `@tailwind` directives.
- Do not add `@import url(...)` for Google Fonts in `globals.css` (breaks PostCSS).
- `@custom-variant dark` must come **after** all `@import` lines.
- Remove `transition-*` Tailwind classes from any element also animated by Motion — they conflict.

### Deployment

Live at **https://manzara.vercel.app**. GitHub: `khondamir-rasulov/manzara`. Push to `main` → auto-redeploy. No environment variables required for demo mode.
