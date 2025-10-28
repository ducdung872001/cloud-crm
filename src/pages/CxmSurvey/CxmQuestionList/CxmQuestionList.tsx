import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";

import "./CxmQuestionList.scss";
import CxmQuestionService from "services/CxmQuestionService";

export default function CxmQuestionList(props: any) {
  document.title = "Danh sách câu hỏi";

  const { setDataCxmQuestion, setShowModalAddCxmQuestion, isReloadCxmQuestion, dataSurvey, setStepQuestion, listNav, setListNav } = props;

  const isMounted = useRef(false);

  const [listCxmQuestion, setListCxmQuestion] = useState<any[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
    surveyId: dataSurvey.id,
  });

  useEffect(() => {
    getListCxmQuestion(params);
  }, [isReloadCxmQuestion]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách câu hỏi",
      is_active: true,
    },
  ]);

  const listTabs = [
    {
      title: "Danh sách câu hỏi của chiến dịch" + (dataSurvey ? ` ${dataSurvey.title}` : ""),
      is_active: "tab_one",
      type: 1,
    },
    // {
    //   title: "Sơ đồ phân cấp câu hỏi",
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
    name: "câu hỏi",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListCxmQuestion = async (paramsSearch: any) => {
    setIsLoading(true);

    const _params = {
      ...paramsSearch,
    };
    const response = await CxmQuestionService.list(_params, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCxmQuestion(result.items);

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
      getListCxmQuestion(params);
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
  const optionQuestionType = [
    {
      value: "text",
      label: "Bằng văn bản",
    },
    {
      value: "single_choice",
      label: "Chọn một đáp án",
    },
    {
      value: "multiple_choice",
      label: "Chọn nhiều đáp án",
    },
    {
      value: "rating",
      label: "Đánh giá trên thang điểm",
    },
    {
      value: "yes/no",
      label: "Có/Không",
    },
    {
      value: "dropdown",
      label: "Dropdown",
    },
    {
      value: "date",
      label: "Ngày",
    },
    {
      value: "file_upload",
      label: "File upload",
    },
  ];
  const optionQuestionIsChoice = ["single_choice", "multiple_choice", "dropdown"];

  const titles = ["STT", "Câu hỏi và đáp án trước", "Nội dung câu hỏi", "Loại câu hỏi", "Lựa chọn"];

  const dataFormat = ["text-center", "text-left", "text-left", "text-left", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    <div key={item.id} className={`action__view--customer`}>
      <a>Xem câu hỏi và đáp án trước</a>
    </div>,
    item.questionText || "",
    item?.questionType ? optionQuestionType.find((x) => x.value === item.questionType)?.label : "",
    <div key={index}>
      {optionQuestionIsChoice.includes(item?.questionType) && (
        <div
          key={item.id}
          className={`action__view--customer`}
          onClick={() => {
            setStepQuestion(3);
            const updatedListNav = listNav.map((item, index) => {
              if (index === listNav.length - 1) {
                return { ...item, className: "title-first" };
              }
              return item;
            });
            setListNav([
              ...updatedListNav,
              {
                title: "Đáp án",
                className: "title-last",
                callback: () => {
                  setStepQuestion(3);
                },
              },
            ]);
            setDataCxmQuestion(item);
          }}
        >
          <a>Danh sách lựa chọn</a>
        </div>
      )}
    </div>,
  ];

  const handleChangeActive = async (item) => {
    const body = {
      id: item.id,
    };

    // let response = null;

    // if (item.status == 2) {
    //   response = await BeautyCxmQuestionService.activate(body);
    // } else {
    //   response = await BeautyCxmQuestionService.unActivate(body);
    // }

    // if (response.code === 0) {
    //   showToast(`Dự án ${item.status == 2 ? "ngừng hoạt động" : "hoạt động"} thành công`, "success");
    //   getListCxmQuestion(params);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmActiveCxmQuestion = (item?: any) => {
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
              showDialogConfirmActiveCxmQuestion(item);
            },
          },

          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataCxmQuestion(item);
              setShowModalAddCxmQuestion(true);
            },
          },
        ]
      : [
          // {
          //   title: item.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động",
          //   icon: <Icon name={item.status == 2 ? "Lock" : "Unlock"} />,
          //   callback: () => {
          //     showDialogConfirmActiveCxmQuestion(item);
          //   },
          // },
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setDataCxmQuestion(item);
              setShowModalAddCxmQuestion(true);
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
    const response = await CxmQuestionService.delete(id);

    if (response.code === 0) {
      showToast("Xóa câu hỏi thành công", "success");
      getListCxmQuestion(params);
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
          Bạn có chắc chắn muốn xóa {item ? "câu hỏi " : `${listIdChecked.length} câu hỏi đã chọn`}
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
      title: "Xóa câu hỏi",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const listFilter = useMemo(
    () =>
      [
        // {
        //   key: "operationProjectId",
        //   name: "Dự án",
        //   type: "select",
        //   is_featured: true,
        // },
      ] as IFilterItem[],
    []
  );

  return (
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
                      name: "",
                      limit: 1000,
                    });
                  } else {
                    setParams({
                      name: "",
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
            name="Tên câu hỏi"
            params={params}
            // isSaveSearch={true}
            // listSaveSearch={listSaveSearch}
            isFilter={true}
            listFilterItem={listFilter}
            // disabledTextInput={true}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
        </div>
        {/* : null} */}
      </div>
      {!isLoading && listCxmQuestion && listCxmQuestion.length > 0 ? (
        <BoxTable
          name="Dự án"
          titles={titles}
          items={listCxmQuestion}
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
                  Hiện tại chưa có câu hỏi nào. <br />
                  Hãy thêm mới câu hỏi đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm mới câu hỏi"
              action={() => {
                setDataCxmQuestion(null);
                setShowModalAddCxmQuestion(true);
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
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
