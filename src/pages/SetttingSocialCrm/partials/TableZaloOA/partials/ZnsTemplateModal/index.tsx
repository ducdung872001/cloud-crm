import React, { Fragment, useState, useEffect, useMemo } from "react";
import { AddZnsTemplateModalProps } from "model/znsTemplate/PropsModel";
import { IAction, IActionModal } from "model/OtherModel";
import { IZnsTemplateResponse } from "model/znsTemplate/ZnsTemplateResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import ZnsTemplateService from "services/ZnsTemplateService";
import AddZnsTemplate from "./partials/AddZnsTemplate";
import TableZnsTemplate from "./partials/TableZnsTemplate";
import "./index.scss";
import moment from "moment";

export default function ZnsTemplateModal(props: AddZnsTemplateModalProps) {
  const { onShow, onHide, zaloOa } = props;

  const [listZnsTemplate, setListZnsTemplate] = useState<IZnsTemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataZnsTemplate, setDataZnsTemplate] = useState<IZnsTemplateResponse>(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isActiveForm, setIsActiveForm] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const getListZnsTemplate = async () => {
    setIsLoading(true);

    const response = await ZnsTemplateService.list(zaloOa?.oaId);

    if (response.code === 0) {
      const result = response.result;
      setListZnsTemplate(result);
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  /**
   * Lấy chi tiết một mẫu Zalo ZNS
   */
  const loadZnsTemplateDetail = async () => {
    setIsLoading(true);

    const response = await ZnsTemplateService.templateDetail(zaloOa?.oaId);

    if (response.code === 0) {
      const result = response.result;
      // setListZnsTemplate({ oaId: zaloOa?.oaId } as any);
      getListZnsTemplate()
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (zaloOa) {
      getListZnsTemplate();
    }
  }, [zaloOa]);

  const titles = ["STT", "Tên mẫu", "Trạng thái", "Thời gian tạo"];
  const dataFormat = ["text-center", "", "", "text-center"];

  const getStatusName = (status) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "Chờ duyệt";
      case "ENABLE":
        return "Đã duyệt";
      case "REJECT":
        return "Từ chối";
      case "DISABLE":
        return "Tạm dừng";
      default:
        return "Chưa xác định";
    }
  }

  const dataMappingArray = (item: IZnsTemplateResponse, index: number) => [index + 1, item.templateName, getStatusName(item.status),
  moment(item.createdTime).format('DD/MM/YYYY HH:mm')
  ];

  const actionsTable = (item: IZnsTemplateResponse): IAction[] => {
    return [
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
    const response = await ZnsTemplateService.delete(id);

    if (response.code === 0) {
      showToast("Xóa mẫu ZNS thành công", "success");
      getListZnsTemplate();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmDelete = (item?: IZnsTemplateResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa mẫu ZNS này
          {item ? <strong> {item.templateName}</strong> : ""}? Thao tác này không thể khôi phục.
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
                setDataZnsTemplate(null);
              },
            },
            {
              title: "Quay lại",
              color: "primary",
              variant: "outline",
              callback: () => {
                setIsActiveForm(false);
                setDataZnsTemplate(null);
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
                setDataZnsTemplate(null);
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
        <ModalHeader title={`Mẫu Zalo ZNS "${zaloOa?.name}"`} toggle={() => onHide(false)} />
        <ModalBody>
          <CustomScrollbar width="100%" height="52rem">
            <div className="wrapper__stage">
              {isActiveForm && (
                <div className="form__submit--stage">
                  <AddZnsTemplate
                    data={dataZnsTemplate}
                    zaloOa={zaloOa}
                    onReload={(reload) => {
                      if (reload) {
                        getListZnsTemplate();
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
                      <div style={{marginRight: 10}}>
                        <Button type="button" onClick={() => setIsActiveForm(true)}>
                          Thêm mới
                        </Button>
                      </div>
                      <div>
                        <Button type="button" onClick={() => loadZnsTemplateDetail()}>
                          Làm mới
                        </Button>
                      </div>
                    </div>
                  )}
                  <TableZnsTemplate
                    isLoading={isLoading}
                    listZnsTemplate={listZnsTemplate}
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
