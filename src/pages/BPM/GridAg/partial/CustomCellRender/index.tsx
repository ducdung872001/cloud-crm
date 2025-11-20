import React, { useState, memo, useCallback, useEffect } from "react";
import "./index.scss";
import Icon from "components/icon";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { EMAIL_REGEX, PHONE_REGEX_NEW } from "utils/constant";
import CustomCellLookup from "./partial/CustomCellLookup";
import CustomCellDateRange from "./partial/CustomCellDateRange";
import CustomCellFormula from "./partial/CustomCellFormula";
import { useGridAg } from "../../GridAgContext";
import Checkbox from "components/checkbox/checkbox";

const optionRegex = {
  phoneRegex: PHONE_REGEX_NEW,
  emailRegex: EMAIL_REGEX,
};

const labelRegex = {
  phoneRegex: "số điện thoại",
  emailRegex: "email",
};

const CustomCellRender = (props) => {
  const { type } = props;
  const { setDataModalComment, checkComment, setCheckedMap, checkedMap } = useGridAg();
  const [haveComment, setHaveComment] = useState(false);

  useEffect(() => {
    if (checkComment && checkComment?.listData) {
      let checkCell = checkComment.listData;
      setHaveComment(checkCell[props.data.rowKey + "-" + props.colDef.field] ? true : false);
    }
  }, [checkComment, props]);

  function formatNumber(input: number): string {
    // Chuyển số thành chuỗi
    const inputStr = input.toString();

    // Tách phần nguyên và phần thập phân
    const [integerPart, decimalPart] = inputStr.split(".");

    // Định dạng phần nguyên: thêm dấu phẩy mỗi 3 chữ số
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Nếu có phần thập phân, ghép phần nguyên và phần thập phân với dấu chấm
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }

  function formatDate(input: string | Date): string {
    // Kiểm tra xem input có phải là ngày hợp lệ
    if (!moment(input).isValid()) {
      return "Invalid date";
    }

    // Định dạng ngày thành "DD/MM/YYYY"
    return moment(input).format("DD/MM/YYYY");
  }

  const generateItem = useCallback(
    (type) => {
      switch (type) {
        case "date":
          return (
            <div className="text-truncate" title={props?.value ? formatDate(props?.value) : ""}>
              {props?.value ? formatDate(props?.value) : ""}
            </div>
          );
        case "number":
          return (
            <div className="text-truncate" title={props?.value ? formatNumber(props?.value) : ""}>
              {props?.value ? formatNumber(props?.value) : ""}
            </div>
          );
        case "time_range":
          if (props?.value === null || props?.value === undefined || props?.value === "") {
            return <CustomCellDateRange {...props} />;
          } else {
            return (
              <div className="text-truncate" title={props?.value ? props.value.toString() : ""}>
                {props?.value ? props.value.toString() : ""}
              </div>
            );
          }
        case "formula":
          if (props?.value === null || props?.value === undefined || props?.value === "") {
            return <CustomCellFormula {...props} />;
          } else {
            return (
              <div className="text-truncate" title={props?.value ? props.value : null}>
                {props?.value ? props.value : null}
              </div>
            );
          }
        case "select":
          return (
            <div className="text-truncate" title={props.value}>
              {props.value}
            </div>
          );
        case "lookup":
        case "binding":
          return CustomCellLookup(props);
        case "checkbox":
          return (
            <div className="text-truncate" title={props?.value ? props.value.toString() : "false"}>
              {props.value ? (
                <Icon name="Checked" style={{ width: "14px", height: "14px" }} />
              ) : (
                <Icon name="Times" style={{ width: "2rem", height: "2rem" }} />
              )}
            </div>
          );
        default:
          return (
            <div className="text-truncate" title={props?.value ? props.value.toString() : ""}>
              {props?.value ? props.value.toString() : ""}
            </div>
          );
      }
    },
    [props.value]
  ); // Thêm các dependencies nếu cần

  return (
    <div className="custom-cell-render">
      {props?.enableAddCmtCell ? (
        <div
          title={haveComment ? "Xem ghi chú" : "Thêm ghi chú"}
          className={haveComment ? "note" : "add-note"}
          onClick={() => {
            setDataModalComment({
              show: true,
              rowKey: props.data.rowKey,
              columnKey: props.colDef.field,
            });
          }}
        >
          {!haveComment ? <Icon name="Pencil" /> : null}
        </div>
      ) : null}
      <div
        className={`content-cell-render ${
          props.justifyContent
            ? "content-cell-render-" + props.justifyContent
            : type == "number"
            ? "content-cell-render-end"
            : "content-cell-render-start"
        }`}
      >
        {props?.required && !props?.value ? (
          <Tippy content={"Trường bắt buộc nhập"}>
            <div className="icon-error">!</div>
          </Tippy>
        ) : null}
        {props?.regex && props?.value && !props.value.match(optionRegex[props.regex]) ? (
          <Tippy content={"Sai định dạng " + labelRegex[props.regex]}>
            <div className="icon-error">!</div>
          </Tippy>
        ) : null}
        {props.haveCheckbox ? (
          <div className="checkbox-cell">
            <Checkbox
              checked={checkedMap[props.data.rowKey] ? checkedMap[props.data.rowKey][props.colDef.field] || false : false}
              onChange={(e) => {
                setCheckedMap((prev) => {
                  let newCheckedMap = { ...prev };
                  if (!newCheckedMap[props.data.rowKey]) {
                    newCheckedMap[props.data.rowKey] = {};
                  }
                  newCheckedMap[props.data.rowKey][props.colDef.field] = e.target.checked;
                  return newCheckedMap;
                });
              }}
            />
          </div>
        ) : null}
        {props.haveRadio ? (
          <div className="checkbox-cell">
            <div
              className={`circle-button ${
                (checkedMap[props.data.rowKey] ? checkedMap[props.data.rowKey][props.colDef.field] || false : false) ? "active" : ""
              }`}
              onClick={() => {
                let currentValue = checkedMap[props.data.rowKey] ? checkedMap[props.data.rowKey][props.colDef.field] || false : false;
                setCheckedMap((prev) => {
                  let newCheckedMap = { ...prev };
                  if (!newCheckedMap[props.data.rowKey]) {
                    newCheckedMap[props.data.rowKey] = {};
                  }
                  newCheckedMap[props.data.rowKey][props.colDef.field] = !currentValue;
                  // Chỉ cho phép một radio được chọn trong cùng một cột
                  Object.keys(newCheckedMap).forEach((rowKey) => {
                    if (rowKey !== props.data.rowKey) {
                      newCheckedMap[rowKey][props.colDef.field] = false;
                    }
                  });
                  return newCheckedMap;
                });
              }}
            />
          </div>
        ) : null}

        {generateItem(type)}
      </div>
    </div>
  );
};

export default memo(CustomCellRender);
