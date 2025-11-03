import React, { useRef, useState } from "react";
import _ from "lodash";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IListTabDetailProps } from "model/customer/PropsModel";
import "./ListDetailTabPartner.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Grid } from "swiper";
import ExchangePartnerList from "./ExchangePartnerList/ExchangePartnerList";
import OrderPartnerList from "./OrderPartnerList/OrderPartnerList";

export default function ListDetailTabPartner(props: IListTabDetailProps) {
  const { data } = props;

//   const { type } = useParams();
  const swiperRelationshipRef = useRef(null);

  const [tab, setTab] = useState<string>(() => {
    return "tab_one";
  });

  const [tabChildren, setTabChildren] = useState<string>(() => {
    return "tab_children_one" ;
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
        // {
        //   title: "Ý kiến khách hàng",
        //   tab_children: "tab_children_two",
        // },
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
        // {
        //   title: "Tương tác",
        //   tab_children: "tab_children_two",
        // },
      ],
    },
    
    // {
    //   title: "Tài liệu",
    //   is_active: "tab_ten",
    //   is_tab_children: 0,
    // },
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
    <div className="wrapper-tab-partner">
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
                
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
          
        </DragDropContext>
      </div>
      <div className="details-tab">
        {tab === "tab_one" ? (
          tabChildren === "tab_children_one" ? (
            <ExchangePartnerList idPartner={data.id} />
          ) : null
        ) : tab === "tab_two" ? (
            tabChildren === "tab_children_one" ? (
              <OrderPartnerList />
            ) : (
                <div></div>
            //   <InteractList data={data} />
            )
        ) : tab === "tab_seven" ? (
            <div></div>
          
        ) : (
            <div></div>
        )}
      </div>
      {/* <CustomerContact idCustomer={data.id} />
      <AttachmentsList idCustomer={data.id} /> */}
    </div>
  );
}
