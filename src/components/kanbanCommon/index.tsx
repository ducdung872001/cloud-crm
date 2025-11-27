import React, { useState, useEffect, useRef, useCallback } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import "./index.scss";
import ColumnCommon from "./ColumnCommon";

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

type Props = {
  itemShow: (item: any, idx: number) => React.ReactNode;
  listStep: any[];
  functionGetDataItem?: any;
  handleDoubleClick?: (item: any) => void;
};

export default function KanbanCommon({ itemShow, listStep, functionGetDataItem, handleDoubleClick }: Props) {
  const [columns, setColumns] = useState<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    // Initialize columns state based on listStep (phải để các trạng thái bắt đầu như thế này để tương thích với ColumnCommon, không gây render - gọi api lại nhiều lần khi bắt đầu)
    const initialColumns = listStep.map((step, index) => ({
      id: step.id,
      title: step.label,
      color: step.color || colorData[index % colorData.length],
      items: [],
      hasMore: true,
      page: 0,
      isLoading: true,
    }));
    setColumns(initialColumns);
  }, []);

  // Parent handlers called by Column to set/append items for that column
  const handleInitLoad = useCallback((columnId: any, payload: { items: any[]; hasMore: boolean; page: number }) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId
          ? {
              ...c,
              items: payload.items || [],
              hasMore: !!payload.hasMore,
              page: payload.page || 1,
              isLoading: false,
            }
          : c
      )
    );
  }, []);

  const handleAppend = useCallback((columnId: any, payload: { items: any[]; hasMore: boolean; page: number }) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId
          ? {
              ...c,
              items: [...(c.items || []), ...(payload.items || [])],
              hasMore: !!payload.hasMore,
              page: payload.page || c.page,
              isLoading: false,
            }
          : c
      )
    );
  }, []);

  const setColumnLoading = useCallback((columnId: any, loading: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, isLoading: loading } : c)));
  }, []);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newColumns = [...columns];

    const srcIdx = parseInt(source.droppableId, 10);
    const destIdx = parseInt(destination.droppableId, 10);

    const dragItem = newColumns[srcIdx].items[source.index];
    // update local data
    newColumns[srcIdx].items.splice(source.index, 1);
    newColumns[destIdx].items.splice(destination.index, 0, dragItem);

    setColumns(newColumns);

    // ... keep any server update logic you have (e.g. call to update status)
  };

  return (
    <>
      <div className={`wrapper-kanban-common ${showHistory ? "d-none" : ""}`}>
        <div className="__special-kanban--business-process">
          <div
            className="box__task--kanban"
            style={{
              width: "100%",
              marginBottom: "1.5rem",
            }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              {listStep.map((colDef, idx) => {
                const columnState = columns.find((c) => c.id === colDef.id);
                return (
                  <ColumnCommon
                    key={colDef.id}
                    functionGetDataItem={functionGetDataItem}
                    columnDef={colDef} // minimal definition; Column will fetch its own items
                    columnState={columnState}
                    droppableId={idx.toString()} // keep using index as droppableId to be compatible with onDragEnd logic
                    index={idx}
                    itemShow={itemShow}
                    onInitLoad={handleInitLoad}
                    onAppend={handleAppend}
                    setLoading={setColumnLoading}
                    setShowHistory={(item) => {
                      handleDoubleClick(item);
                      // setShowHistory(true);
                      // setItemHistory(item);
                    }}
                  />
                );
              })}
            </DragDropContext>
          </div>
        </div>
      </div>
    </>
  );
}
