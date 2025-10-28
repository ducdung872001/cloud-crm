import React, { Fragment, useEffect, useState } from "react";
import _ from "lodash";
import ReactFlow, { Background, BaseEdge, EdgeLabelRenderer, MiniMap, getBezierPath, useEdgesState, useNodesState } from "reactflow";
import Icon from "components/icon";
import ApprovalService from "services/ApprovalService";
import { showToast } from "utils/common";

import "./index.scss";

export default function ViewSignature(props) {
  const { infoApproved, data, type } = props;

  const [lstSigner, setLstSigner] = useState([]);
  const [lstLinkApproval, setLstLinkApproval] = useState([]);
  const [nextSigner, setNextSigner] = useState([]);

  // sau khi đã lấy đc approvalId
  const handleGetConfigApproval = async (id: number) => {
    if (!id) return;

    const params = {
      approvalId: id,
    };

    const response = await ApprovalService.lstConfig(params);

    if (response.code === 0) {
      const result = response.result;
      const changeResult = result.filter((item) => item.employeeId > 0);
      setNextSigner(changeResult);

      setLstSigner(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  const handGetLinkApproval = async (id: number) => {
    if (!id) return;

    const params = {
      approvalId: id,
    };

    const response = await ApprovalService.lstLink(params);

    if (response.code === 0) {
      const result = response.result;
      setLstLinkApproval(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (infoApproved) {
      handleGetConfigApproval(infoApproved.approvalId);
      handGetLinkApproval(infoApproved.approvalId);
    }
  }, [infoApproved]);

  useEffect(() => {
    if (lstSigner && lstSigner.length > 0) {
      const changeLstSigner = lstSigner.map((item) => {
        return {
          id: `${item.id}`,
          data: {
            label:
              item.employeeId === 0 || item.employeeId === -1 || item.employeeId === -2
                ? item.employeeId === 0
                  ? "Bắt đầu"
                  : item.employeeId === -1
                  ? "Thành công"
                  : "Thất bại"
                : `${item.employeeName} - ${item.departmentName}\n${item.day || 0}ngày, ${item.hour || 0}giờ ${item.minute || 0}phút`,
            name: item.employeeId === 0 ? "Bắt đầu" : item.employeeId === -1 ? "Thành công" : item.employeeId === -2 ? "Thất bại" : "Người ký",
            employeeId: item.employeeId,
            employeeName: `${item.employeeName} - ${item.departmentName}`,
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
  }, [lstSigner]);

  useEffect(() => {
    if (lstLinkApproval && lstLinkApproval.length > 0) {
      const changeLstLinkApproval: any[] = lstLinkApproval.map((item) => {
        return {
          id: `reactflow__edge-${item.nodeFrom}-${item.nodeTo}`,
          markerEnd: { type: "arrowclosed" },
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
  }, [lstLinkApproval]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const edgeTypes = {
    buttonedge: CustomEdge,
  };

  function CustomEdge(props) {
    const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, target } = props;

    const cloneDataNodes = _.cloneDeep(nodes);
    const cloneDataEdges = _.cloneDeep(edges);

    // const sourceCount = cloneDataEdges.filter((el) => el.source === props.source).length;

    // const isMatch = sourceCount >= 2 && cloneDataNodes.some((el) => el.id === props.target && el.type === "output");

    let isMatch = false;

    for (const item of cloneDataNodes) {
      if (item.id === target && item.data.employeeId == -2) {
        isMatch = true;
        break;
      }
    }

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
    const params = {
      objectId: id,
      objectType: type === "fs" ? 1 : type === "quote" ? 2 : 3,
    };

    const response = await ApprovalService.lstLog(params);

    if (response.code === 0) {
      const result = response.result;
      setLstLog(result);
    } else {
      showToast("Lịch sử ký đang lỗi. Xin vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (data) {
      handleGetLog(data.id);
    }
  }, [data, type]);

  const [initalStartSignature, setInitalStartSignature] = useState(null);

  useEffect(() => {
    if (lstLinkApproval && lstLinkApproval.length > 0 && lstSigner && lstSigner.length > 0) {
      const result = lstLinkApproval.find((item) => {
        return lstSigner.some((el) => el.id == item.nodeFrom && el.employeeId === 0);
      });

      setInitalStartSignature(result);
    }
  }, [lstLinkApproval, lstSigner]);

  return (
    <div className="box__view--signature">
      <ReactFlow
        nodes={nodes.map((node) => {
          const labelStartsWithBegin = node.data.label.startsWith("Bắt đầu");
          const labelStartsWithSuccess = node.data.label.startsWith("Thành công");
          const labelStartsWithFaild = node.data.label.startsWith("Thất bại");

          const matchedNode = lstLog.find((item) => item.nodeId === +node.id)?.status == 1;

          const matchedNodeRefuse = lstLog.find((item) => item.nodeId === +node.id)?.status == 0;

          const matchedNodeResult = lstLog.filter((item) => item.status == 0).length > 0;

          const checkNextSigner = matchedNodeResult
            ? []
            : nextSigner.filter((item) => {
                return !lstLog.some((el) => el.employeeId === item.employeeId);
              });

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
              : lstLog && lstLog.length === 0 && initalStartSignature && initalStartSignature.nodeTo == +node.id
              ? {
                  backgroundColor: "yellow",
                }
              : lstLog && lstLog.length > 0 && matchedNode
              ? {
                  backgroundColor: "var(--success-darker-color)",
                  color: "var(--white-color)",
                }
              : lstLog && lstLog.length > 0 && matchedNodeRefuse
              ? {
                  backgroundColor: "var(--error-darker-color)",
                  color: "var(--white-color)",
                }
              : lstLog &&
                lstLog.length > 0 &&
                checkNextSigner &&
                checkNextSigner.length > 0 &&
                checkNextSigner[checkNextSigner.length - 1].id === +node.id
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
        elementsSelectable={false}
        nodesDraggable={false}
        fitView
        className="view__flow--signature"
      >
        {/* <MiniMap /> */}
        <Background gap={12} size={1} />
      </ReactFlow>

      <div className="note__signature">
        <span className="hight-line">Lưu ý:</span>

        <div className="lst__agent">
          <div className="item--agent">
            <span className="name">- Người chưa thực hiện ký màu</span>
            <span className="bg-item bg-transparent" />
          </div>
          <div className="item--agent">
            <span className="name">- Người đang thực hiện ký màu</span>
            <span className="bg-item bg-yellow" />
          </div>
          <div className="item--agent">
            <span className="name">- Người đã ký xong màu</span>
            <span className="bg-item bg-success" />
          </div>
          <div className="item--agent">
            <span className="name">- Người đã từ chối ký màu</span>
            <span className="bg-item bg-error" />
          </div>
        </div>
      </div>
    </div>
  );
}
