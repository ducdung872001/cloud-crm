/* eslint-disable prefer-const */
import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { showToast } from "utils/common";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";
import _, { forEach, map } from "lodash";
import Button from "components/button/button";
import Loading from "components/loading";
import FormViewerComponent from "pages/BPM/BpmForm/FormViewer";
import ObjectGroupService from "services/ObjectGroupService";
import { mapConfigData } from "utils/mapConfigData";
import ContractService from "services/ContractService";
import moment from "moment";
import ContractAttributeService from "services/ContractAttributeService";
import ContractExtraInfoService from "services/ContractExtraInfoService";
import { useNavigate, useParams } from "react-router-dom";
import { name } from "jssip";
import { ca } from "date-fns/locale";
import { pipe, template } from "lodash/fp";
import ContractCategoryService from "services/ContractCategoryService";
import EmployeeService from "services/EmployeeService";
import ContractPipelineService from "services/ContractPipelineService";
import WorkProjectService from "services/WorkProjectService";
import ContactService from "services/ContactService";
import PartnerService from "services/PartnerService";
import TitleAction from "components/titleAction/titleAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";

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
  const { data, takeInfoCustomer } = props;
  const navigate = useNavigate();
  const { id } = useParams();

  document.title = `${id && +id > 0 ? "Cập nhật" : "Tạo"} hợp đồng`;

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

  const mapTemplate = (template: any) => {
    if (!template) return "";

    // nếu BE trả string thì parse
    let data = template;
    if (typeof template === "string") {
      try {
        data = JSON.parse(template);
      } catch {
        return "";
      }
    }

    // nếu không đúng format
    if (!data.fileUrl) return "";

    const fileName = data.fileName || data.fileUrl.split("/").pop() || "file.pdf";
    const ext = fileName.split(".").pop()?.toLowerCase() || "pdf";

    return JSON.stringify([
      {
        uid: data.fileUrl,
        url: data.fileUrl,
        name: fileName,
        type: ext,
        size: 1,        // fake size cho upload component
        status: "done", // QUAN TRỌNG cho FormViewer / Upload
      },
    ]);
  };


  const getContractDetail = async (id) => {
    const res = await ContractService.detail(id);
    if (res.code === 0) return res.result;
    return null;
  };

  useEffect(() => {
    // exceptionField để map những field đặc biệt không theo quy tắc chung (ví dụ phone => phoneMasked)
    const exceptionField = {
      phone: "phoneMasked",
      email: "emailMasked",
    };
    const init = async () => {
      setIsLoading(true);

      const configInit = await getOjectGroup(XMLtype);
      const mapAttribute = await getContractsAttributes();
      let contractData = null;
      if (id) {
        contractData = await getContractDetail(id);
      }
      const extraInfos = contractData?.id ? await getContractsExtraInfos(contractData.id) : [];
      const mapped = mapConfigData(configInit, contractData, mapAttribute, extraInfos, exceptionField);

      if (mapped) {

        mapped.endDate = toFormDate(mapped.endDate);
        mapped.signDate = toFormDate(mapped.signDate);
        mapped.affectedDate = toFormDate(mapped.affectedDate);
        mapped.adjustDate = toFormDate(mapped.adjustDate);
        mapped.template = mapTemplate(mapped.template);

        mapped.contractCategoryId = mapped.categoryId;

        // Check xem là khách hàng hay đối tác
        if (mapped.customerId) {
          mapped.typeContract = "1"; // Khách hàng
          mapped.custType = mapped.custType ?? 0;
        } else if (mapped.businessPartnerId) {
          mapped.typeContract = "0"; // Đối tác
          mapped.taxcode_partner = mapped.taxCode || "";
          mapped.partnerId = mapped.businessPartnerId;
        }

        // map lại peopleinvolves chỉ lấy contactid để hiển thị trong form
        if (mapped.peopleInvolved) {
          try {
            const people = JSON.parse(mapped.peopleInvolved);
            mapped.contactId =
              Array.isArray(people) && people.length > 0
                ? people[0]?.value ?? null
                : null;
          } catch {
            mapped.contactId = null;
          }
        }
      }

      setInitFormSchema(configInit);
      setMapContractsAttribute(mapAttribute);
      setContractsExtraInfos(extraInfos);
      setDataInit(mapped);
      setIsLoading(false);
    };

    init();
  }, [id]);

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

    //lấy ra categoryName theo categoryId call api chi tiết
    if (config.contractCategoryId) {
      const response = await ContractCategoryService.detail(config.contractCategoryId);
      if (response.code === 0) {
        config.categoryName = response.result?.name || "";
      }
    }
    //lấy ra employeeName theo employeeId call api chi tiết
    if (config.employeeId) {
      const response = await EmployeeService.detail(config.employeeId);
      if (response.code === 0) {
        config.employeeName = response.result?.name || "";
      }
    }
    //lấy ra pipelineName theo pipelineId call api chi tiết
    if (config.pipelineId) {
      const response = await ContractPipelineService.detail(config.pipelineId);
      if (response.code === 0) {
        config.pipelineName = response.result?.name || "";
      }
    }
    //lấy ra projectName theo projectId call api chi tiết
    if (config.projectId) {
      const response = await WorkProjectService.detail(config.projectId);
      if (response.code === 0) {
        config.projectName = response.result?.name || "";
      }
    }

    if (config.contactId) {
      const response = await ContactService.detail(config.contactId);
      if (response.code === 0) {
        config.contactName = response.result?.name || "";
      }
    }

    if (config.partnerId) {
      const response = await PartnerService.detail(config.partnerId);
      if (response.code === 0) {
        config.businessPartnerName = response.result?.name || "";
      }
    }

    const convertTemplate = (template: string) => {
      if (!template) return null;

      const files = JSON.parse(template);

      if (!Array.isArray(files) || files.length === 0) return null;

      const file = files[0];

      return JSON.stringify({
        fileUrl: file.url,
        fileName: file.name,
      });
    };

    // Xác định loại hợp đồng (Khách hàng hay Đối tác)
    let typeContract = "1"; // Khách hàng
    if (config.partnerId && !config.customerId) {
      typeContract = "0"; // Đối tác
    }

    let body: any = {
      ...(data ? data : {}),
      ...(id && +id > 0 ? { id: +id } : {}),
      name: config.name || "",
      categoryId: config.contractCategoryId || null,
      contractNo: config.contractNo || "",
      dealValue: config.dealValue || 0,
      employeeId: config.employeeId || null,
      fsId: config.fsId || null,
      pipelineId: config.pipelineId || null,
      projectId: config.projectId || null,
      requestId: config.requestId || 0,
      requestCode: config.requestCode || "",
      stageId: config.stageId || 0,
      stageName: config.stageName || "",
      products: config.products || [],
      timestamp: config.timestamp || null,
      peopleInvolved: JSON.stringify([{ value: config.contactId, label: config.contactName, }]),
      signDate: toApiDate(config.signDate),
      affectedDate: toApiDate(config.affectedDate),
      adjustDate: toApiDate(config.adjustDate),
      endDate: toApiDate(config.endDate),
      template: convertTemplate(config.template),
      categoryName: config.categoryName || "",
      employeeName: config.employeeName || "",
      pipelineName: config.pipelineName || "",
      projectName: config.projectName || "",
      branchId: checkUserRoot == "1" ? data?.branchId ?? dataBranch.value ?? null : 0,
      contractExtraInfos: infoExtra,
      typeContract: typeContract,
      // Phân biệt giữa Khách hàng và Đối tác
      ...(typeContract === "1"
        ? {
          customerId: config.customerId,
          custType: config.custType ?? 0,
          taxCode: config.taxcode_customer || "",
          businessPartnerId: null,
          businessPartnerName: "",
        }
        : {
          businessPartnerId: config.partnerId,
          businessPartnerName: config.businessPartnerName || "",
          customerId: null,
          custType: null,
          taxCode: config.taxcode_partner || "",
        }
      ),
    };


    const response = await ContractService.update(body);

    if (response.code === 0) {
      showToast(`${id && +id > 0  ? "Cập nhật" : "Thêm mới"} bảo hành thành công`, "success");
      takeInfoCustomer && takeInfoCustomer(response.result);
      navigate(`/contract`);
    } else {
      if (response.error) {
        showToast(response.error, "error");
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }

    setIsSubmit(false);
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
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirmDelete = () => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy thay đổi hợp đồng</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy thay đổi hợp đồng này? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);

        //Chuyển hướng về trang danh sách
        navigate("/contract");
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <div className="page-content page-create-contracts-xml">
      <TitleAction title={`${id && +id > 0 ? "Cập nhật" : "Tạo"} hợp đồng`} />
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
                color="destroy"
                variant="outline"
                disabled={isSubmit}
                onClick={(e) => {
                  e.preventDefault();
                  showDialogConfirmDelete();
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                type="button"
                color="primary"
                disabled={isSubmit}
              >
                {isSubmit ? "Đang xử lý..." : (id && +id > 0 ? "Cập nhật" : "Tạo mới")}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
