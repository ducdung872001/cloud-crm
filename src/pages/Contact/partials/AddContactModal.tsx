/* eslint-disable prefer-const */
import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { AddContactModalProps } from "model/contact/PropsModel";
import { IContactFilterRequest, IContactRequest } from "model/contact/ContactRequestModel";
import ContactService from "services/ContactService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import Input from "components/input/input";
import Radio from "components/radio/radio";
import ContactAttributeService from "services/ContactAttributeService";
import ContactExtraInfoService from "services/ContactExtraInfoService";
import { convertToId } from "reborn-util";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import Checkbox from "components/checkbox/checkbox";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import RadioList from "components/radio/radioList";
import moment from "moment";
import { Parser } from "formula-functionizer";
import { validateEmail } from "reborn-validation";
import "./AddContactModal.scss";
import { EMAIL_REGEX, PHONE_REGEX, PHONE_REGEX_NEW } from "utils/constant";
import EmployeeService from "services/EmployeeService";
import CheckboxList from "components/checkbox/checkboxList";
import ContactPipelineService from "services/ContactPipelineService";
import { IContractPipelineResponse } from "model/contractPipeline/ContractPipelineResponseModel";
import ContactStatusService from "services/ContactStatusService";
import { IContactStatusResponse } from "model/contactStatus/ContactStatusResponseModel";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import CustomerService from "services/CustomerService";
import { ContextType, UserContext } from "contexts/userContext";
import ImageThirdGender from "assets/images/third-gender.png";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import SelectUrlCustom from "components/selectUrlCustom/selectUrlCustom";

export default function AddContactModal(props: AddContactModalProps) {
  const { onShow, onHide, data, idCustomer } = props;
  console.log("data in modal contact >>>>", data);

  const parser = new Parser();
  const { dataBranch } = useContext(UserContext) as ContextType;

  const focusedElement = useActiveElement();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listPosition, setListPosition] = useState<IOption[]>(null);
  const [isLoadingPosition, setIsLoadingPosition] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [addFieldCustomer, setAddFieldCustomer] = useState<any[]>([{ id: 0, customerId: 0, customerName: "", isPrimary: 1 }]);
  const [validateCustomer, setValidateCustomer] = useState<any[]>([]);
  const [contactExtraInfos, setContactExtraInfos] = useState<any>([]);
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);

  const [listEmail, setListEmail] = useState<IOption[]>(null);
  const [addFieldEmail, setAddFieldEmail] = useState<any[]>([{ email: "", emailType: 1, isPrimary: 1, item_id: 0 }]);
  const [mapContactAttribute, setMapContactAttribute] = useState<any>(null);
  const [employeeIdDefault, setEmployeeIdDefault] = useState(null);
  const [detailPipeline, setDetailPipeline] = useState(null);
  const [validateFieldPipeline, setValidateFieldPipeline] = useState<boolean>(false);
  const [detailStatus, setDetailStatus] = useState(null);
  const [validateFieldStatus, setValidateFieldStatus] = useState<boolean>(false);

  const getDetailCustomer = async (id: number) => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      const changeResult = {
        id: 0,
        customerId: result.id,
        customerName: result.name,
        isPrimary: 1,
      };

      setAddFieldCustomer([changeResult]);
    }

    setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (idCustomer && onShow) {
      getDetailCustomer(idCustomer);
    }
  }, [idCustomer, onShow]);

  const [lstCoordinator, setLstCoordinator] = useState([]);
  //! đoạn này xử lý vấn đề call employee init để lấy ra người phụ trách
  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();

    if (response.code == 0) {
      const result = response.result;
      onSelectOpenEmployee();
      setEmployeeIdDefault(result.id);
      setDetailEmployee({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        departmentName: result.departmentName,
        branchName: result.branchName,
      });
    }
  };

  const getDetailContact = async (id: number) => {
    const response = await ContactService.detail(id);

    if (response.code == 0) {
      const result = response.result;
      if (result?.lstCoordinator && result?.lstCoordinator.length > 0) {
        const newLstCoordinator = result?.lstCoordinator?.map((item) => {
          return {
            value: item.id,
            label: item.name,
            avatar: item.avatar,
            departmentName: item.departmentName,
            branchName: item.branchName,
          };
        });
        setLstCoordinator(newLstCoordinator || []);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow && !data) {
      getDetailEmployeeInfo();
    }
    if (onShow && data) {
      getDetailContact(data?.id);
      if (data.employeeId) {
        setDetailEmployee({ value: data.employeeId, label: data.employeeName });
      }
    }
  }, [onShow, data]);

  const onSelectOpenPosition = async () => {
    if (!listPosition || listPosition.length === 0) {
      setIsLoadingPosition(true);
      const dataOption = await SelectOptionData("positionId");

      if (dataOption) {
        setListPosition([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingPosition(false);
    }
  };

  useEffect(() => {
    if (data?.positionId) {
      onSelectOpenPosition();
    }

    if (data?.positionId == null) {
      setListPosition([]);
    }
  }, [data]);

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId", { status: 1 });

      if (dataOption) {
        setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  const onSelectOpenContract = async () => {
    if (!listContract || listContract.length === 0) {
      setIsLoadingContract(true);
      const dataOption = await SelectOptionData("contractId");

      if (dataOption) {
        setListContract([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingContract(false);
    }
  };

  const onSelectOpenContact = async () => {
    if (!listContact || listContact.length === 0) {
      setIsLoadingContact(true);
      const dataOption = await SelectOptionData("contactId");

      if (dataOption) {
        setListContact([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingContact(false);
    }
  };

  useEffect(() => {
    if (data?.employeeId) {
      onSelectOpenEmployee();
    }

    if (data?.employeeId == null) {
      setListEmployee([]);
    }
  }, [data]);

  const onSelectOpenCustomer = async () => {
    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingCustomer(true);
      const dataOption = await SelectOptionData("customerId");

      if (dataOption) {
        setListCustomer([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomer(false);
    }
  };

  useEffect(() => {
    if (data?.customers) {
      onSelectOpenCustomer();
    }

    if (data?.customers == null) {
      setListCustomer([]);
    }
  }, [data]);

  const getContactExtraInfos = async () => {
    const response = await ContactExtraInfoService.list(data?.id);
    setContactExtraInfos(response.code === 0 ? response.result : []);
  };

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        phone: data?.phone ?? "",
        positionId: data?.positionId ?? "",
        employeeId: data?.employeeId ?? employeeIdDefault ?? "",
        note: data?.note ?? "",
        avatar: data?.avatar ?? "",
        pipelineId: data?.pipelineId ?? "",
        statusId: data?.statusId ?? "",
        cardvisitFront: data?.cardvisitFront ?? "",
        cardvisitBack: data?.cardvisitBack ?? "",
        department: data?.department ?? "",
        coordinators: data?.coordinators ?? "[]",
        primaryCustomerId: data?.primaryCustomerId ?? null,
      } as IContactRequest),
    [data, onShow, employeeIdDefault]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    //Lấy thông tin contactExtraInfos
    if (onShow) {
      getContactAttributes();
    }

    //Lấy trước các thông tin sau
    if (data?.id) {
      onSelectOpenEmployee();
      onSelectOpenContract();
      onSelectOpenCustomer();
      onSelectOpenContact();
    }

    //Lấy thông tin customerExtraInfos (dành cho khách hàng doanh nghiệp)
    if (data?.id && onShow) {
      getContactExtraInfos();
    }
  }, [data, onShow]);

  const getContactAttributes = async () => {
    if (!mapContactAttribute || mapContactAttribute.length === 0) {
      const response = await ContactAttributeService.listAll();
      if (response.code === 0) {
        const dataOption = response.result;
        setMapContactAttribute(dataOption || {});
      }
    }
  };

  useEffect(() => {
    if (data && data.emails && JSON.parse(data.emails)) {
      const emailData = JSON.parse(data.emails);
      setAddFieldEmail(emailData?.length > 0 ? emailData : [emailData]);
    }

    if (data && data.customers && JSON.parse(data.customers)) {
      const customerData = JSON.parse(data.customers);
      setAddFieldCustomer(customerData);
    }
    if (data) {
      setDetailPipeline(data.pipelineId ? { value: data.pipelineId, label: data.pipelineName } : null);
      setDetailStatus(data.statusId ? { value: data.statusId, label: data.statusName } : null);
    }
  }, [data, onShow]);

  /// tìm kiếm vòng đời
  const loadOptionPipeline = async (search, loadedOptions, { page }) => {
    const param: IContactFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await ContactPipelineService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IContractPipelineResponse) => {
                return {
                  value: item.id,
                  label: item.name,
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

  //? đoạn này xử lý vấn đề thay đổi loại hợp đồng
  const handleChangeValuePipeline = (e) => {
    setValidateFieldPipeline(false);
    setDetailPipeline(e);
    setFormData({ ...formData, values: { ...formData?.values, pipelineId: e.value } });
  };

  const loadOptionStatus = async (search, loadedOptions, { page }) => {
    const response = await ContactStatusService.list(+formData?.values?.pipelineId);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IContactStatusResponse) => {
                return {
                  value: item.id,
                  label: item.name,
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

  //? đoạn này xử lý vấn đề thay đổi trạng thái vòng đời
  const handleChangeValueStatus = (e) => {
    setValidateFieldStatus(false);
    setDetailStatus(e);
    setFormData({ ...formData, values: { ...formData?.values, statusId: e.value } });
  };

  //Người phụ trách
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
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
                  departmentName: item.departmentName,
                  branchName: item.branchName,
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

  const handleChangeValueEmployee = (e) => {
    setDetailEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };

  const formatOptionLabelEmployee = ({ label, avatar, departmentName, branchName }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div>
          <div>{label}</div>
          {departmentName ? (
            <div>
              <span style={{ fontSize: 10, fontWeight: "200", marginTop: 3 }}>{`${departmentName}`}</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  /// tìm kiếm người phối hợp
  const loadOptionCoordinators = async (search, loadedOptions, { page }) => {
    const param: IContactFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IContractPipelineResponse) => {
                return {
                  value: item.id,
                  label: item.name,
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

  const handleChangeValueCoordinators = (e) => {
    setLstCoordinator(e);
    const newLstCoordinator = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, coordinators: JSON.stringify(newLstCoordinator) } });
  };

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "phone",
      rules: "required|regex",
    },
    // {
    //   name: "positionId",
    //   rules: "required",
    // },
    // {
    //   name: "employeeId",
    //   rules: "required",
    // },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên liên hệ",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Số điện thoại",
          name: "phone",
          type: "text",
          fill: true,
          required: true,
          regex: new RegExp(PHONE_REGEX_NEW),
          messageErrorRegex: "Số điện thoại không đúng định dạng",
        },
        {
          label: "Chức vụ",
          name: "positionId",
          type: "select",
          fill: true,
          options: listPosition,
          onMenuOpen: onSelectOpenPosition,
          isLoading: isLoadingPosition,
          required: false,
        },
        {
          label: "Phòng ban",
          name: "department",
          type: "text",
          fill: true,
          required: false,
        },
        // {
        //   label: "Người phụ trách",
        //   name: "employeeId",
        //   type: "select",
        //   fill: true,
        //   options: listEmployee,
        //   onMenuOpen: onSelectOpenEmployee,
        //   isLoading: isLoadingEmployee,
        //   required: false,
        // },

        {
          name: "employeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="employeeId"
              name="employeeId"
              label="Người phụ trách"
              fill={true}
              required={false}
              // error={validateFieldPipeline}
              // message="Loại hợp đồng không được bỏ trống"
              options={[]}
              value={detailEmployee}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn người phụ trách"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
            />
          ),
        },

        {
          name: "coordinators",
          type: "custom",
          snippet: (
            <SelectCustom
              id="coordinators"
              name="coordinators"
              label="Người phối hợp"
              fill={true}
              required={false}
              isMulti={true}
              // error={validateFieldPipeline}
              // message="Loại hợp đồng không được bỏ trống"
              options={[]}
              value={lstCoordinator}
              onChange={(e) => handleChangeValueCoordinators(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn người phối hợp"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
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
    [listPosition, isLoadingPosition, listEmployee, isLoadingEmployee, lstCoordinator, detailEmployee, formData]
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

    // const newArray = addFieldCustomer.filter(el => !el.customerId)
    // if (newArray.length > 0) {
    //   const arrayFieldCustomer = []
    //   newArray.map((item) => {
    //     arrayFieldCustomer.push(item.id)
    //   })
    //   setValidateCustomer(arrayFieldCustomer)
    // }

    // if (newArray.length > 0) {
    //   return
    // }

    ///check validate các trường động
    if (
      mapContactAttribute &&
      Object.entries(mapContactAttribute) &&
      Array.isArray(Object.entries(mapContactAttribute)) &&
      Object.entries(mapContactAttribute).length > 0
    ) {
      const newArray = Object.entries(mapContactAttribute);
      let checkArray = [];

      newArray.map((lstContactAttribute: any, key: number) => {
        (lstContactAttribute[1] || []).map((item) => {
          if (item.required === 1 && item.parentId !== 0) {
            checkArray.push(item);
          }
        });
      });

      if (checkArray.length > 0) {
        if (contactExtraInfos.length === 0) {
          showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
          return;
        } else {
          let check = false;
          checkArray.map((i) => {
            const index = contactExtraInfos.findIndex((el) => el.attributeId === i.id);
            if (index === -1) {
              check = true;
            }
          });

          if (check) {
            showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
            return;
          }
        }
      }
    }

    setIsSubmit(true);

    const body: IContactRequest = {
      ...(formData.values as IContactRequest),
      ...(data ? { id: data.id } : {}),
      customers: JSON.stringify(addFieldCustomer),
      emails: JSON.stringify(addFieldEmail),
      contactExtraInfos: contactExtraInfos,
    };

    const response = await ContactService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} liên hệ thành công`, "success");
      clearForm(true);
    } else {
      if (response.error) {
        if (response.error.includes("Số điện thoại đã tồn tại")) {
          setFormData((prevState) => ({
            ...prevState,
            errors: {
              ...prevState.errors,
              phone: response.error,
            },
          }));
        }
        showToast(response.error, "error");
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
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
              !isDifferenceObj(formData.values, values) ? clearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              // !isDifferenceObj(formData.values, values) ||
              // validateCustomer.length > 0 ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, validateCustomer]
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
        clearForm(false);
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
                  label: `${item.name} - ${item.phoneMasked}`,
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

  //! đoạn này xử lý vấn đề lấy giá trị của customerId khi thêm nhiều
  const handleChangeValueCustomerItem = (e, idx, item) => {
    const value = e.value;
    if (value) {
      const arrayFieldCustomer = validateCustomer.filter((el) => el !== item.id);
      // setValidateCustomer(arrayFieldCustomer)
    } else {
      // setValidateCustomer(oldArray => [...oldArray, id])
    }
    if (item.isPrimary === 1) {
      setFormData({ ...formData, values: { ...formData?.values, primaryCustomerId: e.value } });
    }

    setAddFieldCustomer((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, customerId: value, customerName: e.label };
        }
        return obj;
      })
    );
  };

  const handleChangeValueCustomerItemC = (e, contactAttribute) => {
    const value = e.value;
    updateContactAttribute(contactAttribute.id, value);
  };

  //! xóa đi 1 item customer
  const handleRemoveItemCustomer = (idx, id) => {
    const result = [...addFieldCustomer];
    result.splice(idx, 1);

    if (result.length > 0 && addFieldCustomer[idx].isPrimary === 1) {
      result[idx - 1].isPrimary = 1;
      setFormData({ ...formData, values: { ...formData?.values, primaryCustomerId: result[idx - 1].customerId } });
    }

    setAddFieldCustomer(result);

    const resultFieldCustomer = validateCustomer.filter((el) => el !== id);
    setValidateCustomer(resultFieldCustomer);
  };

  //! đoạn này xử lý vấn đề lấy giá trị của email khi thêm nhiều
  const [errorEmailList, setErrorEmailList] = useState([]);

  const handleChangeValueEmailItem = (e, idx, item_id) => {
    const value = e.target.value;

    if (validateEmail(value)) {
      const newArray = errorEmailList.filter((el) => el !== item_id);
      setErrorEmailList(newArray);
    } else {
      setErrorEmailList((oldArray) => [...oldArray, item_id]);
    }

    setAddFieldEmail((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, email: value };
        }
        return obj;
      })
    );
  };

  //! đoạn này xử lý vấn đề lấy giá trị của loại email khi thêm nhiều
  const handleChangeValueEmailTypeItem = (e, idx) => {
    const value = e.value;

    setAddFieldEmail((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, emailType: value };
        }
        return obj;
      })
    );
  };

  //! xóa đi 1 item email
  const handleRemoveItemEmail = (idx, item_id) => {
    const newArray = errorEmailList.filter((el) => el !== item_id);
    setErrorEmailList(newArray);

    let result = [...addFieldEmail];
    result.splice(idx, 1);

    if (result.length > 0 && addFieldEmail[idx].isPrimary === 1) {
      result[idx - 1].isPrimary = 1;
    }

    setAddFieldEmail(result);
  };

  //! đoạn này gom hết những trường customers mình mới add vào rồi gửi đi
  // useEffect(() => {
  //   if (addFieldCustomer.length > 0) {
  //     setFormData({ ...formData, values: { ...formData?.values, customers: JSON.stringify(addFieldCustomer) } });
  //   } else {
  //     setFormData({ ...formData, values: { ...formData?.values, customers: JSON.stringify([]) } });
  //   }
  // }, [addFieldCustomer]);

  //! đoạn này gom hết những trường emails mình mới add vào rồi gửi đi
  // useEffect(() => {
  //   if (addFieldEmail.length > 0) {
  //     setFormData({ ...formData, values: { ...formData?.values, emails: JSON.stringify(addFieldEmail) } });
  //   } else {
  //     setFormData({ ...formData, values: { ...formData?.values, emails: JSON.stringify([]) } });
  //   }
  // }, [addFieldEmail]);

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  const handleSelectPrimaryEmail = (idx) => {
    let newArray = [...addFieldEmail];
    const index = addFieldEmail.findIndex((el) => el.isPrimary === 1);

    if (index !== -1) {
      newArray[index].isPrimary = 0;
    }
    setAddFieldEmail(newArray);

    setAddFieldEmail((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, isPrimary: 1 };
        }
        return obj;
      })
    );
  };

  const handleSelectPrimaryCustomer = (idx, item) => {
    let newArray = [...addFieldCustomer];
    const index = addFieldCustomer.findIndex((el) => el.isPrimary === 1);

    if (index !== -1) {
      newArray[index].isPrimary = 0;
    }
    setAddFieldCustomer(newArray);

    setAddFieldCustomer((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, isPrimary: 1 };
        }
        return obj;
      })
    );
    setFormData({ ...formData, values: { ...formData?.values, primaryCustomerId: item.customerId } });
  };

  const getContactAttributeValue = (attributeId) => {
    let attributeValue = "";
    (contactExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return attributeValue;
  };

  const updateContactMultiselectAttribute = (attributeId, e) => {
    let attributeValue = e ? e.split(",") : [];
    updateContactAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const updateContactAttribute = (attributeId, attributeValue) => {
    let contactId = data?.id || 0;

    let found = false;
    (contactExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        item.contactId = contactId;
        found = true;
      }
    });

    if (!found) {
      let item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      item.contactId = contactId;
      contactExtraInfos[contactExtraInfos.length] = item;
    }

    setContactExtraInfos([...contactExtraInfos]);

    // console.log(contactExtraInfos);
    setFormData({ ...formData, values: { ...formData?.values, timestamp: new Date().getTime() } });
  };

  const getDecimalScale = (attributes) => {
    attributes = attributes ? JSON.parse(attributes) : {};
    let numberFormat = attributes?.numberFormat || "";
    if (numberFormat.endsWith(".#")) {
      return 1;
    }

    if (numberFormat.endsWith(".##")) {
      return 2;
    }

    if (numberFormat.endsWith(".###")) {
      return 3;
    }

    return 0;
  };

  const handleChangeValueEmployeeItem = (e, contactAttribute) => {
    const value = e.value;
    updateContactAttribute(contactAttribute.id, value);
  };

  const handleChangeValueContactItem = (e, contactAttribute) => {
    const value = e.value;
    updateContactAttribute(contactAttribute.id, value);
  };

  /**
   * Hiển thị giá trị theo công thức
   * @param attributes
   * @param isFormula
   */
  const getContactAttributeFormula = (attributes) => {
    let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attrObj = {};
    (contactExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        attrObj["contactAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });

    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  /**
   * Trả về loại control theo kiểu dữ liệu tương ứng
   */
  const getControlByType = (contactAttribute) => {
    let CustomControl = (
      <Input
        id={`Id${contactAttribute.id}`}
        label={contactAttribute.name}
        fill={true}
        value={getContactAttributeValue(contactAttribute.id)}
        onChange={(e) => updateContactAttribute(contactAttribute.id, e.target.value)}
        placeholder={`Nhập ${contactAttribute.name.toLowerCase()}`}
        required={!!contactAttribute.required}
      />
    );

    switch (contactAttribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={contactAttribute.name}
            name={contactAttribute.name}
            value={getContactAttributeValue(contactAttribute.id)}
            placeholder={`Nhập ${contactAttribute.name.toLowerCase()}`}
            fill={true}
            required={!!contactAttribute.required}
            readOnly={!!contactAttribute.readonly}
            onChange={(e) => updateContactAttribute(contactAttribute.id, e.target.value)}
            maxLength={459}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={contactAttribute.name}
            name={contactAttribute.name}
            fill={true}
            required={!!contactAttribute.required}
            value={getContactAttributeValue(contactAttribute.id)}
            thousandSeparator={true}
            placeholder={`Nhập ${contactAttribute.name.toLowerCase()}`}
            decimalScale={getDecimalScale(contactAttribute.attributes)}
            onChange={(e) => {
              const value = e.target.value;
              let valueNum = value?.replace(/,/g, "");
              updateContactAttribute(contactAttribute.id, valueNum);
            }}
          />
        );
        break;
      case "dropdown":
        CustomControl = (
          <SelectCustom
            name={contactAttribute.name}
            label={contactAttribute.name}
            fill={true}
            required={!!contactAttribute.required}
            readOnly={!!contactAttribute.readonly}
            // error={validateFieldPipeline}
            // message="Loại hợp đồng không được bỏ trống"
            options={contactAttribute.attributes ? JSON.parse(contactAttribute.attributes) : []}
            value={getContactAttributeValue(contactAttribute.id)}
            onChange={(e) => {
              updateContactAttribute(contactAttribute.id, e.value);
            }}
            placeholder={`Nhập ${contactAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "multiselect":
        let attris = getContactAttributeValue(contactAttribute.id);
        CustomControl = (
          <CheckboxList
            title={contactAttribute.name}
            required={!!contactAttribute.required}
            disabled={!!contactAttribute.readonly}
            options={contactAttribute.attributes ? JSON.parse(contactAttribute.attributes) : []}
            value={attris ? JSON.parse(attris).join(",") : ""}
            onChange={(e) => {
              updateContactMultiselectAttribute(contactAttribute.id, e);
            }}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            checked={!!getContactAttributeValue(contactAttribute.id)}
            label={contactAttribute.name}
            onChange={(e) => {
              updateContactAttribute(contactAttribute.id, e.target.checked);
            }}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={contactAttribute.name}
            title={contactAttribute.name}
            options={contactAttribute.attributes ? JSON.parse(contactAttribute.attributes) : []}
            value={getContactAttributeValue(contactAttribute.id)}
            onChange={(e) => {
              updateContactAttribute(contactAttribute.id, e.target.value);
            }}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={contactAttribute.name}
            name={contactAttribute.name}
            fill={true}
            value={getContactAttributeValue(contactAttribute.id)}
            onChange={(e) => {
              const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
              updateContactAttribute(contactAttribute.id, newDate);
            }}
            placeholder={`Nhập ${contactAttribute.name.toLowerCase()}`}
            required={!!contactAttribute.required}
            readOnly={!!contactAttribute.readonly}
            iconPosition="left"
            icon={<Icon name="Calendar" />}
            isMaxDate={false}
            // error={validateFieldSignDate}
            // message={`Vui lòng chọn ngày ký`}
          />
        );
        break;
      case "lookup":
        let attrs = contactAttribute.attributes ? JSON.parse(contactAttribute.attributes) : {};
        console.log("contactAttribute lookup =>", contactAttribute);
        console.log("contactAttribute lookup 2 =>", contactExtraInfos);

        //1. Trường hợp là customer (khách hàng)
        //2. Trường hợp là employee (nhân viên)
        //3. Trường hợp là contract (hợp đồng)
        //4. Trường hợp là contact (người liên hệ)
        switch (attrs?.refType) {
          case "customer":
            CustomControl = (
              <SelectCustom
                label={contactAttribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!contactAttribute.required}
                readOnly={!!contactAttribute.readonly}
                value={+getContactAttributeValue(contactAttribute.id)}
                placeholder={`Chọn ${contactAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItemC(e, contactAttribute)}
              />
            );
            break;
          case "employee":
            CustomControl = (
              <SelectCustom
                label={contactAttribute.name}
                options={listEmployee || []}
                onMenuOpen={onSelectOpenEmployee}
                isLoading={isLoadingEmployee}
                fill={true}
                required={!!contactAttribute.required}
                readOnly={!!contactAttribute.readonly}
                value={+getContactAttributeValue(contactAttribute.id)}
                placeholder={`Chọn ${contactAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueEmployeeItem(e, contactAttribute)}
              />
            );
            break;
          case "contract":
            CustomControl = (
              <SelectCustom
                label={contactAttribute.name}
                options={listContract || []}
                onMenuOpen={onSelectOpenContract}
                isLoading={isLoadingContract}
                fill={true}
                required={!!contactAttribute.required}
                readOnly={!!contactAttribute.readonly}
                value={+getContactAttributeValue(contactAttribute.id)}
                placeholder={`Chọn ${contactAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContactItem(e, contactAttribute)}
              />
            );
            break;
          case "contact":
            CustomControl = (
              <SelectCustom
                label={contactAttribute.name}
                options={listContact || []}
                onMenuOpen={onSelectOpenContact}
                isLoading={isLoadingContact}
                fill={true}
                required={!!contactAttribute.required}
                readOnly={!!contactAttribute.readonly}
                value={+getContactAttributeValue(contactAttribute.id)}
                placeholder={`Chọn ${contactAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContactItem(e, contactAttribute)}
              />
            );
            break;
          default:
            CustomControl = (
              <SelectCustom
                label={contactAttribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!contactAttribute.required}
                readOnly={!!contactAttribute.readonly}
                value={+getContactAttributeValue(contactAttribute.id)}
                placeholder={`Chọn ${contactAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItemC(e, contactAttribute)}
              />
            );
        }
        break;
      case "formula":
        //Công thức được lấy từ trường động và trường tĩnh
        //{contract.dealValue + contactAttribute.xyz} => sẽ cần parser từ 2 đối tượng là contract và contactAttribute

        //Chỉ hiển thị chứ không lưu giá trị (nếu thêm mới thì không hiển thị?, sửa mới hiển thị)
        CustomControl = (
          <Input
            id={`Id${contactAttribute.id}`}
            label={contactAttribute.name}
            fill={true}
            value={getContactAttributeFormula(contactAttribute?.attributes)}
            placeholder={`Nhập ${contactAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );
        break;
    }

    return CustomControl;
  };

  const clearForm = (acc) => {
    onHide(acc);
    setAddFieldEmail([{ email: "", emailType: 1, isPrimary: 1, item_id: 0 }]);
    setAddFieldCustomer([{ id: 0, customerId: 0, customerName: "", isPrimary: 1 }]);
    setValidateCustomer([]);
    setErrorEmailList([]);
    setContactExtraInfos([]);
    setDetailPipeline(null);
    setValidateFieldPipeline(false);
    setDetailStatus(null);
    setValidateFieldStatus(false);
    setDetailEmployee(null);
    setLstCoordinator([]);
  };

  console.log("formData =>", formData);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="lg"
        toggle={() => {
          if (!isSubmit) {
            clearForm(false);
          }
        }}
        className="modal-add-contact"
      >
        <form className="form-contact" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} liên hệ`}
            toggle={() => {
              if (!isSubmit) {
                clearForm(false);
              }
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              <label className="label-title">Thông tin cơ bản</label>

              <div className="box-avatar_card-visit">
                <FileUpload label="Ảnh đại diện" type="avatar" name="avatar" formData={formData} setFormData={setFormData} />
                <FileUpload label="Card visit mặt trước" type="cardvisitFront" name="cardvisitFront" formData={formData} setFormData={setFormData} />
                <FileUpload label="Card visit mặt sau" type="cardvisitBack" name="cardvisitBack" formData={formData} setFormData={setFormData} />
              </div>

              {listField.map((field, index) =>
                field.label === "Tên liên hệ" || field.label === "Số điện thoại" ? (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                    formData={formData}
                  />
                ) : null
              )}

              {/* Thông tin email người liên hệ */}
              <div className="list__email">
                {addFieldEmail.map((item, idx) => {
                  return (
                    <div key={idx} className="email__item_contact">
                      <div className="form-box">
                        {addFieldEmail && addFieldEmail.length > 1 ? (
                          <span className="check-email">
                            <Tippy content="Chọn làm Email chính" delay={[100, 0]} animation="scale-extreme">
                              <span className="icon-add" onClick={() => handleSelectPrimaryEmail(idx)}>
                                <Radio
                                  // value={item.isPrimary}
                                  checked={item.isPrimary === 1}
                                  // defaultChecked={defaultValue && defaultValue === option.value}
                                  // name={name}
                                  disabled={true}
                                  onChange={(e) => {}}
                                  onClick={(e) => {}}
                                />
                              </span>
                            </Tippy>
                          </span>
                        ) : null}

                        {/* <div className="list-field-email"> */}
                        <div className="form-group-box">
                          <Input
                            label="Email"
                            options={listEmail || []}
                            fill={true}
                            required={false}
                            value={item.email}
                            placeholder="Nhập email"
                            onChange={(e) => handleChangeValueEmailItem(e, idx, item.item_id)}
                            error={errorEmailList.includes(item.item_id)}
                            message="Email không đúng định dạng"
                          />
                        </div>
                      </div>

                      <div className="form-box">
                        <div className="form-group-box">
                          <SelectCustom
                            label="Loại email"
                            options={[
                              { value: 1, label: "Cơ quan" },
                              { value: 2, label: "Cá nhân" },
                              { value: 3, label: "Khác" },
                            ]}
                            fill={true}
                            required={false}
                            value={item.emailType}
                            placeholder="Chọn loại email"
                            onChange={(e) => handleChangeValueEmailTypeItem(e, idx)}
                          />
                        </div>

                        {idx == 0 ? (
                          <span className="add-email">
                            <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                              <span
                                className="icon-add"
                                onClick={() => {
                                  setAddFieldEmail([
                                    ...addFieldEmail,
                                    { email: "", emailType: 1, isPrimary: 0, item_id: addFieldEmail[addFieldEmail.length - 1].item_id + 1 },
                                  ]);
                                }}
                              >
                                <Icon name="PlusCircleFill" />
                              </span>
                            </Tippy>
                          </span>
                        ) : (
                          <span className="remove-customer">
                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                              <span className="icon-remove" onClick={() => handleRemoveItemEmail(idx, item.item_id)}>
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {listField.map((field, index) =>
                field.label === "Chức vụ" || field.label === "Phòng ban" ? (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                    formData={formData}
                  />
                ) : null
              )}

              {/* danh mục vòng đời */}
              <div className="form-group">
                <SelectCustom
                  id="pipelineId"
                  name="pipelineId"
                  label="Phân loại liên hệ"
                  fill={true}
                  required={false}
                  error={validateFieldPipeline}
                  message="Loại liên hệ không được bỏ trống"
                  options={[]}
                  value={detailPipeline}
                  onChange={(e) => handleChangeValuePipeline(e)}
                  isAsyncPaginate={true}
                  placeholder="Chọn loại liên hệ"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadOptionPipeline}
                />
              </div>

              {/* trạng thái vòng đời */}
              <div className="form-group">
                <SelectCustom
                  key={`stage_${formData?.values?.pipelineId}`}
                  id="statusId"
                  name="statusId"
                  label="Trạng thái liên hệ"
                  fill={true}
                  required={false}
                  error={validateFieldStatus}
                  message="Trạng thái liên hệ không được bỏ trống"
                  options={[]}
                  value={detailStatus}
                  onChange={(e) => handleChangeValueStatus(e)}
                  isAsyncPaginate={true}
                  placeholder="Trạng thái liên hệ"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadOptionStatus}
                  disabled={!formData?.values?.pipelineId ? true : false}
                />
              </div>

              <div className="form-group">
                <SelectUrlCustom
                  label="Chức vụ"
                  url="/adminapi/customer/list_paid"
                  // isLoadAll={true}
                  searchKey="name"
                  labelKey="name"
                  valueKey="id"
                  value={
                    formData?.values?.positionId
                      ? {
                          value: formData.values.positionId,
                          label: formData.values.positionName ?? "Đang tải...",
                        }
                      : null
                  }
                  onChange={(option) => {
                    setFormData({
                      ...formData,
                      values: {
                        ...formData?.values,
                        positionId: option?.value,
                        positionName: option?.label,
                      },
                    });
                  }}
                  fill={true}
                  placeholder="Chọn chức vụ..."
                />
              </div>

              <div className="form-group">
                <SelectUrlCustom
                  label="Chức vụ"
                  url="/adminapi/customer/list_paid"
                  // isLoadAll={true}
                  isMulti={true}
                  // maxHeight={"50px"}
                  searchKey="name"
                  labelKey="name"
                  valueKey="id"
                  value={
                    formData?.values?.positions?.map((item) => ({
                      value: item.id,
                      label: item.name,
                    })) || []
                  }
                  onChange={(options) => {
                    setFormData({
                      ...formData,
                      values: {
                        ...formData?.values,
                        // Lưu lại dạng mảng object gốc để lần sau hiển thị lại được
                        positions: options.map((opt) => ({
                          id: opt.value,
                          name: opt.label,
                        })),
                      },
                    });
                  }}
                  fill={true}
                  placeholder="Chọn các chức vụ..."
                />
              </div>

              {/* <div className="form-group">
                <SelectUrlCustom
                  label="Chọn nhân viên"
                  isMulti={true}
                  value={[
                    { value: 101, label: "Nguyễn Văn A" },
                    { value: 102, label: "Trần Thị B" },
                  ]}
                  onChange={(opts) => {
                    console.log("Danh sách đã chọn:", opts);

                    // Cách map để lưu xuống DB:
                    const ids = opts.map((o) => o.value); // [101, 102, 103]
                  }}
                  fill={true}
                />
              </div> */}

              {listField.map((field, index) =>
                field.label === "Ghi chú" ? (
                  <div style={{ width: "100%" }}>
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                      formData={formData}
                    />
                  </div>
                ) : null
              )}

              {/* Thông tin khách hàng */}
              <div className="list__customer">
                {addFieldCustomer.map((item, idx) => {
                  return (
                    <div key={idx}>
                      <div key={idx} className="customer__item">
                        {addFieldCustomer && addFieldCustomer.length > 1 ? (
                          <span className="check-email">
                            <Tippy content="Chọn làm đại diện chính" delay={[100, 0]} animation="scale-extreme">
                              <span className="icon-add" onClick={() => handleSelectPrimaryCustomer(idx, item)}>
                                <Radio
                                  // value={item.isPrimary}
                                  checked={item.isPrimary === 1}
                                  // defaultChecked={defaultValue && defaultValue === option.value}
                                  // name={name}
                                  // disabled={true}
                                  onChange={(e) => {}}
                                  onClick={() => handleSelectPrimaryCustomer(idx, item)}
                                />
                              </span>
                            </Tippy>
                          </span>
                        ) : null}
                        <div className="list-field-customer">
                          <div className="form-group">
                            <SelectCustom
                              label="Khách hàng"
                              options={[]}
                              // onMenuOpen={onSelectOpenCustomer}
                              // isLoading={isLoadingCustomer}
                              fill={true}
                              required={false}
                              onChange={(e) => handleChangeValueCustomerItem(e, idx, item)}
                              value={item.customerId ? { value: item.customerId, label: item.customerName } : null}
                              isAsyncPaginate={true}
                              isFormatOptionLabel={true}
                              placeholder="Chọn khách hàng"
                              additional={{
                                page: 1,
                              }}
                              // error={validateCustomer.includes(item.id)}
                              // message="Khách hàng không được bỏ trống"
                              loadOptionsPaginate={loadedOptionCustomer}
                              formatOptionLabel={formatOptionLabelCustomer}
                            />
                          </div>
                        </div>
                        {idx == 0 ? (
                          <span className="add-customer" style={{ marginLeft: 5 }}>
                            <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                              <span
                                className="icon-add"
                                onClick={() => {
                                  setAddFieldCustomer([
                                    ...addFieldCustomer,
                                    { id: addFieldCustomer.length, customerId: 0, customerName: "", isPrimary: 0 },
                                  ]);
                                }}
                              >
                                <Icon name="PlusCircleFill" />
                              </span>
                            </Tippy>
                          </span>
                        ) : (
                          <span className="remove-customer">
                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                              <span className="icon-remove" onClick={() => handleRemoveItemCustomer(idx, item.id)}>
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          </span>
                        )}
                      </div>

                      {/* {validateCustomer.includes(item.id) ?
                        <span style={{ color: 'var(--error-color)', fontSize: 12, marginLeft: addFieldCustomer.length > 1 ? 35 : 0 }}>
                          Khách hàng không được bỏ trống
                        </span>
                        : null
                      } */}
                    </div>
                  );
                })}
              </div>

              <label className="label-title">Giao phụ trách</label>
              {listField.map((field, index) =>
                field.name === "employeeId" || field.name === "coordinators" ? (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                    formData={formData}
                  />
                ) : null
              )}

              {/* Các trường thông tin động được hiển thị ở đây */}
              {mapContactAttribute ? (
                <div className="list__contact--attribute">
                  {Object.entries(mapContactAttribute).map((lstContactAttribute: any, key: number) => (
                    <Fragment key={key}>
                      {(lstContactAttribute[1] || []).map((contactAttribute, index: number) => (
                        <Fragment key={index}>
                          {!contactAttribute.parentId ? (
                            <label className="label-title" key={`parent_${key}`}>
                              {contactAttribute.name}
                            </label>
                          ) : null}
                          {contactAttribute.parentId ? (
                            <div
                              className={`form-group ${
                                contactAttribute.name.length >= 38 || lstContactAttribute[1].length == 2 ? "special-case" : ""
                              }`}
                              id={`Field${convertToId(contactAttribute.name)}`}
                              key={`index_${key}_${index}`}
                            >
                              {getControlByType(contactAttribute)}
                            </div>
                          ) : null}
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </div>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
