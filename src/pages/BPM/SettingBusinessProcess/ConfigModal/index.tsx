import React, { Fragment, useState, useEffect, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IEmailRequest } from "model/email/EmailRequestModel";
import { showToast } from "utils/common";
import "./index.scss";
import Input from "components/input/input";
import Icon from "components/icon";
import Loading from "components/loading";
import Button from "components/button/button";
import Tippy from "@tippyjs/react";
import MarketingAutomationService from "services/MarketingAutomationService";
import _ from "lodash";
import BusinessProcessService from "services/BusinessProcessService";
import BpmFormService from "services/BpmFormService";

//TODO: 🧠 Start logic code nhóm kéo thả thư viện 🧠
import { v4 as uuidv4 } from "uuid";
import { Responsive, WidthProvider } from "react-grid-layout";

import ModalTypeForm from "./partials/ModalTypeForm/ModalTypeForm";
import ModalTypeBell from "./partials/ModalTypeBell/ModalTypeBell";
import ModalTypeSignature from "./partials/ModalTypeSignature/ModalTypeSignature";
import ArtifactService from "services/ArtifactService";
import BpmFormArtifactService from "services/BpmFormArtifactService";
import ContractEformService from "services/ContractEformService";
import { convertToId } from "reborn-util";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import RadioList from "components/radio/radioList";
import Checkbox from "components/checkbox/checkbox";
import CheckboxList from "components/checkbox/checkboxList";
import NummericInput from "components/input/numericInput";
import TextArea from "components/textarea/textarea";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";
import BpmFormProcessService from "services/BpmFormProcessService";
import BpmParticipantService from "services/BpmParticipantService";
import ModalMapping from "./partials/ModalMapping/ModalMapping";
import SettingAttributeEform from "./partials/SettingAttributeEform/SettingAttributeEform";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const toolboxItems = [
  {
    name: "Biểu mẫu",
    type: "form",
    w: 3,
    h: 3,
    icon: <Icon name="Article" />,
    layout: <div></div>,
  },
  {
    name: "Tạo biểu mẫu mới",
    type: "create_form",
    w: 3,
    h: 3,
    icon: <Icon name="PlusCircleFill" />,
    layout: <div></div>,
  },
  {
    name: "Thông báo",
    type: "bell",
    icon: <Icon name="Bell" />,
    w: 2,
    h: 2,
    layout: (
      <div>
        <Icon name="Bell" />
      </div>
    ),
  },
  {
    name: "Luồng ký",
    type: "signature",
    icon: <Icon name="FingerTouch" />,
    w: 1,
    h: 1,
    layout: (
      <div>
        <Button>Button</Button>
      </div>
    ),
  },
];

const ToolboxItem = ({ toolboxItem, onDragStart }) => {
  const { type } = toolboxItem;
  return (
    <Tippy key={type} content={toolboxItem.name}>
      <div draggable={true} className="item-plugin" onDragStart={onDragStart}>
        {toolboxItem.icon}
      </div>
    </Tippy>
  );
};

function boxIntersect(box1, box2) {
  return (
    Math.max(box1.x, box2.x) < Math.min(box1.x + box1.w, box2.x + box2.w) && Math.max(box1.y, box2.y) < Math.min(box1.y + box1.h, box2.y + box2.h)
  );
}

function bfs(items, newItem) {
  const q = [newItem];
  const newLayouts = [newItem];
  const visited = {};
  while (q.length) {
    for (let size = q.length; size > 0; --size) {
      const it = q.shift();
      for (const item of items) {
        if (boxIntersect(item, it) && !visited[item.i]) {
          visited[item.i] = true;
          const pushedItem = { ...item, y: it.y + it.h, children: item.children };
          q.push(pushedItem);
          newLayouts.push(pushedItem);
        }
      }
    }
  }
  for (const item of items) {
    if (!visited[item.i]) {
      newLayouts.push(item);
    }
  }
  return newLayouts.reverse();
}
//TODO: 🧠 End logic code nhóm kéo thả thư viện 🧠

export default function ConfigModal(props: any) {
  const { onShow, onHide, dataNode, setDataNode, statusMA } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [nodeName, setNodeName] = useState(null);
  const [nodePoint, setNodePoint] = useState(null);

  useEffect(() => {
    if (dataNode?.name) {
      setNodeName(dataNode.name);
    }
    if (dataNode?.point) {
      setNodePoint(dataNode.point);
    }
  }, [dataNode]);

  //TODO: 👉 Quản lý state và logic code kéo thả UI 👈
  const [configs, setConfigs] = useState([
    {
      idTab: "",
      title: "Tab 1",
      childrens: [],
      layouts: { lg: [] },
    },
  ]);

  const [listComponent, setListComponent] = useState([]);
  console.log("listComponent", listComponent);

  const getListComponent = async () => {
    const response = await ArtifactService.list();

    if (response.code === 0) {
      const result = response.result || [];
      if (result.length > 0) {
        const newList = [];
        result.map((item) => {
          if (item.code === "eform") {
            newList.push({
              id: item.id,
              name: "Biểu mẫu",
              type: "form",
              w: 3,
              h: 3,
              icon: <Icon name="Article" />,
              layout: <div></div>,
            });
          }

          if (item.code === "create_eform") {
            newList.push({
              id: item.id,
              name: "Tạo biểu mẫu",
              type: "create_eform",
              w: 3,
              h: 3,
              icon: <Icon name="PlusCircleFill" />,
              layout: <div></div>,
            });
          }

          if (item.code === "button") {
            newList.push({
              id: item.id,
              name: "Luồng ký",
              type: "signature",
              icon: <Icon name="FingerTouch" />,
              w: 1,
              h: 1,
              layout: (
                <div>
                  <Button>Button</Button>
                </div>
              ),
            });
          }

          if (item.code === "notify") {
            newList.push({
              id: item.id,
              name: "Thông báo",
              type: "bell",
              icon: <Icon name="Bell" />,
              w: 2,
              h: 2,
              layout: (
                <div>
                  <Icon name="Bell" />
                </div>
              ),
            });
          }
        });
        setListComponent(newList);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleInitialCreateTab = async (nodeId: number, name: string, id?: number) => {
    const body = {
      id: id || 0,
      nodeId: nodeId,
      name: name,
    };

    const response = await BpmFormService.update(body);

    if (response.code === 0) {
      // const result = {
      //   idTab: response.result.id,
      //   title: response.result.name,
      //   childrens: [],
      //   layouts: { lg: [] },
      // };

      // setConfigs([result]);
      if(id){
        getDataBpmFormArtifact(+dataNode.id, idTabConfig);
      } else {
        handleLstTabBpm(+dataNode.id);
      }
     
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleLstTabBpm = async (nodeId: number) => {
    if (!nodeId) return;

    const param = {
      nodeId: nodeId,
    };

    const response = await BpmFormService.list(param);

    if (response.code === 0) {
      const result = response.result;

      if (result.length === 0) {
        handleInitialCreateTab(nodeId, "New Tab");
      } else {
        const changeResult = result.map((item) => {
          return {
            idTab: item.id,
            title: item.name,
            childrens: [],
            layouts: { lg: [] },
          };
        });

        setConfigs(changeResult);
      }
    } else {
      showToast(response.message || "Lỗi tab đang bị lỗi. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (onShow && dataNode) {
      handleLstTabBpm(+dataNode.id);
      getListComponent();
    }
  }, [onShow, dataNode]);

  const [idTabConfig, setIdTabConfig] = useState(0);
  console.log("idTabConfig", idTabConfig);

  const getControlByType = (contractAttribute) => {
    let CustomControl = (
      <Input
        id={`Id${contractAttribute.id}`}
        label={contractAttribute.name}
        fill={true}
        // value={getContractAttributeValue(contractAttribute.id)}
        // onChange={(e) => updateContractAttribute(contractAttribute.id, e.target.value)}
        placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
        required={!!contractAttribute.required}
        readOnly={!!contractAttribute.readonly}
        disabled={true}
      />
    );

    switch (contractAttribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={contractAttribute.name}
            name={contractAttribute.name}
            // value={getContractAttributeValue(contractAttribute.id)}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            fill={true}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            // onChange={(e) => updateContractAttribute(contractAttribute.id, e.target.value)}
            maxLength={459}
            disabled={true}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={contractAttribute.name}
            name={contractAttribute.name}
            fill={true}
            disabled={true}
            required={!!contractAttribute.required}
            // value={getContractAttributeValue(contractAttribute.id)}
            thousandSeparator={true}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            // decimalScale={getDecimalScale(contractAttribute.attributes)}
            // onChange={(e) => {
            //   const value = e.target.value;
            //   let valueNum = value?.replace(/,/g, "");
            //   updateContractAttribute(contractAttribute.id, valueNum);
            // }}
          />
        );
        break;
      case "dropdown":
        CustomControl = (
          <SelectCustom
            name={contractAttribute.name}
            label={contractAttribute.name}
            fill={true}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            // error={validateFieldPipeline}
            // message="Loại hợp đồng không được bỏ trống"
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            // value={getContractAttributeValue(contractAttribute.id)}
            // onChange={(e) => {
            //   updateContractAttribute(contractAttribute.id, e.value);
            // }}
            disabled={true}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "multiselect":
        // let attris = getContractAttributeValue(contractAttribute.id);
        CustomControl = (
          <CheckboxList
            title={contractAttribute.name}
            required={!!contractAttribute.required}
            disabled={true}
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            // value={attris ? JSON.parse(attris).join(",") : ""}
            // onChange={(e) => {
            //   updateContractMultiselectAttribute(contractAttribute.id, e);
            // }}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            // checked={!!getContractAttributeValue(contractAttribute.id)}
            label={contractAttribute.name}
            // onChange={(e) => {
            //   updateContractAttribute(contractAttribute.id, e.target.checked);
            // }}
            disabled={true}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={contractAttribute.name}
            title={contractAttribute.name}
            disabled={true}
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            // value={getContractAttributeValue(contractAttribute.id)}
            // onChange={(e) => {
            //   updateContractAttribute(contractAttribute.id, e.target.value);
            // }}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={contractAttribute.name}
            name={contractAttribute.name}
            fill={true}
            disabled={true}
            // value={getContractAttributeValue(contractAttribute.id)}
            // onChange={(e) => {
            //   const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
            //   updateContractAttribute(contractAttribute.id, newDate);
            // }}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            iconPosition="left"
            icon={<Icon name="Calendar" />}
            isMaxDate={false}
            // error={validateFieldSignDate}
            // message={`Vui lòng chọn ${contractAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "lookup":
        const attrs = contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : {};

        //1. Trường hợp là customer (khách hàng)
        //2. Trường hợp là employee (nhân viên)
        //3. Trường hợp là contract (hợp đồng)
        //4. Trường hợp là contact (người liên hệ)
        switch (attrs?.refType) {
          case "customer":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                // onMenuOpen={onSelectOpenCustomer}
                // isLoading={isLoadingCustomer}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                disabled={true}
                // value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                // onChange={(e) => handleChangeValueCustomerItem(e, contractAttribute)}
              />
            );
            break;
          case "employee":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                // onMenuOpen={onSelectOpenEmployee}
                // isLoading={isLoadingEmployee}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                disabled={true}
                // value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                // onChange={(e) => handleChangeValueEmployeeItem(e, contractAttribute)}
              />
            );
            break;
          case "contract":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                // onMenuOpen={onSelectOpenContract}
                // isLoading={isLoadingContract}
                fill={true}
                disabled={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                // value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                // onChange={(e) => handleChangeValueContractItem(e, contractAttribute)}
              />
            );
            break;
          case "contact":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                // onMenuOpen={onSelectOpenContact}
                // isLoading={isLoadingContact}
                fill={true}
                disabled={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                // value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                // onChange={(e) => handleChangeValueContactItem(e, contractAttribute)}
              />
            );
            break;
          default:
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                // onMenuOpen={onSelectOpenCustomer}
                // isLoading={isLoadingCustomer}
                fill={true}
                disabled={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                // value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                // onChange={(e) => handleChangeValueCustomerItem(e, contractAttribute)}
              />
            );
        }
        break;
      case "formula":
        //Công thức được lấy từ trường động và trường tĩnh
        //{contract.dealValue + contractAttribute.xyz} => sẽ cần parser từ 2 đối tượng là contract và contractAttribute

        //Chỉ hiển thị chứ không lưu giá trị (nếu thêm mới thì không hiển thị?, sửa mới hiển thị)
        CustomControl = (
          <Input
            id={`Id${contractAttribute.id}`}
            label={contractAttribute.name}
            fill={true}
            // value={getContractAttributeFormula(contractAttribute?.attributes)}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );

        break;
    }

    return CustomControl;
  };

  const EformPreview = ({ idEform, type }) => {
    const [listEformAttribute, setListEformAttribute] = useState([]);

    console.log("listEformAttribute : ", listEformAttribute);

    useEffect(() => {
      const fetchEformAttributes = async () => {
        if (!idEform) return;

        const params = {
          limit: 1000,
          eformId: idEform,
        };

        try {
          const response = await ContractEformService.listEformExtraInfo(params);

          if (response.code === 0) {
            setListEformAttribute(response.result);
          } else {
            setListEformAttribute([]);
            showToast(response.message || "Eform đang lỗi. Vui lòng thử lại sau !", "error");
          }
        } catch (error) {
          showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
        }
      };

      fetchEformAttributes();
    }, [idEform]);

    return (
      <div className="preview-eform-container">
        {listEformAttribute.length > 0 && (
          <div className="list__eform">
            {type === 'create_eform' ? 
              <Fragment>
                {listEformAttribute.map((contractAttribute, index: number) => (
                  <Fragment key={index}>
                    {/* {!contractAttribute.parentId ? (
                      <label className={index === 0 ? "label-title-first" : "label-title"}>{contractAttribute.name}</label>
                    ) : null} */}
                    {/* {contractAttribute.parentId ? ( */}
                      <div
                        className={`form-group ${contractAttribute.name.length >= 38 || listEformAttribute.length == 2 ? "special-case" : ""}`}
                        id={`Field${convertToId(contractAttribute.name)}`}
                      >
                        {getControlByType(contractAttribute)}
                      </div>
                    {/* ) : null} */}
                  </Fragment>
                ))}
              </Fragment>
              : 
              <Fragment>
                {listEformAttribute.map((contractAttribute, index: number) => (
                  <Fragment key={index}>
                    {!contractAttribute.parentId ? (
                      <label className={index === 0 ? "label-title-first" : "label-title"}>{contractAttribute.name}</label>
                    ) : null}
                    {contractAttribute.parentId ? (
                      <div
                        className={`form-group ${contractAttribute.name.length >= 38 || listEformAttribute.length == 2 ? "special-case" : ""}`}
                        id={`Field${convertToId(contractAttribute.name)}`}
                      >
                        {getControlByType(contractAttribute)}
                      </div>
                    ) : null}
                  </Fragment>
                ))}
              </Fragment>
            }
          </div>
        )}
      </div>
    );
  };

  const getDataBpmFormArtifact = async (nodeId, formId) => {
    const paramTab = {
      nodeId: nodeId,
    };

    const responseTab = await BpmFormService.list(paramTab);

    if (responseTab.code === 0) {
      const result = responseTab.result;

      if (result.length === 0) {
        // handleInitialCreateTab(nodeId, "New Tab");
      } else {
        const changeResult = result.map((item) => {
          return {
            idTab: item.id,
            title: item.name,
            childrens: [],
            layouts: { lg: [] },
          };
        });

        if (changeResult && changeResult.length > 0) {
          const params = {
            formId: formId,
          };

          const response = await BpmFormArtifactService.list(params);

          if (response.code === 0) {
            const result = response.result;

            const newConfigs = [...changeResult];
            const tabIndex = newConfigs.findIndex((el) => el.idTab === formId);
            const tabData = newConfigs.find((el) => el.idTab === formId);

            const newChildrens = await Promise.all(
              result.map((item) => {
                const config = item.config ? JSON.parse(item.config) : "";

                return config.type === "signature" ? (
                  <div key={item.id} datatype={config.type} id={item.artifactId} style={{ height: "100%" }}>
                    <Button>{config?.data?.title ? config?.data?.title : "Button"}</Button>
                  </div>
                ) : config.type === "bell" ? (
                  <div key={item.id} datatype={config.type} style={{ height: "100%" }}>
                    <Icon name="Bell" />
                  </div>
                ) : (
                  // : null
                  <div key={item.id} datatype={config.type} style={{ height: "100%" }}>
                    <EformPreview idEform={item.eformId} type = {config.type} />
                  </div>
                );
              })
            );

            const newConfig = {
              childrens: newChildrens || [],
              idTab: tabData?.idTab,
              title: tabData?.title,
              layouts: {
                [breakpoint]: result.map((el) => {
                  const newChildren = [...newChildrens]?.find((il) => +il?.key === +el.id) || null;
                  // const type = newChildren?.props?.children?.props?.children;

                  return {
                    x: el.x,
                    y: el.y,
                    w: el.w,
                    h: el.h,
                    i: el.id.toString(),
                    isBounded: undefined,
                    isDraggable: undefined,
                    isResizable: undefined,
                    maxH: undefined,
                    maxW: undefined,
                    minH: undefined,
                    minW: undefined,
                    moved: false,
                    resizeHandles: undefined,
                    static: false,
                    children: newChildren,
                    artifactId: el.artifactId,
                  };
                }),
              },
            };

            if (tabIndex !== -1) {
              newConfigs[tabIndex] = newConfig;
              setConfigs(newConfigs);
            }
          } else {
            showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          }
        }
      }
    } else {
      showToast(responseTab.message || "Lỗi tab đang bị lỗi. Vui lòng thử lại sau !", "error");
    }
  };

  console.log("configs : ", configs);

  useEffect(() => {
    if (idTabConfig && dataNode) {
      getDataBpmFormArtifact(+dataNode.id, idTabConfig);
    }
  }, [idTabConfig, onShow, dataNode]);

  const [idxConfig, setIdxConfig] = useState<number>(0);
  const [isChangeTitleTab, setIsChangeTitleTab] = useState<boolean>(false);

  useEffect(() => {
    if (configs?.length > 0) {
      const data = configs[idxConfig];
      setIdTabConfig(+data?.idTab);
    }
  }, [idxConfig, configs]);

  const handleAddConfigItem = async (nodeId) => {
    // setConfigs([...configs, {idTab: '', title: `Tab ${configs.length + 1}`, childrens: [], layouts: { lg: [] } }]);
    setIdxConfig(configs.length);
    setIsChangeTitleTab(false);

    handleInitialCreateTab(nodeId, `New Tab`);
  };

  const handleDeleteConfigItem = async (idx, idTab) => {
    const newData = [...configs];
    newData.splice(idx, 1);

    // setConfigs(newData);

    setIdxConfig(configs.length > idx + 1 ? newData.length - 1 : idx - 1);

    const response = await BpmFormService.delete(idTab);
    if (response.code === 0) {
      // showToast("Xóa quy trình thành công", "success");
      handleLstTabBpm(+dataNode.id);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleChangeValueName = (e, idx, idTab, nodeId) => {
    const value = e.target.value;
    // handleInitialCreateTab(nodeId, value, idTab)

    setConfigs((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            title: value,
          };
        }

        return item;
      })
    );
  };

  const [toolboxItem, setToolboxItem] = useState(null);
  console.log("toolboxItem", toolboxItem);

  const [breakpoint, setBreakpoint] = useState("lg");
  const [nextId, setNextId] = useState(uuidv4());
  const [typeModal, setTypeModal] = useState("");

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalMapping, setShowModalMapping] = useState<boolean>(false);
  const [dataLayout, setDataLayout] = useState(null);

  //Dữ liệu id của eform
  const [eformId, setEformId] = useState(null);

  const dataTabConfig = configs.find((_, idx) => idx === idxConfig);

  console.log("dataTabConfig", dataTabConfig);

  const handleDeleteItemChildren = async (id) => {
    const newLayouts = _.cloneDeep(dataTabConfig.layouts);
    newLayouts[breakpoint] = newLayouts[breakpoint].filter((item) => item.i !== id);

    const response = await BpmFormArtifactService.delete(id);
    if (response.code === 0) {
      setConfigs((prev) =>
        prev.map((item, idx) => {
          if (idx === idxConfig) {
            return {
              ...item,
              layouts: newLayouts,
              childrens: item.childrens.filter((child) => child.key !== id),
            };
          }
          return item;
        })
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const [dataComponent, setDataComponent] = useState(null);

  const memoizedItems = useMemo(() => {
    return dataTabConfig?.layouts[breakpoint].map((item) => {
      return (
        <div key={item.i} className="item__node--layout" onMouseDown={stopPropagation} onTouchStart={stopPropagation}>
          <div className="layout__children">
            <div className="item-render">{item.children}</div>
            <div className= {item.children.props.datatype === 'form' ? "action-children-form" : "action-children" } >
              {item.children.props.datatype === 'form' || item.children.props.datatype === 'create_eform' ? 
                <Tippy content="Cài đặt">
                  <div
                    className="action-children-item action-children-edit"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setShowModalMapping(true);
                      setDataComponent(item);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      setShowModalMapping(true);
                      setDataComponent(item);
                    }}
                  >
                    <Icon name="Settings" />
                  </div>
                </Tippy>
              : null}

              <Tippy content="Sửa">
                <div
                  className="action-children-item action-children-edit"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setTypeModal(item.children.props.datatype);
                    setShowModalAdd(true);
                    setDataComponent(item);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setTypeModal(item.children.props.datatype);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="Pencil" />
                </div>
              </Tippy>

              <Tippy content="Xóa">
                <div
                  className="action-children-item action-children-delete"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleDeleteItemChildren(item.i);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    handleDeleteItemChildren(item.i);
                  }}
                >
                  <Icon name="Trash" />
                </div>
              </Tippy>
            </div>
          </div>
        </div>
      );
    });
  }, [dataTabConfig?.layouts, breakpoint]);

  function replacer(key, value) {
    if (typeof value === "symbol") {
      return `__symbol:${value.toString().slice(7, -1)}`;
    }
    return value;
  }

  const handleDrop = async (layout, item, e) => {
    const { type } = toolboxItem;
    // const data = e.dataTransfer.getData("text");
    // const newIcon = toolboxItems[parseInt(data, 10)];

    const newLayouts = _.cloneDeep(dataTabConfig?.layouts);

    const saveConfig = {
      type: type,
      data: null,
    };

    const body = {
      artifactId: toolboxItem.id,
      formId: idTabConfig,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      eformId: "",
      // config: JSON.stringify(toolboxItem.layout),
      config: JSON.stringify(saveConfig),
    };

    const response = await BpmFormArtifactService.update(body);
    if (response.code === 0) {
      const result = response.result;
      const newItem = {
        ...item,
        i: result.id.toString(),
        x: result.x,
        y: result.y,
        artifactId: result.artifactId,
        type,
        children: toolboxItem.layout,
        isDraggable: undefined,
        isResizable: undefined,
      };

      Object.keys(newLayouts).forEach((size) => {
        newLayouts[size] = bfs(newLayouts[size], newItem);
      });

      setConfigs((prev) =>
        prev.map((ol, idx) => {
          if (idx === idxConfig) {
            return {
              ...ol,
              layouts: newLayouts,
              childrens: [
                ...ol.childrens,
                // eslint-disable-next-line react/no-unknown-property
                // <div key={item.i} datatype={type} style={{ height: "100%" }}>
                //   {toolboxItem.layout}
                // </div>,
                <div key={newItem.i} datatype={type} style={{ height: "100%" }}>
                  {toolboxItem.layout}
                </div>,
              ],
            };
          }

          return ol;
        })
      );

      setNextId(uuidv4());
      setDataLayout(newItem);

      setShowModalAdd(true);
      // setTypeModal(toolboxItem.type);
      setDataComponent(newItem);

      if(type !== 'create_eform'){
        setTypeModal(toolboxItem.type);
      }

      ///Đoạn này là tạo eform mới 
      if(type === 'create_eform'){

        const body: any = {
          id:  0,
          name:  "",
          note: '',
          type: 1
        };
    
        const responseCreateEform = await ContractEformService.update(body);
    
        if (responseCreateEform.code === 0) {
          const resultCreateEform = responseCreateEform.result;
          // setEformId(resultCreateEform.id);
          // setTypeModal(toolboxItem.type);
          showToast(`${ "Thêm mới"} biểu mẫu thành công`, "success");

          ///Đoạn này là thêm eform vừa tạo vào node/artifact 
          const body = {
            id: newItem.i,
            eformId: resultCreateEform.id,
          };
      
          const responseAddEformToArtifact = await BpmFormArtifactService.updateEform(body);
          if (responseAddEformToArtifact.code === 0) {
            setTypeModal(toolboxItem.type);
          } else {
            showToast(responseAddEformToArtifact.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          }

        } else {
          showToast(responseCreateEform.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleDragStart = (item) => {
    setToolboxItem(item);
  };

  const getDroppingItem = () => {
    if (!toolboxItem) {
      return null;
    }
    return { ...toolboxItem, i: nextId };
  };

  const handleLayoutChange = (layout, layouts) => {
    if (layout.find(({ i }) => i === nextId)) {
      return;
    }

    if (layout?.length > 0) {
      layout.map(async (item) => {
        const body = {
          id: +item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        };

        const response = await BpmFormArtifactService.updatePosition(body);
        if (response.code === 0) {
        } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
      });
    }

    const newLayouts = _.cloneDeep(layouts);

    Object.keys(newLayouts).forEach((size) => {
      newLayouts[size] = newLayouts[size].map((item, index) => {
        const original = layouts[size] || layouts.lg;
        return { ...original[index], ...item, children: dataTabConfig.childrens.find((el) => el.key === item.i) };
      });
    });

    setConfigs((prev) =>
      prev.map((item, idx) => {
        if (idx === idxConfig) {
          return {
            ...item,
            layouts: newLayouts,
          };
        }

        return item;
      })
    );
  };

  const droppingItem = getDroppingItem();
  //TODO: 👉 Quản lý state và logic code kéo thả UI 👈

  useEffect(() => {
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, []);

  // Thực hiện gửi email
  const onSubmit = async (e) => {
    e.preventDefault();

    const body: IEmailRequest = {
      ...dataNode,
      ...(!_.isEqual(nodeName, dataNode?.name) ? { name: nodeName } : {}),
      configData: null,
      point: nodePoint,
    };

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật điều kiện Email thành công`, "success");
      onHide(true);
      setEditName(true);
      setNodePoint(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handleClearForm();
              // !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          // {
          //   title: "Xác nhận",
          //   color: "primary",
          //   disabled: isSubmit || !nodeName || statusMA === 1,
          //   is_loading: isSubmit,
          //   callback: () => {
          //     if (_.isEqual(nodeName, dataNode?.name)) {
          //       // onSubmit(formData);
          //     } else {
          //       onHide(true);
          //       setEditName(true);
          //       setTimeout(() => {
          //         setNodePoint(null);
          //       }, 1000);
          //     }
          //   },
          // },
        ],
      },
    }),
    [isSubmit, nodeName, dataNode, nodePoint, statusMA]
  );

  const [editName, setEditName] = useState(true);

  const handleClearForm = () => {
    onHide(false);
    setEditName(true);
    setNodeName(null);
    setNodePoint(null);
    setConfigs([]);
    setTypeModal(null);
  };

  const changeNodeName = async () => {
    if (!nodeName) {
      showToast(`Vui lòng nhập tên ${dataNode?.code === "do" ? "hành động" : "điều kiện"}`, "error");
      return;
    }
    const body: IEmailRequest = {
      ...dataNode,
      name: nodeName,
      configData: null,
      point: nodePoint,
    };

    const response = await BusinessProcessService.addNode(body);

    if (response.code === 0) {
      showToast(`Cập nhật ${dataNode?.code === "do" ? "hành động" : "điều kiện"} thành công`, "success");
      onHide("not_close");
      setEditName(true);
      setDataNode({ ...dataNode, name: nodeName });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const { dataBranch } = useContext(UserContext) as ContextType;

  const values = useMemo(
    () =>
      ({
        
        logical: "and",
        dataEform: null,
        listEformAttribute: [],
        rule: [],
        blockRule: [],
      } as any),
    [onShow]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);


  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value
    };    

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;
      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
              return {
                value: item.id,
                label: item.name,
                avatar: item.avatar,
                departmentId: item.departmentId,
                departmentName: item.departmentName
              };
            })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const formatOptionLabelEmployee = ({ label, avatar, departmentName }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div>
          <div>
            {label}
          </div>
          {departmentName ? 
            <div>
              <span style={{fontSize: 10, fontWeight:'200', marginTop: 3}}>
                {`${departmentName}`}
              </span>
            </div>
          : null}
        </div>
      </div>
    );
  };

  const [listStep, setListStep] = useState([]);
  console.log('listStep', listStep);

  // useEffect(() => {
  //   if(listStep && listStep.length > 0){
  //     setNewListStep(listStep);
  //   }
  // }, [listStep])
  // const [newListStep, setNewListStep] = useState([]);
  
  
  // useEffect(() => {
  //   if(listStep?.length === 0 && onShow){
  //     addStepHandle();
  //   }
  // }, [listStep, onShow])

  const getListStep = async (formId) => {
    // setListStep([]);
    const params: any = {
      formId: formId
    };

    const response = await BpmFormProcessService.list(params);
    if (response.code === 0) {
      const result = response.result;
      setListStep(result);

      // if(result && result.length > 0){
      //   let newListStep = [];
      //   result.map(async(item) => {
      //     const params: any = {
      //       bfpsId: item.id
      //     };
      
      //     const response = await BpmParticipantService.list(params);
      //     if (response.code === 0) {
      //       const result = response.result;
      //       const newData = {
      //         ...item,
      //         employeeList: result
      //       }
            
      //       newListStep.push(newData);
            
      //       console.log('newListStep', newListStep);
      //       setListStep(oldArray => [...oldArray, newData]);
      
      //     } else {
      //       showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      //     }
      //   })
      // }

    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  }

  useEffect(() => {
    if(idTabConfig){
      getListStep(idTabConfig);
      // setNewListStep([]);
    }
  }, [idTabConfig])

  const addStepHandle = async (id?: number, actionNext? : number) => {
    const body: any = {
      ...(id ? {id: id} : {}),
      actionNext: actionNext ? actionNext : 1,
      nodeId: +dataNode.id,
      formId: idTabConfig
    };

    const response = await BpmFormProcessService.update(body);
    if (response.code === 0) {
      getListStep(idTabConfig);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  }

  const deleteStep = async (id: number) => {
    const response = await BpmFormProcessService.delete(id);
    if (response.code === 0) {
      // const newListStep = [...listStep];
      // if(newListStep?.length === 1){
      //   setNewListStep([]);
      // }
      getListStep(idTabConfig);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  }

  const selectEmployee = async (bfpsId, e) => {
    const body: any = {
      bfpsId: bfpsId,
      departmentId: e.departmentId,
      employeeId: e.value,
    };

    console.log('body', body);

    const response = await BpmParticipantService.update(body);
    if (response.code === 0) {
      getListStep(idTabConfig);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  }

  const deleteEmployee = async (id: number) => {
    const response = await BpmParticipantService.delete(id);
    if (response.code === 0) {
      // setListStep([]);
      getListStep(idTabConfig);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  }
  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-config-bpm"
        size="full"
      >
        <div className="form-config-bpm">
          <div className="container-header">
            {editName ? (
              <div className="box-title">
                <h4>{nodeName || ""}</h4>
                <Tippy content="Đổi tên điều kiện">
                  <div
                    onClick={() => {
                      //edit name ngược true và false
                      setEditName(false);
                    }}
                  >
                    <Icon name="Pencil" style={{ width: 18, height: 18, fill: "#015aa4", cursor: "pointer", marginBottom: 3 }} />
                  </div>
                </Tippy>
              </div>
            ) : (
              <div className="edit-name">
                <div style={{ flex: 1 }}>
                  <Input
                    name="search_field"
                    value={nodeName}
                    fill={true}
                    iconPosition="right"
                    icon={<Icon name="Times" />}
                    iconClickEvent={() => {
                      setEditName(true);
                      setNodeName(dataNode?.name);
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNodeName(value);
                    }}
                    placeholder="Nhập tên điều kiện"
                  />
                </div>
                <div
                  className={_.isEqual(nodeName, dataNode?.name) || !nodeName ? "button-save-inactive" : "button-save-active"}
                  onClick={() => {
                    if (!_.isEqual(nodeName, dataNode?.name)) {
                      changeNodeName();
                    }
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: "500" }}>Lưu</span>
                </div>
              </div>
            )}
            <Button onClick={() => !isSubmit && handleClearForm()} type="button" className="btn-close" color="transparent" onlyIcon={true}>
              <Icon name="Times" />
            </Button>
          </div>

          <ModalBody>
            <div className="container-modal-config">
              {configs && configs.length > 0 ? (
                <div className="box__bpm">
                  <div className="tab__container">
                    <div className="lst__tabs">
                      {configs.map((item, idx) => {
                        return (
                          <div
                            key={idx}
                            className={`item-tab ${idx === idxConfig ? "item-tab--active" : ""} ${configs.length > 1 ? `item-tab--seperate` : ""}`}
                          >
                            <div className="info-tab">
                              <div className="name-tab">
                                {idxConfig === idx && (
                                  <span
                                    className={`icon-change-tab ${isChangeTitleTab ? "icon-change-tab--active" : ""}`}
                                    onClick={() => setIsChangeTitleTab(!isChangeTitleTab)}
                                  >
                                    <Icon name="Pencil" />
                                  </span>
                                )}
                                <Input
                                  name="name"
                                  value={item.title}
                                  fill={true}
                                  onBlur={(e) => {
                                    handleInitialCreateTab(+dataNode.id, item.title, +item.idTab);
                                  }}
                                  onChange={(e) => handleChangeValueName(e, idx, item.idTab, +dataNode.id)}
                                  disabled={idx !== idxConfig || !isChangeTitleTab}
                                  className="name-customize"
                                />
                                {idx !== idxConfig && (
                                  <span
                                    className="coating-disabled"
                                    onClick={() => {
                                      setIdxConfig(idx);
                                    }}
                                  />
                                )}
                              </div>
                              {configs.length > 1 && (
                                <div className="delete-tab" onClick={() => handleDeleteConfigItem(idx, item.idTab)}>
                                  <Icon name="Times" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div
                        className="add__tab"
                        onClick={() => {
                          handleAddConfigItem(+dataNode.id);
                        }}
                      >
                        <Icon name="Plus" />
                      </div>
                    </div>
                    <div className="border__bottom--tab">
                      <div className="bg-border" />
                    </div>
                  </div>
                  <div className="lst__plugin">
                    {listComponent.map((item, idx) => (
                      <ToolboxItem
                        key={item.type}
                        toolboxItem={item}
                        onDragStart={(e) => {
                          handleDragStart(item);
                          e.dataTransfer.setData("text", idx.toString());
                        }}
                      />
                    ))}
                  </div>
                  <div className="content">
                    {typeModal === 'create_eform' ? 
                      <SettingAttributeEform
                        dataObjectGroup = {null}
                        eformId={eformId}
                        onHide = {(reload) => {
                          if(reload){
                            getDataBpmFormArtifact(+dataNode.id, idTabConfig);
                          }
                          setTypeModal(null);
                        }}
                        dataComponentParent={dataComponent}
                      />
                      :
                      <ResponsiveReactGridLayout
                        className="layout"
                        rowHeight={60}
                        layouts={dataTabConfig?.layouts}
                        isDroppable={true}
                        onDrop={handleDrop}
                        droppingItem={droppingItem}
                        onLayoutChange={handleLayoutChange}
                        autoSize={true}
                      >
                        {memoizedItems}
                      </ResponsiveReactGridLayout>
                    }
                  </div>
                </div>
              ) : (
                <Loading />
              )}

              <div className="step-handle">
                <div className="box-people">
                  <div className="title-people">
                      <span style={{fontSize: 16, fontWeight:'600'}}>Danh sách bước xử lý</span>
                      <Tippy content="Thêm bước">
                          <div>
                              <Button
                                  color="success"
                                  className="icon__add"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    addStepHandle();
                                  }}
                              >
                                  <Icon name="PlusCircleFill" />
                              </Button>
                          </div>
                      </Tippy>
                  </div>

                  {listStep && listStep.length > 0 ? 
                    listStep.map((item, index) => (
                      <div key={index} className="item-people">
                        <div className="action-next">
                          <Button
                            color={item.actionNext === 1 ? "primary" : "secondary"}
                            onClick={(e) => {
                              e.preventDefault();
                              addStepHandle(item.id, 1 )
                            }}
                          >
                            AND
                          </Button>
                          <Button
                            color={item.actionNext === 2 ? "primary" : "secondary"}
                            onClick={(e) => {
                              e.preventDefault();
                              addStepHandle(item.id, 2 )
                            }}
                          >
                            OR
                          </Button>
                          <Button
                            color="destroy"
                            className="icon__detete"
                            onClick={(e) => {
                              e.preventDefault();
                              deleteStep(item.id);
                            }}
                            // disabled={disableFieldCommom}
                          >
                            <Icon name="Trash" />
                          </Button>
                    
                        </div>
                        <div style={{marginTop: 10}}>
                          <SelectCustom
                              id="participant"
                              name="participant"
                              special={true}
                              fill={true}
                              // value={ item.item?.id ? {value: item.item?.code, label: item.item?.code} : null}
                              options={[]}
                              onChange={(e) => selectEmployee(item.id, e)}
                              isAsyncPaginate={true}
                              isFormatOptionLabel={true}
                              placeholder="Chọn nhân viên xử lý"
                              additional={{
                                  page: 1,
                              }}
                              loadOptionsPaginate={loadedOptionEmployee}
                              formatOptionLabel={formatOptionLabelEmployee}
                          />
                        </div>     
                        
                        {item.lstBpmParticipant && item.lstBpmParticipant.length > 0 ? 
                          item.lstBpmParticipant.map((el, ind) => (
                            <div key={ind} className="item-employee">
                              <div style={{display: 'flex', alignItems:'center', gap: '0 0.5rem'}}>
                                <div className="avatar">
                                  <img src={ImageThirdGender} alt={'Trung Nguyen'} />
                                </div>
                                <div className="employee-name">
                                  <div>
                                    {el.employeeName}
                                  </div>
                                  {el.departmentName ? 
                                    <div>
                                      <span style={{fontSize: 10, fontWeight:'200', marginTop: 3}}>
                                        {`${el.departmentName}`}
                                      </span>
                                    </div>
                                  : null}
                                </div>
                              </div>
                              <Tippy content="Xóa">
                                <div
                                  className="action-children-item action-children-delete"
                                  onClick={() => {
                                    deleteEmployee(el.id)
                                  }}
                                >
                                  <Icon name="Trash" />
                                </div>
                              </Tippy>
                            </div>  
                          ))
                             
                        : null}
                        
                      </div>
                    ))
                   : null}
                  
                </div>
              </div>    
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>

      {typeModal &&
        (typeModal === "bell" ? (
          <ModalTypeBell
            onShow={showModalAdd}
            onHide={(reload) => {
              if (reload) {
                getDataBpmFormArtifact(+dataNode.id, idTabConfig);
              }
              setShowModalAdd(false);
              setDataComponent(null);
            }}
            dataComponent={dataComponent}
          />
        ) : typeModal == "signature" ? (
          <ModalTypeSignature
            onShow={showModalAdd}
            onHide={() => {
              setShowModalAdd(false);
              setDataComponent(null);
            }}
            dataComponent={dataComponent}
            callBack={async (data) => {
              if (data) {
                const saveConfig = {
                  type: "signature",
                  data: {
                    title: data.title,
                    link: data.link,
                  },
                };

                const body = {
                  id: +data?.id,
                  config: JSON.stringify(saveConfig),
                };

                const response = await BpmFormArtifactService.updateConfig(body);
                if (response.code === 0) {
                  getDataBpmFormArtifact(+dataNode.id, idTabConfig);
                } else {
                  showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
                }
              }
              // setConfigs((prev) =>
              //   prev.map((item, idx) => {
              //     if (idx === idxConfig) {
              //       // Thay đổi layouts cho config hiện tại
              //       const newLayouts = { ...item.layouts };
              //       newLayouts[breakpoint] = newLayouts[breakpoint].map((layoutItem) => {
              //         if (layoutItem.i.localeCompare(dataLayout && dataLayout.i) === 0) {
              //           return {
              //             ...layoutItem,
              //             children: (
              //               // eslint-disable-next-line react/no-unknown-property
              //               <div key={layoutItem.i} datatype="signature" style={{ height: "100%" }}>
              //                 <Button>{data.title}</Button>
              //               </div>
              //             ),
              //           };
              //         }
              //         return layoutItem;
              //       });

              //       return {
              //         ...item,
              //         layouts: newLayouts,
              //         childrens: [...item.childrens].map((prevChildren) => {
              //           if (prevChildren.key.localeCompare(dataLayout && dataLayout.i) === 0) {
              //             return (
              //               // eslint-disable-next-line react/no-unknown-property
              //               <div key={prevChildren.key} datatype="signature" style={{ height: "100%" }}>
              //                 <Button>{data.title}</Button>
              //               </div>
              //             );
              //           }

              //           return prevChildren;
              //         }),
              //       };
              //     }
              //     return item;
              //   })
              // );
            }}
          />
        ) : typeModal == "form" ? (
          <ModalTypeForm
            onShow={showModalAdd}
            onHide={(reload) => {
              if (reload) {
                getDataBpmFormArtifact(+dataNode.id, idTabConfig);
              }
              setShowModalAdd(false);
              setDataComponent(null);
            }}
            dataComponent={dataComponent}
            callBack={(data) => {
              // if (data) {
              //   setConfigs((prev) =>
              //     prev.map((item, idx) => {
              //       if (idx === idxConfig) {
              //         // Thay đổi layouts cho config hiện tại
              //         const newLayouts = { ...item.layouts };
              //         newLayouts[breakpoint] = newLayouts[breakpoint].map((layoutItem) => {
              //           if (layoutItem.i.localeCompare(dataLayout && dataLayout.i) === 0) {
              //             return {
              //               ...layoutItem,
              //               children: (
              //                 // eslint-disable-next-line react/no-unknown-property
              //                 <div key={layoutItem.i} datatype="form" style={{ height: "100%" }}>
              //                   <div dangerouslySetInnerHTML={{ __html: data }} />
              //                 </div>
              //               ),
              //             };
              //           }
              //           return layoutItem;
              //         });

              //         return {
              //           ...item,
              //           layouts: newLayouts,
              //           childrens: [...item.childrens].map((prevChildren) => {
              //             if (prevChildren.key.localeCompare(dataLayout && dataLayout.i) === 0) {
              //               return (
              //                 // eslint-disable-next-line react/no-unknown-property
              //                 <div key={prevChildren.key} datatype="form" style={{ height: "100%" }}>
              //                   <div dangerouslySetInnerHTML={{ __html: data }} />
              //                 </div>
              //               );
              //             }

              //             return prevChildren;
              //           }),
              //         };
              //       }
              //       return item;
              //     })
              //   );
              // }
            }}
          />
        ) : ([])
      )}

        <ModalMapping
            onShow={showModalMapping}
            dataNode={dataNode}
            onHide={(reload) => {
              if (reload) {
                getDataBpmFormArtifact(+dataNode.id, idTabConfig);
              }
              setShowModalMapping(false);
              setDataComponent(null);
            }}
            dataComponent={dataComponent}
           
          />

        
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
