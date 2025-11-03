import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FileUpload from "components/fileUpload/fileUpload";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IKpiGoalRequest } from "model/kpiGoal/KpiGoalRequestModel";
import { AddKpiGoalModalProps } from "model/kpiGoal/PropsModel";
import { showToast } from "utils/common";
import { convertToId, createArrayFromTo, createArrayFromToR, getMaxDay, isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import KpiGoalService from "services/KpiGoalService";
import KpiDatasourceService from "services/KpiDatasourceService";
import { IKpiDatasourceFilterRequest } from "model/kpiDatasource/KpiDatasourceRequestModel";

import "./AddKpiGoalModal.scss";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import TextArea from "components/textarea/textarea";

export default function AddKpiGoalModal(props: AddKpiGoalModalProps) {
  const { onShow, onHide, data } = props;

  const refOption = useRef();
  useOnClickOutside(refOption, () => setShowFields(false), ["type-formula"]);

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  useEffect(() => {
    if (data && onShow) {
      setValueDataSource({ value: data.datasourceId, label: data.datasourceName });
      setDataCategory({
        value: data.category,
        label:
          data.category === "Finance"
            ? "Tài chính"
            : data.category === "Customer"
            ? "Khách hàng"
            : data.category === "Progress"
            ? "Quy trình"
            : data.category === "People"
            ? "Con người"
            : "Khác",
      });
      setDataDirection({ value: data.direction, label: data.direction === "asc" ? "Hướng tăng" : "Hướng giảm" });
      setDataType({ value: data.type, label: data.type === 1 ? "Tính tự động" : data.type === 2 ? "Tính thủ công" : "Tính theo công thức" });
      setSelectedFormula(data.selectedFormula);
      setDataParent(data.parentIds || []);
      if (data.parents && data.parents.length > 0) {
        const newParent = data.parents.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        setDataParent(newParent);
      }

      if (data.fieldDTO && data.fieldDTO.length > 0) {
        setFieldList(data.fieldDTO);
      }
    }
  }, [data, onShow]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        direction: data?.direction ?? "",
        position: data?.position ?? 0,
        category: data?.category?.toString() ?? "Other",
        type: data?.type.toString() ?? "",
        datasourceId: data?.datasourceId ?? 0,
        // parentId: data?.parentId ?? 0
        parentIds: data?.parentIds ?? [],
      } as IKpiGoalRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "direction",
      rules: "required",
    },
    {
      name: "type",
      rules: "required",
    },
    {
      name: "datasourceId",
      rules: "required",
    },
  ];

  //nhóm chỉ tiêu
  const [dataCategory, setDataCategory] = useState(null);
  const handleChangeValueCategory = (e) => {
    setDataCategory(e);
    setFormData({ ...formData, values: { ...formData.values, category: e.value } });
  };

  //chỉ tiêu cha
  const [dataParent, setDataParent] = useState([]);
  const handleChangeValueDataParent = (e) => {
    setDataParent(e);
    const parentIdList = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData.values, parentIds: parentIdList } });
  };
  //Call API danh sách nguỒn cấp dữ liệu
  const loadedOptionDataParent = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await KpiGoalService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items || [];

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

  //tốt theo hướng
  const [dataDirection, setDataDirection] = useState(null);

  const handleChangeValueDirection = (e) => {
    setDataDirection(e);
    setFormData({ ...formData, values: { ...formData.values, direction: e.value } });
  };

  //cách tính
  const [dataType, setDataType] = useState(null);
  const handleChangeValueType = (e) => {
    setDataType(e);
    // setFormData({ ...formData, values: { ...formData.values, type: e.value } });

    if (e.value === 2 || e.value === 3) {
      setValueDataSource(null);
      setFormData({ ...formData, values: { ...formData.values, type: e.value, datasourceId: 0 } });
    } else {
      setFormData({ ...formData, values: { ...formData.values, type: e.value } });
    }

    if (e.value === 1 || e.value === 2) {
      setShowFields(false);
      setSelectedFormula("");
      setCursorPosition(0);
      setFieldList([]);
    } else if (e.value === 3) {
      setFieldList([
        {
          name: "",
          fieldName: "",
          fieldType: null,
          // dataSource: null,
          goalId: 0,
          goalName: "",
        },
      ]);
    }
  };

  const [valueDataSource, setValueDataSource] = useState(null);
  const handleChangeValueDataSource = (e) => {
    setValueDataSource(e);
    setFormData({ ...formData, values: { ...formData.values, datasourceId: e.value } });
  };
  //Call API danh sách nguỒn cấp dữ liệu
  const loadedOptionDataSource = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await KpiDatasourceService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items || [];

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  code: item.code,
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

  const [valueDataGoal, setValueDataGoal] = useState(null);
  //Call API danh sách chỉ tiêu kpi
  const loadedOptionDataGoal = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await KpiGoalService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items || [];

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  code: item.code,
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

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const [fieldList, setFieldList] = useState([]);
  console.log("fieldList", fieldList);

  const [showFields, setShowFields] = useState<boolean>(false);
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  console.log("selectedFormula", selectedFormula);

  const [cursorPosition, setCursorPosition] = useState<number>(0);

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

  const listFieldBasic: IFieldCustomize[] = useMemo(
    () =>
      [
        {
          label: "Tên chỉ tiêu",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Nhóm chỉ tiêu",
          name: "category",
          type: "select",
          fill: true,
          required: true,
          options: [
            // {
            //   value: "Strategic",
            //   label: "Chiến lược",
            // },
            // {
            //   value: "Operational",
            //   label: "Vận hành",
            // },
            // {
            //   value: "Functional",
            //   label: "Bộ phận chức năng",
            // },
            // {
            //   value: "Leading",
            //   label: "Dẫn dắt/Tụt hậu",
            // },
            // {
            //   value: "Other",
            //   label: "Khác",
            // },
            {
              value: "Finance",
              label: "Tài chính",
            },
            {
              value: "Customer",
              label: "Khách hàng",
            },
            {
              value: "Progress",
              label: "Quy trình",
            },
            {
              value: "People",
              label: "Con người",
            },
            {
              value: "Other",
              label: "Khác",
            },
          ],
        },
        {
          label: "Tốt theo hướng",
          name: "direction",
          type: "select",
          fill: true,
          required: true,
          options: [
            {
              value: "asc",
              label: "Hướng tăng",
            },
            {
              value: "desc",
              label: "Hướng giảm",
            },
          ],
        },
        {
          label: "Cách tính",
          name: "type",
          type: "select",
          fill: true,
          options: [
            {
              value: 1,
              label: "Tính tự động",
            },
            {
              value: 2,
              label: "Tính thủ công",
            },
            {
              value: 3,
              label: "Tính theo công thức",
            },
          ],
          required: true,
        },
        {
          name: "datasourceId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="datasourceId"
              name="datasourceId"
              label="Nguồn cấp dữ liệu"
              fill={true}
              options={[]}
              isMulti={false}
              value={valueDataSource}
              onChange={(e) => handleChangeValueDataSource(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionDataSource}
              placeholder="Chọn nguồn cấp dữ liệu"
              additional={{
                page: 1,
              }}
            />
          ),
        },
        {
          label: "Thứ tự",
          name: "position",
          type: "number",
          fill: true,
        },
      ] as IFieldCustomize[],
    [data, valueDataSource]
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

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    // setIsSubmit(true);
    const body: IKpiGoalRequest = {
      ...(formData.values as IKpiGoalRequest),
      ...(data ? { id: data.id } : {}),
      // ...(formData.values.type === 3 ? {fieldList: JSON.stringify(fieldList)} : {}),
      ...(formData.values.type === 3 ? { fieldDTO: fieldList } : {}),
      ...(formData.values.type === 3 ? { selectedFormula: selectedFormula } : {}),
    };

    console.log("body", body);

    const response = await KpiGoalService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} chỉ tiêu thành công`, "success");
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
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
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

  const handleClearForm = (acc) => {
    onHide(acc);
    setDataCategory(null);
    setDataDirection(null);
    setDataType(null);
    setValueDataSource(null);

    setFieldList([]);
    setShowFields(false);
    setSelectedFormula("");
    setCursorPosition(0);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-kpi-goal"
        size="xl"
      >
        <form className="form-kpi-goal-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} chỉ tiêu`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic">
                {/* {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                    formData={formData}
                  />
                ))} */}
                <div className="form-group">
                  <Input
                    label="Tên chỉ tiêu"
                    name="name"
                    fill={true}
                    required={true}
                    value={formData?.values?.name}
                    placeholder="Tên chỉ tiêu"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData?.values, name: value } });
                    }}
                  />
                </div>

                <div className="form-group">
                  <NummericInput
                    label="Thứ tự"
                    name="position"
                    fill={true}
                    required={false}
                    value={formData?.values?.position}
                    placeholder="thứ tự"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData?.values, position: value } });
                    }}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id="category"
                    name="category"
                    label="Nhóm chỉ tiêu"
                    fill={true}
                    required={true}
                    special={true}
                    options={[
                      // {
                      //   value: "Strategic",
                      //   label: "Chiến lược",
                      // },
                      // {
                      //   value: "Operational",
                      //   label: "Vận hành",
                      // },
                      // {
                      //   value: "Functional",
                      //   label: "Bộ phận chức năng",
                      // },
                      // {
                      //   value: "Leading",
                      //   label: "Dẫn dắt/Tụt hậu",
                      // },
                      // {
                      //   value: "Other",
                      //   label: "Khác",
                      // },
                      {
                        value: "Finance",
                        label: "Tài chính",
                      },
                      {
                        value: "Customer",
                        label: "Khách hàng",
                      },
                      {
                        value: "Progress",
                        label: "Quy trình",
                      },
                      {
                        value: "People",
                        label: "Con người",
                      },
                      {
                        value: "Other",
                        label: "Khác",
                      },
                    ]}
                    value={dataCategory}
                    onChange={(e) => handleChangeValueCategory(e)}
                    isAsyncPaginate={false}
                    isFormatOptionLabel={false}
                    placeholder="Chọn nhóm chỉ tiêu"
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id="parentId"
                    name="parentId"
                    label="Chỉ tiêu cha"
                    fill={true}
                    options={[]}
                    isMulti={true}
                    value={dataParent}
                    onChange={(e) => handleChangeValueDataParent(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    loadOptionsPaginate={loadedOptionDataParent}
                    placeholder="Chọn chỉ tiêu cha"
                    additional={{
                      page: 1,
                    }}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id="direction"
                    name="direction"
                    label="Tốt theo hướng"
                    fill={true}
                    required={true}
                    special={true}
                    options={[
                      {
                        value: "asc",
                        label: "Hướng tăng",
                      },
                      {
                        value: "desc",
                        label: "Hướng giảm",
                      },
                    ]}
                    value={dataDirection}
                    onChange={(e) => handleChangeValueDirection(e)}
                    isAsyncPaginate={false}
                    isFormatOptionLabel={false}
                    placeholder="Chọn tốt theo hướng"
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id="type"
                    name="type"
                    label="Cách tính"
                    fill={true}
                    required={true}
                    special={true}
                    options={[
                      {
                        value: 1,
                        label: "Tính tự động",
                      },
                      {
                        value: 2,
                        label: "Tính thủ công",
                      },
                      {
                        value: 3,
                        label: "Tính theo công thức",
                      },
                    ]}
                    value={dataType}
                    onChange={(e) => handleChangeValueType(e)}
                    isAsyncPaginate={false}
                    isFormatOptionLabel={false}
                    placeholder="Chọn cách tính"
                  />
                </div>

                {dataType?.value === 3 ? (
                  <div style={{ width: "100%" }}>
                    <div style={{ width: "100%", marginBottom: "2rem" }}>
                      <div style={{ marginBottom: 5 }}>
                        <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
                          Danh sách trường <span style={{ color: "red" }}>*</span>
                        </span>
                      </div>
                      {fieldList && fieldList.length > 0
                        ? fieldList.map((item, index) => (
                            <div key={index} className="box-field">
                              <div className="container-field">
                                <div className="form-field">
                                  <Input
                                    label=""
                                    name="name"
                                    fill={true}
                                    required={true}
                                    value={item.name}
                                    placeholder="Tên trường"
                                    onChange={(e) => {
                                      const value = e.target.value;

                                      let fieldName = convertToId(value) || "";
                                      fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

                                      setFieldList((current) =>
                                        current.map((obj, idx) => {
                                          if (index === idx) {
                                            return { ...obj, name: value, fieldName: fieldName };
                                          }
                                          return obj;
                                        })
                                      );
                                    }}
                                  />
                                </div>

                                <div
                                  className={
                                    item.fieldName && fieldList.filter((el) => el.fieldName === item.fieldName).length >= 2
                                      ? "form-field-margin-top"
                                      : "form-field"
                                  }
                                >
                                  <Input
                                    label=""
                                    name="fieldName"
                                    fill={true}
                                    required={true}
                                    readOnly={true}
                                    value={item.fieldName}
                                    placeholder="Mã trường"
                                    // onChange={(e) => {
                                    //     const value = e.target.value;
                                    //     setFormData({ ...formData, values: { ...formData?.values, name: value } });
                                    // }}
                                    error={item.fieldName && fieldList.filter((el) => el.fieldName === item.fieldName).length >= 2 ? true : false}
                                    message="Trường này đã tồn tại"
                                  />
                                </div>

                                {/* <div className="form-field">
                                <SelectCustom
                                  name="fieldType"
                                  label= ""
                                  fill={true}
                                  required={false}
                                  special={true}
                                  options={[
                                    {
                                      value: 1,
                                      label: "Tự động",
                                    },            
                                    {
                                      value: 2,
                                      label: "Thủ công",
                                    },         
                                  ]}
                                  value={item.fieldType}
                                  onChange={(e) => {
                                    setFieldList((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, 
                                                  fieldType: e, 
                                                  // dataSource: null 
                                                  goalId: 0,
                                                  goalName: ''
                                                };
                                        }
                                        return obj;
                                      })
                                    );
                                  }}
                                  isAsyncPaginate={false}
                                  isFormatOptionLabel={false}
                                  placeholder="Kiểu trường"
                                />
                              </div> */}

                                <div className="form-field">
                                  <SelectCustom
                                    id="goalId"
                                    name="goalId"
                                    label=""
                                    fill={true}
                                    options={[]}
                                    // value={item.dataSource}
                                    value={item.goalId ? { value: item.goalId, label: item.goalName } : null}
                                    disabled={item.fieldType?.value === 2}
                                    onChange={(e) => {
                                      setFieldList((current) =>
                                        current.map((obj, idx) => {
                                          if (index === idx) {
                                            return {
                                              ...obj,
                                              // dataSource: e
                                              goalId: e.value,
                                              goalName: e.label,
                                            };
                                          }
                                          return obj;
                                        })
                                      );
                                    }}
                                    isAsyncPaginate={true}
                                    isFormatOptionLabel={false}
                                    loadOptionsPaginate={loadedOptionDataGoal}
                                    placeholder="Chỉ tiêu KPI"
                                    additional={{
                                      page: 1,
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="button-add-field">
                                {index === 0 ? (
                                  <span className="add-field" style={{ marginLeft: 5 }}>
                                    <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                      <span
                                        className="icon-add"
                                        onClick={() => {
                                          setFieldList([
                                            ...fieldList,
                                            {
                                              name: "",
                                              fieldName: "",
                                              fieldType: 0,
                                              // dataSource: 0
                                              goalId: 0,
                                              goalName: "",
                                            },
                                          ]);
                                        }}
                                      >
                                        <Icon name="PlusCircleFill" />
                                      </span>
                                    </Tippy>
                                  </span>
                                ) : (
                                  <span className="remove-field">
                                    <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                      <span
                                        className="icon-remove"
                                        onClick={() => {
                                          const newArray = [...fieldList];
                                          newArray.splice(index, 1);
                                          setFieldList(newArray);
                                        }}
                                      >
                                        <Icon name="Trash" />
                                      </span>
                                    </Tippy>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        : null}
                    </div>

                    <div className="type-formula" ref={refOption}>
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

                      {showFields && (
                        <div className="formula-list">
                          {fieldList &&
                            (fieldList || []).map((item) => {
                              return (
                                <label
                                  onClick={() => {
                                    handlePointerContent(item.fieldName);
                                    setShowFields(false);
                                  }}
                                >
                                  {item.fieldName}
                                </label>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {dataType?.value === 1 ? (
                  <div className="form-group-full">
                    <SelectCustom
                      id="datasourceId"
                      name="datasourceId"
                      label="Nguồn cấp dữ liệu"
                      fill={true}
                      options={[]}
                      isMulti={false}
                      value={valueDataSource}
                      onChange={(e) => handleChangeValueDataSource(e)}
                      isAsyncPaginate={true}
                      isFormatOptionLabel={true}
                      loadOptionsPaginate={loadedOptionDataSource}
                      placeholder="Chọn nguồn cấp dữ liệu"
                      additional={{
                        page: 1,
                      }}
                    />
                  </div>
                ) : null}

                {/* <div className="form-group-full">
                    <NummericInput
                        label="Thứ tự"
                        name="position"
                        fill={true}
                        required={false}
                        value={formData?.values?.position}
                        placeholder="thứ tự"
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, values: { ...formData?.values, position: value } });
                        }}
                    />
                </div> */}
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
