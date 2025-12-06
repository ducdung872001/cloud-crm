import React, { Fragment, useMemo, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import SelectCustom from "components/selectCustom/selectCustom";
import { IActionModal } from "model/OtherModel";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";

interface IAddOpportunityAllocationProps {
  onShow: boolean;
  onHide: (reload?: boolean) => void;
}

export default function AddOpportunityAllocation(props: IAddOpportunityAllocationProps) {
  const { onShow, onHide } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [dataEmployee, setDataEmployee] = useState(null);

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
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

  //* đoạn này xử lý vấn đề hiển thị hình ảnh người quản lý
  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              onHide(false);
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !dataEmployee,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-opportunity"
      >
        <form className="form-opportunity-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Giao cơ hội" toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  id="employeeId"
                  name="employeeId"
                  label="Nhân viên"
                  options={[]}
                  fill={true}
                  required={true}
                  value={dataEmployee}
                  onChange={(e) => handleChangeValueEmployee(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn nhân viên"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEmployee}
                  formatOptionLabel={formatOptionLabelEmployee}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
