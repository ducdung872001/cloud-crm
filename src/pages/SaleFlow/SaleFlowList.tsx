import React, { Fragment, useState, useEffect, useRef, useContext, useMemo } from "react";
import _ from "lodash";
import moment from "moment";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
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
// import AddCampaignModal from "./partials/AddCampaignModal/AddCampaignModal";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import Badge from "components/badge/badge";
import "./SaleFlowList.scss";
// import DetailCampaign from "./partials/DetailCampaign/DetailCampaign";
import { CircularProgressbar } from "react-circular-progressbar";
// import ReportCampaignModal from "./partials/ReportCampaign/ReportCampaignModal";
import { ContextType, UserContext } from "contexts/userContext";
import SaleFlowService from "services/SaleFlowService";
// import ChangeStatusCampaign from "./partials/ChangeStatusCampaign/ChangeStatusCampaign";

export default function SaleFlowList() {
  document.title = "Quy trình bán hàng";

  const navigate = useNavigate();
  const isMounted = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [listSaleFlow, setListSaleFlow] = useState<ICampaignResponseModel[]>([]);
  const [idSaleFlow, setIdSaleFlow] = useState<number>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDetailSaleFlow, setIsDetailSaleFlow] = useState<boolean>(false);
  const [showReportSaleFlow, setShowReportSaleFlow] = useState<boolean>(false);
  const [dataSaleFlow, setDataSaleFlow] = useState(null);
  const [isChangeStatus, setIsChangeStatus] = useState(false);

  const [params, setParams] = useState<any>({
    name: "",
  });

  const takeUrlCampaign = localStorage.getItem("backupCampaign");

  useEffect(() => {
    if (takeUrlCampaign) {
      const result = JSON.parse(takeUrlCampaign);
      // Tách phần query string từ URL
      const queryString = result.split("?")[1];

      // Tách các cặp key-value bằng dấu '&'
      const paramsArray = queryString.split("&");

      // Tạo một đối tượng lưu trữ tham số
      const paramsResult: any = {};

      // Lặp qua mỗi cặp key-value và thêm vào đối tượng params
      paramsArray.forEach((param) => {
        const [key, value] = param.split("=");
        paramsResult[key] = value;
      });

      setParams({
        ...params,
        campaignId: +paramsResult.campaignId,
        detail: paramsResult.detail ? true : false,
      } as any);

      setIdSaleFlow(+paramsResult.campaignId);
      setIsDetailSaleFlow(true);
    }
  }, [takeUrlCampaign]);

  useEffect(() => {
    if (params?.detail) {
      localStorage.removeItem("backupCampaign");
    }
  }, [params]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Quy trình bán hàng",
      is_active: true,
    },
  ]);

  const campaignFilterList = useMemo(
    () =>
      [
        // {
        //   key: "type",
        //   name: "Loại chiến dịch",
        //   type: "select",
        //   list: [
        //     {
        //       value: "",
        //       label: "Tất cả",
        //     },
        //     {
        //       value: "per",
        //       label: "Khách hàng cá nhân",
        //     },
        //     {
        //       value: "biz",
        //       label: "Khách hàng doanh nghiệp",
        //     },
        //   ],
        //   is_featured: true,
        //   value: searchParams.get("type") ?? "",
        // },
        {
          key: "departmentId",
          name: "Phòng ban",
          type: "select",
          is_featured: true,
          value: searchParams.get("departmentId") ?? "",
        },

        {
          key: "time",
          name: "Khoảng thời gian",
          type: "date-two",
          param_name: ["startDate", "endDate"],
          is_featured: true,
          value: searchParams.get("startDate") ?? "",
          value_extra: searchParams.get("endDate") ?? "",
          is_fmt_text: true,
        },

        {
          key: "saleId",
          name: "Người phụ trách",
          type: "select",
          is_featured: true,
          value: searchParams.get("saleId") ?? "",
        },

        {
          key: "status",
          name: "Trạng thái",
          type: "select",
          is_featured: true,
          list: [
            {
              value: "1",
              label: "Đang thực hiện",
            },
            {
              value: "0",
              label: "Tạm dừng",
            },
            {
              value: "-1",
              label: "Đã huỷ",
            },
          ],
          value: searchParams.get("status") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

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

  const getListCampaign = async (paramsSearch: ICampaignFilterRequest) => {
    setIsLoading(true);

    const response = await SaleFlowService.list(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setListSaleFlow(result.items);

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
      getListCampaign(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
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
          setIdSaleFlow(null);
          // setShowModalAdd(true);
          navigate("/create_sale_flow");
        },
      },
    ],
  };

  const getPercentTime = (item) => {
    // const startTime = item?.startDate ? new Date(moment(item?.startDate).format('MM/DD/YYYY HH:mm:ss')) : new Date();
    // const endTime = item?.endDate ? new Date(moment(item?.endDate).format('MM/DD/YYYY HH:mm:ss')) : new Date();

    const startTime = new Date(item?.startDate).getTime();
    const endTime = new Date(item?.endDate).getTime();
    const currentTime = new Date().getTime();
    const percentTime = currentTime <= startTime ? 100 : endTime - currentTime > 0 ? ((endTime - currentTime) / (endTime - startTime)) * 100 : 0;

    // console.log('percentTime', percentTime.toFixed(1));

    // console.log('campaignTime', endTime - startTime);
    // console.log('remainTime', endTime - currentTime);

    return +percentTime.toFixed(1);
  };

  const titles = [
    "STT",
    "Ảnh quy trình",
    "Tên quy trình",
    "Mã quy trình",
    "Bắt đầu",
    "Kết thúc",
    "Người phụ trách",
  ];

  const dataFormat = ["text-center", "text-center","", "", "text-center", "text-center", "", "",];

  const dataMappingArray = (item: ICampaignResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    <Image key={item.id} src={item.cover} alt={item.name} />,
    <Link
      key={item.id}
      to={`/management_opportunity?campaignId=${item.id}`}
      className="btn__navigation"
      onClick={() => {
        localStorage.setItem("campaignId", JSON.stringify(item.id));
        localStorage.setItem("campaignName", item.name);
        localStorage.setItem("campaignType", item.type);
      }}
    >
      {item.name}
    </Link>,
    item.code,
    item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : "",
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
    item.employeeName,
    // <div
    //   key={item.id}
    //   className="percent__finish--opportunity"
    //   onClick={() => {
    //     setShowReportSaleFlow(true);
    //     setDataSaleFlow(item);
    //   }}
    // >
    //   <CircularProgressbar value={getPercentTime(item) || 0} text={`${getPercentTime(item) || 0}%`} className="value-percent" />
    // </div>,
   
  ];

  const actionsTable = (item: ICampaignResponseModel): IAction[] => {
    return [
    //   {
    //     title: "Đổi trạng thái",
    //     icon: <Icon name="ResetPassword" className="icon-warning" />,
    //     callback: () => {
    //       setDataSaleFlow(item);
    //       setIsChangeStatus(true);
    //     },
    //   },
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" />,
        callback: () => {
          setIdSaleFlow(item.id);
          setIsDetailSaleFlow(true);
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setIdSaleFlow(item.id);
          // setShowModalAdd(true);
          navigate(`/edit_sale_flow/${item.id}`);
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

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        SaleFlowService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Hủy quy trình thành công", "success");
        getListCampaign(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const onDelete = async (id: number) => {
    const response = await SaleFlowService.delete(id);
    if (response.code === 0) {
      showToast("Xóa quy trình thành công", "success");
      getListCampaign(params);
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

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa quy trình",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-saleflow${isNoItem ? " bg-white" : ""}`}>
      {!isDetailSaleFlow && <TitleAction title="Quy trình bán hàng" titleActions={titleActions} />}

      {!isDetailSaleFlow ? (
        <div className="card-box d-flex flex-column">
          <SearchBox
            name="Tên quy trình"
            params={params}
            isSaveSearch={true}
            isFilter={true}
            listSaveSearch={listSaveSearch}
            listFilterItem={campaignFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />

          {!isLoading && listSaleFlow && listSaleFlow.length > 0 ? (
            <BoxTable
              name="Quy trình bán hàng"
              titles={titles}
              items={listSaleFlow}
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
                      Hiện tại chưa có quy trình bán hàng nào. <br />
                      Hãy thêm mới quy trình bán hàng đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới quy trình bán hàng"
                  action={() => {
                    setIdSaleFlow(null);
                    // setShowModalAdd(true);
                    // navigate("/create_sale_campaign");
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
        <div className="detail__saleflow">
          <div className="action-navigation">
            <div className="action-backup">
              <h1
                onClick={() => {
                  setIsDetailSaleFlow(false);
                  localStorage.removeItem("backupSaleFlow");
                }}
                className="title-first"
                title="Quay lại"
              >
                Quản lý quy trình
              </h1>
              <Icon name="ChevronRight" />
              <h1 className="title-last">Chi tiết quy trình</h1>
            </div>
          </div>
          {/* <DetailCampaign
            idCampaign={idCampaign}
            onShow={isDetailCampaign}
            onHide={(reload) => {
              if (reload) {
                // getListManagementOpportunity(params);
              }
            }}
          /> */}
        </div>
      )}
      {/* <AddCampaignModal
        onShow={showModalAdd}
        idData={idCampaign}
        onHide={(reload) => {
          if (reload) {
            getListCampaign(params);
          }
          setShowModalAdd(false);
        }}
      />

      <ReportCampaignModal
        onShow={showReportCampaign}
        dataCampaign={dataCampaign}
        onHide={(reload) => {
          // if (reload) {
          //   getListCampaign(params);
          // }
          setShowReportCampaign(false);
          setDataCampaign(null);
        }}
      />

      <ChangeStatusCampaign
        onShow={isChangeStatus}
        data={dataCampaign}
        onHide={(reload) => {
          if (reload) {
            getListCampaign(params);
          }
          setDataCampaign(null);
          setIsChangeStatus(false);
        }}
      /> */}
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
