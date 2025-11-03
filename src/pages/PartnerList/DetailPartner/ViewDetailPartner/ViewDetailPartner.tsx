import React, { useState, useEffect, Fragment, useMemo } from "react";
import moment from "moment";
import Tippy from "@tippyjs/react";
import parser from "html-react-parser";
import { useNavigate } from "react-router-dom";
import SwiperCore, { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ThirdGender from "assets/images/third-gender.png";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";
import AddCustomerCompanyModal from "pages/CustomerPerson/partials/AddCustomerCompanyModal";
import { convertToPrettyNumber, showToast } from "utils/common";
import AddCustomerViewerModal from "pages/CustomerPerson/partials/AddCustomerViewerModal/AddCustomerViewerModal";
import { formatCurrency, getDomain } from "reborn-util";
import ImageError from "assets/images/error.png";

import "tippy.js/animations/scale-extreme.css";
import "./ViewDetailPartner.scss";
import _ from "lodash";
import PartnerService from "services/PartnerService";

SwiperCore.use([Navigation]);

export default function ViewDetailPartner(props: any) {

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));

  const { data, callback, setDeleteSignal, deleteSignal } = props;  
  
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
  // console.log('mapCustomerAttribute', mapCustomerAttribute);
  const [dataCustomerAttribute, setDataCustomerAttribute] = useState<any>(null);

//   useEffect(() => {
//     if(data){
//       const listNewItem = [];
//       const customerExtraInfos = data.lstCustomerExtraInfo;
//       const customerAttribute = data.mapCustomerAttribute;
//       Object.entries(customerAttribute).map((lstCustomerAttribute: any, key: number) => {
//         (lstCustomerAttribute[1] || []).map((customerAttribute, index: number) => {
//           if(customerAttribute.parentId ){
//             const newItem = {
//               // attributeId: customerAttribute.id,
//               attributeName: customerAttribute.name,
//               fieldName: customerAttribute.fieldName,
//               // dataType: customerAttribute.datatype,
//               attributeValue: getContractAttributeValue(customerAttribute.id, customerAttribute.datatype, customerExtraInfos)
//             }
            
//             listNewItem.push(newItem);
//           }
//         })
//       })
//       setDataCustomerAttribute(listNewItem);
//     }
//   }, [data])

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

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const onDelete = async (id: number) => {
    if (!id) return;

    const response = await PartnerService.delete(id);
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

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa đối tác</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa đối tác {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
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

    const response = await PartnerService.viewPhone(id);
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

    const response = await PartnerService.viewEmail(id);
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


  return (
    <div className="view-detail-partner">
      <div className="basic-infor">
        <div className="title-info">
          <span className="title">Thông tin cơ bản</span>
          <div className="action-update">
            {/* <div className="add-person" onClick={() => setShowModalAddViewer(true)}>
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
            </div> */}
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
              {valueShowPhone ? valueShowPhone : (data.phoneUnmasked || data.phoneMasked)}
              {data.phoneMasked && !data.phoneUnmasked?
                <span className="icon" onClick={() => setIsShowPhone(!isShowPhone)}>
                  <Icon name={isShowPhone ? "EyeSlash" : "Eye"} />
                </span>
                : null
              }
               
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
                  <Icon name={isShowEmail ? "EyeSlash" : "Eye" } />
                </span>
              )}
            </span>
          </div>
         
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
      </div>

      {/* <AddCustomerPersonModal
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
      /> */}
      <AddCustomerViewerModal onShow={showModalAddViewer} dataCustomer={data} onHide={() => setShowModalAddViewer(false)} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
