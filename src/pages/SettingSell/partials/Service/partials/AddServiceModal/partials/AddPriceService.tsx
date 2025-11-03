import React, { Fragment, useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import Input from "components/input/input";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import { IAction, IActionModal } from "model/OtherModel";
import { IAddPriceServiceProps } from "model/service/PropsModel";
import { IPriceVariationResponse } from "model/service/ServiceResponseModel";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { formatCurrency } from "reborn-util";
import "./AddPriceService.scss";

export default function AddPriceService(props: IAddPriceServiceProps) {
  const { onShow, onHide, handleTakePriceVariant, dataProps } = props;

  const [listPriceVariant, setListPriceVariant] = useState<IPriceVariationResponse[]>(JSON.parse(dataProps) || []);
  const [dataPriceVariant, setDataPriceVariant] = useState<IPriceVariationResponse>(null);
  const [validateFieldName, setValidateFieldName] = useState<boolean>(false);
  const [validateFieldPrice, setValidateFieldPrice] = useState<boolean>(false);
  const [validateFieldDiscount, setValidateFieldDiscount] = useState<boolean>(false);
  const [validateFieldTreatmentNum, setValidateFieldTreatmentNum] = useState<boolean>(false);

  const titles = ["STT", "Tên dịch vụ", "Giá gốc", "Giá ưu đãi", "Số buổi thực hiện"];

  const dataFormat = ["text-center", "", "text-right", "text-right", "text-right"];

  const dataMappingArray = (item: IPriceVariationResponse, index: number) => [
    index + 1,
    item.name,
    formatCurrency(item.price),
    formatCurrency(item.discount),
    item.treatmentNum,
  ];

  const actionsTable = (item: IPriceVariationResponse): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          handleEditPrice(item);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          handleRemovePrice(item.priceId);
        },
      },
    ];
  };

  //! đoạn này sửa lý vấn đề xóa giá dịch vụ
  const handleRemovePrice = (id) => {
    const result = listPriceVariant.filter((item) => item.priceId !== id);
    setListPriceVariant(result);
  };

  // console.log("cái mình cần : ", listPriceVariant);

  //! đoạn này xử lý vấn đề sửa giá dịch vụ
  const handleEditPrice = (data) => {
    setDataPriceVariant(data);
  };

  //! đoạn này xử lý thay đổi tên dịch vụ
  const handleChangeValueName = (e) => {
    oninput = () => {
      setValidateFieldName(false);
    };

    const value = e.target.value;
    setDataPriceVariant({ ...dataPriceVariant, name: value });
  };

  //! đoạn này xử lý vấn đề validate field name
  const handleChangeBlurName = (e) => {
    const value = e.target.value;

    if (value.length === 0) {
      setValidateFieldName(true);
    }
  };

  //? đoạn này xử lý vấn đề thay đổi giá gốc
  const handleChangeValuePrice = (e) => {
    oninput = () => {
      setValidateFieldPrice(false);
    };

    const value = e.value;
    setDataPriceVariant({ ...dataPriceVariant, price: +value });
  };

  //! đoạn này sủ lý vấn đề validate field price
  const handleChangeBlurPrice = (e) => {
    const value = e.target.value;

    if (value == 0) {
      setValidateFieldPrice(true);
    }
  };

  //? đoạn này xử lý vấn đề thay đổi giá ưu đãi
  const handleChangeValueDiscount = (e) => {
    oninput = () => {
      setValidateFieldDiscount(false);
    };

    const value = e.value;
    setDataPriceVariant({ ...dataPriceVariant, discount: +value });
  };

  //! đoạn này xử lý vấn đề validate giá ưu đãi
  const handleChangeBlurDiscount = (e) => {
    const value = e.target.value;

    if (value == 0) {
      setValidateFieldDiscount(true);
    }
  };

  //? đoạn này xử lý vấn đề thay đổi lịch điều trị
  const handleChangeValueTreatmentNum = (e) => {
    oninput = () => {
      setValidateFieldTreatmentNum(false);
    };

    const value = e.value;
    setDataPriceVariant({ ...dataPriceVariant, treatmentNum: +value });

    if (+value > 100) {
      setValidateFieldTreatmentNum(true);
    }
  };

  //! đoạn này xử lý vấn đề validate lịch điều trị
  const handleCHangeBlurTreatmentNum = (e) => {
    const value = e.target.value;

    if (value == 0) {
      setValidateFieldTreatmentNum(true);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (dataPriceVariant?.price == null || dataPriceVariant?.price <= 0) {
      setValidateFieldPrice(true);
      return;
    }

    if (dataPriceVariant?.discount == null || dataPriceVariant?.discount < 0) {
      setValidateFieldDiscount(true);
      return;
    }

    if (dataPriceVariant?.treatmentNum == 0 || dataPriceVariant?.treatmentNum == null) {
      setValidateFieldTreatmentNum(true);
      return;
    }

    const body: IPriceVariationResponse = {
      ...dataPriceVariant,
      priceId: uuidv4(),
    };

    //! mục đích filter đoạn này là để edit nếu như ban đầu mình thêm thì id của nó sẽ không bị trùng nhau lên ko bị remove
    //? còn khi mình ấn edit thì đoạn ý bị trùng id nên là nó remove ông cũ xong rồi lấy ông mới mình vừa edit.
    const result = listPriceVariant.filter((item) => item.priceId !== dataPriceVariant?.priceId);

    setListPriceVariant([...result, body]);
    setDataPriceVariant(null);
  };

  useEffect(() => {
    handleTakePriceVariant(listPriceVariant);
  }, [listPriceVariant]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide(false);
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-add-price">
        <form className="form-add-price" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Bảng giá dịch vụ" toggle={() => onHide(false)} />
          <ModalBody>
            <div className="wrapper__add--price">
              <div className="list__form--item">
                <div className="form-group">
                  <Input
                    label="Tên combo"
                    fill={true}
                    required={true}
                    value={dataPriceVariant?.name || ""}
                    error={validateFieldName}
                    message="Tên combo không được bỏ trống!"
                    onChange={(e) => handleChangeValueName(e)}
                    onBlur={(e) => handleChangeBlurName(e)}
                    placeholder="Nhập tên combo"
                  />
                </div>

                <div className="form-group">
                  <NummericInput
                    label="Giá gốc"
                    fill={true}
                    required={true}
                    thousandSeparator={true}
                    value={dataPriceVariant?.price || 0}
                    onValueChange={(e) => handleChangeValuePrice(e)}
                    onBlur={(e) => handleChangeBlurPrice(e)}
                    placeholder="Nhập giá gốc"
                    error={validateFieldPrice}
                    message="Giá gốc phải lớn hơn 0"
                  />
                </div>

                <div className="form-group">
                  <NummericInput
                    label="Giá ưu đãi"
                    fill={true}
                    required={false}
                    thousandSeparator={true}
                    value={dataPriceVariant?.discount || 0}
                    onValueChange={(e) => handleChangeValueDiscount(e)}
                    onBlur={(e) => handleChangeBlurDiscount(e)}
                    placeholder="Nhập giá ưu đãi"
                    error={validateFieldDiscount || dataPriceVariant?.discount > dataPriceVariant?.price}
                    message={`${
                      validateFieldDiscount
                        ? "Giá ưu đãi phải lớn hơn hoặc bằng 0"
                        : dataPriceVariant?.discount > dataPriceVariant?.price
                        ? "Giá ưu đãi nhỏ hơn giá gốc"
                        : ""
                    }`}
                  />
                </div>

                <div className="form-group">
                  <NummericInput
                    label="Số buổi điều trị"
                    fill={true}
                    required={true}
                    thousandSeparator={true}
                    value={dataPriceVariant?.treatmentNum || 0}
                    onValueChange={(e) => handleChangeValueTreatmentNum(e)}
                    onBlur={(e) => handleCHangeBlurTreatmentNum(e)}
                    placeholder="Nhập số buổi điều trị"
                    error={validateFieldTreatmentNum}
                    message={`${dataPriceVariant?.treatmentNum ? "Số buổi điều trị phải nhỏ hơn hoặc bằng 100" : "Số buổi điều trị phải lớn hơn 0"}`}
                  />
                </div>

                <Button
                  type="submit"
                  className="btn__add--price"
                  disabled={
                    dataPriceVariant?.name?.length == 0 ||
                    dataPriceVariant?.name == null ||
                    validateFieldDiscount ||
                    validateFieldPrice ||
                    validateFieldTreatmentNum
                  }
                >
                  {dataPriceVariant?.priceId ? "Chỉnh sửa" : "Thêm mới"}
                </Button>
              </div>

              <div className="list__price--variant">
                <BoxTable
                  name="Thêm bảng giá dịch vụ"
                  titles={titles}
                  items={listPriceVariant}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  actions={actionsTable}
                  actionType="inline"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
