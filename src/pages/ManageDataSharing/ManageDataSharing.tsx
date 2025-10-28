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
import { IProductListProps } from "model/product/PropsModel";
import { IProductFilterRequest } from "model/product/ProductRequestModel";
import { IProductResponse } from "model/product/ProductResponseModel";
import { showToast } from "utils/common";
import { formatCurrency, getPageOffset } from "reborn-util";
import ProductService from "services/ProductService";
import { getPermissions } from "utils/common";
import "./ManageDataSharing.scss";
import CustomerCharacteristics from "pages/Common/CustomerCharacteristics";
import Badge from "components/badge/badge";
import PermissionService from "services/PermissionService";
import AddPermissionModal from "./partials/AddPermissionModal";
import ApproveModal from "./ApproveModal/ApproveModal";
import NoteModal from "./NoteModal/NoteModal";

export default function ManageDataSharing(props: any) {
  document.title = "Cài đặt chia sẻ dữ liệu";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listPermission, setListPermission] = useState<IProductResponse[]>([]);
  const [idPermission, setIdPermission] = useState<number>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAddPermission, setShowModalAddPermission] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [showDialogApprove, setShowDialogApprove] = useState<boolean>(false);
  const [contentDialogApprove, setContentDialogApprove] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [tab, setTab] = useState('tab_one')
  const [isApproveModal, setIsApproveModal] = useState(false);
  const [isRejectModal, setIsRejectModal] = useState(false);
  const [isCancelModal, setIsCancelModal] = useState(false);
  const [isNoteModal, setIsNoteModal] = useState(false);
  const [dataPermission, setDataPermission] = useState(null)
  const [params, setParams] = useState<IProductFilterRequest>({
    name: "",
    limit: 10,
    page: 1
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách sản phẩm",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Xin quyền truy cập",
      is_active: "tab_one",
    },
    {
      title: "Cấp quyền truy cập",
      is_active: "tab_two",
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "yêu cầu",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListPermission = async (paramsSearch: any, tab) => {
    setIsLoading(true);

    let response = null;

    if(tab === 'tab_one'){
        response = await PermissionService.requestPermissionSource(paramsSearch);
    } else {
        response = await PermissionService.requestPermissionTarget(paramsSearch);
    }


    if (response?.code === 0) {
      const result = response.result;
      setListPermission(result.items);

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
        getListPermission(params, tab);
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
  }, [params, tab]);

  const titleActions: ITitleActions = {
    actions: [
        ...(tab === 'tab_one' ? [
            {
                title: "Thêm yêu cầu xin quyền truy cập",
                callback: () => {
                  setIdPermission(null);
                  setShowModalAddPermission(true);
                },
              },
        ] : []),
    ],
  };

  const titles = ["STT", "Mã đối tác", "Tên đối tác", "Dữ liệu cần chia sẻ", "Ghi chú", "Trạng thái"];
  const titlesTab2 = ["STT", "Tên đối tác", "Dữ liệu cần chia sẻ", "Ghi chú", "Trạng thái"];

  const dataFormat = ["text-center", "", "", "", "t", "text-center"];
  const dataFormatTab2 = ["text-center", "", "", "t", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    ...(tab === 'tab_one' ? [item.targetBranchCode] : [] ),
    tab === 'tab_one' ? item.targetBranchName : item.sourceBeautyName,
    item.requestCode === 'product' ? 'Sản phẩm' : item.requestCode === 'service' ? 'Dịch vụ' : 'Khách hàng' ,
    item.sourceNote,
    <Badge
        key={index}
        variant={item.status === 1 ? "success" : item.status === 0 ? "warning" : "error"}
        text={item.status === 1 ? "Đã phê duyệt" : item.status === 0 ? "Chưa phê duyệt" : "Từ chối duyệt"}
    />,
    // <Badge
    //     key={index}
    //     variant={"success"}
    //     text={"Đã phê duyệt"}
    // />,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      
    //   permissions["PRODUCT_UPDATE"] == 1 && {
    //     title: "Sửa",
    //     icon: <Icon name="Pencil" />,
    //     callback: () => {
    //       setIdProduct(item.id);
    //       setShowModalAdd(true);
    //     },
    //   },
      ...(item.targetNote ? 
        [
          {
            title: item.status === 2 ? "Lý do từ chối duyệt" : "Ghi chú phê duyệt",
            icon: <Icon 
                      name="Note" 
                      // className="icon-success" 
                      // style={ item.isSetup ? {} : { fill: 'var(--extra-color-30)' }} 
                    />,
            callback: () => {
              setIsNoteModal(true);
              setDataPermission(item);
            },
          },
        ]
      : []
      ),
      ...(tab === 'tab_two' ? 
        [
          ...(item.status !== 1  ? [
            {
              title: "Phê duyệt",
              icon: <Icon 
                        name="FingerTouch" 
                        className="icon-success" 
                        // style={ item.isSetup ? {} : { fill: 'var(--extra-color-30)' }} 
                      />,
              callback: () => {
                setIsApproveModal(true);
                setDataPermission(item);
              },
            },
          ] : []),
          
          ...(item.status !== 2 ? [
            {
              title: item.status === 1 ? "Huỷ phê duyệt" : "Từ chối",
              icon: <Icon 
                        name="Reject" 
                        className="icon-warning" 
                        style={{width: 16, height: 16, fill: 'red' }} 
                      />,
              callback: () => {
                if(item.status === 1){
                  setIsCancelModal(true);
                } else {  
                  setIsRejectModal(true);
                }
                setDataPermission(item);
              },
            },
          ] : []),
        ]
       : []
      ),

      ...(tab === 'tab_one' && item.status === 0 ? [
        {
          title: "Xóa",
          icon: <Icon name="Trash" className="icon-error" />,
          callback: () => {
            showDialogConfirmDelete(item);
          },
        },
      ] : []),
      
    ];
  };

  const onDelete = async (id: number) => {
    const response = await PermissionService.deleteRequestPermission(id);

    if (response.code === 0) {
      showToast("Xóa yêu cầu thành công", "success");
      getListPermission(params, tab);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IProductResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "yêu cầu " : `${listIdChecked.length} yêu cầu đã chọn`}
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

  const showDialogConfirmApprove = (item?: any, status?: number) => {
    const contentDialog: IContentDialog = {
      color: "success",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Phê duyệt...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn phê duyệt {item ? "chương trình " : `${listIdChecked.length} chương trình đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}?
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      },
      defaultText: "Phê duyệt",
      defaultAction: () => {
        // onApprove(item.id, status)
      },
    };
    setContentDialogApprove(contentDialog);
    setShowDialogApprove(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa yêu cầu",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-manage-data-sharing${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            // onClick={() => {
            //   onBackProps(true);
            // }}
            // className="title-first"
            // title="Quay lại"
          >
            Cài đặt chia sẻ dữ liệu
          </h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column" style={tab === 'tab_one' ? {} : {marginTop:'3.2rem'}}>
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
          {/* <div className={tab == 'tab_one' ? "" : "d-none"}>
            <SearchBox
              name="Tên sản phẩm"
              params={params}
              // isSaveSearch={true}
              // listSaveSearch={listSaveSearch}
              updateParams={(paramsNew) => setParams(paramsNew)}
            />
          </div> */}
        </div>
        {!isLoading && listPermission && listPermission.length > 0 ? (
          <BoxTable
            name="Yêu cầu"
            titles={tab === 'tab_one' ? titles : titlesTab2}
            items={listPermission}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={tab === 'tab_one' ? dataFormat : dataFormatTab2}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            listIdChecked={listIdChecked}
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
                    Hiện tại chưa có yêu cầu {tab === 'tab_one' ? 'xin' : 'cấp'} quyền phê duyệt nào. <br />
                    {tab === 'tab_one' ? 'Hãy thêm mới yêu cầu đầu tiên nhé!' : ''}
                  </span>
                }
                type="no-item"
                titleButton={tab === 'tab_one' ? "Thêm yêu cầu xin quyền phê duyệt" : ''}
                action={() => {
                    if(tab === 'tab_one'){
                        setIdPermission(null);
                        setShowModalAddPermission(true);
                    }
                    
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

      <AddPermissionModal
        onShow={showModalAddPermission}
        data={null}
        onHide={(reload) => {
          if (reload) {
            getListPermission(params, tab);
          }
          setShowModalAddPermission(false);
        }}
      />

      <ApproveModal
        onShow={isApproveModal || isRejectModal || isCancelModal}
        data={dataPermission}
        type = {isApproveModal ? 'approve' : isRejectModal ? 'reject' : 'cancel'}
        onHide={(reload) => {
          if (reload) {
            getListPermission(params, tab);
          }
          setIsApproveModal(false);
          setIsRejectModal(false);
          setIsCancelModal(false);
          setDataPermission(null);
        }}
      />

      <NoteModal
        onShow={isNoteModal}
        data={dataPermission}
        onHide={(reload) => {
          // if (reload) {
          //   getListPermission(params, tab);
          // }
          setIsNoteModal(false);
          setDataPermission(null);
        }}
      />
     
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
