// Dữ liệu mẫu cho Grid Hồ sơ mời thầu
export const headerHsmt = [
  {
    key: "stt",
    name: "STT",
    type: "text",
    columnType: "stt",
    width: "50px",
  },
  // {
  //   key: "khoanVay",
  //   name: "Khoản vay",
  //   type: "range",
  //   columnType: "condition",
  //   children: [
  //     {
  //       key: "min",
  //       name: "min",
  //       type: "number",
  //     },
  //     {
  //       key: "max",
  //       name: "max",
  //       type: "number",
  //     },
  //   ],
  // },
  // {
  //   key: "GiaTriTheChap",
  //   name: "Giá trị thế chấp",
  //   type: "number",
  //   columnType: "condition",
  // },
  {
    key: "phongban",
    name: "Phòng ban",
    type: "select",
    columnType: "decision",
    children: [],
  },
  {
    key: "chucdanh",
    name: "Chức danh",
    type: "select",
    columnType: "decision",
    children: [],
  },
  // {
  //   key: "nhomnhanvien",
  //   name: "Nhóm nhân viên",
  //   type: "select",
  //   columnType: "decision",
  //   children: [],
  // },
  {
    key: "nhanvien",
    name: "Nhân viên",
    type: "select",
    columnType: "decision",
    children: [],
  },
];

export const dataRowHsmt: any = [
  [
    {
      key: "stt",
      name: "STT",
      type: "text",
      columnType: "stt",
      value: "",
    },
    {
      key: "khoanVay",
      name: "Khoản vay",
      type: "range",
      columnType: "condition",
      value: "",
      children: [
        {
          key: "min",
          name: "min",
          type: "number",
          value: 0,
        },
        {
          key: "max",
          name: "max",
          type: "number",
          value: 0,
        },
      ],
    },
    {
      key: "GiaTriTheChap",
      name: "Giá trị thế chấp",
      type: "number",
      columnType: "condition",
      value: 500000000,
    },
    {
      key: "action1",
      name: "Action 1",
      type: "object",
      columnType: "decision",
      value: "",
      children: [
        {
          key: "phanKhuc",
          name: "Phân khúc",
          type: "text",
          value: "Phân khúc 1",
        },
        {
          key: "mucUuTien",
          name: "Mức ưu tiên",
          type: "number",
          value: 1,
        },
        {
          key: "ghiChu",
          name: "Ghi chú",
          type: "text",
          value: "Ghi chú 1",
        },
        {
          key: "ghiChu2",
          name: "Ghi chú 2",
          type: "text",
          value: "Ghi chú 2",
        },
      ],
    },
    {
      key: "action2",
      name: "Action 2",
      type: "text",
      columnType: "decision",
      value: "Hành động 2",
    },
  ],
  [
    {
      key: "stt",
      name: "STT",
      type: "text",
      columnType: "stt",
      value: "",
    },
    {
      key: "khoanVay",
      name: "Khoản vay",
      type: "range",
      columnType: "condition",
      value: "",
      children: [
        {
          key: "min",
          name: "min",
          type: "number",
          value: 0,
        },
        {
          key: "max",
          name: "max",
          type: "number",
          value: 0,
        },
      ],
    },
    {
      key: "GiaTriTheChap",
      name: "Giá trị thế chấp",
      type: "number",
      columnType: "condition",
      value: 500000000,
    },
    {
      key: "action1",
      name: "Action 1",
      type: "object",
      columnType: "decision",
      value: "",
      children: [
        {
          key: "phanKhuc",
          name: "Phân khúc",
          type: "text",
          value: "Phân khúc 1",
        },
        {
          key: "mucUuTien",
          name: "Mức ưu tiên",
          type: "number",
          value: 1,
        },
        {
          key: "ghiChu",
          name: "Ghi chú",
          type: "text",
          value: "Ghi chú 1",
        },
        {
          key: "ghiChu2",
          name: "Ghi chú 2",
          type: "text",
          value: "Ghi chú 2",
        },
      ],
    },
    {
      key: "action2",
      name: "Action 2",
      type: "text",
      columnType: "decision",
      value: "Hành động 2",
    },
  ],
];
