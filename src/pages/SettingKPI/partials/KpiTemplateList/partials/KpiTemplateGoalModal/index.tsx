import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IKpiTemplateGoalModalProps } from "model/kpiTemplateGoal/PropsModel";
import { IAction, IActionModal } from "model/OtherModel";
import { IKpiTemplateGoalResponse } from "model/kpiTemplateGoal/KpiTemplateGoalResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import KpiTemplateGoalService from "services/KpiTemplateGoalService";
import AddKpiTemplateGoal from "./partials/AddKpiTemplateGoal";
import TableKpiTemplateGoal from "./partials/TableKpiTemplateGoal";
import "./index.scss"; 

export default function KpiTemplateGoalModal(props: IKpiTemplateGoalModalProps) {
  const { onShow, onHide, infoKpiTemplate } = props;

  const [listKpiTemplateGoal, setListKpiTemplateGoal] = useState<IKpiTemplateGoalResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataKpiTemplateGoal, setDataKpiTemplateGoal] = useState<IKpiTemplateGoalResponse>(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isActiveForm, setIsActiveForm] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const getListKpiTemplateGoal = async () => {
    setIsLoading(true);

    console.log('infoKpiTemplate ->', infoKpiTemplate);

    const response = await KpiTemplateGoalService.list({ templateId: infoKpiTemplate?.idTemplate });

    if (response.code === 0) {
      const result = response.result;
      setListKpiTemplateGoal(result);
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (infoKpiTemplate) {
      getListKpiTemplateGoal();
    }
  }, [infoKpiTemplate]);

  const titles = ["STT", "Tên chỉ tiêu", "KPI mục tiêu", "Trọng số KPI"];

  const dataFormat = ["text-center", "", "text-right", "text-right"];

  const dataMappingArray = (item: IKpiTemplateGoalResponse, index: number) => [
    index + 1,
    item.goalName,
    item.threshold,
    item.weight
  ];

  const actionsTable = (item: IKpiTemplateGoalResponse): IAction[] => {
    
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataKpiTemplateGoal(item);          
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
    const response = await KpiTemplateGoalService.delete(id);

    if (response.code === 0) {
      showToast("Xóa chỉ tiêu KPI thành công", "success");
      getListKpiTemplateGoal();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmDelete = (item?: IKpiTemplateGoalResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa chỉ tiêu này? Thao tác này không thể khôi phục.
        </Fragment>
      ),
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
                setDataKpiTemplateGoal(null);
              },
            },
            {
              title: "Quay lại",
              color: "primary",
              variant: "outline",
              callback: () => {
                setIsActiveForm(false);
                setDataKpiTemplateGoal(null);
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
                setDataKpiTemplateGoal(null);
              },
            },
          ],
      },
    }),
    [isActiveForm]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-kpi-template-goal">
        <ModalHeader title={`Các chỉ tiêu trong "${infoKpiTemplate?.nameTemplate}"`} toggle={() => onHide(false)} />
        <ModalBody>
          <CustomScrollbar width="100%" height="40rem">
            <div className="wrapper__kpi-template-goal">
              {isActiveForm && (
                <div className="form__submit--kpi-template-goal">
                  <AddKpiTemplateGoal
                    data={dataKpiTemplateGoal}
                    infoKpiTemplate={infoKpiTemplate}
                    onReload={(reload) => {
                      if (reload) {
                        getListKpiTemplateGoal();
                      }
                      setIsActiveForm(false);
                    }}
                  />
                </div>
              )}
              {!isActiveForm && (
                <div className="list__kpi-template-goal">
                  {!isPermissions && (
                    <div className="action__add--kpi-template-goal">
                      <Button type="button" onClick={() => {
                        setDataKpiTemplateGoal(null);
                        setIsActiveForm(true);
                      }}>
                        Thêm mới
                      </Button>
                    </div>
                  )}
                  <TableKpiTemplateGoal
                    isLoading={isLoading}
                    listKpiTemplateGoal={listKpiTemplateGoal}
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
