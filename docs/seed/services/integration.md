# Seed spec — `integration` service (TNPM)

> Service nhỏ nhất, chỉ 1 dataset.

## Datasets (1 config)

| # | Dataset | Source | Records | Maps to BE table |
|---|---|---|---|---|
| 1 | `MOCK_PAYMENT_GATEWAYS` | snapshot L564–607 | ~5 | payment_gateway_config |

## Shape tóm tắt

**Payment gateways** — cấu hình các cổng thanh toán mà tnpm tích hợp:
- MSB Pay
- Timi
- VNPay
- MoMo
- (có thể thêm sInvoice provider, Zalo OA)

Fields: `code, name, provider, apiKey, secretKey, webhookUrl, status, supportedMethods (qr/bank_transfer/credit_card/wallet)`.

⚠️ **Secret keys**: KHÔNG seed real secret. Dùng placeholder hoặc env var ref. BE store an toàn (Vault/KMS).

## Schema notes

- `integration` service base path `/integration/*`.
- Webhook callback từ gateway → `integration` xử lý → forward signal sang `billing` để ghi cashbook entry.

## Cross-service deps

Độc lập (chỉ config). Khi callback thực tế chạy → cross-service runtime với billing, không phải seed.

## Ready-to-dispatch body

```
service=integration
slug=seed-payment-gateways-tnpm
goal="Seed payment gateway configs (MSB/Timi/VNPay/MoMo) cho tenant <tnpm-tenant>"
scope="MOCK_PAYMENT_GATEWAYS (~5 record). Secret key dùng placeholder."
```
