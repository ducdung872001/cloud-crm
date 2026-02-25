import React, { useEffect, useState } from "react";
import { handDownloadFileOrigin, showToast } from "utils/common";
import ApprovalService from "services/ApprovalService";

import "./index.scss";
import InfoProcess from "./InfoProcess";
import DetailHistoryProcess from "./HistoryProcess";
import ViewProcess from "./ViewProcess";

export default function HistoryProcess(props: any) {
  const { onShow, onHide, dataObject, type, callback } = props;

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
      name: "Luồng xử lý",
      tab: "tab_two",
    },
    {
      name: "Quy trình xử lý",
      tab: "tab_three",
    },
  ];

  const [dataTab, setDataTab] = useState("tab_one");

  useEffect(() => {
    if (dataTab && callback) {
      callback(dataTab);
    }
  }, [dataTab]);

  useEffect(() => {
    if (!onShow) {
      setDataTab("tab_one");
    }
  }, [onShow]);

  const transformArray = (data) => {
    return data.map((item) => {
      let dataTbodyArray = JSON.parse(item.dataTbody) || [];

      dataTbodyArray = dataTbodyArray.map((subItem) => {
        return { ...subItem, id: item.id };
      });

      return dataTbodyArray;
    });
  };

  // dùng để lấy ra approvalId
  const handleGetObjectApproved = async (id: number) => {
    const params = {
      objectId: id,
      objectType: type === "fs" ? 1 : type === "quote" ? 2 : 3,
    };

    const response = await ApprovalService.takeObject(params);

    if (response.code === 0) {
      const result = response.result;
      setInfoApproved(result);
    } else {
      showToast("Xem trình ký đang lỗi. Vui lòng thử lại sau", "error");
    }
  };

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

  // useEffect(() => {
  //   if (onShow && dataObject) {
  //     handleGetObjectApproved(dataObject.id);
  //     handCheckApproved(dataObject.id);
  //     handLstApprovalLog(dataObject.id);
  //   }

  // }, [onShow, dataObject]);

  const [showModalSendEmail, setShowModalSendEmail] = useState(false);

  return (
    <div>
      <div className="page__view--history-signature">
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
            // : null
            <ViewProcess processId={dataObject?.processId} />
          )}
        </div>
      </div>
    </div>
  );
}
