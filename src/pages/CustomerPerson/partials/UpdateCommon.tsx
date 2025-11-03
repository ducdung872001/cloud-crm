import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import _ from "lodash";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Button from "components/button/button";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import { IActionModal, IOption } from "model/OtherModel";
import { UpdateCommonModalProps } from "model/customer/PropsModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import {
  IUpdateCommonRequest,
  IUpdateCustomeRelationshipRequest,
  IUpdateCustomerEmployeeRequest,
  IUpdateCustomerGroupRequest,
  IUpdateCustomerSourceRequest,
} from "model/customer/CustomerRequestModel";
import CustomerService from "services/CustomerService";
import RelationShipService from "services/RelationShipService";
import "./UpdateCommon.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import EmployeeService from "services/EmployeeService";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import ImageThirdGender from "assets/images/third-gender.png";

export interface IOptionDataRelationship {
  id?: number;
  name: string;
  color: string;
  colorText: string;
}

export default function UpdateCommon(props: UpdateCommonModalProps) {
  const { listId, titleProps, onHide, onShow, isActiveCustomerGroup, isActiveCustomerSource, isActiveCustomerEmployee, isActiveCustomeRelationship } =
    props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;

  const refColor = useRef();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [showColorOption, setShowColorOption] = useState<boolean>(false);
  const [valueBgColor, setValueBgColor] = useState<IOptionDataRelationship>({
    name: "",
    color: "",
    colorText: "",
  });
  useOnClickOutside(refColor, () => setShowColorOption(false), [""]);

  const [listCustomerGroup, setListCustomerGroup] = useState<IOption[]>(null);
  const [isLoadingCustomerGroup, setIsLoadingCustomerGroup] = useState<boolean>(false);

  const [listCustomerSource, setListCustomerSource] = useState<IOption[]>(null);
  const [isLoadingCustomerSource, setIsLoadingCustomerSource] = useState<boolean>(false);

  const [listCustomerEmployee, setListCustomerEmployee] = useState<IOption[]>(null);
  const [isLoadingCustomerEmployee, setIsLoadingCustomerEmployee] = useState<boolean>(false);

  const [listCustomerRelationship, setListCustomerRelationship] = useState<IOptionDataRelationship[]>(null);
  const [isLoadingCustomerRelationship, setIsLoadingCustomerRelationship] = useState<boolean>(false);

  const [customerDetail, setCustomerDetail] = useState<ICustomerResponse>(null);
  const [isLoadingCustomerDetail, setIsLoadingCustomerDetail] = useState<boolean>(false);

  const [dataEmployee, setDataEmployee] = useState(null);

  const detailCustomer = async (id: number) => {
    setIsLoadingCustomerDetail(true);
    const response = await CustomerService.detail(id);
    if (response.code === 0) {
      const result = response.result;
      setCustomerDetail(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoadingCustomerDetail(false);
  };

  useEffect(() => {
    if (listId.length === 1 && onShow === true) {
      const customerId = listId[0];
      detailCustomer(customerId);
    }

    if (listId.length > 2 && onShow === true) {
      setCustomerDetail(null);
    }
  }, [listId, onShow]);

  // đoạn này mình sẽ xử lý list ra nguồn khách hàng
  const onSelectOpenCustomerSource = async () => {
    if (!listCustomerSource || listCustomerSource.length === 0) {
      setIsLoadingCustomerSource(true);
      const dataOption = await SelectOptionData("sourceId");
      if (dataOption) {
        setListCustomerSource([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomerSource(false);
    }
  };

  useEffect(() => {
    if (customerDetail?.sourceId && isActiveCustomerSource === true) {
      onSelectOpenCustomerSource();
    }

    if (customerDetail?.sourceId == null) {
      setListCustomerSource([]);
    }
  }, [customerDetail?.sourceId, isActiveCustomerSource]);

  // đoạn này mình sẽ xử lý list ra nhóm khách hàng
  const onSelectOpenCustomerGroup = async () => {
    if (!listCustomerGroup || listCustomerGroup.length === 0) {
      setIsLoadingCustomerGroup(true);

      const dataOption = await SelectOptionData("cgpId");
      if (dataOption) {
        setListCustomerGroup([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomerGroup(false);
    }
  };

  useEffect(() => {
    if (customerDetail?.cgpId && isActiveCustomerGroup === true) {
      onSelectOpenCustomerGroup();
    }

    if (customerDetail?.cgpId == null) {
      setListCustomerGroup([]);
    }
  }, [customerDetail?.cgpId, isActiveCustomerGroup]);

  // đoạn này mình sẽ xử lý list ra ngành nghề khách hàng
  const onSelectOpenCustomerEmployee = async () => {
    if (!listCustomerEmployee || listCustomerEmployee.length === 0) {
      setIsLoadingCustomerEmployee(true);

      const dataOption = await SelectOptionData("employeeId");
      if (dataOption) {
        setListCustomerEmployee([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomerEmployee(false);
    }
  };

  useEffect(() => {
    if (customerDetail?.employeeId && isActiveCustomerEmployee === true) {
      onSelectOpenCustomerEmployee();
    }

    if (customerDetail?.employeeId == null) {
      setListCustomerEmployee([]);
    }
  }, [customerDetail?.employeeId, isActiveCustomerEmployee]);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
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
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData.values, employeeId: e.value } });
  };

  //đoạn này mình xử lý lấy ra quan hệ khách hàng rồi update lại
  const onSelectOpenCustomerRelationship = async () => {
    if (!listCustomerRelationship || listCustomerRelationship.length === 0) {
      setIsLoadingCustomerRelationship(true);

      const response = await RelationShipService.list();
      if (response.code === 0) {
        const result = response.result;
        setListCustomerRelationship(result);
      }
      setIsLoadingCustomerRelationship(false);
    }
  };

  useEffect(() => {
    if (customerDetail?.relationshipId || isActiveCustomeRelationship === true) {
      onSelectOpenCustomerRelationship();
    }

    if (customerDetail?.relationshipId == null) {
      setListCustomerRelationship([]);
    }
  }, [customerDetail?.relationshipId, isActiveCustomeRelationship]);

  // đoạn dưới này mình xử lý nếu như mà idRerelationship === customerDetail?.relationshipId
  // thì fill ra dữ liệu trùng khớp ban đầu
  useEffect(() => {
    if (listCustomerRelationship?.length > 0) {
      const result = listCustomerRelationship?.find((item) => {
        if (item.id === customerDetail?.relationshipId) {
          return item;
        }
      });
      setValueBgColor({
        name: result?.name,
        color: result?.color,
        colorText: result?.colorText,
      });
    }
  }, [customerDetail?.relationshipId, listCustomerRelationship]);

  // đoạn này bắt giá trị người dùng nhập vào rồi update lại state
  const handleChangeValueColor = (data) => {
    setValueBgColor({
      color: data?.color,
      colorText: data?.colorText,
      name: data?.name,
    });
    setFormData({ ...formData, values: { ...formData.values, relationshipId: data.id } });
  };

  const values = useMemo(
    () =>
      ({
        lstId: listId.length > 0 ? listId : "",
        cgpId: customerDetail?.cgpId ?? null,
        relationshipId: customerDetail?.relationshipId ?? null,
        sourceId: customerDetail?.sourceId ?? null,
        employeeId: customerDetail?.employeeId ?? null,
      } as IUpdateCommonRequest),
    [listId, onShow, customerDetail]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const validations: IValidation[] = [];

  const listField = useMemo(
    () =>
      [
        ...((listCustomerGroup?.length >= 0 && isActiveCustomerGroup === true
          ? [
              {
                label: "Nhóm khách hàng",
                name: "cgpId",
                type: "select",
                options: listCustomerGroup,
                onMenuOpen: onSelectOpenCustomerGroup,
                isLoading: isLoadingCustomerGroup,
                fill: true,
              },
            ]
          : []) as IFieldCustomize[]),
        ...((listCustomerSource?.length >= 0 && isActiveCustomerSource === true
          ? [
              {
                label: "Nguồn khách hàng",
                name: "sourceId",
                type: "select",
                options: listCustomerSource,
                onMenuOpen: onSelectOpenCustomerSource,
                isLoading: isLoadingCustomerSource,
                fill: true,
              },
            ]
          : []) as IFieldCustomize[]),
        ...((listCustomerEmployee?.length >= 0 && isActiveCustomerEmployee === true
          ? [
              // {
              //   label: "Người phụ trách khách hàng",
              //   name: "employeeId",
              //   type: "select",
              //   options: listCustomerEmployee,
              //   onMenuOpen: onSelectOpenCustomerEmployee,
              //   isLoading: isLoadingCustomerEmployee,
              //   fill: true,
              // },
              {
                name: "employeeId",
                type: "custom",
                snippet: (
                  <SelectCustom
                    id="employeeId"
                    name="employeeId"
                    label="Người phụ trách khách hàng"
                    options={[]}
                    fill={true}
                    value={dataEmployee}
                    required={true}
                    onChange={(e) => handleChangeValueEmployee(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn người phụ trách"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionEmployee}
                    formatOptionLabel={formatOptionLabelEmployee}
                    // error={checkFieldEmployee}
                    // message="Nhân viên thực hiện tư vấn không được bỏ trống"
                  />
                ),
              },
            ]
          : []) as IFieldCustomize[]),
      ] as IFieldCustomize[],
    [
      formData,
      listCustomerGroup,
      isLoadingCustomerGroup,
      listCustomerSource,
      isLoadingCustomerSource,
      listCustomerEmployee,
      isLoadingCustomerEmployee,
      isActiveCustomerSource,
      isActiveCustomerGroup,
      isActiveCustomerEmployee,
      dataEmployee,
    ]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    let response = null;

    // đoạn này xử lý nếu như props active customer group là true thì mình sẽ cho cập nhật
    if (isActiveCustomerGroup) {
      const body: IUpdateCommonRequest = {
        ...(formData.values as IUpdateCommonRequest),
      };

      const result: IUpdateCustomerGroupRequest = _.omit(body, ["employeeId", "relationshipId", "sourceId"]);
      response = await CustomerService.updateCustomerGroup(result);
    }

    // đoạn này xử lý nếu như props active customer employee là true thì mình sẽ cho cập nhật
    if (isActiveCustomerEmployee) {
      const body: IUpdateCommonRequest = {
        ...(formData.values as IUpdateCommonRequest),
      };

      const result: IUpdateCustomerEmployeeRequest = _.omit(body, ["cgpId", "relationshipId", "sourceId"]);
      response = await CustomerService.updateCustomerEmployee(result);
    }

    // đoạn này xử lý nếu như props active customer source là true thì mình sẽ cho cập nhật
    if (isActiveCustomerSource) {
      const body: IUpdateCommonRequest = {
        ...(formData.values as IUpdateCommonRequest),
      };

      const result: IUpdateCustomerSourceRequest = _.omit(body, ["cgpId", "relationshipId", "employeeId"]);
      response = await CustomerService.updateCustomerSource(result);
    }

    // đoạn này mình xử lý nếu như props active customer relationship là true thì mình sẽ cho cập nhật
    if (isActiveCustomeRelationship) {
      const body: IUpdateCommonRequest = {
        ...(formData.values as IUpdateCommonRequest),
      };

      const result: IUpdateCustomeRelationshipRequest = _.omit(body, ["cgpId", "employeeId", "sourceId"]);
      response = await CustomerService.updateCustomeRelationship(result);
    }

    if (response.code === 0) {
      if (isActiveCustomerEmployee) {
        showToast(`Cập nhật ${dataEmployee.label} phụ trách khách hàng thành công`, "success");
      } else {
        showToast(`${titleProps} thành công`, "success");
      }

      clearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
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
              !isDifferenceObj(formData.values, values) ? clearForm(false) : showDialogConfirmCancel();
              setListCustomerRelationship([]);
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
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
      title: <Fragment>{`Hủy bỏ thao tác ${titleProps.toLowerCase()}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        clearForm(false);
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

  const clearForm = (acc) => {
    onHide(acc);
    setDataEmployee(null);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-add-common"
      >
        <form className="form-common-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={titleProps} toggle={() => !isSubmit && clearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}
              {listCustomerRelationship?.length >= 0 && isActiveCustomeRelationship === true ? (
                <div className="relationship-option">
                  <label className="label">Màu sắc mối quan hệ</label>
                  <Button
                    type="button"
                    className="btn-bg-color"
                    onClick={() => {
                      setShowColorOption(!showColorOption);
                    }}
                  >
                    {valueBgColor?.color === undefined ? (
                      "Chọn màu sắc mối quan hệ"
                    ) : (
                      <span
                        style={{
                          backgroundColor: `${valueBgColor.color}`,
                          color: `${valueBgColor.colorText}`,
                        }}
                        className="value"
                      >
                        {valueBgColor?.name}
                      </span>
                    )}
                  </Button>
                  {showColorOption && (
                    <ul className={`menu ${isLoadingCustomerRelationship ? "no-data" : ""}`} ref={refColor}>
                      {listCustomerRelationship.map((item, idx) => (
                        <li
                          key={idx}
                          style={{ backgroundColor: `${item.color}`, color: `${item.colorText}` }}
                          className="change-color"
                          onClick={() => {
                            handleChangeValueColor(item);
                            setShowColorOption(false);
                          }}
                        >
                          <span>{item.name}</span>
                        </li>
                      ))}
                      {isLoadingCustomerRelationship ? "Không tìm thấy lựa chọn" : ""}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
