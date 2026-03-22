import React from "react";
import { DraftProduct, fmtVnd, sumQty, sumTotal } from "../types";

type Props = {
  items: DraftProduct[];
};

const DraftSummary: React.FC<Props> = ({ items }) => {
  const total = sumTotal(items);
  const qty = sumQty(items);

  return (
    <div className="sum-box">
      <div className="sum-r">
        <span>Tạm tính ({qty} sản phẩm)</span>
        <span>{fmtVnd(total)}</span>
      </div>
      <div className="sum-r">
        <span>Giảm giá voucher</span>
        {/* <span className="minus">- 0 đ</span> */}
        <span className="minus">0 đ</span>
      </div>
      <div className="sum-r">
        <span>Điểm tích lũy dùng</span>
        {/* <span className="minus">- 0 đ</span> */}
        <span className="minus">0 đ</span>
      </div>
      <div className="sum-r tot">
        <span>TỔNG THANH TOÁN</span>
        <span className="sv">{fmtVnd(total)}</span>
      </div>
    </div>
  );
};

export default DraftSummary;
