/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Icon from "components/icon";
import Input from "components/input/input";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddCustomerModalProps } from "model/customer/PropsModel";
import { ICustomerRequest } from "model/customer/CustomerRequestModel";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { EMAIL_REGEX, PHONE_REGEX } from "utils/constant";
import { SelectOptionData } from "utils/selectCommon";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import CustomerAttributeService from "services/CustomerAttributeService";
import CustomerExtraInfoService from "services/CustomerExtraInfoService";
import { convertToId } from "reborn-util";
import "./AddCustomerPersonModal.scss";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import { ContextType, UserContext } from "contexts/userContext";
import ImageThirdGender from "assets/images/third-gender.png";
import { Parser } from "formula-functionizer";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import RadioList from "components/radio/radioList";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import CareerService from "services/CareerService";
import EmployeeService from "services/EmployeeService";
import AddFile from "pages/Contract/CreateContracts/partials/AddFile";
import { uploadDocumentFormData } from "utils/document";
import CodeService from "services/CodeService";
import ImgPushCustomer from "assets/images/img-push.png";
import AddCustomerCareerModal from "pages/SettingCustomer/partials/CustomerCareer/partials/AddCustomerCareerModal";
import AddCustomerGroupModal from "pages/SettingCustomer/partials/CustomerGroup/partials/AddCustomerGroupModal";
import CustomerGroupService from "services/CustomerGroupService";

export default function AddCustomerPersonModal(props: AddCustomerModalProps) {
  const { onShow, data, onHide, takeInfoCustomer, nameCustomer, avatarCustomer, lstDataOrigin, zaloUserId } = props;

  const focusedElement = useActiveElement();
  const parser = new Parser();
  const checkUserRoot = localStorage.getItem("user.root");
  const checkCustType = localStorage.getItem("customer.custType")?.toString() || "0";

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listSourceCustomer, setListSourceCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomerSource, setIsLoadingCustomerSource] = useState<boolean>(false);
  const [isLoadingBeautyBranch, setIsLoadingBeautyBranch] = useState<boolean>(false);
  const [listBeautyBranch, setListBeautyBranch] = useState<IOption[]>(null);
  const [listCareer, setListCareer] = useState<IOption[]>(null);
  const [isLoadingCareer, setIsLoadingCareer] = useState<boolean>(false);
  const [listCustomerGroup, setListCustomerGroup] = useState<IOption[]>(null);
  const [isLoadingCustomerGroup, setIsLoadingCustomerGroup] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [customerExtraInfos, setCustomerExtraInfos] = useState<any>([]);
  const [isShowPhone, setIsShowPhone] = useState<boolean>(false);
  const [isShowEmail, setIsShowEmail] = useState<boolean>(false);

  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  //Người đại diện pháp luật
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [mapCustomerAttribute, setMapCustomerAttribute] = useState<any>(null);

  const [employeeIdDefault, setEmployeeIdDefault] = useState(null);
  const [activeCode, setActiveCode] = useState(false);

  //! đoạn này xử lý vấn đề call employee init để lấy ra người phụ trách
  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();

    if (response.code == 0) {
      const result = response.result;
      onSelectOpenEmployee();
      setEmployeeIdDefault(result.id);
    }
  };

  useEffect(() => {
    if (onShow && !data) {
      getDetailEmployeeInfo();
    }
  }, [onShow, data]);

  const getDetailCustomer = async (id: number) => {
    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      const careers = (result.lstCareer || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setCareerList(careers || []);

      // const changeRelations = [...result.relations].map((item) => {
      //   return {
      //     value: item.id,
      //     label: item.name,
      //     avatar: item.avatar,
      //   };
      // });
      const changeRelations = (result.relations || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        };
      });
      setRelatedCustomers(changeRelations);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  const onSelectOpenCustomerSource = async () => {
    if (!listSourceCustomer || listSourceCustomer.length === 0) {
      setIsLoadingCustomerSource(true);
      const dataOption = await SelectOptionData("sourceId");
      if (dataOption) {
        setListSourceCustomer([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomerSource(false);
    }
  };

  useEffect(() => {
    if (data?.sourceId) {
      onSelectOpenCustomerSource();
    }

    if (data?.sourceId == null) {
      setListSourceCustomer([]);
    }

    // if (onShow) {
    //   getCustomerAttributes();
    // }
  }, [data, onShow]);

  const getCustomerAttributes = async () => {
    if (!mapCustomerAttribute || mapCustomerAttribute.length === 0) {
      const response = await CustomerAttributeService.listAll(0);
      if (response.code === 0) {
        const dataOption = response.result;
        setMapCustomerAttribute(dataOption || {});
      }
    }
  };

  const [branchId, setBranchId] = useState(null);

  const branchList = async () => {
    const param: IBeautyBranchFilterRequest = {
      name: "",
      page: 1,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;
      if (dataOption?.length === 1) {
        setBranchId(dataOption[0].id);
      }
    }
  };

  useEffect(() => {
    if (!data?.branchId && !data?.id) {
      branchList();
    } else {
      setBranchId(null);
    }
  }, [data, onShow]);

  const onSelectOpenBeautyBranch = async () => {
    if (!listBeautyBranch || listBeautyBranch.length === 0) {
      setIsLoadingBeautyBranch(true);
      const dataOption = await SelectOptionData("beautyBranch");
      if (dataOption) {
        setListBeautyBranch([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingBeautyBranch(false);
    }
  };

  useEffect(() => {
    if (data?.branchId && checkUserRoot == "1") {
      onSelectOpenBeautyBranch();
    }
    if (data?.branchId == null && !data?.id) {
      if (dataBranch && checkUserRoot == "1") {
        onSelectOpenBeautyBranch();
      } else {
        setListBeautyBranch([]);
      }
    }
  }, [data, checkUserRoot, branchId, dataBranch]);

  const onSelectOpenCareer = async () => {
    if (!listCareer || listCareer.length === 0) {
      setIsLoadingCareer(true);

      const dataOption = await SelectOptionData("careerId", { custType: 0 });
      if (dataOption) {
        setListCareer([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCareer(false);
    }
  };

  useEffect(() => {
    if (data?.careerId) {
      onSelectOpenCareer();
    }

    if (data?.careerId == null) {
      setListCareer([]);
    }
  }, [data]);

  const onSelectOpenCustomerGroup = async () => {
    if (!listCustomerGroup || listCustomerGroup.length === 0) {
      setIsLoadingCustomerGroup(true);

      const dataOption = await SelectOptionData("cgpId");
      if (dataOption) {
        setListCustomerGroup([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomerGroup(false);
    }
  };

  useEffect(() => {
    if (data?.cgpId) {
      onSelectOpenCustomerGroup();
    }

    if (data?.cgpId == null) {
      setListCustomerGroup([]);
    }
  }, [data]);

  const onSelectOpenEmployee = async (data?: any) => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId", { branchId: dataBranch.value });
      if (dataOption) {
        // setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
        setListEmployee([...(dataOption.length > 0 ? (data ? [data, ...dataOption] : dataOption) : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  const onSelectOpenContract = async () => {
    if (!listContact || listContact.length === 0) {
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

  // danh sách nghề nghiệp
  const [careerList, setCareerList] = useState([]);
  const [showModalCareer, setShowModalCareer] = useState(false);

  const loadedOptionCareer = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      custType: 0,
    };

    const response = await CareerService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới nghề nghiệp", isShowModal: true, avatar: "custom" }] : []),
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

  const [countCheckAddCareer, setCountCheckAddCareer] = useState(0);
  useEffect(() => {
    if (!showModalCareer) {
      setCountCheckAddCareer(countCheckAddCareer + 1);
      loadedOptionCareer("", undefined, { page: 1 });
    }
  }, [showModalCareer]);

  const formatOptionLabelCareer = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar" style={avatar == "custom" ? { width: "1.8rem", height: "1.8rem" } : {}}>
          <img src={avatar == "custom" ? ImgPushCustomer : avatar ? avatar : ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCareer = (e) => {
    let lastPick = e[e.length - 1];

    if (lastPick?.isShowModal) {
      setShowModalCareer(true);
      // setCareerList(null);
      // setFormData({ ...formData, values: { ...formData?.values, careers: JSON.stringify([]) } });
    } else {
      setCareerList(e);
      const careerIds = e.map((item) => {
        return item.value;
      });
      setFormData({ ...formData, values: { ...formData?.values, careers: JSON.stringify(careerIds) } });
    }
  };
  // danh sách nhóm khách hàng
  const [cgpData, setCgpData] = useState(null);
  const [showModalCgp, setShowModalCgp] = useState(false);

  const loadedOptionCgp = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 1000,
    };

    const response = await CustomerGroupService.list(param);

    if (response.code === 0) {
      // const dataOption = response.result.items;
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới nhóm khách hàng", isShowModal: true, avatar: "custom" }] : []),
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ],
        // hasMore: response.result.loadMoreAble,
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const [countCheckAddCgp, setCountCheckAddCgp] = useState(0);
  useEffect(() => {
    if (!showModalCgp) {
      setCountCheckAddCgp(countCheckAddCgp + 1);
      loadedOptionCgp("", undefined, { page: 1 });
    }
  }, [showModalCgp]);

  const formatOptionLabelCgp = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar" style={avatar == "custom" ? { width: "1.8rem", height: "1.8rem" } : {}}>
          <img src={avatar == "custom" ? ImgPushCustomer : avatar ? avatar : ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCgp = (e) => {
    if (e?.isShowModal) {
      setShowModalCgp(true);
      // setCgpData(null);
      // setFormData({ ...formData, values: { ...formData?.values, cgpId: null } });
    } else {
      setCgpData(e);
      setFormData({ ...formData, values: { ...formData?.values, cgpId: e.value } });
    }
  };

  useEffect(() => {
    if (data?.cgpId) {
      setCgpData({ value: data.cgpId, label: data?.cgpName || "" });
    }
    // if (data?.employeeId) {
    //   onSelectOpenEmployee();
    // }

    // if (data?.employeeId === null) {
    //   setListEmployee([]);
    // }

    // //Lấy thông tin customerExtraInfos
    // if (data?.id && onShow) {
    //   getCustomerExtraInfos();
    // }
  }, [data, onShow]);

  useEffect(() => {
    if (onShow) {
      getCustomerAttributes();
      handleGetCode();
    }
    if (data && onShow) {
      onSelectOpenEmployee();
      onSelectOpenContact();
      onSelectOpenContract();
      onSelectOpenCustomer();
      getDetailCustomer(data.id);
    }
  }, [data, onShow]);

  useEffect(() => {
    //Lấy thông tin contractExtraInfos
    if (data?.id && mapCustomerAttribute && onShow) {
      getCustomerExtraInfos();
    }
  }, [data, mapCustomerAttribute, onShow]);

  const getCustomerExtraInfos = async () => {
    const response = await CustomerExtraInfoService.list(data?.id, 0);
    setCustomerExtraInfos(response.code === 0 ? response.result : []);
  };

  const [dataOrg, setDataOrg] = useState(null);

  useEffect(() => {
    if (lstDataOrigin && lstDataOrigin.length > 0 && data) {
      const changeLstDataOrigin = lstDataOrigin.find((item) => item.duplicateId === data.id);
      setDataOrg(changeLstDataOrigin);
    }
  }, [lstDataOrigin, data, onShow]);

  const defaultDataDuplicate = {
    name: false,
    phone: false,
    code: false,
    recommenderPhone: false,
    email: false,
    profileLink: false,
    profileStatus: false,
    secondProfileLink: false,
    secondProfileStatus: false,
    address: false,
    birthday: false,
    gender: false,
    sourceId: false,
    branchId: false,
    careerId: false,
    employeeId: false,
    cgpId: false,
    firstCall: false,
  };

  const [showDataDuplicate, setShowDataDuplicate] = useState(defaultDataDuplicate);

  const refOption = useRef();
  const refOptionContainer = useRef();

  useOnClickOutside(refOption, () => setShowDataDuplicate(defaultDataDuplicate), ["change__duplicate--birthday"]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? nameCustomer ?? "",
        phone: data?.phoneMasked ?? "",
        code: data?.code ?? "",
        recommenderPhone: data?.recommenderPhone ?? "",
        email: data?.emailMasked ?? "",
        profileLink: data?.profileLink ?? "",
        profileStatus: data?.profileStatus?.toString() ?? "1",
        secondProfileLink: data?.secondProfileLink ?? "",
        secondProfileStatus: data?.secondProfileStatus?.toString() ?? "1",
        address: data?.address ?? "",
        birthday: data?.birthday ?? "",
        gender: data?.gender?.toString() ?? "1",
        sourceId: data?.sourceId ?? null,
        branchId: checkUserRoot == "1" ? data?.branchId ?? dataBranch.value ?? null : 0,
        careers: data?.careers ?? "[]",
        // careerId: data?.careerId ?? null,
        employeeId: data?.employeeId ?? employeeIdDefault ?? null,
        cgpId: data?.cgpId ?? null,
        avatar: data?.avatar ?? avatarCustomer ?? "",
        firstCall: data?.firstCall ?? "",
        weight: data?.weight ?? "0",
        height: data?.height ?? "0",
        custType: checkCustType,
        isExternal: data?.isExternal?.toString() ?? "1",
        maritalStatus: 1,
        relationIds: data?.relationIds ?? [],
        // zaloUserId: zaloUserId ?? '',
      } as ICustomerRequest),
    [data, onShow, checkUserRoot, nameCustomer, avatarCustomer, branchId, dataBranch, checkCustType, employeeIdDefault]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    ...(checkUserRoot !== "1"
      ? [
          {
            name: "branchId",
            rules: "required",
          },
        ]
      : []),
    {
      name: "name",
      rules: "required",
    },
    {
      name: "phone",
      rules: "nullable|regex",
    },
    {
      name: "email",
      rules: "regex",
    },
    {
      name: "recommenderPhone",
      rules: "regex",
    },
    {
      name: "gender",
      rules: "required",
    },
  ];

  //! đoạn này xử lý vấn đề hoạt động tài khoản facebook chính
  const handleChangeValueStatusProfile = (isChecked) => {
    if (isChecked || formData?.values?.profileStatus == "") {
      setFormData({ ...formData, values: { ...formData?.values, profileStatus: "1" } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, profileStatus: "0" } });
    }
  };

  //! đoạn này xử lý vấn đề hoạt động tài khoản facebook phụ
  const handleChangeValueStatusSecondProfile = (isChecked) => {
    if (isChecked || formData?.values?.secondProfileLink == "") {
      setFormData({ ...formData, values: { ...formData?.values, secondProfileStatus: "1" } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, secondProfileStatus: "0" } });
    }
  };

  const listFieldCustType = useMemo(
    () =>
      [
        {
          label: "Khách hàng",
          name: "custType",
          type: "radio",
          fill: true,
          options: [
            {
              value: "0",
              label: "Cá nhân",
            },
            {
              value: "1",
              label: "Doanh nghiệp",
            },
          ],
          onClick: (e) => {
            let selectedValue = e?.target?.value;
            if (selectedValue != undefined && selectedValue == 1) {
              localStorage.setItem("customer.custType", "1");
              onHide(false, true);
            }
          },
        },
        {
          label: "Loại khách hàng",
          name: "isExternal",
          type: "radio",
          fill: true,
          options: [
            {
              value: "0",
              label: "Khách hàng nội bộ",
            },
            {
              value: "1",
              label: "Khách hàng ngoài",
            },
          ],
        },
      ] as IFieldCustomize[],
    []
  );

  const listFieldBeautyBranch = useMemo(
    () =>
      [
        // {
        //   label: "Chi nhánh",
        //   name: "branchId",
        //   type: "select",
        //   fill: true,
        //   required: true,
        //   disabled: true,
        //   options: listBeautyBranch,
        //   onMenuOpen: onSelectOpenBeautyBranch,
        //   isLoading: isLoadingBeautyBranch,
        // },
      ] as IFieldCustomize[],
    [isLoadingBeautyBranch, listBeautyBranch]
  );

  const listFieldInfoCustomer = useMemo(
    () =>
      [
        {
          label: "Tên khách hàng",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mã khách hàng",
          name: "code",
          type: "text",
          fill: true,
          disabled: activeCode,
        },
      ] as IFieldCustomize[],
    [activeCode]
  );

  const listFieldInfoDetailCustomer = useMemo(
    () =>
      [
        {
          label: "Số điện thoại",
          name: "phone",
          type: "text",
          fill: true,
          regex: new RegExp(PHONE_REGEX),
          messageErrorRegex: "Số điện thoại không đúng định dạng",
          iconPosition: "right",
          icon: data?.id && (!isShowPhone ? <Icon name="EyeSlash" /> : <Icon name="Eye" />),
          iconClickEvent: () => {
            setIsShowPhone(!isShowPhone);
          },
          // readOnly: !isShowPhone,
          required: true,
        },
        {
          label: "Email",
          name: "email",
          type: "text",
          fill: true,
          regex: new RegExp(EMAIL_REGEX),
          iconPosition: "right",
          icon: data?.id && data?.emailMasked && (!isShowEmail ? <Icon name="EyeSlash" /> : <Icon name="Eye" />),
          iconClickEvent: () => setIsShowEmail(!isShowEmail),
          // readOnly: !isShowEmail,
          messageErrorRegex: "Email không đúng định dạng",
        },
        {
          label: "Giới tính",
          name: "gender",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Nữ",
            },
            {
              value: "2",
              label: "Nam",
            },
          ],
          fill: true,
        },
        {
          label: "Ngày sinh",
          name: "birthday",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập ngày sinh",
        },
        {
          label: "Địa chỉ",
          name: "address",
          type: "text",
          fill: true,
        },
        {
          label: "Chiều cao (cm)",
          name: "height",
          type: "number",
          fill: true,
        },
        {
          label: "Cân nặng (kg)",
          name: "weight",
          type: "number",
          fill: true,
        },
      ] as IFieldCustomize[],
    [isShowPhone, isShowEmail, data]
  );

  //! đoạn này lấy danh sách khách hàng liên quan
  const [relatedCustomers, setRelatedCustomers] = useState([]);

  const loadedOptionRelatedCustomers = async (search, loadedOptions, { page }) => {
    const param = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items.filter((item) => item.id !== data?.id);

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

  const handleChangeValueRelatedCustomers = (e) => {
    setRelatedCustomers(e);
  };

  //* đoạn này xử lý vấn đề hiển thị hình ảnh khách hàng liên quan
  const formatOptionLabelRelatedCustomers = ({ label, avatar }) => {
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
    if (relatedCustomers.length > 0) {
      const listIdRelatedCustomers = relatedCustomers.map((item) => item.value);
      setFormData({ ...formData, values: { ...formData?.values, customerRelationIds: JSON.stringify(listIdRelatedCustomers) } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, customerRelationIds: "[]" } });
    }
  }, [relatedCustomers]);

  const listFieldInfoAdditionalCustomer = useMemo(
    () =>
      [
        {
          label: "Điện thoại người giới thiệu",
          name: "recommenderPhone",
          type: "text",
          fill: true,
          regex: new RegExp(PHONE_REGEX),
          messageErrorRegex: "Số điện thoại không đúng định dạng",
        },
        {
          label: "Nguồn khách hàng",
          name: "sourceId",
          type: "select",
          fill: true,
          options: listSourceCustomer,
          onMenuOpen: onSelectOpenCustomerSource,
          isLoading: isLoadingCustomerSource,
        },
        // {
        //   label: "Nghề nghiệp",
        //   name: "careerId",
        //   type: "select",
        //   fill: true,
        //   options: listCareer,
        //   onMenuOpen: onSelectOpenCareer,
        //   isLoading: isLoadingCareer,
        // },
        {
          name: "careerId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddCareer}
              id="careerId"
              name="careerId"
              label="Nghề nghiệp"
              fill={true}
              options={[]}
              isMulti={true}
              value={careerList}
              onChange={(e) => handleChangeValueCareer(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionCareer}
              placeholder="Chọn nghề nghiệp"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelCareer}
            />
          ),
        },
        {
          name: "cgpId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddCgp}
              id="cgpId"
              name="cgpId"
              label="Nhóm khách hàng"
              fill={true}
              options={[]}
              // isMulti={true}
              value={cgpData}
              onChange={(e) => handleChangeValueCgp(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionCgp}
              placeholder="Chọn nhóm khách hàng"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelCgp}
            />
          ),
        },
        // {
        //   label: "Nhóm khách hàng",
        //   name: "cgpId",
        //   type: "select",
        //   fill: true,
        //   options: listCustomerGroup,
        //   onMenuOpen: onSelectOpenCustomerGroup,
        //   isLoading: isLoadingCustomerGroup,
        // },
        {
          label: "Người phụ trách",
          name: "employeeId",
          type: "select",
          fill: true,
          options: listEmployee,
          onMenuOpen: onSelectOpenEmployee,
          isLoading: isLoadingEmployee,
        },
        {
          label: "Tình trạng cuộc gọi đầu tiên",
          name: "firstCall",
          type: "text",
          fill: true,
        },
        {
          name: "relatedCustomers",
          type: "custom",
          snippet: (
            <SelectCustom
              id="customers"
              name="customers"
              label="Khách hàng liên quan"
              fill={true}
              options={[]}
              isMulti={true}
              value={relatedCustomers}
              onChange={(e) => handleChangeValueRelatedCustomers(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionRelatedCustomers}
              placeholder="Chọn khách hàng liên quan"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelRelatedCustomers}
            />
          ),
        },
      ] as IFieldCustomize[],
    [
      listSourceCustomer,
      isLoadingCustomerSource,
      listCareer,
      isLoadingCareer,
      listCustomerGroup,
      isLoadingCustomerGroup,
      listEmployee,
      isLoadingEmployee,
      careerList,
      formData,
      relatedCustomers,
      countCheckAddCareer,
      countCheckAddCgp,
    ]
  );

  const handleGetCode = async () => {
    const response = await CodeService.detailEntity("customer");

    if (response.code == 0) {
      const result = response.result;
      if (result?.id) {
        setActiveCode(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleShowPhone = async (id: number) => {
    const response = await CustomerService.viewPhone(id);

    if (response.code == 0) {
      const result = response.result;
      setFormData({ ...formData, values: { ...formData?.values, phone: result } });
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem số điện thoại !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  useEffect(() => {
    if (isShowPhone && data?.id) {
      handleShowPhone(data?.id);
    }
    if (!isShowPhone && data?.id) {
      setFormData({ ...formData, values: { ...formData?.values, phone: data?.phoneMasked } });
    }
  }, [isShowPhone, data]);

  const handleShowEmail = async (id: number) => {
    const response = await CustomerService.viewEmail(id);

    if (response.code == 0) {
      const result = response.result;
      setFormData({ ...formData, values: { ...formData?.values, email: result } });
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem email !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  useEffect(() => {
    if (isShowEmail && data?.id) {
      handleShowEmail(data?.id);
    }
    if (!isShowEmail && data?.id) {
      setFormData({ ...formData, values: { ...formData?.values, email: data?.emailMasked } });
    }
  }, [isShowEmail, data]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const [validateRegex, setValidateRegex] = useState({
    phone: false,
    email: false,
    recommenderPhone: false,
  });

  useEffect(() => {
    if (formData?.values && lstDataOrigin) {
      if (formData?.values?.phone && !new RegExp(PHONE_REGEX).test(formData?.values.phone)) {
        setValidateRegex({ ...validateRegex, phone: true });
      } else {
        setValidateRegex({ ...validateRegex, phone: false });
      }

      if (formData?.values?.email && !new RegExp(PHONE_REGEX).test(formData?.values.email)) {
        setValidateRegex({ ...validateRegex, email: true });
      } else {
        setValidateRegex({ ...validateRegex, email: false });
      }

      if (formData?.values?.recommenderPhone && !new RegExp(PHONE_REGEX).test(formData?.values.recommenderPhone)) {
        setValidateRegex({ ...validateRegex, recommenderPhone: true });
      } else {
        setValidateRegex({ ...validateRegex, recommenderPhone: false });
      }
    }
  }, [formData?.values, lstDataOrigin]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(
      validations,
      formData,
      checkUserRoot == "1"
        ? [...listFieldBeautyBranch, ...listFieldInfoCustomer, ...listFieldInfoDetailCustomer, ...listFieldInfoAdditionalCustomer]
        : [...listFieldInfoCustomer, ...listFieldInfoDetailCustomer, ...listFieldInfoAdditionalCustomer]
    );

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (Object.values(validateRegex).filter((item) => item === true).length > 0) {
      return;
    }
    ///check validate các trường động
    if (
      !lstDataOrigin &&
      mapCustomerAttribute &&
      Object.entries(mapCustomerAttribute) &&
      Array.isArray(Object.entries(mapCustomerAttribute)) &&
      Object.entries(mapCustomerAttribute).length > 0
    ) {
      const newArray = Object.entries(mapCustomerAttribute);
      let checkArray = [];

      newArray.map((lstCustomerAttribute: any, key: number) => {
        (lstCustomerAttribute[1] || []).map((item) => {
          if (item.required === 1 && item.parentId !== 0) {
            checkArray.push(item);
          }
        });
      });

      if (checkArray.length > 0) {
        if (customerExtraInfos.length === 0) {
          showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
          return;
        } else {
          let check = false;
          checkArray.map((i) => {
            const index = customerExtraInfos.findIndex((el) => el.attributeId === i.id);
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

    const body: ICustomerRequest = {
      ...(data ? { id: data?.id } : {}),
      ...(zaloUserId ? { zaloUserId: zaloUserId } : {}),
      ...(formData.values as ICustomerRequest),
      customerExtraInfos: customerExtraInfos,
    };

    const response = await CustomerService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} khách hàng thành công`, "success");
      clearForm(true);
      takeInfoCustomer && takeInfoCustomer(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
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
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
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
        setBranchId(null);
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

  const updateCustomerMultiselectAttribute = (attributeId, e) => {
    let attributeValue = e ? e.split(",") : [];
    updateCustomerAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const updateCustomerAttribute = (attributeId, attributeValue) => {
    let customerId = data?.id || 0;

    let found = false;
    (customerExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        item.customerId = customerId;
        found = true;
      }
    });

    if (!found) {
      let item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      item.customerId = customerId;
      customerExtraInfos[customerExtraInfos.length] = item;
    }

    setCustomerExtraInfos([...customerExtraInfos]);
    setFormData({ ...formData, values: { ...formData?.values, timestamp: new Date().getTime() } });
  };

  const getCustomerAttributeValue = (attributeId) => {
    let attributeValue = "";
    (customerExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return attributeValue;
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

  const handleChangeValueCustomerItemC = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueEmployeeItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueContactItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueContractItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  /**
   * Hiển thị giá trị theo công thức
   * @param attributes
   * @param isFormula
   */
  const getCustomerAttributeFormula = (attributes) => {
    let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attrObj = {};
    (customerExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        attrObj["customerAttribute_" + convertToId(item.attributeName || "")] = +item.attributeValue;
      }
    });

    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  //Tải mẫu hợp đồng
  const takeFileAdd = (data) => {
    if (data) {
      // setIsLoadingFile(true)
      uploadDocumentFormData(data, onSuccess, onError);
    }
  };

  //   //* Xử lý tài liệu

  //* Đoạn này nhận link file đã chọn
  const onSuccess = (data) => {
    if (data) {
      // setInfoFile(data);
      // setDataPaymentBill((preState) => ({ ...preState, template: data.fileUrl }));
    }
  };

  //* Đoạn này nếu như mà lỗi không tải lên được thì bắn ra thông báo
  const onError = (message) => {
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  /**
   * Trả về loại control theo kiểu dữ liệu tương ứng
   */
  const getControlByType = (customerAttribute) => {
    let CustomControl = (
      <Input
        id={`Id${customerAttribute.id}`}
        label={customerAttribute.name}
        fill={true}
        value={getCustomerAttributeValue(customerAttribute.id)}
        onChange={(e) => updateCustomerAttribute(customerAttribute.id, e.target.value)}
        placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
        required={!!customerAttribute.required}
      />
    );

    switch (customerAttribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={customerAttribute.name}
            name={customerAttribute.name}
            value={getCustomerAttributeValue(customerAttribute.id)}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            fill={true}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            onChange={(e) => updateCustomerAttribute(customerAttribute.id, e.target.value)}
            maxLength={459}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={customerAttribute.name}
            name={customerAttribute.name}
            fill={true}
            required={!!customerAttribute.required}
            value={getCustomerAttributeValue(customerAttribute.id)}
            thousandSeparator={true}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            decimalScale={getDecimalScale(customerAttribute.attributes)}
            onChange={(e) => {
              const value = e.target.value;
              let valueNum = value?.replace(/,/g, "");
              updateCustomerAttribute(customerAttribute.id, valueNum);
            }}
          />
        );
        break;
      case "dropdown":
        CustomControl = (
          <SelectCustom
            name={customerAttribute.name}
            label={customerAttribute.name}
            fill={true}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            // error={validateFieldPipeline}
            // message="Loại hợp đồng không được bỏ trống"
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.value);
            }}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "multiselect":
        let attris = getCustomerAttributeValue(customerAttribute.id);
        CustomControl = (
          <CheckboxList
            title={customerAttribute.name}
            required={!!customerAttribute.required}
            disabled={!!customerAttribute.readonly}
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={attris ? JSON.parse(attris).join(",") : ""}
            onChange={(e) => {
              updateCustomerMultiselectAttribute(customerAttribute.id, e);
            }}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            checked={!!getCustomerAttributeValue(customerAttribute.id)}
            label={customerAttribute.name}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.target.checked);
            }}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={customerAttribute.name}
            title={customerAttribute.name}
            required={!!customerAttribute.required}
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.target.value);
            }}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={customerAttribute.name}
            name={customerAttribute.name}
            fill={true}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
              updateCustomerAttribute(customerAttribute.id, newDate);
            }}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            iconPosition="left"
            icon={<Icon name="Calendar" />}
            isMaxDate={false}
            // error={validateFieldSignDate}
            // message={`Vui lòng chọn ngày ký`}
          />
        );
        break;
      case "lookup":
        let attrs = customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : {};

        //1. Trường hợp là customer (khách hàng)
        //2. Trường hợp là employee (nhân viên)
        //3. Trường hợp là contract (hợp đồng)
        //4. Trường hợp là contact (người liên hệ)
        switch (attrs?.refType) {
          case "customer":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItemC(e, customerAttribute)}
              />
            );
            break;
          case "employee":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listEmployee || []}
                onMenuOpen={onSelectOpenEmployee}
                isLoading={isLoadingEmployee}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueEmployeeItem(e, customerAttribute)}
              />
            );
            break;
          case "contract":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listContract || []}
                onMenuOpen={onSelectOpenContract}
                isLoading={isLoadingContract}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContractItem(e, customerAttribute)}
              />
            );
            break;
          case "contact":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listContact || []}
                onMenuOpen={onSelectOpenContact}
                isLoading={isLoadingContact}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContactItem(e, customerAttribute)}
              />
            );
            break;
          default:
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItemC(e, customerAttribute)}
              />
            );
        }
        break;
      case "formula":
        //Công thức được lấy từ trường động và trường tĩnh
        //{contract.dealValue + customerAttribute.xyz} => sẽ cần parser từ 2 đối tượng là contract và customerAttribute

        //Chỉ hiển thị chứ không lưu giá trị (nếu thêm mới thì không hiển thị?, sửa mới hiển thị)
        CustomControl = (
          <Input
            id={`Id${customerAttribute.id}`}
            label={customerAttribute.name}
            fill={true}
            value={getCustomerAttributeFormula(customerAttribute?.attributes)}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );
        break;

      case "attachment":
        CustomControl = (
          <div className="container_template_contract">
            <div>
              <span className="title_template">{customerAttribute.name}</span>
            </div>
            <div className="box_template">
              <div className="box__update--attachment">
                <AddFile
                  takeFileAdd={takeFileAdd}
                  infoFile={null}
                  setInfoFile={() => {}}
                  // setIsLoadingFile={setIsLoadingFile}
                  // dataAttachment={data}
                />
              </div>
            </div>
          </div>
        );
        break;
    }

    return CustomControl;
  };

  const clearForm = (acc) => {
    onHide(acc);
    setBranchId(null);
    setCareerList([]);
    setCustomerExtraInfos([]);
    setRelatedCustomers([]);
    setIsShowPhone(false);
    setIsShowEmail(false);
  };
  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        size="lg"
        toggle={() => {
          if (!isSubmit) {
            clearForm(false);
          }
        }}
        className="modal-customer"
      >
        <form className="form-customer-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} khách hàng`}
            toggle={() => {
              if (!isSubmit) {
                clearForm(false);
              }
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              <div className="basic-info">
                <label className="label-title">Thông tin cơ bản</label>
                {checkUserRoot == "1" &&
                  listFieldBeautyBranch.map((field, index) => (
                    <FieldCustomize
                      field={field}
                      key={index}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBeautyBranch, setFormData)}
                      formData={formData}
                    />
                  ))}

                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  {listFieldCustType.map((field, index) => (
                    <div key={index} style={{ width: "48%" }}>
                      <FieldCustomize
                        field={field}
                        key={index}
                        handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldCustType, setFormData)}
                        formData={formData}
                      />
                    </div>
                  ))}
                </div>
                <div className="wrapper__info">
                  <FileUpload type="avatar" label="Ảnh khách hàng" formData={formData} setFormData={setFormData} />
                  <div className="info-custommer">
                    {listFieldInfoCustomer.map((field, index) => (
                      <FieldCustomize
                        field={field}
                        key={index}
                        handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldInfoCustomer, setFormData)}
                        formData={formData}
                      />
                    ))}
                  </div>
                </div>
                {listFieldInfoDetailCustomer.map((field, index) => (
                  <FieldCustomize
                    field={field}
                    key={index}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldInfoDetailCustomer, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
              {/* <div className="account__status">
                <div className="form-group">
                  <div className="title__item">
                    <label htmlFor="profileLink">Tài khoản Facebook</label>
                    <div className="check__status--account">
                      {formData?.values?.profileStatus == 1 && formData?.values?.profileLink !== "" ? (
                        <span className="name--status">Hoạt động</span>
                      ) : (
                        <span className="name--status">Không hoạt động</span>
                      )}
                      <label className="check__status--facebook">
                        <input
                          type="checkbox"
                          checked={formData?.values?.profileStatus == 1 && formData?.values?.profileLink !== "" ? true : false}
                          onChange={(e) => handleChangeValueStatusProfile(e.target.checked)}
                        />
                        <span className="__extra"></span>
                      </label>
                    </div>
                  </div>
                  <Input
                    id="profileLink"
                    fill={true}
                    value={formData?.values?.profileLink}
                    onChange={(e) => setFormData({ ...formData, values: { ...formData?.values, profileLink: e.target.value } })}
                    placeholder="Nhập link tài khoản facebook"
                  />
                </div>

                <div className="form-group">
                  <div className="title__item">
                    <label htmlFor="secondProfileLink">Tài khoản Facebook thứ 2</label>
                    <div className="check__status--account">
                      {formData?.values?.secondProfileStatus == 1 && formData?.values?.secondProfileLink !== "" ? (
                        <span className="name--status">Hoạt động</span>
                      ) : (
                        <span className="name--status">Không hoạt động</span>
                      )}
                      <label className="check__status--facebook">
                        <input
                          type="checkbox"
                          checked={formData?.values?.secondProfileStatus == 1 && formData?.values?.secondProfileLink !== "" ? true : false}
                          onChange={(e) => handleChangeValueStatusSecondProfile(e.target.checked)}
                        />
                        <span className="__extra"></span>
                      </label>
                    </div>
                  </div>
                  <Input
                    id="secondProfileLink"
                    fill={true}
                    value={formData?.values?.secondProfileLink}
                    onChange={(e) => setFormData({ ...formData, values: { ...formData?.values, secondProfileLink: e.target.value } })}
                    placeholder="Nhập link tài khoản facebook thứ 2"
                  />
                </div>
              </div> */}
              <div className="additional-info">
                <label className="label-title">Thông tin bổ sung</label>
                {listFieldInfoAdditionalCustomer.map((field, index) => (
                  <FieldCustomize
                    field={field}
                    key={index}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldInfoAdditionalCustomer, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
              {/* Các trường thông tin động được hiển thị ở đây */}
              {/* {mapCustomerAttribute ? (
                <div className="list__customer--attribute">
                  {Object.entries(mapCustomerAttribute).map((lstCustomerAttribute: any, key: number) => (
                    <Fragment key={key}>
                      {(lstCustomerAttribute[1] || []).map((customerAttribute, index: number) => (
                        <Fragment key={index}>
                          {!customerAttribute.parentId ? (
                            <label className="label-title" key={`parent_${key}`}>
                              {customerAttribute.name}
                            </label>
                          ) : null}
                          {customerAttribute.parentId ? (
                            <div
                              className={`form-group ${
                                customerAttribute.name.length >= 38 || lstCustomerAttribute[1].length == 2 ? "special-case" : ""
                              }`}
                              id={`Field${convertToId(customerAttribute.name)}`}
                              key={`index_${key}_${index}`}
                            >
                              <Input
                                id={`Id${customerAttribute.id}`}
                                label={customerAttribute.name}
                                fill={true}
                                value={getCustomerAttributeValue(customerAttribute.id)}
                                onChange={(e) => updateCustomerAttribute(customerAttribute.id, e.target.value)}
                                placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
                              />
                            </div>
                          ) : null}
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </div>
              ) : null} */}

              {/* Các trường thông tin động được hiển thị ở đây */}
              {!lstDataOrigin && mapCustomerAttribute ? (
                <div className="list__customer--attribute">
                  {Object.entries(mapCustomerAttribute).map((lstCustomerAttribute: any, key: number) => (
                    <Fragment key={key}>
                      {(lstCustomerAttribute[1] || []).map((customerAttribute, index: number) => (
                        <Fragment key={index}>
                          {!customerAttribute.parentId ? (
                            <label className="label-title" key={`parent_${key}`}>
                              {customerAttribute.name}
                            </label>
                          ) : null}
                          {customerAttribute.parentId ? (
                            <div
                              className={`form-group ${
                                customerAttribute.name.length >= 38 || lstCustomerAttribute[1].length == 2 ? "special-case" : ""
                              }`}
                              id={`Field${convertToId(customerAttribute.name)}`}
                              key={`index_${key}_${index}`}
                            >
                              {getControlByType(customerAttribute)}
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
        <AddCustomerCareerModal
          onShow={showModalCareer}
          data={null}
          custType={checkCustType}
          onHide={(reload) => {
            if (reload) {
              // getListCareerCustomer(params);
            }
            setShowModalCareer(false);
          }}
        />
        <AddCustomerGroupModal
          onShow={showModalCgp}
          data={null}
          onHide={(reload) => {
            if (reload) {
              // getListCustomerGroup(params);
            }
            setShowModalCgp(false);
          }}
        />
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
