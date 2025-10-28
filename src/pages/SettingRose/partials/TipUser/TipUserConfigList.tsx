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
import { ITipUserConfigListProps } from "model/tipUserConfig/PropsModel";
import { ITipUserConfigResponse } from "model/tipUserConfig/TipUserConfigResponseModel";
import { ITipUserConfigFilterRequest } from "model/tipUserConfig/TipUserConfigRequestModel";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import TipUserConfigService from "services/TipUserConfigService";
import AddTipUserConfigModal from "./partials/AddTipUserConfigModal";
import moment from "moment";
import "./TipUserConfigList.scss";

export default function TipUserConfigsList(props: ITipUserConfigListProps) {
  document.title = "Hoa hồng theo cá nhân";

  const [tab, setTab] = useState<string>(() => {
    const historyStorage = JSON.parse(localStorage.getItem("tab_tip_user_config"));
    return historyStorage ? historyStorage : "tab_one";
  });

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listTipUserConfigs, setListTipUserConfigs] = useState<ITipUserConfigResponse[]>([]);
  const [dataTipUserConfigs, setDataTipUserConfigs] = useState<ITipUserConfigResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState<ITipUserConfigFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách hoa hồng theo cá nhân",
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
    localStorage.setItem("tab_tip_user_config", JSON.stringify(tab));
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

  const getListTipUserConfigs = async (paramsSearch: ITipUserConfigFilterRequest) => {
    setIsLoading(true);

    const response = await TipUserConfigService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListTipUserConfigs(result);

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
      getListTipUserConfigs(params);
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
          setDataTipUserConfigs(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên nhân viên", "Dịch vụ áp dụng", "Từ ngày", "Đến ngày", "Cách tính hoa hồng"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: ITipUserConfigResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.employeeName,
    <a key={index}>5 dịch vụ</a>,
    item.effectFrom ? moment(item.effectFrom).format("DD/MM/YYYY") : "",
    item.effectTo ? moment(item.effectTo).format("DD/MM/YYYY") : "",
    "Xem chi tiết",
  ];

  const actionsTable = (item: ITipUserConfigResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataTipUserConfigs(item);
          setShowModalAdd(true);
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

  const onDelete = async (id: number) => {
    const response = await TipUserConfigService.delete(id);

    if (response.code === 0) {
      showToast("Xóa hoa hồng thành công", "success");
      getListTipUserConfigs(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ITipUserConfigResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "hoa hồng theo cá nhân " : `${listIdChecked.length} hoa hồng theo cá nhân đã chọn`}
          {item ? <strong>{item.serviceName}</strong> : ""}? Thao tác này không thể khôi phục.
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
    <div className={`page-content page-tip-user-config${isNoItem ? " bg-white" : ""}`}>
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
          <h1 className="title-last">Hoa hồng theo cá nhân</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

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

        <SearchBox
          name="Tên nhân viên"
          params={params}
          isSaveSearch={false}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listTipUserConfigs && listTipUserConfigs.length > 0 ? (
          <BoxTable
            name="Hoa hồng theo cá nhân"
            titles={titles}
            items={listTipUserConfigs}
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
                  setDataTipUserConfigs(null);
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
      <AddTipUserConfigModal
        onShow={showModalAdd}
        data={dataTipUserConfigs}
        onHide={(reload) => {
          if (reload) {
            getListTipUserConfigs(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
