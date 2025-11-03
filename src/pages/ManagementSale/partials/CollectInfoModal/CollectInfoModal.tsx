import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { convertToId, isDifferenceObj } from "reborn-util";
import "./CollectInfoModal.scss";
import ContractEformService from "services/ContractEformService";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import RadioList from "components/radio/radioList";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { Parser } from "formula-functionizer";
import { SelectOptionData } from "utils/selectCommon";
import moment from "moment";
import SaleflowEformService from "services/SaleflowEformService";

export default function CollectInfoModal(props: any) {
  const { onShow, onHide, data } = props;

  const parser = new Parser();
  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listEformAttribute, setListEformAttribute] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contractExtraInfos, setContractExtraInfos] = useState<any>([]);

  //Dùng cho lookup
  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);

  const getInfoEform = async (eformId, approachId, saleflowId, invoiceId, sieId) => {
    const params = {
      eformId: eformId,
      approachId: approachId,
      saleflowId: saleflowId,
      invoiceId: invoiceId,
      sieId: sieId,
    };
    const response = await SaleflowEformService.SaleflowEformDetail(params);

    if (response?.code === 0) {
      const result = response.result;
      if (result) {
        const attributeNew = JSON.parse(result.attributeValue);
        setContractExtraInfos(attributeNew);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (data && onShow) {
      getInfoEform(data.eformId, data.approachId, data.saleflowId, data.invoiceId, data.sieId);
    }
  }, [data, onShow]);

  const getListEformAttribute = async (eformId) => {
    setIsLoading(true);
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
    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && data) {
      getListEformAttribute(data.eformId);
    }
  }, [onShow, data]);

  const getContractAttributeFormula = (attributes) => {
    let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attrObj = {};
    (contractExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        attrObj["contractAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });

    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  const getContractAttributeValue = (attributeId) => {
    let attributeValue = "";
    (contractExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return attributeValue;
  };

  const updateContractMultiselectAttribute = (attributeId, e) => {
    let attributeValue = e ? e.split(",") : [];
    updateContractAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const updateContractAttribute = (attributeId, attributeValue) => {
    // let contractId = data?.id || 0;

    let found = false;
    (contractExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        // item.contractId = contractId;
        found = true;
      }
    });

    if (!found) {
      let item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      // item.contractId = contractId;
      contractExtraInfos[contractExtraInfos.length] = item;
    }

    setContractExtraInfos([...contractExtraInfos]);
  };

  const onSelectOpenCustomer = async () => {
    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingCustomer(true);
      const dataOption = await SelectOptionData("customerId");

      if (dataOption) {
        setListCustomer([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomer(false);
    }
  };

  const handleChangeValueCustomerItem = (e, contractAttribute) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value);
  };

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId");

      if (dataOption) {
        setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };
  const handleChangeValueEmployeeItem = (e, contractAttribute) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value);
  };

  const onSelectOpenContract = async () => {
    if (!listContract || listContract.length === 0) {
      setIsLoadingContract(true);
      const dataOption = await SelectOptionData("contractId");

      if (dataOption) {
        setListContract([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingContract(false);
    }
  };

  const handleChangeValueContractItem = (e, contractAttribute) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value);
  };

  const onSelectOpenContact = async () => {
    if (!listContact || listContact.length === 0) {
      setIsLoadingContact(true);
      const dataOption = await SelectOptionData("contactId");

      if (dataOption) {
        setListContact([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingContact(false);
    }
  };

  const handleChangeValueContactItem = (e, contractAttribute) => {
    const value = e.value;
    updateContractAttribute(contractAttribute.id, value);
  };

  const getDecimalScale = (attributes) => {
    attributes = attributes ? JSON.parse(attributes) : {};
    let numberFormat = attributes?.numberFormat || "";
    if (numberFormat.endsWith(".#")) {
      return 1;
    }

    if (numberFormat.endsWith(".##")) {
      return 2;
    }

    if (numberFormat.endsWith(".###")) {
      return 3;
    }

    return 0;
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
        value={getContractAttributeValue(contractAttribute.id)}
        onChange={(e) => updateContractAttribute(contractAttribute.id, e.target.value)}
        placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
        required={!!contractAttribute.required}
        readOnly={!!contractAttribute.readonly}
      />
    );

    switch (contractAttribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={contractAttribute.name}
            name={contractAttribute.name}
            value={getContractAttributeValue(contractAttribute.id)}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            fill={true}
            required={!!contractAttribute.required}
            readOnly={!!contractAttribute.readonly}
            onChange={(e) => updateContractAttribute(contractAttribute.id, e.target.value)}
            maxLength={459}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={contractAttribute.name}
            name={contractAttribute.name}
            fill={true}
            required={!!contractAttribute.required}
            value={getContractAttributeValue(contractAttribute.id)}
            thousandSeparator={true}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            decimalScale={getDecimalScale(contractAttribute.attributes)}
            onChange={(e) => {
              const value = e.target.value;
              let valueNum = value?.replace(/,/g, "");
              updateContractAttribute(contractAttribute.id, valueNum);
            }}
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
            value={getContractAttributeValue(contractAttribute.id)}
            onChange={(e) => {
              updateContractAttribute(contractAttribute.id, e.value);
            }}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "multiselect":
        let attris = getContractAttributeValue(contractAttribute.id);
        CustomControl = (
          <CheckboxList
            title={contractAttribute.name}
            required={!!contractAttribute.required}
            disabled={!!contractAttribute.readonly}
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            value={attris ? JSON.parse(attris).join(",") : ""}
            onChange={(e) => {
              updateContractMultiselectAttribute(contractAttribute.id, e);
            }}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            checked={!!getContractAttributeValue(contractAttribute.id)}
            label={contractAttribute.name}
            onChange={(e) => {
              updateContractAttribute(contractAttribute.id, e.target.checked);
            }}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={contractAttribute.name}
            title={contractAttribute.name}
            options={contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : []}
            value={getContractAttributeValue(contractAttribute.id)}
            onChange={(e) => {
              updateContractAttribute(contractAttribute.id, e.target.value);
            }}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={contractAttribute.name}
            name={contractAttribute.name}
            fill={true}
            value={getContractAttributeValue(contractAttribute.id)}
            onChange={(e) => {
              const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
              updateContractAttribute(contractAttribute.id, newDate);
            }}
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
        let attrs = contractAttribute.attributes ? JSON.parse(contractAttribute.attributes) : {};

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
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItem(e, contractAttribute)}
              />
            );
            break;
          case "employee":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                onMenuOpen={onSelectOpenEmployee}
                isLoading={isLoadingEmployee}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueEmployeeItem(e, contractAttribute)}
              />
            );
            break;
          case "contract":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                onMenuOpen={onSelectOpenContract}
                isLoading={isLoadingContract}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContractItem(e, contractAttribute)}
              />
            );
            break;
          case "contact":
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                onMenuOpen={onSelectOpenContact}
                isLoading={isLoadingContact}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContactItem(e, contractAttribute)}
              />
            );
            break;
          default:
            CustomControl = (
              <SelectCustom
                label={contractAttribute.name}
                options={[]}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!contractAttribute.required}
                readOnly={!!contractAttribute.readonly}
                value={+getContractAttributeValue(contractAttribute.id)}
                placeholder={`Chọn ${contractAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItem(e, contractAttribute)}
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
            value={getContractAttributeFormula(contractAttribute?.attributes)}
            placeholder={`Nhập ${contractAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );

        break;
    }

    return CustomControl;
  };

  const values = useMemo(
    () =>
      ({
        id: data?.id ?? 0,
        name: data?.name ?? "",
        note: data?.note ?? "",
      } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  // const validations: IValidation[] = [
  //   {
  //     name: "name",
  //     rules: "required",
  //   },

  // ];

  // const listFieldBasic = useMemo(
  //   () =>
  //     [
  //       {
  //           label: "Tên biểu mẫu",
  //           name: "name",
  //           type: "text",
  //           fill: true,
  //           required: true,
  //       },
  //       {
  //           label: "Ghi chú",
  //           name: "note",
  //           type: "textarea",
  //           fill: true,
  //       },

  //     ] as IFieldCustomize[],
  //   [formData?.values]
  // );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // const errors = Validate(validations, formData, [...listFieldBasic]);
    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    if (listEformAttribute && listEformAttribute.length > 0) {
      let checkArray = [];

      listEformAttribute.map((item) => {
        if (item.required === 1 && item.parentId !== 0) {
          checkArray.push(item);
        }
      });

      if (checkArray.length > 0) {
        if (contractExtraInfos.length === 0) {
          showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
          return;
        } else {
          let check = false;
          checkArray.map((i) => {
            const index = contractExtraInfos.findIndex((el) => el.attributeId === i.id);
            if (index === -1) {
              check = true;
            }
          });

          if (check) {
            showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
            return;
          }
        }
      }
    }

    setIsSubmit(true);

    const body: any = {
      id: 0,
      eformId: data.eformId,
      attributeValue: JSON.stringify(contractExtraInfos),
      approachId: data.approachId,
      saleflowId: data.saleflowId,
      invoiceId: data.invoiceId,
      sieId: data.sieId,
    };

    const response = await SaleflowEformService.SaleflowEformUpdate(body);

    if (response.code === 0) {
      showToast(`Nhập thông tin vận chuyển thành công`, "success");
      onHide(true);
      setContractExtraInfos([]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setContractExtraInfos([]);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handClearForm();
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
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

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm()}
        className="modal-collect-info-eform"
        size="lg"
      >
        <form className="form-collect-info-eform-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`Thông tin biểu mẫu`}
            toggle={() => {
              !isSubmit && handClearForm();
            }}
          />
          <ModalBody>
            <div className="preview-eform-container">
              {!isLoading && listEformAttribute && listEformAttribute.length > 0 ? (
                <div className="list__contract--attribute">
                  <Fragment>
                    {listEformAttribute.map((contractAttribute, index: number) => (
                      <Fragment key={index}>
                        {!contractAttribute.parentId ? (
                          <label className={index === 0 ? "label-title-first" : "label-title"}>{contractAttribute.name}</label>
                        ) : null}
                        {contractAttribute.parentId ? (
                          <div
                            className={`form-group ${contractAttribute.name.length >= 38 || listEformAttribute.length == 2 ? "special-case" : ""}`}
                            id={`Field${convertToId(contractAttribute.name)}`}
                          >
                            {getControlByType(contractAttribute)}
                          </div>
                        ) : null}
                      </Fragment>
                    ))}
                  </Fragment>
                </div>
              ) : isLoading ? (
                <Loading />
              ) : (
                <SystemNotification
                  description={
                    <span>
                      Biểu mẫu chưa có trường thông tin nào cả.
                      <br />
                      Bạn hãy thêm trường thông tin cho biểu mẫu nhé!
                    </span>
                  }
                  type="no-item"
                />
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
