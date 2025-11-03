import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import { IFanpageCommentResponse } from "model/fanpageFacebook/FanpageResponseModel";
import { IListCommentProps } from "model/fanpageFacebook/PropsModel";
import { IFanpageCommentFilterRequest } from "model/fanpageFacebook/FanpageFacebookRequestModel";
import Image from "components/image";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import NoImageChatBot from "assets/images/img-no-chatbot.png";
import FanpageFacebookService from "services/FanpageFacebookService";
import "./index.scss";

export default function ListComment(props: IListCommentProps) {
  const { dataFanpageDialog, tab } = props;

  const [listFanpageComment, setListFanpageComment] = useState<IFanpageCommentResponse[]>([]);
  const [pageComment, setPageComment] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [params, setParams] = useState<IFanpageCommentFilterRequest>({
    page: pageComment,
    limit: 10,
  });

  useEffect(() => {
    if (dataFanpageDialog && tab.name == "tab_two") {
      setParams({ ...params, fanpageId: dataFanpageDialog._fanpage_id, profileId: dataFanpageDialog._profile_id });
    }
  }, [dataFanpageDialog, tab.name]);

  useEffect(() => {
    if (pageComment) {
      setParams({ ...params, page: pageComment });
    }
  }, [pageComment]);

  const getListFanpageComment = async (paramsSearch: IFanpageCommentFilterRequest) => {
    setIsLoading(true);

    const response = await FanpageFacebookService.listFanpageComment(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setHasMore(result.loadMoreAble);

      const newData = pageComment == 1 ? [] : listFanpageComment;

      (result.items || []).map((item) => {
        newData.unshift(item);
      });

      setListFanpageComment(newData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (params && (params?.fanpageId || params?.profileId)) {
      getListFanpageComment(params);
    }
  }, [params]);

  const handleScroll = (e) => {
    if (isLoading) {
      return;
    }

    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && hasMore) {
      setPageComment((prevState) => prevState + 1);
    }
  };

  const handleHideComment = async (id: number) => {
    const response = await FanpageFacebookService.hiddenFanpageComment(id);

    if (response.code === 0) {
      showToast("Ẩn bình luận thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmHide = (item?: IFanpageCommentResponse) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Ẩn bình luận</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn ẩn bình luận của
          {item ? <strong> {item.profileName}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => handleHideComment(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleRemoveComment = async (id: number) => {
    const response = await FanpageFacebookService.deleteFanpageComment(id);

    if (response.code === 0) {
      showToast("Xóa bình luận thành công", "success");
      getListFanpageComment(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IFanpageCommentResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa bình luận</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa bình luận của
          {item ? <strong> {item.profileName}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => handleRemoveComment(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleReplyComment = () => {
    //
  };

  return (
    <Fragment>
      {dataFanpageDialog && listFanpageComment && listFanpageComment.length > 0 ? (
        <Fragment>
          <div className="header__comment">
            <div className="avatar-account">
              <Image src={dataFanpageDialog.avatar} imageError={ImageThirdGender} alt={dataFanpageDialog.name} />
            </div>
            <h3>{dataFanpageDialog.name}</h3>
          </div>
          <div className="box__comment">
            <div className="list__comments" onScroll={handleScroll}>
              {listFanpageComment.map((item, idx) => {
                return (
                  <div key={idx} className="item-comment">
                    <div className="wrapper__comment--user">
                      <div className="avatar-user">
                        <Image src={item.profileAvatar} imageError={ImageThirdGender} alt={item.profileName} />
                      </div>

                      <div className="d-flex flex-column">
                        <div className="info__user">
                          <h5>{item.profileName}</h5>
                          <p className="desc__content">{item.content}</p>
                          <span className="time-comment">{moment(item.publishedTime).format("HH:mm")}</span>
                        </div>

                        <div className="action__footer">
                          <div className="hide-comment" onClick={() => showDialogConfirmHide(item)}>
                            <h3>Ẩn</h3>
                          </div>
                          <div className="remove-comment" onClick={() => showDialogConfirmDelete(item)}>
                            <h3>Xóa</h3>
                          </div>
                          <div className="reply-comment" onClick={() => handleReplyComment()}>
                            <Icon name="Reply" />
                            <h3>Phản hồi</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    {item.replies && item.replies.length > 0 && (
                      <div className="wrapper__comment--owner">
                        {item.replies.map((el, index) => {
                          return (
                            <div key={index} className="info__owner">
                              <p className="desc__content">{el.content}</p>
                              <span className="time-comment">
                                {moment(el.publishedTime).format("HH:mm")} {el._profile_id === el._fanpage_id ? <Icon name="Checked" /> : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Fragment>
      ) : (
        <div className="notify-chatbot">
          <div className="image-chatbot">
            <img src={NoImageChatBot} alt="" />
          </div>
          <h2>Chào mừng bạn đến với tính năng chat qua fanpage của Reborn !</h2>
        </div>
      )}
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
