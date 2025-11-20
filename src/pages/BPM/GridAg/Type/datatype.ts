export interface GridDataItem {
  name: string;
  key: string;
  rowKey: string;
  type: string;
  placeholder: string;
  value: string;
  showNote: boolean;
  noteList: any[];
  options: any[];
  required: boolean;
  regex: string;
  lookup: string;
  formula: string;
  timeRange: string;
  listBindingField: any[];
  isBinding: boolean;
  bindingField: string;
  readOnly: boolean;
  isHaveNote: boolean;
}
export interface GridColumnsItem {
  key: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "lookup";
  lookup: string;
  formula: string; // JSON string, e.g., "{\"formula\":\"\"}"
  options: any[]; // Array for options
  position: number; // Position as a number
  readOnly: number; // 0 or 1
  required: boolean; // true or false
  timeRange: string; // JSON string, e.g., "{\"startDate\":\"\",\"endDate\":\"\"}"
  listBindingField: any[]; // Array for binding fields
}

export type TypeNo = "input" | "auto"; // Định nghĩa type chỉ cho phép "input" hoặc "auto"
