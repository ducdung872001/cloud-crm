import React, { Fragment, useContext, useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import SwiperCore, { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { formatCurrency } from "reborn-util";
import NummericInput from "components/input/numericInput";
import Icon from "components/icon";
import { ContextType, UserContext } from "contexts/userContext";
import { showToast } from "utils/common";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import PackageService from "services/PackageService";
import ShowModalPayment from "./ShowModalPayment";

SwiperCore.use([Navigation]);

export default function InformationServicePackage({ isShowDialog }) {
  const [dataService, setDataService] = useState(null);

  const { dataExpired, phone, dataInfoEmployee, showModalPackage, lastShowModalPayment, setShowModalPackage } = useContext(
    UserContext
  ) as ContextType;

  const [showModalPayment, setShowModalPayment] = useState<boolean>(false);

  const [lstPackage, setLstPackage] = useState([]);

  const [dataFilter, setDataFilter] = useState(null);

  useEffect(() => {
    if (dataFilter) {
      !lastShowModalPayment && dataExpired.numDay <= 0 && showDialogConfirm(dataFilter, "filter");
    }
  }, [dataFilter, lastShowModalPayment, dataExpired]);

  useEffect(() => {
    if (dataFilter && isShowDialog == "true") {
      dataExpired.numDay > 0 && dataExpired.numDay <= 14 && showDialogConfirm(dataFilter, "filter");
    }
  }, [dataFilter, isShowDialog, dataExpired]);

  useEffect(() => {
    if (dataFilter && showModalPackage) {
      showDialogConfirm(dataFilter, "filter");
    }
  }, [dataFilter, showModalPackage]);

  const handLstPackageService = async () => {
    const params = {
      status: 1,
      code: "CRM",
    };

    const response = await PackageService.lst(params);
    if (response.code === 0) {
      const result = response.result.items;

      const filterData = result
        .filter(
          (item) =>
            item.packageType === dataExpired.packageType &&
            item.period === dataExpired.period &&
            item.name.toLowerCase() === dataExpired.name.toLowerCase()
        )
        .map((el) => {
          return {
            ...el,
            extend: `${el.period < 10 ? `0${el.period} tháng` : el.period > 100 ? "Vĩnh viễn" : `${el.period} tháng`}`,
          };
        });

      if (filterData.length > 0) {
        setDataFilter(filterData[0]);
      }

      const converPackage = Array.from(new Set(result.map((el) => el.packageType)));

      const convertData = converPackage.map((packageType) => {
        const matchedItems = result.filter((item) => item.packageType === packageType);
        const changeMatchedItems = matchedItems.map((ul) => {
          const condition = ul.packageType;
          const settingMore = JSON.parse(ul.settingMore || "");

          return {
            id: ul.id,
            name: ul.name,
            extend: `${ul.period < 10 ? `0${ul.period} tháng` : ul.period > 100 ? "Vĩnh viễn" : `${ul.period} tháng`}`,
            code: condition === 1 ? "free" : condition === 2 ? "basic" : condition === 3 ? "silver" : condition === 4 ? "gold" : "diamond",
            function: JSON.parse(ul.features || "[]"),
            price: ul.priceDiscount,
            periodBonus: ul.periodBonus,
            descript: ul.content,
            account: settingMore.pricePerAccount,
            branch: settingMore.pricePerBranch,
            isMore: false,
            disabled: false,
            packageType: ul.packageType,
          };
        });

        const data = changeMatchedItems.length > 0 ? changeMatchedItems[0] : null;

        return {
          id: packageType,
          listData: changeMatchedItems,
          data: data,
          name:
            packageType === 1
              ? "Gói miễn phí"
              : packageType === 2
              ? "Gói cơ bản"
              : packageType === 3
              ? "Gói bạc"
              : packageType === 4
              ? "Gói vàng"
              : "Gói kim cương",
        };
      });

      setLstPackage(convertData);
    } else {
      showToast("Danh sách gói dịch vụ liên quan đang lỗi. Vui lòng thử lại sau!", "error");
    }
  };

  useEffect(() => {
    handLstPackageService();
  }, []);

  const index = lstPackage.findIndex((item) => item.name.toLowerCase() === dataExpired.name.toLowerCase());

  if (index !== -1) {
    // Duyệt từ phần tử trùng tên về phần tử đầu tiên của mảng
    for (let i = index - 1; i >= 0; i--) {
      // Cập nhật trường 'disabled' cho các phần tử phía trên
      lstPackage[i].data.disabled = true;
    }
  }

  const handChangeItemPackageMore = (item) => {
    const updatedItems = lstPackage.map((i) => ({
      ...i,
      data: {
        ...i.data,
        isMore: i.id === item.id ? !item.isMore : false,
      },
    }));

    setLstPackage(updatedItems);
  };

  const handChangeItemPackageCollapse = (item) => {
    const updatedItems = lstPackage.map((i) => ({
      ...i,
      data: {
        ...i.data,
        isMore: i.id === item.id ? false : false,
      },
    }));

    setLstPackage(updatedItems);
  };

  const handleChangeValueAccount = (e, id) => {
    const value = e.floatValue;

    setLstPackage((prev) =>
      prev.map((el) => {
        if (el.id == id) {
          return {
            ...el,
            data: {
              ...el.data,
              account: value,
            },
          };
        }

        return el;
      })
    );
  };

  const handleChangeValueBranch = (e, id) => {
    const value = e.floatValue;

    setLstPackage((prev) =>
      prev.map((el) => {
        if (el.id == id) {
          return {
            ...el,
            data: {
              ...el.data,
              branch: value,
            },
          };
        }

        return el;
      })
    );
  };

  const handleChangeValueExtend = (data, id) => {
    setLstPackage((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            data: data,
          };
        }

        return el;
      })
    );
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [dataResponse, setDataResponse] = useState(null);

  const handlePaymentProcessing = async (item, type) => {
    if (!item) return;

    const body = {
      packageId: type ? item.id : item.data.id,
      bsnId: dataInfoEmployee?.bsnId || dataExpired?.bsnId,
      code: "CRM",
    };

    const response = await PackageService.addOrgApp(body);

    if (response.code === 0) {
      setShowDialog(false);
      setContentDialog(null);
      setShowModalPayment(true);
      setDataResponse(response.result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
      setShowDialog(false);
      setContentDialog(null);
    }
  };

  const showDialogConfirm = (item, type?: string) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: `dialog-cancel ${!lastShowModalPayment && dataExpired.numDay <= 0 ? "dialog-bg" : ""}`,
      isCentered: true,
      isLoading: true,
      title: <Fragment>{`Xác nhận thanh toán`}</Fragment>,
      message: (
        <Fragment>
          Số tiền quý khách hàng cần thanh toán đối với <strong>{item.name.toLowerCase()}</strong> là{" "}
          <strong>{item.price || item.data.price ? formatCurrency(item.price || item.data.price) : "0đ"}</strong> cho{" "}
          {item.id === 5 ? (
            <span>
              <strong>{item.data.account || item.account}</strong> tài khoản và <strong>{item.data.branch || item.branch}</strong> chi nhánh
            </span>
          ) : (
            <span>
              lựa chọn <strong>{`${item.name || item.data.name}/${item.extend || item.data.extend}`}</strong>
            </span>
          )}
          .
        </Fragment>
      ),
      cancelText: !lastShowModalPayment && !showModalPackage ? "Đóng" : "Quay lại",
      cancelAction: () => {
        setShowModalPackage(false);
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handlePaymentProcessing(item, type);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <div className="lst__service--package">
      <Swiper
        key={`${index}`}
        slidesPerView={3}
        spaceBetween={20}
        className="mySwiper"
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        initialSlide={index}
      >
        <div className="swiper-button-next"></div>
        <div className="swiper-button-prev"></div>

        {lstPackage.map((item, idx) => {
          const condition = item.name.toLowerCase() !== dataExpired.name.toLowerCase();

          const maxHeight = lstPackage.reduce((max, item) => {
            return item.data.descript.length > max ? item.data.descript.length : max;
          }, 0);

          return (
            <SwiperSlide key={idx}>
              <div className="info__package" onClick={() => !item.data.disabled && setDataService(item)}>
                <div className="condition-name-gift">
                  <div
                    className={`name-package ${
                      item.data.code === "free"
                        ? "name-package--free"
                        : item.data.code === "basic"
                        ? "name-package--basic"
                        : item.data.code === "silver"
                        ? "name-package--silver"
                        : item.data.code === "gold"
                        ? "name-package--gold"
                        : "name-package--diamond"
                    }`}
                  >
                    {item.name}
                  </div>

                  {item.data.periodBonus && !item.data.disabled ? (
                    <div className="icon-gift">
                      <Icon name="Gift" />
                    </div>
                  ) : null}
                </div>

                <div className="action__choose--extend">
                  {item.data.code !== "diamond" ? (
                    <div className="wrapper__extend">
                      <span className="name-choose">Lựa chọn gói</span>

                      <div className="lst__extend">
                        {item.listData.map((ol, ids) => {
                          return (
                            <div
                              key={ids}
                              className={`item-extend ${item.data.disabled ? "item-extend-disabled" : ""}`}
                              onClick={() => {
                                if (!item.disabled) {
                                  handleChangeValueExtend(ol, item.id);
                                }
                              }}
                            >
                              {!item.data.disabled && item.data.id === ol.id && (
                                <span className="icon-check">
                                  <Icon name="Checked" />
                                </span>
                              )}
                              <span className="name-extend">{`${ol.name}/${ol.extend}`}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="info-extend--diamond">
                      <div className="extend-account">
                        <NummericInput
                          label="Số lượng tài khoản"
                          fill={true}
                          value={item.data.account}
                          placeholder="Nhập số lượng tài khoản"
                          onValueChange={(e) => {
                            handleChangeValueAccount(e, item.id);
                          }}
                        />
                      </div>
                      <div className="extend-branch">
                        <NummericInput
                          label="Số lượng chi nhánh"
                          fill={true}
                          value={item.data.branch}
                          placeholder="Nhập số lượng chi nhánh"
                          onValueChange={(e) => {
                            handleChangeValueBranch(e, item.id);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="desc-package" style={{ height: `${maxHeight + 30}px` }}>
                  {item.data.descript}
                </div>

                <div className="condition-price-gift">
                  <div className="price-package">
                    <div
                      className={`__price ${
                        item.data.code === "free"
                          ? "__price--free"
                          : item.data.code === "basic"
                          ? "__price--basic"
                          : item.data.code === "silver"
                          ? "__price--silver"
                          : item.data.code === "gold"
                          ? "__price--gold"
                          : "__price--diamond"
                      }`}
                    >
                      {formatCurrency(item.data.price, ".", "")}
                    </div>
                    <div className="hight-line--price">
                      <span className="unit">đ</span>
                      <span className="calc-year">/tháng</span>
                    </div>
                  </div>

                  {item.data.periodBonus && !item.data.disabled ? (
                    <div className="count-month-gift">{`Tặng ${
                      item.data.periodBonus < 10 ? `0${item.data.periodBonus}` : item.data.periodBonus
                    } tháng sử dụng`}</div>
                  ) : null}
                </div>

                <div className="lst__function" style={!item.data.isMore ? { height: "19rem" } : { height: "auto" }}>
                  {item.data.function.map((el, index) => {
                    return (
                      <div key={index} className="item-function">
                        <span className="icon">
                          <Icon name="CheckCircleFill" />
                        </span>
                        <span className="name-function">{el}</span>
                      </div>
                    );
                  })}

                  <div className={`action__more ${item.data.function.length <= 5 ? "d-none" : ""}`}>
                    {!item.data.isMore && <div className="bg__layer" />}
                    {!item.data.isMore ? (
                      <Tippy content="Xem thêm">
                        <span className="item-more see-more" onClick={() => handChangeItemPackageMore(item)}>
                          <Icon name="ChevronDown" />
                        </span>
                      </Tippy>
                    ) : (
                      <Tippy content="Thu gọn">
                        <span className="item-more collapse" onClick={() => handChangeItemPackageCollapse(item)}>
                          <Icon name="ChevronUp" />
                        </span>
                      </Tippy>
                    )}
                  </div>
                </div>

                <div className="add-extend">
                  <div
                    className={`add-extend-now ${
                      item.data.code === "free"
                        ? "add-extend-now--free"
                        : item.data.code === "basic"
                        ? "add-extend-now--basic"
                        : item.data.code === "silver"
                        ? "add-extend-now--silver"
                        : item.data.code === "gold"
                        ? "add-extend-now--gold"
                        : "add-extend-now--diamond"
                    } ${item.data.disabled ? "add-extend-now--disabled" : ""}`}
                    onClick={() => {
                      if (!item.data.disabled) {
                        if (item.data.code !== "diamond") {
                          showDialogConfirm(item);
                        } else {
                          if (!item.data.account || !item.data.branch) {
                            showToast(
                              `Bạn chưa nhập số lượng ${
                                !item.data.account && !item.data.branch
                                  ? "tài khoản, số lượng chi nhánh"
                                  : !item.data.account
                                  ? "tài khoản"
                                  : "chi nhánh"
                              }. Vui lòng nhập số lượng để ${condition ? "mua ngay" : "gia hạn"}`,
                              "warning"
                            );
                          } else {
                            showDialogConfirm(item);
                          }
                        }
                      }
                    }}
                  >
                    {condition ? "Mua ngay" : "Gia hạn"}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <ShowModalPayment
        onShow={showModalPayment}
        data={dataService ? { nameOrg: dataService.name, ...dataService.data } : null}
        phone={phone}
        dataResponse={dataResponse}
        onHide={() => setShowModalPayment(false)}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
