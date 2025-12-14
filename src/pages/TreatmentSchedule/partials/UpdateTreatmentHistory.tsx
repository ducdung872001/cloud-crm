import React, { Fragment, useCallback, useEffect, useMemo, useState, useRef } from "react";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import Image from "components/image";
import Button from "components/button/button";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { SelectOptionData } from "utils/selectCommon";
// import { uploadImageFromFiles } from "utils/image";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { IActionModal, IOption } from "model/OtherModel";
import { UpdateTreatmentHistoryProps } from "model/treatment/PropsModel";
import { ITreamentRequest } from "model/treatment/TreamentRequestModel";
import TreamentService from "services/TreamentService";
import "./UpdateTreatmentHistory.scss";
import FileService from "services/FileService";

export default function UpdateTreatmentHistory(props: UpdateTreatmentHistoryProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const refInputUpload = useRef<HTMLInputElement>();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoadingService, setIsLoadingService] = useState<boolean>(false);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listService, setListService] = useState<IOption[]>(null);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const onSelectOpenService = async () => {
    if (!listService || listService.length === 0) {
      setIsLoadingService(true);

      const dataOption = await SelectOptionData("service");

      if (dataOption) {
        setListService([{ value: "", label: "Chọn dịch vụ đã mua" }, ...(dataOption.length > 0 ? dataOption : [])]);
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

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);

      const dataOption = await SelectOptionData("employee");

      if (dataOption) {
        setListEmployee([{ value: "", label: "Chọn nhân viên trị liệu" }, ...(dataOption.length > 0 ? dataOption : [])]);
      }

      setIsLoadingEmployee(false);
    }
  };

  useEffect(() => {
    if (data?.employeeId) {
      onSelectOpenEmployee();
    }

    if (data?.employeeId === null) {
      setListEmployee([]);
    }
  }, [data]);

  const values = useMemo(
    () =>
      ({
        serviceId: data?.serviceId ?? null,
        treatmentTh: data?.treatmentTh ?? "0",
        employeeId: data?.employeeId ?? null,
        fmtTreatmentStart: data?.fmtTreatmentStart ?? "",
        fmtTreatmentEnd: data?.fmtTreatmentEnd ?? "",
        fmtScheduleNext: data?.fmtScheduleNext ?? "",
        procDesc: data?.procDesc ?? "",
        note: data?.note ?? "",
        afterProof: data?.afterProof ?? "",
        prevProof: data?.prevProof ?? "",
      } as ITreamentRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "serviceId",
      rules: "required",
    },
    {
      name: "employeeId",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Dịch vụ đã mua",
          name: "serviceId",
          type: "select",
          fill: true,
          required: true,
          options: listService,
          onMenuOpen: onSelectOpenService,
          isLoading: isLoadingService,
        },
        {
          label: "Buổi thứ",
          name: "treatmentTh",
          type: "text",
          fill: true,
        },
        {
          label: "Nhân viên trị liệu",
          name: "employeeId",
          type: "select",
          fill: true,
          required: true,
          options: listEmployee,
          onMenuOpen: onSelectOpenEmployee,
          isLoading: isLoadingEmployee,
        },
        {
          label: "Điều trị lúc",
          name: "fmtTreatmentStart",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "right",
        },
        {
          label: "Xong lúc",
          name: "fmtTreatmentEnd",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "right",
        },
        {
          label: "Buổi tiếp theo",
          name: "fmtScheduleNext",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "right",
        },
        {
          label: "Nội dung làm (thực tế)",
          name: "procDesc",
          type: "textarea",
          fill: true,
        },
        {
          label: "Lời dặn khách hàng",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [listEmployee, listService, isLoadingEmployee, isLoadingService]
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
    setIsSubmit(true);

    const body: ITreamentRequest = {
      ...(formData.values as ITreamentRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await TreamentService.update(body);

    if (response.code === 0) {
      showToast("Cập nhật yêu cầu thực hiện dịch vụ thành công", "success");
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
            disabled: isSubmit || (formData.errors && Object.keys(formData.errors).length > 0) || !isDifferenceObj(formData.values, values),
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
      title: <Fragment>Hủy bỏ thao tác chỉnh sửa</Fragment>,
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

  const handleImageUpload = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const maxSize = 1048576;

      if (e.target.files[0].size > maxSize) {
        showToast("Ảnh tải lên giới hạn dung lượng không quá 2MB", "warning");
        e.target.value = "";
      } else {
        setImagePreview(URL.createObjectURL(e.target.files[0]));
        // uploadImageFromFiles(e.target.files, showImage, false);
        handUploadFile(e.target.files[0]);
        e.target.value = null;
      }
    }
  };

  const showImage = (url, filekey) => {
    setFormData({ ...formData, values: { ...formData.values, afterProof: url } });
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setFormData({ ...formData, values: { ...formData.values, afterProof: result } });
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
        className="modal-update-treatmenthistory"
      >
        <form className="form-treatmenthistory-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Chỉnh sửa yêu cầu thực hiện dịch vụ" toggle={() => !isSubmit && onHide(false)} />
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
              <div className="upload-image d-flex align-items-center justify-content-between">
                <FileUpload type="prevProof" label="Ảnh trước thực hiện" formData={formData} setFormData={setFormData} />
                <div className="after-treatment__image">
                  <label className="label">Ảnh sau thực hiện</label>
                  <div className="file-upload">
                    {formData?.values?.afterProof ? (
                      <Fragment>
                        {imagePreview ? (
                          <Image src={imagePreview} alt={formData?.values?.name} />
                        ) : (
                          <Image src={formData?.values?.afterProof} alt={formData?.values?.name} />
                        )}
                        <span className="actions">
                          <span className="btn-change-image" onClick={() => refInputUpload.current.click()}>
                            Chọn ảnh khác
                          </span>
                          |
                          <Button
                            type="button"
                            className="btn-remove-image"
                            color="link"
                            onClick={(e) => {
                              e.preventDefault();
                              setFormData({ ...formData, values: { ...formData.values, afterProof: "" } });
                            }}
                          >
                            Xoá
                          </Button>
                        </span>
                      </Fragment>
                    ) : (
                      <label
                        htmlFor="imageUpload"
                        className={`btn-upload-image${formData?.values?.afterProof ? " has-image" : ""}`}
                        onClick={(e) => (formData?.values?.afterProof ? e.preventDefault() : undefined)}
                      >
                        <span>
                          <Icon name="Upload" />
                          Tải ảnh lên
                        </span>
                      </label>
                    )}
                    <input
                      type="file"
                      accept="image/gif,image/jpeg,image/png,image/jpg"
                      className="d-none"
                      id="imageUpload"
                      onChange={(e) => handleImageUpload(e)}
                      ref={refInputUpload}
                    />
                  </div>
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
