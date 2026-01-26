import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import _ from "lodash";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddWorkModelProps } from "model/workOrder/PropsModel";
import { IWorkOrderRequestModel } from "model/workOrder/WorkOrderRequestModel";
import { IWorkProjectFilterRequest } from "model/workProject/WorkProjectRequestModel";
import { IWorkTypeFilterRequest } from "model/workType/WorkTypeRequestModel";

import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import WorkTypeService from "services/WorkTypeService";
import WorkOrderService from "services/WorkOrderService";
import WorkProjectService from "services/WorkProjectService";

import "./index.scss";
import AttachmentUploader, { UploadedItem } from "components/attachmentUpload";
import { buildListFieldAssign } from "model/assign/buildListFieldAssign";

export default function AddWorkModal(props: IAddWorkModelProps) {
  const { onShow, onHide, idWork, idManagement, startDate, endDate, dataProjectProps, statusProps } = props;

  const [data, setData] = useState<any>(null);

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [validateProject, setValidateProject] = useState<boolean>(false);

  const [showAssign, setShowAssign] = useState(false);

  useEffect(() => {
    if (!onShow) {
      setShowAssign(false);
    }
  }, [onShow]);


  const [dataWorkProject, setDataWorkProject] = useState<any>(null);
  const [dataWorkType, setDataWorkType] = useState<any>(null);

  const [dataManager, setDataManager] = useState<any>(null);
  const [dataEmployee, setDataEmployee] = useState<any>(null);

  const [listImageWork, setListImageWork] = useState<any[]>([]);
  const [validateWordLoad, setValidateWordLoad] = useState(false);

  const refContainerTimeWorkLoad = useRef<HTMLDivElement | null>(null);
  const refOptionTimeWorkLoad = useRef<HTMLUListElement | null>(null);

  const listOptionTimeWorkLoad = useMemo(
    () => [
      { label: "Giờ", value: "HOUR" },
      { label: "Ngày", value: "DAY" },
      { label: "Tuần", value: "WEEK" },
      { label: "Tháng", value: "MONTH" },
    ],
    []
  );

  const [isOptionTimeWorkLoad, setIsOptionTimeWorkLoad] = useState(false);
  const [dataTimeWorkLoad, setDataTimeWorkLoad] = useState<any>(listOptionTimeWorkLoad[0]);

  const getDetailWork = async (id: number) => {
    const response = await WorkOrderService.detail(id);

    if (response.code == 0) {
      const result: any = response.result;

      setDataWorkProject({
        value: result.projectId,
        label: result.projectName,
      });

      setDataWorkType({
        value: result.wteId,
        label: result.workTypeName,
      });

      if (result.managerId) {
        setDataManager({
          value: result.managerId,
          label: result.managerName,
          avatar: result.managerAvatar,
        });
      } else {
        setDataManager(null);
      }

      if (result.employeeId) {
        setDataEmployee({
          value: result.employeeId,
          label: result.employeeName,
          avatar: result.employeeAvatar,
        });
      } else {
        setDataEmployee(null);
      }

      setData(result);
    }
  };

  useEffect(() => {
    if (idWork && onShow) {
      getDetailWork(idWork);
    }
  }, [onShow, idWork]);

  useEffect(() => {
    if (dataProjectProps) {
      setDataWorkProject(dataProjectProps);
    } else {
      setDataWorkProject(null);
    }
  }, [dataProjectProps]);

  //! đoạn này xử lý vấn đề callAPI chi tiết 1 dự án khi thêm mới
  const getDetailProject = async () => {
    const response = await WorkProjectService.detail(idManagement);

    if (response.code == 0) {
      const result = response.result;

      setDataWorkProject({
        value: result.id,
        label: result.name,
      });
    }
  };
  //! đoạn này xử lý vấn đề callAPI chi tiết 1 dự án khi thêm mới

  useEffect(() => {
    if (onShow && idManagement > 0 && !idWork && !dataProjectProps) {
      getDetailProject();
    }
  }, [onShow, idManagement, idWork, dataProjectProps]);

  const values = useMemo(
    () =>
    ({
      name: data?.name ?? "",
      content: data?.content ?? "",
      wteId: data?.wteId ?? null,
      docLink: JSON.parse(data?.docLink || "[]") ?? [],
      projectId: data?.projectId ? data?.projectId : null,
      status: statusProps ?? data?.status ?? 0,
      managerId: data?.managerId ?? null,
      employeeId: data?.employeeId ?? null,
      workLoad: data?.workLoad ?? "",
      priorityLevel: data?.priorityLevel ?? null,
      startTime: data?.startTime ?? null,
      endTime: data?.endTime ?? null,
    } as IWorkOrderRequestModel),
    [onShow, data, idWork, dataWorkProject, statusProps]
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

  const loadedOptionWorkType = async (search, loadedOptions, { page }) => {
    const param: IWorkTypeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await WorkTypeService.list(param);

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

  //? đoạn này xử lý vấn đề thay đổi loại công việc
  const handleChangeValueWorkType = (e) => {
    setDataWorkType(e);
  };

  useEffect(() => {
    if (dataWorkType) {
      setFormData({ ...formData, values: { ...formData?.values, wteId: dataWorkType.value } });
    }
  }, [dataWorkType]);

  useEffect(() => {
    if (data && data.docLink) {
      const result = JSON.parse(data.docLink || "[]");
      setListImageWork(result);
    }
  }, [data]);

  useEffect(() => {
    if (listImageWork && listImageWork.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, docLink: listImageWork } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, docLink: [] } });
    }
  }, [listImageWork]);

  const loadedOptionWorkProject = async (search, loadedOptions, { page }) => {
    const param: IWorkProjectFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      // parentId: -1,
    };
    const response = await WorkProjectService.list(param);
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

  //? đoạn này xử lý vấn đề thay đổi dự án
  const handleChangeValueWorkProject = (e) => {
    setValidateProject(false);
    setDataWorkProject(e);

    setDataEmployee(null);
    setDataManager(null);

    setFormData((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        projectId: e?.value ?? null,
        employeeId: null,
        managerId: null,
      },
    }));
  };

  useEffect(() => {
    if (dataWorkProject) {
      setFormData({ ...formData, values: { ...formData?.values, projectId: dataWorkProject.value } });
    }
  }, [dataWorkProject]);

  // memoize handler để ref ổn định
  const handleChange = useCallback((newList: UploadedItem[]) => {
    setListImageWork(newList);
  }, []);

  const listFieldAddWork = useMemo(
    () =>
      [
        {
          name: "projectId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="projectId"
              name="projectId"
              label="Dự án"
              options={[]}
              fill={true}
              required={true}
              value={dataWorkProject}
              onChange={(e) => handleChangeValueWorkProject(e)}
              isAsyncPaginate={true}
              placeholder="Chọn dự án"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionWorkProject}
              error={validateProject}
              message="Vui lòng chọn dự án"
            />
          ),
        },
        {
          name: "wteId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="wteId"
              name="wteId"
              label="Loại công việc"
              options={[]}
              fill={true}
              value={dataWorkType ? dataWorkType : ""}
              onChange={(e) => handleChangeValueWorkType(e)}
              isAsyncPaginate={true}
              placeholder="Chọn loại công việc"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionWorkType}
            />
          ),
        },
        {
          label: "Tên công việc",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Nội dung công việc",
          name: "content",
          type: "textarea",
          fill: true,
        },
        {
          name: "docLink",
          type: "custom",
          snippet: (
            <AttachmentUploader value={listImageWork} placeholderLabel="Tải tài liệu lên" onChange={handleChange} multiple={true} maxFiles={10} />
          ),
        },
      ] as IFieldCustomize[],
    [formData?.values, listImageWork, dataWorkProject, validateProject, dataWorkType, handleChange]
  );

  const formatOptionLabelManager = (opt: any) => opt?.label ?? opt?.name ?? "";
  const formatOptionLabelEmployee = (opt: any) => opt?.label ?? opt?.name ?? "";

  const handleChangeValueManager = (e: any) => {
    setDataManager(e);
    setFormData((prev) => ({
      ...prev,
      values: { ...prev.values, managerId: e?.value ?? null },
    }));
  };

  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
    setFormData((prev) => ({
      ...prev,
      values: { ...prev.values, employeeId: e?.value ?? null },
    }));
  };

  const handleChangeValueWorkLoad = (e: any) => {
    const value = e?.floatValue ?? e?.value ?? e ?? "";
    setValidateWordLoad(value === "" || value === null || value === undefined);

    setFormData((prev: any) => ({
      ...prev,
      values: { ...prev.values, workLoad: value },
    }));
  };

  const startDay = formData?.values?.startTime ? new Date(formData.values.startTime).getTime() : 0;
  const endDay = formData?.values?.endTime ? new Date(formData.values.endTime).getTime() : 0;

  const listFieldAssign = useMemo(
    () =>
      buildListFieldAssign({
        dataManager,
        dataWorkProject,
        dataEmployee,
        dataTimeWorkLoad,
        listOptionTimeWorkLoad,
        isOptionTimeWorkLoad,

        startDay,
        endDay,
        validateWordLoad,
        formData,

        refContainerTimeWorkLoad,
        refOptionTimeWorkLoad,

        formatOptionLabelManager,
        formatOptionLabelEmployee,
        handleChangeValueManager,
        handleChangeValueEmployee,
        handleChangeValueWorkLoad,

        setIsOptionTimeWorkLoad,
        setDataTimeWorkLoad,
      }),
    [
      dataManager,
      dataWorkProject,
      dataEmployee,
      dataTimeWorkLoad,
      listOptionTimeWorkLoad,
      isOptionTimeWorkLoad,
      startDay,
      endDay,
      validateWordLoad,
      formData?.values,
    ]
  );

  const submitLockRef = useRef(false);

  const onSubmit = async (e) => {
    e?.preventDefault();

    if (submitLockRef.current) return;
    submitLockRef.current = true;

    const errors = Validate(validations, formData, listFieldAddWork);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors }));
      submitLockRef.current = false;
      return;
    }

    if (!formData?.values?.projectId) {
      setValidateProject(true);
      submitLockRef.current = false;
      return;
    }

    if (showAssign && !formData?.values?.wteId) {
      showToast("Vui lòng chọn loại công việc", "error");
      submitLockRef.current = false;
      return;
    }

    if (showAssign) {
      setFormData(prev => ({
        ...prev,
        values: {
          ...prev.values,
          managerId:
            Number(prev.values?.managerId) > 0
              ? prev.values.managerId
              : prev.values.employeeId,
        },
      }));
    }


    setIsSubmit(true);

    try {
      const merged: any = {
        ...(data ?? {}),
        ...(formData.values ?? {}),
        id: (data?.id ?? (formData.values as any)?.id) ?? undefined,
      };

      const body: any = {
        ...merged,
        docLink: JSON.stringify(merged?.docLink ?? []),
        customers: JSON.stringify(merged?.customers ?? []),
        participants: JSON.stringify(merged?.participants ?? []),
        notification: JSON.stringify(merged?.notification ?? {}),
      };

      let response: any;

      if (showAssign) {
        response = await WorkOrderService.updateAndInit(body);
      } else {
        response = await WorkOrderService.update(body);
      }

      if (response?.code === 0) {
        showToast(`${data ? "Cập nhật" : "Thêm mới"} công việc thành công`, "success");
        handleClearForm(true);
      } else {
        showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        setIsSubmit(false);
      }
    } catch (err) {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    } finally {
      submitLockRef.current = false;
    }
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setDataWorkProject(null);
    setDataWorkType(null);
    setData(null);
    setListImageWork([]);

    setShowAssign(false);
    setDataEmployee(null);
    setDataManager(null);
    setIsOptionTimeWorkLoad(false);
    setValidateWordLoad(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_left: {
        buttons:
          startDate && endDate && idWork
            ? [
              {
                title: "Xoá",
                color: "destroy",
                variant: "outline",
                disabled: isSubmit,
                callback: () => showDialogConfirmCancelDelete(idWork),
              },
            ]
            : [],
      },
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              _.isEqual(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: idWork ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              validateProject ||
              (formData?.values?.workLoad !== "" && formData?.values?.workLoad == 0) ||
              _.isEqual(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
          {
            title: showAssign ? "Ẩn giao việc" : "Giao việc",
            type: "button",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => setShowAssign((prev) => !prev),
          },
        ],
      },
    }),
    [formData, values, isSubmit, validateProject, idWork, startDate, endDate, showAssign]
  );

  const onDelete = async (id?: number) => {
    const response = await WorkOrderService.delete(id);

    if (response.code == 0) {
      showToast("Xóa công việc thành công", "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmCancelDelete = (id?: number) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa công việc</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa
          <strong> {data?.name}</strong>? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (id) {
          onDelete(id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
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
    [formData, values, showDialog, focusedElement]
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
        size="xl"
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-work-backlog"
      >
        <form className="form-add-work-backlog" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${idWork ? "Chỉnh sửa" : "Thêm mới"} công việc`}
            toggle={() => !isSubmit && handleClearForm(false)}
          />

          <ModalBody>
            <div className="list-form-group">
              <div className="list-form-group__add">
                <div className="title-work">Nội dung công việc</div>
                {listFieldAddWork.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) =>
                      handleChangeValidate(value, field, formData, validations, listFieldAddWork, setFormData)
                    }
                    formData={formData}
                  />
                ))}
              </div>
              {(idWork || showAssign) ? (
                <div className="list-form-group__assign assign-work-panel">
                  <div className="title-work">Giao việc</div>
                  {listFieldAssign.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) =>
                        handleChangeValidate(value, field, formData, validations, listFieldAssign, setFormData)
                      }
                      formData={formData}
                    />
                  ))}
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
