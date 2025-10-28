import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IWarrantyCategoryFilterRequest } from "model/warrantyCategory/WarrantyCategoryRequestModel";
import { IWarrantyCategoryResponse } from "model/warrantyCategory/WarrantyCategoryResponseModel";
import WarrantyProcService from "services/WarrantyProcService";
import { showToast } from "utils/common";
import AddWarrantyProcModel from "./partials/AddWarrantyProcModel";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import { useWindowDimensions } from "utils/hookCustom";
import SetupSupportWarranty from "pages/Common/SetupSupportWarranty";
import SupportCommonService from "services/SupportCommonService";

import "./WarrantyProcList.scss";

export default function WarrantyProcList(props) {
  document.title = "Quy trình xử lý bảo hành";

  const isMounted = useRef(false);

  const { onBackProps } = props;

  const [listSettingWarranty, setListSettingWarranty] = useState<IWarrantyCategoryResponse[]>([]);
  const [dataSettingWarranty, setDataSettingWarranty] = useState<IWarrantyCategoryResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [infoProc, setInfoProc] = useState(null);
  const [hasSetupSupportWarranty, setHasSetupSupportWarranty] = useState<boolean>(false);

  const { width } = useWindowDimensions();

  const [params, setParams] = useState<IWarrantyCategoryFilterRequest>({
    name: "",
    type: 2,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "cài đặt bảo hành",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListSettingWarranty = async (paramsSearch: IWarrantyCategoryFilterRequest) => {
    setIsLoading(true);

    const response = await WarrantyProcService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListSettingWarranty(result.items);

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
      getListSettingWarranty(params);
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
      permissions["WARRANTY_PROC_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataSettingWarranty(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const name = "quy trình bảo hành";

  const titles = ["STT", `Tên ${name}`, "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: IWarrantyCategoryResponse, index: number) => [getPageOffset(params) + index + 1, item.name, item.position];

  const [isLoadingChangeStatus, setIsLoadingChangeStatus] = useState<boolean>(false);

  const handleCheckDepartmentIds = (array) => {
    const departmentIds = new Set();

    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      departmentIds.add(item.departmentId);
    }

    return !(departmentIds.has(-1) && departmentIds.has(0));
  };

  const compareArrays = (arrayConfig, arrayLink) => {
    for (let i = 0; i < arrayLink.length; i++) {
      const item2 = arrayLink[i];
      const matchedItem = arrayConfig.find((item1) => item1.id === item2.nodeFrom);
      if (matchedItem) {
        if (matchedItem.departmentId === 0) {
          const targetItem = arrayConfig.find((item) => item.id === item2.nodeTo);
          if (targetItem && targetItem.departmentId === -1) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const checkValidity = (arrayConfig, arrayLink) => {
    const filteredIds = arrayConfig
      .filter((item) => item.departmentId !== -2 && item.departmentId !== -1 && item.departmentId !== 0)
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

  const handleValidateSupport = async (id: number, item: any) => {
    if (!id) return;

    setIsLoadingChangeStatus(true);

    const params = {
      supportId: id,
    };

    let lstLink = [];
    let lstConfig = [];

    const responseConfig = await SupportCommonService.lstConfig(params);

    const responseLink = await SupportCommonService.lstLink(params);

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
      showToast("Cài đặt quy trình bảo hành chưa có dữ liệu. Vui lòng cấp dữ liệu và thử lại !", "warning");
      setIsLoadingChangeStatus(false);
      return;
    }

    if (lstConfig.length > 0 && lstLink.length === 0) {
      showToast("Cài đặt quy trình bảo hành không hợp lệ. Vui lòng xem lại quy trình !", "warning");
      setIsLoadingChangeStatus(false);
      return;
    }

    if (lstLink.length > 0 && lstConfig.length === 0) {
      showToast("Cài đặt quy trình bảo hành không hợp lệ. Vui lòng xem lại quy trình !", "warning");
      setIsLoadingChangeStatus(false);
      return;
    }

    if (lstConfig.length > 0) {
      const checkDepartmentIds = handleCheckDepartmentIds(lstConfig);

      if (checkDepartmentIds) {
        showToast("Cài đặt quy trình bảo hành không hợp lệ. Vui lòng xem lại quy trình !", "warning");
        setIsLoadingChangeStatus(false);
        return;
      }
    }

    if (lstConfig.length > 0 && lstLink.length > 0) {
      const hasCompareArray = compareArrays(lstConfig, lstLink);

      if (hasCompareArray) {
        showToast("Cài đặt quy trình bảo hành không hợp lệ. Vui lòng xem lại quy trình !", "warning");
        setIsLoadingChangeStatus(false);
        return;
      } else {
        const hasCheckValidity = checkValidity(lstConfig, lstLink);

        if (hasCheckValidity) {
          showDialogConfirmStatus(item);
          setIsLoadingChangeStatus(false);
          return;
        } else {
          showToast("Cài đặt quy trình bảo hành không hợp lệ. Vui lòng xem lại quy trình !", "warning");
          setIsLoadingChangeStatus(false);
          return;
        }
      }
    }
  };

  const handleChangeStatus = async (item) => {
    const body = {
      id: item.id,
      status: item.status ? 0 : 1,
      type: 2,
    };

    const response = await SupportCommonService.updateStatusSupport(body);

    if (response.code === 0) {
      showToast(`${item.status ? "Chưa phê duyệt" : "Phê duyệt"} thành công`, "success");
      getListSettingWarranty(params);
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
      title: <Fragment>{item.status ? "Phê duyệt" : "Chưa phê duyệt"} quy bảo hành</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn chuyển trạng thái <strong>{item.status ? "chưa phê duyệt" : "phê duyệt"}</strong> của quy bảo hành
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

  const actionsTable = (item: IWarrantyCategoryResponse): IAction[] => {
    return [
      {
        title: item.status ? "Phê duyệt" : "Chưa phê duyệt",
        icon: !item.status ? (
          <Icon
            name={isLoadingChangeStatus && item.id === dataSettingWarranty?.id ? "Loading" : "WarningCircle"}
            className={isLoadingChangeStatus && item.id === dataSettingWarranty?.id ? "" : "icon-warning"}
          />
        ) : (
          <Icon name="CheckedCircle" className="icon-success" />
        ),
        callback: () => {
          setDataSettingWarranty(item);
          handleValidateSupport(item.id, item);
        },
      },
      {
        title: "Cấu hình quy trình xử lý bảo hành",
        icon: <Icon name="Settings" />,
        callback: () => {
          setHasSetupSupportWarranty(true);
          setDataSettingWarranty(item);
        },
      },
      permissions["WARRANTY_PROC_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataSettingWarranty(item);
          setShowModalAdd(true);
        },
      },
      permissions["WARRANTY_PROC_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await WarrantyProcService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa danh mục ${name} thành công`, "success");
      getListSettingWarranty(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IWarrantyCategoryResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa danh mục {item ? name : `${listIdChecked.length} ${name} đã chọn`}
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
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
    permissions["WARRANTY_PROC_DELETE"] == 1 && {
      title: `Xóa danh mục ${name}`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách quy trình xử lý bảo hành",
      is_active: true,
    },
  ]);

  return (
    <div className={`page-content page__warranty--support${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation" style={hasSetupSupportWarranty ? { marginBottom: "1.6rem" } : {}}>
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className={`title-first ${hasSetupSupportWarranty && width <= 768 ? "d-none" : ""}`}
            title="Quay lại"
          >
            Cài đặt bảo hành
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
            className={`${hasSetupSupportWarranty && width <= 768 ? "d-none" : ""}`}
          />
          <h1
            className={`title-last ${hasSetupSupportWarranty ? "active" : ""}`}
            onClick={() => {
              setHasSetupSupportWarranty(false);
            }}
          >
            Quy trình xử lý bảo hành
          </h1>
          {hasSetupSupportWarranty && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setHasSetupSupportWarranty(false);
                }}
              />
              <h1 className="title-last">Cấu hình quy trình xử lý bảo hành</h1>
            </Fragment>
          )}
        </div>
        {!hasSetupSupportWarranty && <TitleAction title="" titleActions={titleActions} />}
      </div>

      <div className="card-box d-flex flex-column">
        <div className={hasSetupSupportWarranty ? "d-none" : ""}>
          <SearchBox
            name={`Tên ${name}`}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            params={params}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listSettingWarranty && listSettingWarranty.length > 0 ? (
            <BoxTable
              name="Cài đặt bảo hành"
              titles={titles}
              items={listSettingWarranty}
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
                      Hiện tại chưa có danh mục {name} nào. <br />
                      Hãy thêm mới danh mục {name} đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton={`Thêm mới ${name}`}
                  action={() => {
                    setDataSettingWarranty(null);
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
        <div className={hasSetupSupportWarranty ? "" : "d-none"}>
          <SetupSupportWarranty
            onShow={hasSetupSupportWarranty}
            data={dataSettingWarranty}
            onHide={(reload) => {
              if (reload) {
                getListSettingWarranty(params);
              }

              setHasSetupSupportWarranty(false);
            }}
          />
        </div>
        <AddWarrantyProcModel
          onShow={showModalAdd}
          data={dataSettingWarranty}
          onHide={(reload) => {
            if (reload) {
              getListSettingWarranty(params);
            }
            setShowModalAdd(false);
          }}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}
