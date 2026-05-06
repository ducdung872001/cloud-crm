// Trigger workflow commission-mentor-v1 bằng cách:
// 1. Tạo hồ sơ (processedObject) — POST /bpmapi/processedObject/update
// 2. "Trình hồ sơ" — POST /bpmapi/processInstance/update {processId, potId}
//    → BPM engine kích hoạt workflow → ScriptTask 70/30 + ServiceTask gọi sales
// 3. Wait + verify processedObjectLog (xem ScriptTask + ServiceTask đã chạy)
// 4. Verify /sales/commission/list?employeeId=5566 (xem sales đã ghi commission row chưa)
//
// Spec ID: workflow processId từ commission-mentor-v1.spec.mjs (cached trong .bpm-process-id.json).

import { request as pwRequest } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const TOKEN_CACHE = path.join(REPO_ROOT, "tests/.bpm-token.json");
const PROCESS_ID_CACHE = path.join(REPO_ROOT, "tests/.bpm-process-id.json");

const PROCESS_CODE = "commission-mentor-v1";
const SELECTED_ROLE = "10_43";
const TEST_NAME = `PW-commission-test-${Math.floor(Date.now() / 1000)}`;

const HEADERS = {
  Authorization: `Bearer ${JSON.parse(fs.readFileSync(TOKEN_CACHE, "utf8")).token}`,
  Selectedrole: SELECTED_ROLE,
  Hostname: "kcn.reborn.vn",
  "Content-Type": "application/json",
  Accept: "application/json",
};

function urlBase(p) {
  if (p.startsWith("/bpmapi/")) return "https://bpm.reborn.vn" + p;
  if (p.startsWith("/sales/") || p.startsWith("/customer/")) return "https://biz.reborn.vn" + p;
  return "https://reborn.vn" + p;
}

async function api(ctx, urlPath, opts = {}) {
  const url = urlBase(urlPath);
  const res = await ctx.fetch(url, {
    method: opts.method || "GET",
    headers: { ...HEADERS, ...(opts.headers || {}) },
    data: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const status = res.status();
  const txt = await res.text();
  try {
    return { status, json: JSON.parse(txt) };
  } catch {
    return { status, json: null, text: txt.slice(0, 500) };
  }
}

const log = (n, m) => console.log(`\n[${n}] ${m}`);

async function main() {
  const ctx = await pwRequest.newContext();

  // ============ S1. Resolve workflow processId ============
  log("S1", "Resolve commission-mentor-v1 processId");
  const cached = fs.existsSync(PROCESS_ID_CACHE) ? JSON.parse(fs.readFileSync(PROCESS_ID_CACHE, "utf8")) : {};
  const processIds = cached[PROCESS_CODE] || [];
  if (processIds.length === 0) {
    throw new Error("No processId cached for commission-mentor-v1. Run commission-mentor-v1.spec.mjs first.");
  }
  const processId = processIds[processIds.length - 1];
  console.log(`  ✓ processId=${processId}`);

  // ============ S1.5 Ensure startTask exists for Start_commission_v1 ============
  log("S1.5", "Ensure startTask record (isActive=1) for Start_commission_v1");
  const stRes = await api(ctx, `/bpmapi/startTask/list?nodeId=Start_commission_v1&page=1&limit=5`);
  const existing = stRes.json?.result?.items || [];
  if (existing.length === 0) {
    const startRes = await api(ctx, "/bpmapi/startTask/update", {
      method: "POST",
      body: {
        id: null,
        nodeId: "Start_commission_v1",
        code: "start_commission_v1",
        name: "Bắt đầu — nhận trigger",
        description: "StartEvent kích hoạt khi nhận trigger ORDER_CLOSED",
        isActive: 1,
      },
    });
    if (startRes.json?.code !== 0) throw new Error(`startTask create failed: ${JSON.stringify(startRes.json)}`);
    console.log(`  ✓ startTask created (id=${startRes.json.result?.id})`);
  } else {
    console.log(`  ↻ startTask đã có (id=${existing[0].id} isActive=${existing[0].isActive})`);
  }

  // ============ S2. Find a groupId (loại hồ sơ) ============
  log("S2", "Pick a groupId (loại hồ sơ) — bất kỳ");
  const grpRes = await api(ctx, "/bpmapi/objectGroup/list?page=1&limit=10");
  const groups = grpRes.json?.result?.items || [];
  if (groups.length === 0) throw new Error(`objectGroup/list empty: ${JSON.stringify(grpRes.json)}`);
  const groupId = groups[0].id;
  console.log(`  ✓ groupId=${groupId} (${groups[0].name})`);

  // ============ S3. Create hồ sơ (processedObject) ============
  log("S3", `Create hồ sơ name="${TEST_NAME}"`);
  const createRes = await api(ctx, "/bpmapi/processedObject/update", {
    method: "POST",
    body: {
      name: TEST_NAME,
      groupId,
      objectExtraInfos: [],
    },
  });
  if (createRes.json?.code !== 0 || !createRes.json?.result?.id) {
    throw new Error(`Create hồ sơ failed: ${JSON.stringify(createRes.json)}`);
  }
  const potId = createRes.json.result.id;
  console.log(`  ✓ potId=${potId}`);

  // ============ S3.5 Pre-populate var_varPot ============
  // FE manual "Trình hồ sơ" không truyền varPot → ScriptTask đọc rỗng → fall vào FAILED branch.
  // Workaround: inject variableInstance trước khi trình.
  log("S3.5", "Pre-populate var_varPot (mentorEmployeeId, totalAmount, etc.)");
  const declListRes = await api(ctx, `/bpmapi/variableDeclare/list?processId=${processId}&page=1&limit=10`);
  const declares = declListRes.json?.result?.items || [];
  const varPotDecl = declares.find((d) => d.name === "varPot");
  if (!varPotDecl) throw new Error(`varPot declare not found in process ${processId}`);
  console.log(`  varPot declareId=${varPotDecl.id}`);

  const sourceEventId = `pw-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const varPotValue = {
    orderId: 7821,
    orderCode: "HD7821-PW",
    orderType: "COURSE_ENROLLMENT",
    customerId: 8842,
    mentorEmployeeId: 5566,
    totalAmount: 2400000.0,
    currency: "VND",
    tier: "STANDARD",
    closedAt: "2026-05-02T15:00:00+07:00",
    closedBy: 12,
    sourceEventId,
    employeeId: 5566,
    departmentId: 10,
  };
  const viRes = await api(ctx, "/bpmapi/variableInstance/update", {
    method: "POST",
    body: {
      id: null,
      variableId: varPotDecl.id,
      variableName: "varPot",
      variableValue: JSON.stringify(varPotValue),
      potId,
    },
  });
  if (viRes.json?.code !== 0) throw new Error(`variableInstance/update failed: ${JSON.stringify(viRes.json)}`);
  console.log(`  ✓ var_varPot.totalAmount=2400000, mentorEmployeeId=5566, sourceEventId=${sourceEventId}`);

  // ============ S4. Trình hồ sơ → kích hoạt workflow ============
  log("S4", `Trình hồ sơ ${potId} → quy trình ${processId}`);
  const trinhRes = await api(ctx, "/bpmapi/processInstance/update", {
    method: "POST",
    body: {
      processId,
      potId,
      startNodeId: null,
    },
  });
  console.log(`  → status=${trinhRes.status} code=${trinhRes.json?.code} msg=${trinhRes.json?.message || "(none)"}`);
  if (trinhRes.json?.code !== 0) {
    throw new Error(`Trình hồ sơ failed: ${JSON.stringify(trinhRes.json)}`);
  }
  const instanceId = trinhRes.json.result?.id;
  console.log(`  ✓ processInstance.id=${instanceId}`);

  // ============ S5. Wait + check processedObjectLog ============
  log("S5", "Wait 8s rồi check processedObjectLog (ScriptTask + ServiceTask transit?)");
  await new Promise((r) => setTimeout(r, 8000));

  const logRes = await api(ctx, `/bpmapi/processedObjectLog/list?potId=${potId}&page=1&limit=20`);
  const logs = (logRes.json?.result || []).filter((l) => l.potId === potId);
  console.log(`  found ${logs.length} log entries for potId=${potId}`);
  for (const l of logs) {
    console.log(`    nodeId=${l.nodeId} type=${l.typeNode} status=${l.status} time=${l.transitTime}`);
  }

  // ============ S6. Verify sales /commission/list ============
  log("S6", "Check /sales/commission/list?employeeId=5566 (mentor commission row?)");
  const cmsnRes = await api(ctx, "/sales/commission/list?employeeId=5566&page=1&limit=10");
  const items = cmsnRes.json?.result?.items || [];
  console.log(`  found ${items.length} commission row(s) for mentor 5566`);
  for (const i of items.slice(0, 3)) {
    console.log(`    id=${i.id} orderId=${i.orderId} gross=${i.grossAmount} net=${i.netAmount} status=${i.status} eventId=${i.externalEventId}`);
  }

  // ============ Done ============
  console.log("\n========================================");
  console.log(`✅ Test triggered:`);
  console.log(`   hồ sơ:      potId=${potId} (${TEST_NAME})`);
  console.log(`   workflow:   processId=${processId} (${PROCESS_CODE})`);
  console.log(`   instance:   id=${instanceId}`);
  console.log(`   logs:       ${logs.length} entries`);
  console.log(`   commission: ${items.length} rows for mentor 5566`);
  console.log("========================================");

  await ctx.dispose();
}

main().catch((err) => {
  console.error("\n❌ FAILED:", err.message);
  process.exit(1);
});
