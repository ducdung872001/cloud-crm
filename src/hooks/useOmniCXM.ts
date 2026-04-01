import { useEffect, useRef, useCallback } from "react";

const OMNICXM_CSS_URL = "https://omni-api.worldfone.cloud/embed_app/application/public/css/embed.css";
const OMNICXM_JS_URL  = "https://omni-api.worldfone.cloud/embed_app/application/embed.js";

export type OmniEventName = "pick" | "reassigned" | "solved" | "spam" | "linkobject";

export interface OmniChatPayload {
  from: string;
  event: OmniEventName;
  source: string;        // 'zalo' | 'messenger' | 'livechat' | ...
  room_id: string;
  customernumber?: string;
  people_id?: string;    // chỉ có trong event 'linkobject'
}

interface UseOmniCXMOptions {
  secretKey: string;
  environment?: string;  // 'dev' | 'uat' | bỏ trống = production
  enabled?: boolean;     // chỉ init khi true (thường gắn với isLogin)
  onPick?:       (payload: OmniChatPayload) => void;
  onReassigned?: (payload: OmniChatPayload) => void;
  onSolved?:     (payload: OmniChatPayload) => void;
  onSpam?:       (payload: OmniChatPayload) => void;
  onLinkPeople?: (payload: OmniChatPayload) => void;
}

export function useOmniCXM({
  secretKey,
  environment,
  enabled = true,
  onPick,
  onReassigned,
  onSolved,
  onSpam,
  onLinkPeople,
}: UseOmniCXMOptions) {
  const initialized = useRef(false);

  // ── 1. Load CSS ────────────────────────────────────────────────────────────
  const loadCSS = useCallback(() => {
    if (document.querySelector(`link[href="${OMNICXM_CSS_URL}"]`)) return;
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = OMNICXM_CSS_URL;
    document.head.appendChild(link);
  }, []);

  // ── 2. Load JavaScript ─────────────────────────────────────────────────────
  const loadScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${OMNICXM_JS_URL}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src   = OMNICXM_JS_URL;
      script.async = true;
      script.onload  = () => resolve();
      script.onerror = () => reject(new Error("[OmniCXM] Không tải được embed.js"));
      document.body.appendChild(script);
    });
  }, []);

  // ── 3. Render Embed App ────────────────────────────────────────────────────
  const initApp = useCallback(() => {
    if (!(window as any).STOmniCXMEmbedApp) {
      console.error("[OmniCXM] STOmniCXMEmbedApp chưa sẵn sàng");
      return;
    }
    const opts: Record<string, string> = { key: secretKey };
    // Nếu production không cần cấu hình field environment
    if (environment && environment !== "product") {
      opts.environment = environment;
    }
    (window as any).STOmniCXMEmbedApp.init(opts);
    initialized.current = true;
    console.log("[OmniCXM] Widget đã khởi tạo thành công");
  }, [secretKey, environment]);

  // ── Bootstrap: load CSS → load JS → init ──────────────────────────────────
  useEffect(() => {
    if (!enabled || !secretKey || initialized.current) return;

    loadCSS();
    loadScript()
      .then(initApp)
      .catch((err: Error) => console.error(err.message));
  }, [enabled, secretKey, loadCSS, loadScript, initApp]);

  // ── 4. Lắng nghe Event Chat ────────────────────────────────────────────────
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event?.data as OmniChatPayload;
      if (data?.from !== "OmniCXM_EmbedServiceChat") return;

      switch (data.event) {
        case "pick":        onPick?.(data);       break;
        case "reassigned":  onReassigned?.(data); break;
        case "solved":      onSolved?.(data);     break;
        case "spam":        onSpam?.(data);       break;
        case "linkobject":  onLinkPeople?.(data); break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onPick, onReassigned, onSolved, onSpam, onLinkPeople]);
}
