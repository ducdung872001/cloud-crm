import React, { useState, useEffect, useMemo, Fragment } from "react";
import moment from "moment";
import { IActionModal } from "model/OtherModel";
import { IViewStatusTicketModalProps } from "model/ticket/PropsModel";
import Loading from "components/loading";
import Modal, { ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import { SystemNotification } from "components/systemNotification/systemNotification";
import SupportCommonService from "services/SupportCommonService";
import Badge from "components/badge/badge";
import BoxTable from "components/boxTable/boxTable";
import "./ViewStatusTicketModal.scss";

export default function ViewStatusTicketModal(props: IViewStatusTicketModalProps) {
  const { onShow, onHide, idTicket } = props;

  const [lstSupportLog, setLstSupportLog] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const titles = ["STT", "Phòng ban tiếp nhận", "Nhân viên", "Thời gian tiếp nhận", "Thời gian hoàn thành", "Ghi chú", "Trạng thái"];
  const dataFormat = ["text-center", "", "", "text-center", "text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    index + 1,
    item.departmentName,
    item.employeeName,
    item.receiverTime ? moment(item.receiverTime).format("DD/MM/YYYY HH:mm:ss") : "",
    item.assignedTime ? moment(item.assignedTime).format("DD/MM/YYYY HH:mm:ss") : "",
    item.note,
    <Badge
      key={item.id}
      text={item.status == 0 ? "Chờ tiếp nhận" : item.status == 1 ? "Đang thực hiện" : item.status === 2 ? "Hoàn thành" : "Hủy"}
      variant={item.status == 0 ? "secondary" : item.status == 1 ? "warning" : item.status === 2 ? "success" : "error"}
    />,
  ];

  const handleLstSupportLog = async (id: number) => {
    if (!id) return;

    setIsLoading(true);

    const params = {
      objectId: id,
      objectType: 1,
    };

    const response = await SupportCommonService.lstLog(params);

    if (response.code === 0) {
      const result = response.result;
      setLstSupportLog(result);
    } else {
      showToast("Lịch sử hỗ trợ đang lỗi. Xin vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (idTicket) {
      handleLstSupportLog(idTicket);
    }
  }, [idTicket]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide(false);
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        size="lg"
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => onHide(false)}
        className="modal-view--history-ticket"
      >
        <ModalHeader title="Xem lịch xử hỗ trợ" toggle={() => onHide(false)} />
        {!isLoading && lstSupportLog && lstSupportLog.length > 0 ? (
          <BoxTable
            name="Lịch sử hỗ trợ"
            titles={titles}
            items={lstSupportLog}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <SystemNotification description={<span>Hiện tại chưa có lịch sử hỗ trợ nào.</span>} type="no-item" />
        )}
        <ModalFooter actions={actions} />
      </Modal>
    </Fragment>
  );
}
