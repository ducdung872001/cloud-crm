import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.list, params, signal);
  },

  clone: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.clone, body);
  },

  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.update, body);
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.businessProcess.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.businessProcess.delete}?id=${id}`);
  },

  addNode: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.addNode, body);
  },

  deleteNode: (id: number) => {
    return apiDelete(`${urlsApi.businessProcess.deleteNode}?nodeId=${id}`);
  },

  updateLinkNode: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateLinkNode, body);
  },

  //bpm
  //lấy danh sách các bước
  listStep: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listStep, params, signal);
  },
  updateStep: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateStep, body);
  },
  deleteStep: (id: number) => {
    return apiDelete(`${urlsApi.businessProcess.deleteStep}?id=${id}`);
  },

  //update SLA
  updateSLA: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateSLA, body);
  },

  //Lấy danh sách công việc trong quy trình
  listWorkFlow: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listWorkflow, params, signal);
  },
  //Lấy danh sách công việc trong quy trình
  listWorkflowCloud: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listWorkflowCloud, params, signal);
  },
  deleteWorkFlow: (id: number) => {
    return apiDelete(`${urlsApi.businessProcess.deleteWorkflow}?id=${id}`);
  },

  //lấy về danh sách biến quy trình
  listVariableDeclare: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listVariableDeclare, params, signal);
  },

  //lấy về giá trị biến quy trình
  listVariableInstance: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listVariableInstance, params, signal);
  },

  //lấy về danh sách toàn bộ biến quy trình
  listVariableDeclareGlobal: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listVariableDeclareGlobal, params, signal);
  },

  updateVariableDeclare: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateVariableDeclare, body);
  },

  detailVariableDeclare: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailVariableDeclare}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteVariableDeclare: (id: number) => {
    return apiDelete(`${urlsApi.businessProcess.deleteVariableDeclare}?id=${id}`);
  },
  //add node
  bpmAddNode: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.bpmAddNode, body);
  },
  bpmAddNameNode: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.bpmAddNameNode, body);
  },
  bpmDeleteNode: (id: number) => {
    return apiDelete(`${urlsApi.businessProcess.bpmDeleteNode}?nodeId=${id}`);
  },

  bpmDetailNode: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.bpmDetailNode}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //list node
  bpmListNode: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.bpmListNode, params, signal);
  },

  //add link node
  bpmAddLinkNode: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.bpmAddLinkNode, body);
  },
  bpmAddNameLinkNode: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.bpmAddNameLinkNode, body);
  },
  bpmAddLinkNodeConfig: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.bpmAddLinkNodeConfig, body);
  },

  bpmDeleteLinkNode: (params) => {
    return apiDelete(`${urlsApi.businessProcess.bpmDeleteLinkNode}${convertParamsToString(params)}`);
  },

  bpmGetLinkNode: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.bpmGetLinkNode, params, signal);
  },

  //lưu toàn bộ sợ đồ
  saveDiagram: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.saveDiagram, body);
  },
  //get dữ liệu đã lưu
  getDetailDiagram: (id: number) => {
    return fetch(`${urlsApi.businessProcess.getDetailDiagram}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //user task
  updateUserTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateUserTask, body);
  },
  detailUserTask: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailUserTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneUserTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneUserTask, body);
  },
  // clone mapping
  cloneFormMapping: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.cloneFormMapping, params, signal);
  },

  //list trường trong form
  listBpmForm: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listBpmForm, params, signal);
  },

  //list toàn bộ trường trong form
  listBpmFormGlobal: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listBpmFormGlobal, params, signal);
  },

  //lấy list giá trị của form trong quy trình
  listBpmFormData: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listBpmFormData, params, signal);
  },

  //lấy cụ thể giá trị của form trong quy trình
  getBpmFormDataByNodeId: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.getBpmFormDataByNodeId, params, signal);
  },

  //list trường trong form để sao chép mapping
  listBpmFormMapping: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listBpmFormMapping, params, signal);
  },

  //service task
  updateServiceTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateServiceTask, body);
  },
  detailServiceTask: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailServiceTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneServiceTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneServiceTask, body);
  },

  //Script task
  updateScriptTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateScriptTask, body);
  },
  detailScriptTask: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailScriptTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneScriptTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneScriptTask, body);
  },

  //Manual task
  updateManualTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateManualTask, body);
  },
  detailManualTask: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailManualTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneManualTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneManualTask, body);
  },

  //business rule task
  updateBusinessRuleTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateBusinessRuleTask, body);
  },
  updateBusinessRuleTaskAdvance: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateBusinessRuleTaskAdvance, body);
  },
  updateBusinessRuleTaskComplex: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateBusinessRuleTaskComplex, body);
  },

  detailBusinessRuleTask: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailBusinessRuleTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  detailBusinessRuleTaskAdvance: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.businessProcess.detailBusinessRuleTaskAdvance, params);
  },
  detailBusinessRuleTaskComplex: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailBusinessRuleTaskComplex}?nodeId=${id}&type=DT`, {
      method: "GET",
    }).then((res) => res.json());
  },

  cloneBusinessRuleTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneBusinessRuleTask, body);
  },
  checkType: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.checkType}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  checkTypeOLA: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.businessProcess.checkTypeOLA, params);
  },

  updatePickMode: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updatePickMode, body);
  },

  //send task
  updateSendTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateSendTask, body);
  },
  detailSendTask: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailSendTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSendTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneSendTask, body);
  },

  //Message Intermediate Throw Event
  updateMessageIntermediateThrowEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateMessageIntermediateThrowEvent, body);
  },
  detailMessageIntermediateThrowEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailMessageIntermediateThrowEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneMessageIntermediateThrowEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneMessageIntermediateThrowEvent, body);
  },

  //Message Intermediate Catch Event
  updateMessageIntermediateCatchEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateMessageIntermediateCatchEvent, body);
  },
  detailMessageIntermediateCatchEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailMessageIntermediateCatchEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneMessageIntermediateCatchEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneMessageIntermediateCatchEvent, body);
  },

  //receive task
  updateReceiveTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateReceiveTask, body);
  },
  detailReceiveTask: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailReceiveTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneReceiveTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneReceiveTask, body);
  },

  //call activity
  updateCallActivityTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateCallActivityTask, body);
  },
  detailCallActivityTask: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailCallActivityTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneCallActivityTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneCallActivityTask, body);
  },

  //parallel gateway
  updateParallelGateway: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateParallelGateway, body);
  },
  detailParallelGateway: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailParallelGateway}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneParallelGateway: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneParallelGateway, body);
  },

  //exclusive gateway
  updateExclusiveGateway: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateExclusiveGateway, body);
  },
  detailExclusiveGateway: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailExclusiveGateway}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneExclusiveGateway: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneExclusiveGateway, body);
  },

  //inclusive gateway
  updateInclusiveGateway: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateInclusiveGateway, body);
  },
  detailInclusiveGateway: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailInclusiveGateway}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneInclusiveGateway: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneInclusiveGateway, body);
  },

  //complex gateway
  updateComplexGateway: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateComplexGateway, body);
  },
  detailComplexGateway: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailComplexGateway}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneComplexGateway: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneComplexGateway, body);
  },

  //subprocess
  updateSubprocess: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateSubprocess, body);
  },
  detailSubprocess: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailSubprocess}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSubprocess: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneSubprocess, body);
  },

  //timer start event
  updateTimerStartEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateTimerStartEvent, body);
  },
  detailTimerStartEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailTimerStartEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneTimerStartEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneTimerStartEvent, body);
  },

  //timer intermediate catch event
  updateTimerIntermediateCatchEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateTimerIntermediateCatchEvent, body);
  },
  detailTimerIntermediateCatchEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailTimerIntermediateCatchEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneTimerIntermediateCatchEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneTimerIntermediateCatchEvent, body);
  },

  //start event
  updateStartTaskEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateStartTaskEvent, body);
  },
  detailStartTaskEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailStartTaskEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneStartTaskEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneStartTaskEvent, body);
  },
  //start message event
  updateStartMessageEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateStartMessageEvent, body);
  },
  detailStartMessageEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailStartMessageEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneStartMessageEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneStartMessageEvent, body);
  },
  //end event
  updateEndTaskEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateEndTaskEvent, body);
  },
  detailEndTaskEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailEndTaskEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneEndTaskEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneEndTaskEvent, body);
  },
  //end message event
  updateEndMessageEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateEndMessageEvent, body);
  },
  detailEndMessageEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailEndMessageEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneEndMessageEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneEndMessageEvent, body);
  },

  //Escalation intermediate throw event
  updateEscalationIntermediateThrowEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateEscalationIntermediateThrowEvent, body);
  },
  detailEscalationIntermediateThrowEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailEscalationIntermediateThrowEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneEscalationIntermediateThrowEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneEscalationIntermediateThrowEvent, body);
  },
  //Escalation end event

  updateEscalationEndEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateEscalationIntermediateThrowEvent, body);
  },
  detailEscalationEndEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailEscalationIntermediateThrowEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneEscalationEndEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneEscalationIntermediateThrowEvent, body);
  },

  //Escalation start event
  updateEscalationStartEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateEscalationStartEvent, body);
  },
  detailEscalationStartEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailEscalationStartEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneEscalationStartEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneEscalationStartEvent, body);
  },

  //Conditional Catch Intermediate
  updateConditionalCatchEventTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateConditionalCatchEventTask, body);
  },
  detailConditionalCatchEventTask: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailConditionalCatchEventTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //signal start event
  updateSignalStartEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateSignalStartEvent, body);
  },
  detailSignalStartEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailSignalStartEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSignalStartEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneSignalStartEvent, body);
  },

  //signal end event
  updateSignalEndEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateSignalEndEvent, body);
  },
  detailSignalEndEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailSignalEndEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSignalEndEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneSignalEndEvent, body);
  },

  //signal intermediate throw event
  updateSignalIntermediateThrowEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateSignalIntermediateThrowEvent, body);
  },
  detailSignalIntermediateThrowEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailSignalIntermediateThrowEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSignalIntermediateThrowEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneSignalIntermediateThrowEvent, body);
  },

  //signal intermediate catch event
  updateSignalIntermediateCatchEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateSignalIntermediateCatchEvent, body);
  },
  detailSignalIntermediateCatchEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailSignalIntermediateCatchEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSignalIntermediateCatchEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneSignalIntermediateCatchEvent, body);
  },

  //conditional start event
  updateConditionalStartEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateConditionalStartEvent, body);
  },
  detailConditionalStartEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailConditionalStartEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //compensation Intermediate throw event
  updateCompensationIntermediateThrowEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateCompensationIntermediateThrowEvent, body);
  },
  detailCompensationIntermediateThrowEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailCompensationIntermediateThrowEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneCompensationIntermediateThrowEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneCompensationIntermediateThrowEvent, body);
  },
  listCompensationRef: (processId: string | number) => {
    return fetch(`${urlsApi.businessProcess.getCompensationRef}?processId=${processId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //Compensation End Event
  updateCompensationEndEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateCompensationEndEvent, body);
  },
  detailCompensationEndEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailCompensationEndEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneCompensationEndEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneCompensationEndEvent, body);
  },

  //Terminate End Event
  updateTerminateEndEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateTerminateEndEvent, body);
  },
  detailTerminateEndEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailTerminateEndEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneTerminateEndEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneTerminateEndEvent, body);
  },

  //Error end event
  updateErrorEndEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateErrorEndEvent, body);
  },
  detailErrorEndEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailErrorEndEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneErrorEndEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneErrorEndEvent, body);
  },

  // error start event
  updateErrorStartEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateErrorStartEvent, body);
  },
  detailErrorStartEvent: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailErrorStartEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneErrorStartEvent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.cloneErrorStartEvent, body);
  },

  //Link Catch Intermediate
  updateLinkCatchEventTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateLinkCatchEventTask, body);
  },
  detailLinkCatchEventTask: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.detailLinkCatchEventTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //bpm participant
  updateBpmParticipant: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateBpmParticipant, body);
  },

  detailBpmParticipant: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.getBpmParticipant}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy về danh sách luồng tới
  listLinkTo: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listLinkTo, params, signal);
  },

  //lấy về danh sách luồng ra
  listLinkFrom: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listLinkForm, params, signal);
  },

  //handle task
  updateHandleTask: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateHandleTask, body);
  },

  //handle task init
  updateHandleTaskInit: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateHandleTaskInit, body);
  },

  //handle task draff
  updateHandleTaskDraft: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateHandleTaskDraft, body);
  },

  //tạo ycms
  purchaseRequestApprove: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.purchaseRequestApprove, body);
  },

  //tạo ycms draff
  purchaseRequestDraft: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.purchaseRequestDraft, body);
  },

  //lấy về dữ liệu khởi tạo của form xử lý task
  getDataForm: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.getDataForm, params, signal);
  },

  //lấy về lịch sử đối tượng trong quy trình
  getProcessedObjectLog: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.getProcessedObjectLog, params, signal);
  },

  //Mô phỏng quy trình
  listBpmTrigger: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listBpmTrigger, params, signal);
  },

  activeBpmTrigger: (id: string | number) => {
    return fetch(`${urlsApi.businessProcess.activeBpmTrigger}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //lịch sử xử lý
  processedObjectLog: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.processedObjectLog, params, signal);
  },
  //lịch sử xử lý
  processedObjectLogPage: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.processedObjectLogPage, params, signal);
  },

  //OLA, SLA
  updateServiceLevel: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateServiceLevel, body);
  },

  listServiceLevel: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listServiceLevel, params, signal);
  },

  updateHistoryOLA: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateHistoryOLA, body);
  },

  listHistoryOLA: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listHistoryOLA, params, signal);
  },

  //Tiếp nhận xử lý
  receiveProcessedObjectLog: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.receiveProcessedObjectLog, body);
  },

  //Tạm dừng xử lý
  onholdProcessedObjectLog: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.onholdProcessedObjectLog, body);
  },

  //Tiếp tục xử lý
  onContinue: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.onContinue, params, signal);
  },

  // Thu hồi công việc:
  // Lấy trạng thái công việc
  onWorkRecall: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.onWorkRecall, params, signal);
  },
  onPollCheckResult: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.onCheckWorkResult, params, signal);
  },
  // Xác nhận thu hồi công việc
  onConfirmRecall: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.confirmWorkRecall, params, signal);
  },
  //lấy về các node của một quy trình để debug
  debugListNodeProcess: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.debugListNodeProcess, params, signal);
  },

  //lấy về các node start của một quy trình để debug
  debugListNodeStartProcess: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.debugListNodeStartProcess, params, signal);
  },

  //lấy về các link của một quy trình để debug
  debugListLinkNodeProcess: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.debugListLinkNodeProcess, params, signal);
  },

  //lấy danh sách bước (node) để từ chối rồi quay lại
  listNodeHistory: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listNodeHistory, params, signal);
  },

  //thêm cột trong grid
  AddArtifactGrid: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.addArtifactGrid, body);
  },
  detailArtifactGrid: (id: number) => {
    return fetch(`${urlsApi.businessProcess.getArtifactGrid}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //Timer
  updateTimer: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateTimer, body);
  },

  //type user task
  updateType: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateType, body);
  },

  // getTimer: (id: number) => {
  //   return fetch(`${urlsApi.businessProcess.getTimer}?nodeId=${id}`, {
  //     method: "GET",
  //   }).then((res) => res.json());
  // },

  //Thêm artifact vào list để cấu hình
  updateArtifactMetadata: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateArtifactMetadata, body);
  },

  listArtifactMetadata: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listArtifactMetadata, params, signal);
  },

  getArtifactMetadata: (id: number) => {
    return fetch(`${urlsApi.businessProcess.getArtifactMetadata}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  deleteArtifactMetadata: (nodeId, fieldName) => {
    return apiDelete(`${urlsApi.businessProcess.deleteArtifactMetadata}?nodeId=${nodeId}&fieldName=${fieldName}`);
  },

  //thêm cấu trúc hồ sơ
  updateBpmObject: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateBpmObject, body);
  },

  detailBpmObject: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.detailBpmObject, params, signal);
  },

  onGetErrorLog: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.getErrorLogData, params, signal);
  },

  //export data process
  exportDataProcess: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.exportDataProcess, body);
  },

  //api lấy về link url để tải file
  getUrlExportDataProcess: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.getUrlExportDataProcess, params, signal);
  },

  //import data process
  importDataProcess: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.importDataProcess, body);
  },

  // state
  listStates: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessProcess.listState, params, signal);
  },

  createState: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.createState, body);
  },

  updateState: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessProcess.updateState, body);
  },

  deleteState: (id: number) => {
    return apiDelete(`${urlsApi.businessProcess.deleteState}?id=${id}`);
  },
};
