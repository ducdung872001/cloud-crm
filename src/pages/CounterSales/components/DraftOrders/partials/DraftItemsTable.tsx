import React from "react";
import { DraftProduct, fmtVnd } from "../types";

type Props = {
  items: DraftProduct[];
};

const DraftItemsTable: React.FC<Props> = ({ items }) => {
  return (
    <div className="sp-wrap">
      <div className="sp-th">
        <div>#</div>
        <div>Sản phẩm</div>
        <div className="tr">Đơn giá</div>
        <div className="tc">SL</div>
        <div className="tr">Thành tiền</div>
      </div>

      {items.map((s, i) => (
        <div className="sp-tr" key={`${s.maSP}-${i}`}>
          <div className="sp-n">{i + 1}</div>
          <div className="sp-nm">
            <div className="n">{s.ten}</div>
            <div className="c">{s.maSP}</div>
          </div>
          <div className="sp-dg tr">{fmtVnd(s.donGia)}</div>
          <div className="sp-sl">{s.sl}</div>
          <div className="sp-tt tr">{fmtVnd(s.sl * s.donGia)}</div>
        </div>
      ))}

      {items.length === 0 && <div className="sp-empty">Chưa có sản phẩm trong đơn tạm.</div>}
    </div>
  );
};

export default DraftItemsTable;
