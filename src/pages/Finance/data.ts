export type FinanceTransactionKind = "income" | "expense";
export type FinanceDebtKind = "receivable" | "payable";
export type FinanceDebtStatus = "active" | "upcoming" | "overdue" | "paid";
export type FinanceApprovalStatus = "approved" | "pending" | "rejected";
export type FinanceCashBookKindFilter = "all" | FinanceTransactionKind;
export type FinanceCashBookPeriodFilter = "this_month" | "all";
export type FinanceDebtFilter = "all" | FinanceDebtKind | "overdue";

export interface FinanceOption<T = string> {
  value: T;
  label: string;
}

export interface FinanceCategory {
  id: string;
  label: string;
  kind: FinanceTransactionKind;
}

export interface FinanceFund {
  id: string;
  name: string;
  type: "bank" | "cash";
  balance: number;
  updatedAt: string;
}

export interface FinanceTransaction {
  id: string;
  code: string;
  title: string;
  kind: FinanceTransactionKind;
  categoryId: string;
  fundId: string;
  amount: number;
  branchName: string;
  createdBy: string;
  approvalStatus: FinanceApprovalStatus;
  note?: string;
  relatedEntity?: string;
  createdAt: string;
}

export interface FinanceDebt {
  id: string;
  code: string;
  name: string;
  kind: FinanceDebtKind;
  amount: number;
  dueDate: string;
  status: FinanceDebtStatus;
  fundId: string;
  branchName: string;
  ownerName: string;
}

export interface FinanceDebtStatusMeta {
  label: string;
  tone: "success" | "danger" | "warning" | "neutral";
}

export interface FinanceApprovalStatusMeta {
  label: string;
  tone: "success" | "danger" | "warning" | "neutral";
}

export interface FinanceDashboardMockResponse {
  funds: FinanceFund[];
  transactions: FinanceTransaction[];
  debts: FinanceDebt[];
}

export interface FinanceCashBookMockResponse {
  records: FinanceTransaction[];
  total: number;
  filters: {
    kinds: FinanceOption<FinanceCashBookKindFilter>[];
    periods: FinanceOption<FinanceCashBookPeriodFilter>[];
    funds: FinanceFund[];
  };
}

export interface FinanceFundManagementMockResponse {
  funds: FinanceFund[];
  transactions: FinanceTransaction[];
}

export interface FinanceDebtManagementMockResponse {
  debts: FinanceDebt[];
  total: number;
  filters: FinanceOption<FinanceDebtFilter>[];
}

export const financeCategories: FinanceCategory[] = [
  { id: "sales_revenue", label: "Doanh thu bán hàng", kind: "income" },
  { id: "customer_debt_collection", label: "Thu nợ khách hàng", kind: "income" },
  { id: "investment_return", label: "Hoàn vốn đầu tư", kind: "income" },
  { id: "refund_from_returns", label: "Trả hàng nhận lại tiền", kind: "income" },
  { id: "service_income", label: "Thu dịch vụ", kind: "income" },
  { id: "partner_support", label: "Hỗ trợ từ đối tác", kind: "income" },
  { id: "deposit_received", label: "Thu tiền đặt cọc", kind: "income" },
  { id: "electricity", label: "Tiền điện", kind: "expense" },
  { id: "water", label: "Tiền nước", kind: "expense" },
  { id: "salary", label: "Chi lương nhân viên", kind: "expense" },
  { id: "inventory", label: "Nhập hàng", kind: "expense" },
  { id: "rent", label: "Tiền thuê mặt bằng", kind: "expense" },
  { id: "marketing", label: "Chi phí marketing", kind: "expense" },
  { id: "transport", label: "Chi phí vận chuyển", kind: "expense" },
  { id: "maintenance", label: "Bảo trì thiết bị", kind: "expense" },
  { id: "office_supply", label: "Văn phòng phẩm", kind: "expense" },
];

export const financeFunds: FinanceFund[] = [
  {
    id: "mb_bank",
    name: "Ngân hàng MB",
    type: "bank",
    balance: 185000000,
    updatedAt: "2026-03-01T08:15:00",
  },
  {
    id: "morning_cashier",
    name: "Két thu ngân ca sáng",
    type: "cash",
    balance: 12850000,
    updatedAt: "2026-03-01T11:30:00",
  },
  {
    id: "counter_cash",
    name: "Tiền mặt tại quầy",
    type: "cash",
    balance: 9750000,
    updatedAt: "2026-03-01T10:45:00",
  },
  {
    id: "techcombank_main",
    name: "Techcombank vận hành",
    type: "bank",
    balance: 74200000,
    updatedAt: "2026-03-01T11:55:00",
  },
  {
    id: "delivery_cash",
    name: "Quỹ shipper cuối ngày",
    type: "cash",
    balance: 4650000,
    updatedAt: "2026-03-01T11:10:00",
  },
  {
    id: "reserve_fund",
    name: "Quỹ dự phòng nội bộ",
    type: "bank",
    balance: 52000000,
    updatedAt: "2026-02-28T17:40:00",
  },
];

export const financeTransactions: FinanceTransaction[] = [
  {
    id: "txn_001",
    code: "PT-20260301-001",
    title: "Thu tiền đơn hàng #SO-2312",
    kind: "income",
    categoryId: "sales_revenue",
    fundId: "techcombank_main",
    amount: 31200000,
    branchName: "Chi nhánh Quận 1",
    createdBy: "Nguyễn Minh Tâm",
    approvalStatus: "approved",
    relatedEntity: "Công ty Nam Thành",
    createdAt: "2026-03-01T11:50:00",
  },
  {
    id: "txn_002",
    code: "PC-20260301-001",
    title: "Chi phí nhập lô hàng điện máy đợt 2",
    kind: "expense",
    categoryId: "inventory",
    fundId: "mb_bank",
    amount: 18600000,
    branchName: "Kho tổng Bình Tân",
    createdBy: "Lê Hoàng Nam",
    approvalStatus: "approved",
    relatedEntity: "NCC Thiên Phúc",
    createdAt: "2026-03-01T11:32:00",
  },
  {
    id: "txn_003",
    code: "PT-20260301-002",
    title: "Thu nợ khách hàng cũ",
    kind: "income",
    categoryId: "customer_debt_collection",
    fundId: "morning_cashier",
    amount: 6800000,
    branchName: "Chi nhánh Phú Nhuận",
    createdBy: "Trần Hải Yến",
    approvalStatus: "approved",
    relatedEntity: "Nguyễn Hải Đăng",
    createdAt: "2026-03-01T10:20:00",
  },
  {
    id: "txn_004",
    code: "PC-20260301-002",
    title: "Chi lương nhân viên part-time",
    kind: "expense",
    categoryId: "salary",
    fundId: "counter_cash",
    amount: 3200000,
    branchName: "Chi nhánh Phú Nhuận",
    createdBy: "Trần Hải Yến",
    approvalStatus: "pending",
    relatedEntity: "Nhân viên ca chiều",
    createdAt: "2026-03-01T10:45:00",
  },
  {
    id: "txn_005",
    code: "PT-20260301-003",
    title: "Thu dịch vụ lắp đặt tại nhà",
    kind: "income",
    categoryId: "service_income",
    fundId: "delivery_cash",
    amount: 1850000,
    branchName: "Đội giao nhận nội thành",
    createdBy: "Phạm Quốc Huy",
    approvalStatus: "approved",
    relatedEntity: "Khách lẻ khu vực Quận 7",
    createdAt: "2026-03-01T10:05:00",
  },
  {
    id: "txn_006",
    code: "PT-20260301-004",
    title: "Thu tiền đơn hàng #SO-2301",
    kind: "income",
    categoryId: "sales_revenue",
    fundId: "mb_bank",
    amount: 24500000,
    branchName: "Chi nhánh Quận 1",
    createdBy: "Nguyễn Minh Tâm",
    approvalStatus: "approved",
    relatedEntity: "Công ty Minh Quang",
    createdAt: "2026-03-01T09:10:00",
  },
  {
    id: "txn_007",
    code: "PC-20260301-003",
    title: "Chi phí vận chuyển trả đối tác giao hàng",
    kind: "expense",
    categoryId: "transport",
    fundId: "delivery_cash",
    amount: 920000,
    branchName: "Đội giao nhận nội thành",
    createdBy: "Phạm Quốc Huy",
    approvalStatus: "approved",
    relatedEntity: "Đội giao nhận nội thành",
    createdAt: "2026-03-01T08:40:00",
  },
  {
    id: "txn_008",
    code: "PT-20260228-001",
    title: "Thu tiền đặt cọc đơn dự án showroom",
    kind: "income",
    categoryId: "deposit_received",
    fundId: "techcombank_main",
    amount: 12000000,
    branchName: "Chi nhánh Thủ Đức",
    createdBy: "Đỗ Thu Hà",
    approvalStatus: "approved",
    relatedEntity: "Công ty Nội thất Á Châu",
    createdAt: "2026-02-28T17:25:00",
  },
  {
    id: "txn_009",
    code: "PT-20260228-002",
    title: "Thu hoàn vốn đầu tư đợt 1",
    kind: "income",
    categoryId: "investment_return",
    fundId: "reserve_fund",
    amount: 15000000,
    branchName: "Văn phòng điều hành",
    createdBy: "Nguyễn Minh Tâm",
    approvalStatus: "approved",
    relatedEntity: "Nhóm đầu tư nội bộ",
    createdAt: "2026-02-28T16:25:00",
  },
  {
    id: "txn_010",
    code: "PC-20260228-001",
    title: "Chi phí marketing Meta Ads",
    kind: "expense",
    categoryId: "marketing",
    fundId: "mb_bank",
    amount: 4500000,
    branchName: "Phòng Marketing",
    createdBy: "Hoàng Thu Trang",
    approvalStatus: "approved",
    createdAt: "2026-02-28T14:10:00",
  },
  {
    id: "txn_011",
    code: "PC-20260228-002",
    title: "Chi tiền điện tháng 2",
    kind: "expense",
    categoryId: "electricity",
    fundId: "techcombank_main",
    amount: 3850000,
    branchName: "Chi nhánh Thủ Đức",
    createdBy: "Đỗ Thu Hà",
    approvalStatus: "approved",
    createdAt: "2026-02-28T09:30:00",
  },
  {
    id: "txn_012",
    code: "PT-20260227-001",
    title: "Thu hỗ trợ trưng bày từ đối tác",
    kind: "income",
    categoryId: "partner_support",
    fundId: "mb_bank",
    amount: 9600000,
    branchName: "Chi nhánh Quận 1",
    createdBy: "Nguyễn Minh Tâm",
    approvalStatus: "approved",
    relatedEntity: "Hãng Điện tử K-One",
    createdAt: "2026-02-27T17:10:00",
  },
  {
    id: "txn_013",
    code: "PT-20260227-002",
    title: "Thu tiền trả hàng",
    kind: "income",
    categoryId: "refund_from_returns",
    fundId: "counter_cash",
    amount: 2500000,
    branchName: "Chi nhánh Phú Nhuận",
    createdBy: "Trần Hải Yến",
    approvalStatus: "pending",
    relatedEntity: "NCC Thiên Phúc",
    createdAt: "2026-02-27T15:20:00",
  },
  {
    id: "txn_014",
    code: "PC-20260227-001",
    title: "Chi tiền thuê mặt bằng",
    kind: "expense",
    categoryId: "rent",
    fundId: "mb_bank",
    amount: 20000000,
    branchName: "Chi nhánh Quận 1",
    createdBy: "Lê Hoàng Nam",
    approvalStatus: "approved",
    createdAt: "2026-02-27T08:00:00",
  },
  {
    id: "txn_015",
    code: "PC-20260226-001",
    title: "Chi bảo trì máy in hóa đơn",
    kind: "expense",
    categoryId: "maintenance",
    fundId: "counter_cash",
    amount: 650000,
    branchName: "Chi nhánh Phú Nhuận",
    createdBy: "Trần Hải Yến",
    approvalStatus: "approved",
    createdAt: "2026-02-26T16:40:00",
  },
  {
    id: "txn_016",
    code: "PT-20260226-001",
    title: "Thu tiền đơn hàng online #EC-881",
    kind: "income",
    categoryId: "sales_revenue",
    fundId: "techcombank_main",
    amount: 7800000,
    branchName: "Kênh Thương mại điện tử",
    createdBy: "Hoàng Thu Trang",
    approvalStatus: "approved",
    relatedEntity: "Khách lẻ kênh online",
    createdAt: "2026-02-26T13:25:00",
  },
  {
    id: "txn_017",
    code: "PC-20260225-001",
    title: "Chi mua văn phòng phẩm tháng 2",
    kind: "expense",
    categoryId: "office_supply",
    fundId: "morning_cashier",
    amount: 480000,
    branchName: "Chi nhánh Phú Nhuận",
    createdBy: "Trần Hải Yến",
    approvalStatus: "approved",
    createdAt: "2026-02-25T11:15:00",
  },
  {
    id: "txn_018",
    code: "PT-20260224-001",
    title: "Thu dịch vụ bảo hành mở rộng",
    kind: "income",
    categoryId: "service_income",
    fundId: "mb_bank",
    amount: 4200000,
    branchName: "Trung tâm bảo hành",
    createdBy: "Phạm Quốc Huy",
    approvalStatus: "rejected",
    relatedEntity: "Khách hàng doanh nghiệp",
    createdAt: "2026-02-24T15:45:00",
  },
];

export const initialFinanceDebts: FinanceDebt[] = [
  {
    id: "debt_001",
    code: "CN-PT-202603-001",
    name: "Nguyễn Hải Đăng",
    kind: "receivable",
    amount: 6800000,
    dueDate: "2026-03-03",
    status: "upcoming",
    fundId: "morning_cashier",
    branchName: "Chi nhánh Phú Nhuận",
    ownerName: "Trần Hải Yến",
  },
  {
    id: "debt_002",
    code: "CN-PT-202602-014",
    name: "Công ty Minh Quang",
    kind: "receivable",
    amount: 12500000,
    dueDate: "2026-02-25",
    status: "overdue",
    fundId: "mb_bank",
    branchName: "Chi nhánh Quận 1",
    ownerName: "Nguyễn Minh Tâm",
  },
  {
    id: "debt_003",
    code: "CN-PC-202603-003",
    name: "NCC Thiên Phúc",
    kind: "payable",
    amount: 15800000,
    dueDate: "2026-03-05",
    status: "active",
    fundId: "mb_bank",
    branchName: "Kho tổng Bình Tân",
    ownerName: "Lê Hoàng Nam",
  },
  {
    id: "debt_004",
    code: "CN-PC-202602-011",
    name: "NCC Ánh Dương",
    kind: "payable",
    amount: 9400000,
    dueDate: "2026-02-26",
    status: "overdue",
    fundId: "mb_bank",
    branchName: "Chi nhánh Quận 1",
    ownerName: "Lê Hoàng Nam",
  },
  {
    id: "debt_005",
    code: "CN-PT-202603-005",
    name: "Siêu thị An Lộc",
    kind: "receivable",
    amount: 21300000,
    dueDate: "2026-03-07",
    status: "active",
    fundId: "techcombank_main",
    branchName: "Chi nhánh Thủ Đức",
    ownerName: "Đỗ Thu Hà",
  },
  {
    id: "debt_006",
    code: "CN-PT-202603-006",
    name: "Cửa hàng Hồng Phát",
    kind: "receivable",
    amount: 4950000,
    dueDate: "2026-03-02",
    status: "upcoming",
    fundId: "counter_cash",
    branchName: "Chi nhánh Phú Nhuận",
    ownerName: "Trần Hải Yến",
  },
  {
    id: "debt_007",
    code: "CN-PC-202603-007",
    name: "NCC Minh Tâm Logistics",
    kind: "payable",
    amount: 7200000,
    dueDate: "2026-03-08",
    status: "active",
    fundId: "delivery_cash",
    branchName: "Đội giao nhận nội thành",
    ownerName: "Phạm Quốc Huy",
  },
  {
    id: "debt_008",
    code: "CN-PC-202603-008",
    name: "NCC Văn phòng phẩm Gia Hân",
    kind: "payable",
    amount: 1680000,
    dueDate: "2026-03-01",
    status: "upcoming",
    fundId: "morning_cashier",
    branchName: "Chi nhánh Phú Nhuận",
    ownerName: "Trần Hải Yến",
  },
  {
    id: "debt_009",
    code: "CN-PT-202602-002",
    name: "Công ty Vạn Tín",
    kind: "receivable",
    amount: 8900000,
    dueDate: "2026-02-20",
    status: "paid",
    fundId: "mb_bank",
    branchName: "Chi nhánh Quận 1",
    ownerName: "Nguyễn Minh Tâm",
  },
  {
    id: "debt_010",
    code: "CN-PC-202602-010",
    name: "NCC Điện lạnh Nhật Minh",
    kind: "payable",
    amount: 12400000,
    dueDate: "2026-02-23",
    status: "overdue",
    fundId: "techcombank_main",
    branchName: "Chi nhánh Thủ Đức",
    ownerName: "Đỗ Thu Hà",
  },
];

export const financeCashBookKindOptions: FinanceOption<FinanceCashBookKindFilter>[] = [
  { value: "all", label: "Tất cả" },
  { value: "income", label: "Thu" },
  { value: "expense", label: "Chi" },
];

export const financeCashBookPeriodOptions: FinanceOption<FinanceCashBookPeriodFilter>[] = [
  { value: "this_month", label: "Tháng này" },
  { value: "all", label: "Toàn bộ" },
];

export const financeDebtFilterOptions: FinanceOption<FinanceDebtFilter>[] = [
  { value: "all", label: "Tất cả" },
  { value: "receivable", label: "Phải thu (KH)" },
  { value: "payable", label: "Phải trả (NCC)" },
  { value: "overdue", label: "Quá hạn" },
];

export const financeFundTypeLabels: Record<FinanceFund["type"], string> = {
  bank: "Ngân hàng",
  cash: "Tiền mặt",
};

export const financeDebtStatusMap: Record<FinanceDebtStatus, FinanceDebtStatusMeta> = {
  active: {
    label: "Còn hạn",
    tone: "neutral",
  },
  upcoming: {
    label: "Sắp đến hạn",
    tone: "warning",
  },
  overdue: {
    label: "Quá hạn",
    tone: "danger",
  },
  paid: {
    label: "Đã thanh toán",
    tone: "success",
  },
};

export const financeApprovalStatusMap: Record<FinanceApprovalStatus, FinanceApprovalStatusMeta> = {
  approved: {
    label: "Đã duyệt",
    tone: "success",
  },
  pending: {
    label: "Chờ duyệt",
    tone: "warning",
  },
  rejected: {
    label: "Từ chối",
    tone: "danger",
  },
};

export const financeFundQuickFacts: string[] = [
  "Cho phép dùng khi tạo phiếu thu/chi",
  "Có thể liên kết với giao dịch công nợ",
  "Hỗ trợ kiểm kê cuối ca nếu là quỹ tiền mặt",
];

export const financeDebtPaymentSuccessMessage =
  "Đã mô phỏng thanh toán thành công: tự động ghi nhận phiếu thu, cập nhật quỹ, gạch công nợ và chuyển trạng thái sang Đã thanh toán.";

export function getFinanceCategoriesMock() {
  return financeCategories.map((item) => ({ ...item }));
}

export function getFinanceFundsMock() {
  return financeFunds.map((item) => ({ ...item }));
}

export function getFinanceTransactionsMock() {
  return financeTransactions.map((item) => ({ ...item }));
}

export function getFinanceDebtsMock() {
  return initialFinanceDebts.map((item) => ({ ...item }));
}

export function getFinanceCategoriesByKind(kind: FinanceTransactionKind) {
  return getFinanceCategoriesMock().filter((item) => item.kind === kind);
}

export function getFinanceDashboardMock(): FinanceDashboardMockResponse {
  return {
    funds: getFinanceFundsMock(),
    transactions: getFinanceTransactionsMock(),
    debts: getFinanceDebtsMock(),
  };
}

export function getFinanceCashBookMock(): FinanceCashBookMockResponse {
  const records = getFinanceTransactionsMock();

  return {
    records,
    total: records.length,
    filters: {
      kinds: financeCashBookKindOptions.map((item) => ({ ...item })),
      periods: financeCashBookPeriodOptions.map((item) => ({ ...item })),
      funds: getFinanceFundsMock(),
    },
  };
}

export function getFinanceFundManagementMock(): FinanceFundManagementMockResponse {
  return {
    funds: getFinanceFundsMock(),
    transactions: getFinanceTransactionsMock(),
  };
}

export function getFinanceDebtManagementMock(): FinanceDebtManagementMockResponse {
  const debts = getFinanceDebtsMock();

  return {
    debts,
    total: debts.length,
    filters: financeDebtFilterOptions.map((item) => ({ ...item })),
  };
}
