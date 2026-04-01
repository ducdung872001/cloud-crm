import React, { useState, useEffect } from "react";
import { showToast } from "utils/common";
import LoyaltyService from "@/services/LoyaltyService";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import "./ExchangeRatePanel.scss";

interface Props {
  onBackProps: (v: boolean) => void;
}

export default function ExchangeRatePanel({ onBackProps }: Props) {
  document.title = "Cấu hình tỷ lệ quy đổi điểm";

  const [exchangeRate, setExchangeRate]   = useState<number | "">(1000);
  const [savedRate, setSavedRate]         = useState<number>(1000);
  const [isLoading, setIsLoading]         = useState(true);
  const [isSaving, setIsSaving]           = useState(false);
  const [error, setError]                 = useState("");

  // ── Load config hiện tại ──────────────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    LoyaltyService.getConfig(ctrl.signal)
      .then((res) => {
        if (res.code === 0 && res.result?.exchangeRate) {
          setExchangeRate(res.result.exchangeRate);
          setSavedRate(res.result.exchangeRate);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
    return () => ctrl.abort();
  }, []);

  const hasChanged = Number(exchangeRate) !== savedRate;

  const validate = (): boolean => {
    if (!exchangeRate || Number(exchangeRate) <= 0) {
      setError("Tỷ lệ quy đổi phải lớn hơn 0");
      return false;
    }
    if (Number(exchangeRate) > 1_000_000) {
      setError("Tỷ lệ quy đổi không hợp lệ (tối đa 1.000.000 VND/điểm)");
      return false;
    }
    setError("");
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    const res = await LoyaltyService.saveConfig({ exchangeRate: Number(exchangeRate) });
    if (res.code === 0) {
      setSavedRate(Number(exchangeRate));
      showToast("Lưu cấu hình tỷ lệ quy đổi thành công", "success");
    } else {
      showToast(res.message ?? "Có lỗi xảy ra. Vui lòng thử lại", "error");
    }
    setIsSaving(false);
  };

  // Ví dụ minh hoạ
  const previewPoints   = 100;
  const previewMoney    = previewPoints * Number(exchangeRate || 0);

  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Tỷ lệ quy đổi điểm"
        titleBack="Quy tắc tích điểm"
        onBackProps={onBackProps}
      />

      <div className="card-box erp-wrap">
        {isLoading ? (
          <div className="erp-loading">Đang tải cấu hình...</div>
        ) : (
          <>
            {/* Giải thích */}
            <div className="erp-desc">
              <span className="erp-desc__icon">💡</span>
              <div>
                <strong>Tỷ lệ quy đổi điểm</strong> xác định{" "}
                <em>1 điểm tích lũy tương đương bao nhiêu VND</em> khi khách hàng
                dùng điểm để thanh toán tại quầy.
                <br />
                <span style={{ color: "#666", fontSize: 13 }}>
                  Thay đổi này có hiệu lực ngay với tất cả giao dịch mới.
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="erp-form">
              <div className="erp-form__row">
                <label className="erp-form__label">
                  1 điểm tích lũy
                  <span className="erp-form__required">*</span>
                </label>

                <div className="erp-form__input-wrap">
                  <span className="erp-form__prefix">=</span>
                  <input
                    className={`erp-form__input${error ? " erp-form__input--error" : ""}`}
                    type="number"
                    min={1}
                    step={100}
                    value={exchangeRate}
                    onChange={(e) => {
                      setExchangeRate(e.target.value === "" ? "" : Number(e.target.value));
                      setError("");
                    }}
                  />
                  <span className="erp-form__suffix">VND</span>
                </div>

                {error && <p className="erp-form__error">{error}</p>}
              </div>

              {/* Preview */}
              {!error && exchangeRate !== "" && Number(exchangeRate) > 0 && (
                <div className="erp-preview">
                  <div className="erp-preview__item">
                    <span className="erp-preview__label">Ví dụ:</span>
                    <span className="erp-preview__calc">
                      {previewPoints.toLocaleString("vi-VN")} điểm
                      {" "}={" "}
                      <strong style={{ color: "#6c5ce7" }}>
                        {previewMoney.toLocaleString("vi-VN")} đ
                      </strong>
                    </span>
                  </div>
                  <div className="erp-preview__item">
                    <span className="erp-preview__label">Khách có 1.000 điểm có thể giảm:</span>
                    <span className="erp-preview__calc">
                      <strong style={{ color: "#27ae60" }}>
                        {(1000 * Number(exchangeRate)).toLocaleString("vi-VN")} đ
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="erp-actions">
                <button
                  className="btn btn-primary"
                  disabled={isSaving || !hasChanged || !!error || exchangeRate === ""}
                  onClick={handleSave}
                >
                  {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
                </button>
                {hasChanged && (
                  <button
                    className="btn btn-outline-secondary"
                    disabled={isSaving}
                    onClick={() => { setExchangeRate(savedRate); setError(""); }}
                  >
                    Hủy thay đổi
                  </button>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="erp-note">
              <strong>Lưu ý:</strong> Tỷ lệ này áp dụng khi khách dùng điểm thanh toán tại POS.
              Việc tích điểm từ đơn hàng được điều chỉnh ở <em>Quy tắc tích điểm</em>.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
