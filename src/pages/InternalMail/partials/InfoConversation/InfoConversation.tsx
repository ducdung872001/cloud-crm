import React, { Fragment, useState, useEffect } from "react";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import { IMailBoxResponseModel, IMailboxViewerResponseModel } from "model/mailBox/MailBoxResponseModel";
import { IInfoConversationProps } from "model/mailBox/PropsModel";
import MailboxService from "services/MailboxService";
import { showToast } from "utils/common";
import ThirdGender from "assets/images/third-gender.png";
import AddPeopleInvolved from "./partials/AddPeopleInvolved/AddPeopleInvolved";
import "./InfoConversation.scss";

export default function InfoConversation(props: IInfoConversationProps) {
  const { data } = props;

  const [selectedBlock, setSelectedBock] = useState<number>(0);
  const [detailMailBox, setDetailMailBox] = useState<IMailBoxResponseModel>(null);
  const [isLoadingDetailMailBox, setIsLoadingDetailMailBox] = useState<boolean>(false);
  const [listPerson, setListPerson] = useState<IMailboxViewerResponseModel[]>([]);
  const [isLoadingtPerson, setIsLoadingPerson] = useState<boolean>(false);

  const handleDetailMailBox = async (id) => {
    setIsLoadingDetailMailBox(true);

    const response = await MailboxService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDetailMailBox(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsLoadingDetailMailBox(false);
    }

    setIsLoadingDetailMailBox(false);
  };

  const handleListPerson = async (id) => {
    setIsLoadingPerson(true);

    const response = await MailboxService.viewer(id);

    if (response.code === 0) {
      const result = response.result;
      setListPerson(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsLoadingPerson(false);
    }

    setIsLoadingPerson(false);
  };

  useEffect(() => {
    handleDetailMailBox(data.id);
    handleListPerson(data.id);
  }, [data]);

  return (
    <Fragment>
      <div
        className="info-internal-mail"
        onClick={() => {
          setSelectedBock(1);
        }}
      >
        <div
          className={`pater-info ${selectedBlock == 1 ? "active" : ""}`}
          onClick={() => {
            handleDetailMailBox(data.id);
          }}
        >
          <span className="icon-info">
            <Icon name="Info" />
            Thông tin thư nội bộ
          </span>
          <span className="icon-up-down">{selectedBlock === 1 ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
        </div>
        {selectedBlock == 1 &&
          (!isLoadingDetailMailBox && detailMailBox !== null ? (
            <div className="detail__creator">
              <div className="detail__creator--person">
                <div className="avatar-creator">
                  <img src={detailMailBox.senderAvatar ? detailMailBox.senderAvatar : ThirdGender} alt={detailMailBox.senderName} />
                </div>
                <div className="info-creator">
                  <span className="name">{detailMailBox.senderName}</span>
                  <span className="date">Tạo lúc: {moment(detailMailBox.createdTime).format("HH:mm DD/MM/YYYY")}</span>
                </div>
              </div>
              <div className="detail__creator--content">
                <p className="content-item">
                  <span className="title">Nội dung:</span>
                  {detailMailBox.content}
                </p>
              </div>
            </div>
          ) : isLoadingDetailMailBox ? (
            <Loading />
          ) : (
            "đoạn này sau chèn ảnh khi không có"
          ))}
      </div>
      {/* UI người liên quan */}
      <div className="people-involved" onClick={() => setSelectedBock(2)}>
        <div className={`pater-involved ${selectedBlock == 2 ? "active" : ""}`} onClick={() => handleListPerson(data.id)}>
          <span className="icon-customer">
            <Icon name="Customer" />
            Người liên quan
          </span>
          <span className="icon-up-down">{selectedBlock === 2 ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
        </div>
        {selectedBlock == 2 &&
          (!isLoadingtPerson && listPerson.length > 0 ? (
            <div className="detail-people">
              <div className="form-add-person">
                <AddPeopleInvolved
                  id={data.id}
                  dataProps={listPerson}
                  onReload={(reload) => {
                    if (reload) {
                      handleListPerson(data.id);
                    }
                  }}
                />
              </div>
              <div className="list-person">
                {listPerson.map((item, idx) => (
                  <div key={idx} className="person-item">
                    <span className="avatar-person">
                      <img src={item.avatar ? item.avatar : ThirdGender} alt={item.name} />
                    </span>
                    <span className="name-person">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : isLoadingtPerson ? (
            <Loading />
          ) : (
            "đoạn này sau chèn ảnh khi không có"
          ))}
      </div>
      {/* UI file đã chia sẻ */}
      <div className="shared-files" onClick={() => setSelectedBock(3)}>
        <div className={`pater-file ${selectedBlock == 3 ? "active" : ""}`}>
          <span className="icon-file-present">
            <Icon name="FilePresent" />
            File đã chia sẻ
          </span>
          <span className="icon-up-down">{selectedBlock === 3 ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
        </div>
        {selectedBlock == 3 &&
          (!isLoadingDetailMailBox && detailMailBox !== null ? (
            <div className="detail-files">
              {JSON.parse(detailMailBox.attachments).length === 0 ? (
                <span className="notification-attachment">Bạn chưa có file nào cả 😊</span>
              ) : (
                JSON.parse(detailMailBox.attachments || "[]").map((item, idx) => {
                  return (
                    <div key={idx} className="item-attachment">
                      {item.url && (
                        <div className="img-document">
                          <img src={item?.url} alt="ảnh tài liệu" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : isLoadingDetailMailBox ? (
            <Loading />
          ) : (
            "đoạn này sau chèn ảnh khi không có"
          ))}
      </div>
    </Fragment>
  );
}
