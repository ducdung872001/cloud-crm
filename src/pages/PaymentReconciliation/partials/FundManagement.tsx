import React, { useMemo } from "react";
import Button from "components/button/button";
import { FinanceData, formatVnd, pct } from "../financeTypes";
import "./Common.scss";

type Props = {
  data: FinanceData;
  onTransfer: () => void;
};

const FundManagement: React.FC<Props> = ({ data, onTransfer }) => {
  const totalFunds = useMemo(() => data.funds.reduce((a, f) => a + f.balance, 0), [data]);

  return (
    <div className="fin-screen">
      <div className="banner mb16">
        <div className="banner-left">
          <div className="banner-kicker">Tổng tồn quỹ tất cả nguồn tiền</div>
          <div className="banner-title big">{formatVnd(totalFunds)}</div>
          <div className="banner-sub">{data.funds.length} nguồn tiền · Cập nhật lúc 19:47</div>
        </div>
        <div className="banner-right">
          <Button color="secondary" variant="outline" onClick={onTransfer}>
            Chuyển quỹ
          </Button>
          <Button color="primary">+ Thêm quỹ</Button>
        </div>
      </div>

      <div className="grid2 mb16">
        {data.funds.map((f) => (
          <div className="card fund-card" key={f.id}>
            <div className="fund-top">
              <div className="left">
                <div className="fund-ic">{f.icon}</div>
                <div>
                  <div className="fw">{f.name}</div>
                  <div className="muted">{f.type === "cash" ? "Tiền mặt tại quầy" : f.type === "bank" ? "Tài khoản ngân hàng" : "Ví điện tử"}</div>
                </div>
              </div>
              <Button color="secondary" variant="outline">
                Sửa
              </Button>
            </div>

            <div className="fund-balance">{formatVnd(f.balance)}</div>

            <div className="prog">
              <div className="prog-b" style={{ width: `${pct(f.balance, totalFunds)}%` }} />
            </div>

            <div className="fund-foot">
              <span className="muted">{pct(f.balance, totalFunds)}% tổng quỹ</span>
              <Button color="secondary" variant="outline">
                Xem giao dịch
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Kiểm kê quỹ tiền mặt cuối ca</div>
            <div className="card-sub">Lần cuối: 15/03/2026 18:00</div>
          </div>
          <Button color="primary">Kiểm kê ngay</Button>
        </div>

        <div className="grid3">
          {[
            ["Tồn đầu kỳ", "45.200.000 VND"],
            ["Tổng thu TM", "12.950.000 VND"],
            ["Tổng chi TM", "5.350.000 VND"],
            ["Tồn theo sổ sách", "52.800.000 VND"],
            ["Thực tế kiểm kê", "52.800.000 VND"],
            ["Chênh lệch", "0 VND"],
          ].map(([l, v]) => (
            <div className="mini-card" key={l}>
              <div className="mini-lbl">{l}</div>
              <div className="mini-val">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FundManagement;
