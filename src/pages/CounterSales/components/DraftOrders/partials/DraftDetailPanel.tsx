import React from "react";
import { DraftOrder } from "../types";
import DraftItemsTable from "./DraftItemsTable";
import DraftSummary from "./DraftSummary";

type Props = {
  order: DraftOrder | null;
  onDelete: (id: string) => void;
  onContinue?: (draftId: string) => void;
};

const DraftDetailPanel: React.FC<Props> = ({ order, onDelete, onContinue }) => {
  if (!order) {
    return (
      <div className="draft-right">
        <div className="empty-state">
          <div className="ei">🗂️</div>
          <div className="et">Chọn đơn tạm để xem chi tiết</div>
          <div className="ed">
            Chọn một đơn từ danh sách bên trái
            <br />
            để xem chi tiết và tiếp tục xử lý.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="draft-right">
      <div className="draft-right__head">
        <div className="title-wrap">
          <div className="title">
            {order.tenDon} <span className="pill">{order.id}</span>
          </div>
          <div className="sub">
            {order.ngay} · {order.thoiGian}
          </div>
        </div>

        <div className="acts">
          <button className="btn btn--outline btn--sm" onClick={() => onDelete(order.id)}>
            🗑️ Xóa đơn
          </button>
          <button className="btn btn--ink btn--sm" onClick={() => (onContinue ? onContinue(order.id) : undefined)}>
            ⚡ Tiếp tục xử lý
          </button>
        </div>
      </div>

      <div className="draft-right__body">
        <div className="info-grid">
          <div className="info-card">
            <div className="l">👤 Khách hàng</div>
            <div className="v">{order.khachHang}</div>
          </div>
          <div className="info-card">
            <div className="l">🏷️ Nhân viên</div>
            <div className="v">{order.nhanVien}</div>
          </div>
          <div className="info-card">
            <div className="l">📦 Số mặt hàng</div>
            <div className="v">{order.sanPhams.length} mặt hàng</div>
          </div>
        </div>

        <div className="sec-ttl">📋 Danh sách sản phẩm</div>

        <DraftItemsTable items={order.sanPhams} />
        <DraftSummary items={order.sanPhams} />
      </div>
    </div>
  );
};

export default DraftDetailPanel;
