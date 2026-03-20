import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import "./NotificationList.scss";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IOption, ISaveSearch } from "model/OtherModel";
import { IContractPipelineResponse } from "model/contractPipeline/ContractPipelineResponseModel";
import { showToast } from "utils/common";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import _, { set } from "lodash";
import HeaderFilter from "components/HeaderFilter/HeaderFilter";
import { ContextType, UserContext } from "contexts/userContext";
import Tippy from "@tippyjs/react";
import moment from "moment";
import Icon from "components/icon";
import RadioList from "components/radio/radioList";
import CheckboxList from "components/checkbox/checkboxList";
import SelectCustom from "components/selectCustom/selectCustom";
import WorkProjectService from "services/WorkProjectService";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Button from "components/button/button";
import NotificationService from "services/NotificationService";
import Loading from "components/loading";
import { Navigate, useNavigate } from "react-router-dom";
import ProjectRealtyService from "services/ProjectRealtyService";
import ModalViewNoti from "./ModalViewNoti/ModalViewNoti";
import BeautyBranchService from "services/BeautyBranchService";


// 1 - Cong viec trong QT
// 2 - Cong viec ngoai QT
// 3 - Thong bao He thong
// 4 - Yêu cầu làm rõ (Từ portal/Từ Cổng đấu thầu)
// 5 - Phản hồi Yêu cầu làm rõ (Phản hồi nhà thầu)

export default function NotificationList(props: any) {
  document.title = "Thông báo";

  const navigate = useNavigate();
  const isMounted = useRef(false);
  const { dataInfoEmployee, countUnread, setCountUnread } = useContext(UserContext) as ContextType;

  const [listNotification, setListNotification] = useState([]);

  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalSetting, setShowModalSetting] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [dataProject, setDataProject] = useState(null);
  const [statusWork, setStatusWork] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notifyType, setNotifyType] = useState('-1');
  const [listNofifyType, setListNotifyType] = useState('1,2,3');
  // console.log('listNofifyType', listNofifyType);
  // const [countUnread, setCountUnread] = useState(null);
  const [isModalViewNoti, setIsModalViewNoti] = useState(false)
  const [dataNoti, setDataNoti] = useState(null);

  const [params, setParams] = useState<any>({
    title: "",
    limit: 10,
    page: 1,
    notiTypes: '1,2,3'
  });
  const [hasMore, setHasMore] = useState<boolean>(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "thông báo",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListNotify = async (paramsSearch: any, disableLoading?: boolean) => {

    if (!disableLoading) {
      // setIsLoading(true);
    }

    const response = await NotificationService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      // setListNotification(result?.items);
      // setHasMore((params.page - 1) * 10 + (result.items.length || 0) < result.total);

      const newDataList = params.page === 1 ? [] : listNotification;

      (result.items || []).map((item) => {
        newDataList.push(item);
      });

      setListNotification(newDataList);
      setHasMore(result?.loadMoreAble);

      // setPagination({
      //   ...pagination,
      //   page: +result.page,
      //   sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
      //   totalItem: +result.total,
      //   totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      // });

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
    setIsLoadingMore(false);
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
      getListNotify(params);
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

  const onDelete = async (id: number) => {
    const response = await NotificationService.delete(id);

    if (response.code === 0) {
      showToast("Xóa thông báo thành công", "success");
      getListNotify(params);
      setIsLoading(true);
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
        NotificationService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa thông báo thành công", "success");
        getListNotify(params);
        setIsLoading(true);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IContractPipelineResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "thông bao " : `${listIdChecked.length} thông báo đã chọn`}
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
      title: "Xóa thông báo",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const loadedOptionProject = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
              return {
                value: item.id,
                label: item.name,
              };
            })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const formatOptionLabelStatus = ({ label, value }) => {
    return (
      <div className="icon_status">
        <div className="icon">
          {/* <img src={avatar || ImageThirdGender} alt={label} /> */}
          <Icon
            name={value === '0' ? 'NewWork' : value === '1' ? 'ExpireWork' : value === '4' ? 'PauseWork' : value === '2' ? 'CompleteWork' : value === '3' ? 'CancelWork' : ''}
            style={{
              // width: 15, 
              // height: 15, 
              // fill: value === -1 ? '#015aa4' : value === 1 ? '#FDE047' : 'var(--extra-color-30)',
              marginTop: -4,
              marginRight: 5
            }}
          />
        </div>
        <div>
          {label}
        </div>
      </div>
    );
  };

  const handleScroll = (event) => {
    const scrollTop = Math.round(event.target.scrollTop || 0);
    // console.log('scrollTop', scrollTop);
    const clientHeight = Math.round(event.target.clientHeight || 0);
    const scrollHeight = Math.round(event.target.scrollHeight || 0);

    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    if (scrollBottom === 0 && hasMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setParams((preState) => ({ ...preState, page: params.page + 1 }));
      }, 1000);
    }
    //TODO: đoạn này là check đk, nếu như mà hết page rồi thì thôi ko phân trang nữa
    // console.log("cái mình cần : ", scrollTop === 0 && hasMore);
    if (scrollTop === 0 && hasMore) {
      //Tăng lên rồi gọi api
    }

  };

  const handleReset = () => {
    setNotifyType('-1');
    setListNotifyType('1,2,3');
    setDataProject(null);
    setStatusWork(null);
    setStartDate(null);
    setEndDate(null);
    setIsLoading(true);
    setParams({
      title: "",
      limit: 10,
      page: 1,
      notiTypes: '1,2,3'
    })
  }

  const onUnread = async (id: number) => {
    const response = await NotificationService.updateUnread({ id: id });
    if (response.code === 0) {
      console.log('Đã đọc');
      // showToast("Xóa thông báo thành công", "success");
      getListNotify(params);
      getCountUnread();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onReadAll = async () => {
    const body = {

    }
    const response = await NotificationService.updateReadAll(body);
    if (response.code === 0) {
      console.log('Đã đọc hết');
      // showToast("Đánh dấu đã đọc thành công", "success");
      getListNotify(params);
      getCountUnread();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getCountUnread = async () => {
    const response = await NotificationService.countUnread();
    if (response.code === 0) {
      const result = response.result;
      setCountUnread(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getCountUnread();
  }, [])

  const onFilter = () => {
    setParams({
      ...params,
      page: 1,
      unread: notifyType,
      notiTypes: listNofifyType,
      // ...(listNofifyType ? {notiTypes: listNofifyType} : {}),
      ...(dataProject ? { branchId: dataProject?.value } : {}),
      ...(statusWork ? { status: statusWork?.value } : {}),
      ...(startDate ? { fromTime: moment(startDate).format('DD/MM/YYYY') } : {}),
      ...(endDate ? { toTime: moment(endDate).format('DD/MM/YYYY') } : {}),
    });
    setIsLoading(true);
  };

  function isJsonString(str) {
    try {
      const parsed = JSON.parse(str);
      return typeof parsed === 'object' && parsed !== null;
    } catch (e) {
      return false;
    }
  }

  /** Navigate based on targetLink or payload type from the new API */
  const handleNotificationClick = (item: any) => {
    if (item.unread) {
      onUnread(item.id);
    }
    if (item.targetLink) {
      navigate(item.targetLink);
      return;
    }
    if (item.payload && isJsonString(item.payload)) {
      const payload = JSON.parse(item.payload);
      switch (payload?.type) {
        case "ORDER":
          if (payload.orderId) navigate(`/orders/${payload.orderId}`);
          break;
        case "CAMPAIGN":
          if (payload.campaignId) navigate(`/campaigns/${payload.campaignId}`);
          break;
        case "BID":
          if (payload.packageId)
            navigate("/bpm/bid_management", { state: { viewDetail: true, packageId: payload.packageId } });
          break;
        case "TASK":
          if (payload.workId)
            navigate("/bpm/task_assignment", { state: { viewDetail: true, workId: payload.workId } });
          break;
        default:
          break;
      }
    }
  };

  /** Pick icon name based on payload.type */
  const getNotificationIconName = (item: any): string => {
    if (item.payload && isJsonString(item.payload)) {
      const payload = JSON.parse(item.payload);
      switch (payload?.type) {
        case "ORDER": return "Order";
        case "CAMPAIGN": return "Promotion";
        case "BID": return "NotifyExpire";
        case "TASK": return "NotifySetting";
        case "TEST_PUSH": return "NotifyRox";
        default: break;
      }
    }
    return "NotifySetting";
  };

  /** Render a single notification item */
  const renderNotificationItem = (item: any) => {
    const isUnread = !!item.unread;
    const iconName = getNotificationIconName(item);
    return (
      <div
        key={item.id}
        className={isUnread ? "item-notification-unread" : "item-notification"}
        onClick={() => handleNotificationClick(item)}
      >
        <Icon name={iconName} />
        <div className="body-notification">
          <div className="title-notification">
            <div className="box-title">
              <span className="title">{item.messageTitle || "Thông báo"}</span>
            </div>
            {isUnread ? <div className="icon-red" /> : null}
          </div>
          {item.messageText ? (
            <div className="content-notification">
              <span className="content">{item.messageText}</span>
            </div>
          ) : null}
          <div className="footer-notification">
            <span className="time">{item.sentAt ? moment(item.sentAt).format("DD/MM/YYYY - HH:mm") : ""}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-content page-notification-list card-box">
      <div style={{ paddingTop: '20px' }}>
        <TitleAction title="Thông báo" />
      </div>

      <div className="container-page">

        {listNotification && listNotification.length > 0 && !isLoading ?
          <div className="container-notification">
            <div className="header-notification">
              <div>
                <span className="text-unRead">{countUnread ? `Có ${countUnread} thông báo chưa đọc` : ''}</span>
              </div>
              <div
                onClick={() => {
                  onReadAll();
                }}
              >
                <span className="text-Read">Đánh dấu là đã đọc</span>
              </div>
            </div>

            <div className="list-notification" onScroll={handleScroll} >
              {/* <div className="item-notification-unread">
                <Icon name='NotifySetting'/>
                <div className="body-notification">
                  <div className="title-notification">
                    <span className="title">Thông báo bảo trì hệ thống</span>
                    <div className="icon-red"/>
                  </div>
                  <div className="content-notification">
                    <span className="content">Thời gian bảo trì hệ thống từ  01/01/2025 - 20:00  tới 02/01/2025 - 00:00</span>
                  </div>
                  <div className="footer-notification">
                    <span className="time">7/08/2023 - 09:10 </span>
                  </div>
                </div>
              </div> */}
              {listNotification.map((item) => renderNotificationItem(item))}

              {isLoadingMore ?
                <div className="icon-loading-more">
                  <Loading />
                </div>
                : null}
            </div>
          </div>
          :
          <div className="no-notification">
            {isLoading
              ? <Loading />
              :
              <SystemNotification
                description={
                  <span>
                    Không có thông báo nào.
                  </span>
                }
                type="no-item"
              />
            }
          </div>
        }

        <div className="container-filter">
          <div className="title-filter">
            <Icon name='Funnel' />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Bộ lọc</span>
          </div>

          <div className="notify-type">
            <RadioList
              name="unread"
              title=""
              options={[
                {
                  value: '-1',
                  label: "Tất cả",
                },
                {
                  value: '1',
                  label: "Thông báo chưa đọc",
                },
              ]}
              value={notifyType}
              onChange={(e) => {
                setNotifyType(e.target.value);
              }}
            />
          </div>

          <div className="notify-type">
            <CheckboxList
              title={""}
              value={listNofifyType}
              options={[
                {
                  value: '1',
                  label: "Thông báo sản phẩm",
                },
                {
                  value: '2',
                  label: "Thông báo hết hạn",
                },
                {
                  value: '3',
                  label: "Thông báo vận chuyển",
                },
              ]}
              onChange={(e) => {
                console.log('e', e);
                if (e) {
                  setListNotifyType(e);
                } else {
                  setListNotifyType(listNofifyType);
                }

              }}
            />
          </div>

          <div className="form-filter">
            <SelectCustom
              id=""
              name=""
              label={'Chi nhánh'}
              fill={true}
              value={dataProject}
              options={[]}
              onChange={(e) => {
                setDataProject(e);
              }}
              isAsyncPaginate={true}
              placeholder="Chọn chi nhánh"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionProject}
            />
          </div>

          <div className="form-filter">
            <SelectCustom
              id="status"
              name="status"
              label={'Trạng thái đơn hàng'}
              special={true}
              fill={true}
              value={statusWork}
              options={[
                {
                  value: '0',
                  label: 'Cần xử lý'
                },
                {
                  value: '1',
                  label: 'Mới tiếp nhận'
                },
                {
                  value: '2',
                  label: 'Đã hoàn thành'
                },
                {
                  value: '4',
                  label: 'Tạm dừng/tiếp tục'
                },
                {
                  value: '3',
                  label: 'Đã hủy'
                },
                {
                  value: '5',
                  label: 'Sắp tới hạn'
                },
                {
                  value: '6',
                  label: 'Quá hạn'
                },
              ]}
              onChange={(e) => {
                setStatusWork(e);
              }}
              isAsyncPaginate={false}
              placeholder="Chọn trạng thái công việc"
            // additional={{
            //   page: 1,
            // }}
            // loadOptionsPaginate={loadedOptionCodeService}
            // formatOptionLabel={formatOptionLabelStatus}
            />
          </div>

          <div className="filter_time">
            <span style={{ fontSize: 14, fontWeight: '600', color: '#939394' }}>Khoảng thời gian</span>
            <div className="body_time">
              <div style={{ width: '49%' }}>
                <DatePickerCustom
                  label="Từ ngày:"
                  name="the_day"
                  fill={true}
                  required={false}
                  isFmtText={true}
                  value={startDate ? moment(startDate).format("DD/MM/YYYY") : ''}
                  onChange={(e) => {
                    setStartDate(e);
                  }}
                  // disabled={formData.never !== "1"}
                  placeholder="DD/MM/YYYY"
                  maxDate={endDate}
                />
              </div>
              <div style={{ width: '49%' }}>
                <DatePickerCustom
                  label="Đến ngày:"
                  name="the_day"
                  fill={true}
                  required={false}
                  isFmtText={true}
                  value={endDate ? moment(endDate).format("DD/MM/YYYY") : ''}
                  onChange={(e) => {
                    setEndDate(e);
                  }}
                  // disabled={formData.never !== "1"}
                  placeholder="DD/MM/YYYY"
                  minDate={startDate}
                />
              </div>
            </div>
          </div>

          <div className="action__confirm">
            <Button
              variant="outline"
              onClick={() => {
                handleReset();
              }}
              className='button_cancel'
            >
              Đặt lại
            </Button>
            <Button
              // disabled={_.isEqual(dataConfirm, lstFieldActive)}
              onClick={() => {
                onFilter();
              }}
              className='button_apply'
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </div>

      <ModalViewNoti
        onShow={isModalViewNoti}
        data={dataNoti}
        onHide={(reload) => {
          if (reload) {
            // getListNotify(params);
          }
          setIsModalViewNoti(false);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
