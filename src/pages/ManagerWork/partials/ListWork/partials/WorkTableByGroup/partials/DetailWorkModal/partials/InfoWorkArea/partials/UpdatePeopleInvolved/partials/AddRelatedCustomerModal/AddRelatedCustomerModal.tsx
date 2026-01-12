import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import { IAddRelatedCustomerModalProps } from "model/workOrder/PropsModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ISaveSearch } from "model/OtherModel";
import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";
import { IUpdateRelatedCustomerRequestModel } from "model/workOrder/WorkOrderRequestModel";
import Loading from "components/loading";
import Button from "components/button/button";
import Checkbox from "components/checkbox/checkbox";
import SearchBox from "components/searchBox/searchBox";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, Pagination, PaginationProps } from "components/pagination/pagination";
import CustomerService from "services/CustomerService";
import WorkOrderService from "services/WorkOrderService";
import { showToast } from "utils/common";
import Female from "assets/images/avatar-female.jpg";
import Male from "assets/images/avatar-male.jpg";
import "./AddRelatedCustomerModal.scss";

export default function AddRelatedCustomerModal(props: IAddRelatedCustomerModalProps) {
  const { onShow, onHide, idWork, listIdRelatedCustomer } = props;

  const isMounted = useRef(false);

  const [listCustomer, setListCustomer] = useState<ICustomerResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [params, setParams] = useState<ICustomerSchedulerFilterRequest>({
    keyword: "",
    limit: 0,
  });

  //! đoạn này xử lý vấn đề khi mà onShow thay đổi thì set lại params
  useEffect(() => {
    if (onShow) {
      setParams({ ...params, limit: 10 });
    }
  }, [onShow]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách khách hàng liên quan",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Khách hàng liên quan",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListCustomer = async (paramsSearch: ICustomerSchedulerFilterRequest) => {
    setIsLoading(true);

    const response = await CustomerService.filter(paramsSearch);

    if (response.code === 0) {
      const result = response.result;

      const checkDuplicates = [...result.items].filter((item) => {
        return !listIdRelatedCustomer.some((element) => {
          return element === item.id;
        });
      });

      setListCustomer(checkDuplicates);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && params.keyword == "" && +params.page === 1) {
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

    //! đoạn này ép đk call api
    if (isMounted.current === true && onShow && params.limit > 0 && params.page >= 1) {
      getListCustomer(params);

      const paramsTemp = _.cloneDeep(params);

      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }

      Object.keys(paramsTemp).map((key) => {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [params, onShow]);

  const titles = ["STT", "Ảnh đại diện", "Tên khách hàng", "Số điện thoại", "Giới tính"];

  const dataFormat = ["text-center", "", "", "", "text-center"];

  //! đoạn này xử lý vấn đề call API Update khách hàng liên quan
  const handleUpdateRelatedCustomer = async () => {
    const mergeRelatedCustomer = [...listIdChecked, ...listIdRelatedCustomer];

    const body: IUpdateRelatedCustomerRequestModel = {
      id: idWork,
      customers: JSON.stringify(mergeRelatedCustomer),
    };

    const response = await WorkOrderService.updateRelatedCustomer(body);

    if (response.code === 0) {
      showToast("Thêm khách hàng liên quan thành công", "success");
      setParams({ ...params, limit: 0, page: 0 });
      setListIdChecked([]);
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //! đoạn này xử lý vấn đề lấy hết những người đc chọn
  const checkAll = (isChecked: boolean) => {
    if (isChecked) {
      setListIdChecked &&
        setListIdChecked(
          listCustomer.map((i) => {
            return i.id;
          })
        );
    } else {
      setListIdChecked && setListIdChecked([]);
    }
  };

  //! đoạn này xử lý vấn đề chọn 1 người
  const checkOne = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setListIdChecked && setListIdChecked([...(listIdChecked ?? []), id]);
    } else {
      setListIdChecked && setListIdChecked(listIdChecked?.filter((i) => i !== id) ?? []);
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => onHide(false)}
        className="modal-add-related--customer"
      >
        <div className="wrapper-option-related--customer">
          <ModalHeader
            title="Chọn khách hàng liên quan"
            toggle={() => {
              setParams({ ...params, limit: 0, page: 0 });
              setListIdChecked([]);
              onHide(false);
            }}
          />
          <ModalBody>
            <div className="search-related--customer">
              <SearchBox
                params={params}
                isSaveSearch={true}
                listSaveSearch={listSaveSearch}
                placeholderSearch="Tìm kiếm khách hàng liên quan"
                updateParams={(paramsNew) => setParams(paramsNew)}
              />
            </div>
            <CustomScrollbar width="100%" height="57rem">
              <div className="list__option-related--customer">
                {!isLoading && listCustomer && listCustomer.length > 0 ? (
                  <div className="table__related--customer">
                    <table className="wrapper-table">
                      <thead>
                        <tr>
                          <th className="checkbox">
                            <Checkbox
                              indeterminate={listIdChecked?.length > 0 && listIdChecked?.length < listCustomer.length}
                              checked={listIdChecked?.length === listCustomer.length}
                              onChange={(e) => checkAll(e.target.checked)}
                            />
                            {listIdChecked?.length > 0 && (
                              <div className="view__count-click">
                                <ul className="d-flex align-items-center">
                                  <li className="select-count">
                                    Có
                                    <span>{listIdChecked?.length} người tham gia</span>
                                    được chọn
                                  </li>
                                  <li>
                                    <Button className="confirm-action" onClick={() => handleUpdateRelatedCustomer()}>
                                      Xác nhận
                                    </Button>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </th>
                          {titles?.map((title, idx) => (
                            <th key={idx} className={`${dataFormat ? dataFormat[idx] : ""}`}>
                              {title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {listCustomer.map((item, index) => {
                          const isChecked = listIdChecked && setListIdChecked && listIdChecked.some((id) => id === item.id) ? true : false;

                          return (
                            <tr
                              key={index}
                              onClick={() => {
                                checkOne(item.id, !isChecked);
                              }}
                              className={`cursor-pointer ${isChecked ? " has-choose" : ""}`}
                            >
                              {listIdChecked && setListIdChecked && (
                                <td className="checkbox" onClick={(e) => e.stopPropagation()}>
                                  <Checkbox checked={isChecked} onChange={(e) => checkOne(item.id, e.target.checked)} />
                                </td>
                              )}
                              <td className="text-center">{index + 1}</td>
                              <td>
                                <div className="avatar">
                                  {item.avatar ? (
                                    <img src={item.avatar} alt={item.name} />
                                  ) : item.gender == 1 ? (
                                    <img src={Male} alt={item.name} />
                                  ) : (
                                    <img src={Female} alt={item.name} />
                                  )}
                                </div>
                              </td>
                              <td>{item.name}</td>
                              <td>{item.phoneMasked}</td>
                              <td className="text-center">{item.gender === 1 ? "Nam" : "Nữ"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                  </div>
                ) : isLoading ? (
                  <Loading />
                ) : (
                  <Fragment>
                    {isNoItem ? (
                      <SystemNotification description={<span>Hiện tại chưa có Khách hàng liên quan nào.</span>} type="no-item" />
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
            </CustomScrollbar>
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
}
