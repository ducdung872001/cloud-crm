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
import { SelectOptionData } from "utils/selectCommon";
import EmployeeService from "@/services/EmployeeService";
import SelectCustom from "components/selectCustom/selectCustom";
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
  const [listEmployee, setListEmployee] = useState<IOption[]>([]);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [employeeIdDefault, setEmployeeIdDefault] = useState(null);
  const [countCheckAddBranch, setCountCheckAddBranch] = useState(0);
  const [listBranch, setListBranch] = useState<IOption[]>(null);
  const [isLoadingBranch, setIsLoadingBranch] = useState<boolean>(false);
  const [listProcess, setListProcess] = useState<IOption[]>([]);
  const [isLoadingProcess, setIsLoadingProcess] = useState<boolean>(false);
  const [listStartNode, setListStartNode] = useState<IOption[]>([]);
  const [isLoadingStartNode, setIsLoadingStartNode] = useState<boolean>(false);

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
      setIsLoadingBranch(true);

      const dataOption = await SelectOptionData("branchId");
      if (dataOption) {
        setListBranch([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingBranch(false);
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
      limit: 100,
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
        hasMore: response.result.loadMoreAble,
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
      onSelectOpenEmployee();
      setEmployeeIdDefault(result.id);
    }
  };

  useEffect(() => {
    if (onShow && !data) {
      getDetailEmployeeInfo();
    }
    if (onShow && data) {
      if (data.employeeId) {
        onSelectOpenEmployee({ value: data.employeeId, label: data.employeeName || "" });
      }
      if (data.processId) {
        onSelectOpenProcess({
          value: data.processId,
          label: data.processName,
          code: data.processCode || ""
        });
        onSelectOpenStartNode(data.processId);
      }
    }
  }, [onShow, data]);

  const onSelectOpenEmployee = async (defaultOption?: IOption) => {
    if (listEmployee.length > 0) return;
    setIsLoadingEmployee(true);
    const dataOption = await SelectOptionData("employeeId");
    if (dataOption) {
      const newOptions = defaultOption
        ? [defaultOption, ...dataOption.filter(o => o.value !== defaultOption.value)]
        : dataOption;
      // setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
      setListEmployee(newOptions);
    }
    setIsLoadingEmployee(false);
  };


  const onSelectOpenProcess = async (defaultOption?: IOption & { code?: string }) => {
    if (listProcess.length > 0) return;
    setIsLoadingProcess(true);
    const dataOption = await SelectOptionData("processId");
    if (dataOption) {
      const newOptions = defaultOption
        ? [defaultOption, ...dataOption.filter(o => o.value !== defaultOption.value)]
        : dataOption;
      setListProcess(newOptions);
    }
    setIsLoadingProcess(false);
  };

  const onSelectOpenStartNode = async (selectedProcessId?: number) => {
    const pid = selectedProcessId ?? formData?.values?.processId;
    if (!pid) return;
    setIsLoadingStartNode(true);
    setListStartNode([]);
    const dataOption = await SelectOptionData("startNodeId", { processId: pid });
    if (dataOption) {
      setListStartNode([...(dataOption.length > 0 ? dataOption : [])]);
    }
    setIsLoadingStartNode(false);
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
          label: "Tên chương trình loyalty",
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
          label: "Quy trình",
          name: "processId",
          type: "select",
          fill: true,
          options: listProcess,
          onMenuOpen: onSelectOpenProcess,
          isLoading: isLoadingProcess,
          onChange: (selectedOption) => {
            console.log("selectedOption", selectedOption);
            // reset startNodeId khi đổi quy trình
            setListStartNode([]);
            setFormData((prev) => ({
              ...prev,
              values: { ...prev.values, startNodeId: null, processCode: (selectedOption as any)?.code || "" },
            }));
            if (selectedOption?.value) {
              onSelectOpenStartNode(selectedOption.value);
            }
          },
        },
        {
          label: "Node bắt đầu",
          name: "startNodeId",
          type: "select",
          fill: true,
          options: listStartNode,
          onMenuOpen: onSelectOpenStartNode,
          isLoading: isLoadingStartNode,
          disabled: !formData?.values?.processId,
        },
        {
          label: "Người phụ trách",
          name: "employeeId",
          type: "select",
          fill: true,
          options: listEmployee,
          onMenuOpen: onSelectOpenEmployee,
          isLoading: isLoadingEmployee,
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
      listEmployee,
      isLoadingEmployee,
      listProcess,
      isLoadingProcess,
      listStartNode,
      isLoadingStartNode,
      branchList,
      listBranch,
      isLoadingBranch,
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
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const process = listProcess.find((p) => p.value === formData.values.processId) as IOption & { code?: string };
    const body: IProgramRoyaltyRequest = {
      ...(formData.values as IProgramRoyaltyRequest),
      ...(data ? { id: data.id } : {}),
      processCode: process?.code || "",
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
      showToast(`${data ? "Cập nhật" : "Thêm mới"} chương trình loyalty thành công`, "success");
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
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} chương trình loyalty`} toggle={() => !isSubmit && onHide(false)} />
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
      <Dialog content={contentDialog} isOpen={showDialog} />{" "}
    </Fragment>
  );
}
