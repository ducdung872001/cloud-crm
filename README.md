# Reborn Forge

Multi-Project AI-SDLC Platform — khung skeleton để dựng theo prototype tại
[`docs/prototype/reborn-forge.html`](docs/prototype/reborn-forge.html).

## Cài & chạy

```bash
npm install
npm run dev      # http://localhost:4000
npm run build    # build production → dist/
npm run lint     # ESLint
npm run type-check
```

## Stack

- Vite + React 18 + TypeScript
- React Router v7
- CSS thuần với design tokens (không dùng Tailwind/SCSS)
- Husky + lint-staged + Prettier + ESLint

## Cấu trúc

```
src/
├── main.tsx                  Entry
├── App.tsx                   Router
├── layout/
│   ├── AppLayout.tsx         Grid: Rail + Sidebar + Topbar + Outlet
│   ├── Rail.tsx              Icon rail bên trái (64px)
│   ├── Sidebar.tsx           Workspace + Pipeline + Artifacts (260px)
│   └── Topbar.tsx            Breadcrumb + Search + Role switcher
├── pages/
│   ├── Hub.tsx               Projects Hub (placeholder)
│   └── NotFound.tsx
└── styles/
    ├── tokens.css            Màu / font / shadow — trích từ prototype
    ├── global.css            Reset + scrollbar
    ├── layout.css            Grid + Rail + Sidebar + Topbar + Main
    └── components.css        Hero + Button + Card + Tag + Empty
```

## Next steps

Mở [docs/prototype/reborn-forge.html](docs/prototype/reborn-forge.html) và dựng
dần các view: hub, inbox, stage-1..7, sessions, changes, deliverables, analytics,
prompts, team, clients, settings.
