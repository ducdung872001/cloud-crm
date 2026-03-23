import React, { useCallback, useEffect, useRef, useState } from "react";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import Button from "components/button/button";
import Checkbox from "components/checkbox/checkbox";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, Pagination, PaginationProps } from "components/pagination/pagination";
import { showToast } from "utils/common";
import InventoryService, { IVariantStockFilterRequest } from "services/InventoryService";
import "./ChooseProductVariant.scss";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IVariantItem {
  inventoryBalanceId: number;
  productId:    number;
  productName:  string;
  productCode:  string;
  productAvatar?: string;
  variantId:    number;
  sku:          string;
  variantLabel: string;
  baseUnitId:   number;
  baseUnitName: string;
  quantity:     number;
  avgCost:      number;
  warehouseId:  number;
  warehouseName: string;
}

/** Data shape được truyền ra ngoài qua takeData */
export interface IChosenProduct {
  productId:    number;
  variantId:    number;
  unitId:       number;
  inventoryId:  number;
  productAvatar: string;
  productName:  string;  // "Tên SP — Biến thể" nếu có variantLabel
  inventoryName: string;
  unitName:     string;
  quantity:     number;  // tồn kho hiện tại
  sku:          string;
  avgCost:      number;
}

export interface IChooseProductVariantProps {
  onShow:    boolean;
  onHide:    () => void;
  /** Warehouse option đã chọn */
  inventory: { value: number; label: string } | null;
  /**
   * Danh sách key đã có trong phiếu để filter trùng.
   * Format: `"${productId}_${variantId}"` hoặc chỉ `"${productId}"`
   */
  excludeKeys?: string[];
  /** Tiêu đề modal — mặc định "Chọn sản phẩm" */
  title?: string;
  takeData: (data: IChosenProduct[]) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChooseProductVariant({
  onShow, onHide, inventory, excludeKeys = [], title = "Chọn sản phẩm", takeData,
}: IChooseProductVariantProps) {

  const isMounted = useRef(false);

  const [isLoading, setIsLoading]       = useState(true);
  const [lstVariants, setLstVariants]   = useState<IVariantItem[]>([]);
  const [listChecked, setListChecked]   = useState<Set<number>>(new Set());
  const [dataSelected, setDataSelected] = useState<IVariantItem[]>([]);
  const [isSubmit, setIsSubmit]         = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword]           = useState("");

  const [params, setParams] = useState<IVariantStockFilterRequest>({
    keyword: "", warehouseId: undefined, page: 1, size: 20,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Biến thể",
    isChooseSizeLimit: false,
    setPage: (page) => setParams(p => ({ ...p, page })),
  });

  // Reset khi mở modal
  useEffect(() => {
    if (onShow) {
      setListChecked(new Set());
      setDataSelected([]);
      setKeyword(""); setKeywordInput("");
      isMounted.current = false;
      if (inventory?.value) {
        setParams({ keyword: "", warehouseId: inventory.value, page: 1, size: 20 });
      }
    }
  }, [onShow, inventory?.value]);

  // Load danh sách biến thể
  const loadVariants = useCallback(async (p: IVariantStockFilterRequest) => {
    if (!p.warehouseId) return;
    setIsLoading(true);
    const res = await InventoryService.variantStockList(p);
    if (res.code === 0) {
      const items: IVariantItem[] = res.result?.items ?? [];
      // Lọc bỏ những item đã có trong phiếu
      const filtered = items.filter(i => {
        const key1 = `${i.productId}_${i.variantId}`;
        const key2 = String(i.productId);
        return !excludeKeys.includes(key1) && !excludeKeys.includes(key2);
      });
      setLstVariants(filtered);
      setPagination(prev => ({
        ...prev,
        page:      +res.result.page,
        sizeLimit: p.size ?? 20,
        totalItem: +res.result.total,
        totalPage: Math.ceil(+res.result.total / (p.size ?? 20)),
      }));
    } else {
      showToast(res.message ?? "Có lỗi xảy ra", "error");
    }
    setIsLoading(false);
  }, [excludeKeys]);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    if (onShow && params.warehouseId) loadVariants(params);
  }, [params, onShow]);

  // Search debounce 400ms
  useEffect(() => {
    const t = setTimeout(() => setParams(p => ({ ...p, keyword, page: 1 })), 400);
    return () => clearTimeout(t);
  }, [keyword]);

  // ── Selection ───────────────────────────────────────────────────────────────
  const toggleOne = (item: IVariantItem) => {
    const key = item.inventoryBalanceId;
    setListChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setDataSelected(d => d.filter(i => i.inventoryBalanceId !== key));
      } else {
        next.add(key);
        setDataSelected(d => [...d, item]);
      }
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setListChecked(new Set(lstVariants.map(i => i.inventoryBalanceId)));
      setDataSelected(lstVariants);
    } else {
      setListChecked(new Set());
      setDataSelected([]);
    }
  };

  // ── Confirm ─────────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (dataSelected.length === 0) { showToast("Chưa chọn sản phẩm nào", "warning"); return; }
    setIsSubmit(true);
    takeData(dataSelected.map(item => ({
      productId:    item.productId,
      variantId:    item.variantId,
      unitId:       item.baseUnitId,
      inventoryId:  item.warehouseId,
      productAvatar: item.productAvatar ?? "",
      productName:  item.variantLabel
        ? `${item.productName} — ${item.variantLabel}`
        : item.productName,
      inventoryName: item.warehouseName,
      unitName:     item.baseUnitName,
      quantity:     item.quantity,
      sku:          item.sku,
      avgCost:      item.avgCost,
    })));
    onHide();
    setIsSubmit(false);
  };

  const isAllChecked   = lstVariants.length > 0 && listChecked.size === lstVariants.length;
  const isIndeterminate = listChecked.size > 0 && listChecked.size < lstVariants.length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Modal
      isFade isOpen={onShow} size="lg" isCentered staticBackdrop
      toggle={() => !isSubmit && onHide()}
      className="cpv-modal"
    >
      <div className="cpv-wrapper">
        <ModalHeader title={title} toggle={() => !isSubmit && onHide()} />

        <ModalBody>
          {/* Search */}
          <div className="cpv-search">
            <div className="cpv-search__input">
              <Icon name="Search" style={{ width: 16, opacity: 0.4 }} />
              <input
                className="cpv-search__field"
                placeholder="Tìm theo tên sản phẩm, SKU..."
                value={keywordInput}
                onChange={e => { setKeywordInput(e.target.value); setKeyword(e.target.value); }}
              />
              {keywordInput && (
                <button className="cpv-search__clear" onClick={() => { setKeywordInput(""); setKeyword(""); }}>
                  <Icon name="Times" style={{ width: 12 }} />
                </button>
              )}
            </div>

            {listChecked.size > 0 && (
              <div className="cpv-selected-bar">
                <span className="cpv-selected-bar__count">
                  Đã chọn <strong>{listChecked.size}</strong> sản phẩm
                </span>
                <Button color="primary" disabled={isSubmit} onClick={handleConfirm}>
                  Xác nhận chọn
                  {isSubmit && <Icon name="Loading" />}
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="cpv-table-wrapper">
            {isLoading ? (
              <Loading />
            ) : lstVariants.length > 0 ? (
              <>
                <table className="cpv-table">
                  <thead>
                    <tr>
                      <th className="cpv-col-check">
                        <Checkbox
                          checked={isAllChecked}
                          indeterminate={isIndeterminate}
                          onChange={e => toggleAll(e.target.checked)}
                        />
                      </th>
                      <th className="cpv-col-stt">STT</th>
                      <th className="cpv-col-avatar"></th>
                      <th>Sản phẩm / Biến thể</th>
                      <th className="cpv-col-sku">SKU</th>
                      <th className="cpv-col-right">Tồn kho</th>
                      <th className="cpv-col-unit">Đơn vị</th>
                      <th className="cpv-col-right">Giá vốn BQ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lstVariants.map((item, idx) => {
                      const checked = listChecked.has(item.inventoryBalanceId);
                      return (
                        <tr
                          key={item.inventoryBalanceId}
                          className={`cpv-row${checked ? " cpv-row--checked" : ""}`}
                          onClick={() => toggleOne(item)}
                        >
                          <td className="cpv-col-check" onClick={e => e.stopPropagation()}>
                            <Checkbox checked={checked} onChange={() => toggleOne(item)} />
                          </td>
                          <td className="cpv-col-stt">
                            {(pagination.page - 1) * (params.size ?? 20) + idx + 1}
                          </td>
                          <td className="cpv-col-avatar">
                            <div className="cpv-avatar">
                              <Image src={item.productAvatar} alt={item.productName} />
                            </div>
                          </td>
                          <td>
                            <div className="cpv-name">{item.productName}</div>
                            {item.variantLabel && (
                              <div className="cpv-variant">{item.variantLabel}</div>
                            )}
                          </td>
                          <td className="cpv-col-sku">
                            <span className="cpv-sku">{item.sku || "—"}</span>
                          </td>
                          <td className="cpv-col-right">
                            <span className={`cpv-qty${
                              item.quantity <= 0 ? " cpv-qty--zero"
                              : item.quantity <= 10 ? " cpv-qty--low" : ""
                            }`}>
                              {(item.quantity ?? 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="cpv-col-unit">{item.baseUnitName || "—"}</td>
                          <td className="cpv-col-right cpv-cost">
                            {item.avgCost > 0
                              ? `${item.avgCost.toLocaleString("vi-VN")}đ`
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination
                  name={pagination.name}
                  displayNumber={pagination.displayNumber}
                  page={pagination.page}
                  setPage={page => pagination.setPage(page)}
                  sizeLimit={pagination.sizeLimit}
                  totalItem={pagination.totalItem}
                  totalPage={pagination.totalPage}
                  isChooseSizeLimit={false}
                />
              </>
            ) : (
              <SystemNotification
                description={
                  <span>
                    {keyword
                      ? <>Không tìm thấy sản phẩm khớp với <strong>"{keyword}"</strong></>
                      : <><strong>{inventory?.label}</strong> chưa có sản phẩm nào trong kho.</>}
                  </span>
                }
                type={keyword ? "no-result" : "no-item"}
              />
            )}
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
}
