import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, createArrayFromToR, createArrayFromTo, convertParamsToString } from "reborn-util";
import "./index.scss";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import Tippy from "@tippyjs/react";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import Button from "components/button/button";
import ModalSetting from "../ModalUserTask/partials/ModalSetting";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";

export default function ModalErrorEndEvent({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
    const endRef = useRef<HTMLDivElement>(null);
    const [typeNode, setTypeNode] = useState("");
    const [haveTypeNode, setHaveTypeNode] = useState(false);

    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
    const [isModalClone, setIsModalClone] = useState(false);
    const [isModalSetting, setIsModalSetting] = useState(false);
    const [isModalDebug, setIsModalDebug] = useState(false);
    const [isLoadingType, setIsLoadingType] = useState(false);
    const [data, setData] = useState(null);
    const [childProcessId, setChildProcessId] = useState(null);
    const [dataWorkflow, setDataWorkflow] = useState(null);

    const [handleErrorData, setHandleErrorData] = useState(null);

    useEffect(() => {
        if (dataNode && onShow) {
            setIsLoadingType(true);
            if (dataNode?.businessObject?.$parent?.id && dataNode.businessObject?.$parent?.$type === "bpmn:SubProcess") {
                getDetailNode(dataNode?.id);
            }
            getTypeRuleTask(dataNode.id);
            getDetailTask(dataNode.id);
        }
    }, [dataNode, onShow]);

    const getDetailNode = async (nodeId) => {
        const response = await BusinessProcessService.bpmDetailNode(nodeId);

        if (response.code == 0) {
            const result = response.result;
            setChildProcessId(result?.processId);
        } else {
            showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
    };

    const getDetailTask = async (id) => {
        const response = await BusinessProcessService.detailErrorEndEvent(id);

        if (response.code == 0) {
            const result = response.result;

            const errorHandling = (result?.errorHandling && JSON.parse(result.errorHandling)) || null;
            setHandleErrorData(errorHandling?.config || null);

            const parsedErrorCondition = (result?.errorCondition && JSON.parse(result.errorCondition)) || null;
            const businessRule = (result?.businessRule && JSON.parse(result.businessRule)) || null;

            if (parsedErrorCondition && Array.isArray(parsedErrorCondition)) {
                setConditionList(parsedErrorCondition);
            } else if (businessRule) {
                setConditionList(businessRule);
            } else {
                setConditionList([valuesCondition]);
            }

            const data = {
                ...result,
                errorHandling: errorHandling?.type || "Retry",
            };

            setData(data);
            setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
            const loadedErrorCode = result?.errorCode
                || (parsedErrorCondition && parsedErrorCondition[0]?.error_code)
                || "";
            setFormData(prev => ({ ...prev, name: loadedErrorCode }));
            
            if (loadedErrorCode) {
                setConditionList(prev => 
                    prev.map((item, index) => 
                        index === 0 ? { ...item, error_code: loadedErrorCode } : item
                    )
                );
            }
        } else {
            showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
    };

    const getTypeRuleTask = async (id) => {
        const response = await BusinessProcessService.checkType(id);

        if (response.code == 0) {
            const result = response.result;
            setTypeNode(result || "basic");
            setHaveTypeNode(result ? true : false);
            setIsLoadingType(false);
        } else {
            showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
    };

    const values = useMemo(
        () => ({
            id: null,
            nodeId: dataNode?.id ?? null,
            processId: childProcessId ?? processId ?? null,
            workflowId: data?.workflowId ?? null,
            errorCondition: [
                {
                    logical: data?.logical ?? "and",
                    blockRule: data?.blockRule ?? [],
                    error_code: data?.error_code ?? "",
                    rule: [
                        {
                            type: null,
                            value: data?.value ?? "",
                            nodeId: dataNode?.id ?? null,
                            operator: data?.operator ?? null,
                            fieldName: data?.fieldName ?? null,
                            typeValue: data?.typeValue ?? 0,
                            typeFieldName: data?.typeFieldName ?? 1
                        }
                    ]
                }
            ],
            name: data?.errorCode ?? "",
            statusCode: data?.statusCode ?? null,
            type: data?.type ?? null,
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

        const hasEmptyErrorCode = conditionList.some(ruleItem => 
            !ruleItem.error_code || ruleItem.error_code.trim() === ""
        );
        
        if (hasEmptyErrorCode) {
            showToast("Vui lòng nhập mã lỗi cho tất cả điều kiện", "error");
            setIsSubmit(false);
            return;
        }

        const errorConditionWithCode = conditionList.map(ruleItem => ({
            logical: ruleItem.logical,
            rule: ruleItem.rule.map(rule => ({
                ...rule,
            })),
            blockRule: ruleItem.blockRule,
            error_code: ruleItem.error_code || formData.name, // Sử dụng error_code của từng điều kiện
        }));

        const body = {
            id: data?.id ?? null,
            nodeId: dataNode?.id ?? null,
            errorCondition: JSON.stringify(errorConditionWithCode), // Chuyển thành string JSON như server mong đợi
            statusCode: null,
            processId: childProcessId ?? processId ?? null,
            workflowId: formData.workflowId ?? null,
            type: null,
        };

        const response = await BusinessProcessService.updateErrorEndEvent(body);

        if (response.code === 0) {
            showToast(`Cập nhật biểu mẫu thành công`, "success");
            handleClear(false);
            if (formData.name) {
                changeNameNodeXML(dataNode, formData.name);
            }
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
        setHandleErrorData(null);
        setConditionList([{ ...valuesCondition, error_code: "" }]);
        setDataWorkflow(null);
        setTypeNode("");
        setHaveTypeNode(false);
    };

    const lstConditionFieldText = [
        { value: "eq", label: "Equal" },
        { value: "like", label: "Like" },
    ];

    const lstConditionFieldSpecialText = [{ value: "like", label: "Like" }];

    const lstConditionFieldNumber = [
        { value: "nin", label: "Nin" },
        { value: "eq", label: "Equal" },
        { value: "in", label: "In" },
        { value: "ne", label: "Not_Equal" },
        { value: "gt", label: "Greater_Than" },
        { value: "lt", label: "Less_Than" },
        { value: "gte", label: "Greater_Than_Or_Equal" },
        { value: "lte", label: "Less_Than_Or_Equal" },
    ];

    const lstConditionFieldSpecialNumber = [
        { value: "eq", label: "Equal" },
        { value: "in", label: "In" },
        { value: "gt", label: "Greater_Than" },
        { value: "lt", label: "Less_Than" },
        { value: "gte", label: "Greater_Than_Or_Equal" },
        { value: "lte", label: "Less_Than_Or_Equal" },
    ];

    const lstConditionFieldDate = [
        { value: "nin", label: "Nin" },
        { value: "eq", label: "Equal" },
        { value: "in", label: "In" },
        { value: "ne", label: "Not_Equal" },
        { value: "gt", label: "Greater_Than" },
        { value: "lt", label: "Less_Than" },
        { value: "gte", label: "Greater_Than_Or_Equal" },
        { value: "lte", label: "Less_Than_Or_Equal" },
    ];

    const lstConditionFieldSelect = [
        { value: "nin", label: "Nin" },
        { value: "eq", label: "Equal" },
        { value: "in", label: "In" },
        { value: "ne", label: "Not_Equal" },
    ];

    const defaultValue = {
        logical: "and",
        rule: [
            {
                typeFieldName: 1, //1-chọn trường trong form, 2-chọn biến quy trình
                fieldName: null,
                nodeId: null,
                operator: "eq",
                value: "",
                typeValue: 0, // 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
                type: null,
            },
        ],
        blockRule: [],
    };

    const valuesCondition = useMemo(
        () =>
        ({
            logical: "and",
            // listEformAttribute: data?.listEformAttribute || null,
            rule: [
                {
                    typeFieldName: 1, //1-chọn trường trong form, 2-chọn biến quy trình
                    fieldName: null,
                    nodeId: null,
                    operator: "eq",
                    value: "",
                    typeValue: 0, // 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
                    type: null,
                },
            ],
            blockRule: [],
            error_code: "", // Để trống cho điều kiện mới
        } as any),
        [data, onShow]
    );

    const [conditionList, setConditionList] = useState([valuesCondition]);

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
                                    fieldName: data?.value,
                                    nodeId: data?.nodeId,
                                    type: data.datatype,
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

    const handleChangeValueCondition = (e, idx, idxList) => {
        const value = e.value;

        setConditionList((current) =>
            current.map((obj, index) => {
                if (index === idxList) {
                    return {
                        ...obj,
                        rule: [...obj.rule].map((el, index) => {
                            if (idx === index) {
                                return {
                                    ...el,
                                    operator: value,
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

    const handChangeValueTypeItem = (e, idx, type, idxList) => {
        let value = null;
        if (type === "input") {
            value = e.target.value;
        }
        if (type === "number") {
            value = e.floatValue;
        }
        if (type === "date") {
            value = e;
        }
        if (type === "form" || type === "var") {
            value = e.value;
        }

        setConditionList((current) =>
            current.map((obj, index) => {
                if (index === idxList) {
                    return {
                        ...obj,
                        rule: [...obj.rule].map((el, index) => {
                            if (idx === index) {
                                return {
                                    ...el,
                                    value: value,
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

    const [isLoadingSource, setIsLoadingSource] = useState<boolean>(false);

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
                                                nodeId: data?.nodeId,
                                                type: data.datatype,
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

    const handleChangeValueBlockCondition = (e, ids, idx, idxList) => {
        const value = e.value;

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
                                                operator: value,
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

    const handChangeValueTypeBlockItem = (e, ids, idx, type, idxList) => {
        let value = null;
        if (type === "input") {
            value = e.target.value;
        }
        if (type === "number") {
            value = e.floatValue;
        }
        if (type === "date") {
            value = e;
        }
        if (type === "form" || type === "var") {
            value = e.value;
        }

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
                                                value: value,
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

    const loadedOptionAttribute = async (search, loadedOptions, { page }) => {
        const params = {
            name: search,
            page: page,
            limit: 10,
            processId: childProcessId || processId,
        };
        const response = await BusinessProcessService.listVariableDeclare(params);

        if (response.code === 0) {
            const dataOption = response.result?.items;
            let listVar = [];
            dataOption &&
                dataOption.length > 0 &&
                dataOption.map((item) => {
                    const body = (item.body && JSON.parse(item.body)) || [];
                    body.map((el) => {
                        listVar.push({
                            value: `var_${item.name}.${el.name}`,
                            label: `var_${item.name}.${el.name}`,
                            nodeId: item.nodeId,
                            datatype: el.type?.value || null,
                        });
                    });
                });

            return {
                options: [
                    ...(listVar.length > 0
                        ? listVar.map((item) => {
                            return {
                                value: item.value,
                                label: item.label,
                                nodeId: item.nodeId,
                                datatype: item.datatype,
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

    const loadedOptionForm = async (search, loadedOptions, { page }) => {
        const params = {
            code: search,
            page: page,
            limit: 10,
            processId: childProcessId || processId,
        };
        const response = await BusinessProcessService.listBpmForm(params);

        if (response.code === 0) {
            const dataOption = response.result?.filter((el) => el.code) || [];
            let listForm = [];
            dataOption &&
                dataOption.length > 0 &&
                dataOption.map((item) => {
                    const components =
                        (item.config && JSON.parse(item.config) && JSON.parse(item.config).components && JSON.parse(item.config).components) || [];
                    components.map((el) => {
                        if (el.key || el.path) {
                            listForm.push({
                                value: `frm_${item.code}.${el.key || el.path}`,
                                label: `frm_${item.code}.${el.key || el.path}`,
                                nodeId: item.nodeId,
                                datatype: el.type || null,
                            });
                        } else {
                            if (el.type === "group") {
                                el.components.map((il) => {
                                    if (il.key || il.path) {
                                        listForm.push({
                                            value: `frm_${item.code}.${el.type}.${il.key || il.path}`,
                                            label: `frm_${item.code}.${el.type}.${il.key || il.path}`,
                                            nodeId: item.nodeId,
                                            datatype: il.type || null,
                                        });
                                    } else {
                                        if (il.type === "group") {
                                            il.components.map((ol) => {
                                                if (ol.key || ol.path) {
                                                    listForm.push({
                                                        value: `frm_${item.code}.${el.type}.${il.type}.${ol.key || ol.path}`,
                                                        label: `frm_${item.code}.${el.type}.${il.type}.${ol.key || ol.path}`,
                                                        nodeId: item.nodeId,
                                                        datatype: ol.type || null,
                                                    });
                                                } else {
                                                    if (ol.type === "group") {
                                                    }
                                                }
                                            });
                                        }

                                        if (il.type === "iframe") {
                                            listForm.push({
                                                value: `frm_${item.code}.${el.type}.${il.type}`,
                                                label: `frm_${item.code}.${el.type}.${il.type}`,
                                                nodeId: item.nodeId,
                                                datatype: el.type || null,
                                            });
                                        }
                                    }
                                });
                            }

                            if (el.type === "iframe") {
                                listForm.push({
                                    value: `frm_${item.code}.${el.type}.${el.properties?.name}`,
                                    label: `frm_${item.code}.${el.type}.${el.properties?.name}`,
                                    nodeId: item.nodeId,
                                    datatype: el.type || null,
                                });
                            }
                        }
                    });
                });

            return {
                options: [
                    ...(listForm.length > 0
                        ? listForm.map((item) => {
                            return {
                                value: item.value,
                                label: item.label,
                                nodeId: item.nodeId,
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

    const [haveError, setHaveError] = useState({});

    return (
        <Fragment>
            <Modal
                isFade={true}
                isOpen={onShow}
                isCentered={true}
                staticBackdrop={true}
                size={typeNode === "advance" ? "xxl" : "xl"}
                toggle={() => !isSubmit && handleClear(false)}
                className="modal-error-end-event"
            >
                <form className="form-error-end-event" onSubmit={(e) => onSubmit(e)}>
                    <div className="container-header">
                        <div className="box-title">
                            <h4>{"Cài đặt Error End Event "}</h4>
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
                            <div className="form-group-condition">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <span className="name-group">Điều kiện lỗi</span>
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
                                                                                <div className="info-item" style={!el.fieldName ? { width: "100%" } : {}}>
                                                                                    {/* <span className="name-field">{capitalizeFirstLetter(item.name)}</span> */}
                                                                                    {/* <span className="name-field">{(el.fieldName)}</span> */}
                                                                                    <div className={"container-select-mapping"}>
                                                                                        <div className="select-mapping">
                                                                                            <SelectCustom
                                                                                                key={el.typeFieldName}
                                                                                                id=""
                                                                                                name=""
                                                                                                // label="Chọn biểu mẫu"
                                                                                                options={[]}
                                                                                                fill={false}
                                                                                                value={el.fieldName ? { value: el.fieldName, label: el.fieldName } : null}
                                                                                                special={true}
                                                                                                required={true}
                                                                                                onChange={(e) => handlePushRule(e, idx, idxList)}
                                                                                                isAsyncPaginate={true}
                                                                                                isFormatOptionLabel={false}
                                                                                                placeholder={el.typeFieldName === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                                                                additional={{
                                                                                                    page: 1,
                                                                                                }}
                                                                                                loadOptionsPaginate={el.typeFieldName === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                                                            // formatOptionLabel={formatOptionLabelEmployee}
                                                                                            // error={checkFieldEform}
                                                                                            // message="Biểu mẫu không được bỏ trống"
                                                                                            />
                                                                                        </div>
                                                                                        <Tippy content={el.typeFieldName === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
                                                                                            <div
                                                                                                className={"icon-change-select"}
                                                                                                onClick={(e) => {
                                                                                                    setConditionList((current) =>
                                                                                                        current.map((obj, index) => {
                                                                                                            if (index === idxList) {
                                                                                                                return {
                                                                                                                    ...obj,
                                                                                                                    rule: [...obj.rule].map((el, index) => {
                                                                                                                        if (idx === index) {
                                                                                                                            return {
                                                                                                                                ...el,
                                                                                                                                typeFieldName: el.typeFieldName === 1 ? 2 : 1,
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
                                                                                                <Icon name="ResetPassword" style={{ width: 18 }} />
                                                                                            </div>
                                                                                        </Tippy>
                                                                                    </div>
                                                                                </div>

                                                                                {el.fieldName ? (
                                                                                    <div className="info-item">
                                                                                        <SelectCustom
                                                                                            name="condition"
                                                                                            fill={true}
                                                                                            value={el.operator}
                                                                                            options={
                                                                                                el.fieldName === "name"
                                                                                                    ? lstConditionFieldSpecialText
                                                                                                    : el.type === "text" && el.fieldName === "email"
                                                                                                        ? [...lstConditionFieldText, { value: "ne", label: "Not_Equal" }]
                                                                                                        : el.type === "text" || el.type === "textfield"
                                                                                                            ? lstConditionFieldText
                                                                                                            : el.fieldName === "height" || el.fieldName === "weight"
                                                                                                                ? lstConditionFieldSpecialNumber
                                                                                                                : el.type === "number" || el.type === "int"
                                                                                                                    ? lstConditionFieldNumber
                                                                                                                    : el.type === "date"
                                                                                                                        ? lstConditionFieldDate
                                                                                                                        : lstConditionFieldSelect
                                                                                            }
                                                                                            // disabled={disableFieldCommom}
                                                                                            onChange={(e) => handleChangeValueCondition(e, idx, idxList)}
                                                                                        />
                                                                                    </div>
                                                                                ) : null}

                                                                                {el.fieldName ? (
                                                                                    <div className="info-item">
                                                                                        <div className={"container-select-mapping"}>
                                                                                            {!el.typeValue ? (
                                                                                                <div className="input-text">
                                                                                                    <Input
                                                                                                        name={el.fieldName}
                                                                                                        fill={false}
                                                                                                        value={el.value}
                                                                                                        // disabled={disableFieldCommom}
                                                                                                        onChange={(e) => handChangeValueTypeItem(e, idx, "input", idxList)}
                                                                                                        // placeholder={`Nhập ${el.fieldName?.toLowerCase()}`}
                                                                                                        placeholder={`Nhập giá trị`}
                                                                                                    />
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="select-mapping">
                                                                                                    <SelectCustom
                                                                                                        key={el.typeValue}
                                                                                                        id=""
                                                                                                        name=""
                                                                                                        // label="Chọn biểu mẫu"
                                                                                                        options={[]}
                                                                                                        fill={false}
                                                                                                        value={el.value ? { value: el.value, label: el.value } : null}
                                                                                                        special={true}
                                                                                                        required={true}
                                                                                                        onChange={(e) =>
                                                                                                            handChangeValueTypeItem(e, idx, el.typeValue === 1 ? "form" : "var", idxList)
                                                                                                        }
                                                                                                        isAsyncPaginate={true}
                                                                                                        isFormatOptionLabel={false}
                                                                                                        placeholder={el.typeValue === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                                                                        additional={{
                                                                                                            page: 1,
                                                                                                        }}
                                                                                                        loadOptionsPaginate={el.typeValue === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                                                                    />
                                                                                                </div>
                                                                                            )}
                                                                                            <Tippy
                                                                                                content={
                                                                                                    el.typeValue === 0
                                                                                                        ? "Chuyển chọn trường trong form"
                                                                                                        : el.typeValue === 1
                                                                                                            ? "Chuyển chọn biến"
                                                                                                            : "Chuyển nhập giá trị"
                                                                                                }
                                                                                            >
                                                                                                <div
                                                                                                    className={"icon-change-select"}
                                                                                                    onClick={(e) => {
                                                                                                        setConditionList((current) =>
                                                                                                            current.map((obj, index) => {
                                                                                                                if (index === idxList) {
                                                                                                                    return {
                                                                                                                        ...obj,
                                                                                                                        rule: [...obj.rule].map((il, index) => {
                                                                                                                            if (idx === index) {
                                                                                                                                return {
                                                                                                                                    ...il,
                                                                                                                                    typeValue: el.typeValue === 0 ? 1 : el.typeValue === 1 ? 2 : 0,
                                                                                                                                    value: "",
                                                                                                                                };
                                                                                                                            }

                                                                                                                            return il;
                                                                                                                        }),
                                                                                                                    };
                                                                                                                }
                                                                                                                return obj;
                                                                                                            })
                                                                                                        );
                                                                                                    }}
                                                                                                >
                                                                                                    <Icon name="ResetPassword" style={{ width: 18 }} />
                                                                                                </div>
                                                                                            </Tippy>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : null}
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
                                                                                                                    typeFieldName: 1, //1-chọn trường trong form, 2-chọn biến quy trình
                                                                                                                    fieldName: null,
                                                                                                                    nodeId: null,
                                                                                                                    operator: "eq",
                                                                                                                    value: "",
                                                                                                                    typeValue: 0, // 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
                                                                                                                    type: null,
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
                                                                                                    <div className="info-item" style={!il.fieldName ? { width: "100%" } : {}}>
                                                                                                        {/* <span className="name-field">{il.fieldName}</span> */}
                                                                                                        <div className={"container-select-mapping"}>
                                                                                                            <div className="select-mapping">
                                                                                                                <SelectCustom
                                                                                                                    key={il.typeFieldName}
                                                                                                                    id=""
                                                                                                                    name=""
                                                                                                                    // label="Chọn biểu mẫu"
                                                                                                                    options={[]}
                                                                                                                    fill={false}
                                                                                                                    value={il.fieldName ? { value: il.fieldName, label: il.fieldName } : null}
                                                                                                                    special={true}
                                                                                                                    required={true}
                                                                                                                    onChange={(e) => handlePushRuleBlock(e, index, idx, idxList)}
                                                                                                                    isAsyncPaginate={true}
                                                                                                                    isFormatOptionLabel={false}
                                                                                                                    placeholder={il.typeFieldName === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                                                                                    additional={{
                                                                                                                        page: 1,
                                                                                                                    }}
                                                                                                                    loadOptionsPaginate={il.typeFieldName === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                                                                                />
                                                                                                            </div>
                                                                                                            <Tippy
                                                                                                                content={il.typeFieldName === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}
                                                                                                            >
                                                                                                                <div
                                                                                                                    className={"icon-change-select"}
                                                                                                                    onClick={(e) => {
                                                                                                                        setConditionList((current) =>
                                                                                                                            current.map((obj, ids) => {
                                                                                                                                if (ids === idxList) {
                                                                                                                                    return {
                                                                                                                                        ...obj,
                                                                                                                                        blockRule: [...obj.blockRule].map((el, ids) => {
                                                                                                                                            if (ids === idx) {
                                                                                                                                                return {
                                                                                                                                                    ...el,
                                                                                                                                                    rule: [...el.rule].map((ol, i) => {
                                                                                                                                                        if (i === index) {
                                                                                                                                                            return {
                                                                                                                                                                ...ol,
                                                                                                                                                                typeFieldName: il.typeFieldName === 1 ? 2 : 1,
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
                                                                                                                    }}
                                                                                                                >
                                                                                                                    <Icon name="ResetPassword" style={{ width: 18 }} />
                                                                                                                </div>
                                                                                                            </Tippy>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {il.fieldName ? (
                                                                                                        <div className="info-item">
                                                                                                            <SelectCustom
                                                                                                                name="condition"
                                                                                                                fill={true}
                                                                                                                value={il.operator}
                                                                                                                options={
                                                                                                                    il.fieldName === "name"
                                                                                                                        ? lstConditionFieldSpecialText
                                                                                                                        : il.type === "text" && il.fieldName === "email"
                                                                                                                            ? [...lstConditionFieldText, { value: "ne", label: "Not_Equal" }]
                                                                                                                            : il.type === "text" || il.type === "textfield"
                                                                                                                                ? lstConditionFieldText
                                                                                                                                : il.fieldName === "height" || il.fieldName === "weight"
                                                                                                                                    ? lstConditionFieldSpecialNumber
                                                                                                                                    : il.type === "number"
                                                                                                                                        ? lstConditionFieldNumber
                                                                                                                                        : il.type === "date"
                                                                                                                                            ? lstConditionFieldDate
                                                                                                                                            : lstConditionFieldSelect
                                                                                                                }
                                                                                                                // disabled={disableFieldCommom}
                                                                                                                onChange={(e) => handleChangeValueBlockCondition(e, index, idx, idxList)}
                                                                                                            />
                                                                                                        </div>
                                                                                                    ) : null}

                                                                                                    {il.fieldName ? (
                                                                                                        <div className="info-item">
                                                                                                            <div className={"container-select-mapping"}>
                                                                                                                {!il.typeValue ? (
                                                                                                                    <div className="input-text">
                                                                                                                        <Input
                                                                                                                            name={il.fieldName}
                                                                                                                            fill={false}
                                                                                                                            value={il.value}
                                                                                                                            // disabled={disableFieldCommom}
                                                                                                                            onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "input", idxList)}
                                                                                                                            // placeholder={`Nhập ${il.fieldName?.toLowerCase()}`}
                                                                                                                            placeholder={`Nhập giá trị`}
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                ) : (
                                                                                                                    <div className="select-mapping">
                                                                                                                        <SelectCustom
                                                                                                                            key={il.typeValue}
                                                                                                                            id=""
                                                                                                                            name=""
                                                                                                                            // label="Chọn biểu mẫu"
                                                                                                                            options={[]}
                                                                                                                            fill={false}
                                                                                                                            value={il.value ? { value: il.value, label: il.value } : null}
                                                                                                                            special={true}
                                                                                                                            required={true}
                                                                                                                            onChange={(e) =>
                                                                                                                                handChangeValueTypeBlockItem(
                                                                                                                                    e,
                                                                                                                                    index,
                                                                                                                                    idx,
                                                                                                                                    il.typeValue === 1 ? "form" : "var",
                                                                                                                                    idxList
                                                                                                                                )
                                                                                                                            }
                                                                                                                            isAsyncPaginate={true}
                                                                                                                            isFormatOptionLabel={false}
                                                                                                                            placeholder={il.typeValue === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                                                                                            additional={{
                                                                                                                                page: 1,
                                                                                                                            }}
                                                                                                                            loadOptionsPaginate={il.typeValue === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                                                                                        // formatOptionLabel={formatOptionLabelEmployee}
                                                                                                                        // error={checkFieldEform}
                                                                                                                        // message="Biểu mẫu không được bỏ trống"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                )}
                                                                                                                <Tippy
                                                                                                                    content={
                                                                                                                        il.typeValue === 0
                                                                                                                            ? "Chuyển chọn trường trong form"
                                                                                                                            : il.typeValue === 1
                                                                                                                                ? "Chuyển chọn biến"
                                                                                                                                : "Chuyển nhập giá trị"
                                                                                                                    }
                                                                                                                >
                                                                                                                    <div
                                                                                                                        className={"icon-change-select"}
                                                                                                                        onClick={(e) => {
                                                                                                                            setConditionList((current) =>
                                                                                                                                current.map((obj, ids) => {
                                                                                                                                    if (ids === idxList) {
                                                                                                                                        return {
                                                                                                                                            ...obj,
                                                                                                                                            blockRule: [...obj.blockRule].map((el, ids) => {
                                                                                                                                                if (ids === idx) {
                                                                                                                                                    return {
                                                                                                                                                        ...el,
                                                                                                                                                        rule: [...el.rule].map((ol, i) => {
                                                                                                                                                            if (i === index) {
                                                                                                                                                                return {
                                                                                                                                                                    ...ol,
                                                                                                                                                                    typeValue: il.typeValue === 0 ? 1 : il.typeValue === 1 ? 2 : 0,
                                                                                                                                                                    value: "",
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
                                                                                                                        }}
                                                                                                                    >
                                                                                                                        <Icon name="ResetPassword" style={{ width: 18 }} />
                                                                                                                    </div>
                                                                                                                </Tippy>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ) : null}
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
                                                                                                                                                    typeFieldName: 1, //1-chọn trường trong form, 2-chọn biến quy trình
                                                                                                                                                    fieldName: null,
                                                                                                                                                    nodeId: null,
                                                                                                                                                    operator: "eq",
                                                                                                                                                    value: "",
                                                                                                                                                    typeValue: 0, // 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
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
                                                <Input
                                                    id={`error_code_${idxList}`}
                                                    name={`error_code_${idxList}`}
                                                    label="Mã lỗi cho điều kiện này"
                                                    fill={true}
                                                    required={true}
                                                    value={item.error_code || ""}
                                                    onChange={(e) => {
                                                        setConditionList((current) =>
                                                            current.map((obj, index) => {
                                                                if (index === idxList) {
                                                                    return { ...obj, error_code: e.target.value };
                                                                }
                                                                return obj;
                                                            })
                                                        );
                                                    }}
                                                    placeholder={"Nhập mã lỗi"}
                                                />
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
