import React, { memo } from "react";
import { DraftOrder, fmtVnd, sumTotal } from "../types";

type Props = {
  order: DraftOrder;
  active: boolean;
  onClick: () => void;
};

function DraftListItem({ order, active, onClick }: Props) {
  const total = sumTotal(order.sanPhams);

  return (
    <div className={`draft-item${active ? " active" : ""}`} onClick={onClick}>
      <div className="row1">
        <div className="id">{order.id}</div>
        <div className="time">
          {order.thoiGian} — {order.ngay}
        </div>
      </div>

      <div className="kh">👤 {order.khachHang}</div>
      <div className="nv">🏷️ {order.nhanVien}</div>

      <div className="row3">
        <div className="chip">📦 {order.sanPhams.length} sản phẩm</div>
        <div className="total">{fmtVnd(total)}</div>
      </div>
    </div>
  );
}

export default memo(DraftListItem);
