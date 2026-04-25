// Zalo Mini App · Students — list + chat 1-tap
import React, { useState } from "react";
import ZaloMiniLayout from "../_shared/ZaloMiniLayout";
import { zmp } from "../_shared/zmpSdk";
import { MOCK_STUDENTS } from "@/mocks/mentorhub";

const segmentPill: Record<string, string> = {
  VIP: "zmp-pill--amber",
  Active: "zmp-pill--green",
  "Churn risk": "zmp-pill--red",
  New: "zmp-pill--upcoming",
};

export default function ZaloStudents() {
  document.title = "MentorHub · Học viên";
  const [query, setQuery] = useState("");

  const filtered = MOCK_STUDENTS.filter((s) => !query || (s.name + s.company).toLowerCase().includes(query.toLowerCase()));
  const churnRisk = MOCK_STUDENTS.filter((s) => s.segment === "Churn risk").length;

  return (
    <ZaloMiniLayout title="Học viên">
      <input
        type="search"
        placeholder="🔍 Tìm tên, công ty…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--zmp-line)", fontSize: 14, fontFamily: "inherit", marginBottom: 12, background: "#fff" }}
      />

      {churnRisk > 0 && (
        <div className="zmp-card" style={{ background: "#FEF2F2", borderColor: "#FCA5A5", padding: "10px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--zmp-red)" }}>⚠ {churnRisk} HV có nguy cơ rời đi</div>
          <div style={{ fontSize: 11, color: "var(--zmp-ink-soft)", marginTop: 2 }}>Nhắn thăm hỏi để giữ kết nối</div>
        </div>
      )}

      <div className="zmp-card" style={{ padding: 0 }}>
        {filtered.map((s, i) => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, padding: "12px 14px", borderBottom: i < filtered.length - 1 ? "1px solid var(--zmp-line)" : 0, alignItems: "center" }}>
            <div className="zmp-avatar" style={{ background: s.avatarBg }}>{s.short}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{s.name}</div>
              <div className="zmp-mono" style={{ fontSize: 10, color: "var(--zmp-ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.company} · {s.courses} khoá
                {s.nps > 0 && <span> · ★ {s.nps}</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
              <span className={"zmp-pill " + (segmentPill[s.segment] || "zmp-pill--green")} style={{ fontSize: 8 }}>{s.segment}</span>
              <button
                className="zmp-btn"
                style={{ padding: "4px 10px", fontSize: 11, minHeight: 28, background: "#0068FF", color: "#fff", borderColor: "#0068FF" }}
                onClick={() => zmp.openUrl(`https://zalo.me/${s.phone.replace(/\s/g, "")}`)}
              >
                💬
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--zmp-ink-soft)", fontSize: 13 }}>Không tìm thấy học viên</div>
        )}
      </div>
    </ZaloMiniLayout>
  );
}
