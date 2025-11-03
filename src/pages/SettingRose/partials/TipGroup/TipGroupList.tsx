import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { ITipGroupFilterRequest } from "model/tipGroup/TipGroupRequestModel";
import { ITipGroupListProps } from "model/tipGroup/PropsModel";
import { ITipGroupResponse } from "model/tipGroup/TipGroupResponseModel";
import { showToast, getPermissions } from "utils/common";
import { getPageOffset } from 'reborn-util';
import TipGroupService from "services/TipGroupService";
import AddTipGroupModal from "./partials/AddTipGroupModal";
import AddTipGroupToEmployeeModal from "./partials/AddTipGroupToEmployeeModal";
import ShowTipGroupToEmployeeModal from "./partials/ShowTipGroupToEmployeeModal";

import "./TipGroupList.scss";

export default function TipGroupList(props: ITipGroupListProps) {
  document.title = "Hoa hồng theo nhóm";

  const [tab, setTab] = useState<string>(() => {
    const historyStorage = JSON.parse(localStorage.getItem("tab_tip_group"));
    return historyStorage ? historyStorage : "tab_one";
  });

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listTipGroup, setListTipGroup] = useState<ITipGroupResponse[]>([]);
  const [dataTipGroup, setDataTipGroup] = useState<ITipGroupResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [groupId, setGroupId] = useState<number>(null);
  const [showGroupId, setShowGroupId] = useState<number>(null);
  const [showModalAddEmployee, setShowModalAddEmployee] = useState<boolean>(false);
  const [showModalTipGroupToEmployee, setShowModalTipGroupToEmployee] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState<ITipGroupFilterRequest>({
    name: "",
    limit: 10
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách nhóm",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Hoa hồng bán hàng",
      is_tab: "tab_one",
    },
    {
      title: "Hoa hồng thực hiện dịch vụ",
      is_tab: "tab_two",
    },
  ];

  //! đoạn dưới này xử lý vấn đề ưu tab hiện tại khi chuyển hướng trang
  useEffect(() => {
    localStorage.setItem("tab_tip_group", JSON.stringify(tab));
    getListTipGroup(params);
  }, [tab]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "hoa hồng theo nhóm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTipGroup = async (paramsSearch: ITipGroupFilterRequest) => {
    paramsSearch.tipType = tab == 'tab_one' ? 1 : 2;
    setIsLoading(true);

    const response = await TipGroupService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListTipGroup(result?.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +params.page === 1) {
        setIsNoItem(true);
      }
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
      getListTipGroup(params);
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
      permissions["TIP_GROUP_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataTipGroup(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên nhóm", "Nhân viên trong nhóm", "Cấu hình hoa hồng", "Thứ tự"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: ITipGroupResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    <a
      key={index}
      onClick={() => {
        setShowModalTipGroupToEmployee(true);
        setShowGroupId(item.id);
      }}
    >
      {item.employeeNum} nhân viên
    </a>,
    <a>
      Xem cấu hình
    </a>,
    item.position,
  ];

  const actionsTable = (item: ITipGroupResponse): IAction[] => {
    return [
      permissions["TIP_GROUP_ADD"] == 1 && {
        title: "Thêm thành viên",
        icon: <Icon name="UserAdd" />,
        callback: () => {
          setDataTipGroup(item);
          setShowModalAddEmployee(true);
          setGroupId(item.id);
        },
      },
      permissions["TIP_GROUP_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataTipGroup(item);
          setShowModalAdd(true);
        },
      },
      permissions["TIP_GROUP_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await TipGroupService.delete(id);

    if (response.code === 0) {
      showToast("Xóa nhóm thành công", "success");
      getListTipGroup(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ITipGroupResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "nhóm " : `${listIdChecked.length} nhóm đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
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
    permissions["TIP_GROUP_DELETE"] == 1 && {
      title: "Xóa nhóm",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-tip-group${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt hoa hồng
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Hoa hồng theo nhóm</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <ul className="menu__tipgroup">
          {listTabs.map((item, idx) => {
            return (
              <li
                key={idx}
                className={item.is_tab == tab ? "active" : ""}
                onClick={(e) => {
                  e && e.preventDefault();
                  setTab(item.is_tab);
                }}
              >
                {item.title}
              </li>
            );
          })}
        </ul>

        <SearchBox
          name="Tên nhóm"
          params={params}
          isSaveSearch={false}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />

        {!isLoading && listTipGroup && listTipGroup.length > 0 ? (
          <BoxTable
            name="Hoa hồng theo nhóm"
            titles={titles}
            items={listTipGroup}
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
          <Fragment>
            {!isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có nhóm nào. <br />
                    Hãy thêm mới nhóm đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới nhóm"
                action={() => {
                  setDataTipGroup(null);
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
      <AddTipGroupModal
        onShow={showModalAdd}
        data={dataTipGroup}
        tipType={tab == "tab_one" ? 1 : 2}
        onHide={(reload) => {
          if (reload) {
            getListTipGroup(params);
          }
          setShowModalAdd(false);
        }}
      />

      <ShowTipGroupToEmployeeModal
        onShow={showModalTipGroupToEmployee}
        onHide={(reload) => {
          if (reload) {
            getListTipGroup(params);
          }
          setShowModalTipGroupToEmployee(false);
        }}
        showGroupId={showGroupId}
      />

      <AddTipGroupToEmployeeModal
        onShow={showModalAddEmployee}
        onHide={(reload) => {
          if (reload) {
            getListTipGroup(params);
          }
          setShowModalAddEmployee(false);
        }}
        groupId={groupId}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
