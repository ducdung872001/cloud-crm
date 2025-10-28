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
import { IWarrantyFilterRequest } from "model/warranty/WarrantyRequestModel";
import { IWarrantyResponseModel } from "model/warranty/WarrantyResponseModel";
import { IWarrantyListProps } from "model/customer/PropsModel";
import WarrantyService from "services/WarrantyService";
import { useOnClickOutside } from "utils/hookCustom";
import ViewStatusWarrantyModal from "./partials/ViewStatusWarrantyModal";
import AddWarrantyModal from "pages/Warranty/partials/AddEditWarrantyModal/AddWarrantyModal";
import "tippy.js/animations/scale-extreme.css";
import "./WarrantyPersonList.scss";

export default function WarrantyPersonList(props: IWarrantyListProps) {
  const { idCustomer } = props;

  const isMounted = useRef(false);
  const refPopoverItem = useRef();
  const refPopoverContainer = useRef();

  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isService, setIsService] = useState<boolean>(false);
  const [listWarranty, setListWarranty] = useState<IWarrantyResponseModel[]>([]);
  const [dataWarranty, setDataWarranty] = useState<IWarrantyResponseModel>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalView, setShowModalView] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idWarranty, setIdWarranty] = useState<number>(0);
  const [isShowOption, setIsShowOption] = useState<boolean>(false);
  useOnClickOutside(refPopoverItem, () => setIsShowOption(false), ["warranty__item--action"]);

  const [params, setParams] = useState<IWarrantyFilterRequest>({
    customerId: idCustomer,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Phiếu bảo hành",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListWarranty = async (paramsSearch: IWarrantyFilterRequest) => {
    setIsLoading(true);

    const response = await WarrantyService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListWarranty(result.items);
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
      getListWarranty(params);
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
    const response = await WarrantyService.delete(id);

    if (response.code === 0) {
      showToast("Xóa bảo hành thành công", "success");
      getListWarranty(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IWarrantyResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa bảo hành cho khách hàng
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
    <div className={`page-content page-warranty-person${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách bảo hành</li>
            </ul>
            <Tippy content="Thêm mới bảo hành" delay={[100, 0]} animation="scale-extreme">
              <div className="add-warranty">
                <Button
                  color="success"
                  onClick={() => {
                    setDataWarranty(null);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
        </div>
        {/* list ra những phiếu bảo hành */}
        {!isLoading && listWarranty && listWarranty.length > 0 ? (
          <div className="list-warranty">
            {listWarranty.map((item, idx) => {
              return (
                <div key={idx} className="warranty__item">
                  <div className="warranty__item--body">
                    <div className="body-left">
                      <div className="item-child name-customer">
                        <h4 className="title">Tên khách hàng</h4>
                        <h4 className="name">{item.customerName}</h4>
                      </div>
                      <div className="item-child service-customer">
                        <h4 className="title">Dịch vụ khách hàng</h4>
                        <h4 className="name">{item.serviceName}</h4>
                      </div>
                      <div className="item-child category-warranty">
                        <h4 className="title">Lí do bảo hành</h4>
                        <h4 className="name">{item.reasonName}</h4>
                      </div>
                      <div className="item-child image-warranty">
                        <h4 className="title">Hình ảnh</h4>
                        <h4 className="wrapper-list-image">
                          {item.docLink.length > 0 ? (
                            <Fancybox>
                              <div className="list-image">
                                <a data-fancybox="gallery" href={JSON.parse(item.docLink)[0]?.url} className="title-preview">
                                  Xem thêm
                                </a>

                                <div className="d-none">
                                  {JSON.parse(item.docLink)
                                    .slice(1)
                                    .map((item, idx) => {
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
                      <div className="item-child reception-staff">
                        <h4 className="title">Nhân viên tiếp nhận</h4>
                        <h4 className="name">{item.employeeName}</h4>
                      </div>
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
                        <h4 className={`name ${item.status === 2 ? "name-success" : item.status === 3 ? "name-failed" : ""}`}>
                          {item.status === 1 ? item.statusName : item.status === 2 ? "Đã hoàn thành" : "Đã hủy"}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="warranty__item--action" ref={refPopoverContainer}>
                    <span
                      className={`icon-dot-three ${isShowOption && item.id === idWarranty ? "active-option" : ""}`}
                      onClick={() => {
                        setIsShowOption(!isShowOption);
                        setIdWarranty(item.id);
                      }}
                    >
                      <Icon name="ThreeDotVertical" />
                    </span>

                    {isShowOption && item.id === idWarranty && (
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
                              setDataWarranty(item);
                            }}
                          >
                            <Icon name="Pencil" />
                            Sửa phiếu
                          </li>
                          <li
                            className="item-delete"
                            onClick={() => {
                              setIsShowOption(false);
                              showDialogConfirmDelete(item);
                            }}
                          >
                            <Icon name="Trash" />
                            Xóa phiếu
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
                      Hiện tại chưa có phiếu bảo hành nào. <br />
                      Hãy tạo mới phiếu bảo hành đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới phiếu bảo hành"
                  action={() => {
                    setDataWarranty(null);
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
      <ViewStatusWarrantyModal
        onShow={showModalView}
        idWarranty={idWarranty}
        onHide={() => {
          setShowModalView(false);
        }}
      />
      <AddWarrantyModal
        onShow={showModalAdd}
        data={dataWarranty}
        idCustomer={idCustomer}
        onHide={(reload) => {
          if (reload) {
            getListWarranty(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
