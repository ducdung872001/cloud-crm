/* eslint-disable prefer-const */
import React, { Fragment, useState, useEffect, useRef, useMemo, useCallback, useContext } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch, IFilterItem, IOption } from "model/OtherModel";
import { IContractFilterRequest } from "model/contract/ContractRequestModel";
import { IContractResponse } from "model/contract/ContractResponseModel";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, formatCurrency, getPageOffset, getSearchParameters, isDifferenceObj, trimContent } from "reborn-util";
import { getPermissions } from "utils/common";
import ContractService from "services/ContractService";
import "./GuaranteeContract.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { useOnClickOutside, useWindowDimensions } from "utils/hookCustom";
import SwiperCore, { Navigation, Grid } from "swiper";
//Tham chiếu bên Khách hàng

//Tham chiếu bên tổng đài

import { ICustomPlaceholderResponse } from "model/customPlaceholder/CustomPlaceholderResponseModel";
import moment from "moment";
import { ExportExcel } from "exports";
import ExportModal from "components/exportModal/exportModal";
import Button from "components/button/button";
import Checkbox from "components/checkbox/checkbox";
import Popover from "components/popover/popover";
import Input from "components/input/input";
import Tippy from "@tippyjs/react";
import BoxTableAdvanced from "components/boxTableAdvanced/boxTableAdvanced";
import { ContextType, UserContext } from "contexts/userContext";
import ModalAddGuarantee from "./partials/ModalAddGuarantee";
import ContractGuaranteeService from "services/ContractGuaranteeService";
import WarningGuaranteeModal from "./WarningGuaranteeModal/WarningGuaranteeModal";
import ImportModal from "./ImportModal";
import ReportGuarantee from "./ReportGuarantee";

export default function GuaranteeContractList() {
  const navigate = useNavigate();
  document.title = "Danh sách bảo lãnh";

  const isMounted = useRef(false);
  const { width } = useWindowDimensions();
  const { dataBranch, dataInfoEmployee } = useContext(UserContext) as ContextType;

  const takeParamsUrl = getSearchParameters();
  // console.log('takeParamsUrl', takeParamsUrl);

  const [searchParams, setSearchParams] = useSearchParams();

  const [listGuarantee, setListGuaranteet] = useState([]);

  const [dataGuarantee, setDataGuarantee] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const [showModalImport, setShowModalImport] = useState<boolean>(false);

  const [params, setParams] = useState<IContractFilterRequest>({
    name: "",
    limit: 10,
    page: 1,
  });

  const [tab, setTab] = useState({
    name: "tab_one",
    type: 1,
  });

  const listTabs = [
    {
      title: "Danh sách bảo lãnh",
      is_active: "tab_one",
      type: 1,
    },
    // {
    //   title: "Hợp đồng sắp hết hạn",
    //   is_active: "tab_two",
    //   type: 2,
    // },
    {
      title: "Báo cáo bảo lãnh",
      is_active: "tab_three",
      type: 3,
    },
  ];

  const contractFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "affectedDate",
        name: "Thời gian hiệu lực",
        type: "date-two",
        param_name: ["fmtStartAffectedDate", "fmtEndAffectedDate"],
        is_featured: true,
        value: searchParams.get("fmtStartAffectedDate") ?? "",
        value_extra: searchParams.get("fmtEndAffectedDate") ?? "",
        is_fmt_text: true,
      },
      {
        key: "endDate",
        name: "Thời gian hết hạn",
        type: "date-two",
        param_name: ["fmtStartEndDate", "fmtEndEndDate"],
        is_featured: true,
        value: searchParams.get("fmtStartEndDate") ?? "",
        value_extra: searchParams.get("fmtEndEndDate") ?? "",
        is_fmt_text: true,
      },
      // {
      //   key: "pipelineId",
      //   name: "Loại hợp đồng",
      //   type: "select",
      //   is_featured: true,
      //   value: searchParams.get("pipelineId") ?? "",
      // },

      {
        key: "customerId",
        name: "Khách hàng",
        type: "select",
        is_featured: true,
        value: searchParams.get("customerId") ?? "",
      },

      // {
      //   key: "projectId",
      //   name: "Dự án",
      //   type: "select",
      //   is_featured: true,
      //   value: searchParams.get("projectId") ?? "",
      // },
      {
        key: "sourceId",
        name: "Đối tượng khách hàng",
        type: "select",
        is_featured: true,
        value: searchParams.get("sourceId") ?? "",
      },
      {
        key: "cgpId",
        name: "Phân loại khách hàng",
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
    ],
    [searchParams]
  );

  //   useEffect(() => {
  //     if (dataBranch) {
  //       setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
  //     }
  //   }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh sách bảo lãnh",
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
    const storedData = localStorage.getItem("widthColumnContract");
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

      localStorage.setItem("widthColumnContract", JSON.stringify(uniqueWidths));
    }
  }, [widthColumns]);

  const [showModalWarning, setShowModalWarning] = useState<boolean>(false);

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

    showModalWarning,
    setShowModalWarning,
  }) => {
    return (
      <Fragment>
        <div style={{ display: "flex", marginRight: 20 }}>
          {/* <div className="custom-header">
            <button onClick={() => setShowModalWarning(true)}>
              <Tippy content="Cảnh báo bảo lãnh hợp đồng">
                <span>
                  <Icon name="Bell" />
                </span>
              </Tippy>
            </button>
          </div> */}

          {/* <div className="custom-header" ref={refColumnContainer}>
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
                        getLstFieldContract(value);
                      }}
                      placeholder="Tìm kiếm tên trường"
                    />
                  </div>
                  <div className="lst__columns">
                    <div className="lst__columns--show">
                      <div className="summary__qty--column">
                        <span className="title__show--column">Các trường hiển thị trong bảng</span>
                        <span className="qty-total">{`${lstFieldActive.length}/${lstFieldActive.length + lstFieldUnActive.length}`}</span>
                      </div>
                      <div className="lst__items lst__items--show">
                        {lstFieldActive &&
                          lstFieldActive.length > 0 &&
                          lstFieldActive.map((el, idx) => {
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
          </div> */}
        </div>
      </Fragment>
    );
  };

  const ActionRenderer = ({ data }) => {
    return (
      <div className="lst__action--cell">
        <div
          className="item__action view__guarantee"
          onClick={() => {
            navigate(`/detail_guarantee/guaranteeId/${data.id}`);
            localStorage.setItem("backUpUrlGuarantee", JSON.stringify(params));
          }}
        >
          <Tippy content="Xem chi tiết bảo lãnh">
            <span className="icon__item icon__view--contract">
              <Icon name="Eye" />
            </span>
          </Tippy>
        </div>

        {permissions["GUARANTEE_UPDATE"] == 1 && (
          <div
            className="item__action update"
            onClick={() => {
              setDataGuarantee(data.dataItem);
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

        {permissions["GUARANTEE_DELETE"] == 1 && (
          <div className="item__action delete" onClick={() => showDialogConfirmDelete(data)}>
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

  const BoxViewStatus = ({ data }) => {
    const status = data.dataItem.status;

    return (
      <span
        className={`status__item--signature status__item--signature-${
          !status ? "secondary" : status === 1 ? "primary" : status === 2 ? "success" : "error"
        }`}
      >
        {!status ? "Chưa phê duyệt" : status === 1 ? "Đang xử lý" : status === 2 ? "Đã phê duyệt" : "Từ chối duyệt"}
      </span>
    );
  };

  const LinkToAction = ({ data }) => {
    return (
      // <Link key={data.id} to={`/detail_contract/contractId/${data.id}`} onClick={() => {}} className="detail-contract">
      //   {data.name}
      // </Link>
      <div
        className="detail-contract"
        onClick={() => {
          navigate(`/detail_guarantee/guaranteeId/${data.id}`);
          localStorage.setItem("backUpUrlGuarantee", JSON.stringify(params));
        }}
      >
        {data.numberLetter}
      </div>
    );
  };

  const ContractLinkToAction = ({ data }) => {
    return (
      // <Link key={data.id} to={`/detail_contract/contractId/${data.id}`} onClick={() => {}} className="detail-contract">
      //   {data.name}
      // </Link>
      <div
        className="detail-contract"
        onClick={() => {
          navigate(`/detail_guarantee/guaranteeId/${data.id}`);
          localStorage.setItem("backUpUrlGuarantee", JSON.stringify(params));
        }}
      >
        {data.contractName}
      </div>
    );
  };

  const LinkToCustomer = ({ data }) => {
    return (
      <div
        className="detail-customer"
        onClick={() => {
          window.open(`/crm/detail_person/customerId/${data?.dataItem?.customerId}/not_purchase_invoice`, "_blank").focus();
        }}
      >
        {data?.dataItem?.customerName}
      </div>
    );
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
      width: 64,
      //   resizable: false,
      suppressSizeToFit: true,
    },
    { headerName: "Id", field: "id", hide: true },
    { headerName: "dataItem", field: "data", hide: true },
    {
      headerName: "Số thư bảo lãnh",
      field: "numberLetter",
      cellRenderer: LinkToAction,
    },
    {
      headerName: "Hợp đồng gốc",
      field: "contractName",
      width: 280,
      cellRenderer: ContractLinkToAction,
    },
    {
      headerName: "Loại bảo lãnh",
      field: "guaranteeTypeName",
    },
    {
      headerName: "Nghiệp vụ bảo lãnh",
      field: "competencyName",
    },
    {
      headerName: "Ngày bắt đầu 1",
      field: "startDate",
      cellStyle: { display: 'flex', justifyContent: 'center'},
    },
    {
      headerName: "Ngày hết hạn",
      field: "endDate",
      cellStyle: { display: 'flex', justifyContent: 'center'},
      //   cellRenderer: LinkToCustomer,
    },
    {
      headerName: "Giá trị bảo lãnh",
      field: "value",
      cellStyle: { display: 'flex', justifyContent: 'flex-end'},
    },
    {
      headerName: "Giá trị hợp đồng",
      field: "contractValue",
      cellStyle: { display: 'flex', justifyContent: 'flex-end'},
    },
    // {
    //   headerName: "Trạng thái",
    //   field: "status",
    //   cellRenderer: BoxViewStatus,
    // },
    { 
      headerName: "Hành động", 
      cellRenderer: ActionRenderer, 
      width: 180, 
      resizable: false, 
      suppressSizeToFit: true,
      cellStyle: { display: 'flex', justifyContent: 'center'},
    },
    {
      headerName: "",
      field: "addColumn",
      width: 70,
      resizable: false,
      suppressSizeToFit: true,
      headerComponent: HeaderButton,
      headerComponentParams: { isShowColumn, setIsShowColumn, showModalWarning, setShowModalWarning },
    },
  ];

  const [columnDefs, setColumnDefs] = useState<any>(defaultValueColumnDefs);
  const [lstFieldContract, setLstFieldContract] = useState([]);
  const [lstFieldActive, setLstFieldActive] = useState([]);
  const [lstFieldUnActive, setLstFieldUnActive] = useState([]);

  const [dataConfirm, setDataConfirm] = useState([]);
  const [isConfirmData, setIsConfirmData] = useState<boolean>(false);

  const [lstContractExtraInfo, setLstContractExtraInfo] = useState([]);

  const takeColumnContract = JSON.parse(localStorage.getItem("widthColumnContract"));

  useEffect(() => {
    if (takeColumnContract) {
      const changeDataColumnDefs = columnDefs.map((item) => {
        const matchingColumn = takeColumnContract.find((el) => item.field === el.colId);

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
  }, [lstContractExtraInfo]);

  useEffect(() => {
    if (isConfirmData) {
      const changeLstFieldUnActive = lstFieldContract
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

        localStorage.setItem("fieldActiveContract", JSON.stringify(dataConfirm));

        setColumnDefs(newDataTable);
        setLstFieldActive(dataConfirm);
      } else {
        localStorage.setItem("fieldActiveContract", JSON.stringify([]));

        setLstFieldActive([]);
        setColumnDefs(defaultValueColumnDefs);
      }

      setLstFieldUnActive(changeLstFieldUnActive);
    }
  }, [isConfirmData, dataConfirm]);

  useEffect(() => {
    if (isShowColumn) {
      setIsConfirmData(false);
    }
  }, [isShowColumn]);

  const [searchField, setSearchField] = useState("");

  const getLstFieldContract = async (name?: string) => {
    const params = {
      name: name || "",
      limit: 100,
    };

    const response = await ContractService.fieldTable(params);

    if (response.code === 0) {
      const result = response.result.items;
      setLstFieldContract(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    getLstFieldContract();
  }, []);

  const [rowData, setRowData] = useState([]);
  const [rowMapping, setRowMapping] = useState([]);

  useEffect(() => {
    if (listGuarantee && listGuarantee.length >= 0) {
      const changeDataGuarantee: any = listGuarantee.map((item, index) => {
        // console.log("item.dealValue", item.dealValue);

        const result = rowMapping.filter((el) => el.contractId === item.id) || [];

        const changeDataResult = result.map((item) => {
          const key = Object.keys(item).find((key) => key !== "contractId");
          const value = item[key];
          return {
            [key]: value,
          };
        });

        const body = Object.assign(
          {
            idx: getPageOffset(params) + index + 1,
            id: item.id,
            dataItem: item,
            name: item.name,
            numberLetter: item.numberLetter,
            contractName: item.contract?.name || "",
            guaranteeTypeName: item.guaranteeType?.name || "",
            competencyName: item.competency?.name || "",
            startDate: item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : "",
            endDate: item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
            value: formatCurrency(+item.value || "0"),
            contractValue: formatCurrency(+item.contractValue || "0"),
          },
          ...changeDataResult
        );

        return body;
      });

      setRowData(changeDataGuarantee);
    }
  }, [listGuarantee, rowMapping]);

  useEffect(() => {
    if (lstContractExtraInfo && lstContractExtraInfo.length > 0 && lstFieldContract && lstFieldContract.length > 0) {
      const resultArray = [];

      for (const item1 of lstContractExtraInfo) {
        for (const item2 of lstFieldContract) {
          if (item1.attributeId === item2.id) {
            // Lấy tất cả các thuộc tính của item2
            const keys = Object.keys(item2);

            // Lặp qua các thuộc tính của item2 và kiểm tra có 'fieldName' không
            keys.forEach((key) => {
              if (key === "fieldName") {
                // Thêm đối tượng mới với key và value động
                const dynamicKey = item2[key];
                const dynamicValue = item1.attributeValue;
                const contractId = item1.contractId;

                const dynamicObject = {
                  [dynamicKey]: dynamicValue,
                  contractId: contractId,
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
  }, [lstContractExtraInfo, lstFieldContract]);

  useEffect(() => {
    // Gọi setColumnDefs khi isShowColumn thay đổi
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
          showModalWarning,
          setShowModalWarning,
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
  }, [isShowColumn, showModalWarning, lstFieldActive, lstFieldUnActive, isConfirmData, dataConfirm, searchField]);

  const takeFieldActiveContact = JSON.parse(localStorage.getItem("fieldActiveContract"));

  useEffect(() => {
    if (!isLoading && ((lstContractExtraInfo && lstContractExtraInfo.length > 0) || (lstFieldContract && lstFieldContract.length > 0))) {
      const result = lstFieldContract.map((item1) => {
        const matchingItem = lstContractExtraInfo.find((item2) => item2.attributeId === item1.id);

        return {
          value: item1.id,
          label: item1.name,
          fieldName: item1.fieldName,
          contractId: matchingItem?.contractId,
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
  }, [lstContractExtraInfo, lstFieldContract, isLoading]);

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

  const abortController = new AbortController();

  const getListGuarantee = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ContractGuaranteeService.list(paramsSearch, abortController.signal);
    // console.log('responseListContrat', response);

    if (response.code === 0) {
      const result = response.result;
      const changeDataResult = result.items
        .filter((item) => item.contractExtraInfos?.length > 0)
        .map((el) => el.contractExtraInfos)
        .flat()
        .map((ol) => {
          if (ol.datatype === "date") {
            return { ...ol, attributeValue: moment(ol.attributeValue).format("DD/MM/YYYY") };
          }

          return ol;
        });
      setLstContractExtraInfo(changeDataResult);

      const listContract = result?.items || [];
      let newListContact = [];
      if (listContract && listContract.length > 0) {
        listContract.map((item) => {
          let contractStep = null;
          if (item.lstContractStep && item.lstContractStep.length > 0) {
            contractStep = item.lstContractStep.find((el) => el.pipelineId === paramsSearch.pipelineId) || null;
          }
          newListContact.push({
            ...item,
            approachId: contractStep?.approachId || null,
          });
        });
      }
      // console.log('newListContact', newListContact);

      setListGuaranteet(newListContact);
      // setListContract(result?.items);

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
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      if (tab.type === 1) {
        getListGuarantee(params);
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
  }, [params]);

  const titleActions: ITitleActions = {
    // actions: [
    //   permissions["CONTRACT_ADD"] == 1 && {
    //     title: "Thêm mới",
    //     callback: () => {
    //       navigate('/create_contract');
    //     },
    //   },
    // ],

    actions: [
      permissions["GUARANTEE_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setShowModalAdd(true);
          setDataGuarantee(null);
        },
      },
    ],

    actions_extra: [
      permissions["GUARANTEE_IMPORT"] == 1 && {
        title: "Nhập danh sách",
        // title: t('import'),
        icon: <Icon name="Upload" />,
        callback: () => {
          setShowModalImport(true);
        },
      },

      permissions["GUARANTEE_EXPORT"] == 1 && {
        title: "Xuất danh sách",
        // title: t('export'),
        icon: <Icon name="Download" />,
        callback: () => {
          setOnShowModalExport(true);
          // setShowModalExport(true);
        },
      },
    ],
  };

  const titles = (type: string) => {
    return type
      ? [
          "STT",
          "Số thư bảo lãnh",
          "Hợp đồng gốc",
          "Loại bảo lãnh",
          "Nghiệp vụ bảo lãnh",
          "Ngày bắt đầu",
          "Ngày hết hạn",
          "Giá trị bảo lãnh",
          "Giá trị hợp đồng",
        ]
      : ["STT", "Tên hợp đồng", "Giá trị hợp đồng", "Giai đoạn HĐ", "Loại HĐ", "Tên công ty"];
  };

  const dataFormat = ["text-center", "", "text-right", "", "", ""]; //"text-right"
  const formatExcel = ["center", "", "", "", "", "center", "center", "right", "right"];

  const dataMappingArray = (item: any, index: number, type?: string) => [
    getPageOffset(params) + index + 1,
    ...(type !== "export"
      ? [
          item.name,

          formatCurrency(item.dealValue, ","),
          item.approachName,
          item.pipelineName,
          <label key={item.id} title={item.customerName}>
            {/* {trimContent(item.customerName, 17)} */}
            {item.customerName}
          </label>,
          // "456.8", //Diện tích NFA => Các trường thông tin động
          // "Tòa GSS", //Tên dự án/Tòa nhà
        ]
      : [
          item.numberLetter,
          item.contract?.name || "",
          item.guaranteeType?.name || "",
          item.competency?.name || "",
          item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : "",
          item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
          formatCurrency(+item.value || "0"),
          formatCurrency(+item.contractValue || "0"),
        ]),
  ];

  const onDelete = async (id: number) => {
    const response = await ContractGuaranteeService.delete(id);
    if (response.code === 0) {
      showToast("Xóa bảo lãnh thành công", "success");
      getListGuarantee(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllContractGuarantee = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        ContractGuaranteeService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa bảo lãnh thành công", "success");
        getListGuarantee(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IContractResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "bảo lãnh " : `${listIdChecked.length} bảo lãnh đã chọn`}
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
          onDeleteAllContractGuarantee();
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
      title: "Xóa bảo lãnh",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);
  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả danh sách bảo lãnh",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} bảo lãnh phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, listIdChecked, params]
  );

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await ContractGuaranteeService.list(
        type === "all"
          ? {
              page: 1,
              limit: 1000,
            }
          : {
              ...params,
              page: type === "current_page" ? params.page || 1 : 1,
              limit: type === "all" || type === "current_search" ? 10000 : params.limit,
            }
      );

      if (response.code === 0) {
        const result = response.result.items;

        if (extension === "excel") {
          ExportExcel({
            fileName: "DanhSachBaoLanh",
            title: "Danh sách bảo lãnh",
            header: titles("export"),
            formatExcel: formatExcel,
            data: result.map((item, idx) => dataMappingArray(item, idx, "export")),
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
    [params]
  );

  return (
    <div className={`page-content page-guarantee${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Danh sách bảo lãnh" titleActions={titleActions} />

      <div className={`card-box d-flex flex-column`}>
        <div>
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

              <Tippy content="Cảnh báo bảo lãnh hợp đồng">
                <div
                  className="notify_action"
                  onClick={() => {
                    setShowModalWarning(true);
                  }}
                >
                  <Icon name="Bell" style={{ width: 19 }} />
                </div>
              </Tippy>
            </div>

            {tab?.type === 1 && (
              <SearchBox
                name="Tên hợp đồng gốc"
                params={params}
                isFilter={false}
                // isSaveSearch={true}
                // listSaveSearch={listSaveSearch}
                isHiddenSearch={false}
                listFilterItem={contractFilterList}
                updateParams={(paramsNew) => setParams(paramsNew)}
              />
            )}
          </div>
          {tab.type === 1 ? (
            !isLoading && listGuarantee && listGuarantee.length > 0 ? (
              <BoxTableAdvanced
                name="Hợp đồng"
                columnDefs={columnDefs}
                rowData={rowData}
                isPagination={true}
                dataPagination={pagination}
                isBulkAction={true}
                widthColumns={widthColumns}
                setWidthColumns={(data) => setWidthColumns(data)}
                bulkActionItems={bulkActionList}
                listIdChecked={listIdChecked}
                setListIdChecked={(listId) => setListIdChecked(listId)}
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
                        Hiện tại chưa có bảo lãnh nào. <br />
                        Hãy thêm mới bảo lãnh đầu tiên nhé!
                      </span>
                    }
                    type="no-item"
                    titleButton="Thêm mới bảo lãnh"
                    action={() => {
                      navigate("/create_contract");
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
          ) : tab.type === 3 ? (
            <>
              <ReportGuarantee />
            </>
          ) : null}
        </div>

        <Dialog content={contentDialog} isOpen={showDialog} />

        {/* <ImportModal
          onShow={showModalImport}
          onHide={(reload) => {
            if (reload) {
              getListGuarantee(params);
            }
            setShowModalImport(false);
          }}
          type="contract"
          name="Nhập danh sách bảo lãnh"
        /> */}
        <ImportModal
          name="Nhập danh sách bảo lãnh"
          onShow={showModalImport}
          onHide={(reload) => {
            if (reload) {
              getListGuarantee(params);
            }
            setShowModalImport(false);
          }}
        />

        <ExportModal
          name="Danh sách bảo lãnh"
          onShow={onShowModalExport}
          onHide={() => setOnShowModalExport(false)}
          options={optionsExport}
          callback={(type, extension) => exportCallback(type, extension)}
        />
        <ModalAddGuarantee
          onShow={showModalAdd}
          data={dataGuarantee}
          onHide={(reload) => {
            if (reload) {
              getListGuarantee(params);
            }
            setShowModalAdd(false);
          }}
        />

        <WarningGuaranteeModal
          onShow={showModalWarning}
          dataContract={dataGuarantee}
          onHide={(reload) => {
            if (reload) {
              getListGuarantee(params);
            }
            setShowModalWarning(false);
            setDataGuarantee(null);
          }}
        />
      </div>
    </div>
  );
}
