import React, { useRef, useState } from "react";
import _ from "lodash";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IListTabDetailProps } from "model/customer/PropsModel";
import WarrantyPersonList from "./partials/WarrantyPersonList/WarrantyPersonList";
import TicketPersonList from "./partials/TicketPersonList/TicketPersonList";
import ExchangePersonList from "./partials/ExchangePersonList/ExchangePersonList";
import FeedbackPersonList from "./partials/FeedbackPersonList/FeedbackPersonList";
import CustomerSMSList from "./partials/CustomerSMSList/CustomerSMSList";
import CustomerEmailList from "./partials/CustomerEmailList/CustomerEmailList";
import OrderList from "./partials/OrderList/OrderList";
import AttachmentsList from "./partials/AttachmentsList/AttachmentsList";
import CustomerInteraction from "./partials/CustomerInteraction/CustomerInteraction";
import "./ListDetailTab.scss";
import CustomerZaloList from "./partials/CustomerZaloList/CustomerZaloList";
import InteractList from "./partials/InteractList";
import CustomerJob from "./partials/CustomerJob/CustomerJob";
import CustomerOpportunity from "./partials/CustomerOpportunity/CustomerOpportunity";
import CustomerContact from "./partials/CustomerContact/CustomerContact";
import CustomerSchedule from "./partials/CustomerSchedule/CustomerSchedule";
import BriefFinancialStatements from "./partials/BriefFinancialStatements";
import FullFinancialReports from "./partials/FullFinancialReports";
import InfoCIC from "./partials/InfoCIC";
import TransactionInformation from "./partials/TransactionInformation";
import CustomerRevenue from "./partials/CustomerRevenue";
import ProductNeeds from "./partials/ProductNeeds";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Grid } from "swiper";

export default function ListDetailTab(props: IListTabDetailProps) {
  const { data } = props;

  const { type } = useParams();
  const swiperRelationshipRef = useRef(null);

  const [tab, setTab] = useState<string>(() => {
    return type == "purchase_invoice" ? "tab_three" : "tab_one";
  });

  const [tabChildren, setTabChildren] = useState<string>(() => {
    return type == "purchase_invoice" ? "tab_children_two" : "";
  });

  const listTabItems = [
    {
      title: "Trao đổi",
      is_active: "tab_one",
      is_tab_children: 1,
      children: [
        {
          title: "Trao đổi nội bộ",
          tab_children: "tab_children_one",
        },
        {
          title: "Ý kiến khách hàng",
          tab_children: "tab_children_two",
        },
      ],
    },
    {
      title: "Lịch sử",
      is_active: "tab_two",
      is_tab_children: 1,
      children: [
        {
          title: "Giao dịch",
          tab_children: "tab_children_one",
        },
        {
          title: "Tương tác",
          tab_children: "tab_children_two",
        },
      ],
    },
    {
      title: "Tài chính",
      is_active: "tab_three",
      is_tab_children: 1,
      children: [
        {
          title: "Báo cáo tài chính rút gọn",
          tab_children: "tab_children_one",
        },
        {
          title: "Báo cáo tài chính đầy đủ",
          tab_children: "tab_children_two",
        },
        {
          title: "Thông tin CIC",
          tab_children: "tab_children_three",
        },
        {
          title: "Thông tin giao dịch",
          tab_children: "tab_children_four",
        },
        {
          title: "Thu thuần từ khách hàng",
          tab_children: "tab_children_five",
        },
        {
          title: "Nhu cầu sản phẩm",
          tab_children: "tab_children_six",
        },
      ],
    },
    {
      title: "Cơ hội",
      is_active: "tab_four",
      is_tab_children: 0,
    },
    {
      title: "Công việc",
      is_active: "tab_five",
      is_tab_children: 0,
    },
    {
      title: "Lịch hẹn",
      is_active: "tab_six",
      is_tab_children: 0,
    },
    {
      title: "Người liên hệ",
      is_active: "tab_seven",
      is_tab_children: 0,
    },
    {
      title: "Bảo hành",
      is_active: "tab_eight",
      is_tab_children: 0,
    },
    {
      title: "Hỗ trợ",
      is_active: "tab_nine",
      is_tab_children: 0,
    },
    {
      title: "Tài liệu",
      is_active: "tab_ten",
      is_tab_children: 0,
    },
  ];

  const lstTabLocalStorage = JSON.parse(localStorage.getItem("lstTabDetailCustomer") || "[]");

  const [listTabs, setListTabs] = useState(() => {
    return lstTabLocalStorage && lstTabLocalStorage.length > 0 ? lstTabLocalStorage : listTabItems;
  });
  console.log('listTabs', listTabs);
  

  const handleOnDragEnd = (result) => {
    // Nếu không có đích đến, thoát ra
    if (!result.destination) return;

    // Sao chép lại danh sách ban đầu
    const items = Array.from(listTabs);

    // Lấy phần tử bị kéo ra khỏi danh sách
    const [reorderedItem] = items.splice(result.source.index, 1);

    // Chèn lại phần tử bị kéo vào vị trí mới
    items.splice(result.destination.index, 0, reorderedItem);

    // Cập nhật lại trạng thái danh sách
    setListTabs(items);
    localStorage.setItem("lstTabDetailCustomer", JSON.stringify(_.cloneDeep(items)));
  };

  return (
    <div className="wrapper-tab">
      <div className="list-tab">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="tabs" direction="horizontal">
            {(provided) => (
              <ul className="action__option--title" {...provided.droppableProps} ref={provided.innerRef}>
                {listTabs.map((item, idx) => (
                  <Draggable key={item.is_active} draggableId={item.is_active} index={idx}>
                    {(provided) => (
                      <li
                        key={idx}
                        className={`${item.is_active === tab ? "active" : ""} ${item.is_tab_children ? "confirm-children" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setTab(item.is_active);
                        }}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        {item.title}

                        {item.children && (
                          <div className="box__menu--lv2">
                            <ul className="menu-lv2--list">
                              {item.children.map((el, index) => (
                                <li
                                  key={index}
                                  className={`children-item ${el.tab_children === tabChildren ? "active-lv2-children" : ""}`}
                                  onClick={() => {
                                    setTabChildren(el.tab_children);
                                  }}
                                >
                                  {el.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    )}
                  </Draggable>
                ))}
                {/* <Swiper
                  onInit={(core: SwiperCore) => {
                    swiperRelationshipRef.current = core.el;
                  }}
                  className="tab-slider"
                  grid={{
                    rows: 1,
                  }}
                  navigation={true}
                  modules={[Grid, Navigation]}
                  slidesPerView={6}
                  spaceBetween={8}
                >
                  {listTabs.map((item, idx) => {
                    return (
                      <SwiperSlide key={idx} className="list__tab--slide">
                        <Draggable key={item.is_active} draggableId={item.is_active} index={idx}>
                          {(provided) => (
                            <li
                              key={idx}
                              className={`${item.is_active === tab ? "active" : ""} ${item.is_tab_children ? "confirm-children" : ""}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setTab(item.is_active);
                              }}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                            >
                              {item.title}

                              {item.children && (
                                <div className="box__menu--lv2">
                                  <ul className="menu-lv2--list">
                                    {item.children.map((el, index) => (
                                      <li
                                        key={index}
                                        className={`children-item ${el.tab_children === tabChildren ? "active-lv2-children" : ""}`}
                                        onClick={() => {
                                          setTabChildren(el.tab_children);
                                        }}
                                      >
                                        {el.title}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </li>
                          )}
                        </Draggable>
                      </SwiperSlide>
                    );
                  })}
                </Swiper> */}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
          
        </DragDropContext>
      </div>
      <div className="details-tab">
        {tab === "tab_one" ? (
          tabChildren === "tab_children_one" ? (
            <ExchangePersonList idCustomer={data.id} />
          ) : (
            <FeedbackPersonList idCustomer={data.id} />
          )
        ) : tab === "tab_two" ? (
          tabChildren === "tab_children_one" ? (
            <OrderList />
          ) : (
            <InteractList data={data} />
          )
        ) : tab === "tab_three" ? (
          tabChildren === "tab_children_one" ? (
            <BriefFinancialStatements data={data} />
          ) : tabChildren === "tab_children_two" ? (
            <FullFinancialReports data={data} />
          ) : tabChildren === "tab_children_three" ? (
            <InfoCIC data={data} />
          ) : tabChildren === "tab_children_four" ? (
            <TransactionInformation data={data} />
          ) : tabChildren === "tab_children_five" ? (
            <CustomerRevenue data={data} />
          ) : (
            <ProductNeeds data={data} />
          )
        ) : tab === "tab_four" ? (
          <CustomerOpportunity dataCustomer={data} />
        ) : tab === "tab_five" ? (
          <CustomerJob dataCustomer={data} />
        ) : tab === "tab_six" ? (
          <CustomerSchedule idCustomer={data.id} />
        ) : tab === "tab_seven" ? (
          <CustomerContact idCustomer={data.id} />
        ) : tab === "tab_eight" ? (
          <WarrantyPersonList idCustomer={data.id} />
        ) : tab === "tab_nine" ? (
          <TicketPersonList idCustomer={data.id} />
        ) : (
          <AttachmentsList idCustomer={data.id} />
        )}
      </div>
    </div>
  );
}
