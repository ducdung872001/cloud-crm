import React, { useState } from "react";
import ModalBusinessRuleTask from "../partials/ModalBusinessRuleTask";
import ModalCallActivityTask from "../partials/ModalCallActivityTask";
import ModalCompensationEndEvent from "../partials/ModalCompensationEndEvent";
import ModalCompensationIntermediateThrowEvent from "../partials/ModalCompensationIntermediateThrowEvent";
import ModalCompensationStartEvent from "../partials/ModalCompensationStartEvent";
import ModalComplexGateway from "../partials/ModalComplexGateway";
import ModalConditionalIntermediateCatchEvent from "../partials/ModalConditionalIntermediateCatchEvent";
import ModalConditionalStartEvent from "../partials/ModalConditionalStartEvent/ModalConditionalStartEvent";
import ModalEndEvent from "../partials/ModalEndEvent";
import ModalEndMessageEvent from "../partials/ModalEndMessageEvent";
import ModalErrorEndEvent from "../partials/ModalErrorEndEvent";
import ModalErrorStartEvent from "../partials/ModalErrorStartEvent";
import ModalEscalationEndEvent from "../partials/ModalEscalationEndEvent";
import ModalEscalationIntermediateThrowEvent from "../partials/ModalEscalationIntermediateThrowEvent";
import ModalEscalationStartEvent from "../partials/ModalEscalationStartEvent";
import ModalExclusiveGateway from "../partials/ModalExclusiveGateway";
import ModalInclusiveGateway from "../partials/ModalInclusiveGateway";
import ModalLinkCatchEvent from "../partials/ModalLinkCatchEvent/ModalLinkCatchEvent";
import ModalLinkThrowEvent from "../partials/ModalLinkThrowEvent/ModalLinkThrowEvent";
import ModalManualTask from "../partials/ModalManualTask";
import ModalMessageIntermediateCatchEvent from "../partials/ModalMessageIntermediateCatchEvent";
import ModalMessageIntermediateThrowEvent from "../partials/ModalMessageIntermediateThrowEvent";
import ModalParallelGatewayTask from "../partials/ModalParallelGateway";
import ModalReceiveTask from "../partials/ModalReceiveTask";
import ModalScriptTask from "../partials/ModalScriptTask";
import ModalSendTask from "../partials/ModalSendTask";
import ModalSequenceFlow from "../partials/ModalSequenceFlow";
import ModalServiceTask from "../partials/ModalServiceTask";
import ModalSignalEndEvent from "../partials/ModalSignalEndEvent/ModalSignalEndEvent";
import ModalSignalIntermediateCatchEvent from "../partials/ModalSignalIntermediateCatchEvent";
import ModalSignalIntermediateThrowEvent from "../partials/ModalSignalIntermediateThrowEvent";
import ModalSignalStartEvent from "../partials/ModalSignalStartEvent/ModalSignalStartEvent";
import ModalStartEvent from "../partials/ModalStartEvent";
import ModalStartMessageEvent from "../partials/ModalStartMessageEvent";
import ModalSubprocess from "../partials/ModalSubprocess";
import ModalTerminateEndEvent from "../partials/ModalTerminateEndEvent";
import ModalTimerIntermediateCatchEvent from "../partials/ModalTimerIntermediateCatchEvent";
import ModalTimerStartEventTask from "../partials/ModalTimerStartEventTask/ModalTimerStartEventTask";
import ModalUserTask from "../partials/ModalUserTask";

// Import tất cả modal
const modalMap = {
  "bpmn:UserTask": ModalUserTask,
  "bpmn:ServiceTask": ModalServiceTask,
  "bpmn:ScriptTask": ModalScriptTask,
  "bpmn:ManualTask": ModalManualTask,
  "bpmn:StartEvent": ModalStartEvent,
  "bpmn:EndEvent": ModalEndEvent,
  "bpmn:ErrorEndEvent": ModalErrorEndEvent,
  "bpmn:ErrorStartEvent": ModalErrorStartEvent,
  "bpmn:BusinessRuleTask": ModalBusinessRuleTask,
  "bpmn:SendTask": ModalSendTask,
  "bpmn:ReceiveTask": ModalReceiveTask,
  "bpmn:MessageIntermediateThrowEvent": ModalMessageIntermediateThrowEvent,
  "bpmn:MessageIntermediateCatchEvent": ModalMessageIntermediateCatchEvent,
  "bpmn:CallActivity": ModalCallActivityTask,
  "bpmn:ParallelGateway": ModalParallelGatewayTask,
  "bpmn:ExclusiveGateway": ModalExclusiveGateway,
  "bpmn:InclusiveGateway": ModalInclusiveGateway,
  "bpmn:ComplexGateway": ModalComplexGateway,
  "bpmn:SubProcess": ModalSubprocess,
  "bpmn:SequenceFlow": ModalSequenceFlow,
  "bpmn:TimeStartEvent": ModalTimerStartEventTask,
  "bpmn:ConditionalIntermediateCatchEvent": ModalConditionalIntermediateCatchEvent,
  "bpmn:LinkCatchEvent": ModalLinkCatchEvent,
  "bpmn:LinkThrowEvent": ModalLinkThrowEvent,
  "bpmn:EscalationStartEvent": ModalEscalationStartEvent,
  "bpmn:EscalationEndEvent": ModalEscalationEndEvent,
  "bpmn:StartMessageEvent": ModalStartMessageEvent,
  "bpmn:EndMessageEvent": ModalEndMessageEvent,
  "bpmn:SignalStartEvent": ModalSignalStartEvent,
  "bpmn:SignalEndEvent": ModalSignalEndEvent,
  "bpmn:EscalationIntermediateThrowEvent": ModalEscalationIntermediateThrowEvent,
  "bpmn:CompensationIntermediateThrowEvent": ModalCompensationIntermediateThrowEvent,
  "bpmn:CompensationStartEvent": ModalCompensationStartEvent,
  "bpmn:CompensationEndEvent": ModalCompensationEndEvent,
  "bpmn:TimerIntermediateCatchEvent": ModalTimerIntermediateCatchEvent,
  "bpmn:ConditionalStartEvent": ModalConditionalStartEvent,
  "bpmn:SignalIntermediateThrowEvent": ModalSignalIntermediateThrowEvent,
  "bpmn:SignalIntermediateCatchEvent": ModalSignalIntermediateCatchEvent,
  "bpmn:TerminateEndEvent": ModalTerminateEndEvent,
};

export default function BpmnModals({
  activeModal,
  dataNode,
  processId,
  clearModalNode,
  changeNameNodeXML,
  setDataNode,
}) {
  const ModalComponent = modalMap[activeModal];  

  // Nếu có modal tương ứng
  if (ModalComponent) {
    return (
      <ModalComponent
        onShow={true}
        dataNode={dataNode}
        processId={processId}
        disable={false}
        onHide={(reload) => {
          clearModalNode();
        }}
        changeNameNodeXML={changeNameNodeXML}
        setDataNode={setDataNode}
      />
    );
  }

  return null;
}
