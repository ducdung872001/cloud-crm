import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import SupportCommonService from "services/SupportCommonService";
import { showToast } from "utils/common";
import Badge from "components/badge/badge";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import TextArea from "components/textarea/textarea";
import Button from "components/button/button";
import Icon from "components/icon";
import { ContextType, UserContext } from "contexts/userContext";
import "./HistorySupport.scss";

export default function HistorySupport(props) {
  const { data, infoApproved, lstSupportLog, hasTransferVotes, onReload } = props;

  const { dataInfoEmployee } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [valueNote, setValueNote] = useState<string>("");
  const [chooseAction, setChooseAction] = useState<number>(null);
  const [hasSubmitSuccess, setHasSubmitSuccess] = useState<boolean>(true);

  const [dataSupportLog, setDataSupportLog] = useState(null);

  const titles = ["STT", "Phòng ban tiếp nhận", "Thời gian tiếp nhận", "Nhân viên xử lý", "Thời gian hoàn thành", "Ghi chú", "Trạng thái"];
  const dataFormat = ["text-center", "", "", "text-center", "text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    index + 1,
    item.departmentName,
    item.receiverTime ? moment(item.receiverTime).format("DD/MM/YYYY HH:mm:ss") : "",
    item.employeeName ? (
      item.employeeName
    ) : (
      <span key={item.id} style={{ fontSize: "1.2rem", color: "var(--extra-color-30)" }}>
        Chờ xác nhận...
      </span>
    ),
    item.assignedTime ? moment(item.assignedTime).format("DD/MM/YYYY HH:mm:ss") : "",
    item.note,
    <Badge
      key={item.id}
      text={item.status == 0 ? "Chờ tiếp nhận" : item.status == 1 ? "Đang thực hiện" : item.status === 2 ? "Hoàn thành" : "Hủy"}
      variant={item.status == 0 ? "secondary" : item.status == 1 ? "warning" : item.status === 2 ? "success" : "error"}
    />,
  ];

  useEffect(() => {
    if (dataInfoEmployee && lstSupportLog.length > 0) {
      const result = lstSupportLog.find((item) => item.departmentId === dataInfoEmployee.departmentId);
      setDataSupportLog(result);
    }
  }, [dataInfoEmployee, lstSupportLog]);

  const handleConfirmSupport = async (item) => {
    if (!item) return;

    setIsSubmit(true);
    setChooseAction(item.action);

    const body = {
      ...(dataSupportLog ? { id: dataSupportLog.id } : {}),
      objectId: data?.id,
      objectType: 1,
      supportId: infoApproved?.supportId,
      note: valueNote,
    };

    let response = null;

    if (item.action === 1) {
      response = await SupportCommonService.processReceive(body);
    } else if (item.action === 2) {
      response = await SupportCommonService.processDone(body);
    } else {
      response = await SupportCommonService.processRejected(body);
    }

    if (response.code === 0) {
      showToast(`${item.action === 1 ? "Tiếp nhận" : item.action === 2 ? "Hoàn thành" : "Từ chối"} thành công`, "success");
      onReload(true);

      if (item.action === 1) {
        setValueNote("");
      }

      if (item.action !== 1) {
        setHasSubmitSuccess(false);
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "success");
    }
    setIsSubmit(false);
  };

  return (
    <div className="history__support">
      <div className="history__support--header">
        <span className="title">Lịch sử hỗ trợ</span>
      </div>

      <div className="history__support--info">
        <div className="lst__log">
          {lstSupportLog && lstSupportLog.length > 0 && (
            <BoxTable
              name="Lịch sử hỗ trợ"
              titles={titles}
              items={lstSupportLog}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              striped={true}
            />
          )}

          {lstSupportLog && lstSupportLog.length === 0 && (
            <SystemNotification description={<span>Hiện tại chưa có lịch sử hỗ trợ nào.</span>} type="no-item" />
          )}
        </div>

        {hasTransferVotes && hasSubmitSuccess && (
          <div className="submit__form--support">
            <div className="form-group">
              <TextArea
                fillColor={true}
                label="Ghi hỗ trợ"
                value={valueNote}
                placeholder="Nhập ghi chú hỗ trợ"
                onChange={(e) => setValueNote(e.target.value)}
              />
            </div>

            <div className="lst__action">
              {dataSupportLog && !dataSupportLog.status ? (
                <Button
                  onClick={() => {
                    handleConfirmSupport({ action: 1 });
                  }}
                  disabled={isSubmit}
                >
                  Tiếp nhận {isSubmit && chooseAction && chooseAction == 1 && <Icon name="Loading" />}
                </Button>
              ) : (
                <Button
                  color="success"
                  onClick={() => {
                    handleConfirmSupport({ action: 2 });
                  }}
                  disabled={isSubmit}
                >
                  Hoàn thành {isSubmit && chooseAction && chooseAction == 2 && <Icon name="Loading" />}
                </Button>
              )}

              <Button
                color="destroy"
                onClick={() => {
                  handleConfirmSupport({ action: 3 });
                }}
                disabled={isSubmit}
              >
                Từ chối {isSubmit && chooseAction && chooseAction == 3 && <Icon name="Loading" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
