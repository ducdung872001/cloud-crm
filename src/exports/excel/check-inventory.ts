import moment from "moment";

export const getCheckInventoryOneBillExcelDoc = (data) => {
  return {
    fileName: "KiemKhoChiTiet",
    title: "Kiểm kho chi tiết",
    header: [
      "STT",
      "Tên thuốc",
      "Lô SX",
      "Hạn dùng",
      "Đơn vị",
      "SL trước kiểm",
      "SL thực tế",
      "SL chênh lệch",
      "Giá nhập",
      "Giá trị lệch",
      "Lý do điều chỉnh",
    ],
    data: data?.map((e, i) => [
      i + 1,
      e.productName,
      e.number,
      moment(e.expiryDate).format("DD/MM/YYYY"),
      e.unit_name,
      +e.amount,
      +e.current_amount,
      +e.diff_amount,
      +e.main_cost,
      +e.diff_value,
      e.note,
    ]),
    columnsWidth: [null, null, null, null, null, 13, 13, 13, 12, 13, 20],
    format: [null, null, null, null, null, "number", "number", "number", "number", "number", null],
  };
};
