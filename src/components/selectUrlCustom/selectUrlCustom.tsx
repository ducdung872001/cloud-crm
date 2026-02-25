import React, { Fragment, ReactElement, useEffect, useRef, useState } from "react";
import Select, { components } from "react-select";
import { AsyncPaginate } from "react-select-async-paginate";
import { IOption } from "model/OtherModel";
import "./selectUrlCustom.scss";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
import { convertParamsToString } from "reborn-util";

const fetchData = async (Uri: string, params: any, signal?: AbortSignal) => {
  if (!Uri) return { code: -1, message: "No lookupUri provided" };
  let _params = params || {};
  let _uri = Uri;
  if (Uri.includes("?")) {
    const queryString = Uri.split("?")[1];
    const urlParams = new URLSearchParams(queryString);
    _params = {
      ..._params,
      ...Object.fromEntries(urlParams.entries()),
    };
    _uri = Uri.split("?")[0];
  }
  return fetch(`${_uri}${convertParamsToString(_params)}`, {
    signal,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};

interface SelectCustomProps {
  id?: string;
  value?: any;
  defaultValue?: any;
  name?: string;
  className?: string;
  placeholder?: string;
  onChange?: any;
  autoFocus?: boolean;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  error?: boolean;
  message?: string;
  warning?: boolean;
  messageWarning?: string;
  label?: string | ReactElement;
  labelPosition?: "left";
  fill?: boolean;
  required?: boolean;
  warningHistory?: boolean;
  onWarningHistory?: any;
  disabled?: boolean;
  readOnly?: boolean;
  isSearchable?: boolean;
  options?: IOption[];
  isLoading?: boolean;
  onMenuOpen?: () => void;
  refSelect?: any;
  special?: boolean;
  url?: string;
  isLoadAll?: boolean;
  searchKey?: string;
  labelKey?: string;
  valueKey?: string;
  defaultParams?: any;
  mapResultData?: (result: any) => any[];
  isFormatOptionLabel?: boolean;
  formatOptionLabel?: any;
  additional?: any;
  isMulti?: boolean;
  closeMenuOnSelect?: boolean;
  isClearable?: boolean;
  isShowIcon?: boolean;
  icon?: React.ReactElement;
  iconClickEvent?: React.ReactEventHandler;
  isShowDropdownIcon?: boolean;
  maxHeight?: string | number;
  idQueryKey?: string;
  bindingField?: string;
}

export default function SelectUrlCustom(props: SelectCustomProps) {
  const {
    id,
    value,
    defaultValue,
    name,
    className,
    placeholder,
    autoFocus,
    error,
    message,
    warning,
    messageWarning,
    onFocus,
    onBlur,
    disabled,
    readOnly,
    required,
    warningHistory,
    onWarningHistory,
    label,
    labelPosition,
    fill,
    onChange,
    isSearchable,
    options = [],
    isLoading,
    onMenuOpen,
    refSelect,
    url,
    isLoadAll = false,
    searchKey = "name",
    labelKey = "name",
    valueKey = "id",
    defaultParams = {},
    mapResultData,
    isFormatOptionLabel,
    formatOptionLabel,
    additional,
    isMulti = false,
    closeMenuOnSelect = !isMulti,
    special = false,
    isClearable = false,
    isShowIcon,
    icon,
    iconClickEvent,
    isShowDropdownIcon = true,
    maxHeight = "104px",
    idQueryKey = valueKey,
    bindingField,
  } = props;

  const listBindingField = bindingField ? bindingField.split(",").map((item) => item.trim()) : [];

  const [onFocusSelect, setOnFocusSelect] = useState<boolean>(false);
  const [internalValue, setInternalValue] = useState<any>(isMulti ? [] : null);

  const listOptions = useRef([]);
  console.log("value", value);

  const hasValueParams = () => {
    if (isMulti && Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null && value !== undefined && value !== "";
  };

  // chỉ fetch các id chưa có, cache lại option và setInternalValue đúng theo isMulti để tránh load dư và hiển thị sai dữ liệu

  useEffect(() => {
    let listId: any[] = [];

    if (isMulti) {
      if (Array.isArray(value)) {
        listId = value.map((item) => (typeof item === "object" && item !== null && "value" in item ? item.value : item));
      }
    } else {
      if (value !== null && value !== undefined) {
        listId = [typeof value === "object" && value !== null && "value" in value ? value.value : value];
      }
    }

    // id CHƯA có trong cache-> cần fetch
    const fetchIds = listId.filter((item) => !listOptions.current.some((opt) => String(opt.value) === String(item)));

    const fetchInitialValue = async () => {
      try {
        const params = {
          ...defaultParams,
          page: 1,
          limit: 200,
          listId: fetchIds,
        };

        const res = await fetchData(url, params);

        if (res?.code === 0) {
          const dataList = res.result?.items || res.result?.content || res.result || [];

          const mappedData = mapResultData
            ? mapResultData(dataList)
            : dataList.map((item) => ({
                label: item[labelKey],
                value: item[valueKey],
                ...listBindingField.reduce((acc, field) => {
                  if (field in item) acc[field] = item[field];
                  return acc;
                }, {} as any),
              }));

          // cache option
          mappedData.forEach((newItem) => {
            if (!listOptions.current.some((opt) => String(opt.value) === String(newItem.value))) {
              listOptions.current.push(newItem);
            }
          });
        }

        // SET VALUE SAU KHI CACHE ĐỦ
        if (isMulti) {
          setInternalValue(listId.map((id) => listOptions.current.find((opt) => String(opt.value) === String(id))).filter(Boolean));
        } else {
          setInternalValue(listOptions.current.find((opt) => String(opt.value) === String(listId[0])) ?? null);
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (listId.length > 0) {
      fetchInitialValue();
    } else {
      setInternalValue(isMulti ? [] : null);
    }
  }, [value, url, isMulti]);

  const [onHasValue, setOnHasValue] = useState<boolean>(hasValueParams());

  const refSelectDefault = useRef<any>(null);

  // --- api phân trang ---
  const internalLoadOptionsPaginate = async (search, loadedOptions, { page }) => {
    if (!url) return { options: [], hasMore: false };

    try {
      const currentLimit = isLoadAll ? 200 : 10;

      const params = {
        ...defaultParams,
        [searchKey]: search,
        page: page,
        limit: currentLimit,
      };

      const res = await fetchData(url, params);

      if (res && res.code === 0) {
        const dataList = res.result?.items || res.result?.content || res.result || [];
        const totalElements = res.result?.total || res.result?.totalElements || 0;

        let totalPages = res.result?.totalPages || 0;
        if (totalPages === 0 && totalElements > 0) {
          totalPages = Math.ceil(totalElements / currentLimit);
        }

        let mappedOptions = [];

        if (mapResultData) {
          mappedOptions = mapResultData(dataList);
        } else {
          mappedOptions = dataList.map((item) => ({
            label: item[labelKey],
            value: item[valueKey],
            ...listBindingField.reduce((acc, field) => {
              if (field in item) {
                acc[field] = item[field];
              }
              return acc;
            }, {} as any),
          }));
        }
        // Nếu item nào trong mappedData có value trùng với 1 phần tử trong listOptions.current thì giữ nguyên, nếu không thì thêm mới vào listOptions.current
        mappedOptions.forEach((newItem) => {
          if (!listOptions.current.find((opt) => String(opt.value) === String(newItem.value))) {
            listOptions.current.push(newItem);
          }
        });
        const hasMoreData = isLoadAll ? false : page < totalPages;

        return {
          options: mappedOptions,
          hasMore: hasMoreData,
          additional: {
            page: page + 1,
          },
        };
      }
      return { options: [], hasMore: false };
    } catch (e) {
      return { options: [], hasMore: false };
    }
  };

  const CustomDropdownIndicator = (props: any) => {
    return isShowDropdownIcon ? <components.DropdownIndicator {...props} /> : null;
  };

  const handleOnChange = (e: any) => {
    setInternalValue(e);

    if (isMulti) {
      setOnHasValue(e && e.length > 0);
    } else {
      setOnHasValue(e?.value !== null && e?.value !== undefined && e?.value !== "");
    }

    if (refSelect) refSelect.current?.blur();

    if (onChange) onChange(e);
  };

  const dynamicStyles = {
    valueContainer: (provided) => ({
      ...provided,
      maxHeight: isMulti ? maxHeight : "auto",
      overflowY: "auto",
      alignItems: "flex-start",
    }),
  };

  const renderSelectComponent = () => {
    if (url) {
      return (
        <AsyncPaginate
          id={id}
          isMulti={isMulti}
          closeMenuOnSelect={closeMenuOnSelect}
          autoFocus={autoFocus}
          name={name}
          className={`select-custom ${isFormatOptionLabel ? "select__custom-label" : ""} ${isMulti ? "select__custom-multi" : ""}`}
          isSearchable={isSearchable ?? !readOnly}
          defaultValue={defaultValue ?? null}
          // value={value ?? null}
          value={internalValue}
          loadOptions={internalLoadOptionsPaginate}
          placeholder={placeholder ?? " "}
          isLoading={isLoading}
          loadingMessage={() => "Đang tải..."}
          additional={additional || { page: 1 }}
          debounceTimeout={300}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#015aa4",
              primary25: "#e9eaeb",
              primary50: "#e9eaeb",
              neutral0: "#ffffff",
              neutral70: "#015aa4",
            },
          })}
          onChange={handleOnChange}
          onFocus={(e) => {
            setOnFocusSelect(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setOnFocusSelect(false);
            if (onBlur) onBlur(e);
          }}
          isDisabled={disabled}
          openMenuOnClick={!readOnly}
          noOptionsMessage={() => "Không tìm thấy dữ liệu"}
          formatOptionLabel={formatOptionLabel}
          isClearable={isClearable}
          components={{ DropdownIndicator: CustomDropdownIndicator }}
          selectRef={refSelect ?? refSelectDefault}
          styles={dynamicStyles}
        />
      );
    }

    return (
      <Select
        id={id}
        isMulti={isMulti}
        closeMenuOnSelect={closeMenuOnSelect}
        autoFocus={autoFocus}
        name={name}
        className={`select-custom ${isFormatOptionLabel ? "select__custom-label" : ""} ${isMulti ? "select__custom-multi" : ""} ${
          isClearable ? "select__custom--clearable" : ""
        }`}
        isSearchable={isSearchable ?? !readOnly}
        defaultValue={(special ? defaultValue : options.find((o) => o.value === defaultValue)) ?? null}
        value={(special ? value : options.find((o) => o.value === value)) ?? null}
        options={options}
        placeholder={placeholder ?? " "}
        isLoading={isLoading}
        loadingMessage={() => "Đang tải..."}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "#015aa4",
            primary25: "#e9eaeb",
            primary50: "#e9eaeb",
            neutral0: "#ffffff",
            neutral70: "#015aa4",
          },
        })}
        onChange={handleOnChange}
        onFocus={(e) => {
          setOnFocusSelect(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setOnFocusSelect(false);
          if (onBlur) onBlur(e);
        }}
        isDisabled={disabled}
        openMenuOnClick={!readOnly}
        ref={refSelect ?? refSelectDefault}
        noOptionsMessage={() => "Không tìm thấy lựa chọn"}
        onMenuOpen={onMenuOpen}
        formatOptionLabel={formatOptionLabel}
        components={{ DropdownIndicator: CustomDropdownIndicator }}
        styles={dynamicStyles}
      />
    );
  };

  return (
    <div
      className={`select-url${fill ? " select-url-fill" : ""}${onFocusSelect ? " on-focus" : ""}${error ? " invalid" : ""}${
        warning ? " warning" : ""
      }${onHasValue ? " has-value" : ""}${label ? " has-label" : ""}${label && labelPosition ? ` has-label__${labelPosition}` : ""}${
        className ? " " + className : ""
      }${disabled ? " has-disabled" : ""} ${icon ? "select-url-icon" : ""}`}
    >
      {label && (
        <Fragment>
          <div style={{ display: "flex" }}>
            <label htmlFor={name}>
              {label}
              {required && <span className="required"> * </span>}
            </label>
            {warningHistory && (
              <Tippy content={"Lịch sử thay đổi"}>
                <div style={{ alignItems: "center", display: "flex", marginLeft: 5, marginBottom: 5, cursor: "pointer" }} onClick={onWarningHistory}>
                  <Icon name="WarningCircle" style={{ width: "1.5rem", height: "1.5rem", fill: "var(--warning-color)" }} />
                </div>
              </Tippy>
            )}
          </div>
          {renderSelectComponent()}
        </Fragment>
      )}

      {!label && renderSelectComponent()}

      {icon && isShowIcon && (
        <span onClick={iconClickEvent ? iconClickEvent : undefined} className={`icon${iconClickEvent ? " has-event" : ""}`}>
          {icon}
        </span>
      )}
      {error && message && <div className="has-error">{message}</div>}
      {warning && messageWarning && <div className="has-warning">{messageWarning}</div>}
    </div>
  );
}
