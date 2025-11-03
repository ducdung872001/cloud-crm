import FieldListService from "services/FieldListService";
import ProjectRealtyService from "services/ProjectRealtyService";

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

export const fetchDataLookup = async (dataRow) => {
  try {
    let getLookupValuesResult = await getLookupValue(dataRow);
    return getLookupValuesResult;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const getLookupValue = async (dataRow) => {
  // Lăp qua từng row trong dataRow
  // Lặp qua từng field trong row
  // Tìm ra những field có type là "lookup"

  const lookupValues = {};
  for (let i = 0; i < dataRow.length; i++) {
    const element = dataRow[i];
    element.forEach((field) => {
      if (field.type === "lookup" && field.value) {
        if (!lookupValues?.[field.lookup]) {
          lookupValues[field.lookup] = {
            lookup: field.lookup,
            values: [],
          };
        }

        const values = Array.isArray(field.value) ? field.value : [field.value];
        values.forEach((value) => {
          if (parseInt(value)) {
            if (!lookupValues[field.lookup].values.includes(parseInt(value))) {
              lookupValues[field.lookup].values.push(parseInt(value));
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
        };
        let response = null;
        switch (key) {
          case "field":
            response = await FieldListService.list(params);
            break;
          case "project_realty":
            response = await ProjectRealtyService.list(params);
            break;
          default:
            break;
        }
        if (response && response?.code == 0 && response?.result?.items?.length) {
          lookupValues[key].listValue = listLookup.map((item) => {
            const foundItem = response.result.items.find((field) => field.id === item);
            if (foundItem) {
              return {
                value: item,
                label: foundItem.name,
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
