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
import { IShippingOrderResponse, IProvince, IDistrict, IWard, ISelectedInvoice } from "model/shipping/ShippingResponseModel";
import { IShippingFormState } from "model/shipping/ShippingRequestModel";
import { IInvoiceFilterRequest, IShipmentCreatePayload } from "model/invoice/InvoiceRequestModel";
import { IInvoiceResponse, IProductInvoiceServiceResponse, ICardInvoiceServiceResponse } from "model/invoice/InvoiceResponse";
import InvoiceService from "services/InvoiceService";
import ShippingService from "services/ShippingService";
import DepartmentService from "services/DepartmentService";
import { IDepartmentResponse } from "model/department/DepartmentResponseModel";
import "./AddShippingOrder.scss";

function useAddressOptions() {
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<{ value: number; label: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ value: number; label: string } | null>(null);
  const [selectedWard, setSelectedWard] = useState<{ value: string; label: string } | null>(null);

  // Load tỉnh khi mount
  useEffect(() => {
    setLoadingProvinces(true);
    ShippingService.provinces()
      .then((data) => {
        if (data.code === 0) setProvinces(data.result ?? []);
      })
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Load quận khi chọn tỉnh
  const onProvinceChange = (opt: { value: number; label: string } | null) => {
    setSelectedProvince(opt);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    if (!opt) return;
    setLoadingDistricts(true);
    ShippingService.districts(opt.value)
      .then((data) => {
        if (data.code === 0) setDistricts(data.result ?? []);
      })
      .finally(() => setLoadingDistricts(false));
  };

  // Load phường khi chọn quận
  const onDistrictChange = (opt: { value: number; label: string } | null) => {
    setSelectedDistrict(opt);
    setSelectedWard(null);
    setWards([]);
    if (!opt) return;
    setLoadingWards(true);
    ShippingService.wards(opt.value)
      .then((data) => {
        if (data.code === 0) setWards(data.result ?? []);
      })
      .finally(() => setLoadingWards(false));
  };

  const onWardChange = (opt: { value: string; label: string } | null) => {
    setSelectedWard(opt);
  };

  const provinceOptions = provinces.map((p) => ({ value: p.ProvinceID, label: p.ProvinceName }));
  const districtOptions = districts.map((d) => ({ value: d.DistrictID, label: d.DistrictName }));
  const wardOptions = wards.map((w) => ({ value: w.WardCode, label: w.WardName }));

  // Set giá trị từ ngoài vào (khi edit hoặc autofill từ hóa đơn / chi nhánh)
  const setValuesByName = (provinceName: string, districtName: string, wardName: string) => {
    const foundProv = provinces.find((p) =>
      p.ProvinceName?.toLowerCase().includes(provinceName?.toLowerCase())
    );
    if (!foundProv) return;
    setSelectedProvince({ value: foundProv.ProvinceID, label: foundProv.ProvinceName });
    ShippingService.districts(foundProv.ProvinceID)
      .then((data) => {
        const list: IDistrict[] = data.result ?? [];
        setDistricts(list);
        const foundDist = list.find((d) =>
          d.DistrictName?.toLowerCase().includes(districtName?.toLowerCase())
        );
        if (!foundDist) return;
        setSelectedDistrict({ value: foundDist.DistrictID, label: foundDist.DistrictName });
        ShippingService.wards(foundDist.DistrictID)
          .then((data2) => {
            const wardList: IWard[] = data2.result ?? [];
            setWards(wardList);
            const foundWard = wardList.find((w) =>
              w.WardName?.toLowerCase().includes(wardName?.toLowerCase())
            );
            if (foundWard) {
              setSelectedWard({ value: foundWard.WardCode, label: foundWard.WardName });
            }
          })
      })
  };

  const reset = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
  };

  return {
    provinceOptions, districtOptions, wardOptions,
    selectedProvince, selectedDistrict, selectedWard,
    loadingProvinces, loadingDistricts, loadingWards,
    onProvinceChange, onDistrictChange, onWardChange,
    setValuesByName, reset,
  };
}

const PARTNER_OPTIONS = [
  { value: 1, label: "GHTK" },
  { value: 2, label: "Viettel Post" },
  { value: 3, label: "GHN" },
];

const CARRIER_CODE_MAP: Record<number, string> = {
  1: "GHTK",
  2: "VTP",
  3: "GHN",
};

// IShippingFormState được import từ model/shipping/ShippingRequestModel

const DEFAULT_FORM: IShippingFormState = {
  senderEmployeeId: null,
  senderName: "",
  senderPhone: "",
  senderEmail: "",
  senderStreet: "",
  senderProvinceId: null,
  senderProvinceName: "",
  senderDistrictId: null,
  senderDistrict: "",
  senderWardCode: "",
  senderWard: "",
  partnerId: null,
  invoiceId: null,
  receiverName: "",
  receiverPhone: "",
  receiverStreet: "",
  receiverProvinceId: null,
  receiverProvinceName: "",
  receiverDistrictId: null,
  receiverDistrict: "",
  receiverWardCode: "",
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
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  const invoiceIdFromParam = searchParams.get("invoiceId");
  const isEdit = !!id;
  document.title = isEdit ? "Chỉnh sửa đơn vận chuyển" : "Tạo đơn vận chuyển mới";

  const [form, setForm] = useState<IShippingFormState>(DEFAULT_FORM);
  const [originData, setOriginData] = useState<IShippingOrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedSender, setSelectedSender] = useState<IDepartmentResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ISelectedInvoice | null>(null);

  // ---- Address hooks ----
  const senderAddr = useAddressOptions();
  const receiverAddr = useAddressOptions();

  // ---- Sync address selections vào form ----
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      senderProvinceId: senderAddr.selectedProvince?.value ?? null,
      senderProvinceName: senderAddr.selectedProvince?.label ?? "",
      senderDistrictId: senderAddr.selectedDistrict?.value ?? null,
      senderDistrict: senderAddr.selectedDistrict?.label ?? "",
      senderWardCode: senderAddr.selectedWard?.value ?? "",
      senderWard: senderAddr.selectedWard?.label ?? "",
    }));
    if (senderAddr.selectedDistrict) setErrors((p) => ({ ...p, senderDistrict: "" }));
    if (senderAddr.selectedWard) setErrors((p) => ({ ...p, senderWard: "" }));
  }, [senderAddr.selectedProvince, senderAddr.selectedDistrict, senderAddr.selectedWard]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      receiverProvinceId: receiverAddr.selectedProvince?.value ?? null,
      receiverProvinceName: receiverAddr.selectedProvince?.label ?? "",
      receiverDistrictId: receiverAddr.selectedDistrict?.value ?? null,
      receiverDistrict: receiverAddr.selectedDistrict?.label ?? "",
      receiverWardCode: receiverAddr.selectedWard?.value ?? "",
      receiverWard: receiverAddr.selectedWard?.label ?? "",
    }));
    if (receiverAddr.selectedDistrict) setErrors((p) => ({ ...p, receiverDistrict: "" }));
    if (receiverAddr.selectedWard) setErrors((p) => ({ ...p, receiverWard: "" }));
  }, [receiverAddr.selectedProvince, receiverAddr.selectedDistrict, receiverAddr.selectedWard]);

  // ---- loadOptions Invoice ----
  const loadInvoiceOptions = async (inputValue: string) => {
    const filterParams: IInvoiceFilterRequest = {
      invoiceTypes: JSON.stringify(["IV1", "IV2", "IV3", "IV4", "IV5D"]),
      page: 1,
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
            value: id,
            label: `${inv.invoiceCode ?? ""}${inv.customerName ? " — " + inv.customerName : ""}${inv.customerPhone ? " — " + inv.customerPhone : ""}`,
            origin: { ...inv, id },
          };
        })
        .filter(Boolean);
      return { options, hasMore: false };
    }
    return { options: [], hasMore: false };
  };

  // ---- loadOptions Người gửi ----
  const loadSenderOptions = async (inputValue: string, _loadedOptions: any, { page }: { page: number }) => {
    const response = await DepartmentService.list({ name: inputValue?.trim() ?? "", page, limit: 20 });
    if (response.code === 0) {
      const items: IDepartmentResponse[] = response.result?.items ?? response.result ?? [];
      return {
        options: items.map((item) => ({ value: item.id, label: item.name, origin: item })),
        hasMore: response.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false, additional: { page: page + 1 } };
  };

  const applySenderToForm = (dept: IDepartmentResponse) => {
    const deptAny = dept as any;
    setSelectedSender(dept);
    setForm((prev) => ({
      ...prev,
      senderEmployeeId: dept.id,
      senderName: deptAny.managerName ?? deptAny.leaderName ?? dept.name ?? "",
      senderPhone: deptAny.managerPhone ?? deptAny.leaderPhone ?? deptAny.phone ?? "",
      senderEmail: deptAny.managerEmail ?? deptAny.leaderEmail ?? deptAny.email ?? "",
      senderStreet: deptAny.address ?? deptAny.street ?? "",
    }));
    setErrors((prev) => ({
      ...prev,
      senderName: "", senderPhone: "", senderStreet: "", senderDistrict: "", senderWard: "",
    }));
    // Auto-fill địa chỉ nếu có
    const province = deptAny.province ?? deptAny.provinceName ?? "";
    const district = deptAny.district ?? deptAny.districtName ?? "";
    const ward = deptAny.ward ?? deptAny.wardName ?? "";
    if (province || district) {
      senderAddr.setValuesByName(province, district, ward);
    }
  };

  const clearSender = () => {
    setSelectedSender(null);
    setForm((prev) => ({
      ...prev,
      senderEmployeeId: null,
      senderName: "", senderPhone: "", senderEmail: "", senderStreet: "",
      senderProvinceId: null, senderProvinceName: "",
      senderDistrictId: null, senderDistrict: "",
      senderWardCode: "", senderWard: "",
    }));
    senderAddr.reset();
  };

  // ---- Khởi tạo ----
  useEffect(() => {
    if (isEdit && id) {
      loadShippingDetail(+id);
    } else if (invoiceIdFromParam) {
      loadInvoiceDetailAndApply(+invoiceIdFromParam);
    }
  }, [id, invoiceIdFromParam]); // eslint-disable-line

  const loadInvoiceDetailAndApply = async (invoiceId: number, invoiceBasic?: IInvoiceResponse) => {
    if (invoiceBasic) {
      applyInvoiceToForm({ ...invoiceBasic, id: invoiceId, productSummary: "" });
    }
    setIsLoadingDetail(true);
    const response = await InvoiceService.listInvoiceDetail(invoiceId);
    if (response.code === 0) {
      const detail = response.result ?? {};
      const products: IProductInvoiceServiceResponse[] = detail.products ?? [];
      const services: ICardInvoiceServiceResponse[] = detail.services ?? [];
      const productNames: string[] = [
        ...products.map((p) => `${p.name} × ${p.qty}`),
        ...services.map((s) => `${s.serviceName} × ${s.qty}`),
      ];
      const productSummary =
        productNames.slice(0, 4).join(", ") + (productNames.length > 4 ? ` +${productNames.length - 4} khác` : "");
      const invFromApi: IInvoiceResponse = detail.invoice ?? null;
      const resolvedId: number = detail.invoiceId ?? invoiceId;
      const inv = {
        ...(invoiceBasic ?? {}),
        ...(invFromApi ?? {}),
        id: resolvedId,
        customerName: invFromApi?.customerName ?? invoiceBasic?.customerName ?? "",
        customerPhone: invFromApi?.customerPhone ?? invoiceBasic?.customerPhone ?? "",
        customerAddress: invFromApi?.customerAddress ?? invoiceBasic?.customerAddress ?? "",
        amount: invFromApi?.amount ?? invoiceBasic?.amount ?? 0,
        amountCard: invFromApi?.amountCard ?? invoiceBasic?.amountCard ?? 0,
        invoiceCode: invFromApi?.invoiceCode ?? invoiceBasic?.invoiceCode ?? "",
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
      invoiceId: inv.id,
      receiverName: inv.customerName,
      receiverPhone: inv.customerPhone,
      receiverStreet: inv.customerAddress ?? "",
      codAmount: (inv.amountCard ?? 0) > 0 ? inv.amountCard : inv.amount,
    }));
    // Auto-fill địa chỉ người nhận
    const province = invAny.customerProvince ?? invAny.province ?? "";
    const district = invAny.customerDistrict ?? invAny.district ?? "";
    const ward = invAny.customerWard ?? invAny.ward ?? "";
    if (province || district) {
      receiverAddr.setValuesByName(province, district, ward);
    }
    setErrors({});
  };

  const clearSelectedInvoice = () => {
    setSelectedInvoice(null);
    setForm((prev) => ({
      ...prev,
      invoiceId: undefined,
      receiverName: "", receiverPhone: "", receiverStreet: "",
      receiverProvinceId: null, receiverProvinceName: "",
      receiverDistrictId: null, receiverDistrict: "",
      receiverWardCode: "", receiverWard: "",
      codAmount: null,
    }));
    receiverAddr.reset();
  };

  const loadShippingDetail = async (_orderId: number) => {
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
    if (!form.partnerId) errs.partnerId = "Vui lòng chọn hãng vận chuyển";
    if (!form.receiverName?.trim()) errs.receiverName = "Vui lòng nhập tên người nhận";
    if (!form.receiverPhone?.trim()) errs.receiverPhone = "Vui lòng nhập số điện thoại";
    if (!form.receiverStreet?.trim()) errs.receiverStreet = "Vui lòng nhập địa chỉ (số nhà, đường)";
    if (!form.receiverDistrict?.trim()) errs.receiverDistrict = "Vui lòng chọn quận / huyện";
    if (!form.receiverWard?.trim()) errs.receiverWard = "Vui lòng chọn phường / xã";
    if (!form.weight || +form.weight <= 0) errs.weight = "Vui lòng nhập trọng lượng";
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

      const rawProducts = selectedInvoice?._products ?? [];
      const totalQty = rawProducts.reduce((sum, p) => sum + (p.qty ?? 1), 0) || 1;
      const totalWeightGram = form.weight ? +form.weight : 0;

      const items = rawProducts.length > 0
        ? rawProducts.map((p) => ({
            name: p.name,
            quantity: p.qty ?? 1,
            weightGram: (p as any).weightGram
              ? +(p as any).weightGram
              : Math.round(totalWeightGram / totalQty),
            price: p.price ?? 0,
          }))
        : selectedInvoice
          ? [{ name: selectedInvoice.invoiceCode, quantity: 1, weightGram: totalWeightGram, price: selectedInvoice.amount ?? 0 }]
          : [];

      const payload: IShipmentCreatePayload = {
        internalOrderId: selectedInvoice?.invoiceCode ?? String(form.invoiceId ?? ""),
        carrierCode: CARRIER_CODE_MAP[form.partnerId] ?? "",
        sender: {
          name: form.senderName ?? "",
          phone: form.senderPhone ?? "",
          email: form.senderEmail ?? "",
          address: form.senderStreet ?? "",
          ward: form.senderWard ?? "",
          district: form.senderDistrict ?? "",
          province: form.senderProvinceName ?? "",
        },
        receiver: {
          name: form.receiverName ?? "",
          phone: form.receiverPhone ?? "",
          email: "",
          address: form.receiverStreet ?? "",
          ward: form.receiverWard ?? "",
          district: form.receiverDistrict ?? "",
          province: form.receiverProvinceName ?? "",
        },
        parcel: {
          weightGram: totalWeightGram,
          lengthCm: form.length ? +form.length : 1,
          widthCm: form.width ? +form.width : 1,
          heightCm: form.height ? +form.height : 1,
        },
        codAmount: form.codAmount ? +form.codAmount : 0,
        declaredValue: selectedInvoice?.amount ?? 0,
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
    actions: [{ title: isEdit ? "Cập nhật đơn" : "Đẩy qua Hãng Vận Chuyển", callback: handleSubmit }],
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

            {/* Card: Liên kết hóa đơn */}
            {!isEdit && (
              <div className="form-card">
                <div className="form-card__title">
                  <Icon name="FileText" />
                  Liên kết hóa đơn
                </div>
                <div className="form-card__body">
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
                          ? { value: selectedInvoice.id, label: `${selectedInvoice.invoiceCode} — ${selectedInvoice.customerName}` }
                          : null
                      }
                      onChange={(opt: any) => {
                        if (!opt) { clearSelectedInvoice(); return; }
                        loadInvoiceDetailAndApply(opt.value, opt.origin);
                      }}
                    />
                  </div>

                  {isLoadingDetail && (
                    <div className="invoice-loading">
                      <Loading />
                      <span>Đang tải thông tin hóa đơn...</span>
                    </div>
                  )}

                  {selectedInvoice && !isLoadingDetail && (
                    <div className="invoice-info-card">
                      <div className="invoice-info-card__code-row">
                        <Icon name="FileText" />
                        <strong>{selectedInvoice.invoiceCode}</strong>
                        <button
                          onClick={clearSelectedInvoice}
                          style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.2rem" }}
                        >
                          <Icon name="X" />
                        </button>
                      </div>
                      <div className="invoice-info-card__row">
                        <Icon name="User" />
                        <span>{selectedInvoice.customerName}</span>
                        <span className="invoice-divider">·</span>
                        <span>{selectedInvoice.customerPhone}</span>
                      </div>
                      {selectedInvoice.customerAddress && (
                        <div className="invoice-info-card__row">
                          <Icon name="MapPin" />
                          <span>{selectedInvoice.customerAddress}</span>
                        </div>
                      )}
                      <div className="invoice-info-card__footer">
                        <div className="invoice-info-card__amount">
                          <span>Giá trị đơn</span>
                          <strong>{formatCurrency(selectedInvoice.amount ?? 0)} đ</strong>
                        </div>
                        {(selectedInvoice.amountCard ?? 0) > 0 && (
                          <div className="invoice-info-card__cod">
                            <Icon name="CreditCard" />
                            COD: <strong>{formatCurrency(selectedInvoice.amountCard)} đ</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Card: Người gửi */}
            <div className="form-card">
              <div className="form-card__title">
                <Icon name="Building2" />
                Thông tin người gửi
              </div>
              <div className="form-card__body">
                {/* Chọn chi nhánh */}
                <div className={`base-select base-select-fill has-label${selectedSender ? " has-value" : ""}`}>
                  <div style={{ display: "flex" }}>
                    <label>Chọn chi nhánh / nhân viên gửi</label>
                  </div>
                  <AsyncPaginate
                    placeholder="Tìm chi nhánh..."
                    className="select-custom select__custom-label"
                    isSearchable
                    isClearable
                    debounceTimeout={350}
                    defaultOptions
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    loadOptions={loadSenderOptions}
                    additional={{ page: 1 }}
                    value={selectedSender ? { value: selectedSender.id, label: selectedSender.name } : null}
                    onChange={(opt: any) => {
                      if (!opt) { clearSender(); return; }
                      applySenderToForm(opt.origin);
                    }}
                  />
                </div>

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
                  </div>
                </div>

                <Input
                  name="senderStreet"
                  label="Số nhà, tên đường"
                  fill
                  value={form.senderStreet}
                  onChange={setField("senderStreet")}
                  placeholder="VD: 123 Nguyễn Trãi"
                />

                {/* Địa chỉ người gửi — cascading dropdown */}
                <div className="form-row-3">
                  {/* Tỉnh / Thành phố */}
                  <div className="base-select base-select-fill has-label">
                    <label>Tỉnh / Thành phố</label>
                    <AsyncPaginate
                      placeholder={senderAddr.loadingProvinces ? "Đang tải..." : "Chọn tỉnh / TP..."}
                      className="select-custom select__custom-label"
                      isSearchable
                      isClearable
                      isDisabled={senderAddr.loadingProvinces}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      value={senderAddr.selectedProvince}
                      loadOptions={async (q) => ({
                        options: senderAddr.provinceOptions.filter((o) =>
                          o.label.toLowerCase().includes(q.toLowerCase())
                        ),
                        hasMore: false,
                      })}
                      defaultOptions={senderAddr.provinceOptions}
                      onChange={(opt: any) => senderAddr.onProvinceChange(opt)}
                    />
                  </div>

                  {/* Quận / Huyện */}
                  <div className="base-select base-select-fill has-label">
                    <label>Quận / Huyện</label>
                    <AsyncPaginate
                      placeholder={
                        !senderAddr.selectedProvince ? "Chọn tỉnh trước"
                        : senderAddr.loadingDistricts ? "Đang tải..."
                        : "Chọn quận / huyện..."
                      }
                      className="select-custom select__custom-label"
                      isSearchable
                      isClearable
                      isDisabled={!senderAddr.selectedProvince || senderAddr.loadingDistricts}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      key={`sender-district-${senderAddr.selectedProvince?.value ?? "none"}`}
                      value={senderAddr.selectedDistrict}
                      loadOptions={async (q) => ({
                        options: senderAddr.districtOptions.filter((o) =>
                          o.label.toLowerCase().includes(q.toLowerCase())
                        ),
                        hasMore: false,
                      })}
                      defaultOptions={senderAddr.districtOptions}
                      onChange={(opt: any) => senderAddr.onDistrictChange(opt)}
                    />
                  </div>

                  {/* Phường / Xã */}
                  <div className="base-select base-select-fill has-label">
                    <label>Phường / Xã</label>
                    <AsyncPaginate
                      placeholder={
                        !senderAddr.selectedDistrict ? "Chọn quận trước"
                        : senderAddr.loadingWards ? "Đang tải..."
                        : "Chọn phường / xã..."
                      }
                      className="select-custom select__custom-label"
                      isSearchable
                      isClearable
                      isDisabled={!senderAddr.selectedDistrict || senderAddr.loadingWards}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      key={`sender-ward-${senderAddr.selectedDistrict?.value ?? "none"}`}
                      value={senderAddr.selectedWard}
                      loadOptions={async (q) => ({
                        options: senderAddr.wardOptions.filter((o) =>
                          o.label.toLowerCase().includes(q.toLowerCase())
                        ),
                        hasMore: false,
                      })}
                      defaultOptions={senderAddr.wardOptions}
                      onChange={(opt: any) => senderAddr.onWardChange(opt)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Hãng vận chuyển */}
            <div className="form-card">
              <div className="form-card__title">
                <Icon name="Truck" />
                Hãng vận chuyển
              </div>
              <div className="form-card__body">
                <div>
                  <SelectCustom
                    label="Hãng vận chuyển"
                    required
                    fill
                    options={PARTNER_OPTIONS}
                    value={form.partnerId ? PARTNER_OPTIONS.find((o) => o.value === form.partnerId) : null}
                    onChange={(opt: any) => {
                      setForm((prev) => ({ ...prev, partnerId: opt?.value ?? null }));
                      setErrors((prev) => ({ ...prev, partnerId: "" }));
                    }}
                    placeholder="Chọn hãng..."
                  />
                  {errors.partnerId && <span className="field-error">{errors.partnerId}</span>}
                </div>
              </div>
            </div>

            {/* Card: Người nhận */}
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
                      {form.receiverPhone?.length >= 10 && !errors.receiverPhone && (
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

                {/* Địa chỉ người nhận — cascading dropdown */}
                <div className="form-row-3">
                  {/* Tỉnh / Thành phố */}
                  <div className="base-select base-select-fill has-label">
                    <label>Tỉnh / Thành phố</label>
                    <AsyncPaginate
                      placeholder={receiverAddr.loadingProvinces ? "Đang tải..." : "Chọn tỉnh / TP..."}
                      className="select-custom select__custom-label"
                      isSearchable
                      isClearable
                      isDisabled={receiverAddr.loadingProvinces}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      value={receiverAddr.selectedProvince}
                      loadOptions={async (q) => ({
                        options: receiverAddr.provinceOptions.filter((o) =>
                          o.label.toLowerCase().includes(q.toLowerCase())
                        ),
                        hasMore: false,
                      })}
                      defaultOptions={receiverAddr.provinceOptions}
                      onChange={(opt: any) => receiverAddr.onProvinceChange(opt)}
                    />
                  </div>

                  {/* Quận / Huyện */}
                  <div className="base-select base-select-fill has-label">
                    <label>Quận / Huyện <span style={{ color: "#ef4444" }}>*</span></label>
                    <AsyncPaginate
                      placeholder={
                        !receiverAddr.selectedProvince ? "Chọn tỉnh trước"
                        : receiverAddr.loadingDistricts ? "Đang tải..."
                        : "Chọn quận / huyện..."
                      }
                      className="select-custom select__custom-label"
                      isSearchable
                      isClearable
                      isDisabled={!receiverAddr.selectedProvince || receiverAddr.loadingDistricts}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      key={`receiver-district-${receiverAddr.selectedProvince?.value ?? "none"}`}
                      value={receiverAddr.selectedDistrict}
                      loadOptions={async (q) => ({
                        options: receiverAddr.districtOptions.filter((o) =>
                          o.label.toLowerCase().includes(q.toLowerCase())
                        ),
                        hasMore: false,
                      })}
                      defaultOptions={receiverAddr.districtOptions}
                      onChange={(opt: any) => receiverAddr.onDistrictChange(opt)}
                    />
                    {errors.receiverDistrict && <span className="field-error">{errors.receiverDistrict}</span>}
                  </div>

                  {/* Phường / Xã */}
                  <div className="base-select base-select-fill has-label">
                    <label>Phường / Xã <span style={{ color: "#ef4444" }}>*</span></label>
                    <AsyncPaginate
                      placeholder={
                        !receiverAddr.selectedDistrict ? "Chọn quận trước"
                        : receiverAddr.loadingWards ? "Đang tải..."
                        : "Chọn phường / xã..."
                      }
                      className="select-custom select__custom-label"
                      isSearchable
                      isClearable
                      isDisabled={!receiverAddr.selectedDistrict || receiverAddr.loadingWards}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      key={`receiver-ward-${receiverAddr.selectedDistrict?.value ?? "none"}`}
                      value={receiverAddr.selectedWard}
                      loadOptions={async (q) => ({
                        options: receiverAddr.wardOptions.filter((o) =>
                          o.label.toLowerCase().includes(q.toLowerCase())
                        ),
                        hasMore: false,
                      })}
                      defaultOptions={receiverAddr.wardOptions}
                      onChange={(opt: any) => receiverAddr.onWardChange(opt)}
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
                      const parts = e.target.value.split("x").map((s: string) => s.trim());
                      setForm((prev) => ({
                        ...prev,
                        length: parts[0] ? +parts[0] : null,
                        width: parts[1] ? +parts[1] : null,
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
                form.partnerId && form.receiverName && form.receiverPhone && form.receiverStreet && form.receiverDistrict && form.receiverWard && form.weight
                  ? "ready" : "not-ready"
              }`}>
                <span className="readiness-dot" />
                <span className="readiness-label">
                  {form.partnerId && form.receiverName && form.receiverPhone && form.receiverStreet && form.receiverDistrict && form.receiverWard && form.weight
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

              <button className="btn-back-link" onClick={() => navigate("/shipping")}>
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