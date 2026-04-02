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
  variantId?: number | null;
  productName: string;
  productSku?: string;
  variantSku?: string;
  productAvatar: string;
  batchNo: string;
  unitId: number;
  unitName: string;
  reason: string;
  availQty: number;
  offsetQty: number;
  prevQuantity?: number;
  afterQuantity?: number;
  unitCost?: number;
  lineCost?: number;
  lineCreatedTime?: string;
  satId: number;
  inventoryId: number;
  inventoryName: string;
  originalAvailQty?: number;
}

interface Props {
  id?: number;
  isViewMode?: boolean;
  onHide: (reload?: boolean) => void;
}

export default function AddDestroySlip({ id, isViewMode = false, onHide }: Props) {
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
  const [slipStatus, setSlipStatus] = useState<number | null>(null);
  const isReadOnly = isViewMode;
  const isOk = (response: any) => response?.code === 0 || response?.status === 1 || response?.success === true;

  const isDirty = !isReadOnly && !!(dataInventory || lstProducts.length > 0);
  const isReadyToAdd = !!dataInventory;
  const totalQty = lstProducts.reduce((s, i) => s + Math.abs(Number(i.offsetQty) || 0), 0);

  // ── Load temp phiếu khi chọn kho ─────────────────────────────────────────
  const loadTempSlip = async (inventoryId: number) => {
    setIsLoading(true);
    const response = await DestroySlipService.temp(inventoryId);
    if (isOk(response)) {
      const result = response.result ?? response.data ?? {};
      setNote(result?.stockAdjust?.note ?? "");
      setSatId(result.satId);
      // Chỉ khởi tạo phiếu tạm để lấy satId, không tự đổ sản phẩm vào form.
      setLstProducts([]);
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
        const [headerResponse, detailResponse] = isReadOnly
          ? await Promise.all([InventoryService.destroyDetail(id), Promise.resolve(null)])
          : await Promise.all([Promise.resolve(null), DestroySlipService.view(id)]);

        const headerResult = headerResponse?.result ?? headerResponse?.data ?? null;
        let detailResult = detailResponse?.result ?? detailResponse?.data ?? null;

        if ((isReadOnly ? isOk(headerResponse) : true) && (isReadOnly || isOk(detailResponse))) {
          const slipInfo =
            headerResult?.stockAdjust ??
            headerResult?.destroyExport ??
            headerResult?.inventoryTransaction ??
            headerResult?.stockAdjust ??
            headerResult ??
            detailResult?.stockAdjust ??
            detailResult?.destroyExport ??
            detailResult?.inventoryTransaction ??
            detailResult;
          let detailItems =
            headerResult?.stockAdjustDetails ??
            headerResult?.destroyExportDetails ??
            headerResult?.inventoryTransactionDetails ??
            headerResult?.details ??
            detailResult?.stockAdjustDetails ??
            detailResult?.destroyExportDetails ??
            detailResult?.inventoryTransactionDetails ??
            detailResult?.details ??
            [];

          if (isReadOnly && (!detailItems || detailItems.length === 0)) {
            const slipId = slipInfo?.satId ?? slipInfo?.id ?? slipInfo?.refId;
            if (slipId) {
              const fallbackDetailResponse = await DestroySlipService.view(slipId);
              if (isOk(fallbackDetailResponse)) {
                detailResult = fallbackDetailResponse?.result ?? fallbackDetailResponse?.data ?? null;
                detailItems =
                  detailResult?.stockAdjustDetails ??
                  detailResult?.destroyExportDetails ??
                  detailResult?.inventoryTransactionDetails ??
                  detailResult?.details ??
                  [];
              }
            }
          }

          if (slipInfo) {
            const inventoryId = slipInfo.inventoryId ?? slipInfo.warehouseId ?? null;
            const inventoryName = slipInfo.inventoryName ?? slipInfo.warehouseName ?? "";
            setDataInventory(inventoryId ? {
              value: inventoryId,
              label: inventoryName,
              address: slipInfo.inventoryAddress ?? "",
              branchName: slipInfo.branchName ?? "",
            } : null);
            setSatId(slipInfo.id ?? slipInfo.satId ?? slipInfo.refId ?? null);
            setNote(slipInfo.note ?? detailResult?.stockAdjust?.note ?? "");
            setSlipStatus(slipInfo.status ?? null);
            setLstProducts((detailItems ?? []).map((item: any) => {
              const availableQty = Number(
                item.availQty ??
                item.availableQty ??
                item.stockQty ??
                item.prevQuantity ??
                item.quantity ??
                item.currentQty ??
                0
              ) || 0;
              const destroyQty = Math.abs(Number(
                item.offsetQty ??
                item.destroyQty ??
                item.baseQuantity ??
                item.qty ??
                item.quantity ??
                item.quantityDestroy ??
                item.transactionQty ??
                0
              ) || 0);
              return {
                id: item.id ?? item.detailId ?? item.stockAdjustDetailId ?? 0,
                productId: item.productId ?? item.proId ?? 0,
                variantId: item.variantId ?? null,
                productName: item.productName
                  ?? item.name
                  ?? item.variantName
                  ?? [item.productSku, item.variantSku].filter(Boolean).join(" - ")
                  ?? `SP #${item.productId ?? item.proId ?? ""}`,
                productSku: item.productSku ?? item.sku ?? "",
                variantSku: item.variantSku ?? "",
                productAvatar: item.productAvatar ?? item.avatar ?? item.imageUrl ?? "",
                batchNo: item.batchNo ?? item.lotNo ?? item.lotCode ?? "",
                unitId: item.unitId ?? item.baseUnitId ?? null,
                unitName: item.unitName ?? item.baseUnitName ?? item.unit?.name ?? item.baseUnit?.name ?? "",
                reason: item.reason ?? item.destroyReason ?? "",
                availQty: availableQty,
                offsetQty: destroyQty > 0 ? -destroyQty : 0,
                prevQuantity: Number(item.prevQuantity ?? availableQty) || 0,
                afterQuantity: Number(item.afterQuantity ?? Math.max(availableQty - destroyQty, 0)) || 0,
                unitCost: Number(item.unitCost ?? 0) || 0,
                lineCost: Number(item.lineCost ?? 0) || 0,
                lineCreatedTime: item.createdTime ?? "",
                satId: item.satId ?? slipInfo.id ?? slipInfo.satId ?? null,
                inventoryId: item.inventoryId ?? inventoryId,
                inventoryName: item.inventoryName ?? inventoryName,
                originalAvailQty: availableQty,
              };
            }));
          }
        }
        setIsLoading(false);
      })();
    }
  }, [id, isReadOnly]);

  useEffect(() => {
    setLstBatchNoProduct(
      lstProducts.map((i) => `${i.productId}_${i.variantId ?? ""}_${i.batchNo ?? ""}`)
    );
  }, [lstProducts]);

  const [listInventory, setListInventory] = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // ── Warehouse loader — chỉ gọi khi mở dropdown, không auto-load ──────────
  const getListInventory = useCallback(async () => {
    if (listInventory.length > 0) return;
    setIsLoadingInventory(true);
    const response = await InventoryService.list({ page: 1, limit: 100 });
    if (isOk(response)) {
      const result = response.result ?? response.data;
      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.items) ? result.items : [];
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
    setNote("");
    if (e?.value) loadTempSlip(e.value);
  };

  // ── Product handlers ──────────────────────────────────────────────────────
  const handleChangeQty = (val: number, idx: number) => {
    setLstProducts((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const maxQty = Number(item.originalAvailQty ?? item.availQty) || 0;
      const nextQty = Math.max(0, Math.min(val ?? 0, maxQty));
      return { ...item, offsetQty: nextQty > 0 ? -nextQty : 0 };
    }));
  };

  const handleChangeReason = (val: string, idx: number) => {
    setLstProducts((prev) => prev.map((item, i) => i === idx ? { ...item, reason: val } : item));
  };

  const handleRemove = async (itemId: number) => {
    const response = await DestroySlipService.deletePro(itemId);
    if (isOk(response)) {
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
      variantId: item.variantId ?? null,
      productName: item.productName ?? "",
      productSku: item.sku ?? "",
      variantSku: "",
      productAvatar: item.productAvatar ?? "",
      batchNo: item.batchNo ?? "",
      unitId: item.unitId ?? null,
      unitName: item.unitName ?? item.unit?.name ?? "",
      reason: "",
      availQty: item.quantity ?? item.availQty ?? 0,
      offsetQty: 0,
      prevQuantity: item.quantity ?? item.availQty ?? 0,
      afterQuantity: item.quantity ?? item.availQty ?? 0,
      unitCost: item.avgCost ?? 0,
      lineCost: 0,
      lineCreatedTime: "",
      satId: satId ?? null,
      inventoryId: item.inventoryId ?? dataInventory?.value ?? null,
      inventoryName: item.inventoryName ?? dataInventory?.label ?? "",
      originalAvailQty: item.quantity ?? item.availQty ?? 0,
    }));
    setLstProducts((prev) => {
      const existKeys = new Set(prev.map((p) => `${p.productId}_${p.variantId ?? ""}_${p.batchNo ?? ""}`));
      return [...prev, ...converted.filter((c) => !existKeys.has(`${c.productId}_${c.variantId ?? ""}_${c.batchNo ?? ""}`))];
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataInventory) { showToast("Vui lòng chọn kho xuất hủy", "warning"); return; }
    if (lstProducts.length === 0) { showToast("Vui lòng thêm ít nhất 1 sản phẩm", "warning"); return; }
    if (lstProducts.some((item) => !item.productId)) { showToast("Có sản phẩm chưa hợp lệ", "warning"); return; }
    if (lstProducts.some((item) => !item.unitId)) { showToast("Có sản phẩm chưa có đơn vị", "warning"); return; }
    if (lstProducts.some((item) => (item.offsetQty ?? 0) >= 0)) { showToast("Số lượng hủy phải lớn hơn 0", "warning"); return; }

    setIsSubmit(true);

    // Update từng dòng trước
    await Promise.all(lstProducts.map((item) => DestroySlipService.addUpdatePro({
      id: item.id ?? 0,
      satId: satId ?? item.satId,
      productId: item.productId,
      variantId: item.variantId ?? null,
      batchNo: item.batchNo ?? "",
      unitId: item.unitId,
      reason: item.reason ?? "",
      availQty: item.originalAvailQty ?? item.availQty ?? 0,
      offsetQty: -Math.abs(item.offsetQty ?? 0),
    })));

    // Tạo phiếu chính thức
    const response = await DestroySlipService.create({
      id: satId,
      inventoryId: dataInventory.value,
      note,
    });

    if (isOk(response)) {
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
          <span className="ds-breadcrumb__current">
            {isReadOnly ? "Chi tiết phiếu xuất hủy" : id ? "Chỉnh sửa phiếu xuất hủy" : "Tạo phiếu xuất hủy"}
          </span>
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
                disabled={isReadOnly || isSubmit || !isReadyToAdd}
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
                          {(() => {
                            const originalAvailQty = Number(item.originalAvailQty ?? item.availQty) || 0;
                            const destroyQty = Math.abs(Number(item.offsetQty) || 0);
                            const remainQty = Math.max(originalAvailQty - destroyQty, 0);
                            return (
                              <>
                          <td className="ds-col-stt">{idx + 1}</td>
                          <td>
                            <div className="ds-product-name">{item.productName}</div>
                            {(item.productSku || item.variantSku) && (
                              <div className="ds-batch-no">
                                SKU: {[item.productSku, item.variantSku].filter(Boolean).join(" / ")}
                              </div>
                            )}
                            {item.batchNo && <div className="ds-batch-no">Lô: {item.batchNo}</div>}
                            {item.lineCreatedTime && (
                              <div className="ds-batch-no">Tạo lúc: {moment(item.lineCreatedTime).format("DD/MM/YYYY HH:mm")}</div>
                            )}
                          </td>
                          <td className="ds-col-center">
                            <div className="ds-tag">{item.inventoryName}</div>
                            {isReadOnly && (
                              <div className="ds-batch-no">
                                Trước/Sau: {(item.prevQuantity ?? originalAvailQty).toLocaleString()} / {(item.afterQuantity ?? remainQty).toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="ds-col-center">{item.unitName || "—"}</td>
                          <td className="ds-col-num">
                            <span className="ds-qty-stock">{remainQty}</span>
                            {isReadOnly && item.unitCost != null && (
                              <div className="ds-batch-no">
                                Giá vốn: {(item.unitCost ?? 0).toLocaleString("vi-VN")}đ
                              </div>
                            )}
                          </td>
                          <td className="ds-col-num ds-col-input">
                            <NummericInput
                              name={`qty-${idx}`} id={`qty-${idx}`}
                              fill={true} value={destroyQty} placeholder="0"
                              disabled={isReadOnly}
                              maxValue={originalAvailQty}
                              onValueChange={(e) => handleChangeQty(e.floatValue, idx)}
                              className="ds-qty-input"
                            />
                          </td>
                          <td>
                            <input
                              className="ds-reason-input"
                              placeholder="Nhập lý do hủy..."
                              value={item.reason}
                              disabled={isReadOnly}
                              onChange={(e) => handleChangeReason(e.target.value, idx)}
                            />
                            {isReadOnly && item.lineCost != null && (
                              <div className="ds-batch-no">
                                Chi phí dòng: {(item.lineCost ?? 0).toLocaleString("vi-VN")}đ
                              </div>
                            )}
                          </td>
                          <td className="ds-col-action">
                            <button type="button" className="ds-remove-btn" disabled={isReadOnly} onClick={() => handleRemove(item.id)} title="Xóa">
                              <Icon name="Times" style={{ width: 14 }} />
                            </button>
                          </td>
                              </>
                            );
                          })()}
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
                disabled={isReadOnly}
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
                  disabled={isReadOnly}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

            </form>

            {/* Actions */}
            <div className="ds-sidebar__actions">
              {!isReadOnly && (
                <Button
                  type="submit" color="primary"
                  disabled={lstProducts.length === 0 || isSubmit || !dataInventory}
                  onClick={handleSubmit}
                >
                  {id ? "Cập nhật phiếu" : "Tạo phiếu xuất hủy"}
                  {isSubmit && <Icon name="Loading" />}
                </Button>
              )}
              {isReadOnly && slipStatus === 0 && (
                <Button
                  type="button"
                  color="primary"
                  disabled={isSubmit || !satId}
                  onClick={async () => {
                    setIsSubmit(true);
                    const res = await DestroySlipService.approved(satId);
                    if (isOk(res)) {
                      showToast("Đã duyệt phiếu xuất hủy", "success");
                      onHide(true);
                    } else {
                      showToast(res.message ?? "Duyệt phiếu thất bại", "error");
                    }
                    setIsSubmit(false);
                  }}
                >
                  Duyệt phiếu
                  {isSubmit && <Icon name="Loading" />}
                </Button>
              )}
              {isReadOnly && (slipStatus === 0 || slipStatus === 2) && (
                <Button
                  type="button"
                  color="error"
                  disabled={isSubmit || !satId}
                  onClick={async () => {
                    setIsSubmit(true);
                    const res = await DestroySlipService.cancel(satId);
                    if (isOk(res)) {
                      showToast("Đã hủy phiếu xuất hủy", "success");
                      onHide(true);
                    } else {
                      showToast(res.message ?? "Hủy phiếu thất bại", "error");
                    }
                    setIsSubmit(false);
                  }}
                >
                  Hủy phiếu
                  {isSubmit && <Icon name="Loading" />}
                </Button>
              )}
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
