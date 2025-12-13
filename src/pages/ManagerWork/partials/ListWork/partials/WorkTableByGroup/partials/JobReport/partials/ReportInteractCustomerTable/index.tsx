/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Grid } from "swiper";
import { getSearchParameters, getPageOffset } from "reborn-util";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { ExportExcel } from "exports";
import ExportModal from "components/exportModal/exportModal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { showToast, getPermissions } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import { IFilterItem, IOption } from "model/OtherModel";
import { UserContext, ContextType } from "contexts/userContext";
import SupportInstructionsRecord from "../SupportInstructionsRecord";
import ViewInteractModal from "./partials/ViewInteractModal";
import "swiper/css/grid";
import "swiper/css/navigation";
import "./index.scss";

export default function ReportInteractCustomerTable() {
  const { name, dataBranch } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();
  const [listCustomer, setListCustomer] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const isMounted = useRef(false);

  const [params, setParams] = useState<any>({
    keyword: "",
  });

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const customerFilterList = useMemo(
    () =>
      [
        {
          key: "time_buy",
          name: "Khoảng thời gian",
          type: "date-two",
          param_name: ["startTime", "endTime"],
          is_featured: true,
          value: searchParams.get("startTime") ?? "",
          value_extra: searchParams.get("endTime") ?? "",
          is_fmt_text: true,
        },
        {
          key: "",
          name: "Kênh tương tác",
          type: "select",
          list: [
            {
              value: 1,
              label: "Call",
            },
            {
              value: 2,
              label: "SMS",
            },
            {
              value: 3,
              label: "Email",
            },
            {
              value: 4,
              label: "Phản hồi",
            },
          ],
          is_featured: true,
          value: searchParams.get("") ?? "",
        },
        {
          key: "customerId",
          name: "Khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("customerId") ?? "",
        },
        {
          key: "employeeId",
          name: "Nhân viên phụ trách",
          type: "select",
          is_featured: true,
          value: searchParams.get("employeeId") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  const abortController = new AbortController();
  const getListCustomer = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await CustomerService.detailCustomerReport(paramsSearch);
    if (response.code === 0) {
      const result = response.result;
      setListCustomer(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result && result.total === 0) {
        setIsNoItem(true);
      }
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
      getListCustomer(params);
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

  const titles = [
    "STT",
    "Ngày",
    "Tên khách hàng",
    "Người liên hệ",
    "Số điện thoại",
    "Địa chỉ",
    "Nhân viên phụ trách",
    "Lịch sử tương tác",
    "Định hướng hoạt động tiếp theo",
  ];

  const extractValues = (text) => {
    if (!text) return;
    // Tìm các cặp key-value trong chuỗi
    const matches = text.match(/(\w+):\t([^\n]+)/g);

    // Tạo một đối tượng từ các cặp key-value
    const valuesObj = matches.reduce((acc, match) => {
      const [key, value] = match.split(/:\t/);
      acc[key] = value;
      return acc;
    }, {});

    return Object.values(valuesObj).join(" ,");
  };

  const [showModalInteract, setShowModalInteract] = useState<boolean>(false);
  const [dataInteract, setDataInteract] = useState(null);

  const dataMappingArray = (item: any, index: number, type?: string) => [
    getPageOffset(params) + index + 1,
    item.lastActionTime ? moment(item.lastActionTime).format("DD/MM/YYYY") : "",
    item.customer?.name,
    item?.contactName,
    item.customer?.phoneMasked,
    item.customer?.address,
    item.employee?.name,
    type ? (
      extractValues(item.actions)
    ) : (
      <span
        key={item.id}
        className="view__history--interact"
        onClick={() => {
          setDataInteract(item);
          setShowModalInteract(true);
        }}
      >
        Xem thêm
      </span>
    ),
    "",
  ];

  const dataFormat = ["text-center", "text-center", "", "", "", "", "", "text-center", "", ""];

  const formatExcel = ["center", "top", "", "", "", "", "", "", "", ""];

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);

  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả khách hàng ",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem || listCustomer.length} khách hàng phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, params]
  );

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await CustomerService.detailCustomerReport({
        ...params,
        page: type === "current_page" ? params.page || 1 : 1,
        limit: type === "all" || type === "current_search" ? 10000 : params.limit,
      });

      if (response.code === 0) {
        const result = response.result.items;

        if (extension === "excel") {
          ExportExcel({
            fileName: "BaoCaoTuongTacKhachHang",
            title: "Báo cáo tương tác khách hàng",
            header: titles,
            formatExcel: formatExcel,
            data: result.map((item, idx) => dataMappingArray(item, idx, "export")),
            info: { name },
          });
        }
        showToast("Xuất file thành công", "success");
        setOnShowModalExport(false);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
        setOnShowModalExport(false);
      }
    },
    [params, listCustomer]
  );

  const [showModalSupport, setShowModalSupport] = useState<boolean>(false);

  return (
    <Fragment>
      <div className={`page-content page__customer--report${isNoItem ? " bg-white" : ""}`}>
        {/* <TitleAction title="Khách hàng" titleActions={titleActions} /> */}
        <div className="card-box d-flex flex-column">
          {/* <div style={{display:'flex', border:'1px solid'}}> */}
          <div className="title__report">
            <h2>Báo cáo chi tiết tương tác khách hàng</h2>

            <div className="icon__info" onClick={() => setShowModalSupport(true)}>
              <Icon name="Info" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setOnShowModalExport(true)}>
            <Icon name="Download" style={{ width: 17 }} />
            <span style={{ fontSize: 14, marginLeft: 5 }}>Xuất báo cáo</span>
          </div>
          {/* </div> */}
          <SearchBox
            name="Khách hàng"
            placeholderSearch="Tìm kiếm theo tên/ SĐT/ Mã thẻ KH"
            params={params}
            isFilter={true}
            listFilterItem={customerFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listCustomer && listCustomer.length > 0 ? (
            <BoxTable
              name="Khách hàng"
              titles={titles}
              items={listCustomer}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              isBulkAction={true}
              striped={true}
              actionType="inline"
            />
          ) : isLoading ? (
            <Loading />
          ) : (
            <Fragment>
              {
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
              }
            </Fragment>
          )}
        </div>

        <ExportModal
          name="Khách hàng"
          onShow={onShowModalExport}
          onHide={() => setOnShowModalExport(false)}
          options={optionsExport}
          callback={(type, extension) => exportCallback(type, extension)}
        />
        <ViewInteractModal
          onShow={showModalInteract}
          onHide={() => {
            setShowModalInteract(false);
            setDataInteract(null);
          }}
          data={dataInteract}
        />
        <SupportInstructionsRecord onShow={showModalSupport} onHide={() => setShowModalSupport(false)} />
      </div>
    </Fragment>
  );
}
