import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Loading from "components/loading";
import WarrantyCategoryService from "services/WarrantyCategoryService";
import { IKanbanWarrantyProps } from "model/warranty/PropsModel";
import { IWarrantyCategoryResponse } from "model/warrantyCategory/WarrantyCategoryResponseModel";
import { IWarrantyCategoryFilterRequest } from "model/warrantyCategory/WarrantyCategoryRequestModel";
import { showToast } from "utils/common";
import { IWarrantyProcessRequestModel } from "model/warranty/WarrantyRequestModel";
import WarrantyService from "services/WarrantyService";
import TaskItem from "./partials/TaskItem/TaskItem";
import TransferExecutor from "./partials/TransferExecutor/TransferExecutor";
import "./KanbanWarranty.scss";

export default function KanbanWarranty(props: IKanbanWarrantyProps) {
  const { data } = props;

  const [columns, setColumns] = useState<any[]>([]);
  const [idEndPoint, setIdEndPoint] = useState<number>();
  const [idStatusWarranty, setIdStatusWarranty] = useState<number>();
  const [idWarranty, setIdWarranty] = useState<number>();
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [listStatusWarranty, setListStatusWarranty] = useState<IWarrantyCategoryResponse[]>([]);
  const [isLoadingStatusWarranty, setIsLoadingStatusWarranty] = useState<boolean>(false);
  const [updateStatusWarranty, setUpdateStatusWarranty] = useState<IWarrantyProcessRequestModel>({
    id: 0,
    executorId: 0,
    statusId: 0,
    warrantyId: 0,
  });

  const paramStatusWarranty: IWarrantyCategoryFilterRequest = {
    type: 1,
  };

  const getListStatusWarranty = async () => {
    setIsLoadingStatusWarranty(true);

    const response = await WarrantyCategoryService.list(paramStatusWarranty);

    if (response.code === 0) {
      const result = response.result;
      setListStatusWarranty(result.items);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingStatusWarranty(false);
  };

  useEffect(() => {
    getListStatusWarranty();
  }, []);

  useEffect(() => {
    if (listStatusWarranty && listStatusWarranty?.length > 0) {
      const result = listStatusWarranty.map((item) => {
        return {
          id: item.id,
          title: item.name,
          items: data.filter((element) => {
            return element.statusId === item.id;
          }),
        };
      });

      setColumns(result);
    }
  }, [listStatusWarranty, data]);

  //? đoạn này xử lý vấn đề call api cập nhật trạng thái bảo hành
  const handleUpdateStatusWarranty = async () => {
    const response = await WarrantyService.warrantyProcessUpdate(updateStatusWarranty);
    if (response.code === 0) {
      showToast("Chuyển trạng thái thành công", "success");
      setIdStatusWarranty(response.result.id);
      setIsShowModal(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //! đoạn này xử lý vấn đề cập nhật trạng thái bảo hành
  useEffect(() => {
    if (idEndPoint !== undefined && idWarranty !== undefined && updateStatusWarranty.statusId !== idEndPoint) {
      setUpdateStatusWarranty({ ...updateStatusWarranty, statusId: idEndPoint, warrantyId: idWarranty });
    }
  }, [idEndPoint, idWarranty, updateStatusWarranty.statusId]);

  useEffect(() => {
    if (updateStatusWarranty.statusId !== 0) {
      handleUpdateStatusWarranty();
    }
  }, [updateStatusWarranty]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const newColumns = [...columns];

    const dragItem = newColumns[parseInt(source.droppableId)].items[source.index];
    setIdWarranty(dragItem.id);

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
    <div className="wrapper-kanban-warranty">
      {!isLoadingStatusWarranty && listStatusWarranty && listStatusWarranty.length > 0 ? (
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
        data={updateStatusWarranty}
        idWarranty={idWarranty}
        idStatusWarranty={idStatusWarranty}
        onHide={(reload) => {
          if (reload) {
            setIsShowModal(false);
          }
        }}
      />
    </div>
  );
}
