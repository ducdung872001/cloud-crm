import React, { Fragment, useState, useEffect, useRef, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { IAction, ISaveSearch } from "model/OtherModel";
import { ICampaignFilterRequest } from "model/campaign/CampaignRequestModel";
import { ICampaignResponseModel } from "model/campaign/CampaignResponseModel";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { showToast } from "utils/common";
import CampaignService from "services/CampaignService";
import { getPageOffset } from "reborn-util";
import Badge from "components/badge/badge";
import "./BusinessProcessList.scss";
import { CircularProgressbar } from "react-circular-progressbar";
import { ContextType, UserContext } from "contexts/userContext";
// import AddMAModal from "./BuninessProcessList/AddMAModal";
import MarketingAutomationService from "services/MarketingAutomationService";
import ModalAddBusinessProcess from "./partials/ModalAddBusinessProcess";
import BusinessProcessService from "services/BusinessProcessService";

export default function BusinessProcessList() {
  document.title = "Danh sách quy trình";

  const navigate = useNavigate();
  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [listBusinessProcess, setListBusinessProcess] = useState([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [showDialogPause, setShowDialogPause] = useState<boolean>(false);
  const [contentDialogPause, setContentDialogPause] = useState<any>(null);
  const [showDialogApprove, setShowDialogApprove] = useState<boolean>(false);
  const [contentDialogApprove, setContentDialogApprove] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataBusinessProcess, setDataBusinessProcess] = useState(null);

  const [params, setParams] = useState<ICampaignFilterRequest>({
    name: "",
    limit: 10,
    page: 1
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "quy trình",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListBusinessProcess = async (paramsSearch: any) => {
    setIsLoading(true);

    // setListBusinessProcess([
    //     {
    //         id: 1,
    //         name:'Chương trình MA sinh nhật',
    //         employeeName: 'Tung Nguyen',
    //         status: 1
    //     },
    //     {
    //         id: 2,
    //         name:'Chương trình MA tết',
    //         employeeName: 'Trung Nguyen',
    //         status: 1
    //     }
    // ])

    const response = await BusinessProcessService.list(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setListBusinessProcess(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params?.name && +result.page === 1) {
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
    //! đoạn này bao giờ có chức năng lọc thì viết vào đây
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListBusinessProcess(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      //! đoạn này bao giờ có chức năng lọc thì viết vào đây
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
          setShowModalAdd(true);
          setDataBusinessProcess(null);
        //   navigate("/create_marketing_automation");
        },
      },
    ],
  };

  const titles = ["STT", "Tên quy trình", "Người phụ trách", "Trạng thái",];

  const dataFormat = ["text-center", "", "", "text-center",  "text-center",];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    // <Link
    //   key={item.id}
    //   to={`/detail_marketing_automation/maId/${item.id}`}
    //   onClick={() => {
    //     //
    //   }}
    //   className="detail-marketing-automation"
    // >
    //   {item.name}
    // </Link>,
    item.name,
    // <div
    //   key={item.id}
    //   className={`action__view--customer`}
    //   onClick={() => {
    //     navigate(`/detail_marketing_automation/maId/${item.id}`);
    //   }}
    // >
    //   <a>Xem thêm</a>
    // </div>,
    item.employeeName,
    <Badge key={index} variant={item.status === 1 ? "success" : "secondary"} text={item.status === 1 ? "Đã phê duyệt" : "Chưa phê duyệt"} />,
  ];

  const onApprove = async (id, status) => {
    const param = {
      id,
      status: status,
    };
    const response = await MarketingAutomationService.approveMA(param);

    if (response.code === 0) {
      if(status === 1){
        showToast("Phê duyệt thành công", "success");
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      } 
      if(status === 2){
        showToast("Tạm dừng thành công", "success");
        setShowDialogPause(false);
        setContentDialogPause(null);
      }
      
      getListBusinessProcess(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const actionsTable = (item: any): IAction[] => {
    return [
    //   ...(item.status !== 1
    //     ? [
    //         {
    //           title: "Phê duyệt",
    //           icon: <Icon 
    //                     name="FingerTouch" 
    //                     className="icon-warning" 
    //                     style={ item.isSetup ? {} : { fill: 'var(--extra-color-30)' }} 
    //                   />,
    //           callback: () => {
    //             if(item.isSetup){
    //               // onApprove(item.id, 1);
    //               showDialogConfirmApprove(item, 1);
    //             } else {
    //               showToast("Vui lòng cài đặt chương trình trước khi phê duyệt", "error");
    //             }
                
    //           },
    //         },
    //       ]
    //     : [
    //       {
    //         title: "Tạm dừng",
    //         icon: <Icon name="Pause"/>,
    //         callback: () => {
    //           // onApprove(item.id, 2);
    //           showDialogConfirmPause(item, 2)
    //         },
    //       },
    //     ]),

      {
        title: "Cài đặt quy trình",
        icon: <Icon name="Settings" style={{ width: 18 }} />,
        callback: () => {
          navigate(`/setting_business_process/${item.id}`);
        },
      },

      // {
      //     title: "Xem chi tiết",
      //     icon: <Icon name="Eye" />,
      //     callback: () => {
      //     //   setIdCampaign(item.id);
      //     //   setIsDetailCampaignDetail(true);
      //     },
      // },


      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          //   setIdCampaign(item.id);
            setShowModalAdd(true);
            setDataBusinessProcess(item);
        },
      },
      
      ...(item.status !== 1 ? [
        {
          title: "Xóa",
          icon: <Icon name="Trash" className="icon-error" />,
          callback: () => {
            showDialogConfirmDelete(item);
          },
        },
      ] : [])
     
    ];
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        BusinessProcessService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xoá quy trình  thành công", "success");
        getListBusinessProcess(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const onDelete = async (id: number) => {
    const response = await BusinessProcessService.delete(id);
    if (response.code === 0) {
      showToast("Xóa quy trình thành công", "success");
      getListBusinessProcess(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICampaignResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "quy trình " : `${listIdChecked.length} quy trình đã chọn`}
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

  const showDialogConfirmPause = (item?: any, status?: number) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Tạm dừng...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn tạm dừng {item ? "quy trình " : `${listIdChecked.length} quy trình đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogPause(false);
        setContentDialogPause(null);
      },
      defaultText: "Tạm dừng",
      defaultAction: () => {
        onApprove(item.id, status)
      },
    };
    setContentDialogPause(contentDialog);
    setShowDialogPause(true);
  };

  const showDialogConfirmApprove = (item?: any, status?: number) => {
    const contentDialog: IContentDialog = {
      color: "success",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Phê duyệt...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn phê duyệt {item ? "quy trình " : `${listIdChecked.length} quy trình đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}?
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      },
      defaultText: "Phê duyệt",
      defaultAction: () => {
        onApprove(item.id, status)
      },
    };
    setContentDialogApprove(contentDialog);
    setShowDialogApprove(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa quy trình",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-business-process-list${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Danh sách quy trình" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên quy trình"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />

        {!isLoading && listBusinessProcess && listBusinessProcess.length > 0 ? (
          <BoxTable
            name="Quy trình"
            titles={titles}
            items={listBusinessProcess}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            listIdChecked={listIdChecked}
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
                    Hiện tại chưa có quy trình nào. <br />
                    Hãy thêm mới quy trình đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới quy trình"
                action={() => {
                    setDataBusinessProcess(null);
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

      <ModalAddBusinessProcess
        onShow={showModalAdd}
        data={dataBusinessProcess}
        onHide={(reload) => {
          if (reload) {
            getListBusinessProcess(params);
          }
          setShowModalAdd(false);
          setDataBusinessProcess(null);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDialogPause} isOpen={showDialogPause} />
      <Dialog content={contentDialogApprove} isOpen={showDialogApprove} />
    </div>
  );
}
