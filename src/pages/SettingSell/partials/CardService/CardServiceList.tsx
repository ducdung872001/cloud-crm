import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
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
import { IServiceCardListProps } from "model/cardService/PropsModel";
import { ICardServiceFilterRequest } from "model/cardService/CardServiceRequestModel";
import { ICardServiceResponse } from "model/cardService/CardServiceResponseModel";
import { showToast } from "utils/common";
import { formatCurrency, getPageOffset } from "reborn-util";
import CardServiceService from "services/CardServiceService";
import AddCardServiceModal from "./partials/AddCardServiceModal";
import { getPermissions } from "utils/common";
import "./CardServiceList.scss";

export default function CardServiceList(props: IServiceCardListProps) {
  document.title = "Danh sách thẻ dịch vụ";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listCardService, setListCardService] = useState<ICardServiceResponse[]>([]);
  const [dataCardService, setDataCardService] = useState<ICardServiceResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<ICardServiceFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách thẻ dịch vụ",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "thẻ dịch vụ",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCardService = async (paramsSearch: ICardServiceFilterRequest) => {
    setIsLoading(true);

    const response = await CardServiceService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCardService(result.items);

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
      getListCardService(params);
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
      permissions["CARD_SERVICE_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataCardService(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên thẻ", "Mã loại thẻ", "Ảnh đại diện", "Giá bán", "Giá trị thẻ", "Ghi chú"];

  const dataFormat = ["text-center", "", "", "text-center", "text-right", "text-right", ""];

  const dataSize = ["auto", "auto", "auto", "auto", "auto", "auto", 12];

  const dataMappingArray = (item: ICardServiceResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.code,
    <a key={item.id} data-fancybox="gallery" href={item.avatar}>
      <Image src={item.avatar} alt={item.name} width={"64rem"} />
    </a>,
    formatCurrency(item.cash, ","),
    formatCurrency(item.account, ","),
    item.note,
  ];

  const actionsTable = (item: ICardServiceResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["CARD_SERVICE_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataCardService(item);
          setShowModalAdd(true);
          }
        },
      },
      permissions["CARD_SERVICE_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          showDialogConfirmDelete(item);
          }
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await CardServiceService.delete(id);

    if (response.code === 0) {
      showToast("Xóa thẻ dịch vụ thành công", "success");
      getListCardService(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    const arrPromises = selectedIds.map((selectedId) => {
      const found = listCardService.find((item) => item.id === selectedId);
      if (found?.id) {
        return CardServiceService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} thẻ dịch vụ`, "success");
        getListCardService(params);
        setListIdChecked([]);
      } else {
        showToast("Không có thẻ dịch vụ nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: ICardServiceResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "thẻ dịch vụ " : `${listIdChecked.length} thẻ dịch vụ đã chọn`}
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
        if (listIdChecked.length>0) {
          onDeleteAll();
          return;
        }
      }
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["CARD_SERVICE_DELETE"] == 1 && {
      title: "Xóa thẻ dịch vụ",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-card-service${isNoItem ? " bg-white" : ""}`}>
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
          <h1 className="title-last">Danh sách thẻ dịch vụ</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên thẻ dịch vụ"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listCardService && listCardService.length > 0 ? (
          <BoxTable
            name="Thẻ dịch vụ"
            titles={titles}
            items={listCardService}
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
            dataSize={dataSize}
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
                    Hiện tại chưa có thẻ dịch vụ nào. <br />
                    Hãy thêm mới thẻ dịch vụ đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới thẻ dịch vụ"
                action={() => {
                  setDataCardService(null);
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
      <AddCardServiceModal
        onShow={showModalAdd}
        data={dataCardService}
        onHide={(reload) => {
          if (reload) {
            getListCardService(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
