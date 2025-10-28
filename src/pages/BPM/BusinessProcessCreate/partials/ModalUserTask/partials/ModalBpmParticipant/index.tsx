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
import TeamEmployeeService from "services/TeamEmployeeService";
import TeamEmployeeAdvance from "./TeamEmployeeAdvance/TeamEmployeeAdvance";
import TableParticipantRule from "./partial/TableParticipantRule";
import Loading from "components/loading";
import { convertDataRow } from "./partial/TableParticipantRule/ConvertDataRow";

export default function ModalBpmParticipant({ onShow, onHide, dataNode, formSchema, processId, disable }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);
  const [dataWorkflow, setDataWorkflow] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingDataAdvance, setLoadingDataAdvance] = useState<boolean>(false);
  const [dataAdvance, setDataAdvance] = useState(null);
  const [dataConfigAdvance, setDataConfigAdvance] = useState({
    columns: [],
    rows: [],
  });
  const [formDataAdvance, setFormDataAdvance] = useState({
    id: null,
    name: "",
    description: "",
    nodeId: dataNode?.id ?? null,
    config: {
      columns: [],
      rows: [],
    },
  });

  const getDetailParticipant = async (formId, nodeId) => {
    const params = {
      nodeId: nodeId,
    };

    const response = await BusinessProcessService.detailBpmParticipant(nodeId);
    console.log("response>>>", response);

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

      if (result.teamId) {
        setTeamEmployee({ value: result.teamId, label: result.teamName });
      }

      if (result.teamMember) {
        setTeamMember({ value: result.teamMember, label: result.teamMemberName });
      }
      if (result.teamId) {
        setTeamEmployee({ value: result.teamId, label: result.teamName });
      }

      if (result.teamMember) {
        setTeamMember({ value: result.teamMember, label: result.teamMemberName });
      }

      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
      setData({
        ...result,
        typeDepartment: result.department?.includes("frm") ? 1 : result.department?.includes("var") ? 2 : 0,
        typeJte: result.jte?.includes("frm") ? 1 : result.jte?.includes("var") ? 2 : 0,
        typeEmployee: result.employee?.includes("frm") ? 1 : result.employee?.includes("var") ? 2 : 0,
        typeFieldName: result.fieldName?.includes("frm") ? 1 : result.fieldName?.includes("var") ? 2 : null,
        fieldProcess: result.fieldProcess ? result.fieldProcess.toString() : "",
      });
      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
      setData({
        ...result,
        typeDepartment: result.department?.includes("frm") ? 1 : result.department?.includes("var") ? 2 : 0,
        typeJte: result.jte?.includes("frm") ? 1 : result.jte?.includes("var") ? 2 : 0,
        typeEmployee: result.employee?.includes("frm") ? 1 : result.employee?.includes("var") ? 2 : 0,
        typeFieldName: result.fieldName?.includes("frm") ? 1 : result.fieldName?.includes("var") ? 2 : null,
        fieldProcess: result.fieldProcess ? result.fieldProcess.toString() : "",
      });
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const getDetailTaskAdvance = async (nodeId) => {
    const response = await BusinessProcessService.detailBusinessRuleTaskAdvance({ nodeId: nodeId, type: "ASSIGN" });

    if (response.code == 0) {
      const result = response.result;

      setDataAdvance({
        ...result,
        config: result?.config ? JSON.parse(result.config) : null,
      });

      setTypeNode(result?.pickMode ?? "NONE");

      setDataConfigAdvance({
        columns: result?.config ? JSON.parse(result.config)?.columns : [], //result?.config?.columns || [],
        rows: result?.config ? JSON.parse(result.config)?.rows : [], //result?.config?.rows || [],
      });
      setFormDataAdvance({
        id: result?.id ?? null,
        name: result?.name ?? "",
        description: result?.description ?? "",
        nodeId: dataNode?.id ?? null,
        config: {
          columns: result?.config ? JSON.parse(result.config)?.columns : [],
          rows: result?.config ? JSON.parse(result.config)?.rows : [],
        },
      });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setLoadingDataAdvance(false);
  };

  useEffect(() => {
    if (onShow && dataNode && formSchema) {
      setIsLoading(true);
      getDetailParticipant(formSchema?.id, dataNode?.id);
      getDetailTaskAdvance(dataNode?.id);
    }
  }, [dataNode, formSchema, onShow]);

  const values = useMemo(
    () => ({
      id: data?.id ?? null,
      type: data?.type?.toString() ?? "0", //0 chọn người xử lý cụ thể, 1 lấy theo người xử lý ở node khác
      // fieldName: data?.fieldName ?? '',
      // fieldNameType:  data?.fieldName?.includes('var') ? 2 : 1,
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

      fieldName: data?.fieldName ?? "",
      typeFieldName: data?.typeFieldName ?? 1,
      fieldProcess: data?.fieldProcess ?? "",

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
    if (formData.type === "4") {
      let dataConfig = convertDataRow(dataConfigAdvanceEdit, dataNode?.id);
      const body = {
        id: formDataAdvance.id ?? null,
        nodeId: dataNode?.id ?? null,
        name: "ASSIGN_" + dataNode?.id,
        type: "ASSIGN",
        description: "ASSIGN_" + dataNode?.id,
        inputs: dataConfig?.inputs ? JSON.stringify(dataConfig?.inputs) : null,
        outputs: dataConfig?.outputs ? JSON.stringify(dataConfig?.outputs) : null,
        config: dataConfig?.config ? JSON.stringify(dataConfig?.config) : null,
        rules: dataConfig?.rules || [],
        pickMode: typeNode,
      };

      const response = await BusinessProcessService.updateBusinessRuleTaskAdvance(body);
      if (response.code === 0) {
        showToast(`Cài đặt nhóm nhân viên thành công`, "success");
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        setIsSubmit(false);
      }
    }

    const response = await BusinessProcessService.updateBpmParticipant(body);

    if (response.code === 0) {
      // showToast(`Cập nhật người xử lý thành công`, "success");
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
                  disabled: isSubmit || (!isDifferenceObj(formData, values) && formData.type !== "4"),
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
        handleClear(false);
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

  useEffect(() => {
    if (dataRole) {
      if (typeof dataRole.value === "number") {
        loadedOptionEmployee("", undefined, { page: 1 });
      }
    }
  }, [dataDepartment, dataRole]);

  //* đoạn này xử lý vấn đề lấy ra danh sách nhân viên
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

  //? đoạn này xử lý vấn đề thay đổi nhân viên
  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
    setFormData({ ...formData, employee: e.value });
  };

  //* đoạn này xử lý vấn đề hiển thị hình ảnh nhân viên
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

  const [teamEmployee, setTeamEmployee] = useState(null);

  const loadedOptionTeamEmployee = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: 1,
      limit: 100,
    };

    const response = await TeamEmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result || [];
      const option = [
        // {
        //   value: -1,
        //   label: 'Không chỉ định'
        // },
        ...dataOption.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        }),
      ];

      return {
        options: option,
        // hasMore: response.result.loadMoreAble,
        // additional: {
        //   page: page + 1,
        // },
      };
    }

    return { options: [], hasMore: false };
  };

  //? đoạn này xử lý vấn đề thay đổi nhân viên
  const handleChangeValueTeamEmployee = (e) => {
    setTeamEmployee(e);
    setTeamMember(null);
    setFormData({ ...formData, teamId: e.value });
  };

  const [teamMember, setTeamMember] = useState(null);

  const loadedOptionTeamMember = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      groupId: teamEmployee?.value,
    };

    const response = await TeamEmployeeService.listEmployee(param);

    if (response.code === 0) {
      const dataOption = response.result.items || [];
      const option = [
        // {
        //   value: -1,
        //   label: 'Không chỉ định'
        // },
        ...dataOption.map((item) => {
          return {
            value: item.employeeId,
            label: item.employee.name,
          };
        }),
      ];

      return {
        options: option,
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  //? đoạn này xử lý vấn đề thay đổi nhân viên
  const handleChangeValueTeamMember = (e) => {
    setTeamMember(e);
    setFormData({ ...formData, teamMember: e.value });
  };

  useEffect(() => {
    if (teamEmployee?.value) {
      loadedOptionTeamMember("", undefined, { page: 1 });
    }
  }, [teamEmployee]);

  const [checkTeamUser, setCheckTeamUser] = useState(false);

  const handleChangeValueTeamUser = (e) => {
    setCheckTeamUser(false);
    setFormData({ ...formData, fieldName: e.value });
  };

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
                  value: `frm_${item.code}.${el.type}.${el.properties?.name}`,
                  label: `frm_${item.code}.${el.type}.${el.properties?.name}`,
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
    setTeamEmployee(null);
    setTeamMember(null);
  };

  const [dataConfigAdvanceEdit, setDataConfigAdvanceEdit] = useState({
    columns: [],
    rows: [],
  });
  const [typeNode, setTypeNode] = useState("NONE");

  const handleChangeValueTypeNode = async (type) => {
    let body = {
      nodeId: dataNode?.id ?? null,
      type: "ASSIGN",
      pickMode: type,
    };
    const response = await BusinessProcessService.updatePickMode(body);
    if (response.code === 0) {
      setTypeNode(type);
      showToast(`Cập nhật loại thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        // size="lg"
        size={formData.type === "4" ? "xxl" : "lg"}
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-bpm-participant"
      >
        <form className="form-bpm-participant-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Người xử lý`} toggle={() => !isSubmit && handleClear(false)} />
          <ModalBody>
            {/* <div className="form-switch-type">
              <div className="form-group">
                <RadioList
                  options={[
                    { value: "basic", label: "Cơ bản" },
                    { value: "advance", label: "Nâng cao" },
                  ]}
                  // className="options-auth"
                  // required={true}
                  title="Loại cài đặt: "
                  name="typeNode"
                  value={typeNode}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTypeNode(value);
                  }}
                />
              </div>
            </div> */}
            {isLoading ? (
              <Loading />
            ) : (
              <div className="list-form-group">
                <div className="form-group">
                  <RadioList
                    options={[
                      {
                        value: "0",
                        label: "Theo phòng ban/chức danh",
                      },
                      {
                        value: "4",
                        label: "Theo nhóm nhân viên",
                      },
                      {
                        value: "2",
                        label: "Theo nhóm người dùng",
                      },
                      {
                        value: "3",
                        label: "Theo người tạo",
                      },
                    ]}
                    // className="options-auth"
                    required={true}
                    title=""
                    name="type"
                    value={formData.type}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (value === "4") {
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
                          fieldName: "",
                          typeFieldName: 1,
                          fieldProcess: "",
                        });
                        setDataDepartment(null);
                        setDataRole(null);
                        setDataEmployee(null);
                      } else if (value === "0") {
                        // if(data?.departmentId){
                        //   setFormData({...formData, type: value, fieldName: '', departmentId: data.departmentId, jteId: data.jteId, employeeId: data.employeeId});
                        //   setDataDepartment(data.departmentId ? {value: data.departmentId, label: data.departmentName} : null);
                        //   setDataRole(data.jteId ? {value: data.jteId, label: data.jteName} : null);
                        //   setDataEmployee(data.employeeId ? {value: data.employeeId, label: data.employeeId === -1 ? 'Không chỉ định' : data.employeeName} : null);
                        // } else {
                        //   setFormData({...formData, type: value, fieldName: ''});
                        // }
                        setTeamEmployee(null);
                        setTeamMember(null);
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
                            teamId: "",
                            teamMember: "",
                            fieldName: "",
                            typeFieldName: 1,
                            fieldProcess: "",
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
                            teamId: "",
                            teamMember: "",
                            fieldName: "",
                            typeFieldName: 1,
                            fieldProcess: "",
                          });
                        }
                      } else if (value === "2") {
                        setFormData({
                          ...formData,
                          type: value,
                          department: null,
                          typeDepartment: 0,
                          jte: null,
                          typeJte: 0,
                          employee: null,
                          typeEmployee: 0,
                          teamId: "",
                          teamMember: "",
                          fieldProcess: "1",
                        });
                        setDataDepartment(null);
                        setDataRole(null);
                        setDataEmployee(null);
                        setTeamEmployee(null);
                        setTeamMember(null);
                      } else if (value === "3") {
                        setFormData({
                          ...formData,
                          type: value,
                          department: null,
                          typeDepartment: 0,
                          jte: null,
                          typeJte: 0,
                          employee: null,
                          typeEmployee: 0,
                          teamId: "",
                          teamMember: "",
                          fieldProcess: "",
                        });
                        setDataDepartment(null);
                        setDataRole(null);
                        setDataEmployee(null);
                        setTeamEmployee(null);
                        setTeamMember(null);
                      }
                    }}
                  />
                </div>

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
                            formData.typeEmployee === 0
                              ? loadedOptionEmployee
                              : formData.typeEmployee === 1
                              ? loadedOptionForm
                              : loadedOptionAttribute
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

                {formData.type === "4" ? (
                  <div style={{ border: "1px solid", marginBottom: "1rem", overflow: "auto" }}>
                    <div className="form-switch-type">
                      <div className="form-group">
                        <RadioList
                          options={[
                            { value: "NONE", label: "None" },
                            { value: "BALANCE", label: "Balance" },
                            { value: "ROUND_ROBIN", label: "Round Robin" },
                          ]}
                          // className="options-auth"
                          // required={true}
                          title="Cơ chế chọn người xử lý: "
                          name="typeNode"
                          value={typeNode}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChangeValueTypeNode(value);
                            setTypeNode(value);
                          }}
                        />
                      </div>
                    </div>
                    <TableParticipantRule
                      dataNode={dataNode}
                      processId={processId}
                      childProcessId={processId}
                      dataConfigAdvance={dataConfigAdvance}
                      setDataConfigAdvanceEdit={setDataConfigAdvanceEdit}
                    />
                  </div>
                ) : // <TeamEmployeeAdvance dataNode={dataNode} processId={processIdAll} />
                null}

                {formData.type === "2" ? (
                  <div style={{ width: "100%" }}>
                    <div className="form-group" style={{ marginBottom: "1.6rem" }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: "700" }}>
                          Chọn đầu vào <span style={{ color: "red" }}>*</span>
                        </span>
                      </div>
                      <div className={"container-select-mapping"}>
                        <div className="select-mapping">
                          <SelectCustom
                            key={formData?.typeFieldName}
                            id="fieldName"
                            name="fieldName"
                            // label={'Chọn phòng ban'}
                            fill={false}
                            required={true}
                            error={checkTeamUser}
                            // special={formData.typeTeamUser === 0 ? true : false}
                            message="Đầu vào không được để trống"
                            options={[]}
                            value={formData.fieldName ? { value: formData.fieldName, label: formData.fieldName } : null}
                            onChange={(e) => handleChangeValueTeamUser(e)}
                            isAsyncPaginate={true}
                            placeholder={formData.typeFieldName === 1 ? "Chọn trường trong form" : "Chọn biến"}
                            additional={{
                              page: 1,
                            }}
                            loadOptionsPaginate={formData.typeFieldName === 1 ? loadedOptionForm : loadedOptionAttribute}
                            // formatOptionLabel={formatOptionLabelAttribute}
                            disabled={disable}
                          />
                        </div>
                        <Tippy
                          content={
                            formData.typeFieldName === 2 ? "Chuyển chọn trường trong form" : formData.typeFieldName === 1 ? "Chuyển chọn biến" : ""
                          }
                        >
                          <div
                            className={"icon-change-select"}
                            onClick={(e) => {
                              setFormData({
                                ...formData,
                                fieldName: "",
                                typeFieldName: formData.typeFieldName === 2 ? 1 : 2,
                              });
                            }}
                          >
                            <Icon name="ResetPassword" style={{ width: 18 }} />
                          </div>
                        </Tippy>
                      </div>
                    </div>
                    {/* <div className="form-group">
                        <RadioList
                          options={[
                            {
                              value: '1',
                              label: 'Song song'
                            },
                            {
                              value: '2',
                              label: 'Nối tiếp'
                            },
                          ]}
                          // className="options-auth"
                          required={true}
                          title="Loại xử lý"
                          name="type_handle"
                          value={formData.fieldProcess}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({...formData, fieldProcess: value});
                          }}
                        />
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
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
