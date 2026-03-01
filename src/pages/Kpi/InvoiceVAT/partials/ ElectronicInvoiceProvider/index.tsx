import React, { useState } from "react";
import Icon from "components/icon";
import { showToast } from "utils/common";
import "./style.scss";

// ---- Types ----
interface Provider {
  id: string;
  name: string;
  logoText: string;
  logoColor: string;
  description: string;
  tags: string[];
  badges: string[];
  isConnected?: boolean;
}

interface ApiConfig {
  username: string;
  password: string;
  taxCode: string;
  endpoint: string;
}

// ---- Mock data ----
const PROVIDERS: Provider[] = [
  {
    id: "vnpt",
    name: "VNPT Invoice",
    logoText: "VNPT",
    logoColor: "#003087",
    description: "Giải pháp hóa đơn điện tử của Tập đoàn VNPT, đang được hơn 200.000 doanh nghiệp sử dụng. Tích hợp trực tiếp cổng CQT Bộ Tài Chính.",
    tags: ["Kết nối CQT", "Ký số USB Token", "API RESTful"],
    badges: ["Đang sử dụng"],
    isConnected: true,
  },
  {
    id: "viettel",
    name: "Viettel-CA / sinvoice",
    logoText: "Viettel",
    logoColor: "#e63946",
    description: "Nền tảng hóa đơn điện tử của Viettel, tích hợp CA và hóa đơn trên cùng một hệ thống. Hỗ trợ cả USB Token và CA online.",
    tags: ["Kết nối CQT", "CA Online", "USB Token"],
    badges: [],
  },
  {
    id: "misa",
    name: "MISA meInvoice",
    logoText: "MISA",
    logoColor: "#0ea5e9",
    description: "Giải pháp HĐĐT từ MISA, tích hợp sẵn với phần mềm kế toán MISA. Phù hợp cho doanh nghiệp đang dùng hệ sinh thái MISA.",
    tags: ["Kết nối CQT", "Tích hợp kế toán"],
    badges: [],
  },
  {
    id: "fast",
    name: "FAST e-Invoice",
    logoText: "FAST",
    logoColor: "#f97316",
    description: "Hóa đơn điện tử FAST, giải pháp linh hoạt cho doanh nghiệp vừa và nhỏ. Chi phí hợp lý, dễ tích hợp API.",
    tags: ["Kết nối CQT", "Gói SME"],
    badges: [],
  },
];

const DEFAULT_CONFIG: ApiConfig = {
  username: "POSME_SHOP_001",
  password: "············",
  taxCode: "0311987654",
  endpoint: "https://api.vnptinvoice.vn/v2",
};

export default function  ElectronicInvoiceProvider() {
  const [selectedId, setSelectedId] = useState("viettel");
  const [config, setConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>("success");

  const setField = (key: keyof ApiConfig, value: string) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    setIsTesting(false);
    setTestResult("success");
    showToast("Kiểm tra kết nối thành công!", "success");
  };

  const handleSave = () => {
    showToast("Lưu & Kết nối thành công!", "success");
  };

  return (
    <div className="tab-nha-cung-cap">
      {/* Notice */}
      <div className="ncc__notice">
        <Icon name="Info" />
        <p>
          Theo Nghị định 123/2020/NĐ-CP, doanh nghiệp phải sử dụng hóa đơn điện tử kết nối với cơ quan thuế thông qua nhà cung cấp được Bộ Tài Chính chứng nhận.
          Chọn 1 trong các nhà cung cấp bên dưới.
        </p>
      </div>

      <div className="ncc__body">
        {/* Provider list */}
        <div className="ncc__provider-list">
          <p className="list-label">CHỌN NHÀ CUNG CẤP HĐDT</p>

          {PROVIDERS.map((p) => (
            <div
              key={p.id}
              className={`provider-card${selectedId === p.id ? " selected" : ""}`}
              onClick={() => setSelectedId(p.id)}
            >
              <div className="provider-card__logo" style={{ background: p.logoColor }}>
                {p.logoText}
              </div>
              <div className="provider-card__info">
                <div className="provider-card__title-row">
                  <span className="provider-card__name">{p.name}</span>
                  {p.isConnected && <span className="badge-connected">● Đã kết nối</span>}
                  {p.badges.map((b) => (
                    <span key={b} className="badge-using">{b}</span>
                  ))}
                </div>
                <p className="provider-card__desc">{p.description}</p>
                <div className="provider-card__tags">
                  {p.tags.map((t) => (
                    <span key={t} className="tag">✓ {t}</span>
                  ))}
                </div>
              </div>
              <div className="provider-card__radio">
                <div className={`radio-circle${selectedId === p.id ? " checked" : ""}`}>
                  {selectedId === p.id && <div className="radio-dot" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* API Config sidebar */}
        <div className="ncc__api-config">
          <h4>Thông tin kết nối API</h4>

          <div className="api-form">
            <div className="api-field">
              <label>TÊN ĐĂNG NHẬP / USERNAME</label>
              <input value={config.username} onChange={(e) => setField("username", e.target.value)} />
            </div>
            <div className="api-field">
              <label>MẬT KHẨU / PASSWORD</label>
              <input type="password" value={config.password} onChange={(e) => setField("password", e.target.value)} />
            </div>
            <div className="api-field">
              <label>MÃ SỐ THUẾ DOANH NGHIỆP</label>
              <input value={config.taxCode} onChange={(e) => setField("taxCode", e.target.value)} />
            </div>
            <div className="api-field">
              <label>ENDPOINT API</label>
              <input value={config.endpoint} onChange={(e) => setField("endpoint", e.target.value)} />
            </div>
          </div>

          <button className={`btn-test-conn${isTesting ? " loading" : ""}`} onClick={handleTest} disabled={isTesting}>
            {isTesting ? (
              <><span className="spinner" /> Đang kiểm tra...</>
            ) : (
              <><Icon name="RefreshCw" /> Kiểm tra kết nối</>
            )}
          </button>

          {testResult === "success" && (
            <div className="conn-result success">
              <Icon name="CheckCircle" />
              <p>Kết nối thành công lần cuối: 28/02/2026 lúc 08:15 AM. Cổng CQT phản hồi bình thường.</p>
            </div>
          )}
          {testResult === "error" && (
            <div className="conn-result error">
              <Icon name="XCircle" />
              <p>Kết nối thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}