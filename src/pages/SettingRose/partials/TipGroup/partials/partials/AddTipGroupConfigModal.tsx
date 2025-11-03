import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ITipGroupConfigRequest } from "model/tipGroupConfig/TipGroupConfigRequestModel";
import { IAddTipGroupConfigModalProps } from "model/tipGroupConfig/PropsModel";
import TipGroupConfigService from "services/TipGroupConfigService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { SelectOptionData } from "utils/selectCommon";
import "./AddTipGroupConfigModal.scss";

export default function AddTipGroupConfigModal(props: IAddTipGroupConfigModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isLoadingGroupTip, setIsLoadingGroupTip] = useState<boolean>(false);
  const [isLoadingService, setIsLoadingService] = useState<boolean>(false);

  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false);
  const [listGroupTip, setListGroupTip] = useState<IOption[]>(null);

  const [listService, setListService] = useState<IOption[]>(null);
  const [listProduct, setListProduct] = useState<IOption[]>(null);

  const onSelectOpenGroupTip = async () => {
    if (!listGroupTip || listGroupTip.length === 0) {
      setIsLoadingGroupTip(true);
      const dataOption = await SelectOptionData("groupTip");
      if (dataOption) {
        setListGroupTip([{ value: "", label: "Chọn nhóm" }, ...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingGroupTip(false);
    }
  };

  const onSelectOpenService = async () => {
    if (!listService || listService.length === 0) {
      setIsLoadingService(true);
      const dataOption = await SelectOptionData("service");
      if (dataOption) {
        setListService([{ value: "", label: "Chọn dịch vụ" }, ...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingService(false);
    }
  };

  const onSelectOpenProduct = async () => {
    if (!listProduct || listProduct.length === 0) {
      setIsLoadingProduct(true);
      const dataOption = await SelectOptionData("product");
      if (dataOption) {
        setListProduct([{ value: "", label: "Chọn sản phẩm" }, ...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingProduct(false);
    }
  };

  useEffect(() => {
    if (data?.groupId) {
      onSelectOpenGroupTip();
    }
  }, [data]);

  useEffect(() => {
    switch (data?.objectType) {
      case 1:
        if (data?.objectId) {
          onSelectOpenService();
        }

        if (+data?.objectId === 0) {
          setListService([]);
        }

        break;

      case 2:
        if (data?.objectId) {
          onSelectOpenProduct();
        }

        if (+data?.objectId === 0) {
          setListProduct([]);
        }
        break;
    }
  }, [data]);

  const values = useMemo(
    () =>
      ({
        groupId: data?.groupId ?? null,
        serviceId: data?.serviceId?.toString() ?? "0",
        tip: data?.tip?.toString() ?? "0",
        unit: data?.unit?.toString() ?? "1",
      } as ITipGroupConfigRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "groupId",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Chọn nhóm",
          name: "groupId",
          type: "select",
          fill: true,
          required: true,
          options: listGroupTip,
          onMenuOpen: onSelectOpenGroupTip,
          isLoading: isLoadingGroupTip,
        },
        {
          label: "Áp dụng cho",
          name: "objectType",
          type: "radio",
          fill: true,
          options: [
            {
              value: "1",
              label: "Dịch vụ",
            },
            {
              value: "2",
              label: "Sản phẩm",
            },
            {
              value: "3",
              label: "Hóa đơn",
            },
          ],
        },
        {
          label: "Chọn dịch vụ",
          name: "serviceId",
          type: "select",
          fill: true,
          options: listService,
          onMenuOpen: onSelectOpenService,
          isLoading: isLoadingService,
        },
        {
          label: "Chọn sản phẩm",
          name: "productId",
          type: "select",
          fill: true,
          options: listProduct,
          onMenuOpen: onSelectOpenProduct,
          isLoading: isLoadingProduct,
        },
        {
          label: "Ngày hiệu lực",
          name: "effectFrom",
          type: "date",
          fill: true,
          required: true,
        },
        {
          label: "Ngày hết hiệu lực",
          name: "effectTo",
          type: "date",
          fill: true,
        },
      ] as IFieldCustomize[],
    [listGroupTip, isLoadingGroupTip, listService, listProduct, isLoadingService, isLoadingProduct, data]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    if (+formData?.values?.tip <= 0) {
      showToast("Tiền tip phải lớn hơn 0", "warning");
      return;
    }
    setIsSubmit(true);
    const body: ITipGroupConfigRequest = {
      ...(formData.values as ITipGroupConfigRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await TipGroupConfigService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} hoa hồng nhóm thành công`, "success");
      onHide(true);
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
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
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
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-tip-group-config"
      >
        <form className="form-tip-group-config" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} hoa hồng theo nhóm`} toggle={() => !isSubmit && onHide(false)} />
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
