import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { GridAgProvider } from "./GridAgContext";
import GridAgTable, { GridAgTableHandle } from "./GridAgTable";

export interface IGridAgTable {
  location: string; // "iframe" hoặc "viewAndHandle"
  setDataConfigGrid?: (data) => void;
  dataGrid?: any; // Dữ liệu cấu hình bảng từ bên ngoài
  onChange?: (data) => void; // Hàm gọi khi có thay đổi dữ liệu (dùng trong configViewer)
  onAction?: (action: any) => void; // Hàm gọi khi có hành động trên grid
  configField?: any; // Dùng trong configViewer để truyền tham số thay vì lấy từ URL
  domId?: string; // key để ép React remount lại component khi cần thiết
}

export type GridAgHandle = GridAgTableHandle; // tái sử dụng type từ GridAgTable

// Chuyển tiếp ref ra ngoài để component cha của cha có thể gọi getLatestRowData()
const GridAg = forwardRef<GridAgHandle, IGridAgTable>((props, ref) => {
  const { location, setDataConfigGrid, dataGrid, onChange, configField, onAction, domId } = props;
  const innerGridRef = useRef<GridAgTableHandle | null>(null);

  // Expose method getLatestRowData ra component cha của cha
  useImperativeHandle(
    ref,
    () => ({
      getLatestRowData: () => {
        return innerGridRef.current?.getLatestRowData?.() ?? [];
      },
    }),
    []
  );

  return (
    <GridAgProvider>
      <GridAgTable
        domId={domId}
        ref={innerGridRef}
        location={location}
        setDataConfigGrid={setDataConfigGrid}
        dataGrid={dataGrid}
        onChange={onChange}
        configField={configField}
        onAction={onAction}
      />
    </GridAgProvider>
  );
});

export default GridAg;
