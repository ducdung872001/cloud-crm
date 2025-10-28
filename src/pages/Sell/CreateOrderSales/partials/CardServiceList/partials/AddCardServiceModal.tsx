import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddInfoCardServiceModalProps } from "model/invoice/PropsModel";
import { ICardFilterRequest } from "model/card/CardRequestModel";
import { IServiceFilterRequest } from "model/service/ServiceRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IBoughtCardRequest } from "model/boughtCard/BoughtCardRequestModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import ImageThirdGender from "assets/images/third-gender.png";
import CardServiceService from "services/CardServiceService";
import EmployeeService from "services/EmployeeService";
import BoughtCardService from "services/BoughtCardService";
import ServiceService from "services/ServiceService";
import "./AddCardServiceModal.scss";
import { ContextType, UserContext } from "contexts/userContext";

export default function AddCardServiceModal(props: AddInfoCardServiceModalProps) {
  const { invoiceId, customerId, onShow, onHide } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [dataCard, setDataCard] = useState(null);

  const [dataEmployee, setDataEmployee] = useState(null);

  const [dataService, setDataService] = useState(null);

  const [listPriceVariation, setListPriceVariation] = useState([]);
  const [dataPriceVariation, setDataPriceVariation] = useState(null);
  const [validateServiceCombo, setValidateServiceCombo] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách dịch vụ
  const loadedOptionService = async (search, loadedOptions, { page }) => {
    const param: IServiceFilterRequest = {
      name: search,
      isCombo: 1,
      page: page,
      limit: 10,
    };

    const response = await ServiceService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items || [];

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  treatmentNum: item.treatmentNum,
                  priceVariation: item.priceVariation,
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
    setDataPriceVariation(null);
    setDataService(e);

    const takePriceVariation = JSON.parse(e.priceVariation || "[]").map((item) => {
      return {
        value: item.priceId,
        label: item.name,
        price: item.price,
        discount: item.discount,
        treatmentNum: item.treatmentNum,
      };
    });

    setListPriceVariation(takePriceVariation);
  };

  //* đoạn này xử lý vấn đề validate trường thẻ vs trường người bán
  const [validateCard, setValidateCard] = useState<boolean>(false);
  const [validateService, setValidateService] = useState<boolean>(false);
  const [validateEmployee, setValidateEmployee] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề call api lấy danh sách thẻ
  const loadedOptionCard = async (search, loadedOptions, { page }) => {
    const param: ICardFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await CardServiceService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  cash: item.cash,
                  account: item.account,
                  multiPurpose: item.multiPurpose,
                  serviceId: item.serviceId,
                  serviceName: item.serviceName,
                  treatmentNum: item.treatmentNum,
                  serviceCombo: item.serviceCombo,
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

  //! đoạn này xử lý vấn đề hiển thị hình ảnh thẻ dịch vụ
  const formatOptionLabelCard = ({ label, avatar, multiPurpose }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div className="d-flex align-items-start justify-content-start flex-column">
          {label}
          <span className="subsidiary">{multiPurpose == 1 ? "Thẻ đa năng" : "Thẻ liệu trình"}</span>
        </div>
      </div>
    );
  };

  //! đoạn này xử lý vấn đề thay đổi thẻ dịch vụ
  const handleChangeValueCard = (e) => {
    setValidateCard(false);
    setDataCard(e);
    if (e.serviceId > 0) {
      setDataService({ value: e.serviceId, label: e.serviceName, serviceCombo: e.serviceCombo, treatmentNum: 0 });
    } else {
      setDataService(null);
      setDataPriceVariation(null);
    }
    setFormData({
      ...formData,
      values: { ...formData?.values, cardId: e.value, cash: e.cash, account: e.cash, accountCard: e.account, serviceCombo: JSON.stringify("") },
    });
  };

  //? đoạn này thay đổi giá trị chọn gói
  const handleChangeValuePriceVariation = (e) => {
    setValidateServiceCombo(false);
    setDataPriceVariation(e);
  };

  //? đoạn này xử lý vấn đề call api lấy ra danh sách người bán
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value
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
    setFormData({ ...formData, values: { ...formData?.values, saleId: e.value } });
  };

  const values = useMemo(
    () =>
      ({
        cardId: null,
        cash: 0,
        qty: 0,
        fee: 0,
        account: 0,
        saleId: null,
        note: "",
        status: 1,
        invoiceId: invoiceId,
        customerId: customerId,
        serviceId: 0,
        treatmentNum: 0,
        totalCard: 0,
        serviceCombo: "",
      } as IBoughtCardRequest),
    [onShow, invoiceId, customerId]
  );

  const validations: IValidation[] = [
    {
      name: "qty",
      rules: "required|min:0",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        ...(dataCard?.multiPurpose == 2
          ? ([
              {
                name: "serviceId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    id="serviceId"
                    name="serviceId"
                    label="Dịch vụ"
                    fill={true}
                    options={[]}
                    value={dataService}
                    onChange={(e) => handleChangeValueService(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn dịch vụ"
                    additional={{
                      page: 1,
                    }}
                    required={true}
                    disabled={dataCard?.serviceId}
                    loadOptionsPaginate={loadedOptionService}
                    formatOptionLabel={formatOptionLabelService}
                    error={validateService}
                    message="Vui lòng chọn dịch vụ"
                  />
                ),
              },
              {
                name: "priceVariation",
                type: "custom",
                snippet: (
                  <SelectCustom
                    label="Chọn combo"
                    name="priceVariation"
                    options={listPriceVariation}
                    value={dataPriceVariation}
                    error={validateServiceCombo}
                    message="Vui lòng chọn combo"
                    fill={true}
                    special={true}
                    required={true}
                    placeholder="Chọn combo theo dịch vụ"
                    onChange={(e) => handleChangeValuePriceVariation(e)}
                    disabled={!dataService || dataService?.serviceCombo ? true : false}
                  />
                ),
              },
              {
                label: "Số buổi điều trị",
                name: "treatmentNum",
                type: "number",
                fill: true,
                disabled: true,
              },
            ] as IFieldCustomize[])
          : []),
        {
          label: "Giá trị thẻ",
          name: "accountCard",
          type: "number",
          fill: true,
          disabled: true,
          placeholder: "Chọn thẻ dịch vụ để xem giá trị thẻ",
        },
        {
          label: "Giá bán",
          name: "cash",
          type: "number",
          fill: true,
          disabled: true,
        },
        {
          label: "Số lượng",
          name: "qty",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Thành tiền",
          name: "fee",
          type: "number",
          fill: true,
          disabled: true,
        },
      ] as IFieldCustomize[],
    [dataCard, dataService, validateService, listPriceVariation, dataPriceVariation, validateServiceCombo]
  );

  const listFieldAdvanced: IFieldCustomize[] = [
    {
      label: "Tổng tiền phải thanh toán",
      name: "totalCard",
      type: "number",
      fill: true,
      disabled: true,
    },
    {
      label: "Ghi chú",
      name: "note",
      type: "textarea",
      fill: true,
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  //! khi thẻ dịch vụ thay đổi update lại dữ liệu
  useEffect(() => {
    if (dataService) {
      const takeServiceCombo = dataService.serviceCombo && JSON.parse(dataService.serviceCombo || "");

      if (takeServiceCombo) {
        setDataPriceVariation({
          value: takeServiceCombo?.priceId,
          label: takeServiceCombo?.name,
          price: takeServiceCombo?.price,
          discount: takeServiceCombo?.discount,
          treatmentNum: takeServiceCombo?.treatmentNum,
        });
      }

      setFormData({ ...formData, values: { ...formData?.values, serviceId: dataService.value } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, serviceId: 0, treatmentNum: 0, serviceCombo: JSON.stringify("") } });
    }
  }, [dataService]);

  useEffect(() => {
    if (dataPriceVariation) {
      const serviceCombo = {
        priceId: dataPriceVariation.value,
        name: dataPriceVariation.label,
        price: dataPriceVariation.price,
        discount: dataPriceVariation.discount,
        treatmentNum: dataPriceVariation.treatmentNum,
      };

      setFormData({
        ...formData,
        values: {
          ...formData.values,
          treatmentNum: dataPriceVariation.treatmentNum,
          serviceCombo: JSON.stringify(serviceCombo),
        },
      });
    }
  }, [dataPriceVariation]);

  useEffect(() => {
    if (formData?.values?.qty > 0 && dataCard) {
      const result = +formData?.values?.cash * +formData?.values?.qty;
      setFormData({ ...formData, values: { ...formData.values, fee: result, totalCard: result } });
    }

    if (isNaN(formData?.values?.qty)) {
      setFormData({ ...formData, values: { ...formData.values, fee: 0, totalCard: 0 } });
    }
  }, [formData?.values?.qty, dataCard]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBasic, ...listFieldAdvanced]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (dataCard === null) {
      setValidateCard(true);
      return;
    }

    if (dataCard?.multiPurpose == 2) {
      if (!dataService) {
        setValidateService(true);
        return;
      }
    }

    if (dataEmployee === null) {
      setValidateEmployee(true);
      return;
    }

    setIsSubmit(true);

    const body: IBoughtCardRequest = {
      ...(formData.values as IBoughtCardRequest),
    };

    delete body.fee;
    delete body.accountCard;
    delete body.totalCard;

    const response = await BoughtCardService.add(body);

    if (response.code === 0) {
      showToast("Thêm mới thẻ dịch vụ cần bán thành công", "success");
      onHide(true);
      setDataCard(null);
      setDataService(null);
      setDataEmployee(null);
      setDataPriceVariation(null);
      setListPriceVariation([]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDataCard(null);
    setDataService(null);
    setDataEmployee(null);
    setDataPriceVariation(null);
    setListPriceVariation([]);
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
            title: "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              validateCard ||
              validateEmployee ||
              validateService ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, validateCard, validateEmployee, validateService]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác thêm mới</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setDataCard(null);
        setDataEmployee(null);
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
        className="modal-add-card-service"
      >
        <form className="form-add-card-service" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title="Thêm mới thẻ dịch vụ được bán"
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setDataCard(false);
              !isSubmit && setDataEmployee(false);
              !isSubmit && setDataService(null);
              !isSubmit && setDataPriceVariation(null);
              !isSubmit && setListPriceVariation([]);
            }}
          />
          <ModalBody>
            <div className={`list-form-group ${dataCard?.serviceCombo || dataService ? "serviceCombo" : ""}`}>
              <div className="form-group">
                <SelectCustom
                  id="cardId"
                  name="cardId"
                  label="Thẻ dịch vụ"
                  fill={true}
                  required={true}
                  options={[]}
                  value={dataCard}
                  onChange={(e) => handleChangeValueCard(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn thẻ dịch vụ"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionCard}
                  formatOptionLabel={formatOptionLabelCard}
                  error={validateCard}
                  message="Vui lòng chọn thẻ dịch vụ"
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

              <div className="form-group">
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
              </div>

              {listFieldAdvanced.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldAdvanced, setFormData)}
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
