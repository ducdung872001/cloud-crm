import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import moment from "moment";
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
import { showToast } from "utils/common";
import SurveyFormService from "services/SurveyFormService";
import { getPageOffset } from "reborn-util";
import AddCustomerSurvey from "./partials/AddCustomerSurvey";
import ViewResultSurvey from "./partials/ViewResultSurvey";
import "./index.scss";

export default function CustomerSurvey() {
  document.title = "Khảo sát khách hàng";

  const isMounted = useRef(false);

  const [listCustomerSurvey, setListCustomerSurvey] = useState([]);
  const [dataCustomerSurvey, setDataCustomerSurvey] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách khảo sát khách hàng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Khảo sát khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getLstCustomerSurvey = async (paramsSearch) => {
    setIsLoading(true);

    const response = await SurveyFormService.lst(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListCustomerSurvey(result);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      // đoạn này để tạm điều kiện hoặc vậy sau này xóa đi
      if ((+result.total === 0 && +result.page === 1) || result.length === 0) {
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
      getLstCustomerSurvey(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: showModalAdd ? "Quay lại" : "Thêm mới",
        callback: () => {
          if (showModalAdd) {
            setShowModalAdd(false);
          } else {
            setDataCustomerSurvey(null);
            setShowModalAdd(true);
          }
        },
      },
    ],
  };

  const titles = ["STT", "Tên khảo sát", "Thời gian bắt đầu", "Thời gian kết thúc", "Xem kết quả"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    moment(item.startTime).format("DD/MM/YYYY"),
    moment(item.endTime).format("DD/MM/YYYY"),
    <a
      key={item.id}
      onClick={() => {
        setShowResultModal(true);
        setDataCustomerSurvey(item);
      }}
    >
      Xem
    </a>,
  ];

  const actionsTable = (item): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataCustomerSurvey(item);
          setShowModalAdd(true);
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
    const response = await SurveyFormService.delete(id);

    if (response.code === 0) {
      showToast("Xóa khảo sát thành công", "success");
      getLstCustomerSurvey(params);
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
      const found = listCustomerSurvey.find((item) => item.id === selectedId);
      if (found?.id) {
        return SurveyFormService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} mục khảo sát khách hàng`, "success");
        getLstCustomerSurvey(params);
        setListIdChecked([]);
      } else {
        showToast("Không có mục khảo sát khách hàng nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "khảo sát khách hàng " : `${listIdChecked.length} khảo sát khách hàng đã chọn`}
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

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa khảo sát khách hàng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page__survey--form${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              setShowModalAdd(false);
            }}
            className="title-first"
            title="Quay lại"
          >
            Khảo sát khách hàng
          </h1>
          {showModalAdd && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setShowModalAdd(false);
                }}
              />
              <h1 className="title-last">{dataCustomerSurvey ? "Chỉnh sửa" : "Thêm mới"}</h1>
            </Fragment>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <div className={`${showModalAdd ? "d-none" : ""}`}>
          <SearchBox
            name="Tên khảo sát khách hàng"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listCustomerSurvey && listCustomerSurvey.length > 0 ? (
            <BoxTable
              name="khảo sát khách hàng"
              titles={titles}
              items={listCustomerSurvey}
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
              {isNoItem ? (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có khảo sát khách hàng nào. <br />
                      Hãy thêm mới khảo sát khách hàng đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới khảo sát khách hàng"
                  action={() => {
                    setDataCustomerSurvey(null);
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

        <div className={`${showModalAdd ? "" : "d-none"}`}>
          <AddCustomerSurvey
            onShow={showModalAdd}
            dataProps={dataCustomerSurvey}
            onHide={(reload) => {
              if (reload) {
                getLstCustomerSurvey(params);
              }

              setShowModalAdd(false);
            }}
          />
        </div>
      </div>
      <ViewResultSurvey onShow={showResultModal} data={dataCustomerSurvey} onHide={() => setShowResultModal(false)} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
