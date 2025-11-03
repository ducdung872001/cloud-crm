import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IBeautyBranchRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { showToast } from "utils/common";
import { createArrayFromTo, getMaxDay, isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import "./AddVehicleModal.scss";
import ElectricityRateService from "services/ElectricityRateService";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import OperationProjectService from "services/OperationProjectService";
import ParkingFeeService from "services/ParkingFeeService";
import SpaceService from "services/SpaceService";
import CustomerService from "services/CustomerService";
import SelectCustom from "components/selectCustom/selectCustom";
import VehicleService from "services/VehicleService";
import SpaceCustomerService from "services/SpaceCustomerService";

export default function AddVehicleModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        licensePlate: data?.licensePlate ?? "",
        vehicleType: data?.vehicleType ?? "",
        registerDate: data?.registerDate ?? "",
        parkingSlotId: data?.parkingSlotId ?? "",
        status: data?.status.toString() ?? "1",
        scrId: data?.scrId ?? "",
        projectId: data?.projectId ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "licensePlate",
      rules: "required",
    },
    {
      name: "vehicleType",
      rules: "required",
    },
    {
      name: "registerDate",
      rules: "required",
    },
    {
      name: "scrId",
      rules: "required",
    },
    {
      name: "projectId",
      rules: "required",
    },
  ];

  const [listProject, setListProject] = useState<IOption[]>([]);
  const fetchDataProject = async () => {
    const response = await OperationProjectService.list();
    if (response.code === 0) {
      const data = response.result.items.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setListProject(data);
    }
  };
  useEffect(() => {
    fetchDataProject();
  }, []);

  const listFieldBasic = useMemo(
    () =>
      [
        // {
        //   label: "Dự án",
        //   name: "projectId",
        //   type: "select",
        //   options: listProject,
        //   fill: true,
        //   required: true,
        // },
        {
          label: "Biển số xe",
          name: "licensePlate",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Loại phương tiện",
          name: "vehicleType",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Ngày đăng ký",
          name: "registerDate",
          type: "date",
          fill: true,
          required: true,
        },
        {
          label: "Mã điểm đậu xe",
          name: "parkingSlotId",
          type: "number",
          fill: true,
          required: false,
        },
        {
          label: "Trạng thái",
          name: "status",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Đang sử dụng",
            },
            {
              value: "0",
              label: "Ngừng sử dụng",
            },
          ],
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [listProject]
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

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const body: IBeautyBranchRequest = {
      ...(formData.values as IBeautyBranchRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await VehicleService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} phương tiện thành công`, "success");
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

  //* ngày bắt đầu
  const [checkFieldStartDate, setCheckFieldStartDate] = useState<boolean>(false);
  const handleChangeValueStartDate = (e) => {
    setCheckFieldStartDate(false);

    setFormData({ ...formData, values: { ...formData?.values, startDate: e } });
  };

  //* ngày kết thúc
  const [checkFieldEndDate, setCheckFieldEndDate] = useState<boolean>(false);
  const handleChangeValueEndDate = (e) => {
    setCheckFieldEndDate(false);

    setFormData({ ...formData, values: { ...formData?.values, endDate: e } });
  };

  // lấy thông tin ngày bắt đầu chiến dịch, và ngày cuối cùng chiến dịch

  const [startDay, setStartDay] = useState<number>(new Date(formData.values.startDate).getTime());
  const [endDay, setEndDay] = useState<number>(new Date(formData.values.endDate).getTime());
  useEffect(() => {
    setStartDay(new Date(formData.values.startDate).getTime());
    setEndDay(new Date(formData.values.endDate).getTime());
  }, [formData.values.startDate, formData.values.endDate]);

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
              checkFieldStartDate ||
              // checkFieldEndDate ||
              startDay > endDay ||
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [
      formData,
      values,
      isSubmit,
      startDay,
      endDay,
      checkFieldStartDate,
      // checkFieldEndDate
    ]
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
                  spaceId: item.spaceId,
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

  const [dataSpaceGet, setDataSpaceGet] = useState<any>(null);
  const fetchDetailSpace = async (id) => {
    const response = await SpaceService.detail(id);

    if (response.code === 0) {
      const data = response.result;
      setDataSpaceGet(data);
    }
  };

  useEffect(() => {
    if (dataSpaceCustomer?.spaceId) {
      fetchDetailSpace(dataSpaceCustomer?.spaceId);
    }
  }, [dataSpaceCustomer]);

  useEffect(() => {
    if (dataSpaceGet) {
      setFormData({ ...formData, values: { ...formData?.values, buildingId: dataSpaceGet.buildingId } });
    }
  }, [dataSpaceGet]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-electricity_rate"
      >
        <form className="form-electricity_rate-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} phương tiện`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-electricity_rate">
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
