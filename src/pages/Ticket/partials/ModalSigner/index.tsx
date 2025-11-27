import React, { Fragment, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import TextArea from "components/textarea/textarea";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import ApprovalService from "services/ApprovalService";
import { showToast } from "utils/common";

import "./index.scss";
import BusinessProcessService from "services/BusinessProcessService";
import ProcessedObjectService from "services/ProcessedObjectService";
import Input from "components/input/input";
import Icon from "components/icon";

interface IAddSignerFSAndQuoteProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data?: any;
}

export default function ModalSigner(props: IAddSignerFSAndQuoteProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [listDataVar, setListDataVar] = useState([
    {
      var: '',
      value: ''
    }
  ])

  useEffect(() => {
    if(onShow && data && data?.processId){
      setValueProcess({value: data?.processId, label: data?.processName})
    }
  }, [onShow, data])

  const values = useMemo(
    () => ({
        // id: data?.id ?? null,
        processId: data?.processId ?? null,
        potId: data?.id ?? null,
        startNodeId: data?.startNodeId ??null,
        type: 2 
    }),
    [onShow, data]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const [validateFieldProcess, setValidateFieldProcess] = useState<boolean>(false);
  const [valueProcess, setValueProcess] = useState(null);

  const loadedOptionProcess = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      status: 1,
      limit: 10,
      potId: data?.id,
      opType: 'EX' // lấy về ds quy trình mà đối tượng chưa trình, IN - quy trình đối tượng đã trình
    };

    const response = await BusinessProcessService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

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

  const handleChangeValueProcess = (e) => {
    setValueProcess(e);
    setFormData({ ...formData, processId: e.value });
    setValidateFieldProcess(false);
  };


  const [validateFieldNode, setValidateFieldNode] = useState<boolean>(false);
  const [valueNode, setValueNode] = useState(null);

  const loadedOptionNode = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      status: 1,
      limit: 10,
      processId: valueProcess?.value
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
  }, [valueProcess?.value]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setFormData(values);
    setValueProcess(null);
    setValidateFieldProcess(false);
    setValueNode(null);
    setValidateFieldNode(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.processId) {
      setValidateFieldProcess(true);
      return;
    }

    // if (!formData.startNodeId) {
    //   setValidateFieldNode(true);
    //   return;
    // }

    setIsSubmit(true);

    const body = {
      ...formData,
    };

    const response = await ProcessedObjectService.updateProcessInstance(body);

    if (response.code === 0) {
      showToast("Trình xử lý thành công", "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
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
              handleClearForm(false);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || _.isEqual(formData, values) || validateFieldProcess,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, validateFieldProcess, formData, values, validateFieldNode]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-signer"
        size="lg"
      >
        <form className="form-add-signer" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Trình xử lý`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  name="processId"
                  value={valueProcess}
                  label="Chọn quy trình xử lý"
                  fill={true}
                  required={true}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionProcess}
                  placeholder="Chọn quy trình xử lý"
                  onChange={(e) => handleChangeValueProcess(e)}
                  error={validateFieldProcess}
                  message="Quy trình xử lý không được bỏ trống"
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  key={valueProcess?.value}
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
                  disabled={formData?.processId ? false : true}
                />
              </div>
              

              {/* <div className="container-list-var">
                <div>
                  <span style={{fontSize: 14, fontWeight: '500'}}>Điều kiện</span>
                </div>
                {listDataVar && listDataVar.length > 0 ? 
                  listDataVar.map((item, index) => (
                    <div key={index} className="box-var">
                      <div className="form-group-var">
                        <SelectCustom
                          name=""
                          value={item.var}
                          label=""
                          fill={true}
                          required={false}
                          options={[]}
                          isAsyncPaginate={true}
                          additional={{
                            page: 1,
                          }}
                          loadOptionsPaginate={loadedOptionProcess}
                          placeholder="Chọn biến quy trình"
                          onChange={(e) => handleChangeValueProcess(e)}
                          // error={validateFieldProcess}
                          // message="Quy trình xử lý không được bỏ trống"
                        />
                      </div>

                      <div className="form-group-var">
                        <Input
                          name=""
                          value={item?.value}
                          label=""
                          fill={true}
                          required={false}
                          onChange={(e) => {
                              const value = e.target.value;
                              // setDataTriggerConditions({quantity: value});
                          }}
                          placeholder="Nhập giá trị"
                        />
                      </div>

                      <div 
                        className="button-add"
                        onClick={() => {
                          setListDataVar([...listDataVar, {var: '', value: ''}]);
                        }}
                      >
                        <Icon name="PlusCircleFill" />
                      </div>

                      {listDataVar.length > 1 ? 
                        <div 
                          className="button-delete"
                          onClick={() => {
                            const newData = [...listDataVar];
                            newData.splice(index, 1);
                            setListDataVar(newData);
                          }}
                        >
                          <Icon name="Trash" />
                        </div>
                      : null}
                    </div>
                  ))
                : null}
              </div> */}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
