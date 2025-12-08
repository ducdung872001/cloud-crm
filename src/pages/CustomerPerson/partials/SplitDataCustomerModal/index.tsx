import React, { Fragment, useState, useMemo, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import CustomerService from "services/CustomerService";
import RadioList from "components/radio/radioList";
import "./index.scss";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";

export default function SplitDataCustomerModal(props: any) {
  const { onShow, onHide, data } = props;
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [type, setType] = useState("1");
  const [quantityData, setQuantityData] = useState(null);

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
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
    // setCheckFieldEmployee(false);
    // setDataEmployee(e);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    // if(!valueMA){
    //     setCheckFieldMA(true);
    //     return;
    // }

    const body = {
        // maId: valueMA.value,
        // customerIds: data
    }

    const response = await CustomerService.addCustomerMA(body);

    if (response.code === 0) {
      showToast("Thêm khách hàng vào chương trình MA thành công", "success");
      handleClearForm(true);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsSubmit(false);
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setType("1");
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
                handleClearForm(false)
            //   !valueMA ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Áp dụng",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            // || !valueMA,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleClearForm(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal_split-data-customer"
      >
        <form className="form_split-data-customer" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Chia dữ liệu khách hàng`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <RadioList
                  options={[
                    { value: "1", label: "Chia cố định" },
                    { value: "2", label: "Chia đều" },
                  ]}
                  title="Cách thực hiện:"
                  name="type"
                  value={type}
                  onChange={(e) => {
                    const value = e.target.value;
                    setType(value);
                    if(value === "2"){
                      setQuantityData(null);
                    }
                  }}
                />
              </div>

              {type === "1" ? 
                <div className="form-group">
                  <NummericInput
                    label={'Số lượng khách hàng:'}
                    value={quantityData}
                    fill={true}
                    required={true}
                    placeholder='Nhập số lượng'
                    thousandSeparator
                    onValueChange={(e) => setQuantityData(e.floatValue)}
                  />
                </div>
              : null}

              <div className="container-list-employee">
                <div className="form-group">
                  <SelectCustom
                    id="employeeId"
                    name="employeeId"
                    label="Danh sách nhân viên"
                    options={[]}
                    fill={true}
                    // value={valueMA}
                    required={true}
                    // onChange={(e) => handleChangeValueMA(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn nhân viên"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionEmployee}
                    formatOptionLabel={formatOptionLabelEmployee}
                  // error={checkFieldEmployee}
                  // message="Nhân viên không được để trống"
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
