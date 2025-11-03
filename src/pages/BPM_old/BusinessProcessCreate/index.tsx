import React, { useEffect, useRef, useState } from "react";
import BpmnJS from "bpmn-js/dist/bpmn-modeler.production.min.js";
import { useParams, useNavigate } from "react-router-dom";
import BpmnModeler from "bpmn-js/lib/Modeler";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import copyPasteModule from "bpmn-js/lib/features/copy-paste";
import keyboardModule from "diagram-js/lib/features/keyboard";
import "./index.scss";
import ModalUserTask from "./partials/ModalUserTask";
import Button from "components/button/button";
import ModalServiceTask from "./partials/ModalServiceTask";
import ModalScriptTask from "./partials/ModalScriptTask";
import ModalManualTask from "./partials/ModalManualTask";
import ModalBusinessRuleTask from "./partials/ModalBusinessRuleTask";
import ModalReceiveTask from "./partials/ModalReceiveTask";
import { showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import ModalSendTask from "./partials/ModalSendTask";
import ModalCallActivityTask from "./partials/ModalCallActivityTask";
import ModalParallelGatewayTask from "./partials/ModalParallelGateway";
import ModalSequenceFlow from "./partials/ModalSequenceFlow";
import ModalComplexGateway from "./partials/ModalComplexGateway";
import ModalExclusiveGateway from "./partials/ModalExclusiveGateway";
import ModalInclusiveGateway from "./partials/ModalInclusiveGateway";
import ModalSubprocess from "./partials/ModalSubprocess";
import { is } from "bpmn-js/lib/util/ModelUtil";

/**
 * Cho phép tạo mới một quy trình
 * @returns
 */
const BusinessProcessCreate = () => {
  const takeUrlProcessLocalStorage = localStorage.getItem("backUpUrlProcess") ? JSON.parse(localStorage.getItem("backUpUrlProcess")) : {};

  const modelerRef = useRef(null);
  const bpmnModeler = useRef(null);
  const tooltipRef = useRef(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const [dataNode, setDataNode] = useState(null);
  //console.log("dataNode", dataNode);

  const [nodeId, setNodeId] = useState(null);
  console.log("nodeId", nodeId);

  const [dataConfig, setDataConfig] = useState("");

  const getDetailBusinessProcess = async (id) => {
    const response = await BusinessProcessService.getDetailDiagram(id);

    if (response.code == 0) {
      const result = response.result;
      if (result.config) {
        setDataConfig(result.config);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (id) {
      getDetailBusinessProcess(id);
    }
  }, [id]);

  //modal user task
  const [isModalUserTask, setIsModalUserTask] = useState(false);
  //modal service task
  const [isModalServiceTask, setIsModalServiceTask] = useState(false);
  //modal script task
  const [isModalScriptTask, setIsModalScriptTask] = useState(false);
  //modal manual task
  const [isModalManualTask, setIsModalManualTask] = useState(false);
  //modal business rule task
  const [isModaBusinessRuleTask, setIsModalBusinessRuleTask] = useState(false);
  //modal send task
  const [isModaSendTask, setIsModalSendTask] = useState(false);
  //modal receive task
  const [isModaReceiveTask, setIsModalReceiveTask] = useState(false);
  //modal call activity task
  const [isModalCallActivityTask, setIsModalCallActivityTask] = useState(false);
  //modal Parallel Gateway
  const [isModalParallelGateway, setIsModalParallelGateway] = useState(false);
  //modal Exclusive Gateway
  const [isModalExclusiveGateway, setIsModalExclusiveGateway] = useState(false);
  //modal Inclusive Gateway
  const [isModalInclusiveGateway, setIsModalInclusiveGateway] = useState(false);
  //modal sequence flow
  const [isModalSequenceFlow, setIsModalSequenceFlow] = useState(false);
  //modal complex gateway
  const [isModalComplexGateway, setIsModalComplexGateway] = useState(false);
  //modal subprocess
  const [isModalSubprocess, setIsModalSubprocess] = useState(false);

  useEffect(() => {
    console.log("processId =>", id);

    if (id) {
      // setProcessId(+id);
      // getDettailProcess(+id);
    }
  }, [id]);

  const addNode = async (element) => {
    const body = {
      // id: nodeId || '',
      name: "",
      typeNode: element.type,
      processId: id,
      nodeId: element.id,
    };
    const response = await BusinessProcessService.bpmAddNode(body);

    if (response.code == 0) {
      const result = response.result;
      // Thay đổi id của task này thành 'NewTaskId'
      // setTimeout(() => {
      //   modeling.updateProperties(taskElement, {
      //     id: result.id.toString()
      //   });
      // }, 0);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const addNameNode = async (nameNode, element) => {
    const body = {
      name: nameNode || "",
      nodeId: element.id,
    };
    const response = await BusinessProcessService.bpmAddNameNode(body);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const deleteNode = async (nodeId) => {
    const response = await BusinessProcessService.bpmDeleteNode(nodeId);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const addLinkNode = async (element, fromNodeId, toNodeId) => {
    const body = {
      // id: '',
      fromNodeId: fromNodeId,
      toNodeId: toNodeId,
      flowType: "normal", //normal, condition
      config: "",
      processId: id,
      linkId: element.id,
    };
    if (body.fromNodeId && body.fromNodeId) {
      const response = await BusinessProcessService.bpmAddLinkNode(body);

      if (response.code == 0) {
        const result = response.result;
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  const deleteLinkNode = async (linkId) => {
    const response = await BusinessProcessService.bpmDeleteLinkNode(linkId);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //quy trình con

  const addChildProcess = async (element, projectId) => {
    const body = {
      // id: '',
      name: "",
      description: "",
      employeeId: null,
      parentId: projectId,
    };
    const response = await BusinessProcessService.update(body);

    if (response.code == 0) {
      const result = response.result;
      addNodeSubprocess(element, result.id, result.parentId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const addNodeSubprocess = async (element, childProcessId, processId) => {
    const body = {
      // id: nodeId || '',
      name: "",
      typeNode: element.type,
      processId: processId,
      childProcessId: childProcessId,
      nodeId: element.id,
    };

    const response = await BusinessProcessService.bpmAddNode(body);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailNode = async (nodeId, element) => {
    const response = await BusinessProcessService.bpmDetailNode(nodeId);

    if (response.code == 0) {
      const result = response.result;

      if (element.type === "bpmn:SequenceFlow") {
        addLinkInChildProcess(result?.childProcessId, element);
      } else if (element.type === "bpmn:SubProcess") {
        console.log("cos vao nhe");

        addChildProcess(element, result?.childProcessId);
      } else {
        addNodeInChildProcess(result?.childProcessId, element);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const addNodeInChildProcess = async (childProcessId, element) => {
    console.log("childProcessId", childProcessId);

    const body = {
      // id: nodeId || '',
      name: "",
      typeNode: element.type,
      processId: childProcessId,
      nodeId: element.id,
    };
    const response = await BusinessProcessService.bpmAddNode(body);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const addLinkInChildProcess = async (childProcessId, element) => {
    const fromNodeId = element?.businessObject?.sourceRef?.id;
    const toNodeId = element?.businessObject?.targetRef?.id;

    const body = {
      // id: '',
      fromNodeId: fromNodeId,
      toNodeId: toNodeId,
      flowType: "normal", //normal, condition
      config: "",
      processId: childProcessId,
      linkId: element.id,
    };
    if (body.fromNodeId && body.fromNodeId) {
      const response = await BusinessProcessService.bpmAddLinkNode(body);

      if (response.code == 0) {
        const result = response.result;
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  const [newBpmModeler, setNewBpmModeler] = useState(null);

  const changeNameNodeXML = (dataNode, nameNode) => {
    const elementRegistry = newBpmModeler.get("elementRegistry");
    const modeling = newBpmModeler.get("modeling");
    const elementNew = elementRegistry.get(dataNode.id);

    if (elementNew && elementNew.businessObject && elementNew.businessObject.name !== nameNode) {
      modeling.updateProperties(dataNode, {
        name: nameNode,
      });
      console.log("Tên đã thay đổi:", dataNode.businessObject.name);
    }
  };

  const checkType = (type) => {
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

  useEffect(() => {
    // Khởi tạo BpmnJS modeler
    let isUpdatingTask = false;
    let isReplacing = false;
    let deleteDone = true;

    bpmnModeler.current = new BpmnJS({
      container: modelerRef.current,
      width: "100%",
      // height: '600px',
      height: " calc(100vh - 165px)",
      keyboard: {
        bindTo: window, // Bắt sự kiện bàn phím toàn cục
      },
      additionalModules: [copyPasteModule, keyboardModule],
    });

    setNewBpmModeler(bpmnModeler.current);

    // const modeler = new BpmnJS({
    //   container: '#canvas', // Khai báo container để render sơ đồ BPMN
    //   keyboard: { bindTo: window } // Tùy chọn để liên kết với bàn phím
    // });
    // Tải quy trình mẫu ban đầu
    //     const initialDiagram = `<?xml version="1.0" encoding="UTF-8"?>
    // <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
    //   <process id="Process_1" isExecutable="true">
    //     <startEvent id="StartEvent_1" name="Start">
    //       <outgoing>Flow_06qq21j</outgoing>
    //     </startEvent>
    //     <sendTask id="SendTask_1" name="Send Message">
    //       <incoming>Flow_06qq21j</incoming>
    //       <outgoing>Flow_184bi33</outgoing>
    //     </sendTask>
    //     <endEvent id="EndEvent_1" name="End">
    //       <incoming>Flow_184bi33</incoming>
    //     </endEvent>
    //     <sequenceFlow id="Flow_06qq21j" sourceRef="StartEvent_1" targetRef="SendTask_1" />
    //     <sequenceFlow id="Flow_184bi33" sourceRef="SendTask_1" targetRef="EndEvent_1" />
    //   </process>
    //   <message id="Message_1" name="SendOrderMessage" />
    //   <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    //     <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    //       <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
    //         <dc:Bounds x="173" y="102" width="36" height="36" />
    //       </bpmndi:BPMNShape>
    //       <bpmndi:BPMNShape id="SendTask_1_di" bpmnElement="SendTask_1">
    //         <dc:Bounds x="259" y="80" width="100" height="80" />
    //       </bpmndi:BPMNShape>
    //       <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
    //         <dc:Bounds x="409" y="102" width="36" height="36" />
    //       </bpmndi:BPMNShape>
    //       <bpmndi:BPMNEdge id="Flow_06qq21j_di" bpmnElement="Flow_06qq21j">
    //         <di:waypoint x="209" y="120" />
    //         <di:waypoint x="259" y="120" />
    //       </bpmndi:BPMNEdge>
    //       <bpmndi:BPMNEdge id="Flow_184bi33_di" bpmnElement="Flow_184bi33">
    //         <di:waypoint x="359" y="120" />
    //         <di:waypoint x="409" y="120" />
    //       </bpmndi:BPMNEdge>
    //     </bpmndi:BPMNPlane>
    //   </bpmndi:BPMNDiagram>
    // </definitions>`;

    const initialDiagram =
      dataConfig ||
      `<?xml version="1.0" encoding="UTF-8"?>
      <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
        <process id="Process_1" isExecutable="true">
          
        </process>
        <message id="Message_1" name="SendOrderMessage" />
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
            
            
          </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
      </definitions>`;

    // const elementRegistry = bpmnModeler.current.get('elementRegistry');
    // const modeling = bpmnModeler.current.get('modeling');

    // bpmnModeler.current.on('contextPad.click', function(event) {
    //   const element = event.currentTarget;
    //   console.log('elementPad', element);

    //   const action = event.originalEvent;

    //   // Kiểm tra nếu phần tử là một Task
    //   if (element && element.businessObject.$type.startsWith(element.type)) {
    //     console.log('Task được chọn từ contextPad:', element.businessObject.name || element.businessObject.id);

    //     // Kiểm tra loại task đã được chọn
    //     if (action === 'replace') {
    //       console.log('Người dùng đã chọn thay đổi loại task');

    //       // Lấy loại task mới từ event hoặc contextPad
    //       const newTaskType = action.replaceOptions.newElement.type;
    //       console.log('Loại task mới:', newTaskType);

    //       // Bạn có thể tiếp tục cập nhật loại task ở đây nếu cần
    //       updateTaskType(element, newTaskType);
    //     }
    //   }
    // });

    // bpmnModeler.current.on('commandStack.element.updateProperties.executed', function(event) {
    //   console.log('event', event);

    //   const element = event.context.element;
    //   console.log('element12', element);

    //   const changedProperties = event.context.properties;
    //   console.log('changedProperties',changedProperties);
    //   console.log('changedProperties[]',element.businessObject.$type.startsWith(element.type));

    //   // Kiểm tra nếu phần tử là một Task và thuộc tính 'bpmn:type' bị thay đổi
    //   if (element.businessObject.$type.startsWith(element.type)) {
    //     if (changedProperties && changedProperties['bpmn:type']) {
    //       console.log('Loại Task đã thay đổi thành:', changedProperties['bpmn:type']);
    //       // updateTaskType(element.type, changedProperties['bpmn:type']);
    //     } else {
    //       console.log('Task đã được thay đổi:', element.businessObject.$type);
    //       // updateTaskType(element.type, element.businessObject.$type);
    //     }

    //   }
    // });

    // bpmnModeler.current.on('shape.added', (event) => {
    //   const element = event.element;
    //   console.log('elementAdd', element);

    //   if (element.type === "bpmn:SequenceFlow") {
    //     const fromNodeId = element?.businessObject?.sourceRef?.id;
    //     const toNodeId = element?.businessObject?.targetRef?.id
    //     addLinkNode(element, fromNodeId, toNodeId)

    //   } else {
    //     // Giả sử bạn đã có id của task hiện tại là 'Task_1'
    //     const taskElement = elementRegistry.get(element.id);
    //     // Kiểm tra nếu phần tử là một Task
    //     addNode(element)
    //   }
    // });

    // Lắng nghe sự kiện copy
    bpmnModeler.current.on("copyPaste.copyElement", function (event) {
      console.log("Đang copy element:", event.element);
    });

    // Lắng nghe sự kiện paste
    bpmnModeler.current.on("copyPaste.pasteElement", function (event) {
      console.log("Đang paste element:", event.element);
    });

    bpmnModeler.current.on("commandStack.connection.delete.postExecuted", function (event) {
      const connection = event.context.connection;
      if (isReplacing) {
        // Nếu xoá đang diễn ra trong quá trình thay thế, bỏ qua xử lý
        // console.log('Xoá trong quá trình thay thế, bỏ qua.');
        return;
      }

      // Kiểm tra nếu connection là một Sequence Flow
      if (connection.businessObject.$type === "bpmn:SequenceFlow") {
        console.log("Sequence Flow đã bị xoá:", connection);
        isUpdatingTask = true;
        deleteLinkNode(connection?.id);
      }
    });

    bpmnModeler.current.on("commandStack.connection.create.postExecuted", function (event) {
      const connection = event.context.connection;
      const fromNodeId = connection?.businessObject?.sourceRef?.id;
      const toNodeId = connection?.businessObject?.targetRef?.id;
      if (connection?.businessObject?.$parent?.id && connection.businessObject?.$parent?.$type === "bpmn:SubProcess") {
        getDetailNode(connection?.businessObject?.$parent?.id, connection);
      } else {
        addLinkNode(connection, fromNodeId, toNodeId);
      }
    });

    // Trước khi lệnh replace được thực thi
    bpmnModeler.current.on("commandStack.shape.replace.preExecute", function (event) {
      isReplacing = true; // Bắt đầu quá trình thay thế
      console.log("Bắt đầu quá trình thay thế");
    });

    // Sau khi lệnh replace hoàn tất
    bpmnModeler.current.on("commandStack.shape.replace.postExecuted", function (event) {
      isReplacing = false; // Kết thúc quá trình thay thế
      const element = event.context.newShape;
      console.log("Kết thúc quá trình thay thế", element);

      setTimeout(() => {
        if (checkType(element.type)) {
          if (element?.businessObject?.$parent?.id && element.businessObject?.$parent?.$type === "bpmn:SubProcess") {
            getDetailNode(element?.businessObject?.$parent?.id, element);
          } else if (element.type === "bpmn:SubProcess") {
            console.log("bpmn:SubProcess");
            // khi chuyên sang loại subprocess gọi api để tạo ra process con, lấy id process con cập nhật vào childProcessId của node
            addChildProcess(element, id);
          } else {
            addNode(element);
          }
        }
      }, 1000);
    });

    bpmnModeler.current.on("commandStack.shape.delete.postExecuted", function (event) {
      const { context } = event;
      const deletedElement = context.shape;
      console.log("Element deleted:", deletedElement);
      if (isReplacing) {
        // Nếu xoá đang diễn ra trong quá trình thay thế, bỏ qua xử lý
        // console.log('Xoá trong quá trình thay thế, bỏ qua.');
        deleteNode(deletedElement?.id);
        return;
      }

      isUpdatingTask = true;
      deleteNode(deletedElement?.id);
    });

    bpmnModeler.current.on("commandStack.shape.create.postExecuted", function (event) {
      const element = event.context.shape;
      if (isReplacing) {
        return;
      }
      console.log("element create shape", element);

      // if (element.type === 'bpmn:SubProcess') {
      //   console.log('SubProcess đã được tạo:', element);
      //   addChildProcess(element);
      //   isUpdatingTask=true;
      // }
      // Kiểm tra nếu phần tử là SubProcess
      if (checkType(element.type)) {
        if (element?.businessObject?.$parent?.id && element.businessObject?.$parent?.$type === "bpmn:SubProcess") {
          getDetailNode(element?.businessObject?.$parent?.id, element);
        } else if (element.type === "bpmn:SubProcess") {
          console.log("bpmn:SubProcess");
          // khi chuyên sang loại subprocess gọi api để tạo ra process con, lấy id process con cập nhật vào childProcessId của node
          addChildProcess(element, id);
        } else {
          addNode(element);
        }
      }
    });

    bpmnModeler.current.on("element.changed", (event) => {
      const element = event.element;
      const businessObject = element.businessObject;

      if (isUpdatingTask) {
        isUpdatingTask = false;
        return;
      }
      console.log("elementChange", element);

      if (checkType(element.type)) {
        if (element.type === "bpmn:SequenceFlow") {
          if (businessObject && businessObject.name) {
            console.log("Link name changed:", businessObject.name);
          }
          // addLinkNode(element, fromNodeId, toNodeId)
        } else {
          if (businessObject && businessObject.name) {
            console.log("Node name changed:", businessObject.name);
            addNameNode(businessObject.name, element);
          }
        }
      }

      // if(element?.businessObject?.$parent?.id && element.businessObject?.$parent?.$type === "bpmn:SubProcess"){
      //   if(checkType(element.type)){
      //     getDetailNode(element?.businessObject?.$parent?.id, element);
      //   }

      //   return;
      // }

      // if(checkType(element.type)){
      //   if (element.type === "bpmn:SequenceFlow") {
      //     const fromNodeId = element?.businessObject?.sourceRef?.id;
      //     const toNodeId = element?.businessObject?.targetRef?.id
      //     const taskElement = elementRegistry.get(element.id);
      //     addLinkNode(element, fromNodeId, toNodeId)

      //   } else {
      //     if(element.type === "bpmn:SubProcess"){
      //       console.log('bpmn:SubProcess');
      //       // khi chuyên sang loại subprocess gọi api để tạo ra process con, lấy id process con cập nhật vào childProcessId của node
      //       addChildProcess(element);
      //     } else {
      //       addNode(element)
      //     }
      //   }
      // }
    });

    const tooltip = tooltipRef.current;
    // Handle mouse over event
    bpmnModeler.current.on("element.hover", function (event) {
      const element = event.element;
      const name = element.id || "Unnamed";

      // Display tooltip
      tooltip.innerHTML = name;
      tooltip.style.display = "block";

      // Position the tooltip near the mouse pointer
      const mousePosition = event.originalEvent;
      tooltip.style.left = `${mousePosition.clientX + 10}px`; // Adjust for better visibility
      tooltip.style.top = `${mousePosition.clientY + 10}px`;
    });

    // Nhập quy trình vào modeler
    bpmnModeler.current
      .importXML(initialDiagram)
      .then(({ warnings }) => {
        if (warnings.length) {
          console.warn("Warnings", warnings);
        }

        // const startEvent = elementRegistry.get('StartEvent_1');
        // const endEvent = elementRegistry.get('EndEvent_1');

        // // Lấy Send Task dựa trên ID
        // const sendTaskElement = elementRegistry.get('SendTask_1');

        // // Cập nhật thông tin về Message
        // modeling.updateProperties(sendTaskElement, {
        //   'camunda:messageRef': 'Message_1'
        // });

        // // Bạn có thể định nghĩa message như sau
        // const moddle = bpmnModeler.current.get('moddle');

        // const message = moddle.create('bpmn:Message', { id: 'Message_1', name: 'SendOrderMessage' });

        // const definitions = bpmnModeler.current.getDefinitions();
        // definitions.rootElements.push(message);

        // // Thêm luồng từ Start Event tới Send Task
        // modeling.connect(startEvent, sendTaskElement);

        // // Thêm luồng từ Send Task tới End Event
        // modeling.connect(sendTaskElement, endEvent);
        bpmnModeler.current.on("element.click", (event) => {
          console.log("eventCLick", event);
          setNodeId(event.element.id);
        });

        bpmnModeler.current.on("element.dblclick", (event) => {
          const element = event.element;
          if (element.type === "bpmn:SendTask") {
            console.log("Send Task được click:", element);
            setIsModalSendTask(true);
            setDataNode(element);
            //SendTask popup
          }
          if (element.type === "bpmn:ReceiveTask") {
            setIsModalReceiveTask(true);
            setDataNode(element);
          }

          if (element.type === "bpmn:UserTask") {
            // console.log('User Task được click:', element);
            //Bật cửa sổ popup cho phép cấu hình form-js
            setIsModalUserTask(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:ServiceTask") {
            // console.log('Service Task được click:', element);
            setIsModalServiceTask(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:ScriptTask") {
            setIsModalScriptTask(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:ManualTask") {
            setIsModalManualTask(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:BusinessRuleTask") {
            setIsModalBusinessRuleTask(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:CallActivity") {
            setIsModalCallActivityTask(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:ParallelGateway") {
            setIsModalParallelGateway(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:ExclusiveGateway") {
            setIsModalExclusiveGateway(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:InclusiveGateway") {
            setIsModalInclusiveGateway(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:ComplexGateway") {
            setIsModalComplexGateway(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:SubProcess") {
            setIsModalSubprocess(true);
            setDataNode(element);
          }
          if (element.type === "bpmn:SequenceFlow") {
            setIsModalSequenceFlow(true);
            setDataNode(element);
          }
        });
      })
      .catch((err) => {
        console.error("Error importing BPMN diagram", err);
      });

    return () => {
      // Cleanup khi component bị hủy
      bpmnModeler.current.destroy();
    };
  }, [dataConfig]);

  // Hàm phóng to
  const handleZoomIn = () => {
    const canvas = bpmnModeler.current.get("canvas");
    const currentZoom = canvas.zoom();
    canvas.zoom(currentZoom + 0.2); // Tăng tỷ lệ zoom
  };

  // Hàm thu nhỏ
  const handleZoomOut = () => {
    const canvas = bpmnModeler.current.get("canvas");
    const currentZoom = canvas.zoom();
    canvas.zoom(currentZoom - 0.2); // Giảm tỷ lệ zoom
  };

  // Hàm để lưu quy trình dưới dạng XML
  const saveDiagram = async () => {
    try {
      const { xml } = await bpmnModeler.current.saveXML({ format: true });
      console.log("Saved BPMN 2.0 XML", xml);
      const body = {
        id: id,
        config: xml,
      };
      const response = await BusinessProcessService.saveDiagram(body);

      if (response.code === 0) {
        showToast(`Lưu biểu đồ thành công`, "success");
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } catch (err) {
      console.error("Could not save BPMN diagram", err);
    }
  };

  return (
    <div>
      <div
        ref={modelerRef}
        style={{
          border: "1px solid #ccc",
          height: " calc(100vh - 165px)",
          backgroundColor: "white",
        }}
      />

      <div className="zoom-buttons">
        <div className="zoom-btn zoom-in" onClick={handleZoomIn}>
          +
        </div>
        <div className="zoom-btn zoom-out" onClick={handleZoomOut}>
          −
        </div>
      </div>

      <div style={{ fontSize: 14 }} ref={tooltipRef} />

      <div style={{ display: "flex", marginTop: "1rem" }}>
        <div style={{ marginRight: "1rem" }}>
          <Button
            color="primary"
            variant="outline"
            onClick={(e) => {
              navigate(`/manage_processes?page=${takeUrlProcessLocalStorage?.page || 1}`);
            }}
          >
            Quay lại
          </Button>
        </div>
        {/* <button onClick={saveDiagram}>Lưu</button> */}
        <Button
          color="primary"
          // variant="outline"
          onClick={saveDiagram}
        >
          Lưu
        </Button>
      </div>

      <ModalUserTask
        onShow={isModalUserTask}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalUserTask(false);
          setDataNode(null);
        }}
      />

      <ModalServiceTask
        onShow={isModalServiceTask}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalServiceTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={changeNameNodeXML}
      />

      <ModalScriptTask
        onShow={isModalScriptTask}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalScriptTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={changeNameNodeXML}
      />

      <ModalManualTask
        onShow={isModalManualTask}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalManualTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={changeNameNodeXML}
      />

      <ModalBusinessRuleTask
        onShow={isModaBusinessRuleTask}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalBusinessRuleTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={changeNameNodeXML}
      />

      <ModalSendTask
        onShow={isModaSendTask}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalSendTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={changeNameNodeXML}
      />

      <ModalReceiveTask
        onShow={isModaReceiveTask}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalReceiveTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={changeNameNodeXML}
      />

      <ModalCallActivityTask
        onShow={isModalCallActivityTask}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalCallActivityTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={changeNameNodeXML}
      />

      <ModalParallelGatewayTask
        onShow={isModalParallelGateway}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalParallelGateway(false);
          setDataNode(null);
        }}
      />

      <ModalExclusiveGateway
        onShow={isModalExclusiveGateway}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalExclusiveGateway(false);
          setDataNode(null);
        }}
      />

      <ModalInclusiveGateway
        onShow={isModalInclusiveGateway}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalInclusiveGateway(false);
          setDataNode(null);
        }}
      />

      <ModalComplexGateway
        onShow={isModalComplexGateway}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalComplexGateway(false);
          setDataNode(null);
        }}
      />

      <ModalSubprocess
        onShow={isModalSubprocess}
        dataNode={dataNode}
        processId={id}
        disable={false}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalSubprocess(false);
          setDataNode(null);
        }}
        changeNameNodeXML={changeNameNodeXML}
      />

      <ModalSequenceFlow
        onShow={isModalSequenceFlow}
        dataNode={dataNode}
        processId={id}
        disable={false}
        setDataNode={setDataNode}
        // statusMA={statusProcess}
        onHide={(reload) => {
          if (reload) {
            // getDettailProcess(+id);
          }
          setIsModalSequenceFlow(false);
          setDataNode(null);
          // if(reload !== 'not_close'){
          //   setModalConfigCondition(false);
          //   setDataNode(null);
          // }
        }}
      />
    </div>
  );
};

export default BusinessProcessCreate;
