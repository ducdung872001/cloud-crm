import React, { useRef, useState } from "react";
import _ from "lodash";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IListTabDetailProps } from "model/customer/PropsModel";
import WarrantyPersonList from "./partials/WarrantyPersonList/WarrantyPersonList";
import TicketPersonList from "./partials/TicketPersonList/TicketPersonList";
import ExchangePersonList from "./partials/ExchangePersonList/ExchangePersonList";
import FeedbackPersonList from "./partials/FeedbackPersonList/FeedbackPersonList";
import OrderList from "./partials/OrderList/OrderList";
import AttachmentsList from "./partials/AttachmentsList/AttachmentsList";
import "./ListDetailTab.scss";
import CustomerJob from "./partials/CustomerJob/CustomerJob";
import CustomerContact from "./partials/CustomerContact/CustomerContact";
import CustomerSchedule from "./partials/CustomerSchedule/CustomerSchedule";

export default function ListDetailTab(props: IListTabDetailProps) {
  const { data } = props;
  const { type } = useParams();
  const swiperRelationshipRef = useRef(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Tabs phù hợp với bán lẻ retail - bỏ CIC, Tài chính, Cơ hội
  const listTabItems = [
    {
      title: "Lịch sử mua hàng",
      is_active: "tab_two",
      is_tab_children: 0,
    },
    {
      title: "Trao đổi",
      is_active: "tab_one",
      is_tab_children: 1,
      children: [
        { title: "Trao đổi nội bộ",   tab_children: "tab_children_one" },
        { title: "Ý kiến khách hàng", tab_children: "tab_children_two" },
      ],
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

  // Reset localStorage nếu chứa tabs cũ không còn dùng
  const lstTabLocalStorage = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem("lstTabDetailCustomer") || "[]");
      const validKeys = new Set(listTabItems.map((t) => t.is_active));
      if (saved.length > 0 && saved.every((t: any) => validKeys.has(t.is_active))) {
        return saved;
      }
      localStorage.removeItem("lstTabDetailCustomer");
      return [];
    } catch {
      return [];
    }
  })();

  const [tab, setTab] = useState<string>("tab_two"); // mặc định: Lịch sử mua hàng
  const [tabChildren, setTabChildren] = useState<string>("");

  const [listTabs, setListTabs] = useState(() => {
    return lstTabLocalStorage.length > 0 ? lstTabLocalStorage : listTabItems;
  });

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(listTabs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setListTabs(items);
    localStorage.setItem("lstTabDetailCustomer", JSON.stringify(_.cloneDeep(items)));
  };

  const [menuPos, setMenuPos] = useState<{ left: number; top: number } | null>(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  function handleMouseEnter(e: React.MouseEvent<HTMLLIElement>, item?: any) {
    if (!item?.children?.length) return;
    const li = e.currentTarget;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const liRect = li.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    setMenuPos({
      left: Math.max(0, liRect.left - wrapperRect.left + wrapper.scrollLeft),
      top: Math.max(0, liRect.bottom - wrapperRect.top + wrapper.scrollTop),
    });
    setHoveredItem(item);
  }

  function handleMouseLeave() {
    setMenuPos(null);
    setHoveredItem(null);
  }

  return (
    <div className="wrapper-tab" ref={wrapperRef}>
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
                        onMouseEnter={(e) => handleMouseEnter(e, item)}
                        onMouseLeave={item.is_tab_children ? handleMouseLeave : undefined}
                        className={`${item.is_active === tab ? "active" : ""} ${item.is_tab_children ? "confirm-children" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setTab(item.is_active);
                        }}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{ ...provided.draggableProps.style }}
                      >
                        {item.title}
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

      {menuPos && hoveredItem?.children?.length && (
        <div
          className="hover-tooltip"
          style={{ position: "absolute", left: `${menuPos.left}px`, top: `${menuPos.top}px`, zIndex: 2147483647 }}
          onMouseLeave={handleMouseLeave}
        >
          <ul className="hover-children-list">
            {hoveredItem.children.map((c, i) => (
              <li
                key={i}
                className={`hover-child-item ${c.tab_children === tabChildren ? "active-lv2-children" : ""}`}
                onClick={(ev) => {
                  ev.stopPropagation();
                  setTab(hoveredItem.is_active);
                  setTabChildren(c.tab_children);
                  setMenuPos(null);
                  setHoveredItem(null);
                }}
              >
                {c.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="details-tab">
        {tab === "tab_two" ? (
          <OrderList />
        ) : tab === "tab_one" ? (
          tabChildren === "tab_children_one" ? (
            <ExchangePersonList idCustomer={data.id} />
          ) : (
            <FeedbackPersonList idCustomer={data.id} />
          )
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