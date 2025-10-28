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
import "./AddSpaceModal.scss";
import ElectricityRateService from "services/ElectricityRateService";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import OperationProjectService from "services/OperationProjectService";
import ParkingFeeService from "services/ParkingFeeService";
import SpaceService from "services/SpaceService";
import CustomerService from "services/CustomerService";
import SelectCustom from "components/selectCustom/selectCustom";
import SpaceTypeService from "services/SpaceTypeService";

export default function AddSpaceModal(props: any) {
  const { onShow, onHide, data, dataBuildingFloor, dataBuilding } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        unitNumber: data?.unitNumber ?? "",
        areaM2: data?.areaM2 ?? "",
        otherAreaM2: data?.otherAreaM2 ?? "",
        steId: data?.steId ?? "",
        buildingId: data?.buildingId ?? dataBuilding?.id ?? "",
        floorId: data?.floorId ?? dataBuildingFloor?.id ?? "",
        projectId: data?.projectId ?? dataBuilding?.projectId ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "unitNumber",
      rules: "required",
    },
    {
      name: "steId",
      rules: "required",
    },
    {
      name: "areaM2",
      rules: "required",
    },
    {
      name: "buildingId",
      rules: "required",
    },
    {
      name: "floorId",
      rules: "required",
    },
    {
      name: "projectId",
      rules: "required",
    },
  ];

  const [listSpaceType, setListSpaceType] = useState<IOption[]>([]);
  const fetchDataSpaceType = async () => {
    const response = await SpaceTypeService.list();
    if (response.code === 0) {
      const data = response.result.items.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setListSpaceType(data);
    }
  };
  useEffect(() => {
    fetchDataSpaceType();
  }, []);

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Loại căn",
          name: "steId",
          type: "select",
          options: listSpaceType,
          fill: true,
          required: true,
        },
        {
          label: "Số căn",
          name: "unitNumber",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Diện tích căn (m2)",
          name: "areaM2",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Diện tích khác (m2)",
          name: "otherAreaM2",
          type: "number",
          fill: true,
          required: false,
        },
      ] as IFieldCustomize[],
    [listSpaceType]
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

    const response = await SpaceService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} căn thành công`, "success");
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

  // // khách hàng
  // const [dataCustomer, setDataCustomer] = useState(null);
  // useEffect(() => {
  //   setDataCustomer(data?.customerId ? { value: data?.customerId, label: data?.customerName || null } : null);
  // }, [data]);
  // const [validateFieldCustomer, setValidateFieldCustomer] = useState(false);

  // const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
  //   const param: any = {
  //     name: search,
  //     page: page,
  //     limit: 10,
  //   };

  //   const response = await CustomerService.filter(param);

  //   if (response.code === 0) {
  //     const dataOption = response.result.items;

  //     return {
  //       options: [
  //         ...(dataOption.length > 0
  //           ? dataOption.map((item) => {
  //               return {
  //                 value: item.id,
  //                 label: item.name,
  //               };
  //             })
  //           : []),
  //       ],
  //       hasMore: response.result.loadMoreAble,
  //       additional: {
  //         page: page + 1,
  //       },
  //     };
  //   }

  //   return { options: [], hasMore: false };
  // };

  // const handleChangeValueCustomer = (e) => {
  //   setValidateFieldCustomer(false);
  //   setDataCustomer(e);
  //   setFormData({ ...formData, values: { ...formData?.values, customerId: e.value } });
  // };

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
          <ModalHeader
            title={data ? "Chỉnh sửa" : "Thêm mới" + " căn của tầng - " + (dataBuildingFloor?.name || "") + (", toà - " + dataBuilding?.name || "")}
            toggle={() => !isSubmit && onHide(false)}
          />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-electricity_rate">
                {/* <div className="form-group">
                  <SelectCustom
                    id="customerId"
                    name="customerId"
                    label="Khách hàng"
                    fill={true}
                    required={true}
                    error={validateFieldCustomer}
                    message="Khách hàng không được bỏ trống"
                    options={[]}
                    value={dataCustomer}
                    onChange={(e) => handleChangeValueCustomer(e)}
                    isAsyncPaginate={true}
                    placeholder="Khách hàng"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionCustomer}
                  />
                </div> */}
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
