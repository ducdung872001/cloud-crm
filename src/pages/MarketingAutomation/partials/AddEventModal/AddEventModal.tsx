import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { AddContactModalProps } from "model/contact/PropsModel";
import { IContactRequest } from "model/contact/ContactRequestModel";
import ContactService from "services/ContactService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import Input from "components/input/input";
import "./AddEventModal.scss";
import Radio from "components/radio/radio";

export default function AddEventModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listPosition, setListPosition] = useState<IOption[]>(null);
  const [isLoadingPosition, setIsLoadingPosition] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [addFieldCustomer, setAddFieldCustomer] = useState<any[]>([{ id: 0, customerId: 0, isPrimary: 1 }]);
  const [validateCustomer, setValidateCustomer] = useState<any[]>([]);

  const [listEmail, setListEmail] = useState<IOption[]>(null);
  const [addFieldEmail, setAddFieldEmail] = useState<any[]>([{ email: "", emailType: 1, isPrimary: 1 }]);

  const onSelectOpenPosition = async () => {
    if (!listPosition || listPosition.length === 0) {
      setIsLoadingPosition(true);
      const dataOption = await SelectOptionData("positionId");

      if (dataOption) {
        setListPosition([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingPosition(false);
    }
  };

  useEffect(() => {
    if (data?.positionId) {
      onSelectOpenPosition();
    }

    if (data?.positionId == null) {
      setListPosition([]);
    }
  }, [data]);

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId");

      if (dataOption) {
        setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  useEffect(() => {
    if (data?.employeeId) {
      onSelectOpenEmployee();
    }

    if (data?.employeeId == null) {
      setListEmployee([]);
    }
  }, [data]);

  const onSelectOpenCustomer = async () => {
    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingCustomer(true);
      const dataOption = await SelectOptionData("customerId");

      if (dataOption) {
        setListCustomer([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomer(false);
    }
  };

  useEffect(() => {
    if (data?.customers) {
      onSelectOpenCustomer();
    }

    if (data?.customers == null) {
      setListCustomer([]);
    }
  }, [data]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        phone: data?.phone ?? "",
        positionId: data?.positionId ?? "",
        employeeId: data?.employeeId ?? "",
        note: data?.note ?? "",
        avatar: data?.avatar ?? "",
      } as IContactRequest),
    [data, onShow]
  );

  useEffect(() => {
    if (data && data.emails && JSON.parse(data.emails)) {
      const emailData = JSON.parse(data.emails);
      setAddFieldEmail(emailData);
    }

    if (data && data.emails && JSON.parse(data.customers)) {
      const customerData = JSON.parse(data.customers);
      setAddFieldCustomer(customerData);
    }
  }, [data]);

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "phone",
      rules: "required|regex",
    },
    {
      name: "positionId",
      rules: "required",
    },
    {
      name: "employeeId",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên liên hệ",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Số điện thoại",
          name: "phone",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Chức vụ",
          name: "positionId",
          type: "select",
          fill: true,
          options: listPosition,
          onMenuOpen: onSelectOpenPosition,
          isLoading: isLoadingPosition,
          required: true,
        },
        {
          label: "Người phụ trách",
          name: "employeeId",
          type: "select",
          fill: true,
          options: listEmployee,
          onMenuOpen: onSelectOpenEmployee,
          isLoading: isLoadingEmployee,
          required: true,
        },
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [listPosition, isLoadingPosition, listEmployee, isLoadingEmployee]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const newArray = addFieldCustomer.filter((el) => !el.customerId);
    if (newArray.length > 0) {
      const arrayFieldCustomer = [];
      newArray.map((item) => {
        arrayFieldCustomer.push(item.id);
      });
      setValidateCustomer(arrayFieldCustomer);
    }

    if (newArray.length > 0) {
      return;
    }

    setIsSubmit(true);

    const body: IContactRequest = {
      ...(formData.values as IContactRequest),
      ...(data ? { id: data.id } : {}),
    };

    console.log(body);
    // return;

    const response = await ContactService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} liên hệ thành công`, "success");
      onHide(true);
      setAddFieldEmail([{ email: "", emailType: 1, isPrimary: 1 }]);
      setAddFieldCustomer([{ id: 0, customerId: 0, isPrimary: 1 }]);
      setValidateCustomer([]);
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
              setAddFieldCustomer([{ id: 0, customerId: 0, isPrimary: 1 }]);
              setAddFieldEmail([{ email: "", emailType: 1, isPrimary: 1 }]);
              setValidateCustomer([]);
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              validateCustomer.length > 0 ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, validateCustomer]
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
        setAddFieldEmail([{ email: "", emailType: 1, isPrimary: 1 }]);
        setAddFieldCustomer([{ id: 0, customerId: 0, isPrimary: 1 }]);
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

  const listFieldEmail = useMemo(
    () =>
      [
        {
          label: "Email",
          name: "email",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Loại email",
          name: "emailType",
          type: "select",
          fill: true,
          required: true,
          options: [
            { value: 1, label: "Cơ quan" },
            { value: 2, label: "Cá nhân" },
            { value: 3, label: "Khác" },
          ],
        },
      ] as IFieldCustomize[],
    []
  );

  //! đoạn này xử lý vấn đề lấy giá trị của customerId khi thêm nhiều
  const handleChangeValueCustomerItem = (e, idx, id) => {
    const value = e.value;
    if (value) {
      const arrayFieldCustomer = validateCustomer.filter((el) => el !== id);
      setValidateCustomer(arrayFieldCustomer);
    } else {
      setValidateCustomer((oldArray) => [...oldArray, id]);
    }

    setAddFieldCustomer((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, customerId: value };
        }
        return obj;
      })
    );
  };

  //! xóa đi 1 item customer
  const handleRemoveItemCustomer = (idx, id) => {
    const result = [...addFieldCustomer];
    result.splice(idx, 1);

    if (result.length > 0 && addFieldCustomer[idx].isPrimary === 1) {
      result[idx - 1].isPrimary = 1;
    }

    setAddFieldCustomer(result);

    const resultFieldCustomer = validateCustomer.filter((el) => el !== id);
    setValidateCustomer(resultFieldCustomer);
  };

  //! đoạn này xử lý vấn đề lấy giá trị của email khi thêm nhiều
  const handleChangeValueEmailItem = (e, idx) => {
    const value = e.target.value;

    setAddFieldEmail((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, email: value };
        }
        return obj;
      })
    );
  };

  //! đoạn này xử lý vấn đề lấy giá trị của email khi thêm nhiều
  const handleChangeValueEmailTypeItem = (e, idx) => {
    const value = e.value;

    setAddFieldEmail((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, emailType: value };
        }
        return obj;
      })
    );
  };

  //! xóa đi 1 item email
  const handleRemoveItemEmail = (idx) => {
    let result = [...addFieldEmail];
    result.splice(idx, 1);

    if (result.length > 0 && addFieldEmail[idx].isPrimary === 1) {
      result[idx - 1].isPrimary = 1;
    }

    setAddFieldEmail(result);
  };

  //! đoạn này gom hết những trường customers mình mới add vào rồi gửi đi
  useEffect(() => {
    if (addFieldCustomer.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, customers: JSON.stringify(addFieldCustomer) } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, customers: JSON.stringify([]) } });
    }
  }, [addFieldCustomer]);

  //! đoạn này gom hết những trường emails mình mới add vào rồi gửi đi
  useEffect(() => {
    if (addFieldEmail.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, emails: JSON.stringify(addFieldEmail) } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, emails: JSON.stringify([]) } });
    }
  }, [addFieldEmail]);

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  const handleSelectPrimaryEmail = (idx) => {
    let newArray = [...addFieldEmail];
    const index = addFieldEmail.findIndex((el) => el.isPrimary === 1);

    if (index !== -1) {
      newArray[index].isPrimary = 0;
    }
    setAddFieldEmail(newArray);

    setAddFieldEmail((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, isPrimary: 1 };
        }
        return obj;
      })
    );
  };

  const handleSelectPrimaryCustomer = (idx) => {
    let newArray = [...addFieldCustomer];
    const index = addFieldCustomer.findIndex((el) => el.isPrimary === 1);

    if (index !== -1) {
      newArray[index].isPrimary = 0;
    }
    setAddFieldCustomer(newArray);

    setAddFieldCustomer((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, isPrimary: 1 };
        }
        return obj;
      })
    );
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          !isSubmit && onHide(false);
          !isSubmit && setAddFieldEmail([{ email: "", emailType: 1, isPrimary: 1 }]);
          !isSubmit && setAddFieldCustomer([{ id: 0, customerId: 0, isPrimary: 1 }]);
          !isSubmit && setValidateCustomer([]);
        }}
        className="modal-add-contact"
      >
        <form className="form-contact" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} liên hệ`}
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setAddFieldEmail([{ email: "", emailType: 1, isPrimary: 1 }]);
              !isSubmit && setAddFieldCustomer([{ id: 0, customerId: 0, isPrimary: 1 }]);
              !isSubmit && setValidateCustomer([]);
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) =>
                field.label === "Tên liên hệ" || field.label === "Số điện thoại" ? (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                    formData={formData}
                  />
                ) : null
              )}

              {/* Thông tin email người liên hệ */}
              <div className="list__email">
                {addFieldEmail.map((item, idx) => {
                  return (
                    <div key={idx} className="email__item">
                      <div className="form-box">
                        {addFieldEmail && addFieldEmail.length > 1 ? (
                          <span className="add-email">
                            <Tippy content="Chọn làm Email chính" delay={[100, 0]} animation="scale-extreme">
                              <span className="icon-add" onClick={() => handleSelectPrimaryEmail(idx)}>
                                <Radio
                                  // value={item.isPrimary}
                                  checked={item.isPrimary === 1}
                                  // defaultChecked={defaultValue && defaultValue === option.value}
                                  // name={name}
                                  disabled={true}
                                  onChange={(e) => {}}
                                  onClick={(e) => {}}
                                />
                              </span>
                            </Tippy>
                          </span>
                        ) : null}

                        {/* <div className="list-field-email"> */}
                        <div className="form-group-box">
                          <Input
                            label="Email"
                            options={listEmail || []}
                            fill={true}
                            required={true}
                            value={item.email}
                            placeholder="Nhập email"
                            onChange={(e) => handleChangeValueEmailItem(e, idx)}
                          />
                        </div>
                      </div>

                      <div className="form-box">
                        <div className="form-group-box">
                          <SelectCustom
                            label="Loại email"
                            options={[
                              { value: 1, label: "Cơ quan" },
                              { value: 2, label: "Cá nhân" },
                              { value: 3, label: "Khác" },
                            ]}
                            fill={true}
                            required={true}
                            value={item.emailType}
                            placeholder="Chọn loại email"
                            onChange={(e) => handleChangeValueEmailTypeItem(e, idx)}
                          />
                        </div>
                        {/* </div> */}

                        {idx == 0 ? (
                          <span className="add-email">
                            <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                              <span
                                className="icon-add"
                                onClick={() => {
                                  setAddFieldEmail([...addFieldEmail, { email: "", emailType: 1, isPrimary: 0 }]);
                                }}
                              >
                                <Icon name="PlusCircleFill" />
                              </span>
                            </Tippy>
                          </span>
                        ) : (
                          <span className="remove-customer">
                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                              <span className="icon-remove" onClick={() => handleRemoveItemEmail(idx)}>
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {listField.map((field, index) =>
                field.label === "Tên liên hệ" || field.label === "Số điện thoại" ? null : (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                    formData={formData}
                  />
                )
              )}
              <FileUpload label="Ảnh đại diện" type="avatar" formData={formData} setFormData={setFormData} />

              {/* Thông tin khách hàng */}
              <div className="list__customer">
                {addFieldCustomer.map((item, idx) => {
                  return (
                    <div key={idx}>
                      <div key={idx} className="customer__item">
                        {addFieldCustomer && addFieldCustomer.length > 1 ? (
                          <span className="add-email">
                            <Tippy content="Chọn làm đại diện chính" delay={[100, 0]} animation="scale-extreme">
                              <span className="icon-add" onClick={() => handleSelectPrimaryCustomer(idx)}>
                                <Radio
                                  // value={item.isPrimary}
                                  checked={item.isPrimary === 1}
                                  // defaultChecked={defaultValue && defaultValue === option.value}
                                  // name={name}
                                  disabled={true}
                                  onChange={(e) => {}}
                                  onClick={(e) => {}}
                                />
                              </span>
                            </Tippy>
                          </span>
                        ) : null}
                        <div className="list-field-customer">
                          <div className="form-group">
                            <SelectCustom
                              label="Khách hàng"
                              options={listCustomer || []}
                              onMenuOpen={onSelectOpenCustomer}
                              isLoading={isLoadingCustomer}
                              fill={true}
                              required={true}
                              value={item.customerId}
                              placeholder="Chọn khách hàng"
                              onChange={(e) => handleChangeValueCustomerItem(e, idx, item.id)}
                              error={validateCustomer.includes(item.id)}
                              // message="Khách hàng không được bỏ trống"
                            />
                          </div>
                        </div>
                        {idx == 0 ? (
                          <span className="add-customer" style={{ marginLeft: 5 }}>
                            <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                              <span
                                className="icon-add"
                                onClick={() => {
                                  setAddFieldCustomer([...addFieldCustomer, { id: addFieldCustomer.length, customerId: 0, isPrimary: 0 }]);
                                }}
                              >
                                <Icon name="PlusCircleFill" />
                              </span>
                            </Tippy>
                          </span>
                        ) : (
                          <span className="remove-customer">
                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                              <span className="icon-remove" onClick={() => handleRemoveItemCustomer(idx, item.id)}>
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          </span>
                        )}
                      </div>

                      {validateCustomer.includes(item.id) ? (
                        <span style={{ color: "var(--error-color)", fontSize: 12, marginLeft: addFieldCustomer.length > 1 ? 35 : 0 }}>
                          Khách hàng không được bỏ trống
                        </span>
                      ) : null}
                    </div>
                  );
                })}
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
