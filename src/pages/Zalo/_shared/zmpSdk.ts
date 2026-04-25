// Placeholder cho Zalo Mini App JS SDK (zmp-sdk).
// Khi publish Mini App thật → thay bằng `import { ... } from "zmp-sdk/apis";`.
//
// Khi chạy trong Zalo app, window.ZMP được inject bởi Zalo container.
// Khi chạy ngoài (dev/web), các method fallback sang mock + console log.

type ZmpShareOptions = { type: "zmp"; data: { title: string; description: string; thumbnail?: string; path: string } };
type ZmpNotificationOptions = { title: string; body: string; icon?: string };

interface ZmpSdk {
  getUserInfo(): Promise<{ id: string; name: string; avatar: string }>;
  getPhoneNumber(): Promise<{ number: string } | null>;
  openUrl(url: string): void;
  openShareSheet(opts: ZmpShareOptions): Promise<{ success: boolean }>;
  requestNotification(opts: ZmpNotificationOptions): Promise<void>;
  onBackPressed(cb: () => boolean): void; // return true = handled
  closeApp(): void;
  isZaloApp(): boolean;
}

const runningInZalo = typeof window !== "undefined" && !!(window as unknown as { ZMP?: unknown }).ZMP;

const mockSdk: ZmpSdk = {
  async getUserInfo() {
    return { id: "zalo_mock_001", name: "Nguyễn Trọng Khoa", avatar: "" };
  },
  async getPhoneNumber() {
    return { number: "+84987654321" };
  },
  openUrl(url) {
    console.log("[ZMP mock] openUrl:", url);
    window.open(url, "_blank");
  },
  async openShareSheet(opts) {
    console.log("[ZMP mock] share:", opts);
    if (navigator.share) {
      await navigator.share({ title: opts.data.title, text: opts.data.description, url: location.origin + opts.data.path }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(location.origin + opts.data.path);
      alert("Đã copy link (mock). Zalo app thật sẽ mở share sheet native.");
    }
    return { success: true };
  },
  async requestNotification(opts) {
    console.log("[ZMP mock] notify:", opts);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(opts.title, { body: opts.body, icon: opts.icon });
    }
  },
  onBackPressed(cb) {
    const h = (e: PopStateEvent) => {
      if (cb()) { history.pushState(null, "", location.href); e.preventDefault(); }
    };
    window.addEventListener("popstate", h);
  },
  closeApp() { console.log("[ZMP mock] closeApp()"); },
  isZaloApp() { return runningInZalo; },
};

// Real SDK placeholder — khi publish sẽ replace
const realSdk: ZmpSdk = mockSdk; // TODO: import from "zmp-sdk/apis"

export const zmp: ZmpSdk = runningInZalo ? realSdk : mockSdk;
export const isZaloMiniApp = () => runningInZalo;
