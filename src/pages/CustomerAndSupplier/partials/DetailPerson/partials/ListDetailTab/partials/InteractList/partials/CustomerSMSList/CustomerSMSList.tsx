import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Loading from "components/loading";
import Button from "components/button/button";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, Pagination, PaginationProps } from "components/pagination/pagination";
import { ICustomerSMSListProps } from "model/customerSMS/PropsModel";
import { ICustomerSMSFilterRequest } from "model/customerSMS/CustomerSMSRequestModel";
import { ICustomerSMSResponseModel } from "model/customerSMS/CustomerSMSResponseModel";
import { ICustomPlaceholderResponse } from "model/customPlaceholder/CustomPlaceholderResponseModel";
import { showToast } from "utils/common";
import HistorySendService from "services/HistorySendService";
import AddCustomerSMSModal from "./partials/AddCustomerSMSModal";
import AddCustomPlaceholderModal from "./partials/CustomPlaceholder/AddCustomPlaceholderModal";
import "./CustomerSMSList.scss";

export default function CustomerSMSList(props: ICustomerSMSListProps) {
  const { idCustomer, onShow, callBack } = props;

  const isMounted = useRef(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listCustomerSMS, setListCustomerSMS] = useState<ICustomerSMSResponseModel[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalPlaceholder, setShowModalPlaceholder] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [codes, setCodes] = useState<ICustomPlaceholderResponse>(null);

  const [params, setParams] = useState<ICustomerSMSFilterRequest>({
    customerId: idCustomer,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "lịch sử gửi sms",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCustomerSMS = async (paramsSearch: ICustomerSMSFilterRequest) => {
    setIsLoading(true);

    const response = await HistorySendService.historySendSMS(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCustomerSMS(result.items);
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
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListCustomerSMS(params);
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

  return (
    <div className={`page-content page-customer-sms${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        {!isLoading && listCustomerSMS && listCustomerSMS.length > 0 ? (
          <div className="list-history-sms">
            {listCustomerSMS.map((item, idx) => (
              <div key={idx} className="item-history-sms">
                <div className="info-item info-title">
                  <h4 className="title">Tiêu đề</h4>
                  <h4 className="name">{item.title}</h4>
                </div>

                <div className="info-item info-content">
                  <h4 className="title">Nội dung</h4>
                  <h4 className="name">{item.content}</h4>
                </div>

                <div className="info-item customer-send">
                  <h4 className="title">Người gửi</h4>
                  <h4 className="name">{item.employeeName}</h4>
                </div>

                <div className="info-item info-date">
                  <h4 className="title">Ngày gửi</h4>
                  <h4 className="name">{item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY") : ""}</h4>
                </div>

                <div className="info-item info-status">
                  <h4 className="title">Trạng thái</h4>
                  <h4 className="name" style={item.status === 1 ? { color: "#1bc10d", fontWeight: "500" } : { color: "#ed0f0f", fontWeight: "500" }}>
                    {item.status === 1 ? "Thành công" : "Thất bại"}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isNoItem && (
              <SystemNotification
                description={<span>Hiện tại chưa có lịch sử gửi tin nhắn nào.</span>}
                type="no-item"
                titleButton="Gửi tin nhắn"
                action={() => {
                  setShowModalAdd(true);
                }}
              />
            )}
          </Fragment>
        )}
      </div>
      <Pagination
        name={pagination.name}
        displayNumber={pagination.displayNumber}
        page={pagination.page}
        setPage={(page) => pagination.setPage(page)}
        sizeLimit={pagination.sizeLimit}
        totalItem={pagination.totalItem}
        totalPage={pagination.totalPage}
        isChooseSizeLimit={pagination.isChooseSizeLimit}
        chooseSizeLimit={(limit) => pagination.chooseSizeLimit && pagination.chooseSizeLimit(limit)}
      />
      <AddCustomerSMSModal
        onShow={showModalAdd || onShow}
        idCustomer={idCustomer}
        callback={(codes: ICustomPlaceholderResponse) => {
          setCodes(codes);
          setShowModalPlaceholder(true);
        }}
        onHide={(reload) => {
          if (reload) {
            getListCustomerSMS(params);
          }
          setShowModalAdd(false);
          callBack();
        }}
      />

      {/* Popup xác nhận nhập dữ liệu thay thế */}
      <AddCustomPlaceholderModal
        onShow={showModalPlaceholder}
        data={codes}
        onHide={(reload) => {
          if (reload) {
            getListCustomerSMS(params);
          }
          setShowModalPlaceholder(false);
        }}
      />
    </div>
  );
}
