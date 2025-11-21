import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj } from "reborn-util";

import "./index.scss";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Button from "components/button/button";
import GridAg from "pages/BPM/GridAg";

export default function ModalConfigGrid({ onShow, onHide, callBack, dataConfig }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [dataConfigGrid, setDataConfigGrid] = useState<any>({
    headerTable: dataConfig?.headerTable || [],
    dataRow: dataConfig?.dataRow || [],
  });

  console.log("dataConfig>>>", dataConfig);

  const values = useMemo(
    () => ({
      eformId: null,
    }),
    [onShow]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const handleSubmit = () => {
    onHide(false);
    callBack(dataConfigGrid);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Cập nhật",
            type: "button",
            color: "primary",
            // disabled: isSubmit || !isDifferenceObj(formData, values),
            callback: () => {
              handleSubmit();
            },
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, dataConfigGrid]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const checkShowFullScreen = localStorage.getItem("showFullScreenConfigGrid");
  const [showFullScreen, setShowFullScreen] = useState<boolean>(checkShowFullScreen ? JSON.parse(checkShowFullScreen) : false);

  const handleClear = (acc) => {
    onHide(acc);
  };
  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size={showFullScreen ? "xxl" : "xl"}
        toggle={() => !isSubmit && onHide(false)}
        className={showFullScreen ? "modal-config-grid-full" : "modal-config-grid"}
      >
        <form className="form-config">
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt lưới"}</h4>
            </div>
            <div className="container-button">
              {!showFullScreen ? (
                <Tippy content="Mở rộng">
                  <div
                    style={{ marginBottom: 4, marginRight: 5, cursor: "pointer" }}
                    onClick={() => {
                      setShowFullScreen(true);
                      localStorage.setItem("showFullScreenConfigGrid", "true");
                    }}
                  >
                    <Icon name="ZoomInFullScreen" />
                  </div>
                </Tippy>
              ) : (
                <Tippy content="Thu nhỏ">
                  <div
                    style={{ marginBottom: 4, marginRight: 5, cursor: "pointer" }}
                    onClick={() => {
                      setShowFullScreen(false);
                      localStorage.setItem("showFullScreenConfigGrid", "false");
                    }}
                  >
                    <Icon name="ZoomOutScreen" />
                  </div>
                </Tippy>
              )}
              <Button onClick={() => handleClear(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                <Icon name="Times" />
              </Button>
            </div>
          </div>
          <ModalBody>
            <div className="list-form-group">
              <GridAg location={"configForm"} setDataConfigGrid={setDataConfigGrid} dataGrid={dataConfig} />
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
