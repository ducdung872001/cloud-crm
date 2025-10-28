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
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import { getPageOffset } from 'reborn-util';
import "./CategoryProject.scss";
import CategoryProjectService from "services/CategoryProjectService";
import AddCategoryProjectModal from "./partials/AddCategoryProjectModal";

export default function CategoryProject(props: any) {
  document.title = "Danh mục dịch vụ";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listCategoryProject, setListCategoryProject] = useState([]);
  const [dataCategoryProject, setDataCategoryProject] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(true);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState({
    name: "",
    limit: 100,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục dự án",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh mục dự án",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCategoryProject = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await CategoryProjectService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCategoryProject(result);

      // setPagination({
      //   ...pagination,
      //   page: +result.page,
      //   sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
      //   totalItem: +result.total,
      //   totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      // });
      // if (+result.total === 0 && !params?.keyword && +result.page === 1) {
      //   setIsNoItem(true);
      // }
    } 
    // else if (response.code == 400) {
    //   setIsPermissions(true);
    // } 
    else {
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
      getListCategoryProject(params);
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
    //   permissions["CATEGORY_PROJECT_ADD"] == 1 && 
      {
        title: "Thêm mới",
        callback: () => {
          setDataCategoryProject(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên danh mục"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    // item.position,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
    //   permissions["CATEGORY_PROJECT_UPDATE"] == 1 && 
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataCategoryProject(item);
          setShowModalAdd(true);
        },
      },
    //   permissions["CATEGORY_PROJECT_DELETE"] == 1 && 
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await CategoryProjectService.delete(id);

    if (response.code === 0) {
      showToast("Xóa danh mục dự án thành công", "success");
      getListCategoryProject(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "danh mục dự án " : `${listIdChecked.length} danh mục dự án đã chọn`}
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
    permissions["CATEGORY_PROJECT_DELETE"] == 1 && {
      title: "Xóa danh mục dự án",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-category-project${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt dự án
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh mục dự án</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên danh mục dự án"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listCategoryProject && listCategoryProject.length > 0 ? (
          <BoxTable
            name="Danh mục dự án"
            titles={titles}
            items={listCategoryProject}
            isPagination={false}
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
                    Hiện tại chưa có danh mục dự án nào. <br />
                    Hãy thêm mới danh mục dự án đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới danh mục dịch vụ"
                action={() => {
                  setDataCategoryProject(null);
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
      <AddCategoryProjectModal
        onShow={showModalAdd}
        data={dataCategoryProject}
        onHide={(reload) => {
          if (reload) {
            getListCategoryProject(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
