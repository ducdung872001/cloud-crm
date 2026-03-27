// src/hooks/useOnboarding.ts
import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type TourId = "login" | "shift" | "pos";

export interface TourStep {
  /** CSS selector của element cần highlight (null → modal centered) */
  selector:  string | null;
  title:     string;
  content:   string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  /** Scroll element vào view trước khi highlight */
  scrollIntoView?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tour definitions  —  dùng CSS selectors thực tế của app
// ─────────────────────────────────────────────────────────────────────────────
export const TOURS: Record<TourId, TourStep[]> = {

  // ── Tour 1: Sau đăng nhập, lần đầu vào layout ─────────────────────────────
  login: [
    {
      selector: null,
      position: "center",
      title:    "👋 Chào mừng đến Reborn CRM!",
      content:  "Hệ thống sẽ hướng dẫn bạn qua các bước cơ bản để bắt đầu làm việc. Chỉ mất khoảng 1–2 phút!",
    },
    {
      selector: ".sidebar",
      position: "right",
      title:    "📋 Thanh điều hướng",
      content:  "Đây là menu chính. Tất cả chức năng — bán hàng, quản lý đơn, kho hàng, khách hàng — đều nằm ở đây.",
    },
    {
      selector: ".level-1:nth-child(3)",   // Mục "Bán hàng & Đơn hàng"
      position: "right",
      title:    "🛒 Bán hàng & Đơn hàng",
      content:  "Khu vực chính để bán hàng tại quầy (POS), quản lý đơn hàng, đổi/trả hàng và đồng bộ đơn online.",
      scrollIntoView: true,
    },
    {
      selector: ".notification-dropdown",
      position: "bottom",
      title:    "🔔 Thông báo",
      content:  "Nhấn chuông để xem thông báo từ hệ thống — đơn hàng mới, nhắc nhở ca làm việc và cập nhật quan trọng.",
    },
    {
      selector: ".container-branch",
      position: "bottom",
      title:    "🏪 Chi nhánh",
      content:  "Nếu có nhiều chi nhánh, chọn đúng chi nhánh đang làm việc tại đây trước khi thực hiện bất kỳ thao tác nào.",
    },
    {
      selector: null,
      position: "center",
      title:    "✅ Bước tiếp theo: Vào ca",
      content:  "Trước khi bắt đầu bán hàng, bạn cần vào ca làm việc. Vào menu Bán hàng → Quản lý ca để bắt đầu.",
    },
  ],

  // ── Tour 2: Trang Quản lý ca ───────────────────────────────────────────────
  shift: [
    {
      selector: null,
      position: "center",
      title:    "🕐 Hướng dẫn Quản lý Ca",
      content:  "Mỗi ngày làm việc bạn cần vào ca và đóng ca. Hệ thống ghi nhận doanh thu, tiền quỹ theo từng ca.",
    },
    {
      selector: ".menu-list li:nth-child(1)",   // Tab "Chưa vào ca"
      position: "bottom",
      title:    "📋 Tab \"Chưa vào ca\"",
      content:  "Hiển thị thông tin ca sắp tới — tên ca, giờ làm, danh sách nhân viên cùng ca với bạn hôm nay.",
      scrollIntoView: true,
    },
    {
      selector: ".btn-open-shift, .btn--primary",   // Nút "Vào ca"
      position: "top",
      title:    "🟢 Nút \"Vào ca\"",
      content:  "Bấm đây để mở ca. Bạn cần xác nhận số tiền mặt tồn quỹ đầu ca trước khi bắt đầu nhận đơn.",
      scrollIntoView: true,
    },
    {
      selector: ".menu-list li:nth-child(3)",   // Tab "Đang ca"
      position: "bottom",
      title:    "📊 Tab \"Đang ca\"",
      content:  "Khi đang trong ca, tab này hiển thị dashboard realtime — doanh thu, số đơn, tiền mặt hiện tại.",
    },
    {
      selector: ".menu-list li:nth-child(5)",   // Tab "Đóng ca"
      position: "bottom",
      title:    "🔴 Tab \"Đóng ca\"",
      content:  "Khi kết thúc ca, vào đây để đếm tiền mặt tồn quỹ cuối ca và xác nhận đóng. Hệ thống tự tạo báo cáo.",
    },
    {
      selector: null,
      position: "center",
      title:    "✅ Xong! Hãy vào ca ngay",
      content:  "Tab \"Chưa vào ca\" → chọn ca của bạn → bấm \"Vào ca\". Sau đó vào Bán hàng tại quầy để bắt đầu!",
    },
  ],

  // ── Tour 3: Trang Bán hàng tại quầy (POS) ─────────────────────────────────
  pos: [
    {
      selector: null,
      position: "center",
      title:    "🛒 Hướng dẫn Bán hàng tại quầy",
      content:  "Đây là màn hình POS — nơi bạn tạo đơn hàng nhanh chóng cho khách đến trực tiếp.",
    },
    {
      selector: ".counter-sales__search input, .search-bar input",
      position: "bottom",
      title:    "🔍 Tìm sản phẩm",
      content:  "Nhập tên, mã vạch hoặc SKU để tìm sản phẩm. Bạn cũng có thể dùng nút \"Quét QR\" với máy quét mã vạch.",
      scrollIntoView: true,
    },
    {
      selector: ".category-tabs, .counter-sales__categories",
      position: "bottom",
      title:    "📂 Lọc theo danh mục",
      content:  "Bấm vào danh mục để lọc nhanh sản phẩm. Chọn \"Tất cả\" để xem toàn bộ sản phẩm.",
    },
    {
      selector: ".product-grid, .counter-sales__products",
      position: "right",
      title:    "🏷️ Danh sách sản phẩm",
      content:  "Bấm vào sản phẩm hoặc nút \"+\" để thêm vào giỏ. Sản phẩm có biến thể (size, màu) sẽ hiện popup chọn.",
    },
    {
      selector: ".counter-sales__cart, .cart-panel",
      position: "left",
      title:    "🛒 Giỏ hàng",
      content:  "Giỏ hàng bên phải — điều chỉnh số lượng, xóa sản phẩm, áp voucher, chọn khuyến mãi và nhập giảm giá trực tiếp.",
    },
    {
      selector: ".cart-customer, .counter-sales__customer",
      position: "left",
      title:    "👤 Chọn khách hàng",
      content:  "Tìm khách để ghi nhận điểm tích lũy và áp dụng khuyến mãi phù hợp. Khách vãng lai thì bỏ qua bước này.",
    },
    {
      selector: ".btn-create-invoice, button.btn--primary:last-of-type",
      position: "top",
      title:    "💳 Tạo đơn hàng",
      content:  "Bấm đây khi đã chọn đủ sản phẩm. Chọn phương thức thanh toán (Tiền mặt, Chuyển khoản, QR Pro...) rồi xác nhận.",
      scrollIntoView: true,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────────────────────
const storageKey = (userId: number | string, tourId: TourId) =>
  `reborn_onboarding_${userId}_${tourId}`;

export const isTourDone   = (uid: number | string, tid: TourId) =>
  !!localStorage.getItem(storageKey(uid, tid));

export const markTourDone = (uid: number | string, tid: TourId) => {
  try { localStorage.setItem(storageKey(uid, tid), new Date().toISOString()); } catch { /* ignore */ }
};

export const resetTour    = (uid: number | string, tid: TourId) => {
  try { localStorage.removeItem(storageKey(uid, tid)); } catch { /* ignore */ }
};

export const resetAllTours = (uid: number | string) =>
  (["login", "shift", "pos"] as TourId[]).forEach((t) => resetTour(uid, t));

// ─────────────────────────────────────────────────────────────────────────────
// useOnboarding hook
// ─────────────────────────────────────────────────────────────────────────────
interface Options {
  userId:     number | string;
  tourId:     TourId;
  autoStart?: boolean;
}

export interface TargetInfo {
  rect:     DOMRect;
  el:       Element;
} 

export function useOnboarding({ userId, tourId, autoStart = true }: Options) {
  const steps = TOURS[tourId];

  const [active,   setActive]   = useState(false);
  const [stepIdx,  setStepIdx]  = useState(0);
  const [target,   setTarget]   = useState<TargetInfo | null>(null);

  const currentStep = steps[stepIdx] ?? null;

  // Tính toán vị trí element đang được spotlight
  const measureTarget = useCallback(() => {
    if (!currentStep?.selector) { setTarget(null); return; }
    const el = document.querySelector(currentStep.selector);
    if (!el) { setTarget(null); return; }
    if (currentStep.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setTarget({ rect: el.getBoundingClientRect(), el }), 300);
    } else {
      setTarget({ rect: el.getBoundingClientRect(), el });
    }
  }, [currentStep]);

  useEffect(() => {
    if (!active) return;
    measureTarget();
    window.addEventListener("resize",  measureTarget);
    window.addEventListener("scroll",  measureTarget, true);
    return () => {
      window.removeEventListener("resize",  measureTarget);
      window.removeEventListener("scroll",  measureTarget, true);
    };
  }, [active, measureTarget]);

  // Auto-start lần đầu
  useEffect(() => {
    if (!autoStart || !userId) return;
    if (!isTourDone(userId, tourId)) {
      const t = setTimeout(() => { setActive(true); setStepIdx(0); }, 900);
      return () => clearTimeout(t);
    }
  }, [userId, tourId, autoStart]);

  const start = useCallback(() => { setStepIdx(0); setActive(true); }, []);

  const next = useCallback(() => {
    if (stepIdx < steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      markTourDone(userId, tourId);
      setActive(false);
    }
  }, [stepIdx, steps.length, userId, tourId]);

  const prev  = useCallback(() => { if (stepIdx > 0) setStepIdx((i) => i - 1); }, [stepIdx]);

  const skip  = useCallback(() => { markTourDone(userId, tourId); setActive(false); }, [userId, tourId]);

  return {
    active, start, next, prev, skip,
    stepIdx, totalSteps: steps.length,
    currentStep, target,
    isFirst: stepIdx === 0,
    isLast:  stepIdx === steps.length - 1,
  };
}
