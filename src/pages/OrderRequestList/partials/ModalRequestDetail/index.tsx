import React, { Fragment, useState, useEffect, useMemo, useContext } from "react";
import _ from "lodash";
import { IAction, IActionModal } from "model/OtherModel";
import RadioList from "components/radio/radioList";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import ServiceService from "services/ServiceService";
import ProductService from "services/ProductService";
import ContactService from "services/ContactService";
import CustomerService from "services/CustomerService";
import ImageThirdGender from "assets/images/third-gender.png";
import { ContextType, UserContext } from "contexts/userContext";
import "./index.scss";
import WorkProjectService from "services/WorkProjectService";
import ImgPushCustomer from "assets/images/img-push.png";
import AddContactModal from "pages/Contact/partials/AddContactModal";
import AddProjectManagementModal from "pages/MiddleWork/partials/ProjectManagement/partials/AddProjectManagementModal";
import Button from "components/button/button";
import CampaignPipelineService from "services/CampaignPipelineService";
import CampaignService from "services/CampaignService";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import EmployeeService from "services/EmployeeService";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { formatCurrency } from "reborn-util";
import CampaignOpportunityService from "services/CampaignOpportunityService";

export default function ModalRequestDetail(props: any) {
  const { onShow, onHide, data, customerInfo } = props;

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: false,
            callback: () => {
              // handClearForm(idResponse ? true : false);
              onHide(false);
            },
          },
          // {
          //   title: "Tạo mới",
          //   type: "submit",
          //   color: "primary",
          //   // disabled:
          //   //   isSubmit || nxStep?.step_one || activeItemMenu == 1
          //   //     ? data?.id
          //   //       ? idResponse
          //   //         ? true
          //   //         : false
          //   //       : _.isEqual(formDataOne, valuesStepOne)
          //   //     : _.isEqual(formDataTwo, valueStepTwo),
          //   is_loading: isSubmit,
          // },
          ,
        ],
      },
    }),
    [data]
  );

  console.log("data modal request detail: ", data);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          onHide(false);
        }}
        className="modal-request-detail"
        size={"xl"}
      >
        <ModalHeader
          title={`Yêu cầu mua hàng: ${data && data[0] && data[0]?.beautySalonName ? data[0]?.beautySalonName : ""}`}
          toggle={() => {
            onHide(false);
          }}
        />
        <ModalBody>
          <div className="list-request">
            <div className="customer-info">
              <div className="item-info">
                <div className="label">Tên khách hàng:</div>
                <div className="value">{customerInfo?.name || "N/A"}</div>
              </div>
              <div className="item-info">
                <div className="label">Số điện thoại:</div>
                <div className="value">{customerInfo?.phone || "N/A"}</div>
              </div>
              <div className="item-info">
                <div className="label">Email:</div>
                <div className="value">{customerInfo?.email || "N/A"}</div>
              </div>
            </div>
            {data?.map((item: any, index: number) => (
              <div className="item-request" key={index}>
                <div className="avatar">
                  <img src={item.avatar || ImageThirdGender} alt={item.name} />
                  <div className="name">{item.name.length > 100 ? `${item.name.slice(0, 100)}...` : item.name}</div>
                </div>
                <div className="info">
                  <div className="request-info">
                    <div className="quantity item-info">Số lượng: {item.qty}</div>
                    <div className="price item-info">Đơn giá: {formatCurrency(item.price)}</div>
                    <div className="total item-info">Tổng: {formatCurrency(item.price * item.qty)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="total-price">
            <div className="item">
              <div className="label">Voucher</div>
              <div className="value">0 %</div>
            </div>
            <div className="item">
              <div className="label">Tổng cộng</div>
              <div className="value">{formatCurrency(data?.reduce((sum: number, item: any) => sum + item.price * item.qty, 0) || 0)}</div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
    </Fragment>
  );
}
