import React, { Fragment, useState, useEffect, useRef, memo, useContext } from "react";
import _ from "lodash";
import { IAddCustomerSendEmailModalProps } from "model/customer/PropsModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ISaveSearch } from "model/OtherModel";
import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";
import Loading from "components/loading";
import Button from "components/button/button";
import Checkbox from "components/checkbox/checkbox";
import SearchBox from "components/searchBox/searchBox";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, Pagination, PaginationProps } from "components/pagination/pagination";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import Female from "assets/images/avatar-female.jpg";
import Male from "assets/images/avatar-male.jpg";
import "./AddCustomerSendModal.scss";
import { ContextType, UserContext } from "contexts/userContext";

const AddCustomerSendModal = (props: IAddCustomerSendEmailModalProps) => {
  const { onShow, callBack, onHide, listIdCustomer, lstCustomer, type } = props;

  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [listCustomer, setListCustomer] = useState<ICustomerResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [dataSelectedCustomer, setDataSelectedCustomer] = useState([]);

  useEffect(() => {
    if (listIdCustomer && listIdCustomer.length > 0 && onShow) {
      setListIdChecked([...listIdCustomer]);
    }
  }, [listIdCustomer, onShow]);

  useEffect(() => {
    if (lstCustomer && lstCustomer.length > 0 && onShow) {
      setDataSelectedCustomer([...lstCustomer]);
    }
  }, [lstCustomer, onShow]);

  const [params, setParams] = useState<ICustomerSchedulerFilterRequest>({
    keyword: "",
  });

  useEffect(() => {
    if (dataBranch) {
      setParams({ ...params, branchId: dataBranch.value });
    }
  }, [dataBranch]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách khách hàng",
      is_active: true,
    },
  ]);

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

  const getListCustomer = async (paramsSearch: ICustomerSchedulerFilterRequest) => {
    setIsLoading(true);

    const response = await CustomerService.filter(paramsSearch);
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
      if (+result.total === 0 && !params.keyword && +result.page === 1) {
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
    if (isMounted.current === true && type == "3" && onShow) {
      getListCustomer(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [params, type, onShow]);

  const titles = ["STT", "Ảnh đại diện", "Tên khách hàng", "Số điện thoại", "Giới tính"];

  const dataFormat = ["text-center", "text-center", "", "", "text-center"];

  const handleUpdateCustomer = () => {
    onHide();
    setListIdChecked([]);
    setDataSelectedCustomer([]);
    callBack(listIdChecked, dataSelectedCustomer);
  };

  //! đoạn này xử lý vấn đề lấy hết những người đc chọn
  const checkAll = (isChecked: boolean) => {
    if (isChecked) {
      setDataSelectedCustomer &&
        setDataSelectedCustomer(
          listCustomer.map((item) => {
            return {
              id: item.id,
              avatar: item.avatar,
              name: item.name,
              gender: item.gender,
            };
          })
        );
      setListIdChecked &&
        setListIdChecked(
          listCustomer.map((i) => {
            return i.id;
          })
        );
    } else {
      setListIdChecked && setListIdChecked([]);
      setDataSelectedCustomer && setDataSelectedCustomer([]);
    }
  };

  //! đoạn này xử lý vấn đề chọn 1 người
  const checkOne = (id: number, isChecked: boolean, item: ICustomerResponse) => {
    if (isChecked) {
      const result = {
        id: item.id,
        avatar: item.avatar,
        name: item.name,
        gender: item.gender,
      };
      setDataSelectedCustomer([...dataSelectedCustomer, result]);
      setListIdChecked && setListIdChecked([...(listIdChecked ?? []), id]);
    } else {
      setDataSelectedCustomer && setDataSelectedCustomer(dataSelectedCustomer?.filter((el) => el.id !== id) ?? []);
      setListIdChecked && setListIdChecked(listIdChecked?.filter((i) => i !== id) ?? []);
    }
  };

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} size="xl" toggle={() => onHide()} className="modal-add-customer">
        <div className="wrapper-customer">
          <ModalHeader
            title="Chọn khách hàng"
            toggle={() => {
              onHide();
              setListIdChecked([]);
              setDataSelectedCustomer([]);
            }}
          />
          <ModalBody>
            <div className="search-customer">
              <SearchBox params={params} isSaveSearch={true} listSaveSearch={listSaveSearch} updateParams={(paramsNew) => setParams(paramsNew)} />
            </div>
            <CustomScrollbar width="100%" height="48rem">
              <div className="list-customer">
                {!isLoading && listCustomer && listCustomer.length > 0 ? (
                  <div className="table__add--customer">
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
                                    <span>{listIdChecked?.length} khách hàng</span>
                                    được chọn
                                  </li>
                                  <li>
                                    <Button className="confirm-action" onClick={handleUpdateCustomer}>
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
                            <Fragment key={index}>
                              <tr
                                onClick={() => {
                                  checkOne(item.id, !isChecked, item);
                                }}
                                className={`cursor-pointer ${isChecked ? " has-choose" : ""}`}
                              >
                                {listIdChecked && setListIdChecked && (
                                  <td className="checkbox" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox checked={isChecked} onChange={(e) => checkOne(item.id, e.target.checked, item)} />
                                  </td>
                                )}
                                <td className="text-center">{index + 1}</td>
                                <td className="text-center">
                                  <span key={item.id} className="avatar">
                                    <img src={item.avatar ? item.avatar : item.gender == 1 ? Female : Male} alt={item.name} />
                                  </span>
                                </td>
                                <td>{item.name}</td>
                                <td>{item.phoneMasked}</td>
                                <td className="text-center">{item.gender === 1 ? "Nữ" : "Nam"}</td>
                              </tr>
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : isLoading ? (
                  <Loading />
                ) : (
                  <Fragment>
                    {isNoItem ? (
                      <SystemNotification description={<span>Hiện tại chưa có khách hàng nào.</span>} type="no-item" />
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
            {listCustomer && listCustomer.length > 0 && (
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
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
};

export default memo(AddCustomerSendModal);
