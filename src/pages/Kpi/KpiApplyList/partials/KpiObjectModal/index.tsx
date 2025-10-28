import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IKpiObjectModalProps } from "model/kpiObject/PropsModel";
import { IAction, IActionModal } from "model/OtherModel";
import { IKpiObjectResponse } from "model/kpiObject/KpiObjectResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import KpiObjectService from "services/KpiObjectService";
import AddKpiApply from "./partials/AddKpiObject";
import TableKpiApply from "./partials/TableKpiObject";
import "./index.scss";

export default function KpiObjectModal(props: IKpiObjectModalProps) {
  const { onShow, onHide, infoKpi } = props;

  const [listKpiObject, setListKpiObject] = useState<IKpiObjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataKpiObject, setDataKpiObject] = useState<IKpiObjectResponse>(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isActiveForm, setIsActiveForm] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const getListKpiObject = async () => {
    setIsLoading(true);

    // console.log('infoKpi ->', infoKpi);

    const response = await KpiObjectService.list({ kpiId: infoKpi?.idKpi });

    if (response.code === 0) {
      const result = response.result;
      setListKpiObject(result);
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (infoKpi) {
      getListKpiObject();
    }
  }, [infoKpi]);

  const titles = ["STT", "Tên chỉ tiêu", "KPI mục tiêu", "Trọng số KPI"];

  const dataFormat = ["text-center", "", "text-right", "text-right"];

  const dataMappingArray = (item: IKpiObjectResponse, index: number) => [index + 1, item.goalName, item.threshold, item.weight];

  const actionsTable = (item: IKpiObjectResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataKpiObject(item);
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
    const response = await KpiObjectService.delete(id);

    if (response.code === 0) {
      showToast("Xóa chỉ tiêu KPI thành công", "success");
      getListKpiObject();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmDelete = (item?: IKpiObjectResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn xóa chỉ tiêu này? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        setShowDialog(false);
        onDelete(item.id);
      },
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
                  setDataKpiObject(null);
                },
              },
              {
                title: "Quay lại",
                color: "primary",
                variant: "outline",
                callback: () => {
                  setIsActiveForm(false);
                  setDataKpiObject(null);
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
                  setDataKpiObject(null);
                },
              },
            ],
      },
    }),
    [isActiveForm]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-kpi-object">
        <ModalHeader title={`Đối tượng áp dụng phiếu giao KPI "${infoKpi?.nameKpi}"`} toggle={() => onHide(false)} />
        <ModalBody>
          <div className="wrapper__kpi-object">
            {isActiveForm && (
              <div className="form__submit--kpi-object">
                <AddKpiApply
                  data={dataKpiObject}
                  infoKpi={infoKpi}
                  onReload={(reload) => {
                    if (reload) {
                      getListKpiObject();
                    }
                    setIsActiveForm(false);
                  }}
                />
              </div>
            )}
            {!isActiveForm && (
              <div className="list__kpi-object">
                {!isPermissions && (
                  <div className="action__add--kpi-object">
                    <Button
                      type="button"
                      onClick={() => {
                        setDataKpiObject(null);
                        setIsActiveForm(true);
                      }}
                    >
                      Thêm mới
                    </Button>
                  </div>
                )}
                <TableKpiApply
                  isLoading={isLoading}
                  listKpiObject={listKpiObject}
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
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
