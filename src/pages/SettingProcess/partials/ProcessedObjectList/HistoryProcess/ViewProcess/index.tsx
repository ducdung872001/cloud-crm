import React, { Fragment, useEffect, useState } from "react";
import _ from "lodash";
import ReactFlow, { Background, BaseEdge, EdgeLabelRenderer, MiniMap, getBezierPath, useEdgesState, useNodesState } from "reactflow";
import Icon from "components/icon";
import ApprovalService from "services/ApprovalService";
import { showToast } from "utils/common";

import "./index.scss";
import BusinessProcessService from "services/BusinessProcessService";
import ProcessedObjectService from "services/ProcessedObjectService";

export default function ViewProcess(props) {
  const { processId } = props;


  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [logObject, setLogObject] = useState([]);
  const edgeTypes = {
    // buttonedge: CustomEdge,
  };
  


  useEffect(() => {
    if (processId && logObject && logObject.length > 0) {
        getDetailProcess(+processId, logObject);
    }
  }, [processId, logObject ]);

  useEffect(() => {
    if (processId) {
        getLogObject(processId);
    }
  }, [processId]);

  const getLogObject = async (objectId) => {
    const body = {
      potId:objectId,
    };

    const response = await ProcessedObjectService.processedObjectLog(body);

    if (response.code === 0) {
      const result = response.result;
      setLogObject(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  }

  const getDetailProcess = async (id?: number, logObject?: any) => {
    const response = await BusinessProcessService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      const configData = result?.configs;
      const nodeList = result?.nodes;
      let nodeData = [];
      let edgeData = [];

      if(nodeList && nodeList.length > 0){
        nodeList.map(item => {
          const checkNode = logObject.find(el => el.nodeId === +item.id) || null;
          console.log('checkNode', checkNode);
          
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
                    minWidth: 150 ,
                    backgroundColor: checkNode && (checkNode.status === 2 ? "var(--success-darker-color)" : checkNode.status === 1 ? 'yellow' :  ""),
                    color: checkNode && checkNode.status === 2 ? "white" : "",
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
          edgeData.push({
            id: `reactflow__edge-${item.fromNodeId}-${item.toNodeId}`,
            idEdge: item.id,
            source: `${item.fromNodeId}`,
            sourceHandle: null,
            target: `${item.toNodeId}`,
            targetHandle: null,
            markerEnd: { type: "arrowclosed" },
            type: 'step',
          });
        });
      }

      setEdges(edgeData);
      setNodes(nodeData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

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


  return (
    <div className="box__view--process">
      <ReactFlow
        nodes={nodes}
        edges={edgesWithUpdatedTypes}
        onNodesChange={onNodesChange}
        // onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        // onInit={setReactFlowInstance}
        // onDrop={onDrop}
        // onDragOver={onDragOver}
        fitView
        // defaultViewport={defaultViewport}
        // attributionPosition="top-right"
        // nodeTypes={nodeTypes}
        // onElementClick={() => console.log('ee')}
        onNodeClick={(e) => {
          // console.log('item', e);
          
        }}
        // onNodeDoubleClick={(e) => onClickNode(e)}
        nodesDraggable={false}
        elementsSelectable={false}
        className="react-flow-process"
      >
        {/* <MiniMap style={minimapStyle} zoomable pannable /> */}
        <Background color="#aaa" gap={10} />
      </ReactFlow>

      <div className="note__process">
        <span className="hight-line">Lưu ý:</span>

        <div className="lst__agent">
          {/* <div className="item--agent">
            <span className="name">- Người chưa thực hiện ký màu</span>
            <span className="bg-item bg-transparent" />
          </div> */}
          <div className="item--agent">
            <span className="name">- Đang xử lý màu</span>
            <span className="bg-item bg-yellow" />
          </div>
          <div className="item--agent">
            <span className="name">- Đã xử lý màu</span>
            <span className="bg-item bg-success" />
          </div>
          {/* <div className="item--agent">
            <span className="name">- Người đã từ chối ký màu</span>
            <span className="bg-item bg-error" />
          </div> */}
        </div>
      </div>
    </div>
  );
}
