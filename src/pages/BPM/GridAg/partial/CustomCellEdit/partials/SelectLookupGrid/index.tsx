import React, { ReactElement, useState, useEffect, useRef } from "react";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import ProjectRealtyService from "services/ProjectRealtyService";

import FieldListService from "services/FieldListService";
import { IColumnGrid } from "pages/BPM/GridForm";
import { useGridAg } from "pages/BPM/GridAg/GridAgContext";
import { convertParamsToString } from "reborn-util";

interface SelectLookupProps {
  id?: string;
  value?: any; //string | number
  defaultValue?: any;
  name?: string;
  lookup: string;
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
  //   options: IOption[];
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

  listColumn?: IColumnGrid[];
  setListColumn?: (listColumn: IColumnGrid[]) => void;
  setDataRow?: (dataRow: IColumnGrid[]) => void;
  columnIndex?: number;
  rowIndex?: number;
  bindingField?: any[];
  bindingKey?: string;
  dataRow?: any[];
  setListLoadBindingField?: (listLoadBindingField: any[]) => void;
  listLoadBindingField?: any[];
  // lookupValues: any;
  loading: boolean;
  styleCustom?: any;
  col?: any;
}

export const fetchLookupData = async (lookupUri: string, params: any, signal?: AbortSignal) => {
  if (!lookupUri) return { code: -1, message: "No lookupUri provided" };
  return fetch(`${lookupUri}${convertParamsToString(params)}`, {
    signal,
    method: "GET",
  }).then((res) => res.json());
};

function SelectLookupGrid(props: SelectLookupProps) {
  const { id, value, lookup, bindingField, bindingKey, name, placeholder, disabled, onChange, isMulti = false, loading, styleCustom, col } = props;

  const { lookupValues, setLookupValues } = useGridAg();
  const [dataLookup, setDataLookup] = useState(null);
  const [listDataLookupInternal, setListDataLookupInternal] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Hủy poll nếu component bị unmount
  const abortRef = useRef<AbortController | null>(null);

  const loadValueLookup = async (id) => {
    setDataLookup(listDataLookupInternal.find((item) => item.value === id) || null);
  };
  const abortController = new AbortController();
  abortRef.current = abortController;
  //! đoạn này xử lý call api lấy ra list lookup
  const loadOptionLookup = async (search, loadedOptions, { page }) => {
    const paramLookup = col.cellEditorParams.paramLookup
      ? col.cellEditorParams.paramLookup.reduce((obj, item) => {
          obj[item.key] = item.value;
          return obj;
        }, {})
      : {};
    const param: any = {
      keyword: search,
      name: search,
      page: page,
      limit: 10,
      ...paramLookup,
    };

    let response = {
      code: 0,
      result: {
        items: [],
        loadMoreAble: false,
      },
    };
    try {
      setIsLoading(true); // Bắt đầu loading
      response = await fetchLookupData(col.cellEditorParams.lookupUri, param, abortController.signal);

      if (response.code === 0) {
        const dataOption = response.result.items;
        return {
          options: [
            ...(dataOption?.length > 0
              ? dataOption.map((item: any) => {
                  return {
                    value: item.id,
                    label: col?.cellEditorParams?.fieldLabelLookup?.key
                      ? item[col.cellEditorParams.fieldLabelLookup.key]
                        ? item[col.cellEditorParams.fieldLabelLookup.key]
                        : item?.name || "No name"
                      : item?.name || "No name",
                    ...(bindingField?.length > 0
                      ? bindingField.reduce((acc, field) => {
                          acc[field.key] = item[field.value] || "";
                          return acc;
                        }, {})
                      : {}),
                    bindingField: bindingField,
                    options_value: [],
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
    } catch (error) {
      console.error("Error loading options:", error);
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  useEffect(() => {
    if (value && listDataLookupInternal.length) {
      loadValueLookup(parseInt(value));
    } else {
      setDataLookup(null);
    }
  }, [value, listDataLookupInternal]);

  useEffect(() => {
    if (lookupValues && lookupValues[lookup] && lookupValues[lookup].listValue) {
      setListDataLookupInternal((prevData) => {
        return [...prevData, ...lookupValues[lookup].listValue];
      });
    } else {
      setListDataLookupInternal([]);
    }
  }, [lookupValues]);

  const handleChangeValueLookup = (e) => {
    setDataLookup(e);
    if (e != null) {
      setLookupValues((prev) => {
        return {
          ...prev,
          [lookup]: {
            ...prev[lookup],
            values: prev[lookup]?.values?.includes(e.value) ? [...prev[lookup].values] : [...(prev[lookup]?.values || []), e.value],
            listValue: prev[lookup]?.listValue?.find((item) => item.value === e.value)
              ? [...prev[lookup].listValue]
              : [...(prev[lookup]?.listValue || []), e],
          },
        };
      });
      if (!listDataLookupInternal.find((item) => item.value === e.value)) {
        // Nếu giá trị mới không có trong danh sách hiện tại, thêm vào danh sách
        setListDataLookupInternal((prevData) => {
          return [...prevData, e];
        });
      }
    }
  };

  const formatOptionLabelLookup = ({ label }) => {
    return <div className="selected--item">{label}</div>;
  };

  return (
    <SelectCustom
      key={`${name}_${bindingField?.length}_${bindingKey}_${value}_${lookup}`}
      id={id}
      name={name}
      options={[]}
      value={dataLookup}
      isMulti={isMulti}
      onChange={(e) => {
        handleChangeValueLookup(e);
        onChange(e);
      }}
      isClearable={true}
      isLoading={isLoading}
      disabled={disabled}
      isAsyncPaginate={true}
      isFormatOptionLabel={true}
      loadOptionsPaginate={loadOptionLookup}
      placeholder={placeholder.length > 20 ? `${placeholder.substring(0, 20)}...` : placeholder}
      additional={{
        page: 1,
      }}
      formatOptionLabel={formatOptionLabelLookup}
      styleCustom={{ ...styleCustom }}
    />
  );
}

// Bọc bằng React.memo
export default React.memo(SelectLookupGrid);
