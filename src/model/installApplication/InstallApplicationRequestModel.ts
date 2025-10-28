export interface IInstallApplicationFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IInstallApplicationRequest {
  name: string;
  avatar: string;
  clientId: string;
  clientKey: string;
  status: string;
}
