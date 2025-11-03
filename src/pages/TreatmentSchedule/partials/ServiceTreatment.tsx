import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import { ShowServiceTreatmentProps } from "model/treatment/PropsModel";
import { ITreamentResponse } from "model/treatment/TreamentResponseModel";
import { ITreamentFilterByScheduler } from "model/treatment/TreamentRequestModel";
import TreamentService from "services/TreamentService";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Icon from "components/icon";
import Input from "components/input/input";
import { showToast } from "utils/common";
import "./ServiceTreatment.scss";
import UpdateTreatmentHistory from "./UpdateTreatmentHistory";

export default function ServiceTreatment(props: ShowServiceTreatmentProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listByScheduler, setListByScheduler] = useState<ITreamentResponse[]>([]);
  const [dataServiceTreatment, setDataServiceTreatment] = useState<ITreamentResponse>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const getListByScheduler = async () => {
    setIsLoading(true);

    const params: ITreamentFilterByScheduler = {
      csrId: data?.id,
    };

    const response = await TreamentService.filterByScheduler(params);

    if (response.code === 0) {
      const result = response.result;
      setListByScheduler(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (data !== null) {
      getListByScheduler();
    }
  }, [data]);

  const titles = ["STT", "Tên dịch vụ", "Nhân viên thực hiện", "Nội dung làm (thực tế)"];

  const dataFormat = ["text-center", "", "", ""];

  const dataMappingArray = (item: ITreamentResponse, index: number) => [index + 1, item.serviceName, item.employeeName, item.procDesc];

  const actionsTable = (item: ITreamentResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataServiceTreatment(item);
          setShowModalAdd(true);
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
    const response = await TreamentService.delete(id);

    if (response.code === 0) {
      showToast("Xóa dịch vụ đã điều trị thành công", "success");
      getListByScheduler();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ITreamentResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "dịch vụ đã điều trị " : `${listIdChecked.length} dịch vụ điều trị đã chọn`}
          {item ? <strong>{item.serviceName}</strong> : ""} ? Thao tác này không thể khôi phục.
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
      title: "Xóa dịch vụ đã điều trị",
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
        className="modal-service-treatment"
        toggle={() => !isSubmit && onHide(false)}
      >
        <ModalHeader title="Dịch vụ đã điều trị" toggle={() => !isSubmit && onHide(false)} />
        <ModalBody>
          <div className="list-form-group">
            <div className="list-data-customer">
              <Input label="Họ tên" value={data?.customerName} disabled={true} fill={true} />
              <Input label="Số điện thoại" value={data?.customerPhone} disabled={true} fill={true} />
            </div>
            {!isLoading && listByScheduler && listByScheduler.length > 0 ? (
              <BoxTable
                items={listByScheduler}
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
                <SystemNotification description={<span>Hiện tại bạn chưa có dịch vụ đã điều trị nào.</span>} type="no-item" />
              </Fragment>
            )}
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
      <UpdateTreatmentHistory
        onShow={showModalAdd}
        data={dataServiceTreatment}
        onHide={(reload) => {
          if (reload) {
            getListByScheduler();
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
