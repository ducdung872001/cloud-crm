import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
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
import { IDeclareEmailListProps } from "model/declareEmail/PropsModel";
import { IDeclareEmailFilterRequest } from "model/declareEmail/DeclareEmailRequestModel";
import { IDeclareEmailResponseModel } from "model/declareEmail/DeclareEmailResponseModel";
import { showToast } from "utils/common";
import EmailConfigService from "services/EmailConfigService";
import AddEmailConfigModal from "./partials/AddDeclareEmailModal";
import { getPageOffset } from 'reborn-util';

import "./DeclareEmailList.scss";
import { useNavigate } from "react-router-dom";
import ModalCheckEmail from "./ModalCheckEmail/ModalCheckEmail";

export default function DeclareEmailList(props: IDeclareEmailListProps) {
  document.title = "Khai báo nguồn gửi Email";

  const { onBackProps } = props;

  const isMounted = useRef(false);
  const navigate = useNavigate();

  const [listEmailConfig, setListEmailConfig] = useState<IDeclareEmailResponseModel[]>([]);
  const [dataEmailConfig, setDataEmailConfig] = useState<IDeclareEmailResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isCheckEmail, setIsCheckEmail] = useState<boolean>(false);
  const [params, setParams] = useState<IDeclareEmailFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách nguồn gửi Email",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nguồn gửi Email",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListEmailConfig = async (paramsSearch: IDeclareEmailFilterRequest) => {
    setIsLoading(true);

    const response = await EmailConfigService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListEmailConfig(result);

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
      getListEmailConfig(params);
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
          setDataEmailConfig(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Email", "Tên người gửi", "Đối tác"];

  const dataFormat = ["text-center", "", "", ""];

  const dataMappingArray = (item: IDeclareEmailResponseModel, index: number) => [
    getPageOffset(params) + index + 1, 
    item.email, 
    item.name, 
    item.partnerName
  ];

  const actionsTable = (item: IDeclareEmailResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return [
      {
        title: "Kiểm tra Email",
        icon: <Icon name="Test" style={{width: 20, height: 20}}/>,
        callback: () => {
          setIsCheckEmail(true);
          setDataEmailConfig(item)
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataEmailConfig(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"}/>,
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
    const response = await EmailConfigService.delete(id);

    if (response.code === 0) {
      showToast("Xóa nguồn gửi email thành công", "success");
      getListEmailConfig(params);
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
      const found = listEmailConfig.find((item) => item.id === selectedId);
      if (found?.id) {
        return EmailConfigService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} nguồn gửi email`, "success");
        getListEmailConfig(params);
        setListIdChecked([]);
      } else {
        showToast("Không có nguồn gửi email nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IDeclareEmailResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "nguồn gửi email " : `${listIdChecked.length} nguồn gửi email đã chọn`}
          {item ? <strong>{item.email}</strong> : ""}? Thao tác này không thể khôi phục.
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
    {
      title: "Xóa nguồn gửi email",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="page-content page-email-config">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
              navigate(`/setting_email`)
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt Email
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
              navigate(`/setting_email`)
            }}
          />
          <h1 className="title-last">Khai báo nguồn gửi Email</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Email"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listEmailConfig && listEmailConfig.length > 0 ? (
          <BoxTable
            name="Nguồn gửi email"
            titles={titles}
            items={listEmailConfig}
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
                    Hiện tại chưa khai báo email nguồn nào. <br />
                    Hãy khai báo email nguồn đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới nguồn gửi email"
                action={() => {
                  setDataEmailConfig(null);
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
      <AddEmailConfigModal
        onShow={showModalAdd}
        data={dataEmailConfig}
        onHide={(reload) => {
          if (reload) {
            getListEmailConfig(params);
          }
          setShowModalAdd(false);
        }}
      />
      <ModalCheckEmail
        onShow={isCheckEmail}
        data={dataEmailConfig}
        onHide={(reload) => {
          if (reload) {
            getListEmailConfig(params);
          }
          setIsCheckEmail(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
