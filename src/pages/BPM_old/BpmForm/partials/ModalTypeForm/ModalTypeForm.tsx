import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import RadioList from "components/radio/radioList";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId } from "reborn-util";
import ContractEformService from "services/ContractEformService";
import { showToast } from "utils/common";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";

import "./ModalTypeForm.scss";

export default function ModalTypeForm({ onShow, onHide, data, callBack }) {
  const formRef = useRef(null);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [lstEform, setLstEform] = useState([]);
  const [isLoadingLstEform, setIsLoadingLstEform] = useState<boolean>(false);

  const onSelectOpenEform = async () => {
    setIsLoadingLstEform(true);

    const param = {
      limit: 100,
    };

    const response = await ContractEformService.list(param);

    if (response.code === 0) {
      const result = [...response.result.items].map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });

      setLstEform(result);
    }

    setIsLoadingLstEform(false);
  };

  const [listEformAttribute, setListEformAttribute] = useState([]);
  const [isLoadingEformAttribute, setIsLoadingEformAttribute] = useState<boolean>(false);

  const getListEformAttribute = async (eformId) => {
    setIsLoadingEformAttribute(true);
    const params = {
      limit: 1000,
      eformId: eformId,
    };

    const response = await ContractEformService.listEformExtraInfo(params);

    if (response.code === 0) {
      const result = response.result;
      setListEformAttribute(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoadingEformAttribute(false);
  };

  const values = useMemo(
    () => ({
      eformId: null,
    }),
    [onShow, data]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if (formData.eformId) {
      getListEformAttribute(formData.eformId);
    }
  }, [formData.eformId]);

  const handleChangeValueEform = (e) => {
    const value = e.value;
    setFormData({ ...formData, eformId: value });
  };

  /**
   * Trả về loại control theo kiểu dữ liệu tương ứng
   */
  const getControlByType = (contractAttribute) => {
    let CustomControl = (
      <Input
        id={`Id${contractAttribute.id}`}
        label={contractAttribute.name}
        fill={true}
        // value={getContractAttributeValue(contractAttribute.id)}
        // onChange={(e) => updateContractAttribute(contractAttribute.id, e.target.value)}
        placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
        required={!!contractAttribute.required}
        readOnly={!!contractAttribute.readonly}
        disabled={true}
      />
    );

    switch (contractAttribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={contractAttribute.name}
            name={contractAttribute.name}
            // value={getContractAttributeValue(contractAttribute.id)}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            fill={true}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            // onChange={(e) => updateContractAttribute(contractAttribute.id, e.target.value)}
            maxLength={459}
            disabled={true}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={contractAttribute.name}
            name={contractAttribute.name}
            fill={true}
            disabled={true}
            required={!!contractAttribute.required}
            // value={getContractAttributeValue(contractAttribute.id)}
            thousandSeparator={true}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            // decimalScale={getDecimalScale(contractAttribute.attributes)}
            // onChange={(e) => {
            //   const value = e.target.value;
            //   let valueNum = value?.replace(/,/g, "");
            //   updateContractAttribute(contractAttribute.id, valueNum);
            // }}
          />
        );
        break;
      case "dropdown":
        CustomControl = (
          <SelectCustom
            name={contractAttribute.name}
            label={contractAttribute.name}
            fill={true}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            // error={validateFieldPipeline}
            // message="Loại hợp đồng không được bỏ trống"
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            // value={getContractAttributeValue(contractAttribute.id)}
            // onChange={(e) => {
            //   updateContractAttribute(contractAttribute.id, e.value);
            // }}
            disabled={true}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "multiselect":
        // let attris = getContractAttributeValue(contractAttribute.id);
        CustomControl = (
          <CheckboxList
            title={contractAttribute.name}
            required={!!contractAttribute.required}
            disabled={true}
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            // value={attris ? JSON.parse(attris).join(",") : ""}
            // onChange={(e) => {
            //   updateContractMultiselectAttribute(contractAttribute.id, e);
            // }}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            // checked={!!getContractAttributeValue(contractAttribute.id)}
            label={contractAttribute.name}
            // onChange={(e) => {
            //   updateContractAttribute(contractAttribute.id, e.target.checked);
            // }}
            disabled={true}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={contractAttribute.name}
            title={contractAttribute.name}
            disabled={true}
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            // value={getContractAttributeValue(contractAttribute.id)}
            // onChange={(e) => {
            //   updateContractAttribute(contractAttribute.id, e.target.value);
            // }}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={contractAttribute.name}
            name={contractAttribute.name}
            fill={true}
            disabled={true}
            // value={getContractAttributeValue(contractAttribute.id)}
            // onChange={(e) => {
            //   const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
            //   updateContractAttribute(contractAttribute.id, newDate);
            // }}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            iconPosition="left"
            icon={<Icon name="Calendar" />}
            isMaxDate={false}
            // error={validateFieldSignDate}
            // message={`Vui lòng chọn ${contractAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "lookup":
        const attrs = contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : {};

        //1. Trường hợp là customer (khách hàng)
        //2. Trường hợp là employee (nhân viên)
        //3. Trường hợp là contract (hợp đồng)
        //4. Trường hợp là contact (người liên hệ)
        switch (attrs?.refType) {
          case "customer":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                // onMenuOpen={onSelectOpenCustomer}
                // isLoading={isLoadingCustomer}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                disabled={true}
                // value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                // onChange={(e) => handleChangeValueCustomerItem(e, contractAttribute)}
              />
            );
            break;
          case "employee":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                // onMenuOpen={onSelectOpenEmployee}
                // isLoading={isLoadingEmployee}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                disabled={true}
                // value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                // onChange={(e) => handleChangeValueEmployeeItem(e, contractAttribute)}
              />
            );
            break;
          case "contract":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                // onMenuOpen={onSelectOpenContract}
                // isLoading={isLoadingContract}
                fill={true}
                disabled={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                // value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                // onChange={(e) => handleChangeValueContractItem(e, contractAttribute)}
              />
            );
            break;
          case "contact":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                // onMenuOpen={onSelectOpenContact}
                // isLoading={isLoadingContact}
                fill={true}
                disabled={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                // value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                // onChange={(e) => handleChangeValueContactItem(e, contractAttribute)}
              />
            );
            break;
          default:
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                // onMenuOpen={onSelectOpenCustomer}
                // isLoading={isLoadingCustomer}
                fill={true}
                disabled={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                // value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                // onChange={(e) => handleChangeValueCustomerItem(e, contractAttribute)}
              />
            );
        }
        break;
      case "formula":
        //Công thức được lấy từ trường động và trường tĩnh
        //{contract.dealValue + contractAttribute.xyz} => sẽ cần parser từ 2 đối tượng là contract và contractAttribute

        //Chỉ hiển thị chứ không lưu giá trị (nếu thêm mới thì không hiển thị?, sửa mới hiển thị)
        CustomControl = (
          <Input
            id={`Id${contractAttribute.id}`}
            label={contractAttribute.name}
            fill={true}
            // value={getContractAttributeFormula(contractAttribute?.attributes)}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );

        break;
    }

    return CustomControl;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    onHide(false);
    callBack(formRef.current.innerHTML);
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
              !isDifferenceObj(formData, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData, values),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
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
        size="lg"
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-type-form"
      >
        <form className="form-add-form-type-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt luồng ký`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  name="eform"
                  label="Chọn biểu mẫu"
                  value={formData.eformId}
                  options={lstEform}
                  fill={true}
                  isLoading={isLoadingLstEform}
                  placeholder="Chọn biểu mẫu"
                  onMenuOpen={onSelectOpenEform}
                  onChange={(e) => handleChangeValueEform(e)}
                />
              </div>

              {formData.eformId && (
                <div className="form-group">
                  <span className="title-preview">Chi tiết biểu mẫu</span>

                  <div ref={formRef} className="preview-eform-container">
                    {!isLoadingEformAttribute && listEformAttribute && listEformAttribute.length > 0 ? (
                      <div className="list__eform">
                        <Fragment>
                          {listEformAttribute.map((contractAttribute, index: number) => (
                            <Fragment key={index}>
                              {!contractAttribute.parentId ? (
                                <label className={index === 0 ? "label-title-first" : "label-title"}>{contractAttribute.name}</label>
                              ) : null}
                              {contractAttribute.parentId ? (
                                <div
                                  className={`form-group ${
                                    contractAttribute.name.length >= 38 || listEformAttribute.length == 2 ? "special-case" : ""
                                  }`}
                                  id={`Field${convertToId(contractAttribute.name)}`}
                                >
                                  {getControlByType(contractAttribute)}
                                </div>
                              ) : null}
                            </Fragment>
                          ))}
                        </Fragment>
                      </div>
                    ) : isLoadingEformAttribute ? (
                      <Loading />
                    ) : (
                      <SystemNotification description={<span>Biểu mẫu chưa có trường thông tin nào cả.</span>} type="no-item" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
