import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { formatFileSize, showToast } from "utils/common";
import { convertToFileName, isDifferenceObj, trimContent } from "reborn-util";
import "./ModalViewNoti.scss";
import parser from "html-react-parser";

export default function ModalViewNoti(props: any) {
  const { onShow, onHide, data } = props;
  // console.log('data', data);

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const onSubmit = async () => {
    // e.preventDefault();
    // setIsSubmit(true);
    // const body: any = {
    //   ...(formData.values as any),
    //   attachment: attachment,
    //   config: dataSchema ? JSON.stringify(dataSchema) : null,
    // };
    // console.log('body', body);
    // const response = await WorkOrderService.updatePause(body);
    // if (response.code === 0) {
    //   showToast(`Tạm dừng công việc thành công`, "success");
    //   handClearForm(true);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //   setIsSubmit(false);
    // }
  };

  const handClearForm = (acc) => {
    onHide(acc);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          //   {
          //     title: "Hủy",
          //     color: "primary",
          //     variant: "outline",
          //     disabled: isSubmit,
          //     callback: () => {
          //       !isDifferenceObj(formData.values, values) ? handClearForm(false) : showDialogConfirmCancel();
          //     },
          //   },
          //   {
          //     title: 'Xác nhận',
          //     // type: "submit",
          //     color: "primary",
          //     disabled: isSubmit || !formData.values.pauseReasonId,
          //     //  || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
          //     is_loading: isSubmit,
          //     callback: () => {
          //       onSubmit();
          //     }
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
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-view-noti"
        size="lg"
      >
        <form
          className="container-view-noti"
          // onSubmit={(e) => onSubmit(e)}
        >
          <ModalHeader
            title={`Thông báo hệ thống`}
            toggle={() => {
              !isSubmit && handClearForm(false);
            }}
          />
          <ModalBody>
            <div className="container-noti-body">
              <div className="title-noti">
                <span style={{ fontSize: 18, fontWeight: "600" }}>{data?.title}</span>
              </div>
              <div className="content-noti">{data && parser(data.content)}</div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
