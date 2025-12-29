import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, IActionModal } from "model/OtherModel";
import { IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import "./EmployeeListModal.scss";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import SelectCustom from "components/selectCustom/selectCustom";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import ImageThirdGender from "assets/images/third-gender.png";
import EmployeeService from "services/EmployeeService";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TeamEmployeeService from "services/TeamEmployeeService";

export default function EmployeeListModal(props: any) {
  const { onShow, onHide, dataTeam } = props;
  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataEmployee, setDataEmployee] = useState(null);
  const [isAddEmployee, setIsAddEmployee] = useState(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    if (dataTeam && onShow) {
      setParams((preState) => ({ ...preState, groupId: dataTeam?.id }));
    }
  }, [dataTeam, onShow]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "nhân viên",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [employeeList, setEmployeeList] = useState([]);
  console.log('employeeList', employeeList);
  
  const abortController = new AbortController();

  const getListEmployee = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await TeamEmployeeService.listEmployee(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setEmployeeList(result?.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getListEmployee(params);
  }, [params]);

  const titles = ["STT", "Tên nhân viên", "Phòng ban", "Chức vụ"];
  const dataFormat = ["text-center", "", "", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.employee.name,
    item.employee.departmentName,
    item.employee.jteName,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataEmployee(item);
          setIsAddEmployee(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "nhân viên " : `${listIdChecked.length} nhân viên đã chọn`}{" "}
          {item ? <strong>{item.employee.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: async () => {
        if (listIdChecked.length > 0) {
          onDeleteAllOperator();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const onDelete = async (id: number) => {
    const response = await TeamEmployeeService.deleteEmployee(id);
    if (response.code === 0) {
      showToast("Xóa nhân viên thành công", "success");
      getListEmployee(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllOperator = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        TeamEmployeeService.deleteEmployee(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa nhân viên thành công", "success");
        getListEmployee(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa nhân viên",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
          //   {
          //     title:  "Xác nhận",
          //     // type: "submit",
          //     color: "primary",
          //     disabled: lstAttributeSelected?.length > 0 ? false : true,
          //     // is_loading: isSubmit,
          //     callback: () => {
          //       handleSubmit(lstAttributeSelected)
          //     },
          //   },
        ],
      },
    }),
    []
  );

  ////Thêm nhân viên
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);
  const [valueEmployee, setValueEmployee] = useState(null);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);

  useEffect(() => {
    if (dataEmployee) {
      if (dataEmployee.employeeId && dataEmployee.employee) {
        setValueEmployee({
          value: dataEmployee.employeeId,
          avatar: dataEmployee.employee.avatar,
          label: dataEmployee.employee.name,
          departmentName: dataEmployee.employee.departmentName,
          jteName: dataEmployee.employee.jteName,
        });
      }
    }
  }, [dataEmployee]);

  const values = useMemo(
    () =>
      ({
        id: dataEmployee?.id ?? 0,
        employeeId: dataEmployee?.employeeId ?? 0,
        groupId: dataEmployee?.groupId ?? dataTeam?.id ?? 0,
      } as any),
    [onShow, dataEmployee, dataTeam]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
  ];

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };    
    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = (response.result.items || []).filter((item) => {
        return !employeeList.some((el) => el.employee?.id === item.id);
      });

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  departmentName: item.departmentName,
                  jteName: item.title,
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

  useEffect(() => {
    if(onShow){
      loadedOptionEmployee("", undefined, { page: 1 });
    }
  }, [employeeList]);

  const formatOptionLabelEmployee = ({ label, avatar, departmentName, jteName }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div>
          <div>{label}</div>
          {departmentName ? (
            <div>
              <span style={{ fontSize: 10, fontWeight: "200", marginTop: 3 }}>{`${departmentName} ${jteName ? ` - ${jteName}` : ""}`}</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    setValueEmployee(e);
    setCheckFieldEmployee(false);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async () => {
    // const errors = Validate(validations, formData, [...listFieldBasic]);
    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }
    if (!valueEmployee) {
      setCheckFieldEmployee(true);
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(formData.values as any),
    };

    const response = await TeamEmployeeService.updateEmployee(body);

    if (response.code === 0) {
      showToast(`Thêm nhân viên thành công`, "success");
      setIsSubmit(false);
      getListEmployee(params);
      cancelAdd();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const actionsAdd = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Quay lại",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? cancelAdd() : showDialogConfirmCancel();
            },
          },
          {
            title: dataEmployee ? "Cập nhật" : "Thêm mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            // !isDifferenceObj(formData.values, values) ||
            // (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, dataEmployee]
  );

  const cancelAdd = () => {
    setIsAddEmployee(false);
    setDataEmployee(null);
    setValueEmployee(null);
    setCheckFieldEmployee(false);
    setFormData({ ...formData, values: values, errors: {} });
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataEmployee ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        cancelAdd();
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
    };
    setContentDialogAdd(contentDialog);
    setShowDialogAdd(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialogAdd) {
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
        toggle={() => {
          if (!isSubmit) {
            cancelAdd();
            onHide();
          }
        }}
        className="modal-list-employee"
        size="lg"
      >
        <div className="container-list-employee">
          <ModalHeader
            title={isAddEmployee ? `${dataEmployee ? "Chỉnh sửa nhân viên" : "Thêm mới nhân viên"}` : `Danh sách nhân viên`}
            toggle={() => {
              if (!isSubmit) {
                cancelAdd();
                onHide();
              }
            }}
          />
          <ModalBody>
            <div className="form-list-employee">
              {isAddEmployee ? null : (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                  <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick={() => {
                      setIsAddEmployee(true);
                    }}
                  >
                    Thêm nhân viên
                  </Button>
                </div>
              )}

              {!isAddEmployee ? (
                <div>
                  {!isLoading && employeeList && employeeList.length > 0 ? (
                    <BoxTable
                      name="Danh sách nhân viên"
                      titles={titles}
                      items={employeeList}
                      isPagination={true}
                      dataPagination={pagination}
                      dataMappingArray={(item, index) => dataMappingArray(item, index)}
                      dataFormat={dataFormat}
                      listIdChecked={listIdChecked}
                      isBulkAction={true}
                      bulkActionItems={bulkActionList}
                      striped={true}
                      setListIdChecked={(listId) => setListIdChecked(listId)}
                      actions={actionsTable}
                      actionType="inline"
                    />
                  ) : isLoading ? (
                    <Loading />
                  ) : (
                    <SystemNotification description={<span>Hiện tại chưa có tổng đài viên nào.</span>} type="no-item" />
                  )}
                </div>
              ) : (
                <div className="list-form-group">
                  <div className="form-group">
                    <SelectCustom
                      key={employeeList?.length}
                      id="employeeId"
                      name="employeeId"
                      label="Nhân viên"
                      fill={true}
                      required={true}
                      error={checkFieldEmployee}
                      message="Nhân viên không được bỏ trống"
                      options={[]}
                      value={valueEmployee}
                      onChange={(e) => handleChangeValueEmployee(e)}
                      isAsyncPaginate={true}
                      isFormatOptionLabel={true}
                      placeholder="Chọn nhân viên"
                      additional={{
                        page: 1,
                      }}
                      loadOptionsPaginate={loadedOptionEmployee}
                      formatOptionLabel={formatOptionLabelEmployee}
                    />
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={isAddEmployee ? actionsAdd : actions} />
        </div>
      </Modal>
      <Dialog content={isAddEmployee ? contentDialogAdd : contentDialog} isOpen={isAddEmployee ? showDialogAdd : showDialog} />
    </Fragment>
  );
}
