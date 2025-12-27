import _ from "lodash";
import moment from "moment";
import { getTextFromReactElement } from "utils/common";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";

export default function Validate(validations: IValidation[], formData: IFormData, listField: IFieldCustomize[]) {
  const errors: Record<string, string> = {};
  const formDataTemp = _.cloneDeep(formData);
  if (listField.length > 0 && validations && validations.length > 0) {
    for (const validation of validations) {
      const field = listField.find((form) => form.name === validation.name);
      if (field) {
        const message = ValidateField(field, validation, formDataTemp.values, listField);
        if (message) {
          errors[field.name] = message;
        }
      }
    }
  }
  return errors;
}

export function ValidateField(field: IFieldCustomize, validation: IValidation, values: Record<string, any>, listField: IFieldCustomize[]) {
  let message = null;
  const rules = convertRulesStringToObject(validation.rules, field.type); //validation.rules => nullable|min:10|max_equal:40|regex
  const valueForm = values[field.name];
  for (const [key, value] of Object.entries(rules)) {
    switch (key) {
      case "nullable":
        if (validateIsEmptyOrNull(valueForm)) {
          break;
        }
        break;
      case "required":
        if (validateIsEmptyOrNull(valueForm) && !rules["nullable"]) {
          switch (field.type) {
            case "checkbox":
            case "radio":
            case "select":
            case "date":
              message = messageError.required_date_option;
              break;
            case "tags":
              message = messageError.required_tags;
              break;
            default:
              message = messageError.required_text;
              break;
          }
        }
        break;
      case "length":
        if (!validateIsEmptyOrNull(valueForm)) {
          let min: number | string =
            value["min"] && isNaN(value["min"]) && values[value["min"]]
              ? parseInt(values[value["min"]])
              : value["min"] && !isNaN(value["min"])
              ? parseInt(value["min"])
              : null;
          let max: number | string =
            value["max"] && isNaN(value["max"]) && values[value["max"]]
              ? parseInt(values[value["max"]])
              : value["max"] && !isNaN(value["max"])
              ? parseInt(value["max"])
              : null;
          let minEqual: number | string =
            value["min_equal"] && isNaN(value["min_equal"]) && values[value["min_equal"]]
              ? parseInt(values[value["min_equal"]])
              : value["min_equal"] && !isNaN(value["min_equal"])
              ? parseInt(value["min_equal"])
              : null;
          let maxEqual: number | string =
            value["max_equal"] && isNaN(value["max_equal"]) && values[value["max_equal"]]
              ? parseInt(values[value["max_equal"]])
              : value["max_equal"] && !isNaN(value["max_equal"])
              ? parseInt(value["max_equal"])
              : null;
          switch (field.type) {
            case "text":
            case "password":
            case "textarea":
              if (min && max && (valueForm.toString().length < min || valueForm.toString().length > max)) {
                message = messageError.min_max_length;
              } else if (min && !max && valueForm.toString().length < min) {
                message = messageError.min_length;
              } else if (max && !min && valueForm.toString().length > max) {
                message = messageError.max_length;
              }
              break;
            case "tags":
              if (min && max && (valueForm.toString().length < min || valueForm.toString().length > max)) {
                message = messageError.min_max_tags_length;
              } else if (min && !max && valueForm.toString().length < min) {
                message = messageError.min_tags_length;
              } else if (max && !min && valueForm.toString().length > max) {
                message = messageError.max_tags_length;
              }
              break;
            case "checkbox":
              if (min && max && (valueForm.toString().length < min || valueForm.toString().length > max)) {
                message = messageError.min_max_checkbox_length;
              } else if (min && !max && valueForm.toString().length < min) {
                message = messageError.min_checkbox_length;
              } else if (max && !min && valueForm.toString().length > max) {
                message = messageError.max_checkbox_length;
              }
              break;
            case "number":
              if (minEqual && maxEqual && (valueForm < minEqual || valueForm > maxEqual)) {
                message =
                  valueForm < minEqual
                    ? messageError.min_equal_number
                    : valueForm > maxEqual
                    ? messageError.max_equal_number
                    : messageError.min_equal_max_equal_number;
              } else if (minEqual && max && (valueForm < minEqual || valueForm >= max)) {
                message =
                  valueForm < minEqual
                    ? messageError.min_equal_number
                    : valueForm >= max
                    ? messageError.max_number
                    : messageError.min_equal_max_number;
              } else if (min && maxEqual && (valueForm <= min || valueForm > maxEqual)) {
                message =
                  valueForm <= min
                    ? messageError.min_number
                    : valueForm > maxEqual
                    ? messageError.max_equal_number
                    : messageError.min_max_equal_number;
              } else if (min && max && (valueForm <= min || valueForm >= max)) {
                message = valueForm <= min ? messageError.min_number : valueForm >= max ? messageError.max_number : messageError.min_max_number;
              } else if ((min || minEqual) && (value["compare"] || value["compare_equal"])) {
                if (minEqual && value["compare_equal"] && (valueForm < minEqual || valueForm < values[value["compare_equal"]])) {
                  message = messageError.min_equal_compare_equal_number;
                } else if (min && value["compare_equal"] && (valueForm <= min || valueForm < values[value["compare_equal"]])) {
                  message = messageError.min_compare_equal_number;
                } else if (minEqual && value["compare"] && (valueForm < minEqual || valueForm <= values[value["compare"]])) {
                  message = messageError.min_equal_compare_number;
                } else if (min && value["compare"] && (valueForm <= min || valueForm <= values[value["compare"]])) {
                  message = messageError.min_compare_number;
                }
              } else if ((max || maxEqual) && (value["compare"] || value["compare_equal"])) {
                if (maxEqual && value["compare_equal"] && (valueForm > maxEqual || valueForm > values[value["compare_equal"]])) {
                  message = messageError.max_equal_compare_equal_number;
                } else if (max && value["compare_equal"] && (valueForm >= max || valueForm > values[value["compare_equal"]])) {
                  message = messageError.max_compare_equal_number;
                } else if (maxEqual && value["compare"] && (valueForm > maxEqual || valueForm >= values[value["compare"]])) {
                  message = messageError.max_equal_compare_number;
                } else if (max && value["compare"] && (valueForm >= max || valueForm >= values[value["compare"]])) {
                  message = messageError.max_compare_number;
                }
              } else if (minEqual && !min && !maxEqual && !max && valueForm < minEqual) {
                message = messageError.min_equal_number;
              } else if (min >= 0 && !minEqual && !maxEqual && !max && valueForm <= min) {
                message = messageError.min_number;
              } else if (maxEqual && !min && !minEqual && !max && valueForm > maxEqual) {
                message = messageError.max_equal_number;
              } else if (max && !min && !maxEqual && !minEqual && valueForm >= max) {
                message = messageError.max_number;
              }
              break;
            case "date":
              min =
                value["min"] && !moment(value["min"], "DD/MM/yyyy", true).isValid() && values[value["min"]]
                  ? values[value["min"]]
                  : value["min"] && moment(value["min"], "DD/MM/yyyy", true).isValid()
                  ? moment(value["min"]).format("DD/MM/yyyy").toString()
                  : null;
              max =
                value["max"] && !moment(value["max"], "DD/MM/yyyy", true).isValid() && values[value["max"]]
                  ? values[value["max"]]
                  : value["max"] && moment(value["max"], "DD/MM/yyyy", true).isValid()
                  ? moment(value["max"]).format("DD/MM/yyyy").toString()
                  : null;
              minEqual =
                value["min_equal"] && !moment(value["min_equal"], "DD/MM/yyyy", true).isValid() && values[value["min_equal"]]
                  ? values[value["min_equal"]]
                  : value["min_equal"] && moment(value["min_equal"], "DD/MM/yyyy", true).isValid()
                  ? moment(value["min_equal"]).format("DD/MM/yyyy").toString()
                  : null;
              maxEqual =
                value["max_equal"] && !moment(value["max_equal"], "DD/MM/yyyy", true).isValid() && values[value["max_equal"]]
                  ? values[value["max_equal"]]
                  : value["max_equal"] && moment(value["max_equal"], "DD/MM/yyyy", true).isValid()
                  ? moment(value["max_equal"]).format("DD/MM/yyyy").toString()
                  : null;
              if (
                minEqual &&
                maxEqual &&
                (validateDate(valueForm.toString(), minEqual.toString()) === "before" ||
                  validateDate(valueForm.toString(), maxEqual.toString()) === "after")
              ) {
                message = messageError.min_equal_max_equal_date;
              } else if (
                minEqual &&
                max &&
                (validateDate(valueForm.toString(), maxEqual.toString()) === "before" ||
                  validateDate(valueForm.toString(), max.toString()) === "after" ||
                  validateDate(valueForm.toString(), max.toString()) === "same")
              ) {
                message = messageError.min_equal_max_date;
              } else if (
                min &&
                maxEqual &&
                (validateDate(valueForm.toString(), min.toString()) === "before" ||
                  validateDate(valueForm.toString(), min.toString()) === "same" ||
                  validateDate(valueForm.toString(), maxEqual.toString()) === "after")
              ) {
                message = messageError.min_max_equal_date;
              } else if (
                min &&
                max &&
                (validateDate(valueForm.toString(), min.toString()) === "before" ||
                  validateDate(valueForm.toString(), min.toString()) === "same" ||
                  validateDate(valueForm.toString(), max.toString()) === "after" ||
                  validateDate(valueForm.toString(), max.toString()) === "same")
              ) {
                message = messageError.min_max_date;
              } else if ((min || minEqual) && (value["compare"] || value["compare_equal"])) {
                if (
                  minEqual &&
                  value["compare_equal"] &&
                  (validateDate(valueForm.toString(), minEqual.toString()) === "before" ||
                    validateDate(valueForm.toString(), values[value["compare_equal"]].toString()) === "before")
                ) {
                  message = messageError.min_equal_compare_equal_date;
                } else if (
                  min &&
                  value["compare_equal"] &&
                  (validateDate(valueForm.toString(), min.toString()) === "before" ||
                    validateDate(valueForm.toString(), min.toString()) === "same" ||
                    validateDate(valueForm.toString(), values[value["compare_equal"]].toString()) === "before")
                ) {
                  message = messageError.min_compare_equal_date;
                } else if (
                  minEqual &&
                  value["compare"] &&
                  (validateDate(valueForm.toString(), minEqual.toString()) === "before" ||
                    validateDate(valueForm.toString(), values[value["compare"]].toString()) === "before" ||
                    validateDate(valueForm.toString(), values[value["compare"]].toString()) === "same")
                ) {
                  message = messageError.min_equal_compare_date;
                } else if (
                  min &&
                  value["compare"] &&
                  (validateDate(valueForm.toString(), min.toString()) === "before" ||
                    validateDate(valueForm.toString(), min.toString()) === "same" ||
                    validateDate(valueForm.toString(), values[value["compare"]].toString()) === "before" ||
                    validateDate(valueForm.toString(), values[value["compare"]].toString()) === "same")
                ) {
                  message = messageError.min_compare_date;
                }
              } else if ((max || maxEqual) && (value["compare"] || value["compare_equal"])) {
                if (
                  maxEqual &&
                  value["compare_equal"] &&
                  (validateDate(valueForm.toString(), maxEqual.toString()) === "after" ||
                    validateDate(valueForm.toString(), values[value["compare_equal"]].toString()) === "after")
                ) {
                  message = messageError.max_equal_compare_equal_date;
                } else if (
                  max &&
                  value["compare_equal"] &&
                  (validateDate(valueForm.toString(), max.toString()) === "after" ||
                    validateDate(valueForm.toString(), max.toString()) === "same" ||
                    validateDate(valueForm.toString(), values[value["compare_equal"]].toString()) === "after")
                ) {
                  message = messageError.max_compare_equal_date;
                } else if (
                  maxEqual &&
                  value["compare"] &&
                  (validateDate(valueForm.toString(), maxEqual.toString()) === "after" ||
                    validateDate(valueForm.toString(), values[value["compare"]].toString()) === "after" ||
                    validateDate(valueForm.toString(), values[value["compare"]].toString()) === "same")
                ) {
                  message = messageError.max_equal_compare_date;
                } else if (
                  max &&
                  value["compare"] &&
                  (validateDate(valueForm.toString(), max.toString()) === "after" ||
                    validateDate(valueForm.toString(), max.toString()) === "same" ||
                    validateDate(valueForm.toString(), values[value["compare"]].toString()) === "after" ||
                    validateDate(valueForm.toString(), values[value["compare"]].toString()) === "same")
                ) {
                  message = messageError.max_compare_date;
                }
              } else if (minEqual && !min && !maxEqual && !max && validateDate(valueForm.toString(), minEqual.toString()) === "before") {
                message = messageError.min_equal_date;
              } else if (
                min &&
                !minEqual &&
                !maxEqual &&
                !max &&
                (validateDate(valueForm.toString(), min.toString()) === "before" || validateDate(valueForm.toString(), min.toString()) === "same")
              ) {
                message = messageError.min_date;
              } else if (maxEqual && !min && !minEqual && !max && validateDate(valueForm.toString(), maxEqual.toString()) === "after") {
                message = messageError.max_equal_date;
              } else if (
                max &&
                !min &&
                !maxEqual &&
                !minEqual &&
                (validateDate(valueForm.toString(), max.toString()) === "after" || validateDate(valueForm.toString(), max.toString()) === "same")
              ) {
                message = messageError.max_date;
              }
              break;
          }
        }
        break;
      case "compare":
        if (valueForm !== values[value.toString()]) {
          message = messageError.not_match;
        }
        break;
      case "coincident":
        if (valueForm !== values[value.toString()]) {
          message = messageError.coincident;
        }
        break;
      case "in":
        if (!validateIsEmptyOrNull(valueForm)) {
          const inValues = value.toString().split(",");
          if (!inValues.includes(valueForm.toString())) {
            message = messageError.coincident;
          }
        }
        break;
      case "regex":
        if (!validateIsEmptyOrNull(valueForm) && field.regex) {
          console.log("okokok>", field.regex, valueForm.toString());

          if (!field.regex.test(valueForm.toString())) {
            message = field.messageErrorRegex ?? ":name: không đúng định dạng";
          }
        }
        break;
    }
    if (message) {
      const min =
        key === "length" && value["min"]
          ? (isNaN(value["min"]) && !moment(value["min"], "DD/MM/yyyy", true).isValid()) ||
            (!isNaN(value["min"]) && moment(value["min"], "DD/MM/yyyy", true).isValid())
            ? getTextFromReactElement(listField.find((form) => form.name === value["min"].toString())?.label).replace(" *", "")
            : value["min"]
          : "";
      const max =
        key === "length" && value["max"]
          ? (isNaN(value["max"]) && !moment(value["max"], "DD/MM/yyyy", true).isValid()) ||
            (!isNaN(value["max"]) && moment(value["max"], "DD/MM/yyyy", true).isValid())
            ? getTextFromReactElement(listField.find((form) => form.name === value["max"].toString())?.label).replace(" *", "")
            : value["max"]
          : "";
      const minEqual =
        key === "length" && value["min_equal"]
          ? (isNaN(value["min_equal"]) && !moment(value["min_equal"], "DD/MM/yyyy", true).isValid()) ||
            (!isNaN(value["min_equal"]) && moment(value["min_equal"], "DD/MM/yyyy", true).isValid())
            ? getTextFromReactElement(listField.find((form) => form.name === value["min_equal"].toString())?.label).replace(" *", "")
            : value["min_equal"]
          : "";
      const maxEqual =
        key === "length" && value["max_equal"]
          ? (isNaN(value["max_equal"]) && !moment(value["max_equal"], "DD/MM/yyyy", true).isValid()) ||
            (!isNaN(value["max_equal"]) && moment(value["max_equal"], "DD/MM/yyyy", true).isValid())
            ? getTextFromReactElement(listField.find((form) => form.name === value["max_equal"].toString())?.label).replace(" *", "")
            : value["max_equal"]
          : "";
      message = message
        .replace(":name:", getTextFromReactElement(field.label).replace(" *", ""))
        .replace(
          ":compare:",
          key === "compare" ? getTextFromReactElement(listField.find((form) => form.name === value.toString())?.label ?? "").replace(" *", "") : ""
        )
        .replace(
          ":coincident:",
          key === "coincident" ? getTextFromReactElement(listField.find((form) => form.name === value.toString())?.label ?? "").replace(" *", "") : ""
        )
        .replace(":min:", min)
        .replace(":max:", max)
        .replace(":min_equal:", minEqual)
        .replace(":max_equal:", maxEqual);
      break;
    }
  }
  return message;
}

export function handleChangeValidate(
  value: any,
  field: IFieldCustomize,
  formData: IFormData,
  validations: IValidation[],
  listField: IFieldCustomize[],
  callback: (formData: IFormData) => void
) {
  const formDataTemp = _.cloneDeep(formData);
  if (value !== formDataTemp.values[field.name]) {
    formDataTemp.values[field.name] = value;
    const validation = validations.find((validation) => validation.name === field.name);
    const error = validation ? ValidateField(field, validation, formDataTemp.values, listField) : null;
    if (validation && error) {
      if (!formDataTemp.errors) {
        formDataTemp.errors = {};
      }
      formDataTemp.errors[field.name] = error;
    } else {
      if (formDataTemp.errors && formDataTemp.errors[field.name]) {
        delete formDataTemp.errors[field.name];
      }
    }
    callback(formDataTemp);
  }
}

const validateIsEmptyOrNull = (value: string | number | boolean) => {
  if (value === "" || value === null || value === undefined) {
    return true;
  }
  return false;
};

const validateDate = (value: string, valueCompare: string) => {
  if (moment(value).isAfter(moment(valueCompare))) {
    return "after";
  }
  if (moment(value).isBefore(moment(valueCompare))) {
    return "before";
  }
  if (moment(value).isSame(moment(valueCompare))) {
    return "same";
  }
};

const convertRulesStringToObject = (rulesString: string, typeForm: string) => {
  const rules = {};
  const rulesSplit = rulesString.split("|");
  for (const rule of rulesSplit) {
    if (rule === "required" || rule === "nullable" || rule === "unique") {
      rules[rule] = true;
    } else {
      const ruleName = rule.split(":")[0];
      const ruleValue = rule.split(":")[1];
      if (["min", "max", "min_equal", "max_equal"].includes(ruleName)) {
        if (rules["length"]) {
          rules["length"][ruleName] = ruleValue;
        } else {
          rules["length"] = {};
          rules["length"][ruleName] = ruleValue;
        }
      } else {
        rules[ruleName] = ruleValue;
      }
    }
  }
  if (typeForm === "number" || typeForm === "date") {
    if (rules["min"] && rules["min_equal"]) {
      delete rules["min"];
    }
    if (rules["max"] && rules["max_equal"]) {
      delete rules["max"];
    }
  } else {
    delete rules["min_equal"];
    delete rules["max_equal"];
  }
  return rules;
};

const messageError = {
  required_text: ":name: không được để trống", //required
  required_date_option: "Vui lòng chọn :name:", //required
  required_tags: "Vui lòng thêm :name:", //required
  not_match: ":name: không trùng khớp với :compare:", //compare:new_password => compare:tên trường
  coincident: "Trùng với :coincident:", //coincident:old_password => coincident:tên trường
  incorrect: ":name: không đúng", //in:name,age => coincident:danh sách giá trị

  // Text, password, textarea
  min_length: ":name: tối thiểu :min: kí tự", //min:10
  max_length: ":name: tối đa :max: kí tự", //max:10
  min_max_length: ":name: tối thiểu :min: kí tự và tối đa :max: kí tự", //min:10|max:10

  // Tags
  min_tags_length: ":name: tối thiểu :min:", //min:10
  max_tags_length: ":name: tối đa :max:", //max:20
  min_max_tags_length: ":name: tối thiểu :min: và tối đa :max:", //min:10|max:20

  // Checkbox
  min_checkbox_length: "Vui lòng chọn tối thiểu :min: :name:", //min:2
  max_checkbox_length: "Vui lòng chọn tối đa :max: :name:", //max:5
  min_max_checkbox_length: "Vui lòng chọn tối thiểu :min: và tối đa :max: :name:", //min:2|max:5

  // Number
  min_number: ":name: phải lớn hơn :min:", //min:20
  min_equal_number: ":name: phải lớn hơn hoặc bằng :min_equal:", //min_equal:20
  min_compare_number: ":name: phải lớn hơn :min: và :compare:", //min:20|compare:amount
  min_equal_compare_number: ":name: phải lớn hơn :compare: và lớn hơn hoặc bằng :min_equal:", //min_equal:20|compare:amount
  min_compare_equal_number: ":name: phải lớn hơn :min: và lớn hơn hoặc bằng :compare_equal:", //min:20|compare_equal:amount
  min_equal_compare_equal_number: ":name: phải lớn hơn hoặc bằng :min_equal: và :compare_equal:",

  max_number: ":name: phải nhỏ hơn :max:", //max:20
  max_equal_number: ":name: phải nhỏ hơn hoặc bằng :max_equal:", //max_equal:20
  max_compare_number: ":name: phải nhỏ hơn :max: và :compare:", //max:20|compare:amount
  max_equal_compare_number: ":name: phải nhỏ hơn :compare: và nhỏ hơn hoặc bằng :max_equal:", //max_equal:20|compare:amount
  max_compare_equal_number: ":name: phải nhỏ hơn :max: và nhỏ hơn hoặc bằng :compare_equal:", //max:20|compare_equal:amount
  max_equal_compare_equal_number: ":name: phải nhỏ hơn hoặc bằng :max_equal: và :compare_equal:",

  min_max_number: ":name: phải lớn hơn :min: và nhỏ hơn :max:", //min:20|max:40
  min_max_equal_number: ":name: phải lớn hơn :min: và nhỏ hơn hoặc bằng :max_equal:", //min:20|max_equal:40
  min_equal_max_number: ":name: phải nhỏ hơn :max: và lớn hơn hoặc bằng :min_equal:", //min_equal:20|max:40
  min_equal_max_equal_number: ":name: phải lớn hơn hoặc bằng :min_equal: và nhỏ hơn hoặc bằng :max_equal:", //min_equal:20|max_equal:20

  // Date
  min_date: ":name: phải lớn hơn ngày :min:", //min:23/06/2022
  min_equal_date: ":name: phải lớn hơn hoặc bằng ngày :min_equal:", //min_equal:23/06/2022
  min_compare_date: ":name: phải lớn hơn ngày :min: và :compare:", //min:23/06/2022|compare:amount
  min_equal_compare_date: ":name: phải lớn hơn :compare: và lớn hơn hoặc bằng ngày :min_equal:", //min_equal:23/06/2022|compare:amount
  min_compare_equal_date: ":name: phải lớn hơn ngày :min: và lớn hơn hoặc bằng :compare_equal:", //min:23/06/2022|compare_equal:amount
  min_equal_compare_equal_date: ":name: phải lớn hơn hoặc bằng ngày :min_equal: và :compare_equal:",

  max_date: ":name: phải nhỏ hơn ngày :max:", //max:23/06/2022
  max_equal_date: ":name: phải nhỏ hơn hoặc bằng ngày :max_equal:", //max_equal:23/06/2022
  max_compare_date: ":name: phải nhỏ hơn ngày :max: và :compare:", //max:23/06/2022|compare:amount
  max_equal_compare_date: ":name: phải nhỏ hơn :compare: và nhỏ hơn hoặc bằng ngày :max_equal:", //max_equal:23/06/2022|compare:amount
  max_compare_equal_date: ":name: phải nhỏ hơn ngày :max: và nhỏ hơn hoặc bằng :compare_equal:", //max:23/06/2022|compare_equal:amount
  max_equal_compare_equal_date: ":name: phải nhỏ hơn hoặc bằng ngày :max_equal: và :compare_equal:",

  min_max_date: ":name: phải lớn hơn :min: và nhỏ hơn ngày :max:", //min:23/06/2022|max:30/06/2022
  min_max_equal_date: ":name: phải lớn hơn ngày :min: và nhỏ hơn hoặc bằng ngày :max_equal:", //min:23/06/2022|max_equal:30/06/2022
  min_equal_max_date: ":name: phải nhỏ hơn ngày :max: và lớn hơn hoặc bằng ngày :min_equal:", //min_equal:23/06/2022|max:30/06/2022
  min_equal_max_equal_date: ":name: phải lớn hơn hoặc bằng ngày :min_equal: và nhỏ hơn hoặc bằng ngày :max_equal:", //min_equal:23/06/2022|max_equal:30/06/2022
};
