import Icon from "components/icon";
import Input from "components/input/input";
import React, { useEffect, useState } from "react";
import { convertParamsToString } from "reborn-util";
import { showToast } from "utils/common";

export const fetchData = async (Uri: string, params: any, signal?: AbortSignal) => {
  if (!Uri) return { code: -1, message: "No lookupUri provided" };
  return fetch(`${Uri}${convertParamsToString(params)}`, {
    signal,
    method: "GET",
  }).then((res) => res.json());
};

export default function MaskedInput(props) {
  const { field, handleUpdate, value, valueOfKey, originalValue, url } = props;
  const [isShow, setIsShow] = useState<boolean>(false);
  const [valueShow, setValueShow] = useState("");
  useEffect(() => {
    setValueShow(value);
  }, []);

  useEffect(() => {
    if (!originalValue || originalValue == "") {
      setIsShow(true);
    }
  }, [originalValue]);
  const handleShow = async (valueOfKey: number) => {
    const response = await fetchData(url, { id: valueOfKey });

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
    if (isShow && valueOfKey) {
      handleShow(valueOfKey);
    }
    if (!isShow && valueOfKey) {
      setValueShow(originalValue);
    }
  }, [isShow, valueOfKey]);
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
        if (isShow || !valueOfKey) {
          setValueShow(e.target.value);
          handleUpdate(e.target.value);
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
      icon={valueOfKey && (!isShow ? <Icon name="EyeSlash" /> : <Icon name="Eye" />)}
      iconPosition={field.iconPosition}
      iconClickEvent={() => setIsShow(!isShow)}
    />
  );
}
