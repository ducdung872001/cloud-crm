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
import { IKeyWordDataFilterResquest } from "model/keywordData/KeywordDataRequest";
import { IKeyWordDataResponse } from "model/keywordData/KeywordDataResponse";
import { IKeywordDataListProps } from "model/keywordData/PropsModel";
import KeywordDataService from "services/KeywordDataService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import AddKeywordDataModal from "./partials/AddKeywordDataModal";
import { getPageOffset } from 'reborn-util';

import "./KeywordDataList.scss";

export default function KeywordDataList(props: IKeywordDataListProps) {
  document.title = "Danh sách từ khóa nghiên cứu";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listDataKeyword, setListDataKeyword] = useState<IKeyWordDataResponse[]>([]);
  const [dataKeyword, setDataKeyword] = useState<IKeyWordDataResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<IKeyWordDataFilterResquest>({
    keyword: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách từ khóa nghiên cứu",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Dữ liệu từ khóa",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListDataKeyword = async (paramsSearch: IKeyWordDataFilterResquest) => {
    setIsLoading(true);

    const response = await KeywordDataService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListDataKeyword(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params.keyword && +result.page === 1) {
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
      getListDataKeyword(params);
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
      permissions["KEYWORD_DATA_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataKeyword(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Từ khóa chính", "Từ khóa phụ", "Từ khóa loại trừ", "Ngôn ngữ", "Đối tượng"];
  const dataFormat = ["text-center", "", "", "", "", ""];

  const dataMappingArray = (item: IKeyWordDataResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.nameSub,
    item.nameXor,
    `${item.language === 1 ? "VN" : item.language === 2 ? "EN" : "Khác"}`,
    `${item.type === 1 ? "Bên bán" : item.type === 2 ? "Bên mua" : "Khác"}`,
  ];

  const actionsTable = (item: IKeyWordDataResponse): IAction[] => {
    return [
      permissions["KEYWORD_DATA_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataKeyword(item);
          setShowModalAdd(true);
        },
      },
      permissions["KEYWORD_DATA_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await KeywordDataService.delete(id);

    if (response.code === 0) {
      showToast("Xóa từ khóa thành công", "success");
      getListDataKeyword(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IKeyWordDataResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "từ khóa " : `${listIdChecked.length} từ khóa đã chọn`}
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
    permissions["KEYWORD_DATA_DELETE"] == 1 && {
      title: "Xóa từ khóa",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page--data-keyword${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt nghiên cứu thị trường
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách từ khóa nghiên cứu</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên từ khóa"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listDataKeyword && listDataKeyword.length > 0 ? (
          <BoxTable
            name="Từ khóa"
            titles={titles}
            items={listDataKeyword}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            isBulkAction={true}
            listIdChecked={listIdChecked}
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
                    Hiện tại chưa có từ khóa nào. <br />
                    Hãy thêm mới từ khóa đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới từ khóa"
                action={() => {
                  setDataKeyword(null);
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
      <AddKeywordDataModal
        onShow={showModalAdd}
        data={dataKeyword}
        onHide={(reload) => {
          if (reload) {
            getListDataKeyword(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
