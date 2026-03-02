import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FileUpload from "components/fileUpload/fileUpload";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Button from "components/button/button";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { PHONE_REGEX, EMAIL_REGEX, WEB_URL_REGEX } from "utils/constant";
import { showToast } from "utils/common";
import { createArrayFromTo, createArrayFromToR, getMaxDay, isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import BeautyBranchService from "services/BeautyBranchService";
import "./AddStoreModal.scss";
import { SelectOptionData } from "utils/selectCommon";
import { IStoreRequest } from "@/model/managementStore/StoreRequestModel";
import { AddStoreModalProps } from "@/model/managementStore/PropsModel";

export default function AddStoreModal(props: AddStoreModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isLoadingStore, setIsLoadingStore] = useState<boolean>(false);
  const [listStore, setListStore] = useState<IOption[]>(null);
  const [showMiniMap, setShowMiniMap] = useState<boolean>(false);

  const onSelectOpenStore = async () => {
    if (!listStore || listStore.length === 0) {
      setIsLoadingStore(true);
      const dataOption = await SelectOptionData("beautyBranch");
      if (dataOption) {
        // Lọc bỏ cửa hàng hiện tại khi đang chỉnh sửa để tránh tự tham chiếu
        const filteredData = data?.id ? dataOption.filter((item) => item.value !== data.id) : dataOption;
        setListStore(filteredData.length > 0 ? filteredData : []);
      }
      setIsLoadingStore(false);
    }
  };

  useEffect(() => {
    if (data?.parentId) {
      onSelectOpenStore();
    }

    if (data?.parentId == null) {
      setListStore([]);
    }
  }, [data, onShow]);

  const values = useMemo(
    () =>
      ({
        parentId: data?.parentId ?? "",
        avatar: data?.avatar ?? "",
        name: data?.name ?? "",
        alias: data?.alias ?? "",
        address: data?.address ?? "",
        foundingDay: data?.foundingDay ?? "",
        foundingMonth: data?.foundingMonth ?? "",
        foundingYear: data?.foundingYear ?? "",
        website: data?.website ?? "",
        description: data?.description ?? "",
        code: data?.code ?? "",
        doctorNum: data?.doctorNum.toString() ?? "0",
        contact: data?.contact ?? "",
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        goodAt: data?.goodAt ?? "",
        openTime: (data as any)?.openTime ?? "",
        closeTime: (data as any)?.closeTime ?? "",
      } as unknown as IStoreRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "avatar",
      rules: "required",
    },
    {
      name: "name",
      rules: "required",
    },
    {
      name: "address",
      rules: "required",
    },
    {
      name: "phone",
      rules: "nullable|regex",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Chi nhánh cha",
          name: "parentId",
          type: "select",
          fill: true,
          required: false,
          options: listStore,
          onMenuOpen: onSelectOpenStore,
          isLoading: isLoadingStore,
        },
        {
          label: "Cửa hàng cha",
          name: "storeId",
          type: "select",
          fill: true,
          required: false,
          options: [
            {
              value: "Cửa Hàng Vật Tư Công Nghiệp Minh Phát",
              label: "Cửa Hàng Vật Tư Công Nghiệp Minh Phát",
            },
            {
              value: "Cửa Hàng Nguyên Liệu Thành Công",
              label: "Cửa Hàng Nguyên Liệu Thành Công",
            },
             {
              value: "Cửa Hàng Thiết Bị Kỹ Thuật Hoàng Gia",
              label: "Cửa Hàng Thiết Bị Kỹ Thuật Hoàng Gia",
             },
             {
              value: "Cửa Hàng Kim Khí Nam Việt",
              label: "Cửa Hàng Kim Khí Nam Việt",
             }, 
             {
              value: "Cửa Hàng Hóa Chất Đại Nam",
              label: "Cửa Hàng Hóa Chất Đại Nam",
             },
            ],
        },
        {
          label: "Tên cửa hàng",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Loại hình kinh doanh",
          name: "businessType",
          type: "select",
          fill: true,
          required: true,
          options: [
            {
              value: "Cửa hàng bán lẻ",
              label: "Cửa hàng bán lẻ",
            },
            {
              value: "Cửa hàng bán buôn",
              label: "Cửa hàng bán buôn",
            },
             {
              value: "Thương mại điện tử",
              label: "Thương mại điện tử",
             },
             {
              value: "Kinh doanh dịch vụ",
              label: "Kinh doanh dịch vụ",
             }, 
             {
              value: "Sản xuất",
              label: "Sản xuất",
             },
            ],
        },
        {
          label: "Số điện thoại",
          name: "phone",
          type: "text",
          fill: true,
          required: true,
          regex: new RegExp(PHONE_REGEX),
          messageErrorRegex: "Số điện thoại không đúng định dạng",
        },
        {
          label: "Địa chỉ cửa hàng",
          name: "address",
          type: "text",
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [listStore, isLoadingStore]
  );

  const listFieldAdvanced: IFieldCustomize[] = [
    {
      label: "Mã cửa hàng",
      name: "code",
      type: "text",
      fill: true,
    },
    {
      label: "Người phụ trách",
      name: "contact",
      type: "text",
      fill: true,
    },
  ];

  const listFieldDescription: IFieldCustomize[] = [
    {
      label: "Mô tả",
      name: "description",
      type: "textarea",
      fill: true,
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const handleSelectAddressFromMap = () => {
    setFormData((prevState) => ({
      ...prevState,
      values: {
        ...prevState.values,
        address: "Địa chỉ được chọn trên bản đồ",
      },
    }));
    setShowMiniMap(false);
  };

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBasic, ...listFieldAdvanced, ...listFieldDescription]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    // Kiểm tra không cho phép chọn chính cửa hàng hiện tại làm cửa hàng cha (khi chỉnh sửa)
    if (data?.id && formData.values.parentId && formData.values.parentId === data.id) {
      showToast("Không thể chọn chính cửa hàng hiện tại làm cửa hàng cha", "error");
      return;
    }

    setIsSubmit(true);
    const body: IStoreRequest = {
      ...(formData.values as IStoreRequest),
      ...(data ? { id: data.id } : {}),
    };
    const response = await BeautyBranchService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} cửa hàng thành công`, "success");
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
        className="modal-add-branch"
      >
        <form className="form-branch-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} cửa hàng`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-branch">
                {listFieldBasic.map((field, index) =>
                  field.name === "address" ? (
                    <div key={index} className="address-with-map">
                      <div className="address-with-map__input">
                        <FieldCustomize
                          field={field}
                          handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                          formData={formData}
                        />
                      </div>
                      <Button type="button" color="primary" size="slim" className="address-with-map__button" onClick={() => setShowMiniMap(true)}>
                        Chọn trên bản đồ
                      </Button>
                    </div>
                  ) : (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                      formData={formData}
                    />
                  )
                )}
              </div>
              <div className="form-advanced">
                <div className="store-time-row">
                  <div className="store-time-item">
                    <label className="store-time-label">Giờ mở cửa</label>
                    <input
                      type="time"
                      className="store-time-input"
                      value={formData?.values?.openTime ?? ""}
                      onChange={(e) =>
                        setFormData((prevState) => ({
                          ...prevState,
                          values: {
                            ...prevState.values,
                            openTime: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="store-time-item">
                    <label className="store-time-label">Giờ đóng cửa</label>
                    <input
                      type="time"
                      className="store-time-input"
                      value={formData?.values?.closeTime ?? ""}
                      onChange={(e) =>
                        setFormData((prevState) => ({
                          ...prevState,
                          values: {
                            ...prevState.values,
                            closeTime: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                {listFieldAdvanced.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldAdvanced, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
              <div className="form-dependent">
                <FileUpload type="avatar" label="Ảnh đại diện" formData={formData} setFormData={setFormData} />
                {listFieldDescription.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldDescription, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
              {showMiniMap && (
                <div className="mini-map-overlay">
                  <div className="mini-map-container">
                    <div className="mini-map-header">
                      <span>Chọn vị trí trên bản đồ</span>
                      <button type="button" className="mini-map-close" onClick={() => setShowMiniMap(false)}>
                        ×
                      </button>
                    </div>
                    <div className="mini-map-body">
                      <div className="mini-map-map">
                        <div className="mini-map-pin" />
                      </div>
                      <div className="mini-map-footer">
                        <Button type="button" color="primary" size="slim" className="mini-map-confirm" onClick={handleSelectAddressFromMap}>
                          Sử dụng vị trí này
                        </Button>
                      </div>
                    </div>
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
