import VNnum2words from "vn-num2words";
import { ExportExcel } from "exports/excel";
import moment from "moment";

export const exportExcelCashbookOverview = (searchParams, cashBookData, info) => {
  // const state = store.getState();
  // const currentUser = selectCurrentUser(state);
  const infoHeader = [
    ["Đại lý", info.product_store.name],
    ["Số điện thoại", info.product_store.phone],
    ["Địa chỉ", info.product_store.address],
    ["Người tạo", info.name],
    ["Ngày xuất phiếu", `${moment().format("YYYY-MM-DD")}`],
  ];

  const header = [
    ["NGÀY THÁNG GHI SỔ", "NGÀY THÁNG CHỨNG TỪ", "SỔ HIỆU CHỨNG TỪ", "", "DIỄN GIẢI", "SỐ TIỀN", "", "", ""],
    ["", "", "THU", "CHI", "", "THU", "CHI", "TỒN", "GHI CHÚ"],
  ];

  const headerFormat = [
    [
      {
        merge: {
          row: 2,
        },
      },
      {
        merge: {
          row: 2,
        },
      },
      {
        merge: {
          col: 2,
        },
      },
      {},
      {
        merge: {
          row: 2,
        },
      },
      {
        merge: {
          col: 3,
        },
      },
      {},
      {},
      {},
    ],
  ];

  let reserveFund = +cashBookData.total_opening_balance ?? 0;
  const data = cashBookData.data.map((cashbook, index) => {
    if (cashbook.cash_type_type === "pay_slip") {
      reserveFund = reserveFund - +cashbook.amount;
    } else {
      reserveFund = reserveFund + +cashbook.amount;
    }
    return [
      moment(cashbook.created_at).format("YYYY-MM-DD"),
      moment(cashbook.cash_date).format("YYYY-MM-DD"),
      cashbook.cash_type_type === "receipt" ? cashbook.code : null,
      cashbook.cash_type_type === "pay_slip" ? cashbook.code : null,
      `${cashbook.cash_type_name} - ${cashbook.reason}`,
      cashbook.cash_type_type === "receipt" ? +cashbook.amount : null,
      cashbook.cash_type_type === "pay_slip" ? +cashbook.amount : null,
      +reserveFund,
      cashbook.evidence || "",
    ];
  });

  const openingBalance = ["", "", "", "", "SỐ DƯ ĐẦU KỲ", "", "", +cashBookData.total_opening_balance ?? 0, ""];
  const numberGenerated = ["", "", "", "", "SỐ PHÁT SINH", "", "", "", ""];
  const headerExtra = [openingBalance, numberGenerated];

  const additiveArise = ["", "", "", "", "CỘNG PHÁT SINH", +cashBookData.total_amount_receipt, +cashBookData.total_amount_pay_slip, "", ""];
  const endingBalance = [
    "",
    "",
    "",
    "",
    "SỐ DƯ CUỐI KỲ",
    "",
    "",
    +cashBookData.total_opening_balance + +cashBookData.total_amount_receipt - +cashBookData.total_amount_pay_slip,
    "",
  ];
  const dataExtra = [additiveArise, endingBalance];

  const footer = [
    [],
    [],
    ["", "", "", "", "", "", `NGÀY.......THÁNG........NĂM ${new Date().getFullYear()}`, "", ""],
    ["NGƯỜI LẬP", "", "KẾ TOÁN", "", "", "", "ĐẠI DIỆN PHÁP LUẬT"],
  ];
  const footerFormat = [
    [],
    [],
    [{}, {}, {}, {}, {}, {}, { merge: { col: 3 }, fontBold: false }, { fontBold: false }, { fontBold: false }],
    [{}, {}, { merge: { col: 3 } }, {}, {}, {}, { merge: { col: 3 } }, {}, {}],
  ];

  return ExportExcel({
    fileName: `TongQuanSoQuy`,
    title: `TỔNG QUAN SỔ QUỸ`,
    infoHeader,
    header,
    headerFormat,
    headerExtra,
    dataExtra,
    footer,
    footerFormat,
    footerBorder: false,
    footerAlignment: true,
    generateInfo: false,
    generateSign: false,
    data: data,
    checkNumberNegative: true,
  });
};

export const getCashbookDetail = async (cashbook, type) => {
  // const state = store.getState();
  // const currentUser = selectCurrentUser(state);
  const infoHeaderCustom = [
    // ['Tên nhà thuốc', '', currentUser.productStore.name, '', '', '', '', '', '', '', '', `Số: ${cashbook?.code}`, '', ''],
    // [
    //   'Địa chỉ',
    //   '',
    //   currentUser.productStore.address,
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   `Loại ${type === 'PT' ? 'thu' : 'chi'}: ${cashbook?.cashTypeName}`,
    //   '',
    //   '',
    // ],
    // ['Số điện thoại', '', currentUser.productStore.phone],
  ];
  const infoHeaderCustomFormat = [
    [{ merge: { col: 2 } }, {}, { merge: { col: 9 } }, {}, {}, {}, {}, {}, {}, {}, {}, { merge: { col: 3 } }, {}, {}],
    [{ merge: { col: 2 } }, {}, { merge: { col: 9 } }, {}, {}, {}, {}, {}, {}, {}, {}, { merge: { col: 3 } }, {}, {}],
    [{ merge: { col: 2 } }, {}, { merge: { col: 9 } }],
  ];

  const titleExtra = [
    [`PHIẾU ${type === "PT" ? "THU" : "CHI"}`],
    [
      `Ngày ${moment(cashbook?.cashDate).format("DD")} tháng ${moment(cashbook?.cashDate).format("MM")} năm ${moment(cashbook?.cashDate).format(
        "YYYY"
      )}`,
    ],
    [],
    [],
  ];

  const titleExtraFormat = [[{ merge: { col: 13 }, fontSize: 20 }], [{ merge: { col: 13 } }]];
  const textAmount = cashbook?.amount ? VNnum2words(Math.round(+cashbook?.amount)).trim() + " đồng" : "";

  const data = [
    [`Họ tên người ${type === "PT" ? "nộp" : "nhận"} tiền`, "", cashbook.name],
    ["Địa chỉ", "", cashbook.address],
    [`Lý do ${type === "PT" ? "THU" : "CHI"}`, "", cashbook.reason],
    ["Số tiền", "", `${+cashbook?.amount} VND`],
    ["Viết bằng chữ", "", textAmount?.slice(0, 1).toUpperCase() + textAmount?.slice(1)],
    ["Kèm theo: .......... chứng từ gốc"],
  ];

  const dataFormat = [
    [{ merge: { col: 2 } }, {}, { merge: { col: 12 } }],
    [{ merge: { col: 2 } }, {}, { merge: { col: 12 } }],
    [{ merge: { col: 2 } }, {}, { merge: { col: 12 } }],
    [{ merge: { col: 2 } }, {}, { merge: { col: 12 }, fontBold: false }],
    [{ merge: { col: 2 } }, {}, { merge: { col: 12 }, fontBold: false }],
    [{ merge: { col: 14 } }],
  ];

  const footer = [
    [],
    [],
    ["Giám đốc", "", "", "Kế toán trưởng", "", "", "Thủ quỹ", "", "", "Người lập phiếu", "", "", `Người ${type === "PT" ? "nộp tiền" : "nhận tiền"}`],

    [],
    [],
    [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      `${cashbook?.createdByName === "Hệ thống" ? "" : cashbook?.createdByName ?? ""}`,
      "",
      "",
      `${cashbook?.name}`,
    ],
  ];
  const footerFormat = [
    [],
    [],
    [
      { merge: { col: 2 } },
      {},
      {},
      { merge: { col: 2 } },
      {},
      {},
      { merge: { col: 2 } },
      {},
      {},
      { merge: { col: 2 } },
      {},
      {},
      { merge: { col: 2 } },
    ],
    [],
    [],
    [],
    [
      { merge: { col: 2 } },
      {},
      {},
      { merge: { col: 2 } },
      {},
      {},
      { merge: { col: 2 } },
      {},
      {},
      { merge: { col: 2 } },
      {},
      {},
      { merge: { col: 2 } },
    ],
  ];

  return {
    fileName: `Phieu${type === "PT" ? "Thu" : "Chi"}_${cashbook.code}`,
    titleExtra,
    titleExtraFormat,
    infoHeaderCustom,
    infoHeaderCustomFormat,
    dataFormat,
    data,
    footer,
    footerFormat,
    footerBorder: false,
    footerAlignment: true,
    generateInfo: false,
    generateSign: false,
  };
};
