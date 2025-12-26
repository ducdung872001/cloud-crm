/* eslint-disable prefer-const */
import React, { useContext, useEffect, useRef, useState } from "react";
import { showToast } from "utils/common";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";
import _, { forEach } from "lodash";
import Button from "components/button/button";
import Loading from "components/loading";
import FormViewerComponent from "pages/BPM/BpmForm/FormViewer";
import ObjectGroupService from "services/ObjectGroupService";
import { mapConfigData } from "utils/mapConfigData";
import ContractService from "services/ContractService";
import moment from "moment";
import ContractAttributeService from "services/ContractAttributeService";
import ContractExtraInfoService from "services/ContractExtraInfoService";
import { useNavigate } from "react-router-dom";
import { name } from "jssip";
import { ca } from "date-fns/locale";
import { pipe, template } from "lodash/fp";

const defaultSchema = {
  type: "default",
  components: [],
};

const XMLtype = "addContract";

const getContractsAttributes = async () => {
  let dataOption = null;
  const response = await ContractAttributeService.listAll(0);
  if (response.code === 0) {
    dataOption = response.result || {};
    return dataOption;
  }
  return dataOption;
};

const getContractsExtraInfos = async (id) => {
  const response = await ContractExtraInfoService.list(id);
  return response.result ?? [];
};

const getOjectGroup = async (type: any) => {
  const response = await ObjectGroupService.detailByType(type);
  if (response.code === 0) {
    const result = response?.result;
    const configForm = result?.config ? JSON.parse(result.config) : defaultSchema;
    if (configForm && Object.keys(configForm).length > 0) {
      return configForm;
    }
  } else if (response.code == 400) {
    showToast(response.message, "error");
  } else {
    showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  }
  return defaultSchema;
};

export default function CreateContractsXML(props: any) {
  const { data, onHide, takeInfoCustomer } = props;
  const navigate = useNavigate();

  const formContainerRef = useRef(null);
  const formViewerRef = useRef(null);
  const checkUserRoot = localStorage.getItem("user.root");
  const [showFullScreen] = useState<boolean>(true);
  const [initFormSchema, setInitFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [dataSchema, setDataSchema] = useState(null);
  const [dataInit, setDataInit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [contractsExtraInfos, setContractsExtraInfos] = useState<any>([]);

  const [mapContractsAttribute, setMapContractsAttribute] = useState<any>(null);

  const [tab, setTab] = useState(1);
  const tabData = [
    {
      value: 1,
      label: "Thông tin hợp đồng",
    },
    {
      value: 2,
      label: "Thông tin phụ lục",
    },
    {
      value: 3,
      label: "Thông tin tiến độ",
    },
    {
      value: 4,
      label: "Quản lý cọc",
    },
    {
      value: 5,
      label: "Tài liệu",
    },
  ];

  const toFormDate = (value) => {
    if (!value) return "";
    return moment(value).format("YYYY-MM-DD");
  };

  const toApiDate = (value: any) => {
    return value ? moment(value, ["MM-DD-YYYY", moment.ISO_8601]).format("YYYY-MM-DDTHH:mm:ss") : "";
  };

  const mapAttachmentsFromApi = (attachments: any) => {
    if (!attachments) return [];

    let parsed = attachments;

    try {
      parsed = typeof attachments === "string" ? JSON.parse(attachments) : attachments;
    } catch (e) {
      return [];
    }

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        // Chấp nhận cả dạng string url lẫn object { url, name, type, size }
        const url =
          typeof item === "string"
            ? item
            : item && typeof item === "object"
              ? item.url || item.path || item.link || ""
              : "";

        if (!url) return null;

        const fallbackName = decodeURIComponent(url.split("/").pop() || "file.pdf");
        const name =
          typeof item === "object" && item?.name
            ? item.name
            : fallbackName;
        const ext =
          typeof item === "object" && item?.type
            ? item.type
            : name.split(".").pop()?.toLowerCase() || "file";

        return {
          uid: typeof item === "object" && item?.uid ? item.uid : url,
          url,
          name,
          type: ext,
          size: (typeof item === "object" && item?.size) || 1,
          status: "done",
        };
      })
      .filter(Boolean);
  };


  useEffect(() => {
    //exceptionField để map những field đặc biệt không theo quy tắc chung (ví dụ phone => phoneMasked)
    const exceptionField = {
      phone: "phoneMasked",
      email: "emailMasked",
    };
    const getAlldata = async () => {
      const configInit = await getOjectGroup(XMLtype);
      const mapAttribute = await getContractsAttributes();
      const extraInfos = data?.id ? await getContractsExtraInfos(data?.id) : [];
      const mapped = mapConfigData(configInit, data, mapAttribute, extraInfos, exceptionField);

      if (data?.id) {

        mapped.beneficiaryType = String(mapped.beneficiaryType);
        mapped.competencyType = String(mapped.competencyType);

        mapped.endDate = toFormDate(mapped.endDate);
        mapped.signDate = toFormDate(mapped.signDate);
        mapped.affectedDate = toFormDate(mapped.affectedDate);
        mapped.adjustDate = toFormDate(mapped.adjustDate);
        if (mapped.beneficiaryId) {
          if (mapped.beneficiaryType == "0") {
            mapped.beneficiaryId_customer = mapped.beneficiaryId;
          } else {
            mapped.beneficiaryId_partner = mapped.beneficiaryId;
          }
        }

        if (mapped.competencyId) {
          if (mapped.competencyType == "0") {
            mapped.competencyId_customer = mapped.competencyId;
          } else {
            mapped.competencyId_partner = mapped.competencyId;
          }
        }
        mapped.attachments = JSON.stringify(
          mapAttachmentsFromApi(mapped.attachments)
        );
        setDataInit(mapped);
      }

      console.log(mapped);
      setInitFormSchema(configInit);
      setMapContractsAttribute(mapAttribute);
      setContractsExtraInfos(extraInfos);
      setIsLoading(false);
    };
    if (XMLtype) {
      getAlldata();
    }
  }, [data, XMLtype]);

  const onSubmit = async (config) => {
    setIsSubmit(true);

    // Các trường thông tin bổ sung
    let infoExtra = [];
    forEach(mapContractsAttribute, (itemInfo) => {
      forEach(itemInfo, (item) => {
        const info = itemInfo.find((info) => config[info.fieldName] && item.parentId != 0);
        if (info) {
          infoExtra.push({
            ...{
              attributeId: item.id,
              contractId: data?.id ?? 0,
              attributeValue:
                config[item.fieldName] && typeof config[item.fieldName] == "object" ? JSON.stringify(config[item.fieldName]) : config[item.fieldName],
            },
            ...(contractsExtraInfos.find((el) => el.attributeId == item.id)?.id
              ? {
                id: contractsExtraInfos.find((el) => el.attributeId == item.id)?.id,
              }
              : {}),
          });
        }
      });
    });


    let attachmentList: any[] = [];
    try {
      attachmentList = typeof config.attachments === "string" ? JSON.parse(config.attachments ?? "[]") : config.attachments ?? [];
    } catch (e) {
      attachmentList = [];
    }

    const attachmentUrls = attachmentList
      ?.map((item: any) => {
        if (!item) return null;
        if (typeof item === "string") return item;
        if (typeof item === "object") return item.url || item.path || item.link || null;
        return null;
      })
      .filter(Boolean);

    let body: any = {
      ...(data ? data : {}),
      name: config.name || "",
      bussinessPartnerId: config.bussinessPartnerId || null,
      categoryId: config.categoryId || null,
      custType : config.custType ?? 0,
      customerId : config.customerId || null,
      taxCode: config.taxCode || "",
      contractNo: config.contractNo || "",
      dealValue: config.dealValue || 0,
      employeeId: config.employeeId || null,
      fsId: config.fsId || null,
      pipelineId: config.pipelineId || null,
      projectId: config.projectId || null,
      requestId: config.requestId || null,
      timestamp: config.timestamp || null,
      peopleInvoleved: config.peopleInvolved || null,
      signDate: toApiDate(config.signDate),
      affectedDate: toApiDate(config.affectedDate),
      adjusadjustDate: toApiDate(config.adjustDate),
      endDate: toApiDate(config.endDate),
      template: JSON.stringify(attachmentUrls || "" ),
      branchId: checkUserRoot == "1" ? data?.branchId ?? dataBranch.value ?? null : 0,
      contractExtraInfos: infoExtra,
    };

    console.log(body);

    const response = await ContractService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} bảo hành thành công`, "success");
      handleClear(true);
      takeInfoCustomer && takeInfoCustomer(response.result);
    } else {
      if (response.error) {
        showToast(response.error, "error");
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }

    setIsSubmit(false);
  };

  const handleClear = (acc) => {
    onHide(acc);
    setContractsExtraInfos([]);
    setDataInit(null);
    setInitFormSchema(defaultSchema);
    setMapContractsAttribute(null);
    setContractsExtraInfos([]);
  };

  const handleSubmit = async () => {
    // prevent double submits
    if (isSubmit) return;
    setIsSubmit(true);
    try {
      if (formViewerRef.current && typeof formViewerRef.current.submit === "function") {
        await formViewerRef.current.submit();
        // Note: FormViewerComponent will call the provided onSchemaSubmit when the viewer emits 'submit'.
      } else {
        // Fallback to existing local handler
        // await handleSubmit();
      }
    } catch (err) {
      console.error("Submit failed", err);
      showToast("Có lỗi khi gửi biểu mẫu", "error");
    } finally {
      setIsSubmit(false);
    }
  };

  // Callback để nhận schema khi người dùng thay đổi trong FormEditor
  const handleSchemaSubmit = (newSchema, reject, contextData) => {
    setDataSchema(newSchema);
    onSubmit(newSchema);
  };

  return (
    <div className="page-content page-create-contracts-xml">
      <div className="action-navigation">
        <h1>TẠO HỢP ĐỒNG</h1>
      </div>
      <div style={{ display: "flex", marginBottom: 10 }}>
        {tabData.map((item, index) => (
          <div
            key={index}
            style={{ borderBottom: tab === item.value ? "1px solid" : "", paddingLeft: 12, paddingRight: 12, paddingBottom: 3, cursor: "pointer" }}
            onClick={() => {
              if (!isLoading) {
                setTab(item.value);
              }
            }}
          >
            <span style={{ fontSize: 16, fontWeight: "500", color: tab === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className={tab === 1 ? "" : "tab-hidden"}>
        <div className="card-box">
          <form className="form-handle-task" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="container_handle_task-modal">
              {/* Form Viewer để hiển thị form => truyền vào nodeId, processId, và potId */}
              {initFormSchema?.components?.length == 0 ? (
                <div className="loading-center">
                <Loading />
              </div>
              ) : (
                <div style={{ width: "100%", pointerEvents: "auto" }}>
                  <FormViewerComponent
                    formContainerRef={formContainerRef}
                    formViewerRef={formViewerRef}
                    formSchema={initFormSchema}
                    onSchemaSubmit={handleSchemaSubmit}
                    dataInit={dataInit}
                    contextData={{}}
                    showOnRejectModal={false}
                    onValidationError={() => {
                      setIsSubmit(false);
                    }}
                    setDataSchemaDraft={(data) => { }}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                </div>
              )}
            </div>
            <div className="container-footer" style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "1rem", borderTop: "1px solid #e9ecef" }}>
              <Button
                onClick={() => handleClear(false)}
                type="button"
                color="primary"
                variant="outline"
                disabled={isSubmit}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                type="button"
                color="primary"
                disabled={isSubmit}
              >
                {isSubmit ? "Đang xử lý..." : (data ? "Cập nhật" : "Tạo mới")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
