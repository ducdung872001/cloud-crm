import { useEffect, useRef, useCallback } from "react";

const OMNICXM_CSS_URL = "https://omni-api.worldfone.cloud/embed_app/application/public/css/embed.css";
const OMNICXM_JS_URL  = "https://omni-api.worldfone.cloud/embed_app/application/embed.js";

export type OmniEventName = "pick" | "reassigned" | "solved" | "spam" | "linkobject";

export interface OmniChatPayload {
  from:            string;
  event:           OmniEventName;
  source:          string;         // 'zalo' | 'messenger' | 'livechat' | ...
  room_id:         string;
  customernumber?: string;
  people_id?:      string;         // chỉ có trong event 'linkobject'
  customerName?:   string;         // nếu OmniCXM cung cấp
}

interface UseOmniCXMOptions {
  secretKey:      string;
  environment?:   string;          // 'dev' | 'uat' | bỏ trống = production
  enabled?:       boolean;
  hideFloatingButton?: boolean;    // ẩn nút chat góc phải (dùng khi đã có màn TotalChat)
  onPick?:        (payload: OmniChatPayload) => void;
  onReassigned?:  (payload: OmniChatPayload) => void;
  onSolved?:      (payload: OmniChatPayload) => void;
  onSpam?:        (payload: OmniChatPayload) => void;
  onLinkPeople?:  (payload: OmniChatPayload) => void;
  onNewMessage?:  (payload: OmniChatPayload & { message?: string }) => void;
}

/**
 * Gửi tin nhắn qua OmniCXM widget (nếu API tồn tại).
 * Trả về true nếu gửi thành công qua OmniCXM, false nếu chưa có API.
 */
export function omniSendMessage(roomId: string, text: string): boolean {
  const app = (window as any).STOmniCXMEmbedApp;
  if (app?.sendMessage) {
    try {
      app.sendMessage({ room_id: roomId, message: text });
      return true;
    } catch (e) {
      console.error("[OmniCXM] sendMessage error:", e);
    }
  }
  return false;
}

export function useOmniCXM({
  secretKey,
  environment,
  enabled = true,
  hideFloatingButton = false,
  onPick,
  onReassigned,
  onSolved,
  onSpam,
  onLinkPeople,
  onNewMessage,
}: UseOmniCXMOptions) {
  const initialized = useRef(false);

  // ── 1. Load CSS ───────────────────────────────────────────────────────────
  const loadCSS = useCallback(() => {
    if (document.querySelector(`link[href="${OMNICXM_CSS_URL}"]`)) return;
    const link  = document.createElement("link");
    link.rel    = "stylesheet";
    link.href   = OMNICXM_CSS_URL;
    document.head.appendChild(link);
  }, []);

  // ── 2. Load JavaScript ────────────────────────────────────────────────────
  const loadScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${OMNICXM_JS_URL}"]`)) {
        resolve();
        return;
      }
      const script    = document.createElement("script");
      script.src      = OMNICXM_JS_URL;
      script.async    = true;
      script.onload   = () => resolve();
      script.onerror  = () => reject(new Error("[OmniCXM] Không tải được embed.js"));
      document.body.appendChild(script);
    });
  }, []);

  // ── 3. Init + ẩn floating button nếu cần ─────────────────────────────────
  const initApp = useCallback(() => {
    const app = (window as any).STOmniCXMEmbedApp;
    if (!app) {
      console.error("[OmniCXM] STOmniCXMEmbedApp chưa sẵn sàng");
      return;
    }
    const opts: Record<string, string> = { key: secretKey };
    if (environment && environment !== "product") opts.environment = environment;
    app.init(opts);
    initialized.current = true;
    console.log("[OmniCXM] Widget đã khởi tạo thành công");

    // Ẩn nút chat nổi - giao diện đa kênh đã được tích hợp vào TotalChat
    if (hideFloatingButton) {
      const style = document.createElement("style");
      style.id    = "omni-hide-fab";
      style.textContent = `
        /* Ẩn floating button OmniCXM - đã tích hợp vào màn Hội thoại */
        [class*="omni-fab"],
        [class*="omnicxm-fab"],
        [class*="st-omni-button"],
        [id*="omni-chat-button"],
        [id*="STOmniCXM"] {
          display: none !important;
          visibility: hidden !important;
        }
      `;
      if (!document.getElementById("omni-hide-fab")) {
        document.head.appendChild(style);
      }
    }
  }, [secretKey, environment, hideFloatingButton]);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !secretKey || initialized.current) return;
    loadCSS();
    loadScript()
      .then(initApp)
      .catch((err: Error) => console.error(err.message));
  }, [enabled, secretKey, loadCSS, loadScript, initApp]);

  // ── 4. Lắng nghe tất cả events từ OmniCXM ────────────────────────────────
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event?.data as OmniChatPayload & { message?: string };
      if (data?.from !== "OmniCXM_EmbedServiceChat") return;

      switch (data.event) {
        case "pick":       onPick?.(data);       break;
        case "reassigned": onReassigned?.(data); break;
        case "solved":     onSolved?.(data);     break;
        case "spam":       onSpam?.(data);       break;
        case "linkobject": onLinkPeople?.(data); break;
        default:
          // Có thể là event tin nhắn mới từ khách (nếu OmniCXM hỗ trợ)
          onNewMessage?.(data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onPick, onReassigned, onSolved, onSpam, onLinkPeople, onNewMessage]);
}