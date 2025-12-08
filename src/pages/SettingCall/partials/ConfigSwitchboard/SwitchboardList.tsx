import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IAction, ISaveSearch } from "model/OtherModel";
import { ISwitchboardListProps } from "model/switchboard/PropsModel";
import { ISwitchboardFilterRequest } from "model/switchboard/SwitchboardRequestModel";
import { ISwitchboardResponseModel } from "model/switchboard/SwitchboardResponseModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import SwitchboardService from "services/SwitchboardService";
import AddSwitchboardModel from "./partials/AddSwitchboardModel";
import { getPageOffset } from 'reborn-util';

import "./Switchboard.scss";
import Badge from "components/badge/badge";
import OperatorList from "./OperatorList/OperatorList";

export default function SwitchboardList(props: ISwitchboardListProps) {
  document.title = "Khai báo Tổng đài";

  const { onBackProps } = props;
  const isMounted = useRef(false);

  const [listSwitchboard, setListSwitchboard] = useState<ISwitchboardFilterRequest[]>([]);
  const [dataSwitchboard, setDataSwitchboard] = useState<ISwitchboardResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalListOperator, setShowModalListOperator] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [showChangeStatus, setShowChangeStatus] = useState<boolean>(false);
  const [contentChangeStatus, setContentChangeStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [modalWhiteList, setModalWhiteList] = useState(false);
  const [showDialogPause, setShowDialogPause] = useState<boolean>(false);
  const [contentDialogPause, setContentDialogPause] = useState<any>(null);
  const [showDialogApprove, setShowDialogApprove] = useState<boolean>(false);
  const [contentDialogApprove, setContentDialogApprove] = useState<any>(null);
  const [params, setParams] = useState<ISwitchboardFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách Tổng đài",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Tổng đài",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListSwitchboard = async (paramsSearch: ISwitchboardFilterRequest) => {
    setIsLoading(true);

    const response = await SwitchboardService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListSwitchboard(result);

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
      getListSwitchboard(params);
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
      permissions["CALL_CONFIG_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataSwitchboard(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên tổng đài", "Ngày hết hạn đăng ký", "Đối tác Tổng đài", "Trạng thái", "Danh sách tổng đài viên"];

  const dataFormat = ["text-center", "", "text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item: ISwitchboardResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.expiredDate ? moment(item.expiredDate).format("DD/MM/YYYY") : "",
    item.partnerName,
    <Badge
      key={item.id}
      text={item.active === 1 ? "Đã kích hoạt" : "Chưa kích hoạt"}
      variant={item.active === 1 ? "success" : "secondary" }
    />,
    <div
      key={item.id}
      className={`action__view--employee`}
      onClick={() => {
        setShowModalListOperator(true);
        setDataSwitchboard(item);
      }}
    >
      <a>Xem thêm</a>
    </div>,    
  ];

  const actionsTable = (item: ISwitchboardResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return [  
      {
        title: "Đổi trạng thái",
        icon: <Icon name="ResetPassword" className="icon-warning" />,
        callback: () => {
          showDialogConfirmChangeStatus(item);
        },
      },    
      permissions["CALL_CONFIG_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataSwitchboard(item);
          setShowModalAdd(true);
        },
      },
      permissions["CALL_CONFIG_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          showDialogConfirmDelete(item);
          }
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await SwitchboardService.delete(id);

    if (response.code === 0) {
      showToast("Xóa tổng đài thành công", "success");
      getListSwitchboard(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    const arrPromises = selectedIds.map((selectedId) => {
      const found = listSwitchboard.find((item) => item.id === selectedId);
      if (found?.id) {
        return SwitchboardService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} tổng đài`, "success");
        getListSwitchboard(params);
        setListIdChecked([]);
      } else {
        showToast("Không có tổng đài nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: ISwitchboardResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "Tổng đài " : `${listIdChecked.length} Tổng đài đã chọn`}
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
        if (item?.id) {
          onDelete(item.id);
          return;
        }
        if (listIdChecked.length>0) {
          onDeleteAll();
          return;
        }
      }
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["CALL_CONFIG_DELETE"] == 1 && {
      title: "Xóa khai báo tổng đài",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const onApprove = async (item, status) => {
    const param = {
      id: item.whitelist?.id || null,
      type: 'sms',
      Switchboard: item.name,
      isUat: status,
    };
    const response = null; //await SwitchboardService.changeStatusWhiteList(param);

    if (response.code === 0) {
      if(status){
        showToast("Kích hoạt thành công", "success");
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      } else {
        showToast("Tạm dừng thành công", "success");
        setShowDialogPause(false);
        setContentDialogPause(null);
      }
      
      getListSwitchboard(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };    

  const showDialogConfirmChangeStatus = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: item.active === 1 ? "warning" : 'success',
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Đổi trạng thái</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn đổi sang trạng thái {<span style={{fontWeight:'600'}}>{item.active === 1 ? 'chưa kích hoạt' : 'đã kích hoạt'}</span>}?
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowChangeStatus(false);
        setContentChangeStatus(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        if(item.active === 1){
          changeStatus(item.id, 0);
        } else {
          changeStatus(item.id, 1)
        }
      },
    };
    setContentChangeStatus(contentDialog);
    setShowChangeStatus(true);
  };

  const changeStatus = async (id: number, active) => {
    const param = {
        id: id,
        active: active
    }
    const response = await SwitchboardService.updateStatus(param);

    if (response.code === 0) {
      showToast("Đổi trạng thái thành công", "success");
      getListSwitchboard(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowChangeStatus(false);
    setContentChangeStatus(null);
  };

  return (
    <div className="page-content page-switchboard">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt Tổng đài
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Khai báo tổng đài</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên tổng đài"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listSwitchboard && listSwitchboard.length > 0 ? (
          <BoxTable
            name="Tổng đài"
            titles={titles}
            items={listSwitchboard}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            isBulkAction={true}
            listIdChecked={listIdChecked}
            bulkActionItems={bulkActionList}
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
                    Hiện tại chưa có Tổng đài nào. <br />
                    Hãy thêm mới Tổng đài đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới Tổng đài"
                action={() => {
                  setDataSwitchboard(null);
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
      <AddSwitchboardModel
        onShow={showModalAdd}
        data={dataSwitchboard}
        onHide={(reload) => {
          if (reload) {
            getListSwitchboard(params);
          }
          setShowModalAdd(false);
        }}
      />    

      <OperatorList
        onShow={showModalListOperator}
        dataSwitchboard={dataSwitchboard}
        onHide={(reload) => {
          if (reload) {
            getListSwitchboard(params);
          }
          setShowModalListOperator(false);
          setDataSwitchboard(null);
        }}
      />      
      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDialogPause} isOpen={showDialogPause} />
      <Dialog content={contentDialogApprove} isOpen={showDialogApprove} />
      <Dialog content={contentChangeStatus} isOpen={showChangeStatus} />

    </div>
  );
}
