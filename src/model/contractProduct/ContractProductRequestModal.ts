export interface IContractProductFilterRequest {
    fromTime?: string;
    toTime?: string;
    name?: string;
    page?: number;
    limit?: number;
  }
  
  export interface IContractProductRequest {
    id?: number;
    name?: string;  
    nfaArea?: number;
    address?: string;
    fillArea?: number,
    blankArea?: number
  }