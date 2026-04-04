import React from "react";
import { useTranslation } from "react-i18next";
import "./index.scss";

interface ReturnTopbarProps {
  onCreateClick: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

const ReturnTopbar: React.FC<ReturnTopbarProps> = ({ onCreateClick, onExport, isExporting }) => {
  const { t } = useTranslation();

  return (
    <div className="return-topbar">
      <div className="return-topbar__left">
        <div className="return-topbar__titles">
          <div className="return-topbar__title">{t("pageReturnProduct.title")}</div>
          <div className="return-topbar__sub">{t("pageReturnProduct.subtitle")}</div>
        </div>
      </div>
      <div className="return-topbar__right">
        <button
          className="btn btn--outline btn--sm"
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? t("common.processing") : `📥 ${t("pageReturnProduct.exportExcel")}`}
        </button>
        <button className="btn btn--lime" onClick={onCreateClick}>
          + {t("pageReturnProduct.createTicket")}
        </button>
      </div>
    </div>
  );
};

export default ReturnTopbar;