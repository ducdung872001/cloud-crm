import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { SESSIONS } from "../data/sessions";

const TYPE_ICON: Record<string, string> = {
  kickoff: "✦",
  review: "↻",
  change: "⇌",
  uat: "✓",
  internal: "◎",
};

export default function Sessions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const countsByType = SESSIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s.type] = (acc[s.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">🎙 MEETING SESSIONS</div>
          <div className="kicker">History · Project sessions</div>
          <h1 className="title">Lịch sử meeting</h1>
          <p className="desc">Tất cả buổi họp đã ghi âm và xử lý AI, phân loại theo mục đích.</p>
        </div>
        <div className="actions">
          <button type="button" className="btn ai" onClick={() => id && navigate(`/project/${id}/stage/1`)}>
            + Upload audio mới
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">{SESSIONS.length} sessions</div>
          <div style={{ display: "flex", gap: 6 }}>
            {countsByType.kickoff ? <span className="tag tag-ai">{countsByType.kickoff} Kickoff</span> : null}
            {countsByType.review ? <span className="tag tag-info">{countsByType.review} Review</span> : null}
            {countsByType.change ? <span className="tag tag-warn">{countsByType.change} Change</span> : null}
          </div>
        </div>
        <div className="session-list">
          {SESSIONS.map((s) => (
            <div
              key={s.id}
              className="session-item"
              onClick={() => {
                if (s.type === "change" && id) navigate(`/project/${id}/changes`);
                else if (s.type === "review" && id) navigate(`/project/${id}/stage/2`);
                else showToast("info", s.title, s.date);
              }}
            >
              <div className={`sess-ico ${s.type}`}>{TYPE_ICON[s.type]}</div>
              <div className="sess-meta">
                <div className="sess-title">{s.title}</div>
                <div className="sess-sub">
                  {s.date} · {s.duration} · {s.attendees}
                </div>
                <div className="sess-tags">
                  {s.tags.map((t, i) => (
                    <span key={i} className={`tag tag-${t.variant}`}>
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
              <button type="button" className="btn sm">
                {s.actionLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
