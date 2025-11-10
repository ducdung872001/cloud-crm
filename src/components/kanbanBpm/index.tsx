import Loading from "components/loading";
import React, { useState, useEffect, Fragment } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import BusinessProcessService from "services/BusinessProcessService";
import "./index.scss";
import { fetchDataItem } from "./fetchData/fetchDataItem";
import { showToast } from "utils/common";

const colorData = [
  "#E98E4C",
  "#ED6665",
  "#FFBF00",
  "#9966CC",
  "#6A5ACD",
  "#007FFF",
  "#993300",
  "#F0DC82",
  "#CC5500",
  "#C41E3A",
  "#ACE1AF",
  "#7FFF00",
  "#FF7F50",
  "#BEBEBE",
  "#FF00FF",
  "#C3CDE6",
  "#FFFF00",
  "#40826D",
  "#704214",
];

export default function KanbanBpm(props: any) {
  const { dataStart, setDataStart, dataSuccess, setDataSuccess, onReload, params, processId, setParams, itemShow, processType } = props;

  //Kanban BPM
  const checkProcessId = (localStorage.getItem("processOrderRequestId") && JSON.parse(localStorage.getItem("processOrderRequestId"))) || -1;
  const checkProcessName = localStorage.getItem("processOrderRequestName");

  const [dataWork, setDataWork] = useState(null);
  const [idEndPoint, setIdEndPoint] = useState<number>(null);
  const [submitTask, setSubmitTask] = useState<boolean>(false);
  const [isLoadingColumns, setIsLoadingColumns] = useState<boolean>(false);
  const [listStepProcess, setListStepProcess] = useState([]);
  const [listColumn, setListColumn] = useState([]);
  const [valueProcess, setValueProcess] = useState(null);
  const [isLoadingKanban, setIsLoadingKanban] = useState<boolean>(false);
  const [dataOfStep, setDataOfStep] = useState([]);
  const abortController = new AbortController();

  useEffect(() => {
    if (processId === -1) {
    } else {
      getListStepProcess(processId);
    }
  }, [processId]);

  useEffect(() => {
    if (listStepProcess && listStepProcess.length > 0 && processId && processId !== -1) {
      listStepProcess.map((item, index) => {
        const param = {
          processId: processId,
          workflowId: item.value,
          // workflowId: -1,
          limit: 10,
          page: 1,
        };
        getDataOfStep(param, item.label);
      });
    }
  }, [listStepProcess, processId]);

  const getDataOfStep = async (paramsSearch, stepName) => {
    const response = await BusinessProcessService.listWorkFlow(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      const newData = {
        stepId: paramsSearch.workflowId,
        stepName: stepName,
        value: result?.items,
        hasMore: result?.loadMoreAble,
        page: result?.page,
      };

      setDataOfStep((oldArray) => [...oldArray, newData]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getListStepProcess = async (processId) => {
    const body: any = {
      processId,
      limit: 100,
    };

    const response = await BusinessProcessService.listStep(body);
    if (response.code === 0) {
      const dataOption = response.result.items;

      setListStepProcess([
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
              return {
                value: item.id,
                label: item.stepName,
                color: colorData[index],
                processId: item.processId,
                step: item.stepNumber,
              };
            })
          : []),
      ]);
      setListColumn([
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
              return {
                id: item.id,
                title: item.stepName,
                color: colorData[index],
                processId: item.processId,
                step: item.stepNumber,
              };
            })
          : []),
        {
          id: "done",
          title: "Hoàn thành",
          color: "#1bc10d",
          processId: processId || listStepProcess[0]?.processId,
          items: [],
          hasMore: false,
          page: 1,
        },
      ]);
      console.log("Ok1234>>", [
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
              return {
                id: item.id,
                title: item.stepName,
                color: colorData[index],
                processId: item.processId,
                step: item.stepNumber,
              };
            })
          : []),
        {
          id: "done",
          title: "Hoàn thành",
          color: "#1bc10d",
          processId: processId || listStepProcess[0]?.processId,
          items: [],
          hasMore: false,
          page: 1,
        },
      ]);
      setIsLoadingKanban(false);
    }
  };

  const [columns, setColumns] = useState<any[]>([
    {
      id: "done",
      title: "Hoàn thành",
      color: "#1bc10d",
      processId: processId || "",
      items: [],
      hasMore: false,
      page: 1,
    },
  ]);

  useEffect(() => {
    const processData = async () => {
      //   setIsLoadingColumns(true);
      const resultData = await Promise.all(
        listStepProcess.map(async (item) => {
          const newDataItemsStep = dataOfStep?.length > 0 && dataOfStep?.find((element) => element.stepId === item.value);
          const newDataItems = newDataItemsStep?.value || [];
          const newHasMore = newDataItemsStep?.hasMore;
          const newPage = newDataItemsStep?.page;

          const listPotId = newDataItems.map((el) => el.potId);

          let detailData = [];
          if (listPotId.length > 0) {
            detailData = await fetchDataItem(listPotId.join(","), processType);
            // Bạn có thể xử lý hoặc gắn `detailData` vào `newDataItems` nếu cần
            console.log("resultData>>>detailData", detailData);
          }

          if (item.label) {
            return {
              id: item.value,
              title: item.label,
              color: item.color,
              processId: item.processId,
              step: item.stepNumber,
              items:
                newDataItems.map((el) => {
                  return {
                    ...el,
                    dataDetail: detailData?.find((detail) => detail.potId === el.potId) || null, // Gắn dữ liệu chi tiết vào từng mục
                  };
                }) || [],
              hasMore: newHasMore,
              page: newPage,
            };
          }
          return null;
        })
      );
      console.log("resultData>>>", resultData);

      const result = resultData.filter((el) => el !== null);

      // Lấy dữ liệu của cột hoàn thành

      let newDataSuccess: any = {};
      if (dataSuccess && dataSuccess?.items && dataSuccess?.items.length > 0) {
        const detailDataSuccess = await fetchDataItem(dataSuccess?.items.map((el) => el.potId).join(","), processType);

        if (detailDataSuccess && detailDataSuccess.length > 0) {
          newDataSuccess = {
            ...dataSuccess,
            items: dataSuccess?.items.map((el) => ({
              ...el,
              dataDetail: detailDataSuccess?.find((detail) => detail.potId == el.potId) || null,
            })),
          };
          result.push({
            id: "done",
            title: "Hoàn thành",
            color: "#1bc10d",
            processId: listStepProcess[0]?.processId,
            step: 0, // or any appropriate value for step
            items: newDataSuccess?.items || [],
            hasMore: newDataSuccess?.loadMoreAble,
            page: newDataSuccess?.page,
          });
        } else {
          result.push({
            id: "done",
            title: "Hoàn thành",
            color: "#1bc10d",
            processId: listStepProcess[0]?.processId,
            items: dataSuccess?.items || [],
            step: 0, // or any appropriate value for step
            hasMore: dataSuccess?.loadMoreAble,
            page: dataSuccess?.page,
          });
        }
      }

      setColumns(result);
      //   setIsLoadingColumns(false);
    };

    processData();
  }, [listStepProcess, dataOfStep, dataSuccess]);

  const onDragEnd = async (result) => {
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

    const startLabel = sourceColumn.title;
    const endLabel = destColumn.title;

    //? đoạn này check đk nếu như id của điểm đầu khác với id của điểm cuối
    //* thì lúc đó mới lấy giá trị điểm bắt đầu và điểm kết thúc
    if (startPoint !== endPoint) {
      setIdEndPoint(endPoint);

      //   handleUpdateStatusInvoice(endPoint, dragItem, startPoint, startLabel, endLabel);
    }

    newColumns[parseInt(source.droppableId)].items.splice(source.index, 1);

    newColumns[parseInt(destination.droppableId)].items.splice(destination.index, 0, dragItem);

    setSubmitTask(false);
    setColumns(newColumns);
  };

  const handleScrollSpecial = async (e, itemStep, status) => {
    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && itemStep.hasMore) {
      const param = {
        processId: itemStep.processId,
        workflowId: itemStep.id,
        limit: 10,
        page: itemStep.page + 1,
        status: status,
      };
      console.log("response123111", param);
      return;
      const response = await BusinessProcessService.listWorkFlow(param);
      if (response.code === 0) {
        const result = response.result;

        const newData = {
          ...result,
          items: [...itemStep.items, ...result.items],
        };

        if (status === 0) {
          setDataStart(newData);
        } else if (status === 2) {
          setDataSuccess(newData);
        }
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };
  return (
    <div className="wrapper-kanban-bpm">
      <div className="search__kanban">
        {/* <SearchBox
      name="Tên"
      params={params}
      isFilter={true}
      listFilterItem={contractFilterList}
      updateParams={(paramsNew) => setParams(paramsNew)}
    /> */}
      </div>
      <div className="__special-kanban--business-process">
        <div
          className="box__task--kanban"
          style={{
            // width: `${columns.length >= 5 ? `${columns.length * 210}px` : "100%"}`,
            width: ` "100%"`,
            marginBottom: "1.5rem",
          }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            {listColumn.map((column, id) => {
              return (
                <Droppable key={column.id} droppableId={id.toString()}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        // style={{ backgroundColor: snapshot.isDraggingOver ? "#D1FAE5" : "#f4f5f7" }}
                        className="task-list"
                      >
                        <div
                          className="wrapper__title"
                          style={{
                            backgroundColor: column.color,
                          }}
                        >
                          <span
                            className="title-task"
                            style={{
                              color: "white",
                            }}
                          >
                            {column.title}
                          </span>
                        </div>
                        <div
                          className="lst__item"
                          style={{ backgroundColor: snapshot.isDraggingOver ? "#D1FAE5" : "#f4f5f7" }}
                          onScroll={(e) => {
                            if (column.id === 0) {
                              handleScrollSpecial(e, column, 0);
                            } else if (column.id === "done") {
                              handleScrollSpecial(e, column, 1);
                            } else {
                              //   handleScroll(e, column);
                            }
                          }}
                        >
                          {columns[id]?.items ? (
                            <>
                              {columns[id].items?.map((item, idx) => {
                                return (
                                  //   <TaskItemClaim
                                  //     key={item.id}
                                  //     item={item}
                                  //     index={idx}
                                  //     column={column}
                                  //     callbackHistory={callbackHistory}
                                  //     callBackAction={(item, type) => {
                                  //       if (type === "delete") {
                                  //         showDialogConfirmDelete(item);
                                  //       }
                                  //     }}
                                  //   />
                                  //   <div key={item.id}>Task Item</div>
                                  itemShow(item, idx)
                                );
                              })}
                            </>
                          ) : (
                            <Loading />
                          )}
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
      </div>
    </div>
  );
}
