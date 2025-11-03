/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Input from "components/input/input";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IActionModal, IOption } from "model/OtherModel";
import "./ModalViewChart.scss";
import ChartComponent from "components/ChartComponent/ChartComponent";

export default function ModalViewChart(props: any) {
  const { onShow, data, onHide, } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
                clearForm(false)
            },
          },
        //   {
        //     title: data ? "Cập nhật" : "Tạo mới",
        //     type: "submit",
        //     color: "primary",
        //     disabled: isSubmit || 
        //                 // !isDifferenceObj(formData.values, values) || 
        //                 // (formData.errors && Object.keys(formData.errors).length > 0) ||
        //                 validateFieldEntityName || validateFieldEventName || validateFieldMethod,
        //     is_loading: isSubmit,
        //   },
        ],
      },
    }),
    [isSubmit,]
  );


  const clearForm = (acc) => {
    onHide(acc);

  }


  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        size="xl"
        toggle={() => {
          if (!isSubmit) {
            clearForm(false);
          }
        }}
        className="modal-add-webhook"
      >
        <form className="form-add-webhook">
          <ModalHeader
            title={`Biểu đồ mẫu`}
            toggle={() => {
              if (!isSubmit) {
                clearForm(false);
              }
            }}
          />
          <ModalBody>
            <div className="list-form-group">
                <ChartComponent
                    chartType ={data?.code}
                />

            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
