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
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { ICrmCampaignFilterRequest } from "model/crmCampaign/CrmCampaignRequestModel";
import { ICrmCampaignResponse } from "model/crmCampaign/CrmCampaignResponseModel";
import { showToast } from "utils/common";
import { getPageOffset } from 'reborn-util';
import { urls } from "configs/urls";
import CrmCampaignService from "services/CrmCampaignService";
import AddCrmCampaignModal from "./partials/AddCrmCampaignModal";

export default function CrmCampaignList() {
  document.title = "Danh mục";

  const isMounted = useRef(false);

  const [listCrmCampaign, setListCrmCampaign] = useState<ICrmCampaignResponse[]>([]);
  const [dataCrmCampaign, setDataCrmCampaign] = useState<ICrmCampaignResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState<ICrmCampaignFilterRequest>({});

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách chiến dịch",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "chiến dịch",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCrmCampaign = async (paramsSearch: ICrmCampaignFilterRequest) => {
    setIsLoading(true);

    const response = await CrmCampaignService.getList(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCrmCampaign(result);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +params.page === 1) {
        setIsNoItem(true);
      }
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
      getListCrmCampaign(params);
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
          setDataCrmCampaign(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên chiến dịch", "Thứ tự"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: ICrmCampaignResponse, index: number) => [
    getPageOffset(params) + index + 1, 
    item.name, 
    item.position
  ];

  const actionsTable = (item: ICrmCampaignResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataCrmCampaign(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await CrmCampaignService.delete(id);

    if (response.code === 0) {
      showToast("Xóa chiến dịch thành công", "success");
      getListCrmCampaign(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICrmCampaignResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "chiến dịch " : `${listIdChecked.length} chiến dịch đã chọn`}
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
    {
      title: "Xóa chiến dịch",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-campaign${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Danh mục" to={urls.crm_campaign} isChildrenTitle={true} titleChildren="Chiến dịch CSKH" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên chiến dịch"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listCrmCampaign && listCrmCampaign.length > 0 ? (
          <BoxTable
            name="Chiến dịch"
            titles={titles}
            items={listCrmCampaign}
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
            {!isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có chiến dịch nào. <br />
                    Hãy thêm mới chiến dịch đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới chiến dịch"
                action={() => {
                  setDataCrmCampaign(null);
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
      <AddCrmCampaignModal
        onShow={showModalAdd}
        data={dataCrmCampaign}
        onHide={(reload) => {
          if (reload) {
            getListCrmCampaign(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
