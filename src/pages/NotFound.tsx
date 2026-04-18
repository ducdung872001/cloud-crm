import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">404</div>
          <h1 className="title">Không tìm thấy trang</h1>
          <p className="desc">Đường dẫn không tồn tại trong Reborn Forge.</p>
        </div>
      </div>
      <div className="empty">
        <div className="empty-ico">?</div>
        <div className="empty-title">Trang không tồn tại</div>
        <div className="empty-desc">
          <Link to="/hub" className="btn primary" style={{ marginTop: 12 }}>
            ← Về Projects Hub
          </Link>
        </div>
      </div>
    </section>
  );
}
