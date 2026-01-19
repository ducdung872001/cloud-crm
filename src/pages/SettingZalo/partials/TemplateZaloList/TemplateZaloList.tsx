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
import { showToast } from "utils/common";
import { useWindowDimensions } from "utils/hookCustom";
import { trimContent, isDifferenceObj, getPageOffset } from "reborn-util";
import TemplateZaloService from "services/TemplateZaloService";
// import AddTemplateZaloModal from "./partials/AddTemplateZaloModal";
import TableTemplateZalo from "./partials/TableTemplateZalo";
import "tippy.js/animations/scale.css";
import "./TemplateZaloList.scss";
import { ITemplateZaloListProps } from "model/templateZalo/PropsModel";
import { ITemplateZaloFilterRequest } from "model/templateZalo/TemplateZaloRequestModel";
import { ITemplateZaloResponseModel } from "model/templateZalo/TemplateZaloResponseModel";
import AddTemplateZalo from "./partials/AddTemplateZalo/AddTemplateZalo";

export default function TemplateZaloList(props: ITemplateZaloListProps) {
  document.title = "Khai báo mẫu Zalo";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [listTemplateZalo, setListTemplateZalo] = useState<ITemplateZaloResponseModel[]>([]);
  const [dataTemplateZalo, setDataTemplateZalo] = useState<ITemplateZaloResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isAddEditTemplateZalo, setIsAddEditTemplateZalo] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState<ITemplateZaloFilterRequest>({
    name: "",
    limit: 10,
  });

  const { width } = useWindowDimensions();

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách mẫu Zalo",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
    //   {
    //     key: "type",
    //     name: "Loại mẫu",
    //     type: "select",
    //     is_featured: true,
    //     list: [
    //       {
    //         value: "1",
    //         label: "Mẫu Zalo từ hệ thống",
    //       },
    //       {
    //         value: "2",
    //         label: "Mẫu Zalo do người dùng tạo",
    //       },
    //     ],
    //     value: searchParams.get("type") ?? "",
    //   },
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
    name: "Mẫu Zalo",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTemplateZalo = async (paramsSearch: ITemplateZaloFilterRequest) => {
    setIsLoading(true);

    const response = await TemplateZaloService.list(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setListTemplateZalo(result?.items);
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
      getListTemplateZalo(params);
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
      ...(isAddEditTemplateZalo
        ? [
            {
              title: "Quay lại",
              callback: () => {
                setIsAddEditTemplateZalo(false);
              },
            },
          ]
        : [
            {
              title: "Thêm mới",
              callback: () => {
                setDataTemplateZalo(null);
                setIsAddEditTemplateZalo(!isAddEditTemplateZalo);
              },
            },
          ]),
    ],
  };

  const titles = ["STT", "Tiêu đề tin", "Chủ đề"];

  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: ITemplateZaloResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    <Tippy key={item.id} content={item.title} delay={[120, 100]} placement="bottom" animation="scale">
      <p style={{ cursor: "pointer" }}>{trimContent(item.title, 50, true, true)}</p>
    </Tippy>,
    item.tcyName,
  ];

  const actionsTable = (item: ITemplateZaloResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setDataTemplateZalo(item);
            setIsAddEditTemplateZalo(true);
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
    const response = await TemplateZaloService.delete(id);

    if (response.code === 0) {
      showToast("Xóa mẫu Zalo thành công", "success");
      getListTemplateZalo(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllCustomer = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        TemplateZaloService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa khách hàng thành công", "success");
        getListTemplateZalo(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: ITemplateZaloResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? " mẫu Zalo " : `${listIdChecked.length} mẫu Zalo đã chọn`}
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
        if (listIdChecked.length > 0) {
          onDeleteAllCustomer();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa mẫu Zalo",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page--template-zalo${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className={`title-first ${isAddEditTemplateZalo && width <= 768 ? "d-none" : ""}`}
            title="Quay lại"
          >
            Cài đặt Zalo
          </h1>
          <Icon
            name="ChevronRight"
            className={`${isAddEditTemplateZalo && width <= 768 ? "d-none" : ""}`}
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1
            title={`${isAddEditTemplateZalo ? "Quay lại" : ""}`}
            className={`title-last ${isAddEditTemplateZalo ? "active" : ""}`}
            onClick={() => {
              setIsAddEditTemplateZalo(false);
            }}
          >
            Khai báo mẫu Zalo
          </h1>
          {isAddEditTemplateZalo && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setIsAddEditTemplateZalo(false);
                }}
              />
              <h1 className="title-last">{dataTemplateZalo ? "Chỉnh sửa" : "Thêm mới"} mẫu Zalo</h1>
            </Fragment>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        {isAddEditTemplateZalo ? ( 
            
          <AddTemplateZalo
            onShow={isAddEditTemplateZalo}
            dataTemplateZalo={dataTemplateZalo}
            onHide={(reload) => {
              if (reload) {
                getListTemplateZalo(params);
              }
              setIsAddEditTemplateZalo(false);
            }}
            onBackProps={() => setIsAddEditTemplateZalo(false)}
          />

        ) : (
          <TableTemplateZalo
            params={params}
            setParams={setParams}
            listSaveSearch={listSaveSearch}
            pagination={pagination}
            titles={titles}
            listTemplateZalo={listTemplateZalo}
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
            setDataTemplateZalo={setDataTemplateZalo}
            setIsAddEditTemplateZalo = {setIsAddEditTemplateZalo}
          />
        )}
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
