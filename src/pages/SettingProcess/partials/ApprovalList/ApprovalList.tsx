import React, { Fragment, useState, useEffect, useRef, useContext } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Badge from "components/badge/badge";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import ApprovalService from "services/ApprovalService";
import AddApprovalModal from "./partials/AddApprovalModal";
import ApprovalWorkflowSetup from "./partials/ApprovalWorkflowSetup";
import { useWindowDimensions } from "utils/hookCustom";
import { ContextType, UserContext } from "contexts/userContext";
import ApprovalBellModal from "./partials/ApprovalBellModal";

import "./ApprovalList.scss";

interface IApprovalListProps {
  onBackProps: (backup: boolean) => void;
}

export default function ApprovalList(props: IApprovalListProps) {
  document.title = "Quy trình phê duyệt";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const { dataInfoEmployee } = useContext(UserContext) as ContextType;

  const [listApproval, setListApproval] = useState([]);
  const [dataApproval, setDataApproval] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [hasSetupSigningProcess, setHasSetupSigningProcess] = useState<boolean>(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const { width } = useWindowDimensions();

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách quy trình phê duyệt",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "phê duyệt",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListApproval = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ApprovalService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListApproval(result.items);

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
      getListApproval(params);
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
      {
        title: "Thêm mới",
        callback: () => {
          setDataApproval(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên quy trình phê duyệt", "Trạng thái"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    <Badge key={item.id} text={item.status ? "Đã phê duyệt" : "Chưa phê duyệt"} variant={item.status ? "success" : "secondary"} />,
  ];

  const handleCheckEmployeeIds = (array) => {
    const employeeIds = new Set();

    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      employeeIds.add(item.employeeId);
    }

    return !(employeeIds.has(-2) && employeeIds.has(-1) && employeeIds.has(0));
  };

  const compareArrays = (arrayConfig, arrayLink) => {
    for (let i = 0; i < arrayLink.length; i++) {
      const item2 = arrayLink[i];
      const matchedItem = arrayConfig.find((item1) => item1.id === item2.nodeFrom);
      if (matchedItem) {
        if (matchedItem.employeeId === 0) {
          const targetItem = arrayConfig.find((item) => item.id === item2.nodeTo);
          if (targetItem && (targetItem.employeeId === -1 || targetItem.employeeId === -2)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const checkValidity = (arrayConfig, arrayLink) => {
    const filteredIds = arrayConfig
      .filter((item) => item.employeeId !== -2 && item.employeeId !== -1 && item.employeeId !== 0)
      .map((item) => item.id);

    const occurrences = {};

    for (const obj of arrayLink) {
      occurrences[obj.nodeFrom] = (occurrences[obj.nodeFrom] || 0) + 1;
      occurrences[obj.nodeTo] = (occurrences[obj.nodeTo] || 0) + 1;
    }

    for (const num of filteredIds) {
      //TODO: đoạn này cần check lại, theo mình thấy thì chỉ cần lớn hơn 1
      if ((occurrences[num] || 0) <= 2) {
        // Nếu số lần xuất hiện của num trong occurrences nhỏ hơn hoặc bằng 2, trả về false
        return false;
      }
    }

    return true;
  };

  const [isLoadingChangeStatus, setIsLoadingChangeStatus] = useState<boolean>(false);

  const handleValidateApprove = async (id: number, item: any) => {
    if (!id) return;

    setIsLoadingChangeStatus(true);

    const params = {
      approvalId: id,
    };

    let lstLink = [];
    let lstConfig = [];

    const responseConfig = await ApprovalService.lstConfig(params);

    const responseLink = await ApprovalService.lstLink(params);

    if (responseConfig.code === 0) {
      const result = responseConfig.result;
      lstConfig = result;
    } else {
      showToast("Có lỗi config xảy ra. Vui lòng thử lại sau", "error");
    }

    if (responseLink.code === 0) {
      const result = responseLink.result;
      lstLink = result;
    } else {
      showToast("Có lỗi link xảy ra. Vui lòng thử lại sau", "error");
    }

    if (lstConfig.length === 0 && lstLink.length === 0) {
      showToast("Cài đặt quy trình ký chưa có dữ liệu. Vui lòng cấp dữ liệu và thử lại !", "warning");
      setIsLoadingChangeStatus(false);
      return;
    }

    if (lstConfig.length > 0 && lstLink.length === 0) {
      showToast("Cài đặt quy trình ký không hợp lệ. Vui lòng xem lại quy trình !", "warning");
      setIsLoadingChangeStatus(false);
      return;
    }

    if (lstLink.length > 0 && lstConfig.length === 0) {
      showToast("Cài đặt quy trình ký không hợp lệ. Vui lòng xem lại quy trình !", "warning");
      setIsLoadingChangeStatus(false);
      return;
    }

    if (lstConfig.length > 0) {
      const checkEmployeeIds = handleCheckEmployeeIds(lstConfig);

      if (checkEmployeeIds) {
        showToast("Cài đặt quy trình ký không hợp lệ. Vui lòng xem lại quy trình !", "warning");
        setIsLoadingChangeStatus(false);
        return;
      }
    }

    if (lstConfig.length > 0 && lstLink.length > 0) {
      const hasCompareArray = compareArrays(lstConfig, lstLink);

      if (hasCompareArray) {
        showToast("Cài đặt quy trình ký không hợp lệ. Vui lòng xem lại quy trình !", "warning");
        setIsLoadingChangeStatus(false);
        return;
      } else {
        const hasCheckValidity = checkValidity(lstConfig, lstLink);

        if (hasCheckValidity) {
          showDialogConfirmStatus(item);
          setIsLoadingChangeStatus(false);
          return;
        } else {
          showToast("Cài đặt quy trình ký không hợp lệ. Vui lòng xem lại quy trình !", "warning");
          setIsLoadingChangeStatus(false);
          return;
        }
      }
    }
  };

  const [showModalBellApproval, setShowModalBellApproval] = useState<boolean>(false);

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Cài đặt cảnh báo",
        icon: 
        <Icon 
          name="Bell" 
          // className="icon-extra" 
        />,
        callback: () => {
          setDataApproval(item);
          setShowModalBellApproval(true);
        },
      },
      {
        title: item.status ? "Phê duyệt" : "Chưa phê duyệt",
        icon: !item.status ? (
          <Icon
            name={isLoadingChangeStatus && item.id === dataApproval?.id ? "Loading" : "WarningCircle"}
            className={isLoadingChangeStatus && item.id === dataApproval?.id ? "" : "icon-warning"}
          />
        ) : (
          <Icon name="CheckedCircle" className="icon-success" />
        ),
        callback: () => {
          setDataApproval(item);
          handleValidateApprove(item.id, item);
        },
      },
      {
        title: "Cài đặt quy trình ký",
        icon: <Icon name="Settings" />,
        callback: () => {
          setDataApproval(item);
          setHasSetupSigningProcess(true);
        },
      },
      ...(item.status !== 1
        ? [
            {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setDataApproval(item);
                setShowModalAdd(true);
              },
            },
            {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]
        : []),
      ...(dataInfoEmployee && dataInfoEmployee.isOwner === 1 && item.status === 1
        ? [
            {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]
        : []),
    ];
  };

  const handleChangeStatus = async (item) => {
    const body = {
      id: item.id,
      status: item.status ? 0 : 1,
    };

    const response = await ApprovalService.updateStatus(body);

    if (response.code === 0) {
      showToast(`${item.status ? "Chưa phê duyệt" : "Phê duyệt"} thành công`, "success");
      getListApproval(params);
    } else {
      showToast(`Có lỗi xảy ra. Vui lòng thử lại sau!`, "error");
    }

    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmStatus = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>{item.status ? "Phê duyệt" : "Chưa phê duyệt"} quy trình ký</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn chuyển trạng thái <strong>{item.status ? "chưa phê duyệt" : "phê duyệt"}</strong> của quy trình ký
          {item ? <strong> {item.name}</strong> : ""}.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => handleChangeStatus(item),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const onDelete = async (id: number) => {
    const response = await ApprovalService.delete(id);

    if (response.code === 0) {
      showToast("Xóa quy trình phê duyệt thành công", "success");
      getListApproval(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
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
          Bạn có chắc chắn muốn xóa {item ? "quy trình phê duyệt " : `${listIdChecked.length} quy trình phê duyệt đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa phê duyệt",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-approval${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup" style={hasSetupSigningProcess ? { marginBottom: "1.6rem" } : {}}>
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className={`title-first ${hasSetupSigningProcess && width <= 768 ? "d-none" : ""}`}
            title="Quay lại"
          >
            Cài đặt quy trình
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
            className={`${hasSetupSigningProcess && width <= 768 ? "d-none" : ""}`}
          />
          <h1
            className={`title-last ${hasSetupSigningProcess ? "active" : ""}`}
            onClick={() => {
              setHasSetupSigningProcess(false);
            }}
          >
            Quy trình phê duyệt
          </h1>
          {hasSetupSigningProcess && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setHasSetupSigningProcess(false);
                }}
              />
              <h1 className="title-last">Cài đặt quy trình ký</h1>
            </Fragment>
          )}
        </div>
        {!hasSetupSigningProcess && <TitleAction title="" titleActions={titleActions} />}
      </div>

      <div className="card-box d-flex flex-column">
        <div className={hasSetupSigningProcess ? "d-none" : ""}>
          <SearchBox
            name="Tên quy trình phê duyệt"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listApproval && listApproval.length > 0 ? (
            <BoxTable
              name="Phê duyệt"
              titles={titles}
              items={listApproval}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              isBulkAction={true}
              listIdChecked={listIdChecked}
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
                      Hiện tại chưa có quy trình phê duyệt nào. <br />
                      Hãy thêm mới quy trình phê duyệt đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới quy trình phê duyệt"
                  action={() => {
                    setDataApproval(null);
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

        <div className={hasSetupSigningProcess ? "" : "d-none"}>
          <ApprovalWorkflowSetup
            onShow={hasSetupSigningProcess}
            data={dataApproval}
            onHide={(reload) => {
              if (reload) {
                getListApproval(params);
              }

              setHasSetupSigningProcess(false);
            }}
          />
        </div>
      </div>
      <AddApprovalModal
        onShow={showModalAdd}
        data={dataApproval}
        onHide={(reload) => {
          if (reload) {
            getListApproval(params);
          }
          setShowModalAdd(false);
        }}
      />
      <ApprovalBellModal
        onShow={showModalBellApproval}
        data={dataApproval}
        onHide={(reload) => {
          if (reload) {
            getListApproval(params);
          }
          setShowModalBellApproval(false);
          setDataApproval(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
