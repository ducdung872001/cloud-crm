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
import ButtonExportNode from "../../components/ButtonExportNode/ButtonExportNode";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";
import CheckboxList from "components/checkbox/checkboxList";

export default function ModalServiceTask({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [data, setData] = useState(null);
  const [dataHeaderHTTP, setDataHeaderHTTP] = useState([{ key: "", value: "" }]);
  const [authenticationData, setAuthenticationData] = useState(null);
  //   console.log('authenticationData', authenticationData);

  const [handleErrorData, setHandleErrorData] = useState(null);
  const [dataWorkflow, setDataWorkflow] = useState(null);
  const [childProcessId, setChildProcessId] = useState(null);
  const [transforms, setTransforms] = useState(null);
  // console.log("transforms", transforms);
  const [valueKey, setValueKey] = useState(null);

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
      if (dataNode?.businessObject?.$parent?.id && dataNode.businessObject?.$parent?.$type === "bpmn:SubProcess") {
        getDetailNode(dataNode?.id);
      }
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

  const getVarSetup = async (name) => {
    const params = {
      name: name,
      page: 1,
      limit: 10,
      processId: processId,
    };
    const response = await BusinessProcessService.listVariableDeclare(params);

    if (response.code === 0) {
      const result = response.result;
    }
  };

  const getDetailTask = async (id) => {
    const response = await BusinessProcessService.detailServiceTask(id);

    if (response.code == 0) {
      const result = response.result;
      const authentication = (result?.authentication && JSON.parse(result.authentication)) || null;
      let authentication_config = authentication?.config ? { ...authentication.config, keyType: authentication?.config?.keyType || 1 } : null;
      setAuthenticationData(authentication_config);
      setValueKey(authentication_config?.token ? { value: authentication_config.token, label: authentication_config.token } : null);

      const errorHandling = (result?.errorHandling && JSON.parse(result.errorHandling)) || null;
      setHandleErrorData(errorHandling?.config || null);

      const arrayInput =
        (result.inputVar &&
          JSON.parse(result.inputVar) &&
          Object.entries(JSON.parse(result.inputVar)).map(([key, value]) => {
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
          mappingType: attributeMapping?.includes("var") ? 2 : attributeMapping?.includes("frm") ? 1 : 0,
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
        (result.outputVar &&
          JSON.parse(result.outputVar) &&
          Object.entries(JSON.parse(result.outputVar)).map(([key, value]) => {
            return { [key]: value };
          })) ||
        [];
      const newListOutputVarData = Array.isArray(arrayOut) && arrayInput.length > 0 ? arrayOut : [];
      const listOutputVarData = newListOutputVarData.map((item) => {
        const name = Object.entries(item)[0][0];
        const attributeMapping: any = Object.entries(item)[0][1];
        // getVarSetup(attributeMapping)
        return {
          name: name,
          attributeMapping: attributeMapping,
          attributeMappingId: attributeMapping,
          mappingType: attributeMapping?.includes("var") ? 2 : attributeMapping?.includes("frm") ? 1 : 0,
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
      const executionMode =
        result?.executionMode && JSON.parse(result.executionMode)
        ? JSON.parse(result.executionMode)
        : { executionType: null, payloadHandling: null };


      const data = {
        ...result,
        authentication: authentication?.type || "Basic",
        errorHandling: errorHandling?.type || "Retry",
        executionType: executionMode.executionType ?? null,
        payloadHandling: executionMode.payloadHandling ?? null,
      };

      const httpHeaders = (result.httpHeaders && JSON.parse(result.httpHeaders)) || null;
      setDataHeaderHTTP(httpHeaders || [{ key: "", value: "" }]);
      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
      setData(data);
      setTransforms(result?.transforms || null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const dataAuthentication = [
    {
      value: "Basic",
      label: "Basic Authentication",
    },
    {
      value: "JWT",
      label: "JWT - JSON Web Token",
    },
    {
      value: "OAuth",
      label: "OAuth 2.0 token",
    },
  ];

  const dataHandleError = [
    {
      value: "Retry",
      label: "Retry",
    },
    {
      value: "Fallback",
      label: "Chuyển sang một luồng thay thế",
    },
  ];

  const values = useMemo(
    () => ({
      id: null,
      payloadHandling: data?.payloadHandling ?? null,
      executionType: data?.executionType ?? null,
      name: data?.name ?? "",
      code: data?.code ?? "",
      description: data?.description ?? "",
      serviceType: data?.serviceType ?? null,
      endpoint: data?.endpoint ?? "",
      method: data?.method ?? null,
      payloadType: data?.payloadType ?? "",
      httpHeaders: "",
      authentication: data?.authentication ?? "Basic",
      inputVar: "",
      outputVar: "",
      errorHandling: data?.errorHandling ?? "",
      timeout: data?.timeout ?? "",
      serviceValidation: data?.serviceValidation ?? 0, //0 - thất bại, 1 - thành công
      executionMode: data?.executionMode ?? null,
      nodeId: dataNode?.id ?? null,
      processId: childProcessId ?? processId ?? null,
      workflowId: data?.workflowId ?? null,
    }),
    [onShow, data, processId, dataNode, childProcessId]
  );

  const [formData, setFormData] = useState(values);
  //   // console.log('formData', formData);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //   useEffect(() => {
  //     if(formData.authentication){
  //         const authentication = formData.authentication;
  //         if(authentication === 'Basic Authentication'){
  //             setAuthenticationData({username: '', password: ''});
  //         }
  //         if(authentication === 'JWT - JSON Web Token'){
  //             setAuthenticationData({token: ''});
  //         }
  //         if(authentication === 'OAuth 2.0 token'){
  //             setAuthenticationData({accessToken: '', refreshToken: ''});
  //         }
  //     }
  // }, [formData.authentication])

  // useEffect(() => {
  //     if(formData.errorHandling){
  //         const errorHandling = formData.errorHandling;
  //         if(errorHandling === 'Retry'){
  //             setHandleErrorData({times: '', loopTime: ''});
  //         }
  //         if(errorHandling === 'Chuyển sang một luồng thay thế'){
  //             setHandleErrorData({nodeId: ''});
  //         }
  //     }
  // }, [formData.errorHandling])

  useEffect(() => {
  if (formData?.payloadHandling === 2) {
    setListInputVar((current) => {
      const existing = current?.find((it) => it.name === "listParam");
      if (existing) return current; 
      const newFirst = {
        name: "listParam",
        attributeMapping: "", 
        attributeMappingId: "",
        mappingType: 1,
        checkName: false,
        checkMapping: false,
      };
      const rest = (current || []).filter((it) => it.name !== "listParam");
      return [newFirst, ...rest];
    });
  } else {
    setListInputVar((current) => (current || []).filter((it) => it.name !== "listParam"));
  }
}, [formData?.payloadHandling]);


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
    const executionMode = JSON.stringify({
      executionType: formData.executionType,
      payloadHandling: formData.payloadHandling,
    });

    const authenticationSubmit = {
      type: formData.authentication,
      config: authenticationData,
    };

    const errorHandlingSubmit = {
      type: formData.errorHandling,
      config: handleErrorData,
    };

    setIsSubmit(true);

    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      code: formData?.code ?? "",
      description: formData?.description ?? "",
      serviceType: formData?.serviceType ?? null,
      endpoint: formData?.endpoint ?? "",
      method: formData?.method ?? null,
      payloadType: formData?.payloadType ?? "",
      httpHeaders: JSON.stringify(dataHeaderHTTP),
      authentication: JSON.stringify(authenticationSubmit),
      inputVar: JSON.stringify(objInput),
      outputVar: JSON.stringify(objOut),
      errorHandling: JSON.stringify(errorHandlingSubmit),
      timeout: formData?.timeout ?? "",
      serviceValidation: formData?.serviceValidation ?? 0, //0 - thất bại, 1 - thành công
      // executionMode: formData?.executionMode ?? null,
      executionMode: JSON.stringify({
        executionType: formData.executionType,
        payloadHandling: formData.payloadHandling,
      }),
      nodeId: dataNode?.id ?? null,
      processId: formData?.processId ?? null,
      workflowId: formData?.workflowId ?? null,
      transforms: transforms,
    };
    console.log("body", body);

    const response = await BusinessProcessService.updateServiceTask(body);

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
    setDataHeaderHTTP([{ key: "", value: "" }]);
    setAuthenticationData(null);
    setHandleErrorData(null);
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
    setTransforms("");
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
          console.log("components", components);

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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-service-task"
      >
        <form className="form-service-task" onSubmit={(e) => onSubmit(e)}>
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
            {/* <div className="container-button">
              {disable ? null : (
                <Tippy content="Sao chép nhiệm vụ khác">
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
              )}
              {disable ? null : (
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
                      <Icon name="VarSetting" />
                    </Button>
                  </div>
                </Tippy>
              )}
              {disable ? null : (
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
              )}
              {disable ? null : (
                <ButtonExportNode
                  nodeId = {dataNode?.id}
                />
              )}
              <Button onClick={() => !isSubmit && handleClear(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                <Icon name="Times" />
              </Button>
            </div> */}
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

              <div className="form-group">
                <SelectCustom
                  id="serviceType"
                  name="serviceType"
                  label="Loại dịch vụ"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: "SOAP Web Service",
                      label: "SOAP Web Service",
                    },
                    {
                      value: "REST API",
                      label: "REST API",
                    },
                    {
                      value: "Java Delegate",
                      label: "Java Delegate",
                    },
                  ]}
                  value={formData.serviceType ? { value: formData.serviceType, label: formData.serviceType } : null}
                  onChange={(e) => {
                    setFormData({ ...formData, serviceType: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn loại dịch vụ"
                  // additional={{
                  //     page: 1,
                  // }}
                  // loadOptionsPaginate={loadOptionSaleflow}
                  // formatOptionLabel={formatOptionLabelCustomer}
                  // disabled={checkParamsUrl}
                />
              </div>

              <div className="form-group">
                <Input
                  id="endpoint"
                  name="endpoint"
                  label="Đường dẫn dịch vụ"
                  fill={true}
                  required={true}
                  placeholder={"Đường dẫn dịch vụ"}
                  value={formData.endpoint}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, endpoint: value });
                  }}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="method"
                  name="method"
                  label="Phương thức HTTP"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: "GET",
                      label: "GET",
                    },
                    {
                      value: "POST",
                      label: "POST",
                    },
                    {
                      value: "PUT",
                      label: "PUT",
                    },
                    {
                      value: "DELETE",
                      label: "DELETE",
                    },
                  ]}
                  value={formData.method ? { value: formData.method, label: formData.method } : null}
                  onChange={(e) => {
                    setFormData({ ...formData, method: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn phương thức HTTP"
                  // additional={{
                  //     page: 1,
                  // }}
                  // loadOptionsPaginate={loadOptionSaleflow}
                  // formatOptionLabel={formatOptionLabelCustomer}
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="executionType"
                  name="executionType"
                  label="Chế độ thực thi"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: 0,
                      label: "Đồng bộ",
                    },
                    {
                      value: 1,
                      label: "Bất đồng bộ",
                    },
                  ]}
                  value={
                    formData.executionType !== null
                  ? {
                    value: formData.executionType,
                    label: formData.executionType === 0 ? "Đồng bộ" : "Bất đồng bộ"
                     }
                  : null
                  }
                  onChange={(e) => {
                    setFormData({ ...formData, executionType: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn chế độ thực thi"
                />
              </div>

              <div className="container-auth">
                <RadioList
                  options={dataAuthentication}
                  // className="options-auth"
                  required={true}
                  title="Thông tin chứng thực"
                  name="authentication"
                  value={formData.authentication}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, authentication: value });
                    if (value === "Basic") {
                      setAuthenticationData({ username: "", password: "" });
                    }
                    if (value === "JWT") {
                      setAuthenticationData({ token: "", keyType: 1 });
                    }
                    if (value === "OAuth") {
                      setAuthenticationData({ accessToken: "", refreshToken: "" });
                    }
                  }}
                />

                {formData.authentication === "Basic" ? (
                  <div className="box-auth">
                    <div className="item-username">
                      <Input
                        id="username"
                        name="username"
                        label="Username"
                        fill={true}
                        required={true}
                        placeholder={"Username"}
                        value={authenticationData?.username}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAuthenticationData({ ...authenticationData, username: value });
                        }}
                      />
                    </div>
                    <div className="item-password">
                      <Input
                        id="password"
                        name="password"
                        label="Password"
                        fill={true}
                        required={true}
                        placeholder={"Password"}
                        value={authenticationData?.password}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAuthenticationData({ ...authenticationData, password: value });
                        }}
                      />
                    </div>
                  </div>
                ) : null}

                {formData.authentication === "JWT" ? (
                  <div className="form-group-jwt">
                    <div className="input-key">
                      <label>
                        Token <span>*</span>
                      </label>
                      <div className={"container-select-mapping"}>
                        {authenticationData.keyType == 1 ? (
                          <div className="input-text">
                            <Input
                              id="token"
                              name="token"
                              label=""
                              fill={false}
                              required={true}
                              placeholder={"Token"}
                              value={authenticationData?.token}
                              onChange={(e) => {
                                const value = e.target.value;
                                setAuthenticationData({ ...authenticationData, token: value });
                              }}
                            />
                          </div>
                        ) : (
                          <div className="select-mapping">
                            <SelectCustom
                              key={"key_" + authenticationData.keyType}
                              id="key"
                              className="select"
                              fill={false}
                              required={false}
                              options={[]}
                              value={valueKey}
                              isAsyncPaginate={true}
                              isFormatOptionLabel={false}
                              placeholder={authenticationData.keyType === 2 ? "Chọn biến" : "Chọn trường trong form"}
                              additional={{
                                page: 1,
                              }}
                              loadOptionsPaginate={authenticationData.keyType === 2 ? loadedOptionAttribute : loadedOptionForm}
                              onChange={(e) => {
                                setValueKey(e);
                                setAuthenticationData({ ...authenticationData, token: e.label });
                              }}
                            />
                          </div>
                        )}

                        <Tippy
                          content={
                            authenticationData.keyType === 0
                              ? "Chuyển nhập giá trị"
                              : authenticationData.keyType === 1
                              ? "Chuyển chọn biến"
                              : "Chuyển chọn trường trong form"
                          }
                        >
                          <div
                            className={"icon-change-select"}
                            onClick={(e) => {
                              setValueKey(null);
                              setAuthenticationData({
                                token: "",
                                keyType: authenticationData.keyType === 0 ? 1 : authenticationData.keyType === 1 ? 2 : 0,
                              });
                            }}
                          >
                            <Icon name="ResetPassword" style={{ width: 18 }} />
                          </div>
                        </Tippy>
                      </div>
                    </div>
                  </div>
                ) : null}

                {formData.authentication === "OAuth" ? (
                  <div className="box-auth">
                    <div className="item-username">
                      <Input
                        id="accessToken"
                        name="accessToken"
                        label="Access Token"
                        fill={true}
                        required={true}
                        placeholder={"Access Token"}
                        value={authenticationData?.accessToken}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAuthenticationData({ ...authenticationData, accessToken: value });
                        }}
                      />
                    </div>
                    <div className="item-password">
                      <Input
                        id="refreshToken"
                        name="refreshToken"
                        label="Refresh Token"
                        fill={true}
                        required={true}
                        placeholder={"Refresh Token"}
                        value={authenticationData?.refreshToken}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAuthenticationData({ ...authenticationData, refreshToken: value });
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="form-group">
                <SelectCustom
                  id="payloadHandling"
                  name="payloadHandling"
                  label="Dạng xử lý dữ liệu"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: 0,
                      label: "Xử lý thông thường",
                    },
                    {
                      value: 1,
                      label: "Xử lý cả lô param",
                    },
                    {
                      value: 2,
                      label: "Xử lý từng phần tử trong lô param ",
                    },
                  ]}
                  value={
                    formData.payloadHandling !== null
                    ? {
                    value: formData.payloadHandling,
                    label:
                    formData.payloadHandling === 0
                    ? "Xử lý thông thường"
                    : formData.payloadHandling === 1
                    ? "Xử lý cả lô param"
                    : "Xử lý từng phần tử trong lô param"
                     } 
                    : null
                  }
                  onChange={(e) => {
                    setFormData({ ...formData, payloadHandling: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn dạng xử lý dữ liệu"
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
                          <Input
                            id="nameInput"
                            name="nameInput"
                            label={index === 0 ? "Tên tham số đầu vào" : ""}
                            fill={true}
                            required={item.name === "listParam"}
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
                          />
                        </div>
                        <div className="item-inputVar">
                          {index === 0 ? (
                            <div>
                              <span style={{ fontSize: 14, fontWeight: "700" }}>Biến quy trình</span>
                            </div>
                          ) : null}
                          <div className={"container-select-mapping"}>
                            {!item.mappingType ? (
                              <div className="input-text">
                                <Input
                                  name={item.attributeMapping}
                                  fill={false}
                                  value={item.attributeMapping}
                                  // disabled={disableFieldCommom}
                                  onChange={(e) => {
                                    setListInputVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return {
                                            ...obj,
                                            attributeMapping: e.target.value,
                                            attributeMappingId: e.target.value,
                                            checkMapping: false,
                                          };
                                        }
                                        return obj;
                                      })
                                    );
                                  }}
                                  placeholder={`Nhập giá trị`}
                                />
                              </div>
                            ) : (
                              <div className="select-mapping">
                                <SelectCustom
                                  key={item?.mappingType}
                                  id="fieldName"
                                  name="fieldName"
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
                            )}

                            <Tippy
                              content={
                                item.mappingType === 0
                                  ? "Chuyển chọn trường trong form"
                                  : item.mappingType === 1
                                  ? "Chuyển chọn biến"
                                  : "Chuyển nhập giá trị"
                              }
                            >
                              <div
                                className={"icon-change-select"}
                                onClick={(e) => {
                                  setListInputVar((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        return {
                                          ...obj,
                                          mappingType: item.mappingType === 0 ? 1 : item.mappingType === 1 ? 2 : 0,
                                          attributeMapping: "",
                                          attributeMappingId: "",
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
                                    mappingType: listInputVar.length > 0 ? listInputVar[listInputVar.length - 1].mappingType : 1,
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

                        {listInputVar.length > 1 && item.name !== "listParam" ? (
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

              <div style={{ width: "100%" }}>
                <TextArea
                  id="transforms"
                  name="transforms"
                  label="Biến đổi tham số đầu vào (JsonPath)"
                  required={false}
                  fill={true}
                  value={transforms}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTransforms(value || null);
                  }}
                  // onBlur={(e) => handBlurContent(e)}
                  placeholder="Nhập quy tắc biến đổi"
                  // error={validateContent}
                  // message="Nội dung đánh giá không được để trống"
                />
              </div>

              <div className="container-outVar">
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Biến đầu ra</span>
                </div>
                {listOutVar && listOutVar.length > 0
                  ? listOutVar.map((item, index) => (
                      <div key={index} className="list-item-outVar">
                        <div className="item-outVar">
                          <Input
                            id="name"
                            name="name"
                            label={index === 0 ? "Tên tham số đầu ra" : ""}
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
                          />
                        </div>
                        <div className="item-outVar">
                          {index === 0 ? (
                            <div>
                              <span style={{ fontSize: 14, fontWeight: "700" }}>Biến quy trình</span>
                            </div>
                          ) : null}
                          <div className={"container-select-mapping"}>
                            {!item.mappingType ? (
                              <div className="input-text">
                                <Input
                                  name={item.attributeMapping}
                                  fill={false}
                                  value={item.attributeMapping}
                                  // disabled={disableFieldCommom}
                                  onChange={(e) => {
                                    setListOutVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return {
                                            ...obj,
                                            attributeMapping: e.target.value,
                                            attributeMappingId: e.target.value,
                                            checkMapping: false,
                                          };
                                        }
                                        return obj;
                                      })
                                    );
                                  }}
                                  placeholder={`Nhập giá trị`}
                                />
                              </div>
                            ) : (
                              <div className="select-mapping">
                                <SelectCustom
                                  key={item?.mappingType}
                                  id="fieldName"
                                  name="fieldName"
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
                                  loadOptionsPaginate={item?.mappingType === 2 ? loadedOptionAttribute : loadedOptionForm}
                                  // formatOptionLabel={formatOptionLabelEmployee}
                                  // error={checkFieldEform}
                                  // message="Biểu mẫu không được bỏ trống"
                                  // disabled={}
                                />
                              </div>
                            )}
                            <Tippy
                              // content={item.mappingType === 2 ? 'Chuyển chọn trường trong form' : 'Chuyển chọn biến'}
                              content={
                                item.mappingType === 0
                                  ? "Chuyển chọn trường trong form"
                                  : item.mappingType === 1
                                  ? "Chuyển chọn biến"
                                  : "Chuyển nhập giá trị"
                              }
                            >
                              <div
                                className={"icon-change-select"}
                                onClick={(e) => {
                                  setListOutVar((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        return {
                                          ...obj,
                                          mappingType: item.mappingType === 0 ? 1 : item.mappingType === 1 ? 2 : 0,
                                          attributeMapping: "",
                                          attributeMappingId: "",
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
                                    mappingType: listOutVar.length > 0 ? listOutVar[listOutVar.length - 1].mappingType : 1,
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

              <div className="container-handleError">
                {/* <RadioList
                  options={dataHandleError}
                  // className="options-auth"
                  required={true}
                  title="Xử lý lỗi"
                  name="errorHandling"
                  value={formData.errorHandling}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, errorHandling: value });
                  }}
                /> */}

                <CheckboxList
                  title="Xử lý lỗi"
                  options={dataHandleError}
                  value={formData.errorHandling}
                  onChange={(e) => {
                    console.log("e", e);
                    setFormData({ ...formData, errorHandling: e });
                    // if(e){
                    //   setListNotifyType(e);
                    // } else {
                    //   setListNotifyType(listNofifyType);
                    // }
                    if (e.split(",").includes("Retry") && e.split(",").includes("Fallback")) {
                      if (handleErrorData?.retry) {
                        setHandleErrorData({
                          ...handleErrorData,
                          fallback: { nodeId: "", workflowId: "" },
                        });
                      }

                      if (handleErrorData?.fallback) {
                        setHandleErrorData({
                          ...handleErrorData,
                          retry: { times: "", loopTime: "" },
                        });
                      }
                    } else if (e.split(",").includes("Retry")) {
                      if (handleErrorData?.retry) {
                        setHandleErrorData({ retry: { ...handleErrorData.retry } });
                      } else {
                        setHandleErrorData({ retry: { times: "", loopTime: "" } });
                      }
                    } else if (e.split(",").includes("Fallback")) {
                      // setHandleErrorData({fallback: {nodeId: "", workflowId: "" }});
                      if (handleErrorData?.fallback) {
                        setHandleErrorData({ fallback: { ...handleErrorData.fallback } });
                      } else {
                        setHandleErrorData({ fallback: { nodeId: "", workflowId: "" } });
                      }
                    }
                  }}
                />

                {formData.errorHandling.split(",").includes("Retry") ? (
                  <div className="box-handleError">
                    <div className="item-times">
                      <NummericInput
                        // id="username"
                        // name="username"
                        label="Số lần"
                        fill={true}
                        required={true}
                        placeholder={"Số lần"}
                        value={handleErrorData?.retry?.times}
                        onValueChange={(e) => {
                          const value = e.floatValue || "";
                          setHandleErrorData({ ...handleErrorData, retry: { ...handleErrorData?.retry, times: value } });
                        }}
                      />
                    </div>
                    <div className="item-times">
                      <NummericInput
                        // id="username"
                        // name="username"
                        label="Thời gian lặp lại (giây)"
                        fill={true}
                        required={true}
                        placeholder={"Thời gian lặp lại (giây)"}
                        value={handleErrorData?.retry?.loopTime}
                        onValueChange={(e) => {
                          const value = e.floatValue || "";
                          setHandleErrorData({ ...handleErrorData, retry: { ...handleErrorData?.retry, loopTime: value } });
                        }}
                      />
                    </div>
                  </div>
                ) : null}
                {formData.errorHandling.split(",").includes("Fallback") ? (
                  <div className="box-handleError">
                    <div className="item-next-node">
                      <SelectCustom
                        id="nodeId"
                        name="nodeId"
                        label="Chọn luồng thay thế"
                        fill={true}
                        required={true}
                        options={[]}
                        value={
                          handleErrorData?.fallback?.nodeId
                            ? { value: handleErrorData?.fallback?.nodeId, label: handleErrorData?.fallback?.nodeName }
                            : null
                        }
                        onChange={(e) => {
                          setHandleErrorData({ ...handleErrorData, fallback: { ...handleErrorData?.fallback, nodeId: e.value, nodeName: e.label } });
                          // setHandleErrorData({ ...handleErrorData, nodeId: e.value, nodeName: e.label });
                        }}
                        isAsyncPaginate={false}
                        isFormatOptionLabel={false}
                        placeholder="Chọn luồng thay thế"
                        // additional={{
                        //     page: 1,
                        // }}
                        // loadOptionsPaginate={loadOptionSaleflow}
                        // formatOptionLabel={formatOptionLabelCustomer}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="form-group-HTTP">
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Tiêu đề HTTP</span>
                </div>
                {dataHeaderHTTP && dataHeaderHTTP.length > 0
                  ? dataHeaderHTTP.map((item, index) => (
                      <div key={index} className="list-HTTP">
                        <div className="form-group">
                          <Input
                            id="key"
                            name="key"
                            // label="Loại truyền tải"
                            fill={true}
                            required={false}
                            placeholder={"key"}
                            value={item.key}
                            onChange={(e) => {
                              const value = e.target.value;
                              setDataHeaderHTTP((current) =>
                                current.map((obj, idx) => {
                                  if (index === idx) {
                                    return { ...obj, key: value };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>

                        <div className="form-group">
                          <Input
                            id="value"
                            name="value"
                            // label="Loại truyền tải"
                            fill={true}
                            required={false}
                            placeholder={"value"}
                            value={item.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              setDataHeaderHTTP((current) =>
                                current.map((obj, idx) => {
                                  if (index === idx) {
                                    return { ...obj, value: value };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>
                        <div className="button">
                          <span className="add-button" style={dataHeaderHTTP.length > 1 ? {} : { marginRight: 5 }}>
                            <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                              <span
                                className="icon-add"
                                onClick={() => {
                                  setDataHeaderHTTP([...dataHeaderHTTP, { key: "", value: "" }]);
                                }}
                              >
                                <Icon name="PlusCircleFill" />
                              </span>
                            </Tippy>
                          </span>

                          {dataHeaderHTTP.length > 1 ? (
                            <span className="remove-button">
                              <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                <span
                                  className="icon-remove"
                                  onClick={() => {
                                    const data = [...dataHeaderHTTP];
                                    data.splice(index, 1);
                                    setDataHeaderHTTP(data);
                                  }}
                                >
                                  <Icon name="Trash" />
                                </span>
                              </Tippy>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))
                  : null}
              </div>

              <div
                className="form-group"
                // style={{width: 'calc(38% - 1.6rem)'}}
              >
                <NummericInput
                  id="timeout"
                  name="timeout"
                  label="Thời gian chờ (giây)"
                  fill={true}
                  required={true}
                  placeholder={"Thời gian chờ (giây)"}
                  value={formData.timeout}
                  onValueChange={(e) => {
                    const value = e.floatValue || "";
                    setFormData({ ...formData, timeout: value });
                  }}
                />
              </div>

              <div
                className="form-group"
                // style={{width: 'calc(38% - 1.6rem)'}}
              >
                <SelectCustom
                  id="payloadType"
                  name="payloadType"
                  label="Loại truyền tải"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: "JSON",
                      label: "JSON",
                    },
                    {
                      value: "XML",
                      label: "XML",
                    },
                    {
                      value: "Plain Text",
                      label: "Plain Text",
                    },
                  ]}
                  value={formData.payloadType ? { value: formData.payloadType, label: formData.payloadType } : null}
                  onChange={(e) => {
                    setFormData({ ...formData, payloadType: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn loại truyền tải"
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

              <div
                className="button-check"
                onClick={() => {
                  setFormData({ ...formData, serviceValidation: 1 });
                }}
              >
                <div className="icon-check">
                  <Icon
                    name={formData?.serviceValidation === 0 ? "Test" : "Checked"}
                    style={{ width: 20, height: 20, fill: "var(--primary-color)" }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Kiểm tra xác nhận</span>
                </div>
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
