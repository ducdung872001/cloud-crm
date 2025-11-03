import React, { useState, useEffect, useMemo, Fragment, useCallback, useContext } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddEmployeeModalProps } from "model/employee/PropsModel";
import { IEmployeeRequest } from "model/employee/EmployeeRequestModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import Validate, { handleChangeValidate } from "utils/validate";
import { EMAIL_REGEX, PHONE_REGEX } from "utils/constant";
import { SelectOptionData } from "utils/selectCommon";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import EmployeeService from "services/EmployeeService";
import DepartmentService from "services/DepartmentService";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import { ContextType, UserContext } from "contexts/userContext";
import TextArea from "components/textarea/textarea";
import SelectCustom from "components/selectCustom/selectCustom";
import Icon from "components/icon";

import "./AddEmployeeModal.scss";
import Input from "components/input/input";
import { isEqual, set } from "lodash";

export default function AddEmployeeModal(props: AddEmployeeModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const checkUserRoot = localStorage.getItem("user.root");

  const { dataBranch } = useContext(UserContext) as ContextType;

  const [dataLstEmployeeRole, setDataLstEmployeeRole] = useState(null);

  const handleDetailEmployee = async (id: number) => {
    if (!id) return;

    const response = await EmployeeService.detail(id);
    if (response.code === 0) {
      const result = (response.result?.lstEmployeeRole || []).map((item) => {
        return {
          departmentId: item.departmentId,
          departmentValue: item.departmentName,
          jteId: item.id,
          jteValue: item.title,
        };
      });

      setLstRole(result.length > 0 ? result : [defaultRole]);

      setDataLstEmployeeRole(() => {
        return JSON.stringify(
          result.map((item) => {
            return {
              departmentId: item.departmentId,
              jteId: item.jteId,
            };
          })
        );
      });
    }
  };

  const [loadingListRole, setLoadingListRole] = useState<boolean>(false);

  useEffect(() => {
    if (data && onShow) {
      handleDetailEmployee(data.id);
      setLoadingListRole(true);
      handleGetRole(data.id);
    }
  }, [data, onShow]);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  //? đoạn này lấy danh sách chi nhánh
  const [listBeautyBranch, setListBeautyBranch] = useState<IOption[]>(null);
  const [isLoadingBeautyBranch, setIsLoadingBeautyBranch] = useState<boolean>(false);

  //? đoạn này lấy danh sách phòng ban
  const [listDepartment, setListDepartment] = useState<IOption[]>(null);
  const [isLoadingDepartment, setIsLoadingDepartment] = useState<boolean>(false);

  //? đoạn này lấy danh sách chức vụ phụ thuộc vào phòng ban
  const [listJobTitle, setListJobTitle] = useState<IOption[]>(null);
  const [isLoadingJobTitle, setIsLoadingJobTitle] = useState<boolean>(false);

  //? đoạn này lấy danh sách người quản lý
  const [listManager, setListManager] = useState<IOption[]>(null);
  const [isLoadingManager, setIsLoadingManager] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề call api chi nhánh

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
    if (!data?.branchId && !data?.id) {
      branchList();
    } else {
      setBranchId(null);
    }
  }, [data, onShow]);

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

  //? đoạn này kiểm tra điều kiện call api chi nhánh
  useEffect(() => {
    if (data?.branchId && checkUserRoot == "1") {
      onSelectOpenBeautyBranch();
    }
    if (data?.branchId == null && !data?.id) {
      if (branchId && checkUserRoot == "1") {
        onSelectOpenBeautyBranch();
      } else {
        setListBeautyBranch([]);
      }
    }
  }, [data, checkUserRoot, branchId]);

  //! đoạn này xử lý vấn đề call api người giám sát nhân viên
  const onSelectOpenManager = async () => {
    if (!listManager || listManager.length === 0) {
      setIsLoadingManager(true);
      const dataOption = await SelectOptionData("employeeId", { branchId: dataBranch.value });
      if (dataOption) {
        setListManager([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingManager(false);
    }
  };

  //? đoạn này kiểm tra điều kiện call api người giám sát nhân viên
  useEffect(() => {
    if (data?.managerId && onShow) {
      onSelectOpenManager();
    }

    if (data?.managerId === null) {
      setListManager([]);
    }
  }, [data, onShow]);

  //! đoạn này xử lý vấn đề call api phòng ban
  const onSelectOpenDepartment = async () => {
    if (!listDepartment || listDepartment.length === 0) {
      setIsLoadingDepartment(true);
      const dataOption = await SelectOptionData("department", { branchId: dataBranch.value });
      if (dataOption) {
        setListDepartment([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingDepartment(false);
    }
  };

  //? đoạn này kiểm tra điều kiện call api phòng ban
  useEffect(() => {
    if (data?.departmentId && onShow) {
      onSelectOpenDepartment();
    }

    if (data?.departmentId === null) {
      setListDepartment([]);
    }
  }, [data, onShow]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        code: data?.code ?? "",
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        address: data?.address ?? "",
        jteId: data?.jteId ?? null,
        departmentId: data?.departmentId ?? null,
        managerId: data?.managerId ?? null,
        status: data?.status?.toString() ?? "1",
        viewMode: data?.viewMode?.toString() ?? "1",
        viewCustomerMode: data?.viewCustomerMode?.toString() ?? "2",
        viewBusinessPartnerMode: data?.viewBusinessPartnerMode?.toString() ?? "2",
        viewProjectMode: data?.viewProjectMode?.toString() ?? "2",
        viewWorkMode: data?.viewWorkMode?.toString() ?? "2",
        viewFsMode: data?.viewFsMode?.toString() ?? "2",
        viewQuoteMode: data?.viewQuoteMode?.toString() ?? "2",
        viewOpportunityMode: data?.viewOpportunityMode?.toString() ?? "2",
        viewContractMode: data?.viewContractMode?.toString() ?? "2",
        branchId: data?.branchId ?? dataBranch.value ?? null,
        avatar: data?.avatar ?? "",
        sip: data?.sip ?? "",
        roles: dataLstEmployeeRole ?? "[]",
        roleEmployeeList: [],
      } as IEmployeeRequest),
    [data, onShow, branchId, dataBranch, dataLstEmployeeRole]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "phone",
      rules: "nullable|regex",
    },
    {
      name: "branchId",
      rules: "required",
    },
    {
      name: "departmentId",
      rules: "required",
    },
    {
      name: "jteId",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  const [isLoadingRole, setIsLoadingRole] = useState<boolean>(false);
  const [listRole, setListRole] = useState<IOption[]>([]);

  const [valueListRole, setValueListRole] = useState([]);

  const onSelectOpenRole = async () => {
    setIsLoadingRole(true);

    const dataOption = await SelectOptionData("rolePermission", { branchId: dataBranch.value });
    if (dataOption) {
      setListRole([...(dataOption.length > 0 ? dataOption : [])]);
    }

    setIsLoadingRole(false);
  };

  const defaultRole = {
    departmentId: null,
    departmentValue: null,
    jteId: null,
    jteValue: null,
  };

  const [lstRole, setLstRole] = useState([defaultRole]);

  const [lstDepartment, setLstDepartment] = useState([]);
  const [isLoadingAddDepartment, setIsLoadingAddDepartment] = useState<boolean>(false);
  const [lstJteId, setLstJteId] = useState([]);

  const onSelectOpenAddDepartment = async () => {
    setIsLoadingAddDepartment(true);

    const dataOption = await SelectOptionData("department", { branchId: dataBranch.value });
    if (dataOption) {
      setLstDepartment([...(dataOption.length > 0 ? dataOption : [])]);
    }

    setIsLoadingAddDepartment(false);
  };

  const handDetailJte = async (id: number) => {
    const response = await DepartmentService.detail(id);
    if (response.code === 0) {
      const result = (response.result.jobTitles || []).map((item) => {
        return {
          value: item.id,
          label: item.title,
        };
      });
      setLstJteId(result);
    } else {
      setLstJteId([]);
    }
  };

  const handChangeValueAddDepartment = (e, idx) => {
    const value = e.value;
    handDetailJte(value);

    setLstRole((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            departmentId: e.value,
            departmentValue: e.label,
            jteId: null,
            jteValue: "",
          };
        }

        return item;
      })
    );
  };

  const handChangeValueAddJte = (e, idx) => {
    setLstRole((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            jteId: e.value,
            jteValue: e.label,
          };
        }

        return item;
      })
    );
  };

  const handleDeteleRole = (idx) => {
    const newData = [...lstRole];
    newData.splice(idx, 1);

    setLstRole(newData);
  };

  const listFieldEnhance = useMemo(
    () =>
      [
        {
          label: "Phòng ban",
          name: "departmentId",
          type: "select",
          options: listDepartment,
          onMenuOpen: onSelectOpenDepartment,
          isLoading: isLoadingDepartment,
          fill: true,
          required: true,
          onChange: (e) => handleChangeValueDepartment(e),
        },
        {
          label: "Người quản lý trực tiếp",
          name: "managerId",
          type: "select",
          options: listManager,
          onMenuOpen: onSelectOpenManager,
          isLoading: isLoadingManager,
          fill: true,
        },
        {
          label: "Chức danh",
          name: "jteId",
          type: "select",
          fill: true,
          required: true,
          options: listJobTitle,
          isLoading: isLoadingJobTitle,
          disabled: !formData?.values?.departmentId,
        },
        {
          label: "Số máy nhánh",
          name: "sip",
          type: "text",
          fill: true,
          required: false,
          disabled: !formData?.values?.departmentId,
        },
        {
          type: "custom",
          name: "add_role",
          snippet: (
            <div className="box__add--role">
              <label>Thêm vai trò</label>

              <div className="lst__role">
                {lstRole.map((item, idx) => {
                  const lstOptionDepartment = lstDepartment
                    .filter((el) => el.value !== formData?.values.departmentId)
                    .filter((ul) => {
                      return !lstRole.some((k) => k.departmentId === ul.value);
                    });

                  return (
                    <div key={idx} className={"item-role"}>
                      <div className="item-role--info">
                        <div className="form-group">
                          <SelectCustom
                            name="addDepartmentId"
                            label="Phòng ban"
                            value={
                              item.departmentId
                                ? {
                                    value: item.departmentId,
                                    label: item.departmentValue,
                                  }
                                : null
                            }
                            options={lstOptionDepartment}
                            fill={true}
                            required={true}
                            special={true}
                            onChange={(e) => handChangeValueAddDepartment(e, idx)}
                            onMenuOpen={onSelectOpenAddDepartment}
                            placeholder="Chọn phòng ban"
                            isLoading={isLoadingAddDepartment}
                            disabled={!formData?.values?.departmentId}
                          />
                        </div>
                        <div className="form-group">
                          <SelectCustom
                            name="addJteId"
                            label="Chức danh"
                            fill={true}
                            value={
                              item.jteId
                                ? {
                                    value: item.jteId,
                                    label: item.jteValue,
                                  }
                                : null
                            }
                            special={true}
                            required={true}
                            options={lstJteId}
                            onChange={(e) => handChangeValueAddJte(e, idx)}
                            placeholder="Chọn chức danh"
                            disabled={!formData?.values?.departmentId}
                          />
                        </div>
                      </div>
                      <div className="item-role--action">
                        <div
                          className="action-item action-item--add"
                          onClick={() => formData?.values?.departmentId && setLstRole([...lstRole, defaultRole])}
                          style={!formData?.values?.departmentId ? { opacity: "0.6" } : {}}
                        >
                          <Icon name="PlusCircleFill" />
                        </div>
                        {lstRole.length > 1 && (
                          <div className="action-item action-item--delete" onClick={() => handleDeteleRole(idx)}>
                            <Icon name="Trash" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ),
        },
        {
          label: "Trạng thái",
          name: "status",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Đang làm việc",
            },
            ...(data?.id
              ? [
                  {
                    value: "2",
                    label: "Đã nghỉ",
                  },
                ]
              : []),
          ],
          fill: true,
        },
        {
          label: "Quyền xem khách hàng",
          name: "viewCustomerMode",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Tất cả",
            },
            {
              value: "2",
              label: "Phạm vi quản lý",
            },
          ],
          fill: true,
        },
        {
          label: "Quyền xem đối tác",
          name: "viewBusinessPartnerMode",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Tất cả",
            },
            {
              value: "2",
              label: "Phạm vi quản lý",
            },
          ],
          fill: true,
        },
        {
          label: "Quyền xem hợp đồng",
          name: "viewContractMode",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Tất cả",
            },
            {
              value: "2",
              label: "Phạm vi quản lý",
            },
          ],
          fill: true,
        },
        {
          label: "Quyền xem dự án",
          name: "viewProjectMode",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Tất cả",
            },
            {
              value: "2",
              label: "Phạm vi quản lý",
            },
          ],
          fill: true,
        },
        {
          label: "Quyền xem cơ hội",
          name: "viewOpportunityMode",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Tất cả",
            },
            {
              value: "2",
              label: "Phạm vi quản lý",
            },
          ],
          fill: true,
        },
        {
          label: "Quyền xem công việc",
          name: "viewWorkMode",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Tất cả",
            },
            {
              value: "2",
              label: "Phạm vi quản lý",
            },
          ],
          fill: true,
        },
        {
          label: "Quyền xem FS",
          name: "viewFsMode",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Tất cả",
            },
            {
              value: "2",
              label: "Phạm vi quản lý",
            },
          ],
          fill: true,
        },
        {
          label: "Quyền xem báo giá",
          name: "viewQuoteMode",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Tất cả",
            },
            {
              value: "2",
              label: "Phạm vi quản lý",
            },
          ],
          fill: true,
        },
        {
          label: "Quyền xem doanh thu",
          name: "viewMode",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Tất cả",
            },
            {
              value: "2",
              label: "Theo phòng",
            },
            {
              value: "3",
              label: "Theo ngày",
            },
          ],
          fill: true,
        },
      ] as IFieldCustomize[],
    [
      listDepartment,
      isLoadingDepartment,
      listManager,
      isLoadingManager,
      listJobTitle,
      isLoadingJobTitle,
      listBeautyBranch,
      isLoadingBeautyBranch,
      data,
      onShow,
      formData.values,
      lstRole,
      defaultRole,
      lstDepartment,
      lstJteId,
      isLoadingAddDepartment,
    ]
  );

  const handleChangeValueDepartment = (e) => {
    getDetailDepartment(e.value);
  };

  //! đoạn này xử lý vấn đề call chi tiết một phòng ban đề lấy chức danh
  const getDetailDepartment = async (id) => {
    setIsLoadingJobTitle(true);
    const response = await DepartmentService.detail(id);
    if (response.code === 0) {
      const result = (response.result.jobTitles || []).map((item) => {
        return {
          value: item.id,
          label: item.title,
        };
      });
      setListJobTitle(result);
    } else {
      setListJobTitle([]);
    }
    setIsLoadingJobTitle(false);
  };

  //! đoạn này xử lý vấn đề trong trường hợp cập nhật
  //  sau khi đã có id phòng ban rồi thì lấy luôn chức danh thuộc phòng ban đó
  useEffect(() => {
    if (data !== null && data?.departmentId && onShow) {
      getDetailDepartment(data?.departmentId);
    }
  }, [data, onShow]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if (lstRole && lstRole.length > 0) {
      const changeLstRole = lstRole.map((item) => {
        return {
          departmentId: item.departmentId,
          jteId: item.jteId,
        };
      });

      setFormData({ ...formData, values: { ...formData?.values, roles: JSON.stringify(changeLstRole) } });
    }
  }, [lstRole]);

  const [isDifferenceRole, setIsDifferenceRole] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldInfoBasicEmployee, ...listFieldEnhance]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const body: IEmployeeRequest = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as IEmployeeRequest),
      ...{
        roleEmployeeList: valueListRole?.length
          ? valueListRole.map((item) => {
              return {
                roleId: item.value,
                employeeId: data?.id || null,
                id: null,
              };
            })
          : [],
      },
    };

    // console.log("body", body);
    // return;
    setIsSubmit(true);

    if (isDifferenceObj(formData.values, values)) {
      const response = await EmployeeService.update(body);
      if (response.code === 0) {
        showToast(`${data ? "Cập nhật" : "Thêm mới"} nhân viên thành công`, "success");
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
    handleClearForm(true);
    setIsSubmit(false);
    // if (isDifferenceRole) {
    //   // Tìm những phần tử mà trong defaultListRole có, mà trong valueListRole không có (xóa)
    //   const removed = defaultListRole.filter((item) => !valueListRole.some((v) => v.id === item.id));
    //   if (removed.length > 0) {
    //     for (const item of removed) {
    //       if (item?.id) {
    //         await EmployeeService.deleteRole({ id: item.id });
    //       }
    //     }
    //   }
    //   // Tìm những phần tử mà trong valueListRole có (id == null), mà trong defaultListRole không có (thêm mới)
    //   const added = valueListRole.filter(
    //     (item) =>
    //       item.id == null && // id == null (thêm mới)
    //       !defaultListRole.some((d) => d.value === item.value) // không có trong defaultListRole
    //   );

    //   if (added?.length > 0) {
    //     const responseRole = await handleUpdateRole();
    //     if (responseRole.code === 0) {
    //       showToast(`${data ? "Cập nhật" : "Thêm mới"} quyền cho nhân viên thành công`, "success");
    //     } else {
    //       showToast(responseRole.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //     }
    //   }
    // }
    // if (isDifferenceRole || isDifferenceObj(formData.values, values)) {
    //   handleClearForm(true);
    //   setIsSubmit(false);
    // }
  };

  // const handleUpdateRole = async () => {
  //   const body: any = valueListRole?.length
  //     ? valueListRole.map((item) => {
  //         return {
  //           roleId: item.value,
  //           employeeId: data?.id,
  //           id: item?.id || null,
  //         };
  //       })
  //     : [];

  //   const response = await EmployeeService.updateRole(body);

  //   return response;
  // };

  const [defaultListRole, setDefaultListRole] = useState([]);
  const handleGetRole = async (employeeId) => {
    const params: any = { employeeId, page: 1, limit: 100 };

    const response = await EmployeeService.getListRoleEmployee(params);

    const listRoleEmployee =
      response?.result?.items?.map((item) => {
        return {
          value: item.roleId,
          label: item.roleName || item.roleId,
          id: item.id || null,
        };
      }) || [];

    setDefaultListRole(listRoleEmployee);

    setValueListRole(listRoleEmployee);
    if (listRoleEmployee?.length > 0) {
      setFormData((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          roleEmployeeList: listRoleEmployee,
        },
      }));
    }
    setLoadingListRole(false);
  };

  useEffect(() => {
    const isDifferent = !isEqual(defaultListRole, valueListRole);
    setIsDifferenceRole(isDifferent);
  }, [valueListRole, defaultListRole]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setLstRole([defaultRole]);
    setListJobTitle(null);
    setDataLstEmployeeRole(null);
    setValueListRole([]);
  };

  const listFieldInfoBasicEmployee = useMemo(
    () =>
      [
        {
          type: "custom",
          name: "name_code",
          label: "",
          snippet: (
            <div className="box__name__code">
              <div className="lst__role">
                <div className="item-role--info">
                  <div className="form-group-name">
                    <Input
                      name="name"
                      label={"Họ tên"}
                      value={formData?.values?.name}
                      fill={true}
                      required={true}
                      iconPosition="left"
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, values: { ...formData.values, name: value } });
                      }}
                      placeholder="Nhập tên nhân viên"
                    />
                  </div>
                  <div className="form-group-code">
                    <Input
                      name="code"
                      label={"Mã nhân viên"}
                      value={formData?.values?.code}
                      fill={true}
                      iconPosition="left"
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, values: { ...formData.values, code: value } });
                      }}
                      placeholder="Nhập mã nhân viên"
                    />
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          label: "Điện thoại",
          name: "phone",
          type: "text",
          fill: true,
          regex: new RegExp(PHONE_REGEX),
          messageErrorRegex: "Số điện thoại không đúng định dạng",
          required: true,
        },
        {
          label: "Email",
          name: "email",
          type: "text",
          fill: true,
          regex: new RegExp(EMAIL_REGEX),
          iconPosition: "right",
          // icon: data?.id && data?.emailMasked && (!isShowEmail ? <Icon name="EyeSlash" /> : <Icon name="Eye" />),
          // iconClickEvent: () => setIsShowEmail(!isShowEmail),
          messageErrorRegex: "Email không đúng định dạng",
        },
        {
          type: "custom",
          name: "rolePemission",
          label: "",
          snippet: (
            <div className="item-role--info">
              <SelectCustom
                key={JSON.stringify(valueListRole) + "_" + JSON.stringify(defaultListRole)}
                name="rolePemission"
                label="Nhóm quyền"
                value={valueListRole}
                options={listRole}
                fill={true}
                required={false}
                special={true}
                isMulti={true}
                onChange={(e) => {
                  setValueListRole(
                    e.map((item) => {
                      let check = defaultListRole.find((el) => el.value === item.value);
                      return { value: item.value, label: item.label, id: (check && check?.id) || null };
                    })
                  );
                  setFormData((prev) => ({
                    ...prev,
                    values: {
                      ...prev.values,
                      roleEmployeeList: e.map((item) => {
                        let check = defaultListRole.find((el) => el.value === item.value);
                        return { roleId: item.value, employeeId: data?.id || null, id: (check && check?.id) || null };
                      }),
                    },
                  }));
                }}
                onMenuOpen={onSelectOpenRole}
                placeholder="Chọn nhóm quyền"
                isLoading={isLoadingRole || loadingListRole}
              />
            </div>
          ),
        },
      ] as IFieldCustomize[],
    [listRole, isLoadingRole, valueListRole, defaultListRole, formData, loadingListRole]
  );

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
              !isDifferenceObj(formData.values, values) && !isDifferenceRole ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              (!isDifferenceRole && !isDifferenceObj(formData.values, values)) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, valueListRole, isDifferenceRole]
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
        setListJobTitle(null);
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
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-emplyee"
      >
        <form className="form-emplyee-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} nhân viên`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="wrapper-coupled">
              <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
                <div className="form-group">
                  <FileUpload type="avatar" label="Ảnh đại diện" formData={formData} setFormData={setFormData} />
                </div>
                {/* <div className="list-form-basic"> */}
                <div style={{ width: "65%" }}>
                  {listFieldInfoBasicEmployee.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldInfoBasicEmployee, setFormData)}
                      formData={formData}
                    />
                  ))}
                </div>
                {/* </div> */}
              </div>
              <div className="info__employee">
                {/* <div className="form-group">
                  <FileUpload type="avatar" label="Ảnh đại diện" formData={formData} setFormData={setFormData} />
                </div> */}
                <div className="form-group">
                  <TextArea
                    name="address"
                    value={formData?.values?.address}
                    label="Địa chỉ"
                    fill={true}
                    onChange={(e) => setFormData({ ...formData, values: { ...formData.values, address: e.target.value } })}
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>
              <div className="list-form-enhance">
                {listFieldEnhance.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldEnhance, setFormData)}
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
