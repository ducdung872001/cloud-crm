# Part 03 — Technology Stack chi tiet

> Danh muc day du thu vien, framework, va cong cu su dung trong frontend
> Reborn CRM, bao gom phien ban, muc dich, va ghi chu quan trong.

---

## 1. Executive Summary

Frontend Reborn CRM su dung **40+ thu vien** chia thanh 6 nhom chinh:
core framework, UI/visualization, editor, integration, utility, va build tool.
Tat ca duoc quan ly qua npm/yarn voi phien ban lock file dam bao consistency.

---

## 2. Core Framework

| Thu vien            | Phien ban | License    | Muc dich                                    |
|---------------------|-----------|------------|---------------------------------------------|
| React               | 17.0.2    | MIT        | UI component framework                      |
| React DOM           | 17.0.2    | MIT        | DOM rendering                                |
| TypeScript          | 4.9+      | Apache-2.0 | Static type checking                         |
| React Router DOM    | 5.3.x     | MIT        | Client-side routing, nested routes           |
| Vite                | 8.x       | MIT        | Build tool, dev server, HMR                  |

> **Tai sao React 17?** — He thong da on dinh tren React 17 voi 90+ page.
> Migration len React 18 can kiem tra Concurrent Mode compatibility voi ag-Grid
> va cac thu vien khac. Du kien migration khi co du resource (v2.0).

---

## 3. UI & Visualization

| Thu vien            | Phien ban | Muc dich                                    |
|---------------------|-----------|---------------------------------------------|
| ag-Grid Enterprise  | 28+       | Data grid cao cap: sort, filter, group, pivot, export Excel |
| ag-Grid React       | 28+       | React wrapper cho ag-Grid                    |
| Highcharts          | 10+       | Bieu do dashboard: line, bar, pie, funnel    |
| Highcharts React    | 3.x       | React wrapper cho Highcharts                 |
| Ant Design (antd)   | 4.x       | Component library: Button, Modal, Form, Select, DatePicker |
| @ant-design/icons   | 4.x       | Icon library                                 |
| react-beautiful-dnd | 13.x      | Drag & drop (Kanban board)                   |
| react-select        | 5.x       | Searchable select/dropdown                   |

---

## 4. Editor & Diagram

| Thu vien            | Phien ban | Muc dich                                    |
|---------------------|-----------|---------------------------------------------|
| Slate.js            | 0.90+     | Rich text editor (email template, ghi chu)   |
| slate-react         | 0.90+     | React binding cho Slate                      |
| bpmn-js             | 12+       | BPMN 2.0 diagram viewer/editor              |
| bpmn-js-properties  | —         | Panel cau hinh cho bpmn-js                   |

---

## 5. Communication & Integration

| Thu vien                    | Phien ban | Muc dich                               |
|-----------------------------|-----------|----------------------------------------|
| @azure/msal-browser         | 2.x       | Azure AD SSO authentication            |
| @azure/msal-react           | 1.x       | React hook cho MSAL                    |
| firebase                    | 9.x       | Push notification (FCM), analytics     |
| jssip                       | 3.x       | SIP client (VoIP call center)          |
| sip.js                      | 0.20+     | WebRTC SIP library (backup/alternate)  |
| axios                       | 0.27+     | HTTP client (API call)                 |
| socket.io-client            | 4.x       | WebSocket realtime (notification, chat)|

---

## 6. Export & Document

| Thu vien            | Phien ban | Muc dich                                    |
|---------------------|-----------|---------------------------------------------|
| exceljs             | 4.x       | Xuat file Excel (.xlsx) phia client          |
| file-saver          | 2.x       | Trigger download file                        |
| jsPDF               | 2.x       | Xuat PDF phia client                         |
| html2canvas         | 1.x       | Chup screenshot DOM element → canvas         |
| react-to-print      | 2.x       | In truc tiep tu React component              |

---

## 7. Internationalization & Date

| Thu vien            | Phien ban | Muc dich                                    |
|---------------------|-----------|---------------------------------------------|
| i18next             | 22+       | Framework da ngon ngu                        |
| react-i18next       | 12+       | React binding cho i18next                    |
| moment              | 2.29+     | Date parsing/formatting (legacy)             |
| date-fns            | 2.30+     | Date utility (modern, tree-shakable)         |

> **moment vs date-fns:** Code cu dung moment (100+ cho). Code moi uu tien
> date-fns vi tree-shakable (giam ~60KB bundle). Dan migration khi refactor.

---

## 8. Utility

| Thu vien            | Phien ban | Muc dich                                    |
|---------------------|-----------|---------------------------------------------|
| lodash              | 4.x       | Utility function (debounce, cloneDeep, get)  |
| uuid                | 9.x       | Generate UUID (client-side ID)               |
| classnames          | 2.x       | Conditional CSS class                        |
| qs                  | 6.x       | Query string parse/stringify                 |
| numeral             | 2.x       | Format so (tien te, phan tram)               |

---

## 9. Build & Dev Tools

| Cong cu             | Phien ban | Muc dich                                    |
|---------------------|-----------|---------------------------------------------|
| Vite                | 8.x       | Build, dev server, HMR                       |
| ESLint              | 8.x       | Linting TypeScript/React                     |
| Prettier            | 3.x       | Code formatting                              |
| Playwright          | 1.40+     | E2E testing                                  |
| Vitest              | —         | Unit testing (Vite-native)                   |

---

## 10. Dependency Graph (nhom chinh)

```
                    +------------------+
                    |    React 17      |
                    +--------+---------+
                             |
          +------------------+------------------+
          |                  |                  |
   +------+------+   +------+------+   +-------+------+
   | React Router|   |  Ant Design |   | ag-Grid React|
   |    5.x      |   |    4.x      |   |    28+       |
   +-------------+   +------+------+   +------+-------+
                             |                 |
                      +------+------+   +------+------+
                      | @ant-design |   | ag-Grid     |
                      |   /icons    |   | Enterprise  |
                      +-------------+   +-------------+
          |                  |                  |
   +------+------+   +------+------+   +-------+------+
   | Slate.js    |   | Highcharts  |   | bpmn-js      |
   | (editor)    |   | (chart)     |   | (workflow)   |
   +-------------+   +-------------+   +--------------+
```

---

## 11. Luu y bao mat

- **MSAL token** chi luu trong memory (khong localStorage) de chong XSS.
- **Firebase key** la public key, khong chua secret. Server validate token.
- **Axios interceptor** tu dong attach JWT va refresh token khi het han.
- **ag-Grid license** la Enterprise — can file license key (khong commit vao git).

---

*Tiep theo: [Part 04 — Routing & Navigation](part-04-routing-navigation.md)*
