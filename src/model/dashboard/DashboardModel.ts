import { IOption } from "model/OtherModel";

export interface IOverview {
  type: "returns" | "invoice" | "amount";
  label: string;
  icon: React.ReactElement;
  old_value: number;
  current_value: number;
}

export interface IShortcut {
  title: string;
  path: string;
  icon: React.ReactElement;
  background: string;
  target?: string;
}

export interface IVideoHelp {
  title: string;
  image: string;
  url: string;
}

export interface IEventTransaction {
  type: "sale" | "warehousing" | "order" | "customer_return" | "return_supplier";
  created_at: string;
  created_by: string;
  received: string;
}

export const eventTransactionDataFake: IEventTransaction[] = [
  {
    type: "sale",
    received: "Khách lẻ",
    created_at: "11:15 05/11/2021",
    created_by: "Đặng Xuân Trường",
  },
  {
    type: "warehousing",
    received: "Công ty TNHH ABCD",
    created_at: "11:15 05/11/2021",
    created_by: "Đặng Xuân Trường",
  },
  {
    type: "order",
    received: "Công ty Letsmiin",
    created_at: "11:15 05/11/2021",
    created_by: "Đặng Xuân Trường",
  },
  {
    type: "customer_return",
    received: "Khách lẻ",
    created_at: "11:15 05/11/2021",
    created_by: "Đặng Xuân Trường",
  },
  {
    type: "return_supplier",
    received: "Công ty Letsmiin",
    created_at: "11:15 05/11/2021",
    created_by: "Đặng Xuân Trường",
  },
  {
    type: "sale",
    received: "Khách lẻ",
    created_at: "11:15 05/11/2021",
    created_by: "Đặng Xuân Trường",
  },
  {
    type: "warehousing",
    received: "Công ty TNHH ABCD",
    created_at: "11:15 05/11/2021",
    created_by: "Đặng Xuân Trường",
  },
  {
    type: "order",
    received: "Công ty Letsmiin",
    created_at: "11:15 05/11/2021",
    created_by: "Đặng Xuân Trường",
  },
  {
    type: "customer_return",
    received: "Khách lẻ",
    created_at: "11:15 05/11/2021",
    created_by: "Đặng Xuân Trường",
  },
  {
    type: "return_supplier",
    received: "Công ty Letsmiin",
    created_at: "11:15 05/11/2021",
    created_by: "Đặng Xuân Trường",
  },
];

export const typeCalendar = {
  today: "today",
  yesterday: "yesterday",
  last7Days: "last_7_days",
  last30Days: "last_30_days",
  last90Days: "last_90_days",
};

export const dateFilter: IOption[] = [
  {
    value: "today",
    label: "Hôm nay",
  },
  {
    value: "yesterday",
    label: "Hôm qua",
  },
  {
    value: "last_7_days",
    label: "7 ngày gần đây",
  },
  {
    value: "last_30_days",
    label: "30 ngày gần đây",
  },
  {
    value: "last_90_days",
    label: "90 ngày gần đây",
  },
];
