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
import { showToast } from "utils/common";
import AddDepartmentSupport from "./partials/AddDepartmentSupport";
import SupportCommonService from "services/SupportCommonService";

import "./index.scss";

interface ISetupSupportWarrantyProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
}

export default function SetupSupportWarranty(props: ISetupSupportWarrantyProps) {
  const { onShow, data, onHide } = props;

  const [lstSupport, setLstSupport] = useState([]);
  const [lstLinkSupport, setLstLinkSupport] = useState([]);

  const handleGetConfigSupport = async (id: number) => {
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

  const handGetLinkSupport = async (id: number) => {
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
    if (onShow && data) {
      handleGetConfigSupport(data.id);
      handGetLinkSupport(data.id);
    }
  }, [onShow, data]);

  const reactFlowWrapper = useRef(null);

  const lstContentLeft = [
    {
      name: "Bắt đầu",
      color: "--extra-color-50",
    },
    {
      name: "Phòng ban",
      color: "--warning-darker-color",
    },
    {
      name: "Hoàn thành",
      color: "--success-darker-color",
    },
    {
      name: "Từ chối",
      color: "--error-darker-color",
    },
  ];

  const [showModalAddDepartmentSupport, setShowModalAddDepartmentSupport] = useState<boolean>(false);

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

  const conditionStart = nodes && nodes.filter((item) => item.data?.departmentId === 0).length > 0;
  const conditionSuccess = nodes && nodes.filter((item) => item.data?.departmentId === -1).length > 0;
  const conditionFaild = nodes && nodes.filter((item) => item.data?.departmentId === -2).length > 0;

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

  const onConnect = useCallback(
    async (connection) => {
      const { source, target } = connection;

      const conditionStatus = nodes.filter((item) => item.id === target).filter((el) => el.data.departmentId === -2).length > 0;

      const conditionSource = nodes.find((item) => item.id === source).data.departmentId;

      const conditionTarget = nodes.find((item) => item.id === target).data.departmentId;

      if (conditionSource === 0 && (conditionTarget === -1 || conditionTarget === -2)) {
        showToast(
          `${conditionSource === 0 && "Bắt đầu"} không được nối đến ${
            conditionTarget === -1 ? "Hoàn thành" : conditionTarget === -2 ? "Từ chối" : ""
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
          supportId: data?.id,
        };

        const response = await SupportCommonService.updateLink(body);

        if (response.code === 0) {
          const result = response.result;
          const edge = { ...connection, originId: result.id, type: "buttonedge", markerEnd: { type: MarkerType.ArrowClosed } };
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

  const handleAddItemSpecial = async (name, data, supportId) => {
    const body = {
      departmentId: name === "Bắt đầu" ? 0 : name === "Hoàn thành" ? -1 : -2,
      employees: "[]",
      day: null,
      hour: null,
      minute: null,
      type: data.type,
      position: JSON.stringify(data.position),
      supportId: supportId,
    };

    const response = await SupportCommonService.updateConfig(body);

    if (response.code === 0) {
      const result = response.result;
      const changeResult = {
        ...data,
        id: `${result.id}`,
        data: {
          label: `${result.departmentId === 0 ? "Bắt đầu" : result.departmentId === -1 ? "Hoàn thành" : "Từ chối"}`,
          name: name,
          departmentId: result.departmentId,
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

      const conditionStartWidth = name === "Bắt đầu" || name === "Hoàn thành" || name === "Từ chối";

      const newNode = {
        type,
        position,
        data: { label: name },
      } as any;

      if (conditionStartWidth) {
        handleAddItemSpecial(name, newNode, data?.id);
      } else {
        setShowModalAddDepartmentSupport(true);
        setDataSigner(newNode);
      }
    },
    [reactFlowInstance, data, nodes]
  );

  const handUpdatePostionElements = async (item, lstItem, supportId) => {
    const body = {
      id: +item.id,
      departmentId: item.data.departmentId,
      employees: item.data.employees,
      day: item.data.day,
      hour: item.data.hour,
      minute: item.data.minute,
      position: JSON.stringify(item.position),
      type: item.type,
      supportId: supportId,
    };

    const response = await SupportCommonService.updateConfig(body);

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

    if (value && ((data && data?.data?.name === "Phòng ban") || value?.innerText === "Phòng ban")) {
      setShowModalAddDepartmentSupport(true);
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

  const handRemoveItemNode = async (item) => {
    if (!item) return;

    const takeIdItem = +item[0]["id"];

    const response = await SupportCommonService.deleteConfig(takeIdItem);

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

    const response = await SupportCommonService.deleteLink(takeIdItem);

    if (response.code === 0) {
      // Nếu thành công thì có thể gọi lại api list link hoặc không.
    } else {
      setEdges([...edges, ...item]);
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <div className="setup__support--warranty">
      <ReactFlowProvider>
        <div className="box__content-left">
          {lstContentLeft.map((item, idx) => {
            let additionalClasses = "";
            let isDraggable = true;

            if (item.name === "Bắt đầu" && conditionStart) {
              additionalClasses = "dis__item-start";
              isDraggable = false;
            }

            if (item.name === "Hoàn thành" && conditionSuccess) {
              additionalClasses = "dis__item-end";
              isDraggable = false;
            }

            if (item.name === "Từ chối" && conditionFaild) {
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
              const labelStartsWithSuccess = node.data.label.startsWith("Hoàn thành");
              const labelStartsWithFaild = node.data.label.startsWith("Từ chối");

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
      <AddDepartmentSupport
        onShow={showModalAddDepartmentSupport}
        supportId={data?.id}
        data={dataSigner}
        takeData={(data) => {
          dataSigner && dataSigner.id ? handChangeDataSigner(data) : setNodes([...nodes, data]);
        }}
        onHide={() => setShowModalAddDepartmentSupport(false)}
        disabled={data?.status === 1 ? true : false}
      />
    </div>
  );
}
