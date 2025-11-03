import { excelEditCell, worksheetAddRow } from "exports/excel/index";
import moment from "moment";

export const getInvoiceDetailExcelDoc = async (invoiceData) => {
  const { invoice } = invoiceData;
  const isWarehousingInvoice = invoice.invoice_type === "IV2";
  const infoHeader = [
    [],
    isWarehousingInvoice ? ["Nhà cung cấp", invoice.supplier_name] : ["Khách hàng", invoice.customer_name || "Khách lẻ"],
    ["Mã hoá đơn", invoice.invoice_code],
    ["Ngày hoá đơn", moment(invoice.receipt_date).format("YYYY-MM-DD")],
    ...(isWarehousingInvoice
      ? [
          ["Ngày nhập hàng", moment(invoice.created_at).format("YYYY-MM-DD")],
          ["Người tạo hóa đơn", invoice.user_fullname],
        ]
      : [["DS phụ trách", invoice.user_fullname]]),
    ...(invoice.description ? [["Ghi chú", invoice.description]] : []),
  ];

  const header = [
    "STT",
    "Mã sản phẩm",
    "Tên mặt hàng",
    "Số lô",
    "Hạn dùng",
    "Đơn vị tính",
    "Số lượng",
    ...(isWarehousingInvoice ? ["Giá nhập", "Giảm giá"] : ["Giá bán"]),
    "VAT",
    "Thành tiền",
  ];
  const nullCellHeader = Array(header.length - 2).map(() => null);
  const valueCellMap = isWarehousingInvoice ? "K" : "J";
  const nameCellMap = isWarehousingInvoice ? "J" : "I";

  return {
    fileName: `ThongTinHoaDon${isWarehousingInvoice ? "Nhap" : "Ban"}Hang`,
    title: `THÔNG TIN HOÁ ĐƠN ${isWarehousingInvoice ? "NHẬP" : "BÁN"} HÀNG`,
    infoHeader,
    header,
    data: invoiceData.invoice_detail.map((item, index) => [
      index + 1,
      item?.invoice_detail?.product_code,
      item.product_id < 0 ? item.combo_name : item?.invoice_detail.product_name,
      item.number ?? item.invoice_detail.number,
      moment(item.expiry_date).format("YYYY-MM-DD"),
      item.unit_name ?? item.invoice_detail.unit_name,
      +item.quantity || +item.invoice_detail.quantity,
      ...(isWarehousingInvoice
        ? [
            +item.org_cost || +item.cost || +item.invoice_detail.org_cost || +item.invoice_detail.cost,
            (+item.invoice_detail.org_cost || +item.invoice_detail.cost) - +item.invoice_detail.cost,
          ]
        : [+item.cost]),
      +item.vat || +item.invoice_detail.vat,
      +item.cost * +item.quantity * (1 + +item.vat / 100.0) ||
        +item.invoice_detail.cost * +item.invoice_detail.quantity * (1 + +item.invoice_detail.vat / 100.0),
    ]),
    footer: [
      "Tổng cộng",
      ...nullCellHeader,
      {
        formula: `SUM(${valueCellMap}${
          5 + infoHeader.length + 4 // (5 = defaultInfo, 5 = 3row empty + 1 row header + 1 current row)
        }:${valueCellMap}${5 + infoHeader.length + 4 + invoiceData.invoice_detail.length - 1})`,
      },
    ],
    footerFormat: [[{ merge: { col: header.length - 1 } }, ...nullCellHeader, { numFmt: "#,##0" }]],
    generateSign: false,
    callback: (workbook, curRowIdx) => {
      const ws = workbook.getWorksheet(1);
      excelEditCell(ws.getCell("B9"), { alignment: { wrapText: false } });
      excelEditCell(ws.getCell("B110"), { alignment: { wrapText: false } });
      worksheetAddRow(ws, [...nullCellHeader, "Tổng tiền hàng", +invoice.amount], curRowIdx + 1);
      worksheetAddRow(ws, [...nullCellHeader, "Tổng tiền VAT", +invoice.vat_amount], curRowIdx + 2);
      worksheetAddRow(ws, [...nullCellHeader, "Giảm giá", +invoice.discount], curRowIdx + 3);
      worksheetAddRow(
        ws,
        [...nullCellHeader, isWarehousingInvoice ? "Tổng tiền phải trả" : "Khách phải trả", +invoice.amount - +invoice.discount],
        curRowIdx + 4
      );
      worksheetAddRow(ws, [...nullCellHeader, isWarehousingInvoice ? "Thực trả NCC" : "Khách thực trả", +invoice.pay_amount], curRowIdx + 5);
      worksheetAddRow(
        ws,
        [...nullCellHeader, "Công nợ", +invoice.amount + +invoice.vat_amount - +invoice.discount - +invoice.pay_amount],
        curRowIdx + 6
      );

      excelEditCell(ws.getCell(`${nameCellMap}${curRowIdx + 1}`), {
        alignment: { horizontal: "right" },
      });
      excelEditCell(ws.getCell(`${nameCellMap}${curRowIdx + 2}`), {
        alignment: { horizontal: "right" },
      });
      excelEditCell(ws.getCell(`${nameCellMap}${curRowIdx + 3}`), {
        alignment: { horizontal: "right" },
      });
      excelEditCell(ws.getCell(`${nameCellMap}${curRowIdx + 4}`), {
        alignment: { horizontal: "right" },
      });
      excelEditCell(ws.getCell(`${nameCellMap}${curRowIdx + 5}`), {
        alignment: { horizontal: "right" },
      });
      excelEditCell(ws.getCell(`${nameCellMap}${curRowIdx + 6}`), {
        alignment: { horizontal: "right" },
      });
      excelEditCell(ws.getCell(`${valueCellMap}${curRowIdx + 1}`), {
        numFmt: "#,##0",
      });
      excelEditCell(ws.getCell(`${valueCellMap}${curRowIdx + 2}`), {
        numFmt: "#,##0",
      });
      excelEditCell(ws.getCell(`${valueCellMap}${curRowIdx + 3}`), {
        numFmt: "#,##0",
      });
      excelEditCell(ws.getCell(`${valueCellMap}${curRowIdx + 4}`), {
        numFmt: "#,##0",
      });
      excelEditCell(ws.getCell(`${valueCellMap}${curRowIdx + 5}`), {
        numFmt: "#,##0",
      });
      excelEditCell(ws.getCell(`${valueCellMap}${curRowIdx + 6}`), {
        numFmt: "#,##0",
      });
    },
  };
};
