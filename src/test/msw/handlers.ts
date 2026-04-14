import { http, HttpResponse } from "msw";
import {
  MOCK_DEBTS, MOCK_DEBT_TRANSACTIONS, MOCK_PAYMENT_METHODS, MOCK_PAYMENT_GATEWAYS,
  MOCK_PARTNERS, MOCK_PARTNER_CONTRACTS,
  MOCK_VENDORS, MOCK_VENDOR_CONTRACTS, MOCK_VENDOR_INVOICES,
  MOCK_PROJECT_FINANCIALS, MOCK_B2G_BUDGETS, MOCK_B2G_PAYMENTS,
  MOCK_NOTIFICATION_TEMPLATES, MOCK_NOTIFICATION_SEGMENTS, MOCK_NOTIFICATION_CAMPAIGNS,
  MOCK_AUDIT_LOGS, MOCK_PROJECTS,
} from "assets/mock/TNPMData";

const api = (path: string) => `*${path}`;

// Simulate realistic TNPM backend following the microservice spec doc
export const handlers = [
  // ─── portfolio-service ─────────────────────────────────
  http.get(api("/projects"), ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    let items = MOCK_PROJECTS;
    if (type) items = items.filter((p: any) => p.type === type);
    return HttpResponse.json({ code: 0, result: { items, total: items.length } });
  }),

  http.get(api("/portfolio/dashboard"), () => {
    return HttpResponse.json({
      code: 0,
      result: {
        projects: MOCK_PROJECT_FINANCIALS,
        totalRevenue: MOCK_PROJECT_FINANCIALS.reduce((a, p) => a + p.monthlyRevenue, 0),
      },
    });
  }),

  // ─── payment-service ──────────────────────────────────
  http.get(api("/debts"), ({ request }) => {
    const url = new URL(request.url);
    const kind = url.searchParams.get("kind");
    let items = MOCK_DEBTS;
    if (kind && kind !== "all") items = items.filter((d: any) => d.kind === kind);
    return HttpResponse.json({ code: 0, result: { items, total: items.length } });
  }),

  http.post(api("/debts/:id/pay"), async ({ params, request }) => {
    const body: any = await request.json();
    const debt = MOCK_DEBTS.find((d: any) => d.id === Number(params.id));
    if (!debt) return HttpResponse.json({ code: 404, message: "Not found" }, { status: 404 });
    const remaining = Math.max(0, debt.amount - (body.amount || 0));
    return HttpResponse.json({
      code: 0,
      result: { debtId: debt.id, remaining, paid: body.amount, txnRef: `PAY-${Date.now()}` },
    });
  }),

  http.get(api("/payment-methods"), () => {
    return HttpResponse.json({ code: 0, result: MOCK_PAYMENT_METHODS });
  }),

  http.patch(api("/payment-methods/:id/toggle"), ({ params }) => {
    const method = MOCK_PAYMENT_METHODS.find((m: any) => m.id === Number(params.id));
    if (!method) return HttpResponse.json({ code: 404 }, { status: 404 });
    return HttpResponse.json({ code: 0, result: { id: method.id, enabled: !method.enabled } });
  }),

  http.get(api("/payment-gateways"), () => {
    return HttpResponse.json({ code: 0, result: MOCK_PAYMENT_GATEWAYS });
  }),

  http.post(api("/payment-gateways/:id/test-connection"), async ({ params }) => {
    const gw = MOCK_PAYMENT_GATEWAYS.find((g: any) => g.id === Number(params.id));
    if (!gw || !gw.merchantId || !gw.apiKey) {
      return HttpResponse.json({ code: 1, message: "Missing merchant ID or API key" });
    }
    return HttpResponse.json({
      code: 0,
      result: { merchantId: gw.merchantId, latencyMs: 420, success: true },
    });
  }),

  // ─── vendor-service ───────────────────────────────────
  http.get(api("/vendors"), () => {
    return HttpResponse.json({ code: 0, result: { items: MOCK_VENDORS, total: MOCK_VENDORS.length } });
  }),

  http.get(api("/vendor-invoices"), () => {
    return HttpResponse.json({ code: 0, result: { items: MOCK_VENDOR_INVOICES } });
  }),

  http.post(api("/vendor-invoices/:id/3-way-match/check"), ({ params }) => {
    const inv = MOCK_VENDOR_INVOICES.find((i: any) => i.id === Number(params.id));
    if (!inv) return HttpResponse.json({ code: 404 }, { status: 404 });
    return HttpResponse.json({
      code: 0,
      result: { matchPO: inv.matchPO, matchAcceptance: inv.matchAcceptance, ok: inv.matchPO && inv.matchAcceptance },
    });
  }),

  http.post(api("/vendor-invoices/:id/approvals/:step"), async ({ params, request }) => {
    const body: any = await request.json();
    return HttpResponse.json({
      code: 0,
      result: { invoiceId: Number(params.id), step: Number(params.step), approved: body.approved, timestamp: new Date().toISOString() },
    });
  }),

  // ─── partner-service ──────────────────────────────────
  http.get(api("/partners"), () => {
    return HttpResponse.json({ code: 0, result: { items: MOCK_PARTNERS } });
  }),

  http.get(api("/partner-contracts"), () => {
    return HttpResponse.json({ code: 0, result: { items: MOCK_PARTNER_CONTRACTS } });
  }),

  // ─── notification-service ─────────────────────────────
  http.get(api("/notification-templates"), () => {
    return HttpResponse.json({ code: 0, result: MOCK_NOTIFICATION_TEMPLATES });
  }),

  http.get(api("/notification-segments"), () => {
    return HttpResponse.json({ code: 0, result: MOCK_NOTIFICATION_SEGMENTS });
  }),

  http.get(api("/notification-campaigns"), () => {
    return HttpResponse.json({ code: 0, result: MOCK_NOTIFICATION_CAMPAIGNS });
  }),

  http.post(api("/notification-campaigns"), async ({ request }) => {
    const body: any = await request.json();
    return HttpResponse.json({
      code: 0,
      result: { id: Date.now(), ...body, status: "draft", createdAt: new Date().toISOString() },
    });
  }),

  http.post(api("/notification-campaigns/:id/launch"), ({ params }) => {
    return HttpResponse.json({
      code: 0,
      result: { id: Number(params.id), status: "sending", launchedAt: new Date().toISOString() },
    });
  }),

  // ─── compliance-service ───────────────────────────────
  http.get(api("/b2g-budgets"), () => {
    return HttpResponse.json({ code: 0, result: MOCK_B2G_BUDGETS });
  }),

  http.get(api("/b2g-payments"), () => {
    return HttpResponse.json({ code: 0, result: { items: MOCK_B2G_PAYMENTS } });
  }),

  http.post(api("/b2g-payments/:id/advance-step"), async ({ params, request }) => {
    const body: any = await request.json();
    return HttpResponse.json({
      code: 0,
      result: { id: Number(params.id), newStep: body.step + 1, status: body.approved ? "advanced" : "rejected" },
    });
  }),

  http.get(api("/audit-logs"), () => {
    return HttpResponse.json({ code: 0, result: { items: MOCK_AUDIT_LOGS } });
  }),

  // ─── fallback ─────────────────────────────────────────
  http.get(api("/health"), () => HttpResponse.json({ code: 0, result: { status: "ok" } })),
];
