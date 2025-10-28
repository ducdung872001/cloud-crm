import ExcelJS from "exceljs";

export const styles = {
  fullBorder: {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  } as ExcelJS.Borders,
  font: {
    name: "Times New Roman",
    family: 4,
  },
  fillCellForm: {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "16dfdfde",
    },
  } as ExcelJS.Fill,
  invisible: {
    color: { argb: "00ffffff" },
  },
  protection: {
    locked: {
      locked: true,
      hidden: true,
    },
    unlocked: {
      locked: false,
      hidden: false,
    },
  },
};

export const formats = {
  number: "#,##0",
  currency: "#,##0",
  date: "dd/mm/yyyy",
  datetime: "dd/mm/yyyy HH:mm",
};

export const columnFormat = {
  stt: "number",
  "thoi gian": "date",
  "ngay mua cuoi": "date",
  "tong doanh so": "currency",
  "tong doanh thu": "currency",
  "cong no": "currency",
  "tong tien": "currency",
  "ngay ban": "date",
  vat: "currency",
  "giam gia": "currency",
  "da thanh toan": "currency",
  "tra tu the": "currency",
  "doanh thu": "currency",
  "chi phi": "currency",
  "loi nhuan": "currency",
};

export const columnWidth = {
  stt: 8,
  "khach hang": 40,
  "dich vu": 30,
  "thoi gian": 40,
  "nhan vien thuc hien": 30,
  "noi dung thuc hien": 50,
  "ten khach hang": 40,
  "so dien thoai": 15,
  "ngay mua cuoi": 15,
  "tong doanh so": 20,
  "tong doanh thu": 20,
  "cong no": 15,
  "doanh thu": 15,
  "chi phi": 15,
  "loi nhuan": 15,
  vat: 10,
  ngay: 15,
  "tong tien": 18,
  "ngay ban": 15,
  "giam gia": 15,
  "da thanh toan": 18,
  "tra tu the": 15,
  "ma hoa don": 15,
  "trang thai hoa don": 20,
  "lich su tuong tac": 40,
  "dinh huong hoat dong tiep theo": 40,
  "dia chi": 25,
  "nhan vien phu trach": 20,
  "nguoi lien he": 20,
  "ten cong viec": 20,
  "nguoi nhan viec": 16,
  "thuoc du an": 18,
  "tien do": 15,
  "trang thai cong viec": 18,

  "noi dung": 42,
  "so luong": 18,
  "don gia": 18,
  "gia tri ke hoach": 18,
  "dien giai": 20,
  "gia tri vat": 15,

  "ten hop dong": 30,
  "so hop dong": 30,
  "gia tri hop dong": 20,
  "giai doan hd": 30,
  "loai hop dong": 30,
  "ngay ky": 20,
  "ngay het han": 20
};
