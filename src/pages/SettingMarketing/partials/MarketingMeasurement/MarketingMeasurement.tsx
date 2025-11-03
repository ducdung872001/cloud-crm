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
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import { getPermissions } from "utils/common";
import "./MarketingMeasurement.scss";
import CampaignMarketingService from "services/CampaignMarketingService";
import ModalAddMarketingMeasurement from "./partials/ModalAddMAMeasurement";

export default function MarketingMeasurement(props: any) {
  document.title = "Danh mục đo lường";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listMarketingMeasurement, setListMarketingMeasurement] = useState([]);
  const [dataMarketingMeasurement, setDataMarketingMeasurement] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAddMeasurement, setShowModalAddMeasurement] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  //đã fix true
  const [isNoItem, setIsNoItem] = useState<boolean>(true);

  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState({
    name: "",
    limit: 10,
    page: 1
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục đo lường",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "danh mục",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListMarketingMeasurement = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await CampaignMarketingService.listMAMeasurement(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListMarketingMeasurement(result);

    //   setPagination({
    //     ...pagination,
    //     page: +result.page,
    //     sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
    //     totalItem: +result.total,
    //     totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
    //   });

    //   if (+result.total === 0 && +result.page === 1) {
    //     setIsNoItem(true);
    //   }
    } 
    // else if (response.code == 400) {
    //   setIsPermissions(true);
    // } 
    else {
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
        getListMarketingMeasurement(params);
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
          setDataMarketingMeasurement(null);
          setShowModalAddMeasurement(true);
        }
      },
    ],
  };

  const titles = ["STT", "Tên danh mục", "Mã danh mục", "Đơn vị tính", "Thứ tự"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name, 
    item.code,
    item.unit === 'percent' ? 'Theo %' : 'Số tuyệt đối',
    item.position,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataMarketingMeasurement(item);
          setShowModalAddMeasurement(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await CampaignMarketingService.deleteMAMeasurement(id);

    if (response.code === 0) {
      showToast("Xóa loại danh mục đo lường thành công", "success");
      getListMarketingMeasurement(params);
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
          Bạn có chắc chắn muốn xóa {item ? "danh mục " : `${listIdChecked.length} danh mục đã chọn`}
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
    permissions["CONTRACT_DELETE"] == 1 && {
      title: "Xóa loại hợp đồng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-marketing-measurement${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt Marketing
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh mục đo lường</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên danh mục"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listMarketingMeasurement && listMarketingMeasurement.length > 0 ? (
          <BoxTable
            name="Danh mục đo lường"
            titles={titles}
            items={listMarketingMeasurement}
            isPagination={false}
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
            {isPermissions ? (
              <SystemNotification type="no-permission" />
            ) : isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có danh mục đo lường nào. <br />
                    Hãy thêm mới anh mục đo lường đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới anh mục đo lường"
                action={() => {
                  setDataMarketingMeasurement(null);
                  setShowModalAddMeasurement(true);
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
      <ModalAddMarketingMeasurement
        onShow={showModalAddMeasurement}
        data={dataMarketingMeasurement}
        listMarketingMeasurement={listMarketingMeasurement}
        onHide={(reload) => {
          if (reload) {
            getListMarketingMeasurement(params);
          }
          setShowModalAddMeasurement(false);
        }}
      />
     
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
