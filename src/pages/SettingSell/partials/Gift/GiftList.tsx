import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import moment from "moment";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IGiftFilterRequest } from "model/gift/GiftRequestModel";
import { IGiftRespone } from "model/gift/GiftResponseModel";
import { IGiftListProps } from "model/gift/PropsModel";
import { showToast } from "utils/common";
import GiftService from "services/GiftService";
import AddGiftModal from "./partials/AddGiftModal";
import { getPageOffset } from "reborn-util";
import './GiftList.scss';

export default function GiftList(props: IGiftListProps) {
  document.title = "Ưu đãi";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listGift, setListGift] = useState<IGiftRespone[]>([]);
  const [dataGift, setDataGift] = useState<IGiftRespone>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalService, setShowModalService] = useState<boolean>(false);
  const [showModalEvent, setShowModalEvent] = useState<boolean>(false);
  const [idGift, setIdGift] = useState<number>(null);
  const [eventId, setEventId] = useState<number>(null);
  const [params, setParams] = useState<IGiftFilterRequest>({});
  const [showModalSeo, setShowModalSeo] = useState<boolean>(false);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách quà tặng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh sách quà tặng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListGift = async (paramsSearch: IGiftFilterRequest) => {
    setIsLoading(true);

    const response = await GiftService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListGift(result.items);

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
      getListGift(params);
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
          setDataGift(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Ảnh đại diện", "Tên quà tặng", "Ngày bắt đầu", "Ngày kết thúc", "Loại quà tặng"];

  const dataFormat = ["text-center", "text-center", "", "text-center", "text-center", ""];

  const dataMappingArray = (item: IGiftRespone, index: number) => [
    getPageOffset(params) + index + 1,
    item.cover ? <Image src={item.cover} alt={item.name} width={"64rem"} /> : "",
    item.name,
    moment(item.startDate).format("DD/MM/YYYY"),
    moment(item.endDate).format("DD/MM/YYYY"),
    item.objectType === 1 ? "Voucher" : item.objectType === 2 ? "Giảm giá dịch vụ" : "Sự kiện",
  ];

  const actionsTable = (item: IGiftRespone): IAction[] => {
    return item.objectType === 1
      ? [
        {
          title: "SEO",
          icon: <Icon name="PestControl" className="icon-extra" />,
          callback: () => {
            setShowModalSeo(true);
            setIdGift(item.id);
          },
        },
        {
          title: "Sửa",
          icon: <Icon name="Pencil" />,
          callback: () => {
            setDataGift(item);
            setShowModalAdd(true);
          },
        },
        {
          title: "Xóa quà tặng",
          icon: <Icon name="Trash" className="icon-error" />,
          callback: () => {
            showDialogConfirmDelete(item);
          },
        },
      ]
      : item.objectType === 2
        ? [
          {
            title: "SEO",
            icon: <Icon name="PestControl" className="icon-extra" />,
            callback: () => {
              setShowModalSeo(true);
              setIdGift(item.id);
            },
          },
          {
            title: "Thêm dịch vụ giảm giá",
            icon: <Icon name="FingerTouch" className="icon-success" />,
            callback: async () => {
              setShowModalService(true);
            },
          },
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataGift(item);
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
        ]
        : [
          {
            title: "SEO",
            icon: <Icon name="PestControl" className="icon-extra" />,
            callback: () => {
              setShowModalSeo(true);
              setIdGift(item.id);
            },
          },
          {
            title: "Bổ sung thông tin sự kiện",
            icon: <Icon name="PlusCircleFill" className="icon-warning" />,
            callback: () => {
              setIdGift(item.id);
              setEventId(item.objectId);
              setShowModalEvent(true);
            },
          },
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataGift(item);
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

  const onDelete = async (id: number, objectType: number, objectId: number) => {
    const response = await GiftService.delete(id, objectType, objectId);

    if (response.code === 0) {
      showToast("Xoá quà tặng thành công", "success");
      getListGift(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IGiftRespone) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "quà tặng " : `${listIdChecked.length} quà tặng đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id, item.objectType, item.objectId),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa quà tặng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const UpdateObjectId = async (id, objectId) => {
    const body = {
      id: id,
      objectId: objectId,
    };

    const response = await GiftService.updateObjectId(body);
    getListGift(params);
    return response;
  };

  return (
    <Fragment>
      <div className={`page-content page-gift${!isNoItem ? " bg-white" : ""}${showModalAdd ? " d-none" : ""}${showModalEvent ? " d-none" : ""}`}>
        <div className="action-navigation">
          <div className="action-backup">
            <h1
              onClick={() => {
                onBackProps(true);
              }}
              className="title-first"
              title="Quay lại"
            >
              Cài đặt bán hàng
            </h1>
            <Icon
              name="ChevronRight"
              onClick={() => {
                onBackProps(true);
              }}
            />
            <h1 className="title-last">Danh sách quà tặng</h1>
          </div>
          <TitleAction title="" titleActions={titleActions} />
        </div>
        <div className="card-box d-flex flex-column">
          <SearchBox
            name="Tên quà tặng"
            placeholderSearch="Tìm kiếm theo tên quà tặng"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listGift && listGift.length > 0 ? (
            <BoxTable
              name="Danh sách quà tặng"
              titles={titles}
              items={listGift}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              striped={true}
              isBulkAction={true}
              bulkActionItems={bulkActionList}
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
                      Hiện tại Spa chưa có danh sách quà tặng nào. <br />
                      Hãy thêm mới danh sách quà tặng đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới danh sách quà tặng"
                  action={() => {
                    setDataGift(null);
                    setShowModalAdd(true);
                  }}
                />
              ) : (
                <SystemNotification
                  description={
                    <span>
                      Không có dữ liệu trùng khớp. <br />
                      Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                    </span>
                  }
                  type="no-result"
                />
              )}
            </Fragment>
          )}
        </div>
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>

      <div className={showModalAdd ? "" : "d-none"}>
        <AddGiftModal
          onShow={showModalAdd}
          data={dataGift}
          onHide={(reload) => {
            if (reload) {
              getListGift(params);
            }
            setShowModalAdd(false);
          }}
        />
      </div>
    </Fragment>
  );
}
