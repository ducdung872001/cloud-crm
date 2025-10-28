import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import "./ModalCalling.scss";
import { showToast } from "utils/common";
import Loading from "components/loading";

export default function ModalCalling(props: any) {
  const {onHide, onShow, dataCustomer, statusCall, endCall, seconds } = props;
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Ngắt kết nối</Fragment>,
      message: <Fragment>Bạn có chắc chắn ngắt kết nối? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);
        clearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: !statusCall?.status || statusCall?.status === 'failed' || statusCall?.status === 'terminated' ? "Đóng" : "Dừng cuộc gọi",
            color: "destroy",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
                if(statusCall){
                    if(!statusCall?.status || statusCall?.status === 'failed' || statusCall?.status === 'terminated'){
                        onHide();
                    } else {
                        endCall();
                    }
                } else {
                    showDialogConfirmCancel();
                }
                
            },
          },
        //   {
        //     title: "Ngắt kết nối",
        //     type: "submit",
        //     color: "primary",
        //     disabled: isSubmit,
        //         // || (!isDifferenceObj(formData.values, values) && !formData.values.branchId),
        //     is_loading: isSubmit,
        //   },
        ],
      },
    }),
    [isSubmit, statusCall]
  );


  const clearForm = () => {
    onHide();
  }

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          if (!isSubmit) {
            clearForm()
          }
        }}
        className="modal-calling"
        // size="lg"
      >
        <form className="form-calling">
          <ModalHeader
            title={statusCall?.title ? statusCall?.title : "Đang thực hiện"}
            // toggle={() => {
            //   if (!isSubmit) {
            //     clearForm()
            //   }
            // }}
          />
          <ModalBody>
            <div className="list-form-calling">
                <div>
                    <span style={{fontSize: 16, fontWeight: 500}}>Khách hàng: {dataCustomer?.name}</span>
                </div>
                <div>
                    <span style={{fontSize: 16, fontWeight: 500}}>Số điện thoại: {dataCustomer?.phoneUnmasked || dataCustomer?.phoneMasked}</span>
                </div>
                {seconds ? 
                    <div>
                        <span style={{fontSize: 16, fontWeight: 500}}>Thời gian gọi: <span style={{color: 'green'}}>{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}</span></span>
                    </div>
                : null}
                {/* <Loading/> */}
                
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
