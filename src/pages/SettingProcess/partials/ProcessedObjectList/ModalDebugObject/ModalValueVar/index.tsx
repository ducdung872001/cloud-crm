import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, getPageOffset } from "reborn-util";
import "./index.scss";
import { showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

export default function ModalValueVar({ onShow, onHide, data, dataObject }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [dataVar, setDataVar] = useState({});

  const getDatatVar = async (potId, variableId) => {
    setIsLoading(true);

    const params = {
      potId: potId,
      variableId: variableId,
    };

    const response = await BusinessProcessService.listVariableInstance(params);

    if (response.code == 0) {
      const result = response.result;
      const variableValue = result?.items[0]?.variableValue && JSON.parse(result?.items[0]?.variableValue);
      setDataVar(variableValue);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && dataObject && data) {
      getDatatVar(dataObject?.id, data?.id);
    }
  }, [onShow, dataObject]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              handleClearForm();
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

  const handleClearForm = () => {
    onHide(false);
    setDataVar({});
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        // size="lg"
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-value-var"
      >
        <form className="form-value-var">
          <ModalHeader title={`Giá trị biến`} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
            {isLoading ? (
              <Loading />
            ) : dataVar ? (
              <div style={{ maxHeight: "52rem", overflow: "auto", padding: "1.6rem 2rem 1.6rem 2rem" }}>
                <JsonView
                  src={dataVar}
                  // style={{fontSize: 11, fontWeight:'700'}}
                  // name=''
                  // enableClipboard={false}
                  collapsed={false}
                />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1.6rem" }}>
                <span style={{ fontSize: 14, fontWeight: "500" }}>Chưa có dữ liệu</span>
              </div>
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
