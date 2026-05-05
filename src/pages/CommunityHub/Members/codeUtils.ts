// Helper format/parse mã định danh thành viên.
//
// Format chuẩn (yc 5/5):
//   <STT cá nhân>-<STT nhóm>     vd "5971-300", "6676-334"
// Mã trưởng nhóm (lưu cột riêng):
//   master-<N>                    vd "master-1", "master-2"
//
// Quy tắc nhóm: 20 người/nhóm theo thứ tự thời gian gia nhập (KHÔNG theo địa lý).

export const MEMBERS_PER_GROUP = 20;

/** Chia personalSeq thành (rank, restOfPersonalSeq).
 *  Hiện chỉ có hạng "6" (thành viên chính thức) — các đầu khác chưa rõ
 *  (ghi trong mục 7 "Câu hỏi cần làm rõ"), tạm trả nguyên rank=1 chữ số đầu.
 */
export function deriveRank(personalSeq: string): string {
  if (!personalSeq) return "";
  return personalSeq.charAt(0);
}

/** Build canonical memberCode: "5971-300". */
export function buildMemberCode(personalSeq: string | number, groupSeq: number): string {
  return `${personalSeq}-${groupSeq}`;
}

/** Parse "5971-300" → { personalSeq: "5971", groupSeq: 300, rank: "5" }.
 *  Trả null nếu format sai. */
export function parseMemberCode(code: string): { personalSeq: string; groupSeq: number; rank: string } | null {
  if (!code) return null;
  // Trim, loại bỏ space và prefix vô tình (vd user gõ "Mã: 5971-300")
  const m = code.trim().match(/^(\d{1,8})-(\d{1,6})$/);
  if (!m) return null;
  const personalSeq = m[1];
  const groupSeq = parseInt(m[2], 10);
  if (groupSeq <= 0) return null;
  return { personalSeq, groupSeq, rank: deriveRank(personalSeq) };
}

/** Build mã trưởng nhóm: "master-N". */
export function buildMasterCode(n: number): string {
  return `master-${n}`;
}

/** Parse "master-1" → 1. Trả null nếu sai. */
export function parseMasterCode(code: string): number | null {
  if (!code) return null;
  const m = code.trim().toLowerCase().match(/^master-(\d{1,6})$/);
  return m ? parseInt(m[1], 10) : null;
}

/** Tính groupSeq từ personalSeq: 20 người/nhóm.
 *  personalSeq=1..20 → group 1; 21..40 → group 2; ...
 *  Nếu khách yêu cầu theo logic khác (vd reset theo hạng) → BE override.
 */
export function deriveGroupSeqFromPersonal(personalSeq: number): number {
  if (personalSeq <= 0) return 1;
  return Math.ceil(personalSeq / MEMBERS_PER_GROUP);
}

/** Validate format mã chức vụ: "mentor-7", "ngd-12", "master-1", "course-...". */
export function isValidRoleCode(code: string): boolean {
  if (!code) return false;
  return /^[a-z][a-z0-9_]{1,15}-\w{1,40}$/i.test(code.trim());
}
