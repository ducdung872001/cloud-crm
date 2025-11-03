import { IOption, ISortItem } from "./OtherModel";
// trạng thái hóa đơn
export const statusSaleInvoice = {
  processing: "Đang xử lý",
  done: "Hoàn thành",
  cancel: "Đã hủy",
  temp: "Lưu tạm",
};
// trạng thái hóa đơn nhập hàng
export const statusImportBill = {
  done: "Hoàn thành",
  cancel: "Đã hủy",
};

// trạng thái phiếu kiểm kho
export const statusCheckInventory = {
  checked: "Đã duyệt",
  pending: "Chưa duyệt",
  deny: "Không duyệt",
};

// trạng thái sổ quỹ
export const statusCashbook = {
  cash: "Tiền mặt",
  banking: "Chuyển khoản",
  card: "Thẻ",
  momo: "MOMO",
  vnpay: "VNPay",
  other: "Hình thúc khác",
};

export const salesMethods = [
  {
    value: "direct",
    label: "Trực tiếp",
  },
  {
    value: "online",
    label: "Online",
  },
];

export const optionVats: IOption[] = [
  {
    value: 0,
    label: "0%",
  },
  {
    value: 5,
    label: "5%",
  },
  {
    value: 8,
    label: "8%",
  },
  {
    value: 10,
    label: "10%",
  },
];

// hình thức thanh toán
export const paymentMethods = [
  {
    value: "cash",
    label: "Tiền mặt",
  },
  {
    value: "banking",
    label: "Chuyển khoản",
  },
  // {
  //   value: "card",
  //   label: "Thẻ (máy POS)",
  // },
  // {
  //   value: "momo",
  //   label: "Momo",
  // },
  // {
  //   value: "vnpay",
  //   label: "VNPay",
  // },
  // {
  //   value: "other",
  //   label: "Hình thức khác",
  // },
];

export const optionsVat: IOption[] = [
  {
    value: 0,
    label: "0%",
  },
  {
    value: 5,
    label: "5%",
  },
  {
    value: 8,
    label: "8%",
  },
  {
    value: 10,
    label: "10%",
  },
];

// tìm kiếm nâng cao thống kê nhập hàng
export const sortWarehousingStatistic: ISortItem[] = [
  { value: "", label: "Mặc định" },
  { value: "created_at_asc", label: "Ngày nhập hàng cũ nhất" },
  { value: "created_at_desc", label: "Ngày nhập hàng mới nhất" },
  { value: "receipt_date_asc", label: "Ngày hóa đơn Cũ nhất - Mới nhất" },
  { value: "receipt_date_desc", label: "Ngày hóa đơn Mới nhất - Cũ nhất" },
  { value: "invoice_code_asc", label: "Mã hóa đơn A - Z" },
  { value: "invoice_code_desc", label: "Mã hóa đơn Z - A" },
  { value: "supplier_name_asc", label: "Nhà cung cấp A - Z" },
  { value: "supplier_name_desc", label: "Nhà cung cấp Z - A" },
  { value: "amount_asc", label: "Tổng tiền hàng trước thuế Nhỏ - Lớn" },
  { value: "amount_desc", label: "Tổng tiền hàng trước thuế Lớn - Nhỏ" },
  { value: "vat_asc", label: "VAT Nhỏ - Lớn" },
  { value: "vat_desc", label: "VAT Lớn - Nhỏ" },
  { value: "discount_asc", label: "Giảm giá Nhỏ - Lớn" },
  { value: "discount_desc", label: "Giảm giá Lớn - Nhỏ" },
  { value: "total_amount_asc", label: "Tổng tiền hàng sau VAT Nhỏ - Lớn" },
  { value: "total_amount_desc", label: "Tổng tiền hàng sau VAT Lớn - Nhỏ" },
  { value: "return_amount_asc", label: "Tiền trả hàng NCC Nhỏ - Lớn" },
  { value: "return_amount_desc", label: "Tiền trả hàng NCC Lớn - Nhỏ" },
  { value: "pay_amount_asc", label: "Thực trả Nhỏ - Lớn" },
  { value: "pay_amount_desc", label: "Thực trả Lớn - Nhỏ" },
  { value: "debt_amount_asc", label: "Công nợ Nhỏ - Lớn" },
  { value: "debt_amount_desc", label: "Công nợ Lớn - Nhỏ" },
];

// phân quyền vai trò nhân viên
export const roleEmployee = {
  admin: "Admin",
  stock_manage: "Quản lý bán hàng",
  sell_manage: "Dược sỹ bán hàng",
  warehousing_manage: "Quản lý nhập hàng",
  warehousing: "Dược sỹ nhập hàng",
  cashier: "Thu ngân",
  sale: "Sale bán hàng",
};

// trạng thái đơn đặt hàng
export const statusOrder = [
  {
    value: "wait_gdp_confirm",
    label: "Đang đợi GDP phê duyệt",
  },
  {
    value: "gdp_processing",
    label: "GDP đang xử lý",
  },
  {
    value: "gdp_confirm",
    label: "GDP đã phê duyệt",
  },
  {
    value: "gdp_cancel",
    label: "GDP đã hủy",
  },
  {
    value: "wait_gpp_confirm",
    label: "Đang đợi gpp xác nhận",
  },
  {
    value: "gpp_cancel",
    label: "GPP đã hủy",
  },
  {
    value: "temp",
    label: "Lưu tạm",
  },
  {
    value: "done",
    label: "Hoàn thành",
  },
];
