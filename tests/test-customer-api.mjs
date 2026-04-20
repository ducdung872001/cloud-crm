/**
 * test-customer-api.mjs — CRUD Customer via API (ổn định hơn UI).
 * Testcases: TC-CUSTOMER-001, 002, 002B, 005, 007, 008, 012
 */
import { createApiRunner } from "./api-helpers.mjs";

const api = await createApiRunner("CUSTOMER", "Thành viên (API)");

// ── TC-001: list ──
const list = await api.get("/adminapi/customer/list_paid", { page: 1, size: 10 });
api.assert(
  "TC-CUSTOMER-001",
  list.status === 200 && (list.code === 0 || list.code === 200),
  `GET list_paid → status=${list.status}, code=${list.code}, items=${Array.isArray(list.result) ? list.result.length : (list.data?.length ?? "?")}`
);

// ── TC-002: tạo mới ──
const stamp = Date.now().toString().slice(-8);
const newCustomer = {
  id: 0,
  name: `QA API ${stamp}`,
  phone: `09${stamp}`,
  gender: "MALE",
  birthday: "01/01/1990",
  custType: 1,
  careerId: 0,
  avatar: "",
  firstCall: "",
  height: "",
  weight: "",
  trademark: "",
  taxCode: "",
  customerExtraInfos: [],
};
const create = await api.post("/adminapi/customer/update", newCustomer);
if (create.status !== 200 || (create.code !== 0 && create.code !== 200)) {
  console.log("  [debug] create body:", JSON.stringify(create.body).slice(0, 400));
}
const createdId =
  create.result?.id ?? create.data?.id ?? create.result ?? (typeof create.data === "number" ? create.data : null);
api.assert(
  "TC-CUSTOMER-002",
  create.status === 200 && (create.code === 0 || create.code === 200),
  `POST update (create) → status=${create.status}, code=${create.code}, newId=${createdId}`
);

// ── TC-002B: round-trip (tìm lại theo SĐT) ──
const found = await api.get("/adminapi/customer/list_paid", { keyword: newCustomer.phone, page: 1, size: 10 });
const items = found.result || found.data || [];
const match = Array.isArray(items) ? items.find((x) => x?.phone === newCustomer.phone) : null;
api.assert(
  "TC-CUSTOMER-002B",
  !!match,
  `Round-trip tìm theo SĐT "${newCustomer.phone}" → ${match ? `id=${match.id}, name="${match.name}"` : "không tìm thấy"}`
);

// ── TC-005: chặn trùng SĐT ──
const dup = await api.post("/adminapi/customer/update", { ...newCustomer, id: 0 });
api.assert(
  "TC-CUSTOMER-005",
  dup.code !== 0 && dup.code !== 200,
  `POST update trùng SĐT → code=${dup.code}, msg="${dup.message || ""}" (kỳ vọng: backend chặn)`
);

// ── TC-007: cập nhật ──
if (match) {
  const updated = await api.post("/adminapi/customer/update", {
    ...newCustomer,
    id: match.id,
    name: `QA API ${stamp} updated`,
  });
  api.assert(
    "TC-CUSTOMER-007",
    updated.status === 200 && (updated.code === 0 || updated.code === 200),
    `PUT (update) id=${match.id} → status=${updated.status}, code=${updated.code}`
  );

  // verify update persisted
  const detail = await api.get("/adminapi/customer/get", { id: match.id });
  const detailName = detail.result?.name || detail.data?.name;
  api.assert(
    "TC-CUSTOMER-007B",
    detailName === `QA API ${stamp} updated`,
    `GET detail → name="${detailName}" (kỳ vọng chứa "updated")`
  );
}

// ── TC-008: search ──
const search = await api.get("/adminapi/customer/list_paid", { keyword: "QA API", page: 1, size: 5 });
api.assert(
  "TC-CUSTOMER-008",
  search.status === 200,
  `GET list_paid?keyword=QA API → status=${search.status}`
);

// ── TC-012: xoá ──
if (match) {
  const del = await api.del(`/adminapi/customer/delete?id=${match.id}`);
  api.assert(
    "TC-CUSTOMER-012",
    del.status === 200 && (del.code === 0 || del.code === 200),
    `DELETE id=${match.id} → status=${del.status}, code=${del.code}`
  );

  // verify deleted
  const refind = await api.get("/adminapi/customer/list_paid", { keyword: newCustomer.phone, page: 1, size: 5 });
  const stillThere = (refind.result || refind.data || []).find((x) => x?.id === match.id);
  api.assert(
    "TC-CUSTOMER-012B",
    !stillThere,
    `Sau xoá, không còn tìm thấy id=${match.id} trong list`
  );
}

await api.done();
