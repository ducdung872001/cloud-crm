import React, { useState, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IActionModal } from "model/OtherModel";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";

interface ViettelBhdModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ViettelBhdModal({ isOpen, onClose }: ViettelBhdModalProps) {
    const values = useMemo(
        () => ({
            bhdToken: "",
        }),
        []
    );

    const validations: IValidation[] = [
        { name: "bhdToken", rules: "required" },
    ];

    const [formData, setFormData] = useState<IFormData>({ values: values, errors: {} });

    const listFieldBhd = useMemo<IFieldCustomize[]>(
        () => [
            {
                label: "Nhập token mới từ cổng BHD Hub",
                name: "bhdToken",
                type: "text",
                fill: true,
                required: true,
                placeholder: "Dán token vào đây...",
            },
        ],
        []
    );

    const actions = useMemo<IActionModal>(
        () => ({
            actions_right: {
                buttons: [
                    {
                        title: "Để sau",
                        color: "primary",
                        variant: "outline",
                        callback: onClose,
                    },
                    {
                        title: "Mở cổng BHD",
                        color: "primary",
                        variant: "outline",
                        callback: () => {
                            showToast("Đang mở cổng BHD Hub...", "success");
                        },
                    },
                    {
                        title: "Xác nhận & Phát hành",
                        color: "primary",
                        callback: () => {
                            const errors = Validate(validations, formData, listFieldBhd);
                            if (Object.keys(errors).length > 0) {
                                setFormData((prevState) => ({ ...prevState, errors: errors }));
                                return;
                            }
                            showToast("Đang phát hành 3 hóa đơn...", "success");
                            onClose();
                        },
                    },
                ],
            },
        }),
        [onClose, formData, listFieldBhd]
    );

    return (
        <Modal
            isFade={true}
            isOpen={isOpen}
            isCentered={true}
            staticBackdrop={true}
            toggle={onClose}
            className="viettel-modal viettel-modal--bhd"
        >
            <ModalHeader
                title="BHD Hub — Cần xử lý"
                toggle={onClose}
            />
            <ModalBody>
                <div className="viettel-modal-warning">
                    <div>
                        <div className="title">Token BHD Hub đã hết hạn</div>
                        <div className="subtitle">
                            Hết hạn ngày 25/10/2023. 3 hóa đơn đang bị trì hoãn.
                        </div>
                    </div>
                </div>
                <div className="viettel-modal-list">
                    <div className="list-title">3 hóa đơn đang chờ phát hành</div>
                    <div className="row">
                        <span>
                            <strong>#HĐ-1248</strong> · Nguyễn Thị Hoa
                        </span>
                        <span className="amount">122,500 ₫</span>
                    </div>
                    <div className="row">
                        <span>
                            <strong>#HĐ-1247</strong> · Trần Văn Bình
                        </span>
                        <span className="amount">285,000 ₫</span>
                    </div>
                    <div className="row">
                        <span>
                            <strong>#HĐ-1246</strong> · Lê Thị Minh
                        </span>
                        <span className="amount">89,000 ₫</span>
                    </div>
                </div>
                <div className="viettel-modal-field">
                    {listFieldBhd.map((field, index) => (
                        <FieldCustomize
                            key={index}
                            field={field}
                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBhd, setFormData)}
                            formData={formData}
                        />
                    ))}
                </div>
            </ModalBody>
            <ModalFooter actions={actions} />
        </Modal>
    );
}
