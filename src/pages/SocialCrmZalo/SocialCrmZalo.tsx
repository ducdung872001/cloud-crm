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
// import ListComment from "./partials/ListComment";
import "./SocialCrmZalo.scss";
import ZaloOAService from "services/ZaloOAService";
import { IZaloFollowerFilterRequest } from "model/zaloOA/ZaloOARequest";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";

export default function SocialCrmZalo() {
  document.title = "Kết nối với Zalo";

  //! đoạn này xử lý vấn đề chọn fanpage
  const [zaloAccountList, setZaloAccountList] = useState([]);
//   console.log('zaloAccountList', zaloAccountList);
  
  const [accountSelected, setAccountSelected] = useState({
        value: '',
        label: 'Tất cả tài khoản',
        oaId: '',
  });
//   console.log('accountSelected', accountSelected);
  
  const [isLoadingAccountList, setIsLoadingAccountList] = useState<boolean>(false);

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
    // {
    //   name: "Bình luận",
    //   is_active: "tab_two",
    //   type: "comment",
    // },
  ];

  const onSelectOpenAccountList = async () => {
    setIsLoadingAccountList(true);

    const response = await ZaloOAService.list();
    // console.log('response', response);
    
    if (response.code === 0) {
        const dataOption = response.result || [];
        // const dataOption = [
        //                 {
        //                     id: '1234',
        //                     name: 'Community',
        //                     oaId: '1234OA'
        //                 },
        //                 {
        //                     id: '123',
        //                     name: 'Reborn Zalo',
        //                     oaId: '123OA'
        //                 }
        //             ]
        const newArray = [{
            value: '',
            label: 'Tất cả tài khoản',
            oaId: '',
        }]
        if(dataOption.length > 0){
            dataOption.map(item => {
                newArray.push({
                    value: item.id,
                    label: item.name,
                    oaId: item.oaId
                })
            })
        }        
        setZaloAccountList(newArray)
    }

    setIsLoadingAccountList(false);
  };

  useEffect(() => {
    onSelectOpenAccountList();
  }, []);

  const handleSelectZaloAccount = (e) => {
    // console.log('e', e);
    setAccountSelected(e);
    setDataDialog(null);
    setParamZaloFollowerList({ ...paramsZaloFollowerList, oaId: e?.oaId });
  };

  //! đoạn này xử lý vấn đề lấy danh sách hội thoại
  const [zaloFollowerList, setZaloFollowerList] = useState(null);  
  console.log('zaloFollowerList', zaloFollowerList);
  
  const [dataDialog, setDataDialog] = useState(null);
  
  const [paramsZaloFollowerList, setParamZaloFollowerList] = useState<IZaloFollowerFilterRequest>({
    keyword:"",
    oaId: "",
    page: 1,
    limit: 20,
  });

  const [paramsZaloFollowerListMore, setParamZaloFollowerListMore] = useState<IZaloFollowerFilterRequest>({
    keyword:"",
    oaId: "",
    page: 1,
    limit: 20,
  });

//   useEffect(() => {
//     if (accountSelected) {
//         setParamZaloFollowerList({ ...paramsZaloFollowerList, oaId: accountSelected?.oaId });
//     }
//   }, [accountSelected]);

  const [isLoadingZaloFollower, setIsLoadingZaloFollower] = useState<boolean>(false);

  const getListFanpageDialog = async (paramsSearch: IZaloFollowerFilterRequest) => {
    setIsLoadingZaloFollower(true);

    const response = await ZaloOAService.listZaloFollower(paramsSearch);
    // console.log('responseZalo', response);
    
    if (response.code === 0) {
      const result = response.result;
      setZaloFollowerList(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      
      //fake data
    //   setZaloFollowerList([
    //     {
    //         id: 1,
    //         oaId: 1,
    //         userId: 123,
    //         avatar:'',
    //         name: 'Trung Nguyen',
    //         content: 'xin chao toi là Trung',
    //         publishedTime: new Date()
    //     },
    //     {
    //         id: 2,
    //         oaId: 2,
    //         userId: 345,
    //         avatar:'',
    //         name: 'Tung2k1',
    //         content: 'được đấy',
    //         publishedTime: new Date()
    //     }
    //   ])
    }

    setIsLoadingZaloFollower(false);
  };

  const getListFanpageDialogMore = async (e, data, currentParam) => {
    
    const resultScroll = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    
    if(resultScroll && data?.loadMoreAble){
      const param = {
        ...currentParam,
        limit: 20,
        page: data.page + 1
      }

      const response = await ZaloOAService.listZaloFollower(param);
    
      if (response.code === 0) {
        const result = response.result;

        const newData = {
          ...result,
          items: [...data.items, ...result.items]
        }
        setZaloFollowerList(newData);
        setParamZaloFollowerListMore(param);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  useEffect(() => {
    if (paramsZaloFollowerList) {
      getListFanpageDialog(paramsZaloFollowerList);
    }
  }, [paramsZaloFollowerList]);

  ///Thêm khách hàng nhanh
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);


  return (
    <>
        <div className="page-content page-crm-facebook">
          <div className="action-header">
              <div className="title-page">
                <h1>Kênh Zalo</h1>
              </div>
              <div className="option__page--connect">
                <SelectCustom
                    id="oaId"
                    name="oaId"
                    fill={true}
                    options={zaloAccountList}
                    special={true}
                    value={accountSelected}
                    onMenuOpen={onSelectOpenAccountList}
                    placeholder="Chọn tài khoản"
                    isLoading={isLoadingAccountList}
                    onChange={(e) => handleSelectZaloAccount(e)}
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
                      <SearchBox name="Hội thoại" params={paramsZaloFollowerList} updateParams={(paramsNew) => setParamZaloFollowerList(paramsNew)} />
                    </div>

                    <div 
                      className="list__users--chat"
                      onScroll={(e) => {
                        getListFanpageDialogMore(e, zaloFollowerList, paramsZaloFollowerListMore);
                      }}
                    >
                      {!isLoadingZaloFollower && zaloFollowerList?.items && zaloFollowerList?.items.length > 0 ? (
                          zaloFollowerList.items.map((item, idx) => {
                            return (
                                <div
                                  key={idx}
                                  className={`user-item ${item.id == dataDialog?.id ? "active-user" : ""}`}
                                  onClick={() => setDataDialog(item)}
                                >
                                <div className="info__user">
                                    <div className="avatar">
                                      <Image src={item.avatar || ''} imageError={ImageThirdGender} alt={item.name} />
                                    </div>

                                    <div className="name__user">
                                      <h3>{item.displayName || 'Ẩn danh'}</h3>
                                      <p className="preview-message">{item.content}</p>
                                    </div>
                                </div>
                                {/* <span className="time-chat">{moment(item.publishedTime).format("HH:mm")}</span> */}
                                </div>
                            );
                          })
                      ) : isLoadingZaloFollower ? (
                          <Loading />
                      ) : (
                          <div className="notify-chatting">
                            <div className="img-notify">
                                <img src={NoImageChat} alt="" />
                            </div>
                            <h2>Chưa có hội thoại nào!</h2>
                          </div>
                      )}
                    </div>
                </div>
                <div className="main__content--right">
                    <ListChat dataFanpageDialog={dataDialog} onClick={() => setShowModalAdd(true)}/>  
                    {/* {tab.name == "tab_one" ? (
                    <ListChat dataFanpageDialog={dataFanpageDialog} tab={tab} />
                    ) : (
                    <ListComment dataFanpageDialog={dataFanpageDialog} tab={tab} />
                    )} */}
                </div>
              </div>
          </div>
        </div>
        <AddCustomerPersonModal
          onShow={showModalAdd}
          onHide={() => setShowModalAdd(false)}
          nameCustomer= {dataDialog?.displayName}
          avatarCustomer= {dataDialog?.avatar}
          zaloUserId = {dataDialog?.userId}
        />
    </>
  );
}
