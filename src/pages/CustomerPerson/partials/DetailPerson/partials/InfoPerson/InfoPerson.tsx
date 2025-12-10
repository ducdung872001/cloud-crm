import React, { Fragment, useState, useEffect, useMemo } from "react";
import parser from "html-react-parser";
import { IOption } from "model/OtherModel";
import { IInfoPersonProps } from "model/customer/PropsModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IUpdateOneRelationshipRequest } from "model/customer/CustomerRequestModel";
import ThirdGender from "assets/images/third-gender.png";
import Icon from "components/icon";
import Button from "components/button/button";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { SelectOptionData } from "utils/selectCommon";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast, convertToPrettyNumber } from "utils/common";
import CustomerService from "services/CustomerService";
import { useWindowDimensions } from "utils/hookCustom";
import "./InfoPerson.scss";
import Tippy from "@tippyjs/react";

export default function InfoPerson(props: IInfoPersonProps) {
  const { data } = props;

  const { width } = useWindowDimensions();

  const [listRelationship, setListRelationship] = useState<IOption[]>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSelectOpenRelationship = async () => {
    if (!listRelationship || listRelationship.length === 0) {
      setIsLoading(true);
      const dataOption = await SelectOptionData("relationshipId");
      if (dataOption) {
        setListRelationship(dataOption.length > 0 ? dataOption : []);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data?.relationshipId) {
      onSelectOpenRelationship();
    }

    if (data?.relationshipId === null) {
      setListRelationship([]);
    }
  }, [data]);

  const values = useMemo(
    () =>
    ({
      id: data.id,
      relationshipId: data.relationshipId ?? null,
    } as IUpdateOneRelationshipRequest),
    [data]
  );

  const validations: IValidation[] = [];

  const listField = useMemo(
    () =>
      [
        {
          label: "",
          name: "relationshipId",
          type: "select",
          fill: true,
          options: listRelationship,
          onMenuOpen: onSelectOpenRelationship,
          isLoading: isLoading,
        },
      ] as IFieldCustomize[],
    [listRelationship, isLoading]
  );

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
  }, [values]);

  useEffect(() => {
    if (data.relationshipId !== formData.values?.relationshipId) {
      handleSubmit();
    }
  }, [formData.values?.relationshipId]);

  const handleSubmit = async (e?: any) => {
    e?.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    const body: IUpdateOneRelationshipRequest = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as IUpdateOneRelationshipRequest),
    };

    const response = await CustomerService.updateOneRelationship(body);

    if (response.code === 0) {
      showToast("Cập nhật mối quan hệ khách hàng thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <Fragment>
      <div className="info-left">
        <span className="avatar-person">
          <img src={data.avatar || ThirdGender} alt={data.name} />
        </span>
        <div className="detail-info">
          <span className="name">{data.name}</span>
          <span className="phone">
            <Icon name="Telephone" />
            {data.phoneUnmasked || data.phoneMasked}
          </span>
        </div>
      </div>
      <div className="info-right">
        <div className="customer-relationship vertical-tiles">
          <label className="title">{width > 1440 ? "Mối quan hệ khách hàng" : "Chọn mối quan hệ"}</label>
          <form className="form-update-relationship" onSubmit={(e) => handleSubmit(e)}>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}
              {/* Hiển thị thông báo nếu listField rỗng */}
              {listField.length === 0 && (
                <p style={{ textAlign: 'center'}}>
                  Chưa load được mối quan hệ.
                </p>
              )}
            </div>
            <Button type="submit" className="d-none" />
          </form>
        </div>
        <div className="person-charge vertical-tiles">
          <label className="title">Người phụ trách</label>
          {data?.employeeName ? (
            <div className="info-person-charge">
              <div className="avatar-person-charge">
                <img src={data.employeeAvatar ? data.employeeAvatar : ThirdGender} alt={data.employeeName} />
              </div>
              <div className="detail-person-charge">
                <span className="name">{data.employeeName}</span>
                <span className="position">{data.departmentName}</span>
              </div>
            </div>
          ) : (
            <div className="undefined__employee">
              <span>Chưa chỉ định</span>
              <span>Người phụ trách</span>
            </div>
          )}
        </div>
        <div className="last-contact vertical-tiles">
          <label className="title">Ngày chưa liên hệ</label>
          <span>
            {data.dayNotContact || 0} <span style={{ fontSize: "12px" }}>Ngày</span>
          </span>
        </div>
        <div className="interactive vertical-tiles">
          <label className="title">Tương tác</label>
          <span>
            {data.contactCount || 0} <span style={{ fontSize: "12px" }}>Lần</span>
          </span>
        </div>
        <div className="order-value">
          <label className="title">Giá trị đơn hàng</label>
          <span>{parser(convertToPrettyNumber(data.paid || 0))}</span>
        </div>
      </div>
    </Fragment>
  );
}
