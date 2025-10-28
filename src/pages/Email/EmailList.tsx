import React, { Fragment, useState, useEffect, useRef, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import Icon from "components/icon";
import { useNavigate } from "react-router-dom";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IEmailFilterRequest } from "model/email/EmailRequestModel";
import { IEmailResponse } from "model/email/EmailResponseModel";
import { showToast } from "utils/common";
import { getPageOffset, trimContent } from "reborn-util";
import { getPermissions } from "utils/common";
import EmailService from "services/EmailService";
import AddEmailModal from "./partials/AddEmailModal";
import Tippy from "@tippyjs/react";
import SendEmailModal from "./SendEmailModal/SendEmailModal";
import { ContextType, UserContext } from "contexts/userContext";
import ConnectGmailService from "services/ConnectGmailService";
import Button from "components/button/button";
import Popover from "components/popover/popover";
import { useOnClickOutside } from "utils/hookCustom";
import "./EmailList.scss";

// Đồng bộ outlook mail, gmail vào trong crm
export default function EmailList() {
  document.title = "Danh sách Email";

  const isMounted = useRef(false);
  const navigate = useNavigate();

  const refSizeLimit = useRef();
  const refSizeLimitContainer = useRef();
  const [showSizeLimit, setShowSizeLimit] = useState<boolean>(false);
  useOnClickOutside(refSizeLimit, () => setShowSizeLimit(false), ["display-item__button"]);

  const { id } = useContext(UserContext) as ContextType;

  const [params, setParams] = useState({
    query: "",
    email: "",
    ["bsn_id"]: null,
    page_token: "",
    max_results: 10,
    include_spam_trash: true,
  });

  const [isConnect, setIsConnect] = useState<boolean>(false);

  const handCheckConnect = async (id) => {
    const param = {
      ["bsn-id"]: id,
    };

    const response = await ConnectGmailService.checkConnect(param);

    if (response.code === 200) {
      const result = response.result[0];
      setIsConnect(true);

      setParams({
        ...params,
        ["bsn_id"]: id,
        email: result.gmail,
      });
    } else {
      setIsConnect(false);
    }
  };

  useEffect(() => {
    if (id) {
      handCheckConnect(id);
    }
  }, [id]);

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

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách email",
      is_active: true,
    },
  ]);

  const listSizeLimit: number[] = [10, 30, 50];
  const [nxPage, setNxPage] = useState<string>("");
  const [totalItem, setTotalItem] = useState<number>(0);
  const [sizeLimit, setSizeLimit] = useState<number>(10);

  const getListEmail = async (paramsSearch: IEmailFilterRequest) => {
    setIsLoading(true);

    const response = await EmailService.lstEmail(paramsSearch);

    if (response.code === 200) {
      const result = response.result;
      setListEmail(result.messages);
      setTotalItem(result.resultSizeEstimate);
      setNxPage(result.nextPageToken);

      if (result.resultSizeEstimate === 0) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsLoading(false);
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

    if (isMounted.current === true && params["bsn_id"]) {
      getListEmail(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.max_results === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      permissions["CUSTOMER_ADD"] == 1 && {
        //Có quyền trên khách hàng
        title: "Làm mới",
        callback: () => {
          //Gọi hàm lấy danh sách email
          getListEmail(params);
        },
      },

      permissions["CUSTOMER_ADD"] == 1 && {
        title: "Gửi Email",
        callback: () => {
          setDataEmail(null);
          setShowModalSendEmail(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tiêu đề", "Người gửi", "Người nhận", "Thời gian"];

  const dataFormat = ["text-center", ""];

  const dataMappingArray = (item, index: number) => [
    getPageOffset(params) + index + 1,
    trimContent(item.snippet, 100, true, true),
    item.payload.headers.find((item) => item.name == "From").value,
    item.payload.headers.find((item) => item.name == "To").value,
    moment(item.payload.headers.find((item) => item.name == "Date").value).format("DD/MM/YYYY HH:mm"),
  ];

  const actionsTable = (item): IAction[] => {
    return [
      permissions["CUSTOMER_ADD"] == 1 && {
        title: "Phản hồi",
        icon: <Icon name="Reply" />,
        callback: () => {
          //
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

  const showDialogConfirmDelete = (item?) => {
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

  const [isHide, setIsHide] = useState<boolean>(false);

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
          <div className="box__lst--email">
            <BoxTable
              name="Danh sách email"
              titles={titles}
              items={listEmail}
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
            <div className="footer__lst--email">
              <div className="__left">
                Hiển thị từ 1 - {sizeLimit} trên tổng {totalItem}
              </div>
              <div className="__center">
                Hiển thị{" "}
                <div className="display-item__button" ref={refSizeLimitContainer}>
                  <Button type="button" color="secondary" onClick={() => setShowSizeLimit(!showSizeLimit)}>
                    {sizeLimit} <Icon name="CaretUp" />
                  </Button>
                  {showSizeLimit && (
                    <Popover
                      alignment="center"
                      isTriangle={true}
                      direction="top"
                      className="popover-size-limit"
                      refPopover={refSizeLimit}
                      refContainer={refSizeLimitContainer}
                    >
                      <ul>
                        {listSizeLimit.map((size, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              setSizeLimit(size);
                              setParams({ ...params, max_results: size });
                              setShowSizeLimit(!showSizeLimit);
                            }}
                            className={`${size == sizeLimit ? "active" : ""}`}
                          >
                            {size}
                          </li>
                        ))}
                      </ul>
                    </Popover>
                  )}
                </div>{" "}
                email
              </div>
              <div className="__right">
                <Button variant="outline" onClick={() => setParams({ ...params, page_token: nxPage })}>
                  Trang sau
                  <Icon name="ChevronRight" />
                </Button>
              </div>
            </div>
          </div>
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
                    Hiện tại chưa có email chăm sóc khách hàng nào. <br />
                    Hãy thêm mới email đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton=""
                action={() => {
                  setDataEmail(null);
                  setShowModalSendEmail(true);
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
        {!isConnect && isHide && (
          <div className="notification__connect--email">
            <span className="content">Bạn chưa kết nối Email, kết nối ngay ...</span>

            <div className="action__connect">
              <Tippy content="Kết nối">
                <span
                  className="__connect"
                  onClick={() => {
                    navigate("/setting_account");
                  }}
                >
                  <Icon name="BackupRestore" />
                </span>
              </Tippy>

              <Tippy content="Đóng">
                <span className="__cancel" onClick={() => setIsHide(true)}>
                  <Icon name="TimesCircleFill" />
                </span>
              </Tippy>
            </div>
          </div>
        )}
      </div>
      <AddEmailModal
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
        emailOrg={params.email}
        onHide={(reload) => {
          if (reload) {
            getListEmail(params);
          }
          setShowModalSendEmail(false);
        }}
        bsnId={id}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
