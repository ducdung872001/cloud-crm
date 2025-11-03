import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, { addEdge, MiniMap, Controls, Background, useNodesState, useEdgesState, ReactFlowProvider, applyNodeChanges } from "reactflow";

import { nodes as initialNodes, edges as initialEdges } from "./partails/Initial-elements";
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

const KpiDiagram = (props) => {
  const {listKpiEmployee, detailKpiEmployee} = props;
  console.log('listKpiEmployee', listKpiEmployee);
  
  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // console.log("nodes", nodes);
  const [nodesNew, setNodesNew, onNodesChangeNew] = useNodesState(initialNodes);
  console.log('nodesNew', nodesNew);
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  // console.log("edges", edges);
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

  useEffect(() => {
    if(listKpiEmployee && listKpiEmployee.length > 0){
      const newList =  listKpiEmployee.map(item => {
        return {
          id: `${item.goalId}`,
          data: {
            label: item.goalName,
          },
          // position: { x: 628, y: 300 },
          style: {
              // width: 100,
              backgroundColor: '#10519f',
              border: 0,
              color: 'white'
          }
        }
      })
      newList.unshift(
        {
          id: '1',
          // type: 'input',
          data: {
            label: detailKpiEmployee.name,
          },
          position: { x: 338, y: 0 },
          style: {
              width: 250,
              backgroundColor: 'orange',
              border: 0,
              color: 'white'
          }
        },
        {
          id: '2',
          data: {
            label: 'Tài chính',
          },
          position: { x: -238, y: 100 },
          style: {
              borderRadius: "50%",
              width: "12rem",
              padding: "0.8rem",
              backgroundColor: '#10519f',
              color: 'white',
              border: 0,
          }
        },
        {
          id: '3',
          data: {
            label: 'Quy trình',
          },
          position: { x: 300, y: 100 },
          style: {
              borderRadius: "50%",
              width: "12rem",
              padding: "0.8rem",
          }
        },
        {
          id: '4',
          data: {
            label: 'Con người',
          },
          position: { x: 500, y: 100 },
          style: {
              borderRadius: "50%",
              width: "12rem",
              padding: "0.8rem",
          }
        },
        {
          id: '5',
          data: {
            label: 'khách hàng',
          },
          position: { x: 1020, y: 100 },
          style: {
              borderRadius: "50%",
              width: "12rem",
              padding: "0.8rem",
              backgroundColor: '#10519f',
              color: 'white',
              border: 0,
          }
        },
      )

      setNodesNew(newList)
    }
   
  }, [listKpiEmployee])

  return (
    <div className="dndflow_kpi">
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
            // nodesDraggable={false}
            // elementsSelectable={false}
            className="react-flow-automation_kpi"
          >
            {/* <MiniMap style={minimapStyle} zoomable pannable /> */}
            <Controls />
            <Background gap={10} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default KpiDiagram;
