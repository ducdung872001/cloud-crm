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
import AddCampaignModal from "./partials/AddCampaignModal/AddCampaignModal";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import Badge from "components/badge/badge";
import "./CampaignList.scss";
import DetailCampaign from "./partials/DetailCampaign/DetailCampaign";
import { CircularProgressbar } from "react-circular-progressbar";
import ReportCampaignModal from "./partials/ReportCampaign/ReportCampaignModal";
import { ContextType, UserContext } from "contexts/userContext";
import ChangeStatusCampaign from "./partials/ChangeStatusCampaign/ChangeStatusCampaign";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";

export default function CampaignList({ parentId, parentCampaign, setIsFullPage, isFullPage }) {
  document.title = "Quản lý chiến dịch";

  const navigate = useNavigate();
  const isMounted = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [listCampaign, setListCampaign] = useState<ICampaignResponseModel[]>([]);
  const [idCampaign, setIdCampaign] = useState<number>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDetailCampaign, setIsDetailCampaignDetail] = useState<boolean>(false);
  const [showReportCampaign, setShowReportCampaign] = useState<boolean>(false);
  const [dataCampaign, setDataCampaign] = useState(null);
  const [isChangeStatus, setIsChangeStatus] = useState(false);

  const [params, setParams] = useState<any>({
    name: "",
  });

  useEffect(() => {
    if (parentId == -1) {
      let paramNew = _.cloneDeep(params);
      delete paramNew["parentId"];
      setParams({ ...paramNew, campaignType: 2 });
    } else {
      setParams((prevParams) => ({ ...prevParams, parentId: parentId, campaignType: 1 }));
    }
  }, [parentId]);

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

      if (!paramsResult?.parentId) {
        let paramNew = _.cloneDeep(params);
        delete paramNew["parentId"];
        setParams({ ...paramNew, campaignType: +paramsResult.campaignType });
      } else {
        setParams((prevParams) => ({ ...prevParams, parentId: +paramsResult?.parentId, campaignType: +paramsResult.campaignType }));
      }
      setIdCampaign(+paramsResult.parentId);
    }
  }, []);

  useEffect(() => {
    if (params?.detail) {
      localStorage.removeItem("backupCampaign");
    } else {
      if (params?.parentId) {
        localStorage.setItem(
          "backupCampaign",
          JSON.stringify(`/sales_campaign?branchId=${dataBranch?.value}&parentId=${params?.parentId}&campaignType=${1}`)
        );
      } else {
        localStorage.setItem("backupCampaign", JSON.stringify(`/sales_campaign?branchId=${dataBranch?.value}&campaignType=${2}`));
      }
    }
  }, [params]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách chiến dịch",
      is_active: true,
    },
  ]);

  const campaignFilterList = useMemo(
    () =>
      [
        {
          key: "type",
          name: "Loại chiến dịch",
          type: "select",
          list: [
            {
              value: "",
              label: "Tất cả",
            },
            {
              value: "per",
              label: "Khách hàng cá nhân",
            },
            {
              value: "biz",
              label: "Khách hàng doanh nghiệp",
            },
          ],
          is_featured: true,
          value: searchParams.get("type") ?? "",
        },
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

  const getListCampaign = async (paramsSearch: ICampaignFilterRequest) => {
    setIsLoading(true);

    const response = await CampaignService.list(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setListCampaign(result.items);

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
      // {
      //   title: "Thêm mới",
      //   callback: () => {
      //     setIdCampaign(null);
      //     // setShowModalAdd(true);
      //     navigate("/create_sale_campaign");
      //   },
      // },
    ],
  };

  const getPercentTime = (item) => {
    // const startTime = item?.startDate ? new Date(moment(item?.startDate).format('MM/DD/YYYY HH:mm:ss')) : new Date();
    // const endTime = item?.endDate ? new Date(moment(item?.endDate).format('MM/DD/YYYY HH:mm:ss')) : new Date();

    const startTime = new Date(item?.startDate).getTime();
    const endTime = new Date(item?.endDate).getTime();
    const currentTime = new Date().getTime();
    const percentTime = currentTime <= startTime ? 100 : endTime - currentTime > 0 ? ((endTime - currentTime) / (endTime - startTime)) * 100 : 0;

    return +percentTime.toFixed(1);
  };

  const titles = [
    "STT",
    "Ảnh chiến dịch",
    "Tên chiến dịch",
    "Mã chiến dịch",
    "Bắt đầu",
    "Kết thúc",
    "Người phụ trách",
    "Thời gian còn lại",
    "Trạng thái",
  ];

  const dataFormat = ["text-center", "text-center", "", "", "", "", "", "text-center", "text-center"];

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
    <div
      key={item.id}
      className="percent__finish--opportunity"
      onClick={() => {
        setShowReportCampaign(true);
        setDataCampaign(item);
      }}
    >
      <CircularProgressbar value={getPercentTime(item) || 0} text={`${getPercentTime(item) || 0}%`} className="value-percent" />
    </div>,
    <Badge
      key={index}
      variant={item.status === 1 ? "success" : item.status === 0 ? "warning" : item.status === -1 ? "error" : "transparent"}
      text={item.status === 1 ? "Đang hiệu lực" : item.status === 0 ? "Tạm dừng" : item.status === -1 ? "Đã huỷ" : ""}
    />,
  ];

  const actionsTable = (item: ICampaignResponseModel): IAction[] => {
    return [
      {
        title: "Đổi trạng thái",
        icon: <Icon name="ResetPassword" className="icon-warning" />,
        callback: () => {
          setDataCampaign(item);
          setIsChangeStatus(true);
        },
      },
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" />,
        callback: () => {
          setIdCampaign(item.id);
          setIsDetailCampaignDetail(true);
          setDataCampaign(item);
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setIdCampaign(item.id);
          // setShowModalAdd(true);
          navigate(`/edit_sale_campaign/${item.id}`);
        },
      },
      // {
      //   title: "Xóa",
      //   icon: <Icon name="Trash" className="icon-error" />,
      //   callback: () => {
      //     showDialogConfirmDelete(item);
      //   },
      // },
    ];
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        CampaignService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Hủy chiến dịch thành công", "success");
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
    const response = await CampaignService.delete(id);
    if (response.code === 0) {
      showToast("Xóa chiến dịch thành công", "success");
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
      title: "Xóa chiến dịch",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-campaign${isNoItem ? " bg-white" : ""}`}>
      {!isDetailCampaign && !parentId ? <TitleAction title="Quản lý chiến dịch" titleActions={titleActions} /> : null}
      <div className="action-header">
        <Tippy content="Xem toàn trang" delay={[100, 0]} placement="left" animation="scale-extreme">
          <div className="add-work">
            <Button
              color="success"
              onClick={() => {
                setIsFullPage(!isFullPage);
              }}
            >
              {isFullPage ? <Icon name="FullscreenExit" /> : <Icon name="Fullscreen" />}
            </Button>
          </div>
        </Tippy>
        <Tippy content="Thêm chiến dịch" delay={[100, 0]} placement="left" animation="scale-extreme">
          <div className="full-page">
            <Button
              color="success"
              onClick={() => {
                navigate("/create_sale_campaign", { state: { parentCampaign: parentCampaign } });
              }}
            >
              <Icon name="PlusCircle" />
            </Button>
          </div>
        </Tippy>
      </div>

      {!isDetailCampaign ? (
        <div className="card-box d-flex flex-column">
          <SearchBox
            name="Tên, mã chiến dịch"
            params={params}
            isSaveSearch={true}
            isFilter={true}
            listSaveSearch={listSaveSearch}
            listFilterItem={campaignFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />

          {!isLoading && listCampaign && listCampaign.length > 0 ? (
            <BoxTable
              name="Quản lý chiến dịch"
              titles={titles}
              items={listCampaign}
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
                      Hiện tại chưa có chiến dịch bán hàng nào. <br />
                      Hãy thêm mới chiến dịch bán hàng đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới chiến dịch bán hàng"
                  action={() => {
                    setIdCampaign(null);
                    // setShowModalAdd(true);
                    navigate("/create_sale_campaign", { state: { parentCampaign: parentCampaign } });
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
        <div className="detail__campaign">
          <div className="action-navigation" style={{ marginTop: "1rem", marginLeft: "1rem" }}>
            <div className="action-backup">
              <h1
                onClick={() => {
                  setIsDetailCampaignDetail(false);
                  localStorage.removeItem("backupCampaign");
                }}
                className="title-first"
                title="Quay lại"
              >
                Quản lý chiến dịch
              </h1>
              <Icon name="ChevronRight" />
              <h1 className="title-last">{dataCampaign?.name}</h1>
            </div>
          </div>
          <DetailCampaign
            idCampaign={idCampaign}
            onShow={isDetailCampaign}
            onHide={(reload) => {
              if (reload) {
                // getListManagementOpportunity(params);
              }
            }}
          />
        </div>
      )}
      <AddCampaignModal
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
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
