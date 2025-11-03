import React from "react";
import { useNavigate } from "react-router-dom";
import Image404 from "assets/images/img-404.svg";
import Button from "components/button/button";
import "./index.scss";

export default function Index() {
  document.title = "404 - Chúng tôi không tìm thấy yêu cầu của bạn";

  const navigate = useNavigate();

  return (
    <div className="page-content page-404 bg-white d-flex justify-content-center align-items-center">
      <div className="content d-flex flex-column align-items-center">
        <Image404 width="318px" />
        Xin lỗi, Chúng tôi không tìm thấy yêu cầu của bạn !
        <Button
          type="button"
          className="back-up"
          onClick={() => {
            navigate(-1);
          }}
        >
          Quay lại
        </Button>
      </div>
    </div>
  );
}
