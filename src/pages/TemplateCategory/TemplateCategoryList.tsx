import React, { Fragment, useState, useEffect, useRef } from "react";
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
import AddTemplateCategory from "./partials/AddTemplateCategory";
import { getPageOffset } from "reborn-util";

import "./TemplateCategoryList.scss";
import _ from "lodash";

export default function TemplateCategoryList(props: ITemplateCategoryListProps) {
  const { titleProps, nameProps, typeProps, onBackProps } = props;

  const name = typeProps === "1" ? "SMS" : "Email";

  document.title = `Chủ đề ${name}`;
  const isMounted = useRef(false);

  const [listTemplateCategory, setListTemplateCategory] = useState<ITemplateCategoryResponseModel[]>([]);
  const [dataTemplateCategory, setDataTemplateCategory] = useState<ITemplateCategoryResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState<ITemplateCategoryFilterRequest>({
    name: "",
    limit: 10,
  });
  const [permissions, setPermissions] = useState(getPermissions());

  const titleItems: IMenuTab[] = [
    {
      title: `Danh sách chủ đề ${name}`,
      is_active: "tab_one",
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: `chủ đề ${name}`,
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListTemplateCategory(params);
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

  const getListTemplateCategory = async (paramsSearch) => {
    setIsLoading(true);

    const response = await TemplateCategoryService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListTemplateCategory(result?.items ? result.items : result ?? []);

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
    getListTemplateCategory(params);
  }, []);

  const titleActions: ITitleActions = {
    actions: [
      permissions["TEMPLATE_CATEGORY_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setShowModalAdd(true);
          setDataTemplateCategory(null);
        },
      },
    ],
  };

  const titles = ["STT", "Tên chủ đề", "Thứ tự"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: ITemplateCategoryResponseModel, index: number) => [getPageOffset(params) + index + 1, item.name, item.position];

  const actionsTable = (item: ITemplateCategoryResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["TEMPLATE_CATEGORY_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setShowModalAdd(true);
            setDataTemplateCategory(item);
          }
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
      showToast(`Xóa chủ đề ${name} thành công`, "success");
      getListTemplateCategory(params);
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
      const found = listTemplateCategory.find((item) => item.id === selectedId);
      if (found?.id) {
        return TemplateCategoryService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
      .then((results) => {
        const checkbox = results.filter(Boolean)?.length || 0;
        if (checkbox > 0) {
          showToast(`Xóa thành công ${checkbox} chủ đề SMS`, "success");
          getListTemplateCategory(params);
          setListIdChecked([]);
        } else {
          showToast("Không có chủ đề SMS nào được xóa", "error");
        }
      })
      .finally(() => {
        setShowDialog(false);
        setContentDialog(null);
      });
  };

  const showDialogConfirmDelete = (item?: ITemplateCategoryResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? `chủ đề ${name}` : `${listIdChecked.length} chủ đề ${name} đã chọn`}
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
    permissions["TEMPLATE_CATEGORY_DELETE"] == 1 && {
      title: `Xóa chủ đề ${name}`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-topic${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            {titleProps}
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">{nameProps}</h1>
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
        {!isLoading && listTemplateCategory && listTemplateCategory.length > 0 ? (
          <BoxTable
            name={`Chủ đề ${name}`}
            titles={titles}
            items={listTemplateCategory}
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
              setDataTemplateCategory(null);
              setShowModalAdd(true);
            }}
          />
        )}
      </div>
      <AddTemplateCategory
        onShow={showModalAdd}
        nameChange={name}
        data={dataTemplateCategory}
        onHide={(reload) => {
          if (reload) {
            getListTemplateCategory(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
