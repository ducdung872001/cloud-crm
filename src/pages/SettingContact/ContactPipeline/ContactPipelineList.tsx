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
import { IContactPipelineFilterRequest } from "model/contactPipeline/ContactPipelineRequestModel";
import { IContactPipelineResponse } from "model/contactPipeline/ContactPipelineResponseModel";
import { IContactPipelineListProps } from "model/contactPipeline/PropsModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import AddContactPipelineModel from "./partials/AddContactPipelineModel";
import ContactPipelineService from "services/ContactPipelineService";
import ContactStatusModal from "./partials/ContactStatusModal";
import "./ContactPipelineList.scss";

export default function ContactPipeline(props: IContactPipelineListProps) {
  document.title = "Danh mục loại liên hệ";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listContactPipeline, setListContactPipeline] = useState<IContactPipelineResponse[]>([]);
  const [dataContactPipeline, setDataContactPipeline] = useState<IContactPipelineResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalStatus, setShowModalStatus] = useState<boolean>(false);
  const [infoPipeline, setInfoPipeline] = useState(null);

  const [params, setParams] = useState<IContactPipelineFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục loại liên hệ",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "loại liên hệ",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListContactPipeline = async (paramsSearch: IContactPipelineFilterRequest) => {
    setIsLoading(true);

    // Call api ở đây
    const response = await ContactPipelineService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListContactPipeline(result);

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
      getListContactPipeline(params);
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
          setDataContactPipeline(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên loại liên hệ", "Thứ tự", "Trạng thái"];

  const dataFormat = ["text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item: IContactPipelineResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.position,
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setInfoPipeline({ idPipeline: item.id, name: item.name });
        setShowModalStatus(true);
      }}
    >
      Xem thêm
    </a>,
  ];

  const actionsTable = (item: IContactPipelineResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["CONTACT_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataContactPipeline(item);
          setShowModalAdd(true);
          }
        },
      },
      permissions["CONTACT_DELETE"] == 1 && {
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
    const response =  await ContactPipelineService.delete(id);

    if (response.code === 0) {
      showToast("Xóa loại liên hệ thành công", "success");
      getListContactPipeline(params);
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
      const found = listContactPipeline.find((item) => item.id === selectedId);
      if (found?.id) {
        return ContactPipelineService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} loại liên hệ`, "success");
        getListContactPipeline(params);
        setListIdChecked([]);
      } else {
        showToast("Không có loại liên hệ nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IContactPipelineResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "loại liên hệ " : `${listIdChecked.length} loại liên hệ đã chọn`}
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
    permissions["CONTACT_DELETE"] == 1 && {
      title: "Xóa loại liên hệ",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page__category--stage${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt người liên hệ
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh mục loại liên hệ</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên loại liên hệ"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listContactPipeline && listContactPipeline.length > 0 ? (
          <BoxTable
            name="Loại liên hệ"
            titles={titles}
            items={listContactPipeline}
            isPagination={false}
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
                    Hiện tại chưa có loại liên hệ nào. <br />
                    Hãy thêm mới loại liên hệ đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới loại liên hệ"
                action={() => {
                  setDataContactPipeline(null);
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
      <AddContactPipelineModel
        onShow={showModalAdd}
        data={dataContactPipeline}
        onHide={(reload) => {
          if (reload) {
            getListContactPipeline(params);
          }
          setShowModalAdd(false);
        }}
      />
      <ContactStatusModal
        infoPipeline={infoPipeline}
        onShow={showModalStatus}
        onHide={(reload) => {
          if (reload) {
            getListContactPipeline(params);
          }

          setShowModalStatus(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
