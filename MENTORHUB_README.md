# Reborn MentorHub — Frontend

> Nền tảng mentorship Việt Nam — quản lý khoá học live, AI meeting notes, CRM học viên.
> Fork từ `cloud-crm` nhánh `community-hub`. Kế thừa toàn bộ hạ tầng React + TypeScript + Vite của Reborn.

## Stack

- **React 18.3** + **TypeScript** + **Vite 7**
- **SCSS** modules với design system riêng `mh-*` namespace
- **Fraunces + Geist** fonts (editorial aesthetic)
- Lazy routing qua `React.lazy` + `Suspense`

## Cấu trúc module MentorHub

Module được đặt tại `src/pages/MentorHub/` theo pattern của cloud-crm:

```
src/pages/MentorHub/
├── _shared/               # Design tokens + shared SCSS
│   └── styles.scss
├── Dashboard/             # Tổng quan mentor
├── Courses/               # Danh sách khoá học
├── CourseEdit/            # Soạn/sửa khoá (5-step wizard)
├── SessionReview/         # AI Meeting Notes (signature feature)
├── LiveSession/           # Live runtime với AI Live Assistant
├── Students/              # Danh sách học viên
├── CRM/                   # Segmentation & lifecycle
├── Tickets/               # Hỗ trợ học viên (AI reply)
├── Chat/                  # Chat 2 chiều (Zalo/Email/in-app)
├── Feedback/              # NPS & reviews
├── Revenue/               # Doanh thu & payout
├── Marketing/             # Referral & cross-sell
├── Calendar/              # Lịch dạy
└── Settings/              # Cài đặt mentor + integrations
```

Mock data tập trung ở `src/mocks/mentorhub/index.ts`.

## Routes

Tất cả routes có prefix `/mh/*`, đã được đăng ký trong `src/configs/routes.tsx`:

| Path | Page |
|------|------|
| `/mh` `/mh/dashboard` | Dashboard |
| `/mh/courses` | Danh sách khoá |
| `/mh/courses/new` | Tạo khoá mới |
| `/mh/courses/:id/edit` | Sửa khoá |
| `/mh/session-review` `/mh/session-review/:id` | AI Meeting Notes |
| `/mh/live-session` | Live Session runtime |
| `/mh/students` | Học viên |
| `/mh/crm` | CRM |
| `/mh/tickets` | Hỗ trợ |
| `/mh/chat` | Chat |
| `/mh/feedback` | NPS |
| `/mh/revenue` | Doanh thu |
| `/mh/marketing` | Marketing |
| `/mh/calendar` | Lịch dạy |
| `/mh/settings` | Cài đặt |

## Cài đặt & chạy

```bash
# Cài deps
npm install   # hoặc yarn

# Dev
npm run dev       # vite --mode devlocal

# Build
npm run build:dev
npm run build:uat
npm run build:prod

# Lint & format
npm run lint:fix
npm run prettier:fix
npm run format    # cả hai
```

## Env vars

Copy `.env.example` thành `.env.devlocal` / `.env.prod` và điền:

```
APP_API_URL=https://api.mentorhub.vn
APP_AUTHENTICATOR_URL=https://auth.reborn.vn
APP_DOMAIN=mentorhub.vn

# Firebase (cho push notifications - optional)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...

# Zalo OA integration
VITE_ZALO_OA_ID=...
```

## Tiếp theo

1. **Port UI từ prototype**: các page hiện ở dạng skeleton — cần port thêm modal, form validation, empty states từ HTML prototype đã approve
2. **Wire up API**: thay `MOCK_*` bằng gọi thật tới `reborn-mentorhub` backend (xem `reborn-mentorhub-be` repo)
3. **Menu integration**: thêm MentorHub vào sidebar menu trong `configs/menus.tsx` (hiện chỉ đăng ký routes)
4. **Auth guard**: các route `/mh/*` cần wrap bởi `PrivateRoute` hoặc tương tự để check role `mentor`

## Tài liệu liên quan

- Prototype HTML approve: xem thư mục `prototype/` (nếu có) hoặc 19 file HTML đã làm trước đó
- Backend API: xem `reborn-mentorhub-be` repo
- Design tokens: `src/pages/MentorHub/_shared/styles.scss`
