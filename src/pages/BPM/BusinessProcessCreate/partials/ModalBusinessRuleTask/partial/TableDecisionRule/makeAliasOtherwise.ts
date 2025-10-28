import { ConditionGroup, Operator, convertOutsideRangesToConditionGroups } from "./convertOutsideRangesToConditionGroups";
import { negateEqualAndNotEqual } from "./negateEqualAndNotEqual";
import { negateInAndNotIn } from "./negateInAndNotIn";

export function makeAliasOtherwise(conditionMap, columns): Record<string, any> {
  const alias = {};
  for (const key in conditionMap) {
    if (conditionMap.hasOwnProperty(key)) {
      let _column = columns.find((item) => item.key === key);

      if (_column.compareType == "in") {
        const inputGroups = conditionMap[key].filter((item) => item.filter((item) => item.operator == "OTHERWISE").length == 0);
        const flat = inputGroups.flat();

        const result: any = negateInAndNotIn(flat);
        alias[key] = result.flat().length > 0 ? result.flat() : false;
      } else if ((_column.compareType == "range" || _column.compareType == "equal") && _column.type == "number") {
        const inputGroups = conditionMap[key].filter((item) => item.filter((item) => item.operator == "OTHERWISE").length == 0);
        const result: any = convertOutsideRangesToConditionGroups(inputGroups);
        alias[key] = result;
      } else if ((_column.compareType == "range" || _column.compareType == "equal") && _column.type == "date") {
        const inputGroups = conditionMap[key].filter((item) => item.filter((item) => item.operator == "OTHERWISE").length == 0);
        const inputGroupsTimestamp = convertValuesToNoonTimestamp(inputGroups);
        // Chuyển đổi operator từ string sang Operator
        const convertedInputGroups: ConditionGroup[] = inputGroupsTimestamp.map((group) =>
          group.map((item) => ({
            ...item,
            operator: item.operator as Operator, // Ép kiểu operator về kiểu Operator
          }))
        );
        const result: any = convertOutsideRangesToConditionGroups(convertedInputGroups);
        alias[key] = convertTimestampValuesToISOString(result);
      } else if (_column.compareType == "equal" && _column.type != "date" && _column.type != "number") {
        const inputGroups = conditionMap[key].filter((item) => item.filter((item) => item.operator == "OTHERWISE").length == 0);

        // Bước 1: Gộp tất cả các group thành một mảng duy nhất
        const flat = inputGroups.flat();

        // Bước 2: Gộp các phần tử có parameter & operator giống nhau
        const merged: { [key: string]: any } = {};
        flat.forEach((cond) => {
          const key = `${cond.parameter}|${cond.operator}`;
          if (!merged[key]) {
            merged[key] = { ...cond, value: [...[cond.value]] };
          } else {
            // Gộp value, loại bỏ phần tử trùng lặp
            merged[key].value = Array.from(new Set([...merged[key].value, ...[cond.value]]));
          }
        });
        const result: any = negateEqualAndNotEqual(Object.values(merged));
        alias[key] = result.flat().length > 0 ? result.flat() : false;
      }
      if (_column.compareType == "equal" && _column.type == "checkbox") {
        const inputGroups = conditionMap[key].filter((item) => item.filter((item) => item.operator == "OTHERWISE").length == 0);
        const flat = inputGroups.flat();
        //Nếu tất cả các phần tử trong flat đều có value giống nhau thì trả về true và ! value đó, nếu không thì trả về false
        if (flat.length > 0) {
          const firstValue = flat[0].value;
          const allEqual = flat.every((item) => item.value === firstValue);
          alias[key] = allEqual
            ? [
                {
                  parameter: key,
                  operator: flat[0].operator, // Giữ nguyên operator của phần tử đầu tiên
                  value: !firstValue, // Giá trị chung
                },
              ]
            : false;
        } else {
          alias[key] = false; // Không có điều kiện nào
        }
      }
    }
  }
  return alias;
}

/**
 * Chuyển đổi giá trị "value" trong mảng sang timestamp của thời điểm 12h00 (giữa ngày) theo UTC của ngày đó,
 * nhưng đầu tiên value sẽ được chuyển sang múi giờ +7 trước khi xử lý.
 * @param arr Mảng dữ liệu đầu vào
 * @returns Mảng đã được chuyển đổi
 */
export function convertValuesToNoonTimestamp(
  arr: Array<Array<{ parameter: string; operator: string; value: string }>>
): Array<Array<{ parameter: string; operator: string; value: number }>> {
  return arr.map((group) =>
    group.map((item) => {
      // Parse value thành ngày
      const dateUTC = new Date(item.value);
      if (isNaN(dateUTC.getTime())) {
        throw new Error(`Invalid date value: ${item.value}`);
      }
      // Chuyển sang múi giờ +7 (Asia/Bangkok, Asia/Ho_Chi_Minh)
      // Lấy các thành phần giờ phút giây theo +7
      const datePlus7 = new Date(dateUTC.getTime() + 7 * 60 * 60 * 1000);
      const year = datePlus7.getUTCFullYear();
      const month = datePlus7.getUTCMonth();
      const day = datePlus7.getUTCDate();
      // Tạo ngày mới với giờ phút giây là 12:00:00 UTC của ngày đó (theo +7)
      // Nhưng để ra timestamp UTC của 12h00 tại VN (giữa ngày +7),
      // phải lấy 12h00 giờ VN, tương đương 05h00 UTC
      const noonVN_UTC = new Date(Date.UTC(year, month, day, 5, 0, 0, 0)); // 12h00 +7 == 05h00 UTC
      return {
        ...item,
        value: noonVN_UTC.getTime(), // timestamp (milliseconds since epoch)
      };
    })
  );
}

/**
 * Chuyển đổi value (timestamp) trong mảng về dạng ISO string.
 * - Nếu operator == "GREATER_THAN": +12h  rồi chuyển sang ISO.
 * - Nếu operator == "LESS_THAN": -12h rồi chuyển sang ISO.
 * - Operator khác: giữ nguyên timestamp và chuyển sang ISO.
 *
 * @param arr Mảng dữ liệu đầu vào
 * @returns Mảng đã được chuyển đổi
 */
export function convertTimestampValuesToISOString(
  arr: Array<Array<{ parameter: string; operator: string; value: number }>>
): Array<Array<{ parameter: string; operator: string; value: string }>> {
  return arr.map((group) =>
    group.map((item) => {
      let adjustedValue = item.value;
      if (item.operator === "GREATER_THAN") {
        // +12 giờ
        adjustedValue += 12 * 60 * 60 * 1000;
      } else if (item.operator === "LESS_THAN") {
        // -12 giờ
        adjustedValue -= 12 * 60 * 60 * 1000;
      }
      return {
        ...item,
        value: new Date(adjustedValue).toISOString(),
      };
    })
  );
}
