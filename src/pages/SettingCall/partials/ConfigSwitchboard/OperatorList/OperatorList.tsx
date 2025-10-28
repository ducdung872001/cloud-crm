import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, getPageOffset, isDifferenceObj } from "reborn-util";
import "./OperatorList.scss";
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
import EmployeeAgentService from "services/EmployeeAgentService";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";

export default function OperatorList(props: any) {
  const { onShow, onHide, dataSwitchboard } = props;
  console.log("dataSwitchboard", dataSwitchboard);

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataOperator, setDataOperator] = useState(null);

  const [isAddOperator, setIsAddOperator] = useState(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    if (dataSwitchboard && onShow) {
      setParams((preState) => ({ ...preState, partnerId: dataSwitchboard?.partnerId }));
    }
  }, [dataSwitchboard, onShow]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "tổng đài viên",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [operatorList, setOperatorList] = useState([]);

  const abortController = new AbortController();

  const getListOperator = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await EmployeeAgentService.list(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setOperatorList(result?.items);

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
    getListOperator(params);
  }, [params]);

  const titles = ["STT", "Tên nhân viên", "Tên tài khoản"];
  const dataFormat = ["text-center", "", "", "text-right"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.employeeName,
    item.configs ? JSON.parse(item.configs)?.username : "",
    // item.configs ? JSON.parse(item.configs)?.password : '',
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataOperator(item);
          setIsAddOperator(true);
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
          Bạn có chắc chắn muốn xóa {item ? "tổng đài viên " : `${listIdChecked.length} tổng đài viên đã chọn`}
          {item ? <strong>{item.employeeName}</strong> : ""}? Thao tác này không thể khôi phục.
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
    const response = await EmployeeAgentService.delete(id);
    if (response.code === 0) {
      showToast("Xóa tổng đài viên thành công", "success");
      getListOperator(params);
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
        EmployeeAgentService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa tổng đài viên thành công", "success");
        getListOperator(params);
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
      title: "Xóa tổng đài viên",
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

  ////Thêm tài liệu

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);
  const [valueEmployee, setValueEmployee] = useState(null);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  // const [valueOperator, setValueOperator] = useState(null);
  // const [checkFieldOperator, setCheckFieldOperator] = useState<boolean>(false);

  const [dataAthena, setDataAthena] = useState({
    operatorId: "",
    operatorName: "",
    username: "",
    password: "",
  });

  console.log("dataAthena", dataAthena);

  useEffect(() => {
    if (dataOperator) {
      if (dataOperator.employeeId) {
        setValueEmployee({ value: dataOperator.employeeId, label: dataOperator.employeeName });
      }
      if (dataSwitchboard?.name === "Athena" && dataOperator.configs) {
        const configs = JSON.parse(dataOperator.configs);
        setDataAthena({
          operatorId: configs.operatorId,
          operatorName: configs.operatorName,
          username: configs.username,
          password: configs.password,
        });
      }
    }
  }, [dataOperator, dataSwitchboard]);

  const values = useMemo(
    () =>
      ({
        id: dataOperator?.id ?? 0,
        employeeId: dataOperator?.employeeId ?? 0,
        partnerId: dataOperator?.partnerId ?? dataSwitchboard?.partnerId ?? 0,
        configs: "",
      } as any),
    [onShow, dataOperator, dataSwitchboard]
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

  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    setValueEmployee(e);
    setCheckFieldEmployee(false);
    setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
  };

  const loadedOptionAthena = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await EmployeeAgentService.listAthena(param);

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

  const handleChangeValueOperator = (e) => {
    setDataAthena({ ...dataAthena, operatorId: e.value, operatorName: e.label });
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
      configs: dataSwitchboard?.name === "Athena" ? JSON.stringify(dataAthena) : "",
    };

    const response = await EmployeeAgentService.update(body);

    if (response.code === 0) {
      showToast(`Thêm tổng đài viên thành công`, "success");
      setIsSubmit(false);
      getListOperator(params);
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
            title: dataOperator ? "Cập nhật" : "Thêm mới",
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
    [formData, values, isSubmit, dataOperator, dataAthena]
  );

  const cancelAdd = () => {
    setIsAddOperator(false);
    setDataOperator(null);
    setValueEmployee(null);
    setCheckFieldEmployee(false);
    setFormData({ ...formData, values: values, errors: {} });
    setDataAthena({
      operatorId: "",
      operatorName: "",
      username: "",
      password: "",
    });
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataOperator ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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
        className="modal-list-operator"
        size="lg"
      >
        <div className="container-list-operator">
          <ModalHeader
            title={isAddOperator ? `${dataOperator ? "Chỉnh sửa tổng đài viên" : "Thêm mới tổng đài viên"}` : `Danh sách tổng đài viên`}
            toggle={() => {
              if (!isSubmit) {
                cancelAdd();
                onHide();
              }
            }}
          />
          <ModalBody>
            <div className="form-list-operator">
              {isAddOperator ? null : (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                  <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick={() => {
                      setIsAddOperator(true);
                    }}
                  >
                    Thêm tổng đài viên
                  </Button>
                </div>
              )}

              {!isAddOperator ? (
                <div>
                  {!isLoading && operatorList && operatorList.length > 0 ? (
                    <BoxTable
                      name="Danh sách tổng đài viên"
                      titles={titles}
                      items={operatorList}
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

                  {dataSwitchboard?.name === "Athena" ? (
                    <>
                      <div className="form-group">
                        <SelectCustom
                          id="operatorId"
                          name="operatorId"
                          label="Tổng đài viên"
                          fill={true}
                          required={true}
                          // error={checkFieldOperator}
                          // message="Tổng đài viên không được bỏ trống"
                          options={[]}
                          value={dataAthena?.operatorId ? { value: dataAthena.operatorId, label: dataAthena.operatorName } : null}
                          onChange={(e) => handleChangeValueOperator(e)}
                          isAsyncPaginate={true}
                          isFormatOptionLabel={true}
                          placeholder="Chọn tổng đài viên"
                          additional={{
                            page: 1,
                          }}
                          loadOptionsPaginate={loadedOptionAthena}
                          // formatOptionLabel={formatOptionLabelEmployee}
                        />
                      </div>
                      <div className="form-group">
                        <Input
                          label="Tên người dùng"
                          name="username"
                          fill={true}
                          required={true}
                          value={dataAthena?.username}
                          placeholder="Nhập tên người dùng"
                          onChange={(e) => {
                            const value = e.target.value;
                            setDataAthena({ ...dataAthena, username: value });
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <Input
                          label="Mật khẩu"
                          name="password"
                          fill={true}
                          required={true}
                          value={dataAthena?.password}
                          placeholder="Nhập mật khẩu"
                          onChange={(e) => {
                            const value = e.target.value;
                            setDataAthena({ ...dataAthena, password: value });
                          }}
                        />
                      </div>
                    </>
                  ) : null}

                  {/* <div className="form-group">
                        <NummericInput
                          label="Số máy nhánh"
                          name="extension"
                          fill={true}
                          required={true}
                          value={formData?.values?.extension}
                          // thousandSeparator={true}
                          placeholder="Nhập số máy nhánh"
                          decimalScale={0}
                          onValueChange={(e) => {
                            const value = e.floatValue;
                            // setFormData({ ...formData, dealValue: value?.replace(/,/g, "") });
                            setFormData({ ...formData, values: { ...formData?.values, extension: value } });
                          }}
                        />
                      </div> */}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={isAddOperator ? actionsAdd : actions} />
        </div>
      </Modal>
      <Dialog content={isAddOperator ? contentDialogAdd : contentDialog} isOpen={isAddOperator ? showDialogAdd : showDialog} />
    </Fragment>
  );
}
