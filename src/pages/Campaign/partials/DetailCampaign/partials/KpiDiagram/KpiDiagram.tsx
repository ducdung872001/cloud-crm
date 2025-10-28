import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, { addEdge, MiniMap, Controls, Background, useNodesState, useEdgesState, ReactFlowProvider, applyNodeChanges } from "reactflow";

import { nodes as initialNodes, edges as initialEdges } from "./partials/Initial-elements";
// import CustomNode from "./CustomNode";

import "reactflow/dist/style.css";
import "./KpiDiagram.scss";
import { useParams } from "react-router-dom";
import MarketingAutomationService from "services/MarketingAutomationService";
import { showToast } from "utils/common";
const nodeTypes = {
//   custom: CustomNode,
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

const KpiDiagram = () => {
  const reactFlowWrapper = useRef(null);
  const { id } = useParams();

  const [maId, setMaId] = useState<number>(0);

  useEffect(() => {
    if (id) {
      setMaId(+id);
      getDettailMA(+id);
    }
  }, [id]);

  const getDettailMA = async (maId?: number) => {
    const response = await MarketingAutomationService.detailMA(maId);

    if (response.code === 0) {
      const result = response.result;
      const configData = result?.configs;
      const nodeList = result?.nodes;
      let nodeData = [];
      let edgeData = [];

  
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  console.log("nodes", nodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  console.log("edges", edges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);


  // we are using a bit of a shortcut here to adjust the edge type
  // this could also be done with a custom edge for example
  const edgesWithUpdatedTypes = edges.map((edge) => {
    const edgeNew = {
      ...edge,
      // type:'step'
    };
    // console.log("edgeNew", edgeNew);

    // if (edge.sourceHandle) {
    //   const edgeType = nodes.find((node) => node.type === "custom").data.selects[edge.sourceHandle];
    //   // console.log('edgeType', edgeType);
    //   // edge.type = edgeType;
    //   edgeNew.type = edgeType;
    // }

    return edgeNew;
  });

  return (
    <div className="dndflow_kpi_campaign">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edgesWithUpdatedTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            // onConnect={onConnect}
            onInit={setReactFlowInstance}
            // onDrop={onDrop}
            // onDragOver={onDragOver}
            fitView
            // defaultViewport={defaultViewport}
            // attributionPosition="top-right"
            nodeTypes={nodeTypes}
            // onElementClick={() => console.log('ee')}
            onNodeClick={(e) => {
              // console.log('item', e);
              
            }}
            // onNodeDoubleClick={(e) => onClickNode(e)}
            nodesDraggable={false}
            elementsSelectable={false}
            className="react-flow-automation_kpi_campaign"
          >
            {/* <MiniMap style={minimapStyle} zoomable pannable /> */}
            <Controls />
            <Background color="#aaa" gap={10} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default KpiDiagram;
