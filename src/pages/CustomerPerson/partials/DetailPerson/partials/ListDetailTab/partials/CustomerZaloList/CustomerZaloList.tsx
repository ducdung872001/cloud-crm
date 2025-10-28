import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Loading from "components/loading";
import Button from "components/button/button";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, Pagination, PaginationProps } from "components/pagination/pagination";
import { ICustomPlaceholderResponse } from "model/customPlaceholder/CustomPlaceholderResponseModel";
import { showToast } from "utils/common";
import HistorySendService from "services/HistorySendService";
// import AddCustomerSMSModal from "./partials/AddCustomerSMSModal";
// import AddCustomPlaceholderModal from "./partials/CustomPlaceholder/AddCustomPlaceholderModal";
import "./CustomerZaloList.scss";
import { ICustomerZaloListProps } from "model/customerZalo/PropsModel";
import { ICustomerZaloResponseModel } from "model/customerZalo/CustomerZaloResponseModel";
import { ICustomerZaloFilterRequest } from "model/customerZalo/CustomerZaloRequestModel";
import AddCustomerZaloModal from "./partials/AddCustomerZaloModal";
import Dialog from "components/dialog/dialog";
import CustomerService from "services/CustomerService";

export default function CustomerZaloList(props: ICustomerZaloListProps) {
  const { idCustomer, customerName } = props;

  const isMounted = useRef(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listCustomerZalo, setListCustomerZalo] = useState<ICustomerZaloResponseModel[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalPlaceholder, setShowModalPlaceholder] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [codes, setCodes] = useState<ICustomPlaceholderResponse>(null);

  const [showAlertNotFollow, setShowAlertNotFollow] = useState<boolean>(false);
  const [contentAlert, setContentAlert] = useState<any>(null);

  const [params, setParams] = useState<ICustomerZaloFilterRequest>({
    customerId: idCustomer,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "lịch sử gửi Zalo",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCustomerZalo = async (paramsSearch: ICustomerZaloFilterRequest) => {
    setIsLoading(true);

    const response = await HistorySendService.historySendZalo(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCustomerZalo(result.items);
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
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListCustomerZalo(params);
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
 
  const [listZaloFollowed, setListZaloFollowed] = useState([])

  const getLitsZaloFollowed = async () => {

    const params = {
      customerId: idCustomer
    }

    const response = await CustomerService.customerZaloOA(params);

    if (response.code === 0) {
      const result = response.result;
      setListZaloFollowed(result)
      
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
    getLitsZaloFollowed()
  }, []);



  const showAlert = (item?: any) => {
    const contentAlert: any = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Không thể gửi Zalo</Fragment>,
      message: (
        <Fragment>
          Khách hàng {customerName ? <strong>{customerName}</strong> : ""} chưa theo dõi Zalo của tổ chức.
        </Fragment>
      ),
      // cancelText: "Đóng",
      // cancelAction: () => {
      //   setShowAlertNotFollow(false);
      //   setContentAlert(null);
      // },
      defaultText: "Đóng",
      defaultAction: () => {
        setShowAlertNotFollow(false);
        setContentAlert(null);
      },
    };
    setContentAlert(contentAlert);
    setShowAlertNotFollow(true);
  };

  return (
    <div className={`page-content page-customer-zalo${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách lịch sử gửi Zalo</li>
            </ul>
            <Tippy content="Gửi Zalo" delay={[100, 0]} animation="scale-extreme">
              <div className="add-zalo">
                <Button
                  color="success"
                  onClick={() => {
                    if(listZaloFollowed && listZaloFollowed.length > 0){
                      setShowModalAdd(true);
                    } else {
                      showAlert()
                    }
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
        </div>
        {!isLoading && listCustomerZalo && listCustomerZalo.length > 0 ? (
          <div className="list-history-zalo">
            {listCustomerZalo.map((item, idx) => (
              <div key={idx} className="item-history-zalo">
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
                description={
                  <span>
                    Hiện tại chưa có lịch sử gửi Zalo nào.                    
                  </span>
                }
                type="no-item"
                titleButton="Gửi Zalo"
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
      <AddCustomerZaloModal
        onShow={showModalAdd}
        idCustomer={idCustomer}
        callback={(codes: ICustomPlaceholderResponse) => {
        //   setCodes(codes);
        //   setShowModalPlaceholder(true);
        }}
        onHide={(reload) => {
          if (reload) {
            getListCustomerZalo(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentAlert} isOpen={showAlertNotFollow} />


      {/* Popup xác nhận nhập dữ liệu thay thế */}
      {/* <AddCustomPlaceholderModal
        onShow={showModalPlaceholder}
        data={codes}
        onHide={(reload) => {
          if (reload) {
            getListCustomerSMS(params);
          }
          setShowModalPlaceholder(false);
        }}
      /> */}
    </div>
  );
}
