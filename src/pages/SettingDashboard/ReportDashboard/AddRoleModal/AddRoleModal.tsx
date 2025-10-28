import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, getPageOffset, isDifferenceObj } from "reborn-util";
import "./AddRoleModal.scss";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import ReportChartService from "services/ReportChartService";
import DepartmentService from "services/DepartmentService";
import { ContextType, UserContext } from "contexts/userContext";

export default function AddRoleModal(props: any) {
  const { onShow, onHide, dataReportDashboard} = props;
  const focusedElement = useActiveElement();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataRole, setDataRole] = useState(null);
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [isAddRole, setIsAddRole] = useState(false);
  const [params, setParams] = useState({
      name: "",
      limit: 10,
  });

  useEffect(() => {
      if(dataReportDashboard && onShow){
          setParams((preState) => ({...preState, dashboardId: dataReportDashboard?.id}))
      }
  }, [dataReportDashboard, onShow])

    const [pagination, setPagination] = useState<PaginationProps>({
        ...DataPaginationDefault,
        name: "chức vụ",
        isChooseSizeLimit: true,
        setPage: (page) => {
            setParams((prevParams) => ({ ...prevParams, page: page }));
        },
        chooseSizeLimit: (limit) => {
            setParams((prevParams) => ({ ...prevParams, limit: limit }));
        },
    });


    const [roleList, setRoleList] = useState([])

    const abortController = new AbortController();

    const getListRole = async (paramsSearch: any) => {
        setIsLoading(true);

        const response = await ReportChartService.listReportRole(paramsSearch, abortController.signal);

        if (response.code == 0) {
            const result = response.result.items;
            setRoleList(result);

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
        getListRole(params)
    }, [params])

    const titles = ["STT", "Chức vụ", "Phòng ban"];
    const dataFormat = ["text-center", "", "text-center", "text-right"];

    const dataMappingArray = (item: any, index: number) => [
        getPageOffset(params) + index + 1,
        item.jobTitle,
        item.departmentName,
    ];

    const actionsTable = (item: any): IAction[] => {
        
        return [
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
                setDataRole(item);
                setIsAddRole(true);
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
              Bạn có chắc chắn muốn xóa chức vụ đã chọn
              {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
            </Fragment>
          ),
          cancelText: "Hủy",
          cancelAction: () => {
            setShowDialog(false);
            setContentDialog(null);
          },
          defaultText: "Xóa",
          defaultAction: async () => {
            const response = await ReportChartService.deleteReportRole(item.id);
            if (response.code === 0) {
                showToast("Xóa chức vụ thành công", "success");
                getListRole(params)
            } else {
                showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
            }
                setShowDialog(false);
                setContentDialog(null);
          },
        };
        setContentDialog(contentDialog);
        setShowDialog(true);
    };

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


  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);
  const [valueRole, setValueRole] = useState(null);
  const [valueDepartment, setValueDepartment] = useState(null);
  const [listJobTitle, setListJobTitle] = useState([]);

  useEffect(() => {
    if(dataRole?.jteId){
      setValueRole({value: dataRole.jteId, label: dataRole.jobTitle})
    }
    if(dataRole?.departmentId){
      setValueDepartment({value: dataRole.departmentId, label: dataRole.departmentName})
    }
  }, [dataRole])
  

  const values = useMemo(
    () =>
    ({
      id: dataRole?.id ??  0,
      dashboardId: dataRole?.dashboardId ?? dataReportDashboard?.id ?? 0,
      departmentId: dataRole?.departmentId ?? 0,
      jteId: dataRole?.jteId ?? 0,
    } as any),
    [onShow, dataRole, dataReportDashboard]
  );  

  const [formData, setFormData] = useState<IFormData>({ values: values });
  
  const validations: IValidation[] = [
    {
        name: "name",
        rules: "required",
    },
    
  ];

  const loadedOptionDepartment = async (search, loadedOptions, { page }) => {

    const params = {
        name: search,
        limit: 1000,
        page: 1,
        branchId: dataBranch.value,
    }

    const response = await DepartmentService.list(params);

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
        // hasMore: response.result.loadMoreAble,
        // additional: {
        //   page: page + 1,
        // },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueDepartment = (e) => {
    setValueDepartment(e);
    setFormData({ ...formData, values: { ...formData?.values, departmentId: e.value } });
    getDetailDepartment(e.value);
  };

  const getDetailDepartment = async (id) => {
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
  };

  const loadedOptionRole = async (search, loadedOptions, { page }) => {

    const params = {
        name: search,
        limit: 10,
        page: 1
    }

    const response = await ReportChartService.listReportArtifact(params);

    if (response.code === 0) {
      const dataOption = response.result?.items;

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

  const handleChangeValueRole = (e) => {
    setValueRole(e);
    setFormData({ ...formData, values: { ...formData?.values, jteId: e.value } });

  };


  const listFieldBasic = useMemo(
    () =>
      [
        {
          name: "departmentId",
          type: "custom",
          snippet: (
              <SelectCustom
                  id="departmentId"
                  name="departmentId"
                  label= "Phòng ban"
                  fill={true}
                  options={[]}
                  isMulti={false}
                  value={valueDepartment}
                  onChange={(e) => handleChangeValueDepartment(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  loadOptionsPaginate={loadedOptionDepartment}
                  placeholder="Chọn phòng ban"
                  additional={{
                      page: 1,
                  }}
              />
          ),
      },
      {
          name: "jteId",
          type: "custom",
          snippet: (
              <SelectCustom 
                  id="jteId"
                  name="jteId"
                  label= "Chức vụ"
                  fill={true}
                  options={listJobTitle}
                  isMulti={false}
                  special={true}
                  value={valueRole}
                  onChange={(e) => handleChangeValueRole(e)}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  loadOptionsPaginate={loadedOptionRole}
                  placeholder="Chọn chức vụ"
                  disabled={valueDepartment?.value ? false : true}
                  // additional={{
                  //     page: 1,
                  // }}
              />
          ),
      },
        
       
      ] as IFieldCustomize[],
    [formData?.values, valueRole, valueDepartment, listJobTitle]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);


  const onSubmit = async () => {

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body = {
        ...(formData.values as any),
        // ...(data ? { id: data.id } : {}),
    };

    const response = await ReportChartService.updateReportRole(body);

    if (response.code === 0) {
        showToast(`Thêm chức vụ thành công`, "success");
        setIsSubmit(false);
        getListRole(params);
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
            title: dataRole ? "Cập nhật" : "Thêm mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, dataRole]
  );

  const cancelAdd = () => {
    setIsAddRole(false);
    setDataRole(null);
    setValueRole(null);
    setValueDepartment(null);
    setListJobTitle([])
    setFormData({ ...formData, values: values, errors: {} });
  }

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataRole ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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
            if(!isSubmit){
                cancelAdd();
                onHide();
            }
        }}
        className="modal-add-role"
        size="lg"
      >
        <div className="container-add-role">
          <ModalHeader
            title={isAddRole ? `${dataRole ? 'Chỉnh sửa chức vụ' : 'Thêm mới chức vụ'}` : `Danh sách chức vụ`} 
            toggle={() => {
                if(!isSubmit){
                    cancelAdd();
                    onHide();
                }
            }}
          />
          <ModalBody>
            <div className="form-add-role">
                {isAddRole ? 
                  null
                  :
                  <div style={{display:'flex', justifyContent:'flex-end', marginBottom: 10}}>
                      <Button
                          // type="submit"
                          color="primary"
                          // disabled={}
                          onClick = {() => {
                              setIsAddRole(true)
                          }}
                      >
                          Thêm chức vụ
                      </Button>
                  </div>
                 }

                {!isAddRole? 
                    <div>
                        {!isLoading && roleList && roleList.length > 0 ? (
                            <BoxTable
                                name="Danh sách chức vụ"
                                titles={titles}
                                items={roleList}
                                isPagination={true}
                                dataPagination={pagination}
                                dataMappingArray={(item, index) => dataMappingArray(item, index)}
                                dataFormat={dataFormat}
                                // listIdChecked={listIdChecked}
                                isBulkAction={true}
                                // bulkActionItems={bulkActionList}
                                striped={true}
                                // setListIdChecked={(listId) => setListIdChecked(listId)}
                                actions={actionsTable}
                                actionType="inline"
                            />
                        ) : isLoading ? (
                        <Loading />
                        ) : (
                        <SystemNotification description={<span>Hiện tại chưa có chức vụ nào nào.</span>} type="no-item" />
                        )}
                    </div>
                    : 
                    <div className="list-form-group">
                        {listFieldBasic.map((field, index) => (
                            <FieldCustomize
                                key={index}
                                field={field}
                                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                                formData={formData}
                            />
                        ))}
                    </div>
                }
            </div>

          </ModalBody>
          <ModalFooter actions={isAddRole ? actionsAdd : actions} />
        </div>
      </Modal>
      <Dialog content={isAddRole ? contentDialogAdd : contentDialog} isOpen={isAddRole ? showDialogAdd : showDialog} />
      
    </Fragment>
  );
}
