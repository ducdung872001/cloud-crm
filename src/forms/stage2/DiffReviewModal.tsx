import { useState } from "react";
import { Modal } from "../../components/ui";
import { useApp } from "../../context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Decision = "pending" | "accepted" | "rejected";

interface DiffSection {
  id: string;
  title: string;
  lines: { type: "add" | "del" | "ctx"; text: string }[];
}

const SAMPLE: DiffSection[] = [
  {
    id: "2.1",
    title: "§ 2.1 Screen Inventory Management",
    lines: [
      { type: "ctx", text: "Hệ thống cho phép CRUD màn hình với metadata:" },
      { type: "ctx", text: "  vị trí (GPS), resolution, orientation," },
      { type: "del", text: "- store branch, trạng thái online/offline." },
      { type: "add", text: "+ store branch, trạng thái online/offline," },
      { type: "add", text: "+ nhóm phân loại (promotion/brand/info)," },
      { type: "add", text: "+ tag theo chiến dịch marketing." },
    ],
  },
  {
    id: "3.2",
    title: "§ 3.2 Reporting (NEW)",
    lines: [
      { type: "add", text: "+ FR-025: Xuất báo cáo định kỳ theo tuần/tháng" },
      { type: "add", text: "+   - Format: PDF + Excel" },
      { type: "add", text: "+   - Tự động gửi email cho Marketing Lead" },
    ],
  },
  {
    id: "4.1",
    title: "§ 4.1 Integration (REMOVED)",
    lines: [
      { type: "del", text: "- FR-018: Tích hợp với hệ thống POS hiện tại" },
      { type: "del", text: "-   (KH quyết định không cần — Q3/2026 thay POS mới)" },
    ],
  },
];

export default function DiffReviewModal({ open, onClose }: Props) {
  const { showToast } = useApp();
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const accept = (id: string) => setDecisions((p) => ({ ...p, [id]: "accepted" }));
  const reject = (id: string) => setDecisions((p) => ({ ...p, [id]: "rejected" }));

  const acceptAll = () => {
    const next: Record<string, Decision> = {};
    SAMPLE.forEach((s) => (next[s.id] = "accepted"));
    setDecisions(next);
    showToast("success", "Accept tất cả thay đổi");
  };

  const publishV13 = () => {
    const pendingCount = SAMPLE.filter((s) => !decisions[s.id] || decisions[s.id] === "pending").length;
    if (pendingCount > 0) {
      showToast("warn", `Còn ${pendingCount} section chưa quyết định`, "Accept hoặc reject hết đã");
      return;
    }
    showToast("success", "Đã publish URD v1.3", "Thông báo Dev/QA review impact");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Review diff URD v1.2 → v1.3"
      kicker="STAGE 2 · DIFF"
      sub="Accept hoặc reject từng section trước khi publish"
      size="xwide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="btn" onClick={acceptAll}>
            ✓ Accept tất cả
          </button>
          <button type="button" className="btn primary" onClick={publishV13}>
            Publish v1.3 →
          </button>
        </>
      }
    >
      {SAMPLE.map((s) => {
        const decision = decisions[s.id] ?? "pending";
        return (
          <div
            key={s.id}
            className="diff-wrap"
            style={{
              marginBottom: 12,
              borderColor: decision === "accepted" ? "var(--emerald-500)" : decision === "rejected" ? "var(--rose-500)" : "var(--slate-200)",
              opacity: decision === "rejected" ? 0.5 : 1,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 14px",
                background: "var(--navy-800)",
                color: "var(--teal-300)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600 }}>{s.title}</div>
              <div style={{ display: "flex", gap: 4 }}>
                {decision === "accepted" ? (
                  <span className="tag tag-ok">✓ Accepted</span>
                ) : decision === "rejected" ? (
                  <span className="tag tag-hu">✗ Rejected</span>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => reject(s.id)}
                      style={{ background: "rgba(225,29,72,0.15)", color: "#fff", borderColor: "transparent" }}
                    >
                      ✗ Reject
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => accept(s.id)}
                      style={{
                        background: "rgba(16,185,129,0.15)",
                        color: "#fff",
                        borderColor: "transparent",
                      }}
                    >
                      ✓ Accept
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="diff-body">
              {s.lines.map((l, i) => (
                <div key={i} className={`diff-line diff-${l.type}`}>
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Modal>
  );
}
