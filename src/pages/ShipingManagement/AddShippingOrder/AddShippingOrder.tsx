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
import EmployeeService from "services/EmployeeService";
import { IEmployeeResponse } from "model/employee/EmployeeResponseModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import "./AddShippingOrder.scss";

function useAddressOptions() {
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true); // bắt đầu là true vì sẽ load ngay
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<{ value: number; label: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ value: number; label: string } | null>(null);
  const [selectedWard, setSelectedWard] = useState<{ value: string; label: string } | null>(null);

  // Dùng STATE thay vì ref để useEffect có thể detect thay đổi và trigger đúng
  const [pendingFill, setPendingFill] = useState<{ provinceName: string; districtName: string; wardName: string } | null>(null);

  // Load tỉnh khi mount
  useEffect(() => {
    setLoadingProvinces(true);
    ShippingService.provinces()
      .then((data) => {
        if (data.code === 0) setProvinces(data.result ?? []);
      })
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Khi provinces load xong VÀ có pending fill → apply
  // Dùng cả 2 dependencies để đảm bảo trigger dù thứ tự nào xảy ra trước
  useEffect(() => {
    if (provinces.length === 0 || !pendingFill) return;
    const { provinceName, districtName, wardName } = pendingFill;
    setPendingFill(null); // clear trước để tránh loop
    applyFill(provinces, provinceName, districtName, wardName);
  }, [provinces, pendingFill]); // eslint-disable-line

  // Tách logic fill ra hàm riêng để dùng lại
  const applyFill = (
    provList: IProvince[],
    provinceName: string,
    districtName: string,
    wardName: string
  ) => {
    const foundProv = provList.find((p) =>
      p.ProvinceName?.toLowerCase().includes(provinceName?.toLowerCase())
    );
    if (!foundProv) return;
    setSelectedProvince({ value: foundProv.ProvinceID, label: foundProv.ProvinceName });
    ShippingService.districts(foundProv.ProvinceID).then((data) => {
      const list: IDistrict[] = data.result ?? [];
      setDistricts(list);
      const foundDist = list.find((d) =>
        d.DistrictName?.toLowerCase().includes(districtName?.toLowerCase())
      );
      if (!foundDist) return;
      setSelectedDistrict({ value: foundDist.DistrictID, label: foundDist.DistrictName });
      ShippingService.wards(foundDist.DistrictID).then((data2) => {
        const wardList: IWard[] = data2.result ?? [];
        setWards(wardList);
        const foundWard = wardList.find((w) =>
          w.WardName?.toLowerCase().includes(wardName?.toLowerCase())
        );
        if (foundWard) {
          setSelectedWard({ value: foundWard.WardCode, label: foundWard.WardName });
        }
      });
    });
  };

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

  // Nếu provinces chưa có → queue (dùng setState để trigger useEffect)
  // Nếu đã có → apply ngay
  const setValuesByName = (provinceName: string, districtName: string, wardName: string) => {
    if (provinces.length === 0) {
      setPendingFill({ provinceName, districtName, wardName });
      return;
    }
    applyFill(provinces, provinceName, districtName, wardName);
  };

  const reset = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    setPendingFill(null);
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

const STATUS_OPTIONS = [
  { value: "SUBMITTED", label: "Chờ duyệt" },
  { value: "WAITING_PICKUP", label: "Chờ lấy hàng" },
  { value: "IN_TRANSIT", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "RETURNED", label: "Hoàn hàng" },
  { value: "CANCELLED", label: "Đã hủy" },
];

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
  receiverEmail: "",
  codAmount: null,
  note: "",
};

export default function AddShippingOrder() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  const invoiceIdFromParam = searchParams.get("invoiceId");
  const shipmentOrderFromParam = searchParams.get("shipmentOrder");
  const isEdit = !!shipmentOrderFromParam;
  document.title = isEdit ? "Chỉnh sửa đơn vận chuyển" : "Tạo đơn vận chuyển mới";

  const [form, setForm] = useState<IShippingFormState>(DEFAULT_FORM);
  const [originData, setOriginData] = useState<IShippingOrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedSender, setSelectedSender] = useState<IEmployeeResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ISelectedInvoice | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<{ value: string; label: string } | null>(null);

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
    const params: IEmployeeFilterRequest = { name: inputValue?.trim() ?? "", page, limit: 20 };
    const response = await EmployeeService.list(params);
    if (response.code === 0) {
      const items: IEmployeeResponse[] = response.result?.items ?? [];
      return {
        options: items.map((item) => ({
          value: item.id,
          label: `${item.name}${item.phone ? " — " + item.phone : ""}${item.branchName ? " | " + item.branchName : ""}`,
          origin: item,
        })),
        hasMore: response.result?.total > page * 20,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false, additional: { page: page + 1 } };
  };

  const applySenderToForm = (emp: IEmployeeResponse) => {
    setSelectedSender(emp);
    setForm((prev) => ({
      ...prev,
      senderEmployeeId: emp.id,
      senderName: emp.name ?? "",
      senderPhone: emp.phone ?? "",
      senderEmail: (emp as any).email ?? "",
      senderStreet: (emp as any).address ?? (emp as any).street ?? "",
    }));
    setErrors((prev) => ({
      ...prev,
      senderName: "", senderPhone: "", senderStreet: "", senderDistrict: "", senderWard: "",
    }));
    // Auto-fill địa chỉ nếu có
    const province = (emp as any).province ?? (emp as any).provinceName ?? "";
    const district = (emp as any).district ?? (emp as any).districtName ?? "";
    const ward = (emp as any).ward ?? (emp as any).wardName ?? "";
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
    if (isEdit && shipmentOrderFromParam) {
      loadShippingDetail(shipmentOrderFromParam);
    } else if (invoiceIdFromParam) {
      loadInvoiceDetailAndApply(+invoiceIdFromParam);
    }
  }, [shipmentOrderFromParam, invoiceIdFromParam]); // eslint-disable-line

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

  const loadShippingDetail = async (shipmentOrder: string) => {
    setIsLoadingPage(true);
    try {
      const res = await ShippingService.filter({ shipmentOrder, page: 1, limit: 1 });
      if (res.code === 0) {
        const items: IShippingOrderResponse[] = res.result?.items ?? [];
        const found: IShippingOrderResponse | undefined = items[0];
        if (!found) {
          showToast("Không tìm thấy đơn vận chuyển", "error");
          return;
        }
        setOriginData(found);

        // Set trạng thái hiện tại
        const currentStatus = (found as any).status ?? (found as any).statusCode ?? null;
        if (currentStatus) {
          const statusOpt = STATUS_OPTIONS.find((s) => s.value === currentStatus) ?? null;
          setSelectedStatus(statusOpt);
        }
        // API trả về carrierCode: "GHTK" | "VTP" | "GHN"
        const CARRIER_TO_PARTNER_ID: Record<string, number> = { GHTK: 1, VTP: 2, GHN: 3 };
        const resolvedPartnerId = (found as any).partnerId
          ?? CARRIER_TO_PARTNER_ID[(found as any).carrierCode ?? ""]
          ?? null;

        // API trả về receiverAddress dạng full string "18 Nguyễn Thị Minh Khai, Q.3, TP.HCM"
        // Tách lấy phần street (trước dấu phẩy đầu tiên) để hiển thị vào input địa chỉ chi tiết
        const parseStreet = (fullAddress: string): string => {
          if (!fullAddress) return "";
          const parts = fullAddress.split(",");
          return parts[0]?.trim() ?? fullAddress;
        };

        // codAmount: API trả về codAmount (COD thực thu = codAmount - orderSubtotalAmount)
        // Nếu có codAmount riêng dùng luôn, không thì fallback về codAmount
        const resolvedCod =
          (found as any).totalAmount != null
            ? (found as any).totalAmount
            : (found as any).totalAmount ?? null;

        setForm({
          ...DEFAULT_FORM,
          id:               found.id,
          partnerId:        resolvedPartnerId,
          invoiceId:        (found as any).salesOrderId ?? (found as any).orderId ?? null,

          // Người nhận — field names khớp API response
          receiverName:     found.receiverName     ?? "",
          receiverPhone:    found.receiverPhone?.replace(/\*/g, "0") ?? "",
          receiverStreet:   parseStreet(found.receiverAddress ?? ""),

          // Người gửi — field names khớp API response
          senderName:       found.senderName       ?? "",
          senderPhone:      found.senderPhone       ?? "",
          senderEmail:      (found as any).senderEmail ?? "",
          senderStreet:     parseStreet(found.senderAddress ?? ""),

          // Kích thước & trọng lượng — khớp API
          weight:           found.weightGram  ?? null,
          length:           found.lengthCm    ?? null,
          width:            found.widthCm     ?? null,
          height:           found.heightCm    ?? null,

          codAmount:        resolvedCod,
          note:             found.noteForShipper ?? "",
        });

        // Auto-fill địa chỉ người nhận
        // API không trả về province/district/ward riêng → parse từ receiverAddress
        // VD: "18 Nguyễn Thị Minh Khai, Q.3, TP.HCM" → district="Q.3", province="TP.HCM"
        const parseAddressParts = (fullAddress: string) => {
          const parts = (fullAddress ?? "").split(",").map((s) => s.trim());
          return {
            street:   parts[0] ?? "",
            district: parts[1] ?? "",
            ward:     parts.length > 3 ? parts[2] ?? "" : "",
            province: parts[parts.length - 1] ?? "",
          };
        };

        const recParsed = parseAddressParts(found.receiverAddress ?? "");
        if (recParsed.province || recParsed.district) {
          receiverAddr.setValuesByName(recParsed.province, recParsed.district, recParsed.ward);
        }

        const sndParsed = parseAddressParts(found.senderAddress ?? "");
        if (sndParsed.province || sndParsed.district) {
          senderAddr.setValuesByName(sndParsed.province, sndParsed.district, sndParsed.ward);
        }
      } else {
        showToast(res.message ?? "Không thể tải thông tin đơn vận chuyển", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi tải đơn vận chuyển", "error");
    } finally {
      setIsLoadingPage(false);
    }
  };

  const setField = (field: string) => (e: any) => {
    const value = e?.target !== undefined ? e.target.value : e?.value ?? e;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (isEdit) {
      if (!selectedStatus) errs.status = "Vui lòng chọn trạng thái";
    } else {
      if (!form.partnerId) errs.partnerId = "Vui lòng chọn hãng vận chuyển";
      if (!form.receiverName?.trim()) errs.receiverName = "Vui lòng nhập tên người nhận";
      if (!form.receiverPhone?.trim()) errs.receiverPhone = "Vui lòng nhập số điện thoại";
      if (!form.receiverStreet?.trim()) errs.receiverStreet = "Vui lòng nhập địa chỉ (số nhà, đường)";
      if (!form.receiverDistrict?.trim()) errs.receiverDistrict = "Vui lòng chọn quận / huyện";
      if (!form.receiverWard?.trim()) errs.receiverWard = "Vui lòng chọn phường / xã";
      if (!form.weight || +form.weight <= 0) errs.weight = "Vui lòng nhập trọng lượng";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      if (isEdit) {
        const res = await ShippingService.updateStatus(shipmentOrderFromParam, selectedStatus?.value);
        if (res.code === 0) {
          showToast("Cập nhật trạng thái đơn thành công", "success");
          navigate("/shipping");
        } else {
          showToast(res.message ?? "Cập nhật trạng thái thất bại", "error");
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
          email: form.receiverEmail ?? "",
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
        status: selectedStatus?.value ?? "SUBMITTED",
      };

      const response = await ShippingService.create(payload as any);
      if (response.code === 0) {
        showToast("Cập nhật đơn vận chuyển thành công", "success");
        navigate("/shipping");
      } else {
        showToast(response.message ?? "Cập nhật đơn thất bại", "error");
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

            {/* Card: Trạng thái — chỉ hiện khi chỉnh sửa */}
            {isEdit && (
              <div className="form-card">
                <div className="form-card__title">
                  <Icon name="Activity" />
                  Cập nhật trạng thái đơn
                </div>
                <div className="form-card__body">
                  <div>
                    <SelectCustom
                      label="Trạng thái"
                      required
                      fill
                      options={STATUS_OPTIONS}
                      value={selectedStatus?.value ?? null}
                      onChange={(opt: any) => {
                        const val = opt === null || opt === undefined
                          ? null
                          : typeof opt === "object" ? opt : STATUS_OPTIONS.find((s) => s.value === opt) ?? null;
                        setSelectedStatus(val ? { value: val.value ?? val, label: val.label ?? val } : null);
                        setErrors((prev) => ({ ...prev, status: "" }));
                      }}
                      placeholder="Chọn trạng thái..."
                    />
                    {errors.status && <span className="field-error">{errors.status}</span>}
                  </div>
                  <div className="edit-mode-notice">
                    <Icon name="Info" />
                    <span>Ở chế độ chỉnh sửa, chỉ có thể cập nhật trạng thái đơn vận chuyển.</span>
                  </div>
                </div>
              </div>
            )}

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
                          <strong>{formatCurrency(selectedInvoice.amount ?? 0)}</strong>
                        </div>
                        {(selectedInvoice.amountCard ?? 0) > 0 && (
                          <div className="invoice-info-card__cod">
                            <Icon name="CreditCard" />
                            COD: <strong>{formatCurrency(selectedInvoice.amountCard)}</strong>
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
                    isDisabled={isEdit}
                    debounceTimeout={350}
                    defaultOptions
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    loadOptions={loadSenderOptions}
                    additional={{ page: 1 }}
                    value={selectedSender ? { value: selectedSender.id, label: `${selectedSender.name}${selectedSender.phone ? " — " + selectedSender.phone : ""}${selectedSender.branchName ? " | " + selectedSender.branchName : ""}` } : null}
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
                      disabled={isEdit}
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
                      disabled={isEdit}
                      value={form.senderPhone}
                      onChange={setField("senderPhone")}
                      placeholder="09xxxxxxxx"
                    />
                  </div>
                </div>

                <Input
                  name="senderEmail"
                  label="Email người gửi"
                  fill
                  disabled={isEdit}
                  type="email"
                  value={form.senderEmail}
                  onChange={setField("senderEmail")}
                  placeholder="example@email.com"
                />

                <Input
                  name="senderStreet"
                  label="Số nhà, tên đường"
                  fill
                  disabled={isEdit}
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
                      isDisabled={senderAddr.loadingProvinces || isEdit}
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
                      isDisabled={!senderAddr.selectedProvince || senderAddr.loadingDistricts || isEdit}
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
                      isDisabled={!senderAddr.selectedDistrict || senderAddr.loadingWards || isEdit}
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
                    disabled={isEdit}
                    options={PARTNER_OPTIONS}
                    value={form.partnerId ?? null}
                    onChange={(opt: any) => {
                      const partnerId =
                        opt === null || opt === undefined
                          ? null
                          : typeof opt === "object"
                          ? (opt.value ?? null)
                          : opt;
                      setForm((prev) => ({ ...prev, partnerId }));
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
                      disabled={isEdit}
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
                        disabled={isEdit}
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
                    disabled={isEdit}
                    value={form.receiverStreet}
                    onChange={setField("receiverStreet")}
                    placeholder="VD: 123 Nguyễn Trãi"
                  />
                  {errors.receiverStreet && <span className="field-error">{errors.receiverStreet}</span>}
                </div>

                <Input
                  name="receiverEmail"
                  label="Email người nhận"
                  fill
                  disabled={isEdit}
                  type="email"
                  value={(form as any).receiverEmail ?? ""}
                  onChange={setField("receiverEmail")}
                  placeholder="example@email.com"
                />

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
                      isDisabled={receiverAddr.loadingProvinces || isEdit}
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
                      isDisabled={!receiverAddr.selectedProvince || receiverAddr.loadingDistricts || isEdit}
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
                      isDisabled={!receiverAddr.selectedDistrict || receiverAddr.loadingWards || isEdit}
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
                      disabled={isEdit}
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
                    disabled={isEdit}
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
                  disabled={isEdit}
                  value={form.note}
                  onChange={setField("note")}
                  placeholder="Gọi trước khi giao, hàng dễ vỡ..."
                />
              </div>
            </div>
          </div>

          {/* ========== CỘT PHẢI ========== */}
          <div className="add-shipping-side">
            {/* Card: Trạng thái — chỉ hiện khi tạo mới */}
            {!isEdit && (
              <div className="form-card">
                <div className="form-card__title">
                  <Icon name="Activity" />
                  Trạng thái đơn
                </div>
                <div className="form-card__body">
                  <SelectCustom
                    label="Trạng thái"
                    fill
                    options={STATUS_OPTIONS}
                    value={selectedStatus?.value ?? null}
                    onChange={(opt: any) => {
                      const val = opt === null || opt === undefined
                        ? null
                        : typeof opt === "object" ? opt : STATUS_OPTIONS.find((s) => s.value === opt) ?? null;
                      setSelectedStatus(val ? { value: val.value ?? val, label: val.label ?? val } : null);
                    }}
                    placeholder="Mặc định: Chờ duyệt"
                  />
                </div>
              </div>
            )}
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
                  disabled={isEdit}
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
                isEdit
                  ? (selectedStatus ? "ready" : "not-ready")
                  : (form.partnerId && form.receiverName && form.receiverPhone && form.receiverStreet && form.receiverDistrict && form.receiverWard && form.weight
                    ? "ready" : "not-ready")
              }`}>
                <span className="readiness-dot" />
                <span className="readiness-label">
                  {isEdit
                    ? (selectedStatus ? "Đã chọn trạng thái, sẵn sàng cập nhật" : "Vui lòng chọn trạng thái đơn")
                    : (form.partnerId && form.receiverName && form.receiverPhone && form.receiverStreet && form.receiverDistrict && form.receiverWard && form.weight
                      ? "Đã điền đủ thông tin, sẵn sàng đẩy đơn"
                      : "Vui lòng điền đủ thông tin bắt buộc (*)")}
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