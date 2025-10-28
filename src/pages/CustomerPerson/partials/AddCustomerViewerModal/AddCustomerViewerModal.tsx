import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { IActionModal } from "model/OtherModel";
import { IEmployeeResponse } from "model/employee/EmployeeResponseModel";
import { IAddCustomerViewerModalProps, IAddCustomerViewerRequestModel } from "model/customer/CustomerRequestModel";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import Checkbox from "components/checkbox/checkbox";
import SearchBox from "components/searchBox/searchBox";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ContextType, UserContext } from "contexts/userContext";
import { showToast } from "utils/common";
import ImgThirdGender from "assets/images/third-gender.png";
import EmployeeService from "services/EmployeeService";
import CustomerService from "services/CustomerService";
import "./AddCustomerViewerModal.scss";

export default function AddCustomerViewerModal(props: IAddCustomerViewerModalProps) {
  const { onShow, onHide, dataCustomer } = props;

  const { name, id, avatar } = useContext(UserContext) as ContextType;

  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [lstEmployee, setLstEmployee] = useState<IEmployeeResponse[]>([]);
  const [idEmployee, setIdEmployee] = useState<number>(null);

  const [params, setParams] = useState({
    name: "",
    page: 1,
    limit: 20,
  });

  const getLstEmployee = async (param) => {
    setIsLoadingEmployee(true);

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const result = response.result;
      setHasMore(result.loadMoreAble);

      const newData = params.page === 1 ? [] : lstEmployee;

      (result.items || []).map((item) => {
        newData.push(item);
      });

      setLstEmployee(newData);

      if (+result.total === 0 && params.name !== "") {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingEmployee(false);
  };

  useEffect(() => {
    if (onShow) {
      getLstEmployee(params);
    }
  }, [params, onShow]);

  // scroll api employee
  const handleScroll = (e) => {
    if (isLoadingEmployee) {
      return;
    }

    const scrollBottom = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;

    if (scrollBottom && hasMore) {
      setParams({ ...params, page: params.page + 1 });
    }
  };

  const [isAddViewerCustomer, setIsAddViewerCustomer] = useState<boolean>(false);

  // check employee được chọn
  const handCheckEmployee = (data) => {
    if (!isAddViewerCustomer) {
      setIdEmployee(data.id);
    }
  };

  // change employee được chọn
  const handChangeEmployee = (data) => {
    if (!isAddViewerCustomer) {
      setIdEmployee(data.id);
    }
  };

  // khi mà đã có id của nhân viên và có id của nhân viên và id của khách hàng thì call api thêm người xem
  const handAddViewerCustomer = async (idEmployee, idCustomer) => {
    if (!idEmployee || !idCustomer) return;

    const body: IAddCustomerViewerRequestModel = {
      id: 0,
      employeeId: idEmployee,
      customerId: idCustomer,
    };

    setIsAddViewerCustomer(true);

    const response = await CustomerService.addCustomerViewer(body);

    if (response.code === 0) {
      showToast("Thêm người xem thành công", "success");
      getLstReviewerCustomer(idCustomer);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsAddViewerCustomer(false);
  };

  useEffect(() => {
    if (onShow && idEmployee && dataCustomer?.id) {
      handAddViewerCustomer(idEmployee, dataCustomer?.id);
    }
  }, [onShow, dataCustomer, idEmployee]);

  // đoạn này xử lý lấy ra danh sách khách hàng
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [lstViewerCustomer, setLstViewerCustomer] = useState([]);

  const getLstReviewerCustomer = async (id: number) => {
    if (!id) return;

    setIsLoadingCustomer(true);

    const response = await CustomerService.lstCustomerViewer(id);

    if (response.code === 0) {
      const result = response.result;

      if (result.length) {
        // setLstViewerCustomer(
        //   result.filter((item) => {
        //     item.employeeId != id || item.employeeId != dataCustomer.employeeId;
        //   })
        // );
        setLstViewerCustomer(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (dataCustomer?.id && onShow) {
      getLstReviewerCustomer(dataCustomer?.id);
    }
  }, [dataCustomer, onShow]);

  // xóa đi 1 người xem
  const handleRemoveCustomerViewer = async (id: number) => {
    const response = await CustomerService.deleteCustomerViewer(id);

    if (response.code === 0) {
      showToast("Xóa người xem thành công", "success");
      getLstReviewerCustomer(dataCustomer?.id);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isAddViewerCustomer,
            callback: () => {
              onHide();
              setIdEmployee(null);
            },
          },
        ],
      },
    }),
    [isAddViewerCustomer]
  );

  const checkDuplicateDataEmployee = lstEmployee
    .filter((item) => item.userId !== id)
    .filter((item) => item.id !== dataCustomer?.employeeId)
    .filter((item) => {
      return !lstViewerCustomer.some((el) => el.employeeId === item.id);
    });

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} size="lg" toggle={() => onHide()} className="modal-add-viewer">
        <div className="form__add--viewer">
          <ModalHeader title="Thêm người xem" toggle={() => onHide()} />
          <ModalBody>
            <div className="box__viewer--lst">
              <div className="add__viewers">
                <div className="search-employee">
                  <SearchBox params={params} name="người xem" updateParams={(paramsNew) => setParams(paramsNew)} />
                </div>
                <div className="box-employee">
                  {checkDuplicateDataEmployee && checkDuplicateDataEmployee.length > 0 ? (
                    <div className="lst__employee" onScroll={handleScroll}>
                      {checkDuplicateDataEmployee.map((item, idx) => {
                        return (
                          <div
                            key={idx}
                            className={`item-employee ${item.id === idEmployee ? "active-employee" : ""} ${isAddViewerCustomer ? "cursor-none" : ""}`}
                            onClick={() => handCheckEmployee(item)}
                          >
                            <div className="check-add">
                              <Checkbox checked={item.id === idEmployee} onChange={() => handChangeEmployee(item)} />
                            </div>
                            <div className="info-employee">
                              <div className="__left">
                                <Image src={item.avatar || ImgThirdGender} alt={item.name} />
                              </div>
                              <div className="__right">
                                <h4 className="name">{item.name}</h4>
                                <span className="department">{item.departmentName}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : isLoadingEmployee && params.page === 1 ? (
                    <Loading />
                  ) : (
                    <Fragment>
                      {isNoItem ? (
                        <SystemNotification
                          description={
                            <span>
                              Không có dữ liệu trùng khớp.
                              <br />
                              Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                            </span>
                          }
                          type="no-result"
                        />
                      ) : (
                        <SystemNotification
                          description={
                            <span>
                              Hiện tại bạn chưa có nhân viên nào. <br />
                              Hãy thêm mới nhân viên trong phần cài đặt cơ sở nhé!
                            </span>
                          }
                          type="no-item"
                        />
                      )}
                    </Fragment>
                  )}
                </div>
              </div>
              <div className="separator" />
              <div className="box__viewer">
                <div className="title">Danh sách người xem</div>

                {lstViewerCustomer && lstViewerCustomer.length >= 0 ? (
                  <div className="lst__viewers">
                    <div className="item-viewer">
                      <div className="item-viewer--left">
                        <div className="avatar-viewer">
                          <Image src={avatar || ImgThirdGender} alt={name} />
                        </div>
                        <div className="dept-viewer">
                          <h4 className="name">{name}</h4>
                          <span className="department">
                            {dataCustomer && lstEmployee.length > 0 && lstEmployee.find((item) => item.userId === id)?.departmentName}
                          </span>
                        </div>
                      </div>
                    </div>
                    {dataCustomer &&
                      dataCustomer.employeeId &&
                      lstEmployee.length > 0 &&
                      id !== lstEmployee.find((item) => item.id === dataCustomer.employeeId)?.userId && (
                        <div className="item-viewer">
                          <div className="item-viewer--left">
                            <div className="avatar-viewer">
                              <Image src={dataCustomer?.employeeAvatar || ImgThirdGender} alt={dataCustomer?.employeeName} />
                            </div>
                            <div className="dept-viewer">
                              <h4 className="name">{dataCustomer?.employeeName}</h4>
                              <span className="department">
                                {dataCustomer &&
                                  lstEmployee.length > 0 &&
                                  lstEmployee.find((item) => item.id === dataCustomer.employeeId)?.departmentName}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    {lstViewerCustomer.map((item, idx) => {
                      return (
                        <div key={idx} className="item-viewer">
                          <div className="item-viewer--left">
                            <div className="avatar-viewer">
                              <Image src={item.employeeAvatar || ImgThirdGender} alt={item.employeeName} />
                            </div>
                            <div className="dept-viewer">
                              <h4 className="name">{item.employeeName}</h4>
                              <span className="department">{item.departmentName}</span>
                            </div>
                          </div>
                          <div className="item-viewer--right" onClick={() => handleRemoveCustomerViewer(item.id)}>
                            <Icon name="Trash" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : isLoadingCustomer ? (
                  <Loading />
                ) : (
                  ""
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
