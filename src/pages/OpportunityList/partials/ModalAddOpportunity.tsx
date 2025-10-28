import React, { Fragment, useState, useEffect, useMemo, useContext } from "react";
import _ from "lodash";
import { IAction, IActionModal } from "model/OtherModel";
import RadioList from "components/radio/radioList";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import ServiceService from "services/ServiceService";
import ProductService from "services/ProductService";
import ContactService from "services/ContactService";
import CustomerService from "services/CustomerService";
import ImageThirdGender from "assets/images/third-gender.png";
import { ContextType, UserContext } from "contexts/userContext";
import "./ModalAddOpportunity.scss";
import WorkProjectService from "services/WorkProjectService";
import ImgPushCustomer from "assets/images/img-push.png";
import AddContactModal from "pages/Contact/partials/AddContactModal";
import AddProjectManagementModal from "pages/MiddleWork/partials/ProjectManagement/partials/AddProjectManagementModal";
import Button from "components/button/button";
import CampaignPipelineService from "services/CampaignPipelineService";
import CampaignService from "services/CampaignService";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import EmployeeService from "services/EmployeeService";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { formatCurrency } from "reborn-util";
import CampaignOpportunityService from "services/CampaignOpportunityService";

export default function ModalAddOpportunity(props: any) {
  const { onShow, onHide, data } = props;

  const { dataBranch } = useContext(UserContext) as ContextType;

  const [dataRes, setDataRes] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [idResponse, setIdResponse] = useState<number>(null);

  const [detailCustomer, setDetailCustomer] = useState(null);

  useEffect(() => {
    if (data && onShow) {
      setDataRes(data);

      if (data.customerId) {
        setDetailCustomer({
          value: data.customerId,
          label: data.customerName,
        });
      }

      setValueStepOne({
        ...valueStepOne,
        dataProduct: data?.productId ? { value: data?.productId, label: data.productName } : null,
        dataService: data?.serviceId ? { value: data?.serviceId, label: data.serviceName } : null,
        dataContact: data?.contactId ? { value: data?.contactId, label: data.contactName } : null,
        dataProject: data?.projectId ? { value: data?.projectId, label: data.projectName } : null,
        optionChoose: data?.productId ? "0" : "1",
      });

      setFormDataTwo({
        ...formDataTwo,
        customerId: data.customerId,
        opportunityId: data.id,
        // saleId: data.saleId,
        // expectedRevenue: data.expectedRevenue,
        // startDate: data.startDate,
        // endDate: data.endDate,
        // campaignId: data.campaignId,
        // pipelineId: data.pipelineId,
      });
    }
  }, [data, onShow]);

  const valuesStepOne = useMemo(
    () =>
      ({
        id: dataRes ? dataRes.id : null,
        customerId: dataRes?.customerId ?? 0,
        projectId: dataRes ? dataRes.projectId : 0, // dự án
        productId: dataRes ? dataRes.productId : 0, // sản phẩm
        serviceId: dataRes ? dataRes.serviceId : 0, // dịch vụ
        contactId: dataRes ? dataRes.contactId : null, // người quyết định
        coordinators: dataRes ? dataRes.coordinators : [], // người phối hợp
      } as any),
    [onShow, dataRes]
  );

  useEffect(() => {
    if (onShow && dataRes?.id) {
      // handDetailOpportunity(idOpportunity);
      setNxStep({
        step_one: false,
        step_two: true,
      });
      setActiveItemMenu(1);

      // setIsEdit(false);
    }
  }, [onShow, dataRes]);

  const [formDataOne, setFormDataOne] = useState(valuesStepOne);

  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param = {
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

  const handleChangeValueCustomer = (e) => {
    setDetailCustomer(e);
    setFormDataOne({ ...formDataOne, customerId: e.value });
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

  useEffect(() => {
    if (detailCustomer) {
      loadedOptionContact("", undefined, { page: 1 });
      loadedOptionCoordinator("", undefined, { page: 1 });
    }
  }, [detailCustomer]);

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
      customerId: detailCustomer?.value,
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
    if (!showModalContact) {
      setCountCheck(countCheck + 1);
      loadedOptionContact("", undefined, { page: 1 });
    }
  }, [showModalContact]);

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
            ? dataOption.map((item) => {
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
      customerId: detailCustomer?.value,
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

    const bodyFromTwo = {
      ...formDataTwo,
    };

    let response = null;

    if (nxStep.step_one || activeItemMenu == 1) {
      response = await CustomerService.createOpportunity(bodyFromOne);
    } else {
      response = await CampaignOpportunityService.update(bodyFromTwo);
    }

    if (response.code === 0) {
      const result = response.result;

      if (nxStep.step_one || activeItemMenu == 1) {
        showToast(`Tạo mới cơ hội thành công`, "success");
        setIdResponse(result.id);
        setIsSubmit(false);

        const data = {
          id: result.id,
          label: result.productName || result.serviceName,
          customerId: detailCustomer.customerId,
          customerName: detailCustomer.customerName,
        };

        handClearForm(true);
      } else {
        setIsCreate(false);
        setIsSubmit(false);
        setValueStepTwo({
          dataSale: null,
          dataCampaign: null,
          dataCustomer: null,
          dataPipeline: null,
          startDate: null,
          endDate: null,
          expectedRevenue: 0,
        });
        handleGetCampaign();
        showToast(`Thêm mới cơ hội vào chiến dịch thành công`, "success");
      }
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
    setDetailCustomer(null);
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
            // disabled:
            //   isSubmit || nxStep?.step_one || activeItemMenu == 1
            //     ? data?.id
            //       ? idResponse
            //         ? true
            //         : false
            //       : _.isEqual(formDataOne, valuesStepOne)
            //     : _.isEqual(formDataTwo, valueStepTwo),
            is_loading: isSubmit,
          },
          ,
        ],
      },
    }),
    [formDataOne, valuesStepOne, isSubmit, data, idResponse]
  );

  const [activeItemMenu, setActiveItemMenu] = useState<number>(1);

  const lstMenu = [
    {
      id: 1,
      name: "Thông tin cơ hội",
    },
    {
      id: 2,
      name: "Quản lý chiến dịch",
    },
  ];

  const [nxStep, setNxStep] = useState({
    step_one: true,
    step_two: false,
  });
  const valueFormTwo = useMemo(
    () =>
      ({
        id: null,
        customerId: data?.customerId, // khách hàng
        opportunityId: data?.id, // id cơ hội
        saleId: 0, // người phụ trách
        expectedRevenue: 0, // doanh thu
        startDate: "", // bắt đầu
        endDate: "", // kết thúc
        campaignId: 0, // chiến dịch
        pipelineId: 0, //pha chiến dịch
        approachId: null,
        employeeId: null,
        refId: 0,
        sourceId: null,
        type: "biz",
      } as any),
    [activeItemMenu, idResponse, nxStep, dataRes, data]
  );

  const [formDataTwo, setFormDataTwo] = useState(valueFormTwo);

  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [lstCampaign, setLstCampaign] = useState([{ id: 1, name: "Chiến dịch 1" }]);
  const [valueStepTwo, setValueStepTwo] = useState({
    dataSale: null,
    dataCampaign: null,
    dataPipeline: null,
    dataCustomer: null,
    startDate: null,
    endDate: null,
    expectedRevenue: 0,
  });
  const getListCampaignPipeline = async (campaignId: any, e) => {
    const param = {
      limit: 100,
      campaignId: campaignId,
    };

    const response = await CampaignPipelineService.list(param);

    if (response.code === 0) {
      const result = response.result || [];
      if (result && result.length > 0) {
        setValueStepTwo({
          ...valueStepTwo,
          dataCampaign: e,
          dataPipeline: { value: result[0].id, label: result[0].name },
          startDate: e.startDate,
          endDate: e.endDate,
        });
        setFormDataTwo({ ...formDataTwo, campaignId: e.value, pipelineId: result[0].id, startDate: e.startDate, endDate: e.endDate });
      } else {
        setValueStepTwo({ ...valueStepTwo, dataCampaign: e, dataPipeline: null, startDate: e.startDate, endDate: e.endDate });
        setFormDataTwo({ ...formDataTwo, campaignId: e.value, pipelineId: 0, startDate: e.startDate, endDate: e.endDate });
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setValueStepTwo({ ...valueStepTwo, dataCampaign: e, dataPipeline: null, startDate: e.startDate, endDate: e.endDate });
      setFormDataTwo({ ...formDataTwo, campaignId: e.value, pipelineId: 0, startDate: e.startDate, endDate: e.endDate });
    }
  };
  const handleChangeValueExpectedRevenue = (e) => {
    const value = e.floatValue;
    setValueStepTwo({ ...valueStepTwo, expectedRevenue: value });
    setFormDataTwo({ ...formDataTwo, expectedRevenue: value });
  };
  // End xử lý chiến dịch

  // Start xử lý chiến dịch bán hàng
  const loadedOptionCampaign = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      type: "biz",
      limit: 10,
    };

    const response = await CampaignService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  startDate: item.startDate,
                  endDate: item.endDate,
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

  const formatOptionLabelCampaign = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCampaign = (e) => {
    getListCampaignPipeline(e.value, e);
    // setValueStepTwo({ ...valueStepTwo, dataCampaign: e, dataPipeline: null, startDate: e.startDate, endDate: e.endDate });
    // setFormDataTwo({ ...formDataTwo, campaignId: e.value, startDate: e.startDate, endDate: e.endDate });
  };

  // Start xử lý người phụ trách
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
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
    setValueStepTwo({ ...valueStepTwo, dataSale: e });
    setFormDataTwo({ ...formDataTwo, saleId: e.value });
  };
  // End xử lý người phụ trách

  const handleGetCampaign = async () => {
    const param = {
      customerId: data?.customerId || 0,
    };

    const response = await CampaignOpportunityService.list(param);

    if (response.code === 0) {
      const result = response.result;
      setLstCampaign(result.items);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (onShow && activeItemMenu == 2) {
      handleGetCampaign();
    }
  }, [onShow, activeItemMenu, data]);

  const titles = ["STT", "Tên chiến dịch", "Sản phẩm/Dịch vụ", "Người phụ trách", "Doanh thu"];

  const dataFormat = ["text-center", "", "", "", "text-right"];

  const dataMappingArray = (item, index: number) => [
    index + 1,
    item.campaignName,
    item.opportunity ? item.opportunity.productName || item.opportunity.serviceName : "",
    item.saleName ? item.saleName : "",
    formatCurrency(item.expectedRevenue),
  ];

  const deleteCampaign = async (id) => {
    const response = await CampaignOpportunityService.delete(id);
    if (response.code === 0) {
      showToast("Xóa chiến dịch thành công", "success");
      handleGetCampaign();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const actionsTable = (item): IAction[] => {
    return [
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          deleteCampaign(item.id);
        },
      },
    ];
  };

  const getDetailCustomer = async (id: number) => {
    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      const changeDataResult = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      };

      setValueStepTwo({ ...valueStepTwo, dataCustomer: changeDataResult });
    }
  };

  useEffect(() => {
    if (data?.customerId && onShow && isCreate) {
      getDetailCustomer(data.customerId);
    }
  }, [data?.customerId, onShow, isCreate]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-create-opportunity-b2b"
        size={nxStep.step_two && activeItemMenu == 2 ? "lg" : "md"}
      >
        <form className="form-create-opportunity-b2b-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={` ${nxStep.step_one ? "Tạo cơ hội" : "Cập nhật cơ hội"}`}
            toggle={() => !isSubmit && handClearForm(nxStep.step_one ? false : true)}
          />
          <ModalBody>
            <div className="box__b-two__b">
              {nxStep.step_two && (
                <div className="update__opportunity">
                  <div className="update__opportunity--header">
                    <ul className="menu__list">
                      {lstMenu.map((item, idx) => {
                        return (
                          <li
                            key={idx}
                            className={`menu-item ${activeItemMenu === item.id ? "active__item--menu" : ""}`}
                            onClick={() => setActiveItemMenu(item.id)}
                          >
                            {item.name}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
              {activeItemMenu === 1 ? (
                <div className="list-form-group">
                  <div className="form-group" style={{ width: "100%" }}>
                    <SelectCustom
                      id="customer"
                      name="customer"
                      label="Khách hàng"
                      fill={true}
                      options={[]}
                      value={detailCustomer}
                      onChange={(e) => handleChangeValueCustomer(e)}
                      isAsyncPaginate={true}
                      isFormatOptionLabel={true}
                      loadOptionsPaginate={loadedOptionCustomer}
                      placeholder="Chọn người khách hàng"
                      additional={{
                        page: 1,
                      }}
                      formatOptionLabel={formatOptionLabelCustomer}
                    />
                  </div>
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
                      key={`${detailCustomer?.value}_${countCheck}`}
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
                      disabled={isLoading || !detailCustomer}
                      isLoading={isLoading || isLoadingOption}
                      error={validateStepOne.validateContact}
                      message="Người quyết định không được để trống"
                    />
                  </div>
                  <div className="form-group" style={{ width: "100%" }}>
                    <SelectCustom
                      key={detailCustomer?.value}
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
                      disabled={isLoading || !detailCustomer}
                      isLoading={isLoading || isLoadingOptionCoordinator}
                    />
                  </div>
                </div>
              ) : (
                <div className="box__campaign--b2b">
                  <div className="action--campaign">
                    <Button
                      color="success"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsCreate(!isCreate);

                        if (!isCreate) {
                          setValueStepTwo({
                            dataSale: null,
                            dataCampaign: null,
                            dataPipeline: null,
                            dataCustomer: null,
                            startDate: null,
                            endDate: null,
                            expectedRevenue: 0,
                          });
                        }
                      }}
                    >
                      {isCreate ? "Quay lại" : "Thêm mới"}
                    </Button>
                  </div>
                  {isCreate ? (
                    <div className="lst__form--b2b">
                      <div className="form-group">
                        <SelectCustom
                          id="campaignId"
                          name="campaignId"
                          label="Quản lý chiến dịch"
                          options={[]}
                          fill={true}
                          value={valueStepTwo.dataCampaign}
                          required={true}
                          onChange={(e) => handleChangeValueCampaign(e)}
                          isAsyncPaginate={true}
                          isFormatOptionLabel={true}
                          isLoading={false}
                          placeholder="Chọn chiến dịch"
                          additional={{
                            page: 1,
                          }}
                          loadOptionsPaginate={loadedOptionCampaign}
                          formatOptionLabel={formatOptionLabelCampaign}
                        />
                      </div>
                      {valueStepTwo.dataPipeline ? (
                        <div className="form-group">
                          <SelectCustom
                            id="pipelineId"
                            name="pipelineId"
                            label="Pha chiến dịch"
                            options={[]}
                            fill={true}
                            special={true}
                            value={valueStepTwo.dataPipeline}
                            required={false}
                            // onChange={(e) => handleChangeValueCampaign(e)}
                            isAsyncPaginate={false}
                            isFormatOptionLabel={false}
                            isLoading={false}
                            placeholder="Chọn pha chiến dịch"
                            disabled={true}
                            // additional={{
                            //   page: 1,
                            // }}
                            // loadOptionsPaginate={loadedOptionCampaign}
                            // formatOptionLabel={formatOptionLabelCampaign}
                          />
                        </div>
                      ) : null}
                      <div className="form-group">
                        <DatePickerCustom
                          id="startDate"
                          name="startDate"
                          label="Ngày bắt đầu"
                          value={valueStepTwo.startDate}
                          fill={true}
                          iconPosition="left"
                          icon={<Icon name="Calendar" />}
                          disabled={true}
                          placeholder="Chọn chiến dịch xem ngày bắt đầu"
                        />
                      </div>
                      <div className="form-group">
                        <DatePickerCustom
                          id="endDate"
                          name="endDate"
                          label="Ngày kết thúc"
                          value={valueStepTwo.endDate}
                          fill={true}
                          iconPosition="left"
                          icon={<Icon name="Calendar" />}
                          disabled={true}
                          placeholder="Chọn chiến dịch xem ngày kết thúc"
                        />
                      </div>
                      <div className="form-group">
                        <SelectCustom
                          id="customerId"
                          name="customerId"
                          special={true}
                          value={valueStepTwo.dataCustomer}
                          label="Khách hàng"
                          options={[]}
                          fill={true}
                          disabled={true}
                          isFormatOptionLabel={true}
                          formatOptionLabel={formatOptionLabelCustomer}
                        />
                      </div>
                      <div className="form-group">
                        <NummericInput
                          id="expectedRevenue"
                          name="expectedRevenue"
                          label="Doanh thu dự kiến"
                          value={valueStepTwo.expectedRevenue}
                          fill={true}
                          thousandSeparator={true}
                          onValueChange={(e) => handleChangeValueExpectedRevenue(e)}
                          placeholder="Nhập doanh thu dự kiến"
                        />
                      </div>
                      <div className="form-group">
                        <SelectCustom
                          id="employeeId"
                          name="employeeId"
                          label="Người phụ trách"
                          options={[]}
                          fill={true}
                          value={valueStepTwo.dataSale}
                          placeholder="Chọn người phụ trách"
                          isFormatOptionLabel={true}
                          formatOptionLabel={formatOptionLabelEmployee}
                          additional={{
                            page: 1,
                          }}
                          isAsyncPaginate={true}
                          loadOptionsPaginate={loadedOptionEmployee}
                          onChange={(e) => handleChangeValueEmployee(e)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="table__campaign">
                      {lstCampaign.length > 0 ? (
                        <BoxTable
                          name="Chiến dịch"
                          titles={titles}
                          items={lstCampaign}
                          dataMappingArray={(item, index) => dataMappingArray(item, index)}
                          dataFormat={dataFormat}
                          striped={true}
                          actions={actionsTable}
                          actionType="inline"
                        />
                      ) : (
                        <SystemNotification
                          description={
                            <span>
                              Hiện tại chưa có chiến dịch bán hàng nào. <br />
                              Hãy thêm mới chiến dịch bán hàng đầu tiên nhé!
                            </span>
                          }
                          type="no-item"
                          titleButton="Thêm mới chiến dịch"
                          action={() => {
                            setIsCreate(true);
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
          <AddContactModal
            onShow={showModalContact}
            data={null}
            idCustomer={detailCustomer?.value || null}
            onHide={(reload) => {
              // if (reload) {
              //   getListContact(params);
              // }
              setShowModalContact(false);
            }}
          />
          <AddProjectManagementModal
            onShow={showModalAddProject}
            idData={null}
            onHide={(reload) => {
              // if (reload) {
              //   getListProject(params);
              // }
              setShowModalAddProject(false);
            }}
          />
        </form>
      </Modal>
    </Fragment>
  );
}
