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
import { ITicketCategoryFilterRequest } from "model/ticketCategory/TicketCategoryRequestModel";
import { ITicketCategoryResponse } from "model/ticketCategory/TicketCategoryResponseModel";
import TicketCategoryService from "services/TicketCategoryService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import AddTicketCategoryModal from "./partials/AddTicketCategoryModal";
import { getPageOffset } from "reborn-util";

import "./TicketCategoryList.scss";

export default function SettingTicketList(props) {
  document.title = "Cài đặt Hỗ trợ";

  const isMounted = useRef(false);

  const { onBackProps } = props;

  const [listTicketCategory, setListTicketCategory] = useState<ITicketCategoryResponse[]>([]);
  const [dataSettingTicket, setDataSettingTicket] = useState<ITicketCategoryResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState<ITicketCategoryFilterRequest>({
    name: "",
  });

  const listTabs = [
    {
      title: "Danh mục loại hỗ trợ",
      is_active: "tab_one",
      type: 1,
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "cài đặt hỗ trợ",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTicketCategory = async (paramsSearch: ITicketCategoryFilterRequest) => {
    setIsLoading(true);

    const response = await TicketCategoryService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListTicketCategory(result);

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
      getListTicketCategory(params);
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
      permissions["TICKET_CATEGORY_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataSettingTicket(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const name = "loại hỗ trợ";

  const titles = ["STT", `Tên ${name}`, "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: ITicketCategoryResponse, index: number) => [getPageOffset(params) + index + 1, item.name, item.position];

  const actionsTable = (item: ITicketCategoryResponse): IAction[] => {
    return [
      permissions["TICKET_CATEGORY_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataSettingTicket(item);
          setShowModalAdd(true);
        },
      },
      permissions["TICKET_CATEGORY_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await TicketCategoryService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa danh mục ${name} thành công`, "success");
      getListTicketCategory(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ITicketCategoryResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa danh mục {item ? name : `${listIdChecked.length} ${name} đã chọn`}
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
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
    permissions["TICKET_CATEGORY_DELETE"] == 1 && {
      title: `Xóa danh mục ${name}`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục hỗ trợ",
      is_active: true,
    },
  ]);

  return (
    <div className={`page-content page__support--category${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className={`title-first`}
            title="Quay lại"
          >
            Cài đặt hỗ trợ
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className={`title-last`}>Danh mục hỗ trợ</h1>
        </div>
        {<TitleAction title="" titleActions={titleActions} />}
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name={`Tên loại hỗ trợ`}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          params={params}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />

        {!isLoading && listTicketCategory && listTicketCategory.length > 0 ? (
          <BoxTable
            name="Cài đặt hỗ trợ"
            titles={titles}
            items={listTicketCategory}
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
            {isPermissions ? (
              <SystemNotification type="no-permission" />
            ) : isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có danh mục {name} nào. <br />
                    Hãy thêm mới danh mục {name} nhé!
                  </span>
                }
                type="no-item"
                titleButton={`Thêm mới danh mục ${name}`}
                action={() => {
                  setDataSettingTicket(null);
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
        <AddTicketCategoryModal
          onShow={showModalAdd}
          data={dataSettingTicket}
          onHide={(reload) => {
            if (reload) {
              getListTicketCategory(params);
            }
            setShowModalAdd(false);
          }}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}
