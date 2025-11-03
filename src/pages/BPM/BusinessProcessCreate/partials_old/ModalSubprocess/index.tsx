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
import ModalSLA from "./ModalSLA";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";

export default function ModalSubprocess({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [data, setData] = useState(null);
  const [childProcessId, setChildProcessId] = useState(null);
  const [processIdOfchildProcess, setProcessIdOfChildProcessId] = useState(null);
  const [isModalSLA, setIsModalSLA] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [dataWorkflow, setDataWorkflow] = useState(null);
  const [listInputVar, setListInputVar] = useState([
    {
      name: "",
      attributeMapping: null,
      attributeMappingId: "",
      mappingType: 1,
      checkName: false,
      checkMapping: false,
    },
  ]);

  const [listOutVar, setListOutVar] = useState([
    {
      name: "",
      attributeMapping: null,
      attributeMappingId: "",
      mappingType: 1,
      checkName: false,
      checkMapping: false,
    },
  ]);

  useEffect(() => {
    if (dataNode && onShow) {
      getDetailTask(dataNode.id);
      getDetailNode(dataNode.id);
    }
  }, [dataNode, onShow]);

  const getDetailNode = async (nodeId) => {
    const response = await BusinessProcessService.bpmDetailNode(nodeId);

    if (response.code == 0) {
      const result = response.result;
      setChildProcessId(result?.processId);
      setProcessIdOfChildProcessId(result?.childProcessId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailTask = async (id) => {
    const response = await BusinessProcessService.detailSubprocess(id);

    if (response.code == 0) {
      const result = response.result;

      const arrayInput =
        (result.inputParams &&
          JSON.parse(result.inputParams) &&
          Object.entries(JSON.parse(result.inputParams)).map(([key, value]) => {
            return { [key]: value };
          })) ||
        [];
      //   const newListInputVarData = result.inputVar && JSON.parse(result.inputVar) && Array.isArray(JSON.parse(result.inputVar)) && JSON.parse(result.inputVar).length > 0 ? JSON.parse(result.inputVar)  : [];
      const newListInputVarData = Array.isArray(arrayInput) && arrayInput.length > 0 ? arrayInput : [];
      const listInputVarData = newListInputVarData.map((item) => {
        const name = Object.entries(item)[0][0];
        const attributeMapping: any = Object.entries(item)[0][1] || null;
        // const attributeMappingName = Object.entries(item)[0][2];

        return {
          name: name,
          attributeMapping: attributeMapping,
          attributeMappingId: attributeMapping,
          mappingType: attributeMapping?.includes("var") ? 2 : 1,
          checkName: false,
          checkMapping: false,
        };
      });
      if (listInputVarData && listInputVarData.length > 0) {
        setListInputVar(
          listInputVarData || [
            {
              name: "",
              attributeMapping: "",
              attributeMappingId: "",
              mappingType: 1,
              checkName: false,
              checkMapping: false,
            },
          ]
        );
      }

      const arrayOut =
        (result.outputParams &&
          JSON.parse(result.outputParams) &&
          Object.entries(JSON.parse(result.outputParams)).map(([key, value]) => {
            return { [key]: value };
          })) ||
        [];
      const newListOutputVarData = Array.isArray(arrayOut) && arrayInput.length > 0 ? arrayOut : [];
      const listOutputVarData = newListOutputVarData.map((item) => {
        const name = Object.entries(item)[0][0];
        const attributeMapping: any = Object.entries(item)[0][1] || null;
        // getVarSetup(attributeMapping)
        return {
          name: name,
          attributeMapping: attributeMapping,
          attributeMappingId: attributeMapping,
          mappingType: attributeMapping?.includes("var") ? 2 : 1,
          checkName: false,
          checkMapping: false,
        };
      });
      if (listOutputVarData && listOutputVarData.length > 0) {
        setListOutVar(
          listOutputVarData || [
            {
              name: "",
              attributeMapping: "",
              attributeMappingId: "",
              mappingType: 1,
              checkName: false,
              checkMapping: false,
            },
          ]
        );
      }

      setValueNode(result?.startNodeId ? { value: result?.startNodeId, label: result?.startNodeName || result?.startNodeId } : null);

      const data = {
        ...result,
      };

      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
      setData(data);
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
      inputParams: "",
      outputParams: "",
      interrupted: data?.interrupted ?? 2,
      boundaryEvents: data?.boundaryEvents ?? 1,
      nodeId: dataNode?.id ?? null,
      processId: childProcessId ?? processId ?? null,
      startNodeId: data?.startNodeId ?? null,
      workflowId: data?.workflowId ?? null,
    }),
    [onShow, data, processId, dataNode, childProcessId]
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

    ///validate biến đầu vào
    const listInputVarData = [...listInputVar];
    const checkEmptyInput = listInputVarData.map((item, index) => {
      if (!item.name) {
        return {
          ...item,
          checkName: true,
        };
      } else if (!item.attributeMapping) {
        return {
          ...item,
          checkMapping: true,
        };
      } else {
        return item;
      }
    });

    // if(checkEmptyInput && checkEmptyInput.length > 0 && checkEmptyInput.filter(el => el.checkName).length > 0){
    //   setListInputVar(checkEmptyInput);
    //   return;
    // }

    // if(checkEmptyInput && checkEmptyInput.length > 0 && checkEmptyInput.filter(el => el.checkMapping).length > 0){
    //   setListInputVar(checkEmptyInput);
    //   return;
    // }

    const listInputVarSubmit = (listInputVarData || []).map((item) => {
      return {
        [item.name]: item.attributeMapping,
      };
    });

    const objInput = listInputVarSubmit.reduce((acc, curr) => {
      const key = Object.keys(curr)[0];
      acc[key] = curr[key];
      return acc;
    });

    // console.log('listInputVarSubmit', listInputVarSubmit);

    ///validate biến đầu ra
    const listOutVarData = [...listOutVar];
    const checkEmptyOut = listOutVarData.map((item, index) => {
      if (!item.name) {
        return {
          ...item,
          checkName: true,
        };
      } else if (!item.attributeMapping) {
        return {
          ...item,
          checkMapping: true,
        };
      } else {
        return item;
      }
    });

    // if(checkEmptyOut && checkEmptyOut.length > 0 && checkEmptyOut.filter(el => el.checkName).length > 0){
    //   setListOutVar(checkEmptyOut);
    //   return;
    // }

    // if(checkEmptyOut && checkEmptyOut.length > 0 && checkEmptyOut.filter(el => el.checkMapping).length > 0){
    //   setListOutVar(checkEmptyOut);
    //   return;
    // }

    const listOutVarSubmit = (listOutVarData || []).map((item) => {
      return {
        [item.name]: item.attributeMapping,
      };
    });

    const objOut = listOutVarSubmit.reduce((acc, curr) => {
      const key = Object.keys(curr)[0];
      acc[key] = curr[key];
      return acc;
    });

    // console.log('listOutVarSubmit', listOutVarSubmit);

    setIsSubmit(true);

    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      code: formData?.code ?? "",
      description: formData?.description ?? "",
      interrupted: formData?.interrupted ?? 2,
      // boundaryEvents: formData?.boundaryEvents ?? 1,
      inputParams: JSON.stringify(objInput),
      outputParams: JSON.stringify(objOut),
      nodeId: dataNode?.id ?? null,
      processId: formData?.processId ?? null,
      startNodeId: formData.startNodeId ?? null,
      workflowId: formData?.workflowId ?? null,
    };
    console.log("body", body);

    const response = await BusinessProcessService.updateSubprocess(body);

    if (response.code === 0) {
      showToast(`Cập nhật biểu mẫu thành công`, "success");
      handleClear(false);
      changeNameNodeXML(dataNode, body.name);
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
    setListInputVar([
      {
        name: "",
        attributeMapping: "",
        attributeMappingId: "",
        mappingType: 1,
        checkName: false,
        checkMapping: false,
      },
    ]);
    setListOutVar([
      {
        name: "",
        attributeMapping: "",
        attributeMappingId: "",
        mappingType: 1,
        checkName: false,
        checkMapping: false,
      },
    ]);
    setDataWorkflow(null);
    setValueNode(null);
    setValidateFieldNode(false);
    setChildProcessId(null);
    setProcessIdOfChildProcessId(null);
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

  const loadedOptionAttributeChildProcess = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
      processId: processIdOfchildProcess,
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
                  value: `frm_${item.code}.${el.type}`,
                  label: `frm_${item.code}.${el.type}`,
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

  const loadedOptionFormChildProcess = async (search, loadedOptions, { page }) => {
    const params = {
      code: search,
      page: page,
      limit: 10,
      processId: processIdOfchildProcess,
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
                  value: `frm_${item.code}.${el.type}`,
                  label: `frm_${item.code}.${el.type}`,
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

  const loadedOptionWorkflow = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
      processId: processId,
    };
    const response = await BusinessProcessService.listStep(params);

    if (response.code === 0) {
      const dataOption = response.result?.items || [];
      const options = dataOption.filter((el) => el.stepName);

      return {
        options: [
          ...(options.length > 0
            ? options.map((item) => {
                return {
                  value: item.id,
                  label: item.stepName,
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

  const [validateFieldNode, setValidateFieldNode] = useState<boolean>(false);
  const [valueNode, setValueNode] = useState(null);

  const loadedOptionNode = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      status: 1,
      limit: 10,
      processId: processIdOfchildProcess,
    };

    const response = await BusinessProcessService.bpmListNode(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.nodeId,
                  label: item.name || item.nodeId,
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

  const handleChangeValueNode = (e) => {
    setValueNode(e);
    setFormData({ ...formData, startNodeId: e.value });
    setValidateFieldNode(false);
  };

  useEffect(() => {
    loadedOptionNode("", undefined, { page: 1 });
  }, [processIdOfchildProcess, processId]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-subprocess"
      >
        <form className="form-subprocess" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={`Cài đặt biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt nhiệm vụ"}</h4>
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
                  label="Tên nhiệm vụ"
                  fill={true}
                  required={true}
                  placeholder={"Tên nhiệm vụ"}
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
                  label="Mã nhiệm vụ"
                  fill={true}
                  required={false}
                  placeholder={"Mã nhiệm vụ"}
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
                  label="Mô tả nhiệm vụ"
                  fill={true}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, description: value });
                  }}
                  placeholder="Nhập mô tả"
                />
              </div>

              <div className="container-inputVar">
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Biến đầu vào</span>
                </div>
                {listInputVar && listInputVar.length > 0
                  ? listInputVar.map((item, index) => (
                      <div key={index} className="list-item-inputVar">
                        <div className="item-inputVar">
                          <SelectCustom
                            id="fielName"
                            name="fielName"
                            label={index === 0 ? "Tên tham số đầu vào (child)" : ""}
                            fill={true}
                            required={false}
                            error={item.checkName}
                            message="Biến quy trình không được để trống"
                            options={[]}
                            value={item.name ? { value: item.name, label: item.name } : null}
                            onChange={(e) => {
                              setListInputVar((current) =>
                                current.map((obj, idx) => {
                                  if (index === idx) {
                                    return { ...obj, name: e.value, checkName: false };
                                  }
                                  return obj;
                                })
                              );
                            }}
                            isAsyncPaginate={true}
                            isFormatOptionLabel={false}
                            placeholder={"Chọn biến"}
                            additional={{
                              page: 1,
                            }}
                            loadOptionsPaginate={loadedOptionAttributeChildProcess}
                            // formatOptionLabel={formatOptionLabelEmployee}
                            // error={checkFieldEform}
                            // message="Biểu mẫu không được bỏ trống"
                            // disabled={}
                          />
                          {/* <Input
                                        id="nameInput"
                                        name="nameInput"
                                        label={index === 0 ? "Tên tham số đầu vào" : ''}
                                        fill={true}
                                        required={false}
                                        error={item.checkName}
                                        message="Tên tham số đầu vào không được để trống"
                                        placeholder={"Tên tham số đầu vào"}
                                        value={item.name}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setListInputVar((current) =>
                                                    current.map((obj, idx) => {
                                                        if (index === idx) {
                                                            return { ...obj, name: value, checkName: false };
                                                        }
                                                        return obj;
                                                    })
                                                );
                                        }}
                                    /> */}
                        </div>
                        <div className="item-inputVar">
                          {index === 0 ? (
                            <div>
                              <span style={{ fontSize: 14, fontWeight: "700" }}>Biến quy trình (parent)</span>
                            </div>
                          ) : null}
                          <div className={"container-select-mapping"}>
                            <div className="select-mapping">
                              <SelectCustom
                                key={item?.mappingType}
                                id="fielName"
                                name="fielName"
                                // label={index === 0 ? "Biến quy trình" : ''}
                                fill={false}
                                required={false}
                                error={item.checkMapping}
                                message="Biến quy trình không được để trống"
                                options={[]}
                                value={item.attributeMapping ? { value: item.attributeMappingId, label: item.attributeMapping } : null}
                                onChange={(e) => {
                                  setListInputVar((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        return { ...obj, attributeMapping: e.label, attributeMappingId: e.value, checkMapping: false };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                                isAsyncPaginate={true}
                                isFormatOptionLabel={false}
                                // placeholder={item.mappingType === 2 ? "Chọn biến" : 'Chọn trường trong form'}
                                placeholder={item.mappingType === 2 ? "Chọn biến" : "Chọn trường trong form"}
                                additional={{
                                  page: 1,
                                }}
                                loadOptionsPaginate={item?.mappingType === 2 ? loadedOptionAttribute : loadedOptionForm}
                                // formatOptionLabel={formatOptionLabelEmployee}
                                // error={checkFieldEform}
                                // message="Biểu mẫu không được bỏ trống"
                                // disabled={}
                              />
                            </div>
                            <Tippy content={item.mappingType === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
                              <div
                                className={"icon-change-select"}
                                onClick={(e) => {
                                  if (item.mappingType === 1) {
                                    setListInputVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, mappingType: 2 };
                                        }
                                        return obj;
                                      })
                                    );
                                  } else {
                                    setListInputVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, mappingType: 1 };
                                        }
                                        return obj;
                                      })
                                    );
                                  }
                                }}
                              >
                                <Icon name="ResetPassword" style={{ width: 18 }} />
                              </div>
                            </Tippy>
                          </div>
                          {/* <SelectCustom
                                        // key={listAttribute.length}
                                        id=""
                                        name="name"
                                        label={index === 0 ? "Biến quy trình" : ''}
                                        fill={true}
                                        required={false}
                                        error={item.checkMapping}
                                        message="Biến quy trình không được để trống"
                                        options={[]}
                                        value={item.attributeMapping ? {value: item.attributeMappingId, label: item.attributeMapping} : null}
                                        onChange={(e) => {
                                            setListInputVar((current) =>
                                                    current.map((obj, idx) => {
                                                        if (index === idx) {
                                                            return { ...obj, attributeMapping: e.label, attributeMappingId: e.value, checkMapping: false };
                                                        }
                                                        return obj;
                                                    })
                                                );
                                        }}
                                        isAsyncPaginate={true}
                                        placeholder="Chọn biến quy trình"
                                        additional={{
                                            page: 1,
                                        }}
                                        loadOptionsPaginate={loadedOptionAttribute}
                                        // formatOptionLabel={formatOptionLabelAttribute}
                                    /> */}
                        </div>
                        <div className="add-attribute" style={index === 0 ? { marginTop: "3.2rem" } : {}}>
                          <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                            <span
                              className="icon-add"
                              onClick={() => {
                                setListInputVar([
                                  ...listInputVar,
                                  {
                                    name: "",
                                    attributeMapping: "",
                                    attributeMappingId: "",
                                    mappingType: 1,
                                    checkName: false,
                                    checkMapping: false,
                                  },
                                ]);
                              }}
                            >
                              <Icon name="PlusCircleFill" />
                            </span>
                          </Tippy>
                        </div>

                        {listInputVar.length > 1 ? (
                          <div className="remove-attribute" style={index === 0 ? { marginTop: "3.2rem" } : {}}>
                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                              <span
                                className="icon-remove"
                                onClick={() => {
                                  const newList = [...listInputVar];
                                  newList.splice(index, 1);
                                  setListInputVar(newList);
                                }}
                              >
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          </div>
                        ) : null}
                      </div>
                    ))
                  : null}
              </div>

              <div className="container-outVar">
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Biến đầu ra</span>
                </div>
                {listOutVar && listOutVar.length > 0
                  ? listOutVar.map((item, index) => (
                      <div key={index} className="list-item-outVar">
                        <div className="item-outVar">
                          <SelectCustom
                            id="fielName"
                            name="fielName"
                            label={index === 0 ? "Tên tham số đầu ra (parent)" : ""}
                            fill={true}
                            required={false}
                            error={item.checkName}
                            message="Biến quy trình không được để trống"
                            options={[]}
                            value={item.name ? { value: item.name, label: item.name } : null}
                            onChange={(e) => {
                              setListOutVar((current) =>
                                current.map((obj, idx) => {
                                  if (index === idx) {
                                    return { ...obj, name: e.value, checkName: false };
                                  }
                                  return obj;
                                })
                              );
                            }}
                            isAsyncPaginate={true}
                            isFormatOptionLabel={false}
                            placeholder={"Chọn biến"}
                            additional={{
                              page: 1,
                            }}
                            loadOptionsPaginate={loadedOptionAttribute}
                            // formatOptionLabel={formatOptionLabelEmployee}
                            // error={checkFieldEform}
                            // message="Biểu mẫu không được bỏ trống"
                            // disabled={}
                          />
                          {/* <Input
                                        id="name"
                                        name="name"
                                        label={index === 0 ? "Tên tham số đầu ra" : ''}
                                        fill={true}
                                        required={false}
                                        error={item.checkName}
                                        message="Tên tham số đầu ra không được để trống"
                                        placeholder={"Tên tham số đầu ra"}
                                        value={item.name}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setListOutVar((current) =>
                                                    current.map((obj, idx) => {
                                                        if (index === idx) {
                                                            return { ...obj, name: value, checkName: false };
                                                        }
                                                        return obj;
                                                    })
                                                );
                                        }}
                                    /> */}
                        </div>
                        <div className="item-outVar">
                          {index === 0 ? (
                            <div>
                              <span style={{ fontSize: 14, fontWeight: "700" }}>Biến quy trình (child)</span>
                            </div>
                          ) : null}
                          <div className={"container-select-mapping"}>
                            <div className="select-mapping">
                              <SelectCustom
                                key={item?.mappingType}
                                id="fielName"
                                name="fielName"
                                // label={index === 0 ? "Biến quy trình" : ''}
                                fill={false}
                                required={false}
                                error={item.checkMapping}
                                message="Biến quy trình không được để trống"
                                options={[]}
                                value={item.attributeMapping ? { value: item.attributeMappingId, label: item.attributeMapping } : null}
                                onChange={(e) => {
                                  setListOutVar((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        return { ...obj, attributeMapping: e.label, attributeMappingId: e.value, checkMapping: false };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                                isAsyncPaginate={true}
                                isFormatOptionLabel={false}
                                // placeholder={item.mappingType === 2 ? "Chọn biến" : 'Chọn trường trong form'}
                                placeholder={item.mappingType === 2 ? "Chọn biến" : "Chọn trường trong form"}
                                additional={{
                                  page: 1,
                                }}
                                loadOptionsPaginate={item?.mappingType === 2 ? loadedOptionAttributeChildProcess : loadedOptionFormChildProcess}
                                // formatOptionLabel={formatOptionLabelEmployee}
                                // error={checkFieldEform}
                                // message="Biểu mẫu không được bỏ trống"
                                // disabled={}
                              />
                            </div>
                            <Tippy content={item.mappingType === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
                              <div
                                className={"icon-change-select"}
                                onClick={(e) => {
                                  if (item.mappingType === 1) {
                                    setListOutVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, mappingType: 2 };
                                        }
                                        return obj;
                                      })
                                    );
                                  } else {
                                    setListOutVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, mappingType: 1 };
                                        }
                                        return obj;
                                      })
                                    );
                                  }
                                }}
                              >
                                <Icon name="ResetPassword" style={{ width: 18 }} />
                              </div>
                            </Tippy>
                          </div>
                        </div>
                        <div className="add-attribute" style={index === 0 ? { marginTop: "3.2rem" } : {}}>
                          <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                            <span
                              className="icon-add"
                              onClick={() => {
                                setListOutVar([
                                  ...listOutVar,
                                  {
                                    name: "",
                                    attributeMapping: "",
                                    attributeMappingId: "",
                                    mappingType: 1,
                                    checkName: false,
                                    checkMapping: false,
                                  },
                                ]);
                              }}
                            >
                              <Icon name="PlusCircleFill" />
                            </span>
                          </Tippy>
                        </div>

                        {listOutVar.length > 1 ? (
                          <div className="remove-attribute" style={index === 0 ? { marginTop: "3.2rem" } : {}}>
                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                              <span
                                className="icon-remove"
                                onClick={() => {
                                  const newList = [...listOutVar];
                                  newList.splice(index, 1);
                                  setListOutVar(newList);
                                }}
                              >
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          </div>
                        ) : null}
                      </div>
                    ))
                  : null}
              </div>

              <div className="form-group">
                <SelectCustom
                  key={processIdOfchildProcess}
                  name="startNodeId"
                  value={valueNode}
                  label="Chọn Node bắt đầu"
                  fill={true}
                  required={false}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionNode}
                  placeholder="Chọn Node bắt đầu"
                  onChange={(e) => handleChangeValueNode(e)}
                  error={validateFieldNode}
                  message="Node bắt đầu không được bỏ trống"
                  // disabled={formData?.processId ? false : true}
                />
              </div>

              <div
                className="form-group"
                // style={{width: 'calc(38% - 1.6rem)'}}
              >
                <RadioList
                  options={[
                    {
                      value: 2,
                      label: "Không",
                    },
                    {
                      value: 1,
                      label: "Có",
                    },
                  ]}
                  // className="options-auth"
                  required={true}
                  title="Tạm dừng luồng chính"
                  name="interrupted"
                  value={formData.interrupted}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, interrupted: +value });
                  }}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  // key={listAttribute.length}
                  id=""
                  name="name"
                  label={"Luồng công việc"}
                  fill={true}
                  required={false}
                  // error={item.checkMapping}
                  // message="Biến quy trình không được để trống"
                  options={[]}
                  value={dataWorkflow}
                  onChange={(e) => {
                    setDataWorkflow(e);
                    setFormData({ ...formData, workflowId: e.value });
                  }}
                  isAsyncPaginate={true}
                  placeholder="Chọn luồng công việc"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionWorkflow}
                  // formatOptionLabel={formatOptionLabelAttribute}
                />
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
      <ModalSLA
        onShow={isModalSLA}
        dataNode={dataNode}
        disable={disable}
        onHide={(reload) => {
          if (reload) {
            // loadCampaignApproaches(campaignId);
          }
          setIsModalSLA(false);
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
