import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { convertToId, isDifferenceObj } from "reborn-util";
import "./ModalAddBusinessProcess.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";
import BusinessProcessService from "services/BusinessProcessService";
import Input from "components/input/input";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
import ObjectAttributeService from "services/ObjectAttributeService";
import ObjectGroupService from "services/ObjectGroupService";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import RadioList from "components/radio/radioList";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import { SelectOptionData } from "utils/selectCommon";
import { Parser } from "formula-functionizer";
import SettingSLA from "./SettingSLA/SettingSLA";

export default function ModalAddBusinessProcess(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const { dataBranch } = useContext(UserContext) as ContextType;
  const parser = new Parser();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [tabStep, setTabStep] = useState(1);
  const [processId, setProcessId] = useState(null);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const [dataEmployee, setDataEmployee] = useState(null);
  const [listStepProcess, setListStepProcess] = useState([]);

  //Loại đối tượng trong tab 4
  const [detailObjectType, setDetailObjectType] = useState(null);
  const [mapObjectAttribute, setMapObjectAttribute] = useState<any>(null);
  const [objectExtraInfos, setObjectExtraInfos] = useState<any>([]);

  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);

  //Lấy danh sách các bước của quy trình
  const getListStepProcess = async (processId: number) => {
    const params: any = {
      limit: 100,
      processId: processId,
    };

    const response = await BusinessProcessService.listStep(params);
    if (response.code == 0) {
      const result = response.result;
      setListStepProcess(result.items);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow && data) {
      setDataEmployee(data.employeeId ? { value: data.employeeId, label: data.employeeName } : null);
      setProcessId(data.id);
      getListStepProcess(data.id);
      getDetailBpmObject(data.id);
    }
  }, [onShow, data]);

  const values = useMemo(
    () =>
      ({
        id: data?.id ?? 0,
        name: data?.name ?? "",
        code: data?.code ?? "",
        description: data?.description ?? "",
        employeeId: data?.employeeId ?? 0,
      } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const valuesSLA = useMemo(
    () =>
      ({
        planResponseDay: data?.planResponseDay || "",
        planResponseHour: data?.planResponseHour || "",
        planResponseMinute: data?.planResponseMinute || "",
        planExecutionDay: data?.planExecutionDay || "",
        planExecutionHour: data?.planExecutionHour || "",
        planExecutionMinute: data?.planExecutionMinute || "",
      } as any),
    [data, onShow]
  );

  const [valueSLA, setValueSLA] = useState(valuesSLA);

  useEffect(() => {
    setValueSLA(valuesSLA);
  }, [valuesSLA]);

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
  ];

  const dataStep = [
    {
      value: 1,
      label: "Thông tin quy trình",
    },
    {
      value: 2,
      label: "Cài đặt luồng công việc",
    },
    {
      value: 3,
      label: "Cài đặt SLA",
    },
    {
      value: 4,
      label: "Cấu trúc hồ sơ",
    },
  ];

  // lấy người phụ trách
  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    console.log("param", param);
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

  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    setCheckFieldEmployee(false);
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Tên quy trình",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mã quy trình",
          name: "code",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mô tả quy trình",
          name: "description",
          type: "textarea",
          fill: true,
          required: false,
        },
        {
          name: "employeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="employeeId"
              name="employeeId"
              label="Người phụ trách"
              options={[]}
              fill={true}
              value={dataEmployee}
              required={true}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn người phụ trách"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              error={checkFieldEmployee}
              message="Người phụ trách không được bỏ trống"
            />
          ),
        },
      ] as IFieldCustomize[],
    [formData?.values, dataEmployee, checkFieldEmployee]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // const errors = Validate(validations, formData, [...listFieldBasic]);
    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }
    if (!formData?.values.name) {
      showToast("Tên quy trình không được để trống", "error");
      return;
    }

    if (!formData?.values.employeeId) {
      showToast("Người phụ trách không được để trống", "error");
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(formData.values as any),
      ...(data || processId ? { id: data?.id || processId } : {}),
    };

    const response = await BusinessProcessService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} quy trình thành công`, "success");
      setProcessId(response.result.id);
      onHide(true);
      setIsSubmit(false);
      setTabStep(2);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const onSubmitObject = async () => {
    setIsSubmit(true);

    const body: any = {
      processId: processId,
      groupId: detailObjectType.value,
    };

    const response = await BusinessProcessService.updateBpmObject(body);

    if (response.code === 0) {
      showToast(`Cài đặt cấu trúc hồ sơ thành công`, "success");
      clearForm(true, true);
      setIsSubmit(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const onSubmitSLA = async () => {
    setIsSubmit(true);

    const body: any = {
      id: processId,
      ...valueSLA,
    };

    const response = await BusinessProcessService.updateSLA(body);

    if (response.code === 0) {
      showToast(`Cài đặt SLA thành công`, "success");
      clearForm(true, true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons:
          tabStep === 1
            ? [
                {
                  title: processId ? "Đóng" : "Hủy",
                  color: "primary",
                  variant: "outline",
                  disabled: isSubmit,
                  callback: () => {
                    !isDifferenceObj(formData.values, values) || processId ? clearForm(false) : showDialogConfirmCancel();
                  },
                },
                {
                  title: data || processId ? "Cập nhật" : "Tạo mới",
                  type: "submit",
                  color: "primary",
                  disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
                  is_loading: isSubmit,
                },
              ]
            : tabStep === 3
            ? [
                {
                  title: processId ? "Đóng" : "Hủy",
                  color: "primary",
                  variant: "outline",
                  disabled: isSubmit,
                  callback: () => {
                    !isDifferenceObj(valueSLA, valuesSLA) || processId ? clearForm(false) : showDialogConfirmCancel();
                  },
                },
                {
                  title: "Áp dụng",
                  // type: "submit",
                  color: "primary",
                  disabled: isSubmit || !isDifferenceObj(valueSLA, valuesSLA),
                  callback: () => {
                    onSubmitSLA();
                  },
                },
              ]
            : tabStep === 4
            ? [
                {
                  title: processId ? "Đóng" : "Hủy",
                  color: "primary",
                  variant: "outline",
                  disabled: isSubmit,
                  callback: () => {
                    clearForm(false);
                  },
                },
                {
                  title: "Áp dụng",
                  // type: "submit",
                  color: "primary",
                  disabled: isSubmit || !detailObjectType,
                  callback: () => {
                    onSubmitObject();
                  },
                },
              ]
            : [
                {
                  title: "Đóng",
                  color: "primary",
                  variant: "outline",
                  disabled: isSubmit,
                  callback: () => {
                    // !isDifferenceObj(formData.values, values) ? clearForm(false) : showDialogConfirmCancel();
                    clearForm(false);
                  },
                },
              ],
      },
    }),
    [formData, values, isSubmit, tabStep, processId]
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
        onHide(false);
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

  const clearForm = (acc, close?) => {
    onHide(acc, close);
    setTabStep(1);
    setDataEmployee(null);
    setCheckFieldEmployee(false);
    setProcessId(null);
    setListStepProcess([]);
    setDetailObjectType(null);
    setMapObjectAttribute(null);
  };

  const handleAddStep = async (step: number) => {
    const body: any = {
      stepName: "",
      stepNumber: step,
      processId: processId,
    };

    const response = await BusinessProcessService.updateStep(body);
    if (response.code == 0) {
      getListStepProcess(processId);
      // showToast("Thêm quy trình thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  // Thay đổi tên bước
  const handleBlurValueStep = async (e, idx) => {
    const value = e.target.value;
    let item: any = {};

    if (value) {
      listStepProcess.map((obj, index) => {
        if (index === idx) {
          item.id = obj.id;
          item.stepName = value; //Tên mới
          item.stepNumber = item.step || index + 1;
          item.processId = processId;
        }
      });

      updateStep(item);
    } else {
      setListStepProcess((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, checkName: true };
          }
          return obj;
        })
      );
    }
  };

  const updateStep = async (item: any) => {
    const response = await BusinessProcessService.updateStep(item);
    if (response.code == 0) {
      getListStepProcess(processId);
      showToast("Cập bước quy trình thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleChangeValueStep = async (e, idx) => {
    const value = e.target.value;
    setListStepProcess((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, stepName: value, checkName: false };
        }
        return obj;
      })
    );
  };

  //! xóa đi một quy trình bán hàng
  const handleRemoveStep = (id, idx) => {
    const result = [...listStepProcess];

    //Những item cần được cập nhật
    const newData = [];
    result.map((item, index) => {
      if (index > idx) {
        newData.push({ ...item, step: item.step - 1 });
      }
    });

    const arrPromise = [];
    const promise = new Promise((resolve, reject) => {
      BusinessProcessService.deleteStep(id).then((res) => resolve(res));
    });
    arrPromise.push(promise);

    if (newData.length > 0) {
      newData.map((item) => {
        const promise = new Promise((resolve, reject) => {
          BusinessProcessService.updateStep(item).then((res) => resolve(res));
        });

        arrPromise.push(promise);
      });
    }

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa bước quy trình thành công", "success");
        getListStepProcess(processId);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    });
  };

  const loadOptionObjectType = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
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

  const handleChangeValueObjectType = (e) => {
    setDetailObjectType(e);
    getObjectAttributes(e?.value);
    setFormData({ ...formData, values: { ...formData.values, groupId: e.value } });
  };

  const getObjectAttributes = async (groupId) => {
    const response = await ObjectAttributeService.listAll(groupId);
    if (response.code === 0) {
      const dataOption = response.result;
      setMapObjectAttribute(dataOption || {});
    }
  };

  const updateCustomerAttribute = (attributeId, attributeValue) => {
    let objectId = data?.id || 0;

    let found = false;
    (objectExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        item.objectId = objectId;
        found = true;
      }
    });

    if (!found) {
      let item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      item.objectId = objectId;
      objectExtraInfos[objectExtraInfos.length] = item;
    }

    setObjectExtraInfos([...objectExtraInfos]);
    setFormData({ ...formData, values: { ...formData?.values, timestamp: new Date().getTime() } });
  };

  const getCustomerAttributeValue = (attributeId) => {
    let attributeValue = "";
    (objectExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return attributeValue;
  };

  const getDecimalScale = (attributes) => {
    attributes = attributes ? JSON.parse(attributes) : {};
    let numberFormat = attributes?.numberFormat || "";
    if (numberFormat.endsWith(".#")) {
      return 1;
    }

    if (numberFormat.endsWith(".##")) {
      return 2;
    }

    if (numberFormat.endsWith(".###")) {
      return 3;
    }

    return 0;
  };

  const updateCustomerMultiselectAttribute = (attributeId, e) => {
    let attributeValue = e ? e.split(",") : [];
    updateCustomerAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const onSelectOpenEmployee = async (data?: any) => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      // const dataOption = await SelectOptionData("employeeId", { branchId: dataBranch.value });
      const dataOption = await SelectOptionData("employeeId");
      if (dataOption) {
        // setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
        setListEmployee([...(dataOption.length > 0 ? (data ? [data, ...dataOption] : dataOption) : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  const handleChangeValueEmployeeItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  /**
   * Hiển thị giá trị theo công thức
   * @param attributes
   * @param isFormula
   */
  const getCustomerAttributeFormula = (attributes) => {
    let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attrObj = {};
    (objectExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        attrObj["customerAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });
    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  /**
   * Trả về loại control theo kiểu dữ liệu tương ứng
   */
  const getControlByType = (customerAttribute) => {
    let CustomControl = (
      <Input
        id={`Id${customerAttribute.id}`}
        label={customerAttribute.name}
        fill={true}
        disabled={true}
        value={getCustomerAttributeValue(customerAttribute.id)}
        onChange={(e) => updateCustomerAttribute(customerAttribute.id, e.target.value)}
        placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
        required={!!customerAttribute.required}
      />
    );

    switch (customerAttribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={customerAttribute.name}
            name={customerAttribute.name}
            value={getCustomerAttributeValue(customerAttribute.id)}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            fill={true}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            onChange={(e) => updateCustomerAttribute(customerAttribute.id, e.target.value)}
            maxLength={459}
            disabled={true}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={customerAttribute.name}
            name={customerAttribute.name}
            fill={true}
            required={!!customerAttribute.required}
            value={getCustomerAttributeValue(customerAttribute.id)}
            thousandSeparator={true}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            decimalScale={getDecimalScale(customerAttribute.attributes)}
            onChange={(e) => {
              const value = e.target.value;
              let valueNum = value?.replace(/,/g, "");
              updateCustomerAttribute(customerAttribute.id, valueNum);
            }}
            disabled={true}
          />
        );
        break;
      case "dropdown":
        CustomControl = (
          <SelectCustom
            name={customerAttribute.name}
            label={customerAttribute.name}
            fill={true}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            // error={validateFieldPipeline}
            // message="Loại hợp đồng không được bỏ trống"
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.value);
            }}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );
        break;
      case "multiselect":
        let attris = getCustomerAttributeValue(customerAttribute.id);
        CustomControl = (
          <CheckboxList
            title={customerAttribute.name}
            required={!!customerAttribute.required}
            // disabled={!!customerAttribute.readonly}
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={attris ? JSON.parse(attris).join(",") : ""}
            onChange={(e) => {
              updateCustomerMultiselectAttribute(customerAttribute.id, e);
            }}
            disabled={true}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            checked={!!getCustomerAttributeValue(customerAttribute.id)}
            label={customerAttribute.name}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.target.checked);
            }}
            disabled={true}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={customerAttribute.name}
            title={customerAttribute.name}
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.target.value);
            }}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={customerAttribute.name}
            name={customerAttribute.name}
            fill={true}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
              updateCustomerAttribute(customerAttribute.id, newDate);
            }}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            iconPosition="left"
            icon={<Icon name="Calendar" />}
            isMaxDate={false}
            disabled={true}
            // error={validateFieldSignDate}
            // message={`Vui lòng chọn ngày ký`}
          />
        );
        break;
      case "lookup":
        let attrs = customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : {};

        //2. Trường hợp là employee (nhân viên)
        switch (attrs?.refType) {
          case "employee":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listEmployee || []}
                onMenuOpen={onSelectOpenEmployee}
                isLoading={isLoadingEmployee}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueEmployeeItem(e, customerAttribute)}
                disabled={true}
              />
            );
            break;
        }
        break;
      case "formula":
        //Công thức được lấy từ trường động và trường tĩnh
        //{contract.dealValue + customerAttribute.xyz} => sẽ cần parser từ 2 đối tượng là contract và customerAttribute

        //Chỉ hiển thị chứ không lưu giá trị (nếu thêm mới thì không hiển thị?, sửa mới hiển thị)
        CustomControl = (
          <Input
            id={`Id${customerAttribute.id}`}
            label={customerAttribute.name}
            fill={true}
            value={getCustomerAttributeFormula(customerAttribute?.attributes)}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );
        break;
    }

    return CustomControl;
  };

  const getDetailBpmObject = async (processId: number) => {
    const params: any = {
      processId: processId,
    };

    const response = await BusinessProcessService.detailBpmObject(params);
    if (response.code == 0) {
      const result = response.result;
      if (result?.groupId) {
        setDetailObjectType({ value: result.groupId, label: result.groupName });
        getObjectAttributes(result.groupId);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-add-business-process"
        size="lg"
      >
        <form className="form-add-business-process" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} quy trình`}
            toggle={() => {
              !isSubmit && clearForm(false);
            }}
          />
          <ModalBody>
            <div style={{ display: "flex", margin: "12px 0 0 12px" }}>
              {dataStep.map((item, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: tabStep === item.value ? "1px solid" : "",
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingBottom: 3,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (processId) {
                      setTabStep(item.value);
                    }
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: "500", color: tabStep === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
                </div>
              ))}
            </div>
            {tabStep === 1 && (
              <div className="list-form-group">
                <div className="list-field-item list-field-basic">
                  {listFieldBasic.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                      formData={formData}
                    />
                  ))}
                </div>
              </div>
            )}
            {tabStep === 2 && (
              <div className="tab_2_step_process">
                <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: "600" }}>Danh sách các bước quy trình</span>
                  </div>
                  <div
                    className="button_add_approach"
                    onClick={() => {
                      if (processId) {
                        handleAddStep(listStepProcess.length + 1);
                      }
                    }}
                  >
                    <Icon name="PlusCircleFill" />
                    <span className="title_button">Thêm bước</span>
                  </div>
                </div>
                {listStepProcess && listStepProcess.length > 0 ? (
                  listStepProcess.map((item, index) => (
                    <div key={index} className="container_step">
                      <div className="item_step">
                        <Input
                          fill={true}
                          label=""
                          required={true}
                          value={item?.stepName}
                          onBlur={(e) => handleBlurValueStep(e, index)}
                          onChange={(e) => handleChangeValueStep(e, index)}
                          placeholder="Nhập tên bước quy trình"
                          // error={item.name ? false : checkFieldApproach}
                          error={item.checkName}
                          message="Tên bước quy trình không được để trống"
                        />
                      </div>

                      {/* <Tippy content='Thêm'>
                        <div 
                            className="action__add--step" 
                            onClick={() => handleAddStep(listStepProcess.length + 1)}
                          >
                            <Icon name="PlusCircleFill" />
                        </div>
                      </Tippy> */}

                      {listStepProcess.length > 1 && (
                        <Tippy content="Thêm">
                          <div className="action__remove--step" onClick={() => handleRemoveStep(item.id, index)}>
                            <Icon name="Trash" />
                          </div>
                        </Tippy>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      border: "1px dashed var(--extra-color-30)",
                      borderRadius: 5,
                      padding: "1rem 0 1rem 0 ",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: "600" }}>Chưa có bước quy trình nào</span>
                  </div>
                )}
              </div>
            )}
            {tabStep === 3 && (
              <div>
                <SettingSLA processId={processId} valueSLA={valueSLA} setValueSLA={setValueSLA} />
              </div>
            )}
            {tabStep === 4 && (
              <div
                className={
                  detailObjectType && mapObjectAttribute && Object.entries(mapObjectAttribute).length > 5
                    ? "tab_4_objectAttribute-selected"
                    : "tab_4_objectAttribute"
                }
              >
                <div>
                  <SelectCustom
                    key={formData.values.groupId}
                    id="groupId"
                    name="groupId"
                    label="Chọn loại hồ sơ"
                    fill={true}
                    required={true}
                    // error={validateFieldObjectType}
                    // message="Loại đối tượng không được bỏ trống"
                    options={[]}
                    value={detailObjectType}
                    onChange={(e) => handleChangeValueObjectType(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn loại hồ sơ"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadOptionObjectType}
                  />
                </div>

                <div>
                  {mapObjectAttribute ? (
                    <div className="list__object--attribute">
                      {Object.entries(mapObjectAttribute).map((lstEformAttribute: any, key: number) => (
                        <Fragment key={key}>
                          {(lstEformAttribute[1] || []).map((eformAttribute, index: number) => (
                            <Fragment key={index}>
                              <div
                                // className={`form-group ${eformAttribute.name.length >= 38 || lstEformAttribute[1].length == 2 ? "special-case" : ""}`}
                                className={`form-group `}
                                id={`Field${convertToId(eformAttribute.name)}`}
                                key={`index_${key}_${index}`}
                              >
                                {getControlByType(eformAttribute)}
                              </div>
                            </Fragment>
                          ))}
                        </Fragment>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
