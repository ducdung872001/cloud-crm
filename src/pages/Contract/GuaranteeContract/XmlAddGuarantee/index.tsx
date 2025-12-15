/* eslint-disable prefer-const */
import React, { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";
import Tippy from "@tippyjs/react";
import _, { forEach } from "lodash";
import Button from "components/button/button";
import Loading from "components/loading";
import FormViewerComponent from "pages/BPM/BpmForm/FormViewer";
import ObjectGroupService from "services/ObjectGroupService";
import { mapConfigData } from "utils/mapConfigData";
import GuaranteeAttributeService from "services/GuaranteeAttributeService";
import GuaranteeExtraInfoService from "services/GuaranteeExtraInfoService";
import ContractGuaranteeService from "services/ContractGuaranteeService";
import moment from "moment";

const defaultSchema = {
  type: "default",
  components: [],
};

const XMLtype = "modalAddGuarantee"; // bảo lãnh

const getGuaranteeAttributes = async () => {
  let dataOption = null;
  const response = await GuaranteeAttributeService.listAll(0);
  if (response.code === 0) {
    dataOption = response.result || {};
    return dataOption;
  }
  return dataOption;
};

const getGuaranteeExtraInfos = async (id) => {
  const response = await GuaranteeExtraInfoService.list(id);
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

export default function XmlAddGuanrantee(props: any) {
  const { onShow, data, onHide, takeInfoCustomer } = props;

  const formContainerRef = useRef(null);
  const formViewerRef = useRef(null);
  const checkUserRoot = localStorage.getItem("user.root");
  const checkShowFullScreen = localStorage.getItem("showFullScreenModalGuaranteeEform");
  const [showFullScreen, setShowFullScreen] = useState<boolean>(checkShowFullScreen ? JSON.parse(checkShowFullScreen) : false);
  const [initFormSchema, setInitFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [dataSchema, setDataSchema] = useState(null);
  const [dataInit, setDataInit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [guaranteeExtraInfos, setGuaranteeExtraInfos] = useState<any>([]);

  const [mapGuaranteeAttribute, setMapGuaranteeAttribute] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem("showFullScreenModalGuaranteeEform", JSON.stringify(showFullScreen));
  }, [showFullScreen]);

  const toFormDate = (value) => {
    if (!value) return "";
    return moment(value).format("MM-DD-YYYY");
  };

  const toApiDate = (value: any) => {
    return value ? moment(value, ["MM-DD-YYYY", moment.ISO_8601]).format("YYYY-MM-DDTHH:mm:ss") : "";
  };

  useEffect(() => {
    if (!onShow) return;
    //exceptionField để map những field đặc biệt không theo quy tắc chung (ví dụ phone => phoneMasked)
    const exceptionField = {
      phone: "phoneMasked",
      email: "emailMasked",
    };
    const getAlldata = async () => {
      const configInit = await getOjectGroup(XMLtype);
      const mapAttribute = await getGuaranteeAttributes();
      const extraInfos = data?.id ? await getGuaranteeExtraInfos(data?.id) : [];
      const mapped = mapConfigData(configInit, data, mapAttribute, extraInfos, exceptionField);

      if (data?.id) {
        mapped.startDate = toFormDate(mapped.startDate);
        mapped.endDate = toFormDate(mapped.endDate);
        mapped.signDate = toFormDate(mapped.signDate);
        mapped.establishDate = toFormDate(mapped.establishDate);
        if (mapped.beneficiaryId) {
          if (mapped.beneficiaryType == 0) {
            mapped.beneficiaryId_customer = mapped.beneficiaryId;
          } else {
            mapped.beneficiaryId_partner = mapped.beneficiaryId;
          }
        }

        if (mapped.issuerId) {
          if (mapped.issuerType == 0) {
            mapped.issuerId_customer = mapped.issuerId;
          } else {
            mapped.issuerId_partner = mapped.issuerId;
          }
        }
        setDataInit(mapped);
      }

      console.log(mapped);
      setInitFormSchema(configInit);
      setMapGuaranteeAttribute(mapAttribute);
      setGuaranteeExtraInfos(extraInfos);
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
    forEach(mapGuaranteeAttribute, (itemInfo) => {
      forEach(itemInfo, (item) => {
        const info = itemInfo.find((info) => config[info.fieldName] && item.parentId != 0);
        if (info) {
          infoExtra.push({
            ...{
              attributeId: item.id,
              guaranteeId: data?.id ?? 0,
              attributeValue:
                config[item.fieldName] && typeof config[item.fieldName] == "object" ? JSON.stringify(config[item.fieldName]) : config[item.fieldName],
            },
            ...(guaranteeExtraInfos.find((el) => el.attributeId == item.id)?.id
              ? {
                id: guaranteeExtraInfos.find((el) => el.attributeId == item.id)?.id,
              }
              : {}),
          });
        }
      });
    });

    let body: any = {
      ...(data ? data : {}),
      numberLetter: config.numberLetter ?? "",
      competencyId: config.competencyId ?? 0, // nghiệp vụ bảo lãnh
      contractId: config.contractId ?? 0, //hợp đồng bảo lãnh
      contractAppendixId: config.contractAppendix ?? 0, //Phụ lục hợp đồng
      guaranteeTypeId: config.guaranteeTypeId ?? 0,
      bankId: config.bankId ?? 0,
      beneficiaryId: (config.beneficiaryType == 0 ? config.beneficiaryId_customer : config.beneficiaryId_partner) ?? 0, //đơn vị thụ hưởng
      issuerId: (config.issuerType == 0 ? config.issuerId_customer : config.issuerId_partner) ?? 0, // đơn vị phát hành
      currencyValue: config.currencyValue ?? 0, //giá trị bảo lãnh ngaoij tế
      currency: config.currency ?? "VNĐ", //loại tiền tệ
      contractValue: config.contractValue ?? 0, // giá trị hợp đồng
      value: config.value ?? 0, //giá trị bảo lãnh
      exchangeRate: config.exchangeRate ?? 1, //tỷ giá
      description: config.description ?? "",
      status: config.status ?? 1, //trạng thái
      startDate: toApiDate(config.startDate),
      endDate: toApiDate(config.endDate),
      signDate: toApiDate(config.signDate),
      establishDate: toApiDate(config.establishDate),
      signRate: config.signRate ?? 0,
      attachments: config.attachments ?? "[]",
      beneficiaryType: config.beneficiaryType?? 0, //0 - khách hàng, 1 - đối tác
      issuerType: config.issuerType?? 0, //0 - khách hàng, 1 - đối tác
      branchId: checkUserRoot == "1" ? data?.branchId ?? dataBranch.value ?? null : 0,
      bank: JSON.stringify(config.bank),
      guaranteeExtraInfos: infoExtra,
    };

    console.log (body);

    const response = await ContractGuaranteeService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} bảo lãnh thành công`, "success");
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
    [isSubmit, formViewerRef, mapGuaranteeAttribute, isSubmit, dataSchema, data]
  );

  const handleClear = (acc) => {
    onHide(acc);
    setGuaranteeExtraInfos([]);
    setDataInit(null);
    setInitFormSchema(defaultSchema);
    setMapGuaranteeAttribute(null);
    setGuaranteeExtraInfos([]);
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
        className={showFullScreen ? "modal-guarantee-xml-full" : "modal-guarantee-xml"}
      >
        <form className="form-handle-task" onSubmit={(e) => onSubmit(e)}>
          <div className="container-header">
            <div className="box-title">
              <h4>{`${data ? "Chỉnh sửa" : "Thêm mới"} bảo lãnh`}</h4>
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
                    setDataSchemaDraft={(data) => { }}
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
