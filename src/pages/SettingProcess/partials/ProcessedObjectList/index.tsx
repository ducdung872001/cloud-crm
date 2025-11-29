import React, { Fragment, useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import _ from "lodash";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Badge from "components/badge/badge";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPageOffset, getSearchParameters, isDifferenceObj, removeAccents } from "reborn-util";
import { ContextType, UserContext } from "contexts/userContext";
import AddObject from "./partials/AddObject";
import AddTemplateFSQuote from "pages/Common/AddTemplateFSQuote";
import { CustomExportReport } from "exports/customExportReport";
import { useSearchParams } from "react-router-dom";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";

import "./index.scss";
import ProcessedObjectService from "services/ProcessedObjectService";
import ModalSigner from "./partials/ModalSigner";
import HistoryProcess from "./HistoryProcess";
import { ExportExcel } from "exports";
import WorkOrderService from "services/WorkOrderService";
import ModalSelectProcessOLA from "./ModalSelectProcessOLA/ModalSelectProcessOLA";
import ModalDebugObject from "./ModalDebugObject";

export default function ProcessedObjectList() {
  document.title = "Danh sách hồ sơ";

  const isMounted = useRef(false);
  const { name, dataInfoEmployee } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();
  const [listObject, setListObject] = useState([]);
  const [dataObject, setDataObject] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalSettingObject, setShowModalSettingObject] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [hasHistorySignature, setHasHistorySignature] = useState<boolean>(false);
  const [modalSelectProcess, setModalSelectProcess] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const customerFilterList = useMemo(
    () =>
      [
        {
          key: "employeeId",
          name: "Người lập",
          type: "select",
          is_featured: true,
          value: searchParams.get("employeeId") ?? "",
        },
        {
          key: "status",
          name: "Trạng thái",
          type: "select",
          list: [
            { value: "-1", label: "Tất cả" },
            { value: "0", label: "Chưa phê duyệt" },
            { value: "1", label: "Đang xử lý" },
            { value: "2", label: "Đã phê duyệt" },
            { value: "3", label: "Từ chối duyệt" },
            { value: "4", label: "Tạm dừng" },
          ],
          is_featured: true,
          value: searchParams.get("status") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách hồ sơ",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "hồ sơ",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListProcessedObject = async (paramsSearch) => {
    setIsLoading(true);

    const response = await ProcessedObjectService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListObject(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListProcessedObject(params);
      const paramsTemp: any = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
  }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: !showModalSettingObject || !hasHistorySignature ? "Thêm mới" : "Quay lại",
        callback: () => {
          if (showModalAdd) {
            setShowModalAdd(false);
          } else {
            setDataObject(null);
            setShowModalAdd(true);
          }
        },
      },
    ],
  };

  const titles = ["STT", "Tên hồ sơ", "Ngày tạo", "Ngày bắt đầu", "Ngày kết thúc", "Người lập", "Trạng thái"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "", "text-center"];

  const dataMappingArray = (item, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY") : "",
    item.startTime ? moment(item.startTime).format("DD/MM/YYYY") : "",
    item.endTime ? moment(item.endTime).format("DD/MM/YYYY") : "",
    item.employeeName,
    <Badge
      key={item.id}
      text={
        !item.status
          ? "Chưa phê duyệt"
          : item.status === 1
          ? "Đang xử lý"
          : item.status === 2
          ? "Đã phê duyệt"
          : item.status === 4
          ? "Tạm dừng"
          : "Từ chối duyệt"
      }
      variant={!item.status ? "secondary" : item.status === 1 ? "primary" : item.status === 2 ? "success" : item.status === 4 ? "warning" : "error"}
    />,
  ];

  const handleTitleExport = async (sheetId: number) => {
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

      const resultTitle = result.map((item) => item.name);

      return resultTitle;
    }
  };
  const removePunctuationAndCamelCase = (str) => {
    str = removeAccents(str);

    return str
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  };

  const handleExportDataFS = async (data, item: any) => {
    const changeName = removePunctuationAndCamelCase(item.name);
    const titleExport = await handleTitleExport(item.sheetId);

    CustomExportReport({
      fileName: changeName,
      title: item.name,
      header: titleExport,
      data: [],
      info: { name },
    });
  };

  const actionsTable = (item): IAction[] => {
    return [
      {
        title: "Export OLA",
        icon: <Icon name="Download" />,
        callback: () => {
          // exportCallback(item, 'excel', 'ola');
          setDataObject(item);
          setModalSelectProcess(true);
        },
      },
      ...(item.processId
        ? [
            {
              title: "Xem lịch sử xử lý",
              icon: <Icon name="ImpactHistory" />,
              callback: () => {
                setDataObject(item);
                setHasHistorySignature(true);
              },
            },
          ]
        : []),

      ...(!item.processId
        ? [
            {
              title: "Trình xử lý",
              icon: <Icon name="FingerTouch" className="icon-warning" />,
              callback: () => {
                setDataObject(item);
                setHasSignature(true);
                // handleCheckValidateSignature(item, "signature");
              },
            },
          ]
        : []),
      {
        title: "Debug",
        icon: <Icon name="Debug" style={{ width: 18 }} className="icon-error" />,
        callback: () => {
          setShowDebug(item);
          setDataObject(item);
        },
      },
      ...(!item.status
        ? [
            {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setShowModalAdd(true);
                setDataObject(item);
              },
            },
            {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]
        : item.status === 1
        ? [
            {
              title: "Tạm dừng xử lý",
              icon: <Icon name="WarningCircle" className="icon-warning" />,
              callback: () => {
                showDialogConfirmStatus(item, "pending");
              },
            },
          ]
        : item.status === 4
        ? [
            {
              title: "Tiếp tục xử lý",
              icon: <Icon name="InfoCircle" className="icon-success" />,
              callback: () => {
                showDialogConfirmStatus(item, "play");
              },
            },
            {
              title: "Xử lý lại",
              icon: <Icon name="FingerTouch" className="icon-warning" />,
              callback: () => {
                showDialogConfirmStatus(item, "inital");
              },
            },
          ]
        : []),
      ...(dataInfoEmployee && dataInfoEmployee.isOwner === 1 && (item.status === 2 || item.status === 3)
        ? [
            {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]
        : []),
    ];
  };

  const onDelete = async (id: number) => {
    const response = await ProcessedObjectService.delete(id);

    if (response.code === 0) {
      showToast("Xóa hồ sơ thành công", "success");
      getListProcessedObject(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "hồ sơ " : `${listIdChecked.length} hồ sơ đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const showDialogConfirmStatus = (item?, status?: "pending" | "play" | "inital") => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>{`${status == "play" ? "Tiếp tục" : status == "inital" ? "Trình lại" : "Tạm dừng"} trình xử lý...`}</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn {status == "play" ? "tiếp tục" : status == "inital" ? "trình lại" : "tạm dừng"} trình xử lý{" "}
          {item ? "đối tượng " : `${listIdChecked.length} đối tượng đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        //Chưa thấy làm gì
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa đối tượng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

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

  const dataMappingArray_OLA_SLA = (item: any, index: number, type?: string) =>
    type === "ola"
      ? [
          index + 1,
          item.employeeName,
          item.departmentName,
          item.potId,
          item.nodeName,
          item.projectName,
          item.bidPackpage,
          item.processName,
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
          item.reason,
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
      response = await WorkOrderService.exportOLA({
        page: 1,
        limit: 10000,
        potId: data.id,
        processId: 351,
        // employeeId: data.employeeId
      });
    } else if (type === "sla") {
      response = await WorkOrderService.exportSLA({
        page: 1,
        limit: 10000,
        processId: data.id,
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
            data: result.key.map((item, idx) => dataMappingArray_OLA_SLA(item, idx, type)),
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
            data: result.map((item, idx) => dataMappingArray_OLA_SLA(item, idx, type)),
            info: { name },
          });
        }
      }

      showToast("Xuất file thành công", "success");
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  }, []);

  return (
    <div className={`page-content page__process_object${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Danh sách hồ sơ" titleActions={titleActions} />

      {/* <div className="action-navigation">
        <div className="action-backup" style={showModalSettingObject || hasHistorySignature ? { marginBottom: "1.6rem" } : {}}>
          <h1
            onClick={() => {
              setShowModalSettingObject(false);
              setHasHistorySignature(false);
            }}
            className="title-first"
            title="Quay lại"
          >
            Danh sách đối tượng
          </h1>
          {showModalSettingObject && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setShowModalSettingObject(false);
                }}
              />
              <h1 className="title-last">Cấu hình đối tượng</h1>
            </Fragment>
          )}
          {hasHistorySignature && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setHasHistorySignature(false);
                }}
              />
              <h1 className="title-last">Xem lịch sử xử lý</h1>
            </Fragment>
          )}
        </div>
        {!showModalSettingObject && !hasHistorySignature && <TitleAction title="" titleActions={titleActions} />}
      </div> */}

      <div className="card-box d-flex flex-column">
        <div className={`${showModalSettingObject || hasHistorySignature ? "d-none" : ""}`}>
          <SearchBox
            name="Tên hồ sơ"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            isFilter={true}
            listFilterItem={customerFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listObject && listObject.length > 0 ? (
            <BoxTable
              name="hồ sơ"
              titles={titles}
              items={listObject}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              isBulkAction={true}
              listIdChecked={listIdChecked}
              bulkActionItems={bulkActionList}
              striped={true}
              setListIdChecked={(listId) => setListIdChecked(listId)}
              actions={actionsTable}
              actionType="inline"
            />
          ) : isLoading ? (
            <Loading />
          ) : (
            <Fragment>
              {isNoItem ? (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có hồ sơ nào. <br />
                      Hãy thêm mới hồ sơ đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới hồ sơ"
                  action={() => {
                    setDataObject(null);
                    setShowModalAdd(true);
                  }}
                />
              ) : (
                <SystemNotification
                  description={
                    <span>
                      Không có dữ liệu trùng khớp.
                      <br />
                      Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                    </span>
                  }
                  type="no-result"
                />
              )}
            </Fragment>
          )}
        </div>

        {/* <div className={`${showModalSettingObject ? "" : "d-none"}`}>
          <AddFormObject
            onShow={showModalSettingObject}
            onHide={(reload) => {
              if (reload) {
                getListProcessedObject(params);
              }

              setShowModalSettingObject(false);
            }}
            disable={dataObject?.status === 2 ? true : false}
            idQuote={dataObject?.id}
            dataQuote={dataObject}
          />
        </div> */}

        <div className={`${hasHistorySignature ? "" : "d-none"}`}>
          <HistoryProcess
            // type="quote"
            onShow={hasHistorySignature}
            dataObject={dataObject}
            onHide={() => setHasHistorySignature(false)}
          />
        </div>
      </div>
      <AddObject
        onShow={showModalAdd}
        onHide={(reload) => {
          if (reload) {
            getListProcessedObject(params);
          }

          setShowModalAdd(false);
          setDataObject(null);
        }}
        data={dataObject}
      />
      <ModalSelectProcessOLA
        onShow={modalSelectProcess}
        data={dataObject}
        onHide={(reload) => {
          if (reload) {
            // getListProcessedObject(params);
          }
          setModalSelectProcess(false);
          setDataObject(null);
        }}
      />
      <ModalSigner
        onShow={hasSignature}
        onHide={(reload) => {
          if (reload) {
            getListProcessedObject(params);
          }
          setDataObject(null);
          setHasSignature(false);
        }}
        data={dataObject}
      />

      <ModalDebugObject
        onShow={showDebug}
        dataObject={dataObject}
        onHide={(reload) => {
          if (reload) {
            // getListBusinessProcess(params);
          } else {
            setShowDebug(false);
            setDataObject(null);
          }
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
