import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Loading from "components/loading";
import TicketCategoryService from "services/TicketCategoryService";
import { IKanbanTicketProps } from "model/ticket/PropsModel";
import { ITicketProcessRequestModel } from "model/ticket/TicketRequestModel";
import TicketService from "services/TicketService";
import { showToast } from "utils/common";
import TaskItem from "./TaskItem/TaskItem";
import TransferExecutor from "./TransferExecutor/TransferExecutor";
import "./KanbanTicket.scss";

export default function KanbanTicket(props: IKanbanTicketProps) {
  const { data, isRegimeKanban } = props;

  const [columns, setColumns] = useState<any[]>([]);
  const [idEndPoint, setIdEndPoint] = useState<number>();
  const [idStatusTicket, setIdStatusTicket] = useState<number>();
  const [idTicket, setIdTicket] = useState<number>();
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [listStatusTicket, setListStatusTicket] = useState([]);
  const [isLoadingStatusTicket, setIsLoadingStatusTicket] = useState<boolean>(false);
  const [updateStatusTicket, setUpdateStatusTicket] = useState<ITicketProcessRequestModel>({
    id: 0,
    executorId: 0,
    statusId: 0,
    ticketId: 0,
  });

  const paramStatusTicket = {
    type: 1,
  };

  const getListStatusTicket = async () => {
    setIsLoadingStatusTicket(true);

    const response = await TicketCategoryService.list(paramStatusTicket);

    if (response.code === 0) {
      const result = response.result;
      setListStatusTicket(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingStatusTicket(false);
  };

  useEffect(() => {
    if (isRegimeKanban) {
      getListStatusTicket();
    }
  }, [isRegimeKanban]);

  useEffect(() => {
    const result = listStatusTicket.map((item) => {
      return {
        id: item.id,
        title: item.name,
        items: data.filter((element) => {
          return element.supportId === item.id;
        }),
      };
    });

    setColumns(result);
  }, [listStatusTicket, data]);

  console.log("lstStatusTicket : ", listStatusTicket);

  //? đoạn này xử lý vấn đề call api cập nhật trạng thái bảo hành
  const handleUpdateStatusTicket = async () => {
    const response = await TicketService.ticketProcessUpdate(updateStatusTicket);
    if (response.code === 0) {
      showToast("Chuyển trạng thái thành công", "success");
      setIdStatusTicket(response.result.id);
      setIsShowModal(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //! đoạn này xử lý vấn đề cập nhật trạng thái bảo hành
  useEffect(() => {
    if (idEndPoint !== undefined && idTicket !== undefined && updateStatusTicket.statusId !== idEndPoint) {
      setUpdateStatusTicket({ ...updateStatusTicket, statusId: idEndPoint, ticketId: idTicket });
    }
  }, [idEndPoint, idTicket, updateStatusTicket.statusId]);

  useEffect(() => {
    if (updateStatusTicket.statusId !== 0) {
      handleUpdateStatusTicket();
    }
  }, [updateStatusTicket]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const newColumns = [...columns];

    const dragItem = newColumns[parseInt(source.droppableId)].items[source.index];
    setIdTicket(dragItem.id);

    //! biến này tạo ra với mục đích lấy cột hiện tại
    const sourceColumn = columns[source.droppableId];

    //! biến này tạo ra với mục đích lấy cột cuối muốn kéo thả đến
    const destColumn = newColumns[destination.droppableId];

    //? đoạn này check đk nếu như id của điểm đầu khác với id của điểm cuối
    //* thì lúc đó mới lấy giá trị điểm cuối cùng
    if (sourceColumn.id !== destColumn.id) {
      setIdEndPoint(destColumn.id);
    }

    newColumns[parseInt(source.droppableId)].items.splice(source.index, 1);

    newColumns[parseInt(destination.droppableId)].items.splice(destination.index, 0, dragItem);

    setColumns(newColumns);
  };

  return (
    <div className="wrapper-kanban-ticket">
      {!isLoadingStatusTicket && listStatusTicket && listStatusTicket.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map((column, idx) => {
            return (
              <Droppable key={idx} droppableId={idx.toString()}>
                {(provided, snapshot) => {
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ backgroundColor: snapshot.isDraggingOver ? "#D1FAE5" : "#f4f5f7" }}
                      className="task-list"
                    >
                      <div className="wrapper__title">
                        <span className="title-task">{column.title}</span>
                        <span className="total-task">{column.items.length}</span>
                      </div>
                      {column.items.map((item, idx) => {
                        return <TaskItem key={idx} item={item} index={idx} />;
                      })}
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            );
          })}
        </DragDropContext>
      ) : (
        <div className="loading-kanban">
          <Loading />
        </div>
      )}
      <TransferExecutor
        onShow={isShowModal}
        data={updateStatusTicket}
        idTicket={idTicket}
        idStatusTicket={idStatusTicket}
        onHide={(reload) => {
          if (reload) {
            setIsShowModal(false);
          }
        }}
      />
    </div>
  );
}
