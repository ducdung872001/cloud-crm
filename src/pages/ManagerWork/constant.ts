// export ra các hằng số dùng chung trong trang ManagerWork
export const listColors = ["#FFC43C", "#00b499", "#0091FF", "#F76808", "#12A594", "#E5484D"];
export const HEADER_VIEW_MODES = {
  overview: 1,
  all: 2,
  mywork: 3,
  joinedwork: 4,
};
export const lstTitleHeader = [
  {
    name: "Tổng quan công việc",
    type: HEADER_VIEW_MODES.overview,
  },
  {
    name: "Tất cả công việc",
    type: HEADER_VIEW_MODES.all,
  },
  {
    name: "Công việc của tôi",
    type: HEADER_VIEW_MODES.mywork,
  },
  {
    name: "Công việc tham gia",
    type: HEADER_VIEW_MODES.joinedwork,
  }
];
