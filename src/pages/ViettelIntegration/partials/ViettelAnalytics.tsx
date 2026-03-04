import React, { useState } from "react";
import { showToast } from "utils/common";
import BoxTable from "components/boxTable/boxTable";
import Badge from "components/badge/badge";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";

export default function ViettelAnalytics() {
    const [analyticsRange, setAnalyticsRange] = useState<"today" | "7d" | "30d">("today");
    const [analyticsMetricType, setAnalyticsMetricType] = useState<"sync" | "success">("sync");

    const chartData = [
        { day: "T2", v: 380, color: "var(--tendoo)", opacity: 0.7 },
        { day: "T3", v: 210, color: "var(--host)", opacity: 0.7 },
        { day: "T4", v: 90, color: "var(--bhd)", opacity: 0.7 },
        { day: "T5", v: 420, color: "var(--tendoo)", opacity: 0.7 },
        { day: "T6", v: 195, color: "var(--host)", opacity: 0.7 },
        { day: "T7", v: 110, color: "var(--bhd)", opacity: 0.7 },
        { day: "CN", v: 350, color: "var(--tendoo)", opacity: 1 },
    ];
    const chartMax = Math.max(...chartData.map((d) => d.v));

    // Fake data for BoxTable
    const mockSyncLogs = [
        {
            id: 1,
            time: "10:32:15",
            service: "Tendoo Mall",
            serviceIcon: "🛍️",
            serviceColor: "blue",
            type: "Tồn kho realtime",
            data: "248 sản phẩm",
            status: "Thành công",
            statusColor: "green",
            processTime: "0.8s",
        },
        {
            id: 2,
            time: "10:30:00",
            service: "Tendoo Host",
            serviceIcon: "🖥️",
            serviceColor: "purple",
            type: "Upload hình ảnh",
            data: "12 ảnh mới",
            status: "Thành công",
            statusColor: "green",
            processTime: "3.2s",
        },
        {
            id: 3,
            time: "10:28:44",
            service: "BHD Hub",
            serviceIcon: "🧾",
            serviceColor: "mint",
            type: "Phát hành HĐ",
            data: "HĐ #1248",
            status: "Chờ token",
            statusColor: "amber",
            processTime: "—",
        },
        {
            id: 4,
            time: "10:17:00",
            service: "Tendoo Mall",
            serviceIcon: "🛍️",
            serviceColor: "blue",
            type: "Nhận đơn hàng",
            data: "8 đơn mới",
            status: "Thành công",
            statusColor: "green",
            processTime: "1.1s",
        },
        {
            id: 5,
            time: "09:48:20",
            service: "BHD Hub",
            serviceIcon: "🧾",
            serviceColor: "mint",
            type: "Phát hành HĐ",
            data: "HĐ #1247, #1246",
            status: "Token hết hạn",
            statusColor: "red",
            processTime: "—",
        },
    ];

    const [pagination, setPagination] = useState<PaginationProps>({
        ...DataPaginationDefault,
        name: "bản ghi",
        isChooseSizeLimit: true,
        totalItem: 5,
        totalPage: 1,
        page: 1,
        sizeLimit: 10,
        setPage: (page) => {
            setPagination(prev => ({ ...prev, page }));
        },
        chooseSizeLimit: (limit) => {
            setPagination(prev => ({ ...prev, sizeLimit: limit, page: 1 }));
        },
    });

    const titles = ["Thời gian", "Dịch vụ", "Loại đồng bộ", "Dữ liệu", "Trạng thái", "Thời gian xử lý"];
    const dataFormat = ["", "", "", "", "text-center", "text-center"];

    const dataMappingArray = (item, index) => [
        item.time,
        <Badge key={`svc-${item.id}`} text={`${item.serviceIcon} ${item.service}`} variant={item.serviceColor} />,
        item.type,
        item.data,
        <Badge key={`st-${item.id}`} text={item.status} variant={item.statusColor} />,
        item.processTime,
    ];


    return (
        <div className="viettel-analytics">
            <div className="analytics-wrap">
                <div className="analytics-topbar">
                    <button
                        type="button"
                        className={`btn btn-sm ${analyticsRange === "today" ? "btn-red" : "btn-ghost"}`}
                        onClick={() => setAnalyticsRange("today")}
                    >
                        Hôm nay
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${analyticsRange === "7d" ? "btn-red" : "btn-ghost"}`}
                        onClick={() => setAnalyticsRange("7d")}
                    >
                        7 ngày
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${analyticsRange === "30d" ? "btn-red" : "btn-ghost"}`}
                        onClick={() => setAnalyticsRange("30d")}
                    >
                        30 ngày
                    </button>

                    <div className="spacer" />
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => showToast("Đang xuất báo cáo đồng bộ...", "success")}
                    >
                        Xuất báo cáo
                    </button>
                    <button
                        type="button"
                        className="btn btn-red btn-sm"
                        onClick={() => showToast("Đồng bộ toàn bộ hệ thống...", "success")}
                    >
                        Đồng bộ ngay
                    </button>
                </div>

                <div className="analytics-body">
                    <div className="analytics-grid">
                        <div className="ag-card">
                            <div className="ag-val">2,847</div>
                            <div className="ag-lbl">Tổng lần sync hôm nay</div>
                            <span className="ag-delta delta-up">↑ +18%</span>
                        </div>
                        <div className="ag-card">
                            <div className="ag-val">2,831</div>
                            <div className="ag-lbl">Sync thành công</div>
                            <span className="ag-delta delta-up">99.4% tỷ lệ thành công</span>
                        </div>
                        <div className="ag-card">
                            <div className="ag-val">16</div>
                            <div className="ag-lbl">Sync thất bại</div>
                            <span className="ag-delta delta-dn">↑ +3 so hôm qua</span>
                        </div>
                        <div className="ag-card">
                            <div className="ag-val">1.2s</div>
                            <div className="ag-lbl">Thời gian sync TB</div>
                            <span className="ag-delta delta-up">↓ −0.3s tối ưu</span>
                        </div>
                    </div>

                    <div className="analytics-2col">
                        <div className="a-card">
                            <div className="a-card-title">
                                <span>Lượt đồng bộ theo dịch vụ (7 ngày)</span>
                                <select
                                    value={analyticsMetricType}
                                    onChange={(e) => setAnalyticsMetricType(e.target.value as any)}
                                >
                                    <option value="sync">Lượt sync</option>
                                    <option value="success">Thành công</option>
                                </select>
                            </div>
                            <div className="bar-chart">
                                {chartData.map((d) => {
                                    const pct = Math.round((d.v / chartMax) * 100);
                                    return (
                                        <div key={d.day} className="bc-col">
                                            <div
                                                className="bc-bar"
                                                style={{ height: `${pct}%`, background: d.color, opacity: d.opacity }}
                                                data-v={d.v}
                                                title={`${d.v}`}
                                            />
                                            <div className="bc-lbl">{d.day}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="chart-legend">
                                <span className="legend tendoo">■ Tendoo Mall</span>
                                <span className="legend host">■ Tendoo Host</span>
                                <span className="legend bhd">■ BHD Hub</span>
                            </div>
                        </div>

                        <div className="a-card">
                            <div className="a-card-title">Uptime & Độ trễ</div>
                            <div className="uptime-list">
                                <div className="uptime-item">
                                    <div className="row">
                                        <span className="name">Tendoo Mall</span>
                                        <span className="pct ok">99.8% ↑</span>
                                    </div>
                                    <div className="bar">
                                        <div className="fill ok" style={{ width: "99.8%" }} />
                                    </div>
                                    <div className="sub">Độ trễ TB: 48ms · Cuối cùng ping: 2 phút trước</div>
                                </div>
                                <div className="uptime-item">
                                    <div className="row">
                                        <span className="name">Tendoo Host</span>
                                        <span className="pct ok">100% ↑</span>
                                    </div>
                                    <div className="bar">
                                        <div className="fill ok" style={{ width: "100%" }} />
                                    </div>
                                    <div className="sub">Độ trễ TB: 45ms · SSL còn 89 ngày</div>
                                </div>
                                <div className="uptime-item warn">
                                    <div className="row">
                                        <span className="name">BHD Hub</span>
                                        <span className="pct warn">97.2% ⚠️</span>
                                    </div>
                                    <div className="bar">
                                        <div className="fill warn" style={{ width: "97.2%" }} />
                                    </div>
                                    <div className="sub warn">Token hết hạn → 3 giao dịch thất bại</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="a-card" style={{ padding: 0 }}>
                        <div className="a-card-title" style={{ padding: "1.5rem 1.5rem 0 1.5rem" }}>Nhật ký đồng bộ chi tiết</div>
                        <BoxTable
                            name="nhật ký"
                            titles={titles}
                            items={mockSyncLogs}
                            isPagination={true}
                            dataPagination={pagination}
                            dataMappingArray={(item, index) => dataMappingArray(item, index)}
                            dataFormat={dataFormat}
                            striped={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
