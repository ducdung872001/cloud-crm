import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId } from "reborn-util";
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
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";

export default function ModalInclusiveGateway({ onShow, onHide, dataNode, processId, disable }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [data, setData] = useState(null);
  const [dataTriggerConditions, setDataTriggerConditions] = useState(null);
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
    const response = await BusinessProcessService.detailInclusiveGateway(id);

    if (response.code == 0) {
      const result = response.result;

      const triggerConditions = (result?.triggerConditions && JSON.parse(result.triggerConditions)) || null;
      setDataTriggerConditions(triggerConditions?.config || null);

      const data = {
        ...result,
        triggerConditions: triggerConditions?.type || "FLOW_NUM",
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
      gatewayType: data?.gatewayType ?? null,
      triggerConditions: data?.triggerConditions ?? "FLOW_NUM",
      nodeId: dataNode?.id ?? null,
      processId: processId ?? null,
    }),
    [onShow, data, processId, dataNode]
  );

  const [formData, setFormData] = useState(values);
  //   // console.log('formData', formData);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const triggerConditionsSubmit = {
      type: formData.triggerConditions,
      config: dataTriggerConditions,
    };

    setIsSubmit(true);

    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      code: formData?.code ?? "",
      description: formData?.description ?? "",
      gatewayType: formData?.gatewayType ?? null,
      triggerConditions: JSON.stringify(triggerConditionsSubmit),
      nodeId: dataNode?.id ?? null,
      processId: processId ?? null,
    };
    console.log("body", body);

    const response = await BusinessProcessService.updateInclusiveGateway(body);

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
    setDataTriggerConditions(null);
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

  //! Đoạn này xử lý lv-2
  const handChangeLogical = (idx, type) => {
    setDataTriggerConditions({
      ...dataTriggerConditions,
      blockRule: [...dataTriggerConditions.blockRule].map((el, index) => {
        if (index === idx) {
          return {
            ...el,
            logical: type,
          };
        }

        return el;
      }),
    });
  };

  const handDeleteItemBlock = (idx) => {
    const newData = [...dataTriggerConditions.blockRule];
    newData.splice(idx, 1);

    setDataTriggerConditions({ ...formData, blockRule: newData });
  };

  const handlePushRuleBlock = (data, ids, idx) => {
    if (!data) return;

    // const changeData = {
    //   fieldName: data?.label,
    //   // value: "",
    // };

    setDataTriggerConditions({
      ...dataTriggerConditions,
      blockRule: [...dataTriggerConditions.blockRule].map((el, index) => {
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
    });
  };

  const handleDeleteBlockItemField = (ids, idx) => {
    const groupRuleFilter = dataTriggerConditions.blockRule[idx];
    const ruleFilter = groupRuleFilter.rule.filter((field, i) => i !== ids);

    setDataTriggerConditions({
      ...dataTriggerConditions,
      blockRule: [...dataTriggerConditions.blockRule].map((el, index) => {
        if (index === idx) {
          return {
            ...el,
            rule: ruleFilter,
          };
        }

        return el;
      }),
    });
  };

  const addNode = async () => {
    const body = {
      name: data?.name,
      typeNode: dataNode.type,
      processId: processId,
      nodeId: dataNode.id,
    };
    const response = await BusinessProcessService.bpmAddNode(body);

    if (response.code == 0) {
      const result = response.result;
      showToast(`Lưu Node thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
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
        className="modal-inclusive-gateway"
      >
        <form className="form-inclusive-gateway" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={`Cài đặt Gateway`} toggle={() => !isSubmit && handleClear(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt Inclusive Gateway"}</h4>
            </div>

            <ListButtonHeader
              data={data}
              dataNode={dataNode}
              processId={processId}
              disable={disable}
              isSubmit={isSubmit}
              setIsModalClone={() => setIsModalClone(true)}
              setIsModalSetting={() => setIsModalSetting(true)}
              setIsModalDebug={() => setIsModalDebug(true)}
              handleClear={() => handleClear(false)}
            />
          
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
                  placeholder="Nhập mô tả"
                />
              </div>

              <div className="form-group" style={{ width: "100%" }}>
                <SelectCustom
                  id="gatewayType"
                  name="gatewayType"
                  label="Loại Gateway"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: "Inclusive",
                      label: "Inclusive",
                    },
                  ]}
                  value={formData.gatewayType ? { value: formData.gatewayType, label: formData.gatewayType } : null}
                  onChange={(e) => {
                    setFormData({ ...formData, gatewayType: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn loại Gateway"
                  // additional={{
                  //     page: 1,
                  // }}
                  // loadOptionsPaginate={loadOptionSaleflow}
                  // formatOptionLabel={formatOptionLabelCustomer}
                  // disabled={checkParamsUrl}
                />
              </div>

              <div className="container-trigger-condition">
                <RadioList
                  options={[
                    {
                      value: "FLOW_NUM",
                      label: "Theo số luồng",
                    },
                    {
                      value: "FLOW_COMBINED",
                      label: "Theo luồng cụ thể",
                    },
                  ]}
                  // className="options-auth"
                  required={true}
                  title="Điều kiện kích hoạt"
                  name="triggerConditions"
                  value={formData.triggerConditions}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, triggerConditions: value });
                    if (value === "FLOW_NUM") {
                      setDataTriggerConditions({ quantity: "" });
                    }
                    if (value === "FLOW_COMBINED") {
                      setDataTriggerConditions({
                        logical: "and",
                        rule: [
                          {
                            fieldName: null,
                          },
                        ],
                        blockRule: [],
                      });
                    }
                  }}
                />

                {formData.triggerConditions === "FLOW_NUM" ? (
                  <div className="item-quantity">
                    <Input
                      name="quantity"
                      value={dataTriggerConditions?.quantity}
                      label="Số luồng tới"
                      fill={true}
                      required={true}
                      onChange={(e) => {
                        const value = e.target.value;
                        setDataTriggerConditions({ quantity: value });
                      }}
                      placeholder="Nhập số luồng tới"
                    />
                  </div>
                ) : null}

                {formData.triggerConditions === "FLOW_COMBINED" ? (
                  <div className="condition-trigger">
                    <div className="form-group">
                      {/* <span className="name-group">Điều kiện</span> */}
                      <div className="desc__filter">
                        <div className="lv__item lv__1">
                          <div className="action__choose--item action__choose--lv1">
                            <Button
                              color={dataTriggerConditions?.logical === "and" ? "primary" : "secondary"}
                              onClick={(e) => {
                                e.preventDefault();
                                setDataTriggerConditions({ ...dataTriggerConditions, logical: "and" });
                              }}
                              // disabled={disableFieldCommom}
                            >
                              AND
                            </Button>
                            <Button
                              color={dataTriggerConditions?.logical === "or" ? "primary" : "secondary"}
                              onClick={(e) => {
                                e.preventDefault();
                                setDataTriggerConditions({ ...dataTriggerConditions, logical: "or" });
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
                                setDataTriggerConditions({
                                  ...dataTriggerConditions,
                                  blockRule: [...dataTriggerConditions.blockRule, { logical: "and", rule: [{ fieldName: null }], blockRule: [] }],
                                });

                                // setDataTriggerConditions({ ...dataTriggerConditions, rule: [...dataTriggerConditions?.rule, {logical:"and", rule: [], blockRule: []} ]});
                              }}
                              // disabled={disableFieldCommom}
                            >
                              <Icon name="PlusCircleFill" />
                            </Button>
                          </div>

                          <div className="including__conditions__eform">
                            {/* <div className={`lst__option--group-field`}>
                                <div className={"container-select-mapping"}>
                                  <div className="select-mapping">
                                    <SelectCustom
                                      id=""
                                      name=""
                                      // label="Chọn biểu mẫu"
                                      options={[]}
                                      fill={true}
                                      // value={item.value}
                                      special={true}
                                      required={true}
                                      onChange={(e) => {
                                        const changeData = {
                                          fieldName: e?.label,
                                          // value: "",
                                        };
                                        setDataTriggerConditions({ ...dataTriggerConditions, rule: [...dataTriggerConditions.rule, ...([changeData])] });

                                      }}
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
                              </div> */}

                            <div className="lst__field--rule">
                              {dataTriggerConditions?.rule &&
                                dataTriggerConditions.rule.length > 0 &&
                                dataTriggerConditions.rule.map((item, idx) => {
                                  return (
                                    <Fragment key={idx}>
                                      <div className="item__rule">
                                        <div className="lst__info--rule">
                                          <div className="info-item">
                                            {/* <span className="name-field">{(item.fieldName)}</span> */}
                                            <div className={"container-select-mapping"}>
                                              <div className="select-mapping">
                                                <SelectCustom
                                                  id=""
                                                  name=""
                                                  // label="Chọn biểu mẫu"
                                                  options={[]}
                                                  fill={true}
                                                  value={item.fieldName ? { value: item.fieldName, label: item.fieldName } : null}
                                                  required={true}
                                                  onChange={(e) => {
                                                    setDataTriggerConditions({
                                                      ...dataTriggerConditions,
                                                      rule: [...dataTriggerConditions.rule].map((el, index) => {
                                                        if (idx === index) {
                                                          return {
                                                            ...el,
                                                            fieldName: e?.label,
                                                          };
                                                        }

                                                        return el;
                                                      }),
                                                    });
                                                    // const changeData = {
                                                    //   fieldName: e?.label,
                                                    //   // value: "",
                                                    // };
                                                    // setDataTriggerConditions({ ...dataTriggerConditions, rule: [...dataTriggerConditions.rule, ...([changeData])] });
                                                  }}
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
                                          </div>
                                        </div>

                                        <div className="action__add--rule">
                                          <Tippy content="Thêm">
                                            <span
                                              className="icon__add"
                                              onClick={() => {
                                                setDataTriggerConditions({
                                                  ...dataTriggerConditions,
                                                  rule: [
                                                    ...dataTriggerConditions.rule,
                                                    {
                                                      fieldName: null,
                                                    },
                                                  ],
                                                });
                                              }}
                                            >
                                              <Icon name="PlusCircleFill" />
                                            </span>
                                          </Tippy>
                                        </div>
                                        {dataTriggerConditions.rule.length > 1 ? (
                                          <div className="action__delete--rule">
                                            <Tippy content="Xóa">
                                              <span
                                                className="icon__delete"
                                                onClick={() => {
                                                  const newData = [...dataTriggerConditions?.rule];
                                                  newData.splice(idx, 1);
                                                  setDataTriggerConditions({ ...dataTriggerConditions, rule: newData });
                                                }}
                                              >
                                                <Icon name="Trash" />
                                              </span>
                                            </Tippy>
                                          </div>
                                        ) : null}
                                      </div>
                                      {dataTriggerConditions.rule.length > 1 && (
                                        <span className="view__logical view__logical--rule">
                                          {dataTriggerConditions.logical === "and" ? "And" : "Or"}
                                        </span>
                                      )}
                                    </Fragment>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                        {dataTriggerConditions?.blockRule && dataTriggerConditions.blockRule.length > 0 && (
                          <div className="lv__item lv__2">
                            {dataTriggerConditions.blockRule.map((item, idx) => {
                              return (
                                <div key={idx} className="box__block--rule">
                                  <span className="view__logical">{dataTriggerConditions?.logical === "and" ? "And" : "Or"}</span>

                                  <div className="block__rule">
                                    <div className="action__choose--item action__choose--lv2">
                                      <Button
                                        color={item.logical === "and" ? "primary" : "secondary"}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handChangeLogical(idx, "and");
                                        }}
                                        // disabled={disableFieldCommom}
                                      >
                                        AND
                                      </Button>
                                      <Button
                                        color={item.logical === "or" ? "primary" : "secondary"}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handChangeLogical(idx, "or");
                                        }}
                                        // disabled={disableFieldCommom}
                                      >
                                        OR
                                      </Button>
                                      <Button
                                        color="destroy"
                                        className="icon__detete"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handDeleteItemBlock(idx);
                                        }}
                                        // disabled={disableFieldCommom}
                                      >
                                        <Icon name="Trash" />
                                      </Button>
                                    </div>

                                    <div className="including__conditions__eform">
                                      {/* <SelectCustom
                                          id=""
                                          name=""
                                          // label="Chọn biểu mẫu"
                                          options={[]}
                                          fill={true}
                                          // value={formData.dataEform}
                                          special={true}
                                          required={true}
                                          onChange={(e) => handlePushRuleBlock(e, idx, item.rule)}
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
                                        /> */}

                                      <div className="lst__field--rule">
                                        {item.rule &&
                                          item.rule.length > 0 &&
                                          item.rule.map((el, index) => {
                                            return (
                                              <Fragment key={index}>
                                                <div className="item__rule">
                                                  <div className="lst__info--rule">
                                                    <div className="info-item">
                                                      {/* <span className="name-field">{el.fieldName}</span> */}
                                                      <div className={"container-select-mapping"}>
                                                        <div className="select-mapping">
                                                          <SelectCustom
                                                            id=""
                                                            name=""
                                                            // label="Chọn biểu mẫu"
                                                            options={[]}
                                                            fill={true}
                                                            value={el.fieldName ? { value: el.fieldName, label: el.fieldName } : null}
                                                            required={true}
                                                            onChange={(e) => {
                                                              handlePushRuleBlock(e, index, idx);
                                                            }}
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
                                                    </div>
                                                  </div>

                                                  <div className="action__add--rule">
                                                    <Tippy content="Thêm">
                                                      <span
                                                        className="icon__add"
                                                        onClick={() => {
                                                          setDataTriggerConditions({
                                                            ...dataTriggerConditions,
                                                            blockRule: [...dataTriggerConditions.blockRule].map((el, index) => {
                                                              if (index === idx) {
                                                                return {
                                                                  ...el,
                                                                  rule: [
                                                                    ...el.rule,
                                                                    {
                                                                      fieldName: null,
                                                                    },
                                                                  ],
                                                                };
                                                              }

                                                              return el;
                                                            }),
                                                          });
                                                        }}
                                                      >
                                                        <Icon name="PlusCircleFill" />
                                                      </span>
                                                    </Tippy>
                                                  </div>

                                                  {item.rule.length > 1 ? (
                                                    <div className="action__delete--rule">
                                                      <Tippy content="Xóa">
                                                        <span className="icon__delete" onClick={() => handleDeleteBlockItemField(index, idx)}>
                                                          <Icon name="Trash" />
                                                        </span>
                                                      </Tippy>
                                                    </div>
                                                  ) : null}
                                                </div>
                                                {item.rule.length > 1 && (
                                                  <span className="view__logical view__logical--rule--block">
                                                    {item.logical === "and" ? "And" : "Or"}
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
                      </div>
                    </div>
                  </div>
                ) : null}
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
