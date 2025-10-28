import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import "./WarningGuaranteeModal.scss";
import ExpireTimeWarning from "./ExpireTimeWarning/ExpireTimeWarning";

export default function WarningGuaranteeModal(props: any) {
  const { onShow, onHide, dataContract } = props;

  //

  //   useEffect(() => {
  //     if (alertConfig) {
  //       setData(alertConfig);
  //     }
  //   }, [alertConfig]);

  const refOptionExpireTimeWarning = useRef();
  const refContainerExpireTimeWarning = useRef();

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [tab, setTab] = useState(1);

  const tabData = [
    {
      value: 1,
      label: "Hết hạn bảo lãnh",
    },
    // {
    //     value: 2,
    //     label: 'Gia hạn hợp đồng',
    // },
    // {
    //     value: 3,
    //     label: 'Đến hạn điều chỉnh giá',
    // },
    // {
    //     value: 4,
    //     label: 'Đến kỳ thanh toán',
    // },
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

  //   const showDialogConfirmCancel = () => {
  //     const contentDialog: IContentDialog = {
  //       color: "warning",
  //       className: "dialog-cancel",
  //       isCentered: true,
  //       isLoading: false,
  //       title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
  //       message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
  //       cancelText: "Quay lại",
  //       cancelAction: () => {
  //         setShowDialog(false);
  //         setContentDialog(null);
  //       },
  //       defaultText: "Xác nhận",
  //       defaultAction: () => {
  //         onHide(false);
  //         setShowDialog(false);
  //         setContentDialog(null);
  //         onHide(false);
  //         setDataExpireTimeWarning({ value: "H", label: "Giờ" });
  //         setData(null);
  //       },
  //     };
  //     setContentDialog(contentDialog);
  //     setShowDialog(true);
  //   };

  //   const checkKeyDown = useCallback(
  //     (e) => {
  //       const { keyCode } = e;
  //       if (keyCode === 27 && !showDialog) {
  //         if (isDifferenceObj(formData.values, values)) {
  //           showDialogConfirmCancel();
  //           if (focusedElement instanceof HTMLElement) {
  //             focusedElement.blur();
  //           }
  //         } else {
  //           onHide(false);
  //         }
  //       }
  //     },
  //     [formData]
  //   );

  //   useEffect(() => {
  //     window.addEventListener("keydown", checkKeyDown);

  //     return () => {
  //       window.removeEventListener("keydown", checkKeyDown);
  //     };
  //   }, [checkKeyDown]);

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
            title={`Cảnh báo bảo lãnh hợp đồng`}
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
