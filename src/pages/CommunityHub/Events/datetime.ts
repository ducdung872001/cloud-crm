// Helper xử lý thời gian sự kiện — luôn diễn giải theo giờ Việt Nam (UTC+7),
// độc lập với timezone của browser.
//
// Vì sao: trước đây FE dùng `.toISOString()` (UTC theo browser TZ) + `getHours()`
// (local browser TZ) để render, dẫn đến lệch khi browser ở TZ khác GMT+7. Đồng
// thời BE đang stored các giá trị ISO không nhất quán, nên FE quy ước chuẩn:
//
// 1. Form datetime-local value là "YYYY-MM-DDTHH:mm" coi như giờ VN.
// 2. Khi gửi BE → encode thành ISO có offset rõ ràng `+07:00`, BE không cần
//    đoán timezone.
// 3. Khi hiển thị → đọc bằng `Intl.DateTimeFormat` với `timeZone:
//    "Asia/Ho_Chi_Minh"`, kết quả luôn là giờ VN dù browser ở đâu.

const VN_TZ = "Asia/Ho_Chi_Minh";
const VN_OFFSET = "+07:00";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Trả về components giờ VN (year/month/day/hour/minute) của Date. */
function getVNParts(d: Date): { y: number; m: number; d: number; h: number; mi: number } {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: VN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  // hourCycle bug: "24" instead of "00" — normalize.
  let h = get("hour");
  if (h === 24) h = 0;
  return { y: get("year"), m: get("month"), d: get("day"), h, mi: get("minute") };
}

/** ISO/Date → "HH:MM DD/MM/YYYY" (VN time). */
export function formatVNDateTime(s: string | Date | undefined | null): string {
  if (!s) return "—";
  const d = typeof s === "string" ? new Date(s) : s;
  if (!d || isNaN(d.getTime())) return "—";
  const p = getVNParts(d);
  return `${pad(p.h)}:${pad(p.mi)} ${pad(p.d)}/${pad(p.m)}/${p.y}`;
}

/** ISO/Date → "DD/MM/YYYY" (VN time). */
export function formatVNDate(s: string | Date | undefined | null): string {
  if (!s) return "—";
  const d = typeof s === "string" ? new Date(s) : s;
  if (!d || isNaN(d.getTime())) return "—";
  const p = getVNParts(d);
  return `${pad(p.d)}/${pad(p.m)}/${p.y}`;
}

/** ISO/Date → "HH:MM" (VN time). */
export function formatVNTime(s: string | Date | undefined | null): string {
  if (!s) return "—";
  const d = typeof s === "string" ? new Date(s) : s;
  if (!d || isNaN(d.getTime())) return "—";
  const p = getVNParts(d);
  return `${pad(p.h)}:${pad(p.mi)}`;
}

/** Date object → "YYYY-MM-DDTHH:mm" (lấy theo giờ VN của Date đó). */
export function dateToVNLocalString(d: Date | null | undefined): string {
  if (!d || isNaN(d.getTime())) return "";
  const p = getVNParts(d);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`;
}

/** "YYYY-MM-DDTHH:mm" (giờ VN) → Date đại diện chính xác thời điểm đó. */
export function vnLocalStringToDate(s: string): Date | null {
  if (!s) return null;
  // Parse với offset +07:00 → ra UTC tương ứng
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return null;
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00${VN_OFFSET}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/** "YYYY-MM-DDTHH:mm" (giờ VN) → ISO with explicit "+07:00" offset cho API. */
export function vnLocalToOffsetIso(s: string): string {
  if (!s) return "";
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return s;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00${VN_OFFSET}`;
}

/** ISO from BE → "YYYY-MM-DDTHH:mm" giờ VN cho datetime-local input. */
export function isoToVNLocalString(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return dateToVNLocalString(d);
}
