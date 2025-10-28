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
import { IKpiTemplateFilterRequest } from "model/kpiTemplate/KpiTemplateRequestModel";
import { IKpiTemplateResponse } from "model/kpiTemplate/KpiTemplateResponseModel";
import KpiTemplateService from "services/KpiTemplateService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common"; 
import AddKpiTemplateModal from "./partials/AddKpiTemplateModal";
import KpiTemplateGoalModal from "./partials/KpiTemplateGoalModal";
import { getPageOffset } from 'reborn-util';
import Button from "components/button/button";


import "./KpiTemplateList.scss";

export default function KpiTemplateList(props: any) {
  document.title = "Danh sách mẫu KPI";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listKpiTemplate, setListKpiTemplate] = useState<IKpiTemplateResponse[]>([]);
  const [dataKpiTemplate, setDataKpiTemplate] = useState<IKpiTemplateResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [showModalKpiTemplateGoal, setShowModalKpiTemplateGoal] = useState<boolean>(false);
  const [infoKpiTemplate, setInfoKpiTemplate] = useState(null);

  const [tab, setTab] = useState({
    name: "tab_one"
  });

  const [params, setParams] = useState<IKpiTemplateFilterRequest>({
    name: ""
  });

  useEffect(() => {
    setParams({ ...params });
  }, [tab]);

  const listTabs = [
    {
      title: "Danh sách mẫu KPI",
      is_active: "tab_one"
    }
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "cài đặt chỉ số KPI",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListKpiTemplate = async (paramsSearch: IKpiTemplateFilterRequest) => {
    setIsLoading(true);

    const response = await KpiTemplateService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListKpiTemplate(result?.items);

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
      getListKpiTemplate(params);
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
      permissions["KPI_TEMPLATE_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataKpiTemplate(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const name = "xử lý ticket";

  useEffect(() => {
    setPagination({ ...pagination, name: name });
  }, [tab]);

  const titles = ["STT", `Tên KPI`, "Mô tả", "Chỉ tiêu KPI"];

  const dataFormat = ["text-center", "", "", "text-center"];

  const dataMappingArray = (item: IKpiTemplateResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.description,
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setInfoKpiTemplate({ idTemplate: item.id, nameTemplate: item.name });
        setShowModalKpiTemplateGoal(true);
      }}
    >
      Xem
    </a>
  ];

  const actionsTable = (item: IKpiTemplateResponse): IAction[] => {
    return [
      permissions["KPI_TEMPLATE_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataKpiTemplate(item);
          setShowModalAdd(true);
        },
      },
      permissions["KPI_TEMPLATE_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await KpiTemplateService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa mẫu KPI ${name} thành công`, "success");
      getListKpiTemplate(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IKpiTemplateResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa mẫu KPI {item ? name : `${listIdChecked.length} ${name} đã chọn`}
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
    permissions["KPI_TEMPLATE_DELETE"] == 1 && {
      title: `Xóa mẫu KPI ${name}`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-ticket-proc${isNoItem ? " bg-white" : ""}`}>      
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt KPI
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Mẫu KPI</h1>
        </div>
          <Button
            className="btn__add"
            onClick={(e) => {
              e && e.preventDefault();
              setDataKpiTemplate(null);
              setShowModalAdd(true);
            }}
          >
            Thêm mới
          </Button>
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
          <SearchBox
            name={`Tên mẫu KPI`}
            params={params}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
        </div>
        {!isLoading && listKpiTemplate && listKpiTemplate.length > 0 ? (
          <BoxTable
            name="Danh sách mẫu KPI"
            titles={titles}
            items={listKpiTemplate}
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
                    Hiện tại chưa có mẫu KPI {name} nào. <br />
                    Hãy thêm mới mẫu KPI {name} nhé!
                  </span>
                }
                type="no-item"
                titleButton={`Thêm mới mẫu KPI ${name}`}
                action={() => {
                  setDataKpiTemplate(null);
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
        <AddKpiTemplateModal
          onShow={showModalAdd}
          data={dataKpiTemplate}
          onHide={(reload) => {
            if (reload) {
              getListKpiTemplate(params);
            }
            setShowModalAdd(false);
          }}
        />
        <KpiTemplateGoalModal
          infoKpiTemplate={infoKpiTemplate}
          onShow={showModalKpiTemplateGoal}
          onHide={(reload) => {
            if (reload) {
              getListKpiTemplate(params);
            }

            setShowModalKpiTemplateGoal(false);
          }}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}
