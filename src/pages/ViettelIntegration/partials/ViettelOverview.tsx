import React, { useState } from "react";
import { showToast } from "utils/common";
import ViettelTendooModal from "./ViettelTendooModal";
import ViettelHostModal from "./ViettelHostModal";
import ViettelBhdModal from "./ViettelBhdModal";

interface ViettelOverviewProps {
    setActiveTab: (tab: "overview" | "wizard" | "settings" | "analytics") => void;
}

export default function ViettelOverview({ setActiveTab }: ViettelOverviewProps) {
    const [showTendooModal, setShowTendooModal] = useState(false);
    const [showHostModal, setShowHostModal] = useState(false);
    const [showBhdModal, setShowBhdModal] = useState(false);

    const mockOverviewStats = {
        connected: 3,
        warning: 1,
        disconnected: 1,
        syncToday: 2847,
    };

    return (
        <>
            <div className="viettel-overview">
                <div className="viettel-status-hero">
                    <div className="viettel-status-hero-left">
                        <div className="eyebrow">Hệ sinh thái Viettel · Mục 24 BRD</div>
                        <div className="title">3/4 dịch vụ đang hoạt động</div>
                        <div className="subtitle">Đồng bộ tự động mỗi 15 phút · Lần cuối: 10:32 hôm nay</div>
                    </div>
                    <div className="viettel-status-hero-right">
                        <div className="stat-pill">
                            <div className="value success">{mockOverviewStats.connected}</div>
                            <div className="label">Đã kết nối</div>
                        </div>
                        <div className="stat-pill">
                            <div className="value warning">{mockOverviewStats.warning}</div>
                            <div className="label">Cảnh báo</div>
                        </div>
                        <div className="stat-pill">
                            <div className="value muted">{mockOverviewStats.disconnected}</div>
                            <div className="label">Chưa kết nối</div>
                        </div>
                        <div className="stat-pill">
                            <div className="value">{mockOverviewStats.syncToday.toLocaleString("vi-VN")}</div>
                            <div className="label">Sync hôm nay</div>
                        </div>
                    </div>
                </div>

                <div className="viettel-services-grid">
                    <div
                        className="viettel-service-card connected tendoo"
                        onClick={() => setShowTendooModal(true)}
                    >
                        <div className="svc-header">
                            <div className="svc-header-left">
                                <div className="svc-logo tendoo">🛍️</div>
                                <div>
                                    <div className="svc-name">Tendoo Mall</div>
                                    <div className="svc-tagline">Sàn thương mại điện tử B2B Viettel</div>
                                </div>
                            </div>
                            <div className="svc-status-badge success">
                                <span className="dot" />
                                Đang kết nối
                            </div>
                        </div>
                        <div className="svc-metrics">
                            <div className="metric">
                                <div className="metric-value">142</div>
                                <div className="metric-label">Đơn hôm nay</div>
                            </div>
                            <div className="metric">
                                <div className="metric-value">248</div>
                                <div className="metric-label">Sản phẩm sync</div>
                            </div>
                            <div className="metric">
                                <div className="metric-value">99.8%</div>
                                <div className="metric-label">Uptime</div>
                            </div>
                        </div>
                        <div className="svc-actions">
                            <button
                                type="button"
                                className="svc-btn svc-btn-outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTendooModal(true);
                                }}
                            >
                                Xem đơn hàng
                            </button>
                            <button
                                type="button"
                                className="svc-btn svc-btn-ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showToast("Đang đồng bộ Tendoo Mall...", "success");
                                }}
                            >
                                Đồng bộ ngay
                            </button>
                        </div>
                    </div>

                    <div
                        className="viettel-service-card connected host"
                        onClick={() => setShowHostModal(true)}
                    >
                        <div className="svc-header">
                            <div className="svc-header-left">
                                <div className="svc-logo host">🖥️</div>
                                <div>
                                    <div className="svc-name">Tendoo Host</div>
                                    <div className="svc-tagline">Hosting & hạ tầng web Viettel</div>
                                </div>
                            </div>
                            <div className="svc-status-badge success">
                                <span className="dot" />
                                Đang kết nối
                            </div>
                        </div>
                        <div className="svc-metrics">
                            <div className="metric">
                                <div className="metric-value">12.4 GB</div>
                                <div className="metric-label">Dung lượng</div>
                            </div>
                            <div className="metric">
                                <div className="metric-value">45 ms</div>
                                <div className="metric-label">Latency</div>
                            </div>
                            <div className="metric">
                                <div className="metric-value">100%</div>
                                <div className="metric-label">Uptime</div>
                            </div>
                        </div>
                        <div className="svc-actions">
                            <button
                                type="button"
                                className="svc-btn svc-btn-outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowHostModal(true);
                                }}
                            >
                                Quản lý hosting
                            </button>
                            <button
                                type="button"
                                className="svc-btn svc-btn-ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showToast("📋 Đang tải logs...", "success");
                                }}
                            >
                                Xem logs
                            </button>
                        </div>
                    </div>

                    <div
                        className="viettel-service-card connected bhd warning"
                        onClick={() => setShowBhdModal(true)}
                    >
                        <div className="svc-header">
                            <div className="svc-header-left">
                                <div className="svc-logo bhd">🧾</div>
                                <div>
                                    <div className="svc-name">BHD Hub</div>
                                    <div className="svc-tagline">Hóa đơn điện tử & thuế Viettel</div>
                                </div>
                            </div>
                            <div className="svc-status-badge warning">
                                <span className="dot" />
                                Cần xử lý
                            </div>
                        </div>
                        <div className="svc-warning-box">3 hóa đơn đang chờ phát hành — cần xác nhận</div>
                        <div className="svc-metrics">
                            <div className="metric">
                                <div className="metric-value">1,248</div>
                                <div className="metric-label">HĐ tháng này</div>
                            </div>
                            <div className="metric">
                                <div className="metric-value">3</div>
                                <div className="metric-label">Chờ phát hành</div>
                            </div>
                            <div className="metric">
                                <div className="metric-value">₫128M</div>
                                <div className="metric-label">Giá trị HĐ</div>
                            </div>
                        </div>
                        <div className="svc-actions">
                            <button
                                type="button"
                                className="svc-btn svc-btn-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showToast("Đang phát hành 3 hóa đơn...", "success");
                                }}
                            >
                                Phát hành ngay
                            </button>
                            <button
                                type="button"
                                className="svc-btn svc-btn-ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowBhdModal(true);
                                }}
                            >
                                Danh sách HĐ
                            </button>
                        </div>
                    </div>

                    <div className="viettel-service-card disconnected cloud">
                        <div className="svc-header">
                            <div className="svc-header-left">
                                <div className="svc-logo cloud muted">☁️</div>
                                <div>
                                    <div className="svc-name muted">Viettel Cloud</div>
                                    <div className="svc-tagline">Lưu trữ & backup dữ liệu</div>
                                </div>
                            </div>
                            <div className="svc-status-badge muted">
                                <span className="dot" />
                                Chưa kết nối
                            </div>
                        </div>
                        <div className="svc-disconnected-body">
                            <div className="svc-disconnected-icon">☁️</div>
                            <div className="svc-disconnected-text">
                                Kết nối Viettel Cloud để tự động sao lưu dữ liệu, hình ảnh sản phẩm và bảo vệ toàn bộ cửa hàng.
                            </div>
                            <button
                                type="button"
                                className="cloud-setup-btn"
                                onClick={() => setActiveTab("wizard")}
                            >
                                Thiết lập ngay
                            </button>
                        </div>
                    </div>
                </div>

                <div className="viettel-activity-feed">
                    <div className="feed-header">
                        <span>Nhật ký hoạt động gần đây</span>
                        <button
                            type="button"
                            className="feed-view-all"
                            onClick={() => setActiveTab("analytics")}
                        >
                            Xem tất cả →
                        </button>
                    </div>
                    <div className="feed-list">
                        <div className="feed-item">
                            <span className="dot success" />
                            <span className="message">
                                Đồng bộ <strong>142 đơn hàng</strong> từ Tendoo Mall thành công
                            </span>
                            <span className="time">10:32</span>
                        </div>
                        <div className="feed-item">
                            <span className="dot info" />
                            <span className="message">
                                <strong>8 sản phẩm mới</strong> được đẩy lên Tendoo Mall từ kho hàng
                            </span>
                            <span className="time">10:15</span>
                        </div>
                        <div className="feed-item">
                            <span className="dot warning" />
                            <span className="message">
                                BHD Hub: <strong>3 hóa đơn</strong> cần phát hành — Token sắp hết hạn
                            </span>
                            <span className="time">09:48</span>
                        </div>
                        <div className="feed-item">
                            <span className="dot host" />
                            <span className="message">Tendoo Host: SSL certificate tự động gia hạn thành công</span>
                            <span className="time">08:00</span>
                        </div>
                    </div>
                </div>
            </div>

            <ViettelTendooModal
                isOpen={showTendooModal}
                onClose={() => setShowTendooModal(false)}
                onNavigateSettings={() => setActiveTab("settings")}
            />
            <ViettelHostModal
                isOpen={showHostModal}
                onClose={() => setShowHostModal(false)}
            />
            <ViettelBhdModal
                isOpen={showBhdModal}
                onClose={() => setShowBhdModal(false)}
            />
        </>
    );
}
