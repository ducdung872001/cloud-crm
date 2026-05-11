# 04-API — OpenAPI Specification

OpenAPI 3.0 contract chính thức cho **Reborn Loyalty Platform**.

| File | Mô tả |
|---|---|
| [`loyalty-openapi.yaml`](loyalty-openapi.yaml) | Spec đầy đủ — endpoints, schemas, examples |

## Render Swagger UI

### Local

```bash
npx -y http-server -p 8888  # serve docs/
# Mở: http://localhost:8888/04-api/swagger-ui.html (nếu có)
```

Hoặc dùng **Swagger Editor online**: https://editor.swagger.io → paste content

### Tích hợp trong admin app

Trang `/loyalty_integration` hiển thị Swagger UI inline.

## Generated SDK

Sinh client SDK từ OpenAPI:

```bash
# JavaScript/TypeScript
npx @openapitools/openapi-generator-cli generate \
  -i docs/04-api/loyalty-openapi.yaml \
  -g typescript-fetch \
  -o sdk/typescript

# Python
openapi-generator-cli generate \
  -i docs/04-api/loyalty-openapi.yaml \
  -g python \
  -o sdk/python

# Java
openapi-generator-cli generate \
  -i docs/04-api/loyalty-openapi.yaml \
  -g java \
  -o sdk/java
```

## Versioning

| Path | Mô tả |
|---|---|
| `/v1/...` | Current public API |
| `/internal/v1/...` | Internal service-to-service |
| `/adminapi/v1/...` | Admin endpoints |

Breaking change → bump `/v2/...`, không in-place edit.

## Tham chiếu

- API design principles + sequence: [`../03-architecture/part-05-api-integration.md`](../03-architecture/part-05-api-integration.md)
- POS integration URD: [`../02-requirements/part-08-pos-integration.md`](../02-requirements/part-08-pos-integration.md)
- Security (auth, signing): [`../03-architecture/part-06-security.md`](../03-architecture/part-06-security.md)
