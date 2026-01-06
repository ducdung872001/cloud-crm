import React, { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import _ from "lodash";
import { validateIsEmpty } from "reborn-validation";
import { useNavigate } from "react-router-dom";
import { isDifferenceObj, capitalize, removeHtmlTags } from "reborn-util";
import { ISendEmail } from "model/sendEmail/PropsModel";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ISendEmailResponseModel } from "model/sendEmail/SendEmailResponse";
import { IEstimateRequestModel } from "model/estimate/EstimateRequestModel";
import { ICustomerFilterRequest, IListByIdFilterRequest } from "model/customer/CustomerRequestModel";
import { IConfigCodeResponseModel } from "model/configCode/ConfigCodeResponse";
import { ISendEmailRequestModel } from "model/sendEmail/SendEmailRequest";
import { ICareerFilterRequest } from "model/career/CareerRequest";
import { ICustomerGroupFilterRequest } from "model/customerGroup/CustomerGroupRequestModel";
import { ICustomerSourceFilterRequest } from "model/customerSource/CustomerSourceRequest";
import { IRelationShipFilterRequest } from "model/relationShip/RelationShipRequest";
import Validate, { handleChangeValidate } from "utils/validate";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import Radio from "components/radio/radio";
import Input from "components/input/input";
import moment from "moment";
import NummericInput from "components/input/numericInput";
import Checkbox from "components/checkbox/checkbox";
import CustomScrollbar from "components/customScrollbar";
import RebornEditor from "components/editor/reborn";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { ModalFooter } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import AvatarFemale from "assets/images/avatar-female.jpg";
import AvatarMale from "assets/images/avatar-male.jpg";
import { showToast } from "utils/common";
import { serialize } from "utils/editor";
import CustomerService from "services/CustomerService";
import EstimateService from "services/EstimateService";
import ConfigCodeService from "services/ConfigCodeService";
import SendEmailService from "services/SendEmailService";
import EmailConfigService from "services/EmailConfigService";
import CustomerGroupService from "services/CustomerGroupService";
import CustomerSourceService from "services/CustomerSourceService";
import CareerService from "services/CareerService";
import RelationShipService from "services/RelationShipService";
import AddCustomerSendModal from "../AddCustomerSendModal/AddCustomerSendModal";
import AddTemplateEmailModal from "./partials/AddTemplateEmailModal";
import ViewTemplateEmailModal from "./partials/ViewTemplateEmailModal";
import RepeatTime from "../RepeatTime";
import "./AddEditSendEmail.scss";
import AddFile from "./partials/AddFile";
import { uploadDocumentFormData } from "utils/document";
import FileService from "services/FileService";
import ImgExcel from "assets/images/img-excel.png";
import ImgWord from "assets/images/img-word.png";
import ImgPowerpoint from "assets/images/img-powerpoint.png";
import PlaceholderService from "services/PlaceholderService";

interface IFilterUser {
  id: number;
  avatar: string;
  name: string;
  gender: number;
}

export default function AddEditSendEmail(props: ISendEmail) {
  const { onHide, onShow, idSendEmail, listIdCustomerProps, paramCustomerProps, onBackProps, customerIdList, type } = props;

  const navigate = useNavigate();

  //? biến này tạo ra với mục đích submit form
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  //! biến này tạo ra với mục đích check xem có phân trang hay không
  const [isLoadMoreAble, setIsLoadMoreAble] = useState<boolean>(false);
  const [pageCustomer, setPageCustomer] = useState<number>(1);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  //! validate theo tiêu chí giới hạn số lượng gửi tối đa email cho khách hàng
  const [checkFieldQtyCustomer, setCheckFieldQtyCustomer] = useState<boolean>(false);

  //? biến này tạo ra với mục đích lựa chọn gửi đi cho đối tượng nào
  const [isChooseSend, setIsChooseSend] = useState<boolean>(true);

  //? biến này tạo ra với mục đích lựa chọn gửi đi tất cả
  const [isAll, setIsAll] = useState<boolean>(true);

  //? biến này tạo ra với mục đích lựa chọn ngẫu nhiên
  const [isRandom, setIsRandom] = useState<boolean>(false);

  //? biến này tạo ra với mục đích lựa chọn theo dõi email
  const [isCheckTrackEmail, setIsCheckTrackEmail] = useState<boolean>(true);

  // biến này tạo ra với mục đích thay đổi tiêu đề email
  const [titleEmail, setTitleEmail] = useState<string>("");

  //! biến này tạo ra với mục đích validate tiêu đề email
  const [errorTitleEmail, setErrorTitleEmail] = useState<boolean>(false);

  //! biến này tạo ra với mục đích validate số khách hàng tối đa muốn gửi
  const [isLimitCustomer, setIsLimitCustomer] = useState<boolean>(false);

  //! biến này tạo ra với mục đích lấy ước lượng tổng số khách hàng muốn gửi
  const [totalEstimate, setTotalEstimate] = useState<number>(null);

  // biến này tạo ra với mục đích ẩn hiện tiêu chí
  const [optionOne, setOptionOne] = useState<boolean>(false);
  const [optionTwo, setOptionTwo] = useState<boolean>(false);
  const [optionThree, setOptionThree] = useState<boolean>(false);

  //? biến này tạo ra với mục đích hiển thị modal thêm người dùng
  const [showModalAddCustomer, setShowModalAddCustomer] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //! lấy chi tiết Email
  const [data, setData] = useState<ISendEmailResponseModel>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const getDetailSendEmail = async () => {
    setIsLoadingData(true);

    const response = await SendEmailService.detailSendEmail(idSendEmail);

    if (response.code == 0) {
      const result = response.result;

      setTitleEmail(result.title);

      if (result?.receiverType == 3) {
        const takeLstIdCustomer = JSON.parse(result.receiverCriteria || "[]");
        setListIdCustomer(takeLstIdCustomer);
      }

      const takeIdSourceEmail = JSON.parse(result.emails || "[]");
      if (takeIdSourceEmail?.length > 0) {
        if (takeIdSourceEmail.length === 1) {
          setIsAll(false);
          setIsRandom(true);
          setListIdSourceEmail([0]);
        } else {
          setListIdSourceEmail(takeIdSourceEmail);
        }
      }

      if (result.isTracked) {
        setIsCheckTrackEmail(true);
      } else {
        setIsCheckTrackEmail(false);
      }

      setData({
        id: result.id,
        title: result.title,
        content: result.content,
        emails: result.emails,
        limit: result.limit,
        receiverType: result.receiverType,
        receiverCriteria: result.receiverCriteria,
        templateId: result.templateId,
        timeType: result.timeType,
        timeAt: result.timeAt,
        isTracked: result.isTracked,
        recurrenceTime: result.recurrenceTime,
      });

      setContentEmail(result.content);
    }

    setIsLoadingData(false);
  };

  useEffect(() => {
    if (onShow && idSendEmail) {
      getDetailSendEmail();
    }
  }, [onShow, idSendEmail]);

  //? biến này tạo ra với mục đích hiển thị người dùng thỏa mã đk cho trước
  const [filterUser, setFilterUser] = useState<IFilterUser[]>([]);

  //! lấy mã code email fill vào nội dung
  const [dataCodeEmail, setDataCodeEmail] = useState<string>("");

  //! lấy nội dung email
  const [contentEmail, setContentEmail] = useState<string>("");

  // biến này tạo ra với mục đích lấy sách người dùng
  const [listCustomer, setListCustomer] = useState<ICustomerResponse[]>([]);

  // Lấy ra danh sách id người dùng từ props chuyền sang
  const [listIdCustomer, setListIdCustomer] = useState([]);

  useEffect(() => {
    if (listIdCustomerProps && listIdCustomerProps.length > 0) {
      setListIdCustomer(listIdCustomerProps);
    }
  }, [listIdCustomerProps]);

  //! đoạn này xử lý Call API Customer nhận params từ localStorage để mapping
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

  useEffect(() => {
    if (onShow && listIdCustomerProps && listIdCustomerProps.length > 0) {
      getListCustomer();
    }
  }, [listIdCustomerProps, onShow]);

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
    if (listIdCustomerProps && listIdCustomerProps.length > 0) {
      getFilterUsers();
    }
  }, [listIdCustomerProps, listCustomer]);

  //? Danh sách email nguồn
  const [listSourceEmail, setListSourceEmail] = useState<IOption[]>([]);
  const [listIdSourceEmail, setListIdSourceEmail] = useState<number[]>([]);

  const getListSourceEmail = async () => {
    const param = {
      limit: 100,
    };

    const response = await EmailConfigService.list(param);

    if (response.code === 0) {
      const result = response.result;

      const dataOption = (result || []).map((item) => {
        return {
          value: item.id,
          label: item.email,
        };
      });

      setListSourceEmail(dataOption);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow) {
      getListSourceEmail();
    }
  }, [onShow]);

  useEffect(() => {
    if (!data && !isLoadingData) {
      setIsAll(true);
      setIsRandom(false);
      setListIdSourceEmail(listSourceEmail.map((item) => +item.value));
    }
  }, [data, listSourceEmail, isLoadingData]);

  // //? Danh sách code email
  // const [listCodeEmail, setListCodeEmail] = useState<IConfigCodeResponseModel[]>([]);
  // const [isLoadingCodeEmail, setIsLoadingCodeEmail] = useState<boolean>(false);

  // //! Call API code email
  // const getListCodeEmail = async () => {
  //   setIsLoadingCodeEmail(true);

  //   const param = {
  //     type: 2,
  //   };

  //   const response = await ConfigCodeService.list(param);

  //   if (response.code === 0) {
  //     const result = response.result.items;
  //     setListCodeEmail(result);
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }

  //   setIsLoadingCodeEmail(false);
  // };

  // useEffect(() => {
  //   if (onShow) {
  //     getListCodeEmail();
  //   }
  // }, [onShow]);

  const values = useMemo(
    () =>
      ({
        title: data?.title ?? "",
        content: data?.content ?? "",
        templateId: data?.templateId ?? null,
        receiverType: idSendEmail ? data?.receiverType?.toString() : listIdCustomerProps?.length > 0 ? "3" : customerIdList ? "3" : "1",
        receiverCriteria: data?.receiverCriteria ?? customerIdList ?? "[]",
        limit: data?.limit ?? "",
        timeType: data?.timeType?.toString() ?? "1",
        timeAt: data?.timeAt ?? "",
        emails: data?.emails ?? "[]",
        isTracked: data?.isTracked ?? 1,
      } as ISendEmailRequestModel),
    [listIdCustomerProps, onShow, data, idSendEmail, customerIdList]
  );

  const validations: IValidation[] = [];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

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
  
  const isTimeAtBeforeNow = useMemo(() => {
    try {
      if (!formData?.values?.timeAt || formData?.values?.timeType !== "2") return false;
      return moment(formData.values.timeAt).isSameOrBefore(moment(), 'minute');  // Kiểm tra đến phút
    } catch (e) {
      return false;
    }
  }, [formData?.values?.timeAt, formData?.values?.timeType]);

  const listFieldSetupEmail = useMemo(
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
                placeholder: "Chọn thời gian gửi mong muốn",
                isMinDate: true,
                minDate: moment().toDate(),
                isWarning: isTimeAtBeforeNow,
                messageWarning: "Thời gian gửi phải lớn hơn thời gian hiện tại",
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

  //? Đoạn này xử lý lấy lượt tải
  const [valueUpload, setValueUpload] = useState([]);

  const loadOptionUpload = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await CustomerService.lstUpload(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.uploadId,
                  label: item.fileName,
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

  //* Đoạn này xử lý lấy lượt upload
  const handleChangeValueUpload = (data) => {
    setValueUpload(data);
  };

  //! đoạn này xử lý gom hết id nhóm, ngành nghề, nguồn, mối quan hệ khách hàng vào một object
  useEffect(() => {
    const result = {
      lstCgpId: valueCgp.map((item) => item?.value),
      lstCareerId: valueCareer.map((item) => item?.value),
      lstSourceId: valueSource.map((item) => item?.value),
      lstRelationshipId: valueRelationship.map((item) => item?.value),
      listUploadId: valueUpload.map((item) => item?.value),
    };

    if (formData.values.receiverType == "2") {
      setFormData({ ...formData, values: { ...formData.values, receiverCriteria: result } });
    }
  }, [valueCgp, valueCareer, valueSource, valueRelationship, valueUpload, formData.values.receiverType]);

  //! đoạn này xử lý lấy id của người dùng rồi gửi đi
  const handleTakeDataCustomer = useCallback((lstId: number[], lstCustomer: IFilterUser[]) => {
    setFilterUser([...filterUser, ...lstCustomer]);
    setListIdCustomer([...listIdCustomer, ...lstId]);
  }, []);

  useEffect(() => {
    if (formData.values.receiverType == "3" && listIdCustomer.length > 0) {
      setFormData({ ...formData, values: { ...formData.values, receiverCriteria: listIdCustomer } });
    }

    if (formData?.values.receiverCriteria == "1") {
      setFormData({ ...formData, values: { ...formData.values, receiverCriteria: "" } });
    }
  }, [listIdCustomer, formData.values.receiverType]);

  //? đoạn này sử xử lý thay đổi giá trị tiêu đề email
  const handleChangeValueTitleEmail = (e) => {
    const value = e.target.value;
    oninput = () => {
      setErrorTitleEmail(false);
    };
    setTitleEmail(value);
    setFormData({ ...formData, values: { ...formData.values, title: value } });
  };

  //! đoạn này xử lý validate form khi chưa nhập title
  const handleChangeBlueTitleEmail = (e) => {
    const value = e.target.value;

    if (value.length === 0) {
      setErrorTitleEmail(true);
    }
  };

  // đoạn này lấy mã email
  const handlePointerContent = (data) => {
    const value = data.code;
    setDataCodeEmail(value);
  };

  //! đoạn này thay đổi giá trị văn bản
  const handleChangeContentEmail = (dataConent) => {
    const convertContent = serialize({ children: dataConent });
    setContentEmail(convertContent);
    // setFormData({ ...formData, values: { ...formData?.values, content: convertContent } });
  };

  //! đoạn này sử lý theo dõi đọc email
  const handleChangeValueMemo = (e) => {
    if (e) {
      setIsCheckTrackEmail(e);
      setFormData({ ...formData, values: { ...formData?.values, isTracked: 1 } });
    } else {
      setIsCheckTrackEmail(e);
      setFormData({ ...formData, values: { ...formData?.values, isTracked: 0 } });
    }
  };

  //! đoạn này xử lý thay đổi giá trị email gửi đi
  const handleChangeValueChooseSend = (e) => {
    setIsChooseSend(e);

    if (!e) {
      setListIdSourceEmail([0]);
    }
  };

  //! đoạn này xử lý lựa chọn tất cả
  const handleChangeCheckAllSourceEmail = (isChecked: boolean) => {
    setIsAll(!isAll);
    setIsRandom(false);

    if (isChecked) {
      setListIdSourceEmail &&
        setListIdSourceEmail(
          listSourceEmail.map((item) => {
            return +item.value;
          })
        );
    } else {
      setListIdSourceEmail && setListIdSourceEmail([]);
    }
  };

  //! đoạn này xử lý lựa chọn 1 đối tượng gửi email cụ thể
  const handleChangeCheckOneSourceEmail = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setListIdSourceEmail && setListIdSourceEmail([...(listIdSourceEmail ?? []), id]);
      setIsRandom(false);
      setIsAll(false);
    } else {
      setListIdSourceEmail && setListIdSourceEmail(listIdSourceEmail.filter((i) => i !== id) ?? []);
      setIsRandom(false);
      setIsAll(false);
    }
  };

  //! đoạn này xử lý lựa chọn ngẫu nhiên
  const handleChangeCheckRandomChoose = (isChecked: boolean) => {
    setIsRandom(!isRandom);
    setIsAll(false);

    if (isChecked) {
      setListIdSourceEmail([0]);
    }
  };

  // đoạn này gom hết id email được chọn gửi đi
  useEffect(() => {
    if (listIdSourceEmail.length > 0) {
      setFormData({ ...formData, values: { ...formData.values, emails: JSON.stringify(listIdSourceEmail) } });
    }
  }, [listIdSourceEmail]);

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
        //! đoạn này sử lý logic sau khi chọn template email
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

  // đoạn này bật modal chọn mẫu
  const [showModalAddTemplateEmail, setShowModalAddTemplateEmail] = useState<boolean>(false);
  const [showModalViewTemplateEmail, setShowModalViewTemplateEmail] = useState<boolean>(false);
  const [saveTemplateEmail, setSaveTemplateEmail] = useState<boolean>(false);

  /**
   * Lưu lại mẫu
   * @param e
   * @returns
   */
  const saveTemplate = async (e) => {
    e && e.preventDefault();

    //Validate thủ công
    if (validateIsEmpty(titleEmail)) {
      showToast("Vui lòng nhập Tiêu đề Email", "error");
      return;
    }

    //Validate nội dung
    if (validateIsEmpty(removeHtmlTags(contentEmail))) {
      showToast("Vui lòng nhập Nội dung Email", "error");
      return;
    }

    //Ok thì hiển thị popup ...
    setShowModalAddTemplateEmail(true);
  };

  /**
   * Xử lý khi lựa chọn mẫu email
   * @param item
   */
  const loadTemplateEmail = async (item) => {
    if (item) {
      setTitleEmail(item.title);
      setErrorTitleEmail(false);

      setFormData({ ...formData, values: { ...formData.values, title: item.title } });
      setContentEmail(item.content);
    }
  };

  // const [infoFile, setInfoFile] = useState(null);
  // const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  // const [showProgress, setShowProgress] = useState(0);

  // //Tải mẫu hợp đồng
  // const takeFileAdd = (data) => {
  //   if (data) {
  //       setIsLoadingFile(true)
  //       uploadDocumentFormData(data, onSuccess, onError, onProgress);
  //   }
  // };

  // const onProgress = (percent) => {
  //   if (percent) {
  //     setShowProgress(percent.toFixed(0));
  //     // if (percent === 100) {
  //     //   setShowProgress(0);
  //     // }
  //   }
  // };

  // //* Đoạn này nhận link file đã chọn
  // const onSuccess = (data) => {
  //   if (data) {
  //     setInfoFile(data);
  //     // setDataPaymentBill((preState) => ({ ...preState, template: data.fileUrl }));
  //     setIsLoadingFile(false);
  //   }
  // };

  // //* Đoạn này nếu như mà lỗi không tải lên được thì bắn ra thông báo
  // const onError = (message) => {
  //   setIsLoadingFile(false);
  //   showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  // };

  // useEffect(() => {
  //   if(isLoadingFile === false){
  //     setShowProgress(0);
  //   }
  // }, [isLoadingFile])

  const [listAttactment, setListAttactment] = useState([]);
  const [showProgress, setShowProgress] = useState<number>(0);

  // useEffect(() => {
  //   if (listImageWork && listImageWork.length > 0) {
  //     setFormData({ ...formData, values: { ...formData?.values, docLink: listImageWork } });
  //   } else {
  //     setFormData({ ...formData, values: { ...formData?.values, docLink: [] } });
  //   }
  // }, [listImageWork]);

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
  const onSuccess = (data) => {
    if (data) {
      const result = {
        url: data.fileUrl,
        type: data.extension,
      };

      setListAttactment([...listAttactment, result]);
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
    setListAttactment([...listAttactment, changeResult]);
  };

  const handleRemoveImageItem = (idx) => {
    const result = [...listAttactment];
    result.splice(idx, 1);
    setListAttactment(result);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listFieldSetupEmail);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (formData?.values?.receiverType == 3 && !listIdCustomer.length) {
      setCheckFieldQtyCustomer(true);
      return;
    }

    if (formData?.values?.timeType === "2" && formData?.values?.timeAt) {
      const timeAtMoment = moment(formData.values.timeAt);
      const now = moment();
      
      if (timeAtMoment.isSameOrBefore(now, 'minute')) {
        const newErrors = { 
          ...(formData.errors || {}), 
          timeAt: "Thời gian gửi phải lớn hơn thời gian hiện tại" 
        };
        setFormData((prev) => ({ ...prev, errors: newErrors }));
        return;  // Chặn submit
      }
    }

    setIsSubmit(true);

    const newFormData = _.cloneDeep(formData.values);
    const result = {
      ...newFormData,
      content: contentEmail,
      receiverCriteria: JSON.stringify(newFormData.receiverCriteria),
    };

    const body: ISendEmailRequestModel = {
      ...(result as ISendEmailRequestModel),
      ...(data ? { id: data?.id } : {}),
      timeAt: moment(newFormData.timeAt).format("YYYY-MM-DD HH:mm:ss"),
    };

    const response = await SendEmailService.sendEmail(body);

    if (response.code == 0) {
      showToast("Gửi email thành công", "success");
      // onHide(true);
      // setTitleEmail("");
      // setDataCodeEmail("");
      // setValueCgp([]);
      // setValueCareer([]);
      // setValueSource([]);
      // setValueRelationship([]);
      // setFilterUser([]);
      // setData(null);
      // setListIdCustomer([]);
      // setListIdSourceEmail([]);
      handClearForm(true);
      if (customerIdList) {
        navigate(`/email_marketting`);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const handClearForm = (arr) => {
    onHide(arr);
    setData(null);
    setTitleEmail("");
    setDataCodeEmail("");
    setValueCgp([]);
    setValueCareer([]);
    setValueSource([]);
    setValueRelationship([]);
    setFilterUser([]);
    setListIdCustomer([]);
    setListIdSourceEmail([]);
    setIsLimitCustomer(false);
    setTimeout(() => {
      setContentEmail("");
    }, 2000);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Quay lại",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: idSendEmail ? "Chỉnh sửa" : "Gửi",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !titleEmail.length ||
              isLimitCustomer ||
              !isDifferenceObj(formData.values, values) ||
              (formData.values.receiverType == "1" ? !formData.values.limit : false) ||
              (formData.values.receiverType == "1" && formData.values.limit ? formData.values.limit > totalEstimate : false),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, titleEmail, listIdCustomer, isLimitCustomer, formData.values, idSendEmail, totalEstimate]
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
        setShowDialog(false);
        setContentDialog(null);
        // onHide(false);
        // setTitleEmail("");
        // setDataCodeEmail("");
        // setValueCgp([]);
        // setValueCareer([]);
        // setValueSource([]);
        // setValueRelationship([]);
        // setData(null);
        // setFilterUser([]);
        // setListIdCustomer([]);
        // setListIdSourceEmail([]);
        // setIsLimitCustomer(false);
        handClearForm(false);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actionReset = () => {
    setTitleEmail("");

    setDataCodeEmail("");
    setValueCgp([]);
    setValueCareer([]);
    setValueSource([]);
    setValueRelationship([]);
    setData(null);
    setFilterUser([]);
    setListIdCustomer([]);
    setListIdSourceEmail([]);
    setIsLimitCustomer(false);
    setTimeout(() => {
      setContentEmail("");
    }, 2000);
  };

  const [listApproach, setListApproach] = useState<any>([
    {
      value: "customer",
      label: "Khách hàng",
      color: "#9966CC",
      isActive: true,
      listPlaceholder: [],
    },
    // {
    //   value: "contact",
    //   label: "Người liên hệ",
    //   color: "#6A5ACD",
    //   isActive: false,
    //   listPlaceholder: [],
    // },
    // {
    //   value: "contract",
    //   label: "Hợp đồng",
    //   color: "#007FFF",
    //   isActive: false,
    //   listPlaceholder: [],
    // },
    // {
    //   value: "guarantee",
    //   label: "Bảo lãnh",
    //   color: "#ED6665",
    //   isActive: false,
    //   listPlaceholder: [],
    // },
  ]);

  const [placeholder, setPlaceholder] = useState<any>(listApproach[0]);

  useEffect(() => {
    for (let i = 0; i < listApproach.length; i++) {
      const element = listApproach[i];
      if (element.value == placeholder.value) {
        setPlaceholder(element);
      }
    }
  }, [listApproach]);

  const getListplaceholderCustomer = async () => {
    const param = {};
    const response = await PlaceholderService.customer(param);

    if (response.code === 0) {
      const result = response.result.items;
      const newListplaceholderCustomer = result.map((item) => ({
        code: "{{" + item.name + "}}",
        name: item.title,
      }));

      setListApproach(
        listApproach.map((item) => ({
          ...item,
          listPlaceholder:
            item.value == "customer"
              ? newListplaceholderCustomer.map((item) => ({ value: item.code, label: item.name, code: item.code }))
              : item.listPlaceholder,
        }))
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const fetchPlaceholder = async () => {
    if (placeholder.value == "customer") {
      await getListplaceholderCustomer();
    }
    // else if (placeholder.value == "contact") {
    //   await getListplaceholderContact();
    // } else if (placeholder.value == "contract") {
    //   await getListplaceholderContract();
    // } else if (placeholder.value == "guarantee") {
    //   await getListplaceholderGuarantee();
    // }
  };

  return (
    <div className="page-content page-add-edit-email">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              if (customerIdList) {
                navigate(`/email_marketting`);
              }
              !isSubmit && onHide(true);
              !isSubmit && actionReset();
            }}
            className="title-first"
            title="Quay lại"
          >
            {type === "customer" ? "Khách hàng" : "EMAIL MARKETING"}
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
              <h1 className="title-last">{data ? "Chỉnh sửa Email" : "Gửi Email"}</h1>
            </Fragment>
          )}
        </div>
      </div>
      <div className="card-box">
        {!isLoadingData ? (
          <form className="form-send-email" onSubmit={(e) => onSubmit(e)}>
            <div className="wrapper-send-email">
              <div className="send-email--body">
                <div className="body-left">
                  {/* Tiêu đề nội dung */}
                  <div className="title-email">
                    <Input
                      type="text"
                      value={titleEmail}
                      fill={true}
                      required={true}
                      placeholder="Nhập tiêu đề email"
                      error={errorTitleEmail}
                      message="Tiêu đề không được để trống"
                      onChange={(e) => handleChangeValueTitleEmail(e)}
                      onBlur={(e) => handleChangeBlueTitleEmail(e)}
                    />
                  </div>
                  {/* danh sách code email */}
                  <div className="wrapper-code-email">
                    <div className="action-option">
                      <span
                        className="option-template"
                        onClick={() => {
                          setShowModalViewTemplateEmail(true);
                        }}
                      >
                        Chọn mẫu
                      </span>
                      <span
                        className="save-template"
                        onClick={() => {
                          saveTemplate(null);
                        }}
                      >
                        Lưu mẫu
                      </span>
                    </div>
                    {/* <div className="list-code-email">
                      {listCodeEmail.map((item, idx) => (
                        <span key={idx} className="name-code" onClick={() => handlePointerContent(item)}>
                          {item.name}
                        </span>
                      ))} </div> */}
                    <div className="code-email-select">
                      {/* <div className="left">
                        <SelectCustom
                          id="placeholderType"
                          name="placeholderType"
                          label="Chọn đối tượng"
                          options={listApproach}
                          fill={true}
                          value={placeholder.value}
                          onChange={(e) => {
                            setListApproach(listApproach.map((i) => ({ ...i, isActive: e.value === i.value ? true : false })));
                            setPlaceholder(e);
                          }}
                          placeholder={"Chọn đối tượng"}
                        />
                      </div> */}
                      <div className="right">
                        <SelectCustom
                          id="placeholder"
                          name="placeholder"
                          // label={"Chọn trường thông tin " + placeholder.label}
                          options={placeholder.listPlaceholder}
                          fill={true}
                          value={null}
                          onMenuOpen={() => fetchPlaceholder()}
                          onChange={(e) => handlePointerContent(e)}
                          placeholder={"Chọn trường thông tin " + placeholder.label}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Nội dung email gửi đi */}
                  <div className="form-group">
                    <RebornEditor
                      name="content"
                      fill={true}
                      initialValue={contentEmail ? contentEmail : ""}
                      dataText={dataCodeEmail}
                      onChangeContent={(e) => handleChangeContentEmail(e)}
                    />
                  </div>

                  {/* <div className="attachments">
                    <label className="title-attachment">Tải tài liệu</label>
                    <div className={listAttactment.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                      {listAttactment.length === 0 ? (
                        <label htmlFor="imageUpload" className="action-upload-image">
                          <div className="wrapper-upload">
                            <Icon name="Upload" />
                            Tải tài liệu lên
                          </div>
                        </label>
                      ) : (
                        <Fragment>
                          <div className="d-flex align-items-center">
                            {listAttactment.map((item, idx) => (
                              <div key={idx} className="image-item">
                                <img
                                  src={item.type == "xlsx" ? ImgExcel : item.type === "docx" ? ImgWord : item.type === "pptx" ? ImgPowerpoint : item.url}
                                  alt="image-warranty"
                                />
                                <span className="icon-delete" onClick={() => handleRemoveImageItem(idx)}>
                                  <Icon name="Trash" />
                                </span>
                              </div>
                            ))}
                            <label htmlFor="imageUpload" className="add-image">
                              <Icon name="PlusCircleFill" />
                            </label>
                          </div>
                        </Fragment>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
                      className="d-none"
                      id="imageUpload"
                      onChange={(e) => handleUploadDocument(e)}
                    />
                  </div> */}

                  {/* <div className="box_template">
                    <div className="box__update--attachment">
                        <div className={`is__loading--file ${isLoadingFile ? '' : 'd-none'}`}>
                            <Icon name="Refresh" />
                            <span className="name-loading">Đang tải...{showProgress}%</span>
                        </div>
                        <div className={isLoadingFile ? 'd-none' : ''}>
                          <AddFile
                              takeFileAdd={takeFileAdd}
                              infoFile={infoFile}
                              setInfoFile={setInfoFile}
                              // setIsLoadingFile={setIsLoadingFile}
                              // dataAttachment={data}
                          />
                        </div>
                    </div>
                  </div> */}
                  {/* Theo dõi đọc email */}
                  <div className="memo">
                    <Checkbox checked={isCheckTrackEmail} label="Theo dõi đọc email" onChange={(e) => handleChangeValueMemo(e.target.checked)} />
                  </div>
                  {/* Chọn hình thức gửi email, ngẫu nhiên hay chỉ định */}
                  <div className="choose-to--send">
                    <Checkbox defaultChecked label="Chọn email gửi đi" onChange={(e) => handleChangeValueChooseSend(e.target.checked)} />

                    {isChooseSend && listSourceEmail && listSourceEmail.length > 0 && (
                      <div className="list-choose">
                        <div className="choose-item-header">
                          <Checkbox label="Chọn tất cả" checked={isAll} onChange={(e) => handleChangeCheckAllSourceEmail(e.target.checked)} />
                        </div>
                        <CustomScrollbar width="100%" height="9rem">
                          <div className="list-source-email">
                            {listSourceEmail.map((item, idx) => {
                              const isChecked = listIdSourceEmail.some((id) => id === item.value) ? true : false;
                              return (
                                <Checkbox
                                  key={idx}
                                  checked={isChecked}
                                  onChange={(e) => handleChangeCheckOneSourceEmail(+item.value, e.target.checked)}
                                  label={item.label}
                                />
                              );
                            })}
                          </div>
                        </CustomScrollbar>
                        <div className="choose-item-footer">
                          <Checkbox label="Chọn ngẫu nhiên" checked={isRandom} onChange={(e) => handleChangeCheckRandomChoose(e.target.checked)} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="body-right">
                  <div className="info-option">
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

                                    {/* Lựa chọn theo lượt tải */}
                                    <div className="form-group">
                                      <SelectCustom
                                        id="upload"
                                        name="upload"
                                        label="Và Lượt upload"
                                        options={[]}
                                        fill={true}
                                        placeholder="Chọn lượt upload"
                                        isMulti={true}
                                        value={valueUpload}
                                        onChange={(item) => handleChangeValueUpload(item)}
                                        isAsyncPaginate={true}
                                        additional={{
                                          page: 1,
                                        }}
                                        loadOptionsPaginate={loadOptionUpload}
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
                                        {!item.avatar ? (
                                          <Image src={item.gender == 2 ? AvatarMale : AvatarFemale} alt={item.name} />
                                        ) : (
                                          <Image src={item.avatar} alt={item.name} />
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
                        <div className="setup-email">
                          <h3>Thời gian gửi</h3>
                          {listFieldSetupEmail.map((field, index) => (
                            <FieldCustomize
                              field={field}
                              key={index}
                              handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldSetupEmail, setFormData)}
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

        <AddCustomerSendModal
          onShow={showModalAddCustomer}
          onHide={() => setShowModalAddCustomer(false)}
          type={formData?.values?.receiverType}
          callBack={handleTakeDataCustomer}
          listIdCustomer={listIdCustomer}
          lstCustomer={filterUser}
        />

        <AddTemplateEmailModal
          onShow={showModalAddTemplateEmail}
          onHide={() => setShowModalAddTemplateEmail(false)}
          //contentDelta -> Chưa lưu
          data={{ id: 0, title: titleEmail, content: contentEmail, type: 1, tcyId: 0 } as any}
        />

        <ViewTemplateEmailModal
          onShow={showModalViewTemplateEmail}
          onHide={(reload) => {
            setShowModalViewTemplateEmail(false);
          }}
          callback={loadTemplateEmail}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}
