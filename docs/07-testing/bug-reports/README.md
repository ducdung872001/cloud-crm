# Bug Reports

| File | Mô tả |
|---|---|
| `bug-report-tester.csv` | Bug report list từ tester thực tế (markdown-readable) |
| `../../_assets/bug-reports/bug-report-tester.xlsx` | Excel với formatting |
| `../../_assets/bug-reports/retest-guide-2026-04-15.docx` | Retest guide đợt 2026-04-15 |
| `../../_scripts/gen-retest-guide.py` | Script sinh retest guide DOCX từ CSV |
| `../../_scripts/upgrade-readme-12ms.py` | Helper script |

## Quy ước

Theo memory project: **sau mỗi test PASS, auto-archive bug đó khỏi `bug-report-tester.csv`** + cleanup `../uncertain-bugs.md` và `tech-debt-inventory.md` tương ứng.

Bug mới phát hiện → append vào CSV với cột: `id, module, severity, description, reproduce_steps, found_at, status`.
