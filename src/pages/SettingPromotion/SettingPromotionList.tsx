import BoxTable from "components/boxTable/boxTable";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import _ from "lodash";
import { IContractPipelineFilterRequest } from "model/contractPipeline/ContractPipelineRequestModel";
import { IContractPipelineResponse } from "model/contractPipeline/ContractPipelineResponseModel";
import { IAction, ISaveSearch } from "model/OtherModel";
import AddContractEformModal from "pages/SettingContract/partials/ContractEform/partials/AddContractEformModal";
import PreviewEformModal from "pages/SettingContract/partials/ContractEform/PreviewEform/PreviewEformModal";
import SettingEform from "pages/SettingContract/partials/ContractEform/SettingEform/SetttingEform";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPageOffset } from "reborn-util";
import ContractEformService from "services/ContractEformService";
import { getPermissions, showToast } from "utils/common";
import EditPromotion from "./partials/EditPromotion/EditPromotion";

export default function SettingPromotionList(props: any) {
  document.title = "Danh sách khuyến mãi";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listContractEform, setListContractEform] = useState([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showEditPrm, setShowEditPrm] = useState<boolean>(true);
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
      name: "Danh sách Khuyến mãi",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Khuyến mãi",
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
      ...(showEditPrm
        ? [
            {
              title: "Quay lại",
              callback: () => {
                setShowEditPrm(false);
              },
            },
          ]
        : [
            {
              title: "Thêm mới",
              callback: () => {
                setShowEditPrm(true);
                setDataEdit(null);
              },
            },
          ]),
    ],
  };

  const titles = ["STT", "Tên chương trình", "Trạng thái", "Ngày bắt đầu", "Ngày kết thúc", ""];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", ""];

  const dataMappingArray = (item: any, index: number) => [getPageOffset(params) + index + 1, item.name, item.position, item.position, item.position];
  const [dataSetting, setDataSetting] = useState(null);

  const [dataEdit, setDataEdit] = useState(null);
  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Xem Khuyến mãi",
        icon: <Icon name="Eye" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setIsPreviewEform(true);
          }
        },
      },

      {
        title: "Cài đặt Khuyến mãi",
        icon: <Icon name="Settings" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setDataSetting(item);
            setIsSettingEform(true);
          }
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataEdit(item);
          setShowEditPrm(true);
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
    const response = await ContractEformService.delete(id);

    if (response.code === 0) {
      showToast("Xóa Khuyến mãi thành công", "success");
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
        showToast(`Xóa thành công ${checkbox} khuyến mãi`, "success");
        getListContractEform(params);
        setListIdChecked([]);
      } else {
        showToast("Không có khuyến mãi nào được xóa", "error");
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
          Bạn có chắc chắn muốn xóa {item ? "Khuyến mãi" : `${listIdChecked.length} Khuyến mãi đã chọn`}
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

  const [searchParams, setSearchParams] = useSearchParams();
  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_buy",
        name: "Ngày bắt đầu",
        type: "date-two",
        param_name: ["startDate", "endDate"],
        is_featured: true,
        value: searchParams.get("startDate") ?? "",
        value_extra: searchParams.get("endDate") ?? "",
        is_fmt_text: true,
      },
      {
        key: "time_buy",
        name: "Ngày kết thúc",
        type: "date-two",
        param_name: ["startDate", "endDate"],
        is_featured: true,
        value: searchParams.get("startDate") ?? "",
        value_extra: searchParams.get("endDate") ?? "",
        is_fmt_text: true,
      },
      {
        key: "status",
        name: "Trạng thái",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "-1",
            label: "Tất cả",
          },
          {
            value: "1",
            label: "Chưa áp dụng",
          },
          {
            value: "2",
            label: "Đang áp dụng",
          },
          {
            value: "3",
            label: "Tạm dừng",
          },
          {
            value: "4",
            label: "Ngừng áp dụng",
          },
        ],
        value: searchParams.get("status") ?? "",
      },
    ],
    [searchParams]
  );

  return (
    <div className={`page-content page-contract-eform${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt bán hàng
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách khuyến mãi</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      {showEditPrm ? (
        <EditPromotion showEditPrm={showEditPrm} setShowEditPrm={setShowEditPrm} dataEdit={dataEdit} />
      ) : (
        <div>
          <div className="action-navigation">
            <div className="action-backup">
              {/* <h1
                onClick={() => {
                  setIsSettingEform(false);
                }}
                className="title-first"
              >
                Danh sách Khuyến mãi
              </h1> */}
              {isSettingEform && (
                <Fragment>
                  <Icon
                    name="ChevronRight"
                    onClick={() => {
                      setIsSettingEform(false);
                    }}
                  />
                  <h1 className="title-last">Cài đặt Khuyến mãi</h1>
                </Fragment>
              )}
            </div>
            {/* <TitleAction title="" titleActions={titleActions} /> */}
          </div>
          {!isSettingEform ? (
            <div className="card-box d-flex flex-column">
              <SearchBox
                name="Tên Khuyến mãi"
                params={params}
                isSaveSearch={true}
                listSaveSearch={listSaveSearch}
                isFilter={true}
                listFilterItem={customerFilterList}
                updateParams={(paramsNew) => setParams(paramsNew)}
              />
              {!isLoading && listContractEform && listContractEform.length > 0 ? (
                <BoxTable
                  name="Khuyến mãi"
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
                          Hiện tại chưa có Khuyến mãi nào. <br />
                          Hãy thêm mới Khuyến mãi đầu tiên nhé!
                        </span>
                      }
                      type="no-item"
                      titleButton="Thêm mới Khuyến mãi"
                      action={() => {
                        setShowEditPrm(true);
                        setDataEdit(null);
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
          ) : (
            <div>
              <SettingEform dataContractEform={dataSetting} setIsPreviewEform={setIsPreviewEform} />
            </div>
          )}
        </div>
      )}
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
