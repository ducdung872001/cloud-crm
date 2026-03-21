import React, { Fragment, useEffect, useMemo, useState } from "react";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction from "components/titleAction/titleAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { SystemNotification } from "components/systemNotification/systemNotification";
import SelectCustom from "components/selectCustom/selectCustom";
import { IAction } from "model/OtherModel";
import { IInvoiceCreateResponse, IInvoiceDetailResponse } from "model/invoice/InvoiceResponse";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import InvoiceService from "services/InvoiceService";
import ProductImportService from "services/ProductImportService";
import AddProductImportModal from "./partials/AddProductImportModal/AddProductImportModal";
import PaymentImportInvoices from "./PaymentImportInvoices";
import "./CreateReceipt.scss";

const DEFAULT_INVOICE: IInvoiceCreateResponse = {
  id: 0,
  amount: 0,
  discount: 0,
  fee: 0,
  paid: 0,
  debt: 0,
  paymentType: 1,
  vatAmount: 0,
  receiptDate: "",
  inventoryId: null,
  invoiceType: "IV4",
  status: 2,
};

type InvoiceStatusFilter = "all" | 2 | 1 | 3;
type InvoiceOption = {
  value: number;
  label: string;
  receiptDate?: string;
  status?: number;
};

const getInvoiceFromResponse = (response: any): IInvoiceCreateResponse | null => {
  const result = response?.result ?? response?.data ?? null;
  if (!result) return null;
  return (result.invoice ?? result) as IInvoiceCreateResponse;
};

const getImportedProductsFromResponse = (response: any): IInvoiceDetailResponse[] => {
  const result = response?.result ?? response?.data ?? null;
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.importedProducts)) return result.importedProducts;
  if (Array.isArray(result?.productImports)) return result.productImports;
  if (Array.isArray(result?.details)) return result.details;
  if (Array.isArray(result?.items)) return result.items;
  return [];
};

export default function CreateReceipt() {
  document.title = "Tạo phiếu nhập kho";

  const [invoiceId, setInvoiceId] = useState<number>(null);
  const [invoiceInfo, setInvoiceInfo] = useState<IInvoiceCreateResponse>({ ...DEFAULT_INVOICE });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listInvoiceDetail, setListInvoiceDetail] = useState<IInvoiceDetailResponse[]>([]);
  const [dataInvoiceDetail, setDataInvoiceDetail] = useState<IInvoiceDetailResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [invoiceOptions, setInvoiceOptions] = useState<InvoiceOption[]>([]);
  const [isLoadingInvoiceOptions, setIsLoadingInvoiceOptions] = useState<boolean>(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<InvoiceStatusFilter>("all");

  const isPendingInvoice = invoiceInfo?.status === 2;

  const syncInvoiceTotals = (invoice: IInvoiceCreateResponse, items: IInvoiceDetailResponse[]) => {
    const amount = (items || []).reduce((total, item) => total + (item.mainCost || 0) * (item.quantity || 0), 0);
    return {
      ...DEFAULT_INVOICE,
      ...invoice,
      id: invoice?.id ?? 0,
      amount,
      fee: amount - (invoice?.discount || 0),
      debt: invoice?.debt ?? Math.max(amount - (invoice?.discount || 0) - (invoice?.paid || 0), 0),
      paid: invoice?.paid ?? 0,
      status: invoice?.status ?? 2,
      invoiceType: invoice?.invoiceType ?? "IV4",
    };
  };

  const loadInvoiceMeta = async (id: number) => {
    const response = await InvoiceService.importGet(id);
    if (response.code !== 0) {
      showToast(response.message ?? "Không lấy được thông tin phiếu nhập", "error");
      return null;
    }
    const invoice = getInvoiceFromResponse(response);
    if (!invoice) {
      showToast("Không lấy được dữ liệu phiếu nhập", "error");
      return null;
    }
    return { invoice };
  };

  const loadInvoiceItems = async (id: number) => {
    const response = await ProductImportService.list(id);
    if (response.code !== 0) {
      showToast(response.message ?? "Không lấy được danh sách sản phẩm nhập", "error");
      return [] as IInvoiceDetailResponse[];
    }
    return getImportedProductsFromResponse(response);
  };

  const reloadInvoiceContext = async (id: number) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [payload, items] = await Promise.all([loadInvoiceMeta(id), loadInvoiceItems(id)]);
      if (!payload?.invoice) return;
      setInvoiceId(payload.invoice.id);
      setListInvoiceDetail(items || []);
      setInvoiceInfo(syncInvoiceTotals(payload.invoice, items || []));
    } finally {
      setIsLoading(false);
    }
  };

  const resetCurrentInvoice = () => {
    setInvoiceId(null);
    setInvoiceInfo({ ...DEFAULT_INVOICE });
    setListInvoiceDetail([]);
    setDataInvoiceDetail(null);
    setListIdChecked([]);
  };

  const loadInvoiceOptions = async () => {
    setIsLoadingInvoiceOptions(true);
    try {
      const response = await InvoiceService.importList({
        invoiceType: "IV4",
        limit: 100,
        page: 1,
        ...(invoiceStatusFilter !== "all" ? { status: invoiceStatusFilter } : {}),
        ...(invoiceInfo?.inventoryId ? { inventoryId: invoiceInfo.inventoryId } : {}),
      });
      if (response.code !== 0) {
        showToast(response.message ?? "Không lấy được danh sách phiếu nhập", "error");
        return;
      }
      const result = response?.result;
      const items = Array.isArray(result)
        ? result
        : Array.isArray(result?.items)
          ? result.items
          : Array.isArray(result?.pagedLst?.items)
            ? result.pagedLst.items
            : [];
      setInvoiceOptions(
        items.map((item: any) => ({
          value: item.id,
          label: item.invoiceCode || `#${item.id}`,
          receiptDate: item.receiptDate,
          status: item.status,
        }))
      );
    } finally {
      setIsLoadingInvoiceOptions(false);
    }
  };

  useEffect(() => {
    loadInvoiceOptions();
  }, [invoiceStatusFilter, invoiceInfo?.inventoryId]);

  const handleInvoiceCreated = async (invoice: IInvoiceCreateResponse) => {
    const nextId = invoice?.id ?? 0;
    if (!nextId) return;
    await loadInvoiceOptions();
    await reloadInvoiceContext(nextId);
  };

  const handleInvoiceApproved = async (invoice: IInvoiceCreateResponse) => {
    const nextId = invoice?.id ?? invoiceId;
    if (!nextId) return;
    await loadInvoiceOptions();
    await reloadInvoiceContext(nextId);
  };

  const handleInventoryChanged = (inventoryId: number) => {
    setInvoiceInfo((prev) => ({ ...prev, inventoryId }));
  };

  const dataCreate = useMemo(
    () => syncInvoiceTotals(invoiceInfo, listInvoiceDetail),
    [invoiceInfo, listInvoiceDetail]
  );

  // ── ✅ Cột bảng — thêm "Biến thể / SKU" ──────────────────────────────────
  const titles = [
    "STT",
    "Tên sản phẩm / Biến thể",   // ← đổi tên cột
    "Số lô",
    "Ngày sản xuất",
    "Ngày hết hạn",
    "Đơn vị tính",
    "Số lượng",
    "Giá nhập",
    "Thành tiền",
  ];
  const dataFormat = [
    "text-center",
    "",
    "text-right",
    "text-center",
    "text-center",
    "text-center",
    "text-right",
    "text-right",
    "text-right",
  ];

  // ── ✅ Mapping — hiển thị tên sản phẩm + badge SKU/label biến thể ─────────
  const dataMappingArray = (item: IInvoiceDetailResponse, index: number) => [
    index + 1,

    // Cột "Tên sản phẩm / Biến thể": tên sản phẩm + badge SKU variant
    <div className="product-import-cell" key={item.id}>
      <span className="product-import-cell__name">{item.productName}</span>
      {(item.variantSku || item.variantLabel) && (
        <div className="product-import-cell__variant">
          {item.variantSku && (
            <span className="product-import-cell__sku">{item.variantSku}</span>
          )}
          {item.variantLabel && (
            <span className="product-import-cell__label">{item.variantLabel}</span>
          )}
        </div>
      )}
    </div>,

    item.batchNo,
    item.mfgDate ? moment(item.mfgDate).format("DD/MM/YYYY") : "",
    item.expiryDate ? moment(item.expiryDate).format("DD/MM/YYYY") : "",
    item.unitName,
    item.quantity,
    formatCurrency(item.mainCost),
    formatCurrency((item.mainCost || 0) * (item.quantity || 0)),
  ];

  const openAddProductModal = () => {
    if (!invoiceId) {
      showToast("Hãy tạo phiếu nhập trước khi thêm sản phẩm", "warning");
      return;
    }
    if (!isPendingInvoice) {
      showToast("Chỉ được thêm sản phẩm khi phiếu đang ở trạng thái chờ duyệt", "warning");
      return;
    }
    setDataInvoiceDetail(null);
    setShowModalAdd(true);
  };

  const actionsTable = (item: IInvoiceDetailResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    const isLocked = !isPendingInvoice;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem || isLocked ? "icon-disabled" : ""} />,
        disabled: isCheckedItem || isLocked,
        callback: () => {
          if (!isCheckedItem && !isLocked) {
            setDataInvoiceDetail(item);
            setShowModalAdd(true);
          }
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem || isLocked ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem || isLocked,
        callback: () => {
          if (!isCheckedItem && !isLocked) {
            showDialogConfirmDelete(item);
          }
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await ProductImportService.delete(id);
    if (response.code === 0) {
      showToast("Xóa sản phẩm thành công", "success");
      if (invoiceId) await reloadInvoiceContext(invoiceId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllProductImportService = async () => {
    const responses = await Promise.all((listIdChecked || []).map((id) => ProductImportService.delete(id)));
    const hasSuccess = responses.some((item) => item?.code === 0);
    if (hasSuccess) {
      showToast("Xóa sản phẩm thành công", "success");
      if (invoiceId) await reloadInvoiceContext(invoiceId);
      setListIdChecked([]);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IInvoiceDetailResponse) => {
    const content: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "sản phẩm " : `${listIdChecked.length} sản phẩm đã chọn`}
          {item ? <strong>{item.productName}{item.variantLabel ? ` · ${item.variantLabel}` : ""}</strong> : ""}?
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => {
        if (listIdChecked.length > 0) {
          onDeleteAllProductImportService();
        } else if (item?.id) {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(content);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    { title: "Xóa sản phẩm", callback: () => showDialogConfirmDelete() },
  ];

  return (
    <div className="page-content page__create--invoice">
      <TitleAction title="Tạo phiếu nhập kho" />
      <div className="wrapper__product--import">
        <div className="card-box d-flex flex-column">
          <div className="create-receipt__invoice-picker">
            <div className="create-receipt__invoice-filter-row">
              <div className="create-receipt__invoice-filter">
                {[
                  { value: "all" as const, label: "Tất cả" },
                  { value: 2 as const, label: "Chờ duyệt" },
                  { value: 1 as const, label: "Đã duyệt" },
                  { value: 3 as const, label: "Đã hủy" },
                ].map((item) => (
                  <button
                    key={String(item.value)}
                    type="button"
                    className={`create-receipt__invoice-filter-btn${invoiceStatusFilter === item.value ? " active" : ""}`}
                    onClick={() => setInvoiceStatusFilter(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="create-receipt__invoice-select">
                <SelectCustom
                  fill={true}
                  name="invoicePicker"
                  className="create-receipt__invoice-select-control"
                  options={invoiceOptions}
                  value={invoiceId}
                  onMenuOpen={loadInvoiceOptions}
                  onChange={async (option) => {
                    const nextId = option?.value ?? null;
                    if (!nextId) { resetCurrentInvoice(); return; }
                    await reloadInvoiceContext(nextId);
                  }}
                  placeholder="Chọn phiếu nhập để thao tác"
                  isSearchable
                  isClearable
                  isLoading={isLoadingInvoiceOptions}
                  isFormatOptionLabel
                  formatOptionLabel={(option: any, meta: any) =>
                    meta.context === "value" ? (
                      <div className="create-receipt__invoice-value">{option.label}</div>
                    ) : (
                      <div className="create-receipt__invoice-option">
                        <div className="create-receipt__invoice-option-title">{option.label}</div>
                        <div className="create-receipt__invoice-option-meta">
                          <span>{option.receiptDate ? moment(option.receiptDate).format("DD/MM/YYYY") : "Chưa có ngày"}</span>
                          <span
                            className={`create-receipt__invoice-option-status status-${
                              option.status === 1 ? "approved" : option.status === 3 ? "cancelled" : "pending"
                            }`}
                          >
                            {option.status === 1 ? "Đã duyệt" : option.status === 3 ? "Đã hủy" : "Chờ duyệt"}
                          </span>
                        </div>
                      </div>
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="action__header">
            <ul className="action__header--title">
              <li className="active">Thông tin sản phẩm cần nhập</li>
            </ul>
            <div className="add__product">
              <Button color="primary" disabled={!invoiceId || !isPendingInvoice} onClick={openAddProductModal}>
                Thêm sản phẩm
              </Button>
            </div>
          </div>

          {invoiceId ? (
            <div className="create-receipt__invoice-summary">
              <strong>Mã phiếu:</strong> {invoiceInfo?.invoiceCode || `#${invoiceId}`}{" "}
              <span className={`badge ms-2 ${invoiceInfo?.status === 1 ? "bg" : "ba"}`}>
                {invoiceInfo?.status === 1 ? "Đã hoàn thành" : "Chờ duyệt"}
              </span>
            </div>
          ) : null}

          {!isLoading && listInvoiceDetail.length > 0 ? (
            <BoxTable
              name="Sản phẩm"
              titles={titles}
              items={listInvoiceDetail}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              isBulkAction={isPendingInvoice}
              bulkActionItems={bulkActionList}
              listIdChecked={listIdChecked}
              striped={true}
              setListIdChecked={(listId) => setListIdChecked(listId)}
              actions={actionsTable}
              actionType="inline"
            />
          ) : isLoading ? (
            <Loading />
          ) : (
            <SystemNotification
              description={
                <span>
                  {invoiceId ? (
                    <>
                      Phiếu nhập đã được tạo nhưng chưa có dòng hàng nào. <br />
                      Hãy thêm sản phẩm vào phiếu nhập này.
                    </>
                  ) : (
                    <>
                      Hãy tạo phiếu nhập kho trước, sau đó thêm sản phẩm vào phiếu. <br />
                      Luồng này sẽ giữ phiếu ở trạng thái chờ duyệt cho đến khi bạn bấm duyệt.
                    </>
                  )}
                </span>
              }
              type="no-item"
              titleButton={invoiceId ? "Thêm sản phẩm cần nhập" : "Tạo phiếu nhập ở panel bên phải"}
              action={invoiceId ? openAddProductModal : undefined}
            />
          )}
        </div>

        <AddProductImportModal
          invoiceId={invoiceId}
          onShow={showModalAdd}
          data={dataInvoiceDetail}
          onHide={async (reload) => {
            if (reload && invoiceId) await reloadInvoiceContext(invoiceId);
            setShowModalAdd(false);
          }}
        />

        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>

      <PaymentImportInvoices
        data={dataCreate}
        listInvoiceDetail={listInvoiceDetail}
        onInvoiceCreated={handleInvoiceCreated}
        onInvoiceApproved={handleInvoiceApproved}
        onInventoryChanged={handleInventoryChanged}
      />
    </div>
  );
}