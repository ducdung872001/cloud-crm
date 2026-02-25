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
import "./index.scss";
import ImgPushCustomer from "assets/images/img-push.png";
import WorkProjectService from "services/WorkProjectService";
import CampaignPipelineService from "services/CampaignPipelineService";
import AddContactModal from "pages/Contact/partials/AddContactModal";

interface IAddBTwoBModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  idCustomer: number;
  idOpportunity: number;
  dataCustomer?: any;
  special: boolean;
  onBackup: (idCustomer: number, reload: boolean) => void;
}

export default function AddBTwoBModal(props: IAddBTwoBModalProps) {
  const { onShow, onHide, idCustomer, idOpportunity, special, onBackup, dataCustomer } = props;

  const [dataRes, setDataRes] = useState(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handDetailOpportunity = async (id: number) => {
    if (!id) return;

    setIsLoading(true);

    const response = await CustomerService.detailOpportunity(id);

    if (response.code === 0) {
      const result = response.result;
      setDataRes(result);

      const changeDataCoordinators = (lstData) => {
        const resultCoordinators = lstData.map((item) => {
          return {
            value: item.id,
            label: item.name,
            avatar: item.avatar,
          };
        });

        return resultCoordinators;
      };

      // let listCoordinators = [];
      // if(result?.lstContactCoordinator?.length > 0 ){
      //   result?.lstContactCoordinator.map(item => {
      //     listCoordinators.push({
      //       value: item.id,
      //       label: item.name,
      //       avatar: item.avatar,
      //       type: 'contact'
      //     })
      //   })
      // }

      // if(result?.lstEmployeeCoordinator?.length > 0 ){
      //   result?.lstEmployeeCoordinator.map(item => {
      //     listCoordinators.push({
      //       value: item.id,
      //       label: item.name,
      //       avatar: item.avatar,
      //       type: 'employee'
      //     })
      //   })
      // }

      setValueStepOne({
        optionChoose: result.productId ? "0" : "1",
        dataProduct: result.productId ? { value: result.productId, label: result.productName } : null,
        dataService: result.serviceId ? { value: result.serviceId, label: result.serviceName } : null,
        dataContact: result.contactId ? { value: result.contactId, label: result.contactName } : null,
        dataProject: result.projectId ? { value: result.projectId, label: result.projectName } : null,
        dataCoordinators: result.lstCoordinator && result.lstCoordinator.length > 0 ? changeDataCoordinators(result.lstCoordinator) : [],
        // dataCoordinators: listCoordinators
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && idOpportunity) {
      handDetailOpportunity(idOpportunity);
      setNxStep({
        step_one: false,
        step_two: true,
      });

      setIsEdit(false);
    }
  }, [onShow, idOpportunity]);

  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [idResponse, setIdResponse] = useState<number>(null);

  const [nxStep, setNxStep] = useState({
    step_one: true,
    step_two: false,
  });

  const valuesStepOne = useMemo(
    () =>
      ({
        id: dataRes ? dataRes.id : null,
        customerId: idCustomer,
        projectId: dataRes ? dataRes.projectId : 0, // dự án
        productId: dataRes ? dataRes.productId : 0, // sản phẩm
        serviceId: dataRes ? dataRes.serviceId : 0, // dịch vụ
        contactId: dataRes ? dataRes.contactId : null, // người quyết định
        // employeeId: dataRes ? dataRes.employeeId : null, // người quyết định
        coordinators: dataRes && dataRes.coordinators ? JSON.parse(dataRes.coordinators) : [], // người phối hợp
        // contactCoordinators: dataRes ? dataRes.lstContactCoordinatorId  : [], // người phối hợp
        // employeeCoordinators: dataRes ? dataRes.lstEmployeeCoordinatorId  : [], // người phối hợp
      } as any),
    [onShow, idCustomer, dataRes]
  );

  const [formDataOne, setFormDataOne] = useState(valuesStepOne);

  const [isEdit, setIsEdit] = useState<boolean>(false);

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

  const [valueStepTwo, setValueStepTwo] = useState({
    dataSale: null,
    dataCampaign: null,
    dataPipeline: null,
    dataCustomer: null,
    startDate: null,
    endDate: null,
    expectedRevenue: 0,
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

  const [showModalAddProject, setShowModalAddProject] = useState(false);

  const [isLoadingOption, setIsLoadingOption] = useState<boolean>(false);

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
      const dataOption = response.result.items || [];

      // let listEmployee =[];
      // if(dataOption?.length > 0){
      //   dataOption.map((item) => {
      //     listEmployee.push({
      //       value: item.id,
      //       label: item.name,
      //       avatar: item.avatar,
      //       type: 'contact'
      //     })
      //     const lstCoordinator = item.lstCoordinator || [];
      //     if(lstCoordinator && lstCoordinator.length > 0){
      //       lstCoordinator.map(el => {
      //         listEmployee.push({
      //           value: el.id,
      //           label: el.name,
      //           avatar: el.avatar,
      //           type: 'employee'
      //         })
      //       })
      //     }
      //   })
      // }

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
  //* End xử lý người phối hợp

  //! form tab 2
  const [activeItemMenu, setActiveItemMenu] = useState<number>(1);

  useEffect(() => {
    if (special) {
      setActiveItemMenu(2);
      setIsCreate(true);
    } else {
      setActiveItemMenu(1);
      setIsCreate(false);
    }
  }, [special, onShow]);

  const valueFormTwo = useMemo(
    () =>
      ({
        id: null,
        customerId: idCustomer,
        opportunityId: idOpportunity ? idOpportunity : idResponse, // id cơ hội
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
    [activeItemMenu, idCustomer, idOpportunity, idResponse, nxStep]
  );

  const [formDataTwo, setFormDataTwo] = useState(valueFormTwo);

  useEffect(() => {
    setFormDataTwo(valueFormTwo);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [valueFormTwo]);

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

  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [lstCampaign, setLstCampaign] = useState([{ id: 1, name: "Chiến dịch 1" }]);

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
    if (idCustomer && onShow && isCreate) {
      getDetailCustomer(idCustomer);
    }
  }, [idCustomer, onShow, isCreate]);

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

  const handleGetCampaign = async (idCustomer) => {
    const param = {
      customerId: idCustomer,
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
    if (onShow && activeItemMenu == 2 && idCustomer) {
      handleGetCampaign(idCustomer);
    }
  }, [onShow, activeItemMenu, idCustomer]);

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
      handleGetCampaign(idCustomer);
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

  const onSubmit = async (e) => {
    e.preventDefault();

    if (nxStep.step_one || activeItemMenu == 1) {
      if (!valueStepOne.dataProduct && valueStepOne.optionChoose == "0") {
        setValidateStepOne({ ...validateStepOne, validateProduct: true });
        return;
      }

      if (!valueStepOne.dataService && valueStepOne.optionChoose == "1") {
        setValidateStepOne({ ...validateStepOne, validateService: true });
        return;
      }

      if (!valueStepOne.dataContact && dataCustomer.custType == 1) {
        setValidateStepOne({ ...validateStepOne, validateContact: true });
        return;
      }
    }

    setIsSubmit(true);

    // const contactCoordinators = valueStepOne.dataCoordinators.filter(el => el.type === 'contact').map(item => {
    //   return item.value
    // })

    // const employeeCoordinators = valueStepOne.dataCoordinators.filter(el => el.type === 'employee').map(item => {
    //   return item.value
    // })

    const changeFormDataOne = {
      ...formDataOne,
      coordinators: JSON.stringify(formDataOne.coordinators),
      // contactCoordinators: JSON.stringify(contactCoordinators),
      // employeeCoordinators: JSON.stringify(employeeCoordinators),
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
      if (nxStep.step_one || activeItemMenu == 1) {
        showToast(`${idOpportunity ? "Chỉnh sửa" : "Tạo mới"} cơ hội thành công`, "success");
        setNxStep({ step_one: false, step_two: true });
        setIsSubmit(false);
        setIsEdit(true);
        setIdResponse(response.result.id);
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
        handleGetCampaign(idCustomer);
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
    setValueStepTwo({
      dataSale: null,
      dataCampaign: null,
      dataPipeline: null,
      dataCustomer: null,
      startDate: null,
      endDate: null,
      expectedRevenue: 0,
    });
    setNxStep({
      step_one: true,
      step_two: false,
    });
    setValidateStepOne({
      validateProduct: false,
      validateService: false,
      validateContact: false,
      validateProject: false,
    });
    setActiveItemMenu(1);
    setIsEdit(false);
    setIsCreate(false);
    setDataRes(null);
    setIdResponse(null);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_left: {
        buttons:
          activeItemMenu == 1 && !idOpportunity && nxStep.step_two
            ? [
                {
                  title: "Chỉnh sửa",
                  color: "primary",
                  variant: "outline",
                  disabled: isSubmit,
                  callback: () => {
                    setIsEdit(!isEdit);
                  },
                },
              ]
            : special
            ? [
                {
                  title: "Quay lại",
                  color: "warning",
                  variant: "outline",
                  callback: () => {
                    onBackup(idCustomer, !_.isEqual(formDataOne, valuesStepOne));
                    handClearForm(false);
                  },
                },
              ]
            : [],
      },
      actions_right: {
        buttons: [
          ...(activeItemMenu == 1 || (activeItemMenu == 2 && !isCreate)
            ? [
                {
                  title: "Hủy",
                  color: "primary",
                  variant: "outline",
                  disabled: isSubmit,
                  callback: () => {
                    if (idOpportunity) {
                      handClearForm(idResponse ? true : false);
                    } else {
                      handClearForm(nxStep.step_one ? false : true);
                    }
                  },
                },
              ]
            : []),
          ...(activeItemMenu == 1 || isCreate
            ? ([
                {
                  title: isCreate ? "Tạo mới" : nxStep.step_one ? "Tạo mới" : "Xác nhận",
                  type: "submit",
                  color: "primary",
                  disabled:
                    isSubmit || nxStep.step_one || activeItemMenu == 1
                      ? idOpportunity
                        ? idResponse
                          ? true
                          : false
                        : _.isEqual(formDataOne, valuesStepOne)
                      : _.isEqual(formDataTwo, valueStepTwo),
                  is_loading: isSubmit,
                },
              ] as any)
            : []),
        ],
      },
    }),
    [
      formDataOne,
      valuesStepOne,
      formDataTwo,
      valueStepTwo,
      isSubmit,
      nxStep,
      activeItemMenu,
      isCreate,
      isEdit,
      idOpportunity,
      special,
      idCustomer,
      idResponse,
    ]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(nxStep.step_one ? false : true)}
        className="modal-add-b-two-b"
        size={nxStep.step_two && activeItemMenu == 2 ? "lg" : "md"}
      >
        <form className="form-add-b-two-b-group" onSubmit={(e) => onSubmit(e)}>
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
                  <div className="form-group">
                    <RadioList
                      name="option"
                      title="Chọn chào sản phẩm hoặc dịch vụ"
                      options={[
                        { value: "0", label: "Sản phẩm" },
                        { value: "1", label: "Dịch vụ" },
                      ]}
                      value={valueStepOne.optionChoose}
                      disabled={isEdit}
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
                      disabled={valueStepOne.optionChoose === "1" || isEdit || isLoading}
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
                      disabled={valueStepOne.optionChoose === "0" || isEdit || isLoading}
                      isLoading={isLoading}
                      error={validateStepOne.validateService && valueStepOne.optionChoose === "1"}
                      message="Dịch vụ không được để trống"
                    />
                  </div>
                  <div className="form-group" style={dataCustomer?.custType == 0 ? { width: "100%" } : {}}>
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
                      disabled={isEdit || isLoading}
                      formatOptionLabel={formatOptionLabelProject}
                    />
                  </div>
                  {dataCustomer?.custType == 1 ? (
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
                        disabled={isEdit || isLoading}
                        isLoading={isLoading || isLoadingOption}
                        error={validateStepOne.validateContact}
                        message="Người quyết định không được để trống"
                      />
                    </div>
                  ) : null}
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
                      disabled={isEdit || isLoading}
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
