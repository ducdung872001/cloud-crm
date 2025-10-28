import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import { getPageOffset, getSearchParameters } from "reborn-util";
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
import { showToast, getPermissions } from "utils/common";
import AddZaloMarketting from "./partials/AddZaloMarketting/AddZaloMarketting";

export default function ZaloMarketting() {
  document.title = "Zalo Marketting";

  const isMounted = useRef(false);

  const takeParamsUrl = getSearchParameters();
  const customerIdlistUrl = (takeParamsUrl && takeParamsUrl?.customerIdlist?.replace(/\%2C/g, ",").split(",")) || [];
  const customerIdlist = customerIdlistUrl.map((item) => {
    return +item;
  });

  const [listZaloMarketting, setListZaloMarketting] = useState([]);
  const [dataZaloMarketting, setDataZaloMarketting] = useState(null);
  const [idZalo, setIdZalo] = useState<number>(0);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [showPageSendZalo, setShowPageSendZalo] = useState<boolean>(false);
  const [checkadd, setCheckAdd] = useState(false);
  const [permissions, setPermissions] = useState(getPermissions());

  useEffect(() => {
    if (customerIdlist && customerIdlist.length > 0) {
      setShowPageSendZalo(true);
    } else {
      if (!checkadd) {
        setShowPageSendZalo(false);
      }
    }
  }, [customerIdlist, checkadd]);

  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách yêu cầu gửi Zalo",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "zalo marketting",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListUnit = async (paramsSearch) => {
    setIsLoading(true);

    const response = await { code: 0, message: "", page: 1, total: 0, items: [] };

    if (response.code === 0) {
      const result = response;
      setListZaloMarketting(result.items);

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
      getListUnit(params);
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
          setShowPageSendZalo(true);
          setCheckAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Người yêu cầu gửi", "Thời gian yêu cầu", "Tiêu đề", "Thời gian gửi", "Trạng thái phê duyệt", "Trạng thái gửi"];

  const dataFormat = ["text-center", "", "", "", "", "text-center", "text-center"];

  const dataMappingArray = (item, index: number) => [getPageOffset(params) + index + 1];

  const actionsTable = (item): IAction[] => {
    return [
      {
        title: "Phê duyệt",
        icon: <Icon name="FingerTouch" className="icon-warning" />,
        callback: () => {
          //
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setCheckAdd(true);
          //
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          //
        },
      },
      {
        title: "Hủy yêu cầu",
        icon: <Icon name="TimesCircle" className="icon-error" />,
        callback: () => {
          //
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await { code: 0, message: "" };

    if (response.code === 0) {
      showToast("Xóa zalo marketting thành công", "success");
      getListUnit(params);
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
          Bạn có chắc chắn muốn xóa {item ? "zalo marketting " : `${listIdChecked.length} zalo marketting đã chọn`}
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
    {
      title: "Xóa zalo marketting",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <Fragment>
      <div className={`page-content page__zalo--marketting${isNoItem ? " bg-white" : ""}${showPageSendZalo ? " d-none" : ""}`}>
        <TitleAction title="Zalo Marketing" titleActions={titleActions} />
        <div className="card-box d-flex flex-column">
          <SearchBox params={params} isSaveSearch={true} listSaveSearch={listSaveSearch} updateParams={(paramsNew) => setParams(paramsNew)} />
          {!isLoading && listZaloMarketting && listZaloMarketting.length > 0 ? (
            <BoxTable
              name="Zalo Marketing"
              titles={titles}
              items={listZaloMarketting}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              listIdChecked={listIdChecked}
              bulkActionItems={bulkActionList}
              isBulkAction={true}
              striped={true}
              setListIdChecked={(listId) => setListIdChecked(listId)}
              actions={actionsTable}
              actionType="inline"
            />
          ) : isLoading ? (
            <Loading />
          ) : (
            <Fragment>
              {isNoItem ? (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có zalo marketing nào. <br />
                      Hãy thêm mới zalo marketing đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới zalo marketing"
                  action={() => {
                    setShowPageSendZalo(true);
                    setCheckAdd(true);
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
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
      <div className={`${showPageSendZalo ? "" : "d-none"}`}>
        <AddZaloMarketting
          onShow={showPageSendZalo}
          idSendZalo={idZalo}
          onHide={(reload) => {
            if (reload) {
              // call lại api
            }

            setShowPageSendZalo(false);
          }}
          onBackProps={() => setShowPageSendZalo(false)}
          customerIdList={customerIdlist}
        />
      </div>
    </Fragment>
  );
}
