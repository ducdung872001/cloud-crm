import React, { ReactElement, useState, useEffect } from "react";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import ProjectRealtyService from "services/ProjectRealtyService";

import FieldListService from "services/FieldListService";
import { IColumnGrid } from "pages/BPM/GridForm";

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
  lookupValues: any;
  loading: boolean;
}

function SelectMultiLookupOla(props: SelectLookupProps) {
  const { id, value, lookup, bindingField, bindingKey, name, placeholder, disabled, onChange, isMulti = false, lookupValues, loading } = props;

  const [dataLookup, setDataLookup] = useState([]);
  const [listDataLookupInternal, setListDataLookupInternal] = useState([]);

  const loadValueLookup = async (lstId) => {
    setDataLookup(listDataLookupInternal.filter((item) => lstId.includes(item.value)));
  };

  //! đoạn này xử lý call api lấy ra list lookup
  const loadOptionLookup = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      name: search,
      page: page,
      limit: 10,
      active: 1,
      status: 1,
    };

    let response = {
      code: 0,
      result: {
        items: [],
        loadMoreAble: false,
      },
    };
    switch (lookup) {
      case "project_realty":
        response = await ProjectRealtyService.list(param);
        break;
      case "field":
        response = await FieldListService.list(param);
        break;
      default:
        break;
    }

    if (response.code === 0) {
      const dataOption = response.result.items;
      return {
        options: [
          ...(dataOption?.length > 0
            ? dataOption.map((item: any) => {
                return {
                  value: item.id,
                  label: item?.name || "No name",
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
  };

  useEffect(() => {
    if (value && listDataLookupInternal.length) {
      loadValueLookup(value.map((item) => parseInt(item)));
    } else {
      setDataLookup(null);
    }
  }, [value, listDataLookupInternal]);

  useEffect(() => {
    if (lookupValues && lookupValues[lookup] && lookupValues[lookup].listValue) {
      setListDataLookupInternal((prevData) => {
        // Kết hợp dữ liệu cũ và mới
        const combinedData = [...prevData, ...lookupValues[lookup].listValue];

        // Lọc trùng lặp theo trường 'value'
        const uniqueData = Array.from(new Map(combinedData.map((item) => [item.value, item])).values());

        return uniqueData;
      });
    } else {
      setListDataLookupInternal([]);
    }
  }, [lookupValues]);

  const handleChangeValueLookup = (e) => {
    setDataLookup(e);
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
        onChange(e);
        handleChangeValueLookup(e);
        if (!listDataLookupInternal.find((item) => item.value === e.value)) {
          // Nếu giá trị mới không có trong danh sách hiện tại, thêm vào danh sách
          setListDataLookupInternal((prevData) => {
            const mergedArray = [...prevData, ...e];
            const uniqueArray = Array.from(new Map(mergedArray.map((item) => [item.value, item])).values());
            return uniqueArray;
          });
        }
      }}
      isLoading={loading}
      disabled={disabled}
      isAsyncPaginate={true}
      isFormatOptionLabel={true}
      loadOptionsPaginate={loadOptionLookup}
      placeholder={placeholder.length > 20 ? `${placeholder.substring(0, 20)}...` : placeholder}
      additional={{
        page: 1,
      }}
      formatOptionLabel={formatOptionLabelLookup}
    />
  );
}

// Bọc bằng React.memo
export default React.memo(SelectMultiLookupOla);
