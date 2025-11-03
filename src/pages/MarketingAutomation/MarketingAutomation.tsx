import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, { addEdge, MiniMap, Controls, Background, useNodesState, useEdgesState, ReactFlowProvider, applyNodeChanges } from "reactflow";

import { nodes as initialNodes, edges as initialEdges } from "./Initial-elements";
import CustomNode from "./CustomNode";

import "reactflow/dist/style.css";
import "./MarketingAutomation.scss";
import Sidebar from "./partials/Sidebar";
import AddTimeEventModal from "./partials/AddTimeEventModal/AddTimeEventModal";
import { getPageOffset, getSearchParameters } from "reborn-util";
import ConfigEmail from "./config/ConfigEmail";
import ConfigZalo from "./config/ConfigZalo";
import ConfigCall from "./config/ConfigCall";
import ConfigSms from "./config/ConfigSMS";
import ConfigTime from "./config/ConfigTime";
import { useParams } from "react-router-dom";
import MarketingAutomationService from "services/MarketingAutomationService";
import { showToast } from "utils/common";
import SendSMS from "./configAction/SendSMS/SendSMS";
import SendEmail from "./configAction/SendEmail/SendEmail";
import PushCampaignModal from "./configAction/PushCampaignModal/PushCampaignModal";
import CallApiModal from "./configAction/CallApiModal/CallApiModal";
import SendZalo from "./configAction/SendZalo/SendZalo";

const nodeTypes = {
  custom: CustomNode,
};

const minimapStyle = {
  height: 120,
};

const onInit = (reactFlowInstance) => console.log("flow loaded:", reactFlowInstance);
const defaultViewport = { x: 0, y: 0, zoom: 0 };

let id = 0;
const getId = () => {
  return `node_${id++}`;
  // return label
};

const MarketingAutomation = () => {

  const reactFlowWrapper = useRef(null);
  const { id } = useParams();

  const [maId, setMaId] = useState<number>(0);

  useEffect(() => {
    if (id) {
      setMaId(+id);
      getDettailMA(+id);
    }
  }, [id]);

  // const getDettailMA = async (maId?: number) => {
  //   const response = await MarketingAutomationService.detailConfigMA(maId);

  //   if (response.code === 0) {
  //     const result = response.result;
  //     const configData = result?.config;
  //     let nodeData = [];
  //     let edgeData = [];

  //     if (configData && configData.length > 0) {
  //       configData.map((item) => {
  //         nodeData.push(
  //           {
  //             id: `${item.fromNode?.id}`,
  //             type: item.fromNode?.type,
  //             point: item.fromNode?.point,
  //             position: item.fromNode?.position,
  //             configData: item.fromNode?.configData,
  //             code: item.fromNode?.code,
  //             data: { label: `${item.fromNode?.name}` },
  //             height: 46,
  //             width: 150,
  //             style:
  //               item.fromNode?.type === "condition"
  //                 ? { border: "1px solid #E0E0E0", borderLeft: "3px solid #4169E1", borderRadius: 100 }
  //                 : { border: "1px solid #E0E0E0", borderLeft: "3px solid #00CC33", borderRadius: 5 },
  //           },
  //           {
  //             id: `${item.toNode?.id}`,
  //             type: item.toNode?.type,
  //             point: item.toNode?.point,
  //             position: item.toNode?.position,
  //             configData: item.toNode?.configData,
  //             code: item.toNode?.code,
  //             data: { label: `${item.toNode?.name}` },
  //             height: 46,
  //             width: 150,
  //             style:
  //               item.toNode?.type === "condition"
  //                 ? { border: "1px solid #E0E0E0", borderLeft: "3px solid #4169E1", borderRadius: 100 }
  //                 : { border: "1px solid #E0E0E0", borderLeft: "3px solid #00CC33", borderRadius: 5 },
  //           }
  //         );

  //         edgeData.push({
  //           id: `reactflow__edge-${item.fromNode?.id}-${item.toNode?.id}`,
  //           source: `${item.fromNode?.id}`,
  //           sourceHandle: null,
  //           target: `${item.toNode?.id}`,
  //           targetHandle: null,
  //           markerEnd: { type: "arrowclosed" },
  //         });
  //       });
  //     }

  //     setEdges(edgeData);
  //     setNodes(nodeData);
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }
  // };

  const getDettailMA = async (maId?: number) => {
    const response = await MarketingAutomationService.detailMA(maId);

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
              type: 'default',
              typeNode: item.typeNode,
              point: item.point,
              position: item.position,
              configData: item.configData,
              code: item.code,
              data: { label: `${item.name}` },
              height: 46,
              width: 150,
              style:
                item.typeNode === "condition"
                  ? { border: "1px solid #E0E0E0", borderLeft: "3px solid #4169E1", borderRadius: 100 }
                  : { border: "1px solid #E0E0E0", borderLeft: "3px solid #00CC33", borderRadius: 5 },
            },
           )
        })
      }

      if (configData && configData.length > 0) {
        configData.map((item) => {
          edgeData.push({
            id: `reactflow__edge-${item.fromNodeId}-${item.toNodeId}`,
            idEdge: item.id,
            source: `${item.fromNodeId}`,
            sourceHandle: null,
            target: `${item.toNodeId}`,
            targetHandle: null,
            markerEnd: { type: "arrowclosed" },
          });
        });
      }

      setEdges(edgeData);
      setNodes(nodeData);
      setStatusMA(result?.status)
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [statusMA, setStatusMA] = useState(null);
  const [nodes, setNodes] = useNodesState(initialNodes);
  console.log("nodes", nodes);

  const onNodesChange = useCallback(
    (changes) => {
      console.log('changes', changes);
      // const changed = changes.find(el => el.selected === true)
      const changed: any = nodes.filter(el => el.id === changes[0].id)[0] || null;
      console.log('changed', changed);
      const nodeChanged = {
        id: changed?.id,
        maId: maId,
        type: 'default',
        typeNode: changed?.typeNode,
        name: changed?.data.label,
        configData: changed?.configData,
        position: changed?.position,
        code: changed?.code,
        point: changed?.point
      }
      
      if(statusMA !== 1){
        setNodes((nds) => applyNodeChanges(changes, nds));
        addNode(nodeChanged, true);
      }
    },
    [setNodes, statusMA, nodes]
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
          id: item.id,
          maId: maId,
          type: 'default',
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
      maId: maId,
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


  const changeEdgesUpdate = async (edgeData, nodes) => {
    if (nodes.length > 0) {
      nodes.map((item) => {
        const bodyNode = {
          id: item.id,
          maId: maId,
          type: 'default',
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

    const newData = edgeData.map((item) => {
      return {
        id: item.idEdge || "",
        fromNodeId: item.source,
        toNodeId: item.target,
      };
    });

    const body = {
      maId: maId,
      configs: newData,
    };

    console.log("body", body);

    const response = await MarketingAutomationService.updateConfigNode(body);

    if (response.code === 0) {
      const result = response.result;
      const configData = result?.configs;
      let edgeData = [];

      if (configData && configData.length > 0) {
        configData.map((item) => {
          edgeData.push({
            id: `reactflow__edge-${item.fromNodeId}-${item.toNodeId}`,
            idEdge: item.id,
            source: `${item.fromNodeId}`,
            sourceHandle: null,
            target: `${item.toNodeId}`,
            targetHandle: null,
            markerEnd: { type: "arrowclosed" },
          });
        });
      }

      // setEdges(edgeData);
      getDettailMA(+id);
      // showToast(`Lưu thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onConnect = useCallback((params) => {
    
    const newParams = {
      ...params,
      markerEnd: { type: "arrowclosed" },
    }    

    const edgesData = [...edges];
    console.log('edgesData', edgesData);
    
    edgesData.push(newParams);
    changeEdgesUpdate(edgesData, nodes)
    
    setEdges((eds) => addEdge(newParams, eds))
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
      // const newNode = {
      //   id: getId(),
      //   // id: getId(label),
      //   type,
      //   position,
      //   data: { label: `${label}` },
      //   style: checkCondition
      //           ? { border: '1px solid #E0E0E0', borderLeft: '3px solid #4169E1', borderRadius: 100 }
      //           : { border: '1px solid #E0E0E0', borderLeft: '3px solid #00CC33', borderRadius: 5 } ,
      // };

      // setNodes((nds) => nds.concat(newNode));

      const addNodeInfo = {
        maId: maId,
        // type: checkCondition ? "condition" : "action",
        type: 'default',
        typeNode: typeNode,
        name: label,
        configData: null,
        position: position,
        code: code,
        point: ''
      };

      addNode(addNodeInfo);

    },
    [reactFlowInstance, edges]
  );

  const addNode = async (body, noAddNode?) => {
    const response = await MarketingAutomationService.addNode(body);

    if (response.code == 0) {
      const result = response.result;

      const newNode = {
        id: result.id.toString(),
        type: "default",
        // type: result.type,
        typeNode: result.typeNode,
        point: result.point,
        position: result.position,
        data: { label: `${result.name}` },
        configData: result.configData || null,
        code: result.code,
        style:
          result.typeNode === "condition"
            ? { border: "1px solid #E0E0E0", borderLeft: "3px solid #4169E1", borderRadius: 100 }
            : { border: "1px solid #E0E0E0", borderLeft: "3px solid #00CC33", borderRadius: 5 },
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

  const [showModalAddEvent, setShowModalAddEvent] = useState<boolean>(false);
  const [showModalAddTimeEvent, setShowModalAddTimeEvent] = useState<boolean>(false);
  const [showModalAddContentEvent, setShowModalAddContentEvent] = useState<boolean>(false);
  

  const [modalConfigEmail, setModalConfigEmail] = useState(false);
  const [modalConfigZalo, setModalConfigZalo] = useState(false);
  const [modalConfigSms, setModalConfigSms] = useState(false);
  const [modalConfigCall, setModalConfigCall] = useState(false);
  const [modalConfigTime, setModalConfigTime] = useState(false);

  const [showModalSendEmail, setShowModalSendEmail] = useState<boolean>(false);
  const [showModalAddSms, setShowModalAddSms] = useState<boolean>(false);
  const [showModalAddZalo, setShowModalAddZalo] = useState<boolean>(false);
  const [modalCampaignSale, setModalCampaignSale] = useState<boolean>(false);
  const [modalCallApi, setModalCallApi] = useState<boolean>(false);

  const [dataEmail, setDataEmail] = useState(null);
  console.log('dataEmail', dataEmail);
  
  const [dataSms, setDataSms] = useState(null);
  const [dataZalo, setDataZalo] = useState(null);
  const [dataCall, setDataCall] = useState(null);
  const [dataTime, setDataTime] = useState(null);
  const [dataCampaignSale, setDataCampaignSale] = useState(null);
  const [dataCallApi, setDataCallApi] = useState(null);


  const onClickNode = (e) => {
    console.log("e", e);

    const nodeSelected : any = nodes.find(el => el.id == e.target?.dataset?.id) || null;
    console.log('nodeSelected', nodeSelected);
    

    // if (e.target?.innerText === "Điều kiện Email") {
    if (nodeSelected?.code === "email_condition") {
      setDataEmail({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        maId: id,
        type: 'default',
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setModalConfigEmail(true);
    }

    if (nodeSelected?.code === "zalo_condition") {
      setDataZalo({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        maId: id,
        type: 'default',
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setModalConfigZalo(true);
    }

    if (nodeSelected?.code === "call_condition") {
      setDataCall({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        maId: id,
        type: 'default',
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setModalConfigCall(true);
    }

    if (nodeSelected?.code === "sms_condition") {
      setDataSms({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        maId: id,
        type: 'default',
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setModalConfigSms(true);
    }

    if (nodeSelected?.code === "time_condition") {
      setDataTime({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        maId: id,
        type: 'default',
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setModalConfigTime(true);
    }

    // if(e.target?.dataset?.id === 'Điều kiện Thời gian'){
    // if(e.target?.innerText === 'Điều kiện Thời gian'){
    //   setShowModalAddTimeEvent(true)
    // }
    if (nodeSelected?.code === "send_email") {
      setShowModalSendEmail(true);
      setDataEmail({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        maId: id,
        type: 'default',
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
    }
    if (nodeSelected?.code === "send_sms") {
      setDataSms({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        maId: id,
        type: 'default',
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setShowModalAddSms(true);
    }

    if (nodeSelected?.code === "send_zalo") {
      setDataZalo({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        maId: id,
        type: 'default',
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setShowModalAddZalo(true);
    }

    if (nodeSelected?.code === "campaign_sale") {
      setDataCampaignSale({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        maId: id,
        type: 'default',
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setModalCampaignSale(true);
    }

    if (nodeSelected?.code === "call_api") {
      setDataCallApi({
        id: nodeSelected.id,
        name: nodeSelected.data.label,
        maId: id,
        type: 'default',
        typeNode: nodeSelected.typeNode,
        position: nodeSelected.position,
        configData: nodeSelected.configData,
        code: nodeSelected.code,
        point: nodeSelected.point
      });
      setModalCallApi(true);
    }
  };

  const deleteNode = async (nodeId) => {
    
    const response = await MarketingAutomationService.deleteNode(nodeId);
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

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <Sidebar onSubmit={onSubmit} statusMA={statusMA}/>
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
            // fitView
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

      <ConfigEmail
        onShow={modalConfigEmail}
        dataNode={dataEmail}
        setDataNode={setDataEmail}
        statusMA={statusMA}
        onHide={(reload) => {
          if (reload) {
            getDettailMA(+id);
          }
          if(reload !== 'not_close'){
            setModalConfigEmail(false);
            setDataEmail(null);
          }
          
        }}
      />

      <ConfigZalo
        onShow={modalConfigZalo}
        dataNode={dataZalo}
        setDataNode={setDataZalo}
        statusMA={statusMA}
        onHide={(reload) => {
          if (reload) {
            getDettailMA(+id);
          }
          if(reload !== 'not_close'){
            setModalConfigZalo(false);
            setDataZalo(null);
          }          
        }}
      />

      <ConfigSms
        onShow={modalConfigSms}
        dataNode={dataSms}
        setDataNode={setDataSms}
        statusMA={statusMA}
        onHide={(reload) => {
          if (reload) {
            getDettailMA(+id);
          }
          if(reload !== 'not_close'){
            setModalConfigSms(false);
            setDataSms(null);
          }
          
        }}
      />

      <ConfigCall
        onShow={modalConfigCall}
        dataNode={dataCall}
        setDataNode={setDataCall}
        statusMA={statusMA}
        onHide={(reload) => {
          if (reload) {
            getDettailMA(+id);
          }
          if(reload !== 'not_close'){
            setModalConfigCall(false);
            setDataCall(null);
          }
          
        }}
      />

      <ConfigTime
        onShow={modalConfigTime}
        dataNode={dataTime}
        setDataNode={setDataTime}
        statusMA={statusMA}
        onHide={(reload) => {
          if (reload) {
            getDettailMA(+id);
          }
          if(reload !== 'not_close'){
            setModalConfigTime(false);
            setDataTime(null);
          }
          
        }}
      />

      <AddTimeEventModal
        onShow={showModalAddTimeEvent}
        data={""}
        onHide={(reload) => {
          if (reload) {
            // getListContact(params);
          }
          setShowModalAddTimeEvent(false);
        }}
      />

      <SendEmail 
        onShow={showModalSendEmail} 
        dataNode={dataEmail}
        setDataNode={setDataEmail}
        statusMA={statusMA}
        onHide={(reload) => {
          if (reload) {
            getDettailMA(+id);
          }
          if(reload !== 'not_close'){
            setShowModalSendEmail(false);
            setDataEmail(null);
          }
          
        }}
      />

      <SendSMS
        onShow={showModalAddSms}
        dataNode={dataSms}
        setDataNode={setDataSms}
        statusMA={statusMA}
        callback={(codes) => {}}
        onHide={(reload) => {
          if (reload) {
            getDettailMA(+id);
          }
          if(reload !== 'not_close'){
            setShowModalAddSms(false);
            setDataSms(null);
          }
        }}
      />

      <SendZalo
        onShow={showModalAddZalo}
        dataNode={dataZalo}
        setDataNode={setDataZalo}
        statusMA={statusMA}
        onHide={(reload) => {
          if (reload) {
            getDettailMA(+id);
          }
          if(reload !== 'not_close'){
            setShowModalAddZalo(false);
            setDataZalo(null);
          }
        }}
      />

      <PushCampaignModal
        onShow={modalCampaignSale}
        setDataNode={setDataCampaignSale}
        dataNode={dataCampaignSale}
        statusMA={statusMA}
        onHide={(reload) => {
          if (reload) {
            getDettailMA(+id);
          }
          if(reload !== 'not_close'){
            setModalCampaignSale(false);
            setDataCampaignSale(null);
          }
          
        }}
      />

      <CallApiModal
        onShow={modalCallApi}
        setDataNode={setDataCallApi}
        dataNode={dataCallApi}
        statusMA={statusMA}
        onHide={(reload) => {
          if (reload) {
            getDettailMA(+id);
          }
          if(reload !== 'not_close'){
            setModalCallApi(false);
            setDataCallApi(null);
          }
          
        }}
      />
    </div>
  );
};

export default MarketingAutomation;
