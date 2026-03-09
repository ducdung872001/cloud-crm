import React, { useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import "./ViettelModals.scss";

interface ViettelTendooModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigateSettings: () => void;
}

export default function ViettelTendooModal({ isOpen, onClose, onNavigateSettings }: ViettelTendooModalProps) {
    const actions = useMemo<IActionModal>(
        () => ({
            actions_right: {
                buttons: [
                    {
                        title: "Đóng",
                        color: "primary",
                        variant: "outline",
                        callback: onClose,
                    },
                    {
                        title: "Cài đặt",
                        color: "primary",
                        variant: "outline",
                        callback: () => {
                            onClose();
                            onNavigateSettings();
                        },
                    },
                    {
                        title: "Đồng bộ ngay",
                        color: "primary",
                        callback: () => {
                            showToast("Đang đồng bộ Tendoo Mall...", "success");
                            onClose();
                        },
                    },
                ],
            },
        }),
        [onClose, onNavigateSettings]
    );

    return (
        <Modal
            isFade={true}
            isOpen={isOpen}
            isCentered={true}
            staticBackdrop={true}
            toggle={onClose}
            className="viettel-modal viettel-modal--tendoo"
        >
            <ModalHeader
                title="Tendoo Mall — Chi tiết kết nối"
                toggle={onClose}
            />
            <ModalBody>
                <div className="viettel-modal-grid">
                    <div className="viettel-modal-stat tendoo">
                        <div className="value">142</div>
                        <div className="label">Đơn hôm nay</div>
                    </div>
                    <div className="viettel-modal-stat tendoo">
                        <div className="value">248</div>
                        <div className="label">SP đang sync</div>
                    </div>
                    <div className="viettel-modal-stat success">
                        <div className="value">99.8%</div>
                        <div className="label">Uptime</div>
                    </div>
                </div>
                <div className="viettel-modal-info">
                    <div>
                        <span className="muted">Shop ID:</span>{" "}
                        <span className="mono strong">SHOP-MH-00291</span>
                    </div>
                    <div>
                        <span className="muted">API Key:</span>{" "}
                        <span className="mono">tmall_live_sk_••••••2f8a</span>
                    </div>
                    <div>
                        <span className="muted">Kết nối từ:</span>{" "}
                        <strong>15/09/2023</strong>
                    </div>
                    <div>
                        <span className="muted">Lần đồng bộ cuối:</span>{" "}
                        <strong>10:32 hôm nay</strong>
                    </div>
                    <div>
                        <span className="muted">Trạng thái:</span>{" "}
                        <span className="badge bd-green">Đang hoạt động</span>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter actions={actions} />
        </Modal>
    );
}
