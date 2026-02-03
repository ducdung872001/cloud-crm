type Operator = "IN" | "NOT_IN";

interface Condition {
  parameter: string;
  operator: Operator;
  value: any[];
}

export function negateInAndNotIn(conditions: Condition[]): Condition[][] {
  return conditions.map((cond) => {
    let negatedOperator: Operator;

    switch (cond.operator) {
      case "IN":
        negatedOperator = "NOT_IN";
        break;
      case "NOT_IN":
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
