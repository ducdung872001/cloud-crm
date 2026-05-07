// [MH] Zoom Pool — USP credit pool: mượn / cho mượn slot Zoom giữa mentor.
// 5 tab: Tìm slot · Yêu cầu mượn · Tài khoản tôi góp · Đơn nhận (inbox) · Đơn đã gửi
// Layer trên BE Phase 6 (zoom-pool + zoom-borrow + credit-wallet).
import React, { useEffect, useState } from "react";
import {
  listFreeSlots, bookFromPool, listMyAccounts, publishMyAccount, patchMyAccount,
  listMyAccountSlots, addMyAccountSlot, createBorrowRequest, listInboxRequests,
  listSentRequests, approveBorrowRequest, declineBorrowRequest, counterBorrowRequest,
  cancelBorrowRequest, getWallet,
  type FreeSlot, type MyPoolAccount, type BorrowRequest, type Wallet,
} from "@/services/mentorhub/zoomPoolApi";
import "../_shared/styles.scss";
import "./ZoomPool.scss";

type TabKey = "browse" | "request" | "myaccounts" | "inbox" | "sent";

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: "browse", label: "Tìm slot", hint: "Xem slot trống trong pool · book ngay" },
  { key: "request", label: "Yêu cầu mượn", hint: "Đề xuất giờ tự do · gửi mentor" },
  { key: "myaccounts", label: "Tôi cho mượn", hint: "Tài khoản Zoom tôi góp pool" },
  { key: "inbox", label: "Đơn nhận", hint: "Yêu cầu mượn đến tôi" },
  { key: "sent", label: "Đơn đã gửi", hint: "Yêu cầu tôi đã gửi đi" },
];

const fmtDate = (iso: string) => new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
const fmtRange = (s: string, e: string) => {
  const ds = new Date(s), de = new Date(e);
  const sameDay = ds.toDateString() === de.toDateString();
  return sameDay
    ? `${ds.toLocaleDateString("vi-VN")} · ${ds.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}–${de.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
    : `${fmtDate(s)} → ${fmtDate(e)}`;
};

export default function MHZoomPool() {
  document.title = "Zoom Pool · MentorHub";
  const [tab, setTab] = useState<TabKey>("browse");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" } | null>(null);

  const showToast = (msg: string, tone: "ok" | "err" = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const refreshWallet = async () => {
    try { setWallet(await getWallet()); } catch { /* mock */ }
  };
  useEffect(() => { void refreshWallet(); }, []);

  return (
    <div className="mh">
      <div className="mh__hero">
        <div className="mh__kicker">USP · CREDIT POOL</div>
        <h1>Zoom <em>Pool</em></h1>
        <p style={{ color: "var(--mh-ink-soft)", marginTop: 8, maxWidth: 720 }}>
          Mượn Zoom giữa mentor. Bạn không cần mua Zoom Pro — pool có sẵn slot
          từ Reborn HQ, cộng đồng WIT, và mentor khác chia sẻ. Trả bằng credit,
          giá theo tier gói.
        </p>
        {wallet && (
          <div className="mh-zp-wallet">
            <span className="mh-zp-wallet__balance">{wallet.balance} <small>credit</small></span>
            <span className="mh-zp-wallet__meta">+{wallet.earnedThisPeriod} earn · −{wallet.spentThisPeriod} spend kỳ này</span>
            <a className="mh__btn mh__btn--ghost" href="/crm/mh/wallet" style={{ marginLeft: "auto", fontSize: 13 }}>Xem ví →</a>
          </div>
        )}
      </div>

      <nav className="mh-zp-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`mh-zp-tab${tab === t.key ? " is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            <span className="mh-zp-tab__label">{t.label}</span>
            <span className="mh-zp-tab__hint">{t.hint}</span>
          </button>
        ))}
      </nav>

      <div className="mh-zp-body">
        {tab === "browse" && <BrowseTab onChanged={refreshWallet} showToast={showToast} />}
        {tab === "request" && <RequestTab onSent={() => { setTab("sent"); refreshWallet(); }} showToast={showToast} />}
        {tab === "myaccounts" && <MyAccountsTab showToast={showToast} />}
        {tab === "inbox" && <InboxTab onChanged={refreshWallet} showToast={showToast} />}
        {tab === "sent" && <SentTab onChanged={refreshWallet} showToast={showToast} />}
      </div>

      {toast && (
        <div className={`mh-zp-toast mh-zp-toast--${toast.tone}`}>{toast.msg}</div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Tab 1: BROWSE — auto-pool flow (slot trống → book ngay)
// ───────────────────────────────────────────────────────────────────────────
function BrowseTab({ onChanged, showToast }: { onChanged: () => void; showToast: (m: string, t?: "ok" | "err") => void }) {
  const [slots, setSlots] = useState<FreeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterLicensed, setFilterLicensed] = useState(false);
  const [filterOwner, setFilterOwner] = useState<"all" | "platform" | "mentor" | "wit">("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await listFreeSlots({ preferLicensed: filterLicensed });
      setSlots(data);
    } catch (e) {
      showToast("Không tải được slot — kiểm tra BE", "err");
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [filterLicensed]);

  const filtered = slots.filter((s) => filterOwner === "all" || s.account?.ownerType === filterOwner);

  const book = async (slot: FreeSlot) => {
    if (!confirm(`Book slot ${fmtRange(slot.startsAt, slot.endsAt)}?\nChi phí ~ ${Math.round((new Date(slot.endsAt).getTime() - new Date(slot.startsAt).getTime()) / 60_000)} credit.`)) return;
    try {
      await bookFromPool({
        sessionId: `SES-manual-${Date.now()}`,
        startsAt: slot.startsAt,
        durationMin: Math.round((new Date(slot.endsAt).getTime() - new Date(slot.startsAt).getTime()) / 60_000),
        needLicensed: slot.account?.licensed,
      });
      showToast("Đã book slot — credit đã trừ");
      onChanged();
      await load();
    } catch (e: any) {
      showToast(e?.response?.data?.error ?? "Book thất bại", "err");
    }
  };

  return (
    <div>
      <div className="mh-zp-filters">
        <label className="mh-zp-filter">
          <input type="checkbox" checked={filterLicensed} onChange={(e) => setFilterLicensed(e.target.checked)} />
          <span>Chỉ Zoom Licensed (&gt;40 phút)</span>
        </label>
        <div className="mh-zp-filter-group">
          {(["all", "platform", "mentor", "wit"] as const).map((o) => (
            <button
              key={o}
              type="button"
              className={`mh-zp-chip${filterOwner === o ? " is-active" : ""}`}
              onClick={() => setFilterOwner(o)}
            >{o === "all" ? "Tất cả" : o === "platform" ? "Reborn HQ" : o === "mentor" ? "Mentor" : "WIT"}</button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color: "var(--mh-ink-soft)" }}>Đang tải…</p>}
      {!loading && filtered.length === 0 && (
        <div className="mh__card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--mh-ink-soft)" }}>Không có slot trống phù hợp filter — thử bỏ filter hoặc chuyển sang tab "Yêu cầu mượn" để đề xuất giờ tự do.</p>
        </div>
      )}
      <div className="mh-zp-slot-list">
        {filtered.map((s) => (
          <div key={s.id} className="mh-zp-slot-card">
            <div className="mh-zp-slot-card__time">{fmtRange(s.startsAt, s.endsAt)}</div>
            <div className="mh-zp-slot-card__meta">
              <span className={`mh__pill mh__pill--${s.account?.ownerType === "platform" ? "upcoming" : s.account?.ownerType === "wit" ? "amber" : "green"}`}>
                {s.account?.ownerType === "platform" ? "Reborn HQ" : s.account?.ownerType === "wit" ? "WIT" : "Mentor"}
              </span>
              {s.account?.licensed && <span className="mh__pill mh__pill--upcoming">Licensed</span>}
              <span style={{ color: "var(--mh-ink-soft)", fontSize: 12 }}>
                {s.account?.zoomDisplayName ?? s.account?.ownerId}
                {s.account && s.account.contributorEarnRatePct > 0 && ` · earn ${s.account.contributorEarnRatePct}%`}
              </span>
            </div>
            <button type="button" className="mh__btn mh__btn--primary" onClick={() => book(s)}>Book</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Tab 2: REQUEST — peer-borrow flow (đề xuất giờ tự do gửi mentor cụ thể)
// ───────────────────────────────────────────────────────────────────────────
function RequestTab({ onSent, showToast }: { onSent: () => void; showToast: (m: string, t?: "ok" | "err") => void }) {
  const [toMentorId, setToMentorId] = useState("MT-002");
  const [proposedStartsAt, setProposedStartsAt] = useState("");
  const [durationMin, setDurationMin] = useState(60);
  const [offeredCredits, setOfferedCredits] = useState(60);
  const [courseTitle, setCourseTitle] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toMentorId || !proposedStartsAt) return;
    setSubmitting(true);
    try {
      await createBorrowRequest({
        toMentorId,
        proposedStartsAt: new Date(proposedStartsAt).toISOString(),
        durationMin,
        offeredCredits,
        courseTitle: courseTitle || undefined,
        reason: reason || undefined,
        message: message || undefined,
      });
      showToast("Đã gửi yêu cầu mượn — mentor sẽ phản hồi trong 24h");
      onSent();
    } catch (e: any) {
      showToast(e?.response?.data?.error ?? "Gửi thất bại", "err");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mh-zp-form" onSubmit={submit}>
      <div className="mh__card" style={{ background: "var(--mh-amber-soft)", borderColor: "rgba(180,88,9,0.2)", marginBottom: 24 }}>
        <h3 style={{ color: "var(--mh-amber)", marginBottom: 8 }}>Khi nào dùng tab này?</h3>
        <p style={{ color: "var(--mh-ink-soft)", fontSize: 14, lineHeight: 1.6 }}>
          Khi bạn muốn mượn Zoom giờ cụ thể nhưng <strong>không thấy slot tương ứng trong "Tìm slot"</strong> —
          mentor cho mượn có thể chưa publish slot đó lên pool. Yêu cầu sẽ hiện ở Inbox của họ;
          họ có thể accept (auto book + trừ credit), counter-offer (giờ/credit khác), hoặc decline.
        </p>
      </div>

      <div className="mh-zp-form-grid">
        <label>
          <span>Mentor cho mượn (mentorId)</span>
          <input type="text" value={toMentorId} onChange={(e) => setToMentorId(e.target.value)} required placeholder="MT-002" />
          <small>Sau này có search mentor theo tên — hiện FE stub gõ ID.</small>
        </label>
        <label>
          <span>Giờ bắt đầu</span>
          <input type="datetime-local" value={proposedStartsAt} onChange={(e) => setProposedStartsAt(e.target.value)} required />
        </label>
        <label>
          <span>Thời lượng (phút)</span>
          <input type="number" min={15} max={300} step={15} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
        </label>
        <label>
          <span>Credit đề xuất trả</span>
          <input type="number" min={1} value={offeredCredits} onChange={(e) => setOfferedCredits(Number(e.target.value))} />
          <small>Mặc định 1 credit/phút. Tăng lên nếu muốn ưu tiên.</small>
        </label>
        <label className="mh-zp-form-grid__full">
          <span>Tên khoá / buổi học</span>
          <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="VD: UX Workshop — Design System" />
        </label>
        <label className="mh-zp-form-grid__full">
          <span>Lý do (mentor sẽ thấy)</span>
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Em có buổi workshop cho team enterprise client cần Zoom Pro >40 phút…" />
        </label>
        <label className="mh-zp-form-grid__full">
          <span>Lời nhắn cá nhân (optional)</span>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Cảm ơn anh trước!" />
        </label>
      </div>

      <button type="submit" className="mh__btn mh__btn--primary" disabled={submitting}>
        {submitting ? "Đang gửi…" : "Gửi yêu cầu mượn"}
      </button>
    </form>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Tab 3: MY ACCOUNTS — mentor góp Zoom lên pool (auto-pool publisher)
// ───────────────────────────────────────────────────────────────────────────
function MyAccountsTab({ showToast }: { showToast: (m: string, t?: "ok" | "err") => void }) {
  const [accounts, setAccounts] = useState<MyPoolAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [zoomEmail, setZoomEmail] = useState("");
  const [zoomDisplayName, setZoomDisplayName] = useState("");
  const [licensed, setLicensed] = useState(true);
  const [earnRate, setEarnRate] = useState(50);

  const load = async () => {
    try { setAccounts(await listMyAccounts()); }
    catch { showToast("Không tải được accounts", "err"); }
  };
  useEffect(() => { void load(); }, []);

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await publishMyAccount({
        zoomEmail: zoomEmail || undefined,
        zoomDisplayName: zoomDisplayName || undefined,
        licensed,
        contributorEarnRatePct: earnRate,
      });
      showToast("Đã publish account — slot rảnh sẽ tự sinh");
      setShowForm(false);
      setZoomEmail(""); setZoomDisplayName(""); setLicensed(true); setEarnRate(50);
      await load();
    } catch (e: any) {
      showToast(e?.response?.data?.error ?? "Publish thất bại", "err");
    }
  };

  const updateEarn = async (id: string, pct: number) => {
    try {
      await patchMyAccount(id, { contributorEarnRatePct: pct });
      showToast(`Đã đổi earn rate → ${pct}%`);
      await load();
    } catch (e: any) { showToast(e?.response?.data?.error ?? "Lỗi update", "err"); }
  };

  const toggleStatus = async (id: string, current: MyPoolAccount["status"]) => {
    try {
      await patchMyAccount(id, { status: current === "available" ? "blocked" : "available" });
      await load();
    } catch (e: any) { showToast(e?.response?.data?.error ?? "Lỗi", "err"); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ color: "var(--mh-ink-soft)", fontSize: 14, maxWidth: 600 }}>
          Góp Zoom của bạn lên pool. Khi mentor khác book slot rảnh, bạn earn credit theo earn rate đã set
          (50% là default mentor, 70% cho WIT volunteer). Ngắt bất cứ lúc nào.
        </p>
        <button type="button" className="mh__btn mh__btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Đóng" : "+ Thêm account"}
        </button>
      </div>

      {showForm && (
        <form className="mh-zp-form" onSubmit={publish}>
          <div className="mh-zp-form-grid">
            <label>
              <span>Email Zoom</span>
              <input type="email" value={zoomEmail} onChange={(e) => setZoomEmail(e.target.value)} placeholder="me@zoom.com" />
            </label>
            <label>
              <span>Tên hiển thị</span>
              <input type="text" value={zoomDisplayName} onChange={(e) => setZoomDisplayName(e.target.value)} placeholder="Khoá học của tôi" />
            </label>
            <label>
              <span>Loại account</span>
              <select value={licensed ? "licensed" : "basic"} onChange={(e) => setLicensed(e.target.value === "licensed")}>
                <option value="licensed">Licensed (&gt;40 phút)</option>
                <option value="basic">Basic (40 phút)</option>
              </select>
            </label>
            <label>
              <span>Earn rate (% credit tôi giữ lại khi pool dùng)</span>
              <input type="number" min={0} max={100} value={earnRate} onChange={(e) => setEarnRate(Number(e.target.value))} />
              <small>Default 50%. WIT/cộng đồng thường set 70%.</small>
            </label>
          </div>
          <button type="submit" className="mh__btn mh__btn--primary">Publish lên pool</button>
        </form>
      )}

      {accounts.length === 0 && !showForm && (
        <div className="mh__card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--mh-ink-soft)" }}>Bạn chưa góp account nào. Bấm "+ Thêm account" để bắt đầu earn credit khi không dùng Zoom.</p>
        </div>
      )}

      <div className="mh-zp-account-list">
        {accounts.map((a) => (
          <div key={a.id} className="mh-zp-account-card">
            <div className="mh-zp-account-card__head">
              <div>
                <div className="mh-zp-account-card__name">{a.zoomDisplayName ?? a.zoomEmail}</div>
                <div className="mh-zp-account-card__email">{a.zoomEmail}</div>
              </div>
              <span className={`mh__pill mh__pill--${a.status === "available" ? "green" : "draft"}`}>{a.status}</span>
            </div>
            <div className="mh-zp-account-card__meta">
              {a.licensed ? "Licensed" : "Basic"} · {a.maxConcurrent} concurrent · earn {a.contributorEarnRatePct}%
            </div>
            <div className="mh-zp-account-card__actions">
              <label style={{ fontSize: 13 }}>
                Earn rate
                <input
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={a.contributorEarnRatePct}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (v !== a.contributorEarnRatePct) void updateEarn(a.id, v);
                  }}
                  style={{ width: 60, marginLeft: 6, padding: 4, border: "1px solid var(--mh-line)", borderRadius: 6 }}
                />%
              </label>
              <button type="button" className="mh__btn" onClick={() => void toggleStatus(a.id, a.status)}>
                {a.status === "available" ? "Tạm tắt" : "Bật lại"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Tab 4: INBOX — A nhận yêu cầu mượn → approve / decline / counter
// ───────────────────────────────────────────────────────────────────────────
function InboxTab({ onChanged, showToast }: { onChanged: () => void; showToast: (m: string, t?: "ok" | "err") => void }) {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [counterFor, setCounterFor] = useState<string | null>(null);
  const [counterCredits, setCounterCredits] = useState(0);
  const [counterMsg, setCounterMsg] = useState("");

  const load = async () => {
    try { setRequests(await listInboxRequests()); }
    catch { showToast("Không tải được inbox", "err"); }
  };
  useEffect(() => { void load(); }, []);

  const approve = async (id: string) => {
    if (!confirm("Đồng ý cho mượn? BE sẽ tự book + trừ credit người mượn + cộng credit cho bạn.")) return;
    try {
      await approveBorrowRequest(id, "OK em xài đi");
      showToast("Đã approve — booking đã tạo");
      onChanged();
      await load();
    } catch (e: any) { showToast(e?.response?.data?.error ?? "Approve lỗi", "err"); }
  };

  const decline = async (id: string) => {
    const reason = prompt("Lý do từ chối (optional)");
    if (reason === null) return;
    try {
      await declineBorrowRequest(id, reason || undefined);
      showToast("Đã từ chối yêu cầu");
      await load();
    } catch (e: any) { showToast(e?.response?.data?.error ?? "Lỗi", "err"); }
  };

  const submitCounter = async (id: string) => {
    try {
      await counterBorrowRequest(id, {
        counterCredits: counterCredits > 0 ? counterCredits : undefined,
        responseMessage: counterMsg || undefined,
      });
      showToast("Đã gửi counter-offer — chờ người mượn confirm");
      setCounterFor(null);
      await load();
    } catch (e: any) { showToast(e?.response?.data?.error ?? "Lỗi", "err"); }
  };

  return (
    <div>
      <p style={{ color: "var(--mh-ink-soft)", fontSize: 14, marginBottom: 16 }}>
        Yêu cầu mượn Zoom đến từ mentor khác. TTL 24h — sau đó tự expire.
      </p>
      {requests.length === 0 && (
        <div className="mh__card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--mh-ink-soft)" }}>Inbox trống.</p>
        </div>
      )}
      {requests.map((r) => (
        <div key={r.id} className="mh-zp-req-card">
          <div className="mh-zp-req-card__head">
            <div>
              <div className="mh-zp-req-card__title">
                <strong>{r.fromMentorId}</strong> xin mượn Zoom · {r.courseTitle ?? "không tên"}
              </div>
              <div className="mh-zp-req-card__time">
                {fmtRange(r.proposedStartsAt, r.proposedEndsAt)} · gửi {fmtDate(r.createdAt)}
              </div>
            </div>
            <span className={`mh__pill mh__pill--${r.status === "pending" ? "amber" : r.status === "booked" ? "green" : r.status === "declined" ? "red" : "draft"}`}>
              {r.status}
            </span>
          </div>
          {r.reason && <p className="mh-zp-req-card__reason">"{r.reason}"</p>}
          <div className="mh-zp-req-card__credits">
            Đề xuất trả: <strong>{r.offeredCredits} credit</strong>
            {r.counterCredits && <span style={{ marginLeft: 12, color: "var(--mh-amber)" }}>· counter: {r.counterCredits}</span>}
            {r.message && <span style={{ marginLeft: 12, fontStyle: "italic", color: "var(--mh-ink-soft)" }}>"{r.message}"</span>}
          </div>
          {r.status === "pending" && counterFor !== r.id && (
            <div className="mh-zp-req-card__actions">
              <button type="button" className="mh__btn mh__btn--primary" onClick={() => approve(r.id)}>Đồng ý cho mượn</button>
              <button type="button" className="mh__btn" onClick={() => { setCounterFor(r.id); setCounterCredits(r.offeredCredits + 30); }}>Counter-offer</button>
              <button type="button" className="mh__btn mh__btn--danger" onClick={() => decline(r.id)}>Từ chối</button>
            </div>
          )}
          {counterFor === r.id && (
            <div className="mh-zp-req-card__counter">
              <label>
                Credit counter
                <input type="number" value={counterCredits} onChange={(e) => setCounterCredits(Number(e.target.value))} />
              </label>
              <label style={{ flex: 1 }}>
                Lời nhắn
                <input type="text" value={counterMsg} onChange={(e) => setCounterMsg(e.target.value)} placeholder="Anh muốn 90 credit nhé" />
              </label>
              <button type="button" className="mh__btn mh__btn--primary" onClick={() => submitCounter(r.id)}>Gửi counter</button>
              <button type="button" className="mh__btn" onClick={() => setCounterFor(null)}>Huỷ</button>
            </div>
          )}
          {r.responseMessage && r.status !== "pending" && (
            <p style={{ color: "var(--mh-ink-soft)", fontSize: 13, marginTop: 8, fontStyle: "italic" }}>
              Phản hồi của bạn: "{r.responseMessage}"
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Tab 5: SENT — C xem yêu cầu đã gửi
// ───────────────────────────────────────────────────────────────────────────
function SentTab({ onChanged, showToast }: { onChanged: () => void; showToast: (m: string, t?: "ok" | "err") => void }) {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);

  const load = async () => {
    try { setRequests(await listSentRequests()); }
    catch { showToast("Không tải được", "err"); }
  };
  useEffect(() => { void load(); }, []);

  const cancel = async (id: string) => {
    if (!confirm("Huỷ yêu cầu này?")) return;
    try {
      await cancelBorrowRequest(id);
      showToast("Đã huỷ yêu cầu");
      onChanged();
      await load();
    } catch (e: any) { showToast(e?.response?.data?.error ?? "Lỗi", "err"); }
  };

  // C accept counter-offer = call approve endpoint trên BE? Không — peer approve
  // do A. C accept counter = thực ra là A đã set counterCredits nhưng status
  // vẫn pending; C cần A approve final. Hoặc đơn giản: C "đồng ý theo offer mới"
  // = A re-approve. Hiện stub: hiển thị thông báo, C kéo A approve thủ công.

  return (
    <div>
      <p style={{ color: "var(--mh-ink-soft)", fontSize: 14, marginBottom: 16 }}>
        Yêu cầu mượn bạn đã gửi đi. Khi mentor approve → BE auto book + trừ credit.
      </p>
      {requests.length === 0 && (
        <div className="mh__card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--mh-ink-soft)" }}>Chưa có yêu cầu nào — gửi qua tab "Yêu cầu mượn".</p>
        </div>
      )}
      {requests.map((r) => (
        <div key={r.id} className="mh-zp-req-card">
          <div className="mh-zp-req-card__head">
            <div>
              <div className="mh-zp-req-card__title">Mượn từ <strong>{r.toMentorId}</strong> · {r.courseTitle ?? "không tên"}</div>
              <div className="mh-zp-req-card__time">{fmtRange(r.proposedStartsAt, r.proposedEndsAt)}</div>
            </div>
            <span className={`mh__pill mh__pill--${r.status === "pending" ? "amber" : r.status === "booked" ? "green" : r.status === "declined" ? "red" : "draft"}`}>
              {r.status}
            </span>
          </div>
          <div className="mh-zp-req-card__credits">
            Bạn offer: <strong>{r.offeredCredits} credit</strong>
            {r.counterCredits && <span style={{ marginLeft: 12, color: "var(--mh-amber)" }}>· mentor counter: {r.counterCredits} credit</span>}
          </div>
          {r.responseMessage && <p style={{ color: "var(--mh-ink-soft)", fontSize: 13, fontStyle: "italic" }}>Mentor nói: "{r.responseMessage}"</p>}
          {r.status === "pending" && (
            <div className="mh-zp-req-card__actions">
              <button type="button" className="mh__btn mh__btn--danger" onClick={() => cancel(r.id)}>Huỷ yêu cầu</button>
            </div>
          )}
          {r.status === "booked" && r.bookingId && (
            <div style={{ color: "var(--mh-green)", fontSize: 13 }}>
              ✓ Đã book — booking {r.bookingId}. Vào tab "Đặt lịch của tôi" (route /mh/zoom-pool/bookings) xem chi tiết.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
