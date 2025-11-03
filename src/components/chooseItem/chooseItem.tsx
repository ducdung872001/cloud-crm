import React, { Fragment, useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import Loading from "components/loading";
import Image from "components/image";
import Modal, { ModalHeader, ModalBody } from "components/modal/modal";
// import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { formatCurrency, showToast } from "utils/common";
// import OrderService from "services/OrderService";
// import ProductOrProductService from "services/ProductOrProductService";
import "./chooseItem.scss";
import { IFilterItem } from "types/OtherModel";
import ProductService from "services/ProductService";

interface IChooseItemProps {
  onShow: boolean;
  callback: (data) => void;
  onHide: (reload?: boolean) => void;
  type?: "order" | "sales";
}

export default function ChooseItem(props: IChooseItemProps) {
  const { onShow, onHide, callback, type } = props;

  const listFilter = useMemo(
    () =>
      [
        // {
        //   key: "is_product",
        //   name: "Loại thuốc",
        //   type: "select",
        //   list: [
        //     {
        //       label: "Thuốc",
        //       value: "true",
        //     },
        //     {
        //       label: "Không phải thuốc",
        //       value: "false",
        //     },
        //   ],
        //   is_featured: true,
        //   value: "",
        // },
      ] as IFilterItem[],
    []
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lstItems, setLstItems] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [responseData, setResponseData] = useState({ total: 0, page: 1 });
  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    setLstItems([]);
  }, [onShow]);

  const getListItems = async (paramsSearch) => {
    setIsLoading(true);

    let response = null;

    if (type === "order") {
      response = await ProductService.list(paramsSearch);
    } else {
      // response = await ProductOrProductService.search(paramsSearch);
    }
    if (response) {
      const result = response.result.items;
      if (response.result.page === responseData.page) {
        setResponseData({
          total: response.result.total,
          page: response.result.page,
        });
        setLstItems(result);
      } else {
        setResponseData({
          total: response.result.total,
          page: response.result.page,
        });

        const newData = lstItems;

        (result || []).map((item) => {
          newData.push(item);
        });

        setLstItems(newData);
      }
      if (+response.total === 0 && params.name === "") {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow) {
      getListItems(params);
    }
  }, [onShow, params, type]);

  const titles = ["STT", "Ảnh sản phẩm", "Tên sản phẩm", "Đơn vị tính", ...(type === "order" ? ["Đơn giá"] : ["Giá bán"])];

  const dataFormat = ["text-center", "image", "", "", "", "text-right"];

  const handleScroll = (e) => {
    if (isLoading || responseData.total === lstItems.length) {
      return;
    }
    const lastScroll = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (lastScroll) {
      setParams({ ...params, page: responseData.page + 1 });
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        size="xxl"
        isCentered={true}
        staticBackdrop={true}
        toggle={() => onHide(false)}
        className={classNames("modal__choose--item")}
      >
        <div className="box__choose">
          <ModalHeader title="Chọn sản phẩm" toggle={() => onHide(false)} />
          <ModalBody>
            <div className="lst__items">
              <SearchBox
                name="Sản phẩm"
                params={params}
                updateParams={(paramsNew) => {
                  setParams(paramsNew);
                }}
                isFilter={type === "order" ? true : false}
                listFilterItem={listFilter}
                autoFocusSearch={true}
              />

              <div className="view__items--product" onScroll={(e) => handleScroll(e)}>
                {lstItems && lstItems?.length > 0 && (
                  <div className="table__search--product">
                    <table className="table__product">
                      <thead>
                        <tr>
                          {titles?.map((title, idx) => (
                            <th key={idx} className={`${dataFormat ? dataFormat[idx] : ""}`}>
                              {title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lstItems.map((item, idx) => {
                          return (
                            <tr
                              key={idx}
                              onClick={() => {
                                callback(item);
                                onHide(false);
                              }}
                              className="item-product"
                            >
                              <td className="text-center">
                                <span>{idx + 1}</span>
                              </td>
                              <td className="image">
                                {item.avatar ? (
                                  <Image src={item.avatar} alt={item.name} />
                                ) : (
                                  <Image src={"./assets/5f7944ea4e383956a0fd.png"} alt={item.name} />
                                )}
                              </td>
                              {/* <td>
                                <span>{item.product_code}</span>
                              </td> */}
                              <td>
                                <span>{item.name}</span>
                              </td>
                              <td>
                                <span>{type === "order" ? item.unitName : item.unitName}</span>
                              </td>
                              <td>
                                <span>{formatCurrency(item.price, ",")}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {isLoading && <Loading />}

                {!isLoading && lstItems?.length === 0 && (
                  <Fragment>
                    {isNoItem ? (
                      <SystemNotification description={<span>Hiện tại chưa có sản phẩm nào.</span>} type="no-item" />
                    ) : (
                      <SystemNotification
                        description={
                          <span>
                            Không có dữ liệu trùng khớp. <br />
                            Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                          </span>
                        }
                        type="no-result"
                      />
                    )}
                  </Fragment>
                )}
              </div>
            </div>
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
}
