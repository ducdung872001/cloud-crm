import React, { Fragment, useState, useEffect, useMemo } from "react";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IActionModal } from "model/OtherModel";
import { IViewEmployeeInDepartmentProps } from "model/department/PropsModel";
import { IEmployeeResponse } from "model/employee/EmployeeResponseModel";
import ImageThirdGender from "assets/images/third-gender.png";
import EmployeeService from "services/EmployeeService";
import { showToast } from "utils/common";
import "./ViewEmployeeInDepartmentModal.scss";

export default function ViewEmployeeInDepartmentModal(props: IViewEmployeeInDepartmentProps) {
  const { onShow, onHide, data, handleNextPage } = props;

  const [listEmployee, setListEmployee] = useState<IEmployeeResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getListEmployee = async () => {
    setIsLoading(true);

    const param = {
      limit: 30,
      departmentId: data.id,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const result = response.result.items || [];

      setListEmployee(result);
    } else {
      setListEmployee([]);
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (data && onShow) {
      getListEmployee();
    }
  }, [data, onShow]);

  const titles = ["STT", "Ảnh đại diện", "Tên nhân viên", "Số điện thoại"];

  const dataFormat = ["text-center", "text-center", "", ""];

  const dataMappingArray = (item: IEmployeeResponse, index: number) => [
    index + 1,
    <div key={item.id} className="avatar">
      <img src={item.avatar ? item.avatar : ImageThirdGender} alt={item.name} />
    </div>,
    item.name,
    item.phone,
  ];

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
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
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-view-employee">
        <ModalHeader title={`Nhân viên trong ${data?.name}`} toggle={() => onHide(false)} />
        <ModalBody>
          <div className="list-employee">
            {!isLoading && listEmployee && listEmployee.length > 0 ? (
              <BoxTable
                name="Nhân viên"
                titles={titles}
                items={listEmployee}
                dataMappingArray={(item, index) => dataMappingArray(item, index)}
                dataFormat={dataFormat}
                striped={true}
              />
            ) : isLoading ? (
              <Loading />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Hiện tại <strong>{data?.name}</strong> chưa có nhân viên nào <br />
                    Hãy thêm mới nhân viên rồi quay lại sau nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới nhân viên"
                action={() => {
                  handleNextPage();
                }}
              />
            )}
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
    </Fragment>
  );
}
