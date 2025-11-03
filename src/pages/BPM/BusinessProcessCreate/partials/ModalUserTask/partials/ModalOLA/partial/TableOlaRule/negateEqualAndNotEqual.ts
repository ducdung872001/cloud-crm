type Operator = "EQUAL" | "NOT_EQUAL" | "NOT_IN" | "IN";

interface Condition {
  parameter: string;
  operator: Operator;
  value: any[];
}

type InputItem = {
  parameter: string;
  operator: Operator;
  value: string[];
};

export function negateEqualAndNotEqual(conditions: Condition[]): Condition[][] {
  const check = hasCommonElementBetweenEqualAndNotEqual(conditions);

  if (check) {
    return [];
  } else {
    return conditions.map((cond) => {
      let negatedOperator: Operator;

      switch (cond.operator) {
        case "EQUAL":
          negatedOperator = "NOT_IN";
          break;
        case "NOT_EQUAL":
          negatedOperator = "IN";
          break;
        default:
          throw new Error(`Unsupported operator: ${cond.operator}`);
      }

      return [
        {
          parameter: cond.parameter,
          operator: negatedOperator,
          value: cond.value,
        },
      ];
    });
  }
}

function hasCommonElementBetweenEqualAndNotEqual(input: InputItem[]): boolean {
  // Lọc ra các phần tử có operator là "EQUAL" và "NOT_EQUAL"
  const equalItem = input.find((i) => i.operator === "EQUAL");
  const notEqualItem = input.find((i) => i.operator === "NOT_EQUAL");

  if (notEqualItem && notEqualItem.value.length > 1) {
    // Nếu có 2 phần tử value của "NOT_EQUAL" thì đã mâu thuẫn, không cần kiểm tra thêm
    return true;
  }

  // Nếu cả hai cùng tồn tại
  if (equalItem && notEqualItem) {
    // Kiểm tra xem có phần tử nào trùng nhau giữa hai mảng value không
    return equalItem.value.some((v) => notEqualItem.value.includes(v));
  }
  return false;
}
