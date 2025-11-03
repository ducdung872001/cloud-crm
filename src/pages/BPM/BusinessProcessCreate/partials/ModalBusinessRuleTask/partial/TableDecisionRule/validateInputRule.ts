type Operator = "IN" | "NOT_IN" | "EQUAL" | "NOT_EQUAL" | "RANGE" | "GREATER_THAN_OR_EQUAL" | "LESS_THAN";

interface InputRule {
  parameter: string;
  operator: Operator;
  value?: any;
  valueMin?: any;
  valueMax?: any;
}

interface RuleItem {
  ruleIndex: number;
  inputs: string; // JSON string
  outputs: string; // JSON string
  nodeId: string;
}

interface ValidationError {
  ruleIndex: number;
  errors: string[];
}

export function validateInputRules(rules: RuleItem[]): ValidationError[] {
  const errors: ValidationError[] = [];

  rules.forEach((rule) => {
    const ruleErrors: string[] = [];

    // Validate outputs
    if (!rule.outputs || rule.outputs.trim() === "" || rule.outputs === "{}") {
      ruleErrors.push("outputs is empty.");
    } else {
      try {
        const outputsObj = JSON.parse(rule.outputs);
        if (outputsObj == null || (typeof outputsObj === "object" && Object.keys(outputsObj).length === 0)) {
          ruleErrors.push("outputs is empty.");
        }
      } catch {
        ruleErrors.push("outputs is not valid JSON.");
      }
    }

    // Validate inputs
    if (!rule.inputs || rule.inputs.trim() === "") {
      ruleErrors.push("inputs is empty.");
    } else {
      let inputsArr: InputRule[];
      try {
        inputsArr = JSON.parse(rule.inputs);
        if (!Array.isArray(inputsArr) || inputsArr.length === 0) {
          ruleErrors.push("inputs array is empty.");
        }
      } catch {
        ruleErrors.push("inputs is not valid JSON.");
        inputsArr = [];
      }

      // Validate each input item
      for (const input of inputsArr || []) {
        switch (input.operator) {
          case "IN":
          case "NOT_IN":
            if (!input.value || !Array.isArray(input.value) || input.value.length === 0) {
              ruleErrors.push(`Input parameter "${input.parameter}" with operator "${input.operator}" has empty value array.`);
            }
            break;
          case "EQUAL":
          case "NOT_EQUAL":
          case "GREATER_THAN_OR_EQUAL":
          case "LESS_THAN":
            if (input.value === undefined || input.value === null || input.value === "") {
              ruleErrors.push(`Input parameter "${input.parameter}" with operator "${input.operator}" has empty value.`);
            }
            break;
          case "RANGE":
            if (input.valueMin === undefined || input.valueMax === undefined || input.valueMin === "" || input.valueMax === "") {
              ruleErrors.push(`Input parameter "${input.parameter}" with operator "RANGE" has empty valueMin or valueMax.`);
            }
            break;
        }
      }
    }

    if (ruleErrors.length > 0) {
      errors.push({
        ruleIndex: rule.ruleIndex,
        errors: ruleErrors,
      });
    }
  });

  return errors;
}
