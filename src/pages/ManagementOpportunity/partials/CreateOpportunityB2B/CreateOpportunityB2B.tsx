import React, { Fragment, useState, useEffect, useMemo, useContext } from "react";
import _ from "lodash";
import { formatCurrency } from "reborn-util";
import { IAction, IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Button from "components/button/button";
import RadioList from "components/radio/radioList";
import BoxTable from "components/boxTable/boxTable";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import ServiceService from "services/ServiceService";
import ProductService from "services/ProductService";
import EmployeeService from "services/EmployeeService";
import ContactService from "services/ContactService";
import CampaignService from "services/CampaignService";
import CustomerService from "services/CustomerService";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import ImageThirdGender from "assets/images/third-gender.png";
import { ContextType, UserContext } from "contexts/userContext";
import { SystemNotification } from "components/systemNotification/systemNotification";
import "./CreateOpportunityB2B.scss";
import WorkProjectService from "services/WorkProjectService";
import ImgPushCustomer from "assets/images/img-push.png";
import AddContactModal from "pages/Contact/partials/AddContactModal";

export default function CreateOpportunityB2B(props: any) {
  const { onShow, onHide, idCustomer, takeInfoOpportunity } = props;

  const [dataRes, setDataRes] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [idResponse, setIdResponse] = useState<number>(null);

  const valuesStepOne = useMemo(
    () =>
      ({
        id: dataRes ? dataRes.id : null,
        customerId: idCustomer,
        projectId: dataRes ? dataRes.projectId : 0, // dự án
        productId: dataRes ? dataRes.productId : 0, // sản phẩm
        serviceId: dataRes ? dataRes.serviceId : 0, // dịch vụ
        contactId: dataRes ? dataRes.contactId : null, // người quyết định
        coordinators: dataRes ? dataRes.coordinators : [], // người phối hợp
      } as any),
    [onShow, idCustomer, dataRes]
  );

  const [formDataOne, setFormDataOne] = useState(valuesStepOne);

  const [detailCustomer, setDetailCustomer] = useState(null);

  useEffect(() => {
    setFormDataOne(valuesStepOne);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [valuesStepOne]);

  const [valueStepOne, setValueStepOne] = useState({
    optionChoose: "0",
    dataProduct: null,
    dataService: null,
    dataContact: null,
    dataProject: null,
    dataCoordinators: [],
  });

  const [validateStepOne, setValidateStepOne] = useState({
    validateProduct: false,
    validateService: false,
    validateContact: false,
    validateProject: false,
  });

  const getDetailCustomer = async (id: number) => {
    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDetailCustomer({
        value: result.id,
        label: result.name,
      });
    }
  };

  useEffect(() => {
    if (idCustomer && onShow) {
      getDetailCustomer(idCustomer);
    }
  }, [idCustomer, onShow]);

  // salesId, op
  //! Start xử lý sản phẩm
  const loadedOptionProduct = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ProductService.list(param);

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

  const formatOptionLabelProduct = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueProduct = (e) => {
    setValidateStepOne({ ...validateStepOne, validateProduct: false });
    setValueStepOne({ ...valueStepOne, dataProduct: e });
    setFormDataOne({ ...formDataOne, productId: e.value });
  };
  //! End xử lý sản phẩm

  //! Start xử lý dịch vụ
  const loadedOptionService = async (search, loadedOptions, { page }) => {
    const param = {
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
  };

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

  const handleChangeValueService = (e) => {
    setValidateStepOne({ ...validateStepOne, validateService: false });
    setFormDataOne({ ...formDataOne, serviceId: e.value });
    setValueStepOne({ ...valueStepOne, dataService: e });
  };
  //! End xử lý dịch vụ

  const [isLoadingOption, setIsLoadingOption] = useState<boolean>(false);

  //? Start xử lý người quyết định
  //? Start xử lý người quyết định
  const loadedOptionContact = async (search, loadedOptions, { page }) => {
    const param = {
      keyword: search,
      page: page,
      limit: 10,
      customerId: idCustomer,
    };

    setIsLoadingOption(true);

    const response = await ContactService.list(param);

    setIsLoadingOption(false);

    if (response.code === 0) {
      const dataOption = response.result.items || [];

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới người liên hệ", isShowModal: true, avatar: "custom" }] : []),
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

  const [showModalContact, setShowModalContact] = useState(false);
  const [countCheck, setCountCheck] = useState(0);
  useEffect(() => {
    if (onShow && !showModalContact) {
      setCountCheck(countCheck + 1);
      loadedOptionContact("", undefined, { page: 1 });
    }
  }, [showModalContact, onShow]);

  const formatOptionLabelContact = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar" style={avatar == "custom" ? { width: "1.8rem", height: "1.8rem" } : {}}>
          <img src={avatar == "custom" ? ImgPushCustomer : avatar ? avatar : ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueContact = (e) => {
    if (e?.isShowModal) {
      setShowModalContact(true);
    } else {
      setValidateStepOne({ ...validateStepOne, validateContact: false });
      setValueStepOne({ ...valueStepOne, dataContact: e });
      setFormDataOne({ ...formDataOne, contactId: e.value });
    }
    // if(e.type === 'contact'){
    //   setFormDataOne({ ...formDataOne, contactId: e.value});
    // } else {
    //   setFormDataOne({ ...formDataOne, employeeId: e.value, contactId: null });
    // }
  };
  //? End xử lý người quyết định
  //? End xử lý người quyết định

  const loadOptionProject = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      parentId: -1,
    };
    const response = await WorkProjectService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới dự án", isShowModal: true, avatar: "custom" }] : []),
          ...(dataOption.length > 0
            ? dataOption.map((item: any) => {
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
  const [showModalAddProject, setShowModalAddProject] = useState(false);
  const [countCheckProject, setCountCheckProject] = useState(0);
  useEffect(() => {
    if (!showModalAddProject) {
      setCountCheckProject(countCheckProject + 1);
      loadOptionProject("", undefined, { page: 1 });
    }
  }, [showModalAddProject]);

  const formatOptionLabelProject = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar" style={avatar == "custom" ? { width: "1.8rem", height: "1.8rem" } : {}}>
          <img src={avatar == "custom" ? ImgPushCustomer : avatar ? avatar : ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueProject = (e) => {
    if (e?.isShowModal) {
      setShowModalAddProject(true);
    } else {
      setValidateStepOne({ ...validateStepOne, validateProject: false });
      setValueStepOne({ ...valueStepOne, dataProject: e });
      setFormDataOne({ ...formDataOne, projectId: e.value });
    }
  };

  const [isLoadingOptionCoordinator, setIsLoadingOptionCoordinator] = useState<boolean>(false);

  //* Start xử lý người phối hợp
  const loadedOptionCoordinator = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      customerId: idCustomer,
    };

    setIsLoadingOptionCoordinator(true);

    const response = await ContactService.list(param);

    setIsLoadingOptionCoordinator(false);

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

  const formatOptionLabelCoordinator = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCoordinator = (e) => {
    const changeE = [...e].map((item) => item.value);
    setFormDataOne({ ...formDataOne, coordinators: changeE });
    setValueStepOne({ ...valueStepOne, dataCoordinators: e });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!valueStepOne.dataProduct && valueStepOne.optionChoose == "0") {
      setValidateStepOne({ ...validateStepOne, validateProduct: true });
      return;
    }

    if (!valueStepOne.dataService && valueStepOne.optionChoose == "1") {
      setValidateStepOne({ ...validateStepOne, validateService: true });
      return;
    }

    if (!valueStepOne.dataContact) {
      setValidateStepOne({ ...validateStepOne, validateContact: true });
      return;
    }

    setIsSubmit(true);

    const changeFormDataOne = {
      ...formDataOne,
      coordinators: JSON.stringify(formDataOne.coordinators),
    };

    const bodyFromOne = {
      ...changeFormDataOne,
      ...(idResponse ? { id: idResponse } : {}),
    };

    const response = await CustomerService.createOpportunity(bodyFromOne);

    if (response.code === 0) {
      const result = response.result;

      showToast(`Tạo mới cơ hội thành công`, "success");
      setIsSubmit(false);

      const data = {
        id: result.id,
        label: result.productName || result.serviceName,
        customerId: detailCustomer.customerId,
        customerName: detailCustomer.customerName,
      };

      takeInfoOpportunity(data);
      handClearForm(true);
    } else {
      const conditionMessage = "Đã tồn tại cơ hội của khách hàng";
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", response.message == conditionMessage ? "warning" : "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = (reload) => {
    reload ? onHide(true) : onHide(false);
    setValueStepOne({
      optionChoose: "0",
      dataProduct: null,
      dataService: null,
      dataContact: null,
      dataProject: null,
      dataCoordinators: [],
    });
    setValidateStepOne({
      validateProduct: false,
      validateService: false,
      validateContact: false,
      validateProject: false,
    });
    setDataRes(null);
    setIdResponse(null);
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
              handClearForm(idResponse ? true : false);
            },
          },
          {
            title: "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit ? (idResponse ? true : false) : _.isEqual(formDataOne, valuesStepOne),
            is_loading: isSubmit,
          },
          ,
        ],
      },
    }),
    [formDataOne, valuesStepOne, isSubmit, idCustomer, idResponse]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-create-opportunity-b2b"
        size={"md"}
      >
        <form className="form-create-opportunity-b2b-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Tạo cơ hội`} toggle={() => !isSubmit && handClearForm(false)} />
          <ModalBody>
            <div className="box__b-two__b">
              <div className="list-form-group">
                <div className="form-group">
                  <RadioList
                    name="option"
                    title="Chọn chào sản phẩm hoặc dịch vụ"
                    options={[
                      { value: "0", label: "Sản phẩm" },
                      { value: "1", label: "Dịch vụ" },
                    ]}
                    value={valueStepOne.optionChoose}
                    onChange={(e) => setValueStepOne({ ...valueStepOne, optionChoose: e.target.value })}
                  />
                </div>
                <div className={`form-group ${valueStepOne.optionChoose == "1" ? "d-none" : ""}`}>
                  <SelectCustom
                    id="product"
                    name="product"
                    label="Sản phẩm"
                    fill={true}
                    required={valueStepOne.optionChoose === "0" ? true : false}
                    options={[]}
                    value={valueStepOne.dataProduct}
                    onChange={(e) => handleChangeValueProduct(e)}
                    isFormatOptionLabel={true}
                    isAsyncPaginate={true}
                    loadOptionsPaginate={loadedOptionProduct}
                    placeholder="Chọn sản phẩm"
                    additional={{
                      page: 1,
                    }}
                    error={validateStepOne.validateProduct && valueStepOne.optionChoose === "0"}
                    message="Sản phẩm không được để trống"
                    formatOptionLabel={formatOptionLabelProduct}
                    disabled={valueStepOne.optionChoose === "1" || isLoading}
                  />
                </div>
                <div className={`form-group ${valueStepOne.optionChoose == "0" ? "d-none" : ""}`}>
                  <SelectCustom
                    id="serviceId"
                    name="serviceId"
                    label="Dịch vụ"
                    fill={true}
                    required={valueStepOne.optionChoose === "1" ? true : false}
                    options={[]}
                    value={valueStepOne.dataService}
                    onChange={(e) => handleChangeValueService(e)}
                    isFormatOptionLabel={true}
                    isAsyncPaginate={true}
                    loadOptionsPaginate={loadedOptionService}
                    placeholder="Chọn dịch vụ"
                    additional={{
                      page: 1,
                    }}
                    formatOptionLabel={formatOptionLabelService}
                    disabled={valueStepOne.optionChoose === "0" || isLoading}
                    isLoading={isLoading}
                    error={validateStepOne.validateService && valueStepOne.optionChoose === "1"}
                    message="Dịch vụ không được để trống"
                  />
                </div>
                <div className="form-group">
                  <SelectCustom
                    key={countCheckProject}
                    id="projectId"
                    name="projectId"
                    label={`Dự án`}
                    options={[]}
                    fill={true}
                    value={valueStepOne.dataProject}
                    required={false}
                    onChange={(e) => handleChangeValueProject(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder={`Chọn dự án`}
                    additional={{
                      page: 1,
                    }}
                    // error={checkFieldEmployee}
                    // message={`Người ${type == 1 ? "thu" : "chi"} không được bỏ trống`}
                    loadOptionsPaginate={loadOptionProject}
                    disabled={isLoading}
                    formatOptionLabel={formatOptionLabelProject}
                  />
                </div>
                <div className="form-group">
                  <SelectCustom
                    key={countCheck}
                    id="decision"
                    name="decision"
                    label="Người quyết định"
                    fill={true}
                    required={true}
                    options={[]}
                    value={valueStepOne.dataContact}
                    onChange={(e) => handleChangeValueContact(e)}
                    isFormatOptionLabel={true}
                    isAsyncPaginate={true}
                    loadOptionsPaginate={loadedOptionContact}
                    placeholder="Chọn người quyết định"
                    additional={{
                      page: 1,
                    }}
                    formatOptionLabel={formatOptionLabelContact}
                    disabled={isLoading}
                    isLoading={isLoading || isLoadingOption}
                    error={validateStepOne.validateContact}
                    message="Người quyết định không được để trống"
                  />
                </div>
                <div className="form-group" style={{ width: "100%" }}>
                  <SelectCustom
                    id="coordinator"
                    name="coordinator"
                    label="Người phối hợp"
                    fill={true}
                    options={[]}
                    isMulti={true}
                    value={valueStepOne.dataCoordinators}
                    onChange={(e) => handleChangeValueCoordinator(e)}
                    isFormatOptionLabel={true}
                    isAsyncPaginate={true}
                    loadOptionsPaginate={loadedOptionCoordinator}
                    placeholder="Chọn người phối hợp"
                    additional={{
                      page: 1,
                    }}
                    formatOptionLabel={formatOptionLabelCoordinator}
                    disabled={isLoading}
                    isLoading={isLoading || isLoadingOptionCoordinator}
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
          <AddContactModal
            onShow={showModalContact}
            data={null}
            idCustomer={idCustomer}
            onHide={(reload) => {
              // if (reload) {
              //   getListContact(params);
              // }
              setShowModalContact(false);
            }}
          />
        </form>
      </Modal>
    </Fragment>
  );
}
