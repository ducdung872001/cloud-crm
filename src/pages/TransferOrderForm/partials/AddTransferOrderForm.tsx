import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
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
import ChooseProductVariant from "pages/ProductImport/common/ChooseProductVariant/ChooseProductVariant";
import "./AddTransferOrderForm.scss";

interface ITransferProduct {
  detailId?: number;
  productId: number;
  variantId?: number;
  unitId?: number;
  inventoryId: number;
  productAvatar: string;
  productName: string;
  inventoryName: string;
  unitName: string;
  quanlityBefor: number;
  quanlityAffter: number | string;
  note: string;
}

export default function AddTransferOrderForm(props) {
  const { onHide, id } = props;

  const [transferId, setTransferId]               = useState<number | null>(id ?? null);
  const [lstProducts, setLstProducts]             = useState<ITransferProduct[]>([]);
  const [lstBatchNoProduct, setLstBatchNoProduct] = useState<string[]>([]);
  const [showDialog, setShowDialog]               = useState(false);
  const [contentDialog, setContentDialog]         = useState<IContentDialog>(null);
  const [showModalAdd, setShowModalAdd]           = useState(false);
  const [dataInventoryOrg, setDataInventoryOrg]       = useState<any>(null);
  const [dataInventoryArrive, setDataInventoryArrive] = useState<any>(null);
  const [isSubmit, setIsSubmit]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote]           = useState("");
  const [listInventory, setListInventory]           = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  const isDirty      = !!(dataInventoryOrg || dataInventoryArrive || lstProducts.length > 0);
  const isReadyToAdd = !!dataInventoryOrg;
  const totalQty     = lstProducts.reduce((s, i) => s + (Number(i.quanlityAffter) || 0), 0);
  const optionsOrg    = listInventory.filter(i => i.value !== dataInventoryArrive?.value);
  const optionsArrive = listInventory.filter(i => i.value !== dataInventoryOrg?.value);

  // Load kho 1 lần khi mở dropdown
  const getListInventory = useCallback(async () => {
    if (listInventory.length > 0) return;
    setIsLoadingInventory(true);
    const res = await InventoryService.list({ page: 1, limit: 100 });
    if (res.code === 0) {
      const data = Array.isArray(res.result)
        ? res.result
        : Array.isArray(res.result?.items) ? res.result.items : [];
      setListInventory(data.map((i: any) => ({ value: i.id, label: i.name })));
    } else {
      showToast("Không lấy được danh sách kho", "error");
    }
    setIsLoadingInventory(false);
  }, [listInventory.length]);

  // Load phiếu khi edit
  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsLoading(true);
      try {
        const headerRes = await InventoryService.stockTransferGet(id);
        if (headerRes.code !== 0) { showToast("Không tải được phiếu", "error"); return; }
        const t = headerRes.result;
        setTransferId(t.id);
        setNote(t.note ?? "");
        const invRes = await InventoryService.list({ page: 1, limit: 100 });
        if (invRes.code === 0) {
          const data = Array.isArray(invRes.result) ? invRes.result
            : Array.isArray(invRes.result?.items) ? invRes.result.items : [];
          const opts = data.map((i: any) => ({ value: i.id, label: i.name }));
          setListInventory(opts);
          const orgOpt = opts.find((o: any) => o.value === t.fromWarehouseId);
          const arrOpt = opts.find((o: any) => o.value === t.toWarehouseId);
          if (orgOpt) setDataInventoryOrg(orgOpt);
          if (arrOpt) setDataInventoryArrive(arrOpt);
        }
        const detailRes = await InventoryService.stockTransferDetailList({ transferId: t.id, limit: 200 });
        if (detailRes.code === 0) {
          setLstProducts((detailRes.result?.items ?? []).map((d: any) => ({
            detailId: d.id, productId: d.productId, variantId: d.variantId, unitId: d.unitId,
            inventoryId: t.fromWarehouseId,
            productAvatar: d.productAvatar ?? "", productName: d.productName ?? "",
            inventoryName: d.inventoryName ?? "", unitName: d.unitName ?? "",
            quanlityBefor: d.availQty ?? 0, quanlityAffter: d.quantity, note: d.note ?? "",
          })));
        }
      } finally { setIsLoading(false); }
    })();
  }, [id]);

  useEffect(() => {
    setLstBatchNoProduct(lstProducts.map(p => String(p.productId)));
  }, [lstProducts]);

  // Product handlers
  const handChangeDataProps = (data: any[]) => {
    const newItems: ITransferProduct[] = data.map(item => ({
      detailId: undefined, productId: item.productId, variantId: item.variantId, unitId: item.unitId,
      inventoryId: item.inventoryId ?? dataInventoryOrg?.value,
      productAvatar: item.productAvatar ?? "", productName: item.productName ?? "",
      inventoryName: item.inventoryName ?? dataInventoryOrg?.label ?? "",
      unitName: item.unitName ?? "", quanlityBefor: item.quantity ?? 0, quanlityAffter: "", note: "",
    }));
    setLstProducts(prev => {
      const keys = new Set(prev.map(p => `${p.productId}_${p.variantId ?? 0}`));
      return [...prev, ...newItems.filter(n => !keys.has(`${n.productId}_${n.variantId ?? 0}`))];
    });
  };

  const handleChangeQty = (val: number | undefined, idx: number) =>
    setLstProducts(prev => prev.map((item, i) => i === idx ? { ...item, quanlityAffter: val ?? "" } : item));

  const handleChangeNote = (val: string, idx: number) =>
    setLstProducts(prev => prev.map((item, i) => i === idx ? { ...item, note: val } : item));

  const handleRemove = async (idx: number) => {
    const item = lstProducts[idx];
    if (item.detailId) {
      const res = await InventoryService.stockTransferDetailDelete(item.detailId);
      if (res.code !== 0) { showToast("Xóa sản phẩm thất bại", "error"); return; }
    }
    setLstProducts(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit
  const onSubmitForm = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!dataInventoryOrg)    { showToast("Vui lòng chọn kho nguồn", "warning"); return; }
    if (!dataInventoryArrive) { showToast("Vui lòng chọn kho đích",  "warning"); return; }
    if (lstProducts.length === 0) { showToast("Vui lòng thêm ít nhất 1 sản phẩm", "warning"); return; }
    if (lstProducts.some(p => !p.quanlityAffter || Number(p.quanlityAffter) <= 0)) {
      showToast("Vui lòng nhập số lượng chuyển cho tất cả sản phẩm", "warning"); return;
    }
    setIsSubmit(true);
    try {
      const headerRes = await InventoryService.stockTransferUpdate({
        id: transferId ?? undefined,
        fromWarehouseId: dataInventoryOrg.value,
        toWarehouseId:   dataInventoryArrive.value,
        note, status: 0,
      });
      if (headerRes.code !== 0) { showToast(headerRes.message ?? "Tạo phiếu thất bại", "error"); return; }
      const savedId: number = headerRes.result.id;
      setTransferId(savedId);
      const results = await Promise.all(lstProducts.map(item =>
        InventoryService.stockTransferDetailUpdate({
          id: item.detailId ?? undefined, transferId: savedId,
          productId: item.productId, variantId: item.variantId, unitId: item.unitId,
          quantity: Number(item.quanlityAffter), note: item.note,
        })
      ));
      const failed = results.filter(r => r.code !== 0);
      if (failed.length > 0) {
        showToast(`${failed.length} sản phẩm lưu thất bại`, "warning");
      } else {
        showToast(id ? "Cập nhật phiếu thành công" : "Tạo phiếu chuyển kho thành công", "success");
        onHide(true);
      }
    } catch { showToast("Có lỗi xảy ra. Vui lòng thử lại", "error"); }
    finally  { setIsSubmit(false); }
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
    <div className="tf-page">
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

            {/* Header — block độc lập, không nằm trong flex container */}
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

            {/* Content area */}
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
                              value={item.note}
                              onChange={(e) => handleChangeNote(e.target.value, idx)}
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
            </div>

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
                label="Từ kho" fill={true}
                options={optionsOrg}
                required={true}
                value={dataInventoryOrg?.value ?? null}
                onMenuOpen={getListInventory}
                onChange={(e) => setDataInventoryOrg(e)}
                isLoading={isLoadingInventory}
                placeholder="Chọn kho nguồn"
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
                label="Đến kho" fill={true}
                options={optionsArrive}
                required={true}
                value={dataInventoryArrive?.value ?? null}
                onMenuOpen={getListInventory}
                onChange={(e) => setDataInventoryArrive(e)}
                isLoading={isLoadingInventory}
                placeholder="Chọn kho đích"
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
                  name="note" value={note} fillColor={true}
                  placeholder="Nhập nội dung điều chuyển kho..."
                  onChange={(e) => setNote(e.target.value)}
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

      <ChooseProductVariant
        onShow={showModalAdd}
        onHide={() => setShowModalAdd(false)}
        excludeKeys={lstBatchNoProduct}
        inventory={dataInventoryOrg}
        title="Chọn sản phẩm cần chuyển kho"
        takeData={(data) => handChangeDataProps(data)}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}