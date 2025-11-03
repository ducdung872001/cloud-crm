import React, { Fragment, ReactElement, useEffect, useRef, useState } from "react";
import Select, { components } from "react-select";
import { AsyncPaginate } from "react-select-async-paginate";
import AsyncSelect from "react-select/async";
import { IOption } from "model/OtherModel";
import "./selectTree.scss";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
import { use } from "i18next";

interface SelectCustomProps {
  id?: string;
  value?: any; //string | number
  defaultValue?: any;
  name?: string;
  className?: string;
  placeholder?: string;
  onChange?: any;
  autoFocus?: boolean;
  onFocus?: (e) => void;
  onBlur?: (e) => void;
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
  options: IOption[];
  isLoading?: boolean;
  onMenuOpen?: () => void;
  refSelect?: any;
  special?: boolean;

  //Async
  isAsync?: boolean;
  loadOptions?: (inputValue: string, callback: any) => void;

  //Hiển thị hình ảnh người dùng
  isFormatOptionLabel?: boolean;
  formatOptionLabel?: any;

  //đoạn này hiển thị phân trang khi cuộn xuống
  isAsyncPaginate?: boolean;
  loadOptionsPaginate?: any;
  additional?: any;
  isMulti?: boolean;
  isClearable?: boolean;

  // icon
  isShowIcon?: boolean;
  icon?: React.ReactElement;
  iconClickEvent?: React.ReactEventHandler;
  isShowDropdownIcon?: boolean;
  chooseParent?: boolean;
}

export default function SelectTree(props: SelectCustomProps) {
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
    options,
    isLoading,
    onMenuOpen,
    refSelect,
    isAsync,
    loadOptions,
    isFormatOptionLabel,
    formatOptionLabel,

    isAsyncPaginate,
    loadOptionsPaginate,
    additional,
    isMulti = false,
    special = false,
    isClearable = false,
    isShowIcon,
    icon,
    iconClickEvent,
    isShowDropdownIcon = true,
    chooseParent = true,
  } = props;
  const [onFocusSelect, setOnFocusSelect] = useState<boolean>(false);
  const [onHasValue, setOnHasValue] = useState<boolean>(options.find((o) => o.value === value) ? true : false);
  const refSelectDefault = useRef(null);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<any>(value);

  const CustomDropdownIndicator = (props) => {
    return isShowDropdownIcon ? <components.DropdownIndicator {...props} /> : null;
  };

  const [data, setData] = useState([]);
  const [dataShow, setDataShow] = useState([]);

  useEffect(() => {
    if (!isAsyncPaginate) {
      setData(options || []);
    }
  }, [options]);

  const [valueChoose, setValueChoose] = useState({
    label: "",
    value: "",
  });

  const [valueSearch, setValueSearch] = useState<any>("");
  useEffect(() => {
    if (value) {
      if (data.length == 0) {
        if (isAsyncPaginate) {
          setValueChoose(value);
        }
      } else {
        // trải phẳng dữ liệu data
        const flattenData = (data) => {
          let result = [];
          data.forEach((item) => {
            result.push(item);
            if (item.children) {
              result = result.concat(flattenData(item.children));
            }
          });
          return result;
        };
        const flatData = flattenData(data);

        let newData = flatData.find((item) => (isAsyncPaginate ? item.value === value.value : item.value == value));
        if (newData) {
          setValueChoose({
            label: newData.label,
            value: newData.value,
          });
        }
      }
      let newDataExpand = data.map((item) => {
        if (item.children && item.children.length > 0) {
          let itemValue = item.children.find((child) => (isAsyncPaginate ? child.value === value.value : child.value == value));
          if (itemValue) {
            item.isExpand = true;
          }
        }
        return item;
      });
      setDataShow(newDataExpand);
    } else {
      setValueChoose({
        label: "",
        value: "",
      });
      setDataShow(data);
    }
  }, [value, data]);

  const containerRef = useRef(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      handleBlur(); // Hàm bạn muốn gọi khi blur ra ngoài
    }
  };

  const handleBlur = () => {
    setDropdownVisible(false);
    setOnFocusSelect(false);
    setValueSearch("");
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [dataAsync, setDataAsync] = useState({
    options: [],
    hasMore: true,
    additional: {
      page: 1,
    },
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleScroll = (event) => {
    if (!isAsyncPaginate || isLoadingMore) return;
    const scrollTop = Math.round(event.target.scrollTop || 0);
    const clientHeight = Math.round(event.target.clientHeight || 0);
    const scrollHeight = Math.round(event.target.scrollHeight || 0);

    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    if (scrollBottom < 2 && dataAsync?.hasMore) {
      setIsLoadingMore(true);
      setTimeout(async () => {
        loadMore();
      }, 500);
    }
  };
  const loadMore = async () => {
    const dataAsyncNew = await loadOptionsPaginate(valueSearch, {}, { page: dataAsync.additional.page });
    setDataAsync({
      ...dataAsyncNew,
      options: [...data, ...dataAsyncNew.options],
    });
    setData([...data, ...dataAsyncNew.options]);
    setIsLoadingMore(false);
  };

  const loadOptionsFirst = async () => {
    if (!isAsyncPaginate || !onFocusSelect) return;
    const dataAsyncNew = await loadOptionsPaginate(valueSearch, {}, { page: 1 });
    setDataAsync(dataAsyncNew);
    setData(dataAsyncNew.options);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    if (onFocusSelect && isAsyncPaginate && data.length === 0) {
      setIsLoadingMore(true);
      loadOptionsFirst();
    }
  }, [onFocusSelect, isAsyncPaginate, data]);

  let debounceTimeout: NodeJS.Timeout;
  useEffect(() => {
    setDataAsync({
      options: [],
      hasMore: true,
      additional: {
        page: 1,
      },
    });
    clearTimeout(debounceTimeout); // Xóa timeout trước đó nếu có
    debounceTimeout = setTimeout(() => {
      loadOptionsFirst();
    }, 500); // Đợi 500ms trước khi thực thi

    return () => clearTimeout(debounceTimeout); // Dọn dẹp timeout khi component unmount
  }, [valueSearch, onFocusSelect]);

  const selectComponent = () => {
    if (isMulti) {
      return <div>Chọn nhiều</div>;
    } else {
      return (
        <div className="base-select-tree-wrapper" ref={containerRef}>
          <div className="base-select-tree">
            {isLoadingMore ? (
              <div className="base-select-tree-loading">
                Loading <Icon name="Loading" />
              </div>
            ) : (
              <>
                {!onFocusSelect && valueChoose?.label ? (
                  <input
                    className="input-select"
                    type="text"
                    value={valueChoose?.label}
                    onFocus={() => {
                      setDropdownVisible(true);
                      setOnFocusSelect(true);
                    }}
                  />
                ) : (
                  <input
                    placeholder={placeholder || "Nhập từ khóa tìm kiếm..."}
                    className="input-select"
                    type="text"
                    value={valueSearch}
                    onFocus={() => {
                      setDropdownVisible(true);
                      setOnFocusSelect(true);
                    }}
                    onChange={(e) => {
                      setValueSearch(e.target.value);
                    }}
                  />
                )}
              </>
            )}

            {isClearable && valueChoose?.value ? (
              <div
                className="icon-clear"
                onClick={() => {
                  onChange({
                    value: "",
                    label: "",
                  });
                  setValueChoose({
                    label: "",
                    value: "",
                  });
                  setValueSearch("");
                }}
              >
                <Icon name="Times" />
              </div>
            ) : (
              <div
                className="icon-dropdown"
                onClick={() => {
                  setDropdownVisible(!dropdownVisible);
                  setOnFocusSelect(!onFocusSelect);
                }}
              ></div>
            )}
          </div>
          {dropdownVisible ? (
            <>
              <div className="base-select-tree-dropdown" onScroll={handleScroll}>
                {dataShow.map((item, index) => {
                  return (
                    <>
                      <div
                        className={`item-parent${(isAsyncPaginate ? item.value == value.value : item.value == value) ? " active" : ""}${
                          item.disabled ? " disabled" : ""
                        }`}
                        onClick={() => {
                          if (!chooseParent) {
                            const newData = [...dataShow];
                            newData[index].isExpand = !newData[index].isExpand;
                            setDataShow(newData);
                          } else {
                            onChange({ value: item.value, label: item.label });
                            setDropdownVisible(false);
                            setOnFocusSelect(false);
                            setValueSearch("");
                          }
                        }}
                      >
                        <div
                          className="button-expand"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newData = [...dataShow];
                            newData[index].isExpand = !newData[index].isExpand;
                            setDataShow(newData);
                          }}
                        >
                          {item?.isExpand ? "-" : "+"}
                        </div>
                        {item.label}
                      </div>
                      {item?.children && item?.children.length > 0 && item?.isExpand ? (
                        <div className="item-child">
                          {item?.children.map((child, idx) => {
                            return (
                              <div
                                className={`item-child-item${(isAsyncPaginate ? child.value == value.value : child.value == value) ? " active" : ""}${
                                  child.disabled ? " disabled" : ""
                                }`}
                                onClick={() => {
                                  onChange({
                                    value: child.value,
                                    label: child.label,
                                  });
                                  setDropdownVisible(false);
                                  setOnFocusSelect(false);
                                  setValueSearch("");
                                }}
                              >
                                {child.label}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      );
    }
  };

  return (
    <div
      className={`base-select${fill ? " base-select-fill" : ""}${onFocusSelect ? " on-focus" : ""}${error ? " invalid" : ""}${
        warning ? " warning" : ""
      }${onHasValue ? " has-value" : ""}${label ? " has-label" : ""}${label && labelPosition ? ` has-label__${labelPosition}` : ""}${
        className ? " " + className : ""
      }${disabled ? " has-disabled" : ""} ${icon ? "base-select-icon" : ""}`}
    >
      {label ? (
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

          {selectComponent()}
        </Fragment>
      ) : (
        <Fragment>{selectComponent()}</Fragment>
      )}
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
