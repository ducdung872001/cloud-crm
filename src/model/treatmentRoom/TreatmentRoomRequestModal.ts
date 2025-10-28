export interface ITreatmentRoomFilterRequest {
  name?: string;
  branchId?: number;
  page?: number;
  limit?: number;
}

export interface ITreatmentRoomRequestModal {
  name: string;
  bedNum: number;
  employeeId: number;
  branchId: number;
}

export interface ICheckTreatmentRoomRequestModal {
  branchId: number;
  startTime?: string;
  endTime?: string;
}
