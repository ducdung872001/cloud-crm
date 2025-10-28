import React, { useState, useEffect } from "react";
import { getSearchParameters } from "reborn-util";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import WorkOrderService from "services/WorkOrderService";
import WorkProjectService from "services/WorkProjectService";
import { showToast } from "utils/common";
import { IUpdateStatusRequest } from "model/workOrder/WorkOrderRequestModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import Icon from "components/icon";
import TaskItem from "../TaskItem";
import ExchangeFast from "../ExchangeFast";
import SupportTaskModal from "./supportTaskModal/SupportTaskModal";
import AddWorkModal from "../../../AddWorkModal/AddWorkModal";
import { useWindowDimensions } from "utils/hookCustom";
import "./index.scss";

interface IKanbanStatusWork {
  data: any;
  isShow: boolean;
  onReload: any;
}

export default function KanbanStatusWork(props: any) {
  const {
    data,
    type,
    dataStart,
    setDataStart,
    dataDo,
    setDataDo,
    dataFail,
    setDataFail,
    dataSuccess,
    setDataSuccess,
    dataPending,
    setDataPending,

    onReload,
    isShow,
    setIsDetailWork,
    handleDetailWork
  } = props;

  console.log('dataStart', dataStart);
  

  const paramsUrl = getSearchParameters();

  const { width, height } = useWindowDimensions();

  // console.log("height : ", height);

  const [listStatusWork] = useState([
    {
      id: 0,
      name: "Mới tiếp nhận",
      icon:'NewWork'
    },
    {
      id: 1,
      // name: "Đang thực hiện",
      name: 'Quá hạn',
      icon:'ExpireWork'
    },
    {
      id: 4,
      name: "Tạm dừng",
      icon:'PauseWork'
    },
    {
      id: 2,
      name: "Đã hoàn thành",
      icon:'CompleteWork'
    },
    {
      id: 3,
      name: "Đã hủy",
      icon:'CancelWork'
    },
    
  ]);

  const [processId, setProcessId] = useState<number>(null);
  const [dataProject, setDataProject] = useState(null);

  useEffect(() => {
    if (paramsUrl && paramsUrl.processId) {
      setProcessId(+paramsUrl.processId);
    }
  }, [paramsUrl]);

  const getDetailProcess = async (id: number) => {
    if (!id) return;

    const response = await WorkProjectService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataProject({
        value: result.employeeId,
        label: result.employeeName,
      });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (processId && processId !== -1 && isShow) {
      getDetailProcess(processId);
    }
  }, [processId, isShow]);

  const [columns, setColumns] = useState<any[]>([]);
  console.log('columns', columns);

  const [idStartPoint, setIdStartPoint] = useState<number>(null);
  const [idEndPoint, setIdEndPoint] = useState<number>(null);

  const [dataWork, setDataWork] = useState<IWorkOrderResponseModel>(null);
  const [submitTask, setSubmitTask] = useState<boolean>(false);
  const [showModalSupport, setShowModalSupport] = useState<boolean>(false);
  const [descWork, setDescWork] = useState(null);

  useEffect(() => {
    const result = listStatusWork.map((item) => {
      return {
        id: item.id,
        title: item.name,
        icon: item.icon,
        // items: data.filter((element) => {
        //   return element.status === item.id;
        // }),
        // hasMore: dataStart?.loadMoreAble,
        hasMore:
          item.id === 0
            ? dataStart?.loadMoreAble
            : item.id === 1
            ? dataDo?.loadMoreAble
            : item.id === 2
            ? dataSuccess?.loadMoreAble
            : item.id === 3
            ? dataFail?.loadMoreAble
            : item.id === 4
            ? dataPending?.loadMoreAble
            : false,

        page:
          item.id === 0
            ? dataStart?.page
            : item.id === 1
            ? dataDo?.page
            : item.id === 2
            ? dataSuccess?.page
            : item.id === 3
            ? dataFail?.page
            : item.id === 4
            ? dataPending?.page
            : 1,

        items:
          item.id === 0
            ? dataStart?.items
            : item.id === 1
            ? dataDo?.items
            : item.id === 2
            ? dataSuccess?.items
            : item.id === 3
            ? dataFail?.items
            : item.id === 4
            ? dataPending?.items
            : [],

        total:
          item.id === 0
            ? dataStart?.total
            : item.id === 1
            ? dataDo?.total
            : item.id === 2
            ? dataSuccess?.total
            : item.id === 3
            ? dataFail?.total
            : item.id === 4
            ? dataPending?.total
            : false,
      };
    });

    setColumns(result);
  }, [data, dataStart, dataDo, dataSuccess, dataFail, dataPending]);

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
      setIdStartPoint(startPoint);
    }

    //TODO: đoạn này xử lý logic check đk kéo thả task ở đây
    if (startPoint === 0 && endPoint === 4) {
      showToast("Công việc chưa thực hiện không được kéo sang tạm dừng", "warning");
      setSubmitTask(true);
      setShowModalSupport(true);
      return;
    }

    if (startPoint === 1 && endPoint === 0) {
      showToast("Công việc đang thực hiện không được kéo sang chưa thực hiện", "warning");
      setSubmitTask(true);
      setShowModalSupport(true);
      return;
    }

    if (startPoint === 4 && endPoint === 0) {
      showToast("Công việc tạm dừng không được kéo sang chưa thực hiện", "warning");
      setSubmitTask(true);
      setShowModalSupport(true);
      return;
    }

    if (startPoint === 4 && endPoint === 2) {
      showToast("Công việc tạm dừng không được kéo sang hoàn thành", "warning");
      setSubmitTask(true);
      setShowModalSupport(true);
      return;
    }

    newColumns[parseInt(source.droppableId)].items.splice(source.index, 1);

    newColumns[parseInt(destination.droppableId)].items.splice(destination.index, 0, dragItem);

    setSubmitTask(false);
    setColumns(newColumns);
  };

  const handleUpdateStatusWork = async (idStartPoint, idEndPoint) => {
    const body: IUpdateStatusRequest = {
      id: dataWork?.id,
      status: idEndPoint,
    };

    if (submitTask) {
      return;
    }

    const response = await WorkOrderService.updateStatus(body);

    if (response.code === 0) {
      showToast("Chuyển trạng thái thành công", "success");
      onReload(true, idStartPoint, idEndPoint);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //Đoạn này lấy giá trị rồi cập nhật API, đk cập nhập API là dataWork !== null
  useEffect(() => {
    if (dataWork !== null && idEndPoint) {
      handleUpdateStatusWork(idStartPoint, idEndPoint);
    }
  }, [dataWork, idStartPoint, idEndPoint, submitTask]);

  const [showModalAddWork, setShowModalAddWork] = useState<boolean>(false);
  const [statusWork, setStatusWork] = useState(null);

  const handleScroll = async (e, itemApproach, status) => {
    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && itemApproach.hasMore) {
      // console.log('itemApproach', itemApproach);
      const param = {
        projectId: processId,
        limit: 10,
        page: itemApproach.page + 1,
        status: status,
      };
      const response = await WorkOrderService.list(param);
      if (response.code === 0) {
        const result = response.result;

        const newData = {
          ...result,
          items: [...itemApproach.items, ...result.items],
        };

        if (status === 0) {
          setDataStart(newData);
        } else if (status === 1) {
          setDataDo(newData);
        } else if (status === 2) {
          setDataSuccess(newData);
        } else if (status === 3) {
          setDataFail(newData);
        } else {
          setDataPending(newData);
        }
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  return (
    <div className="kanban__status--work" style={columns.length > 4 ? { width: `${columns.length * 30}rem`, paddingBottom: "3rem" } : {}}>
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((column, idx) => {
          return (
            <Droppable key={idx} droppableId={idx.toString()}>
              {(provided, snapshot) => {
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    // style={{ backgroundColor: snapshot.isDraggingOver ? "#D1FAE5" : "#f4f5f7" }}
                    className="task-list"
                  >
                    <div className="wrapper__title">
                      <div style={{display:'flex', alignItems:'center'}}>
                        <Icon name={column.icon}/>
                        <span className="title-task">{column.title}</span>
                      </div>
                      <span className="total-task">{column.total}</span>
                    </div>
                    <div className="lst__task--item">
                      {/* {column.id !== 2 && column.id !== 3 && (
                        <div
                          className="action__add--work"
                          onClick={() => {
                            setShowModalAddWork(true);
                            setStatusWork(column.id);
                          }}
                        >
                          <Icon name="PlusCircleFill" /> Thêm mới
                        </div>
                      )} */}

                      <div
                        className="__task"
                        onScroll={(e) => {
                          handleScroll(e, column, column.id);
                          // if(column.id === 0){
                          //   handleScroll(e, column, 0)
                          // } else {
                          //   // handleScroll(e, column);
                          // }
                        }}
                      >
                        {column.items?.map((item, idx) => {
                          return (
                            <TaskItem
                              key={idx}
                              totalTask={column.items.length}
                              item={item}
                              index={idx}
                              type="status"
                              takeDescWork={(data) => setDescWork(data)}
                              onReload={onReload}
                              setIsDetailWork={setIsDetailWork}
                              handleDetailWork={handleDetailWork}
                            />
                          );
                        })}
                      </div>
                    </div>
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          );
        })}
      </DragDropContext>
      {descWork && <ExchangeFast dataWork={descWork} onHide={() => setDescWork(null)} />}
      <AddWorkModal
        type={type}
        onShow={showModalAddWork}
        statusProps={statusWork}
        dataManagerProps={dataProject}
        onHide={(reload) => {
          if (reload) {
            onReload(true, statusWork);
          }
          setStatusWork(null);
          setDataProject(null);
          setShowModalAddWork(false);
        }}
      />
      <SupportTaskModal onShow={showModalSupport} onHide={() => setShowModalSupport(false)} />
    </div>
  );
}
