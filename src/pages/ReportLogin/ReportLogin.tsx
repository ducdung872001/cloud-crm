import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import Loading from "components/loading";
import Image from "components/image";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import TitleAction from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { showToast } from "utils/common";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { getPermissions } from "utils/common";
import UserService from "services/UserService";
import Icon from "components/icon";
import ViewDetailLoginModal from "./partials/ViewDetailLoginModal";

export default function ReportLogin() {
  document.title = "Báo cáo đăng nhập";

  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [listReportLogin, setListReportLogin] = useState([]);
  const [showModalView, setShowModalView] = useState<boolean>(false);
  const [dataReportLogin, setDataReportLogin] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách báo cáo đăng nhập",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_buy",
        name: "Thời gian gần nhất",
        type: "date-two",
        param_name: ["startDate", "endDate"],
        is_featured: true,
        value: searchParams.get("startDate") ?? "",
        value_extra: searchParams.get("endDate") ?? "",
        is_fmt_text: true,
      },
    ],
    [searchParams]
  );

  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nhân viên đăng nhập",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListReportLogin = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await UserService.checkLogin(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListReportLogin(result.items);
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
      getListReportLogin(params);
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
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  const titles = ["STT", "Ảnh nhân viên", "Tên nhân viên", "Phòng ban", "Chức danh", "QL trực tiếp", "Số lượt đăng nhập", "Ngày đăng nhập"];

  const dataFormat = ["text-center", "", "", "", "", "text-center", "text-right", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    <Image key={item.id} src={item.avatar} alt={item.name} />,
    item.name,
    item?.departmentName ?? "",
    item?.jteName ?? "",
    item?.managerName ?? "",
    item.numLogin,
    item.actionTime ? moment(item.actionTime).format("DD/MM/YYYY") : "",
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" />,
        callback: () => {
          setShowModalView(true);
          setDataReportLogin(item);
        },
      },
    ];
  };

  return (
    <div className={`page-content page__report--login${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Báo cáo đăng nhập" />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Nội dung"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listReportLogin && listReportLogin.length > 0 ? (
          <BoxTable
            name="Báo cáo đăng nhập"
            titles={titles}
            items={listReportLogin}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isNoItem ? (
              <SystemNotification description={<span>Hiện tại chưa có báo cáo đăng nhập nào.</span>} type="no-item" />
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
      <ViewDetailLoginModal data={dataReportLogin} onShow={showModalView} onHide={() => setShowModalView(false)} />
    </div>
  );
}
