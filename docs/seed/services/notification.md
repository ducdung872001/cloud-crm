# Seed spec — `notification` service (TNPM)

> Service ít cross-ref nhất, có thể dispatch độc lập.

## Datasets (5 master)

| # | Dataset | Source | Records | Maps to BE table |
|---|---|---|---|---|
| 1 | `MOCK_NOTIFICATION_TEMPLATES` | snapshot L1103–1161 | ~5 | `TemplateEmail` / template_sms / template_zns |
| 2 | `MOCK_NOTIFICATION_SEGMENTS` | snapshot L1163–1196 | ~4 | mới? hoặc dynamic query |
| 3 | `MOCK_NOTIFICATION_CAMPAIGNS` | snapshot L1198–1253 | ~5 | mới? (campaign chứa template + segment + schedule) |
| 4 | `MOCK_NOTIFICATION_RULES` | snapshot L1255–1297 | ~4 | rule auto trigger (event-based) |
| 5 | `MOCK_NOTIFICATION_HISTORY` | snapshot L1299–1343 | ~5 | `NotificationEmail` / NotificationFirebase / SmsDelivery |

## Shape tóm tắt

**Templates** — mẫu nội dung gửi: email reminder phí, push SR resolved, Zalo welcome cư dân. Hỗ trợ variable (cư dân + project + kỳ phí).

**Segments** — đối tượng nhận: "tất cả cư dân overdue", "tenant retail Q3", "vendor đã ký HĐ ≥ 6 tháng".

**Campaigns** — chiến dịch gửi: Fee Notification Engine (4-tab wizard FE) phát hành đợt thông báo phí kỳ. Combine: template × segment × schedule × channels.

**Rules** — auto trigger: T-7/T-3/T-1 reminder hạn thanh toán, alert vendor khi có SR mới approve, alert finance khi vendor invoice cần duyệt cấp 2/3.

**History** — log gửi: channel, status (sent/delivered/failed/opened), recipient, sentAt.

## Schema notes

- `notification` service repo: `ducdung872001/reborn-notihub` (KHÔNG phải `cloud-notification-master` — lệch naming).
- Base paths: `/notification/email/*`, `/notification/fcm*/*`, `/notification/sms/*`, `/notification/zns/*`.
- Multi-channel: Email (SMTP/Gmail/Outlook/Azure), FCM push, SMS Viettel, Zalo ZNS, in-app.

## Cross-service deps

Khá độc lập:
- Template/Segment/Campaign/Rule không reference service khác (chỉ reference logical entity như "cư dân", "vendor" mà query realtime khi run campaign)
- History có `recipientUserId` reference customer/employee — nhưng chỉ log, không FK strict

→ Có thể dispatch SONG SONG với các service khác.

## Ready-to-dispatch body

```
service=notification
slug=seed-notification-templates-tnpm
goal="Seed notification templates + segments + campaigns + rules + history cho tenant <tnpm-tenant>"
scope="5 dataset (~23 records). Độc lập, không phụ thuộc service khác."
```
