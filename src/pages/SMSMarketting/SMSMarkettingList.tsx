import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { useSearchParams } from "react-router-dom";
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
import { trimContent, isDifferenceObj, getPageOffset, getSearchParameters } from "reborn-util";
import SendSMSService from "services/SendSMSService";
import { ISendSMSFilterRequest } from "model/sendSMS/SendSMSRequest";
import { ISendSMSResponseModel } from "model/sendSMS/SendSMSResponse";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import AddEditSendSMS from "pages/Common/AddEditSendSMS/AddEditSendSMS";
import { getPermissions } from "utils/common";

import "tippy.js/animations/scale.css";
import "./SMSMarkettingList.scss";

export default function SMSMarkettingList() {
  document.title = "SMS Marketing";

  const isMounted = useRef(false);

  const takeParamsUrl = getSearchParameters();
  const customerIdlistUrl = (takeParamsUrl && takeParamsUrl?.customerIdlist?.replace(/\%2C/g, ",").split(",")) || [];
  const customerIdlist = customerIdlistUrl.map((item) => {
    return +item;
  });

  const mbtId = (takeParamsUrl && takeParamsUrl?.mbtId);

  const [searchParams, setSearchParams] = useSearchParams();
  const [listSMSMarketing, setListSMSMarketing] = useState<ISendSMSResponseModel[]>([]);
  const [idSendSMS, setIdSendSMS] = useState<number>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [showPageSendSMS, setShowPageSendSMS] = useState<boolean>(false);
  const [checkadd, setCheckAdd] = useState(false);
  const [permissions, setPermissions] = useState(getPermissions());

  useEffect(() => {
    if (customerIdlist && customerIdlist.length > 0) {
      setShowPageSendSMS(true);
    } else {
      if (!checkadd) {
        setShowPageSendSMS(false);
      }
    }

    if(mbtId){
      setShowPageSendSMS(true);
    }
  }, [customerIdlist, checkadd, mbtId ]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách yêu cầu gửi SMS",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_buy",
        name: "Thời gian gửi gần nhất",
        type: "date-two",
        param_name: ["startDate", "endDate"],
        is_featured: true,
        value: searchParams.get("startDate") ?? "",
        value_extra: searchParams.get("endDate") ?? "",
        is_fmt_text: true,
      },
      {
        key: "templateId",
        name: "Chủ đề",
        type: "select",
        is_featured: true,
        value: searchParams.get("templateId") ?? "",
      },
      {
        key: "receiverType",
        name: "Tiêu chí gửi",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "1",
            label: "Gửi cho tất cả",
          },
          {
            value: "2",
            label: "Gửi theo tiêu chí",
          },
          {
            value: "3",
            label: "Gửi cụ thể cho 1 số khách hàng",
          },
        ],
        value: searchParams.get("receiverType") ?? "",
      },
      {
        key: "status",
        name: "Trạng thái tin nhắn",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "-1",
            label: "Tất cả",
          },
          {
            value: "1",
            label: "Đang chờ gửi",
          },
          {
            value: "2",
            label: "Đã hoàn thành",
          },
        ],
        value: searchParams.get("status") ?? "",
      },
      {
        key: "statusAction",
        name: "Trạng thái phê duyệt",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "-1",
            label: "Tất cả",
          },
          {
            value: "0",
            label: "Chờ phê duyệt",
          },
          {
            value: "1",
            label: "Đã phê duyệt",
          },
          {
            value: "2",
            label: "Hủy yêu cầu",
          },
        ],
        value: searchParams.get("statusAction") ?? "",
      },
    ],
    [searchParams]
  );

  const [params, setParams] = useState<ISendSMSFilterRequest>({
    query: "",
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "sms marketing",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListSMSMarketing = async (paramsSearch: ISendSMSFilterRequest) => {
    setIsLoading(true);

    const response = await SendSMSService.listSendSMS(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListSMSMarketing(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && !params.query && +result.page === 1) {
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
      getListSMSMarketing(params);
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
      permissions["SMS_REQUEST_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setIdSendSMS(null);
          setShowPageSendSMS(true);
          setCheckAdd(true);
        },
      },
    ],
  };

  const titles = [
    "STT",
    "Người yêu cầu gửi",
    "Thời gian yêu cầu",
    "Nội dung",
    "Thời gian gửi",
    "Trạng thái tin nhắn",
    "Đầu số",
    "Trạng thái phê duyệt",
  ];

  const dataFormat = ["text-center", "", "", "", "", "text-center", "", "text-center"];

  const dataSize = ["auto", "auto", "auto", 30, "auto", "auto", "auto", "auto"];

  const dataMappingArray = (item: ISendSMSResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.employeeName,
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY HH:mm") : "",
    <span key={item.id}>
      {item.content && item.content.length > 52 ? (
        <Fragment>
          <Tippy content={item.content} delay={[120, 100]} animation="scale">
            <span style={{ cursor: "pointer" }}>{trimContent(item.content, 52, true, true)}</span>
          </Tippy>
        </Fragment>
      ) : (
        item.content
      )}
    </span>,
    item.timeAt ? moment(item.timeAt).format("DD/MM/YYYY HH:mm") : "",
    item.status == 1 ? <span className="pending-status">Đang chờ gửi</span> : <span className="success-status">Đã hoàn thành</span>,
    item.brandName,
    item.statusAction === 0 ? (
      <span className="send-pending">Chờ phê duyệt</span>
    ) : item.statusAction === 1 ? (
      <span className="send-success">Đã phê duyệt</span>
    ) : (
      <span className="send-cancel">Hủy yêu cầu</span>
    ),
  ];

  const actionsTable = (item: ISendSMSResponseModel): IAction[] => {
    return [
      ...(item.statusAction == 0
        ? ([
            permissions["SMS_REQUEST_IMPORT"] == 1 && {
              title: "Phê duyệt",
              icon: <Icon name="FingerTouch" className="icon-warning" />,
              callback: () => {
                onApprove(item.id);
              },
            },
            permissions["SMS_REQUEST_UPDATE"] == 1 && {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setIdSendSMS(item.id);
                setShowPageSendSMS(true);
                setCheckAdd(true);
              },
            },
            permissions["SMS_REQUEST_DELETE"] == 1 && {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ] as IAction[])
        : item.statusAction == 1
        ? ([
            permissions["SMS_REQUEST_IMPORT"] == 1 && {
              title: "Hủy yêu cầu",
              icon: <Icon name="TimesCircle" className="icon-error" />,
              callback: () => {
                showDialogConfirmCancel(item);
              },
            },
          ] as IAction[])
        : []),
    ];
  };

  const onCancel = async (id) => {
    const response = await SendSMSService.cancelSMS(id);

    if (response.code === 0) {
      showToast("Hủy yêu cầu thành công", "success");
      getListSMSMarketing(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmCancel = (item?: ISendSMSResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Hủy yêu cầu...</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy yêu cầu? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => onCancel(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const onApprove = async (id) => {
    const response = await SendSMSService.approveSMS(id);

    if (response.code === 0) {
      showToast("Phê duyệt thành công", "success");
      getListSMSMarketing(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onDelete = async (id: number) => {
    const response = await SendSMSService.deleteSendSMS(id);

    if (response.code === 0) {
      showToast("Xóa sms marketing thành công", "success");
      getListSMSMarketing(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ISendSMSResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "yêu cầu gửi sms marketting từ " : `${listIdChecked.length} sms marketting`}
          {item ? <strong>{item.employeeName}</strong> : ""}? Thao tác này không thể khôi phục.
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
    permissions["SMS_REQUEST_DELETE"] == 1 && {
      title: "Xóa sms marketing",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <Fragment>
      <div className={`page-content page--sms-marketing${isNoItem ? " bg-white" : ""}${showPageSendSMS ? " d-none" : ""}`}>
        <TitleAction title="SMS Marketing" titleActions={titleActions} />
        <div className="card-box d-flex flex-column">
          <SearchBox
            name="Nội dung"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            isFilter={true}
            listFilterItem={customerFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listSMSMarketing && listSMSMarketing.length > 0 ? (
            <BoxTable
              name="SMS Marketing"
              titles={titles}
              items={listSMSMarketing}
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
              {isNoItem ? (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có sms marketing nào. <br />
                      Hãy thêm mới sms marketing đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới sms marketing"
                  action={() => {
                    setIdSendSMS(null);
                    setShowPageSendSMS(true);
                    setCheckAdd(true);
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
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
      <div className={`${showPageSendSMS ? "" : "d-none"}`}>
        <AddEditSendSMS
          onShow={showPageSendSMS}
          idSendSMS={idSendSMS}
          onHide={(isHide) => {
            if (isHide) {
              getListSMSMarketing(params);
            }
            setShowPageSendSMS(false);
            setCheckAdd(false);
          }}
          onBackProps={() => setShowPageSendSMS(false)}
          customerIdList={customerIdlist}
        />
      </div>
    </Fragment>
  );
}
