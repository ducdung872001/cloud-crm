// [CH] Community Hub - Check-in / Cửa vào
import React, { useState, useCallback } from "react";
import { MOCK_SCAN_RESULT, MOCK_RECENT_CHECKINS } from "@/mocks/community-hub/checkin";
import Icon from "@/components/icon";
import "./index.scss";

type ScanResult = typeof MOCK_SCAN_RESULT | null;

export default function CheckinPage() {
  document.title = "Check-in / Cửa vào";
  const [searchText, setSearchText] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleSearch = useCallback(() => {
    // [CH] Mock: simulate scan/search result
    if (searchText.trim()) {
      setScanResult(MOCK_SCAN_RESULT);
      setShowPopup(true);
    }
  }, [searchText]);

  const handleSimulateScan = useCallback(() => {
    setScanResult(MOCK_SCAN_RESULT);
    setShowPopup(true);
  }, []);

  const handleCheckin = useCallback((area: string) => {
    alert(`Check-in thành công vào ${area}!`);
    setShowPopup(false);
    setScanResult(null);
  }, []);

  return (
    <div className="ch-checkin-page">
      <div className="ch-checkin-page__header">
        <h2>Check-in / Cửa vào</h2>
      </div>

      {/* Scanner area */}
      <div className="ch-checkin-page__scanner">
        <div className="scanner-title">QUÉT THẺ / QR ĐỂ CHECK-IN</div>
        <div className="scanner-animation" onClick={handleSimulateScan}>
          <div className="scanner-circle">
            <div className="scanner-circle-inner">
              <Icon name="Barchart" />
            </div>
            <div className="scanner-pulse" />
          </div>
          <p className="scanner-hint">Nhấn để giả lập quét thẻ</p>
        </div>

        <div className="scanner-manual">
          <span>Hoặc tìm thủ công:</span>
          <div className="scanner-manual-input">
            <input
              type="text"
              placeholder="Tên, SĐT, mã thành viên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}>Tìm</button>
          </div>
        </div>
      </div>

      {/* Recent checkins */}
      <div className="ch-checkin-page__recent">
        <h3>Check-in gần đây</h3>
        <div className="recent-list">
          {MOCK_RECENT_CHECKINS.slice(0, 15).map((item) => (
            <div key={item.id} className="recent-item">
              <span className="recent-time">{item.timestamp.split(" ")[1]}</span>
              <span className="recent-name">{item.name}</span>
              <span className={`recent-direction ${item.direction}`}>
                {item.direction === "in" ? "▶ Vào" : "◀ Ra"}
              </span>
              <span className="recent-area">{item.area}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scan result popup */}
      {showPopup && scanResult && (
        <div className="ch-checkin-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="ch-checkin-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-avatar">
                {scanResult.avatar ? (
                  <img src={scanResult.avatar} alt={scanResult.name} />
                ) : (
                  <div className="popup-avatar-placeholder">
                    {scanResult.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="popup-info">
                <h3 className={`popup-status-${scanResult.status}`}>
                  {scanResult.status === "active" ? "✅" : scanResult.status === "expired" ? "❌" : "⚠️"}{" "}
                  {scanResult.name}
                </h3>
                <p>Thành viên {scanResult.plan}</p>
                <p>Hết hạn: {scanResult.valid_until}</p>
              </div>
              <button className="popup-close" onClick={() => setShowPopup(false)}>✕</button>
            </div>

            <div className="popup-quotas">
              <h4>Quota còn lại:</h4>
              {scanResult.quotas.map((q, i) => {
                const isWarning = q.remaining !== null && q.remaining <= 2;
                const isUnlimited = q.total === null;
                return (
                  <div key={i} className={`popup-quota-item ${isWarning ? "warning" : ""}`}>
                    <span className="quota-service">{q.service}</span>
                    <span className="quota-value">
                      {isUnlimited ? "∞" : `${q.remaining}/${q.total} còn lại`}
                    </span>
                    {isWarning && <span className="quota-badge">⚠️</span>}
                  </div>
                );
              })}
            </div>

            <div className="popup-actions">
              <button className="btn-checkin primary" onClick={() => handleCheckin("Co-working")}>
                Vào Co-working
              </button>
              <button className="btn-checkin" onClick={() => handleCheckin("Khu Spa")}>
                Vào Spa
              </button>
              <button className="btn-checkin" onClick={() => handleCheckin("Phòng riêng")}>
                Vào phòng riêng
              </button>
              <button className="btn-cancel" onClick={() => setShowPopup(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
