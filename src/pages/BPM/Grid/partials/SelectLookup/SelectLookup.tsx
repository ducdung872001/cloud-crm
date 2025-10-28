import React, { Fragment, ReactElement, useRef, useState, useContext, useEffect } from "react";
import Select from "react-select";
import { AsyncPaginate } from "react-select-async-paginate";
import AsyncSelect from "react-select/async";
import { IOption } from "model/OtherModel";
import "./SelectLookup.scss";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
import SelectCustom from "components/selectCustom/selectCustom";
import { ContextType, UserContext } from "contexts/userContext";
import CustomerService from "services/CustomerService";
// import BlackListService from "services/BlackListService";

import { use } from "i18next";
import ReasonListBpmService from "services/ReasonListBpmService";
import ProjectCatalogService from "services/ProjectCatalogService";
import ProjectRealtyService from "services/ProjectRealtyService";
import UnitService from "services/UnitService";
import MaterialService from "services/MaterialService";
import FieldListService from "services/FieldListService";
import BusinessCategoryService from "services/BusinessCategoryService";
import InvestorService from "services/InvestorService";
import ProcurementService from "services/ProcurementService";
import { IColumnGrid } from "../..";
import SupplierService from "services/SupplierService";
import WorkCategoryService from "services/WorkCategoryService";

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
  columnIndex?: number;
  bindingField?: any[];
  bindingKey?: string;
}

export default function SelectLookup(props: SelectLookupProps) {
  const {
    id,
    value,
    lookup,
    listColumn,
    setListColumn,
    columnIndex,
    bindingField,
    bindingKey,
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
    // options,
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
  } = props;

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [dataLookup, setDataLookup] = useState(null);

  const loadValueLookup = async (id) => {
    let response = {
      code: 0,
      result: null,
    };
    switch (lookup) {
      case "customer":
        response = await CustomerService.detail(id);
        break;
      case "reason":
        response = await ReasonListBpmService.detail(id);
        break;
      case "project_catalog":
        response = await ProjectCatalogService.detail(id);
        break;
      case "project_realty":
        response = await ProjectRealtyService.detail(id);
        break;
      case "unit":
        response = await UnitService.detail(id);
        break;
      case "material":
        response = await MaterialService.detail(id);
        break;
      case "field":
        response = await FieldListService.detail(id);
        break;
      case "business_category":
        response = await BusinessCategoryService.detail(id);
        break;
      case "supplier":
        response = await SupplierService.detail(id);
        break;
      case "investor":
        response = await InvestorService.detail(id);
        break;
      case "procurement_type":
        response = await ProcurementService.detail(id);
        break;
      case "work_category":
        response = await WorkCategoryService.detail(id);
        break;
      default:
        break;
    }

    if (response.code === 0) {
      const dataDetailLookup = response.result;
      let data_lookup = {
        value: dataDetailLookup?.id,
        label:
          lookup == "reason"
            ? dataDetailLookup?.reason || "No name"
            : lookup == "material"
            ? dataDetailLookup?.code + " - " + dataDetailLookup?.name || "No code"
            : lookup == "unit"
            ? dataDetailLookup?.code + " - " + dataDetailLookup?.name || "No code"
            : lookup == "work_category"
            ? dataDetailLookup?.code + " - " + dataDetailLookup?.name || "No code"
            : dataDetailLookup?.name || "No name",
        ...(bindingField?.length > 0
          ? bindingField.reduce((acc, field) => {
              acc[field.key] = dataDetailLookup[field.value] || "";
              return acc;
            }, {})
          : {}),
        options_value:
          dataDetailLookup?.contactOrg && JSON.parse(dataDetailLookup?.contactOrg)?.length
            ? JSON.parse(dataDetailLookup?.contactOrg).map((el) => {
                return {
                  value: el.name + " - " + el.phone,
                  label: el.name,
                  isDefault: el.isDefault == 1 ? true : false,
                };
              })
            : [],
      };
      setListColumn(
        listColumn.map((item, index) => {
          if (index === columnIndex) {
            if (item?.options?.length) {
              if (!item.options.find((o) => o.value == data_lookup.value)) {
                item.options.push(data_lookup);
              }
            } else {
              item.options = [data_lookup];
            }
          }
          return item;
        })
      );
      setDataLookup(data_lookup);
    }
  };

  useEffect(() => {
    if (value && !dataLookup) {
      loadValueLookup(parseInt(value));
    }
  }, [value, listColumn]);

  const [listOption, setListOption] = useState<IOption[]>([]);
  useEffect(() => {
    if (listOption.length > 0) {
      if (listColumn && setListColumn && columnIndex) {
        listOption.map((item) => {
          if (listColumn[columnIndex]?.options?.length) {
            if (!listColumn[columnIndex].options.find((o) => o.value === item.value)) {
              setListColumn(
                listColumn.map((el, index) => {
                  if (index === columnIndex) {
                    el.options.push(item);
                  }
                  return el;
                })
              );
            }
          } else {
            setListColumn(
              listColumn.map((el, index) => {
                if (index === columnIndex) {
                  let newItem = {
                    ...el,
                    options: [item],
                  };
                  return newItem;
                }
                return el;
              })
            );
          }
        });
      }
    }
  }, [listOption]);
  console.log("bindingKey>>", bindingKey);

  //! đoạn này xử lý call api lấy ra list lookup
  const loadOptionLookup = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      name: search,
      page: page,
      limit: 10,
      active: 1,
      status: 1,
      // branchId: dataBranch.value || 0,
    };

    let response = {
      code: 0,
      result: {
        items: [],
        loadMoreAble: false,
      },
    };
    switch (lookup) {
      case "customer":
        response = await CustomerService.filter(param);
        break;
      case "reason":
        response = await ReasonListBpmService.list(param);
        break;
      case "project_catalog":
        response = await ProjectCatalogService.list(param);
        break;
      case "project_realty":
        response = await ProjectRealtyService.list(param);
        break;
      case "unit":
        response = await UnitService.list(param);
        break;
      case "material":
        response = await MaterialService.list(param);
        break;
      case "field":
        response = await FieldListService.list(param);
        break;
      case "business_category":
        response = await BusinessCategoryService.list(param);
        break;
      case "supplier":
        response = await SupplierService.list(param);
        break;
      case "investor":
        response = await InvestorService.list(param);
        break;
      case "procurement_type":
        response = await ProcurementService.list(param);
        break;
      case "work_category":
        response = await WorkCategoryService.list(param);
        break;
      default:
        break;
    }

    if (response.code === 0) {
      const dataOption = response.result.items;
      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: any) => {
                if (!listOption.find((o) => o.value === item.id)) {
                  setListOption([...listOption, { value: item.id, label: item?.name || "No name" }]);
                }
                return {
                  value: item.id,
                  label:
                    lookup == "reason"
                      ? item?.reason || "No name"
                      : lookup == "material"
                      ? item?.code + " - " + item?.name || "No code"
                      : lookup == "unit"
                      ? item?.code + " - " + item?.name || "No code"
                      : lookup == "work_category"
                      ? item?.code + " - " + item?.name || "No code"
                      : item?.name || "No name",
                  ...(bindingField?.length > 0
                    ? bindingField.reduce((acc, field) => {
                        acc[field.key] = item[field.value] || "";
                        return acc;
                      }, {})
                    : {}),
                  options_value:
                    item?.contactOrg && JSON.parse(item?.contactOrg)?.length
                      ? JSON.parse(item?.contactOrg).map((el) => {
                          return {
                            value: el.name + " - " + el.phone,
                            label: el.name,
                            isDefault: el.isDefault == 1 ? true : false,
                          };
                        })
                      : [],
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

  const handleChangeValueLookup = (e) => {
    setDataLookup(e);
  };

  const formatOptionLabelLookup = ({ label }) => {
    return <div className="selected--item">{label}</div>;
  };

  return (
    <SelectCustom
      key={`${name}_${bindingField?.length}_${bindingKey}`}
      id={id}
      name={name}
      options={[]}
      value={dataLookup}
      onChange={(e) => {
        onChange(e);
        handleChangeValueLookup(e);
      }}
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
