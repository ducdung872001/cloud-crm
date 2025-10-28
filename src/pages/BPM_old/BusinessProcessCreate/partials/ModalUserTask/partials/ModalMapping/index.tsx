import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import SelectCustom from "components/selectCustom/selectCustom";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId } from "reborn-util";
import ContractEformService from "services/ContractEformService";
import { showToast } from "utils/common";

import "./index.scss";
import BpmFormArtifactService from "services/BpmFormArtifactService";
import BpmEformMappingService from "services/BpmEformMappingService";
import Tippy from "@tippyjs/react";
import BpmFormMappingService from "services/BpmFormMappingService";
import BusinessProcessService from "services/BusinessProcessService";
import Button from "components/button/button";
import ModalSelectMappingOther from "./partials/ModalSelectMappingOther";

export default function ModalMapping({ onShow, onHide, dataNode, listComponent, processId, codeForm }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);
  const [listComponentForm, setListComponentForm] = useState([]);
  const [isModalClone, setIsModalClone] = useState(false);

  const extractKeysAndPaths = (components) => {
    const result = [];

    components.forEach((component) => {
      if (component.key) {
        result.push({
          value: component.key,
          label: `${component.key} ${
            component.type === "datetime"
              ? component.dateLabel
              : component.label
              ? ` - ${component.type === "datetime" ? component.dateLabel : component.label} `
              : ""
          }`,
        });
      }
      if (component.path) {
        result.push({
          value: component.path,
          label: `${component.path} ${component.label ? ` - ${component.label}` : ""}`,
        });
      }

      // Bỏ qua các thành phần 'components' bên trong
      if (component.components) {
        if (component.type === "group") {
          component.components.map((el) => {
            if (el.type === "group") {
              el.components.map((il) => {
                if (il.type !== "text") {
                  result.push({
                    value: `${component.type}.${el.type}.${il.key}`,
                    label: `${component.type}.${el.type}.${il.key} ${il.label ? ` - ${il.label}` : ""}`,
                  });
                }
              });
            } else {
              if (el.type !== "text") {
                result.push({
                  value: `${component.type}.${el.type === "iframe" ? el.type : el.key}`,
                  label: `${component.type}.${el.type === "iframe" ? el.type : el.key} ${el.label ? ` - ${el.label}` : ""}`,
                });
              }
            }
          });
        } else {
          if (component.type !== "text") {
            result.push({
              value: `${component.type}`,
              label: `${component.type} ${component.label ? ` - ${component.label}` : ""}`,
            });
          }
        }
      }
    });

    return result;
  };

  useEffect(() => {
    if (listComponent && listComponent.length > 0 && onShow) {
      // Gọi hàm để lấy các giá trị
      const result = extractKeysAndPaths(listComponent);

      let newOption = [];
      // const newList = listComponent.filter(el => el.key).map(item => {
      //   return {
      //     value: item.key,
      //     label: item.type === "datetime" ? item.dateLabel : item.label
      //   }
      // });
      listComponent.map((item) => {
        if (item.key) {
          // if(item.type === "checklist" && item.values && item.values.length > 0){
          //   item.values.map(el => {
          //     newOption.push({
          //       value: el.value,
          //       label: el.label
          //     })
          //   })
          // }
          //  else {
          //   newOption.push({
          //     value: item.key,
          //     label: item.type === "datetime" ? item.dateLabel : item.label
          //   })
          // }
          newOption.push({
            value: item.key,
            label: item.type === "datetime" ? item.dateLabel : item.label || item.key,
          });
        } else {
          if (item.type === "dynamiclist" && item.components && item.components.length > 0) {
            item.components.map((el) => {
              newOption.push({
                value: el.key,
                label: el.type === "datetime" ? el.dateLabel : el.label,
              });
            });
          }
        }
      });

      setListComponentForm(result);
    }
  }, [listComponent, onShow]);
  const dataTab = [
    {
      value: "input",
      label: "Khởi tạo form",
    },
    {
      value: "output",
      label: "Chuyển tiếp form",
    },
  ];
  const [tabMapping, setTabMappiing] = useState("input");
  const [idEditMapping, setIdEditMapping] = useState(null);
  const [idxEditMapping, setIdxEditMapping] = useState(0);

  const getListMapping = async (nodeId, tab) => {
    const paramsSource = {
      nodeId: nodeId,
    };

    const paramsTarget = {
      nodeId: nodeId,
    };
    let response = null;

    if (tab === "input") {
      response = await BpmFormMappingService.listSource(paramsSource);
    } else {
      response = await BpmFormMappingService.listTarget(paramsTarget);
    }

    if (response.code === 0) {
      const result = response.result;
      if (result?.length > 0) {
        const newList = [];
        // const newListComponent = [...listComponent];
        const newListComponent = [...listComponentForm];

        result.map((item) => {
          const newFieldCurrent =
            tab === "input"
              ? //trước khi sửa
                // ? newListComponent.find(el => el.key === item.fieldName)
                // // : newListComponent.find(el => el.key === item.fromFieldName) // logic cũ
                // : newListComponent.find(el => el.key === item.fieldName) // logic mới

                //sau khi sửa
                newListComponent.find((el) => el.value === item.fieldName)
              : // : newListComponent.find(el => el.key === item.fromFieldName) // logic cũ
                newListComponent.find((el) => el.value === item.fieldName); // logic mới
          newList.push({
            ...item,
            // fieldLabel: newFieldCurrent?.type === "datetime" ? newFieldCurrent?.dateLabel : newFieldCurrent?.label
            fieldLabel: item?.fieldName,
          });
        });
        setListMapping(newList);
      } else {
        setListMapping([
          {
            id: null,
            nodeId: dataNode?.id,
            fieldName: "",
            fieldLabel: "",
            direct: "IN",
            mappingType: tab === "input" ? 1 : 2,
            fromNodeId: "",
            fromFieldName: "",
          },
        ]);
        setFormData({
          ...values,
          mappingType: tab === "input" ? 1 : 2,
        });
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (tabMapping && dataNode?.id && onShow && listComponentForm) {
      getListMapping(dataNode?.id, tabMapping);
    }
  }, [tabMapping, dataNode, onShow, listComponentForm]);

  const values = useMemo(
    () => ({
      id: null,
      nodeId: dataNode?.id,
      fieldName: "",
      fieldLabel: "",
      direct: tabMapping == "input" ? "IN" : "OUT", //Mặc định là IN, nếu mapping out thì là OUT
      mappingType: 1,
      fromNodeId: "",
      fromFieldName: "",
    }),
    [onShow, data, dataNode, tabMapping]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const [listMapping, setListMapping] = useState([values]);

  //Trường biểu mẫu hiện tại
  // const loadedOptionEformAttributeCurent= async (search, loadedOptions, { page }) => {
  //   const params = {
  //       name: search,
  //       limit: 1000,
  //   };

  //   const response = await ContractEformService.listEformExtraInfo(params);

  //   if (response.code === 0) {
  //     const dataOption = response.result || [];

  //     return {
  //       options: [
  //         ...(dataOption.length > 0
  //           ? dataOption.map((item) => {
  //             return {
  //               value: item.id,
  //               label: item.name,
  //             };
  //           })
  //           : []),
  //       ],
  //       hasMore: response.result.loadMoreAble,
  //       additional: {
  //         page: page + 1,
  //       },
  //     };
  //   }

  //   return { options: [], hasMore: false };
  // };

  // const handleChangeValueAttributeCurrent = (e) => {
  //     setFormData({ ...formData, targetId: e.value, targetFieldName: e.label });
  // }

  // useEffect(() => {
  //     loadedOptionEformAttributeCurent("", undefined, { page: 1 })
  // },[dataEformCurrent?.eformId])

  const handleChangeValueFieldName = (e) => {
    if (tabMapping === "input") {
      setFormData({ ...formData, fieldName: e.value, fieldLabel: e.value });
    }

    if (tabMapping === "output") {
      setFormData({ ...formData, fieldName: e.value, fieldLabel: e.value });
    }
  };

  const handleChangeValueVar = (e) => {
    if (tabMapping === "input") {
      setFormData({ ...formData, fromNodeId: formData.mappingType == 2 ? "" : e.nodeId, fromFieldName: e.value });
    }

    if (tabMapping === "output") {
      setFormData({ ...formData, fromNodeId: "", fromFieldName: e.value }); //Ra luôn là biến
    }
  };

  const onSaveMapping = async (e) => {
    e.preventDefault();

    const body = {
      // id: +data?.id,
      // ...formData
      id: formData.id,
      mappingType: formData.mappingType,
      fromNodeId: formData.fromNodeId,
      fromFieldName: formData.fromFieldName,
      fieldName: formData.fieldName,
      fieldLabel: formData.fieldLabel,
      direct: formData.direct,
      nodeId: formData.nodeId,
    };

    const response = await BpmFormMappingService.update(body);
    if (response.code === 0) {
      showToast(`${body.id ? "Cập nhật" : "Thêm"} trường thành công`, "success");
      getListMapping(dataNode?.id, tabMapping);
      setFormData(values);
      if (formData.id) {
        setIdEditMapping(null);
        setIdxEditMapping(0);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const deleteMapping = async (id: number) => {
    const response = await BpmFormMappingService.delete(id);
    if (response.code === 0) {
      getListMapping(dataNode?.id, tabMapping);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              clearForm(false);
              // !isDifferenceObj(formData, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          // {
          //   title: data ? "Cập nhật" : "Tạo mới",
          //   type: "submit",
          //   color: "primary",
          //   disabled: isSubmit || !isDifferenceObj(formData, values),
          //   is_loading: isSubmit,
          // },
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

  const clearForm = (acc) => {
    onHide(acc);
    setIdEditMapping(null);
    setIdxEditMapping(0);
    setTabMappiing("input");
    setListMapping([values]);
  };

  const loadedOptionAttribute = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
      processId: processId,
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
        // options: [
        //   ...(dataOption.length > 0
        //     ? dataOption.map((item) => {
        //         return {
        //           value: item.nodeId,
        //           label: item.name,
        //         };
        //       })
        //     : []),
        // ],
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
      processId: processId,
    };
    const response = await BusinessProcessService.listBpmForm(params);

    if (response.code === 0) {
      const dataOption = response.result?.filter((el) => el.code && el.code !== codeForm) || [];

      let listForm = [];
      dataOption &&
        dataOption.length > 0 &&
        dataOption.map((item) => {
          // const config = item.config && JSON.parse(item.config) && JSON.parse(item.config).components && JSON.parse(item.config).components.filter(el => el.key) || [];
          // config.map(el => {
          //   listForm.push({
          //     value: `frm_${item.code}.${el.key}`,
          //     label: `frm_${item.code}.${el.key}`,
          //     nodeId: item.nodeId
          //   });
          // })
          const components =
            (item.config && JSON.parse(item.config) && JSON.parse(item.config).components && JSON.parse(item.config).components) || [];
          const result = extractKeysAndPaths(components) || [];
          result?.map((el) => {
            listForm.push({
              value: `frm_${item.code}.${el.value}`,
              label: `frm_${item.code}.${el.label}`,
              nodeId: item.nodeId,
            });
            // return {
            //       value: `frm_${item.code}.${el.value}`,
            //       label: `frm_${item.code}.${el.label}`,
            //       nodeId: item.nodeId
            // }
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-mapping"
      >
        <div className="form-mapping">
          {/* <ModalHeader title={`Dữ liệu vào/ra`} toggle={() => !isSubmit && clearForm(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{"Dữ liệu vào/ra"}</h4>
            </div>
            <div className="container-button">
              <Tippy content="Sao chép dữ liệu vào/ra">
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

              <Button onClick={() => !isSubmit && clearForm(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                <Icon name="Times" />
              </Button>
            </div>
          </div>
          <ModalBody>
            <div className="list-form-group">
              <div style={{ display: "flex", marginBottom: "1.2rem" }}>
                {dataTab &&
                  dataTab.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        borderBottom: tabMapping === item.value ? "1px solid" : "",
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingBottom: 3,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setTabMappiing(item.value);
                        setListMapping([]);
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: "500", color: tabMapping === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
                    </div>
                  ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  className="button-add"
                  onClick={() => {
                    setIdEditMapping(null);
                    setIdxEditMapping(0);
                    if (tabMapping === "input") {
                      setFormData({
                        ...values,
                        mappingType: listMapping.length > 0 ? listMapping[0].mappingType : 1,
                      });
                      setListMapping((oldArray) => [
                        {
                          ...values,
                          mappingType: listMapping.length > 0 ? listMapping[0].mappingType : 1,
                        },
                        ...oldArray,
                      ]);
                    } else {
                      setFormData({
                        ...values,
                        mappingType: 2,
                      });
                      setListMapping((oldArray) => [
                        {
                          ...values,
                          mappingType: 2,
                        },
                        ...oldArray,
                      ]);
                    }
                  }}
                >
                  <div className="action__time--item action__time--add">
                    <Icon name="PlusCircleFill" />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: "500" }}>Thêm trường</span>
                </div>
              </div>

              <div>
                {listMapping && listMapping.length > 0
                  ? listMapping.map((item, index) => (
                      <div key={index} className="container-mapping">
                        <div className="form-group">
                          <SelectCustom
                            id="fieldName"
                            name="fieldName"
                            label=""
                            options={listComponentForm}
                            fill={true}
                            value={
                              tabMapping === "input"
                                ? item.id
                                  ? item.id === idEditMapping
                                    ? formData.fieldName
                                      ? { value: formData.fieldName, label: formData.fieldLabel }
                                      : null
                                    : item.fieldName
                                    ? { value: item.fieldName, label: item.fieldLabel }
                                    : null
                                  : idxEditMapping === index
                                  ? formData.fieldName
                                    ? { value: formData.fieldName, label: formData.fieldLabel }
                                    : null
                                  : item.fieldName
                                  ? { value: item.fieldName, label: item.fieldLabel }
                                  : null
                                : item.id
                                ? item.id === idEditMapping
                                  ? formData.fieldName
                                    ? { value: formData.fieldName, label: formData.fieldLabel }
                                    : null
                                  : item.fieldName
                                  ? { value: item.fieldName, label: item.fieldLabel }
                                  : null
                                : idxEditMapping === index
                                ? formData.fieldName
                                  ? { value: formData.fieldName, label: formData.fieldLabel }
                                  : null
                                : item.fieldName
                                ? { value: item.fieldName, label: item.fieldLabel }
                                : null
                            }
                            special={true}
                            required={true}
                            onChange={(e) => handleChangeValueFieldName(e)}
                            isAsyncPaginate={false}
                            isFormatOptionLabel={false}
                            placeholder="Chọn trường"
                            // additional={{
                            //     page: 1,
                            // }}
                            // loadOptionsPaginate={loadedOptionEformAttribute}
                            // formatOptionLabel={formatOptionLabelEmployee}
                            // error={checkFieldEform}
                            // message="Biểu mẫu không được bỏ trống"
                            disabled={item.id ? (item.id === idEditMapping ? false : true) : idxEditMapping === index ? false : true}
                          />
                        </div>
                        <div className="form-group">
                          <div
                            className={
                              item.id
                                ? item.id === idEditMapping
                                  ? "container-select-mapping"
                                  : "container-select-mapping-disable"
                                : idxEditMapping === index
                                ? "container-select-mapping"
                                : "container-select-mapping-disable"
                            }
                          >
                            <div className="select-mapping">
                              <SelectCustom
                                key={formData?.mappingType}
                                id="fielName"
                                name="fielName"
                                label=""
                                options={[]}
                                fill={false}
                                value={
                                  tabMapping === "input"
                                    ? item.id
                                      ? item.id === idEditMapping
                                        ? formData.fromFieldName
                                          ? { value: formData.fromNodeId, label: formData.fromFieldName }
                                          : null
                                        : item.fromFieldName
                                        ? { value: item.fromNodeId, label: item.fromFieldName }
                                        : null
                                      : idxEditMapping === index
                                      ? formData.fromFieldName
                                        ? { value: formData.fromNodeId, label: formData.fromFieldName }
                                        : null
                                      : item.fromFieldName
                                      ? { value: item.fromNodeId, label: item.fromFieldName }
                                      : null
                                    : //OUT luôn là biến (Không mapping out cho form khác)
                                    item.id
                                    ? item.id === idEditMapping
                                      ? formData.fromFieldName
                                        ? { value: formData.fromFieldName, label: formData.fromFieldName }
                                        : null
                                      : item.fromFieldName
                                      ? { value: item.fromFieldName, label: item.fromFieldName }
                                      : null
                                    : idxEditMapping === index
                                    ? formData.fromFieldName
                                      ? { value: formData.fromFieldName, label: formData.fromFieldName }
                                      : null
                                    : item.fromFieldName
                                    ? { value: item.fromFieldName, label: item.fromFieldName }
                                    : null
                                }
                                special={true}
                                required={true}
                                onChange={(e) => handleChangeValueVar(e)}
                                isAsyncPaginate={true}
                                isFormatOptionLabel={false}
                                // placeholder={item.mappingType === 2 ? "Chọn biến" : 'Chọn trường trong form'}
                                placeholder={
                                  item.id
                                    ? item.id === idEditMapping
                                      ? formData.mappingType === 2
                                        ? "Chọn biến"
                                        : "Chọn trường trong form"
                                      : item.mappingType === 2
                                      ? "Chọn biến"
                                      : "Chọn trường trong form"
                                    : idxEditMapping === index
                                    ? formData.mappingType === 2
                                      ? "Chọn biến"
                                      : "Chọn trường trong form"
                                    : item.mappingType === 2
                                    ? "Chọn biến"
                                    : "Chọn trường trong form"
                                }
                                additional={{
                                  page: 1,
                                }}
                                loadOptionsPaginate={formData?.mappingType === 2 ? loadedOptionAttribute : loadedOptionForm}
                                // formatOptionLabel={formatOptionLabelEmployee}
                                // error={checkFieldEform}
                                // message="Biểu mẫu không được bỏ trống"
                                disabled={item.id ? (item.id === idEditMapping ? false : true) : idxEditMapping === index ? false : true}
                              />
                            </div>

                            {tabMapping === "input" ? (
                              <Tippy
                                // content={item.mappingType === 2 ? 'Chuyển chọn trường trong form' : 'Chuyển chọn biến'}
                                content={formData.mappingType === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}
                              >
                                <div
                                  // className={'icon-change-select'}
                                  className={
                                    item.id
                                      ? item.id === idEditMapping
                                        ? "icon-change-select"
                                        : "d-none"
                                      : idxEditMapping === index
                                      ? "icon-change-select"
                                      : "d-none"
                                  }
                                  onClick={(e) => {
                                    if (item.id) {
                                      if (item.id === idEditMapping) {
                                        if (formData.mappingType === 2) {
                                          setFormData({ ...formData, mappingType: 1 });
                                        } else {
                                          setFormData({ ...formData, mappingType: 2 });
                                        }
                                      }
                                    } else {
                                      if (idxEditMapping === index) {
                                        if (formData.mappingType === 2) {
                                          setFormData({ ...formData, mappingType: 1 });
                                        } else {
                                          setFormData({ ...formData, mappingType: 2 });
                                        }
                                      }
                                    }
                                  }}
                                >
                                  <Icon name="ResetPassword" style={{ width: 18 }} />
                                </div>
                              </Tippy>
                            ) : null}
                          </div>
                        </div>

                        <div className={"action-children"}>
                          <Tippy content={item.id ? (idEditMapping && item.id === idEditMapping ? "Lưu" : "Đã lưu") : "Lưu"}>
                            <div
                              className={
                                item.id ? (idEditMapping && item.id === idEditMapping ? "icon-unchecked" : "icon-checked") : "icon-unchecked"
                              }
                              onClick={(e) => {
                                if (formData.fromFieldName && formData.fieldName) {
                                  onSaveMapping(e);
                                }
                              }}
                            >
                              <Icon name="Checked" style={{ width: 18 }} />
                            </div>
                          </Tippy>

                          <Tippy content="Sửa">
                            <div
                              className="action-children-item action-children-edit"
                              onClick={(e) => {
                                if (idEditMapping && idEditMapping === item.id) {
                                  setIdEditMapping(null);
                                  setIdxEditMapping(0);
                                  setFormData(values);
                                } else {
                                  setIdEditMapping(item.id);
                                  setIdxEditMapping(index);
                                  setFormData({
                                    ...formData,
                                    id: item.id,
                                    mappingType: item.mappingType,
                                    fromNodeId: item.fromNodeId,
                                    fromFieldName: item.fromFieldName,
                                    fieldName: item.fieldName,
                                    fieldLabel: item.fieldLabel,
                                    nodeId: item.nodeId,
                                  });
                                }
                              }}
                            >
                              <Icon name="Pencil" />
                            </div>
                          </Tippy>

                          <Tippy content="Xóa">
                            <div
                              className="action-children-item action-children-delete"
                              onClick={(e) => {
                                if (item.id) {
                                  deleteMapping(item.id);
                                } else {
                                  const newList = [...listMapping];
                                  newList.splice(index, 1);
                                  setListMapping(newList);
                                }
                              }}
                            >
                              <Icon name="Trash" />
                            </div>
                          </Tippy>
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalSelectMappingOther
        onShow={isModalClone}
        dataNode={dataNode}
        // processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            getListMapping(dataNode?.id, tabMapping);
          }
          setIsModalClone(false);
        }}
      />
    </Fragment>
  );
}
