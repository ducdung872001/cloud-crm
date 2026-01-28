import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";

import "./index.scss";
import Loading from "components/loading";
import { IAction, IActionModal } from "model/OtherModel";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import DecisionTableOutputService from "services/DecisionTableOutputService";
import { showToast } from "utils/common";
import Button from "components/button/button";
import Icon from "components/icon";
import { set } from "lodash";
import ModalAddOutputColumn from "../ModalAddOutputColumn";

export default function ListColumnOutput(props: any) {
  const { onShow, onHide, businessRuleId } = props;

  const [showModalAddOutputColumn, setShowModalAddOutputColumn] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState<any>(null); // Data for modal add/edit input column

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn xóa điều kiện {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        onDelete(item.id);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const onDelete = async (id: number) => {
    const response = await DecisionTableOutputService.delete(id);

    if (response.code === 0) {
      showToast("Xóa điều kiện thành công", "success");
      getListDecisionOutput(businessRuleId, true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: false,
            callback: () => {
              onHide(true);
            },
          },
        ],
      },
    }),
    []
  );

  useEffect(() => {
    if (businessRuleId && onShow) {
      getListDecisionOutput(businessRuleId, true);
      setIsLoading(true);
    }
  }, [businessRuleId, onShow]);

  const [listDecisionOutput, setListDecisionOutput] = useState([]);
  const getListDecisionOutput = async (id: number, disableLoading?: boolean) => {
    const response = await DecisionTableOutputService.list({ businessRuleId: businessRuleId, limit: 100 });

    if (response.code === 0) {
      const result = response.result;

      setListDecisionOutput(result?.items);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const titles = ["STT", "Tên cột", "Mã cột", "Kiểu dữ liệu", ""];

  const dataFormat = ["text-center", "", "", "", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [index + 1, item.name, item.code, item.dataType, ""];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        disabled: false,
        icon: <Icon name="PencilSimpleLine" className={"icon-edit-active"} />,
        callback: () => {
          setData(item);
          setShowModalAddOutputColumn(true);
        },
      },
      {
        title: "Xóa",
        disabled: false,
        icon: <Icon name="TrashRox" className={"icon-delete-active"} />,
        callback: () => {
          setShowDialog(true);
          showDialogConfirmDelete(item);
        },
      },
    ].filter((action) => action);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => onHide(false)}
        className="modal-list-output-column"
        size="xl"
      >
        <form className="form-add-reason-group">
          <ModalHeader
            title={`Danh sách cột kết quả`}
            toggle={() => {
              !isSubmit && onHide(false);
            }}
          />
          <ModalBody>
            {!isLoading && listDecisionOutput && listDecisionOutput.length > 0 ? (
              <>
                <div className="button-add-column">
                  <div>Có tổng {listDecisionOutput.length} cột kết quả</div>
                  <Button type="button" color="primary" size="large" onlyIcon={false} onClick={() => setShowModalAddOutputColumn(true)}>
                    Thêm mới cột kết quả
                  </Button>
                </div>
                <BoxTable
                  name="Cột điều kiện"
                  titles={titles}
                  items={listDecisionOutput}
                  isPagination={true}
                  // dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  isBulkAction={true}
                  // bulkActionItems={bulkActionList}
                  // listIdChecked={listIdChecked}
                  striped={true}
                  // setListIdChecked={(listId) => setListIdChecked(listId)}
                  actions={actionsTable}
                  actionType="inline"
                />
              </>
            ) : isLoading ? (
              <Loading />
            ) : (
              <Fragment>
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có cột nào. <br />
                      Hãy thêm mới cột đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới cột kết quả"
                  action={() => {
                    setShowModalAddOutputColumn(true);
                  }}
                />
              </Fragment>
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalAddOutputColumn
        onShow={showModalAddOutputColumn}
        data={data}
        businessRuleId={businessRuleId}
        onHide={(reload) => {
          if (reload) {
            getListDecisionOutput(businessRuleId, true);
          }
          setData(null);
          setShowModalAddOutputColumn(false);
        }}
      />
    </Fragment>
  );
}
