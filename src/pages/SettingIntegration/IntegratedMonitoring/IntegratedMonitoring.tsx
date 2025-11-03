import React, { Fragment, useState, useEffect, useRef } from "react";
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
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from 'reborn-util';
import "./IntegratedMonitoring.scss";
import Badge from "components/badge/badge";
import IntegrationPartnerService from "services/IntegrationPartnerService";
import WorkTypeService from "services/WorkTypeService";
import moment from "moment";
import { IWorkTypeFilterRequest } from "model/workType/WorkTypeRequestModel";

export default function IntegratedMonitoring(props: any) {
  document.title = "Danh sách ứng dụng";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listLog, setListLog] = useState([]);
  const [dataLog, setDataLog] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showChangeStatus, setShowChangeStatus] = useState<boolean>(false);
  const [contentChangeStatus, setContentChangeStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState<IWorkTypeFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách ứng dụng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "ứng dụng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListLog = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await IntegrationPartnerService.logList(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      const newResult = (result?.items || []).map(item => {
        return {
            ...item,
            partner: item.partner && JSON.parse(item.partner) ? JSON.parse(item.partner) : null
        }
      })
      
      setListLog(newResult);

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
      getListLog(params);
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
    //   {
    //     title: "Thêm mới",
    //     callback: () => {
    //       setDataWorkType(null);
    //       setShowModalAdd(true);
    //     },
    //   },
    ],
  };

  const titles = ["STT", "Ảnh Logo", "Tên ứng dụng", "Ngày đồng bộ", "Loại đồng bộ", "Trạng thái"];

  const dataFormat = ["text-center", "text-center", "", "text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    <div>
      <Image src={item.partner.avatar || ''} alt={''} width={"64rem"} />
    </div>,
    item.partnerName || '',
    item.syncedTime ? moment(item.syncedTime).format('DD/MM/YYYY') : '',
    item.messageType === 'product' ? 'Sản phẩm' : item.messageType === 'service' ? 'Dịch vụ' : '',
    <Badge
        key={item.id}
        text={item.status === 0 ? "Chưa đồng bộ" : item.status === 1 ? "Đồng bộ thành công" : item.status === 2 ? "Đồng bộ thất bại" : ""}
        variant={item.status === 0 ? "secondary" : item.status === 1 ? "success" : item.status === 2 ? "error" : "primary"}
    />,
    // item.errorMessage,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
        item.status === 2 && 
        {
          title: "Đổi trạng thái chưa đồng bộ",
          icon: <Icon name="ResetPassword" className="icon-warning" />,
          callback: () => {
            showDialogConfirmChangeStatus(item);
          },
        },

        // {
        //     title: "Xem chi tiết",
        //     icon: <Icon name="Eye" />,
        //     callback: () => {},
        // },
    //   {
    //     title: "Sửa",
    //     icon: <Icon name="Pencil" />,
    //     callback: () => {
    //       setDataWorkType(item);
    //       setShowModalAdd(true);
    //     },
    //   },
    //   {
    //     title: "Xóa",
    //     icon: <Icon name="Trash" className="icon-error" />,
    //     callback: () => {
    //       showDialogConfirmDelete(item);
    //     },
    //   },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await WorkTypeService.delete(id);

    if (response.code === 0) {
      showToast("Xóa loại công việc thành công", "success");
      getListLog(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowChangeStatus(false);
    setContentChangeStatus(null);
  };

  const changeStatus = async (id: number) => {
    const param = {
        id: id,
        status: 0
    }
    const response = await IntegrationPartnerService.updateStatus(param);

    if (response.code === 0) {
      showToast("Đổi trạng thái thành công", "success");
      getListLog(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowChangeStatus(false);
    setContentChangeStatus(null);
  };

  const showDialogConfirmChangeStatus = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Đổi trạng thái</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn đổi sang trạng thái {<span style={{fontWeight:'600'}}>chưa đồng bộ</span>}?
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowChangeStatus(false);
        setContentChangeStatus(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => changeStatus(item.id),
    };
    setContentChangeStatus(contentDialog);
    setShowChangeStatus(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    // {
    //   title: "Xóa loại công việc",
    //   callback: () => showDialogConfirmDelete(),
    // },
  ];



  return (
    <div className={`page-content page-integrated-monitoring${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt tích hợp
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Giám sát tích hợp</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        {/* <SearchBox
          name="Tên ứng dụng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        /> */}
        {!isLoading && listLog && listLog.length > 0 ? (
          <BoxTable
            name="Danh sách ứng dụng"
            titles={titles}
            items={listLog}
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
                    Hiện tại chưa có tích hợp ứng dụng nào. <br />
                  </span>
                }
                type="no-item"
                titleButton=""
                action={() => {}}
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
      
      <Dialog content={contentChangeStatus} isOpen={showChangeStatus} />
    </div>
  );
}
