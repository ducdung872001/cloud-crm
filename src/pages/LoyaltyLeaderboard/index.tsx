import React, { useEffect, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";
import Loading from "components/loading";
import { showToast } from "utils/common";
import { urlsApi } from "configs/urls";
import "./index.scss";

interface ILeaderRow {
  rank: number;
  customerId: number;
  customerName: string;
  customerAvatar?: string;
  tierName: string;
  tierColor?: string;
  points: number;
  spend: number;
  badges: string[];
}

interface IBadgeDef {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedCount: number;
}

type Period = "week" | "month" | "quarter" | "all";

const PERIOD_LABEL: Record<Period, string> = {
  week: "Tuần này",
  month: "Tháng này",
  quarter: "Quý này",
  all: "Tất cả thời gian",
};

const RANK_DECOR: Record<number, { label: string; color: string }> = {
  1: { label: "🥇", color: "#F59E0B" },
  2: { label: "🥈", color: "#94A3B8" },
  3: { label: "🥉", color: "#B45309" },
};

function fmtNum(v: number) { return (v ?? 0).toLocaleString("vi-VN"); }

export default function LoyaltyLeaderboard({ onBackProps }: { onBackProps?: (v: boolean) => void }) {
  document.title = "Bảng xếp hạng & Huy hiệu";

  const [tab, setTab] = useState<"leaderboard" | "badges">("leaderboard");
  const [period, setPeriod] = useState<Period>("month");

  const [rows, setRows] = useState<ILeaderRow[]>([]);
  const [badges, setBadges] = useState<IBadgeDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tab !== "leaderboard") return;
    const ctrl = new AbortController();
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${urlsApi.ma.gamificationLeaderboard}?period=${period}&limit=50`,
          { signal: ctrl.signal },
        ).then(r => r.json());
        if (res?.code === 0) {
          setRows(res.result?.items ?? []);
        } else {
          showToast(res?.message ?? "Không tải được bảng xếp hạng", "error");
        }
      } catch (e: unknown) {
        if (e?.name !== "AbortError") showToast("Lỗi kết nối máy chủ", "error");
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [tab, period]);

  useEffect(() => {
    if (tab !== "badges") return;
    const ctrl = new AbortController();
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(urlsApi.ma.gamificationBadges, { signal: ctrl.signal }).then(r => r.json());
        if (res?.code === 0) {
          setBadges(res.result?.items ?? []);
        }
      } catch (e: unknown) {
        if (e?.name !== "AbortError") showToast("Lỗi kết nối máy chủ", "error");
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [tab]);

  return (
    <div className="page-content leaderboard-page">
      <HeaderTabMenu
        title="Bảng xếp hạng & Huy hiệu"
        titleBack="Loyalty"
        onBackProps={onBackProps ?? (() => { /* standalone */ })}
      />

      <div className="lb-tab-nav">
        <button className={`lb-tab-btn${tab === "leaderboard" ? " active" : ""}`} onClick={() => setTab("leaderboard")}>
          Bảng xếp hạng
        </button>
        <button className={`lb-tab-btn${tab === "badges" ? " active" : ""}`} onClick={() => setTab("badges")}>
          Huy hiệu
        </button>
      </div>

      {tab === "leaderboard" && (
        <div className="lb-section">
          <div className="lb-period-filter">
            {(Object.keys(PERIOD_LABEL) as Period[]).map(p => (
              <button
                key={p}
                className={`lb-period-btn${period === p ? " active" : ""}`}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABEL[p]}
              </button>
            ))}
          </div>

          {isLoading ? (
            <Loading />
          ) : rows.length === 0 ? (
            <div className="lb-empty">Chưa có dữ liệu cho kỳ {PERIOD_LABEL[period].toLowerCase()}.</div>
          ) : (
            <div className="lb-list">
              {rows.slice(0, 3).length > 0 && (
                <div className="lb-podium">
                  {rows.slice(0, 3).map(r => (
                    <div key={r.customerId} className={`podium-card podium-${r.rank}`}>
                      <div className="podium-rank">{RANK_DECOR[r.rank]?.label}</div>
                      <div className="podium-avatar" style={{ background: r.tierColor ?? "#6366F1" }}>
                        {r.customerName?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div className="podium-name">{r.customerName}</div>
                      <div className="podium-tier" style={{ color: r.tierColor ?? "#6366F1" }}>{r.tierName}</div>
                      <div className="podium-points"><strong>{fmtNum(r.points)}</strong> điểm</div>
                    </div>
                  ))}
                </div>
              )}

              <table className="lb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Khách hàng</th>
                    <th>Hạng</th>
                    <th>Điểm</th>
                    <th>Chi tiêu</th>
                    <th>Huy hiệu</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const decor = RANK_DECOR[r.rank];
                    return (
                      <tr key={r.customerId} className={r.rank <= 3 ? "highlight" : ""}>
                        <td>
                          {decor ? (
                            <span className="rank-decor" style={{ color: decor.color }}>{decor.label}</span>
                          ) : (
                            <span className="rank-num">{r.rank}</span>
                          )}
                        </td>
                        <td>
                          <div className="lb-customer">
                            <div className="avatar" style={{ background: r.tierColor ?? "#6366F1" }}>
                              {r.customerName?.charAt(0)?.toUpperCase()}
                            </div>
                            <strong>{r.customerName}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="tier-badge" style={{ background: r.tierColor ?? "#6366F1" }}>
                            {r.tierName}
                          </span>
                        </td>
                        <td><strong>{fmtNum(r.points)}</strong></td>
                        <td>{fmtNum(r.spend)} đ</td>
                        <td>
                          <div className="badges-inline">
                            {(r.badges ?? []).slice(0, 3).map(b => (
                              <span key={b} className="badge-pill">{b}</span>
                            ))}
                            {r.badges && r.badges.length > 3 && (
                              <span className="badge-more">+{r.badges.length - 3}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "badges" && (
        <div className="lb-section">
          {isLoading ? (
            <Loading />
          ) : badges.length === 0 ? (
            <div className="lb-empty">Chưa có huy hiệu nào được cấu hình.</div>
          ) : (
            <div className="badges-grid">
              {badges.map(b => (
                <div key={b.code} className="badge-card" style={{ borderTopColor: b.color }}>
                  <div className="badge-icon" style={{ background: b.color }}>
                    <Icon name={b.icon as never} />
                  </div>
                  <div className="badge-name">{b.name}</div>
                  <div className="badge-desc">{b.description}</div>
                  <div className="badge-count">
                    {fmtNum(b.earnedCount)} khách đã đạt
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
