import React, { Fragment, useEffect, useMemo, useState } from "react";
import Tippy from "@tippyjs/react";
import SwiperCore, { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { formatCurrency } from "reborn-util";
import Icon from "components/icon";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import NummericInput from "components/input/numericInput";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import PackageService from "services/PackageService";
import { IActionModal } from "model/OtherModel";
import "swiper/css";
import "swiper/css/navigation";
import "./ShowModalPackage.scss";

SwiperCore.use([Navigation]);

interface IShowModalPackageProps {
  onShow: boolean;
  data: any;
  onHide: () => void;
  callback: (data: any) => void;
}

export default function ShowModalPackage(props: IShowModalPackageProps) {
  const { onShow, onHide, callback, data } = props;

  const [lstPackage, setLstPackage] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasConfirm, setHasConfirm] = useState({
    isConfirm: false,
    data: null,
    title: null,
  });

  const handLstPackageService = async (data) => {
    setIsLoading(true);

    const params: any = {
      status: 1,
      code: data.code,
    };

    const response = await PackageService.lst(params);
    if (response.code === 0) {
      const result = response.result.items;

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
            periodBonus: ul.periodBonus,
            code: condition === 1 ? "free" : condition === 2 ? "basic" : condition === 3 ? "silver" : condition === 4 ? "gold" : "diamond",
            function: JSON.parse(ul.features || "[]"),
            price: ul.priceDiscount,
            descript: ul.content,
            account: settingMore.pricePerAccount,
            branch: settingMore.pricePerBranch,
            isMore: false,
            disabled: false,
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

    setIsLoading(false);
  };

  useEffect(() => {
    if (data && onShow) {
      handLstPackageService(data);
    }
  }, [onShow, data]);

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

  const actions = useMemo<IActionModal>(
    () => ({
      actions_left: {
        buttons: hasConfirm.isConfirm
          ? [
              {
                title: "Đóng",
                color: "warning",
                variant: "outline",
                callback: () => {
                  onHide();
                },
              },
            ]
          : [],
      },
      actions_right: {
        buttons: [
          ...(hasConfirm.isConfirm
            ? ([
                {
                  title: "Quay lại",
                  color: "primary",
                  variant: "outline",
                  callback: () => {
                    setHasConfirm({ ...hasConfirm, isConfirm: false });
                  },
                },
                {
                  title: "Xác nhận",
                  color: "primary",
                  callback: () => {
                    onHide();
                    callback(hasConfirm.data);
                  },
                },
              ] as any)
            : [
                {
                  title: "Đóng",
                  color: "primary",
                  variant: "outline",
                  callback: () => {
                    onHide();
                  },
                },
              ]),
        ],
      },
    }),
    [hasConfirm]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-show-package" size="xl">
        <div className="box-show-package">
          <ModalHeader title={"Chọn gói dịch vụ"} toggle={() => onHide()} />
          <ModalBody>
            <Fragment>
              {!hasConfirm.isConfirm ? (
                !isLoading && lstPackage && lstPackage.length > 0 ? (
                  <div className="lst__service--package">
                    <Swiper
                      slidesPerView={2}
                      spaceBetween={20}
                      navigation={{
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                      }}
                    >
                      <div className="swiper-button-next"></div>
                      <div className="swiper-button-prev"></div>

                      {lstPackage.map((item, idx) => {
                        const maxHeight = lstPackage.reduce((max, item) => {
                          return item.data.descript.length > max ? item.data.descript.length : max;
                        }, 0);

                        return (
                          <SwiperSlide key={idx}>
                            <div className="info__package">
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

                                {item.data.periodBonus && item.data.periodBonus > 0 ? (
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

                                {item.data.periodBonus && item.data.periodBonus > 0 ? (
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
                                        <Icon name="CheckFill" />
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
                                        const title = (
                                          <span>
                                            Số tiền quý khách cần thanh toán đối với <strong> {item.data.name.toLowerCase()}</strong> là
                                            <strong> {item.data.price ? `${formatCurrency(item.data.price, ".", "")}đ` : "0đ"}</strong> cho lựa chọn{" "}
                                            {""}
                                            <strong>
                                              {item.data.name.toLowerCase()}/{item.data.extend}
                                            </strong>
                                            .
                                          </span>
                                        );

                                        setHasConfirm({ isConfirm: true, data: item.data, title: title });
                                      } else {
                                        if (!item.data.account || !item.data.branch) {
                                          showToast(
                                            `Bạn chưa nhập số lượng ${
                                              !item.data.account && !item.data.branch
                                                ? "tài khoản, số lượng chi nhánh"
                                                : !item.data.account
                                                ? "tài khoản"
                                                : "chi nhánh"
                                            }. Vui lòng nhập số lượng để mua ngay`,
                                            "warning"
                                          );
                                        } else {
                                          const title = (
                                            <span>
                                              Số tiền quý khách cần thanh toán đối với {item.data.name.toLowerCase()} là
                                              <strong>{item.data.price ? `${formatCurrency(item.data.price, ".", "")}đ` : "0đ"}</strong> cho{" "}
                                              <strong>{item.data.account}</strong> tài khoản và ${item.data.branch} chi nhánh.
                                            </span>
                                          );

                                          setHasConfirm({ isConfirm: true, data: item.data, title: title });
                                        }
                                      }
                                    }
                                  }}
                                >
                                  Mua ngay
                                </div>
                              </div>
                            </div>
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  </div>
                ) : isLoading ? (
                  <Loading />
                ) : (
                  <SystemNotification description={<span>Ứng dụng bạn chọn chưa có gói giá nào.</span>} type="no-item" />
                )
              ) : (
                <div className="notification__confirm">
                  <p className="content-payment">{hasConfirm.title}</p>
                </div>
              )}
            </Fragment>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
