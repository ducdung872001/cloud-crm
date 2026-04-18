export type InboxCategory = "cp" | "cr" | "fb";
export type InboxPriority = "urgent" | "high" | "normal";

export interface InboxAction {
  type: "go-project";
  project: string;
  view?: string;
}

export interface InboxItem {
  id: string;
  cat: InboxCategory;
  priority: InboxPriority;
  title: string;
  projectCode: string;
  meta: string;
  btn: string;
  btnPrimary?: boolean;
  action: InboxAction;
}

export const INBOX_ITEMS: InboxItem[] = [
  {
    id: "cp-megamart-2",
    cat: "cp",
    priority: "urgent",
    title: "CP2 · Meeting lại KH chốt URD v1.3",
    projectCode: "MEGAMART-DOOH",
    meta: "PM + Client · ● Quá hạn 1 ngày",
    btn: "Xử lý",
    btnPrimary: true,
    action: { type: "go-project", project: "megamart", view: "stage-3" },
  },
  {
    id: "cr-tpbank-banc",
    cat: "cr",
    priority: "urgent",
    title: "Change Request · TPBank thêm bancassurance",
    projectCode: "TPB-CRM-2026",
    meta: "Impact: +15 ngày, +$2,400 · ● Quá hạn",
    btn: "Phân tích",
    btnPrimary: true,
    action: { type: "go-project", project: "tpbank", view: "changes" },
  },
  {
    id: "cp-megamart-3",
    cat: "cp",
    priority: "high",
    title: "CP3 · Tech Lead duyệt prompt bổ sung FE",
    projectCode: "MEGAMART-DOOH",
    meta: "Trước Stage 4 · Hạn 17:00 hôm nay",
    btn: "Duyệt",
    action: { type: "go-project", project: "megamart", view: "stage-4" },
  },
  {
    id: "fb-tpbank",
    cat: "fb",
    priority: "high",
    title: "3 feedback mới từ TPBank trên Prototype v2",
    projectCode: "TPB-CRM-2026",
    meta: "2 giờ trước",
    btn: "Xem",
    action: { type: "go-project", project: "tpbank", view: "stage-3" },
  },
  {
    id: "cp-msb-1",
    cat: "cp",
    priority: "normal",
    title: "CP1 · BA review Meeting Note",
    projectCode: "MSB-FXD-DR",
    meta: "AI sinh xong 30 phút trước",
    btn: "Review",
    action: { type: "go-project", project: "msb", view: "stage-1" },
  },
  {
    id: "cr-rox-uat",
    cat: "cr",
    priority: "normal",
    title: "Rox Key ký biên bản UAT module 1",
    projectCode: "ROXKEY-BPM",
    meta: "Upload PDF có chữ ký",
    btn: "Upload",
    action: { type: "go-project", project: "rox", view: "stage-7" },
  },
];

export const INBOX_TABS: { key: "all" | InboxCategory; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "cp", label: "Checkpoints" },
  { key: "cr", label: "Change Requests" },
  { key: "fb", label: "Client feedback" },
];
