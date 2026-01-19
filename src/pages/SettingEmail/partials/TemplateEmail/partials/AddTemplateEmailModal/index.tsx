/* eslint-disable prefer-const */
import React, { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddTemplateEmailModelProps } from "model/templateEmail/PropsModel";
import { ITemplateEmailRequestModel } from "model/templateEmail/TemplateEmailRequestModel";
import { IConfigCodeResponseModel } from "model/configCode/ConfigCodeResponse";
import TemplateEmailService from "services/TemplateEmailService";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { ModalFooter } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import ConfigCodeService from "services/ConfigCodeService";
import { serialize } from "utils/editor";

import "./index.scss";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import PlaceholderService from "services/PlaceholderService";

export default function AddTemplateEmailModal(props: IAddTemplateEmailModelProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listConfigCode, setListConfigCode] = useState<IOption[]>(null);
  const [isLoadingConfigCode, setIsLoadingConfigCode] = useState<boolean>(false);

  const [listConfigEmail, setListConfigEmail] = useState<IConfigCodeResponseModel[]>([]);

  const [listApproach, setListApproach] = useState<any>([
    {
      value: "customer",
      label: "Khách hàng",
      color: "#9966CC",
      isActive: true,
      listPlaceholder: [],
    },
    {
      value: "contact",
      label: "Người liên hệ",
      color: "#6A5ACD",
      isActive: false,
      listPlaceholder: [],
    },
    {
      value: "contract",
      label: "Hợp đồng",
      color: "#007FFF",
      isActive: false,
      listPlaceholder: [],
    },
    {
      value: "guarantee",
      label: "Bảo lãnh",
      color: "#ED6665",
      isActive: false,
      listPlaceholder: [],
    },
    {
      value: "contractWarranty",
      label: "Bảo hành",
      color: "#ED6665",
      isActive: false,
      listPlaceholder: [],
    },
  ]);

  const onSelectOpenConfigCode = async () => {
    if (!listConfigCode || listConfigCode.length === 0) {
      setIsLoadingConfigCode(true);

      const dataOption = await SelectOptionData("tcyId");
      if (dataOption) {
        setListConfigCode([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingConfigCode(false);
    }
  };

  useEffect(() => {
    if (data?.tcyId) {
      onSelectOpenConfigCode();
    }

    if (data?.tcyId === null) {
      setListConfigCode([]);
    }
  }, [data]);

  const getListplaceholderCustomer = async () => {
    const param = {};
    const response = await PlaceholderService.customer(param);

    if (response.code === 0) {
      const result = response.result.items;
      const newListplaceholderCustomer = result.map((item) => ({
        code: "{{" + item.name + "}}",
        name: item.title,
      }));

      setListApproach(
        listApproach.map((item) => ({
          ...item,
          listPlaceholder:
            item.value == "customer"
              ? newListplaceholderCustomer.map((item) => ({ value: item.code, label: item.name, code: item.code }))
              : item.listPlaceholder,
        }))
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getListplaceholderContact = async () => {
    const param = {};
    const response = await PlaceholderService.contact(param);

    if (response.code === 0) {
      const result = response.result.items;

      const newListplaceholderContact = result.map((item) => ({
        code: "{{" + item.name + "}}",
        name: item.title,
      }));

      setListApproach(
        listApproach.map((item) => ({
          ...item,
          listPlaceholder:
            item.value == "contact"
              ? newListplaceholderContact.map((item) => ({ value: item.code, label: item.name, code: item.code }))
              : item.listPlaceholder,
        }))
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getListplaceholderContract = async () => {
    const param = {};
    const response = await PlaceholderService.contract(param);

    if (response.code === 0) {
      const result = response.result.items;
      const newListplaceholderContract = result.map((item) => ({
        code: "{{" + item.name + "}}",
        name: item.title,
      }));

      setListApproach(
        listApproach.map((item) => ({
          ...item,
          listPlaceholder:
            item.value == "contract"
              ? newListplaceholderContract.map((item) => ({ value: item.code, label: item.name, code: item.code }))
              : item.listPlaceholder,
        }))
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getListplaceholderGuarantee = async () => {
    const param = {};
    const response = await PlaceholderService.guarantee(param);

    if (response.code === 0) {
      const result = response.result.items;
      const newListplaceholderGuarantee = result.map((item) => ({
        code: "{{" + item.name + "}}",
        name: item.title,
      }));

      setListApproach(
        listApproach.map((item) => ({
          ...item,
          listPlaceholder:
            item.value == "guarantee"
              ? newListplaceholderGuarantee.map((item) => ({ value: item.code, label: item.name, code: item.code }))
              : item.listPlaceholder,
        }))
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getListplaceholdercontractWarranty = async () => {
    const param = {};
    const response = await PlaceholderService.contractWarranty(param);

    if (response.code === 0) {
      const result = response.result.items;
      const newListplaceholderGuarantee = result.map((item) => ({
        code: "{{" + item.name + "}}",
        name: item.title,
      }));

      setListApproach(
        listApproach.map((item) => ({
          ...item,
          listPlaceholder:
            item.value == "contractWarranty"
              ? newListplaceholderGuarantee.map((item) => ({ value: item.code, label: item.name, code: item.code }))
              : item.listPlaceholder,
        }))
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const fetchPlaceholder = async () => {
    if (placeholder.value == "customer") {
      await getListplaceholderCustomer();
    } else if (placeholder.value == "contact") {
      await getListplaceholderContact();
    } else if (placeholder.value == "contract") {
      await getListplaceholderContract();
    } else if (placeholder.value == "guarantee") {
      await getListplaceholderGuarantee();
    } else if (placeholder.value == "contractWarranty") {
      await getListplaceholdercontractWarranty();
    }
  };

  const values = useMemo(
    () =>
      ({
        title: data?.title ?? "",
        content: data?.content ?? "",
        initialContent: data?.content ?? "",
        contentDelta: data?.contentDelta ?? "",
        tcyId: data?.tcyId ?? null,
        type: data?.type?.toString() ?? "1",
        placeholder: "",
      } as ITemplateEmailRequestModel),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "title",
      rules: "required",
    },
    {
      name: "content",
      rules: "required",
    },
    {
      name: "tcyId",
      rules: "required",
    },
    {
      name: "type",
      rules: "required",
    },
  ];

  const [placeholder, setPlaceholder] = useState<any>(listApproach[0]);

  useEffect(() => {
    for (let i = 0; i < listApproach.length; i++) {
      const element = listApproach[i];
      if (element.value == placeholder.value) {
        setPlaceholder(element);
      }
    }
  }, [listApproach]);

  const listField = useMemo(
    () =>
      [
        {
          label: "Tiêu đề email",
          name: "title",
          type: "text",
          fill: true,
          maxLength: 100,
          required: true,
        },
        {
          label: "Chủ đề email",
          name: "tcyId",
          type: "select",
          options: listConfigCode,
          onMenuOpen: onSelectOpenConfigCode,
          fill: true,
          required: true,
          isLoading: isLoadingConfigCode,
        },
        {
          label: "Chọn mẫu tin",
          name: "type",
          type: "radio",
          fill: true,
          required: true,
          options: [
            {
              value: "1",
              label: "Mẫu tin tự soạn",
            },
            {
              value: "2",
              label: "Chọn mẫu có sẵn",
            },
            {
              value: "3",
              label: "Import từ File Html",
            },
          ],
        },
        // {
        //   name: "code",
        //   type: "custom",
        //   snippet: (
        //     <div className="code-email">
        //       {listConfigEmail.map((item, idx) => (
        //         <span key={idx} className="name-template" onClick={() => handlePointerContent(item)}>
        //           {item.name}
        //         </span>
        //       ))}
        //     </div>
        //   ),
        // },
        {
          name: "code",
          type: "custom",
          snippet: (
            <div className="code-email-select">
              <div className="left">
                {/* <div className="list__relationship">
                  {listApproach.map((item, idx) => {
                    return item.label ? (
                      <div
                        key={idx}
                        className={`relationship-item ${item.isActive ? "active__relationship--item" : ""}`}
                        style={{ backgroundColor: item.color, color: "white" }}
                        onClick={(e) => {
                          e && e.preventDefault();
                          setListApproach(listApproach.map((i, index) => ({ ...i, isActive: index === idx ? true : false })));
                          setPlaceholder(item);
                        }}
                      >
                        {item.isActive && <Icon name="Checked" />}
                        {item.label}
                      </div>
                    ) : null;
                  })}
                </div> */}

                <SelectCustom
                  id="placeholderType"
                  name="placeholderType"
                  label="Chọn đối tượng"
                  options={listApproach}
                  fill={true}
                  value={placeholder.value}
                  onChange={(e) => {
                    setListApproach(listApproach.map((i) => ({ ...i, isActive: e.value === i.value ? true : false })));
                    setPlaceholder(e);
                  }}
                  placeholder={"Chọn đối tượng"}
                />
              </div>
              <div className="right">
                <SelectCustom
                  id="placeholder"
                  name="placeholder"
                  label={"Chọn trường thông tin " + placeholder.label}
                  options={placeholder.listPlaceholder}
                  fill={true}
                  value={null}
                  onMenuOpen={() => fetchPlaceholder()}
                  onChange={(e) => handlePointerContent(e)}
                  placeholder={"Chọn trường thông tin " + placeholder.label}
                />
              </div>
            </div>
          ),
        },
        {
          label: "Nội dung tin",
          name: "content",
          type: "editor",
          fill: true,
          required: true,
          onChange: (value) => handleChangeContent(value),
        },
      ] as IFieldCustomize[],
    [listConfigCode, isLoadingConfigCode, listConfigEmail, formData?.values, listApproach, placeholder]
  );

  // đoạn này sẽ xử lý thay đổi nội dung trong trình soạn thảo
  const handleChangeContent = (content) => {
    setFormData({ ...formData, values: { ...formData.values, content } });
  };

  const handlePointerContent = (data) => {
    const value = data.code;

    //Set vào placeholder của form
    setFormData({ ...formData, values: { ...formData.values, placeholder: value } });
  };

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
    setIsSubmit(true);

    const body: ITemplateEmailRequestModel = {
      ...(formData.values as ITemplateEmailRequestModel),
      ...(data ? { id: data.id } : {}),
      content: formData.values["content"] ? serialize({ children: formData.values["content"] }) : "",
    };

    const response = await TemplateEmailService.update(body);
    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} mẫu tin thành công`, "success");
      onHide(true);
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

  return (
    <div className="add-template-email">
      <form className="form-template-email-group" onSubmit={(e) => onSubmit(e)}>
        <div className="list-form-group">
          {listField.map((field, index) => (
            <FieldCustomize
              key={index}
              field={field}
              handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
              formData={formData}
            />
          ))}
        </div>
        <ModalFooter actions={actions} className="template-email" />
      </form>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
