import { FinanceData } from "./financeTypes";

export function useFinanceMock(): FinanceData {
  const funds: FinanceData["funds"] = [
    { id: "F1", name: "Tiền mặt tại quầy", icon: "💵", balance: 52800000, type: "cash", color: "gr" },
    { id: "F2", name: "Vietcombank ****1234", icon: "🏦", balance: 184200000, type: "bank", color: "bl" },
    { id: "F3", name: "Techcombank ****5678", icon: "🏦", balance: 96300000, type: "bank", color: "pu" },
    { id: "F4", name: "VNPay QR", icon: "📱", balance: 8450000, type: "ewallet", color: "am" },
  ];

  const txs: FinanceData["txs"] = [
    {
      id: "PT-20260316-001",
      date: "16/03/2026",
      grp: "16/03/2026",
      desc: "Thu tiền đơn hàng #SO-2318",
      meta: "Techcombank vận hành | Chi nhánh Quận 1 | Nguyễn Minh Tâm",
      cat: "Thu bán hàng",
      fund: "Techcombank",
      amount: 31200000,
      type: "thu",
      status: "approved",
    },
    {
      id: "PC-20260316-001",
      date: "16/03/2026",
      grp: "16/03/2026",
      desc: "Chi phí nhập lô hàng điện máy đợt 2",
      meta: "Ngân hàng MB | Kho tổng Bình Tân | Lê Hoàng Nam",
      cat: "Chi nhập hàng",
      fund: "MB Bank",
      amount: 18600000,
      type: "chi",
      status: "approved",
    },
    {
      id: "PT-20260316-002",
      date: "16/03/2026",
      grp: "16/03/2026",
      desc: "Thu nợ khách hàng cũ",
      meta: "Kết thu ngân ca sáng | Chi nhánh Phú Nhuận | Trần Hải Yến",
      cat: "Thu công nợ",
      fund: "Tiền mặt",
      amount: 6800000,
      type: "thu",
      status: "approved",
    },
    {
      id: "PC-20260315-001",
      date: "15/03/2026",
      grp: "15/03/2026",
      desc: "Chi lương nhân viên tháng 3/2026",
      meta: "Techcombank ****5678 | HQ | Kế toán trưởng",
      cat: "Chi nhân sự",
      fund: "Techcombank",
      amount: 28000000,
      type: "chi",
      status: "approved",
    },
    {
      id: "PT-20260315-001",
      date: "15/03/2026",
      grp: "15/03/2026",
      desc: "Thu tiền đặt cọc đơn hàng online",
      meta: "VNPay QR | Kênh online | Lê Văn Bình",
      cat: "Thu bán hàng",
      fund: "VNPay",
      amount: 3500000,
      type: "thu",
      status: "pending",
    },
    {
      id: "PC-20260314-001",
      date: "14/03/2026",
      grp: "14/03/2026",
      desc: "Chi thuê mặt bằng tháng 3/2026",
      meta: "Techcombank ****5678 | HQ | Ban giám đốc",
      cat: "Chi vận hành",
      fund: "Techcombank",
      amount: 15000000,
      type: "chi",
      status: "approved",
    },
    {
      id: "PT-20260314-001",
      date: "14/03/2026",
      grp: "14/03/2026",
      desc: "Thu tiền bán hàng #SO-2312",
      meta: "VCB ****1234 | Chi nhánh Gò Vấp | Phạm Thu Hà",
      cat: "Thu bán hàng",
      fund: "VCB",
      amount: 8900000,
      type: "thu",
      status: "approved",
    },
  ];

  const invoices: FinanceData["invoices"] = [
    { id: "HĐ-0201", date: "16/03/2026", customer: "Công ty CP Thanh Long", tax: "0123456789", total: 48500000, vat: 4850000, status: "issued" },
    { id: "HĐ-0200", date: "15/03/2026", customer: "Siêu thị Mini Hà Đông", tax: "0987654321", total: 22000000, vat: 2200000, status: "issued" },
    { id: "HĐ-0199", date: "14/03/2026", customer: "Nguyễn Thị Hoa", tax: "", total: 8750000, vat: 875000, status: "pending" },
    { id: "HĐ-0198", date: "13/03/2026", customer: "Cửa hàng Đức Thắng", tax: "0345678901", total: 15600000, vat: 1560000, status: "pending" },
    { id: "HĐ-0197", date: "12/03/2026", customer: "Công ty TNHH Bảo Trâm", tax: "0567890123", total: 33200000, vat: 3320000, status: "cancelled" },
  ];

  const debts: FinanceData["debts"] = [
    { id: "D001", partner: "TNHH Minh Hoàng", type: "payable", amount: 45000000, paid: 20000000, due: "25/03", status: "partial" },
    { id: "D002", partner: "Siêu thị Bách Hóa Xanh", type: "receivable", amount: 18500000, paid: 0, due: "20/03", status: "overdue" },
    { id: "D003", partner: "Nguyễn Văn Minh", type: "receivable", amount: 7200000, paid: 7200000, due: "10/03", status: "paid" },
    { id: "D004", partner: "NCC Thanh Long Foods", type: "payable", amount: 62000000, paid: 62000000, due: "01/03", status: "paid" },
    { id: "D005", partner: "Cửa hàng ABC Store", type: "receivable", amount: 29000000, paid: 15000000, due: "30/03", status: "partial" },
  ];

  const bankStmts: FinanceData["bankStmts"] = [
    { date: "16/03", ref: "FT26075123", desc: "TT don hang SO2318", amount: 31200000, type: "thu", matched: true },
    { date: "16/03", ref: "FT26075234", desc: "KH Nguyen Lan chuyen khoan", amount: 8750000, type: "thu", matched: true },
    { date: "15/03", ref: "FT26074345", desc: "CHUYEN TIEN LUONG T3/2026", amount: 28000000, type: "chi", matched: false },
    { date: "15/03", ref: "FT26074456", desc: "VNPAY QR giao dich online", amount: 3500000, type: "thu", matched: true },
    { date: "14/03", ref: "FT26073567", desc: "TT nha cung cap Minh Hoang", amount: 12500000, type: "chi", matched: false },
  ];

  return { funds, txs, invoices, debts, bankStmts };
}
