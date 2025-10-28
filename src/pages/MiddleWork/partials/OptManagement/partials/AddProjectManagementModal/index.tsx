import React, { useState, useEffect, useMemo, Fragment, useCallback, useContext } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddWorkProjectModalProps } from "model/workProject/PropsModel";
import { IWorkProjectRequestModel } from "model/workProject/WorkProjectRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IWorkProjectResponseModel } from "model/workProject/WorkProjectResponseModel";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import CustomScrollbar from "components/customScrollbar";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import ImgExcel from "assets/images/img-excel.png";
import ImgWord from "assets/images/img-word.png";
import ImgPowerpoint from "assets/images/img-powerpoint.png";
import FileService from "services/FileService";
import ImageThirdGender from "assets/images/third-gender.png";
import WorkProjectService from "services/WorkProjectService";
import EmployeeService from "services/EmployeeService";
import DepartmentService from "services/DepartmentService";
import { ContextType, UserContext } from "contexts/userContext";
import { uploadDocumentFormData } from "utils/document";
import "./index.scss";

export default function AddProjectManagementModal(props: IAddWorkProjectModalProps) {
  const { onShow, onHide, idData } = props;

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //! đoạn này lấy ra danh sách ảnh tài liệu dự án
  const [listImageWork, setListImageWork] = useState([]);

  const [data, setData] = useState<IWorkProjectResponseModel>(null);

  const getDetailProjectManagement = async (id: number) => {
    const response = await WorkProjectService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      const dataLstParticipant = (result?.lstParticipant || []).map((el) => {
        return {
          value: el.id,
          label: el.name,
          avatar: el.avatar,
        };
      });

      setDataParticipant(dataLstParticipant);

      setData({
        id: result.id,
        name: result?.name ?? "",
        code: result?.code ?? "",
        startTime: result?.startTime ?? new Date(),
        endTime: result?.endTime ?? "",
        description: result?.description ?? "",
        participants: result?.participants ?? "[]",
        employeeId: result?.employeeId ?? null,
        departmentId: result?.departmentId ?? null,
        docLink: result?.docLink ?? "[]",
        parentId: 0,
      });
    }
  };

  useEffect(() => {
    if (onShow && idData) {
      getDetailProjectManagement(idData);
    }
  }, [onShow, idData]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        code: data?.code ?? "",
        startTime: data?.startTime ?? new Date(),
        endTime: data?.endTime ?? "",
        description: data?.description ?? "",
        participants: data?.participants ?? "[]",
        employeeId: data?.employeeId ?? null,
        departmentId: data?.departmentId ?? null,
        docLink: JSON.parse(data?.docLink || "[]") ?? [],
        parentId: 0,
      } as IWorkProjectRequestModel),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "startTime",
      rules: "required",
    },
    {
      name: "endTime",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  //! đoạn này xử lý vấn đề validate chọn ít nhất 1 người tham gia dự án
  const [dataParticipant, setDataParticipant] = useState(null);
  // const [validateParticipant, setValidateParticipant] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra những người tham gia
  const loadedOptionParticipant = async (search, loadedOptions, { page }) => {
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

  const handleChangeValueParticipant = (data) => {
    setDataParticipant(data);

    const result = (data || []).map((item) => +item.value);
    setFormData({ ...formData, values: { ...formData.values, participants: JSON.stringify(result) } });
  };

  //! đoạn này xử lý vấn đề hiển thị hình ảnh người tham gia
  const formatOptionLabelParticipant = ({ value, label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //* đoạn này xử lý vấn đề lấy ra danh sách phòng ban
  const [dataDepartment, setDataDepartment] = useState(null);

  const loadedOptionDepartment = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
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

  const handleChangeValueDepartment = (e) => {
    setDataDepartment(e);
    setFormData({ ...formData, values: { ...formData?.values, departmentId: +e.value } });
  };

  //* đoạn này xử lý vấn đề lấy ra danh sách người quản lý dự án
  const [dataEmployee, setDataEmployee] = useState(null);
  const [validateEmployee, setValidateEmployee] = useState<boolean>(false);

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      departmentId: dataDepartment?.value,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items || [];

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

  //? đoạn này xử lý vấn đề thay đổi người quản lý dự án
  const handleChangeValueEmployee = (e) => {
    setValidateEmployee(false);
    setDataEmployee(e);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: +e.value } });
  };

  //* đoạn này xử lý vấn đề hiển thị hình ảnh người quản lý dự án
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

  //! đoạn này xử lý vấn đề call api chi tiết người quản lý dự án
  const getDetailEmployee = async () => {
    const response = await EmployeeService.detail(data?.employeeId);

    if (response.code === 0) {
      const result = response.result;
      setDataEmployee({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
      });
    }
  };

  useEffect(() => {
    if (data?.employeeId && onShow) {
      getDetailEmployee();
    }
  }, [data?.employeeId, onShow]);

  //! đoạn này xử lý vấn đề call api chi tiết phòng ban
  const getDetailDepartment = async () => {
    const response = await DepartmentService.detail(data?.departmentId);

    if (response.code === 0) {
      const result = response.result;
      setDataDepartment({
        value: result.id,
        label: result.name,
      });
    }
  };

  useEffect(() => {
    if (data?.departmentId && onShow) {
      getDetailDepartment();
    }
  }, [data?.departmentId, onShow]);

  //! đoạn này xử lý vấn đề fill giá trị ban đầu tk là người quản lý
  // const getDetailEmployeeInfo = async () => {
  //   const response = await EmployeeService.info();
  //   if (response.code === 0) {
  //     const result = response.result;

  //     setDataEmployee({
  //       value: result.id,
  //       label: result.name,
  //       avatar: result.avatar,
  //     });

  //     setFormData({ ...formData, values: { ...formData?.values, employeeId: result.id } });
  //   }
  // };

  // useEffect(() => {
  //   if (onShow && data === null) {
  //     getDetailEmployeeInfo();
  //   }
  // }, [data, onShow]);

  //! đoạn này xử lý vấn đề nếu như mà có tài liệu lúc update thì view ra giao diện
  useEffect(() => {
    if (data && data.docLink) {
      const result = JSON.parse(data.docLink || "[]");
      setListImageWork(result);
    }
  }, [data]);

  //! đoạn này xử lý hình ảnh
  const handleImageUpload = (e) => {
    e.preventDefault();

    e.preventDefault();

    const file = e.target.files[0];

    const checkFile = file.type;

    if (checkFile.startsWith("image")) {
      handUploadFile(file);
    }

    if (checkFile.startsWith("application")) {
      uploadDocumentFormData(file, onSuccess, onError, onProgress);
    }
  };

  //* Xử lý tài liệu
  const [showProgress, setShowProgress] = useState<number>(0);

  const onSuccess = (data) => {
    if (data) {
      const result = {
        url: data.fileUrl,
        type: data.extension,
      };

      setListImageWork([...listImageWork, result]);
    }
  };

  const onError = (message) => {
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent);

      if (percent >= 99) {
        setShowProgress(0);
      }
    }
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    const changeResult = {
      url: result,
      type: "image",
    };
    setListImageWork([...listImageWork, changeResult]);
  };

  useEffect(() => {
    setFormData({ ...formData, values: { ...formData.values, docLink: listImageWork } });
  }, [listImageWork]);

  const handleRemoveImageItem = (idx) => {
    const result = [...listImageWork];
    result.splice(idx, 1);
    setListImageWork(result);
  };

  // lấy thông tin ngày bắt đầu tiếp nhận, và ngày cuối cùng tiếp nhận
  const startDay = new Date(formData.values.startTime).getTime();
  const endDay = new Date(formData.values.endTime).getTime();

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Tên dự án",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mã dự án",
          name: "code",
          type: "text",
          fill: true,
        },
        {
          label: "Bắt đầu",
          name: "startTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          isWarning: startDay > endDay,
          placeholder: "Nhập thời gian bắt đầu",
          messageWarning: "Ngày bắt đầu nhỏ hơn ngày kết thúc",
        },
        {
          label: "Kết thúc",
          name: "endTime",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          isWarning: endDay < startDay,
          placeholder: "Nhập thời gian kết thúc",
          messageWarning: "Ngày kết thúc lớn hơn ngày bắt đầu",
        },
        {
          label: "Nội dung dự án",
          name: "description",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [startDay, endDay]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listFieldBasic);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (dataEmployee === null) {
      setValidateEmployee(true);
      return;
    }

    setIsSubmit(true);

    const body: IWorkProjectRequestModel = {
      ...(formData.values as IWorkProjectRequestModel),
      ...(data ? { id: data.id } : {}),
      docLink: JSON.stringify(listImageWork),
    };

    const response = await WorkProjectService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} thư mục dự án thành công`, "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setData(null);
    setDataEmployee(null);
    setDataParticipant(null);
    setDataDepartment(null);
    setListImageWork([]);
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
              _.isEqual(formData?.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: idData ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              startDay > endDay ||
              endDay < startDay ||
              _.isEqual(formData?.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, startDay, endDay, idData]
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
        handleClearForm(false);
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
          handleClearForm(false);
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
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-project"
      >
        <form className="form-add-project" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} dự án`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <CustomScrollbar width="100%" height="50rem">
              <div className="list-form-group">
                <div className="form-group">
                  <SelectCustom
                    id="departmentId"
                    name="departmentId"
                    label="Phòng ban phụ trách"
                    options={[]}
                    fill={true}
                    required={true}
                    isAsyncPaginate={true}
                    additional={{
                      page: 1,
                    }}
                    value={dataDepartment}
                    onChange={(e) => handleChangeValueDepartment(e)}
                    loadOptionsPaginate={loadedOptionDepartment}
                    placeholder="Chọn phòng ban phụ trách"
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id="employeeId"
                    name="employeeId"
                    label="Người quản lý dự án"
                    options={[]}
                    fill={true}
                    required={true}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn phòng ban để xem người quản lý dự án"
                    disabled={!dataDepartment}
                    additional={{
                      page: 1,
                    }}
                    value={dataEmployee}
                    onChange={(e) => handleChangeValueEmployee(e)}
                    loadOptionsPaginate={loadedOptionEmployee}
                    formatOptionLabel={formatOptionLabelEmployee}
                    error={validateEmployee}
                    message="Vui lòng chọn người quản lý dự án"
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id="participants"
                    name="participants"
                    label="Người tham gia"
                    options={[]}
                    fill={true}
                    isMulti={true}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn người tham gia"
                    additional={{
                      page: 1,
                    }}
                    value={dataParticipant}
                    onChange={(e) => handleChangeValueParticipant(e)}
                    loadOptionsPaginate={loadedOptionParticipant}
                    formatOptionLabel={formatOptionLabelParticipant}
                  />
                </div>
                {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    field={field}
                    key={index}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                    formData={formData}
                  />
                ))}
                <div className="form-group">
                  <div className="attachments">
                    <label className="title-attachment">Tải tài liệu lên</label>
                    <div className={listImageWork.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                      {listImageWork.length === 0 ? (
                        <label htmlFor="imageUpload" className="action-upload-image">
                          <div className="wrapper-upload">
                            <Icon name="Upload" />
                            Tải tài liệu lên
                          </div>
                        </label>
                      ) : (
                        <Fragment>
                          <div className="d-flex align-items-center">
                            {listImageWork.map((item, idx) => (
                              <div key={idx} className="image-item">
                                <img
                                  src={
                                    item.type == "xlsx" ? ImgExcel : item.type === "docx" ? ImgWord : item.type === "pptx" ? ImgPowerpoint : item.url
                                  }
                                  alt="image-warranty"
                                />
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
                      accept="image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
                      className="d-none"
                      id="imageUpload"
                      onChange={(e) => handleImageUpload(e)}
                    />
                  </div>
                </div>
              </div>
            </CustomScrollbar>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
