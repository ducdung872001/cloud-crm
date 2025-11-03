import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddTipRoseProps } from "model/tipUser/PropsModel";
import { ICardFilterRequest } from "model/card/CardRequestModel";
import { IProductFilterRequest } from "model/product/ProductRequestModel";
import { IServiceFilterRequest } from "model/service/ServiceRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import ProductService from "services/ProductService";
import ServiceService from "services/ServiceService";
import CardServiceService from "services/CardServiceService";
import "./AddTipRose.scss";

export default function AddTipRose(props: IAddTipRoseProps) {
  const { onShow, onHide, data, dataEmployee } = props;

  const focusedElement = useActiveElement();

  const refContainerRate = useRef();
  const refOptionRate = useRef();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  // Theo giá trị đơn hàng
  const [isOptionRate, setIsOptionRate] = useState<boolean>(false);
  const [indexRate, setIndexRate] = useState<number>(null);
  const [addOrderValue, setAddOrderValue] = useState([
    {
      value: "",
      benefitRate: "",
      type: "0",
    },
  ]);

  useOnClickOutside(refOptionRate, () => setIsOptionRate(false), ["option-rate"]);

  const dataRate = [
    {
      type: "0",
      name: "%",
    },
    {
      type: "1",
      name: "VND",
    },
  ];

  const values = useMemo(
    () => ({
      idEmployee: dataEmployee?.id,
      type: data?.type ?? "1",
    }),
    [data, onShow, dataEmployee]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // Theo mức hưởng
  const [addService, setAddService] = useState([{ value: null, label: "", avatar: "" }]);
  const [addProduct, setAddProduct] = useState([{ value: null, label: "", avatar: "" }]);
  const [addCardService, setAddCardService] = useState([{ value: null, label: "", avatar: "" }]);

  //✍️ Theo số lượng
  const [addQtyProduct, setAddQtyProduct] = useState([{ product: null, qty: "", qtyLevel: "", type: "1" }]);
  const [addQtyService, setAddQtyService] = useState([{ service: null, qty: "", qtyLevel: "", type: "1" }]);
  const [addQtyCardService, setAddQtyCardService] = useState([{ card: null, qty: "", qtyLevel: "", type: "1" }]);

  //! xử lý vấn đề thay đổi số lượng sản phẩm
  const handleChangeValueQtyProduct = (e, idx) => {
    setAddQtyProduct((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, qty: e.floatValue };
        }
        return obj;
      })
    );
  };

  //! xử lý mức hưởng sản phẩm
  const handleChangeValueQtyProductLevel = (e, idx) => {
    setAddQtyProduct((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, qtyLevel: e.floatValue };
        }
        return obj;
      })
    );
  };

  //! xử lý vấn đề xóa sản phẩm
  const handleRemoveQtyProduct = (idx) => {
    const newQtyProduct = [...addQtyProduct];
    newQtyProduct.splice(idx, 1);
    setAddQtyProduct(newQtyProduct);
  };

  //! xử lý vấn đề thay đổi số lượng dịch vụ
  const handleChangeValueQtyService = (e, idx) => {
    setAddQtyService((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, qty: e.floatValue };
        }
        return obj;
      })
    );
  };

  //! xử lý mức hưởng dịch vụ
  const handleChangeValueQtyServiceLevel = (e, idx) => {
    setAddQtyService((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, qtyLevel: e.floatValue };
        }
        return obj;
      })
    );
  };

  //! xử lý vấn đề xóa dịch vụ
  const handleRemoveQtyService = (idx) => {
    const newQtyService = [...addQtyService];
    newQtyService.splice(idx, 1);
    setAddQtyService(newQtyService);
  };

  //* xử lý vấn đề thay đổi số lượng dịch vụ
  const handleChangeValueQtyCard = (e, idx) => {
    setAddQtyCardService((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, qty: e.floatValue };
        }
        return obj;
      })
    );
  };

  //* xử lý mức hưởng dịch vụ
  const handleChangeValueQtyCardLevel = (e, idx) => {
    setAddQtyCardService((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, qtyLevel: e.floatValue };
        }
        return obj;
      })
    );
  };

  //* xử lý vấn đề xóa dịch vụ
  const handleRemoveQtyCard = (idx) => {
    const newQtyCardService = [...addQtyCardService];
    newQtyCardService.splice(idx, 1);
    setAddQtyCardService(newQtyCardService);
  };

  const [valueBenefitRate, setValueBenefitRate] = useState({
    value: 0,
    type: "0",
  });

  // ----------- 👀 sản phẩm 👀 -------------- //
  const loadedOptionProduct = async (search, loadedOptions, { page }) => {
    const param: IProductFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ProductService.list(param);

    if (response.code === 0) {
      const result = response.result.items || [];

      const dataOption = result.filter((item) => {
        return formData.values.type == "2"
          ? !addProduct.some((el) => el.value === item.id)
          : !addQtyProduct.some((el) => el.product?.value === item.id);
      });

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  //! đoạn này xử lý vấn đề hiển thị hình ảnh sản phẩm
  const formatOptionLabelProduct = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //* đoạn này xử lý vấn đề thay đổi sản phẩm
  const handleChangeValueProduct = (e, idx) => {
    if (formData?.values.type == "2") {
      setAddProduct((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, value: e.value, label: e.label, avatar: e.avatar };
          }
          return obj;
        })
      );
    } else {
      setAddQtyProduct((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, product: e };
          }
          return obj;
        })
      );
    }
  };

  //* đoạn này xử lý vấn đề xóa sản phẩm
  const handleDeleteProduct = (idx) => {
    const newDataProduct = [...addProduct];
    newDataProduct.splice(idx, 1);
    setAddProduct(newDataProduct);
  };

  // ----------- 👀 dịch vụ 👀 -------------- //
  const loadedOptionService = async (search, loadedOptions, { page }) => {
    const param: IServiceFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ServiceService.filter(param);

    if (response.code === 0) {
      const result = response.result.items;

      const dataOption = result.filter((item) => {
        return formData.values.type == "2"
          ? !addService.some((el) => el.value === item.id)
          : !addQtyService.some((el) => el.service?.value == item.id);
      });

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  //! đoạn này xử lý vấn đề hiển thị hình ảnh dịch vụ
  const formatOptionLabelService = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueService = (e, idx) => {
    if (formData?.values.type == "2") {
      setAddService((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, value: e.value, label: e.label, avatar: e.avatar };
          }
          return obj;
        })
      );
    } else {
      setAddQtyService((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, service: e };
          }
          return obj;
        })
      );
    }
  };

  //* đoạn này xử lý vấn đề xóa dịch vụ
  const handleDeleteService = (idx) => {
    const newDataService = [...addService];
    newDataService.splice(idx, 1);
    setAddService(newDataService);
  };

  // ----------- 👀 thẻ dịch vụ 👀 -------------- //

  //! đoạn này xử lý vấn đề call api lấy danh sách thẻ
  const loadedOptionCard = async (search, loadedOptions, { page }) => {
    const param: ICardFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await CardServiceService.list(param);

    if (response.code === 0) {
      const result = response.result;

      const dataOption = result.filter((item) => {
        return formData.values.type == "2"
          ? !addCardService.some((el) => el.value === item.id)
          : !addQtyCardService.some((el) => el.card?.value == item.id);
      });

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  //! đoạn này xử lý vấn đề hiển thị hình ảnh thẻ dịch vụ
  const formatOptionLabelCard = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý vấn đề thay đổi thẻ dịch vụ
  const handleChangeValueCard = (e, idx) => {
    if (formData?.values.type == "2") {
      setAddCardService((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, value: e.value, label: e.label, avatar: e.avatar };
          }
          return obj;
        })
      );
    } else {
      setAddQtyCardService((current) =>
        current.map((obj, index) => {
          if (index === idx) {
            return { ...obj, card: e };
          }
          return obj;
        })
      );
    }
  };

  //* đoạn này xử lý vấn đề xóa dịch vụ
  const handleDeleteCardService = (idx) => {
    const newDataCardService = [...addCardService];
    newDataCardService.splice(idx, 1);
    setAddCardService(newDataCardService);
  };

  const validations: IValidation[] = [
    {
      name: "type",
      rules: "required",
    },
  ];

  const handleChangeValueOrder = (e, idx) => {
    setAddOrderValue((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, value: e.target.value };
        }
        return obj;
      })
    );
  };

  const handleChangeValueRate = (e, idx) => {
    setAddOrderValue((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, benefitRate: e.floatValue };
        }
        return obj;
      })
    );
  };

  const handleRemoveRate = (idx) => {
    const result = [...addOrderValue];
    result.splice(idx, 1);
    setAddOrderValue(result);
  };

  const listField = useMemo(
    () =>
      [
        {
          label: "Cách tính",
          name: "type",
          type: "radio",
          required: true,
          options: [
            {
              value: "1",
              label: "Theo giá trị đơn hàng",
            },
            {
              value: "2",
              label: "Theo mức hưởng",
            },
            {
              value: "3",
              label: "Theo số lượng",
            },
          ],
        },

        ...((formData?.values?.type == 1
          ? [
              {
                name: "orderValue",
                type: "custom",
                snippet: (
                  <div className="wrapper__order--value">
                    <div
                      className="action__add--value"
                      onClick={() =>
                        setAddOrderValue([
                          ...addOrderValue,
                          {
                            value: "",
                            benefitRate: "",
                            type: "0",
                          },
                        ])
                      }
                    >
                      <Icon name="PlusCircleFill" />
                      Thêm giá trị
                    </div>

                    {addOrderValue.map((item, idx) => {
                      return (
                        <div key={idx} className="order-item">
                          <Input
                            fill={true}
                            value={item.value}
                            onChange={(e) => handleChangeValueOrder(e, idx)}
                            placeholder="Nhập giá trị"
                            className="value-order"
                          />

                          <div className="benefit-rate">
                            <NummericInput
                              fill={true}
                              value={item.benefitRate}
                              onValueChange={(e) => handleChangeValueRate(e, idx)}
                              placeholder="Mức hưởng"
                              className="value-rate"
                            />
                            <div className={`option-rate ${isOptionRate && indexRate == idx ? "prioritize" : ""}`} ref={refContainerRate}>
                              <div
                                className="select__rate"
                                onClick={() => {
                                  setIndexRate(idx);
                                  setIsOptionRate(!isOptionRate);
                                }}
                              >
                                {item.type == "0" ? "%" : "VND"}
                                <Icon name="ChevronDown" />
                              </div>

                              {isOptionRate && indexRate == idx && (
                                <ul className="menu__option--rate" ref={refOptionRate}>
                                  {dataRate.map((el, index) => (
                                    <li
                                      key={index}
                                      className={`item--rate ${item?.type === el.type ? "active__item--rate" : ""}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setAddOrderValue((current) =>
                                          current.map((obj, i) => {
                                            if (i === idx) {
                                              return { ...obj, type: el.type };
                                            }

                                            return obj;
                                          })
                                        );
                                        setIsOptionRate(false);
                                      }}
                                    >
                                      {el.name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {addOrderValue.length > 1 && (
                              <div className="action__remove--rate" title="Xóa" onClick={() => handleRemoveRate(idx)}>
                                <Icon name="Trash" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ),
              },
            ]
          : formData?.values.type == 2
          ? [
              {
                name: "benefitRate",
                type: "custom",
                snippet: (
                  <div className="wrapper__benefit--rate">
                    <div className="value-benefit">
                      <NummericInput
                        label="Mức hưởng"
                        fill={true}
                        required={true}
                        value={valueBenefitRate?.value}
                        className="value-rate"
                        onValueChange={(e) => setValueBenefitRate({ ...valueBenefitRate, value: e.floatValue })}
                      />
                      <div className="option-rate" ref={refContainerRate}>
                        <div
                          className="select__rate"
                          onClick={() => {
                            setIsOptionRate(!isOptionRate);
                          }}
                        >
                          {valueBenefitRate.type == "0" ? "%" : "VND"}
                          <Icon name="ChevronDown" />
                        </div>

                        {isOptionRate && (
                          <ul className="menu__option--rate" ref={refOptionRate}>
                            {dataRate.map((el, index) => (
                              <li
                                key={index}
                                className={`item--rate ${valueBenefitRate?.type === el.type ? "active__item--rate" : ""}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setValueBenefitRate({ ...valueBenefitRate, type: el.type });
                                  setIsOptionRate(false);
                                }}
                              >
                                {el.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="wrapper__apply-all">
                      <span className="title-sub">Áp dụng cho</span>

                      <div className="list__product">
                        {addProduct.map((el, index) => {
                          return (
                            <div key={index} className="item-product">
                              <div className="info-product">
                                <SelectCustom
                                  id="productId"
                                  name="productId"
                                  options={[]}
                                  fill={true}
                                  value={el.value ? el : ""}
                                  onChange={(e) => handleChangeValueProduct(e, index)}
                                  isAsyncPaginate={true}
                                  isFormatOptionLabel={true}
                                  placeholder="Chọn sản phẩm"
                                  additional={{
                                    page: 1,
                                  }}
                                  loadOptionsPaginate={loadedOptionProduct}
                                  formatOptionLabel={formatOptionLabelProduct}
                                />
                              </div>

                              <div className="action_product">
                                <span className="add-product" onClick={() => setAddProduct([...addProduct, { value: null, label: "", avatar: "" }])}>
                                  <Icon name="PlusCircleFill" />
                                </span>
                                {addProduct.length > 1 && (
                                  <span className="remove-product" onClick={() => handleDeleteProduct(index)}>
                                    <Icon name="Trash" />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="list__service">
                        {addService.map((el, index) => {
                          return (
                            <div key={index} className="item-service">
                              <div className="info-service">
                                <SelectCustom
                                  id="serviceId"
                                  name="serviceId"
                                  options={[]}
                                  fill={true}
                                  value={el.value ? el : ""}
                                  onChange={(e) => handleChangeValueService(e, index)}
                                  isAsyncPaginate={true}
                                  isFormatOptionLabel={true}
                                  placeholder="Chọn dịch vụ"
                                  additional={{
                                    page: 1,
                                  }}
                                  loadOptionsPaginate={loadedOptionService}
                                  formatOptionLabel={formatOptionLabelService}
                                />
                              </div>
                              <div className="action_service">
                                <span className="add-service" onClick={() => setAddService([...addService, { value: null, label: "", avatar: "" }])}>
                                  <Icon name="PlusCircleFill" />
                                </span>
                                {addService.length > 1 && (
                                  <span className="remove-service" onClick={() => handleDeleteService(index)}>
                                    <Icon name="Trash" />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="list__card--service">
                        {addCardService.map((el, index) => {
                          return (
                            <div key={index} className="item__card">
                              <div className="info__card">
                                <SelectCustom
                                  id="cardServiceId"
                                  name="cardServiceId"
                                  options={[]}
                                  fill={true}
                                  value={el.value ? el : ""}
                                  onChange={(e) => handleChangeValueCard(e, index)}
                                  isAsyncPaginate={true}
                                  isFormatOptionLabel={true}
                                  placeholder="Chọn thẻ dịch vụ"
                                  additional={{
                                    page: 1,
                                  }}
                                  loadOptionsPaginate={loadedOptionCard}
                                  formatOptionLabel={formatOptionLabelCard}
                                />
                              </div>
                              <div className="action_card">
                                <span
                                  className="add-card"
                                  onClick={() => setAddCardService([...addCardService, { value: null, label: "", avatar: "" }])}
                                >
                                  <Icon name="PlusCircleFill" />
                                </span>
                                {addCardService.length > 1 && (
                                  <span className="remove-card" onClick={() => handleDeleteCardService(index)}>
                                    <Icon name="Trash" />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ),
              },
            ]
          : [
              {
                name: "qtyAll",
                type: "custom",
                snippet: (
                  <div className="wrapper__all--qty">
                    <div className="list__qty--product">
                      <div
                        className="add-product"
                        onClick={() => setAddQtyProduct([...addQtyProduct, { product: null, qty: "", qtyLevel: "", type: "1" }])}
                      >
                        <Icon name="PlusCircleFill" />
                        Thêm sản phẩm
                      </div>

                      <div className="product">
                        {addQtyProduct.map((item, idx) => {
                          return (
                            <div key={idx} className="item product-item">
                              <div className="option option__product">
                                <SelectCustom
                                  id="productId"
                                  name="productId"
                                  options={[]}
                                  fill={true}
                                  value={item.product}
                                  onChange={(e) => handleChangeValueProduct(e, idx)}
                                  isAsyncPaginate={true}
                                  isFormatOptionLabel={true}
                                  placeholder="Chọn sản phẩm"
                                  additional={{
                                    page: 1,
                                  }}
                                  loadOptionsPaginate={loadedOptionProduct}
                                  formatOptionLabel={formatOptionLabelProduct}
                                />
                              </div>
                              <div className="qty qty__product">
                                <NummericInput
                                  name="qty"
                                  fill={true}
                                  value={item.qty}
                                  onValueChange={(e) => handleChangeValueQtyProduct(e, idx)}
                                  placeholder="Số lượng"
                                />
                              </div>
                              <div className="benefit-rate">
                                <NummericInput
                                  fill={true}
                                  value={item.qtyLevel}
                                  onValueChange={(e) => handleChangeValueQtyProductLevel(e, idx)}
                                  placeholder="Mức hưởng"
                                  className="value-rate"
                                />
                                <div className={`option-rate ${isOptionRate && indexRate == idx ? "prioritize" : ""}`} ref={refContainerRate}>
                                  <div
                                    className="select__rate"
                                    onClick={() => {
                                      setIndexRate(idx);
                                      setIsOptionRate(!isOptionRate);
                                    }}
                                  >
                                    {item.type == "0" ? "%" : "VND"}
                                    <Icon name="ChevronDown" />
                                  </div>

                                  {isOptionRate && indexRate == idx && (
                                    <ul className="menu__option--rate" ref={refOptionRate}>
                                      {dataRate.map((el, index) => (
                                        <li
                                          key={index}
                                          className={`item--rate ${item?.type === el.type ? "active__item--rate" : ""}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setAddQtyProduct((current) =>
                                              current.map((obj, i) => {
                                                if (i === idx) {
                                                  return { ...obj, type: el.type };
                                                }

                                                return obj;
                                              })
                                            );
                                            setIsOptionRate(false);
                                          }}
                                        >
                                          {el.name}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>

                              {addQtyProduct.length > 1 && (
                                <div className="action__remove" title="Xóa" onClick={() => handleRemoveQtyProduct(idx)}>
                                  <Icon name="Trash" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="list__qty--service">
                      <div
                        className="add-service"
                        onClick={() => setAddQtyService([...addQtyService, { service: null, qty: "", qtyLevel: "", type: "1" }])}
                      >
                        <Icon name="PlusCircleFill" />
                        Thêm dịch vụ
                      </div>

                      <div className="service">
                        {addQtyService.map((item, idx) => {
                          return (
                            <div key={idx} className="item service-item">
                              <div className="option option__service">
                                <SelectCustom
                                  id="serviceId"
                                  name="serviceId"
                                  options={[]}
                                  fill={true}
                                  value={item.service}
                                  onChange={(e) => handleChangeValueService(e, idx)}
                                  isAsyncPaginate={true}
                                  isFormatOptionLabel={true}
                                  placeholder="Chọn dịch vụ"
                                  additional={{
                                    page: 1,
                                  }}
                                  loadOptionsPaginate={loadedOptionService}
                                  formatOptionLabel={formatOptionLabelService}
                                />
                              </div>
                              <div className="qty qty__service">
                                <NummericInput
                                  name="qty"
                                  fill={true}
                                  value={item.qty}
                                  onValueChange={(e) => handleChangeValueQtyService(e, idx)}
                                  placeholder="Số lượng"
                                />
                              </div>
                              <div className="benefit-rate">
                                <NummericInput
                                  fill={true}
                                  value={item.qtyLevel}
                                  onValueChange={(e) => handleChangeValueQtyServiceLevel(e, idx)}
                                  placeholder="Mức hưởng"
                                  className="value-rate"
                                />
                                <div className={`option-rate ${isOptionRate && indexRate == idx ? "prioritize" : ""}`} ref={refContainerRate}>
                                  <div
                                    className="select__rate"
                                    onClick={() => {
                                      setIndexRate(idx);
                                      setIsOptionRate(!isOptionRate);
                                    }}
                                  >
                                    {item.type == "0" ? "%" : "VND"}
                                    <Icon name="ChevronDown" />
                                  </div>

                                  {isOptionRate && indexRate == idx && (
                                    <ul className="menu__option--rate" ref={refOptionRate}>
                                      {dataRate.map((el, index) => (
                                        <li
                                          key={index}
                                          className={`item--rate ${item?.type === el.type ? "active__item--rate" : ""}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setAddQtyService((current) =>
                                              current.map((obj, i) => {
                                                if (i === idx) {
                                                  return { ...obj, type: el.type };
                                                }

                                                return obj;
                                              })
                                            );
                                            setIsOptionRate(false);
                                          }}
                                        >
                                          {el.name}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>

                              {addQtyService.length > 1 && (
                                <div className="action__remove" title="Xóa" onClick={() => handleRemoveQtyService(idx)}>
                                  <Icon name="Trash" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="list__qty--card">
                      <div
                        className="add-card"
                        onClick={() => setAddQtyCardService([...addQtyCardService, { card: null, qty: "", qtyLevel: "", type: "1" }])}
                      >
                        <Icon name="PlusCircleFill" />
                        Thêm thẻ dịch vụ
                      </div>

                      <div className="card">
                        {addQtyCardService.map((item, idx) => {
                          return (
                            <div key={idx} className="item card-item">
                              <div className="option option__card">
                                <SelectCustom
                                  id="cardId"
                                  name="cardId"
                                  options={[]}
                                  fill={true}
                                  value={item.card}
                                  onChange={(e) => handleChangeValueCard(e, idx)}
                                  isAsyncPaginate={true}
                                  isFormatOptionLabel={true}
                                  placeholder="Chọn thẻ dịch vụ"
                                  additional={{
                                    page: 1,
                                  }}
                                  loadOptionsPaginate={loadedOptionCard}
                                  formatOptionLabel={formatOptionLabelCard}
                                />
                              </div>
                              <div className="qty qty__card">
                                <NummericInput
                                  name="qty"
                                  fill={true}
                                  value={item.qty}
                                  onValueChange={(e) => handleChangeValueQtyCard(e, idx)}
                                  placeholder="Số lượng"
                                />
                              </div>
                              <div className="benefit-rate">
                                <NummericInput
                                  fill={true}
                                  value={item.qtyLevel}
                                  onValueChange={(e) => handleChangeValueQtyCardLevel(e, idx)}
                                  placeholder="Mức hưởng"
                                  className="value-rate"
                                />
                                <div className={`option-rate ${isOptionRate && indexRate == idx ? "prioritize" : ""}`} ref={refContainerRate}>
                                  <div
                                    className="select__rate"
                                    onClick={() => {
                                      setIndexRate(idx);
                                      setIsOptionRate(!isOptionRate);
                                    }}
                                  >
                                    {item.type == "0" ? "%" : "VND"}
                                    <Icon name="ChevronDown" />
                                  </div>

                                  {isOptionRate && indexRate == idx && (
                                    <ul className="menu__option--rate" ref={refOptionRate}>
                                      {dataRate.map((el, index) => (
                                        <li
                                          key={index}
                                          className={`item--rate ${item?.type === el.type ? "active__item--rate" : ""}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setAddCardService((current) =>
                                              current.map((obj, i) => {
                                                if (i === idx) {
                                                  return { ...obj, type: el.type };
                                                }

                                                return obj;
                                              })
                                            );
                                            setIsOptionRate(false);
                                          }}
                                        >
                                          {el.name}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>

                              {addQtyCardService.length > 1 && (
                                <div className="action__remove" title="Xóa" onClick={() => handleRemoveQtyCard(idx)}>
                                  <Icon name="Trash" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ),
              },
            ]) as IFieldCustomize[]),
      ] as IFieldCustomize[],
    [
      formData?.values,
      addOrderValue,
      indexRate,
      isOptionRate,
      addProduct,
      addService,
      addCardService,
      addQtyProduct,
      addQtyService,
      addQtyCardService,
    ]
  );

  // gửi đi lựa chọn 1
  useEffect(() => {
    if (formData?.values.type == "1") {
      console.log("giá trị gửi đi khi chọn theo giá trị đơn hàng : ", addOrderValue);
    }
  }, [formData?.values, addOrderValue]);

  // gửi đi lựa chọn 2
  useEffect(() => {
    if (formData?.values.type == "2") {
      console.log("gửi đi mức hưởng : ", valueBenefitRate);
      console.log("sản phẩm gửi đi : ", addProduct);
      console.log("dịch vụ gửi đi : ", addService);
      console.log("thẻ dịch vụ gửi đi : ", addCardService);
    }
  }, [formData?.values, addProduct, addService, addCardService]);

  // gửi đi lựa chọn 3
  useEffect(() => {
    if (formData?.values.type == "3") {
      console.log("số lượng sản phẩm gửi đi : ", addQtyProduct);
      console.log("số lượng dịch vụ gửi đi : ", addQtyService);
      console.log("số lượng thẻ dịch vụ gửi : ", addQtyCardService);
    }
  }, [formData?.values, addQtyProduct, addQtyService, addQtyCardService]);

  const clearCriteriaOne = () => {
    setAddOrderValue([
      {
        value: "",
        benefitRate: "",
        type: "0",
      },
    ]);
  };

  const clearCriteriaTwo = () => {
    setValueBenefitRate({ value: 0, type: "0" });
    setAddProduct([{ value: null, label: "", avatar: "" }]);
    setAddService([{ value: null, label: "", avatar: "" }]);
    setAddCardService([{ value: null, label: "", avatar: "" }]);
  };

  const clearCriteriaThree = () => {
    setAddQtyProduct([{ product: null, qty: "", qtyLevel: "", type: "1" }]);
    setAddQtyService([{ service: null, qty: "", qtyLevel: "", type: "1" }]);
    setAddQtyCardService([{ card: null, qty: "", qtyLevel: "", type: "1" }]);
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    // đoạn này cần check lại 1 chút, ý tưởng nếu chọn 1 tiêu chí thì bỏ đi các tiêu chí còn lại
    if (formData.values.type == "1") {
      clearCriteriaTwo();
      clearCriteriaThree();
    } else if (formData.values.type == "2") {
      clearCriteriaOne();
      clearCriteriaThree();
    } else {
      clearCriteriaOne();
      clearCriteriaTwo();
    }

    setIsSubmit(true);

    // sử lý gửi dữ liệu đi
  };

  const handClearForm = () => {
    onHide(false);
    // clear theo tiêu chí 1
    setAddOrderValue([
      {
        value: "",
        benefitRate: "",
        type: "0",
      },
    ]);
    // clear theo tiêu chí 2
    setValueBenefitRate({ value: 0, type: "0" });
    setAddProduct([{ value: null, label: "", avatar: "" }]);
    setAddService([{ value: null, label: "", avatar: "" }]);
    setAddCardService([{ value: null, label: "", avatar: "" }]);
    // clear theo tiêu chí 3
    setAddQtyProduct([{ product: null, qty: "", qtyLevel: "", type: "1" }]);
    setAddQtyService([{ service: null, qty: "", qtyLevel: "", type: "1" }]);
    setAddQtyCardService([{ card: null, qty: "", qtyLevel: "", type: "1" }]);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-tip-rose"
      >
        <form className="form-tip-rose" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} cách tính hoa hồng`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
