import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IContactStatusModalProps } from "model/contactStatus/PropsModel";
import { IAction, IActionModal } from "model/OtherModel";
import { IContactStatusResponse } from "model/contactStatus/ContactStatusResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import ContactStatusService from "services/ContactStatusService";
import AddContactStatus from "./partials/AddContactStatus";
import TableContactStatus from "./partials/TableContactStatus";
import "./index.scss";

export default function ContactStatusModal(props: IContactStatusModalProps) {
  const { onShow, onHide, infoPipeline } = props;

  const [listContactStatus, setListContactStatus] = useState<IContactStatusResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataContactStatus, setDataContactStatus] = useState<IContactStatusResponse>(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isActiveForm, setIsActiveForm] = useState<boolean>(false); 
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const getListContactStatus = async () => {
    setIsLoading(true);

    const response = await ContactStatusService.list(infoPipeline?.idPipeline);

    if (response.code === 0) {
      const result = response.result;
      setListContactStatus(result);
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (infoPipeline) {
      getListContactStatus();
    }
  }, [infoPipeline]);

  const titles = ["STT", "Tên trạng thái", "Thứ tự"];

  const dataFormat = ["text-center", "", "text-right"];

  const dataMappingArray = (item: IContactStatusResponse, index: number) => [index + 1, item.name, item.position];

  const actionsTable = (item: IContactStatusResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataContactStatus(item);
          setIsActiveForm(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await ContactStatusService.delete(id);

    if (response.code === 0) {
      showToast("Xóa trạng thái thành công", "success");
      getListContactStatus();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmDelete = (item?: IContactStatusResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa trạng thái này
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: isActiveForm
          ? [
              {
                title: "Đóng",
                color: "primary",
                variant: "outline",
                callback: () => {
                  onHide(false);
                  setIsActiveForm(false);
                  setDataContactStatus(null);
                },
              },
              {
                title: "Quay lại",
                color: "primary",
                variant: "outline",
                callback: () => {
                  setIsActiveForm(false);
                  setDataContactStatus(null);
                },
              },
            ]
          : [
              {
                title: "Đóng",
                color: "primary",
                variant: "outline",
                callback: () => {
                  onHide(false);
                  setIsActiveForm(false);
                  setDataContactStatus(null);
                },
              },
            ],
      },
    }),
    [isActiveForm]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-stage">
        <ModalHeader title={`Trạng thái ${infoPipeline?.name}`} toggle={() => onHide(false)} />
        <ModalBody>
          <CustomScrollbar width="100%" height="52rem">
            <div className="wrapper__stage">
              {isActiveForm && (
                <div className="form__submit--stage">
                  <AddContactStatus
                    data={dataContactStatus}
                    infoPipeline={infoPipeline}
                    onReload={(reload) => {
                      if (reload) {
                        getListContactStatus();
                      }
                      setIsActiveForm(false);
                    }}
                  />
                </div>
              )}
              {!isActiveForm && (
                <div className="list__stage">
                  {!isPermissions && (
                    <div className="action__add--stage">
                      <Button type="button" onClick={() => {
                        setDataContactStatus(null);
                        setIsActiveForm(true);
                      }}>
                        Thêm mới
                      </Button>
                    </div>
                  )}
                  <TableContactStatus
                    isLoading={isLoading}
                    listContactStatus={listContactStatus}
                    titles={titles}
                    dataFormat={dataFormat}
                    dataMappingArray={dataMappingArray}
                    actionsTable={actionsTable}
                    setIsActiveForm={setIsActiveForm}
                    isPermissions={isPermissions}
                  />
                </div>
              )}
            </div>
          </CustomScrollbar>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
