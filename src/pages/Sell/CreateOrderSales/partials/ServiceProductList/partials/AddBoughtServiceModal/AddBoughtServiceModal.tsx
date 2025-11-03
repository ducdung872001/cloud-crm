import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { AddBoughtServiceProps } from "model/boughtService/PropsModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IServiceFilterRequest } from "model/service/ServiceRequestModel";
import { IBoughtServiceRequest } from "model/boughtService/BoughtServiceRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import SelectCustom from "components/selectCustom/selectCustom";
import Icon from "components/icon";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import ServiceService from "services/ServiceService";
import EmployeeService from "services/EmployeeService";
import BoughtServiceService from "services/BoughtServiceService";
import "./AddBoughtServiceModal.scss";
import { ContextType, UserContext } from "contexts/userContext";

export default function AddBoughtServiceModal(props: AddBoughtServiceProps) {
  const { onShow, onHide, idCustomer, invoiceId, data } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isPriceAdjustment, setIsPriceAdjustment] = useState<boolean>(false);

  useEffect(() => {
    if (data?.discountUnit == 1 || data?.discountUnit == 2) {
      setIsPriceAdjustment(true);
    } else {
      setIsPriceAdjustment(false);
    }
  }, [data]);

  const [dataService, setDataService] = useState(null);

  const [dataEmployee, setDataEmployee] = useState(null);
  const [listPriceVariation, setListPriceVariation] = useState([]);
  const [dataPriceVariation, setDataPriceVariation] = useState(null);

  //* đoạn này xử lý vấn đề validate trường sản phẩm vs trường người bán
  const [validateService, setValidateService] = useState<boolean>(false);
  const [validateEmployee, setValidateEmployee] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách dịch vụ
  const loadedOptionService = async (search, loadedOptions, { page }) => {
    const param: IServiceFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ServiceService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  price: item.price,
                  priceDiscount: item.discount ? item.discount : item.price,
                  priceVariation: item.priceVariation,
                  treatmentNum: item.treatmentNum,
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

  //! đoạn này lấy ra chi tiết dịch vụ khi cập nhật
  const getDetailService = async () => {
    const response = await ServiceService.detail(data?.serviceId);

    if (response.code === 0) {
      const result = response.result;

      setDataService({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        price: result.price,
        priceDiscount: result.discount,
        priceVariation: result.priceVariation,
        treatmentNum: result.treatmentNum,
      });

      const takePriceVariation = JSON.parse(result.priceVariation || "[]").map((item) => {
        return {
          value: item.priceId,
          label: item.name,
          price: item.price,
          priceDiscount: item.discount,
          treatmentNum: item.treatmentNum,
        };
      });
      setListPriceVariation(takePriceVariation);
    }
  };

  useEffect(() => {
    if (data?.serviceId && onShow) {
      getDetailService();
    }
  }, [data, onShow]);

  //! đoạn này xử lý vấn đề hiển thị hình ảnh dịch vụ
  const formatOptionLabelService = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý vấn đề thay đổi dịch vụ
  const handleChangeValueService = (e) => {
    setValidateService(false);
    setDataService(e);
    setDataPriceVariation(null);
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        serviceId: e.value,
        price: e.price,
        priceDiscount: e.priceDiscount,
        treatmentNum: e.treatmentNum,
        priceSample: +e.priceDiscount,
      },
    });

    const takePriceVariation = (Array.isArray(JSON.parse(e.priceVariation)) ? JSON.parse(e.priceVariation) : []).map((item) => {
      return {
        value: item.priceId,
        label: item.name,
        price: item.price,
        priceDiscount: item.discount,
        treatmentNum: item.treatmentNum,
      };
    });
    setListPriceVariation(takePriceVariation);
  };

  //? đoạn này xử lý vấn đề call api lấy ra danh sách người bán
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
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

  //? call api chi tiết người bán
  const getDetailEmployee = async (id) => {
    const response = await EmployeeService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataEmployee({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      });
    }
  };

  //? đoạn này kiểm tra điều kiện callApi chi tiết người bán khi cập nhật
  useEffect(() => {
    if (data?.saleEmployeeId && onShow) {
      getDetailEmployee(data?.saleEmployeeId);
    }

    return () => setDataEmployee(null);
  }, [data?.saleEmployeeId, onShow]);

  //? đoạn này xử lý vấn đề lấy ra ảnh người bán
  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //? đoạn này xử lý vấn đề thay đổi người bán
  const handleChangeValueEmployee = (e) => {
    setValidateEmployee(false);
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, saleEmployeeId: e.value } });
  };

  //? đoạn này thay đổi giá trị chọn gói
  const handleChangeValuePriceVariation = (e) => {
    setDataPriceVariation(e);
  };

  useEffect(() => {
    if (dataPriceVariation) {
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          priceVariationId: dataPriceVariation.value,
          price: +dataPriceVariation.price,
          priceDiscount: +dataPriceVariation.priceDiscount,
          treatmentNum: +dataPriceVariation.treatmentNum,
          priceSample: data ? values.priceSample : +dataPriceVariation.priceDiscount,
        },
      });
      values.treatmentNum = +dataPriceVariation.treatmentNum;
    }
  }, [dataPriceVariation, data]);

  //! đoạn này xử lý vấn đề lấy ra chi tiết 1 gói dịch vụ khi update
  useEffect(() => {
    if (data?.priceVariationId && listPriceVariation.length > 0) {
      const result = listPriceVariation.find((item) => item.value === data?.priceVariationId);
      setFormData({ ...formData, values: { ...formData?.values, treatmentNum: +result?.treatmentNum } });
      setDataPriceVariation(result);
    }
  }, [data, listPriceVariation]);

  const values = useMemo(
    () =>
      ({
        invoiceId: data?.invoiceId ?? invoiceId,
        customerId: data?.customerId ?? idCustomer,
        serviceId: data?.serviceId ?? null,
        serviceNumber: data?.serviceNumber ?? "",
        qty: data?.id ? 1 : 0,
        price: data?.price ?? 0,
        priceDiscount: data?.priceDiscount ?? 0,
        discount: data?.discount ?? 0,
        discountUnit: data?.discountUnit?.toString() ?? "0",
        saleEmployeeId: data?.saleEmployeeId ?? null,
        priceVariationId: data?.priceVariationId ?? "",
        fee: data?.fee ?? 0,
        totalPayment: data?.fee ?? 0,
        note: data?.note ?? "",
        priceSample:
          data?.discountUnit == 0
            ? data?.priceDiscount
            : data?.discountUnit == 2
            ? data?.priceDiscount - data?.discount
            : data?.discountUnit == 1
            ? data?.priceDiscount - data?.priceDiscount * (data?.discount / 100)
            : 0,
      } as IBoughtServiceRequest),
    [data, onShow, idCustomer, invoiceId]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations = useMemo(
    () =>
      [
        {
          name: "qty",
          rules: "required|min:0",
        },
        ...(data?.serviceNumber
          ? [
              {
                name: "serviceNumber",
                rules: "required",
              },
            ]
          : []),
        ...(formData?.values?.discountUnit !== 0
          ? [
              {
                name: "discount",
                rules: "required|min:0",
              },
            ]
          : []),
      ] as IValidation[],
    [data, formData?.values?.discountUnit]
  );

  const isBeauty = localStorage.getItem("isBeauty");

  const listField = useMemo(
    () =>
      [
        {
          name: "serviceId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="serviceId"
              name="serviceId"
              label="Dịch vụ"
              fill={true}
              required={true}
              options={[]}
              value={dataService}
              onChange={(e) => handleChangeValueService(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn dịch vụ"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionService}
              formatOptionLabel={formatOptionLabelService}
              error={validateService}
              message="Vui lòng chọn dịch vụ"
              disabled={data?.serviceId ? true : false}
            />
          ),
        },
        ...(data?.serviceNumber
          ? ([
              {
                label: "Mã dịch vụ",
                name: "serviceNumber",
                type: "text",
                fill: true,
                required: true,
              },
            ] as IFieldCustomize[])
          : []),
        ...(listPriceVariation.length > 0
          ? [
              {
                label: "Chọn gói",
                name: "priceVariationId",
                type: "select",
                options: listPriceVariation,
                fill: true,
                onChange: (e) => handleChangeValuePriceVariation(e),
                disabled: data?.priceVariationId ? true : false,
              },
            ]
          : []),
        ...(isBeauty && isBeauty == "1"
          ? [
              {
                label: "Số buổi điều trị",
                name: "treatmentNum",
                type: "number",
                fill: true,
                disabled: true,
              },
            ]
          : []),
        {
          label: `Giá gốc ${formData?.values?.priceVariationId !== "" ? "gói" : "dịch vụ"}`,
          name: "price",
          type: "number",
          fill: true,
          disabled: true,
        },
        {
          label: `Giá ${formData?.values?.priceVariationId !== "" ? "gói" : "dịch vụ"} khuyến mại`,
          name: "priceDiscount",
          type: "number",
          fill: true,
          disabled: true,
        },
        {
          name: "priceAdjustment",
          type: "custom",
          snippet: (
            <div
              className={`price__adjustment ${isPriceAdjustment ? "active__price--adjustment" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setIsPriceAdjustment(!isPriceAdjustment);
              }}
            >
              <Icon name="PlusCircleFill" />
              Điều chỉnh giá bán
            </div>
          ),
        },
        ...(isPriceAdjustment
          ? [
              {
                label: "Giảm giá thêm",
                name: "discountUnit",
                type: "radio",
                fill: true,
                options: [
                  {
                    value: "1",
                    label: "Phần trăm (%)",
                  },
                  {
                    value: "2",
                    label: "Tiền mặt (VNĐ)",
                  },
                ],
              },
              {
                label: `${formData?.values?.discountUnit == "1" ? "Phần trăm (%)" : "Tiền mặt"} được giảm`,
                name: "discount",
                type: "number",
                fill: true,
                isWarning: formData?.values?.discountUnit == "2" && formData?.values?.discount > formData?.values?.priceSample,
                messageWarning: "Tiền mặt được giảm nhỏ hơn giá khuyến mãi",
              },
            ]
          : []),
        {
          label: "Giá bán",
          name: "priceSample",
          type: "number",
          fill: true,
          required: true,
          disabled: true,
        },
        {
          label: "Số lượng",
          name: "qty",
          type: "number",
          fill: true,
          required: true,
          disabled: data?.id,
        },
        {
          label: "Tổng tiền phải thanh toán",
          name: "totalPayment",
          type: "number",
          fill: true,
          disabled: true,
        },
        {
          name: "saleEmployeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="saleId"
              name="saleId"
              label="Người bán"
              fill={true}
              required={true}
              options={[]}
              value={dataEmployee}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn người bán"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              error={validateEmployee}
              message="Vui lòng chọn người bán"
            />
          ),
        },
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [listPriceVariation, formData?.values, isPriceAdjustment, dataEmployee, validateEmployee, dataService, validateService, data, isBeauty]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if (isPriceAdjustment) {
      setFormData({ ...formData, values: { ...formData?.values, discountUnit: "1" } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, discountUnit: "0", discount: 0 } });
    }
  }, [isPriceAdjustment]);

  useEffect(() => {
    if (dataService) {
      setFormData({ ...formData, values: { ...formData?.values, treatmentNum: dataService.treatmentNum } });
      values.treatmentNum = dataService.treatmentNum;
    }
  }, [dataService]);

  //? Đoạn này xử lí tính toán khi người dùng trọn giảm giá theo % hoặc tiền mặt
  useEffect(() => {
    //! đoạn này là xử lý trường hợp tính theo %
    if (formData?.values?.discountUnit == "1" && +formData?.values?.discount) {
      const result = +formData?.values?.priceDiscount * (formData?.values?.discount / 100);
      setFormData({
        ...formData,
        values: { ...formData?.values, priceSample: +formData?.values?.priceDiscount - result, fee: +formData?.values?.priceDiscount - result },
      });
    }

    if (+formData?.values?.discount > 100) {
      setFormData({ ...formData, values: { ...formData?.values, discount: 100 } });
    }

    //! đoạn này là xử lý trường hợp tính theo tiền mặt được giảm
    if (formData?.values?.discountUnit == "2" && +formData?.values?.discount) {
      const result = +formData?.values?.priceDiscount - +formData?.values?.discount;
      setFormData({ ...formData, values: { ...formData?.values, priceSample: result, fee: result } });
    }
    if (+formData?.values?.discount > +formData?.values?.priceDiscount) {
      setFormData({ ...formData, values: { ...formData?.values, priceSample: 0, totalPayment: 0 } });
    }

    //* trường hợp chung
    if (!formData?.values?.discount) {
      setFormData({ ...formData, values: { ...formData?.values, priceSample: formData?.values?.priceDiscount } });
    }
  }, [formData?.values?.discountUnit, formData?.values?.discount, formData?.values?.priceSample, formData?.values?.priceDiscount]);

  //! đoạn này xử lý vấn đề nếu như mà số lượng lớn hơn 0 thì tính tổng tiền
  useEffect(() => {
    if (formData?.values?.qty) {
      const result = +formData?.values?.priceSample * +formData?.values?.qty;
      setFormData({ ...formData, values: { ...formData.values, totalPayment: result, fee: +formData?.values?.priceSample } });
    }
  }, [formData?.values?.qty, formData?.values?.priceSample]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (formData?.values?.serviceId == null) {
      setValidateService(true);
      return;
    }

    if (formData?.values?.saleEmployeeId == null) {
      setValidateEmployee(true);
      return;
    }

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: IBoughtServiceRequest = {
      ...(formData.values as IBoughtServiceRequest),
      ...(data ? { id: data.id } : {}),
    };

    delete body.totalPayment;
    delete body.priceSample;

    const response = await BoughtServiceService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} dịch vụ cần bán thành công`, "success");
      onHide(true);
      setListPriceVariation([]);
      setDataService(null);
      setDataEmployee(null);
      setDataPriceVariation(null);
      setIsPriceAdjustment(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setIsPriceAdjustment(false);
    setListPriceVariation([]);
    setDataService(null);
    setDataEmployee(null);
    setDataPriceVariation(null);
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
              !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              validateService ||
              validateEmployee ||
              (formData?.values?.discountUnit == "2" ? formData?.values?.priceSample < formData?.values?.discount : false) ||
              (formData?.values?.discountUnit == "1" ? +formData?.values?.discount > 100 : false) ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, validateService, validateEmployee]
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
        setListPriceVariation([]);
        setDataService(null);
        setDataEmployee(null);
        setDataPriceVariation(null);
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
        className="modal-add-bought-service"
      >
        <form className="form-add-bought-service" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} dịch vụ được bán`}
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setListPriceVariation([]);
              !isSubmit && setDataService(null);
              !isSubmit && setDataEmployee(null);
              !isSubmit && setDataPriceVariation(null);
              !isSubmit && setIsPriceAdjustment(false);
            }}
          />
          <ModalBody>
            <div className={`list-form-group ${data?.serviceNumber ? "dependent" : ""} ${isBeauty && isBeauty != "1" ? "not-spa" : ""}`}>
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
