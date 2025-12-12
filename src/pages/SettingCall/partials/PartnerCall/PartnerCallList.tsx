import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IPartnerCallListProps } from "model/partnerCall/PropsModel";
import { IPartnerCallFilterRequest } from "model/partnerCall/PartnerCallRequestModel";
import { IPartnerCallResponseModel } from "model/partnerCall/PartnerCallResponseModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import PartnerCallService from "services/PartnerCallService";
import AddPartnerCallModel from "./partials/AddPartnerCallModel";
import { getPageOffset } from "reborn-util";

import "./PartnerCallList.scss";

export default function PartnerCallList(props: IPartnerCallListProps) {
  document.title = "Đối tác Tổng đài";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listPartnerCall, setListPartnerCall] = useState<IPartnerCallResponseModel[]>([]);
  const [dataPartnerCall, setDataPartnerCall] = useState<IPartnerCallResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState<IPartnerCallFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Đối tác Tổng đài",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Đối tác Tổng đài",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListPartnerCall = async (paramsSearch: IPartnerCallFilterRequest) => {
    setIsLoading(true);

    const response = await PartnerCallService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListPartnerCall(result);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 || result?.length === 0) {
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
      getListPartnerCall(params);
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
      permissions["PARTNER_CALL_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataPartnerCall(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên đối tác", "Tên liên hệ", "SĐT liên hệ", "Địa chỉ"];

  const dataFormat = ["text-center", "", "", "", ""];

  const dataMappingArray = (item: IPartnerCallResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.partnerName,
    item.contactName,
    item.contactPhone,
    item.address,
  ];

  const actionsTable = (item: IPartnerCallResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["PARTNER_CALL_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataPartnerCall(item);
          setShowModalAdd(true);
          }
        },
      },
      permissions["PARTNER_CALL_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          showDialogConfirmDelete(item);
          }
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await PartnerCallService.delete(id);

    if (response.code === 0) {
      showToast("Xóa đối tác Tổng đài thành công", "success");
      getListPartnerCall(params);
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
      const found = listPartnerCall.find((item) => item.id === selectedId);
      if (found?.id) {
        return PartnerCallService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} đối tác tổng đài`, "success");
        getListPartnerCall(params);
        setListIdChecked([]);
      } else {
        showToast("Không có đối tác tổng đài nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IPartnerCallResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "đối tác Tổng đài" : `${listIdChecked.length} đối tác Tổng đài đã chọn`}
          {item ? <strong>{item.contactName}</strong> : ""}? Thao tác này không thể khôi phục.
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
    permissions["PARTNER_CALL_DELETE"] == 1 && {
      title: "Xóa đối tác",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="page-content page-partner-call">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt Tổng đài
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Đối tác Tổng đài</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên đối tác"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listPartnerCall && listPartnerCall.length > 0 ? (
          <BoxTable
            name="Đối tác"
            titles={titles}
            items={listPartnerCall}
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
                    Hiện tại chưa có đối tác Tổng đài nào. <br />
                    Hãy thêm mới đối tác Tổng đài đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới đối tác Tổng đài"
                action={() => {
                  setDataPartnerCall(null);
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
      <AddPartnerCallModel
        onShow={showModalAdd}
        data={dataPartnerCall}
        onHide={(reload) => {
          if (reload) {
            getListPartnerCall(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
