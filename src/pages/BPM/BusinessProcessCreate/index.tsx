import React, { Fragment, useEffect, useRef, useState } from "react";
import BpmnJS from "bpmn-js/dist/bpmn-modeler.production.min.js";
import { useParams, useNavigate } from "react-router-dom";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import copyPasteModule from "bpmn-js/lib/features/copy-paste";
import keyboardModule from "diagram-js/lib/features/keyboard";
import "./index.scss";
import Button from "components/button/button";
import urls from "configs/urls";
import { handDownloadFileOrigin, showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import Icon from "components/icon";
import ModalImportProcess from "./partials/ModalImportProcess/ModalImportProcess";
import ModalExportProcess from "./partials/ModalExportProcess/ModalExportProcess";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { checkType, eventDefinitionHandlers, EVENT_TYPE_MAP } from "./constant/constant";
import BpmnModals from "./BpmModals/BpmModals";

/**
 * Cho phép tạo mới một quy trình
 * @returns
 */
const BusinessProcessCreate = () => {
  const takeUrlProcessLocalStorage = JSON.parse(localStorage.getItem("backUpUrlProcess") || "");

  const modelerRef = useRef(null);
  const bpmnModeler = useRef(null);
  const tooltipRef = useRef(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const [dataNode, setDataNode] = useState(null);
  const [nodeId, setNodeId] = useState(null);
  const [dataProcess, setDataProcess] = useState(null);
  const [dataConfig, setDataConfig] = useState("");
  const [isExportProcess, setIsExportProcess] = useState(false);
  const [isImportProcess, setIsImportProcess] = useState(false);
  const [listNodeSelected, setListNodeSelected] = useState([]);

  const getDetailBusinessProcess = async (id) => {
    const response = await BusinessProcessService.getDetailDiagram(id);

    if (response.code == 0) {
      const result = response.result;
      if (result.config) {
        setDataConfig(result.config);
        setDataProcess(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (id) {
      getDetailBusinessProcess(id);
    }
  }, [id]);

  // Quản lý modal đang mở
  const [activeModal, setActiveModal] = useState(null);

  const getTypeNode = (element) => {
    let elementType = element.type;
    const eventDef = element.businessObject.eventDefinitions?.[0]?.$type;
    // Check bằng mapping trước
    const map = EVENT_TYPE_MAP[element.type];
    if (map && eventDef && map[eventDef]) {
      elementType = map[eventDef];
    }
    return elementType;
  };

  const addNode = async (element) => {
    const businessObject = element.businessObject;
    const body = {
      name: businessObject.name || "",
      typeNode: getTypeNode(element),
      processId: id,
      nodeId: element.id,
      ...(getTypeNode(element) === "bpmn:CompensationBoundaryEvent" ? { attachToNodeId: businessObject?.attachedToRef?.id } : {}),
    };
    const response = await BusinessProcessService.bpmAddNode(body);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const addNameNode = async (nameNode, element) => {
    const body = {
      name: nameNode || "",
      nodeId: element.id,
    };
    const response = await BusinessProcessService.bpmAddNameNode(body);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const deleteNode = async (nodeId) => {
    const response = await BusinessProcessService.bpmDeleteNode(nodeId);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const addLinkNode = async (element, fromNodeId, toNodeId) => {
    const body = {
      fromNodeId: fromNodeId,
      toNodeId: toNodeId,
      flowType: "normal", //normal, condition
      config: "",
      processId: id,
      linkId: element.id,
    };
    if (body.fromNodeId && body.fromNodeId) {
      const response = await BusinessProcessService.bpmAddLinkNode(body);

      if (response.code == 0) {
        const result = response.result;
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  const deleteLinkNode = async (linkId) => {
    const param = {
      linkId: linkId,
    };
    const response = await BusinessProcessService.bpmDeleteLinkNode(param);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //quy trình con
  const addChildProcess = async (element, projectId) => {
    const body = {
      name: "",
      description: "",
      employeeId: null,
      parentId: projectId,
    };
    const response = await BusinessProcessService.update(body);

    if (response.code == 0) {
      const result = response.result;
      addNodeSubprocess(element, result.id, result.parentId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const addNodeSubprocess = async (element, childProcessId, processId) => {
    const businessObject = element?.businessObject;
    const body = {
      name: businessObject?.name || "",
      typeNode: getTypeNode(element),
      processId: processId,
      childProcessId: childProcessId,
      nodeId: element.id,
      ...(getTypeNode(element) === "bpmn:CompensationBoundaryEvent" ? { attachToNodeId: businessObject?.attachedToRef?.id } : {}),
    };

    const response = await BusinessProcessService.bpmAddNode(body);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailNode = async (nodeId, element) => {
    const response = await BusinessProcessService.bpmDetailNode(nodeId);

    if (response.code == 0) {
      const result = response.result;

      if (element.type === "bpmn:SequenceFlow") {
        addLinkInChildProcess(result?.childProcessId, element);
      } else if (element.type === "bpmn:SubProcess") {
        addChildProcess(element, result?.childProcessId);
      } else {
        addNodeInChildProcess(result?.childProcessId, element);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const addNodeInChildProcess = async (childProcessId, element) => {
    const businessObject = element?.businessObject;
    const body = {
      // id: nodeId || '',
      name: businessObject?.name || "",
      typeNode: getTypeNode(element),
      processId: childProcessId,
      nodeId: element.id,
      ...(getTypeNode(element) === "bpmn:CompensationBoundaryEvent" ? { attachToNodeId: businessObject?.attachedToRef?.id } : {}),
    };
    const response = await BusinessProcessService.bpmAddNode(body);

    if (response.code == 0) {
      const result = response.result;
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const addLinkInChildProcess = async (childProcessId, element) => {
    const fromNodeId = element?.businessObject?.sourceRef?.id;
    const toNodeId = element?.businessObject?.targetRef?.id;

    const body = {
      // id: '',
      fromNodeId: fromNodeId,
      toNodeId: toNodeId,
      flowType: "normal", //normal, condition
      config: "",
      processId: childProcessId,
      linkId: element.id,
    };
    if (body.fromNodeId && body.fromNodeId) {
      const response = await BusinessProcessService.bpmAddLinkNode(body);

      if (response.code == 0) {
        const result = response.result;
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  const [newBpmModeler, setNewBpmModeler] = useState(null);

  const changeNameNodeXML = (dataNode, nameNode) => {
    const elementRegistry = newBpmModeler.get("elementRegistry");
    const modeling = newBpmModeler.get("modeling");
    const elementNew = elementRegistry.get(dataNode.id);

    if (elementNew && elementNew.businessObject && elementNew.businessObject.name !== nameNode) {
      modeling.updateProperties(dataNode, {
        name: nameNode,
      });
      console.log("Tên đã thay đổi:", dataNode.businessObject.name);
    }
  };

  const handleElementClick = (element) => {
    // Nếu là Event thì check EventDefinition trước
    if (
      element.type === "bpmn:StartEvent" ||
      element.type === "bpmn:EndEvent" ||
      element.type === "bpmn:IntermediateThrowEvent" ||
      element.type === "bpmn:IntermediateCatchEvent"
    ) {
      const defType = element.businessObject.eventDefinitions?.[0]?.$type;
      const eventKey = element.type.replace("bpmn:", ""); // ví dụ "StartEvent"

      if (defType && eventDefinitionHandlers[defType]?.[eventKey]) {
        setActiveModal(eventDefinitionHandlers[defType]?.[eventKey]);
        return;
      }

      //nếu là start/end event bình thường không có EventDefinition
      setActiveModal(element.type);
    } else {
      // Các loại Task, Gateway, SequenceFlow...
      setActiveModal(element.type);
    }
  };

  //Ẩn luôn menu "Change Element" trong Context Pad
  function CustomContextPadProvider(contextPad, injector) {
    const replaceMenu = injector.get("replaceMenu", false);
    const modeling = injector.get("modeling");

    contextPad.registerProvider(this);

    this.getContextPadEntries = function (element) {
      const bo = element.businessObject;
      const locked = bo?.$attrs?.lockedChangeElement === "true";

      const entries = {} as Record<string, any>;

      // Chỉ hiển thị nút "Change Element" nếu chưa bị khóa
      if (!locked && replaceMenu && replaceMenu._getReplaceOptions(element).length) {
        entries.replace = {
          group: "edit",
          className: "bpmn-icon-replace",
          title: "Change element type",
          action: {
            click: (event, element) => {
              replaceMenu.open(element, replaceMenu._getReplaceOptions(element));
            },
          },
        };
      }

      //Override lại nút delete mặc định
      entries.delete = {
        group: "edit",
        className: "bpmn-icon-trash",
        title: "Xoá phần tử",
        action: {
          click: (event, element) => {
            showDialogConfirmCancel(element, modeling);
          },
        },
      };

      return entries;
    };
  }

  CustomContextPadProvider.$inject = ["contextPad", "injector"];

  useEffect(() => {
    // Khởi tạo BpmnJS modeler
    let isUpdatingTask = false;
    let isReplacing = false;

    bpmnModeler.current = new BpmnJS({
      container: modelerRef.current,
      width: "100%",
      // height: '600px',
      height: " calc(97.5vh - 165px)",
      keyboard: {
        bindTo: window, // Bắt sự kiện bàn phím toàn cục
      },
      additionalModules: [
        copyPasteModule,
        keyboardModule,
        {
          __init__: ["customContextPad"],
          customContextPad: ["type", CustomContextPadProvider],
        },
      ],
    });

    setNewBpmModeler(bpmnModeler.current);

    //Đánh dấu element đã từng bị thay đổi
    bpmnModeler.current.on("commandStack.shape.replace.executed", function (event) {
      const { newShape } = event.context;

      if (newShape && newShape.businessObject) {
        if (newShape.businessObject.$type !== "bpmn:IntermediateCatchEvent" && newShape.businessObject.$type !== "bpmn:BoundaryEvent") {
          newShape.businessObject.$attrs.lockedChangeElement = "true";
        }
      }
    });

    // Chặn thay đổi loại element tiếp theo
    bpmnModeler.current.on("commandStack.shape.replace.canExecute", function (event) {
      const { context } = event;
      const element = context.oldShape || context.element;

      if (element?.businessObject?.$attrs?.lockedChangeElement === "true") {
        return false; // Chặn thay đổi loại
      }
    });

    const initialDiagram =
      dataConfig ||
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

    // Lắng nghe sự kiện copy
    bpmnModeler.current.on("copyPaste.copyElement", function (event) {
      console.log("Đang copy element:", event.element);
    });

    // Lắng nghe sự kiện paste
    bpmnModeler.current.on("copyPaste.pasteElement", function (event) {
      console.log("Đang paste element:", event.element);
    });

    bpmnModeler.current.on("commandStack.connection.delete.postExecuted", function (event) {
      const connection = event.context.connection;
      if (isReplacing) {
        // Nếu xoá đang diễn ra trong quá trình thay thế, bỏ qua xử lý
        // console.log('Xoá trong quá trình thay thế, bỏ qua.');
        return;
      }

      // Kiểm tra nếu connection là một Sequence Flow
      if (connection.businessObject.$type === "bpmn:SequenceFlow") {
        console.log("Sequence Flow đã bị xoá:", connection);
        isUpdatingTask = true;
        deleteLinkNode(connection?.id);
      }
    });

    bpmnModeler.current.on("commandStack.connection.create.postExecuted", function (event) {
      const connection = event.context.connection;
      const fromNodeId = connection?.businessObject?.sourceRef?.id;
      const toNodeId = connection?.businessObject?.targetRef?.id;
      if (connection?.businessObject?.$parent?.id && connection.businessObject?.$parent?.$type === "bpmn:SubProcess") {
        getDetailNode(connection?.businessObject?.$parent?.id, connection);
      } else {
        addLinkNode(connection, fromNodeId, toNodeId);
      }
    });

    // Trước khi lệnh replace được thực thi
    bpmnModeler.current.on("commandStack.shape.replace.preExecute", function (event) {
      isReplacing = true; // Bắt đầu quá trình thay thế
      console.log("Bắt đầu quá trình thay thế");
    });

    // Sau khi lệnh replace hoàn tất
    bpmnModeler.current.on("commandStack.shape.replace.postExecuted", function (event) {
      isReplacing = false; // Kết thúc quá trình thay thế
      const element = event.context.newShape;
      console.log("Kết thúc quá trình thay thế", element);

      setTimeout(() => {
        if (checkType(element.type)) {
          if (element?.businessObject?.$parent?.id && element.businessObject?.$parent?.$type === "bpmn:SubProcess") {
            getDetailNode(element?.businessObject?.$parent?.id, element);
          } else if (element.type === "bpmn:SubProcess") {
            // khi chuyên sang loại subprocess gọi api để tạo ra process con, lấy id process con cập nhật vào childProcessId của node
            addChildProcess(element, id);
          } else {
            addNode(element);
          }
        }
      }, 1000);
    });

    bpmnModeler.current.on("commandStack.shape.delete.postExecuted", function (event) {
      const { context } = event;
      const deletedElement = context.shape;
      console.log("Element deleted:", deletedElement);
      if (isReplacing) {
        // Nếu xoá đang diễn ra trong quá trình thay thế, bỏ qua xử lý
        // console.log('Xoá trong quá trình thay thế, bỏ qua.');
        deleteNode(deletedElement?.id);
        return;
      }

      isUpdatingTask = true;
      deleteNode(deletedElement?.id);
    });

    bpmnModeler.current.on("commandStack.shape.create.postExecuted", function (event) {
      const element = event.context.shape;
      if (isReplacing) {
        return;
      }
      console.log("element create shape", element);

      // Kiểm tra nếu phần tử là SubProcess
      if (checkType(element.type)) {
        if (element?.businessObject?.$parent?.id && element.businessObject?.$parent?.$type === "bpmn:SubProcess") {
          getDetailNode(element?.businessObject?.$parent?.id, element);
        } else if (element.type === "bpmn:SubProcess") {
          console.log("bpmn:SubProcess");
          // khi chuyên sang loại subprocess gọi api để tạo ra process con, lấy id process con cập nhật vào childProcessId của node
          addChildProcess(element, id);
        } else {
          addNode(element);
        }
      }
    });

    bpmnModeler.current.on("element.changed", (event) => {
      const element = event.element;
      const businessObject = element.businessObject;

      if (isUpdatingTask) {
        isUpdatingTask = false;
        return;
      }

      if (checkType(element.type)) {
        if (element.type === "bpmn:SequenceFlow") {
          if (businessObject && businessObject.name) {
            console.log("Link name changed:", businessObject.name);
          }
          // addLinkNode(element, fromNodeId, toNodeId)
        } else {
          if (businessObject && businessObject.name) {
            console.log("Node name changed:", businessObject.name);
            addNameNode(businessObject.name, element);
          }
        }
      }
    });

    const tooltip = tooltipRef.current;
    // Handle mouse over event
    bpmnModeler.current.on("element.hover", function (event) {
      const element = event.element;
      const name = element.id || "Unnamed";

      if (element.type === "bpmn:SequenceFlow") {
        console.log("Hover vào SequenceFlow:", element.id);
      }

      // Display tooltip
      tooltip.innerHTML = name;
      tooltip.style.display = "block";

      // Position the tooltip near the mouse pointer
      const mousePosition = event.originalEvent;
      tooltip.style.left = `${mousePosition.clientX + 10}px`; // Adjust for better visibility
      tooltip.style.top = `${mousePosition.clientY + 10}px`;
    });

    //Dùng lasso tool để kéo chuột bao chọn được nhiều node
    const eventBus = bpmnModeler.current.get("eventBus");
    // Bắt sự kiện thay đổi selection (đúng thời điểm nhất)
    eventBus.on("selection.changed", (e) => {
      setListNodeSelected(
        e.newSelection.map((e) => {
          return {
            nodeId: e?.id,
            nodeName: e?.businessObject?.name,
          };
        })
      );
    });

    //Hàm để lấy ra nhiều node khi bấm shift và click chọn node
    const hookSelection = (modeler) => {
      const selection = modeler.get("selection");
      const eventBus = modeler.get("eventBus");

      let currentSelection = [];

      eventBus.on("element.click", function (event) {
        const element = event.element;

        // Nếu click vào canvas (root element) thì bỏ chọn hết
        if (!element || element.id === modeler.get("canvas").getRootElement().id) {
          currentSelection = [];
          selection.select([]);
          setListNodeSelected([]);
          return;
        }

        if (event.originalEvent.shiftKey) {
          // Nếu giữ Shift thì toggle
          if (currentSelection.find((e) => e.id === element.id)) {
            currentSelection = currentSelection.filter((e) => e.id !== element.id);
          } else {
            currentSelection = [...currentSelection, element];
          }
        } else {
          // Nếu không giữ Shift -> reset selection
          currentSelection = [element];
        }

        selection.select(currentSelection);
        setListNodeSelected(
          currentSelection.map((e) => {
            return {
              nodeId: e?.id,
              nodeName: e?.businessObject?.name,
            };
          })
        );

        console.log("Multi-select:", currentSelection);
      });
    };

    // Nhập quy trình vào modeler
    bpmnModeler.current
      .importXML(initialDiagram)
      .then(({ warnings }) => {
        hookSelection(bpmnModeler.current);
        if (warnings.length) {
          console.warn("Warnings", warnings);
        }

        bpmnModeler.current.on("element.click", (event) => {
          setNodeId(event.element.id);
          console.log("element.click", event);
        });

        bpmnModeler.current.on("element.dblclick", (event) => {
          const element = event.element;
          console.log("element", element);
          setDataNode(element);
          handleElementClick(element);
        });
      })
      .catch((err) => {
        console.error("Error importing BPMN diagram", err);
      });

    return () => {
      // Cleanup khi component bị hủy
      bpmnModeler.current.destroy();
    };
  }, [dataConfig]);

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

  // Hàm để lưu quy trình dưới dạng XML
  const saveDiagram = async () => {
    try {
      const { xml } = await bpmnModeler.current.saveXML({ format: true });
      console.log("Saved BPMN 2.0 XML", xml);
      const body = {
        id: id,
        config: xml,
      };
      const response = await BusinessProcessService.saveDiagram(body);

      if (response.code === 0) {
        showToast(`Lưu biểu đồ thành công`, "success");
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } catch (err) {
      console.error("Could not save BPMN diagram", err);
    }
  };

  const [isLoadingExport, setIsLoadingEpxort] = useState(false);
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    if (requestId) {
      const timer = setInterval(
        async () => {
          const response = await BusinessProcessService.getUrlExportDataProcess({ requestId: requestId });
          if (response.code == 0) {
            const result = response.result;
            const fileResponse = result.fileResponse;

            if (fileResponse) {
              handDownloadFileOrigin(fileResponse?.fileUrl, fileResponse?.fileName);
              showToast("Xuất dữ liệu thành công", "success");
              clearInterval(timer);
              setRequestId(null);
            }
            setIsLoadingEpxort(false);
          }
        },
        2000,
        requestId
      );

      return () => clearInterval(timer);
    }
  }, [requestId]);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [contentConfirmDelete, setContentConfirmDelete] = useState<IContentDialog>(null);

  const showDialogConfirmCancel = (element, modeling) => {
    const businessObject = element?.businessObject;
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Xoá ${element?.type === "bpmn:SequenceFlow" ? "Link Node" : "Node"} `}</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xoá {element?.type === "bpmn:SequenceFlow" ? "Link Node" : "Node"}{" "}
          <span style={{ fontWeight: "700" }}>{businessObject?.name || businessObject?.id}</span> ? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowConfirmDelete(false);
        setContentConfirmDelete(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        //thực hiện confirm xoá node
        modeling.removeElements([element]);
        setShowConfirmDelete(false);
        setContentConfirmDelete(null);
      },
    };
    setContentConfirmDelete(contentDialog);
    setShowConfirmDelete(true);
  };

  const clearModalNode = () => {
    setDataNode(null);
    setActiveModal(null);
  };

  return (
    <div>
      <div
        ref={modelerRef}
        style={{
          border: "1px solid #ccc",
          // height:' calc(100vh - 165px)',
          height: " calc(97.5vh - 165px)",
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
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "80%" }}>
          <span style={{ fontSize: 14 }}>Quy trình: {dataProcess?.name}</span>
        </div>
        <div style={{ fontSize: 14 }} ref={tooltipRef} />
      </div>

      <div style={{ display: "flex", marginTop: "1rem", justifyContent: "space-between" }}>
        <div style={{ display: "flex" }}>
          <div style={{ marginRight: "1rem" }}>
            <Button
              color="primary"
              variant="outline"
              onClick={(e) => {
                navigate(
                  `${urls.manage_processes}?page=${takeUrlProcessLocalStorage?.page || 1}` +
                    `${takeUrlProcessLocalStorage?.name ? `&name=${takeUrlProcessLocalStorage?.name}` : ""}`
                );
              }}
            >
              Quay lại
            </Button>
          </div>
          <Button color="primary" onClick={saveDiagram}>
            Lưu
          </Button>
        </div>

        <div style={{ display: "flex", gap: "0 1rem", alignItems: "flex-start" }}>
          <div
            className="button-import"
            onClick={() => {
              setIsImportProcess(true);
            }}
          >
            Import
          </div>
          <div
            className="button-export"
            onClick={() => {
              setIsExportProcess(true);
            }}
          >
            Export
            {isLoadingExport && <Icon name="Loading" />}
          </div>
        </div>
      </div>

      <Dialog content={contentConfirmDelete} isOpen={showConfirmDelete} />

      <BpmnModals
        activeModal={activeModal}
        dataNode={dataNode}
        processId={id}
        clearModalNode={clearModalNode}
        changeNameNodeXML={changeNameNodeXML}
        setDataNode={setDataNode}
      />

      <ModalImportProcess
        onShow={isImportProcess}
        processId={id}
        onHide={(reload) => {
          if (reload) {
            getDetailBusinessProcess(id);
          }
          setIsImportProcess(false);
          clearModalNode();
        }}
      />
      <ModalExportProcess
        onShow={isExportProcess}
        processId={id}
        listNodeSelected={listNodeSelected}
        onHide={(reload) => {
          if (reload) {
            getDetailBusinessProcess(id);
          }
          setIsExportProcess(false);
          clearModalNode();
        }}
      />
    </div>
  );
};

export default BusinessProcessCreate;
