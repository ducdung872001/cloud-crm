import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { PaymentImportInvoicesProps } from "model/invoice/PropsModel";
import { IInvoiceCreateRequest } from "model/invoice/InvoiceRequestModel";
import { IInvoiceCreateResponse } from "model/invoice/InvoiceResponse";
import InvoiceService from "services/InvoiceService";
import InventoryService from "services/InventoryService";
import Icon from "components/icon";
import Button from "components/button/button";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import { showToast } from "utils/common";
import "./PaymentImportInvoices.scss";

interface IOptionInventory {
  value: number;
  label: string;
  address: string;
  branchName: string;
}

const DEFAULT_FORM: IInvoiceCreateRequest = {
  id: 0,
  paymentType: 1,
  invoiceType: "IV4",
  amount: 0,
  debt: 0,
  discount: 0,
  fee: 0,
  paid: 0,
  receiptDate: "",
  vatAmount: 0,
  inventoryId: null,
};

const getInvoiceFromResponse = (response: any): IInvoiceCreateResponse | null => {
  const result = response?.result ?? response?.data ?? null;
  if (!result) return null;
  return (result.invoice ?? result) as IInvoiceCreateResponse;
};

export default function PaymentImportInvoices(props: PaymentImportInvoicesProps) {
  const { data, listInvoiceDetail = [], onInvoiceCreated, onInvoiceApproved, onInventoryChanged } = props;

  const navigate = useNavigate();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [formData, setFormData] = useState<IInvoiceCreateRequest>(DEFAULT_FORM);
  const [validateReceiptDate, setValidateReceiptDate] = useState<boolean>(false);
  const [validateInventory, setValidateInventory] = useState<boolean>(false);
  const [infoBranch, setInfoBranch] = useState({ branch: "", address: "" });
  const [listInventory, setListInventory] = useState<IOptionInventory[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);
  const [isUpdatingInventory, setIsUpdatingInventory] = useState<boolean>(false);

  const invoiceStatus = data?.status ?? 2;
  const isCreated = !!data?.id;
  const isPending = invoiceStatus === 2;
  const hasLineItems = listInvoiceDetail.length > 0;

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...DEFAULT_FORM,
      ...data,
      id: data?.id ?? 0,
      invoiceType: data?.invoiceType ?? "IV4",
      receiptDate: data?.receiptDate ?? "",
      inventoryId: data?.inventoryId ?? null,
    }));
  }, [data]);

  const selectedInventory = useMemo(
    () => listInventory.find((item) => item.value === formData?.inventoryId) ?? null,
    [listInventory, formData?.inventoryId]
  );

  const getListInventory = async () => {
    if (listInventory.length > 0) return;

    setIsLoadingInventory(true);
    const response = await InventoryService.list();

    if (response.code === 0) {
      const dataOption = Array.isArray(response.result)
        ? response.result
        : Array.isArray(response.result?.items)
          ? response.result.items
          : [];
      setListInventory(
        dataOption.map((item) => ({
          value: item.id,
          label: item.name,
          address: item.address ?? "",
          branchName: item.branchName ?? item.name ?? "",
        }))
      );
    } else {
      showToast(response.message ?? "Không lấy được danh sách kho", "error");
    }

    setIsLoadingInventory(false);
  };

  useEffect(() => {
    if (formData?.inventoryId) {
      getListInventory();
    }
  }, [formData?.inventoryId]);

  useEffect(() => {
    if (!selectedInventory) {
      setInfoBranch({ branch: "", address: "" });
      return;
    }

    setInfoBranch({
      address: selectedInventory.address,
      branch: selectedInventory.branchName,
    });
  }, [selectedInventory]);

  const handleChangeValueInventory = (e) => {
    const nextInventoryId = e?.value ?? null;
    const previousInventoryId = formData?.inventoryId ?? null;

    setValidateInventory(false);
    setFormData((prev) => ({ ...prev, inventoryId: nextInventoryId }));
    onInventoryChanged?.(nextInventoryId);

    if (!data?.id || !isPending || nextInventoryId == null || nextInventoryId === previousInventoryId) {
      return;
    }

    const updateInventory = async () => {
      setIsUpdatingInventory(true);
      const response = await InvoiceService.importUpdate({
        id: data.id,
        inventoryId: nextInventoryId,
      });
      const invoice = getInvoiceFromResponse(response);

      if (response.code === 0) {
        showToast("Cập nhật kho hàng thành công", "success");
        onInvoiceCreated?.({
          ...(data as IInvoiceCreateResponse),
          ...(invoice ?? {}),
          id: invoice?.id ?? data.id,
          inventoryId: invoice?.inventoryId ?? nextInventoryId,
        });
      } else {
        setFormData((prev) => ({ ...prev, inventoryId: previousInventoryId }));
        onInventoryChanged?.(previousInventoryId);
        showToast(response.message ?? "Cập nhật kho hàng thất bại", "error");
      }

      setIsUpdatingInventory(false);
    };

    updateInventory();
  };

  const handleChangeValueReceiptDate = (e) => {
    setValidateReceiptDate(false);
    const newReceiptDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
    setFormData({ ...formData, receiptDate: newReceiptDate });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();

    if (formData?.inventoryId == null) {
      setValidateInventory(true);
      return;
    }

    if (!formData?.receiptDate) {
      setValidateReceiptDate(true);
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(formData?.id ? { id: formData.id } : {}),
      invoiceType: "IV4",
      inventoryId: formData.inventoryId,
      receiptDate: moment(formData.receiptDate).format("YYYY-MM-DDTHH:mm:ss"),
    };

    const response = await InvoiceService.importUpdate(body);
    const invoice = getInvoiceFromResponse(response);

    if (response.code === 0 && invoice?.id) {
      showToast(formData?.id ? "Cập nhật phiếu nhập thành công" : "Tạo phiếu nhập thành công", "success");
      onInvoiceCreated?.(invoice);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const handleApproveInvoice = async () => {
    if (!data?.id) {
      showToast("Phiếu nhập chưa được tạo", "warning");
      return;
    }

    if (!hasLineItems) {
      showToast("Phiếu nhập phải có ít nhất 1 dòng hàng trước khi duyệt", "warning");
      return;
    }

    setIsSubmit(true);
    const response = await InvoiceService.importApprove(data.id);

    if (response.code === 0) {
      showToast("Duyệt phiếu nhập thành công", "success");
      onInvoiceApproved?.({ ...(data as IInvoiceCreateResponse), status: 1 });
    } else {
      showToast(response.message ?? "Duyệt phiếu nhập thất bại", "error");
    }

    setIsSubmit(false);
  };

  return (
    <div className="payment__import--invoice">
      <div className="card-box">

        {/* Header */}
        <div className="pii-header">
          <div className="pii-header__icon">
            <Icon name="ImportBill" />
          </div>
          <span className="pii-header__title">Thông tin phiếu nhập kho</span>
        </div>

        <form className="pii-body" onSubmit={handleCreateInvoice}>

          {/* Kho hàng */}
          <div className="pii-field">
            <SelectCustom
              fill={true}
              options={listInventory}
              required={true}
              name="inventoryId"
              placeholder="Chọn kho hàng"
              label="Kho hàng"
              value={formData?.inventoryId}
              onMenuOpen={getListInventory}
              onChange={(e) => handleChangeValueInventory(e)}
              isLoading={isLoadingInventory}
              error={validateInventory}
              message="Vui lòng chọn kho hàng"
              disabled={isUpdatingInventory || (isCreated && !isPending)}
            />
          </div>

          {/* Địa chỉ + Chi nhánh */}
          <div className="pii-info-row">
            <span className="pii-info-row__label">Địa chỉ</span>
            <span className={`pii-info-row__value${!infoBranch?.address ? " pii-info-row__value--placeholder" : ""}`}>
              {infoBranch?.address || "Chọn kho hàng để xem địa chỉ"}
            </span>
          </div>

          <div className="pii-info-row">
            <span className="pii-info-row__label">Chi nhánh</span>
            <span className={`pii-info-row__value${!infoBranch?.branch ? " pii-info-row__value--placeholder" : ""}`}>
              {infoBranch?.branch || "Chọn kho hàng để xem chi nhánh"}
            </span>
          </div>

          {/* Ngày nhập */}
          <div className="pii-field">
            <DatePickerCustom
              label="Ngày nhập"
              name="receiptDate"
              fill={true}
              value={formData?.receiptDate}
              onChange={(e) => handleChangeValueReceiptDate(e)}
              placeholder="Chọn ngày nhập hàng"
              required={true}
              iconPosition="left"
              icon={<Icon name="Calendar" />}
              isMaxDate={true}
              error={validateReceiptDate}
              message="Vui lòng chọn ngày nhập hàng"
              disabled={isUpdatingInventory || (isCreated && !isPending)}
            />
          </div>

          {/* Tổng tiền highlight */}
          <div className="pii-total">
            <span className="pii-total__label">Tổng tiền hàng</span>
            <span className="pii-total__value">{new Intl.NumberFormat("vi-VN").format(data?.amount ?? 0)}đ</span>
          </div>

          {/* Trạng thái + Mã phiếu */}
          <div className="pii-info-row">
            <span className="pii-info-row__label">Trạng thái</span>
            <span className="pii-info-row__value">
              {invoiceStatus === 1 ? "✅ Đã hoàn thành" : invoiceStatus === 3 ? "❌ Đã hủy" : "🕐 Chờ duyệt"}
            </span>
          </div>

          <div className="pii-info-row">
            <span className="pii-info-row__label">Mã phiếu</span>
            <span className={`pii-info-row__value pii-info-row__value--code${!data?.id ? " pii-info-row__value--placeholder" : ""}`}>
              {data?.invoiceCode || (data?.id ? `#${data.id}` : "Chưa tạo phiếu nhập")}
            </span>
          </div>

        </form>

        {/* Actions */}
        <div className="pii-actions">
          {isPending ? (
            <>
              <Button
                type="submit"
                color="primary"
                disabled={isSubmit || isUpdatingInventory}
                onClick={handleCreateInvoice}
              >
                {isCreated ? "Cập nhật phiếu nhập" : "Tạo phiếu nhập"}
                {isSubmit && <Icon name="Loading" />}
              </Button>
              <div className="pii-actions__secondary">
                <Button
                  color="primary"
                  variant="outline"
                  onClick={(e) => { e.preventDefault(); navigate("/invoice_order"); }}
                >
                  Quay lại
                </Button>
                <Button
                  type="button"
                  color="primary"
                  variant="outline"
                  disabled={isSubmit || isUpdatingInventory || !isCreated || !hasLineItems}
                  onClick={handleApproveInvoice}
                >
                  Duyệt phiếu nhập
                  {isSubmit && <Icon name="Loading" />}
                </Button>
              </div>
            </>
          ) : (
            <div className="pii-actions__secondary">
              <Button
                color="primary"
                variant="outline"
                onClick={(e) => { e.preventDefault(); navigate("/invoice_order"); }}
              >
                Quay lại
              </Button>
              <Button type="button" color="primary" disabled={true}>
                Phiếu đã hoàn thành
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}