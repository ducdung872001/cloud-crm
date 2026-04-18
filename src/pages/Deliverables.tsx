import { useApp } from "../context/AppContext";
import { DELIVERABLES } from "../data/sessions";

export default function Deliverables() {
  const { showToast } = useApp();

  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">📦 DELIVERABLES</div>
          <div className="kicker">Project artifacts</div>
          <h1 className="title">Sản phẩm bàn giao</h1>
          <p className="desc">Tổng hợp tất cả artifact sinh ra xuyên suốt dự án — từ meeting note tới source code cuối cùng.</p>
        </div>
      </div>

      <div className="card">
        <div className="file-list">
          {DELIVERABLES.map((d) => (
            <div key={d.id} className="file-item" onClick={() => showToast("info", `Mở ${d.name}`, d.meta)}>
              <div className={`file-ico ${d.icoClass}`}>{d.icoLabel}</div>
              <div>
                <div className="file-name">{d.name}</div>
                <div className="file-sub">{d.meta}</div>
              </div>
              <span className={`tag tag-${d.tag.variant}`}>{d.tag.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
