import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId } from "reborn-util";
import ContractEformService from "services/ContractEformService";
import { showToast } from "utils/common";
import "./index.scss";
import BusinessProcessService from "services/BusinessProcessService";

export default function ModalSelectNodeOther({ onShow, onHide, data, processId }) {
  const formRef = useRef(null);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataNode, setDataNode] = useState(null);

  //   const values = useMemo(
  //     () => ({
  //       eformId: null,
  //     }),
  //     [onShow, dataForm]
  //   );

  //   const [formData, setFormData] = useState(values);

  //   useEffect(() => {
  //     setFormData(values);

  //     return () => {
  //       setIsSubmit(false);
  //     };
  //   }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!dataNode) {
      showToast("Vui lòng chọn biểu mẫu", "warning");
      return;
    }

    const body = {
      nodeId: data?.id,
      fromNodeId: dataNode.value,
    };

    let response = null;

    if (data?.type === "bpmn:UserTask") {
      response = await BusinessProcessService.cloneUserTask(body);
    }

    if (data?.type === "bpmn:ServiceTask") {
      response = await BusinessProcessService.cloneServiceTask(body);
    }
    if (data?.type === "bpmn:SendTask") {
      response = await BusinessProcessService.cloneSendTask(body);
    }
    if (data?.type === "bpmn:IntermediateThrowEvent" && data.businessObject.eventDefinitions[0].$type === "bpmn:MessageEventDefinition") {
      response = await BusinessProcessService.cloneMessageIntermediateThrowEvent(body);
    }
    if (data?.type === "bpmn:IntermediateThrowEvent" && data.businessObject.eventDefinitions[0].$type === "bpmn:EscalationEventDefinition") {
      response = await BusinessProcessService.cloneEscalationIntermediateThrowEvent(body);
    }
    if (data?.type === "bpmn:IntermediateThrowEvent" && data.businessObject.eventDefinitions[0].$type === "bpmn:CompensateEventDefinition") {
      response = await BusinessProcessService.cloneCompensationIntermediateThrowEvent(body);
    }
    if (data?.type === "bpmn:IntermediateThrowEvent" && data.businessObject.eventDefinitions[0].$type === "bpmn:SignalEventDefinition") {
      response = await BusinessProcessService.cloneSignalIntermediateThrowEvent(body);
    }
    if (data?.type === "bpmn:IntermediateCatchEvent" && data.businessObject.eventDefinitions[0].$type === "bpmn:MessageEventDefinition") {
      response = await BusinessProcessService.cloneMessageIntermediateCatchEvent(body);
    }
    if (data?.type === "bpmn:IntermediateCatchEvent" && data.businessObject.eventDefinitions[0].$type === "bpmn:TimerEventDefinition") {
      response = await BusinessProcessService.cloneTimerIntermediateCatchEvent(body);
    }
    if (data?.type === "bpmn:IntermediateCatchEvent" && data.businessObject.eventDefinitions[0].$type === "bpmn:SignalEventDefinition") {
      response = await BusinessProcessService.cloneSignalIntermediateCatchEvent(body);
    }
    if (data?.type === "bpmn:ReceiveTask") {
      response = await BusinessProcessService.cloneReceiveTask(body);
    }
    if (data?.type === "bpmn:ScriptTask") {
      response = await BusinessProcessService.cloneScriptTask(body);
    }
    if (data?.type === "bpmn:ManualTask") {
      response = await BusinessProcessService.cloneManualTask(body);
    }
    if (data?.type === "bpmn:BusinessRuleTask") {
      response = await BusinessProcessService.cloneBusinessRuleTask(body);
    }
    if (data?.type === "bpmn:CallActivity") {
      response = await BusinessProcessService.cloneCallActivityTask(body);
    }
    if (data?.type === "bpmn:ParallelGateway") {
      response = await BusinessProcessService.cloneParallelGateway(body);
    }
    if (data?.type === "bpmn:ExclusiveGateway") {
      response = await BusinessProcessService.cloneExclusiveGateway(body);
    }
    if (data?.type === "bpmn:InclusiveGateway") {
      response = await BusinessProcessService.cloneInclusiveGateway(body);
    }
    if (data?.type === "bpmn:ComplexGateway") {
      response = await BusinessProcessService.cloneComplexGateway(body);
    }
    if (data?.type === "bpmn:SubProcess") {
      response = await BusinessProcessService.cloneSubprocess(body);
    }
    if (data.type === "bpmn:StartEvent") {
      if (data.businessObject.eventDefinitions[0].$type === "bpmn:TimerEventDefinition") {
        response = await BusinessProcessService.cloneTimerStartEvent(body);
      } else if (data.businessObject.eventDefinitions[0].$type === "bpmn:MessageEventDefinition") {
        response = await BusinessProcessService.cloneStartMessageEvent(body);
      } else if (data.businessObject.eventDefinitions[0]?.$type === "bpmn:SignalEventDefinition") {
        response = await BusinessProcessService.cloneSignalStartEvent(body);
      } else if (data.businessObject.eventDefinitions[0].$type === "bpmn:EscalationEventDefinition") {
        response = await BusinessProcessService.cloneEscalationStartEvent(body);
      } else if (data.businessObject.eventDefinitions[0].$type === "bpmn:ErrorEventDefinition") {
        response = await BusinessProcessService.cloneErrorStartEvent(body);
      }
    }
    if (data?.type === "bpmn:EndEvent") {
      if (data.businessObject.eventDefinitions[0].$type === "bpmn:MessageEventDefinition") {
        response = await BusinessProcessService.cloneEndMessageEvent(body);
      } else if (data.businessObject.eventDefinitions[0]?.$type === "bpmn:SignalEventDefinition") {
        response = await BusinessProcessService.cloneSignalEndEvent(body);
      } else if (data.businessObject.eventDefinitions[0].$type === "bpmn:CompensateEventDefinition") {
        response = await BusinessProcessService.cloneCompensationEndEvent(body);
      } else if (data.businessObject.eventDefinitions[0].$type === "bpmn:EscalationEventDefinition") {
        response = await BusinessProcessService.cloneEscalationEndEvent(body);
      } else if (data.businessObject.eventDefinitions[0].$type === "bpmn:ErrorEventDefinition") {
        response = await BusinessProcessService.cloneErrorEndEvent(body);
      } else if (data.businessObject.eventDefinitions[0].$type === "bpmn:TerminateEventDefinition") {
        response = await BusinessProcessService.cloneTerminateEndEvent(body);
      }
    }
    if (response?.code === 0) {
      showToast("Sao chép nhiệm vụ thành công", "success");
      handleClear(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
              //   !isDifferenceObj(formData, values) ? handleClear(false) : showDialogConfirmCancel();
              handleClear(false);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            // || !isDifferenceObj(formData, values),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [
      // formData, values,
      isSubmit,
      dataNode,
    ]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataNode ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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

  const loadedOptionListNode = async (search, loadedOptions, { page }) => {
    let params = {
      name: search,
      page: page,
      limit: 10,
      processId: processId,
      typeNode: data?.type,
    };
    if (data?.type === "bpmn:IntermediateThrowEvent" && data.businessObject.eventDefinitions[0].$type === "bpmn:MessageEventDefinition") {
      params = { ...params, typeNode: "bpmn:MessageIntermediateThrowEvent" };
    }
    if (data?.type === "bpmn:IntermediateCatchEvent" && data.businessObject.eventDefinitions[0].$type === "bpmn:MessageEventDefinition") {
      params = { ...params, typeNode: "bpmn:MessageIntermediateCatchEvent" };
    }
    const response = await BusinessProcessService.bpmListNode(params);

    if (response.code === 0) {
      const dataOption = response.result?.items;
      const newOption = dataOption.filter((el) => el.name);

      return {
        options: [
          ...(newOption.length > 0
            ? newOption.map((item) => {
                return {
                  value: item.nodeId,
                  label: item.name,
                  //   config: item.config
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleClear = (acc) => {
    onHide(acc);
    setDataNode(null);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="lg"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-select-node-other"
      >
        <form className="form-select-node-other" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Sao chép nhiệm vụ đã có`} toggle={() => !isSubmit && handleClear(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  id="nodeId"
                  name="nodeId"
                  label={"Chọn nhiệm vụ"}
                  fill={true}
                  required={true}
                  // error={item.checkMapping}
                  // message="Biến quy trình không được để trống"
                  options={[]}
                  value={dataNode}
                  onChange={(e) => {
                    setDataNode(e);
                  }}
                  isAsyncPaginate={true}
                  placeholder={`Chọn nhiệm vụ`}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionListNode}
                  // formatOptionLabel={formatOptionLabelAttribute}
                />
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
