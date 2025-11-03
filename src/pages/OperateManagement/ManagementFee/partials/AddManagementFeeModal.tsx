import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IBeautyBranchRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { showToast } from "utils/common";
import { createArrayFromTo, isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import "./AddManagementFeeModal.scss";
import OperationProjectService from "services/OperationProjectService";
import SelectCustom from "components/selectCustom/selectCustom";
import ManagementFeeService from "services/ManagementFeeService";
import SpaceCustomerService from "services/SpaceCustomerService";

export default function AddManagementFeeModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        month: data?.month ?? "",
        year: data?.year ?? "",
        areaM2: data?.areaM2 ?? "",
        ratePerM2: data?.ratePerM2 ?? "",
        totalFee: data?.totalFee ?? "",
        status: data?.status.toString() ?? "",
        scrId: data?.scrId ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "month",
      rules: "required",
    },
    {
      name: "year",
      rules: "required",
    },
    {
      name: "areaM2",
      rules: "required",
    },
    {
      name: "ratePerM2",
      rules: "required",
    },
    {
      name: "totalFee",
      rules: "required",
    },
    {
      name: "status",
      rules: "required",
    },
    {
      name: "scrId",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "",
          name: "monthYear",
          type: "custom",
          fill: true,
          required: true,
          snippet: (
            <div className="month_year">
              <SelectCustom
                className="select-month"
                name="month"
                label={"Tháng"}
                placeholder="Chọn tháng"
                fill={true}
                required={true}
                value={formData.values.month || 0}
                onChange={(e) => {
                  setFormData({ ...formData, values: { ...formData.values, month: e.value }, errors: { ...formData.errors, month: "" } });
                }}
                options={createArrayFromTo(1, 12).map((item, idx) => {
                  return {
                    value: item,
                    label: item,
                  };
                })}
                error={formData?.errors?.month}
                message="Vui lòng chọn tháng"
              />
              <SelectCustom
                className="select-year"
                name="year"
                label={"Năm"}
                placeholder="Chọn năm"
                fill={true}
                required={true}
                value={formData.values.year || 0}
                onChange={(e) => {
                  setFormData({ ...formData, values: { ...formData.values, year: e.value }, errors: { ...formData.errors, year: "" } });
                }}
                options={createArrayFromTo(2020, 2099).map((item, idx) => {
                  return {
                    value: item,
                    label: item,
                  };
                })}
                error={formData?.errors?.year}
                message="Vui lòng chọn năm"
              />
            </div>
          ),
        },
        {
          label: "Đơn giá (VNĐ/m2)",
          name: "ratePerM2",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Diện tích tính phí (m2)",
          name: "areaM2",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "",
          name: "totalFee",
          type: "custom",
          fill: true,
          required: true,
          snippet: (
            <div className="form-group">
              <b>Tổng tiền: </b>
              {formData.values.ratePerM2 && formData.values.areaM2 ? (
                <span style={{ color: "var(--primary-color)", fontWeight: "bold" }}>
                  {new Intl.NumberFormat("vi-VN").format(formData.values.ratePerM2 * formData.values.areaM2)} đ
                </span>
              ) : (
                <span style={{ color: "var(--primary-color)", fontWeight: "bold" }}>0 đ</span>
              )}
            </div>
          ),
        },
        {
          label: "Trạng thái",
          name: "status",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Đã thanh toán",
            },
            {
              value: "0",
              label: "Đang xử lý",
            },
          ],
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [formData.values]
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
    if (formData.values.ratePerM2 && formData.values.areaM2) {
      formData.values.totalFee = formData.values.ratePerM2 * formData.values.areaM2;
    }

    const errors = Validate(validations, formData, [
      ...listFieldBasic,
      {
        label: "Tháng",
        name: "month",
        type: "number",
        fill: true,
        required: true,
      },
      {
        label: "Năm",
        name: "year",
        type: "number",
        fill: true,
        required: true,
      },
    ]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const body: IBeautyBranchRequest = {
      ...(formData.values as IBeautyBranchRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await ManagementFeeService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} phí quản lý thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
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
            disabled: isSubmit || !isDifferenceObj(formData.values, values),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  // Căn hộ
  const [dataSpaceCustomer, setDataSpaceCustomer] = useState(null);
  useEffect(() => {
    setDataSpaceCustomer(data?.scrId ? { value: data?.scrId, label: (data?.unitNumber || "") + " - " + (data?.customerName || "") } : null);
  }, [data, onShow]);
  const [validateFieldSpaceCustomer, setValidateFieldSpaceCustomer] = useState(false);

  const loadedOptionSpaceCustomer = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await SpaceCustomerService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.unitNumber + " - " + item.customerName,
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

  const handleChangeValueSpaceCustomer = (e) => {
    setValidateFieldSpaceCustomer(false);
    setDataSpaceCustomer(e);
    setFormData({ ...formData, values: { ...formData?.values, scrId: e.value } });
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-management_fee"
      >
        <form className="form-management_fee-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} phí quản lý`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-management_fee">
                <div className="form-group">
                  <SelectCustom
                    id="scrId"
                    name="scrId"
                    label="Căn hộ"
                    fill={true}
                    required={true}
                    error={validateFieldSpaceCustomer}
                    message="Căn hộ không được bỏ trống"
                    options={[]}
                    value={dataSpaceCustomer}
                    onChange={(e) => handleChangeValueSpaceCustomer(e)}
                    isAsyncPaginate={true}
                    placeholder="Căn hộ"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionSpaceCustomer}
                  />
                </div>
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
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
