# Docs — Cloud CRM (nhánh `reborn-fitpro`)

> Index điều hướng toàn bộ thư mục tài liệu. Mỗi thư mục lớn có chủ đề riêng.

---

## Cấu trúc

```
docs/
├── README.md                        # ← bạn đang ở đây
│
├── fitpro/                          # ⭐ Tài liệu sản phẩm FitPro
│   ├── 01-context/                  # Bối cảnh kinh doanh
│   ├── 02-scope/                    # Phạm vi sản phẩm, personas, F1-F11
│   ├── 03-architecture/             # Business model, tech, lợi thế công nghệ
│   ├── 04-roadmap/                  # Business + Tech roadmap 5 phase
│   ├── 05-current-state/            # GAP vs community-hub, 9 open decisions
│   ├── 06-cost-estimate/            # Sizing, break-even, margin, định giá
│   ├── 07-business-case/            # Exec summary, investment thesis, risks
│   ├── glossary.md                  # Từ điển dùng chung
│   ├── userguides/                  # HDSD FitPro v0.6
│   ├── exports/                     # File DOCX BoD
│   └── 99-source-archive/           # Nguồn gốc PO (PDF, docx, audio, slides)
│
├── platform-reborn-crm/             # Tài liệu Reborn CRM Platform (đa ngành)
│   ├── urd/                         # User Requirement Document
│   ├── architecture/                # Solution Architecture Document
│   └── userguides/                  # HDSD Reborn CRM (Spa/Store/Community)
│
├── operations/                      # Tài liệu nội bộ dev/ops
│   ├── tech-debt.md
│   ├── uncertain-bugs.md
│   └── frontend-review/
│
├── products/                        # Đề xuất sản phẩm khác (ngoài FitPro)
│   └── tax-compliance-hokd/         # Tax compliance hộ kinh doanh
│
├── backend-tasks/                   # Task BE theo microservice (15 service)
├── handoff/                         # Microservices registry + backend setup
└── archive/                         # Bản cũ, legacy, mồ côi (chỉ tra cứu)
```

---

## Khi bạn là…

### 👔 Ban Giám đốc (BoD)
1. Đọc trước: [`fitpro/07-business-case/executive-summary.md`](fitpro/07-business-case/executive-summary.md) (3 phút).
2. File DOCX đẹp cho họp: [`fitpro/exports/FitPro_2027_Phan_Tich_Tong_Hop.docx`](fitpro/exports/FitPro_2027_Phan_Tich_Tong_Hop.docx).
3. Cần chốt 9 quyết định: [`fitpro/05-current-state/open-decisions.md`](fitpro/05-current-state/open-decisions.md).

### 🧑‍💼 Product Owner / BA
- Phạm vi & F1-F11: [`fitpro/02-scope/`](fitpro/02-scope/)
- Roadmap: [`fitpro/04-roadmap/`](fitpro/04-roadmap/)
- GAP hiện trạng: [`fitpro/05-current-state/gap-analysis.md`](fitpro/05-current-state/gap-analysis.md)
- Glossary: [`fitpro/glossary.md`](fitpro/glossary.md)

### 👨‍💻 Frontend Developer
- Architecture: [`fitpro/03-architecture/tech-architecture.md`](fitpro/03-architecture/tech-architecture.md)
- Microservice mapping: [`fitpro/03-architecture/microservices-mapping.md`](fitpro/03-architecture/microservices-mapping.md)
- Reborn CRM SAD (chi tiết FE): [`platform-reborn-crm/architecture/`](platform-reborn-crm/architecture/)
- Tech debt FE: [`operations/tech-debt.md`](operations/tech-debt.md)
- Bugs uncertain: [`operations/uncertain-bugs.md`](operations/uncertain-bugs.md)

### ⚙️ Backend Developer / Microservice owner
- Microservices registry: [`handoff/MICROSERVICES.md`](handoff/MICROSERVICES.md)
- Backend setup: [`handoff/BACKEND_SETUP.md`](handoff/BACKEND_SETUP.md)
- Task BE theo service: [`backend-tasks/<service>/`](backend-tasks/)

### 🎨 UX/UI Designer
- 5 cấp khách hàng + journey 12 chặng: [`fitpro/02-scope/customer-journey.md`](fitpro/02-scope/customer-journey.md)
- Rebrand checklist: [`fitpro/05-current-state/gap-analysis.md`](fitpro/05-current-state/gap-analysis.md) §5.5
- HDSD hiện tại: [`fitpro/userguides/`](fitpro/userguides/)

### 🧪 QA / Tester
- HDSD test reference: [`fitpro/userguides/`](fitpro/userguides/), [`platform-reborn-crm/userguides/`](platform-reborn-crm/userguides/)
- URD (yêu cầu cần đáp ứng): [`platform-reborn-crm/urd/`](platform-reborn-crm/urd/)
- Bugs đã biết: [`operations/uncertain-bugs.md`](operations/uncertain-bugs.md)

---

## Quy ước tài liệu

| Quy ước | Diễn giải |
|---|---|
| **Tiếng Việt có dấu** | Mọi tài liệu dùng tiếng Việt có dấu. Không bao giờ dùng không dấu. |
| **Markdown chuẩn** | GFM (GitHub Flavored Markdown). Table dùng `|---|`. Code block dùng triple backtick. |
| **Đường dẫn tương đối** | Khi link giữa các file, dùng đường dẫn tương đối, không absolute. |
| **Mã định danh** | Dùng `Mã A007`, `H007`, `I007`, `C007`, `N007` thay vì viết bằng từ. |
| **Mức ưu tiên** | ⭐⭐⭐ Cao · ⭐⭐ Trung · ⭐ Thấp |
| **Trạng thái** | 🟢 OK · 🟡 Cảnh báo · 🔴 Critical / chưa làm |
| **Pattern cấu trúc** | Học từ `reborn-tnpm/docs/tnpm-platform/` — mỗi sản phẩm dùng `01-context` đến `07-business-case` + `99-source-archive`. |

---

## File DOCX export cho meeting

Khi cần bản DOCX đẹp trình BoD, dùng:

```bash
cd docs/fitpro/exports
python build_docx.py
```

Output: `FitPro_2027_Phan_Tich_Tong_Hop.docx` (~46 KB) — gồm trang bìa, mục lục, footer page numbers, bảng zebra. Đã test trên Word + LibreOffice.

---

## Lịch sử quy hoạch

| Ngày | Thay đổi |
|---|---|
| 2026-04-15 | Thiết lập `docs/fitpro/` ban đầu — GAP analysis vs community-hub |
| 2026-05-06 | Bổ sung Requirements + GAP_AND_PLAN từ meeting Vincom Center 3 |
| 2026-05-11 | Thêm Strategic Blueprint + Roadmap 2027 từ PO |
| 2026-05-12 | **Quy hoạch lại toàn bộ docs/** theo pattern `reborn-tnpm`; viết lại tài liệu FitPro chuẩn 7 chương; cleanup file cũ vào archive |
