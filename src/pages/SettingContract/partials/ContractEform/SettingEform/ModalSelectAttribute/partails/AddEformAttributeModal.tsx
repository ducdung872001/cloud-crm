import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IContractAttributeRequest, IContractAttributeFilterRequest } from "model/contractAttribute/ContractAttributeRequest";
import { AddContractAttributeModalProps } from "model/contractAttribute/PropsModel";
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
import { isNumber } from "lodash";
import RadioList from "components/radio/radioList";

import "./AddEformAttributeModal.scss";
import ContractEformService from "services/ContractEformService";
export default function AddEformAttributeModal(props: any) {
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

  const [listContractAttribute, setListContractAttribute] = useState<IOption[]>(null);
  const [isLoadingContractAttribute, setIsLoadingContractAttribute] = useState<boolean>(false);
  const [addFieldAttributes, setAddFieldAttributes] = useState<any[]>([{ value: "", label: "" }]);
  const [detailLookup, setDetailLookup] = useState<any>("contract");
  const [numberFormat, setNumberFormat] = useState<any>("");
  const [checkFieldName, setCheckFieldName] = useState(false);

  const [contractAttributeFields, setContractAttributeFields] = useState<any>(null); //Khởi tạo null là quan trọng

  const [showFields, setShowFields] = useState<boolean>(false);
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);

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

      Object.keys(dataOption).forEach((key) => {
        (dataOption[key] || []).map((item) => {
          if (item.datatype == "number" && item.fieldName) {
            arrField.push("contractAttribute_" + item.fieldName);
          }
        });
      });

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

  const listFieldFirst = useMemo(
    () =>
      [
        {
          label: "Tên trường thông tin",
          name: "name",
          type: "text",
          fill: true,
          required: true,
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
      ] as IFieldCustomize[],
    [listContractAttribute, isLoadingContractAttribute, data]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const listFieldSecond = useMemo(
    () =>
      [
        // {
        //   label: "Tên trường",
        //   name: "fieldName",
        //   type: "text",
        //   fill: true,
        //   required: false,
        //   readOnly: true
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
    [listContractAttribute, isLoadingContractAttribute, formData?.values["name"], formData?.values["datatype"]]
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

  const onSubmit = async (e) => {
    e.preventDefault();

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
      onHide(true);
      setAddFieldAttributes([{ value: "", label: "" }]);
      setDetailLookup("contract");
      setNumberFormat("");
      setCheckFieldName(false);
      setContractAttributeFields(null);
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

  const handleClearForm = () => {
    onHide(false);
    setAddFieldAttributes([{ value: "", label: "" }]);
    setDetailLookup("contract");
    setNumberFormat("");
    setShowFields(false);
    setCheckFieldName(false);
    setContractAttributeFields(null);
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
            handleClearForm();
            // if ((data?.datatype == 'dropdown' || data?.datatype == 'radio') && data?.attributes) {
            //   setAddFieldAttributes(JSON.parse(data?.attributes));
            // } else {
            //   setAddFieldAttributes([{ value: '', label: '' }])
            // }
          }
        }}
        className="modal-add-eform-attribute"
      >
        <form className="form-eform-attribute-source" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} trường thông tin biểu mẫu`}
            toggle={() => {
              if (!isSubmit) {
                handleClearForm();
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
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
