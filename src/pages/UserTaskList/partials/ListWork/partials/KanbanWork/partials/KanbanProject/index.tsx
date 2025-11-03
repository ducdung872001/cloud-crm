import React, { Fragment, useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import { getSearchParameters, trimContent } from "reborn-util";
import SwiperCore, { Grid, Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import WorkProjectService from "services/WorkProjectService";
import WorkOrderService from "services/WorkOrderService";
import EmployeeService from "services/EmployeeService";
import { showToast } from "utils/common";
import Loading from "components/loading";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import AddWorkModal from "../../../AddWorkModal/AddWorkModal";
import TaskItem from "../TaskItem";
import ExchangeFast from "../ExchangeFast";
import { useWindowDimensions } from "utils/hookCustom";
import "./index.scss";

SwiperCore.use([Navigation]);

interface IKanbanProjectProps {
  isShow: boolean;
  type: "project" | "opportunity";
}

export default function KanbanProject(props: IKanbanProjectProps) {
  const { isShow, type } = props;

  const paramsUrl = getSearchParameters();

  const { width } = useWindowDimensions();

  const [dataEmployee, setDataEmployee] = useState(null);
  const [dataManager, setDataManager] = useState(null);
  const [descWork, setDescWork] = useState(null);

  const getInfoEmployee = async () => {
    const response = await EmployeeService.info();

    if (response.code === 0) {
      const result = response.result;
      setDataEmployee(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    getInfoEmployee();
  }, []);

  const [lstProject, setLstProject] = useState([]);
  const [dataProject, setDataProject] = useState(null);
  const [dataOpt, setDataOpt] = useState(null);

  const projectIdUrl = paramsUrl && paramsUrl.projectId ? +paramsUrl.projectId : -1;

  const [idProduct, setIdProduct] = useState<number>(null);

  useEffect(() => {
    if (projectIdUrl) {
      setIdProduct(projectIdUrl);
    }
  }, [projectIdUrl]);

  const handLstProject = async (employeeId: number) => {
    if (!employeeId) return;

    const params = {
      employeeId: employeeId,
      limit: 100,
    };

    const response = await WorkProjectService.list(params);

    if (response.code === 0) {
      const result = response.result.items;

      const filterProductId = (result || [])
        .filter((item) => item.id === projectIdUrl)
        .map((el) => {
          return {
            value: el.id,
            label: el.name,
            employeeId: el.employeeId,
            employeeName: el.employeeName,
          };
        });

      setDataManager({
        value: filterProductId[0]["employeeId"],
        label: filterProductId[0]["employeeName"],
      });

      const changeResult = (result || [])
        .filter((el) => el.id !== projectIdUrl)
        .map((item) => {
          return {
            value: item.id,
            label: item.name,
            employeeId: item.employeeId,
            employeeName: item.employeeName,
          };
        });

      setLstProject([...filterProductId, ...changeResult]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (isShow) {
      if (dataEmployee) {
        handLstProject(dataEmployee.id);
      } else {
        setLstProject([]);
      }
    }
  }, [dataEmployee, isShow]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState([]);

  const [lstWork, setLstWork] = useState([]);
  const [dataWork, setDataWork] = useState(null);

  const handTakeWorkTasks = async (projectId: number) => {
    setIsLoading(true);

    const params = {
      projectId: projectId,
      limit: 100,
    };

    const response = await WorkOrderService.list(params);

    if (response.code === 0) {
      const result = response.result.items;
      setLstWork(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (idProduct) {
      handTakeWorkTasks(idProduct);
    }
  }, [idProduct]);

  const [listStatusWork] = useState([
    {
      id: 0,
      name: "Chưa thực hiện",
    },
    {
      id: 1,
      name: "Đang thực hiện",
    },
    {
      id: 2,
      name: "Đã hoàn thành",
    },
    {
      id: 3,
      name: "Đã hủy",
    },
    {
      id: 4,
      name: "Tạm dừng",
    },
  ]);

  const [idEndPoint, setIdEndPoint] = useState<number>(null);

  useEffect(() => {
    const result = listStatusWork.map((item) => {
      return {
        id: item.id,
        title: item.name,
        items: lstWork.filter((element) => {
          return element.status === item.id;
        }),
      };
    });

    setColumns(result);
  }, [lstWork]);

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

    newColumns[parseInt(source.droppableId)].items.splice(source.index, 1);

    newColumns[parseInt(destination.droppableId)].items.splice(destination.index, 0, dragItem);

    setColumns(newColumns);
  };

  const handleUpdateStatusWork = async () => {
    const body = {
      id: dataWork?.id,
      status: idEndPoint,
    };

    const response = await WorkOrderService.updateStatus(body);

    if (response.code === 0) {
      showToast("Chuyển trạng thái thành công", "success");
      handTakeWorkTasks(idProduct);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //Đoạn này lấy giá trị rồi cập nhật API, đk cập nhập API là dataWork !== null
  useEffect(() => {
    if (dataWork !== null && idEndPoint) {
      handleUpdateStatusWork();
    }
  }, [dataWork, idEndPoint]);

  const [showModalAddWork, setShowModalAddWork] = useState<boolean>(false);
  const [statusWork, setStatusWork] = useState(null);

  return (
    <div className="kanban__work">
      {lstProject && lstProject.length > 0 && (
        <div className="lst__project">
          <Swiper
            spaceBetween={10}
            slidesPerView={3}
            grid={{
              rows: 1,
            }}
            modules={[Grid, Navigation]}
            className="box__project--slide"
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
          >
            {lstProject.map((item) => {
              return (
                <SwiperSlide key={item.value} className="custom-slide">
                  <div
                    className={`info__project ${item.value === idProduct ? "active__project" : ""}`}
                    onClick={() => {
                      setIdProduct(item.value);
                      setDataProject(item);
                      setDataOpt(item);
                    }}
                  >
                    {item.label.length > 35 ? (
                      <Tippy content={item.label}>
                        <h3 className="name">{trimContent(item.label, 35, true, true)}</h3>
                      </Tippy>
                    ) : (
                      <h3 className="name">{item.label}</h3>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}

            <div className="swiper-button-next"></div>
            <div className="swiper-button-prev"></div>
          </Swiper>
        </div>
      )}

      <div className="desc__task--work" style={columns.length > 4 ? { width: `${columns.length * 25}rem`, paddingBottom: "3rem" } : {}}>
        {!isLoading && columns && columns.length > 0 ? (
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
                        className={`task-list`}
                      >
                        <div className="wrapper__title">
                          <div className="info__work">
                            <span className="name">{column.title}</span>
                            <span className="total-task">{column.items.length}</span>
                          </div>
                        </div>
                        <div className="lst__task--work">
                          {column.id !== 2 && column.id !== 3 && (
                            <div
                              className="action__add--work"
                              onClick={() => {
                                setShowModalAddWork(true);
                                setStatusWork(column.id);
                              }}
                            >
                              <Icon name="PlusCircleFill" /> Thêm mới
                            </div>
                          )}

                          <div className="lst__task">
                            {column.items.map((el, index) => {
                              return (
                                <TaskItem
                                  key={index}
                                  totalTask={column.items.length}
                                  item={el}
                                  index={index}
                                  type="mine"
                                  takeDescWork={(data) => setDescWork(data)}
                                  onReload={(reload) => {
                                    if (reload) {
                                      handTakeWorkTasks(idProduct);
                                    }
                                  }}
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
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            <SystemNotification
              description={
                <span>
                  Bạn chưa có công nào. <br />
                  Hãy thêm <strong>công việc</strong> cho mình nhé!
                </span>
              }
              type="no-item"
            />
          </Fragment>
        )}
      </div>
      {descWork && <ExchangeFast dataWork={descWork} onHide={() => setDescWork(null)} />}
      <AddWorkModal
        type={type}
        onShow={showModalAddWork}
        statusProps={statusWork}
        dataManagerProps={dataManager}
        dataProjectProps={dataProject}
        dataOptProps={dataOpt}
        onHide={(reload) => {
          if (reload) {
            handTakeWorkTasks(idProduct);
          }
          setDataManager(null);
          setDataProject(null);
          setDataOpt(null);
          setStatusWork(null);
          setShowModalAddWork(false);
        }}
      />
    </div>
  );
}
