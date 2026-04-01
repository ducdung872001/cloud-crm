import React from "react";
import Icon from "components/icon";
import Loading from "components/loading";
import Badge from "components/badge/badge";
import { IMaterialImportListItem, IMaterialImportDetail } from "@/model/material/MaterialImportModel";
import "./ImportDetailPanel.scss";

interface Props {
  item: IMaterialImportListItem;
  detail: IMaterialImportDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const statusBadge = (status: number) => {
  if (status === 1) return <Badge text="Chờ xác nhận" variant="warning" />;
  if (status === 2) return <Badge text="Hoàn thành"   variant="success" />;
  if (status === 3) return <Badge text="Đã hủy"       variant="secondary" />;
  return null;
};

export default function ImportDetailPanel({ item, detail, isLoading, onClose, onConfirm, onCancel }: Props) {
  return (
    <div className="import-detail-panel">
      {/* Header */}
      <div className="import-detail-panel__header">
        <button type="button" className="import-detail-panel__close" onClick={onClose}>✕</button>
        <div className="import-detail-panel__code">{item.code}</div>
        <div className="import-detail-panel__meta">
          {statusBadge(item.status)}
        </div>
      </div>

      {/* Quick stats */}
      <div className="import-detail-panel__qs">
        <div className="import-detail-panel__qs-i">
          <div className="import-detail-panel__qs-v">{item.warehouseName ?? "—"}</div>
          <div className="import-detail-panel__qs-l">Kho nhập</div>
        </div>
        <div className="import-detail-panel__qs-i">
          <div className="import-detail-panel__qs-v">{item.importDate ?? "—"}</div>
          <div className="import-detail-panel__qs-l">Ngày nhập</div>
        </div>
        <div className="import-detail-panel__qs-i">
          <div className="import-detail-panel__qs-v" style={{ color: "var(--primary-color)" }}>
            {item.lineCount ?? 0} NVL
          </div>
          <div className="import-detail-panel__qs-l">Số dòng</div>
        </div>
      </div>

      {/* Supplier & Note */}
      {item.supplierName && (
        <div className="import-detail-panel__info-row">
          <Icon name="Truck" />
          <span>{item.supplierName}</span>
        </div>
      )}

      {/* Total */}
      <div className="import-detail-panel__total">
        <span>Tổng tiền</span>
        <strong>{(item.totalAmount ?? 0).toLocaleString("vi")} đ</strong>
      </div>

      {/* Detail lines */}
      <div className="import-detail-panel__section-title">Danh sách nguyên vật liệu</div>

      {isLoading ? (
        <Loading />
      ) : detail?.details && detail.details.length > 0 ? (
        <div className="import-detail-panel__lines">
          {detail.details.map((line, i) => (
            <div key={line.id ?? i} className="idp-line">
              <div className="idp-line__idx">{i + 1}</div>
              <div className="idp-line__body">
                <div className="idp-line__name">{line.materialName}</div>
                <div className="idp-line__meta">
                  <span>{line.quantity} {line.unitName}</span>
                  <span>× {(line.price ?? 0).toLocaleString("vi")} đ</span>
                </div>
              </div>
              <div className="idp-line__amount">
                {(line.amount ?? 0).toLocaleString("vi")} đ
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="import-detail-panel__empty">Chưa có chi tiết phiếu nhập</div>
      )}

      {/* Note */}
      {detail?.note && (
        <div className="import-detail-panel__note">
          <Icon name="Info" />
          <span>{detail.note}</span>
        </div>
      )}

      {/* Actions */}
      {item.status === 1 && (
        <div className="import-detail-panel__actions">
          <button className="idp-btn idp-btn--primary" type="button" onClick={onConfirm}>
            <Icon name="CheckCircle" /> Xác nhận nhập tồn
          </button>
          <button className="idp-btn idp-btn--danger" type="button" onClick={onCancel}>
            <Icon name="XCircle" /> Hủy phiếu
          </button>
        </div>
      )}
    </div>
  );
}
