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
import SendEmailService from "services/SendEmailService";
import { ISendEmailFilterRequest } from "model/sendEmail/SendEmailRequest";
import { ISendEmailResponseModel } from "model/sendEmail/SendEmailResponse";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import AddEditSendEmail from "pages/Common/AddEditSendEmail/AddEditSendEmail";
import { getPermissions } from "utils/common";

import "./EmailMarkettingList.scss";
import { IDeclareEmailFilterRequest } from "model/declareEmail/DeclareEmailRequestModel";
import EmailConfigService from "services/EmailConfigService";
import Badge from "components/badge/badge";

export default function EmailMarkettingList() {
  document.title = "Email Marketing";

  const isMounted = useRef(false);
  const navigate = useNavigate();
  const takeParamsUrl = getSearchParameters();
  const customerIdlistUrl = (takeParamsUrl && takeParamsUrl?.customerIdlist?.replace(/\%2C/g, ",").split(",")) || [];
  const customerIdlist = customerIdlistUrl.map((item) => {
    return +item;
  });

  const mbtId = (takeParamsUrl && takeParamsUrl?.mbtId);  

  const [searchParams, setSearchParams] = useSearchParams();
  const [listEmailMarketing, setListEmailMarketing] = useState<ISendEmailResponseModel[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [idSendEmail, setIdSendEmail] = useState<number>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const [showCheckResourceEmail, setShowCheckResourceEmail] = useState<boolean>(false);
  const [contentDialogResourceEamil, setContentDialogResourceEmail] = useState<any>(null);

  const [showPageSendEmail, setShowPageSendEmail] = useState<boolean>(false);
  const [checkadd, setCheckAdd] = useState(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const[listEmailConfig, setListEmailConfig] = useState([]);
  console.log('listEmailConfig', listEmailConfig);
  
  useEffect(() => {
    if (customerIdlist && customerIdlist.length > 0) {
      setShowPageSendEmail(true);
    } else {
      if (!checkadd) {
        setShowPageSendEmail(false);
      }
    }

    if(mbtId){
      setShowPageSendEmail(true);
    }
  }, [customerIdlist, checkadd, mbtId]);

  const getListEmailConfig = async () => {
    const paramsSearch = {
      name: '',
      limit: 10
    }

    const response = await EmailConfigService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListEmailConfig(result);

      
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getListEmailConfig();
  }, [])

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách yêu cầu gửi email",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_buy",
        name: "Thời gian yêu cầu",
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
      {
        key: "status",
        name: "Trạng thái gửi",
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
          {
            value: "3",
            label: "Đã hủy",
          },
          {
            value: "4",
            label: "Gửi thất bại",
          },
        ],
        value: searchParams.get("status") ?? "",
      },
    ],
    [searchParams]
  );

  const [params, setParams] = useState<ISendEmailFilterRequest>({
    query: "",
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "email marketing",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListEmailMarketing = async (paramsSearch: ISendEmailFilterRequest) => {
    setIsLoading(true);

    const response = await SendEmailService.listSendEmail(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListEmailMarketing(result.items);
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
      getListEmailMarketing(params);
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
      permissions["EMAIL_REQUEST_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          if(listEmailConfig && listEmailConfig.length > 0){
            setIdSendEmail(null);
            setShowPageSendEmail(true);
            setCheckAdd(true);
          } else {
            showDialogCheckResourceEmail();
          }
          
        },
      },
    ],
  };

  const titles = ["STT", "Người yêu cầu gửi", "Thời gian yêu cầu", "Tiêu đề", "Thời gian gửi", "Trạng thái phê duyệt", "Trạng thái gửi"];

  const dataFormat = ["text-center", "", "", "", "", "text-center", "text-center"];

  const dataSize = ["auto", "auto", "auto", 15, "auto", "auto"];

  const dataMappingArray = (item: ISendEmailResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.employeeName,
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY HH:mm") : "",
    item.title,
    item.timeAt ? moment(item.timeAt).format("DD/MM/YYYY HH:mm") : "",
    <Badge
      key={item.id}
      text={item.statusAction === 0 ? "Chờ phê duyệt" : item.statusAction === 1 ? "Đã phê duyệt" : "Hủy yêu cầu"}
      variant={item.statusAction === 0 ? "warning" : item.statusAction === 1 ? "success" : "error"}
    />,
    // item.statusAction === 0 ? (
    //   <span className="send-pending">Chờ phê duyệt</span>
    // ) : item.statusAction === 1 ? (
    //   <span className="send-success">Đã phê duyệt</span>
    // ) : (
    //   <span className="send-cancel">Hủy yêu cầu</span>
    // ),
    <Badge
      key={item.id}
      text={item.status == 1 ? "Đang chờ gửi" : "Đã hoàn thành"}
      variant={item.status == 1 ? "warning" : "success"}
    />,
    // item.status == 1 ? <span className="pending-status">Đang chờ gửi</span> : <span className="success-status">Đã hoàn thành</span>,
  ];

  const actionsTable = (item: ISendEmailResponseModel): IAction[] => {
    return [
      ...(item.statusAction == 0
        ? ([
            permissions["EMAIL_REQUEST_IMPORT"] == 1 && {
              title: "Phê duyệt",
              icon: <Icon name="FingerTouch" className="icon-warning" />,
              callback: () => {
                if(listEmailConfig && listEmailConfig.length > 0){
                  onApprove(item.id);
                } else {
                  showDialogCheckResourceEmail();
                }

              },
            },
            permissions["EMAIL_REQUEST_UPDATE"] == 1 && {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setIdSendEmail(item.id);
                setShowPageSendEmail(true);
                setCheckAdd(true);
              },
            },
            permissions["EMAIL_REQUEST_DELETE"] == 1 && {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ] as IAction[])
        : item.statusAction == 1
        ? ([
            permissions["EMAIL_REQUEST_IMPORT"] == 1 && {
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
    const response = await SendEmailService.cancelEmail(id);

    if (response.code === 0) {
      showToast("Hủy yêu cầu thành công", "success");
      getListEmailMarketing(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmCancel = (item?: ISendEmailResponseModel) => {
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

  const showDialogCheckResourceEmail = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Vui lòng tạo Email nguồn</Fragment>,
      message: <Fragment>Bạn phải tạo Email nguồn trước khi thực hiện gửi Email.</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowCheckResourceEmail(false);
        setContentDialogResourceEmail(null);
      },
      defaultText: "Tạo Email nguồn",
      defaultAction: () => {
        navigate(`/setting_email?tab=tab_four`)
      },
    };
    setContentDialogResourceEmail(contentDialog);
    setShowCheckResourceEmail(true);
  };

  const onApprove = async (id) => {
    const response = await SendEmailService.approveEmail(id);

    if (response.code === 0) {
      showToast("Phê duyệt thành công", "success");
      getListEmailMarketing(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onDelete = async (id: number) => {
    const response = await SendEmailService.deleteSendEmail(id);

    if (response.code === 0) {
      showToast("Xóa email marketing thành công", "success");
      getListEmailMarketing(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ISendEmailResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "email marketting " : `${listIdChecked.length} email marketting`}
          {item ? <strong>{item.id}</strong> : ""}? Thao tác này không thể khôi phục.
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
    permissions["EMAIL_REQUEST_DELETE"] == 1 && {
      title: "Xóa email marketing",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <Fragment>
      <div className={`page-content page--email-marketing${isNoItem ? " bg-white" : ""}${showPageSendEmail ? " d-none" : ""}`}>
        <TitleAction title="Email Marketing" titleActions={titleActions} />
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
          {!isLoading && listEmailMarketing && listEmailMarketing.length > 0 ? (
            <BoxTable
              name="Email Marketing"
              titles={titles}
              items={listEmailMarketing}
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
                      Hiện tại chưa có email marketing nào. <br />
                      Hãy thêm mới email marketing đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới email marketing"
                  action={() => {
                    setIdSendEmail(null);
                    setShowPageSendEmail(true);
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
        <Dialog content={contentDialogResourceEamil} isOpen={showCheckResourceEmail} />
      </div>
      <div className={`${showPageSendEmail ? "" : "d-none"}`}>
        <AddEditSendEmail
          onShow={showPageSendEmail}
          idSendEmail={idSendEmail}
          onHide={(isHide) => {
            if (isHide) {
              getListEmailMarketing(params);
            }
            setShowPageSendEmail(false);
            setCheckAdd(false);
          }}
          onBackProps={() => setShowPageSendEmail(false)}
          customerIdList={customerIdlist}
        />
      </div>
    </Fragment>
  );
}
