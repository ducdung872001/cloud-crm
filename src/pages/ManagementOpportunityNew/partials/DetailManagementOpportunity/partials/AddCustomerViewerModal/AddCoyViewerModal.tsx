import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { IActionModal } from "model/OtherModel";
import { IEmployeeResponse } from "model/employee/EmployeeResponseModel";
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
import "./AddCoyViewerModal.scss";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import { IAddCoyViewerRequestModel } from "model/campaignOpportunity/CampaignOpportunityRequestModel";

export default function AddCoyViewerModal(props: any) {
  const { onShow, onHide, dataOpportunity } = props;

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

  const [isAddViewerCoy, setIsAddViewerCoy] = useState<boolean>(false);

  // check employee được chọn
  const handCheckEmployee = (data) => {
    if (!isAddViewerCoy) {
      setIdEmployee(data.id);
    }
  };

  // change employee được chọn
  const handChangeEmployee = (data) => {
    if (!isAddViewerCoy) {
      setIdEmployee(data.id);
    }
  };

  // khi mà đã có id của nhân viên và có id của nhân viên và id của khách hàng thì call api thêm người xem
  const handAddViewerCoy = async (idEmployee, idOpportunity) => {
    if (!idEmployee || !idOpportunity) return;

    const body: IAddCoyViewerRequestModel = {
      id: 0,
      employeeId: idEmployee,
      campaignOpportunityId: idOpportunity,
    };

    setIsAddViewerCoy(true);

    const response = await CampaignOpportunityService.addCoyViewer(body);

    if (response.code === 0) {
      showToast("Thêm người xem thành công", "success");
      getLstReviewerCoy(idOpportunity);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsAddViewerCoy(false);
  };

  useEffect(() => {
    if (onShow && idEmployee && dataOpportunity?.id) {
      handAddViewerCoy(idEmployee, dataOpportunity?.id);
    }
  }, [onShow, dataOpportunity, idEmployee]);

  // đoạn này xử lý lấy ra danh sách khách hàng
  const [isLoadingCoy, setIsLoadingCoy] = useState<boolean>(false);
  const [lstViewerCoy, setLstViewerCoy] = useState([]);

  const getLstReviewerCoy = async (id: number) => {
    if (!id) return;

    setIsLoadingCoy(true);

    const response = await CampaignOpportunityService.lstCoyViewer(id);

    if (response.code === 0) {
      const result = response.result;
      setLstViewerCoy(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingCoy(false);
  };

  useEffect(() => {
    if (dataOpportunity?.id && onShow) {
      getLstReviewerCoy(dataOpportunity?.id);
    }
  }, [dataOpportunity, onShow]);

  // xóa đi 1 người xem
  const handleRemoveCoyViewer = async (id: number) => {
    const response = await CampaignOpportunityService.deleteCoyViewer(id);

    if (response.code === 0) {
      showToast("Xóa người xem thành công", "success");
      getLstReviewerCoy(dataOpportunity?.id);
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
            disabled: isAddViewerCoy,
            callback: () => {
              onHide();
              setIdEmployee(null);
            },
          },
        ],
      },
    }),
    [isAddViewerCoy]
  );

  const checkDuplicateDataEmployee = lstEmployee
    .filter((item) => item.userId !== id)
    .filter((item) => item.id !== dataOpportunity?.employeeId)
    .filter((item) => {
      return !lstViewerCoy.some((el) => el.employeeId === item.id);
    });

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} size="lg" toggle={() => onHide()} className="modal-add-viewer-coy">
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
                            className={`item-employee ${item.id === idEmployee ? "active-employee" : ""} ${isAddViewerCoy ? "cursor-none" : ""}`}
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

                {lstViewerCoy && lstViewerCoy.length >= 0 ? (
                  <div className="lst__viewers">
                    <div className="item-viewer">
                      <div className="item-viewer--left">
                        <div className="avatar-viewer">
                          <Image src={avatar || ImgThirdGender} alt={name} />
                        </div>
                        <div className="dept-viewer">
                          <h4 className="name">{name}</h4>
                          <span className="department">
                            {dataOpportunity && lstEmployee.length > 0 && lstEmployee.find((item) => item.userId === id)?.departmentName}
                          </span>
                        </div>
                      </div>
                    </div>
                    {dataOpportunity &&
                      dataOpportunity.employeeId &&
                      lstEmployee.length > 0 &&
                      id !== lstEmployee.find((item) => item.id === dataOpportunity.employeeId)?.userId && (
                        <div className="item-viewer">
                          <div className="item-viewer--left">
                            <div className="avatar-viewer">
                              <Image src={dataOpportunity?.employeeAvatar || ImgThirdGender} alt={dataOpportunity?.employeeName} />
                            </div>
                            <div className="dept-viewer">
                              <h4 className="name">{dataOpportunity?.employeeName}</h4>
                              <span className="department">
                                {dataOpportunity &&
                                  lstEmployee.length > 0 &&
                                  lstEmployee.find((item) => item.id === dataOpportunity.employeeId)?.departmentName}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    {lstViewerCoy.map((item, idx) => {
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
                          <div className="item-viewer--right" onClick={() => handleRemoveCoyViewer(item.id)}>
                            <Icon name="Trash" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : isLoadingCoy ? (
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
