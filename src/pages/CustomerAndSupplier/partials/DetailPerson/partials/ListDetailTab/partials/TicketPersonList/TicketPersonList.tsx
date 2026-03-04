import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Loading from "components/loading";
import Button from "components/button/button";
import Fancybox from "components/fancybox/fancybox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, Pagination, PaginationProps } from "components/pagination/pagination";
import { showToast } from "utils/common";
import { ITicketPersonListProps } from "model/customer/PropsModel";
import { ITicketFilterRequest } from "model/ticket/TicketRequestModel";
import { ITicketResponseModel } from "model/ticket/TicketResponseModel";
import TicketService from "services/TicketService";
import { useOnClickOutside } from "utils/hookCustom";
import AddTicketModal from "pages/Ticket/partials/AddEditTicketModal/AddTicketModal";
import ViewStatusTicketModal from "./partials/ViewStatusTicketModal";
import "tippy.js/animations/scale-extreme.css";
import "./TicketPersonList.scss";

export default function TicketPersonList(props: ITicketPersonListProps) {
  const { idCustomer } = props;

  const isMounted = useRef(false);
  const refPopoverItem = useRef();
  const refPopoverContainer = useRef();

  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isService, setIsService] = useState<boolean>(false);
  const [listTicket, setListTicket] = useState<ITicketResponseModel[]>([]);
  const [dataTicket, setDataTicket] = useState<ITicketResponseModel>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalView, setShowModalView] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idTicket, setIdTicket] = useState<number>(0);
  const [isShowOption, setIsShowOption] = useState<boolean>(false);
  useOnClickOutside(refPopoverItem, () => setIsShowOption(false), ["ticket__item--action"]);

  const [params, setParams] = useState<ITicketFilterRequest>({
    customerId: idCustomer,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Hỗ trợ",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTicket = async (paramsSearch: ITicketFilterRequest) => {
    setIsLoading(true);

    const response = await TicketService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListTicket(result.items);
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
    } else if (response.code == 500) {
      setIsService(true);
      showToast("Lỗi hệ thống", "error");
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
      getListTicket(params);
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

  const onDelete = async (id: number) => {
    const response = await TicketService.delete(id);

    if (response.code === 0) {
      showToast("Xóa hỗ trợ thành công", "success");
      getListTicket(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ITicketResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa hỗ trợ cho khách hàng
          {item ? <strong> {item.customerName}</strong> : ""}? Thao tác này không thể khôi phục.
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

  return (
    <div className={`page-content page-ticket-person${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách hỗ trợ</li>
            </ul>
            <Tippy content="Thêm mới hỗ trợ" delay={[100, 0]} animation="scale-extreme">
              <div className="add-ticket">
                <Button
                  color="success"
                  onClick={() => {
                    setDataTicket(null);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
        </div>
        {/* list ra những phiếu ticket */}
        {!isLoading && listTicket && listTicket.length > 0 ? (
          <div className="list-ticket">
            {listTicket.map((item, idx) => {
              const dataImage = JSON.parse(item.docLink || "[]");
              return (
                <div key={idx} className="ticket__item">
                  <div className="ticket__item--body">
                    <div className="body-left">
                      <div className="item-child name-customer">
                        <h4 className="title">Tên khách hàng</h4>
                        <h4 className="name">{item.customerName}</h4>
                      </div>
                      {/* <div className="item-child service-customer">
                        <h4 className="title">Người phụ trách</h4>
                        <h4 className="name">{item.employeeName}</h4>
                      </div> */}
                      <div className="item-child category-ticket">
                        <h4 className="title">Danh mục hỗ trợ</h4>
                        <h4 className="name">{item.supportName}</h4>
                      </div>
                      <div className="item-child image-ticket">
                        <h4 className="title">Hình ảnh</h4>
                        <h4 className={`wrapper-list-image ${dataImage.length <= 0 ? "d-none" : ""}`}>
                          {dataImage.length > 0 ? (
                            <Fancybox>
                              <div className="list-image">
                                <a data-fancybox="gallery" href={dataImage[0]?.url} className="title-preview">
                                  Xem thêm
                                </a>

                                <div className="d-none">
                                  {dataImage.slice(1).map((item, idx) => {
                                    return (
                                      <a key={idx} data-fancybox="gallery" href={item.url}>
                                        <img src={item.url} alt="" />
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            </Fancybox>
                          ) : (
                            ""
                          )}
                        </h4>
                      </div>
                    </div>
                    <div className="body-right">
                      <div className="item-child reception-department">
                        <h4 className="title">Phòng ban tiếp nhận</h4>
                        <h4 className="name">{item.departmentName}</h4>
                      </div>
                      {/* <div className="item-child reception-staff">
                        <h4 className="title">Nhân viên tiếp nhận</h4>
                        <h4 className="name">{item.employeeName}</h4>
                      </div> */}
                      <div className="item-child day-reception">
                        <h4 className="title">Ngày tiếp nhận</h4>
                        <h4 className="name">{item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY") : ""}</h4>
                      </div>
                      <div className="item-child estimated-completion">
                        <h4 className="title">Ngày dự kiến xong</h4>
                        <h4 className="name">{item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : ""}</h4>
                      </div>
                      <div className="item-child status">
                        <h4 className="title">Trạng thái xử lý</h4>
                        <h4
                          className={`name ${
                            !item.status
                              ? "name-just"
                              : item.status === 1
                              ? "name-initial"
                              : item.status === 2
                              ? "name-success"
                              : item.status === 4
                              ? "name-pending"
                              : "name-falid"
                          }`}
                        >
                          {!item.status
                            ? "Chưa thực hiện"
                            : item.status === 1
                            ? item.statusName
                              ? item.statusName
                              : "Đang thực hiện"
                            : item.status === 2
                            ? "Đã hoàn thành"
                            : item.status === 4
                            ? "Tạm dừng"
                            : "Đã hủy"}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="ticket__item--action" ref={refPopoverContainer}>
                    <span
                      className={`icon-dot-three ${isShowOption && item.id === idTicket ? "active-option" : ""}`}
                      onClick={() => {
                        setIsShowOption(!isShowOption);
                        setIdTicket(item.id);
                      }}
                    >
                      <Icon name="ThreeDotVertical" />
                    </span>

                    {isShowOption && item.id === idTicket && (
                      <div className="popover-wrapper" ref={refPopoverItem}>
                        <ul className="menu-item">
                          <li
                            className="item-view"
                            onClick={() => {
                              setIsShowOption(false);
                              setShowModalView(true);
                            }}
                          >
                            <Icon name="Eye" />
                            Xem lịch sử
                          </li>
                          <li
                            className="item-edit"
                            onClick={() => {
                              setIsShowOption(false);
                              setShowModalAdd(true);
                              setDataTicket(item);
                            }}
                          >
                            <Icon name="Pencil" />
                            Sửa hỗ trợ
                          </li>
                          <li
                            className="item-delete"
                            onClick={() => {
                              setIsShowOption(false);
                              showDialogConfirmDelete(item);
                            }}
                          >
                            <Icon name="Trash" />
                            Xóa hỗ trợ
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isService ? (
              <SystemNotification
                type="no-service"
                description={
                  <span>
                    Hiện tại hệ thống đang gặp sự cố. <br />
                    Bạn vui lòng thử lại sau nhé!
                  </span>
                }
              />
            ) : (
              isNoItem && (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có hỗ trợ nào. <br />
                      Hãy thêm mới hỗ trợ đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới hỗ trợ"
                  action={() => {
                    setDataTicket(null);
                    setShowModalAdd(true);
                  }}
                />
              )
            )}
          </Fragment>
        )}
      </div>
      {!isService && (
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
      )}
      <ViewStatusTicketModal
        onShow={showModalView}
        idTicket={idTicket}
        onHide={() => {
          setShowModalView(false);
        }}
      />
      <AddTicketModal
        onShow={showModalAdd}
        data={dataTicket}
        idCustomer={idCustomer}
        onHide={(reload) => {
          if (reload) {
            getListTicket(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
