import "dotenv/config";

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8080),
  apiBase: "/api/v1",

  zoom: {
    clientId: process.env.ZOOM_CLIENT_ID ?? "MOCK_ZOOM_CLIENT_ID",
    clientSecret: process.env.ZOOM_CLIENT_SECRET ?? "MOCK_ZOOM_SECRET",
    webhookSecret: process.env.ZOOM_WEBHOOK_SECRET_TOKEN ?? "MOCK_WEBHOOK_TOKEN",
    redirectUri: process.env.ZOOM_REDIRECT_URI ?? "http://localhost:8080/api/v1/zoom/oauth/callback",
  },

  groq: { apiKey: process.env.GROQ_API_KEY ?? "" },
  openai: { apiKey: process.env.OPENAI_API_KEY ?? "" },
  anthropic: { apiKey: process.env.ANTHROPIC_API_KEY ?? "" },

  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE ?? "MOCKTMN",
    hashSecret: process.env.VNPAY_HASH_SECRET ?? "MOCKSECRET",
    returnUrl: process.env.VNPAY_RETURN_URL ?? "http://localhost:4000/crm/mh/settings?section=subscription",
  },

  zalo: {
    oaAccessToken: process.env.ZALO_OA_ACCESS_TOKEN ?? "",
    webhookSecret: process.env.ZALO_OA_WEBHOOK_SECRET ?? "",
    appId: process.env.ZALO_APP_ID ?? "",
    appSecret: process.env.ZALO_APP_SECRET ?? "",
  },

  s3: {
    bucket: process.env.S3_BUCKET ?? "mentorhub-recordings",
    accessKey: process.env.S3_ACCESS_KEY ?? "",
    secretKey: process.env.S3_SECRET_KEY ?? "",
  },

  cors: {
    origins: (process.env.CORS_ORIGINS ?? "http://localhost:4000,http://localhost:5173").split(","),
  },

  mcp: {
    /** HTTP endpoint của MCP host (Claude Code CLI exposed). Empty = MCP disabled. */
    endpoint: process.env.MCP_ENDPOINT ?? "",
    /** Auth token nếu MCP host yêu cầu */
    token: process.env.MCP_TOKEN ?? "",
    /** Timeout ms cho MCP request — heavy task cần dài hơn API */
    timeoutMs: Number(process.env.MCP_TIMEOUT_MS ?? 120_000),
  },
};

export const IS_MOCK = !config.anthropic.apiKey && !config.groq.apiKey;
