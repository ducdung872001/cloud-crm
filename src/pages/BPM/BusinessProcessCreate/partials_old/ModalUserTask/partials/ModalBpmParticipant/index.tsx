import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ImageThirdGender from "assets/images/third-gender.png";
import "./index.scss";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import DepartmentService from "services/DepartmentService";
import EmployeeService from "services/EmployeeService";
import { isDifferenceObj } from "reborn-util";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import RadioList from "components/radio/radioList";

export default function ModalBpmParticipant({ onShow, onHide, dataNode, formSchema, processId, disable }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);
  const [dataWorkflow, setDataWorkflow] = useState(null);

  const getDetailParticipant = async (formId, nodeId) => {
    const params = {
      nodeId: nodeId,
    };

    const response = await BusinessProcessService.detailBpmParticipant(nodeId);

    if (response.code === 0) {
      const result = response.result;
      if (result.department) {
        if (result.department?.includes("frm") || result.department?.includes("var")) {
          setDataDepartment(result.department ? { value: result.department, label: result.department } : null);
        } else {
          setDataDepartment(result.department ? { value: +result.department, label: result.departmentName } : null);
          getDetailDepartment(+result.department);
        }
      }

      if (result.jte) {
        if (result.jte?.includes("frm") || result.jte?.includes("var")) {
          setDataRole(result.jte ? { value: result.jte, label: result.jte } : null);
        } else {
          setDataRole(result.jte ? { value: +result.jte, label: result.jteName } : null);
        }
      }

      if (result.employee) {
        if (result.employee?.includes("frm") || result.employee?.includes("var")) {
          setDataEmployee(result.employee ? { value: result.employee, label: result.employee } : null);
        } else {
          setDataEmployee(
            result.employee ? { value: +result.employee, label: +result.employee === -1 ? "Không chỉ định" : result.employeeName } : null
          );
        }
      }

      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
      setData({
        ...result,
        typeDepartment: result.department?.includes("frm") ? 1 : result.department?.includes("var") ? 2 : 0,
        typeJte: result.jte?.includes("frm") ? 1 : result.jte?.includes("var") ? 2 : 0,
        typeEmployee: result.employee?.includes("frm") ? 1 : result.employee?.includes("var") ? 2 : 0,
      });
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow && dataNode && formSchema) {
      getDetailParticipant(formSchema?.id, dataNode?.id);
    }
  }, [dataNode, formSchema, onShow]);

  const values = useMemo(
    () => ({
      id: data?.id ?? null,
      type: data?.type?.toString() ?? "0", //0 chọn người xử lý cụ thể, 1 lấy theo người xử lý ở node khác
      // fieldName: data?.fieldName ?? '',
      // fieldNameType:  data?.fieldName?.includes('var') ? 2 : 1,

      department: data?.department ?? "",
      typeDepartment: data?.typeDepartment ?? 0,

      jte: data?.jte ?? "",
      typeJte: data?.typeJte ?? 0,

      employee: data?.employee ?? "",
      typeEmployee: data?.typeEmployee ?? 0,

      teamId: data?.teamId ?? "",
      teamMember: data?.teamMember ?? "",

      formId: data?.id ?? "",
      nodeId: data?.nodeId ?? dataNode?.id ?? "",
      workflowId: data?.workflowId ?? null,
    }),
    [onShow, data, dataNode, formSchema]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // if(!dataDepartment){
    //     setCheckDepartment(true);
    // }

    setIsSubmit(true);

    const body = {
      ...formData,
    };
    const response = await BusinessProcessService.updateBpmParticipant(body);

    if (response.code === 0) {
      showToast(`Cập nhật người xử lý thành công`, "success");
      handleClear(true);
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
            title: disable ? "Đóng" : "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData, values) ? handleClear(false) : showDialogConfirmCancel();
            },
          },
          ...(disable
            ? []
            : ([
                {
                  title: "Cập nhật",
                  type: "submit",
                  color: "primary",
                  disabled: isSubmit || !isDifferenceObj(formData, values),
                  is_loading: isSubmit,
                },
              ] as any)),
        ],
      },
    }),
    [formData, values, isSubmit, data, disable]
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

  const [dataDepartment, setDataDepartment] = useState(null);
  const [checkDepartment, setCheckDepartment] = useState(false);
  const loadedOptionDepartment = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      //   branchId: dataBranch.value,
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

  const handleChangeValueDepartment = (e, typeDepartment) => {
    setCheckDepartment(false);
    setDataDepartment(e);
    setDataRole(null);
    setCheckRole(null);
    setDataEmployee(null);
    setFormData({ ...formData, department: e.value, jte: null, employee: null });
    if (typeDepartment === 0) {
      getDetailDepartment(+e.value);
    } else {
      setListRole([]);
    }
  };

  const [dataRole, setDataRole] = useState(null);
  const [checkRole, setCheckRole] = useState(false);
  const [listRole, setListRole] = useState([]);
  const getDetailDepartment = async (departmentId) => {
    const response = await DepartmentService.detail(departmentId);
    if (response.code === 0) {
      const result = response.result;
      const jobTitles = result?.jobTitles || [];
      const listRole = jobTitles.map((item) => {
        return {
          value: item.id,
          label: item.title,
        };
      });
      setListRole(listRole);
    }
  };

  const handleChangeValueRole = (e) => {
    setCheckRole(false);
    setDataRole(e);
    setDataEmployee(null);
    setFormData({ ...formData, jte: e.value, employee: null });
  };

  //* đoạn này xử lý vấn đề lấy ra danh sách người quản lý dự án
  const [dataEmployee, setDataEmployee] = useState(null);

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      departmentId: dataDepartment?.value,
      jteId: dataRole?.value,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items || [];
      const option = [
        {
          value: -1,
          label: "Không chỉ định",
        },
        ...dataOption.map((item) => {
          return {
            value: item.id,
            label: item.name,
            avatar: item.avatar,
          };
        }),
      ];

      return {
        options: option,
        // [
        //   ...(dataOption.length > 0
        //     ? dataOption.map((item) => {
        //         return {
        //           value: item.id,
        //           label: item.name,
        //           avatar: item.avatar,
        //         };
        //       })
        //     : []),
        // ],
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
    setDataEmployee(e);
    setFormData({ ...formData, employee: e.value });
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

  useEffect(() => {
    if (dataRole) {
      // console.log('typeof +dataRole.value', typeof dataRole.value);

      if (typeof dataRole.value === "number") {
        loadedOptionEmployee("", undefined, { page: 1 });
      }
    }
  }, [dataDepartment, dataRole]);

  const [dataTeam, setDataTeam] = useState(null);
  const [dataTeamMember, setDataTeamMember] = useState([]);

  const loadedOptionAttribute = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
      processId: processId,
    };
    const response = await BusinessProcessService.listVariableDeclare(params);

    if (response.code === 0) {
      const dataOption = response.result?.items;
      let listVar = [];
      dataOption &&
        dataOption.length > 0 &&
        dataOption.map((item) => {
          const body = (item.body && JSON.parse(item.body)) || [];
          body.map((el) => {
            listVar.push({
              value: `var_${item.name}.${el.name}`,
              label: `var_${item.name}.${el.name}`,
              nodeId: item.nodeId,
            });
          });
        });

      return {
        options: [
          ...(listVar.length > 0
            ? listVar.map((item) => {
                return {
                  value: item.value,
                  label: item.label,
                  nodeId: item.nodeId,
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

  const loadedOptionForm = async (search, loadedOptions, { page }) => {
    const params = {
      code: search,
      page: page,
      limit: 10,
      processId: processId,
    };
    const response = await BusinessProcessService.listBpmForm(params);

    if (response.code === 0) {
      const dataOption = response.result?.filter((el) => el.code) || [];
      let listForm = [];
      dataOption &&
        dataOption.length > 0 &&
        dataOption.map((item) => {
          const components =
            (item.config && JSON.parse(item.config) && JSON.parse(item.config).components && JSON.parse(item.config).components) || [];
          components.map((el) => {
            if (el.key || el.path) {
              listForm.push({
                value: `frm_${item.code}.${el.key || el.path}`,
                label: `frm_${item.code}.${el.key || el.path}`,
                nodeId: item.nodeId,
                datatype: el.type || null,
              });
            } else {
              if (el.type === "group") {
                el.components.map((il) => {
                  if (il.key || il.path) {
                    listForm.push({
                      value: `frm_${item.code}.${el.type}.${il.key || il.path}`,
                      label: `frm_${item.code}.${el.type}.${il.key || il.path}`,
                      nodeId: item.nodeId,
                      datatype: il.type || null,
                    });
                  } else {
                    if (il.type === "group") {
                      il.components.map((ol) => {
                        if (ol.key || ol.path) {
                          listForm.push({
                            value: `frm_${item.code}.${el.type}.${il.type}.${ol.key || ol.path}`,
                            label: `frm_${item.code}.${el.type}.${il.type}.${ol.key || ol.path}`,
                            nodeId: item.nodeId,
                            datatype: ol.type || null,
                          });
                        } else {
                          if (ol.type === "group") {
                          }
                        }
                      });
                    }

                    if (il.type === "iframe") {
                      listForm.push({
                        value: `frm_${item.code}.${el.type}.${il.type}`,
                        label: `frm_${item.code}.${el.type}.${il.type}`,
                        nodeId: item.nodeId,
                        datatype: el.type || null,
                      });
                    }
                  }
                });
              }

              if (el.type === "iframe") {
                listForm.push({
                  value: `frm_${item.code}.${el.type}`,
                  label: `frm_${item.code}.${el.type}`,
                  nodeId: item.nodeId,
                  datatype: el.type || null,
                });
              }
            }
          });
        });

      return {
        options: [
          ...(listForm.length > 0
            ? listForm.map((item) => {
                return {
                  value: item.value,
                  label: item.label,
                  nodeId: item.nodeId,
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

  const loadedOptionWorkflow = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
      processId: processId,
    };
    const response = await BusinessProcessService.listStep(params);

    if (response.code === 0) {
      const dataOption = response.result?.items || [];
      const options = dataOption.filter((el) => el.stepName);

      return {
        options: [
          ...(options.length > 0
            ? options.map((item) => {
                return {
                  value: item.id,
                  label: item.stepName,
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

  const handleClear = (acc) => {
    onHide(acc);
    setData(null);
    setDataDepartment(null);
    setDataEmployee(null);
    setDataRole(null);
    setCheckRole(false);
    setListRole([]);
    setDataWorkflow(null);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        // size="lg"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-bpm-participant"
      >
        <form className="form-bpm-participant-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Người xử lý`} toggle={() => !isSubmit && handleClear(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <RadioList
                  options={[
                    {
                      value: "0",
                      label: "Theo phòng ban/chức danh",
                    },
                    {
                      value: "1",
                      label: "Theo nhóm nhân viên",
                    },
                  ]}
                  // className="options-auth"
                  required={true}
                  title=""
                  name="type"
                  value={formData.type}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "1") {
                      // if(data?.fieldName){
                      //   setFormData({...formData, type: value, fieldName: data?.fieldName, departmentId: null, jteId: null, employeeId: null});
                      // } else {
                      //   setFormData({...formData, type: value, department: null, jte: null, employee: null});
                      // }
                      setFormData({
                        ...formData,
                        type: value,
                        department: null,
                        typeDepartment: 0,
                        jte: null,
                        typeJte: 0,
                        employee: null,
                        typeEmployee: 0,
                      });
                      setDataDepartment(null);
                      setDataRole(null);
                      setDataEmployee(null);
                    } else {
                      // if(data?.departmentId){
                      //   setFormData({...formData, type: value, fieldName: '', departmentId: data.departmentId, jteId: data.jteId, employeeId: data.employeeId});
                      //   setDataDepartment(data.departmentId ? {value: data.departmentId, label: data.departmentName} : null);
                      //   setDataRole(data.jteId ? {value: data.jteId, label: data.jteName} : null);
                      //   setDataEmployee(data.employeeId ? {value: data.employeeId, label: data.employeeId === -1 ? 'Không chỉ định' : data.employeeName} : null);
                      // } else {
                      //   setFormData({...formData, type: value, fieldName: ''});
                      // }

                      if (data) {
                        setFormData({
                          ...formData,
                          type: value,
                          department: data.department,
                          jte: data.jte,
                          employee: data.employee,
                          typeDepartment: data.department?.includes("frm") ? 1 : data.department?.includes("var") ? 2 : 0,
                          typeJte: data.jte?.includes("frm") ? 1 : data.jte?.includes("var") ? 2 : 0,
                          typeEmployee: data.employee?.includes("frm") ? 1 : data.employee?.includes("var") ? 2 : 0,
                        });

                        if (data.department) {
                          if (data.department?.includes("frm") || data.department?.includes("var")) {
                            setDataDepartment(data.department ? { value: data.department, label: data.department } : null);
                          } else {
                            setDataDepartment(data.department ? { value: +data.department, label: data.departmentName } : null);
                            getDetailDepartment(+data.department);
                          }
                        }

                        if (data.jte) {
                          if (data.jte?.includes("frm") || data.jte?.includes("var")) {
                            setDataRole(data.jte ? { value: data.jte, label: data.jte } : null);
                          } else {
                            setDataRole(data.jte ? { value: +data.jte, label: data.jteName } : null);
                          }
                        }

                        if (data.employee) {
                          if (data.employee?.includes("frm") || data.employee?.includes("var")) {
                            setDataEmployee(data.employee ? { value: data.employee, label: data.employee } : null);
                          } else {
                            setDataEmployee(
                              data.employee ? { value: +data.employee, label: +data.employee === -1 ? "Không chỉ định" : data.employeeName } : null
                            );
                          }
                        }
                      } else {
                        setFormData({
                          ...formData,
                          type: value,
                        });
                      }
                    }
                  }}
                />
              </div>

              {/* {formData.type === '0' ? 
                <div className="form-group">
                  <SelectCustom
                      id=""
                      name="departmentId"
                      label={'Chọn phòng ban'}
                      fill={true}
                      required={true}
                      error={checkDepartment}
                      message="Phòng ban không được để trống"
                      options={[]}
                      value={dataDepartment}
                      onChange={(e) => handleChangeValueDepartment(e)}
                      isAsyncPaginate={true}
                      placeholder={`Chọn phòng ban`}
                      additional={{
                          page: 1,
                      }}
                      loadOptionsPaginate={loadedOptionDepartment}
                      // formatOptionLabel={formatOptionLabelAttribute}
                      disabled={disable}
                  />
                </div>
              : null} */}

              {formData.type === "0" ? (
                <div className="form-group">
                  <div>
                    <span style={{ fontSize: 14, fontWeight: "700" }}>
                      Chọn phòng ban <span style={{ color: "red" }}>*</span>
                    </span>
                  </div>
                  <div className={"container-select-mapping"}>
                    <div className="select-mapping">
                      <SelectCustom
                        key={formData?.typeDepartment}
                        id=""
                        name="department"
                        // label={'Chọn phòng ban'}
                        fill={false}
                        required={true}
                        error={checkDepartment}
                        message="Phòng ban không được để trống"
                        options={[]}
                        value={dataDepartment}
                        onChange={(e) => handleChangeValueDepartment(e, formData.typeDepartment)}
                        isAsyncPaginate={true}
                        placeholder={
                          formData.typeDepartment === 0 ? "Chọn phòng ban" : formData.typeDepartment === 1 ? "Chọn trường trong form" : "Chọn biến"
                        }
                        additional={{
                          page: 1,
                        }}
                        loadOptionsPaginate={
                          formData.typeDepartment === 0
                            ? loadedOptionDepartment
                            : formData.typeDepartment === 1
                            ? loadedOptionForm
                            : loadedOptionAttribute
                        }
                        // formatOptionLabel={formatOptionLabelAttribute}
                        disabled={disable}
                      />
                    </div>
                    <Tippy
                      content={
                        formData.typeDepartment === 0
                          ? "Chuyển chọn trường trong form"
                          : formData.typeDepartment === 1
                          ? "Chuyển chọn biến"
                          : "Chuyển chọn phòng ban"
                      }
                    >
                      <div
                        className={"icon-change-select"}
                        onClick={(e) => {
                          setDataDepartment(null);
                          setDataEmployee(null);
                          setDataRole(null);
                          setFormData({
                            ...formData,
                            department: "",
                            employee: "",
                            jte: "",
                            typeDepartment: formData.typeDepartment === 0 ? 1 : formData.typeDepartment === 1 ? 2 : 0,
                            typeJte: formData.typeDepartment === 0 ? 1 : formData.typeDepartment === 2 ? 0 : formData.typeJte,
                            typeEmployee: formData.typeDepartment === 0 ? 1 : formData.typeDepartment === 2 ? 0 : formData.typeEmployee,
                          });
                        }}
                      >
                        <Icon name="ResetPassword" style={{ width: 18 }} />
                      </div>
                    </Tippy>
                  </div>
                </div>
              ) : null}

              {formData.type === "0" ? (
                <div className="form-group">
                  <div>
                    <span style={{ fontSize: 14, fontWeight: "700" }}>
                      Chọn chức danh <span style={{ color: "red" }}>*</span>
                    </span>
                  </div>
                  <div className={"container-select-mapping"}>
                    <div className="select-mapping">
                      <SelectCustom
                        key={formData?.typeJte}
                        id="jte"
                        name="jte"
                        // label={'Chọn phòng ban'}
                        fill={false}
                        required={true}
                        error={checkRole}
                        special={formData.typeJte === 0 ? true : false}
                        message="Chức danh không được để trống"
                        options={formData.typeJte === 0 ? listRole : []}
                        value={dataRole}
                        onChange={(e) => handleChangeValueRole(e)}
                        isAsyncPaginate={formData.typeJte === 0 ? false : true}
                        placeholder={formData.typeJte === 0 ? "Chọn chức danh" : formData.typeJte === 1 ? "Chọn trường trong form" : "Chọn biến"}
                        additional={{
                          page: 1,
                        }}
                        loadOptionsPaginate={formData.typeJte === 1 ? loadedOptionForm : loadedOptionAttribute}
                        // formatOptionLabel={formatOptionLabelAttribute}
                        disabled={disable || (dataDepartment ? false : true)}
                      />
                    </div>
                    <Tippy
                      content={
                        formData.typeJte === 0
                          ? "Chuyển chọn trường trong form"
                          : formData.typeJte === 1
                          ? "Chuyển chọn biến"
                          : "Chuyển chọn chức danh"
                      }
                    >
                      <div
                        className={"icon-change-select"}
                        onClick={(e) => {
                          setDataEmployee(null);
                          setDataRole(null);
                          setFormData({
                            ...formData,
                            employee: "",
                            jte: "",
                            typeJte: formData.typeJte === 0 ? 1 : formData.typeJte === 1 ? 2 : 0,
                            typeEmployee: formData.typeJte === 0 ? 1 : formData.typeJte === 2 ? 0 : formData.typeEmployee,
                          });
                        }}
                      >
                        <Icon name="ResetPassword" style={{ width: 18 }} />
                      </div>
                    </Tippy>
                  </div>
                  {/* <SelectCustom
                      id=""
                      name="jteId"
                      label={'Chọn chức danh'}
                      fill={true}
                      required={true}
                      special={true}
                      error={checkRole}
                      message="Chức danh không được để trống"
                      options={listRole}
                      value={dataRole}
                      onChange={(e) => handleChangeValueRole(e)}
                      isAsyncPaginate={false}
                      placeholder={`Chọn chức danh`}
                      additional={{
                          page: 1,
                      }}
                      // loadOptionsPaginate={loadedOptionDepartment}
                      // formatOptionLabel={formatOptionLabelAttribute}
                      disabled={disable || (dataDepartment ? false : true)}
                  /> */}
                </div>
              ) : null}
              {formData.type === "0" ? (
                <div className="form-group">
                  <div>
                    <span style={{ fontSize: 14, fontWeight: "700" }}>
                      Chọn nhân viên <span style={{ color: "red" }}>*</span>
                    </span>
                  </div>
                  <div className={"container-select-mapping"}>
                    <div className="select-mapping">
                      <SelectCustom
                        key={formData.typeEmployee === 0 ? dataRole?.value : formData?.typeEmployee}
                        id="employee"
                        name="employee"
                        // label={'Chọn phòng ban'}
                        fill={false}
                        required={false}
                        // error={checkRole}
                        // message="Chức danh không được để trống"
                        options={[]}
                        value={dataEmployee}
                        onChange={(e) => handleChangeValueEmployee(e)}
                        isAsyncPaginate={true}
                        placeholder={
                          formData.typeEmployee === 0 ? "Chọn nhân viên" : formData.typeEmployee === 1 ? "Chọn trường trong form" : "Chọn biến"
                        }
                        additional={{
                          page: 1,
                        }}
                        loadOptionsPaginate={
                          formData.typeEmployee === 0 ? loadedOptionEmployee : formData.typeEmployee === 1 ? loadedOptionForm : loadedOptionAttribute
                        }
                        // formatOptionLabel={formatOptionLabelAttribute}
                        disabled={disable || (dataRole ? false : true)}
                      />
                    </div>
                    <Tippy
                      content={
                        formData.typeEmployee === 0
                          ? "Chuyển chọn trường trong form"
                          : formData.typeEmployee === 1
                          ? "Chuyển chọn biến"
                          : "Chuyển chọn nhân viên"
                      }
                    >
                      <div
                        className={"icon-change-select"}
                        onClick={(e) => {
                          setDataEmployee(null);
                          setFormData({
                            ...formData,
                            employee: "",
                            typeEmployee: formData.typeEmployee === 0 ? 1 : formData.typeEmployee === 1 ? 2 : 0,
                          });
                        }}
                      >
                        <Icon name="ResetPassword" style={{ width: 18 }} />
                      </div>
                    </Tippy>
                  </div>
                </div>
              ) : null}

              {formData.type === "1" ? (
                <div className="form-group">
                  <SelectCustom
                    key={dataRole?.value}
                    id=""
                    name="employeeId"
                    label={"Chọn nhân viên"}
                    fill={true}
                    required={false}
                    // error={item.checkMapping}
                    // message="Biến quy trình không được để trống"
                    options={[]}
                    value={dataEmployee}
                    onChange={(e) => handleChangeValueEmployee(e)}
                    isAsyncPaginate={true}
                    placeholder={`Chọn nhân viên`}
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionEmployee}
                    formatOptionLabel={formatOptionLabelEmployee}
                    disabled={disable || (dataRole ? false : true)}
                  />
                  {/* <div>
                    <span style={{fontSize: 14, fontWeight: '700'}}>Chọn phòng ban <span style={{color:'red'}}>*</span></span>
                  </div>
                  <div className={"container-select-mapping"}>
                    <div className="select-mapping">
                      <SelectCustom
                          key={formData?.fieldNameType}
                          id="fieldName"
                          name="fieldName"
                          // label={index === 0 ? "Biến quy trình" : ''}
                          fill={false}
                          required={false}
                          // error={item.checkMapping}
                          // message="Biến quy trình không được để trống"
                          options={[]}
                          value={formData?.fieldName ? {value: formData?.fieldName, label: formData?.fieldName} : null}
                          onChange={(e) => {
                              setFormData({...formData, fieldName: e.value})
                          }}
                          isAsyncPaginate={true}
                          isFormatOptionLabel={false}
                          // placeholder={item.mappingType === 2 ? "Chọn biến" : 'Chọn trường trong form'}
                          placeholder={formData.fieldNameType === 2 ? "Chọn biến" : 'Chọn trường trong form'}
                          additional={{
                              page: 1,
                          }}
                          loadOptionsPaginate={formData.fieldNameType === 2 ? loadedOptionAttribute : loadedOptionForm}
                          // formatOptionLabel={formatOptionLabelEmployee}
                          // error={checkFieldEform}
                          // message="Biểu mẫu không được bỏ trống"
                          // disabled={}
                      />
                    </div>
                    <Tippy  content={formData.fieldNameType === 2 ? 'Chuyển chọn trường trong form' : 'Chuyển chọn biến'}>
                      <div 
                        className={'icon-change-select'}
                        onClick={(e) => {
                            if(formData.fieldNameType === 1){
                              setFormData({...formData, fieldNameType: 2})
                            } else {
                              setFormData({...formData, fieldNameType: 1})
                            }
                        }}
                      >
                          <Icon name="ResetPassword" style={{width: 18}} />
                      </div>
                    </Tippy>
                  </div> */}
                </div>
              ) : null}

              <div className="form-group">
                <SelectCustom
                  // key={listAttribute.length}
                  id=""
                  name="name"
                  label={"Luồng công việc"}
                  fill={true}
                  required={false}
                  // error={item.checkMapping}
                  // message="Biến quy trình không được để trống"
                  options={[]}
                  value={dataWorkflow}
                  onChange={(e) => {
                    setDataWorkflow(e);
                    setFormData({ ...formData, workflowId: e.value });
                  }}
                  isAsyncPaginate={true}
                  placeholder="Chọn luồng công việc"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionWorkflow}
                  disabled={disable}
                  // formatOptionLabel={formatOptionLabelAttribute}
                />
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
