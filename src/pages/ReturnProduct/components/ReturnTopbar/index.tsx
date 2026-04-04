import React from "react";
import "./index.scss";

interface ReturnTopbarProps {
  onCreateClick: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

const ReturnTopbar: React.FC<ReturnTopbarProps> = ({ onCreateClick, onExport, isExporting }) => {
  return (
    <div className="return-topbar">
      <div className="return-topbar__left">
        <div className="return-topbar__titles">
          <div className="return-topbar__title">Đổi / Trả hàng</div>
          <div className="return-topbar__sub">Quản lý phiếu trả hàng và đổi hàng từ khách</div>
        </div>
      </div>
      <div className="return-topbar__right">
        <button
          className="btn btn--outline btn--sm"
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? "Đang xuất..." : "📥 Xuất Excel"}
        </button>
        <button className="btn btn--lime" onClick={onCreateClick}>
          + Tạo phiếu
        </button>
      </div>
    </div>
  );
};

export default ReturnTopbar;