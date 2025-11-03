import Tippy from "@tippyjs/react";
import BoxTableAdvanced from "components/boxTableAdvanced/boxTableAdvanced";
import Loading from "components/loading";
import _ from "lodash";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ContextType, UserContext } from "contexts/userContext";
import { IContractFilterRequest } from "model/contract/ContractRequestModel";
import { IContractResponse } from "model/contract/ContractResponseModel";
import moment from "moment";
import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPageOffset } from "reborn-util";
import ContractService from "services/ContractService";
import { formatCurrency, isDifferenceObj, showToast } from "utils/common";
import { useOnClickOutside } from "utils/hookCustom";

export default function TableContractReport({ dataProjectReport }) {
  const navigate = useNavigate();

  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();

  const [listContract, setListContract] = useState<IContractResponse[]>([]);

  const [listIdChecked, setListIdChecked] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [params, setParams] = useState<IContractFilterRequest>({
    name: "",
    pipelineId: -1,
    // approachId: -1,
    limit: 10,
  });

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, projectId: dataProjectReport.id }));
    }
  }, [dataProjectReport]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh sách hợp đồng",
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

  const [widthColumns, setWidthColumns] = useState(() => {
    const storedData = localStorage.getItem("widthColumnContractReport");
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

      localStorage.setItem("widthColumnContractReport", JSON.stringify(uniqueWidths));
    }
  }, [widthColumns]);
  const [showModalWarning, setShowModalWarning] = useState<boolean>(false);

  const [isShowColumn, setIsShowColumn] = useState(false);
  useOnClickOutside(refColumn, () => setIsShowColumn(false), ["custom-header"]);

  const BoxViewStatus = ({ data }) => {
    const status = data.dataItem.status;

    return (
      <Tippy content="Đổi trạng thái ký">
        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
          <span
            className={`status__item--signature status__item--signature-${
              !status ? "secondary" : status === 1 ? "primary" : status === 2 ? "success" : status === 3 ? "error" : status === 4 ? "warning" : ""
            }`}
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
              ? "Tạm dưng luồng ký"
              : ""}
          </span>
        </div>
      </Tippy>
    );
  };

  const BoxViewContractStatus = ({ data }) => {
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
        >
          {/* {!contractStatus ? "Chưa phê duyệt" : approachId === -4 ? "Từ chối" : approachId === -3 ? "Lưu trữ" : approachId === 2 ? "Đã phê duyệt" : "Đang xử lý"} */}
          {getStatus(contractStatus)}
        </span>
      </div>
    );
  };

  const LinkToAction = ({ data }) => {
    return (
      <div
        className="detail-contract"
        onClick={() => {
          navigate(`/detail_contract/contractId/${data.id}`);
          localStorage.setItem("backUpUrlContractReport", JSON.stringify(params));
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

  const defaultValueColumnDefs = [
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
    },
    {
      headerName: "Giá trị hợp đồng",
      field: "dealValue",
      type: "rightAligned",
    },
    {
      headerName: "Pha hợp đồng",
      field: "pipelineName",
    },
    {
      headerName: "Quy trình hợp đồng",
      field: "approachName",
    },
    {
      headerName: "Tên công ty",
      field: "customerName",
      cellRenderer: LinkToCustomer,
    },
    {
      headerName: "Trạng thái ký",
      field: "status",
      cellRenderer: BoxViewStatus,
    },
    {
      headerName: "Trạng thái hợp đồng",
      field: "contractStatus",
      cellRenderer: BoxViewContractStatus,
    },
  ];

  const [columnDefs, setColumnDefs] = useState<any>(defaultValueColumnDefs);
  const [lstFieldContract, setLstFieldContract] = useState([]);
  const [lstFieldActive, setLstFieldActive] = useState([]);
  const [lstFieldUnActive, setLstFieldUnActive] = useState([]);

  const [dataConfirm, setDataConfirm] = useState([]);
  const [isConfirmData, setIsConfirmData] = useState<boolean>(false);

  const [lstContractExtraInfo, setLstContractExtraInfo] = useState([]);

  const takeColumnContract = JSON.parse(localStorage.getItem("widthColumnContractReport"));

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

        const elementsToKeep = defaultValueColumnDefs.slice(-2);
        elementsToKeep.unshift(changeDataConfirm);

        const newDataTable = defaultValueColumnDefs.slice(0, -2).concat(elementsToKeep.flat());

        localStorage.setItem("fieldActiveContractReport", JSON.stringify(dataConfirm));

        setColumnDefs(newDataTable);
        setLstFieldActive(dataConfirm);
      } else {
        localStorage.setItem("fieldActiveContractReport", JSON.stringify([]));

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

  const takeFieldActiveContact = JSON.parse(localStorage.getItem("fieldActiveContractReport"));

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

      const elementsToKeep = defaultValueColumnDefs.slice(-2);
      elementsToKeep.unshift(changeDataTakeFieldActiveContact);

      const newDataTable = defaultValueColumnDefs.slice(0, -2).concat(elementsToKeep.flat());

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
      const newListContact = [];
      if (listContract && listContract.length > 0) {
        listContract.map((item) => {
          let contractStep = null;
          if (item.lstContractStep && item.lstContractStep.length > 0) {
            contractStep = item.lstContractStep.find((el) => el.pipelineId === paramsSearch.pipelineId) || null;
          }
          newListContact.push({
            ...item,
            approachId: (item.lstContractStep && item.lstContractStep.length > 0 && item.lstContractStep[0].approachId) || null,
          });
        });
      }

      setListContract(newListContact);

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
      getListContract(params);

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
        // setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }

    return () => {
      abortController.abort();
    };
  }, [params]);
  return (
    <div className="table_contract_report">
      {!isLoading && listContract && listContract.length > 0 ? (
        <BoxTableAdvanced
          name="Hợp đồng"
          columnDefs={columnDefs}
          rowData={rowData}
          isPagination={true}
          dataPagination={pagination}
          isBulkAction={true}
          widthColumns={widthColumns}
          setWidthColumns={(data) => setWidthColumns(data)}
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
      )}
    </div>
  );
}
