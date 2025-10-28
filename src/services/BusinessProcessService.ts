import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  clone: (body: any) => {
    return fetch(urlsApi.businessProcess.clone, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  update: (body: any) => {
    return fetch(urlsApi.businessProcess.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.businessProcess.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.businessProcess.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  addNode: (body: any) => {
    return fetch(urlsApi.businessProcess.addNode, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  deleteNode: (id: number) => {
    return fetch(`${urlsApi.businessProcess.deleteNode}?nodeId=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  updateLinkNode: (body: any) => {
    return fetch(urlsApi.businessProcess.updateLinkNode, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //bpm
  //lấy danh sách các bước
  listStep: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listStep}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateStep: (body: any) => {
    return fetch(urlsApi.businessProcess.updateStep, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteStep: (id: number) => {
    return fetch(`${urlsApi.businessProcess.deleteStep}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  //update SLA
  updateSLA: (body: any) => {
    return fetch(urlsApi.businessProcess.updateSLA, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Lấy danh sách công việc trong quy trình
  listWorkFlow: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listWorkflow}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  deleteWorkFlow: (id: number) => {
    return fetch(`${urlsApi.businessProcess.deleteWorkflow}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  //lấy về danh sách biến quy trình
  listVariableDeclare: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listVariableDeclare}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy về giá trị biến quy trình
  listVariableInstance: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listVariableInstance}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy về danh sách toàn bộ biến quy trình
  listVariableDeclareGlobal: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listVariableDeclareGlobal}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateVariableDeclare: (body: any) => {
    return fetch(urlsApi.businessProcess.updateVariableDeclare, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailVariableDeclare: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailVariableDeclare}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteVariableDeclare: (id: number) => {
    return fetch(`${urlsApi.businessProcess.deleteVariableDeclare}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //add node
  bpmAddNode: (body: any) => {
    return fetch(urlsApi.businessProcess.bpmAddNode, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  bpmAddNameNode: (body: any) => {
    return fetch(urlsApi.businessProcess.bpmAddNameNode, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  bpmDeleteNode: (id: number) => {
    return fetch(`${urlsApi.businessProcess.bpmDeleteNode}?nodeId=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  bpmDetailNode: (id: any) => {
    return fetch(`${urlsApi.businessProcess.bpmDetailNode}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //list node
  bpmListNode: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.bpmListNode}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //add link node
  bpmAddLinkNode: (body: any) => {
    return fetch(urlsApi.businessProcess.bpmAddLinkNode, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  bpmAddNameLinkNode: (body: any) => {
    return fetch(urlsApi.businessProcess.bpmAddNameLinkNode, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  bpmAddLinkNodeConfig: (body: any) => {
    return fetch(urlsApi.businessProcess.bpmAddLinkNodeConfig, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  bpmDeleteLinkNode: (params) => {
    return fetch(`${urlsApi.businessProcess.bpmDeleteLinkNode}${convertParamsToString(params)}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  bpmGetLinkNode: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.bpmGetLinkNode}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lưu toàn bộ sợ đồ
  saveDiagram: (body: any) => {
    return fetch(urlsApi.businessProcess.saveDiagram, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //get dữ liệu đã lưu
  getDetailDiagram: (id: number) => {
    return fetch(`${urlsApi.businessProcess.getDetailDiagram}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //user task
  updateUserTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateUserTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailUserTask: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailUserTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneUserTask: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneUserTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // clone mapping
  cloneFormMapping: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.cloneFormMapping}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //list trường trong form
  listBpmForm: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listBpmForm}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //list toàn bộ trường trong form
  listBpmFormGlobal: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listBpmFormGlobal}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy list giá trị của form trong quy trình
  listBpmFormData: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listBpmFormData}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy cụ thể giá trị của form trong quy trình
  getBpmFormDataByNodeId: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.getBpmFormDataByNodeId}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //list trường trong form để sao chép mapping
  listBpmFormMapping: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listBpmFormMapping}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //service task
  updateServiceTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateServiceTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailServiceTask: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailServiceTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneServiceTask: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneServiceTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Script task
  updateScriptTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateScriptTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailScriptTask: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailScriptTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneScriptTask: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneScriptTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Manual task
  updateManualTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateManualTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailManualTask: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailManualTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneManualTask: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneManualTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //business rule task
  updateBusinessRuleTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateBusinessRuleTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateBusinessRuleTaskAdvance: (body: any) => {
    return fetch(urlsApi.businessProcess.updateBusinessRuleTaskAdvance, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateBusinessRuleTaskComplex: (body: any) => {
    return fetch(urlsApi.businessProcess.updateBusinessRuleTaskComplex, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailBusinessRuleTask: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailBusinessRuleTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  detailBusinessRuleTaskAdvance: (params: any) => {
    return fetch(`${urlsApi.businessProcess.detailBusinessRuleTaskAdvance}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  detailBusinessRuleTaskComplex: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailBusinessRuleTaskComplex}?nodeId=${id}&type=DT`, {
      method: "GET",
    }).then((res) => res.json());
  },

  cloneBusinessRuleTask: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneBusinessRuleTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  checkType: (id: any) => {
    return fetch(`${urlsApi.businessProcess.checkType}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  checkTypeOLA: (params: any) => {
    console.log("PARMAS", params);
    return fetch(`${urlsApi.businessProcess.checkTypeOLA}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  updatePickMode: (body: any) => {
    return fetch(urlsApi.businessProcess.updatePickMode, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //send task
  updateSendTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateSendTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailSendTask: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailSendTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSendTask: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneSendTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Message Intermediate Throw Event
  updateMessageIntermediateThrowEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateMessageIntermediateThrowEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailMessageIntermediateThrowEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailMessageIntermediateThrowEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneMessageIntermediateThrowEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneMessageIntermediateThrowEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Message Intermediate Catch Event
  updateMessageIntermediateCatchEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateMessageIntermediateCatchEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailMessageIntermediateCatchEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailMessageIntermediateCatchEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneMessageIntermediateCatchEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneMessageIntermediateCatchEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //receive task
  updateReceiveTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateReceiveTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailReceiveTask: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailReceiveTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneReceiveTask: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneReceiveTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //call activity
  updateCallActivityTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateCallActivityTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailCallActivityTask: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailCallActivityTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneCallActivityTask: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneCallActivityTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //parallel gateway
  updateParallelGateway: (body: any) => {
    return fetch(urlsApi.businessProcess.updateParallelGateway, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailParallelGateway: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailParallelGateway}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneParallelGateway: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneParallelGateway, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //exclusive gateway
  updateExclusiveGateway: (body: any) => {
    return fetch(urlsApi.businessProcess.updateExclusiveGateway, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailExclusiveGateway: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailExclusiveGateway}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneExclusiveGateway: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneExclusiveGateway, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //inclusive gateway
  updateInclusiveGateway: (body: any) => {
    return fetch(urlsApi.businessProcess.updateInclusiveGateway, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailInclusiveGateway: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailInclusiveGateway}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneInclusiveGateway: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneInclusiveGateway, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //complex gateway
  updateComplexGateway: (body: any) => {
    return fetch(urlsApi.businessProcess.updateComplexGateway, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailComplexGateway: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailComplexGateway}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneComplexGateway: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneComplexGateway, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //subprocess
  updateSubprocess: (body: any) => {
    return fetch(urlsApi.businessProcess.updateSubprocess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailSubprocess: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailSubprocess}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSubprocess: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneSubprocess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //timer start event
  updateTimerStartEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateTimerStartEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailTimerStartEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailTimerStartEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneTimerStartEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneTimerStartEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //timer intermediate catch event
  updateTimerIntermediateCatchEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateTimerIntermediateCatchEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailTimerIntermediateCatchEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailTimerIntermediateCatchEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneTimerIntermediateCatchEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneTimerIntermediateCatchEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //start event
  updateStartTaskEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateStartTaskEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailStartTaskEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailStartTaskEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneStartTaskEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneStartTaskEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //start message event
  updateStartMessageEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateStartMessageEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailStartMessageEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailStartMessageEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneStartMessageEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneStartMessageEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //end event
  updateEndTaskEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateEndTaskEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailEndTaskEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailEndTaskEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneEndTaskEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneEndTaskEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //end message event
  updateEndMessageEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateEndMessageEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailEndMessageEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailEndMessageEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneEndMessageEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneEndMessageEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Escalation intermediate throw event
  updateEscalationIntermediateThrowEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateEscalationIntermediateThrowEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailEscalationIntermediateThrowEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailEscalationIntermediateThrowEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneEscalationIntermediateThrowEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneEscalationIntermediateThrowEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //Escalation end event

  updateEscalationEndEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateEscalationIntermediateThrowEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailEscalationEndEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailEscalationIntermediateThrowEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneEscalationEndEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneEscalationIntermediateThrowEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Escalation start event
  updateEscalationStartEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateEscalationStartEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailEscalationStartEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailEscalationStartEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneEscalationStartEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneEscalationStartEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Conditional Catch Intermediate
  updateConditionalCatchEventTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateConditionalCatchEventTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailConditionalCatchEventTask: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailConditionalCatchEventTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //signal start event
  updateSignalStartEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateSignalStartEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailSignalStartEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailSignalStartEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSignalStartEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneSignalStartEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //signal end event
  updateSignalEndEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateSignalEndEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailSignalEndEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailSignalEndEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSignalEndEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneSignalEndEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //signal intermediate throw event
  updateSignalIntermediateThrowEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateSignalIntermediateThrowEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailSignalIntermediateThrowEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailSignalIntermediateThrowEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSignalIntermediateThrowEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneSignalIntermediateThrowEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //signal intermediate catch event
  updateSignalIntermediateCatchEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateSignalIntermediateCatchEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailSignalIntermediateCatchEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailSignalIntermediateCatchEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneSignalIntermediateCatchEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneSignalIntermediateCatchEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //conditional start event
  updateConditionalStartEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateConditionalStartEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailConditionalStartEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailConditionalStartEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //compensation Intermediate throw event
  updateCompensationIntermediateThrowEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateCompensationIntermediateThrowEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailCompensationIntermediateThrowEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailCompensationIntermediateThrowEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneCompensationIntermediateThrowEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneCompensationIntermediateThrowEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  listCompensationRef: (processId: any) => {
    return fetch(`${urlsApi.businessProcess.getCompensationRef}?processId=${processId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //Compensation End Event
  updateCompensationEndEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateCompensationEndEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailCompensationEndEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailCompensationEndEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneCompensationEndEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneCompensationEndEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Terminate End Event
  updateTerminateEndEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateTerminateEndEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailTerminateEndEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailTerminateEndEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneTerminateEndEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneTerminateEndEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Error end event
  updateErrorEndEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateErrorEndEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailErrorEndEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailErrorEndEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneErrorEndEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneErrorEndEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // error start event
  updateErrorStartEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.updateErrorStartEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailErrorStartEvent: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailErrorStartEvent}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneErrorStartEvent: (body: any) => {
    return fetch(urlsApi.businessProcess.cloneErrorStartEvent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Link Catch Intermediate
  updateLinkCatchEventTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateLinkCatchEventTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailLinkCatchEventTask: (id: any) => {
    return fetch(`${urlsApi.businessProcess.detailLinkCatchEventTask}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //bpm participant
  updateBpmParticipant: (body: any) => {
    return fetch(urlsApi.businessProcess.updateBpmParticipant, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailBpmParticipant: (id: any) => {
    return fetch(`${urlsApi.businessProcess.getBpmParticipant}?nodeId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy về danh sách luồng tới
  listLinkTo: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listLinkTo}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy về danh sách luồng ra
  listLinkFrom: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listLinkForm}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //handle task
  updateHandleTask: (body: any) => {
    return fetch(urlsApi.businessProcess.updateHandleTask, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //handle task init
  updateHandleTaskInit: (body: any) => {
    return fetch(urlsApi.businessProcess.updateHandleTaskInit, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //handle task draff
  updateHandleTaskDraft: (body: any) => {
    return fetch(urlsApi.businessProcess.updateHandleTaskDraft, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //tạo ycms
  purchaseRequestApprove: (body: any) => {
    return fetch(urlsApi.businessProcess.purchaseRequestApprove, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //tạo ycms draff
  purchaseRequestDraft: (body: any) => {
    return fetch(urlsApi.businessProcess.purchaseRequestDraft, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //lấy về dữ liệu khởi tạo của form xử lý task
  getDataForm: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.getDataForm}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy về lịch sử đối tượng trong quy trình
  getProcessedObjectLog: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.getProcessedObjectLog}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //Mô phỏng quy trình
  listBpmTrigger: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listBpmTrigger}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  activeBpmTrigger: (id: any) => {
    return fetch(`${urlsApi.businessProcess.activeBpmTrigger}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //lịch sử xử lý
  processedObjectLog: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.processedObjectLog}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //lịch sử xử lý
  processedObjectLogPage: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.processedObjectLogPage}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //OLA, SLA
  updateServiceLevel: (body: any) => {
    return fetch(urlsApi.businessProcess.updateServiceLevel, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listServiceLevel: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listServiceLevel}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateHistoryOLA: (body: any) => {
    return fetch(urlsApi.businessProcess.updateHistoryOLA, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listHistoryOLA: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listHistoryOLA}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //Tiếp nhận xử lý
  receiveProcessedObjectLog: (body: any) => {
    return fetch(urlsApi.businessProcess.receiveProcessedObjectLog, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Tạm dừng xử lý
  onholdProcessedObjectLog: (body: any) => {
    return fetch(urlsApi.businessProcess.onholdProcessedObjectLog, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Tiếp tục xử lý
  onContinue: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.onContinue}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // Thu hồi công việc:
  // Lấy trạng thái công việc
  onWorkRecall: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.onWorkRecall}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  onPollCheckResult: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.onCheckWorkResult}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Xác nhận thu hồi công việc
  onConfirmRecall: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.confirmWorkRecall}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //lấy về các node của một quy trình để debug
  debugListNodeProcess: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.debugListNodeProcess}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy về các node start của một quy trình để debug
  debugListNodeStartProcess: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.debugListNodeStartProcess}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy về các link của một quy trình để debug
  debugListLinkNodeProcess: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.debugListLinkNodeProcess}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy danh sách bước (node) để từ chối rồi quay lại
  listNodeHistory: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listNodeHistory}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //thêm cột trong grid
  AddArtifactGrid: (body: any) => {
    return fetch(urlsApi.businessProcess.addArtifactGrid, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailArtifactGrid: (id: number) => {
    return fetch(`${urlsApi.businessProcess.getArtifactGrid}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //Timer
  updateTimer: (body: any) => {
    return fetch(urlsApi.businessProcess.updateTimer, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //type user task
  updateType: (body: any) => {
    return fetch(urlsApi.businessProcess.updateType, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // getTimer: (id: number) => {
  //   return fetch(`${urlsApi.businessProcess.getTimer}?nodeId=${id}`, {
  //     method: "GET",
  //   }).then((res) => res.json());
  // },

  //Thêm artifact vào list để cấu hình
  updateArtifactMetadata: (body: any) => {
    return fetch(urlsApi.businessProcess.updateArtifactMetadata, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listArtifactMetadata: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listArtifactMetadata}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  getArtifactMetadata: (id: number) => {
    return fetch(`${urlsApi.businessProcess.getArtifactMetadata}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  deleteArtifactMetadata: (nodeId, fieldName) => {
    return fetch(`${urlsApi.businessProcess.deleteArtifactMetadata}?nodeId=${nodeId}&fieldName=${fieldName}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  //thêm cấu trúc hồ sơ
  updateBpmObject: (body: any) => {
    return fetch(urlsApi.businessProcess.updateBpmObject, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailBpmObject: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.detailBpmObject}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  onGetErrorLog: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.getErrorLogData}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //export data process
  exportDataProcess: (body: any) => {
    return fetch(urlsApi.businessProcess.exportDataProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //api lấy về link url để tải file
  getUrlExportDataProcess: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.getUrlExportDataProcess}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //import data process
  importDataProcess: (body: any) => {
    return fetch(urlsApi.businessProcess.importDataProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // state
  listStates: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessProcess.listState}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  createState: (body: any) => {
    return fetch(urlsApi.businessProcess.createState, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateState: (body: any) => {
    return fetch(urlsApi.businessProcess.updateState, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  deleteState: (id: number) => {
    return fetch(`${urlsApi.businessProcess.deleteState}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
