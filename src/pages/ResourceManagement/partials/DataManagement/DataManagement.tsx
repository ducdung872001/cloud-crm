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
import { IAction } from "model/OtherModel";
import { IKpiFilterRequest } from "model/kpi/KpiRequestModel";
import { IKpiResponse } from "model/kpi/KpiResponseModel";
import KpiService from "services/KpiService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
// import KpiSetupModal from "./partials/KpiSetupModal";
import { getPageOffset } from "reborn-util";

import "./DataManagement.scss";
import OrganizationService from "services/OrganizationService";
import ModalListUploadFile from "./ModalListUploadFile/ModalListUploadFile";

export default function DataManagement(props) {
  document.title = "Danh sách tổ chức";

  const isMounted = useRef(false);

  const { onBackProps } = props;

  const [listOrganization, setListOrganization] = useState<IKpiResponse[]>([]);
  const [dataOrganization, setDataOrganization] = useState<IKpiResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalListUploadFile, setShowModalListUploadFile] = useState<boolean>(false);

  const [tab, setTab] = useState({
    name: "tab_one",
  });

  const [params, setParams] = useState({
    name: "",
    limit: 10,
    sortedBy: 'newest',
  });

  useEffect(() => {
    setParams({ ...params });
  }, [tab]);

  const listTabs = [
    {
      title: "Danh sách tổ chức",
      is_active: "tab_one",
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "tổ chức",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListOrganization = async (paramsSearch: IKpiFilterRequest) => {
    setIsLoading(true);

    const response = await OrganizationService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListOrganization(result?.items);

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
      getListOrganization(params);
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
      permissions["KPI_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataOrganization(null);
        //   setShowModalAdd(true);
        },
      },
    ],
  };


  const titles = ["STT", `Tên tổ chức`, "Danh sách file upload"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setDataOrganization(item)
        setShowModalListUploadFile(true);
      }}
    >
      Xem
    </a>,
  ];

  const actionsTable = (item: IKpiResponse): IAction[] => {
    return [
      permissions["KPI_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataOrganization(item);
        },
      },
      permissions["KPI_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await KpiService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa KPI ${name} thành công`, "success");
      getListOrganization(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IKpiResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa KPI {item ? name : `${listIdChecked.length} ${name} đã chọn`}
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
    permissions["KPI_DELETE"] == 1 && {
      title: `Xóa KPI ${name}`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-data-management${isNoItem ? " bg-white" : ""}`}>
      {/* <TitleAction 
        title="Danh sách tổ chức" 
        // titleActions={titleActions} 
        /> */}
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Quản trị tài nguyên
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Quản trị dữ liệu</h1>
        </div>
        {/* <TitleAction title="" titleActions={titleActions} /> */}
      </div>

      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              {listTabs.map((item, idx) => (
                <li
                  key={idx}
                  className={item.is_active == tab.name ? "active" : ""}
                  onClick={(e) => {
                    e && e.preventDefault();
                    setTab({ name: item.is_active });
                  }}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
          <SearchBox name={`Tên tổ chức`} params={params} updateParams={(paramsNew) => setParams(paramsNew)} />
        </div>
        {!isLoading && listOrganization && listOrganization.length > 0 ? (
          <BoxTable
            name="Danh sách tổ chức"
            titles={titles}
            items={listOrganization}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            striped={true}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            // actions={actionsTable}
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
                    Hiện tại chưa có tổ chức nào. <br />
                    Hãy thêm mới tổ chức nhé!
                  </span>
                }
                type="no-item"
                titleButton=''
                action={() => {
                  setDataOrganization(null);
                //   setShowModalAdd(true);
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
        
        <ModalListUploadFile
          onShow={showModalListUploadFile}
          data={dataOrganization}
          onHide={(reload) => {
            if (reload) {
              getListOrganization(params);
            }

            setShowModalListUploadFile(false);
          }}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}
