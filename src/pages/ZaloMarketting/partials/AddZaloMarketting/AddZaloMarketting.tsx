import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import { ModalFooter } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { useOnClickOutside } from "utils/hookCustom";
import { FILE_IMAGE_MAX } from "utils/constant";
import { showToast } from "utils/common";
import Radio from "components/radio/radio";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ICustomerFilterRequest, IListByIdFilterRequest } from "model/customer/CustomerRequestModel";
import CustomerService from "services/CustomerService";
import { IEstimateRequestModel } from "model/estimate/EstimateRequestModel";
import EstimateService from "services/EstimateService";
import CustomerGroupService from "services/CustomerGroupService";
import CustomerSourceService from "services/CustomerSourceService";
import CareerService from "services/CareerService";
import RelationShipService from "services/RelationShipService";
import { ICareerFilterRequest } from "model/career/CareerRequest";
import { ICustomerGroupFilterRequest } from "model/customerGroup/CustomerGroupRequestModel";
import { ICustomerSourceFilterRequest } from "model/customerSource/CustomerSourceRequest";
import { IRelationShipFilterRequest } from "model/relationShip/RelationShipRequest";
import NummericInput from "components/input/numericInput";
import Image from "components/image";
import AvatarFemale from "assets/images/avatar-female.jpg";
import AvatarMale from "assets/images/avatar-male.jpg";
import FileService from "services/FileService";

import "./AddZaloMarketting.scss";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { handleChangeValidate } from "utils/validate";
import RepeatTime from "pages/Common/RepeatTime";
import PreviewTemplateZalo from "components/previewTemplateZalo/previewTemplateZalo";

export interface IAddZaloMarkettingProps {
  onShow: boolean;
  idSendZalo: number;
  data?: any;
  onHide: (reload: boolean) => void;
  onBackProps: () => void;
  listIdCustomerProps?: number[];
  paramCustomerProps?: any;
  customerIdList?: any;
}

interface IFilterUser {
  id: number;
  avatar: string;
  name: string;
  gender: number;
}

export default function AddZaloMarketting(props: IAddZaloMarkettingProps) {
  const { onShow, onHide, onBackProps, idSendZalo, listIdCustomerProps, paramCustomerProps, data, customerIdList } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState(null);

  const [idxTable, setIdxTable] = useState<number>(null);
  const [idxButton, setIdxButton] = useState<number>(null);

  const [idChange, setIdChange] = useState<string>("");
  const [customTemplateZalo, setCustomTemplateZalo] = useState([]);
  const [isChooseContent, setIsChooseContent] = useState<boolean>(false);

  const refInputUpload = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  const [valueTypeButton, setValueTypeButton] = useState(null);

  const textareaRef = useRef(null);

  const refOption = useRef();
  const refOptionContainer = useRef();

  const refAction = useRef();
  const refActionTable = useRef();
  const refActionButton = useRef();
  const refActionContainer = useRef();

  useOnClickOutside(refOption, () => setIsChooseContent(false), ["action__choose", "active__choose"]);
  useOnClickOutside(refAction, () => setIdChange(""), ["content__header", "content__text", "box__ui--banner", "box__ui--table", "box__ui--button"]);
  useOnClickOutside(refActionTable, () => setIdxTable(null), ["box__ui--table"]);
  useOnClickOutside(refActionButton, () => setIdxButton(null), ["box__ui--button"]);

  const lstOptionContent = [
    {
      type: "banner",
      image_url: "",
    },
    {
      type: "header",
      align: "left",
      content: "",
    },
    {
      type: "table",
      content: [
        {
          key: "",
          value: "",
        },
      ],
    },
    {
      type: "text",
      align: "left",
      content: "",
    },
    {
      type: "buttons",
      content: [
        {
          title: "",
          type: "",
          image_icon: "",
        },
      ],
    },
  ];

  const lstTypeButtons = [
    {
      label: "open url",
      value: "oa.open.url",
      payload: {
        url: "",
      },
    },
    {
      label: "open sms",
      value: "oa.open.sms",
      payload: {
        content: "",
        phone_code: "",
      },
    },
    {
      label: "open phone",
      value: "oa.open.phone",
      payload: {
        phone_code: "",
      },
    },
  ];

  const values = useMemo(
    () =>
      ({
        title: "",
        content: "",
        templateId: null,
        receiverType: "1",
        receiverCriteria: "[]",
        limit: "",
        timeType: "1",
        timeAt: "",
      } as any),
    [onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // biến này tạo ra với mục đích lấy sách người dùng
  const [listCustomer, setListCustomer] = useState<ICustomerResponse[]>([]);

  // Lấy ra danh sách id người dùng từ props chuyền sang
  const [listIdCustomer, setListIdCustomer] = useState(listIdCustomerProps || []);

  //! đoạn này xử lý Call API Customer nhận params từ localStorage để mapping
  const getListCustomer = async () => {
    const param: ICustomerFilterRequest = {
      page: paramCustomerProps?.page ?? 1,
      limit: paramCustomerProps?.limit ?? 10,
    };

    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const result = response.result.items;
      setListCustomer(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow && listIdCustomer.length > 0 && formData?.values?.receiverType == 3) {
      getListCustomer();
    }
  }, [listIdCustomer, onShow]);

  // biến này tạo ra với mục đích ẩn hiện tiêu chí
  const [optionOne, setOptionOne] = useState<boolean>(false);
  const [optionTwo, setOptionTwo] = useState<boolean>(false);
  const [optionThree, setOptionThree] = useState<boolean>(false);

  //! biến này tạo ra với mục đích check xem có phân trang hay không
  const [isLoadMoreAble, setIsLoadMoreAble] = useState<boolean>(false);
  const [pageCustomer, setPageCustomer] = useState<number>(1);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  //! biến này tạo ra với mục đích validate số khách hàng tối đa muốn gửi
  const [isLimitCustomer, setIsLimitCustomer] = useState<boolean>(false);

  //! biến này tạo ra với mục đích lấy ước lượng tổng số khách hàng muốn gửi
  const [totalEstimate, setTotalEstimate] = useState<number>(null);

  //! validate theo tiêu chí giới hạn số lượng gửi tối đa email cho khách hàng
  const [checkFieldQtyCustomer, setCheckFieldQtyCustomer] = useState<boolean>(false);

  //? biến này tạo ra với mục đích hiển thị người dùng thỏa mã đk cho trước
  const [filterUser, setFilterUser] = useState<IFilterUser[]>([]);

  const [showModalAddCustomer, setShowModalAddCustomer] = useState<boolean>(false);

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

  //* Value nhóm khách hàng
  const [valueCgp, setValueCgp] = useState([]);
  //? Đoạn này xử lý lấy nguồn khách hàng
  const [valueSource, setValueSource] = useState([]);
  //? Đoạn này xử lý lấy ngành nghề khách hàng
  const [valueCareer, setValueCareer] = useState([]);
  //? Đoạn này xử lý lấy mối quan hệ khách hàng
  const [valueRelationship, setValueRelationship] = useState([]);

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
                onChange: (e) => handleChageValueTimeAt(e),
                placeholder: "Chọn thời gian gửi mong muốn",
                isMinDate: true,
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
  }, [listIdCustomer, formData.values.receiverType]);

  const handClickOption = (e, item) => {
    e.preventDefault();
    setIsChooseContent(false);

    const newDataItem = {
      id: uuidv4(),
      ...item,
    };

    setCustomTemplateZalo([...customTemplateZalo, newDataItem]);
  };

  //TODO: change value header
  const handleChangeValueHeader = (e, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: value,
          };
        }

        return item;
      })
    );
  };

  //TODO: change value text
  const handleChangeValueText = (e, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: value,
          };
        }

        return item;
      })
    );
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [textareaRef.current?.value]);

  //TODO: change value key table
  const handleChangeValueKeyTable = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  key: value,
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

  //TODO: change value table
  const handleChangeValueTable = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  value: value,
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

  //TODO: add item table
  const handleAddItemTable = (id) => {
    setCustomTemplateZalo((prev) =>
      prev.map((ol) => {
        if (ol.id === id) {
          return {
            ...ol,
            content: [
              ...ol.content,
              {
                key: "",
                value: "",
              },
            ],
          };
        }

        return ol;
      })
    );
  };

  //TODO: delete item table
  const handleRemoveItemTable = (idx, id) => {
    const newData = [...customTemplateZalo].find((ol) => ol.id === id).content;

    if (newData.length > 1) {
      newData.splice(idx, 1);

      setCustomTemplateZalo((prev) =>
        prev.map((el) => {
          if (el.id === id) {
            return {
              ...el,
              content: newData,
            };
          }
          return el;
        })
      );
    } else {
      const cloneData = [...customTemplateZalo].filter((el) => el.id !== id);
      setCustomTemplateZalo(cloneData);
    }
  };

  //TODO: change value banner
  const handleChangeValueBanner = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files[0].size > FILE_IMAGE_MAX) {
        showToast(`Ảnh tải lên giới hạn dung lượng không quá ${FILE_IMAGE_MAX / 1024 / 1024}MB`, "warning");
        e.target.value = "";
      } else {
        setFile(e.target.files[0]);

        e.target.value = null;
      }
    }
  };

  //? Start logic đoạn kéo thả ảnh
  function handleDragStart(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e, id) {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const newFiles = [];
    const droppedFiles: any = Array.from(e.dataTransfer.files);

    droppedFiles.forEach((file) => {
      const checkFile = file?.name.split("?")[0].split("#")[0].split(".").pop();

      if (checkFile !== "jpg" && checkFile !== "png") {
        showToast("File không đúng định dạng. Vui lòng kiểm tra lại !", "warning");
        return;
      }

      if (!newFiles.find((f) => f.name === file.name)) {
        newFiles.push(file);
      }
    });

    setFile(newFiles[newFiles.length - 1]);
    setIdChange(id);
  }
  //? End logic đoạn kéo thả ảnh

  const uploadSuccess = (data) => {
    setIsLoadingFile(true);
    const result = data?.fileUrl;

    setTimeout(() => {
      setIsLoadingFile(false);
    }, 800);

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === idChange) {
          return {
            ...item,
            image_url: result,
          };
        }

        return item;
      })
    );
  };

  const uploadError = () => {
    showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const handUploadFile = async (file) => {
    if (!file) return;
    await FileService.uploadFile({ data: file, onSuccess: uploadSuccess, onError: uploadError });
  };

  useEffect(() => {
    if (file) {
      handUploadFile(file);
    }
  }, [file]);

  //TODO: delete item banner
  const handleRemoveItemBanner = (id) => {
    const newData = [...customTemplateZalo].filter((item) => item.id !== id);
    setCustomTemplateZalo(newData);
  };

  //TODO: change value title button
  const handleChangeValueButton = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  title: value,
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

  //TODO: change value type button
  const handleChangeTypeButton = (e, idx, id) => {
    const value = e;

    if (value.value === "oa.open.url") {
      setValueTypeButton({ ...valueTypeButton, url: value });
    } else if (value.value === "oa.open.sms") {
      setValueTypeButton({ ...valueTypeButton, sms: value });
    } else {
      setValueTypeButton({ ...valueTypeButton, phone: value });
    }

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  type: value.value,
                  payload: value.payload,
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

  //TODO: change value url button
  const handleChangeUrlButton = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  payload: { url: value },
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

  //TODO: change value content sms button
  const handleChangeContentButton = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  payload: { ...el.payload, content: value },
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

  //TODO: change value phone button
  const handleChangePhoneSmsButton = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  payload: { ...el.payload, phone_code: value },
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

  //TODO: change value phone button
  const handleChangePhoneButton = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  payload: { phone_code: value },
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

  //TODO: add item button
  const handleAddItemButton = (id) => {
    setCustomTemplateZalo((prev) =>
      prev.map((ol) => {
        if (ol.id === id) {
          return {
            ...ol,
            content: [
              ...ol.content,
              {
                title: "",
                type: "",
                payload: "",
                image_icon: "",
              },
            ],
          };
        }

        return ol;
      })
    );
  };

  //TODO: delete item button
  const handleRemoveItemButton = (idx, id) => {
    const newData = [...customTemplateZalo].find((ol) => ol.id === id).content;

    if (newData.length > 1) {
      newData.splice(idx, 1);

      setCustomTemplateZalo((prev) =>
        prev.map((el) => {
          if (el.id === id) {
            return {
              ...el,
              content: newData,
            };
          }
          return el;
        })
      );
    } else {
      const cloneData = [...customTemplateZalo].filter((el) => el.id !== id);
      setCustomTemplateZalo(cloneData);
    }
  };

  const handFormatAlignText = (id, align) => {
    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            align: align,
          };
        }

        return item;
      })
    );
  };

  const handleRemoveItemUI = (id) => {
    const newData = [...customTemplateZalo].filter((el) => el.id !== id);
    setCustomTemplateZalo(newData);
  };

  const RenderActionUI = (item) => {
    return (
      <div className="action__common" ref={refAction}>
        <Tippy content="Căn trái">
          <div
            className={`action__common--align--left ${item.item.align === "left" ? "active__align--left" : ""}`}
            onClick={() => handFormatAlignText(item.item.id, "left")}
          >
            <Icon name="AlignLeft" />
          </div>
        </Tippy>
        <Tippy content="Căn giữa">
          <div
            className={`action__common--align--center ${item.item.align === "center" ? "active__align--center" : ""}`}
            onClick={() => handFormatAlignText(item.item.id, "center")}
          >
            <Icon name="AlignCenter" />
          </div>
        </Tippy>
        <Tippy content="Căn phải">
          <div
            className={`action__common--align--right ${item.item.align === "right" ? "active__align--right" : ""}`}
            onClick={() => handFormatAlignText(item.item.id, "right")}
          >
            <Icon name="AlignRight" />
          </div>
        </Tippy>
        <Tippy content="Xóa">
          <div className="action__common--delete" onClick={() => handleRemoveItemUI(item.item.id)}>
            <Icon name="Trash" />
          </div>
        </Tippy>
      </div>
    );
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
              // quay lại
            },
          },
          {
            title: idSendZalo ? "Chỉnh sửa" : "Gửi",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit]
  );

  const validations: IValidation[] = [];

  const handleRepeatTime = (data) => {
    //
  };

  return (
    <div className="page-content page__add-zalo--marketting">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              !isSubmit && onHide(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Zalo marketting
          </h1>
          {onShow && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  !isSubmit && onBackProps();
                }}
              />
              <h1 className="title-last">{dataDetail ? "Chỉnh sửa Zalo marketting" : "Gửi Zalo marketting"}</h1>
            </Fragment>
          )}
        </div>
      </div>
      <div className="card-box">
        <form className="form__send-zalo--marketting">
          <div className="send__zalo--marketting">
            <div className="content__send--zalo">
              <div className="content__left">
                {/* Tiêu đề nội dung */}
                <div className="title-email">
                  <Input
                    type="text"
                    value={formData?.values.title}
                    fill={true}
                    required={true}
                    placeholder="Nhập tiêu đề zalo"
                    error={false}
                    message="Tiêu đề không được để trống"
                    onChange={(e) => setFormData({ ...formData, values: { ...formData.values, title: e.target.value } })}
                  />
                </div>
                {/* Thêm khối nội dung */}
                <div className="choose__box--content">
                  <div
                    className={`action__choose ${isChooseContent ? "active__choose" : ""}`}
                    ref={refOptionContainer}
                    onClick={() => setIsChooseContent(!isChooseContent)}
                  >
                    <Icon name="PlusCircleFill" />
                    Thêm khối nội dung
                  </div>

                  {isChooseContent && (
                    <div className="list__option" ref={refOption}>
                      <ul className="menu__option">
                        {lstOptionContent.map((item, idx) => {
                          const isButton = customTemplateZalo.filter((el) => el.type === "buttons").length > 0;
                          const isText = customTemplateZalo.filter((el) => el.type === "text").length >= 2;

                          return (
                            <li key={idx} className={`item-option`}>
                              {(isButton && item.type === "buttons") || (isText && item.type === "text") ? (
                                <span className="dis__item--option">{item.type}</span>
                              ) : (
                                <span
                                  className="choose-item"
                                  onClick={(e) => {
                                    handClickOption(e, item);
                                  }}
                                >
                                  {item.type}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {customTemplateZalo && customTemplateZalo.length > 0 && (
                    <div className="render__ui--choose">
                      {customTemplateZalo.map((item, idx) => {
                        return (
                          <div key={idx} className="item__render--choose">
                            {item.type === "banner" ? (
                              <div
                                className={`box--ui box__ui--banner ${item.id === idChange ? "active--ui active__ui--banner" : ""}`}
                                onClick={() => setIdChange(item.id)}
                                ref={refActionContainer}
                              >
                                <div className="box__upload--file" ref={refAction}>
                                  <div
                                    className={`support__upload--file ${dragging ? "dragging" : ""}`}
                                    draggable="true"
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, item.id)}
                                    onDragStart={handleDragStart}
                                  >
                                    {!isLoadingFile && !item.image_url ? (
                                      <div className="action-operation">
                                        <div className="action-content">
                                          <Icon name="CloudUpload" />
                                          <h3>Kéo và thả tệp tại đây</h3>
                                        </div>
                                        <span>Hoặc</span>
                                        <div className="btn-upload--file">
                                          <label htmlFor={item.id}>Chọn tập tin</label>
                                          <input
                                            type="file"
                                            accept="image/png,image/jpg"
                                            className="d-none"
                                            id={item.id}
                                            ref={refInputUpload}
                                            onChange={(e) => handleChangeValueBanner(e)}
                                          />
                                        </div>
                                      </div>
                                    ) : isLoadingFile && item.id === idChange ? (
                                      <div className="is__loading--file">
                                        <Icon name="Refresh" />
                                        <span className="name-loading">Đang tải...</span>
                                      </div>
                                    ) : item.image_url ? (
                                      <div className="show-file-upload">
                                        <img src={item.image_url} alt="img__banner" />
                                      </div>
                                    ) : (
                                      <div className="action-operation">
                                        <div className="action-content">
                                          <Icon name="CloudUpload" />
                                          <h3>Kéo và thả tệp tại đây</h3>
                                        </div>
                                        <span>Hoặc</span>
                                        <div className="btn-upload--file">
                                          <label htmlFor={item.id}>Chọn tập tin</label>
                                          <input
                                            type="file"
                                            accept="image/png,image/jpg"
                                            className="d-none"
                                            id={item.id}
                                            ref={refInputUpload}
                                            onChange={(e) => handleChangeValueBanner(e)}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {item.id === idChange && (
                                  <div className="action__common action__banner">
                                    {item.image_url && (
                                      <Tippy content="Chỉnh sửa">
                                        <div className="action__banner--edit" onClick={() => refInputUpload.current?.click()}>
                                          <Icon name="Pencil" />
                                        </div>
                                      </Tippy>
                                    )}
                                    <Tippy content="Xóa">
                                      <div className="action__banner--delete" onClick={() => handleRemoveItemBanner(item.id)}>
                                        <Icon name="Trash" />
                                      </div>
                                    </Tippy>
                                    <input
                                      type="file"
                                      accept="image/png,image/jpg"
                                      className="d-none"
                                      id={item.id}
                                      ref={refInputUpload}
                                      onChange={(e) => handleChangeValueBanner(e)}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : item.type === "header" ? (
                              <div
                                className={`box--ui box__ui--header ${item.id === idChange ? "active--ui active__ui--header" : ""}`}
                                onClick={() => setIdChange(item.id)}
                              >
                                <div className="content__header" ref={refActionContainer}>
                                  <div className="change-content">
                                    <input
                                      type="text"
                                      value={item.content}
                                      maxLength={100}
                                      placeholder="Thay đổi nội dung header ở đây"
                                      onChange={(e) => handleChangeValueHeader(e, item.id)}
                                      style={{ textAlign: item.align }}
                                    />
                                  </div>
                                  {item.id === idChange && <RenderActionUI item={item} />}
                                </div>
                              </div>
                            ) : item.type === "table" ? (
                              <div
                                className={`box--ui box__ui--table ${item.id === idChange ? "active--ui active__ui--table" : ""}`}
                                onClick={() => setIdChange(item.id)}
                                ref={refActionContainer}
                              >
                                {item.content.map((el, index) => {
                                  return (
                                    <div key={index} className="item-table" ref={refAction}>
                                      <div className="content__key--value" onClick={() => setIdxTable(index)}>
                                        <div className="key">
                                          <input
                                            type="text"
                                            value={el.key}
                                            maxLength={25}
                                            placeholder="Từ khóa"
                                            onChange={(e) => handleChangeValueKeyTable(e, index, item.id)}
                                          />
                                        </div>
                                        <div className="value">
                                          <input
                                            type="text"
                                            value={el.value}
                                            maxLength={100}
                                            placeholder="Giá trị"
                                            onChange={(e) => handleChangeValueTable(e, index, item.id)}
                                          />
                                        </div>
                                      </div>

                                      {index === idxTable && (
                                        <div className="action__common action__table" ref={refActionTable}>
                                          {item.content.length < 5 && (
                                            <Tippy content="Thêm">
                                              <div className="action__table--item action__table--add" onClick={() => handleAddItemTable(item.id)}>
                                                <Icon name="PlusCircleFill" />
                                              </div>
                                            </Tippy>
                                          )}
                                          <Tippy content="Xóa">
                                            <div
                                              className="action__table--item action__table--delete"
                                              onClick={() => handleRemoveItemTable(index, item.id)}
                                            >
                                              <Icon name="Trash" />
                                            </div>
                                          </Tippy>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : item.type === "text" ? (
                              <div
                                className={`box--ui box__ui--text ${item.id === idChange ? "active--ui active__ui--text" : ""}`}
                                onClick={() => setIdChange(item.id)}
                              >
                                <div className="content__text" ref={refActionContainer}>
                                  <div className="change-content">
                                    <textarea
                                      rows={2}
                                      value={item.content}
                                      maxLength={1000}
                                      ref={textareaRef}
                                      placeholder="Thay đổi nội dung ở đây"
                                      onChange={(e) => handleChangeValueText(e, item.id)}
                                      style={{ textAlign: item.align }}
                                    />
                                  </div>
                                  {item.id === idChange && <RenderActionUI item={item} />}
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`box--ui box__ui--button ${item.id === idChange ? "active--ui active__ui--button" : ""}`}
                                onClick={() => setIdChange(item.id)}
                                ref={refActionContainer}
                              >
                                {item.content.map((el, index) => {
                                  const lstOption = lstTypeButtons.filter((ol) => !item.content.some((v) => v.type === ol.value));

                                  return (
                                    <div key={index} className="item-button" ref={refAction}>
                                      <div className="content__button--value" onClick={() => setIdxButton(index)}>
                                        <div className="value__title">
                                          <div className="title-button">
                                            <input
                                              type="text"
                                              value={el.title}
                                              maxLength={35}
                                              placeholder="Tiêu đề buttons"
                                              onChange={(e) => handleChangeValueButton(e, index, item.id)}
                                            />
                                          </div>
                                          <div className="icon__default--button">
                                            <Icon name="ChevronRight" />
                                          </div>
                                        </div>
                                        <div className="value__type">
                                          <div className="choose__type--button">
                                            <SelectCustom
                                              name="type_button"
                                              value={
                                                el.type
                                                  ? el.type === "oa.open.url"
                                                    ? valueTypeButton?.url
                                                    : el.type === "oa.open.sms"
                                                    ? valueTypeButton?.sms
                                                    : valueTypeButton?.phone
                                                  : ""
                                              }
                                              options={lstOption}
                                              special={true}
                                              placeholder="Chọn loại button"
                                              onChange={(e) => handleChangeTypeButton(e, index, item.id)}
                                            />
                                          </div>

                                          {el.type &&
                                            (el.type === "oa.open.url" ? (
                                              <div className="type__item  type__url">
                                                <input
                                                  type="text"
                                                  value={el.payload.url}
                                                  placeholder="https://example.com"
                                                  onChange={(e) => handleChangeUrlButton(e, index, item.id)}
                                                />
                                              </div>
                                            ) : el.type === "oa.open.sms" ? (
                                              <div className="type__item type__sms">
                                                <div className="phone-sms">
                                                  <input
                                                    type="phone"
                                                    value={el.payload.phone_code}
                                                    placeholder="Nhập số điện thoại"
                                                    onChange={(e) => handleChangePhoneSmsButton(e, index, item.id)}
                                                  />
                                                </div>
                                                <div className="content-sms">
                                                  <input
                                                    type="text"
                                                    value={el.payload.content}
                                                    placeholder="Nhập nội dung thoại"
                                                    onChange={(e) => handleChangeContentButton(e, index, item.id)}
                                                  />
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="type__item type__phone">
                                                <input
                                                  type="phone"
                                                  value={el.payload.phone_code}
                                                  placeholder="Nhập số điện thoại"
                                                  onChange={(e) => handleChangePhoneButton(e, index, item.id)}
                                                />
                                              </div>
                                            ))}
                                        </div>
                                      </div>

                                      {index === idxButton && (
                                        <div className="action__common action__button" ref={refActionButton}>
                                          {item.content.length < 3 && (
                                            <Tippy content="Thêm">
                                              <div
                                                className="action__button--item action__button--add"
                                                onClick={() => {
                                                  handleAddItemButton(item.id);
                                                  setIdxButton((prev) => prev + 1);
                                                }}
                                              >
                                                <Icon name="PlusCircleFill" />
                                              </div>
                                            </Tippy>
                                          )}
                                          <Tippy content="Xóa">
                                            <div
                                              className="action__button--item action__button--delete"
                                              onClick={() => {
                                                handleRemoveItemButton(index, item.id);
                                                setIdxButton((prev) => prev - 1);
                                              }}
                                            >
                                              <Icon name="Trash" />
                                            </div>
                                          </Tippy>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="content__right">
                <div className="preview__template--zalo">
                  <h3 className="title_idx">Xem trước mẫu</h3>
                  {customTemplateZalo && customTemplateZalo.length > 0 && (
                    // <div className="box__preview">
                    //   {customTemplateZalo.map((item, idx) => {
                    //     return (
                    //       <div key={idx} className="item__preview">
                    //         {item.type === "banner" ? (
                    //           <div className="item__banner">{item.image_url ? <img src={item.image_url} alt="banner-zalo" /> : ""}</div>
                    //         ) : item.type === "header" ? (
                    //           <h3 className="title-zalo" style={{ textAlign: `${item.align}` } as any}>
                    //             {item.content}
                    //           </h3>
                    //         ) : item.type === "table" ? (
                    //           item.content.map((el, index) => {
                    //             return (
                    //               <div key={index} className="item__table">
                    //                 <h4 className="key">{el.key}</h4>
                    //                 <h4 className="value">{el.value}</h4>
                    //               </div>
                    //             );
                    //           })
                    //         ) : item.type === "text" ? (
                    //           <p className="item__content" style={{ textAlign: `${item.align}` } as any}>
                    //             {item.content}
                    //           </p>
                    //         ) : (
                    //           item.content.map((ol, ilx) => {
                    //             return (
                    //               <div key={ilx} className={ol.title ? "item__buttons" : "d-none"}>
                    //                 <h4 className="name-buttons">{ol.title}</h4>
                    //                 <Icon name="ChevronRight" />
                    //               </div>
                    //             );
                    //           })
                    //         )}
                    //       </div>
                    //     );
                    //   })}
                    // </div>
                    <PreviewTemplateZalo
                      dataTemplateZalo = {customTemplateZalo}
                    />
                  )}
                </div>

                <div className="custom-criteria">
                  <h3>Người nhận</h3>
                  <div className="list-form-group">
                    {/* Lựa chọn tiêu chí 1 */}
                    <div className="option-item">
                      <div className="form-group">
                        <Radio value="1" label="Gửi cho tất cả khách hàng" onChange={(e) => handleChangeValueAllCustomer(e)} checked={optionOne} />
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
                        <Radio value="2" label="Tùy chỉnh tiêu chí" onChange={(e) => handleChangeValueCustomCriteria(e)} checked={optionTwo} />
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
                    {/* Lựa chọn tiêu chí 3 */}
                    <div className="option-item">
                      <div className="form-group">
                        <Radio value="3" label="Theo khách hàng cụ thể" onChange={(e) => handleChangeValueSpecificObject(e)} checked={optionThree} />
                      </div>

                      {formData?.values?.receiverType === "3" && (
                        <div className={`list-customer ${checkFieldQtyCustomer ? "has__error--customer" : ""}`}>
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
                                    {item.avatar === "" ? (
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
                        </div>
                      )}
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

                      {formData?.values?.timeType === "3" && <RepeatTime callback={(data) => handleRepeatTime(data)} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ModalFooter actions={actions} />
          </div>
        </form>
      </div>
    </div>
  );
}
