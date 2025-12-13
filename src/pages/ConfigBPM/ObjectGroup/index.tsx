import React, { Fragment, useState, useEffect, useRef, useContext } from "react";
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
import { IContractPipelineResponse } from "model/contractPipeline/ContractPipelineResponseModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import { getPermissions } from "utils/common";
import "./index.scss";
// import AddContractCategoryModal from "./partials/AddContractCategoryModal/AddContractCategoryModal";
import ObjectGroupService from "services/ObjectGroupService";
import SettingAttribute from "./partials/SettingAttribute";
import AddObjectGroupModal from "./partials/AddObjectGroupModal";
import ObjectSettingModal from "./partials/ObjectSettingModal";
import { UserContext, ContextType } from "contexts/userContext";

export default function ObjectGroupList(props: any) {
  document.title = "Danh mục loại đối tượng";

  const { role } = useContext(UserContext) as ContextType;

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listObjectGroup, setListOjectGroup] = useState([]);
  const [dataObjectGroup, setDataObjectGroup] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAddOjectGroup, setShowModalAddOjectGroup] = useState<boolean>(false);
  const [showModalSettingObject, setShowModalSettingObject] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalSetting, setShowModalSetting] = useState(false);

  const [params, setParams] = useState({
    name: "",
    limit: 10,
    page: 1,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục loại đối tượng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "loại đối tượng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListOjectGroup = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ObjectGroupService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListOjectGroup(result.items);

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
      getListOjectGroup(params);
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
          setDataObjectGroup(null);
          setShowModalAddOjectGroup(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên loại đối tượng", "Kiểu đối tượng", "Thứ tự"];

  const dataFormat = ["text-center", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [getPageOffset(params) + index + 1, item.name, item.type, item.position];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Cài đặt hồ sơ",
        icon: <Icon name="SettingTicket" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataObjectGroup(item);
          setShowModalSettingObject(true);
          }
        },
      },

      {
        title: "Cài đặt trường",
        icon: <Icon name="Settings" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataObjectGroup(item);
          setShowModalSetting(true);
          }
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataObjectGroup(item);
          setShowModalAddOjectGroup(true);
          }
        },
      },
      {
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
    const response = await ObjectGroupService.delete(id);

    if (response.code === 0) {
      showToast("Xóa loại đối tượng thành công", "success");
      getListOjectGroup(params);
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
      const found = listObjectGroup.find((item) => item.id === selectedId);
      if (found?.id) {
        return ObjectGroupService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} loại đối tượng`, "success");
        getListOjectGroup(params);
        setListIdChecked([]);
      } else {
        showToast("Không có loại đối tượng nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IContractPipelineResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "loại đối tượng " : `${listIdChecked.length} loại đối tượng đã chọn`}
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
    {
      title: "Xóa loại đối tượng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-object-group${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cấu hình quy trình
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách loại đối tượng</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên loại đối tượng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listObjectGroup && listObjectGroup.length > 0 ? (
          <BoxTable
            name="Loại đối tượng"
            titles={titles}
            items={listObjectGroup}
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
                    Hiện tại chưa có loại đối tượng nào. <br />
                    Hãy thêm mới loại đối tượng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới loại hợp đồng"
                action={() => {
                  setDataObjectGroup(null);
                  setShowModalAddOjectGroup(true);
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
      <AddObjectGroupModal
        onShow={showModalAddOjectGroup}
        data={dataObjectGroup}
        onHide={(reload) => {
          if (reload) {
            getListOjectGroup(params);
          }
          setShowModalAddOjectGroup(false);
        }}
      />
      <ObjectSettingModal
        onShow={showModalSettingObject}
        dataObject={dataObjectGroup}
        onHide={(reload) => {
          if (reload) {
            getListOjectGroup(params);
          }
          setShowModalSettingObject(false);
          setDataObjectGroup(null);
        }}
      />

      <SettingAttribute
        onShow={showModalSetting}
        dataObjectGroup={dataObjectGroup}
        onHide={(reload) => {
          if (reload) {
            getListOjectGroup(params);
          }
          setShowModalSetting(false);
          setDataObjectGroup(null);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
