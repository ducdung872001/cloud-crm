import React, { useState, useEffect, useMemo, Fragment, useCallback, useContext } from "react";
import moment from "moment";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IAddTreatmentHistoryModelProps } from "model/treatmentHistory/PropsModel";
import { ITreatmentHistoryRequestModel } from "model/treatmentHistory/TreatmentHistoryRequestModel";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import FileUpload from "components/fileUpload/fileUpload";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { isDifferenceObj } from "reborn-util";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import CustomerService from "services/CustomerService";
import EmployeeService from "services/EmployeeService";
import TreatmentHistoryService from "services/TreatmentHistoryService";
import BoughtServiceService from "services/BoughtServiceService";
import "./AddTreamentHistoryModal.scss";
import { ContextType, UserContext } from "contexts/userContext";
import { IServiceFilterRequest } from "model/service/ServiceRequestModel";
import ServiceService from "services/ServiceService";

interface IDataServiceOption {
  value: number;
  serviceId: number;
  label: string;
  avatar: string;
  isCombo: number;
  treatmentNum: number;
  totalTreatment: number;
  cardNumber: string;
  serviceNumber: string;
}

export default function AddTreamentHistoryModal(props: IAddTreatmentHistoryModelProps) {
  const { onShow, onHide, data, idCustomer } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listBuyService, setListBuyService] = useState<IDataServiceOption[]>([]);
  const [isLoadingBuyService, setIsLoadingBuyService] = useState<boolean>(false);

  const [detailCustomer, setDetailCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [detailEmployee, setDetailEmployee] = useState(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);

  const [detailService, setDetailService] = useState(null);

  //!validate
  const [checkFieldCustomer, setCheckFieldCustomer] = useState<boolean>(false);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const [checkFieldService, setCheckFieldService] = useState<boolean>(false);

  const values = useMemo(
    () =>
      ({
        customerId: data?.customerId ?? null,
        customerPhone: detailCustomer?.phoneMasked ?? "",
        serviceId: data?.serviceId ?? null,
        treatmentStart: data?.treatmentStart ?? new Date(),
        treatmentEnd: data?.treatmentEnd ?? "",
        procDesc: data?.procDesc ?? "",
        afterProof: data?.afterProof ?? "",
        prevProof: data?.prevProof ?? "",
        scheduleNext: data?.scheduleNext ?? "",
        employeeId: data?.employeeId ?? null,
        note: data?.note ?? "",
        treatmentTh: data?.totalTreatment ?? 0,
        serviceNumber: data?.serviceNumber ?? null,
        cardNumber: data?.cardNumber ?? null,
      } as ITreatmentHistoryRequestModel),
    [data, onShow, detailCustomer?.phoneMasked]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //? đoạn này sử lý vấn đề lấy chi tiết 1 khách hàng khi thêm mới
  const getDetailCustomerOneCreate = async (id: number) => {
    if (!id) return;
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        phoneMasked: result.phoneMasked,
      };

      setDetailCustomer(detailData);
    }

    setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (idCustomer) {
      getDetailCustomerOneCreate(idCustomer);
    }
  }, [idCustomer]);

  //! đoạn này sử lý vấn đề lấy ra danh sách khách hàng
  //! đoạn này xử lý vấn đề lấy ra danh sách khách hàng
  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await CustomerService.filter(param);

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
                  phoneMasked: item.phoneMasked,
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

  const formatOptionLabelCustomer = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCustomer = (e) => {
    setCheckFieldCustomer(false);
    setDetailCustomer(e);
    setDetailService(null);
    onSelectOpenBuyService(e.value);
    setFormData({ ...formData, values: { ...formData?.values, customerId: e.value, customerPhone: e.phoneMasked, treatmentTh: 0 } });
  };

  const getDetailCustomer = async () => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(data?.customerId);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        phoneMasked: result.phoneMasked,
      };

      setDetailCustomer(detailData);
    }

    setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (data?.customerId && onShow) {
      getDetailCustomer();
    }
  }, [data?.customerId, onShow]);

  //? đoạn này xử lý vấn đề khi mà detailCustomer thay đổi thì update lại vào formData
  useEffect(() => {
    if (detailCustomer) {
      setFormData({ ...formData, values: { ...formData?.values, customerPhone: detailCustomer?.phoneMasked } });
    }
  }, [detailCustomer]);

  //! đoạn này xử lý vấn đề lấy ra danh sách thẻ dịch vụ đã mua
  const onSelectOpenBuyService = async (idCustomer?: number) => {
    if (!idCustomer) return;

    setIsLoadingBuyService(true);

    const response = await BoughtServiceService.getByCustomerId(idCustomer);

    if (response.code === 0) {
      const dataOption = (response.result || []).sort((a, b) => a.totalTreatment - b.totalTreatment);

      setListBuyService([
        ...(dataOption.length > 0
          ? dataOption.map((item) => {
              return {
                value: item.id,
                serviceId: item.serviceId,
                label: item.serviceName,
                avatar: item.serviceAvatar,
                isCombo: item.isCombo,
                treatmentNum: item.treatmentNum,
                totalTreatment: item.totalTreatment + 1,
                serviceNumber: item.serviceNumber,
                cardNumber: item.cardNumber,
              };
            })
          : []),
      ]);

      const takeDetailService = dataOption.find(
        (item) => (item.serviceNumber && item.serviceNumber == data?.serviceNumber) || (item.cardNumber && item.cardNumber == data?.cardNumber)
      );

      if (takeDetailService) {
        setDetailService({
          value: takeDetailService?.id,
          serviceId: takeDetailService.serviceId,
          label: takeDetailService.serviceName,
          avatar: takeDetailService.serviceAvatar,
          isCombo: takeDetailService.isCombo,
          treatmentNum: takeDetailService.treatmentNum,
          totalTreatment: takeDetailService.totalTreatment,
          serviceNumber: data?.serviceNumber ? data?.serviceNumber : takeDetailService.serviceNumber,
          cardNumber: data?.cardNumber ? data?.cardNumber : takeDetailService.cardNumber,
        });
      }
    }

    setIsLoadingBuyService(false);
  };

  useEffect(() => {
    if ((data?.customerId || idCustomer) && onShow) {
      onSelectOpenBuyService(data?.customerId || idCustomer);
    }
  }, [data, onShow, idCustomer]);

  const formatOptionLabelBuyService = ({ label, avatar }) => {
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
    setCheckFieldService(false);
    setDetailService(e);
  };

  useEffect(() => {
    if (detailService) {
      setFormData({
        ...formData,
        values: {
          ...formData?.values,
          serviceId: detailService.serviceId,
          serviceNumber: detailService.serviceNumber,
          cardNumber: detailService.cardNumber,
          treatmentTh: detailService.totalTreatment || 1,
        },
      });
    }
  }, [detailService]);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
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
  }

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

  const handleChangeValueEmployee = (e) => {
    setCheckFieldEmployee(false);
    setDetailEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };

  const getDetailEmployee = async () => {
    setIsLoadingEmployee(true);
    const response = await EmployeeService.detail(data?.employeeId);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      };

      setDetailEmployee(detailData);
    }
    setIsLoadingEmployee(false);
  };

  useEffect(() => {
    if (data?.employeeId && onShow) {
      getDetailEmployee();
    }
  }, [data?.employeeId, onShow]);

  const validations: IValidation[] = [
    {
      name: "treatmentStart",
      rules: "required",
    },
    {
      name: "treatmentEnd",
      rules: "required",
    },
  ];

  // lấy thông tin ngày bắt đầu tiếp nhận, và ngày cuối cùng tiếp nhận
  const startDay = moment(formData.values.treatmentStart).format("DD/MM/YYYY HH:mm");
  const endDay = moment(formData.values.treatmentEnd).format("DD/MM/YYYY HH:mm");

  const listField = useMemo(
    () =>
      [
        {
          name: "customerId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="customerId"
              name="customerId"
              label="Khách hàng"
              options={[]}
              fill={true}
              value={detailCustomer}
              required={true}
              onChange={(e) => handleChangeValueCustomer(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn khách hàng"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionCustomer}
              formatOptionLabel={formatOptionLabelCustomer}
              error={checkFieldCustomer}
              message="Khách hàng không được bỏ trống"
              isLoading={data?.customerId ? isLoadingCustomer : null}
            />
          ),
        },
        {
          label: "Số điện thoại khách hàng",
          name: "customerPhone",
          type: "text",
          fill: true,
          disabled: true,
        },
        {
          name: "serviceId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="serviceId"
              name="serviceId"
              label="Dịch vụ"
              options={[]}
              fill={true}
              value={detailService}
              required={true}
              onChange={(e) => handleChangeValueService(e)}
              isAsyncPaginate={true}
              disabled={!detailCustomer}
              isFormatOptionLabel={true}
              placeholder="Chọn dịch vụ"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionService}
              // formatOptionLabel={formatOptionLabelService}
              error={checkFieldService}
              message="Dịch vụ không được bỏ trống"
              isLoading={data?.serviceId ? isLoadingBuyService : null}
            />
          ),
        },
        {
          name: "treatmentTh",
          type: "custom",
          snippet: (
            <NummericInput
              label="Buổi điều trị thứ"
              name="treatmentTh"
              value={formData?.values?.treatmentTh}
              placeholder="Nhập số buổi"
              fill={true}
              warning={formData?.values?.treatmentTh > detailService?.treatmentNum}
              messageWarning="Đã vượt quá số buổi điều trị"
              disabled={true}
            />
          ),
        },
        {
          label: "Bắt đầu",
          name: "treatmentStart",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập ngày bắt đầu",
          hasSelectTime: true,
          isWarning: startDay > endDay,
          messageWarning: "Ngày bắt đầu nhỏ hơn ngày kết thúc",
        },
        {
          label: "Kết thúc",
          name: "treatmentEnd",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          required: true,
          placeholder: "Nhập ngày kết thúc",
          hasSelectTime: true,
          isWarning: endDay < startDay,
          messageWarning: "Ngày kết thúc lớn hơn ngày bắt đầu",
        },
        {
          label: "Nội dung thực hiện",
          name: "procDesc",
          type: "textarea",
          fill: true,
        },
        {
          name: "uploadImage",
          type: "custom",
          snippet: (
            <div className="upload__img--after--before">
              <FileUpload label="Ảnh trước thực hiện" type="prevProof" name="prevProof" formData={formData} setFormData={setFormData} />
              <FileUpload label="Ảnh sau thực hiện" type="afterProof" name="afterProof" formData={formData} setFormData={setFormData} />
            </div>
          ),
        },
        {
          name: "employeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="employeeId"
              name="employeeId"
              label="Nhân viên thực hiện"
              options={[]}
              fill={true}
              value={detailEmployee}
              required={true}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn nhân viên"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              error={checkFieldEmployee}
              message="Nhân viên không được bỏ trống"
              isLoading={data?.employeeId ? isLoadingEmployee : null}
            />
          ),
        },
        {
          label: "Lưu ý thêm",
          name: "note",
          type: "text",
          fill: true,
        },
        {
          label: "Thời gian thực hiện tiếp theo",
          name: "scheduleNext",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập thời gian thực hiện tiếp theo",
          hasSelectTime: true,
        },
      ] as IFieldCustomize[],
    [
      detailCustomer,
      detailEmployee,
      listBuyService,
      checkFieldService,
      isLoadingBuyService,
      formData,
      checkFieldEmployee,
      checkFieldCustomer,
      isLoadingCustomer,
      isLoadingEmployee,
      detailService,
      data,
      startDay,
      endDay,
      data,
      formData?.values,
    ]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, [...listField]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (detailCustomer === null) {
      setCheckFieldCustomer(true);
      return;
    }

    if (detailService == null) {
      setCheckFieldService(true);
      return;
    }

    if (detailEmployee === null) {
      setCheckFieldEmployee(true);
      return;
    }

    setIsSubmit(true);

    const body: ITreatmentHistoryRequestModel[] = [
      {
        ...(formData.values as ITreatmentHistoryRequestModel),
        ...(data ? { id: data.id } : {}),
      },
    ];

    const response = await TreatmentHistoryService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} lịch điều trị thành công`, "success");
      setDetailCustomer(null);
      setListBuyService([]);
      setDetailEmployee(null);
      setDetailService(null);
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDetailCustomer(null);
    setListBuyService([]);
    setDetailEmployee(null);
    setDetailService(null);
    setIsLoadingBuyService(false);
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
              startDay > endDay ||
              endDay < startDay ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, startDay, endDay]
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
        handClearForm();
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
        className="modal-add-treament-history"
      >
        <form className="form-treament-history-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} lịch sử điều trị`}
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setDetailCustomer(null);
              !isSubmit && setDetailEmployee(null);
              !isSubmit && setDetailService(null);
              !isSubmit && setListBuyService([]);
            }}
          />
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
