export const filterData = (currentDataRow: any[], checkedMap, columns) => {
  try {
    // Your async logic here
    let paramsFilter = {};
    currentDataRow.map((row) => {
      if (!checkedMap[row.rowKey]) return;
      Object.keys(checkedMap[row.rowKey]).map((key) => {
        if (checkedMap[row.rowKey][key]) {
          const col = columns.find((c) => c.key === key);
          if (!paramsFilter[key]) {
            // nếu cột trong columns có haveRadio == 1 thì paramsFilter[key] chỉ có 1 giá trị, nếu cột có haveCheckbox == 1 thì paramsFilter[key] có giá trị là mảng
            paramsFilter[key] = col?.haveRadio ? "" : [];
          }
          if (row[key]) {
            if (col?.haveRadio) {
              paramsFilter[key] = row[key] || "";
            } else {
              paramsFilter[key].push(row[key] || "");
            }
          }
        }
      });
    });
    console.log("ParamsFilter:", paramsFilter);

    return paramsFilter; // Return the fetched data
  } catch (error) {
    console.error("Error in getDataGrid:", error);
    // throw error; // Re-throw the error for further handling if needed
  }
};
