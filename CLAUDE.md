# CLAUDE.md — Reborn Community

## Startup
Moi khi bat dau conversation moi:
```bash
node tests/cleanup.mjs
```

## Project structure
- `src/` — Source code (React 18 + TypeScript + Vite)
- `tests/` — Test scripts, testcases, screenshots, reports
- `docs/` — Tai lieu, huong dan backend
- App chay tai `http://localhost:4000`

## Commands
```bash
npm run dev          # Chay dev server
npm run build        # Build production
npm run lint         # ESLint check
```

## Testing
- Test scripts: `tests/test-*.mjs` (Playwright)
- Testcases: `tests/cases/TC-{MODULE}.md`
- Screenshots -> `tests/screenshots/` (auto cleanup 15 ngay)
- Reports -> `tests/reports/` (auto cleanup 15 ngay)
- Chay: `node tests/test-{module}-crud.mjs`

## Backend tasks
- Huong dan backend: `docs/backend-tasks/BACKEND-TASK-{feature}.md`

## Conventions
- Import lodash: dung deep import (`import cloneDeep from "lodash/cloneDeep"`)
- Date: dung date-fns (khong dung moment.js)
- Key trong .map(): dung unique id (`key={item.id ?? index}`), tranh `key={index}`
- Khong dung `alert()`, dung `showToast()` tu `utils/common`
- Khong dung `innerHTML`, dung `textContent` hoac React rendering
