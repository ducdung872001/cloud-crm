import BoxTable from "components/boxTable/boxTable";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import RadioList from "components/radio/radioList";
import { IActionModal } from "model/OtherModel";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { getPageOffset, isDifferenceObj, trimContent } from "reborn-util";
import BusinessProcessService from "services/BusinessProcessService";
import { formatFileSize, handDownloadFileOrigin, showToast } from "utils/common";
import { uploadDocumentFormData } from "utils/document";
import "./ModalExportProcess.scss";

export default function ModalExportProcess(props: any) {
  const { onShow, onHide, processId, listNodeSelected } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [showDialogConfirm, setShowDialogConfirm] = useState<boolean>(false);
  const [contentDialogConfirm, setContentDialogConfirm] = useState<IContentDialog>(null);
  const [typeExport, setTypeExport] = useState('all_process');
  const [requestId, setRequestId] = useState(null);
  const [isLoadingExport, setIsLoadingEpxort] = useState(false);

  const titles = ["Tên Node", "NodeId"];
  const dataFormat = [ "", ""];

  const dataMappingArray = (item: any, index: number, type?: string) =>
    [
        // index + 1,
        item.nodeName,
        item.nodeId,
    ]

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            // disabled: isSubmit,
            callback: () => {
                handClearForm(false)
            },
          },

          {
            title: "Xuất dữ liệu",
            // type: "submit",
            color: "primary",
            // disabled: listAttactment && listAttactment.length === 0,
            is_loading: isLoadingExport,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [isSubmit, typeExport, processId, listNodeSelected, isLoadingExport]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
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

  
  const exportDataProcess = async (processId) => {
    const body = {
      processId: +processId
    }
    const response = await BusinessProcessService.exportDataProcess(body);

    if (response.code == 0) {
      const result = response.result;
      const requestId = result?.requestId

      if(requestId){
        setRequestId(requestId);
      } else {
        setIsLoadingEpxort(false)
      }
    } else {
      setIsLoadingEpxort(false)
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const ExportNode = async (listNodeId) => {    
    const body = {
        nodeIds: listNodeId
    }
    const response = await BusinessProcessService.exportDataProcess(body);

    if (response.code == 0) {
        const result = response.result;
        const requestId = result?.requestId

        if(requestId){
            setRequestId(requestId);
        } else {
            setIsLoadingEpxort(false)
        }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsLoadingEpxort(false)
    }
}

  useEffect(() => {
    if(requestId){
      const timer = setInterval(async () => {
        const response = await BusinessProcessService.getUrlExportDataProcess({requestId: requestId});
        if(response.code == 0) {
          const result = response.result;
          const fileResponse = result.fileResponse;

          if(fileResponse){
            handDownloadFileOrigin(fileResponse?.fileUrl, fileResponse?.fileName);
            showToast("Xuất dữ liệu thành công", "success");
            clearInterval(timer);
            setRequestId(null);
          }
          setIsLoadingEpxort(false)
        }
        
      }, 2000, requestId);
  
      return () => clearInterval(timer);
    }
    
  }, [requestId]);

  const onSubmit = async () => {
    // e.preventDefault();
    setIsLoadingEpxort(true);

    if(typeExport === 'all_process'){
        exportDataProcess(processId);
        return;
    }

    if(typeExport === 'select_node'){
        const listNodeId = listNodeSelected.map(item => item.nodeId);
        ExportNode(listNodeId);
        return;
    }
  };

  const handClearForm = (acc) => {
    onHide(acc);
    setIsSubmit(false);
    setTypeExport('all_process');
    setRequestId(null);
    setIsLoadingEpxort(false)
  };
  

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handClearForm(false)}
        className="modal-export-process"
        // size="sm"
      >
        <form
          className="form-export-process"
          // onSubmit={(e) => onSubmit(e)}
        >
          <ModalHeader
            title={`Xuất dữ liệu cấu hình`}
            toggle={() => {
              !isSubmit && handClearForm(false);
            }}
          />
          <ModalBody>
            <div className="list-form-group">
                <div className="form-group">
                    <RadioList
                        name="type_export"
                        title=""
                        options={[
                            {
                                value: 'all_process',
                                label: 'Xuất cả quy trình'
                            },
                            {
                                value: 'select_node',
                                label: 'Xuất các node đã chọn'
                            },
                        ]}
                        value={typeExport}
                        onChange={(e) => setTypeExport(e.target.value)}
                    />
                </div>

                {listNodeSelected && listNodeSelected.length > 0 && typeExport === 'select_node' ? 
                    <div className="list-select-node">
                        <BoxTable
                            name="Danh sách Node"
                            titles={titles}
                            items={listNodeSelected}
                            isPagination={false}
                            // dataPagination={pagination}
                            dataMappingArray={(item, index) => dataMappingArray(item, index)}
                            dataFormat={dataFormat}
                            // listIdChecked={listIdChecked}
                            isBulkAction={false}
                            // bulkActionItems={bulkActionList}
                            striped={true}
                            // setListIdChecked={(listId) => setListIdChecked(listId)}
                            // actions={[]} 
                            actionType="inline"
                        />
                    </div>
                : null}
             
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDialogConfirm} isOpen={showDialogConfirm} />
    </Fragment>
  );
}
