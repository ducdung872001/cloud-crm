import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import { useNavigate } from "react-router-dom";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IEmailListProps } from "model/email/PropsModel";
import { IEmailFilterRequest } from "model/email/EmailRequestModel";
import { IEmailResponse } from "model/email/EmailResponseModel";
import { showToast } from "utils/common";
import { getPageOffset, removeHtmlTags, trimContent } from "reborn-util";
import { getPermissions } from "utils/common";
import EmailService from "services/EmailService";
import EmployeeService from "services/EmployeeService";
import AddEmailModal from "./partials/AddEmailModal";
import { useMsal } from "@azure/msal-react";
import { AccountInfo, SilentRequest } from "@azure/msal-browser";
import { IEmployeeRequest } from "model/employee/EmployeeRequestModel";
import moment from "moment";
import Tippy from "@tippyjs/react";
import SendEmailModal from "./SendEmailModal/SendEmailModal";

import "./EmailList.scss";

// Đồng bộ outlook mail, gmail vào trong crm
export default function EmailList() {
  document.title = "Danh sách Email";

  const isMounted = useRef(false);
  const navigate = useNavigate();

  const [listEmail, setListEmail] = useState<IEmailResponse[]>([]);
  const [dataEmail, setDataEmail] = useState<IEmailResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalSendEmail, setShowModalSendEmail] = useState<boolean>(false);
  const [params, setParams] = useState<IEmailFilterRequest>({
    keyword: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách email",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh sách email",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListEmail = async (paramsSearch: IEmailFilterRequest) => {
    setIsLoading(true);

    const response = await EmailService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListEmail(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +result.page === 1) {
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

    checkEmailConnection();
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListEmail(params);
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
      permissions["CUSTOMER_ADD"] == 1 && {
        //Có quyền trên khách hàng
        title: "Làm mới",
        callback: () => {
          //Gọi hàm lấy danh sách email
          getListEmail({});
        },
      },

      permissions["CUSTOMER_ADD"] == 1 && {
        title: "Gửi Email",
        callback: () => {
          // setDataEmail(null);
          setShowModalSendEmail(true);
        },
      },
    ],
  };

  const titles = ["STT", "Người gửi", "Tiêu đề", "Nội dung"];

  const dataFormat = ["text-center", "", "", ""];

  const dataMappingArray = (item: IEmailResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <div key={index} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {item.emailType === "SentItems" ? (
          <Tippy content="Đã gửi" delay={[100, 0]} animation="scale-extreme">
            <span style={{ display: "flex", alignItems: "center" }}>
              <Icon name="SendEmail" style={{ width: 15, marginRight: 5, fill: "var(--success-darker-color)" }} />
            </span>
          </Tippy>
        ) : (
          <Tippy content="Hộp thư đến" delay={[100, 0]} animation="scale-extreme">
            <span style={{ display: "flex", alignItems: "center" }}>
              <Icon name="ReceiveEmail" style={{ width: 15, marginRight: 5, fill: "var(--primary-color-90)" }} />
            </span>
          </Tippy>
        )}
        <span>{item.name}</span>
      </div>
      <label style={{ fontStyle: "italic", fontSize: "1.3rem" }}>{item.emailFrom}</label>
      <label style={{ fontStyle: "italic", fontSize: "1.3rem" }}>{moment(item.receivedDateTime).format("DD/MM/YYYY HH:mm:ss")}</label>
    </div>,
    item.title,
    <Fragment key={index}>
      <label>{trimContent(removeHtmlTags(item.content), 50, false, true)}</label>
      {/* <div style={{        
        position: 'absolute',
        zIndex: '100000',
        border: '1px solid #ddd',
        padding: '10px',
        background: 'white'
      }}>
        {parser(item.content)}
      </div> */}
    </Fragment>,
  ];

  const actionsTable = (item: IEmailResponse): IAction[] => {
    // console.log('item', item);

    return [
      // item.id % 2 === 0 && {
      //   title: "Đồng bộ",
      //   icon: <Icon name="ReportWarning" className="icon-warning" />,
      //   callback: () => {
      //     // là gì đó ở đây
      //   },
      // },
      permissions["CUSTOMER_ADD"] == 1 && {
        title: "Phản hồi",
        icon: <Icon name="Reply" />,
        callback: () => {
          // showDialogConfirmDelete(item);
          setDataEmail({
            emailFrom: item?.emailFrom || "",
          });
          setShowModalAdd(true);
        },
      },
      permissions["CUSTOMER_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await EmailService.delete(id);
    if (response.code === 0) {
      showToast("Xóa email thành công", "success");
      getListEmail(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IEmailResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "email " : `${listIdChecked.length} email đã chọn`}
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
    permissions["CUSTOMER_DELETE"] == 1 && {
      title: "Xóa email",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  // biến để check xem kết nối chưa
  const [emailConnectionStatus, setEmailConnectionStatus] = useState<boolean>(true);

  /**
   * Kiểm tra trạng thái kết nối của Email
   */
  const checkEmailConnection = async () => {
    const response = await EmployeeService.checkEmailConnection();

    if (response.code == 0) {
      const result = response.result;
      setEmailConnectionStatus(+result > 0);

      //Nếu kết nối rồi, thực hiện làm mới token
      if (+result > 0) {
        //Đăng nhập ẩn để lấy mới token
        handleLogin();
      }
    }
  };

  /**
   * Cập nhật token
   * @param e
   * @returns
   */
  const updateToken = async (res) => {
    const body: IEmployeeRequest = {
      idToken: res.idToken,
      accessToken: res.accessToken,
      uniqueId: res.uniqueId,
    };

    const response = await EmployeeService.updateToken(body);
  };

  const { instance } = useMsal();

  /**
   * Thực hiện đăng nhập ẩn
   */
  const handleLogin = () => {
    let accountInfo: any = localStorage.getItem("outlook.account");
    if (accountInfo) {
      accountInfo = JSON.parse(accountInfo);
    }

    const accessTokenRequest: SilentRequest = {
      scopes: ["User.Read", "Mail.Read", "Mail.Send"],
      account: {
        homeAccountId: accountInfo?.homeAccountId,
        environment: accountInfo?.environment,
        tenantId: accountInfo?.tenantId,
        username: accountInfo?.username,
        localAccountId: accountInfo?.localAccountId,
      } as AccountInfo,
      forceRefresh: true,
    };

    instance
      .acquireTokenSilent(accessTokenRequest)
      .then((res) => {
        console.log("popup silent =>", res);

        //Thực hiện cập nhật mới token
        updateToken(res);
      })
      .catch((e) => {
        // console.log("popup silent err =>");
        // console.log(e);

        //Thông báo cần kết nối lại thủ công => Thông báo mất kết nối
        setEmailConnectionStatus(false);
      });
  };

  return (
    <div className={`page-content page-email${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Danh sách email" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên email"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listEmail && listEmail.length > 0 ? (
          <BoxTable
            name="Danh sách email"
            titles={titles}
            items={listEmail}
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
            {isPermissions ? (
              <SystemNotification type="no-permission" />
            ) : isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có email nào. <br />
                    Hãy thêm mới email đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton=""
                action={() => {
                  // setDataEmail(null);
                  // setShowModalAdd(true);
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
        {!emailConnectionStatus && (
          <div className="notification__connect--email">
            <span className="content">Bạn chưa kết nối Email, kết nối ngay ...</span>

            <div className="action__connect">
              <Tippy content="Kết nối">
                <span
                  className="__connect"
                  onClick={() => {
                    navigate("/user_setting");
                  }}
                >
                  <Icon name="BackupRestore" />
                </span>
              </Tippy>

              <Tippy content="Đóng">
                <span className="__cancel" onClick={() => setEmailConnectionStatus(true)}>
                  <Icon name="TimesCircleFill" />
                </span>
              </Tippy>
            </div>
          </div>
        )}
      </div>
      {/* <AddEmailModal
        onShow={showModalAdd}
        data={dataEmail}
        onHide={(reload) => {
          if (reload) {
            getListEmail(params);
          }
          setShowModalAdd(false);
        }}
      />
      <SendEmailModal
        onShow={showModalSendEmail}
        data={""}
        onHide={(reload) => {
          if (reload) {
            getListEmail(params);
          }
          setShowModalSendEmail(false);
        }}
      /> */}
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
