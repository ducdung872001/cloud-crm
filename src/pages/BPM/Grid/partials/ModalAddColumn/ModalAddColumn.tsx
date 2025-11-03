import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICustomerAttributeRequest, ICustomerAttributeFilterRequest } from "model/customerAttribute/CustomerAttributeRequest";
import CustomerAttributeService from "services/CustomerAttributeService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { convertToId, getSearchParameters, isDifferenceObj } from "reborn-util";
import "./ModalAddColumn.scss";
import Input from "components/input/input";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import RadioList from "components/radio/radioList";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import { bind, fill, set } from "lodash";
import GirdService from "services/GridService";
import { BindingFieldMap } from "./BindingFieldMap";
import { is } from "bpmn-js/lib/util/ModelUtil";

export default function ModalAddColumn(props: any) {
  const { onShow, onHide, data, listColumn, setListColumn } = props;

  const params: any = getSearchParameters();
  console.log("columnsEdit>>>>>", data);

  const refShowField = useRef();
  useOnClickOutside(refShowField, () => setShowFields(false), ["formula"]);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listCustomerAttribute, setListCustomerAttribute] = useState<IOption[]>(null);
  const [isLoadingCustomerAttribute, setIsLoadingCustomerAttribute] = useState<boolean>(false);
  const [addFieldAttributes, setAddFieldAttributes] = useState<any[]>([]);
  const [detailLookup, setDetailLookup] = useState<any>("");
  const [numberFormat, setNumberFormat] = useState<any>("");

  const [listBindingField, setListBindingField] = useState<any[]>([]);
  const [detailBindingField, setDetailBindingField] = useState<any>([]);

  //Cần đổi lại thành khách hàng
  const [customerAttributeFields, setCustomerAttributeFields] = useState<any>(null); //Khởi tạo null là quan trọng
  const [showFields, setShowFields] = useState<boolean>(false);
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [checkFieldName, setCheckFieldName] = useState(false);

  const [listLookup, setListLookup] = useState<IOption[]>([
    // {
    //   value: "customer",
    //   label: "Khách hàng",
    // },
    {
      value: "reason",
      label: "Loại nguyên nhân",
    },
    {
      value: "project_catalog",
      label: "Loại dự án",
    },
    {
      value: "project_realty",
      label: "Dự án",
    },
    {
      value: "unit",
      label: "Đơn vị tính",
    },
    {
      value: "material",
      label: "Vật tư",
    },
    {
      value: "field",
      label: "Lĩnh vực",
    },
    {
      value: "business_category",
      label: "Ngành nghề kinh doanh",
    },
    {
      value: "supplier",
      label: "Nhà cung cấp",
    },
    {
      value: "investor",
      label: "Chủ đầu tư",
    },
    {
      value: "procurement_type",
      label: "Loại yêu cầu mua sắm",
    },
    {
      value: "work_category",
      label: "Công việc",
    },
  ]);

  /**
   * Lấy ra nhóm trường thông tin cha
   */
  const onSelectOpenCustomerAttribute = async () => {
    if (!listCustomerAttribute || listCustomerAttribute.length === 0) {
      setIsLoadingCustomerAttribute(true);

      const params: ICustomerAttributeFilterRequest = {
        isParent: 1,
      };
      const response = await CustomerAttributeService.list(params);

      if (response.code === 0) {
        const dataOption = response.result?.items;
        setListCustomerAttribute([
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ]);
      }
      setIsLoadingCustomerAttribute(false);
    }
  };

  useEffect(() => {
    // if (data?.parentId) {
    //   onSelectOpenCustomerAttribute();
    // }

    // if (data?.parentId === null) {
    //   setListCustomerAttribute([]);
    // }

    if (data?.parentId) {
      setDetailParent({ value: data.parentId, label: data.parentName });
    }

    if ((data?.type == "select" || data?.type == "radio" || data?.type == "multiselect") && data?.options) {
      setAddFieldAttributes(JSON.parse(data?.options));
    }

    if (data?.type == "lookup" && data?.options) {
      setDetailLookup(data?.lookup);
    }

    if (data?.type == "number" && data?.options) {
      setNumberFormat(JSON.parse(data?.options).numberFormat || "");
    }

    if (data?.type == "formula" && data?.options) {
      setSelectedFormula(JSON.parse(data?.options).formula || "");
    }
  }, [data]);

  //! đoạn này xử lý vấn đề lấy nhãn của attribute khi thêm nhiều
  const handleChangeLabelAttributeItem = (e, idx) => {
    const value = e.target.value;

    setAddFieldAttributes((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, label: value };
        }
        return obj;
      })
    );
  };

  //! đoạn này xử lý vấn đề lấy giá trị của attribute khi thêm nhiều
  const handleChangeValueAttributeItem = (e, idx) => {
    const value = e.target.value;

    setAddFieldAttributes((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, value: value };
        }
        return obj;
      })
    );
  };

  /**
   * Lấy danh sách trường thông tin để phục vụ cho tính toán trường động
   */
  const getCustomerAttributes = async () => {
    const response = await CustomerAttributeService.listAll(formData?.values["custType"]);

    let arrField = [];

    if (response.code === 0) {
      const dataOption = response.result;

      console.log("dataOption =>", dataOption);
      Object.keys(dataOption).forEach((key) => {
        (dataOption[key] || []).map((item) => {
          if (item.type == "number") {
            arrField.push("customerAttribute_" + item.key);
          }
        });
      });
      //Lưu lại
      setCustomerAttributeFields(arrField);
    }
  };

  //! đoạn này xử lý vấn đề lấy giá trị tham chiếu của trường lookup
  const handleDetailLookup = (item) => {
    setDetailLookup(item?.value);
    setListBindingField(BindingFieldMap[item?.value]);
    setDetailBindingField([]);
  };
  //! đoạn này xử lý vấn đề lấy giá trị tham chiếu của trường lookup
  const handleChangeBindingField = (item) => {
    setDetailBindingField(item);
  };

  //! xóa đi 1 item attribute
  const handleRemoveItemAttribute = (idx) => {
    const result = [...addFieldAttributes];
    result.splice(idx, 1);

    setAddFieldAttributes(result);
  };

  // đoạn này sẽ xử lý thay đổi nội dung
  const handleChangeContent = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  /**
   * Data là dữ liệu cần chèn
   * @param data
   */
  const handlePointerContent = (data) => {
    let content = selectedFormula || "";
    const textBeforeCursorPosition = content.substring(0, cursorPosition);
    const textAfterCursorPosition = content.substring(cursorPosition);

    content = textBeforeCursorPosition + data + textAfterCursorPosition;
    setSelectedFormula(content);
  };

  // const values = useMemo(
  //   () =>
  //   ({
  //     name: data?.name ?? "",
  //     position: data?.position ?? "0",
  //     parentId: data?.parentId ?? "0",
  //   } as ICustomerAttributeRequest),
  //   [data, onShow]
  // );
  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        key: data?.key || "",
        required: data?.required ? "1" : "",
        readonly: data?.readonly ? "1" : "",
        uniqued: data?.uniqued ? "1" : "",
        type: data?.type ?? "text",
        options: data?.options ?? null,
        position: data?.position ?? "0",
        parentId: data?.parentId ?? "0",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
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

  const [detailParent, setDetailParent] = useState(null);

  const loadedOptionParent = async (search, loadedOptions, { page }) => {
    const params: ICustomerAttributeFilterRequest = {
      isParent: 1,
    };
    const response = await CustomerAttributeService.list(params);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
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

  const handleChangeValueParent = (e) => {
    setDetailParent(e);
    setFormData({ ...formData, values: { ...formData?.values, parentId: e.value } });
  };

  useEffect(() => {
    if (formData?.values["type"] == "formula") {
      if (customerAttributeFields == null) {
        getCustomerAttributes();
      }
    }
  }, [formData]);

  useEffect(() => {
    //Nếu rỗng thì thay đổi
    let key = convertToId(formData.values["name"]) || "";
    key = key.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

    //Chỉ set lại nếu là trường hợp thêm mới
    if (!data?.id) {
      setFormData({ ...formData, values: { ...formData.values, key: key } });
    }
  }, [formData?.values["name"]]);

  useEffect(() => {
    //Nếu rỗng thì thay đổi
    let key = formData.values["key"] || "";
    key = key.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

    setFormData({ ...formData, values: { ...formData.values, key: key } });
  }, [formData?.values["key"]]);

  // const listField = useMemo(
  //   () =>
  //     [
  //       {
  //         label: "Tên trường thông tin",
  //         name: "name",
  //         type: "text",
  //         fill: true,
  //         required: true,
  //       },
  //       {
  //         label: "Trường thông tin cha",
  //         name: "parentId",
  //         type: "select",
  //         fill: true,
  //         required: false,
  //         options: listCustomerAttribute,
  //         onMenuOpen: onSelectOpenCustomerAttribute,
  //         isLoading: isLoadingCustomerAttribute,
  //       },
  //       {
  //         label: "Thứ tự hiển thị",
  //         name: "position",
  //         type: "number",
  //         fill: true,
  //         required: false,
  //       },
  //     ] as IFieldCustomize[],
  //   [listCustomerAttribute, isLoadingCustomerAttribute]
  // );

  const listFieldFirst = useMemo(
    () =>
      [
        {
          label: "Tên trường thông tin",
          name: "name",
          type: "text",
          fill: true,
          required: true,
          error: checkFieldName,
          message: "Tên trường thông tin này đã tồn tại",
        },
        {
          label: "Kiểu dữ liệu",
          name: "type",
          type: "select",
          fill: true,
          required: true,
          onChange: (e) => {
            if (e?.value == "select") {
              if (data && data.type === "select" && data.options) {
                setAddFieldAttributes(JSON.parse(data?.options));
              } else {
                setAddFieldAttributes([{ value: "", label: "" }]);
              }
            } else if (e?.value == "multiselect") {
              if (data && data.type === "multiselect" && data.options) {
                setAddFieldAttributes(JSON.parse(data?.options));
              } else {
                setAddFieldAttributes([{ value: "", label: "" }]);
              }
            } else if (e?.value == "radio") {
              if (data && data.type === "radio" && data.options) {
                setAddFieldAttributes(JSON.parse(data?.options));
              } else {
                setAddFieldAttributes([{ value: "", label: "" }]);
              }
            } else if (e?.value === "lookup") {
              if (data && data.type === "lookup" && data.lookup) {
                setDetailLookup(data.lookup);
              } else {
                setDetailLookup("");
              }
            } else if (e?.value === "number") {
              if (data && data.type === "number" && data.options && JSON.parse(data?.options).numberFormat) {
                setNumberFormat(JSON.parse(data?.options).numberFormat);
              } else {
                setNumberFormat("");
              }
            }
          },
          options: [
            {
              value: "text",
              label: "Text",
            },
            // {
            //   value: "textarea",
            //   label: "Textarea",
            // },
            {
              value: "number",
              label: "Number",
            },
            {
              value: "select",
              label: "Dropdown",
            },
            // {
            //   value: "multiselect",
            //   label: "Multiselect",
            // },
            {
              value: "checkbox",
              label: "Checkbox",
            },
            // {
            //   value: "radio",
            //   label: "Radio",
            // },
            // {
            //   value: "date",
            //   label: "Date",
            // },
            {
              value: "lookup",
              label: "Lookup",
            },
            {
              value: "binding",
              label: "Binding",
            },
            // {
            //   value: "formula",
            //   label: "Formula",
            // },
            // {
            //   value: "attachment",
            //   label: "Attachment",
            // },
          ],
        },
      ] as IFieldCustomize[],
    [listCustomerAttribute, isLoadingCustomerAttribute, data]
  );

  console.log("data>>>", data);

  const listFieldSecond = useMemo(
    () =>
      [
        // {
        //   label: "Mã trường thông tin",
        //   name: "key",
        //   type: "text",
        //   fill: true,
        //   required: false,
        //   readOnly: false
        // },
        {
          name: "key",
          type: "custom",
          snippet: (
            <Input
              fill={true}
              label="Mã trường thông tin"
              required={false}
              value={formData.values?.key}
              placeholder="Mã trường thông tin"
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, values: { ...formData.values, key: value } });
              }}
              error={checkFieldName}
              message="Mã trường thông tin này đã tồn tại"
            />
          ),
        },
        // {
        //   label: "Thuộc nhóm",
        //   name: "parentId",
        //   type: "select",
        //   fill: true,
        //   required: false,
        //   options: listCustomerAttribute,
        //   onMenuOpen: onSelectOpenCustomerAttribute,
        //   isLoading: isLoadingCustomerAttribute,
        // },

        // {
        //   name: "parentId",
        //   type: "custom",
        //   snippet: (
        //     <SelectCustom
        //       id="parentId"
        //       name="parentId"
        //       label="Thuộc nhóm"
        //       options={[]}
        //       fill={true}
        //       value={detailParent}
        //       required={false}
        //       onChange={(e) => handleChangeValueParent(e)}
        //       isAsyncPaginate={true}
        //       isFormatOptionLabel={true}
        //       placeholder="Chọn nhóm"
        //       additional={{
        //         page: 1,
        //       }}
        //       loadOptionsPaginate={loadedOptionParent}
        //     />
        //   ),
        // },
        // {
        //   label: "Thứ tự hiển thị",
        //   name: "position",
        //   type: "number",
        //   fill: true,
        //   required: false,
        // },
        ...(formData?.values["type"] == "formula"
          ? []
          : [
              {
                label: `Trường bắt buộc nhập?`,
                name: "required",
                type: "checkbox",
                options: [
                  {
                    value: "1",
                    label: "Bắt buộc",
                  },
                ],
                required: false,
              },
            ]),
        ...(formData?.values["type"] == "text"
          ? [
              {
                label: `Định dạng`,
                name: "regex",
                type: "select",
                fill: true,
                options: [
                  {
                    value: "",
                    label: "Không định dạng",
                  },
                  {
                    value: "phoneRegex",
                    label: "Số điện thoại",
                  },
                  {
                    value: "emailRegex",
                    label: "Email",
                  },
                ],
                required: false,
              },
            ]
          : []),
        // {
        //   label: `Trường bắt buộc nhập?`,
        //   name: "required",
        //   type: "checkbox",
        //   options: [
        //     {
        //       value: "1",
        //       label: "Bắt buộc"
        //     }
        //   ],
        //   required: false,
        // },
        {
          label: `Chỉ cho phép đọc?`,
          name: "readonly",
          type: "checkbox",
          options: [
            {
              value: "1",
              label: "Chỉ cho phép đọc",
            },
          ],
          required: false,
        },
        // {
        //   label: `Kiểm trùng giá trị?`,
        //   name: "uniqued",
        //   type: "checkbox",
        //   options: [
        //     {
        //       value: "1",
        //       label: "Kiểm trùng dữ liệu",
        //     },
        //   ],
        //   required: false,
        // },
        // {
        //   label: "Khách hàng",
        //   name: "custType",
        //   type: "radio",
        //   fill: true,
        //   options: [
        //     {
        //       value: "0",
        //       label: "Cá nhân",
        //     },
        //     {
        //       value: "1",
        //       label: "Doanh nghiệp",
        //     },
        //   ],
        // },
      ] as IFieldCustomize[],
    [
      listCustomerAttribute,
      isLoadingCustomerAttribute,
      formData?.values["name"],
      formData?.values["key"],
      formData?.values["type"],
      checkFieldName,
      detailParent,
    ]
  );

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

  useEffect(() => {
    let check_duplicated = false;
    listColumn.map((item) => {
      if (item.name == formData.values?.name) {
        check_duplicated = true;
      }
    });
    setCheckFieldName(check_duplicated);
  }, [formData.values?.key, values.key]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async () => {
    // e.preventDefault();

    const _detailBindingField = detailBindingField.map((item) => {
      let key = convertToId(item.label) || "";
      key = key.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "") + "_" + formData.values["key"];
      return {
        value: item.value,
        label: item.label,
        key: key,
      };
    });

    let list_column = [
      ...listColumn,
      {
        name: formData.values["name"],
        key: formData.values["key"],
        type: formData.values["type"],
        required: formData.values["required"] == "1" ? true : false,
        options: addFieldAttributes || [],
        position: formData.values["position"],
        lookup: detailLookup,
        regex: formData.values["regex"],
        listBindingField: _detailBindingField || [],
        readOnly: formData.values["readonly"] == "1" ? 1 : 0,
      },
      ...(formData.values["type"] == "binding" && _detailBindingField?.length
        ? _detailBindingField.map((item, index) => {
            if (item?.value) {
              return {
                name: item?.label,
                key: item?.key,
                type: item.value == "contactOrg" ? "select" : "text",
                required: false,
                options: [],
                position: formData.values["position"],
                lookup: "",
                regex: "",
                isBinding: true,
                bindingField: item?.value,
              };
            } else {
              return {};
            }
          })
        : []),
    ];

    let dataSubmit = {
      nodeId: params?.nodeId || "Activity_0n3i8dv",
      processId: params?.processId || 380,
      fieldName: params?.fieldName || "boq",
      header: JSON.stringify(list_column),
    };

    console.log("detailBindingField>>>>>", detailBindingField);
    console.log("list_column>>>>>", list_column);

    // return;
    const responseHeader = await GirdService.update(dataSubmit);

    const sortedListColumn = list_column.slice().sort((a, b) => a.position - b.position);
    setListColumn(sortedListColumn);
    handleClearForm(true);

    return;

    // const errors = Validate(validations, formData, listField);
    const errors = Validate(validations, formData, [...listFieldFirst, ...listFieldSecond]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    // const body: ICustomerAttributeRequest = {
    //   ...(formData.values as ICustomerAttributeRequest),
    //   ...(data ? { id: data.id } : {}),
    // };

    const body: ICustomerAttributeRequest = {
      ...(formData.values as ICustomerAttributeRequest),
      ...(data ? { id: data.id } : {}),
      ...(formData.values["type"] == "select" || formData.values["type"] == "radio" || formData.values["type"] == "multiselect"
        ? {
            options: addFieldAttributes ? JSON.stringify(addFieldAttributes) : null,
          }
        : {}),

      ...(formData.values["type"] == "lookup"
        ? {
            options: detailLookup ? JSON.stringify({ refType: detailLookup }) : null,
          }
        : {}),

      ...(formData.values["type"] == "number"
        ? {
            options: detailLookup ? JSON.stringify({ numberFormat: numberFormat }) : null,
          }
        : {}),

      ...(formData.values["type"] == "formula"
        ? {
            options: selectedFormula ? JSON.stringify({ formula: selectedFormula }) : null,
          }
        : {}),
    };

    const response = await CustomerAttributeService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} cột thành công`, "success");
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
            // type: "submit",
            color: "primary",
            disabled: isSubmit || checkFieldName,
            // || !isDifferenceObj(formData.values, values)
            // || (formData.errors && Object.keys(formData.errors).length > 0)
            // || checkFieldName,
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldName, detailLookup, detailBindingField]
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
    setAddFieldAttributes([{ value: "", label: "" }]);
    setDetailLookup("");
    setNumberFormat("");
    setShowFields(false);
    setCheckFieldName(false);
    setCustomerAttributeFields(null);
    setDetailParent(null);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-column-new"
        size="lg"
      >
        <form className="form-customer-attribute-source">
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} cột`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              {/* {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))} */}
              {listFieldFirst.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldFirst, setFormData)}
                  formData={formData}
                />
              ))}

              {/* Trường hợp là dropdown hoặc radio hoặc multiselect */}
              {formData?.values["type"] == "select" || formData?.values["type"] == "radio" || formData?.values["type"] == "multiselect" ? (
                <div className="list__attribute">
                  <div>
                    <span style={{ fontSize: 14, fontWeight: "700" }}>Lựa chọn</span>
                  </div>
                  {addFieldAttributes.map((item, idx) => {
                    return (
                      <div key={idx} className="attribute__item">
                        <div className="list-field-attribute">
                          <div className="form-group">
                            <Input
                              // label={idx == 0 ? 'Lựa chọn' : ''}
                              fill={true}
                              required={true}
                              value={item.label}
                              placeholder="Nhập nhãn"
                              onChange={(e) => handleChangeLabelAttributeItem(e, idx)}
                            />
                          </div>
                          <div className="form-group">
                            <Input
                              // label={idx == 0 ? 'Lựa chọn' : ''}
                              fill={true}
                              required={true}
                              value={item.value}
                              placeholder="Nhập giá trị"
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

              {/* {formData?.values["type"] == "number" ? (
                <div className="form-group-number">
                  <RadioList
                    options={listFieldNumberFormat}
                    className="form-group-number"
                    title="Định dạng số"
                    name="numberFormat"
                    value={numberFormat}
                    onChange={(e) => setNumberFormat(e?.target.value)}
                  />
                </div>
              ) : null} */}

              {/* Trường hợp là lookup */}
              {formData?.values["type"] == "lookup" || formData?.values["type"] == "binding" ? (
                <div className="form-group">
                  <SelectCustom
                    id="options"
                    name="options"
                    label="Thông tin tham chiếu"
                    fill={true}
                    required={true}
                    options={listLookup}
                    value={detailLookup}
                    onChange={(e) => handleDetailLookup(e)}
                    isFormatOptionLabel={true}
                    placeholder="Chọn tham chiếu"
                  />
                </div>
              ) : null}
              {formData?.values["type"] == "binding" ? (
                <div className="form-group">
                  <SelectCustom
                    id="bindingField"
                    name="bindingField"
                    label="Các trường tham chiếu"
                    fill={true}
                    required={true}
                    isMulti={true}
                    special={true}
                    options={listBindingField}
                    value={detailBindingField}
                    onChange={(e) => {
                      handleChangeBindingField(e);
                    }}
                    isFormatOptionLabel={true}
                    placeholder="Chọn các trường tham chiếu"
                  />
                </div>
              ) : null}

              {/* Trường hợp là formula */}
              {formData?.values["type"] == "formula" ? (
                <div className="form-group formula">
                  <div className="formula-input">
                    <TextArea
                      label="Công thức tính"
                      fill={true}
                      required={true}
                      value={selectedFormula}
                      placeholder="Nhập công thức"
                      onChange={(e) => {
                        setSelectedFormula(e?.target?.value);
                        handleChangeContent(e);
                      }}
                      onClick={(e) => {
                        handleChangeContent(e);
                      }}
                    />
                    <Icon
                      name="Plus"
                      width={24}
                      height={24}
                      title={"Thêm trường công thức"}
                      onClick={(e) => {
                        setShowFields(true);
                      }}
                    />
                  </div>

                  {/* Vùng listing sẵn các field để lựa chọn */}
                  {showFields && (
                    <div className="formula-list" ref={refShowField}>
                      {customerAttributeFields &&
                        (customerAttributeFields || []).map((item) => {
                          return (
                            <label
                              onClick={() => {
                                handlePointerContent(item);
                                setShowFields(false);
                              }}
                            >
                              {item}
                            </label>
                          );
                        })}
                    </div>
                  )}
                </div>
              ) : null}

              {listFieldSecond.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldSecond, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
