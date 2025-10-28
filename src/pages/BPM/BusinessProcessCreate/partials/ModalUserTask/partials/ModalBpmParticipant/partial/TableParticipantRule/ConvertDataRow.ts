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
            if (field.isOtherwise) {
              rule_inputs.push({
                parameter: field.key,
                operator: "OTHERWISE",
                value: "OTHERWISE",
              });
            } else if (field.isSpecialValue) {
              rule_inputs.push({
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
              });
            } else if (field.children && field.children.length > 0) {
              for (let k = 0; k < field.children.length; k++) {
                const child = field.children[k];
                rule_inputs.push({
                  parameter: field.key,
                  operator: child.key == "min" ? "GREATER_THAN_OR_EQUAL" : "LESS_THAN_OR_EQUAL",
                  value: child.value,
                });
              }
            } else {
              let operator = field.compareType == "in" ? (field.compare == "in" ? "IN" : "NOT_IN") : field.compare == "=" ? "EQUAL" : "NOT_EQUAL";
              rule_inputs.push({
                parameter: field.key,
                operator: operator,
                value: field.value,
              });
            }
          }
        }
        rule.outputs = JSON.stringify(rule_outputs);
        rule.inputs = JSON.stringify(rule_inputs);
        rules.push(rule);
      }
    }
    dataConfig.rules = rules;
  }

  return dataConfig;
}
