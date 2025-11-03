import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IStepModalProps } from "model/ticketStep/PropsModel";
import { IAction, IActionModal } from "model/OtherModel";
import { ITicketStepResponse } from "model/ticketStep/TicketStepResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import TicketStepService from "services/TicketStepService";
import AddStep from "./partials/AddStep";
import TableStep from "./partials/TableStep";
import "./index.scss"; 

export default function StepModal(props: IStepModalProps) {
  const { onShow, onHide, infoProc } = props;

  const [listStep, setListStep] = useState<ITicketStepResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataStep, setDataStep] = useState<ITicketStepResponse>(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isActiveForm, setIsActiveForm] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const getListStep = async () => {
    setIsLoading(true);

    console.log('infoProc ->', infoProc);

    const response = await TicketStepService.list({ procId: infoProc?.idProc });

    if (response.code === 0) {
      const result = response.result;
      setListStep(result);
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (infoProc) {
      getListStep();
    }
  }, [infoProc]);

  const titles = ["STT", "Phòng ban chuyển", "Phòng ban nhận", "Thời gian xử lý"];

  const dataFormat = ["text-center", "", "", "text-center"];

  const getTimeFromCharacter = (character) => {
    switch (character) {
      case "D":
        return "Ngày";
      case "H":
        return "Giờ";
      case "M":
        return "Phút";
    }
  }

  const dataMappingArray = (item: ITicketStepResponse, index: number) => [
    index + 1,
    item.prevDepartmentName,
    item.departmentName,
    (item.period || "") + " " + (item.unit ? getTimeFromCharacter(item.unit) : "")
  ];

  const actionsTable = (item: ITicketStepResponse): IAction[] => {
    
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataStep(item);          
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
    const response = await TicketStepService.delete(id);

    if (response.code === 0) {
      showToast("Xóa bước thực hiện thành công", "success");
      getListStep();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmDelete = (item?: ITicketStepResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa bước này? Thao tác này không thể khôi phục.
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
                setDataStep(null);
              },
            },
            {
              title: "Quay lại",
              color: "primary",
              variant: "outline",
              callback: () => {
                setIsActiveForm(false);
                setDataStep(null);
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
                setDataStep(null);
              },
            },
          ],
      },
    }),
    [isActiveForm]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-step">
        <ModalHeader title={`Các bước xử lý cho quy trình "${infoProc?.nameProc}"`} toggle={() => onHide(false)} />
        <ModalBody>
          <CustomScrollbar width="100%" height="52rem">
            <div className="wrapper__step">
              {isActiveForm && (
                <div className="form__submit--step">
                  <AddStep
                    data={dataStep}
                    infoProc={infoProc}
                    onReload={(reload) => {
                      if (reload) {
                        getListStep();
                      }
                      setIsActiveForm(false);
                    }}
                  />
                </div>
              )}
              {!isActiveForm && (
                <div className="list__step">
                  {!isPermissions && (
                    <div className="action__add--step">
                      <Button type="button" onClick={() => setIsActiveForm(true)}>
                        Thêm mới
                      </Button>
                    </div>
                  )}
                  <TableStep
                    isLoading={isLoading}
                    listStep={listStep}
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
