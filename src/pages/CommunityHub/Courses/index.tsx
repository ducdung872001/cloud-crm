// [FitPro] Training Programs & Cộng đồng BO
// Thay thế "Courses & Clubs" co-working bằng giáo trình video + community BO
import React, { useState } from "react";
import { MOCK_COURSES, MOCK_CLUBS } from "@/mocks/community-hub/courses";
import "./index.scss";

const intensityMeta: Record<string, { label: string; color: string }> = {
  low: { label: "Nhẹ", color: "#4DE4C4" },
  medium: { label: "Vừa", color: "#00C9A7" },
  high: { label: "Cao", color: "#FF8C42" },
  very_high: { label: "Rất cao", color: "#E8473B" },
};

export default function CoursesPage() {
  document.title = "Giáo trình tập luyện FitPro";
  const [activeTab, setActiveTab] = useState<"programs" | "community">("programs");
  const [previewVideo, setPreviewVideo] = useState<any>(null);
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", intensity: "medium", duration: 45, sessions: 30, target: "" });
  const [communityDetail, setCommunityDetail] = useState<any>(null);
  const [communityMembersOf, setCommunityMembersOf] = useState<any>(null);

  const handleAddProgram = () => {
    if (!addForm.title.trim()) { alert("Vui lòng nhập tên giáo trình"); return; }
    alert(`✓ Đã tạo giáo trình "${addForm.title}" — mức độ ${addForm.intensity}, ${addForm.sessions} buổi × ${addForm.duration} phút`);
    setShowAddProgram(false);
    setAddForm({ title: "", intensity: "medium", duration: 45, sessions: 30, target: "" });
  };

  return (
    <div className="ch-courses-page">
      <div className="ch-courses-page__header">
        <div>
          <h2>Giáo trình & Cộng đồng FitPro</h2>
          <p style={{ fontSize: 13, color: "#6B8A85", marginTop: 4 }}>
            Video hướng dẫn chuẩn hóa — dạy ngay cả khi 0 khách. Thư viện cộng đồng BO.
          </p>
        </div>
        <div className="tab-switch">
          <button className={activeTab === "programs" ? "active" : ""} onClick={() => setActiveTab("programs")}>
            🎥 Giáo trình Video
          </button>
          <button className={activeTab === "community" ? "active" : ""} onClick={() => setActiveTab("community")}>
            👥 Cộng đồng BO
          </button>
        </div>
      </div>

      {activeTab === "programs" && (
        <div className="ch-courses-page__grid">
          {MOCK_COURSES.map((course: any) => {
            const intensity = intensityMeta[course.intensity] || intensityMeta.medium;
            return (
              <div key={course.id} className="course-card">
                <div className="course-card__image" style={{ background: `linear-gradient(135deg, ${intensity.color} 0%, #00C9A7 100%)` }}>
                  <div className="course-placeholder" style={{ color: "#fff", fontSize: 36 }}>
                    {course.intensity === "low" ? "🧘" : course.intensity === "medium" ? "💪" : course.intensity === "high" ? "🔥" : "⚡"}
                  </div>
                  <span className="course-type-badge" style={{ background: "rgba(255,255,255,.9)", color: intensity.color, fontWeight: 700 }}>
                    {intensity.label}
                  </span>
                </div>
                <div className="course-card__body">
                  <h3 style={{ fontSize: 14 }}>{course.title}</h3>
                  <p className="instructor" style={{ fontSize: 11, color: "#6B8A85" }}>🎓 {course.instructor}</p>
                  <div className="course-meta">
                    <span>🎯 {course.target || "Chung"}</span>
                  </div>
                  <div className="course-meta" style={{ marginTop: 4 }}>
                    <span>⏱ {course.duration_minutes || 45} phút/buổi</span>
                    <span>📅 {course.sessions} buổi</span>
                  </div>
                  <div className="course-date" style={{ fontSize: 11, color: "#00C9A7", marginTop: 4 }}>
                    ✅ {course.enrolled} học viên đang theo
                  </div>
                </div>
                <div className="course-card__footer">
                  <button className="btn-detail" onClick={() => setPreviewVideo(course)}>▶️ Xem video mẫu</button>
                </div>
              </div>
            );
          })}

          {/* Add new program card */}
          <div className="course-card course-card--add" onClick={() => setShowAddProgram(true)} style={{ cursor: "pointer" }}>
            <div className="add-content">
              <span className="add-icon">+</span>
              <span>Thêm giáo trình mới</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "community" && (
        <div className="ch-courses-page__clubs">
          {MOCK_CLUBS.map((club) => (
            <div key={club.id} className="club-card">
              <div className="club-card__header">
                <h3>{club.name}</h3>
                <span className="member-count">{club.members} BO</span>
              </div>
              <div className="club-card__body">
                <div className="club-info">
                  <span className="label">Admin nhóm:</span>
                  <span className="value">{club.leader}</span>
                </div>
                <div className="club-info">
                  <span className="label">Meetup tiếp theo:</span>
                  <span className="value">{club.next_meeting}</span>
                </div>
              </div>
              <div className="club-card__footer">
                <button className="btn-detail" onClick={() => setCommunityDetail(club)}>Vào nhóm</button>
                <button className="btn-members" onClick={() => setCommunityMembersOf(club)}>DS Business Owner</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Preview Video ── */}
      {previewVideo && (
        <div onClick={() => setPreviewVideo(null)} style={{ position: "fixed", inset: 0, background: "rgba(11,46,42,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: 720, maxWidth: "90vw", overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>▶️ {previewVideo.title}</h3>
              <button onClick={() => setPreviewVideo(null)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}>✕</button>
            </div>
            <div style={{ background: "#000", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64 }}>▶️</div>
                <div style={{ fontSize: 14, marginTop: 12, opacity: 0.7 }}>Video preview ({previewVideo.duration_minutes} phút)</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.5 }}>Prototype — sẽ embed YouTube/Vimeo sau</div>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: "#6B8A85", marginBottom: 8 }}>🎓 {previewVideo.instructor}</div>
              <div style={{ fontSize: 13 }}>🎯 Mục tiêu: <strong>{previewVideo.target}</strong></div>
              <div style={{ fontSize: 13, marginTop: 4 }}>⏱ {previewVideo.duration_minutes} phút × {previewVideo.sessions} buổi</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>✅ {previewVideo.enrolled} thành viên đang theo</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Thêm giáo trình mới ── */}
      {showAddProgram && (
        <div onClick={() => setShowAddProgram(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,46,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: 520, maxWidth: "90vw" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>🎥 Thêm giáo trình mới</h3>
              <button onClick={() => setShowAddProgram(false)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Tên giáo trình *</label>
                <input autoFocus type="text" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="VD: HIIT 30 — Đốt mỡ cấp tốc"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Mức độ</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {Object.entries(intensityMeta).map(([k, m]) => (
                    <button key={k} type="button" onClick={() => setAddForm({ ...addForm, intensity: k })}
                      style={{
                        padding: "10px 8px",
                        border: addForm.intensity === k ? `2px solid ${m.color}` : "1px solid #d9e0de",
                        background: addForm.intensity === k ? `${m.color}22` : "#fff",
                        color: addForm.intensity === k ? m.color : "#6B8A85",
                        borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                      }}>{m.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Thời lượng (phút)</label>
                  <input type="number" min={10} max={120} value={addForm.duration} onChange={(e) => setAddForm({ ...addForm, duration: +e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Số buổi</label>
                  <input type="number" min={1} max={100} value={addForm.sessions} onChange={(e) => setAddForm({ ...addForm, sessions: +e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Mục tiêu</label>
                <input type="text" value={addForm.target} onChange={(e) => setAddForm({ ...addForm, target: e.target.value })}
                  placeholder="VD: Giảm mỡ + tăng bền..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de" }} />
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E0E8E5", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddProgram(false)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #d9e0de", background: "#fff", color: "#6B8A85", fontWeight: 600, cursor: "pointer" }}>Hủy</button>
              <button onClick={handleAddProgram} disabled={!addForm.title.trim()} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#00C9A7", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: !addForm.title.trim() ? 0.5 : 1 }}>
                ✓ Tạo giáo trình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Community Detail ── */}
      {communityDetail && (
        <div onClick={() => setCommunityDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(11,46,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: 520, maxWidth: "90vw" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>👥 {communityDetail.name}</h3>
              <button onClick={() => setCommunityDetail(null)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ padding: 14, background: "#F5F9F8", borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#6B8A85" }}>Admin</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{communityDetail.leader}</div>
                <div style={{ fontSize: 12, color: "#6B8A85", marginTop: 8 }}>Thành viên</div>
                <div style={{ fontWeight: 700 }}>{communityDetail.members} BO</div>
                <div style={{ fontSize: 12, color: "#6B8A85", marginTop: 8 }}>Meetup tiếp theo</div>
                <div style={{ fontWeight: 700 }}>{communityDetail.next_meeting}</div>
              </div>
              <div style={{ padding: 14, background: "#E4F7F3", borderRadius: 8, fontSize: 12, color: "#0B2E2A" }}>
                💬 Đây là cộng đồng Zalo/Telegram private cho BO chia sẻ kinh nghiệm, hỏi đáp và hỗ trợ lẫn nhau. Tham gia bằng cách liên hệ admin.
              </div>
              <button onClick={() => { alert(`✓ Đã gửi yêu cầu tham gia "${communityDetail.name}" tới admin ${communityDetail.leader}`); setCommunityDetail(null); }}
                style={{ marginTop: 16, width: "100%", padding: "12px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                🚪 Yêu cầu vào nhóm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal DS Business Owner của community ── */}
      {communityMembersOf && (
        <div onClick={() => setCommunityMembersOf(null)} style={{ position: "fixed", inset: 0, background: "rgba(11,46,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: 560, maxWidth: "90vw", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>📋 DS thành viên — {communityMembersOf.name}</h3>
              <button onClick={() => setCommunityMembersOf(null)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto" }}>
              <div style={{ fontSize: 12, color: "#6B8A85", marginBottom: 12 }}>
                {communityMembersOf.members} Business Owners đang tham gia
              </div>
              {Array.from({ length: Math.min(communityMembersOf.members, 10) }).map((_, i) => (
                <div key={i} style={{ padding: 10, marginBottom: 6, background: "#F5F9F8", borderRadius: 6, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00C9A7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"][i]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>BO #{String(i + 1).padStart(3, "0")} — {["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô"][i]} Văn {String.fromCharCode(65 + i)}</div>
                    <div style={{ fontSize: 10, color: "#6B8A85" }}>Tier {(i % 3) + 1} · {["Hà Nội", "HCM", "Đà Nẵng", "Hải Phòng"][i % 4]}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#00C9A7" }}>● Active</span>
                </div>
              ))}
              {communityMembersOf.members > 10 && (
                <div style={{ textAlign: "center", fontSize: 11, color: "#6B8A85", marginTop: 10 }}>
                  + {communityMembersOf.members - 10} BO khác...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
