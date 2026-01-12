import React, { Fragment, useState, useEffect } from "react";
import Loading from "components/loading";
import Icon from "components/icon";
import { IUpdatePeopleInvolvedProps } from "model/workOrder/PropsModel";
import { IEmployeeResponse } from "model/employee/EmployeeResponseModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { IUpdateParticipantRequestModel, IUpdateRelatedCustomerRequestModel } from "model/workOrder/WorkOrderRequestModel";
import WorkOrderService from "services/WorkOrderService";
import ImageThirdGender from "assets/images/third-gender.png";
import { showToast } from "utils/common";
import AddParticipantModal from "./partials/AddParticipantModal/AddParticipantModal";
import AddRelatedCustomerModal from "./partials/AddRelatedCustomerModal/AddRelatedCustomerModal";
import "./UpdatePeopleInvolved.scss";

export default function UpdatePeopleInvolved(props: IUpdatePeopleInvolvedProps) {
  const { data } = props;

  //! đoạn này xử lý lấy ra danh sách người giao việc, người nhận việc
  //  người liên quan, khách hàng liên quan
  const [jobAssign, setJobAssign] = useState<IEmployeeResponse>(null);
  const [jobRecipient, setJobRecipient] = useState<IEmployeeResponse>(null);

  const [participants, setParticipants] = useState<IEmployeeResponse[]>([]);
  const [listIdParticipant, setListIdParticipant] = useState<number[]>([]);
  const [showModalAddParticipant, setShowModalAddParticipant] = useState<boolean>(false);

  const [relatedCustomers, setRelatedCustomers] = useState<ICustomerResponse[]>([]);
  const [listIdRelatedCustomer, setListIdRelatedCustomer] = useState<number[]>([]);
  const [showModalAddRelatedCustomer, setShowModalAddRelatedCustomer] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getListRelatedPeople = async () => {
    setIsLoading(true);

    const response = await WorkOrderService.relatedPeople(data.id);

    if (response.code === 0) {
      const result = response.result;
      setJobAssign(result.manager);
      setJobRecipient(result.employee);
      setParticipants(result.participants || []);
      setRelatedCustomers(result.customers || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    getListRelatedPeople();
  }, [data]);

  //! đoạn này xử lý khi mà đã có danh sách người tham gia rồi
  //  thì lấy id của những người tham gia rồi gửi đi nếu muốn cập nhật
  useEffect(() => {
    const result = participants.map((item) => item?.id);
    setListIdParticipant(result);
  }, [participants]);

  //! đoạn này xử lý vấn đề xóa đi 1 người tham gia trong nhóm
  const handleRemoveParticipant = (id) => {
    //? đoạn này dùng toán tử (...) trong ES6 để tránh modify trực tiếp mảng ban đầu
    const newParticipants = [...participants];
    const result = newParticipants.filter((item) => item?.id !== id);
    handleRemoveOneParticipant(result);
    setParticipants(result);
  };

  //! đoạn này call API xóa đi 1 người tham gia
  const handleRemoveOneParticipant = async (result) => {
    const takeIdParticipant = result.map((item) => item.id);
    const body: IUpdateParticipantRequestModel = {
      id: data.id,
      participants: JSON.stringify(takeIdParticipant),
    };

    const response = await WorkOrderService.updateParticipant(body);

    if (response.code === 0) {
      showToast("Xóa người tham gia thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //! đoạn này xử lý khi mà đã có danh sách khách hàng liên quan rồi
  //  thì lấy id của những khách hàng liên quan rồi gửi đi nếu muốn cập nhật
  useEffect(() => {
    const result = relatedCustomers.map((item) => item?.id);
    setListIdRelatedCustomer(result);
  }, [relatedCustomers]);

  //! đoạn này xử lý vấn đề xóa đi 1 khách hàng liên quan trong nhóm
  const handleRemoveRelatedCustomer = (id) => {
    //? đoạn này dùng toán tử (...) trong ES6 để tránh modify trực tiếp mảng ban đầu
    const newRelatedCustomer = [...relatedCustomers];
    const result = newRelatedCustomer.filter((item) => item?.id !== id);
    handleRemoveOneRelatedCustomer(result);
    setRelatedCustomers(result);
  };

  //! đoạn này call API xóa đi 1 người tham gia
  const handleRemoveOneRelatedCustomer = async (result) => {
    const takeIdRelatedCustomer = result.map((item) => item.id);
    const body: IUpdateRelatedCustomerRequestModel = {
      id: data.id,
      customers: JSON.stringify(takeIdRelatedCustomer),
    };

    const response = await WorkOrderService.updateRelatedCustomer(body);

    if (response.code === 0) {
      showToast("Xóa khách hàng liên quan thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <Fragment>
      <div className="update__people">
        {!isLoading ? (
          <div className="view-info">
            <div className="view-jobassign">
              <label className="label">Người giao việc</label>
              <div className="info-jobassign">
                <img src={jobAssign?.avatar ? jobAssign?.avatar : ImageThirdGender} alt={jobAssign?.name} />
                <div className="info-manager">
                  <span className="name">{jobAssign?.name ?? "Chưa có"}</span>
                  <span className="belong-department">{jobAssign?.departmentName ?? "Chưa có"}</span>
                </div>
              </div>
            </div>
            <Icon name="ChevronDoubleRight" />
            <div className="view-recipient">
              <label className="label">Người nhận việc</label>
              <div className="info-recipient">
                <img src={jobRecipient?.avatar ? jobRecipient?.avatar : ImageThirdGender} alt={jobRecipient?.name} />
                <div className="info-employee">
                  <span className="name">{jobRecipient?.name ?? "Chưa có"}</span>
                  <span className="belong-department">{jobRecipient?.departmentName ?? "Chưa có"}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Loading />
        )}

        {/* Lấy danh sách người tham gia */}
        <div className="list__participants">
          <h4 className="title-participant">Người tham gia</h4>
          <div className="wrapper__add--participant">
            <div className="add-participant" onClick={() => setShowModalAddParticipant(true)}>
              <Icon name="PlusCircleFill" />
              Thêm người tham gia
            </div>
            {!isLoading && participants && participants.length > 0 ? (
              participants.map((item, idx) => (
                <div key={idx} className="participant-item">
                  <div className="info-participant">
                    <img src={item?.avatar ? item?.avatar : ImageThirdGender} alt={item?.name} />
                    {item?.name}
                  </div>
                  <span
                    title="Xóa"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveParticipant(item?.id);
                    }}
                    className="remove-participant"
                  >
                    <Icon name="Trash" />
                  </span>
                </div>
              ))
            ) : (
              <span className="notification-participant">Bạn chưa có người tham gia nào!</span>
            )}
          </div>
        </div>

        {/* Lấy danh sách khách hàng liên quan */}
        <div className="list__related--customers">
          <h4 className="title-related--customers">Khách hàng liên quan</h4>
          <div className="wrapper__add-related--customers">
            <div className="add-related--customers" onClick={() => setShowModalAddRelatedCustomer(true)}>
              <Icon name="PlusCircleFill" />
              Thêm khách hàng liên quan
            </div>
            {!isLoading && relatedCustomers && relatedCustomers.length > 0 ? (
              relatedCustomers.map((item, idx) => (
                <div key={idx} className="related__customers--item">
                  <div className="info__related--customers">
                    <img src={item?.avatar ? item?.avatar : ImageThirdGender} alt={item?.name} />
                    {item?.name}
                  </div>
                  <span
                    title="Xóa"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveRelatedCustomer(item?.id);
                    }}
                    className="remove__related--customers"
                  >
                    <Icon name="Trash" />
                  </span>
                </div>
              ))
            ) : (
              <span className="notification__related--customers">Bạn chưa có khách hàng liên quan nào!</span>
            )}
          </div>
        </div>
      </div>
      <AddParticipantModal
        onShow={showModalAddParticipant}
        idWork={data.id}
        listIdParticipant={listIdParticipant}
        onHide={(reload) => {
          if (reload) {
            getListRelatedPeople();
          }
          setShowModalAddParticipant(false);
        }}
      />
      <AddRelatedCustomerModal
        onShow={showModalAddRelatedCustomer}
        idWork={data.id}
        listIdRelatedCustomer={listIdRelatedCustomer}
        onHide={(reload) => {
          if (reload) {
            getListRelatedPeople();
          }
          setShowModalAddRelatedCustomer(false);
        }}
      />
    </Fragment>
  );
}
