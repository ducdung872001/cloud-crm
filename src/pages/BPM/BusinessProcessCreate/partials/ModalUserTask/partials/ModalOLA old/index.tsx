import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";
import NummericInput from "components/input/numericInput";
import _ from "lodash";
import BusinessProcessService from "services/BusinessProcessService";

export default function ModalOLA(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, dataNode, disable } = props;
  // console.log('dataApproach', dataApproach);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  useEffect(() => {
    if (dataNode?.id && onShow) {
      getDetailServiceLevel(dataNode?.id);
    }
  }, [dataNode, onShow]);

  const getDetailServiceLevel = async (nodeId) => {
    const params = {
      nodeId: nodeId,
    };

    const response = await BusinessProcessService.listServiceLevel(params);
    if (response.code === 0) {
      const result = response.result;
      if (result.items && result.items.length > 0) {
        const dataResponse = result.items.find((el) => el.timeType === "response");
        if (dataResponse) {
          setValueResponse(dataResponse);
        } else {
          setValueResponse({ ...valueResponse, nodeId: nodeId });
        }

        const dataProcess = result.items.find((el) => el.timeType === "process");
        if (dataProcess) {
          setValueProcess(dataProcess);
        } else {
          setValueProcess({ ...valueProcess, nodeId: nodeId });
        }
      } else {
        setValueProcess({ ...valueProcess, nodeId: nodeId });
        setValueResponse({ ...valueResponse, nodeId: nodeId });
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [valueResponse, setValueResponse] = useState({
    id: "",
    day: "",
    hour: "",
    minute: "",
    timeType: "response",
    type: "OLA",
    nodeId: "",
  });

  const [valueProcess, setValueProcess] = useState({
    id: "",
    day: "",
    hour: "",
    minute: "",
    timeType: "process",
    type: "OLA",
    nodeId: "",
  });

  const updateResponseTime = async (body) => {
    const response = await BusinessProcessService.updateServiceLevel(body);
    if (response.code === 0) {
      const resutl = response.result;
      setValueResponse(resutl);
      // showToast(`Cập nhật thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const updateProcessTime = async (body) => {
    const response = await BusinessProcessService.updateServiceLevel(body);
    if (response.code === 0) {
      const resutl = response.result;
      setValueProcess(resutl);
      // showToast(`Cập nhật thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();
    setIsSubmit(true);
    // const body = {
    //     id: formData.values.id,
    //     slaConfig: JSON.stringify(formData.values.slaConfig)
    // };

    const resutlResponseTime = await BusinessProcessService.updateServiceLevel(valueResponse);
    const resutlProcessTime = await BusinessProcessService.updateServiceLevel(valueProcess);
    if (resutlResponseTime.code === 0 && resutlProcessTime.code === 0) {
      onHide(true);
      showToast(`Cài đặt OLA thành công`, "success");
      setIsSubmit(false);
    } else {
      showToast((resutlResponseTime.message || resutlProcessTime.message) ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setIsSubmit(false);
    setValueProcess({
      id: "",
      day: "",
      hour: "",
      minute: "",
      timeType: "process",
      type: "OLA",
      nodeId: "",
    });

    setValueResponse({
      id: "",
      day: "",
      hour: "",
      minute: "",
      timeType: "response",
      type: "OLA",
      nodeId: "",
    });
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Huỷ",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handClearForm();
              // _.isEqual(formData.values, valueSetting) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: "Áp dụng",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            // (!isDifferenceObj(formData.values, valueSetting) || ),
            // _.isEqual(formData.values, valueSetting),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác cài đặt`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);
        handClearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-setting-OLA"
      >
        <form className="form-setting-OLA" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt OLA`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="setting-OLA">
              <div className="box_line_date">
                <span className="title_time">Thời gian phản hồi:</span>
                <div className="box_setting_time">
                  <div className="box_time">
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={valueResponse.day}
                        disabled={disable}
                        onBlur={(e) => {
                          const body = {
                            ...valueResponse,
                            day: e.target.value,
                          };
                          // if(body.day){
                          //   updateResponseTime(body);
                          // }
                        }}
                        onChange={(e) => {
                          const value = e.target.value || "";
                          setValueResponse({ ...valueResponse, day: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_time">ngày</span>
                    </div>
                  </div>

                  <div className="box_time">
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={valueResponse.hour}
                        disabled={disable}
                        onBlur={(e) => {
                          const body = {
                            ...valueResponse,
                            hour: e.target.value,
                          };
                          // if(body.hour){
                          //   updateResponseTime(body);
                          // }
                        }}
                        onChange={(e) => {
                          const value = e.target.value || "";
                          setValueResponse({ ...valueResponse, hour: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_time">giờ</span>
                    </div>
                  </div>

                  <div className="box_time">
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={valueResponse.minute}
                        disabled={disable}
                        onBlur={(e) => {
                          const body = {
                            ...valueResponse,
                            minute: e.target.value,
                          };
                          // if(body.minute){
                          //   updateResponseTime(body);
                          // }
                        }}
                        onChange={(e) => {
                          const value = e.target.value || "";
                          setValueResponse({ ...valueResponse, minute: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_time">phút</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="box_line_date">
                <span className="title_time">Thời gian xử lý:</span>
                <div className="box_setting_time">
                  <div className="box_time">
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={valueProcess.day}
                        disabled={disable}
                        onBlur={(e) => {
                          const body = {
                            ...valueProcess,
                            day: e.target.value,
                          };
                          // if(body.day){
                          //   updateProcessTime(body);
                          // }
                        }}
                        onChange={(e) => {
                          const value = e.target.value || "";
                          setValueProcess({ ...valueProcess, day: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_time">ngày</span>
                    </div>
                  </div>

                  <div className="box_time">
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={valueProcess.hour}
                        disabled={disable}
                        onBlur={(e) => {
                          const body = {
                            ...valueProcess,
                            hour: e.target.value,
                          };
                          // if(body.hour){
                          //   updateProcessTime(body);
                          // }
                        }}
                        onChange={(e) => {
                          const value = e.target.value || "";
                          setValueProcess({ ...valueProcess, hour: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_time">giờ</span>
                    </div>
                  </div>

                  <div className="box_time">
                    <div className="form-group">
                      <NummericInput
                        name="score"
                        id="score"
                        // label="Số lượng thực tế"
                        fill={false}
                        value={valueProcess.minute}
                        disabled={disable}
                        onBlur={(e) => {
                          const body = {
                            ...valueProcess,
                            minute: e.target.value,
                          };
                          // if(body.minute){
                          //   updateProcessTime(body);
                          // }
                        }}
                        onChange={(e) => {
                          const value = e.target.value || "";
                          setValueProcess({ ...valueProcess, minute: value });
                        }}
                      />
                    </div>
                    <div>
                      <span className="title_time">phút</span>
                    </div>
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
