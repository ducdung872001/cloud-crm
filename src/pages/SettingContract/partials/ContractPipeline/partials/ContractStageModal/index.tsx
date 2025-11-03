import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IContractStageModalProps } from "model/contractApproach/PropsModel";
import { IAction, IActionModal } from "model/OtherModel";
import { IContractStageResponse } from "model/contractApproach/ContractStageResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import ContractStageService from "services/ContractStageService";
import AddContractStage from "./partials/AddContractStage";
import TableContractStage from "./partials/TableContractStage";
import "./index.scss";

export default function ContractStageModal(props: IContractStageModalProps) {
  const { onShow, onHide, infoPipeline } = props;

  const [listContractStage, setListContractStage] = useState<IContractStageResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataContractStage, setDataContractStage] = useState<IContractStageResponse>(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isActiveForm, setIsActiveForm] = useState<boolean>(false); 
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const getListContractStage = async () => {
    setIsLoading(true);

    const response = await ContractStageService.list(infoPipeline?.idPipeline);

    if (response.code === 0) {
      const result = response.result;
      setListContractStage(result);
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (infoPipeline) {
      getListContractStage();
    }
  }, [infoPipeline]);

  const titles = ["STT", "Tên quy trình", "Thứ tự"];

  const dataFormat = ["text-center", "", "text-right"];

  const dataMappingArray = (item: IContractStageResponse, index: number) => [index + 1, item.name, item.position];

  const actionsTable = (item: IContractStageResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataContractStage(item);
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
    const response = await ContractStageService.delete(id);

    if (response.code === 0) {
      showToast("Xóa pha thành công", "success");
      getListContractStage();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmDelete = (item?: IContractStageResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa pha này
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
                  setDataContractStage(null);
                },
              },
              {
                title: "Quay lại",
                color: "primary",
                variant: "outline",
                callback: () => {
                  setIsActiveForm(false);
                  setDataContractStage(null);
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
                  setDataContractStage(null);
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
        <ModalHeader title={`Quy trình của pha hợp đồng ${infoPipeline?.name}`} toggle={() => onHide(false)} />
        <ModalBody>
          <CustomScrollbar width="100%" height="52rem">
            <div className="wrapper__stage">
              {isActiveForm && (
                <div className="form__submit--stage">
                  <AddContractStage
                    data={dataContractStage}
                    infoPipeline={infoPipeline}
                    onReload={(reload) => {
                      if (reload) {
                        getListContractStage();
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
                      <Button type="button" onClick={() => setIsActiveForm(true)}>
                        Thêm mới
                      </Button>
                    </div>
                  )}
                  <TableContractStage
                    isLoading={isLoading}
                    listContractStage={listContractStage}
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
