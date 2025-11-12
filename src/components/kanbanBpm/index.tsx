import React, { useState, useEffect, useRef, useCallback } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import "./index.scss";
import Loading from "components/loading";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import ColumnComponent from "./ColumnComponent";
import HistoryOfKanban from "./HistoryKanbanBpm/HistoryOfKanban";
import HistoryKanbanBpm from "./HistoryKanbanBpm";

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
  processId: any;
  itemShow: (item: any, idx: number) => React.ReactNode;
};

export default function KanbanBpm({ processId, itemShow }: Props) {
  const [listStepProcess, setListStepProcess] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [isLoadingKanban, setIsLoadingKanban] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [itemHistory, setItemHistory] = useState<any>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (processId == null || processId === -1) return;
    getListStepProcess(processId);
  }, [processId]);

  const getListStepProcess = async (pid: any) => {
    setIsLoadingKanban(true);
    const body: any = {
      processId: pid,
      limit: 100,
    };
    try {
      const response = await BusinessProcessService.listStep(body);
      if (response.code === 0) {
        const dataOption = response.result.items;
        setListStepProcess(
          dataOption.length > 0
            ? dataOption.map((item: any, index: number) => ({
                id: item.id,
                value: item.id,
                label: item.stepName,
                color: colorData[index % colorData.length],
                processId: item.processId,
                // NOTE: do not fetch items here — Column will fetch its own initial page
              }))
            : []
        );

        // initialize columns state skeleton (items empty) so parent has the structure for DnD
        setColumns(
          (dataOption.length > 0
            ? dataOption.map((item: any, index: number) => ({
                id: item.id,
                title: item.stepName,
                color: colorData[index % colorData.length],
                processId: item.processId,
                items: [], // will be filled by Column via callbacks
                hasMore: true,
                page: 0,
                isLoading: false,
              }))
            : []) as any[]
        );
      } else {
        showToast(response.message ?? "Lấy bước xử lý thất bại", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi khi lấy dữ liệu bước", "error");
    } finally {
      setIsLoadingKanban(false);
    }
  };

  // Parent handlers called by Column to set/append items for that column
  const handleInitLoad = useCallback((columnId: any, payload: { items: any[]; hasMore: boolean; page: number }) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId ? { ...c, items: payload.items || [], hasMore: !!payload.hasMore, page: payload.page || 1, isLoading: false } : c
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
      <div className={`wrapper-kanban-bpm ${showHistory ? "d-none" : ""}`}>
        <div className="__special-kanban--business-process">
          <div
            className="box__task--kanban"
            style={{
              width: "100%",
              marginBottom: "1.5rem",
            }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              {listStepProcess.map((colDef, idx) => {
                const columnState = columns.find((c) => c.id === colDef.id);
                return (
                  <ColumnComponent
                    key={colDef.id}
                    columnDef={colDef} // minimal definition; Column will fetch its own items
                    columnState={columnState} // may be undefined initially
                    droppableId={idx.toString()} // keep using index as droppableId to be compatible with onDragEnd logic
                    index={idx}
                    itemShow={itemShow}
                    onInitLoad={handleInitLoad}
                    onAppend={handleAppend}
                    setLoading={setColumnLoading}
                    setShowHistory={(item) => {
                      setShowHistory(true);
                      setItemHistory(item);
                    }}
                  />
                );
              })}
            </DragDropContext>
          </div>
        </div>

        {isLoadingKanban && (
          <div style={{ textAlign: "center", padding: 12 }}>
            <Loading />
          </div>
        )}
      </div>
      <div className={`wrapper-history-bpm ${!showHistory ? "d-none" : ""}`}>
        <HistoryKanbanBpm
          dataObject={itemHistory}
          onShow={showHistory}
          onBack={() => {
            setShowHistory(false);
            setItemHistory(null);
          }}
        />
      </div>
    </>
  );
}
