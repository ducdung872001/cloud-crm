interface IlstParticipantProps {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  address: string;
}

export interface IWorkProjectResponseModel {
  id: number;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  description: string;
  participants: string;
  employeeId: number;
  departmentId: number;
  docLink: string;
  parentId: number;
  bsnId?: number;
  lstParticipant?: IlstParticipantProps[];
  projectTypes?: any;
  lstProjectType?: any;
}
