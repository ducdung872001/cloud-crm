import { IOption } from "model/OtherModel";

const listDay: IOption[] = [];

for (let i = 1; i <= 28; i++) {
  const result = {
    value: i,
    label: i,
  };

  listDay.push(result);
}

const listHour: IOption[] = [];

for (let i = 1; i <= 24; i++) {
  const result = {
    value: i,
    label: i,
  };

  listHour.push(result);
}

const listMinute: IOption[] = [];

for (let i = 5; i <= 60; i += 5) {
  const result = {
    value: i,
    label: i,
  };

  listMinute.push(result);
}

const listNotificationType = [
  {
    value: "app",
    label: "APP",
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "sms",
    label: "SMS",
  },
];

const listOption: IOption[] = [
  { value: "1", label: "Ngày" },
  { value: "2", label: "Giờ" },
  { value: "3", label: "Phút" },
];

export { listDay, listHour, listMinute, listNotificationType, listOption };
