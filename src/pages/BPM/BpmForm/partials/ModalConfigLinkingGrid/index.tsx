import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj } from "reborn-util";

import "./index.scss";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Button from "components/button/button";
import SelectCustom from "components/selectCustom/selectCustom";
import Input from "components/input/input";

export default function ModalConfigLinkingGrid({ onShow, onHide, callBack, dataConfig, listGridField }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [dataConfigGrid, setDataConfigGrid] = useState<any>(dataConfig?.linkingConfig || {});

  useEffect(() => {
    if (onShow && dataConfig) {
      setDataConfigGrid(dataConfig?.linkingConfig ? JSON.parse(dataConfig?.linkingConfig) : {});
    }
  }, [dataConfig, onShow]);

  const [optionsListGridField, setOptionsListGridField] = useState([]);
  useEffect(() => {
    if (listGridField && Array.isArray(listGridField) && listGridField.length > 0) {
      const options = listGridField.map((item) => ({
        value: item.fieldName,
        label: item.label,
      }));
      setOptionsListGridField(options);
    }
  }, [listGridField]);

  const values = useMemo(
    () => ({
      eformId: null,
      method: dataConfigGrid?.method || "GET",
      endpoint: dataConfigGrid?.endpoint || "",
      serviceType: dataConfigGrid?.serviceType || "REST API",
      gridDeparture: dataConfigGrid?.gridDeparture || "",
      gridDestination: dataConfigGrid?.gridDestination
        ? dataConfigGrid?.gridDestination
            .split(",")
            .map((item) => ({ value: item, label: optionsListGridField.find((opt) => opt.value === item)?.label || item }))
        : [],
      buttonName: dataConfigGrid?.buttonName || "",
    }),
    [onShow, dataConfigGrid, optionsListGridField]
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
    let dataConfigGridSubmit = {
      ...formData,
      gridDestination:
        formData?.gridDestination && Array.isArray(formData.gridDestination)
          ? formData?.gridDestination.map((item) => item.value).join(",")
          : formData?.gridDestination,
    };
    callBack({
      ...dataConfig,
      linkingConfig: dataConfigGridSubmit,
    });
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
        className={showFullScreen ? "modal-config-linking-grid-full" : "modal-config-linking-grid"}
      >
        <form className="form-config">
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt liên kết dữ liệu"}</h4>
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
            <div className="list-form-group-config-linking-grid">
              <div className="form-group-data">
                <div className="title"> Dữ liệu vào</div>
                <div className="form-group">
                  <SelectCustom
                    id="gridDeparture"
                    name="gridDeparture"
                    label="Nhận bộ lọc từ lưới"
                    fill={true}
                    special={true}
                    // required={true}
                    options={optionsListGridField}
                    value={formData.gridDeparture ? optionsListGridField.find((item) => item.value === formData.gridDeparture) : null}
                    onChange={(e) => {
                      setFormData({ ...formData, gridDeparture: e.value });
                    }}
                    isAsyncPaginate={false}
                    isFormatOptionLabel={false}
                    placeholder="Chọn loại dịch vụ"
                    // additional={{
                    //     page: 1,
                    // }}
                    // loadOptionsPaginate={loadOptionSaleflow}
                    // formatOptionLabel={formatOptionLabelCustomer}
                    // disabled={checkParamsUrl}
                  />
                </div>
                <div className="form-group">
                  <SelectCustom
                    id="serviceType"
                    name="serviceType"
                    label="Loại dịch vụ"
                    fill={true}
                    special={true}
                    // required={true}
                    options={[
                      {
                        value: "SOAP Web Service",
                        label: "SOAP Web Service",
                      },
                      {
                        value: "REST API",
                        label: "REST API",
                      },
                      {
                        value: "Java Delegate",
                        label: "Java Delegate",
                      },
                    ]}
                    value={formData.serviceType ? { value: formData.serviceType, label: formData.serviceType } : null}
                    onChange={(e) => {
                      setFormData({ ...formData, serviceType: e.value });
                    }}
                    isAsyncPaginate={false}
                    isFormatOptionLabel={false}
                    placeholder="Chọn loại dịch vụ"
                    // additional={{
                    //     page: 1,
                    // }}
                    // loadOptionsPaginate={loadOptionSaleflow}
                    // formatOptionLabel={formatOptionLabelCustomer}
                    // disabled={checkParamsUrl}
                  />
                </div>
                <div className="form-group">
                  <Input
                    id="endpoint"
                    name="endpoint"
                    label="Đường dẫn dịch vụ"
                    fill={true}
                    // required={true}
                    placeholder={"Đường dẫn dịch vụ"}
                    value={formData.endpoint}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, endpoint: value });
                    }}
                  />
                </div>
                <div className="form-group">
                  <SelectCustom
                    id="method"
                    name="method"
                    label="Phương thức HTTP"
                    fill={true}
                    special={true}
                    // required={true}
                    options={[
                      {
                        value: "GET",
                        label: "GET",
                      },
                      {
                        value: "POST",
                        label: "POST",
                      },
                      {
                        value: "PUT",
                        label: "PUT",
                      },
                      {
                        value: "DELETE",
                        label: "DELETE",
                      },
                    ]}
                    value={formData.method ? { value: formData.method, label: formData.method } : null}
                    onChange={(e) => {
                      setFormData({ ...formData, method: e.value });
                    }}
                    isAsyncPaginate={false}
                    isFormatOptionLabel={false}
                    placeholder="Chọn phương thức HTTP"
                    // additional={{
                    //     page: 1,
                    // }}
                    // loadOptionsPaginate={loadOptionSaleflow}
                    // formatOptionLabel={formatOptionLabelCustomer}
                  />
                </div>
              </div>
              <div className="form-group-data">
                <div className="title">Dữ liệu ra</div>
                <div className="form-group">
                  <Input
                    id="buttonName"
                    name="buttonName"
                    label="Tiêu đề nút bấm"
                    fill={true}
                    // required={true}
                    placeholder={"Nhập tiêu đề nút bấm"}
                    value={formData.buttonName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, buttonName: value });
                    }}
                  />
                </div>
                <div className="form-group">
                  <SelectCustom
                    id="gridDestination"
                    name="gridDestination"
                    label="Lưới nhận bộ lọc"
                    fill={true}
                    special={true}
                    isMulti={true}
                    // required={true}
                    options={optionsListGridField}
                    value={formData.gridDestination ? formData.gridDestination : null}
                    onChange={(e) => {
                      console.log(e);

                      setFormData({ ...formData, gridDestination: e });
                    }}
                    isAsyncPaginate={false}
                    isFormatOptionLabel={false}
                    placeholder="Chọn loại dịch vụ"
                    // additional={{
                    //     page: 1,
                    // }}
                    // loadOptionsPaginate={loadOptionSaleflow}
                    // formatOptionLabel={formatOptionLabelCustomer}
                    // disabled={checkParamsUrl}
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
