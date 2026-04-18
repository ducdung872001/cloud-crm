# CLAUDE.md — Reborn Forge

Multi-Project AI-SDLC Platform. Khung skeleton để dựng theo prototype.

## Project structure

- `src/` — React 18 + TypeScript + Vite
  - `layout/` — Rail / Sidebar / Topbar / AppLayout
  - `pages/` — Hub, NotFound (dựng thêm khi cần)
  - `styles/` — tokens.css, global.css, layout.css, components.css
- `docs/prototype/reborn-forge.html` — bản mẫu HTML gốc, tham chiếu UI
- App chạy tại `http://localhost:4000`

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build → dist/
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

## Conventions

- CSS thuần với design tokens trong `src/styles/tokens.css` — không Tailwind/SCSS
- Màu/font/layout **bám sát** `docs/prototype/reborn-forge.html`
- Không `alert()`, không `innerHTML`
- Date: dùng `date-fns` khi cần (chưa cài sẵn)
- Key trong `.map()`: dùng unique id, tránh `key={index}`

## Adding routes

1. Tạo file mới trong `src/pages/`
2. Thêm `<Route>` trong `src/App.tsx`
3. Nếu là rail item, thêm entry trong `src/layout/Rail.tsx`
