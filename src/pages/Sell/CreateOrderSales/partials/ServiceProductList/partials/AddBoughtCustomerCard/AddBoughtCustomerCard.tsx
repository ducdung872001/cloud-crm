import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { AddBoughtServiceProps } from "model/boughtService/PropsModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICardFilterRequest } from "model/card/CardRequestModel";
import { IBoughtCustomerCardRequest } from "model/boughtCustomerCard/BoughtCustomerCardRequest";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import SelectCustom from "components/selectCustom/selectCustom";
import Icon from "components/icon";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import CardService from "services/CardService";
import EmployeeService from "services/EmployeeService";
import { urlsApi } from "configs/urls";
import "./AddBoughtCustomerCard.scss";
import { ContextType, UserContext } from "contexts/userContext";
import { AddBoughtCustomerCardModalProps } from "model/boughtCustomerCard/PropsModel";
import BoughtCardService from "services/BoughtCardService";

export default function AddBoughtCustomerCardModal(props: AddBoughtCustomerCardModalProps) {
  const { onShow, onHide, idCustomer, invoiceId, data } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);


  const [dataCard, setDataCard] = useState(null);

  const [dataEmployee, setDataEmployee] = useState(null);

  //* đoạn này xử lý vấn đề validate trường thẻ vs trường người bán
  const [validateCard, setValidateCard] = useState<boolean>(false);
  const [validateEmployee, setValidateEmployee] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách thẻ
  const loadedOptionCard = async (search, loadedOptions, { page }) => {
    const param: ICardFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      // type: 2,
    };

    const response = await CardService.list(param);

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
                  cardNumber: item.code,
                  fee: item.price,
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

  //! đoạn này lấy ra chi tiết thẻ khi cập nhật
  const getDetailCard = async () => {
    const response = await CardService.list({ type: 2 });

    if (response.code === 0) {
      const result = response.result.items.find((item) => item.id === data?.cardId);

      if (result) {
        const cardData = {
          value: result.id,
          label: result.name,
          avatar: result.avatar,
          cardNumber: result.code,
          fee: result.price,
        };
        setDataCard(cardData);
        setFormData({
          ...formData,
          values: {
            ...formData?.values,
            fee: result.price || 0,
          },
        });
      }
    }
  };

  useEffect(() => {
    if (data?.cardId && onShow) {
      getDetailCard();
    }
  }, [data, onShow]);

  //! đoạn này xử lý vấn đề hiển thị hình ảnh thẻ
  const formatOptionLabelCard = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý vấn đề thay đổi thẻ
  const handleChangeValueCard = (e) => {
    setValidateCard(false);
    setDataCard(e);
    setFormData({
      ...formData,
      values: {
        ...formData?.values,
        cardId: e.value,
        cardNumber: e.cardNumber,
        fee: e.fee || 0,
      },
    });
  };

  //? đoạn này xử lý vấn đề call api lấy ra danh sách người bán
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      ...(dataBranch?.value ? { branchId: dataBranch.value } : {}),
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

  //? call api chi tiết người bán
  const getDetailEmployee = async (id) => {
    const response = await EmployeeService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataEmployee({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      });
    }
  };

  //? đoạn này kiểm tra điều kiện callApi chi tiết người bán khi cập nhật
  useEffect(() => {
    if (data?.saleId && onShow) {
      getDetailEmployee(data?.saleId);
    }

    return () => setDataEmployee(null);
  }, [data?.saleId, onShow]);

  //? đoạn này xử lý vấn đề lấy ra ảnh người bán
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

  //? đoạn này xử lý vấn đề thay đổi người bán
  const handleChangeValueEmployee = (e) => {
    setValidateEmployee(false);
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, saleId: e.value } });
  };

  const values = useMemo(
    () =>
      ({
        invoiceId: data?.invoiceId ?? invoiceId,
        customerId: data?.customerId ?? idCustomer,
        cardId: data?.cardId ?? null,
        cardNumber: data?.cardNumber ?? "",
        status: 2,
        saleId: data?.saleId ?? null,
        fee: data?.price ?? (dataCard?.fee ?? 0),
      } as IBoughtCustomerCardRequest & { price?: number }),
    [data, onShow, idCustomer, invoiceId, dataCard]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations = useMemo(
    () =>
      [
        {
          name: "cardId",
          rules: "required",
        },
        {
          name: "saleId",
          rules: "required",
        },
      ] as IValidation[],
    []
  );

  const listField = useMemo(
    () =>
      [
        {
          name: "cardId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="cardId"
              name="cardId"
              label="Thẻ hạng thành viên"
              fill={true}
              required={true}
              options={[]}
              value={dataCard}
              onChange={(e) => handleChangeValueCard(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn thẻ hạng thành viên"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionCard}
              formatOptionLabel={formatOptionLabelCard}
              error={validateCard}
              message="Vui lòng chọn thẻ hạng thành viên"
              disabled={data?.cardId ? true : false}
            />
          ),
        },
        {
          label: "Giá bán",
          name: "fee",
          type: "number",
          fill: true,
          disabled: true,
        },
        {
          name: "saleId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="saleId"
              name="saleId"
              label="Người bán"
              fill={true}
              required={true}
              options={[]}
              value={dataEmployee}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn người bán"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              error={validateEmployee}
              message="Vui lòng chọn người bán"
            />
          ),
        },
      ] as IFieldCustomize[],
    [dataCard, validateCard, dataEmployee, validateEmployee, data]
  );

  useEffect(() => {
    setFormData({ ...formData, values: { ...values, invoiceId: values.invoiceId || invoiceId }, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values, invoiceId]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (formData?.values?.cardId == null) {
      setValidateCard(true);
      return;
    }

    if (formData?.values?.saleId == null) {
      setValidateEmployee(true);
      return;
    }

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: IBoughtCustomerCardRequest = {
      cardId: formData.values.cardId,
      cardNumber: formData.values.cardNumber,
      status: 2,
      saleId: formData.values.saleId,
      customerId: formData.values.customerId || idCustomer,
      invoiceId: formData.values.invoiceId || invoiceId,
      fee: formData.values.fee || 0,
      ...(data ? { id: data.id } : {}),
    };

    const response = await BoughtCardService.updateCustomerCard(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} thẻ hạng thành viên thành công`, "success");
      onHide(true);
      setDataCard(null);
      setDataEmployee(null);
    } else {
      showToast(response.message ?? response.error ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setDataCard(null);
    setDataEmployee(null);
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
              !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              validateCard ||
              validateEmployee ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, validateCard, validateEmployee]
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
        setDataCard(null);
        setDataEmployee(null);
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
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-bought-service"
      >
        <form className="form-add-bought-service" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} thẻ hạng thành viên`}
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setDataCard(null);
              !isSubmit && setDataEmployee(null);
            }}
          />
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
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
