import React, { useEffect, useState } from "react";
import { handDownloadFileOrigin, showToast } from "utils/common";
import ApprovalService from "services/ApprovalService";
import "./index.scss";
import InfoProcess from "./InfoProcess";
import DetailHistoryProcess from "./HistoryProcess";
import ViewProcess from "./ViewProcess";

export default function HistoryProcess(props: any) {
  const { onShow, onHide, dataObject, type } = props;

  const [lstField, setLstField] = useState(null);
  const [infoApproved, setInfoApproved] = useState(null);
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [lstApprovalLog, setLstApprovalLog] = useState([]);

  const docs = [
    {
      uri: "https://cdn.reborn.vn/2024/04/02/9dd1393f-d4de-4445-9744-6cf227c825a1-1712046032.xlsx",
      fileType: "xlsx",
    },
  ];

  const lstTab = [
    {
      name: "Thông tin đối tượng",
      tab: "tab_one",
    },
    {
      name: "Lịch sử xử lý",
      tab: "tab_two",
    },
    {
      name: "Quy trình xử lý",
      tab: "tab_three",
    },
  ];

  const [dataTab, setDataTab] = useState("tab_one");

  useEffect(() => {
    if (!onShow) {
      setDataTab("tab_one");
    }
  }, [onShow, dataObject]);

  const handCheckApproved = async (id: number) => {
    const params = {
      objectId: id,
      objectType: type === "fs" ? 1 : type === "quote" ? 2 : 3,
    };

    const response = await ApprovalService.checkApproved(params);

    if (response.code === 0) {
      const result = response.result;
      result ? setIsSigned(true) : setIsSigned(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handLstApprovalLog = async (id: number) => {
    const params = {
      objectId: id,
      objectType: type === "fs" ? 1 : type === "quote" ? 2 : 3,
    };

    const response = await ApprovalService.lstLog(params);

    if (response.code === 0) {
      const result = response.result;
      setLstApprovalLog(result);
    } else {
      showToast("Lịch sử ký đang lỗi. Xin vui lòng thử lại sau", "error");
    }
  };

  return (
    <div>
      <div className="page__view--history-process">
        <div className="content__left">
          {lstTab.map((item, idx) => {
            return (
              <div key={idx} className={`item--tab ${item.tab === dataTab ? "active__item--tab" : ""}`} onClick={() => setDataTab(item.tab)}>
                {item.name}
              </div>
            );
          })}
        </div>
        <div className="content__right">
          {dataTab === "tab_one" ? (
            <InfoProcess
              // name={dataObject?.name}
              // type={type} lstData={lstField}
              data={dataObject}
            />
          ) : dataTab === "tab_two" ? (
            <DetailHistoryProcess
              dataObject={dataObject}
              onReload={(reload) => {
                if (reload) {
                  handCheckApproved(dataObject.id);
                  handLstApprovalLog(dataObject.id);
                }
              }}
            />
          ) : (
            <ViewProcess dataObject={dataObject} />
          )}
        </div>
      </div>
    </div>
  );
}
