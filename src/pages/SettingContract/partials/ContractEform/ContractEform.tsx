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
import { IContractPipelineListProps } from "model/contractPipeline/PropsModel";
import { IContractPipelineFilterRequest } from "model/contractPipeline/ContractPipelineRequestModel";
import { IContractPipelineResponse } from "model/contractPipeline/ContractPipelineResponseModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import ContractPipelineService from "services/ContractPipelineService";
import { getPermissions } from "utils/common";
import "./ContractEform.scss";
// import AddContractCategoryModal from "./partials/AddContractCategoryModal/AddContractCategoryModal";
import ContractEformService from "services/ContractEformService";
import AddContractEformModal from "./partials/AddContractEformModal";
import SettingEform from "./SettingEform/SetttingEform";
import PreviewEformModal from "./PreviewEform/PreviewEformModal";

export default function ContractEform(props: any) {
  document.title = "Danh sách biểu mẫu";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listContractEform, setListContractEform] = useState([]);
  const [dataContractEform, setDataContractEform] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAddEform, setShowModalAddEform] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [isSettingEform, setIsSettingEform] = useState<boolean>(false);
  const [isPreviewEform, setIsPreviewEform] = useState(false);

  const [params, setParams] = useState<IContractPipelineFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách biểu mẫu",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "biểu mẫu",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListContractEform = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ContractEformService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListContractEform(result.items);

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
        getListContractEform(params);
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
      ...(isSettingEform
        ? [
            // {
            //   title: "Quay lại",
            //   callback: () => {
            //     setIsSettingEform(false);
            //   },
            // },
          ]
        :
        [
          {
            title: "Thêm mới",
            callback: () => {
                setDataContractEform(null);
                setShowModalAddEform(true);
            },
          }
        ]
      ),
    ],
  };

  const titles = ["STT", "Tên biểu mẫu", ];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name, 
    // item.position,
  ];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return [
        {
            title: "Xem biểu mẫu",
            icon: <Icon name="Eye" />,
            callback: () => {
                setDataContractEform(item);
                setIsPreviewEform(true);
            },
        },

        {
            title: "Cài đặt biểu mẫu",
            icon: <Icon name="Settings" />,
            callback: () => {
                setDataContractEform(item);
                setIsSettingEform(true);
            },
        },
        {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
                setDataContractEform(item);
                setShowModalAddEform(true);
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
    const response = await ContractEformService.delete(id);

    if (response.code === 0) {
      showToast("Xóa biểu mẫu thành công", "success");
      getListContractEform(params);
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
      const found = listContractEform.find((item) => item.id === selectedId);
      if (found?.id) {
        return ContractEformService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} biểu mẫu`, "success");
        getListContractEform(params);
        setListIdChecked([]);
      } else {
        showToast("Không có biểu mẫu nào được xóa", "error");
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
          Bạn có chắc chắn muốn xóa {item ? "biểu mẫu" : `${listIdChecked.length} biểu mẫu đã chọn`}
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
    permissions["CONTRACT_DELETE"] == 1 && {
      title: "Xóa loại hợp đồng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-contract-eform${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        {/* <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt hợp đồng
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 
            className=  {isSettingEform ? "title-first" : "title-last"}
            onClick={() => {
              setIsSettingEform(false);
            }}
          >
            Danh sách biểu mẫu
          </h1>
          {isSettingEform && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                    setIsSettingEform(false);
                }}
              />
              <h1 className="title-last">Cài đặt biểu mẫu</h1>
            </Fragment>
          )}
        </div> */}
        <div className="action-backup">
          <h1
            onClick={() => {
              setIsSettingEform(false);
            }}
            className="title-first"
            // title="Quay lại"
          >
            Danh sách biểu mẫu
          </h1>
          {/* <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          /> */}
          {isSettingEform && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                    setIsSettingEform(false);
                }}
              />
              <h1 className="title-last">Cài đặt biểu mẫu</h1>
            </Fragment>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
        {!isSettingEform ? 
            <div className="card-box d-flex flex-column">
                <SearchBox
                    name="Tên biểu mẫu"
                    params={params}
                    isSaveSearch={true}
                    listSaveSearch={listSaveSearch}
                    updateParams={(paramsNew) => setParams(paramsNew)}
                />
                {!isLoading && listContractEform && listContractEform.length > 0 ? (
                    <BoxTable
                        name="Biểu mẫu"
                        titles={titles}
                        items={listContractEform}
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
                                    Hiện tại chưa có biểu mẫu nào. <br />
                                    Hãy thêm mới biểu mẫu đầu tiên nhé!
                                </span>
                                }
                                type="no-item"
                                titleButton="Thêm mới biểu mẫu"
                                action={() => {
                                setDataContractEform(null);
                                setShowModalAddEform(true);
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
            : 
            <div>
                <SettingEform
                    dataContractEform = {dataContractEform}
                    setIsPreviewEform = {setIsPreviewEform}
                />
            </div>
        }
      <AddContractEformModal
        onShow={showModalAddEform}
        data={dataContractEform}
        onHide={(reload) => {
          if (reload) {
            getListContractEform(params);
          }
          setShowModalAddEform(false);
          setDataContractEform(null);
        }}
      />

      <PreviewEformModal
        onShow={isPreviewEform}
        data={dataContractEform}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsPreviewEform(false);
          // setDataContractEform(null);
        }}
      />
     
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
