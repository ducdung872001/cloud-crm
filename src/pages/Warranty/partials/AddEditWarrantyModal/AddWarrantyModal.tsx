import React, { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddWarrantyModelProps } from "model/warranty/PropsModel";
import { IWarrantyRequestModel } from "model/warranty/WarrantyRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IWarrantyCategoryFilterRequest } from "model/warrantyCategory/WarrantyCategoryRequestModel";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import WarrantyService from "services/WarrantyService";
import EmployeeService from "services/EmployeeService";
import WarrantyCategoryService from "services/WarrantyCategoryService";
// import { uploadImageFromFiles } from "utils/image";
import FileService from "services/FileService";
import ImageThirdGender from "assets/images/third-gender.png";
import "./AddWarrantyModal.scss";

export default function AddWarrantyModal(props: IAddWarrantyModelProps) {
  const { onShow, onHide, data, idCustomer, saleflowId, sieId } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listReason, setListReason] = useState<IOption[]>(null);
  const [isLoadingReason, setIsLoadingReason] = useState<boolean>(false);

  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [listDepartment, setListDepartment] = useState<IOption[]>(null);
  const [isLoadingDepartment, setIsLoadingDepartment] = useState<boolean>(false);

  const [listService, setListService] = useState<IOption[]>(null);
  const [isLoadingService, setIsLoadingService] = useState<boolean>(false);

  const [listImageWarranty, setListImageWarranty] = useState([]);

  // Chọn phòng ban tiếp nhận
  const onSelectOpenDepartment = async () => {
    if (!listDepartment || listDepartment.length === 0) {
      setIsLoadingDepartment(true);
      const dataOption = await SelectOptionData("departmentId");
      if (dataOption) {
        setListDepartment([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingDepartment(false);
    }
  };

  // useEffect(() => {
  //   if (data?.departmentId) {
  //     onSelectOpenDepartment();
  //   }

  //   if (data?.departmentId === null) {
  //     setListDepartment([]);
  //   }
  // }, [data]);

  // Chọn lý do bảo hành
  const onSelectOpenReason = async () => {
    const param: IWarrantyCategoryFilterRequest = {
      type: 2,
    };

    if (!listReason || listReason.length === 0) {
      setIsLoadingReason(true);
      const response = await WarrantyCategoryService.list(param);
      if (response.code === 0) {
        const dataOption = response.result;
        setListReason([
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ]);
      }
      setIsLoadingReason(false);
    }
  };

  useEffect(() => {
    if (data?.reasonId) {
      onSelectOpenReason();
    }

    if (data?.reasonId === null) {
      setListReason([]);
    }
  }, [data]);

  // Chọn khách hàng cần bảo hành
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

  useEffect(() => {
    if (data?.customerId || idCustomer) {
      onSelectOpenCustomer();
    }

    if (data?.customerId === null) {
      setListCustomer([]);
    }
  }, [data, idCustomer]);

  // Chọn dịch vụ được bảo hành
  const onSelectOpenService = async () => {
    if (!listService || listService.length === 0) {
      setIsLoadingService(true);
      const dataOption = await SelectOptionData("serviceId");
      if (dataOption) {
        setListService([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingService(false);
    }
  };

  useEffect(() => {
    if (data?.serviceId) {
      onSelectOpenService();
    }

    if (data?.serviceId === null) {
      setListService([]);
    }
  }, [data]);

  const values = useMemo(
    () =>
      ({
        // executorId: data?.executorId ?? null,
        // departmentId: data?.departmentId ?? null,
        customerId: data?.customerId ?? idCustomer ?? null,
        serviceId: data?.serviceId ?? null,
        startDate: data?.startDate ?? new Date(),
        endDate: data?.endDate ?? "",
        reasonId: data?.reasonId ?? null,
        docLink: data?.docLink ?? "[]",
        solution: data?.solution ?? "",
        note: data?.note ?? "",
        statusId: data?.statusId ?? null,
      } as IWarrantyRequestModel),
    [onShow, data]
  );

  const validations: IValidation[] = [
    {
      name: "startDate",
      rules: "required",
    },
    {
      name: "endDate",
      rules: "required",
    },
    {
      name: "reasonId",
      rules: "required",
    },
    {
      name: "customerId",
      rules: "required",
    },
    {
      name: "serviceId",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  const listFieldWarrantyService = useMemo(
    () =>
      [
        {
          label: "Bảo hành cho khách hàng",
          name: "customerId",
          type: "select",
          fill: true,
          required: true,
          disabled: idCustomer ? true : false,
          options: listCustomer,
          onMenuOpen: onSelectOpenCustomer,
          isLoading: isLoadingCustomer,
        },
        {
          label: "Dịch vụ bảo hành",
          name: "serviceId",
          type: "select",
          fill: true,
          required: true,
          options: listService,
          onMenuOpen: onSelectOpenService,
          isLoading: isLoadingService,
        },
        {
          label: "Lý do bảo hành",
          name: "reasonId",
          type: "select",
          fill: true,
          required: true,
          options: listReason,
          onMenuOpen: onSelectOpenReason,
          isLoading: isLoadingReason,
        },
      ] as IFieldCustomize[],
    [listReason, isLoadingReason, listCustomer, isLoadingCustomer, listService, isLoadingService]
  );

  const [changeValueExecutor, setChangeValueExecutor] = useState(null);

  const loadedOptionExecutor = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      departmentId: formData?.values?.departmentId,
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

  const formatOptionLabelExecutor = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  // change value executor
  const handleChangeValueExecutor = (e) => {
    setChangeValueExecutor(e);

    setFormData({ ...formData, values: { ...formData?.values, executorId: e.value } });
  };

  const listFieldReceptionDepartment = useMemo(
    () =>
      [
        // {
        //   label: "Phòng ban tiếp nhận",
        //   name: "departmentId",
        //   type: "select",
        //   fill: true,
        //   required: true,
        //   options: listDepartment,
        //   onMenuOpen: onSelectOpenDepartment,
        //   isLoading: isLoadingDepartment,
        // },
        // {
        //   name: "executorId",
        //   type: "custom",
        //   snippet: (
        //     <SelectCustom
        //       id="emplexecutorIdoyeeId"
        //       name="executorId"
        //       label="Người thực hiện"
        //       options={[]}
        //       fill={true}
        //       value={changeValueExecutor}
        //       onChange={(e) => handleChangeValueExecutor(e)}
        //       isAsyncPaginate={true}
        //       isFormatOptionLabel={true}
        //       placeholder="Chọn phòng ban để xem nhân viên thực hiện"
        //       additional={{
        //         page: 1,
        //       }}
        //       loadOptionsPaginate={loadedOptionExecutor}
        //       formatOptionLabel={formatOptionLabelExecutor}
        //       disabled={formData?.values?.departmentId ? false : true}
        //     />
        //   ),
        // },
        {
          label: "Ngày tiếp nhận",
          name: "startDate",
          type: "date",
          fill: true,
          required: true,
          hasSelectTime: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          maxDate: new Date(formData?.values?.endDate),
          placeholder: "Nhập ngày tiếp nhận",
        },
        {
          label: "Ngày dự kiến kết thúc",
          name: "endDate",
          type: "date",
          fill: true,
          required: true,
          hasSelectTime: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          minDate: new Date(formData?.values?.startDate),
          placeholder: "Nhập ngày dự kiến kết thúc",
        },
        {
          label: "Giải pháp",
          name: "solution",
          type: "textarea",
          fill: true,
        },
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [listDepartment, isLoadingDepartment, formData?.values, changeValueExecutor]
  );

  useEffect(() => {
    const result = JSON.parse(formData.values.docLink || []).map((item: any) => item.url);
    setListImageWarranty(result);
  }, [formData.values.docLink]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldWarrantyService, ...listFieldReceptionDepartment]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: IWarrantyRequestModel = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as IWarrantyRequestModel),
      ...(saleflowId ? { saleflowId: saleflowId } : {}),
      ...(sieId ? { sieId: sieId } : {}),
    };

    const response = await WarrantyService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} bảo hành thành công`, "success");
      onHide(true);
      setChangeValueExecutor(null);
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

  // xử lý hình ảnh
  const handleImageUpload = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      const maxSize = 1048576;

      if (e.target.files[0].size > maxSize) {
        showToast("Ảnh tải lên giới hạn dung lượng không quá 2MB", "warning");
        e.target.value = "";
      } else {
        // uploadImageFromFiles(e.target.files, showImage, false);
        handUploadFile(e.target.files[0]);

        e.target.value = null;
      }
    }
  };

  const showImage = (url, filekey) => {
    setListImageWarranty([...listImageWarranty, url]);
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setListImageWarranty([...listImageWarranty, result]);
  };

  useEffect(() => {
    const merge = listImageWarranty.map((item) => {
      return {
        type: "image",
        url: item,
      };
    });
    setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(merge) } });
  }, [listImageWarranty]);

  const handleRemoveImageItem = (idx) => {
    const result = JSON.parse(formData.values.docLink);
    result.splice(idx, 1);
    setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(result) } });
  };

  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-warranty"
      >
        <form className="form-warranty-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} bảo hành`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="wrapper-field-warranty-service">
                <div className="list-field">
                  {listFieldWarrantyService.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldWarrantyService, setFormData)}
                      formData={formData}
                    />
                  ))}
                </div>
                <div className="attachments">
                  <label className="title-attachment">Tải ảnh lên</label>
                  <div className={listImageWarranty.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                    {JSON.parse(formData.values.docLink).length === 0 ? (
                      <label htmlFor="imageUpload" className="action-upload-image">
                        <div className="wrapper-upload">
                          <Icon name="Upload" />
                          Tải ảnh lên
                        </div>
                      </label>
                    ) : (
                      <Fragment>
                        <div className="d-flex align-items-center">
                          {JSON.parse(formData.values.docLink).map((item, idx) => (
                            <div key={idx} className="image-item">
                              <img src={item.url} alt="image-warranty" />
                              <span className="icon-delete" onClick={() => handleRemoveImageItem(idx)}>
                                <Icon name="Trash" />
                              </span>
                            </div>
                          ))}
                          <label htmlFor="imageUpload" className="add-image">
                            <Icon name="PlusCircleFill" />
                          </label>
                        </div>
                      </Fragment>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/gif,image/jpeg,image/png,image/jpg"
                    className="d-none"
                    id="imageUpload"
                    onChange={(e) => handleImageUpload(e)}
                  />
                </div>
              </div>
              <div className="wrapper-field-reception-department">
                {listFieldReceptionDepartment.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldReceptionDepartment, setFormData)}
                    formData={formData}
                  />
                ))}
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
