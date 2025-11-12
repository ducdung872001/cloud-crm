import React, { Fragment } from "react";
import { Draggable } from "react-beautiful-dnd";
import Icon from "components/icon";
import "./TaskItemTicket.scss";
import Tippy from "@tippyjs/react";
import moment from "moment";
import Badge from "components/badge/badge";

export default function TaskItemTicket(props: any) {
  const { item, index, column, callbackHistory, callBackAction } = props;
  console.log("item task item ticket:", item);

  return (
    <Fragment>
      <Draggable key={item.id} draggableId={item.id.toString()} isDragDisabled={true} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              userSelect: "none",
              backgroundColor: snapshot.isDragging ? "white" : "white",
              ...provided.draggableProps.style,
            }}
            className="task__item_ticket--bpm"
            onDoubleClick={(e) => {
              callbackHistory(item);

              // setIdWork(item.id);
              // setShowModalView(true);
            }}
          >
            {/* <Tippy 
              content={<TippyInvoiceInfo detailCustomer={item}/>} 
              delay={[120, 100]} 
              animation="scale" 
            //   interactive={true}
            > */}
            {/* <div className={`task-infomation ${item?.status === 1  ? "disabled__task--item" : ""}`}> */}

            <div className={`task-infomation`}>
              {/* <h4 className="title--job">{item.invoiceResponse?.invoiceCode || ''}</h4> */}
              {/* <Tippy 
                              content={<TippyInvoiceInfo detailCustomer={item}/>} 
                              delay={[120, 100]} 
                              animation="scale" 
                            //   interactive={true}
                            > */}
              <div style={{ display: "flex", cursor: "pointer" }}>
                <div style={{}}>
                  <Icon name="CollectInfo" style={{ width: 13, top: 0, fill: "#1c8cff", cursor: "pointer" }} />
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 5 }}>
                    {item?.dataDetail ? "Ticket - " + item?.dataDetail?.code || "" : "Không tìm thấy Ticket"}
                  </span>
                </div>
              </div>
              {/* </Tippy> */}

              <div>
                <span style={{ fontSize: 12, fontWeight: "400" }}>Khách hàng: {item?.dataDetail?.customerName || ""}</span>
              </div>

              <div>
                <span style={{ fontSize: 12, fontWeight: "400" }}>
                  Thời gian tạo: {item?.dataDetail?.createdTime ? moment(item?.dataDetail?.createdTime).format("DD/MM/YYYY  HH:mm") : ""}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, fontWeight: "400" }}>Người hỗ trợ: {item?.dataDetail?.employeeName || ""}</span>
              </div>

              <div>
                <span style={{ fontSize: 12, fontWeight: "400" }}>
                  Trạng thái : &nbsp;
                  <Badge
                    key={item.id}
                    text={
                      !item?.dataDetail?.status
                        ? "Chưa thực hiện"
                        : item?.dataDetail?.status === 1
                        ? "Đang thực hiện"
                        : item?.dataDetail?.status === 2
                        ? "Đã hoàn thành"
                        : item?.dataDetail?.status === 4
                        ? "Tạm dừng"
                        : "Đã hủy"
                    }
                    variant={
                      !item?.dataDetail?.status
                        ? "secondary"
                        : item?.dataDetail?.status === 1
                        ? "primary"
                        : item?.dataDetail?.status === 2
                        ? "success"
                        : item?.dataDetail?.status === 4
                        ? "warning"
                        : "error"
                    }
                  />
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                <Tippy content="Xoá">
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      callBackAction(item, "delete");
                    }}
                  >
                    <Icon name="Trash" style={{ width: 15, top: 0, fill: "var(--error-color)" }} />
                  </div>
                </Tippy>
              </div>
            </div>

            {/* </Tippy> */}
          </div>
        )}
      </Draggable>
      {/* <ViewWorkModal
        idWork={idWork}
        onShow={showModalView}
        onHide={(reload) => {
          setShowModalView(false);
        }}
      /> */}
    </Fragment>
  );
}
