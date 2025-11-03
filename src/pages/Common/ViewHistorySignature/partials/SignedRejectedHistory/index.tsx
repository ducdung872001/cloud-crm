import React, { useEffect, useState } from "react";
import moment from "moment";
import Icon from "components/icon";
import Button from "components/button/button";
import TextArea from "components/textarea/textarea";
import BoxTable from "components/boxTable/boxTable";
import ApprovalService from "services/ApprovalService";
import { showToast } from "utils/common";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Badge from "components/badge/badge";

import "./index.scss";

export default function SignedRejectedHistory(props) {
  const { data, type, infoApproved, isSigned, onReload, lstApprovalLog } = props;

  // đoạn này là lấy ra thông tin của trình ký đã ký
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [dataAction, setDataAction] = useState(null);
  const [valueNote, setValueNote] = useState<string>("");

  const lstAction = [
    { name: "Phê duyệt", status: 1, color: "success" },
    { name: "Phê duyệt có lưu ý", status: 1, color: "warning" },
    { name: "Từ chối", status: 0, color: "destroy" },
  ];

  const handleSigned = async (item) => {
    setIsSubmit(true);

    const body = {
      objectId: data?.id,
      objectType: type === "fs" ? 1 : type === "quote" ? 2 : 3,
      approvalId: infoApproved?.approvalId,
      status: item.status,
      note: valueNote,
      isAlert: 0
    };

    const response = await ApprovalService.updateLog(body);

    if (response.code === 0) {
      showToast(`${item.status === 1 ? "Phê duyệt" : item.name} thành công`, "success");
      onReload(true);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
    setIsSubmit(false);
  };

  const titles = ["STT", "Người ký", "Đơn vị", "Thời gian ký", "Ghi chú ký", "Trạng thái"];
  const dataFormat = ["text-center", "", "", "text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    index + 1,
    item.employeeName,
    item.departmentName,
    item.receiverTime ? moment(item.receiverTime).format("DD/MM/YYYY HH:mm:ss") : "",
    item.note,
    <Badge key={item.id} text={item.status ? "Phê duyệt" : "Từ chối"} variant={item.status ? "success" : "error"} />,
  ];

  return (
    <div className="signed__rejected--history">
      <div className="lst__history">
        <span className={`__name--history ${lstApprovalLog && lstApprovalLog.length > 0 ? "__special-name--history" : ""}`}>Xem lịch sử ký</span>

        <div className="lst__approval--log">
          {lstApprovalLog && lstApprovalLog.length > 0 && (
            <BoxTable
              name="Lịch sử ký"
              titles={titles}
              items={lstApprovalLog}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              striped={true}
            />
          )}

          {lstApprovalLog && lstApprovalLog.length === 0 && (
            <SystemNotification description={<span>Hiện tại chưa có lịch sử ký nào.</span>} type="no-item" />
          )}
        </div>
      </div>

      {isSigned && (
        <div className="submit__form--signature">
          <div className="form-group">
            <TextArea
              fillColor={true}
              label="Ghi chú ký"
              value={valueNote}
              placeholder="Nhập ghi chú ký"
              onChange={(e) => setValueNote(e.target.value)}
            />
          </div>

          <div className="lst__action">
            {lstAction.map((item, idx) => {
              return (
                <Button
                  key={idx}
                  color={item.color as any}
                  onClick={() => {
                    handleSigned(item);
                    setDataAction(item);
                  }}
                  disabled={isSubmit}
                >
                  {item.name} {dataAction?.name === item.name && <Icon name="Loading" />}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
