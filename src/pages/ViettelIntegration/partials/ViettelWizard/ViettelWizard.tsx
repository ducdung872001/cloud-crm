import React, { useState, Fragment, useMemo } from "react";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { PHONE_REGEX, EMAIL_REGEX } from "utils/constant";
import Validate, { handleChangeValidate } from "utils/validate";
import "./ViettelWizard.scss";

interface ViettelWizardProps {
    setActiveTab: (tab: "overview" | "wizard" | "settings" | "analytics") => void;
}

export default function ViettelWizard({ setActiveTab }: ViettelWizardProps) {
    const [wizardStep, setWizardStep] = useState<number>(1);
    const [selectedServices, setSelectedServices] = useState({
        tendoo: true,
        host: true,
        bhd: true,
        cloud: false,
    });

    const handleWizardNav = (dir: number) => {
        setWizardStep((prev) => {
            const next = Math.max(1, Math.min(4, prev + dir));
            return next;
        });
    };

    const values = useMemo(
        () => ({
            name: "Cửa hàng Minh Hoa",
            taxCode: "0123456789",
            phone: "0901 234 567",
            email: "minhhoa@gmail.com",
            address: "123 Nguyễn Trãi, Phường 2, Quận 1, TP.HCM",
            avatar: "",
            tendooApiKey: "tmall_live_sk_••••••••••2f8a",
            tendooShopId: "SHOP-MH-00291",
            hostUsername: "minhhoa_shop",
            hostApiToken: "host_token_secret_xyz",
            bhdTaxCode: "0123456789",
            bhdToken: "",
        }),
        []
    );

    const validations: IValidation[] = [
        { name: "name", rules: "required" },
        { name: "taxCode", rules: "required" },
        { name: "phone", rules: "required|regex" },
        { name: "email", rules: "required|regex" },
        { name: "address", rules: "required" },
        // Step 3
        { name: "tendooApiKey", rules: "required" },
        { name: "tendooShopId", rules: "required" },
        { name: "hostUsername", rules: "required" },
        { name: "hostApiToken", rules: "required" },
        { name: "bhdTaxCode", rules: "required" },
        { name: "bhdToken", rules: "required" },
    ];

    const [formData, setFormData] = useState<IFormData>({ values: values, errors: {} });

    const listFieldStep1 = useMemo<IFieldCustomize[]>(
        () => [
            {
                label: "Tên cửa hàng",
                name: "name",
                type: "text",
                fill: true,
                required: true,
            },
            {
                label: "Mã số thuế",
                name: "taxCode",
                type: "text",
                fill: true,
                required: true,
            },
            {
                label: "Số điện thoại",
                name: "phone",
                type: "text",
                fill: true,
                required: true,
                regex: new RegExp(PHONE_REGEX),
                messageErrorRegex: "Số điện thoại không đúng định dạng",
            },
            {
                label: "Email liên hệ",
                name: "email",
                type: "text",
                fill: true,
                required: true,
                regex: new RegExp(EMAIL_REGEX),
                messageErrorRegex: "Email không đúng định dạng",
            },
            {
                label: "Địa chỉ kinh doanh",
                name: "address",
                type: "text",
                fill: true,
                required: true,
            },
        ],
        []
    );

    const listFieldTendoo = useMemo<IFieldCustomize[]>(
        () => [
            { label: "API Key", name: "tendooApiKey", type: "text", fill: true, required: true },
            { label: "Shop ID", name: "tendooShopId", type: "text", fill: true, required: true },
        ],
        []
    );

    const listFieldHost = useMemo<IFieldCustomize[]>(
        () => [
            { label: "Username", name: "hostUsername", type: "text", fill: true, required: true },
            { label: "API Token", name: "hostApiToken", type: "password", fill: true, required: true },
        ],
        []
    );

    const listFieldBhd = useMemo<IFieldCustomize[]>(
        () => [
            { label: "Mã số thuế (MST)", name: "bhdTaxCode", type: "text", fill: true, required: true },
            { label: "Token BHD", name: "bhdToken", type: "text", fill: true, required: true },
        ],
        []
    );

    return (
        <div className="viettel-wizard">
            <div className="wizard-wrap">
                <div className="wizard-box">
                    <div className="wizard-progress">
                        {[1, 2, 3, 4].map((step) => (
                            <Fragment key={step}>
                                <div className="wp-step">
                                    <div
                                        className={`wp-circle ${step < wizardStep ? "done" : step === wizardStep ? "active" : ""}`}
                                    >
                                        {step < wizardStep ? "✓" : step}
                                    </div>
                                    <div className={`wp-label ${step === wizardStep ? "active" : ""}`}>
                                        {step === 1 && "Thông tin"}
                                        {step === 2 && "Chọn dịch vụ"}
                                        {step === 3 && "Xác thực"}
                                        {step === 4 && "Kiểm tra"}
                                    </div>
                                </div>
                                {step < 4 && <div className={`wp-line ${step < wizardStep ? "done" : ""}`} />}
                            </Fragment>
                        ))}
                    </div>

                    <div className="wizard-body">
                        <div className={`wz-step ${wizardStep === 1 ? "active" : ""}`}>
                            <div className="wz-title">Thông tin cửa hàng</div>
                            <div className="wz-subtitle">
                                Điền đầy đủ thông tin để đăng ký trên hệ sinh thái Viettel
                            </div>
                            <div className="fg mb12">
                                {listFieldStep1.slice(0, 4).map((field, index) => (
                                    <FieldCustomize
                                        key={index}
                                        field={field}
                                        handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldStep1, setFormData)}
                                        formData={formData}
                                    />
                                ))}
                            </div>
                            <div className="fg full mb12">
                                {listFieldStep1.slice(4).map((field, index) => (
                                    <FieldCustomize
                                        key={index}
                                        field={field}
                                        handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldStep1, setFormData)}
                                        formData={formData}
                                    />
                                ))}
                            </div>
                            <div className="fg full">
                                <FileUpload type="avatar" label="Logo cửa hàng" formData={formData} setFormData={setFormData} />
                            </div>
                        </div>

                        <div className={`wz-step ${wizardStep === 2 ? "active" : ""}`}>
                            <div className="wz-title">Chọn dịch vụ cần kết nối</div>
                            <div className="wz-subtitle">Tích chọn các hệ thống Viettel bạn muốn tích hợp</div>
                            <div className="svc-selector">
                                <div
                                    className={`ss-card tendoo-sel ${selectedServices.tendoo ? "selected" : ""}`}
                                    onClick={() => setSelectedServices((p) => ({ ...p, tendoo: !p.tendoo }))}
                                >
                                    <div className="ss-header">
                                        <div className="ss-logo tendoo-bg">🛍️</div>
                                        <div>
                                            <div className="ss-name">Tendoo Mall</div>
                                        </div>
                                        <div className="ss-check">{selectedServices.tendoo ? "✓" : ""}</div>
                                    </div>
                                    <div className="ss-desc">
                                        Sàn thương mại điện tử B2B — đăng sản phẩm, nhận đơn hàng, đồng bộ tồn kho
                                    </div>
                                </div>

                                <div
                                    className={`ss-card host-sel ${selectedServices.host ? "selected" : ""}`}
                                    onClick={() => setSelectedServices((p) => ({ ...p, host: !p.host }))}
                                >
                                    <div className="ss-header">
                                        <div className="ss-logo host-bg">🖥️</div>
                                        <div>
                                            <div className="ss-name">Tendoo Host</div>
                                        </div>
                                        <div className="ss-check">{selectedServices.host ? "✓" : ""}</div>
                                    </div>
                                    <div className="ss-desc">
                                        Hosting website bán hàng — tốc độ cao, SSL miễn phí, băng thông không giới hạn
                                    </div>
                                </div>

                                <div
                                    className={`ss-card bhd-sel ${selectedServices.bhd ? "selected" : ""}`}
                                    onClick={() => setSelectedServices((p) => ({ ...p, bhd: !p.bhd }))}
                                >
                                    <div className="ss-header">
                                        <div className="ss-logo bhd-bg">🧾</div>
                                        <div>
                                            <div className="ss-name">BHD Hub</div>
                                        </div>
                                        <div className="ss-check">{selectedServices.bhd ? "✓" : ""}</div>
                                    </div>
                                    <div className="ss-desc">
                                        Hóa đơn điện tử theo chuẩn Bộ Tài chính — phát hành tự động sau mỗi đơn hàng
                                    </div>
                                </div>

                                <div
                                    className={`ss-card cloud-sel ${selectedServices.cloud ? "selected" : ""}`}
                                    onClick={() => setSelectedServices((p) => ({ ...p, cloud: !p.cloud }))}
                                >
                                    <div className="ss-header">
                                        <div className="ss-logo cloud-bg" style={{ opacity: 0.6 }}>
                                            ☁️
                                        </div>
                                        <div>
                                            <div className="ss-name">Viettel Cloud</div>
                                        </div>
                                        <div className="ss-check">{selectedServices.cloud ? "✓" : ""}</div>
                                    </div>
                                    <div className="ss-desc">
                                        Backup & lưu trữ đám mây — tự động sao lưu toàn bộ dữ liệu và hình ảnh
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`wz-step ${wizardStep === 3 ? "active" : ""}`}>
                            <div className="wz-title">Xác thực API & Thông tin đăng nhập</div>
                            <div className="wz-subtitle">
                                Nhập API Key hoặc thông tin tài khoản cho từng dịch vụ đã chọn
                            </div>

                            <div className="cred-block">
                                <div className="cb-header">
                                    <div className="svc-logo tendoo-bg mini">🛍️</div>
                                    <div className="cb-title">Tendoo Mall</div>
                                    <div className="cb-optional">
                                        <span className="badge bd-green">Đã xác thực</span>
                                    </div>
                                </div>
                                <div className="fg">
                                    {listFieldTendoo.map((field, index) => (
                                        <FieldCustomize
                                            key={index}
                                            field={field}
                                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldTendoo, setFormData)}
                                            formData={formData}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="cred-block">
                                <div className="cb-header">
                                    <div className="svc-logo host-bg mini">🖥️</div>
                                    <div className="cb-title">Tendoo Host</div>
                                    <div className="cb-optional">
                                        <span className="badge bd-green">Đã xác thực</span>
                                    </div>
                                </div>
                                <div className="fg">
                                    {listFieldHost.map((field, index) => (
                                        <FieldCustomize
                                            key={index}
                                            field={field}
                                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldHost, setFormData)}
                                            formData={formData}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="cred-block warn">
                                <div className="cb-header">
                                    <div className="svc-logo bhd-bg mini">🧾</div>
                                    <div className="cb-title">BHD Hub (Hóa đơn điện tử)</div>
                                    <div className="cb-optional">
                                        <span className="badge bd-amber">Cần cập nhật</span>
                                    </div>
                                </div>
                                <div className="fg">
                                    {listFieldBhd.map((field, index) => (
                                        <FieldCustomize
                                            key={index}
                                            field={field}
                                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBhd, setFormData)}
                                            formData={formData}
                                        />
                                    ))}
                                </div>
                                <div className="warn-note">
                                    Token hiện tại hết hạn ngày 25/10/2023. Vào cổng BHD Hub để lấy token mới.
                                </div>
                            </div>
                        </div>

                        <div className={`wz-step ${wizardStep === 4 ? "active" : ""}`}>
                            <div className="wz-title">Kiểm tra kết nối</div>
                            <div className="wz-subtitle">Hệ thống đang xác minh từng dịch vụ đã cấu hình...</div>
                            <div className="verify-grid">
                                <div className="vg-card ok">
                                    <div className="vg-top">
                                        <div className="vg-name">Tendoo Mall</div>
                                    </div>
                                    <div className="vg-detail">Kết nối thành công · Ping 48ms</div>
                                    <div className="vg-detail mt3">Shop ID: SHOP-MH-00291 · 248 SP</div>
                                </div>
                                <div className="vg-card ok">
                                    <div className="vg-top">
                                        <div className="vg-name">Tendoo Host</div>
                                    </div>
                                    <div className="vg-detail">Kết nối thành công · SSL hợp lệ</div>
                                    <div className="vg-detail mt3">Dung lượng: 12.4/50 GB</div>
                                </div>
                                <div className="vg-card warn">
                                    <div className="vg-top">
                                        <div className="vg-name">BHD Hub</div>
                                    </div>
                                    <div className="vg-detail warn-text">Token hết hạn — cần cập nhật</div>
                                    <div className="checking-anim">
                                        <div className="ca-dot" />
                                        <div className="ca-dot" />
                                        <div className="ca-dot" />
                                    </div>
                                </div>
                                <div className="vg-card muted">
                                    <div className="vg-top">
                                        <div className="vg-name muted">Viettel Cloud</div>
                                    </div>
                                    <div className="vg-detail">Chưa cấu hình trong bước này</div>
                                    <div className="mt6">
                                        <span className="badge bd-gray">Bỏ qua</span>
                                    </div>
                                </div>
                            </div>
                            <div className="verify-summary">
                                <div>
                                    <div className="title">2/3 dịch vụ đã kết nối thành công!</div>
                                    <div className="subtitle">
                                        BHD Hub cần cập nhật token. Bạn có thể tiếp tục và xử lý sau.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="wizard-footer">
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            disabled={wizardStep === 1}
                            onClick={() => handleWizardNav(-1)}
                        >
                            ← Quay lại
                        </button>
                        <div className="wizard-footer-step">
                            Bước <span>{wizardStep}</span> / 4
                        </div>
                        <button
                            type="button"
                            className="btn btn-red btn-sm"
                            onClick={() => {
                                if (wizardStep === 4) {
                                    setActiveTab("overview");
                                    return;
                                }
                                handleWizardNav(1);
                            }}
                        >
                            {wizardStep === 4 ? "Hoàn tất thiết lập" : "Tiếp theo →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

