import React, { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import _ from "lodash";
import moment from "moment";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddChildProjectModal } from "model/workProject/PropsModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IWorkProjectRequestModel } from "model/workProject/WorkProjectRequestModel";
import { IWorkProjectResponseModel } from "model/workProject/WorkProjectResponseModel";
import Icon from "components/icon";
import CustomScrollbar from "components/customScrollbar";
import Input from "components/input/input";
import ImgExcel from "assets/images/img-excel.png";
import ImgWord from "assets/images/img-word.png";
import ImgPowerpoint from "assets/images/img-powerpoint.png";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import ImageThirdGender from "assets/images/third-gender.png";
import WorkProjectService from "services/WorkProjectService";
import EmployeeService from "services/EmployeeService";
import FileService from "services/FileService";
import "./AddChildProjectModal.scss";
import { uploadDocumentFormData } from "utils/document";

export default function AddChildProjectModal(props: IAddChildProjectModal) {
  const { onShow, callBack, idProjectManagement, idProject } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [detailParentProject, setDetailParentProject] = useState(null);

  // ở case này có đoạn call api WorkProjectService 2 lần không phải là lỗi đâu : 1 lần là chi tiết con 1 lần chi tiết cha

  //! đoạn này lấy ra danh sách ảnh tài liệu dự án
  const [listImageWork, setListImageWork] = useState([]);

  const [dataProjectChildren, setDataProjectChildren] = useState<IWorkProjectResponseModel>(null);

  const getDetailProjectChildren = async (id: number) => {
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

      setDataProjectChildren({
        id: result.id,
        name: result?.name ?? "",
        code: result?.code ?? "",
        startTime: result?.startTime ?? new Date(),
        endTime: result?.endTime ?? "",
        description: result?.description ?? "",
        participants: result?.participants ?? "[]",
        employeeId: result?.employeeId ?? null,
        docLink: result?.docLink ?? [],
        parentId: 0,
      } as any);
    }
  };

  useEffect(() => {
    if (onShow && idProject && idProjectManagement) {
      getDetailProjectChildren(idProject);
    }
  }, [onShow, idProject, idProjectManagement]);

  const values = useMemo(
    () =>
      ({
        name: dataProjectChildren?.name ?? "",
        code: dataProjectChildren?.code ?? "",
        startTime: dataProjectChildren?.startTime ?? new Date(),
        endTime: dataProjectChildren?.endTime ?? "",
        description: dataProjectChildren?.description ?? "",
        participants: dataProjectChildren?.participants ?? "[]",
        employeeId: dataProjectChildren?.employeeId ?? null,
        docLink: JSON.parse(dataProjectChildren?.docLink || "[]") ?? [],
        parentId: idProjectManagement,
      } as IWorkProjectRequestModel),
    [dataProjectChildren, onShow, idProjectManagement]
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

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //* đoạn này xử lý vấn đề call chi tiết 1 dự án cha
  const getDetailParentProject = async () => {
    const response = await WorkProjectService.detail(idProjectManagement);

    if (response.code === 0) {
      const result = response.result;
      setDetailParentProject({
        value: result.id,
        label: result.name,
      });
    }
  };

  useEffect(() => {
    if (onShow && idProjectManagement) {
      getDetailParentProject();
    }
  }, [onShow, idProjectManagement]);

  useEffect(() => {
    if (detailParentProject) {
      setFormData({ ...formData, values: { ...formData?.values, parentId: detailParentProject?.value } });
    }
  }, [detailParentProject]);

  //! đoạn này xử lý vấn đề validate chọn ít nhất 1 người tham gia dự án
  const [dataParticipant, setDataParticipant] = useState(null);

  //! đoạn này xử lý vấn đề lấy ra những người tham gia
  const loadedOptionParticipant = async (search, loadedOptions, { page }) => {
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

  const handleChangeValueParticipant = (dataProjectChildren) => {
    setDataParticipant(dataProjectChildren);

    const result = (dataProjectChildren || []).map((item) => +item.value);
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

  //* đoạn này xử lý vấn đề lấy ra danh sách người quản lý dự án
  const [dataEmployee, setDataEmployee] = useState(null);
  const [validateEmployee, setValidateEmployee] = useState<boolean>(false);

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
    const response = await EmployeeService.detail(dataProjectChildren?.employeeId);

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
    if (dataProjectChildren?.id && onShow) {
      getDetailEmployee();
    }
  }, [dataProjectChildren?.id, onShow]);

  //! đoạn này xử lý vấn đề fill giá trị ban đầu tk là người quản lý
  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();
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
    if (dataEmployee) {
      setFormData({ ...formData, values: { ...formData?.values, employeeId: dataEmployee?.value } });
    }
  }, [dataEmployee]);

  useEffect(() => {
    if (onShow && dataProjectChildren === null) {
      getDetailEmployeeInfo();
    }
  }, [dataProjectChildren, onShow]);

  //! đoạn này xử lý vấn đề nếu như mà có tài liệu lúc update thì view ra giao diện
  useEffect(() => {
    if (dataProjectChildren && dataProjectChildren.docLink) {
      const result = JSON.parse(dataProjectChildren.docLink || "[]");
      setListImageWork(result);
    }
  }, [dataProjectChildren]);

  //! đoạn này xử lý hình ảnh
  const handleImageUpload = (e) => {
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
    setListImageWork([...listImageWork, result]);
  };

  // lấy thông tin ngày bắt đầu tiếp nhận, và ngày cuối cùng tiếp nhận
  const startDay = moment(formData.values.startTime).format("DD/MM/YYYY");
  const endDay = moment(formData.values.endTime).format("DD/MM/YYYY");

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
      ...(dataProjectChildren ? { id: dataProjectChildren.id } : {}),
      docLink: JSON.stringify(listImageWork),
    };

    const response = await WorkProjectService.update(body);

    if (response.code === 0) {
      showToast(`${dataProjectChildren ? "Cập nhật" : "Thêm mới"} thư mục dự án thành công`, "success");
      callBack(true);
      setDataEmployee(null);
      setDataParticipant(null);
      setListImageWork([]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  useEffect(() => {
    //TODO: Khi mà chuyền function như này rất dễ bị dính cảnh bảo rò rỉ bộ nhớ, cách fix là clear nó đi
    return () => {
      callBack(false);
    };
  }, []);

  const handleClearForm = () => {
    callBack(false);
    setDataParticipant(null);
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
              _.isEqual(formData?.values, values) ? handleClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: idProjectManagement ? "Cập nhật" : "Tạo mới",
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
    [formData, values, isSubmit, startDay, endDay, idProjectManagement]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataProjectChildren ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        callBack(false);
        setShowDialog(false);
        setContentDialog(null);
        setDataEmployee(null);
        setDataParticipant(null);
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
          callBack(false);
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
        toggle={() => !isSubmit && callBack(false)}
        className="modal-add-child-project"
      >
        <form className="form-add-child-project" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${dataProjectChildren ? "Chỉnh sửa" : "Thêm mới"} dự án`}
            toggle={() => {
              !isSubmit && callBack(false);
              !isSubmit && setDataEmployee(null);
              !isSubmit && setDataParticipant(null);
            }}
          />
          <ModalBody>
            <CustomScrollbar width="100%" height="50rem">
              <div className="list-form-group">
                {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    field={field}
                    key={index}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                    formData={formData}
                  />
                ))}

                <div className="form-group">
                  <Input
                    id="parentId"
                    name="parentId"
                    fill={true}
                    disabled={true}
                    required={true}
                    label="Dự án cha"
                    value={detailParentProject?.label ?? ""}
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
                    placeholder="Chọn người quản lý dự án"
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
