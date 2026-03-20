import React, { useMemo, useState } from "react";
import Button from "components/button/button";
import { FinanceData, formatVnd } from "../financeTypes";
import "./Common.scss";

type Props = { data: FinanceData };

const VatInvoice: React.FC<Props> = ({ data }) => {
  const [tab, setTab] = useState<"all" | "pending" | "issued" | "cancelled">("all");

  const rows = useMemo(() => {
    if (tab === "all") return data.invoices;
    return data.invoices.filter((i) => i.status === tab);
  }, [data, tab]);

  const counts = useMemo(() => {
    const pending = data.invoices.filter((i) => i.status === "pending").length;
    const issued = data.invoices.filter((i) => i.status === "issued").length;
    const cancelled = data.invoices.filter((i) => i.status === "cancelled").length;
    return { pending, issued, cancelled };
  }, [data]);

  const stMap = {
    issued: { label: "Đã xuất HĐ", cls: "bg" },
    pending: { label: "Chưa xuất", cls: "ba" },
    cancelled: { label: "Đã hủy", cls: "br" },
  } as const;

  return (
    <div className="fin-screen">
      <div className="banner mb16">
        <div className="banner-left">
          <div className="banner-title">🧾 Hóa đơn điện tử – Kết nối nhà cung cấp HĐĐT</div>
          <div className="banner-sub">
            Đã liên kết: <b className="c-gr">Viettel sinvoice</b> · Ký số: <b className="c-gr">Đang hoạt động ✓</b> · Mẫu số: <b>1C25TBK</b>
          </div>
        </div>
        <div className="banner-right">
          <Button color="secondary" variant="outline">
            Đổi nhà cung cấp
          </Button>
          <Button color="primary">+ Tạo hóa đơn</Button>
        </div>
      </div>

      <div className="card">
        <div className="tabs mb16">
          <button className={`tab${tab === "all" ? " active" : ""}`} onClick={() => setTab("all")}>
            Tất cả ({data.invoices.length})
          </button>
          <button className={`tab${tab === "pending" ? " active" : ""}`} onClick={() => setTab("pending")}>
            Chưa xuất ({counts.pending})
          </button>
          <button className={`tab${tab === "issued" ? " active" : ""}`} onClick={() => setTab("issued")}>
            Đã xuất ({counts.issued})
          </button>
          <button className={`tab${tab === "cancelled" ? " active" : ""}`} onClick={() => setTab("cancelled")}>
            Đã hủy ({counts.cancelled})
          </button>

          <div className="tabs-right">
            <Button color="secondary" variant="outline">
              Xuất Excel
            </Button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Số HĐ</th>
                <th>Ngày</th>
                <th>Khách hàng</th>
                <th className="hide-m">MST</th>
                <th className="tr">Tiền hàng</th>
                <th className="tr hide-m">VAT 10%</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr key={inv.id}>
                  <td className="mono blue">{inv.id}</td>
                  <td className="muted">{inv.date}</td>
                  <td className="fw">{inv.customer}</td>
                  <td className="hide-m muted mono">{inv.tax || "—"}</td>
                  <td className="tr mono fw">{formatVnd(inv.total)}</td>
                  <td className="tr mono c-am hide-m">{formatVnd(inv.vat)}</td>
                  <td>
                    <span className={`badge ${stMap[inv.status].cls}`}>{stMap[inv.status].label}</span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VatInvoice;
