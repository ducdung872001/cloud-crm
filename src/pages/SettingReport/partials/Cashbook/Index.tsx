import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Button from "components/button/button";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IBranchListProps } from "model/beautyBranch/PropsModel";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { showToast } from "utils/common";
import BeautyBranchService from "services/BeautyBranchService";
import { getPermissions } from "utils/common";
import { getPageOffset } from 'reborn-util';

import "./Index.scss";

export default function CashbookReport(props: IBranchListProps) {
  document.title = "Tải mẫu báo cáo tài chính";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listBranch, setListBranch] = useState<IBeautyBranchResponse[]>([]);
  const [dataBranch, setDataBranch] = useState<IBeautyBranchResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<IBeautyBranchFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Mẫu báo cáo",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "báo cáo",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListBranch = async (paramsSearch: IBeautyBranchFilterRequest) => {
    setIsLoading(true);

    const response = await BeautyBranchService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      // setListBranch(result.items);

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
      getListBranch(params);
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

  const titles = ["STT", "Tên chi nhánh", "Địa chỉ", "Số điện thoại", "Là trụ sở", "Trạng thái chi nhánh"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: IBeautyBranchResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.address,
    item.phone,
    item.headquarter ? <Icon name="Checked" width="1.6rem" height="1.6rem" /> : "",
    <span key={index} style={{ padding: "0.2rem 0.6rem", borderRadius: "0.5rem", color: "#ffffff", fontSize: "1.3rem", backgroundColor: "#1bc10d" }}>
      Đang hoạt động
    </span>,
  ];

  const actionsTable = (item: IBeautyBranchResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return item.headquarter === 1
      ? [
          permissions["BEAUTY_BRANCH_UPDATE"] == 1 && {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataBranch(item);
              setShowModalAdd(true);
            },
          },
        ]
      : [
          permissions["BEAUTY_BRANCH_UPDATE"] == 1 && {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataBranch(item);
              setShowModalAdd(true);
            },
          },
          permissions["BEAUTY_BRANCH_DELETE"] == 1 && {
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
    const response = await BeautyBranchService.delete(id);

    if (response.code === 0) {
      showToast("Xóa chi nhánh thành công", "success");
      getListBranch(params);
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
      const found = listBranch.find((item) => item.id === selectedId);
      if (found?.id) {
        return BeautyBranchService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} mẫu tài chính`, "success");
        getListBranch(params);
        setListIdChecked([]);
      } else {
        showToast("Không có mẫu tài chính nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IBeautyBranchResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "chi nhánh " : `${listIdChecked.length} chi nhánh đã chọn`}
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
    permissions["BEAUTY_BRANCH_DELETE"] == 1 && {
      title: "Xóa chi nhánh",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-branch${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt báo cáo
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Mẫu báo cáo</h1>
        </div>
        {permissions["BEAUTY_BRANCH_ADD"] == 1 && (
          <Button
            className="btn__add--branch"
            onClick={(e) => {
              e && e.preventDefault();
              setDataBranch(null);
              setShowModalAdd(true);
            }}
          >
            Thêm mới
          </Button>
        )}
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên mẫu báo cáo"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listBranch && listBranch.length > 0 ? (
          <BoxTable
            name="Chi nhánh"
            titles={titles}
            items={listBranch}
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
                    Hiện tại chưa có chi nhánh nào. <br />
                    Hãy thêm mới chi nhánh đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới chi nhánh"
                action={() => {
                  setDataBranch(null);
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
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
