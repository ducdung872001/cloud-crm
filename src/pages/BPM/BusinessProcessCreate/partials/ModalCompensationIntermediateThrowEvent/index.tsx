import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj } from "reborn-util";
import "./index.scss";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import BusinessProcessService from "services/BusinessProcessService";
import ModalSetting from "../ModalUserTask/partials/ModalSetting";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import { showToast } from "utils/common";
import SelectCustom from "components/selectCustom/selectCustom";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";

export default function ModalCompensationIntermediateThrowEvent({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);

  const [data, setData] = useState(null);
  const [childProcessId, setChildProcessId] = useState(null);
  const [listInputCompensation, setListInputCompensation] = useState([
    {
      rollbackStep: "",
      compensationRef: null,
    },
  ]);

  const values = useMemo(
    () => ({
      id: null,
      name: data?.name ?? "",
      description: data?.description ?? "",
      nodeId: dataNode?.id ?? null,
      rollbackType: data?.rollbackType ?? null,
      rollbackStep: data?.rollbackStep ?? "",
      compensationRef: data?.compensationRef ?? null,
    }),
    [onShow, data, dataNode, processId, childProcessId]
  );

  const [formData, setFormData] = useState(values);
  const [compensationRefOptions, setCompensationRefOptions] = useState([]);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if (dataNode && onShow) {
      getDetailTask(dataNode.id);
      getCompensationRef();
      if (dataNode?.businessObject?.$parent?.id && dataNode.businessObject?.$parent?.$type === "bpmn:SubProcess") {
        getDetailNode(dataNode?.id);
      }
    }
  }, [dataNode, onShow]);

  const getDetailNode = async (nodeId) => {
    const response = await BusinessProcessService.bpmDetailNode(nodeId);

    if (response.code == 0) {
      const result = response.result;
      setChildProcessId(result?.processId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailTask = async (id) => {
    const response = await BusinessProcessService.detailCompensationIntermediateThrowEvent(id);
    if (response.code == 0) {
      const result = response.result;
      setData(result);

      // Parse rollbackStep từ JSON string về array
      let parsedInputVars = [];
      if (result.rollbackStep && typeof result.rollbackStep === "string") {
        const rollbackStepArray = JSON.parse(result.rollbackStep);
        if (Array.isArray(rollbackStepArray)) {
          parsedInputVars = rollbackStepArray.map((item) => ({
            rollbackStep: item.step ? item.step.toString() : "",
            compensationRef: item.nodeId ? { value: item.nodeId, label: item.nodeId } : null,
          }));
        }
      }

      // Nếu không có data nào, tạo một item mặc định
      if (parsedInputVars.length === 0) {
        parsedInputVars = [{ rollbackStep: "", compensationRef: null }];
      }

      setListInputCompensation(parsedInputVars);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getCompensationRef = async () => {
    const result = await BusinessProcessService.listCompensationRef(processId);
    if (result && Array.isArray(result.result)) {
      const options = result.result.map((item) => ({
        value: item,
        label: item,
      }));
      setCompensationRefOptions(options);
    } else {
      setCompensationRefOptions([]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmit(true);

    const rollbackStepData = listInputCompensation
      .filter((item) => item.rollbackStep && item.rollbackStep.toString().trim() !== "")
      .map((item) => {
        const nodeId =
          item.compensationRef?.value || item.compensationRef?.label || (typeof item.compensationRef === "string" ? item.compensationRef : "") || ""; // Cho phép nodeId rỗng nếu chưa chọn
        return {
          step: parseInt(item.rollbackStep) || 0,
          nodeId: nodeId,
        };
      });

    const rollbackStepString = JSON.stringify(rollbackStepData);

    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      description: formData?.description ?? "",
      nodeId: dataNode?.id ?? null,
      rollbackType: formData?.rollbackType ?? null,
      rollbackStep: rollbackStepString,
      compensationRef: formData?.compensationRef ?? null,
    };

    const response = await BusinessProcessService.updateCompensationIntermediateThrowEvent(body);
    if (response.code === 0) {
      showToast(`Cập nhật công việc thành công`, "success");
      handleClear(false);
      changeNameNodeXML(dataNode, body.name);
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
            title: disable ? "Đóng" : "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData, values) ? handleClear(false) : showDialogConfirmCancel();
            },
          },
          ...(disable
            ? []
            : ([
                {
                  title: "Cập nhật",
                  type: "submit",
                  color: "primary",
                  disabled: isSubmit,
                  is_loading: isSubmit,
                },
              ] as any)),
        ],
      },
    }),
    [formData, values, isSubmit, disable]
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
        handleClear(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClear = (acc) => {
    onHide(acc);
    setData(null);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-compensation-intermediate-throw-event"
      >
        <form className="form-compensation-intermediate-throw" onSubmit={(e) => onSubmit(e)}>
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt Compensation Intermediate Throw Event"}</h4>
            </div>
            <ListButtonHeader
              data={data}
              dataNode={dataNode}
              processId={processId}
              disable={disable}
              isSubmit={isSubmit}
              setIsModalClone={() => setIsModalClone(true)}
              setIsModalSetting={() => setIsModalSetting(true)}
              setIsModalDebug={() => setIsModalDebug(true)}
              handleClear={() => handleClear(false)}
            />
          </div>
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group input-name">
                <Input
                  id="name"
                  name="name"
                  label="Tên node"
                  fill={true}
                  required={true}
                  placeholder={"Tên node"}
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, name: value });
                  }}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="rollbackType"
                  name="rollbackType"
                  label="Kiểu bồi hoàn"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: 1,
                      label: "Đồng thời toàn bộ trong phạm vi quy trình",
                    },
                    {
                      value: 2,
                      label: "Tuần tự theo các bước",
                    },
                  ]}
                  value={
                    formData.rollbackType
                      ? {
                          value: formData.rollbackType,
                          label: formData.rollbackType === 1 ? "Đồng thời toàn bộ trong phạm vi quy trình" : "Tuần tự theo các bước",
                        }
                      : null
                  }
                  onChange={(e) => {
                    setFormData({ ...formData, rollbackType: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn kiểu bồi hoàn"
                />
              </div>

              <div className="container-compensation">
                {/* <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Bước bồi hoàn</span>
                </div> */}
                {listInputCompensation && listInputCompensation.length > 0
                  ? listInputCompensation.map((item, index) => (
                      <div key={index} className="list-item-compensation">
                        <div className="item-compensation">
                          <Input
                            id={`step-${index}`}
                            name="rollbackStep"
                            label={index === 0 ? "Bước bồi hoàn" : ""}
                            fill={true}
                            type="number"
                            required={false}
                            placeholder={"Bước bồi hoàn"}
                            value={item.rollbackStep}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value > 0 || value === "") {
                                setListInputCompensation((current) =>
                                  current.map((obj, idx) => (idx === index ? { ...obj, rollbackStep: value } : obj))
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="item-compensation">
                          {index === 0 && (
                            <div>
                              <span style={{ fontSize: 14, fontWeight: "700" }}>Compensation Boundary NodeID</span>
                            </div>
                          )}
                          <div className="container-select-mapping">
                            <div className="select-mapping">
                              <SelectCustom
                                id={`compensationRef-${index}`}
                                name="compensationRef"
                                fill={false}
                                required={false}
                                special={true}
                                options={compensationRefOptions}
                                value={item.compensationRef}
                                onChange={(e) => {
                                  setListInputCompensation((current) =>
                                    current.map((obj, idx) => (idx === index ? { ...obj, compensationRef: e } : obj))
                                  );
                                }}
                                isAsyncPaginate={false}
                                isFormatOptionLabel={false}
                                placeholder="Chọn NodeID"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="add-attribute" style={index === 0 ? { marginTop: "3.2rem" } : {}}>
                          <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                            <span
                              className="icon-add"
                              onClick={() => {
                                setListInputCompensation([...listInputCompensation, { rollbackStep: "", compensationRef: null }]);
                              }}
                            >
                              <Icon name="PlusCircleFill" />
                            </span>
                          </Tippy>
                        </div>
                        {listInputCompensation.length > 1 ? (
                          <div className="remove-attribute" style={index === 0 ? { marginTop: "3.2rem" } : {}}>
                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                              <span
                                className="icon-remove"
                                onClick={() => {
                                  setListInputCompensation((current) => current.filter((_, idx) => idx !== index));
                                }}
                              >
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          </div>
                        ) : null}
                      </div>
                    ))
                  : null}
              </div>

              <div className="form-group">
                <TextArea
                  name="description"
                  value={formData.description}
                  label="Mô tả node"
                  fill={true}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, description: value });
                  }}
                  placeholder="Nhập mô tả"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalSetting
        onShow={isModalSetting}
        dataNode={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalSetting(false);
        }}
      />
      <ModalSelectNodeOther
        onShow={isModalClone}
        data={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            getDetailTask(dataNode.id);
          }
          setIsModalClone(false);
        }}
      />
      <ModalDebug
        onShow={isModalDebug}
        dataNode={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalDebug(false);
        }}
      />
    </Fragment>
  );
}
