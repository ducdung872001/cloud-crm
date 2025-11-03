export interface IEmailResponse {
    id?: number;
    name?: string;
    emailFrom?: string;
    bsnId?: number;
    employeeId?: number;
    employeeName?: string;
    customerId?: number;
    createdTime?: string;
    receivedDateTime?: string;
    sentDateTime?: string;
    content?: string;
    contentDelta?: string;
    message?: string;
    requestId?: number;
    status?: number;
    templateId?: number;
    title?: string;
    emailType?: string;
  }
  