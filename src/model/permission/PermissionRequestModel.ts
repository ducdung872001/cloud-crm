export interface IPermissionDepartmentAddRequest {
  resourceId: number;
  departmentId: number;
  jteId: number;
  actions: string;
}

export interface IPermissionCloneRequest {
  sourceDepartmentId: number;
  sourceJteId: number;
  targetDepartmentId: number;
  targetLstJteId: number[];
}
