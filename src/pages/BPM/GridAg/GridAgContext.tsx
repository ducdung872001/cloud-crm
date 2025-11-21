import React, { createContext, useContext, useState, useMemo } from "react";
import { ColDef } from "ag-grid-community";

// Định nghĩa kiểu dữ liệu cho context
interface GridAgContextProps {
  rowData: any[];
  setRowData: React.Dispatch<React.SetStateAction<any[]>>;
  typeNo: "auto" | "input";
  setTypeNo: React.Dispatch<React.SetStateAction<"auto" | "input">>;
  widthNo?: number;
  setWidthNo?: React.Dispatch<React.SetStateAction<number | undefined>>;
  columnsConfig?: any[];
  setColumnsConfig?: React.Dispatch<React.SetStateAction<any[]>>;
  isFetchData: boolean;
  setIsFetchData: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading?: boolean;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  colCodeEdit?: string;
  setColCodeEdit?: React.Dispatch<React.SetStateAction<string | undefined>>;
  lookupValues: any;
  setLookupValues: React.Dispatch<React.SetStateAction<any>>;
  dataModalComment?: any;
  setDataModalComment?: React.Dispatch<React.SetStateAction<any>>;
  checkComment?: any;
  setCheckComment?: React.Dispatch<React.SetStateAction<any>>;
  checkedMap?: any;
  setCheckedMap?: React.Dispatch<React.SetStateAction<any>>;
}

// Tạo context
const GridAgContext = createContext<GridAgContextProps | undefined>(undefined);

// Provider component
export const GridAgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State chung cho toàn bộ grid
  const [rowData, setRowData] = useState<any[]>([]);
  const [typeNo, setTypeNo] = useState<"auto" | "input">("auto"); // true: auto, false: input
  const [widthNo, setWidthNo] = useState<number>();
  const [columnsConfig, setColumnsConfig] = useState<any[]>([]); // Cấu hình cột (dùng khi cho phép người dùng tùy chỉnh cột)
  const [isFetchData, setIsFetchData] = useState<boolean>(true); // Trạng thái đang fetch data
  const [isLoading, setIsLoading] = useState<boolean>(true); // Trạng thái loading chung
  const [colCodeEdit, setColCodeEdit] = useState<string>(null);
  const [lookupValues, setLookupValues] = useState<any>({}); // Giá trị lookup
  const [dataModalComment, setDataModalComment] = useState<any>(null); // Dữ liệu cho modal comment
  const [checkComment, setCheckComment] = useState<any>(null); // Dữ liệu kiểm tra comment
  const [checkedMap, setCheckedMap] = useState<any>({}); // Bản đồ các ô được chọn

  // Memo hóa giá trị để tránh render thừa
  const value = useMemo(
    () => ({
      rowData,
      setRowData,
      typeNo,
      setTypeNo,
      widthNo,
      setWidthNo,
      columnsConfig,
      setColumnsConfig,
      isFetchData,
      setIsFetchData,
      isLoading,
      setIsLoading,
      colCodeEdit,
      setColCodeEdit,
      lookupValues,
      setLookupValues,
      dataModalComment,
      setDataModalComment,
      checkComment,
      setCheckComment,
      checkedMap,
      setCheckedMap,
    }),
    [
      rowData,
      setRowData,
      typeNo,
      setTypeNo,
      widthNo,
      setWidthNo,
      columnsConfig,
      setColumnsConfig,
      isFetchData,
      setIsFetchData,
      isLoading,
      setIsLoading,
      colCodeEdit,
      setColCodeEdit,
      lookupValues,
      setLookupValues,
      dataModalComment,
      setDataModalComment,
      checkComment,
      setCheckComment,
      checkedMap,
      setCheckedMap,
    ]
  );

  return <GridAgContext.Provider value={value}>{children}</GridAgContext.Provider>;
};

// Hook tiện lợi để dùng context
export const useGridAg = () => {
  const context = useContext(GridAgContext);
  if (!context) {
    throw new Error("useGridAg phải dùng bên trong GridAgProvider");
  }
  return context;
};
