import FormViewerComponent from "pages/BPM/BpmForm/FormViewer";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import "./HandleTask.scss";
import OnHoldModal from "./OnHoldModal/OnHoldModal";

const defaultSchema = {
  type: "default",
  components: [
    // {
    //   "key": "firstName",
    //   "label": "First Name",
    //   "type": "textfield",
    //   "defaultValue": "",
    //   "validate": {
    //     "required": true
    //   }
    // },
    // {
    //   "key": "lastName",
    //   "label": "Last Name",
    //   "type": "textfield",
    //   "defaultValue": "",
    //   "validate": {
    //     "required": true
    //   }
    // },
    // {
    //   "key": "age",
    //   "label": "Age",
    //   "type": "number",
    //   "defaultValue": 18,
    //   "validate": {
    //     "required": true,
    //     "min": 18,
    //     "max": 100
    //   }
    // },
    // {
    //   "key": "gender",
    //   "label": "Gender",
    //   "type": "radio",
    //   "options": [
    //     { "label": "Male", "value": "male" },
    //     { "label": "Female", "value": "female" },
    //     { "label": "Other", "value": "other" }
    //   ],
    //   "defaultValue": "male"
    // },
    // {
    //   "key": "country",
    //   "label": "Country",
    //   "type": "select",
    //   "options": [
    //     { "label": "USA", "value": "usa" },
    //     { "label": "Canada", "value": "canada" },
    //     { "label": "UK", "value": "uk" }
    //   ],
    //   "defaultValue": "usa"
    // },
    // {
    //   "key": "acceptTerms",
    //   "label": "Accept Terms and Conditions",
    //   "type": "checkbox",
    //   "defaultValue": false,
    //   "validate": {
    //     "required": true
    //   }
    // },
    // {
    //   "key": "submit",
    //   "label": "Submit",
    //   "type": "button",
    //   "action": "submit"
    // }
  ],
};

const HandleTask = ({ onShow, dataWork }) => {
  console.log("dataWork", dataWork);
  const navigation = useNavigate();
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

  useEffect(() => {
    if (dataWork && onShow) {
      const contextData = dataWork?.contextData && JSON.parse(dataWork?.contextData);
      setContextData(contextData);
      getDetailTask(contextData.nodeId);
      getDataForm(contextData?.potId, contextData?.nodeId);
    }
  }, [dataWork, onShow]);

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
      workId: dataWork.id,
    };

    console.log("body", body);

    const response = await BusinessProcessService.updateHandleTask(body);

    if (response.code === 0) {
      showToast(`Xử lý nhiệm vụ thành công`, "success");
      localStorage.setItem("isKanbanBusinessProcess", JSON.stringify(true));
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
      showToast(`Tiếp nhận thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [showOnHoldModal, setShowOnHoldModal] = useState(false);

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

  const formContainerRef = useRef(null);
  const formViewerRef = useRef(null);

  return (
    <div className="container_handle_task">
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
                // OnholdProcessedObjectLog();
                setShowOnHoldModal(true);
              }}
            >
              <span style={{ fontSize: 12, fontWeight: "600" }}>Tạm dừng</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Form Viewer để hiển thị form => truyền vào nodeId, processId, và potId */}
      <FormViewerComponent
        formContainerRef={formContainerRef}
        formViewerRef={formViewerRef}
        formSchema={initFormSchema}
        onSchemaSubmit={handleSchemaSubmit}
        dataInit={dataInit}
        contextData={{
          nodeId: contextData?.nodeId,
          processId: contextData?.processId,
          potId: contextData?.potId,
        }}
        showOnRejectModal={false}
        setDataSchemaDraft={() => {}}
      />

      {/* <OnHoldModal
                onShow={showOnHoldModal}
                data={dataWork}
                onHide={(reload) => {
                    if (reload) {
                        // getListWorkTime(params);
                    }
                    setShowOnHoldModal(false);
                }}
            /> */}
    </div>
  );
};

export default HandleTask;
