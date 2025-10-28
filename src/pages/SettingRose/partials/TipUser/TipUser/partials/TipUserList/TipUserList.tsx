import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { ITipListUserProps } from "model/tipUser/PropsModel";
import { ITipUserResponse } from "model/tipUser/TipUserResponseModel";
import { ITipUserFilterRequest } from "model/tipUser/TipUserRequestModel";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import TipUserService from "services/TipUserService";
import AddTipUserModal from "./partials/AddTipUserModal";
import { getPageOffset } from 'reborn-util';

import "./TipUserList.scss";

export default function TipUsersList(props: ITipListUserProps) {
  const { dataTipUser, setDataTipUser, showModalAdd, setShowModalAdd, setIsDetailUser } = props;

  const [tab, setTab] = useState<string>(() => {
    const historyStorage = JSON.parse(localStorage.getItem("tab_tip_user"));
    return historyStorage ? historyStorage : "tab_one";
  });

  const isMounted = useRef(false);

  const [listTipUser, setListTipUser] = useState<ITipUserResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState<ITipUserFilterRequest>({
    name: "",
  });

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
    localStorage.setItem("tab_tip_user", JSON.stringify(tab));
    getListTipUsers(params);
  }, [tab]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Hoa hồng theo cá nhân",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTipUsers = async (paramsSearch: ITipUserFilterRequest) => {
    paramsSearch.tipType = tab == "tab_one" ? 1 : 2;
    setIsLoading(true);

    const response = await TipUserService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListTipUser(result?.items);

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
      getListTipUsers(params);
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

  const titles = ["STT", "Tên nhân viên", "Cách tính hoa hồng"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: ITipUserResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.employeeName,
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setDataTipUser(item);
        setIsDetailUser(true);
      }}
    >
      Xem chi tiết
    </a>,
  ];

  const actionsTable = (item: ITipUserResponse): IAction[] => {
    return [
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await TipUserService.delete(id);

    if (response.code === 0) {
      showToast("Xóa hoa hồng thành công", "success");
      getListTipUsers(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ITipUserResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "hoa hồng theo cá nhân " : `${listIdChecked.length} hoa hồng theo cá nhân đã chọn`}
          {item ? <strong>{item.employeeName}</strong> : ""}? Thao tác này không thể khôi phục.
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
      title: "Xóa hoa hồng theo cá nhân",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page__tip--user--list ${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <ul className="menu__tipuserconfig">
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

        <SearchBox name="Tên nhân viên" params={params} updateParams={(paramsNew) => setParams(paramsNew)} />
        {!isLoading && listTipUser && listTipUser.length > 0 ? (
          <BoxTable
            name="Hoa hồng theo cá nhân"
            titles={titles}
            items={listTipUser}
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
                    Hiện tại chưa có cấu hình hoa hồng nào. <br />
                    Hãy thêm mới cấu hình đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới cấu hình"
                action={() => {
                  setDataTipUser(null);
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
      <AddTipUserModal
        onShow={showModalAdd}
        data={dataTipUser}
        tipType={tab == "tab_one" ? 1 : 2}
        onHide={(reload) => {
          if (reload) {
            getListTipUsers(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
