import React, { Fragment, useState, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import "./WarningWarrantyModal.scss";
import ExpireTimeWarning from "./ExpireTimeWarning/ExpireTimeWarning";

export default function WarningWarrantyModal(props: any) {
  const { onShow, onHide, dataContract } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [tab, setTab] = useState(1);

  const tabData = [
    {
      value: 1,
      label: "Hết hạn bảo hành",
    },
  ];

  const handleClearForm = () => {
    onHide(false);
    setTab(1);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handleClearForm();
            },
          },
          //   {
          //     //   title: id ? "Cập nhật" : "Tạo mới",
          //     title: "Lưu lại",
          //     type: "submit",
          //     color: "primary",
          //     disabled: false,
          //     is_loading: isSubmit,
          //   },
        ],
      },
    }),
    [isSubmit]
  );
  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-warning-guarantee"
        size="lg"
      >
        <form className="form-warning-guarantee">
          <ModalHeader
            title={`Cảnh báo bảo hành hợp đồng`}
            //   title={`${id ? "Chỉnh sửa" : "Thêm mới"} công việc`}
            toggle={() => {
              if (!isSubmit) {
                handleClearForm();
                // setTimeout(() => {
                //   setDataExpireTimeWarning({ value: "H", label: "Giờ" });
                //   setData(null);
                //   setAddFieldEmail([]);
                //   setAddFieldPhone([]);
                //   setMethodNotificationList([]);
                // }, 1000)
              }
            }}
          />
          <ModalBody>
            <div>
              <div className="header-tab">
                {tabData.map((item, index) => (
                  <div
                    key={index}
                    className={tab === item.value ? "box-tab-active" : "box-tab-inActive"}
                    onClick={() => {
                      setTab(item.value);
                    }}
                  >
                    <span className="name-tab">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className={tab === 1 ? "" : "d-none"}>
                <ExpireTimeWarning dataContract={dataContract} onHide={() => {}} />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
