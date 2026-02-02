import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./index.scss";
import DecisionTableOutputService from "services/DecisionTableOutputService";
import SelectCustom from "components/selectCustom/selectCustom";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import Tippy from "@tippyjs/react";
import ModalEditValueIn from "./partial/ModalEditValueIn";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import BusinessRuleItemService from "services/BusinessRuleItemService";
import Icon from "components/icon";
import Button from "components/button/button";

export default function ModalAddDecision(props: any) {
  const { onShow, onHide, data, businessRuleId, listDecisionInput, listDecisionOutput } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        id: data?.id ?? 0,
        inputs: data?.inputs ?? "",
        outputs: data?.outputs ?? "",
        ruleIndex: data?.ruleIndex ?? "",
        businessRuleId: data?.businessRuleId ?? parseInt(businessRuleId) ?? 0,
      } as any),
    [data, onShow, businessRuleId]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const newInputs = inputs.map((input) => ({
      parameter: input.parameter,
      value: input.value,
      value2: input.value2,
      operator: input.operator,
    }));

    let newOutputs = {};
    outputs.forEach((output) => {
      newOutputs[output.parameter] = output.value;
    });

    const body: any = {
      ...(formData.values as any),
      ...(data ? { id: data.id } : {}),
      ...{ inputs: JSON.stringify(newInputs), outputs: JSON.stringify(newOutputs) },
    };

    const response = await BusinessRuleItemService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} điều kiện thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: data?.id ? "Cập nhật" : "Thêm mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);

  useEffect(() => {
    if (data) {
      let dataInputs = data.inputs ? JSON.parse(data.inputs) : [];
      let dataOutputs = data.outputs ? JSON.parse(data.outputs) : {};
      const inputFields: IFieldCustomize[] = listDecisionInput.map((item) => ({
        id: item.id,
        name: item.name,
        dataType: item.dataType,
        parameter: item.code,
        value: dataInputs.find((input) => input.parameter === item.code)?.value || "",
        value2: dataInputs.find((input) => input.parameter === item.code)?.value2 || "",
        operator: dataInputs.find((input) => input.parameter === item.code)?.operator || "",
      }));

      const outputFields: IFieldCustomize[] = listDecisionOutput.map((item) => ({
        id: item.id,
        name: item.name,
        dataType: item.dataType,
        parameter: item.code,
        value: dataOutputs[item.code] || "",
      }));
      setInputs(inputFields);
      setOutputs(outputFields);
    } else {
      const inputFields: IFieldCustomize[] = listDecisionInput.map((item) => ({
        id: item.id,
        name: item.name,
        dataType: item.dataType,
        parameter: item.code,
        value: "",
        value2: "",
        operator: "",
      }));

      const outputFields: IFieldCustomize[] = listDecisionOutput.map((item) => ({
        id: item.id,
        name: item.name,
        dataType: item.dataType,
        parameter: item.code,
        value: "",
      }));

      setInputs(inputFields);
      setOutputs(outputFields);
    }
  }, [listDecisionInput, listDecisionOutput, data]);

  const [showEditListValueIn, setShowEditListValueIn] = useState(false);

  const [dataFieldEdit, setDataFieldEdit] = useState({
    type: "",
    index: 0,
    value: [],
  });

  const [showFullScreen, setShowFullScreen] = useState<boolean>(false);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-decision"
        size={showFullScreen ? "full" : "xxl"}
      >
        <form className="form-add-reason-group" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} luật nghiệp vụ`}
            toggle={() => {
              !isSubmit && onHide(false);
            }}
          /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{`${data ? "Chỉnh sửa" : "Thêm mới"} luật nghiệp vụ`}</h4>
            </div>
            <div className="container-button">
              {!showFullScreen ? (
                <Tippy content="Mở rộng">
                  <div
                    style={{ marginBottom: 4, marginRight: 5, cursor: "pointer" }}
                    onClick={() => {
                      setShowFullScreen(true);
                    }}
                  >
                    <Icon name="ZoomInFullScreen" />
                  </div>
                </Tippy>
              ) : (
                <Tippy content="Thu nhỏ">
                  <div
                    style={{ marginBottom: 4, marginRight: 5, cursor: "pointer" }}
                    onClick={() => {
                      setShowFullScreen(false);
                    }}
                  >
                    <Icon name="ZoomOutScreen" />
                  </div>
                </Tippy>
              )}
              <Button onClick={() => !isSubmit && onHide(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                <Icon name="Times" />
              </Button>
            </div>
          </div>
          <ModalBody>
            <div className="list-form-group">
              <div style={{ marginBottom: "16px" }}>
                <NummericInput
                  name={"ruleIndex"}
                  label="Chỉ số luật"
                  value={formData?.values?.ruleIndex ? formData.values.ruleIndex : ""}
                  disabled={false}
                  fill={true}
                  thousandSeparator={true}
                  onValueChange={(e) => {
                    const updatedValues = { ...formData.values, ruleIndex: e.floatValue };
                    setFormData({ ...formData, values: updatedValues });
                  }}
                  placeholder={`Nhập chỉ số luật`}
                  // isDecimalScale={false} // Chỉ sử dụng cho số nguyên
                />
              </div>
              <div className="list-field-item list-field-basic">
                <h3>Danh sách điều kiện</h3>
                <div className="list-condition">
                  {inputs.map((item, index) => (
                    <div className="item" key={index}>
                      <div className="item-name">{item.name}</div>
                      <div className="item-condition">
                        <SelectCustom
                          id="typePrint"
                          name="typePrint"
                          fill={true}
                          value={item.operator}
                          options={[
                            { label: ">", value: "GREATER_THAN" },
                            { label: "<", value: "LESS_THAN" },
                            { label: ">=", value: "GREATER_THAN_OR_EQUAL" },
                            { label: "<=", value: "LESS_THAN_OR_EQUAL" },
                            { label: "=", value: "EQUAL" },
                            { label: "!=", value: "NOT_EQUAL" },
                            { label: "IN", value: "IN" },
                            { label: "BETWEEN", value: "BETWEEN" },
                            { label: "CONTAINS", value: "CONTAINS" },
                            { label: "OTHERWISE", value: "OTHERWISE" },
                          ]}
                          placeholder="Chọn điều kiện"
                          onChange={(e) => {
                            const updatedInputs = inputs.map((input) => {
                              if (input.id === item.id) {
                                return { ...input, operator: e.value };
                              }
                              return input;
                            });
                            setInputs(updatedInputs);
                          }}
                        />
                      </div>
                      {item?.operator !== "OTHERWISE" && (
                        <div className="item-input">
                          {item.operator === "BETWEEN" ? (
                            <div className="item-input-between">
                              <NummericInput
                                name={item.name}
                                value={item?.value && typeof item.value == "number" ? item.value : ""}
                                disabled={false}
                                fill={true}
                                thousandSeparator={true}
                                onValueChange={(e) => {
                                  const updatedInputs = inputs.map((input) => {
                                    if (input.id === item.id) {
                                      return { ...input, value: e.floatValue };
                                    }
                                    return input;
                                  });
                                  setInputs(updatedInputs);
                                }}
                                placeholder={`Min`}
                                isDecimalScale={false}
                              />

                              <NummericInput
                                name={item.name}
                                value={item?.value2 ? item.value2 : ""}
                                disabled={false}
                                fill={true}
                                thousandSeparator={true}
                                onValueChange={(e) => {
                                  const updatedInputs = inputs.map((input) => {
                                    if (input.id === item.id) {
                                      return { ...input, value2: e.floatValue };
                                    }
                                    return input;
                                  });
                                  setInputs(updatedInputs);
                                }}
                                placeholder={`Max`}
                                isDecimalScale={false}
                              />
                            </div>
                          ) : (
                            <>
                              {item.dataType === "Long" ? (
                                <NummericInput
                                  name={item.name}
                                  value={item?.value ? item.value : ""}
                                  disabled={false}
                                  fill={true}
                                  thousandSeparator={true}
                                  onValueChange={(e) => {
                                    const updatedInputs = inputs.map((input) => {
                                      if (input.id === item.id) {
                                        return { ...input, value: e.floatValue };
                                      }
                                      return input;
                                    });
                                    setInputs(updatedInputs);
                                  }}
                                  placeholder={`Nhập giá trị`}
                                  isDecimalScale={false}
                                />
                              ) : item.dataType === "Array" ? (
                                <div className="component-compare-in">
                                  {item?.value && Array.isArray(item.value) && item.value.length > 0 ? (
                                    item.value.map((el, elIndex) => {
                                      return (
                                        <div
                                          key={elIndex}
                                          className="value-compare-in add-value-compare-in"
                                          onClick={() => {
                                            setShowEditListValueIn(true);
                                            setDataFieldEdit({
                                              type: "input",
                                              index: index,
                                              value: item.value,
                                            });
                                          }}
                                        >
                                          {el}
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <Tippy content="Thêm giá trị">
                                      <div
                                        className="value-compare-in add-value-compare-in"
                                        onClick={() => {
                                          setShowEditListValueIn(true);
                                          setDataFieldEdit({
                                            type: "input",
                                            index: index,
                                            value: item.value,
                                          });
                                        }}
                                      >
                                        +
                                      </div>
                                    </Tippy>
                                  )}
                                </div>
                              ) : item.dataType === "Date" ? (
                                <DatePickerCustom
                                  name={item.name}
                                  fill={true}
                                  // value={field.value}
                                  value={item.value ? moment(item.value).format("DD/MM/YYYY") : ""}
                                  iconPosition="left"
                                  disabled={false}
                                  // icon={<Icon name="Calendar" />}
                                  onChange={(e) => {
                                    const updatedInputs = inputs.map((input) => {
                                      if (input.id === item.id) {
                                        return { ...input, value: e };
                                      }
                                      return input;
                                    });
                                    setInputs(updatedInputs);
                                  }}
                                  placeholder={`Chọn ngày`}
                                />
                              ) : (
                                <Input
                                  fill={true}
                                  name={item.name}
                                  label=""
                                  value={item.value}
                                  onChange={(e) => {
                                    const updatedInputs = inputs.map((input) => {
                                      if (input.id === item.id) {
                                        return { ...input, value: e.target.value };
                                      }
                                      return input;
                                    });
                                    setInputs(updatedInputs);
                                  }}
                                  placeholder="Nhập giá trị"
                                />
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <h3>Danh sách kết quả</h3>
                <div className="list-decision">
                  {outputs.map((item, index) => (
                    <div className="item" key={index}>
                      <div className="item-name-decision">{item.name}</div>
                      <div className="item-input-decision">
                        {item.dataType === "Long" ? (
                          <NummericInput
                            name={item.name}
                            value={item?.value ? item.value : ""}
                            disabled={false}
                            fill={true}
                            thousandSeparator={true}
                            onValueChange={(e) => {
                              const updatedOutputs = outputs.map((input) => {
                                if (input.id === item.id) {
                                  return { ...input, value: e.floatValue };
                                }
                                return input;
                              });
                              setOutputs(updatedOutputs);
                            }}
                            placeholder={`Nhập giá trị`}
                            isDecimalScale={false}
                          />
                        ) : item.dataType === "Array" ? (
                          <div className="component-compare-in">
                            {item?.value && Array.isArray(item.value) && item.value.length > 0 ? (
                              item.value.map((el, elIndex) => {
                                return (
                                  <div
                                    key={elIndex}
                                    className="value-compare-in add-value-compare-in"
                                    onClick={() => {
                                      setShowEditListValueIn(true);
                                      setDataFieldEdit({
                                        type: "output",
                                        index: index,
                                        value: item.value,
                                      });
                                    }}
                                  >
                                    {el}
                                  </div>
                                );
                              })
                            ) : (
                              <Tippy content="Thêm giá trị">
                                <div
                                  className="value-compare-in add-value-compare-in"
                                  onClick={() => {
                                    setShowEditListValueIn(true);
                                    setDataFieldEdit({
                                      type: "output",
                                      index: index,
                                      value: item.value,
                                    });
                                  }}
                                >
                                  +
                                </div>
                              </Tippy>
                            )}
                          </div>
                        ) : item.dataType === "Date" ? (
                          <DatePickerCustom
                            name={item.name}
                            fill={true}
                            // value={field.value}
                            value={item.value ? moment(item.value).format("DD/MM/YYYY") : ""}
                            iconPosition="left"
                            disabled={false}
                            // icon={<Icon name="Calendar" />}
                            onChange={(e) => {
                              const updatedOutputs = outputs.map((input) => {
                                if (input.id === item.id) {
                                  return { ...input, value: e };
                                }
                                return input;
                              });
                              setOutputs(updatedOutputs);
                            }}
                            placeholder={`Chọn ngày`}
                          />
                        ) : (
                          <Input
                            fill={true}
                            name={item.name}
                            label=""
                            value={item.value}
                            onChange={(e) => {
                              const updatedOutputs = outputs.map((input) => {
                                if (input.id === item.id) {
                                  return { ...input, value: e.target.value };
                                }
                                return input;
                              });
                              setOutputs(updatedOutputs);
                            }}
                            placeholder="Nhập giá trị"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalEditValueIn
        onShow={showEditListValueIn}
        dataFieldEdit={dataFieldEdit}
        setInputs={setInputs}
        setOutputs={setOutputs}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setShowEditListValueIn(false);
          setDataFieldEdit({
            type: "",
            index: 0,
            value: [],
          });
        }}
      />
    </Fragment>
  );
}
