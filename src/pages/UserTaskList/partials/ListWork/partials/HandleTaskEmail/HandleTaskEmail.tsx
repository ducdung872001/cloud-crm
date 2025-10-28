import FormViewerComponent from "pages/BPM/BpmForm/FormViewer";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSearchParameters } from "reborn-util";
import BusinessProcessService from "services/BusinessProcessService";
import WorkOrderService from "services/WorkOrderService";
import { showToast } from "utils/common";
import "./HandleTaskEmail.scss";

const defaultSchema = {
  type: "default",
  components: [],
};

const HandleTaskEmail = () => {
  const navigation = useNavigate();

  const params: any = getSearchParameters();

  useEffect(() => {
    if (params && params.workId) {
      navigation("/bpm/task_assignment", { state: { viewDetail: true, workId: params.workId } });
    }
  }, [params]);
  const formContainerRef = useRef(null);
  const formViewerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [dataWork, setDataWork] = useState(null);

  const getDetailWork = async (id) => {
    if (!id) return;
    const response = await WorkOrderService.detail(id);

    if (response.code == 0) {
      const result = response.result;
      setDataWork(result);
      const contextData = result?.contextData && JSON.parse(result?.contextData);
      setContextData(contextData);
      getDetailTask(contextData.nodeId);
      getDataForm(contextData?.potId, contextData?.nodeId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };
  // useEffect(() => {
  //     if(params && params.workId){
  //         getDetailWork(params.workId)
  //     }
  // }, [params?.workId])

  const [dataInit, setDataInit] = useState(null);
  const [contextData, setContextData] = useState({ nodeId: "", processId: 0, potId: 0 });

  const getDetailTask = async (id) => {
    const response = await BusinessProcessService.detailUserTask(id);

    if (response.code == 0) {
      const result = response.result;
      const config = (result.config && JSON.parse(result.config)) || null;
      if (config) {
        setInitFormSchema(config);
        setFormSchema(config);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataForm = async (potId, nodeId) => {
    const params = {
      potId: potId,
      nodeId: nodeId,
    };
    const response = await BusinessProcessService.getDataForm(params);

    if (response.code == 0) {
      const result = response.result;
      const attributeValue = (result?.attributeValue && JSON.parse(result?.attributeValue)) || null;
      console.log("attributeValue", attributeValue);
      setDataInit(attributeValue);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  // useEffect(() => {
  //     if (dataWork ) {
  //         const contextData = dataWork?.contextData && JSON.parse(dataWork?.contextData);
  //         setContextData(contextData);
  //         getDetailTask(contextData.nodeId);
  //         getDataForm(contextData?.potId, contextData?.nodeId);
  //     }
  // }, [dataWork])

  const [formSchema, setFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [initFormSchema, setInitFormSchema] = useState(defaultSchema); // Lưu trữ schema
  console.log("initFormSchema", initFormSchema);

  // Callback để nhận schema khi người dùng thay đổi trong FormEditor
  const handleSchemaSubmit = (newSchema) => {
    // setFormSchema(newSchema); // Cập nhật schema mới
    console.log("Schema mới:", newSchema);
    onSubmit(newSchema);
  };

  const onSubmit = async (config) => {
    const contextData = dataWork?.contextData && JSON.parse(dataWork?.contextData);

    const body = {
      nodeId: contextData?.nodeId,
      processId: contextData?.processId,
      potId: contextData?.potId,
      config: JSON.stringify(config),
    };

    console.log("body", body);

    const response = await BusinessProcessService.updateHandleTask(body);

    if (response.code === 0) {
      showToast(`Xử lý nhiệm vụ thành công`, "success");
      localStorage.setItem("isKanbanBusinessProcess", JSON.stringify(false));
      setTimeout(() => {
        navigation("/bpm/manage_processes");
      }, 500);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const ReceiveProcessedObjectLog = async () => {
    const body = {
      nodeId: contextData?.nodeId,
      potId: contextData?.potId,
    };
    const response = await BusinessProcessService.receiveProcessedObjectLog(body);

    if (response.code === 0) {
      showToast(`Tiến nhận thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const OnholdProcessedObjectLog = async () => {
    const body = {
      nodeId: contextData?.nodeId,
      potId: contextData?.potId,
    };
    const response = await BusinessProcessService.onholdProcessedObjectLog(body);

    if (response.code === 0) {
      showToast(`Tạm dừng thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <div className="handle-task-email card-box">
      {dataWork?.name ? (
        <div className="container-header">
          <div>
            <h2>{dataWork?.name}</h2>
          </div>
          <div className="container-button">
            <div
              className="button-action"
              onClick={() => {
                ReceiveProcessedObjectLog();
              }}
            >
              <span style={{ fontSize: 12, fontWeight: "600" }}>Tiếp nhận</span>
            </div>
            <div
              className="button-action"
              onClick={() => {
                OnholdProcessedObjectLog();
              }}
            >
              <span style={{ fontSize: 12, fontWeight: "600" }}>Tạm dừng</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Form Viewer để hiển thị form => truyền vào nodeId, processId, và potId */}
      {/* <FormViewerComponent
                formContainerRef={formContainerRef}
                formViewerRef={formViewerRef}
                formSchema={initFormSchema}
                onSchemaSubmit={handleSchemaSubmit}
                dataInit={dataInit}
                contextData={{
                    nodeId: contextData?.nodeId,
                    processId: contextData?.processId,
                    potId: contextData?.potId,
                    workId: dataWork?.id,
                    workName: dataWork?.nodeName,
                    procurementTypeId: dataWork?.procurementTypeId
                }}
                // showOnRejectModal={showOnRejectModal || showOnHoldModal}
                showOnRejectModal={false}
                setDataSchemaDraft={() => {}}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
            /> */}
    </div>
  );
};

export default HandleTaskEmail;
