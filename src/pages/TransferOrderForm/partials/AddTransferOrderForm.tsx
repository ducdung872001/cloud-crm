import React, { Fragment, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "components/icon";
import Button from "components/button/button";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { showToast } from "utils/common";
import InventoryService from "services/InventoryService";
import ChooseProduct from "./ChooseProduct/ChooseProduct";
import "./AddTransferOrderForm.scss";

interface ITransferProduct {
  id: number;
  inventoryId: number;
  productAvatar: string;
  productName: string;
  inventoryName: string;
  unitName: string;
  quanlityBefor: number;
  quanlityAffter: number | string;
  reason: string;
}

export default function AddTransferOrderForm(props) {
  const { onShow, onHide, id } = props;
  const navigate = useNavigate();

  const [lstProducts, setLstProducts] = useState<ITransferProduct[]>([]);
  const [lstBatchNoProduct, setLstBatchNoProduct] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [dataInventoryOrg, setDataInventoryOrg] = useState(null);
  const [dataInventoryArrive, setDataInventoryArrive] = useState(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ note?: string }>({});

  const isDirty = !!(dataInventoryOrg || dataInventoryArrive || lstProducts.length > 0);
  const isReadyToAdd = !!dataInventoryOrg;
  const totalQty = lstProducts.reduce((s, i) => s + (Number(i.quanlityAffter) || 0), 0);

  // ── Warehouse loaders ─────────────────────────────────────────────────────
  const loadedOptionInventoryOrg = useCallback(async (search, loadedOptions, { page }) => {
    const response = await InventoryService.list({ name: search, page, limit: 10 });
    if (response.code === 0) {
      const data = response.result ?? [];
      const filtered = dataInventoryArrive ? data.filter((i) => i.id !== dataInventoryArrive.value) : data;
      return { options: filtered.map((i) => ({ value: i.id, label: i.name })), hasMore: response.result?.loadMoreAble, additional: { page: page + 1 } };
    }
    return { options: [], hasMore: false };
  }, [dataInventoryArrive]);

  const loadedOptionInventoryArrive = useCallback(async (search, loadedOptions, { page }) => {
    const response = await InventoryService.list({ name: search, page, limit: 10 });
    if (response.code === 0) {
      const data = response.result ?? [];
      const filtered = dataInventoryOrg ? data.filter((i) => i.id !== dataInventoryOrg.value) : data;
      return { options: filtered.map((i) => ({ value: i.id, label: i.name })), hasMore: response.result?.loadMoreAble, additional: { page: page + 1 } };
    }
    return { options: [], hasMore: false };
  }, [dataInventoryOrg]);

  // ── Product handlers ──────────────────────────────────────────────────────
  const handChangeDataProps = (data: any[]) => {
    setLstProducts(data.map((item) => ({
      id: item.productId, inventoryId: item.inventoryId,
      productAvatar: item.productAvatar, productName: item.productName,
      inventoryName: item.inventoryName, unitName: item.unitName,
      reason: "", quanlityBefor: item.quantity, quanlityAffter: "",
    })));
  };

  const handleChangeQty = (val: number | undefined, idx: number) =>
    setLstProducts((prev) => prev.map((item, i) => i === idx ? { ...item, quanlityAffter: val ?? "" } : item));

  const handleChangeReason = (val: string, idx: number) =>
    setLstProducts((prev) => prev.map((item, i) => i === idx ? { ...item, reason: val } : item));

  const handleRemove = (idx: number) =>
    setLstProducts((prev) => prev.filter((_, i) => i !== idx));

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmitForm = async (e) => {
    e.preventDefault();
    if (!dataInventoryOrg)    { showToast("Vui lòng chọn kho nguồn", "warning"); return; }
    if (!dataInventoryArrive) { showToast("Vui lòng chọn kho đích", "warning"); return; }
    if (lstProducts.length === 0) { showToast("Vui lòng thêm ít nhất 1 sản phẩm", "warning"); return; }
    setIsSubmit(true);
    // TODO: gọi API submit
    showToast("Tạo phiếu chuyển kho thành công", "success");
    setIsSubmit(false);
    onHide(true);
  };

  // ── Confirm back ──────────────────────────────────────────────────────────
  const showDialogConfirmBack = () => {
    if (!isDirty) { onHide(false); return; }
    setContentDialog({
      color: "warning", isCentered: true, isLoading: true,
      title: <Fragment>Quay lại</Fragment>,
      message: <Fragment>Phiếu đang có thay đổi chưa lưu. Bạn có chắc muốn <strong>quay lại</strong>?</Fragment>,
      cancelText: "Hủy", cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Quay lại", defaultAction: () => { setShowDialog(false); onHide(false); },
    });
    setShowDialog(true);
  };

  return (
    <div className="page-content tf-page">
      {/* ── Breadcrumb header ──────────────────────────────────────── */}
      <div className="tf-page-header">
        <div className="tf-title-breadcrumb">
          <span className="tf-title-breadcrumb__parent" onClick={showDialogConfirmBack}>
            Phiếu điều chuyển kho
          </span>
          <Icon name="ArrowRight" style={{ width: 14, opacity: 0.4 }} />
          <span className="tf-title-breadcrumb__current">
            {id ? "Chỉnh sửa phiếu" : "Thêm mới phiếu"}
          </span>
        </div>
      </div>

      {/* ── 2-column layout ──────────────────────────────────────────── */}
      <div className="tf-layout">

        {/* ── LEFT: danh sách sản phẩm ─────────────────────────────── */}
        <div className="tf-layout__main">
          <div className="card-box tf-product-card">
            <div className="tf-product-card__header">
              <span className="tf-product-card__title">
                <Icon name="Bill" style={{ width: 16, opacity: 0.7 }} />
                Danh sách hàng hóa cần chuyển kho
                {lstProducts.length > 0 && (
                  <span className="tf-badge">{lstProducts.length}</span>
                )}
              </span>
              <Button
                variant="outline"
                disabled={isSubmit || !isReadyToAdd}
                onClick={(e) => { e.preventDefault(); setShowModalAdd(true); }}
              >
                <Icon name="Plus" style={{ width: 14, marginRight: 5 }} />
                Thêm sản phẩm
              </Button>
            </div>

            <div className={`tf-product-card__body${lstProducts.length > 0 ? " tf-product-card__body--has-data" : ""}`}>
              {lstProducts.length > 0 ? (
              <div className="tf-product-table-wrapper">
                <table className="tf-product-table">
                  <thead>
                    <tr>
                      <th className="tf-col-stt">STT</th>
                      <th>Sản phẩm</th>
                      <th className="tf-col-center">Kho nguồn</th>
                      <th className="tf-col-center">Đơn vị</th>
                      <th className="tf-col-num">Tồn kho</th>
                      <th className="tf-col-num tf-col-input">SL chuyển</th>
                      <th>Ghi chú</th>
                      <th className="tf-col-action"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lstProducts.map((item, idx) => (
                      <tr key={idx} className="tf-product-row">
                        <td className="tf-col-stt">{idx + 1}</td>
                        <td>
                          <div className="tf-product-name">{item.productName}</div>
                        </td>
                        <td className="tf-col-center">
                          <span className="tf-tag">{item.inventoryName}</span>
                        </td>
                        <td className="tf-col-center">{item.unitName || "—"}</td>
                        <td className="tf-col-num">
                          <span className="tf-qty-current">{item.quanlityBefor ?? "—"}</span>
                        </td>
                        <td className="tf-col-num tf-col-input">
                          <NummericInput
                            name={`qty-${idx}`} id={`qty-${idx}`}
                            fill={true} value={item.quanlityAffter} placeholder="0"
                            onValueChange={(e) => handleChangeQty(e.floatValue, idx)}
                            className="tf-qty-input"
                          />
                        </td>
                        <td>
                          <input
                            className="tf-reason-input"
                            placeholder="Ghi chú..."
                            value={item.reason}
                            onChange={(e) => handleChangeReason(e.target.value, idx)}
                          />
                        </td>
                        <td className="tf-col-action">
                          <button type="button" className="tf-remove-btn" onClick={() => handleRemove(idx)} title="Xóa">
                            <Icon name="Times" style={{ width: 14 }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <SystemNotification
                description={
                  <span>
                    {isReadyToAdd
                      ? <>Chưa có sản phẩm nào. Nhấn <strong>Thêm sản phẩm</strong> để bắt đầu.</>
                      : <>Vui lòng chọn <strong>kho nguồn</strong> ở bên phải trước.</>}
                  </span>
                }
                type="no-item"
                titleButton={isReadyToAdd ? "Thêm sản phẩm cần chuyển kho" : undefined}
                action={isReadyToAdd ? () => setShowModalAdd(true) : undefined}
              />
            )}
            </div>{/* end tf-product-card__body */}
          </div>
        </div>

        {/* ── RIGHT: sidebar thông tin phiếu (sticky) ──────────────── */}
        <div className="tf-layout__sidebar">
          <div className="card-box tf-sidebar-card">

            {/* Header */}
            <div className="tf-sidebar-card__header">
              <div className="tf-sidebar-card__icon">
                <Icon name="WarehouseManagement" />
              </div>
              <span className="tf-sidebar-card__title">Thông tin phiếu chuyển kho</span>
            </div>

            <form className="tf-sidebar-card__body" onSubmit={onSubmitForm}>

              {/* Từ kho */}
              <SelectCustom
                id="inventoryOrg" name="inventoryOrg"
                label="Từ kho" fill={true} options={[]} required={true}
                value={dataInventoryOrg}
                onChange={(e) => setDataInventoryOrg(e)}
                isAsyncPaginate={true}
                loadOptionsPaginate={loadedOptionInventoryOrg}
                placeholder="Chọn kho nguồn"
                additional={{ page: 1 }}
              />

              {/* Arrow indicator */}
              <div className="tf-sidebar-arrow">
                <Icon name="ArrowSmallUp" style={{ width: 18, opacity: 0.4, transform: "rotate(180deg)" }} />
                <span className="tf-sidebar-arrow__label">Chuyển đến</span>
                <Icon name="ArrowSmallUp" style={{ width: 18, opacity: 0.4, transform: "rotate(180deg)" }} />
              </div>

              {/* Đến kho */}
              <SelectCustom
                id="inventoryArrive" name="inventoryArrive"
                label="Đến kho" fill={true} options={[]} required={true}
                value={dataInventoryArrive}
                onChange={(e) => setDataInventoryArrive(e)}
                isAsyncPaginate={true}
                loadOptionsPaginate={loadedOptionInventoryArrive}
                placeholder="Chọn kho đích"
                additional={{ page: 1 }}
                disabled={!dataInventoryOrg}
              />

              {/* Summary */}
              <div className="tf-sidebar-summary">
                <div className="tf-sidebar-summary__row">
                  <span className="tf-sidebar-summary__label">Số loại SP</span>
                  <span className="tf-sidebar-summary__value">{lstProducts.length} loại</span>
                </div>
                <div className="tf-sidebar-summary__row tf-sidebar-summary__row--total">
                  <span className="tf-sidebar-summary__label">Tổng SL chuyển</span>
                  <span className="tf-sidebar-summary__value tf-sidebar-summary__value--hl">
                    {totalQty.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="tf-sidebar-note">
                <label className="tf-sidebar-note__label">Ghi chú</label>
                <TextArea
                  name="note" value={formData?.note} fillColor={true}
                  placeholder="Nhập nội dung điều chuyển kho..."
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>

            </form>

            {/* Actions */}
            <div className="tf-sidebar-card__actions">
              <Button
                type="submit"
                color="primary"
                disabled={lstProducts.length === 0 || isSubmit || !dataInventoryOrg || !dataInventoryArrive}
                onClick={onSubmitForm}
              >
                {id ? "Cập nhật phiếu" : "Tạo phiếu chuyển kho"}
                {isSubmit && <Icon name="Loading" />}
              </Button>
              <Button type="button" variant="outline" disabled={isSubmit} onClick={showDialogConfirmBack}>
                Quay lại
              </Button>
            </div>

          </div>
        </div>

      </div>

      <ChooseProduct
        onShow={showModalAdd}
        onHide={() => setShowModalAdd(false)}
        lstBatchNoProduct={lstBatchNoProduct}
        inventory={dataInventoryOrg}
        takeData={(data) => handChangeDataProps(data)}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}