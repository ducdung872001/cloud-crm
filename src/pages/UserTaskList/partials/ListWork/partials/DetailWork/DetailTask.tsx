import React, { Fragment, memo, useCallback, useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import CustomScrollbar from "components/customScrollbar";
import { IDetailWorkProps } from "model/workOrder/PropsModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import { handDownloadFileOrigin, showToast } from "utils/common";
import AddWorkRatingModal from "../AddWorkRatingModal/AddWorkRatingModal";
import AddWorkInprogressModal from "../AddWorkInprogressModal/AddWorkInprogressModal";
import UpdatePeopleInvolved from "./partials/UpdatePeopleInvolved/UpdatePeopleInvolved";
import EmployeeService from "services/EmployeeService";
import "./DetailTask.scss";
import { getPageOffset, trimContent } from "reborn-util";
import OtherGenders from "assets/images/third-gender.png";
import BusinessProcessService from "services/BusinessProcessService";
import ChangeEmployee from "./partials/ChangeEmployee/ChangeEmployee";
import Tippy from "@tippyjs/react";
import ListHistoryHandle from "./partials/ListHistoryHandle/ListHistoryHandle";
import { ExportExcel } from "exports";
import ModalHandleTask from "../ModalHandleTask/ModalHandleTask";
import ModalViewDocument from "./partials/ModalViewDocument/ModalViewDocument";
import ContentExchangeWork from "./partials/ContentExchangeWork/ContentExchangeWork";
import OnHoldModal from "../HandleTask/OnHoldModal/OnHoldModal";
import OnRejectModal from "../HandleTask/OnRejectModal/OnRejectModal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import OnSuccessExpireModal from "../HandleTask/OnSuccessExprieModal/OnSuccessExpireModal";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ReplyRequestModal from "../ReplyRequestModal/ReplyRequestModal";
import PurchaseRequestService from "services/PurchaseRequestService";
import ManagementAskedService from "services/ManagementAskedService";
import ModalEvaluateBidding from "./partials/ModalEvaluateBidding/ModalEvaluateBidding";
import UserTaskService from "services/UserTaskService";

const DetailTask = (props: any) => {
  const { idData, setIsHandleTask, isDetailWork, isHandleTask } = props;
  const tokenUrl = new URLSearchParams(location.search).get("token");

  const [dataEmployee, setDataEmployee] = useState(null);
  const [data, setData] = useState<any>(null);

  const [listStepProcess, setListStepProcess] = useState([]);
  const [logWorkObject, setLogWorkObject] = useState(null);
  const [listWorkPause, setListWorkPause] = useState([]);
  const [isModalHandleTask, setIsModalHandleTask] = useState(false);

  const [isModalReplyRequest, setIsModalReplyRequest] = useState(false);
  const [isModalViewDocument, setIsModalViewDocument] = useState(false);
  const [isModalEvaluateBidding, setIsModalEvaluateBidding] = useState(false);
  const [dataDoc, setDataDoc] = useState(null);
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [showOnRejectModal, setShowOnRejectModal] = useState(false);
  const [showOnSuccessExpiretModal, setShowOnSuccessExpireModal] = useState(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  // lấy thông tin nhân viên
  const takeDataEmployee = async () => {
    const response = await EmployeeService.info();

    if (response.code === 0) {
      const result = response.result;
      setDataEmployee(result);
    }
  };

  const handGetDetailWork = async (id: number, openEform?: boolean) => {
    if (!id) return;

    const response = await UserTaskService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      if (result.scope !== "external") {
        if (result?.processId) {
          getStepProcess(result.processId);
        } else {
          setListStepProcess([]);
        }

        if (result?.potId) {
          getLogWorkObject(result.potId);
        }

        if (result?.nodeId) {
          getDetailServiceLevel(result?.nodeId);
        }

        if (openEform) {
          setTimeout(() => {
            setIsModalHandleTask(isHandleTask || false);
          }, 1000);
        }
        setData(result);
        // getProcumentType(result?.potId, result);
      }

      if (result.scope === "external") {
        if (result.ola) {
          const ola = JSON.parse(result.ola) || null;
          setValueOLAProcess(ola.processTime || null);
          setValueOLAResponse(ola.responseTime || null);
        } else {
          setValueOLAProcess(null);
          setValueOLAResponse(null);
        }
        const attachments = (result.docLink && JSON.parse(result.docLink)) || [];
        setData({
          ...result,
          attachments: attachments,
        });
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  const getStepProcess = async (processId: number) => {
    const body: any = {
      processId: processId,
      limit: 100,
    };

    const response = await BusinessProcessService.listStep(body);

    if (response.code === 0) {
      const result = response.result.items;
      setListStepProcess(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  const getLogWorkObject = async (objectId) => {
    const body = {
      potId: objectId,
    };

    // const response = await BusinessProcessService.processedObjectLog(body);

    // if (response.code === 0) {
    //   const result = response.result;
    //   setLogWorkObject(result[0]);
    // } else {
    //   showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    // }
  };

  const getListWorkPause = async (potId, processId, workId, data) => {
    const params = {
      ...(potId ? { potId: potId } : {}),
      ...(processId ? { processId: processId } : {}),
      ...(data?.scope === "external" ? { workOrderId: workId } : {}),
    };

    const response = await UserTaskService.listPause(params);

    if (response.code === 0) {
      const result = response.result;
      setListWorkPause(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [valueOLAResponse, setValueOLAResponse] = useState(null);
  const [valueOLAProcess, setValueOLAProcess] = useState(null);

  const getDetailServiceLevel = async (nodeId) => {
    const params = {
      nodeId: nodeId,
    };

    const response = await BusinessProcessService.listServiceLevel(params);
    if (response.code === 0) {
      const result = response.result;
      if (result.items && result.items.length > 0) {
        const dataProcess = result.items.find((el) => el.timeType === "process");
        const dataResponse = result.items.find((el) => el.timeType === "response");
        if (dataProcess) {
          setValueOLAProcess(dataProcess);
        }
        if (dataResponse) {
          setValueOLAResponse(dataResponse);
        }
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getProcumentType = async (potId: number, dataWork) => {
    const body: any = {
      potId: potId,
    };

    const response = await PurchaseRequestService.detail(body);

    if (response.code === 0) {
      const result = response.result;
      if (result?.procurementTypeId) {
        setData({
          ...dataWork,
          procurementTypeId: result?.procurementTypeId,
        });
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  useEffect(() => {
    if (idData) {
      takeDataEmployee();
      handGetDetailWork(idData, true);
    } else {
      setData(null);
      setListWorkPause([]);
      setListStepProcess([]);
    }
    setTabHistoryWork(1);
  }, [idData, isDetailWork, isHandleTask]);

  useEffect(() => {
    // if (data && JSON.parse(data.reviews || "[]").length > 0) {
    //   const result = JSON.parse(data.reviews || "[]");
    //   setRating(result[0]["mark"]);
    //   setHover(result[0]["mark"]);
    // } else {
    //   setRating(0);
    //   setHover(0);
    // }

    // if(data && data?.scope !== 'external' ){
    //   getListWorkPause(data?.potId, data?.processId);
    // }

    if (data) {
      // getListWorkPause(data?.potId, data?.processId, data?.id, data);
    }
  }, [data]);

  const [isInvolveWorks, setIsInvolveWorks] = useState<boolean>(true);
  const [isInvolveCustomer, setIsInvolveCustomer] = useState<boolean>(true);
  const [showModalEvaluateWork, setShowModalEvaluateWork] = useState<boolean>(false);
  const [showModalWorkInprogress, setShowModalWorkInprogress] = useState<boolean>(false);

  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [disabledRating, setDisabledRating] = useState<boolean>(false);
  const [modalChangeEmployee, setModalChangeEmployee] = useState(false);

  // const listInfoBasicItem = [
  //   {
  //     className: `${data?.content?.length > 0 ? "content-work" : ""}`,
  //     title: "Nội dung công việc",
  //     name: data?.content ? data?.content : ".....................",
  //   },
  //   {
  //     className: "in-project",
  //     title: data?.opportunityId ? "Cơ hội" : "Dự án",
  //     name: data?.projectName,
  //   },
  //   {
  //     className: "type-work",
  //     title: "Loại công việc",
  //     name: data?.workTypeName ? data?.workTypeName : ".....................",
  //   },
  //   {
  //     className: "time-start",
  //     title: "Thời gian bắt đầu",
  //     name: moment(data?.startTime).format("DD/MM/YYYY HH:mm"),
  //   },
  //   {
  //     className: "time-end",
  //     title: "Thời gian kết thúc",
  //     name: moment(data?.endTime).format("DD/MM/YYYY HH:mm"),
  //   },
  //   {
  //     className: "amount-work",
  //     title: "Khối lượng công việc",
  //     name: `${data?.workLoad?.toString()} ${data?.workLoadUnit == "D" ? "ngày" : data?.workLoadUnit == "H" ? "giờ" : "phút"}`,
  //   },
  //   {
  //     className: JSON.parse(data?.docLink || "[]").length > 0 ? "related-document" : "",
  //     title: "Tài liệu liên quan",
  //     name: JSON.parse(data?.docLink || "[]").length > 0 ? data?.docLink : ".....................",
  //   },
  // ];

  //! đoạn này xử lý vấn đề hiển thị thông tin xem bao giờ thực hiện
  // const handleUnfulfilled = (time) => {
  //   const currentTime = new Date().getTime();
  //   const startTime = new Date(time).getTime();

  //   if (currentTime < startTime) {
  //     if ((startTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
  //       return <span className="__unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
  //     } else if ((startTime - currentTime) / (60 * 60 * 1000) >= 1) {
  //       return <span className="__unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
  //     } else {
  //       return <span className="__unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 1000))} phút`}</span>;
  //     }
  //   } else {
  //     if ((currentTime - startTime) / (24 * 60 * 60 * 1000) >= 1) {
  //       //thời gian hiện tại - nếu thời gian kết thúc >= 1 ngày thì trả về ngày, không thì trả về giờ
  //       return <span className="__cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
  //     } else if ((currentTime - startTime) / (60 * 60 * 1000) >= 1) {
  //       //thời gian hiện tại - nếu thời gian kết thúc >= 1 giờ thì trả về giờ, không thì trả về phút
  //       return <span className="__cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 60 * 1000))} giờ`}</span>;
  //     } else {
  //       return <span className="__cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 1000))} phút`}</span>;
  //     }
  //   }
  // };

  const handleUnfulfilled = (time) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(time).getTime();

    if (currentTime < startTime) {
      // if ((startTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
      //   return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      // } else if ((startTime - currentTime) / (60 * 60 * 1000) >= 1) {
      //   return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
      // } else {
      //   return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 1000))} phút`}</span>;
      // }
      // return <span className="status-unfulfilled">{`Mới tiếp nhận`}</span>;
    } else {
      if ((currentTime - startTime) / (24 * 60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 ngày thì trả về ngày, không thì trả về giờ
        return <span>{`${Math.round((currentTime - startTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else {
        return <span>{`1 ngày`}</span>;
      }

      // else if ((currentTime - startTime) / (60 * 60 * 1000) >= 1) {
      //   //thời gian hiện tại - nếu thời gian kết thúc >= 1 giờ thì trả về giờ, không thì trả về phút
      //   return <span>{`${Math.round((currentTime - startTime) / (60 * 60 * 1000))} giờ`}</span>;
      // } else {
      //   return <span>{`${Math.round((currentTime - startTime) / (60 * 1000))} phút`}</span>;
      // }
    }
  };
  //! đoạn này xử lý trong quá trình thực hiện
  const handleProcessing = (start, end) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const calculatorTime = (endTime - startTime) / 3;

    if (startTime > currentTime) {
      return <span className="__processing">Đang thực hiện</span>;
    } else if (currentTime >= startTime && currentTime <= endTime) {
      if (endTime - currentTime >= calculatorTime) {
        return <span className="__processing">Đang thực hiện</span>;
      } else {
        if ((endTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
          return <span className="__processing--waring">{`Còn ${Math.round((endTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
        } else if ((endTime - currentTime) / (60 * 60 * 1000) >= 1) {
          return <span className="__processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
        } else {
          return <span className="__processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 1000))} phút`}</span>;
        }
      }
    } else {
      if ((currentTime - endTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="__cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - endTime) / (60 * 60 * 1000) >= 1) {
        return <span className="__cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return (
          <span className="__cancelled">{`Quá hạn ${
            Math.round((currentTime - endTime) / (60 * 1000)) === 0 ? 1 : Math.round((currentTime - endTime) / (60 * 1000))
          } phút`}</span>
        );
      }
    }
  };

  const [tabHistoryWork, setTabHistoryWork] = useState(1);

  const titlesExcelOLA = [
    "STT",
    "Tên nhân viên",
    "Bộ phận",
    "ID công việc",
    "Công việc",
    "Dự án",
    "Gói thầu",
    "Quy trình",
    "OLA phản hồi cài đặt theo quy trình",
    "OLA xử lý cài đặt theo quy trình",
    "Thời điểm xuất hiện công việc",
    "Thời điểm click chuột lần đầu tiên",
    "Thời điểm phản hồi xác nhận/ từ chối công việc",
    "Thời điểm hoàn thành công việc (lần đầu)",
    "Thời điểm hoàn thành công việc lần cuối (trường hợp hồ sơ quay vòng)",
    "Số lần hồ sơ quay vòng (lặp lại)",
    "Thời gian phản hồi thực tế",
    "Thời gian xử lý hoàn thành công việc thực tế",
    "Trạng thái vi phạm OLA phản hồi",
    "Trạng thái vi phạm OLA xử lý",
    "Nguyên nhân vi phạm OLA",
  ];

  const formatExportOLA = [
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
  ];

  const dataMappingArray = (item: any, index: number, type?: string) =>
    type === "ola"
      ? [
          index + 1,
          item.employeeName,
          item.departmentName,
          item.potId,
          item.nodeName || item.name,
          item.projectName,
          item.bidPackpage,
          item.processName || item.nodeName,
          `${item.planResponseDay || 0} ngày, ${item.planResponseHour < 10 ? `0${item.planResponseHour || 0}` : item.planResponseHour}:${
            item.planResponseMinute < 10 ? `0${item.planResponseMinute || 0}` : item.planResponseMinute
          }`,
          `${item.planExecutionDay || 0} ngày, ${item.planExecutionHour < 10 ? `0${item.planExecutionHour || 0}` : item.planExecutionHour}:${
            item.planExecutionMinute < 10 ? `0${item.planExecutionMinute || 0}` : item.planExecutionMinute
          }`,
          item.transitTime ? moment(item.transitTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.firstSeenTime ? moment(item.firstSeenTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.receivedTime ? moment(item.receivedTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.processedTime ? moment(item.processedTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.lastProcessedTime ? moment(item.lastProcessedTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.repeatNumber,
          `${item.actualResponseDay || 0} ngày, ${item.actualResponseHour < 10 ? `0${item.actualResponseHour || 0}` : item.actualResponseHour}:${
            item.actualResponseMinute < 10 ? `0${item.actualResponseMinute}` : item.actualResponseMinute
          }`,
          `${item.actualExecutionDay || 0} ngày, ${item.actualExecutionHour < 10 ? `0${item.actualExecutionHour || 0}` : item.actualExecutionHour}:${
            item.actualExecutionMinute < 10 ? `0${item.actualExecutionMinute}` : item.actualExecutionMinute
          }`,
          item.responseTimeViolation === 1 ? "Vi phạm" : "",
          item.executionTimeViolation === 1 ? "Vi phạm" : "",
          item.reason || item.reasonLateCategory,
        ]
      : [
          index + 1,
          item.nodeName,
          item.bidPackpage,
          item.projectName,
          // item.lstSLADepartmentResponse
        ];
  const exportCallback = useCallback(async (data, extension, type) => {
    let response;
    if (type === "ola") {
      response = await UserTaskService.exportOLA({
        page: 1,
        limit: 10000,
        processId: data.processId,
        employeeId: data.employeeId,
      });
    } else if (type === "sla") {
      response = await UserTaskService.exportSLA({
        page: 1,
        limit: 10000,
        processId: data.processId,
        // employeeId: data.employeeId
      });
    }

    if (response.code === 0) {
      const result = response.result;

      if (type === "sla") {
        const headerFormatSLA: any = [
          {
            merge: {
              row: 2,
            },
          },
          {
            merge: {
              row: 2,
            },
          },
          {
            merge: {
              row: 2,
            },
          },
          {
            merge: {
              row: 2,
            },
          },
        ];
        const formatExportSLA = ["center", "center", "center", "center"];
        const titleSLA = ["STT", "Mã gói thầu", "Gói thầu", "Dự án"];
        const titleChildSLA = ["", "", "", ""];
        const newtitleSale = result.value && result.value.length > 0 ? result.value.filter((el) => el.parentId) : [];

        newtitleSale.map((item) => {
          titleSLA.push(item.name || item.id.toString(), "", "", "", "", "");
          titleChildSLA.push(
            "SLA phản hồi tiêu chuẩn",
            "SLA phản hồi thực tế",
            "Trạng thái vi phạm SLA phản hồi",
            "SLA xử lý tiêu chuẩn",
            "SLA xử lý thực tế",
            "Trạng thái vi phạm SLA thực tế"
          );
          headerFormatSLA.push(
            {
              merge: {
                col: 6,
              },
            },
            {},
            {},
            {},
            {},
            {}
          );
          formatExportSLA.push("center", "center", "center", "center", "center", "center");
        });

        const headerTotalSLA = [headerFormatSLA];
        const titleTotalSLA = [titleSLA, titleChildSLA];

        if (extension === "excel") {
          ExportExcel({
            fileName: "Export SLA",
            title: "Export SLA",
            header: titleTotalSLA,
            formatExcel: formatExportSLA,
            // data: result.key.map((item, idx) => dataMappingArray(item, idx, type)),
            data: result.key.map((item, idx) => {
              const newList = [idx + 1, item.potId || item.nodeName, item.bidPackpage, item.projectName];
              const lstSLADepartmentResponse = item.lstSLADepartmentResponse.reverse() || [];
              lstSLADepartmentResponse.map((el) => {
                newList.push(
                  `${el.planResponseDay || 0} ngày, ${el.planResponseHour || 0} giờ, ${el.planResponseMinute || 0} phút`,
                  `${el.actualResponseDay || 0} ngày, ${el.actualResponseHour || 0} giờ, ${el.actualResponseMinute || 0} phút`,
                  el.responseTimeViolation === 1 ? "Vi phạm" : "",
                  `${el.planExecutionDay || 0} ngày, ${el.planExecutionHour || 0} giờ, ${el.planExecutionMinute || 0} phút`,
                  `${el.actualExecutionDay || 0} ngày, ${el.actualExecutionHour || 0} giờ, ${el.actualExecutionMinute || 0} phút`,
                  item.executionTimeViolation === 1 ? "Vi phạm" : ""
                );
              });

              return newList;
              // (
              //   [
              //     idx + 1,
              //     item.nodeName,
              //     item.bidPackpage,
              //     item.projectName,
              //     // item.lstSLADepartmentResponse
              //   ]
              // )
            }),
            info: { name },
            headerFormat: headerTotalSLA,
          });
        }
      }

      if (type === "ola") {
        if (extension === "excel") {
          ExportExcel({
            fileName: "Export OLA",
            title: "Export OLA",
            header: titlesExcelOLA,
            formatExcel: formatExportOLA,
            data: result.map((item, idx) => dataMappingArray(item, idx, type)),
            info: { name },
          });
        }
      }

      showToast("Xuất file thành công", "success");
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  }, []);

  const dataMappingArrayExternal = (item: any, index: number, type?: string) =>
    type === "ola"
      ? [
          index + 1,
          item.employeeName,
          item.departmentName,
          item.potId || item.id,
          item.nodeName || item.name,
          item.projectName,
          item.bidPackpage,
          item.processName,
          item.ola
            ? `${JSON.parse(item.ola)?.responseTime?.day || 0} ngày, ${
                JSON.parse(item.ola)?.responseTime?.hour < 10
                  ? `0${JSON.parse(item.ola)?.responseTime?.hour || 0}`
                  : JSON.parse(item.ola)?.responseTime?.hour
              }:${
                JSON.parse(item.ola)?.responseTime?.minute < 10
                  ? `0${JSON.parse(item.ola)?.responseTime?.minute || 0}`
                  : JSON.parse(item.ola)?.responseTime?.minute
              }`
            : "",
          item.ola
            ? `${JSON.parse(item.ola)?.processTime?.day || 0} ngày, ${
                JSON.parse(item.ola)?.processTime?.hour < 10
                  ? `0${JSON.parse(item.ola)?.processTime?.hour || 0}`
                  : JSON.parse(item.ola)?.processTime?.hour
              }:${
                JSON.parse(item.ola)?.processTime?.minute < 10
                  ? `0${JSON.parse(item.ola)?.processTime?.minute || 0}`
                  : JSON.parse(item.ola)?.processTime?.minute
              }`
            : "",
          item.transitTime ? moment(item.transitTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.firstSeenTime ? moment(item.firstSeenTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.receivedTime ? moment(item.receivedTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.processedTime ? moment(item.processedTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.lastProcessedTime ? moment(item.lastProcessedTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.repeatNumber,
          `${item.actualResponseDay || 0} ngày, ${item.actualResponseHour < 10 ? `0${item.actualResponseHour || 0}` : item.actualResponseHour}:${
            item.actualResponseMinute < 10 ? `0${item.actualResponseMinute}` : item.actualResponseMinute
          }`,
          `${item.actualExecutionDay || 0} ngày, ${item.actualExecutionHour < 10 ? `0${item.actualExecutionHour || 0}` : item.actualExecutionHour}:${
            item.actualExecutionMinute < 10 ? `0${item.actualExecutionMinute}` : item.actualExecutionMinute
          }`,
          item.responseTimeViolation === 1 ? "Vi phạm" : "",
          item.executionTimeViolation === 1 ? "Vi phạm" : "",
          item.reasonLateCategory,
        ]
      : [
          index + 1,
          item.nodeName,
          item.bidPackpage,
          item.projectName,
          // item.lstSLADepartmentResponse
        ];

  const exportExternal = useCallback(async (data, extension, type) => {
    const newArray = [data];
    if (extension === "excel") {
      ExportExcel({
        fileName: "Export OLA",
        title: "Export OLA",
        header: titlesExcelOLA,
        formatExcel: formatExportOLA,
        data: newArray.map((item, idx) => dataMappingArrayExternal(item, idx, type)),
        info: { name },
      });
    }

    showToast("Xuất file thành công", "success");
  }, []);

  //Update trạng thái của yêu cầu làm rõ
  const handleUpdateStatusResponse = async (detailId) => {
    const body = {
      id: detailId,
      status: 2,
    };

    const response = await ManagementAskedService.updateStatusClarification(body);
    if (response.code === 0) {
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleUpdateStatusWork = async (status, noToast?) => {
    const body = {
      id: data?.id,
      status: status,
    };

    const response = await UserTaskService.updateStatus(body);
    if (response.code === 0) {
      if (status === 2) {
        if (!noToast) {
          showToast(`Công việc đã hoàn thành`, "success");
        }
        if (data?.taskType === "portal") {
          handleUpdateStatusResponse(data?.clarificationDetailId);
        }
      }
      if (status === 1) {
        if (!noToast) {
          showToast(`Tiếp nhận công việc thành công`, "success");
        } else {
          showToast(`Công việc thực hiện lại`, "success");
        }
      }

      if (status === 3) {
        showToast(`Huỷ công việc thành công`, "success");
        setShowDialog(false);
        setContentDialog(null);
      }

      handGetDetailWork(data?.id);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmDelete = () => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Huỷ công việc</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn huỷ công việc? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Đóng",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleUpdateStatusWork(3);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [downloadAll, setDownloadAll] = useState(false);
  // Hàm để tải và nén các file
  const downloadAndZipFiles = async (listFile) => {
    const zip = new JSZip();
    const folder = zip.folder("files");

    // const listFile = [
    //   'https://bpmapi.reborn.vn/adminapi/file/41e94e5d-f35a-4e9b-8aad-4c7c240a664a-1745636960.docx',
    //   'https://bpmapi.reborn.vn/adminapi/file/537f2d8e-f012-4619-ade3-24059e2bf7fe-1745636956.docx'
    // ]

    // Tải từng file và thêm vào file nén
    for (const url of listFile) {
      // const response = await fetch(url.fileUrl);
      const response = await fetch(url.fileUrl, {
        method: "GET",
      });
      const blob = await response.blob();
      const fileName = url.fileName;
      folder.file(fileName, blob);
    }

    // Tạo file nén và tải xuống
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "files.zip");
    });
    setDownloadAll(false);
  };

  // Gọi hàm khi người dùng nhấn vào nút tải xuống tất cả
  const handleDownloadAll = (attachments) => {
    setDownloadAll(true);
    downloadAndZipFiles(attachments);
  };

  return (
    <div className="detail__work--item">
      <div className=" d-flex flex-column">
        {data ? (
          <Fragment>
            {listStepProcess && listStepProcess?.length > 0 ? (
              <div className="container_roadmap">
                {listStepProcess && listStepProcess?.length > 0 ? (
                  <div
                    className="roadmap_work"
                    style={listStepProcess.length > 5 ? { width: `${listStepProcess.length * 30}rem`, paddingBottom: "3rem" } : {}}
                    // style={ { width: `${listStepProcess?.length * 30}rem`} }
                  >
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 400 }}>Bắt đầu</span>
                    </div>

                    {listStepProcess.map((item, index) => (
                      <div key={index} className="item_roadmap">
                        <div className="line_border" style={item.stepNumber < data?.workflowStep ? { backgroundColor: "#B7B8B9" } : {}}>
                          {data?.workflowId === item.id ? (
                            <div style={{ width: "100%", height: "0.5rem", backgroundColor: "blue", borderRadius: 10 }}></div>
                          ) : null}
                        </div>
                        <div className="roadmap_name">
                          <div>
                            <Icon
                              name={data?.workflowId === item.id ? "ExpireWork" : item.stepNumber < data?.workflowStep ? "CompleteWork" : "EmptyWork"}
                            />
                          </div>
                          <span className="name" style={item.stepNumber > data?.workflowStep ? { color: "#CECECE" } : {}}>
                            {item.stepName}
                          </span>
                        </div>
                      </div>
                    ))}
                    {/* <div className="item_roadmap">
                        <div className="line_border" style={{backgroundColor:'#B7B8B9'}}/>
                        <div className="roadmap_name">
                          <div>
                            <Icon name='CompleteWork'/>
                          </div>
                          <span className="name">Thực hiện mua sắm</span>
                        </div>
                      </div> */}
                    {/* <div className="item_roadmap">
                        <div className="line_border">
                          <div style={{width: '50%', height: '0.5rem', backgroundColor: '#C94B1C', borderRadius: 10}}></div>
                        </div>
                        <div className="roadmap_name">
                          <div>
                            <Icon name='ExpireWork'/>
                          </div>
                          <span className="name">Quản lý hợp đồng</span>
                        </div>
                      </div> */}
                    {/* <div className="item_roadmap">
                        <div className="line_border"/>
                        <div className="roadmap_name">
                          <div>
                            <Icon name='EmptyWork'/>
                          </div>
                          <span className="name">{trimContent(`Quản lý thành toán, quyết toán`, 50, true, true)}{" "}</span>
                        </div>
                      </div> */}

                    {/* <div className="item_roadmap">
                        <div className="line_border"/>
                        <div className="roadmap_name">
                          <div>
                            <Icon name='EmptyWork'/>
                          </div>
                          <span className="name">{trimContent(`Quản lý cơ sở dữ liệu hàng hóa dịch vụ & ngân hàng giá`, 50, true, true)}{" "}</span>
                        </div>
                      </div> */}

                    <div>
                      <span style={{ fontSize: 14, fontWeight: 400 }}>Kết thúc</span>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="body__info--work">
              <div style={{ width: "50%" }}>
                {data?.scope === "external" ? (
                  <div className="container-button">
                    {data?.status === 0 ? (
                      <div>
                        <span style={{ fontSize: 12, fontWeight: "500" }}>Tiếp nhận yêu cầu</span>
                      </div>
                    ) : data?.status === 1 ? (
                      <div>
                        <span style={{ fontSize: 12, fontWeight: "500" }}>Xử lý yêu cầu</span>
                      </div>
                    ) : data?.status === 2 || data?.status === 3 || data?.status === 4 ? (
                      <div>
                        <span style={{ fontSize: 12, fontWeight: "500" }}>Hành động</span>
                      </div>
                    ) : null}
                    <div className="list-button">
                      {/* //chưa tiếp nhận hiển thị */}
                      {data?.status === 0 &&
                      (data?.taskType === "assigned_task" || data?.taskType === "portal" || data?.taskType === "open_portal") &&
                      data?.employeeId === dataEmployee?.id &&
                      data?.employeeId !== data?.managerId ? (
                        <div
                          className="item-button-reject"
                          onClick={() => {
                            setShowOnRejectModal(true);
                          }}
                        >
                          <Icon name="Times" />
                          <span className="title">Từ chối</span>
                        </div>
                      ) : null}

                      {/* //khi tiếp nhận xong hiển thị */}
                      {(data?.status === 1 || data?.status === 4 || data?.status === 0) && data?.managerId === dataEmployee?.id ? (
                        <div
                          className="item-button-reject"
                          onClick={() => {
                            // handleUpdateStatusWork(3);
                            showDialogConfirmDelete();
                          }}
                        >
                          <Icon name="Times" />
                          <span className="title">Huỷ</span>
                        </div>
                      ) : null}

                      {/* //Khi chưa tiếp nhận hoặc đã tiếp nhận thì hiển thị */}
                      {data?.status === 0 || data?.status === 1 ? (
                        <div
                          className="item-button-onhold"
                          onClick={() => {
                            setShowOnHoldModal(true);
                            // handleUpdateStatusWork(4);
                          }}
                        >
                          <Icon name="Pause" />
                          <span className="title">Tạm dừng</span>
                        </div>
                      ) : null}

                      {data?.status === 0 &&
                      data?.employeeId === dataEmployee?.id &&
                      (data?.taskType === "assigned_task" || data?.taskType === "portal" || data?.taskType === "open_portal") ? (
                        <div
                          className="item-button-receive"
                          onClick={() => {
                            handleUpdateStatusWork(1);
                          }}
                        >
                          <Icon name="Checked" />
                          <span className="title">Tiếp nhận</span>
                        </div>
                      ) : null}

                      {/* //Khi tiếp nhận xong thì hiển thị */}
                      {data?.status === 1 && data?.employeeId === dataEmployee?.id ? (
                        <div
                          className="item-button-receive"
                          onClick={() => {
                            if (new Date() > new Date(data?.endTime)) {
                              setShowOnSuccessExpireModal(true);
                            } else {
                              handleUpdateStatusWork(2);
                            }
                          }}
                        >
                          <span className="title">Hoàn thành</span>
                        </div>
                      ) : null}

                      {/* //khi hoàn thành xong hoặc đã huỷ hoặc tạm dừng thì hiển thị */}
                      {(data?.status === 2 && data?.taskType !== "open_portal") || data?.status === 4 ? (
                        <div
                          className="item-button-rework"
                          onClick={() => {
                            handleUpdateStatusWork(1, true);
                          }}
                        >
                          <Icon name="Reload" />
                          <span className="title">Thực hiện lại công việc</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <div
                  className={listStepProcess && listStepProcess?.length > 0 ? "info__work--left" : "info__work--left_height"}
                  style={data?.scope === "external" ? { height: "calc(100vh - 93px)" } : {}}
                >
                  {/* <CustomScrollbar width="100%" height='65rem'> */}
                  <div className="wrapper__work--left">
                    <div className="info__basic">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                        <h3 className="title-basic">Thông tin chi tiết</h3>
                        <div className="show-status">
                          {data.status === 0 ? (
                            new Date() > new Date(data?.endTime) ? (
                              <div className="__expire">
                                <Icon name="ExpireWork" />
                                <span style={{ fontSize: 12, fontWeight: "500" }}>Quá hạn {handleUnfulfilled(data?.endTime)}</span>
                              </div>
                            ) : (
                              <div className="__unfulfilled">
                                <Icon name="NewWork" />
                                <span style={{ fontSize: 12, fontWeight: "500" }}>Chưa tiếp nhận</span>
                              </div>
                            )
                          ) : data.status === 1 ? (
                            new Date() > new Date(data?.endTime) ? (
                              <div className="__expire">
                                <Icon name="ExpireWork" />
                                <span style={{ fontSize: 12, fontWeight: "500" }}>Quá hạn {handleUnfulfilled(data?.endTime)}</span>
                              </div>
                            ) : (
                              <div className="__unfulfilled">
                                <Icon name="NewWork" />
                                <span style={{ fontSize: 12, fontWeight: "500" }}>Mới tiếp nhận</span>
                              </div>
                            )
                          ) : data.status === 2 ? (
                            <div className="__success">
                              <Icon name="CompleteWork" />
                              <span style={{ fontSize: 12, fontWeight: "500" }}>Hoàn thành</span>
                            </div>
                          ) : data.status === 3 ? (
                            <div className="__cancelled">
                              <Icon name="CancelWork" />
                              <span style={{ fontSize: 12, fontWeight: "500" }}>Đã hủy</span>
                            </div>
                          ) : (
                            <div className="__pause">
                              <Icon name="PauseWork" />
                              <span style={{ fontSize: 12, fontWeight: "500" }}>Tạm dừng</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="info__basic--item">
                        {data?.scope === "external" ? (
                          <div className="name-work" style={{ marginBottom: "2rem" }}>
                            <span className="title">Tên công việc</span>
                            <div
                              className="box_content"
                              onClick={() => {
                                // setIsHandleTask();
                                // setIsModalHandleTask(true);
                              }}
                            >
                              <span className="name">{data?.name}</span>
                            </div>
                          </div>
                        ) : null}

                        <div className="content-work">
                          <span className="title">Nội dung công việc</span>
                          <div
                            className="box_content"
                            onClick={() => {
                              // setIsHandleTask();

                              if (data?.scope !== "external") {
                                setIsModalHandleTask(true);
                              } else {
                                if (data?.taskType === "portal") {
                                  if (data?.status === 0) {
                                    showToast("Bạn chưa tiếp nhận công việc", "warning");
                                  } else {
                                    setIsModalReplyRequest(true);
                                  }
                                }

                                if (data?.taskType === "open_portal") {
                                  if (data?.status === 0) {
                                    showToast("Bạn chưa tiếp nhận công việc", "warning");
                                  } else {
                                    setIsModalEvaluateBidding(true);
                                  }
                                }
                              }
                            }}
                          >
                            {data?.scope === "external" ? (
                              <span className="content">{data?.content}</span>
                            ) : (
                              <span className="content">
                                {data?.nodeName} {data?.iteration > 0 ? `(lần ${data?.iteration})` : ""}
                                {data?.scope !== "external" ? <Icon name="ArrowRight" /> : null}
                              </span>
                            )}
                          </div>
                        </div>

                        {data?.scope !== "external" ? (
                          <div className="line_2">
                            <div className="project">
                              <span className="title">Dự án</span>
                              <div className="content">
                                {data?.extendedData && JSON.parse(data?.extendedData) ? JSON.parse(data?.extendedData).projectName : ""}
                              </div>
                            </div>
                            <div className="bidding_package">
                              <span className="title">Tên gói thầu - Mua sắm</span>
                              <div className="content">
                                {data?.extendedData && JSON.parse(data?.extendedData) ? JSON.parse(data?.extendedData).prName : ""}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <div className="line_3">
                          <div className="start_time">
                            <span className="title">Thời gian bắt đầu</span>
                            <div className="content">{moment(data?.startTime).format("HH:mm DD/MM/YYYY")}</div>
                          </div>
                          <div className="end_time">
                            <span className="title">Thời gian kết thúc</span>
                            <div className="content">{moment(data?.endTime).format("HH:mm DD/MM/YYYY")}</div>
                          </div>
                        </div>

                        {valueOLAResponse || valueOLAProcess ? (
                          <div className="line_3">
                            {!valueOLAResponse?.day && !valueOLAResponse?.hour && !valueOLAResponse?.minute ? null : (
                              <div className="OLA_SLA">
                                <span className="title">OLA phản hồi</span>
                                <div className="content">{`${
                                  valueOLAResponse?.day && +valueOLAResponse?.day ? `${valueOLAResponse?.day} ngày` : ""
                                } ${valueOLAResponse?.hour && +valueOLAResponse?.hour ? `${valueOLAResponse?.hour} giờ` : ""} ${
                                  valueOLAResponse?.minute && +valueOLAResponse?.minute ? `${valueOLAResponse?.minute} phút` : ""
                                }`}</div>
                              </div>
                            )}
                            {!valueOLAProcess?.day && !valueOLAProcess?.hour && !valueOLAProcess?.minute ? null : (
                              <div className="OLA_SLA">
                                <span className="title">OLA xử lý</span>
                                <div className="content">{`${valueOLAProcess?.day && +valueOLAProcess?.day ? `${valueOLAProcess?.day} ngày` : ""} ${
                                  valueOLAProcess?.hour && +valueOLAProcess?.hour ? `${valueOLAProcess?.hour} giờ` : ""
                                } ${valueOLAProcess?.minute && +valueOLAProcess?.minute ? `${valueOLAProcess?.minute} phút` : ""}`}</div>
                              </div>
                            )}
                          </div>
                        ) : null}

                        {data?.attachments && data?.attachments.length > 0 ? (
                          <div className="line_4">
                            <div className="container_document">
                              <div className="box-title">
                                <span className="title">Tài liệu liên quan</span>
                                {downloadAll ? (
                                  <div className="button-download">
                                    <span style={{ fontWeight: "300", fontSize: 12, color: "#ED1B34", marginRight: 5 }}>Đang nén</span>
                                    <Icon name="Loading" />
                                  </div>
                                ) : (
                                  <div
                                    className="button-download"
                                    onClick={() => {
                                      handleDownloadAll(data?.attachments);
                                    }}
                                  >
                                    <span style={{ fontWeight: "300", fontSize: 12, color: "#ED1B34", marginRight: 5 }}>
                                      Tải xuống tất cả tài liệu
                                    </span>
                                    <Icon name="DownLoadNew" />
                                  </div>
                                )}
                              </div>
                              <div className="list_document">
                                {data?.attachments.map((item, index) => (
                                  <Tippy key={index} content="Mở File">
                                    <div
                                      key={index}
                                      className="item_document"
                                      onClick={() => {
                                        // setIsModalViewDocument(true);
                                        // setDataDoc({
                                        //   fileUrl: item.fileUrl,
                                        //   fileName: item.fileName
                                        // })
                                        window.open(
                                          `${process.env.APP_CRM_LINK}/crm/view_document?name=${item.fileName}&url=${item.fileUrl}`,
                                          "_blank",
                                          "noopener,noreferrer"
                                        );
                                      }}
                                    >
                                      <Icon name="FileDoc" />
                                      <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 5 }}>{item.fileName}</span>
                                    </div>
                                  </Tippy>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* {data.status == 2 && (
                            <div
                              className="item evaluate-work"
                              onClick={() => {
                                if (dataEmployee && (dataEmployee.id === data.employeeId || dataEmployee.id === data.managerId)) {
                                  if (!data.reviews) {
                                    setShowModalEvaluateWork(true);
                                  } else {
                                    if (JSON.parse(data.reviews || "[]")[0]["employeeId"] === data.managerId) {
                                      if (dataEmployee?.id === data.managerId) {
                                        setShowModalEvaluateWork(true);
                                      } else {
                                        setDisabledRating(true);
                                        setShowModalEvaluateWork(true);
                                      }
                                    }
                                  }
                                }
                              }}
                            >
                              <h4 className="title">Đánh giá</h4>
                              <div className="star-rating">
                                {[...Array(5)].map((item, idx) => {
                                  return (
                                    <div
                                      key={idx + 1}
                                      className={idx + 1 <= ((rating && hover) || hover) ? "on" : "off"}
                                      onClick={() => {
                                        if (dataEmployee && (dataEmployee.id === data.employeeId || dataEmployee.id === data.managerId)) {
                                          if (!data.reviews) {
                                            setRating(idx + 1);
                                          } else {
                                            if (JSON.parse(data.reviews || "[]")[0]["employeeId"] === data.managerId) {
                                              if (dataEmployee?.id === data.managerId) {
                                                setRating(idx + 1);
                                              } else {
                                                setRating(JSON.parse(data.reviews || "[]")[0]["mark"]);
                                              }
                                            }
                                          }
                                        }
                                      }}
                                      onMouseEnter={() => {
                                        if (dataEmployee && (dataEmployee.id === data.employeeId || dataEmployee.id === data.managerId)) {
                                          if (!data.reviews) {
                                            setHover(idx + 1);
                                          } else {
                                            if (JSON.parse(data.reviews || "[]")[0]["employeeId"] === data.managerId) {
                                              if (dataEmployee?.id === data.managerId) {
                                                setHover(idx + 1);
                                              } else {
                                                setRating(JSON.parse(data.reviews || "[]")[0]["mark"]);
                                              }
                                            }
                                          }
                                        }
                                      }}
                                      onMouseLeave={() => {
                                        if (dataEmployee && (dataEmployee.id === data.employeeId || dataEmployee.id === data.managerId)) {
                                          if (!data.reviews) {
                                            setHover(rating);
                                          } else {
                                            if (JSON.parse(data.reviews || "[]")[0]["employeeId"] === data.managerId) {
                                              if (dataEmployee?.id === data.managerId) {
                                                setHover(rating);
                                              } else {
                                                setRating(JSON.parse(data.reviews || "[]")[0]["mark"]);
                                              }
                                            }
                                          }
                                        }
                                      }}
                                      onDoubleClick={() => {
                                        if (dataEmployee && (dataEmployee.id === data.employeeId || dataEmployee.id === data.managerId)) {
                                          if (!data.reviews) {
                                            setHover(0);
                                            setRating(0);
                                          } else {
                                            if (JSON.parse(data.reviews || "[]")[0]["employeeId"] === data.managerId) {
                                              if (dataEmployee?.id === data.managerId) {
                                                setHover(0);
                                                setRating(0);
                                              } else {
                                                setRating(JSON.parse(data.reviews || "[]")[0]["mark"]);
                                              }
                                            }
                                          }
                                        }
                                      }}
                                    >
                                      <span className="star">
                                        <Icon name="Star" />
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )} */}
                      </div>
                    </div>
                    <div className="involve-customers">
                      <div
                        className="title-item title-customers"
                        // onClick={() => {
                        //   setIsInvolveCustomer(!isInvolveCustomer);
                        // }}
                      >
                        <span>Người liên quan</span>
                        {/* <span className="icon-up-down">{isInvolveCustomer ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span> */}
                      </div>

                      {isInvolveCustomer && <UpdatePeopleInvolved data={data} setModalChangeEmployee={setModalChangeEmployee} />}
                    </div>
                  </div>
                  {/* </CustomScrollbar> */}
                </div>
              </div>

              <div className={listStepProcess && listStepProcess?.length > 0 ? "info__work--right" : "info__work--right_height"}>
                <div className="container_tab">
                  <div
                    style={{
                      borderBottom: tabHistoryWork === 1 ? "1px solid #CE182D" : "1px solid #EEEEEF",
                      paddingLeft: 12,
                      paddingRight: 12,
                      cursor: "pointer",
                      paddingBottom: 3,
                    }}
                    onClick={() => {
                      setTabHistoryWork(1);
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 400, color: tabHistoryWork === 1 ? "#ED1B34" : "#2C2C2C" }}>Ghi chú dự án</span>
                  </div>
                  {/* <div 
                      style={{borderBottom: tabHistoryWork === 2 ? '1px solid #CE182D' : '1px solid #EEEEEF', paddingLeft: 12, paddingRight: 12, cursor: 'pointer', paddingBottom: 3}}
                      onClick={() => {setTabHistoryWork(2)}}
                    >
                      <span style={{fontSize: 16, fontWeight: 400, color: tabHistoryWork === 2 ? '#ED1B34' : '#2C2C2C'}}>Lịch sử xử lý</span>
                    </div> */}

                  {data?.scope === "external" ? (
                    <div
                      style={{
                        borderBottom: tabHistoryWork === 3 ? "1px solid #CE182D" : "1px solid #EEEEEF",
                        paddingLeft: 12,
                        paddingRight: 12,
                        cursor: "pointer",
                        paddingBottom: 3,
                      }}
                      onClick={() => {
                        setTabHistoryWork(3);
                      }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 400, color: tabHistoryWork === 3 ? "#ED1B34" : "#2C2C2C" }}>Bình luận</span>
                    </div>
                  ) : null}

                  {/* Xuất Excel OLA SLA */}
                  {data?.scope !== "external" ||
                  data?.taskType === "assigned_task" ||
                  data?.taskType === "portal" ||
                  data?.taskType === "open_portal" ? (
                    <div style={{ display: "flex", gap: "0 1rem", flex: 1, justifyContent: "flex-end" }}>
                      <div
                        style={{ border: "0.5px solid", padding: "0 0.5rem 0 0.5rem", cursor: "pointer", borderRadius: 5 }}
                        onClick={() => {
                          if (data?.taskType === "assigned_task") {
                            exportExternal(data, "excel", "ola");
                          } else {
                            exportCallback(data, "excel", "ola");
                          }
                        }}
                      >
                        <Icon name="Download" style={{ width: "1.6rem", heigth: "1.6rem" }} />
                        <span style={{ fontSize: 12, fontWeight: "400" }}>OLA</span>
                      </div>
                      {/* <div style={{border: '0.5px solid', padding: '0 0.5rem 0 0.5rem', cursor: 'pointer', borderRadius: 5}}
                          onClick={() => {
                            exportCallback(data, 'excel', 'sla');
                          }}
                        >
                          <Icon name='Download' style={{width: '1.6rem', heigth: '1.6rem'}}/>
                          <span style={{fontSize: 12, fontWeight: '400'}}>SLA</span>
                        </div> */}
                    </div>
                  ) : null}
                </div>
                {tabHistoryWork === 1 &&
                  (listWorkPause && listWorkPause.length > 0 ? (
                    <div className="container_note_project">
                      {/* <div className="column_road">
                            {listWorkPause.map((item, index) => (
                              <div key={index} className="item_column_road">
                                <div className="icon">
                                  <Icon name='NoteDetailWork'/>
                                </div>
                                <div className="line"></div>
                              </div>
                            ))}
                          </div> */}

                      <div className="container_step">
                        {listWorkPause.map((item, index) => (
                          <div key={index} style={{ width: "100%", display: "flex", gap: "0 1.3rem" }}>
                            <div className="item_column_road">
                              <div className="icon">
                                <Icon name="NoteDetailWork" />
                              </div>
                              <div className="line"></div>
                            </div>
                            <div className="item_step">
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ width: "83%" }}>
                                  {/* type === 2 là từ chối thì số lần iteration - 1*/}
                                  <span style={{ fontSize: 14, fontWeight: 500, color: "#2C2C2C" }}>
                                    {item?.nodeName || item?.workOrderName}{" "}
                                    {item?.iteration > 2 ? `(lần ${item.type === 2 ? item?.iteration - 1 : item?.iteration})` : ""}
                                  </span>
                                </div>

                                {/* {item.pauseReasonId || item.reason ? 
                                      <div style={{border: '1px solid #E8E8E9', padding: '0 0.5rem 0 0.5rem', borderRadius: '8px', display:'flex' }}>
                                        <span style={{fontSize: 10,  fontWeight: '400', color: item.pauseReasonId ? 'orange' : '#999999'}}>{item.pauseReasonId ? 'Tạm dừng' : item.reason ? 'Từ chối' : ''}</span>
                                      </div>
                                      : null
                                    } */}
                              </div>
                              {item.day || item.hour || item.minute ? (
                                <div style={{ marginTop: "0.5rem" }}>
                                  <span style={{ fontSize: 12, fontWeight: "500" }}>
                                    Thời gian tạm dừng:{" "}
                                    <span style={{ fontWeight: "400" }}>{`${item?.day ? `${item?.day} ngày` : ""} ${
                                      item?.hour ? `${item?.hour} giờ` : ""
                                    } ${item?.minute ? `${item?.minute} phút` : ""}`}</span>
                                  </span>
                                </div>
                              ) : null}
                              {item.pauseReasonId ? (
                                <div style={{ marginTop: "0.5rem" }}>
                                  <span style={{ fontSize: 12, fontWeight: "500" }}>
                                    Nguyên nhân: <span style={{ fontWeight: "400" }}>{item.pauseReasonName}</span>
                                  </span>
                                </div>
                              ) : null}
                              <div style={{ marginTop: "0.5rem" }}>
                                <span style={{ fontSize: 12, fontWeight: "400" }}>{trimContent(item.reason, 130, true, true)} </span>
                              </div>
                              {item.attachment && JSON.parse(item.attachment) && JSON.parse(item.attachment).length > 0
                                ? JSON.parse(item.attachment).map((item, idx) => (
                                    <div key={idx} className="list_document">
                                      <Tippy content="Mở File">
                                        <div
                                          className="item_document"
                                          onClick={() => {
                                            // handDownloadFileOrigin(item.fileUrl, item.fileName)
                                            // setIsModalViewDocument(true);
                                            // setDataDoc({
                                            //   fileUrl: item.fileUrl,
                                            //   fileName: item.fileName
                                            // })
                                            window.open(
                                              `${process.env.APP_CRM_LINK}/crm/view_document?name=${item.fileName}&url=${item.fileUrl}`,
                                              "_blank",
                                              "noopener,noreferrer"
                                            );
                                          }}
                                        >
                                          <Icon name="FileDoc" />
                                          <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 5 }}>{item.fileName}</span>
                                        </div>
                                      </Tippy>
                                    </div>
                                  ))
                                : null}

                              <div className="employee_task">
                                <div className="implementer">
                                  <div className="avatar-implementer">
                                    <img src={item?.employeeAvatar || OtherGenders} />
                                  </div>
                                  <h4 className="name-implementer">{item?.employeeName}</h4>
                                </div>
                                <div className="time">
                                  <span style={{ fontSize: 12, fontWeight: "500", color: "#939394" }}>
                                    {moment(item.createdTime).format("DD/MM/YYYY - HH:mm")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="icon_empty_data">
                      <div>
                        <Icon name="NoDataNote" />
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                        <div style={{ fontSize: 14, fontWeight: "700" }}>Không có ghi chú nào</div>
                        <div style={{ fontSize: 12, fontWeight: "700", color: "#939394" }}>Hãy bắt đầu tạo ghi chú để theo dõi công việc</div>
                      </div>
                    </div>
                  ))}

                {tabHistoryWork === 2 && (
                  <div className="history_handle">
                    <ListHistoryHandle dataObject={data} />
                  </div>
                )}

                {tabHistoryWork === 3 && (
                  <div className="history_handle">
                    <ContentExchangeWork dataEmployee={dataEmployee} worId={data?.id} dataWork={data} />
                  </div>
                )}
              </div>
            </div>
          </Fragment>
        ) : (
          <Loading />
        )}
      </div>
      <AddWorkInprogressModal
        onShow={showModalWorkInprogress}
        idWork={data?.id}
        onHide={(reload) => {
          if (reload) {
            handGetDetailWork(idData);
          }
          setShowModalWorkInprogress(false);
        }}
      />
      <AddWorkRatingModal
        data={data}
        disabledRating={disabledRating}
        onShow={showModalEvaluateWork}
        idWork={data?.id}
        numberRating={rating}
        onHide={(reload) => {
          if (reload) {
            handGetDetailWork(idData);
            setRating(0);
          }

          setShowModalEvaluateWork(false);
        }}
      />
      <ChangeEmployee
        onShow={modalChangeEmployee}
        data={data}
        onHide={(reload) => {
          if (reload) {
            handGetDetailWork(idData);
          }
          setModalChangeEmployee(false);
        }}
      />
      <ModalHandleTask
        onShow={isModalHandleTask}
        isHandleTask={isHandleTask}
        dataWork={data}
        onHide={(reload, notClose, closeDetailWork) => {
          if (reload) {
            handGetDetailWork(idData);
            // getListWorkPause(idData);
            // getListWorkPause(data?.potId, data?.processId, data?.id, data);
          }
          if (!notClose) {
            setIsModalHandleTask(false);
          }

          if (closeDetailWork) {
            setIsHandleTask();
          }
        }}
      />

      <ReplyRequestModal
        onShow={isModalReplyRequest}
        data={data}
        onHide={(reload) => {
          if (reload) {
            // handGetDetailWork(idData);
          }
          setIsModalReplyRequest(false);
        }}
      />

      <ModalViewDocument
        onShow={isModalViewDocument}
        dataDoc={dataDoc}
        onHide={(reload) => {
          if (reload) {
          }
          setIsModalViewDocument(false);
          setDataDoc(null);
        }}
      />

      {/* <OnHoldModal
        onShow={showOnHoldModal}
        data={data}
        dataSchema={null}
        onHide={(reload) => {
          if (reload) {
            handleUpdateStatusWork(4);
          }
          setShowOnHoldModal(false);
        }}
      /> */}

      <OnRejectModal
        onShow={showOnRejectModal}
        data={data}
        dataSchema={null}
        checkIsApproval={false}
        checkReceived={false}
        onHide={(reload) => {
          if (reload) {
            // handleUpdateStatusWork(2, true);
            handGetDetailWork(idData);
            setIsHandleTask();
          }
          setShowOnRejectModal(false);
        }}
      />
      {/* 
      <OnSuccessExpireModal
        onShow={showOnSuccessExpiretModal}
        data={data}
        dataSchema={null}
        checkIsApproval={false}
        checkReceived={false}
        onHide={(reload) => {
          if (reload) {
            handleUpdateStatusWork(2);
          }
          setShowOnSuccessExpireModal(false);
        }}
      /> */}

      <ModalEvaluateBidding
        onShow={isModalEvaluateBidding}
        data={data}
        onHide={(reload) => {
          if (reload) {
            handleUpdateStatusWork(2);
          }
          setIsModalEvaluateBidding(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
};

export default memo(DetailTask);
