import React, { useCallback, useEffect, useRef, useState } from "react";
import Icon from "components/icon";
import { showToast } from "utils/common";
import EinvoiceProviderService, { ProviderItem } from "services/EinvoiceProviderService";
import "./style.scss";

// ── Static fallback (render ngay, không chờ API) ──────────────────────────────
const PROVIDERS_MOCK: ProviderItem[] = [
  {
    id: 1, code: "vnpt", name: "VNPT Invoice",
    logoText: "VNPT", logoColor: "#003087",
    description: "Giải pháp hóa đơn điện tử của Tập đoàn VNPT, đang được hơn 200.000 doanh nghiệp sử dụng. Tích hợp trực tiếp cổng CQT Bộ Tài Chính.",
    tags: ["Kết nối CQT", "Ký số USB Token", "API RESTful"],
    baseUrl: "https://api.vnptinvoice.vn/v2", authType: "basic", isActive: 1, sortOrder: 1,
    configId: null, username: null, taxCode: null, endpointUrl: null,
    serialNo: null, templateCode: null, configActive: null,
    lastTestAt: null, lastTestStatus: null, lastTestMessage: null,
  },
  {
    id: 2, code: "viettel", name: "Viettel-CA / sinvoice",
    logoText: "Viettel", logoColor: "#e63946",
    description: "Nền tảng hóa đơn điện tử của Viettel, tích hợp CA và hóa đơn trên cùng một hệ thống. Hỗ trợ cả USB Token và CA online.",
    tags: ["Kết nối CQT", "CA Online", "USB Token"],
    baseUrl: "https://sinvoice.viettel.vn", authType: "basic", isActive: 1, sortOrder: 2,
    configId: null, username: null, taxCode: null, endpointUrl: null,
    serialNo: null, templateCode: null, configActive: null,
    lastTestAt: null, lastTestStatus: null, lastTestMessage: null,
  },
  {
    id: 3, code: "misa", name: "MISA meInvoice",
    logoText: "MISA", logoColor: "#0ea5e9",
    description: "Giải pháp HĐĐT từ MISA, tích hợp sẵn với phần mềm kế toán MISA. Phù hợp cho doanh nghiệp đang dùng hệ sinh thái MISA.",
    tags: ["Kết nối CQT", "Tích hợp kế toán"],
    baseUrl: "https://api.misainvoice.vn/v1", authType: "token", isActive: 1, sortOrder: 3,
    configId: null, username: null, taxCode: null, endpointUrl: null,
    serialNo: null, templateCode: null, configActive: null,
    lastTestAt: null, lastTestStatus: null, lastTestMessage: null,
  },
  {
    id: 4, code: "fast", name: "FAST e-Invoice",
    logoText: "FAST", logoColor: "#f97316",
    description: "Hóa đơn điện tử FAST, giải pháp linh hoạt cho doanh nghiệp vừa và nhỏ. Chi phí hợp lý, dễ tích hợp API.",
    tags: ["Kết nối CQT", "Gói SME"],
    baseUrl: "https://api.einvoice.com.vn", authType: "basic", isActive: 1, sortOrder: 4,
    configId: null, username: null, taxCode: null, endpointUrl: null,
    serialNo: null, templateCode: null, configActive: null,
    lastTestAt: null, lastTestStatus: null, lastTestMessage: null,
  },
  {
    id: 5, code: "einvoicevn", name: "E-Invoice Vietnam",
    logoText: "EIN", logoColor: "#7c3aed",
    description: "Nền tảng hóa đơn điện tử E-Invoice.com.vn, hỗ trợ nhiều loại hình doanh nghiệp và tích hợp API linh hoạt.",
    tags: ["Kết nối CQT", "API RESTful"],
    baseUrl: "https://einvoice.vn/api", authType: "basic", isActive: 1, sortOrder: 5,
    configId: null, username: null, taxCode: null, endpointUrl: null,
    serialNo: null, templateCode: null, configActive: null,
    lastTestAt: null, lastTestStatus: null, lastTestMessage: null,
  },
];

const MASK = "············";

interface ApiForm {
  username: string;
  password: string;
  taxCode: string;
  endpointUrl: string;
  serialNo: string;
  templateCode: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) return tags;
  try { return JSON.parse(tags); } catch { return [tags]; }
}

function formatTestTime(ts: string | null): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return `${d.toLocaleDateString("vi-VN")} lúc ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  } catch { return ts; }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ElectronicInvoiceProvider() {
  const [providers, setProviders] = useState<ProviderItem[]>(PROVIDERS_MOCK);

  // Ref để tránh stale closure trong handleSave / handleTest
  const selectedProviderRef = useRef<ProviderItem>(PROVIDERS_MOCK[1]);
  const formRef             = useRef<ApiForm>({
    username: "", password: "", taxCode: "",
    endpointUrl: PROVIDERS_MOCK[1].baseUrl, serialNo: "", templateCode: "",
  });

  const [selectedCode, setSelectedCode] = useState("viettel");
  const [form, _setForm]                = useState<ApiForm>(formRef.current);

  const [isSaving,  setIsSaving]  = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [testStatus,  setTestStatus]  = useState<"success" | "error" | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [testTime,    setTestTime]    = useState("");

  // Wrapper: luôn sync state → ref cùng lúc
  const setForm = useCallback((updater: ((prev: ApiForm) => ApiForm) | ApiForm) => {
    _setForm((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      formRef.current = next;
      return next;
    });
  }, []);

  // ── Áp dụng selection → sidebar ───────────────────────────────────────────

  const applyProvider = useCallback((p: ProviderItem) => {
    selectedProviderRef.current = p;
    setSelectedCode(p.code);

    setTestStatus(
      p.lastTestStatus === "success" ? "success" :
      p.lastTestStatus === "error"   ? "error"   : null
    );
    setTestMessage(p.lastTestMessage ?? "");
    setTestTime(formatTestTime(p.lastTestAt));

    const next: ApiForm = {
      username:     p.username     ?? "",
      // Nếu đã có config → hiển thị mask, chưa có → trống để user nhập
      password:     p.configId ? MASK : "",
      taxCode:      p.taxCode      ?? "",
      endpointUrl:  p.endpointUrl  ?? p.baseUrl ?? "",
      serialNo:     p.serialNo     ?? "",
      templateCode: p.templateCode ?? "",
    };
    formRef.current = next;
    _setForm(next);
  }, []);

  // ── Load providers từ API ──────────────────────────────────────────────────
  // Tách hàm để gọi lại sau save (keepCode = giữ NCC đang chọn)

  const loadProviders = useCallback(async (keepCode?: string) => {
    const list = await EinvoiceProviderService.listProviders();
    if (list.length === 0) return; // giữ mock

    setProviders(list);

    // Sau reload: tìm đúng NCC đang chọn để sidebar cập nhật configId + badge
    const codeToSelect = keepCode ?? selectedProviderRef.current.code;
    const target =
      list.find((p) => p.code === codeToSelect) ??
      list.find((p) => p.configActive === 1) ??
      list[0];

    if (target) applyProvider(target);
  }, [applyProvider]);

  // Load lần đầu khi mount
  useEffect(() => { loadProviders(); }, [loadProviders]);

  // ── Lưu & Kết nối ────────────────────────────────────────────────────────

  const handleSave = async () => {
    // Đọc từ ref → không bị stale closure
    const p = selectedProviderRef.current;
    const f = formRef.current;

    if (!f.taxCode.trim()) {
      showToast("Vui lòng nhập mã số thuế doanh nghiệp", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const res = await EinvoiceProviderService.saveConfig({
        configId:     p.configId ?? null,
        providerId:   p.id,
        providerCode: p.code,
        username:     f.username,
        password:     f.password === MASK ? "" : f.password, // không gửi mask
        taxCode:      f.taxCode,
        endpointUrl:  f.endpointUrl,
        serialNo:     f.serialNo,
        templateCode: f.templateCode,
      });

      if (res.ok) {
        showToast("Lưu & Kết nối thành công!", "success");
        // Reload để cập nhật configId + badge "Đang sử dụng", giữ NCC đang chọn
        await loadProviders(p.code);
      } else {
        showToast(res.message ?? "Lưu thất bại, vui lòng thử lại", "error");
      }
    } catch {
      showToast("Lỗi khi lưu cấu hình!", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Kiểm tra kết nối ─────────────────────────────────────────────────────

  const handleTest = async () => {
    const p = selectedProviderRef.current;
    const f = formRef.current;

    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await EinvoiceProviderService.testConnection({
        configId:     p.configId ?? null,
        providerId:   p.id,
        providerCode: p.code,
        username:     f.username,
        password:     f.password === MASK ? "" : f.password,
        taxCode:      f.taxCode,
        endpointUrl:  f.endpointUrl,
        serialNo:     f.serialNo,
        templateCode: f.templateCode,
      });

      if (res.success) {
        setTestStatus("success");
        setTestMessage(res.message);
        setTestTime(formatTestTime(new Date().toISOString()));
        showToast("Kiểm tra kết nối thành công!", "success");
      } else {
        setTestStatus("error");
        setTestMessage(res.message);
        showToast("Kiểm tra kết nối thất bại!", "error");
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Lỗi kết nối. Vui lòng thử lại.");
      showToast("Lỗi kết nối!", "error");
    } finally {
      setIsTesting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="tab-nha-cung-cap">
      <div className="ncc__notice">
        <Icon name="Info" />
        <p>
          Theo Nghị định 123/2020/NĐ-CP, doanh nghiệp phải sử dụng hóa đơn điện tử kết nối với
          cơ quan thuế thông qua nhà cung cấp được Bộ Tài Chính chứng nhận.
          Chọn 1 trong các nhà cung cấp bên dưới.
        </p>
      </div>

      <div className="ncc__body">
        {/* Danh sách NCC */}
        <div className="ncc__provider-list">
          <p className="list-label">CHỌN NHÀ CUNG CẤP HĐDT</p>

          {providers.map((p) => {
            const tags        = parseTags(p.tags);
            const isSelected  = selectedCode === p.code;
            const isUsing     = p.configActive === 1;
            const isConnected = !!p.configId && p.lastTestStatus === "success";

            return (
              <div
                key={p.id}
                className={`provider-card${isSelected ? " selected" : ""}`}
                onClick={() => applyProvider(p)}
              >
                <div className="provider-card__logo" style={{ background: p.logoColor }}>
                  {p.logoText}
                </div>
                <div className="provider-card__info">
                  <div className="provider-card__title-row">
                    <span className="provider-card__name">{p.name}</span>
                    {isConnected && <span className="badge-connected">● Đã kết nối</span>}
                    {isUsing     && <span className="badge-using">Đang sử dụng</span>}
                  </div>
                  <p className="provider-card__desc">{p.description}</p>
                  <div className="provider-card__tags">
                    {tags.map((t) => <span key={t} className="tag">✓ {t}</span>)}
                  </div>
                </div>
                <div className="provider-card__radio">
                  <div className={`radio-circle${isSelected ? " checked" : ""}`}>
                    {isSelected && <div className="radio-dot" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar cấu hình API */}
        <div className="ncc__api-config">
          <h4>Thông tin kết nối API</h4>

          <div className="api-form">
            <div className="api-field">
              <label>TÊN ĐĂNG NHẬP / USERNAME</label>
              <input
                value={form.username}
                placeholder="Nhập username API"
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              />
            </div>
            <div className="api-field">
              <label>MẬT KHẨU / PASSWORD</label>
              <input
                type="password"
                value={form.password}
                placeholder="Nhập password"
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="api-field">
              <label>MÃ SỐ THUẾ DOANH NGHIỆP</label>
              <input
                value={form.taxCode}
                placeholder="VD: 0311987654"
                onChange={(e) => setForm((f) => ({ ...f, taxCode: e.target.value }))}
              />
            </div>
            <div className="api-field">
              <label>ENDPOINT API</label>
              <input
                value={form.endpointUrl}
                placeholder="https://..."
                onChange={(e) => setForm((f) => ({ ...f, endpointUrl: e.target.value }))}
              />
            </div>
            <div className="api-field">
              <label>SỐ SERIAL MẪU HÓA ĐƠN</label>
              <input
                value={form.serialNo}
                placeholder="VD: C23TAA"
                onChange={(e) => setForm((f) => ({ ...f, serialNo: e.target.value }))}
              />
            </div>
            <div className="api-field">
              <label>MÃ MẪU HÓA ĐƠN</label>
              <input
                value={form.templateCode}
                placeholder="VD: 01GTKT0/001"
                onChange={(e) => setForm((f) => ({ ...f, templateCode: e.target.value }))}
              />
            </div>
          </div>

          <button
            className={`btn-test-conn${isTesting ? " loading" : ""}`}
            onClick={handleTest}
            disabled={isTesting}
          >
            {isTesting
              ? <><span className="spinner btn-test-conn__spinner" /> Đang kiểm tra...</>
              : <><Icon name="RefreshCw" /> Kiểm tra kết nối</>
            }
          </button>

          <button
            className={`btn-save-connect-inline${isSaving ? " loading" : ""}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? <><span className="spinner" /> Đang lưu...</>
              : <><Icon name="Save" /> Lưu &amp; Kết nối</>
            }
          </button>

          {testStatus === "success" && (
            <div className="conn-result success">
              <Icon name="CheckCircle" />
              <p>
                {testMessage || "Kết nối thành công."}
                {testTime && <><br /><span className="conn-time">Lần cuối: {testTime}</span></>}
              </p>
            </div>
          )}
          {testStatus === "error" && (
            <div className="conn-result error">
              <Icon name="XCircle" />
              <p>{testMessage || "Kết nối thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}