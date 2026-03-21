import React from "react";
import "./index.scss";

interface ReturnTopbarProps {
  onCreateClick: () => void;
}

const ReturnTopbar: React.FC<ReturnTopbarProps> = ({ onCreateClick }) => {
  return (
    <div className="return-topbar">
      <div className="return-topbar__left">
        <div className="return-topbar__titles">
          <div className="return-topbar__title">Đổi / Trả hàng</div>
          <div className="return-topbar__sub">Quản lý phiếu trả hàng và đổi hàng từ khách</div>
        </div>
      </div>
      <div className="return-topbar__right">
        <button className="btn btn--outline btn--sm">📥 Xuất Excel</button>
        <button className="btn btn--lime" onClick={onCreateClick}>
          + Tạo phiếu
        </button>
      </div>
    </div>
  );
};

export default ReturnTopbar;
