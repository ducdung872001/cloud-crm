import React, { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import { isDifferenceObj } from "reborn-util";
import { ICareerFilterRequest } from "model/career/CareerRequest";
import { ISendSMS } from "model/sendSMS/PropsModel";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { IEstimateRequestModel } from "model/estimate/EstimateRequestModel";
import { ICustomerFilterRequest, IListByIdFilterRequest } from "model/customer/CustomerRequestModel";
import { IConfigCodeResponseModel } from "model/configCode/ConfigCodeResponse";
import { ISendSMSRequestModel } from "model/sendSMS/SendSMSRequest";
import { ISendSMSResponseModel } from "model/sendSMS/SendSMSResponse";
import { IRelationShipFilterRequest } from "model/relationShip/RelationShipRequest";
import { ICustomerSourceFilterRequest } from "model/customerSource/CustomerSourceRequest";
import { ICustomerGroupFilterRequest } from "model/customerGroup/CustomerGroupRequestModel";
import Validate, { handleChangeValidate } from "utils/validate";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import Radio from "components/radio/radio";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { ModalFooter } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import AvatarFemale from "assets/images/avatar-female.jpg";
import AvatarMale from "assets/images/avatar-male.jpg";
import { showToast } from "utils/common";
import { SelectOptionData } from "utils/selectCommon";
import EstimateService from "services/EstimateService";
import CustomerService from "services/CustomerService";
import ConfigCodeService from "services/ConfigCodeService";
import SendSMSService from "services/SendSMSService";
import CareerService from "services/CareerService";
import CustomerGroupService from "services/CustomerGroupService";
import CustomerSourceService from "services/CustomerSourceService";
import RelationShipService from "services/RelationShipService";
import AddCustomerSendModal from "../AddCustomerSendModal/AddCustomerSendModal";
import ChooseTemplateSMSList from "./partials/ChooseTemplateSMS/ChooseTemplateSMSModal";
import "./AddEditSendSMS.scss";
import RepeatTime from "../RepeatTime";
import { useNavigate } from "react-router-dom";

interface IFilterUser {
  id: number;
  avatar: string;
  name: string;
  gender: number;
}

export default function AddEditSendSMS(props: ISendSMS) {
  const { onHide, onShow, idSendSMS, listIdCustomerProps, paramCustomerProps, onBackProps, type, customerIdList, isView } = props;

  const navigate = useNavigate();
  //? biến này tạo ra với mục đích submit form
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  //! validate theo tiêu chí giới hạn số lượng gửi tối đa sms cho khách hàng
  const [checkFieldQtyCustomer, setCheckFieldQtyCustomer] = useState<boolean>(false);

  //! biến này tạo ra với mục đích validate số khách hàng tối đa muốn gửi
  const [isLimitCustomer, setIsLimitCustomer] = useState<boolean>(false);

  //! biến này tạo ra với mục đích lấy ước lượng tổng số khách hàng muốn gửi
  const [totalEstimate, setTotalEstimate] = useState<number>(null);

  //? biến này tạo ra với mục đích thay đổi nội dung sms
  const [content, setContent] = useState<string>("");

  //! biến này tạo ra với mục đích check xem có phân trang hay không
  const [isLoadMoreAble, setIsLoadMoreAble] = useState<boolean>(false);
  const [pageCustomer, setPageCustomer] = useState<number>(1);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  // biến này tạo ra với mục đích ẩn hiện tiêu chí
  const [optionOne, setOptionOne] = useState<boolean>(false);
  const [optionTwo, setOptionTwo] = useState<boolean>(false);
  const [optionThree, setOptionThree] = useState<boolean>(false);

  //? biến này tạo ra với mục đích hiển thị modal thêm người dùng
  const [showModalAddCustomer, setShowModalAddCustomer] = useState<boolean>(false);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //? biến này tạo ra với mục đích hiển thị người dùng thỏa mã đk cho trước
  const [filterUser, setFilterUser] = useState<IFilterUser[]>([]);

  // biến này tạo ra với mục đích lấy sách người dùng
  const [listCustomer, setListCustomer] = useState<ICustomerResponse[]>([]);

  // Lấy ra danh sách id người dùng từ props chuyền sang
  const [listIdCustomer, setListIdCustomer] = useState([]);

  useEffect(() => {
    if (listIdCustomerProps && listIdCustomerProps.length > 0) {
      setListIdCustomer(listIdCustomerProps);
    }
  }, [listIdCustomerProps]);

  //! đoạn này xử lý Call API Customer nhận params từ props để mapping
  const getListCustomer = async () => {
    const param = {
      lstId: listIdCustomerProps.join(","),
      page: 1,
      limit: 1000,
    };

    const response = await CustomerService.listById(param);

    if (response.code === 0) {
      const result = response.result.items;
      setListCustomer(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //! Sau khi đã có data customer thì qua bước lọc những id nào thỏa mãn đk
  const getFilterUsers = () => {
    const newCustomer = [];

    if (listCustomer.length > 0 && filterUser.length === 0) {
      listIdCustomer.map((item) => {
        listCustomer.filter((element) => {
          if (item === element.id) {
            const result = {
              id: element.id,
              avatar: element.avatar,
              name: element.name,
              gender: element.gender,
            };
            return newCustomer.push(result);
          }
        });
      });
    }

    if (newCustomer.length > 0) {
      setFilterUser(newCustomer);
    }
  };

  useEffect(() => {
    if (paramCustomerProps && listIdCustomerProps && listIdCustomerProps.length > 0) {
      getFilterUsers();
    }
  }, [paramCustomerProps, listIdCustomerProps, listCustomer]);

  //? Danh sách code sms
  const [listCodeSMS, setListCodeSMS] = useState<IConfigCodeResponseModel[]>([]);
  const [isLoadingCodeSMS, setIsLoadingCodeSMS] = useState<boolean>(false);

  //! Call API code SMS
  const getListCodeSMS = async () => {
    setIsLoadingCodeSMS(true);

    const param = {
      type: 1,
    };

    const response = await ConfigCodeService.list(param);

    if (response.code === 0) {
      const result = response.result.items;
      setListCodeSMS(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingCodeSMS(false);
  };

  useEffect(() => {
    if (onShow) {
      getListCodeSMS();
    }
  }, [onShow]);

  //! lấy chi tiết sms
  const [data, setData] = useState<ISendSMSResponseModel>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const getDetailSendSMS = async () => {
    setIsLoadingData(true);

    const response = await SendSMSService.detailSendSMS(idSendSMS);

    if (response.code == 0) {
      const result = response.result;

      setContent(result.content);

      if (result?.receiverType == 3) {
        const takeLstIdCustomer = JSON.parse(result.receiverCriteria || "[]");
        setListIdCustomer(takeLstIdCustomer);
      }

      setData({
        id: result.id,
        brandnameId: result.brandnameId,
        content: result.content,
        receiverType: result.receiverType,
        receiverCriteria: result.receiverCriteria,
        templateId: result?.templateId,
        limit: result?.limit,
        timeType: result?.timeType,
        timeAt: result?.timeAt,
        recurrenceTime: result.recurrenceTime,
      });
    }

    setIsLoadingData(false);
  };

  useEffect(() => {
    if (onShow && idSendSMS) {
      getDetailSendSMS();
    }
  }, [onShow, idSendSMS]);

  //? Lấy danh sách brand name
  const [listBrandname, setListBrandname] = useState<IOption[]>([]);
  const [idBrandname, setIdBrandname] = useState<number>(0);
  const [firstValueBrandname, setFirstValueBrandname] = useState<number>(0);
  const [isLoadingBrandname, setIsLoadingBrandname] = useState<boolean>(false);

  //! Call API brand name
  const onSelectBrandname = async () => {
    if (!listBrandname || listBrandname.length === 0) {
      setIsLoadingBrandname(true);
      const dataOption = await SelectOptionData("brandnameId");
      if (dataOption) {
        setFirstValueBrandname(dataOption[0].value);
        setListBrandname([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingBrandname(false);
    }
  };

  useEffect(() => {
    if (onShow || data?.brandnameId) {
      onSelectBrandname();
    }
  }, [data, onShow]);

  //! đoạn này xử lý lấy giá trị đầu tiên của brand name để hiển thị ngay khi vào page
  useEffect(() => {
    if (!data && firstValueBrandname) {
      setFormData({ ...formData, values: { ...formData.values, brandnameId: firstValueBrandname } });
    }
  }, [firstValueBrandname, data]);

  //! đoạn này xử lý lấy id brand name rồi gửi đi
  useEffect(() => {
    if (idBrandname) {
      setFormData({ ...formData, values: { ...formData.values, brandnameId: idBrandname } });
    }
  }, [idBrandname]);

  //! đoạn này list field brand name
  const listFieldBrandname = useMemo(
    () =>
      [
        {
          label: "",
          name: "brandnameId",
          type: "select",
          options: listBrandname,
          onMenuOpen: onSelectBrandname,
          isLoading: isLoadingBrandname,
          fill: true,
          required: true,
          placeholder: "Chọn đầu số gửi",
          onChange: (e) => handleChangeValueBrandname(e),
        },
      ] as IFieldCustomize[],
    [listBrandname, isLoadingBrandname]
  );

  //! đoạn này xử lý thay đổi giá trị brand name
  const handleChangeValueBrandname = (e) => {
    setIdBrandname(e.value);
  };

  const values = useMemo(
    () =>
      ({
        content: data?.content ?? "",
        templateId: data?.templateId ?? 0,
        brandnameId: data?.brandnameId ? data?.brandnameId : firstValueBrandname,
        receiverType: idSendSMS ? data?.receiverType?.toString() : listIdCustomerProps?.length > 0 ? "3" : customerIdList ? "3" : "1",
        receiverCriteria: data?.receiverCriteria ?? customerIdList ?? "[]",
        limit: data?.limit ?? "",
        timeType: data?.timeType?.toString() ?? "1",
        timeAt: data?.timeAt ?? "",
      } as ISendSMSRequestModel),
    [onShow, data, listIdCustomerProps, firstValueBrandname, idSendSMS, customerIdList]
  );

  //* đoạn này validations form
  const validations: IValidation[] = [
    {
      name: "timeType",
      rules: "required",
    },
    {
      name: "brandnameId",
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

  useEffect(() => {
    if (onShow && listIdCustomerProps && listIdCustomerProps.length > 0 && formData?.values?.receiverType == 3) {
      getListCustomer();
    }
  }, [listIdCustomerProps, onShow, formData?.values?.receiverType]);

  useEffect(() => {
    if (formData?.values.receiverType && onShow) {
      if (formData?.values.receiverType == 1) {
        setOptionOne(true);
        setOptionTwo(false);
        setOptionThree(false);
      } else if (formData?.values.receiverType == 2) {
        setOptionTwo(true);
        setOptionOne(false);
        setOptionThree(false);
      } else {
        setOptionThree(true);
        setOptionOne(false);
        setOptionTwo(false);
      }
    }
  }, [formData?.values.receiverType, onShow]);

  const getTotalEstimate = async () => {
    const body: IEstimateRequestModel = {
      lstCgpId: [],
      lstCareerId: [],
      lstSourceId: [],
      lstRelationshipId: [],
    };

    const response = await EstimateService.takeEstimate(body);

    if (response.code == 0) {
      const result = response.result;
      setTotalEstimate(result);
    }
  };

  //Đoạn này sử lý khi lựa chọn theo tiêu chí 1
  useEffect(() => {
    if (optionOne && !totalEstimate && data?.receiverType != 1) {
      getTotalEstimate();
    }
  }, [optionOne, totalEstimate, data]);

  const handScrollElementAddCustomer = (e) => {
    if (isLoadingCustomer) {
      return;
    }

    const scrollHeight = e.target.scrollHeight;
    const scrollTop = e.target.scrollTop;
    const scrollClientHeight = e.target.clientHeight;

    const result = scrollHeight - Math.round(scrollTop) === scrollClientHeight;

    if (result && isLoadMoreAble) {
      setPageCustomer((prevState) => prevState + 1);
    }
  };

  const detailCustomerUpdate = async (takeIdCustomer: number[]) => {
    if (takeIdCustomer.length <= 0) return;

    setIsLoadingCustomer(true);

    const param: IListByIdFilterRequest = {
      lstId: takeIdCustomer.join(","),
      page: pageCustomer,
      limit: 10,
    };

    const response = await CustomerService.listById(param);

    if (response.code === 0) {
      const result = response.result;
      setIsLoadMoreAble(result?.loadMoreAble);

      const newDataCustomer = pageCustomer == 1 ? [] : filterUser;

      (result.items || []).map((item) => {
        newDataCustomer.unshift(item);
      });

      const convertData = newDataCustomer.map((item: IFilterUser) => {
        return {
          id: item.id,
          avatar: item.avatar,
          name: item.name,
          gender: item.gender,
        };
      });
      setFilterUser(convertData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (data?.receiverType == 3 && onShow) {
      const takeIdCustomer = JSON.parse(data?.receiverCriteria || "[]");
      detailCustomerUpdate(takeIdCustomer);
    }
  }, [data?.receiverCriteria, data?.receiverType, onShow, pageCustomer]);

  useEffect(() => {
    if (customerIdList && customerIdList.length > 0) {
      const takeIdCustomer = customerIdList || [];
      detailCustomerUpdate(takeIdCustomer);
      setListIdCustomer(takeIdCustomer);
    }
  }, [onShow, customerIdList]);

  const handleLstCgpId = async (lstCgpId: number[]) => {
    const response = await await CustomerGroupService.list();

    if (response.code == 0) {
      const result = (response.result || [])
        .filter((item) => {
          return lstCgpId.some((element) => {
            return element === item.id;
          });
        })
        .map((el) => {
          return {
            value: el.id,
            label: el.name,
          };
        });

      setValueCgp(result);
    }
  };

  const handleLstSourceId = async (lstSourceId: number[]) => {
    const response = await CustomerSourceService.list();

    if (response.code == 0) {
      const result = (response.result || [])
        .filter((item) => {
          return lstSourceId.some((element) => {
            return element === item.id;
          });
        })
        .map((el) => {
          return {
            value: el.id,
            label: el.name,
          };
        });

      setValueSource(result);
    }
  };

  const handleLstCareerId = async (lstCareerId: number[]) => {
    const response = await CareerService.list();

    if (response.code == 0) {
      const result = (response.result || [])
        .filter((item) => {
          return lstCareerId.some((element) => {
            return element === item.id;
          });
        })
        .map((el) => {
          return {
            value: el.id,
            label: el.name,
          };
        });

      setValueCareer(result);
    }
  };

  const handleLstRelationshipId = async (lstRelationshipId: number[]) => {
    const response = await RelationShipService.list();

    if (response.code == 0) {
      const result = (response.result || [])
        .filter((item) => {
          return lstRelationshipId.some((element) => {
            return element === item.id;
          });
        })
        .map((el) => {
          return {
            value: el.id,
            label: el.name,
          };
        });

      setValueRelationship(result);
    }
  };

  useEffect(() => {
    if (data?.receiverType == 2) {
      const takeValues = JSON.parse(data?.receiverCriteria || "[]");

      if (takeValues?.lstCareerId > 0) {
        handleLstCareerId(takeValues?.lstCareerId);
      }

      if (takeValues?.lstCgpId > 0) {
        handleLstCgpId(takeValues?.lstCgpId);
      }

      if (takeValues?.lstRelationshipId > 0) {
        handleLstRelationshipId(takeValues?.lstRelationshipId);
      }

      if (takeValues?.lstSourceId > 0) {
        handleLstSourceId(takeValues?.lstSourceId);
      }
    }
  }, [data?.receiverCriteria, data?.receiverType]);

  //! đoạn này mình xử lý theo lựa chọn tiêu chí người nhận
  const handleChangeValueAllCustomer = (e) => {
    const value = e.target.value;
    setOptionOne(!optionOne);
    setOptionTwo(false);
    setOptionThree(false);
    setFormData({ ...formData, values: { ...formData.values, receiverType: value, limit: "" } });
  };

  //! đoạn này mình xử lý theo lựa chọn tiêu chí tùy chọn
  const handleChangeValueCustomCriteria = (e) => {
    const value = e.target.value;
    setOptionTwo(!optionTwo);
    setOptionOne(false);
    setOptionThree(false);
    setFormData({ ...formData, values: { ...formData.values, receiverType: value, limit: "" } });
  };

  //! đoạn này mình xử lý theo lựa chọn theo khách hàng cụ thể
  const handleChangeValueSpecificObject = (e) => {
    const value = e.target.value;
    setOptionThree(!optionThree);
    setOptionOne(false);
    setOptionTwo(false);
    setFormData({ ...formData, values: { ...formData.values, receiverType: value } });
  };

  //! đoạn này xử lý thay đổi số lượng người nhận
  const handleChageValueLimit = (e) => {
    oninput = () => {
      setIsLimitCustomer(false);
    };
    const value = e.floatValue;
    setFormData({ ...formData, values: { ...formData.values, limit: value } });
  };

  //! đoạn này xử lý validate form số lượng người nhận
  const handleChangeBlurLimit = (e) => {
    const value = e.target.value;

    if (value.length == 0) {
      setIsLimitCustomer(true);
    }

    if (value == "0") {
      setIsLimitCustomer(true);
    }
  };

  useEffect(() => {
    if (formData.values.receiverType == "2" || formData.values.receiverType == "3") {
      setIsLimitCustomer(false);
    }
  }, [formData.values.receiverType]);

  //! đoạn này xử lý xóa người dùng được chọn
  const handleRemoveCustomer = (id) => {
    const newCustomers = filterUser.filter((item) => item.id !== id);
    const newIdCustomers = newCustomers.map((item) => item.id);
    setFilterUser(newCustomers);
    setListIdCustomer(newIdCustomers);
  };

  //? biến này tạo ra với mục đích lấy vị trí con trỏ
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  //! đoạn này sẽ xử lý thay đổi nội dung
  const handleChangeContent = (e) => {
    const value = e.target.value;

    setContent(value);
    setCursorPosition(e.target.selectionStart);
    setFormData({ ...formData, values: { ...formData.values, content: value } });
  };

  //! đoạn này xử lý chèn text theo vị trí con trỏ khi click
  const handlePointerContent = (data) => {
    const value = data.code;

    let content = formData.values.content;
    const textBeforeCursorPosition = content.substring(0, cursorPosition);
    const textAfterCursorPosition = content.substring(cursorPosition);

    content = textBeforeCursorPosition + value + textAfterCursorPosition;

    setContent(content);
    setFormData({ ...formData, values: { ...formData.values, content } });
  };

  const listFieldSetupSMS = useMemo(
    () =>
      [
        {
          label: "",
          name: "timeType",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Gửi ngay",
            },
            {
              value: "2",
              label: "Gửi vào lúc",
            },
            {
              value: "3",
              label: "Lặp lại",
            },
          ],
          fill: true,
        },
        ...(formData?.values?.timeType === "2"
          ? ([
              {
                label: "",
                name: "timeAt",
                type: "date",
                fill: true,
                icon: <Icon name="Calendar" />,
                iconPosition: "left",
                hasSelectTime: true,
                onChange: (e) => handleChageValueTimeAt(e),
                placeholder: "Chọn thời gian gửi mong muốn",
                isMinDate: true,
                calculatorTime: true,
              },
            ] as IFieldCustomize[])
          : []),
      ] as IFieldCustomize[],
    [formData?.values?.timeType]
  );

  useEffect(() => {
    if (formData?.values?.timeType && formData?.values?.timeType != "2") {
      setFormData({ ...formData, values: { ...formData?.values, timeAt: "" } });
    }
  }, [formData?.values?.timeType]);

  //! đoạn này mình xử lý gửi theo thời gian mong muốn
  const handleChageValueTimeAt = (e) => {
    setFormData({ ...formData, values: { ...formData.values, timeAt: e } });
  };

  //* Value nhóm khách hàng
  const [valueCgp, setValueCgp] = useState([]);

  //? đoạn này xử lý vấn đề CallAPI lấy danh sách nhóm khách hàng
  const loadOptionCgp = async (search, loadedOptions, { page }) => {
    const param: ICareerFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await CustomerGroupService.list(param);

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

  //* Đoạn này xử lý lấy nhóm khách hàng
  const handleChangeValueCgp = (data) => {
    setValueCgp(data);
  };

  //? Đoạn này xử lý lấy ngành nghề khách hàng
  const [valueCareer, setValueCareer] = useState([]);

  const loadOptionCareer = async (search, loadedOptions, { page }) => {
    const param: ICustomerGroupFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await CareerService.list(param);

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

  //* Đoạn này xử lý lấy ngành nghề khách hàng
  const handleChangeValueCareer = (data) => {
    setValueCareer(data);
  };

  //? Đoạn này xử lý lấy nguồn khách hàng
  const [valueSource, setValueSource] = useState([]);

  const loadOptionSource = async (search, loadedOptions, { page }) => {
    const param: ICustomerSourceFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await CustomerSourceService.list(param);

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

  //* Đoạn này xử lý lấy nguồn khách hàng
  const handleChangeValueSource = (data) => {
    setValueSource(data);
  };

  //? Đoạn này xử lý lấy mối quan hệ khách hàng
  const [valueRelationship, setValueRelationship] = useState([]);

  const loadOptionRelationship = async (search, loadedOptions, { page }) => {
    const param: IRelationShipFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await RelationShipService.list(param);

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

  //* Đoạn này xử lý lấy mối quan hệ khách hàng
  const handleChangeValueRelationship = (data) => {
    setValueRelationship(data);
  };

  //! đoạn này xử lý gom hết id nhóm, ngành nghề, nguồn, mối quan hệ khách hàng vào một object
  useEffect(() => {
    const result = {
      lstCgpId: valueCgp.map((item) => item?.value),
      lstCareerId: valueCareer.map((item) => item?.value),
      lstSourceId: valueSource.map((item) => item?.value),
      lstRelationshipId: valueRelationship.map((item) => item?.value),
    };

    if (formData.values.receiverType == "2") {
      setFormData({ ...formData, values: { ...formData.values, receiverCriteria: JSON.stringify(result) } });
    }
  }, [valueCgp, valueCareer, valueSource, valueRelationship, formData.values.receiverType]);

  //! đoạn này xử lý lấy id của người dùng rồi gửi đi
  const handleTakeDataCustomer = useCallback((lstId: number[], lstCustomer: IFilterUser[]) => {
    setFilterUser([...filterUser, ...lstCustomer]);
    setListIdCustomer([...listIdCustomer, ...lstId]);
  }, []);

  useEffect(() => {
    if (formData.values.receiverType == "3" && listIdCustomer.length > 0) {
      setFormData({ ...formData, values: { ...formData.values, receiverCriteria: JSON.stringify(listIdCustomer) } });
    }

    if (formData?.values.receiverCriteria == "1") {
      setFormData({ ...formData, values: { ...formData.values, receiverCriteria: "" } });
    }
  }, [listIdCustomer, formData.values.receiverType, filterUser]);

  //! đoạn này xử lý lấy id của template sms rồi gửi đi
  const handleTakeDataTemplateSMS = (data) => {
    if (formData.values.content.length === 0) {
      setContent(data.content);
      setFormData({ ...formData, values: { ...formData.values, content: data.content, templateId: data.id } });
    }

    if (formData.values.content.length > 0) {
      showDialogConfirm(data);
    }
  };

  const showDialogConfirm = (data) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Thay đổi nội dung</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn thay đổi nội dung ban đầu? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Đồng ý",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);
        setContent(data.content);
        setFormData({ ...formData, values: { ...formData.values, content: data.content, templateId: data.id } });
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  //! đoạn này xử lý lặp lại
  const [dataRepeatTime, setDataRepeatTime] = useState(null);

  const handleRepeatTime = (data) => {
    let changeData = null;
    let changeOption = null;

    if (data.frequencyType === "day") {
      changeOption = {
        repeatMonthOns: [],
        repeatWeekOns: [],
      };
    }

    if (data.frequencyType === "week") {
      changeOption = {
        repeatMonthOns: [],
        repeatWeekOns: data.repeatWeekOns.filter((item) => item !== "All"),
      };
    }

    if (data.frequencyType === "month") {
      changeOption = {
        repeatWeekOns: [],
        repeatMonthOns: data.repeatMonthOns.filter((item) => item !== "All"),
      };
    }

    if (data.never == "0") {
      changeData = {
        ...data,
        never: true,
        endAt: null,
        after: null,
        ...changeOption,
      };
    }

    if (data.never == "1") {
      changeData = {
        ...data,
        never: false,
        endAt: data.endAt,
        after: null,
        ...changeOption,
      };
    }

    if (data.never == "2") {
      changeData = {
        ...data,
        never: false,
        endAt: null,
        after: data.after,
        ...changeOption,
      };
    }

    if (formData?.values.timeType === "3") {
      setDataRepeatTime(changeData);
    } else {
      setDataRepeatTime(null);
    }
  };

  useEffect(() => {
    if (dataRepeatTime) {
      setFormData({ ...formData, values: { ...formData.values, recurrenceTime: dataRepeatTime } });
    } else {
      setFormData({ ...formData, values: { ...formData.values, recurrenceTime: null } });
    }
  }, [dataRepeatTime]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBrandname, ...listFieldSetupSMS]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (formData?.values?.receiverType == 3 && !listIdCustomer.length) {
      setCheckFieldQtyCustomer(true);
      return;
    }

    setIsSubmit(true);

    const body: ISendSMSRequestModel = {
      ...(formData.values as ISendSMSRequestModel),
      ...(data ? { id: data?.id } : {}),
    };

    const response = await SendSMSService.sendSMS(body);

    if (response.code === 0) {
      showToast("Gửi tin nhắn thành công", "success");
      onHide(true);
      setContent("");
      setValueCgp([]);
      setValueCareer([]);
      setValueSource([]);
      setValueRelationship([]);
      setFilterUser([]);
      setData(null);
      setListIdCustomer([]);
      if (customerIdList) {
        navigate(`/sms_marketting`);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const handClearForm = () => {
    onHide(true);
    setData(null);
    setContent("");
    setValueCgp([]);
    setValueCareer([]);
    setValueSource([]);
    setValueRelationship([]);
    setFilterUser([]);
    setListIdCustomer([]);
    setIsLimitCustomer(false);
  };

  console.log("isView", isView);

  const actions = useMemo<any>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Quay lại",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) || isView ? handClearForm() : showDialogConfirmCancel();
            },
          },
          ...(!isView
            ? [
                {
                  title: idSendSMS ? "Chỉnh sửa" : "Gửi",
                  type: "submit",
                  color: "primary",
                  disabled:
                    isSubmit ||
                    !content.length ||
                    isLimitCustomer ||
                    !isDifferenceObj(formData.values, values) ||
                    (formData.values.receiverType == "1" ? !formData.values.limit : false) ||
                    (formData.values.receiverType == "1" && formData.values.limit ? formData.values.limit > totalEstimate : false),
                  is_loading: isSubmit,
                },
              ]
            : []),
        ],
      },
    }),
    [isSubmit, content, listIdCustomer, isLimitCustomer, formData.values, idSendSMS, totalEstimate, isView]
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
        setContent("");
        setValueCgp([]);
        setValueCareer([]);
        setValueSource([]);
        setValueRelationship([]);
        setData(null);
        setFilterUser([]);
        setListIdCustomer([]);
        setIsLimitCustomer(false);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actionReset = () => {
    setContent("");
    setValueCgp([]);
    setValueCareer([]);
    setValueSource([]);
    setValueRelationship([]);
    setData(null);
    setFilterUser([]);
    setListIdCustomer([]);
    setIsLimitCustomer(false);
  };

  return (
    <div className="page-content page-add-edit-sms">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              if (customerIdList) {
                navigate(`/sms_marketting`);
              }
              !isSubmit && onHide(true);
              !isSubmit && actionReset();
            }}
            className="title-first"
            title="Quay lại"
          >
            {type === "customer" ? "KHÁCH HÀNG" : "SMS MARKETING"}
          </h1>
          {onShow && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  !isSubmit && onBackProps();
                  !isSubmit && actionReset();
                }}
              />
              <h1 className="title-last">{data ? "Chỉnh sửa SMS" : "Gửi SMS"}</h1>
            </Fragment>
          )}
        </div>
      </div>
      <div className="card-box">
        {!isLoadingData ? (
          <form className="form-send-sms" onSubmit={(e) => onSubmit(e)}>
            <div className="wrapper-send-sms">
              <div className="send-sms--body">
                <div className="body-left">
                  <div className="action-option">
                    <h3>Nội dung</h3>
                    <span onClick={() => setIsShowModal(true)}>Chọn mẫu</span>
                  </div>
                  {/* danh sách code sms */}
                  <div className="list-code-sms">
                    {listCodeSMS.map((item, idx) => (
                      <span key={idx} className="name-code" onClick={() => handlePointerContent(item)}>
                        {item.name}
                      </span>
                    ))}
                  </div>
                  {/* Nội dung sms gửi đi */}
                  <div className="form-group">
                    <TextArea
                      value={content}
                      placeholder="Nhập nội dung mà bạn muốn gửi đi"
                      fill={true}
                      required={true}
                      onClick={(e) => handleChangeContent(e)}
                      onChange={(e) => handleChangeContent(e)}
                      maxLength={459}
                    />
                  </div>
                  <div className="notification">
                    <div className="count">
                      Còn lại{" "}
                      {160 - +formData?.values?.content?.length >= 0
                        ? 160 - +formData?.values?.content?.length
                        : 146 + (160 - +formData?.values?.content?.length) >= 0
                        ? 146 + (160 - +formData?.values?.content?.length)
                        : 153 + (146 + (160 - +formData?.values?.content?.length))}{" "}
                      ký tự
                    </div>
                    <div className="info-notification">
                      {160 - +formData?.values?.content?.length >= 0 ? 1 : 146 + (160 - +formData?.values?.content?.length) >= 0 ? 2 : 3} SMS
                      <span className="total-count"> ( {+formData?.values?.content?.length} ký tự )</span>
                    </div>
                  </div>
                </div>
                <div className="body-right">
                  <div className="info-option">
                    <div className="brandname">
                      <h3>Đầu số gửi</h3>
                      {listFieldBrandname.map((field, index) => (
                        <FieldCustomize
                          field={field}
                          key={index}
                          handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBrandname, setFormData)}
                          formData={formData}
                        />
                      ))}
                    </div>
                    <div className="custom-criteria">
                      <h3>Người nhận</h3>
                      <div className="list-form-group">
                        {!listIdCustomerProps && (
                          <Fragment>
                            {/* Lựa chọn tiêu chí 1 */}
                            <div className="option-item">
                              <div className="form-group">
                                <Radio
                                  value="1"
                                  label="Gửi cho tất cả khách hàng"
                                  onChange={(e) => handleChangeValueAllCustomer(e)}
                                  checked={optionOne}
                                />
                              </div>

                              {optionOne && (
                                <div className="limit-item-option--one">
                                  <div className="notification-total">
                                    <NummericInput
                                      label="Nhập số khách hàng tối đa muốn gửi"
                                      value={formData.values.limit}
                                      fill={true}
                                      required={true}
                                      error={isLimitCustomer || formData?.values.limit > totalEstimate}
                                      message={`${
                                        formData?.values.limit > totalEstimate
                                          ? `Số khách hàng tối đa muốn gửi phải nhỏ hơn hoặc bằng ${totalEstimate}`
                                          : !formData.values.limit
                                          ? "Số khách hàng tối đa muốn gửi không được để trống"
                                          : formData.values.limit == "0"
                                          ? "Số khách hàng tối đa muốn gửi phải lớn hơn 0"
                                          : ""
                                      }`}
                                      thousandSeparator={true}
                                      placeholder={`Bạn có tối đa ${totalEstimate} khách hàng có thể nhận tin`}
                                      onValueChange={(e) => handleChageValueLimit(e)}
                                      onBlur={(e) => handleChangeBlurLimit(e)}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Lựa chọn tiêu chí 2 */}
                            <div className="option-item">
                              <div className="form-group">
                                <Radio
                                  value="2"
                                  label="Tùy chỉnh tiêu chí"
                                  onChange={(e) => handleChangeValueCustomCriteria(e)}
                                  checked={optionTwo}
                                />
                              </div>

                              {optionTwo && (
                                <div className="limit-item-option--two">
                                  <div className="list-form-group">
                                    {/* Lựa chọn nhóm khách hàng */}
                                    <div className="form-group">
                                      <SelectCustom
                                        id="cgpId"
                                        name="cgpId"
                                        label="Nhóm khách hàng"
                                        fill={true}
                                        options={[]}
                                        placeholder="Chọn nhóm khách hàng"
                                        isMulti={true}
                                        special={true}
                                        value={valueCgp}
                                        isAsyncPaginate={true}
                                        onChange={(item) => handleChangeValueCgp(item)}
                                        additional={{
                                          page: 1,
                                        }}
                                        loadOptionsPaginate={loadOptionCgp}
                                      />
                                    </div>
                                    {/* Lựa chọn ngành nghề khách hàng */}
                                    <div className="form-group">
                                      <SelectCustom
                                        id="careerId"
                                        name="careerId"
                                        label="Và Ngành nghề khách hàng"
                                        options={[]}
                                        fill={true}
                                        placeholder="Chọn ngành nghề khách hàng"
                                        isMulti={true}
                                        special={true}
                                        value={valueCareer}
                                        onChange={(item) => handleChangeValueCareer(item)}
                                        isAsyncPaginate={true}
                                        additional={{
                                          page: 1,
                                        }}
                                        loadOptionsPaginate={loadOptionCareer}
                                      />
                                    </div>
                                    {/* Lựa chọn nguồn khách hàng */}
                                    <div className="form-group">
                                      <SelectCustom
                                        id="sourceId"
                                        name="sourceId"
                                        label="Và Nguồn khách hàng"
                                        options={[]}
                                        fill={true}
                                        placeholder="Chọn nguồn khách hàng"
                                        isMulti={true}
                                        special={true}
                                        value={valueSource}
                                        onChange={(item) => handleChangeValueSource(item)}
                                        isAsyncPaginate={true}
                                        additional={{
                                          page: 1,
                                        }}
                                        loadOptionsPaginate={loadOptionSource}
                                      />
                                    </div>
                                    {/* Lựa chọn mối quan hệ khách hàng */}
                                    <div className="form-group">
                                      <SelectCustom
                                        id="relationshipId"
                                        name="relationshipId"
                                        label="Và Mối quan hệ khách hàng"
                                        options={[]}
                                        fill={true}
                                        placeholder="Chọn mối quan hệ khách hàng"
                                        isMulti={true}
                                        value={valueRelationship}
                                        onChange={(item) => handleChangeValueRelationship(item)}
                                        isAsyncPaginate={true}
                                        additional={{
                                          page: 1,
                                        }}
                                        loadOptionsPaginate={loadOptionRelationship}
                                      />
                                    </div>
                                  </div>
                                  <div className="notification-total">
                                    <NummericInput
                                      label="Nhập số khách hàng tối đa muốn gửi"
                                      value={formData.values.limit}
                                      fill={true}
                                      required={true}
                                      thousandSeparator={true}
                                      placeholder="Nhập số lượng khách hàng tối đa muốn gửi"
                                      onValueChange={(e) => handleChageValueLimit(e)}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </Fragment>
                        )}
                        {/* Lựa chọn tiêu chí 3 */}
                        <div className="option-item">
                          <div className="form-group">
                            <Radio
                              value="3"
                              label="Theo khách hàng cụ thể"
                              onChange={(e) => handleChangeValueSpecificObject(e)}
                              checked={optionThree}
                            />
                          </div>

                          <div className={`list-customer ${checkFieldQtyCustomer ? "has__error--customer" : ""}`}>
                            {formData?.values?.receiverType === "3" ? (
                              <div className="filter-user" onScroll={(e) => handScrollElementAddCustomer(e)}>
                                <div
                                  className="add-customer"
                                  onClick={() => {
                                    setShowModalAddCustomer(true);
                                    setCheckFieldQtyCustomer(false);
                                  }}
                                >
                                  <Icon name="PlusCircleFill" />
                                  Thêm khách hàng
                                </div>
                                {filterUser.length > 0 ? (
                                  filterUser.map((item, idx) => (
                                    <div key={idx} className="wrapper-user">
                                      <div className="info-user">
                                        {item.avatar ? (
                                          <Image src={item.avatar} alt={item.name} />
                                        ) : (
                                          <Image src={item.gender == 2 ? AvatarMale : AvatarFemale} alt={item.name} />
                                        )}
                                        {item.name}
                                      </div>
                                      <span
                                        title="Xóa"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleRemoveCustomer(item.id);
                                        }}
                                      >
                                        <Icon name="Trash" />
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="notification-user">
                                    {checkFieldQtyCustomer ? "Vui lòng chọn người nhận!" : "Bạn chưa có người nhận nào!"}
                                  </span>
                                )}
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <div className="setup-sms">
                          <h3>Thời gian gửi</h3>
                          {listFieldSetupSMS.map((field, index) => (
                            <FieldCustomize
                              field={field}
                              key={index}
                              handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldSetupSMS, setFormData)}
                              formData={formData}
                            />
                          ))}

                          {formData?.values?.timeType === "3" && (
                            <RepeatTime dataProps={data?.recurrenceTime} callback={(data) => handleRepeatTime(data)} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <ModalFooter actions={actions} />
            </div>
          </form>
        ) : (
          <Loading />
        )}

        <ChooseTemplateSMSList
          onShow={isShowModal}
          idBrandname={idBrandname}
          firstIdBrandname={firstValueBrandname}
          callBack={handleTakeDataTemplateSMS}
          onHide={() => setIsShowModal(false)}
        />
        <AddCustomerSendModal
          onShow={showModalAddCustomer}
          onHide={() => setShowModalAddCustomer(false)}
          type={formData?.values?.receiverType}
          callBack={handleTakeDataCustomer}
          listIdCustomer={listIdCustomer}
          lstCustomer={filterUser}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}
