import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IAddEmailModelProps } from "model/email/PropsModel";
import { IEmailRequest } from "model/email/EmailRequestModel";
// import EmailService from "services/EmailService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import CustomerService from "services/CustomerService";
import { serialize } from "utils/editor";

import "./index.scss";
import NummericInput from "components/input/numericInput";
import MarketingAutomationService from "services/MarketingAutomationService";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Input from "components/input/input";
import _ from "lodash";

export default function ConfigTime(props: any) {
  const { onShow, onHide, dataNode, setDataNode, statusMA } = props;
  const [data, setData] = useState(null);
  const [nodeName, setNodeName] = useState(null);
  const [nodePoint, setNodePoint] = useState(null);

  useEffect(() => {
    if (dataNode?.name) {
      setNodeName(dataNode.name);
    }
    if (dataNode?.point) {
      setNodePoint(dataNode.point);
    }
  }, [dataNode]);

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  useEffect(() => {
    if (dataNode?.configData && onShow) {
      const configData = dataNode.configData;
      setData({
        day: configData?.time.day,
        hour: configData?.time.hour,
        minute: configData?.time.minute,
      });
    } else {
      setData(null);
    }
  }, [dataNode, onShow]);

  const values = useMemo(
    () => ({
      day: data?.day ?? 0,
      hour: data?.hour ?? 0,
      minute: data?.minute ?? 0,
    }),
    [data, onShow]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // Thực hiện gửi email
  const onSubmit = async () => {
    // e.preventDefault();

    const configDataNew = {
      time: {
        day: formData.day,
        hour: formData.hour,
        minute: formData.minute,
      },
    };

    const body: any = {
      ...dataNode,
      ...(!_.isEqual(nodeName, dataNode?.name) ? { name: nodeName } : {}),
      configData: configDataNew,
      point: nodePoint,
    };

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật điều kiện thời gian thành công`, "success");
      onHide(true);
      setEditName(true);
      setNodePoint(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
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
              handleClearForm();
              // !isDifferenceObj(formData, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
            // type: "submit",
            color: "primary",
            disabled: isSubmit || !nodeName || statusMA === 1 || (!isDifferenceObj(formData, values) && !nodePoint),
            is_loading: isSubmit,
            callback: () => {
              if (_.isEqual(nodeName, dataNode?.name)) {
                onSubmit();
              } else {
                onHide(true);
                setEditName(true);
                setTimeout(() => {
                  setNodePoint(null);
                }, 1000);
              }
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, nodePoint, nodeName, dataNode, statusMA]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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

  const [editName, setEditName] = useState(true);
  const handleClearForm = () => {
    onHide(false);
    setEditName(true);
    setNodeName(null);
    setNodePoint(null);
  };

  const changeNodeName = async () => {
    const configDataNew = {
      time: {
        day: formData.day,
        hour: formData.hour,
        minute: formData.minute,
      },
    };
    if (!nodeName) {
      showToast("Vui lòng nhập tên điều kiện", "error");
      return;
    }
    const body: IEmailRequest = {
      ...dataNode,
      name: nodeName,
      configData: configDataNew,
      point: nodePoint,
    };

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật điều kiện thành công`, "success");
      onHide("not_close");
      setEditName(true);
      setDataNode({ ...dataNode, name: nodeName });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-config-time"
        size="lg"
      >
        <form className="form-config-time">
          <ModalHeader title={dataNode?.name} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
            <div className="box-name-point">
              <div className="container-name">
                <div className="box-name">
                  <span className="name-group">Tên điều kiện</span>
                  <Tippy content="Đổi tên điều kiện">
                    <div
                      onClick={() => {
                        if (statusMA !== 1) {
                          setEditName(false);
                        }
                      }}
                    >
                      <Icon
                        name="Pencil"
                        style={{
                          width: 18,
                          height: 18,
                          fill: statusMA === 1 ? "var(--extra-color-20)" : "#015aa4",
                          cursor: "pointer",
                          marginBottom: 3,
                        }}
                      />
                    </div>
                  </Tippy>
                </div>

                <div className="edit-name">
                  <div style={{ flex: 1 }}>
                    <Input
                      name="name_field"
                      value={nodeName}
                      fill={true}
                      disabled={editName}
                      onBlur={() => {
                        // setEditName(false);
                        // setNodeName(dataNode?.name)
                        if (!_.isEqual(nodeName, dataNode?.name)) {
                          changeNodeName();
                        } else {
                          setEditName(true);
                        }
                      }}
                      // iconPosition="right"
                      // icon={<Icon name="Times" />}
                      // iconClickEvent={() => {
                      //   setEditName(false);
                      //   setNodeName(dataNode?.name)
                      // }}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNodeName(value);
                      }}
                      placeholder="Nhập tên điều kiện"
                    />
                  </div>
                </div>
              </div>

              <div className="container-point">
                <div className="box-name">
                  <span className="name-group">Điểm điều kiện</span>
                </div>

                <div className="edit-point">
                  <div style={{ flex: 1 }}>
                    <NummericInput
                      name="point_field"
                      value={nodePoint}
                      fill={true}
                      // onBlur={() => {
                      //   if(!_.isEqual(nodeName, dataNode?.name)){
                      //     changeNodeName()
                      //   } else {
                      //     setEditName(true);
                      //   }
                      // }}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNodePoint(value);
                      }}
                      placeholder="Nhập điểm điều kiện"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="box_line_date">
              <span className="title_expire">Thời gian chờ:</span>

              <div className="box_expire">
                <div className="box_time">
                  <div className="form-group">
                    <NummericInput
                      name="score"
                      id="score"
                      // label="Số lượng thực tế"
                      fill={false}
                      value={formData.day === 0 ? "" : formData.day}
                      onValueChange={(e) => {
                        const value = +e.floatValue || 0;
                        setFormData({ ...formData, day: value });
                      }}
                    />
                  </div>
                  <div>
                    <span className="title_time">ngày,</span>
                  </div>
                </div>

                <div className="box_time">
                  <div className="form-group">
                    <NummericInput
                      name="score"
                      id="score"
                      // label="Số lượng thực tế"
                      fill={false}
                      value={formData.hour === 0 ? "" : formData.hour}
                      onValueChange={(e) => {
                        const value = +e.floatValue || 0;
                        setFormData({ ...formData, hour: value });
                      }}
                    />
                  </div>
                  <div>
                    <span className="title_time">giờ,</span>
                  </div>
                </div>

                <div className="box_time">
                  <div className="form-group">
                    <NummericInput
                      name="score"
                      id="score"
                      // label="Số lượng thực tế"
                      fill={false}
                      value={formData.minute === 0 ? "" : formData.minute}
                      onValueChange={(e) => {
                        const value = +e.floatValue || 0;
                        setFormData({ ...formData, minute: value });
                      }}
                    />
                  </div>
                  <div>
                    <span className="title_time">phút</span>
                  </div>
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
