/* eslint-disable prefer-const */
import React, { Fragment, useState, useEffect, useMemo, useRef, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem } from "model/OtherModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ICashbookFilterRequest } from "model/cashbook/CashbookRequestModel";
import { ICashBookResponse } from "model/cashbook/CashbookResponseModel";
import { showToast } from "utils/common";
import { formatCurrency, isDifferenceObj } from "reborn-util";
import AddCashBookModal from "./partials/AddCashBookModal";
import CashbookService from "services/CashbookService";
import { getPermissions } from "utils/common";
import LoadingUpload from "components/loadingUpload/loadingUpload";
import ExportListModal from "pages/Common/ExportListModal/ExportListModal";
import { downloadDataUrlFromJavascript, getPageOffset, getSearchParameters } from "reborn-util";
import "./CashBookList.scss";
import { ContextType, UserContext } from "contexts/userContext";

export default function CashBookList() {
  document.title = "Tài chính";

  const isMounted = useRef(false);
  const checkUserRoot = localStorage.getItem("user.root");
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalCashBook, setShowModalCashBook] = useState<boolean>(false);
  const [dataCashBook, setDataCashBook] = useState<ICashBookResponse>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [listCashBook, setListCashBook] = useState<ICustomerResponse[]>([]);
  const [listCashBookTotal, setListCashBookTotal] = useState<any>({});
  const [typeProps, setTypeProps] = useState<number>(0);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalExport, setShowModalExport] = useState<boolean>(false);
  const [showModalLoading, setShowModalLoading] = useState<boolean>(false);

  //Định nghĩa cho thu chi tồn
  const [listReportCashBook, setListReportCashBook] = useState<ICustomerResponse[]>([]);

  //Dư đầu kì
  const [prevBalance, setPrevBalance] = useState<number>(0);

  //Dư cuối kì
  const [posBalance, setPosBalance] = useState<number>(0);

  //Tổng tiền trước đó
  const [prevTotalByPage, setPrevTotalByPage] = useState<number>(0);

  const [tab, setTab] = useState({
    name: "tab_one",
    type: 1,
  });

  const [params, setParams] = useState<ICashbookFilterRequest>({
    keyword: "",
    fromTime: "",
    type: tab.type,
  });

  useEffect(() => {
    //Note: đoạn set lại state này với mục đích là khi mà mình chuyển tab thì nó sẽ tự update lại type
    setParams({ ...params, type: tab.type });
  }, [tab]);

  const listTabs = [
    {
      title: "Lịch sử thu chi",
      is_active: "tab_one",
      type: 1,
    },
    {
      title: "Thu chi tồn",
      is_active: "tab_two",
      type: 2,
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Lịch sử thu chi",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  useEffect(() => {
    setPagination({ ...pagination, name: `${tab.type == 1 ? "Lịch sử thu chi" : "Báo cáo thu chi"}` });
  }, [tab]);

  const cashbookFilterList = useMemo(
    () =>
      [
        // ...(+checkUserRoot == 1 ? [
        //     {
        //       key: "branchId",
        //       name: "Chi nhánh",
        //       type: "select",
        //       is_featured: true,
        //       value: searchParams.get("branchId") ?? "",
        //     },
        //   ] : []
        // ),
        {
          key: "time_cashbook",
          name: "Thời gian",
          type: "date-two",
          param_name: ["fromTime", "toTime"],
          is_featured: true,
          value: searchParams.get("fromTime") ?? "",
          value_extra: searchParams.get("toTime") ?? "",
          is_fmt_text: true,
        },
        {
          key: "categoryId",
          name: "Trạng thái",
          type: "select",
          is_featured: true,
          value: searchParams.get("categoryId") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  const reportFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_cashbook",
        name: "Thời gian",
        type: "date-two",
        param_name: ["fromTime", "toTime"],
        is_featured: true,
        value: searchParams.get("fromTime") ?? "",
        value_extra: searchParams.get("toTime") ?? "",
        is_fmt_text: true,
      },
      // {
      //   key: "branchId",
      //   name: "Chi nhánh",
      //   type: "select",
      //   is_featured: true,
      //   value: searchParams.get("branchId") ?? "",
      // },
    ],
    [searchParams]
  );

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const getListCashBook = async (paramsSearch: ICashbookFilterRequest) => {
    setIsLoading(true);
    const response = await CashbookService.list(paramsSearch);

    if (response.code === 0) {
      const totalCashBook = response.result;
      const result = response.result.cashbookResponse;
      setListCashBookTotal({ totalRevenue: totalCashBook.totalPos, totalExpenditure: totalCashBook.totalNav });
      setListCashBook(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && !params.keyword && +result.page === 1) {
        setIsNoItem(true);
      }
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

  const takeParamsUrl = getSearchParameters();

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      //! đoạn này viết chung dính 1 trường hợp call api 2 lần cùng nhau, bh có thời gian refactor lại sau
      tab.type == 1 && takeParamsUrl?.type == 1 ? getListCashBook(params) : getListCashBookReport(params);

      const paramsTemp = _.cloneDeep(params);

      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }

      Object.keys(paramsTemp).map((key) => {
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
      permissions["CASHBOOK_ADD"] == 1 && {
        title: "Thêm phiếu thu",
        callback: () => {
          setDataCashBook(null);
          setTypeProps(1);
          setShowModalCashBook(true);
        },
      },
      permissions["CASHBOOK_ADD"] == 1 && {
        title: "Thêm phiếu chi",
        callback: () => {
          setDataCashBook(null);
          setTypeProps(2);
          setShowModalCashBook(true);
        },
      },
    ],
  };

  const titles = ["STT", "Người thực hiện", "Thời gian", "Loại", "Ghi chú", "Số tiền"];

  const dataMappingArray = (item: ICashBookResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.empName,
    moment(item.transDate).format("DD/MM/YYYY HH:mm"),
    item.categoryName,
    item.note,
    formatCurrency(item.amount),
  ];

  const dataFormat = ["text-center", "", "text-center", "", "", "text-right"];

  const actionsTable = (item: ICashBookResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["CASHBOOK_UPDATE"] == 1 && {
        title: `Sửa phiếu ${item.type == 1 ? "thu" : "chi"}`,
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setDataCashBook(item);
            setTypeProps(item.type);
            setShowModalCashBook(true);
          }
        },
      },
      permissions["CASHBOOK_DELETE"] == 1 && {
        title: `Xóa phiếu ${item.type == 1 ? "thu" : "chi"}`,
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            showDialogConfirmDelete(item);
          }
        },
      },
    ];
  };

  const onDeleteAll = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    const arrPromises = selectedIds.map((selectedId) => {
      const found = listCashBook.find((item) => item.id === selectedId);
      if (found?.id) {
        return CashbookService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
      .then((results) => {
        const checkbox = results.filter(Boolean)?.length || 0;
        if (checkbox > 0) {
          showToast(`Xóa thành công`, "success");
          getListCashBook(params);
          setListIdChecked([]);
        } else {
          showToast("Không có thu/chi nào được xóa", "error");
        }
      })
      .finally(() => {
        setShowDialog(false);
        setContentDialog(null);
      });
  };

  const showDialogConfirmDelete = (item?: ICashBookResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? `${item.type === 1 ? "phiếu thu" : "phiếu chi"}` : `${listIdChecked.length} phiếu đã chọn`}? Thao tác này
          không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (item?.id) {
          onDelete(item.id);
          return;
        }
        if (listIdChecked.length > 0) {
          onDeleteAll();
          return;
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const onDelete = async (id: number) => {
    const response = await CashbookService.delete(id);

    if (response.code === 0) {
      showToast(`Xóa phiếu thành công`, "success");
      getListCashBook(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["CASHBOOK_DELETE"] == 1 && {
      title: "Xóa phiếu",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  /**
   * Giao diện vùng Lịch sử thu chi
   * @returns
   */
  const componentCashbook = () => {
    return (
      <Fragment>
        <div className="card-box d-flex flex-column">
          <div className="action-header">
            <div className="title__actions">
              <ul className="menu-list">
                {listTabs.map((item, idx) => (
                  <li
                    key={idx}
                    className={item.is_active == tab.name ? "active" : ""} // đoạn này cần set nốt đk là xong thôi
                    onClick={(e) => {
                      e && e.preventDefault();
                      setTab({ name: item.is_active, type: item.type });
                    }}
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
            <SearchBox
              key={"cashbook"}
              name="Danh sách thu chi"
              placeholderSearch="Tìm kiếm theo Ghi chú"
              params={params}
              isFilter={true}
              listFilterItem={cashbookFilterList}
              updateParams={(paramsNew) => setParams(paramsNew)}
            />
          </div>
          {!isLoading && listCashBook && listCashBook.length > 0 ? (
            <BoxTable
              key={"cashbook"}
              name="Danh sách thu chi"
              titles={titles}
              items={listCashBook}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              striped={true}
              isBulkAction={true}
              listIdChecked={listIdChecked}
              isActivity={true}
              bulkActionItems={bulkActionList}
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
                      Hiện tại chưa có phiếu thu/chi nào. <br />
                      Hãy thêm mới phiếu thu/chi đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới danh sách thu chi"
                  action={() => {
                    setDataCashBook(null);
                    setShowModalCashBook(true);
                  }}
                />
              ) : (
                <SystemNotification
                  description={
                    <span>
                      Không có dữ liệu trùng khớp. <br />
                      Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                    </span>
                  }
                  type="no-result"
                />
              )}
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  };

  const titlesReport = ["STT", "Ngày tháng", "Nội dung", "Thu", "Chi", "Tồn"];

  const dataMappingArrayReport = (item: ICashBookResponse, index: number) => [
    getPageOffset(params) + index + 1,
    moment(item.transDate).format("DD/MM/YYYY HH:mm"),
    item.note,
    item.type == 1 ? formatCurrency(item.amount) : "",
    item.type == 2 || item.type == -1 ? formatCurrency(item.amount) : "",
    formatCurrency(item.remaining),
  ];

  const dataFormatReport = ["text-center", "text-center", "", "text-right", "text-right", "text-right"];

  /**
   * Danh sách thu chi tồn ...
   * @param paramsSearch
   */
  const getListCashBookReport = async (paramsSearch: ICashbookFilterRequest) => {
    setIsLoading(true);
    const response = await CashbookService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result.cashbookResponse;
      setPrevBalance(response.result.prevBalance);
      setPosBalance(response.result.posBalance);
      setPrevTotalByPage(response.result.prevTotalByPage);

      //Tính toán tồn tạm thời trên từng bản ghi
      let total = +response.result.prevBalance + +response.result.prevTotalByPage;
      let arr = (result.items || []).map((item, idx) => {
        if (item.type == 1) {
          total += +item.amount;
        } else {
          total += -+item.amount;
        }

        item.remaining = total;
        return item;
      });
      setListReportCashBook(arr);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && params.keyword === "" && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  /**
   * Xuất báo cáo thu - chi - tồn
   * @param paramsSearch
   */
  const exportCashBookReport = async (paramsSearch: ICashbookFilterRequest) => {
    setShowModalLoading(true);

    const response = await CashbookService.export(paramsSearch);
    if (response.code === 0) {
      //Link tải file
      const result = response.result;
      downloadDataUrlFromJavascript(`cashbook-${new Date().toString()}.xlsx`, result);
      showToast("Xuất báo cáo thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowModalLoading(false);
  };

  /**
   * Giao diện vùng Thu chi tồn
   * @returns
   */
  const componentReport = () => {
    return (
      <Fragment>
        <div className="card-box d-flex flex-column">
          <div className="action-header">
            <div className="title__actions">
              <ul className="menu-list">
                {listTabs.map((item, idx) => (
                  <li
                    key={idx}
                    className={item.is_active == tab.name ? "active" : ""}
                    onClick={(e) => {
                      e && e.preventDefault();
                      setTab({ name: item.is_active, type: item.type });
                    }}
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
            <SearchBox
              key={"report"}
              name="Báo cáo thu chi"
              placeholderSearch="Tìm kiếm theo Ghi chú"
              params={params}
              isFilter={true}
              listFilterItem={reportFilterList}
              updateParams={(paramsNew) => setParams(paramsNew)}
              disabledTextInput={true}
            />
          </div>
          {!isLoading && listReportCashBook && listReportCashBook.length > 0 ? (
            <BoxTable
              key={"report"}
              name="Thu chi tồn"
              titles={titlesReport}
              items={listReportCashBook}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArrayReport(item, index)}
              dataFormat={dataFormatReport}
              striped={true}
              isBulkAction={true}
              listIdChecked={listIdChecked}
              isActivity={true}
              bulkActionItems={[]}
              setListIdChecked={(listId) => setListIdChecked(listId)}
              actions={[] as any}
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
                      Hiện tại chưa có phiếu thu/chi nào. <br />
                      Hãy thêm mới phiếu thu/chi đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới phiếu thu/chi"
                  action={() => {
                    setDataCashBook(null);
                    setShowModalCashBook(true);
                  }}
                />
              ) : (
                <SystemNotification
                  description={
                    <span>
                      Không có dữ liệu trùng khớp. <br />
                      Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                    </span>
                  }
                  type="no-result"
                />
              )}
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  };

  return (
    <div className={`page-content cashbook${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Tài chính" titleActions={titleActions} />
      {tab.type == 1 ? (
        <div className="cashbook__total type__one">
          <div className="cashbook__total--revenue">
            Tổng thu: <span>{formatCurrency(listCashBookTotal.totalRevenue)}</span>
          </div>
          <div className="cashbook__total--expenditure">
            Tổng chi: <span>{formatCurrency(listCashBookTotal.totalExpenditure)}</span>
          </div>
        </div>
      ) : (
        <div className="cashbook__total type__two">
          <div className="cashbook__total--export-revenue">
            <span
              onClick={() => {
                setShowModalExport(true);
              }}
            >
              <Icon name="Download" /> Xuất báo cáo
            </span>
          </div>
          <div className={`cashbook__total--${prevBalance >= 0 ? "revenue" : "expenditure"}`}>
            Tồn đầu kỳ: <span>{formatCurrency(prevBalance)}</span>
          </div>
          <div className={`cashbook__total--${posBalance >= 0 ? "revenue" : "expenditure"}`}>
            Tồn cuối kỳ: <span>{formatCurrency(posBalance)}</span>
          </div>
        </div>
      )}

      {tab.type == 1 && takeParamsUrl?.type == 1 ? componentCashbook() : componentReport()}

      <AddCashBookModal
        onShow={showModalCashBook}
        dataCashBook={dataCashBook}
        type={typeProps}
        onHide={(reload) => {
          if (reload) {
            getListCashBook(params);
          }
          setShowModalCashBook(false);
        }}
      />

      <ExportListModal
        code="cashbook"
        onShow={showModalExport}
        onHide={() => setShowModalExport(false)}
        exampleFile="https://cdn.reborn.vn/2023/04/18/a283bb81-666a-4b44-afd3-c22460dd760a-1681809889.xlsx"
        chooseTemplate={(template) => {
          params.template = template;
          exportCashBookReport(params);
        }}
      />

      <LoadingUpload onShow={showModalLoading} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
