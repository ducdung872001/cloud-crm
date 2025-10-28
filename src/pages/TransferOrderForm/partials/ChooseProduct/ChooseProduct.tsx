import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import { ISaveSearch } from "model/OtherModel";
import { IWarehouseProResponse } from "model/adjustmentSlip/AdjustmentSlipResponseModel";
import { IWarehouseProFilterRequest } from "model/adjustmentSlip/AdjustmentSlipRequestModel";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import Button from "components/button/button";
import Checkbox from "components/checkbox/checkbox";
import SearchBox from "components/searchBox/searchBox";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, Pagination, PaginationProps } from "components/pagination/pagination";
import { showToast } from "utils/common";
import AdjustmentSlipService from "services/AdjustmentSlipService";
import "./ChooseProduct.scss";

export default function ChooseProduct(props) {
  const { onShow, onHide, lstBatchNoProduct, inventory, takeData } = props;

  const isMounted = useRef(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [lstProducts, setLstProducts] = useState<IWarehouseProResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [dataProduct, setDataProduct] = useState([]);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  useEffect(() => {
    if (onShow && lstBatchNoProduct.length === 0) {
      setDataProduct([]);
    }
  }, [onShow, lstBatchNoProduct]);

  const [params, setParams] = useState<IWarehouseProFilterRequest>({ keyword: "", limit: 0 });

  useEffect(() => {
    if (onShow && inventory) {
      setParams({ ...params, inventoryId: inventory?.value, limit: 10 });
    }
  }, [onShow, inventory]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách sản phẩm",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Sản phẩm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getLstProduct = async (paramsSearch: IWarehouseProFilterRequest) => {
    setIsLoading(true);

    const response = await AdjustmentSlipService.warehouse(paramsSearch);

    if (response.code === 0) {
      const result = response.result;

      const checkDuplicates = [...result.items].filter((item) => {
        return !lstBatchNoProduct.some((element) => {
          return element === item.batchNo;
        });
      });

      setLstProducts(checkDuplicates);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && +params.page === 1 && params.keyword !== "") {
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
    if (isMounted.current === true && onShow && params.limit > 0) {
      getLstProduct(params);

      const paramsTemp = _.cloneDeep(params);

      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }

      Object.keys(paramsTemp).map((key) => {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [params, onShow]);

  const titles = ["STT", "Ảnh sản phẩm", "Tên sản phẩm", "Số lô", "Đơn vị tính"];

  const dataFormat = ["text-center", "text-center", "", "text-center", "text-center"];

  //! đoạn này xử lý vấn đề lấy hết những sản phẩm đc chọn
  const checkAll = (isChecked: boolean, lstData: IWarehouseProResponse[]) => {
    if (isChecked) {
      setListIdChecked &&
        setListIdChecked(
          lstProducts.map((i) => {
            return i.id;
          })
        );
      setDataProduct && setDataProduct(lstData);
    } else {
      setListIdChecked && setListIdChecked([]);
    }
  };

  //! đoạn này xử lý vấn đề chọn 1 sản phẩm
  const checkOne = (id: number, isChecked: boolean, data: IWarehouseProResponse) => {
    if (isChecked) {
      setListIdChecked && setListIdChecked([...(listIdChecked ?? []), id]);
      setDataProduct && setDataProduct([...(dataProduct ?? []), data]);
    } else {
      setListIdChecked && setListIdChecked(listIdChecked?.filter((i) => i !== id) ?? []);
      setDataProduct && setDataProduct(dataProduct?.filter((i) => i.id !== id) ?? []);
    }
  };

  //! đoạn này xử lý vấn đề thêm mới sản phẩm vào phiếu
  const handleCreateProduct = async () => {
    setIsSubmit(true);
    takeData(dataProduct);
    onHide(false);
    setIsSubmit(false);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        size="lg"
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal__choose--product--slip"
      >
        <div className="wrapper__option--product">
          <ModalHeader
            title="Chọn sản phẩm"
            toggle={() => {
              !isSubmit && setListIdChecked([]);
              !isSubmit && onHide(false);
            }}
          />
          <ModalBody>
            <div className="search-product">
              <SearchBox
                params={params}
                isSaveSearch={true}
                listSaveSearch={listSaveSearch}
                placeholderSearch="Tìm kiếm tên sản phẩm"
                updateParams={(paramsNew) => setParams(paramsNew)}
              />
            </div>
            <div className="list__option--product">
              {!isLoading && lstProducts && lstProducts.length > 0 ? (
                <div className="table__product">
                  <table className="wrapper-table">
                    <thead>
                      <tr>
                        <th className="checkbox">
                          <Checkbox
                            indeterminate={listIdChecked?.length > 0 && listIdChecked?.length < lstProducts.length}
                            checked={listIdChecked?.length === lstProducts.length}
                            onChange={(e) => checkAll(e.target.checked, lstProducts)}
                          />
                          {listIdChecked?.length > 0 && (
                            <div className="view__count-click">
                              <ul className="d-flex align-items-center">
                                <li className="select-count">
                                  Có
                                  <span>{listIdChecked?.length} sản phẩm</span>
                                  được chọn
                                </li>
                                <li>
                                  <Button
                                    className="confirm-action"
                                    disabled={isSubmit}
                                    onClick={() => {
                                      handleCreateProduct();
                                    }}
                                  >
                                    Xác nhận
                                    {isSubmit && <Icon name="Loading" />}
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
                      {lstProducts.map((item, index) => {
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
                              <td>
                                <div key={item.id} className="avatar">
                                  <Image src={item.productAvatar} alt={item.productName} />
                                </div>
                              </td>
                              <td>{item.productName}</td>
                              <td className="text-center">{item.batchNo}</td>
                              <td className="text-center">{item.unitName}</td>
                            </tr>
                          </Fragment>
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
                  {!isNoItem ? (
                    <SystemNotification
                      description={
                        <span>
                          Hiện tại <strong>{inventory?.label}</strong> chưa có sản phẩm nào.
                        </span>
                      }
                      type="no-item"
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
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
}
