import { convertOutsideRangesToConditionGroups } from "./convertOutsideRangesToConditionGroups";
import { negateInAndNotIn } from "./negateInAndNotIn";

export function convertDataRow(dataConfigAdvance, nodeId): Record<string, any> {
  let dataConfig: Record<string, any> = {
    inputs: [],
    outputs: [],
    config: {
      columns: [],
      rows: [],
    },
    rules: [],
  };
  const { columns, rows } = dataConfigAdvance;

  if (columns && columns.length > 1) {
    dataConfig.config.columns = columns;
    dataConfig.config.rows = rows;
    // dataConfig.inputs bao gồm danh sách key của các cột có columnType = "condition", dataConfig.outputs bao gồm danh sách key của các cột có columnType = "decision"
    dataConfig.inputs = columns.filter((item) => item.columnType === "condition").map((item) => item.key);
    dataConfig.outputs = columns.filter((item) => item.columnType === "decision").map((item) => item.key);
    let rules = [];

    // Mỗi thuộc tính của conditionMap sẽ là 1 item trong dataConfig.inputs

    let conditionMap = {};

    dataConfig.inputs.forEach((item) => {
      conditionMap[item] = [];
    });

    if (rows && rows.length > 0) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let rule = {
          ruleIndex: i,
          inputs: "",
          outputs: "",
          nodeId: nodeId,
        };
        let rule_outputs = {};
        let rule_inputs = [];
        for (let j = 1; j < row.length; j++) {
          const field = row[j];
          if (field.columnType == "decision") {
            if (field.children && field.children.length > 0) {
              for (let k = 0; k < field.children.length; k++) {
                const child = field.children[k];
                if (rule_outputs[field.key]) {
                  rule_outputs[field.key] = {
                    ...rule_outputs[field.key],
                    [child.key]: child.value,
                  };
                } else {
                  rule_outputs[field.key] = {
                    [child.key]: child.value,
                  };
                }
              }
            } else {
              rule_outputs[field.key] = field.value;
            }
          } else if (field.columnType == "condition") {
            let conditionItem = {};
            if (field.isOtherwise) {
              conditionItem = {
                parameter: field.key,
                operator: "OTHERWISE",
                value: "OTHERWISE",
              };
              rule_inputs.push(conditionItem);
              conditionMap[field.key].push([conditionItem]);
            } else if (field.isSpecialValue) {
              conditionItem = {
                parameter: field.key,
                operator:
                  field?.compare == ">"
                    ? "GREATER_THAN"
                    : field?.compare == "<"
                    ? "LESS_THAN"
                    : field?.compare == "="
                    ? "EQUAL"
                    : field?.compare == "!="
                    ? "NOT_EQUAL"
                    : field?.compare == ">="
                    ? "GREATER_THAN_OR_EQUAL"
                    : field?.compare == "<="
                    ? "LESS_THAN_OR_EQUAL"
                    : "EQUAL",
                value: field.value,
              };
              rule_inputs.push(conditionItem);
              conditionMap[field.key].push([conditionItem]);
            } else if (field.children && field.children.length > 0) {
              let conditionItemChild = [];
              for (let k = 0; k < field.children.length; k++) {
                const child = field.children[k];
                conditionItem = {
                  parameter: field.key,
                  operator: child.key == "min" ? "GREATER_THAN_OR_EQUAL" : "LESS_THAN_OR_EQUAL",
                  value: child.value,
                };
                rule_inputs.push(conditionItem);
                conditionItemChild.push(conditionItem);
              }
              conditionMap[field.key].push(conditionItemChild);
            } else {
              let operator = field.compareType == "in" ? (field.compare == "in" ? "IN" : "NOT_IN") : field.compare == "=" ? "EQUAL" : "NOT_EQUAL";
              conditionItem = {
                parameter: field.key,
                operator: operator,
                value: field.value,
              };
              rule_inputs.push(conditionItem);
              conditionMap[field.key].push([conditionItem]);
            }
          }
        }
        rule.outputs = JSON.stringify(rule_outputs);
        rule.inputs = JSON.stringify(rule_inputs);
        rules.push(rule);
      }

      // testCases.forEach((testCase, index) => {
      //   const { input, expected } = testCase;
      //   const result = negateOrToAnd(input);
      //   // if (JSON.stringify(result) !== JSON.stringify(expected)) {
      //   //   console.error(`Test case failed!`, index);
      //   //   console.log("Test case failed! Input:", input);
      //   //   console.log("Expected:", expected);
      //   //   console.log("Got:", result);
      //   //   console.error(`END case failed!`, index);
      //   // } else {
      //   //   if (result === false) {
      //   //     console.log("❌ Mâu thuẫn, phủ định không thể xảy ra.");
      //   //   } else {
      //   //     const simplified = simplifyConditions(result);
      //   //     console.log("✅ Điều kiện sau khi phủ định & rút gọn:", simplified);
      //   //   }
      //   // }
      //   if (result === false) {
      //     console.log("❌ Mâu thuẫn, phủ định không thể xảy ra ", "[", index, "].");
      //   } else {
      //     const simplified = simplifyConditions(result);
      //     console.log("✅ Điều kiện sau khi phủ định & rút gọn ", "[", index, "]:", simplified);
      //   }
      // });
    }
    dataConfig.rules = rules;
    // const result: any = negateOrToAnd(conditionMap["tinh"].filter((item) => item.operator !== "OTHERWISE"));
    // const simplified = result ? simplifyConditions(result) : false;
    // console.log("negateOrToAnd-simplified:", simplified);

    let alias = {};

    for (const key in conditionMap) {
      console.log(`Processing key: ${key}`);
      if (conditionMap.hasOwnProperty(key)) {
        const value = conditionMap[key];
        console.log(`Value for key "${key}":`, value);

        // Nếu 1 mảng nào đó trong value không có item nào có operator là "OTHERWISE" thì sẽ không xử lý nữa
        processData(value);

        if (conditionMap[key].filter((item) => item.operator == "IN" || item.operator == "NOT_IN").length > 0) {
          console.log(
            `Alias for key "${key}":`,
            conditionMap[key].filter((item) => item.operator !== "OTHERWISE")
          );
          const result: any = negateInAndNotIn(conditionMap[key].filter((item) => item.operator !== "OTHERWISE"));
          // const simplified = result ? simplifyConditions(result) : false;
          alias[key] = result;
        } else if (key == "the_chap") {
          console.log(
            `Alias for key "${key}":`,
            conditionMap[key].filter((item) => item.filter((item) => item.operator == "OTHERWISE").length == 0)
          );
          // const result: any = negateOrConditionsWithAndGroups(conditionMap[key].filter((item) => item.operator !== "OTHERWISE"));
          const result: any = convertOutsideRangesToConditionGroups(
            conditionMap[key].filter((item) => item.filter((item) => item.operator == "OTHERWISE").length == 0)
          );
          // const simplified = result ? simplifyConditions(result) : false;
          alias[key] = result;
        }
      }
    }
    console.log(`Alias :`, alias);
  }

  return dataConfig;
}
function processData(value: any[]): void {
  // Kiểm tra nếu value là một mảng
  if (Array.isArray(value)) {
    // Kiểm tra xem có item nào có operator là "OTHERWISE"
    const hasOtherwise = value.some((item) => item.operator === "OTHERWISE");

    if (!hasOtherwise) {
      console.log("Không xử lý vì không có operator là 'OTHERWISE'");
      return; // Dừng xử lý
    }

    // Tiếp tục xử lý nếu có "OTHERWISE"
    console.log("Xử lý dữ liệu:", value);
  } else {
    console.log("Giá trị không phải là mảng.");
  }
}
