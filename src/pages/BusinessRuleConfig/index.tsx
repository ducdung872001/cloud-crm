import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import "./index.scss";
import Icon from "components/icon";
import Loading from "components/loading";
import { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IContractPipelineResponse } from "model/contractPipeline/ContractPipelineResponseModel";
import { showToast } from "utils/common";
import { formatCurrency, getPageOffset } from "reborn-util";
import { getPermissions } from "utils/common";
import _ from "lodash";
import HeaderFilter from "components/HeaderFilter/HeaderFilter";
import { ContextType, UserContext } from "contexts/userContext";
import DecisionTableInputService from "services/DecisionTableInputService";
import { useNavigate, useParams } from "react-router-dom";
import DecisionTableOutputService from "services/DecisionTableOutputService";
import BusinessRuleItemService from "services/BusinessRuleItemService";
import BoxTableBusinessRule from "components/boxTableBusinessRule/boxTableBusinessRule";
import ListColumnInput from "./partials/ListColumnInput";
import ListColumnOutput from "./partials/ListColumnOutput";
import ModalAddDecision from "./partials/ModalAddDecision";
import moment from "moment";

export default function BusinessRuleConfig(props: any) {
  document.title = "Loại luật nghiệp vụ";

  const isMounted = useRef(false);
  const { dataInfoEmployee } = useContext(UserContext) as ContextType;
  const navigate = useNavigate();

  // Lấy id ở URL
  const { id } = useParams();

  const [listRuleItem, setListRuleItem] = useState([]);
  const [listDecisionInput, setListDecisionInput] = useState([]);
  const [listDecisionOutput, setListDecisionOutput] = useState([]);
  const [listTitles, setListTitles] = useState(["STT"]);
  const [listTitleKeys, setListTitleKeys] = useState([]);
  const [dataDecision, setDataDecision] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalColumnInput, setShowModalColumnInput] = useState<boolean>(false);
  const [showModalColumnOutput, setShowModalColumnOutput] = useState<boolean>(false);
  const [showModalDecision, setShowModalDecision] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  console.log("listDecisionInput>>", listDecisionInput);

  const [params, setParams] = useState({
    keyWord: "",
    businessRuleId: id ? +id : null,
    limit: 10,
    page: 1,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục luật nghiệp vụ",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "điều kiện",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  useEffect(() => {
    if (id) {
      setParams((prevParams) => ({ ...prevParams, businessRuleId: +id }));
      getListDecisionInput(+id);
      getListDecisionOutput(+id);
    }
  }, [id]);

  useEffect(() => {
    setListTitles([
      "STT",
      ...listDecisionInput.map((item: any) => (item.name ? item.name : item.code)),
      ...listDecisionOutput.map((item: any) => ({
        name: item.name ? item.name : item.code,
        type: "output",
      })),
    ]);
    setListTitleKeys([
      {
        key: "stt",
        type: "number",
      },
      ...listDecisionInput.map((item: any) => ({
        key: item.code,
        type: item?.dataType ? item.dataType : "String",
      })),
      ...listDecisionOutput.map((item: any) => ({
        key: item.code,
        type: item?.dataType ? item.dataType : "String",
      })),
    ]);
  }, [listDecisionInput, listDecisionOutput]);

  const getListDecisionInput = async (id: number, disableLoading?: boolean) => {
    if (!disableLoading) {
      setIsLoading(true);
    }

    const response = await DecisionTableInputService.list({ businessRuleId: id, limit: 100 }, abortController.signal);

    if (response.code === 0) {
      const result = response.result;

      setListDecisionInput(result?.items);
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const getListDecisionOutput = async (id: number, disableLoading?: boolean) => {
    if (!disableLoading) {
      setIsLoading(true);
    }

    const response = await DecisionTableOutputService.list({ businessRuleId: id, limit: 100 }, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListDecisionOutput(result?.items);

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

  const [listRuleItemOriginal, setListRuleItemOriginal] = useState<any[]>([]);

  const getListRuleItem = async (paramsSearch: any, disableLoading?: boolean) => {
    if (!disableLoading) {
      setIsLoading(true);
    }

    const response = await BusinessRuleItemService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListRuleItemOriginal(result?.items);
      setListRuleItem(
        result?.items.map((item: any) => {
          let ruleItem = {
            id: item.id,
            // inputs: JSON.parse(item.inputs) ? JSON.parse(item.inputs) : [],
            // outputs: JSON.parse(item.outputs) ? JSON.parse(item.outputs) : [],
          };
          if (JSON.parse(item.inputs)) {
            JSON.parse(item.inputs).forEach((input: any) => {
              // ruleItem[input.parameter] = input.value ? input.value : "";
              ruleItem[input.parameter] = {
                value: input.value ? input.value : "",
                value2: input.value2 ? input.value2 : "",
                operator: input.operator ? input.operator : "EQUAL",
              };
            });
          }
          if (JSON.parse(item.outputs)) {
            ruleItem = {
              ...ruleItem,
              ...JSON.parse(item.outputs),
            };
          }
          return ruleItem;
        })
      );

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

    if (isMounted.current === true && params.businessRuleId) {
      getListRuleItem(params);
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

  const titleActions: ITitleActions = {
    actions: [
      ...(listDecisionInput?.length || listDecisionOutput?.length
        ? [
            {
              icon: <Icon name="Plus" style={{ width: 13, height: 13 }} />,
              title: "Luật nghiệp vụ",
              callback: () => {
                setShowModalDecision(true);
              },
            },
          ]
        : []),
      {
        icon: <Icon name="ListData" style={{ width: 22, height: 22 }} />,
        title: "Cột điều kiện",
        callback: () => {
          setShowModalColumnInput(true);
        },
      },
      {
        icon: <Icon name="ListData" style={{ width: 22, height: 22 }} />,
        title: "Cột kết quả",
        callback: () => {
          setShowModalColumnOutput(true);
        },
      },
    ],
  };

  const dataFormat = ["text-center", "", "", ""];

  let listOperator = {
    EQUAL: "=",
    NOT_EQUAL: "!=",
    GREATER_THAN: ">",
    LESS_THAN: "<",
    GREATER_THAN_OR_EQUAL: ">=",
    LESS_THAN_OR_EQUAL: "<=",
    CONTAINS: "CONTAINS",
    IN: "IN",
    BETWEEN: "BETWEEN",
  };

  const dataMappingArray = (item: any, index: number) => [
    ...listTitleKeys.map((titleKey) => {
      if (titleKey.key === "stt") {
        return getPageOffset(params) + index + 1;
      } else {
        if (item[titleKey.key]?.operator) {
          return (
            <>
              {item[titleKey.key]?.operator == "BETWEEN" ? (
                <div className="value-operator" key={titleKey.key + "_" + index}>
                  <div className="operator">
                    <div className="operator-item">
                      {" "}
                      {item[titleKey.key]?.operator && listOperator[item[titleKey.key]?.operator] ? listOperator[item[titleKey.key]?.operator] : "="}
                    </div>
                  </div>

                  <span className="text-bold">
                    {titleKey.type == "Long"
                      ? formatCurrency(item[titleKey.key]?.value, ",", "")
                      : titleKey.type == "Date"
                      ? moment(item[titleKey.key]?.value).format("DD/MM/YYYY")
                      : item[titleKey.key]?.value}
                    {" --> "}
                    {titleKey.type == "Long"
                      ? formatCurrency(item[titleKey.key]?.value2, ",", "")
                      : titleKey.type == "Date"
                      ? moment(item[titleKey.key]?.value2).format("DD/MM/YYYY")
                      : item[titleKey.key]?.value2}
                  </span>
                </div>
              ) : (
                <div className="value-operator" key={titleKey.key + "_" + index}>
                  <div className="operator">
                    <div className="operator-item">
                      {" "}
                      {item[titleKey.key]?.operator && listOperator[item[titleKey.key]?.operator] ? listOperator[item[titleKey.key]?.operator] : "="}
                    </div>
                  </div>
                  {titleKey.type == "Array" ? (
                    <>
                      {Array.isArray(item[titleKey.key]?.value) && item[titleKey.key]?.value?.length > 0 ? (
                        item[titleKey.key]?.value.map((value: any, idx: number) => (
                          <span key={idx} className="text-bold">
                            {value}
                            {idx < item[titleKey.key]?.value?.length - 1 ? ", " : ""}
                          </span>
                        ))
                      ) : (
                        <span className="text-bold">{item[titleKey.key]?.value}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-bold">
                      {titleKey.type == "Long"
                        ? formatCurrency(item[titleKey.key]?.value, ",", "")
                        : titleKey.type == "Date"
                        ? moment(item[titleKey.key]?.value).format("DD/MM/YYYY")
                        : item[titleKey.key]?.value}
                    </span>
                  )}
                </div>
              )}
            </>
          );
        } else {
          if (titleKey.type == "Array") {
            return Array.isArray(item[titleKey.key]) && item[titleKey.key]?.length > 0 ? (
              item[titleKey.key].map((value: any, idx: number) => (
                <span key={idx} className="text-bold">
                  {value}
                  {idx < item[titleKey.key].length - 1 ? ", " : ""}
                </span>
              ))
            ) : (
              <span className="text-bold">{item[titleKey.key]}</span>
            );
          }

          return item[titleKey.key] == "none"
            ? ""
            : titleKey.type == "Long"
            ? formatCurrency(item[titleKey.key], ",", "")
            : titleKey.type == "Date"
            ? moment(item[titleKey.key]).format("DD/MM/YYYY")
            : item[titleKey.key];
        }
      }
    }),
  ];

  const [dataEdit, setDataEdit] = useState<any>(null);
  const actionsTable = (item: any): IAction[] => {
    return [
      // {
      //   title: "Cài đặt luật nghiệp vụ",
      //   icon: <Icon name="Settings" style={{ width: 18 }} />,
      //   callback: () => {
      //     // navigate(`/bpm/create/${item.id}`);
      //     localStorage.setItem("backUpUrlBusinessRule", JSON.stringify(params));
      //   },
      // },
      {
        title: listIdChecked.length > 0 ? "" : "Sửa",
        disabled: listIdChecked.length > 0 ? true : false,
        icon: <Icon name="PencilSimpleLine" className={listIdChecked.length > 0 ? "icon-edit-inactive" : "icon-edit-active"} />,
        callback: () => {
          if (listIdChecked.length === 0) {
            setDataEdit(listRuleItemOriginal.find((ruleItem) => ruleItem.id === item.id));
            setShowModalDecision(true);
          }
        },
      },
      {
        title: listIdChecked.length > 0 ? "" : "Xóa",
        disabled: listIdChecked.length > 0 ? true : false,
        icon: <Icon name="TrashRox" className={listIdChecked.length > 0 ? "icon-delete-inactive" : "icon-delete-active"} />,
        callback: () => {
          if (listIdChecked.length === 0) {
            if (item.linkedCount > 0) {
              showToast("Loại luật nghiệp vụ đã được sử dụng nên không thể xoá", "warning");
            } else {
              showDialogConfirmDelete(item);
            }
          }
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (idx: number) => {
    const response = await BusinessRuleItemService.delete(idx);

    if (response.code === 0) {
      showToast("Xóa luật nghiệp vụ thành công", "success");
      getListDecisionInput(+id);
      getListDecisionOutput(+id);
      getListRuleItem(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        BusinessRuleItemService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa luật nghiệp vụ thành công", "success");
        getListDecisionInput(+id);
        getListDecisionOutput(+id);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IContractPipelineResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "luật nghiệp vụ " : `${listIdChecked.length} luật nghiệp vụ đã chọn`}
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
          onDeleteAll();
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
      title: "Xóa luật nghiệp vụ",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const { onBackProps } = props;

  return (
    <div className="page-content page-business-rule-config card-box">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              navigate(`/bpm/business_rule`);
            }}
            className="title-first"
            title="Quay lại"
          >
            Loại luật nghiệp vụ
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Cài đặt luật nghiệp vụ</h1>
        </div>
      </div>
      <div className="d-flex flex-column">
        <HeaderFilter
          params={params}
          setParams={setParams}
          listIdChecked={listIdChecked}
          showDialogConfirmDelete={showDialogConfirmDelete}
          titleActions={titleActions}
          titleSearch="Điều kiện"
          disableDeleteAll={permissions["LIST_CAUSE_TYPE_DELETE"] == 1 ? false : true}
          listSaveSearch={listSaveSearch}
        />
        {!isLoading && (listDecisionInput?.length || listDecisionOutput?.length) ? (
          <BoxTableBusinessRule
            key={listTitleKeys.length}
            name="Danh mục luật nghiệp vụ"
            titles={listTitles}
            items={listRuleItem}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            striped={true}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
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
                    Hiện tại chưa có cột điều kiện hoặc cột kết quả nào. <br />
                    Hãy thêm mới cột điều kiện hoặc cột kết quả đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton=""
                action={() => {
                  // setDataReason(null);
                  // setShowModalAdd(true);
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
      <ListColumnInput
        onShow={showModalColumnInput}
        businessRuleId={id}
        onHide={(reload) => {
          if (reload) {
            getListDecisionInput(+id);
          }
          setShowModalColumnInput(false);
        }}
      />
      <ListColumnOutput
        onShow={showModalColumnOutput}
        businessRuleId={id}
        onHide={(reload) => {
          if (reload) {
            getListDecisionOutput(+id);
          }
          setShowModalColumnOutput(false);
        }}
      />
      <ModalAddDecision
        onShow={showModalDecision}
        // onShow={true}
        data={dataEdit}
        businessRuleId={id}
        listDecisionOutput={listDecisionOutput}
        listDecisionInput={listDecisionInput}
        onHide={(reload) => {
          if (reload) {
            getListRuleItem(params);
          }
          setDataEdit(null);
          setShowModalDecision(false);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
