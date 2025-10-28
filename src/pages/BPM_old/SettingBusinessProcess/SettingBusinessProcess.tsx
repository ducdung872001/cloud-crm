import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, { addEdge, MiniMap, Controls, Background, useNodesState, useEdgesState, ReactFlowProvider, applyNodeChanges } from "reactflow";

// import { nodes as initialNodes, edges as initialEdges } from "./Initial-elements";
import { nodes as initialNodes, edges as initialEdges } from "./Initial-elements";
import CustomNode from "./CustomNode";

import "reactflow/dist/style.css";
import "./SettingBusinessProcess.scss";
import Sidebar from "./Sidebar/Sidebar";
import { useParams } from "react-router-dom";
import MarketingAutomationService from "services/MarketingAutomationService";
import { showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import ConfigModal from "./ConfigModal";


import ReactBpmn from 'react-bpmn';
import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';

import Modeler from "bpmn-js/lib/Modeler";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import ConfigCondition from "./ConfigCondition/ConfigCondition";
import ConfigModalPeople from "./ConfigModalPeople/ConfigModalPeople";
import TrueFalseModal from "./TrueFalseModal/TrueFalseModal";

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="3.3.5">
  <bpmn:process id="Process_1" isExecutable="true">
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;


const nodeTypes = {
  custom: CustomNode,
};


const SettingBusinessProcess = () => {

  // const containerRef = useRef(null);

  //   useEffect(() => {
  //       const container = containerRef.current;

  //       const modeler = new Modeler({
  //           container,
  //           keyboard: {
  //               bindTo: document
  //           }
  //       });

  //       modeler.importXML(xml, err => {
  //           if (err) {
  //               console.error(err);
  //           }

  //           const canvas = modeler.get("canvas");
  //           const elementFactory = modeler.get("elementFactory");

  //           canvas.zoom("fit-viewport");

  //           var task = elementFactory.createBpmnElement("shape", {
  //               type: "bpmn:Task",
  //               x: 350,
  //               y: 100
  //           });

  //           var root = canvas.getRootElement();

  //           canvas.addShape(task, root);
  //       });

  //   }, [])

  const reactFlowWrapper = useRef(null);
  const { id } = useParams();

  const [processId, setProcessId] = useState<number>(0);

  useEffect(() => {
    if (id) {
        setProcessId(+id);
        getDettailProcess(+id);
    }
  }, [id]);

  const getDettailProcess = async (id?: number) => {
    const response = await BusinessProcessService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      const configData = result?.configs;
      const nodeList = result?.nodes;
      let nodeData = [];
      let edgeData = [];

      if(nodeList && nodeList.length > 0){
        nodeList.map(item => {
           nodeData.push(
            {
              id: `${item.id}`,
              type: item.typeNode,
              typeNode: item.typeNode,
              point: item.point,
              position: item.position,
              sourcePosition:"right",
              targetPosition: "left",
              configData: item.configData,
              code: item.code,
              data: { label: `${item.name}` },
              // ...((item.code === 'start' || item.code === 'done' || item.code === 'condition') ? {height: '8rem'} : (item.code === 'do') ? {height: '5rem'} : {}),
              // ...((item.code === 'start' || item.code === 'done' || item.code === 'condition') ? {width: '8rem'} : (item.code === 'do') ? {width: 150} : {}),
              // height: 150,
              // width: 150,
              style:
                item.code === "start"
                ? { 
                    border: "1px solid #E0E0E0", 
                    alignItem: 'center',
                    justifyContent: 'center',
                    display:'flex',
                    borderRadius:'50rem',
                    height: '8rem',
                    width: '8rem',
                }
                : item.code === "do"
                ? { 
                    border: "1px solid #E0E0E0", 
                    alignItem: 'center',
                    justifyContent: 'center',
                    display:'flex',
                    minHeight: '5rem',
                    minWidth: 150 
                }
                : item.code === "condition"
                ? { 
                    border: "1px solid #E0E0E0", 
                    alignItem: 'center',
                    justifyContent: 'center',
                    display:'flex',
                    height: '8rem',
                    width: '8rem',
                    // transform: 'rotate(45deg)'
                }
                : { 
                    border: "1px solid #E0E0E0", 
                    alignItem: 'center',
                    justifyContent: 'center',
                    display:'flex',
                    borderRadius:'50rem',
                    height: '8rem',
                    width: '8rem',
                },
            },
           )
        })
      }

      if (configData && configData.length > 0) {
        configData.map((item) => {
          const nodeListNew =  [...nodeList];
          const nodeDataSource = nodeListNew.find(el => +el.id === item.fromNodeId) || null;

          edgeData.push({
            id: `reactflow__edge-${item.fromNodeId}-${item.toNodeId}`,
            idEdge: item.id,
            source: `${item.fromNodeId}`,
            sourceHandle: null,
            target: `${item.toNodeId}`,
            targetHandle: null,
            markerEnd: { type: "arrowclosed" },
            type: 'step',
            condition: item.condition,
            label: nodeDataSource && nodeDataSource.code === 'condition' ? (item.condition === 0 ? 'False' : 'True') : ''
          });
        });
      }

      setEdges(edgeData);
      setNodes(nodeData);
      setStatusProcess(result?.status)
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [statusProcess, setStatusProcess] = useState(null);
  const [nodes, setNodes] = useNodesState(initialNodes);
  console.log("nodes", nodes);

  const onNodesChange = useCallback(
    (changes) => {
      // console.log('changes', changes);
      // const changed = changes.find(el => el.selected === true)
      const changed: any = nodes.filter(el => el.id === changes[0].id)[0] || null;
      // console.log('changed', changed);
      const nodeChanged = {
        id: +changed?.id,
        processId: processId,
        // type: 'default',
        typeNode: changed?.typeNode,
        name: changed?.data.label,
        configData: changed?.configData,
        position: changed?.position,
        code: changed?.code,
        point: changed?.point
      }
      
      if(statusProcess !== 1){
        setNodes((nds) => applyNodeChanges(changes, nds));
        addNode(nodeChanged, true);
      }
    },
    [setNodes, statusProcess, nodes]
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  console.log("edges", edges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [matchData, setMatchData] = useState([]);
  console.log("matchData", matchData);

  useEffect(() => {
    if (edges && edges.length > 0) {
      const newData = edges.map((item: any) => {
        return {
          // fromNode: { id: item.source },
          // toNode: { id: item.target },
          id: item.idEdge || "",
          fromNodeId: item.source,
          toNodeId: item.target,
        };
      });

      setMatchData(newData);
    } else {
      setMatchData([]);
    }

  }, [edges]);

  const onSubmit = async () => {
    if (nodes.length > 0) {
      nodes.map((item: any) => {
        const bodyNode = {
          id: +item.id,
          processId: processId,
          // type: 'default',
          typeNode: item.typeNode,
          name: item.data.label,
          configData: item.configData,
          position: item.position,
          code: item.code,
          point: item.point
        };
        addNode(bodyNode);
      });
    }

    const body = {
      maId: processId,
      configs: matchData,
    };

    console.log("body", body);

    const response = await MarketingAutomationService.updateConfigNode(body);

    if (response.code === 0) {
      showToast(`Lưu thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };


  const changeEdgesUpdate = async (edgeData, nodes?, condition?) => {
    // if (nodes.length > 0) {
    //   nodes.map((item) => {
    //     const bodyNode = {
    //       id: +item.id,
    //       processId: processId,
    //       // type: 'default',
    //       typeNode: item.typeNode,
    //       name: item.data.label,
    //       configData: item.configData,
    //       position: item.position,
    //       code: item.code,
    //       point: item.point
    //     };
    //     addNode(bodyNode);
    //   });
    // }

    const newData = edgeData.map((item) => {
      return {
        id: item.idEdge || null,
        fromNodeId: item.source,
        toNodeId: item.target,
        condition: item.condition || 0
      };
    });

    const body = {
      processId: processId,
      configs: newData,
    };

    console.log("body", body);

    const response = await BusinessProcessService.updateLinkNode(body);

    if (response.code === 0) {
      const result = response.result;
      // const configData = result?.configs;
      // let edgeData = [];

      // if (configData && configData.length > 0) {
      //   configData.map((item) => {
      //     edgeData.push({
      //       id: `reactflow__edge-${item.fromNodeId}-${item.toNodeId}`,
      //       idEdge: item.id,
      //       source: `${item.fromNodeId}`,
      //       sourceHandle: null,
      //       target: `${item.toNodeId}`,
      //       targetHandle: null,
      //       markerEnd: { type: "arrowclosed" },
      //     });
      //   });
      // }

      // setEdges(edgeData);
      getDettailProcess(+id);
      // showToast(`Lưu thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [isTrueFalseModal, setIsTrueFalseModal] = useState(false);
  const [dataParamsCondition, setDataParamsCondition] = useState(null);

  const onConnect = useCallback((params) => {
    console.log('params', params);
    const findNodeSoure: any = nodes.find(el => el.id === params.source) || null;
    console.log('findNodeSoure', findNodeSoure);
    
    if(findNodeSoure && findNodeSoure?.code === 'condition'){
      const newParams = {
        ...params,
        markerEnd: { type: "arrowclosed" },
      }    

      setIsTrueFalseModal(true);
      setDataParamsCondition(newParams);
    } else {
      const newParams = {
        ...params,
        markerEnd: { type: "arrowclosed" },
      }    
  
      const edgesData = [...edges];
      console.log('edgesData', edgesData);
      
      edgesData.push(newParams);
      changeEdgesUpdate(edgesData, nodes)
      
      setEdges((eds) => addEdge(newParams, eds))
    }
     
  }, [edges, nodes]);

  const onDragOver = useCallback((event) => {
    console.log('event', event);
    
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      const label = event.dataTransfer.getData("label");
      const code = event.dataTransfer.getData("code");
      const typeNode = event.dataTransfer.getData("type");
      // const checkCondition = label.includes("Điều kiện");
      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const addNodeInfo = {
        processId: processId,
        // type: 'default',
        typeNode: code === 'start' ? 'input' : code === 'done' ? 'output' : 'default',
        name: label,
        configData: null,
        position: position,
        code: code,
        point: null
      };

      addNode(addNodeInfo);

    },
    [reactFlowInstance, edges]
  );

  const addNode = async (body, noAddNode?) => {
    const response = await BusinessProcessService.addNode(body);

    if (response.code == 0) {
      const result = response.result;

      const newNode = {
        id: result.id.toString(),
        type: result.typeNode,
        // type: result.type,
        sourcePosition:"right",
        targetPosition: "left",
        typeNode: result.typeNode,
        point: result.point,
        position: result.position,
        data: { label: `${result.name}` },
        configData: result.configData || null,
        code: result.code,

        style:
          result.code === "start"
          ? { 
              border: "1px solid #E0E0E0", 
              alignItem: 'center',
              justifyContent: 'center',
              display:'flex',
              borderRadius:'50rem',
              height: '8rem',
              width: '8rem',
          }
          : result.code === "do"
          ? { 
              border: "1px solid #E0E0E0", 
              alignItem: 'center',
              justifyContent: 'center',
              display:'flex',
              height: '5rem',
              minWidth: 150 
          }
          : result.code === "condition"
          ? { 
              border: "1px solid #E0E0E0", 
              alignItem: 'center',
              justifyContent: 'center',
              display:'flex',
              height: '8rem',
              width: '8rem',
              // transform: 'rotate(45deg)'
          }
          : { 
              border: "1px solid #E0E0E0", 
              alignItem: 'center',
              justifyContent: 'center',
              display:'flex',
              borderRadius:'50rem',
              height: '8rem',
              width: '8rem',
          },
        
      };

      if(!noAddNode){
        setNodes((nds) => nds.concat(newNode));
      }


      // const newEdge = [...edges];
      // console.log('newEdge',newEdge);
      
      // newEdge.push({
      //   id: `reactflow__edge-${result.id}`,
      //   source: `${result.id}`,
      //   sourceHandle: null,
      //   target: 0,
      //   targetHandle: null,
      //   // markerEnd: { type: "arrowclosed" },
      // })
      // setEdges(newEdge)

      // showToast( "Thêm mới node thành công", "success");
      // navigate(`/marketing_automation`);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  // we are using a bit of a shortcut here to adjust the edge type
  // this could also be done with a custom edge for example
  const edgesWithUpdatedTypes = edges.map((edge) => {
    const edgeNew = {
      ...edge,
      // type:'step'
    };
    // console.log("edgeNew", edgeNew);

    if (edge.sourceHandle) {
      const edgeType = nodes.find((node) => node.type === "custom").data.selects[edge.sourceHandle];
      // console.log('edgeType', edgeType);
      // edge.type = edgeType;
      edgeNew.type = edgeType;
    }

    return edgeNew;
  });


  const [modalConfigEmail, setModalConfigEmail] = useState(false);

  const [modalConfigCondition, setModalConfigCondition] = useState(false);
  const [dataNode, setDataNode] = useState(null);

  console.log('dataNode', dataNode);
  
  const onClickNode = (e) => {
    console.log("e", e);

    const nodeSelected : any = nodes.find(el => el.id == e.target?.dataset?.id) || null;
    console.log('nodeSelected', nodeSelected);
    

    // if (e.target?.innerText === "Điều kiện Email") {
    if (nodeSelected?.code === "do") {
      setDataNode({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        processId: id,
        type: nodeSelected.typeNode,
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setModalConfigEmail(true);
    }

    if (nodeSelected?.code === "condition") {
      setDataNode({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        processId: id,
        type: nodeSelected.typeNode,
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setModalConfigCondition(true);
    }


    
  };

  const deleteNode = async (nodeId) => {
    
    const response = await BusinessProcessService.deleteNode(nodeId);
    if (response.code === 0) {
      // getDettailMA(+id);
      // showToast("Xóa chương trình thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Xoá node thất bại. Vui lòng thử lại sau", "error");
    }
  }
  
  const onNodesDelete = useCallback(
    (deleted) => {
      console.log('delete', deleted);
      deleteNode(+deleted[0]?.id)
      
    },
    [nodes, edges]
  );

  function onShown() {
    console.log('diagram shown');
  }

  function onLoading() {
    console.log('diagram loading');
  }

  function onError(err) {
    console.log('failed to show diagram');
  }


  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <Sidebar onSubmit={onSubmit} statusProcess={statusProcess}/>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edgesWithUpdatedTypes}
            onNodesChange={onNodesChange}
            onNodesDelete={onNodesDelete}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            // defaultViewport={defaultViewport}
            // attributionPosition="top-right"
            nodeTypes={nodeTypes}
            // onElementClick={() => console.log('ee')}
            onNodeClick={(e) => {
              // console.log('item', e);
              
            }}
            onNodeDoubleClick={(e) => onClickNode(e)}
            // nodesDraggable={statusMA === 1 ? false : true}
            // elementsSelectable={statusMA === 1 ? false : true}
            className="react-flow-automation"
          >
            {/* <MiniMap style={minimapStyle} zoomable pannable /> */}
            <Controls />
            <Background color="#aaa" gap={10} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      
      <ConfigModal
        onShow={modalConfigEmail}
        dataNode={dataNode}
        setDataNode={setDataNode}
        statusMA={statusProcess}
        onHide={(reload) => {
          if (reload) {
            getDettailProcess(+id);
          }
          if(reload !== 'not_close'){
            setModalConfigEmail(false);
            setDataNode(null);
          }
          
        }}
      />

      <ConfigCondition
        onShow={modalConfigCondition}
        dataNode={dataNode}
        setDataNode={setDataNode}
        statusMA={statusProcess}
        onHide={(reload) => {
          if (reload) {
            getDettailProcess(+id);
          }
          if(reload !== 'not_close'){
            setModalConfigCondition(false);
            setDataNode(null);
          }
          
        }}
      />

      {/* <ConfigModalPeople
        onShow={modalConfigCondition}
        dataNode={dataNode}
        setDataNode={setDataNode}
        statusMA={statusProcess}
        onHide={(reload) => {
          if (reload) {
            getDettailProcess(+id);
          }
          if(reload !== 'not_close'){
            setModalConfigCondition(false);
            setDataNode(null);
          }
          
        }}
      /> */}

      <TrueFalseModal
        onShow={isTrueFalseModal}
        onHide={(reload, condition) => {
          if (reload) {
            const newParams = {
              ...dataParamsCondition,
              condition: condition
            }    
        
            const edgesData = [...edges];
            
            edgesData.push(newParams);
            changeEdgesUpdate(edgesData, nodes)
            
            setEdges((eds) => addEdge(newParams, eds))
          }
          setIsTrueFalseModal(false);
          setDataParamsCondition(null)
        }}
      />
      
    </div>
    // <div className="card-box">
    //   <ReactBpmn
    //     url="/public/diagram.bpmn"
    //     onShown={ onShown }
    //     onLoading={ onLoading }
    //     onError={ onError }
    //   />
    // </div>
    // <div ref={containerRef} style={{width: '100%', height: '100%', position: 'absolute'}}>
    //     </div>
  );
};

export default SettingBusinessProcess;
