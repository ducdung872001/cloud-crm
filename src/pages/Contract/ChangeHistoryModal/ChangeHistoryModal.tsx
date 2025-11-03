import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { useActiveElement } from "utils/hookCustom";
import { handDownloadFileOrigin, showToast } from "utils/common";
import "./ChangeHistoryModal.scss";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import ContractService from "services/ContractService";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import AddFile from "../CreateContracts/partials/AddFile";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";

export default function ChangeHistoryModal(props: any) {
  const { onShow, onHide, dataLog, fieldData, dataPaymentBill, contractExtraInfos } = props;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logList, setLogList] = useState([]);

  useEffect(() => {
    if (onShow && dataLog?.length > 0) {
      const newData = dataLog.filter((el) => el.fileName === fieldData?.name) || [];
      // const newLog = [];
      // if(newData.length > 0){
      //     newData.map(item => {
      //         newLog.unshift(item);
      //     })
      // }
      setLogList(newData);
    }
  }, [dataLog, onShow]);

  const getSelectMutil = (data) => {
    const value = (data && JSON.parse(data)) || [];

    return value && value.length > 0
      ? value.map((item, index) => (
          <div key={index}>
            <span style={{ fontSize: 14, fontWeight: "400" }}>{item.label},</span>
          </div>
        ))
      : "";
  };

  const getAttachment = (data) => {
    const infoFile = {
      fileUrl: data,
      extension: data
        ? data.includes(".docx")
          ? "docx"
          : data.includes(".xlsx")
          ? "xlsx"
          : data.includes(".pdf") || data.includes(".PDF")
          ? "pdf"
          : data.includes(".pptx")
          ? "pptx"
          : data.includes(".zip")
          ? "zip"
          : "rar"
        : null,
    };

    return (
      <div className="box_template">
        {data ? (
          <div className="box__update--attachment">
            <AddFile takeFileAdd={() => {}} infoFile={infoFile} setInfoFile={() => {}} notAddFile={true} />
          </div>
        ) : (
          ""
        )}
      </div>
    );
  };

  const titles = ["STT", "Nội dung mới", "Nội dung cũ", "Thời gian thay đổi", "Người thay đổi"];
  const dataFormat = ["text-center", "", "", "text-center", ""];

  const dataMappingArray = (item: any, index: number) => [
    index + 1,
    item.newValueTitle ||
      (fieldData?.type === "number"
        ? formatCurrency(item.newValue || 0, ",", "")
        : fieldData?.type === "date" && item.newValue
        ? moment(new Date(+item.newValue)).format("DD/MM/YYYY")
        : fieldData?.type === "selectMutil"
        ? getSelectMutil(item.newValue)
        : fieldData?.type === "template"
        ? getAttachment(item.newValue)
        : item.newValue),
    <div style={{ display: "flex" }}>
      <div>
        {item.oldValueTitle ||
          (fieldData?.type === "number"
            ? formatCurrency(item.oldValue || 0, ",", "")
            : fieldData?.type === "date" && item.oldValue
            ? moment(new Date(+item.oldValue)).format("DD/MM/YYYY")
            : fieldData?.type === "selectMutil"
            ? getSelectMutil(item.oldValue)
            : fieldData?.type === "template"
            ? getAttachment(item.oldValue)
            : item.oldValue)}
      </div>
      {item.oldValue && (
        <Tippy content={"Khôi phục nội dung"}>
          <div
            style={{ marginLeft: 7, cursor: "pointer" }}
            onClick={() => {
              showDialogConfirmApprove(item);
            }}
          >
            <Icon name="FingerTouch" style={{ width: "2rem", height: "2rem", fill: "var(--warning-color)" }} />
          </div>
        </Tippy>
      )}
    </div>,
    item.createdAt ? moment(item.createdAt).format("HH:mm DD/MM/YYYY") : "",
    item.employee?.name || "",
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      // {
      //     title: "Sửa",
      //     icon: <Icon name="Pencil" />,
      //     callback: () => {
      //         setDataAppendix(item);
      //         setIsAddAppendix(true);
      //     },
      // },
      // {
      //     title: "Xóa",
      //     icon: <Icon name="Trash" className="icon-error" />,
      //     callback: () => {
      //         showDialogConfirmDelete(item);
      //     },
      // },
    ];
  };

  const showDialogConfirmApprove = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Khôi phục dữ liệu</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn khôi phục dữ liệu đã chọn?</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: async () => {
        handleUpdate(item);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
          //   {
          //     title:  "Xác nhận",
          //     // type: "submit",
          //     color: "primary",
          //     disabled: lstAttributeSelected?.length > 0 ? false : true,
          //     // is_loading: isSubmit,
          //     callback: () => {
          //       handleSubmit(lstAttributeSelected)
          //     },
          //   },
        ],
      },
    }),
    []
  );

  //! xử lý gửi dữ liệu đi
  const handleUpdate = async (item) => {
    const newContractExtraInfos = [...contractExtraInfos];

    if (item.attributionId) {
      const newValueAttribute = {
        attributeId: item.attributionId,
        attributeValue: item.oldValue,
        contractId: item.contractId,
      };
      const indexExtra = newContractExtraInfos.findIndex((el) => el.attributeId === item.attributionId);
      if (indexExtra !== -1) {
        newContractExtraInfos[indexExtra] = newValueAttribute;
      }
    }

    const body: any = {
      ...dataPaymentBill,
      contractExtraInfos: newContractExtraInfos,
      [item.fileName]: item.oldValue,
    };

    const response = await ContractService.update(body);

    if (response.code === 0) {
      showToast(`Cập nhật dữ liệu hợp đồng thành công`, "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
    setContentDialog(null);
  };

  const handleClearForm = (acc) => {
    onHide(acc);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => handleClearForm(false)}
        className="modal-change-history"
        size="xl"
      >
        <div className="container-change-history">
          <ModalHeader title={"Lịch sử thay đổi"} toggle={() => handleClearForm(false)} />
          <ModalBody>
            <div style={{ maxHeight: "42rem", overflow: "auto", padding: "1.6rem" }}>
              {!isLoading && logList && logList.length > 0 ? (
                <BoxTable
                  name="Lịch sử thay đổi"
                  titles={titles}
                  items={logList}
                  isPagination={false}
                  // dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  // listIdChecked={listIdChecked}
                  isBulkAction={true}
                  // bulkActionItems={bulkActionList}
                  striped={true}
                  // setListIdChecked={(listId) => setListIdChecked(listId)}
                  actions={actionsTable}
                  actionType="inline"
                />
              ) : isLoading ? (
                <Loading />
              ) : (
                <SystemNotification description={<span>Hiện tại chưa có lịch sử thay đổi nào.</span>} type="no-item" />
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
