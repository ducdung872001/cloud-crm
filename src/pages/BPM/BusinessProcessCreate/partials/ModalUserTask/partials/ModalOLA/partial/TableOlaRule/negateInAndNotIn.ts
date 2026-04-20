type Operator = "IN" | "NOT_IN";
type Condition = {
  parameter: string;
  operator: Operator;
  value: string[];
};

export function negateInAndNotIn(conditions: Condition[]): Condition[] {
  const result = conditions.map(negateCondition);
  // Lấy ra value của tất cả các phần tử có operator là "IN" rồi gộp nó thành một mảng duy nhất
  const allValuesIn = Array.from(new Set(result.filter((cond) => cond.operator === "IN").flatMap((cond) => cond.value)));
  // Lấy ra value của tất cả các phần tử có operator là "NOT_IN" rồi gộp nó thành một mảng duy nhất
  const allValuesNotIn = Array.from(new Set(result.filter((cond) => cond.operator === "NOT_IN").flatMap((cond) => cond.value)));

  // Nếu trong allValuesIn có phần tử nào nằm trong allValuesNotIn thì sẽ trả về mảng rỗng, vì điều này có nghĩa là có sự mâu thuẫn giữa các điều kiện
  if (allValuesIn.some((val) => allValuesNotIn.includes(val))) {
    return [];
  }

  // Gộp các phần tử có operator là "NOT_IN" thành một phần tử duy nhất
  const newConditionsNotin: Condition = {
    parameter: result[0].parameter,
    operator: "NOT_IN",
    value: allValuesNotIn,
  };

  let newResult: Condition[] = result.filter((cond) => cond.operator !== "NOT_IN").concat(newConditionsNotin);

  // Kiểm tra những phần tử có operator == "IN" trong newResult, nếu có 2 phần tử trở lên thì sẽ xử lý
  const inConditions = newResult.filter((cond) => cond.operator === "IN");
  if (inConditions.length >= 2) {
    // Lấy ra các phần tử có mặt ở tất cả các value trong các phần tử của inConditions
    const commonValues = inConditions.reduce((acc, cond) => {
      if (acc.length === 0) return cond.value;
      return acc.filter((val) => cond.value.includes(val));
    }, []);

    if (commonValues.length > 0) {
      const newConditions: Condition = {
        parameter: inConditions[0].parameter,
        operator: "IN",
        value: commonValues,
      };
      //Xoá tất cả các phần tử có operator == "IN" trong newResult rồi thêm newConditions vào cuối mảng đã xoá
      return newResult.filter((cond) => cond.operator !== "IN").concat(newConditions);
    } else {
      return [];
    }
  }
  return newResult;
}

function negateCondition(cond: Condition): Condition {
  return {
    parameter: cond.parameter,
    operator: cond.operator === "IN" ? "NOT_IN" : "IN",
    value: cond.value,
  };
}
