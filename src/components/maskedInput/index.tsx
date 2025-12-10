import Icon from "components/icon";
import Input from "components/input/input";
import React, { useEffect, useState } from "react";
import PartnerService from "services/PartnerService";
import { showToast } from "utils/common";

export default function MaskedInput(props) {
  const { field, handleUpdate, value, id } = props;
  const [isShow, setIsShow] = useState<boolean>(false);
  const [valueShow, setValueShow] = useState("");
  useEffect(() => {
    console.log("value>>>", value);

    setValueShow(value);
  }, []);
  const handleShow = async (id: number) => {
    const response = await PartnerService.viewPhone(id);

    if (response.code == 0) {
      const result = response.result;
      console.log("result", result);
      setValueShow(result);

      //   setFormData({ ...formData, values: { ...formData?.values, phone: result } });
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem !", "error");
    } else {
      showToast(response.message, "error");
    }
  };
  useEffect(() => {
    if (isShow && id) {
      handleShow(id);
    }
    if (!isShow && id) {
      setValueShow(value);
    }
  }, [isShow, id]);
  return (
    <Input
      type={field.type}
      label={!field.labelHidden && field.label}
      labelPosition={field.labelPosition}
      name={field.name}
      nameOptions={field.nameOptions}
      //   valueOptions={formData?.values[field.nameOptions] ?? null}
      options={field.options}
      onChangeValueOptions={field.onChangeValueOptions}
      id={field.name}
      disabled={field.disabled}
      fill={field.fill}
      //   placeholder={field.placeholder}
      onFocus={field.onFocus}
      onChange={(e) => {
        if (isShow) {
          setValueShow(e.target.value);
          handleUpdate(field.name, e.target.value);
        }
      }}
      onClick={field.onClick}
      onBlur={field.onBlur}
      onKeyDown={field.onKeyDown}
      onKeyUp={field.onKeyUp}
      onKeyPress={field.onKeyPress}
      className={field.className}
      readOnly={field.readOnly}
      value={valueShow}
      maxLength={field.maxLength}
      refInput={field.refElement}
      autoComplete={field.autoComplete}
      required={field.required}
      //   error={formData?.errors && !!formData?.errors[field.name]}
      //   message={formData?.errors ? formData?.errors[field.name] : ""}
      warning={field.isWarning}
      messageWarning={field.messageWarning}
      icon={id && (!isShow ? <Icon name="EyeSlash" /> : <Icon name="Eye" />)}
      iconPosition={field.iconPosition}
      iconClickEvent={() => setIsShow(!isShow)}
    />
  );
}
