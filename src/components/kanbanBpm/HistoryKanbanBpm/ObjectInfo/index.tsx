import Loading from "components/loading";
import FormViewerComponent from "pages/BPM/BpmForm/FormViewer";
import React, { useEffect, useRef, useState } from "react";
import ObjectGroupService from "services/ObjectGroupService";
import { showToast } from "utils/common";
import "./index.scss";

const defaultSchema = {
  type: "default",
  components: [],
};

export default function ObjectInfo({ data }) {
  const formViewerRef = useRef(null);
  const formContainerRef = useRef(null);
  const [initFormSchema, setInitFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [dataInit, setDataInit] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (data) {
      let idGroupId = data?.processedObject?.groupId || null;
      setIsLoading(true);
      getOjectGroup(idGroupId);
      // BE phải xử lý data trả về objectInfo để chứa thông tin hồ sơ trả vào formviewer, orderRequest ở đây chỉ là lấy tạm ở quy trình invoice để test
      setDataInit(data?.objectInfo || data?.orderRequest || {});
    }
  }, [data]);

  const getOjectGroup = async (id: any) => {
    const response = await ObjectGroupService.detail(id);
    if (response.code === 0) {
      const result = response?.result;
      const configForm = result?.config ? JSON.parse(result.config) : defaultSchema;
      setInitFormSchema(configForm && Object.keys(configForm).length > 0 ? configForm : defaultSchema);
    } else if (response.code == 400) {
      showToast("Không có quyền truy cập", "error");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  return (
    <div className="bpm-form-viewer-object-info" style={{ width: "100%", pointerEvents: "auto" }}>
      <div className="form-viewer-container">
        {isLoading ? (
          <Loading />
        ) : (
          <FormViewerComponent
            formContainerRef={formContainerRef}
            formViewerRef={formViewerRef}
            formSchema={initFormSchema}
            onSchemaSubmit={() => {}}
            setShowPopupCustom={() => {}}
            setCodePopupCustom={() => {}}
            dataInit={dataInit}
            contextData={{
              nodeId: "",
              processId: "",
              potId: "",
              workId: "",
              workName: "",
              procurementTypeId: "",
            }}
            showOnRejectModal={false}
            setDataSchemaDraft={(data) => {}}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      </div>
    </div>
  );
}
