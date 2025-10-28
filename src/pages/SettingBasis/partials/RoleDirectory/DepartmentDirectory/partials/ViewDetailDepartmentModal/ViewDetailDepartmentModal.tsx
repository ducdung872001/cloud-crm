import React, { Fragment, useState, useEffect, useMemo } from "react";
import Loading from "components/loading";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IActionModal } from "model/OtherModel";
import { IViewDetailDepartmentModalProps } from "model/department/PropsModel";
import { IDepartmentResponse } from "model/department/DepartmentResponseModel";
import DepartmentService from "services/DepartmentService";
import { showToast } from "utils/common";
import "./ViewDetailDepartmentModal.scss";

export default function ViewDetailDepartmentModal(props: IViewDetailDepartmentModalProps) {
  const { onShow, onHide, idDepartment } = props;

  const [detailDepartment, setDetailDepartment] = useState<IDepartmentResponse>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //! đoạn này call API chi tiết một phòng ban
  const getDetailDepartment = async () => {
    setIsLoading(true);

    const response = await DepartmentService.detail(idDepartment);

    if (response.code === 0) {
      setDetailDepartment(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (idDepartment !== null && onShow) {
      getDetailDepartment();
    }
  }, [idDepartment, onShow]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide(false);
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-view-department">
        <div className="view-detail-department">
          {!isLoading && detailDepartment !== null ? (
            <Fragment>
              <ModalHeader title={`Danh sách chức danh - ${detailDepartment.name}`} toggle={() => onHide(false)} />
              <ModalBody>
                <div className="list-department">
                  {detailDepartment.jobTitles.length > 0 && (
                    <div className="title-focus">
                      <h3 className="name-focus">Tên chức danh</h3>
                      <h3 className="rank-focus">Cấp bậc</h3>
                    </div>
                  )}
                  {detailDepartment.jobTitles.length > 0 ? (
                    detailDepartment.jobTitles.map((item, idx) => (
                      <div key={idx} className="department-item">
                        <h4 className="name">{item.title}</h4>
                        <h4 className="rank">{item.position}</h4>
                      </div>
                    ))
                  ) : (
                    <SystemNotification description={<span>Phòng của bạn chưa có chức danh nào.</span>} type="no-item" />
                  )}
                </div>
              </ModalBody>
              <ModalFooter actions={actions} />
            </Fragment>
          ) : (
            <Loading />
          )}
        </div>
      </Modal>
    </Fragment>
  );
}
