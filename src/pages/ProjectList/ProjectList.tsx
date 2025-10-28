/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { getSearchParameters, getPageOffset } from "reborn-util";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { useOnClickOutside, useWindowDimensions } from "utils/hookCustom";
import { showToast, getPermissions } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import "swiper/css/grid";
import "swiper/css/navigation";
import "./ProjectList.scss";
import Button from "components/button/button";
import BoxTableAdvanced from "components/boxTableAdvanced/boxTableAdvanced";
import Checkbox from "components/checkbox/checkbox";
import Input from "components/input/input";
import Popover from "components/popover/popover";
import PartnerService from "services/PartnerService";
import ProjectService from "services/ProjectService";
import AddProjectManagementModal from "pages/MiddleWork/partials/ProjectManagement/partials/AddProjectManagementModal";
import ReportProject from "./ReportProject/ReportProject";
import { ExportExcel } from "exports";
import ModalExportProject from "./ModalExportProject/ModalExportProject";
import { name } from "jssip";

export default function ProjectList() {
  const [activeTitleHeader, setActiveTitleHeader] = useState(1);

  document.title = `${"Danh sách dự án"}`;

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [listProject, setListProject] = useState([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách dự án",
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
    [searchParams]
  );

  const isMounted = useRef(false);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
    page: 1,
    // contactType,
    // branchId: 0
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "dự án",
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
                      //   getLstFieldCustomer(value);
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
        {permissions["WORK_PROJECT_UPDATE"] == 1 && (
          <div
            className="item__action update"
            onClick={() => {
              setDataProject(data.dataItem);
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

        {permissions["WORK_PROJECT_DELETE"] == 1 && (
          <div className="item__action delete" onClick={() => showDialogConfirmDelete(data, params)}>
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
      <div
        className="detail-project"
        onClick={() => {
          navigate(`/detail_project/projectId/${data.id}`);
        }}
      >
        {data.name}
      </div>
    );
  };

  const [dataProjectReport, setDataProjectReport] = useState(null);
  const [lstTitleHeader, setLstTitleHeader] = useState([
    {
      name: "Danh sách dự án",
      type: 1,
    },
    // {
    //   name: "Báo cáo dự án",
    //   type: 2,
    // },
    // {
    //   name: "Danh sách khách hàng của đối tác",
    //   type: 3,
    // },
  ]);
  const LinkToReport = ({ data }) => {
    return (
      <div
        className="report-project-label"
        onClick={() => {
          setActiveTitleHeader(2);
          setDataProjectReport(data);
          setLstTitleHeader([...lstTitleHeader, { name: "Báo cáo dự án", type: 2 }]);
        }}
      >
        {data.report}
      </div>
    );
  };

  const RendererStartTime = ({ data }) => {
    return (
      <div
        style={{
          width: "100%",
          textAlign: "center",
        }}
      >
        {data.startTime}
      </div>
    );
  };
  const RendererEndTime = ({ data }) => {
    return (
      <div
        style={{
          width: "100%",
          textAlign: "center",
        }}
      >
        {data.endTime}
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
      width: 70,
      resizable: false,
      suppressSizeToFit: true,
    },
    { headerName: "Id", field: "id", hide: true },
    { headerName: "dataItem", field: "data", hide: true },
    { headerName: "Tên dự án", field: "name", cellRenderer: LinkToAction },
    { headerName: "Mã dự án", field: "code" },
    {
      headerName: "Ngày bắt đầu",
      field: "startTime",
      cellRenderer: RendererStartTime,
    },
    {
      headerName: "Ngày hết hạn",
      field: "endTime",
      cellRenderer: RendererEndTime,
    },
    { headerName: "Báo cáo dự án", field: "report", cellRenderer: LinkToReport },

    {
      headerName: "Hành động",
      width: isBeauty && isBeauty == "1" ? 185 : 155,
      field: "action",
      cellRendererParams: { params },
      cellRenderer: ActionRenderer,
    },
    // {
    //   headerName: "",
    //   field: "addColumn",
    //   width: 70,
    //   resizable: false,
    //   suppressSizeToFit: true,
    //   headerComponent: HeaderButton,
    //   headerComponentParams: { isShowColumn, setIsShowColumn },
    // },
  ];

  const [columnDefs, setColumnDefs] = useState<any>(defaultValueColumnDefs);

  useEffect(() => {
    if (activeTitleHeader === 1) {
      setColumnDefs(defaultValueColumnDefs);
    } else if (activeTitleHeader === 2) {
      setSearchParams({});
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

  const [rowData, setRowData] = useState([]);
  const [rowMapping, setRowMapping] = useState([]);

  useEffect(() => {
    if (listProject && listProject.length >= 0) {
      const fetchData = async () => {
        const changeDataCustomer = await Promise.all(
          listProject.map(async (item, index) => {
            const result =
              (await Promise.all(
                rowMapping
                  .filter((el) => el.projectId === item.id)
                  .map(async (item) => {
                    const key = Object.keys(item).find((key) => key !== "projectId");
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
                code: item.code,
                startTime: item.startTime ? moment(item.startTime).format("DD/MM/YYYY") : "",
                endTime: item.endTime ? moment(item.endTime).format("DD/MM/YYYY") : "",
                report: "Xem báo cáo",
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
  }, [listProject, rowMapping, params]);

  //   useEffect(() => {
  //     if (lstCustomerExtraInfo && lstCustomerExtraInfo.length > 0 && lstFieldCustomer && lstFieldCustomer.length > 0) {
  //       const resultArray = [];

  //       for (const item1 of lstCustomerExtraInfo) {
  //         for (const item2 of lstFieldCustomer) {
  //           if (item1.attributeId === item2.id) {
  //             // Lấy tất cả các thuộc tính của item2
  //             const keys = Object.keys(item2);

  //             // Lặp qua các thuộc tính của item2 và kiểm tra có 'fieldName' không
  //             keys.forEach((key) => {
  //               if (key === "fieldName") {
  //                 // Thêm đối tượng mới với key và value động
  //                 const dynamicKey = item2[key];
  //                 const dynamicValue = item1.attributeValue;
  //                 const customerId = item1.customerId;

  //                 const dynamicObject = {
  //                   [dynamicKey]: dynamicValue,
  //                   customerId: customerId,
  //                 };

  //                 resultArray.push(dynamicObject);
  //               }
  //             });

  //             break;
  //           }
  //         }
  //       }

  //       setRowMapping(resultArray);
  //     }
  //   }, [lstCustomerExtraInfo, lstFieldCustomer]);

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

  //   useEffect(() => {
  //     if (!isLoading && ((lstCustomerExtraInfo && lstCustomerExtraInfo.length > 0) || (lstFieldCustomer && lstFieldCustomer.length > 0))) {
  //       const result = lstFieldCustomer.map((item1) => {
  //         const matchingItem = lstCustomerExtraInfo.find((item2) => item2.attributeId === item1.id);

  //         return {
  //           value: item1.id,
  //           label: item1.name,
  //           fieldName: item1.fieldName,
  //           customerId: matchingItem?.customerId,
  //           isTable: false,
  //         };
  //       });

  //       const checkDataLocalStorage = takeFieldActiveContact
  //         ? result.filter((item) => {
  //             return !takeFieldActiveContact.some((el) => el.fieldName === item.fieldName);
  //           })
  //         : result;

  //       setLstFieldUnActive(checkDataLocalStorage);
  //     }
  //   }, [lstCustomerExtraInfo, lstFieldCustomer, isLoading]);

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
  const getListProject = async (paramsSearch: any, activeTitleHeader?) => {
    setIsLoading(true);

    const response = await ProjectService.list(paramsSearch, abortController.signal);

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
      setListProject(result.items);

      if (activeTitleHeader === 1) {
        setPagination({
          ...pagination,
          page: +result.page,
          sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
        });
        localStorage.setItem(
          "backUpUrlProject",
          JSON.stringify({
            ...params,
            page: +result.page,
            totalItem: +result.total,
            totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
          })
        );
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
        getListProject(params, activeTitleHeader);
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
        if (activeTitleHeader !== 2) {
          setSearchParams(paramsTemp as Record<string, string | string[]>);
        }
      }
    }
    return () => {
      abortController.abort();
    };
  }, [params, activeTitleHeader]);

  const titleActions: ITitleActions = {
    actions: [
      permissions["WORK_PROJECT_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataProject(null);
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
  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);

  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả dự án",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} dự án phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, params]
  );
  const formatExcel = ["center", "top", "center", "center", "right", "right", "right"];

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await ProjectService.list({
        ...params,
        name: type === "all" ? "" : params.name,
        // parentId: -1,
        // page: type === "current_page" ? 1 : params.page,
        page: type === "current_page" ? params.page || 1 : 1,
        // limit: type === "all" || type === "current_search" ? pagination.totalItem : params.limit,
        limit: type === "all" || type === "current_search" ? 1000 : params.limit,
      });

      if (response.code === 0) {
        const result = response.result;
        const dataExport: any = result.items.map((item, index) => {
          const body = Object.assign({
            idx: getPageOffset(params) + index + 1,
            ...item,
            startTime: item.startTime ? moment(item.startTime).format("DD/MM/YYYY") : "",
            endTime: item.endTime ? moment(item.endTime).format("DD/MM/YYYY") : "",
          });

          return body;
        });

        console.log("dataExport", dataExport);

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
            fileName: "Duan",
            title: "Dự án",
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

  const onDelete = async (id: number, parma: any) => {
    const response = await ProjectService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa dự án thành công`, "success");
      getListProject(parma);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [dataProject, setDataProject] = useState<ICustomerResponse>(null);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const onDeleteAllProject = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        ProjectService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa dự án thành công", "success");
        getListProject(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: any, param?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa dự án</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa{" "}
          {item ? (
            <span>
              dự án <strong>{item.name}</strong>
            </span>
          ) : (
            <span>
              <strong>{listIdChecked.length}</strong> dự án đã chọn
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
          onDeleteAllProject();
        } else {
          onDelete(item.id, param);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    // permissions["PROJECT_DELETE"] == 1 &&
    {
      title: "Xóa dự án",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <Fragment>
      <div className={`page-content page-project${isNoItem ? " bg-white" : ""}`}>
        <TitleAction title="Danh sách dự án" titleActions={titleActions} />
        <div className="card-box d-flex flex-column">
          <div className="search__box--project">
            <ul className="line__height--project">
              {lstTitleHeader.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className={`item-title ${activeTitleHeader === item.type ? "active__item--title" : ""}`}
                    onClick={() => {
                      setActiveTitleHeader(item.type);
                      setLstTitleHeader(lstTitleHeader.filter((el) => el.type !== 2));
                    }}
                  >
                    {item.name}
                  </li>
                );
              })}
            </ul>

            {activeTitleHeader !== 2 && (
              <div className="desc__search">
                <SearchBox
                  name="Dự án"
                  placeholderSearch="Tìm kiếm theo tên dự án"
                  params={params}
                  isFilter={false}
                  isSaveSearch={false}
                  listSaveSearch={listSaveSearch}
                  listFilterItem={customerFilterList}
                  updateParams={(paramsNew) => {
                    setParams(paramsNew);
                  }}
                />
              </div>
            )}
          </div>

          {activeTitleHeader === 1 || activeTitleHeader === 3 ? (
            !isLoading && listProject && listProject.length > 0 ? (
              <BoxTableAdvanced
                name="Dự án"
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
                        Hiện tại chưa có dự án nào. <br />
                        {activeTitleHeader === 1 ? `Hãy thêm mới dự án đầu tiên nhé!` : ""}
                      </span>
                    }
                    type="no-item"
                    titleButton={activeTitleHeader === 1 ? "Thêm mới dự án" : ""}
                    action={() => {
                      if (activeTitleHeader === 1) {
                        setDataProject(null);
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
          ) : (
            <ReportProject dataProjectReport={dataProjectReport} />
          )}
        </div>
        <AddProjectManagementModal
          onShow={showModalAdd}
          idData={dataProject?.id}
          onHide={(reload) => {
            if (reload) {
              getListProject(params);
            }
            setShowModalAdd(false);
          }}
        />
        <ModalExportProject
          name="Dự án"
          params={params}
          onShow={onShowModalExport}
          onHide={() => setOnShowModalExport(false)}
          options={optionsExport}
          total={pagination.totalItem}
          callback={(type, extension) => exportCallback(type, extension)}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </Fragment>
  );
}
