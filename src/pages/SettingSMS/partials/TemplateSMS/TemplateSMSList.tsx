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
import { ITemplateSMSListProps } from "model/templateSMS/PropsModel";
import { ITemplateSMSFilterRequest } from "model/templateSMS/TemplateSMSRequest";
import { ITemplateSMSResponse } from "model/templateSMS/TemplateSMSResponse";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import TemplateSMSService from "services/TemplateSMSService";
import AddTemplateSMSModal from "./partials/AddTemplateSMSModal";
import { getPageOffset, trimContent} from 'reborn-util';
import Tippy from "@tippyjs/react";

import "./TemplateSMSList.scss";

export default function TemplateSMSList(props: ITemplateSMSListProps) {
  document.title = "Khai báo mẫu tin nhắn SMS";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listTemplateSMS, setListTemplateSMS] = useState<ITemplateSMSResponse[]>([]);
  const [dataTemplateSMS, setDataTemplateSMS] = useState<ITemplateSMSResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<ITemplateSMSFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách mẫu tin SMS",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Mẫu tin SMS",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTemplateSMS = async (paramsSearch: ITemplateSMSFilterRequest) => {
    setIsLoading(true);

    const response = await TemplateSMSService.list(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setListTemplateSMS(result.items);

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
      getListTemplateSMS(params);
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
      permissions["TEMPLATE_SMS_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataTemplateSMS(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Brandname", "Nội dung", "Tên mẫu", "Chủ đề SMS"];

  const dataFormat = ["text-center", "", "", "", ""];

  const dataMappingArray = (item: ITemplateSMSResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.brandname,
    <Tippy key={item.id} content={item.content} delay={[120, 100]} placement="bottom" animation="scale">
      <p style={{ cursor: "pointer" }}>{trimContent(item.content, 120, true, true)}</p>
    </Tippy>,
     <Tippy key={item.id} content={item.title} delay={[120, 100]} placement="bottom" animation="scale">
      <p style={{ cursor: "pointer" }}>{trimContent(item.title, 120, true, true)}</p>
    </Tippy>,
    item.categoryName
  ];

  const actionsTable = (item: ITemplateSMSResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["TEMPLATE_SMS_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataTemplateSMS(item);
          setShowModalAdd(true);
          }
        },
      },
      permissions["TEMPLATE_SMS_DELETE"] == 1 && {
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
    const response = await TemplateSMSService.delete(id);

    if (response.code === 0) {
      showToast("Xóa mẫu tin nhắn SMS thành công", "success");
      getListTemplateSMS(params);
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
      const found = listTemplateSMS.find((item) => item.id === selectedId);
      if (found?.id) {
        return TemplateSMSService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} mẫu tin nhắn SMS`, "success");
        getListTemplateSMS(params);
        setListIdChecked([]);
      } else {
        showToast("Không có mẫu tin nhắn SMS nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: ITemplateSMSResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? " mẫu tin nhắn SMS" : `${listIdChecked.length} mẫu tin nhắn SMS đã chọn`}
          {item ? <strong>{item.title}</strong> : ""}? Thao tác này không thể khôi phục.
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
    permissions["TEMPLATE_SMS_DELETE"] == 1 && {
      title: "Xóa mẫu tin nhắn SMS",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page--template-sms${isNoItem ? " bg-white" : ""}`}>
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
          <h1 className="title-last">Khai báo mẫu tin nhắn SMS</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên mẫu"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listTemplateSMS && listTemplateSMS.length > 0 ? (
          <BoxTable
            name="Mẫu tin nhắn SMS"
            titles={titles}
            items={listTemplateSMS}
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
                    Hiện tại chưa có mẫu tin nhắn sms nào. <br />
                    Hãy thêm mới mẫu tin nhắn sms đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới mẫu tin nhắn SMS"
                action={() => {
                  setDataTemplateSMS(null);
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
      <AddTemplateSMSModal
        key={`templateSMS${dataTemplateSMS?.id || 0}`}
        onShow={showModalAdd}
        data={dataTemplateSMS}
        onHide={(reload) => {
          if (reload) {
            getListTemplateSMS(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
