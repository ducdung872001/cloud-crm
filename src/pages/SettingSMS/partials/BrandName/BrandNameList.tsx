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
import { IBrandNameListProps } from "model/brandName/PropsModel";
import { IBrandNameFilterRequest } from "model/brandName/BrandNameRequestModel";
import { IBrandNameResponseModel } from "model/brandName/BrandNameResponseModel";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import BrandNameService from "services/BrandNameService";
import AddBrandNameModel from "./partials/AddBrandNameModel";
import { getPageOffset } from 'reborn-util';

import "./BrandName.scss";
import ModalAddWhiteList from "./ModalAddWhiteList/ModalAddWhiteList";
import Badge from "components/badge/badge";

export default function BrandNameList(props: IBrandNameListProps) {
  document.title = "Khai báo Brandname";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listBrandName, setListBrandName] = useState<IBrandNameFilterRequest[]>([]);
  const [dataBrandName, setDataBrandName] = useState<IBrandNameResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [modalWhiteList, setModalWhiteList] = useState(false);
  const [showDialogPause, setShowDialogPause] = useState<boolean>(false);
  const [contentDialogPause, setContentDialogPause] = useState<any>(null);
  const [showDialogApprove, setShowDialogApprove] = useState<boolean>(false);
  const [contentDialogApprove, setContentDialogApprove] = useState<any>(null);
  const [params, setParams] = useState<IBrandNameFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách BrandName",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "BrandName",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListBrandName = async (paramsSearch: IBrandNameFilterRequest) => {
    setIsLoading(true);

    const response = await BrandNameService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListBrandName(result);

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
      getListBrandName(params);
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
      permissions["BRANDNAME_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataBrandName(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên Brandname", "Ngày hết hạn đăng ký", "Đối tác gửi SMS", "Danh sách WhiteList", "Trạng thái WhiteList"];

  const dataFormat = ["text-center", "", "text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item: IBrandNameResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.expiredDate ? moment(item.expiredDate).format("DD/MM/YYYY") : "",
    item.partnerName,
    !item.whitelist ? 
    <span 
      style={{fontSize: 14, color: 'var(--extra-color-30)', cursor:'pointer'}}
      onClick={() => {
        showToast("Vui lòng kích hoạt WhiteList", "warning");
      }}
    >Chi tiết</span>
    :
    <a
      key={item.id}
      onClick={(e) => {
        if(item.whitelist){
          e && e.preventDefault();
          setModalWhiteList(true);
          setDataBrandName(item);
        } else {
          showToast("Vui lòng kích hoạt WhiteList", "warning");
        }
        
      }}
    >
      Chi tiết
    </a>,
    <Badge key={index} variant={item.whitelist?.isUat === true ? "success" : item.whitelist?.isUat === false ? 'warning' : "secondary"  } text={item.whitelist?.isUat === true ? "Đã kích hoạt" : item.whitelist?.isUat === false ? "Ngừng kích hoạt" : 'Chưa kích hoạt'} />,
  ];

  const actionsTable = (item: IBrandNameResponseModel): IAction[] => {
    return [
      ...(!item.whitelist?.isUat
      ? [
          {
            title: "Kích hoạt WhiteList",
            icon: <Icon 
                      name="FingerTouch" 
                      className="icon-warning" 
                    />,
            callback: () => {
              showDialogConfirmApprove(item, true);
              
            },
          },
        ]
      : [
        {
          title: "Tạm dừng WhiteList",
          icon: <Icon name="Pause"/>,
          callback: () => {
              showDialogConfirmPause(item, false)
          },
        },
      ]),
      permissions["BRANDNAME_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataBrandName(item);
          setShowModalAdd(true);
        },
      },
      permissions["BRANDNAME_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await BrandNameService.delete(id);

    if (response.code === 0) {
      showToast("Xóa BrandName thành công", "success");
      getListBrandName(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IBrandNameResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "Brandname " : `${listIdChecked.length} Brandname đã chọn`}
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
    permissions["BRANDNAME_DELETE"] == 1 && {
      title: "Xóa BrandName",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const onApprove = async (item, status) => {
    const param = {
      id: item.whitelist?.id || null,
      type: 'sms',
      brandname: item.name,
      isUat: status,
    };
    const response = await BrandNameService.changeStatusWhiteList(param);

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
      
      getListBrandName(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmPause = (item?: any, status?: boolean) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Tạm dừng...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn dừng kích hoạt WhiteList {item ? <strong>{item.phone}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogPause(false);
        setContentDialogPause(null);
      },
      defaultText: "Tạm dừng",
      defaultAction: () => {
        onApprove(item, status)
      },
    };
    setContentDialogPause(contentDialog);
    setShowDialogPause(true);
  };

  const showDialogConfirmApprove = (item?: any, status?: boolean) => {
    const contentDialog: IContentDialog = {
      color: "success",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Kích hoạt...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn kích hoạt WhiteList {item ? <strong>{item.phone}</strong> : ""}?
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      },
      defaultText: "Kích hoạt",
      defaultAction: () => {
        onApprove(item, status)
      },
    };
    setContentDialogApprove(contentDialog);
    setShowDialogApprove(true);
  };

  return (
    <div className="page-content page-brandname-SMS">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt SMS
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Khai báo Brandname</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên Brandname"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listBrandName && listBrandName.length > 0 ? (
          <BoxTable
            name="BrandName"
            titles={titles}
            items={listBrandName}
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
                    Hiện tại chưa có BrandName nào. <br />
                    Hãy thêm mới BrandName đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới BrandName"
                action={() => {
                  setDataBrandName(null);
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
      <AddBrandNameModel
        onShow={showModalAdd}
        data={dataBrandName}
        onHide={(reload) => {
          if (reload) {
            getListBrandName(params);
          }
          setShowModalAdd(false);
        }}
      />
      <ModalAddWhiteList
          onShow={modalWhiteList}
          data={dataBrandName}
          onHide={(reload) => {
              if (reload) {
              }
              setModalWhiteList(false);
          }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDialogPause} isOpen={showDialogPause} />
      <Dialog content={contentDialogApprove} isOpen={showDialogApprove} />
    </div>
  );
}
