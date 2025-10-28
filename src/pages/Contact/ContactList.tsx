/* eslint-disable prefer-const */
import React, { Fragment, useState, useEffect, useRef, useMemo, useCallback, useContext } from "react";
import _ from "lodash";
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
import { IAction, ISaveSearch, IFilterItem, IOption } from "model/OtherModel";
import { IContactListProps } from "model/contact/PropsModel";
import { IContactFilterRequest } from "model/contact/ContactRequestModel";
import { IContactResponse } from "model/contact/ContactResponseModel";
import { showToast } from "utils/common";
import { formatCurrency, getDomain, getPageOffset, getSearchParameters, isDifferenceObj } from "reborn-util";
import { getPermissions } from "utils/common";
import ContactService from "services/ContactService";
import AddContactModal from "./partials/AddContactModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ContactList.scss";
import { SelectOptionData } from "utils/selectCommon";
import CustomerService from "services/CustomerService";
import { ExportExcel } from "exports";
import ExportModal from "components/exportModal/exportModal";
import { UserContext, ContextType } from "contexts/userContext";
import KanbanContact from "./KanbanContact/KanbanContact";
import ContactStatusService from "services/ContactStatusService";
import BoxTableAdvanced from "components/boxTableAdvanced/boxTableAdvanced";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Grid } from "swiper";
import { useOnClickOutside, useWindowDimensions } from "utils/hookCustom";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";
import Checkbox from "components/checkbox/checkbox";
import Input from "components/input/input";
import Popover from "components/popover/popover";
import moment from "moment";
import ExchangeFast from "./ExchangeFast";
import ImportModal from "./ImportModal";

export default function ContactList() {
  document.title = "Danh sách người liên hệ";
  const { name, avatar } = useContext(UserContext) as ContextType;
  const sourceDomain = getDomain(decodeURIComponent(document.location.href));

  const isMounted = useRef(false);
  const swiperPipelineRef = useRef(null);
  const swiperRelationshipRef = useRef(null);
  const { width } = useWindowDimensions();

  const [searchParams, setSearchParams] = useSearchParams();
  const [listContact, setListContact] = useState<IContactResponse[]>([]);
  const [dataContact, setDataContact] = useState<IContactResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalImport, setShowModalImport] = useState<boolean>(false);
  //modal exchange
  const [showModalExchange, setShowModalExchange] = useState<boolean>(false);

  const colorData = [
    "#177AD5",
    "#79D2DE",
    "#ED6665",
    "#FFBF00",
    "#9966CC",
    "#7FFFD4",
    "#FFFFFF",
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
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(false);
  const [listPipeline, setListPipeline] = useState<IOption[]>([]);
  // console.log("listPipeline", listPipeline);

  const [listStatus, setListStatus] = useState([]);
  const [contractType, setContractType] = useState<number>(() => {
    return takeParamsUrl?.pipelineId ? takeParamsUrl?.pipelineId : -1;
  });

  // console.log('contractType', contractType);

  const [statusId, setStatusId] = useState<number>(() => {
    return takeParamsUrl?.statusId ? takeParamsUrl?.statusId : -1;
  });

  useEffect(() => {
    setParams({ ...params, pipelineId: contractType, statusId: -1 });
    getOptionStage(contractType);
    setStatusId(-1);
  }, [contractType]);

  const [params, setParams] = useState<IContactFilterRequest>({
    keyword: "",
    pipelineId: -1,
    statusId: -1,
    limit: 10,
  });

  const [listCustomer, setListCustomer] = useState([]);

  const getListCustomer = async () => {
    const response = await CustomerService.filter();

    if (response.code === 0) {
      const result = response.result.items;
      setListCustomer(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  // useEffect(() => {
  //   getListCustomer()
  // },[])

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: sourceDomain === "hasedu.reborn.vn" ? "Danh sách phụ huynh" : "Danh sách người liên hệ",
      is_active: true,
    },
  ]);

  const contactFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "positionId",
        name: "Chức vụ",
        type: "select",
        is_featured: true,
        value: searchParams.get("positionId") ?? "",
      },
      {
        key: "customerId",
        name: "Khách hàng",
        type: "select",
        is_featured: true,
        value: searchParams.get("customerId") ?? "",
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

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh sách liên hệ",
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
    const storedData = localStorage.getItem("widthColumnContact");
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

      localStorage.setItem("widthColumnContact", JSON.stringify(uniqueWidths));
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
                      getLstFieldContact(value);
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
      </Fragment>
    );
  };

  const ActionRenderer = (props) => {
    let data = props.data;
    let params = props.params;

    return (
      <div className="lst__action--cell">
        <div
          className="item__action update"
          onClick={() => {
            setDataContact(data.dataItem);
            setShowModalExchange(true);
          }}
        >
          <Tippy content="Thông tin trao đổi">
            <span className="icon__item icon__update">
              <Icon name="Note" style={{width: 15.5, height: 15.5,  fill: '#1c8cff'}}/>
            </span>
          </Tippy>
        </div>

        {permissions["CONTRACT_UPDATE"] == 1 && (
          <div
            className="item__action update"
            onClick={() => {
              setDataContact(data.dataItem);
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

        {permissions["CONTRACT_DELETE"] == 1 && (
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

  const linkContactExchange = ({ data }) => {
    return (
      <div
        className="contact-exchange"
        onClick={() => {
        }}
      >
        Xem thêm
      </div>

    );
  };

  const ImageRenderer = ({ data }) => {
    return <Image src={data.avatar || ""} alt={data.name} width={"64rem"} />;
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
      headerName: "Ảnh đại diện",
      field: "avatar",
      cellRenderer: ImageRenderer,
      autoHeight: true,
      width: 140,
    },
    {
      headerName: "Họ tên",
      field: "name",
    },
    {
      headerName: "Số điện thoại",
      field: "phone",
      width: 150,
    },
    {
      headerName: "Chức vụ",
      field: "positionName",
    },
    {
      headerName: "Người phụ trách",
      field: "employeeName",
    },
    {
      headerName: "Khách hàng đại diện chính",
      field: "lstCustomer",
      width: 250,
    },
    {
      headerName: "Email",
      field: "emails",
    },
    {
      headerName: "Ghi chú",
      field: "note",
    },
    // {
    //   headerName: "Thông tin trao đổi",
    //   field: "numberLetter",
    //   cellRenderer: linkContactExchange,
    // },
    {
      headerName: "Hành động",
      field: "action",
      cellRenderer: ActionRenderer,
      cellRendererParams: { params },
      width: 120,
      resizable: false,
      suppressSizeToFit: true,
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
  const [lstFieldContact, setLstFieldContact] = useState([]);
  const [lstFieldActive, setLstFieldActive] = useState([]);
  const [lstFieldUnActive, setLstFieldUnActive] = useState([]);

  const [dataConfirm, setDataConfirm] = useState([]);
  const [isConfirmData, setIsConfirmData] = useState<boolean>(false);
  const [lstContactExtraInfo, setLstCustomerExtraInfo] = useState([]);

  const takeColumnContact = JSON.parse(localStorage.getItem("widthColumnContact"));

  useEffect(() => {
    if (takeColumnContact) {
      const changeDataColumnDefs = columnDefs.map((item) => {
        const matchingColumn = takeColumnContact.find((el) => item.field === el.colId);

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
  }, [lstContactExtraInfo]);

  useEffect(() => {
    if (isConfirmData) {
      const changeLstFieldUnActive = lstFieldContact
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

        localStorage.setItem("fieldActiveContact", JSON.stringify(dataConfirm));

        setColumnDefs(newDataTable);
        setLstFieldActive(dataConfirm);
      } else {
        localStorage.setItem("fieldActiveContact", JSON.stringify([]));

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

  const getLstFieldContact = async (name?: string) => {
    const params = {
      name: name || "",
      limit: 100,
    };

    const response = await ContactService.fieldTable(params);

    if (response.code === 0) {
      const result = response.result.items;
      setLstFieldContact(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    getLstFieldContact();
  }, []);

  const [rowData, setRowData] = useState([]);
  // console.log("rowData", rowData);

  const [rowMapping, setRowMapping] = useState([]);

  useEffect(() => {
    if (listContact && listContact.length >= 0) {
      const changeDataCustomer: any = listContact.map((item, index) => {
        const result = rowMapping.filter((el) => el.contactId === item.id) || [];

        const changeDataResult = result.map((item) => {
          const key = Object.keys(item).find((key) => key !== "contactId");
          const value = item[key];
          return {
            [key]: value,
          };
        });

        const convertEmails = JSON.parse(item.emails);
        const changeEmails = Array.isArray(convertEmails) ? convertEmails : [convertEmails];

        const body = Object.assign(
          {
            idx: getPageOffset(params) + index + 1,
            id: item.id,
            dataItem: item,
            avatar: item.avatar || "",
            name: item.name,
            phone: item.phone,
            positionName: item.positionName,
            employeeName: item.employeeName,
            lstCustomer:
              item.lstCustomer && item.lstCustomer.length > 0
                ? item.lstCustomer
                    .map((el, idx) => {
                      const customerInfo =
                        (item.customers &&
                          JSON.parse(item.customers) &&
                          JSON.parse(item.customers).length > 0 &&
                          JSON.parse(item.customers).find((el) => el.isPrimary === 1)) ||
                        "";
                      return el.id === customerInfo?.customerId ? el.name : null;
                    })
                    .join("")
                : null,
            emails:
              item.emails && JSON.parse(item.emails) && 
              (JSON.parse(item.emails).length > 0
                ? JSON.parse(item.emails).filter((el) => el.isPrimary === 1)[0]?.email || ""
                : JSON.parse(item.emails).email
              ) || "",
            // JSON.parse(item.emails)
            //   .map((item, il) => (item.isPrimary === 1 ? item.email : null))
            //   .join(", "),
            note: item.note,
          },
          ...changeDataResult
        );

        return body;
      });

      setRowData(changeDataCustomer);
    }
  }, [listContact, rowMapping]);

  useEffect(() => {
    if (lstContactExtraInfo && lstContactExtraInfo.length > 0 && lstFieldContact && lstFieldContact.length > 0) {
      const resultArray = [];

      for (const item1 of lstContactExtraInfo) {
        for (const item2 of lstFieldContact) {
          if (item1.attributeId === item2.id) {
            // Lấy tất cả các thuộc tính của item2
            const keys = Object.keys(item2);

            // Lặp qua các thuộc tính của item2 và kiểm tra có 'fieldName' không
            keys.forEach((key) => {
              if (key === "fieldName") {
                // Thêm đối tượng mới với key và value động
                const dynamicKey = item2[key];
                const dynamicValue = item1.attributeValue;
                const contactId = item1.contactId;

                const dynamicObject = {
                  [dynamicKey]: dynamicValue,
                  contactId: contactId,
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
  }, [lstContactExtraInfo, lstFieldContact]);

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

      if (addColumnActionIndex !== -1) {
        newColumnDefs[addColumnActionIndex].cellRendererParams = {
          params,
        };
      }

      return newColumnDefs;
    });
  }, [params]);

  const takeFieldActiveContact = JSON.parse(localStorage.getItem("fieldActiveContact"));

  useEffect(() => {
    if (!isLoading && ((lstContactExtraInfo && lstContactExtraInfo.length > 0) || (lstFieldContact && lstFieldContact.length > 0))) {
      const result = lstFieldContact.map((item1) => {
        const matchingItem = lstContactExtraInfo.find((item2) => item2.attributeId === item1.id);

        return {
          value: item1.id,
          label: item1.name,
          fieldName: item1.fieldName,
          contactId: matchingItem?.contactId,
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
  }, [lstContactExtraInfo, lstFieldContact, isLoading]);

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

  const getListContact = async (paramsSearch: IContactFilterRequest) => {
    setIsLoading(true);

    const response = await ContactService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;

      const changeDataResult =
        (result.items &&
          result.items
            .filter((item) => item.contactExtraInfos.length > 0)
            .map((el) => el.contactExtraInfos)
            .flat()
            .map((ol) => {
              if (ol.datatype === "multiselect") {
                const parseAttributeValue = JSON.parse(ol.attributeValue);
                const result = [...parseAttributeValue].join(", ");

                return { ...ol, attributeValue: result };
              }

              if (ol.datatype === "date") {
                return { ...ol, attributeValue: moment(ol.attributeValue).format("DD/MM/YYYY") };
              }

              return ol;
            })) ||
        [];
      setLstCustomerExtraInfo(changeDataResult);
      setListContact(result.items);
      // setColumnDefs(defaultValueColumnDefs);

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
      getListContact(params);
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
  }, [params, listCustomer]);

  const titleActions: ITitleActions = {
    actions: [
      ...(isRegimeKanban
        ? [
            {
              title: "Quay lại",
              icon: <Icon name="ChevronLeft" />,
              callback: () => {
                setIsRegimeKanban(!isRegimeKanban);
                setStatusId(0);
                setParams({ ...params, statusId: 0 });
                // localStorage.removeItem("keep_position_kanban_contract");
              },
            },
          ]
        : [
            permissions["CONTACT_ADD"] == 1 && {
              title: "Tạo liên hệ",
              callback: () => {
                setDataContact(null);
                setShowModalAdd(true);
              },
            },

            {
              title: "Kanban",
              // icon: <Icon name="Fullscreen" />,
              callback: () => {
                if (contractType == -1) {
                  if (listPipeline && listPipeline.length > 0) {
                    setIsRegimeKanban(true);
                    setContractType(listPipeline && listPipeline.length > 0 ? +listPipeline[0].value : -1);
                  } else {
                    showToast("Không thể chuyển Kanban, vì chưa có loại liên hệ nào. Vui lòng cài đặt loại liên hệ và thử lại sau!", "error");
                  }
                } else {
                  setIsRegimeKanban(true);
                  setContractType(contractType);
                  setParams({ ...params, pipelineId: contractType, statusId: -1 });
                }
              },
            },
          ]),
    ],
    actions_extra: [
      {
        title: "Nhập danh sách",
        // title: t('import'),
        icon: <Icon name="Upload" />,
        callback: () => {
          setShowModalImport(true);
        },
      },

      permissions["CUSTOMER_EXPORT"] == 1 && {
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
      ? ["STT", "Tên người liên hệ", "Số điện thoại", "Chức vụ", "Người phụ trách", "Khách hàng đại diện chính", "Email", "Ghi chú"]
      : ["STT", "Ảnh đại diện", "Họ tên", "Số điện thoại", "Chức vụ", "Người phụ trách", "Khách hàng đại diện chính", "Email", "Ghi chú"];
  };

  const formatExcel = ["center", "top", "center", "left", "left", "left", "left", "left"];

  const checkdataCustomer = (item) => {
    let name = "";
    item.lstCustomer &&
      item.lstCustomer.length > 0 &&
      item.lstCustomer.map((el, index) => {
        const customerInfo =
          (item.customers &&
            JSON.parse(item.customers) &&
            JSON.parse(item.customers).length > 0 &&
            JSON.parse(item.customers).find((el) => el.isPrimary === 1)) ||
          "";

        if (customerInfo && el.id === customerInfo?.customerId) {
          name = el.name;
        }
      });
    return name;
  };

  const checkdataEmail = (item) => {
    let email = "";
    const emailInfo = (item.emails && JSON.parse(item.emails) && JSON.parse(item.emails).find((el) => el.isPrimary === 1)) || "";

    if (emailInfo) {
      email = emailInfo.email;
    }

    return email;
  };

  const dataMappingArray = (item: IContactResponse, index: number, type?: string) => [
    getPageOffset(params) + index + 1,
    ...(type !== "export"
      ? [
          <a key={item.id} data-fancybox="gallery" href={item.avatar}>
            <Image src={item.avatar || ""} alt={item.name} width={"64rem"} />
          </a>,
          item.name,
          item.phone,
          item.positionName,
          item.employeeName,
          item.lstCustomer &&
            item.lstCustomer.length > 0 &&
            item.lstCustomer.map((el, idx) => {
              const customerInfo =
                (item.customers &&
                  JSON.parse(item.customers) &&
                  JSON.parse(item.customers).length > 0 &&
                  JSON.parse(item.customers).find((el) => el.isPrimary === 1)) ||
                "";
              return el.id === customerInfo?.customerId ? <div key={idx}>{el.name}</div> : null;
            }),
          item.emails &&
            JSON.parse(item.emails) &&
            JSON.parse(item.emails).map((item, il) => (item.isPrimary === 1 ? <div key={il}>{item.email}</div> : null)),
          item.note,
        ]
      : [item.name, item.phone, item.positionName, item.employeeName, checkdataCustomer(item), checkdataEmail(item), item.note]),
  ];

  const onDelete = async (id: number, parma) => {
    const response = await ContactService.delete(id);
    if (response.code === 0) {
      showToast("Xóa liên hệ thành công", "success");
      getListContact(parma);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllContact = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        ContactService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa liên hệ thành công", "success");
        getListContact(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IContactResponse, param?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "liên hệ " : `${listIdChecked.length} liên hệ đã chọn`}
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
          onDeleteAllContact();
        } else {
          onDelete(item.id, param);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["CONTRACT_DELETE"] == 1 && {
      title: "Xóa liên hệ",
      callback: () => showDialogConfirmDelete(),
    },
  ];

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
        .filter((item) => !item.hide)
        .map((el) => {
          return {
            field: el.field,
            headerName: el.headerName,
          };
        });

      setTitleExport(() => changeDataColumnDefs.filter((item) => item.field !== "avatar"));
    }
  }, [columnDefs]);

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);
  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả người liên hệ",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} người liên hệ phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, listIdChecked, params]
  );

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await ContactService.list(
        type === "all"
          ? {
              page: 1,
              limit: pagination.totalItem,
            }
          : {
              ...params,
              page: type === "current_page" ? params.page || 1 : 1,
              limit: type === "all" || type === "current_search" ? 10000 : params.limit,
            }
      );

      if (response.code === 0) {
        const result = response.result;

        const changeResult = result.items
          .filter((item) => item.contactExtraInfos.length > 0)
          .map((el) => el.contactExtraInfos)
          .flat()
          .map((ol) => {
            if (ol.datatype === "multiselect") {
              const parseAttributeValue = JSON.parse(ol.attributeValue);
              const result = [...parseAttributeValue].join(", ");

              return { ...ol, attributeValue: result };
            }

            if (ol.datatype === "date") {
              return { ...ol, attributeValue: moment(ol.attributeValue).format("DD/MM/YYYY") };
            }

            return ol;
          });

        const resultArray = [];

        for (const item1 of changeResult) {
          for (const item2 of lstFieldContact) {
            if (item1.attributeId === item2.id) {
              // Lấy tất cả các thuộc tính của item2
              const keys = Object.keys(item2);

              // Lặp qua các thuộc tính của item2 và kiểm tra có 'fieldName' không
              keys.forEach((key) => {
                if (key === "fieldName") {
                  // Thêm đối tượng mới với key và value động
                  const dynamicKey = item2[key];
                  const dynamicValue = item1.attributeValue;
                  const contactId = item1.contactId;

                  const dynamicObject = {
                    [dynamicKey]: dynamicValue,
                    contactId: contactId,
                  };

                  resultArray.push(dynamicObject);
                }
              });

              break;
            }
          }
        }

        const dataExport: any = result.items.map((item, index) => {
          const result = rowMapping.filter((el) => el.contactId === item.id) || [];

          const changeDataResult = result.map((item) => {
            const key = Object.keys(item).find((key) => key !== "contactId");
            const value = item[key];
            return {
              [key]: value,
            };
          });

          const body = Object.assign(
            {
              idx: getPageOffset(params) + index + 1,
              name: item.name,
              phone: item.phone,
              positionName: item.employeeName,
              employeeName: item.employeeName,
              lstCustomer:
                item.lstCustomer && item.lstCustomer.length > 0
                  ? item.lstCustomer
                      .map((el, idx) => {
                        const customerInfo =
                          (item.customers &&
                            JSON.parse(item.customers) &&
                            JSON.parse(item.customers).length > 0 &&
                            JSON.parse(item.customers).find((el) => el.isPrimary === 1)) ||
                          "";
                        return el.id === customerInfo?.customerId ? el.name : null;
                      })
                      .join(", ")
                  : null,
              emails:
                item.emails && JSON.parse(item.emails) && JSON.parse(item.emails).length > 0
                  ? JSON.parse(item.emails).filter((el) => el.isPrimary === 1)[0]?.email || ""
                  : (JSON.parse(item.emails)?.email || ''),
              // JSON.parse(item.emails)
              //   .map((item, il) => (item.isPrimary === 1 ? item.email : null))
              //   .join(", ") || '',
              note: item.note,
            },
            ...changeDataResult
          );

          return body;
        });

        // Hàm so sánh mảng
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
            fileName: "NguoiLienHe",
            title: "Người liên hệ",
            header: titleExport.map((item) => item.headerName),
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

  ///kan ban

  const getPipelineList = async () => {
    if (!listPipeline || listPipeline.length === 0) {
      // setIsLoadingPipeline(true);
      const dataOption = await SelectOptionData("contact_pipelineId");

      const newOptionArray = [];
      if (dataOption && dataOption.length > 0) {
        dataOption.map((item) => {
          newOptionArray.push(item);
        });
        setListPipeline(newOptionArray);
      }
      // setIsLoadingPipeline(false);
    }
  };

  useEffect(() => {
    getPipelineList();
  }, []);

  //call danh sách trạng thái liên hệ
  const getOptionStage = async (pipelineId) => {
    const response = await ContactStatusService.list(pipelineId);
    // console.log('response', response);

    if (response.code === 0) {
      const dataOption = response.result;

      setListStatus([
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
              return {
                value: item.id,
                label: item.name,
                color: colorData[index],
              };
            })
          : []),
      ]);
    }
  };

  const handlClickOptionStatus = (e, id) => {
    setStatusId(id);
    setParams({ ...params, statusId: id });
    if (id == statusId) {
      setStatusId(0);
      setParams({ ...params, statusId: 0 });
    }
  };

  return (
    <div className={`page-content page-contact${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title={sourceDomain === "hasedu.reborn.vn" ? "Danh sách phụ huynh" : "Danh sách người liên hệ"} titleActions={titleActions} />

      <div className={`card-box d-flex flex-column`}>
        {listPipeline && listPipeline.length > 0 ? (
          <div className="quick__search">
            {listPipeline.length > 0 && !isRegimeKanban ? (
              <ul
                className="quick__search--left-swiper"
                style={contractType == -1 || listStatus.length === 0 ? { width: "100%" } : { maxWidth: "38%" }}
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
                  slidesPerView={contractType == -1 || listStatus.length === 0 ? 5 : 2}
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
            <div className={`${isRegimeKanban ? "d-none" : "quick__search--right"}`} style={contractType == -1 ? { width: "0%" } : {}}>
              {width < 1920 && width > 768 && listStatus.length > 4 ? (
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
                  {listStatus.map((item, idx) => {
                    return (
                      <SwiperSlide key={idx} className="list__relationship--slide">
                        <div
                          className={`item-relationship ${item.value == statusId ? "active__item-block" : ""}`}
                          style={{ backgroundColor: item.color, color: item.colorText }}
                          onClick={(e) => {
                            e && e.preventDefault();
                            handlClickOptionStatus(e, item.value);
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
                  {listStatus.map((item, idx) => {
                    return (
                      <div
                        key={idx}
                        className={`relationship-item ${item.value == statusId ? "active__relationship--item" : ""}`}
                        style={{ backgroundColor: item.color, color: item.colorText }}
                        onClick={(e) => {
                          e && e.preventDefault();
                          handlClickOptionStatus(e, item.value);
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* </div> */}
          </div>
        ) : null}
        <div className={`${isRegimeKanban ? "d-none" : ""}`}>
          <SearchBox
            name="Tên người liên hệ/SĐT/Email"
            params={params}
            isFilter={true}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            listFilterItem={contactFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listContact && listContact.length > 0 ? (
            <BoxTableAdvanced
              name="Liên hệ"
              isImage={true}
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
                      Hiện tại chưa có liên hệ nào. <br />
                      Hãy thêm mới liên hệ đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới liên hệ"
                  action={() => {
                    setDataContact(null);
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

        <div className={`${isRegimeKanban ? "" : "d-none"}`}>
          <KanbanContact
            params={params}
            setParams={setParams}
            contractFilterList={contactFilterList}
            data={listContact}
            listStatusContact={listStatus}
            onReload={(reload) => {
              if (reload) getListContact(params);
            }}
          />
        </div>
      </div>

      {dataContact && showModalExchange && (
        <ExchangeFast
          dataContact={dataContact}
          onHide={() => {
            setDataContact(null);
            setShowModalExchange(false);
          }}
        />
      )}

      <ExportModal
        name="Người liên hệ"
        onShow={onShowModalExport}
        onHide={() => setOnShowModalExport(false)}
        options={optionsExport}
        callback={(type, extension) => exportCallback(type, extension)}
      />
      {/* <ImportModal
        onShow={showModalImport}
        onHide={(reload) => {
          if (reload) {
            getListContact(params);
          }
          setShowModalImport(false);
        }}
        type="contact_profile"
        name="Nhập danh sách người liên hệ"
      /> */}
        <ImportModal
          name="Nhập danh sách người liên hệ"
          onShow={showModalImport}
          onHide={(reload) => {
            if (reload) {
              getListContact(params);
            }
            setShowModalImport(false);
          }}
        />
      <AddContactModal
        onShow={showModalAdd}
        data={dataContact}
        onHide={(reload) => {
          if (reload) {
            getListContact(params);
          }
          setShowModalAdd(false);
          setDataContact(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
