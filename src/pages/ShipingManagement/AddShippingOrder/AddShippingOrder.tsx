import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import Loading from "components/loading";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import { IShippingOrderCreateRequest } from "model/shipping/ShippingRequestModel";
import { IShippingOrderResponse } from "model/shipping/ShippingResponseModel";
import { MOCK_SHIPPING_ORDERS } from "../ShippingMockData";
// import ShippingService from "services/ShippingService"; // TODO: bật khi có API
import "./AddShippingOrder.scss";

const PARTNER_OPTIONS = [
  { value: 1, label: "GHTK" },
  { value: 2, label: "Viettel Post" },
  { value: 3, label: "GHN" },
];

const DEFAULT_FORM: IShippingOrderCreateRequest = {
  partnerId: null,
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
  const salesOrderId = searchParams.get("salesOrderId");

  const isEdit = !!id;
  document.title = isEdit ? "Chỉnh sửa đơn vận chuyển" : "Tạo đơn vận chuyển mới";

  const [form, setForm]             = useState<IShippingOrderCreateRequest>(DEFAULT_FORM);
  const [originData, setOriginData] = useState<IShippingOrderResponse | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) loadOrderDetail(+id);
    else if (salesOrderId) autoFillFromSalesOrder(+salesOrderId);
  }, [id, salesOrderId]); // eslint-disable-line

  const loadOrderDetail = async (orderId: number) => {
    setIsLoadingPage(true);
    await new Promise((r) => setTimeout(r, 300));
    // TODO: const res = await ShippingService.detail(orderId);
    const found = MOCK_SHIPPING_ORDERS.find((o) => o.id === orderId);
    if (found) {
      setOriginData(found);
      setForm({
        id:              found.id,
        partnerId:       found.partnerId,
        salesOrderId:    found.salesOrderId,
        receiverName:    found.receiverName,
        receiverPhone:   found.receiverPhone?.replace(/\*/g, "0"),
        receiverAddress: found.receiverAddress,
        weight:  found.weight,
        width:   found.width  ?? null,
        height:  found.height ?? null,
        length:  found.length ?? null,
        codAmount: found.codAmount ?? null,
        note:      found.note ?? "",
      });
    }
    setIsLoadingPage(false);
  };

  const autoFillFromSalesOrder = async (soId: number) => {
    // TODO: gọi SalesOrderService.detail(soId) để lấy thông tin khách hàng
    setForm((prev) => ({
      ...prev,
      salesOrderId:    soId,
      receiverName:    "Nguyễn Văn A",
      receiverPhone:   "0901234567",
      receiverAddress: "123 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội",
      codAmount:       450000,
    }));
  };

  const setField = (field: string) => (e: any) => {
    const value = e?.target !== undefined ? e.target.value : e?.value ?? e;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.partnerId)              errs.partnerId       = "Vui lòng chọn hãng vận chuyển";
    if (!form.receiverName?.trim())   errs.receiverName    = "Vui lòng nhập tên người nhận";
    if (!form.receiverPhone?.trim())  errs.receiverPhone   = "Vui lòng nhập số điện thoại";
    if (!form.receiverAddress?.trim()) errs.receiverAddress = "Vui lòng nhập địa chỉ giao hàng";
    if (!form.weight || +form.weight <= 0) errs.weight     = "Vui lòng nhập trọng lượng";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    // TODO: isEdit ? await ShippingService.update(form) : await ShippingService.create(form)
    showToast(
      isEdit ? "Cập nhật đơn vận chuyển thành công (demo)" : "Tạo đơn vận chuyển thành công (demo)",
      "success"
    );
    setIsLoading(false);
    navigate("/shipping");
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

          {/* ========== CỘT TRÁI (form chính) ========== */}
          <div className="add-shipping-main">

            {/* Auto-fill banner */}
            {(salesOrderId || originData?.salesOrderCode) && (
              <div className="autofill-banner">
                <Icon name="CheckCircle" />
                <span>
                  Đã tự động điền thông tin từ đơn hàng&nbsp;
                  <strong>{originData?.salesOrderCode || `#${salesOrderId}`}</strong>
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
                  errorText={errors.partnerId}
                />
              </div>
            </div>

            {/* Card: Thông tin người nhận */}
            <div className="form-card">
              <div className="form-card__title">
                <Icon name="User" />
                Thông tin người nhận
              </div>
              <div className="form-card__body">
                <div className="form-row-2">
                  <Input
                    name="receiverName"
                    label="Tên người nhận *"
                    fill
                    value={form.receiverName}
                    onChange={setField("receiverName")}
                    placeholder="Nguyễn Văn A"
                    errorText={errors.receiverName}
                  />
                  <div className="input-verified-wrap">
                    <Input
                      name="receiverPhone"
                      label="Số điện thoại *"
                      fill
                      value={form.receiverPhone}
                      onChange={setField("receiverPhone")}
                      placeholder="09xxxxxxxx"
                      errorText={errors.receiverPhone}
                    />
                    {(form.receiverPhone?.length >= 10 && !errors.receiverPhone) && (
                      <span className="verified-icon"><Icon name="CheckCircle" /></span>
                    )}
                  </div>
                </div>
                <Input
                  name="receiverAddress"
                  label="Địa chỉ giao hàng *"
                  fill
                  value={form.receiverAddress}
                  onChange={setField("receiverAddress")}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  errorText={errors.receiverAddress}
                />
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
                  <Input
                    name="weight"
                    label="Trọng lượng (gram) *"
                    fill
                    type="number"
                    value={form.weight ?? ""}
                    onChange={setField("weight")}
                    placeholder="500"
                    errorText={errors.weight}
                  />
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

          {/* ========== CỘT PHẢI (COD + submit) ========== */}
          <div className="add-shipping-side">

            {/* Card: COD */}
            <div className="form-card">
              <div className="form-card__title">
                <Icon name="Money" />
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
                  suffix="đ"
                />
                {form.codAmount > 0 && (
                  <div className="cod-preview">
                    <span className="cod-preview__label">Sẽ thu hộ</span>
                    <span className="cod-preview__value">{formatCurrency(+form.codAmount)} đ</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Nút hành động */}
            <div className="form-card action-card">
              {/* Indicator sẵn sàng */}
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
                disabled={isLoading}
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
