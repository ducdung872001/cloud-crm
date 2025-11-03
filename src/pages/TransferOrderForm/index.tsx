import React, { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import { useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import Badge from "components/badge/badge";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import AddTransferOrderForm from "./partials/AddTransferOrderForm";

export default function TransferOrderForm() {
  document.title = "Phiếu điều chuyển kho";

  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [lstTransferOrderForm, setLstTransferOrderForm] = useState([]);
  const [dataTransferOrderForm, setDataTransferOrderForm] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idTransferOrderForm, setIdTransferOrderForm] = useState<number>(null);
  const [type, setType] = useState<string>("view");
  const [showModalView, setShowModalView] = useState<boolean>(false);

  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách phiếu điều chuyển kho",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_buy",
        name: "Khoảng thời gian",
        type: "date-two",
        param_name: ["startDate", "endDate"],
        is_featured: true,
        value: searchParams.get("startDate") ?? "",
        value_extra: searchParams.get("endDate") ?? "",
        is_fmt_text: true,
      },
      {
        key: "inventoryId",
        name: "Kho nhập",
        type: "select",
        is_featured: true,
        value: searchParams.get("inventoryId") ?? "",
      },
      {
        key: "status",
        name: "Trạng thái",
        type: "select",
        list: [
          {
            value: 0,
            label: "Chờ duyệt",
          },
          {
            value: 1,
            label: "Hoàn thành",
          },
          {
            value: 2,
            label: "Đã duyệt",
          },
          {
            value: 3,
            label: "Không duyệt",
          },
        ],
        is_featured: true,
        value: searchParams.get("status") ?? "",
      },
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Phiếu điều chuyển kho",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getLstTransferOrderForm = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await { code: 0, message: "", result: { items: [], page: 1, total: 0 } };

    if (response.code === 0) {
      const result = response.result;
      setLstTransferOrderForm(result.items);

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
      getLstTransferOrderForm(params);
      const paramsTemp: any = _.cloneDeep(params);
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
      {
        title: "Thêm mới",
        callback: () => {
          setIdTransferOrderForm(null);
          setShowModalAdd(true);
        },
      },
    ],
    actions_extra: [
      {
        title: "Xuất danh sách",
        icon: <Icon name="Download" />,
        callback: () => {
          console.log("hành động xuất danh sách !");
        },
      },
    ],
  };

  const titles = ["STT", "Mã phiếu", "Ngày nhận", "Kho", "Trạng thái", "Số lượng"];

  const dataFormat = ["text-center", "", "text-center", "", "text-center", "text-right"];

  const dataMappingArray = (item: any, index: number) => [getPageOffset(params) + index + 1, item.code];

  const actionsTable = (item: any): IAction[] => {
    return item.status === 1 || item.status === 0
      ? [
          {
            title: "Xem chi tiết",
            icon: <Icon name="Eye" />,
            callback: () => {
              // setType("view");
              setIdTransferOrderForm(item.id);
              setShowModalView(true);
            },
          },
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setIdTransferOrderForm(item.id);
              setShowModalAdd(true);
            },
          },
          {
            title: "Duyệt phiếu chỉnh kho",
            icon: <Icon name="CheckedCircle" className="icon-success" />,
            callback: () => {
              // setType("approval");
              setIdTransferOrderForm(item.id);
              setShowModalView(true);
            },
          },
        ]
      : [
          {
            title: "Xem chi tiết",
            icon: <Icon name="Eye" />,
            callback: () => {
              setIdTransferOrderForm(item.id);
              setShowModalView(true);
            },
          },
        ];
  };

  return (
    <div className={`page-content page__transfer--order-form${isNoItem ? " bg-white" : ""}`}>
      <div className={showModalAdd ? "d-none" : ""}>
        <TitleAction title="Phiếu điều chuyển kho" titleActions={titleActions} />

        <div className="card-box d-flex flex-column">
          <SearchBox
            name="Mã phiếu hoặc người tạo"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            isFilter={true}
            listFilterItem={customerFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />

          {!isLoading && lstTransferOrderForm && lstTransferOrderForm.length > 0 ? (
            <BoxTable
              name="Phiếu điều chuyển kho"
              titles={titles}
              items={lstTransferOrderForm}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              striped={true}
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
                      Hiện tại chưa có phiếu điều chuyển kho nào. <br />
                      Hãy thêm mới phiếu điều chuyển kho đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới phiếu điều chuyển kho"
                  action={() => {
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
      </div>

      <div className={showModalAdd ? "" : "d-none"}>
        <AddTransferOrderForm
          onShow={showModalAdd}
          id={idTransferOrderForm}
          onHide={(reload) => {
            if (reload) {
              getLstTransferOrderForm(params);
            }
            setShowModalAdd(false);
          }}
        />
      </div>
    </div>
  );
}
