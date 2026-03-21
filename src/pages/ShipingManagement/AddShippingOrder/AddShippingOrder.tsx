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
import InvoiceService from "services/InvoiceService";
import ShippingService from "services/ShippingService";
import DepartmentService from "services/DepartmentService";
import { IDepartmentResponse } from "model/department/DepartmentResponseModel";
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
  // --- Người gửi ---
  senderEmployeeId: number | null;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderStreet: string;
  senderDistrict: string;
  senderWard: string;
  id?: number;
  partnerId: number | null;
  invoiceId: number | null;
  receiverName: string;
  receiverPhone: string;
  receiverStreet: string;   // Số nhà, tên đường
  receiverDistrict: string; // Quận / Huyện
  receiverWard: string;     // Phường / Xã
  weight: number | null;
  width: number | null;
  height: number | null;
  length: number | null;
  codAmount: number | null;
  note: string;
}

const DEFAULT_FORM: IFormState = {
  senderEmployeeId: null,
  senderName: "",
  senderPhone: "",
  senderEmail: "",
  senderStreet: "",
  senderDistrict: "",
  senderWard: "",
  partnerId: null,
  invoiceId: null,
  receiverName: "",
  receiverPhone: "",
  receiverStreet: "",
  receiverDistrict: "",
  receiverWard: "",
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

  // Sender picker state
  const [selectedSender, setSelectedSender] = useState<IDepartmentResponse | null>(null);

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
      const rawItems: any[] = response.result?.pagedLst?.items ?? [];

      const options = rawItems
        .map((item) => {
          const inv: IInvoiceResponse = item.invoice ?? item; 
          const id = item.invoiceId ?? inv.id;
          if (!id) return null;
          return {
            value:  id,
            label:  `${inv.invoiceCode} — ${inv.customerName} — ${inv.customerPhone}`,
            origin: { ...inv, id },
          };
        })
        .filter(Boolean);

      return { options, hasMore: false };
    }

    return { options: [], hasMore: false };
  };

  // ---- loadOptions Người gửi (DepartmentService) ----
  const loadSenderOptions = async (inputValue: string, _loadedOptions: any, { page }: { page: number }) => {
    const response = await DepartmentService.list({
      name: inputValue?.trim() ?? "",
      page,
      limit: 20,
    });

    if (response.code === 0) {
      const items: IDepartmentResponse[] = response.result?.items ?? response.result ?? [];
      return {
        options: items.map((item) => ({
          value:  item.id,
          label:  item.name,
          origin: item,
        })),
        hasMore: response.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }

    return { options: [], hasMore: false, additional: { page: page + 1 } };
  };

  // Khi chọn người gửi → fill name, phone, email vào form
  const applySenderToForm = (dept: IDepartmentResponse) => {
    const deptAny = dept as any;
    setSelectedSender(dept);
    setForm((prev) => ({
      ...prev,
      senderEmployeeId: dept.id,
      senderName:       deptAny.managerName    ?? deptAny.leaderName    ?? dept.name ?? "",
      senderPhone:      deptAny.managerPhone   ?? deptAny.leaderPhone   ?? deptAny.phone ?? "",
      senderEmail:      deptAny.managerEmail   ?? deptAny.leaderEmail   ?? deptAny.email ?? "",
      senderStreet:     deptAny.address        ?? deptAny.street        ?? "",
      senderDistrict:   deptAny.district       ?? "",
      senderWard:       deptAny.ward           ?? "",
    }));
    setErrors((prev) => ({
      ...prev,
      senderName: "", senderPhone: "", senderStreet: "", senderDistrict: "", senderWard: "",
    }));
  };

  const clearSender = () => {
    setSelectedSender(null);
    setForm((prev) => ({
      ...prev,
      senderEmployeeId: null,
      senderName:       "",
      senderPhone:      "",
      senderEmail:      "",
      senderStreet:     "",
      senderDistrict:   "",
      senderWard:       "",
    }));
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
    const invAny = inv as any;
    setSelectedInvoice(inv);
    setForm((prev) => ({
      ...prev,
      invoiceId:        inv.id,
      receiverName:     inv.customerName,
      receiverPhone:    inv.customerPhone,
      receiverStreet:   inv.customerAddress ?? "",
      receiverDistrict: invAny.customerDistrict ?? invAny.district ?? "",
      receiverWard:     invAny.customerWard     ?? invAny.ward     ?? "",
      codAmount: (inv.amountCard ?? 0) > 0 ? inv.amountCard : inv.amount,
    }));
    setErrors({});
  };

  const clearSelectedInvoice = () => {
    setSelectedInvoice(null);
    setForm((prev) => ({
      ...prev,
      invoiceId:        undefined,
      receiverName:     "",
      receiverPhone:    "",
      receiverStreet:   "",
      receiverDistrict: "",
      receiverWard:     "",
      codAmount:        null,
    }));
  };

  const loadShippingDetail = async (orderId: number) => {
    // setIsLoadingPage(true);
    // try {
    //   const res = await ShippingService.detail(orderId);
    //   if (res.code === 0) {
    //     const found: IShippingOrderResponse = res.result;
    //     setOriginData(found);
    //     setForm({
    //       id:               found.id,
    //       partnerId:        found.partnerId,
    //       invoiceId:        found.salesOrderId,
    //       receiverName:     found.receiverName,
    //       receiverPhone:    found.receiverPhone?.replace(/\*/g, "0"),
    //       receiverStreet:   found.receiverAddress ?? "",
    //       receiverDistrict: (found as any).receiverDistrict ?? "",
    //       receiverWard:     (found as any).receiverWard     ?? "",
    //       weight:           found.weightGram    ?? null,
    //       width:            found.widthCm       ?? null,
    //       height:           found.heightCm      ?? null,
    //       length:           found.lengthCm      ?? null,
    //       codAmount:        found.codAmount      ?? null,
    //       note:             found.noteForShipper ?? "",
    //     });
    //   } else {
    //     showToast(res.message ?? "Không thể tải thông tin đơn vận chuyển", "error");
    //   }
    // } catch {
    //   showToast("Lỗi kết nối khi tải đơn vận chuyển", "error");
    // } finally {
    //   setIsLoadingPage(false);
    // }
  };

  const setField = (field: string) => (e: any) => {
    const value = e?.target !== undefined ? e.target.value : e?.value ?? e;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.partnerId)                 errs.partnerId        = "Vui lòng chọn hãng vận chuyển";
    if (!form.receiverName?.trim())      errs.receiverName     = "Vui lòng nhập tên người nhận";
    if (!form.receiverPhone?.trim())     errs.receiverPhone    = "Vui lòng nhập số điện thoại";
    if (!form.receiverStreet?.trim())    errs.receiverStreet   = "Vui lòng nhập địa chỉ (số nhà, đường)";
    if (!form.receiverDistrict?.trim())  errs.receiverDistrict = "Vui lòng nhập quận / huyện";
    if (!form.receiverWard?.trim())      errs.receiverWard     = "Vui lòng nhập phường / xã";
    if (!form.weight || +form.weight <= 0) errs.weight         = "Vui lòng nhập trọng lượng";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      if (isEdit) {
        const res = await ShippingService.create({ ...form as any });
        if (res.code === 0) {
          showToast("Cập nhật đơn vận chuyển thành công", "success");
          navigate("/shipping");
        } else {
          showToast(res.message ?? "Cập nhật đơn thất bại", "error");
        }
        return;
      }

      // ---- Build payload theo API /logistics/shipment/create ----
      const rawProducts = selectedInvoice?._products ?? [];

      // Tổng số lượng sản phẩm để chia đều weight nếu cần
      const totalQty = rawProducts.reduce((sum, p) => sum + (p.qty ?? 1), 0) || 1;
      const totalWeightGram = form.weight ? +form.weight : 0;

      const items = rawProducts.length > 0
        ? rawProducts.map((p) => ({
            name:        p.name,
            quantity:    p.qty ?? 1,
            // Ưu tiên weightGram từ product, fallback chia đều tổng weight
            weightGram:  (p as any).weightGram
                           ? +(p as any).weightGram
                           : Math.round(totalWeightGram / totalQty),
            price:       p.price ?? 0,
          }))
        : selectedInvoice
          ? [{
              name:       selectedInvoice.invoiceCode,
              quantity:   1,
              weightGram: totalWeightGram,
              price:      selectedInvoice.amount ?? 0,
            }]
          : [];

      // ward / district / province từ form (user đã nhập trực tiếp)
      const receiverWard     = form.receiverWard     ?? "";
      const receiverDistrict = form.receiverDistrict ?? "";
      const receiverProvince = (selectedInvoice as any)?.customerProvince ?? (selectedInvoice as any)?.province ?? "";

      const payload: IShipmentCreatePayload = {
        internalOrderId:  selectedInvoice?.invoiceCode ?? String(form.invoiceId ?? ""),
        carrierCode:      CARRIER_CODE_MAP[form.partnerId] ?? "",
        sender: {
          name:     form.senderName     ?? "",
          phone:    form.senderPhone    ?? "",
          email:    form.senderEmail    ?? "",
          address:  form.senderStreet   ?? "",
          ward:     form.senderWard     ?? "",
          district: form.senderDistrict ?? "",
          province: "",
        },
        receiver: {
          name:     form.receiverName    ?? "",
          phone:    form.receiverPhone   ?? "",
          email:    "",
          address:  form.receiverStreet  ?? "",
          ward:     receiverWard,
          district: receiverDistrict,
          province: receiverProvince,
        },
        parcel: {
          weightGram: totalWeightGram,
          lengthCm:   form.length ? +form.length : 1,
          widthCm:    form.width  ? +form.width  : 1,
          heightCm:   form.height ? +form.height : 1,
        },
        codAmount:         form.codAmount ? +form.codAmount : 0,
        declaredValue:     selectedInvoice?.amount ?? 0,
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
                            </div>
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
            {/* {isEdit && originData?.salesOrderCode && (
              <div className="autofill-banner">
                <Icon name="CheckCircle" />
                <span>
                  Đã liên kết với hóa đơn&nbsp;
                  <strong>{originData.salesOrderCode}</strong>
                </span>
              </div>
            )} */}

            {/* Card: Thông tin người gửi */}
            <div className="form-card">
              <div className="form-card__title">
                <Icon name="UserCheck" />
                Thông tin người gửi
                {selectedSender && (
                  <span className="autofill-badge">
                    <Icon name="Zap" /> Tự động điền
                  </span>
                )}
              </div>
              <div className="form-card__body">

                {/* AsyncPaginate chọn người gửi từ danh sách phòng ban / nhân viên */}
                <div className={`base-select base-select-fill has-label${selectedSender ? " has-value" : ""}`}>
                  <div style={{ display: "flex" }}>
                    <label htmlFor="senderId">Chọn người gửi</label>
                  </div>
                  <AsyncPaginate
                    inputId="senderId"
                    placeholder="Tìm theo tên phòng ban / nhân viên..."
                    className="select-custom select__custom-label"
                    isSearchable
                    isClearable
                    debounceTimeout={400}
                    defaultOptions
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    loadOptions={loadSenderOptions}
                    additional={{ page: 1 }}
                    value={
                      selectedSender
                        ? { 
                            value: selectedSender.id, 
                            label: selectedSender.managerName 
                          }
                        : null
                    }
                    onChange={(option: any) => {
                      if (!option) { clearSender(); return; }
                      applySenderToForm(option.origin);
                    }}
                    noOptionsMessage={({ inputValue }) =>
                      inputValue ? "Không tìm thấy kết quả phù hợp" : "Nhập để tìm kiếm"
                    }
                    loadingMessage={() => "Đang tải..."}
                    formatOptionLabel={(option: any) =>
                      option?.origin ? (
                        <div className="invoice-option">
                          <div className="invoice-option__top">
                            <span className="invoice-option__code">{option.origin.managerName}</span>
                          </div>
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

                {/* Các trường fill sau khi chọn người gửi */}
                <div className="form-row-2">
                  <div>
                    <Input
                      name="senderName"
                      label="Tên người gửi"
                      fill
                      value={form.senderName}
                      onChange={setField("senderName")}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.senderName && <span className="field-error">{errors.senderName}</span>}
                  </div>
                  <div>
                    <Input
                      name="senderPhone"
                      label="Số điện thoại"
                      fill
                      value={form.senderPhone}
                      onChange={setField("senderPhone")}
                      placeholder="09xxxxxxxx"
                    />
                    {errors.senderPhone && <span className="field-error">{errors.senderPhone}</span>}
                  </div>
                </div>
                <div>
                  <Input
                    name="senderEmail"
                    label="Email"
                    fill
                    value={form.senderEmail}
                    onChange={setField("senderEmail")}
                    placeholder="example@company.com"
                  />
                </div>
                <div>
                  <Input
                    name="senderStreet"
                    label="Số nhà, tên đường"
                    fill
                    value={form.senderStreet}
                    onChange={setField("senderStreet")}
                    placeholder="VD: 123 Nguyễn Trãi"
                  />
                  {errors.senderStreet && <span className="field-error">{errors.senderStreet}</span>}
                </div>
                <div className="form-row-2">
                  <div>
                    <Input
                      name="senderDistrict"
                      label="Quận / Huyện"
                      fill
                      value={form.senderDistrict}
                      onChange={setField("senderDistrict")}
                      placeholder="VD: Quận 1"
                    />
                    {errors.senderDistrict && <span className="field-error">{errors.senderDistrict}</span>}
                  </div>
                  <div>
                    <Input
                      name="senderWard"
                      label="Phường / Xã"
                      fill
                      value={form.senderWard}
                      onChange={setField("senderWard")}
                      placeholder="VD: Phường Bến Nghé"
                    />
                    {errors.senderWard && <span className="field-error">{errors.senderWard}</span>}
                  </div>
                </div>
              </div>
            </div>

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
                  label="Chọn hãng vận chuyển"
                  required
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
                      label="Tên người nhận"
                      required
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
                        label="Số điện thoại"
                        required
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
                    name="receiverStreet"
                    label="Số nhà, tên đường"
                    required
                    fill
                    value={form.receiverStreet}
                    onChange={setField("receiverStreet")}
                    placeholder="VD: 123 Nguyễn Trãi"
                  />
                  {errors.receiverStreet && <span className="field-error">{errors.receiverStreet}</span>}
                </div>
                <div className="form-row-2">
                  <div>
                    <Input
                      name="receiverDistrict"
                      label="Quận / Huyện"
                      required
                      fill
                      value={form.receiverDistrict}
                      onChange={setField("receiverDistrict")}
                      placeholder="VD: Quận 1"
                    />
                    {errors.receiverDistrict && <span className="field-error">{errors.receiverDistrict}</span>}
                  </div>
                  <div>
                    <Input
                      name="receiverWard"
                      label="Phường / Xã"
                      required
                      fill
                      value={form.receiverWard}
                      onChange={setField("receiverWard")}
                      placeholder="VD: Phường Bến Nghé"
                    />
                    {errors.receiverWard && <span className="field-error">{errors.receiverWard}</span>}
                  </div>
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
                      label="Trọng lượng (gram)"
                      required
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
                form.partnerId && form.receiverName && form.receiverPhone && form.receiverStreet && form.weight
                  ? "ready" : "not-ready"
              }`}>
                <span className="readiness-dot" />
                <span className="readiness-label">
                  {form.partnerId && form.receiverName && form.receiverPhone && form.receiverStreet && form.weight
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