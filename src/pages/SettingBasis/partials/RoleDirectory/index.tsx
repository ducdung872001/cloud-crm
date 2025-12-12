import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _, { set } from "lodash";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Badge from "components/badge/badge";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Button from "components/button/button";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IDepartmentDirectoryListProps } from "model/department/PropsModel";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { IDepartmentFilterRequest } from "model/department/DepartmentRequestModel";
import { IDepartmentResponse } from "model/department/DepartmentResponseModel";
import { showToast, getPermissions } from "utils/common";
import { trimContent, getPageOffset } from "reborn-util";
import { useWindowDimensions } from "utils/hookCustom";
import ViewConfigDepartment from "./partials/ViewConfigRole";
import ViewDetailDepartmentModal from "./partials/ViewDetailDepartmentModal/ViewDetailDepartmentModal";
import ViewEmployeeInDepartment from "./partials/ViewEmployeeInDepartmentModal/ViewEmployeeInDepartmentModal";

import "tippy.js/animations/scale.css";
import "./index.scss";
import EditParentDepartment from "./partials/EditParentDepartment/EditParentDepartment";
import { useSearchParams } from "react-router-dom";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import BeautyBranchService from "services/BeautyBranchService";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { ContextType, UserContext } from "contexts/userContext";
import AddUnitPriceDepartmentModal from "./partials/AddUnitPriceDepartmentModal/AddUnitPriceDepartmentModal";
import AddRoleDirectoryModal from "./partials/AddRoleDirectoryModal";
import TableRole from "./partials/TableRole";
import ViewConfigRole from "./partials/ViewConfigRole";
import RoleService from "services/RoleService";

export default function RoleDirectory(props: IDepartmentDirectoryListProps) {
  document.title = "Danh sách nhóm quyền";

  const { onBackProps, onNextPage } = props;

  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;
  const checkUserRoot = localStorage.getItem("user.root");
  const [searchParams, setSearchParams] = useSearchParams();
  const [listRole, setListRole] = useState<IDepartmentResponse[]>([]);
  const [dataRole, setDataRole] = useState<IDepartmentResponse>(null);
  const [idRole, setIdRole] = useState<number>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalView, setShowModalView] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showModalViewEmployee, setShowModalViewEmployee] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalEditParentDepartment, setShowModalEditParentDepartment] = useState<boolean>(false);
  const [valueBranch, setValueBranch] = useState(null);

  const { width } = useWindowDimensions();

  const [params, setParams] = useState<IDepartmentFilterRequest>({
    name: "",
    limit: 10,
    // branchId: 0
  });

  //? đoạn này xử lý vấn đề call api lấy ra danh sách chi nhánh
  const loadOptionBranch = async (search, loadedOptions, { page }) => {
    const param: IBeautyBranchFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IBeautyBranchResponse) => {
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

  // thay đổi giá trị branch
  const handleChangeValueBranch = (e) => {
    setValueBranch(e);
  };

  useEffect(() => {
    if (dataBranch) {
      setParams({ ...params, branchId: dataBranch.value });
    }
  }, [dataBranch]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách nhóm quyền",
      is_active: true,
    },
  ]);

  const departmentFilterList = useMemo(
    () =>
      [
        ...(+checkUserRoot == 1
          ? [
              {
                key: "branchId",
                name: "Chi nhánh",
                type: "select",
                is_featured: true,
                value: searchParams.get("branchId") ?? "",
              },
            ]
          : []),
      ] as IFilterItem[],
    [searchParams]
  );

  const listTabs = [
    {
      title: "Danh sách nhóm quyền",
      is_active: "tab_one",
      type: 1,
    },
  ];

  const [tab, setTab] = useState({
    name: "tab_one",
    type: 1,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nhóm quyền",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListDepartment = async (paramsSearch: IDepartmentFilterRequest) => {
    setIsLoading(true);

    const response = await RoleService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListRole(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params.name && +result.page === 1) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListDepartment(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }

    return () => {
      abortController.abort();
    };
  }, [params]);

  const titles = [
    "STT",
    "Tên nhóm quyền",
    "Mã nhóm quyền",
    "Phân quyền",
    "Xem nhân viên",
    // "Trạng thái hoạt động",
    //  "Ghi chú"
  ];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "text-center", ""];

  const dataSize = ["auto", "auto", "auto", "auto", "auto", "auto", 18];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.code || "",
    <a
      key={item.id}
      onClick={() => {
        setShowConfig(true);
        setDataRole(item);
        setIdRole(item.id);
      }}
    >
      Cấu hình
    </a>,
    // <a
    //   key={item.id}
    //   onClick={() => {
    //     setShowModalView(true);
    //     setIdRole(item.id);
    //   }}
    // >
    //   Xem thêm
    // </a>,
    <a
      key={item.id}
      onClick={() => {
        setShowModalViewEmployee(true);
        setDataRole(item);
      }}
    >
      Xem thêm
    </a>,
    // <Badge key={item.id} text={item.status === 1 ? "Đang hoạt động" : "Tạm dừng hoạt động"} variant={item.status === 1 ? "success" : "error"} />,
    // item.note.length > 0 ? (
    //   <Tippy key={item.id} content={item.note} delay={[120, 100]} animation="scale">
    //     <p className="content">{trimContent(item.note, 100, true, true)}</p>
    //   </Tippy>
    // ) : (
    //   ""
    // ),
  ];

  const actionsTable = (item: IDepartmentResponse): IAction[] => {
        const isCheckedItem = listIdChecked?.length > 0;
    return item.leadership === 1
      ? [
          permissions["DEPARTMENT_UPDATE"] == 1 && {
            title: "Sửa",
            icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
                        disabled: isCheckedItem,
            callback: () => {
                        if (!isCheckedItem) {
              setIdRole(item.id);
              setShowModalAdd(true);
              setDataRole(item);
                        }
            },
          },
        ]
      : [
          permissions["DEPARTMENT_UPDATE"] == 1 && {
            title: "Sửa",
            icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
                        disabled: isCheckedItem,
            callback: () => {
                        if (!isCheckedItem) {
              setIdRole(item.id);
              setShowModalAdd(true);
              setDataRole(item);
                        }
            },
          },
          permissions["DEPARTMENT_DELETE"] == 1 && {
            title: "Xóa",
            icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
                        disabled: isCheckedItem,
            callback: () => {
                        if (!isCheckedItem) {
              showDialogConfirmDelete(item);
                        }
            },
          },
        ];
  };

  const onDelete = async (id: number) => {
    const response = await RoleService.delete(id);

    if (response.code === 0) {
      showToast("Xóa nhóm quyền thành công", "success");
      getListDepartment(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        RoleService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xoá quy trình  thành công", "success");
        getListDepartment(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IDepartmentResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "nhóm quyền " : `${listIdChecked.length} nhóm quyền đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      // defaultAction: () => onDelete(item.id),
      defaultAction: () => {
        if (listIdChecked.length > 0) {
          onDeleteAll();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["DEPARTMENT_DELETE"] == 1 && {
      title: "Xóa nhóm quyền",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-role${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className={`title-first ${showConfig && width <= 768 ? "d-none" : ""}`}
            title="Quay lại"
          >
            Cài đặt cơ sở
          </h1>
          <Icon
            name="ChevronRight"
            className={`${showConfig && width <= 768 ? "d-none" : ""}`}
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1
            title="Quay lại"
            className={`title-last ${showConfig ? "active" : ""}`}
            onClick={() => {
              setShowConfig(false);
            }}
          >
            Danh sách nhóm quyền
          </h1>
          {showConfig && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setShowConfig(false);
                }}
              />
              <h1 className="title-last">Cấu hình</h1>
            </Fragment>
          )}
        </div>
        {permissions["DEPARTMENT_ADD"] == 1 && (
          <Button
            className="btn__add--department"
            onClick={(e) => {
              e && e.preventDefault();
              setIdRole(null);
              setShowModalAdd(true);
            }}
          >
            Thêm mới
          </Button>
        )}
      </div>

      <div className="card-box d-flex flex-column">
        {showConfig ? (
          <ViewConfigRole
            data={dataRole}
            onHide={(reload) => {
              setShowConfig(false);
            }}
          />
        ) : (
          <TableRole
            titles={titles}
            listRole={listRole}
            params={params}
            setParams={setParams}
            pagination={pagination}
            dataMappingArray={dataMappingArray}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            setListIdChecked={setListIdChecked}
            bulkActionList={bulkActionList}
            actionsTable={actionsTable}
            departmentFilterList={departmentFilterList}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setIdRole={setIdRole}
            setShowModalAdd={setShowModalAdd}
            isNoItem={isNoItem}
            listSaveSearch={listSaveSearch}
            listTabs={listTabs}
            tab={tab}
            setTab={setTab}
            isPermissions={isPermissions}
            dataSize={dataSize}
            setShowModalEditParentDepartment={setShowModalEditParentDepartment}
            loadOptionBranch={loadOptionBranch}
            handleChangeValueBranch={handleChangeValueBranch}
            valueBranch={valueBranch}
            setValueBranch={setValueBranch}
          />
        )}
      </div>
      <ViewDetailDepartmentModal
        onShow={showModalView}
        idRole={idRole}
        onHide={(reload) => {
          setShowModalView(false);
        }}
      />
      <ViewEmployeeInDepartment
        onShow={showModalViewEmployee}
        data={dataRole}
        onHide={(reload) => {
          setShowModalViewEmployee(false);
        }}
        handleNextPage={() => {
          onNextPage();
          setShowModalViewEmployee(false);
          onBackProps(false);
        }}
      />
      <AddRoleDirectoryModal
        onShow={showModalAdd}
        idRole={idRole}
        data={dataRole}
        onHide={(reload) => {
          if (reload) {
            getListDepartment(params);
          }
          setShowModalAdd(false);
          setDataRole(null);
          setIdRole(null);
        }}
      />

      <EditParentDepartment
        onShow={showModalEditParentDepartment}
        idRole={idRole}
        onHide={(reload) => {
          if (reload) {
            getListDepartment(params);
          }
          setShowModalEditParentDepartment(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
