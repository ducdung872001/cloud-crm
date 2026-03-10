import React, { Fragment, useState, useEffect, useMemo } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFormData } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import Toggle from "@/components/toggle";
import { PRODUCT_DETAIL_CONFIG } from "@/assets/mock/Product";
import "./ConfigDisplayModal.scss"

interface ConfigDisplayModalProps {
  onShow: boolean;
  onHide: (reload?: boolean) => void;
}

export default function ConfigDisplayModal({ onShow, onHide }: ConfigDisplayModalProps) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [productDetail, setProductDetail] = useState<Record<string, boolean>>({});

  // Load saved config from localStorage on open
  useEffect(() => {
    if (onShow) {
      try {
        const saved = localStorage.getItem("productDetail");
        setProductDetail(saved ? JSON.parse(saved) : {});
      } catch {
        setProductDetail({});
      }
    }
  }, [onShow]);

  const initialValues = useMemo(() => ({ ...productDetail }), [onShow]);

  const handleProductDetailToggle = (key: string) => {
    setProductDetail((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmit(true);

    try {
      localStorage.setItem("productDetail", JSON.stringify(productDetail));
      showToast("Lưu cài đặt hiển thị thành công", "success");
      onHide(true);
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    } finally {
      setIsSubmit(false);
    }
  };

  const showDialogConfirmCancel = () => {
    const content: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Các thay đổi chưa lưu sẽ bị mất.</Fragment>,
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
    };
    setContentDialog(content);
    setShowDialog(true);
  };

  const clearForm = () => {
    onHide(false);
  };

  const hasChanges = JSON.stringify(productDetail) !== JSON.stringify(initialValues);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              hasChanges ? showDialogConfirmCancel() : clearForm();
            },
          },
          {
            title: "Lưu",
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
          <ModalHeader
            title="Cài đặt hiển thị sản phẩm"
            toggle={() => !isSubmit && clearForm()}
          />
          <ModalBody>
            <div className="config__section">
              <h3 style={{ paddingTop: "1.6rem" }}>Hiển thị các thông tin sản phẩm</h3>
              {PRODUCT_DETAIL_CONFIG.map((cfg) => (
                <div key={cfg.key} className="config__item">
                  <span>{cfg.label}</span>
                  <Toggle
                    checked={!!productDetail[cfg.key]}
                    onChange={() => handleProductDetailToggle(cfg.key)}
                  />
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