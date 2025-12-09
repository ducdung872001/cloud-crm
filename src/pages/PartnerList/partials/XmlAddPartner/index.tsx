/* eslint-disable prefer-const */
import React, { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import "./index.scss";
import { ContextType, UserContext } from "contexts/userContext";
import Tippy from "@tippyjs/react";
import PartnerService from "services/PartnerService";
import PartnerExtraInfoService from "services/PartnerExtraInfoService";
import PartnerAttributeService from "services/PartnerAttributeService";
import _, { forEach } from "lodash";
import Button from "components/button/button";
import Loading from "components/loading";
import FormViewerComponent from "pages/BPM/BpmForm/FormViewer";
import ObjectGroupService from "services/ObjectGroupService";
import { mapConfigData } from "utils/mapConfigData";

const defaultSchema = {
  type: "default",
  components: [],
};

const XMLtype = "modalAddPartner"; // Đối tác

export default function XmlAddPartner(props: any) {
  const { onShow, data, onHide, takeInfoPartner } = props;

  const formContainerRef = useRef(null);
  const formViewerRef = useRef(null);
  const checkUserRoot = localStorage.getItem("user.root");
  const checkShowFullScreen = localStorage.getItem("showFullScreenModalPartnerEform");
  const [showFullScreen, setShowFullScreen] = useState<boolean>(checkShowFullScreen ? JSON.parse(checkShowFullScreen) : false);
  const [initFormSchema, setInitFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [dataSchema, setDataSchema] = useState(null);
  const [dataInit, setDataInit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [partnerExtraInfos, setPartnerExtraInfos] = useState<any>([]);

  const [mapPartnerAttribute, setMapPartnerAttribute] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem("showFullScreenModalPartnerEform", JSON.stringify(showFullScreen));
  }, [showFullScreen]);

  const getPartnerAttributes = async () => {
    if (!mapPartnerAttribute || mapPartnerAttribute.length === 0) {
      const response = await PartnerAttributeService.listAll(0);
      if (response.code === 0) {
        const dataOption = response.result;
        setMapPartnerAttribute(dataOption || {});
      }
    }
  };

  useEffect(() => {
    if (!onShow) return;
    getPartnerAttributes();
    getOjectGroup(XMLtype);
  }, [data, onShow, XMLtype]);

  useEffect(() => {
    //Lấy thông tin contractExtraInfos
    if (data?.id && mapPartnerAttribute && onShow) {
      getPartnerExtraInfos();
    }
  }, [data, mapPartnerAttribute, onShow]);

  const getPartnerExtraInfos = async () => {
    const response = await PartnerExtraInfoService.list(data?.id);
    setPartnerExtraInfos(response.code === 0 ? response.result : []);
  };

  const onSubmit = async (config) => {
    console.log("dataConfigForm>>>", config);
    setIsSubmit(true);
    // Các trường thông tin bổ sung
    let infoExtra = [];
    forEach(mapPartnerAttribute, (itemInfo) => {
      forEach(itemInfo, (item) => {
        const info = itemInfo.find((info) => config[info.fieldName] && item.parentId != 0);
        if (info) {
          infoExtra.push({
            ...{
              attributeId: item.id,
              businessPartnerId: data?.id ?? 0,
              attributeValue:
                config[item.fieldName] && typeof config[item.fieldName] == "object" ? JSON.stringify(config[item.fieldName]) : config[item.fieldName],
            },
            ...(partnerExtraInfos.find((el) => el.attributeId == item.id)?.id
              ? {
                  id: partnerExtraInfos.find((el) => el.attributeId == item.id)?.id,
                }
              : {}),
          });
        }
      });
    });

    let body: any = {
      ...(data ? data : {}),
      avartar: config.avatar ?? "",
      name: config.name ?? "",
      code: config.code ?? "",
      phone: config.phone ?? "",
      email: config.email ?? "",
      taxCode: config.taxCode ?? "",
      contactId: config.contactId ?? "",
      address: config.address ?? "",
      branchId: checkUserRoot == "1" ? data?.branchId ?? dataBranch.value ?? null : 0,
      bank: JSON.stringify(config.bank),
      businessPartnerExtraInfos: infoExtra,
    };

    const response = await PartnerService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} đối tác thành công`, "success");
      handleClear(true);
      takeInfoPartner && takeInfoPartner(response.result);
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
    [isSubmit, formViewerRef, mapPartnerAttribute, isSubmit, dataSchema, data]
  );

  const handleClear = (acc) => {
    onHide(acc);
    setPartnerExtraInfos([]);
    setDataInit(null);
    setInitFormSchema(defaultSchema);
    setMapPartnerAttribute(null);
    setPartnerExtraInfos([]);
  };

  // Callback để nhận schema khi người dùng thay đổi trong FormEditor
  const handleSchemaSubmit = (newSchema, reject, contextData) => {
    setDataSchema(newSchema);
    onSubmit(newSchema);
  };

  useEffect(() => {
    if (data && onShow) {
      //exceptionField để map những field đặc biệt không theo quy tắc chung (ví dụ phone => phoneMasked)
      const exceptionField = {
        phone: "phoneMasked",
        email: "emailMasked",
      };
      const mapped = mapConfigData(initFormSchema, data, mapPartnerAttribute, partnerExtraInfos, exceptionField);
      console.log("mapped>>>", mapped);

      setDataInit(mapped);
    }
  }, [initFormSchema, data, mapPartnerAttribute, partnerExtraInfos, onShow]);

  const getOjectGroup = async (type: any) => {
    const response = await ObjectGroupService.detailByType(type);
    if (response.code === 0) {
      const result = response?.result;
      const configForm = result?.config ? JSON.parse(result.config) : defaultSchema;
      if (configForm && Object.keys(configForm).length > 0) {
        setInitFormSchema(configForm);
        console.log("configForm>>", configForm);
      }
    } else if (response.code == 400) {
      showToast(response.message, "error");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
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
        className={showFullScreen ? "modal-partner-xml-full" : "modal-partner-xml"}
      >
        <form className="form-handle-task" onSubmit={(e) => onSubmit(e)}>
          <div className="container-header">
            <div className="box-title">
              <h4>{`${data ? "Chỉnh sửa" : "Thêm mới"} đối tác`}</h4>
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
