import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IKpiSetupModalProps } from "model/kpiSetup/PropsModel";
import { IAction, IActionModal } from "model/OtherModel";
import { IKpiSetupResponse } from "model/kpiSetup/KpiSetupResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import KpiSetupService from "services/KpiSetupService";
import AddKpiSetup from "./partials/AddKpiSetup";
import TableKpiSetup from "./partials/TableKpiSetup";
import "./index.scss"; 
import { formatCurrency } from "reborn-util";

export default function KpiSetupModal(props: IKpiSetupModalProps) {
  const { onShow, onHide, infoKpi } = props;

  const [listKpiSetup, setListKpiSetup] = useState<IKpiSetupResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataKpiSetup, setDataKpiSetup] = useState<IKpiSetupResponse>(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isActiveForm, setIsActiveForm] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const getListKpiSetup = async () => {
    setIsLoading(true);

    console.log('infoKpi ->', infoKpi);

    const response = await KpiSetupService.list({ kpiId: infoKpi?.idKpi });

    if (response.code === 0) {
      const result = response.result;
      setListKpiSetup(result);
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (infoKpi) {
      getListKpiSetup();
    }
  }, [infoKpi]);

  const titles = ["STT", "Tên chỉ tiêu", "KPI mục tiêu", "Trọng số KPI"];

  const dataFormat = ["text-center", "", "text-right", "text-right"];

  const dataMappingArray = (item: IKpiSetupResponse, index: number) => [
    index + 1,
    item.goalName,
    formatCurrency(item.threshold, ',', ''),
    item.weight
  ];

  const actionsTable = (item: IKpiSetupResponse): IAction[] => {
    
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataKpiSetup(item);          
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
    const response = await KpiSetupService.delete(id);

    if (response.code === 0) {
      showToast("Xóa chỉ tiêu KPI thành công", "success");
      getListKpiSetup();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmDelete = (item?: IKpiSetupResponse) => {
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
                setDataKpiSetup(null);
              },
            },
            {
              title: "Quay lại",
              color: "primary",
              variant: "outline",
              callback: () => {
                setIsActiveForm(false);
                setDataKpiSetup(null);
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
                setDataKpiSetup(null);
              },
            },
          ],
      },
    }),
    [isActiveForm]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-kpi-setup">
        <ModalHeader title={`Các chỉ tiêu trong "${infoKpi?.nameKpi}"`} toggle={() => onHide(false)} />
        <ModalBody>
          <CustomScrollbar width="100%" height="40rem">
            <div className="wrapper__kpi-setup">
              {isActiveForm && (
                <div className="form__submit--kpi-setup">
                  <AddKpiSetup
                    data={dataKpiSetup}
                    infoKpi={infoKpi}
                    onReload={(reload) => {
                      if (reload) {
                        getListKpiSetup();
                      }
                      setIsActiveForm(false);
                    }}
                  />
                </div>
              )}
              {!isActiveForm && (
                <div className="list__kpi-setup">
                  {!isPermissions && (
                    <div className="action__add--kpi-setup">
                      <Button type="button" onClick={() => {
                        setDataKpiSetup(null);
                        setIsActiveForm(true);
                      }}>
                        Thêm mới
                      </Button>
                    </div>
                  )}
                  <TableKpiSetup
                    isLoading={isLoading}
                    listKpiSetup={listKpiSetup}
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
