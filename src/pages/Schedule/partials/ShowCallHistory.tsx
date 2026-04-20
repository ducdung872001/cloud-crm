import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { ICrmCareHistoryFilterRequest } from "model/crmCareHistory/CrmCareHistoryRequestModel";
import { ICrmCareHistoryResponse } from "model/crmCareHistory/CrmCareHistoryResponseModel";
import CrmCareHistoryService from "services/CrmCareHistoryService";
import { ShowCallHistoryProps } from "model/treatment/PropsModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { trimContent } from 'reborn-util';
import "./ShowCallHistory.scss";

export default function ShowCallHistory(props: ShowCallHistoryProps) {
  const { onShow, onHide, data, customerId, employeeId, idScheduleNext } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  //   const [dataCallHistory, setDataCallHistory] = useState<ICrmCareHistoryResponse>(data);
  const [listCrmCareHistory, setListCrmCareHistory] = useState<ICrmCareHistoryResponse[]>([]);

  const getListCrmCareHistory = async () => {
    setIsLoading(true);

    const params: ICrmCareHistoryFilterRequest = {
      customerId: customerId,
      employeeId: employeeId,
    };

    const response = await CrmCareHistoryService.list(params);

    if (response.code === 0) {
      const result = response.result;
      setListCrmCareHistory(result.items);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (customerId !== null || employeeId !== null) {
      getListCrmCareHistory();
    }
  }, [customerId, employeeId, idScheduleNext]);

  const titles = ["STT", "Nội dung", "Nhân viên gọi", "Chiến dịch", "Trạng thái"];

  const dataFormat = ["text-center", "", "", "", ""];

  const dataMappingArray = (item: ICrmCareHistoryResponse, index: number) => [
    index + 1,
    trimContent(item.content, 20, true, true),
    item.employeeName,
    item.campaignName,
    item.status == 1 ? "Thành công" : "Thất bại",
  ];

  const actionsTable = (item: ICrmCareHistoryResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          // data(item)
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
    const response = await CrmCareHistoryService.delete(id);

    if (response.code === 0) {
      showToast("Xóa lịch sử gọi điện thành công", "success");
      getListCrmCareHistory();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICrmCareHistoryResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "nhân viên " : `${listIdChecked.length} trong lịch sử gọi đã chọn`}
          {item ? <strong>{item.employeeName}</strong> : ""} trong lịch sử gọi ? Thao tác này không thể khôi phục.
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
      title: "Xóa lịch sử gọi điện",
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
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-show-call__history"
      >
        <ModalHeader title="Lịch sử gọi điện" toggle={() => !isSubmit && onHide(false)} />
        <ModalBody>
          {!isLoading && listCrmCareHistory && listCrmCareHistory.length > 0 ? (
            <BoxTable
              items={listCrmCareHistory}
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
              <SystemNotification description={<span>Hiện tại bạn chưa có lịch sử gọi điện nào.</span>} type="no-item" />
            </Fragment>
          )}
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
