import React, { useEffect, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";
import Loading from "components/loading";
import { showToast } from "utils/common";
import { formatDate } from "utils/dateUtils";
import { urlsApi } from "configs/urls";
import "./index.scss";

interface IReferralItem {
  id: number;
  referrerId: number;
  referrerName: string;
  referrerPhone?: string;
  referredId: number | null;
  referredName: string | null;
  referredPhone?: string;
  referralCode: string;
  status: "pending" | "registered" | "first_purchase" | "rewarded" | "expired";
  rewardPoints: number;
  rewardVoucher?: string;
  invitedAt: string;
  registeredAt?: string | null;
  firstPurchaseAt?: string | null;
  rewardedAt?: string | null;
}

interface IReferralStats {
  totalInvites: number;
  totalRegistered: number;
  totalFirstPurchase: number;
  totalRewarded: number;
  totalPointsPaid: number;
  conversionRate: number;
}

interface IReferralRule {
  id?: number;
  enabled: boolean;
  referrerReward: number;
  refereeReward: number;
  rewardTrigger: "registered" | "first_purchase";
  firstPurchaseMinValue: number;
  expiryDays: number;
  refereeVoucherCode?: string;
  maxInvitesPerMonth: number;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:        { label: "Đã mời",          color: "#9CA3AF" },
  registered:     { label: "Đã đăng ký",      color: "#3B82F6" },
  first_purchase: { label: "Đã mua lần đầu",  color: "#8B5CF6" },
  rewarded:       { label: "Đã trao thưởng",  color: "#10B981" },
  expired:        { label: "Hết hạn",         color: "#DC2626" },
};

function fmtNum(v: number) {
  return (v ?? 0).toLocaleString("vi-VN");
}

export default function LoyaltyReferral({ onBackProps }: { onBackProps?: (v: boolean) => void }) {
  document.title = "Chương trình giới thiệu bạn bè";

  const [tab, setTab] = useState<"list" | "rule">("list");

  const [items, setItems] = useState<IReferralItem[]>([]);
  const [stats, setStats] = useState<IReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [rule, setRule] = useState<IReferralRule | null>(null);
  const [ruleLoading, setRuleLoading] = useState(false);
  const [ruleSaving, setRuleSaving] = useState(false);

  useEffect(() => {
    if (tab !== "list") return;
    const ctrl = new AbortController();
    (async () => {
      setIsLoading(true);
      try {
        const [listRes, statsRes] = await Promise.all([
          fetch(`${urlsApi.ma.referralList}?page=${page}&limit=20`, { signal: ctrl.signal }).then(r => r.json()),
          fetch(urlsApi.ma.referralStats, { signal: ctrl.signal }).then(r => r.json()),
        ]);
        if (listRes?.code === 0) {
          setItems(listRes.result?.items ?? []);
          setTotal(listRes.result?.total ?? 0);
        }
        if (statsRes?.code === 0) setStats(statsRes.result);
      } catch (e: unknown) {
        if (e?.name !== "AbortError") showToast("Không tải được danh sách giới thiệu", "error");
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [tab, page]);

  useEffect(() => {
    if (tab !== "rule") return;
    const ctrl = new AbortController();
    (async () => {
      setRuleLoading(true);
      try {
        const res = await fetch(urlsApi.ma.referralRule, { signal: ctrl.signal }).then(r => r.json());
        if (res?.code === 0) {
          setRule(res.result ?? {
            enabled: false,
            referrerReward: 50000,
            refereeReward: 20000,
            rewardTrigger: "first_purchase",
            firstPurchaseMinValue: 200000,
            expiryDays: 30,
            maxInvitesPerMonth: 20,
          });
        }
      } catch (e: unknown) {
        if (e?.name !== "AbortError") showToast("Không tải được quy tắc", "error");
      } finally {
        setRuleLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [tab]);

  const saveRule = async () => {
    if (!rule) return;
    setRuleSaving(true);
    try {
      const res = await fetch(urlsApi.ma.referralRuleUpdate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rule),
      }).then(r => r.json());
      if (res?.code === 0) {
        showToast("Lưu quy tắc thành công", "success");
      } else {
        showToast(res?.message ?? "Lỗi lưu quy tắc", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setRuleSaving(false);
    }
  };

  const statCards = [
    { label: "Tổng lượt mời",     value: stats ? fmtNum(stats.totalInvites)       : "—", color: "purple" },
    { label: "Đã đăng ký",        value: stats ? fmtNum(stats.totalRegistered)    : "—", color: "blue" },
    { label: "Đã mua lần đầu",    value: stats ? fmtNum(stats.totalFirstPurchase) : "—", color: "green" },
    { label: "Đã trao thưởng",    value: stats ? fmtNum(stats.totalRewarded)      : "—", color: "orange" },
    { label: "Điểm đã trao",      value: stats ? fmtNum(stats.totalPointsPaid)    : "—", color: "purple" },
    { label: "Tỷ lệ chuyển đổi",  value: stats ? `${stats.conversionRate}%`       : "—", color: "blue" },
  ];

  return (
    <div className="page-content referral-page">
      <HeaderTabMenu
        title="Chương trình giới thiệu bạn bè"
        titleBack="Loyalty"
        onBackProps={onBackProps ?? (() => { /* standalone */ })}
      />

      <div className="referral-tab-nav">
        <button className={`referral-tab-btn${tab === "list" ? " active" : ""}`} onClick={() => setTab("list")}>
          Danh sách giới thiệu
        </button>
        <button className={`referral-tab-btn${tab === "rule" ? " active" : ""}`} onClick={() => setTab("rule")}>
          Quy tắc thưởng
        </button>
      </div>

      {tab === "list" && (
        <>
          <div className="promo-stats-grid referral-stats">
            {statCards.map(s => (
              <div key={s.label} className={`promo-stat-card promo-stat-card--${s.color}`}>
                <div className="promo-stat-card__body">
                  <div className="promo-stat-card__content">
                    <p className="promo-stat-card__label">{s.label}</p>
                    <p className="promo-stat-card__value">{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isLoading ? (
            <Loading />
          ) : items.length === 0 ? (
            <div className="referral-empty">
              <h3>Chưa có lượt giới thiệu nào</h3>
              <p>Khi khách hàng chia sẻ mã giới thiệu và bạn bè họ đăng ký, lượt đó sẽ hiện tại đây.</p>
            </div>
          ) : (
            <div className="referral-table-wrap">
              <table className="referral-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Người giới thiệu</th>
                    <th>Người được giới thiệu</th>
                    <th>Mã</th>
                    <th>Trạng thái</th>
                    <th>Điểm thưởng</th>
                    <th>Mời lúc</th>
                    <th>Mua lần đầu</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const st = STATUS_LABEL[it.status] ?? STATUS_LABEL.pending;
                    return (
                      <tr key={it.id}>
                        <td>{(page - 1) * 20 + i + 1}</td>
                        <td>
                          <div className="cell-name">
                            <strong>{it.referrerName}</strong>
                            {it.referrerPhone && <span className="phone">{it.referrerPhone}</span>}
                          </div>
                        </td>
                        <td>
                          {it.referredName ? (
                            <div className="cell-name">
                              <strong>{it.referredName}</strong>
                              {it.referredPhone && <span className="phone">{it.referredPhone}</span>}
                            </div>
                          ) : <span className="muted">— chưa đăng ký —</span>}
                        </td>
                        <td><code className="referral-code">{it.referralCode}</code></td>
                        <td>
                          <span className="status-badge" style={{ color: st.color, borderColor: st.color }}>
                            {st.label}
                          </span>
                        </td>
                        <td>
                          {it.rewardPoints > 0 ? <strong>{fmtNum(it.rewardPoints)}</strong> : "—"}
                        </td>
                        <td>{it.invitedAt ? formatDate(it.invitedAt) : "—"}</td>
                        <td>{it.firstPurchaseAt ? formatDate(it.firstPurchaseAt) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {total > 20 && (
                <div className="referral-pagination">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <Icon name="ArrowLeft" /> Trước
                  </button>
                  <span>Trang {page} / {Math.ceil(total / 20)}</span>
                  <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>
                    Sau <Icon name="ArrowRight" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === "rule" && (
        <div className="referral-rule">
          {ruleLoading || !rule ? (
            <Loading />
          ) : (
            <div className="rule-form">
              <div className="rule-row rule-row--enable">
                <label>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={e => setRule({ ...rule, enabled: e.target.checked })}
                  />
                  <span>Bật chương trình giới thiệu</span>
                </label>
              </div>

              <div className="rule-grid">
                <div className="rule-field">
                  <label>Điểm thưởng cho người giới thiệu</label>
                  <input
                    type="number"
                    value={rule.referrerReward}
                    onChange={e => setRule({ ...rule, referrerReward: +e.target.value })}
                  />
                </div>

                <div className="rule-field">
                  <label>Điểm thưởng cho người được giới thiệu</label>
                  <input
                    type="number"
                    value={rule.refereeReward}
                    onChange={e => setRule({ ...rule, refereeReward: +e.target.value })}
                  />
                </div>

                <div className="rule-field">
                  <label>Kích hoạt thưởng khi</label>
                  <select
                    value={rule.rewardTrigger}
                    onChange={e => setRule({ ...rule, rewardTrigger: e.target.value as "registered" | "first_purchase" })}
                  >
                    <option value="registered">Đăng ký thành công</option>
                    <option value="first_purchase">Hoàn thành đơn hàng đầu tiên</option>
                  </select>
                </div>

                <div className="rule-field">
                  <label>Giá trị đơn hàng tối thiểu (VND)</label>
                  <input
                    type="number"
                    value={rule.firstPurchaseMinValue}
                    onChange={e => setRule({ ...rule, firstPurchaseMinValue: +e.target.value })}
                    disabled={rule.rewardTrigger !== "first_purchase"}
                  />
                </div>

                <div className="rule-field">
                  <label>Hạn sử dụng mã (ngày)</label>
                  <input
                    type="number"
                    value={rule.expiryDays}
                    onChange={e => setRule({ ...rule, expiryDays: +e.target.value })}
                  />
                </div>

                <div className="rule-field">
                  <label>Tối đa lượt mời / tháng / người</label>
                  <input
                    type="number"
                    value={rule.maxInvitesPerMonth}
                    onChange={e => setRule({ ...rule, maxInvitesPerMonth: +e.target.value })}
                  />
                </div>

                <div className="rule-field rule-field--full">
                  <label>Voucher kèm theo cho người được giới thiệu (mã voucher)</label>
                  <input
                    type="text"
                    placeholder="VD: WELCOME100K"
                    value={rule.refereeVoucherCode ?? ""}
                    onChange={e => setRule({ ...rule, refereeVoucherCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="rule-actions">
                <button
                  className="btn-save"
                  disabled={ruleSaving}
                  onClick={saveRule}
                >
                  {ruleSaving ? "Đang lưu..." : "Lưu quy tắc"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
