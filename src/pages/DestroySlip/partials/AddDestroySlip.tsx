import React, { Fragment, useCallback, useEffect, useState } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { showToast } from "utils/common";
import InventoryService from "services/InventoryService";
import DestroySlipService from "services/DestroySlipService";
import ChooseProductVariant from "pages/ProductImport/common/ChooseProductVariant/ChooseProductVariant";
import "./AddDestroySlip.scss";

interface IDestroyProduct {
  id: number;
  productId: number;
  productName: string;
  productAvatar: string;
  batchNo: string;
  unitId: number;
  unitName: string;
  reason: string;
  availQty: number;
  offsetQty: number;
  satId: number;
  inventoryId: number;
  inventoryName: string;
}

interface Props {
  id?: number;
  onHide: (reload?: boolean) => void;
}

export default function AddDestroySlip({ id, onHide }: Props) {
  const [lstProducts, setLstProducts] = useState<IDestroyProduct[]>([]);
  const [lstBatchNoProduct, setLstBatchNoProduct] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [dataInventory, setDataInventory] = useState<any>(null);
  const [satId, setSatId] = useState<number>(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const [note, setNote] = useState("");

  const isDirty = !!(dataInventory || lstProducts.length > 0);
  const isReadyToAdd = !!dataInventory;
  const totalQty = lstProducts.reduce((s, i) => s + (Number(i.availQty) || 0), 0);

  // ── Load temp phiếu khi chọn kho ─────────────────────────────────────────
  const loadTempSlip = async (inventoryId: number) => {
    setIsLoading(true);
    const response = await DestroySlipService.temp(inventoryId);
    if (response.code === 0) {
      const result = response.result;
      setSatId(result.satId);
      const items = (result.stockAdjustDetails ?? []).map((item: any) => ({
        ...item,
        inventoryName: result?.stockAdjust?.inventoryName ?? dataInventory?.label ?? "",
      }));
      setLstProducts(items);
    } else {
      showToast("Có lỗi xảy ra khi tải dữ liệu kho", "error");
    }
    setIsLoading(false);
  };

  // ── Load phiếu xem/sửa ───────────────────────────────────────────────────
  useEffect(() => {
    if (id) {
      (async () => {
        setIsLoading(true);
        const response = await DestroySlipService.view(id);
        if (response.code === 0) {
          const result = response.result;
          if (result?.stockAdjust) {
            setDataInventory({ value: result.stockAdjust.inventoryId, label: result.stockAdjust.inventoryName });
            setSatId(result.stockAdjust.id);
            setLstProducts(result.stockAdjustDetails ?? []);
          }
        }
        setIsLoading(false);
      })();
    }
  }, [id]);

  useEffect(() => {
    setLstBatchNoProduct(lstProducts.map((i) => i.batchNo));
  }, [lstProducts]);

  const [listInventory, setListInventory] = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // ── Warehouse loader — chỉ gọi khi mở dropdown, không auto-load ──────────
  const getListInventory = useCallback(async () => {
    if (listInventory.length > 0) return;
    setIsLoadingInventory(true);
    const response = await InventoryService.list({ page: 1, limit: 100 });
    if (response.code === 0) {
      const data = Array.isArray(response.result)
        ? response.result
        : Array.isArray(response.result?.items) ? response.result.items : [];
      setListInventory(data.map((i: any) => ({
        value: i.id, label: i.name,
        address: i.address ?? "", branchName: i.branchName ?? "",
      })));
    } else {
      showToast("Không lấy được danh sách kho", "error");
    }
    setIsLoadingInventory(false);
  }, [listInventory.length]);

  const handleChangeInventory = (e: any) => {
    setDataInventory(e);
    setLstProducts([]);
    if (e?.value) loadTempSlip(e.value);
  };

  // ── Product handlers ──────────────────────────────────────────────────────
  const handleChangeQty = (val: number, idx: number) => {
    setLstProducts((prev) => prev.map((item, i) => i === idx ? { ...item, availQty: val ?? 0 } : item));
  };

  const handleChangeReason = (val: string, idx: number) => {
    setLstProducts((prev) => prev.map((item, i) => i === idx ? { ...item, reason: val } : item));
  };

  const handleRemove = async (itemId: number) => {
    const response = await DestroySlipService.deletePro(itemId);
    if (response.code === 0) {
      showToast("Đã xóa sản phẩm", "success");
      if (dataInventory?.value) loadTempSlip(dataInventory.value);
    } else {
      showToast("Xóa thất bại", "error");
    }
  };

  const handChangeDataProps = (data: any[]) => {
    if (!data?.length) return;
    const converted: IDestroyProduct[] = data.map((item) => ({
      id: item.id ?? 0,
      productId: item.productId,
      productName: item.productName ?? "",
      productAvatar: item.productAvatar ?? "",
      batchNo: item.batchNo ?? "",
      unitId: item.unitId ?? null,
      unitName: item.unitName ?? item.unit?.name ?? "",
      reason: "",
      availQty: item.quantity ?? item.availQty ?? 0,
      offsetQty: -(item.quantity ?? item.availQty ?? 0),
      satId: satId ?? null,
      inventoryId: item.inventoryId ?? dataInventory?.value ?? null,
      inventoryName: item.inventoryName ?? dataInventory?.label ?? "",
    }));
    setLstProducts((prev) => {
      const existKeys = new Set(prev.map((p) => `${p.productId}_${p.batchNo}`));
      return [...prev, ...converted.filter((c) => !existKeys.has(`${c.productId}_${c.batchNo}`))];
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataInventory) { showToast("Vui lòng chọn kho xuất hủy", "warning"); return; }
    if (lstProducts.length === 0) { showToast("Vui lòng thêm ít nhất 1 sản phẩm", "warning"); return; }

    setIsSubmit(true);

    // Update từng dòng trước
    await Promise.all(lstProducts.map((item) => DestroySlipService.addUpdatePro(item)));

    // Tạo phiếu chính thức
    const response = await DestroySlipService.create({
      id: satId,
      inventoryId: dataInventory.value,
    });

    if (response.code === 0) {
      showToast("Tạo phiếu xuất hủy thành công", "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra", "error");
    }
    setIsSubmit(false);
  };

  // ── Confirm back ──────────────────────────────────────────────────────────
  const showConfirmBack = () => {
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
    <div className="page-content ds-page">

      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <div className="ds-header">
        <div className="ds-breadcrumb">
          <span className="ds-breadcrumb__parent" onClick={showConfirmBack}>Quản lý kho</span>
          <Icon name="ArrowRight" style={{ width: 14, opacity: 0.4 }} />
          <span className="ds-breadcrumb__current">{id ? "Chỉnh sửa phiếu xuất hủy" : "Tạo phiếu xuất hủy"}</span>
        </div>
      </div>

      {/* ── 2-column layout ──────────────────────────────────────────── */}
      <div className="ds-layout">

        {/* ── LEFT: bảng sản phẩm ──────────────────────────────────── */}
        <div className="ds-layout__main">
          <div className="card-box ds-product-card">
            <div className="ds-product-card__header">
              <span className="ds-product-card__title">
                <Icon name="Trash" style={{ width: 15, opacity: 0.7 }} />
                Danh sách hàng hóa xuất hủy
                {lstProducts.length > 0 && (
                  <span className="ds-badge">{lstProducts.length}</span>
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

            <div className={`ds-product-card__body${lstProducts.length > 0 ? " ds-product-card__body--has-data" : ""}`}>
              {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                  <Icon name="Loading" style={{ width: 32 }} />
                </div>
              ) : lstProducts.length > 0 ? (
                <div className="ds-table-wrapper">
                  <table className="ds-table">
                    <thead>
                      <tr>
                        <th className="ds-col-stt">STT</th>
                        <th>Sản phẩm</th>
                        <th className="ds-col-center">Kho</th>
                        <th className="ds-col-center">Đơn vị</th>
                        <th className="ds-col-num">SL tồn</th>
                        <th className="ds-col-num ds-col-input">SL hủy</th>
                        <th>Lý do hủy</th>
                        <th className="ds-col-action"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lstProducts.map((item, idx) => (
                        <tr key={idx}>
                          <td className="ds-col-stt">{idx + 1}</td>
                          <td>
                            <div className="ds-product-name">{item.productName}</div>
                            {item.batchNo && <div className="ds-batch-no">Lô: {item.batchNo}</div>}
                          </td>
                          <td className="ds-col-center">
                            <span className="ds-tag">{item.inventoryName}</span>
                          </td>
                          <td className="ds-col-center">{item.unitName || "—"}</td>
                          <td className="ds-col-num">
                            <span className="ds-qty-stock">{item.availQty ?? "—"}</span>
                          </td>
                          <td className="ds-col-num ds-col-input">
                            <NummericInput
                              name={`qty-${idx}`} id={`qty-${idx}`}
                              fill={true} value={item.availQty} placeholder="0"
                              onValueChange={(e) => handleChangeQty(e.floatValue, idx)}
                              className="ds-qty-input"
                            />
                          </td>
                          <td>
                            <input
                              className="ds-reason-input"
                              placeholder="Nhập lý do hủy..."
                              value={item.reason}
                              onChange={(e) => handleChangeReason(e.target.value, idx)}
                            />
                          </td>
                          <td className="ds-col-action">
                            <button type="button" className="ds-remove-btn" onClick={() => handleRemove(item.id)} title="Xóa">
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
                        : <>Vui lòng chọn <strong>kho xuất hủy</strong> ở bên phải trước.</>}
                    </span>
                  }
                  type="no-item"
                  titleButton={isReadyToAdd ? "Thêm sản phẩm cần hủy" : undefined}
                  action={isReadyToAdd ? () => setShowModalAdd(true) : undefined}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: sidebar thông tin phiếu ───────────────────────── */}
        <div className="ds-layout__sidebar">
          <div className="card-box ds-sidebar">

            <div className="ds-sidebar__header">
              <div className="ds-sidebar__icon">
                <Icon name="Trash" />
              </div>
              <span className="ds-sidebar__title">Thông tin phiếu xuất hủy</span>
            </div>

            <form className="ds-sidebar__body" onSubmit={handleSubmit}>

              {/* Kho xuất hủy */}
              <SelectCustom
                id="inventory" name="inventory"
                label="Kho xuất hủy" fill={true}
                options={listInventory}
                required={true}
                value={dataInventory?.value ?? null}
                onMenuOpen={getListInventory}
                onChange={handleChangeInventory}
                isLoading={isLoadingInventory}
                placeholder="Chọn kho xuất hủy"
              />

              {/* Địa chỉ / Chi nhánh */}
              {dataInventory?.address && (
                <div className="ds-info-row">
                  <span className="ds-info-row__label">Địa chỉ</span>
                  <span className="ds-info-row__value">{dataInventory.address}</span>
                </div>
              )}

              {/* Summary */}
              <div className="ds-summary">
                <div className="ds-summary__row">
                  <span className="ds-summary__label">Số loại SP</span>
                  <span className="ds-summary__value">{lstProducts.length} loại</span>
                </div>
                <div className="ds-summary__row ds-summary__row--total">
                  <span className="ds-summary__label">Tổng SL xuất hủy</span>
                  <span className="ds-summary__value ds-summary__value--hl">
                    {totalQty.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="ds-note">
                <label className="ds-note__label">Ghi chú</label>
                <TextArea
                  name="note" value={note} fillColor={true}
                  placeholder="Nhập lý do xuất hủy hàng hóa..."
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

            </form>

            {/* Actions */}
            <div className="ds-sidebar__actions">
              <Button
                type="submit" color="primary"
                disabled={lstProducts.length === 0 || isSubmit || !dataInventory}
                onClick={handleSubmit}
              >
                {id ? "Cập nhật phiếu" : "Tạo phiếu xuất hủy"}
                {isSubmit && <Icon name="Loading" />}
              </Button>
              <Button type="button" variant="outline" disabled={isSubmit} onClick={showConfirmBack}>
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
        inventory={dataInventory}
        title="Chọn sản phẩm xuất hủy"
        takeData={handChangeDataProps}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}