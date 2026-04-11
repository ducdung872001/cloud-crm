# Ket qua Auto Scan — 2026-04-11

**Run ID:** txysns
**Pass:** 0 | **Fail:** 88 | **Total:** 88

---

## Cac trang co loi

| # | Trang | Route | Loai loi | Chi tiet |
|---|-------|-------|----------|----------|
| 1 | Login page | `/login` | API_ERROR | GET http://localhost:4000/login → 404 |
| 2 | Login page | `/login` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 3 | Dashboard | `/dashboard` | API_ERROR | GET http://localhost:4000/dashboard → 404 |
| 4 | Dashboard | `/dashboard` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 5 | POS - Ban hang | `/create_sale_add` | API_ERROR | GET http://localhost:4000/create_sale_add → 404 |
| 6 | POS - Ban hang | `/create_sale_add` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 7 | Hoa don ban hang | `/sale_invoice` | API_ERROR | GET http://localhost:4000/sale_invoice → 404 |
| 8 | Hoa don ban hang | `/sale_invoice` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 9 | Don hang | `/order` | API_ERROR | GET http://localhost:4000/order → 404 |
| 10 | Don hang | `/order` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 11 | Don tam | `/temporary_order_list` | API_ERROR | GET http://localhost:4000/temporary_order_list → 404 |
| 12 | Don tam | `/temporary_order_list` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 13 | Theo doi don | `/order_tracking` | API_ERROR | GET http://localhost:4000/order_tracking → 404 |
| 14 | Theo doi don | `/order_tracking` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 15 | Khach tra hang | `/return_invoice` | API_ERROR | GET http://localhost:4000/return_invoice → 404 |
| 16 | Khach tra hang | `/return_invoice` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 17 | Don hang da kenh | `/multi_channel_sales` | API_ERROR | GET http://localhost:4000/multi_channel_sales → 404 |
| 18 | Don hang da kenh | `/multi_channel_sales` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 19 | Giao hang | `/shipping` | API_ERROR | GET http://localhost:4000/shipping → 404 |
| 20 | Giao hang | `/shipping` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 21 | Doi tac van chuyen | `/shipping_parther` | API_ERROR | GET http://localhost:4000/shipping_parther → 404 |
| 22 | Doi tac van chuyen | `/shipping_parther` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 23 | Phi van chuyen | `/shipping_fee_config` | API_ERROR | GET http://localhost:4000/shipping_fee_config → 404 |
| 24 | Phi van chuyen | `/shipping_fee_config` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 25 | BC Van chuyen | `/dashboard_shipping` | API_ERROR | GET http://localhost:4000/dashboard_shipping → 404 |
| 26 | BC Van chuyen | `/dashboard_shipping` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 27 | So kho | `/inventory` | API_ERROR | GET http://localhost:4000/inventory → 404 |
| 28 | So kho | `/inventory` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 29 | Kho hang | `/warehouse` | API_ERROR | GET http://localhost:4000/warehouse → 404 |
| 30 | Kho hang | `/warehouse` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 31 | Phieu nhap | `/invoice_order` | API_ERROR | GET http://localhost:4000/invoice_order → 404 |
| 32 | Phieu nhap | `/invoice_order` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 33 | Dieu chinh kho | `/adjustment_slip` | API_ERROR | GET http://localhost:4000/adjustment_slip → 404 |
| 34 | Dieu chinh kho | `/adjustment_slip` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 35 | Xuat huy | `/destroy_slip` | API_ERROR | GET http://localhost:4000/destroy_slip → 404 |
| 36 | Xuat huy | `/destroy_slip` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 37 | Chuyen kho | `/inventory_transfer_document` | TIMEOUT | page.$: Execution context was destroyed, most likely because of a navigation |
| 38 | Kiem ke | `/inventory_checking` | BLANK_PAGE | Body chi co 0 ky tu |
| 39 | Kiem ke | `/inventory_checking` | API_ERROR | GET http://localhost:4000/inventory_checking → 404 |
| 40 | Kiem ke | `/inventory_checking` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 41 | Kiem ke | `/inventory_checking` | NO_CONTENT | Khong tim thay noi dung chinh |
| 42 | Ton kho SP | `/product_inventory` | API_ERROR | GET http://localhost:4000/product_inventory → 404 |
| 43 | Ton kho SP | `/product_inventory` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 44 | SP da ban | `/products_sold` | BLANK_PAGE | Body chi co 0 ky tu |
| 45 | SP da ban | `/products_sold` | API_ERROR | GET http://localhost:4000/products_sold → 404 |
| 46 | SP da ban | `/products_sold` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 47 | SP da ban | `/products_sold` | NO_CONTENT | Khong tim thay noi dung chinh |
| 48 | Nguyen vat lieu | `/material` | BLANK_PAGE | Body chi co 0 ky tu |
| 49 | Nguyen vat lieu | `/material` | TIMEOUT | page.$: Execution context was destroyed, most likely because of a navigation |
| 50 | BC Kho | `/report_warehouse` | API_ERROR | GET http://localhost:4000/report_warehouse → 404 |
| 51 | BC Kho | `/report_warehouse` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 52 | DS Khach hang | `/customer_list` | API_ERROR | GET http://localhost:4000/customer_list → 404 |
| 53 | DS Khach hang | `/customer_list` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 54 | KH Ca nhan | `/customer_person` | API_ERROR | GET http://localhost:4000/customer_person → 404 |
| 55 | KH Ca nhan | `/customer_person` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 56 | Nha cung cap | `/supplier_list` | API_ERROR | GET http://localhost:4000/supplier_list → 404 |
| 57 | Nha cung cap | `/supplier_list` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 58 | Nguoi lien he | `/contact` | API_ERROR | GET http://localhost:4000/contact → 404 |
| 59 | Nguoi lien he | `/contact` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 60 | Phan tich KH | `/customer_analysis` | BLANK_PAGE | Body chi co 0 ky tu |
| 61 | Phan tich KH | `/customer_analysis` | API_ERROR | GET http://localhost:4000/customer_analysis → 404 |
| 62 | Phan tich KH | `/customer_analysis` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 63 | Phan tich KH | `/customer_analysis` | NO_CONTENT | Khong tim thay noi dung chinh |
| 64 | Cham soc KH | `/customer_care_page` | BLANK_PAGE | Body chi co 0 ky tu |
| 65 | Cham soc KH | `/customer_care_page` | API_ERROR | GET http://localhost:4000/customer_care_page → 404 |
| 66 | Cham soc KH | `/customer_care_page` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 67 | Cham soc KH | `/customer_care_page` | NO_CONTENT | Khong tim thay noi dung chinh |
| 68 | Dashboard TC | `/finance_management/dashboard` | BLANK_PAGE | Body chi co 0 ky tu |
| 69 | Dashboard TC | `/finance_management/dashboard` | API_ERROR | GET http://localhost:4000/finance_management/dashboard → 404 |
| 70 | Dashboard TC | `/finance_management/dashboard` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 71 | Dashboard TC | `/finance_management/dashboard` | NO_CONTENT | Khong tim thay noi dung chinh |
| 72 | So thu chi | `/finance_management/cashbook` | BLANK_PAGE | Body chi co 0 ky tu |
| 73 | So thu chi | `/finance_management/cashbook` | API_ERROR | GET http://localhost:4000/finance_management/cashbook → 404 |
| 74 | So thu chi | `/finance_management/cashbook` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 75 | So thu chi | `/finance_management/cashbook` | NO_CONTENT | Khong tim thay noi dung chinh |
| 76 | Mau phieu | `/finance_management/cashbook_template` | BLANK_PAGE | Body chi co 0 ky tu |
| 77 | Mau phieu | `/finance_management/cashbook_template` | AUTH_REDIRECT | Bi redirect ve login |
| 78 | Mau phieu | `/finance_management/cashbook_template` | API_ERROR | GET http://localhost:4000/finance_management/cashbook_template → 404 |
| 79 | Mau phieu | `/finance_management/cashbook_template` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 80 | Mau phieu | `/finance_management/cashbook_template` | TIMEOUT | page.$: Execution context was destroyed, most likely because of a navigation |
| 81 | Quan ly quy | `/finance_management/fund_management` | BLANK_PAGE | Body chi co 0 ky tu |
| 82 | Quan ly quy | `/finance_management/fund_management` | API_ERROR | GET http://localhost:4000/finance_management/fund_management → 404 |
| 83 | Quan ly quy | `/finance_management/fund_management` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 84 | Quan ly quy | `/finance_management/fund_management` | NO_CONTENT | Khong tim thay noi dung chinh |
| 85 | Cong no | `/finance_management/debt_management` | BLANK_PAGE | Body chi co 0 ky tu |
| 86 | Cong no | `/finance_management/debt_management` | API_ERROR | GET http://localhost:4000/finance_management/debt_management → 404 |
| 87 | Cong no | `/finance_management/debt_management` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 88 | Cong no | `/finance_management/debt_management` | NO_CONTENT | Khong tim thay noi dung chinh |
| 89 | Kiem ke ca | `/finance_management/shift_inventory` | API_ERROR | GET http://localhost:4000/finance_management/shift_inventory → 404 |
| 90 | Kiem ke ca | `/finance_management/shift_inventory` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 91 | Doi soat TT | `/payment_control` | API_ERROR | GET http://localhost:4000/payment_control → 404 |
| 92 | Doi soat TT | `/payment_control` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 93 | LS Thanh toan | `/payment_history` | API_ERROR | GET http://localhost:4000/payment_history → 404 |
| 94 | LS Thanh toan | `/payment_history` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 95 | Hoa don VAT | `/invoiceVAT` | API_ERROR | GET http://localhost:4000/invoiceVAT → 404 |
| 96 | Hoa don VAT | `/invoiceVAT` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 97 | Khuyen mai | `/promotional_program` | API_ERROR | GET http://localhost:4000/promotional_program → 404 |
| 98 | Khuyen mai | `/promotional_program` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 99 | BC Khuyen mai | `/promotional_report` | API_ERROR | GET http://localhost:4000/promotional_report → 404 |
| 100 | BC Khuyen mai | `/promotional_report` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 101 | Tich diem | `/loyalty_point_ledger` | API_ERROR | GET http://localhost:4000/loyalty_point_ledger → 404 |
| 102 | Tich diem | `/loyalty_point_ledger` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 103 | Vi thanh vien | `/loyalty_wallet` | API_ERROR | GET http://localhost:4000/loyalty_wallet → 404 |
| 104 | Vi thanh vien | `/loyalty_wallet` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 105 | Doi thuong | `/loyaltyReward` | API_ERROR | GET http://localhost:4000/loyaltyReward → 404 |
| 106 | Doi thuong | `/loyaltyReward` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 107 | Phan hang TV | `/loyaltySegment` | API_ERROR | GET http://localhost:4000/loyaltySegment → 404 |
| 108 | Phan hang TV | `/loyaltySegment` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 109 | Dashboard Loyalty | `/dashboard_loyalty` | API_ERROR | GET http://localhost:4000/dashboard_loyalty → 404 |
| 110 | Dashboard Loyalty | `/dashboard_loyalty` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 111 | Cai dat Loyalty | `/setting_loyalty` | API_ERROR | GET http://localhost:4000/setting_loyalty → 404 |
| 112 | Cai dat Loyalty | `/setting_loyalty` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 113 | DS Thanh vien | `/member_list` | API_ERROR | GET http://localhost:4000/member_list → 404 |
| 114 | DS Thanh vien | `/member_list` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 115 | Chien dich | `/campaign` | API_ERROR | GET http://localhost:4000/campaign → 404 |
| 116 | Chien dich | `/campaign` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 117 | Marketing CD | `/marketing_campaign` | API_ERROR | GET http://localhost:4000/marketing_campaign → 404 |
| 118 | Marketing CD | `/marketing_campaign` | API_ERROR | POST https://accounts.google.com/_/IdpIFrameHttp/cspreport/fine-allowlist → 400 |
| 119 | Marketing CD | `/marketing_campaign` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 120 | Marketing CD | `/marketing_campaign` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 400 () |
| 121 | Bao hanh | `/warranty` | BLANK_PAGE | Body chi co 0 ky tu |
| 122 | Bao hanh | `/warranty` | API_ERROR | GET http://localhost:4000/warranty → 404 |
| 123 | Bao hanh | `/warranty` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 124 | Bao hanh | `/warranty` | NO_CONTENT | Khong tim thay noi dung chinh |
| 125 | Ticket | `/ticket` | API_ERROR | GET http://localhost:4000/ticket → 404 |
| 126 | Ticket | `/ticket` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 127 | Email Marketing | `/email_marketting` | API_ERROR | GET http://localhost:4000/email_marketting → 404 |
| 128 | Email Marketing | `/email_marketting` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 129 | SMS Marketing | `/sms_marketting` | API_ERROR | GET http://localhost:4000/sms_marketting → 404 |
| 130 | SMS Marketing | `/sms_marketting` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 131 | Zalo Marketing | `/zalo_marketting` | API_ERROR | GET http://localhost:4000/zalo_marketting → 404 |
| 132 | Zalo Marketing | `/zalo_marketting` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 133 | Fanpage | `/fanpage` | API_ERROR | GET http://localhost:4000/fanpage → 404 |
| 134 | Fanpage | `/fanpage` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 135 | Bao gia | `/offer` | BLANK_PAGE | Body chi co 0 ky tu |
| 136 | Bao gia | `/offer` | TIMEOUT | page.$: Execution context was destroyed, most likely because of a navigation |
| 137 | Ca lam viec | `/shift_management` | BLANK_PAGE | Body chi co 0 ky tu |
| 138 | Ca lam viec | `/shift_management` | TIMEOUT | page.$: Execution context was destroyed, most likely because of a navigation |
| 139 | Cau hinh ca | `/shift_config` | BLANK_PAGE | Body chi co 0 ky tu |
| 140 | Cau hinh ca | `/shift_config` | TIMEOUT | page.$: Execution context was destroyed, most likely because of a navigation |
| 141 | Cham cong | `/timekeeping` | BLANK_PAGE | Body chi co 0 ky tu |
| 142 | Cham cong | `/timekeeping` | API_ERROR | GET http://localhost:4000/timekeeping → 404 |
| 143 | Cham cong | `/timekeeping` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 144 | Cham cong | `/timekeeping` | NO_CONTENT | Khong tim thay noi dung chinh |
| 145 | Quy trinh | `/manage_processes` | BLANK_PAGE | Body chi co 0 ky tu |
| 146 | Quy trinh | `/manage_processes` | API_ERROR | GET http://localhost:4000/manage_processes → 404 |
| 147 | Quy trinh | `/manage_processes` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 148 | Quy trinh | `/manage_processes` | NO_CONTENT | Khong tim thay noi dung chinh |
| 149 | Mo phong | `/process_simulation` | API_ERROR | GET http://localhost:4000/process_simulation → 404 |
| 150 | Mo phong | `/process_simulation` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 151 | Cau hinh BPM | `/config_bpm` | BLANK_PAGE | Body chi co 0 ky tu |
| 152 | Cau hinh BPM | `/config_bpm` | TIMEOUT | page.$: Execution context was destroyed, most likely because of a navigation |
| 153 | Luat NV | `/bpm/business_rule` | BLANK_PAGE | Body chi co 0 ky tu |
| 154 | Luat NV | `/bpm/business_rule` | API_ERROR | GET http://localhost:4000/bpm/business_rule → 404 |
| 155 | Luat NV | `/bpm/business_rule` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 156 | Sale Flow | `/manage_sale_flow` | BLANK_PAGE | Body chi co 0 ky tu |
| 157 | Sale Flow | `/manage_sale_flow` | TIMEOUT | page.$: Execution context was destroyed, most likely because of a navigation |
| 158 | Automation | `/marketing_automation` | API_ERROR | GET http://localhost:4000/marketing_automation → 404 |
| 159 | Automation | `/marketing_automation` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 160 | BC Doanh thu | `/report_common` | API_ERROR | GET http://localhost:4000/report_common → 404 |
| 161 | BC Doanh thu | `/report_common` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 162 | BC Khach hang | `/customer_report` | BLANK_PAGE | Body chi co 0 ky tu |
| 163 | BC Khach hang | `/customer_report` | TIMEOUT | page.$: Execution context was destroyed, most likely because of a navigation |
| 164 | BC Ton kho | `/inventory_report_modern` | API_ERROR | GET http://localhost:4000/inventory_report_modern → 404 |
| 165 | BC Ton kho | `/inventory_report_modern` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 166 | BC Marketing | `/marketing_report` | BLANK_PAGE | Body chi co 0 ky tu |
| 167 | BC Marketing | `/marketing_report` | API_ERROR | GET http://localhost:4000/marketing_report → 404 |
| 168 | BC Marketing | `/marketing_report` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 404 (Not Found) |
| 169 | BC Marketing | `/marketing_report` | NO_CONTENT | Khong tim thay noi dung chinh |
| 170 | CD Chung | `/setting_basis` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 171 | CD To chuc | `/setting_org` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 172 | CD Ban hang | `/setting_sell` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 173 | CD Khach hang | `/setting_customer` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 174 | CD PTTT | `/setting_payment_method` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 175 | CD Kenh | `/setting_channels` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 176 | CD Email | `/setting_email` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 177 | CD SMS | `/setting_sms` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 178 | CD Zalo | `/setting_zalo` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 179 | CD Tich hop | `/setting_integrations` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 180 | CD Tai khoan | `/setting_account` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 181 | CD Ticket | `/setting_ticket` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 182 | CD Bao hanh | `/setting_warranty` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 183 | Thong bao | `/notification` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 184 | Lich | `/calendar` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 185 | To chuc | `/organization` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 186 | Goi DV | `/package_manage` | TIMEOUT | page.goto: Target page, context or browser has been closed |
| 187 | Truong TDN | `/field_management` | TIMEOUT | page.goto: Target page, context or browser has been closed |

---

## Phan loai loi

### API_ERROR (63 loi)

- **Login page** (`/login`): GET http://localhost:4000/login → 404
- **Dashboard** (`/dashboard`): GET http://localhost:4000/dashboard → 404
- **POS - Ban hang** (`/create_sale_add`): GET http://localhost:4000/create_sale_add → 404
- **Hoa don ban hang** (`/sale_invoice`): GET http://localhost:4000/sale_invoice → 404
- **Don hang** (`/order`): GET http://localhost:4000/order → 404
- **Don tam** (`/temporary_order_list`): GET http://localhost:4000/temporary_order_list → 404
- **Theo doi don** (`/order_tracking`): GET http://localhost:4000/order_tracking → 404
- **Khach tra hang** (`/return_invoice`): GET http://localhost:4000/return_invoice → 404
- **Don hang da kenh** (`/multi_channel_sales`): GET http://localhost:4000/multi_channel_sales → 404
- **Giao hang** (`/shipping`): GET http://localhost:4000/shipping → 404
- **Doi tac van chuyen** (`/shipping_parther`): GET http://localhost:4000/shipping_parther → 404
- **Phi van chuyen** (`/shipping_fee_config`): GET http://localhost:4000/shipping_fee_config → 404
- **BC Van chuyen** (`/dashboard_shipping`): GET http://localhost:4000/dashboard_shipping → 404
- **So kho** (`/inventory`): GET http://localhost:4000/inventory → 404
- **Kho hang** (`/warehouse`): GET http://localhost:4000/warehouse → 404
- **Phieu nhap** (`/invoice_order`): GET http://localhost:4000/invoice_order → 404
- **Dieu chinh kho** (`/adjustment_slip`): GET http://localhost:4000/adjustment_slip → 404
- **Xuat huy** (`/destroy_slip`): GET http://localhost:4000/destroy_slip → 404
- **Kiem ke** (`/inventory_checking`): GET http://localhost:4000/inventory_checking → 404
- **Ton kho SP** (`/product_inventory`): GET http://localhost:4000/product_inventory → 404
- **SP da ban** (`/products_sold`): GET http://localhost:4000/products_sold → 404
- **BC Kho** (`/report_warehouse`): GET http://localhost:4000/report_warehouse → 404
- **DS Khach hang** (`/customer_list`): GET http://localhost:4000/customer_list → 404
- **KH Ca nhan** (`/customer_person`): GET http://localhost:4000/customer_person → 404
- **Nha cung cap** (`/supplier_list`): GET http://localhost:4000/supplier_list → 404
- **Nguoi lien he** (`/contact`): GET http://localhost:4000/contact → 404
- **Phan tich KH** (`/customer_analysis`): GET http://localhost:4000/customer_analysis → 404
- **Cham soc KH** (`/customer_care_page`): GET http://localhost:4000/customer_care_page → 404
- **Dashboard TC** (`/finance_management/dashboard`): GET http://localhost:4000/finance_management/dashboard → 404
- **So thu chi** (`/finance_management/cashbook`): GET http://localhost:4000/finance_management/cashbook → 404
- **Mau phieu** (`/finance_management/cashbook_template`): GET http://localhost:4000/finance_management/cashbook_template → 404
- **Quan ly quy** (`/finance_management/fund_management`): GET http://localhost:4000/finance_management/fund_management → 404
- **Cong no** (`/finance_management/debt_management`): GET http://localhost:4000/finance_management/debt_management → 404
- **Kiem ke ca** (`/finance_management/shift_inventory`): GET http://localhost:4000/finance_management/shift_inventory → 404
- **Doi soat TT** (`/payment_control`): GET http://localhost:4000/payment_control → 404
- **LS Thanh toan** (`/payment_history`): GET http://localhost:4000/payment_history → 404
- **Hoa don VAT** (`/invoiceVAT`): GET http://localhost:4000/invoiceVAT → 404
- **Khuyen mai** (`/promotional_program`): GET http://localhost:4000/promotional_program → 404
- **BC Khuyen mai** (`/promotional_report`): GET http://localhost:4000/promotional_report → 404
- **Tich diem** (`/loyalty_point_ledger`): GET http://localhost:4000/loyalty_point_ledger → 404
- **Vi thanh vien** (`/loyalty_wallet`): GET http://localhost:4000/loyalty_wallet → 404
- **Doi thuong** (`/loyaltyReward`): GET http://localhost:4000/loyaltyReward → 404
- **Phan hang TV** (`/loyaltySegment`): GET http://localhost:4000/loyaltySegment → 404
- **Dashboard Loyalty** (`/dashboard_loyalty`): GET http://localhost:4000/dashboard_loyalty → 404
- **Cai dat Loyalty** (`/setting_loyalty`): GET http://localhost:4000/setting_loyalty → 404
- **DS Thanh vien** (`/member_list`): GET http://localhost:4000/member_list → 404
- **Chien dich** (`/campaign`): GET http://localhost:4000/campaign → 404
- **Marketing CD** (`/marketing_campaign`): GET http://localhost:4000/marketing_campaign → 404
- **Marketing CD** (`/marketing_campaign`): POST https://accounts.google.com/_/IdpIFrameHttp/cspreport/fine-allowlist → 400
- **Bao hanh** (`/warranty`): GET http://localhost:4000/warranty → 404
- **Ticket** (`/ticket`): GET http://localhost:4000/ticket → 404
- **Email Marketing** (`/email_marketting`): GET http://localhost:4000/email_marketting → 404
- **SMS Marketing** (`/sms_marketting`): GET http://localhost:4000/sms_marketting → 404
- **Zalo Marketing** (`/zalo_marketting`): GET http://localhost:4000/zalo_marketting → 404
- **Fanpage** (`/fanpage`): GET http://localhost:4000/fanpage → 404
- **Cham cong** (`/timekeeping`): GET http://localhost:4000/timekeeping → 404
- **Quy trinh** (`/manage_processes`): GET http://localhost:4000/manage_processes → 404
- **Mo phong** (`/process_simulation`): GET http://localhost:4000/process_simulation → 404
- **Luat NV** (`/bpm/business_rule`): GET http://localhost:4000/bpm/business_rule → 404
- **Automation** (`/marketing_automation`): GET http://localhost:4000/marketing_automation → 404
- **BC Doanh thu** (`/report_common`): GET http://localhost:4000/report_common → 404
- **BC Ton kho** (`/inventory_report_modern`): GET http://localhost:4000/inventory_report_modern → 404
- **BC Marketing** (`/marketing_report`): GET http://localhost:4000/marketing_report → 404

### CONSOLE_ERROR (63 loi)

- **Login page** (`/login`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Dashboard** (`/dashboard`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **POS - Ban hang** (`/create_sale_add`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Hoa don ban hang** (`/sale_invoice`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Don hang** (`/order`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Don tam** (`/temporary_order_list`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Theo doi don** (`/order_tracking`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Khach tra hang** (`/return_invoice`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Don hang da kenh** (`/multi_channel_sales`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Giao hang** (`/shipping`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Doi tac van chuyen** (`/shipping_parther`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Phi van chuyen** (`/shipping_fee_config`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **BC Van chuyen** (`/dashboard_shipping`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **So kho** (`/inventory`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Kho hang** (`/warehouse`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Phieu nhap** (`/invoice_order`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Dieu chinh kho** (`/adjustment_slip`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Xuat huy** (`/destroy_slip`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Kiem ke** (`/inventory_checking`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Ton kho SP** (`/product_inventory`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **SP da ban** (`/products_sold`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **BC Kho** (`/report_warehouse`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **DS Khach hang** (`/customer_list`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **KH Ca nhan** (`/customer_person`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Nha cung cap** (`/supplier_list`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Nguoi lien he** (`/contact`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Phan tich KH** (`/customer_analysis`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Cham soc KH** (`/customer_care_page`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Dashboard TC** (`/finance_management/dashboard`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **So thu chi** (`/finance_management/cashbook`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Mau phieu** (`/finance_management/cashbook_template`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Quan ly quy** (`/finance_management/fund_management`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Cong no** (`/finance_management/debt_management`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Kiem ke ca** (`/finance_management/shift_inventory`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Doi soat TT** (`/payment_control`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **LS Thanh toan** (`/payment_history`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Hoa don VAT** (`/invoiceVAT`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Khuyen mai** (`/promotional_program`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **BC Khuyen mai** (`/promotional_report`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Tich diem** (`/loyalty_point_ledger`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Vi thanh vien** (`/loyalty_wallet`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Doi thuong** (`/loyaltyReward`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Phan hang TV** (`/loyaltySegment`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Dashboard Loyalty** (`/dashboard_loyalty`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Cai dat Loyalty** (`/setting_loyalty`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **DS Thanh vien** (`/member_list`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Chien dich** (`/campaign`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Marketing CD** (`/marketing_campaign`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Marketing CD** (`/marketing_campaign`): Failed to load resource: the server responded with a status of 400 ()
- **Bao hanh** (`/warranty`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Ticket** (`/ticket`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Email Marketing** (`/email_marketting`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **SMS Marketing** (`/sms_marketting`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Zalo Marketing** (`/zalo_marketting`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Fanpage** (`/fanpage`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Cham cong** (`/timekeeping`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Quy trinh** (`/manage_processes`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Mo phong** (`/process_simulation`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Luat NV** (`/bpm/business_rule`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **Automation** (`/marketing_automation`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **BC Doanh thu** (`/report_common`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **BC Ton kho** (`/inventory_report_modern`): Failed to load resource: the server responded with a status of 404 (Not Found)
- **BC Marketing** (`/marketing_report`): Failed to load resource: the server responded with a status of 404 (Not Found)

### TIMEOUT (27 loi)

- **Chuyen kho** (`/inventory_transfer_document`): page.$: Execution context was destroyed, most likely because of a navigation
- **Nguyen vat lieu** (`/material`): page.$: Execution context was destroyed, most likely because of a navigation
- **Mau phieu** (`/finance_management/cashbook_template`): page.$: Execution context was destroyed, most likely because of a navigation
- **Bao gia** (`/offer`): page.$: Execution context was destroyed, most likely because of a navigation
- **Ca lam viec** (`/shift_management`): page.$: Execution context was destroyed, most likely because of a navigation
- **Cau hinh ca** (`/shift_config`): page.$: Execution context was destroyed, most likely because of a navigation
- **Cau hinh BPM** (`/config_bpm`): page.$: Execution context was destroyed, most likely because of a navigation
- **Sale Flow** (`/manage_sale_flow`): page.$: Execution context was destroyed, most likely because of a navigation
- **BC Khach hang** (`/customer_report`): page.$: Execution context was destroyed, most likely because of a navigation
- **CD Chung** (`/setting_basis`): page.goto: Target page, context or browser has been closed
- **CD To chuc** (`/setting_org`): page.goto: Target page, context or browser has been closed
- **CD Ban hang** (`/setting_sell`): page.goto: Target page, context or browser has been closed
- **CD Khach hang** (`/setting_customer`): page.goto: Target page, context or browser has been closed
- **CD PTTT** (`/setting_payment_method`): page.goto: Target page, context or browser has been closed
- **CD Kenh** (`/setting_channels`): page.goto: Target page, context or browser has been closed
- **CD Email** (`/setting_email`): page.goto: Target page, context or browser has been closed
- **CD SMS** (`/setting_sms`): page.goto: Target page, context or browser has been closed
- **CD Zalo** (`/setting_zalo`): page.goto: Target page, context or browser has been closed
- **CD Tich hop** (`/setting_integrations`): page.goto: Target page, context or browser has been closed
- **CD Tai khoan** (`/setting_account`): page.goto: Target page, context or browser has been closed
- **CD Ticket** (`/setting_ticket`): page.goto: Target page, context or browser has been closed
- **CD Bao hanh** (`/setting_warranty`): page.goto: Target page, context or browser has been closed
- **Thong bao** (`/notification`): page.goto: Target page, context or browser has been closed
- **Lich** (`/calendar`): page.goto: Target page, context or browser has been closed
- **To chuc** (`/organization`): page.goto: Target page, context or browser has been closed
- **Goi DV** (`/package_manage`): page.goto: Target page, context or browser has been closed
- **Truong TDN** (`/field_management`): page.goto: Target page, context or browser has been closed

### BLANK_PAGE (21 loi)

- **Kiem ke** (`/inventory_checking`): Body chi co 0 ky tu
- **SP da ban** (`/products_sold`): Body chi co 0 ky tu
- **Nguyen vat lieu** (`/material`): Body chi co 0 ky tu
- **Phan tich KH** (`/customer_analysis`): Body chi co 0 ky tu
- **Cham soc KH** (`/customer_care_page`): Body chi co 0 ky tu
- **Dashboard TC** (`/finance_management/dashboard`): Body chi co 0 ky tu
- **So thu chi** (`/finance_management/cashbook`): Body chi co 0 ky tu
- **Mau phieu** (`/finance_management/cashbook_template`): Body chi co 0 ky tu
- **Quan ly quy** (`/finance_management/fund_management`): Body chi co 0 ky tu
- **Cong no** (`/finance_management/debt_management`): Body chi co 0 ky tu
- **Bao hanh** (`/warranty`): Body chi co 0 ky tu
- **Bao gia** (`/offer`): Body chi co 0 ky tu
- **Ca lam viec** (`/shift_management`): Body chi co 0 ky tu
- **Cau hinh ca** (`/shift_config`): Body chi co 0 ky tu
- **Cham cong** (`/timekeeping`): Body chi co 0 ky tu
- **Quy trinh** (`/manage_processes`): Body chi co 0 ky tu
- **Cau hinh BPM** (`/config_bpm`): Body chi co 0 ky tu
- **Luat NV** (`/bpm/business_rule`): Body chi co 0 ky tu
- **Sale Flow** (`/manage_sale_flow`): Body chi co 0 ky tu
- **BC Khach hang** (`/customer_report`): Body chi co 0 ky tu
- **BC Marketing** (`/marketing_report`): Body chi co 0 ky tu

### NO_CONTENT (12 loi)

- **Kiem ke** (`/inventory_checking`): Khong tim thay noi dung chinh
- **SP da ban** (`/products_sold`): Khong tim thay noi dung chinh
- **Phan tich KH** (`/customer_analysis`): Khong tim thay noi dung chinh
- **Cham soc KH** (`/customer_care_page`): Khong tim thay noi dung chinh
- **Dashboard TC** (`/finance_management/dashboard`): Khong tim thay noi dung chinh
- **So thu chi** (`/finance_management/cashbook`): Khong tim thay noi dung chinh
- **Quan ly quy** (`/finance_management/fund_management`): Khong tim thay noi dung chinh
- **Cong no** (`/finance_management/debt_management`): Khong tim thay noi dung chinh
- **Bao hanh** (`/warranty`): Khong tim thay noi dung chinh
- **Cham cong** (`/timekeeping`): Khong tim thay noi dung chinh
- **Quy trinh** (`/manage_processes`): Khong tim thay noi dung chinh
- **BC Marketing** (`/marketing_report`): Khong tim thay noi dung chinh

### AUTH_REDIRECT (1 loi)

- **Mau phieu** (`/finance_management/cashbook_template`): Bi redirect ve login

