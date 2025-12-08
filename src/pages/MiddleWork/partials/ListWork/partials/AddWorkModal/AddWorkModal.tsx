import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { getSearchParameters, isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddWorkModelProps } from "model/workOrder/PropsModel";
import { IWorkOrderRequestModel } from "model/workOrder/WorkOrderRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IWorkProjectFilterRequest } from "model/workProject/WorkProjectRequestModel";
import { IWorkTypeFilterRequest } from "model/workType/WorkTypeRequestModel";
import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import Icon from "components/icon";
import Input from "components/input/input";
import Switch from "components/switch/switch";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import CheckboxList from "components/checkbox/checkboxList";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { listTimeSlots, showToast } from "utils/common";
import ImgExcel from "assets/images/img-excel.png";
import ImgWord from "assets/images/img-word.png";
import ImgPowerpoint from "assets/images/img-powerpoint.png";
import FileService from "services/FileService";
import { listDay, listHour, listMinute, listNotificationType, listOption } from "pages/CalendarCommon/partials/MockData";
import ImageThirdGender from "assets/images/third-gender.png";
import EmployeeService from "services/EmployeeService";
import CustomerService from "services/CustomerService";
import WorkTypeService from "services/WorkTypeService";
import WorkOrderService from "services/WorkOrderService";
import WorkProjectService from "services/WorkProjectService";
import { ContextType, UserContext } from "contexts/userContext";
import { uploadDocumentFormData } from "utils/document";

import "./AddWorkModal.scss";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import { ICampaignOpportunityFilterRequest } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import AttachmentUploader, { UploadedItem } from "components/attachmentUpload";
type UploadResult = {
  fileUrl?: string;
  url?: string;
  extension?: string;
  // optional other fields from server
};

interface IDataListNotificationProps {
  method: string[];
  time: {
    day: number;
    hour: number;
    minute: number;
  };
}

export default function AddWorkModal(props: IAddWorkModelProps) {
  const {
    type,
    onShow,
    onHide,
    idWork,
    idManagement,
    startDate,
    endDate,
    dataEmployeeProps,
    dataProjectProps,
    dataOptProps,
    statusProps,
    dataManagerProps,
    customerId,
    customerName,
    isShowProject,
    disableOpportunity,
  } = props;

  const params: any = getSearchParameters();

  const takeIdProjectManagement = Object.keys(params).length > 0 && +params?.projectId > 0 ? +params?.projectId : null;
  const takeIdOptManagement = Object.keys(params).length > 0 && +params?.opportunityId > 0 ? +params?.opportunityId : null;
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [data, setData] = useState<IWorkOrderResponseModel>(null);

  const refOptionTimeWorkLoad = useRef();
  const refContainerTimeWorkLoad = useRef();

  const refOptionDecisionTime = useRef();
  const refContainerDecisionTime = useRef();

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [validateWordLoad, setValidateWordLoad] = useState<boolean>(false);
  const [validateProject, setValidateProject] = useState<boolean>(false);
  const [validateOpt, setValidateOpt] = useState<boolean>(false);

  //! đoạn này call API chi tiết khi update
  const getDetailWork = async (id: number) => {
    const response = await WorkOrderService.detail(id);

    if (response.code == 0) {
      const result: IWorkOrderResponseModel = response.result;

      const takeLstParticipant = (response.result?.lstParticipant || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        };
      });

      setDataParticipants(takeLstParticipant);

      const takeLstCustomer = (response.result?.lstCustomer || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        };
      });

      setDataPeopleInvolved(takeLstCustomer);

      setDataWorkProject({
        value: result.projectId,
        label: result.projectName,
      });
      setDataWorkOpt({
        value: result.opportunityId,
        label: result.opportunityName,
      });

      setDataEmployee({
        value: result.employeeId,
        label: result.employeeName,
      });

      setDataManager({
        value: result.managerId,
        label: result.managerName,
      });

      setDataWorkType({
        value: result.wteId,
        label: result.workTypeName,
      });

      const takeNotification = JSON.parse(result?.notification);
      setDataListNotification(takeNotification);

      setData({
        id: result.id,
        name: result.name,
        content: result.content,
        employeeId: result.employeeId,
        managerId: result.managerId,
        projectId: result.projectId,
        opportunityId: result.opportunityId,
        priorityLevel: result.priorityLevel,
        customers: result.customers,
        docLink: result.docLink,
        startTime: result.startTime,
        endTime: result.endTime,
        notification: result.notification,
        workLoad: result.workLoad,
        workLoadUnit: result.workLoadUnit,
        wteId: result.wteId,
        participants: result.participants,
        status: result.status,
        percent: result.percent,
      });
    }
  };

  useEffect(() => {
    if (idWork && onShow) {
      getDetailWork(idWork);
    }
  }, [onShow, idWork]);

  const listOptionTimeWorkLoad = [
    {
      value: "D",
      label: "Ngày",
    },
    {
      value: "H",
      label: "Giờ",
    },
    {
      value: "M",
      label: "Phút",
    },
  ];

  const [isOptionTimeWorkLoad, setIsOptionTimeWorkLoad] = useState<boolean>(false);
  useOnClickOutside(refOptionTimeWorkLoad, () => setIsOptionTimeWorkLoad(false), ["option__time--workload"]);

  const [dataTimeWorkLoad, setDataTimeWorkLoad] = useState({
    value: "H",
    label: "Giờ",
  });

  useEffect(() => {
    if (data && data.workLoadUnit) {
      const result = listOptionTimeWorkLoad.find((item) => item.value === data.workLoadUnit);
      setDataTimeWorkLoad(result);
    }
  }, [data]);

  const [valueDecisionTime, setValueDecisionTime] = useState({
    value: "3",
    label: "Phút",
  });
  const [valueTime, setValueTime] = useState(null);
  const [isOptionDecisionTime, setIsOptionDecisionTime] = useState<boolean>(false);
  useOnClickOutside(refOptionDecisionTime, () => setIsOptionDecisionTime(false), ["decision-time"]);

  useEffect(() => {
    if (valueDecisionTime) {
      setValueTime(valueDecisionTime.value == "1" ? listDay[0] : valueDecisionTime.value == "2" ? listHour[0] : listMinute[0]);
    }
  }, [valueDecisionTime]);

  const handleChangeValueTime = (e) => {
    setValueTime(e);
  };

  const [dataListNotification, setDataListNotification] = useState<IDataListNotificationProps[]>([]);

  const [dataApplyNotification, setDataApplyNotification] = useState({
    method: [],
    time: { day: 0, hour: 0, minute: 0 },
  });

  useEffect(() => {
    if (valueTime && valueDecisionTime) {
      if (valueDecisionTime.value == "1") {
        setDataApplyNotification({ ...dataApplyNotification, time: { day: +valueTime.value, hour: 0, minute: 0 } });
      } else if (valueDecisionTime.value == "2") {
        setDataApplyNotification({ ...dataApplyNotification, time: { day: 0, hour: +valueTime.value, minute: 0 } });
      } else {
        setDataApplyNotification({ ...dataApplyNotification, time: { day: 0, hour: 0, minute: +valueTime.value } });
      }
    }
  }, [valueTime, valueDecisionTime]);

  const handleChangeValueNofiType = (e) => {
    setDataApplyNotification({ ...dataApplyNotification, method: e ? e.split(",") : [] });
  };

  const handApplyNotification = () => {
    if (dataApplyNotification.method.length > 0) {
      setDataListNotification([...dataListNotification, dataApplyNotification]);
      setValueDecisionTime({
        value: "3",
        label: "Phút",
      });
      setDataApplyNotification({ ...dataApplyNotification, method: [] });
    }
  };

  //! xử lý xóa thông báo
  const handleRemoveApplyNotification = (idx) => {
    //? đoạn này dùng toán tử (...) trong ES6 để tránh modify trực tiếp mảng ban đầu
    const newApplyNotification = [...dataListNotification];
    newApplyNotification.splice(idx, 1);
    setDataListNotification(newApplyNotification);
  };

  const [dataManager, setDataManager] = useState(null);
  const [dataEmployee, setDataEmployee] = useState(null);
  const [dataParticipants, setDataParticipants] = useState([]);
  const [dataWorkProject, setDataWorkProject] = useState(null);
  const [dataWorkOpt, setDataWorkOpt] = useState(null);

  useEffect(() => {
    if (dataEmployeeProps) {
      setDataEmployee(dataEmployeeProps);
    } else {
      setDataEmployee(null);
    }
  }, [dataEmployeeProps]);

  useEffect(() => {
    if (dataManagerProps) {
      setDataManager(dataManagerProps);
    } else {
      setDataManager(null);
    }
  }, [dataManagerProps]);

  useEffect(() => {
    if (dataProjectProps) {
      setDataWorkProject(dataProjectProps);
    } else {
      setDataWorkProject(null);
    }
  }, [dataProjectProps]);

  useEffect(() => {
    if (dataOptProps) {
      setDataWorkOpt(dataOptProps);
    } else {
      setDataWorkOpt(null);
    }
  }, [dataOptProps]);

  //! đoạn này xử lý vấn đề call employee init để lấy ra người giao việc và người nhận việc
  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();

    if (response.code == 0) {
      const result = response.result;

      if (!dataEmployeeProps) {
        setDataEmployee({
          value: result.id,
          label: result.name,
          avatar: result.avatar,
        });
      }

      if (!dataManagerProps) {
        setDataManager({
          value: result?.managerId ? result?.managerId : result.id,
          label: result?.managerName ? result?.managerName : result.name,
          avatar: result.managerAvatar ? result?.managerAvatar : result.avatar,
        });
      }
    }
  };

  useEffect(() => {
    if (onShow && !idWork) {
      getDetailEmployeeInfo();
    }
  }, [onShow, idWork, dataEmployeeProps, dataManagerProps]);

  //! đoạn này xử lý vấn đề callAPI chi tiết 1 dự án khi thêm mới
  const getDetailProject = async () => {
    const response = await WorkProjectService.detail(idManagement ? idManagement : takeIdProjectManagement);

    if (response.code == 0) {
      const result = response.result;

      setDataWorkProject({
        value: result.id,
        label: result.name,
      });

      const dataParticipant = (result?.lstParticipant || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        };
      });

      setDataParticipants(dataParticipant);
    }
  };
  //! đoạn này xử lý vấn đề callAPI chi tiết 1 dự án khi thêm mới

  const getDetailOpt = async () => {
    const response = await CampaignOpportunityService.detail(idManagement ? idManagement : takeIdOptManagement);

    if (response.code == 0) {
      const result = response.result;
      setDataWorkOpt({
        value: result.id,
        label: result?.opportunity?.id
          ? result.opportunity.contactName + (result.opportunity.productName ? " - " + result.opportunity.productName : "")
          : result.customerName,
      });

      // const dataParticipant = (result?.lstParticipant || []).map((item) => {
      //   return {
      //     value: item.id,
      //     label: item.name,
      //     avatar: item.avatar,
      //   };
      // });

      // setDataParticipants(dataParticipant);
    }
  };

  useEffect(() => {
    if (type === "opportunity") {
      if (onShow && (idManagement > 0 || takeIdOptManagement) && !idWork && !dataOptProps) {
        getDetailOpt();
      }
    } else {
      if (onShow && (idManagement > 0 || takeIdProjectManagement) && !idWork && !dataProjectProps) {
        getDetailProject();
      }
    }
  }, [onShow, idManagement, idWork, takeIdProjectManagement, dataProjectProps]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        content: data?.content ?? "",
        // startTime: idWork ? data?.startTime : startDate ? startDate : moment().format("MM/DD/YYYY"),
        startTime: idWork ? data?.startTime : startDate ? startDate : new Date(),
        endTime: idWork ? data?.endTime : endDate ? endDate : "",
        workLoad: data?.workLoad ?? "",
        workLoadUnit: data?.workLoadUnit ?? "H",
        wteId: data?.wteId ?? null,
        docLink: JSON.parse(data?.docLink || "[]") ?? [],
        projectId: data?.projectId ? data?.projectId : type && type === "opportunity" ? null : dataWorkProject?.value,
        opportunityId: data?.opportunityId ? data?.opportunityId : type && type === "opportunity" ? dataWorkProject?.value : null,
        managerId: data?.managerId ? data?.managerId : dataManager?.value,
        employeeId: data?.employeeId ? data?.employeeId : dataEmployee?.value,
        participants: data?.participants ? JSON.parse(data?.participants || "[]") : dataParticipants?.map((item) => item.value),
        customers: JSON.parse(data?.customers || "[]") ?? [],
        status: statusProps ?? data?.status ?? 0,
        percent: data?.percent ?? 0,
        priorityLevel: data?.priorityLevel?.toString() ?? "2",
        notification: JSON.parse(data?.notification || "[]") ?? [],
      } as IWorkOrderRequestModel),
    [onShow, data, idWork, startDate, endDate, dataEmployee, dataManager, dataParticipants, dataWorkProject, statusProps]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "startTime",
      rules: "required",
    },
    {
      name: "endTime",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //! đoạn này xử lý vấn đề lấy người quản lý
  const loadedOptionManager = async (search, loadedOptions, { page }) => {
    const response = await WorkOrderService.employeeManagers();

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

  //? đoạn này xử lý vấn đề thay đổi người quản lý
  const handleChangeValueManager = (e) => {
    setDataManager(e);
  };

  //* đoạn này xử lý vấn đề hiển thị hình ảnh người quản lý
  const formatOptionLabelManager = ({ label, avatar }) => {
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
    if (dataManager) {
      setFormData({ ...formData, values: { ...formData?.values, managerId: dataManager.value } });
    }
  }, [dataManager]);

  //! đoạn này xử lý vấn đề lấy người nhận việc
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const response = await WorkOrderService.employeeAssignees({});

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

  //? đoạn này xử lý vấn đề thay đổi người nhận việc
  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
  };

  //* đoạn này xử lý vấn đề hiển thị hình ảnh người nhận việc
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

  useEffect(() => {
    if (dataEmployee) {
      setFormData({ ...formData, values: { ...formData?.values, employeeId: dataEmployee.value } });
    }
  }, [dataEmployee]);

  //! đoạn này xử lý vấn đề lấy loại công việc
  const [dataWorkType, setDataWorkType] = useState(null);

  const loadedOptionWorkType = async (search, loadedOptions, { page }) => {
    const param: IWorkTypeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await WorkTypeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
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

  //? đoạn này xử lý vấn đề thay đổi loại công việc
  const handleChangeValueWorkType = (e) => {
    setDataWorkType(e);
  };

  useEffect(() => {
    if (dataWorkType) {
      setFormData({ ...formData, values: { ...formData?.values, wteId: dataWorkType.value } });
    }
  }, [dataWorkType]);

  //! đoạn này lấy danh sách khách hàng liên quan
  const [dataPeopleInvolved, setDataPeopleInvolved] = useState([]);

  const loadedOptionPeopleInvolved = async (search, loadedOptions, { page }) => {
    const param: ICustomerSchedulerFilterRequest = {
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

  useEffect(() => {
    if (customerId) {
      setDataPeopleInvolved([{ value: customerId, label: customerName }]);
    }
  }, [customerId, onShow]);

  //? đoạn này xử lý vấn đề thay đổi khách hàng liên quan
  const handleChangeValuePeopleInvolved = (e) => {
    setDataPeopleInvolved(e);
  };

  //* đoạn này xử lý vấn đề hiển thị hình ảnh khách hàng liên quan
  const formatOptionLabelPeopleInvolved = ({ label, avatar }) => {
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
    if (dataPeopleInvolved && dataPeopleInvolved.length > 0) {
      const listIdPeopleInvolved = dataPeopleInvolved.map((item) => item.value);
      setFormData({ ...formData, values: { ...formData?.values, customers: listIdPeopleInvolved } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, customers: [] } });
    }
  }, [dataPeopleInvolved]);

  const loadedOptionParticipant = async (search, loadedOptions, { page }) => {
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

  const handleChangeValueParticipant = (e) => {
    setDataParticipants(e);
  };

  //* đoạn này hiển thị hình ảnh người tham gia
  const formatOptionLabelParticipant = ({ label, avatar }) => {
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
    if (dataParticipants.length > 0) {
      const listIdParticipants = dataParticipants.map((item) => item.value);
      setFormData({ ...formData, values: { ...formData?.values, participants: listIdParticipants } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, participants: [] } });
    }
  }, [dataParticipants]);

  //! đoạn này lấy ra danh sách ảnh công việc
  const [listImageWork, setListImageWork] = useState([]);

  //! đoạn này xử lý vấn đề khi mà dataTimeWorkLoad thay đổi thì update vào biến workLoadUnit
  useEffect(() => {
    setFormData({ ...formData, values: { ...formData?.values, workLoadUnit: dataTimeWorkLoad.value } });
  }, [dataTimeWorkLoad]);

  useEffect(() => {
    if (data && data.docLink) {
      const result = JSON.parse(data.docLink || "[]");
      setListImageWork(result);
    }
  }, [data]);

  useEffect(() => {
    if (listImageWork && listImageWork.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, docLink: listImageWork } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, docLink: [] } });
    }
  }, [listImageWork]);

  //! đoạn này xử lý hình ảnh
  const handleUploadDocument = (e) => {
    e.preventDefault();

    const file = e.target.files[0];

    const checkFile = file.type;

    if (checkFile.startsWith("image")) {
      handUploadFile(file);
    }

    if (checkFile.startsWith("application")) {
      uploadDocumentFormData(file, onSuccess, onError, onProgress);
    }
  };

  //* Xử lý tài liệu
  const [showProgress, setShowProgress] = useState<number>(0);

  const onSuccess = (data) => {
    if (data) {
      const result = {
        url: data.fileUrl,
        type: data.extension,
      };

      setListImageWork([...listImageWork, result]);
    }
  };

  const onError = (message) => {
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent);

      if (percent >= 99) {
        setShowProgress(0);
      }
    }
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    const changeResult = {
      url: result,
      type: "image",
    };
    setListImageWork([...listImageWork, changeResult]);
  };

  const handleRemoveImageItem = (idx) => {
    const result = [...listImageWork];
    result.splice(idx, 1);
    setListImageWork(result);
  };

  //? đoạn này xử lý vấn đề thay đổi số lượng công việc
  const handleChangeValueWorkLoad = (e) => {
    oninput = () => {
      setValidateWordLoad(false);
    };
    const value = e.value;
    setFormData({ ...formData, values: { ...formData?.values, workLoad: +value } });
  };

  const loadedOptionWorkProject = async (search, loadedOptions, { page }) => {
    const param: IWorkProjectFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      // parentId: -1,
    };
    const response = await WorkProjectService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
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
  const loadedOptionWorkOpt = async (search, loadedOptions, { page }) => {
    const param: ICampaignOpportunityFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      saleId: params?.saleId || -1,
      customerId: params?.customerId || -1,
    };
    const response = await CampaignOpportunityService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item?.opportunity
                    ? item.opportunity.contactName + (item.opportunity.productName ? " - " + item.opportunity.productName : "")
                    : item.customerName,
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

  //? đoạn này xử lý vấn đề thay đổi dự án
  const handleChangeValueWorkProject = (e) => {
    setValidateProject(false);
    setDataWorkProject(e);
  };
  //? đoạn này xử lý vấn đề thay đổi cơ hội
  const handleChangeValueWorkOpt = (e) => {
    setValidateOpt(false);
    setDataWorkOpt(e);
  };

  useEffect(() => {
    if (dataWorkProject) {
      setFormData({ ...formData, values: { ...formData?.values, projectId: dataWorkProject.value } });
    }
  }, [dataWorkProject]);
  useEffect(() => {
    if (dataWorkOpt) {
      setFormData({ ...formData, values: { ...formData?.values, opportunityId: dataWorkOpt.value } });
    }
  }, [dataWorkOpt]);

  // Thông báo
  useEffect(() => {
    if (dataListNotification.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, notification: dataListNotification } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, notification: [] } });
    }
  }, [dataListNotification]);

  // lấy thông tin ngày bắt đầu, ngày kết thúc
  const startDay = new Date(formData.values.startTime).getTime();
  const endDay = new Date(formData.values.endTime).getTime();

  // Thời gian bắt đầu và kết thúc
  const addTimePeriodicSchedule = {
    start: "",
    end: "",
  };

  const defaultPeriodicSchedule = [
    {
      name: "Chủ nhật",
      code: "cn",
      time: [],
    },
    {
      name: "Thứ 2",
      code: "t2",
      time: [],
    },
    {
      name: "Thứ 3",
      code: "t3",
      time: [],
    },
    {
      name: "Thứ 4",
      code: "t4",
      time: [],
    },
    {
      name: "Thứ 5",
      code: "t5",
      time: [],
    },
    {
      name: "Thứ 6",
      code: "t6",
      time: [],
    },
    {
      name: "Thứ 7",
      code: "t7",
      time: [],
    },
  ];

  const intervalMinutes = 15;
  const startTime = moment(new Date()).startOf("day");
  const endTime = moment(new Date()).endOf("day");
  const timeSlots = listTimeSlots(startTime, endTime, intervalMinutes);

  const [lstPeriodicSchedule, setLstPeriodicSchedule] = useState(defaultPeriodicSchedule);

  const refOptionStartTime = useRef();
  const refContainerStartTime = useRef();

  const refOptionEndTime = useRef();
  const refContainerEndTime = useRef();

  const [isChooseStartTime, setIsChooseStartTime] = useState<boolean>(false);
  const [isChooseEndTime, setIsChooseEndTime] = useState<boolean>(false);

  useOnClickOutside(refOptionStartTime, () => setIsChooseStartTime(false), ["choose__start--time"]);
  useOnClickOutside(refOptionEndTime, () => setIsChooseEndTime(false), ["choose__end--time"]);

  const handleAddItemTimeEmpty = (idx) => {
    setLstPeriodicSchedule((prev) =>
      prev.map((item, index) => {
        if (index === idx) {
          return {
            ...item,
            time: [addTimePeriodicSchedule],
          };
        }

        return item;
      })
    );
  };

  const handleChangeStartTime = (e, index, idx) => {
    const value = e.target.value;

    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time].map((el, k) => {
              if (k === index) {
                return {
                  ...el,
                  start: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleChooseStartTime = (value, index, idx) => {
    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time].map((el, k) => {
              if (k === index) {
                return {
                  ...el,
                  start: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleChangeEndTime = (e, index, idx) => {
    const value = e.target.value;

    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time].map((el, k) => {
              if (k === index) {
                return {
                  ...el,
                  end: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleChooseEndTime = (value, index, idx) => {
    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time].map((el, k) => {
              if (k === index) {
                return {
                  ...el,
                  end: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleAddItemTime = (idx) => {
    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time, defaultPeriodicSchedule],
          };
        }

        return item;
      })
    );
  };

  const handleDeleteItemTime = (index, idx) => {
    setLstPeriodicSchedule((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            time: [...item.time].filter((_, k) => k !== index),
          };
        }

        return item;
      })
    );
  };

  const [hasPeriodicSchedule, setHasPeriodicSchedule] = useState<boolean>(true);

  // memoize handler để ref ổn định
  const handleChange = useCallback((newList: UploadedItem[]) => {
    setListImageWork(newList);
  }, []);

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên công việc",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Nội dung công việc",
          name: "content",
          type: "textarea",
          fill: true,
        },
        {
          label: "Bắt đầu",
          name: "startTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          isWarning: startDay > endDay,
          hasSelectTime: true,
          placeholder: "Nhập ngày bắt đầu",
          messageWarning: "Ngày bắt đầu nhỏ hơn ngày kết thúc",
        },
        {
          label: "Kết thúc",
          name: "endTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          isWarning: endDay < startDay,
          hasSelectTime: true,
          placeholder: "Nhập ngày kết thúc",
          messageWarning: "Ngày kết thúc lớn hơn ngày bắt đầu",
        },
        {
          name: "workLoad",
          type: "custom",
          snippet: (
            <div className="wrapper__workload">
              <NummericInput
                id="workLoad"
                name="workLoad"
                label="Khối lượng công việc"
                value={formData?.values?.workLoad}
                fill={true}
                placeholder="Nhập khối lượng công việc"
                required={true}
                error={validateWordLoad || (formData?.values?.workLoad !== "" && formData?.values?.workLoad == 0)}
                message={`${
                  validateWordLoad
                    ? "Vui lòng nhập khối lượng công việc"
                    : formData?.values?.workLoad !== "" && formData?.values?.workLoad == 0
                    ? "Khối lượng công việc cần lớn hơn 0"
                    : ""
                }`}
                onValueChange={(e) => handleChangeValueWorkLoad(e)}
              />

              <div className="option__time--workload" ref={refContainerTimeWorkLoad}>
                <div
                  className="selected__item--workload"
                  onClick={() => {
                    setIsOptionTimeWorkLoad(!isOptionTimeWorkLoad);
                  }}
                >
                  {dataTimeWorkLoad.label}
                  <Icon name="ChevronDown" />
                </div>
                {isOptionTimeWorkLoad && (
                  <ul className="menu__time--workload" ref={refOptionTimeWorkLoad}>
                    {listOptionTimeWorkLoad.map((item, idx) => (
                      <li
                        key={idx}
                        className={`item--workload ${dataTimeWorkLoad.value === item.value ? "active__item--workload" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setDataTimeWorkLoad(item);
                          setIsOptionTimeWorkLoad(false);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ),
        },
        {
          name: "docLink",
          type: "custom",
          snippet: (
            <AttachmentUploader value={listImageWork} placeholderLabel="Tải tài liệu lên" onChange={handleChange} multiple={true} maxFiles={10} />
          ),
        },
        // {
        //   name: "docLink",
        //   type: "custom",
        //   snippet: (
        //     <div className="attachments">
        //       <label className="title-attachment">Tải tài liệu</label>
        //       <div className={listImageWork.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
        //         {listImageWork.length === 0 ? (
        //           <label htmlFor="imageUpload" className="action-upload-image">
        //             <div className="wrapper-upload">
        //               <Icon name="Upload" />
        //               Tải tài liệu lên
        //             </div>
        //           </label>
        //         ) : (
        //           <Fragment>
        //             <div className="d-flex align-items-center">
        //               {listImageWork.map((item, idx) => (
        //                 <div key={idx} className="image-item">
        //                   <img
        //                     src={item.type == "xlsx" ? ImgExcel : item.type === "docx" ? ImgWord : item.type === "pptx" ? ImgPowerpoint : item.url}
        //                     alt="image-warranty"
        //                   />
        //                   <span className="icon-delete" onClick={() => handleRemoveImageItem(idx)}>
        //                     <Icon name="Trash" />
        //                   </span>
        //                 </div>
        //               ))}
        //               <label htmlFor="imageUpload" className="add-image">
        //                 <Icon name="PlusCircleFill" />
        //               </label>
        //             </div>
        //           </Fragment>
        //         )}
        //       </div>
        //       <input
        //         type="file"
        //         accept="image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
        //         className="d-none"
        //         id="imageUpload"
        //         onChange={(e) => handleUploadDocument(e)}
        //       />
        //     </div>
        //   ),
        // },
        {
          name: "wteId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="wteId"
              name="wteId"
              label="Loại công việc"
              options={[]}
              fill={true}
              value={dataWorkType ? dataWorkType : ""}
              onChange={(e) => handleChangeValueWorkType(e)}
              isAsyncPaginate={true}
              placeholder="Chọn loại công việc"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionWorkType}
            />
          ),
        },
        ...(type && type === "opportunity"
          ? [
              {
                name: "opportunityId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    id="opportunityId"
                    name="opportunityId"
                    label="Cơ hội"
                    options={[]}
                    fill={true}
                    required={true}
                    disabled={disableOpportunity ? true : false}
                    value={dataWorkOpt}
                    onChange={(e) => handleChangeValueWorkOpt(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn cơ hội"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionWorkOpt}
                    error={validateOpt}
                    message="Vui lòng chọn cơ hội"
                  />
                ),
              },
              ...(isShowProject
                ? [
                    {
                      name: "projectId",
                      type: "custom",
                      snippet: (
                        <SelectCustom
                          id="projectId"
                          name="projectId"
                          label="Dự án"
                          options={[]}
                          fill={true}
                          required={false}
                          value={dataWorkProject}
                          onChange={(e) => handleChangeValueWorkProject(e)}
                          isAsyncPaginate={true}
                          placeholder="Chọn dự án"
                          additional={{
                            page: 1,
                          }}
                          loadOptionsPaginate={loadedOptionWorkProject}
                          error={validateProject}
                          message="Vui lòng chọn dự án"
                        />
                      ),
                    },
                  ]
                : []),
            ]
          : [
              {
                name: "projectId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    id="projectId"
                    name="projectId"
                    label="Dự án"
                    options={[]}
                    fill={true}
                    required={true}
                    value={dataWorkProject}
                    onChange={(e) => handleChangeValueWorkProject(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn dự án"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionWorkProject}
                    error={validateProject}
                    message="Vui lòng chọn dự án"
                  />
                ),
              },
            ]),
        {
          name: "managerId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="managerId"
              name="managerId"
              label="Người giao việc"
              options={[]}
              fill={true}
              required={true}
              value={dataManager}
              onChange={(e) => handleChangeValueManager(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn người giao việc"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionManager}
              formatOptionLabel={formatOptionLabelManager}
            />
          ),
        },
        {
          name: "managerId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="employeeId"
              name="employeeId"
              label="Người nhận việc"
              options={[]}
              fill={true}
              required={true}
              value={dataEmployee}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn người nhận việc"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
            />
          ),
        },
        {
          name: "participants",
          type: "custom",
          snippet: (
            <SelectCustom
              id="participants"
              name="participants"
              label="Người tham gia"
              fill={true}
              options={[]}
              isMulti={true}
              value={dataParticipants}
              onChange={(e) => handleChangeValueParticipant(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionParticipant}
              placeholder="Chọn người tham gia"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelParticipant}
            />
          ),
        },
        {
          name: "participants",
          type: "custom",
          snippet: (
            <SelectCustom
              id="customers"
              name="customers"
              label="Khách hàng liên quan"
              fill={true}
              options={[]}
              isMulti={true}
              value={dataPeopleInvolved}
              onChange={(e) => handleChangeValuePeopleInvolved(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionPeopleInvolved}
              placeholder="Chọn người tham gia"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelPeopleInvolved}
              disabled={customerId ? true : false}
            />
          ),
        },
        {
          name: "notification",
          type: "custom",
          snippet: (
            <div className="notification-calendar">
              <div className="info-notification">
                <div className="setting-time">
                  <label className="title-time">Cài đặt thời gian thông báo</label>
                  <div className="desc-choose">
                    <div className="choose-time">
                      <SelectCustom
                        fill={true}
                        special={true}
                        value={valueTime}
                        options={valueDecisionTime.value == "1" ? listDay : valueDecisionTime.value == "2" ? listHour : listMinute}
                        onChange={(e) => handleChangeValueTime(e)}
                      />
                    </div>
                    <div className="decision-time" ref={refContainerDecisionTime}>
                      <div
                        className="select__decision-time"
                        onClick={() => {
                          setIsOptionDecisionTime(!isOptionDecisionTime);
                        }}
                      >
                        {valueDecisionTime.label}
                        <Icon name="ChevronDown" />
                      </div>
                      {isOptionDecisionTime && (
                        <ul className="menu__time" ref={refOptionDecisionTime}>
                          {listOption.map((item, idx) => {
                            return (
                              <li
                                key={idx}
                                className={`${valueDecisionTime.value === item.value ? "active__item--item" : "item-time"}`}
                                onClick={(e) => {
                                  e && e.preventDefault();
                                  setValueDecisionTime(item as any);
                                  setIsOptionDecisionTime(false);
                                }}
                              >
                                {item.label}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <div className="choose-notification">
                  <CheckboxList
                    title="Thông báo qua"
                    options={listNotificationType}
                    value={dataApplyNotification.method.join()}
                    onChange={(e) => handleChangeValueNofiType(e)}
                  />
                </div>
              </div>

              <div className="lst__nitification--apply">
                <div
                  className={`${dataApplyNotification.method.length <= 0 ? "disabled__apply-notification" : "apply-notification"}`}
                  title={`${dataApplyNotification.method.length <= 0 ? "Bạn chưa chọn thông báo qua app, email hay sms !" : ""}`}
                  onClick={() => handApplyNotification()}
                >
                  Áp dụng
                </div>

                {dataListNotification && dataListNotification.length > 0 && (
                  <div className="list__apply--notification">
                    {dataListNotification.map((item, idx) => {
                      return (
                        <div key={idx} className="apply-item">
                          <h4 className="name-notification">{`Thông báo trước ${
                            item.time.day ? `${item.time.day} ngày` : item.time.hour ? `${item.time.hour} giờ` : `${item.time.minute} phút`
                          } qua ${item.method.join(", ")}`}</h4>

                          <span
                            title="Xóa"
                            className="remove-notification"
                            onClick={(e) => {
                              e && e.preventDefault();
                              handleRemoveApplyNotification(idx);
                            }}
                          >
                            <Icon name="Trash" />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ),
        },
        {
          name: "periodicSchedule",
          type: "custom",
          snippet: (
            <div className="box__periodic--schedule">
              <Switch label="Lịch định kỳ" checked={hasPeriodicSchedule} onChange={() => setHasPeriodicSchedule(!hasPeriodicSchedule)} />

              {hasPeriodicSchedule && (
                <div className="lst__option--periodic--schedule">
                  {lstPeriodicSchedule.map((item, idx) => {
                    return (
                      <div key={idx} className="item__periodic--schedule">
                        <span className="name__option">{item.name}</span>

                        <div className="choose__setting--schedule">
                          <div className="lst__choose--time">
                            {item.time && item.time.length === 0 ? (
                              <div className="item-empty--time">
                                <div className="name-empty">Bận</div>
                                <div className="add--time" onClick={() => handleAddItemTimeEmpty(idx)}>
                                  <Icon name="PlusCircleFill" />
                                </div>
                              </div>
                            ) : (
                              item.time.map((el, index) => {
                                return (
                                  <div key={index} className="item__choose--time">
                                    <div className="data__time">
                                      <div className="form-time" ref={refContainerStartTime}>
                                        <Input
                                          name="startTime"
                                          className="dept-time"
                                          value={el.start}
                                          fill={true}
                                          placeholder="HH:MM"
                                          autoComplete="off"
                                          onChange={(e) => handleChangeStartTime(e, index, idx)}
                                          onClick={() => setIsChooseStartTime(true)}
                                        />

                                        {isChooseStartTime && (
                                          <div className="choose__item--time choose__start--time" ref={refOptionStartTime}>
                                            <ul className="lst__time--choose">
                                              {timeSlots.map((item, idxs) => {
                                                return (
                                                  <li
                                                    key={idxs}
                                                    className={`item-choose ${el.start == item.label ? "item-choose--active" : ""}`}
                                                    onClick={() => {
                                                      handleChooseStartTime(item.label, index, idx);
                                                      setIsChooseStartTime(false);
                                                    }}
                                                  >
                                                    {item.label}
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                      <span className="to-time">đến</span>
                                      <div className="form-time" ref={refContainerEndTime}>
                                        <Input
                                          name="endTime"
                                          className="dept-time"
                                          value={el.end}
                                          fill={true}
                                          placeholder="HH:MM"
                                          autoComplete="off"
                                          onChange={(e) => handleChangeEndTime(e, index, idx)}
                                          onClick={() => setIsChooseEndTime(true)}
                                        />

                                        {isChooseEndTime && (
                                          <div className="choose__item--time choose__end--time" ref={refOptionEndTime}>
                                            <ul className="lst__time--choose">
                                              {timeSlots.map((item, idxs) => {
                                                return (
                                                  <li
                                                    key={idxs}
                                                    className={`item-choose ${el.end == item.label ? "item-choose--active" : ""}`}
                                                    onClick={() => {
                                                      handleChooseEndTime(item.label, index, idx);
                                                      setIsChooseEndTime(false);
                                                    }}
                                                  >
                                                    {item.label}
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="action__time">
                                      <div className="action__time--item action__time--add" onClick={() => handleAddItemTime(idx)}>
                                        <Icon name="PlusCircleFill" />
                                      </div>
                                      {item.time.length > 1 && (
                                        <div className="action__time--item action__time--delete" onClick={() => handleDeleteItemTime(index, idx)}>
                                          <Icon name="Trash" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ),
        },
        {
          label: "Mức độ ưu tiên",
          name: "priorityLevel",
          type: "radio",
          options: [
            {
              label: "Thấp",
              value: "1",
            },
            {
              label: "Trung bình",
              value: "2",
            },
            {
              label: "Cao",
              value: "3",
            },
            {
              label: "Rất cao",
              value: "4",
            },
          ],
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [
      startDay,
      endDay,
      listOptionTimeWorkLoad,
      isOptionTimeWorkLoad,
      dataTimeWorkLoad,
      validateWordLoad,
      formData?.values,
      listImageWork,
      dataWorkProject,
      dataWorkOpt,
      validateProject,
      validateOpt,
      dataManager,
      dataEmployee,
      dataParticipants,
      dataPeopleInvolved,
      valueDecisionTime,
      valueTime,
      isOptionDecisionTime,
      dataApplyNotification,
      dataListNotification,
      customerId,
      lstPeriodicSchedule,
      hasPeriodicSchedule,
      isChooseStartTime,
      isChooseEndTime,
    ]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (!formData?.values?.workLoad) {
      setValidateWordLoad(true);
      return;
    }

    if (type !== "opportunity" && !formData?.values?.projectId) {
      setValidateProject(true);
      return;
    } else if (type === "opportunity" && !formData?.values?.opportunityId) {
      setValidateOpt(true);
      return;
    }

    setIsSubmit(true);

    const body: IWorkOrderRequestModel = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as IWorkOrderRequestModel),
      docLink: JSON.stringify(formData.values.docLink),
      customers: JSON.stringify(formData.values.customers),
      participants: JSON.stringify(formData.values.participants),
      notification: JSON.stringify(formData.values.notification),
    };

    const response = await WorkOrderService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} công việc thành công`, "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setDataEmployee(null);
    setDataManager(null);
    setDataParticipants([]);
    setDataPeopleInvolved([]);
    setDataWorkProject(null);
    setDataWorkOpt(null);
    setDataWorkType(null);
    setDataTimeWorkLoad({ value: "H", label: "Giờ" });
    setValueDecisionTime({ value: "3", label: "Phút" });
    setValueTime(null);
    setDataApplyNotification({ method: [], time: { day: 0, hour: 0, minute: 0 } });
    setDataListNotification([]);
    setData(null);
    setListImageWork([]);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_left: {
        buttons:
          startDate && endDate && idWork
            ? [
                {
                  title: "Xoá",
                  color: "destroy",
                  variant: "outline",
                  disabled: isSubmit,
                  callback: () => showDialogConfirmCancelDelete(idWork),
                },
              ]
            : [],
      },
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              _.isEqual(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: idWork ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              startDay > endDay ||
              endDay < startDay ||
              validateWordLoad ||
              validateProject ||
              (formData?.values?.workLoad !== "" && formData?.values?.workLoad == 0) ||
              _.isEqual(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, startDay, endDay, validateWordLoad, validateProject, startDate, endDate, idWork]
  );

  const onDelete = async (id?: number) => {
    const response = await WorkOrderService.delete(id);

    if (response.code == 0) {
      showToast("Xóa công việc thành công", "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmCancelDelete = (id?: number) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa công việc</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa
          <strong> {data?.name}</strong>? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (id) {
          onDelete(id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
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
        handleClearForm(false);
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
          handleClearForm(false);
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
        size="lg"
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-work"
      >
        <form className="form-add-work" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${idWork ? "Chỉnh sửa" : "Thêm mới"} công việc`} toggle={() => !isSubmit && handleClearForm(false)} />
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
