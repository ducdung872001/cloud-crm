import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj } from "reborn-util";
import "./index.scss";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import Tippy from "@tippyjs/react";
import BusinessProcessService from "services/BusinessProcessService";
import Button from "components/button/button";
import ModalSetting from "../ModalUserTask/partials/ModalSetting";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import { showToast } from "utils/common";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";


export default function ModalEscalationStartEvent({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [data, setData] = useState(null);
  const [dataDepartment, setDataDepartment] = useState(null);
  const [dataAssigness, setDataAssigness] = useState([]);
  const [dataWorkflow, setDataWorkflow] = useState(null);

  const [checkFieldStartDate, setCheckFieldStartDate] = useState<boolean>(false);
  const [checkFieldEndDate, setCheckFieldEndDate] = useState<boolean>(false);
  const [childProcessId, setChildProcessId] = useState(null);

  useEffect(() => {
    if (dataNode && onShow) {
      getDetailTask(dataNode.id);
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
    const response = await BusinessProcessService.detailEscalationStartEvent(id);

    if (response.code == 0) {
      const result = response.result;
      const assignees = (result?.assignees && JSON.parse(result.assignees)) || [];
      if (assignees?.length > 0) {
        setDataAssigness(assignees);
      }
      const attachments = (result?.attachments && JSON.parse(result.attachments)) || [];
      setListAttactment(attachments);

      const department = (result?.department && JSON.parse(result.department)) || null;
      const data = {
        ...result,
        department: department,
      };
      setData(data);
      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const values = useMemo(
    () => ({
      id: null,
      name: data?.name ?? "",
      code: data?.code ?? "",
      description: data?.description ?? "",
      nodeId: dataNode?.id ?? null,
      processId: childProcessId ?? processId ?? null,
      escalationCode: data?.escalationCode ?? "",
      isInterrupting: 1
    }),
    [onShow, data, dataNode, processId, childProcessId]
  );

  const [formData, setFormData] = useState(values);
  // console.log("formData>>>>>>>>>>>>", formData);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);
    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      code: formData?.code ?? "",
      description: formData?.description ?? "",
      nodeId: dataNode?.id ?? null,
      processId: formData?.processId ?? null,
      escalationCode: formData?.escalationCode ?? "",
      isInterrupting: formData?.isInterrupting
    };

    console.log("body", body);

    const response = await BusinessProcessService.updateEscalationStartEvent(body);

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
    setDataAssigness(null);
    setDataDepartment(null);
    setCheckFieldStartDate(false);
    setCheckFieldEndDate(false);
    setDataWorkflow(null);
  };

  const [listAttactment, setListAttactment] = useState([]);

  const addNode = async () => {
    const body = {
      name: data?.name,
      typeNode: dataNode.type,
      processId: processId,
      nodeId: dataNode.id,
    };
    // return;
    const response = await BusinessProcessService.bpmAddNode(body);

    if (response.code == 0) {
      const result = response.result;
      showToast(`Lưu Node thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
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
        className="modal-escalation-start-event"
      >
        <form className="form-escalation-start-event" onSubmit={(e) => onSubmit(e)}>
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt Escalation start event"}</h4>
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
              <div className="form-group">
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
                <Input
                  id="code"
                  name="code"
                  label="Mã node"
                  fill={true}
                  required={false}
                  placeholder="Mã node"
                  value={formData.code}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, code: value });
                  }}
                />
              </div>

              <div className="form-group">
                <TextArea
                  name="note"
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

              <div className="form-group" style={{ width: "100%" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Mã code</span>
                </div>
                <div className="box-input-message">
                  <span style={{ fontSize: 14, fontWeight: "400" }}></span>
                  <Input
                    name="escalationCode"
                    value={formData?.escalationCode ?? data?.escalationCode ?? ""}
                    label=""
                    fill={false}
                    required={false}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, escalationCode: value });
                    }}
                    placeholder="Nhập mã code"
                  />
                </div>
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
