import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IPomModalProps } from "model/pom/PropsModel";
import { IAction, IActionModal } from "model/OtherModel";
import { IPomResponse } from "model/pom/PomResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import PomService from "services/PomService";
import AddPom from "./partials/AddPom";
import TablePom from "./partials/TablePom";
import "./index.scss";

export default function PomModal(props: IPomModalProps) {
  const { onShow, onHide, infoService } = props;

  const [listPom, setListPom] = useState<IPomResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataPom, setDataPom] = useState<IPomResponse>(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isActiveForm, setIsActiveForm] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const getListPom = async () => {
    setIsLoading(true);

    const response = await PomService.list(infoService?.idService);

    if (response.code === 0) {
      const result = response.result;
      setListPom(result);
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (infoService) {
      getListPom();
    }
  }, [infoService]);

  const titles = ["STT", "Sản phẩm", "Đơn vị", "Số lượng"];

  const dataFormat = ["text-center", "", "", "text-right"];

  const dataMappingArray = (item: IPomResponse, index: number) => [index + 1, item.productName, item.unitName, item.quantity];

  const actionsTable = (item: IPomResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataPom(item);
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
    const response = await PomService.delete(id);

    if (response.code === 0) {
      showToast("Xóa vât tư tiêu hao thành công", "success");
      getListPom();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmDelete = (item?: IPomResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa pom
          {item ? <strong> {item.productName}</strong> : ""}? Thao tác này không thể khôi phục.
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
                  setDataPom(null);
                },
              },
              {
                title: "Quay lại",
                color: "primary",
                variant: "outline",
                callback: () => {
                  setIsActiveForm(false);
                  setDataPom(null);
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
                  setDataPom(null);
                },
              },
            ],
      },
    }),
    [isActiveForm]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-pom">
        <ModalHeader title={`Vật tư tiêu hao cho dịch vụ ${infoService?.nameService}`} toggle={() => onHide(false)} />
        <ModalBody>
          <CustomScrollbar width="100%" height="52rem">
            <div className="wrapper__pom">
              {isActiveForm && (
                <div className="form__submit--pom">
                  <AddPom
                    data={dataPom}
                    infoService={infoService}
                    onReload={(reload) => {
                      if (reload) {
                        getListPom();
                      }
                      setIsActiveForm(false);
                    }}
                  />
                </div>
              )}
              {!isActiveForm && (
                <div className="list__pom">
                  {!isPermissions && (
                    <div className="action__add--pom">
                      <Button type="button" onClick={() => setIsActiveForm(true)}>
                        Thêm mới
                      </Button>
                    </div>
                  )}
                  <TablePom
                    isLoading={isLoading}
                    listPom={listPom}
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
