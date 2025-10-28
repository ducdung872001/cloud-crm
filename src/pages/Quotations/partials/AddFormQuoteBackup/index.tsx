import React, { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "reborn-util";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import Icon from "components/icon";
import Switch from "components/switch/switch";
import { ModalFooter } from "components/modal/modal";
import QuoteService from "services/QuoteService";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";

import "./index.scss";

interface IAddQuoteProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  idQuote: number;
  dataQuote: any;
  disable: boolean;
}

export default function AddFormQuoteBackup(props: IAddQuoteProps) {
  const { idQuote, onShow, onHide, dataQuote, disable } = props;

  const [lstFieldConfig, setLstFieldConfig] = useState(null);
  const [lstField, setLstField] = useState(null);
  const [defaultFieldConfig, setDefaultFieldConfig] = useState(null);
  const [isPreview, setIsPreview] = useState<boolean>(true);
  const [lstFieldQuote, setLstFieldQuote] = useState([]);

  const transformArray = (data) => {
    return data.map((item) => {
      let dataTbodyArray = JSON.parse(item.dataTbody) || [];

      dataTbodyArray = dataTbodyArray.map((subItem) => {
        return { ...subItem, id: item.id };
      });

      return dataTbodyArray;
    });
  };

  const handleLstQuoteService = async (id: number) => {
    const params = {
      quoteId: id,
    };

    const response = await QuoteService.quoteFormLst(params);

    if (response.code === 0) {
      const result = transformArray(response.result);
      setLstFieldQuote(result);
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  const handleGetField = async (dataProps) => {
    if (!dataProps) return;

    const params = {
      sheetId: dataProps.sheetId,
      limit: 20,
    };

    const response = await SheetFieldQuoteFormService.lst(params);

    if (response.code === 0) {
      const result = response.result.items;

      const changeResult = result.map((item) => {
        const newItem: any = {
          [item.code]: "",
          type: item.type,
          placeholder: item.name.toLowerCase(),
          formula: item.formula,
          id: null,
        };

        if (item.type === "select") {
          newItem.options = JSON.parse(item.options);
        }

        return newItem;
      });

      const resultTitle = result.map((item) => {
        return {
          name: item.name,
          type: item.type,
        };
      });

      setDefaultFieldConfig(changeResult);
      setLstFieldConfig({ lstTbody: [changeResult], lstThead: resultTitle });
    }
  };

  useEffect(() => {
    if (onShow && dataQuote) {
      handleGetField(dataQuote);
      handleLstQuoteService(idQuote);
    }
  }, [onShow, dataQuote, idQuote]);

  const mergeArrays = (originalArray, targetArray) => {
    return targetArray.map((targetItem) => {
      // Tạo một mảng mới để lưu trữ các trường sau khi lọc và merge
      const mergedItem = [];

      // Lấy danh sách các keys từ originalArray để so sánh
      const originalFields = originalArray[0].map((field) => Object.keys(field)[0]);

      // Duyệt qua mỗi phần tử của targetItem
      targetItem?.forEach((targetField) => {
        // Tìm tên của trường từ danh sách originalFields
        const targetFieldName = originalFields.find((fieldName) => fieldName in targetField);
        if (targetFieldName) {
          // Nếu có, tìm trường tương ứng trong originalArray
          const originalField = originalArray[0].find((field) => Object.keys(field)[0] === targetFieldName);

          // Merge các trường từ originalField và targetField
          const mergedField = { ...originalField, ...targetField };
          mergedItem.push(mergedField);
        }
      });

      // Thêm các trường từ originalArray mà targetItem không có
      originalArray[0].forEach((originalField) => {
        const originalFieldName = Object.keys(originalField)[0];

        // Kiểm tra xem trường này đã tồn tại trong mergedItem chưa
        if (!mergedItem.some((field) => Object.keys(field)[0] === originalFieldName)) {
          // Nếu không, thêm trường này vào mảng mergedItem
          mergedItem.push(originalField);
        }
      });

      return mergedItem;
    });
  };

  useEffect(() => {
    if (lstFieldConfig) {
      const mergeConditionData = mergeArrays(
        lstFieldConfig.lstTbody,
        lstFieldQuote && lstFieldQuote.length > 0 ? lstFieldQuote : [defaultFieldConfig]
      );

      setLstField({ lstTbody: mergeConditionData, lstThead: lstFieldConfig.lstThead });
    }
  }, [lstFieldConfig, defaultFieldConfig, lstFieldQuote]);

  const handChangeValueTypeItem = (rowIndex, fieldIndex, value, type) => {
    const valueData = type == "select" ? value.value : type == "number" ? value.floatValue : value.target.value;

    // Cập nhật giá trị trong lstField.lstTbody
    const updatedData = lstField.lstTbody.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((field, fIdx) => {
          if (fIdx === fieldIndex) {
            return {
              ...field,
              [Object.keys(field)[0]]: valueData,
            };
          }
          return field;
        });
      }
      return row.map((field) => ({ ...field })); // Tạo bản sao của mỗi trường để tránh thay đổi không mong muốn
    });

    // Tạo một object với giá trị của từng field trong hàng hiện tại để sử dụng trong công thức
    const dataObj = updatedData[rowIndex].reduce((acc, item) => {
      const fieldName = Object.keys(item)[0];
      acc[fieldName] = item[fieldName] || "";
      return acc;
    }, {});

    // Tính toán giá trị dựa trên công thức nếu có
    const finalData = updatedData.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((field) => {
          if (field.formula) {
            try {
              // Thay thế các biến trong công thức bằng giá trị thực tế từ hàng hiện tại
              const formula = field.formula.replace(/(\w+)/g, (match) => {
                return dataObj.hasOwnProperty(match) ? dataObj[match] : match;
              });

              // Tính toán giá trị của công thức
              const calculatedValue = eval(formula);

              return { ...field, [Object.keys(field)[0]]: calculatedValue };
            } catch (error) {
              console.warn("Error parsing formula:", error);
            }
          }
          return field;
        });
      }
      return row;
    });

    setLstField({ ...lstField, lstTbody: finalData });
  };

  const handleDeleteRow = async (data, idx) => {
    const idData = data[0]["id"];

    if (idData) {
      const response = await QuoteService.quoteFormDelete(idData);

      if (response.code === 0) {
        const newData = lstField.lstTbody.filter((item, index) => index !== idx);
        setLstField({ ...lstField, lstTbody: newData });
      } else {
        showToast("Xóa hàng thất bại", "error");
      }
    } else {
      const newData = lstField.lstTbody.filter((item, index) => index !== idx);
      setLstField({ ...lstField, lstTbody: newData });
    }
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setLstField(null);
    setDefaultFieldConfig(null);
    setLstFieldConfig(null);
    setLstFieldQuote([]);
  };

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const handSubmitForm = () => {
    setIsSubmit(true);

    const changeLstField = [...lstField.lstTbody];

    const sendRequest = async (item) => {
      const body = {
        quoteId: idQuote,
        ...(item[0]["id"] ? { id: item[0]["id"] } : {}),
        dataTbody: JSON.stringify(item),
      };

      await QuoteService.quoteFormUpdate(body);
    };

    // Tạo mảng các promises
    const arrayPromise = changeLstField.map((item) => sendRequest(item));

    Promise.all(arrayPromise)
      .then((results) => {
        if (results && results.length > 0) {
          showToast("Cấu hình báo giá thành công", "success");
          setTimeout(() => {
            handClearForm(true);
          }, 500);
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      });

    setIsSubmit(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Quay lại",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handClearForm(false);
            },
          },
          ...(!disable
            ? ([
                {
                  title: "Xác nhận",
                  color: "primary",
                  disabled: isSubmit,
                  is_loading: isSubmit,
                  callback: () => {
                    handSubmitForm();
                  },
                },
              ] as any)
            : []),
        ],
      },
    }),
    [isSubmit, lstField, disable]
  );

  return (
    <div className="box__add-quote-form">
      <div className={`prev__form ${isPreview ? "" : "transition__hide--prev"}`}>
        {!disable && <span className="name-example">Xem trước</span>}

        {dataQuote && <h2 className="name__form">{dataQuote.name}</h2>}

        {lstField && (
          <table className="table__template">
            <thead>
              <tr>
                {lstField.lstThead.map((item, idx) => {
                  return (
                    <th key={idx} style={{ textAlign: `${item.type === "number" ? "right" : item.type === "select" ? "center" : "left"}` }}>
                      {item.name}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {lstField.lstTbody.map((item, idx) => {
                return (
                  <tr key={idx}>
                    {item.map((el, index) => {
                      return (
                        <td key={index} style={{ textAlign: `${el.type === "number" ? "right" : el.type === "select" ? "center" : "left"}` }}>
                          {el.type === "number" ? formatCurrency(Object.values(el)[0], ",", "") : Object.values(el)[0]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!disable && lstField && (
        <div className="form-group">
          <div className="label__form">
            <span className="label">Thông tin </span>

            <div className="has__preview">
              <Switch name="preview" label="Xem trước" checked={isPreview} onChange={() => setIsPreview(!isPreview)} />
            </div>
          </div>

          <div className="content__tbody--table">
            {lstField.lstTbody.map((row, rowIndex) => {
              return (
                <div key={rowIndex} className="item__tbody">
                  {row.map((field, fieldIndex) => {
                    return (
                      <div key={fieldIndex} className={`form-field form-field--${Object.keys(field)[0]}`}>
                        {field.type === "text" ? (
                          <Input
                            name={Object.keys(field)[0]}
                            fill={true}
                            value={Object.values(field)[0] as string}
                            onChange={(e) => handChangeValueTypeItem(rowIndex, fieldIndex, e, "input")}
                            placeholder={`Nhập ${field.placeholder}`}
                          />
                        ) : field.type === "number" ? (
                          <NummericInput
                            name={Object.keys(field)[0]}
                            fill={true}
                            value={Object.values(field)[0] as number}
                            thousandSeparator={true}
                            onValueChange={(e) => handChangeValueTypeItem(rowIndex, fieldIndex, e, "number")}
                            placeholder={`Nhập ${field.placeholder}`}
                          />
                        ) : (
                          <SelectCustom
                            name={Object.keys(field)[0]}
                            fill={true}
                            options={field.options || []}
                            value={Object.values(field)[0]}
                            onChange={(e) => handChangeValueTypeItem(rowIndex, fieldIndex, e, "select")}
                            placeholder={`Chọn ${field.placeholder}`}
                          />
                        )}
                      </div>
                    );
                  })}

                  <div className="action-field">
                    <div className="action-field-item action-field-add">
                      <Icon
                        name="PlusCircleFill"
                        onClick={() => setLstField({ ...lstField, lstTbody: [...lstField.lstTbody, defaultFieldConfig] })}
                      />
                    </div>

                    {lstField.lstTbody.length > 1 && (
                      <div className="action-field-item action-field-delete" onClick={() => handleDeleteRow(row, rowIndex)}>
                        <Icon name="Trash" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ModalFooter actions={actions} />
    </div>
  );
}
