import React from "react";
import { Link } from "react-router-dom";
import urls from "configs/urls";
import { IMenuItem } from "model/OtherModel";
import TitleAction from "components/titleAction/titleAction";
import "./ReportCommon.scss";

export default function ReportCommon() {
  document.title = "Báo cáo";

  const menuReport: IMenuItem[] = [
    {
      //Tổng, Doanh số (dịch vụ, sản phẩm, thẻ dịch vụ)
      //Doanh số: Bán nhưng có thể thu hoặc khách còn nợ (dịch vụ, sản phẩm, thẻ dịch vụ)
      //Doanh thu: Thực thu => cashbook
      title: "Báo cáo doanh thu", //Chi tiết doanh thu theo ngày => Nhìn diễn biến
      path: "",

      //Các loại báo cáo doanh thu: Doanh thu tổng; doanh thu theo tỉnh thành; doanh thu theo khách hành/sản phẩm/dịch vụ/thẻ dịch vụ
    },
    {
      title: "Báo cáo chi phí",
      path: "",
    },
    {
      title: "Báo cáo tăng trưởng khách hàng",
      path: "",
    },
    {
      title: "Báo cáo sản phẩm hết hạn", //Nhìn dạng table, xuất ra danh sách các sản phẩm sắp hết hạn
      path: "",
    },
    {
      title: "Báo cáo chấm công", //Tạm pending
      path: "",
    },
    {
      title: "Báo cáo hoa hồng", //Chờ a xử lý xong phần hoa hồng
      path: "",
    },
    {
      title: "Lịch sử tác động",
      path: "",
    },
  ];

  return (
    <div className="page-content page-report">
      <TitleAction title="Báo cáo" />
      <div className="card-box d-flex flex-column">
        <ul className="menu">
          {menuReport.map((item, idx) => (
            <li key={idx} className="menu__category">
              <Link to={item.path} className="menu__category--link">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
