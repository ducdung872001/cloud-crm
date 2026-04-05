export interface IKpiGoalResponse {
  id: number;
  name: string;
  direction: string;
  position: number;
  category: string;
  type: number;
  datasourceId: number;
  datasourceName: string;
  bsnId: number;
  createdTime: string;
  parentId?: number;
  parentName?: string;
  parent?: Record<string, unknown>;
  selectedFormula?: string;
  fieldList?: Record<string, unknown>[];
  parentIds?: number[];
  parents?: Record<string, unknown>[];
  fieldDTO?: Record<string, unknown>;
}
