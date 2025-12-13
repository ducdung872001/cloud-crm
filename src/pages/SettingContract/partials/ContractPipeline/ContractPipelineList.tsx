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
import AddContractPipelineModal from "./partials/AddContractPipelineModal";
import { getPermissions } from "utils/common";
import ContractStageModal from "./partials/ContractStageModal";
import "./ContractPipelineList.scss";
import ContractApproachList from "./ContractApproach/ContractApproach";

export default function ContractPipelineList(props: IContractPipelineListProps) {
  document.title = "Danh mục pha hợp đồng";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listContractPipeline, setListContractPipeline] = useState<IContractPipelineResponse[]>([]);
  const [dataContractPipeline, setDataContractPipeline] = useState<IContractPipelineResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalStage, setShowModalStage] = useState<boolean>(false);
  const [infoPipeline, setInfoPipeline] = useState(null);
  const [isAddEditContractPipline, setIsAddEditContractPipline] = useState<boolean>(false);

  const [params, setParams] = useState<IContractPipelineFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục pha hợp đồng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "pha hợp đồng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListContractPipeline = async (paramsSearch: IContractPipelineFilterRequest) => {
    setIsLoading(true);

    const response = await ContractPipelineService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListContractPipeline(result);

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
      getListContractPipeline(params);
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
      ...(isAddEditContractPipline
        ? [
            {
              title: "Quay lại",
              callback: () => {
                setIsAddEditContractPipline(false);
              },
            },
          ]
        :
        [
          permissions["CONTRACT_ADD"] == 1 && {
            title: "Thêm mới",
            callback: () => {
              setDataContractPipeline(null);
              setShowModalAdd(true);
            },
          }
        ]
      ),
    ],
  };

  const titles = ["STT", "Tên pha hợp đồng", "Thứ tự", "Quy trình hợp đồng"];

  const dataFormat = ["text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item: IContractPipelineResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name, 
    item.position,
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        // setInfoPipeline({ idPipeline: item.id, name: item.name });
        // setShowModalStage(true);
        setDataContractPipeline(item)
        setIsAddEditContractPipline(true);
      }}
    >
      Xem thêm
    </a>,
  ];

  const actionsTable = (item: IContractPipelineResponse): IAction[] => {
        const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["CONTRACT_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataContractPipeline(item);
          setShowModalAdd(true);
          }
        },
      },
      permissions["CONTRACT_DELETE"] == 1 && {
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
    const response = await ContractPipelineService.delete(id);

    if (response.code === 0) {
      showToast("Xóa loại hợp đồng thành công", "success");
      getListContractPipeline(params);
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
      const found = listContractPipeline.find((item) => item.id === selectedId);
      if (found?.id) {
        return ContractPipelineService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} pha hợp đồng`, "success");
        getListContractPipeline(params);
        setListIdChecked([]);
      } else {
        showToast("Không có pha hợp đồng nào được xóa", "error");
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
          Bạn có chắc chắn muốn xóa {item ? "loại hợp đồng " : `${listIdChecked.length} loại hợp đồng đã chọn`}
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
    <div className={`page-content page-contract-pipeline${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
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
            className=  {isAddEditContractPipline ? "title-first" : "title-last"}
            onClick={() => {
              setIsAddEditContractPipline(false);
            }}
          >
            Danh mục pha hợp đồng
          </h1>
          {isAddEditContractPipline && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setIsAddEditContractPipline(false);
                }}
              />
              <h1 className="title-last">Quy trình hợp đồng </h1>
            </Fragment>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      {!isAddEditContractPipline ? 
        <div className="card-box d-flex flex-column">
          <SearchBox
            name="Tên pha hợp đồng"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listContractPipeline && listContractPipeline.length > 0 ? (
            <BoxTable
              name="Pha hợp đồng"
              titles={titles}
              items={listContractPipeline}
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
                      Hiện tại chưa có loại hợp đồng nào. <br />
                      Hãy thêm mới loại hợp đồng đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới pha hợp đồng"
                  action={() => {
                    setDataContractPipeline(null);
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

        : 
        <div>
          <ContractApproachList
            dataContractPipeline = {dataContractPipeline}
          />
        </div>
      }
      <AddContractPipelineModal
        onShow={showModalAdd}
        data={dataContractPipeline}
        onHide={(reload) => {
          if (reload) {
            getListContractPipeline(params);
          }
          setShowModalAdd(false);
        }}
      />
      <ContractStageModal
        infoPipeline={infoPipeline}
        onShow={showModalStage}
        onHide={(reload) => {
          if (reload) {
            getListContractPipeline(params);
          }

          setShowModalStage(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
