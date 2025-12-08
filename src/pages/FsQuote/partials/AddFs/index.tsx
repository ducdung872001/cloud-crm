import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import FSQuoteService from "services/FSQuoteService";
import ContractCategoryService from "services/ContractCategoryService";

import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import AddFile from "./partials/AddFile";
import { uploadDocumentFormData } from "utils/document";
import WorkProjectService from "services/WorkProjectService";
import Icon from "components/icon";

interface IAddFSProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
}

export default function AddFS(props: IAddFSProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [detailCategory, setDetailCategory] = useState(null);
  const [checkFieldCategory, setCheckFieldCategory] = useState<boolean>(false);
  const [infoFile, setInfoFile] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState(0);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        categoryId: data?.categoryId ?? null,
        fsAttachment: data?.fsAttachment ?? null,
        fsRevenue: data?.fsRevenue ?? null,
        fsBaseline: data?.fsBaseline ?? null,
        fsType: data?.fsType?.toString() ?? "2",
        projectId: data?.projectId ?? null,
      } as any),
    [data, onShow]
  );

  useEffect(() => {
    if (onShow && data) {
      setDetailCategory(data?.categoryId ? { value: data?.categoryId, label: data?.categoryName } : null);
      setDataProject(data?.projectId ? { value: data?.projectId, label: data?.projectName } : null);

      if (data.fsAttachment) {
        setInfoFile({
          fileUrl: data.fsAttachment,
          extension: "xlsx",
        });
      }
    }
  }, [data, onShow]);

  const [lstContractCategory, setLstContractCategory] = useState([]);
  const [isLoadingContractCategory, setIsLoadingContractCategory] = useState<boolean>(false);

  const onSelectOpenContractCategory = async () => {
    setIsLoadingContractCategory(true);

    const params = {
      limit: 100,
    };

    const dataOption = await ContractCategoryService.list(params);

    if (dataOption && dataOption.code === 0) {
      setLstContractCategory([
        ...dataOption.result.items.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        }),
      ]);
    }

    setIsLoadingContractCategory(false);
  };

  useEffect(() => {
    if (onShow && data && data?.categoryId) {
      onSelectOpenContractCategory();
    }
  }, [onShow, data]);

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    // {
    //   name: "categoryId",
    //   rules: "required",
    // },
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
    if (+formData.values.fsType === 2) {
      setFormData({ ...formData, values: { ...formData.values, fsAttachment: "" } });
      setInfoFile(null);
    }
  }, [formData.values.fsType]);

  // const listField: IFieldCustomize[] = [
  //   {
  //     label: "Tên FS",
  //     name: "name",
  //     type: "text",
  //     fill: true,
  //     required: true,
  //   },
  //   {
  //     label: "Danh sách loại hợp đồng",
  //     name: "categoryId",
  //     type: "select",
  //     fill: true,
  //     required: true,
  //     options: lstContractCategory,
  //     onMenuOpen: onSelectOpenContractCategory,
  //     isLoading: isLoadingContractCategory,
  //   },
  // ];

  const loadedOptionCategory = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ContractCategoryService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

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

  const handleChangeValueCategory = (e) => {
    setCheckFieldCategory(false);
    setDetailCategory(e);
    setFormData({ ...formData, values: { ...formData.values, categoryId: e.value } });
  };

  const [dataProject, setDataProject] = useState(null);

  const loadOptionProject = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      parentId: -1,
    };
    const response = await WorkProjectService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: any) => {
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

  const handleChangeValueProject = (e) => {
    setDataProject(e);
    setFormData({ ...formData, values: { ...formData?.values, projectId: e.value } });
  };

  const listField = useMemo(
    () =>
      [
        {
          label: "Chọn loại FS",
          name: "fsType",
          type: "radio",
          fill: true,
          required: true,
          options: [
            {
              value: "2",
              label: "Nhập trực tiếp",
            },
            {
              value: "1",
              label: "Nhập từ ngoài vào",
            },
          ],
        },
        {
          label: "Tên FS",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },

        {
          name: "categoryId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="categoryId"
              name="categoryId"
              label="Loại hợp đồng"
              options={[]}
              fill={true}
              value={detailCategory}
              required={true}
              onChange={(e) => handleChangeValueCategory(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn loại hợp đồng"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionCategory}
              // formatOptionLabel={formatOptionLabelEmployee}
              error={checkFieldCategory}
              message="Loại hợp đồng không được bỏ trống"
              // isLoading={data?.consultantId ? isLoadingEmployee : null}
            />
          ),
        },

        {
          name: "projectId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="projectId"
              name="projectId"
              label={`Dự án`}
              options={[]}
              fill={true}
              value={dataProject}
              required={false}
              onChange={(e) => handleChangeValueProject(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder={`Chọn dự án`}
              additional={{
                page: 1,
              }}
              // error={checkFieldEmployee}
              // message={`Người ${type == 1 ? "thu" : "chi"} không được bỏ trống`}
              loadOptionsPaginate={loadOptionProject}
              // formatOptionLabel={formatOptionLabelEmployee}
              // isLoading={dataCashBook?.employeeId ? isLoadingEmployee : null}
            />
          ),
        },
        {
          label: "Doanh thu",
          name: "fsRevenue",
          type: "number",
          fill: true,
          required: true,
        },

        // ...(formData.values.fsType === '1' ? [
        {
          label: "Tỷ lệ lợi nhuận",
          name: "fsBaseline",
          type: "text",
          fill: true,
          required: true,
        },
        // ] : []),
      ] as IFieldCustomize[],
    [data, formData, checkFieldCategory, detailCategory, dataProject]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (!detailCategory) {
      setCheckFieldCategory(true);
      return;
    }

    setIsSubmit(true);
    const body = {
      ...formData.values,
      ...(data ? { id: data.id } : {}),
      status: 0,
    };

    const response = await FSQuoteService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} fs thành công`, "success");
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
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0) ||
              checkFieldCategory,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldCategory]
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

  const clearForm = (acc) => {
    onHide(acc);
    setDetailCategory(null);
    setCheckFieldCategory(false);
    setInfoFile(null);
    setDataProject(null);
  };

  //Tải mẫu fs
  const takeFileAdd = (data) => {
    if (data) {
      setIsLoadingFile(true);
      uploadDocumentFormData(data, onSuccess, onError, onProgress);
    }
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent.toFixed(0));
      // if (percent = 100) {
      //   setShowProgress(0);
      // }
    }
  };

  //* Đoạn này nhận link file đã chọn
  const onSuccess = (data) => {
    setIsLoadingFile(false);
    if (data) {
      setInfoFile(data);
      setFormData({ ...formData, values: { ...formData.values, fsAttachment: data.fileUrl } });
    }
  };

  //* Đoạn này nếu như mà lỗi không tải lên được thì bắn ra thông báo
  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  useEffect(() => {
    if (isLoadingFile === false) {
      setShowProgress(0);
    }
  }, [isLoadingFile]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-add-fs"
      >
        <form className="form-fs-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} FS`} toggle={() => !isSubmit && clearForm(false)} />
          <ModalBody>
            <div className="container-fs">
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

              {formData.values.fsType === "1" ? (
                <div className="container_template_contract">
                  <div>
                    <span className="title_template">
                      File FS (.xlsx)<span style={{ color: "red" }}>*</span>
                    </span>
                  </div>
                  <div className="box_template">
                    <div className="box__update--attachment">
                      {/* {isLoadingFile ? ( */}
                      <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                        <Icon name="Refresh" />
                        <span className="name-loading">Đang tải...{showProgress}%</span>
                      </div>
                      {/* ) : ( */}
                      <div className={isLoadingFile ? "d-none" : ""}>
                        <AddFile
                          takeFileAdd={takeFileAdd}
                          infoFile={infoFile}
                          setInfoFile={setInfoFile}
                          // setIsLoadingFile={setIsLoadingFile}
                          // dataAttachment={data}
                        />
                      </div>
                      {/* )} */}
                    </div>
                  </div>
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
