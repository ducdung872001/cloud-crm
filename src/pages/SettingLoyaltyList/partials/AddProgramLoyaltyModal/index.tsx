import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./index.scss";
import { AddProgramRoyaltyModalProps } from "@/model/loyalty/PropsModal";
import { IProgramRoyaltyRequest } from "@/model/loyalty/RoyaltyRequest";
import LoyaltyService from "@/services/LoyaltyService";
import Icon from "@/components/icon";
import EmployeeService from "@/services/EmployeeService";
import SelectCustom from "components/selectCustom/selectCustom";
import BusinessProcessService from "@/services/BusinessProcessService";
import BeautyBranchService from "@/services/BeautyBranchService";
import ImgPushCustomer from "assets/images/img-push.png";
import ImageThirdGender from "assets/images/third-gender.png";
import moment from "moment";

export default function AddProgramLoyaltyModal(props: AddProgramRoyaltyModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [employeeIdDefault, setEmployeeIdDefault] = useState(null);
  const [countCheckAddBranch, setCountCheckAddBranch] = useState(0);
  const [listBranch, setListBranch] = useState<IOption[]>(null);
  const [processData, setProcessData] = useState<any>(null);
  const [startNodeData, setStartNodeData] = useState<any>(null);

  const values = useMemo(
    () =>
    ({
      ...data,
      name: data?.name ?? "",
      branchIds: data?.branchIds ? (typeof data.branchIds === "string" ? JSON.parse(data.branchIds) : data.branchIds) : [],
      active: data?.active ?? true,
      priorityLevel: data?.priorityLevel ?? 0,
      processCode: data?.processCode ?? "",
      startDate: data?.startDate ? moment(data.startDate) : "",
      endDate: data?.endDate ? moment(data.endDate) : "",
    } as IProgramRoyaltyRequest),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const onSelectOpenBranch = async () => {
    if (!listBranch || listBranch.length === 0) {
      setCountCheckAddBranch((prev) => prev + 1);
      const res = await BeautyBranchService.list({ page: 1, limit: 10 });
      if (res.code === 0) {
        setListBranch((res.result.items || []).map((item) => ({
          value: item.id,
          label: item.name,
        })));
      }
    }
  };
  useEffect(() => {
    if (data?.branchIds?.length > 0) {
      onSelectOpenBranch();
    }

    if (data?.branchIds == null) {
      setListBranch([]);
    }
  }, [data]);

  useEffect(() => {
    if (data?.branchIds && listBranch?.length > 0) {
      const branchIds: number[] =
        typeof data.branchIds === "string"
          ? JSON.parse(data.branchIds)
          : data.branchIds || [];

      const selected = listBranch.filter((item) =>
        branchIds.includes(Number(item.value))
      );

      setBranchList(selected);
    }
  }, [data, listBranch]);
  // list chi nhánh áp dụng
  const [branchList, setBranchList] = useState([]);
  const [showModalBranch, setShowModalBranch] = useState(false);

  const loadedOptionBranch = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới chi nhánh", isShowModal: true, avatar: "custom" }] : []),
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
              return {
                value: item.id,
                label: item.name,
              };
            })
            : []),
        ],
        hasMore: response.result?.loadMoreAble ?? false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  useEffect(() => {
    if (!showModalBranch) {
      setCountCheckAddBranch(countCheckAddBranch + 1);
      loadedOptionBranch("", undefined, { page: 1 });
    }
  }, [showModalBranch]);

  const formatOptionLabelBranch = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar" style={avatar == "custom" ? { width: "1.8rem", height: "1.8rem" } : {}}>
          <img src={avatar == "custom" ? ImgPushCustomer : avatar ? avatar : ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };
  const handleChangeValueBranch = (e) => {
    let lastPick = e[e.length - 1];

    if (lastPick?.isShowModal) {
      setShowModalBranch(true);
    } else {
      setBranchList(e);

      const branchIds = e.map((item) => item.value);

      setFormData({
        ...formData,
        values: { ...formData?.values, branchIds }
      });
    }
  };

  //! đoạn này xử lý vấn đề call employee init để lấy ra người phụ trách
  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();

    if (response.code == 0) {
      const result = response.result;
      setEmployeeData({ value: result.id, label: result.name });
      setEmployeeIdDefault(result.id);
    }
  };

  useEffect(() => {
    if (onShow && !data) {
      getDetailEmployeeInfo();
    }
    if (onShow && data) {
      if (data.employeeId) {
        setEmployeeData({ value: data.employeeId, label: data.employeeName || "" });
      }
      if (data.processId) {
        setProcessData({
          value: data.processId,
          label: data.processName ?? data.processCode ?? `Process ${data.processId}`,
          code: data.processCode || ""
        });
        setCountCheckAddStartNode((prev) => prev + 1);
      }
      if (data.startNodeId) {
        setStartNodeData({ value: data.startNodeId, label: String(data.startNodeId) });
      }
    }
  }, [onShow, data]);

  const [countCheckAddEmployee, setCountCheckAddEmployee] = useState(0);
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = { name: search, page: page, limit: 10 };
    const response = await EmployeeService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items || [];
      return {
        options: dataOption.map((item) => ({
          value: item.id,
          label: item.name,
          departmentName: item.departmentName,
        })),
        hasMore: response.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  };
  const handleChangeValueEmployee = (e) => {
    setEmployeeData(e);
    setFormData({ ...formData, values: { ...formData.values, employeeId: e?.value } });
  };

  const [countCheckAddProcess, setCountCheckAddProcess] = useState(0);
  const loadedOptionProcess = async (search, loadedOptions, { page }) => {
    const param = { keyword: search, page: page, limit: 10 };
    const response = await BusinessProcessService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items || [];
      return {
        options: dataOption.map((item) => ({
          value: item.id,
          label: item.name || item.title || `Quy trình ${item.id}`,
          code: item.code || item.processCode,
        })),
        hasMore: response.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  };
  const handleChangeValueProcess = (e) => {
    setProcessData(e);
    setStartNodeData(null);
    setFormData((prev) => ({
      ...prev,
      values: { ...prev.values, startNodeId: null, processId: e?.value, processCode: e?.code || "" },
    }));
    if (e?.value) {
      setCountCheckAddStartNode((prev) => prev + 1);
    }
  };

  const [countCheckAddStartNode, setCountCheckAddStartNode] = useState(0);
  const loadedOptionStartNode = async (search, loadedOptions, { page }) => {
    const pid = formData?.values?.processId;
    if (!pid) return { options: [], hasMore: false };
    const param = { keyword: search, page: page, limit: 10, processId: pid };
    const response = await BusinessProcessService.bpmListNode(param);
    if (response.code === 0) {
      const dataOption = response.result.items || response.result || [];
      // bpmListNode thường trả về mảng trực tiếp hoặc có items
      const targetArray = Array.isArray(dataOption) ? dataOption : [];
      return {
        options: targetArray.map((item) => ({
          value: item.nodeId,
          label: item.name || item.nodeId,
        })),
        hasMore: response.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  };
  const handleChangeValueStartNode = (e) => {
    setStartNodeData(e);
    setFormData({ ...formData, values: { ...formData.values, startNodeId: e?.value } });
  };


  const validateDateRange = (values: any) => {
    const errors: Record<string, string> = {};
    if (values?.startDate && values?.endDate) {
      const start = moment(values.startDate);
      const end = moment(values.endDate);
      if (start.isValid() && end.isValid() && !start.isBefore(end)) {
        errors["endDate"] = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }
    return errors;
  };

  const validations: IValidation[] = [
    {
      name: "name",
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
          label: "Tên chương trình khách hàng thân thiết",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          name: "branchIds",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddBranch}
              id="branchIds"
              name="branchIds"
              label="Chi nhánh áp dụng"
              fill={true}
              options={[]}
              isMulti={true}
              value={branchList}
              onChange={(e) => handleChangeValueBranch(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionBranch}
              placeholder="Chọn chi nhánh"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelBranch}
            />
          ),
        },
        {
          name: "processId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddProcess}
              id="processId"
              name="processId"
              label="Quy trình"
              fill={true}
              options={[]}
              value={processData}
              onChange={(e) => handleChangeValueProcess(e)}
              isAsyncPaginate={true}
              loadOptionsPaginate={loadedOptionProcess}
              placeholder="Chọn quy trình"
              additional={{ page: 1 }}
            />
          ),
        },
        {
          name: "startNodeId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddStartNode}
              id="startNodeId"
              name="startNodeId"
              label="Node bắt đầu"
              fill={true}
              options={[]}
              value={startNodeData}
              onChange={(e) => handleChangeValueStartNode(e)}
              isAsyncPaginate={true}
              loadOptionsPaginate={loadedOptionStartNode}
              placeholder="Chọn node bắt đầu"
              additional={{ page: 1 }}
              disabled={!formData?.values?.processId}
            />
          ),
        },
        {
          name: "employeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddEmployee}
              id="employeeId"
              name="employeeId"
              label="Người phụ trách"
              fill={true}
              options={[]}
              value={employeeData}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              loadOptionsPaginate={loadedOptionEmployee}
              placeholder="Chọn người phụ trách"
              additional={{ page: 1 }}
            />
          ),
        },
        {
          label: "Ngày bắt đầu",
          name: "startDate",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập ngày bắt đầu",
        },
        {
          label: "Ngày kết thúc",
          name: "endDate",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập ngày kết thúc",
        },
        {
          label: "Mô tả",
          name: "description",
          type: "textarea",
          fill: true,
        },
        {
          label: "Mức độ ưu tiên",
          name: "priorityLevel",
          type: "number",
          fill: true,
        },
        {
          label: "Trạng thái",
          name: "active",
          type: "select",
          fill: true,
          options: [
            { label: "Kích hoạt", value: true },
            { label: "Không kích hoạt", value: false },
          ],
        },
      ] as IFieldCustomize[],
    [
      employeeData, countCheckAddEmployee,
      processData, countCheckAddProcess,
      startNodeData, countCheckAddStartNode,
      branchList,
      listBranch,
      countCheckAddBranch,
      formData,
    ]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    if (!data?.branchIds) {
      setBranchList([]);
    }
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values, onShow, data]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    const dateErrors = validateDateRange(formData.values);
    const allErrors = { ...errors, ...dateErrors };
    if (Object.keys(allErrors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: allErrors }));
      return;
    }

    setIsSubmit(true);
    const body: IProgramRoyaltyRequest = {
      ...(formData.values as IProgramRoyaltyRequest),
      ...(data ? { id: data.id } : {}),
      processCode: (processData as any)?.code || formData.values.processCode || "",
      branchIds: JSON.stringify(formData.values.branchIds || []),
      startDate: formData.values.startDate && moment(formData.values.startDate).isValid()
        ? moment(formData.values.startDate).format("YYYY-MM-DDTHH:mm:ss")
        : "",
      endDate: formData.values.endDate && moment(formData.values.endDate).isValid()
        ? moment(formData.values.endDate).format("YYYY-MM-DDTHH:mm:ss")
        : "",
    };

    const response = await LoyaltyService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} chương trình thành công`, "success");
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
        className="modal-add-payment-method"
      >
        <form className="form-payment-method" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} chương trình khách hàng thân thiết`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => {
                    handleChangeValidate(value, field, formData, validations, listField, setFormData);
                    if (field.name === "startDate" || field.name === "endDate") {
                      const updatedValues = { ...formData.values, [field.name]: value };
                      const dateErrors = validateDateRange(updatedValues);
                      setFormData((prev) => ({
                        ...prev,
                        errors: {
                          ...prev.errors,
                          endDate: dateErrors["endDate"] ?? undefined,
                        },
                      }));
                    }
                  }}
                  formData={formData}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />{" "}
    </Fragment>
  );
}
