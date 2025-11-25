import { convertToId } from "reborn-util";
import FieldListService from "services/FieldListService";
import ProjectRealtyService from "services/ProjectRealtyService";
import { fetchLookupData } from "../partial/CustomCellEdit/partials/SelectLookupGrid";

export const lookupOptions = [
  //   {
  //     value: "project_catalog",
  //     label: "Loại dự án",
  //   },
  {
    value: "project_realty",
    label: "Dự án",
  },
  {
    value: "field",
    label: "Lĩnh vực",
  },
  //   {
  //     value: "business_category",
  //     label: "Ngành nghề kinh doanh",
  //   },
  //   {
  //     value: "supplier",
  //     label: "Nhà cung cấp",
  //   },
  //   {
  //     value: "investor",
  //     label: "Chủ đầu tư",
  //   },
  //   {
  //     value: "procurement_type",
  //     label: "Loại yêu cầu mua sắm",
  //   },
  //   {
  //     value: "work_category",
  //     label: "Công việc",
  //   },
];

export const fetchDataLookupGrid = async (columnsConfig, dataRow) => {
  try {
    let getLookupValuesResult = await getLookupValue(columnsConfig, dataRow);
    return getLookupValuesResult;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const genKeyLookupGrid = (field) => {
  const stringKey =
    field.lookupUri +
    (field?.paramLookup?.length
      ? field.paramLookup
          .map((param) => {
            return `_${param.key}_${param.value}`;
          })
          .join("")
      : "");
  const key = stringKey.replaceAll("/", "_").replaceAll("-", "_").replaceAll(" ", "_").replaceAll(":", "_").replaceAll(".", "_");
  return key;
};

const getLookupValue = async (columnsConfig, dataRow) => {
  // Lăp qua từng row trong dataRow
  // Lặp qua từng field trong row
  // Tìm ra những field có type là "lookup"

  const lookupValues = {};
  for (let i = 0; i < dataRow.length; i++) {
    const item = dataRow[i];
    columnsConfig.forEach((field) => {
      if (field.type === "lookup" || field.type === "binding") {
        const key = genKeyLookupGrid(field);
        const paramLookup = field.paramLookup
          ? field.paramLookup.reduce((obj, item) => {
              obj[item.key] = item.value;
              return obj;
            }, {})
          : {};

        if (!lookupValues?.[key]) {
          lookupValues[key] = {
            lookup: key,
            values: [],
            bindingField: field?.listBindingField || [],
            paramLookup: paramLookup,
            lookupUri: field.lookupUri,
          };
        } else {
          //nếu đã tồn tại bindingField thì không thêm nữa
          if (field?.listBindingField && field.listBindingField?.length) {
            field.listBindingField.forEach((bindingField) => {
              if (!lookupValues[key].bindingField.find((item) => item.key === bindingField.key)) {
                lookupValues[key].bindingField.push(bindingField);
              }
            });
          }
        }

        const values = Array.isArray(item[field.key]) ? item[field.key] : [item[field.key]];
        values.forEach((value) => {
          if (parseInt(value)) {
            if (!lookupValues[key].values.includes(parseInt(value))) {
              lookupValues[key].values.push(parseInt(value));
            }
          }
        });
      }
    });
  }

  //Lặp qua từng lookup trong lookupValues
  for (const key in lookupValues) {
    if (Object.hasOwnProperty.call(lookupValues, key)) {
      const lookup = lookupValues[key];
      // Gọi API để lấy dữ liệu lookup
      const listLookup = lookup.values;
      try {
        const params = {
          lstId: listLookup,
          limit: 2000,
          page: 1,
          ...(lookup?.paramLookup || {}),
        };
        let response = await fetchLookupData(lookup.lookupUri, params);
        // switch (key) {
        //   case "field":
        //     response = await FieldListService.list(params);
        //     break;
        //   case "project_realty":
        //     response = await ProjectRealtyService.list(params);
        //     break;
        //   default:
        //     break;
        // }
        if (response && response?.code == 0 && response?.result?.items?.length) {
          lookupValues[key].listValue = listLookup.map((item) => {
            const foundItem = response.result.items.find((field) => field.id === item);
            if (foundItem) {
              return {
                value: item,
                label: foundItem.name,
                ...(lookup.bindingField?.length > 0
                  ? lookup.bindingField.reduce((acc, field) => {
                      acc[field.key] = foundItem[field.value] || "";
                      return acc;
                    }, {})
                  : {}),
                bindingField: lookup.bindingField,
              };
            } else {
              return {
                value: item,
                label: null,
              };
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching lookup ${key}:`, error);
      }
    }
  }

  return lookupValues;
};
