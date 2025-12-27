import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FileUpload from "components/fileUpload/fileUpload";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IBeautyBranchRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { AddBeautyBranchModalProps } from "model/beautyBranch/PropsModel";
import { PHONE_REGEX, EMAIL_REGEX, WEB_URL_REGEX } from "utils/constant";
import { showToast } from "utils/common";
import { createArrayFromTo, createArrayFromToR, getMaxDay, isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import BeautyBranchService from "services/BeautyBranchService";
import "./AddBranchModal.scss";
import { SelectOptionData } from "utils/selectCommon";

export default function AddBranchModal(props: AddBeautyBranchModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isLoadingBeautyBranch, setIsLoadingBeautyBranch] = useState<boolean>(false);
  const [listBeautyBranch, setListBeautyBranch] = useState<IOption[]>(null);

  const onSelectOpenBeautyBranch = async () => {
    if (!listBeautyBranch || listBeautyBranch.length === 0) {
      setIsLoadingBeautyBranch(true);
      const dataOption = await SelectOptionData("beautyBranch");
      if (dataOption) {
        setListBeautyBranch([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingBeautyBranch(false);
    }
  };

  useEffect(() => {
    if (data?.parentId) {
      onSelectOpenBeautyBranch();
    }

    if (data?.parentId == null) {
      setListBeautyBranch([]);
    }
  }, [data, onShow]);

  const values = useMemo(
    () =>
      ({
        parentId: data?.parentId ?? "",
        avatar: data?.avatar ?? "",
        name: data?.name ?? "",
        alias: data?.alias ?? "",
        address: data?.address ?? "",
        foundingDay: data?.foundingDay ?? "",
        foundingMonth: data?.foundingMonth ?? "",
        foundingYear: data?.foundingYear ?? "",
        website: data?.website ?? "",
        description: data?.description ?? "",
        code: data?.code ?? "",
        doctorNum: data?.doctorNum.toString() ?? "0",
        contact: data?.contact ?? "",
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        goodAt: data?.goodAt ?? "",
      } as IBeautyBranchRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "avatar",
      rules: "required",
    },
    {
      name: "name",
      rules: "required",
    },
    {
      name: "address",
      rules: "required",
    },
    {
      name: "phone",
      rules: "nullable|regex",
    },
    {
      name: "email",
      rules: "regex",
    },
    {
      name: "website",
      rules: "regex",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Chi nhánh cha",
          name: "parentId",
          type: "select",
          fill: true,
          required: false,
          options: listBeautyBranch,
          onMenuOpen: onSelectOpenBeautyBranch,
          isLoading: isLoadingBeautyBranch,
        },
        {
          label: "Tên chi nhánh",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Tên gọi tắt",
          name: "alias",
          type: "text",
          fill: true,
        },
        {
          label: "Số điện thoại",
          name: "phone",
          type: "text",
          fill: true,
          required: true,
          regex: new RegExp(PHONE_REGEX),
          messageErrorRegex: "Số điện thoại không đúng định dạng",
        },
        {
          label: "Email",
          name: "email",
          type: "text",
          fill: true,
          regex: new RegExp(EMAIL_REGEX),
          messageErrorRegex: "Email không đúng định dạng",
        },
        {
          label: "Địa chỉ chi nhánh",
          name: "address",
          type: "textarea",
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [listBeautyBranch, isLoadingBeautyBranch]
  );

  const listFieldAdvanced: IFieldCustomize[] = [
    {
      label: "Mã chi nhánh",
      name: "code",
      type: "text",
      fill: true,
    },
    {
      label: "Số lượng nhân viên",
      name: "doctorNum",
      type: "number",
      fill: true,
    },
    {
      label: "Website",
      name: "website",
      type: "text",
      fill: true,
      regex: new RegExp(WEB_URL_REGEX),
      placeholder: "https://www.example.com",
    },
    {
      label: "Người phụ trách",
      name: "contact",
      type: "text",
      fill: true,
    },
    {
      label: "Lĩnh vực thế mạnh",
      name: "goodAt",
      type: "text",
      fill: true,
    },
  ];

  const listFieldDescription: IFieldCustomize[] = [
    {
      label: "Mô tả",
      name: "description",
      type: "textarea",
      fill: true,
    },
  ];

  //! đoạn này xử lý lấy năm
  const [years, setYears] = useState<any[]>(
    createArrayFromToR(new Date().getFullYear(), 1963).map((item, idx) => {
      return {
        value: +item,
        label: item,
      };
    })
  );

  //! đoạn này xử lý lấy tháng
  const [months, setMonths] = useState<any[]>(
    createArrayFromTo(1, 12).map((item, idx) => {
      if (item < 10) {
        return {
          value: +`0${item}`,
          label: `0${item}`,
        };
      }

      return {
        value: +item,
        label: item,
      };
    })
  );

  //! đoạn này xử lý lấy ngày
  const [days, setDays] = useState<any[]>(
    createArrayFromTo(1, 28).map((item, idx) => {
      if (item < 10) {
        return {
          value: +`0${item}`,
          label: `0${item}`,
        };
      }

      return {
        value: +item,
        label: item,
      };
    })
  );

  //? đoạn này xử lý vấn đề thay đổi giá trị ngày
  const handleChangeValueDay = (e) => {
    const value = e.value;
    setFormData({ ...formData, values: { ...formData?.values, foundingDay: value } });
  };

  //? đoạn này xử lý vấn đề thay đổi giá trị tháng
  const handleChangeValueMoth = (e) => {
    const value = e.value;
    setFormData({ ...formData, values: { ...formData?.values, foundingMonth: value } });
  };

  //? đoạn này xử lý vấn đề thay đổi giá trị năm
  const handleChangeValueYear = (e) => {
    const value = e.value;
    setFormData({ ...formData, values: { ...formData?.values, foundingYear: value } });
  };

  const [formData, setFormData] = useState<IFormData>({ values: values });

  //* Nếu như mà đã chọn tháng hoặc năm rồi thì fill lại lựa chọn ngày theo tháng hoặc năm đó
  useEffect(() => {
    if (+formData?.values?.foundingMonth > 0 || formData.values.foundingYear > 0) {
      const result = createArrayFromTo(1, getMaxDay(+formData?.values?.foundingYear, +formData?.values?.foundingMonth)).map((item, idx) => {
        if (item < 10) {
          return {
            value: +`0${item}`,
            label: `0${item}`,
          };
        }

        return {
          value: +item,
          label: item,
        };
      });

      setDays(result);
    }
  }, [formData.values.foundingMonth, formData?.values?.foundingYear]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBasic, ...listFieldAdvanced, ...listFieldDescription]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const body: IBeautyBranchRequest = {
      ...(formData.values as IBeautyBranchRequest),
      ...(data ? { id: data.id } : {}),
    };
    const response = await BeautyBranchService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} chi nhánh thành công`, "success");
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
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-branch"
      >
        <form className="form-branch-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} chi nhánh`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-branch">
                {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
              <div className="establishment-timeline">
                <label className="label">Mốc thời gian thành lập</label>
                <div className="founded__time--options">
                  <SelectCustom
                    placeholder="Chọn ngày"
                    name="foundingDay"
                    fill={true}
                    options={days}
                    value={formData?.values?.foundingDay}
                    onChange={(e) => handleChangeValueDay(e)}
                    className="founded__day"
                  />

                  <SelectCustom
                    placeholder="Chọn tháng"
                    name="foundingMonth"
                    fill={true}
                    options={months}
                    value={formData?.values?.foundingMonth}
                    onChange={(e) => handleChangeValueMoth(e)}
                    className="founded_month"
                  />

                  <SelectCustom
                    placeholder="Chọn năm"
                    name="foundingYear"
                    fill={true}
                    options={years}
                    value={formData?.values?.foundingYear}
                    onChange={(e) => handleChangeValueYear(e)}
                    className="founded__day"
                  />
                </div>
              </div>
              <div className="form-advanced">
                {listFieldAdvanced.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldAdvanced, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
              <div className="form-dependent">
                <FileUpload type="avatar" label="Ảnh đại diện" formData={formData} setFormData={setFormData} />
                {listFieldDescription.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldDescription, setFormData)}
                    formData={formData}
                  />
                ))}
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
