// Type cho option trong select
export interface DataOption {
  value: string;
  label: string;
}

// Type cho phần tử con (children)
export interface DataRowChild {
  key: string;
  name: string;
  type: "date" | "number" | "text" | "object" | "select";
  value: string;
}

// Type cho từng field (1 phần tử trong 1 row)
export interface DataRowField {
  key: string;
  name: string;
  type: "date" | "number" | "text" | "object" | "select";
  columnType?: string;
  compareType?: string;
  options?: DataOption[];
  children?: DataRowChild[];
  compare?: string;
  value?: string;
  width?: string;
  rowKey?: string;
  isOtherwise?: boolean;
  isSpecialValue?: boolean;
}

// Type cho 1 row (là mảng các field)
export type DataRow = DataRowField[];

// Type cho toàn bộ mảng dataRow
export type DataRows = DataRow[];
