import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./index.scss";
import { handDownloadFileOrigin, showToast } from "utils/common";
import MarketingAutomationService from "services/MarketingAutomationService";
import "reactflow/dist/style.css";
import ReactFlow, { addEdge, MiniMap, Controls, Background, useNodesState, useEdgesState, ReactFlowProvider, applyNodeChanges } from "reactflow";

const minimapStyle = {
    height: 120,
  };

  
export default function ModalProgressMA(props: any) {
    const { onShow, onHide, dataCustomer, maId, nodesData, edgesData } = props;

    const reactFlowWrapper = useRef(null);

    const [nodes, setNodes] = useState([]);
    // console.log('nodes', nodes);
    
    const [edges, setEdges] = useState([]);

    const [status, setStatus] = useState(null);

    useEffect(() => {
        if(onShow && nodesData && edgesData){
            // setNodes(nodesData);
            setEdges(edgesData);
        }
    }, [onShow, nodesData, edgesData])

    const [detailProgress, setDetailProgress] = useState(null);
    // console.log('detailProgress', detailProgress);
    
    useEffect(() => {
        if(onShow && detailProgress && detailProgress.length > 0 && nodesData && nodesData.length > 0){
            
            const maNodeIdLast = detailProgress[detailProgress.length - 1]?.maNodeId;
            const status = detailProgress[detailProgress.length - 1]?.status;
            const indexNodeLast = nodesData.findIndex(el => +el.id === maNodeIdLast);

            const newNodes = [...nodesData];
            if(indexNodeLast !== -1){
                newNodes[indexNodeLast] = {...newNodes[indexNodeLast], 
                                            style: {
                                                ...newNodes[indexNodeLast].style, 
                                                backgroundColor: status === 'fail' ? 'var(--error-darker-color)' : "var(--success-darker-color)",
                                                color: status === 'success' || status === 'fail' ? 'white' : ""
                                            }}
            }

            setNodes(newNodes);
            setStatus(status)
        }
    }, [detailProgress, nodesData, onShow])

    const edgesWithUpdatedTypes = edges.map((edge) => {
        const edgeNew = {
        ...edge,
        // type:'step'
        };

        if (edge.sourceHandle) {
        const edgeType = nodes.find((node) => node.type === "custom").data.selects[edge.sourceHandle];
        // console.log('edgeType', );
        edgeNew.type = edgeType;
        }

        return edgeNew;
    });


    const getDetailProgress = async(maId, customerId) => {
        const params = {
            maId: maId,
            customerId: customerId
        }
        const response = await MarketingAutomationService.detailCustomer(params);

        if(response.code === 0){
            const result = response.result;            
            setDetailProgress(result);
        } else {
            showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
    }

    useEffect(() => {
        if(onShow && maId && dataCustomer){
            getDetailProgress(maId, dataCustomer.id)
        }
    }, [onShow, maId, dataCustomer]);

    
    const handleClearForm = (acc) => {
        onHide(acc);
        setNodes([]);
        setEdges([]);
        setDetailProgress([]);
        setStatus(null);
    };

    const actions = useMemo<IActionModal>(
        () => ({
        actions_right: {
            buttons: [
            {
                title: "Đóng",
                color: "primary",
                variant: "outline",
                // disabled: isSubmit,
                callback: () => {
                handleClearForm(false);
                },
            },
            
            ],
        },
        }),
        []
    );

    return (
        <Fragment>
        <Modal
            isFade={true}
            isOpen={onShow}
            isCentered={true}
            staticBackdrop={true}
            toggle={() => handleClearForm(false)}
            className="modal-progress-ma"
            size="lg"
        >
            <div className="form-progress-ma">
            <ModalHeader title={`Chi tiết khách hàng`} toggle={() => handleClearForm(false)} />
            <ModalBody>
                <div className="box-progress-ma">
                    <div className="dndflow">
                        <ReactFlowProvider>
                            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edgesWithUpdatedTypes}
                                    // onNodesChange={onNodesChange}
                                    // onEdgesChange={onEdgesChange}
                                    // elementsSelectable={false}
                                    nodesDraggable={false}
                                    fitView
                                    // className="react-flow-automation"
                                >
                                    {/* <MiniMap style={minimapStyle} zoomable pannable /> */}
                                    {/* <Controls /> */}
                                    <Background color="#aaa" gap={10} />
                                </ReactFlow>
                            </div>
                        </ReactFlowProvider>
                    </div>

                    {status === 'fail' ? 
                        <div className="note__signature">
                            <span className="hight-line">Lưu ý:</span>

                            <div className="lst__agent">
                                {/* <div className="item--agent">
                                    <span className="name">- Đang thực hiện</span>
                                    <span className="bg-item bg-yellow" />
                                </div>
                                <div className="item--agent">
                                    <span className="name">- </span>
                                    <span className="bg-item bg-success" />
                                </div> */}
                                <div className="item--agent">
                                    <span className="name">- Thực hiện không thành công</span>
                                    <span className="bg-item bg-error" />
                                </div>
                            </div>
                        </div>
                    : null}

                </div>
            </ModalBody>
            <ModalFooter actions={actions} />
            </div>
        </Modal>
        </Fragment>
    );
}
