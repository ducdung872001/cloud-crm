import React, { Fragment, useState, useEffect, useRef, useContext } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { IOption } from "model/OtherModel";
import { AddContractModalProps } from "model/contract/PropsModel";
import { IContractRequest } from "model/contract/ContractRequestModel";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IEmployeeResponse } from "model/employee/EmployeeResponseModel";
import { IContractPipelineResponse } from "model/contractPipeline/ContractPipelineResponseModel";
import { IContractPipelineFilterRequest } from "model/contractPipeline/ContractPipelineRequestModel";
// import { IContractStageResponse } from "model/contractApproach/ContractStageResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Checkbox from "components/checkbox/checkbox";
import RadioList from "components/radio/radioList";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import ContractService from "services/ContractService";
import BeautyBranchService from "services/BeautyBranchService";
import EmployeeService from "services/EmployeeService";
import ContractPipelineService from "services/ContractPipelineService";
import ContractStageService from "services/ContractStageService";
import ContractExtraInfoService from "services/ContractExtraInfoService";
import ContractAttributeService from "services/ContractAttributeService";
import { SelectOptionData } from "utils/selectCommon";
import { convertToId, formatCurrency } from "reborn-util";
import { Parser } from "formula-functionizer";
import ImageThirdGender from "assets/images/third-gender.png";
import ContactService from "services/ContactService";
import CheckboxList from "components/checkbox/checkboxList";

import "tippy.js/animations/scale-extreme.css";
import "./PaymentBill.scss";
import ContractProduct from "services/ContractProduct";
import RentalTypeService from "services/RentalTypeService";
import { ContextType, UserContext } from "contexts/userContext";
import ContractCategoryService from "services/ContractCategoryService";
import { uploadDocumentFormData } from "utils/document";
import AddFile from "./partials/AddFile";
import Tippy from "@tippyjs/react";
import WorkProjectService from "services/WorkProjectService";
import ChangeHistoryModal from "../ChangeHistoryModal/ChangeHistoryModal";
import FSQuoteService from "services/FSQuoteService";
/**
 * Hiển thị thông tin chi tiết kiểu dữ liệu nhập liệu
 * @param props
 * @returns
 */
export default function PaymentBill(props: AddContractModalProps) {
  const {
    data,
    setDataPaymentBill,
    idCustomer,
    title,
    setContractId,
    setTab,
    contractId,
    pipelineUrl,
    setInfoFile,
    infoFile,
    listService,
    setListService,
    listLogValue,
    fieldData,
    setFieldData,
    showModalLog,
    setShowModalLog,
    callback,
  } = props;

  const navigate = useNavigate();
  const parser = new Parser();

  const checkUserRoot = localStorage.getItem("user.root");
  const takeInfoCustomerInLocalStorage = localStorage.getItem("infoCustomer");
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [formData, setFormData] = useState<IContractRequest>(data);

  const [contractExtraInfos, setContractExtraInfos] = useState<any>([]);

  const [mapContractAttribute, setMapContractAttribute] = useState<any>(null);

  //Dùng cho lookup
  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);
  const [dataPeopleInvolved, setDataPeopleInvolved] = useState([]);

  //Hình thành ra trường thông tin động của tất cả (hợp đồng || trường thông tin động)
  const [dynamicObject, setDynamicObject] = useState<any>(null);

  useEffect(() => {
    if (data?.branchId) {
      setDetailBranch({ value: data?.branchId, label: data?.branchName });
    }

    setDetailCategory(data?.categoryId ? { value: data?.categoryId, label: data?.categoryName } : null);
    getContractAttributes(data?.categoryId);
    setDetailProject(data?.projectId ? { value: data?.projectId, label: data?.projectName } : null);
    setDetailFS(data?.fsId ? { value: data?.fsId, label: data?.fsName } : null);
    setDetailPipline(data?.pipelineId ? { value: data?.pipelineId, label: data?.pipelineName } : null);
    setDetailEmployee({ value: data?.employeeId, label: data?.employeeName });
    setCodeSuggest(data?.requestId ? { value: data?.requestId, label: data?.requestCode } : null);
    // setListService(data?.products?.length > 0 ? data.products : [] )
    // setDataPeopleInvolved(data.peopleInvolved && (data.peopleInvolved.length === 0 ? [] : JSON.parse(data.peopleInvolved)));

    //Lấy trước các thông tin sau
    if (data?.id) {
      onSelectOpenEmployee();
      onSelectOpenContract();
      onSelectOpenCustomer();
      onSelectOpenContact();
    }
  }, [data, idCustomer, dataBranch]);

  useEffect(() => {
    //Lấy thông tin contractExtraInfos
    if (data?.id) {
      getContractExtraInfos();
    }
  }, [data?.id]);

  const getContractExtraInfos = async () => {
    const response = await ContractExtraInfoService.list(data?.id);
    if (response.code === 0) {
      const result = response.result?.map((item) => {
        return {
          attributeId: item.attributeId,
          contractId: item.contractId,
          attributeValue: item.attributeValue,
        };
      });
      setContractExtraInfos(result);
    }
  };

  const getContractAttributes = async (categoryId) => {
    // if (!mapContractAttribute || mapContractAttribute.length === 0) {
    //   const response = await ContractAttributeService.listAll({categoryId: categoryId});
    //   if (response.code === 0) {
    //     const dataOption = response.result;
    //     setMapContractAttribute(dataOption || {});
    //   }
    // }
    const response = await ContractAttributeService.listAll({ categoryId: categoryId });
    if (response.code === 0) {
      const dataOption = response.result;
      setMapContractAttribute(dataOption || {});
    }
  };

  // Chi tiết 1 chi nhánh
  const [detailBranch, setDetailBranch] = useState(null);
  const [validateFieldBranch, setValidateFieldBranch] = useState<boolean>(false);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [validateFieldEmployee, setValidateFieldEmployee] = useState<boolean>(false);
  const [detailProject, setDetailProject] = useState(null);
  const [validateFieldProject, setValidateFieldProject] = useState<boolean>(false);
  const [detailFS, setDetailFS] = useState(null);
  const [validateFieldFS, setValidateFieldFS] = useState<boolean>(false);
  const [detailCategory, setDetailCategory] = useState(null);
  const [validateFieldCategory, setValidateFieldCategory] = useState<boolean>(false);
  const [detailPipeline, setDetailPipline] = useState(null);
  const [validateFieldPipeline, setValidateFieldPipeline] = useState<boolean>(false);

  useEffect(() => {
    setDetailBranch(dataBranch);
  }, [dataBranch]);

  //? đoạn này xử lý vấn đề call api lấy ra danh sách chi nhánh
  const loadOptionBranch = async (search, loadedOptions, { page }) => {
    const param: IBeautyBranchFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IBeautyBranchResponse) => {
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

  //? đoạn này xử lý vấn đề thay đổi chi nhánh
  const handleChangeValueBranch = (e) => {
    setValidateFieldBranch(false);
    setDetailBranch(e);
  };

  //? danh sách người phụ trách
  const loadOptionEmployee = async (search, loadedOptions, { page }) => {
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
            ? dataOption.map((item: IEmployeeResponse) => {
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

  //? đoạn này xử lý vấn đề thay đổi nhân viên phụ trách
  const handleChangeValueEmployee = (e) => {
    setValidateFieldEmployee(false);
    // setDetailEmployee(e);
    // setFormData({ ...formData, employeeId: e.value });
    setDataPaymentBill({ ...data, employeeId: e.value, employeeName: e.label });
  };

  //? danh sách người liên quan
  const loadOptionPeopleInvolve = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await ContactService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IEmployeeResponse) => {
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

  //? đoạn này xử lý vấn đề chon người liên quan
  const handleChangeValuePeopleInvolved = (e) => {
    // setDataPeopleInvolved(e);
    setDataPaymentBill({ ...data, peopleInvolved: e ? JSON.stringify(e) : "[]" });
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

  //Dự án
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

  //? đoạn này xử lý vấn đề thay đổi loại hợp đồng
  const handleChangeValueProject = (e) => {
    setValidateFieldProject(false);
    setDataPaymentBill({ ...data, projectId: e.value, projectName: e.label });
  };

  const loadOptionFS = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      status: 2,
      projectId: detailProject?.value,
    };
    const response = await FSQuoteService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
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

  useEffect(() => {
    loadOptionFS("", undefined, { page: 1 });
  }, [detailProject]);

  //? đoạn này xử lý vấn đề thay đổi loại hợp đồng
  const handleChangeValueFS = (e) => {
    setValidateFieldFS(false);
    setDataPaymentBill({ ...data, fsId: e.value, fsName: e.label });
  };

  /**
   * Tìm kiếm loại hợp đồng
   * @param search
   * @param loadedOptions
   * @param param2
   * @returns
   */
  const loadOptionCategory = async (search, loadedOptions, { page }) => {
    const param: IContractPipelineFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await ContractCategoryService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

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
  const handleChangeValueCategory = (e) => {
    setValidateFieldCategory(false);
    setDataPaymentBill({ ...data, categoryId: e.value, categoryName: e.label });

    getContractAttributes(e.value);
  };

  /**
   * Tìm kiếm các pha của hợp đồng
   * @param search
   * @param loadedOptions
   * @param param2
   * @returns
   */
  const loadOptionPipeline = async (search, loadedOptions, { page }) => {
    const param: IContractPipelineFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    // const response = await ContractStageService.list(+data.pipelineId);
    const response = await ContractPipelineService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
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

  //? đoạn này xử lý vấn đề thay đổi loại hợp đồng
  const handleChangeValuePipeline = (e) => {
    setValidateFieldPipeline(false);
    // setDetailStage(e);
    // setFormData({ ...formData, stageId: e.value });
    setDataPaymentBill({ ...data, pipelineId: e.value, pipelineName: e.label });
  };

  // validate ngày tháng
  const [validateFieldSignDate, setValidateFieldSignDate] = useState<boolean>(false);
  const [validateFieldAffectedDate, setValidateFieldAffectedDate] = useState<boolean>(false);
  const [validateFieldEndDate, setValidateFieldEndDate] = useState<boolean>(false);
  const [validateFieldAdjustDate, setValidateFieldAdjustDate] = useState<boolean>(false);
  const [validateFieldDeliveryDate, setValidateFieldDeliveryDate] = useState<boolean>(false);
  const [validateFieldBillStartDate, setValidateFieldBillStartDate] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề thay đổi ngày ký
  const handleChangeValueSignDate = (e) => {
    setValidateFieldSignDate(false);
    const newSignDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
    setDataPaymentBill({ ...data, signDate: newSignDate });
  };

  const handleChangeValueAffectedDate = (e) => {
    setValidateFieldAffectedDate(false);
    const newAffectedDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
    setDataPaymentBill({ ...data, affectedDate: newAffectedDate });
  };

  const handleChangeValueEndDate = (e) => {
    setValidateFieldEndDate(false);
    const newEndDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
    setDataPaymentBill({ ...data, endDate: newEndDate });
  };

  const handleChangeValueAdjustDate = (e) => {
    setValidateFieldAdjustDate(false);
    const newAdjustDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));

    // setFormData({ ...formData, adjustDate: newAdjustDate });
    setDataPaymentBill({ ...data, adjustDate: newAdjustDate });
  };

  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState(0);

  //Tải mẫu hợp đồng
  const takeFileAdd = (data) => {
    if (data) {
      setIsLoadingFile(true);
      uploadDocumentFormData(data, onSuccess, onError, onProgress);
    }
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent.toFixed(0));
      // if (percent === 100) {
      //   setShowProgress(0);
      // }
    }
  };

  //* Đoạn này nhận link file đã chọn
  const onSuccess = (data) => {
    if (data) {
      setInfoFile(data);
      setDataPaymentBill((preState) => ({ ...preState, template: { fileUrl: data.fileUrl, fileName: data.fileName } }));
      setIsLoadingFile(false);
    }
  };

  //* Đoạn này nếu như mà lỗi không tải lên được thì bắn ra thông báo
  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  useEffect(() => {
    if (isLoadingFile === false) {
      setShowProgress(0);
    }
  }, [isLoadingFile]);

  //! xử lý gửi dữ liệu đi
  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (data?.branchId == null && +checkUserRoot == 1) {
      setValidateFieldBranch(true);
      return;
    }

    if (!data?.signDate) {
      setValidateFieldSignDate(true);
      showToast("Vui lòng chọn ngày ký", "error");
      return;
    }

    if (!data?.affectedDate) {
      setValidateFieldAffectedDate(true);
      showToast("Vui lòng chọn ngày hiệu lực", "error");
      return;
    }

    if (!data?.endDate) {
      setValidateFieldEndDate(true);
      showToast("Vui lòng chọn ngày hết hạn", "error");
      return;
    }

    // if (!data?.adjustDate) {
    //   setValidateFieldAdjustDate(true);
    //   showToast("Vui lòng chọn ngày đến hạn điều chỉnh giá", "error");
    //   return;
    // }

    if (!detailCategory) {
      setValidateFieldCategory(true);
      showToast("Vui lòng chọn loại hợp đồng", "error");
      return;
    }

    if (!detailPipeline) {
      setValidateFieldPipeline(true);
      showToast("Vui lòng chọn giai đoạn hợp đồng", "error");
      return;
    }

    // if (!data?.deliveryDate) {
    //   setValidateFieldDeliveryDate(true);
    //   showToast("Vui lòng chọn ngày bàn giao", "error");
    //   return;
    // }

    // if (!data?.billStartDate) {
    //   setValidateFieldBillStartDate(true);
    //   showToast("Vui lòng chọn ngày bắt đầu tính tiền thuê", "error");
    //   return;
    // }

    ///check validate các trường động
    if (
      mapContractAttribute &&
      Object.entries(mapContractAttribute) &&
      Array.isArray(Object.entries(mapContractAttribute)) &&
      Object.entries(mapContractAttribute).length > 0
    ) {
      const newArray = Object.entries(mapContractAttribute);
      let checkArray = [];

      newArray.map((lstContractAttribute: any, key: number) => {
        (lstContractAttribute[1] || []).map((item) => {
          if (item.required === 1 && item.parentId !== 0) {
            checkArray.push(item);
          }
        });
      });

      if (checkArray.length > 0) {
        if (contractExtraInfos.length === 0) {
          showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
          return;
        } else {
          let check = false;
          checkArray.map((i) => {
            const index = contractExtraInfos.findIndex((el) => el.attributeId === i.id);
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

    const body: any = {
      ...(data as IContractRequest),
      ...(data ? { id: data.id } : {}),
      // ...(data ? { template: JSON.stringify(data.template) } : {}),
      ...(infoFile && infoFile?.fileUrl ? { template: JSON.stringify({ fileUrl: infoFile.fileUrl, fileName: infoFile?.fileName || "" }) } : {}),
      ...(listService?.length > 0 ? { products: listService } : {}),
      // peopleInvolved: dataPeopleInvolved ? JSON.stringify(dataPeopleInvolved) : "[]",
      // rentalTypes: dataRentalTypeId,
      contractExtraInfos: contractExtraInfos,
    };

    setIsSubmit(true);

    const response = await ContractService.update(body);

    if (response.code === 0) {
      showToast(`${title} thành công`, "success");
      setContractId(response.result?.id);
      setDataPaymentBill({ ...data, id: response.result?.id });
      if (data?.id) {
        callback();
      }
      navigate("/edit_contract/" + response.result?.id);
      // setTab(2);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const showDialogConfirmDelete = () => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy thay đổi hợp đồng</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy thay đổi hợp đồng này? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);

        //Chuyển hướng về trang danh sách
        navigate("/contract");
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  /**
   * Hiển thị giá trị theo công thức
   * @param attributes
   * @param isFormula
   */
  const getContractAttributeFormula = (attributes) => {
    let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attrObj = {};
    (contractExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        attrObj["contractAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });

    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  const getContractAttributeValue = (attributeId) => {
    let attributeValue = "";
    (contractExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return attributeValue;
  };

  const updateContractMultiselectAttribute = (attributeId, e) => {
    let attributeValue = e ? e.split(",") : [];
    updateContractAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const updateContractAttribute = (attributeId, attributeValue) => {
    let contractId = data?.id || 0;

    let found = false;
    (contractExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        item.contractId = contractId;
        found = true;
      }
    });

    if (!found) {
      let item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      item.contractId = contractId;
      contractExtraInfos[contractExtraInfos.length] = item;
    }

    setContractExtraInfos([...contractExtraInfos]);
    setDataPaymentBill({ ...data, timestamp: new Date().getTime() });
  };

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

  const handleChangeValueCustomerItem = (e, contractAttribute) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value);
  };

  const onSelectOpenEmployee = async () => {
    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId");

      if (dataOption) {
        setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  const handleChangeValueEmployeeItem = (e, contractAttribute) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value);
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

  const handleChangeValueContractItem = (e, contractAttribute) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value);
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

  const handleChangeValueContactItem = (e, contractAttribute) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value);
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

  /**
   * Trả về loại control theo kiểu dữ liệu tương ứng
   */
  const getControlByType = (contractAttribute, logValue) => {
    let CustomControl = (
      <Input
        id={`Id${contractAttribute.id}`}
        label={contractAttribute.name}
        fill={true}
        value={getContractAttributeValue(contractAttribute.id)}
        onChange={(e) => updateContractAttribute(contractAttribute.id, e.target.value)}
        placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
        required={!!contractAttribute.required}
        readOnly={!!contractAttribute.readonly}
        warningHistory={listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0 ? true : false}
        onWarningHistory={() => {
          if (listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0) {
            setShowModalLog(true);
            setFieldData({
              name: contractAttribute.fieldName,
              type: "text",
            });
          }
        }}
      />
    );

    switch (contractAttribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={contractAttribute.name}
            name={contractAttribute.name}
            value={getContractAttributeValue(contractAttribute.id)}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            fill={true}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            onChange={(e) => updateContractAttribute(contractAttribute.id, e.target.value)}
            maxLength={459}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={contractAttribute.name}
            name={contractAttribute.name}
            fill={true}
            required={!!contractAttribute.required}
            value={getContractAttributeValue(contractAttribute.id)}
            thousandSeparator={true}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            decimalScale={getDecimalScale(contractAttribute.attributes)}
            onChange={(e) => {
              const value = e.target.value;
              let valueNum = value?.replace(/,/g, "");
              updateContractAttribute(contractAttribute.id, valueNum);
            }}
            warningHistory={listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0 ? true : false}
            onWarningHistory={() => {
              if (listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0) {
                setShowModalLog(true);
                setFieldData({
                  name: contractAttribute.fieldName,
                  type: "number",
                });
              }
            }}
          />
        );
        break;
      case "dropdown":
        CustomControl = (
          <SelectCustom
            name={contractAttribute.name}
            label={contractAttribute.name}
            fill={true}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            // error={validateFieldPipeline}
            // message="Loại hợp đồng không được bỏ trống"
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            value={getContractAttributeValue(contractAttribute.id)}
            onChange={(e) => {
              updateContractAttribute(contractAttribute.id, e.value);
            }}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            warningHistory={listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0 ? true : false}
            onWarningHistory={() => {
              if (listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0) {
                setShowModalLog(true);
                setFieldData({
                  name: contractAttribute.fieldName,
                  type: "select",
                });
              }
            }}
          />
        );
        break;
      case "multiselect":
        let attris = getContractAttributeValue(contractAttribute.id);
        CustomControl = (
          <CheckboxList
            title={contractAttribute.name}
            required={!!contractAttribute.required}
            disabled={!!contractAttribute.readonly}
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            value={attris ? JSON.parse(attris).join(",") : ""}
            onChange={(e) => {
              updateContractMultiselectAttribute(contractAttribute.id, e);
            }}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            checked={!!getContractAttributeValue(contractAttribute.id)}
            label={contractAttribute.name}
            onChange={(e) => {
              updateContractAttribute(contractAttribute.id, e.target.checked);
            }}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={contractAttribute.name}
            title={contractAttribute.name}
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            value={getContractAttributeValue(contractAttribute.id)}
            onChange={(e) => {
              updateContractAttribute(contractAttribute.id, e.target.value);
            }}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={contractAttribute.name}
            name={contractAttribute.name}
            fill={true}
            value={getContractAttributeValue(contractAttribute.id)}
            onChange={(e) => {
              const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
              updateContractAttribute(contractAttribute.id, newDate);
            }}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            iconPosition="left"
            icon={<Icon name="Calendar" />}
            isMaxDate={false}
            // error={validateFieldSignDate}
            // message={`Vui lòng chọn ${contractAttribute.name.toLowerCase()}`}
            warningHistory={listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0 ? true : false}
            onWarningHistory={() => {
              if (listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0) {
                setShowModalLog(true);
                setFieldData({
                  name: contractAttribute.fieldName,
                  type: "date",
                });
              }
            }}
          />
        );
        break;
      case "lookup":
        let attrs = contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : {};

        //1. Trường hợp là customer (khách hàng)
        //2. Trường hợp là employee (nhân viên)
        //3. Trường hợp là contract (hợp đồng)
        //4. Trường hợp là contact (người liên hệ)
        switch (attrs?.refType) {
          case "customer":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItem(e, contractAttribute)}
                warningHistory={listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0 ? true : false}
                onWarningHistory={() => {
                  if (listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0) {
                    setShowModalLog(true);
                    setFieldData({
                      name: contractAttribute.fieldName,
                      type: "select",
                    });
                  }
                }}
              />
            );
            break;
          case "employee":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={listEmployee || []}
                onMenuOpen={onSelectOpenEmployee}
                isLoading={isLoadingEmployee}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueEmployeeItem(e, contractAttribute)}
                warningHistory={listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0 ? true : false}
                onWarningHistory={() => {
                  if (listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0) {
                    setShowModalLog(true);
                    setFieldData({
                      name: contractAttribute.fieldName,
                      type: "select",
                    });
                  }
                }}
              />
            );
            break;
          case "contract":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={listContract || []}
                onMenuOpen={onSelectOpenContract}
                isLoading={isLoadingContract}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContractItem(e, contractAttribute)}
                warningHistory={listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0 ? true : false}
                onWarningHistory={() => {
                  if (listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0) {
                    setShowModalLog(true);
                    setFieldData({
                      name: contractAttribute.fieldName,
                      type: "select",
                    });
                  }
                }}
              />
            );
            break;
          case "contact":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={listContact || []}
                onMenuOpen={onSelectOpenContact}
                isLoading={isLoadingContact}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContactItem(e, contractAttribute)}
                warningHistory={listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0 ? true : false}
                onWarningHistory={() => {
                  if (listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0) {
                    setShowModalLog(true);
                    setFieldData({
                      name: contractAttribute.fieldName,
                      type: "select",
                    });
                  }
                }}
              />
            );
            break;
          default:
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItem(e, contractAttribute)}
                warningHistory={listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0 ? true : false}
                onWarningHistory={() => {
                  if (listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0) {
                    setShowModalLog(true);
                    setFieldData({
                      name: contractAttribute.fieldName,
                      type: "select",
                    });
                  }
                }}
              />
            );
        }
        break;
      case "formula":
        //Công thức được lấy từ trường động và trường tĩnh
        //{contract.dealValue + contractAttribute.xyz} => sẽ cần parser từ 2 đối tượng là contract và contractAttribute

        //Chỉ hiển thị chứ không lưu giá trị (nếu thêm mới thì không hiển thị?, sửa mới hiển thị)
        CustomControl = (
          <Input
            id={`Id${contractAttribute.id}`}
            label={contractAttribute.name}
            fill={true}
            value={getContractAttributeFormula(contractAttribute?.attributes)}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            disabled={true}
            warningHistory={listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0 ? true : false}
            onWarningHistory={() => {
              if (listLogValue?.filter((el) => el.fileName === contractAttribute.fieldName)?.length > 0) {
                setShowModalLog(true);
                setFieldData({
                  name: contractAttribute.fieldName,
                  type: "text",
                });
              }
            }}
          />
        );

        break;
    }

    return CustomControl;
  };

  ///list mã đề nghị mua sắm
  const [codeSuggest, setCodeSuggest] = useState(null);

  const loadedOptionCodeSuggest = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
    };

    const response = await ContractService.listCodeSuggest(param);

    if (response.code === 0) {
      const dataOption = response.result.items;
      const newOption =
        (dataOption.length > 0 &&
          dataOption.map((item) => {
            return {
              value: item.id,
              label: item.code,
              products: item.products,
            };
          })) ||
        [];

      // newOption.push({
      //   value: -1,
      //   label: 'Nhập trực tiếp',
      // })

      return {
        options: newOption,
        // options: [
        //   ...(dataOption.length > 0
        //     ? dataOption.map((item) => {
        //         return {
        //           value: item.id,
        //           label: item.code,
        //           // name: item.name
        //         };
        //       })
        //     : []),
        // ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeCodeSuggest = (e) => {
    setDataPaymentBill({ ...data, requestId: e.value, requestCode: e.label });
    setListService(e.products);
  };

  ///chi tiết mặt hàng dịch vụ
  const titleTableListService = ["Mã hàng", "Tên mặt hàng", "Số lượng", "Đơn giá", "Tiền", "VAT", "Tổng tiền", "Tên nhà cung cấp", ""];

  const handleDeleteService = (index) => {
    const newList = [...listService];
    newList.splice(index, 1);
    setListService(newList);
  };

  ///chọn mã mặt hàng
  const loadedOptionCodeService = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
    };

    const response = await ContractService.listCodeService(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.code,
                  name: item.name,
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

  const handleChangeCodeService = (e, idx) => {
    setListService((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return {
            ...obj,
            itemCode: e.label,
            item: {
              id: e.value,
              code: e.label,
              name: e.name,
            },
          };
        }
        return obj;
      })
    );
  };

  //Chọn nhà cung cấp

  const loadedOptionSupplier = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
    };

    const response = await ContractService.listSupplier(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  code: item.code,
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

  const handleChangeSupplier = (e, idx) => {
    setListService((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return {
            ...obj,
            supplierCode: e.code,
            supplier: {
              id: e.value,
              code: e.code,
              name: e.label,
            },
          };
        }
        return obj;
      })
    );
  };

  return (
    <div className="payment__bill--item">
      <label className="title__payment--bill">Thông tin hợp đồng</label>
      <form className="form__payment--bill" onSubmit={(e) => onSubmit(e)}>
        <div className="list-form-group">
          {/* {+checkUserRoot == 1 && (
            <div className="form-group">
              <SelectCustom
                id="branchId"
                name="branchId"
                label="Chi nhánh"
                fill={true}
                required={true}
                error={validateFieldBranch}
                message="Chi nhánh không được bỏ trống"
                options={[]}
                value={detailBranch}
                onChange={(e) => handleChangeValueBranch(e)}
                isAsyncPaginate={true}
                placeholder="Chọn chi nhánh"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadOptionBranch}
              />
            </div>
          )} */}

          <div className="form-group">
            <SelectCustom
              id="projectId"
              name="projectId"
              label="Dự án"
              fill={true}
              required={false}
              error={validateFieldProject}
              message="Dự án không được bỏ trống"
              options={[]}
              value={detailProject}
              onChange={(e) => handleChangeValueProject(e)}
              isAsyncPaginate={true}
              placeholder="Chọn dự án"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionProject}
              warningHistory={listLogValue?.filter((el) => el.fileName === "projectId")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "projectId")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "projectId",
                    type: "select",
                  });
                }
              }}
            />
          </div>

          <div className="form-group">
            <SelectCustom
              key={detailProject?.value}
              id="fsId"
              name="fsId"
              label="Chọn FS"
              fill={true}
              required={false}
              error={validateFieldFS}
              message="FS không được bỏ trống"
              options={[]}
              value={detailFS}
              onChange={(e) => handleChangeValueFS(e)}
              isAsyncPaginate={true}
              placeholder="Chọn FS"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionFS}
              warningHistory={listLogValue?.filter((el) => el.fileName === "fsId")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "fsId")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "fsId",
                    type: "select",
                  });
                }
              }}
            />
          </div>

          <div className="form-group">
            <SelectCustom
              id="categoryId"
              name="categoryId"
              label="Loại hợp đồng"
              fill={true}
              required={true}
              error={validateFieldCategory}
              message="Loại hợp đồng không được bỏ trống"
              options={[]}
              value={detailCategory}
              onChange={(e) => handleChangeValueCategory(e)}
              isAsyncPaginate={true}
              placeholder="Chọn loại hợp đồng"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionCategory}
              warningHistory={listLogValue?.filter((el) => el.fileName === "categoryId")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "categoryId")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "categoryId",
                    type: "select",
                  });
                }
              }}
            />
          </div>

          <div className="form-group">
            <Input
              label="Tên hợp đồng"
              name="name"
              fill={true}
              required={true}
              // value={formData?.name}
              value={data?.name}
              placeholder="Tên hợp đồng"
              onChange={(e) => {
                const value = e.target.value;
                // setFormData({ ...formData, name: value });
                setDataPaymentBill({ ...data, name: value });
              }}
              warningHistory={listLogValue?.filter((el) => el.fileName === "name")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "name")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "name",
                    type: "text",
                  });
                }
              }}
            />
          </div>

          <div className="form-group">
            <Input
              label="Số hợp đồng"
              name="contractNo"
              fill={true}
              required={true}
              value={data?.contractNo}
              placeholder="Số hợp đồng"
              onChange={(e) => {
                const value = e.target.value;
                // setFormData({ ...formData, contractNo: value });
                setDataPaymentBill({ ...data, contractNo: value });
              }}
              warningHistory={listLogValue?.filter((el) => el.fileName === "contractNo")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "contractNo")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "contractNo",
                    type: "text",
                  });
                }
              }}
            />
          </div>

          <div className="form-group">
            <DatePickerCustom
              label="Ngày ký"
              name="signDate"
              fill={true}
              value={data?.signDate?.toString()}
              onChange={(e) => handleChangeValueSignDate(e)}
              placeholder="Chọn ngày ký"
              required={true}
              iconPosition="left"
              icon={<Icon name="Calendar" />}
              isMaxDate={false}
              error={validateFieldSignDate}
              message="Vui lòng chọn ngày ký"
              warningHistory={listLogValue?.filter((el) => el.fileName === "signDate")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "signDate")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "signDate",
                    type: "date",
                  });
                }
              }}
            />
          </div>

          <div className="form-group">
            <DatePickerCustom
              label="Ngày hiệu lực"
              name="affectedDate"
              fill={true}
              value={data?.affectedDate?.toString()}
              onChange={(e) => handleChangeValueAffectedDate(e)}
              placeholder="Chọn ngày hiệu lực"
              required={true}
              iconPosition="left"
              icon={<Icon name="Calendar" />}
              isMaxDate={false}
              error={validateFieldAffectedDate}
              message="Vui lòng chọn ngày hiệu lực"
              warningHistory={listLogValue?.filter((el) => el.fileName === "affectedDate")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "affectedDate")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "affectedDate",
                    type: "date",
                  });
                }
              }}
            />
          </div>

          <div className="form-group">
            <DatePickerCustom
              label="Ngày hết hạn"
              name="endDate"
              fill={true}
              value={data?.endDate?.toString()}
              onChange={(e) => handleChangeValueEndDate(e)}
              placeholder="Chọn ngày hết hạn"
              required={true}
              iconPosition="left"
              icon={<Icon name="Calendar" />}
              isMaxDate={false}
              error={validateFieldEndDate}
              message="Vui lòng chọn ngày hết hạn"
              warningHistory={listLogValue?.filter((el) => el.fileName === "endDate")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "endDate")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "endDate",
                    type: "date",
                  });
                }
              }}
            />
          </div>

          <div className="form-group">
            <DatePickerCustom
              label="Ngày đến hạn điều chỉnh giá"
              name="adjustDate"
              fill={true}
              value={data?.adjustDate?.toString()}
              onChange={(e) => handleChangeValueAdjustDate(e)}
              placeholder="Chọn ngày"
              required={false}
              iconPosition="left"
              icon={<Icon name="Calendar" />}
              isMaxDate={false}
              error={validateFieldAdjustDate}
              message="Vui lòng chọn ngày đến hạn điều chính giá"
              warningHistory={listLogValue?.filter((el) => el.fileName === "adjustDate")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "adjustDate")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "adjustDate",
                    type: "date",
                  });
                }
              }}
            />
          </div>

          <div className="form-group">
            <Input
              label="Mã số thuế"
              name="taxCode"
              fill={true}
              disabled={data.custType === 1 ? true : false}
              required={data.custType === 1 ? true : false}
              value={data?.taxCode}
              placeholder="Mã số thuế"
              onChange={(e) => {
                const value = e.target.value;
                // setFormData({ ...formData, taxCode: value });
                setDataPaymentBill({ ...data, taxCode: value });
              }}
              warningHistory={listLogValue?.filter((el) => el.fileName === "taxCode")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "taxCode")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "taxCode",
                    type: "text",
                  });
                }
              }}
            />
          </div>

          {/* Giai đoạn của hợp đồng */}
          <div className="form-group">
            <SelectCustom
              key={`stage_${data?.pipelineId}`}
              id="pipelineId"
              name="pipelineId"
              label="Giai đoạn hợp đồng"
              fill={true}
              required={true}
              error={validateFieldPipeline}
              message="Giai đoạn hợp đồng không được bỏ trống"
              options={[]}
              value={detailPipeline}
              disabled={pipelineUrl ? true : false}
              onChange={(e) => handleChangeValuePipeline(e)}
              isAsyncPaginate={true}
              placeholder="Giai đoạn hợp đồng"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionPipeline}
              warningHistory={listLogValue?.filter((el) => el.fileName === "pipelineId")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "pipelineId")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "pipelineId",
                    type: "select",
                  });
                }
              }}
            />
          </div>

          {/* Người phụ trách */}
          <div className="form-group">
            <SelectCustom
              id="employeeId"
              name="employeeId"
              label="Người phụ trách"
              fill={true}
              required={true}
              error={validateFieldEmployee}
              message="Người phụ trách không được bỏ trống"
              options={[]}
              value={detailEmployee}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              placeholder="Chọn người phụ trách"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionEmployee}
              warningHistory={listLogValue?.filter((el) => el.fileName === "employeeId")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "employeeId")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "employeeId",
                    type: "select",
                  });
                }
              }}
            />
          </div>

          {/* Giá trị hợp đồng */}
          <div className="form-group">
            <NummericInput
              label="Giá trị hợp đồng"
              name="dealValue"
              fill={true}
              required={false}
              value={data?.dealValue}
              thousandSeparator={true}
              placeholder="Giá trị hợp đồng"
              decimalScale={0}
              onChange={(e) => {
                const value = e.target.value;
                // setFormData({ ...formData, dealValue: value?.replace(/,/g, "") });
                setDataPaymentBill({ ...data, dealValue: value?.replace(/,/g, "") });
              }}
              warningHistory={listLogValue?.filter((el) => el.fileName === "dealValue")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "dealValue")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "dealValue",
                    type: "number",
                  });
                }
              }}
            />
          </div>

          {/* Người liên quan */}
          <div className="form-group">
            <SelectCustom
              id="peopleInvolved"
              name="peopleInvolved"
              label="Người liên quan"
              fill={true}
              required={false}
              // error={validateFieldEmployee}
              // message="Người liên quan không được bỏ trống"
              options={[]}
              isMulti={true}
              value={data.peopleInvolved?.length > 0 ? JSON.parse(data.peopleInvolved) : []}
              onChange={(e) => handleChangeValuePeopleInvolved(e)}
              isAsyncPaginate={true}
              placeholder="Chọn người liên quan"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionPeopleInvolve}
              formatOptionLabel={formatOptionLabelPeopleInvolved}
              warningHistory={listLogValue?.filter((el) => el.fileName === "peopleInvolved")?.length > 0 ? true : false}
              onWarningHistory={() => {
                if (listLogValue?.filter((el) => el.fileName === "peopleInvolved")?.length > 0) {
                  setShowModalLog(true);
                  setFieldData({
                    name: "peopleInvolved",
                    type: "selectMutil",
                  });
                }
              }}
            />
          </div>

          {/* <div className="form-group">
            <SelectCustom
              // key={`stage_${data?.pipelineId}`}
              id="requestCode"
              name="requestCode"
              label="Mã đề nghị mua sắm"
              fill={true}
              required={false}
              options={[]}
              value={codeSuggest}
              onChange={(e) => handleChangeCodeSuggest(e)}
              isAsyncPaginate={true}
              placeholder="Mã đề nghị"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionCodeSuggest}
            />
          </div> */}
        </div>

        {/* {codeSuggest ? 
          <div className="container_service">
            <div className="header_service">
              <div>
                <span className="title_service">Chi tiết mặt hàng/dịch vụ</span>
              </div>
              <Tippy content={'Thêm mặt hàng/dịch vụ'} delay={[100, 0]} animation="scale-extreme">
                  <div className="add-service">
                    <div
                      className="add-button"
                      onClick={() => {
                        // setShowModalAdd(true);
                        setListService((oldArray) => ([
                                                        ...oldArray, 
                                                        {
                                                          id: null,
                                                          contractId: null,
                                                          itemCode: "",
                                                          supplierCode: "",
                                                          quantity: 0,
                                                          price: 0,
                                                          discount: null,
                                                          vat: 0,
                                                          item: {
                                                              id: null,
                                                              code: "",
                                                              name: ""
                                                          },
                                                          supplier: {
                                                              id: null,
                                                              code: "",
                                                              name: ""
                                                          }
                                                      },
                                                    ]))
                      }}
                    >
                      <Icon name="PlusCircle" style={{width: 20, height: 20}} fill='white'/>
                    </div>
                  </div>
                </Tippy>
            </div>

            <div className="list_service">
              <div className="box__table--warehousing" style={{ overflow: "auto" }}>
                <table className="table__create">
                  <thead>
                    <tr>
                      {titleTableListService?.map((title, idx) => (
                        <th key={idx} className="">
                          {title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listService && listService.length > 0 && listService.map((item, idx) => {
                        return  (
                          <tr key={idx}>
                            <td className="code">
                              <SelectCustom
                                id="code"
                                name="code"
                                special={true}
                                fill={true}
                                value={ item.item?.id ? {value: item.item?.code, label: item.item?.code} : null}
                                options={[]}
                                onChange={(e) => handleChangeCodeService(e, idx)}
                                isAsyncPaginate={true}
                                placeholder="Mã hàng"
                                additional={{
                                  page: 1,
                                }}
                                loadOptionsPaginate={loadedOptionCodeService}
                              />

                            </td>

                            <td className="name">
                              <Input
                                id="name"
                                name="name"
                                value={item.item?.name}
                                fill={true}
                                placeholder="Tên mặt hàng"
                                disabled={true}
                              />
                            </td>

                            <td className="quantity">
                              <NummericInput
                                id="quantity"
                                name="quantity"
                                fill={true}
                                value={item.quantity}
                                thousandSeparator={true}
                                onValueChange={(e) => {
                                  const value = e.floatValue;
                                  setListService((current) =>
                                    current.map((obj, index) => {
                                      if (index === idx) {
                                        return { ...obj,  quantity: value };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                              />
                            </td>
                            <td className="cost">
                              <NummericInput
                                id="cost"
                                name="cost"
                                fill={true}
                                thousandSeparator={true}
                                value={+item.price}
                                onValueChange={(e) => {
                                  const value = e.floatValue;
                                  setListService((current) =>
                                    current.map((obj, index) => {
                                      if (index === idx) {
                                        return { ...obj,  price: value };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                              />
                            </td>
                            <td className="total_cost">
                              <NummericInput
                                id="money"
                                name="money"
                                thousandSeparator={true}
                                fill={true}
                                value={+item.quantity * +item.price || 0}
                                disabled={true}
                              />
                            </td>

                            <td className="vat">
                              <NummericInput
                                id="vat"
                                name="vat"
                                thousandSeparator={true}
                                fill={true}
                                value={+item.vat || 0}
                                onValueChange={(e) => {
                                  const value = e.floatValue;
                                  setListService((current) =>
                                    current.map((obj, index) => {
                                      if (index === idx) {
                                        return { ...obj,  vat: value };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                              />
                            </td>

                            <td className="total_cost">
                              <NummericInput
                                id="total_cost"
                                name="total_cost"
                                thousandSeparator={true}
                                fill={true}
                                value={ ((+item.quantity * +item.price) + (+item.vat/100)*(+item.quantity * +item.price)) || 0}
                                disabled={true}
                              />
                            </td>

                            <td className="supplier">
                              <SelectCustom
                                id="supplier"
                                name="supplier"
                                special={true}
                                fill={true}
                                value={ item.supplier?.id ? {value: item.supplier?.id, label: item.supplier?.name} : null}
                                options={[]}
                                onChange={(e) => handleChangeSupplier(e, idx)}
                                isAsyncPaginate={true}
                                placeholder="Nhà cung cấp"
                                additional={{
                                  page: 1,
                                }}
                                loadOptionsPaginate={loadedOptionSupplier}
                              />
                            </td>

                              <td>
                                <div 
                                  className="action__delete--item" 
                                  onClick={() => handleDeleteService(idx)}
                                >
                                  <Icon name="Trash" />
                                </div>
                              </td>

                          </tr>
                        );
                      })}
                  </tbody>

                </table>
              </div>
            </div>
          </div>
        : null} */}

        <div className="container_template_contract">
          <div style={{ display: "flex" }}>
            <div>
              <span className="title_template">Mẫu hợp đồng</span>
            </div>
            {listLogValue?.filter((el) => el.fileName === "template")?.length > 0 ? (
              <Tippy content={"Lịch sử thay đổi"}>
                <div
                  style={{ alignItems: "center", display: "flex", marginLeft: 5, cursor: "pointer" }}
                  onClick={() => {
                    if (listLogValue?.filter((el) => el.fileName === "template")?.length > 0) {
                      setShowModalLog(true);
                      setFieldData({
                        name: "template",
                        type: "template",
                      });
                    }
                  }}
                >
                  <Icon name="WarningCircle" style={{ width: "1.5rem", height: "1.5rem", fill: "var(--warning-color)" }} />
                </div>
              </Tippy>
            ) : null}
          </div>
          <div className="box_template">
            <div className="box__update--attachment">
              {/* {isLoadingFile ? ( */}
              <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                <Icon name="Refresh" />
                <span className="name-loading">Đang tải...{showProgress}%</span>
              </div>
              {/* ) : ( */}
              <div className={isLoadingFile ? "d-none" : ""}>
                <AddFile
                  takeFileAdd={takeFileAdd}
                  infoFile={infoFile}
                  setInfoFile={setInfoFile}
                  // setIsLoadingFile={setIsLoadingFile}
                  // dataAttachment={data}
                />
              </div>
              {/* )} */}
            </div>
          </div>
        </div>

        {mapContractAttribute ? (
          <div className="list__contract--attribute">
            {Object.entries(mapContractAttribute).map((lstContractAttribute: any, key: number) => (
              <Fragment key={key}>
                {(lstContractAttribute[1] || []).map((contractAttribute, index: number) => (
                  <Fragment key={index}>
                    {!contractAttribute.parentId ? (
                      <label className="label-title" key={`parent_${key}`}>
                        {contractAttribute.name}
                      </label>
                    ) : null}
                    {contractAttribute.parentId ? (
                      <div
                        className={`form-group ${contractAttribute.name.length >= 38 || lstContractAttribute[1].length == 2 ? "special-case" : ""}`}
                        id={`Field${convertToId(contractAttribute.name)}`}
                        key={`index_${key}_${index}`}
                      >
                        {getControlByType(contractAttribute, listLogValue)}
                      </div>
                    ) : null}
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </div>
        ) : null}

        <div className="action__apply--payment">
          <div className="side__action">
            {takeInfoCustomerInLocalStorage ? (
              data?.amount !== 0 && (
                <Fragment>
                  {contractId ? (
                    <Button
                      color="primary"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/contract");
                      }}
                    >
                      Danh sách hợp đồng
                    </Button>
                  ) : (
                    <Button
                      color="destroy"
                      variant="outline"
                      disabled={isSubmit}
                      onClick={(e) => {
                        e.preventDefault();
                        showDialogConfirmDelete();
                      }}
                    >
                      Hủy thao tác
                    </Button>
                  )}
                </Fragment>
              )
            ) : data?.amount === 0 ? (
              <Button
                color="primary"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/contract");
                }}
              >
                Quay lại
              </Button>
            ) : contractId ? (
              <Button
                color="primary"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/contract");
                }}
              >
                Danh sách hợp đồng
              </Button>
            ) : (
              <Fragment>
                <Button
                  color="destroy"
                  variant="outline"
                  disabled={isSubmit}
                  onClick={(e) => {
                    e.preventDefault();
                    showDialogConfirmDelete();
                  }}
                >
                  Hủy thao tác
                </Button>
              </Fragment>
            )}
          </div>

          <Button
            type="submit"
            color="primary"
            disabled={
              isSubmit || validateFieldSignDate || validateFieldBranch || validateFieldAffectedDate || validateFieldEndDate || validateFieldAdjustDate
            }
          >
            {title}
            {isSubmit ? <Icon name="Loading" /> : null}
          </Button>
        </div>
      </form>
      <Dialog content={contentDialog} isOpen={showDialog} />

      <ChangeHistoryModal
        onShow={showModalLog}
        dataLog={listLogValue}
        fieldData={fieldData}
        dataPaymentBill={data}
        contractExtraInfos={contractExtraInfos}
        onHide={(reload) => {
          if (reload) {
            callback(true);
            getContractExtraInfos();
          }
          setShowModalLog(false);
          setFieldData(null);
        }}
      />
    </div>
  );
}
