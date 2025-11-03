import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IChooseJobTitleDifferentModalProps } from "model/department/PropsModel";
import { IPermissionCloneRequest } from "model/permission/PermissionRequestModel";
import Radio from "components/radio/radio";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import PermissionService from "services/PermissionService";
import "./ChooseJobTitleDifferentModal.scss";

export default function ChooseJobTitleDifferentModal(props: IChooseJobTitleDifferentModalProps) {
  const { onShow, onHide, data, listData, sourceDepartmentId } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [listJobTitleDifferent, setListJobTitleDifferent] = useState([]);
  const [idJobTitleDifferent, setIdJobTitleDifferent] = useState<number>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //? đoạn này xử lý vấn đề lấy ra chức danh khác với chức danh được chọn
  useEffect(() => {
    if (data !== null && listData.length > 0) {
      const result = listData.filter((item) => item.id !== data?.id);

      setListJobTitleDifferent(result);
    }
  }, [data, listData]);

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác sao chép chức danh khác</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  //! đoạn này xử lý vấn đề call api sao chép chức danh
  const onSubmit = async () => {
    setIsSubmit(true);

    const body: IPermissionCloneRequest = {
      sourceDepartmentId: sourceDepartmentId,
      sourceJteId: idJobTitleDifferent,
      targetDepartmentId: sourceDepartmentId,
      targetLstJteId: [data?.id],
    };

    const response = await PermissionService.permissionClone(body);

    if (response.code === 0) {
      showToast("Sao chép chức danh thành công", "success");
      setIsSubmit(false);
      setIdJobTitleDifferent(null);
      onHide(true);
    } else {
      setIsSubmit(false);
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            callback: () => {
              idJobTitleDifferent ? showDialogConfirmCancel() : onHide(false);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: idJobTitleDifferent ? false : true,
            is_loading: isSubmit,
            callback: () => {
              if (idJobTitleDifferent) {
                onSubmit();
              }
            },
          },
        ],
      },
    }),
    [idJobTitleDifferent, isSubmit]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-copy-jobtitle">
        <div className="form__copy--jobtitle">
          <ModalHeader title="Chọn chức danh khác cần sao chép" toggle={() => onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listJobTitleDifferent.map((item, idx) => (
                <div
                  key={idx}
                  className="form-group"
                  onClick={(e) => {
                    e.preventDefault();
                    setIdJobTitleDifferent(item.id);
                  }}
                >
                  <Radio
                    checked={item.id === idJobTitleDifferent}
                    label={item.title}
                    onChange={(e) => {
                      //
                    }}
                  />
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
        <Dialog content={contentDialog} isOpen={showDialog} />
      </Modal>
    </Fragment>
  );
}
