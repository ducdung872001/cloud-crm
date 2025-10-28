import React, { useEffect, useState } from "react";
import FSQuoteService from "services/FSQuoteService";
import QuoteService from "services/QuoteService";
import { handDownloadFileOrigin, showToast } from "utils/common";
import ApprovalService from "services/ApprovalService";
import InfoSignature from "./partials/InfoSignature";
import SignedRejectedHistory from "./partials/SignedRejectedHistory";
import ViewSignature from "./partials/ViewSignature";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

import "./index.scss";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Button from "components/button/button";
import { convertToId } from "reborn-util";
import ModalSendEmail from "pages/Contract/ModalHistorySignature/partials/ModalSendEmail";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";

interface IViewHistorySignatureProps {
  onShow: boolean;
  onHide: (reload?: boolean) => void;
  data: any;
  type: "fs" | "quote" | "contract";
  contractTemplate?: boolean;
  fsAttachment?: boolean;
  callback?: (data: string) => void;
  buttonDownload?: boolean;
}

export default function ViewHistorySignature(props: IViewHistorySignatureProps) {
  const { onShow, onHide, data, type, contractTemplate, callback, buttonDownload, fsAttachment } = props;
  console.log('fsAttachment', fsAttachment);
  

  const [lstFsForm, setLstFsForm] = useState([]);
  const [lstQuotaForm, setLstQuotaForm] = useState([]);
  const [lstFieldConfig, setLstFieldConfig] = useState(null);
  const [defaultFieldConfig, setDefaultFieldConfig] = useState(null);
  const [lstField, setLstField] = useState(null);
  const [infoApproved, setInfoApproved] = useState(null);
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [lstApprovalLog, setLstApprovalLog] = useState([]);
  const [fileContract, setFileContract] = useState([]);

  const docs = [
    {
      uri: "https://cdn.reborn.vn/2024/04/02/9dd1393f-d4de-4445-9744-6cf227c825a1-1712046032.xlsx",
      fileType: "xlsx",
    },
  ];

  useEffect(() => {
    if (data && (fsAttachment || contractTemplate) && data.template) {
      if (data.template.includes(".docx")) {
        setFileContract([
          {
            uri: data.template,
            fileType: "docx",
          },
        ]);
      }

      if (data.template.includes(".xlsx")) {
        setFileContract([
          {
            uri: data.template,
            fileType: "xlsx",
          },
        ]);
      }
    }
  }, [data, contractTemplate, fsAttachment]);

  const lstTab = [
    ...(type !== "contract"
      ? [
          {
            name: "Thông tin trình ký",
            tab: fsAttachment ? "tab_four" : "tab_one",
          },
        ]
      : []),

    ...(contractTemplate
      ? [
          {
            name: "Thông tin hợp đồng",
            tab: "tab_four",
          },
        ]
      : []),

    {
      name: "Lịch sử ký",
      tab: "tab_two",
    },
    {
      name: "Xem quy trình ký",
      tab: "tab_three",
    },
  ];

  const [dataTab, setDataTab] = useState(() => {
    return (contractTemplate || fsAttachment) ? "tab_four" : type === "contract" ? "tab_two" : "tab_one";
  });

  useEffect(() => {
    if (dataTab && callback) {
      callback(dataTab);
    }
  }, [dataTab]);

  useEffect(() => {
    if (onShow) {
      setDataTab(() => {
        return (contractTemplate || fsAttachment) ? "tab_four" : type === "contract" ? "tab_two" : "tab_one";
      });
    }
  }, [onShow, fsAttachment, contractTemplate]);

  const transformArray = (data) => {
    return data.map((item) => {
      let dataTbodyArray = JSON.parse(item.dataTbody) || [];

      dataTbodyArray = dataTbodyArray.map((subItem) => {
        return { ...subItem, id: item.id };
      });

      return dataTbodyArray;
    });
  };

  // đoạn này là lấy ra thông tin của FS
  const handLstFsForm = async (id: number) => {
    const params = {
      fsId: id,
    };

    const response = await FSQuoteService.fsFormLst(params);

    if (response.code === 0) {
      const result = transformArray(response.result);
      setLstFsForm(result);
    } else {
      showToast("Thông tin trình ký đang lỗi. Xin vui lòng thử lại sau", "error");
    }
  };

  // đoạn này là lấy ra thông tin của quota
  const handLstQuotaForm = async (id: number) => {
    const params = {
      quoteId: id,
    };

    const response = await QuoteService.quoteFormLst(params);

    if (response.code === 0) {
      const result = transformArray(response.result);
      setLstQuotaForm(result);
    } else {
      showToast("Cấu hình quote đang lỗi. Xin vui lòng thử lại sau", "error");
    }
  };

  const handleGetField = async (sheetId) => {
    const params = {
      sheetId: sheetId,
      limit: 20,
    };

    const response = await SheetFieldQuoteFormService.lst(params);

    if (response.code === 0) {
      const result = response.result.items;

      const changeResult = result.map((item) => {
        const newItem: any = {
          [item.code]: "",
          type: item.type,
          placeholder: item.name.toLowerCase(),
          formula: item.formula,
          id: null,
        };

        if (item.type === "select") {
          newItem.options = JSON.parse(item.options);
        }

        return newItem;
      });

      const resultTitle = result.map((item) => {
        return {
          name: item.name,
          type: item.type,
        };
      });

      setDefaultFieldConfig(changeResult);
      setLstFieldConfig({ lstTbody: [changeResult], lstThead: resultTitle });
    }
  };

  const mergeArrays = (originalArray, targetArray) => {
    return targetArray.map((targetItem) => {
      // Tạo một mảng mới để lưu trữ các trường sau khi lọc và merge
      const mergedItem = [];

      // Lấy danh sách các keys từ originalArray để so sánh
      const originalFields = originalArray[0].map((field) => Object.keys(field)[0]);

      // Duyệt qua mỗi phần tử của targetItem
      targetItem.forEach((targetField) => {
        // Tìm tên của trường từ danh sách originalFields
        const targetFieldName = originalFields.find((fieldName) => fieldName in targetField);
        if (targetFieldName) {
          // Nếu có, tìm trường tương ứng trong originalArray
          const originalField = originalArray[0].find((field) => Object.keys(field)[0] === targetFieldName);

          // Merge các trường từ originalField và targetField
          const mergedField = { ...originalField, ...targetField };
          mergedItem.push(mergedField);
        }
      });

      // Thêm các trường từ originalArray mà targetItem không có
      originalArray[0].forEach((originalField) => {
        const originalFieldName = Object.keys(originalField)[0];

        // Kiểm tra xem trường này đã tồn tại trong mergedItem chưa
        if (!mergedItem.some((field) => Object.keys(field)[0] === originalFieldName)) {
          // Nếu không, thêm trường này vào mảng mergedItem
          mergedItem.push(originalField);
        }
      });

      return mergedItem;
    });
  };

  useEffect(() => {
    if (lstFieldConfig) {
      const conditionData = type == "fs" ? lstFsForm : lstQuotaForm;

      const mergeConditionData = mergeArrays(
        lstFieldConfig.lstTbody,
        conditionData && conditionData.length > 0 ? conditionData : [defaultFieldConfig]
      );

      setLstField({ lstTbody: mergeConditionData, lstThead: lstFieldConfig.lstThead });
    }
  }, [lstFieldConfig, defaultFieldConfig, lstFsForm, lstQuotaForm, type]);

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

  useEffect(() => {
    if (onShow && data) {
      handleGetObjectApproved(data.id);
      handCheckApproved(data.id);
      handLstApprovalLog(data.id);
    }

    if (onShow && data && type === "fs") {
      handLstFsForm(data.id);
    }

    if (onShow && data && type === "quote") {
      handLstQuotaForm(data.id);
    }

    if (onShow && data && data.sheetId) {
      handleGetField(data.sheetId);
    }
  }, [onShow, data]);

  const [showModalSendEmail, setShowModalSendEmail] = useState(false);

  return (
    <div>
      <div className="page__view--history-signature">
        <div className="content__left">
          {lstTab.map((item, idx) => {
            return (
              type === 'fs' && !data.status ?
                (
                  item.name === "Thông tin trình ký" ?
                  <div key={idx} className={`item--tab ${item.tab === dataTab ? "active__item--tab" : ""}`} onClick={() => setDataTab(item.tab)}>
                    {item.name}
                  </div>
                  : null
                )
              :
                <div key={idx} className={`item--tab ${item.tab === dataTab ? "active__item--tab" : ""}`} onClick={() => setDataTab(item.tab)}>
                  {item.name}
                </div>
            );
          })}
        </div>
        <div className="content__right">
          {dataTab === "tab_one" && type !== "contract" ? (
            <InfoSignature name={data?.name} type={type} lstData={lstField} />
          ) : dataTab === "tab_two" ? (
            <SignedRejectedHistory
              data={data}
              type={type}
              isSigned={isSigned}
              infoApproved={infoApproved}
              lstApprovalLog={lstApprovalLog}
              onReload={(reload) => {
                if (reload) {
                  handCheckApproved(data.id);
                  handLstApprovalLog(data.id);
                }
              }}
            />
          ) : dataTab === "tab_four" ? (
            <div>
              {fileContract.length === 0 ? (
                <SystemNotification
                  description={
                    <span>
                      Không có mẫu hợp đồng nào. <br />
                      {/* Bạn hãy thêm mẫu hợp đồng ! */}
                    </span>
                  }
                  type="no-item"
                />
              ) : (
                <DocViewer
                  pluginRenderers={DocViewerRenderers}
                  documents={fileContract}
                  config={{
                    header: {
                      disableHeader: true,
                      disableFileName: false,
                      retainURLParams: false,
                    },
                  }}
                  style={{ height: "46rem" }}
                />
              )}
            </div>
          ) : (
            <ViewSignature infoApproved={infoApproved} type={type} data={data} />
          )}
        </div>
      </div>

      {buttonDownload && data?.template ? (
        <div style={{ justifyContent: "flex-end", display: "flex", marginBottom: "1.6rem", paddingRight: "1.6rem" }}>
          <div style={{ display: "flex", gap: "0 1.2rem" }}>
            <Button
              color="primary"
              onClick={() => {
                let fieldName = convertToId(data.name) || "";
                fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

                const type = data?.template?.includes(".docx")
                  ? "docx"
                  : data?.template?.includes(".xlsx")
                  ? "xlsx"
                  : data?.template?.includes(".pdf")
                  ? "pdf"
                  : data?.template?.includes(".pptx")
                  ? "pptx"
                  : data?.template?.includes(".zip")
                  ? "zip"
                  : "rar";
                const name = `${fieldName}.${type}`;

                handDownloadFileOrigin(data?.template, name);
              }}
            >
              Tải xuống
            </Button>

            {fsAttachment ? null :
              <Button
                color="primary"
                onClick={() => {
                  setShowModalSendEmail(true);
                }}
              >
                Gửi Email
              </Button>
            }
          </div>
        </div>
      ) : null}

      <ModalSendEmail
        onShow={showModalSendEmail}
        dataContract={data}
        customerIdlist={data?.customerId ? [data?.customerId] : []}
        onHide={(reload) => {
          setShowModalSendEmail(false);
        }}
      />
    </div>
  );
}
