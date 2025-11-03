import React, { Fragment, useEffect, useMemo, useState } from "react";
import moment from "moment";
import Loading from "components/loading";
import Image from "components/image";
import BoxTable from "components/boxTable/boxTable";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import UserService from "services/UserService";
import { showToast } from "utils/common";
import { SystemNotification } from "components/systemNotification/systemNotification";

import "./ViewDetailLoginModal.scss";

export default function ViewDetailLoginModal({ onShow, onHide, data }) {
  const [lstData, setLstData] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const titles = ["STT", "Ảnh nhân viên", "Tên nhân viên", "Thời gian đăng nhập"];

  const dataFormat = ["text-center", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [index + 1, <Image key={item.id} src={item.avatar} alt={item.name} />, item.name, item.date];

  const handleLstUserLoginDetail = async (data) => {
    if (!data) return;

    setIsLoading(true);

    const params = {
      userId: data.id,
      date: moment(data.actionTime).format("DD/MM/YYYY"),
    };

    const response = await UserService.detailTimeLogin(params);

    if (response.code === 0) {
      const result = response.result.items;
      setLstData(result);
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && data) {
      handleLstUserLoginDetail(data);
    }
  }, [onShow, data]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-view-detail-login">
        <div className="box-view-detail-login">
          <ModalHeader title={`Chi tiết đăng nhập`} toggle={() => onHide()} />
          <ModalBody>
            {!isLoading && lstData && lstData.length > 0 ? (
              <div className="list__login">
                <BoxTable
                  name="Chi tiết đăng nhập"
                  titles={titles}
                  items={lstData}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                />
              </div>
            ) : isLoading ? (
              <Loading />
            ) : (
              <SystemNotification description={<span>Hiện tại chưa có dữ liệu nào.</span>} type="no-item" />
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
