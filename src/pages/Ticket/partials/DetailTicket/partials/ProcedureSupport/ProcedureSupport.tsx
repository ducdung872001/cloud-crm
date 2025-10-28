import React, { Fragment, useEffect, useState } from "react";
import _ from "lodash";
import ReactFlow, { Background, MiniMap, useEdgesState, useNodesState, BaseEdge, EdgeLabelRenderer, getBezierPath } from "reactflow";
import SupportCommonService from "services/SupportCommonService";
import { showToast } from "utils/common";
import Icon from "components/icon";
import "./ProcedureSupport.scss";

export default function ProcedureSupport(props) {
  const { infoApproved, idTicket } = props;

  const [lstSupport, setLstSupport] = useState([]);
  const [lstLinkSupport, setLstLinkSupport] = useState([]);

  // sau khi đã lấy đc supportId
  const handleGetConfigApproval = async (id: number) => {
    if (!id) return;

    const params = {
      supportId: id,
    };

    const response = await SupportCommonService.lstConfig(params);

    if (response.code === 0) {
      const result = response.result;
      setLstSupport(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  const handGetLinkApproval = async (id: number) => {
    if (!id) return;

    const params = {
      supportId: id,
    };

    const response = await SupportCommonService.lstLink(params);

    if (response.code === 0) {
      const result = response.result;
      setLstLinkSupport(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (infoApproved) {
      handleGetConfigApproval(infoApproved.supportId);
      handGetLinkApproval(infoApproved.supportId);
    }
  }, [infoApproved]);

  useEffect(() => {
    if (lstSupport && lstSupport.length > 0) {
      const changeLstSigner = lstSupport.map((item) => {
        return {
          id: `${item.id}`,
          data: {
            label:
              item.departmentId === 0 || item.departmentId === -1 || item.departmentId === -2
                ? item.departmentId === 0
                  ? "Bắt đầu"
                  : item.departmentId === -1
                  ? "Hoàn thành"
                  : "Từ chối"
                : `${item.departmentName}\n${item.day || 0} ngày, ${item.hour || 0} giờ ${item.minute || 0} phút`,
            name: item.departmentId === 0 ? "Bắt đầu" : item.departmentId === -1 ? "Hoàn thành" : item.departmentId === -2 ? "Từ chối" : "Phòng ban",
            departmentId: item.departmentId,
            departmentName: `${item.departmentName}`,
            employees: item.employees,
            day: item.day,
            hour: item.hour,
            minute: item.minute,
          },
          type: item.type,
          position: JSON.parse(item.position),
        };
      });

      setNodes(changeLstSigner);
    } else {
      setNodes([]);
    }
  }, [lstSupport]);

  useEffect(() => {
    if (lstLinkSupport && lstLinkSupport.length > 0) {
      const changeLstLinkApproval: any[] = lstLinkSupport.map((item) => {
        return {
          id: `reactflow__edge-${item.nodeFrom}-${item.nodeTo}`,
          markerEnd: { type: "arrowclosed" },
          originId: item.id,
          targetHandle: null,
          sourceHandle: null,
          source: `${item.nodeFrom}`,
          target: `${item.nodeTo}`,
          type: "buttonedge",
        };
      });

      setEdges(changeLstLinkApproval);
    } else {
      setEdges([]);
    }
  }, [lstLinkSupport]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const edgeTypes = {
    buttonedge: CustomEdge,
  };

  function CustomEdge(props) {
    const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, target, source } = props;

    const cloneDataNodes = _.cloneDeep(nodes);
    const isMatch = cloneDataNodes.some((el) => el.id == target && el.data.departmentId == -2);

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    return (
      <Fragment>
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className={`nodrag__connect ${isMatch ? "connect-faild" : "connect-success"}`}
          >
            <Icon name={isMatch ? "TimesCircle" : "CheckedCircle"} />
          </div>
        </EdgeLabelRenderer>
      </Fragment>
    );
  }

  const [lstLog, setLstLog] = useState([]);

  const handleGetLog = async (id: number) => {
    if (!id) return;

    const params = {
      objectId: id,
      objectType: 1,
    };

    const response = await SupportCommonService.lstLog(params);

    if (response.code === 0) {
      const result = response.result;
      setLstLog(result);
    } else {
      showToast("Lịch sử ký đang lỗi. Xin vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (idTicket) {
      handleGetLog(idTicket);
    }
  }, [idTicket]);

  return (
    <div className="procedure__support">
      <div className="procedure__support--header">
        <span className="title">Quy trình hỗ trợ</span>
      </div>

      <div className="procedure__support--info">
        <ReactFlow
          nodes={nodes.map((node) => {
            const labelStartsWithBegin = node.data.label.startsWith("Bắt đầu");
            const labelStartsWithSuccess = node.data.label.startsWith("Hoàn thành");
            const labelStartsWithFaild = node.data.label.startsWith("Từ chối");

            const matchedNode = lstLog.find((item) => item.nodeId === +node.id && item.status < 3);
            const matchedNodeSuccess = lstLog.find((item) => item.nodeId === +node.id && item.status == 2);
            const matchedNodeRefuse = lstLog.find((item) => item.nodeId === +node.id)?.status === 3;

            const checkNextDepartment = lstLog.find((item) => item.nodeId === +node.id && item.status < 2);

            return {
              ...node,
              style: labelStartsWithBegin
                ? {
                    borderRadius: "50%",
                    width: "12rem",
                    padding: "0.8rem",
                  }
                : labelStartsWithSuccess || labelStartsWithFaild
                ? {
                    borderRadius: "50%",
                    padding: "2.2rem",
                    width: "12rem",
                  }
                : lstLog && lstLog.length === 1 && matchedNode
                ? {
                    backgroundColor: "yellow",
                  }
                : lstLog && lstLog.length > 1 && matchedNodeSuccess
                ? {
                    backgroundColor: "var(--success-darker-color)",
                    color: "var(--white-color)",
                  }
                : lstLog && matchedNodeRefuse
                ? {
                    backgroundColor: "var(--error-darker-color)",
                    color: "var(--white-color)",
                  }
                : lstLog && lstLog.length > 1 && checkNextDepartment
                ? {
                    backgroundColor: "yellow",
                  }
                : {
                    //
                  },
              type: labelStartsWithBegin ? "input" : labelStartsWithSuccess || labelStartsWithFaild ? "output" : "default",
            };
          })}
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          edgesUpdatable={false}
          edgesFocusable={false}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          draggable={false}
          panOnDrag={false}
          elementsSelectable={false}
          fitView
          className="view__flow--support"
        >
          {/* <MiniMap /> */}
          <Background gap={12} size={1} />
        </ReactFlow>

        <div className="note__signature">
          <span className="hight-line">Lưu ý:</span>

          <div className="lst__agent">
            <div className="item--agent">
              <span className="name">- Người chưa thực hiện tiếp nhận màu</span>
              <span className="bg-item bg-transparent" />
            </div>
            <div className="item--agent">
              <span className="name">- Người đang thực hiện tiếp nhận màu</span>
              <span className="bg-item bg-yellow" />
            </div>
            <div className="item--agent">
              <span className="name">- Người đã thực hiện xong màu</span>
              <span className="bg-item bg-success" />
            </div>
            <div className="item--agent">
              <span className="name">- Người đã từ chối màu</span>
              <span className="bg-item bg-error" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
