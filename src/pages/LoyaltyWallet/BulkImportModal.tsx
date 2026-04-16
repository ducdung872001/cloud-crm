// Import hội viên hàng loạt từ CSV/Excel
import React, { useState, useRef } from "react";

interface ImportRow {
  name: string;
  phone: string;
  email?: string;
  points?: number;
  tier?: string;
  isDuplicate?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onImport: (rows: ImportRow[]) => void;
}

export default function BulkImportModal({ visible, onClose, onImport }: Props) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!visible) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setError("File phải có ít nhất 1 dòng header + 1 dòng dữ liệu");
        return;
      }

      // Parse header
      const header = lines[0].toLowerCase().split(/[,;\t]/).map((h) => h.trim());
      const nameIdx = header.findIndex((h) => h.includes("tên") || h.includes("name") || h.includes("ho ten"));
      const phoneIdx = header.findIndex((h) => h.includes("phone") || h.includes("sdt") || h.includes("số điện thoại") || h.includes("điện thoại"));
      const emailIdx = header.findIndex((h) => h.includes("email"));
      const pointsIdx = header.findIndex((h) => h.includes("point") || h.includes("điểm"));
      const tierIdx = header.findIndex((h) => h.includes("tier") || h.includes("hạng") || h.includes("hang"));

      if (nameIdx < 0 || phoneIdx < 0) {
        setError('File phải có cột "Họ tên" và "SĐT" (hoặc "name", "phone")');
        return;
      }

      const parsed: ImportRow[] = [];
      const phoneSet = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,;\t]/).map((c) => c.trim());
        const name = cols[nameIdx] ?? "";
        const phone = (cols[phoneIdx] ?? "").replace(/[^\d+]/g, "");
        if (!name || !phone) continue;

        const isDuplicate = phoneSet.has(phone);
        phoneSet.add(phone);

        parsed.push({
          name,
          phone,
          email: emailIdx >= 0 ? cols[emailIdx] : undefined,
          points: pointsIdx >= 0 ? parseInt(cols[pointsIdx]) || 0 : undefined,
          tier: tierIdx >= 0 ? cols[tierIdx] : undefined,
          isDuplicate,
        });
      }

      setRows(parsed);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleImport = async () => {
    setImporting(true);
    const validRows = rows.filter((r) => !r.isDuplicate);
    await onImport(validRows);
    setImporting(false);
    onClose();
  };

  const duplicateCount = rows.filter((r) => r.isDuplicate).length;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 12, padding: 24,
          maxWidth: 800, width: "90%", maxHeight: "85vh", overflow: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: 16, color: "#0B2E2A" }}>
          Import hội viên từ CSV
        </h2>

        {/* Upload area */}
        {rows.length === 0 && (
          <div>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                padding: "40px 20px", textAlign: "center", cursor: "pointer",
                border: "2px dashed #D9E0DE", borderRadius: 12, background: "#F5F9F8",
                color: "#6B8A85", fontSize: 14,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>📤</div>
              <div style={{ fontWeight: 600 }}>Chọn file CSV hoặc kéo thả vào đây</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>
                Yêu cầu: cột "Họ tên" + "SĐT". Tuỳ chọn: Email, Điểm, Hạng.
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={handleFile}
              style={{ display: "none" }}
            />

            {/* Template */}
            <div style={{ marginTop: 12, fontSize: 12, color: "#6B8A85" }}>
              Mẫu CSV: <code style={{ background: "#F5F9F8", padding: "2px 6px", borderRadius: 4 }}>
                Họ tên,SĐT,Email,Điểm,Hạng
              </code>
            </div>

            {error && (
              <div style={{
                marginTop: 12, padding: "10px 14px", background: "#FEF2F2",
                borderLeft: "4px solid #E85D4B", borderRadius: 6, color: "#991B1B", fontSize: 13,
              }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {rows.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0B2E2A" }}>
                  {rows.length} hội viên
                </span>
                {duplicateCount > 0 && (
                  <span style={{ fontSize: 12, color: "#E85D4B", marginLeft: 8 }}>
                    ({duplicateCount} trùng SĐT — sẽ bỏ qua)
                  </span>
                )}
              </div>
              <button
                onClick={() => { setRows([]); setError(null); }}
                style={{ padding: "6px 12px", fontSize: 12, border: "1px solid #D9E0DE", borderRadius: 6, background: "#fff", cursor: "pointer" }}
              >
                Chọn file khác
              </button>
            </div>

            <div style={{ maxHeight: 350, overflow: "auto", border: "1px solid #D9E0DE", borderRadius: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#E4F7F3", textAlign: "left" }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Họ tên</th>
                    <th style={thStyle}>SĐT</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Điểm</th>
                    <th style={thStyle}>Hạng</th>
                    <th style={thStyle}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid #D9E0DE",
                        background: r.isDuplicate ? "#FEF2F2" : "#fff",
                      }}
                    >
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>{r.name}</td>
                      <td style={tdStyle}>{r.phone}</td>
                      <td style={tdStyle}>{r.email ?? "—"}</td>
                      <td style={tdStyle}>{r.points?.toLocaleString("vi-VN") ?? "—"}</td>
                      <td style={tdStyle}>{r.tier ?? "—"}</td>
                      <td style={tdStyle}>
                        {r.isDuplicate ? (
                          <span style={{ color: "#E85D4B", fontWeight: 600 }}>Trùng SĐT</span>
                        ) : (
                          <span style={{ color: "#22C55E", fontWeight: 600 }}>OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 100 && (
                <div style={{ padding: 10, textAlign: "center", fontSize: 12, color: "#6B8A85" }}>
                  Hiển thị 100/{rows.length} dòng đầu
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={cancelBtn}>Huỷ</button>
              <button onClick={handleImport} disabled={importing} style={importBtn}>
                {importing ? "Đang import..." : `Import ${rows.length - duplicateCount} hội viên`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "#0B2E2A" };
const tdStyle: React.CSSProperties = { padding: "8px 10px" };
const cancelBtn: React.CSSProperties = { padding: "10px 20px", background: "#fff", color: "#6B8A85", border: "1px solid #D9E0DE", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" };
const importBtn: React.CSSProperties = { padding: "10px 24px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" };
