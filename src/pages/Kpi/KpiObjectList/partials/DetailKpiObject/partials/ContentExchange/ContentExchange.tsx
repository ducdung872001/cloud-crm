import React, { Fragment, useState, useEffect, useRef } from "react";
import { IWorkExchangeFilterRequest } from "model/workOrder/WorkOrderRequestModel";
import { IWorkExchangeResponseModal } from "model/workOrder/WorkOrderResponseModel";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ThirdGender from "assets/images/third-gender.png";
import ImageExcel from "assets/images/img-excel.png";
import ImageWord from "assets/images/img-word.png";
import ImagePowerPoint from "assets/images/img-powerpoint.png";
import ImagePdf from "assets/images/img-pdf.png";
import Conversation from "assets/images/conversation.png";
import { showToast } from "utils/common";
import { useOnClickOutside } from "utils/hookCustom";
import MessageChat from "./partials/MessageChat";
import "./ContentExchange.scss";
import { IKpiExchangeFilterRequest } from "model/kpiObject/KpiObjectRequestModel";
import { IKpiExchangeResponseModal } from "model/kpiObject/KpiObjectResponseModel";
import KpiObjectService from "services/KpiObjectService";

interface IContentExchangeProps {
  kotId: number;
  dataEmployee: any;
}

export default function ContentExchange(props: IContentExchangeProps) {
  const { kotId, dataEmployee } = props;
  console.log("id", kotId);

  const refEditChat = useRef();
  const refContainerChat = useRef();
  const messageEndRef = useRef(null);

  const [params, setParams] = useState<IKpiExchangeFilterRequest>({
    page: 1,
    limit: 10,
    kotId: kotId,
  });

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isEditChat, setIsEditChat] = useState<boolean>(false);

  useOnClickOutside(refEditChat, () => setIsEditChat(false), ["option-action-chat"]);

  const [lstDataExchange, setLstDataExchange] = useState<IKpiExchangeResponseModal[]>([]);
  console.log("lstDataExchange", lstDataExchange);

  const [idExchange, setIdExchange] = useState<number>(0);
  const [dataExchange, setDataExchange] = useState<IKpiExchangeResponseModal>(null);

  const handLstExchangeContent = async () => {
    setIsLoading(true);

    const response = await KpiObjectService.exchangelist(params);

    if (response.code === 0) {
      const result = response.result;

      setHasMore((params.page - 1) * 10 + (result.lstKpiExchange.length || 0) < result.total);

      const newDataExchange = params.page === 1 ? [] : lstDataExchange;

      (result.lstKpiExchange || []).map((item) => {
        newDataExchange.unshift(item);
      });

      setLstDataExchange(newDataExchange);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (kotId) {
      handLstExchangeContent();
    }
  }, [kotId]);

  // đoạn này là sử lí code luôn luôn cuộn xuống dưới mỗi khi mình có tin nhắn mới
  const scrollToLastMessage = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (params.page == 1) {
      scrollToLastMessage();
    }
  });

  // function xử lý cuộn trang
  const handleScroll = (event) => {
    const scrollTop = Math.round(event.target.scrollTop || 0);

    //TODO: đoạn này là check đk, nếu như mà hết page rồi thì thôi ko phân trang nữa
    // console.log("cái mình cần : ", scrollTop === 0 && hasMore);

    if (scrollTop === 0 && hasMore) {
      //Tăng lên rồi gọi api
      setParams({ ...params, page: params.page + 1 });
    }
  };

  // xóa đi 1 trao đổi
  const onRemoveChat = async (id: number) => {
    if (!id) return;

    const response = await KpiObjectService.deleteKpiExchange(id);

    if (response.code === 0) {
      showToast("Xóa tin nhắn thành công", "success");
      handLstExchangeContent();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item: IKpiExchangeResponseModal) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn xóa tin nhắn. Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onRemoveChat(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  // lấy chiều cao của vùng soạn thảo tin nhắn
  const takeHeightTextarea = (height: number) => {
    // console.log("height chat : ", height);
  };

  // chỉnh sửa 1 hội thoại
  const handEditContent = async (id) => {
    if (!id) return;

    const response = await KpiObjectService.updateKpiExchange(id);

    if (response.code === 0) {
      const result = response.result;
      setDataExchange(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <div className="wrapper__content-exchange--work">
      <div className="box__exchange">
        <div className="content-exchange">
          {lstDataExchange && dataEmployee && lstDataExchange.length > 0 ? (
            <div onScroll={handleScroll} className="lst__data--exchange">
              {lstDataExchange.map((item, idx) => {
                return (
                  <div key={idx} className={`${item.employeeId === dataEmployee.id ? "data__item--right" : "data__item--left"}`}>
                    <img src={item.employeeAvatar ? item.employeeAvatar : ThirdGender} alt={item.employeeName} className="avatar-employee" />
                    <div className="info__content">
                      <div className="info__content--left">
                        <span className="username-person">{item.employeeId === dataEmployee.id ? "" : item.employeeName}</span>
                        <div className="box__conversation">{item.content}</div>
                      </div>
                      <div className="info__content--right">
                        <span className="time-content">
                          {moment(item.createdTime).format("HH:mm")} {item.employeeId === dataEmployee.id ? <Icon name="Checked" /> : ""}
                        </span>
                      </div>
                      <div
                        className={`${item.employeeId === dataEmployee.id ? "option-action-chat" : "d-none"}`}
                        onClick={() => {
                          setIsEditChat(!isEditChat);
                          setIdExchange(item.id);
                        }}
                        ref={refContainerChat}
                      >
                        <Icon name="ThreeDotVertical" />
                      </div>
                      {isEditChat && item.id === idExchange && (
                        <ul className="menu-action-chat" ref={refEditChat}>
                          <li
                            className="edit-chat-item"
                            onClick={(e) => {
                              e && e.preventDefault();
                              setIsEditChat(false);
                              handEditContent(item.id);
                            }}
                          >
                            <Icon name="Pencil" />
                            Sửa
                          </li>
                          <li
                            className="remove-chat-item"
                            onClick={() => {
                              setIsEditChat(false);
                              showDialogConfirmDelete(item);
                            }}
                          >
                            <Icon name="Trash" />
                            Xóa
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>
          ) : isLoading && params.page === 1 ? (
            <Loading />
          ) : (
            <div className="message-notification">
              <div className="img__message">
                <img src={Conversation} alt="Hình ảnh cuộc trò truyện" />
              </div>
              <div className="content-message">
                <h2>Chưa có cuộc trao đổi nào</h2>
                <p>Hãy bắt đầu cuộc trao đổi đầu tiên nhé!</p>
              </div>
            </div>
          )}
        </div>
        <div className="chat-content">
          <MessageChat
            dataMessage={dataExchange}
            kotId={kotId}
            employeeId={dataEmployee?.id}
            takeHeightTextarea={takeHeightTextarea}
            onHide={(reload) => {
              if (reload) {
                setParams({ ...params, page: 1 });
                handLstExchangeContent();
                setDataExchange(null);
              }
            }}
          />
        </div>
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
