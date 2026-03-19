import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import { AsyncPaginate } from "react-select-async-paginate";
import Loading from "components/loading";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import { IShippingOrderResponse } from "model/shipping/ShippingResponseModel";
import { IInvoiceFilterRequest , IShipmentCreatePayload } from "model/invoice/InvoiceRequestModel";
import { IInvoiceResponse, IProductInvoiceServiceResponse, ICardInvoiceServiceResponse } from "model/invoice/InvoiceResponse";
import { MOCK_SHIPPING_ORDERS } from "../ShippingMockData";
import InvoiceService from "services/InvoiceService";
import ShippingService from "services/ShippingService";
import "./AddShippingOrder.scss";
interface ISelectedInvoice extends IInvoiceResponse {
  productSummary: string;
  _products?: IProductInvoiceServiceResponse[]; // lưu để build items khi submit
}

const PARTNER_OPTIONS = [
  { value: 1, label: "GHTK" },
  { value: 2, label: "Viettel Post" },
  { value: 3, label: "GHN" },
];

// Map partnerId → carrierCode gửi lên API
const CARRIER_CODE_MAP: Record<number, string> = {
  1: "GHTK",
  2: "VTP",
  3: "GHN",
};

// Form state nội bộ — tách riêng khỏi API payload
interface IFormState {
  id?: number;
  partnerId: number | null;
  invoiceId: number | null;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number | null;
  width: number | null;
  height: number | null;
  length: number | null;
  codAmount: number | null;
  note: string;
}

const DEFAULT_FORM: IFormState = {
  partnerId: null,
  invoiceId: null,
  receiverName: "",
  receiverPhone: "",
  receiverAddress: "",
  weight: null,
  width: null,
  height: null,
  length: null,
  codAmount: null,
  note: "",
};

export default function AddShippingOrder() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  // invoiceId truyền từ màn khác qua query param ?invoiceId=xxx
  const invoiceIdFromParam = searchParams.get("invoiceId");

  const isEdit = !!id;
  document.title = isEdit ? "Chỉnh sửa đơn vận chuyển" : "Tạo đơn vận chuyển mới";

  const [form, setForm]             = useState<IFormState>(DEFAULT_FORM);
  const [originData, setOriginData] = useState<IShippingOrderResponse | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  // Invoice picker state
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ISelectedInvoice | null>(null);

  // ---- loadOptions cho AsyncPaginate ----
  // Khi inputValue rỗng → load trang đầu để hiện sẵn dữ liệu (dùng với defaultOptions={true})
  // Khi user gõ → lọc theo invoiceCode / keyword
  const loadInvoiceOptions = async (inputValue: string) => {
    const filterParams: IInvoiceFilterRequest = {
      invoiceTypes: JSON.stringify(["IV1", "IV2", "IV3", "IV4", "IV5D"]),
      page:  1,
      limit: 20,
      ...(inputValue?.trim() ? { invoiceCode: inputValue.trim() } : {}),
    };

    const response = await InvoiceService.list(filterParams);

    if (response.code === 0) {
      const items: IInvoiceResponse[] = response.result?.pagedLst?.items ?? [];
      return {
        options: items.map((item) => ({
          value:  item.id,
          label:  `${item.invoiceCode} — ${item.customerName} — ${item.customerPhone}`,
          origin: item,
        })),
        hasMore: false,
      };
    }

    return { options: [], hasMore: false };
  };

  // ---- Khởi tạo ----
  useEffect(() => {
    if (isEdit && id) {
      loadShippingDetail(+id);
    } else if (invoiceIdFromParam) {
      loadInvoiceDetailAndApply(+invoiceIdFromParam);
    }
  }, [id, invoiceIdFromParam]); // eslint-disable-line

  // ---- Gọi invoiceDetail để lấy productSummary, fill form ngay từ invoiceBasic ----
  const loadInvoiceDetailAndApply = async (
    invoiceId: number,
    invoiceBasic?: IInvoiceResponse
  ) => {
    // Fill form ngay lập tức từ data đã có trong option — không chờ API detail
    if (invoiceBasic) {
      applyInvoiceToForm({ ...invoiceBasic, id: invoiceId, productSummary: "" });
    }

    // Gọi detail để lấy thêm productSummary (danh sách sản phẩm)
    setIsLoadingDetail(true);
    const response = await InvoiceService.listInvoiceDetail(invoiceId);

    if (response.code === 0) {
      const detail = response.result ?? {};

      const products: IProductInvoiceServiceResponse[] = detail.products ?? [];
      const services: ICardInvoiceServiceResponse[]    = detail.services ?? [];

      const productNames: string[] = [
        ...products.map((p) => `${p.name} × ${p.qty}`),
        ...services.map((s) => `${s.serviceName} × ${s.qty}`),
      ];
      const productSummary =
        productNames.slice(0, 4).join(", ") +
        (productNames.length > 4 ? ` +${productNames.length - 4} khác` : "");

      // API mới: invoiceId nằm ở result.invoiceId (ngoài result.invoice)
      // Ưu tiên: result.invoice → merge với invoiceBasic để giữ lại field không-null
      const invFromApi: IInvoiceResponse = detail.invoice ?? null;
      const resolvedId: number = detail.invoiceId ?? invoiceId;

      // Merge: invoiceBasic từ list thường có customerName/Phone đầy đủ hơn
      // nếu detail trả null thì fallback về invoiceBasic
      const inv = {
        ...(invoiceBasic ?? {}),
        ...(invFromApi ?? {}),
        id:              resolvedId,
        customerName:    invFromApi?.customerName    ?? invoiceBasic?.customerName    ?? "",
        customerPhone:   invFromApi?.customerPhone   ?? invoiceBasic?.customerPhone   ?? "",
        customerAddress: invFromApi?.customerAddress ?? invoiceBasic?.customerAddress ?? "",
        amount:          invFromApi?.amount          ?? invoiceBasic?.amount          ?? 0,
        amountCard:      invFromApi?.amountCard      ?? invoiceBasic?.amountCard      ?? 0,
        invoiceCode:     invFromApi?.invoiceCode     ?? invoiceBasic?.invoiceCode     ?? "",
      } as IInvoiceResponse;

      applyInvoiceToForm({ ...inv, productSummary, _products: products } as any);
    } else {
      showToast(response.message ?? "Không thể tải thông tin hóa đơn", "error");
    }

    setIsLoadingDetail(false);
  };

  const applyInvoiceToForm = (inv: ISelectedInvoice) => {
    setSelectedInvoice(inv);
    setForm((prev) => ({
      ...prev,
      invoiceId:       inv.id,
      receiverName:    inv.customerName,
      receiverPhone:   inv.customerPhone,
      receiverAddress: inv.customerAddress,
      codAmount: (inv.amountCard ?? 0) > 0 ? inv.amountCard : inv.amount,
    }));
    setErrors({});
  };

  const clearSelectedInvoice = () => {
    setSelectedInvoice(null);
    setForm((prev) => ({
      ...prev,
      invoiceId:       undefined,
      receiverName:    "",
      receiverPhone:   "",
      receiverAddress: "",
      codAmount:       null,
    }));
  };

  // ---- Load shipping detail (edit mode) ----
  const loadShippingDetail = async (orderId: number) => {
    setIsLoadingPage(true);
    await new Promise((r) => setTimeout(r, 300));
    // TODO: const res = await ShippingService.detail(orderId);
    const found = MOCK_SHIPPING_ORDERS.find((o) => o.id === orderId);
    if (found) {
      setOriginData(found);
      setForm({
        id:              found.id,
        partnerId:       found.partnerId,
        invoiceId:       found.salesOrderId,
        receiverName:    found.receiverName,
        receiverPhone:   found.receiverPhone?.replace(/\*/g, "0"),
        receiverAddress: found.receiverAddress,
        weight:          found.weight,
        width:           found.width  ?? null,
        height:          found.height ?? null,
        length:          found.length ?? null,
        codAmount:       found.codAmount ?? null,
        note:            found.note ?? "",
      });
    }
    setIsLoadingPage(false);
  };

  const setField = (field: string) => (e: any) => {
    const value = e?.target !== undefined ? e.target.value : e?.value ?? e;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.partnerId)               errs.partnerId       = "Vui lòng chọn hãng vận chuyển";
    if (!form.receiverName?.trim())    errs.receiverName    = "Vui lòng nhập tên người nhận";
    if (!form.receiverPhone?.trim())   errs.receiverPhone   = "Vui lòng nhập số điện thoại";
    if (!form.receiverAddress?.trim()) errs.receiverAddress = "Vui lòng nhập địa chỉ giao hàng";
    if (!form.weight || +form.weight <= 0) errs.weight      = "Vui lòng nhập trọng lượng";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      if (isEdit) {
        // TODO: await ShippingService.update(form)
        showToast("Cập nhật đơn vận chuyển thành công", "success");
        navigate("/shipping");
        return;
      }

      // ---- Build payload theo API /logistics/shipment/create ----
      const rawProducts = selectedInvoice?._products ?? [];
      const items = rawProducts.length > 0
        ? rawProducts.map((p) => ({
            name:        p.name,
            quantity:    p.qty,
            weightGram:  0,
            price:       p.price ?? 0,
          }))
        : selectedInvoice
          ? [{ name: selectedInvoice.invoiceCode, quantity: 1, weightGram: form.weight ? +form.weight : 0, price: selectedInvoice.amount ?? 0 }]
          : [];

      const payload: IShipmentCreatePayload = {
        internalOrderId:  selectedInvoice?.invoiceCode ?? String(form.invoiceId ?? ""),
        carrierCode:      CARRIER_CODE_MAP[form.partnerId] ?? "",
        sender: {
          // Thông tin người gửi — lấy từ branch config (để trống, BE tự điền theo branchId)
          name:     "",
          phone:    "",
          email:    "",
          address:  "",
          ward:     "",
          district: "",
          province: "",
        },
        receiver: {
          name:     form.receiverName     ?? "",
          phone:    form.receiverPhone    ?? "",
          email:    "",
          address:  form.receiverAddress  ?? "",
          ward:     "",
          district: "",
          province: "",
        },
        parcel: {
          weightGram: form.weight  ? +form.weight  : 0,
          lengthCm:   form.length  ? +form.length  : 1,
          widthCm:    form.width   ? +form.width   : 1,
          heightCm:   form.height  ? +form.height  : 1,
        },
        codAmount:        form.codAmount       ? +form.codAmount       : 0,
        declaredValue:    selectedInvoice?.amount ?? 0,
        shippingFeeBearer: "RECEIVER",
        items,
        note: form.note ?? "",
      };

      const response = await ShippingService.create(payload as any);

      if (response.code === 0) {
        showToast("Tạo đơn vận chuyển thành công", "success");
        navigate("/shipping");
      } else {
        showToast(response.message ?? "Tạo đơn thất bại", "error");
      }
    } catch (err) {
      showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const titleActions: ITitleActions = {
    actions: [
      {
        title: isEdit ? "Cập nhật đơn" : "Đẩy qua Hãng Vận Chuyển",
        callback: handleSubmit,
      },
    ],
    actions_extra: [],
  };

  if (isLoadingPage) return <div className="page-content"><Loading /></div>;

  return (
    <Fragment>
      <div className="page-content page-add-shipping">

        <TitleAction
          title={isEdit ? "Chỉnh sửa đơn vận chuyển" : "Tạo Đơn Vận Chuyển Mới"}
          titleActions={titleActions}
        />

        <div className="add-shipping-layout">

          {/* ========== CỘT TRÁI ========== */}
          <div className="add-shipping-main">

            {/* ---- Card: Liên kết hóa đơn (chỉ hiện khi tạo mới) ---- */}
            {!isEdit && (
              <div className="form-card">
                <div className="form-card__title">
                  <Icon name="FileText" />
                  Liên kết hóa đơn
                </div>
                <div className="form-card__body">

                  {/* AsyncPaginate trực tiếp — search theo mã HD / tên / SĐT */}
                  <div className={`base-select base-select-fill has-label${selectedInvoice ? " has-value" : ""}`}>
                    <div style={{ display: "flex" }}>
                      <label htmlFor="invoiceId">Chọn hóa đơn</label>
                    </div>
                    <AsyncPaginate
                      inputId="invoiceId"
                      placeholder="Tìm mã hóa đơn, tên hoặc SĐT khách..."
                      className="select-custom select__custom-label"
                      isSearchable
                      isClearable
                      debounceTimeout={400}
                      defaultOptions
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      loadOptions={loadInvoiceOptions}
                      value={
                        selectedInvoice
                          ? {
                              value:  selectedInvoice.id,
                              label:  `${selectedInvoice.invoiceCode}`,
                            }
                          : null
                      }
                      onChange={(option: any) => {
                        if (!option) {
                          clearSelectedInvoice();
                          return;
                        }
                        loadInvoiceDetailAndApply(option.value, option.origin);
                      }}
                      noOptionsMessage={({ inputValue }) =>
                        inputValue ? "Không tìm thấy hóa đơn phù hợp" : "Nhập để tìm kiếm"
                      }
                      loadingMessage={() => "Đang tải..."}
                      formatOptionLabel={(option: any) =>
                        option?.origin ? (
                          <div className="invoice-option">
                            <div className="invoice-option__top">
                              <span className="invoice-option__code">{option.origin.invoiceCode}</span>
                              <span className="invoice-option__amount">{formatCurrency(option.origin.amount)} đ</span>
                            </div>
                            <div className="invoice-option__mid">
                              <span className="invoice-option__name">{option.origin.customerName}</span>
                              <span className="invoice-option__dot">·</span>
                              <span className="invoice-option__phone">{option.origin.customerPhone}</span>
                              {(option.origin.amountCard ?? 0) > 0 && (
                                <>
                                  <span className="invoice-option__dot">·</span>
                                  <span className="invoice-option__cod">
                                    COD: {formatCurrency(option.origin.amountCard)} đ
                                  </span>
                                </>
                              )}
                            </div>
                            {option.origin.customerAddress && (
                              <div className="invoice-option__addr">{option.origin.customerAddress}</div>
                            )}
                          </div>
                        ) : (
                          <span>{option?.label}</span>
                        )
                      }
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary:   "#015aa4",
                          primary25: "#e9eaeb",
                          primary50: "#e9eaeb",
                          neutral0:  "#ffffff",
                          neutral70: "#015aa4",
                        },
                      })}
                    />
                  </div>

                  {/* Loading detail */}
                  {isLoadingDetail && (
                    <div className="invoice-loading">
                      <Loading />
                      <span>Đang tải thông tin hóa đơn...</span>
                    </div>
                  )}

                  {/* Info card sau khi chọn */}
                  {selectedInvoice && (
                    <div className="invoice-info-card">
                      <div className="invoice-info-card__code-row">
                        <Icon name="FileText" />
                        <strong>{selectedInvoice.invoiceCode}</strong>
                        {isLoadingDetail && <span className="invoice-info-card__loading-badge">Đang tải...</span>}
                      </div>
                      <div className="invoice-info-card__row">
                        <Icon name="User" />
                        <span>{selectedInvoice.customerName || "—"}</span>
                        <span className="invoice-divider">·</span>
                        <Icon name="Phone" />
                        <span>{selectedInvoice.customerPhone || "—"}</span>
                      </div>
                      {selectedInvoice.customerAddress && (
                        <div className="invoice-info-card__row">
                          <Icon name="MapPin" />
                          <span>{selectedInvoice.customerAddress}</span>
                        </div>
                      )}
                      {selectedInvoice.productSummary && (
                        <div className="invoice-info-card__row">
                          <Icon name="ShoppingBag" />
                          <span>{selectedInvoice.productSummary}</span>
                        </div>
                      )}
                      <div className="invoice-info-card__footer">
                        <div className="invoice-info-card__amount">
                          <span>Tổng tiền</span>
                          <strong>{formatCurrency(selectedInvoice.amount ?? 0)} đ</strong>
                        </div>
                        {(selectedInvoice.amountCard ?? 0) > 0 && (
                          <div className="invoice-info-card__cod">
                            <Icon name="Banknote" />
                            <span>COD:&nbsp;</span>
                            <strong>{formatCurrency(selectedInvoice.amountCard ?? 0)} đ</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Banner edit mode */}
            {isEdit && originData?.salesOrderCode && (
              <div className="autofill-banner">
                <Icon name="CheckCircle" />
                <span>
                  Đã liên kết với hóa đơn&nbsp;
                  <strong>{originData.salesOrderCode}</strong>
                </span>
              </div>
            )}

            {/* Card: Hãng vận chuyển */}
            <div className="form-card">
              <div className="form-card__title">
                <Icon name="Send" />
                Hãng vận chuyển
              </div>
              <div className="form-card__body">
                <SelectCustom
                  id="partnerId"
                  name="partnerId"
                  label="Chọn hãng vận chuyển *"
                  options={PARTNER_OPTIONS}
                  fill
                  value={form.partnerId}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, partnerId: e.value }));
                    setErrors((prev) => ({ ...prev, partnerId: "" }));
                  }}
                  placeholder="Chọn hãng..."
                />
                {errors.partnerId && <span className="field-error">{errors.partnerId}</span>}
              </div>
            </div>

            {/* Card: Thông tin người nhận */}
            <div className="form-card">
              <div className="form-card__title">
                <Icon name="User" />
                Thông tin người nhận
                {selectedInvoice && (
                  <span className="autofill-badge">
                    <Icon name="Zap" /> Tự động điền
                  </span>
                )}
              </div>
              <div className="form-card__body">
                <div className="form-row-2">
                  <div>
                    <Input
                      name="receiverName"
                      label="Tên người nhận *"
                      fill
                      value={form.receiverName}
                      onChange={setField("receiverName")}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.receiverName && <span className="field-error">{errors.receiverName}</span>}
                  </div>
                  <div>
                    <div className="input-verified-wrap">
                      <Input
                        name="receiverPhone"
                        label="Số điện thoại *"
                        fill
                        value={form.receiverPhone}
                        onChange={setField("receiverPhone")}
                        placeholder="09xxxxxxxx"
                      />
                      {(form.receiverPhone?.length >= 10 && !errors.receiverPhone) && (
                        <span className="verified-icon"><Icon name="CheckCircle" /></span>
                      )}
                    </div>
                    {errors.receiverPhone && <span className="field-error">{errors.receiverPhone}</span>}
                  </div>
                </div>
                <div>
                  <Input
                    name="receiverAddress"
                    label="Địa chỉ giao hàng *"
                    fill
                    value={form.receiverAddress}
                    onChange={setField("receiverAddress")}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  />
                  {errors.receiverAddress && <span className="field-error">{errors.receiverAddress}</span>}
                </div>
              </div>
            </div>

            {/* Card: Chi tiết hàng hóa */}
            <div className="form-card">
              <div className="form-card__title">
                <Icon name="Package" />
                Chi tiết hàng hóa
              </div>
              <div className="form-card__body">
                <div className="form-row-2">
                  <div>
                    <Input
                      name="weight"
                      label="Trọng lượng (gram) *"
                      fill
                      type="number"
                      value={form.weight ?? ""}
                      onChange={setField("weight")}
                      placeholder="500"
                    />
                    {errors.weight && <span className="field-error">{errors.weight}</span>}
                  </div>
                  <Input
                    name="dimensions"
                    label="Kích thước - D × R × C (cm)"
                    fill
                    value={
                      form.length || form.width || form.height
                        ? `${form.length ?? 0} x ${form.width ?? 0} x ${form.height ?? 0}`
                        : ""
                    }
                    onChange={(e) => {
                      const parts = e.target.value.split("x").map((s) => s.trim());
                      setForm((prev) => ({
                        ...prev,
                        length: parts[0] ? +parts[0] : null,
                        width:  parts[1] ? +parts[1] : null,
                        height: parts[2] ? +parts[2] : null,
                      }));
                    }}
                    placeholder="20 x 15 x 10"
                  />
                </div>
                <Input
                  name="note"
                  label="Ghi chú cho shipper"
                  fill
                  value={form.note}
                  onChange={setField("note")}
                  placeholder="Gọi trước khi giao, hàng dễ vỡ..."
                />
              </div>
            </div>
          </div>

          {/* ========== CỘT PHẢI ========== */}
          <div className="add-shipping-side">

            {/* Card: COD */}
            <div className="form-card">
              <div className="form-card__title">
                <Icon name="Banknote" />
                Tiền thu hộ (COD)
                {/* {selectedInvoice && (
                  <span className="autofill-badge">
                    <Icon name="Zap" /> Tự động điền
                  </span>
                )} */}
              </div>
              <div className="form-card__body">
                <Input
                  name="codAmount"
                  label="Số tiền thu hộ"
                  fill
                  type="number"
                  value={form.codAmount ?? ""}
                  onChange={setField("codAmount")}
                  placeholder="0"
                />
                {form.codAmount > 0 && (
                  <div className="cod-preview">
                    <span className="cod-preview__label">Sẽ thu hộ</span>
                    <span className="cod-preview__value">{formatCurrency(+form.codAmount)} đ</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Action */}
            <div className="form-card action-card">
              <div className={`readiness-indicator ${
                form.partnerId && form.receiverName && form.receiverPhone && form.weight
                  ? "ready" : "not-ready"
              }`}>
                <span className="readiness-dot" />
                <span className="readiness-label">
                  {form.partnerId && form.receiverName && form.receiverPhone && form.weight
                    ? "Đã điền đủ thông tin, sẵn sàng đẩy đơn"
                    : "Vui lòng điền đủ thông tin bắt buộc (*)"}
                </span>
              </div>

              <button
                className="btn-push-order"
                disabled={isLoading || isLoadingDetail}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <span className="btn-push-order__loading">Đang xử lý...</span>
                ) : (
                  <>
                    <Icon name="Send" />
                    {isEdit ? "Cập nhật đơn" : "Đẩy qua Hãng Vận Chuyển"}
                  </>
                )}
              </button>

              <button
                className="btn-back-link"
                onClick={() => navigate("/shipping")}
              >
                <Icon name="ArrowLeft" />
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}