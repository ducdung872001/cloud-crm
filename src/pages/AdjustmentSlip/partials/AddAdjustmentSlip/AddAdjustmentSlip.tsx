import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { IAddAdjustmentSlipProps } from "model/adjustmentSlip/PropsModel";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { showToast } from "utils/common";
import InventoryService from "services/InventoryService";
import AdjustmentSlipService from "services/AdjustmentSlipService";
import ChooseProduct from "./partials/ChooseProduct/ChooseProduct";
import "./AddAdjustmentSlip.scss";

export default function AddAdjustmentSlip(props: IAddAdjustmentSlipProps) {
  const { onShow, onHide, id } = props;

  const [lstProducts, setLstProducts] = useState([]);
  const [lstBatchNoProduct, setLstBatchNoProduct] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [dataInventory, setDataInventory] = useState(null);
  const [satId, setSatId] = useState<number>(null);
  const [dataOrgProducts, setDataOrgProducts] = useState([]);
  const [isSubmit, setIsSubmit] = useState(false);

  const isDirty = !!(dataInventory || lstProducts.length > 0);
  const isReadyToAdd = !!dataInventory;
  const totalItems = lstProducts.length;

  // Ref để tránh stale closure trong useCallback mà không trigger re-render
  const dataInventoryRef = useRef(dataInventory);
  useEffect(() => { dataInventoryRef.current = dataInventory; }, [dataInventory]);

  // ── Load temp khi chọn kho ───────────────────────────────────────────────
  const handAdjustmentSlipTemp = useCallback(async (inventoryId: number) => {
    setIsLoading(true);
    const response = await AdjustmentSlipService.temp(inventoryId);
    if (response.code === 0) {
      const result = response.result;
      setDataOrgProducts(result?.stockAdjustDetails ?? []);
      setSatId(result.satId);
      const items = (result?.stockAdjustDetails ?? []).map((item: any) => ({
        ...item,
        inventoryName: result?.stockAdjust?.inventoryName ?? dataInventoryRef.current?.label ?? "",
      }));
      setLstProducts(items);
    } else {
      showToast("Có lỗi xảy ra khi tải dữ liệu kho", "error");
    }
    setIsLoading(false);
  }, []); // deps rỗng — dùng ref để đọc dataInventory tránh re-create function

  // ── Load chi tiết phiếu khi edit ─────────────────────────────────────────
  useEffect(() => {
    if (onShow && id) {
      (async () => {
        setIsLoading(true);
        const response = await AdjustmentSlipService.view(id);
        if (response.code === 0) {
          const result = response.result;
          if (result?.stockAdjust) {
            setDataInventory({
              value: result.stockAdjust.inventoryId,
              label: result.stockAdjust.inventoryName,
            });
            setSatId(result.stockAdjust.id);
            const items = (result.stockAdjustDetails ?? []).map((item: any) => ({
              ...item,
              inventoryName: result.stockAdjust.inventoryName,
            }));
            setLstProducts(items);
            setDataOrgProducts(items);
          }
        } else {
          showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
        }
        setIsLoading(false);
      })();
    }
  }, [onShow, id]);

  useEffect(() => {
    setLstBatchNoProduct(lstProducts.map((item) => item.batchNo));
  }, [lstProducts]);

  const [listInventory, setListInventory] = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // ── Warehouse loader — chỉ load khi mở dropdown, không auto-load ─────────
  const getListInventory = useCallback(async () => {
    if (listInventory.length > 0) return; // cache, không load lại
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
    // e là option object {value, label, address, branchName}
    setDataInventory(e);
    setLstProducts([]);
    if (e?.value) handAdjustmentSlipTemp(e.value);
  };

  // ── Product handlers ──────────────────────────────────────────────────────
  const handleChangeQty = (val: number, idx: number) => {
    setLstProducts((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, availQty: val, offsetQty: val - (dataOrgProducts[idx]?.availQty || 0) }
          : item
      )
    );
  };

  const handleChangeReason = (val: string, idx: number) => {
    setLstProducts((prev) => prev.map((item, i) => i === idx ? { ...item, reason: val } : item));
  };

  const handRemoveProItem = async (itemId: number) => {
    const response = await AdjustmentSlipService.deletePro(itemId);
    if (response.code === 0) {
      showToast("Xóa sản phẩm thành công", "success");
      if (dataInventory?.value) handAdjustmentSlipTemp(dataInventory.value);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handChangeDataProps = (data: any[]) => {
    if (!data?.length) return;
    const converted = data.map((item) => ({
      id: item.id ?? 0,
      productId: item.productId ?? item.productId,
      productName: item.productName ?? "",
      productAvatar: item.productAvatar ?? "",
      batchNo: item.batchNo ?? "",
      unitId: item.unitId ?? null,
      unitName: item.unitName ?? (item.unit?.name ?? ""),
      reason: "",
      availQty: item.quantity ?? item.availQty ?? 0,
      offsetQty: 0,
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
    e?.preventDefault();
    if (!dataInventory) { showToast("Vui lòng chọn kho hàng", "warning"); return; }
    if (lstProducts.length === 0) { showToast("Vui lòng thêm ít nhất 1 sản phẩm", "warning"); return; }

    setIsSubmit(true);

    // Update từng dòng
    await Promise.all(lstProducts.map((item) => AdjustmentSlipService.addUpdatePro(item)));

    // Tạo phiếu chính thức
    const response = await AdjustmentSlipService.createAdjSlip({
      id: satId,
      inventoryId: dataInventory.value,
    });

    if (response.code === 0) {
      showToast(`${id ? "Chỉnh sửa" : "Tạo"} phiếu kiểm kho thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Quay lại",
      defaultAction: () => { setShowDialog(false); onHide(false); },
    });
    setShowDialog(true);
  };

  return (
    <div className="page-content adj-page">

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="adj-header">
        <div className="adj-breadcrumb">
          <span className="adj-breadcrumb__parent" onClick={showConfirmBack}>
            Quản lý kho
          </span>
          <Icon name="ArrowRight" style={{ width: 14, opacity: 0.4 }} />
          <span className="adj-breadcrumb__current">
            {id ? "Chỉnh sửa phiếu kiểm" : "Tạo phiếu kiểm kho"}
          </span>
        </div>
      </div>

      {/* ── 2-column layout ─────────────────────────────────────────── */}
      <div className="adj-layout">

        {/* ── LEFT: bảng sản phẩm ────────────────────────────────── */}
        <div className="adj-layout__main">
          <div className="card-box adj-product-card">
            <div className="adj-product-card__header">
              <span className="adj-product-card__title">
                <Icon name="CollectInfo" style={{ width: 16, opacity: 0.7 }} />
                Danh sách hàng hóa cần kiểm
                {totalItems > 0 && <span className="adj-badge">{totalItems}</span>}
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

            <div className={`adj-product-card__body${totalItems > 0 ? " adj-product-card__body--has-data" : ""}`}>
              {isLoading ? (
                <div className="adj-loading"><Loading /></div>
              ) : totalItems > 0 ? (
                <div className="adj-table-wrapper">
                  <table className="adj-table">
                    <thead>
                      <tr>
                        <th className="adj-col-stt">STT</th>
                        <th>Sản phẩm</th>
                        <th className="adj-col-center">Kho</th>
                        <th className="adj-col-center">Đơn vị</th>
                        <th className="adj-col-num">Tồn kho</th>
                        <th className="adj-col-num adj-col-input">SL thực tế</th>
                        <th className="adj-col-num">Lệch</th>
                        <th>Lý do điều chỉnh</th>
                        <th className="adj-col-action"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lstProducts.map((item, idx) => (
                        <tr key={idx} className="adj-product-row">
                          <td className="adj-col-stt">{idx + 1}</td>
                          <td>
                            <div className="adj-product-info">
                              {item.productAvatar && (
                                <div className="adj-product-avatar">
                                  <Image src={item.productAvatar} alt={item.productName} />
                                </div>
                              )}
                              <div className="adj-product-name">{item.productName}</div>
                            </div>
                          </td>
                          <td className="adj-col-center">
                            <span className="adj-tag">{item.inventoryName}</span>
                          </td>
                          <td className="adj-col-center">{item.unitName || "—"}</td>
                          <td className="adj-col-num">
                            <span className="adj-qty-stock">{item.availQty ?? "—"}</span>
                          </td>
                          <td className="adj-col-num adj-col-input">
                            <NummericInput
                              name={`qty-${idx}`} id={`qty-${idx}`}
                              fill={true} value={item.availQty} placeholder="0"
                              onValueChange={(e) => handleChangeQty(e.floatValue, idx)}
                              className="adj-qty-input"
                            />
                          </td>
                          <td className="adj-col-num">
                            <span className={`adj-offset${(item.offsetQty ?? 0) < 0 ? " adj-offset--neg" : (item.offsetQty ?? 0) > 0 ? " adj-offset--pos" : ""}`}>
                              {(item.offsetQty ?? 0) > 0 ? `+${item.offsetQty}` : (item.offsetQty ?? 0)}
                            </span>
                          </td>
                          <td>
                            <input
                              className="adj-reason-input"
                              placeholder="Lý do điều chỉnh..."
                              value={item.reason || ""}
                              onChange={(e) => handleChangeReason(e.target.value, idx)}
                            />
                          </td>
                          <td className="adj-col-action">
                            <button
                              type="button" className="adj-remove-btn"
                              onClick={() => handRemoveProItem(item.id)} title="Xóa"
                            >
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
                        ? <>Chưa có sản phẩm. Nhấn <strong>Thêm sản phẩm</strong> để bắt đầu.</>
                        : <>Vui lòng chọn <strong>kho hàng</strong> ở bên phải trước.</>}
                    </span>
                  }
                  type="no-item"
                  titleButton={isReadyToAdd ? "Thêm mới sản phẩm cần điều chỉnh" : undefined}
                  action={isReadyToAdd ? () => setShowModalAdd(true) : undefined}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: sidebar thông tin phiếu ──────────────────────── */}
        <div className="adj-layout__sidebar">
          <div className="card-box adj-sidebar">

            <div className="adj-sidebar__header">
              <div className="adj-sidebar__icon">
                <Icon name="PaperClipboard" />
              </div>
              <span className="adj-sidebar__title">Thông tin phiếu kiểm kho</span>
            </div>

            <div className="adj-sidebar__body">

              {/* Kho hàng */}
              <SelectCustom
                id="inventory" name="inventory"
                label="Kho hàng" fill={true}
                options={listInventory}
                required={true}
                value={dataInventory?.value ?? null}
                onMenuOpen={getListInventory}
                onChange={handleChangeInventory}
                isLoading={isLoadingInventory}
                placeholder="Chọn kho hàng"
              />

              {/* Địa chỉ / Chi nhánh */}
              {dataInventory?.address && (
                <div className="adj-info-row">
                  <span className="adj-info-row__label">Địa chỉ kho</span>
                  <span className="adj-info-row__value">{dataInventory.address}</span>
                </div>
              )}
              {dataInventory?.branchName && (
                <div className="adj-info-row">
                  <span className="adj-info-row__label">Chi nhánh</span>
                  <span className="adj-info-row__value">{dataInventory.branchName}</span>
                </div>
              )}

              {/* Summary */}
              <div className="adj-summary">
                <div className="adj-summary__row">
                  <span className="adj-summary__label">Số loại SP</span>
                  <span className="adj-summary__value">{totalItems} loại</span>
                </div>
                <div className="adj-summary__row adj-summary__row--total">
                  <span className="adj-summary__label">Sản phẩm lệch</span>
                  <span className="adj-summary__value adj-summary__value--hl">
                    {lstProducts.filter(i => (i.offsetQty ?? 0) !== 0).length} SP
                  </span>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="adj-sidebar__actions">
              <Button
                type="submit" color="primary"
                disabled={totalItems === 0 || isSubmit || !dataInventory}
                onClick={handleSubmit}
              >
                {id ? "Cập nhật phiếu" : "Tạo phiếu kiểm kho"}
                {isSubmit && <Icon name="Loading" />}
              </Button>
              <Button type="button" variant="outline" disabled={isSubmit} onClick={showConfirmBack}>
                Quay lại
              </Button>
            </div>

          </div>
        </div>
      </div>

      <ChooseProduct
        onShow={showModalAdd}
        onHide={(reload) => {
          if (reload && dataInventory?.value) handAdjustmentSlipTemp(dataInventory.value);
          setShowModalAdd(false);
        }}
        lstBatchNoProduct={lstBatchNoProduct}
        satId={satId}
        inventory={dataInventory}
        takeData={(data) => handChangeDataProps(data)}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}