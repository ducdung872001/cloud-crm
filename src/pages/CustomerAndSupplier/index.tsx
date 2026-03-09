/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { getSearchParameters, getPageOffset, getDomain } from "reborn-util";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import { ExportExcel } from "exports";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { useOnClickOutside, useWindowDimensions } from "utils/hookCustom";
import { showToast, getPermissions } from "utils/common";
import { formatCurrency, isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { IOption } from "model/OtherModel";
import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";
import { IRelationShipResposne } from "model/relationShip/RelationShipResposne";
import { UserContext, ContextType } from "contexts/userContext";
import UpdateCommon from "./partials/UpdateCommon";
import AddCustomerPersonModal from "./partials/AddCustomerPersonModal";
import AddEditSendSMS from "pages/Common/AddEditSendSMS/AddEditSendSMS";
import RelationShipService from "services/RelationShipService";
import RecoverPublicDebts from "pages/Common/RecoverPublicDebts";
import ImportModal from "components/importModalBackup";
import AddBTwoBModal from "./partials/AddBTwoBModal";
import ViewOpportunityBTwoB from "./partials/ViewOpportunityBTwoB";
import "swiper/css/grid";
import "swiper/css/navigation";
import "./index.scss";
import BoxTableAdvanced from "components/boxTableAdvanced/boxTableAdvanced";
import Input from "components/input/input";
import AddCustomerCompanyModal from "./partials/AddCustomerCompanyModal";
import AddEditSendEmail from "pages/Common/AddEditSendEmail/AddEditSendEmail";
import PermissionService from "services/PermissionService";
import ModalExportCustomer from "./ModalExportCustomer/ModalExportCustomer";
import { StyleHeaderTable } from "components/StyleHeaderTable/StyleHeaderTable";

export default function CustomerAndSupplier() {
  const [showPageSendSMS, setShowPageSendSMS] = useState<boolean>(false);
  const [showPageSendEmail, setShowPageSendEmail] = useState<boolean>(false);
  const [activeTitleHeader, setActiveTitleHeader] = useState(1);
  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const takeUrlFilterAdvance = (localStorage.getItem("filterAdvance") && JSON.parse(localStorage.getItem("filterAdvance"))) || null;

  document.title = `${
    showPageSendEmail ? "Gửi email" : showPageSendSMS ? "Gửi SMS" : activeTitleHeader === 1 ? "Danh sách khách hàng" : "Phân tích nguồn khách hàng"
  }`;

  const navigate = useNavigate();

  const { name, avatar, dataBranch, email } = useContext(UserContext) as ContextType;
  const checkCustType = localStorage.getItem("customer.custType");
  const targetBsnId_customer = localStorage.getItem("targetBsnId_customer");
  const [searchParams, setSearchParams] = useSearchParams();

  const [listCustomer, setListCustomer] = useState<ICustomerResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalDebt, setShowModalDebt] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalAddManagementOpportunity, setShowModalAddManagementOpportunity] = useState<boolean>(false);
  const [showModalImport, setShowModalImport] = useState<boolean>(false);
  const takeParamsUrl = getSearchParameters();

  //! đoạn này call API mối quan hệ khách hàng
  const [listRelationship, setListRelationship] = useState<IRelationShipResposne[]>([]);
  // biến này tạo ra với mục đích tìm kiếm nhanh
  const [contactType, setContactType] = useState<number>(() => {
    return takeParamsUrl?.contactType ? takeParamsUrl?.contactType : -1;
  });

  const [cityId, setCityId] = useState<number>(() => {
    return takeParamsUrl?.cityId ? takeParamsUrl?.cityId : "";
  });

  const [listPartner, setListPartner] = useState([]);
  const [targetBsnId, setTargetBsnId] = useState(targetBsnId_customer ? +targetBsnId_customer : null);
  useEffect(() => {
    localStorage.setItem("targetBsnId_customer", JSON.stringify(targetBsnId));
  }, [targetBsnId]);

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

  const [idCustomer, setIdCustomer] = useState<number>(null);
  const [idxCustomer, setIdxCustomer] = useState<number>(null);
  const [isShowPhone, setIsShowPhone] = useState<boolean>(false);
  const [valueShowPhone, setValueShowPhone] = useState<string>("");

  //modal chia data khách hàng TNEX
  const [filterAdvance, setFilterAdvance] = useState(() => {
    return (takeParamsUrl.sourceIds || takeParamsUrl.employeeIds || takeParamsUrl.callStatuses || takeParamsUrl.customerExtraInfo) &&
      takeUrlFilterAdvance
      ? takeUrlFilterAdvance
      : {
          employeeIds: [],
          sourceIds: [],
          callStatuses: [],
          customerExtraInfo: [],
        };
  });

  useEffect(() => {
    // if (filterAdvance.employeeIds.length > 0 || filterAdvance.sourceIds.length > 0 || filterAdvance.callStatuses.length > 0) {
    const newParam = { ...params };
    if (filterAdvance.sourceIds?.length === 0) {
      delete newParam.sourceIds;
    }
    if (filterAdvance.employeeIds?.length === 0) {
      delete newParam.employeeIds;
    }
    if (filterAdvance.callStatuses?.length === 0) {
      delete newParam.callStatuses;
    }
    if (
      filterAdvance.customerExtraInfo?.length === 0 &&
      !(
        takeParamsUrl.customerExtraInfo &&
        (takeParamsUrl.Trangthaikhoanvaycashloan ||
          takeParamsUrl.Trangthaikhoanvaycreditline ||
          takeParamsUrl.TrangThaiKhoanVayTBoss ||
          takeParamsUrl.TrangthaiOnboard ||
          takeParamsUrl.LyDo ||
          takeParamsUrl.marketingSendLeadSource)
      )
    ) {
      delete newParam.customerExtraInfo;
    }

    const employeeIds = filterAdvance.employeeIds.map((item) => item.value) || [];
    const sourceIds = filterAdvance.sourceIds.map((item) => item.value) || [];
    const callStatuses = filterAdvance.callStatuses.map((item) => item.value) || [];
    const customerExtraInfo = filterAdvance.customerExtraInfo || [];

    setParams({
      ...newParam,
      ...(employeeIds?.length > 0 ? { employeeIds: JSON.stringify(employeeIds) } : {}),
      ...(sourceIds?.length > 0 ? { sourceIds: JSON.stringify(sourceIds) } : {}),
      ...(callStatuses?.length > 0 ? { callStatuses: JSON.stringify(callStatuses) } : {}),
      ...(customerExtraInfo?.length > 0 ? { customerExtraInfo: JSON.stringify(customerExtraInfo) } : {}),
    });

    localStorage.setItem("filterAdvance", JSON.stringify(filterAdvance));

    // }
  }, [filterAdvance]);

  const isMounted = useRef(false);

  const [params, setParams] = useState<ICustomerSchedulerFilterRequest>({
    keyword: "",
    contactType,
  });

  const [paramsCustomerPartner, setParamsCustomerPartner] = useState({
    name: "",
    limit: 10,
    page: 1,
    targetBsnId: null,
  });

  useEffect(() => {
    setCityId(takeParamsUrl?.cityId ? takeParamsUrl?.cityId : "");
  }, [params, takeParamsUrl]);

  const getListRelationship = async () => {
    const response = await RelationShipService.list();

    if (response.code === 0) {
      const result = response.result;
      setListRelationship(result?.items);
    }
  };

  useEffect(() => {
    getListRelationship();
  }, []);

  //! đoạn này xử lý vấn đề khi mà biến contactType thay đổi thì update lại setParams
  useEffect(() => {
    if (dataBranch && contactType) {
      // setParams({ ...params, contactType, });
      if (activeTitleHeader === 1) {
        setParams((prevParams) => ({ ...prevParams, contactType: contactType, branchId: dataBranch.value }));
      } else {
        setParamsCustomerPartner((prevParams) => ({ ...prevParams, contactType: contactType }));
      }
    }
  }, [contactType, dataBranch, activeTitleHeader]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: sourceDomain === "hasedu.reborn.vn" ? "Học sinh" : "Khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit, page: 1 }));
    },
  });
  console.log("pagination", pagination);

  const [paginationPartner, setPaginationPartner] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: sourceDomain === "hasedu.reborn.vn" ? "Học sinh" : "Khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParamsCustomerPartner((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParamsCustomerPartner((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  //TODO: Đoạn này là vùng sử lý dữ liệu table
  const [widthColumns, setWidthColumns] = useState(() => {
    const storedData = localStorage.getItem("widthColumnCustomer");
    return storedData ? JSON.parse(storedData) : [];
  });

  useEffect(() => {
    if (widthColumns && widthColumns.length > 0) {
      const changeDataWidthColumns = [...widthColumns];

      // Chia nhóm dữ liệu theo giá trị của 'colId'
      const groupedData = changeDataWidthColumns.reduce((groups, item) => {
        const key = item.colId;
        groups[key] = groups[key] || [];
        groups[key].push(item);
        return groups;
      }, {});

      // Lấy ra các đối tượng { width, colId } của phần tử cuối cùng trong từng nhóm
      const uniqueWidths = Object.values(groupedData).map((group?: any) => ({
        width: group[group.length - 1].width,
        colId: group[group.length - 1].colId,
      }));

      localStorage.setItem("widthColumnCustomer", JSON.stringify(uniqueWidths));
    }
  }, [widthColumns]);

  const isBeauty = localStorage.getItem("isBeauty");

  const ActionRenderer = (props) => {
    let data = props.data;
    let params = props.params;

    return (
      <div className="lst__action--cell">
        <div className="item__action create__sales" onClick={() => navigate(`/create_sale_add?customerId=${data.id}`)}>
          <Tippy content="Thêm hóa đơn">
            <span className="icon__item icon__create--sales">
              <Icon name="PlusCircle" />
            </span>
          </Tippy>
        </div>

        <div
          className="item__action view__invoice"
          onClick={() => {
            localStorage.setItem("backUpUrlCustomer", JSON.stringify(params));
            navigate(`/detail_person/customerId/${data.id}/purchase_invoice`);
          }}
        >
          <Tippy content="Hóa đơn đã mua">
            <span className="icon__item icon-invoice">
              <Icon name="Bill" />
            </span>
          </Tippy>
        </div>

        {isBeauty && isBeauty == "1" && (
          <div
            className="item__action view__contract"
            onClick={() => {
              setIdCustomer(data.id);
              setShowModalAddScheduler(true);
            }}
          >
            <Tippy content="Thêm mới yêu cầu thực hiện dịch vụ">
              <span className="icon__item icon-invoice">
                <Icon name="Calendar" />
              </span>
            </Tippy>
          </div>
        )}

        {permissions["CUSTOMER_UPDATE"] == 1 && (
          <div
            className="item__action update"
            onClick={() => {
              localStorage.setItem("customer.custType", data.dataItem?.custType?.toString());
              setDataCustomer(data.dataItem);

              if (data.dataItem?.custType == 0) {
                setShowModalAdd(true);
              } else {
                setShowModalCompanyAdd(true);
              }
            }}
          >
            <Tippy content="Sửa">
              <span className="icon__item icon__update">
                <Icon name="Pencil" />
              </span>
            </Tippy>
          </div>
        )}

        {permissions["CUSTOMER_DELETE"] == 1 && (
          <div className="item__action delete" onClick={() => handleCheckCustomerDelete(data.dataItem, params, "one")}>
            <Tippy content="Xóa">
              <span className="icon__item icon__delete">
                <Icon name="Trash" />
              </span>
            </Tippy>
          </div>
        )}
      </div>
    );
  };

  const CustomerNameRenderer = ({ data }) => {
    return (
      <div className="name-cell">
        {/* <div className="avatar av-blue">{data.name.charAt(0).toUpperCase()}</div> */}
        <div className={`avatar av-${data.name.charAt(0).toUpperCase()}`}>{data.name.charAt(0).toUpperCase()}</div>
        <div className="info">
          <div className="name">{data.name}</div>
          <div className="phone">📞 {data.phoneMasked}</div>
        </div>
      </div>
    );
  };

  const types = ["Khách hàng", "NCC"];

  const CustomerTypeRenderer = ({ data }) => {
    return (
      <div className="type-cell">
        <div className="badge badge-blue">
          {
            //Ngẫu nhiên trong 2 loại khách hàng và nhà cung cấp
            types[Math.floor(Math.random() * types.length)]
          }
        </div>
      </div>
    );
  };

  const groups = ["Nhóm A", "Nhóm B", "NCC Hàng thiết yếu", "Nhóm A", "Nhóm C", "NCC Đồ uống"];

  const tags = ["VIP", "Mới", "Tiềm năng"];

  const CustomerGroupRenderer = ({ data }) => {
    return (
      <div className="type-cell">
        <div className="badge badge-blue">{groups[Math.floor(Math.random() * groups.length)]}</div>
        <div className="badge badge-green">
          <span className="tag">{tags[Math.floor(Math.random() * tags.length)]}</span>
        </div>
      </div>
    );
  };

  const debts = [-5000000, 0, 8500000, -12000000, 0, 3200000, -5000000, 0, 20000, -12000000, 0];
  const CustomerDebtRenderer = ({ data }) => {
    return (
      <div className="debt-cell">
        <div className={`badge badge-${debts[data.idx] < 0 ? "red" : debts[data.idx] > 0 ? "green" : "blue"}`}>{formatCurrency(debts[data.idx])}</div>
      </div>
    );
  };

  const points = [2450, 850, 0, 5200, 320, 0, 15000, 0, 780, 1200];
  const CustomerScoreRenderer = ({ data }) => {
    return (
      <div className="debt-cell">
        <div className={`badge badge-black`}>{points[data.idx]}</div>
      </div>
    );
  };

  const orders = [24, 7, 18, 56, 3, 9, 12, 0, 4, 15];
  const CustomerOrderRenderer = ({ data }) => {
    return (
      <div className="debt-cell">
        <div className={`badge badge-black`}>{orders[data.idx]}</div>
      </div>
    );
  };

  const [createBTwoB, setCreateBTwoB] = useState<boolean>(false);

  const [typeCampain, setTypeCampain] = useState({ type: "" });

  const takeChangeDataCustomer = (lstData) => {
    if (!lstData && lstData.length === 0) return;

    let type = "";

    if (lstData.every((item) => item.custType === 1)) {
      type = "biz";
    } else if (lstData.every((item) => item.custType === 0)) {
      type = "per";
    } else {
      type = "all";
    }

    setTypeCampain({ type });
  };

  const [idOpportunity, setIdOpportunity] = useState(null);
  const [viewOpportunityBTwoB, setViewOpportunityBTwoB] = useState({
    isView: false,
    idCustomer: null,
    count: 0,
    special: false,
  });

  const defaultValueColumnDefs = [
    {
      field: "checkbox",
      width: 45,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      showDisabledCheckboxes: true,
      resizable: false,
      suppressSizeToFit: true,
      pinned: "left",
    },
    {
      headerName: "STT",
      field: "idx",
      width: 61,
      resizable: false,
      suppressSizeToFit: true,
    },
    { headerName: "Id", field: "id", hide: true },
    { headerName: "dataItem", field: "data", hide: true },
    { headerName: "Tên khách hàng", field: "name", cellRenderer: CustomerNameRenderer },
    { headerName: "Phân loại", field: "type", cellRenderer: CustomerTypeRenderer },
    { headerName: "Nhóm/Nhãn", field: "type", cellRenderer: CustomerGroupRenderer },
    {
      headerName: "Công nợ",
      field: "debt",
      cellRenderer: CustomerDebtRenderer,
      cellStyle: { display: "flex", justifyContent: "flex-end" },
      headerClass: "header-right",
    },
    {
      headerName: "Điểm tích luỹ",
      field: "score",
      cellRenderer: CustomerScoreRenderer,
      cellStyle: { display: "flex", justifyContent: "flex-end" },
      headerClass: "header-right",
    },
    {
      headerName: "Đơn hàng",
      field: "orders",
      cellRenderer: CustomerOrderRenderer,
      cellStyle: { display: "flex", justifyContent: "flex-end" },
      headerClass: "header-right",
    },
    {
      headerName: "Thao tác",
      headerComponent: StyleHeaderTable,
      width: isBeauty && isBeauty == "1" ? 185 : 155,
      field: "action",
      cellRendererParams: { params },
      cellRenderer: ActionRenderer,
      cellStyle: { display: "flex", justifyContent: "center" },
      headerClass: "header-center",
    },
  ];

  const [columnDefs, setColumnDefs] = useState<any>(defaultValueColumnDefs);

  const defaultFieldCustomer = [
    { id: 1, name: "Mã khách hàng", fieldName: "code", isTable: false },

    { value: 9, name: "Ngày mua cuối", fieldName: "lastBoughtDate", isTable: false },
    { value: 10, name: "Tổng doanh số", fieldName: "fee", isTable: false },
    { value: 11, name: "Tổng doanh thu", fieldName: "pavalue", isTable: false },
    { value: 12, name: "Công nợ", fieldName: "debt", isTable: false },

    { id: 3, name: "Giới tính", fieldName: "gender", isTable: false },
    { id: 4, name: "Ngày sinh", fieldName: "birthday", isTable: false },
    { id: 5, name: "Địa chỉ", fieldName: "address", isTable: false },
    { id: 6, name: "Email", fieldName: "emailMasked", isTable: false },
    { id: 14, name: "Chiều cao", fieldName: "height", isTable: false, type: "rightAligned" },
    { id: 15, name: "Cân nặng", fieldName: "weight", isTable: false, type: "rightAligned" },
    { id: 8, name: "Facebook", fieldName: "profileLink", isTable: false },
    { id: 16, name: "Người tạo", fieldName: "creatorId", isTable: false },
    { id: 17, name: "Đối tượng khách hàng", fieldName: "cardId", isTable: false },
    { id: 18, name: "Nhóm khách hàng", fieldName: "cgpId", isTable: false },
    { id: 19, name: "Chi nhánh", fieldName: "branchId", isTable: false },
    { id: 20, name: "Nhân viên", fieldName: "employeeName", isTable: false },
  ] as any[];

  const [lstFieldCustomer, setLstFieldCustomer] = useState(defaultFieldCustomer);
  const [lstFieldActive, setLstFieldActive] = useState(() => {
    const storedData = localStorage.getItem("fieldActiveCustomer");
    return storedData ? JSON.parse(storedData) : [];
  });
  const [lstFieldUnActive, setLstFieldUnActive] = useState([]);

  const [dataConfirm, setDataConfirm] = useState([]);
  const [isConfirmData, setIsConfirmData] = useState<boolean>(false);

  const takeFieldActiveContact = JSON.parse(localStorage.getItem("fieldActiveCustomer"));

  useEffect(() => {
    if (lstFieldActive) {
      setDataConfirm([...dataConfirm, ...lstFieldActive]);
    }
  }, []);

  useEffect(() => {
    if (isConfirmData) {
      const changeLstFieldUnActive = lstFieldCustomer
        .filter((item) => {
          return !dataConfirm.some((el) => el.fieldName === item.fieldName);
        })
        .map((ol) => {
          return {
            value: ol.id,
            label: ol.name,
            fieldName: ol.fieldName,
            isTable: ol.isTable,
            type: ol.type ? ol.type : ol.datatype,
          };
        });

      if (dataConfirm && dataConfirm.length > 0) {
        const changeDataConfirm: any = dataConfirm.map((el) => {
          return {
            headerName: el.label,
            field: el.fieldName,
            type: el.type === "number" ? "rightAligned" : el.type ? el.type : "",
          };
        });

        let elementsToKeep = defaultValueColumnDefs.slice(-3);
        elementsToKeep.unshift(changeDataConfirm);

        let newDataTable = defaultValueColumnDefs.slice(0, -3).concat(elementsToKeep.flat());

        localStorage.setItem("fieldActiveCustomer", JSON.stringify(dataConfirm));

        setColumnDefs(newDataTable);
        setLstFieldActive(dataConfirm);
      } else {
        localStorage.setItem("fieldActiveCustomer", JSON.stringify([]));

        setLstFieldActive([]);
        setColumnDefs(defaultValueColumnDefs);
      }

      setLstFieldUnActive(changeLstFieldUnActive);
    }
  }, [isConfirmData, dataConfirm]);

  const [lstCustomerExtraInfo, setLstCustomerExtraInfo] = useState([]);

  const takeColumnCustomer = JSON.parse(localStorage.getItem("widthColumnCustomer"));

  useEffect(() => {
    if (takeColumnCustomer) {
      const changeDataColumnDefs = columnDefs.map((item) => {
        const matchingColumn = takeColumnCustomer.find((el) => item.field === el.colId);

        if (matchingColumn) {
          return {
            ...item,
            width: matchingColumn.width,
          };
        }

        return item;
      });

      setColumnDefs(changeDataColumnDefs);
    }
  }, [lstCustomerExtraInfo]);

  const getLstFieldCustomer = async (name?: string) => {
    const params = {
      name: name || "",
      limit: 100,
    };

    const response = await CustomerService.filterTable(params);

    if (response.code === 0) {
      const result = response.result.items;
      setLstFieldCustomer([...lstFieldCustomer, ...result]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    getLstFieldCustomer();
  }, []);

  const [rowData, setRowData] = useState([]);
  const [rowMapping, setRowMapping] = useState([]);

  const handleGetOpportunity = async (customerId) => {
    const param = {
      customerId: customerId,
    };

    const response = await CustomerService.lstOpportunity(param);

    if (response.code === 0) {
      const result = response.result.items;
      return result;
    } else {
      return [];
    }
  };

  useEffect(() => {
    if (listCustomer && listCustomer.length >= 0) {
      const fetchData = async () => {
        const changeDataCustomer = await Promise.all(
          listCustomer.map(async (item, index) => {
            const result =
              (await Promise.all(
                rowMapping
                  .filter((el) => el.customerId === item.id)
                  .map(async (item) => {
                    const key = Object.keys(item).find((key) => key !== "customerId");
                    const value = item[key];
                    return {
                      [key]: item.type == "number" ? formatCurrency(+value) : value,
                    };
                  })
              )) || [];

            const body = Object.assign(
              {
                idx: getPageOffset(params) + index + 1,
                ...item,
                id: item.id,
                dataItem: item,
                name: item.name,
                phoneMasked: item.phoneUnmasked || item.phoneMasked,
                profileLink: item.profileLink ? "Đi tới" : "",
                lastBoughtDate: item.lastBoughtDate ? moment(item.lastBoughtDate).format("DD/MM/YYYY") : "",
                fee: formatCurrency(+item.fee || "0"),
                paid: formatCurrency(+item.paid || "0"),
                debt: item.debt ? "Tạo" : formatCurrency(+item.debt || "0"),
                createOpportunities: "Tạo",
                gender: item.gender === 1 ? "Nữ" : "Nam",
                birthday: item.birthday ? moment(item.birthday).format("DD/MM/YYYY") : "",
                lstOpportunities: item.custType ? await handleGetOpportunity(item.id) : null,
                // dùng cho TNEX
                sourceName: item.sourceName,
                teleSaleCall: item.telesaleCall, /// trạng thái cuộc gọi - dùng cho TNEX,
                syncTime: item.syncTime ? moment(item.syncTime).format("DD/MM/YYYY HH:mm") : "", // ngày CRM nhận dữ liệu - dùng cho TNEX
                employeeAssignDate: item.employeeAssignDate ? moment(item.employeeAssignDate).format("DD/MM/YYYY HH:m") : "", // Ngày nhận phụ trách - dùng cho TNEX
                saleAssignDate: item.saleAssignDate ? moment(item.saleAssignDate).format("DD/MM/YYYY HH:mm") : "", // ngày phân bổ dữ liệu cho Telesale - dùng cho TNEX
              },
              ...result
            );

            return body;
          })
        );

        setRowData(changeDataCustomer);
      };

      fetchData();
    }
  }, [listCustomer, rowMapping, params]);

  useEffect(() => {
    setColumnDefs((prevColumnDefs) => {
      const newColumnDefs = [...prevColumnDefs];

      const addColumnActionIndex = newColumnDefs.findIndex((col) => col.field === "action");
      const addColumnCreateOpportunitiesIndex = newColumnDefs.findIndex((col) => col.field === "createOpportunities");

      if (addColumnActionIndex !== -1) {
        newColumnDefs[addColumnActionIndex].cellRendererParams = {
          params,
        };
      }

      if (addColumnCreateOpportunitiesIndex !== -1) {
        newColumnDefs[addColumnCreateOpportunitiesIndex].cellRendererParams = {
          params,
        };
      }

      return newColumnDefs;
    });
  }, [params]);

  useEffect(() => {
    setColumnDefs((prevColumnDefs) => {
      const newColumnDefs = [...prevColumnDefs];
      const addColumnPhoneIndex = newColumnDefs.findIndex((col) => col.field === "phoneMasked");

      if (addColumnPhoneIndex !== -1) {
        newColumnDefs[addColumnPhoneIndex].cellRendererParams = {
          isShowPhone,
          valueShowPhone,
          idCustomer,
        };
      }
      return newColumnDefs;
    });
  }, [isShowPhone, valueShowPhone, idCustomer]);

  useEffect(() => {
    if (takeFieldActiveContact) {
      const changeDataTakeFieldActiveContact: any = takeFieldActiveContact.map((el) => {
        return {
          headerName: el.label,
          field: el.fieldName,
          type: el.type === "number" ? "rightAligned" : el.type ? el.type : "",
        };
      });

      let elementsToKeep = defaultValueColumnDefs.slice(-3);
      elementsToKeep.unshift(changeDataTakeFieldActiveContact);

      let newDataTable = defaultValueColumnDefs.slice(0, -3).concat(elementsToKeep.flat());

      setColumnDefs(newDataTable);
      setLstFieldActive(takeFieldActiveContact);
    }
  }, []);

  const [titleExport, setTitleExport] = useState([]);

  useEffect(() => {
    if (columnDefs) {
      let changeDataColumnDefs = [...columnDefs];

      // Bỏ đi phần tử đầu tiên
      changeDataColumnDefs = changeDataColumnDefs.slice(1);

      // Lọc bỏ đi hai phần tử cuối cùng
      changeDataColumnDefs = changeDataColumnDefs.slice(0, changeDataColumnDefs.length - 2);

      // Lọc bỏ đi các phần tử có thuộc tính "hide" là true
      changeDataColumnDefs = changeDataColumnDefs
        .filter((item) => !item.hide && item.field !== "createOpportunities")
        .map((el) => {
          return {
            field: el.field,
            headerName: el.headerName,
            type: el.type === "number" ? "rightAligned" : el.type ? el.type : "",
          };
        });

      setTitleExport(changeDataColumnDefs);
    }
  }, [columnDefs]);

  const abortController = new AbortController();
  const getListCustomer = async (paramsSearch: ICustomerSchedulerFilterRequest, activeTitleHeader?) => {
    setIsLoading(true);
    // const response = await CustomerService.filter(paramsSearch, abortController.signal);

    let response = null;

    if (activeTitleHeader === 1) {
      response = await CustomerService.filter(paramsSearch, abortController.signal);
    } else {
      if (!paramsSearch.targetBsnId) {
        setListCustomer([]);
        setIsLoading(false);
        setIsNoItem(true);
        return;
      } else {
        response = await CustomerService.listshared(paramsSearch, abortController.signal);
      }
    }

    if (response.code === 0) {
      localStorage.setItem("backUpUrlCustomer", JSON.stringify(params));
      const result = response.result;

      const changeResult = result.items
        .filter((item) => (item.lstCustomerExtraInfo || []).length > 0)
        .map((el) => el.lstCustomerExtraInfo)
        .flat()
        .map((ol) => {
          if (ol.datatype === "date") {
            return { ...ol, attributeValue: moment(ol.attributeValue).format("DD/MM/YYYY") };
          }

          return ol;
        });

      setLstCustomerExtraInfo(changeResult);
      setListCustomer(result.items);

      if (activeTitleHeader === 1) {
        setPagination({
          ...pagination,
          page: +result.page,
          sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
        });
      } else {
        setPaginationPartner({
          ...paginationPartner,
          page: +result.page,
          sizeLimit: paramsCustomerPartner.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(paramsCustomerPartner.limit ?? DataPaginationDefault.sizeLimit)),
        });
      }

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

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      if (activeTitleHeader === 1) {
        getListCustomer(params, activeTitleHeader);
      }

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
  }, [params, activeTitleHeader]);

  const getListPartner = async () => {
    const params = {
      limit: 100,
      status: 1,
      requestCode: "customer",
    };

    const response = await PermissionService.requestPermissionSource(params);

    if (response.code === 0) {
      const result = response.result.items || [];
      const newList = [];
      result.map((item, index) => {
        if (newList.filter((el) => el.targetBsnId === item.targetBsnId).length === 0) {
          newList.push({
            name: item.targetBranchName,
            targetBsnId: item.targetBsnId,
            color: colorData[index],
          });
        }
      });

      setListPartner(newList);
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getListPartner();
  }, []);

  //! Đoạn này tạo ra một mảng phục vụ việc tìm kiếm nhanh
  const dataQuickSearchLeft = [
    {
      title: "Tất cả (226)",
      type: "all",
      contactType: -1,
    },
    {
      title: "Khách hàng (200)",
      type: "update",
      contactType: 1,
    },
    {
      title: "NCC (26)",
      type: "not_forget",
      contactType: 2,
    },
  ];

  const titleActions: ITitleActions = {
    actions: [
      ...(activeTitleHeader !== 3
        ? [
            permissions["CUSTOMER_ADD"] == 1 && {
              title: "Thêm mới",
              callback: () => {
                setDataCustomer(null);
                //Lưu cũ là gì để bật popup tương ứng (null, undefined hoặc 0)
                if (checkCustType == "0" || !checkCustType) {
                  //Test trước
                  setShowModalAdd(true);
                } else {
                  //Khách hàng doanh nghiệp
                  setShowModalCompanyAdd(true);
                }
              },
            },
          ]
        : []),
    ],
    actions_extra: [
      permissions["CUSTOMER_IMPORT"] == 1 && {
        title: "Nhập danh sách",
        icon: <Icon name="Upload" />,
        callback: () => {
          setShowModalImport(true);
        },
      },
      permissions["CUSTOMER_EXPORT"] == 1 && {
        title: "Xuất danh sách",
        icon: <Icon name="Download" />,
        callback: () => {
          setOnShowModalExport(true);
        },
      },
    ],
  };

  const handClickEye = (e, item, index, idCustomer) => {
    e && e.preventDefault();

    setValueShowPhone("");
    setIdCustomer(item.id);
    setIsShowPhone(true);
    setIdxCustomer(index);
    setDataCustomer(item);

    if (item.id == idCustomer) {
      setIsShowPhone(false);
      setIdCustomer(null);
    }
  };

  const formatExcel = ["center", "top", "center", "center", "right", "right", "right"];

  const onDelete = async (id: number, parma: any) => {
    const response = await CustomerService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa khách hàng thành công`, "success");
      getListCustomer(parma, activeTitleHeader);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalCompanyAdd, setShowModalCompanyAdd] = useState<boolean>(false);
  const [dataCustomer, setDataCustomer] = useState<ICustomerResponse>(null);

  const [titleProps, setTitleProps] = useState<string>("");
  const [showModalAddScheduler, setShowModalAddScheduler] = useState<boolean>(false);
  const [showModalUpdateCommon, setShowModalUpdateCommon] = useState<boolean>(false);
  const [isActiveCustomerGroup, setIsActiveCustomerGroup] = useState<boolean>(false);
  const [isActiveCustomeRelationship, setIsActiveCustomeRelationship] = useState<boolean>(false);
  const [isActiveCustomerSource, setIsActiveCustomerSource] = useState<boolean>(false);
  const [isActiveCustomerEmployee, setIsActiveCustomerEmployee] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const handleCheckCustomerDelete = async (item?: any, params?: any, type?: "one" | "all") => {
    const body = {
      customerIds: type === "one" ? [item.id] : listIdChecked,
    };

    const response = await CustomerService.checkInProcess(body);

    if (response.code === 0) {
      const result = response.result;

      if (result.alert) {
        type === "one" ? showDialogConfirmDelete(item, params, result) : showDialogConfirmDelete(null, null, result);
      } else {
        type === "one" ? showDialogConfirmDelete(item, params) : showDialogConfirmDelete();
      }
    } else {
      showToast("Kiểm tra khách hàng đang trong chiến dịch, hợp đồng đang lỗi!", "error");
    }
  };

  const onDeleteAllCustomer = async () => {
    const body = {
      customerIds: listIdChecked,
      ignoreCheck: true,
    };

    const response = await CustomerService.deleteAll(body);

    if (response.code === 0) {
      showToast("Xóa khách hàng thành công", "success");
      getListCustomer(params, activeTitleHeader);
      setListIdChecked([]);
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICustomerResponse, param?: any, dataCheckDeleteCustomer?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa khách hàng</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa{" "}
          {item ? (
            <span>
              khách hàng <strong>{item.name}</strong>
            </span>
          ) : (
            <span>
              <strong>{listIdChecked.length}</strong> khách hàng đã chọn
              {dataCheckDeleteCustomer && listIdChecked.length > 1 && (
                <Fragment>
                  , trong đó{" "}
                  {dataCheckDeleteCustomer.inCampaigns?.length > 0 ? (
                    <Fragment>
                      <strong>{dataCheckDeleteCustomer.inCampaigns.length}</strong> khách hàng có chiến dịch bán hàng
                    </Fragment>
                  ) : (
                    ""
                  )}
                  {dataCheckDeleteCustomer.inContract?.length > 0 ? (
                    <Fragment>
                      <strong>, {dataCheckDeleteCustomer.inContract.length}</strong> khách hàng có hợp đồng
                    </Fragment>
                  ) : (
                    ""
                  )}
                </Fragment>
              )}
              {dataCheckDeleteCustomer && listIdChecked.length === 1 && (
                <Fragment>
                  , khách hàng đang có{" "}
                  {dataCheckDeleteCustomer.inCampaigns.length > 0 && dataCheckDeleteCustomer.inContract?.length <= 0 ? (
                    <Fragment>
                      <strong>{dataCheckDeleteCustomer.inCampaigns.length}</strong> chiến dịch bán hàng
                    </Fragment>
                  ) : dataCheckDeleteCustomer.inContract?.length > 0 && dataCheckDeleteCustomer.inCampaigns.length <= 0 ? (
                    <Fragment>
                      <strong>{dataCheckDeleteCustomer.inContract.length}</strong> khách hàng có hợp đồng
                    </Fragment>
                  ) : (
                    <Fragment>
                      <strong>{dataCheckDeleteCustomer.inCampaigns.length}</strong> chiến dịch bán hàng và khách hàng có{" "}
                      <strong>{dataCheckDeleteCustomer.inContract.length}</strong> hợp đồng
                    </Fragment>
                  )}
                </Fragment>
              )}
            </span>
          )}
          {item && dataCheckDeleteCustomer ? (
            <span>
              <strong>{item.name}</strong>, khách hàng đang có{" "}
              {dataCheckDeleteCustomer.inCampaigns.length > 0 && dataCheckDeleteCustomer.inContract?.length <= 0 ? (
                <Fragment>
                  <strong>{dataCheckDeleteCustomer.inCampaigns.length}</strong> chiến dịch bán hàng
                </Fragment>
              ) : dataCheckDeleteCustomer.inContract?.length > 0 && dataCheckDeleteCustomer.inCampaigns.length <= 0 ? (
                <Fragment>
                  <strong>{dataCheckDeleteCustomer.inContract.length}</strong> khách hàng có hợp đồng
                </Fragment>
              ) : (
                <Fragment>
                  <strong>{dataCheckDeleteCustomer.inCampaigns.length}</strong> chiến dịch bán hàng và khách hàng có{" "}
                  <strong>{dataCheckDeleteCustomer.inContract.length}</strong> hợp đồng
                </Fragment>
              )}
            </span>
          ) : (
            ""
          )}
          ? Thao tác này không thể khôi phục.
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
          onDeleteAllCustomer();
        } else {
          onDelete(item.id, param);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const reloadData = async (listIdCustomer) => {
    const body = {
      lstId: listIdCustomer,
    };

    const response = await CustomerService.reloadData(body);

    if (response.code === 0) {
      setIsLoading(true);
      setTimeout(() => {
        showToast("Chạy lại dữ liệu thành công", "success");
        getListCustomer(params, activeTitleHeader);
        setListIdChecked([]);
      }, 2000);
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };
  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Đổi nguồn khách hàng",
      callback: () => {
        setShowModalUpdateCommon(true);
        setIsActiveCustomerSource(true);
        setTitleProps("Cập nhật nguồn khách hàng");
        setIsActiveCustomerGroup(false);
        setIsActiveCustomeRelationship(false);
        setIsActiveCustomerEmployee(false);
      },
    },
    {
      title: "Đổi nhóm khách hàng",
      callback: () => {
        setShowModalUpdateCommon(true);
        setIsActiveCustomerGroup(true);
        setTitleProps("Cập nhật nhóm khách hàng");
        setIsActiveCustomerSource(false);
        setIsActiveCustomeRelationship(false);
        setIsActiveCustomerEmployee(false);
      },
    },
    {
      title: "Thêm vào chiến dịch bán hàng",
      callback: () => {
        if (typeCampain && typeCampain.type != "all") {
          setShowModalAddManagementOpportunity(true);
        } else {
          showToast("Bạn cần chọn cụ thể, tạo cơ hội cho khách hàng cá nhân hay khách hàng doanh nghiệp !", "warning");
        }
      },
    },
    {
      title: "Gửi Email",
      callback: () => {
        setShowPageSendEmail(true);
      },
    },
    {
      title: "Gửi SMS",
      callback: () => {
        setShowPageSendSMS(true);
      },
    },
    {
      title: "Chạy lại dữ liệu",
      callback: () => {
        reloadData(listIdChecked);
      },
    },
    permissions["CUSTOMER_DELETE"] == 1 && {
      title: "Xóa khách hàng",
      callback: () => handleCheckCustomerDelete(),
    },
  ];

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);

  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả khách hàng ",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} khách hàng phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, params]
  );

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await CustomerService.filter({
        ...params,
        // page: type === "current_page" ? 1 : params.page,
        page: type === "current_page" ? params.page || 1 : 1,
        limit: type === "all" || type === "current_search" ? pagination.totalItem : params.limit,
      });

      if (response.code === 0) {
        const result = response.result;
        const changeResult = result.items
          .filter((item) => (item.lstCustomerExtraInfo || []).length > 0)
          .map((el) => el.lstCustomerExtraInfo)
          .flat()
          .map((ol) => {
            if (ol.datatype === "date") {
              return { ...ol, attributeValue: moment(ol.attributeValue).format("DD/MM/YYYY") };
            }

            return ol;
          });

        const dataExport: any = result.items.map((item, index) => {
          const result = rowMapping.filter((el) => el.customerId === item.id) || [];

          const changeDataResult = result.map((item) => {
            const key = Object.keys(item).find((key) => key !== "customerId");
            const value = item[key];
            return {
              [key]: value,
            };
          });

          const body = Object.assign(
            {
              idx: getPageOffset(params) + index + 1,
              ...item,
              name: item.name,
              phoneMasked: item.phoneMasked,
              profileLink: item.profileLink ? "Đi tới" : "",
              lastBoughtDate: item.lastBoughtDate ? moment(item.lastBoughtDate).format("DD/MM/YYYY") : "",
              fee: +item.fee || 0,
              paid: +item.paid || 0,
              debt: item.debt || 0,
              gender: item.gender === 1 ? "Nữ" : "Nam",
              birthday: item.birthday ? moment(item.birthday).format("DD/MM/YYYY") : "",
            },
            ...changeDataResult
          );

          return body;
        });

        const compareArrays = (arr1, arr2) => {
          const result = [];

          for (const item2 of arr2) {
            const matchedItem = [];

            for (const field of titleExport) {
              const fieldName = field.field;

              if (item2.hasOwnProperty(fieldName)) {
                matchedItem.push(item2[fieldName]);
              } else {
                matchedItem.push(null); // Hoặc giá trị mặc định nếu không có giá trị
              }
            }

            result.push(matchedItem);
          }

          return result;
        };

        const dataMappingArray = compareArrays(titleExport, dataExport);

        if (extension === "excel") {
          ExportExcel({
            fileName: "KhachHang",
            title: "Khách hàng",
            header: titleExport.map((item) => item.headerName), // titles("export")
            formatExcel: formatExcel,
            data: dataMappingArray,
            info: { name },
          });
        }
        showToast("Xuất file thành công", "success");
        setOnShowModalExport(false);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
        setOnShowModalExport(false);
      }
    },
    [params, titleExport]
  );

  const handShowPhone = async (id: number) => {
    const response = await CustomerService.viewPhone(id);
    if (response.code == 0) {
      const result = response.result;
      setValueShowPhone(result);
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem số điện thoại !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  useEffect(() => {
    if (isShowPhone && idCustomer) {
      handShowPhone(idCustomer);
    }
  }, [isShowPhone, idCustomer]);

  useEffect(() => {
    if (dataCustomer && valueShowPhone && idCustomer) {
      setListCustomer((prevState) => {
        const newArray = [...prevState];

        newArray[idxCustomer] = { ...newArray[idxCustomer], phoneMasked: dataCustomer?.phoneMasked };

        return newArray;
      });
    }

    if (!isShowPhone && dataCustomer) {
      setListCustomer((prevState) => {
        const newArray = [...prevState];

        newArray[idxCustomer] = { ...newArray[idxCustomer], phoneMasked: dataCustomer?.phoneMasked };

        return newArray;
      });
    }
  }, [valueShowPhone, idxCustomer, idCustomer, dataCustomer, isShowPhone]);

  const [pushCampaign, setPushCampaign] = useState<boolean>(false);

  const handlClickPartner = (e, value) => {
    setTargetBsnId(value);
  };

  useEffect(() => {
    if (listPartner && listPartner.length > 0) {
      setParamsCustomerPartner({ ...paramsCustomerPartner, targetBsnId: targetBsnId ? targetBsnId : listPartner[0].targetBsnId });

      if (!targetBsnId) {
        setTargetBsnId(listPartner[0].targetBsnId);
      }
    }
  }, [targetBsnId, listPartner]);

  useEffect(() => {
    if (activeTitleHeader === 3) {
      getListCustomer(paramsCustomerPartner, activeTitleHeader);
    }
  }, [paramsCustomerPartner, activeTitleHeader]);

  return (
    <Fragment>
      <div
        className={`page-content page-customer-supplier${isNoItem ? " bg-white" : ""}${showPageSendSMS ? " d-none" : ""}${
          showPageSendEmail ? " d-none" : ""
        }`}
      >
        <TitleAction title={"Quản lý khách hàng và NCC"} titleActions={titleActions} />
        <div className="card-box d-flex flex-column">
          <div className="quick__search">
            <div className="quick__search--start">
              <Input
                name="sourceData"
                className="input-search"
                value={""}
                fill={true}
                required={true}
                icon={<Icon name="Search" />}
                placeholder="Tìm kiếm theo tên, SĐT, email..."
                // onChange={(e) =>() }
              />
            </div>
            <ul className="quick__search--left">
              {dataQuickSearchLeft.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className={`${item.contactType == contactType ? "active" : ""}`}
                    onClick={(e) => {
                      e && e.preventDefault();
                      setContactType(item.contactType);
                    }}
                  >
                    {item.title}
                  </li>
                );
              })}
            </ul>
            <div className="quick__search--right">
              <button className="filter-chip">🏷️ Nhóm</button>
              <button className="filter-chip">⭐ VIP</button>
              <button className="filter-chip">🔴 Có nợ</button>
              <button className="filter-chip">📅 Mới</button>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat-pill">
              <div className="dot" style={{ background: "#5b6af0" }}></div>
              <div>
                <div className="num">20</div>
                <div className="lbl">Tổng đối tác</div>
              </div>
            </div>
            <div className="stat-pill">
              <div className="dot" style={{ background: "#10b981" }}></div>
              <div>
                <div className="num">200</div>
                <div className="lbl">Khách hàng</div>
              </div>
            </div>
            <div className="stat-pill">
              <div className="dot" style={{ background: "#8b5cf6" }}></div>
              <div>
                <div className="num">35</div>
                <div className="lbl">NCC</div>
              </div>
            </div>
            <div className="stat-pill">
              <div className="dot" style={{ background: "#ef4444" }}></div>
              <div>
                <div className="num" style={{ color: "#ef4444" }}>
                  28,500,000 ₫
                </div>
                <div className="lbl">Tổng công nợ</div>
              </div>
            </div>
            <div className="stat-pill">
              <div className="dot" style={{ background: "#f59e0b" }}></div>
              <div>
                <div className="num">12</div>
                <div className="lbl">Có nợ quá hạn</div>
              </div>
            </div>
          </div>

          {!isLoading && listCustomer && listCustomer.length > 0 ? (
            <BoxTableAdvanced
              name="Khách hàng"
              columnDefs={columnDefs}
              rowData={rowData}
              dragColumnDefs={false}
              isPagination={true}
              dataPagination={activeTitleHeader === 1 ? pagination : paginationPartner}
              isBulkAction={true}
              bulkActionItems={bulkActionList}
              listIdChecked={activeTitleHeader === 1 ? listIdChecked : null}
              widthColumns={widthColumns}
              setWidthColumns={(data) => setWidthColumns(data)}
              setListIdChecked={(listId, lstData) => {
                takeChangeDataCustomer(lstData);
                setListIdChecked(listId);
              }}
              saveColumnName={"customerListTable"}
              rowHeight={66}
            />
          ) : isLoading ? (
            <Loading />
          ) : (
            <Fragment>
              {isNoItem ? (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có khách hàng nào. <br />
                      {activeTitleHeader === 1 ? `Hãy thêm mới khách hàng đầu tiên nhé!` : ""}
                    </span>
                  }
                  type="no-item"
                  titleButton={activeTitleHeader === 1 ? "Thêm mới khách hàng" : ""}
                  action={() => {
                    if (activeTitleHeader === 1) {
                      setDataCustomer(null);
                      //Lưu cũ là gì để bật popup tương ứng (null, undefined hoặc 0)
                      if (checkCustType == "0" || !checkCustType) {
                        //Test trước
                        setShowModalAdd(true);
                      } else {
                        //Khách hàng doanh nghiệp
                        setShowModalCompanyAdd(true);
                      }
                    }
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
        <AddCustomerPersonModal
          onShow={showModalAdd}
          data={dataCustomer}
          onHide={(reload, nextModal) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setShowModalAdd(false);
            setDataCustomer(null);

            //Nếu true thì bật cái kia
            if (nextModal) {
              setShowModalCompanyAdd(true);
            }
          }}
          zaloUserId={dataCustomer?.zaloUserId}
        />

        {/* Khách hàng doanh nghiệp */}
        <AddCustomerCompanyModal
          onShow={showModalCompanyAdd}
          data={dataCustomer}
          onHide={(reload, nextModal) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setShowModalCompanyAdd(false);
            setDataCustomer(null);

            if (nextModal) {
              setShowModalAdd(true);
            }
          }}
        />
        <UpdateCommon
          onShow={showModalUpdateCommon}
          listId={listIdChecked}
          titleProps={titleProps}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
              setListIdChecked([]);
            }
            setShowModalUpdateCommon(false);
          }}
          isActiveCustomerGroup={isActiveCustomerGroup}
          isActiveCustomerSource={isActiveCustomerSource}
          isActiveCustomerEmployee={isActiveCustomerEmployee}
          isActiveCustomeRelationship={isActiveCustomeRelationship}
        />
        <ViewOpportunityBTwoB
          totalOpportunity={viewOpportunityBTwoB.count}
          onShow={viewOpportunityBTwoB.isView}
          idCustomer={viewOpportunityBTwoB.idCustomer}
          special={viewOpportunityBTwoB.special}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }

            setViewOpportunityBTwoB({ idCustomer: null, isView: false, count: 0, special: false });
          }}
          handlePushCampaign={(action, idOpportunity, idCustomer) => {
            if (action) {
              setViewOpportunityBTwoB({ idCustomer: null, isView: false, count: 0, special: false });
              setCreateBTwoB(true);
              setPushCampaign(true);
              setIdOpportunity(idOpportunity);
              setIdCustomer(idCustomer);
            }
          }}
        />
        <RecoverPublicDebts
          onShow={showModalDebt}
          idCustomer={idCustomer}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setShowModalDebt(false);
          }}
        />
        <AddBTwoBModal
          onShow={createBTwoB}
          idCustomer={idCustomer}
          dataCustomer={dataCustomer}
          idOpportunity={idOpportunity}
          special={pushCampaign}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setCreateBTwoB(false);
          }}
          onBackup={(idCustomer, reload) => {
            const takeCountOpportunity = rowData.find((item) => item.id === idCustomer).lstOpportunities.length;
            setCreateBTwoB(false);
            setViewOpportunityBTwoB({ idCustomer: idCustomer, isView: true, count: takeCountOpportunity, special: reload });
          }}
        />
        <ModalExportCustomer
          name="Khách hàng"
          params={params}
          onShow={onShowModalExport}
          onHide={() => setOnShowModalExport(false)}
          options={optionsExport}
          total={pagination.totalItem}
          callback={(type, extension) => exportCallback(type, extension)}
        />
        <ImportModal
          name="Nhập danh sách khách hàng"
          onShow={showModalImport}
          onHide={(reload) => {
            if (reload) {
              getListCustomer(params, activeTitleHeader);
            }
            setShowModalImport(false);
          }}
          type="customer"
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
      <div className={`${showPageSendSMS ? "" : "d-none"}`}>
        <AddEditSendSMS
          type="customer"
          onShow={showPageSendSMS}
          listIdCustomerProps={listIdChecked}
          paramCustomerProps={params}
          onHide={() => {
            setListIdChecked([]);
            getListCustomer(params, activeTitleHeader);
            setShowPageSendSMS(false);
          }}
        />
      </div>
      <div className={`${showPageSendEmail ? "" : "d-none"}`}>
        <AddEditSendEmail
          type="customer"
          onShow={showPageSendEmail}
          listIdCustomerProps={listIdChecked}
          paramCustomerProps={params}
          onHide={() => {
            setListIdChecked([]);
            getListCustomer(params, activeTitleHeader);
            setShowPageSendEmail(false);
          }}
        />
      </div>
    </Fragment>
  );
}
