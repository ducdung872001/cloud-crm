import React, { Fragment, useEffect, useMemo, useState } from "react";
import { IActionModal } from "model/OtherModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import { showToast } from "utils/common";
import CustomerService from "services/CustomerService";
import "./UploadMediaModal.scss";

interface ILstDataProps {
  type: string;
  url: string;
}

interface IUploadMediaModalProps {
  infoMedia: { type: string; url: string };
  checkType?: string;
  onShow: boolean;
  onHide: (reload: boolean) => void;
  idCustomer: number;
}

export default function UploadMediaModal(props: IUploadMediaModalProps) {
  const { infoMedia, checkType, onShow, onHide, idCustomer } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [lstData, setLstData] = useState<ILstDataProps[]>([]);

  useEffect(() => {
    if (infoMedia.url) {
      setLstData([...lstData, infoMedia]);
    } else {
      setLstData([]);
    }
  }, [infoMedia]);

  const nameCommon = checkType == "video" ? "video" : "hình ảnh";

  const handSubmitForm = async (e) => {
    e && e.preventDefault();

    setIsSubmit(true);

    const body: any = {
      customerId: idCustomer,
      type: 0,
      medias: lstData.map((item) => {
        return {
          type: item.type,
          url: item.url,
        };
      }),
    };

    const response = await CustomerService.customerExchangeUpdate(body);

    if (response.code === 0) {
      onHide(true);
      setLstData([]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  // xóa đi 1 ảnh hoặc video
  const handRemoveMedia = (idx) => {
    const newData = [...lstData];
    newData.splice(idx, 1);

    setLstData(newData);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác gửi ${nameCommon}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setLstData([]);
        setShowDialog(false);
        setContentDialog(null);
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
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              showDialogConfirmCancel();
            },
          },
          {
            title: "Gửi",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, nameCommon, lstData]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="wrapper__upload--media"
      >
        <form className="form__upload--media" onSubmit={(e) => handSubmitForm(e)}>
          <ModalHeader title={`Gửi ${lstData.length} ${nameCommon}`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className={`lst-media`}>
                {lstData &&
                  lstData.length > 0 &&
                  lstData.map((item, idx) => {
                    return (
                      <div key={idx} className="item">
                        <div className="action__change--item">
                          <span
                            className="icon-edit"
                            onClick={() => {
                              // onAddUpload(true);
                            }}
                          >
                            <Icon name="Pencil" />
                          </span>
                          <span className="icon-delete" onClick={() => handRemoveMedia(idx)}>
                            <Icon name="Trash" />
                          </span>
                        </div>
                        {/* {item.progress ? (
                          <span className="show-progress">{`${item.progress}%`}</span>
                        ) : item.type == "image" ? (
                          <img src={item.url} alt="Ảnh Upload" />
                        ) : (
                          <video controls>
                            <source src={item.url} />
                          </video>
                        )} */}
                        {item.type == "image" ? (
                          <img src={item.url} alt="Ảnh Upload" />
                        ) : (
                          <video controls>
                            <source src={item.url} />
                          </video>
                        )}
                      </div>
                    );
                  })}
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
