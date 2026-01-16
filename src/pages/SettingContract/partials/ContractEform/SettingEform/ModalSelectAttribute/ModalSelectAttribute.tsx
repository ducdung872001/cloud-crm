import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Tippy from "@tippyjs/react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import SurveyFormService from "services/SurveyFormService";
import { getPermissions, showToast } from "utils/common";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import "./ModalSelectAttribute.scss";
import ContractEformService from "services/ContractEformService";
import Button from "components/button/button";
import AddEformAttributeModal from "./partails/AddEformAttributeModal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IContractAttributeResponse } from "model/contractAttribute/ContractAttributeResponse";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Checkbox from "components/checkbox/checkbox";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { Parser } from "formula-functionizer";
import { IContractAttributeFilterRequest, IContractAttributeRequest } from "model/contractAttribute/ContractAttributeRequest";
import { convertToId, getPageOffset, isDifferenceObj } from "reborn-util";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import RadioList from "components/radio/radioList";

export default function ModalSelectAttribute(props: any) {
  const { onShow, onHide, dataContractEform } = props;

  const isMounted = useRef(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lstAttribute, setLstAttribute] = useState([]);
  console.log("lstAttribute", lstAttribute);
  const [lstAttributeSelected, setLstAttributeSelected] = useState([]);
  console.log("lstAttributeSelected", lstAttributeSelected);

  useEffect(() => {
    if (lstAttribute && lstAttribute.length > 0) {
      const listSelected = lstAttribute.filter((el) => el.selected === true);
      setLstAttributeSelected(listSelected);
    } else {
      setLstAttributeSelected([]);
    }
  }, [lstAttribute]);

  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [dataContractAttribute, setDataContractAttribute] = useState<IContractAttributeResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isAddAttribute, setIsAddAttribute] = useState(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "trường thông tin",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  // const handleGetAttribute = async (params) => {
  //   setIsLoading(true);

  //   const response = await ContractEformService.listEformAttribute(params);

  //   if (response.code === 0) {
  //     const result = response.result.items;

  //     result.length === 0 ? setIsNoItem(true) : setLstAttribute(result);
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }

  //   setIsLoading(false);
  // };

  const abortController = new AbortController();

  const handleGetAttribute = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ContractEformService.listEformAttribute(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      let newList = [];
      if (result?.items) {
        result?.items.map((el) => {
          newList.push({
            ...el,
            selected: false,
          });
        });
      }

      // setLstAttribute(result.items);
      setLstAttribute(newList);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && params) {
      handleGetAttribute(params);
    }
  }, [onShow, params]);

  const titles = ["", "STT", "Tên trường", "Kiểu dữ liệu", "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "text-center", "", "", "text-center"];

  const handChangeLink = (link, id) => {
    const regex = new RegExp("undefined", "g");
    const result = link.replace(regex, id);

    navigator.clipboard
      .writeText(link)
      .then(() => {
        showToast("Copy link thành công", "success");
        onHide();
      })
      .catch(() => {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      });
  };

  const handleSelectAttribute = async (item) => {
    const body = {
      attributeId: item.id,
      eformId: dataContractEform?.id,
    };

    console.log("body", body);

    const response = await ContractEformService.updateEformExtraInfo(body);

    if (response.code === 0) {
      onHide(true);
      showToast(`Thêm trường thông tin biểu mẫu thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const dataMappingArray = (item, index: number) => [
    <div style={{ justifyContent: "flex-end", display: "flex" }}>
      <Checkbox
        checked={item.selected}
        onChange={(e) => {
          setLstAttribute((current) =>
            current.map((obj, idx) => {
              if (index === idx) {
                return { ...obj, selected: !item.selected };
              }
              return obj;
            })
          );
        }}
      />
    </div>,
    getPageOffset(params) + index + 1,
    <span
      key={item.id}
      // className='style-name'
      onClick={() => {
        // handleSelectAttribute(item)
      }}
    >
      {item.name}
    </span>,
    item.datatype || "text",
    item.position,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataContractAttribute(item);
          setIsAddAttribute(true);
          // setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ].filter((action) => action);
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "trường" : `${listIdChecked.length} trường đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const onDelete = async (id: number) => {
    const response = await ContractEformService.deleteEformAttribute(id);

    if (response.code === 0) {
      showToast("Xóa trường thông tin thành công", "success");
      handleGetAttribute(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
          {
            title: "Xác nhận",
            // type: "submit",
            color: "primary",
            disabled: lstAttributeSelected?.length > 0 ? false : true,
            // is_loading: isSubmit,
            callback: () => {
              handleSubmit(lstAttributeSelected);
            },
          },
        ],
      },
    }),
    [lstAttributeSelected]
  );

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa trường",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const handleSubmit = (lstAttributeSelected) => {
    const arrPromise = [];

    lstAttributeSelected.map((item) => {
      const promise = new Promise((resolve, reject) => {
        ContractEformService.updateEformExtraInfo({ attributeId: item.id, eformId: dataContractEform?.id }).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    console.log("arrPromise", arrPromise);

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast(`Thêm trường thông tin biểu mẫu thành công`, "success");
        onHide(true);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    });
  };

  ////Thêm trường thông tin

  const refShowField = useRef();
  useOnClickOutside(refShowField, () => setShowFields(false), ["formula"]);

  const dataCheck = dataContractAttribute?.attributes && JSON.parse(dataContractAttribute?.attributes);

  const parser = new Parser();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);

  const [data, setData] = useState<any>(null);

  const [listContractAttribute, setListContractAttribute] = useState<IOption[]>(null);
  const [isLoadingContractAttribute, setIsLoadingContractAttribute] = useState<boolean>(false);
  const [addFieldAttributes, setAddFieldAttributes] = useState<any[]>([{ value: "", label: "" }]);
  const [detailLookup, setDetailLookup] = useState<any>("contract");
  const [numberFormat, setNumberFormat] = useState<any>("");
  const [contractAttributeFields, setContractAttributeFields] = useState<any>(null); //Khởi tạo null là quan trọng

  const [showFields, setShowFields] = useState<boolean>(false);
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [checkFieldName, setCheckFieldName] = useState(false);

  useEffect(() => {
    setData(dataContractAttribute);
  }, [dataContractAttribute]);

  const [listLookup, setListLookup] = useState<IOption[]>([
    {
      value: "customer",
      label: "Khách hàng",
    },
    {
      value: "employee",
      label: "Nhân viên",
    },
    {
      value: "contact",
      label: "Liên hệ",
    },
    {
      value: "contract",
      label: "Hợp đồng",
    },
  ]);

  /**
   * Lấy ra nhóm trường thông tin cha
   */
  const onSelectOpenContractAttribute = async () => {
    setIsLoadingContractAttribute(true);

    const params: IContractAttributeFilterRequest = {
      isParent: 1,
    };
    const response = await ContractEformService.listEformAttribute(params);

    if (response.code === 0) {
      const dataOption = response.result?.items;
      setListContractAttribute([
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
    setIsLoadingContractAttribute(false);
  };

  useEffect(() => {
    if (data?.parentId) {
      onSelectOpenContractAttribute();
    }

    if (data?.parentId === null) {
      setListContractAttribute([]);
    }

    if ((data?.datatype == "dropdown" || data?.datatype == "radio" || data?.datatype == "multiselect") && data?.attributes) {
      setAddFieldAttributes(JSON.parse(data?.attributes));
    }

    if (data?.datatype == "lookup" && data?.attributes) {
      setDetailLookup(JSON.parse(data?.attributes).refType || "contract");
    }

    if (data?.datatype == "number" && data?.attributes) {
      setNumberFormat(JSON.parse(data?.attributes).numberFormat || "");
    }

    if (data?.datatype == "formula" && data?.attributes) {
      setSelectedFormula(JSON.parse(data?.attributes).formula || "");
    }
  }, [data]);

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

  /**
   * Lấy danh sách trường thông tin để phục vụ cho tính toán trường động
   */
  const getContractAttributes = async () => {
    const response = await ContractEformService.listEformAttributeAll();

    let arrField = [];

    if (response.code === 0) {
      const dataOption = response.result;

      console.log("dataOption =>", dataOption);

      Object.keys(dataOption).forEach((key) => {
        (dataOption[key] || []).map((item) => {
          if (item.datatype == "number" && item.fieldName) {
            arrField.push("contractAttribute_" + item.fieldName);
          }
        });
      });

      console.log("Fields =>", arrField);

      //Lưu lại
      setContractAttributeFields(arrField);
    }
  };

  //! đoạn này xử lý vấn đề lấy giá trị tham chiếu của trường lookup
  const handleDetailLookup = (item) => {
    setDetailLookup(item?.value);
  };

  //! xóa đi 1 item attribute
  const handleRemoveItemAttribute = (idx) => {
    const result = [...addFieldAttributes];
    result.splice(idx, 1);

    setAddFieldAttributes(result);
  };

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        fieldName: data?.fieldName || "",
        required: data?.required ? "1" : "",
        readonly: data?.readonly ? "1" : "",
        uniqued: data?.uniqued ? "1" : "",
        datatype: data?.datatype ?? "text",
        attributes: data?.attributes ?? null,
        position: data?.position ?? "0",
        parentId: data?.parentId ?? "0",
      } as IContractAttributeRequest),
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

  const listFieldFirst: IFieldCustomize[] = useMemo(
    () => {
      return [
        {
          label: "Tên trường",
          name: "name",
          type: "text",
          fill: true,
          required: true,
          placeholder: "Nhập tên trường",
          icon: <Icon name="Edit" />,
          iconPosition: "left",
          maxLength: 100
        },
        {
          label: "Kiểu dữ liệu",
          name: "datatype",
          type: "select",
          fill: true,
          required: true,
          onChange: (e) => {
            if (e?.value == "dropdown") {
              if (data && data.datatype === "dropdown" && data.attributes) {
                setAddFieldAttributes(JSON.parse(data?.attributes));
              } else {
                setAddFieldAttributes([{ value: "", label: "" }]);
              }
            } else if (e?.value == "multiselect") {
              if (data && data.datatype === "multiselect" && data.attributes) {
                setAddFieldAttributes(JSON.parse(data?.attributes));
              } else {
                setAddFieldAttributes([{ value: "", label: "" }]);
              }
            } else if (e?.value == "radio") {
              if (data && data.datatype === "radio" && data.attributes) {
                setAddFieldAttributes(JSON.parse(data?.attributes));
              } else {
                setAddFieldAttributes([{ value: "", label: "" }]);
              }
            } else if (e?.value === "lookup") {
              if (data && data.datatype === "lookup" && data.attributes && JSON.parse(data?.attributes).refType) {
                setDetailLookup(JSON.parse(data?.attributes).refType);
              } else {
                setDetailLookup("contract");
              }
            } else if (e?.value === "number") {
              if (data && data.datatype === "number" && data.attributes && JSON.parse(data?.attributes).numberFormat) {
                setNumberFormat(JSON.parse(data?.attributes).numberFormat);
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
              value: "textarea",
              label: "Textarea",
            },
            {
              value: "number",
              label: "Number",
            },
            {
              value: "dropdown",
              label: "Dropdown",
            },
            {
              value: "multiselect",
              label: "MultiSelect",
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
              value: "formula",
              label: "Formula",
            },
          ],
        },
      ]  
},  [listContractAttribute, isLoadingContractAttribute, formData]);



  const listFieldSecond = useMemo(
    () =>
      [
        // {
        //   label: "Mã trường",
        //   name: "fieldName",
        //   type: "text",
        //   fill: true,
        //   required: false,
        //   readOnly: false
        // },
        {
          name: "fieldName",
          type: "custom",
          snippet: (
            <Input
              fill={true}
              label="Mã trường thông tin"
              required={false}
              value={formData.values?.fieldName}
              placeholder="Mã trường thông tin"
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, values: { ...formData.values, fieldName: value } });
              }}
              error={checkFieldName}
              message="Mã trường thông tin này đã tồn tại"
            />
          ),
        },
        {
          label: "Thuộc nhóm",
          name: "parentId",
          type: "select",
          fill: true,
          required: false,
          options: listContractAttribute,
          onMenuOpen: onSelectOpenContractAttribute,
          isLoading: isLoadingContractAttribute,
        },
        {
          label: "Thứ tự hiển thị",
          name: "position",
          type: "number",
          fill: true,
          required: false,
        },
        ...(formData?.values["datatype"] == "formula"
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
        {
          label: `Kiểm trùng giá trị?`,
          name: "uniqued",
          type: "checkbox",
          options: [
            {
              value: "1",
              label: "Kiểm trùng dữ liệu",
            },
          ],
          required: false,
        },
      ] as IFieldCustomize[],
    [
      listContractAttribute,
      isLoadingContractAttribute,
      formData?.values["name"],
      formData?.values["fieldName"],
      formData?.values["datatype"],
      checkFieldName,
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

  const checkDuplicated = async (fieldName, valueFieldName) => {
    const param = {
      id: 0,
      fieldName: fieldName,
    };
    const response = await ContractEformService.checkDuplicated(param);
    if (response.code === 0) {
      const result = response.result;
      if (fieldName === result.fieldName) {
        if (!isDifferenceObj(fieldName, valueFieldName)) {
          setCheckFieldName(false);
        } else {
          setCheckFieldName(true);
        }
      } else {
        setCheckFieldName(false);
      }
    }
  };

  useEffect(() => {
    // if(formData.values?.fieldName){
    checkDuplicated(formData.values?.fieldName, values.fieldName);
    // }
  }, [formData.values?.fieldName, values.fieldName]);

  useEffect(() => {
    if (formData?.values["datatype"] == "formula") {
      if (contractAttributeFields == null) {
        getContractAttributes();
      }
    }
  }, [formData]);

  useEffect(() => {
    //Nếu rỗng thì thay đổi
    let fieldName = convertToId(formData.values["name"]) || "";
    fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

    //Chỉ set lại nếu là trường hợp thêm mới
    if (!data?.id) {
      setFormData({ ...formData, values: { ...formData.values, fieldName: fieldName } });
    }
  }, [formData?.values["name"]]);

  useEffect(() => {
    //Nếu rỗng thì thay đổi
    let fieldName = formData.values["fieldName"] || "";
    fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

    setFormData({ ...formData, values: { ...formData.values, fieldName: fieldName } });
  }, [formData?.values["fieldName"]]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async () => {
    // e.preventDefault();

    if (!data?.addFieldAttributes && (formData.values['datatype'] == 'dropdown' || formData.values['datatype'] == 'radio' || formData.values['datatype'] == 'multiselect')) {
      showToast("Vui lòng thêm lựa chọn cho trường thông tin", "error");
      return;
    }

    if (!data?.selectedFormula && (formData.values['datatype'] == 'formula')) {
      showToast("Vui lòng nhập công thức cho trường thông tin", "error");
      return;
    }

    const errors = Validate(validations, formData, [...listFieldFirst, ...listFieldSecond]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
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

    const response = await ContractEformService.updateEformAttribute(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} trường thông tin biểu mẫu thành công`, "success");
      setIsAddAttribute(false);
      setAddFieldAttributes([{ value: "", label: "" }]);
      setDetailLookup("contract");
      setNumberFormat("");
      setShowFields(false);
      setData(null);
      setFormData({ ...formData, values: values, errors: {} });
      setContractAttributeFields(null);
      handleGetAttribute(params);
      setIsSubmit(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const checkFieldAttributes = (dataAttribute: any, dataCheckField: any) => {
    const fieldAttributes = [...dataAttribute];
    let result = true;
    if (fieldAttributes && fieldAttributes.length > 0 && dataCheckField && dataCheckField.length > 0) {
      if (fieldAttributes.length !== dataCheckField.length) {
        result = false;
      } else {
        fieldAttributes.map((item, index) => {
          // dataCheckField.map(el => {
          if (fieldAttributes[index].value !== dataCheckField[index].value) {
            result = false;
          }
          // })
        });
      }
    }
    return result;
  };

  const actionsAdd = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Quay lại",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? cancelAdd() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              (!isDifferenceObj(formData.values, values) &&
                (formData.values["datatype"] == "dropdown" || formData.values["datatype"] == "radio" || formData.values["datatype"] == "multiselect"
                  ? checkFieldAttributes(addFieldAttributes, dataCheck)
                  : true) &&
                (formData.values["datatype"] == "lookup" ? detailLookup === (dataCheck ? dataCheck?.refType : "contract") : true) &&
                (formData.values["datatype"] == "number" ? numberFormat === (dataCheck ? dataCheck?.numberFormat : "") : true)) ||
              (formData.values["datatype"] == "number" && !numberFormat) ||
              (formData.errors && Object.keys(formData.errors).length > 0) ||
              checkFieldName,
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, addFieldAttributes, detailLookup, numberFormat, checkFieldName]
  );

  const cancelAdd = () => {
    setIsAddAttribute(false);
    setAddFieldAttributes([{ value: "", label: "" }]);
    setDetailLookup("contract");
    setNumberFormat("");
    setShowFields(false);
    setData(null);
    setIsSubmit(false);
    setDataContractAttribute(null);
    setFormData({ ...formData, values: values, errors: {} });
    setCheckFieldName(false);
    setContractAttributeFields(null);
  };

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
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        cancelAdd();
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
    };
    setContentDialogAdd(contentDialog);
    setShowDialogAdd(true);
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          onHide();
          cancelAdd();
        }}
        className="modal-select-attribute"
        size="xl"
      >
        <div className="box__select--attribute">
          <ModalHeader
            title={isAddAttribute ? `${data ? "Chỉnh sửa trường thông tin" : "Thêm mới trường thông tin"}` : `Chọn trường thông tin biểu mẫu`}
            toggle={() => {
              onHide();
              cancelAdd();
            }}
          />
          <ModalBody>
            <div className="view__option">
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, marginRight: 10 }}>
                {isAddAttribute ? //   // type="submit" // <Button
                //   color="primary"
                //   // disabled={}
                //   onClick = {() => {
                //     cancelAdd()
                //   }}
                // >
                //   Quay lại
                // </Button>
                null : (
                  <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick={() => {
                      // setDataEformAttribute(null);
                      // setShowModalAdd(true);
                      setIsAddAttribute(true);
                    }}
                  >
                    Thêm mới
                  </Button>
                )}
              </div>
              {!isAddAttribute ? (
                <div>
                  {!isLoading && lstAttribute && lstAttribute.length > 0 ? (
                    <BoxTable
                      name="Trường thông tin"
                      titles={titles}
                      items={lstAttribute}
                      isPagination={true}
                      dataPagination={pagination}
                      dataMappingArray={(item, index) => dataMappingArray(item, index)}
                      dataFormat={dataFormat}
                      listIdChecked={listIdChecked}
                      isBulkAction={true}
                      // bulkActionItems={bulkActionList}
                      striped={true}
                      setListIdChecked={(listId) => setListIdChecked(listId)}
                      actions={actionsTable}
                      actionType="inline"
                    />
                  ) : isLoading ? (
                    <Loading />
                  ) : (
                    <SystemNotification description={<span>Hiện tại chưa có trường thông tin nào.</span>} type="no-item" />
                  )}
                </div>
              ) : (
                <div className="list-form-group">
                  {listFieldFirst.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldFirst, setFormData)}
                      formData={formData}
                    />
                  ))}

                  {/* Trường hợp là dropdown hoặc radio */}
                  {formData?.values["datatype"] == "dropdown" ||
                  formData?.values["datatype"] == "radio" ||
                  formData?.values["datatype"] == "multiselect" ? (
                    <div className="list__attribute">
                      {addFieldAttributes.map((item, idx) => {
                        return (
                          <div key={idx} className="attribute__item">
                            <div className="list-field-attribute">
                              <div className="form-group">
                                <Input
                                  label="Lựa chọn"
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

                  {formData?.values["datatype"] == "number" ? (
                    <div className="form-group-number">
                      <RadioList
                        options={listFieldNumberFormat}
                        className="form-group-number"
                        title="Định dạng số"
                        name="numberFormat"
                        value={numberFormat}
                        required={true}
                        onChange={(e) => setNumberFormat(e?.target.value)}
                      />
                    </div>
                  ) : null}

                  {/* Trường hợp là lookup */}
                  {formData?.values["datatype"] == "lookup" ? (
                    <div className="form-group">
                      <SelectCustom
                        id="attributes"
                        name="attributes"
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

                  {/* Trường hợp là formula */}
                  {formData?.values["datatype"] == "formula" ? (
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
                          {contractAttributeFields.length > 0 ? (
                            contractAttributeFields &&
                            (contractAttributeFields || []).map((item) => {
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
                            })
                          ) : (
                            <div style={{ justifyContent: "center", display: "flex", width: "100%" }}>
                              <span style={{ fontSize: 14, color: "#757575" }}>Chưa có dữ liệu</span>
                            </div>
                          )}
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
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={isAddAttribute ? actionsAdd : actions} />
        </div>

        <AddEformAttributeModal
          onShow={showModalAdd}
          dataContractAttribute={dataContractAttribute}
          onHide={(reload) => {
            if (reload) {
              handleGetAttribute(params);
            }
            setShowModalAdd(false);
          }}
        />
        <Dialog content={isAddAttribute ? contentDialogAdd : contentDialog} isOpen={isAddAttribute ? showDialogAdd : showDialog} />
      </Modal>
    </Fragment>
  );
}
