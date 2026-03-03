/* eslint-disable prefer-const */
import React, { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";
import Tippy from "@tippyjs/react";
import CustomerService from "services/CustomerService";
import CustomerExtraInfoService from "services/CustomerExtraInfoService";
import CustomerAttributeService from "services/CustomerAttributeService";
import _, { forEach, map } from "lodash";
import Button from "components/button/button";
import Loading from "components/loading";
import FormViewerComponent from "pages/BPM/BpmForm/FormViewer";
import ObjectGroupService from "services/ObjectGroupService";
import { mapConfigData } from "utils/mapConfigData";
import moment from "moment";
import { name } from "jssip";
import { ca } from "date-fns/locale";

const defaultSchema = {
  type: "default",
  components: [],
};

const XMLtype = "modalAddCustomer"; // Khách hàng

const getCustomerAttributes = async () => {
  let dataOption = null;
  const response = await CustomerAttributeService.listAll(0);
  if (response.code === 0) {
    dataOption = response.result || {};
    return dataOption;
  }
  return dataOption;
};

const getCustomerExtraInfos = async (id) => {
  const response = await CustomerExtraInfoService.list(id,0);
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

export default function XmlAddCustomer(props: any) {
  const { onShow, data, onHide, takeInfoCustomer } = props;

  const formContainerRef = useRef(null);
  const formViewerRef = useRef(null);
  const checkUserRoot = localStorage.getItem("user.root");
  const checkShowFullScreen = localStorage.getItem("showFullScreenModalCustomerEform");
  const [showFullScreen, setShowFullScreen] = useState<boolean>(checkShowFullScreen ? JSON.parse(checkShowFullScreen) : false);
  const [initFormSchema, setInitFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [dataSchema, setDataSchema] = useState(null);
  const [dataInit, setDataInit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [customerExtraInfos, setCustomerExtraInfos] = useState<any>([]);

  const [mapCustomerAttribute, setMapCustomerAttribute] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem("showFullScreenModalCustomerEform", JSON.stringify(showFullScreen));
  }, [showFullScreen]);

  const toFormDate = (value) => {
    if (!value) return "";
    return moment(value).format("YYYY-MM-DD");
  };

  const toApiDate = (value: any) => {
    return value ? moment(value, ["MM-DD-YYYY", moment.ISO_8601]).format("YYYY-MM-DDTHH:mm:ss") : "";
  };

  const normalizeMultiSelectToString = (input: any) => {
  try {
    if (!input) return "[]";

    let arr = input;

    if (typeof input === "string") {
      arr = JSON.parse(input);
    }

    if (Array.isArray(arr) && typeof arr[0] === "object") {
      arr = arr.map(x => x.value);
    }

    return JSON.stringify(arr);
  } catch {
    return "[]";
  }
};

const mapRelationToMultiSelect = (mapped) => {
  try {
    const ids = mapped.relationIds || [];
    const relations = mapped.relations || data?.relations || [];

    const mappedData = ids.map(id => {
      const rel = relations.find(relation => relation.id === id);
      return rel
        ? { label: rel.name, value: rel.id }
        : { label: String(id), value: id };
    });

    return JSON.stringify(mappedData);
  } catch {
    return "[]";
  }
};

const mapCareerToMultiSelect = (data) => {
  try {
    let ids = data?.careers || "[]";
    if (typeof ids === "string") ids = JSON.parse(ids);

    const lstCareer = data?.lstCareer || [];

    return JSON.stringify(
      ids.map(id => {
        const career = lstCareer.find(x => String(x.id) === String(id));
        return career ? { label: career.name, value: career.id } : { label: String(id), value: id };
      })
    );
  } catch {
    return "[]";
  }
};



  useEffect(() => {
    if (!onShow) return;
    //exceptionField để map những field đặc biệt không theo quy tắc chung (ví dụ phone => phoneMasked)
    const exceptionField = {
      phone: "phoneMasked",
      email: "emailMasked",
    };
    const getAlldata = async () => {
      const configInit = await getOjectGroup(XMLtype); // Lấy cấu hình form từ ObjectGroup
      const mapAttribute = await getCustomerAttributes(); // Lấy các trường thông tin mở rộng của khách hàng
      const extraInfos = data?.id ? await getCustomerExtraInfos(data?.id) : []; // Lấy giá trị của các trường thông tin mở rộng của khách hàng nếu có data.id (id của khách hàng)
      const mapped = mapConfigData(configInit, data, mapAttribute, extraInfos, exceptionField); // Map dữ liệu ban đầu vào cấu hình form
      if (data?.id) {
        
        mapped.custType = String(mapped.custType);
        mapped.gender = String(mapped.gender);
        mapped.isExternal = String(mapped.isExternal);
        mapped.customers = mapped.relationIds;

        mapped.birthday = toFormDate(mapped.birthday);

        mapped.customerRelationIds = mapRelationToMultiSelect(data);
        mapped.careers = mapCareerToMultiSelect(data);
        console.log("mapped before" ,mapped);
        if(mapped.custType==="0"){
          mapped.namePerson = mapped.name;
          mapped.sourceIdPerson = mapped.sourceId;
          mapped.careerIdPerson = mapped.careers;
          mapped.addressPerson = mapped.address;
        }else if (mapped.custType==="1"){
          mapped.nameCompany = mapped.name;
          mapped.sourceIdCompany = mapped.sourceId;
          mapped.careerIdCompany = mapped.careers;
          mapped.addressCompany = mapped.address;
        }

        console.log("mapped", mapped);
        setDataInit(mapped);
      }
      setInitFormSchema(configInit);
      setMapCustomerAttribute(mapAttribute);
      setCustomerExtraInfos(extraInfos);
      setIsLoading(false);
    };
    if (onShow && XMLtype) {
      getAlldata();
    }
  }, [data, onShow, XMLtype]);

  const onSubmit = async (config) => {
    setIsSubmit(true);
    // Các trường thông tin bổ sung
    let infoExtra = [];
    forEach(mapCustomerAttribute, (itemInfo) => {
      forEach(itemInfo, (item) => {
        const info = itemInfo.find((info) => config[info.fieldName] && item.parentId != 0);
        if (info) {
          infoExtra.push({
            ...{
              attributeId: item.id,
              customerId: data?.id ?? 0,
              attributeValue:
                config[item.fieldName] && typeof config[item.fieldName] == "object" ? JSON.stringify(config[item.fieldName]) : config[item.fieldName],
            },
            ...(customerExtraInfos.find((el) => el.attributeId == item.id)?.id
              ? {
                  id: customerExtraInfos.find((el) => el.attributeId == item.id)?.id,
                }
              : {}),
          });
        }
      });
    });

    let phone = config?.phoneMasked ?? null; // Lấy theo phoneMasked vì maskedInput trong form lấy theo key này
    let email = config?.emailMasked ?? null; // Lấy theo emailMasked vì maskedInput trong form lấy theo key này
    let custType = config?.custType ?? "0";
    let body: any = {
      ...(data ? data : {}),
      avatar: config.avatar ? JSON.parse(config.avatar)[0]?.url : "",
      birthday: toApiDate(config.birthday),
      branchId: checkUserRoot == "1" ? data?.branchId ?? dataBranch.value ?? null : 0,
      cgpId: config.cgpId ?? "",
      code: config.code ?? "",
      taxCode: config.taxCode ?? "",
      contactId: config.contactId ?? "",
      customerExtraInfos: infoExtra,
      customerRelationIds: normalizeMultiSelectToString(config.customerRelationIds),
      employeeId: config.employeeId ?? 0,
      employeeTitle: config.employeeTitle ?? "",
      firstCall: config.firstCall ?? "",
      gender: config.gender ?? 0,
      height: config.height ?? 0,
      isExternal: config.isExternal ?? "",
      maritalStatus: config.maritalStatus ?? 1,
      profileLink: config.profileLink ?? "",
      profileStatus: config.profileStatus ?? "1",
      recommenderPhone: config.recommenderPhone ?? "",
      secondProfileLink: config.secondProfileLink ?? "",
      secondProfileStatus: config.secondProfileStatus ?? "1",
      trademark: config.trademark ?? "",
      weight: config.weight ?? 0,
      custType: custType,
    ...(custType === "0"
      ? {
          name: config.namePerson ?? "",
          phone,
          email,
          sourceId: config.sourceIdPerson ?? "",
          careers: normalizeMultiSelectToString(config.careerIdPerson),
          address: config.addressPerson??""
        }
      : {
          name: config.nameCompany ?? "",
          phone,
          email,
          sourceId: config.sourceIdCompany ?? "",
          careers: normalizeMultiSelectToString(config.careerIdCompany),
          address: config.addressCompany??""
        }
    ),
    };

    const response = await CustomerService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} khách hàng thành công`, "success");
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

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handleClear(false);
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            // type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
            callback: async () => {
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
            },
          },
        ],
      },
    }),
    [isSubmit, formViewerRef, mapCustomerAttribute, isSubmit, dataSchema, data]
  );

  const handleClear = (acc) => {
    onHide(acc);
    setCustomerExtraInfos([]);
    setDataInit(null);
    setInitFormSchema(defaultSchema);
    setMapCustomerAttribute(null);
    setCustomerExtraInfos([]);
  };

  // Callback để nhận schema khi người dùng thay đổi trong FormEditor
  const handleSchemaSubmit = (newSchema, reject, contextData) => {
    setDataSchema(newSchema);
    onSubmit(newSchema);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size={showFullScreen ? "xxl" : "xl"}
        toggle={() => {
          if (!isSubmit) {
            handleClear(false);
          }
        }}
        className={showFullScreen ? "modal-customer-xml-full" : "modal-customer-xml"}
      >
        <form className="form-handle-task" onSubmit={(e) => onSubmit(e)}>
          <div className="container-header">
            <div className="box-title">
              <h4>{`${data ? "Chỉnh sửa" : "Thêm mới"} khách hàng`}</h4>
            </div>
            <div className="container-button">
              {!showFullScreen ? (
                <Tippy content="Mở rộng">
                  <div
                    style={{ marginBottom: 4, marginRight: 5, cursor: "pointer" }}
                    onClick={() => {
                      setShowFullScreen(true);
                    }}
                  >
                    <Icon name="ZoomInFullScreen" />
                  </div>
                </Tippy>
              ) : (
                <Tippy content="Thu nhỏ">
                  <div
                    style={{ marginBottom: 4, marginRight: 5, cursor: "pointer" }}
                    onClick={() => {
                      setShowFullScreen(false);
                    }}
                  >
                    <Icon name="ZoomOutScreen" />
                  </div>
                </Tippy>
              )}
              <Button onClick={() => handleClear(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                <Icon name="Times" />
              </Button>
            </div>
          </div>
          <ModalBody>
            <div className="container_handle_task-modal">
              {/* Form Viewer để hiển thị form => truyền vào nodeId, processId, và potId */}
              {initFormSchema?.components?.length == 0 ? (
                <Loading />
              ) : (
                <div style={{ width: "100%", pointerEvents: "auto" }}>
                  <FormViewerComponent
                    formContainerRef={formContainerRef}
                    formViewerRef={formViewerRef}
                    formSchema={initFormSchema}
                    onSchemaSubmit={handleSchemaSubmit}
                    // setShowPopupCustom={setShowPopupCustom}
                    // setCodePopupCustom={setCodePopupCustom}
                    dataInit={dataInit}
                    contextData={{}}
                    showOnRejectModal={false}
                    onValidationError={() => {
                      setIsSubmit(false);
                    }}
                    setDataSchemaDraft={(data) => {}}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
