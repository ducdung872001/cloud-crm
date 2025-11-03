import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Button from "components/button/button";
import Badge from "components/badge/badge";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { formatCurrency, showToast } from "utils/common";
import { getPageOffset } from "reborn-util";

import "./CxmOptionList.scss";
import AddSpaceModal from "./partials/AddCxmOption";
import SpaceService from "services/SpaceService";
import CxmOptionService from "services/CxmOptionService";

export default function CxmOptionList(props: any) {
  document.title = "Danh sách lựa chọn";

  const { onBackProps, setDataSpace, setShowModalAddSpace, reloadSpace, dataQuestionFloor, dataQuestion } = props;

  const isMounted = useRef(false);

  const [listSpace, setListSpace] = useState<any[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    unitNumber: "",
    limit: 10,
    questionId: dataQuestion?.id,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách lựa chọn",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Danh sách lựa chọn của câu hỏi - " + (dataQuestion ? ` ${dataQuestion.questionText}` : ""),
      is_active: "tab_one",
      type: 1,
    },
    // {
    //   title: "Sơ đồ phân cấp lựa chọn",
    //   is_active: "tab_two",
    //   type: 2,
    // },
  ];

  const [tab, setTab] = useState({
    name: "tab_one",
    type: 1,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "lựa chọn",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListSpace = async (paramsSearch: any) => {
    setIsLoading(true);
    const response = await CxmOptionService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListSpace(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params.name && +result.page === 1) {
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
      getListSpace(params);
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
  }, [params, reloadSpace]);

  const titles = [
    "STT",
    "Nội dung lựa chọn",
    "Câu hỏi tiếp theo",
    //  "Trạng thái"
  ];

  const dataFormat = [
    "text-center",
    "text-left",
    "text-left",
    //  "text-center"
  ];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.optionText,
    <a key={index}>Xem câu hỏi tiếp theo</a>,
  ];

  const handleChangeActive = async (item) => {
    const body = {
      id: item.id,
    };

    // let response = null;

    // if (item.status == 2) {
    //   response = await BeautySpaceService.activate(body);
    // } else {
    //   response = await BeautySpaceService.unActivate(body);
    // }

    // if (response.code === 0) {
    //   showToast(`Dự án ${item.status == 2 ? "ngừng hoạt động" : "hoạt động"} thành công`, "success");
    //   getListSpace(params);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmActiveSpace = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>{item.status == 2 ? "Đang hoạt động" : "Ngừng hoạt động"}...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn chuyển trạng thái {item.status == 2 ? "đang hoạt động" : "ngừng hoạt động"} cho
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleChangeActive(item);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actionsTable = (item: any): IAction[] => {
    return item.headquarter === 1
      ? [
          {
            title: item.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động",
            icon: <Icon name={item.status == 2 ? "Lock" : "Unlock"} />,
            callback: () => {
              showDialogConfirmActiveSpace(item);
            },
          },

          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataSpace(item);
              setShowModalAddSpace(true);
            },
          },
        ]
      : [
          // {
          //   title: item.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động",
          //   icon: <Icon name={item.status == 2 ? "Lock" : "Unlock"} />,
          //   callback: () => {
          //     showDialogConfirmActiveSpace(item);
          //   },
          // },
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataSpace(item);
              setShowModalAddSpace(true);
            },
          },
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
    const response = await CxmOptionService.delete(id);

    if (response.code === 0) {
      showToast("Xóa lựa chọn thành công", "success");
      getListSpace(params);
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
          Bạn có chắc chắn muốn xóa {item ? "lựa chọn " : `${listIdChecked.length} lựa chọn đã chọn`}
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
    {
      title: "Xóa lựa chọn",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const listFilter = useMemo(
    () =>
      [
        // {
        //   key: "steId",
        //   name: "Loại lựa chọn",
        //   type: "select",
        //   is_featured: true,
        // },
      ] as IFilterItem[],
    []
  );

  return (
    <div className={`page-content page-branch${isNoItem ? " bg-white" : ""}`}>
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
                    setIsLoading(true);
                    if (tab.type == 1) {
                      setParams({
                        unitNumber: "",
                        limit: 1000,
                      });
                    } else {
                      setParams({
                        unitNumber: "",
                        limit: 10,
                        // page: 1
                      });
                    }
                    setTab({ name: item.is_active, type: item.type });
                  }}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
          {/* {tab.type == 1 ?  */}
          <div className={tab.type == 1 ? "" : "d-none"}>
            <SearchBox
              name="Nội dung lựa chọn"
              params={params}
              // isSaveSearch={true}
              // listSaveSearch={listSaveSearch}
              isFilter={true}
              listFilterItem={listFilter}
              disabledTextInput={true}
              updateParams={(paramsNew) => setParams(paramsNew)}
            />
          </div>
          {/* : null} */}
        </div>
        {!isLoading && listSpace && listSpace.length > 0 ? (
          <BoxTable
            name="Lựa chọn"
            titles={titles}
            items={listSpace}
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
                    Hiện tại chưa có lựa chọn nào. <br />
                    Hãy thêm mới lựa chọn đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới lựa chọn"
                action={() => {
                  setDataSpace(null);
                  setShowModalAddSpace(true);
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
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
