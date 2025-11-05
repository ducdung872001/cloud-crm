import React, { Fragment, useState, useEffect, useRef, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { IAction, ISaveSearch } from "model/OtherModel";
import { ICampaignFilterRequest } from "model/campaign/CampaignRequestModel";
import { ICampaignResponseModel } from "model/campaign/CampaignResponseModel";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import Badge from "components/badge/badge";
import "./MarketingAutomationList.scss";
import { ContextType, UserContext } from "contexts/userContext";
import AddMAModalV2 from "./AddMAModal/AddMAModal";
import MarketingAutomationService from "services/MarketingAutomationService";
import ReportMa from "./ReportMa/ReportMa";
import ModalSigner from "./ModalSigner";

export default function MarketingAutomationV2() {
  document.title = "Danh sách Marketing Automation V2";

  const navigate = useNavigate();
  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [listMarketingAutomation, setListMarketingAutomation] = useState([]);
  const [idMA, setIdMA] = useState<number>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalSigner, setShowModalSigner] = useState<boolean>(false);
  const [idCampaign, setIdCampaign] = useState<any>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [showDialogPause, setShowDialogPause] = useState<boolean>(false);
  const [contentDialogPause, setContentDialogPause] = useState<any>(null);
  const [showDialogApprove, setShowDialogApprove] = useState<boolean>(false);
  const [contentDialogApprove, setContentDialogApprove] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDetailMA, setIsDetailMA] = useState<boolean>(false);
  const [dataMA, setDataMA] = useState(null);

  const [params, setParams] = useState<ICampaignFilterRequest>({
    name: "",
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách",
      is_active: true,
    },
  ]);

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Chiến dịch",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListMarketingAutomation = async (paramsSearch: any) => {
    setIsLoading(true);

    // setListMarketingAutomation([
    //     {
    //         id: 1,
    //         name:'Chương trình MA sinh nhật',
    //         startDate:'12/1/2024',
    //         endDate: '30/1/2024',
    //         status: 1
    //     },
    //     {
    //         id: 2,
    //         name:'Chương trình MA tết',
    //         startDate:'12/1/2024',
    //         endDate: '30/1/2024',
    //         status: 1
    //     }
    // ])

    const response = await MarketingAutomationService.list(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setListMarketingAutomation(result.items);

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
      getListMarketingAutomation(params);
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

  const [showReport, setShowReport] = useState<boolean>(false);
  const [itemReport, setItemReport] = useState<any>(null);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: showReport ? "Quay lại" : "Thêm mới",
        callback: () => {
          if (showReport) {
            setShowReport(false);
          } else {
            navigate("/create_marketing_automation_v2");
          }
        },
      },
    ],
  };

  const titles = ["STT", "Tên chương trình", "Danh sách khách hàng", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái", "Xem báo cáo"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "text-center", "text-center"];

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
    <div
      key={item.id}
      className={`action__view--customer`}
      onClick={() => {
        navigate(`/detail_marketing_automation/maId/${item.id}`);
      }}
    >
      <a>Xem thêm</a>
    </div>,
    item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : "",
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
    // item.startDate ,
    // item.endDate ,
    <Badge key={index} variant={item.status === 1 ? "success" : "secondary"} text={item.status === 1 ? "Đã phê duyệt" : "Chưa phê duyệt"} />,
    <div
      key={item.id}
      className={`action__view--customer`}
      onClick={() => {
        setShowReport(true);
        setItemReport(item);
      }}
    >
      <a>Xem báo cáo</a>
    </div>,
  ];

  const onApprove = async (id, status) => {
    const param = {
      id,
      status: status,
    };
    const response = await MarketingAutomationService.approveMA(param);

    if (response.code === 0) {
      if (status === 1) {
        showToast("Phê duyệt thành công", "success");
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      }
      if (status === 2) {
        showToast("Tạm dừng thành công", "success");
        setShowDialogPause(false);
        setContentDialogPause(null);
      }

      getListMarketingAutomation(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const actionsTable = (item: any): IAction[] => {
    return [
      // ...(item.status !== 1
      //   ? [
      //       {
      //         title: "Phê duyệt",
      //         icon: <Icon name="FingerTouch" className="icon-warning" style={item.isSetup ? {} : { fill: "var(--extra-color-30)" }} />,
      //         callback: () => {
      //           if (item.isSetup) {
      //             // onApprove(item.id, 1);
      //             showDialogConfirmApprove(item, 1);
      //           } else {
      //             showToast("Vui lòng cài đặt chương trình trước khi phê duyệt", "error");
      //           }
      //         },
      //       },
      //     ]
      //   : [
      //       {
      //         title: "Tạm dừng",
      //         icon: <Icon name="Pause" />,
      //         callback: () => {
      //           // onApprove(item.id, 2);
      //           showDialogConfirmPause(item, 2);
      //         },
      //       },
      //     ]),

      {
        title: "Cài đặt MA",
        icon: <Icon name="Settings" style={{ width: 18 }} />,
        callback: () => {
          navigate(`/marketing_automation_setting/${item.id}`);
          //   setShowModalConfig(true);
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
        title: "Trình xử lý",
        icon: <Icon name="FingerTouch" className="icon-warning" />,
        callback: () => {
          setIdCampaign(item);
          setShowModalSigner(true);
        },
      },

      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          //   setIdCampaign(item.id);
          //   // setShowModalAdd(true);
          navigate(`/edit_marketing_automation_v2/${item.id}`);
        },
      },

      ...(item.status !== 1
        ? [
            {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]
        : []),
    ];
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        MarketingAutomationService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xoá chương trình  thành công", "success");
        getListMarketingAutomation(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const onDelete = async (id: number) => {
    const response = await MarketingAutomationService.delete(id);
    if (response.code === 0) {
      showToast("Xóa chương trình thành công", "success");
      getListMarketingAutomation(params);
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
          Bạn có chắc chắn muốn xóa {item ? "chương trình " : `${listIdChecked.length} chương trình đã chọn`}
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
          Bạn có chắc chắn muốn tạm dừng {item ? "chương trình " : `${listIdChecked.length} chương trình đã chọn`}
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
        onApprove(item.id, status);
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
          Bạn có chắc chắn muốn phê duyệt {item ? "chương trình " : `${listIdChecked.length} chương trình đã chọn`}
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
        onApprove(item.id, status);
      },
    };
    setContentDialogApprove(contentDialog);
    setShowDialogApprove(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa chương trình",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-automation-marketing-list${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title={showReport ? "Báo cáo chương trình " + itemReport.name : "Danh sách Marketing Automation"} titleActions={titleActions} />

      {showReport ? (
        <ReportMa dataMaReport={itemReport} />
      ) : (
        <div className="card-box d-flex flex-column">
          <SearchBox
            name="Tên chương trình"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />

          {!isLoading && listMarketingAutomation && listMarketingAutomation.length > 0 ? (
            <BoxTable
              name="Chương trình Marketing Automation"
              titles={titles}
              items={listMarketingAutomation}
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
                      Hiện tại chưa có chương trình MA nào. <br />
                      Hãy thêm mới chương trình MA đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới chương trình MA"
                  action={() => {
                    // setIdMA(null);
                    // setShowModalAdd(true);
                    navigate("/create_marketing_automation");
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
      )}

      <AddMAModalV2
        onShow={showModalAdd}
        idData={idMA}
        onHide={(reload) => {
          if (reload) {
            getListMarketingAutomation(params);
          }
          setShowModalAdd(false);
        }}
      />
      <ModalSigner
        onShow={showModalSigner}
        data={idCampaign}
        onHide={(reload) => {
          if (reload) {
            getListMarketingAutomation(params);
          }
          setShowModalSigner(false);
          setIdCampaign(null);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDialogPause} isOpen={showDialogPause} />
      <Dialog content={contentDialogApprove} isOpen={showDialogApprove} />
    </div>
  );
}
