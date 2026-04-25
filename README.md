# Reborn MentorHub — Frontend

Mentor-facing admin + public portal for the MentorHub platform.
Forked from `cloud-crm` (community-hub branch) and rebranded.

## Tech stack

- React 18 + TypeScript
- Vite 7 (build)
- SCSS (+ tokens in `src/pages/MentorHub/_shared/tokens.scss`)
- React Router
- i18next, AG Grid, Highcharts, BPMN.io (inherited from cloud-crm — safe to remove if not needed)

## Quick start

```bash
yarn install
yarn dev           # starts on http://localhost:5173 (default Vite)
# or specific mode:
yarn build:dev
yarn build:prod
```

## Project structure (MentorHub-specific)

```
src/
├── pages/MentorHub/           # New module for this platform
│   ├── _shared/
│   │   ├── tokens.scss         # Design tokens (Fraunces + Geist, ivory/teal/amber)
│   │   ├── MHLayout.tsx        # Shell with sidebar
│   │   └── MHSidebar.tsx       # 6-group admin nav
│   ├── Dashboard/              # Implemented: KPI hero + next session + top courses + AI cross-sell
│   ├── Courses/                # Implemented: status tabs + course grid + create tile
│   ├── SessionReview/          # Implemented: signature AI meeting notes page
│   ├── CourseEdit/             # Scaffolded (coming-soon + preview)
│   ├── LiveSession/            # Scaffolded
│   ├── Students/               # Scaffolded
│   ├── CRM/                    # Scaffolded
│   ├── Tickets/                # Scaffolded
│   ├── Chat/                   # Scaffolded
│   ├── Feedback/               # Scaffolded
│   ├── Revenue/                # Scaffolded
│   ├── Marketing/              # Scaffolded
│   ├── Calendar/               # Scaffolded
│   └── Settings/               # Scaffolded
├── mocks/mentorhub/           # Sample data (6 mentors, 9 students, 4 courses)
└── configs/routes.tsx         # Routes registered at /mh/*
```

## Routes

All MentorHub pages live under `/mh/*`:

| Path | Component |
|---|---|
| `/mh`, `/mh/dashboard` | Dashboard |
| `/mh/courses` | Course list |
| `/mh/courses/new`, `/mh/courses/:id/edit` | Course editor |
| `/mh/session-review/:id` | AI meeting notes |
| `/mh/live-session` | Live teaching UI |
| `/mh/students`, `/mh/crm`, `/mh/tickets`, `/mh/chat` | Student-facing |
| `/mh/feedback`, `/mh/revenue`, `/mh/marketing`, `/mh/calendar`, `/mh/settings` | Others |

## Design system

All styling comes from `src/pages/MentorHub/_shared/tokens.scss`:

- **Fonts**: Fraunces (display serif, italic accent word) + Geist (body) + Geist Mono (labels/metrics)
- **Palette**: Ivory `#FAF7F2`, Teal `#0F766E`/`#134E4A`, Amber `#B45309`, Ink `#0E1713`
- **Patterns**:
  - `.mh-ai-card` — amber/cream background for AI feature blocks
  - `.mh-kpi` — metric card with mono label + serif value
  - `.mh-pill`, `.mh-pill--live`, `.mh-pill--upcoming`, etc. — status pills
  - `h1 em` — italic teal accent word in display headlines

## What the scaffolded pages look like

Each scaffolded page renders a "Coming soon + Xem trước" block (same pattern as the community-hub branch). Click Preview to see a placeholder preview. Dev team (or Claude Code CLI) can then port the full UI from the HTML prototype (located in `/docs/prototype/` — see backend repo for the original HTMLs).

## Porting remaining pages

For each scaffolded page, the HTML prototype contains the complete layout. Claude Code CLI workflow:

1. Open the matching HTML file (e.g. `admin-students.html`)
2. Replace the template in `src/pages/MentorHub/Students/index.tsx` with the ported JSX
3. Move CSS from the HTML file's `<style>` block into `index.scss` (use design tokens from `_shared/tokens.scss`)
4. Replace sample data references with types from `src/mocks/mentorhub/index.ts`
5. Test routes at `/mh/students`

## Notes

- Keep `src/pages/CommunityHub/*` as reference for patterns (ComingSoon, PreviewBanner, shared storage module, mock data structure).
- Firebase, AG Grid, BPMN.io are currently inherited — safe to audit & remove if not needed for MentorHub to reduce bundle size.
- Icons-menu and menu structure come from `src/configs/adminMenu.tsx` (may need a MentorHub-specific menu variant if you want sidebar visible in the CH/CRM admin layout too).

## License

Proprietary — © 2026 Reborn JSC. All rights reserved.
