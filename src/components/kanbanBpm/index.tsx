import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import "./index.scss";
import Loading from "components/loading";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import ColumnComponent from "./ColumnComponent";
import HistoryKanbanBpm from "./HistoryKanbanBpm";
import isEqual from "lodash/isEqual";

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
  processId?: any;
  processCode?: any;
  itemShow: (item: any, idx: number) => React.ReactNode;
  params?: any;
  setLoadinglistColumns?: (loading: boolean) => void;
};

export default function KanbanBpm({ processId, processCode, itemShow, params, setLoadinglistColumns }: Props) {
  const [listStepProcess, setListStepProcess] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [isLoadingKanban, setIsLoadingKanban] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [itemHistory, setItemHistory] = useState<any>(null);

  const processIdRef = useRef<any>(null);
  const processCodeRef = useRef<any>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!processId && !processCode) return;

    if (processIdRef.current === processId && processCodeRef.current === processCode) {
      // chỉ update cột nếu params khác nội dung (deep-equal)
      setColumns((prevCols) => {
        let changed = false;
        const next = prevCols.map((c) => {
          if (isEqual(c.params, params)) return c;
          changed = true;
          return {
            ...c,
            items: [],
            page: 0,
            hasMore: true,
            isLoading: false,
            params: params,
          };
        });
        return changed ? next : prevCols;
      });
    } else {
      if (setLoadinglistColumns) setLoadinglistColumns(true);
      getListStepProcess(processId, processCode);
      processIdRef.current = processId;
      processCodeRef.current = processCode;
    }
  }, [processId, processCode, params, setLoadinglistColumns]);

  const getListStepProcess = async (pid?: any, pCode?: any) => {
    setIsLoadingKanban(true);
    const body: any = {
      ...(pid ? { processId: pid } : {}),
      ...(pCode ? { processCode: pCode } : {}),
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
                processCode: pCode || "",
              }))
            : []
        );

        setColumns(
          (dataOption.length > 0
            ? dataOption.map((item: any, index: number) => ({
                id: item.id,
                title: item.stepName,
                label: item.stepName,
                color: colorData[index % colorData.length],
                processId: item.processId,
                processCode: pCode || "",
                items: [],
                hasMore: true,
                page: 0,
                isLoading: false,
                params: params,
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
      if (setLoadinglistColumns) {
        setLoadinglistColumns(false);
      }
    }
  };

  // Parent handlers — đã memo để giữ reference ổn định
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

  // memo hoá handler setShowHistory (không truyền inline trong map)
  const handleSetShowHistory = useCallback(
    (item: any) => {
      setShowHistory(true);
      setItemHistory(item);
    },
    [setShowHistory, setItemHistory]
  );

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newColumns = [...columns];

    const srcIdx = parseInt(source.droppableId, 10);
    const destIdx = parseInt(destination.droppableId, 10);

    const dragItem = newColumns[srcIdx].items[source.index];
    newColumns[srcIdx].items.splice(source.index, 1);
    newColumns[destIdx].items.splice(destination.index, 0, dragItem);

    setColumns(newColumns);
  };

  // build map id->columnState để lấy cùng reference object (fast & stable)
  const columnsById = useMemo(() => {
    const m = new Map<any, any>();
    for (const c of columns) {
      m.set(c.id, c);
    }
    return m;
  }, [columns]);

  return (
    <>
      <div className={`wrapper-kanban-bpm ${showHistory ? "d-none" : ""}`}>
        <div className="__special-kanban--business-process">
          <div className="box__task--kanban" style={{ width: "100%", marginBottom: "1.5rem" }}>
            <DragDropContext onDragEnd={onDragEnd}>
              {listStepProcess.map((colDef, idx) => {
                const columnState = columnsById.get(colDef.id); // stable reference if columns unchanged
                return (
                  <ColumnComponent
                    key={colDef.id}
                    columnDef={colDef}
                    columnState={columnState}
                    droppableId={colDef.id.toString()}
                    index={idx}
                    itemShow={itemShow} // ensure itemShow (prop from parent) is stable (see note)
                    onInitLoad={handleInitLoad}
                    onAppend={handleAppend}
                    setLoading={setColumnLoading}
                    setShowHistory={handleSetShowHistory} // stable ref
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
