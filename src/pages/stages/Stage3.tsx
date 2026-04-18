import { useState } from "react";
import { useApp } from "../../context/AppContext";
import RegeneratePrototypeModal from "../../forms/stage3/RegeneratePrototypeModal";
import FeedbackPinModal from "../../forms/stage3/FeedbackPinModal";
import FeedbackDrawer from "../../forms/stage3/FeedbackDrawer";
import ShareLinkModal from "../../forms/stage3/ShareLinkModal";
import DevicePresetModal from "../../forms/stage3/DevicePresetModal";
import VersionSwitcherModal from "../../forms/stage3/VersionSwitcherModal";

const FB_SAMPLE = {
  id: "fb-1",
  author: "A. Minh (Mega Mart)",
  title: "Card Online nên có trend 7 ngày",
  body: "Hiện tại card Online chỉ hiển thị số hiện tại. KH muốn sparkline 7 ngày gần nhất để thấy xu hướng uptime.",
  severity: "major" as const,
  status: "open" as const,
  category: "ui",
  assignee: "ai-agent",
  page: "Dashboard",
  replies: [{ id: "r1", author: "An Minh", text: "AI sẽ apply khi regenerate tiếp theo.", ts: "2h trước" }],
};

const PREVIEW_SRC = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,sans-serif}body{background:#F8FAFC;color:#1E293B}.h{background:#0B1426;color:#fff;padding:12px 20px;display:flex;align-items:center;gap:16px}.h .logo{font-weight:700;color:#2DD4BF}.h .nav{display:flex;gap:14px;font-size:12px}.h .nav a{color:#94A3B8;text-decoration:none}.h .nav a.on{color:#fff}.h .sp{flex:1}.h .ac{width:28px;height:28px;border-radius:50%;background:#14B8A6;display:grid;place-items:center;font-size:11px;font-weight:700;color:#0B1426}.page{padding:20px}.tit{font-size:22px;font-weight:700;margin-bottom:4px}.sub{font-size:12px;color:#64748B;margin-bottom:16px}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}.c{background:#fff;border-radius:8px;padding:12px;border:1px solid #E2E8F0}.c .l{font-size:10px;color:#64748B;text-transform:uppercase}.c .v{font-size:22px;font-weight:700;margin-top:2px}.c .d{font-size:10px;color:#10B981;margin-top:2px}</style></head><body><div class="h"><div class="logo">▣ Preview</div><div class="nav"><a href="#" class="on">Dashboard</a><a href="#">Màn hình</a><a href="#">Playlist</a></div><div class="sp"></div><div class="ac">RB</div></div><div class="page"><div class="tit">Tổng quan hệ thống</div><div class="sub">Preview prototype sinh từ URD</div><div class="cards"><div class="c"><div class="l">Màn hình</div><div class="v">118</div><div class="d">3 thành phố</div></div><div class="c"><div class="l">Online</div><div class="v" style="color:#10B981">114</div><div class="d">↑ 96.6%</div></div><div class="c"><div class="l">Offline</div><div class="v" style="color:#EF4444">4</div><div class="d">Cần xử lý</div></div><div class="c"><div class="l">Campaign</div><div class="v">7</div><div class="d">12 playlist</div></div></div></div></body></html>`;

const FEEDBACK = [
  { who: "A. Minh (KH)", text: '"Card Online nên có trend 7 ngày, không phải chỉ số cứng"', meta: "2h trước · Dashboard" },
  { who: "C. Lan (KH)", text: '"Bản đồ cần filter theo thành phố"', meta: "3h trước · Map" },
  { who: "A. Minh (KH)", text: '"Thêm cột Doanh thu ước tính theo campaign"', meta: "3h trước · Reports" },
];

export default function Stage3() {
  const { showToast } = useApp();
  const [regenOpen, setRegenOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [fbDetail, setFbDetail] = useState<typeof FB_SAMPLE | null>(null);

  return (
    <>
      <div className="grid-1-3">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Live Preview · prototype-v2.html</div>
            <div>
              <span className="tag tag-ai">AI v2</span>
              <span className="tag tag-ok" style={{ marginLeft: 4 }}>
                45 kB
              </span>
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <div className="device-frame">
              <div className="device-top">
                <div className="device-dot" style={{ background: "#FF5F57" }} />
                <div className="device-dot" style={{ background: "#FEBC2E" }} />
                <div className="device-dot" style={{ background: "#28C840" }} />
                <div className="device-url">prototype.forge.reborn.vn/preview</div>
              </div>
              <iframe title="Prototype preview" srcDoc={PREVIEW_SRC} />
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              <button type="button" className="btn sm" onClick={() => setDeviceOpen(true)}>
                📱 Device
              </button>
              <button type="button" className="btn sm" onClick={() => setVersionOpen(true)}>
                ↻ Versions
              </button>
              <button type="button" className="btn sm" onClick={() => setShareOpen(true)}>
                🔗 Share
              </button>
              <button type="button" className="btn sm" onClick={() => setPinOpen(true)}>
                💬 Pin feedback
              </button>
              <button type="button" className="btn sm ai" onClick={() => setRegenOpen(true)}>
                ✦ Regenerate
              </button>
              <div style={{ flex: 1 }} />
              <button type="button" className="btn sm" onClick={() => showToast("info", "Mở tab mới")}>
                ↗ Mở tab
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">
              <div className="card-title">Client Feedback</div>
              <span className="tag tag-warn">{FEEDBACK.length} pending</span>
            </div>
            <div className="file-list">
              {FEEDBACK.map((f, i) => (
                <div key={i} className="file-item" onClick={() => setFbDetail(FB_SAMPLE)}>
                  <div className="file-ico" style={{ background: "#FEE2E2", color: "#B91C1C" }}>
                    💬
                  </div>
                  <div>
                    <div className="file-name" style={{ fontSize: 12 }}>
                      {f.who}
                    </div>
                    <div className="file-sub" style={{ color: "var(--slate-700)", marginTop: 2 }}>
                      {f.text}
                    </div>
                    <div className="file-sub" style={{ marginTop: 4 }}>
                      {f.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">AI iterate</div>
              <span className="tag tag-ai">Opus 4.7</span>
            </div>
            <div className="card-body">
              <textarea
                style={{
                  width: "100%",
                  minHeight: 80,
                  border: "1px solid var(--slate-200)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 12,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                placeholder="Nhập yêu cầu cho AI, ví dụ: 'Apply feedback #1 và #2 vào prototype'"
              />
              <button
                type="button"
                className="btn ai"
                style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
                onClick={() => showToast("info", "AI đang xử lý...", "Ước tính 8s, $0.18")}
              >
                ✦ Gửi AI
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="checkpoint">
        <div className="cp-ico">✋</div>
        <div className="cp-text">
          <div className="cp-title">Checkpoint — Meeting lại khách hàng (chốt URD + Prototype)</div>
          <div className="cp-sub">Sau khi apply comment, cần meeting với KH chốt URD và ký duyệt prototype trước khi chuyển Stage 4–5.</div>
        </div>
        <button type="button" className="btn" onClick={() => showToast("info", "Mở calendar", "Đặt lịch với KH")}>
          Đặt lịch
        </button>
        <button type="button" className="btn primary" onClick={() => showToast("success", "Đã ký duyệt", "Chuyển Stage 4")}>
          Ký duyệt →
        </button>
      </div>

      <RegeneratePrototypeModal open={regenOpen} onClose={() => setRegenOpen(false)} />
      <FeedbackPinModal open={pinOpen} onClose={() => setPinOpen(false)} />
      <ShareLinkModal open={shareOpen} onClose={() => setShareOpen(false)} />
      <DevicePresetModal open={deviceOpen} onClose={() => setDeviceOpen(false)} />
      <VersionSwitcherModal open={versionOpen} onClose={() => setVersionOpen(false)} />
      <FeedbackDrawer open={!!fbDetail} onClose={() => setFbDetail(null)} feedback={fbDetail} />
    </>
  );
}
