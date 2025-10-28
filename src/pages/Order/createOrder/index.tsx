import React, { useState, useEffect, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { paymentMethods } from "types/DataInitialModel";
import { IAction, ILstDataTab } from "types/OtherModel";
import Icon from "components/icon";
import Image from "components/image";
import LstTab from "components/lstTab/lstTab";
import Input from "components/input/input";
import Button from "components/button/button";
import RadioList from "components/radio/radioList";
import NummericInput from "components/input/numericInput";
import ChooseItem from "components/chooseItem/chooseItem";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ContextType, UserContext } from "contexts/userContext";
import { SelectOptionData } from "utils/selectCommon";
import { formatCurrency, getInfoLogin, getSearchParameters, showToast } from "utils/common";
import { useWindowDimensions } from "components/hooks";
import OrderService from "services/OrderService";
import ShowInvoiceOrder from "../orderInvoiceList/partials/showInvoiceOrder";
import "./index.scss";
import SaleFlowService from "services/SaleFlowService";

export default function CreateOrder() {
  const { width } = useWindowDimensions();

  const navigate = useNavigate();

  const checkPermission = getInfoLogin();

  const params = getSearchParameters();

  document.title = params["type"] ? (params["type"] === "edit" ? "Chỉnh sửa đơn đặt hàng" : "Chỉnh sửa đơn đặt lưu tạm") : "Tạo đơn đặt hàng";

  const { isCollapsedSidebar, setIsCollapsedSidebar, id, permissions } = useContext(UserContext) as ContextType;

  const lstPermissionSales: string[] =
    (permissions &&
      permissions.length > 0 &&
      permissions.find((el) => el.path === "/order/list")["children"].find((ol) => ol.path === "/order")["action"]) ||
    [];

  const isPermissionSales = (action: string) => {
    return lstPermissionSales.includes(action);
  };

  const lstDiscount = [
    {
      value: "percentage",
      label: "%",
    },
    {
      value: "amount",
      label: "VNĐ",
    },
  ];

  //TODO: đoạn này cần check lại 1 chút
  const defaultValue = {
    id: null,
    supplier_id: null,
    sale_id: id,
    order_date: moment().format("DD/MM/YYYY"),
    expected_date: "",
    note: "",
    payment_method: "cash",
    status: "done",
    pay_amount: 0,
    debt_amount: 0,
    amount: 0,
    vat_amount: 0,
    discount: 0,
    discount_rate: 0,
    discount_type: "amount",
    // đoạn này thêm vào với mục view
    total_discount: 0,
    need_pay_amount: 0,
    saleflowId: 0,
    approachId: 0,
  };

  const [lstTabInvoice, setLstTabInvoice] = useState([{ id: uuidv4(), is_active: true, orderDetails: [], formData: defaultValue }]);

  //TODO: call api chi tiết đơn đặt hàng
  const handleDetailInvoiceOrder = async (id: number) => {
    if (!id) return;

    const response = await OrderService.detail(id);

    if (response.code === 200) {
      const result = response.result;

      const changeDataDetails = (result.details || []).map((item) => {
        return {
          id: item.id,
          product_id: item.product_id,
          name: item.product_name,
          image: item.image || "",
          code: item.product_code,
          numbers: item.numbers.map((el) => {
            return {
              label: el.number,
              value: el.number,
              expiry_date: el.expiry_date,
              inventory: +el.quantity,
              warehouse_id: el.id,
              units: el.units.map((ol) => {
                return {
                  value: ol.unit_id,
                  label: ol.unit_name,
                  current_cost: ol.current_cost,
                };
              }),
            };
          }),
          number: item.number,
          units: [{ value: item.unit.id, label: item.unit.name }],
          unit_id: item.unit_id,
          quantity: item.quantity,
          inventory: item.numbers.find((ol) => ol.number === item.number).quantity,
          warehouse_id: item.warehouse_id,
          cost: item.cost,
          total_cost: item.quantity * item.cost,
          vat: item.vat || 0,
          note: item.note,
          discount: item.discount || 0,
          discount_type: item.discount_type || "amount",
          discount_rate: item.discount_rate || 0,
          exchange: item.exchange || 1,
        };
      });

      onSelectOpenEmployee();

      setLstTabInvoice((prev) =>
        prev.map((item) => {
          if (item.is_active) {
            return {
              ...item,
              orderDetails: changeDataDetails,
              formData: {
                ...item.formData,
                id: result.id,
                expected_date: moment(result.expected_date).format("DD/MM/YYYY"),
                order_date: moment(result.order_date).format("DD/MM/YYYY"),
                note: result.note,
                sale_id: result.sale_id,
              },
            };
          }

          return item;
        })
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (params["id"]) {
      handleDetailInvoiceOrder(+params["id"]);
    }
  }, [params["id"]]);

  const conditionCommon = lstTabInvoice.find((item) => item.is_active);

  const handRemoveTab = (idx: number) => {
    if (lstTabInvoice[idx].is_active === true) {
      // Nếu mục cuối cùng có "is_active" là true
      if (idx === lstTabInvoice.length - 1) {
        // Cập nhật mục liền trước thành true
        lstTabInvoice[idx - 1].is_active = true;
      }

      // Xóa mục khỏi mảng
      const newData = [...lstTabInvoice];
      newData.splice(idx, 1);
      setLstTabInvoice(newData);
    } else {
      const newData = [...lstTabInvoice];
      newData.splice(idx, 1);
      setLstTabInvoice(newData);
    }
  };

  const [showModalChoose, setShowMdoalChoose] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [isTemp, setIsTemp] = useState<boolean>(false);
  const [idInvoice, setIdInvoice] = useState<number>(null);
  const [showModalDetail, setShowModalDetail] = useState<boolean>(false);
  const [idTab, setIdTab] = useState<string>("");

  useEffect(() => {
    if (idTab && !showModalDetail) {
      // nếu như mà nhiều hơn 1 tab thì thực hiện xóa đi tab đó, còn nếu như có 1 tab thì clear hết dữ liệu hiện tại đi
      if (lstTabInvoice.length > 1) {
        const newDataTabInvoice = [...lstTabInvoice].filter((item) => item.id !== idTab);
        newDataTabInvoice[0].is_active = true;
        setLstTabInvoice(newDataTabInvoice);
      } else {
        setLstTabInvoice([
          {
            id: uuidv4(),
            is_active: true,
            orderDetails: [],
            formData: defaultValue,
          },
        ]);
      }
    }
  }, [idTab, showModalDetail]);

  const [valueDiscount, setValueDiscount] = useState({
    amount: 0,
    percentage: 0,
  });

  const [lstEmployee, setLstEmployee] = useState([]);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [saleflowId, setSaleflowId] = useState<number>(0);

  const onSelectOpenEmployee = async () => {
    setIsLoadingEmployee(true);

    const response = await SelectOptionData("employee");

    if (response) {
      setLstEmployee([...(response.length > 0 ? response : [])]);
    }

    setIsLoadingEmployee(false);
  };

  useEffect(() => {
    if (id) {
      onSelectOpenEmployee();
    }
  }, [id]);
  useEffect(() => {
    loadOptionSaleflow();
  }, []);
  const loadOptionSaleflow = async () => {
    const param: any = {
      name: "",
      page: 1,
      limit: 10,
    };
    const response = await SaleFlowService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items;
      if (dataOption?.length == 1) {
        setSaleflowId(dataOption[0].id);
      }
    }
  };

  const changeDataChoose = (data) => {
    if (!data) return;
    console.log("data>>>", data);
    const changeData = {
      id: 0,
      product_id: data.id,
      name: data.name,
      image: data.avatar,
      unit_id: data.unit_id,
      quantity: 1,
      cost: data.price,
      total_cost: data.price,
      vat: 0,
      note: "",
      discount: 0,
      discount_type: "amount",
      discount_rate: 0,
      exchange: 1,
      approachId: 0,
      saleflowId: saleflowId,
    };

    setLstTabInvoice((prev) =>
      prev.map((item) => {
        if (item.is_active) {
          return {
            ...item,
            orderDetails: [changeData, ...item.orderDetails],
          };
        }

        return item;
      })
    );
  };

  const lstTab: ILstDataTab[] = [
    {
      key: "tab_one",
      name: "Thông tin mặt hàng cần đặt",
    },
  ];

  const actionTab: IAction[] = [
    {
      icon: <Icon name={`${isCollapsedSidebar ? "FullscreenExit" : "Fullscreen"}`} />,
      callback: () => {
        setIsCollapsedSidebar(!isCollapsedSidebar);
      },
      variant: "outline",
      color: "link",
      data_tip: isCollapsedSidebar ? "Mở rộng" : "Thu nhỏ",
    },
  ];

  // ---------------- 👽👽👽 Start handle xử lý logic item đặt hàng 👽👽👽 ---------------- //
  const handChangeValueNumbers = (e, idx) => {
    const value = e;

    setLstTabInvoice((prev) =>
      prev.map((item) => {
        if (item.is_active) {
          return {
            ...item,
            orderDetails: item.orderDetails.map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  number: value.value,
                  units: value.units,
                  inventory: value.inventory,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handChangeValueUnit = (e, idx) => {
    const value = e;

    setLstTabInvoice((prev) =>
      prev.map((item) => {
        if (item.is_active) {
          return {
            ...item,
            orderDetails: item.orderDetails.map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  unit_id: value.value,
                  cost: value.current_cost,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handChangeValueQuantity = (e, idx) => {
    const value = e.floatValue || 1;

    setLstTabInvoice((prev) =>
      prev.map((item) => {
        if (item.is_active) {
          return {
            ...item,
            orderDetails: item.orderDetails.map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  quantity: value,
                  total_cost: (el.cost - el.discount + (el.cost - el.discount) * (el.vat / 100)) * value || 0,
                };
              }

              return el;
            }),
          };
        }
        return item;
      })
    );
  };

  const handChangeValueNote = (e, idx) => {
    const value = e.target.value;

    setLstTabInvoice((prev) =>
      prev.map((item) => {
        if (item.is_active) {
          return {
            ...item,
            orderDetails: [...item.orderDetails].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  note: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleDeleteItem = (idx: number) => {
    const newData = [...lstTabInvoice].find((item) => item.is_active).orderDetails;
    newData.splice(idx, 1);

    setLstTabInvoice((prev) =>
      prev.map((item) => {
        if (item.is_active) {
          return {
            ...item,
            orderDetails: newData,
          };
        }

        return item;
      })
    );
  };
  // ---------------- 👽👽👽 End handle xử lý logic item đặt hàng 👽👽👽 ---------------- //

  const [totalInvoice, setTotalInvoice] = useState<number>(0);

  useEffect(() => {
    if (conditionCommon.orderDetails.length > 0) {
      const totalAmount = conditionCommon.orderDetails
        .map((item) => item.total_cost)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      setTotalInvoice(totalAmount);
    } else {
      setTotalInvoice(0);
    }
  }, [conditionCommon.orderDetails, conditionCommon]);

  useEffect(() => {
    const calculator =
      conditionCommon.formData.discount_type === "amount"
        ? conditionCommon.formData.discount || 0
        : ((conditionCommon.formData.discount || 0) / 100) * totalInvoice;

    setLstTabInvoice((prev) =>
      prev.map((item) => {
        if (item.is_active) {
          return {
            ...item,
            formData: {
              ...item.formData,
              amount: totalInvoice,
              pay_amount: totalInvoice - calculator,
              need_pay_amount: totalInvoice - calculator,
            },
          };
        }

        return item;
      })
    );
  }, [totalInvoice, conditionCommon.formData.discount, conditionCommon.formData.discount_type, valueDiscount]);

  useEffect(() => {
    if (!totalInvoice) {
      setValueDiscount({ amount: 0, percentage: 0 });
    }
  }, [totalInvoice]);

  //! đoạn này tính toán lại số tiền phải trả khi chọn % hoặc tiền mặt
  useEffect(() => {
    if (valueDiscount) {
      if (conditionCommon.formData.discount_type === "amount") {
        const calculatorAmount = conditionCommon.formData.amount - (valueDiscount.amount || 0);

        setLstTabInvoice((prev) =>
          prev.map((item) => {
            if (item.is_active) {
              return {
                ...item,
                formData: {
                  ...item.formData,
                  discount: valueDiscount.amount,
                  pay_amount: calculatorAmount,
                  total_discount: conditionCommon.formData.amount - calculatorAmount,
                },
              };
            }

            return item;
          })
        );
      } else {
        const calculatorPercentage = conditionCommon.formData.amount - (valueDiscount.percentage / 100) * conditionCommon.formData.amount;

        setLstTabInvoice((prev) =>
          prev.map((item) => {
            if (item.is_active) {
              return {
                ...item,
                formData: {
                  ...item.formData,
                  discount: valueDiscount.percentage,
                  pay_amount: calculatorPercentage,
                  total_discount: conditionCommon.formData.amount - calculatorPercentage,
                },
              };
            }

            return item;
          })
        );
      }
    }
  }, [valueDiscount, conditionCommon.formData.discount_type]);

  //* submit form
  const [dataInvoice, setDataInvoice] = useState<any>({});
  const handSubmitForm = async (e, type: string) => {
    e.preventDefault();

    if (type === "done") {
      setIsSubmit(true);
    } else {
      setIsTemp(true);
    }

    const changeFormData = conditionCommon.formData;
    const orderDetails = conditionCommon.orderDetails.map((item) => {
      return {
        id: item.id,
        orderId: null,
        bsnId: 0,
        objectType: "product",
        objectId: item.product_id,
        exchange: item.exchange,
        quantity: item.quantity,
        cost: item.cost,
        vat: item.vat,
        note: item.note,
        expiryDate: "",
      };
    });

    const body = {
      id: changeFormData.id,
      orderCode: "",
      bnsId: 0,
      orderDate: changeFormData.order_date,
      expectedDate: changeFormData.expected_date,
      invoiceId: null,
      amount: changeFormData.pay_amount,
      vatAmount: changeFormData.vat_amount,
      discount: changeFormData.discount,
      payAmount: changeFormData.pay_amount,
      status: type,
      paymentMethod: changeFormData.payment_method,
      note: changeFormData.note,
      createdBy: changeFormData.supplier_id,
      updatedBy: changeFormData.supplier_id,
      supplierId: changeFormData.supplier_id,
      saleId: changeFormData.sale_id,
      approachId: changeFormData.approachId,
      saleflowId: changeFormData.saleflowId,
      paymentStatus: "processing",
      orderDetails: orderDetails,
    };

    let response = null;
    console.log("body>>>", body);

    if (changeFormData.id) {
      response = await OrderService.update(body, changeFormData.id);
    } else {
      response = await OrderService.create(body);
    }

    if (response.code === 0) {
      showToast(`Tạo đơn ${type === "done" ? "đặt hàng " : "lưu tạm"} thành công`, "success");
      setShowModalDetail(true);
      setIdInvoice(response.result.id);
      handClearForm();
      setIdTab(lstTabInvoice.find((item) => item.is_active).id);
      setDataInvoice(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    if (type === "done") {
      setIsSubmit(false);
    } else {
      setIsTemp(false);
    }
  };

  //! clear form
  const handClearForm = () => {
    setValueDiscount({
      amount: 0,
      percentage: 0,
    });
  };

  // table
  const titles = ["Thông tin sản phẩm", "Số lượng", "Đơn giá", "Thành tiền", "Ghi chú"];

  return (
    <div className={classNames("wrapper__create-order")}>
      <div className="header__order">
        <h1 className="title">
          {params["type"] ? (params["type"] === "edit" ? "Chỉnh sửa đơn đặt hàng" : "Chỉnh sửa đơn đặt lưu tạm") : "Đặt hàng"}
        </h1>
        <div className="action__header">
          <Button variant="outline" onClick={() => setShowMdoalChoose(true)}>
            Chọn sản phẩm đặt hàng
          </Button>
        </div>
      </div>

      <div className="card-box d-flex flex-column info__items">
        {!params["type"] ? (
          <div className="wrapper__tab--action">
            <div className="lst__tab--invoice">
              {lstTabInvoice.map((item, idx) => {
                return (
                  <div key={idx} className={`tab__item ${item.is_active ? "active--tab" : ""}${lstTabInvoice.length > 1 ? " distance__item" : ""}`}>
                    <span
                      className="name-tab"
                      onClick={() => {
                        setLstTabInvoice((prev) =>
                          prev.map((el, index) => {
                            if (index === idx) {
                              return { ...el, is_active: true };
                            } else {
                              return { ...el, is_active: false };
                            }
                          })
                        );
                      }}
                    >{`Hóa đơn ${idx + 1}`}</span>
                    {lstTabInvoice.length > 1 && (
                      <span className="action__remove--tab" onClick={() => handRemoveTab(idx)}>
                        <Icon name="Times" />
                      </span>
                    )}
                  </div>
                );
              })}

              <div
                className="action__add--tab"
                onClick={() => {
                  const changeTabInvoice = [...lstTabInvoice].map((item) => {
                    return {
                      ...item,
                      is_active: false,
                    };
                  });

                  setLstTabInvoice([...changeTabInvoice, { id: uuidv4(), is_active: true, orderDetails: [], formData: defaultValue }]);
                }}
              >
                <Icon name="PlusCircleFill" />
              </div>
            </div>
            <div className="action__more">
              <Button
                type="button"
                color="link"
                variant="outline"
                onClick={() => setIsCollapsedSidebar(!isCollapsedSidebar)}
                dataTip={isCollapsedSidebar ? "Mở rộng" : "Thu nhỏ"}
              >
                {<Icon name={`${isCollapsedSidebar ? "FullscreenExit" : "Fullscreen"}`} />}
              </Button>
            </div>
          </div>
        ) : (
          <LstTab isSaveLocalStorage={false} lstData={lstTab} action={actionTab} />
        )}

        {conditionCommon.orderDetails && conditionCommon.orderDetails.length > 0 ? (
          <div className="box__table--order" style={width <= 1440 ? { overflow: "auto" } : {}}>
            <table className="table__order">
              <thead>
                <tr>
                  {titles?.map((title, idx) => (
                    <th key={idx} className="">
                      {title}
                    </th>
                  ))}
                  <th className="actions__item"></th>
                </tr>
              </thead>
              <tbody>
                {conditionCommon.orderDetails.map((item, idx) => {
                  return (
                    <tr key={idx}>
                      <td className="box__info--pro">
                        <div className="info__pro">
                          <div className="image__pro">
                            <Image src={item.image} alt={item.name} />
                          </div>
                          <div className="dept__pro">
                            <div className="name">
                              Tên sản phẩm:{" "}
                              <span className="bold__name">
                                {item.name}
                                {/* <span className="product-code">{` (${item.code})`}</span> */}
                              </span>
                            </div>
                            {/* <div className="inventory">
                              Tồn kho:
                              <span className="bold__inventory">{formatCurrency(+item.inventory, ",", "")}</span>
                            </div> */}
                          </div>
                        </div>
                      </td>
                      {/* <td className="numbers">
                        <SelectCustom
                          name="numbers"
                          value={item.number}
                          options={item.numbers}
                          fill={true}
                          onChange={(e) => handChangeValueNumbers(e, idx)}
                          placeholder="Chọn lô sản xuất"
                        />
                      </td>
                      <td className="units">
                        <SelectCustom
                          id="unit_id"
                          name="unit_id"
                          fill={true}
                          value={item.unit_id}
                          options={item.units}
                          onChange={(e) => handChangeValueUnit(e, idx)}
                          placeholder="Chọn đơn vị tính"
                        />
                      </td> */}
                      <td className="quantity">
                        <NummericInput
                          id="quantity"
                          name="quantity"
                          fill={true}
                          value={item.quantity}
                          thousandSeparator={true}
                          onValueChange={(e) => handChangeValueQuantity(e, idx)}
                        />
                      </td>
                      <td className="cost">
                        <NummericInput id="cost" name="cost" fill={true} thousandSeparator={true} value={+item.cost} disabled={true} />
                      </td>
                      <td className="total_cost">
                        <NummericInput
                          id="total_cost"
                          name="total_cost"
                          thousandSeparator={true}
                          fill={true}
                          value={+item.total_cost || 0}
                          disabled={true}
                        />
                      </td>
                      <td className="note">
                        <Input name="note" value={item.note} fill={true} placeholder="Nhập ghi chú" onChange={(e) => handChangeValueNote(e, idx)} />
                      </td>
                      <td>
                        <div className="action__delete--item" onClick={() => handleDeleteItem(idx)}>
                          <Icon name="Trash" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <SystemNotification
            description={
              <span>
                Hiện tại chưa có mặt hàng nào. <br />
                Hãy chọn mặt hàng cần đặt đầu tiên nhé!
              </span>
            }
            type="no-item"
            titleButton={isPermissionSales("add") ? "Chọn mặt hàng cần đặt" : ""}
            action={() => {
              if (isPermissionSales("add")) {
                setShowMdoalChoose(true);
                setShowMdoalChoose(true);
              }
            }}
          />
        )}
      </div>

      <div className="card-box d-flex flex-column info__invoice">
        <div className="title">Thông tin hóa đơn đặt hàng</div>

        <div className="dept__content--invoice">
          <div className="lst__form--group">
            <div className="form-group">
              <DatePickerCustom
                label="Ngày tạo hóa đơn"
                name="receipt_date"
                value={conditionCommon.formData.order_date}
                icon={<Icon name="Calendar" />}
                iconPosition="left"
                fill={true}
                required={true}
                isMaxDate={true}
                onChange={(e) =>
                  setLstTabInvoice((prev) =>
                    prev.map((item) => {
                      if (item.is_active) {
                        return {
                          ...item,
                          formData: { ...item.formData, order_date: e },
                        };
                      }

                      return item;
                    })
                  )
                }
              />
            </div>
            <div className="form-group">
              <DatePickerCustom
                label="Ngày nhận hàng mong muốn"
                name="receipt_date"
                value={conditionCommon.formData.expected_date}
                icon={<Icon name="Calendar" />}
                iconPosition="left"
                fill={true}
                isMinDate={true}
                onChange={(e) =>
                  setLstTabInvoice((prev) =>
                    prev.map((item) => {
                      if (item.is_active) {
                        return {
                          ...item,
                          formData: { ...item.formData, expected_date: e },
                        };
                      }

                      return item;
                    })
                  )
                }
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="form-group">
              <NummericInput
                name="amount"
                label="Tổng tiền"
                fill={true}
                value={conditionCommon.formData.amount}
                thousandSeparator={true}
                disabled={true}
              />
            </div>
            <div className="form-group options__discount">
              <div className="lst__options--discount">
                <RadioList
                  name="discount_type"
                  value={conditionCommon.formData.discount_type}
                  options={lstDiscount}
                  onChange={(e) =>
                    setLstTabInvoice((prev) =>
                      prev.map((item) => {
                        if (item.is_active) {
                          return {
                            ...item,
                            formData: { ...item.formData, discount_type: e.target.value },
                          };
                        }

                        return item;
                      })
                    )
                  }
                />
              </div>
              <NummericInput
                name="discount"
                label={`Giảm giá sau VAT (${conditionCommon.formData.discount_type === "amount" ? "VNĐ" : "%"})`}
                fill={true}
                className="value--discount"
                value={conditionCommon.formData.discount_type === "amount" ? valueDiscount.amount : valueDiscount.percentage}
                thousandSeparator={true}
                onValueChange={(e) => {
                  conditionCommon.formData.discount_type === "amount"
                    ? setValueDiscount({ ...valueDiscount, amount: e.floatValue || 0 })
                    : setValueDiscount({
                        ...valueDiscount,
                        percentage: (e.floatValue || 0) > 100 ? 100 : e.floatValue || 0,
                      });
                }}
                error={false}
                message="Giảm giá sau VAT nhỏ hơn hoặc bằng Tổng tiền"
              />
            </div>
            <div className="form-group">
              <NummericInput
                name="total_discount"
                label="Tổng tiền được giảm"
                fill={true}
                thousandSeparator={true}
                value={conditionCommon.formData.total_discount}
                disabled={true}
              />
            </div>
            <div className="form-group">
              <NummericInput
                name="total_item"
                label="Số tiền cần trả"
                fill={true}
                thousandSeparator={true}
                value={conditionCommon.formData.need_pay_amount}
                disabled={true}
                placeholder="Nhập số tiền cần trả"
              />
            </div>
            <div className="form-group">
              <NummericInput
                name="pay_amount"
                label="Số tiền thực trả"
                fill={true}
                required={true}
                value={conditionCommon.formData.pay_amount}
                placeholder="Nhập số tiền thực trả"
                thousandSeparator={true}
                onValueChange={(e) =>
                  setLstTabInvoice((prev) =>
                    prev.map((item) => {
                      if (item.is_active) {
                        return {
                          ...item,
                          formData: {
                            ...item.formData,
                            pay_amount: e.floatValue || 0,
                            debt_amount:
                              item.formData.amount -
                              (item.formData.discount_type === "amount"
                                ? item.formData.discount
                                : (item.formData.discount / 100) * item.formData.amount) -
                              (e.floatValue || 0),
                          },
                        };
                      }

                      return item;
                    })
                  )
                }
                error={false} // validateForm.pay_amount
                message="Khách thực trả nhỏ hơn hoặc bằng Khách hàng cần trả"
              />
            </div>
            <div className="form-group">
              <NummericInput
                name="total_item"
                thousandSeparator={true}
                label="Công nợ"
                fill={true}
                value={conditionCommon.formData.debt_amount}
                disabled={true}
              />
            </div>
            <div className="form-group">
              <SelectCustom
                name="payment_method"
                label="Hình thức thanh toán"
                fill={true}
                required={true}
                value={conditionCommon.formData.payment_method}
                options={paymentMethods}
                placeholder="Chọn hình thức thanh toán"
                onChange={(e) =>
                  setLstTabInvoice((prev) =>
                    prev.map((item) => {
                      if (item.is_active) {
                        return {
                          ...item,
                          formData: { ...item.formData, payment_method: e.value },
                        };
                      }

                      return item;
                    })
                  )
                }
              />
            </div>
            <div className="form-group box__employee">
              <SelectCustom
                name="employee_id"
                label="Nhân viên đặt hàng"
                fill={true}
                required={true}
                value={conditionCommon.formData.sale_id}
                options={lstEmployee}
                isLoading={isLoadingEmployee}
                onMenuOpen={onSelectOpenEmployee}
                placeholder="Chọn nhân viên bán hàng"
                onChange={(e) =>
                  setLstTabInvoice((prev) =>
                    prev.map((item) => {
                      if (item.is_active) {
                        return {
                          ...item,
                          formData: {
                            ...item.formData,
                            sale_id: e.value,
                            sale_name: e.label,
                          },
                        };
                      }

                      return item;
                    })
                  )
                }
              />
            </div>
            <div className="form-group">
              <Input
                name="note"
                label="Ghi chú"
                fill={true}
                value={conditionCommon.formData.note}
                placeholder="Nhập ghi chú"
                onChange={(e) =>
                  setLstTabInvoice((prev) =>
                    prev.map((item) => {
                      if (item.is_active) {
                        return {
                          ...item,
                          formData: { ...item.formData, note: e.target.value },
                        };
                      }

                      return item;
                    })
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="action__confirm--invoice">
          {checkPermission !== "GDP" ? (
            <Button
              variant="outline"
              disabled={isSubmit || isTemp || conditionCommon.orderDetails.length === 0}
              onClick={(e) => handSubmitForm(e, "temp")}
            >
              Lưu tạm
              {isTemp && <Icon name="Loading" />}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate("/order/list")}>
              Quay lại
            </Button>
          )}
          <Button onClick={(e) => handSubmitForm(e, "done")} disabled={isSubmit || isTemp || conditionCommon.orderDetails.length === 0}>
            {params["type"] && params["type"] === "edit" ? "Xác nhận" : "Tạo đơn hàng"}
            {isSubmit && <Icon name="Loading" />}
          </Button>
        </div>
      </div>
      <ChooseItem
        onShow={showModalChoose}
        isInventory={true}
        type="order"
        onHide={() => setShowMdoalChoose(false)}
        callback={(data) => changeDataChoose(data)}
      />
      <ShowInvoiceOrder onShow={showModalDetail} onHide={() => setShowModalDetail(false)} data={dataInvoice} id={idInvoice} action="edit" />
    </div>
  );
}
