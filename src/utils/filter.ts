import _ from "lodash";
import { IFilterItem, ISaveSearch } from "model/OtherModel";

// Tạo param từ bộ lọc và saveSearch
export function BuildObjectFilter(params: any, listFilter: IFilterItem[], saveSearch?: ISaveSearch) {
  let result = {};
  const paramsOld = _.cloneDeep(params);
  if (listFilter) {
    listFilter.map((filterItem) => {
      if (saveSearch && saveSearch.params) {
        const saveSearchCurrent = saveSearch.params.find((param) => param.key === filterItem.key);
        if (saveSearchCurrent) {
          if (filterItem.type === "date-two" || filterItem.type === "date") {
            let paramName = filterItem.param_name;
            paramName = paramName ? paramName : ["fromTime", "toTime"];

            saveSearchCurrent.value || saveSearchCurrent.value === 0
              ? (result[paramName[0]] = saveSearchCurrent.value)
              : delete paramsOld[paramName[0]];
            saveSearchCurrent.value_extra || saveSearchCurrent.value_extra === 0
              ? (result[paramName[1]] = saveSearchCurrent.value_extra)
              : delete paramsOld[paramName[1]];
          } else {
            saveSearchCurrent.value || saveSearchCurrent.value === 0
              ? (result[saveSearchCurrent.key] = saveSearchCurrent.value)
              : delete paramsOld[saveSearchCurrent.key];
          }
        } else {
          delete paramsOld[filterItem.key];
        }
      } else {
        if (filterItem.type === "date-two" || filterItem.type === "date") {
          let paramName = filterItem.param_name;
          paramName = paramName ? paramName : ["fromTime", "toTime"];

          filterItem.value || filterItem.value === 0 ? (result[paramName[0]] = filterItem.value) : delete paramsOld[paramName[0]];
          filterItem.value_extra || filterItem.value_extra === 0 ? (result[paramName[1]] = filterItem.value_extra) : delete paramsOld[paramName[1]];
        } else {
          filterItem.value || filterItem.value === 0 ? (result[filterItem.key] = filterItem.value) : delete paramsOld[filterItem.key];
        }
      }
    });
  }
  if (saveSearch && saveSearch.params) {
    const query = saveSearch.params.find((param) => param.key === "keyword");
    if (query) {
      result["keyword"] = query.value;
    }
  }
  result = { ...paramsOld, ...result };
  return result;
}

export function clearFilter(params: any, listFilter: IFilterItem[]) {
  const paramsOld = _.cloneDeep(params);
  listFilter?.map((filterItem) => {
    let paramName = filterItem.param_name;
    paramName = paramName ? paramName : ["fromTime", "toTime"];

    switch (filterItem.type) {
      case "date":
        delete paramsOld[paramName[0]];
        break;
      case "date-two":
        delete paramsOld[paramName[0]];
        delete paramsOld[paramName[1]];
        break;
      default:
        delete paramsOld[filterItem.key];
        break;
    }
  });
  paramsOld["keyword"] = "";
  return paramsOld;
}
