import React, { useEffect, useState } from "react";
import moment from "moment";
import { IOption } from "model/OtherModel";
import Image from "components/image";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import SelectCustom from "components/selectCustom/selectCustom";
import FanpageFacebookService from "services/FanpageFacebookService";
import { IFanpageDialogResponse } from "model/fanpageFacebook/FanpageResponseModel";
import { IFanpageDialogFilterRequest } from "model/fanpageFacebook/FanpageFacebookRequestModel";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import NoImageChat from "assets/images/img-no-chatting.png";
import ListChat from "./partials/ListChat";
import ListComment from "./partials/ListComment";
import "./SocialCrmFacebook.scss";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";

export default function SocialCrmFacebook() {
  document.title = "Kết nối với facebook";

  //! đoạn này xử lý vấn đề chọn fanpage
  const [listFanpage, setListFanpage] = useState<IOption[]>([]);
  const [valueFanpage, setValueFanpage] = useState(null);
  const [isLoadingFanpage, setIsLoadingFanpage] = useState<boolean>(false);

  const [tab, setTab] = useState({
    name: "tab_one",
    type: "chat",
  });

  const listTabs = [
    {
      name: "Tin nhắn",
      is_active: "tab_one",
      type: "chat",
    },
    {
      name: "Bình luận",
      is_active: "tab_two",
      type: "comment",
    },
  ];

  const onSelectOpenFanpage = async () => {
    setIsLoadingFanpage(true);

    const response = await FanpageFacebookService.listFanpage();

    if (response.code === 0) {
      const dataOption = response.result || [];

      if (dataOption.length > 0 && !valueFanpage) {
        const result = dataOption.find((item) => item["_fanpage_id"] == "117504331220056");
        setValueFanpage({
          value: result.id,
          label: result.name,
          fanpageId: result._fanpage_id,
        });
      }

      setListFanpage([
        ...(dataOption.length > 0
          ? dataOption.map((item) => {
              return {
                value: item.id,
                label: item.name,
                fanpageId: item._fanpage_id,
              };
            })
          : []),
      ]);
    }

    setIsLoadingFanpage(false);
  };

  useEffect(() => {
    onSelectOpenFanpage();
  }, []);

  const handleChangeValueFanpage = (e) => {
    setValueFanpage(e);
    setDataFanpageDialog(null);
  };

  //! đoạn này xử lý vấn đề lấy danh sách hội thoại
  const [listFanpageDialog, setListFanpageDialog] = useState<IFanpageDialogResponse[]>([]);
  const [dataFanpageDialog, setDataFanpageDialog] = useState<IFanpageDialogResponse>(null);
  const [paramsFanpageDialog, setParmsFanpageDialog] = useState<IFanpageDialogFilterRequest>({
    name: "",
    page: 1,
    limit: 20,
    type: "chat",
  });

  useEffect(() => {
    if (tab) {
      setDataFanpageDialog(null);
    }
  }, [tab]);

  useEffect(() => {
    if (valueFanpage) {
      setParmsFanpageDialog({ ...paramsFanpageDialog, fanpageId: valueFanpage?.fanpageId });
    }
  }, [valueFanpage]);

  useEffect(() => {
    if (tab && tab.type) {
      setParmsFanpageDialog({ ...paramsFanpageDialog, type: tab.type });
    }
  }, [tab.type]);

  const [isLoadingFanpageDialog, setIsLoadingFanpageDialog] = useState<boolean>(false);

  const getListFanpageDialog = async (paramsSearch: IFanpageDialogFilterRequest) => {
    setIsLoadingFanpageDialog(true);

    const response = await FanpageFacebookService.listFanpageDialog(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListFanpageDialog(result.items);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingFanpageDialog(false);
  };

  useEffect(() => {
    if (paramsFanpageDialog && paramsFanpageDialog?.fanpageId) {
      getListFanpageDialog(paramsFanpageDialog);
    }
  }, [paramsFanpageDialog]);

  ///Thêm khách hàng nhanh
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  return (
    <div className="page-content page-crm-facebook">
      <div className="action-header">
        <div className="title-page">
          <h1>Kênh facebook</h1>
        </div>
        <div className="option__page--connect">
          <SelectCustom
            id="pageId"
            name="pageId"
            fill={true}
            options={listFanpage}
            special={true}
            value={valueFanpage}
            onMenuOpen={onSelectOpenFanpage}
            placeholder="Chọn fanpage"
            isLoading={isLoadingFanpage}
            onChange={(e) => handleChangeValueFanpage(e)}
          />
        </div>
      </div>

      <div className="card-box d-flex flex-column">
        <div className="list__tabs">
          <ul className="menu__items">
            {listTabs.map((item, idx) => {
              return (
                <li
                  key={idx}
                  className={item.is_active == tab.name ? "active" : ""}
                  onClick={(e) => {
                    e && e.preventDefault();
                    setTab({
                      name: item.is_active,
                      type: item.type,
                    });
                  }}
                >
                  {item.name}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="main__content">
          <div className="main__content--left">
            <div className="search_chat">
              <SearchBox name="Tin nhắn" params={paramsFanpageDialog} updateParams={(paramsNew) => setParmsFanpageDialog(paramsNew)} />
            </div>

            <div className="list__users--chat">
              {!isLoadingFanpageDialog && listFanpageDialog && listFanpageDialog.length > 0 ? (
                listFanpageDialog.map((item, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`user-item ${item.id == dataFanpageDialog?.id ? "active-user" : ""}`}
                      onClick={() => setDataFanpageDialog(item)}
                    >
                      <div className="info__user">
                        <div className="avatar">
                          <Image src={item.avatar} imageError={ImageThirdGender} alt={item.name} />
                        </div>

                        <div className="name__user">
                          <h3>{item.name}</h3>
                          <p className="preview-message">{item.content}</p>
                        </div>
                      </div>
                      <span className="time-chat">{moment(item.publishedTime).format("HH:mm")}</span>
                    </div>
                  );
                })
              ) : isLoadingFanpageDialog ? (
                <Loading />
              ) : (
                <div className="notify-chatting">
                  <div className="img-notify">
                    <img src={NoImageChat} alt="" />
                  </div>
                  <h2>Fanpage của bạn chưa có thành viên nào!</h2>
                </div>
              )}
            </div>
          </div>
          <div className="main__content--right">
            {tab.name == "tab_one" ? (
              <ListChat dataFanpageDialog={dataFanpageDialog} tab={tab} onClick={() => setShowModalAdd(true)} />
            ) : (
              <ListComment dataFanpageDialog={dataFanpageDialog} tab={tab} />
            )}
          </div>
        </div>
      </div>

      <AddCustomerPersonModal
        onShow={showModalAdd}
        onHide={() => setShowModalAdd(false)}
        nameCustomer={dataFanpageDialog?.name}
        avatarCustomer={dataFanpageDialog?.avatar}
      />
    </div>
  );
}
