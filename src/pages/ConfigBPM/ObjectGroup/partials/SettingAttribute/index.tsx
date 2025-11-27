import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IContractAttributeRequest, IContractAttributeFilterRequest } from "model/contractAttribute/ContractAttributeRequest";
import ContractAttributeService from "services/ContractAttributeService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import SelectCustom from "components/selectCustom/selectCustom";
import { isDifferenceObj } from "reborn-util";
import Tippy from "@tippyjs/react";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import Icon from "components/icon";
import { Parser } from "formula-functionizer";
import { convertToId } from "reborn-util";
import _, { isNumber } from "lodash";
import RadioList from "components/radio/radioList";
import { v4 as uuidv4 } from "uuid";

import "./index.scss";
import ObjectGroupService from "services/ObjectGroupService";
import Button from "components/button/button";
import { Responsive, WidthProvider } from "react-grid-layout";
import ObjectAttributeService from "services/ObjectAttributeService";
import NummericInput from "components/input/numericInput";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import ModalTypeForm from "pages/BPM/SettingBusinessProcess/ConfigModal/partials/ModalTypeForm/ModalTypeForm";
import ContractEformService from "services/ContractEformService";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const toolboxItems = [
  {
    name: "Chọn biểu mẫu",
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
  // {
  //   name: "Thông báo",
  //   type: "bell",
  //   icon: <Icon name="Bell" />,
  //   w: 2,
  //   h: 2,
  //   layout: (
  //     <div>
  //       <Icon name="Bell" />
  //     </div>
  //   ),
  // },
  // {
  //   name: "Luồng ký",
  //   type: "signature",
  //   icon: <Icon name="FingerTouch" />,
  //   w: 1,
  //   h: 1,
  //   layout: (
  //     <div>
  //       <Button>Button</Button>
  //     </div>
  //   ),
  // },
];

const lstOptionField = [
  {
    name: "Text",
    type: "text",
    w: 3,
    h: 1.5,
    layout: (
      <div>
        <Input
          label={"Tên trường"}
          name="name"
          fill={true}
          disabled={true}
          // required={data.custType === 1 ? true : false}
          // value={data?.taxCode}
          placeholder={`Nhập`}
          onChange={(e) => {}}
        />
      </div>
    ),
  },
  {
    name: "Textarea",
    type: "textarea",
    w: 3,
    h: 2.5,
    layout: (
      <div>
        <TextArea
          label={"Tên trường"}
          name="name"
          // value={}
          placeholder={`Nhập`}
          fill={true}
          disabled={true}
          // required={!!customerAttribute.required}
          onChange={(e) => {}}
          // maxLength={459}
        />
      </div>
    ),
  },
  {
    name: "Number",
    type: "number",
    w: 3,
    h: 1.5,
    layout: (
      <div>
        <NummericInput
          label={"Tên trường"}
          name="name"
          fill={true}
          disabled={true}
          // required={!!customerAttribute.required}
          // value={}
          thousandSeparator={true}
          placeholder={`Nhập `}
          // decimalScale={getDecimalScale(customerAttribute.attributes)}
          // onChange={(e) => {}}
        />
      </div>
    ),
  },
  {
    name: "Dropdown",
    type: "dropdown",
    w: 3,
    h: 1.5,
    layout: (
      <div>
        <SelectCustom
          label={"Tên trường"}
          name="name"
          fill={true}
          disabled={true}
          // required={!!customerAttribute.required}
          options={[]}
          // value={}
          onChange={(e) => {}}
          placeholder={`Chọn `}
        />
      </div>
    ),
  },
  {
    name: "Multiselect",
    type: "multiselect",
    w: 3,
    h: 2,
    layout: (
      <div>
        <CheckboxList
          title={"Tên trường"}
          // required={!!customerAttribute.required}
          disabled={true}
          options={[
            {
              value: "option_1",
              label: "Lựa chọn 1",
            },
            {
              value: "option_2",
              label: "Lựa chọn 2",
            },
          ]}
          // value={}
          onChange={(e) => {}}
        />
      </div>
    ),
  },
  {
    name: "Checkbox",
    type: "checkbox",
    w: 3,
    h: 1.5,
    layout: (
      <div>
        <Checkbox
          // checked={}
          label={"Tên trường"}
          onChange={(e) => {}}
        />
      </div>
    ),
  },
  {
    name: "Radio",
    type: "radio",
    w: 3,
    h: 2,
    layout: (
      <div>
        <RadioList
          name={"name"}
          title={"Tên trường"}
          options={[
            {
              value: "option_1",
              label: "Lựa chọn 1",
            },
            {
              value: "option_2",
              label: "Lựa chọn 2",
            },
          ]}
          // value={}
          onChange={(e) => {}}
        />
      </div>
    ),
  },
  {
    name: "Date",
    type: "date",
    w: 3,
    h: 1.5,
    layout: (
      <div>
        <DatePickerCustom
          label={"Tên trường"}
          name={"name"}
          fill={true}
          // value={}
          disabled={true}
          onChange={(e) => {}}
          placeholder={`Nhập `}
          // required={!!customerAttribute.required}
          iconPosition="left"
          icon={<Icon name="Calendar" />}
          isMaxDate={false}
        />
      </div>
    ),
  },
];

const ToolboxItem = ({ toolboxItem, onDragStart, types }) => {
  const { type } = toolboxItem;
  return types === "field" ? (
    <div draggable={true} className="item-field" onDragStart={onDragStart}>
      {toolboxItem.name}
    </div>
  ) : (
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

  return newLayouts;
}

export default function SettingAttribute(props: any) {
  const { onShow, onHide, dataObjectGroup } = props;
  console.log("dataObjectGroup", dataObjectGroup);

  const refShowField = useRef();
  useOnClickOutside(refShowField, () => setShowFields(false), ["formula"]);

  //   const dataCheck = dataContractAttribute?.attributes && JSON.parse(dataContractAttribute?.attributes)
  // console.log('dataCheck', dataCheck);

  const parser = new Parser();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [data, setData] = useState<any>();

  const [addFieldAttributes, setAddFieldAttributes] = useState<any[]>([{ value: "", label: "" }]);
  const [detailLookup, setDetailLookup] = useState<any>("contract");
  const [numberFormat, setNumberFormat] = useState<any>("");

  const [contractAttributeFields, setContractAttributeFields] = useState<any>(null); //Khởi tạo null là quan trọng
  console.log("contractAttributeFields", contractAttributeFields);

  const [showFields, setShowFields] = useState<boolean>(false);
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [checkFieldName, setCheckFieldName] = useState(false);

  //Dữ liệu id của eform
  const [eformId, setEformId] = useState(null);

  //   const onSubmit = async (e) => {
  //     e.preventDefault();

  //     setIsSubmit(true);

  //     const response = await ContractAttributeService.update(body);

  //     if (response.code === 0) {
  //       showToast(`${data ? "Cập nhật" : "Thêm mới"} trường thông tin hợp đồng thành công`, "success");
  //       handleClearForm(true);

  //     } else {
  //       showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //       setIsSubmit(false);
  //     }
  //   };

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
              handleClearForm(false);
              //   !isDifferenceObj(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          // {
          //   title: data ? "Cập nhật" : "Tạo mới",
          //   type: "submit",
          //   color: "primary",
          //   disabled:
          //     isSubmit,
          //   //   (!isDifferenceObj(formData.values, values)) ||
          //   //   (formData.errors && Object.keys(formData.errors).length > 0) ||
          //   //   checkFieldName,
          //   is_loading: isSubmit,
          // },
        ],
      },
    }),
    [isSubmit, addFieldAttributes, detailLookup, numberFormat, checkFieldName]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleClearForm(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  //! Đoạn này xử lý phức tạp hơn
  const [toolboxItem, setToolboxItem] = useState(null);
  const [breakpoint, setBreakpoint] = useState("lg");
  const [nextId, setNextId] = useState(uuidv4());
  const [typeModal, setTypeModal] = useState("");
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [dataLayout, setDataLayout] = useState(null);
  const [dataField, setDataField] = useState(null);
  console.log("dataField", dataField);

  // useEffect(() => {
  //   //Nếu rỗng thì thay đổi
  //   let fieldName = convertToId(dataField['name']) || "";
  //   fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, 'g'), '');

  //   //Chỉ set lại nếu là trường hợp thêm mới
  //   if (!dataField?.id) {
  //     setDataField({ ...dataField, fieldName: fieldName });
  //   }
  // }, [dataField['name']]);

  // useEffect(() => {
  //   //Nếu rỗng thì thay đổi
  //   let fieldName = dataField['fieldName'] || "";
  //   fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, 'g'), '');

  //   setDataField({ ...dataField, fieldName: fieldName });
  // }, [dataField['fieldName']]);

  // const dataTabConfig = configs.find((_, idx) => idx === idxConfig);
  const [dataTabConfig, setDataTabConfig] = useState({
    childrens: [],
    layouts: { lg: [] },
  });

  console.log("dataTabConfig", dataTabConfig);

  const getDataObjectGroup = async (groupId) => {
    const response = await ObjectAttributeService.listAll(groupId);

    if (response.code === 0) {
      const result = response.result;

      const newresult = Object.entries(result);
      console.log("newresult", newresult);

      const newChildrens = await Promise.all(
        Object.entries(result).map((item: any, key) => {
          // console.log('ddd', item[1][0]);
          return item[1][0].datatype === "text" ? (
            <div key={item[1][0].id} datatype={item[1][0].datatype} style={{ height: "100%" }}>
              <Input
                label={item[1][0].name ? item[1][0].name : "Tên trường"}
                name="name"
                fill={true}
                disabled={true}
                required={!!item[1][0].required}
                // value={data?.taxCode}
                placeholder={`Nhập ${item[1][0].name}`}
                onChange={(e) => {}}
              />
            </div>
          ) : item[1][0].datatype === "textarea" ? (
            <div key={item[1][0].id} datatype={item[1][0].datatype} style={{ height: "100%" }}>
              <TextArea
                label={item[1][0].name ? item[1][0].name : "Tên trường"}
                name="name"
                // value={}
                placeholder={`Nhập ${item[1][0].name}`}
                fill={true}
                disabled={true}
                required={!!item[1][0].required}
                onChange={(e) => {}}
                // maxLength={459}
              />
            </div>
          ) : item[1][0].datatype === "number" ? (
            <div key={item[1][0].id} datatype={item[1][0].datatype} style={{ height: "100%" }}>
              <NummericInput
                label={item[1][0].name ? item[1][0].name : "Tên trường"}
                name="name"
                fill={true}
                disabled={true}
                required={!!item[1][0].required}
                // value={}
                thousandSeparator={true}
                placeholder={`Nhập ${item[1][0].name}`}
                // decimalScale={getDecimalScale(customerAttribute.attributes)}
                // onChange={(e) => {}}
              />
            </div>
          ) : item[1][0].datatype === "dropdown" ? (
            <div key={item[1][0].id} datatype={item[1][0].datatype} style={{ height: "100%" }}>
              <SelectCustom
                label={item[1][0].name ? item[1][0].name : "Tên trường"}
                name="name"
                fill={true}
                disabled={true}
                required={!!item[1][0].required}
                options={[]}
                // value={}
                onChange={(e) => {}}
                placeholder={`Chọn ${item[1][0].name}`}
              />
            </div>
          ) : item[1][0].datatype === "multiselect" ? (
            <div key={item[1][0].id} datatype={item[1][0].datatype} style={{ height: "100%" }}>
              <CheckboxList
                title={item[1][0].name ? item[1][0].name : "Tên trường"}
                required={!!item[1][0].required}
                disabled={true}
                options={
                  item[1][0].attributes
                    ? JSON.parse(item[1][0].attributes)
                    : [
                        {
                          value: "option_1",
                          label: "Lựa chọn 1",
                        },
                        {
                          value: "option_2",
                          label: "Lựa chọn 2",
                        },
                      ]
                }
                // value={}
                onChange={(e) => {}}
              />
            </div>
          ) : item[1][0].datatype === "checkbox" ? (
            <div key={item[1][0].id} datatype={item[1][0].datatype} style={{ height: "100%" }}>
              <Checkbox
                // checked={}
                disabled={true}
                label={item[1][0].name ? item[1][0].name : "Tên trường"}
                onChange={(e) => {}}
              />
            </div>
          ) : item[1][0].datatype === "radio" ? (
            <div key={item[1][0].id} datatype={item[1][0].datatype} style={{ height: "100%" }}>
              <RadioList
                name={"name"}
                disabled={true}
                required={!!item[1][0].required}
                title={item[1][0].name ? item[1][0].name : "Tên trường"}
                options={
                  item[1][0].attributes
                    ? JSON.parse(item[1][0].attributes)
                    : [
                        {
                          value: "option_1",
                          label: "Lựa chọn 1",
                        },
                        {
                          value: "option_2",
                          label: "Lựa chọn 2",
                        },
                      ]
                }
                // value={}
                onChange={(e) => {}}
              />
            </div>
          ) : item[1][0].datatype === "date" ? (
            <div key={item[1][0].id} datatype={item[1][0].datatype} style={{ height: "100%" }}>
              <DatePickerCustom
                label={item[1][0].name ? item[1][0].name : "Tên trường"}
                name={"name"}
                fill={true}
                // value={}
                disabled={true}
                onChange={(e) => {}}
                placeholder={`Nhập ${item[1][0].name}`}
                required={!!item[1][0].required}
                iconPosition="left"
                icon={<Icon name="Calendar" />}
                isMaxDate={false}
              />
            </div>
          ) : (
            <div key={item[1][0].id} datatype={item[1][0].datatype} style={{ height: "100%" }}>
              {/* <EformPreview idEform={item.eformId} /> */}
            </div>
          );
        })
      );

      console.log("newChildrens", newChildrens);

      const newConfig = {
        childrens: newChildrens || [],
        layouts: {
          [breakpoint]: Object.entries(result).map((el) => {
            const newChildren = [...newChildrens]?.find((il) => +il?.key === +el[1][0].id) || null;
            // const type = newChildren?.props?.children?.props?.children;

            return {
              x: el[1][0].x,
              y: el[1][0].y,
              w: el[1][0].w,
              h: el[1][0].h,
              i: el[1][0].id.toString(),
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
            };
          }),
        },
      };

      setDataTabConfig(newConfig);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailAttribute = async (id) => {
    const response = await ObjectAttributeService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      if (result?.datatype == "dropdown" || result?.datatype == "radio" || result?.datatype == "multiselect") {
        setAddFieldAttributes(result?.attributes ? JSON.parse(result?.attributes) : [{ value: "", label: "" }]);
      }

      if (result?.datatype == "lookup" && result?.attributes) {
        setDetailLookup(JSON.parse(result?.attributes).refType || "contract");
      }

      if (result?.datatype == "number") {
        setNumberFormat(result?.attributes ? JSON.parse(result?.attributes).numberFormat : "");
      }

      if (result?.datatype == "formula" && result?.attributes) {
        setSelectedFormula(JSON.parse(result?.attributes).formula || "");
      }

      setDataField(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (dataObjectGroup?.id) {
      getDataObjectGroup(dataObjectGroup.id);
    }
  }, [dataObjectGroup]);

  const handleDeleteItemChildren = async (id, dataField) => {
    const newLayouts = _.cloneDeep(dataTabConfig.layouts);
    newLayouts[breakpoint] = newLayouts[breakpoint].filter((item) => item.i !== id);

    const response = await ObjectAttributeService.delete(id);
    if (response.code === 0) {
      setDataTabConfig({
        ...dataTabConfig,
        layouts: newLayouts,
        childrens: dataTabConfig.childrens.filter((child) => child.key !== id),
      });

      if (dataField?.id === +id) {
        setDataField(null);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    // setConfigs((prev) =>
    //   prev.map((item, idx) => {
    //     if (idx === idxConfig) {
    //       return {
    //         ...item,
    //         layouts: newLayouts,
    //         childrens: item.childrens.filter((child) => child.key !== id),
    //       };
    //     }
    //     return item;
    //   })
    // );
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const [dataComponent, setDataComponent] = useState(null);

  const memoizedItems = useMemo(() => {
    return dataTabConfig.layouts[breakpoint].map((item) => {
      return (
        <div
          key={item.i}
          className="item__node--layout"
          onMouseDown={stopPropagation}
          onTouchStart={stopPropagation}
          style={dataField?.id === +item.i ? { border: "1px dashed var(--primary-color)", cursor: "pointer" } : { cursor: "pointer" }}
        >
          <div className="layout__children">
            <div className="item-render">{item.children}</div>
            <div className="action-children">
              <Tippy content="Sửa">
                <div
                  className="action-children-item action-children-edit"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    // setTypeModal(item.children?.props.datatype);
                    getDetailAttribute(item.i);
                    // setShowModalAdd(true);
                    // setDataField(item)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    // setTypeModal(item.children.props.datatype);
                    // setShowModalAdd(true);
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
                    handleDeleteItemChildren(item.i, dataField);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    handleDeleteItemChildren(item.i, dataField);
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
  }, [dataTabConfig.layouts, breakpoint, dataField]);

  const handleDrop = async (layout, item, e) => {
    console.log("item", item);
    console.log("toolboxItem", toolboxItem);

    const { type } = toolboxItem;
    console.log("type", type);

    // if(type === 'create_form'){
    //   const body: any = {
    //     id:  0,
    //     name:  "",
    //     note: '',
    //     type: 1
    //   };

    //   const response = await ContractEformService.update(body);

    //   if (response.code === 0) {
    //     const result = response.result;
    //     setEformId(result.id);
    //     showToast(`${ "Thêm mới"} biểu mẫu thành công`, "success");
    //   } else {
    //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //   }
    //   return;
    // }

    const data = e.dataTransfer.getData("text");

    const newLayouts = _.cloneDeep(dataTabConfig.layouts);

    const body = {
      name: "",
      fieldName: "",
      required: "",
      readonly: "",
      uniqued: "",
      datatype: type,
      attributes: "",
      position: "",
      groupId: dataObjectGroup?.id,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    };

    console.log("body", body);

    const response = await ObjectAttributeService.update(body);
    if (response.code === 0) {
      const result = response.result;

      const newItem = {
        ...item,
        i: result.id.toString(),
        type,
        children: toolboxItem.layout,
        isDraggable: undefined,
        isResizable: undefined,
      };

      console.log("newItem", newItem);

      Object.keys(newLayouts).forEach((size) => {
        newLayouts[size] = bfs(newLayouts[size], newItem);
      });

      setDataTabConfig({
        ...dataTabConfig,
        layouts: newLayouts,
        childrens: [
          ...dataTabConfig.childrens,
          <div key={newItem.i} datatype={type} style={{ height: "100%" }}>
            {toolboxItem.layout}
          </div>,
        ],
      });

      // setNextId(uuidv4());
      setDataLayout(newItem);

      setShowModalAdd(true);
      setTypeModal(toolboxItem.type);

      setDataComponent(newItem);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    // setConfigs((prev) =>
    //   prev.map((ol, idx) => {
    //     if (idx === idxConfig) {
    //       return {
    //         ...ol,
    //         layouts: newLayouts,
    //         childrens: [
    //           ...ol.childrens,
    //           // eslint-disable-next-line react/no-unknown-property
    //           <div key={item.i} datatype={type} style={{ height: "100%" }}>
    //             {newIcon.layout}
    //           </div>,
    //         ],
    //       };
    //     }

    //     return ol;
    //   })
    // );
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

    if (layout?.length > 0 && onShow) {
      layout.map(async (item) => {
        const body = {
          id: +item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        };

        const response = await ObjectAttributeService.updatePosition(body);
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

    setDataTabConfig({
      ...dataTabConfig,
      layouts: newLayouts,
    });

    // setConfigs((prev) =>
    //   prev.map((item, idx) => {
    //     if (idx === idxConfig) {
    //       return {
    //         ...item,
    //         layouts: newLayouts,
    //       };
    //     }

    //     return item;
    //   })
    // );
  };

  const droppingItem = getDroppingItem();

  const listFieldNumberFormat = [
    {
      value: "1,234",
      label: "1,234",
    },
    {
      value: "1,234.5",
      label: "1,234.5",
    },
    {
      value: "1,234.56",
      label: "1,234.56",
    },
    {
      value: "1,234.567",
      label: "1,234.567",
    },
  ];

  //! đoạn này xử lý vấn đề lấy giá trị của attribute khi thêm nhiều
  const handleChangeValueAttributeItem = (e, idx) => {
    const value = e.target.value;

    setAddFieldAttributes((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, value: value, label: value };
        }
        return obj;
      })
    );
  };

  //! xóa đi 1 item attribute
  const handleRemoveItemAttribute = (idx) => {
    const result = [...addFieldAttributes];
    result.splice(idx, 1);

    setAddFieldAttributes(result);
  };

  const saveAttribute = async (e) => {
    e.preventDefault();

    const body: any = {
      ...(dataField as any),
      // ...(data ? { id: data.id } : {}),
      ...(dataField["datatype"] == "dropdown" || dataField["datatype"] == "radio" || dataField["datatype"] == "multiselect"
        ? {
            attributes: addFieldAttributes ? JSON.stringify(addFieldAttributes) : null,
          }
        : {}),

      ...(dataField["datatype"] == "lookup"
        ? {
            attributes: detailLookup ? JSON.stringify({ refType: detailLookup }) : null,
          }
        : {}),

      ...(dataField["datatype"] == "number"
        ? {
            attributes: detailLookup ? JSON.stringify({ numberFormat: numberFormat }) : null,
          }
        : {}),

      ...(dataField["datatype"] == "formula"
        ? {
            attributes: selectedFormula ? JSON.stringify({ formula: selectedFormula }) : null,
          }
        : {}),
    };

    const response = await ObjectAttributeService.update(body);

    if (response.code === 0) {
      showToast(`Cập nhật trường thông tin thành công`, "success");
      refreshData();
      getDataObjectGroup(dataObjectGroup.id);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const saveEform = async (e) => {
    e.preventDefault();

    const body: any = {
      id: eformId,
      name: "",
      note: "",
      type: 0,
    };

    const response = await ContractEformService.update(body);

    if (response.code === 0) {
      const result = response.result;
      // setEformId(result.id);
      showToast(`Lưu biểu mẫu thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    refreshData();
    setDataTabConfig({
      childrens: [],
      layouts: { lg: [] },
    });
    // setEformId(null);
  };

  const refreshData = () => {
    setDataField(null);
    setNumberFormat(null);
    setAddFieldAttributes([{ value: "", label: "" }]);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          if (!isSubmit) {
            handleClearForm(false);
            // if ((data?.datatype == 'dropdown' || data?.datatype == 'radio') && data?.attributes) {
            //   setAddFieldAttributes(JSON.parse(data?.attributes));
            // } else {
            //   setAddFieldAttributes([{ value: '', label: '' }])
            // }
          }
        }}
        className="modal-setting-object-attribute"
        size="full"
      >
        <form className="form-setting-object-attribute">
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} trường thông tin đối tượng`}
            toggle={() => {
              if (!isSubmit) {
                handleClearForm(false);
              }
            }}
          />
          <ModalBody>
            <div className="list-form-object-attribute">
              <div className="box__bpm">
                {/* <div className="tab__container">
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
                                onChange={(e) => handleChangeValueName(e, idx)}
                                disabled={idx !== idxConfig || !isChangeTitleTab}
                                className="name-customize"
                              />
                              {idx !== idxConfig && <span className="coating-disabled" onClick={() => setIdxConfig(idx)} />}
                            </div>
                            {configs.length > 1 && (
                              <div className="delete-tab" onClick={() => handleDeleteConfigItem(idx)}>
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
                        setConfigs([...configs, { title: `Tab ${configs.length + 1}`, childrens: [], layouts: { lg: [] } }]);
                        setIdxConfig(configs.length);
                        setIsChangeTitleTab(false);
                      }}
                    >
                      <Icon name="Plus" />
                    </div>
                  </div>
                  <div className="border__bottom--tab">
                    <div className="bg-border" />
                  </div>
                </div> */}
                {/* <div className="lst__plugin">
                  {toolboxItems.map((item, idx) => (
                    <ToolboxItem
                      key={item.type}
                      toolboxItem={item}
                      types="toolbar"
                      onDragStart={(e) => {
                        handleDragStart(item);
                        e.dataTransfer.setData("text", idx.toString());
                      }}
                    />
                  ))}
                </div> */}
                {/* Đoạn cần copy */}
                <div className="content">
                  <div className="content__left">
                    <span className="title-left">Danh sách các trường</span>

                    <div className="lst__field">
                      {lstOptionField.map((item, idx) => {
                        return (
                          <ToolboxItem
                            key={item.type}
                            toolboxItem={item}
                            types="field"
                            onDragStart={(e) => {
                              handleDragStart(item);
                              e.dataTransfer.setData("text", idx.toString());
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="content__center">
                    <ResponsiveReactGridLayout
                      className="layout"
                      rowHeight={60}
                      layouts={dataTabConfig.layouts}
                      isDroppable={true}
                      onDrop={handleDrop}
                      droppingItem={droppingItem}
                      onLayoutChange={handleLayoutChange}
                      autoSize={true}
                    >
                      {memoizedItems}
                    </ResponsiveReactGridLayout>

                    {/* <div style={{ display:'flex', justifyContent:'flex-end', margin: '1rem'}}>
                      <Button
                        color="primary"
                        // disabled={isSubmit}
                        onClick={(e) => {
                          saveEform(e);
                        }}
                      >
                        Lưu mẫu
                      </Button>
                    </div> */}
                  </div>
                  <div className="content__right">
                    {dataField ? (
                      <div className="form-attribute">
                        <div className="form-group-attribute">
                          <Input
                            label="Tên trường"
                            name="name"
                            fill={true}
                            required={true}
                            value={dataField?.name}
                            placeholder="Tên trường"
                            onChange={(e) => {
                              const value = e.target.value;

                              let fieldName = convertToId(value) || "";
                              fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

                              //Chỉ set lại nếu là trường hợp thêm mới
                              setDataField({ ...dataField, name: value, fieldName: fieldName });
                              // if (!dataField?.id) {
                              //   setDataField({ ...dataField,name: value, fieldName: fieldName });
                              // } else {
                              //   setDataField({ ...dataField, name: value });
                              // }
                            }}
                          />
                        </div>
                        <div className="form-group-attribute">
                          <Input
                            label="Mã trường"
                            name="name"
                            fill={true}
                            required={true}
                            value={dataField?.fieldName}
                            placeholder="Tên trường"
                            onChange={(e) => {
                              const value = e.target.value;
                              // setDataField({ ...dataField, fieldName: value });
                              let fieldName = value || "";
                              fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

                              setDataField({ ...dataField, fieldName: fieldName });
                            }}
                          />
                        </div>

                        <div className="form-group-attribute">
                          {dataField["datatype"] == "dropdown" || dataField["datatype"] == "radio" || dataField["datatype"] == "multiselect" ? (
                            <div className="list__attribute">
                              {addFieldAttributes.map((item, idx) => {
                                return (
                                  <div key={idx} className="attribute__item">
                                    <div className="list-field-attribute">
                                      <div className="form-group">
                                        <Input
                                          label={idx == 0 ? "Lựa chọn" : ""}
                                          fill={true}
                                          required={true}
                                          value={item.label}
                                          placeholder="Nhập lựa chọn"
                                          onChange={(e) => handleChangeValueAttributeItem(e, idx)}
                                        />
                                      </div>
                                    </div>
                                    {idx == 0 ? (
                                      <span className="add-attribute">
                                        <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                          <span
                                            className="icon-add"
                                            onClick={() => {
                                              setAddFieldAttributes([...addFieldAttributes, { value: "", label: "" }]);
                                            }}
                                          >
                                            <Icon name="PlusCircleFill" />
                                          </span>
                                        </Tippy>
                                      </span>
                                    ) : (
                                      <span className="remove-attribute">
                                        <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                          <span className="icon-remove" onClick={() => handleRemoveItemAttribute(idx)}>
                                            <Icon name="Trash" />
                                          </span>
                                        </Tippy>
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>

                        {dataField?.datatype == "number" ? (
                          <div className="form-group-attribute">
                            <RadioList
                              options={listFieldNumberFormat}
                              className="form-group-number"
                              title="Định dạng số"
                              name="numberFormat"
                              value={numberFormat}
                              onChange={(e) => setNumberFormat(e?.target.value)}
                            />
                          </div>
                        ) : null}

                        <div className="form-group-attribute">
                          <NummericInput
                            name="position"
                            id="position"
                            label="Thứ tự hiển thị"
                            placeholder="Nhập thứ tự hiển thị"
                            fill={true}
                            value={dataField?.position || ""}
                            onValueChange={(e) => {
                              const value = e.floatValue || "";
                              setDataField({ ...dataField, position: value });
                            }}
                          />
                        </div>
                        <div className="form-group-attribute">
                          <CheckboxList
                            title="Trường bắt buộc nhập?"
                            options={[
                              {
                                value: "1",
                                label: "Bắt buộc",
                              },
                            ]}
                            value={[dataField?.required].join()}
                            onChange={(e) => {
                              const value = e.split(",");
                              setDataField({ ...dataField, required: value[0] });
                            }}
                          />
                        </div>
                        <div className="form-group-attribute">
                          <CheckboxList
                            title="Chỉ cho phép đọc?"
                            options={[
                              {
                                value: "1",
                                label: "Chỉ cho phép đọc",
                              },
                            ]}
                            value={[dataField?.readonly].join()}
                            onChange={(e) => {
                              const value = e.split(",");
                              setDataField({ ...dataField, readonly: value[0] });
                            }}
                          />
                        </div>
                        <div className="form-group-attribute">
                          <CheckboxList
                            title="Kiểm trùng giá trị?"
                            options={[
                              {
                                value: "1",
                                label: "Kiểm trùng dữ liệu",
                              },
                            ]}
                            value={[dataField?.uniqued].join()}
                            onChange={(e) => {
                              const value = e.split(",");
                              setDataField({ ...dataField, uniqued: value[0] });
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button
                            color="primary"
                            // disabled={isSubmit}
                            onClick={(e) => {
                              saveAttribute(e);
                            }}
                          >
                            Lưu
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                {/* Đoạn cần copy */}
              </div>

              {typeModal &&
                (typeModal === "form" ? (
                  <ModalTypeForm
                    onShow={showModalAdd}
                    onHide={(reload) => {
                      if (reload) {
                        // getDataBpmFormArtifact(+dataNode.id, idTabConfig);
                      }
                      setShowModalAdd(false);
                      setDataComponent(null);
                    }}
                    dataComponent={dataComponent}
                    callBack={(data) => {}}
                  />
                ) : null)}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
