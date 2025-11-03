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
import { IAdjustmentSlipResponse } from "model/adjustmentSlip/AdjustmentSlipResponseModel";
import { IAdjustmentSlipFilterRequest } from "model/adjustmentSlip/AdjustmentSlipRequestModel";
import { showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import AddAdjustmentSlip from "./partials/AddAdjustmentSlip/AddAdjustmentSlip";
import ViewAdjustmentSlip from "./partials/ViewAdjustmentSlip/ViewAdjustmentSlip";
import AdjustmentSlipService from "services/AdjustmentSlipService";

export default function AdjustmentSlip() {
  document.title = "Phiếu điều chỉnh kho";

  const isMounted = useRef(false);
  const checkUserRoot = localStorage.getItem("user.root");
  const [searchParams, setSearchParams] = useSearchParams();
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [lstAdjustmentSlip, setLstAdjustmentSlip] = useState<IAdjustmentSlipResponse[]>([]);
  const [idAdjustmentSlip, setIdAdjustmentSlip] = useState<number>(null);
  const [isAddAdjustmentSlip, setIsAddAdjustmentSlip] = useState<boolean>(false);
  const [showModalView, setShowModalView] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [type, setType] = useState<string>("view");

  const { name } = useContext(UserContext) as ContextType;

  const [params, setParams] = useState<IAdjustmentSlipFilterRequest>({
    name: "",
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách phiếu điều chỉnh kho",
      is_active: true,
    },
  ]);

  const customerFilterList = useMemo(
    () =>
      [
        ...(+checkUserRoot == 1
          ? [
              {
                key: "inventoryId",
                name: "Kho hàng",
                type: "select",
                is_featured: true,
                value: searchParams.get("inventoryId") ?? "",
              },
            ]
          : []),
        {
          key: "time_buy",
          name: "Khoảng thời gian",
          type: "date-two",
          param_name: ["fromTime", "toTime"],
          is_featured: true,
          value: searchParams.get("fromTime") ?? "",
          value_extra: searchParams.get("toTime") ?? "",
          is_fmt_text: true,
        },

        // {
        //   key: "inventoryId",
        //   name: "Kho hàng",
        //   type: "select",
        //   is_featured: true,
        //   value: searchParams.get("inventoryId") ?? "",
        // },
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
      ] as IFilterItem[],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Phiếu điều chỉnh kho",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getLstAdjustmentSlip = async (paramsSearch: IAdjustmentSlipFilterRequest) => {
    setIsLoading(true);

    const response = await AdjustmentSlipService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setLstAdjustmentSlip(result.items);

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
      getLstAdjustmentSlip(params);
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
      {
        title: "Thêm mới",
        callback: () => {
          setIdAdjustmentSlip(null);
          setIsAddAdjustmentSlip(true);
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

  const titles = ["STT", "Mã phiếu", "Ngày tạo", "Người tạo", "Chi nhánh kho hàng", "Trạng thái"];

  const dataFormat = ["text-center", "", "text-center", "", "", "text-center"];

  const dataMappingArray = (item: IAdjustmentSlipResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.code,
    moment(item.createdTime).format("DD/MM/YYYY HH:mm"),
    item.creatorName || name,
    item.inventoryName,
    <Badge
      key={item.id}
      text={item.status === 0 ? "Chờ duyệt" : item.status === 1 ? "Hoàn thành" : item.status === 2 ? "Đã duyệt" : "Không duyệt"}
      variant={item.status === 0 ? "warning" : item.status === 1 ? "primary" : item.status === 2 ? "success" : "error"}
    />,
  ];

  const actionsTable = (item: IAdjustmentSlipResponse): IAction[] => {
    return item.status === 1 || item.status === 0
      ? [
          {
            title: "Xem chi tiết",
            icon: <Icon name="Eye" />,
            callback: () => {
              setType("view");
              setIdAdjustmentSlip(item.id);
              setShowModalView(true);
            },
          },
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
              setIdAdjustmentSlip(item.id);
              setIsAddAdjustmentSlip(true);
            },
          },
          {
            title: "Duyệt phiếu chỉnh kho",
            icon: <Icon name="CheckedCircle" className="icon-success" />,
            callback: () => {
              setType("approval");
              setIdAdjustmentSlip(item.id);
              setShowModalView(true);
            },
          },
        ]
      : [
          {
            title: "Xem chi tiết",
            icon: <Icon name="Eye" />,
            callback: () => {
              setIdAdjustmentSlip(item.id);
              setShowModalView(true);
            },
          },
        ];
  };

  return (
    <div className={`page-content page__adjustment--slip${isNoItem ? " bg-white" : ""}`}>
      <div className={isAddAdjustmentSlip ? "d-none" : ""}>
        <TitleAction title="Phiếu điều chỉnh kho" titleActions={titleActions} />

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

          {!isLoading && lstAdjustmentSlip && lstAdjustmentSlip.length > 0 ? (
            <BoxTable
              name="Phiếu điều chỉnh kho"
              titles={titles}
              items={lstAdjustmentSlip}
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
                      Hiện tại chưa có phiếu điều chỉnh kho nào. <br />
                      Hãy thêm mới phiếu điều chỉnh kho đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới phiếu điều chỉnh kho"
                  action={() => {
                    setIsAddAdjustmentSlip(true);
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

        <ViewAdjustmentSlip
          type={type}
          name={name}
          onShow={showModalView}
          onHide={(reload) => {
            if (reload) {
              getLstAdjustmentSlip(params);
            }
            setShowModalView(false);
          }}
          idAdjustment={idAdjustmentSlip}
        />
      </div>

      <div className={isAddAdjustmentSlip ? "" : "d-none"}>
        <AddAdjustmentSlip
          onShow={isAddAdjustmentSlip}
          id={idAdjustmentSlip}
          onHide={(reload) => {
            if (reload) {
              getLstAdjustmentSlip(params);
            }
            setIsAddAdjustmentSlip(false);
          }}
        />
      </div>
    </div>
  );
}
