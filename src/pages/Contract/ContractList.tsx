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
import SendEmailModal from "./partials/SendEmailModal";
import "./ContractList.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { SelectOptionData } from "utils/selectCommon";
import { useOnClickOutside, useWindowDimensions } from "utils/hookCustom";
import SwiperCore, { Navigation, Grid } from "swiper";
import KanbanContract from "./KanbanContract/KanbanContract";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import CustomerService from "services/CustomerService";
//Tham chiếu bên Khách hàng
import AddCustomerSMSModal from "../CustomerPerson/partials/DetailPerson/partials/ListDetailTab/partials/CustomerSMSList/partials/AddCustomerSMSModal";

//Tham chiếu bên tổng đài
import AddPhoneModal from "../CallCenter/partials/AddPhoneModal/index";

import { ICustomPlaceholderResponse } from "model/customPlaceholder/CustomPlaceholderResponseModel";
import AdvancedDateFilter from "./AdvancedDateFilter/AdvancedDateFilter";
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
import ContractApproachService from "services/ContractApproachService";
import AddSignerFSAndQuote from "pages/Common/AddSignerFSAndQuote";
import ViewHistorySignature from "pages/Common/ViewHistorySignature";
import WarningContractModal from "./WarningContractModal/WarningContractModal";
import StatisticContract from "./StatisticContract/StatisticContract";
import ImportModal from "./ImportModal";
import ChangeSignedStatusModal from "./ChangeSignedStatusModal/ChangeSignedStatusModal";
import ChangeContractStatusModal from "./ChangeContractStatusModal/ChangeContractStatusModal";
import CreateContractsXML from "./CreateContractsXML";

// contractStatus	(Trạng thái hợp đồng)
// Chưa phê duyệt	0
// Đang phê duyệt	1
// Đang thực hiện	2
// Đóng hợp đồng	3
// Lưu trữ (Thất bại)	4
// Lưu trữ (Thành công)	5

// status (Trạng thái trình ký)
// 0	Chưa trình ký
// 1	Đã trình ký
// 2	Đã phê duyệt
// 3	Từ chối phê duyệt
// 4	Tạm dừng luồng ký

export default function ContractList() {
  const navigate = useNavigate();
  document.title = "Danh sách hợp đồng";

  const checkIsKanban = localStorage.getItem("isKanbanContract");
  const checkPipelineContractId = localStorage.getItem("pipelineContractId");

  const swiperRelationshipRef = useRef(null);
  const swiperPipelineRef = useRef(null);

  const isMounted = useRef(false);
  const { width } = useWindowDimensions();
  const { dataBranch, dataInfoEmployee } = useContext(UserContext) as ContextType;

  const takeParamsUrl = getSearchParameters();

  const [searchParams, setSearchParams] = useSearchParams();

  const [listContract, setListContract] = useState<IContractResponse[]>([]);

  const [dataContract, setDataContract] = useState<IContractResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);

  const [showModalSendEmail, setShowModalSendEmail] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(checkIsKanban ? JSON.parse(checkIsKanban) : false);
  useEffect(() => {
    localStorage.setItem("isKanbanContract", JSON.stringify(isRegimeKanban));
  }, [isRegimeKanban]);

  const [listPipeline, setListPipeline] = useState<IOption[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [codes, setCodes] = useState<ICustomPlaceholderResponse>(null);
  const [showModalPlaceholder, setShowModalPlaceholder] = useState<boolean>(false);
  const [dataCustomer, setDataCustomer] = useState<ICustomerResponse>(null);
  const [showModalPhone, setShowModalPhone] = useState<boolean>(false);
  const [showModalAddXml, setShowModalAddXml] = useState<boolean>(false);

  const [isLoadingPipeline, setIsLoadingPipeline] = useState<boolean>(false);
  // const [contractType, setContractType] = useState<number>(() => {
  //   return takeParamsUrl?.pipelineId ? takeParamsUrl?.pipelineId : -1;
  // });

  const [contractType, setContractType] = useState(checkPipelineContractId ? JSON.parse(checkPipelineContractId) : -1);

  useEffect(() => {
    localStorage.setItem("pipelineContractId", JSON.stringify(contractType));
  }, [contractType]);

  // const [approachId, setApproachId] = useState<number>(() => {
  //   return takeParamsUrl?.approachId ? takeParamsUrl?.approachId : -1;
  // });

  const [listApproach, setListApproach] = useState([]);
  const [showModalImport, setShowModalImport] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  const [params, setParams] = useState<IContractFilterRequest>({
    name: "",
    pipelineId: -1,
    // approachId: -1,
    limit: 10,
  });

  const [paramsTab2, setParamsTab2] = useState<IContractFilterRequest>({
    name: "",
    pipelineId: -1,
    // approachId: -1,
    limit: 10,
  });

  useEffect(() => {
    setParams({ ...params, pipelineId: contractType, page: 1 });
    setParamsTab2({ ...params, pipelineId: contractType, page: 1 });
    getOptionApproach(contractType);
    // setApproachId(-1);
  }, [contractType]);

  const [tab, setTab] = useState({
    name: "tab_one",
    type: 1,
  });

  // useEffect(() => {
  //   //Note: đoạn set lại state này với mục đích là khi mà mình chuyển tab thì nó sẽ tự update lại type
  //   setParams({ ...params, type: tab.type, name: '' });
  // }, [tab]);

  const listTabs = [
    {
      title: "Danh sách hợp đồng",
      is_active: "tab_one",
      type: 1,
    },
    {
      title: "Hợp đồng sắp hết hạn",
      is_active: "tab_two",
      type: 2,
    },
    {
      title: "Báo cáo thống kê",
      is_active: "tab_three",
      type: 3,
    },
  ];

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

  const getCustomerInfo = async (customerId: number) => {
    const response = await CustomerService.detail(customerId);

    if (response.code === 0) {
      const result = response.result;
      setDataCustomer(result);
      setShowModalPhone(true);
    }
  };

  const getPipelineList = async () => {
    if (!listPipeline || listPipeline.length === 0) {
      setIsLoadingPipeline(true);
      const dataOption = await SelectOptionData("pipelineId");

      const newOptionArray = [];
      if (dataOption && dataOption.length > 0) {
        dataOption.map((item) => {
          newOptionArray.push(item);
        });
        setListPipeline(newOptionArray);
      }
      setIsLoadingPipeline(false);
    }
  };

  useEffect(() => {
    getPipelineList();
  }, []);

  //call danh sách quy trình hợp đồng
  const getOptionApproach = async (pipelineId) => {
    const response = await ContractApproachService.list({ pipelineId: pipelineId });

    if (response.code === 0) {
      const dataOption = response.result;

      setListApproach([
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
            return {
              value: item.id,
              label: item.name,
              color: colorData[index],
              lstContractActivity: item.lstContractActivity,
              pipelineId: item.pipelineId,
              step: item.step,
            };
          })
          : []),
      ]);
    }
  };

  // const handlClickOptionApproach = (e, id) => {
  //   setApproachId(id);
  //   setParams({ ...params, approachId: id });
  //   setParamsTab2({ ...params, approachId: id });
  //   if (id == approachId) {
  //     setApproachId(0);
  //     setParams({ ...params, approachId: 0 });
  //     setParamsTab2({ ...params, approachId: 0 });
  //   }
  // };

  const [contractIdList, setContractIdList] = useState([]);

  const [customerIdlist, setCustomerIdList] = useState([]);

  const [dataCustomerList, setDataCustomerList] = useState([]);

  const [columnList, setColumnList] = useState(undefined);

  const [checkColumn, setCheckColumn] = useState(null);

  useEffect(() => {
    if (contractIdList && contractIdList.length > 0) {
      let checkCustomerList = [];
      let checkDataCustomerList = [];
      contractIdList.map((item) => {
        if (checkCustomerList.length === 0) {
          checkCustomerList.push(item.customerId);
          checkDataCustomerList.push({
            name: item.customerName || item.businessPartnerName,
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
              name: item.customerName || item.businessPartnerName,
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
    } else if (contractIdList && contractIdList.length === 0) {
      setCustomerIdList([]);
      setDataCustomerList([]);
    }
  }, [contractIdList]);

  const clearKanban = () => {
    setContractIdList([]);
    setCustomerIdList([]);
    setDataCustomerList([]);
    setColumnList(undefined);
    setCheckColumn(null);
  };

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách hợp đồng",
      is_active: true,
    },
  ]);

  const contractFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "isCustomer",
        name: "Hợp đồng",
        type: "select",
        list: [
          {
            value: "1",
            label: "Khách hàng",
          },
          {
            value: "0",
            label: "Đối tác",
          },
        ],
        is_featured: true,
        value: searchParams.get("isCustomer") ?? "",
      },
      {
        key: "active",
        name: "Hiệu lực hợp đồng",
        type: "select",
        list: [
          {
            value: "0",
            label: "Hết hiệu lực",
          },
          {
            value: "1",
            label: "Còn hiệu lực",
          },
        ],
        is_featured: true,
        value: searchParams.get("active") ?? "",
      },
      {
        key: "status",
        name: "Trạng thái ký",
        type: "select",
        list: [
          {
            value: "0",
            label: "Chưa trình ký",
          },
          {
            value: "1",
            label: "Đã trình ký",
          },
          {
            value: "2",
            label: "Đã phê duyệt",
          },
          {
            value: "3",
            label: "Từ chối phê duyệt",
          },
          {
            value: "4",
            label: "Tạm dừng luồng ký",
          },
        ],
        is_featured: true,
        value: searchParams.get("active") ?? "",
      },
      {
        key: "contractStatus",
        name: "Trạng thái hợp đồng",
        type: "select",
        list: [
          {
            value: "0",
            label: "Chưa phê duyệt",
          },
          {
            value: "1",
            label: "Đang phê duyệt",
          },
          {
            value: "2",
            label: "Đang thực hiện",
          },
          {
            value: "3",
            label: "Đóng hợp đồng",
          },
          {
            value: "4",
            label: "Lưu trữ (thất bại)",
          },
          {
            value: "5",
            label: "Lưu trữ (thành công)",
          },
        ],
        is_featured: true,
        value: searchParams.get("active") ?? "",
      },
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

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
      setParamsTab2((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh sách hợp đồng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
      setParamsTab2((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
      setParamsTab2((prevParams) => ({ ...prevParams, limit: limit }));
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
              <Tippy content="Cảnh báo hợp đồng">
                <span>
                  <Icon name="Bell" />
                </span>
              </Tippy>
            </button>         
          </div> */}

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
          </div>
        </div>
      </Fragment>
    );
  };

  const [hasHistorySignature, setHasHistorySignature] = useState<boolean>(false);

  const ActionRenderer = ({ data }) => {
    return (
      <div className="lst__action--cell">
        <div
          className="item__action view__contract"
          onClick={() => {
            setShowModalWarning(true);
            setDataContract(data.dataItem);
          }}
        >
          <Tippy content="Cảnh báo hợp đồng">
            <span className="icon__item icon__view--contract">
              <Icon name="Bell" />
            </span>
          </Tippy>
        </div>
        {!data.dataItem.status ? (
          <div
            className="item__action signature__contract"
            onClick={() => {
              if (data?.dataItem?.template) {
                setDataContract(data.dataItem);
                setHasSignature(true);
              } else {
                showToast("Vui lòng tải mẫu hợp đồng trước khi trình ký", "error");
              }
            }}
          >
            <Tippy content="Trình ký">
              <span className="icon__item icon__signature">
                <Icon name="FingerTouch" style={data?.dataItem?.template ? {} : { fill: "var(--extra-color-30)" }} />
              </span>
            </Tippy>
          </div>
        ) : (
          <div
            className="item__action history__signature"
            onClick={() => {
              setDataContract(data.dataItem);
              setHasHistorySignature(true);
            }}
          >
            <Tippy content="Xem lịch sử ký">
              <span className="icon__item">
                <Icon name="ImpactHistory" />
              </span>
            </Tippy>
          </div>
        )}
        <div
          className="item__action view__contract"
          onClick={() => {
            navigate(`/detail_contract/contractId/${data.id}`);
            localStorage.setItem("backUpUrlContract", JSON.stringify(params));
          }}
        >
          <Tippy content="Xem chi tiết hợp đồng">
            <span className="icon__item icon__view--contract">
              <Icon name="Eye" />
            </span>
          </Tippy>
        </div>

        {data?.dataItem?.template ? (
          <div
            className="item__action update"
            onClick={() => {
              let fieldName = convertToId(data.name) || "";
              fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

              const type = data?.dataItem?.template?.includes(".docx")
                ? "docx"
                : data?.dataItem?.template?.includes(".xlsx")
                  ? "xlsx"
                  : data?.dataItem?.template?.includes(".pdf")
                    ? "pdf"
                    : data?.dataItem?.template?.includes(".pptx")
                      ? "pptx"
                      : data?.dataItem?.template?.includes(".zip")
                        ? "zip"
                        : "rar";
              const name = `${fieldName}.${type}`;

              handDownloadFileOrigin(data?.dataItem?.template, name);
            }}
          >
            <Tippy content="Tải hợp đồng xuống">
              <span className="icon__item">
                <Icon name="Download" />
              </span>
            </Tippy>
          </div>
        ) : null}
        {permissions["CONTRACT_UPDATE"] == 1 && (
          <>
            {isUserRoot && (
              <div
                className="item__action update"
                onClick={() => {
                  // setDataContract(data.dataItem);
                  navigate(`/edit_contract_xml/${data.id}`);
                }}
              >
                <Tippy content="Sửa XML">
                  <span className="icon__item icon__update">
                    <Icon name="SettingCashbook" />
                  </span>
                </Tippy>
              </div>
            )}

            <div
              className="item__action update"
              onClick={() => {
                setDataContract(data.dataItem);
                navigate(`/edit_contract/${data.id}`);
              }}
            >
              <Tippy content="Sửa">
                <span className="icon__item icon__update">
                  <Icon name="Pencil" />
                </span>
              </Tippy>
            </div>
          </>
        )}
        {permissions["CONTRACT_DELETE"] == 1 && data.dataItem.status !== 2 && (
          <div className="item__action delete" onClick={() => showDialogConfirmDelete(data)}>
            <Tippy content="Xóa">
              <span className="icon__item icon__delete">
                <Icon name="Trash" />
              </span>
            </Tippy>
          </div>
        )}

        {permissions["CONTRACT_DELETE"] == 1 &&
          dataInfoEmployee &&
          dataInfoEmployee.isOwner === 1 &&
          (data.dataItem.status === 2 || data.dataItem.status === 3) && (
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

  // const BoxViewStatus = ({ data }) => {
  //   const status = data.dataItem.status;
  //   const approachId = data.dataItem.approachId;

  //   return (
  //     <span
  //       className={`status__item--signature status__item--signature-${
  //         !approachId ? "secondary" : approachId === -4 ? "error" : approachId === -3 ? "warning" : approachId === 2 ? "success" : "primary"
  //       }`}
  //     >
  //       {!approachId ? "Chưa phê duyệt" : approachId === -4 ? "Từ chối" : approachId === -3 ? "Lưu trữ" : approachId === 2 ? "Đã phê duyệt" : "Đang xử lý"}
  //     </span>
  //   );
  // };

  const BoxViewStatus = ({ data }) => {
    const status = data.dataItem.status;

    return (
      <Tippy content="Đổi trạng thái ký">
        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
          <span
            className={`status__item--signature status__item--signature-${!status ? "secondary" : status === 1 ? "primary" : status === 2 ? "success" : status === 3 ? "error" : status === 4 ? "warning" : ""
              }`}
            onClick={() => {
              if (!status) {
                showToast("Không thể đổi trạng thái vì hợp đồng chưa được trình ký", "warning");
              } else {
                setIsChangeSignedStatus(true);
                setDataContract(data.dataItem);
              }
            }}
          >
            {!status
              ? "Chưa trình ký"
              : status === 1
                ? "Đã trình ký"
                : status === 2
                  ? "Đã phê duyệt"
                  : status === 3
                    ? "Từ chối phê duyệt"
                    : status === 4
                      ? "Tạm dừng luồng ký"
                      : ""}
          </span>
        </div>
      </Tippy>
    );
  };

  const BoxViewContractStatus = ({ data }) => {
    const status = data.dataItem.status;
    const contractStatus = data.dataItem.contractStatus;

    const getStatus = (code: number) => {
      switch (code) {
        case 0:
          return "Chưa phê duyệt";
        case 1:
          return "Đang phê duyệt";
        case 2:
          return "Đang thực hiện";
        case 3:
          return "Đóng hợp đồng";
        case 4:
          return "Lưu trữ (Thất bại)";
        case 5:
          return "Lưu trữ (Thành công)";
        default:
          return "Chưa phê duyệt";
      }
    };

    const getStatusColor = (code: number) => {
      switch (code) {
        case 0:
          return "secondary";
        case 1:
          return "primary";
        case 2:
          return "primary";
        case 3:
          return "error";
        case 4:
          return "warning";
        case 5:
          return "warning";
        default:
          return "secondary";
      }
    };

    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
        <span
          className={`status__item--signature status__item--signature-${
            // !contractStatus ? "secondary" : approachId === -4 ? "error" : approachId === -3 ? "warning" : approachId === 2 ? "success" : "primary"
            getStatusColor(contractStatus)
            }`}
          onClick={() => {
            if (status === 2) {
              setIsChangeContractStatus(true);
              setDataContract(data.dataItem);
            }
          }}
        >
          {/* {!contractStatus ? "Chưa phê duyệt" : approachId === -4 ? "Từ chối" : approachId === -3 ? "Lưu trữ" : approachId === 2 ? "Đã phê duyệt" : "Đang xử lý"} */}
          {getStatus(contractStatus)}
        </span>
      </div>
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
          navigate(`/detail_contract/contractId/${data.id}`);
          localStorage.setItem("backUpUrlContract", JSON.stringify(params));
        }}
      >
        {data.name}
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
        {data?.dataItem?.customerName || data?.dataItem?.businessPartnerName}
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
      width: 61,
      resizable: false,
      suppressSizeToFit: true,
    },
    { headerName: "Id", field: "id", hide: true },
    { headerName: "dataItem", field: "data", hide: true },
    {
      headerName: "Tên hợp đồng",
      field: "name",
      width: 280,
      cellRenderer: LinkToAction,
      headerClass: "header-left",
    },
    {
      headerName: "Giá trị hợp đồng",
      field: "dealValue",
      // type: "rightAligned",
      headerClass: "header-right",
      cellStyle: { display: "flex", justifyContent: "flex-end" },
    },
    {
      headerName: "Giai đoạn hợp đồng",
      field: "pipelineName",
      headerClass: "header-left",
    },
    {
      headerName: "Quy trình hợp đồng",
      field: "approachName",
      headerClass: "header-left",
    },
    {
      headerName: "Tên công ty",
      field: "customerName",
      cellRenderer: LinkToCustomer,
      headerClass: "header-left",
    },
    // {
    //   headerName: "Trạng thái",
    //   field: "status",
    //   cellRenderer: BoxViewStatus,
    // },
    {
      headerName: "Trạng thái ký",
      field: "status",
      cellRenderer: BoxViewStatus,
      headerClass: "header-center",
    },
    {
      headerName: "Trạng thái hợp đồng",
      field: "contractStatus",
      cellRenderer: BoxViewContractStatus,
      headerClass: "header-center",
    },
    {
      headerName: "Hành động",
      cellRenderer: ActionRenderer,
      width: 180,
      resizable: false,
      suppressSizeToFit: true,
      headerClass: "header-center",
    },
    {
      headerName: "",
      field: "addColumn",
      width: 100,
      resizable: false,
      suppressSizeToFit: true,
      headerComponent: HeaderButton,
      headerComponentParams: { isShowColumn, setIsShowColumn, showModalWarning, setShowModalWarning },
    },
    // {
    //   headerName: "",
    //   field: "addColumn",
    //   width: 70,
    //   resizable: false,
    //   suppressSizeToFit: true,
    //   headerComponent: HeaderButton,
    //   headerComponentParams: { isShowColumn, setIsShowColumn, showModalWarning, setShowModalWarning  },
    // },
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
    if (listContract && listContract.length >= 0) {
      const changeDataCustomer: any = listContract.map((item, index) => {
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
            dealValue: item.dealValue == null ? null : item.dealValue == 0 ? "0đ" : formatCurrency(+item.dealValue, ","),
            approachName: item.approachName,
            pipelineName: item.pipelineName,
            customerName: item.customerName || item.businessPartnerName,
            status: !item.status ? "Chưa phê duyệt" : item.status === 1 ? "Đang xử lý" : item.status === 2 ? "Đã phê duyệt" : "Từ chối duyệt",
          },
          ...changeDataResult
        );

        return body;
      });

      setRowData(changeDataCustomer);
    }
  }, [listContract, rowMapping]);

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

  const getListContract = async (paramsSearch: IContractFilterRequest) => {
    setIsLoading(true);

    const response = await ContractService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      const changeDataResult = result.items
        .filter((item) => item.contractExtraInfos.length > 0)
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
            // approachId: contractStep?.approachId || null,
            approachId: (item.lstContractStep && item.lstContractStep.length > 0 && item.lstContractStep[0].approachId) || null,
          });
        });
      }

      setListContract(newListContact);
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

  const [dataOfApproach, setDataOfApproach] = useState([]);
  const [dataOfApproachStart, setDataOfApproachStart] = useState([]);
  const [dataOfApproachFail, setDataOfApproachFail] = useState([]);

  const getDataOfApproach = async (paramsSearch, approachName) => {
    const response = await ContractService.list(paramsSearch, abortController.signal);

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
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataOfApproachSpecial = async (pipelineId, status) => {
    const param = {
      pipelineId: pipelineId,
      limit: 10,
      approachId: status,
    };
    const response = await ContractService.list(param, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      if (status === -4) {
        setDataOfApproachFail(result);
      } else {
        setDataOfApproachStart(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (listApproach && listApproach.length > 0) {
      listApproach.map((item) => {
        const param = {
          // name: "",
          pipelineId: contractType,
          limit: 10,
          page: 1,
          approachId: item.value,
        };
        getDataOfApproach(param, item.label);
      });
    }
  }, [listApproach, contractType]);

  useEffect(() => {
    getDataOfApproachSpecial(contractType, -4);
    getDataOfApproachSpecial(contractType, 0);
  }, [contractType]);

  // useEffect(() => {
  //   const paramsTemp = _.cloneDeep(params);
  //   searchParams.forEach(async (key, value) => {
  //     paramsTemp[value] = key;
  //   });
  //   setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  //   setParamsTab2((prevParams) => ({ ...prevParams, ...paramsTemp }));
  // }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      if (tab.type === 1) {
        getListContract(params);
      } else {
        getListContract(paramsTab2);
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
  }, [params, paramsTab2]);
  let isUserRoot = localStorage.getItem("user.root") == "1" ? true : false;
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
      ...(isRegimeKanban
        ? [
          {
            title: "Quay lại",
            icon: <Icon name="ChevronLeft" />,
            callback: () => {
              setIsRegimeKanban(!isRegimeKanban);
              // localStorage.removeItem("keep_position_kanban_contract");
            },
          },
        ]
        : [
          permissions["CONTRACT_ADD"] == 1 &&
          isUserRoot && {
            title: "Thêm mới bằng XML",
            callback: () => {
              navigate("/create_contract_xml");
            },
          },
          {
            title: "Thêm mới",
            callback: () => {
              navigate("/create_contract");
            },
          },
          {
            title: "Kanban",
            // icon: <Icon name="Fullscreen" />,
            callback: () => {
              setIsRegimeKanban(true);
              if (contractType == -1) {
                setContractType(listPipeline && listPipeline.length > 0 && +listPipeline[0].value);
              } else {
                setContractType(contractType);
                setParams({ ...params, pipelineId: contractType, approachId: -1 });
                setParamsTab2({ ...params, pipelineId: contractType, approachId: -1 });
              }
            },
          },
        ]),
    ],

    actions_extra: [
      permissions["CONTRACT_IMPORT"] == 1 && {
        title: "Nhập danh sách",
        // title: t('import'),
        icon: <Icon name="Upload" />,
        callback: () => {
          setShowModalImport(true);
        },
      },

      permissions["CONTRACT_EXPORT"] == 1 && {
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

  // useEffect(() => {
  //   if (isRegimeKanban) {

  //     localStorage.setItem("keep_position_kanban_contract", JSON.stringify("active_kanban_contract"));
  //   }

  //   const historyStorage = JSON.parse(localStorage.getItem("keep_position_kanban_contract"));

  //   if (historyStorage == "active_kanban_contract") {
  //     setIsRegimeKanban(true);
  //   }
  // }, [isRegimeKanban, listPipeline]);

  // const titles = ["STT", "Tên hợp đồng", "Giá trị hợp đồng", "Giai đoạn HĐ", "Loại HĐ", "Tên công ty"]; // "Diện tích NFA", "Tên dự án"

  const titles = (type: string) => {
    return type
      ? [
        "STT",
        "Tên hợp đồng",
        "Số hợp đồng",
        "Tên khách hàng",
        "Giá trị hợp đồng",
        "Giai đoạn HĐ",
        "Loại hợp đồng",
        "Ngày ký",
        "Ngày hết hạn",
        "Ngày tạo",
      ]
      : ["STT", "Tên hợp đồng", "Giá trị hợp đồng", "Giai đoạn HĐ", "Loại HĐ", "Tên công ty"];
  };

  const dataFormat = ["text-center", "", "text-right", "", "", ""]; //"text-right"
  const formatExcel = ["center", "top", "left", "left", "right", "left", "left", "left", "left"];

  const dataMappingArray = (item: IContractResponse, index: number, type?: string) => [
    getPageOffset(params) + index + 1,
    ...(type !== "export"
      ? [
        item.name,
        // <div className="contract-name">
        //   <label title={item.name}>
        //     {
        //       item.name
        //       // trimContent(item.name, 15)
        //     }
        //   </label>

        //   <div>
        //     <a title={'Gửi email'} onClick={() => {
        //       setDataContract(item);
        //       setShowModalSendEmail(true);
        //     }}>
        //       <Icon name="EmailFill" style={{ marginRight: 5, cursor: 'pointer', width: 16, }} />
        //     </a>
        //     <a title={'Gửi SMS'} onClick={() => {
        //       setDataContract(item);
        //       setShowModalAdd(true);
        //     }}>
        //       <Icon name="SMS" style={{ marginRight: 5, cursor: 'pointer', width: 17, marginTop: 3 }} title={'Nhắn tin'} />
        //     </a>
        //     <a title={'Gọi điện'} onClick={() => {
        //       setDataContract(item);
        //       getCustomerInfo(item?.customerId);
        //     }}>
        //       <Icon name="PhoneFill" style={{ cursor: 'pointer', width: 13, fill: '#1c8cff' }} title={'Gọi điện'} />
        //     </a>
        //   </div>
        // </div>,
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
        item.name,
        item.contractNo,
        item.customerName || item.businessPartnerName,
        item.dealValue,
        item.pipelineName,
        item.categoryName,
        item.signDate ? moment(item.signDate).format("DD/MM/YYYY") : "",
        item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
        item.createdAt ? moment(item.createdAt).format("DD/MM/YYYY") : "",
      ]),
  ];

  const actionsTable = (item: IContractResponse): IAction[] => {
    return [
      // permissions["CONTRACT_UPDATE"] == 1 && {
      //   title: "Cảnh báo hết hạn hợp đồng",
      //   icon: <Icon name="Bell" />,
      //   callback: () => {
      //     //Popup cài đặt cảnh báo
      //     setShowModalExpire(true)
      //     setIdExpire(item.id)
      //     setEndDate(item.endDate)
      //     setAlertConfig({
      //       emails: "[{\"email\":\"trungnn@gmail.com\"},{\"email\":\"nguyentrung@gmail.com\"}]",
      //       expireTimeWarning: 7,
      //       expireTimeWarningUnit: "D",
      //       phoneNumbers: "[{\"phone\":\"098637888\"}]",
      //       templateEmailId: 11,
      //       templateSmsId: 19
      //     })

      //   },
      // },
      permissions["CONTRACT_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          navigate(`/edit_contract/${item.id}`);
        },
      },
      permissions["CONTRACT_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await ContractService.delete(id);
    if (response.code === 0) {
      showToast("Xóa hợp đồng thành công", "success");
      getListContract(params);
      setDataOfApproach([]);
      if (listApproach && listApproach.length > 0) {
        listApproach.map((item) => {
          const param = {
            // name: "",
            pipelineId: contractType,
            limit: 10,
            approachId: item.value,
          };
          getDataOfApproach(param, item.label);
        });
      }
      getDataOfApproachSpecial(contractType, 4);
      getDataOfApproachSpecial(contractType, 0);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllContract = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        ContractService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa hợp đồng thành công", "success");
        getListContract(params);
        setListIdChecked([]);
        setDataOfApproach([]);
        if (listApproach && listApproach.length > 0) {
          listApproach.map((item) => {
            const param = {
              // name: "",
              pipelineId: contractType,
              limit: 10,
              approachId: item.value,
            };
            getDataOfApproach(param, item.label);
          });
        }
        getDataOfApproachSpecial(contractType, 4);
        getDataOfApproachSpecial(contractType, 0);
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
          Bạn có chắc chắn muốn xóa {item ? "hợp đồng " : `${listIdChecked.length} hợp đồng đã chọn`}
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
          onDeleteAllContract();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["CONTRACT_DELETE"] == 1 && {
      title: "Xóa hợp đồng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);
  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả hợp đồng",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} hợp đồng phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, listIdChecked, params]
  );

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await ContractService.list(
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
            fileName: "HopDong",
            title: "Hợp đồng",
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

  const [fromTimeFilter, setFormTimeFilter] = useState();
  const [toTimeFilter, setToTimeFilter] = useState();

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setFormTimeFilter(fromTime);
      setToTimeFilter(toTime);
      setParamsTab2({ ...params, fmtStartEndDate: fromTime, fmtEndEndDate: toTime });
    }
  };

  //thay đổi trạng thái
  const [isChangeSignedStatus, setIsChangeSignedStatus] = useState(false);
  const [isChangeContractStatus, setIsChangeContractStatus] = useState(false);

  return (
    <div className={`page-content page-contract${isNoItem ? " bg-white" : ""}`}>
      {!hasHistorySignature && <TitleAction title="Danh sách hợp đồng" titleActions={titleActions} />}

      {hasHistorySignature && (
        <div className="action-navigation">
          <div className="action-backup" style={hasHistorySignature ? { marginBottom: "1.6rem" } : {}}>
            <h1
              onClick={() => {
                setHasHistorySignature(false);
              }}
              className="title-first"
              title="Quay lại"
            >
              Danh sách hợp đồng
            </h1>
            {hasHistorySignature && (
              <Fragment>
                <Icon
                  name="ChevronRight"
                  onClick={() => {
                    setHasHistorySignature(false);
                  }}
                />
                <h1 className="title-last">Xem lịch sử ký</h1>
              </Fragment>
            )}
          </div>
        </div>
      )}

      {!hasHistorySignature && (
        <div className={`card-box d-flex flex-column`}>
          <div className="quick__search">
            {listPipeline.length > 0 && !isRegimeKanban ? (
              <ul
                className="quick__search--left-swiper"
                style={contractType == -1 || listApproach.length === 0 ? { width: "100%" } : { maxWidth: "38%" }}
              >
                <Swiper
                  onInit={(core: SwiperCore) => {
                    swiperPipelineRef.current = core.el;
                  }}
                  className="relationship-slider"
                  grid={{
                    rows: 1,
                  }}
                  navigation={true}
                  modules={[Grid, Navigation]}
                  slidesPerView={contractType == -1 || listApproach.length === 0 ? 5 : 2}
                  spaceBetween={5}
                >
                  <SwiperSlide className="list__relationship--slide-first">
                    <li
                      className={`${isRegimeKanban ? "d-none" : contractType == -1 ? "active" : "unactive"}`}
                      onClick={(e) => {
                        e && e.preventDefault();
                        setContractType(-1);
                      }}
                    >
                      {"Tất cả"}
                    </li>
                  </SwiperSlide>
                  {listPipeline &&
                    listPipeline.length > 0 &&
                    listPipeline.map((item, idx) => {
                      return (
                        <SwiperSlide key={idx} className="list__relationship--slide">
                          <li
                            key={idx}
                            className={`${item.value == contractType ? "active" : "unactive"}`}
                            onClick={(e) => {
                              e && e.preventDefault();
                              setContractType(+item.value);
                            }}
                          >
                            {item.label}
                          </li>
                        </SwiperSlide>
                      );
                    })}
                </Swiper>
              </ul>
            ) : (
              <ul className="quick__search--left" style={isRegimeKanban ? { width: "100%" } : {}}>
                {/* <li
                className={`${isRegimeKanban ? "d-none" : (contractType == -1 ? "active" : "unactive")}`}
                onClick={(e) => {
                  e && e.preventDefault();
                  setContractType(-1);
                }}
              >
                {'Tất cả'}
              </li> */}
                {listPipeline &&
                  listPipeline.length > 0 &&
                  listPipeline.map((item, idx) => {
                    return (
                      <li
                        key={idx}
                        className={`${item.value == contractType ? "active" : "unactive"}`}
                        onClick={(e) => {
                          e && e.preventDefault();
                          setContractType(+item.value);
                        }}
                      >
                        {item.label}
                      </li>
                    );
                  })}
              </ul>
            )}

            {/* <div className={`${isRegimeKanban ? "d-none" : ""}`}> */}
            {/* <div className={`${isRegimeKanban ? "d-none" : "quick__search--right"}`} style={contractType == -1 ? { width: "0%" } : {}}>
            {width < 1920 && width > 768 && listApproach.length > 4 ? (
              <Swiper
                onInit={(core: SwiperCore) => {
                  swiperRelationshipRef.current = core.el;
                }}
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
                  return (
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
                  );
                })}
              </Swiper>
            ) : (
              <div className="list__relationship">
                {listApproach.map((item, idx) => {
                  return (
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
                  );
                })}
              </div>
            )}
          </div> */}
            {/* </div> */}
          </div>

          <div className={`${isRegimeKanban ? "d-none" : ""}`}>
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
                        if (item.type === 1) {
                          setFormTimeFilter(null);
                          setToTimeFilter(null);
                          // setParamsTab2({
                          //   name: "",
                          //   pipelineId: -1,
                          //   stageId: -1,
                          //   limit: 10,
                          // })
                        }
                        // else {
                        //   setParams({
                        //     name: "",
                        //     pipelineId: -1,
                        //     stageId: -1,
                        //     limit: 10,
                        //   })
                        // }
                      }}
                    >
                      {item.title}
                    </li>
                  ))}
                </ul>
                <Tippy content="Cảnh báo hợp đồng">
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

              {tab.type === 1 ? (
                <SearchBox
                  name="Tên hợp đồng/Số HĐ/MST"
                  params={params}
                  isFilter={true}
                  // isSaveSearch={true}
                  // listSaveSearch={listSaveSearch}
                  listFilterItem={contractFilterList}
                  updateParams={(paramsNew) => setParams(paramsNew)}
                />
              ) : tab.type === 2 ? (
                <div className="form-filter">
                  <div className="form-group-filter">
                    <AdvancedDateFilter updateParams={takeFromTimeAndToTime} />
                  </div>
                  <div style={{ width: "100%" }}>
                    <SearchBox
                      name="Tên hợp đồng/Số HĐ/MST"
                      params={paramsTab2}
                      isFilter={false}
                      isSaveSearch={false}
                      // listSaveSearch={listSaveSearch}
                      // listFilterItem={contractFilterList}
                      updateParams={(paramsNew) => {
                        if (paramsNew?.name) {
                          setParamsTab2(paramsNew);
                        } else {
                          const startOfMonth = fromTimeFilter ?? moment().format("DD/MM/yyyy");
                          const endOfMonth = toTimeFilter ?? moment().add(6, "days").format("DD/MM/yyyy");
                          setParamsTab2({ ...params, name: "", fmtStartEndDate: startOfMonth, fmtEndEndDate: endOfMonth });
                        }
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            {tab.type === 1 || tab.type === 2 ? (
              !isLoading && listContract && listContract.length > 0 ? (
                // <BoxTable
                //   name="Danh sách hợp đồng"
                //   titles={titles("")}
                //   items={listContract}
                //   isPagination={true}
                //   dataPagination={pagination}
                //   dataMappingArray={(item, index) => dataMappingArray(item, index)}
                //   dataFormat={dataFormat}
                //   listIdChecked={listIdChecked}
                //   isBulkAction={true}
                //   bulkActionItems={bulkActionList}
                //   striped={true}
                //   setListIdChecked={(listId) => setListIdChecked(listId)}
                //   actions={actionsTable}
                //   actionType="inline"
                // />
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
                          Hiện tại chưa có hợp đồng nào. <br />
                          Hãy thêm mới hợp đồng đầu tiên nhé!
                        </span>
                      }
                      type="no-item"
                      titleButton="Thêm mới hợp đồng"
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
              <StatisticContract />
            ) : null}
          </div>

          <div className={`${isRegimeKanban ? "__special-kanban--contract" : "d-none"}`}>
            <KanbanContract
              params={params}
              setParams={setParams}
              contractFilterList={contractFilterList}
              data={listContract}
              dataOfApproach={dataOfApproach}
              setDataOfApproach={setDataOfApproach}
              dataStart={dataOfApproachStart}
              setDataStart={setDataOfApproachStart}
              dataFail={dataOfApproachFail}
              setDataFail={setDataOfApproachFail}
              listApproachContract={listApproach}
              onReload={(reload) => {
                if (reload) {
                  getListContract(params);
                  setDataOfApproach([]);
                  if (listApproach && listApproach.length > 0) {
                    listApproach.map((item) => {
                      const param = {
                        // name: "",
                        pipelineId: contractType,
                        limit: 10,
                        page: 1,
                        approachId: item.value,
                      };
                      getDataOfApproach(param, item.label);
                    });
                  }
                  getDataOfApproachSpecial(contractType, -4);
                  getDataOfApproachSpecial(contractType, 0);
                }
              }}
              contractIdList={contractIdList}
              setContractIdList={setContractIdList}
              customerIdlist={customerIdlist}
              setCustomerIdList={setCustomerIdList}
              columnList={columnList}
              setColumnList={setColumnList}
              checkColumn={checkColumn}
              setCheckColumn={setCheckColumn}
              dataCustomerList={dataCustomerList}
              contractType={contractType}
            />
          </div>

          <Dialog content={contentDialog} isOpen={showDialog} />
          <SendEmailModal onShow={showModalSendEmail} data={dataContract} onHide={() => setShowModalSendEmail(false)} />
          <AddCustomerSMSModal
            onShow={showModalAdd}
            idCustomer={dataContract?.customerId}
            callback={(codes: ICustomPlaceholderResponse) => {
              setCodes(codes);
              setShowModalPlaceholder(true);
            }}
            onHide={(reload) => {
              if (reload) {
                //Load gì thì cho vào đây
              }
              setShowModalAdd(false);
            }}
          />

          <AddPhoneModal onShow={showModalPhone} dataCustomer={dataCustomer} onHide={() => setShowModalPhone(false)} />

          {/* <ImportModal
            onShow={showModalImport}
            onHide={(reload) => {
              if (reload) {
                getListContract(params);
              }
              setShowModalImport(false);
            }}
            type="contract"
            name="Nhập danh sách hợp đồng"
          /> */}

          <ImportModal
            name="Nhập danh sách hợp đồng"
            onShow={showModalImport}
            onHide={(reload) => {
              if (reload) {
                getListContract(params);
              }
              setShowModalImport(false);
            }}
            type="customer"
          />

          <ExportModal
            name="Hợp đồng"
            onShow={onShowModalExport}
            onHide={() => setOnShowModalExport(false)}
            options={optionsExport}
            callback={(type, extension) => exportCallback(type, extension)}
          />

          <AddSignerFSAndQuote
            onShow={hasSignature}
            onHide={(reload) => {
              if (reload) {
                getListContract(params);
              }

              setHasSignature(false);
            }}
            dataProps={{
              objectId: dataContract?.id,
              objectType: 3,
            }}
          />

          <WarningContractModal
            onShow={showModalWarning}
            dataContract={dataContract}
            onHide={(reload) => {
              if (reload) {
                getListContract(params);
              }
              setShowModalWarning(false);
              setDataContract(null);
            }}
          />

          <ChangeSignedStatusModal
            onShow={isChangeSignedStatus}
            data={dataContract}
            onHide={(reload) => {
              if (reload) {
                getListContract(params);
              }

              setIsChangeSignedStatus(false);
            }}
          />
          <ChangeContractStatusModal
            onShow={isChangeContractStatus}
            data={dataContract}
            onHide={(reload) => {
              if (reload) {
                getListContract(params);
              }

              setIsChangeContractStatus(false);
            }}
          />
        </div>
      )}

      {hasHistorySignature && (
        <div className="card-box d-flex flex-column">
          <ViewHistorySignature
            type="contract"
            onShow={hasHistorySignature}
            data={dataContract}
            contractTemplate={true}
            onHide={() => setHasHistorySignature(false)}
            buttonDownload={true}
          />
        </div>
      )}
    </div>
  );
}
