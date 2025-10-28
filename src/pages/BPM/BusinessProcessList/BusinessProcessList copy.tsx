import React, { Fragment, useState, useEffect, useRef, useContext } from "react";
import _, { set } from "lodash";
import moment from "moment";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IAction, ISaveSearch } from "model/OtherModel";
import { ICampaignFilterRequest } from "model/campaign/CampaignRequestModel";
import { ICampaignResponseModel } from "model/campaign/CampaignResponseModel";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { showToast } from "utils/common";
import CampaignService from "services/CampaignService";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import Badge from "components/badge/badge";
import "./BusinessProcessList.scss";
import { CircularProgressbar } from "react-circular-progressbar";
import { ContextType, UserContext } from "contexts/userContext";
// import AddMAModal from "./BuninessProcessList/AddMAModal";
import MarketingAutomationService from "services/MarketingAutomationService";
import ModalAddBusinessProcess from "./partials/ModalAddBusinessProcess";
import BusinessProcessService from "services/BusinessProcessService";
import SelectCustom from "components/selectCustom/selectCustom";
import Kanban from "./Kanban/Kanban";
import HistoryProcess from "./HistoryProcess";
import ModalDebugProcess from "./ModalDebugProcess";
import ModalAddFile from "./Kanban/partials/AddFile/ModalAddFile";

const colorData = [
  "#E98E4C",
  "#ED6665",
  "#FFBF00",
  "#9966CC",
  "#6A5ACD",
  "#007FFF",
  "#993300",
  "#F0DC82",
  "#CC5500",
  "#C41E3A",
  "#ACE1AF",
  "#7FFF00",
  "#FF7F50",
  "#BEBEBE",
  "#FF00FF",
  "#C3CDE6",
  "#FFFF00",
  "#40826D",
  "#704214",
];
export default function BusinessProcessListCopy() {
  document.title = "Danh sách quy trình";

  const navigate = useNavigate();
  const isMounted = useRef(false);
  const checkIsKanban = localStorage.getItem("isKanbanBusinessProcess");
  const checkProcessId = (localStorage.getItem("processId") && JSON.parse(localStorage.getItem("processId"))) || -1;
  const checkProcessName = localStorage.getItem("processName");

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [listBusinessProcess, setListBusinessProcess] = useState([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [showDialogPause, setShowDialogPause] = useState<boolean>(false);
  const [contentDialogPause, setContentDialogPause] = useState<any>(null);
  const [showDialogApprove, setShowDialogApprove] = useState<boolean>(false);
  const [contentDialogApprove, setContentDialogApprove] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataBusinessProcess, setDataBusinessProcess] = useState(null);
  const [columnList, setColumnList] = useState(undefined);
  const [listStepProcess, setListStepProcess] = useState([]);
  const [hasHistorySignature, setHasHistorySignature] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState(false);
  const [dataObject, setDataObject] = useState(null);

  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(checkIsKanban ? JSON.parse(checkIsKanban) : false);
  useEffect(() => {
    localStorage.setItem("isKanbanBusinessProcess", JSON.stringify(isRegimeKanban));
  }, [isRegimeKanban]);

  const [processId, setProcessId] = useState(() => {
    return checkProcessId ? checkProcessId : -1;
  });

  useEffect(() => {
    localStorage.setItem("processId", JSON.stringify(processId));
  }, [processId]);

  const [processName, setProcessName] = useState<string>(checkProcessName ? checkProcessName : "Tất cả quy trình");

  useEffect(() => {
    localStorage.setItem("processName", processName);
  }, [processName]);

  const [params, setParams] = useState<ICampaignFilterRequest>({
    name: "",
    limit: 10,
    page: 1,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách quy trình",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "quy trình",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListBusinessProcess = async (paramsSearch: any) => {
    setIsLoading(true);
    const response = await BusinessProcessService.list(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setListBusinessProcess(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params?.name && +result.page === 1) {
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
      getListBusinessProcess(params);
      const paramsTemp = _.cloneDeep(params);
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
      //! đoạn này bao giờ có chức năng lọc thì viết vào đây
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  //lấy danh sách bước của quy trình
  const getListStepProcess = async (processId) => {
    const body: any = {
      processId,
      limit: 100,
    };

    const response = await BusinessProcessService.listStep(body);
    if (response.code === 0) {
      const dataOption = response.result.items;

      setListStepProcess([
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
              return {
                value: item.id,
                label: item.stepName,
                color: colorData[index],
                processId: item.processId,
                step: item.stepNumber,
              };
            })
          : []),
      ]);
    }
  };

  useEffect(() => {
    // setParams({ ...params, saleflowId: saleflowId, approachId: -1, page: 1 });

    // setApproachId(-1);
    // setValueApproach(null);

    setValueProcess({
      value: processId,
      label: processName,
    });

    if (processId === -1) {
      // setListApproach([]);
      // setListConvertList([]);
    } else {
      getListStepProcess(processId);
    }
  }, [processId]);

  const [showModalAddFile, setShowModalAddFile] = useState<boolean>(false);

  const titleActions: ITitleActions = {
    actions: [
      ...(isRegimeKanban
        ? [
            {
              title: "Quay lại",
              icon: <Icon name="ChevronLeft" />,
              callback: () => {
                setIsRegimeKanban(!isRegimeKanban);
                clearKanban();
                // setParams({ ...params, approachId: -1 });
              },
            },
            {
              title: "Modal add file",
              icon: <Icon name="ChevronLeft" />,
              callback: () => {
                setShowModalAddFile(true);
              },
            },
          ]
        : [
            {
              title: "Thêm mới",
              callback: () => {
                setShowModalAdd(true);
                setDataBusinessProcess(null);
                //   navigate("/create_marketing_automation");
              },
            },
            {
              title: "Kanban",
              // icon: <Icon name="Fullscreen" />,
              callback: () => {
                setIsRegimeKanban(true);
                if (processId == -1) {
                  setProcessId(listBusinessProcess && listBusinessProcess.length > 0 && +listBusinessProcess[0].id);
                  setProcessName(listBusinessProcess[0]?.name);
                } else {
                  setProcessId(processId);
                  // setValueApproach(null);
                  // setParams({ ...params, processId: processId });
                }
              },
            },
          ]),
    ],
  };

  const titles = ["STT", "Tên quy trình", "Mã quy trình", "Người phụ trách", "Trạng thái"];

  const dataFormat = ["text-center", "", "", "", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    // <Link
    //   key={item.id}
    //   to={`/detail_marketing_automation/maId/${item.id}`}
    //   onClick={() => {
    //     //
    //   }}
    //   className="detail-marketing-automation"
    // >
    //   {item.name}
    // </Link>,
    item.name,
    item.code,
    // <div
    //   key={item.id}
    //   className={`action__view--customer`}
    //   onClick={() => {
    //     navigate(`/detail_marketing_automation/maId/${item.id}`);
    //   }}
    // >
    //   <a>Xem thêm</a>
    // </div>,
    item.employeeName,
    <Badge key={index} variant={item.status === 1 ? "success" : "secondary"} text={item.status === 1 ? "Đã phê duyệt" : "Chưa phê duyệt"} />,
  ];

  const onApprove = async (id, status) => {
    const param = {
      id,
      status: status,
    };
    const response = await MarketingAutomationService.approveMA(param);

    if (response.code === 0) {
      if (status === 1) {
        showToast("Phê duyệt thành công", "success");
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      }
      if (status === 2) {
        showToast("Tạm dừng thành công", "success");
        setShowDialogPause(false);
        setContentDialogPause(null);
      }

      getListBusinessProcess(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleClone = async (fromProcessId) => {
    const body = {
      fromProcessId: fromProcessId,
    };
    const response = await BusinessProcessService.clone(body);

    if (response.code === 0) {
      showToast("Sao chép quy trình thành công", "success");
      getListBusinessProcess(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Đổi trạng thái",
        icon: <Icon name="ResetPassword" className="icon-warning" />,
        callback: () => {
          //   setIdCampaign(item.id);
          //   setIsDetailCampaignDetail(true);
        },
      },
      {
        title: "Sao chép quy trình",
        icon: <Icon name="Copy" style={{ width: 18 }} />,
        callback: () => {
          showDialogConfirmClone(item);
          // handleClone(item.id)
        },
      },

      {
        title: "Cài đặt quy trình",
        icon: <Icon name="Settings" style={{ width: 18 }} />,
        callback: () => {
          navigate(`/bpm/create/${item.id}`);
          localStorage.setItem("backUpUrlProcess", JSON.stringify(params));
        },
      },
      {
        title: "Debug",
        icon: <Icon name="Debug" style={{ width: 18 }} className="icon-error" />,
        callback: () => {
          setShowDebug(item);
          setDataBusinessProcess(item);
        },
      },

      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          //   setIdCampaign(item.id);
          setShowModalAdd(true);
          setDataBusinessProcess(item);
        },
      },

      ...(item.status !== 1
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

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        BusinessProcessService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xoá quy trình  thành công", "success");
        getListBusinessProcess(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const onDelete = async (id: number) => {
    const response = await BusinessProcessService.delete(id);
    if (response.code === 0) {
      showToast("Xóa quy trình thành công", "success");
      getListBusinessProcess(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICampaignResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "quy trình " : `${listIdChecked.length} quy trình đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (listIdChecked.length > 0) {
          onDeleteAll();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const showDialogConfirmClone = (item?: ICampaignResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Sao chép...</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn sao chép quy trình {item ? <strong>{item.name}</strong> : ""}?.</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Sao chép",
      defaultAction: () => {
        handleClone(item.id);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const showDialogConfirmPause = (item?: any, status?: number) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Tạm dừng...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn tạm dừng {item ? "quy trình " : `${listIdChecked.length} quy trình đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogPause(false);
        setContentDialogPause(null);
      },
      defaultText: "Tạm dừng",
      defaultAction: () => {
        onApprove(item.id, status);
      },
    };
    setContentDialogPause(contentDialog);
    setShowDialogPause(true);
  };

  const showDialogConfirmApprove = (item?: any, status?: number) => {
    const contentDialog: IContentDialog = {
      color: "success",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Phê duyệt...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn phê duyệt {item ? "quy trình " : `${listIdChecked.length} quy trình đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}?
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      },
      defaultText: "Phê duyệt",
      defaultAction: () => {
        onApprove(item.id, status);
      },
    };
    setContentDialogApprove(contentDialog);
    setShowDialogApprove(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa quy trình",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  //danh sách quy trình

  const [valueProcess, setValueProcess] = useState(null);

  const loadOptionProcess = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BusinessProcessService.list(param);
    let optionProcess =
      page === 1
        ? [
            // {
            //   value: -1,
            //   label: "Tất cả quy trình",
            // },
          ]
        : [];

    if (response.code === 0) {
      const dataOption = response.result.items;

      if (dataOption.length > 0) {
        dataOption.map((item: any) => {
          optionProcess.push({
            value: item.id,
            label: item.name,
          });
        });
      }

      return {
        // options: [
        //   ...(dataOption.length > 0
        //     ? dataOption.map((item: ICampaignResponseModel) => {
        //         return {
        //           value: item.id,
        //           label: item.name,
        //         };
        //       })
        //     : []),
        // ],
        options: optionProcess,
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  useEffect(() => {
    loadOptionProcess("", undefined, { page: 1 });
  }, [listBusinessProcess]);

  const handleChangeValueProcess = (e) => {
    setValueProcess(e);
    setProcessId(+e.value);
    setProcessName(e.label);
    if (e.value === -1) {
      setIsRegimeKanban(false);
    }
    clearKanban();
  };

  const [dataOfStep, setDataOfStep] = useState([]);
  // const [newDataOfStep, setNewDataOfStep] = useState([]);
  const [dataOfStepStart, setDataOfStepStart] = useState([]);
  const [dataOfStepSuccess, setDataOfStepSuccess] = useState([]);

  const getDataOfStep = async (paramsSearch, stepName) => {
    // const newDataStep = [...newDataOfStep];
    const response = await BusinessProcessService.listWorkFlow(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      const newData = {
        stepId: paramsSearch.workflowId,
        stepName: stepName,
        value: result?.items,
        hasMore: result?.loadMoreAble,
        page: result?.page,
      };

      setDataOfStep((oldArray) => [...oldArray, newData]);

      // newDataStep.push(newData)
      // setNewDataOfStep(newDataStep);
      // setDataOfApproach(newDataApproach)
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataOfStepAction = async (paramsSearch, stepName) => {
    const response = await BusinessProcessService.listWorkFlow(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      let listDataOfStep = [...dataOfStep];
      const indexData = listDataOfStep.findIndex((el) => el.stepId === paramsSearch.workflowId);

      if (indexData !== -1) {
        const newData = {
          stepId: paramsSearch.workflowId,
          stepName: stepName,
          value: result?.items,
          hasMore: result?.loadMoreAble,
          page: result?.page,
        };

        listDataOfStep[indexData] = newData;
      }
      setDataOfStep(listDataOfStep);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataOfStepSpecial = async (processId, status) => {
    const param = {
      processId: processId,
      limit: 10,
      page: 1,
      workflowId: -1,
      status: status,
    };
    const response = await BusinessProcessService.listWorkFlow(param, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      if (status === 2) {
        setDataOfStepSuccess(result);
      } else {
        setDataOfStepStart(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (listStepProcess && listStepProcess.length > 0 && processId && processId !== -1) {
      listStepProcess.map((item, index) => {
        const param = {
          processId: processId,
          workflowId: item.value,
          // workflowId: -1,
          limit: 10,
          page: 1,
        };
        getDataOfStep(param, item.label);
        if (index === listStepProcess.length - 1) {
          // setNewDataOfStep([]);
        }
      });
    }
  }, [listStepProcess, processId]);

  useEffect(() => {
    getDataOfStepSpecial(processId, 0);
    getDataOfStepSpecial(processId, 2);
  }, [processId]);

  const clearKanban = () => {
    setColumnList(undefined);
  };

  return (
    <div className={`page-content page-business-process-list${isNoItem ? " bg-white" : ""}`}>
      {!hasHistorySignature ? (
        <TitleAction title={isRegimeKanban ? "Danh sách hồ sơ" : "Danh sách quy trình"} titleActions={titleActions} />
      ) : (
        <div className="action-navigation" style={hasHistorySignature ? { marginBottom: "2rem" } : {}}>
          <div className="action-backup">
            <h1
              onClick={() => {
                setHasHistorySignature(false);
              }}
              className="title-first"
              title="Quay lại"
            >
              Danh sách hồ sơ
            </h1>

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
        </div>
      )}
      <div className="card-box d-flex flex-column">
        <div className={`${!hasHistorySignature ? (!isRegimeKanban ? "d-none" : "quick__search") : "d-none"}`}>
          <div style={{ width: "45rem" }}>
            <SelectCustom
              id="processId"
              name="processId"
              fill={true}
              required={true}
              options={[]}
              value={valueProcess}
              onChange={(e) => handleChangeValueProcess(e)}
              isAsyncPaginate={true}
              placeholder="Chọn quy trình"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionProcess}
            />
          </div>
        </div>
        <div className={`${isRegimeKanban ? "d-none" : ""}`}>
          <SearchBox
            name="Tên quy trình"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />

          {!isLoading && listBusinessProcess && listBusinessProcess.length > 0 ? (
            <BoxTable
              name="Quy trình"
              titles={titles}
              items={listBusinessProcess}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              isBulkAction={true}
              bulkActionItems={bulkActionList}
              listIdChecked={listIdChecked}
              striped={true}
              setListIdChecked={(listId) => setListIdChecked(listId)}
              actions={actionsTable}
              actionType="inline"
            />
          ) : isLoading ? (
            <Loading />
          ) : (
            <Fragment>
              {isPermissions ? (
                <SystemNotification type="no-permission" />
              ) : isNoItem ? (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có quy trình nào. <br />
                      Hãy thêm mới quy trình đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới quy trình"
                  action={() => {
                    setDataBusinessProcess(null);
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

        <div className={`${!hasHistorySignature ? (isRegimeKanban ? "" : "d-none") : "d-none"}`}>
          <Kanban
            params={params}
            setParams={setParams}
            dataOfStep={dataOfStep}
            setDataOfStep={setDataOfStep}
            dataStart={dataOfStepStart}
            setDataOfStepStart={setDataOfStepStart}
            dataSuccess={dataOfStepSuccess}
            listStepProcess={listStepProcess}
            callbackHistory={(e) => {
              setHasHistorySignature(true);
              setDataObject(e);
            }}
            onReload={(reload, itemObject) => {
              if (reload) {
                if (itemObject?.status === 0 || itemObject?.status === 2) {
                  getDataOfStepSpecial(processId, itemObject?.status);
                }
                if (itemObject?.status === 1) {
                  if (listStepProcess && listStepProcess.length > 0) {
                    const dataChoosedStep = listStepProcess.find((el) => el.value === itemObject.workflowId);
                    const param = {
                      processId: processId,
                      workflowId: dataChoosedStep.value,
                      limit: 10,
                      page: 1,
                    };
                    getDataOfStepAction(param, dataChoosedStep.label);
                  }
                }
              }
            }}
          />
        </div>

        {/* <div className={`${hasHistorySignature ? "" : "d-none"}`}>
          <HistoryProcess
            // type="quote"
            onShow={hasHistorySignature}
            dataObject={dataObject}
            onHide={() => setHasHistorySignature(false)}
          />
        </div> */}
      </div>

      <ModalAddBusinessProcess
        onShow={showModalAdd}
        data={dataBusinessProcess}
        onHide={(reload) => {
          if (reload) {
            getListBusinessProcess(params);
          } else {
            setShowModalAdd(false);
            setDataBusinessProcess(null);
          }
        }}
      />
      <ModalDebugProcess
        onShow={showDebug}
        dataProcess={dataBusinessProcess}
        onHide={(reload) => {
          if (reload) {
            // getListBusinessProcess(params);
          } else {
            setShowDebug(false);
            setDataBusinessProcess(null);
          }
        }}
      />
      <ModalAddFile
        onShow={showModalAddFile}
        onHide={(reload) => {
          setShowModalAddFile(false);
          if (reload) {
          }
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDialogPause} isOpen={showDialogPause} />
      <Dialog content={contentDialogApprove} isOpen={showDialogApprove} />
    </div>
  );
}
