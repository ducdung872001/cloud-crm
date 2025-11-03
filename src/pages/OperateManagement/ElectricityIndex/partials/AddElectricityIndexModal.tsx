import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IBeautyBranchRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import "./AddElectricityIndexModal.scss";
import OperationProjectService from "services/OperationProjectService";
import ParkingFeeService from "services/ParkingFeeService";
import UtilityReadingService from "services/UtilityReadingService";
import CustomerService from "services/CustomerService";
import SelectCustom from "components/selectCustom/selectCustom";
import SpaceCustomerService from "services/SpaceCustomerService";

export default function AddElectricityIndexModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        // customerId: data?.customerId ?? "",
        scrId: data?.scrId ?? "",
        readingDate: data?.readingDate ?? "",
        electricityReading: data?.electricityReading ?? "",
        waterReading: data?.waterReading ?? "",
        electricityConsumed: data?.electricityConsumed ?? "",
        waterConsumed: data?.waterConsumed ?? "",
        isCalcElectricity: data?.isCalcElectricity.toString(),
        isCalcWater: data?.isCalcWater.toString(),
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "scrId",
      rules: "required",
    },
    {
      name: "readingDate",
      rules: "required",
    },
    {
      name: "electricityReading",
      rules: "required",
    },
    {
      name: "waterReading",
      rules: "required",
    },
    {
      name: "electricityConsumed",
      rules: "required",
    },
    {
      name: "waterConsumed",
      rules: "required",
    },
    {
      name: "isCalcElectricity",
      rules: "required",
    },
    {
      name: "isCalcWater",
      rules: "required",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        // {
        //   label: "Khách hàng",
        //   name: "customerId",
        //   type: "select",
        //   options: listProject,
        //   fill: true,
        //   required: true,
        // },
        {
          label: "Ngày chốt chỉ số",
          name: "readingDate",
          type: "date",
          fill: true,
          required: true,
        },
        {
          label: "Chỉ số điện chốt (kWh)",
          name: "electricityReading",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Chỉ số nước chốt (m3)",
          name: "waterReading",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Sản lượng điện tiêu thụ (kWh)",
          name: "electricityConsumed",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Sản lượng nước tiêu thụ (m3)",
          name: "waterConsumed",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Đã tính sản lượng điện chưa",
          name: "isCalcElectricity",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Đã tính",
            },
            {
              value: "0",
              label: "Chưa tính",
            },
          ],
          fill: true,
          required: true,
        },

        {
          label: "Đã tính sản lượng nước chưa",
          name: "isCalcWater",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Đã tính",
            },
            {
              value: "0",
              label: "Chưa tính",
            },
          ],
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    []
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

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const body: IBeautyBranchRequest = {
      ...(formData.values as IBeautyBranchRequest),
      ...(data ? { id: data.id } : {}),
    };
    const response = await UtilityReadingService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} chốt chỉ số điện/nước thành công`, "success");
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
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
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
        className="modal-add-utility_reading"
      >
        <form className="form-utility_reading-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} chốt chỉ số điện/nước`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-utility_reading">
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
