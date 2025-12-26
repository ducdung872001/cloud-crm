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
import { IPartnerEmailListProps } from "model/partnerEmail/PropsModel";
import { IPartnerEmailFilterRequest } from "model/partnerEmail/PartnerEmailRequestModel";
import { IPartnerEmailResponseModel } from "model/partnerEmail/PartnerEmailResponseModel";
import { showToast } from "utils/common";
import PartnerEmailService from "services/PartnerEmailService";
import AddPartnerEmailModel from "./partials/AddPartnerEmailModel";
import { getPageOffset } from 'reborn-util';

import "./PartnerEmailList.scss";

export default function PartnerEmailList(props: IPartnerEmailListProps) {
  document.title = "Danh mục đối tác Email";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listPartnerEmail, setListPartnerEmail] = useState<IPartnerEmailResponseModel[]>([]);
  const [dataPartnerEmail, setDataPartnerEmail] = useState<IPartnerEmailResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState<IPartnerEmailFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách đối tác Email",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Đối tác Email",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListPartnerEmail = async (paramsSearch: IPartnerEmailFilterRequest) => {
    setIsLoading(true);

    const response = await PartnerEmailService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListPartnerEmail(result);

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
      getListPartnerEmail(params);
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
          setDataPartnerEmail(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên đối tác", "Tên liên hệ", "SĐT liên hệ", "Địa chỉ"];

  const dataFormat = ["text-center", "", "", "", ""];

  const dataMappingArray = (item: IPartnerEmailResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.partnerName,
    item.contactName,
    item.contactPhone,
    item.address,
  ];

  const actionsTable = (item: IPartnerEmailResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataPartnerEmail(item);
          setShowModalAdd(true);
          }
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"}/>,
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
    const response = await PartnerEmailService.delete(id);

    if (response.code === 0) {
      showToast("Xóa đối tác thành công", "success");
      getListPartnerEmail(params);
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
      const found = listPartnerEmail.find((item) => item.id === selectedId);
      if (found?.id) {
        return PartnerEmailService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} danh sách đối tác email`, "success");
        getListPartnerEmail(params);
        setListIdChecked([]);
      } else {
        showToast("Không có danh sách đối tác email nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IPartnerEmailResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "đối tác " : `${listIdChecked.length} đối tác đã chọn`}
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
    {
      title: "Xóa đối tác",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="page-content page-partner-email">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt Email
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh mục đối tác Email</h1>
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
        {!isLoading && listPartnerEmail && listPartnerEmail.length > 0 ? (
          <BoxTable
            name="Đối tác"
            titles={titles}
            items={listPartnerEmail}
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
                    Hiện tại chưa có đối tác Email nào. <br />
                    Hãy thêm mới đối tác Email đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới đối tác Email"
                action={() => {
                  setDataPartnerEmail(null);
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
      <AddPartnerEmailModel
        onShow={showModalAdd}
        data={dataPartnerEmail}
        onHide={(reload) => {
          if (reload) {
            getListPartnerEmail(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
