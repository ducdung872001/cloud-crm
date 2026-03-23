import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { showToast } from "utils/common";
import { isDifferenceObj, getPageOffset, getSearchParameters } from "reborn-util";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import Badge from "components/badge/badge";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { getPermissions } from "utils/common";

// TODO: Khi API sẵn sàng, thay 3 dòng dưới bằng:
// import AppNotificationService from "services/AppNotificationService";
// import { IAppNotificationFilterRequest } from "model/appNotification/AppNotificationRequest";
// import { IAppNotificationResponseModel } from "model/appNotification/AppNotificationResponse";
import AppNotificationService, {
  IAppNotificationFilterRequest,
  IAppNotificationResponseModel,
} from "./AppNotificationMock";

import "./AppNotification.scss";

export default function AppNotificationList(props) {
  document.title = "Thông báo App";

  const isMounted = useRef(false);
  const { onBackProps } = props;
  const navigate = useNavigate();
  const takeParamsUrl = getSearchParameters();

  const [searchParams, setSearchParams] = useSearchParams();
  const [listAppNotification, setListAppNotification] = useState<IAppNotificationResponseModel[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [idNotification, setIdNotification] = useState<number>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [showCampaignModal, setShowCampaignModal] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  // Stats state
  const [stats, setStats] = useState({
    running: 2,
    totalSent: 5430,
    totalSentChange: 18,
    openRate: 71,
    openRateChange: 3,
    clickRate: 34,
  });

  // Form state
  const [campaignName, setCampaignName] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [messageContent, setMessageContent] = useState("");
  const [sendTime, setSendTime] = useState("");
  const [promoCode, setPromoCode] = useState("none");

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Lịch sử gửi",
      is_active: true,
    },
  ]);

  const filterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_send",
        name: "Ngày gửi",
        type: "date-two",
        param_name: ["startDate", "endDate"],
        is_featured: true,
        value: searchParams.get("startDate") ?? "",
        value_extra: searchParams.get("endDate") ?? "",
        is_fmt_text: true,
      },
      {
        key: "channel",
        name: "Kênh",
        type: "select",
        is_featured: true,
        list: [
          { value: "sms", label: "SMS" },
          { value: "zalo", label: "Zalo" },
          { value: "email", label: "Email" },
          { value: "app", label: "App" },
        ],
        value: searchParams.get("channel") ?? "",
      },
      {
        key: "status",
        name: "Trạng thái",
        type: "select",
        is_featured: true,
        list: [
          { value: "-1", label: "Tất cả" },
          { value: "1", label: "Đang chạy" },
          { value: "2", label: "Hoàn thành" },
          { value: "3", label: "Đã hủy" },
        ],
        value: searchParams.get("status") ?? "",
      },
    ],
    [searchParams]
  );

  const [params, setParams] = useState<IAppNotificationFilterRequest>({
    query: "",
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "thông báo app",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListAppNotification = async (paramsSearch: IAppNotificationFilterRequest) => {
    setIsLoading(true);

    const response = await AppNotificationService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListAppNotification(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && !params?.query && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListAppNotification(params);
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
        title: "+ Tạo chiến dịch",
        callback: () => {
          setCampaignName("");
          setTargetAudience("all");
          setMessageContent("");
          setSendTime("");
          setPromoCode("none");
          setShowCampaignModal(true);
        },
      },
    ],
  };

  const titles = ["Chiến dịch", "Kênh", "Đã gửi", "Tỷ lệ mở", "Ngày", "TT"];

  const dataFormat = ["", "text-center", "text-right", "text-center", "", "text-center"];

  const dataSize = [30, "auto", "auto", "auto", "auto", "auto"];

  const dataMappingArray = (item: IAppNotificationResponseModel, index: number) => [
    item.name,
    <span key={`channel-${item.id}`} className={`channel-badge channel-badge--${item.channel?.toLowerCase()}`}>
      {item.channel}
    </span>,
    item.totalSent?.toLocaleString("vi-VN"),
    <span key={`rate-${item.id}`} className={`open-rate ${item.openRate >= 70 ? "open-rate--high" : item.openRate >= 50 ? "open-rate--medium" : "open-rate--low"}`}>
      {item.openRate}%
    </span>,
    item.sendDate ? moment(item.sendDate).format("DD/MM/YYYY") : "",
    <Badge
      key={item.id}
      text={item.status === 1 ? "Đang chạy" : item.status === 2 ? "Hoàn thành" : "Đã hủy"}
      variant={item.status === 1 ? "warning" : item.status === 2 ? "success" : "error"}
    />,
  ];

  const actionsTable = (item: IAppNotificationResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setIdNotification(item.id);
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
    ];
  };

  const onDelete = async (id: number) => {
    const response = await AppNotificationService.delete(id);

    if (response.code === 0) {
      showToast("Xóa chiến dịch thành công", "success");
      getListAppNotification(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IAppNotificationResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa chiến dịch...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa chiến dịch <strong>{item?.name}</strong>? Thao tác này không thể khôi phục.
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

  const onDeleteAll = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    const arrPromises = selectedIds.map((selectedId) => {
      const found = listAppNotification.find((item) => item.id === selectedId);
      if (found?.id) {
        return AppNotificationService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
      .then((results) => {
        const deleted = results.filter(Boolean)?.length || 0;
        if (deleted > 0) {
          showToast(`Xóa thành công ${deleted} chiến dịch`, "success");
          getListAppNotification(params);
          setListIdChecked([]);
        } else {
          showToast("Không có chiến dịch nào được xóa", "error");
        }
      })
      .finally(() => {
        setShowDialog(false);
        setContentDialog(null);
      });
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["APP_NOTIFICATION_DELETE"] == 1 && {
      title: "Xóa chiến dịch",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const handleSendNow = () => {
    if (!campaignName || !messageContent) {
      showToast("Vui lòng nhập tên chiến dịch và nội dung tin nhắn", "error");
      return;
    }
    showToast("Đang gửi chiến dịch...", "success");
  };

  const handleSchedule = () => {
    if (!campaignName || !messageContent || !sendTime) {
      showToast("Vui lòng nhập đầy đủ thông tin và thời gian gửi", "error");
      return;
    }
    showToast("Đã lên lịch gửi chiến dịch", "success");
  };

  const handlePreview = () => {
    showToast("Tính năng xem trước đang phát triển", "success");
  };

  return (
    <Fragment>
      <div className="page-content page--app-notification">
        <HeaderTabMenu
          title="🔔 Thông báo App"
          titleBack="Chiến dịch Marketing"
          onBackProps={onBackProps}
          titleActions={titleActions}
        />

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stats-card stats-card--green">
            <div className="stats-card__content">
              <p className="stats-card__label">Đang chạy</p>
              <p className="stats-card__value">{stats.running}</p>
            </div>
            <div className="stats-card__icon stats-card__icon--green">
              <Icon name="Rocket" />
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-card__content">
              <p className="stats-card__label">Tổng tin đã gửi</p>
              <p className="stats-card__value stats-card__value--blue">
                {stats.totalSent.toLocaleString("vi-VN")}
              </p>
              <p className="stats-card__change stats-card__change--up">
                ↑ {stats.totalSentChange}% so với tháng trước
              </p>
            </div>
            <div className="stats-card__icon stats-card__icon--blue">
              <Icon name="Send" />
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-card__content">
              <p className="stats-card__label">Tỷ lệ mở</p>
              <p className="stats-card__value stats-card__value--orange">{stats.openRate}%</p>
              <p className="stats-card__change stats-card__change--up">
                ↑ {stats.openRateChange}% so với tháng trước
              </p>
            </div>
            <div className="stats-card__icon stats-card__icon--orange">
              <Icon name="Eye" />
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-card__content">
              <p className="stats-card__label">Tỷ lệ nhấp</p>
              <p className="stats-card__value stats-card__value--purple">{stats.clickRate}%</p>
            </div>
            <div className="stats-card__icon stats-card__icon--purple">
              <Icon name="MousePointer" />
            </div>
          </div>
        </div>

        {/* Campaign Modal */}
        {showCampaignModal && (
          <div className="campaign-modal__overlay" onClick={() => setShowCampaignModal(false)}>
            <div className="campaign-modal__box" onClick={(e) => e.stopPropagation()}>
              <div className="campaign-modal__header">
                <h3 className="campaign-modal__title">✍️ Soạn chiến dịch mới</h3>
                <button className="campaign-modal__close" onClick={() => setShowCampaignModal(false)}>
                  <Icon name="X" />
                </button>
              </div>

              <div className="campaign-modal__body">
                <div className="campaign-form__row">
                  <div className="campaign-form__field">
                    <label className="campaign-form__label">Tên chiến dịch</label>
                    <input
                      type="text"
                      className="campaign-form__input"
                      placeholder="VD: Flash Sale App tháng 3"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                    />
                  </div>
                  <div className="campaign-form__field">
                    <label className="campaign-form__label">Đối tượng gửi</label>
                    <select
                      className="campaign-form__select"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    >
                      <option value="all">Tất cả thành viên</option>
                      <option value="new">Khách hàng mới</option>
                      <option value="loyal">Khách hàng thân thiết</option>
                      <option value="inactive">Khách hàng không hoạt động</option>
                    </select>
                  </div>
                </div>

                <div className="campaign-form__field campaign-form__field--full">
                  <label className="campaign-form__label">Nội dung tin nhắn</label>
                  <textarea
                    className="campaign-form__textarea"
                    placeholder="Nhập nội dung gửi qua App..."
                    value={messageContent}
                    onChange={(e) => {
                      if (e.target.value.length <= 160) setMessageContent(e.target.value);
                    }}
                    rows={4}
                  />
                  <span className="campaign-form__char-count">{messageContent.length}/160 ký tự</span>
                </div>

                <div className="campaign-form__row">
                  <div className="campaign-form__field">
                    <label className="campaign-form__label">Thời gian gửi</label>
                    <input
                      type="datetime-local"
                      className="campaign-form__input"
                      value={sendTime}
                      onChange={(e) => setSendTime(e.target.value)}
                    />
                  </div>
                  <div className="campaign-form__field">
                    <label className="campaign-form__label">Mã khuyến mãi đính kèm</label>
                    <select
                      className="campaign-form__select"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    >
                      <option value="none">Không đính kèm</option>
                      <option value="SALE10">SALE10 - Giảm 10%</option>
                      <option value="SALE20">SALE20 - Giảm 20%</option>
                      <option value="FREESHIP">FREESHIP - Miễn phí vận chuyển</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="campaign-modal__footer">
                <button className="btn btn--preview" onClick={handlePreview}>
                  <Icon name="Eye" /> Xem trước
                </button>
                <button className="btn btn--schedule" onClick={handleSchedule}>
                  <Icon name="Calendar" /> Lên lịch
                </button>
                <button className="btn btn--send" onClick={handleSendNow}>
                  <Icon name="Send" /> Gửi ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="card-box d-flex flex-column">
          {/* <div className="history-header">
            <h3 className="history-header__title">Lịch sử gửi</h3>
          </div> */}
          <SearchBox
            name="Chiến dịch"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            isFilter={true}
            listFilterItem={filterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listAppNotification && listAppNotification.length > 0 ? (
            <BoxTable
              name="Thông báo App"
              titles={titles}
              items={listAppNotification}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              listIdChecked={listIdChecked}
              bulkActionItems={bulkActionList}
              isBulkAction={true}
              striped={true}
              setListIdChecked={(listId) => setListIdChecked(listId)}
              actions={actionsTable}
              actionType="inline"
              dataSize={dataSize}
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
                      Hãy tạo chiến dịch đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Tạo chiến dịch mới"
                  action={() => setIdNotification(null)}
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

        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </Fragment>
  );
}