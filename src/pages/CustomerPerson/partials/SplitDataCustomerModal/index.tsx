import React, { Fragment, useState, useMemo, useContext, useEffect } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import CustomerService from "services/CustomerService";
import RadioList from "components/radio/radioList";
import "./index.scss";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";
import Icon from "components/icon";
import TeamEmployeeService from "services/TeamEmployeeService";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { getPageOffset } from "reborn-util";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";

export default function SplitDataCustomerModal(props: any) {
  const { onShow, onHide, paramsCustomerList, pagination, listIdChecked } = props;  
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [type, setType] = useState("SMART");
  const [quantityData, setQuantityData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [listEmployee, setListEmployee] = useState([]);
  const [checkFieldEmployee, setCheckFieldEmployee] = useState(false);
  const [teamEmployee, setTeamEmployee] = useState(null);
  const [checkFieldTeamEmployee, setCheckFieldTeamEmployee] = useState(false);

  const [tableEmployee, setTableEmployee] = useState([]);
  const [listIdCheckedEmployee, setListIdCheckedEmployee] = useState<number[]>([]);
  console.log('listIdCheckedEmployee', listIdCheckedEmployee);
  
  const [params, setParams] = useState<any>({
    name: "",
    limit: 30,
    page: 1
  });

  const [paginationEmployee, setPaginationEmployee] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "nhóm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTableEmployee = async (paramsSearch: any) => {
    setIsLoading(true);
    const response = await EmployeeService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setTableEmployee(result?.items);

      setPaginationEmployee({
        ...paginationEmployee,
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

  const titles = ["STT", "Tên nhân viên",  "Phòng ban"];
  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.departmentName
  ];

  const actionsTable = (item: any): IAction[] => {
    return [];
  };


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
        return !listEmployee.some((el) => el.value === item.id);
      });
    
      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  departmentName: item.departmentName
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
      getListTableEmployee(params);
    }
  }, [listEmployee, params, onShow]);

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
    setCheckFieldEmployee(false);
    setListEmployee((pre) => [e, ...pre]);
  };

  const loadedOptionTeamEmployee = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await TeamEmployeeService.list(param);

    if (response.code === 0) {      
      const dataOption = response.result || [];
    
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

  const handleChangeTeamEmployee = (e) => {
    setCheckFieldTeamEmployee(false);
    setTeamEmployee(e);
    getListEmployeeFromTeam(e.value);
  };

  const getListEmployeeFromTeam = async (groupId: any) => {
    const params = {
      groupId: groupId,
      limit: 1000
    }
    const response = await TeamEmployeeService.listEmployee(params);

    if (response.code == 0) {
      const result = response.result?.items || [];
      const listId = result?.map(item => {
        return item.employee?.id;
      })
      setListEmployee(listId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa nhóm nhân viên",
      callback: () => {},
    },
  ];

  const onSubmit = async (e) => {
    e.preventDefault();

    console.log('teamEmployee', teamEmployee);
    
    // if(listEmployee?.length === 0){
    //   setCheckFieldEmployee(true);
    //   return;
    // }
    if(type === "SMART"){
      if(!quantityData){
        showToast("Vui lòng nhập số khách hàng cho mỗi nhân viên", "error");
        return;
      }
      if(listIdCheckedEmployee?.length === 0){
        showToast("Vui lòng chọn nhân viên", "error");
        return;
      }
    }
    if(type === "EVEN" && !teamEmployee){
      setCheckFieldTeamEmployee(true);
      return;
    }

    setIsSubmit(true);

    const listEmployeeId = type === "SMART" ? listIdCheckedEmployee : listEmployee;

    const body = {
      employeesAssign: listEmployeeId || [],
      strategy: type,
      // ...paramsCustomerList,
      ...(type === "SMART" ? {assignNum: quantityData} : {}),
      // preview: true,
      limit: pagination?.totalItem,
      customerIds: listIdChecked
    }

    const response = await CustomerService.customerAssign(body);

    if (response.code === 0) {
      showToast("Chia dữ liệu khách hàng thành công", "success");
      handleClearForm(true);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsSubmit(false);
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setType("SMART");
    setListEmployee([]);
    setQuantityData(null);
    setTableEmployee([]);
    setListIdCheckedEmployee([]);
    setParams({
      name: "",
      limit: 30,
      page: 1
    })
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            // disabled: isSubmit,
            callback: () => {
                handleClearForm(false)
            //   !valueMA ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Áp dụng",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            // || !valueMA,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, teamEmployee, quantityData, listIdCheckedEmployee, listEmployee, type]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
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
  

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => handleClearForm(false)}
        className="modal_split-data-customer"
        size="lg"
      >
        <form className="form_split-data-customer" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Chia dữ liệu khách hàng`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className= "list-form-group" style={type === 'EVEN' ? {overflow: 'visible'} : {}}>
              <div className="form-group">
                <RadioList
                  options={[
                    { value: "SMART", label: "Chia cố định" },
                    { value: "EVEN", label: "Chia đều" },
                  ]}
                  title="Cách thực hiện:"
                  name="type"
                  value={type}
                  onChange={(e) => {
                    const value = e.target.value;
                    setType(value);
                    if("SMART"){
                      setTeamEmployee(null);
                      setListEmployee([]);
                    }
                    if(value === "EVEN"){
                      setQuantityData(null);
                      setListIdCheckedEmployee([]);
                    }
                  }}
                />
              </div>

              {type === "SMART" ? 
                <div className="form-group">
                  <NummericInput
                    label={'Số khách hàng cho mỗi nhân viên:'}
                    value={quantityData}
                    fill={true}
                    required={true}
                    placeholder='Nhập số lượng'
                    thousandSeparator
                    onValueChange={(e) => setQuantityData(e.floatValue)}
                  />
                </div>
              : null}

              <div className="container-list-employee">
                {type === "SMART" ? 
                  <div>
                    <span style={{fontSize: 14, fontWeight: '700'}}>Danh sách nhân viên</span>
                    <div className="container-table-employee">
                      {!isLoading && tableEmployee && tableEmployee.length > 0 ? (
                        <BoxTable
                          name="Nhân viên"
                          titles={titles}
                          items={tableEmployee}
                          isPagination={true}
                          dataPagination={paginationEmployee}
                          dataMappingArray={(item, index) => dataMappingArray(item, index)}
                          dataFormat={dataFormat}
                          striped={true}
                          isBulkAction={true}
                          listIdChecked={listIdCheckedEmployee}
                          bulkActionItems={bulkActionList}
                          setListIdChecked={(listId) => setListIdCheckedEmployee(listId)}
                          actions={actionsTable}
                          actionType="inline"
                        />
                      ) : isLoading ? (
                        <Loading />
                      ) : (
                        <Fragment>
                          <SystemNotification
                              description={
                                <span>
                                  Không có dữ liệu trùng khớp.
                                  <br />
                                  Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                                </span>
                              }
                              type="no-result"
                            />
                        </Fragment>
                      )}
                    </div>
                  </div>
                  // <div className="form-group">
                  //   <SelectCustom
                  //     key={listEmployee.length}
                  //     id="employeeId"
                  //     name="employeeId"
                  //     label="Danh sách nhân viên"
                  //     options={[]}
                  //     fill={true}
                  //     // value={valueMA}
                  //     required={true}
                  //     onChange={(e) => handleChangeValueEmployee(e)}
                  //     isAsyncPaginate={true}
                  //     isFormatOptionLabel={true}
                  //     placeholder="Chọn nhân viên"
                  //     additional={{
                  //       page: 1,
                  //     }}
                  //     loadOptionsPaginate={loadedOptionEmployee}
                  //     formatOptionLabel={formatOptionLabelEmployee}
                  //     error={checkFieldEmployee}
                  //     message="Nhân viên không được để trống"
                  //   />
                  // </div>
                  :
                    <div className="form-group">
                      <SelectCustom
                        id="groupId"
                        name="groupId"
                        label="Nhóm nhân viên"
                        options={[]}
                        fill={true}
                        value={teamEmployee}
                        required={true}
                        onChange={(e) => handleChangeTeamEmployee(e)}
                        isAsyncPaginate={true}
                        isFormatOptionLabel={true}
                        placeholder="Chọn nhóm nhân viên"
                        additional={{
                          page: 1,
                        }}
                        loadOptionsPaginate={loadedOptionTeamEmployee}
                        error={checkFieldTeamEmployee}
                        message="Nhóm Nhân viên không được để trống"
                      />
                    </div>
                  }

                {/* {listEmployee && listEmployee.length > 0 ? 
                  <div className="container-list-employee">
                    <div className="list-employee">
                      {listEmployee.map((item, index) => (
                        <div key={index} className="item-employee">
                          <div className="avatar">
                            <img src={item?.avatar || ImageThirdGender} alt={'Trung nguyen'} />
                          </div>
                          <div className="name-employee">
                            <div>
                              <span style={{fontSize: 14, fontWeight: '500'}}>{item?.label}</span>
                            </div>
                            <div>
                              <span style={{fontSize: 12, fontWeight: '500', color: 'var(--extra-color-50)'}}>{item?.departmentName}</span>
                            </div>
                          </div>
                          <div className="button-delete-employee" 
                            onClick={() => {
                              const newArray = [...listEmployee];
                              newArray.splice(index, 1);
                              setListEmployee(newArray);
                            }}
                          >
                            <Icon name="Trash" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                : null} */}
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
