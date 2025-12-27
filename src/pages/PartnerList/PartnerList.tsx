/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Grid } from "swiper";
import { getSearchParameters, getPageOffset } from "reborn-util";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { ExportExcel } from "exports";
import ExportModal from "components/exportModal/exportModal";
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
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";
import { IRelationShipResposne } from "model/relationShip/RelationShipResposne";
import { UserContext, ContextType } from "contexts/userContext";
// import AddCustomerPersonModal from "./partials/AddCustomerPersonModal";
// import AddCustomerViewerModal from "./partials/AddCustomerViewerModal/AddCustomerViewerModal";
import AddEditSendSMS from "pages/Common/AddEditSendSMS/AddEditSendSMS";
import RelationShipService from "services/RelationShipService";
import RecoverPublicDebts from "pages/Common/RecoverPublicDebts";
import ImportModal from "components/importModalBackup";
import ExportListModal from "pages/Common/ExportListModal/ExportListModal";

//Thêm riêng lẻ 1 cơ hội vào chiến dịch bán hàng (quy trình bán hàng)
import "swiper/css/grid";
import "swiper/css/navigation";
import "./PartnerList.scss";
import Button from "components/button/button";
import BoxTableAdvanced from "components/boxTableAdvanced/boxTableAdvanced";
import Checkbox from "components/checkbox/checkbox";
import Input from "components/input/input";
import Popover from "components/popover/popover";
// import AddCustomerCompanyModal from "./partials/AddCustomerCompanyModal";
import PermissionService from "services/PermissionService";
import PartnerService from "services/PartnerService";
import ModalAddPartner from "./partials/ModalAddPartner";
import ReportPartner from "./partials/ReportPartner";
import XmlAddPartner from "./partials/XmlAddPartner";
// import PurchaseInvoiceList from "./partials/PurchaseInvoice/PurchaseInvoiceList";

export default function PartnerList() {
  const [showPageSendSMS, setShowPageSendSMS] = useState<boolean>(false);
  const [showPageSendEmail, setShowPageSendEmail] = useState<boolean>(false);
  const [activeTitleHeader, setActiveTitleHeader] = useState(1);

  document.title = `${"Danh sách đối tác"}`;

  const navigate = useNavigate();

  const { name, avatar, dataBranch } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();
  const [listPartner, setListPartner] = useState([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalImport, setShowModalImport] = useState<boolean>(false);
  const [isBatch, setIsBatch] = useState<boolean>(false);

  const { width } = useWindowDimensions();
  const takeParamsUrl = getSearchParameters();

  //! đoạn này call API mối quan hệ khách hàng
  const [listRelationship, setListRelationship] = useState<IRelationShipResposne[]>([]);
  const [idRelationship, setIdRelationship] = useState<number>(() => {
    return takeParamsUrl?.relationshipId ? takeParamsUrl?.relationshipId : null;
  });

  // biến này tạo ra với mục đích tìm kiếm nhanh
  const [contactType, setContactType] = useState<number>(() => {
    return takeParamsUrl?.contactType ? takeParamsUrl?.contactType : -1;
  });

  const [cityId, setCityId] = useState<number>(() => {
    return takeParamsUrl?.cityId ? takeParamsUrl?.cityId : "";
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách đối tác",
      is_active: true,
    },
    {
      key: "report",
      name: "Báo cáo đối tác",
      is_active: false,
    },
  ]);

  const [idPartner, setIdPartner] = useState<number>(null);
  const [idxCustomer, setIdxCustomer] = useState<number>(null);
  const [isShowPhone, setIsShowPhone] = useState<boolean>(false);
  const [valueShowPhone, setValueShowPhone] = useState<string>("");

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
          key: "cityId",
          name: "Khu vực",
          type: "select",
          is_featured: true,
          value: searchParams.get("cityId") ?? "",
          params: {
            parentId: 0,
            limit: 1000,
          },
        },

        {
          key: "time_buy",
          name: "Thời gian mua gần nhất",
          type: "date-two",
          param_name: ["fmtStartOrderDate", "fmtEndOrderDate"],
          is_featured: true,
          value: searchParams.get("fmtStartOrderDate") ?? "",
          value_extra: searchParams.get("fmtEndOrderDate") ?? "",
          is_fmt_text: true,
        },

        {
          key: "checkDebt",
          name: "Công nợ",
          type: "select",
          is_featured: true,
          list: [
            {
              value: "-1",
              label: "Tất cả",
            },
            {
              value: "1",
              label: "Còn nợ",
            },
            {
              value: "2",
              label: "Đã xong",
            },
          ],
          value: searchParams.get("checkDebt") ?? "",
        },
        {
          key: "cgpId",
          name: "Nhóm khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("cgpId") ?? "",
        },
        {
          key: "careerId",
          name: "Ngành nghề khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("cgpId") ?? "",
        },
        {
          key: "sourceId",
          name: "Nguồn khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("cgpId") ?? "",
        },
        {
          key: "employeeId",
          name: "Người phụ trách",
          type: "select",
          is_featured: true,
          value: searchParams.get("employeeId") ?? "",
        },
        {
          key: "projectId",
          name: "Lọc theo sản phẩm đã mua",
          type: "select",
          is_featured: true,
          value: searchParams.get("projectId") ?? "",
        },
        {
          key: "serviceId",
          name: "Lọc theo dịch vụ đã mua",
          type: "select",
          is_featured: true,
          value: searchParams.get("serviceId") ?? "",
        },
        {
          key: "uploadId",
          name: "Lọc theo lượt upload",
          type: "select",
          is_featured: true,
          value: searchParams.get("uploadId") ?? "",
        },
        {
          key: "",
          name: "Lọc theo MA",
          type: "select",
          is_featured: true,
          value: searchParams.get("") ?? "",
        },
        {
          key: "filterId",
          name: "Lọc theo phân khúc khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("filterId") ?? "",
        },
      ] as IFilterItem[],
    [searchParams, cityId]
  );

  const isMounted = useRef(false);

  const [params, setParams] = useState<ICustomerSchedulerFilterRequest>({
    keyword: "",
    // contactType,
    // branchId: 0
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
      setListRelationship(result);
    }
  };

  useEffect(() => {
    getListRelationship();
  }, []);

  //! đoạn này xử lý vấn đề khi mà biến contactType thay đổi thì update lại setParams
  useEffect(() => {
    if (dataBranch) {
      // setParams({ ...params, contactType, });
      if (activeTitleHeader === 1) {
        // setParams((prevParams) => ({ ...prevParams, contactType: contactType, branchId: dataBranch.value }));
        setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
      } else {
        setParamsCustomerPartner((prevParams) => ({ ...prevParams, contactType: contactType }));
      }
    }
  }, [dataBranch, activeTitleHeader]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "đối tác",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  //TODO: Đoạn này là vùng sử lý dữ liệu table
  const refColumn = useRef();
  const refColumnContainer = useRef();
  const [widthColumns, setWidthColumns] = useState(() => {
    const storedData = localStorage.getItem("widthColumnPartner");
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

      localStorage.setItem("widthColumnPartner", JSON.stringify(uniqueWidths));
    }
  }, [widthColumns]);

  const [isShowColumn, setIsShowColumn] = useState(false);
  useOnClickOutside(refColumn, () => setIsShowColumn(false), ["custom-header"]);

  const HeaderButton = ({
    column,
    api,
    searchField,
    setSearchField,
    isConfirmData,
    setIsConfirmData,
    isShowColumn,
    setIsShowColumn,
    dataConfirm,
    setDataConfirm,
    lstFieldActive,
    lstFieldUnActive,
  }) => {
    return (
      <Fragment>
        <div className="custom-header" ref={refColumnContainer}>
          <button onClick={() => setIsShowColumn((prev) => !prev)}>
            <Tippy content="Thêm cột">
              <span>
                <Icon name="PlusCircleFill" />
              </span>
            </Tippy>
          </button>

          {isShowColumn && (
            <Popover alignment="right" isTriangle={true} className="popover-column-header" refContainer={refColumnContainer} refPopover={refColumn}>
              <div className="box__add--column">
                <span className="select-field">Chọn trường</span>
                <div className="search-column">
                  <Input
                    name="search_field"
                    value={searchField}
                    fill={true}
                    iconPosition="left"
                    icon={<Icon name="Search" />}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchField(value);
                      getLstFieldPartner(value);
                    }}
                    placeholder="Tìm kiếm tên trường"
                  />
                </div>
                <div className="lst__columns">
                  <div className="lst__columns--show">
                    <div className="summary__qty--column">
                      <span className="title__show--column">Các trường hiển thị trong bảng</span>
                      <span className="qty-total">{`${lstFieldActive.length + defaultFieldTableDis.length}/${
                        lstFieldActive.length + lstFieldUnActive.length + defaultFieldTableDis.length
                      }`}</span>
                    </div>
                    <div className="lst__items lst__items--show">
                      {(lstFieldActive || defaultFieldTableDis) &&
                        (lstFieldActive.length > 0 || defaultFieldTableDis.length > 0) &&
                        [...defaultFieldTableDis, ...lstFieldActive].map((el, idx) => {
                          return (
                            <Checkbox
                              key={idx}
                              value={el.value}
                              label={el.label}
                              disabled={el.hide ? true : false}
                              defaultChecked={el.isTable}
                              onChange={(e) => {
                                const isCheck = e.target.checked;

                                const changeData = {
                                  ...el,
                                  isTable: isCheck ? true : false,
                                };

                                if (isCheck) {
                                  setDataConfirm([...dataConfirm, changeData]);
                                } else {
                                  const newData = dataConfirm.filter((ol) => ol.fieldName !== el.fieldName);
                                  setDataConfirm(newData);
                                }
                              }}
                            />
                          );
                        })}
                    </div>
                  </div>
                  <div className="lst__columns--hide">
                    <span className="title__hide--column">Các trường không hiển thị trong bảng</span>

                    <div className="lst__items lst__items--show">
                      {lstFieldUnActive &&
                        lstFieldUnActive.length > 0 &&
                        lstFieldUnActive.map((el, idx) => {
                          return (
                            <Checkbox
                              key={idx}
                              value={el.value}
                              label={el.label}
                              defaultChecked={el.isTable}
                              onChange={(e) => {
                                const isCheck = e.target.checked;

                                const changeData = {
                                  ...el,
                                  isTable: isCheck ? true : false,
                                };

                                if (isCheck) {
                                  setDataConfirm([...dataConfirm, changeData]);
                                } else {
                                  const newData = dataConfirm.filter((ol) => ol.fieldName !== el.fieldName);
                                  setDataConfirm(newData);
                                }
                              }}
                            />
                          );
                        })}
                    </div>
                  </div>
                </div>
                <div className="action__confirm">
                  <Button variant="outline" onClick={() => setIsShowColumn(false)}>
                    Đóng
                  </Button>
                  <Button
                    disabled={_.isEqual(dataConfirm, lstFieldActive)}
                    onClick={() => {
                      setIsShowColumn(false);
                      setIsConfirmData(!isConfirmData);
                    }}
                  >
                    Xác nhận
                  </Button>
                </div>
              </div>
            </Popover>
          )}
        </div>
      </Fragment>
    );
  };

  const isBeauty = localStorage.getItem("isBeauty");

  const ActionRenderer = (props) => {
    let data = props.data;
    let params = props.params;

    return (
      <div className="lst__action--cell">
        {isUserRoot && (
          <div
            className="item__action update"
            onClick={() => {
              setDataPartner(data.dataItem);
              setShowModalAddXml(true);
            }}
          >
            <Tippy content="Sửa">
              <span className="icon__item icon__update">
                <Icon name="SettingCashbook" />
              </span>
            </Tippy>
          </div>
        )}
        {permissions["PARTNER_UPDATE"] == 1 && (
          <div
            className="item__action update"
            onClick={() => {
              setDataPartner(data.dataItem);
              setShowModalAdd(true);
            }}
          >
            <Tippy content="Sửa">
              <span className="icon__item icon__update">
                <Icon name="Pencil" />
              </span>
            </Tippy>
          </div>
        )}

        {permissions["PARTNER_DELETE"] == 1 && (
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

  const LinkToAction = ({ data }) => {
    return (
      <Link
        key={data.id}
        to={`/detail_partner/partnerId/${data.id}`}
        onClick={() => {
          localStorage.setItem("backUpUrlPartner", JSON.stringify(params));
        }}
        className="detail-person"
      >
        {data.name}
      </Link>
    );
  };

  const PhoneToAction = (props) => {
    let data = props.data;
    let isShowPhone = props.isShowPhone;
    let valueShowPhone = props.valueShowPhone;
    let idPartner = props.idPartner;

    return (
      <div className="has__phone">
        <span className="view-phone">{isShowPhone && data.id == idPartner && valueShowPhone ? valueShowPhone : data.phoneMasked}</span>
        {data.phoneMasked ? (
          <span className="isEye" onClick={(e) => handClickEye(e, data, data.index, idPartner)}>
            <Icon name={isShowPhone && data.id == idPartner && valueShowPhone ? "EyeSlash" : "Eye"} />
          </span>
        ) : null}
      </div>
    );
  };

  const SocialToAction = ({ data }) => {
    return data.profileLink ? (
      <Link to={data.profileLink} target="_blank">
        Đi tới
      </Link>
    ) : (
      ""
    );
  };

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

  let defaultValueColumnDefs = [
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
      width: 70,
      resizable: false,
      suppressSizeToFit: true,
      cellClass: "text-center",
      headerClass: "text-center",
    },
    { headerName: "Id", field: "id", hide: true },
    { headerName: "dataItem", field: "data", hide: true },
    { headerName: "Tên đối tác", field: "name", cellRenderer: LinkToAction, headerClass: "text-left", cellClass: "text-left" },
    { headerName: "Mã đối tác", field: "code", headerClass: "text-left", cellClass: "text-left" },
    { headerName: "Mã số thuế", field: "taxCode", cellClass: "text-center", headerClass: "text-center" },
    {
      headerName: "Điện thoại",
      //   width: 135,
      field: "phoneMasked",
      cellRenderer: PhoneToAction,
      cellRendererParams: { isShowPhone, valueShowPhone, idPartner },
      cellClass: "text-center",
      headerClass: "text-center",
    },
    {
      headerName: "Địa chỉ",
      // width: 135,
      field: "address",
      headerClass: "text-left",
      cellClass: "text-left",
    },

    // {
    //     headerName: "Trạng thái",
    //     // width: 135,
    //     field: "status",
    // },

    {
      headerName: "Hành động",
      width: isBeauty && isBeauty == "1" ? 185 : 155,
      field: "action",
      cellRendererParams: { params },
      cellRenderer: ActionRenderer,
      cellClass: "text-center",
      headerClass: "text-center",
    },
    {
      headerName: "",
      field: "addColumn",
      width: 70,
      resizable: false,
      suppressSizeToFit: true,
      headerComponent: HeaderButton,
      headerComponentParams: { isShowColumn, setIsShowColumn },
    },
  ];

  const [columnDefs, setColumnDefs] = useState<any>(defaultValueColumnDefs);

  useEffect(() => {
    if (activeTitleHeader === 1) {
      setColumnDefs(defaultValueColumnDefs);
    }
  }, [activeTitleHeader]);

  const defaultFieldCustomer = [
    { id: 1, name: "Email", fieldName: "email", isTable: false },
    { id: 3, name: "Người đại diện pháp luật", fieldName: "contactId", isTable: false },
  ];

  const defaultFieldTableDis = [
    { value: 2, label: "Tên đối tác", fieldName: "name", isTable: true, hide: true },
    { value: 7, label: "Mã đối tác", fieldName: "code", isTable: true, hide: true },
    { value: 8, label: "Mã số thuế", fieldName: "taxCode", isTable: true, hide: true },
    { value: 9, label: "Điện thoại", fieldName: "phone", isTable: true, hide: true },
    { value: 10, label: "Địa chỉ", fieldName: "address", isTable: true, hide: true },
  ];

  const [lstFieldCustomer, setLstFieldCustomer] = useState(defaultFieldCustomer);
  const [lstFieldActive, setLstFieldActive] = useState(() => {
    const storedData = localStorage.getItem("fieldActivePartner");
    return storedData ? JSON.parse(storedData) : [];
  });
  const [lstFieldUnActive, setLstFieldUnActive] = useState([]);

  const [dataConfirm, setDataConfirm] = useState([]);
  const [isConfirmData, setIsConfirmData] = useState<boolean>(false);

  const takeFieldActiveContact = JSON.parse(localStorage.getItem("fieldActivePartner"));

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
          };
        });

      if (dataConfirm && dataConfirm.length > 0) {
        const changeDataConfirm: any = dataConfirm.map((el) => {
          return {
            headerName: el.label,
            field: el.fieldName,
          };
        });

        let elementsToKeep = defaultValueColumnDefs.slice(-2);
        elementsToKeep.unshift(changeDataConfirm);

        let newDataTable = defaultValueColumnDefs.slice(0, -2).concat(elementsToKeep.flat());

        localStorage.setItem("fieldActivePartner", JSON.stringify(dataConfirm));

        setColumnDefs(newDataTable);
        setLstFieldActive(dataConfirm);
      } else {
        localStorage.setItem("fieldActivePartner", JSON.stringify([]));

        setLstFieldActive([]);
        setColumnDefs(defaultValueColumnDefs);
      }

      setLstFieldUnActive(changeLstFieldUnActive);
    }
  }, [isConfirmData, dataConfirm]);

  const [lstCustomerExtraInfo, setLstCustomerExtraInfo] = useState([]);

  const takeColumnCustomer = JSON.parse(localStorage.getItem("widthColumnPartner"));

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

  useEffect(() => {
    if (isShowColumn) {
      setIsConfirmData(false);
    }
  }, [isShowColumn]);

  const [searchField, setSearchField] = useState("");

  const getLstFieldPartner = async (name?: string) => {
    const params = {
      name: name || "",
      limit: 100,
    };

    const response = await PartnerService.filterTable(params);

    if (response.code === 0) {
      const result = response.result.items;
      setLstFieldCustomer([...lstFieldCustomer, ...result]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    getLstFieldPartner();
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
      showToast("Danh sách cơ hội đang bị lỗi", "error");
      return [];
    }
  };

  useEffect(() => {
    if (listPartner && listPartner.length >= 0) {
      const fetchData = async () => {
        const changeDataCustomer = await Promise.all(
          listPartner.map(async (item, index) => {
            const result =
              (await Promise.all(
                rowMapping
                  .filter((el) => el.customerId === item.id)
                  .map(async (item) => {
                    const key = Object.keys(item).find((key) => key !== "customerId");
                    const value = item[key];
                    return {
                      [key]: value,
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
                phoneMasked: item.phoneMasked,
                profileLink: item.profileLink ? "Đi tới" : "",
                lastBoughtDate: item.lastBoughtDate ? moment(item.lastBoughtDate).format("DD/MM/YYYY") : "",
                fee: formatCurrency(+item.fee || "0"),
                paid: formatCurrency(+item.paid || "0"),
                debt: item.debt ? "Tạo" : formatCurrency(+item.debt || "0"),
                createOpportunities: "Tạo",
                gender: item.gender === 1 ? "Nữ" : "Nam",
                birthday: item.birthday ? moment(item.birthday).format("DD/MM/YYYY") : "",
                lstOpportunities: item.custType ? await handleGetOpportunity(item.id) : null,
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
  }, [listPartner, rowMapping, params]);

  useEffect(() => {
    if (lstCustomerExtraInfo && lstCustomerExtraInfo.length > 0 && lstFieldCustomer && lstFieldCustomer.length > 0) {
      const resultArray = [];

      for (const item1 of lstCustomerExtraInfo) {
        for (const item2 of lstFieldCustomer) {
          if (item1.attributeId === item2.id) {
            // Lấy tất cả các thuộc tính của item2
            const keys = Object.keys(item2);

            // Lặp qua các thuộc tính của item2 và kiểm tra có 'fieldName' không
            keys.forEach((key) => {
              if (key === "fieldName") {
                // Thêm đối tượng mới với key và value động
                const dynamicKey = item2[key];
                const dynamicValue = item1.attributeValue;
                const customerId = item1.customerId;

                const dynamicObject = {
                  [dynamicKey]: dynamicValue,
                  customerId: customerId,
                };

                resultArray.push(dynamicObject);
              }
            });

            break;
          }
        }
      }

      setRowMapping(resultArray);
    }
  }, [lstCustomerExtraInfo, lstFieldCustomer]);

  useEffect(() => {
    setColumnDefs((prevColumnDefs) => {
      const newColumnDefs = [...prevColumnDefs];
      // Tìm index của cột cần cập nhật trong mảng columnDefs
      const addColumnIndex = newColumnDefs.findIndex((col) => col.field === "addColumn");
      // Nếu tìm thấy cột, cập nhật giá trị isShowColumn trong headerComponentParams
      if (addColumnIndex !== -1) {
        newColumnDefs[addColumnIndex].headerComponentParams = {
          searchField,
          setSearchField,
          isShowColumn,
          setIsShowColumn,
          isConfirmData,
          setIsConfirmData,
          dataConfirm,
          setDataConfirm,
          lstFieldActive,
          lstFieldUnActive,
        };
      }
      return newColumnDefs;
    });
  }, [isShowColumn, lstFieldActive, lstFieldUnActive, isConfirmData, dataConfirm, searchField]);

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
          idPartner,
        };
      }
      return newColumnDefs;
    });
  }, [isShowPhone, valueShowPhone, idPartner]);

  useEffect(() => {
    if (!isLoading && ((lstCustomerExtraInfo && lstCustomerExtraInfo.length > 0) || (lstFieldCustomer && lstFieldCustomer.length > 0))) {
      const result = lstFieldCustomer.map((item1) => {
        const matchingItem = lstCustomerExtraInfo.find((item2) => item2.attributeId === item1.id);

        return {
          value: item1.id,
          label: item1.name,
          fieldName: item1.fieldName,
          customerId: matchingItem?.customerId,
          isTable: false,
        };
      });

      const checkDataLocalStorage = takeFieldActiveContact
        ? result.filter((item) => {
            return !takeFieldActiveContact.some((el) => el.fieldName === item.fieldName);
          })
        : result;

      setLstFieldUnActive(checkDataLocalStorage);
    }
  }, [lstCustomerExtraInfo, lstFieldCustomer, isLoading]);

  useEffect(() => {
    if (takeFieldActiveContact) {
      const changeDataTakeFieldActiveContact: any = takeFieldActiveContact.map((el) => {
        return {
          headerName: el.label,
          field: el.fieldName,
        };
      });

      let elementsToKeep = defaultValueColumnDefs.slice(-2);
      elementsToKeep.unshift(changeDataTakeFieldActiveContact);

      let newDataTable = defaultValueColumnDefs.slice(0, -2).concat(elementsToKeep.flat());

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
          };
        });

      setTitleExport(changeDataColumnDefs);
    }
  }, [columnDefs]);

  const abortController = new AbortController();
  const getListPartner = async (paramsSearch: any, activeTitleHeader?) => {
    setIsLoading(true);

    const response = await PartnerService.list(paramsSearch, abortController.signal);

    // let response = null;

    // if (activeTitleHeader === 1) {
    //   response = await PartnerService.list(paramsSearch, abortController.signal);
    // } else {
    //   if (!paramsSearch.targetBsnId) {
    //     setListPartner([]);
    //     setIsLoading(false);
    //     setIsNoItem(true);
    //     return;
    //   } else {
    //     response = await CustomerService.listshared(paramsSearch, abortController.signal);
    //   }
    // }

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

      setLstCustomerExtraInfo(changeResult);
      setListPartner(result.items);

      if (activeTitleHeader === 1) {
        setPagination({
          ...pagination,
          page: +result.page,
          sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
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
        getListPartner(params, activeTitleHeader);
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

  //! Đoạn này tạo ra một mảng phục vụ việc tìm kiếm nhanh
  const dataQuickSearchLeft = [
    {
      title: "Tất cả",
      type: "all",
      contactType: -1,
    },
    {
      title: "Mới cập nhật",
      type: "update",
      contactType: 1,
    },
    {
      title: "Đừng quên",
      type: "not_forget",
      contactType: 2,
    },
  ];

  let isUserRoot = localStorage.getItem("user.root") == "1" ? true : false;

  const titleActions: ITitleActions = {
    actions: [
      ...(activeTitleHeader !== 3
        ? [
            isUserRoot && {
              title: "Thêm mới bằng XML",
              callback: () => {
                setDataPartner(null);
                setShowModalAddXml(true);
              },
            },
            permissions["PARTNER_ADD"] == 1 && {
              title: "Thêm mới",
              callback: () => {
                setDataPartner(null);
                setShowModalAdd(true);
              },
            },
          ]
        : []),
    ],
    actions_extra: [
      permissions["PARTNER_IMPORT"] == 1 && {
        title: "Nhập danh sách",
        icon: <Icon name="Upload" />,
        callback: () => {
          setShowModalImport(true);
        },
      },
      permissions["PARTNER_EXPORT"] == 1 && {
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
    setIdPartner(item.id);
    setIsShowPhone(true);
    setIdxCustomer(index);
    setDataPartner(item);

    if (item.id == idCustomer) {
      setIsShowPhone(false);
      setIdPartner(null);
    }
  };

  const formatExcel = ["center", "top", "center", "center", "right", "right", "right"];

  const onDelete = async (id: number, parma: any) => {
    const response = await PartnerService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa đối tác thành công`, "success");
      getListPartner(parma);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalAddXml, setShowModalAddXml] = useState<boolean>(false);
  const [showModalCompanyAdd, setShowModalCompanyAdd] = useState<boolean>(false);
  const [dataPartner, setDataPartner] = useState<ICustomerResponse>(null);

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

  const onDeleteAllPartner = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        PartnerService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa đối tác thành công", "success");
        getListPartner(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: ICustomerResponse, param?: any, dataCheckDeleteCustomer?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa đối tác</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa{" "}
          {item ? (
            <span>
              khách hàng <strong>{item.name}</strong>
            </span>
          ) : (
            <span>
              <strong>{listIdChecked.length}</strong> đối tác đã chọn
            </span>
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
          onDeleteAllPartner();
        } else {
          onDelete(item.id, param);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [showModalOther, setShowModalOther] = useState<boolean>(false);

  const bulkActionList: BulkActionItemModel[] = [
    permissions["PARTNER_DELETE"] == 1 && {
      title: "Xóa đối tác",
      callback: () => handleCheckCustomerDelete(),
    },
  ];

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);

  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả đối tác ",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} đối tác phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, params]
  );

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await PartnerService.list({
        ...params,
        // page: type === "current_page" ? 1 : params.page,
        page: type === "current_page" ? params.page || 1 : 1,
        limit: type === "all" || type === "current_search" ? 10000 : params.limit,
      });

      if (response.code === 0) {
        const result = response.result;

        // if (extension === "excel") {
        //   ExportExcel({
        //     fileName: "KhachHang",
        //     title: "Khách hàng",
        //     header: titles("export"),
        //     formatExcel: formatExcel,
        //     data: result.map((item, idx) => dataMappingArray(item, idx, "export")),
        //     info: { name },
        //   });
        // }

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

        const resultArray = [];

        for (const item1 of changeResult) {
          for (const item2 of lstFieldCustomer) {
            if (item1.attributeId === item2.id) {
              // Lấy tất cả các thuộc tính của item2
              const keys = Object.keys(item2);

              // Lặp qua các thuộc tính của item2 và kiểm tra có 'fieldName' không
              keys.forEach((key) => {
                if (key === "fieldName") {
                  // Thêm đối tượng mới với key và value động
                  const dynamicKey = item2[key];
                  const dynamicValue = item1.attributeValue;
                  const customerId = item1.customerId;

                  const dynamicObject = {
                    [dynamicKey]: dynamicValue,
                    customerId: customerId,
                  };

                  resultArray.push(dynamicObject);
                }
              });

              break;
            }
          }
        }

        const dataExport: any = result.items.map((item, index) => {
          const result = rowMapping.filter((el) => el.partnerId === item.id) || [];

          const changeDataResult = result.map((item) => {
            const key = Object.keys(item).find((key) => key !== "partnerId");
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
              code: item.code,
              taxCode: item.taxCode,
              phoneMasked: item.phoneMasked,
              address: item.address,
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
            fileName: "DoiTac",
            title: "Đối tác",
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

  const handlClickOptionRelationship = (e, id) => {
    setIdRelationship(id);
    if (activeTitleHeader === 1) {
      setParams({ ...params, relationshipId: id });
    } else {
      setParamsCustomerPartner((prevParams) => ({ ...prevParams, relationshipId: id }));
    }

    if (id == idRelationship) {
      setIdRelationship(0);
      if (activeTitleHeader === 1) {
        setParams({ ...params, relationshipId: 0 });
      } else {
        setParamsCustomerPartner((prevParams) => ({ ...prevParams, relationshipId: 0 }));
      }
    }
  };

  const handShowPhone = async (id: number) => {
    const response = await PartnerService.viewPhone(id);
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
    if (isShowPhone && idPartner) {
      handShowPhone(idPartner);
    }
  }, [isShowPhone, idPartner]);

  useEffect(() => {
    if (dataPartner && valueShowPhone && idPartner) {
      setListPartner((prevState) => {
        const newArray = [...prevState];

        newArray[idxCustomer] = { ...newArray[idxCustomer], phoneMasked: dataPartner?.phoneMasked };

        return newArray;
      });
    }

    if (!isShowPhone && dataPartner) {
      setListPartner((prevState) => {
        const newArray = [...prevState];

        newArray[idxCustomer] = { ...newArray[idxCustomer], phoneMasked: dataPartner?.phoneMasked };

        return newArray;
      });
    }
  }, [valueShowPhone, idxCustomer, idPartner, dataPartner, isShowPhone]);

  const lstTitleHeader = [
    {
      name: "Danh sách đối tác",
      type: 1,
    },
    // {
    //   name: "Phân tích nguồn khách hàng",
    //   type: 2,
    // },
    // {
    //   name: "Danh sách khách hàng của đối tác",
    //   type: 3,
    // },
    {
      name: "Báo cáo đối tác",
      type: 4,
    },
  ];

  const [pushCampaign, setPushCampaign] = useState<boolean>(false);

  return (
    <Fragment>
      <div
        className={`page-content page-partner${isNoItem ? " bg-white" : ""}${showPageSendSMS ? " d-none" : ""}${showPageSendEmail ? " d-none" : ""}`}
      >
        <TitleAction title="Đối tác" titleActions={titleActions} />
        <div className="card-box d-flex flex-column">
          <div className="search__box--partner">
            <ul className="line__height--partner">
              {lstTitleHeader.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className={`item-title ${activeTitleHeader === item.type ? "active__item--title" : ""}`}
                    onClick={() => setActiveTitleHeader(item.type)}
                  >
                    {item.name}
                  </li>
                );
              })}
            </ul>

            {activeTitleHeader !== 2 && (
              <div className="desc__search">
                <SearchBox
                  name="Đối tác"
                  placeholderSearch="Tìm kiếm theo tên/ SĐT/ Mã đối tác"
                  params={params}
                  isFilter={false}
                  isSaveSearch={false}
                  isHiddenSearch={activeTitleHeader === 4 ? true : false}
                  listSaveSearch={listSaveSearch}
                  listFilterItem={customerFilterList}
                  updateParams={(paramsNew) => {
                    setParams(paramsNew);
                  }}
                />
              </div>
            )}
          </div>

          {
            activeTitleHeader === 1 || activeTitleHeader === 3 ? (
              !isLoading && listPartner && listPartner.length > 0 ? (
                <BoxTableAdvanced
                  name="Đối tác"
                  columnDefs={columnDefs}
                  rowData={rowData}
                  dragColumnDefs={false}
                  isPagination={true}
                  dataPagination={pagination}
                  isBulkAction={true}
                  bulkActionItems={bulkActionList}
                  listIdChecked={activeTitleHeader === 1 ? listIdChecked : null}
                  widthColumns={widthColumns}
                  setWidthColumns={(data) => setWidthColumns(data)}
                  setListIdChecked={(listId, lstData) => {
                    takeChangeDataCustomer(lstData);
                    setListIdChecked(listId);
                  }}
                />
              ) : isLoading ? (
                <Loading />
              ) : (
                <Fragment>
                  {isNoItem ? (
                    <SystemNotification
                      description={
                        <span>
                          Hiện tại chưa có đối tác nào. <br />
                          {activeTitleHeader === 1 ? `Hãy thêm mới đối tác đầu tiên nhé!` : ""}
                        </span>
                      }
                      type="no-item"
                      titleButton={activeTitleHeader === 1 ? "Thêm mới đối tác" : ""}
                      action={() => {
                        if (activeTitleHeader === 1) {
                          setDataPartner(null);
                          setShowModalAdd(true);
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
              )
            ) : activeTitleHeader === 4 ? (
              <>
                <ReportPartner />
              </>
            ) : null
            // (
            //     <CustomerSourceAnalysis />
            // )
          }
        </div>
        <ModalAddPartner
          onShow={showModalAdd}
          data={dataPartner}
          onHide={(reload, nextModal) => {
            if (reload) {
              getListPartner(params);
            }
            setShowModalAdd(false);
          }}
        />
        <XmlAddPartner
          onShow={showModalAddXml}
          // onShow={true}
          data={dataPartner}
          onHide={(reload, nextModal) => {
            if (reload) {
              getListPartner(params);
            }
            setShowModalAddXml(false);
          }}
        />

        {/* Khách hàng doanh nghiệp */}
        {/* <AddCustomerCompanyModal
          onShow={showModalCompanyAdd}
          data={dataCustomer}
          onHide={(reload, nextModal) => {
            if (reload) {
              getListCustomer(params);
            }
            setShowModalCompanyAdd(false);

            if (nextModal) {
              setShowModalAdd(true);
            }
          }}
        /> */}
        <ExportModal
          name="Đối tác"
          onShow={onShowModalExport}
          onHide={() => setOnShowModalExport(false)}
          options={optionsExport}
          callback={(type, extension) => exportCallback(type, extension)}
        />
        <ImportModal
          name="Nhập danh sách đối tác"
          onShow={showModalImport}
          onHide={(reload) => {
            if (reload) {
              getListPartner(params);
            }
            setShowModalImport(false);
          }}
          type="partner"
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </Fragment>
  );
}
