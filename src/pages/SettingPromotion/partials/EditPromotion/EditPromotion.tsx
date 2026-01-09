import Icon from "components/icon";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import "./EditPromotion.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import Input from "components/input/input";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import RadioList from "components/radio/radioList";
import Radio from "components/radio/radio";
import Button from "components/button/button";
import Checkbox from "components/checkbox/checkbox";
import ChooseProductModal from "../ChooseProductModal/ChooseProductModal";
import NummericInput from "components/input/numericInput";
import { ICareerFilterRequest } from "model/career/CareerRequest";
import CustomerGroupService from "services/CustomerGroupService";
import { ICustomerGroupFilterRequest } from "model/customerGroup/CustomerGroupRequestModel";
import CareerService from "services/CareerService";
import { ICustomerSourceFilterRequest } from "model/customerSource/CustomerSourceRequest";
import CustomerSourceService from "services/CustomerSourceService";
import { IRelationShipFilterRequest } from "model/relationShip/RelationShipRequest";
import RelationShipService from "services/RelationShipService";
import CustomerService from "services/CustomerService";
import { IContentDialog } from "components/dialog/dialog";
import AvatarFemale from "assets/images/avatar-female.jpg";
import AvatarMale from "assets/images/avatar-male.jpg";
import Image from "components/image";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IFieldCustomize, IValidation } from "model/FormModel";
import { handleChangeValidate } from "utils/validate";
import RepeatTime from "pages/Common/RepeatTime";
import AddCustomerSendModal from "pages/Common/AddCustomerSendModal/AddCustomerSendModal";
import Badge from "components/badge/badge";
import moment from "moment";
import { formatCurrency } from "utils/common";

interface IFilterUser {
  id: number;
  avatar: string;
  name: string;
  gender: number;
}

export default function EditPromotion(props: any) {
  const { showEditPrm, setShowEditPrm, data } = props;
  console.log("data edit prm", data);
  document.title = "Thêm mới khuyến mãi";

  const [type, setType] = useState<string>("add");

  const [dataContractEform, setDataContractEform] = useState(null);
  const [showModalAddProduct, setShowModalAddProduct] = useState<boolean>(false);

  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isSettingEform, setIsSettingEform] = useState<boolean>(false);

  const [listCondition, setListCondition] = useState<any[]>([
    {
      type: "1",
      value: "1",
      condition: "1",
      listProduct: [
        {
          id: 1,
          name: "Sản phẩm 1",
          value: "1",
          unit: [
            {
              id: 1,
              name: "Hộp",
              value: "1",
            },
            {
              id: 2,
              name: "Cái",
              value: "2",
            },
          ],
        },
      ],
    },
  ]);

  const handleAddCondition = () => {
    setListCondition([
      ...listCondition,
      {
        type: "1",
        value: "1",
        condition: "1",
        listProduct: [
          {
            id: 1,
            name: "Sản phẩm 1",
            value: "1",
          },
        ],
      },
    ]);
  };

  const handleAddProduct = (idx: number) => {
    setListCondition(
      listCondition.map((item, index) => {
        if (index === idx) {
          return {
            ...item,
            listProduct: [
              ...item.listProduct,
              {
                id: 1,
                name: "Sản phẩm 1",
                value: "1",
              },
            ],
          };
        }
        return item;
      })
    );
  };

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Quay lại",
        callback: () => {
          setShowEditPrm(false);
        },
      },
    ],
  };

  const [isFinishTime, setIsFinishTime] = useState<boolean>(false);

  //! đoạn này mình xử lý theo lựa chọn tiêu chí người nhận

  // biến này tạo ra với mục đích ẩn hiện tiêu chí
  const [optionOne, setOptionOne] = useState<boolean>(false);
  const [optionTwo, setOptionTwo] = useState<boolean>(false);
  const [optionThree, setOptionThree] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({ values: {} });

  //! biến này tạo ra với mục đích validate số khách hàng tối đa muốn gửi
  const [isLimitCustomer, setIsLimitCustomer] = useState<boolean>(false);

  //* Value nhóm khách hàng
  const [valueCgp, setValueCgp] = useState([]);

  //! biến này tạo ra với mục đích lấy ước lượng tổng số khách hàng muốn gửi
  const [totalEstimate, setTotalEstimate] = useState<number>(null);

  //? Đoạn này xử lý lấy ngành nghề khách hàng
  const [valueCareer, setValueCareer] = useState([]);

  //? Đoạn này xử lý lấy nguồn khách hàng
  const [valueSource, setValueSource] = useState([]);

  //! validate theo tiêu chí giới hạn số lượng gửi tối đa email cho khách hàng
  const [checkFieldQtyCustomer, setCheckFieldQtyCustomer] = useState<boolean>(false);

  //! biến này tạo ra với mục đích check xem có phân trang hay không
  const [isLoadMoreAble, setIsLoadMoreAble] = useState<boolean>(false);
  const [pageCustomer, setPageCustomer] = useState<number>(1);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  //? biến này tạo ra với mục đích hiển thị modal thêm người dùng
  const [showModalAddCustomer, setShowModalAddCustomer] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //? biến này tạo ra với mục đích hiển thị người dùng thỏa mã đk cho trước
  const [filterUser, setFilterUser] = useState<IFilterUser[]>([]);

  // Lấy ra danh sách id người dùng từ props chuyền sang
  const [listIdCustomer, setListIdCustomer] = useState([]);

  const validations: IValidation[] = [];

  const listIdCustomerProps = [];

  useEffect(() => {
    if (listIdCustomerProps && listIdCustomerProps.length > 0) {
      setListIdCustomer(listIdCustomerProps);
    }
  }, [listIdCustomerProps]);

  // Load data from props when component mounts or data changes
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      console.log("Loading data into formData", data);
      setType("edit");
      
      // Parse dates if they exist
      const startDate = data.startDate ? new Date(data.startDate) : null;
      const endDate = data.endDate ? new Date(data.endDate) : null;
      
      const newFormData = {
        values: {
          name: data.name || "",
          subtotalSelection: data.subtotalSelection || "",
          prerequisiteSubtotal: data.prerequisiteSubtotal || "",
          discountType: data.discountType || "",
          discountValue: data.discountValue || "",
          discountTypeSelection: data.discountTypeSelection || "",
          timeType: data.timeType || "",
          timeAt: data.timeAt || "",
          startDate: startDate,
          endDate: endDate,
          receiverType: data.receiverType || "",
          limit: data.limit || "",
        }
      };
      
      console.log("New formData:", newFormData);
      setFormData(newFormData);
      
      // Set isFinishTime if endDate exists
      if (endDate) {
        setIsFinishTime(true);
      }
      
      if (data.receiverType === "1") {
        setOptionOne(true);
        setOptionTwo(false);
        setOptionThree(false);
      } else if (data.receiverType === "2") {
        setOptionOne(false);
        setOptionTwo(true);
        setOptionThree(false);
      } else if (data.receiverType === "3") {
        setOptionOne(false);
        setOptionTwo(false);
        setOptionThree(true);
      }
      if (data.filterCustomerGroup) {
        setValueCgp(data.filterCustomerGroup);
      }
      if (data.filterCareer) {
        setValueCareer(data.filterCareer);
      }
      if (data.filterSource) {
        setValueSource(data.filterSource);
      }
    }
  }, [data]);

  //* Đoạn này xử lý lấy ngành nghề khách hàng
  const handleChangeValueCareer = (data) => {
    setValueCareer(data);
  };

  //! đoạn này mình xử lý theo lựa chọn tiêu chí người nhận
  const handleChangeValueAllCustomer = (e) => {
    const value = e.target.value;
    setOptionOne(!optionOne);
    setOptionTwo(false);
    setOptionThree(false);
    setFormData({ ...formData, values: { ...formData.values, receiverType: value, limit: "" } });
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

  //! đoạn này mình xử lý theo lựa chọn tiêu chí tùy chọn
  const handleChangeValueCustomCriteria = (e) => {
    const value = e.target.value;
    setOptionTwo(!optionTwo);
    setOptionOne(false);
    setOptionThree(false);
    setFormData({ ...formData, values: { ...formData.values, receiverType: value, limit: "" } });
  };

  //* Đoạn này xử lý lấy nhóm khách hàng
  const handleChangeValueCgp = (data) => {
    setValueCgp(data);
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

  //* Đoạn này xử lý lấy nguồn khách hàng
  const handleChangeValueSource = (data) => {
    setValueSource(data);
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

  //! đoạn này mình xử lý theo lựa chọn theo khách hàng cụ thể
  const handleChangeValueSpecificObject = (e) => {
    const value = e.target.value;
    setOptionThree(!optionThree);
    setOptionOne(false);
    setOptionTwo(false);
    setFormData({ ...formData, values: { ...formData.values, receiverType: value } });
  };

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

  //! đoạn này xử lý xóa người dùng được chọn
  const handleRemoveCustomer = (id) => {
    const newCustomers = filterUser.filter((item) => item.id !== id);
    const newIdCustomers = newCustomers.map((item) => item.id);
    setFilterUser(newCustomers);
    setListIdCustomer(newIdCustomers);
  };

  //! đoạn này xử lý lấy id của người dùng rồi gửi đi
  const handleTakeDataCustomer = useCallback((lstId: number[], lstCustomer: IFilterUser[]) => {
    setFilterUser([...filterUser, ...lstCustomer]);
    setListIdCustomer([...listIdCustomer, ...lstId]);
  }, []);

  //! đoạn này mình xử lý gửi theo thời gian mong muốn
  const handleChageValueTimeAt = (e) => {
    setFormData({ ...formData, values: { ...formData.values, timeAt: e } });
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

  // lấy thông tin ngày bắt đầu chiến dịch, và ngày cuối cùng chiến dịch
  const startDay = new Date(formData.values.startDate).getTime();
  const endDay = new Date(formData.values.endDate).getTime();
  //* ngày bắt đầu
  const [checkFieldStartDate, setCheckFieldStartDate] = useState<boolean>(false);
  const handleChangeValueStartDate = (e) => {
    setCheckFieldStartDate(false);

    setFormData({ ...formData, values: { ...formData?.values, startDate: e } });
  };

  //* ngày kết thúc
  const [checkFieldEndDate, setCheckFieldEndDate] = useState<boolean>(false);
  const handleChangeValueEndDate = (e) => {
    setCheckFieldEndDate(false);

    setFormData({ ...formData, values: { ...formData?.values, endDate: e } });
  };

  const [giftList, setGiftList] = useState<any[]>([
    {
      id: 1,
      name: "Sản phẩm 1",
      imageUrl: "./assets/5f7944ea4e383956a0fd.png",
      unit: [
        {
          id: 1,
          name: "Hộp",
          value: "1",
        },
        {
          id: 2,
          name: "Cái",
          value: "2",
        },
      ],
    },
    {
      id: 1,
      name: "Sản phẩm 1",
      imageUrl: "./assets/5f7944ea4e383956a0fd.png",
      unit: [],
    },
    {
      id: 1,
      name: "Sản phẩm 1",
      imageUrl: "./assets/5f7944ea4e383956a0fd.png",
      unit: [
        {
          id: 1,
          name: "Hộp",
          value: "1",
        },
        {
          id: 2,
          name: "Cái",
          value: "2",
        },
      ],
    },
  ]);

  return (
    <div className={`page-edit_prm`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              setIsSettingEform(false);
            }}
            className="title-first"
          >
            {/* {data?.id ? "Chỉnh sửa " : "Thêm mới "} chương trình khuyến mãi */}
          </h1>
        </div>
        {/* <TitleAction title="" titleActions={titleActions} /> */}
      </div>
      <div className="edit_prm">
        <div className="edit_prm--left">
          <div className="content_edit_prm">
            <div className="header-main">THÔNG TIN CHƯƠNG TRÌNH</div>
            <div className="body-main">
              <div className="main-left">
                <div className="item-title">THÔNG TIN CHUNG</div>
                <div className="form-item">
                  <Input
                    type="text"
                    label={"Tên chương trình"}
                    placeholder={"Nhập tên chương trình"}
                    value={formData?.values?.name}
                    fill={true}
                    required={true}
                    onChange={(e) => setFormData({ ...formData, values: { ...formData.values, name: e.target.value } })}
                  />
                </div>
                {isFinishTime ? (
                  <div className="form-item-mege">
                    <div className="form-item">
                      <DatePickerCustom
                        name="startDate"
                        fill={true}
                        value={formData?.values?.startDate || null}
                        label={"Ngày bắt đầu"}
                        required={true}
                        onChange={(e) => {
                          handleChangeValueStartDate(e);
                        }}
                        placeholder="Chọn ngày bắt đầu"
                        error={checkFieldStartDate || startDay > endDay}
                        message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày kết thúc" : "Vui lòng chọn ngày bắt đầu"}
                      />
                    </div>
                    <div className="form-item">
                      <DatePickerCustom
                        name="endDate"
                        fill={true}
                        value={formData?.values?.endDate || null}
                        label={"Ngày kết thúc"}
                        required={true}
                        onChange={(e) => handleChangeValueEndDate(e)}
                        placeholder="Chọn ngày kết thúc"
                        error={checkFieldStartDate || startDay > endDay}
                        message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày kết thúc" : "Vui lòng chọn ngày bắt đầu"}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="form-item">
                    <DatePickerCustom
                      name="startDate"
                      fill={true}
                      value={formData?.values?.startDate || null}
                      label={"Ngày bắt đầu"}
                      required={true}
                      onChange={(e) => {
                        handleChangeValueStartDate(e);
                      }}
                      placeholder="Chọn ngày bắt đầu"
                      error={checkFieldStartDate || startDay > endDay}
                      message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày kết thúc" : "Vui lòng chọn ngày bắt đầu"}
                    />
                  </div>
                )}
                <div className="form-item">
                  <Checkbox
                    indeterminate={false}
                    label="Thời gian kết thúc"
                    checked={isFinishTime}
                    onChange={(e) => setIsFinishTime(!isFinishTime)}
                  />
                </div>
                <div className="item-title">ÁP DỤNG TRÊN HOÁ ĐƠN</div>
                <div className="form-item-mege">
                  <div className="form-item">
                    <SelectCustom
                      id="subtotalSelection"
                      name="subtotalSelection"
                      fill={true}
                      label={"Điều kiện áp dụng"}
                      required={true}
                      options={[
                        { label: "Tối thiểu", value: "minimum" },
                        { label: "Trên mỗi khoảng", value: "each" },
                      ]}
                      value={formData?.values?.subtotalSelection || null}
                      onChange={(e) => setFormData({ ...formData, values: { ...formData.values, subtotalSelection: e.value } })}
                      // isAsyncPaginate={true}
                      placeholder="Chọn điều kiện áp dụng"
                    />
                  </div>
                  <div className="form-item">
                    <NummericInput
                      label={"Giá trị hoá đơn (VNĐ)"}
                      name="prerequisiteSubtotal"
                      fill={true}
                      required={true}
                      thousandSeparator={true}
                      value={!formData?.values.prerequisiteSubtotal ? "" : formData?.values.prerequisiteSubtotal}
                      placeholder={"Nhập giá trị hoá đơn (VNĐ)"}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, values: { ...formData?.values, prerequisiteSubtotal: value.replace(/,/g, "") } });
                      }}
                      disabled={formData.values.currency === "USD" ? true : false}
                    />
                  </div>
                </div>
                <div className="item-title">HÌNH THỨC KHUYẾN MÃI</div>
                <div className={"form-item-mege"}>
                  <div className={"form-item"}>
                    <SelectCustom
                      id="discountType"
                      name="discountType"
                      fill={true}
                      label={"Kiểu khuyến mãi"}
                      required={true}
                      options={[
                        {
                          value: "discount",
                          label: "Chiết khấu",
                        },
                        {
                          value: "gift",
                          label: "Quà tặng",
                        },
                      ]}
                      value={formData?.values?.discountType || null}
                      onChange={(e) => setFormData({ ...formData, values: { ...formData.values, discountType: e.value } })}
                      // isAsyncPaginate={true}
                      placeholder="Chọn kiểu khuyến mãi"
                    />
                  </div>
                  {formData?.values.discountType === "discount" ? (
                    <div className="form-item-discount">
                      <NummericInput
                        label={"Giảm giá"}
                        name="discountValue"
                        fill={true}
                        required={true}
                        thousandSeparator={true}
                        value={!formData?.values.discountValue ? 0 : formData?.values.discountValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, values: { ...formData?.values, discountValue: value.replace(/,/g, "") } });
                        }}
                      />
                      <div className="btn__vnd">
                        <Button
                          onClick={() => {
                            setShowModalAddProduct(true);
                            // handleAddProduct(idx)
                          }}
                        >
                          VNĐ
                        </Button>
                      </div>
                      <div className="btn__percent">
                        <Button
                          onClick={() => {
                            setShowModalAddProduct(true);
                            // handleAddProduct(idx)
                          }}
                        >
                          %
                        </Button>
                      </div>
                    </div>
                  ) : formData?.values.discountType === "gift" ? (
                    <div className="form-item">
                      <div className="btn__add-product">
                        <Button
                          className="btn__search"
                          onClick={() => {
                            setShowModalAddProduct(true);
                            // handleAddProduct(idx)
                          }}
                        >
                          <Icon name="PlusCircle" /> Chọn quà tặng
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
                {formData?.values.discountType === "discount" ? (
                  <SelectCustom
                    className="discount_type_selection"
                    id="discountTypeSelection"
                    name="discountTypeSelection"
                    fill={true}
                    label={"Đối tượng chiết khấu"}
                    required={true}
                    options={[
                      { label: "Hóa đơn", value: "order" },
                      { label: "Sản phẩm", value: "product" },
                      { label: "Nhóm sản phẩm", value: "group" },
                      { label: "Danh mục sản phẩm", value: "category" },
                    ]}
                    value={formData?.values?.discountTypeSelection || null}
                    onChange={(e) => setFormData({ ...formData, values: { ...formData.values, discountTypeSelection: e.value } })}
                    // isAsyncPaginate={true}
                    placeholder="Chọn kiểu khuyến mãi"
                  />
                ) : formData?.values.discountType === "gift" ? (
                  <div className="gift_list">
                    {giftList.length > 0 && (
                      <ul className="list-product">
                        {giftList.map((product, index_product) => (
                          <li key={index_product} className="list-product-item">
                            <div className="product_img">
                              <img src={product.imageUrl || "./assets/5f7944ea4e383956a0fd.png"} alt={product.name} />
                            </div>
                            <div className="product_details">
                              <div className="product_name">{product.name}</div>
                              {product.unit && product.unit.length > 0 && (
                                <ul className="unit_list">
                                  {product.unit.map((unit, idx_unit) => (
                                    <li key={idx_unit} className="unit_item">
                                      <span>{unit.name}</span>
                                      <div className="right_unit_item">
                                        <div className="input_qty_gift">
                                          <NummericInput
                                            value={product.qty}
                                            fill={true}
                                            required={true}
                                            error={checkFieldQtyCustomer}
                                            message={"Vui lòng nhập số lượng"}
                                            thousandSeparator={true}
                                            placeholder={"Nhập số lượng"}
                                            onValueChange={(e) => {
                                              const value = e.floatValue;
                                            }}
                                          />
                                        </div>
                                        <div className="delete-unit" onClick={() => {}}>
                                          <Icon name="PlusCircle" />
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            {product.unit.length == 0 && (
                              <div className="input_qty_gift_product">
                                <NummericInput
                                  value={product.qty}
                                  fill={true}
                                  required={true}
                                  error={checkFieldQtyCustomer}
                                  message={"Vui lòng nhập số lượng"}
                                  thousandSeparator={true}
                                  placeholder={"Nhập số lượng"}
                                  onValueChange={(e) => {
                                    const value = e.floatValue;
                                    setGiftList(
                                      giftList.map((item) => {
                                        if (item.id === product.id) {
                                          return {
                                            ...item,
                                            qty: value,
                                          };
                                        }
                                        return item;
                                      })
                                    );
                                  }}
                                />
                              </div>
                            )}
                            <div
                              title="Xóa sản phẩm"
                              className="delete-button"
                              onClick={() => {
                                setGiftList(giftList.filter((item) => item.id !== product.id));
                              }}
                            >
                              <Icon name="PlusCircle" />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>
              <div className="body-main-right">
                <div className="info-option">
                  <div className="custom-criteria">
                    <div className="item-title">NGƯỜI NHẬN KHUYẾN MÃI</div>
                    <div className="list-form-group">
                      {true && (
                        <Fragment>
                          {/* Lựa chọn tiêu chí 1 */}
                          <div className="option-item">
                            <div className="form-group">
                              <Radio
                                value="1"
                                label="Áp dụng cho tất cả khách hàng"
                                onChange={(e) => handleChangeValueAllCustomer(e)}
                                checked={optionOne}
                              />
                            </div>

                            {optionOne && (
                              <div className="limit-item-option--one">
                                <div className="notification-total">
                                  <NummericInput
                                    label="Nhập số khách hàng tối đa muốn áp dụng"
                                    value={formData.values.limit}
                                    fill={true}
                                    required={true}
                                    error={isLimitCustomer || formData?.values.limit > totalEstimate}
                                    message={`${
                                      formData?.values.limit > totalEstimate
                                        ? `Số khách hàng tối đa muốn áp dụng phải nhỏ hơn hoặc bằng ${totalEstimate}`
                                        : !formData.values.limit
                                        ? "Số khách hàng tối đa muốn áp dụng không được để trống"
                                        : formData.values.limit == "0"
                                        ? "Số khách hàng tối đa muốn áp dụng phải lớn hơn 0"
                                        : ""
                                    }`}
                                    thousandSeparator={true}
                                    placeholder={`Tối đa ${totalEstimate} khách hàng có thể áp dụng`}
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="condition">
            <div className="header-condition">ĐIỀU KIỆN KHUYẾN MÃI</div>
            <div className="body-condition">
              {listCondition.map((item, idx) => {
                return (
                  <div className="condition-item" key={idx}>
                    <div className="input-item">
                      <div
                        title="Xóa điều kiện"
                        className="close-button"
                        onClick={() => {
                          setListCondition(listCondition.filter((_, index) => index !== idx));
                        }}
                      >
                        <Icon name="PlusCircle" />
                      </div>
                      <div className="form-item">
                        <SelectCustom
                          id="branchId"
                          name="branchId"
                          fill={true}
                          label={"Loại điều kiện"}
                          required={true}
                          options={[]}
                          value={"1"}
                          onChange={(e) => console.log(e)}
                          isAsyncPaginate={true}
                          placeholder="Chọn loại điều kiện"
                        />
                      </div>
                      <div className="form-item">
                        <SelectCustom
                          id="branchId"
                          name="branchId"
                          fill={true}
                          label={"Kiểu điều kiện"}
                          required={true}
                          options={[]}
                          value={"1"}
                          onChange={(e) => console.log(e)}
                          isAsyncPaginate={true}
                          placeholder="Chọn kiểu điều kiện"
                        />
                      </div>
                      <div className="form-item">
                        <Input
                          type="text"
                          label={"Giá trị"}
                          placeholder={"Nhập giá trị"}
                          value={""}
                          fill={true}
                          required={true}
                          onChange={(e) => console.log(e)}
                        />
                      </div>
                      <div className="form-item">
                        <SelectCustom
                          id="branchId"
                          name="branchId"
                          fill={true}
                          label={"Đối tượng điều kiện"}
                          required={true}
                          options={[]}
                          value={"1"}
                          onChange={(e) => console.log(e)}
                          isAsyncPaginate={true}
                          placeholder="Chọn đối tượng điều kiện"
                        />
                      </div>
                      <div className="form-item">
                        <div className="btn__add-product">
                          <Button
                            className="btn__search"
                            onClick={() => {
                              setShowModalAddProduct(true);
                              // handleAddProduct(idx)
                            }}
                          >
                            <Icon name="PlusCircle" /> Thêm sản phẩm
                          </Button>
                        </div>
                      </div>
                    </div>
                    {item.listProduct.length > 0 && (
                      <ul className="list-product">
                        {item.listProduct.map((product, index_product) => (
                          <li key={index_product} className="list-product-item">
                            <div className="product_img">
                              <img src={product.imageUrl || "./assets/5f7944ea4e383956a0fd.png"} alt={product.name} />
                            </div>
                            <div className="product_details">
                              <div className="product_name">{product.name}</div>
                              {product.unit && product.unit.length > 0 && (
                                <ul className="unit_list">
                                  {product.unit.map((unit, idx_unit) => (
                                    <li key={idx_unit} className="unit_item">
                                      <span>{unit.name}</span>
                                      <div
                                        className="delete-unit"
                                        onClick={() => {
                                          setListCondition(
                                            listCondition.map((item, index) => {
                                              if (index == idx) {
                                                return {
                                                  ...item,
                                                  listProduct: item.listProduct.map((product, index_product_check) => {
                                                    if (index_product == index_product_check) {
                                                      return {
                                                        ...product,
                                                        unit: product.unit.filter((_, i) => idx_unit !== i),
                                                      };
                                                    }
                                                    return product;
                                                  }),
                                                };
                                              }
                                              return item;
                                            })
                                          );
                                        }}
                                      >
                                        <Icon name="PlusCircle" />
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div
                              title="Xóa sản phẩm"
                              className="delete-button"
                              onClick={() => {
                                setListCondition(
                                  listCondition.map((item, index) => {
                                    if (index == idx) {
                                      return {
                                        ...item,
                                        listProduct: item.listProduct.filter((_, i) => index_product !== i),
                                      };
                                    }
                                    return item;
                                  })
                                );
                              }}
                            >
                              <Icon name="PlusCircle" />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={"add_condition-button" + (listCondition.length == 0 ? " add_condition-button-center" : "")}>
              <Button className="btn__search" onClick={() => handleAddCondition()}>
                <Icon name="PlusCircle" /> Thêm điều kiện
              </Button>
            </div>
          </div>
        </div>
        <div className="edit_prm--right">
          <div className="sub">
            <div className="header-sub">TÓM TẮT CHƯƠNG TRÌNH</div>
            <div className="promotion-summary">
              {formData.values.name ? (
                <>
                  <div className="item-title">{formData.values.name}</div>
                  <ul>
                    {type === "edit" && formData?.values?.status ? <li>Trạng thái:{formData?.values?.status}</li> : null}
                    <li>Áp dụng với {formData?.values?.status === "all" ? "tất cả khách hàng" : `${listIdCustomer.length} khách hàng`}</li>
                    {formData?.values?.startDate && (
                      <li>
                        Áp dụng từ {moment(formData?.values?.startDate).format("HH:mm DD/MM/YYYY")}{" "}
                        {isFinishTime && formData?.values?.endDate ? `đến ${moment(formData?.values?.endDate).format("HH:mm DD/MM/YYYY")}` : ""}
                      </li>
                    )}
                    {/* {formValues.discountType === 'discount' &&
                    formData.values.discountTypeSelection &&
                    formik.values.value &&
                    formik.values.value > 0 ? (
                      <li>
                        Giảm {formik.values.valueType === 'percentage' ? `${formik.values.value}%` : `${addComma(formik.values.value)} VNĐ`}{' '}
                        {formik.values.formData === 'product'
                          ? `cho ${formValues.entitledProductIds.length} sản phẩm`
                          : formik.values.formData === 'group'
                          ? `cho ${formValues.entitledGroupIds.length} nhóm sản phẩm`
                          : formik.values.formData === 'category'
                          ? `cho ${formValues.entitledCategoryIds.length} danh mục sản phẩm`
                          : 'trên tổng giá trị hóa đơn'}
                      </li>
                    ) : formValues.entitledProductIdsGift.length > 0 ? (
                      <li>Tặng {formValues.entitledProductIdsGift.length} sản phẩm</li>
                    ) : null} */}
                    {formData?.values?.subtotalSelection && (
                      <li>
                        Áp dụng trên hóa đơn: {formData?.values?.subtotalSelection === "minimum" ? "tối thiểu" : "trên mỗi khoảng"}{" "}
                        {formatCurrency(+formData?.values?.prerequisiteSubtotal, ".", "", "") + " VNĐ"}
                      </li>
                    )}
                  </ul>
                  {/* {formValues.priceRules &&
                    formValues.priceRules.length > 0 &&
                    formValues.priceRules.map((priceRule, index) => {
                      return (
                        <div className="review-price-rule" key={index}>
                          <h4>Điều kiện {index + 1}</h4>
                          <ul>
                            <li>
                              {priceRule.type === 'item_quantity'
                                ? `Số lượng sản phẩm đạt ${priceRule.prerequisiteSelection === 'minimum' ? 'tối thiểu' : 'trên mỗi khoảng'} ${
                                    priceRule.value
                                  } sản phẩm`
                                : `Số lượng sản phẩm đạt giá trị ${
                                    priceRule.prerequisiteSelection === 'minimum' ? 'tối thiểu' : 'trên mỗi khoảng'
                                  } ${addComma(priceRule.value)} VNĐ`}
                            </li>
                            {priceRule.entitledProductIds &&
                            priceRule.entitledProductIds?.length > 0 &&
                            priceRule.targetSelection === 'product' ? (
                              <li> Áp dụng cho {priceRule.entitledProductIds.length} sản phẩm</li>
                            ) : priceRule.entitledGroupIds &&
                              priceRule.entitledGroupIds?.length > 0 &&
                              priceRule.targetSelection === 'group' ? (
                              <li> Áp dụng cho {priceRule.entitledGroupIds.length} nhóm sản phẩm</li>
                            ) : priceRule.entitledCategoryIds &&
                              priceRule.entitledCategoryIds?.length > 0 &&
                              priceRule.targetSelection === 'category' ? (
                              <li> Áp dụng cho {priceRule.entitledGroupIds.length} danh mục sản phẩm</li>
                            ) : null}
                          </ul>
                        </div>
                      );
                    })} */}
                </>
              ) : (
                <p>Chưa có tên chương trình</p>
              )}
            </div>
          </div>
          <div className="footer">
            <Button className="btn__search" onClick={() => console.log("ok")}>
              Hoàn thành
            </Button>
          </div>
        </div>
      </div>
      <ChooseProductModal
        // onShow={showModalAddProduct}
        onShow={showModalAddProduct}
        onHide={() => setShowModalAddProduct(false)}
      />
      <AddCustomerSendModal
        onShow={showModalAddCustomer}
        onHide={() => setShowModalAddCustomer(false)}
        type={formData?.values?.receiverType}
        callBack={handleTakeDataCustomer}
        listIdCustomer={listIdCustomer}
        lstCustomer={filterUser}
      />
    </div>
  );
}
