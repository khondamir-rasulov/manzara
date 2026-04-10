# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000) — NODE_OPTIONS=4 GB heap pre-set
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check — must pass with zero errors before any task is complete
```

No test suite. `npx tsc --noEmit` is the only verification gate.

Demo credentials: `admin@manzara.uz / demo1234`

---

## Architecture

### Stack
Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · `motion/react` (Framer Motion v12) · Recharts · NextAuth v5 beta (JWT) · `date-fns`

### Request flow

Every page follows the same pattern: **async server component fetches → passes props to `*Client.tsx`**.

```
src/app/(app)/dashboard/page.tsx   ← async server component, calls data.ts
  → DashboardClient.tsx            ← "use client", receives props, renders UI
```

No API routes are used for page data — only for mutations (comments, advance stage, status change, delete, workspace docs, project notes).

### Route groups

- `(app)/` — authenticated shell. `(app)/layout.tsx` wraps everything in `<LanguageProvider>` and `<Sidebar>`.
- `(auth)/` — unauthenticated (login page only, has its own `<LanguageProvider>`).

### Data layer — demo mode (no database)

The app runs entirely off static in-memory data. `src/lib/prisma.ts` exists but is unused at runtime. **All in-memory state is shared across all users and lost on server restart.**

| File | Role |
|------|------|
| `src/lib/demo-data.ts` | 30 projects, 7 pipeline stages, 5 orgs, 2 users. All dates computed relative to `new Date()` at module load so traffic-light colours stay realistic on any date. |
| `src/lib/data.ts` | Async functions over `DEMO_PROJECTS`. Mutations (`advanceProjectStage`, `updateProjectStatus`, `deleteProject`) mutate the array in-place. |
| `src/lib/workspace-data.ts` | In-memory workspace docs (6 pre-seeded) and per-project notes (`PROJECT_NOTES` map). |
| `src/lib/auth.ts` | NextAuth JWT. Credentials validated against `DEMO_USERS` in demo-data via bcrypt — no DB. |

**To change demo projects**: edit `PROJECT_DESCS` in `demo-data.ts`. Use the `deadline(N)` helper where `N` is days from now (negative = already overdue).

### API routes

All routes under `src/app/api/` require a valid session (JWT). VIEWER role is blocked from all writes. ADMIN-only: DELETE project, DELETE workspace doc.

```
POST   /api/projects/[id]/advance     advanceProjectStage — mutates DEMO_PROJECTS in-place
PATCH  /api/projects/[id]             updateProjectStatus
DELETE /api/projects/[id]             deleteProject (ADMIN only)
POST   /api/projects/[id]/comments    createComment
GET    /api/projects/[id]/notes       getProjectNotes
PUT    /api/projects/[id]/notes       setProjectNotes
GET    /api/workspace/docs            list all docs
POST   /api/workspace/docs            createWorkspaceDoc
GET    /api/workspace/docs/[id]       getWorkspaceDoc
PATCH  /api/workspace/docs/[id]       updateWorkspaceDoc
DELETE /api/workspace/docs/[id]       deleteWorkspaceDoc (ADMIN only)
GET    /api/overdue                   scans DEMO_PROJECTS for past-deadline actives
```

### Data model

```
Org → Program → Stage (slaDays, order, StageFields)
                  ↓
              Project (currentStageId, status, priority, sector, deadline)
                  ↓
           ProjectStage (enteredAt, completedAt, status, fieldValues[])
```

### Optimistic UI pattern

`ProjectDetailClient.tsx` keeps mutable local state (`stages`, `currentStageId`, `projStatus`) initialised from server props. After any successful mutation API call, state is updated directly — no `router.refresh()` or `window.location.reload()`. This is required because Turbopack's dev-mode caching makes server re-renders unreliable for in-memory data.

### Traffic light logic

```ts
// src/lib/utils.ts
ratio = daysInStage / slaDays
< 0.5  → "green"   (on schedule)
< 1.0  → "yellow"  (approaching)
≥ 1.0  → "red"     (overdue)
```

### Key utilities (`src/lib/utils.ts`)

- `daysInStage(enteredAt)` — days from `enteredAt` to now
- `stageTrafficLight(days, slaDays)` → `"green" | "yellow" | "red"`
- `priorityBadgeClass(priority)` → Tailwind class string
- `stageBadgeClass(days, slaDays)` → Tailwind class string based on traffic light
- `trafficLightClass(days, slaDays)` → progress-bar colour class

### Auth

NextAuth v5 beta, JWT strategy. `role` and `orgId` are injected in the `jwt` callback and accessed as `(session.user as any).role`. Not typed in default NextAuth types — this is intentional for the demo.

### Animations

All animation uses **`motion/react`** (not `framer-motion`). Critical rules to avoid TypeScript errors:

1. Annotate variant objects: `const x: Variants = { ... }` (import from `motion/react`).
2. Never put `transition` inside variant states — put it on the component prop or in `<MotionConfig>`.
3. `ease` values must be strings (`"easeOut"`), not arrays.

`MotionProvider` (in `src/components/providers/`) wraps the app with `<MotionConfig reducedMotion="user">`.

### Internationalisation

Client-side i18n via React context (`src/lib/i18n/`). Three locales: `en`, `ru`, `uz`.

```tsx
const { t, lang } = useLanguage();
// UI strings:        t.dashboard.title
// DB-stored values:  td(t.data.stages, stageName)  // falls back to original string if key missing
```

`td(map, value)` translates DB-stored stage names, sectors, statuses, project names. **Adding any i18n key requires three steps**: add it to the `Translations` type in `en.ts`, then add values to `ru.ts` and `uz.ts`. TypeScript will error if any locale is incomplete.

Language preference persists in `localStorage` under key `manzara-lang`. The `LanguageProvider` defaults to `"uz"` to match the server render and avoid hydration mismatches — `useEffect` then overrides from localStorage.

### Hydration pitfalls

Any value computed from `Date.now()` / `new Date()` during render causes SSR/client mismatch. Fix: initialise as `useState(null)` and compute the real value in `useEffect`. See `todayX` in `GanttClient.tsx` for the reference implementation.

### Styling

- Tailwind v4: use `@import "tailwindcss"` — not the old `@tailwind base/components/utilities` directives.
- Do not add `@import url(...)` for Google Fonts in `globals.css` (breaks PostCSS pipeline).
- Remove `transition-*` Tailwind classes from any element also animated by Motion — they conflict.
- Sidebar background uses CSS variable `var(--sidebar)` (deep indigo `#1e1b4b`).

### Workspace module

`/workspace` — folder-based document library (`src/app/(app)/workspace/`). Four folders: Templates, Normatives, Legal, Contacts. The TZ template pre-populates the O'z DSt 1987:2018 mandatory sections. Documents are edited in-place with 1.5 s debounce autosave. Project-level notes live on each project's detail page under the "Notes" tab (`activeTab` state in `ProjectDetailClient.tsx`).

### Deployment

Live at **https://manzara.vercel.app**. GitHub: `khondamir-rasulov/manzara`. Push to `main` → auto-redeploy. No environment variables are required for demo mode.
