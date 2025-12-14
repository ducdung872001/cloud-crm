export const dataPackage = [
  {
    name: "Quản lý khách hàng",
  },
  {
    name: "Quản lý bán hàng/ Hóa đơn/ Hoàn trả",
  },
  {
    name: "Lên lịch hẹn/ Nhắc lịch hẹn/ Thông báo lịch hẹn",
  },
  {
    name: "Theo dõi thực hiện dịch vụ",
  },
  {
    name: "Tin nhắn SMS CSKH",
  },
  {
    name: "Tổng đài thoại CSKH",
  },
  {
    name: "Tiếp nhận bảo hành, phản hồi khách hàng, ticket",
  },
  {
    name: "Thống kê doanh thu",
  },
  {
    name: "Quản lý cơ hội",
  },
  {
    name: "Ngân sách truyền thông",
  },
  {
    name: "Quản lý chi nhánh/ Phòng ban/ Nhân viên",
  },
];

export const infoPackage = [
  {
    id: 1,
    name: "Gói miễn phí",
    code: "free",
    function: dataPackage,
    price: 0,
    descript: "Không giới hạn số lượng tài khoản, chi nhánh. Dành cho mô hình kinh doanh đại lý, miễn phí 6 tháng đầu tiên sử dụng.",
    extend: ["06 tháng", "12 tháng"],
    isMore: false,
    disabled: false,
  },
  {
    id: 2,
    name: "Gói cơ bản",
    code: "basic",
    function: dataPackage,
    price: 50000,
    descript: "Số lượng tài khoản, số lượng chi nhánh không giới hạn. Dành cho mô hình kinh doanh đại lý, khách lẻ.",
    extend: ["06 tháng", "12 tháng", "36 tháng", "Vĩnh viễn"],
    isMore: false,
    disabled: false,
  },
  {
    id: 3,
    name: "Gói bạc",
    code: "silver",
    function: dataPackage,
    price: 250000,
    descript: "Số lượng tài khoản nhỏ hơn hoặc bằng 10, số lượng chi nhánh 01. Dành cho mô hình kinh doanh đại lý, khách lẻ.",
    extend: ["06 tháng", "12 tháng", "36 tháng", "Vĩnh viễn"],
    isMore: false,
    disabled: false,
  },
  {
    id: 4,
    name: "Gói vàng",
    code: "gold",
    function: dataPackage,
    price: 350000,
    descript: "Số lượng tài khoản nhỏ hơn hoặc bằng 25, số lượng chi nhánh 03. Dành cho mô hình kinh doanh đại lý, khách lẻ.",
    extend: ["06 tháng", "12 tháng", "36 tháng", "Vĩnh viễn"],
    isMore: false,
    disabled: false,
  },
  {
    id: 5,
    name: "Gói kim cương",
    code: "diamond",
    function: dataPackage,
    price: 350000,
    descript: "Dành cho mô hình kinh doanh đại lý, khách lẻ. Có thể điều chỉnh số lượng tài khoản, chi nhánh theo nhu cầu.",
    account: "",
    branch: "",
    isMore: false,
    disabled: false,
  },
];
