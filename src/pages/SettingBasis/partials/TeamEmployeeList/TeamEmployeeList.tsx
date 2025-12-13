import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from 'reborn-util';
import "./TeamEmployeeList.scss";
import TeamEmployeeService from "services/TeamEmployeeService";
import AddTeamModal from "./partials/AddTeamModal/AddTeamModal";
import EmployeeListModal from "./partials/EmployeeListModal/EmployeeListModal";

export default function TeamEmployeeList(props: any) {
  document.title = "Danh sách nhóm nhân viên";

  const { onBackProps } = props;
  const isMounted = useRef(false);

  const [listTeam, setListTeam] = useState<any[]>([]);
  const [dataTeam, setDataTeam] = useState<any>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalListEmployee, setShowModalListEmployee] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách nhóm nhân viên",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
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

  const getListTeam= async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await TeamEmployeeService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListTeam(result);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +result.page === 1) {
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
      getListTeam(params);
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

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          setDataTeam(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên nhóm",  "Danh sách nhân viên"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    <div
      key={item.id}
      className={`action__view--employee`}
      onClick={() => {
        setShowModalListEmployee(true);
        setDataTeam(item);
      }}
    >
      <a>Xem thêm</a>
    </div>,    
  ];

  const actionsTable = (item: any): IAction[] => {
        const isCheckedItem = listIdChecked?.length > 0;
    return [  
     
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
                    disabled: isCheckedItem,
        callback: () => {
                    if (!isCheckedItem) {
          setDataTeam(item);
          setShowModalAdd(true);
                    }
        },
      },
      {
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
    const response = await TeamEmployeeService.delete(id);

    if (response.code === 0) {
      showToast("Xóa nhóm nhân viên thành công", "success");
      getListTeam(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
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
          Bạn có chắc chắn muốn xóa {item ? "nhóm " : `${listIdChecked.length} nhóm đã chọn`} {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa nhóm nhân viên",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="page-content page-team-list">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt cơ sở
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách nhóm nhân viên</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên nhóm"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listTeam && listTeam.length > 0 ? (
          <BoxTable
            name="Nhóm"
            titles={titles}
            items={listTeam}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            isBulkAction={true}
            listIdChecked={listIdChecked}
            bulkActionItems={bulkActionList}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isPermissions ? (
              <SystemNotification type="no-permission" />
            ) : isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có nhóm nhân viên nào. <br />
                    Hãy thêm mới nhóm nhân viên đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới nhóm nhân viên"
                action={() => {
                  setDataTeam(null);
                  setShowModalAdd(true);
                }}
              />
            ) : (
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
            )}
          </Fragment>
        )}
      </div>
      <AddTeamModal
        onShow={showModalAdd}
        data={dataTeam}
        onHide={(reload) => {
          if (reload) {
            getListTeam(params);
          }
          setShowModalAdd(false);
          setDataTeam(null);
        }}
      />    

      <EmployeeListModal
        onShow={showModalListEmployee}
        dataTeam={dataTeam}
        onHide={(reload) => {
          if (reload) {
            getListTeam(params);
          }
          setShowModalListEmployee(false);
          setDataTeam(null);
        }}
      />      
   
      <Dialog content={contentDialog} isOpen={showDialog} />

    </div>
  );
}
