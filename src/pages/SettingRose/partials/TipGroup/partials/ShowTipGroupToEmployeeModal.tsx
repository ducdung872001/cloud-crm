import React, { Fragment, useEffect, useMemo, useState } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import { ShowTipGroupToTipGroupEmployeeModalProps } from "model/tipGroup/PropsModel";
import { ITipGroupToTipGroupEmployeeResponse } from "model/tipGroup/TipGroupResponseModel";
import { ITipGroupToTipGroupEmployeeFilterRequest } from "model/tipGroup/TipGroupRequestModel";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import TipGroupService from "services/TipGroupService";
import { showToast } from "utils/common";

export default function ShowTipGroupToEmployeeModal(props: ShowTipGroupToTipGroupEmployeeModalProps) {
  const { onShow, onHide, showGroupId } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listGroupEmployee, setListGroupEmployee] = useState<ITipGroupToTipGroupEmployeeResponse[]>([]);

  const getListGroupEmployee = async () => {
    setIsLoading(true);

    const params: ITipGroupToTipGroupEmployeeFilterRequest = {
      groupId: showGroupId,
    };

    const response = await TipGroupService.listGroupTipEmloyee(params);

    if (response.code === 0) {
      const result = response.result;
      setListGroupEmployee(result.items);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (showGroupId !== null) {
      getListGroupEmployee();
    }
  }, [showGroupId]);

  const titles = ["STT", "Tên nhân viên", "Điện thoại"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: ITipGroupToTipGroupEmployeeResponse, index: number) => [index + 1, item.name, item.phone];

  const actionsTable = (item: ITipGroupToTipGroupEmployeeResponse): IAction[] => {
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
    const response = await TipGroupService.deleteGroupTipEmloyee(id);

    if (response.code === 0) {
      showToast("Xóa nhân viên trong nhóm thành công", "success");
      getListGroupEmployee();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ITipGroupToTipGroupEmployeeResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "thành viên " : `${listIdChecked.length} trong nhóm đã chọn`}
          {item ? <strong>{item.name}</strong> : ""} trong nhóm ? Thao tác này không thể khôi phục.
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

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa thành viên trong nhóm",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            callback: () => onHide(false),
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => !isSubmit && onHide(false)}>
        <ModalHeader title="Danh sách nhân viên trong nhóm" toggle={() => !isSubmit && onHide(false)} />
        <ModalBody>
          {!isLoading && listGroupEmployee && listGroupEmployee.length > 0 ? (
            <BoxTable
              items={listGroupEmployee}
              titles={titles}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              isBulkAction={true}
              bulkActionItems={bulkActionList}
              striped={true}
              setListIdChecked={(listId) => setListIdChecked(listId)}
              actionType="inline"
              actions={actionsTable}
            />
          ) : isLoading ? (
            <Loading />
          ) : (
            <Fragment>
              <SystemNotification
                description={
                  <span>
                    Hiện tại bạn chưa có nhân viên trong nhóm. <br />
                    Hãy thêm mới nhân viên đầu tiên nhé!
                  </span>
                }
                type="no-item"
              />
            </Fragment>
          )}
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
