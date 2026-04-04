import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import moment from "moment";
import { isDifferenceObj, formatCurrency, getPageOffset, getSearchParameters, trimContent } from "reborn-util";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import "./ManagementSale.scss";
import { SelectOptionData } from "utils/selectCommon";
import { Swiper, SwiperSlide } from "swiper/react";
import { useWindowDimensions } from "utils/hookCustom";
import SelectCustom from "components/selectCustom/selectCustom";
// import AddOpportunityAllocation from "./partials/AddOpportunityAllocation";
import { ContextType, UserContext } from "contexts/userContext";
import SaleFlowService from "services/SaleFlowService";
import SaleflowApproachService from "services/SaleflowApproachService";
import SaleflowInvoiceService from "services/SaleflowInvoiceService";
import Kanban from "./partials/Kanban/Kanban";
import AddInvoiceModal from "./partials/AddInvoiceModal";
import Badge from "components/badge/badge";
import ModalDetailSaleInvoice from "./partials/ModalDetailSaleInvoice/ModalDetailSaleInvoice";
import { Grid, Navigation } from "swiper/modules";

export default function ManagementSale() {
  document.title = "Quản lý bán hàng";

  const navigate = useNavigate();
  const checkIsKanban = localStorage.getItem("isKanbanSaleflow");
  //   const checkKanbanTab = localStorage.getItem("kanbanTabOpportunity");
  const checkSaleflowId = localStorage.getItem("saleflowId");
  const checkSaleflowName = localStorage.getItem("saleflowName");

  const isMounted = useRef(false);
  const swiperPipelineRef = useRef(null);
  const swiperRelationshipRef = useRef(null);
  const { width } = useWindowDimensions();

  const [searchParams, setSearchParams] = useSearchParams();
  const [listManagementInvoice, setListManagementInvoice] = useState([]);

  const [idManagementInvoice, setIdManagementInvoice] = useState<number>(null);
  const [dataManagementInvoice, setDataManagementInvoice] = useState<number>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [idSaleFlow, setIdSaleFlow] = useState<number>(null);
  const [isDetailManagementInvoice, setIsDetailManagementInvoice] = useState<boolean>(false);

  // const [params, setParams] = useState<ICampaignOpportunityFilterRequest>({
  //   name: "",
  // });

  ///activities

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

  const takeParamsUrl = getSearchParameters();
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(checkIsKanban ? JSON.parse(checkIsKanban) : false);
  useEffect(() => {
    localStorage.setItem("isKanbanSaleflow", JSON.stringify(isRegimeKanban));
  }, [isRegimeKanban]);

  //   const [kanbanTab, setKanbanTab] = useState(checkKanbanTab ? JSON.parse(checkKanbanTab) : 1);
  //   useEffect(() => {
  //     localStorage.setItem("kanbanTabOpportunity", JSON.stringify(kanbanTab));
  //   }, [kanbanTab]);

  const [listPipeline, setListPipeline] = useState<IOption[]>([]);

  const [listApproach, setListApproach] = useState([]);
  const [listConvertRate, setListConvertList] = useState([]);

  // const [contractType, setContractType] = useState<number>(() => {
  //   return takeParamsUrl?.campaignId ? takeParamsUrl?.campaignId : -1;
  //   // return -1;
  // });

  const [saleflowId, setSaleflowId] = useState(checkSaleflowId ? JSON.parse(checkSaleflowId) : -1);

  useEffect(() => {
    localStorage.setItem("saleflowId", JSON.stringify(saleflowId));
  }, [saleflowId]);

  const [saleflowName, setSaleflowName] = useState<string>(checkSaleflowName ? checkSaleflowName : "Tất cả quy trình");

  useEffect(() => {
    localStorage.setItem("saleflowName", saleflowName);
  }, [saleflowName]);

  const [approachId, setApproachId] = useState<number>(() => {
    return takeParamsUrl?.approachId ? takeParamsUrl?.approachId : -1;
  });

  useEffect(() => {
    setParams({ ...params, saleflowId: saleflowId, approachId: -1, page: 1 });

    setApproachId(-1);
    setValueApproach(null);

    setValueSaleflow({
      value: saleflowId,
      label: saleflowName,
    });

    if (saleflowId === -1) {
      setListApproach([]);
      setListConvertList([]);
    } else {
      getOptionApproach(saleflowId);
    }
  }, [saleflowId]);

  const [params, setParams] = useState({
    name: "",
    saleflowId: -1,
    approachId: -1,
    limit: 10,
    page: 1,
  });

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      // {
      //   key: "campaignId",
      //   name: "Chiến dịch",
      //   type: "select",
      //   is_featured: true,
      //   value: searchParams.get("campaignId") ?? "",
      // },
      {
        key: "employeeId",
        name: "Nhân viên bán",
        type: "select",
        is_featured: true,
        value: searchParams.get("employeeId") ?? "",
      },
      {
        key: "customerId",
        name: "Khách hàng",
        type: "select",
        is_featured: true,
        value: searchParams.get("customerId") ?? "",
      },
    ],
    [searchParams]
  );

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Quản lý bán hàng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Cơ hội",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListManagementInvoice = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await SaleflowInvoiceService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListManagementInvoice(result.items);

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
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const [dataOfApproach, setDataOfApproach] = useState([]);
  const [dataOfApproachStart, setDataOfApproachStart] = useState([]);
  const [dataOfApproachFail, setDataOfApproachFail] = useState([]);
  const [dataOfApproachSuccess, setDataOfApproachSuccess] = useState([]);
  const [newDataOfApproach, setNewDataOfApproach] = useState([]);

  const getDataOfApproach = async (paramsSearch, approachName) => {
    const newDataApproach = [...newDataOfApproach];
    const response = await SaleflowInvoiceService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      const newData = {
        approachId: paramsSearch.approachId,
        approachName: approachName,
        value: result?.items,
        hasMore: result?.loadMoreAble,
        page: result?.page,
      };

      setDataOfApproach((oldArray) => [...oldArray, newData]);

      newDataApproach.push(newData);
      setNewDataOfApproach(newDataApproach);
      // setDataOfApproach(newDataApproach)
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataOfApproachSpecial = async (saleflowId, status) => {
    const param = {
      saleflowId: saleflowId,
      limit: 10,
      page: 1,
      approachId: -1,
      status: status,
    };
    const response = await SaleflowInvoiceService.list(param, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      if (status === 1) {
        setDataOfApproachSuccess(result);
      } else if (status === 3) {
        setDataOfApproachFail(result);
      } else {
        setDataOfApproachStart(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  // const getDataOneApproach = async(paramsSearch, approachName) => {

  //   const response = await SaleflowInvoiceService.list(paramsSearch, abortController.signal);;

  //   if (response.code === 0) {
  //     const result = response.result;
  //     const newData = {
  //       approachId: paramsSearch.approachId,
  //       approachName: approachName,
  //       value: result?.items,
  //       hasMore: result?.loadMoreAble,
  //       page: result?.page,
  //     }
  //     // setDataOfApproach((oldArray) => [...oldArray, newData])
  //     return newData
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }
  // }

  const getDataOneApproach = async (param, approachName) => {
    const response = await SaleflowInvoiceService.list(param);
    if (response.code === 0) {
      const result = response.result;

      let newDataOfApproach = [...dataOfApproach];

      const indexApproach = dataOfApproach.findIndex((el) => el.approachId === param.approachId);

      // const approachFind = newDataOfApproach.find(el => el.approachId === param.approachId)
      if (indexApproach !== -1) {
        const newData = {
          approachId: param.approachId,
          approachName: approachName,
          value: result?.items,
          hasMore: result?.loadMoreAble,
          page: result?.page,
        };

        newDataOfApproach[indexApproach] = newData;
        setDataOfApproach(newDataOfApproach);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (listApproach && listApproach.length > 0) {
      listApproach.map((item, index) => {
        const param = {
          saleflowId: saleflowId,
          approachId: item.value,
          limit: 10,
          page: 1,
        };
        getDataOfApproach(param, item.label);
        if (index === listApproach.length - 1) {
          setNewDataOfApproach([]);
        }
      });
    }
  }, [listApproach, saleflowId]);

  useEffect(() => {
    getDataOfApproachSpecial(saleflowId, 0);
    getDataOfApproachSpecial(saleflowId, 1);
    getDataOfApproachSpecial(saleflowId, 3);
  }, [saleflowId]);

  // useEffect(() => {
  //   const paramsTemp = _.cloneDeep(params);
  //   searchParams.forEach(async (key, value) => {
  //     paramsTemp[value] = key;
  //   });

  //   // setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  //   setContractType(+paramsTemp.campaignId)
  // }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListManagementInvoice(params);
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
        setSearchParams(paramsTemp as any);
      }
    }
    //tạm ẩn đi
    // return () => {
    //   abortController.abort();
    // };
  }, [params]);

  const { dataBranch } = useContext(UserContext) as ContextType;

  // ── Export Excel (FE-only, từ listManagementInvoice đã load) ─────────────
  const handleExportExcel = () => {
    if (isExporting || listManagementInvoice.length === 0) return;
    setIsExporting(true);
    try {
      const esc = (s: string) =>
        String(s ?? "—").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
      const fmtAmt = (v: any) => (Number(v) || 0).toLocaleString("vi-VN");
      const headers = ["STT","Mã hóa đơn","Ngày bán","Tổng tiền (VNĐ)","Giảm giá (VNĐ)","Đã thanh toán (VNĐ)","Công nợ (VNĐ)","Trạng thái"];
      const COL_WIDTHS = [42, 140, 140, 154, 126, 168, 126, 112];
      const colDefs = COL_WIDTHS.map(w => `<Column ss:AutoFitWidth="0" ss:Width="${w}"/>`).join("");
      const STATUS_MAP: Record<number, string> = { 1: "Hoàn thành", 4: "Chưa hoàn thành", 3: "Đã hủy" };
      const dataRows = listManagementInvoice.map((item: any, i: number) => {
        const inv = item.invoiceResponse ?? item;
        const cols = [
          String(i + 1),
          inv.invoiceCode ?? "—",
          inv.receiptDate ? new Date(inv.receiptDate).toLocaleDateString("vi-VN") : "—",
          fmtAmt(inv.amount),
          fmtAmt(inv.discount),
          fmtAmt(inv.paid),
          fmtAmt(inv.debt),
          STATUS_MAP[inv.status] ?? "—",
        ];
        const NUM = new Set([3,4,5,6]);
        const cells = cols.map((v, ci) =>
          NUM.has(ci)
            ? `<Cell ss:StyleID="numR"><Data ss:Type="Number">${esc(v.replace(/[,\.]/g,"").replace("—","0"))}</Data></Cell>`
            : `<Cell><Data ss:Type="String">${esc(v)}</Data></Cell>`
        ).join("");
        return `<Row>${cells}</Row>`;
      });
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="hdr"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#015aa4" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
  <Style ss:ID="numR"><Alignment ss:Horizontal="Right"/><NumberFormat ss:Format="#,##0"/></Style>
  <Style ss:ID="title"><Font ss:Bold="1" ss:Size="13" ss:Color="#015aa4"/></Style>
</Styles>
<Worksheet ss:Name="Quản lý bán hàng"><Table>
${colDefs}
<Row ss:Height="26"><Cell ss:MergeAcross="${headers.length-1}" ss:StyleID="title"><Data ss:Type="String">DANH SÁCH ĐƠN HÀNG ONLINE</Data></Cell></Row>
<Row ss:Height="16"><Cell ss:MergeAcross="${headers.length-1}"><Data ss:Type="String">Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</Data></Cell></Row>
<Row ss:Height="22">${headers.map(h => `<Cell ss:StyleID="hdr"><Data ss:Type="String">${esc(h)}</Data></Cell>`).join("")}</Row>
${dataRows.join("\n")}
<Row><Cell ss:MergeAcross="${headers.length-1}" ss:StyleID="title"><Data ss:Type="String">Tổng: ${listManagementInvoice.length} đơn hàng</Data></Cell></Row>
</Table></Worksheet></Workbook>`;
      const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `don_hang_online_${new Date().toISOString().slice(0,10)}.xls`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const titleActions: ITitleActions = {
    actions: [
      ...(isRegimeKanban
        ? [
            {
              title: "Quay lại",
              icon: <Icon name="ChevronLeft" />,
              callback: () => {
                setIsRegimeKanban(!isRegimeKanban);
                setApproachId(-1);
                clearKanban();
                // if(kanbanTab === 2){
                //   setContractType(listPipeline && listPipeline.length > 0 && +listPipeline[0].value);
                //   setCampaignName(listPipeline[0]?.label.toString());
                // }else {
                setParams({ ...params, approachId: -1 });
                // }

                // localStorage.removeItem("keep_position_kanban_contract");
              },
            },
            // ...(saleflowId !== -1 ?
            //   [
            //     {
            //       title: "Kết quả chiến dịch",
            //       callback: () => {
            //         // navigate(`/sales_campaign?detail=true&campaignId=${contractType}`)
            //         navigate(`/sales_campaign?branchId=${dataBranch?.value}&campaignId=${saleflowId}&detail=true`);
            //         localStorage.setItem(
            //           "backupCampaign",
            //           JSON.stringify(`/sales_campaign?branchId=${dataBranch?.value}&campaignId=${saleflowId}&detail=true`)
            //         );
            //       },
            //     }
            //   ]
            //   : []
            // )
          ]
        : [
            {
              title: "Thêm mới",
              callback: () => {
                setShowModalAdd(true);
                setIdManagementInvoice(null);
                setDataManagementInvoice(null);
              },
            },

            {
              title: isExporting ? "Đang xuất..." : "Xuất Excel",
              color: "primary" as const,
              variant: "outline" as const,
              disabled: isExporting,
              callback: handleExportExcel,
            },
            {
              title: "Kanban",
              // icon: <Icon name="Fullscreen" />,
              callback: () => {
                setIsRegimeKanban(true);
                if (saleflowId == -1) {
                  setSaleflowId(listPipeline && listPipeline.length > 0 && +listPipeline[0].value);
                  setSaleflowName(listPipeline[0]?.label.toString());
                } else {
                  setSaleflowId(saleflowId);
                  setValueApproach(null);
                  setParams({ ...params, saleflowId: saleflowId, approachId: -1 });
                }
              },
            },
          ]),
    ],
  };

  //   const titles = ["STT", "Tên chiến dịch", "Ngày kết thúc", "Khách hàng", "Người bán", "Doanh thu dự kiến", "Xác suất thành công"];

  const titles = ["STT", "Mã hóa đơn", "Ngày bán", "Tổng tiền", "VAT", "Giảm giá", "Đã thanh toán", "Trả từ thẻ", "Công nợ", "Trạng thái hóa đơn"];
  const dataFormat = ["text-center", "", "", "text-right", "text-right", "text-right", "text-right", "text-right", "text-right", "text-center"];

  //   const dataFormat = ["text-center", "", "text-center", "", "", "text-right", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.invoiceResponse?.invoiceCode,
    item.invoiceResponse?.receiptDate ? moment(item.receiptDate).format("DD/MM/YYYY") : "",
    formatCurrency(item.invoiceResponse?.amount || 0),
    0,
    formatCurrency(item.invoiceResponse?.discount || 0),
    formatCurrency(item.invoiceResponse?.paid || 0),
    formatCurrency(item.invoiceResponse?.amountCard || 0),
    formatCurrency(item.invoiceResponse?.debt || 0),
    <Badge
      key={item.id}
      text={item.invoiceResponse?.status === 1 ? "Hoàn thành" : item.invoiceResponse?.status === 4 ? "Chưa hoàn thành" : "Đã hủy"}
      variant={item.invoiceResponse?.status === 1 ? "success" : item.invoiceResponse?.status === 4 ? "warning" : "error"}
    />,
  ];

  const actionsTable = (item: any): IAction[] => {
    const activities = item.activities ? JSON.parse(item.activities) : [];

    return [
      //   ...(activities.includes("email") && item.status === 1
      //     ? [
      //         {
      //           title: "Gửi email",
      //           icon: <Icon name="EmailFill" style={{ width: 16, marginRight: 5 }} />,
      //           callback: () => {
      //             setDataCustomer({
      //               name: item.customerName,
      //               id: item.customerId,
      //             });
      //             setShowModalSendEmail(true);
      //           },
      //         },
      //       ]
      //     : []),

      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" />,
        callback: () => {
          setIdSaleFlow(item.saleflowId);
          setIdManagementInvoice(item.invoiceId);
          setDataManagementInvoice(item);
          setShowModalViewInvoice(true);
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" style={{ width: 18 }} />,
        callback: () => {
          setIdManagementInvoice(item.id);
          setDataManagementInvoice(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" style={{ width: 19 }} />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const viewDetailOpp = (campaignId, id) => {
    setIdSaleFlow(campaignId);
    setIdManagementInvoice(id);
    setIsDetailManagementInvoice(true);
  };

  const onDelete = async (id: number) => {
    const response = await SaleflowInvoiceService.delete(id);

    if (response.code === 0) {
      showToast("Xóa hoá đơn thành công", "success");
      getListManagementInvoice(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllManagementOpportunity = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        SaleflowInvoiceService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa hoá đơn thành công", "success");
        getListManagementInvoice(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "hoá đơn của quy trình " : `${listIdChecked.length} hoá đơn của quy trình`}
          {item ? <strong>{item.saleflowName}</strong> : ""}? Thao tác này không thể khôi phục.
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
          onDeleteAllManagementOpportunity();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [isOpportunityAllocation, setIsOpportunityAllocation] = useState<boolean>(false);

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa hoá đơn",
      callback: () => showDialogConfirmDelete(),
    },
    // {
    //   title: "Giao cơ hội",
    //   callback: () => setIsOpportunityAllocation(true),
    // },
  ];

  //danh sách quy trinhf

  const [valueSaleflow, setValueSaleflow] = useState(null);

  const loadOptionSaleflow = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await SaleFlowService.list(param);
    let optionSaleflow =
      page === 1
        ? [
            {
              value: -1,
              label: "Tất cả quy trình",
            },
          ]
        : [];

    if (response.code === 0) {
      const dataOption = response.result.items;

      if (dataOption.length > 0) {
        dataOption.map((item: any) => {
          optionSaleflow.push({
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
        options: optionSaleflow,
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueSaleflow = (e) => {
    setValueSaleflow(e);
    setSaleflowId(+e.value);
    setSaleflowName(e.label);
    if (e.value === -1) {
      setIsRegimeKanban(false);
    }
    clearKanban();
  };

  const getPipelineList = async () => {
    if (!listPipeline || listPipeline.length === 0) {
      const param: any = {
        limit: 1000,
      };
      const response = await SaleFlowService.list(param);
      let optionSaleflow = [];

      if (response.code === 0) {
        const dataOption = response.result.items;
        if (dataOption.length > 0) {
          dataOption.map((item: any) => {
            optionSaleflow.push({
              value: item.id,
              label: item.name,
            });
          });
        }
      }

      setListPipeline(optionSaleflow);
    }
  };

  useEffect(() => {
    getPipelineList();
  }, []);

  //call danh sách trạng thái liên hệ
  const [valueApproach, setValueApproach] = useState(null);
  const getOptionApproach = async (saleflowId) => {
    const body: any = {
      saleflowId,
    };

    const response = await SaleflowApproachService.list(body);
    if (response.code === 0) {
      const dataOption = response.result;

      setListApproach([
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
              return {
                value: item.id,
                label: item.name,
                color: colorData[index],
                // activities: item.activities,
                lstSaleflowActivity: item.lstSaleflowActivity,
                saleflowId: item.saleflowId,
                step: item.step,
              };
            })
          : []),
      ]);
    }
  };

  const handlClickOptionApproach = (e, value) => {
    // trường hợp dùng select
    // setApproachId(e.value);
    // setValueApproach(e)
    // setParams({ ...params, approachId: e.value });
    /////////

    if (value == approachId) {
      setApproachId(-1);
      setParams({ ...params, approachId: -1 });
    } else {
      setApproachId(value);
      setParams({ ...params, approachId: value });
    }
  };

  const [invoiceIdList, setInvoiceIdList] = useState([]);

  const [customerIdlist, setCustomerIdList] = useState([]);

  const [dataCustomerList, setDataCustomerList] = useState([]);

  const [columnList, setColumnList] = useState(undefined);

  const [checkColumn, setCheckColumn] = useState(null);

  useEffect(() => {
    if (invoiceIdList && invoiceIdList.length > 0) {
      let checkCustomerList = [];
      let checkDataCustomerList = [];
      invoiceIdList.map((item) => {
        if (checkCustomerList.length === 0) {
          checkCustomerList.push(item.customerId);
          checkDataCustomerList.push({
            name: item.customerName,
            id: item.customerId,
            phoneMasked: item.customerPhone,
            emailMasked: item.customerEmail,
            address: item.customerAddress,
            employeeName: item.employeeName,
            coyId: item.id,
          });
        } else {
          if (!checkCustomerList.includes(item.customerId)) {
            checkCustomerList.push(item.customerId);
            checkDataCustomerList.push({
              name: item.customerName,
              id: item.customerId,
              phoneMasked: item.customerPhone,
              emailMasked: item.customerEmail,
              address: item.customerAddress,
              employeeName: item.employeeName,
              coyId: item.id,
            });
          }
        }
      });
      setCustomerIdList(checkCustomerList);
      setDataCustomerList(checkDataCustomerList);
    } else if (invoiceIdList && invoiceIdList.length === 0) {
      setCustomerIdList([]);
      setDataCustomerList([]);
    }
  }, [invoiceIdList]);

  const clearKanban = () => {
    setInvoiceIdList([]);
    setCustomerIdList([]);
    setDataCustomerList([]);
    setColumnList(undefined);
    setCheckColumn(null);
  };

  const [showModalViewInvoice, setShowModalViewInvoice] = useState(false);

  return (
    <div className={`page-content page__management--sale${isNoItem ? " bg-white" : ""}`}>
      {!isDetailManagementInvoice && <TitleAction title="Quản lý bán hàng" titleActions={titleActions} />}

      <div className="card-box d-flex flex-column">
        <div className="quick__search">
          <div style={{ width: "30rem" }}>
            <SelectCustom
              id="saleflowId"
              name="saleflowId"
              fill={true}
              required={true}
              options={[]}
              value={valueSaleflow}
              onChange={(e) => handleChangeValueSaleflow(e)}
              isAsyncPaginate={true}
              placeholder="Chọn quy trình bán hàng"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionSaleflow}
            />
          </div>

          <div className={`${isRegimeKanban ? "d-none" : "quick__search--right"}`} style={saleflowId == -1 ? { width: "0%" } : {}}>
            {width < 1920 && width > 768 && listApproach.length > 4 ? (
              <Swiper
                className="relationship-slider"
                grid={{
                  rows: 1,
                }}
                navigation={true}
                modules={[Grid, Navigation]}
                slidesPerView={4}
                spaceBetween={5}
              >
                {listApproach.map((item, idx) => {
                  return item.label ? (
                    <SwiperSlide key={idx} className="list__relationship--slide">
                      <div
                        className={`item-relationship ${item.value == approachId ? "active__item-block" : ""}`}
                        style={{ backgroundColor: item.color, color: item.colorText }}
                        onClick={(e) => {
                          e && e.preventDefault();
                          handlClickOptionApproach(e, item.value);
                        }}
                      >
                        {item.label}
                      </div>
                    </SwiperSlide>
                  ) : null;
                })}
              </Swiper>
            ) : (
              <div className="list__relationship">
                {listApproach.map((item, idx) => {
                  return item.label ? (
                    <div
                      key={idx}
                      className={`relationship-item ${item.value == approachId ? "active__relationship--item" : ""}`}
                      style={{ backgroundColor: item.color, color: item.colorText }}
                      onClick={(e) => {
                        e && e.preventDefault();
                        handlClickOptionApproach(e, item.value);
                      }}
                    >
                      {item.label}
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
        <div className={`${isRegimeKanban ? "d-none" : ""}`}>
          <SearchBox
            name="Tên quy trình bán hàng"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            isFilter={true}
            listFilterItem={customerFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />

          {!isLoading && listManagementInvoice && listManagementInvoice.length > 0 ? (
            <BoxTable
              name="Danh sách hoá đơn"
              titles={titles}
              items={listManagementInvoice}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              striped={true}
              isBulkAction={true}
              bulkActionItems={bulkActionList}
              listIdChecked={listIdChecked}
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
                      Hiện tại chưa có hoá đơn nào. <br />
                      Hãy thêm mới hoá đơn đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới hóa đơn"
                  action={() => {
                    setShowModalAdd(true);
                    setIdManagementInvoice(null);
                    setDataManagementInvoice(null);
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

        <div className={`${isRegimeKanban ? "" : "d-none"}`}>
          <Kanban
            params={params}
            setParams={setParams}
            contractFilterList={customerFilterList}
            data={listManagementInvoice}
            dataOfApproach={dataOfApproach}
            setDataOfApproach={setDataOfApproach}
            dataStart={dataOfApproachStart}
            setDataStart={setDataOfApproachStart}
            dataFail={dataOfApproachFail}
            setDataFail={setDataOfApproachFail}
            dataSuccess={dataOfApproachSuccess}
            setDataSuccess={setDataOfApproachSuccess}
            listApproach={listApproach}
            onReload={(reload, listApproachId) => {
              if (reload) {
                // getListManagementInvoice(params)
                setDataOfApproach([]);

                if (listApproach && listApproach.length > 0) {
                  // let newDataOfApproach = []
                  listApproach.map((item) => {
                    const param = {
                      saleflowId: saleflowId,
                      approachId: item.value,
                      limit: 10,
                      page: 1,
                    };
                    getDataOfApproach(param, item.label);
                    // new Promise((resolve, reject) => {
                    //   getDataOneApproach(param, item.label).then((res) => {
                    //     newDataOfApproach.push(res);
                    //     resolve(res);
                    //   });
                    // });

                    // setDataOfApproach(newDataOfApproach)
                  });
                }
                getDataOfApproachSpecial(saleflowId, 0);
                getDataOfApproachSpecial(saleflowId, 1);
                getDataOfApproachSpecial(saleflowId, 3);

                // if(listApproachId && listApproachId.length > 0){
                //   listApproachId.map(item => {
                //     const param = {
                //       saleflowId: saleflowId,
                //       approachId: item.value,
                //       limit: 10,
                //       page: 1
                //     }

                //     getDataOneApproach(param, item.label)

                //   })
                // }
              }
            }}
            invoiceIdList={invoiceIdList}
            setInvoiceIdList={setInvoiceIdList}
            customerIdlist={customerIdlist}
            setCustomerIdList={setCustomerIdList}
            columnList={columnList}
            setColumnList={setColumnList}
            checkColumn={checkColumn}
            setCheckColumn={setCheckColumn}
            dataCustomerList={dataCustomerList}
            listConvertRate={listConvertRate}
            viewDetailOpp={viewDetailOpp}
            setShowModalAdd={setShowModalAdd}
          />
        </div>
      </div>

      <AddInvoiceModal
        onShow={showModalAdd}
        idData={idManagementInvoice}
        dataInvoice={dataManagementInvoice}
        saleflowId={saleflowId}
        onHide={(reload) => {
          if (reload) {
            getListManagementInvoice(params);
            // setDataOfApproach([]);
            // if(listApproach && listApproach.length > 0){
            //   listApproach.map(item => {
            //     const param = {
            //       saleflowId: saleflowId,
            //       approachId: item.value,
            //       limit: 10,
            //       page: 1
            //     }
            //     getDataOfApproach(param, item.label)
            //   })
            // }
            getDataOfApproachSpecial(saleflowId, 0);
            // getDataOfApproachSpecial(saleflowId, 1);
            // getDataOfApproachSpecial(saleflowId, 3);
          }
          setShowModalAdd(false);
        }}
      />

      {/* <ModalDetailSaleInvoice
        idInvoice={idManagementInvoice} 
        onShow={showModalViewInvoice} 
        onHide={() => setShowModalViewInvoice(false)} 
      /> */}

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}