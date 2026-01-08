import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import { useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { ITemplateEmailListProps } from "model/templateEmail/PropsModel";
import { ITemplateEmailFilterRequest } from "model/templateEmail/TemplateEmailRequestModel";
import { ITemplateEmailResponseModel } from "model/templateEmail/TemplateEmailResponseModel";
import { showToast } from "utils/common";
import { useWindowDimensions } from "utils/hookCustom";
import { trimContent, isDifferenceObj, getPageOffset } from "reborn-util";
import TemplateEmailService from "services/TemplateEmailService";
import AddTemplateEmailModal from "./partials/AddTemplateEmailModal";
import TableTemplateEmail from "./partials/TableTemplateEmail";

import "tippy.js/animations/scale.css";
import "./TemplateEmailList.scss";

export default function TemplateEmailList(props: ITemplateEmailListProps) {
  document.title = "Khai báo mẫu Email";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [listTemplateEmail, setListTemplateEmail] = useState<ITemplateEmailResponseModel[]>([]);
  const [dataTemplateEmail, setDataTemplateEmail] = useState<ITemplateEmailResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isAddEditTemplateEmail, setIsAddEditTemplateEmail] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState<ITemplateEmailFilterRequest>({
    title: "",
    limit: 10,
  });

  const { width } = useWindowDimensions();

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách mẫu Email",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "type",
        name: "Loại mẫu",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "1",
            label: "Mẫu email từ hệ thống",
          },
          {
            value: "2",
            label: "Mẫu email do người dùng tạo",
          },
        ],
        value: searchParams.get("type") ?? "",
      },
      {
        key: "tcyId",
        name: "Chủ đề",
        type: "select",
        is_featured: true,
        value: searchParams.get("tcyId") ?? "",
      },
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Mẫu Email",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTemplateEmail = async (paramsSearch: ITemplateEmailFilterRequest) => {
    setIsLoading(true);

    const response = await TemplateEmailService.list(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setListTemplateEmail(result?.items);
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
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListTemplateEmail(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as unknown as Record<string, string | string[]>);
      }
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      ...(isAddEditTemplateEmail
        ? [
            {
              title: "Quay lại",
              callback: () => {
                setIsAddEditTemplateEmail(false);
              },
            },
          ]
        : [
            {
              title: "Thêm mới",
              callback: () => {
                setDataTemplateEmail(null);
                setIsAddEditTemplateEmail(!isAddEditTemplateEmail);
              },
            },
          ]),
    ],
  };

  const titles = ["STT", "Tiêu đề tin", "Nội dung"];

  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: ITemplateEmailResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.title,
    <Tippy key={item.id} content={item.content} delay={[120, 100]} placement="bottom" animation="scale">
      <p style={{ cursor: "pointer" }}>{trimContent(item.content, 120, true, true)}</p>
    </Tippy>,
  ];

  const actionsTable = (item: ITemplateEmailResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setDataTemplateEmail(item);
            setIsAddEditTemplateEmail(true);
          }
        },
      },
      {
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
    const response = await TemplateEmailService.delete(id);

    if (response.code === 0) {
      showToast("Xóa mẫu email thành công", "success");
      getListTemplateEmail(params);
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
      const found = listTemplateEmail.find((item) => item.id === selectedId);
      if (found?.id) {
        return TemplateEmailService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
      .then((results) => {
        const checkbox = results.filter(Boolean)?.length || 0;
        if (checkbox > 0) {
          showToast(`Xóa thành công ${checkbox} mẫu email`, "success");
          getListTemplateEmail(params);
          setListIdChecked([]);
        } else {
          showToast("Không có mẫu email nào được xóa", "error");
        }
      })
      .finally(() => {
        setShowDialog(false);
        setContentDialog(null);
      });
  };

  const showDialogConfirmDelete = (item?: ITemplateEmailResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? " mẫu email " : `${listIdChecked.length} mẫu email đã chọn`}
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
        if (listIdChecked.length > 0) {
          onDeleteAll();
          return;
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa mẫu email",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page--template-email${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className={`title-first ${isAddEditTemplateEmail && width <= 768 ? "d-none" : ""}`}
            title="Quay lại"
          >
            Cài đặt Email
          </h1>
          <Icon
            name="ChevronRight"
            className={`${isAddEditTemplateEmail && width <= 768 ? "d-none" : ""}`}
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1
            title={`${isAddEditTemplateEmail ? "Quay lại" : ""}`}
            className={`title-last ${isAddEditTemplateEmail ? "active" : ""}`}
            onClick={() => {
              setIsAddEditTemplateEmail(false);
            }}
          >
            Khai báo mẫu email
          </h1>
          {isAddEditTemplateEmail && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setIsAddEditTemplateEmail(false);
                }}
              />
              <h1 className="title-last">{dataTemplateEmail ? "Chỉnh sửa" : "Thêm mới"} mẫu email</h1>
            </Fragment>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        {isAddEditTemplateEmail ? (
          <AddTemplateEmailModal
            key={`templateEmail${dataTemplateEmail?.id || 0}`}
            onShow={isAddEditTemplateEmail}
            data={dataTemplateEmail}
            onHide={(reload) => {
              if (reload) {
                getListTemplateEmail(params);
              }
              setIsAddEditTemplateEmail(false);
            }}
          />
        ) : (
          <TableTemplateEmail
            params={params}
            setParams={setParams}
            listSaveSearch={listSaveSearch}
            pagination={pagination}
            titles={titles}
            listTemplateEmail={listTemplateEmail}
            isLoading={isLoading}
            isNoItem={isNoItem}
            listIdChecked={listIdChecked}
            setListIdChecked={setListIdChecked}
            bulkActionItems={bulkActionList}
            dataFormat={dataFormat}
            dataMappingArray={dataMappingArray}
            listFilterItem={customerFilterList}
            actionsTable={actionsTable}
            isPermissions={isPermissions}
            setDataTemplateEmail={setDataTemplateEmail}
          />
        )}
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
