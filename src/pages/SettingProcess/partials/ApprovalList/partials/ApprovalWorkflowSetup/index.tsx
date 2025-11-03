import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import _ from "lodash";
import ReactFlow, {
  Background,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
  BaseEdge,
  EdgeLabelRenderer,
  MarkerType,
  getBezierPath,
} from "reactflow";
import Icon from "components/icon";
import ApprovalService from "services/ApprovalService";
import { showToast } from "utils/common";
import AddSigner from "./partials/AddSigner";

import "./index.scss";

interface IApprovalWorkflowSetupProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
}

export default function ApprovalWorkflowSetup(props: IApprovalWorkflowSetupProps) {
  const { onShow, data, onHide } = props;

  const [lstSigner, setLstSigner] = useState([]);
  const [lstLinkApproval, setLstLinkApproval] = useState([]);

  const handleGetConfigApproval = async (id: number) => {
    if (!id) return;

    const params = {
      approvalId: id,
    };

    const response = await ApprovalService.lstConfig(params);

    if (response.code === 0) {
      const result = response.result;
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
    if (onShow && data) {
      handleGetConfigApproval(data.id);
      handGetLinkApproval(data.id);
    }
  }, [onShow, data]);

  const reactFlowWrapper = useRef(null);

  const lstContentLeft = [
    {
      name: "Bắt đầu",
      color: "--extra-color-50",
    },
    {
      name: "Người ký",
      color: "--warning-darker-color",
    },
    {
      name: "Thành công",
      color: "--success-darker-color",
    },
    {
      name: "Thất bại",
      color: "--error-darker-color",
    },
  ];

  const [showModalAddSigner, setShowModalAddSigner] = useState<boolean>(false);

  const handDragStart = (e, nodeType, name) => {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.setData("name", name);
    e.dataTransfer.effectAllowed = "move";
  };

  // đoạn này là vùng sử lý của thư viện reactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [dataSigner, setDataSigner] = useState(null);

  const conditionStart = nodes && nodes.filter((item) => item.data?.employeeId === 0).length > 0;
  const conditionSuccess = nodes && nodes.filter((item) => item.data?.employeeId === -1).length > 0;
  const conditionFaild = nodes && nodes.filter((item) => item.data?.employeeId === -2).length > 0;

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
                : `${item.employeeName} - ${item.departmentName}\n${item.day || 0} ngày, ${item.hour || 0} giờ ${item.minute || 0} phút`,
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
  }, [lstLinkApproval]);

  const onConnect = useCallback(
    async (connection) => {
      const { source, target } = connection;

      const conditionStatus = nodes.filter((item) => item.id === target).filter((el) => el.data.employeeId === -2).length > 0;

      const conditionSource = nodes.find((item) => item.id === source).data.employeeId;

      const conditionTarget = nodes.find((item) => item.id === target).data.employeeId;

      if (conditionSource === 0 && (conditionTarget === -1 || conditionTarget === -2)) {
        showToast(
          `${conditionSource === 0 && "Bắt đầu"} không được nối đến ${
            conditionTarget === -1 ? "Thành công" : conditionTarget === -2 ? "Thất bại" : ""
          }`,
          "warning"
        );
        return;
      }

      if (source && target) {
        const body = {
          status: conditionStatus ? 0 : 1, // 1 là yes, 0 là no
          nodeFrom: +source,
          nodeTo: +target,
          approvalId: data?.id,
        };

        const response = await ApprovalService.updateLink(body);

        if (response.code === 0) {
          const result = response.result;
          const edge = { ...connection, originId: result.id, type: "buttonedge", markerEnd: { type: MarkerType.ArrowClosed } }; // type: "buttonedge"
          setEdges((eds) => addEdge(edge, eds));
        } else {
          showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
      }
    },
    [setEdges, data, nodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleAddItemSpecial = async (name, data, approvalId) => {
    const body = {
      employeeId: name === "Bắt đầu" ? 0 : name === "Thành công" ? -1 : -2,
      day: null,
      hour: null,
      minute: null,
      type: data.type,
      position: JSON.stringify(data.position),
      approvalId: approvalId,
    };

    const response = await ApprovalService.updateConfig(body);

    if (response.code === 0) {
      const result = response.result;
      const changeResult = {
        ...data,
        id: `${result.id}`,
        data: {
          label: `${result.employeeId === 0 ? "Bắt đầu" : result.employeeId === -1 ? "Thành công" : "Thất bại"}`,
          name: name,
          employeeId: result.employeeId,
        },
      };

      setNodes([...nodes, changeResult]);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      const name = event.dataTransfer.getData("name");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const conditionStartWidth = name === "Bắt đầu" || name === "Thành công" || name === "Thất bại";

      const newNode = {
        type,
        position,
        data: { label: name },
      } as any;

      if (conditionStartWidth) {
        handleAddItemSpecial(name, newNode, data?.id);
      } else {
        setShowModalAddSigner(true);
        setDataSigner(newNode);
      }
    },
    [reactFlowInstance, data, nodes]
  );

  const handUpdatePostionElements = async (item, lstItem, approvalId) => {
    const body = {
      id: +item.id,
      employeeId: item.data.employeeId,
      day: item.data.day,
      hour: item.data.hour,
      minute: item.data.minute,
      position: JSON.stringify(item.position),
      type: item.type,
      approvalId: approvalId,
    };

    const response = await ApprovalService.updateConfig(body);

    if (response.code === 0) {
      setNodes(lstItem);
    }
  };

  const onNodeDragStop = useCallback(
    (event, node) => {
      // Cập nhật vị trí của nút sau khi di chuyển
      const updatedElements = nodes.map((el) => {
        if (el.id === node.id && el.position) {
          return {
            ...el,
            position: node.position,
          };
        }
        return el;
      });

      handUpdatePostionElements(node, updatedElements, data?.id);
    },
    [nodes, data]
  );

  const handDoubleClick = (e, data) => {
    const value = e.target;

    if (value && ((data && data?.data?.name === "Người ký") || value?.innerText === "Người ký")) {
      setShowModalAddSigner(true);
      setDataSigner(data);
    }
  };

  const handChangeDataSigner = (data) => {
    if (!data) return;

    setNodes((prev) =>
      prev.map((item) => {
        if (item.id === data.id) {
          return {
            ...item,
            data: {
              ...data.data,
            },
          };
        }

        return item;
      })
    );
  };

  const edgeTypes = {
    buttonedge: CustomEdge,
  };

  function CustomEdge(props) {
    const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, target, source } = props;

    const cloneDataNodes = _.cloneDeep(nodes);
    const isMatch = cloneDataNodes.some((el) => el.id == target && el.data.employeeId == -2);

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

  const handRemoveItemNode = async (item) => {
    if (!item) return;

    const takeIdItem = +item[0]["id"];

    const response = await ApprovalService.deleteConfig(takeIdItem);

    if (response.code === 0) {
      // Nếu thành công thì có thể gọi lại api list config hoặc không.
    } else {
      // Nếu như không thành công thông báo lỗi và không cho xóa.
      setNodes([...nodes, ...item]);
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handRemoveItemEdge = async (item) => {
    if (!item) return;

    const takeIdItem = item[0]["originId"];

    const response = await ApprovalService.deleteLink(takeIdItem);

    if (response.code === 0) {
      // Nếu thành công thì có thể gọi lại api list link hoặc không.
    } else {
      setEdges([...edges, ...item]);
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <div className="signature-work-flow-setup">
      <ReactFlowProvider>
        <div className="box__content-left">
          {lstContentLeft.map((item, idx) => {
            let additionalClasses = "";
            let isDraggable = true;

            if (item.name === "Bắt đầu" && conditionStart) {
              additionalClasses = "dis__item-start";
              isDraggable = false;
            }

            if (item.name === "Thành công" && conditionSuccess) {
              additionalClasses = "dis__item-end";
              isDraggable = false;
            }

            if (item.name === "Thất bại" && conditionFaild) {
              additionalClasses = "dis__item-end";
              isDraggable = false;
            }

            if (data && data.status === 1) {
              additionalClasses = "dis__item-end";
              isDraggable = false;
            }

            return (
              <div
                key={idx}
                className={`item__left ${additionalClasses}`}
                style={{ border: `1.3px solid var(${item.color})` }}
                onDragStart={(e) => isDraggable && handDragStart(e, "default", item.name)}
                draggable={isDraggable}
              >
                <span className="name">{item.name}</span>
              </div>
            );
          })}
        </div>
        <div className="box__content-right" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes.map((node) => {
              const labelStartsWithBegin = node.data.label.startsWith("Bắt đầu");
              const labelStartsWithSuccess = node.data.label.startsWith("Thành công");
              const labelStartsWithFaild = node.data.label.startsWith("Thất bại");

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
                  : {},
                type: labelStartsWithBegin ? "input" : labelStartsWithSuccess || labelStartsWithFaild ? "output" : "default",
              };
            })}
            edges={edges}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={(connect) => onConnect(connect)}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onNodeDragStop={onNodeDragStop}
            onDragOver={onDragOver}
            fitView
            onNodeDoubleClick={(e, data) => handDoubleClick(e, data)}
            onNodesDelete={(data) => handRemoveItemNode(data)}
            onEdgesDelete={(data) => handRemoveItemEdge(data)}
            elementsSelectable={data?.status === 1 ? false : true}
            nodesDraggable={true}
            className="flow__signer"
          >
            {/* <MiniMap /> */}
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      <AddSigner
        onShow={showModalAddSigner}
        approvalId={data?.id}
        data={dataSigner}
        takeData={(data) => {
          dataSigner && dataSigner.id ? handChangeDataSigner(data) : setNodes([...nodes, data]);
        }}
        onHide={() => setShowModalAddSigner(false)}
        disabled={data?.status === 1 ? true : false}
      />
    </div>
  );
}
