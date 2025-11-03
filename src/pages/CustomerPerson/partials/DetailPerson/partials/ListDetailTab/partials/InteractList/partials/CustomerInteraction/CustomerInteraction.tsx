import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import "./CustomerInteraction.scss";

export default function CustomerInteraction(props) {
  const { idCustomer } = props;

  const [lstInteraction, setLstInteraction] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalInteraction, setTotalInteraction] = useState<number>(0);

  const getInteraction = async (id: number) => {
    if (!id) return;

    const params = {
      customerId: id,
      page: page,
      limit: 10,
    };

    const response = await CustomerService.descCustomerReport(params);

    if (response.code === 0) {
      const result = response.result.items;
      const totalItem = response.result.total;
      setHasMore((page - 1) * 10 + (result.length || 0) < totalItem);

      const newData = page == 1 ? [] : lstInteraction;

      (result || []).map((item) => {
        newData.push(item);
      });

      setLstInteraction(newData);
      setTotalInteraction(totalItem);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getInteraction(idCustomer);
  }, [idCustomer, page]);

  // xử lý cuộn lên thì call API
  const handleScroll = (e) => {
    const scrollBottom = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;

    if (scrollBottom && hasMore) {
      setPage((prevState) => prevState + 1);
    }
  };

  return (
    <div className="wrapper__interaction--customer" onScroll={handleScroll}>
      {lstInteraction && lstInteraction.length > 0 && (
        <Fragment>
          <div className="interaction__customer--left">
            {lstInteraction.map((item, idx) => {
              return (
                <div key={idx} className="item__left">
                  <div className="info__interaction">
                    <div className="icon-interaction">
                      {item.type === "exchange" ? (
                        <Icon name="Star" />
                      ) : item.type === "sms" ? (
                        <Icon name="SMS" />
                      ) : item.type === "call" ? (
                        <Icon name="PhoneFill" />
                      ) : (
                        <Icon name="EmailFill" />
                      )}
                    </div>
                    <div className="desc-interaction">
                      <p className="content">{item.content}</p>
                      <span className="time">{moment(item.createdAt).format("DD/MM/YYYY HH:mm")}</span>
                    </div>
                  </div>
                  <div className="vertical__line" />
                </div>
              );
            })}
          </div>
          <div className="interaction__customer--right">
            <div className="info__summary">
              <div className="number-interaction">
                <span className="desc-number">{totalInteraction}</span>
                <span className="name-number">Số lần tương tác</span>
              </div>
              <div className="last-contacted">
                <span className="key">Liên lạc lần cuối</span>
                <span className="value">Thứ hai, 12/11/2023 10:00</span>
              </div>
              <div className="last-modified">
                <span className="key">Sửa đổi lần cuối</span>
                <span className="value">Thứ hai, 12/11/2023 15:00</span>
              </div>
            </div>
          </div>
        </Fragment>
      )}

      {isLoading && <Loading />}

      {!isLoading && lstInteraction.length === 0 && (
        <div className="message-notification--interaction">
          <h2>Bạn chưa có tổng quan nào!</h2>
        </div>
      )}
    </div>
  );
}
