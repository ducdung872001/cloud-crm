import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import PackageService from "services/PackageService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./AddPackageModal.scss";
import { useActiveElement } from "utils/hookCustom";

export default function AddPackageModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const dataPricePackage = [
    {
      value: 1,
      label: "Gói miễn phí",
      maxBranch: null,
      maxAccount: null,
    },
    {
      value: 2,
      label: "Gói cơ bản",
      maxBranch: null,
      maxAccount: null,
    },
    {
      value: 3,
      label: "Gói bạc",
      maxBranch: 1,
      maxAccount: 10,
    },
    {
      value: 4,
      label: "Gói vàng",
      maxBranch: 3,
      maxAccount: 25,
    },
    {
      value: 5,
      label: "Gói kim cương",
      maxBranch: null,
      maxAccount: null,
    },
  ];

  const [lstPricePackage, setLstPricePackage] = useState(dataPricePackage);

  const lstPeriodMonth = [
    {
      value: "6",
      label: "6 tháng",
    },
    {
      value: "12",
      label: "12 tháng",
    },
    {
      value: "36",
      label: "36 tháng",
    },
    {
      value: "240", //20 năm
      label: "Vĩnh viễn",
    },
  ];

  const values = useMemo(
    () =>
      ({
        code: data?.code ?? "",
        name: data?.name ?? "",
        packageType: data?.packageType ?? 1,
        price: data?.price ?? "",
        priceDiscount: data?.priceDiscount ?? "",
        //Thiết lập đặc thù
        settingMore: data?.settingMore ?? "",
        period: data?.period?.toString() ?? "6",
        periodBonus: data?.periodBonus?.toString() ?? "",
        features: data?.features ? JSON.parse(data?.features).join("\n") : "",
        content: data?.content ?? "",
        //Trường hợp sau miễn phí
        optionFree: "1",
      } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    //1. Trường hợp miễn phí
    if (formData?.values["packageType"] == 1) {
      let settings = formData?.values["settingMore"];
      if (settings) {
        settings = JSON.parse(settings);
        setFormData({ ...formData, values: { ...formData.values, optionFree: settings?.optionFree?.toString() } });
      } else {
        setFormData({ ...formData, values: { ...formData.values, optionFree: "1" } });
      }
    }

    //2. Trường hợp gói cơ bản
    //3-4. Trường hợp gói bạc và vàng
    if (formData?.values["packageType"] == 3 || formData?.values["packageType"] == 4) {
      let settings = formData?.values["settingMore"];
      if (settings) {
        settings = JSON.parse(settings);
        setFormData({
          ...formData,
          values: {
            ...formData?.values,
            maxBranch: settings?.maxBranch?.toString(),
            maxAccount: settings?.maxAccount?.toString(),
          },
        });
      }
    }
  }, [formData?.values["settingMore"]]);

  const validations: IValidation[] = [
    {
      name: "code",
      rules: "required",
    },
    {
      name: "name",
      rules: "required",
    },
    {
      name: "packageType",
      rules: "required",
    },
    {
      name: "features",
      rules: "required",
    },
    {
      name: "priceDiscount",
      rules: "required",
    },
    {
      name: "period",
      rules: "required",
    },
    {
      name: "position",
      rules: "required",
    },
  ];

  const handChangeValuePricePackage = (e) => {
    const packageType = e.value;
    setFormData({ ...formData, values: { ...formData.values, packageType } });
  };

  const listField = useMemo(
    () =>
      [
        {
          label: "Ứng dụng",
          name: "code",
          type: "select",
          fill: true,
          required: true,
          options: [
            {
              value: "CRM",
              label: "CRM",
            },
            {
              value: "CMS",
              label: "CMS",
            },
            // {
            //   value: "MARKET",
            //   label: "MARKET",
            // },
            {
              value: "WEB",
              label: "WEB",
            },
            {
              value: "APP",
              label: "APP",
            },
          ],
        },
        {
          label: "Loại gói dịch vụ",
          name: "packageType",
          type: "select",
          fill: true,
          required: true,
          options: lstPricePackage,
          onChange: (e) => handChangeValuePricePackage(e),
        },
        {
          label: "Tên gói",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        ...(formData.values.packageType === 1
          ? ([
              {
                label: "Chọn số tháng miễn phí",
                name: "period",
                type: "radio",
                options: [
                  {
                    value: "6",
                    label: "6 tháng",
                  },
                  {
                    value: "12",
                    label: "12 tháng",
                  },
                ],
                fill: true,
                required: true,
              },
              {
                label: "Hết hạn miễn phí, thì: ",
                name: "optionFree",
                type: "radio",
                options: [
                  { value: "1", label: "Chuyển sang sử dụng miễn phí gói cơ bản" },
                  { value: "2", label: "Yêu cầu nâng cấp sang bản có phí" },
                ],
                fill: true,
              },
              {
                label: "Tính năng",
                name: "features",
                type: "textarea",
                fill: true,
                required: true,
              },
            ] as IFieldCustomize[])
          : formData?.values?.packageType === 2
          ? ([
              {
                label: "Chọn số tháng sử dụng",
                name: "period",
                type: "radio",
                options: lstPeriodMonth,
                fill: true,
                required: true,
              },
              {
                label: "Số tháng tặng",
                name: "periodBonus",
                type: "number",
                fill: true,
              },
              {
                label: "Giá gốc",
                name: "price",
                type: "number",
                fill: true,
                disabled: formData?.values?.packageType === 5,
              },
              {
                label: "Giá ưu đãi",
                name: "priceDiscount",
                type: "number",
                fill: true,
                required: true,
              },
              {
                label: "Tính năng",
                name: "features",
                type: "textarea",
                fill: true,
                required: true,
              },
            ] as IFieldCustomize[])
          : formData?.values?.packageType === 3 || formData?.values?.packageType === 4
          ? ([
              {
                label: "Số lượng chi nhánh tối đa",
                name: "maxBranch",
                type: "number",
                fill: true,
                required: true,
                placeholder:
                  formData?.values?.packageType === 3 || formData?.values?.packageType === 4
                    ? `Số lượng chi nhánh tối đa`
                    : "Nhập số lượng chi nhánh muốn mua",
              },
              {
                label: "Số lượng tài khoản tối đa",
                name: "maxAccount",
                type: "number",
                fill: true,
                required: true,
                placeholder:
                  formData?.values?.packageType === 3 || formData?.values?.packageType === 4
                    ? `Số lượng tài khoản tối đa`
                    : "Nhập số lượng tài khoản muốn mua",
              },
              {
                label: "Chọn số tháng sử dụng",
                name: "period",
                type: "radio",
                options: lstPeriodMonth,
                fill: true,
                required: true,
              },
              {
                label: "Số tháng tặng",
                name: "periodBonus",
                type: "number",
                fill: true,
              },
              {
                label: "Giá gốc",
                name: "price",
                type: "number",
                fill: true,
              },
              {
                label: "Giá ưu đãi",
                name: "priceDiscount",
                type: "number",
                fill: true,
                required: true,
              },
              {
                label: "Tính năng",
                name: "features",
                type: "textarea",
                fill: true,
                required: true,
              },
            ] as IFieldCustomize[])
          : formData.values.packageType === 5
          ? ([
              {
                label: "Giá tiền mua thêm 1 chi nhánh",
                name: "pricePerBranch",
                type: "number",
                fill: true,
                required: true,
              },
              {
                label: "Giá tiền mua thêm 1 tài khoản",
                name: "pricePerAccount",
                type: "number",
                fill: true,
                required: true,
              },
              {
                label: "Tính năng",
                name: "features",
                type: "textarea",
                fill: true,
                required: true,
              },
            ] as IFieldCustomize[])
          : ([] as IFieldCustomize[])),
        {
          label: "Mô tả gói giá",
          name: "content",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [lstPricePackage, formData.values]
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

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: any = {
      ...(formData.values as any),
      ...(data ? { id: data.id } : {}),
    };

    if (body.features) {
      body.features = JSON.stringify(body.features.split("\n"));
    }

    switch (body.packageType) {
      //1 - Loại gói miễn phí
      case 1:
        body.periodBonus = 0; //Miễn phí rồi thì không tặng thêm

        //Hành động xử lý thêm (hết hạn miễn phí thì sao?)
        body.settingMore = JSON.stringify({ optionFree: body.optionFree });
        break;
      //Gói cơ bản (basic)
      case 2:
        break;
      //Gói bạc
      case 3:
        body.settingMore = JSON.stringify({ maxBranch: body.maxBranch, maxAccount: body.maxAccount });
        break;
      //Gói vàng
      case 4:
        body.settingMore = JSON.stringify({ maxBranch: body.maxBranch, maxAccount: body.maxAccount });
        break;
      //Gói kim cương
      case 5:
        body.settingMore = JSON.stringify({ pricePerBranch: body.pricePerBranch, pricePerAccount: body.pricePerAccount });
        break;
    }

    const response = await PackageService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} gói dịch vụ thành công`, "success");
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
        className="modal-add-package"
      >
        <form className="form-package-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} gói dịch vụ`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
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
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
