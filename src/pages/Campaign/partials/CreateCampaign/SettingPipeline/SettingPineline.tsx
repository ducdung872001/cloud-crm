import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from 'reborn-util';

import "./SettingPineline.scss";
import CampaignPipelineService from "services/CampaignPipelineService";
import ModalAddCampaignPipeline from "./partials/ModalAddCampaignPipeline";

export default function SettingPineline(props: any) {
  document.title = "Danh sách pha chiến dịch";

  const isMounted = useRef(false);
  const {campaignId} = props;

  const [listCampaignPipeline, setListCampaignPipeline] = useState<any[]>([]);
  const [dataCampaignPipeline, setDataCampaignPipeline] = useState<any>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [tab, setTab] = useState('tab_one')

  const [params, setParams] = useState<any>({
    name: "",
    limit: 100,
    page: 1
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách ngành nghề/nghề nghiệp",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Danh sách nghề nghiệp",
      is_active: "tab_one",
    },
    {
      title: "Danh sách ngành nghề",
      is_active: "tab_two",
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: 'pha chiến dịch',
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCampaignPipeline = async (paramsSearch: any) => {
    const param = {
        ...paramsSearch,
        campaignId: campaignId
    }
    setIsLoading(true);

    const response = await CampaignPipelineService.list(param, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCampaignPipeline(result);

    //   setPagination({
    //     ...pagination,
    //     name: 'pha chiến dịch',
    //     page: +result.page,
    //     sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
    //     totalItem: +result.total,
    //     totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
    //   });

      if (result.length === 0 && params?.name == "") {
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
    getListCampaignPipeline(params);
  }, [params, campaignId])

//   useEffect(() => {
//     if (!isMounted.current) {
//       isMounted.current = true;
//       return;
//     }

//     if (isMounted.current === true) {
//       getListCampaignPipeline(params);
//       const paramsTemp = _.cloneDeep(params);
//       if (paramsTemp.limit === 10) {
//         delete paramsTemp["limit"];
//       }
//       Object.keys(paramsTemp).map(function (key) {
//         paramsTemp[key] === "" ? delete paramsTemp[key] : null;
//       });
//     }

//     return () => {
//       abortController.abort();
//     };
//   }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          setDataCampaignPipeline(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên pha", "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1, 
    item.name, 
    item.position
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataCampaignPipeline(item);
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
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await CampaignPipelineService.delete(id);

    if (response.code === 0) {
      showToast(`Xóa pha chiến dịch thành công`, "success");
      getListCampaignPipeline(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        CampaignPipelineService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xoá pha chiến dịch  thành công", "success");
        getListCampaignPipeline(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? 'pha chiến dịch ' : `${listIdChecked.length} ${tab === 'tab_one' ? 'nghề nghiệp' : 'ngành nghề'} đã chọn`}
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
        if (listIdChecked.length > 0) {
          onDeleteAll();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa pha chiến dịch",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-setting-campaign-pipeline${isNoItem ? " bg-white" : ""}`}>
      {/* <TitleAction title="Danh sách pha chiến dịch" titleActions={titleActions} /> */}
      <div className="card-box d-flex flex-column">
        {/* <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              {listTabs.map((item, idx) => (
                  <li
                    key={idx}
                    className={item.is_active == tab ? "active" : ""}
                    onClick={(e) => {
                      e && e.preventDefault();
                      setTab(item.is_active);
                    }}
                  >
                    {item.title}
                  </li>
              ))}
            </ul>
          </div>
          
          <SearchBox
            name={tab=== 'tab_one' ? "Tên nghề nghiệp" : "Tên ngành nghề"}
            params={params}
            // isSaveSearch={true}
            // listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
        </div> */}
        <div style={{ flex: 1, justifyContent: "space-between", display: "flex", margin: '2rem 2rem 0 2rem' }}>
            <div>
                <span style={{fontSize: 18, fontWeight:'600'}}>Danh sách pha chiến dịch</span>
            </div>
            <div
                className="button_add_pipeline"
                onClick={() => {
                    if (campaignId) {
                        setShowModalAdd(true);
                    }
                }}
                >
                <Icon name="PlusCircleFill" />
                <span className="title_button">Thêm pha</span>
            </div>
        </div>
        
        {!isLoading && listCampaignPipeline && listCampaignPipeline.length > 0 ? (
          <BoxTable
            name="Pha chiến dịch"
            titles={titles}
            items={listCampaignPipeline}
            isPagination={false}
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
                    Hiện tại chưa có pha chiến dịch nào. <br />
                    Hãy thêm mới pha chiến dịch đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới pha chiến dịch"
                action={() => {
                  setListCampaignPipeline(null);
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
      <ModalAddCampaignPipeline
        onShow={showModalAdd}
        data={dataCampaignPipeline}
        campaignId={campaignId}
        onHide={(reload) => {
          if (reload) {
            getListCampaignPipeline(params);
          }
          setShowModalAdd(false);
          setDataCampaignPipeline(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
