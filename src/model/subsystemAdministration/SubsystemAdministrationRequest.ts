export interface ISubsystemAdministrationFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface ISubsystemAdministrationRequest {
  name: string;
  position: number;
  parentId: number;
}

export interface IAddModuleResourceRequest {
  moduleId: number;
  resourceId: number;
}
