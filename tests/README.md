# Tests — Cloud CRM (Community Hub)

## Cau truc

```
tests/
├── cases/              # Testcases documentation (TC-{MODULE}.md)
├── screenshots/        # Screenshots khi test (auto cleanup 15 ngay)
├── reports/            # Ket qua test JSON (auto cleanup 15 ngay)
├── cleanup.mjs         # Script xoa file cu > 15 ngay
├── test-{module}-crud.mjs      # Test CRUD module
├── test-{module}-{flow}.mjs    # Test luong nghiep vu
└── test-seed-{data}.mjs        # Seed du lieu mau
```

## Cai dat

```bash
npm install --save-dev playwright
npx playwright install chromium
```

## Chay test

```bash
# Tung module
node tests/test-member-crud.mjs
node tests/test-checkin-flow.mjs

# Seed du lieu
node tests/test-seed-members.mjs

# Cleanup file cu
node tests/cleanup.mjs
```

## Quy uoc

- Test scripts: `test-{module}-{type}.mjs`
- Testcases: `tests/cases/TC-{MODULE}.md` (ma: TC-{MODULE}-001)
- Screenshots va reports KHONG day len git
- Moi test script phai: login, capture API, assert, screenshot, report JSON, cleanup data
