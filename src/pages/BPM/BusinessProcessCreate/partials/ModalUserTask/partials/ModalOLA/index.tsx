import React, { Fragment, useState, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import "./index.scss";
import NummericInput from "components/input/numericInput";
import _ from "lodash";
import TableOlaRule from "./partial/TableOlaRule";
import RadioList from "components/radio/radioList";
import Loading from "components/loading";
import { useOlaSetting } from "hooks/useLA";
import ModalHistoryOLA from "./partial/ModalHistoryOLA/ModalHistoryOLA";
import ModalOverLap from "./partial/ModalOverLap";

export default function ModalOLA(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, dataNode, disable, processId } = props;
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isHistoryOLA, setIsHistoryOLA] = useState(false);

  const OLA_TYPE = "OLA";
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
  } = useOlaSetting({ dataNode, onHide, typeOfNode: OLA_TYPE, onShow, processId: undefined });

  // const updateResponseTime = async (body) => {
  //   const response = await BusinessProcessService.updateServiceLevel(body);
  //   if (response.code === 0) {
  //     const resutl = response.result;
  //     setValueResponse(resutl);
  //     // showToast(`Cập nhật thành công`, "success");
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }
  // };

  // const updateProcessTime = async (body) => {
  //   const response = await BusinessProcessService.updateServiceLevel(body);
  //   if (response.code === 0) {
  //     const resutl = response.result;
  //     setValueProcess(resutl);
  //     // showToast(`Cập nhật thành công`, "success");
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
  //       handClearForm();
  //     },
  //   };
  //   setContentDialog(contentDialog);
  //   setShowDialog(true);
  // };

  const [haveError, setHaveError] = useState({});

  const hasAnyError = (haveError: Record<string, boolean>): boolean => {
    if (typeof haveError !== "object" || haveError === null) {
      throw new Error("Invalid input: haveError must be a non-null object");
    }

    return Object.values(haveError).some((value) => value === true);
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
    [isSubmit, haveError]
  );

  const [listError, setListError] = useState([]);
  const [showModalError, setShowModalError] = useState(false);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        size={typeNode == "advanced" ? "xxl" : "xl"}
        className="modal-setting-OLA"
      >
        <form
          className="form-setting-OLA"
          onSubmit={async (e) => {
            e?.preventDefault();
            if (hasAnyError(haveError)) {
              setContentDialog({
                color: "error",
                className: "dialog-error",
                isCentered: true,
                isLoading: false,
                title: <Fragment>{`Lỗi`}</Fragment>,
                message: <Fragment>Vui lòng kiểm tra lại các trường dữ liệu Min, Max</Fragment>,
                defaultText: "Đóng", // Thêm thuộc tính defaultText
                defaultAction: () => setShowDialog(false), // Thêm thuộc tính defaultAction
              });
              setShowDialog(true);
              return;
            } else {
              const statusSubmit = await onSubmit(e);
              if (statusSubmit && !statusSubmit.statusUpdate && statusSubmit?.response?.message) {
                const cleaned = statusSubmit?.response?.message.replace(/[{}]/g, "");
                const arr = JSON.parse(cleaned);
                if (arr.length > 0) {
                  setShowModalError(true);
                  setListError(arr);
                }
              }
            }
          }}
        >
          <ModalHeader title={`Cài đặt OLA`} toggle={() => !isSubmit && clearForm()} />
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setTypeNode(value);
                  }}
                />
              </div>

              <div
                className="history-ola"
                onClick={() => {
                  setIsHistoryOLA(true);
                }}
              >
                <span>Lịch sử OLA</span>
              </div>
            </div>
            {!isLoadingType ? (
              <>
                {typeNode == "advanced" ? (
                  <TableOlaRule
                    processId={processId}
                    childProcessId={processId}
                    dataConfigAdvance={dataConfigAdvance}
                    setDataConfigAdvanceEdit={setDataConfigAdvanceEdit}
                    setHaveError={setHaveError}
                  />
                ) : (
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
                )}
              </>
            ) : (
              <div className="icon-loading" style={{ height: "30rem" }}>
                <Loading />
              </div>
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalHistoryOLA
        onShow={isHistoryOLA}
        dataNode={dataNode}
        onHide={(reload) => {
          if (reload) {
          }
          setIsHistoryOLA(false);
        }}
      />
      <ModalOverLap
        onShow={showModalError}
        dataNode={listError}
        onHide={(reload) => {
          if (reload) {
          }
          setShowModalError(false);
        }}
      />
    </Fragment>
  );
}
