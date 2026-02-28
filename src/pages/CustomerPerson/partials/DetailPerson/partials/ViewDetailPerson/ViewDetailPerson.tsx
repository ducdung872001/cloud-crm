import React, { useState, useEffect, Fragment, useMemo } from "react";
import moment from "moment";
import Tippy from "@tippyjs/react";
import parser from "html-react-parser";
import { useNavigate } from "react-router-dom";
import SwiperCore, { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IViewDetailPersonProps } from "model/customer/PropsModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import ThirdGender from "assets/images/third-gender.png";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";
import AddCustomerCompanyModal from "pages/CustomerPerson/partials/AddCustomerCompanyModal";
import { convertToPrettyNumber, showToast } from "utils/common";
import CustomerService from "services/CustomerService";
import AddCustomerViewerModal from "pages/CustomerPerson/partials/AddCustomerViewerModal/AddCustomerViewerModal";
import { formatCurrency, getDomain } from "reborn-util";
import ImageError from "assets/images/error.png";

import "tippy.js/animations/scale-extreme.css";
import "./ViewDetailPerson.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import Button from "components/button/button";
import TextArea from "components/textarea/textarea";
import _ from "lodash";
import ScoreHistoryModal from "../ScoreHistoryModal";
import EditScoreModal from "../EditScoreModal";

SwiperCore.use([Navigation]);

export default function ViewDetailPerson(props: IViewDetailPersonProps) {
  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");

  const { data, callback, setDeleteSignal, deleteSignal, dataOther } = props;

  const takeUrlCustomerLocalStorage = JSON.parse(localStorage.getItem("backUpUrlCustomer") || "");

  const navigate = useNavigate();

  const [showModalEdit, setShowModalEdit] = useState<boolean>(false);
  const [showModalAddCompany, setShowModalAddCompany] = useState<boolean>(false);
  const [showModalAddViewer, setShowModalAddViewer] = useState<boolean>(false);
  const [isShowInfoDetail, setIsShowInfoDetail] = useState<boolean>(false);
  const [isShowInfoRevenue, setIsShowInfoRevenue] = useState<boolean>(false);
  const [isShowInfoContact, setIsShowInfoContact] = useState<boolean>(false);
  const [isShowInfoOther, setIsShowInfoOther] = useState<boolean>(false);
  const [mapCustomerAttribute, setMapCustomerAttribute] = useState<any>(null);
  const [showModalHistory, setShowModalHistory] = useState<boolean>(false);
  const [showModalEditScore, setShowModalEditScore] = useState<boolean>(false);
  // console.log('mapCustomerAttribute', mapCustomerAttribute);
  const [dataCustomerAttribute, setDataCustomerAttribute] = useState<any>(null);

  useEffect(() => {
    if (data) {
      const listNewItem = [];
      const customerExtraInfos = data.lstCustomerExtraInfo;
      const customerAttribute = data.mapCustomerAttribute;
      Object.entries(customerAttribute).map((lstCustomerAttribute: any, key: number) => {
        (lstCustomerAttribute[1] || []).map((customerAttribute, index: number) => {
          if (customerAttribute.parentId) {
            const newItem = {
              // attributeId: customerAttribute.id,
              attributeName: customerAttribute.name,
              fieldName: customerAttribute.fieldName,
              // dataType: customerAttribute.datatype,
              attributeValue: getContractAttributeValue(customerAttribute.id, customerAttribute.datatype, customerExtraInfos),
            };

            listNewItem.push(newItem);
          }
        });
      });
      console.log("listNewItem", listNewItem);
      const dataReason = listNewItem?.find((el) => el.fieldName === "LyDo") ? listNewItem?.find((el) => el.fieldName === "LyDo").attributeValue : "";

      setContentReason(dataReason ? { value: dataReason, label: dataReason } : null);
      // setContentReasonFirst(dataReason || null);
      // setMapCustomerAttribute(customerAttribute)
      setDataCustomerAttribute(listNewItem);
    }
  }, [data]);

  const getContractAttributeValue = (attributeId, datatype, customerExtraInfos) => {
    let attributeValue = "";
    (customerExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return datatype === "date"
      ? attributeValue
        ? moment(attributeValue).format("DD/MM/YYYY")
        : ""
      : datatype === "number"
      ? formatCurrency(attributeValue, ",", "")
      : attributeValue;
  };

  //TNEX
  //Trạng thái cuộc gọi
  const [isShowStatusPhone, setIsShowStatusPhone] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState(null);
  console.log("callStatus", callStatus);

  const [editCallStatus, setEditCallStatus] = useState(false);
  //danh sách cuộc gọi
  const [telesaleCallList, setTelesaleCallList] = useState([]);

  //Trạng thái khoản vay
  const [isShowStatusLoan, setIsShowStatusLoan] = useState<boolean>(false);

  //Trạng thái onBoard
  const [isShowStatusOnboard, setIsShowStatusOnboard] = useState<boolean>(false);

  //Lý do từ chối
  const [isRejectReason, setIsRejectReason] = useState<boolean>(false);
  const [contentReason, setContentReason] = useState(null);
  const [contentReasonFirst, setContentReasonFirst] = useState("");
  //////

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const onDelete = async (id: number) => {
    if (!id) return;

    const response = await CustomerService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa khách hàng thành công`, "success");
      setDeleteSignal(true);
      navigate(
        `/customer?contactType=${takeUrlCustomerLocalStorage.contactType}&page=${
          takeUrlCustomerLocalStorage?.page ? takeUrlCustomerLocalStorage?.page : 1
        }`
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICustomerResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa khách hàng</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa khách hàng
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const notData = ".....................";

  const listDetailInfo = [
    {
      title: "Mã thẻ khách hàng",
      name: data.code || notData,
    },
    {
      title: "Mã tiếp thị liên kết",
      name: notData,
    },
    {
      title: "Người phụ trách",
      name: data.employeeName || notData,
    },
    {
      title: "SĐT người giới thiệu",
      name: data.recommenderPhone || notData,
    },
    {
      title: "Ngành nghề",
      name: data.careerName || notData,
    },
    {
      title: "Nhóm khách hàng",
      name: data.groupName || notData,
    },
    {
      title: "Nguồn khách hàng",
      name: data.sourceName || notData,
    },
  ];

  ///TNEX
  const listDetailInfoTNEX = useMemo(
    () =>
      [
        {
          title: "Nguồn kênh",
          name: data?.sourceName,
        },

        {
          title: "Mã khách hàng",
          name: data?.code,
        },
        {
          title: "Ngày onboard ",
          name: dataCustomerAttribute?.find((el) => el.fieldName === "Ngayonboard")
            ? dataCustomerAttribute?.find((el) => el.fieldName === "Ngayonboard").attributeValue
            : "",
        },

        {
          title: "Mã đăng ký vay Cashloan",
          name: dataCustomerAttribute?.find((el) => el.fieldName === "MaDangKyVayCashloan")
            ? dataCustomerAttribute?.find((el) => el.fieldName === "MaDangKyVayCashloan").attributeValue
            : "",
        },
        {
          title: "Mã đăng ký vay Creditline",
          name: dataCustomerAttribute?.find((el) => el.fieldName === "MaDangKyVayCreditline")
            ? dataCustomerAttribute?.find((el) => el.fieldName === "MaDangKyVayCreditline").attributeValue
            : "",
        },
        {
          title: "Ngày phân bổ cho Telesale",
          name: data?.saleAssignDate ? moment(data.saleAssignDate).format("DD/MM/YYYY HH:mm") : "",
        },
        {
          title: "Sản phẩm",
          name:
            dataCustomerAttribute?.find((el) => el.fieldName === "SanPham") &&
            dataCustomerAttribute?.find((el) => el.fieldName === "SanPham")?.attributeValue
              ? JSON.parse(dataCustomerAttribute?.find((el) => el.fieldName === "SanPham")?.attributeValue)
              : "",
        },
      ] as any,
    [data, dataCustomerAttribute]
  );

  // const statusPhoneTNEX = useMemo(
  //   () =>
  //     ([
  //       {
  //         title: 'Follow 1',
  //         value: {
  //           infoCall: 'Khách hàng bận gọi lại sau',
  //           time: '01/01/2024 08:30:00'
  //         }
  //       },
  //       {
  //         title: 'Follow 2',
  //         value: {
  //           infoCall: 'Khách hàng đồng ý vay nhưng chưa thực hiện đăng ký',
  //           time: '02/01/2024 08:30:00'
  //         }
  //       },
  //     ] as any),
  //   [data, telesaleCallList]
  // );

  const cashStatusTNEX = useMemo(
    () =>
      [
        {
          product: "Cashloan",
          status: dataCustomerAttribute?.find((el) => el.fieldName === "Trangthaikhoanvaycashloan")
            ? dataCustomerAttribute?.find((el) => el.fieldName === "Trangthaikhoanvaycashloan").attributeValue
            : "",
        },
        {
          product: "Creditline",
          status: dataCustomerAttribute?.find((el) => el.fieldName === "Trangthaikhoanvaycreditline")
            ? dataCustomerAttribute?.find((el) => el.fieldName === "Trangthaikhoanvaycreditline").attributeValue
            : "",
        },
      ] as any,
    [dataCustomerAttribute]
  );

  const onBoardStatusTNEX = useMemo(
    () =>
      [
        {
          product: "Cashloan",
          status: "",
        },
        {
          product: "Creditline",
          status: "",
        },
      ] as any,
    [dataCustomerAttribute]
  );

  const handleSaveInfoTNEX = async (data, fieldType, value, fieldName) => {
    const body = {
      customerId: data.id,
      fieldName: fieldName,
      fieldValue: value,
      fieldType: fieldType,
    };

    const response = await CustomerService.updateByField(body);

    if (response.code === 0) {
      setContentReasonFirst(contentReason);
      showToast("Cập nhật thông tin thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const updateCallStatus = async (e, reset, id) => {
    const body = {
      id: id,
      customerId: data.id,
      callStatus: e.value,
    };

    const response = await CustomerService.telesaleCallUpdate(body);

    if (response.code === 0) {
      getTelesaleCallList(data.id);
      showToast("Cập nhật thông tin thành công", "success");
      if (reset) {
        setCallStatus(null);
        setEditCallStatus(null);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getTelesaleCallList = async (id: number) => {
    const response = await CustomerService.telesaleCallList({ customerId: id });
    if (response.code == 0) {
      const result = response.result;
      setTelesaleCallList(result || []);
      if (result[2] && result[2]?.callStatus) {
        setCallStatus({ value: result[2]?.callStatus, label: result[2]?.callStatus });
      }
    } else {
      showToast(response.message, "error");
    }
  };

  useEffect(() => {
    if (checkSubdomainTNEX && data) {
      getTelesaleCallList(data.id);
    }
  }, [checkSubdomainTNEX, data]);

  /////

  const listInfoRevenue = [
    {
      title: "Số lần đã mua",
      name: `${data.invoiceCount} lần`,
    },
    {
      title: "Lần mua gần nhất",
      name: data.lastBoughtDate ? moment(data.lastBoughtDate).format("DD/MM/YYYY") : notData,
    },
    {
      title: "Tổng doanh số",
      name: `${convertToPrettyNumber(data.fee || 0)}`,
      special: true,
    },
    {
      title: "Tổng doanh thu",
      name: `${convertToPrettyNumber(data.paid || 0)}`,
      special: true,
    },
    {
      title: "Công nợ",
      name: `${convertToPrettyNumber(data.debt || 0)}`,
      special: true,
    },
    {
      title: "Số đơn hàng",
      name: data.invoiceCount,
    },
  ];

  const listInfoContact = [
    {
      title: "Liên hệ lần cuối",
      name: data.lastContactDate ? moment(data.lastContactDate).format("DD/MM/YYYY") : notData,
    },
    {
      title: "Số tương tác",
      name: data.contactCount,
    },
    {
      title: "Tình trạng cuộc gọi đầu tiên",
      name: data.firstCall || notData,
    },
  ];

  useEffect(() => {
    //TODO: Khi mà chuyền function như này rất dễ bị dính cảnh bảo rò rỉ bộ nhớ, cách fix là clear nó đi
    return () => {
      !deleteSignal ?? callback();
      setShowModalEdit(false);
    };
  }, [deleteSignal]);

  const [isShowPhone, setIsShowPhone] = useState<boolean>(false);
  const [valueShowPhone, setValueShowPhone] = useState<string>("");

  const handShowPhone = async (id: number) => {
    if (!id) return;

    const response = await CustomerService.viewPhone(id);
    if (response.code == 0) {
      const result = response.result;
      setValueShowPhone(result);
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem số điện thoại !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  useEffect(() => {
    if (isShowPhone && data) {
      handShowPhone(data?.id);
    }
  }, [isShowPhone, data]);

  useEffect(() => {
    if (!isShowPhone) {
      setValueShowPhone("");
    }
  }, [isShowPhone]);

  const [isShowEmail, setIsShowEmail] = useState<boolean>(false);
  const [valueShowEmail, setValueShowEmail] = useState<string>("");

  const handShowEmail = async (id: number) => {
    if (!id) return;

    const response = await CustomerService.viewEmail(id);
    if (response.code == 0) {
      const result = response.result;
      setValueShowEmail(result);
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem email !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  useEffect(() => {
    if (isShowEmail && data) {
      handShowEmail(data?.id);
    }
  }, [isShowEmail, data]);

  useEffect(() => {
    if (!isShowEmail) {
      setValueShowEmail("");
    }
  }, [isShowEmail]);

  const [hasServiceSuggestion, setHasServiceSuggestion] = useState<boolean>(true);
  const [lstServiceSuggestion, setLstServiceSuggestion] = useState([]);

  const handGetServiceSuggestion = async (id: number) => {
    if (!id) return;

    const param = {
      customerId: id,
    };

    const response = await CustomerService.serviceSuggestionsv2(param);

    if (response.code === 0) {
      const result = [...response.result].map((item) => {
        return {
          ...item.product,
          inventories: item.inventories,
          idOrg: item.objectId,
        };
      });

      setLstServiceSuggestion(result);
    } else {
      showToast("Gợi ý sản phẩm/dịch vụ đang lỗi. Xin vui lòng thử lại sau", "error");
    }
  };

  // useEffect(() => {
  //   if (data) {
  //     handGetServiceSuggestion(data.id);
  //   }
  // }, [data]);

  const handOpenTabCreateSale = (link) => {
    if (!link) return;

    window.open(link, "_blank");
  };

  const handleCopy = async (content) => {
    const textToCopy = content;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  const optionCallStatus = [
    {
      value: "KH không nghe máy",
      label: "KH không nghe máy",
    },
    {
      value: "KH bận gọi lại sau",
      label: "KH bận gọi lại sau",
    },
    {
      value: "SĐT khách hàng thuê bao",
      label: "SĐT khách hàng thuê bao",
    },
    {
      value: "SĐT không đúng hoặc đang tạm khóa",
      label: "SĐT không đúng hoặc đang tạm khóa",
    },
    {
      value: "KH đăng ký bằng SĐT khác",
      label: "KH đăng ký bằng SĐT khác",
    },
    {
      value: "KH đã thực hiện đăng ký khoản vay trước đó",
      label: "KH đã thực hiện đăng ký khoản vay trước đó",
    },
    {
      value: "KH đang cân nhắc khoản vay, gọi lại hỗ trợ sau",
      label: "KH đang cân nhắc khoản vay, gọi lại hỗ trợ sau",
    },
    {
      value: "KH từ chối đăng ký do không đủ điều kiện vay",
      label: "KH từ chối đăng ký do không đủ điều kiện vay",
    },
    {
      value: "KH nghe máy, không có nhu cầu vay",
      label: "KH nghe máy, không có nhu cầu vay",
    },
    {
      value: "(Cashloan) KH đồng ý vay nhưng chưa thực hiện đăng ký",
      label: "(Cashloan) KH đồng ý vay nhưng chưa thực hiện đăng ký",
    },
    {
      value: "(T-Boss) KH đồng ý vay nhưng chưa thực hiện đăng ký",
      label: "(T-Boss) KH đồng ý vay nhưng chưa thực hiện đăng ký",
    },
    {
      value: "(Cashloan) KH đăng ký thành công",
      label: "(Cashloan) KH đăng ký thành công",
    },
    {
      value: "(T-Boss) KH đăng ký thành công",
      label: "(T-Boss) KH đăng ký thành công",
    },
    {
      value: "KH không đủ điều kiện vay SP TBOSS",
      label: "KH không đủ điều kiện vay SP TBOSS",
    },
  ];

  return (
    <div className="view-detail-person">
      <div className="basic-infor">
        <div className="title-info">
          <span className="title">Thông tin cơ bản</span>
          <div className="action-update">
            <div className="add-person" onClick={() => setShowModalAddViewer(true)}>
              <Tippy content="Thêm người xem" delay={[100, 0]} animation="scale-extreme">
                <span>
                  <Icon name="UserAdd" />
                </span>
              </Tippy>
            </div>
            <div className="update-person" onClick={() => (data.custType == 1 ? setShowModalAddCompany(true) : setShowModalEdit(true))}>
              <Tippy content="Sửa" delay={[100, 0]} animation="scale-extreme">
                <span>
                  <Icon name="Pencil" />
                </span>
              </Tippy>
            </div>
            <div className="delete-person" onClick={() => showDialogConfirmDelete(data)}>
              <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                <span>
                  <Icon name="Trash" />
                </span>
              </Tippy>
            </div>
          </div>
        </div>

        <div className="detail-basic-info">
          <div className="info__item">
            <div className="info__item--left">
              <Tippy content="Họ và tên" delay={[100, 0]} animation="scale-extreme">
                <div className="avatar-item">
                  <img src={data.avatar ? data.avatar : ThirdGender} alt={data.name} />
                </div>
              </Tippy>
            </div>
            <div className="info__item--right">{data.name}</div>
          </div>
          <div className="info__item">
            <div className="info__item--left">
              <Tippy content="Số điện thoại" delay={[100, 0]} animation="scale-extreme">
                <div className="icon-phone">
                  <Icon name="Phone" />
                </div>
              </Tippy>
            </div>
            <span className="info__item--right">
              {valueShowPhone ? valueShowPhone : data.phoneUnmasked || data.phoneMasked}
              {data.phoneMasked && !data.phoneUnmasked ? (
                <span className="icon" onClick={() => setIsShowPhone(!isShowPhone)}>
                  <Icon name={isShowPhone ? "EyeSlash" : "Eye"} />
                </span>
              ) : null}
              {checkSubdomainTNEX ? (
                <Tippy content="Copy">
                  <span className="icon" onClick={(e) => handleCopy(valueShowPhone ? valueShowPhone : data.phoneUnmasked || data.phoneMasked)}>
                    <Icon name={"Copy"} style={{ width: 18, height: 18 }} />
                  </span>
                </Tippy>
              ) : null}
            </span>
          </div>
          <div className="info__item">
            <div className="info__item--left">
              <Tippy content="Email" delay={[100, 0]} animation="scale-extreme">
                <div className="icon-mail">
                  <Icon name="Mail" />
                </div>
              </Tippy>
            </div>
            <span className="info__item--right">
              {valueShowEmail ? valueShowEmail : data.email || data.emailMasked || notData}

              {(data.email || data.emailMasked) && (
                <span className="icon" onClick={() => setIsShowEmail(!isShowEmail)}>
                  <Icon name={isShowEmail ? "Eye" : "EyeSlash"} />
                </span>
              )}
            </span>
          </div>

          {data?.custType === 0 ? (
            <div className="info__item">
              <div className="info__item--left">
                <Tippy content="Sinh nhật" delay={[100, 0]} animation="scale-extreme">
                  <div className="icon-cake">
                    <Icon name="Cake" />
                  </div>
                </Tippy>
              </div>
              <span className="info__item--right">{data.birthday ? moment(data.birthday).format("DD/MM/YYYY") : notData}</span>
            </div>
          ) : null}

          {data?.custType === 0 ? (
            <div className="info__item">
              <div className="info__item--left">
                <Tippy content="Giới tính" delay={[100, 0]} animation="scale-extreme">
                  <div className="icon-gender">
                    <Icon name="Female" />
                  </div>
                </Tippy>
              </div>
              <span className="info__item--right">{data.gender == 1 ? "Nữ" : "Nam"}</span>
            </div>
          ) : null}

          <div className="info__item">
            <div className="info__item--left">
              <Tippy content="Địa chỉ" delay={[100, 0]} animation="scale-extreme">
                <div className="icon-location">
                  <Icon name="Location" />
                </div>
              </Tippy>
            </div>
            <span className="info__item--right">{data.address || notData}</span>
          </div>
        </div>
        <div className="title-info" style={{ marginTop: "2rem" }}>
          <span className="title">Thông tin Loyalty</span>
          <div className="action-update">
            <div className="add-person" onClick={() => setShowModalHistory(true)}>
              <Tippy content="Lịch sử" delay={[100, 0]} animation="scale-extreme">
                <span>
                  <Icon name="History" />
                </span>
              </Tippy>
            </div>
            <div className="update-person" onClick={() => setShowModalEditScore(true)}>
              <Tippy content="Sửa điểm thành viên" delay={[100, 0]} animation="scale-extreme">
                <span>
                  <Icon name="Pencil" />
                </span>
              </Tippy>
            </div>
          </div>
        </div>

        <div className="detail-basic-info">
          <div className="info__item">
            <div className="info__item--left">
              <Tippy content="Điểm tích luỹ" delay={[100, 0]} animation="scale-extreme">
                <div className="icon-score">
                  <Icon name="Score" />
                </div>
              </Tippy>
            </div>
            <span className="info__item--right">{"10.000"} điểm</span>
          </div>
          <div className="info__item">
            <div className="info__item--left">
              <Tippy content="Hạng thành viên" delay={[100, 0]} animation="scale-extreme">
                <div className="icon-gold-member">
                  <Icon name="GoldMember" />
                </div>
              </Tippy>
            </div>
            <span className="info__item--right">{"Vàng"}</span>
          </div>
        </div>
      </div>

      {checkSubdomainTNEX ? null : (
        <div>
          <div className="detail-info">
            <div
              className="title-click"
              onClick={() => {
                setIsShowInfoRevenue(false);
                setIsShowInfoContact(false);
                setHasServiceSuggestion(false);
                setIsShowInfoOther(false);
                setIsShowInfoDetail(!isShowInfoDetail);
                setIsShowStatusPhone(false);
                setIsShowStatusLoan(false);
                setIsShowStatusOnboard(false);
              }}
            >
              <span className="name">Thông tin chi tiết</span>
              <span className="icon-up-down">{isShowInfoDetail ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
            </div>

            {isShowInfoDetail && (
              <div className="list-info-detail">
                {listDetailInfo.map((item, idx) => (
                  <div key={idx} className="item__detail">
                    <h4 className="item__detail--left">{item.title}</h4>
                    <h4 className="item__detail--right">{item.name}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="revenue-info">
            <div
              className="title-click"
              onClick={() => {
                setIsShowInfoDetail(false);
                setIsShowInfoContact(false);
                setHasServiceSuggestion(false);
                setIsShowInfoOther(false);
                setIsShowInfoRevenue(!isShowInfoRevenue);
                setIsShowStatusPhone(false);
                setIsShowStatusLoan(false);
                setIsShowStatusOnboard(false);
              }}
            >
              <span className="name">Thông tin doanh thu</span>
              <span className="icon-up-down">{isShowInfoRevenue ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
            </div>

            {isShowInfoRevenue && (
              <div className="list-info-revenue">
                {listInfoRevenue.map((item, idx) => (
                  <div key={idx} className="item__revenue">
                    <span className="item__revenue--left">{item.title}</span>
                    <span className="item__revenue--right">{item.special ? parser(item.name.toString()) : item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="info-contact">
            <div
              className="title-click"
              onClick={() => {
                setIsShowInfoDetail(false);
                setIsShowInfoRevenue(false);
                setHasServiceSuggestion(false);
                setIsShowInfoOther(false);
                setIsShowInfoContact(!isShowInfoContact);
                setIsShowStatusPhone(false);
                setIsShowStatusLoan(false);
                setIsShowStatusOnboard(false);
              }}
            >
              <span className="name">Thông tin liên hệ</span>
              <span className="icon-up-down">{isShowInfoContact ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
            </div>

            {isShowInfoContact && (
              <div className="list-info-contact">
                {listInfoContact.map((item, idx) => (
                  <div key={idx} className="item__contact">
                    <span className="item__contact--left">{item.title}</span>
                    <span className="item__contact--right">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="info-other">
            <div
              className="title-click"
              onClick={() => {
                setIsShowInfoDetail(false);
                setIsShowInfoRevenue(false);
                setHasServiceSuggestion(false);
                setIsShowInfoContact(false);
                setIsShowInfoOther(!isShowInfoOther);
              }}
            >
              <span className="name">Thông tin khác</span>
              <span className="icon-up-down">{isShowInfoOther ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
            </div>

            {isShowInfoOther && (
              <div className="list-info-other">
                {dataOther.map((item, idx) => {
                  return (
                    <div key={idx} className="item__other">
                      <span className="item__other--left">{item.label}</span>
                      <span className="item__other--right">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {checkSubdomainTNEX ? (
        <div>
          <div className="detail-info">
            <div
              className="title-click"
              onClick={() => {
                setIsShowInfoRevenue(false);
                setIsShowInfoContact(false);
                setHasServiceSuggestion(false);
                setIsShowInfoOther(false);
                setIsShowInfoDetail(!isShowInfoDetail);
                setIsShowStatusPhone(false);
                setIsShowStatusLoan(false);
                setIsShowStatusOnboard(false);
              }}
            >
              <span className="name">Thông tin chi tiết TNEX</span>
              <span className="icon-up-down">{isShowInfoDetail ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
            </div>

            {isShowInfoDetail && (
              <div className="list-info-detail">
                {listDetailInfoTNEX.map((item, idx) => (
                  <div key={idx} className="item__detail">
                    <h4 className="item__detail--left">{item.title}</h4>
                    <h4 className="item__detail--right">{item.name}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="detail-info">
            <div
              className="title-click"
              onClick={() => {
                setIsShowInfoRevenue(false);
                setIsShowInfoContact(false);
                setHasServiceSuggestion(false);
                setIsShowInfoOther(false);
                setIsShowInfoDetail(false);
                setIsShowStatusPhone(!isShowStatusPhone);
                setIsShowStatusLoan(false);
                setIsShowStatusOnboard(false);
              }}
            >
              <span className="name">Trạng thái cuộc gọi</span>
              <span className="icon-up-down">{isShowStatusPhone ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
            </div>

            {isShowStatusPhone &&
              (telesaleCallList && telesaleCallList.length > 0 ? (
                <div>
                  {telesaleCallList.map((item, index) =>
                    index === 0 || index === 1 ? (
                      <div
                        key={index}
                        style={{ border: "1px dashed var(--extra-color-20)", borderRadius: "5px", padding: "1rem", marginBottom: "1rem" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: 16, fontWeight: "600" }}>{index === 0 ? "Follow 1" : index === 1 ? "Follow 2" : ""}</span>
                          </div>
                          {index === telesaleCallList.length - 1 ? (
                            <div>
                              {editCallStatus ? (
                                <Tippy content={`Huỷ bỏ sửa thông tin Follow ${telesaleCallList.length === 1 ? "1" : "2"}`}>
                                  <div
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setEditCallStatus(false);
                                      setCallStatus(null);
                                    }}
                                  >
                                    <Icon name="Times" width={18} height={18} style={{ fill: "var(--error-color" }} />
                                  </div>
                                </Tippy>
                              ) : (
                                <Tippy content={`Sửa thông tin Follow ${telesaleCallList.length === 1 ? "1" : "2"}`}>
                                  <div
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setEditCallStatus(true);
                                      setCallStatus({ value: item.callStatus, label: item.callStatus });
                                    }}
                                  >
                                    <Icon name="Pencil" width={18} height={18} style={{ fill: "var(--primary-color" }} />
                                  </div>
                                </Tippy>
                              )}
                            </div>
                          ) : null}
                        </div>
                        {editCallStatus && callStatus && index === telesaleCallList.length - 1 ? (
                          <div style={{ marginBottom: "1rem" }}>
                            <SelectCustom
                              id=""
                              name=""
                              label={"Trạng thái cuộc gọi:"}
                              special={true}
                              fill={true}
                              value={callStatus}
                              options={optionCallStatus}
                              onChange={(e) => {
                                setCallStatus(e);
                                updateCallStatus(e, true, item.id);
                              }}
                              isAsyncPaginate={false}
                              placeholder="Trạng thái cuộc gọi"
                            />
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontSize: 14, fontWeight: "600" }}>
                              Trạng thái cuộc gọi: <span style={{ fontWeight: "400" }}>{item.callStatus}</span>
                            </span>
                          </div>
                        )}
                        <div>
                          <span style={{ fontSize: 14, fontWeight: "600" }}>
                            Thời gian thực hiện:{" "}
                            <span style={{ fontWeight: "400" }}>{item.callTime ? moment(item.callTime).format("DD/MM/YYYY HH:mm") : ""}</span>
                          </span>
                        </div>
                      </div>
                    ) : null
                  )}

                  {telesaleCallList.length === 1 && !editCallStatus ? (
                    <div style={{ border: "1px dashed var(--extra-color-20)", borderRadius: "5px", padding: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: "600" }}>{"Follow 2"}</span>
                      </div>
                      <div style={{ marginBottom: "1rem" }}>
                        <SelectCustom
                          id=""
                          name=""
                          label={"Trạng thái cuộc gọi:"}
                          special={true}
                          fill={true}
                          value={callStatus}
                          options={optionCallStatus}
                          onChange={(e) => {
                            setCallStatus(e);
                            updateCallStatus(e, true, null);
                          }}
                          isAsyncPaginate={false}
                          placeholder="Trạng thái cuộc gọi"
                          // additional={{
                          //   page: 1,
                          // }}
                          // loadOptionsPaginate={loadedOptionCodeService}
                        />
                      </div>
                    </div>
                  ) : null}

                  {(telesaleCallList.length === 2 || telesaleCallList[2]) && !editCallStatus ? (
                    <div style={{ border: "1px dashed var(--extra-color-20)", borderRadius: "5px", padding: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: "600" }}>{"Follow 3"}</span>
                      </div>
                      <div style={{ marginBottom: "1rem" }}>
                        <SelectCustom
                          id=""
                          name=""
                          label={"Trạng thái cuộc gọi:"}
                          special={true}
                          fill={true}
                          value={callStatus}
                          options={optionCallStatus}
                          onChange={(e) => {
                            setCallStatus(e);
                            updateCallStatus(e, false, null);
                          }}
                          isAsyncPaginate={false}
                          placeholder="Trạng thái cuộc gọi"
                          // additional={{
                          //   page: 1,
                          // }}
                          // loadOptionsPaginate={loadedOptionCodeService}
                        />
                      </div>
                      {telesaleCallList[2] ? (
                        <div>
                          <span style={{ fontSize: 14, fontWeight: "600" }}>
                            Thời gian thực hiện:{" "}
                            <span style={{ fontWeight: "400" }}>
                              {telesaleCallList[2].callTime ? moment(telesaleCallList[2].callTime).format("DD/MM/YYYY HH:mm") : null}
                            </span>
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                // <div style={{
                //   border: '1px dashed var(--extra-color-50)',
                //   borderRadius: '5px',
                //   alignContent:'center',
                //   justifyContent:'center',
                //   display:'flex',
                //   marginBottom: '2rem',
                //   padding: '1rem'
                // }}>
                //   <span style={{fontSize: 16, fontWeight: '500'}}>Chưa có cuộc gọi nào</span>
                // </div>
                <div style={{ border: "1px dashed var(--extra-color-20)", borderRadius: "5px", padding: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <span style={{ fontSize: 16, fontWeight: "600" }}>{"Follow 1"}</span>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <SelectCustom
                      id=""
                      name=""
                      label={"Trạng thái cuộc gọi:"}
                      special={true}
                      fill={true}
                      value={callStatus}
                      options={optionCallStatus}
                      onChange={(e) => {
                        setCallStatus(e);
                        updateCallStatus(e, true, null);
                      }}
                      isAsyncPaginate={false}
                      placeholder="Trạng thái cuộc gọi"
                      // additional={{
                      //   page: 1,
                      // }}
                      // loadOptionsPaginate={loadedOptionCodeService}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="detail-info">
            <div
              className="title-click"
              onClick={() => {
                setIsShowInfoRevenue(false);
                setIsShowInfoContact(false);
                setHasServiceSuggestion(false);
                setIsShowInfoOther(false);
                setIsShowInfoDetail(false);
                setIsShowStatusPhone(false);
                setIsShowStatusLoan(!isShowStatusLoan);
                setIsShowStatusOnboard(false);
              }}
            >
              <span className="name">Trạng thái khoản vay</span>
              <span className="icon-up-down">{isShowStatusLoan ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
            </div>

            {
              isShowStatusLoan &&
                cashStatusTNEX.map((item, index) => (
                  <div key={index} style={{ paddingLeft: "1.2rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ width: "30%" }}>
                      <span style={{ fontSize: 14, fontWeight: "600" }}>{item.product}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: "600", marginRight: 5 }}>:</span>
                    </div>
                    <div style={{ width: "65%" }}>
                      <span style={{ fontSize: 14, fontWeight: "400" }}>{item.status}</span>
                    </div>
                  </div>
                ))

              // <div style={{marginBottom: '1rem'}}>
              //   <SelectCustom
              //     id="code"
              //     name="code"
              //     // label={'Trạng thái khoản vay'}
              //     special={true}
              //     fill={true}
              //     value={ {value: 1, label: 'Đăng ký khoản vay'} }
              //     options={[
              //       {
              //         value: 1,
              //         label: 'Đăng ký khoản vay'
              //       },
              //       {
              //         value: 2,
              //         label: 'Phê duyệt thủ công'
              //       },
              //       {
              //         value: 3,
              //         label: 'Chờ ký hợp đồng'
              //       },
              //       {
              //         value: 4,
              //         label: 'Khoản vay đã giải ngân'
              //       },
              //       {
              //         value: 5,
              //         label: 'Từ chối cho đăng ký lại'
              //       },
              //       {
              //         value: 6,
              //         label: 'Từ chối không cho đăng ký lại'
              //       },
              //     ]}
              //     // onChange={(e) => handleChangeCodeService(e, idx)}
              //     isAsyncPaginate={false}
              //     placeholder=""
              //     // additional={{
              //     //   page: 1,
              //     // }}
              //     // loadOptionsPaginate={loadedOptionCodeService}
              // />
              // </div>
            }
          </div>

          <div className="detail-info">
            <div
              className="title-click"
              onClick={() => {
                setIsShowInfoRevenue(false);
                setIsShowInfoContact(false);
                setHasServiceSuggestion(false);
                setIsShowInfoOther(false);
                setIsShowInfoDetail(false);
                setIsShowStatusPhone(false);
                setIsShowStatusLoan(false);
                setIsShowStatusOnboard(!isShowStatusOnboard);
              }}
            >
              <span className="name">Trạng thái Onboard</span>
              <span className="icon-up-down">{isShowStatusOnboard ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
            </div>

            {
              isShowStatusOnboard &&
                onBoardStatusTNEX.map((item, index) => (
                  <div key={index} style={{ paddingLeft: "1.2rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ width: "30%" }}>
                      <span style={{ fontSize: 14, fontWeight: "600" }}>{item.product}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: "600", marginRight: 5 }}>:</span>
                    </div>
                    <div style={{ width: "65%" }}>
                      <span style={{ fontSize: 14, fontWeight: "400" }}>{item.status}</span>
                    </div>
                  </div>
                ))
              // <div style={{marginBottom: '1rem'}}>
              //   <SelectCustom
              //     id="code"
              //     name="code"
              //     // label={'Trạng thái khoản vay'}
              //     special={true}
              //     fill={true}
              //     value={ {value: 1, label: 'Chưa thực hiện eKyc'} }
              //     options={[
              //       {
              //         value: 1,
              //         label: 'Chưa thực hiện eKyc'
              //       },
              //       {
              //         value: 2,
              //         label: 'Đã Onboard thành công'
              //       },

              //     ]}
              //     // onChange={(e) => handleChangeCodeService(e, idx)}
              //     isAsyncPaginate={false}
              //     placeholder=""
              //     // additional={{
              //     //   page: 1,
              //     // }}
              //     // loadOptionsPaginate={loadedOptionCodeService}
              //   />
              // </div>
            }
          </div>

          <div className="detail-info" style={{ border: 0 }}>
            <div
              className="title-click"
              // onClick={() => {
              //   setIsShowInfoRevenue(false);
              //   setIsShowInfoContact(false);
              //   setHasServiceSuggestion(false);
              //   setIsShowInfoOther(false);
              //   setIsShowInfoDetail(false);
              //   setIsShowStatusPhone(false);
              //   setIsShowStatusLoan(false);
              //   setIsShowStatusOnboard(false);
              //   setIsRejectReason(!isRejectReason);
              // }}
            >
              <span className="name">Lý do từ chối</span>

              {checkSubdomainTNEX && contentReason ? (
                <Tippy content="Xoá lý do từ chối">
                  <span
                    className="icon-up-down"
                    onClick={() => {
                      setContentReason(null);
                      handleSaveInfoTNEX(data, 2, null, "LyDo");
                    }}
                  >
                    {<Icon name="Times" width={18} height={18} style={{ fill: "var(--error-color" }} />}
                  </span>
                </Tippy>
              ) : null}
              {/* <span className="icon-up-down">{isRejectReason ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span> */}
            </div>

            {/* {isRejectReason && ( */}
            <div>
              <SelectCustom
                id=""
                name=""
                // label={'Lý do từ chối'}
                special={true}
                fill={true}
                value={contentReason}
                options={[
                  {
                    value: "Đã vay được bên khác",
                    label: "Đã vay được bên khác",
                  },
                  {
                    value: "Quá tuổi hoặc chưa đủ tuổi",
                    label: "Quá tuổi hoặc chưa đủ tuổi",
                  },
                  {
                    value: "Xoay được tiền nên hết nhu cầu",
                    label: "Xoay được tiền nên hết nhu cầu",
                  },
                  {
                    value: "KH mặc định nợ xấu không vay được nên từ chối",
                    label: "KH mặc định nợ xấu không vay được nên từ chối",
                  },
                  {
                    value: "Thủ tục đăng ký phức tạp",
                    label: "Thủ tục đăng ký phức tạp",
                  },
                  {
                    value: "KH ấn nhầm hoặc không để lại nhu cầu",
                    label: "KH ấn nhầm hoặc không để lại nhu cầu",
                  },
                  {
                    value: "Không muốn vay qua app sợ lừa đảo",
                    label: "Không muốn vay qua app sợ lừa đảo",
                  },
                  {
                    value: "Lãi suất cao ",
                    label: "Lãi suất cao ",
                  },
                  {
                    value: "Tham khảo lãi suất",
                    label: "Tham khảo lãi suất",
                  },
                  {
                    value: "Sợ gọi tham chiếu người thân",
                    label: "Sợ gọi tham chiếu người thân",
                  },
                  {
                    value: "Thời hạn vay ngắn",
                    label: "Thời hạn vay ngắn",
                  },
                  {
                    value: "Hạn mức gói vay thấp",
                    label: "Hạn mức gói vay thấp",
                  },
                  {
                    value: "Thấy đánh giá app TNEX không tốt nên không vay",
                    label: "Thấy đánh giá app TNEX không tốt nên không vay",
                  },
                  {
                    value: "KH không kinh doanh sàn TMĐT",
                    label: "KH không kinh doanh sàn TMĐT",
                  },
                  {
                    value: "Shop không đủ thời gian kinh doanh",
                    label: "Shop không đủ thời gian kinh doanh",
                  },
                  {
                    value: "Shop không đủ doanh thu",
                    label: "Shop không đủ doanh thu",
                  },
                  {
                    value: "Tỉnh thành không hỗ trợ TBOSS",
                    label: "Tỉnh thành không hỗ trợ TBOSS",
                  },
                  {
                    value: "Tỉnh thành không hỗ trợ Cashloan",
                    label: "Tỉnh thành không hỗ trợ Cashloan",
                  },
                  {
                    value: "KH không đồng ý ủy quyền liên kết Shop",
                    label: "KH không đồng ý ủy quyền liên kết Shop",
                  },
                  {
                    value: "Đã có khoản giải ngân cashloan",
                    label: "Đã có khoản giải ngân cashloan",
                  },
                ]}
                onChange={(e) => {
                  setContentReason(e);
                  handleSaveInfoTNEX(data, 2, e.value, "LyDo");
                }}
                isAsyncPaginate={false}
                placeholder="Chọn lý do từ chối"
              />
              {/* <TextArea
                  name="note"
                  value={contentReason}
                  label=""
                  fill={true}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if(!_.isEqual(value, contentReasonFirst)){
                      handleSaveInfoTNEX(data, 2, value, 'LyDo');
                    }
                    
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    setContentReason(value);
                  }}
                  placeholder="Nhập lý do từ chối"
                /> */}
            </div>
            {/* )} */}
          </div>

          {/* <div style={{marginTop: '1rem', display:'flex', justifyContent:'flex-end'}}>
            <div className="button-update">
              <Button
                  color="primary"
                  // variant="outline"
                  // disabled={isSubmit}
                  onClick={(e) => {
                      // handleClearForm(true);
                  }}
                  >
                  Cập nhật
              </Button>
            </div>
          </div> */}
        </div>
      ) : null}

      <AddCustomerPersonModal
        onShow={showModalEdit}
        data={data}
        onHide={(reload, nextModal) => {
          if (reload) {
            callback();
          }
          setShowModalEdit(false);

          //Nếu true thì bật cái kia
          if (nextModal) {
            setShowModalAddCompany(true);
          }
        }}
      />

      <AddCustomerCompanyModal
        onShow={showModalAddCompany}
        data={data}
        onHide={(reload, nextModal) => {
          if (reload) {
            callback();
          }
          setShowModalAddCompany(false);

          if (nextModal) {
            setShowModalEdit(true);
          }
        }}
      />
      <AddCustomerViewerModal onShow={showModalAddViewer} dataCustomer={data} onHide={() => setShowModalAddViewer(false)} />
      <ScoreHistoryModal onShow={showModalHistory} dataCustomer={data} onHide={() => setShowModalHistory(false)} />
      <EditScoreModal onShow={showModalEditScore} dataCustomer={data} onHide={() => setShowModalEditScore(false)} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
