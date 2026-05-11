# _scripts — Tooling regenerate documents

Script sinh các file `.docx`/`.pptx` từ markdown nguồn, hoặc các automation helpers.

## File trong folder

| Script | Mục đích | Output |
|---|---|---|
| `generate-pptx.mjs` | Sinh slide PPTX từ proposal markdown | `../_assets/proposal/Reborn-Loyalty-Proposal.pptx` |
| `generate-bao-gia-docx.mjs` | Sinh báo giá DOCX | `../_assets/pricing/Bao-gia-Loyalty-Platform.docx` |
| `generate-capex-docx.mjs` | Sinh phân tích CAPEX DOCX (INTERNAL) | `../_assets/pricing/Phan-tich-CAPEX-Allocation-INTERNAL.docx` |
| `generate-phan-tich-docx.mjs` | Sinh phân tích chi phí-margin DOCX (INTERNAL) | `../_assets/pricing/Phan-tich-Chi-phi-Margin-INTERNAL.docx` |
| `generate-survey-loyalty.mjs` | Sinh phiếu khảo sát loyalty XLSX | `../_assets/survey/Phieu-khao-sat-Loyalty.xlsx` |
| `gen-retest-guide.py` | Sinh retest guide DOCX từ bug-report CSV | `../_assets/bug-reports/retest-guide-YYYY-MM-DD.docx` |
| `upgrade-readme-12ms.py` | Helper script readme | n/a |

## Cách chạy

### Node.js (.mjs)

```bash
cd docs/_scripts
npm install   # nếu cần (docx, pptxgenjs, exceljs)
node generate-pptx.mjs
```

### Python (.py)

```bash
cd docs/_scripts
pip install python-docx pandas openpyxl
python gen-retest-guide.py
```

## Quy ước

- Script nhận `.md` nguồn làm input → sinh file output trong `_assets/`
- Output filename không đổi (để link reference không break)
- Khi sửa script, test bằng cách regen + diff output

## Maintain

- Mỗi script có docstring đầu file giải thích input/output
- Khi đổi format markdown nguồn (vd: thêm section), update script tương ứng
- Pin dependency versions trong `package.json` / `requirements.txt`
