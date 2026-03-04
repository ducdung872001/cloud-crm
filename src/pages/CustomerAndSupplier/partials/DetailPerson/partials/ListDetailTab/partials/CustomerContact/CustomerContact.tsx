import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { getPermissions, showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import ContactService from "services/ContactService";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";
import { useOnClickOutside } from "utils/hookCustom";
import Popover from "components/popover/popover";
import Input from "components/input/input";
import Checkbox from "components/checkbox/checkbox";
import moment from "moment";
import BoxTableAdvanced from "components/boxTableAdvanced/boxTableAdvanced";
import AddContactModal from "pages/Contact/partials/AddContactModal";

import "./CustomerContact.scss";

export default function CustomerContact({ idCustomer }) {
  const isMounted = useRef(false);

  const [listContact, setListContact] = useState([]);
  const [dataContact, setDataContact] = useState(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [params, setParams] = useState({
    keyword: "",
    customerId: idCustomer,
    pipelineId: -1,
    statusId: -1,
    limit: 10,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Người liên hệ",
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
        <div className="custom-header-contact" ref={refColumnContainer}>
          <button onClick={() => setIsShowColumn((prev) => !prev)}>
            <Tippy content="Thêm cột">
              <span>
                <Icon name="PlusCircleFill" />
              </span>
            </Tippy>
          </button>

          {isShowColumn && (
            <Popover
              alignment="right"
              isTriangle={true}
              className="popover-column-header-contact"
              refContainer={refColumnContainer}
              refPopover={refColumn}
            >
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
    const data = props.data;
    const params = props.params;

    return (
      <div className="lst__action--cell">
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

  const ImageRenderer = ({ data }) => {
    return <Image src={data.avatar || ""} alt={data.name} width={"64rem"} />;
  };

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

        const elementsToKeep = defaultValueColumnDefs.slice(-2);
        elementsToKeep.unshift(changeDataConfirm);

        const newDataTable = defaultValueColumnDefs.slice(0, -2).concat(elementsToKeep.flat());

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
              item.emails && JSON.parse(item.emails) && JSON.parse(item.emails).length > 0
                ? JSON.parse(item.emails).filter((el) => el.isPrimary === 1)[0]?.email || ""
                : JSON.parse(item.emails).email,

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

      const elementsToKeep = defaultValueColumnDefs.slice(-2);
      elementsToKeep.unshift(changeDataTakeFieldActiveContact);

      const newDataTable = defaultValueColumnDefs.slice(0, -2).concat(elementsToKeep.flat());

      setColumnDefs(newDataTable);
      setLstFieldActive(takeFieldActiveContact);
    }
  }, []);

  const abortController = new AbortController();

  const getListContact = async (paramsSearch: any) => {
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
    }

    return () => {
      abortController.abort();
    };
  }, [params]);

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

  const showDialogConfirmDelete = (item?: any, param?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa liên hệ
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id, param),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <div className={`page-content customer-contact${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách người liên hệ</li>
            </ul>
            <Tippy content="Thêm mới người liên hệ" delay={[100, 0]} animation="scale-extreme">
              <div className="add-ticket">
                <Button
                  color="success"
                  onClick={() => {
                    setDataContact(null);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
        </div>
        {!isLoading && listContact && listContact.length > 0 ? (
          <BoxTableAdvanced
            name="Liên hệ"
            isImage={true}
            columnDefs={columnDefs}
            rowData={rowData}
            isPagination={true}
            dataPagination={pagination}
            widthColumns={widthColumns}
            setWidthColumns={(data) => setWidthColumns(data)}
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
      <AddContactModal
        onShow={showModalAdd}
        data={dataContact}
        idCustomer={idCustomer}
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
