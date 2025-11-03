import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import SelectCustom from "components/selectCustom/selectCustom";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId } from "reborn-util";
import ContractEformService from "services/ContractEformService";
import { showToast } from "utils/common";

import "./ModalMapping.scss";
import BpmFormArtifactService from "services/BpmFormArtifactService";
import BpmEformMappingService from "services/BpmEformMappingService";
import Tippy from "@tippyjs/react";

export default function ModalMapping({ onShow, onHide, dataComponent, dataNode }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [data, setData] = useState(null);
  const [dataEformCurrent, setDataEformCurrent] = useState(null);

  const getDetailForm = async (id: number) => {
    const response = await BpmFormArtifactService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataEformCurrent(result);
      setBfatId(result.id);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (onShow && dataComponent?.i) {
      getDetailForm(dataComponent?.i);
    }
  }, [onShow, dataComponent]);

  //lấy danh sách eform của các node đã nối đến
  const [eformList, setEformList] = useState([]);
  const [tabEform, setTabEform] = useState(null);
  const [bfatId, setBfatId] = useState(null);
  const [idEditMapping, setIdEditMapping] = useState(null);
  const [idxEditMapping, setIdxEditMapping] = useState(null);

  const getListEform = async (dataNode) => {
    const params = {
      processId: dataNode.processId,
      // nodeId: dataNode.id
      nodeId: 0,
    };
    const response = await BpmEformMappingService.listEform(params);

    if (response.code === 0) {
      const result = response.result;
      setEformList(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (onShow && dataNode) {
      getListEform(dataNode);
    }
  }, [onShow, dataNode]);

  const [listEformMappingSource, setListEformMappingSource] = useState([]);
  console.log("listEformMappingSource", listEformMappingSource);

  const getListEformMappingSource = async (bfatId, tabEform) => {
    const params = {
      bfatId: bfatId,
      sourceEformId: tabEform,
    };
    const response = await BpmEformMappingService.listSource(params);

    if (response.code === 0) {
      const result = response.result;
      setListEformMappingSource(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (tabEform && bfatId) {
      getListEformMappingSource(bfatId, tabEform);
    }
  }, [tabEform, bfatId]);

  useEffect(() => {
    if (eformList && eformList.length > 0 && !tabEform) {
      setTabEform(eformList[0].id);
      setFormData({ ...formData, sourceEformId: eformList[0].id, sourceBfatId: eformList[0].bfatId });
    }
  }, [eformList]);

  const values = useMemo(
    () => ({
      id: null,
      sourceEformId: data?.sourceEformId ?? null,
      sourceId: null,
      sourceFieldName: null,
      sourceBfatId: data?.sourceBfatId ?? null,

      targetEformId: dataEformCurrent?.eformId ?? null,
      targetId: null,
      targetFieldName: null,
      bfatId: dataEformCurrent?.id ?? null,
    }),
    [onShow, data, dataEformCurrent]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //Trường biểu mẫu hiện tại
  const loadedOptionEformAttributeCurent = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      limit: 1000,
      eformId: dataEformCurrent?.eformId,
    };

    const response = await ContractEformService.listEformExtraInfo(params);

    if (response.code === 0) {
      const dataOption = response.result || [];

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
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

  const handleChangeValueAttributeCurrent = (e) => {
    setFormData({ ...formData, targetId: e.value, targetFieldName: e.label });
  };

  useEffect(() => {
    loadedOptionEformAttributeCurent("", undefined, { page: 1 });
  }, [dataEformCurrent?.eformId]);

  //Trường biểu mẫu của node trước đó
  const loadedOptionEformAttribute = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      limit: 1000,
      eformId: formData.sourceEformId,
    };

    const response = await ContractEformService.listEformExtraInfo(params);

    if (response.code === 0) {
      const dataOption = response.result || [];

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
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

  const handleChangeValueAttribute = (e, item) => {
    setFormData({ ...formData, sourceId: e.value, sourceFieldName: e.label });
  };

  useEffect(() => {
    loadedOptionEformAttribute("", undefined, { page: 1 });
  }, [formData.sourceEformId]);

  const onSaveMapping = async (e) => {
    e.preventDefault();

    const body = {
      // id: +data?.id,
      ...formData,
    };

    const response = await BpmEformMappingService.update(body);
    if (response.code === 0) {
      showToast(`${body.id ? "Cập nhật" : "Thêm"} trường thành công`, "success");
      getListEformMappingSource(bfatId, tabEform);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const deleteMapping = async (id: number) => {
    const response = await BpmEformMappingService.delete(id);
    if (response.code === 0) {
      getListEformMappingSource(bfatId, tabEform);
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
    setDataEformCurrent(null);
    setBfatId(null);
    setIdEditMapping(null);
    setIdxEditMapping(null);
    setEformList([]);
    setTabEform(null);
    setListEformMappingSource([]);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="lg"
        toggle={() => !isSubmit && clearForm(false)}
        className="modal-mapping"
      >
        <div className="form-mapping">
          <ModalHeader title={`Cài đặt`} toggle={() => !isSubmit && clearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div style={{ display: "flex", marginBottom: "1.2rem" }}>
                {eformList &&
                  eformList.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        borderBottom: tabEform === item.id ? "1px solid" : "",
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingBottom: 3,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setTabEform(item.id);
                        setFormData({ ...formData, sourceEformId: item.id, sourceBfatId: item.bfatId });
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: "500", color: tabEform === item.id ? "" : "#d3d5d7" }}>{item.name}</span>
                    </div>
                  ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  className="button-add"
                  onClick={() => {
                    setIdEditMapping(null);
                    // setIdxEditMapping(listEformMappingSource.length);
                    setIdxEditMapping(0);
                    setFormData({ ...formData, id: null, targetId: null, targetFieldName: null, sourceId: null, sourceFieldName: null });
                    setListEformMappingSource((oldArray) => [
                      {
                        ...formData,
                        id: null,
                        targetId: null,
                        targetFieldName: null,
                        sourceId: null,
                        sourceFieldName: null,
                      },
                      ...oldArray,
                    ]);
                  }}
                >
                  <div className="action__time--item action__time--add">
                    <Icon name="PlusCircleFill" />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: "500" }}>Thêm trường</span>
                </div>
              </div>

              <div>
                {listEformMappingSource && listEformMappingSource.length > 0
                  ? listEformMappingSource.map((item, index) => (
                      <div key={index} className="container-mapping">
                        <div className="form-group">
                          <SelectCustom
                            key={formData.sourceEformId}
                            id="fieldName"
                            name="fieldName"
                            label=""
                            options={[]}
                            fill={true}
                            value={
                              item.id
                                ? item.id === idEditMapping
                                  ? formData.sourceId
                                    ? { value: formData.sourceId, label: formData.sourceFieldName }
                                    : null
                                  : item.sourceId
                                  ? { value: item.sourceId, label: item.sourceFieldName }
                                  : null
                                : idxEditMapping === index
                                ? formData.sourceId
                                  ? { value: formData.sourceId, label: formData.sourceFieldName }
                                  : null
                                : item.sourceId
                                ? { value: item.sourceId, label: item.sourceFieldName }
                                : null
                            }
                            special={true}
                            required={true}
                            onChange={(e) => handleChangeValueAttribute(e, item)}
                            isAsyncPaginate={true}
                            isFormatOptionLabel={false}
                            placeholder="Chọn trường nguồn"
                            additional={{
                              page: 1,
                            }}
                            loadOptionsPaginate={loadedOptionEformAttribute}
                            // formatOptionLabel={formatOptionLabelEmployee}
                            // error={checkFieldEform}
                            // message="Biểu mẫu không được bỏ trống"
                            disabled={item.id ? (item.id === idEditMapping ? false : true) : idxEditMapping === index ? false : true}
                          />
                        </div>
                        <div className="form-group">
                          <SelectCustom
                            key={formData.sourceEformId}
                            id="fielName"
                            name="fielName"
                            label=""
                            options={[]}
                            fill={true}
                            value={
                              item.id
                                ? item.id === idEditMapping
                                  ? formData.targetId
                                    ? { value: formData.targetId, label: formData.targetFieldName }
                                    : null
                                  : item.targetId
                                  ? { value: item.targetId, label: item.targetFieldName }
                                  : null
                                : idxEditMapping === index
                                ? formData.targetId
                                  ? { value: formData.targetId, label: formData.targetFieldName }
                                  : null
                                : item.targetId
                                ? { value: item.targetId, label: item.targetFieldName }
                                : null
                            }
                            special={true}
                            required={true}
                            onChange={(e) => handleChangeValueAttributeCurrent(e)}
                            isAsyncPaginate={true}
                            isFormatOptionLabel={false}
                            placeholder="Chọn trường đích"
                            additional={{
                              page: 1,
                            }}
                            loadOptionsPaginate={loadedOptionEformAttributeCurent}
                            // formatOptionLabel={formatOptionLabelEmployee}
                            // error={checkFieldEform}
                            // message="Biểu mẫu không được bỏ trống"
                            disabled={item.id ? (item.id === idEditMapping ? false : true) : idxEditMapping === index ? false : true}
                          />
                        </div>

                        <div className={"action-children"}>
                          <Tippy content={item.id ? (idEditMapping && item.id === idEditMapping ? "Lưu" : "Đã lưu") : "Lưu"}>
                            <div
                              className={
                                item.id ? (idEditMapping && item.id === idEditMapping ? "icon-unchecked" : "icon-checked") : "icon-unchecked"
                              }
                              onClick={(e) => {
                                if (formData.sourceId && formData.targetId) {
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
                                  setIdxEditMapping(null);
                                  setFormData({
                                    ...formData,
                                    id: null,
                                    targetId: null,
                                    targetFieldName: null,
                                    sourceId: null,
                                    sourceFieldName: null,
                                  });
                                } else {
                                  setIdEditMapping(item.id);
                                  setIdxEditMapping(index);
                                  setFormData({
                                    ...formData,
                                    id: item.id,
                                    targetId: item.targetId,
                                    targetFieldName: item.targetFieldName,
                                    sourceId: item.sourceId,
                                    sourceFieldName: item.sourceFieldName,
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
                                  const newList = [...listEformMappingSource];
                                  newList.splice(index, 1);
                                  setListEformMappingSource(newList);
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
    </Fragment>
  );
}
