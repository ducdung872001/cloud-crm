import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICustomerAttributeRequest, ICustomerAttributeFilterRequest } from "model/customerAttribute/CustomerAttributeRequest";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { convertToId, isDifferenceObj } from 'reborn-util';
import "./AddPartnerAttributeModal.scss";
import Input from "components/input/input";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import RadioList from "components/radio/radioList";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import PartnerAttributeService from "services/PartnerAttributeService";

export default function AddPartnerAttributeModal(props: any) {
  const { onShow, onHide, data } = props;

  const refShowField = useRef();
  useOnClickOutside(refShowField, () => setShowFields(false), ["formula"]);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listCustomerAttribute, setListCustomerAttribute] = useState<IOption[]>(null);
  const [isLoadingCustomerAttribute, setIsLoadingCustomerAttribute] = useState<boolean>(false);
  const [addFieldAttributes, setAddFieldAttributes] = useState<any[]>([{ value: '', label: '' }]);
  const [detailLookup, setDetailLookup] = useState<any>("contract");
  const [numberFormat, setNumberFormat] = useState<any>('');

  //Cần đổi lại thành khách hàng
  const [customerAttributeFields, setCustomerAttributeFields] = useState<any>(null); //Khởi tạo null là quan trọng
  const [showFields, setShowFields] = useState<boolean>(false);
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [checkFieldName, setCheckFieldName] = useState(false);

  const [listLookup, setListLookup] = useState<IOption[]>([{
    value: "customer",
    label: "Khách hàng"
  }, {
    value: "employee",
    label: "Nhân viên"
  }, {
    value: "contact",
    label: "Liên hệ"
  }, {
    value: "contract",
    label: "Hợp đồng"
  }]);

  /**
   * Lấy ra nhóm trường thông tin cha
   */
  const onSelectOpenCustomerAttribute = async () => {
    if (!listCustomerAttribute || listCustomerAttribute.length === 0) {
      setIsLoadingCustomerAttribute(true);

      const params: any = {
        isParent: 1
      }
      const response = await PartnerAttributeService.list(params);

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
      setDetailParent({value: data.parentId, label: data.parentName})
    }

    if ((data?.datatype == 'dropdown' || data?.datatype == 'radio' || data?.datatype == 'multiselect') && data?.attributes) {
      setAddFieldAttributes(JSON.parse(data?.attributes));
    }

    if (data?.datatype == 'lookup' && data?.attributes) {
      setDetailLookup(JSON.parse(data?.attributes).refType || 'contract');
    }

    if (data?.datatype == 'number' && data?.attributes) {
      setNumberFormat(JSON.parse(data?.attributes).numberFormat || '');
    }

    if (data?.datatype == 'formula' && data?.attributes) {
      setSelectedFormula(JSON.parse(data?.attributes).formula || '');
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
  const getPartnerAttributes = async () => {
    const response = await PartnerAttributeService.listAll();

    let arrField = [];

    if (response.code === 0) {
      const dataOption = response.result;

      console.log('dataOption =>', dataOption);
      Object.keys(dataOption).forEach((key) => {
        (dataOption[key] || []).map(item => {
          if (item.datatype == 'number') {
            arrField.push("customerAttribute_" + item.fieldName);
          }
        });
      });

      console.log('Fields =>', arrField);

      //Lưu lại
      setCustomerAttributeFields(arrField);
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
      fieldName: data?.fieldName || "",
      required: data?.required ? "1" : "",
      readonly: data?.readonly ? "1" : "",
      uniqued: data?.uniqued ? "1" : "",
      datatype: data?.datatype ?? "text",
      attributes: data?.attributes ?? null,
      position: data?.position ?? "0",
      parentId: data?.parentId ?? "0",
    } as ICustomerAttributeRequest),
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
    const params: any = {
      isParent: 1
    }
    const response = await PartnerAttributeService.list(params);

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
    if (formData?.values['datatype'] == 'formula') {
      if (customerAttributeFields == null) {
        getPartnerAttributes();
      }
    }
  }, [formData]);

  useEffect(() => {
    //Nếu rỗng thì thay đổi
    let fieldName = convertToId(formData.values['name']) || "";
    fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, 'g'), '');

    //Chỉ set lại nếu là trường hợp thêm mới
    if (!data?.id) {
      setFormData({ ...formData, values: { ...formData.values, fieldName: fieldName } });
    }
  }, [formData?.values['name']]);

  useEffect(() => {
    //Nếu rỗng thì thay đổi
    let fieldName = formData.values['fieldName'] || "";
    fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, 'g'), '');
    
    setFormData({ ...formData, values: { ...formData.values, fieldName: fieldName } });
  }, [formData?.values['fieldName']]);

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
        },
        {
          label: "Kiểu dữ liệu",
          name: "datatype",
          type: "select",
          fill: true,
          required: true,
          onChange: (e => {
            if (e?.value == 'dropdown') {
              if (data && data.datatype === 'dropdown' && data.attributes) {
                setAddFieldAttributes(JSON.parse(data?.attributes));
              } else {
                setAddFieldAttributes([{ value: '', label: '' }]);
              }
            } else if (e?.value == 'multiselect') {
              if (data && data.datatype === 'multiselect' && data.attributes) {
                setAddFieldAttributes(JSON.parse(data?.attributes));
              } else {
                setAddFieldAttributes([{ value: '', label: '' }]);
              }
            } else if (e?.value == 'radio') {
              if (data && data.datatype === 'radio' && data.attributes) {
                setAddFieldAttributes(JSON.parse(data?.attributes));
              } else {
                setAddFieldAttributes([{ value: '', label: '' }]);
              }
            } else if (e?.value === 'lookup') {
              if (data && data.datatype === 'lookup' && data.attributes && JSON.parse(data?.attributes).refType) {
                setDetailLookup(JSON.parse(data?.attributes).refType);
              } else {
                setDetailLookup('contract');
              }
            } else if (e?.value === 'number') {
              if (data && data.datatype === 'number' && data.attributes && JSON.parse(data?.attributes).numberFormat) {
                setNumberFormat(JSON.parse(data?.attributes).numberFormat);
              } else {
                setNumberFormat('');
              }
            }

          }),
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
              label: "Multiselect",
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
    [listCustomerAttribute, isLoadingCustomerAttribute, data]
  );

  const listFieldSecond = useMemo(
    () =>
      [
        // {
        //   label: "Mã trường thông tin",
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
              label= 'Mã trường thông tin'
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
          )
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

        {
          name: "parentId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="parentId"
              name="parentId"
              label="Thuộc nhóm"
              options={[]}
              fill={true}
              value={detailParent}
              required={false}
              onChange={(e) => handleChangeValueParent(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn nhóm"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionParent}
             
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
        ...(formData?.values['datatype'] == 'formula' ? [] : [
          {
            label: `Trường bắt buộc nhập?`,
            name: "required",
            type: "checkbox",
            options: [
              {
                value: "1",
                label: "Bắt buộc"
              }
            ],
            required: false,
          }
        ]),
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
              label: "Chỉ cho phép đọc"
            }
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
              label: "Kiểm trùng dữ liệu"
            }
          ],
          required: false,
        },
      ] as IFieldCustomize[],
    [
      listCustomerAttribute, 
      isLoadingCustomerAttribute, 
      formData?.values["name"], 
      formData?.values["fieldName"], 
      formData?.values['datatype'], 
      checkFieldName, 
      detailParent
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
  ]

  const checkDuplicated = async (fieldName, valueFieldName) => {
    const param = {
      id: 0,
      fieldName: fieldName
    }
    const response = await PartnerAttributeService.checkDuplicated(param);
    if(response.code === 0){
      const result = response.result;
      if(fieldName === result.fieldName){
        if(!isDifferenceObj(fieldName, valueFieldName)){
          setCheckFieldName(false)
        } else {
          setCheckFieldName(true)
        }
      } else {
        setCheckFieldName(false)
      }
    }
  }

  useEffect(() => {
    if(onShow){
      checkDuplicated(formData.values?.fieldName, values.fieldName)
    } 
  }, [formData.values?.fieldName, values.fieldName, onShow ])

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // const errors = Validate(validations, formData, listField);
    const errors = Validate(validations, formData, [...listFieldFirst, ...listFieldSecond]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    // setIsSubmit(true);

    // const body: ICustomerAttributeRequest = {
    //   ...(formData.values as ICustomerAttributeRequest),
    //   ...(data ? { id: data.id } : {}),
    // };

    const body: ICustomerAttributeRequest = {
      ...(formData.values as ICustomerAttributeRequest),
      ...(data ? { id: data.id } : {}),
      ...(
        (formData.values['datatype'] == 'dropdown' || formData.values['datatype'] == 'radio' || formData.values['datatype'] == 'multiselect') ? {
          attributes: addFieldAttributes ? JSON.stringify(addFieldAttributes) : null
        } : {}),

      ...((formData.values['datatype'] == 'lookup') ? {
        attributes: detailLookup ? JSON.stringify({ refType: detailLookup }) : null
      } : {}),

      ...((formData.values['datatype'] == 'number') ? {
        attributes: detailLookup ? JSON.stringify({ numberFormat: numberFormat }) : null
      } : {}),

      ...((formData.values['datatype'] == 'formula') ? {
        attributes: selectedFormula ? JSON.stringify({ formula: selectedFormula }) : null
      } : {}),
    };

    const response = await PartnerAttributeService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} trường thông tin đối tác thành công`, "success");
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
            disabled: isSubmit 
                      || !isDifferenceObj(formData.values, values) 
                      || (formData.errors && Object.keys(formData.errors).length > 0)
                      || checkFieldName,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldName]
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
    setAddFieldAttributes([{ value: '', label: '' }]);
    setDetailLookup("contract");
    setNumberFormat('');
    setShowFields(false);
    setCheckFieldName(false);
    setCustomerAttributeFields(null);
    setDetailParent(null);
  }

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-partner-attribute"
        size="lg"
      >
        <form className="form-partner-attribute-source" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} trường thông tin đối tác`} toggle={() => !isSubmit && handleClearForm(false)} />
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
              {
                formData?.values['datatype'] == 'dropdown' ||
                  formData?.values['datatype'] == 'radio' ||
                  formData?.values['datatype'] == 'multiselect' ?
                  <div className="list__attribute">
                    <div>
                      <span style={{fontSize: 14, fontWeight: '700'}}>Lựa chọn</span>
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
                          {
                            idx == 0 ? <span className="add-attribute">
                              <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                <span
                                  className="icon-add"
                                  onClick={() => {
                                    setAddFieldAttributes([...addFieldAttributes, { value: '', label: '' }]);
                                  }}
                                >
                                  <Icon name="PlusCircleFill" />
                                </span>
                              </Tippy>
                            </span> : <span className="remove-attribute">
                              <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                <span className="icon-remove" onClick={() => handleRemoveItemAttribute(idx)}>
                                  <Icon name="Trash" />
                                </span>
                              </Tippy>
                            </span>
                          }
                        </div>
                      );
                    })}
                  </div> : null
              }

              {formData?.values['datatype'] == 'number' ?
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
                : null}

              {/* Trường hợp là lookup */}
              {
                formData?.values['datatype'] == 'lookup' ? <div className="form-group">
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
                </div> : null
              }

              {/* Trường hợp là formula */}
              {
                formData?.values['datatype'] == 'formula' ? <div className="form-group formula">
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
                      onClick={e => {
                        handleChangeContent(e);
                      }}
                    />
                    <Icon name="Plus" width={24} height={24} title={'Thêm trường công thức'}
                      onClick={e => {
                        setShowFields(true);
                      }} />
                  </div>

                  {/* Vùng listing sẵn các field để lựa chọn */}
                  {
                    showFields && <div className="formula-list" ref={refShowField}>
                      {
                        customerAttributeFields && (customerAttributeFields || []).map(item => {
                          return <label onClick={() => {
                            handlePointerContent(item);
                            setShowFields(false)
                          }}>{item}</label>
                        })
                      }
                    </div>
                  }
                </div> : null
              }

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
