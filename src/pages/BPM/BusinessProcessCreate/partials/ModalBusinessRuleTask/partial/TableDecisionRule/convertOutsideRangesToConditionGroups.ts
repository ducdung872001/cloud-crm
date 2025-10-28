/**
 * Tính toán các khoảng giá trị nằm ngoài tập hợp các điều kiện số học.
 *
 * 👉 Input: ConditionGroup[] = mảng các nhóm điều kiện, mỗi nhóm gồm 1 hoặc nhiều điều kiện.
 * - Các nhóm (mảng cấp 1) được kết hợp bằng phép HOẶC (OR).
 * - Các điều kiện trong mỗi nhóm (mảng cấp 2) được kết hợp bằng phép VÀ (AND).
 * - Tất cả điều kiện phải áp dụng trên cùng một trường (parameter), ví dụ: "the_chap".
 * - Hỗ trợ các toán tử:
 *     - EQUAL (bằng)
 *     - NOT_EQUAL (khác)
 *     - GREATER_THAN (lớn hơn)
 *     - GREATER_THAN_OR_EQUAL (lớn hơn hoặc bằng)
 *     - LESS_THAN (nhỏ hơn)
 *     - LESS_THAN_OR_EQUAL (nhỏ hơn hoặc bằng)
 *
 * 🧠 Minh hoạ tổ hợp điều kiện:
 * Input = [
 *   [A, B],     // A AND B
 *   [C],        // C
 *   [D, E]      // D AND E
 * ]
 * → Điều kiện tổng: (A AND B) OR (C) OR (D AND E)
 * → Hàm sẽ trả ra các khoảng giá trị **nằm ngoài** điều kiện tổng này.
 *
 * 👉 Output:
 * - Mảng các nhóm điều kiện (kết hợp OR giữa nhóm, AND trong nhóm) đại diện cho các khoảng giá trị ngoài (outside ranges).
 * - Trả về `false` nếu:
 *    a) Input rỗng
 *    b) Các điều kiện đã bao phủ toàn bộ trục số thực
 *    c) Không còn khoảng outside hợp lệ nào để trả về
 *
 * 🧪 Ví dụ:
 * Input = [
 *   [ {parameter: "x", operator: "EQUAL", value: 5} ],
 *   [ {parameter: "x", operator: "GREATER_THAN_OR_EQUAL", value: 10}, {operator: "LESS_THAN_OR_EQUAL", value: 20} ]
 * ]
 * → Điều kiện tổng: (x == 5) OR (10 <= x <= 20)
 * → Output: [
 *     [ {parameter: "x", operator: "LESS_THAN", value: 5} ],
 *     [ {parameter: "x", operator: "GREATER_THAN", value: 5}, {operator: "LESS_THAN", value: 10} ],
 *     [ {parameter: "x", operator: "GREATER_THAN", value: 20} ]
 *   ]
 */

export type Operator = "EQUAL" | "NOT_EQUAL" | "GREATER_THAN" | "LESS_THAN" | "GREATER_THAN_OR_EQUAL" | "LESS_THAN_OR_EQUAL";

export interface Condition {
  parameter: string;
  operator: Operator;
  value: number;
}

export type ConditionGroup = Condition[];

interface Range {
  start: number;
  end: number;
  excludeStart?: boolean;
  excludeEnd?: boolean;
  originOperator?: string; // Lưu trữ toán tử gốc để sử dụng khi chuyển đổi lại thành điều kiện
}

function extractRangeFromConditions(group: ConditionGroup): Range[] {
  const equalConditions = group.filter((c) => c.operator === "EQUAL");
  const notEqualConditions = group.filter((c) => c.operator === "NOT_EQUAL");

  if (equalConditions.length === 1) {
    const v = equalConditions[0].value;
    return [{ start: v, end: v, originOperator: equalConditions[0].operator }];
  }

  let start = -Infinity;
  let end = Infinity;
  let excludeStart = false;
  let excludeEnd = false;
  let originOperator = "";

  for (const condition of group) {
    originOperator = condition.operator;
    switch (condition.operator) {
      case "GREATER_THAN":
        start = Math.max(start, condition.value);
        excludeStart = true;
        break;
      case "GREATER_THAN_OR_EQUAL":
        start = Math.max(start, condition.value);
        excludeStart = false;
        break;
      case "LESS_THAN":
        end = Math.min(end, condition.value);
        excludeEnd = true;
        break;
      case "LESS_THAN_OR_EQUAL":
        end = Math.min(end, condition.value);
        excludeEnd = false;
        break;
      case "NOT_EQUAL":
        start = Math.max(start, condition.value);
        end = Math.min(end, condition.value);
        excludeEnd = false;
        excludeStart = false;
        break;
    }
  }

  const mainRange = start <= end ? [{ start, end, excludeStart, excludeEnd, originOperator }] : [];

  const notEqualRanges: Range[] = notEqualConditions.map((c) => ({
    start: c.value,
    end: c.value,
    excludeStart: false,
    excludeEnd: false,
    originOperator: c.operator,
  }));

  return [...mainRange, ...notEqualRanges];
}

function mergeRanges(ranges: Range[]): Range[] {
  const sorted = ranges.filter((r) => r.start <= r.end).sort((a, b) => a.start - b.start || Number(a.excludeStart) - Number(b.excludeStart));

  console.log("Alias: mergeRanges - sorted ranges:", sorted);

  const merged: Range[] = [];

  for (const range of sorted) {
    if (merged.length === 0) {
      merged.push({ ...range });
      continue;
    }

    const last = merged[merged.length - 1];

    const canMerge = last.end > range.start || (last.end === range.start && (!last.excludeEnd || !range.excludeStart));

    if (canMerge) {
      last.end = Math.max(last.end, range.end);
      last.excludeEnd = last.end === range.end ? last.excludeEnd && range.excludeEnd : last.end < range.end ? range.excludeEnd : last.excludeEnd;
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

function invertRanges(ranges: Range[], specialEqual?: any): Range[] {
  // Ham này sẽ lấy các khoảng đã cho và tạo ra các khoảng nằm ngoài chúng.
  const result: Range[] = [];
  let current = -Infinity;
  let originOperator = "";
  let originOperatorOfStartValue = "";
  let excludeStartOfStartValue = false;

  for (const range of ranges) {
    if (range.start == range.end && !range.excludeStart && !range.excludeEnd && range.originOperator === "NOT_EQUAL") {
      // Trường hợp đặc biệt: nếu khoảng là một điểm đơn và là NOT_EQUAL => khoảng ngoài nghĩa là chính điểm đó
      result.push({
        start: range.start,
        end: range.end,
        excludeStart: false,
        excludeEnd: false,
        originOperator: range.originOperator,
      });
    } else {
      if (current < range.start || (current === range.start && range.excludeStart)) {
        // console.log("Alias: invertRanges - range:", range);
        // console.log("Alias: invertRanges - originOperatorOfStartValue:", originOperatorOfStartValue);
        // console.log("Alias: invertRanges - excludeStartOfStartValue:", excludeStartOfStartValue);

        result.push({
          start: current,
          end: range.start,
          excludeStart: originOperatorOfStartValue.includes("EQUAL") ? true : excludeStartOfStartValue,
          excludeEnd: range.originOperator.includes("EQUAL") ? true : !range.excludeStart,
          originOperator: range.originOperator,
        });
      }
    }
    current = range.end;
    originOperatorOfStartValue = range.originOperator;
    excludeStartOfStartValue = !range?.excludeEnd;
    originOperator = range.originOperator;
  }

  // Trường hợp không có điểm chặn cuối cùng, nghĩa là khoảng ngoài từ điểm cuối của khoảng đã cho đến vô cực
  if (current < Infinity) {
    result.push({
      start: current,
      end: Infinity,
      excludeStart: originOperator.includes("EQUAL") ? true : false,
      excludeEnd: false,
      originOperator: originOperator,
    });
  }

  // Filter kết quả như cũ
  const filtered = result.filter((r) => r.start < r.end || (r.start === r.end && (!r.excludeStart || !r.excludeEnd)));
  // Kiểm tra có chứa specialEqual trong bất kỳ khoảng nào sau filter (đây là trường hợp đặc biệt có 1 hàng có điều kiện NOT_EQUAL)
  // Kiểm tra xem specialEqual có nằm trong bất kỳ khoảng nào hay không, nếu có thì trả về đúng specialEqual, nếu không khoảng nào chứa specialEqual thì là mâu thuẫn giữa các điều kiện-> trả về mảng rỗng.
  // vì khi có 1 điều kiện NOT_EQUAL ở input thì điều kiện tiên quyết của output (nghịch đảo-khoảng ngoài) là phải có điều kiện EQUAL với giá trị specialEqual
  let containsSpecialEqual = false;
  if (typeof specialEqual === "number") {
    containsSpecialEqual = filtered.some((r) => {
      // Trường hợp nằm trong khoảng
      if (r.start < specialEqual && specialEqual < r.end) return true;
      // Trường hợp specialEqual là đầu mút
      if (r.start === specialEqual && !r.excludeStart) return true;
      if (r.end === specialEqual && !r.excludeEnd) return true;
      return false;
    });

    if (containsSpecialEqual) {
      return [
        {
          start: specialEqual,
          end: specialEqual,
          excludeStart: false,
          excludeEnd: false,
          originOperator: "NOT_EQUAL",
        },
      ];
    } else {
      return [];
    }
  } else {
    return filtered;
  }
}

function rangeToConditionGroup(range: Range, parameter: string): ConditionGroup {
  // Ham này sẽ chuyển đổi một khoảng giá trị thành một nhóm điều kiện.
  const group: ConditionGroup = [];

  if (range.start === range.end && !range.excludeStart && !range.excludeEnd) {
    group.push({
      parameter,
      operator: "EQUAL",
      value: range.start,
    });
  } else if (range.start === range.end) {
    group.push({
      parameter,
      operator: "NOT_EQUAL",
      value: range.start,
    });
  } else if (range.start && range.end === Infinity && range.originOperator === "LESS_THAN") {
    group.push({
      parameter,
      operator: "GREATER_THAN_OR_EQUAL",
      value: range.start,
    });
  } else {
    if (range.start !== -Infinity) {
      group.push({
        parameter,
        operator: range.excludeStart ? "GREATER_THAN" : "GREATER_THAN_OR_EQUAL",
        value: range.start,
      });
    }
    if (range.end !== Infinity) {
      group.push({
        parameter,
        operator: range.excludeEnd ? "LESS_THAN" : "LESS_THAN_OR_EQUAL",
        value: range.end,
      });
    }
  }

  return group;
}

export function convertOutsideRangesToConditionGroups(inputGroups: ConditionGroup[]): ConditionGroup[] | false {
  if (inputGroups.length === 0) {
    console.log("⛔ Không có điều kiện đầu vào nào, không thể xác định giá trị nằm ngoài.");
    return false;
  }

  const allParameter = inputGroups.flat().map((c) => c.parameter);

  const uniqueParameters = [...new Set(allParameter)];

  if (uniqueParameters.length !== 1) {
    throw new Error("Chỉ hỗ trợ một parameter duy nhất tại một thời điểm.");
  }

  const parameter = uniqueParameters[0];

  // ✅ Xử lý đặc biệt: nếu chỉ có 1 điều kiện NOT_EQUAL thì đối nghịch là EQUAL
  if (inputGroups.length === 1 && inputGroups[0].length === 1 && inputGroups[0][0].operator === "NOT_EQUAL") {
    const cond = inputGroups[0][0];
    return [[{ parameter: cond.parameter, operator: "EQUAL", value: cond.value }]];
  }

  // ✅ Xử lý đặc biệt: nếu trong tất cả các phần tử cấp 2 của inputGroups nếu có 2 điều kiện NOT_EQUAL và EQUAL nào có cùng value thì trả về false
  const equalConditions = inputGroups.flat().filter((c) => c.operator === "EQUAL");
  const notEqualConditions = inputGroups.flat().filter((c) => c.operator === "NOT_EQUAL");
  if (equalConditions.length > 0 && notEqualConditions.length > 0) {
    const hasConflict = equalConditions.some((e) => notEqualConditions.some((n) => n.value === e.value));
    if (hasConflict) {
      console.log("⛔ Có mâu thuẫn giữa các điều kiện EQUAL và NOT_EQUAL.");
      return false;
    }
  }

  let specialEqual: any = null;
  // ✅ Xử lý đặc biệt: nếu trong tất cả các phần tử cấp 2 của inputGroups nếu có 2 điều kiện NOT_EQUAL trở lên thì kiểm tra thêm
  if (notEqualConditions.length > 1) {
    // Nếu value của các điều kiện NOT_EQUAL bằng nhau thì trả về EQUAL
    if (notEqualConditions.every((c, _, arr) => c.value === arr[0].value)) {
      specialEqual = notEqualConditions[0].value;
    } else {
      console.log("⛔ Không thể xác định giá trị nằm ngoài khi có nhiều điều kiện NOT_EQUAL.");
      return false;
    }
  }

  // ✅ Xử lý đặc biệt: nếu có 1 điều kiện NOT_EQUAL trong nhóm inputGroups
  if (inputGroups.some((group) => group.length === 1 && group[0].operator === "NOT_EQUAL")) {
    //Xác định điều kiện NOT_EQUAL và trả về EQUAL
    const cond = inputGroups.find((group) => group.length === 1 && group[0].operator === "NOT_EQUAL")[0];
    specialEqual = cond.value;
  }

  const ranges = inputGroups.map((group) => extractRangeFromConditions(group)).flat();
  const merged = mergeRanges(ranges);

  const outsideRanges = invertRanges(merged, specialEqual);

  console.log("Alias: convertOutsideRangesToConditionGroups - outsideRanges:", outsideRanges);

  if (outsideRanges.length === 0) {
    console.log("✅ Các điều kiện đầu vào đã bao phủ toàn bộ trục số thực. Không còn giá trị nào nằm ngoài.");
    return false;
  }

  const result = outsideRanges.map((range) => rangeToConditionGroup(range, parameter));

  if (result.length === 0) {
    console.log("⚠️ Các khoảng nằm ngoài không thể chuyển đổi thành điều kiện cụ thể.");
    return false;
  }

  return result;
}
