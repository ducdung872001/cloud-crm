export interface IRentalTyppeFilterRequest {
    name?: string;
    page?: number;
    limit?: number;
  }
  
  export interface IRentalTyppeRequest {
    id: number;
    name: string;
    position: number | string;
    bsnId: number;
  }
  