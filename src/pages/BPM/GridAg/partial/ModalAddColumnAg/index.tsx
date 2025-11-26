import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import CustomerAttributeService from "services/CustomerAttributeService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { convertToId, getSearchParameters, isDifferenceObj } from "reborn-util";
import "./index.scss";
import Input from "components/input/input";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import GirdService from "services/GridService";
import { BindingFieldMap } from "./BindingFieldMap";
import Checkbox from "components/checkbox/checkbox";
import { useGridAg } from "../../GridAgContext";
import { set } from "lodash";
import CheckboxList from "components/checkbox/checkboxList";

export default function ModalAddColumnAg(props: any) {
  const { onShow, onHide, data, listColumn, setListColumn, setIsChangeColumns, typeNo, isEdit, location } = props;
  const { setIsFetchData, setIsLoading, setColCodeEdit, setColumnsConfig } = useGridAg();
  const gridRef = useRef<any>(null);
  const params: any = getSearchParameters();

  const refShowField = useRef();
  useOnClickOutside(refShowField, () => setShowFields(false), ["formula"]);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listCustomerAttribute, setListCustomerAttribute] = useState<IOption[]>(null);
  const [isLoadingCustomerAttribute, setIsLoadingCustomerAttribute] = useState<boolean>(false);
  const [addFieldAttributes, setAddFieldAttributes] = useState<any[]>([]);
  const [listParams, setListParams] = useState<any[]>([]);
  const [listColumnBinding, setListColumnBinding] = useState<any[]>([]);
  const [detailLookup, setDetailLookup] = useState<any>("");
  const [lookupLabel, setLookupLabel] = useState<any>({
    key: "",
    type: "",
  });
  const [numberFormat, setNumberFormat] = useState<any>("");

  const [listBindingField, setListBindingField] = useState<any[]>([]);
  const [detailBindingField, setDetailBindingField] = useState<any>([]);

  //Cần đổi lại thành khách hàng
  const [customerAttributeFields, setCustomerAttributeFields] = useState<any>(null); //Khởi tạo null là quan trọng
  const [showFields, setShowFields] = useState<boolean>(false);
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [dependFormula, setDependFormula] = useState([]);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [checkFieldName, setCheckFieldName] = useState(false);

  const [startDateTimeRange, setStartDateTimeRange] = useState(null);
  const [endDateTimeRange, setEndDateTimeRange] = useState(null);

  const [listLookup, setListLookup] = useState<IOption[]>([
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

  useEffect(() => {
    if (data?.parentId) {
      setDetailParent({ value: data.parentId, label: data.parentName });
    }
    if ((data?.type == "select" || data?.type == "multiselect") && data?.options) {
      setAddFieldAttributes(data?.options);
    }
    if (data?.type == "lookup" || data?.type == "binding") {
      setDetailLookup(data?.lookup);
      setListParams(data?.paramLookup?.length ? data?.paramLookup : [{ value: "", key: "" }]);
      setLookupLabel({
        key: data?.fieldLabelLookup?.key || "",
        type: data?.fieldLabelLookup?.type || "",
      });
    }
    if (data?.type == "binding") {
      setDetailBindingField(
        data?.listBindingField?.length
          ? data?.listBindingField.map((item) => ({
              value: item.value.split("_")[0],
              label: item.label,
              readOnly: item.readOnly || false,
            }))
          : []
      );
      setListColumnBinding(
        data?.listBindingField
          ? data?.listBindingField.map((item) => ({
              value: item.value,
              label: item.label,
              readOnly: item.readOnly || false,
              type: item.type || "text",
            }))
          : [
              {
                value: "",
                label: "",
                readOnly: false,
                type: "text",
              },
            ]
      );
    }
    // if (data?.type == "number" && data?.options) {
    //   setNumberFormat(JSON.parse(data?.options).numberFormat || "");
    // }
    if (data?.type == "formula") {
      setSelectedFormula(JSON.parse(data?.formula)?.formula || "");
    }
    if (data?.type == "time_range") {
      setStartDateTimeRange(data?.timeRange ? JSON.parse(data?.timeRange)?.startDate : null);
      setEndDateTimeRange(data?.timeRange ? JSON.parse(data?.timeRange)?.endDate : null);
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

  //! đoạn này xử lý vấn đề lấy giá trị của các cột binding khi thêm nhiều
  const handleChangeListColumnBinding = (e, idx, type) => {
    const value = type === "readOnly" ? e.target.checked : type === "type" ? e.value : e.target.value;
    setListColumnBinding((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return {
            ...obj,
            ...(type === "value" ? { value: value } : {}),
            ...(type === "label" ? { label: value } : {}),
            ...(type === "readOnly" ? { readOnly: value } : {}),
            ...(type === "type" ? { type: value } : {}),
          };
        }
        return obj;
      })
    );
  };

  //! đoạn này xử lý vấn đề lấy giá trị của params khi thêm nhiều
  const handleChangeParams = (e, idx, type) => {
    const value = e.target.value;
    setListParams((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return {
            ...obj,
            ...(type === "value" ? { value: value } : {}),
            ...(type === "key" ? { key: value } : {}),
            // value: value
          };
        }
        return obj;
      })
    );
  };

  //! đoạn này xử lý vấn đề lấy giá trị tham chiếu của trường lookup
  const handleDetailLookup = (item) => {
    setDetailLookup(item?.value);
    if (BindingFieldMap[item?.value] && BindingFieldMap[item?.value].length > 0) {
      setListBindingField(
        BindingFieldMap[item?.value].map((item) => {
          return { ...item, readOnly: true };
        })
      );
    }
    setDetailBindingField([]);
  };
  //! đoạn này xử lý vấn đề lấy giá trị tham chiếu của trường lookup
  const handleChangeBindingField = (item) => {
    setDetailBindingField([...detailBindingField, item]);
    setListBindingField(listBindingField.filter((x) => x.value !== item.value));
  };

  //! xóa đi 1 item attribute
  const handleRemoveItemAttribute = (idx) => {
    const result = [...addFieldAttributes];
    result.splice(idx, 1);

    setAddFieldAttributes(result);
  };

  //! xóa đi 1 item params
  const handleRemoveItemParams = (idx) => {
    const result = [...listParams];
    result.splice(idx, 1);

    setListParams(result);
  };

  //! xóa đi 1 item params
  const handleRemoveItemListColumnsBinding = (idx) => {
    const result = [...listColumnBinding];
    result.splice(idx, 1);

    setListColumnBinding(result);
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
    setDependFormula([]);
  };

  useEffect(() => {
    if (onShow) {
      if (!isEdit) {
        setSelectedFormula("");
        setDetailBindingField([]);
      }
    }
  }, [onShow]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        key: data?.key || "",
        required: data?.required ? "1" : "",
        isSum: data?.isSum ? "1" : "",
        readOnly: data?.readOnly ? "1" : "",
        haveCheckbox: data?.haveCheckbox ? "1" : "",
        haveRadio: data?.haveRadio ? "1" : "",
        uniqued: data?.uniqued ? "1" : "",
        type: data?.type ?? "text",
        options: data?.options ?? null,
        position: data?.position ?? "0",
        parentId: data?.parentId ?? "0",
        regex: data?.regex ?? "",
        lookupUri: data?.lookupUri ?? "",
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

  const listFieldFirst = useMemo(
    () =>
      [
        {
          label: "Tên trường thông tin",
          name: "name",
          type: "text",
          fill: true,
          required: true,
          // disabled: isEdit,
          error: checkFieldName,
          message: "Tên trường thông tin này đã tồn tại",
        },
        {
          label: "Kiểu dữ liệu",
          name: "type",
          type: "select",
          fill: true,
          required: true,
          disabled: isEdit,
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
              // if (data && data.type === "radio" && data.options) {
              //   setAddFieldAttributes(JSON.parse(data?.options));
              // } else {
              //   setAddFieldAttributes([{ value: "", label: "" }]);
              // }
            } else if (e?.value === "lookup") {
              if (data && data.type === "lookup" && data.lookup) {
                setDetailLookup(data.lookup);
              } else {
                setDetailLookup("");
              }
              setListParams([
                {
                  value: "",
                  key: "",
                },
              ]);
            } else if (e?.value === "binding") {
              if (data && data.type === "lookup" && data.lookup) {
                setDetailLookup(data.lookup);
              } else {
                setDetailLookup("");
              }
              setListParams([
                {
                  value: "",
                  key: "",
                },
              ]);
              setListColumnBinding([
                {
                  value: "",
                  label: "",
                  readOnly: false,
                  type: "text",
                },
              ]);
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
            {
              value: "number",
              label: "Number",
            },
            {
              value: "select",
              label: "Dropdown",
            },
            {
              value: "checkbox",
              label: "Checkbox",
            },
            {
              value: "radio",
              label: "Radio",
            },
            {
              value: "date",
              label: "Date",
            },
            {
              value: "lookup",
              label: "Lookup",
            },
            {
              value: "binding",
              label: "Binding",
            },
            {
              value: "formula",
              label: "Formula",
            },
            {
              value: "time_range",
              label: "Time range",
            },
          ],
        },
      ] as IFieldCustomize[],
    [listCustomerAttribute, isLoadingCustomerAttribute, data, formData.values, onShow]
  );

  const listFieldSecond = useMemo(
    () =>
      [
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
              disabled={isEdit}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, values: { ...formData.values, key: value } });
              }}
              error={checkFieldName}
              message="Mã trường thông tin này đã tồn tại"
            />
          ),
        },
        {
          label: "Thứ tự hiển thị",
          name: "position",
          type: "number",
          fill: true,
          required: false,
        },
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
        {
          label: `Chỉ cho phép đọc?`,
          name: "readOnly",
          type: "checkbox",
          options: [
            {
              value: "1",
              label: "Chỉ cho phép đọc",
            },
          ],
          required: false,
        },
        {
          key: formData?.values?.haveCheckbox + "-" + formData?.values?.haveRadio,
          label: `Cho phép chọn nhiều (checkbox)?`,
          name: "haveCheckbox",
          type: "checkbox",
          options: [
            {
              value: "1",
              label: "Cho phép chọn",
            },
          ],
          required: false,
        },
        {
          key: formData?.values?.haveCheckbox + "-" + formData?.values?.haveRadio,
          label: `Cho phép chọn một (radio)?`,
          name: "haveRadio",
          type: "checkbox",
          options: [
            {
              value: "1",
              label: "Chọn phép chọn",
            },
          ],
          required: false,
        },
        ...(formData?.values["type"] == "number" || formData?.values["type"] == "formula"
          ? [
              // {
              //   label: `Tính tổng?`,
              //   name: "isSum",
              //   type: "checkbox",
              //   options: [
              //     {
              //       value: "1",
              //       label: "Có tính tổng",
              //     },
              //   ],
              //   required: false,
              // },
            ]
          : []),
      ] as IFieldCustomize[],
    [listCustomerAttribute, isLoadingCustomerAttribute, formData.values, checkFieldName, detailParent, data]
  );

  useEffect(() => {
    if (formData.values.haveCheckbox == "1") {
      setFormData({ ...formData, values: { ...formData.values, haveRadio: "" } });
    }
  }, [formData.values.haveCheckbox]);

  useEffect(() => {
    if (formData.values.haveRadio == "1") {
      setFormData({ ...formData, values: { ...formData.values, haveCheckbox: "" } });
    }
  }, [formData.values.haveRadio]);

  useEffect(() => {
    if (!isEdit) {
      let check_duplicated = false;
      listColumn.map((item) => {
        if (item.name == formData.values?.name) {
          check_duplicated = true;
        }
      });
      setCheckFieldName(check_duplicated);
    }
  }, [formData.values?.key, values.key, isEdit]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async () => {
    // e.preventDefault();
    if ((formData.values["type"] == "binding" || formData.values["type"] == "lookup") && !formData.values?.["lookupUri"]) {
      showToast("Đường dẫn API tham chiếu không được bỏ trống", "error");
      setIsSubmit(false);
      return;
    }

    const _detailBindingField = listColumnBinding.map((item) => {
      let key = convertToId(item.label) || "";
      key = key.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "") + "_" + formData.values["key"];
      return {
        value: item.value,
        label: item.label,
        key: key,
        readOnly: item.readOnly,
        haveCheckbox: item.haveCheckbox || 0,
        haveRadio: item.haveRadio || 0,
        type: item.type || "text",
      };
    });

    let list_column = [];

    if (!isEdit) {
      list_column = [
        ...listColumn,
        {
          ...{
            name: formData.values["name"],
            key: formData.values["key"],
            type: formData.values["type"],
            required: formData.values["required"] == "1" ? true : false,
            isSum: formData.values["isSum"] == "1" ? true : false,
            position: formData.values["position"],
            readOnly: formData.values["readOnly"] == "1" ? 1 : 0,
            haveCheckbox: formData.values["haveCheckbox"] == "1" ? 1 : 0,
            haveRadio: formData.values["haveRadio"] == "1" ? 1 : 0,
          },
          ...(formData.values["type"] == "text" || formData.values["type"] == "number" ? { regex: formData.values["regex"] } : {}),
          ...(formData.values["type"] == "lookup" || formData.values["type"] == "binding"
            ? {
                lookupUri: formData.values["lookupUri"],
                lookup: detailLookup,
                paramLookup: listParams.filter((item) => item.value && item.key) || [],
                fieldLabelLookup: lookupLabel,
              }
            : {}),
          ...(formData.values["type"] == "binding"
            ? {
                listBindingField: _detailBindingField.filter((item) => item.value && item.label) || [],
              }
            : {}),
          ...(formData.values["type"] == "select"
            ? {
                options: addFieldAttributes,
              }
            : {}),
          ...(formData.values["type"] == "formula"
            ? {
                formula: JSON.stringify({
                  formula: selectedFormula,
                }),
              }
            : {}),
          ...(formData.values["type"] == "time_range"
            ? {
                timeRange: JSON.stringify({
                  startDate: startDateTimeRange || "",
                  endDate: endDateTimeRange || "",
                }),
              }
            : {}),
        },
        ...(formData.values["type"] == "binding" && _detailBindingField?.length
          ? _detailBindingField.map((item, index) => {
              if (item?.value) {
                return {
                  name: item?.label,
                  key: item?.key,
                  type: item?.type || "text",
                  required: false,
                  isSum: true,
                  options: [],
                  readOnly: item.readOnly ? 1 : 0,
                  position: formData.values["position"],
                  regex: "",
                  isBinding: true,
                  bindingField: item?.value, //Binding trong binding
                };
              } else {
                return {};
              }
            })
          : []),
      ];
    } else {
      // Trường hợp chỉnh sửa cột
      list_column = listColumn.map((item) => {
        if (item.key === data?.key) {
          return {
            ...item,
            name: formData.values["name"],
            required: formData.values["required"] == "1" ? true : false,
            isSum: formData.values["isSum"] == "1" ? true : false,
            position: formData.values["position"],
            readOnly: formData.values["readOnly"] == "1" ? 1 : 0,
            haveCheckbox: formData.values["haveCheckbox"] == "1" ? 1 : 0,
            haveRadio: formData.values["haveRadio"] == "1" ? 1 : 0,
            options: addFieldAttributes || [],
            listBindingField: _detailBindingField || [],
            regex: formData.values["regex"],
            ...(item.type == "lookup" || item.type == "binding"
              ? {
                  lookupUri: formData.values["lookupUri"],
                  lookup: detailLookup,
                  paramLookup: listParams.filter((item) => item.value && item.key) || [],
                  fieldLabelLookup: lookupLabel,
                }
              : {}),
            // ...(item.type == "binding" ? { listBindingField: _detailBindingField.filter((item) => item.value && item.label) || [] } : {}),
          };
        }
        return item;
      });
    }

    let dataSubmit = {
      nodeId: params?.nodeId || "Activity_0n3i8dv",
      processId: params?.processId || 380,
      fieldName: params?.fieldName || "boq",
      header: JSON.stringify(list_column),
      typeNo: typeNo,
    };

    if (location != "iframe") {
      setColumnsConfig(list_column);
      handleClearForm(true);
      // setIsFetchData(true);
      // setIsLoading(true);
      setColCodeEdit(null);
      return;
    }

    // return;
    const responseHeader = await GirdService.update(dataSubmit);

    const sortedListColumn = list_column.slice().sort((a, b) => a.position - b.position);
    setIsChangeColumns(true);
    // setListColumn(sortedListColumn);
    handleClearForm(true);

    if (responseHeader.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} cột thành công`, "success");
      setColumnsConfig(list_column);
      handleClearForm(true);
      // setIsFetchData(true);
      // setIsLoading(true);
      setColCodeEdit(null);
    } else {
      showToast(responseHeader.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
              !isDifferenceObj(formData.values, values) ? handleClearForm(true) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            color: "primary",
            disabled: isSubmit || checkFieldName,
            is_loading: isSubmit,
            callback: () => {
              setIsSubmit(true);
              onSubmit();
            },
          },
        ],
      },
    }),
    [
      formData,
      values,
      isSubmit,
      checkFieldName,
      detailLookup,
      detailBindingField,
      selectedFormula,
      startDateTimeRange,
      endDateTimeRange,
      addFieldAttributes,
      data,
      listParams,
      lookupLabel,
      listColumnBinding,
    ]
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
    setListParams([{ value: "", key: "" }]);
    setLookupLabel({ key: "", type: "" });
    setListColumnBinding([{ value: "", label: "", readOnly: false, type: "text" }]);
    setDetailLookup("");
    setNumberFormat("");
    setShowFields(false);
    setCheckFieldName(false);
    setCustomerAttributeFields(null);
    setDetailParent(null);
    setFormData({
      ...formData,
      values: {
        name: "",
        key: "",
        type: "text",
        options: null,
        position: "0",
        parentId: "0",
        required: "0",
        isSum: false,
        readOnly: "0",
        haveCheckbox: "",
        haveRadio: "",
        uniqued: "0",
        regex: "",
      },
    });
    setColCodeEdit(null);
  };

  const [listOptionDate, setlistOptionDate] = useState<IOption[]>([]);

  useEffect(() => {
    let _listOptionDate = [];
    listColumn.map((item) => {
      if (item.type == "date") {
        _listOptionDate.push({
          value: item.key,
          label: item.name,
        });
      }
    });
    setlistOptionDate(_listOptionDate);

    const maxPosition = listColumn.reduce((max, item) => {
      return item.position > max ? item.position : max;
    }, 0);

    if (maxPosition && !isEdit) {
      setFormData({ ...formData, values: { ...formData.values, position: maxPosition + 1 } });
    }
  }, [listColumn, onShow]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-column-new"
        size="xl"
      >
        <form className="form-customer-attribute-source">
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} cột`} toggle={() => !isSubmit && handleClearForm(true)} />
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

              {/* Trường hợp là dropdown hoặc radio hoặc multiselect */}
              {formData?.values["type"] == "select" || formData?.values["type"] == "multiselect" ? (
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

              {/* Trường hợp là lookup */}
              {formData?.values["type"] == "lookup" || formData?.values["type"] == "binding" ? (
                //   <div className="form-group">
                //     <SelectCustom
                //       id="options"
                //       name="options"
                //       label="Thông tin tham chiếu"
                //       fill={true}
                //       required={true}
                //       options={listLookup}
                //       disabled={isEdit}
                //       value={detailLookup}
                //       onChange={(e) => handleDetailLookup(e)}
                //       isFormatOptionLabel={true}
                //       placeholder="Chọn tham chiếu"
                //     />
                //   </div>
                // ) :
                <div className="form-group-uri">
                  <Input
                    label="Đường dẫn API tham chiếu"
                    fill={true}
                    required={true}
                    value={formData?.values["lookupUri"] || ""}
                    placeholder="Nhập đường dẫn API tham chiếu"
                    onChange={(e) => {
                      setFormData({ ...formData, values: { ...formData.values, lookupUri: e.target.value } });
                    }}
                  />
                  <div className="list__params">
                    <div>
                      <span style={{ fontSize: 14, fontWeight: "700" }}>Tham số API</span>
                    </div>
                    {listParams.map((item, idx) => {
                      return (
                        <div key={idx} className="attribute__item">
                          <div className="list-field-attribute">
                            <div className="form-group">
                              <Input
                                // label={idx == 0 ? 'Lựa chọn' : ''}
                                fill={true}
                                required={true}
                                value={item.key}
                                placeholder="Nhập key"
                                onChange={(e) => handleChangeParams(e, idx, "key")}
                              />
                            </div>
                            <div className="form-group">
                              <Input
                                // label={idx == 0 ? 'Lựa chọn' : ''}
                                fill={true}
                                required={true}
                                value={item.value}
                                placeholder="Nhập giá trị"
                                onChange={(e) => handleChangeParams(e, idx, "value")}
                              />
                            </div>
                          </div>
                          {idx == 0 ? (
                            <span className="add-attribute">
                              <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                <span
                                  className="icon-add"
                                  onClick={() => {
                                    setListParams([...listParams, { value: "", key: "" }]);
                                  }}
                                >
                                  <Icon name="PlusCircleFill" />
                                </span>
                              </Tippy>
                            </span>
                          ) : (
                            <span className="remove-attribute">
                              <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                <span className="icon-remove" onClick={() => handleRemoveItemParams(idx)}>
                                  <Icon name="Trash" />
                                </span>
                              </Tippy>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="list__binding">
                    <div>
                      <span style={{ fontSize: 14, fontWeight: "700" }}>Trường dữ liệu hiển thị</span>
                    </div>
                    <div className="attribute__item">
                      <div className="list-field-attribute">
                        <div className="form-group" style={{ width: "calc(50% - 1.6rem)" }}>
                          <Input
                            // label={idx == 0 ? 'Lựa chọn' : ''}
                            fill={true}
                            required={true}
                            value={lookupLabel.key}
                            placeholder="Nhập trường dữ liệu hiển thị"
                            onChange={(e) => {
                              setLookupLabel({
                                ...lookupLabel,
                                key: e.target.value,
                              });
                            }}
                          />
                        </div>
                        <div className="form-group" style={{ width: "calc(50% - 1.6rem)" }}>
                          <SelectCustom
                            id={`type-binding`}
                            name={`type-binding`}
                            fill={true}
                            required={true}
                            options={[
                              { value: "text", label: "Text" },
                              { value: "number", label: "Number" },
                              { value: "date", label: "Date" },
                              { value: "checkbox", label: "Checkbox" },
                            ]}
                            value={lookupLabel.type}
                            onChange={(e) => {
                              setLookupLabel({
                                ...lookupLabel,
                                type: e.value,
                              });
                            }}
                            isFormatOptionLabel={true}
                            placeholder="Chọn kiểu dữ liệu"
                          />
                        </div>
                        <span className="remove-attribute"></span>
                      </div>
                    </div>
                  </div>
                  {formData?.values["type"] == "binding" ? (
                    <div className="list__binding">
                      <div>
                        <span style={{ fontSize: 14, fontWeight: "700" }}>Các cột tham chiếu</span>
                      </div>
                      <div className="attribute__item_header">
                        <div className="list-field-attribute">
                          <div className="form-group">Tên cột</div>
                          <div className="form-group">Trường dữ liệu</div>
                          <div className="form-group">Kiểu dữ liệu</div>
                          <div className="form-group">Chỉ xem</div>
                        </div>
                      </div>
                      {listColumnBinding.map((item, idx) => {
                        return (
                          <div key={idx} className="attribute__item">
                            <div className="list-field-attribute">
                              <div className="form-group">
                                <Input
                                  // label={idx == 0 ? 'Lựa chọn' : ''}
                                  fill={true}
                                  required={true}
                                  value={item.label}
                                  placeholder="Nhập tên cột"
                                  onChange={(e) => handleChangeListColumnBinding(e, idx, "label")}
                                  readOnly={isEdit}
                                  onBlur={(e) => {
                                    // Kiểm tra trùng tên cột binding
                                    const isDuplicate = listColumnBinding.some(
                                      (item, index) =>
                                        convertToId(item.label).replace(new RegExp(`[^A-Za-z0-9]`, "g"), "") ===
                                          convertToId(e.target.value).replace(new RegExp(`[^A-Za-z0-9]`, "g"), "") && index !== idx
                                    );
                                    if (isDuplicate) {
                                      showToast("Tên cột binding không được trùng nhau", "error");
                                      handleChangeListColumnBinding(
                                        {
                                          target: { value: "" },
                                        },
                                        idx,
                                        "label"
                                      );
                                      return;
                                    }
                                  }}
                                />
                              </div>
                              <div className="form-group">
                                <Input
                                  // label={idx == 0 ? 'Lựa chọn' : ''}
                                  fill={true}
                                  required={true}
                                  value={item.value}
                                  readOnly={isEdit}
                                  placeholder="Nhập trường dữ liệu"
                                  onChange={(e) => handleChangeListColumnBinding(e, idx, "value")}
                                />
                              </div>
                              <div className="form-group">
                                <SelectCustom
                                  id={`type-binding-${idx}`}
                                  name={`type-binding-${idx}`}
                                  fill={true}
                                  required={true}
                                  disabled={isEdit}
                                  options={[
                                    { value: "text", label: "Text" },
                                    { value: "number", label: "Number" },
                                    { value: "date", label: "Date" },
                                    { value: "checkbox", label: "Checkbox" },
                                  ]}
                                  value={item.type || "text"}
                                  onChange={(e) => handleChangeListColumnBinding(e, idx, "type")}
                                  isFormatOptionLabel={true}
                                  placeholder="Chọn kiểu dữ liệu"
                                />
                              </div>
                              <div className="form-group">
                                <div className="readonly">
                                  <Checkbox
                                    checked={item.readOnly}
                                    onChange={(e) => {
                                      if (!isEdit) {
                                        handleChangeListColumnBinding(e, idx, "readOnly");
                                      }
                                    }}
                                  />
                                  {/* <span>Chỉ xem</span> */}
                                </div>
                              </div>
                            </div>
                            {isEdit ? (
                              <span></span>
                            ) : (
                              <>
                                {idx == 0 ? (
                                  <span className="add-attribute">
                                    <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                      <span
                                        className="icon-add"
                                        onClick={() => {
                                          setListColumnBinding([...listColumnBinding, { value: "", label: "", readOnly: false, type: "text" }]);
                                        }}
                                      >
                                        <Icon name="PlusCircleFill" />
                                      </span>
                                    </Tippy>
                                  </span>
                                ) : (
                                  <span className="remove-attribute">
                                    <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                      <span className="icon-remove" onClick={() => handleRemoveItemListColumnsBinding(idx)}>
                                        <Icon name="Trash" />
                                      </span>
                                    </Tippy>
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
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
                      disabled={isEdit}
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
                      {listColumn &&
                        (listColumn || []).map((item) => {
                          if (item.type == "number") {
                            return (
                              <label
                                key={item.key}
                                onClick={() => {
                                  handlePointerContent(item.key);
                                  setShowFields(false);
                                }}
                              >
                                {item.key}
                              </label>
                            );
                          } else {
                            return null;
                          }
                        })}
                    </div>
                  )}
                </div>
              ) : null}
              {/* Trường hợp là time_range */}
              {formData?.values["type"] == "time_range" ? (
                <div className="form-group-time_range">
                  <div className="time_range-input">
                    <SelectCustom
                      id="start_time"
                      name="start_time"
                      label="Từ ngày"
                      fill={true}
                      required={true}
                      disabled={isEdit}
                      options={listOptionDate}
                      value={startDateTimeRange}
                      onChange={(e) => setStartDateTimeRange(e.value)}
                      isFormatOptionLabel={true}
                      placeholder="Chọn ngày bắt đầu"
                    />
                    <SelectCustom
                      id="end_time"
                      name="end_time"
                      label="Đến ngày"
                      disabled={isEdit}
                      fill={true}
                      required={true}
                      options={listOptionDate}
                      value={endDateTimeRange}
                      onChange={(e) => setEndDateTimeRange(e.value)}
                      isFormatOptionLabel={true}
                      placeholder="Chọn ngày kết thúc"
                    />
                  </div>
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
