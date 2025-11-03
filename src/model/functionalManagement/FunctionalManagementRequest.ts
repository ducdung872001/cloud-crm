export interface IFunctionalManagementFilterRequest {
  moduleId?: number;
  name?: string;
  app?: string;
  page?: number;
  limit?: number;
}

export interface IFreeResourceFilterRequest {
  name: string;
  app: string;
  page?: number;
}

export interface IFunctionalManagementRequest {
  name: string;
  code: string;
  uri: string;
  actions: string;
  description: string;
}
