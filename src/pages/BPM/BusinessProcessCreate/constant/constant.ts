// đây là dùng cho các node mà có thể thay đổi nhiều dạng và có chứa Event Definition con bên trong
export const eventDefinitionHandlers = {
    "bpmn:TimerEventDefinition": {
      StartEvent: "bpmn:TimeStartEvent",
      IntermediateCatchEvent: "bpmn:TimerIntermediateCatchEvent",
    },
    "bpmn:MessageEventDefinition": {
      StartEvent: "bpmn:StartMessageEvent",
      EndEvent: "bpmn:EndMessageEvent",
      IntermediateCatchEvent: "bpmn:MessageIntermediateCatchEvent",
      IntermediateThrowEvent: "bpmn:MessageIntermediateThrowEvent",
    },
    "bpmn:SignalEventDefinition": {
      StartEvent: "bpmn:SignalStartEvent",
      EndEvent: "bpmn:SignalEndEvent",
      IntermediateCatchEvent: "bpmn:SignalIntermediateCatchEvent",
      IntermediateThrowEvent: "bpmn:SignalIntermediateThrowEvent",
    },
    "bpmn:ConditionalEventDefinition": {
      StartEvent: "bpmn:ConditionalStartEvent",
      IntermediateCatchEvent: "bpmn:ConditionalIntermediateCatchEvent",
    },
    "bpmn:EscalationEventDefinition": {
      StartEvent: "bpmn:EscalationStartEvent",
      EndEvent: "bpmn:EscalationEndEvent",
      IntermediateThrowEvent: "bpmn:EscalationIntermediateThrowEvent",
    },
    "bpmn:ErrorEventDefinition": {
      StartEvent: "bpmn:ErrorStartEvent",
      EndEvent: "bpmn:ErrorEndEvent",
    },
    "bpmn:CompensateEventDefinition": {
      StartEvent: "bpmn:CompensationStartEvent",
      EndEvent: "bpmn:CompensationEndEvent",
      IntermediateThrowEvent: "CompensationIntermediateThrowEvent",
    },
    "bpmn:TerminateEventDefinition": {
      EndEvent: "bpmn:TerminateEndEvent",
    },
    "bpmn:LinkEventDefinition": {
      IntermediateCatchEvent: "bpmn:LinkCatchEvent",
      IntermediateThrowEvent: "bpmn:LinkThrowEvent",
    }
  };

//đây là để gắn loại node khi lưu xuống đối với các node mà có nhiều loại khác
export const EVENT_TYPE_MAP = {
    "bpmn:IntermediateCatchEvent": {
      "bpmn:ConditionalEventDefinition": "bpmn:ConditionalCatchEvent",
      "bpmn:MessageEventDefinition": "bpmn:MessageIntermediateCatchEvent",
      "bpmn:EscalationEventDefinition": "bpmn:EscalationIntermediateCatchEvent",
      "bpmn:TimerEventDefinition": "bpmn:TimerIntermediateCatchEvent",
      "bpmn:SignalEventDefinition": "bpmn:SignalIntermediateCatchEvent"
    },
    "bpmn:IntermediateThrowEvent": {
      "bpmn:MessageEventDefinition": "bpmn:MessageIntermediateThrowEvent",
      "bpmn:EscalationEventDefinition": "bpmn:EscalationIntermediateThrowEvent",
      "bpmn:CompensateEventDefinition": "bpmn:CompensationIntermediateThrowEvent",
      "bpmn:SignalEventDefinition": "bpmn:SignalIntermediateThrowEvent"
    },
    "bpmn:StartEvent": {
      "bpmn:MessageEventDefinition": "bpmn:MessageStartEvent",
      "bpmn:SignalEventDefinition": "bpmn:SignalStartEvent",
      "bpmn:ConditionalEventDefinition": "bpmn:ConditionalStartEvent",
      "bpmn:EscalationEventDefinition": "bpmn:EscalationStartEvent",
      "bpmn:TimerEventDefinition": "bpmn:TimerStartEvent",
      "bpmn:ErrorEventDefinition": "bpmn:ErrorStartEvent",
      "bpmn:CompensateEventDefinition": "bpmn:CompensationStartEvent"
    },
    "bpmn:EndEvent": {
      "bpmn:MessageEventDefinition": "bpmn:MessageEndEvent",
      "bpmn:CompensateEventDefinition": "bpmn:CompensationEndEvent",
      "bpmn:SignalEventDefinition": "bpmn:SignalEndEvent",
      "bpmn:EscalationEventDefinition": "bpmn:EscalationEndEvent",
      "bpmn:ErrorEventDefinition": "bpmn:ErrorEndEvent",
      "bpmn:TerminateEventDefinition": "bpmn:TerminateEndEvent"
    },
    "bpmn:BoundaryEvent": {
      "bpmn:CompensateEventDefinition": "bpmn:CompensationBoundaryEvent"
    }
  };

// đây để check loại node nào thì sẽ được lưu xuống khi kéo vào
export const checkType = (type) => {
    switch (type) {
      case "bpmn:Association":
        return false;
      case "bpmn:BusinessRuleTask":
        return true;
      case "bpmn:CallActivity":
        return true;
      case "bpmn:ComplexGateway":
        return true;
      case "bpmn:DataInputAssociation":
        return false;
      case "bpmn:DataObjectReference":
        return true;
      case "bpmn:DataStoreReference":
        return true;
      case "bpmn:EndEvent":
        return true;
      case "bpmn:ExclusiveGateway":
        return true;
      case "bpmn:Group":
        return false;
      case "bpmn:InclusiveGateway":
        return true;
      case "bpmn:IntermediateThrowEvent":
        return true;
      case "bpmn:IntermediateCatchEvent":
        return true;
      case "bpmn:Lane":
        return false;
      case "bpmn:ManualTask":
        return true;
      case "bpmn:ParallelGateway":
        return true;
      case "bpmn:Participant":
        return false;
      case "bpmn:ReceiveTask":
        return true;
      case "bpmn:ScriptTask":
        return true;
      case "bpmn:SendTask":
        return true;
      // case "bpmn:SequenceFlow":
      //   return true;
      case "bpmn:ServiceTask":
        return true;
      case "bpmn:StartEvent":
        return true;
      case "bpmn:SubProcess":
        return true;
      case "bpmn:Task":
        return true;
      case "bpmn:TextAnnotation":
        return false;
      case "bpmn:Transaction":
        return false;
      case "bpmn:UserTask":
        return true;
      case "label":
        return false;
      default:
        return true;
    }
  };