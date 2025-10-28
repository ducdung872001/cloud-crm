import _ from "lodash";
import moment from "moment";
// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { borderBoldTable } from "./config";
import { IProductStore } from "types/productStore/productStoreModel";
import { IInvoiceDetail } from "types/invoice/invoiceResponseModel";
import { logo } from "./logoText";
import { formatCurrency } from "utils/common";
import { INumber, IUnit } from "types/product/productResponseModel";

// pdfMake.vfs = pdfFonts.pdfMake.vfs;
// pdfMake.tableLayouts = {
//   customTableLayout: {
//     ...borderBoldTable,
//     paddingLeft: function (i) {
//       return i === 0 ? 4 : 8;
//     },
//     paddingRight: function (i, node) {
//       return i === node.table.widths.length - 1 ? 4 : 8;
//     },
//     fillColor: function (i) {
//       return i % 2 === 1 ? "#dff" : null;
//     },
//   },

//   customTableLayoutSmall: {
//     ...borderBoldTable,
//     paddingLeft: function (i) {
//       return i === 0 ? 1 : 2;
//     },
//     paddingRight: function (i, node) {
//       return i === node.table.widths.length - 1 ? 1 : 2;
//     },
//     fillColor: function (i) {
//       return i % 2 === 1 ? "#dff" : null;
//     },
//   },

//   customTablePrintBill: {
//     ...borderBoldTable,
//     paddingLeft: function (i) {
//       return 0;
//     },
//     paddingRight: function (i, node) {
//       return i === node.table.widths.length - 1 ? 0 : 1;
//     },
//   },
//   customTableInvoice: {
//     ...borderBoldTable,
//     paddingLeft: function (i) {
//       return i === 0 ? 4 : 8;
//     },
//     paddingRight: function (i, node) {
//       return i === node.table.widths.length - 1 ? 4 : 8;
//     },
//   },
//   customTableInvoiceSmall: {
//     ...borderBoldTable,
//     paddingLeft: function (i) {
//       return i === 0 ? 1 : 2;
//     },
//     paddingRight: function (i, node) {
//       return i === node.table.widths.length - 1 ? 1 : 2;
//     },
//   },
// };

export const ExportPdf = async (docDef, fileName) => {
  // const pdf = pdfMake.createPdf(docDef);
  // pdf.download(`${fileName}-${moment().format("YYYYMMDDHHmm")}.pdf`);
};

export const PrintQrcode = (canvasElement, productStore: IProductStore, productName: string, number: INumber, units: IUnit[]) => {
  const image = canvasElement.toDataURL();
  const column = [
    {
      columns: [
        {
          stack: [
            {
              text: [
                "Số lô: ",
                {
                  text: number.number,
                  bold: true,
                },
              ],
            },
            {
              text: [
                "Hạn SD: ",
                {
                  text: number.expiry_date,
                  bold: true,
                },
              ],
            },
            ...units.map((unit) => ({
              text: [
                "Giá: ",
                {
                  text: `${formatCurrency(unit.current_cost, ",")}/${unit.unit_name}`,
                  bold: true,
                },
              ],
            })),
          ],
          width: 55,
          margin: [0, 5, 0, 0],
        },
        {
          image,
          width: 30,
        },
      ],
      fontSize: 6,
    },
  ];

  printStamp(column, productName, productStore);
};

export const PrintBarcode = (canvasElement, productStore: IProductStore, productName: string, number: INumber, units: IUnit[]) => {
  const column = [
    {
      svg: canvasElement.outerHTML,
      width: 90,
      height: 15,
    },
    {
      text: units.map((unit) => ({
        text: `${formatCurrency(unit.current_cost, ",")}/${unit.unit_name}; `,
        bold: true,
        fontSize: 6,
      })),
    },
    {
      text: [
        "Số lô: ",
        {
          text: `(${number.number})`,
          bold: true,
        },
        " HSD: ",
        {
          text: number.expiry_date,
          bold: true,
        },
      ],
    },
  ];
  printStamp(column, productName, productStore, {
    defaultStyle: {
      fontSize: 6,
      alignment: "center",
    },
    columnGap: 15,
  });
};

const printStamp = (column: any, productName?: string, productStore?: IProductStore, options?: any) => {
  column = [
    {
      text: productStore.name,
      bold: true,
    },
    {
      text: productName.substr(0, 60),
      bold: true,
    },
    ...column,
  ];

  // const pdf = pdfMake.createPdf({
  //   pageMargins: [10, 10, 10, 0],
  //   pageSize: {
  //     width: 315,
  //     height: "auto",
  //   },
  //   info: {
  //     author: "sphacy",
  //     subject: "product",
  //   },
  //   content: [
  //     {
  //       columns: [column, _.cloneDeep(column), _.cloneDeep(column)],
  //       columnGap: options?.columnGap || 9,
  //     },
  //   ],
  //   defaultStyle: options?.defaultStyle || {
  //     fontSize: 6,
  //   },
  // });

  // showPrintWindow(pdf);
};

const invoiceTypeNameMap = {
  IV1: "bán hàng",
  IV2: "nhập hàng NCC",
  IV3: "trả hàng",
  IV4: "trả hàng NCC",
  IV7: "nhập hàng tồn",
};

export const printBill = (productStore: IProductStore, invoiceData: IInvoiceDetail, isPrint = true) => {
  const combos = invoiceData.invoice_detail.filter(({ product_id }) => product_id < 0);
  const units = invoiceData.invoice_detail.filter(
    (item) => item.product_id > 0 && (invoiceData.invoice.invoice_type === "IV3" || item.combo_name === "" || item.combo_name === "Đơn thuốc")
  );
  const header = productStore?.settings?.invoice_print_header;
  const footer = productStore?.settings?.invoice_print_footer;
  // const pdf = pdfMake.createPdf({
  //   pageMargins: [5, 20, 5, 0],
  //   pageSize: {
  //     width: 200,
  //     height: "auto",
  //   },
  //   info: {
  //     author: "sphacy",
  //     subject: "product",
  //   },
  //   header: function (currentPage, pageCount) {
  //     if (pageCount === 1) {
  //       return "";
  //     }
  //     if (currentPage === 1) {
  //       return [{ text: `1/${pageCount}`, alignment: "right" }];
  //     } else
  //       return {
  //         columns: [
  //           {
  //             width: "*",
  //             text: `${invoiceData.invoice.invoice_code}`,
  //             alignment: "left",
  //             margin: [5, 0, 5, 0],
  //           },
  //           {
  //             width: "*",
  //             text: `${moment(invoiceData.invoice.receipt_date).format("DD/MM/YYYY")}`,
  //             alignment: "center",
  //             margin: [5, 0, 5, 0],
  //           },
  //           {
  //             width: "*",
  //             text: `${currentPage}/${pageCount}`,
  //             alignment: "right",
  //             margin: [5, 0, 5, 0],
  //           },
  //         ],
  //       };
  //   },
  //   content: [
  //     {
  //       svg: logo,
  //       width: 50,
  //       alignment: "center",
  //     },
  //     {
  //       text: ["\n", productStore.name.split("-")[0], "\n", productStore.address, "\n", productStore.phone],
  //       style: {
  //         alignment: "center",
  //         fontSize: 10,
  //       },
  //     },
  //     ...(header
  //       ? [
  //           {
  //             text: ["\n", header],
  //             style: {
  //               alignment: "center",
  //               fontSize: 11,
  //             },
  //           },
  //         ]
  //       : []),
  //     "\n*******************************************************\n",
  //     {
  //       text: "Hóa đơn " + invoiceTypeNameMap[invoiceData.invoice.invoice_type],
  //       style: {
  //         alignment: "center",
  //         fontSize: 16,
  //       },
  //     },
  //     "\n",
  //     {
  //       columns: [
  //         {
  //           stack: [
  //             `Mã HĐ: ${invoiceData.invoice.invoice_code}`,
  //             `Ngày hóa đơn: ${moment(invoiceData.invoice.receipt_date).format("DD/MM/YYYY")}`,
  //             `Khách hàng: ${invoiceData.invoice.customer_name || "Khách lẻ"}`,
  //             invoiceData.invoice.number_phone ? `Số ĐT: ${invoiceData.invoice.number_phone}` : null,
  //             `DS phụ trách: ${invoiceData.invoice.user_fullname}`,
  //           ],
  //         },
  //         {
  //           width: "50",
  //           qr: invoiceData.invoice.invoice_code,
  //           fit: "50",
  //         },
  //       ],
  //     },
  //     "\n",
  //     ...(combos.length
  //       ? [
  //           billColumnCombo("Combo", "Giá", "SL", "Thành tiền"),
  //           [...Array(85)].map(() => "-").join(""),
  //           [
  //             ...combos.reduce(
  //               (acc, cur) =>
  //                 acc.push(
  //                   billColumnCombo(cur.combo_name, cur.cost, cur.quantity, cur.cost * cur.quantity),
  //                   [...Array(89)].map(() => "·").join("")
  //                 ) && acc,
  //               []
  //             ),
  //           ],
  //           "\n",
  //         ]
  //       : []),
  //     ...(units.length
  //       ? [
  //           [
  //             {
  //               style: {
  //                 fontSize: 8,
  //               },
  //               table: {
  //                 headerRows: 1,
  //                 widths: [35, 25, 35, 35, 50],
  //                 body: [
  //                   [
  //                     {
  //                       text: "Mặt hàng\nSố lượng",
  //                       border: [false, false, false, true],
  //                     },
  //                     {
  //                       text: "\nĐơn vị",
  //                       border: [false, false, false, true],
  //                     },
  //                     {
  //                       text: "\nGiá",
  //                       alignment: "right",
  //                       border: [false, false, false, true],
  //                     },
  //                     {
  //                       text: "\nVAT %",
  //                       alignment: "right",
  //                       border: [false, false, false, true],
  //                     },
  //                     {
  //                       text: "\nThành tiền",
  //                       alignment: "right",
  //                       border: [false, false, false, true],
  //                     },
  //                   ],
  //                   ...units.reduce((acc, cur, idx) => {
  //                     return [
  //                       ...acc,
  //                       [
  //                         {
  //                           text: `${idx + 1}. ` + (cur.combo_name === "Đơn thuốc" ? "* " : "") + cur.invoice_detail.product_name,
  //                           bold: true,
  //                           colSpan: 5,
  //                           border: [false, false, false, false],
  //                           headlineLevel: "productName",
  //                         },
  //                         "",
  //                         "",
  //                         "",
  //                         "",
  //                       ],
  //                       [
  //                         {
  //                           text: +cur.quantity,
  //                           bold: true,
  //                           alignment: "right",
  //                           border: [false, false, false, false],
  //                           headlineLevel: "productQuantity",
  //                         },
  //                         {
  //                           text: cur.unit_name,
  //                           border: [false, false, false, false],
  //                         },
  //                         {
  //                           text: formatCurrency(+cur.current_cost || +cur.org_cost, ","),
  //                           alignment: "right",
  //                           border: [false, false, false, false],
  //                         },
  //                         {
  //                           text: +cur.vat,
  //                           alignment: "right",
  //                           border: [false, false, false, false],
  //                         },
  //                         {
  //                           text: formatCurrency(+cur.current_cost ?? +cur.org_cost ?? +cur.cost * +cur.quantity * (1 + +cur.vat / 100.0), ","),
  //                           alignment: "right",
  //                           bold: true,
  //                           border: [false, false, false, false],
  //                         },
  //                       ],
  //                       [
  //                         {
  //                           text: (cur.usage ? `Liều dùng: ${cur.usage}\n` : "") + `${[...Array(89)].map(() => ".").join("")}`,
  //                           colSpan: 5,
  //                           border: [false, false, false, false],
  //                         },
  //                         {},
  //                         {},
  //                         {},
  //                         {},
  //                       ],
  //                     ];
  //                   }, []),
  //                 ],
  //               },
  //               layout: "customTablePrintBill",
  //             },
  //           ],
  //         ]
  //       : ["\n"]),
  //     [
  //       ...[
  //         {
  //           text: "Tổng đơn (VNĐ)",
  //           value: +invoiceData.invoice.amount,
  //           bold: true,
  //           headlineLevel: "totalCostInvoice",
  //         },
  //         {
  //           text: "VAT (VNĐ)",
  //           value: +invoiceData.invoice.vat_amount,
  //         },
  //         {
  //           text: "Giảm giá (VNĐ)",
  //           value: +invoiceData.invoice.discount,
  //         },
  //         {
  //           text: "Đã thanh toán (VNĐ)",
  //           value: +invoiceData.invoice.pay_amount,
  //           bold: true,
  //         },
  //         {
  //           text: "Công nợ (VNĐ)",
  //           value: +invoiceData.invoice.amount + +invoiceData.invoice.vat_amount - +invoiceData.invoice.discount - +invoiceData.invoice.pay_amount,
  //           bold: true,
  //         },
  //       ].reduce((acc, cur) => acc.push(billSummaryLine(cur)) && acc, []),
  //       ...(footer
  //         ? [
  //             {
  //               text: ["\n", footer],
  //               style: {
  //                 alignment: "center",
  //                 fontSize: 11,
  //               },
  //             },
  //           ]
  //         : []),
  //     ],
  //     "\n\n",
  //   ],
  //   pageBreakBefore: function (currentNode, followingNodesOnPage) {
  //     if (currentNode.startPosition.top && Math.round(currentNode.startPosition.top) > 790 && currentNode.headlineLevel === "productName") {
  //       return true;
  //     }
  //     if (currentNode.headlineLevel === "productName") {
  //       if (currentNode.startPosition.top > 600 && followingNodesOnPage[5]?.text?.length > 850) {
  //         return true;
  //       }
  //       for (let i = 0; i < 6; i++) {
  //         if (followingNodesOnPage[i]?.startPosition !== undefined && followingNodesOnPage[i].startPosition.top > 750) {
  //           return true;
  //         }
  //       }
  //     }
  //     if (currentNode.headlineLevel === "totalCostInvoice" && currentNode.startPosition.top && currentNode.startPosition.top > 750) {
  //       return true;
  //     }
  //   },
  //   defaultStyle: {
  //     fontSize: 8,
  //   },
  // });

  // if (isPrint) showPrintWindow(pdf);
  // return pdf;
};

interface PrintCodBillProps {
  productStore: IProductStore;
  invoiceData: IInvoiceDetail;
  isPrint: boolean;
}
export const printCodBill = (props: PrintCodBillProps) => {
  const { productStore, invoiceData, isPrint } = props;
  const { invoice, invoice_detail } = invoiceData;

  // const pdf = pdfMake.createPdf({
  //   pageMargins: [5, 5, 5, 5],
  //   pageOrientation: "portrait",
  //   pageSize: {
  //     width: 280,
  //     height: "auto",
  //   },
  //   info: {
  //     author: "sphacy",
  //     subject: "product",
  //   },
  //   content: [
  //     {
  //       table: {
  //         body: [
  //           [
  //             {
  //               columns: [
  //                 {
  //                   svg: logo,
  //                   width: 50,
  //                 },
  //                 {
  //                   text: [
  //                     { text: "Người gửi: ", bold: true },
  //                     { text: productStore.name },
  //                     { text: "\nĐịa chỉ: ", bold: true },
  //                     {
  //                       text: productStore.address,
  //                     },
  //                     { text: "\nSĐT: ", bold: true },
  //                     { text: productStore.phone },
  //                   ],
  //                   margin: [10, 0, 0, 0],
  //                 },
  //               ],
  //             },
  //           ],
  //           [
  //             {
  //               text: [
  //                 { text: "Người nhận: ", bold: true },
  //                 { text: invoice.customer_name },
  //                 { text: "\nSĐT: ", bold: true },
  //                 { text: invoice.number_phone },
  //                 { text: "\nĐịa chỉ: ", bold: true },
  //                 {
  //                   text: invoice.address,
  //                 },
  //                 { text: "\nMã hóa đơn: ", bold: true },
  //                 {
  //                   text: invoice.invoice_code,
  //                 },
  //                 { text: "\nTổng tiền: ", bold: true },
  //                 {
  //                   text: invoice.pay_amount.toLocaleString("it-IT"),
  //                 },
  //                 {
  //                   text: " VNĐ",
  //                 },
  //                 { text: "\nSố lượng sản phẩm: ", bold: true },
  //                 {
  //                   text: invoice_detail.length,
  //                 },
  //                 { text: "\nGhi chú: ", bold: true },
  //                 {
  //                   text: invoice.description || "",
  //                 },
  //                 {
  //                   text: "\nSố tiền thu hộ: ",
  //                   bold: true,
  //                   fontSize: 16,
  //                 },
  //                 {
  //                   text: invoice.pay_amount.toLocaleString("it-IT"),
  //                   bold: true,
  //                   fontSize: 16,
  //                 },
  //                 {
  //                   text: " VNĐ",
  //                   bold: true,
  //                   fontSize: 16,
  //                 },
  //               ],
  //               margin: [15, 0, 15, 0],
  //               lineHeight: 1.2,
  //             },
  //           ],
  //         ],
  //         heights: ["auto", "auto", "auto", "auto"],
  //       },
  //     },
  //   ],
  // });
  // if (isPrint) showPrintWindow(pdf);

  // if (invoice.payment_method !== "cash") {
  //   delete pdf.docDefinition.content[0].table.body[1][0].text[15];
  //   delete pdf.docDefinition.content[0].table.body[1][0].text[16];
  //   delete pdf.docDefinition.content[0].table.body[1][0].text[17];
  // }

  // return pdf;
};

const showPrintWindow = (pdf) => {
  pdf.getBlob((blob) => {
    const objectURL = URL.createObjectURL(blob);
    const pdfFrame: HTMLIFrameElement = document.querySelector("#pdf-frame");
    pdfFrame.src = "";
    pdfFrame.src = objectURL;
    URL.revokeObjectURL(blob);
    setTimeout(() => {
      pdfFrame.contentWindow.print();
    }, 1000);
  });
};

function billColumnCombo(t1, t2, t3, t4) {
  return {
    columns: [
      {
        width: 90,
        text: isNaN(t1) ? t1 : formatCurrency(+t1, ","),
      },
      {
        width: 40,
        text: isNaN(t2) ? t2 : formatCurrency(+t2, ","),
        style: {
          alignment: "right",
        },
      },
      {
        width: 10,
        text: isNaN(t3) ? t3 : formatCurrency(+t3, ","),
        style: {
          alignment: "right",
        },
      },
      {
        width: 45,
        text: isNaN(t4) ? t4 : formatCurrency(+t4, ","),
        style: {
          alignment: "right",
        },
      },
    ],
    columnGap: 2,
  };
}

interface BillSummaryLine {
  text: string;
  value: string | number;
  bold?: any;
  headlineLevel?: any;
}

function billSummaryLine(props: BillSummaryLine) {
  const { text, value, bold, headlineLevel } = props;
  return {
    columns: [
      {
        width: 70,
        text: "",
        headlineLevel: headlineLevel ? headlineLevel : undefined,
      },
      {
        width: 70,
        text: text,
        style: {
          alignment: "right",
        },
        headlineLevel: headlineLevel ? headlineLevel : undefined,
      },
      {
        width: 50,
        text: formatCurrency(+value, ","),
        style: {
          alignment: "right",
          bold: bold,
        },
        headlineLevel: headlineLevel ? headlineLevel : undefined,
      },
    ],
  };
}
