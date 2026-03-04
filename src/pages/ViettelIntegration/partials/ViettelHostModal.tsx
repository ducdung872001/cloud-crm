import React, { useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";

interface ViettelHostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ViettelHostModal({ isOpen, onClose }: ViettelHostModalProps) {
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
                        title: "Mở cổng quản lý",
                        color: "primary",
                        callback: () => {
                            showToast("Đang mở cổng quản lý Tendoo Host...", "success");
                            onClose();
                        },
                    },
                ],
            },
        }),
        [onClose]
    );

    return (
        <Modal
            isFade={true}
            isOpen={isOpen}
            isCentered={true}
            staticBackdrop={true}
            toggle={onClose}
            className="viettel-modal viettel-modal--host"
        >
            <ModalHeader
                title="Tendoo Host — Chi tiết"
                toggle={onClose}
            />
            <ModalBody>
                <div className="viettel-modal-info">
                    <div>
                        <span className="muted">Domain:</span>{" "}
                        <strong>minhhoa-shop.tendoo.vn</strong>
                    </div>
                    <div>
                        <span className="muted">Gói:</span> <strong>Business 50GB</strong>
                    </div>
                    <div>
                        <span className="muted">Dung lượng dùng:</span>{" "}
                        <strong>12.4 / 50 GB (24.8%)</strong>
                    </div>
                    <div>
                        <span className="muted">SSL:</span>{" "}
                        <span className="badge bd-green">Hợp lệ · Còn 89 ngày</span>
                    </div>
                    <div>
                        <span className="muted">Uptime:</span>{" "}
                        <strong>100% (30 ngày)</strong>
                    </div>
                </div>
                <div className="viettel-modal-storage">
                    <div className="storage-bar">
                        <div className="storage-fill" style={{ width: "24.8%" }} />
                    </div>
                    <div className="storage-label">12.4 GB / 50 GB đã dùng</div>
                </div>
            </ModalBody>
            <ModalFooter actions={actions} />
        </Modal>
    );
}
