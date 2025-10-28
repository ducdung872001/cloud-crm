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
import RadioList from "components/radio/radioList";
import Loading from "components/loading";
import TableOlaRule from "../../ModalUserTask/partials/ModalOLA/partial/TableOlaRule";
import { useOlaSetting } from "hooks/useLA";

export default function ModalSLA(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, dataNode, disable, processId } = props;
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const SLA_TYPE = "SLA";
  const {
      typeNode,
      setTypeNode,
      isSubmit,
      isLoadingType,
      valueResponse,
      valueProcess,
      setValueResponse,
      setValueProcess,
      onSubmit,
      clearForm,
      dataConfigAdvance,
      setDataConfigAdvanceEdit,
    } = useOlaSetting({ dataNode, onHide, typeOfNode: SLA_TYPE, onShow });

  // const updateResponseTime = async (body) => {
  //   const response = await BusinessProcessService.updateServiceLevel(body);
  //   if (response.code === 0) {
  //     const resutl = response.result;
  //     setValueResponse(resutl);
  //     //   showToast(`Cập nhật thành công`, "success");
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }
  // };

  // const updateProcessTime = async (body) => {
  //   const response = await BusinessProcessService.updateServiceLevel(body);
  //   if (response.code === 0) {
  //     const resutl = response.result;
  //     setValueProcess(resutl);
  //     //   showToast(`Cập nhật thành công`, "success");
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }
  // };

  // const showDialogConfirmCancel = () => {
  //   const contentDialog: IContentDialog = {
  //     color: "warning",
  //     className: "dialog-cancel",
  //     isCentered: true,
  //     isLoading: false,
  //     title: <Fragment>{`Hủy bỏ thao tác cài đặt`}</Fragment>,
  //     message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
  //     cancelText: "Quay lại",
  //     cancelAction: () => {
  //       setShowDialog(false);
  //       setContentDialog(null);
  //     },
  //     defaultText: "Xác nhận",
  //     defaultAction: () => {
  //       setShowDialog(false);
  //       setContentDialog(null);
  //       clearForm();
  //     },
  //   };
  //   setContentDialog(contentDialog);
  //   setShowDialog(true);
  // };

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
              clearForm();
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-setting-SLA"
        size={typeNode == "advanced" ? "xxl" : "xl"}
      >
        <form className="form-setting-SLA" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt SLA`} toggle={() => !isSubmit && clearForm()} />
          <ModalBody>
            <div className="form-switch-type">
              <div className="form-group">
                <RadioList
                  options={[
                    { value: "basic", label: "Cơ bản" },
                    { value: "advanced", label: "Nâng cao" },
                  ]}
                  // className="options-auth"
                  // required={true}
                  title="Loại cài đặt: "
                  name="typeNode"
                  value={typeNode}
                  onChange={(e: any) => {
                    const value = e.target.value;
                    setTypeNode(value);
                  }}
                />
              </div>
            </div>
            {!isLoadingType ? (
              <>
                {typeNode === "advanced" ? (
                  <TableOlaRule
                    dataNode={dataNode}
                    processId={processId}
                    childProcessId={processId}
                    dataConfigAdvance={dataConfigAdvance}
                    setDataConfigAdvanceEdit={setDataConfigAdvanceEdit}
                  />
                ) : (
                  <div className="setting-SLA">
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
                )}
              </>
            ) : (
              <Loading />
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
