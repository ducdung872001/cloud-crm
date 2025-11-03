import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IContractAttributeRequest, IContractAttributeFilterRequest } from "model/contractAttribute/ContractAttributeRequest";
import { AddContractAttributeModalProps } from "model/contractAttribute/PropsModel";
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

import "./AddObjectAttributeModal.scss";
import ContractCategoryService from "services/ContractCategoryService";
import ObjectGroupService from "services/ObjectGroupService";
import Button from "components/button/button";
import { Responsive, WidthProvider } from "react-grid-layout";
import ObjectAttributeService from "services/ObjectAttributeService";

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

const lstOptionField = [
  {
    name: "Text",
    type: "text",
    w: 3,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Textarea",
    type: "textarea",
    w: 3,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Number",
    type: "number",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Dropdown",
    type: "dropdown",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Multiselect",
    type: "multiselect",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Checkbox",
    type: "checkbox",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Radio",
    type: "radio",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Date",
    type: "date",
    w: 4,
    h: 2,
    layout: <div></div>,
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

export default function AddObjectAttributeModal(props: any) {
  const { onShow, onHide, dataContractAttribute } = props;
  const refShowField = useRef();
  useOnClickOutside(refShowField, () => setShowFields(false), ["formula"]);

  const dataCheck = dataContractAttribute?.attributes && JSON.parse(dataContractAttribute?.attributes);

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

  const [showFields, setShowFields] = useState<boolean>(false);
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [checkFieldName, setCheckFieldName] = useState(false);

  //loại đối tượng
  const [dataCategory, setDataCategory] = useState(null);
  const [validateFieldCategory, setValidateFieldCategory] = useState<boolean>(false);

  const loadOptionCategory = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await ObjectGroupService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: any) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ],
        // hasMore: response.result.loadMoreAble,
        // additional: {
        //   page: page + 1,
        // },
      };
    }

    return { options: [], hasMore: false };
  };

  //? đoạn này xử lý vấn đề thay đổi loại hợp đồng
  const handleChangeValueCategory = (e) => {
    // setValidateFieldCategory(false);
    setDataCategory(e);
    setFormData({ ...formData, values: { ...formData.values, groupId: e.value } });
  };

  useEffect(() => {
    setData(dataContractAttribute);
  }, [dataContractAttribute]);

  useEffect(() => {
    if (data?.groupId) {
      setDataCategory({ value: data.groupId, label: data.groupName });
    }
  }, [data]);

  const values = useMemo(
    () =>
      ({
        groupId: data?.groupId ?? null,
        name: data?.name ?? "",
        fieldName: data?.fieldName || "",
        required: data?.required ? "1" : "",
        readonly: data?.readonly ? "1" : "",
        uniqued: data?.uniqued ? "1" : "",
        datatype: data?.datatype ?? "text",
        attributes: data?.attributes ?? null,
        position: data?.position ?? "0",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "categoryId",
      rules: "required",
    },
    {
      name: "name",
      rules: "required",
    },
    {
      name: "parentId",
      rules: "required",
    },
    {
      name: "position",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const listFieldFirst = useMemo(
    () =>
      [
        {
          name: "groupId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="groupId"
              name="groupId"
              label="Loại đối tượng"
              options={[]}
              fill={true}
              value={dataCategory}
              required={true}
              onChange={(e) => handleChangeValueCategory(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn loại đối tượng"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionCategory}
              error={validateFieldCategory}
              message="Loại hợp đồng không được bỏ trống"
              // formatOptionLabel={formatOptionLabelEmployee}
              // error={checkFieldEmployee}
              // message="Nhân viên không được bỏ trống"
            />
          ),
        },
      ] as IFieldCustomize[],
    [data, dataCategory, formData]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    // const errors = Validate(validations, formData, [...listFieldFirst, ...listFieldSecond]);
    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    if (!dataCategory) {
      setValidateFieldCategory(true);
      showToast("Vui lòng chọn loại hợp đồng", "error");
      return;
    }

    setIsSubmit(true);

    const body: IContractAttributeRequest = {
      ...(formData.values as IContractAttributeRequest),
      ...(data ? { id: data.id } : {}),
      ...(formData.values["datatype"] == "dropdown" || formData.values["datatype"] == "radio" || formData.values["datatype"] == "multiselect"
        ? {
            attributes: addFieldAttributes ? JSON.stringify(addFieldAttributes) : null,
          }
        : {}),

      ...(formData.values["datatype"] == "lookup"
        ? {
            attributes: detailLookup ? JSON.stringify({ refType: detailLookup }) : null,
          }
        : {}),

      ...(formData.values["datatype"] == "number"
        ? {
            attributes: detailLookup ? JSON.stringify({ numberFormat: numberFormat }) : null,
          }
        : {}),

      ...(formData.values["datatype"] == "formula"
        ? {
            attributes: selectedFormula ? JSON.stringify({ formula: selectedFormula }) : null,
          }
        : {}),
    };

    const response = await ContractAttributeService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} trường thông tin hợp đồng thành công`, "success");
      handleClearForm(true);
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
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              (!isDifferenceObj(formData.values, values) &&
                (formData.values["datatype"] == "lookup" ? detailLookup === (dataCheck ? dataCheck?.refType : "contract") : true) &&
                (formData.values["datatype"] == "number" ? numberFormat === (dataCheck ? dataCheck?.numberFormat : "") : true)) ||
              (formData.values["datatype"] == "number" && !numberFormat) ||
              (formData.errors && Object.keys(formData.errors).length > 0) ||
              checkFieldName,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, addFieldAttributes, detailLookup, numberFormat, checkFieldName]
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

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setShowFields(false);
    setDataCategory(null);
    setValidateFieldCategory(false);
  };

  // đoạn này cấu hình tab
  const [configs, setConfigs] = useState([
    {
      title: "Tab 1",
      childrens: [],
      layouts: { lg: [] },
    },
  ]);

  const [idxConfig, setIdxConfig] = useState<number>(0);
  const [isChangeTitleTab, setIsChangeTitleTab] = useState<boolean>(false);

  const handleDeleteConfigItem = (idx) => {
    const newData = [...configs];
    newData.splice(idx, 1);

    // setConfigs(newData);

    setIdxConfig(configs.length > idx + 1 ? newData.length - 1 : idx - 1);
  };

  const handleChangeValueName = (e, idx) => {
    const value = e.target.value;

    // setConfigs((prev) =>
    //   prev.map((item, index) => {
    //     if (idx === index) {
    //       return {
    //         ...item,
    //         title: value,
    //       };
    //     }

    //     return item;
    //   })
    // );
  };

  //! Đoạn này xử lý phức tạp hơn
  const [toolboxItem, setToolboxItem] = useState(null);
  const [breakpoint, setBreakpoint] = useState("lg");
  const [nextId, setNextId] = useState(uuidv4());
  const [typeModal, setTypeModal] = useState("");
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [dataLayout, setDataLayout] = useState(null);
  const [dataField, setDataField] = useState(null);

  // const dataTabConfig = configs.find((_, idx) => idx === idxConfig);
  const [dataTabConfig, setDataTabConfig] = useState({
    childrens: [],
    layouts: { lg: [] },
  });

  const handleDeleteItemChildren = (id) => {
    const newLayouts = _.cloneDeep(dataTabConfig.layouts);
    newLayouts[breakpoint] = newLayouts[breakpoint].filter((item) => item.i !== id);

    setDataTabConfig({
      ...dataTabConfig,
      layouts: newLayouts,
      childrens: dataTabConfig.childrens.filter((child) => child.key !== id),
    });

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

  const memoizedItems = useMemo(() => {
    return dataTabConfig.layouts[breakpoint].map((item) => {
      return (
        <div key={item.i} className="item__node--layout" onMouseDown={stopPropagation} onTouchStart={stopPropagation}>
          <div className="layout__children">
            <div className="item-render">{item.children}</div>
            <div className="action-children">
              <Tippy content="Sửa">
                <div
                  className="action-children-item action-children-edit"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setTypeModal(item.children.props.datatype);
                    setShowModalAdd(true);
                    setDataField(item);
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
  }, [dataTabConfig.layouts, breakpoint]);

  const handleDrop = async (layout, item, e) => {
    if (!dataCategory?.value) {
      showToast("Vui lòng chọn loại đối tượng", "warning");
      return;
    }

    const { type } = toolboxItem;

    const data = e.dataTransfer.getData("text");
    const newIcon = ["form", "bell", "signature"].includes(type) ? toolboxItems[parseInt(data, 10)] : lstOptionField[parseInt(data, 10)];

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
      groupId: dataCategory?.value,
    };

    const response = await ObjectAttributeService.update(body);
    if (response.code === 0) {
      const result = response.result;

      const newItem = {
        ...item,
        i: result.id.toString(),
        type,
        children: newIcon.layout,
        isDraggable: undefined,
        isResizable: undefined,
      };

      Object.keys(newLayouts).forEach((size) => {
        newLayouts[size] = bfs(newLayouts[size], newItem);
      });

      setDataTabConfig({
        ...dataTabConfig,
        layouts: newLayouts,
        childrens: [
          ...dataTabConfig.childrens,
          <div key={item.i} datatype={type} style={{ height: "100%" }}>
            {newIcon.layout}
          </div>,
        ],
      });

      setNextId(uuidv4());
      setDataLayout(newItem);

      setShowModalAdd(true);
      setTypeModal(newIcon.type);
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
        className="modal-add-object-attribute"
        size="xxl"
      >
        <form className="form-object-attribute" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} trường thông tin đối tượng`}
            toggle={() => {
              if (!isSubmit) {
                handleClearForm(false);
              }
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              {listFieldFirst.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldFirst, setFormData)}
                  formData={formData}
                />
              ))}

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
                <div className="lst__plugin">
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
                </div>
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
                  </div>
                  <div className="content__right">
                    {/* <span>cột thông tin bên phải</span> */}
                    <div>
                      <Input
                        label="Tên trường"
                        name="name"
                        fill={true}
                        required={true}
                        value={dataField?.name}
                        placeholder="Tên trường"
                        onChange={(e) => {
                          const value = e.target.value;
                          setDataField({ ...dataField, nane: value });
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Đoạn cần copy */}
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
