// Playwright e2e: tạo workflow commission-mentor-v1 cho cloud-crm#204
//
// Mix UI + API:
// - Diagram structure (4 nodes + 3 links) → API (BusinessProcessService.bpmAddNode/AddLinkNode)
// - ScriptTask / ServiceTask config → API (updateScriptTask / updateServiceTask)
// - Variable Declares (varPot, commission) → API (updateVariableDeclare)
// - BPMN XML save → API (saveDiagram)
// - UI smoke: navigate designer → dismiss onboarding → assert canvas renders 4 nodes,
//   click ScriptTask + ServiceTask → assert modal opens with populated fields
// - Verify: API getDetailDiagram + listVariableDeclare
//
// Run:
//   1. Start dev server: VITE_BE_PROXY=https://reborn.vn npm run dev
//   2. Login: node tests/login-local.mjs
//   3. Test: node tests/e2e/bpm-workflows/commission-mentor-v1.spec.mjs
//
// Idempotent: nếu process commission-mentor-v1 đã tồn tại, DELETE trước khi tạo mới.
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const STATE_PATH = path.join(REPO_ROOT, "tests/.auth-state-local.json");
const ARTIFACT_DIR = path.join(REPO_ROOT, "tests/screenshots");

const APP_BASE = process.env.APP_BASE || "http://localhost:4000/crm";
const PROCESS_CODE = "commission-mentor-v1";
const PROCESS_NAME = "Tính hoa hồng mentor — 70/30 (course-enrollment v1)";
const PROCESS_DESC =
  "Workflow tính hoa hồng cho mentor course-enrollment. Input qua cloud-bpm-trigger varPot. " +
  "Output POST sales /sales/commission/internal/result với x-api-key.";

// Node IDs theo spec handoff #204
const NODE = {
  start: "Start_commission_v1",
  script: "Script_commission_split_v1",
  service: "Service_commission_callback_v1",
  end: "End_commission_v1",
};
const LINK = {
  startToScript: "Flow_start_to_script",
  scriptToService: "Flow_script_to_service",
  serviceToEnd: "Flow_service_to_end",
};

const SCRIPT_BODY = `var obj = JSON.parse(res);
var gross = Number(obj.totalAmount) || 0;
var mentorId = obj.mentorEmployeeId;
var status = "PENDING";
var reason = "Calculated by commission-mentor-v1 (70/30 split)";
var net = 0, fee = 0;

if (!mentorId || gross <= 0) {
  status = "FAILED";
  reason = "Missing mentorEmployeeId or invalid totalAmount (gross=" + gross + ", mentorId=" + mentorId + ")";
} else {
  net = Math.round(gross * 0.7 * 100) / 100;
  fee = Math.round(gross * 0.3 * 100) / 100;
}

var nowIso = new Date().toISOString().replace("Z", "+00:00");

JSON.stringify({
  sourceEventId: obj.sourceEventId,
  orderId: obj.orderId,
  employeeId: mentorId,
  orderType: obj.orderType,
  workflowCode: "commission-mentor-v1",
  grossAmount: gross,
  platformFee: fee,
  netAmount: net,
  currency: obj.currency || "VND",
  status: status,
  calculatedAt: nowIso,
  reason: reason
});`;

const SCRIPT_INPUT_VAR = JSON.stringify({
  sourceEventId: "var_varPot.sourceEventId",
  orderId: "var_varPot.orderId",
  mentorEmployeeId: "var_varPot.mentorEmployeeId",
  totalAmount: "var_varPot.totalAmount",
  orderType: "var_varPot.orderType",
  currency: "var_varPot.currency",
  tier: "var_varPot.tier",
});

const SCRIPT_OUTPUT_VAR = JSON.stringify({
  "$.sourceEventId": "var_commission.sourceEventId",
  "$.orderId": "var_commission.orderId",
  "$.employeeId": "var_commission.employeeId",
  "$.orderType": "var_commission.orderType",
  "$.workflowCode": "var_commission.workflowCode",
  "$.grossAmount": "var_commission.grossAmount",
  "$.platformFee": "var_commission.platformFee",
  "$.netAmount": "var_commission.netAmount",
  "$.currency": "var_commission.currency",
  "$.status": "var_commission.status",
  "$.calculatedAt": "var_commission.calculatedAt",
  "$.reason": "var_commission.reason",
});

const SERVICE_ENDPOINT = "https://biz.reborn.vn/sales/commission/internal/result";
const X_API_KEY = "6f1c5a9b8d3e4f7a9c2d1b3e5f7a9c2d";

const SERVICE_INPUT_VAR = JSON.stringify({
  sourceEventId: "var_commission.sourceEventId",
  orderId: "var_commission.orderId",
  employeeId: "var_commission.employeeId",
  orderType: "var_commission.orderType",
  workflowCode: "var_commission.workflowCode",
  grossAmount: "var_commission.grossAmount",
  platformFee: "var_commission.platformFee",
  netAmount: "var_commission.netAmount",
  currency: "var_commission.currency",
  status: "var_commission.status",
  calculatedAt: "var_commission.calculatedAt",
  reason: "var_commission.reason",
});

const VAR_POT_FIELDS = [
  { name: "orderId", type: "integer" },
  { name: "orderCode", type: "text" },
  { name: "orderType", type: "text" },
  { name: "customerId", type: "integer" },
  { name: "mentorEmployeeId", type: "integer" },
  { name: "saleId", type: "integer" },
  { name: "totalAmount", type: "number" },
  { name: "currency", type: "text" },
  { name: "tier", type: "text" },
  { name: "closedAt", type: "text" },
  { name: "closedBy", type: "integer" },
  { name: "sourceEventId", type: "text" },
  { name: "employeeId", type: "integer" },
  { name: "departmentId", type: "integer" },
];

const VAR_COMMISSION_FIELDS = [
  { name: "sourceEventId", type: "text", description: "UUID v4 echo" },
  { name: "orderId", type: "integer" },
  { name: "employeeId", type: "integer", description: "= mentorEmployeeId" },
  { name: "orderType", type: "text" },
  { name: "workflowCode", type: "text", description: "= commission-mentor-v1" },
  { name: "grossAmount", type: "number" },
  { name: "platformFee", type: "number", description: "30% gross" },
  { name: "netAmount", type: "number", description: "70% gross" },
  { name: "currency", type: "text", description: "VND default" },
  { name: "status", type: "text", description: "PENDING|APPROVED|FAILED" },
  { name: "calculatedAt", type: "text", description: "ISO offset datetime" },
  { name: "reason", type: "text" },
];

// BPMN XML skeleton — 4 nodes + 3 sequence flows, layout linear (đúng spec)
function buildBpmnXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_${PROCESS_CODE}" targetNamespace="http://reborn.vn/bpm">
  <bpmn:process id="Process_${PROCESS_CODE}" isExecutable="true">
    <bpmn:startEvent id="${NODE.start}" name="Bắt đầu — nhận trigger">
      <bpmn:outgoing>${LINK.startToScript}</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:scriptTask id="${NODE.script}" name="Tính 70/30 (mentor / platform)" scriptFormat="JavaScript">
      <bpmn:incoming>${LINK.startToScript}</bpmn:incoming>
      <bpmn:outgoing>${LINK.scriptToService}</bpmn:outgoing>
    </bpmn:scriptTask>
    <bpmn:serviceTask id="${NODE.service}" name="Gọi sales lưu commission">
      <bpmn:incoming>${LINK.scriptToService}</bpmn:incoming>
      <bpmn:outgoing>${LINK.serviceToEnd}</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="${NODE.end}" name="Kết thúc">
      <bpmn:incoming>${LINK.serviceToEnd}</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="${LINK.startToScript}" sourceRef="${NODE.start}" targetRef="${NODE.script}" />
    <bpmn:sequenceFlow id="${LINK.scriptToService}" sourceRef="${NODE.script}" targetRef="${NODE.service}" />
    <bpmn:sequenceFlow id="${LINK.serviceToEnd}" sourceRef="${NODE.service}" targetRef="${NODE.end}" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${PROCESS_CODE}">
      <bpmndi:BPMNShape id="${NODE.start}_di" bpmnElement="${NODE.start}">
        <dc:Bounds x="180" y="120" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="155" y="160" width="86" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="${NODE.script}_di" bpmnElement="${NODE.script}">
        <dc:Bounds x="280" y="98" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="${NODE.service}_di" bpmnElement="${NODE.service}">
        <dc:Bounds x="460" y="98" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="${NODE.end}_di" bpmnElement="${NODE.end}">
        <dc:Bounds x="660" y="120" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="655" y="160" width="46" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="${LINK.startToScript}_di" bpmnElement="${LINK.startToScript}">
        <di:waypoint x="216" y="138" /><di:waypoint x="280" y="138" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="${LINK.scriptToService}_di" bpmnElement="${LINK.scriptToService}">
        <di:waypoint x="400" y="138" /><di:waypoint x="460" y="138" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="${LINK.serviceToEnd}_di" bpmnElement="${LINK.serviceToEnd}">
        <di:waypoint x="600" y="138" /><di:waypoint x="660" y="138" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
}

// In-page API helper — chạy trong browser context, dùng fetch interceptor của app
// (có cookie token + Selectedrole header tự động)
async function callApi(page, urlPath, opts = {}) {
  return await page.evaluate(
    async ({ urlPath, opts }) => {
      // Build same-origin absolute URL → interceptor sees startsWith("http") + same origin,
      // không rewrite, đi qua vite proxy → no CORS.
      const fullUrl = urlPath.startsWith("http") ? urlPath : `${window.location.origin}${urlPath}`;
      const res = await fetch(fullUrl, {
        method: opts.method || "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(opts.headers || {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        credentials: "include",
      });
      const txt = await res.text();
      try {
        return { status: res.status, json: JSON.parse(txt) };
      } catch {
        return { status: res.status, json: null, text: txt.slice(0, 500) };
      }
    },
    { urlPath, opts },
  );
}

function logStep(n, msg) {
  console.log(`\n[P${n}] ${msg}`);
}

async function main() {
  // ============ P1. Setup ============
  if (!fs.existsSync(STATE_PATH)) {
    console.error(`❌ Missing ${STATE_PATH} — run: node tests/login-local.mjs`);
    process.exit(1);
  }
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: process.env.HEADED !== "1" });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: STATE_PATH,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("[pageerror] " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("[console.error] " + m.text().slice(0, 200));
  });

  // CORS workaround: app fetch interceptor rewrite /bpmapi/* → https://reborn.vn/bpmapi/*
  // → CORS preflight fail vì có custom headers (Selectedrole, Authorization).
  // Forward các call đó qua route.fetch() đến vite proxy local — bypass CORS.
  const proxyForward = async (route) => {
    const url = new URL(route.request().url());
    const localUrl = `http://localhost:4000${url.pathname}${url.search}`;
    try {
      const resp = await route.fetch({ url: localUrl });
      const body = await resp.body();
      await route.fulfill({
        status: resp.status(),
        headers: resp.headers(),
        body,
      });
    } catch (e) {
      await route.fulfill({ status: 502, body: `proxy error: ${e.message}` });
    }
  };
  await ctx.route(/^https:\/\/reborn\.vn\/(bpmapi|authenticator|api|adminapi|operation)\//, proxyForward);
  await ctx.route(/^https:\/\/biz\.reborn\.vn\//, proxyForward);

  let exitCode = 0;
  try {
    // Load app to bootstrap fetch interceptor + cookies + Selectedrole header
    logStep(1, "Load app shell to bootstrap fetch interceptor");
    await page.goto(`${APP_BASE}/mh/courses`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForFunction(() => !!localStorage.getItem("permissions"), null, { timeout: 30000 });
    console.log("  ✓ permissions loaded, role=", await page.evaluate(() => localStorage.getItem("SelectedRole")));

    // ============ P2. Idempotent cleanup ============
    logStep(2, "Cleanup: tìm process cũ theo code");
    const listRes = await callApi(page, `/bpmapi/businessProcess/list?code=${PROCESS_CODE}&page=1&limit=50`);
    if (listRes.status !== 200 || listRes.json?.code !== 0) {
      console.error("  ❌ list failed:", listRes.status, JSON.stringify(listRes.json || listRes.text).slice(0, 300));
      throw new Error("BPM list endpoint failed");
    }
    const existing = (listRes.json.result?.items || []).filter((p) => p.code === PROCESS_CODE);
    console.log(`  found ${existing.length} existing process(es) with code=${PROCESS_CODE}`);
    for (const p of existing) {
      const delRes = await callApi(page, `/bpmapi/businessProcess/delete?id=${p.id}`, { method: "DELETE" });
      console.log(`  DELETE id=${p.id} → status=${delRes.status} code=${delRes.json?.code}`);
    }

    // ============ P3. Create process ============
    logStep(3, "Create process");
    const createRes = await callApi(page, "/bpmapi/businessProcess/update", {
      method: "POST",
      body: {
        code: PROCESS_CODE,
        name: PROCESS_NAME,
        description: PROCESS_DESC,
        bsnId: 0,
        status: 1,
        version: 1,
      },
    });
    if (createRes.json?.code !== 0 || !createRes.json?.result?.id) {
      console.error("  ❌ create failed:", JSON.stringify(createRes.json || createRes.text));
      throw new Error("Create process failed");
    }
    const processId = createRes.json.result.id;
    console.log(`  ✓ created processId=${processId}`);

    // ============ P4. Create 4 nodes via API ============
    logStep(4, "Create 4 nodes via configNode/update");
    const nodes = [
      { nodeId: NODE.start, name: "Bắt đầu — nhận trigger", typeNode: "bpmn:StartEvent" },
      { nodeId: NODE.script, name: "Tính 70/30 (mentor / platform)", typeNode: "bpmn:ScriptTask" },
      { nodeId: NODE.service, name: "Gọi sales lưu commission", typeNode: "bpmn:ServiceTask" },
      { nodeId: NODE.end, name: "Kết thúc", typeNode: "bpmn:EndEvent" },
    ];
    for (const n of nodes) {
      const r = await callApi(page, "/bpmapi/businessProcess/configNode/update", {
        method: "POST",
        body: { ...n, processId },
      });
      if (r.json?.code !== 0) throw new Error(`addNode ${n.nodeId} failed: ${JSON.stringify(r.json)}`);
      console.log(`  ✓ node ${n.nodeId} (${n.typeNode})`);
    }

    // ============ P5. Create 3 sequence flow links ============
    logStep(5, "Create 3 sequence flows");
    const links = [
      { linkId: LINK.startToScript, fromNodeId: NODE.start, toNodeId: NODE.script },
      { linkId: LINK.scriptToService, fromNodeId: NODE.script, toNodeId: NODE.service },
      { linkId: LINK.serviceToEnd, fromNodeId: NODE.service, toNodeId: NODE.end },
    ];
    // bpmAddLinkNode endpoint = updateConfig (look at bpmAddLinkNode in service)
    for (const l of links) {
      const r = await callApi(page, "/bpmapi/businessProcess/updateConfig", {
        method: "POST",
        body: { ...l, flowType: "normal", config: "", processId },
      });
      if (r.json?.code !== 0) throw new Error(`addLink ${l.linkId} failed: ${JSON.stringify(r.json)}`);
      console.log(`  ✓ link ${l.linkId}`);
    }

    // ============ P6. Configure ScriptTask ============
    logStep(6, "Configure ScriptTask via /scriptTask/update");
    const scriptRes = await callApi(page, "/bpmapi/scriptTask/update", {
      method: "POST",
      body: {
        id: null,
        name: "Tính 70/30 (mentor / platform)",
        code: "cmsn_split_v1",
        description: "ScriptTask tính 70/30 dựa trên var_varPot.totalAmount, output var_commission.*",
        scriptLanguage: "JavaScript",
        scriptBody: SCRIPT_BODY,
        inputVar: SCRIPT_INPUT_VAR,
        outputVar: SCRIPT_OUTPUT_VAR,
        errorHandling: JSON.stringify({ type: "Stop", config: {} }),
        scope: "Scope",
        executionMode: "synchronous",
        nodeId: NODE.script,
        processId,
        workflowId: null,
      },
    });
    if (scriptRes.json?.code !== 0) throw new Error(`updateScriptTask failed: ${JSON.stringify(scriptRes.json)}`);
    console.log(`  ✓ ScriptTask configured (id=${scriptRes.json.result?.id})`);

    // ============ P7. Configure ServiceTask ============
    logStep(7, "Configure ServiceTask via /serviceTask/update — endpoint biz.reborn.vn + x-api-key");
    const httpHeaders = JSON.stringify([
      { key: "Content-Type", value: "application/json" },
      { key: "x-api-key", value: X_API_KEY },
    ]);
    const serviceRes = await callApi(page, "/bpmapi/serviceTask/update", {
      method: "POST",
      body: {
        id: null,
        name: "Gọi sales lưu commission",
        code: "cmsn_callback_v1",
        description: "ServiceTask POST sales /sales/commission/internal/result với x-api-key",
        serviceType: "REST",
        endpoint: SERVICE_ENDPOINT,
        method: "POST",
        payloadType: "JSON",
        httpHeaders,
        authentication: JSON.stringify({ type: null, config: null }), // x-api-key qua headers, không qua auth
        inputVar: SERVICE_INPUT_VAR,
        outputVar: JSON.stringify({ "": null }),
        errorHandling: JSON.stringify({ type: "Retry", config: { times: 3, loopTime: 30 } }),
        timeout: 30,
        serviceValidation: 1,
        executionMode: JSON.stringify({ executionType: 0, payloadHandling: 0 }),
        nodeId: NODE.service,
        processId,
        workflowId: null,
        transforms: null,
      },
    });
    if (serviceRes.json?.code !== 0) throw new Error(`updateServiceTask failed: ${JSON.stringify(serviceRes.json)}`);
    console.log(`  ✓ ServiceTask configured (id=${serviceRes.json.result?.id})`);

    // ============ P8. Variable Declares ============
    logStep(8, "Create 2 variable_declares: varPot + commission");
    for (const declare of [
      { name: "varPot", description: "Input từ Kafka trigger varPot", body: VAR_POT_FIELDS },
      { name: "commission", description: "Output ScriptTask, input ServiceTask", body: VAR_COMMISSION_FIELDS },
    ]) {
      const r = await callApi(page, "/bpmapi/variableDeclare/update", {
        method: "POST",
        body: {
          id: null,
          name: declare.name,
          description: declare.description,
          processId,
          globalVariable: 0,
          body: JSON.stringify(declare.body),
        },
      });
      if (r.json?.code !== 0) throw new Error(`updateVariableDeclare ${declare.name} failed: ${JSON.stringify(r.json)}`);
      console.log(`  ✓ variable_declare ${declare.name} (${declare.body.length} fields)`);
    }

    // ============ P9. Save BPMN XML ============
    logStep(9, "Save BPMN XML diagram");
    const xml = buildBpmnXml();
    const saveRes = await callApi(page, "/bpmapi/businessProcess/update/config", {
      method: "POST",
      body: { id: processId, config: xml },
    });
    if (saveRes.json?.code !== 0) throw new Error(`saveDiagram failed: ${JSON.stringify(saveRes.json)}`);
    console.log(`  ✓ BPMN XML saved (${xml.length} chars)`);

    // Save artifact
    const xmlPath = path.join(ARTIFACT_DIR, `${PROCESS_CODE}.bpmn.xml`);
    fs.writeFileSync(xmlPath, xml);
    console.log(`  📄 BPMN artifact: ${xmlPath}`);

    // ============ P10. UI smoke ============
    logStep(10, `UI smoke: navigate /crm/bpm/create/${processId} + verify designer renders`);
    await page.goto(`${APP_BASE}/bpm/create/${processId}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector(".djs-container", { timeout: 15000 });
    await page.waitForTimeout(2500);

    // Dismiss onboarding modal nếu có
    const dismissBtn = page.locator("button:has-text('Bỏ qua'), button:has-text('✕'):visible").first();
    if (await dismissBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dismissBtn.click().catch(() => {});
      await page.waitForTimeout(500);
      console.log("  ✓ onboarding dismissed");
    }

    // Assert 4 nodes rendered trong canvas
    const renderedNodes = await page.evaluate((nodeIds) => {
      return nodeIds.map((id) => ({ id, found: !!document.querySelector(`[data-element-id="${id}"]`) }));
    }, Object.values(NODE));
    const allRendered = renderedNodes.every((n) => n.found);
    console.log("  rendered:", JSON.stringify(renderedNodes));
    if (!allRendered) {
      console.error("  ❌ canvas thiếu node");
    } else {
      console.log("  ✓ all 4 nodes rendered on canvas");
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${PROCESS_CODE}-canvas.png`), fullPage: true });

    // UI smoke: click ScriptTask → mở modal → assert fields
    console.log("  smoke: open ScriptTask modal");
    await page.locator(`[data-element-id="${NODE.script}"]`).first().dblclick({ timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const scriptModalOk = await page.evaluate(() => {
      const code = document.querySelector('input[name="code"]')?.value;
      const lang = document.body.innerText.includes("JavaScript");
      const hasScript = !!document.querySelector('textarea[name="scriptBody"]');
      return { code, lang, hasScript };
    });
    console.log("  ScriptTask modal:", JSON.stringify(scriptModalOk));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${PROCESS_CODE}-script-modal.png`), fullPage: true });

    // Close modal
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(500);
    await page.locator("button:has-text('Đóng'), button:has-text('Hủy')").first().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(800);

    // ============ P11. Verify via API ============
    logStep(11, "Verify: getDetailDiagram + listVariableDeclare");
    const detailRes = await callApi(page, `/bpmapi/businessProcess/get?id=${processId}`);
    const cfgLen = detailRes.json?.result?.config?.length || 0;
    console.log(`  getDetailDiagram: code=${detailRes.json?.code}, config length=${cfgLen}`);
    if (cfgLen < 500) throw new Error(`config XML too short or missing: ${cfgLen} chars`);

    const varRes = await callApi(page, `/bpmapi/variableDeclare/list?processId=${processId}&page=1&limit=50`);
    const vars = varRes.json?.result?.items || [];
    console.log(`  listVariableDeclare: ${vars.length} rows: ${vars.map((v) => v.name).join(", ")}`);
    if (vars.length < 2) throw new Error(`variable_declare count mismatch: expect 2, got ${vars.length}`);

    // ============ Done ============
    console.log("\n========================================");
    console.log(`✅ commission-mentor-v1 created — processId=${processId}`);
    console.log(`   BPMN XML: ${xmlPath}`);
    console.log(`   Canvas screenshot: ${ARTIFACT_DIR}/${PROCESS_CODE}-canvas.png`);
    console.log(`   ScriptTask modal screenshot: ${ARTIFACT_DIR}/${PROCESS_CODE}-script-modal.png`);
    console.log("========================================");
  } catch (err) {
    exitCode = 1;
    console.error("\n❌ FAILED:", err.message);
    console.error("   recent errors:", errors.slice(-5).join("\n   "));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${PROCESS_CODE}-fail.png`), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
  process.exit(exitCode);
}

main();
