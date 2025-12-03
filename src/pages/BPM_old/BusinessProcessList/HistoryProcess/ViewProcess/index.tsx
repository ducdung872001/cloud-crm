import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import Icon from "components/icon";
import { showToast } from "utils/common";
import "./index.scss";
import BusinessProcessService from "services/BusinessProcessService";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import BpmnViewer from "bpmn-js/lib/NavigatedViewer";
import ModalUserTask from "pages/BPM/BusinessProcessCreate/partials/ModalUserTask";
import ModalServiceTask from "pages/BPM/BusinessProcessCreate/partials/ModalServiceTask";
import ModalScriptTask from "pages/BPM/BusinessProcessCreate/partials/ModalScriptTask";
import ModalManualTask from "pages/BPM/BusinessProcessCreate/partials/ModalManualTask";
import ModalBusinessRuleTask from "pages/BPM/BusinessProcessCreate/partials/ModalBusinessRuleTask";
import ModalSendTask from "pages/BPM/BusinessProcessCreate/partials/ModalSendTask";
import ModalReceiveTask from "pages/BPM/BusinessProcessCreate/partials/ModalReceiveTask";
import ModalCallActivityTask from "pages/BPM/BusinessProcessCreate/partials/ModalCallActivityTask";
import ModalParallelGatewayTask from "pages/BPM/BusinessProcessCreate/partials/ModalParallelGateway";
import ModalExclusiveGateway from "pages/BPM/BusinessProcessCreate/partials/ModalExclusiveGateway";
import ModalInclusiveGateway from "pages/BPM/BusinessProcessCreate/partials/ModalInclusiveGateway";
import ModalComplexGateway from "pages/BPM/BusinessProcessCreate/partials/ModalComplexGateway";
import ModalSubprocess from "pages/BPM/BusinessProcessCreate/partials/ModalSubprocess";
import ModalSequenceFlow from "pages/BPM/BusinessProcessCreate/partials/ModalSequenceFlow";

export default function ViewProcess(props) {
  const { dataObject } = props;

  const modelerRef = useRef(null);
  const bpmnModeler = useRef(null);

  const [logObject, setLogObject] = useState([]);
  const [processReferData, setProcessReferData] = useState(null);
  const [dataNode, setDataNode] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
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
    if (dataObject?.potId) {
      getLogObject(dataObject.potId);
    }
    if (dataObject?.processId) {
      getDetailBusinessProcess(dataObject?.processId);
    }
  }, [dataObject]);

  const getLogObject = async (objectId) => {
    const body = {
      potId: objectId,
    };

    const response = await BusinessProcessService.processedObjectLog(body);

    if (response.code === 0) {
      const result = response.result;
      setLogObject(result);
      // if(result && result.length > 0){
      //   changeNodeColor(result);
      // }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  const getDetailBusinessProcess = async (id) => {
    const response = await BusinessProcessService.getDetailDiagram(id);

    if (response.code == 0) {
      const result = response.result;
      if (result) {
        setProcessReferData({
          value: result.id,
          label: result.name,
          config: result.config,
        });
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };
  useEffect(() => {
    // Khởi tạo BpmnJS modeler
    bpmnModeler.current = new BpmnViewer({
      container: modelerRef.current,
      width: "100%",
      // height: '600px',
      height: " calc(100vh - 165px)",
    });

    const initialDiagram =
      processReferData?.config ||
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

    // Nhập quy trình vào modeler
    bpmnModeler.current
      .importXML(initialDiagram)
      .then(({ warnings }) => {
        if (warnings.length) {
          console.warn("Warnings", warnings);
        }

        if (logObject && logObject.length > 0) {
          logObject.map((item) => {
            // 0-chưa vào, 1-đang dừng ở đó, 2-hoàn thành
            changeNodeColor(
              item.nodeId,
              "#FF5733",
              item.status === 2 ? "#33CC33" : item.status === 3 ? "#DDDDDD" : item.status === 1 ? "#FFC300" : item.status === -1 ? "red" : "white",
              bpmnModeler.current
            );
          });
        }
      })
      .catch((err) => {
        console.error("Error importing BPMN diagram", err);
      });

    bpmnModeler.current.on("element.click", (event) => {
      console.log("eventCLick", event);
      // setNodeId(event.element.id)
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

    return () => {
      // Cleanup khi component bị hủy
      bpmnModeler.current.destroy();
    };
  }, [processReferData, logObject]);

  const changeNodeColor = (elementId, strokeColor, fillColor, viewer) => {
    const elementRegistry = viewer.get("elementRegistry");

    // Lấy node dựa trên ID
    const element = elementRegistry.get(elementId);

    if (element) {
      // Lấy phần tử SVG tương ứng
      const gfx = elementRegistry.getGraphics(element);

      // Thay đổi màu viền và màu nền
      const shape = gfx.querySelector("rect, path"); // Tìm phần tử SVG của node
      // shape.style.stroke = strokeColor;  // Màu viền
      shape.style.fill = fillColor; // Màu nền
    } else {
      console.error(`Không tìm thấy element với ID: ${elementId}`);
    }
  };

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

  return (
    <div className="box__view--process">
      <div className="view-process">
        <div
          ref={modelerRef}
          style={{
            // border: '1px solid #ccc',
            // height: '56rem',
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
          <div className="zoom-btn zoom-out" onClick={() => setShowGuide(!showGuide)}>
            ?
          </div>
        </div>
      </div>

      {showGuide ? (
        <div className="note__process">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="hight-line">Lưu ý:</span>
            <div style={{ marginTop: -5, cursor: "pointer" }} onClick={() => setShowGuide(false)}>
              <Icon name="Times" style={{ width: 15, height: 15 }} />
            </div>
          </div>

          <div className="lst__agent">
            <div className="item--agent">
              <span className="name">- Chưa thực hiện</span>
              <span className="bg-item bg-transparent" />
            </div>
            <div className="item--agent">
              <span className="name">- Đang thực hiện</span>
              <span className="bg-item bg-active" />
            </div>
            <div className="item--agent">
              <span className="name">- Hoàn thành</span>
              <span className="bg-item bg-success" />
            </div>
            <div className="item--agent">
              <span className="name">- Tạm dừng</span>
              <span className="bg-item bg-hold" />
            </div>
            <div className="item--agent">
              <span className="name">- Tạm dừng (lỗi)</span>
              <span className="bg-item bg-error" />
            </div>
          </div>
        </div>
      ) : null}

      <ModalUserTask
        onShow={isModalUserTask}
        dataNode={dataNode}
        processId={dataObject?.processId}
        disable={true}
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
        processId={dataObject?.processId}
        disable={true}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalServiceTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={null}
      />

      <ModalScriptTask
        onShow={isModalScriptTask}
        dataNode={dataNode}
        processId={dataObject?.processId}
        disable={true}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalScriptTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={null}
      />

      <ModalManualTask
        onShow={isModalManualTask}
        dataNode={dataNode}
        processId={dataObject?.processId}
        disable={true}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalManualTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={null}
      />

      <ModalBusinessRuleTask
        onShow={isModaBusinessRuleTask}
        dataNode={dataNode}
        processId={dataObject?.processId}
        disable={true}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalBusinessRuleTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={null}
      />

      <ModalSendTask
        onShow={isModaSendTask}
        dataNode={dataNode}
        processId={dataObject?.processId}
        disable={true}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalSendTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={null}
      />

      <ModalReceiveTask
        onShow={isModaReceiveTask}
        dataNode={dataNode}
        processId={dataObject?.processId}
        disable={true}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalReceiveTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={null}
      />

      <ModalCallActivityTask
        onShow={isModalCallActivityTask}
        dataNode={dataNode}
        processId={dataObject?.processId}
        disable={true}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalCallActivityTask(false);
          setDataNode(null);
        }}
        changeNameNodeXML={null}
      />

      <ModalParallelGatewayTask
        onShow={isModalParallelGateway}
        dataNode={dataNode}
        processId={dataObject?.processId}
        disable={true}
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
        processId={dataObject?.processId}
        disable={true}
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
        processId={dataObject?.processId}
        disable={true}
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
        processId={dataObject?.processId}
        disable={true}
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
        processId={dataObject?.processId}
        disable={true}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalSubprocess(false);
          setDataNode(null);
        }}
        changeNameNodeXML={null}
      />

      <ModalSequenceFlow
        onShow={isModalSequenceFlow}
        dataNode={dataNode}
        processId={dataObject?.processId}
        disable={true}
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
}
