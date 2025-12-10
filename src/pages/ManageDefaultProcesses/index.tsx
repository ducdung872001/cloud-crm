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
import "./index.scss";
// import AddContractCategoryModal from "./partials/AddContractCategoryModal/AddContractCategoryModal";
import ManageDefaultProcessesService from "services/ManageDefaultProcessesService";
import AddConfigDefaultProcesses from "./partials/AddConfigDefaultProcesses";

export default function ManageDefaultProcesses(props: any) {
  document.title = "Cài đặt quy trình mặc định";

  const isMounted = useRef(false);

  const [listContractEform, setListContractEform] = useState([]);
  const [dataConfig, setDataConfig] = useState(null);
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
      name: "Cài đặt quy trình mặc định",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "tính năng",
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

    const response = await ManageDefaultProcessesService.list(paramsSearch, abortController.signal);

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
        : [
            {
              title: "Thêm mới",
              callback: () => {
                setDataConfig(null);
                setShowModalAddEform(true);
              },
            },
          ]),
    ],
  };

  let options = [
    { value: "/fs/", label: "Danh sách FS" },
    { value: "/quote/", label: "Danh sách báo giá" },
    { value: "/contract/", label: "Danh sách hợp đồng" },
    { value: "/guarantee/", label: "Danh sách bảo lãnh" },
    { value: "/contractWarranty/", label: "Danh sách bảo hành" },
    { value: "/marketing/", label: "Ngân sách truyền thông" },
    { value: "/ma/", label: "Truyền thông theo kịch bản" },
    { value: "/campaignOpportunity/", label: "Quản lý cơ hội" },
    { value: "/order_request/", label: "Xác nhận đơn hàng" },
    { value: "/treatmentHistory/", label: "Lịch sử thực hiện dịch vụ" },
    { value: "/warranty/", label: "Tiếp nhận bảo hành" },
    { value: "/ticket/", label: "Tiếp nhận hỗ trợ" },
    { value: "/invoice/", label: "Nhập kho" },
  ];

  const titles = ["STT", "Tên cấu hình", "Tính năng", "Mã quy trình"];

  const dataFormat = ["text-center", "", "text-left", "text-left", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item?.name ?? "",
    options.find((option) => option.value === item?.uri)?.label || item?.uri || "",
    item?.processCode + " - (" + item?.processName + ")" ?? "",
    // item.position,
  ];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataConfig(item);
          setShowModalAddEform(true);
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
    const response = await ManageDefaultProcessesService.delete(id);

    if (response.code === 0) {
      showToast("Xóa tính năng thành công", "success");
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
        return ManageDefaultProcessesService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} cấu hình`, "success");
        getListContractEform(params);
        setListIdChecked([]);
      } else {
        showToast("Không có cấu hình nào được xóa", "error");
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
          Bạn có chắc chắn muốn xóa {item ? "tính năng" : `${listIdChecked.length} tính năng đã chọn`}
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
        <div className="action-backup">
          <h1
            onClick={() => {
              setIsSettingEform(false);
            }}
            className="title-first"
          >
            Cài đặt quy trình mặc định
          </h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên tính năng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listContractEform && listContractEform.length > 0 ? (
          <BoxTable
            name="tính năng"
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
                    Hiện tại chưa có tính năng nào. <br />
                    Hãy thêm mới tính năng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới tính năng"
                action={() => {
                  setDataConfig(null);
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
      <AddConfigDefaultProcesses
        onShow={showModalAddEform}
        data={dataConfig}
        onHide={(reload) => {
          if (reload) {
            getListContractEform(params);
          }
          setShowModalAddEform(false);
          setDataConfig(null);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
