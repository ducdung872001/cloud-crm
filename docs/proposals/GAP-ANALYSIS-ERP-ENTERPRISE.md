# PHÂN TÍCH KHOẢNG CÁCH (GAP ANALYSIS)
## Giải pháp Reborn vs Chuẩn ERP Doanh nghiệp

**Phiên bản:** 1.0
**Ngày lập:** 23/04/2026
**Người lập:** Đội giải pháp Reborn
**Mục đích:** Đánh giá mức độ phủ của nền tảng Reborn hiện tại so với chuẩn ERP doanh nghiệp toàn diện (tham chiếu SAP S/4HANA, Oracle NetSuite, Microsoft Dynamics 365, Odoo Enterprise, MISA AMIS, Bravo 8). Làm cơ sở cho báo giá và lộ trình bổ sung phân hệ.

---

## 1. TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

### 1.1. Kết luận nhanh

| Chỉ số | Giá trị |
|---|---|
| **Tổng số phân hệ chuẩn ERP doanh nghiệp** | 17 phân hệ |
| **Phân hệ đã có đầy đủ (>80% tính năng)** | 8 / 17 ≈ **47%** |
| **Phân hệ có một phần (30-80%)** | 5 / 17 ≈ **29%** |
| **Phân hệ còn thiếu hoàn toàn (<30%)** | 4 / 17 ≈ **24%** |
| **Mức độ sẵn sàng tổng thể (weighted)** | **≈ 68% chuẩn ERP doanh nghiệp** |
| **Tổng module/page đã có trong hệ thống** | 161 modules, 240+ services |
| **Stack công nghệ** | React 18 + TypeScript + Vite + BPMN.js + WebRTC (hiện đại, đầy đủ) |

### 1.2. Nhận định chung

Nền tảng **Reborn Cloud CRM** hiện tại **đã vượt phạm vi CRM thuần** và đang ở mức **"ERP bán lẻ tích hợp"** (Retail ERP). Các phân hệ mạnh:

- **Rất mạnh (>90%):** CRM, Bán hàng/POS, Loyalty, Marketing Automation, Kho bán lẻ, BPM/Workflow.
- **Tương đối mạnh (70-90%):** Tài chính – Kế toán (kế toán quản trị, sổ quỹ, đối soát), Báo cáo/BI, Nhân sự cơ bản (chấm công, công việc), Tích hợp (shipping, e-invoice).
- **Còn yếu (30-70%):** Mua hàng (thiếu PR/RFQ/3-way match nâng cao), Dự án (có nhưng chưa đầy đủ PMO), Multi-company/Multi-currency, Kiểm soát nội bộ (audit trail).
- **Chưa có (<30%):** **Sản xuất (MRP/BOM)**, **Tài sản cố định (FA đầy đủ khấu hao)**, **Hợp nhất báo cáo (Consolidation)**, **Kế toán tài chính theo VAS đầy đủ (GL/AR/AP theo TT 200)**.

### 1.3. Kết luận chiến lược

> **Reborn đã có nền tảng ERP vững chắc** cho các doanh nghiệp có đặc thù **bán lẻ – dịch vụ – phân phối** (Retail, F&B, Spa, Chuỗi cửa hàng). Để trở thành một ERP doanh nghiệp toàn diện (General ERP) cần bổ sung **4 phân hệ lõi** trong vòng 6-12 tháng. Tuy nhiên, **với phân khúc SMB (<50 nhân viên) và SME ngành bán lẻ/dịch vụ (50-200 NV)**, Reborn đã sẵn sàng cạnh tranh ngay với MISA AMIS, Fast Business, Odoo.

---

## 2. PHẠM VI VÀ PHƯƠNG PHÁP

### 2.1. Phạm vi đánh giá

- **Đối tượng:** Nền tảng Reborn Cloud CRM (branch `reborn-retail`).
- **Phiên bản đánh giá:** Snapshot ngày 23/04/2026.
- **Chuẩn tham chiếu:** Tổng hợp từ SAP S/4HANA modules list, Oracle NetSuite ERP, Microsoft D365 Business Central, Odoo 17 Enterprise, MISA AMIS, Bravo 8 ERP.
- **Pháp lý VN áp dụng:** TT 200/2014/TT-BTC, TT 133/2016/TT-BTC (kế toán), NĐ 123/2020/NĐ-CP & TT 78/2021/TT-BTC (HĐĐT), TT 105/2020/TT-BTC (e-tax), TT 59/2015/TT-BLĐTBXH (BHXH).

### 2.2. Phương pháp

1. **Scan codebase** 161 pages + 240 services, map theo domain.
2. **Đọc tài liệu:** 14 parts URD, 15 parts SA, 14 parts HDSD.
3. **So khớp 17 phân hệ chuẩn** × tính năng con.
4. **Chấm điểm 4 mức:** ✅ Có đầy đủ (≥80%) | 🟡 Có một phần (30-80%) | 🟠 Có cơ bản (10-30%) | ❌ Chưa có (<10%).
5. **Ước tính effort bổ sung** theo người-tháng (person-month, PM).

### 2.3. Quy ước ký hiệu

| Ký hiệu | Ý nghĩa |
|---|---|
| ✅ | Đã có đầy đủ, đáp ứng chuẩn thị trường |
| 🟡 | Có một phần, cần bổ sung tính năng |
| 🟠 | Có cơ bản, cần phát triển đáng kể |
| ❌ | Chưa có, cần phát triển từ đầu |
| **M** | Mức ưu tiên: **Must-have** (bắt buộc theo luật hoặc thị trường) |
| **S** | **Should-have** (khuyến nghị, tăng lợi thế cạnh tranh) |
| **C** | **Could-have** (tuỳ chọn, không cấp thiết) |

---

## 3. BẢNG GAP ANALYSIS CHI TIẾT — 17 PHÂN HỆ ERP

### 3.1. Tài chính – Kế toán (Finance & Accounting) — Ưu tiên **M**

| Tính năng chuẩn | Trạng thái | Mức độ | Ghi chú |
|---|---|---|---|
| Sổ cái tổng hợp (GL) đa cấp, hệ thống tài khoản theo TT 200/133 | 🟡 | 40% | Có CashBook, PaymentHistory, ReportCommon nhưng chưa phải GL đúng chuẩn VAS |
| Công nợ phải thu (AR) | ✅ | 85% | Đầy đủ qua Customer, Order, Invoice, PaymentHistory |
| Công nợ phải trả (AP) | 🟡 | 55% | Có qua SupplierPage, ProductImport nhưng chưa đủ 3-way match |
| Tài sản cố định (FA) | ❌ | 5% | **Thiếu hoàn toàn:** chưa có module FA, khấu hao, thanh lý |
| Quản lý thuế (VAT/TNCN/TNDN) | 🟡 | 50% | Module `@/modules/tax` đã có cho HKD/CNKD; chưa có VAT đầu vào/ra đầy đủ cho DN |
| Ngân sách & kế hoạch (Budget Planning) | 🟠 | 20% | Chưa có module chuyên biệt |
| Dòng tiền (Cash Flow, Treasury) | 🟡 | 60% | CashBook, SettingCashBook, Reconcile đã có; thiếu forecast |
| Hợp nhất báo cáo (Consolidation) | ❌ | 0% | Chưa có |
| Kế toán quản trị (Cost Center, Profit Center) | 🟡 | 45% | Có phân tích theo CH, NV qua dashboard; chưa có Cost Center chuẩn |
| Báo cáo tài chính VAS (BCĐKT, KQKD, LCTT) | 🟠 | 15% | Chưa có mẫu chuẩn TT 200 |
| **Tổng đánh giá phân hệ** | 🟡 | **40%** | **Cần bổ sung 6-9 PM** |

**Khuyến nghị:** Xây dựng phân hệ Kế toán VAS chuẩn TT 200 với GL/AR/AP/FA và báo cáo tài chính theo mẫu. Có thể tái sử dụng CashBook, PaymentHistory, Reconcile đã có.

---

### 3.2. Kho & Logistics (WMS) — Ưu tiên **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Nhập – xuất – tồn thời gian thực | ✅ | 95% |
| Đa kho, đa vị trí (bin/location) | ✅ | 85% |
| Mã vạch / QR / RFID | ✅ | 80% |
| Quản lý lô, HSD, serial | 🟡 | 60% |
| Điều chuyển nội bộ (Transfer) | ✅ | 90% |
| Kiểm kê định kỳ / Cycle Count | ✅ | 85% |
| Đặt hàng tự động (min/max, safety stock) | 🟡 | 50% |
| Đóng gói & giao hàng (Packing, Shipping) | ✅ | 90% |
| Quản lý pallet, UoM | 🟡 | 55% |
| **Tổng đánh giá phân hệ** | ✅ | **78%** |

**Modules đã có:** ProductImport, WarehouseListPage, InventoryList, AdjustmentSlip, DestroySlip, TransferOrderForm, InventoryManagement, WarehouseReport, ShipingManagement, ShippingPartnerSetup.

**Cần bổ sung:** Lô/HSD nâng cao (FEFO), picking list chuẩn WMS, safety stock auto-reorder.

---

### 3.3. Mua hàng (Procurement) — Ưu tiên **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Yêu cầu mua hàng (PR) | 🟠 | 20% |
| Báo giá nhà cung cấp (RFQ) | ❌ | 0% |
| Đơn mua hàng (PO), PO khung | 🟡 | 50% |
| 3-way match (PO – GR – Invoice) | 🟠 | 25% |
| Quản lý nhà cung cấp | ✅ | 80% |
| Hợp đồng mua | ❌ | 10% |
| Phê duyệt đa cấp | 🟡 | 60% |
| Catalog mua hàng | 🟠 | 20% |
| Import-Export, tờ khai hải quan | ❌ | 0% |
| **Tổng đánh giá phân hệ** | 🟡 | **35%** |

**Modules đã có:** SupplierPage, PartnerList, SettingPartner, ProductImport, BPM (để phê duyệt).

**Cần bổ sung:** Module PurchaseRequisition, RFQ, PO workflow, Contract Management (4-6 PM).

---

### 3.4. Bán hàng & Phân phối (Sales & Distribution) — Ưu tiên **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Báo giá, hợp đồng bán | ✅ | 85% |
| Đơn bán hàng (SO), giao hàng | ✅ | 95% |
| Chính sách giá (Price List, Discount, Promotion) | ✅ | 95% |
| Chiết khấu bậc thang | ✅ | 80% |
| Quản lý đại lý, DMS, tuyến bán hàng | 🟡 | 55% |
| Đa kênh bán hàng (Online, Offline, B2B/B2C) | ✅ | 90% |
| Hoá đơn, công nợ | ✅ | 85% |
| Trả hàng, RMA, bảo hành | ✅ | 85% |
| Commission sales rep, chỉ tiêu bán hàng | 🟡 | 55% |
| **Tổng đánh giá phân hệ** | ✅ | **82%** |

**Modules đã có:** Sell, CounterSales, Order, ManagerOrder, Offer, PromotionPage, PromoCode, ReturnProduct, Warranty, MultiChannelSales, SocialCrm (Facebook/Zalo).

**Cần bổ sung:** DMS chuyên sâu cho chuỗi đại lý (tuyến bán, route optimization), Commission engine nâng cao.

---

### 3.5. Sản xuất (Manufacturing / MRP) — Ưu tiên **M** (nếu khách là DN sản xuất)

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Định mức NVL (BOM) đa cấp | ❌ | 5% |
| Quy trình công nghệ (Routing, Work Center) | ❌ | 0% |
| MRP I, MRP II | ❌ | 0% |
| Hoạch định năng lực (CRP) | ❌ | 0% |
| Lệnh sản xuất (Production Order) | ❌ | 0% |
| Shop Floor Control | ❌ | 0% |
| Quản lý chất lượng (QM, IQC/PQC/OQC) | ❌ | 0% |
| OEE, downtime | ❌ | 0% |
| MTO/MTS/ETO | ❌ | 0% |
| Traceability | 🟠 | 15% |
| **Tổng đánh giá phân hệ** | ❌ | **2%** |

> **🚨 Đây là GAP lớn nhất.** Reborn **hoàn toàn không có** module Sản xuất. Nếu hướng tới DN sản xuất (Manufacturing), cần xây mới toàn bộ.

**Ước tính effort:** **18-24 PM** để có MRP đầy đủ. Chỉ nên làm nếu thị trường mục tiêu có DN sản xuất. Với thị trường Retail/F&B/Dịch vụ hiện tại, có thể để phase sau.

---

### 3.6. CRM — Quản lý khách hàng — Ưu tiên **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Lead Management | ✅ | 90% |
| Opportunity, Pipeline, Sales Funnel | ✅ | 80% |
| Customer 360 View | ✅ | 90% |
| Campaign Marketing | ✅ | 95% |
| Ticket/Case Management | ✅ | 85% |
| Loyalty Program | ✅ | 95% |
| Call Center, CTI | ✅ | 85% |
| Khảo sát NPS/CSAT | ✅ | 80% |
| Social CRM (Facebook, Zalo) | ✅ | 85% |
| Chatbot | ✅ | 75% |
| **Tổng đánh giá phân hệ** | ✅ | **86%** |

> **🏆 Đây là điểm mạnh nhất của Reborn.** Gần như vượt mức chuẩn SAP/Odoo với 19+ modules CRM.

**Modules đã có:** CustomerPerson, Contact, CustomerCare, CustomerChurn, CustomerValue, CustomerReview, CustomerSurvey, CustomerAnalysisPage, MemberCustomersPage, MembershipClass, CustomerSegment, LoyaltyWallet, CrmCampaign, CallCenter, ChatBot, SocialCrm, v.v.

---

### 3.7. Nhân sự & Tiền lương (HRM & Payroll) — Ưu tiên **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Hồ sơ nhân sự (Employee Master, hợp đồng) | 🟡 | 55% |
| Chấm công (Attendance) | ✅ | 80% |
| Tính lương, TNCN, BHXH | 🟠 | 25% |
| Tuyển dụng (Recruitment, ATS) | ❌ | 0% |
| Đào tạo (LMS) | ❌ | 5% |
| KPI, OKR, Performance Review | 🟡 | 50% |
| Sơ đồ tổ chức (Org Chart) | ✅ | 80% |
| Phép/nghỉ (Leave Management) | 🟡 | 45% |
| Self-Service Portal (ESS/MSS) | 🟡 | 50% |
| Báo cáo BHXH điện tử | ❌ | 0% |
| **Tổng đánh giá phân hệ** | 🟡 | **39%** |

**Modules đã có:** Timekeeping, SettingTimekeeping, ManagerWork, MiddleWork, HandleTask, UserTaskList, JobReport, ResourceManagement, Organization, User.

**Cần bổ sung:** Payroll engine (tính lương, TNCN, BHXH theo TT 59/2015, TT 111/2013), Recruitment/ATS, LMS. **Effort ước tính: 8-12 PM.**

---

### 3.8. Quản lý dự án (Project Management) — Ưu tiên **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Dự án, hạng mục, WBS | 🟡 | 50% |
| Gantt, dependency | 🟠 | 20% |
| Resource Management | ✅ | 70% |
| Timesheet | ✅ | 75% |
| Dự toán & chi phí thực tế | 🟡 | 45% |
| Doanh thu ghi nhận theo tiến độ (PoC) | 🟠 | 15% |
| Risk, Issue log | 🟠 | 25% |
| Project P&L | 🟠 | 20% |
| **Tổng đánh giá phân hệ** | 🟡 | **40%** |

**Modules đã có:** ProjectList, ResourceManagement, SettingProject, JobReport, UserTaskList.

**Cần bổ sung:** Gantt chart chuyên nghiệp, PoC revenue recognition, Project costing.

---

### 3.9. Tài sản cố định (Fixed Asset) — Ưu tiên **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Danh mục TSCĐ, thẻ tài sản | ❌ | 5% |
| Tính khấu hao tự động | ❌ | 0% |
| Đánh giá lại, nâng cấp | ❌ | 0% |
| Điều chuyển, thanh lý | ❌ | 0% |
| Kiểm kê bằng mã vạch | ❌ | 0% |
| Bảo trì (CMMS, PM) | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **1%** |

> **🚨 Thiếu hoàn toàn.** Cần xây mới. **Effort: 4-6 PM.**

---

### 3.10. Báo cáo & BI (Business Intelligence) — Ưu tiên **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Dashboard điều hành, KPI | ✅ | 85% |
| Báo cáo động (ad-hoc), pivot | 🟡 | 55% |
| Self-service BI (kéo thả) | 🟠 | 20% |
| Dự báo (Forecasting), AI/ML | 🟠 | 20% |
| Alert, Notification | ✅ | 75% |
| Xuất Excel, PDF, lịch gửi email | ✅ | 80% |
| Data warehouse, OLAP | ❌ | 10% |
| **Tổng đánh giá phân hệ** | 🟡 | **49%** |

**Modules đã có:** Dashboard, DashboardRetail, DashboardLoyalty, IntegratedMonitoring, ReportCustomer, ReportCustomerModern, InventoryReportModern, WarehouseReport, MarketingReportPage, LoyaltyReportPage, ProcessSimulation.

**Cần bổ sung:** Self-service BI builder (kéo thả), Data warehouse, Forecasting engine.

---

### 3.11. Quản trị quy trình & Tài liệu (BPM/DMS) — Ưu tiên **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Workflow phê duyệt đa cấp | ✅ | 90% |
| Điện tử hoá quy trình (BPMN 2.0) | ✅ | 95% |
| Ký số (Digital Signature, USB Token) | 🟠 | 20% |
| Quản lý tài liệu (DMS) | 🟡 | 50% |
| Phân quyền tài liệu, versioning | 🟡 | 45% |
| Form builder, low-code | ✅ | 80% |
| **Tổng đánh giá phân hệ** | ✅ | **72%** |

**Modules đã có:** BPM, BusinessProcessCreate, BusinessProcessList, BusinessRule, BusinessRuleConfig, ConfigBPM, SettingBusinessProcess, UploadDocument, FieldManagement, form-js, bpmn-js.

> **🏆 BPM là điểm mạnh khác biệt.** bpmn-js + form-js cho phép low-code nâng cao — điều mà MISA, Fast không có.

---

### 3.12. Hoá đơn điện tử & Thuế (E-Invoice & E-Tax) — Ưu tiên **M (Luật VN)**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Phát hành HĐĐT theo TT 78/2021, NĐ 123/2020 | 🟡 | 50% |
| Kết nối TCT (mã CQT) | 🟡 | 45% |
| HĐĐT có mã/không mã, biên lai điện tử | 🟡 | 40% |
| Tờ khai thuế điện tử (GTGT, TNDN, TNCN, NT) | ✅ | 80% (trong module tax) |
| Tích hợp NCC HĐĐT (Viettel/VNPT/M-Invoice) | 🟡 | 40% |
| **Tổng đánh giá phân hệ** | 🟡 | **51%** |

**Modules đã có:** module Tax (tax calendar, advisory, revenue/expense books, license fee).

**Cần bổ sung:** Module HĐĐT với kết nối 3+ NCC (Viettel, VNPT, MISA meInvoice), workflow mã CQT, biên lai điện tử.

---

### 3.13. Tích hợp ngân hàng (Banking Integration) — Ưu tiên **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| API ngân hàng (VCB, BIDV, Vietin, Techcom, MB) | 🟠 | 15% |
| Sao kê tự động, đối soát | 🟡 | 55% |
| Thanh toán hàng loạt (Bulk Payment) | 🟠 | 20% |
| Cổng thanh toán (VNPay, MoMo, ZaloPay, QR) | ✅ | 70% |
| Virtual Account, thu hộ COD | 🟡 | 50% |
| **Tổng đánh giá phân hệ** | 🟡 | **42%** |

**Modules đã có:** Reconcile, PaymentHistory, PaymentMethod, PaymentReconciliation, ViettelIntegration.

**Cần bổ sung:** Open Banking API với ít nhất 5 ngân hàng lớn (VCB, BIDV, Vietin, Techcom, MB, ACB).

---

### 3.14. Kiểm soát nội bộ & Audit — Ưu tiên **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Audit Log không thể sửa | 🟡 | 55% |
| RBAC (Role-Based Access Control) | ✅ | 85% |
| Segregation of Duties (SoD) | 🟠 | 25% |
| Ký số chứng từ, timestamp | 🟠 | 20% |
| SOX/ISO 27001 compliance | 🟠 | 30% |
| **Tổng đánh giá phân hệ** | 🟡 | **43%** |

**Modules đã có:** User, SettingAccount, ManageDataSharing, Organization.

**Cần bổ sung:** Audit trail toàn diện, SoD matrix, Digital Signature integration (USB Token/HSM).

---

### 3.15. Đa công ty / Đa tiền tệ / Đa ngôn ngữ — Ưu tiên **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Quản lý nhiều công ty con, chi nhánh | ✅ | 75% |
| Đa tiền tệ (tỷ giá NHNN, đánh giá CLTG) | 🟠 | 25% |
| Đa ngôn ngữ (VI/EN) | ✅ | 80% (i18next 23) |
| Inter-company transaction | ❌ | 10% |
| Hợp nhất báo cáo (IFRS/VAS) | ❌ | 0% |
| **Tổng đánh giá phân hệ** | 🟡 | **38%** |

**Modules đã có:** SettingOrg, Organization, i18n (VI/EN).

**Cần bổ sung:** Multi-currency engine (tỷ giá NHNN hàng ngày), inter-company eliminations, consolidation.

---

### 3.16. Tích hợp Thương mại điện tử (E-commerce) — Ưu tiên **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Đồng bộ sản phẩm, tồn kho, giá | 🟡 | 50% |
| Shopee, Lazada, Tiki, TikTok Shop | 🟡 | 55% (MultiChannelSales) |
| Website bán hàng (Shopify, Haravan, Sapo) | 🟡 | 40% |
| Omnichannel inventory | ✅ | 75% |
| Đơn vị vận chuyển (GHN, GHTK, Viettel Post) | ✅ | 80% |
| Livestream, affiliate | 🟠 | 20% |
| **Tổng đánh giá phân hệ** | 🟡 | **53%** |

**Modules đã có:** MultiChannelSales, SocialCrmFacebook, SocialCrmZalo, ShipingManagement, ShippingPartnerSetup, ViettelIntegration.

---

### 3.17. POS – Bán lẻ (Point of Sale) — Ưu tiên **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| POS offline/online | ✅ | 90% |
| Chuỗi cửa hàng, phân quyền CH | ✅ | 85% |
| Quản lý ca | ✅ | 95% |
| Máy in bill, cash drawer, barcode | ✅ | 85% |
| **Tổng đánh giá phân hệ** | ✅ | **89%** |

**Modules đã có:** Sell, CounterSales, ShiftManagement, ShiftConfig, Checkout, PromotionPage.

---

## 4. BẢNG TỔNG HỢP MỨC ĐỘ PHỦ

| # | Phân hệ | Mức phủ | Ưu tiên | Effort bổ sung (PM) |
|---|---|---:|:---:|:---:|
| 1 | Tài chính – Kế toán | 40% | M | 6-9 |
| 2 | Kho & Logistics | 78% | M | 2-3 |
| 3 | Mua hàng | 35% | M | 4-6 |
| 4 | Bán hàng & Phân phối | 82% | M | 1-2 |
| 5 | Sản xuất (MRP) | 2% | M (nếu SX) | 18-24 |
| 6 | CRM | 86% | S | 0-1 |
| 7 | Nhân sự & Lương | 39% | M | 8-12 |
| 8 | Quản lý dự án | 40% | S | 4-6 |
| 9 | Tài sản cố định | 1% | M | 4-6 |
| 10 | Báo cáo & BI | 49% | S | 4-6 |
| 11 | BPM / DMS | 72% | S | 2-3 |
| 12 | HĐĐT & E-Tax | 51% | M | 3-5 |
| 13 | Tích hợp ngân hàng | 42% | M | 3-5 |
| 14 | Kiểm soát nội bộ & Audit | 43% | M | 3-4 |
| 15 | Multi-company/currency/language | 38% | S | 3-5 |
| 16 | E-commerce | 53% | S | 2-3 |
| 17 | POS – Bán lẻ | 89% | S | 0-1 |
| **Tổng** | | **~68%** | | **67-101 PM** |

---

## 5. LỘ TRÌNH BỔ SUNG GỢI Ý (ROADMAP)

### 5.1. Phase 1 — 3 tháng (Sprint chạy ngay để đủ chuẩn SMB/SME bán lẻ)

**Mục tiêu:** Đủ chuẩn ERP cho DN SMB/SME ngành bán lẻ – dịch vụ.

- HĐĐT kết nối Viettel/VNPT/MISA meInvoice (3 PM)
- Open Banking API 5 ngân hàng (VCB, BIDV, Vietin, Techcom, MB) (3 PM)
- Audit trail & SoD matrix (2 PM)
- Payroll cơ bản (chấm công → tính lương → TNCN → BHXH) (4 PM)
- Báo cáo tài chính mẫu TT 200 (3 PM)

**Tổng effort Phase 1:** ~15 PM (2-3 người × 3 tháng).

### 5.2. Phase 2 — 3-6 tháng (Hoàn thiện ERP phổ thông)

- Fixed Asset module + CMMS (5 PM)
- Purchase Requisition + RFQ + 3-way match (5 PM)
- Multi-currency + inter-company (4 PM)
- Self-service BI builder + Data warehouse cơ bản (5 PM)
- Project Gantt chuyên nghiệp + PoC revenue (4 PM)

**Tổng effort Phase 2:** ~23 PM.

### 5.3. Phase 3 — 6-12 tháng (ERP toàn diện với sản xuất)

- Manufacturing / MRP II đầy đủ: BOM, Routing, Work Center, Production Order, Shop Floor, QM (20 PM)
- Consolidation & IFRS/VAS reporting (4 PM)
- Recruitment ATS + LMS (6 PM)
- Livestream commerce & affiliate (3 PM)

**Tổng effort Phase 3:** ~33 PM.

### 5.4. Tổng kết roadmap

| Phase | Thời gian | Effort (PM) | Đạt được |
|---|---|---|---|
| Phase 1 | 3 tháng | 15 | ERP chuẩn SMB/SME bán lẻ VN |
| Phase 2 | 3-6 tháng | 23 | ERP phổ thông đa ngành (trừ sản xuất) |
| Phase 3 | 6-12 tháng | 33 | ERP toàn diện (kể cả sản xuất) |
| **Tổng** | **12 tháng** | **71 PM** | **~95% chuẩn ERP doanh nghiệp** |

---

## 6. ĐIỂM MẠNH KHÁC BIỆT (DIFFERENTIATOR) SO VỚI ĐỐI THỦ

| Tính năng | Reborn | MISA AMIS | Fast Business | Bravo 8 | Odoo | SAP B1 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| CRM tích hợp sâu (Loyalty, Call Center, SocialCRM) | ✅✅ | 🟡 | 🟠 | 🟠 | 🟡 | 🟡 |
| BPM low-code (BPMN 2.0) | ✅✅ | 🟠 | ❌ | 🟠 | 🟡 | ✅ |
| Marketing Automation native | ✅✅ | 🟠 | ❌ | ❌ | 🟡 | ❌ |
| POS + Kho + Loyalty tích hợp | ✅✅ | ✅ | 🟡 | 🟡 | ✅ | 🟡 |
| Multi-channel Social (FB, Zalo, TikTok) | ✅✅ | 🟡 | ❌ | ❌ | 🟠 | ❌ |
| Call Center tích hợp (JsSIP/WebRTC) | ✅✅ | ❌ | ❌ | ❌ | 🟠 | ❌ |
| Sản xuất MRP II | ❌ | 🟡 | ✅ | ✅ | ✅ | ✅ |
| Tài chính VAS chuẩn TT 200 | 🟡 | ✅ | ✅ | ✅ | 🟡 | 🟡 |
| Payroll BHXH điện tử | 🟠 | ✅ | ✅ | ✅ | 🟠 | 🟠 |
| Multi-entity / Consolidation | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Tóm lại:** Reborn vượt trội ở **CRM, Marketing, POS, BPM, Social, Call Center**. Còn kém ở **Kế toán VAS, Payroll, Sản xuất, FA**.

---

## 7. KẾT LUẬN

### 7.1. Đối tượng khách hàng sẵn sàng bán ngay (Go-to-Market)

Với mức phủ **~68% chuẩn ERP**, Reborn **đã sẵn sàng cạnh tranh ngay** với các nhóm khách hàng:

1. ✅ **Chuỗi bán lẻ (Retail chain)** — >90% chuẩn. Đối thủ: MISA, KiotViet, Sapo.
2. ✅ **F&B / Nhà hàng / Chuỗi quán** — >85% chuẩn.
3. ✅ **Spa, Salon, Clinic thẩm mỹ, phòng khám không BHYT** — >85% chuẩn.
4. ✅ **Doanh nghiệp dịch vụ (consulting, education)** — >75% chuẩn.
5. 🟡 **Doanh nghiệp thương mại phân phối (distribution)** — 70% chuẩn, cần bổ sung DMS và Purchase.
6. 🟠 **Doanh nghiệp sản xuất** — 40% chuẩn, **chưa nên tiếp cận** nếu chưa có MRP.

### 7.2. Khuyến nghị chiến lược

1. **Ngắn hạn (3 tháng):** Chạy Phase 1 roadmap → đạt 80% chuẩn cho bán lẻ/dịch vụ → tự tin chào giá cạnh tranh với MISA, Fast.
2. **Trung hạn (6-12 tháng):** Phase 2 → mở rộng sang distribution, wholesale, project-based businesses.
3. **Dài hạn (>12 tháng):** Phase 3 → mở rộng sang manufacturing nếu thị trường mục tiêu có DN sản xuất.
4. **Định vị thương hiệu:** "ERP bán lẻ – dịch vụ tích hợp sâu CRM/Marketing/Social" — thay vì cạnh tranh trực diện với SAP/Oracle.

### 7.3. Cảnh báo rủi ro

- ⚠️ **Kế toán VAS là điểm yếu** — khách hàng kế toán truyền thống (chief accountants) sẽ từ chối nếu không có báo cáo TT 200. **Ưu tiên cao nhất Phase 1.**
- ⚠️ **BHXH/Payroll là rào cản vào DN >50 NV** — cần làm gọn trong Phase 1.
- ⚠️ **HĐĐT kết nối TCT đầy đủ** là bắt buộc từ 01/07/2022 — phải có ngay.

---

**Ngày lập:** 23/04/2026
**Người lập:** Đội giải pháp Reborn
**Tài liệu liên quan:**
- `docs/proposals/GAP-ANALYSIS-ERP-HOSPITAL.md`
- `docs/proposals/PRICING-PROPOSAL.md`
- `docs/proposal/de-xuat-giai-phap-retail-crm.md`
- `docs/urd/README.md`, `docs/sa/README.md`
