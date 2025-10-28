import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IZaloOAConnectFilterRequest } from "model/zaloOA/ZaloOARequest";
import Modal, { ModalBody } from "components/modal/modal";
import { showToast } from "utils/common";
import ZaloOAService from "services/ZaloOAService";
import "./index.scss";

export default function PublicConnectZalo() {
  document.title = "Kết nối với Zalo";

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [countDown, setCountDown] = useState<number>(5);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loadingGif = require("assets/images/image-success.gif");

  //* Todo: Cách thứ 1 lấy link url
  const [searchParams, setSearchParams] = useSearchParams();

  const [params, setParams] = useState({
    oaId: searchParams.get("oa_id"),
    code: searchParams.get("code"),
  });

  //! đoạn này điều hướng trang
  const navigate = useNavigate();

  //? Todo: cách thứ 2 lấy link url
  //   const params = getSearchParameters();

  //! đoạn này callAPI connect zalo
  const abortController = new AbortController();

  const handleConnectZalo = async (paramsSearch: IZaloOAConnectFilterRequest) => {
    const response = await ZaloOAService.connect(paramsSearch, abortController.signal);
    if (response.code === 0) {
      showToast("Kết nối với zalo thành công !", "success");
      setIsOpen(true);
      setTimeout(() => {
        navigate("/setting_social_crm");
      }, 5000);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //! đoạn này xử lý vấn đề đếm ngược thời gian chuyển trang
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        if (countDown >= 0) {
          setCountDown(countDown - 1);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, countDown]);

  useEffect(() => {
    if (params.code && params.oaId) {
      handleConnectZalo(params);
    }
  }, [params]);

  return (
    <Fragment>
      <Modal isFade={true} isOpen={isOpen} isCentered={true} staticBackdrop={true} className="modal-view-connect">
        <ModalBody>
          <div className="page-content page__connect--zalo">
            <div className="icon__connect">
              <img src={loadingGif} alt="" />
            </div>
            <div className="notification">
              <h1 className="name__connect--success">Kết nối thành công !</h1>
              <span className="automatic-navigation">
                Tự động chuyển hướng sau <strong>{countDown}</strong>s
              </span>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </Fragment>
  );
}
