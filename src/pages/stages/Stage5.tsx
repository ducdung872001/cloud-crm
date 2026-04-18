import { useState } from "react";
import { useApp } from "../../context/AppContext";
import BackendStackModal from "../../forms/stage5/BackendStackModal";
import SchemaEditorModal from "../../forms/stage5/SchemaEditorModal";
import EndpointFormModal, { type Endpoint } from "../../forms/stage5/EndpointFormModal";
import OpenApiImportModal from "../../forms/stage5/OpenApiImportModal";
import CodegenModal from "../../forms/stage5/CodegenModal";
import ContractSyncModal from "../../forms/stage5/ContractSyncModal";

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/screens", desc: "List all screens with filter", status: "ok" },
  { method: "POST", path: "/api/v1/screens", desc: "Create new screen", status: "ok" },
  { method: "GET", path: "/api/v1/campaigns", desc: "List campaigns", status: "ok" },
  { method: "PUT", path: "/api/v1/campaigns/{id}/schedule", desc: "Update campaign schedule", status: "ok" },
  { method: "GET", path: "/api/v1/reports/uptime", desc: "Screen uptime report", status: "wip" },
];

const METHOD_STYLE: Record<string, { bg: string; color: string }> = {
  GET: { bg: "#DBEAFE", color: "#1E40AF" },
  POST: { bg: "#DCFCE7", color: "#15803D" },
  PUT: { bg: "#FEF3C7", color: "#92400E" },
  DELETE: { bg: "#FEE2E2", color: "#B91C1C" },
};

export default function Stage5() {
  const { showToast } = useApp();
  const [stackOpen, setStackOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [epOpen, setEpOpen] = useState(false);
  const [epEditing, setEpEditing] = useState<Endpoint | null>(null);
  const [openapiOpen, setOpenapiOpen] = useState(false);
  const [codegenOpen, setCodegenOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-head">
          <div className="card-title">API Endpoints sinh tự động</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              type="button"
              className="btn sm"
              onClick={() => {
                setEpEditing(null);
                setEpOpen(true);
              }}
            >
              + Thêm
            </button>
            <span className="tag tag-ai">{ENDPOINTS.length} endpoints</span>
          </div>
        </div>
        <div style={{ maxHeight: 480, overflowY: "auto" }}>
          <div className="file-list">
            {ENDPOINTS.map((e) => {
              const style = METHOD_STYLE[e.method] ?? { bg: "#F1F5F9", color: "#475569" };
              return (
                <div
                  key={`${e.method}-${e.path}`}
                  className="file-item"
                  onClick={() => {
                    setEpEditing({
                      id: e.path,
                      method: e.method,
                      path: e.path,
                      desc: e.desc,
                      auth: "jwt",
                      params: "",
                      responseSchema: "",
                      status: e.status as "ok" | "wip",
                    });
                    setEpOpen(true);
                  }}
                >
                  <div className="file-ico" style={{ background: style.bg, color: style.color }}>
                    {e.method}
                  </div>
                  <div>
                    <div className="file-name" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      {e.path}
                    </div>
                    <div className="file-sub">{e.desc}</div>
                  </div>
                  <span className={`tag ${e.status === "ok" ? "tag-ok" : "tag-warn"}`}>{e.status === "ok" ? "✓" : "wip"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Contract sync · FE ↔ BE</div>
          <span className="tag tag-ai">Live</span>
        </div>
        <div className="card-body">
          <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 12 }}>
            OpenAPI spec tự động generate, FE và BE agent đọc cùng spec.
          </div>
          <div className="code-block">
            <span className="kw">openapi:</span> <span className="str">3.0.3</span>
            {"\n"}
            <span className="kw">info:</span>
            {"\n"}
            {"  "}
            <span className="kw">title:</span> Project API{"\n"}
            {"  "}
            <span className="kw">version:</span> <span className="str">1.0.0</span>
            {"\n"}
            <span className="kw">paths:</span>
            {"\n"}
            {"  "}
            <span className="kw">/screens:</span>
            {"\n"}
            {"    "}
            <span className="kw">get:</span>
            {"\n"}
            {"      "}
            <span className="kw">parameters:</span>
            {"\n"}
            {"        - "}
            <span className="kw">name:</span> city{"\n"}
            {"          "}
            <span className="kw">schema:</span>
            {"\n"}
            {"            "}
            <span className="kw">enum:</span> [<span className="str">HN</span>, <span className="str">HCM</span>, <span className="str">DN</span>]
          </div>
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ padding: 10, background: "var(--slate-50)", borderRadius: 6, fontSize: 11 }}>
              <div style={{ color: "var(--slate-500)" }}>Frontend sync</div>
              <div style={{ color: "var(--emerald-500)", fontWeight: 600 }}>✓ last: 2m ago</div>
            </div>
            <div style={{ padding: 10, background: "var(--slate-50)", borderRadius: 6, fontSize: 11 }}>
              <div style={{ color: "var(--slate-500)" }}>Backend sync</div>
              <div style={{ color: "var(--emerald-500)", fontWeight: 600 }}>✓ last: 30s ago</div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <button type="button" className="btn" onClick={() => setStackOpen(true)}>
          ⚙ Backend stack
        </button>
        <button type="button" className="btn" onClick={() => setSchemaOpen(true)}>
          🗃 DB schema
        </button>
        <button type="button" className="btn" onClick={() => setOpenapiOpen(true)}>
          ↑ Import OpenAPI
        </button>
        <button type="button" className="btn" onClick={() => setContractOpen(true)}>
          🔗 Contract sync
        </button>
        <button type="button" className="btn ai" onClick={() => setCodegenOpen(true)}>
          ✦ Codegen
        </button>
      </div>

      <BackendStackModal open={stackOpen} onClose={() => setStackOpen(false)} />
      <SchemaEditorModal open={schemaOpen} onClose={() => setSchemaOpen(false)} />
      <EndpointFormModal open={epOpen} onClose={() => setEpOpen(false)} endpoint={epEditing} onSave={() => showToast("success", "Endpoint đã lưu")} />
      <OpenApiImportModal open={openapiOpen} onClose={() => setOpenapiOpen(false)} />
      <CodegenModal open={codegenOpen} onClose={() => setCodegenOpen(false)} />
      <ContractSyncModal open={contractOpen} onClose={() => setContractOpen(false)} />
    </div>
  );
}
