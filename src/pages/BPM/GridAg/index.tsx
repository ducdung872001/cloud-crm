import React from "react";
// import React from "preact/compat";
import { GridAgProvider } from "./GridAgContext";
import GridAgTable from "./GridAgTable";

export interface IGridAgTable {
  location: string; // "iframe" hoặc "configViewer"
  setDataConfigGrid?: (data) => void;
  dataGrid?: any; // Dữ liệu cấu hình bảng từ bên ngoài
  onChange?: (data) => void; // Hàm gọi khi có thay đổi dữ liệu (dùng trong configViewer)
  onAction?: (action: any) => void; // Hàm gọi khi có hành động trên grid
  configField?: any; // Dùng trong configViewer để truyền tham số thay vì lấy từ URL
}

function GridAg(props: IGridAgTable) {
  const { location, setDataConfigGrid, dataGrid, onChange, configField, onAction } = props;
  return (
    <GridAgProvider>
      <GridAgTable
        location={location}
        setDataConfigGrid={setDataConfigGrid}
        dataGrid={dataGrid}
        onChange={onChange}
        configField={configField}
        onAction={onAction}
      />
    </GridAgProvider>
  );
}
export default React.memo(GridAg);
