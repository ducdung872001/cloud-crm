import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, convertToFileName } from "reborn-util";
import "./index.scss";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import Checkbox from "components/checkbox/checkbox";
import { handDownloadFileOrigin, showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import Button from "components/button/button";
import ModalSetting from "../ModalUserTask/partials/ModalSetting";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";

export default function ModalErrorStartEvent({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
    const [isModalClone, setIsModalClone] = useState(false);
    const [isModalSetting, setIsModalSetting] = useState(false);
    const [isModalDebug, setIsModalDebug] = useState(false);
    const [data, setData] = useState(null);
    const [dataWorkflow, setDataWorkflow] = useState(null);
    const [childProcessId, setChildProcessId] = useState(null);
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

    const getDetailTask = async (id) => {
        const response = await BusinessProcessService.detailErrorStartEvent(id);

        if (response.code == 0) {
            const result = response.result;
            setData(result);
            setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
        } else {
            showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
    };

    const values = useMemo(
        () => ({
            id: data?.id ?? null,
            // Sử dụng trực tiếp các trường của Error Start Event
            name: data?.errorCode ?? data?.name ?? "",
            code: data?.statusCode ?? data?.code ?? "",
            message: data?.type ?? data?.description ?? "",
            isActive: (data?.isActive === 1 || data?.isActive === true || data?.active === true) ? 1 : 0,
            nodeId: dataNode?.id ?? null,
            processId: childProcessId ?? processId ?? null,
            workflowId: data?.workflowId ?? null,
        }),
        [onShow, data, dataNode, processId, childProcessId]
    );

    const [formData, setFormData] = useState(values);
    // // console.log('formData', formData);

    useEffect(() => {
        setFormData(values);

        return () => {
            setIsSubmit(false);
        };
    }, [values]);

    const onSubmit = async (e) => {
        e.preventDefault();

        setIsSubmit(true);
        const isActiveBool = formData?.isActive === 1 ? true : false;
        const body = {
            id: data?.id ?? null,
            errorCode: formData?.name ?? "",
            statusCode: formData?.code ?? "",
            type: formData?.message ?? "",
            nodeId: dataNode?.id ?? null,
            processId: formData?.processId ?? null,
            workflowId: formData?.workflowId ?? null,
            isActive: isActiveBool,
            active: isActiveBool,
        };

        console.log("body", body);

        const response = await BusinessProcessService.updateErrorStartEvent(body);

        if (response.code === 0) {
            showToast(`Cập nhật công việc thành công`, "success");
            handleClear(false);
            changeNameNodeXML(dataNode, body.errorCode);
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
        setDataWorkflow(null);
    };

    const addNode = async () => {
        const body = {
            name: data?.name,
            typeNode: dataNode.type,
            processId: processId,
            nodeId: dataNode.id,
        };
        // return;
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
                className="modal-error-start-event"
            >
                <form className="form-error-start-event" onSubmit={(e) => onSubmit(e)}>
                    {/* <ModalHeader title={`Cài đặt biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} /> */}
                    <div className="container-header">
                        <div className="box-title">
                            <h4>{"Cài đặt Error Start Event"}</h4>
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
                                    label="Mã lỗi"
                                    fill={true}
                                    required={true}
                                    placeholder={"Nhập mã lỗi"}
                                    value={formData.name}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, name: value });
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <div>
                                    <span style={{ fontSize: 14, fontWeight: "700" }}>Kích hoạt node</span>
                                </div>
                                <div style={{ marginLeft: 10 }}>
                                    <Checkbox
                                        checked={formData.isActive === 1 ? true : false}
                                        label="Kích hoạt"
                                        onChange={() => {
                                            setFormData({
                                                ...formData,
                                                isActive: formData.isActive === 1 ? 0 : 1,
                                            });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <Input
                                    id="code"
                                    name="code"
                                    label="Mã HTTP (mã trạng thái HTTP lấy từ response của Service Task )"
                                    fill={true}
                                    required={false}
                                    placeholder={"Nhập 2xx/3xx/4xx/500, …"}
                                    value={formData.code}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, code: value });
                                    }}
                                />
                            </div>

                            <div className="form-group">
                                <TextArea
                                    name="message"
                                    value={formData.message}
                                    label="Thông tin lỗi (message - nội dung response lỗi từ Service Task)"
                                    fill={true}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, message: value });
                                    }}
                                    placeholder="Nhập message lỗi trả về"
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
