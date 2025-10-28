import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IRelationShipFilterRequest } from "model/relationShip/RelationShipRequest";
import { IRelationShipResposne } from "model/relationShip/RelationShipResposne";
import { ICustomerRelationshipListProps } from "model/relationShip/PropsModal";
import RelationShipService from "services/RelationShipService";
import { showToast } from "utils/common";
import AddRelationShipModal from "./partials/AddRelationShipModal";
import { getPermissions } from "utils/common";
import { getPageOffset } from 'reborn-util';

import "./CustomerRelationshipList.scss";

export default function CustomerRelationshipList(props: ICustomerRelationshipListProps) {
  document.title = "Danh sách mối quan hệ khách hàng";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listRelationShip, setListRelationShip] = useState<IRelationShipResposne[]>([]);
  const [dataRelationShip, setDataRelationShip] = useState<IRelationShipResposne>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<IRelationShipFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách mối quan hệ khách hàng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Mối quan hệ khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListRelationShip = async (paramsSearch: IRelationShipFilterRequest) => {
    setIsLoading(true);

    const response = await RelationShipService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListRelationShip(result);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (result.length === 0 && params.name == "") {
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
      getListRelationShip(params);
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
      permissions["RELATIONSHIP_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataRelationShip(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên mối quan hệ", "Màu sắc mối quan hệ", "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "", "", "text-center"];

  const dataMappingArray = (item: IRelationShipResposne, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    <div key={index} style={{ backgroundColor: `${item.color}`, width: "7rem", height: "3rem", borderRadius: "0.5rem", marginLeft: "12%" }}></div>,
    item.position,
  ];

  const actionsTable = (item: IRelationShipResposne): IAction[] => {
    return [
      permissions["RELATIONSHIP_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataRelationShip(item);
          setShowModalAdd(true);
        },
      },
      permissions["RELATIONSHIP_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await RelationShipService.delete(id);

    if (response.code === 0) {
      showToast("Xóa mối quan hệ khách hàng thành công", "success");
      getListRelationShip(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IRelationShipResposne) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "mối quan hệ " : `${listIdChecked.length} mối quan hệ đã chọn`}
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
    permissions["RELATIONSHIP_DELETE"] == 1 && {
      title: "Xóa mối quan hệ khách hàng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-customer-relationship${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt khách hàng
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách mối quan hệ khách hàng</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên mối quan hệ khách hàng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listRelationShip && listRelationShip.length > 0 ? (
          <BoxTable
            name="Mối quan hệ khách hàng"
            titles={titles}
            items={listRelationShip}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            isBulkAction={true}
            listIdChecked={listIdChecked}
            bulkActionItems={bulkActionList}
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
                    Hiện tại chưa định nghĩa mối quan hệ khách hàng nào. <br />
                    Hãy thêm mới mối quan hệ khách hàng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới mối quan hệ khách hàng"
                action={() => {
                  setDataRelationShip(null);
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
      <AddRelationShipModal
        onShow={showModalAdd}
        data={dataRelationShip}
        onHide={(reload) => {
          if (reload) {
            getListRelationShip(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
