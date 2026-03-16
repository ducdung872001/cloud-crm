import React, { useMemo, useState } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import "./OpenShift.scss";

export default function OpenShiftTab() {
  const [tab, setTab] = useState<string>("total");
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const denominations = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];
  const [counts, setCounts] = useState<{ [key: number]: number }>({});

  const calcDenomTotal = useMemo(() => {
    return Object.entries(counts).reduce((sum, [val, count]) => sum + Number(val) * count, 0);
  }, [counts]);

  const handleCountChange = (val: number, count: string) => {
    const numCount = parseInt(count) || 0;
    setCounts({ ...counts, [val]: numCount });
  };

  const finalAmount = tab === "total" ? totalAmount : calcDenomTotal;

  return (
    <div className="page-open-shift">
      <div className="action-header">
        <div className="title__actions">
          <ul className="menu-list">
            <li className={tab === "total" ? "active" : ""} onClick={() => setTab("total")}>
              Nhập tổng tiền
            </li>
            <li className={tab === "denom" ? "active" : ""} onClick={() => setTab("denom")}>
              Nhập theo mệnh giá
            </li>
          </ul>
        </div>
      </div>

      <div className="p-24 open-shift-body">
        <div className="instruction-text mb-24">
          <p className="text-muted">Nhập số tiền mặt thực tế có trong két để bắt đầu phiên làm việc.</p>
        </div>

        {tab === "total" ? (
          <div className="input-total-wrapper">
            <div className="base-form-group">
              <label className="fw-700 mb-12 d-block">Tổng tiền mặt (VNĐ)</label>
              <div className="big-input-container">
                <input type="number" placeholder="0" value={totalAmount || ""} onChange={(e) => setTotalAmount(Number(e.target.value))} />
                <Icon name="Banknote" />
              </div>
            </div>
          </div>
        ) : (
          <div className="denom-grid-layout">
            {denominations.map((val) => (
              <div key={val} className="denom-item-card">
                <div className="denom-label">{val.toLocaleString()} đ</div>
                <div className="denom-input-box">
                  <input type="number" placeholder="0" value={counts[val] || ""} onChange={(e) => handleCountChange(val, e.target.value)} />
                  <span className="unit">tờ</span>
                </div>
                <div className="denom-subtotal">= {((counts[val] || 0) * val).toLocaleString()} đ</div>
              </div>
            ))}
          </div>
        )}

        <div className="open-shift-footer mt-32">
          <div className="total-display">
            <span className="label">TỔNG TIỀN ĐẦU CA:</span>
            <span className="value text-primary">{finalAmount.toLocaleString()} VNĐ</span>
          </div>
          <div className="actions">
            <Button color="primary" className="btn-confirm-shift">
              <Icon name="Checked" className="mr-8" /> XÁC NHẬN VÀO CA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
