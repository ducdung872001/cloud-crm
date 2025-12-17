import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction , { ITitleActions }from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch } from "model/OtherModel";
import { ISettingFilterRequest } from "model/setting/SettingRequestModel";
import { ISettingResponse } from "model/setting/SettingResponseModel";
import { showToast } from "utils/common";
import { urls } from "configs/urls";
import SettingService from "services/SettingService";
import AddSettingModal from "./partials/AddSettingModal";
import { getPageOffset } from 'reborn-util';
import moment from "moment";

export default function SettingList() {
  document.title = "Cài đặt cấu hình chung";

  const isMounted = useRef(false);

  const [listSetting, setListSetting] = useState<ISettingResponse[]>([]);
  const [dataSetting, setDataSetting] = useState<ISettingResponse>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState<ISettingFilterRequest>({});

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách cấu hình",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh sách cấu hình",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListSetting = async (paramsSearch: ISettingFilterRequest) => {
    setIsLoading(true);

    const response = await SettingService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListSetting(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +params.page === 1) {
        // đoạn này mình có xóa phần này đi --> && params === ""
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
      getListSetting(params);
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
              setDataSetting(null);
              setShowModalAdd(true);
          },
        }
      ],
    };

  const titles = ["STT", "Tên cấu hình", "Mã cấu hình","Ngày bắt đầu", "Ngày kết thúc", "Giá trị cấu hình", "Kiểu giá trị"];

  const dataFormat = ["text-center", "text-center", "text-center","text-center", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: ISettingResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.code,
    item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : "",
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
    item.value,
    item.type
  ];

  const actionsTable = (item: ISettingResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataSetting(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error"/>,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
      const response = await SettingService.delete(id);
      if (response.code === 0) {
        showToast("Xóa cấu hình thành công", "success");
        getListSetting(params);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    };

  const showDialogConfirmDelete = (item?: ISettingResponse) => {
      const contentDialog: IContentDialog = {
        color: "error",
        className: "dialog-delete",
        isCentered: true,
        isLoading: true,
        title: <Fragment>Xóa...</Fragment>,
        message: (
          <Fragment>
            Bạn có chắc chắn muốn xóa cấu hình này
            {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
          </Fragment>
        ),
        cancelText: "Hủy",
        cancelAction: () => {
          setShowDialog(false);
          setContentDialog(null);
        },
        defaultText: "Xóa",
        defaultAction: () => {
          if (item?.id) {
          onDelete(item.id);
          return;
        }
        },
      };
      setContentDialog(contentDialog);
      setShowDialog(true);
    };

  return (
    <div className={`page-content page-setting${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Cài đặt cấu hình chung" titleActions={titleActions} to={urls.setting} isChildrenTitle={true} titleChildren="Cấu hình" />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên cấu hình"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listSetting && listSetting.length > 0 ? (
          <BoxTable
            name="Danh sách cấu hình"
            titles={titles}
            items={listSetting}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {!isNoItem ? (
              <SystemNotification description={<span>Hiện tại chưa có cấu hình nào.</span>} type="no-item" />
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
      <AddSettingModal
        onShow={showModalAdd}
        data={dataSetting}
        onHide={(reload) => {
          if (reload) {
            getListSetting(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
