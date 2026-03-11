import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import Toggle from "@/components/toggle";
import { PRODUCT_DETAIL_CONFIG } from "@/assets/mock/Product";
import "./ConfigDisplayModal.scss";

interface ConfigDisplayModalProps {
  onShow: boolean;
  onHide: (reload?: boolean) => void;
}

export default function ConfigDisplayModal({ onShow, onHide }: ConfigDisplayModalProps) {
  const [isSubmit, setIsSubmit] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [settings, setSettings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (onShow) {
      try {
        const saved = localStorage.getItem("productDisplayConfig");
        if (saved) {
          setSettings(JSON.parse(saved));
        } else {
          // Khởi tạo từ defaultValue
          const defaults: Record<string, boolean> = {};
          PRODUCT_DETAIL_CONFIG.forEach((cfg) => {
            defaults[cfg.key] = cfg.defaultValue ?? false;
          });
          setSettings(defaults);
        }
      } catch {
        setSettings({});
      }
    }
  }, [onShow]);

  const initialValues = useMemo(() => ({ ...settings }), [onShow]);

  const handleToggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmit(true);
    try {
      localStorage.setItem("productDisplayConfig", JSON.stringify(settings));
      showToast("Lưu cài đặt hiển thị thành công", "success");
      onHide(true);
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    } finally {
      setIsSubmit(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialValues);

  const clearForm = () => onHide(false);

  const showDialogConfirmCancel = () => {
    setContentDialog({
      color: "warning",
      isCentered: true,
      title: <Fragment>Hủy bỏ thao tác</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy? Các thay đổi chưa lưu sẽ bị mất.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        clearForm();
        setShowDialog(false);
        setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => (hasChanges ? showDialogConfirmCancel() : clearForm()),
          },
          {
            title: "Lưu cài đặt",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, hasChanges]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && clearForm()}
        className="modal-config-display"
        size="md"
      >
        <form onSubmit={onSubmit}>
          <ModalHeader title="Cài đặt hiển thị Website (Toàn hệ thống)" toggle={() => !isSubmit && clearForm()} />
          <ModalBody>
            {/* Warning banner */}
            <div className="cfg-display__warning">⚠️ Cài đặt này áp dụng cho toàn bộ sản phẩm. Bạn có thể ghi đè cho từng sản phẩm riêng lẻ.</div>

            {/* Toggle list */}
            <div className="cfg-display__list">
              {PRODUCT_DETAIL_CONFIG.map((cfg) => (
                <div key={cfg.key} className="cfg-display__item">
                  <span className="cfg-display__label">{cfg.label}</span>
                  <Toggle checked={!!settings[cfg.key]} onChange={() => handleToggle(cfg.key)} />
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
