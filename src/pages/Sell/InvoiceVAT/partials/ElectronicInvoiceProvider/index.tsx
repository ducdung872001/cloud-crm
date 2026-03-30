import React, { useCallback, useEffect, useState } from "react";
import Icon from "components/icon";
import { showToast } from "utils/common";
import "./style.scss";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProviderItem {
  id: number;
  code: string;
  name: string;
  logoText: string;
  logoColor: string;
  description: string;
  tags: string | string[];        // JSON string hoặc đã parse
  baseUrl: string;
  authType: string;
  isActive: number;
  sortOrder: number;
  // config của bsnId hiện tại (nullable)
  configId: number | null;
  username: string | null;
  taxCode: string | null;
  endpointUrl: string | null;
  serialNo: string | null;
  templateCode: string | null;
  configActive: number | null;   // 1 = NCC này đang được chọn
  lastTestAt: string | null;
  lastTestStatus: "success" | "error" | "pending" | null;
  lastTestMessage: string | null;
}

interface ApiForm {
  username: string;
  password: string;
  taxCode: string;
  endpointUrl: string;
  serialNo: string;
  templateCode: string;
}

const EMPTY_FORM: ApiForm = {
  username: "",
  password: "",
  taxCode: "",
  endpointUrl: "",
  serialNo: "",
  templateCode: "",
};

const MASK = "············";

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE = "https://biz.reborn.vn";

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const json = await res.json();
  return json;
}

function parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) return tags;
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

function formatTestTime(ts: string | null): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    const hhmm = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const ddmm = d.toLocaleDateString("vi-VN");
    return `${ddmm} lúc ${hhmm}`;
  } catch {
    return ts;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ElectronicInvoiceProvider() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // NCC đang được chọn (radio)
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);

  // Form credentials bên sidebar
  const [form, setForm] = useState<ApiForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Kết quả test (local, cập nhật sau mỗi lần test)
  const [testStatus, setTestStatus] = useState<"success" | "error" | null>(null);
  const [testMessage, setTestMessage] = useState<string>("");
  const [testTime, setTestTime] = useState<string>("");

  // ── Load danh sách NCC ──────────────────────────────────────────────────────

  const loadProviders = useCallback(async () => {
    setLoading(true);
    try {
      const json = await apiFetch("/bizapi/integration/einvoice/providers");
      if (json.code === 0 && Array.isArray(json.result)) {
        const list: ProviderItem[] = json.result;
        setProviders(list);

        // Tự động chọn NCC đang active, hoặc NCC đầu tiên
        const active = list.find((p) => p.configActive === 1);
        const first  = list[0];
        const target = active ?? first;
        if (target) {
          selectProvider(target);
        }
      }
    } catch (err) {
      console.error("[EinvoiceProvider] load error", err);
      // Fallback mock để UI không trống
      const MOCK: ProviderItem[] = [
        {
          id: 1, code: "vnpt",    name: "VNPT Invoice",          logoText: "VNPT",   logoColor: "#003087",
          description: "Giải pháp hóa đơn điện tử của Tập đoàn VNPT, đang được hơn 200.000 doanh nghiệp sử dụng.",
          tags: '["Kết nối CQT","Ký số USB Token","API RESTful"]',
          baseUrl: "https://api.vnptinvoice.vn/v2", authType: "basic", isActive: 1, sortOrder: 1,
          configId: null, username: null, taxCode: null, endpointUrl: null, serialNo: null, templateCode: null,
          configActive: null, lastTestAt: null, lastTestStatus: null, lastTestMessage: null,
        },
        {
          id: 2, code: "viettel", name: "Viettel-CA / sinvoice", logoText: "Viettel", logoColor: "#e63946",
          description: "Nền tảng hóa đơn điện tử của Viettel, tích hợp CA và hóa đơn trên cùng một hệ thống.",
          tags: '["Kết nối CQT","CA Online","USB Token"]',
          baseUrl: "https://sinvoice.viettel.vn", authType: "basic", isActive: 1, sortOrder: 2,
          configId: null, username: null, taxCode: null, endpointUrl: null, serialNo: null, templateCode: null,
          configActive: null, lastTestAt: null, lastTestStatus: null, lastTestMessage: null,
        },
        {
          id: 3, code: "misa",    name: "MISA meInvoice",        logoText: "MISA",   logoColor: "#0ea5e9",
          description: "Giải pháp HĐĐT từ MISA, tích hợp sẵn với phần mềm kế toán MISA.",
          tags: '["Kết nối CQT","Tích hợp kế toán"]',
          baseUrl: "https://api.misainvoice.vn/v1", authType: "token", isActive: 1, sortOrder: 3,
          configId: null, username: null, taxCode: null, endpointUrl: null, serialNo: null, templateCode: null,
          configActive: null, lastTestAt: null, lastTestStatus: null, lastTestMessage: null,
        },
        {
          id: 4, code: "fast",    name: "FAST e-Invoice",        logoText: "FAST",   logoColor: "#f97316",
          description: "Hóa đơn điện tử FAST, giải pháp linh hoạt cho doanh nghiệp vừa và nhỏ.",
          tags: '["Kết nối CQT","Gói SME"]',
          baseUrl: "https://api.einvoice.com.vn", authType: "basic", isActive: 1, sortOrder: 4,
          configId: null, username: null, taxCode: null, endpointUrl: null, serialNo: null, templateCode: null,
          configActive: null, lastTestAt: null, lastTestStatus: null, lastTestMessage: null,
        },
      ];
      setProviders(MOCK);
      selectProvider(MOCK[1]); // default Viettel
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProviders(); }, [loadProviders]);

  // ── Chọn NCC → fill sidebar form ────────────────────────────────────────────

  function selectProvider(p: ProviderItem) {
    setSelectedCode(p.code);
    setSelectedProvider(p);
    setTestStatus(p.lastTestStatus === "success" ? "success"
                : p.lastTestStatus === "error"   ? "error"
                : null);
    setTestMessage(p.lastTestMessage ?? "");
    setTestTime(formatTestTime(p.lastTestAt));
    setForm({
      username:    p.username    ?? "",
      password:    p.configId    ? MASK : "",   // mask nếu đã có config
      taxCode:     p.taxCode     ?? "",
      endpointUrl: p.endpointUrl ?? p.baseUrl ?? "",
      serialNo:    p.serialNo    ?? "",
      templateCode: p.templateCode ?? "",
    });
  }

  function setField(key: keyof ApiForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // ── Kiểm tra kết nối ────────────────────────────────────────────────────────

  const handleTest = async () => {
    if (!selectedProvider) return;
    setIsTesting(true);
    setTestStatus(null);
    try {
      const body = {
        configId:     selectedProvider.configId,
        providerId:   selectedProvider.id,
        providerCode: selectedProvider.code,
        username:     form.username,
        password:     form.password,
        taxCode:      form.taxCode,
        endpointUrl:  form.endpointUrl,
      };
      const json = await apiFetch("/bizapi/integration/einvoice/config/test", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (json.code === 0 && json.result?.success) {
        setTestStatus("success");
        setTestMessage(json.result.message ?? "Kết nối thành công. Cổng CQT phản hồi bình thường.");
        setTestTime(formatTestTime(new Date().toISOString()));
        showToast("Kiểm tra kết nối thành công!", "success");
      } else {
        setTestStatus("error");
        setTestMessage(json.result?.message ?? json.message ?? "Kết nối thất bại.");
        showToast("Kiểm tra kết nối thất bại!", "error");
      }
    } catch (err: any) {
      setTestStatus("error");
      setTestMessage(err?.message ?? "Lỗi kết nối. Vui lòng thử lại.");
      showToast("Lỗi kết nối!", "error");
    } finally {
      setIsTesting(false);
    }
  };

  // ── Lưu & Kết nối ────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedProvider) return;
    if (!form.taxCode.trim()) {
      showToast("Vui lòng nhập mã số thuế doanh nghiệp", "warning");
      return;
    }
    setIsSaving(true);
    try {
      const body = {
        configId:     selectedProvider.configId,
        providerId:   selectedProvider.id,
        providerCode: selectedProvider.code,
        username:     form.username,
        password:     form.password,
        taxCode:      form.taxCode,
        endpointUrl:  form.endpointUrl,
        serialNo:     form.serialNo,
        templateCode: form.templateCode,
      };
      const json = await apiFetch("/bizapi/integration/einvoice/config/save", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (json.code === 0) {
        showToast("Lưu & Kết nối thành công!", "success");
        await loadProviders(); // reload để cập nhật badge "Đang sử dụng"
      } else {
        showToast(json.message ?? "Lưu thất bại", "error");
      }
    } catch (err: any) {
      showToast("Lỗi khi lưu cấu hình!", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="tab-nha-cung-cap ncc--loading">
        <div className="ncc__skeleton" />
        <div className="ncc__skeleton ncc__skeleton--short" />
        <div className="ncc__skeleton" />
      </div>
    );
  }

  return (
    <div className="tab-nha-cung-cap">
      {/* Header + Save button */}
      <div className="ncc__top-action">
        <button
          className={`btn-save-connect${isSaving ? " loading" : ""}`}
          onClick={handleSave}
          disabled={isSaving || !selectedProvider}
        >
          {isSaving ? (
            <><span className="spinner" /> Đang lưu...</>
          ) : (
            <><Icon name="Save" /> Lưu &amp; Kết nối</>
          )}
        </button>
      </div>

      {/* Notice */}
      <div className="ncc__notice">
        <Icon name="Info" />
        <p>
          Theo Nghị định 123/2020/NĐ-CP, doanh nghiệp phải sử dụng hóa đơn điện tử kết nối với
          cơ quan thuế thông qua nhà cung cấp được Bộ Tài Chính chứng nhận. Chọn 1 trong các
          nhà cung cấp bên dưới.
        </p>
      </div>

      <div className="ncc__body">
        {/* Danh sách NCC */}
        <div className="ncc__provider-list">
          <p className="list-label">CHỌN NHÀ CUNG CẤP HĐDT</p>
          {providers.map((p) => {
            const tags = parseTags(p.tags);
            const isSelected = selectedCode === p.code;
            const isUsing = p.configActive === 1;
            // "Đã kết nối" = có configId và lastTestStatus = success
            const isConnected = !!p.configId && p.lastTestStatus === "success";

            return (
              <div
                key={p.id}
                className={`provider-card${isSelected ? " selected" : ""}`}
                onClick={() => selectProvider(p)}
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
                    {tags.map((t) => (
                      <span key={t} className="tag">✓ {t}</span>
                    ))}
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
                onChange={(e) => setField("username", e.target.value)}
              />
            </div>
            <div className="api-field">
              <label>MẬT KHẨU / PASSWORD</label>
              <input
                type="password"
                value={form.password}
                placeholder="Nhập password"
                onChange={(e) => setField("password", e.target.value)}
              />
            </div>
            <div className="api-field">
              <label>MÃ SỐ THUẾ DOANH NGHIỆP</label>
              <input
                value={form.taxCode}
                placeholder="VD: 0311987654"
                onChange={(e) => setField("taxCode", e.target.value)}
              />
            </div>
            <div className="api-field">
              <label>ENDPOINT API</label>
              <input
                value={form.endpointUrl}
                placeholder={selectedProvider?.baseUrl ?? "https://..."}
                onChange={(e) => setField("endpointUrl", e.target.value)}
              />
            </div>
            <div className="api-field">
              <label>SỐ SERIAL MẪU HÓA ĐƠN</label>
              <input
                value={form.serialNo}
                placeholder="VD: C23TAA"
                onChange={(e) => setField("serialNo", e.target.value)}
              />
            </div>
            <div className="api-field">
              <label>MÃ MẪU HÓA ĐƠN</label>
              <input
                value={form.templateCode}
                placeholder="VD: 01GTKT0/001"
                onChange={(e) => setField("templateCode", e.target.value)}
              />
            </div>
          </div>

          <button
            className={`btn-test-conn${isTesting ? " loading" : ""}`}
            onClick={handleTest}
            disabled={isTesting}
          >
            {isTesting ? (
              <><span className="spinner" /> Đang kiểm tra...</>
            ) : (
              <><Icon name="RefreshCw" /> Kiểm tra kết nối</>
            )}
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