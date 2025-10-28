import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch } from "model/OtherModel";
import { ICareerResponse } from "model/career/CareerResponse";
import { ICareerFilterRequest } from "model/career/CareerRequest";
import { ICustomerCareerListProps } from "model/career/PropsModel";
import CareerService from "services/CareerService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import AddCustomerCareerModal from "./partials/AddCustomerCareerModal";
import { getPageOffset } from 'reborn-util';

import "./CustomerCareerList.scss";

export default function CustomerCareerList(props: ICustomerCareerListProps) {
  document.title = "Danh sách ngành nghề/nghề nghiệp";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listCareerCustomer, setListCareerCustomer] = useState<ICareerResponse[]>([]);
  const [dataCareerCustomer, setDataCareerCustomer] = useState<ICareerResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [tab, setTab] = useState('tab_one')
  useEffect(() => {
    if(tab === 'tab_one'){
      setParams((preState) => ({...preState, custType: 0}));
    } else {
      setParams((preState) => ({...preState, custType: 1}));
    }
  }, [tab])
  const [params, setParams] = useState<ICareerFilterRequest>({
    name: "",
    limit: 10,
    page: 1
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách ngành nghề/nghề nghiệp",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Danh sách nghề nghiệp",
      is_active: "tab_one",
    },
    {
      title: "Danh sách ngành nghề",
      is_active: "tab_two",
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: tab === 'tab_one' ? "nghề nghiệp" : 'ngành nghề',
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCareerCustomer = async (paramsSearch: ICareerFilterRequest) => {
    setIsLoading(true);

    const response = await CareerService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCareerCustomer(result.items);

      setPagination({
        ...pagination,
        name: tab === 'tab_one' ? "nghề nghiệp" : 'ngành nghề',
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (result.length === 0 && params?.name == "") {
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
      getListCareerCustomer(params);
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
      permissions["CAREER_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataCareerCustomer(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên nghề nghiệp", "Thứ tự hiển thị"];
  const titlesCompany = ["STT", "Tên ngành nghề", "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "", "text-center"];

  const getCustTypeName = (custType: number) => {
    switch (custType) {
      case 0:
        return "Cá nhân";
      default:
        return "Doanh nghiệp";
    }
  }

  const dataMappingArray = (item: ICareerResponse, index: number) => [
    getPageOffset(params) + index + 1, 
    // getCustTypeName(item.custType),
    item.name, 
    item.position
  ];

  const actionsTable = (item: ICareerResponse): IAction[] => {
    return [
      permissions["CAREER_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataCareerCustomer(item);
          setShowModalAdd(true);
        },
      },
      permissions["CAREER_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await CareerService.delete(id);

    if (response.code === 0) {
      showToast(`Xóa ${tab === 'tab_one' ? 'nghề nghiệp' : 'ngành nghề'} thành công`, "success");
      getListCareerCustomer(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICareerResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? (tab === 'tab_one' ? 'nghề nghiêp ' : 'ngành nghề ') : `${listIdChecked.length} ${tab === 'tab_one' ? 'nghề nghiệp' : 'ngành nghề'} đã chọn`}
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
    permissions["CAREER_DELETE"] == 1 && {
      title: "Xóa nghề nghiệp khách hàng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-customer-career${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt khách hàng
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách nghề nghiệp khách hàng</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
      <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              {listTabs.map((item, idx) => (
                  <li
                    key={idx}
                    className={item.is_active == tab ? "active" : ""}
                    onClick={(e) => {
                      e && e.preventDefault();
                      setTab(item.is_active);
                    }}
                  >
                    {item.title}
                  </li>
              ))}
            </ul>
          </div>
          
          <SearchBox
            name={tab=== 'tab_one' ? "Tên nghề nghiệp" : "Tên ngành nghề"}
            params={params}
            // isSaveSearch={true}
            // listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
        </div>
        
        {!isLoading && listCareerCustomer && listCareerCustomer.length > 0 ? (
          <BoxTable
            name="Nghề nghiệp khách hàng"
            titles={tab === 'tab_one' ? titles : titlesCompany}
            items={listCareerCustomer}
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
                    Hiện tại chưa có nghề nghiệp khách hàng nào. <br />
                    Hãy thêm mới nghề nghiệp khách hàng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới nghề nghiệp khách hàng"
                action={() => {
                  setListCareerCustomer(null);
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
      <AddCustomerCareerModal
        onShow={showModalAdd}
        data={dataCareerCustomer}
        custType={tab === 'tab_one' ? '0' : '1'}
        onHide={(reload) => {
          if (reload) {
            getListCareerCustomer(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
