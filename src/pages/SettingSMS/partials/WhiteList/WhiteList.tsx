import React, { Fragment, useState, useEffect } from "react";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IAction, IMenuTab } from "model/OtherModel";
import { showToast } from "utils/common";
import TemplateCategoryService from "services/TemplateCategoryService";
import { ITemplateCategoryFilterRequest } from "model/templateCategory/TemplateCategoryRequest";
import { ITemplateCategoryResponseModel } from "model/templateCategory/TemplateCategoryResponst";
import { ITemplateCategoryListProps } from "model/templateCategory/PropsModel";
import { getPermissions } from "utils/common";
// import AddTemplateCategory from "./partials/AddTemplateCategory";
import { getPageOffset } from 'reborn-util';

import "./WhiteList.scss";
import ModalAddPhone from "./partials/ModalAddPhone";
import Badge from "components/badge/badge";

export default function WhiteList(props: any) {
  const { titleProps, nameProps, onBackProps } = props;

  document.title = `Danh sách WhiteList`;

  const [listPhoneNumber, setListPhoneNumber] = useState([]);
  const [dataWhiteList, setDataWhiteList] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [showDialogPause, setShowDialogPause] = useState<boolean>(false);
  const [contentDialogPause, setContentDialogPause] = useState<any>(null);
  const [showDialogApprove, setShowDialogApprove] = useState<boolean>(false);
  const [contentDialogApprove, setContentDialogApprove] = useState<any>(null);
  const [params, setParams] = useState<ITemplateCategoryFilterRequest>({
    name: "",
  });
  const [permissions, setPermissions] = useState(getPermissions());

  const titleItems: IMenuTab[] = [
    {
      title: `Danh sách WhiteList`,
      is_active: "tab_one",
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: `số điện thoại ${name}`,
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListPhoneNumber = async () => {
    setIsLoading(true);

    // const response = await TemplateCategoryService.list();

    // if (response.code === 0) {
    //   const result = response.result;
    //   setListPhoneNumber(result);

    //   setPagination({
    //     ...pagination,
    //     page: +result.page,
    //     sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
    //     totalItem: +result.total,
    //     totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
    //   });

    //   if (+result.total === 0 && +result.page === 1) {
    //     setIsNoItem(true);
    //   }
    // } else if (response.code == 400) {
    //   setIsPermissions(true);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }
    setListPhoneNumber([
        {
            phone:'0963829333',
            // status: 1
        },
        {
            phone:'0973090393',
            // status: 0
        }
    ])
    setIsLoading(false);
  };

  useEffect(() => {
    getListPhoneNumber();
  }, []);

  const titleActions: ITitleActions = {
    actions: [
       {
        title: "Thêm mới",
        callback: () => {
          setShowModalAdd(true);
          setDataWhiteList(null);
        },
      },
    ],
  };

  const titles = ["STT", "Số điện thoại"];

  const dataFormat = ["text-center", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.phone,
    // <Badge key={index} variant={item.status === 1 ? "success" : "secondary"} text={item.status === 1 ? "Đã kích hoạt" : "Chưa kích hoạt"} />,

  ];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return [

        // ...(item.status !== 1
        //     ? [
        //         {
        //           title: "Kích hoạt",
        //           icon: <Icon 
        //                     name="FingerTouch" 
        //                     className="icon-warning" 
        //                   />,
        //           callback: () => {
        //             showDialogConfirmApprove(item, 1);
        //           },
        //         },
        //       ]
        //     : [
        //       {
        //         title: "Tạm dừng",
        //         icon: <Icon name="Pause"/>,
        //         callback: () => {
        //             showDialogConfirmPause(item, 2)
        //         },
        //       },
        //     ]),
        
        {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
                setShowModalAdd(true);
                setDataWhiteList(item);
            },
        },
        permissions["TEMPLATE_CATEGORY_DELETE"] == 1 && {
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
    const response = await TemplateCategoryService.delete(id);

    if (response.code === 0) {
      showToast(`Xóa số điện thoại thành công`, "success");
      getListPhoneNumber();
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
      const found = listPhoneNumber.find((item) => item.id === selectedId);
      if (found?.id) {
        return TemplateCategoryService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} whitelist`, "success");
        getListPhoneNumber();
        setListIdChecked([]);
      } else {
        showToast("Không có whitelist nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: ITemplateCategoryResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? `số điện thoại ` : `${listIdChecked.length} số điện thoại đã chọn`}
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

  const showDialogConfirmPause = (item?: any, status?: number) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Tạm dừng...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn dừng kích hoạt số điện thoại {item ? <strong>{item.phone}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogPause(false);
        setContentDialogPause(null);
      },
      defaultText: "Tạm dừng",
      defaultAction: () => {
        // onApprove(item.id, status)
      },
    };
    setContentDialogPause(contentDialog);
    setShowDialogPause(true);
  };

  const showDialogConfirmApprove = (item?: any, status?: number) => {
    const contentDialog: IContentDialog = {
      color: "success",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Kích hoạt...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn kích hoạt số điện thoại {item ? <strong>{item.phone}</strong> : ""}?
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      },
      defaultText: "Kích hoạt",
      defaultAction: () => {
        // onApprove(item.id, status)
      },
    };
    setContentDialogApprove(contentDialog);
    setShowDialogApprove(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: `Số điện thoại`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-WhiteList${isNoItem ? " bg-white" : ""}`}>
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
          <h1 className="title-last">Danh sách WhiteList</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <ul className="action__option--title">
          {titleItems.map((item, idx) => {
            return (
              <li key={idx} className="active">
                {item.title}
              </li>
            );
          })}
        </ul>
        {!isLoading && listPhoneNumber && listPhoneNumber.length > 0 ? (
          <BoxTable
            name={`Số điện thoại`}
            titles={titles}
            items={listPhoneNumber}
            isPagination={true}
            dataPagination={pagination}
            dataFormat={dataFormat}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
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
        ) : isPermissions ? (
          <SystemNotification type="no-permission" />
        ) : (
          <SystemNotification
            description={
              <span>
                Hiện tại chưa có chủ đề {name} nào. <br />
                Hãy thêm mới chủ đề {name} nhé!
              </span>
            }
            type="no-item"
            titleButton={`Thêm mới chủ đề ${name}`}
            action={() => {
              setDataWhiteList(null);
              setShowModalAdd(true);
            }}
          />
        )}
      </div>
      <ModalAddPhone
        onShow={showModalAdd}
        data={dataWhiteList}
        onHide={(reload) => {
          if (reload) {
            getListPhoneNumber();
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDialogPause} isOpen={showDialogPause} />
      <Dialog content={contentDialogApprove} isOpen={showDialogApprove} />
    </div>
  );
}
