/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Icon from "components/icon";
import Input from "components/input/input";
import Tippy from "@tippyjs/react";
import SelectCustom from "components/selectCustom/selectCustom";
import Radio from "components/radio/radio";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import Checkbox from "components/checkbox/checkbox";
import RadioList from "components/radio/radioList";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import { Parser } from "formula-functionizer";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddCustomerModalProps } from "model/customer/PropsModel";
import { ICustomerRequest } from "model/customer/CustomerRequestModel";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { EMAIL_REGEX, PHONE_REGEX } from "utils/constant";
import { SelectOptionData } from "utils/selectCommon";
import { showToast } from "utils/common";
import { getDomain, isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import ImageThirdGender from "assets/images/third-gender.png";
import CustomerAttributeService from "services/CustomerAttributeService";
import CustomerExtraInfoService from "services/CustomerExtraInfoService";
import { convertToId } from "reborn-util";
import "./AddCustomerCompanyModal.scss";
import EmployeeService from "services/EmployeeService";
import CheckboxList from "components/checkbox/checkboxList";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import { ContextType, UserContext } from "contexts/userContext";
import CareerService from "services/CareerService";
import ImgPushCustomer from "assets/images/img-push.png";
import ContactService from "services/ContactService";
import AddContactModal from "pages/Contact/partials/AddContactModal";
import AddCustomerSourceModal from "pages/SettingCustomer/partials/CustomerResources/partials/AddCustomerSourceModal";
import CustomerSourceService from "services/CustomerSourceService";
import AddCustomerCareerModal from "pages/SettingCustomer/partials/CustomerCareer/partials/AddCustomerCareerModal";
import CustomerGroupService from "services/CustomerGroupService";
import { use } from "i18next";
import AddCustomerGroupModal from "pages/SettingCustomer/partials/CustomerGroup/partials/AddCustomerGroupModal";

export default function AddCustomerCompanyModal(props: AddCustomerModalProps) {
  const { onShow, data, onHide, takeInfoCustomer } = props;
  const parser = new Parser();

  const focusedElement = useActiveElement();
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

      const changeRelations = (result.relations || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        };
      });
      setRelatedCustomers(changeRelations);
      if (result.cgpId) {
        setCgpData({
          value: result.cgpId,
          label: result?.cgpName || result?.groupName || "",
        });
        setFormData((prev) => ({
          ...prev,
          values: {
            ...prev.values,
            cgpId: result.cgpId,
          },
        }));
      }
    } else {
      showToast(response.error ?? response.message ??"Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
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
    if (data?.contactId) {
      setDataContact({ value: data?.contactId, label: data?.contactName || "" });
    }
    if (data?.sourceId) {
      setDataSource({ value: data?.sourceId, label: data?.sourceName || "" });
    }

    if (data?.sourceId == null) {
      setListSourceCustomer([]);
    }

    if (data?.cgpId) {
      setCgpData({ value: data.cgpId, label: data?.cgpName || "" });
    }
  }, [data, onShow]);

  const getCustomerAttributes = async () => {
    if (!mapCustomerAttribute || mapCustomerAttribute.length === 0) {
      const response = await CustomerAttributeService.listAll(1);
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
    if (!data?.branchId) {
      branchList();
    } else {
      setBranchId(null);
    }
  }, [data]);

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
    if (data?.branchId == null) {
      if (dataBranch && checkUserRoot == "1") {
        onSelectOpenBeautyBranch();
      } else {
        setListBeautyBranch([]);
      }
    }
  }, [data, checkUserRoot, dataBranch]);

  const onSelectOpenCareer = async () => {
    if (!listCareer || listCareer.length === 0) {
      setIsLoadingCareer(true);

      const dataOption = await SelectOptionData("careerId", { custType: 1 });
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

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId");
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

  // danh sách ngành nghề
  const [careerList, setCareerList] = useState([]);
  const [showModalCareer, setShowModalCareer] = useState(false);

  const loadedOptionCareer = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      custType: 1,
    };

    const response = await CareerService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới ngành nghề", isShowModal: true, avatar: "custom" }] : []),
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

  useEffect(() => {
    if (onShow) {
      getCustomerAttributes();
    }

    if (data?.id) {
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
    const response = await CustomerExtraInfoService.list(data?.id, 1);
    setCustomerExtraInfos(response.code === 0 ? response.result : []);
  };

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        phone: data?.phoneMasked ?? "",
        taxCode: data?.taxCode ?? "",
        recommenderPhone: data?.recommenderPhone ?? "",
        email: data?.emailMasked ?? "",
        address: data?.address ?? "",
        sourceId: data?.sourceId ?? null,
        branchId: checkUserRoot == "1" ? data?.branchId ?? dataBranch.value ?? null : 0,
        // careerId: data?.careerId ?? null,
        careers: data?.careers ?? "[]",
        employeeId: data?.employeeId ?? employeeIdDefault ?? null,
        cgpId: data?.cgpId ?? null,
        avatar: data?.avatar ?? "",
        custType: checkCustType,
        contactId: data?.contactId ?? null,
        trademark: data?.trademark ?? null,
        employeeTitle: data?.employeeTitle ?? null,
        isExternal: data?.isExternal?.toString() ?? "1",
        relationIds: data?.relationIds ?? [],
      } as ICustomerRequest),
    [data, onShow, checkUserRoot, checkCustType, employeeIdDefault, branchId, dataBranch]
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
    // {
    //   name: "taxCode",
    //   rules: "required",
    // },
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
  ];

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
            if (selectedValue != undefined && selectedValue == 0) {
              localStorage.setItem("customer.custType", "0");
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
          label: "Tên công ty",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Thương hiệu",
          name: "trademark",
          type: "text",
          fill: true,
        },
      ] as IFieldCustomize[],
    []
  );

  //? Start xử lý người đại diện pháp luật

  const [isLoadingOption, setIsLoadingOption] = useState<boolean>(false);
  const loadedOptionContact = async (search, loadedOptions, { page }) => {
    const param = {
      keyword: search,
      page: page,
      limit: 10,
      // customerId: idCustomer,
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

  const [dataContact, setDataContact] = useState(null);
  const handleChangeValueContact = (e) => {
    if (e?.isShowModal) {
      setShowModalContact(true);
      setDataContact(null);
      setFormData({ ...formData, values: { ...formData?.values, contactId: null } });
    } else {
      setDataContact(e);
      setFormData({ ...formData, values: { ...formData?.values, contactId: e.value } });
    }
  };

  //? End xử lý người đại diện pháp luật

  //? Start xử lý đối tượng khách hàng

  const [showModalAddSource, setShowModalAddSource] = useState(false);

  const loadedOptionSource = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 1000,
    };

    const response = await CustomerSourceService.list(param);

    if (response.code === 0) {
      // const dataOption = response.result.items || [];
      const dataOption = response?.result || [];

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới đối tượng khách hàng", isShowModal: true, avatar: "custom" }] : []),
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

  const [countCheckAddSource, setCountCheckAddSource] = useState(0);
  useEffect(() => {
    if (!showModalAddSource) {
      setCountCheckAddSource(countCheckAddSource + 1);
      loadedOptionSource("", undefined, { page: 1 });
    }
  }, [showModalAddSource]);

  const formatOptionLabelSource = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar" style={avatar == "custom" ? { width: "1.8rem", height: "1.8rem" } : {}}>
          <img src={avatar == "custom" ? ImgPushCustomer : avatar ? avatar : ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const [dataSource, setDataSource] = useState(null);
  const handleChangeValueSource = (e) => {
    if (e?.isShowModal) {
      setShowModalAddSource(true);
      setDataSource(null);
      setFormData({ ...formData, values: { ...formData?.values, sourceId: null } });
    } else {
      setDataSource(e);
      setFormData({ ...formData, values: { ...formData?.values, sourceId: e.value } });
    }
  };

  //? End xử lý đối tượng khách hàng
  const sourceDomain = getDomain(decodeURIComponent(document.location.href));

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
          iconClickEvent: () => setIsShowPhone(!isShowPhone),
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
          messageErrorRegex: "Email không đúng định dạng",
        },
        {
          label: "Mã số thuế",
          name: "taxCode",
          type: "text",
          fill: true,
          // required: sourceDomain == "localhost" ? true : false,
          required: sourceDomain == "tnteco.reborn.vn" ? true : false,
        },
        // {
        //   label: "Người đại diện pháp luật",
        //   name: "contactId",
        //   type: "select",
        //   fill: true,
        //   options: listContact,
        //   onMenuOpen: onSelectOpenContact,
        //   isLoading: isLoadingContact,
        // },
        {
          name: "contactId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheck}
              id="contactId"
              name="contactId"
              label="Người đại diện pháp luật"
              fill={true}
              // required={true}
              options={[]}
              value={dataContact}
              onChange={(e) => handleChangeValueContact(e)}
              isFormatOptionLabel={true}
              isAsyncPaginate={true}
              loadOptionsPaginate={loadedOptionContact}
              placeholder="Chọn người quyết định"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelContact}
              // isLoading={isLoadingOption}
              message="Người đại diện pháp luật không được để trống"
            />
          ),
        },
        {
          label: "Địa chỉ (ĐKKD)",
          name: "address",
          type: "text",
          fill: true,
        },
      ] as IFieldCustomize[],
    [isShowPhone, isShowEmail, data, listContact, isLoadingContact, countCheck, dataContact, formData, sourceDomain]
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

  // danh sách nhóm khách hàng
  const [cgpData, setCgpData] = useState(null);
  const [showModalCgp, setShowModalCgp] = useState(false);

  const loadedOptionCgp = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
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
        setCgpData({
          value: data.cgpId,
          label: data?.cgpName || data?.groupName || "",
        });
      }
    }, [data, onShow]);

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
        // {
        //   label: "Đối tượng khách hàng",
        //   name: "sourceId",
        //   type: "select",
        //   fill: true,
        //   options: listSourceCustomer,
        //   onMenuOpen: onSelectOpenCustomerSource,
        //   isLoading: isLoadingCustomerSource,
        // },
        {
          label: "Đối tượng khách hàng",
          name: "sourceId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddSource}
              id="sourceId"
              name="sourceId"
              label="Đối tượng khách hàng"
              fill={true}
              // required={true}
              options={[]}
              value={dataSource}
              onChange={(e) => handleChangeValueSource(e)}
              isFormatOptionLabel={true}
              isAsyncPaginate={true}
              loadOptionsPaginate={loadedOptionSource}
              placeholder="Chọn đối tượng khách hàng"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelSource}
              // isLoading={isLoadingOption}
              message="Đối tượng khách hàng không được để trống"
            />
          ),
        },
        // {
        //   label: "Ngành nghề",
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
              label="Ngành nghề"
              fill={true}
              options={[]}
              isMulti={true}
              value={careerList}
              onChange={(e) => handleChangeValueCareer(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionCareer}
              placeholder="Chọn ngành nghề"
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
        //   label: "Phân loại khách hàng",
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
          label: "Chức vụ",
          name: "employeeTitle",
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
      dataSource,
      formData,
      countCheckAddCareer,
      countCheckAddCgp,
      cgpData,
      dataContact,
    ]
  );

  const handleShowPhone = async (id: number) => {
    const response = await CustomerService.viewPhone(id);

    if (response.code == 0) {
      const result = response.result;
      setFormData({ ...formData, values: { ...formData?.values, phone: result } });
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem số điện thoại !", "error");
    } else {
      showToast(response.error ?? response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
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
      showToast(response.error ?? response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
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

    ///check validate các trường động
    if (
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
      ...(formData.values as ICustomerRequest),
      customerExtraInfos: customerExtraInfos,
    };

    const response = await CustomerService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} khách hàng thành công`, "success");
      clearForm(true);
      setCustomerExtraInfos([]);
      takeInfoCustomer && takeInfoCustomer(response.result);
    } else {
      showToast(response.error ?? response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
        setCustomerExtraInfos([]);
        setRelatedCustomers([]);
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

  const handleChangeValueContractItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueContactItem = (e, contactAttribute) => {
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
        attrObj["customerAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });
    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
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
                value={+getCustomerAttributeValue(customerAttribute.id)} //+ là quan trọng
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
    }

    return CustomControl;
  };

  const clearForm = (acc) => {
    onHide(acc);
    setBranchId(null);
    setCareerList([]);
    setCustomerExtraInfos([]);
    setIsShowEmail(false);
    setIsShowPhone(false);
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
        className="modal-customer-company"
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
                  <FileUpload type="avatar" label="Ảnh đại diện" formData={formData} setFormData={setFormData} />
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
              {mapCustomerAttribute ? (
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
          <AddContactModal
            onShow={showModalContact}
            data={null}
            idCustomer={null}
            onHide={(reload) => {
              // if (reload) {
              //   getListContact(params);
              // }
              setShowModalContact(false);
            }}
          />
          <AddCustomerSourceModal
            onShow={showModalAddSource}
            data={null}
            onHide={(reload) => {
              // if (reload) {
              //   getListCustomerSource(params);
              // }
              setShowModalAddSource(false);
            }}
          />
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
