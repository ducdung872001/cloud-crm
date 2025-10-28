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
  parent?: any;
  selectedFormula?: string;
  fieldList?: any;
  parentIds?: any;
  parents?: any;
  fieldDTO?: any;
}
