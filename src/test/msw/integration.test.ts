import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./server";

// Integration tests — verify MSW handlers return well-formed shapes
// These simulate the future backend contract so FE can swap mocks → real API

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const fetchJson = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, init);
  return res.json();
};

describe("MSW Integration — backend contract", () => {
  describe("portfolio-service", () => {
    it("GET /projects returns items array", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/projects");
      expect(res.code).toBe(0);
      expect(Array.isArray(res.result.items)).toBe(true);
      expect(res.result.items.length).toBeGreaterThan(0);
    });

    it("GET /projects?type=retail filters correctly", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/projects?type=retail");
      expect(res.code).toBe(0);
      expect(res.result.items.every((p: any) => p.type === "retail")).toBe(true);
    });

    it("GET /portfolio/dashboard aggregates", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/portfolio/dashboard");
      expect(res.code).toBe(0);
      expect(res.result.projects).toBeDefined();
      expect(res.result.totalRevenue).toBeGreaterThan(0);
    });
  });

  describe("payment-service", () => {
    it("GET /debts returns debt list", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/debts");
      expect(res.code).toBe(0);
      expect(res.result.items.length).toBeGreaterThan(0);
    });

    it("GET /debts?kind=receivable filters", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/debts?kind=receivable");
      expect(res.result.items.every((d: any) => d.kind === "receivable")).toBe(true);
    });

    it("POST /debts/:id/pay processes payment", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/debts/1/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50_000_000 }),
      });
      expect(res.code).toBe(0);
      expect(res.result.debtId).toBe(1);
      expect(res.result.txnRef).toMatch(/^PAY-/);
    });

    it("GET /payment-methods returns all methods", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/payment-methods");
      expect(res.code).toBe(0);
      expect(res.result.length).toBeGreaterThan(0);
    });

    it("PATCH /payment-methods/:id/toggle flips enabled", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/payment-methods/1/toggle", {
        method: "PATCH",
      });
      expect(res.code).toBe(0);
      expect(res.result).toHaveProperty("enabled");
    });

    it("POST /payment-gateways/:id/test-connection with valid gateway", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/payment-gateways/1/test-connection", {
        method: "POST",
      });
      expect(res.code).toBe(0);
      expect(res.result.success).toBe(true);
    });

    it("POST /payment-gateways/:id/test-connection with missing config returns error", async () => {
      // Gateway id 3 (VNPay) has empty merchantId
      const res: any = await fetchJson("http://api.tnpm.vn/payment-gateways/3/test-connection", {
        method: "POST",
      });
      expect(res.code).toBe(1);
    });
  });

  describe("vendor-service", () => {
    it("GET /vendors returns list", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/vendors");
      expect(res.code).toBe(0);
      expect(res.result.items.length).toBeGreaterThan(0);
    });

    it("POST /vendor-invoices/:id/3-way-match/check returns match result", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/vendor-invoices/1/3-way-match/check", {
        method: "POST",
      });
      expect(res.code).toBe(0);
      expect(res.result).toHaveProperty("matchPO");
      expect(res.result).toHaveProperty("matchAcceptance");
      expect(res.result).toHaveProperty("ok");
    });

    it("POST /vendor-invoices/:id/approvals/:step advances workflow", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/vendor-invoices/1/approvals/2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true, note: "OK" }),
      });
      expect(res.code).toBe(0);
      expect(res.result.step).toBe(2);
      expect(res.result.approved).toBe(true);
    });
  });

  describe("notification-service", () => {
    it("GET /notification-templates returns templates", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/notification-templates");
      expect(res.code).toBe(0);
      expect(res.result.length).toBeGreaterThan(0);
      expect(res.result[0]).toHaveProperty("channels");
    });

    it("GET /notification-segments returns segments", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/notification-segments");
      expect(res.code).toBe(0);
      expect(res.result[0]).toHaveProperty("filters");
    });

    it("POST /notification-campaigns creates draft", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/notification-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Campaign", templateId: 1, segmentId: 1 }),
      });
      expect(res.code).toBe(0);
      expect(res.result.status).toBe("draft");
      expect(res.result.id).toBeDefined();
    });

    it("POST /notification-campaigns/:id/launch", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/notification-campaigns/1/launch", {
        method: "POST",
      });
      expect(res.code).toBe(0);
      expect(res.result.status).toBe("sending");
    });
  });

  describe("compliance-service", () => {
    it("GET /b2g-budgets returns budgets", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/b2g-budgets");
      expect(res.code).toBe(0);
      expect(res.result.length).toBeGreaterThan(0);
      expect(res.result[0]).toHaveProperty("categories");
    });

    it("GET /b2g-payments returns payments with workflow", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/b2g-payments");
      expect(res.code).toBe(0);
      expect(res.result.items[0]).toHaveProperty("workflow");
    });

    it("POST /b2g-payments/:id/advance-step advances workflow", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/b2g-payments/1/advance-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 2, approved: true, note: "OK" }),
      });
      expect(res.code).toBe(0);
      expect(res.result.newStep).toBe(3);
    });

    it("GET /audit-logs returns audit entries", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/audit-logs");
      expect(res.code).toBe(0);
      expect(res.result.items.length).toBeGreaterThan(0);
      expect(res.result.items[0]).toHaveProperty("severity");
      expect(res.result.items[0]).toHaveProperty("category");
    });
  });

  describe("partner-service", () => {
    it("GET /partners returns partners", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/partners");
      expect(res.code).toBe(0);
      expect(res.result.items.length).toBeGreaterThan(0);
    });

    it("GET /partner-contracts returns contracts", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/partner-contracts");
      expect(res.code).toBe(0);
      expect(res.result.items[0]).toHaveProperty("contractType");
    });
  });

  describe("health", () => {
    it("GET /health returns ok", async () => {
      const res: any = await fetchJson("http://api.tnpm.vn/health");
      expect(res.code).toBe(0);
      expect(res.result.status).toBe("ok");
    });
  });
});
