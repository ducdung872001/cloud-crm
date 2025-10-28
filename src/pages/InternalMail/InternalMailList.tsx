import React, { useState, useRef, useEffect, Fragment } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import HeadlessTippy from "@tippyjs/react/headless";
import { useSearchParams } from "react-router-dom";
import { IMailBoxFilterRequest } from "model/mailBox/MailBoxRequestModel";
import { IMailBoxResponseModel } from "model/mailBox/MailBoxResponseModel";
import MailboxService from "services/MailboxService";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ThirdGender from "assets/images/third-gender.png";
import ImgNoSearch from "assets/images/no-data-search.png";
import ImgChatGroup from "assets/images/img-chat-group.png";
import { useWindowDimensions } from "utils/hookCustom";
import AddMailBoxModal from "./partials/AddMailBoxModal/AddMailBoxModal";
import HeaderInternalRightMailList from "./partials/HeaderInternalRightMailList/HeaderInternalRightMailList";
import ExchangeContentList from "./partials/ExchangeContent/ExchangeContentList";
import "tippy.js/dist/tippy.css";
import "./InternalMailList.scss";

export default function InternalMailList() {
  document.title = "Thư nội bộ";

  const isMounted = useRef(false);

  const { width } = useWindowDimensions();

  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBroadly, setIsBroadly] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalOption, setShowModalOption] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [listMailbox, setListMailbox] = useState<IMailBoxResponseModel[]>([]);
  const [dataMailbox, setDataMailbox] = useState<IMailBoxResponseModel>(null);

  // đoạn này sau thực hiện nhiều hành động thì tạo thêm 1 trường type nữa để check xử lý
  const [optionMailBox] = useState([
    {
      icon: <Icon name="Pin" />,
      name: "Ghim hội thoại",
      className: "pin-conversation",
    },
    {
      icon: <Icon name="Trash" />,
      name: "Xóa hội thoại",
      className: "especially",
    },
  ]);
  const [params, setParams] = useState<IMailBoxFilterRequest>({ keyword: "", page: page, limit: 10 });

  useEffect(() => {
    if (page > 1) {
      setParams({ ...params, page: page });
    }
  }, [page]);

  const abortController = new AbortController();

  const getListMailbox = async (paramsSearch: IMailBoxFilterRequest) => {
    setIsLoading(true);

    const response = await MailboxService.list(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setHasMore((page - 1) * 10 + (result.items.length || 0) < result.total);

      const newData = page == 1 ? [] : listMailbox;

      (result.items || []).map((item) => {
        newData.push(item);
      });

      setListMailbox(newData);
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
      getListMailbox(params);

      const paramsTemp = _.cloneDeep(params);

      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }

      Object.keys(paramsTemp).map((key) => {
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

  // xử lý xóa một cuộc hội thoại
  const onDelete = async (id) => {
    const response = await MailboxService.delete(id);

    if (response.code === 0) {
      showToast("Xóa thư nội bộ thành công", "success");
      getListMailbox(params);
      setDataMailbox(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IMailBoxResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa thư nội bộ
          {item ? <strong> {item.title}</strong> : ""}? Thao tác này không thể khôi phục.
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

  // Xử lý khi mình click ra ngoài thì ẩn optionMailbox đi
  const handClickOutside = () => {
    setTimeout(() => {
      setShowModalOption(false);
    }, 200);
  };

  const handleScroll = (e) => {
    if (isLoading) {
      return;
    }

    const scrollBottom = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;

    if (scrollBottom && hasMore) {
      setPage((prevState) => prevState + 1);
    }
  };

  return (
    <div className="page__content page__internal">
      <div className="page__internal--left">
        {/* đoạn này mình tách ra là 1 component */}
        <div className="wrapper-title">
          <h3 className="title-page">Thư nội bộ</h3>
          <div className="action-add--conversation">
            <Tippy content="Thêm mới thư nội bộ" delay={[100, 0]}>
              <span
                className="icon-add"
                onClick={() => {
                  setDataMailbox(null);
                  setShowModalAdd(true);
                }}
              >
                <Icon name="PlusCircle" />
              </span>
            </Tippy>
          </div>
        </div>
        {/* đoạn này mình tách ra là 1 component */}
        <div className="wrapper-search">
          <SearchBox name="thư nội bộ" params={params} updateParams={(paramsNew) => setParams(paramsNew)} />
        </div>
        {listMailbox && listMailbox.length > 0 ? (
          <div className="list-conversation" onScroll={handleScroll}>
            {listMailbox.map((item, idx) => (
              <div
                key={idx}
                className={`conversation__item ${dataMailbox?.id == item.id ? "active" : ""}`}
                onClick={() => {
                  setDataMailbox(item);
                }}
              >
                <div className="conversation__item--info">
                  <img
                    src={item.senderAvatar ? item.senderAvatar : ThirdGender}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ThirdGender; // Thay thế bằng ảnh mặc định nếu lỗi
                    }}
                  />
                  <span className="name-conversation">{item.title}</span>
                </div>
                <div className="conversation__item--action">
                  <span className="time">{moment(item.createdTime, "HH:mm").fromNow()}</span>
                </div>

                <HeadlessTippy
                  interactive
                  visible={showModalOption}
                  render={(attrs) => (
                    <div className="list-option" {...attrs}>
                      <ul className="menu-option">
                        {optionMailBox.map((element, idx) => (
                          <li
                            key={idx}
                            className={`option-item ${element.className ? element.className : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setShowModalOption(false);
                              showDialogConfirmDelete(item);
                            }}
                          >
                            <span>{element.icon}</span>
                            {element.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  placement="bottom-start"
                  onClickOutside={handClickOutside}
                >
                  <span className="isShowIcon" onClick={() => setShowModalOption(!showModalOption)}>
                    <Icon name="ThreeDotVertical" />
                  </span>
                </HeadlessTippy>
              </div>
            ))}
          </div>
        ) : isLoading && page == 1 ? (
          <Loading />
        ) : params.keyword && listMailbox.length == 0 ? (
          <div className="no__search--data">
            <div className="img__no--search">
              <img src={ImgNoSearch} alt="Không tìm thấy" />
            </div>

            <div className="content">
              <h2>Không tìm thấy</h2>
              <p>Bạn thử thay đổi từ khóa tìm kiếm nhé !</p>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="page__internal--right">
        {dataMailbox !== null ? (
          <Fragment>
            <HeaderInternalRightMailList
              dataMailbox={dataMailbox}
              isBroadly={isBroadly}
              setIsBroadly={setIsBroadly}
              showDialogConfirmDelete={showDialogConfirmDelete}
            />
            <ExchangeContentList dataMailbox={dataMailbox} isBroadly={isBroadly} />
          </Fragment>
        ) : (
          <div className="introduction">
            <div className="img__chat--group">
              <img src={ImgChatGroup} alt="chat nhóm" />
            </div>
            <h2>Chào mừng bạn đến với tính năng thư nội bộ !</h2>
          </div>
        )}
      </div>
      <AddMailBoxModal
        onShow={showModalAdd}
        data={dataMailbox}
        onHide={(reload) => {
          if (reload) {
            getListMailbox(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
