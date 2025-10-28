import React, { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import { isDifferenceObj } from "reborn-util";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddMailBoxModalProps } from "model/mailBox/PropsModel";
import { IActionModal, IOption } from "model/OtherModel";
import { IMailBoxRequestModel } from "model/mailBox/MailBoxRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IDepartmentFilterRequest } from "model/department/DepartmentRequestModel";
import Icon from "components/icon";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import SelectCustom from "components/selectCustom/selectCustom";
import { showToast } from "utils/common";
import { FILE_IMAGE_MAX } from "utils/constant";
// import { uploadImageFromFiles } from "utils/image";
import FileService from "services/FileService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import ImageThirdGender from "assets/images/third-gender.png";
import MailboxService from "services/MailboxService";
import EmployeeService from "services/EmployeeService";
import DepartmentService from "services/DepartmentService";
import "./AddMailBoxModal.scss";

export default function AddMailBoxModal(props: IAddMailBoxModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listDepartment, setListDepartment] = useState<IOption[]>([]);
  const [validateDepartment, setValidateDepartment] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>([]);
  const [validateEmployee, setValidateEmployee] = useState<boolean>(false);
  const [document, setDocument] = useState([]);
  const [showProgressImg, setShowProgressImg] = useState<number>(null);

  const values = useMemo(
    () =>
      ({
        title: data?.title ?? "",
        content: data?.content ?? "",
        departments: data?.departments ?? "",
        employees: data?.employees ?? "",
        attachments: data?.attachments ?? "[]",
      } as IMailBoxRequestModel),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "title",
      rules: "required",
    },
    {
      name: "content",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if (JSON.parse(formData?.values?.attachments || "[]").length > 0) {
      const result = JSON.parse(formData.values.attachments).map((item) => item.url);
      setDocument(result);
    }
  }, [formData?.values?.attachments]);

  //! đoạn này xử lý hình ảnh
  const handleImageUpload = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files[0].size > FILE_IMAGE_MAX) {
        showToast(`Ảnh tải lên giới hạn dung lượng không quá ${FILE_IMAGE_MAX / 1024 / 1024}MB`, "warning");
        e.target.value = "";
      } else {
        // uploadImageFromFiles(e.target.files, showImage, false, getProgress);
        handUploadFile(e.target.files[0]);
        e.target.value = null;
      }
    }
  };

  const showImage = (url, filekey) => {
    setDocument([...document, url]);
  };

  const getProgress = (percent) => {
    setShowProgressImg(percent);

    if (percent == 100) {
      setShowProgressImg(null);
    }
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setDocument([...document, result]);
  };

  useEffect(() => {
    const merge = document.map((item) => {
      return {
        url: item,
        type: "image",
      };
    });
    setFormData({ ...formData, values: { ...formData.values, attachments: JSON.stringify(merge) } });
  }, [document]);

  const handleRemoveDocumentItem = (idx) => {
    const result = JSON.parse(formData.values.attachments);
    result.splice(idx, 1);
    setFormData({ ...formData, values: { ...formData.values, attachments: JSON.stringify(result) } });
  };

  //! Call API danh sách phòng ban nhận email
  const loadedOptionDepartment = async (search, loadedOptions, { page }) => {
    const param: IDepartmentFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await DepartmentService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

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

  // đoạn này xử lý lấy id của phòng ban
  const handleChangeValueDepartment = (data) => {
    setValidateDepartment(false);
    setListDepartment(data);

    const result = data.map((item) => item.value);
    setFormData({ ...formData, values: { ...formData.values, departments: JSON.stringify(result) } });
  };

  //!  Call API danh sách nhân viên nhận email
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
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

  //! đoạn này xử lý vấn đề hiển thị hình ảnh nhân viên
  const formatOptionLabelEmployee = ({ value, label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  // đoạn này xử lý lấy id của nhân viên
  const handleChangeValueEmployee = (data) => {
    setValidateEmployee(false);
    setListEmployee(data);

    const result = data.map((item) => item.value);
    setFormData({ ...formData, values: { ...formData.values, employees: JSON.stringify(result) } });
  };

  const listField = useMemo(
    () =>
      [
        {
          label: "Tiêu đề",
          name: "title",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Nội dung",
          name: "content",
          type: "textarea",
          fill: true,
          required: true,
        },
        {
          name: "departments",
          type: "custom",
          snippet: (
            <SelectCustom
              id="departments"
              name="departments"
              label="Danh sách phòng ban"
              fill={true}
              required={true}
              options={[]}
              isMulti={true}
              value={listDepartment}
              onChange={handleChangeValueDepartment}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionDepartment}
              placeholder="Chọn phòng ban"
              additional={{
                page: 1,
              }}
              error={validateDepartment}
              message="Phòng ban không được bỏ trống"
            />
          ),
        },
        {
          name: "employees",
          type: "custom",
          snippet: (
            <SelectCustom
              id="employees"
              name="employees"
              label="Danh sách nhân viên nhận thư"
              fill={true}
              required={true}
              options={[]}
              isMulti={true}
              value={listEmployee}
              onChange={handleChangeValueEmployee}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionEmployee}
              placeholder="Chọn nhân viên"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelEmployee}
              error={validateEmployee}
              message="Nhân viên không được bỏ trống"
            />
          ),
        },
        {
          name: "attachments",
          type: "custom",
          snippet: (
            <div className="document-attachments">
              <label className="title-attachment">Tài liệu</label>
              <div className={document.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                {JSON.parse(formData.values.attachments || "[]").length === 0 ? (
                  <label htmlFor="imageUpload" className="action-upload-image">
                    <div className="wrapper-upload">
                      <Icon name="Upload" />
                      Tải tài liệu
                    </div>
                  </label>
                ) : (
                  <Fragment>
                    <div className="d-flex align-items-center">
                      {/* {showProgressImg ? (
                        <div className="">{showProgressImg}</div>
                      ) : (
                        JSON.parse(formData.values.attachments || "[]").map((item, idx) => (
                          <div key={idx} className="image-item">
                            <img src={item.url} alt="image-warranty" />
                            <span className="icon-delete" onClick={() => handleRemoveDocumentItem(idx)}>
                              <Icon name="Trash" />
                            </span>
                          </div>
                        ))
                      )}
                       */}
                      {JSON.parse(formData.values.attachments || "[]").map((item, idx) => (
                        <div key={idx} className="image-item">
                          <img src={item.url} alt="image-warranty" />
                          <span className="icon-delete" onClick={() => handleRemoveDocumentItem(idx)}>
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
          ),
        },
      ] as IFieldCustomize[],
    [listDepartment, listEmployee, validateEmployee, validateDepartment, formData, showProgressImg, document]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (listDepartment.length == 0) {
      setValidateDepartment(true);
      return;
    }

    if (listEmployee.length == 0) {
      setValidateEmployee(true);
      return;
    }

    setIsSubmit(true);

    const body: IMailBoxRequestModel = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as IMailBoxRequestModel),
    };

    const response = await MailboxService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} thư nội bộ thành công`, "success");
      onHide(true);
      handClearForm();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
    setIsSubmit(false);
  };

  const handClearForm = () => {
    setDocument([]);
    setListDepartment([]);
    setListEmployee([]);
  };

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
        handClearForm();
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
            disabled:
              isSubmit ||
              validateDepartment ||
              validateEmployee ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, values, validateDepartment, validateEmployee]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-mailbox"
      >
        <form className="form-mailbox" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} thư nội bộ`}
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && handClearForm();
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  field={field}
                  key={index}
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
