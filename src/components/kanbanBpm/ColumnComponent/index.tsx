import React, { useEffect, useRef, useState, useCallback } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import Loading from "components/loading";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";

type ColumnDef = {
  id: any;
  value?: any;
  label?: string;
  color?: string;
  processId?: any;
  processCode?: any;
};

type ColumnState = {
  id: any;
  title?: string;
  color?: string;
  items: any[];
  hasMore?: boolean;
  page?: number;
  isLoading?: boolean;
  processId?: any;
};

type ColumnProps = {
  columnDef: ColumnDef; // static definition from parent (id, label, color, processId)
  columnState?: ColumnState; // current state stored in parent (may be undefined initially)
  droppableId: string; // index string used by parent for DnD
  index: number;
  itemShow: (item: any, idx: number) => React.ReactNode;
  onInitLoad: (columnId: any, payload: { items: any[]; hasMore: boolean; page: number }) => void;
  onAppend: (columnId: any, payload: { items: any[]; hasMore: boolean; page: number }) => void;
  setLoading: (columnId: any, loading: boolean) => void;
  setShowHistory: (item: any) => void;
};

/**
 *  Phần cột trong Kanban BPM
 * - Tự fetch trang đầu tiên nếu parent chưa cung cấp items
 * - Xử lý cuộn vô hạn, tải thêm trang khi cuộn xuống đáy
 * - Quản lý trạng thái isLoading cục bộ và thông báo cho parent qua setLoading/onInitLoad/onAppend
 * - Hiển thị Droppable và các mục Draggable sử dụng columnState.items từ parent
 * */
const ColumnComponent: React.FC<ColumnProps> = ({
  columnDef,
  columnState,
  droppableId,
  itemShow,
  onInitLoad,
  onAppend,
  setLoading,
  setShowHistory,
}) => {
  const id = columnDef.id;
  const processId = columnDef?.processId || null;
  const processCode = columnDef?.processCode || null;
  const abortRef = useRef<AbortController | null>(null);

  // Loading state khi load thêm trang
  const [localLoading, setLocalLoading] = useState(false);

  // helper to call API
  const getDataOfStep = useCallback(
    async (page = 1) => {
      if (!processId && !processCode) return { items: [], hasMore: false, page };
      try {
        abortRef.current = new AbortController();
        const params = {
          ...(processId ? { processId: processId } : {}),
          ...(processCode ? { processCode: processCode } : {}),
          // processId,
          // processCode,
          workflowId: id,
          limit: 10,
          page,
        };
        // return;
        const response = await BusinessProcessService.listWorkflowCloud(params, abortRef.current.signal);
        if (response.code === 0) {
          const result = response.result;
          return {
            items: result?.items || [],
            hasMore: !!result?.loadMoreAble,
            page: result?.page || page,
          };
        } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          return { items: [], hasMore: false, page };
        }
      } catch (err) {
        if ((err as any)?.name === "AbortError") {
          // aborted, ignore
          return { items: [], hasMore: false, page };
        }
        console.error(err);
        showToast("Có lỗi khi tải dữ liệu", "error");
        return { items: [], hasMore: false, page };
      } finally {
        abortRef.current = null;
      }
    },
    [id, processId, processCode]
  );

  // khởi tạo dữ liệu ban đầu cho cột nếu chưa có : nếu parent chưa cung cấp items (hoặc page === 0), thì fetch trang 1
  useEffect(() => {
    let mounted = true;
    const shouldLoadInitial =
      !columnState ||
      (Array.isArray(columnState.items) && columnState.items.length === 0 && (columnState.page === 0 || columnState.page === undefined));
    if (shouldLoadInitial) {
      (async () => {
        setLocalLoading(true);
        setLoading(id, true);
        const res = await getDataOfStep(1);
        if (!mounted) return;
        onInitLoad(id, { items: res.items, hasMore: res.hasMore, page: res.page });
        setLocalLoading(false);
        setLoading(id, false);
      })();
    }
    return () => {
      mounted = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [columnState, getDataOfStep, id, onInitLoad, setLoading]);

  // Cuộn xuống gần đáy sẽ tải thêm trang
  const handleScroll = useCallback(
    async (e: React.UIEvent<HTMLDivElement>) => {
      const col = columnState;
      if (!col) return;

      const el = e.currentTarget;
      const threshold = 80;
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;

      if (!isAtBottom) return;
      if (!col.hasMore) return;
      if (col.isLoading || localLoading) return;

      setLocalLoading(true);
      try {
        const nextPage = (col.page || 1) + 1;
        const res = await getDataOfStep(nextPage);
        // Cập nhật lên parent
        onAppend(id, { items: res.items, hasMore: res.hasMore, page: res.page });
      } catch (err) {
        console.error(err);
        showToast("Có lỗi khi tải thêm dữ liệu", "error");
      } finally {
        setLocalLoading(false);
      }
    },
    [columnState, getDataOfStep, id, localLoading, onAppend]
  );

  const items = columnState?.items || [];
  const hasMore = !!columnState?.hasMore;
  const isLoading = !!columnState?.isLoading;

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.droppableProps} className="task-list">
            <div className="wrapper__title" style={{ backgroundColor: columnDef.color }}>
              <span className="title-task" style={{ color: "white" }}>
                {columnDef.label}
              </span>
            </div>

            {isLoading ? (
              <div className="column-loading" style={{ padding: 8, textAlign: "center" }}>
                <Loading />
              </div>
            ) : (
              <div className="lst__item" style={{ backgroundColor: snapshot.isDraggingOver ? "#D1FAE5" : "#f4f5f7" }} onScroll={handleScroll}>
                {Array.isArray(items) && items.length > 0 ? (
                  <>
                    {items.map((item: any, idx: number) => {
                      const draggableId = `${id}-${item.id ?? idx}`;
                      return (
                        <Draggable
                          key={draggableId}
                          draggableId={draggableId}
                          index={idx}
                          isDragDisabled={true} // Bật/tắt khả năng kéo thả
                        >
                          {(providedDraggable) => (
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              style={{
                                ...(providedDraggable.draggableProps.style as any),
                              }}
                            >
                              <div
                                onDoubleClick={(e) => {
                                  // e.stopPropagation();
                                  console.log("Double click item:", item);
                                  setShowHistory(item);
                                }}
                              >
                                {itemShow(item, idx)}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {localLoading ? (
                      <div style={{ padding: 4, textAlign: "center" }}>
                        <Loading />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div style={{ padding: 8 }}>
                    {!hasMore && !isLoading && items && items.length === 0 && (
                      <div style={{ padding: 8, textAlign: "center", color: "#666" }}>Không có dữ liệu</div>
                    )}
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </div>
        );
      }}
    </Droppable>
  );
};

// Custom comparator to avoid unnecessary re-renders
function areEqual(prev: ColumnProps, next: ColumnProps) {
  const aState = prev.columnState;
  const bState = next.columnState;

  // id (dùng columnDef làm fallback)
  const aId = aState?.id ?? prev.columnDef.id;
  const bId = bState?.id ?? next.columnDef.id;
  if (aId !== bId) return false;

  // title (fallback về columnDef.label nếu state chưa có)
  const aTitle = aState?.title ?? prev.columnDef.label;
  const bTitle = bState?.title ?? next.columnDef.label;
  if (aTitle !== bTitle) return false;

  // color
  const aColor = aState?.color ?? prev.columnDef.color;
  const bColor = bState?.color ?? next.columnDef.color;
  if (aColor !== bColor) return false;

  // loading / hasMore
  const aIsLoading = !!aState?.isLoading;
  const bIsLoading = !!bState?.isLoading;
  if (aIsLoading !== bIsLoading) return false;

  const aHasMore = !!aState?.hasMore;
  const bHasMore = !!bState?.hasMore;
  if (aHasMore !== bHasMore) return false;

  // items length (an toàn với optional chaining)
  const aLen = Array.isArray(aState?.items) ? aState!.items.length : 0;
  const bLen = Array.isArray(bState?.items) ? bState!.items.length : 0;
  if (aLen !== bLen) return false;

  // nếu cùng có items, so sánh phần tử đầu/cuối để detect meaningful changes
  if (aLen > 0 && bLen > 0) {
    const aFirst = aState!.items[0]?.id ?? null;
    const bFirst = bState!.items[0]?.id ?? null;
    const aLast = aState!.items[aLen - 1]?.id ?? null;
    const bLast = bState!.items[bLen - 1]?.id ?? null;
    if (aFirst !== bFirst || aLast !== bLast) return false;
  }

  return true;
}

export default React.memo(ColumnComponent, areEqual);
