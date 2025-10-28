import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import moment from "moment";
import { isDifferenceObj, trimContent, getPageOffset } from "reborn-util";
import { useSearchParams } from "react-router-dom";
import { ExportExcel } from "exports";
import { ExportTreatmentHistoryExcel } from "exports/treatmentHistory";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import ExportModal from "components/exportModal/exportModal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { ITreatmentHistoryFilterRequest } from "model/treatmentHistory/TreatmentHistoryRequestModel";
import { ITreatmentHistoryResponseModel } from "model/treatmentHistory/TreatmentHistoryResponseModel";
import TreatmentHistoryService from "services/TreatmentHistoryService";
import { showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import AddTreamentHistoryModal from "./partials/AddTreamentHistoryModal/AddTreamentHistoryModal";
import ViewDetailTreamentHistoryModal from "./partials/ViewDetailTreamentHistoryModal/ViewDetailTreamentHistoryModal";
import "tippy.js/animations/scale.css";

export default function TreatmentHistoryList() {
  document.title = "Lịch sử điều trị";

  const isMounted = useRef(false);

  const { name, avatar, dataBranch } = useContext(UserContext) as ContextType;
  const checkUserRoot = localStorage.getItem("user.root");

  const [searchParams, setSearchParams] = useSearchParams();
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [listTreatmentHistory, setListTreatmentHistory] = useState<ITreatmentHistoryResponseModel[]>([]);
  const [dataTreatmentHistory, setDataTreatmentHistory] = useState<ITreatmentHistoryResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalView, setShowModalView] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [params, setParams] = useState<ITreatmentHistoryFilterRequest>({
    keyword: "",
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách lịch sử điều trị",
      is_active: true,
    },
  ]);

  const customerFilterList = useMemo(
    () =>
      [
        // ...(+checkUserRoot == 1
        //   ? [
        //       {
        //         key: "branchId",
        //         name: "Chi nhánh",
        //         type: "select",
        //         is_featured: true,
        //         value: searchParams.get("branchId") ?? "",
        //       },
        //     ]
        //   : []),
        {
          key: "time_buy",
          name: "Khoảng thời gian",
          type: "date-two",
          param_name: ["startDate", "endDate"],
          is_featured: true,
          value: searchParams.get("startDate") ?? "",
          value_extra: searchParams.get("endDate") ?? "",
          is_fmt_text: true,
        },

        {
          key: "serviceId",
          name: "Dịch vụ",
          type: "select",
          is_featured: true,
          value: searchParams.get("serviceId") ?? "",
        },
        {
          key: "employeeId",
          name: "Nhân viên",
          type: "select",
          is_featured: true,
          value: searchParams.get("employeeId") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Lịch điều trị",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTreatmentHistory = async (paramsSearch: ITreatmentHistoryFilterRequest) => {
    setIsLoading(true);

    const response = await TreatmentHistoryService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListTreatmentHistory(result.items);
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
      getListTreatmentHistory(params);
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
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);
  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả hóa đơn",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} lịch sử phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, params]
  );

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          setDataTreatmentHistory(null);
          setShowModalAdd(true);
        },
      },
    ],
    actions_extra: [
      {
        title: "Xuất danh sách",
        icon: <Icon name="Download" />,
        callback: () => {
          setOnShowModalExport(true);
        },
      },
    ],
  };

  const titles = ["STT", "Khách hàng", "Dịch vụ", "Thời gian", "Nhân viên thực hiện", "Nội dung thực hiện"];

  const dataFormat = ["text-center", "", "", "", "", ""];

  const dataSize = ["auto", "auto", "auto", 14, "auto", "auto"];

  const dataMappingArray = (item: ITreatmentHistoryResponseModel, index?: number, type?: string) =>
    type !== "export"
      ? [
          getPageOffset(params) + index + 1,
          item.customerName,
          item.serviceName,
          <div key={item.id} className="d-flex align-items-start flex-column">
            <span>{`${moment(item.treatmentStart).format("DD/MM/YYYY HH:mm")} - `}</span>
            <span>{moment(item.treatmentEnd).format("DD/MM/YYYY HH:mm")}</span>
          </div>,
          item.employeeName,
          item.procDesc?.length > 120 ? (
            <Tippy content={item.procDesc} delay={[120, 100]} animation="scale">
              <p className="content">{trimContent(item.procDesc, 120, true, true)}</p>
            </Tippy>
          ) : (
            item.procDesc
          ),
        ]
      : [
          getPageOffset(params) + index + 1,
          item.customerName,
          item.serviceName,
          `${moment(item.treatmentStart).format("DD/MM/YYYY HH:mm")} - ${moment(item.treatmentEnd).format("DD/MM/YYYY HH:mm")}`,
          item.employeeName,
          item.procDesc,
        ];

  const [employeeDoList, setEmployeeDoList] = useState([]);
  const [customerDoList, setCustomerDoList] = useState([]);

  useEffect(() => {
    if (listTreatmentHistory && Array.isArray(listTreatmentHistory) && listTreatmentHistory.length > 0) {
      const newArray = [];
      const newCustomerArray = [];
      listTreatmentHistory.map((item, index) => {
        // newArray.push({employeeName: item.employeeName, employeeId: item.employeeId, })

        ///Lọc lấy danh sách nhân viên
        if (newArray.length === 0) {
          newArray.push({ employeeName: item.employeeName, employeeId: item.employeeId });
        } else if (newArray.length > 0 && newArray.filter((el) => el.employeeId === item.employeeId).length === 0) {
          newArray.push({ employeeName: item.employeeName, employeeId: item.employeeId });
        }

        ///Lọc lấy danh sách khách hàng
        if (newCustomerArray.length === 0) {
          newCustomerArray.push({ customerName: item.customerName, customerId: item.customerId });
        } else if (newCustomerArray.length > 0 && newCustomerArray.filter((el) => el.customerId === item.customerId).length === 0) {
          newCustomerArray.push({ customerName: item.customerName, customerId: item.customerId });
        }
      });

      ///Lọc và thêm trường danh sách các dịch vụ 1 nhân viên đã làm
      if (newArray && newArray.length > 0) {
        newArray.map((item, index) => {
          const filterArray = listTreatmentHistory.filter((el) => el.employeeId === item.employeeId) || [];
          const filterNewArray = [];
          const filterQuantity = [];
          filterArray.length &&
            filterArray.map((e, index) => {
              filterQuantity.push(e);

              //Lọc nếu trùng dịch vụ thì chỉ lấy 1 dịch vụ
              if (filterNewArray.length === 0) {
                filterNewArray.push(e);
              } else if (filterNewArray.length > 0 && filterNewArray.filter((it) => it.serviceId === e.serviceId).length === 0) {
                filterNewArray.push(e);
              }

              filterNewArray &&
                filterNewArray.length > 0 &&
                filterNewArray.map((item, index) => {
                  const serviceCount = filterQuantity.filter((el) => el.serviceId === item.serviceId).length;
                  filterNewArray[index] = {
                    serviceId: item.serviceId,
                    serviceName: item.serviceName,
                    employeeId: item.employeeId,
                    employeeName: item.employeeName,
                    serviceCount: serviceCount,
                  };
                });
            });
          newArray[index] = { employeeName: item.employeeName, employeeId: item.employeeId, listService: filterNewArray };
        });
      }

      ///Lọc và thêm trường danh sách các dịch vụ 1 khách hàng đã được làm
      if (newCustomerArray && newCustomerArray.length > 0) {
        newCustomerArray.map((item, index) => {
          const filterArray = listTreatmentHistory.filter((el) => el.customerId === item.customerId) || [];

          const filterNewArray = [];
          const filterQuantity = [];
          filterArray.length &&
            filterArray.map((e, index) => {
              filterQuantity.push({ serviceId: e.serviceId, serviceName: e.serviceName, employeeId: e.employeeId, employeeName: e.employeeName });

              //Lọc nếu trùng dịch vụ và trùng nv làm thì chỉ lấy 1 dịch vụ
              if (filterNewArray.length === 0) {
                filterNewArray.push({ serviceId: e.serviceId, serviceName: e.serviceName, employeeId: e.employeeId, employeeName: e.employeeName });
              } else if (
                filterNewArray.length > 0 &&
                filterNewArray.filter((it) => it.serviceId === e.serviceId && it.employeeId === e.employeeId).length === 0
              ) {
                filterNewArray.push({ serviceId: e.serviceId, serviceName: e.serviceName, employeeId: e.employeeId, employeeName: e.employeeName });
              }

              filterNewArray &&
                filterNewArray.length > 0 &&
                filterNewArray.map((item, index) => {
                  const serviceCount = filterQuantity.filter((el) => el.serviceId === item.serviceId && el.employeeId === item.employeeId).length;
                  filterNewArray[index] = {
                    serviceId: item.serviceId,
                    serviceName: item.serviceName,
                    employeeId: item.employeeId,
                    employeeName: item.employeeName,
                    serviceCount: serviceCount,
                  };
                });
            });
          newCustomerArray[index] = { customerName: item.customerName, customerId: item.customerId, listService: filterNewArray };
        });
      }

      setEmployeeDoList(newArray);
      setCustomerDoList(newCustomerArray);
    }
  }, [listTreatmentHistory]);

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await TreatmentHistoryService.list({
        ...params,
        startDate: params.startDate ? params.startDate : moment().startOf("month").format("DD/MM/yyyy"),
        endDate: params.endDate ? params.endDate : moment().endOf("month").format("DD/MM/yyyy"),
        page: type === "current_page" ? 1 : params.page,
        limit: type === "all" || type === "current_search" ? 10000 : params.limit,
      });

      if (response.code === 0) {
        const result = response.result.items;

        const beautySalon = {
          avatar,
        };

        if (extension === "excel") {
          ExportTreatmentHistoryExcel(
            {
              fileName: "LichSuDieuTri",
              title: "Lịch sử điều trị",
              header: [],
              data: [],
              info: { name },
            },
            beautySalon
          );
          // ExportExcel({
          //   fileName: "LichSuDieuTri",
          //   title: "Lịch sử điều trị",
          //   header: titles,
          //   data: result.map((item, idx) => dataMappingArray(item, idx, "export")),
          //   info: { name },
          // });
        }
        showToast("Xuất file thành công", "success");
        setOnShowModalExport(false);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
        setOnShowModalExport(false);
      }
    },
    [params]
  );

  const actionsTable = (item: ITreatmentHistoryResponseModel): IAction[] => {
    return [
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" />,
        callback: () => {
          setDataTreatmentHistory(item);
          setShowModalView(true);
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataTreatmentHistory(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await TreatmentHistoryService.delete(id);
    if (response.code === 0) {
      showToast("Xóa lịch sử điều trị thành công", "success");
      getListTreatmentHistory(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = async () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        TreatmentHistoryService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa lịch sử điều trị thành công", "success");
        getListTreatmentHistory(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: ITreatmentHistoryResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "lịch sử điều trị " : `${listIdChecked.length} lịch sử điều trị đã chọn`}
          {item ? <strong>{item.serviceName}</strong> : ""}? Thao tác này không thể khôi phục.
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

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa lịch sử điều trị",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-treatment--history${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Lịch sử điều trị" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên, số điện thoại hoặc mã khách hàng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />

        {!isLoading && listTreatmentHistory && listTreatmentHistory.length > 0 ? (
          <BoxTable
            name="Lịch sử điều trị"
            titles={titles}
            items={listTreatmentHistory}
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
            dataSize={dataSize}
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
                    Hiện tại chưa có lịch sử điều trị nào. <br />
                    Hãy thêm mới lịch sử điều trị đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới lịch sử điều trị"
                action={() => {
                  setDataTreatmentHistory(null);
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
      <AddTreamentHistoryModal
        onShow={showModalAdd}
        data={dataTreatmentHistory}
        onHide={(reload) => {
          if (reload) {
            getListTreatmentHistory(params);
          }
          setShowModalAdd(false);
        }}
      />
      <ExportModal
        name="Lịch sử điều trị"
        onShow={onShowModalExport}
        onHide={() => setOnShowModalExport(false)}
        options={optionsExport}
        callback={(type, extension) => exportCallback(type, extension)}
      />
      <ViewDetailTreamentHistoryModal onShow={showModalView} data={dataTreatmentHistory} onHide={() => setShowModalView(false)} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
