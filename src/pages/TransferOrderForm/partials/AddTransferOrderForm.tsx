import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
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
import urls from "@/configs/urls";
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

const TRANSFER_STATUS_LABEL: Record<number, string> = {
  0: "Chờ duyệt",
  1: "Đã duyệt",
  3: "Đã hủy",
};

const getApiPayload = (response: any) => response?.result ?? response?.data ?? {};

const getApiItems = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function AddTransferOrderForm(props) {
  const { onHide, id } = props;
  const navigate = useNavigate();

  const [transferId, setTransferId] = useState<number | null>(id ?? null);
  const [transferStatus, setTransferStatus] = useState<number | null>(id ? 0 : null);
  const [lstProducts, setLstProducts] = useState<ITransferProduct[]>([]);
  const [lstBatchNoProduct, setLstBatchNoProduct] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [dataInventoryOrg, setDataInventoryOrg] = useState<any>(null);
  const [dataInventoryArrive, setDataInventoryArrive] = useState<any>(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState("");
  const [listInventory, setListInventory] = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [pendingRowKey, setPendingRowKey] = useState<string | null>(null);

  const isLocked = transferStatus === 1 || transferStatus === 3;
  const isDirty = !!(dataInventoryOrg || dataInventoryArrive || note || lstProducts.length > 0);
  const totalQty = lstProducts.reduce((s, i) => s + (Number(i.quanlityAffter) || 0), 0);
  const optionsOrg = listInventory.filter((i) => i.value !== dataInventoryArrive?.value);
  const optionsArrive = listInventory.filter((i) => i.value !== dataInventoryOrg?.value);
  const isReadyToAdd = !!dataInventoryOrg && !isLocked;
  const canSaveHeader = !isLocked && !isSubmit && !!dataInventoryOrg && !!dataInventoryArrive;
  const canAddProduct = isReadyToAdd;
  const canApprove = !!transferId && transferStatus === 0 && lstProducts.length > 0;
  const canCancel = !!transferId && transferStatus === 0;

  const statusLabel = useMemo(() => {
    if (transferStatus == null) return "Chưa lưu";
    return TRANSFER_STATUS_LABEL[transferStatus] ?? `Trạng thái ${transferStatus}`;
  }, [transferStatus]);

  const getRowKey = (item: ITransferProduct) => `${item.detailId ?? "new"}_${item.productId}_${item.variantId ?? 0}`;

  const mapDetailToRow = useCallback((detail: any, warehouseId?: number, warehouseLabel?: string): ITransferProduct => ({
    detailId: detail.id,
    productId: detail.productId,
    variantId: detail.variantId,
    unitId: detail.unitId,
    inventoryId: warehouseId ?? detail.inventoryId ?? 0,
    productAvatar: detail.productAvatar ?? "",
    productName: detail.productName ?? "",
    inventoryName: warehouseLabel ?? detail.inventoryName ?? "",
    unitName: detail.unitName ?? "",
    quanlityBefor: detail.availQty ?? detail.quantityBefore ?? 0,
    quanlityAffter: detail.quantity ?? "",
    note: detail.note ?? "",
  }), []);

  const getValidRowsForSync = useCallback((rows: ITransferProduct[]) => rows.filter((item) =>
    !!item.productId &&
    !!item.unitId &&
    Number(item.quanlityAffter) > 0
  ), []);

  const getListInventory = useCallback(async () => {
    if (listInventory.length > 0) return listInventory;
    setIsLoadingInventory(true);
    try {
      const res = await InventoryService.list({ page: 1, limit: 100 });
      if (res.code === 0) {
        const data = Array.isArray(res.result)
          ? res.result
          : Array.isArray(res.result?.items) ? res.result.items : [];
        const mapped = data.map((i: any) => ({ value: i.id, label: i.name }));
        setListInventory(mapped);
        return mapped;
      }
      showToast("Không lấy được danh sách kho", "error");
      return [];
    } finally {
      setIsLoadingInventory(false);
    }
  }, [listInventory]);

  const reloadDetails = useCallback(async (currentTransferId: number, warehouseId?: number, warehouseLabel?: string) => {
    const detailRes = await InventoryService.stockTransferDetailList({ transferId: currentTransferId, productId: -1, limit: 200 });
    if (detailRes.code !== 0) {
      showToast(detailRes.message ?? "Không tải được danh sách hàng hóa", "error");
      return;
    }
    const detailItems = getApiItems(getApiPayload(detailRes));
    setLstProducts(detailItems.map((d: any) => mapDetailToRow(d, warehouseId, warehouseLabel)));
  }, [mapDetailToRow]);

  const loadTransfer = useCallback(async (transferIdToLoad: number) => {
    setIsLoading(true);
    try {
      const [headerRes, inventoryOptions] = await Promise.all([
        InventoryService.stockTransferGet(transferIdToLoad),
        getListInventory(),
      ]);

      if (headerRes.code !== 0) {
        showToast(headerRes.message ?? "Không tải được phiếu", "error");
        return;
      }

      const transfer = getApiPayload(headerRes);
      setTransferId(transfer.id);
      setTransferStatus(transfer.status ?? 0);
      setNote(transfer.note ?? "");

      const orgOpt = inventoryOptions.find((o: any) => o.value === transfer.fromWarehouseId) ?? null;
      const arrOpt = inventoryOptions.find((o: any) => o.value === transfer.toWarehouseId) ?? null;
      setDataInventoryOrg(orgOpt);
      setDataInventoryArrive(arrOpt);

      await reloadDetails(transfer.id, transfer.fromWarehouseId, orgOpt?.label);
    } finally {
      setIsLoading(false);
    }
  }, [getListInventory, reloadDetails]);

  useEffect(() => {
    getListInventory();
  }, [getListInventory]);

  useEffect(() => {
    if (!id) return;
    loadTransfer(id);
  }, [id, loadTransfer]);

  useEffect(() => {
    setLstBatchNoProduct(lstProducts.map((p) => String(p.productId)));
  }, [lstProducts]);

  useEffect(() => {
    if (!dataInventoryOrg) return;
    setLstProducts((prev) => prev.map((item) => ({
      ...item,
      inventoryId: dataInventoryOrg.value,
      inventoryName: dataInventoryOrg.label,
    })));
  }, [dataInventoryOrg]);

  const handChangeDataProps = (data: any[]) => {
    const newItems: ITransferProduct[] = data.map((item) => ({
      detailId: undefined,
      productId: item.productId,
      variantId: item.variantId,
      unitId: item.unitId,
      inventoryId: dataInventoryOrg?.value ?? item.inventoryId ?? 0,
      productAvatar: item.productAvatar ?? "",
      productName: item.productName ?? "",
      inventoryName: dataInventoryOrg?.label ?? item.inventoryName ?? "",
      unitName: item.unitName ?? "",
      quanlityBefor: item.quantity ?? 0,
      quanlityAffter: "",
      note: "",
    }));

    setLstProducts((prev) => {
      const keys = new Set(prev.map((p) => `${p.productId}_${p.variantId ?? 0}`));
      return [...prev, ...newItems.filter((n) => !keys.has(`${n.productId}_${n.variantId ?? 0}`))];
    });
  };

  const handleChangeQty = (val: number | undefined, idx: number) =>
    setLstProducts((prev) => prev.map((item, i) => i === idx ? { ...item, quanlityAffter: val ?? "" } : item));

  const handleChangeNote = (val: string, idx: number) =>
    setLstProducts((prev) => prev.map((item, i) => i === idx ? { ...item, note: val } : item));

  const validateHeader = () => {
    if (!dataInventoryOrg) {
      showToast("Vui lòng chọn kho nguồn", "warning");
      return false;
    }
    if (!dataInventoryArrive) {
      showToast("Vui lòng chọn kho đích", "warning");
      return false;
    }
    if (dataInventoryOrg.value === dataInventoryArrive.value) {
      showToast("Kho nguồn và kho đích phải khác nhau", "warning");
      return false;
    }
    return true;
  };

  const onSubmitForm = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateHeader()) return;

    setIsSubmit(true);
    try {
      const headerRes = await InventoryService.stockTransferUpdate({
        id: transferId ?? undefined,
        code: "",
        fromWarehouseId: dataInventoryOrg.value,
        toWarehouseId: dataInventoryArrive.value,
        note,
        status: 0,
      });

      if (headerRes.code !== 0) {
        showToast(headerRes.message ?? "Lưu phiếu thất bại", "error");
        return;
      }

      const savedTransfer = getApiPayload(headerRes);
      const savedId = savedTransfer.id;
      setTransferId(savedId);
      setTransferStatus(savedTransfer.status ?? 0);

      const rowsToSync = getValidRowsForSync(lstProducts);
      if (rowsToSync.length > 0) {
        const detailResults = await Promise.all(rowsToSync.map((item) =>
          InventoryService.stockTransferDetailUpdate({
            id: item.detailId ?? undefined,
            transferId: savedId,
            productId: item.productId,
            variantId: item.variantId,
            unitId: item.unitId,
            quantity: Number(item.quanlityAffter),
            note: item.note,
          })
        ));

        const failedRows = detailResults.filter((res) => res.code !== 0);
        if (failedRows.length > 0) {
          showToast(`Có ${failedRows.length} dòng hàng lưu thất bại`, "warning");
        }
      }

      if (!id) {
        showToast("Tạo phiếu chuyển kho thành công", "success");
        navigate(`${urls.inventory_transfer_document}?id=${savedId}`, { replace: true });
        return;
      }

      showToast("Cập nhật phiếu thành công", "success");
      await loadTransfer(savedId);
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại", "error");
    } finally {
      setIsSubmit(false);
    }
  };

  const handleSaveDetail = async (idx: number) => {
    const item = lstProducts[idx];
    if (!transferId) {
      showToast("Vui lòng lưu phiếu trước khi thêm dòng hàng", "warning");
      return;
    }
    if (isLocked) return;
    if (!item.productId) {
      showToast("Thiếu thông tin sản phẩm", "warning");
      return;
    }
    if (!item.unitId) {
      showToast("Thiếu đơn vị sản phẩm", "warning");
      return;
    }
    if (!item.quanlityAffter || Number(item.quanlityAffter) <= 0) {
      showToast("Số lượng chuyển phải lớn hơn 0", "warning");
      return;
    }

    const rowKey = getRowKey(item);
    setPendingRowKey(rowKey);
    try {
      const res = await InventoryService.stockTransferDetailUpdate({
        id: item.detailId ?? undefined,
        transferId,
        productId: item.productId,
        variantId: item.variantId,
        unitId: item.unitId,
        quantity: Number(item.quanlityAffter),
        note: item.note,
      });

      if (res.code !== 0) {
        showToast(res.message ?? "Lưu dòng hàng thất bại", "error");
        return;
      }

      showToast(item.detailId ? "Cập nhật dòng hàng thành công" : "Thêm dòng hàng thành công", "success");
      await reloadDetails(transferId, dataInventoryOrg?.value, dataInventoryOrg?.label);
    } finally {
      setPendingRowKey(null);
    }
  };

  const handleRemove = async (idx: number) => {
    const item = lstProducts[idx];
    if (isLocked) return;

    if (!item.detailId) {
      setLstProducts((prev) => prev.filter((_, i) => i !== idx));
      return;
    }

    setPendingRowKey(getRowKey(item));
    try {
      const res = await InventoryService.stockTransferDetailDelete(item.detailId);
      if (res.code !== 0) {
        showToast(res.message ?? "Xóa sản phẩm thất bại", "error");
        return;
      }
      showToast("Xóa dòng hàng thành công", "success");
      if (transferId) {
        await reloadDetails(transferId, dataInventoryOrg?.value, dataInventoryOrg?.label);
      }
    } finally {
      setPendingRowKey(null);
    }
  };

  const handleApprove = async () => {
    if (!transferId || !canApprove) return;
    setIsSubmit(true);
    try {
      const res = await InventoryService.stockTransferApprove(transferId);
      if (res.code !== 0 && res.status !== 1) {
        showToast(res.message ?? "Duyệt phiếu thất bại", "error");
        return;
      }
      showToast("Duyệt phiếu chuyển kho thành công", "success");
      await loadTransfer(transferId);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleCancel = async () => {
    if (!transferId || !canCancel) return;
    setIsSubmit(true);
    try {
      const res = await InventoryService.stockTransferCancel(transferId);
      if (res.code !== 0 && res.status !== 1) {
        showToast(res.message ?? "Hủy phiếu thất bại", "error");
        return;
      }
      showToast("Hủy phiếu chuyển kho thành công", "success");
      await loadTransfer(transferId);
    } finally {
      setIsSubmit(false);
    }
  };

  const showDialogConfirmBack = () => {
    if (!isDirty || transferId) {
      onHide(false);
      return;
    }
    setContentDialog({
      color: "warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Quay lại</Fragment>,
      message: <Fragment>Phiếu đang có thay đổi chưa lưu. Bạn có chắc muốn <strong>quay lại</strong>?</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Quay lại",
      defaultAction: () => { setShowDialog(false); onHide(false); },
    });
    setShowDialog(true);
  };

  return (
    <div className="tf-page">
      <div className="tf-page-header">
        <div className="tf-title-breadcrumb">
          <span className="tf-title-breadcrumb__parent" onClick={showDialogConfirmBack}>
            Phiếu điều chuyển kho
          </span>
          <Icon name="ArrowRight" style={{ width: 14, opacity: 0.4 }} />
          <span className="tf-title-breadcrumb__current">
            {transferId ? "Chi tiết phiếu" : "Tạo phiếu mới"}
          </span>
        </div>
      </div>

      <div className="tf-layout">
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
                disabled={!canAddProduct || isSubmit}
                onClick={(e) => { e.preventDefault(); setShowModalAdd(true); }}
              >
                <Icon name="Plus" style={{ width: 14, marginRight: 5 }} />
                Thêm dòng
              </Button>
            </div>

            <div className={`tf-product-card__body${lstProducts.length > 0 ? " tf-product-card__body--has-data" : ""}`}>
              {isLoading ? (
                <SystemNotification description={<span>Đang tải dữ liệu phiếu chuyển kho...</span>} type="no-item" />
              ) : lstProducts.length > 0 ? (
                <div className="tf-product-table-wrapper">
                  <table className="tf-product-table">
                    <thead>
                      <tr>
                        <th className="tf-col-stt">STT</th>
                        <th>Sản phẩm</th>
                        <th>Kho nguồn</th>
                        <th className="tf-col-center tf-th-center">Đơn vị</th>
                        <th className="tf-col-num tf-th-right">Tồn kho</th>
                        <th className="tf-col-num tf-col-input">SL chuyển</th>
                        <th>Ghi chú</th>
                        <th className="tf-col-action-wide"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lstProducts.map((item, idx) => {
                        const rowKey = getRowKey(item);
                        const isRowLoading = pendingRowKey === rowKey;
                        return (
                          <tr key={rowKey} className="tf-product-row">
                            <td className="tf-col-stt">{idx + 1}</td>
                            <td>
                              <div className="tf-product-name">{item.productName}</div>
                            </td>
                            <td className="tf-col-center">
                              <span className="tf-tag">{item.inventoryName || "—"}</span>
                            </td>
                            <td className="tf-col-center">{item.unitName || "—"}</td>
                            <td className="tf-col-num">
                              <span className="tf-qty-current">{item.quanlityBefor ?? "—"}</span>
                            </td>
                            <td className="tf-col-num tf-col-input">
                              <NummericInput
                                name={`qty-${idx}`}
                                id={`qty-${idx}`}
                                fill={true}
                                value={item.quanlityAffter}
                                placeholder="0"
                                onValueChange={(e) => handleChangeQty(e.floatValue, idx)}
                                className="tf-qty-input"
                                disabled={isLocked}
                              />
                            </td>
                            <td>
                              <input
                                className="tf-reason-input"
                                placeholder="Ghi chú..."
                                value={item.note}
                                onChange={(e) => handleChangeNote(e.target.value, idx)}
                                disabled={isLocked}
                              />
                            </td>
                            <td className="tf-col-action-wide">
                              <div className="tf-row-actions">
                                {!isLocked && (
                                  <button
                                    type="button"
                                    className="tf-inline-btn"
                                    onClick={() => handleSaveDetail(idx)}
                                    disabled={isRowLoading}
                                  >
                                    {isRowLoading ? "Đang lưu..." : item.detailId ? "Lưu" : "Thêm"}
                                  </button>
                                )}
                                {!isLocked && (
                                  <button
                                    type="button"
                                    className="tf-remove-btn"
                                    onClick={() => handleRemove(idx)}
                                    title="Xóa"
                                    disabled={isRowLoading}
                                  >
                                    <Icon name="Times" style={{ width: 14 }} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <SystemNotification
                  description={
                    <span>
                      {isReadyToAdd
                        ? <>Chưa có sản phẩm nào. Nhấn <strong>Thêm dòng</strong> để bắt đầu.</>
                        : isLocked
                          ? <>Phiếu không còn ở trạng thái chờ duyệt nên không thể chỉnh sửa dòng hàng.</>
                          : <>Vui lòng chọn <strong>kho nguồn</strong> ở bên phải trước.</>}
                    </span>
                  }
                  type="no-item"
                  titleButton={isReadyToAdd ? "Thêm dòng hàng" : undefined}
                  action={isReadyToAdd ? () => setShowModalAdd(true) : undefined}
                />
              )}
            </div>
          </div>
        </div>

        <div className="tf-layout__sidebar">
          <div className="card-box tf-sidebar-card">
            <div className="tf-sidebar-card__header">
              <div className="tf-sidebar-card__icon">
                <Icon name="WarehouseManagement" />
              </div>
              <div className="tf-sidebar-card__header-main">
                <span className="tf-sidebar-card__title">Thông tin phiếu chuyển kho</span>
                <span className={`tf-status-chip tf-status-chip--${transferStatus ?? "draft"}`}>
                  {statusLabel}
                </span>
              </div>
            </div>

            <form className="tf-sidebar-card__body" onSubmit={onSubmitForm}>
              <SelectCustom
                id="inventoryOrg"
                name="inventoryOrg"
                label="Từ kho"
                fill={true}
                options={optionsOrg}
                required={true}
                value={dataInventoryOrg?.value ?? null}
                onMenuOpen={getListInventory}
                onChange={(e) => setDataInventoryOrg(e)}
                isLoading={isLoadingInventory}
                placeholder="Chọn kho nguồn"
                disabled={isLocked}
              />

              <div className="tf-sidebar-arrow">
                <Icon name="ArrowSmallUp" style={{ width: 18, opacity: 0.4, transform: "rotate(180deg)" }} />
                <span className="tf-sidebar-arrow__label">Chuyển đến</span>
                <Icon name="ArrowSmallUp" style={{ width: 18, opacity: 0.4, transform: "rotate(180deg)" }} />
              </div>

              <SelectCustom
                id="inventoryArrive"
                name="inventoryArrive"
                label="Đến kho"
                fill={true}
                options={optionsArrive}
                required={true}
                value={dataInventoryArrive?.value ?? null}
                onMenuOpen={getListInventory}
                onChange={(e) => setDataInventoryArrive(e)}
                isLoading={isLoadingInventory}
                placeholder="Chọn kho đích"
                disabled={!dataInventoryOrg || isLocked}
              />

              <div className="tf-sidebar-summary">
                <div className="tf-sidebar-summary__row">
                  <span className="tf-sidebar-summary__label">Mã phiếu</span>
                  <span className="tf-sidebar-summary__value">{transferId ? `#${transferId}` : "Chưa có"}</span>
                </div>
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

              <div className="tf-sidebar-note">
                <label className="tf-sidebar-note__label">Ghi chú</label>
                <TextArea
                  name="note"
                  value={note}
                  fillColor={true}
                  placeholder="Nhập nội dung điều chuyển kho..."
                  onChange={(e) => setNote(e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </form>

            <div className="tf-sidebar-card__actions">
              <Button
                type="submit"
                color="primary"
                disabled={!canSaveHeader}
                onClick={onSubmitForm}
              >
                {transferId ? "Lưu phiếu" : "Tạo phiếu"}
                {isSubmit && <Icon name="Loading" />}
              </Button>

              {canApprove && (
                <Button
                  type="button"
                  color="success"
                  disabled={isSubmit}
                  onClick={handleApprove}
                >
                  Duyệt phiếu
                </Button>
              )}

              {canCancel && (
                <Button
                  type="button"
                  color="error"
                  disabled={isSubmit}
                  onClick={handleCancel}
                >
                  Hủy phiếu
                </Button>
              )}

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
