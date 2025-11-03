import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { showToast } from "utils/common";
import { IUpdateStatusRequest } from "model/workOrder/WorkOrderRequestModel";
import SearchBox from "components/searchBox/searchBox";
import TaskItem from "./TaskItem/TaskItem";
import SupportTaskModal from "./SupportTaskModal/SupportTaskModal";
import "./KanbanContact.scss";
import ContractService from "services/ContractService";
import { IContactResponse } from "model/contact/ContactResponseModel";
import { IContactRequest } from "model/contact/ContactRequestModel";
import { IKanbanContactProps } from "model/contact/PropsModel";
import ContactService from "services/ContactService";

export default function KanbanContact(props: IKanbanContactProps) {
    const { data, onReload, params, setParams, contractFilterList, listStatusContact } = props;
    
    const [columns, setColumns] = useState<any[]>([]);
    // console.log('columns', columns);
    
    
    const [idEndPoint, setIdEndPoint] = useState<number>(null);
    const [dataWork, setDataWork] = useState<IContactResponse>(null);
    
    const [submitTask, setSubmitTask] = useState<boolean>(false);
    const [showModalSupport, setShowModalSupport] = useState<boolean>(false);

    useEffect(() => {
        const result = listStatusContact.map((item) => {
        return {
            id: item.value,
            title: item.label,
            color: item.color,
            items: data.filter((element) => {
            return element.statusId === item.value;
            }),
        };
        });
        setColumns(result);  
    
    }, [data, listStatusContact]);

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;

        const newColumns = [...columns];

        const dragItem = newColumns[parseInt(source.droppableId)].items[source.index];
        setDataWork(dragItem);

        //! biến này tạo ra với mục đích lấy cột hiện tại
        const sourceColumn = columns[source.droppableId];

        //! biến này tạo ra với mục đích lấy cột cuối muốn kéo thả đến
        const destColumn = newColumns[destination.droppableId];

        const startPoint = sourceColumn.id;
        const endPoint = destColumn.id;

        //? đoạn này check đk nếu như id của điểm đầu khác với id của điểm cuối
        //* thì lúc đó mới lấy giá trị điểm bắt đầu và điểm kết thúc
        if (startPoint !== endPoint) {
        setIdEndPoint(endPoint);
        }

        //TODO: đoạn này xử lý logic check đk kéo thả task ở đây
        // if (startPoint === 0 && endPoint === 4) {
        // showToast("Công việc chưa thực hiện không được kéo sang tạm dừng", "warning");
        // setSubmitTask(true);
        // setShowModalSupport(true);
        // return;
        // }

        // if (startPoint === 1 && endPoint === 0) {
        // showToast("Công việc đang thực hiện không được kéo sang chưa thực hiện", "warning");
        // setSubmitTask(true);
        // setShowModalSupport(true);
        // return;
        // }

        // if (startPoint === 4 && endPoint === 0) {
        // showToast("Công việc tạm dừng không được kéo sang chưa thực hiện", "warning");
        // setSubmitTask(true);
        // setShowModalSupport(true);
        // return;
        // }

        // if (startPoint === 4 && endPoint === 2) {
        // showToast("Công việc tạm dừng không được kéo sang hoàn thành", "warning");
        // setSubmitTask(true);
        // setShowModalSupport(true);
        // return;
        // }

        newColumns[parseInt(source.droppableId)].items.splice(source.index, 1);

        newColumns[parseInt(destination.droppableId)].items.splice(destination.index, 0, dragItem);

        setSubmitTask(false);
        setColumns(newColumns);
    };

    const handleUpdateStatusWork = async () => {
        const body: IContactRequest = {
            id: dataWork.id,
            name: dataWork.name,
            phone: dataWork.phone,
            note: dataWork.note,  
            avatar: dataWork.avatar,
            employeeId: dataWork.employeeId,
            positionId: dataWork.positionId,
            contactExtraInfos: dataWork.contactExtraInfos,
            bsnId: dataWork.bsnId,
            customers: dataWork.customers,
            emails: dataWork.emails,
            pipelineId: dataWork.pipelineId,
            statusId: idEndPoint
        };

        if (submitTask) {
        return;
        }
        const response = await ContactService.update(body);

        if (response.code === 0) {
            showToast("Chuyển giai đoạn thành công", "success");
            onReload(true)
        } else {
            showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
    };

    //Đoạn này lấy giá trị rồi cập nhật API, đk cập nhập API là dataWork !== null
    useEffect(() => {
        if (dataWork !== null && idEndPoint) {
        handleUpdateStatusWork();
        }
    }, [dataWork, idEndPoint, submitTask]);

    return (
        <div className="wrapper-kanban-work">
        <div className="search__kanban">
            <SearchBox
                name="Tên người liên hệ/SĐT/Email"
                params={params}
                isFilter={true}
                listFilterItem={contractFilterList}
                updateParams={(paramsNew) => setParams(paramsNew)}
            />
        </div>
        <div className="box__task--kanban">
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
                        <div className="wrapper__title" >
                            <span className="title-task"  style={{ backgroundColor: column.color, color: column.colorText }}>{column.title}</span>
                            <span className="total-task">{column.items.length}</span>
                        </div>
                        <div className="lst__item">
                            {column.items.map((item, idx) => {
                            return <TaskItem key={idx} item={item} index={idx} column={column} />;
                            })}
                        </div>
                        {provided.placeholder}
                        </div>
                    );
                    }}
                </Droppable>
                );
            })}
            </DragDropContext>
        </div>
        <SupportTaskModal onShow={showModalSupport} onHide={() => setShowModalSupport(false)} />
        </div>
    );
}
