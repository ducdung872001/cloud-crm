import React, { useEffect, useMemo, useState } from "react";
import { isDifferenceObj } from "reborn-util";
import { IOption } from "model/OtherModel";
import { IAddPomProps } from "model/pom/PropsModel";
import { IPomRequest } from "model/pom/PomRequestModel";
import { IProductFilterRequest } from "model/product/ProductRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import ImageThirdGender from "assets/images/third-gender.png";
import PomService from "services/PomService";
import ProductService from "services/ProductService";
import { showToast } from "utils/common";
import "./index.scss";

export default function AddPom(props: IAddPomProps) {
  const { data, onReload, infoService } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [dataProduct, setDataProduct] = useState(null);
  const [idProduct, setIdProduct] = useState(null);
  const [listUnitProduct, setListUnitProduct] = useState<IOption[]>([]);
  const [nameUnit, setNameUnit] = useState<string>("");

  //! validate
  const [checkFieldProduct, setCheckFieldProduct] = useState<boolean>(false);
  const [checkFieldUnit, setCheckFieldUnit] = useState<boolean>(false);
  const [checkFieldQuantity, setCheckFieldQuantity] = useState<boolean>(false);
  // const [checkFieldNumerator, setCheckFieldNumerator] = useState<boolean>(false);
  const [checkFieldDenominator, setCheckFieldDenominator] = useState<boolean>(false);

  const values = useMemo(
    () =>
      ({
        serviceId: infoService?.idService,
        productId: data?.productId ?? null,
        unitId: data?.unitId ?? null,
        quantity: data?.quantity ?? "",
        numerator: data?.numerator ?? "",
        denominator: data?.denominator ?? "",
      } as IPomRequest),
    [data, infoService]
  );

  const [formData, setFormData] = useState(values);

  //! đoạn này xử lý sản phẩm
  const handleChangeValueProduct = (e) => {
    setDataProduct(e);
    setIdProduct(e.value);
    setCheckFieldProduct(false);
    setFormData({ ...formData, productId: e.value });
  };

  const loadedOptionProduct = async (search, loadedOptions, { page }) => {
    const param: IProductFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ProductService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items || [];

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

  //! đoạn này xử lý vấn đề update sản phẩm
  const getDetailProduct = async () => {
    const response = await ProductService.detail(data?.productId);

    if (response.code === 0) {
      const result = response.result;

      setDataProduct({ value: result.id, label: result.name, avatar: result.avatar });

      const dataOtherUnits = JSON.parse(result.otherUnits ? result.otherUnits : "[]");

      if (dataOtherUnits.length > 0) {
        onSelectOpenUnit(dataOtherUnits);
      }
    }
  };

  useEffect(() => {
    if (data?.productId) {
      getDetailProduct();
    }
  }, [data?.productId]);

  //! Từ idProduct xử lý lấy ra đơn vị sản phẩm tương ứng
  const onSelectOpenUnit = (dataOtherUnits: any) => {
    const dataOption = dataOtherUnits.map((item) => {
      return { value: item.unitId, label: item.unitName, exchange: item.exchange };
    });

    setListUnitProduct([...(dataOption.length > 0 ? dataOption : [])]);
  };

  const detailProduct = async () => {
    const response = await ProductService.detail(idProduct);

    if (response.code === 0) {
      const result = response.result;
      const dataOtherUnits = JSON.parse(result.otherUnits ? result.otherUnits : "[]");

      if (dataOtherUnits.length > 0) {
        onSelectOpenUnit(dataOtherUnits);
      }
    }
  };

  useEffect(() => {
    if (idProduct) {
      detailProduct();
    }
  }, [idProduct]);

  const handleChangeValueUnit = (e) => {
    setNameUnit(e.label);
    setCheckFieldUnit(false);
    setFormData({ ...formData, unitId: e.value });
  };

  //! xử lý field số lượng
  const handChangeValueQuantity = (e) => {
    const value = e.value;

    setCheckFieldQuantity(false);
    setFormData({ ...formData, quantity: +value });
  };

  const handChangeValueNumerator = (e) => {
    const value = e.value;

    // setCheckFieldNumerator(false);
    setFormData({ ...formData, numerator: +value });
  };

  const handChangeValueDenominator = (e) => {
    const value = e.value;

    setCheckFieldDenominator(false);
    setFormData({ ...formData, denominator: +value });
  };

  useEffect(() => {
    if (formData?.numerator > 0 && formData?.denominator > 0) {
      if (formData?.numerator === formData?.denominator) {
        setFormData({ ...formData, denominator: formData?.denominator + 1 });
      }
    }
  }, [formData?.numerator, formData?.denominator]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (formData?.productId == null) {
      setCheckFieldProduct(true);
      return;
    }

    if (formData?.unitId == null) {
      setCheckFieldUnit(true);
      return;
    }

    if (!formData?.quantity) {
      setCheckFieldQuantity(true);
      return;
    }

    // if (!formData?.numerator) {
    //   setCheckFieldNumerator(true);
    //   return;
    // }

    if (!formData?.denominator && formData?.numerator) {
      setCheckFieldDenominator(true);
      return;
    }

    setIsSubmit(true);

    const body: IPomRequest = {
      ...(formData as IPomRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await PomService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} pom thành công`, "success");
      onReload(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  return (
    <form className="form__add--pom" onSubmit={onSubmit}>
      <div className="list-form-group">
        <div className="form-group">
          <Input fill={true} value={infoService?.nameService || ""} label="Dịch vụ" disabled={true} />
        </div>
        <div className="form-group">
          <SelectCustom
            fill={true}
            id="productId"
            name="productId"
            label="Sản phẩm"
            options={[]}
            required={true}
            isAsyncPaginate={true}
            isFormatOptionLabel={true}
            placeholder="Chọn sản phẩm"
            additional={{
              page: 1,
            }}
            value={dataProduct}
            onChange={(e) => handleChangeValueProduct(e)}
            loadOptionsPaginate={loadedOptionProduct}
            formatOptionLabel={formatOptionLabelProduct}
            error={checkFieldProduct}
            message="Sản phẩm không được bỏ trống"
          />
        </div>
        <div className="form-group">
          <SelectCustom
            fill={true}
            id="unitId"
            name="unitId"
            label="Đơn vị tính"
            options={listUnitProduct}
            required={true}
            value={formData?.unitId}
            error={checkFieldUnit}
            placeholder="Chọn đơn vị tính"
            message="Đơn vị tính không được bỏ trống"
            onChange={(e) => handleChangeValueUnit(e)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="quantity" className="label">
            Số lượng
          </label>
          <div className="d-flex align-items-start justify-content-between">
            <NummericInput
              id="quantity"
              fill={true}
              thousandSeparator={true}
              required={true}
              value={formData?.quantity}
              onValueChange={(e) => handChangeValueQuantity(e)}
              error={checkFieldQuantity}
              message={`${formData?.quantity == 0 ? "Số lượng cần lớn hơn 0" : "Số lượng không được bỏ trống"}`}
              placeholder="Số lượng"
            />
            <span className="name-unit">{`${nameUnit ? nameUnit.toLowerCase() : "đơn vị"} và`}</span>
            <div className="d-flex align-items-start justify-content-between">
              <NummericInput
                fill={true}
                thousandSeparator={true}
                // required={true}
                value={formData?.numerator}
                onValueChange={(e) => handChangeValueNumerator(e)}
                placeholder="Tử số"
                // error={checkFieldNumerator}
                // message="Tử số không được bỏ trống"
              />
              <span className="division-sign">/</span>
              <NummericInput
                fill={true}
                thousandSeparator={true}
                required={formData?.numerator ? true : false}
                value={formData?.denominator}
                onValueChange={(e) => handChangeValueDenominator(e)}
                placeholder="Mẫu số"
                error={formData?.numerator && checkFieldDenominator}
                message={`${formData?.denominator == 0 ? "Mẫu số cần lớn hơn 0" : "Mẫu số không được bỏ trống"}`}
              />
            </div>
            <span className="name-unit">{`${nameUnit ? nameUnit.toLowerCase() : "đơn vị"}`}</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="btn__add--pom"
        disabled={
          isSubmit ||
          checkFieldProduct ||
          checkFieldUnit ||
          checkFieldQuantity ||
          checkFieldDenominator ||
          // checkFieldNumerator ||
          !isDifferenceObj(formData, values)
        }
      >
        {data ? "Cập nhật" : "Thêm mới"}
        {isSubmit ? <Icon name="Loading" /> : null}
      </Button>
    </form>
  );
}
