import React, { useEffect, useState } from "react";
import { getSearchParameters } from "reborn-util";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import WorkProjectService from "services/WorkProjectService";
import WorkOrderService from "services/WorkOrderService";
import ThirdGender from "assets/images/third-gender.png";
import { showToast } from "utils/common";
import Icon from "components/icon";
import Loading from "components/loading";
import TaskItem from "../TaskItem";
import ExchangeFast from "../ExchangeFast";
import AddWorkModal from "../../../AddWorkModal/AddWorkModal";
import { useWindowDimensions } from "utils/hookCustom";
import "./index.scss";
import BusinessProcessService from "services/BusinessProcessService";

interface IKanbanEmployeeProps {
  type: "project" | "opportunity";
  isShow: boolean;
}

export default function KanbanEmployee(props: IKanbanEmployeeProps) {
  const { type, isShow } = props;

  const paramsUrl = getSearchParameters();
  console.log('paramsUrl', paramsUrl);
  console.log('isShow', isShow);
  

  const { width } = useWindowDimensions();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataProject, setDataProject] = useState(null);
  const [dataManager, setDataManager] = useState(null);
  const [descWork, setDescWork] = useState(null);

  const handGetProject = async (id: number) => {
    console.log('da vao');
    
    if (!id) {
      setIsLoading(false);
      return;
    } 

    setIsLoading(true);

    const response = await BusinessProcessService.detail(id);

    if (response.code === 0) {
      setDataProject(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (isShow && paramsUrl && paramsUrl.processId) {
      handGetProject(+paramsUrl.processId);
    }
  }, [paramsUrl?.processId, isShow]);

  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (dataProject) {
      const changeDataProject = (dataProject.lstParticipant || [])
        .filter((el) => el.id !== dataProject.employeeId)
        .map((item) => {
          return {
            id: item.id,
            title: item.name,
            avatar: item.avatar,
            items: [],
          };
        });

      setDataManager({
        value: dataProject.employeeId,
        label: dataProject.employeeName,
      });
      setColumns([...[{ id: dataProject.employeeId, title: dataProject.employeeName, avatar: "", items: [] }, ...changeDataProject]]);
    }
  }, [dataProject]);

  // sau khi có danh sách nhân viên thì tiến hành call api danh sách công việc để lấy ra nhân viên thuộc công việc nào
  const handTakeEmployeeTasks = async (employeeId: number) => {
    const params = {
      employeeId: employeeId,
      projectId: +paramsUrl.projectId,
    };

    const response = await WorkOrderService.list(params);

    if (response.code === 0) {
      return response.result.items;
    } else {
      return [];
    }
  };

  const getEmployeeTasks = async () => {
    const updatedColumns = await Promise.all(
      columns.map(async (employee) => {
        const tasks = await handTakeEmployeeTasks(employee.id);
        return { ...employee, items: tasks };
      })
    );

    setColumns(updatedColumns);
  };

  useEffect(() => {
    if (columns.length > 0) {
      getEmployeeTasks();
    }
  }, [isLoading]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
  };

  const [showModalAddWork, setShowModalAddWork] = useState<boolean>(false);
  const [dataEmployee, setDataEmployee] = useState(null);

  return (
    <div className={`kanban__employee`} style={columns.length > 4 ? { width: `${columns.length * 27}rem`, paddingBottom: "3rem" } : {}}>
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
                      className={`task-list task-list--${columns.length > 2 ? "n" : ""}`}
                    >
                      <div className="wrapper__title">
                        <div className="info__employee">
                          <div className="avatar__employee">
                            <img src={column.avatar || ThirdGender} alt={column.title} />
                          </div>
                          <span className="name">{column.title}</span>
                        </div>
                        <span className="total-task">{column.items.length}</span>
                      </div>
                      <div className="lst__task--employee">
                        <div
                          className="action__add--work"
                          onClick={() => {
                            setShowModalAddWork(true);
                            setDataEmployee({
                              value: column.id,
                              label: column.title,
                              avatar: column.avatar,
                            });
                          }}
                        >
                          <Icon name="PlusCircleFill" /> Thêm mới
                        </div>

                        <div className="lst__task">
                          {column.items.map((el, index) => {
                            return (
                              <TaskItem
                                key={index}
                                totalTask={column.items.length}
                                item={el}
                                index={index}
                                type="employee"
                                takeDescWork={(data) => setDescWork(data)}
                                onReload={(reload) => {
                                  if (reload) {
                                    getEmployeeTasks();
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
      ) : (
        <Loading />
      )}
      {descWork && <ExchangeFast dataWork={descWork} onHide={() => setDescWork(null)} />}
      <AddWorkModal
        type={type}
        onShow={showModalAddWork}
        dataEmployeeProps={dataEmployee}
        dataManagerProps={dataManager}
        onHide={(reload) => {
          if (reload) {
            getEmployeeTasks();
          }
          setDataManager(null);
          setDataEmployee(null);
          setShowModalAddWork(false);
        }}
      />
    </div>
  );
}
