import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Tippy from "@tippyjs/react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { AddDepartmentModalProps } from "model/department/PropsModel";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IDepartmentRequest } from "model/department/DepartmentRequestModel";
import { IDepartmentResponse } from "model/department/DepartmentResponseModel";
import DepartmentService from "services/DepartmentService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "tippy.js/animations/scale-extreme.css";
import "./AddDepartmentDirectoryModal.scss";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import { SelectOptionData } from "utils/selectCommon";
import { ContextType, UserContext } from "contexts/userContext";

export interface IJobTitles {
  title: string;
  position: number;
  isTitle: boolean;
  isPostion: boolean;
}

export default function AddDepartmentDirectoryModal(props: AddDepartmentModalProps) {
  const { onShow, onHide, idDepartment } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [addJobTitles, setAddJobTitles] = useState<IJobTitles[]>([{ title: "", position: undefined, isTitle: false, isPostion: false }]);
  const [detailDepartment, setDetailDepartment] = useState<IDepartmentResponse>(null);

  //! đoạn này call API chi tiết một phòng ban
  const getDetailDepartment = async () => {
    const response = await DepartmentService.detail(idDepartment);

    if (response.code === 0) {
      setDetailDepartment(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (idDepartment !== null && onShow) {
      getDetailDepartment();
    } else {
      setDetailDepartment(null);
      setAddJobTitles([{ title: "", position: undefined, isTitle: false, isPostion: false }]);
    }
  }, [idDepartment, onShow]);

  const [listBeautyBranch, setListBeautyBranch] = useState<IOption[]>(null);
  const [isLoadingBeautyBranch, setIsLoadingBeautyBranch] = useState<boolean>(false);
  const [branchId, setBranchId] = useState(null);

  const branchList = async () => {
    const param: IBeautyBranchFilterRequest = {
      name: "",
      page: 1,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;
      if (dataOption?.length === 1) {
        setBranchId(dataOption[0].id);
      }
    }
  };

  useEffect(() => {
    if (!detailDepartment?.branchId && !detailDepartment?.id) {
      branchList();
    } else {
      setBranchId(null);
    }
  }, [detailDepartment, onShow]);

  const onSelectOpenBeautyBranch = async () => {
    if (!listBeautyBranch || listBeautyBranch.length === 0) {
      setIsLoadingBeautyBranch(true);
      const dataOption = await SelectOptionData("beautyBranch");
      if (dataOption) {
        setListBeautyBranch([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingBeautyBranch(false);
    }
  };

  useEffect(() => {
    if (detailDepartment?.branchId && checkUserRoot == "1") {
      onSelectOpenBeautyBranch();
    }
    if (detailDepartment?.branchId == null && !detailDepartment?.id) {
      if (branchId && checkUserRoot == "1") {
        onSelectOpenBeautyBranch();
      } else {
        setListBeautyBranch([]);
      }
    }
  }, [detailDepartment, checkUserRoot, branchId]);

  const [isLoadingDepartmnent, setIsLoadingDepartmnent] = useState<boolean>(false);
  const [listDepartmnent, setListDepartmnent] = useState<IOption[]>(null);

  const onSelectOpenDepartmnent = async () => {
    if (!listDepartmnent || listDepartmnent.length === 0) {
      setIsLoadingDepartmnent(true);
      const dataOption = await SelectOptionData("department", { branchId: dataBranch.value });
      if (dataOption) {
        setListDepartmnent([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingDepartmnent(false);
    }
  };

  useEffect(() => {
    if (detailDepartment?.parentId) {
      onSelectOpenDepartmnent();
    }

    if (detailDepartment?.parentId == null) {
      setListDepartmnent([]);
    }
  }, [detailDepartment]);

  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId", { branchId: dataBranch.value });
      if (dataOption) {
        setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  useEffect(() => {
    if (detailDepartment?.managerId) {
      onSelectOpenEmployee();
    }

    if (detailDepartment?.managerId === null) {
      setListEmployee([]);
    }
  }, [detailDepartment, onShow]);

  const values = useMemo(
    () =>
      ({
        parentId: detailDepartment?.parentId ?? "",
        branchId: checkUserRoot == "1" ? detailDepartment?.branchId ?? dataBranch.value ?? null : 0,
        name: detailDepartment?.name ?? "",
        managerId: detailDepartment?.managerId ?? "",
        note: detailDepartment?.note ?? "",
        status: detailDepartment?.status?.toString() ?? "1",
        jobTitles: detailDepartment?.jobTitles ?? [],
        isSale: detailDepartment?.isSale ? detailDepartment?.isSale.toString() : "",
      } as IDepartmentRequest),
    [detailDepartment, onShow, branchId, checkUserRoot, dataBranch]
  );

  const validations: IValidation[] = [
    {
      name: "branchId",
      rules: "required",
    },
    {
      name: "name",
      rules: "required",
    },
    {
      name: "status",
      rules: "required",
    },
  ];

  const listFieldInfoBasic = useMemo(
    () =>
      [
        // {
        //   label: "Chi nhánh",
        //   name: "branchId",
        //   type: "select",
        //   fill: true,
        //   required: true,
        //   options: listBeautyBranch,
        //   onMenuOpen: onSelectOpenBeautyBranch,
        //   isLoading: isLoadingBeautyBranch,
        // },
        {
          label: "Phòng ban quản lý",
          name: "parentId",
          type: "select",
          fill: true,
          required: false,
          options: listDepartmnent,
          onMenuOpen: onSelectOpenDepartmnent,
          isLoading: isLoadingDepartmnent,
        },
        {
          label: "Tên phòng ban",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },

        {
          label: "",
          name: "isSale",
          type: "checkbox",
          options: [
            {
              value: "1",
              label: "Bộ phận bán hàng",
            },
          ],
          fill: true,
        },
        {
          label: "Người phụ trách phòng",
          name: "managerId",
          type: "select",
          fill: true,
          options: listEmployee,
          onMenuOpen: onSelectOpenEmployee,
          isLoading: isLoadingEmployee,
        },
        {
          label: "Trạng thái",
          name: "status",
          type: "select",
          fill: true,
          required: true,
          options: [
            {
              value: "1",
              label: "Đang hoạt động",
            },
            {
              value: "2",
              label: "Tạm dừng hoạt động",
            },
          ],
        },
      ] as IFieldCustomize[],
    [listDepartmnent, isLoadingDepartmnent, listEmployee, isLoadingEmployee]
  );

  const listFieldNote: IFieldCustomize[] = [
    {
      label: "Ghi chú",
      name: "note",
      type: "textarea",
      fill: true,
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

  //! đoạn này xử lý thay đổi giá trị tên chức danh
  const handleChangeValueNameDepartment = (e, idx) => {
    oninput = () => {
      setAddJobTitles((prev) =>
        prev.map((item, index) => {
          if (index === idx) {
            return { ...item, isTitle: false };
          }

          return item;
        })
      );
    };

    const value = e.target.value;

    setAddJobTitles((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, title: value };
        }
        return obj;
      })
    );
  };

  //? đoạn này validate form tên chức danh
  const handhandleChangeBlurNameDepartment = (e, idx) => {
    const value = e.target.value;

    if (value.length === 0) {
      setAddJobTitles((prev) =>
        prev.map((item, index) => {
          if (index === idx) {
            return { ...item, isTitle: true };
          }

          return item;
        })
      );
    }
  };

  //! đoạn này xử lý thay đổi giá trị cập bậc chức danh
  const handleChangeValueRankPosition = (e, idx) => {
    oninput = () => {
      setAddJobTitles((prev) =>
        prev.map((item, index) => {
          if (index === idx) {
            return { ...item, isPostion: false };
          }

          return item;
        })
      );
    };

    const value = e.target.value;

    setAddJobTitles((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, position: +value };
        }
        return obj;
      })
    );
  };

  //? đoạn này validate form cấp bậc chức danh
  const handleChangeBlurRankPosition = (e, idx) => {
    const value = e.target.value;

    if (value.length === 0) {
      setAddJobTitles((prev) =>
        prev.map((item, index) => {
          if (index === idx) {
            return { ...item, isPostion: true };
          }

          return item;
        })
      );
    }
  };

  //! đoạn này xử lý xóa đi một chức danh
  const handleRemoveItemConfig = (idx) => {
    const result = [...addJobTitles];
    result.splice(idx, 1);

    setAddJobTitles(result);
  };

  useEffect(() => {
    setFormData({ ...formData, values: { ...formData.values, jobTitles: addJobTitles } });
  }, [addJobTitles]);

  //! đoạn này hứng data jobTitles từ backend trả về rồi update lại
  useEffect(() => {
    if (detailDepartment?.jobTitles?.length > 0 && detailDepartment?.jobTitles !== null) {
      const changeDataJobTitles = detailDepartment?.jobTitles.map((item) => {
        return {
          ...item,
          isTitle: false,
          isPostion: false,
        };
      });
      setAddJobTitles(changeDataJobTitles);
    }
  }, [detailDepartment]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setListDepartmnent([]);
    setListEmployee([]);
    setAddJobTitles([]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldInfoBasic, ...listFieldNote]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const checkCondition = addJobTitles.map((item) => {
      return {
        ...item,
        isTitle: item.title ? false : true,
        isPostion: item.position ? false : true,
      };
    });

    setAddJobTitles(checkCondition);

    if (checkCondition.filter((item) => item.isTitle || item.isPostion).length > 0) {
      return;
    }

    setIsSubmit(true);

    const body: IDepartmentRequest = {
      ...(formData.values as IDepartmentRequest),
      ...(formData.values.isSale === "" ? { isSale: "0" } : { isSale: formData.values.isSale }),
      ...(detailDepartment ? { id: detailDepartment.id } : {}),
    };

    const response = await DepartmentService.update(body);

    if (response.code === 0) {
      showToast(`${detailDepartment ? "Cập nhật" : "Thêm mới"} phòng ban`, "success");
      handleClearForm(true);
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
              !isDifferenceObj(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: detailDepartment ? "Cập nhật" : "Tạo mới",
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
      title: <Fragment>{`Hủy bỏ thao tác ${detailDepartment ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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
        className="modal-add-department"
      >
        <form className="form-department-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${detailDepartment ? "Chỉnh sửa" : "Thêm mới"} phòng ban`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="list-form-info-basic">
                {listFieldInfoBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldInfoBasic, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
              <div className="list-form-config-department">
                <label className="title-add-department">Tạo chức danh</label>
                {addJobTitles.map((item, idx) => {
                  return (
                    <div key={idx} className="field-config-item">
                      <div className="change-value-config">
                        <div className="form-group">
                          <Input
                            type="text"
                            value={item.title}
                            fill={true}
                            error={item.isTitle}
                            message="Tên chức danh không được để trống"
                            placeholder="Nhập tên chức danh"
                            onChange={(e) => handleChangeValueNameDepartment(e, idx)}
                            onBlur={(e) => handhandleChangeBlurNameDepartment(e, idx)}
                          />
                        </div>
                        <div className="form-group">
                          <NummericInput
                            value={item.position}
                            fill={true}
                            error={item.isPostion}
                            message="Cấp bậc không được để trống"
                            thousandSeparator={true}
                            placeholder="Nhập cấp bậc chức danh"
                            onChange={(e) => handleChangeValueRankPosition(e, idx)}
                            onBlur={(e) => handleChangeBlurRankPosition(e, idx)}
                          />
                        </div>
                      </div>
                      <div className={`action-change ${item.isPostion || item.isTitle ? "keep-position" : ""}`}>
                        <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                          <span
                            className="icon-add"
                            onClick={() => setAddJobTitles([...addJobTitles, { title: "", position: undefined, isTitle: false, isPostion: false }])}
                          >
                            <Icon name="PlusCircleFill" />
                          </span>
                        </Tippy>

                        {addJobTitles.length > 1 ? (
                          <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                            <span className="icon-delete" onClick={() => handleRemoveItemConfig(idx)}>
                              <Icon name="Trash" />
                            </span>
                          </Tippy>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="list-form-note">
                {listFieldNote.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldNote, setFormData)}
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
