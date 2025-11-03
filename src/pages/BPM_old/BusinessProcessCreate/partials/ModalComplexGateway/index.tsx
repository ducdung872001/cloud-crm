import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, createArrayFromToR, createArrayFromTo, convertParamsToString } from "reborn-util";
import "./index.scss";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import Tippy from "@tippyjs/react";
import RadioList from "components/radio/radioList";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import Button from "components/button/button";
import ModalSetting from "../ModalUserTask/partials/ModalSetting";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";

export default function ModalComplexGateway({ onShow, onHide, dataNode, processId, disable }) {
  const endRef = useRef<HTMLDivElement>(null);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [data, setData] = useState(null);
  const [childProcessId, setChildProcessId] = useState(null);

  useEffect(() => {
    if (dataNode && onShow) {
      getDetailTask(dataNode.id);
      if (dataNode?.businessObject?.$parent?.id && dataNode.businessObject?.$parent?.$type === "bpmn:SubProcess") {
        getDetailNode(dataNode?.id);
      }
    }
  }, [dataNode, onShow]);

  const getDetailTask = async (id) => {
    const response = await BusinessProcessService.detailComplexGateway(id);

    if (response.code == 0) {
      const result = response.result;

      const outgoingConditions = (result?.outgoingConditions && JSON.parse(result.outgoingConditions)) || null;
      setConditionList(outgoingConditions || [valuesCondition]);

      const data = {
        ...result,
      };

      setData(data);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailNode = async (nodeId) => {
    const response = await BusinessProcessService.bpmDetailNode(nodeId);

    if (response.code == 0) {
      const result = response.result;
      setChildProcessId(result?.processId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const values = useMemo(
    () => ({
      id: null,
      name: data?.name ?? "",
      code: data?.code ?? "",
      description: data?.description ?? "",
      gatewayType: "complex",
      outgoingConditions: data?.outgoingConditions ?? "",
      nodeId: dataNode?.id ?? null,
      processId: childProcessId ?? processId ?? null,
    }),
    [onShow, data, dataNode, processId, childProcessId]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      code: formData?.code ?? "",
      description: formData?.description ?? "",
      gatewayType: formData?.gatewayType ?? "",
      outgoingConditions: JSON.stringify(conditionList),
      nodeId: dataNode?.id ?? null,
      processId: formData?.processId ?? null,
    };
    console.log("body", body);

    const response = await BusinessProcessService.updateComplexGateway(body);

    if (response.code === 0) {
      showToast(`Cập nhật Gateway thành công`, "success");
      handleClear(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: disable ? "Đóng" : "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData, values) ? handleClear(false) : showDialogConfirmCancel();
            },
          },
          ...(disable
            ? []
            : ([
                {
                  title: "Cập nhật",
                  type: "submit",
                  color: "primary",
                  disabled: isSubmit,
                  // || !isDifferenceObj(formData, values),
                  is_loading: isSubmit,
                },
              ] as any)),
        ],
      },
    }),
    [formData, values, isSubmit, disable]
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
        handleClear(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClear = (acc) => {
    onHide(acc);
    setData(null);
    setConditionList([valuesCondition]);
  };

  const defaultValue = {
    logical: "and",
    rule: [
      {
        typeFieldName: 1,
        fieldName: null,
        nodeId: null,
        operator: "eq",
        value: "",
        type: null,
      },
    ],
    blockRule: [],
  };

  const valuesCondition = useMemo(
    () =>
      ({
        logical: "and",
        rule: [
          {
            fieldName: null,
          },
        ],
        blockRule: [],
        resultOut: null,
      } as any),
    [data, onShow]
  );

  const [conditionList, setConditionList] = useState([valuesCondition]);
  console.log("conditionList", conditionList);

  //! Đoạn này xử lý lv-1
  const handlePushRule = (data, idx, idxList) => {
    if (!data) return;

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            rule: [...obj.rule].map((el, index) => {
              if (idx === index) {
                return {
                  ...el,
                  fieldName: data?.label,
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleDeleteItemField = (idx, idxList) => {
    const newData = [...conditionList[idxList].rule];

    newData.splice(idx, 1);

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return { ...obj, rule: newData };
        }
        return obj;
      })
    );
  };

  //! Đoạn này xử lý lv-2
  const handChangeLogical = (idx, type, idxList) => {
    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  logical: type,
                };
              }
              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handDeleteItemBlock = (idx, idxList) => {
    const newData = [...conditionList[idxList].blockRule];
    newData.splice(idx, 1);

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return { ...obj, blockRule: newData };
        }
        return obj;
      })
    );
  };

  const handlePushRuleBlock = (data, ids, idx, idxList) => {
    if (!data) return;

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  rule: [...el.rule].map((ol, i) => {
                    if (i === ids) {
                      return {
                        ...ol,
                        fieldName: data?.label,
                      };
                    }

                    return ol;
                  }),
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleDeleteBlockItemField = (ids, idx, idxList) => {
    const groupRuleFilter = conditionList[idxList].blockRule[idx];
    const ruleFilter = groupRuleFilter.rule.filter((field, i) => i !== ids);

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  rule: ruleFilter,
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const loadedOptionLinkTo = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 100,
      toNodeId: dataNode?.id,
    };
    const response = await BusinessProcessService.listLinkTo(params);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.fromNodeId,
                  label: item.fromNodeName || item.fromNodeId,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const loadedOptionLinkFrom = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 100,
      fromNodeId: dataNode?.id,
    };
    const response = await BusinessProcessService.listLinkFrom(params);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.toNodeId,
                  label: item.toNodeName || item.toNodeId,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-complex-gateway"
      >
        <form className="form-complex-gateway" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={`Cài đặt biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt Complex Gateway"}</h4>
            </div>
            <div className="container-button">
              <Tippy content="Sao chép Gateway khác">
                <div>
                  <Button
                    onClick={() => {
                      setIsModalClone(true);
                    }}
                    type="button"
                    className="btn-setting"
                    color="transparent"
                    onlyIcon={true}
                  >
                    <Icon name="Copy" />
                  </Button>
                </div>
              </Tippy>
              <Tippy content="Cài đặt biến">
                <div>
                  <Button
                    onClick={() => {
                      setIsModalSetting(true);
                    }}
                    type="button"
                    className="btn-setting"
                    color="transparent"
                    onlyIcon={true}
                  >
                    <Icon name="Settings" />
                  </Button>
                </div>
              </Tippy>
              <Tippy content="Debug">
                <div>
                  <Button
                    onClick={() => {
                      setIsModalDebug(true);
                    }}
                    type="button"
                    className="btn-setting"
                    color="transparent"
                    onlyIcon={true}
                  >
                    <Icon name="Debug" style={{ width: 20 }} />
                  </Button>
                </div>
              </Tippy>
              <Button onClick={() => !isSubmit && handleClear(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                <Icon name="Times" />
              </Button>
            </div>
          </div>
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <Input
                  id="name"
                  name="name"
                  label="Tên Gateway"
                  fill={true}
                  required={true}
                  placeholder={"Tên Gateway"}
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, name: value });
                  }}
                />
              </div>

              <div className="form-group">
                <Input
                  id="code"
                  name="code"
                  label="Mã Gateway"
                  fill={true}
                  required={false}
                  placeholder={"Mã Gateway"}
                  value={formData.code}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, code: value });
                  }}
                />
              </div>

              <div className="form-group">
                <TextArea
                  name="note"
                  value={formData.description}
                  label="Mô tả Gateway"
                  fill={true}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, description: value });
                  }}
                  placeholder="Nhập Gateway"
                />
              </div>

              <div className="form-group-condition">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span className="name-group">Điều kiện kích hoạt</span>
                  </div>
                  <div
                    className="button-add"
                    onClick={() => {
                      setConditionList((oldArray) => [...oldArray, valuesCondition]);
                      endRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <div className="action__time--item action__time--add">
                      <Icon name="PlusCircleFill" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: "500" }}>Thêm điều kiện</span>
                  </div>
                </div>

                {conditionList && conditionList.length > 0
                  ? conditionList.map((item, idxList) => (
                      <div key={idxList} className="desc__filter">
                        <div className="lv__item lv__1">
                          <div className="action__choose--item action__choose--lv1">
                            <Button
                              color={item.logical === "and" ? "primary" : "secondary"}
                              onClick={(e) => {
                                e.preventDefault();
                                setConditionList((current) =>
                                  current.map((obj, index) => {
                                    if (index === idxList) {
                                      return { ...obj, logical: "and" };
                                    }
                                    return obj;
                                  })
                                );
                              }}
                              // disabled={disableFieldCommom}
                            >
                              AND
                            </Button>
                            <Button
                              color={item.logical === "or" ? "primary" : "secondary"}
                              onClick={(e) => {
                                e.preventDefault();
                                setConditionList((current) =>
                                  current.map((obj, index) => {
                                    if (index === idxList) {
                                      return { ...obj, logical: "or" };
                                    }
                                    return obj;
                                  })
                                );
                              }}
                              // disabled={disableFieldCommom}
                            >
                              OR
                            </Button>
                            <Button
                              color="success"
                              className="icon__add"
                              onClick={(e) => {
                                e.preventDefault();
                                setConditionList((current) =>
                                  current.map((obj, index) => {
                                    if (index === idxList) {
                                      return { ...obj, blockRule: [...obj.blockRule, defaultValue] };
                                    }
                                    return obj;
                                  })
                                );
                              }}
                              // disabled={disableFieldCommom}
                            >
                              <Icon name="PlusCircleFill" />
                            </Button>
                            {conditionList.length > 1 ? (
                              <Button
                                color="destroy"
                                className="icon__detete"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const newConditionList = [...conditionList];
                                  newConditionList.splice(idxList, 1);
                                  setConditionList(newConditionList);
                                }}
                                // disabled={disableFieldCommom}
                              >
                                <Icon name="Trash" />
                              </Button>
                            ) : null}
                          </div>

                          <div className="including__conditions__eform">
                            <div className="lst__field--rule">
                              {item.rule &&
                                item.rule.length > 0 &&
                                item.rule.map((el, idx) => {
                                  return (
                                    <Fragment key={idx}>
                                      <div className="item__rule">
                                        <div className="lst__info--rule">
                                          <div className="info-item">
                                            {/* <span className="name-field">{capitalizeFirstLetter(item.name)}</span> */}
                                            {/* <span className="name-field">{(el.fieldName)}</span> */}
                                            <SelectCustom
                                              id=""
                                              name=""
                                              // label="Chọn biểu mẫu"
                                              options={[]}
                                              fill={true}
                                              value={el.fieldName ? { value: el.fieldName, label: el.fieldName } : null}
                                              special={true}
                                              required={true}
                                              onChange={(e) => handlePushRule(e, idx, idxList)}
                                              isAsyncPaginate={true}
                                              isFormatOptionLabel={false}
                                              placeholder="Chọn luồng tới"
                                              additional={{
                                                page: 1,
                                              }}
                                              loadOptionsPaginate={loadedOptionLinkTo}
                                              // formatOptionLabel={formatOptionLabelEmployee}
                                              // error={checkFieldEform}
                                              // message="Biểu mẫu không được bỏ trống"
                                            />
                                          </div>
                                        </div>

                                        <div className="action__add--rule">
                                          <Tippy content="Thêm">
                                            <span
                                              className="icon__add"
                                              onClick={() => {
                                                setConditionList((current) =>
                                                  current.map((obj, index) => {
                                                    if (index === idxList) {
                                                      return {
                                                        ...obj,
                                                        rule: [
                                                          ...obj.rule,
                                                          {
                                                            fieldName: null,
                                                          },
                                                        ],
                                                      };
                                                    }
                                                    return obj;
                                                  })
                                                );
                                              }}
                                            >
                                              <Icon name="PlusCircleFill" />
                                            </span>
                                          </Tippy>
                                        </div>

                                        {item.rule.length > 1 ? (
                                          <div className="action__delete--rule">
                                            <Tippy content="Xóa">
                                              <span className="icon__delete" onClick={() => handleDeleteItemField(idx, idxList)}>
                                                <Icon name="Trash" />
                                              </span>
                                            </Tippy>
                                          </div>
                                        ) : null}
                                      </div>
                                      {item.rule.length > 1 && (
                                        <span className="view__logical view__logical--rule">{item.logical === "and" ? "And" : "Or"}</span>
                                      )}
                                    </Fragment>
                                  );
                                })}
                            </div>
                          </div>
                        </div>

                        {item.blockRule && item.blockRule.length > 0 && (
                          <div className="lv__item lv__2">
                            {item.blockRule.map((el, idx) => {
                              return (
                                <div key={idx} className="box__block--rule">
                                  <span className="view__logical">{item.logical === "and" ? "And" : "Or"}</span>

                                  <div className="block__rule">
                                    <div className="action__choose--item action__choose--lv2">
                                      <Button
                                        color={el.logical === "and" ? "primary" : "secondary"}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handChangeLogical(idx, "and", idxList);
                                        }}
                                        // disabled={disableFieldCommom}
                                      >
                                        AND
                                      </Button>
                                      <Button
                                        color={el.logical === "or" ? "primary" : "secondary"}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handChangeLogical(idx, "or", idxList);
                                        }}
                                        // disabled={disableFieldCommom}
                                      >
                                        OR
                                      </Button>
                                      {/* <Button
                                                            color="success"
                                                            className="icon__add"
                                                            onClick={(e) => {
                                                            e.preventDefault();
                                                            handAddItemBlock(idx);
                                                            }}
                                                            // disabled={disableFieldCommom}
                                                        >
                                                            <Icon name="PlusCircleFill" />
                                                        </Button> */}
                                      <Button
                                        color="destroy"
                                        className="icon__detete"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handDeleteItemBlock(idx, idxList);
                                        }}
                                        // disabled={disableFieldCommom}
                                      >
                                        <Icon name="Trash" />
                                      </Button>
                                    </div>

                                    <div className="including__conditions__eform">
                                      <div className="lst__field--rule">
                                        {el.rule &&
                                          el.rule.length > 0 &&
                                          el.rule.map((il, index) => {
                                            return (
                                              <Fragment key={index}>
                                                <div className="item__rule">
                                                  <div className="lst__info--rule">
                                                    <div className="info-item">
                                                      {/* <span className="name-field">{il.fieldName}</span> */}
                                                      <SelectCustom
                                                        key={il.typeFieldName}
                                                        id=""
                                                        name=""
                                                        // label="Chọn biểu mẫu"
                                                        options={[]}
                                                        fill={true}
                                                        value={il.fieldName ? { value: il.fieldName, label: il.fieldName } : null}
                                                        special={true}
                                                        required={true}
                                                        onChange={(e) => handlePushRuleBlock(e, index, idx, idxList)}
                                                        isAsyncPaginate={true}
                                                        isFormatOptionLabel={false}
                                                        placeholder="Chọn luồng tới"
                                                        additional={{
                                                          page: 1,
                                                        }}
                                                        loadOptionsPaginate={loadedOptionLinkTo}
                                                        // formatOptionLabel={formatOptionLabelEmployee}
                                                        // error={checkFieldEform}
                                                        // message="Biểu mẫu không được bỏ trống"
                                                      />
                                                    </div>
                                                  </div>

                                                  <div className="action__add--rule">
                                                    <Tippy content="Thêm">
                                                      <span
                                                        className="icon__add"
                                                        onClick={() => {
                                                          setConditionList((current) =>
                                                            current.map((obj, index) => {
                                                              if (index === idxList) {
                                                                return {
                                                                  ...obj,
                                                                  blockRule: [...obj.blockRule].map((el, index) => {
                                                                    if (index === idx) {
                                                                      return {
                                                                        ...el,
                                                                        rule: [
                                                                          ...el.rule,
                                                                          {
                                                                            typeFieldName: 1,
                                                                            fieldName: null,
                                                                            nodeId: null,
                                                                            operator: "eq",
                                                                            value: "",
                                                                            type: null,
                                                                          },
                                                                        ],
                                                                      };
                                                                    }

                                                                    return el;
                                                                  }),
                                                                };
                                                              }
                                                              return obj;
                                                            })
                                                          );
                                                        }}
                                                      >
                                                        <Icon name="PlusCircleFill" />
                                                      </span>
                                                    </Tippy>
                                                  </div>

                                                  {el.rule.length > 1 ? (
                                                    <div className="action__delete--rule">
                                                      <Tippy content="Xóa">
                                                        <span
                                                          className="icon__delete"
                                                          onClick={() => handleDeleteBlockItemField(index, idx, idxList)}
                                                        >
                                                          <Icon name="Trash" />
                                                        </span>
                                                      </Tippy>
                                                    </div>
                                                  ) : null}
                                                </div>
                                                {el.rule.length > 1 && (
                                                  <span className="view__logical view__logical--rule--block">
                                                    {el.logical === "and" ? "And" : "Or"}
                                                  </span>
                                                )}
                                              </Fragment>
                                            );
                                          })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="condition-result">
                          <div>
                            <span style={{ fontSize: 14, fontWeight: "700", color: "var(--success-color" }}>Luồng ra</span>
                          </div>
                          <div className="list-item-result">
                            <div className="item-result">
                              <div className={"container-select-mapping"}>
                                <div className="select-mapping">
                                  <SelectCustom
                                    id="fielName"
                                    name="fielName"
                                    // label={index === 0 ? "Biến quy trình" : ''}
                                    fill={false}
                                    required={false}
                                    // error={item.checkMapping}
                                    // message="Biến quy trình không được để trống"
                                    options={[]}
                                    value={item?.resultOut ? { value: item?.resultOut, label: item?.resultOut } : null}
                                    onChange={(e) => {
                                      setConditionList((current) =>
                                        current.map((obj, idx) => {
                                          if (idxList === idx) {
                                            return { ...obj, resultOut: e.label };
                                          }
                                          return obj;
                                        })
                                      );
                                    }}
                                    isAsyncPaginate={true}
                                    isFormatOptionLabel={false}
                                    placeholder={"Chọn luồng ra"}
                                    additional={{
                                      page: 1,
                                    }}
                                    loadOptionsPaginate={loadedOptionLinkFrom}
                                    // formatOptionLabel={formatOptionLabelEmployee}
                                    // disabled={}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  : null}
                <div ref={endRef} />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalSetting
        onShow={isModalSetting}
        dataNode={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalSetting(false);
        }}
      />
      <ModalSelectNodeOther
        onShow={isModalClone}
        data={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            getDetailTask(dataNode.id);
          }
          setIsModalClone(false);
        }}
      />
      <ModalDebug
        onShow={isModalDebug}
        dataNode={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalDebug(false);
        }}
      />
    </Fragment>
  );
}
