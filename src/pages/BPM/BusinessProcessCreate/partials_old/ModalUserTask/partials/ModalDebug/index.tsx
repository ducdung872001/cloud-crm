import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, getPageOffset } from "reborn-util";

import "./index.scss";
import { showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";

export default function ModalDebug({ onShow, onHide, dataNode, processId }) {
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);
  
  const [params, setParams] = useState({
      name: "",
      limit: 100,
      fromNodeId: '',
      // nodeId: dataNode?.id
  });  

  useEffect(() => {
      if(dataNode && onShow){
          setParams((preState) => ({...preState, 
                                      fromNodeId: dataNode?.id, 
                                    }))
      }
  }, [dataNode, onShow])

  const [pagination, setPagination] = useState<PaginationProps>({
      ...DataPaginationDefault,
      name: "link",
      isChooseSizeLimit: true,
      setPage: (page) => {
          setParams((prevParams) => ({ ...prevParams, page: page }));
      },
      chooseSizeLimit: (limit) => {
          setParams((prevParams) => ({ ...prevParams, limit: limit }));
      },
  });


  const [linkNodeList, setLinkNodeList] = useState([])

  const abortController = new AbortController();

  const getListLinkNode= async (paramsSearch: any) => {
      setIsLoading(true);

      const response = await BusinessProcessService.listLinkFrom(paramsSearch, abortController.signal);

      if (response.code == 0) {
          const result = response.result;
          setLinkNodeList(result);

          setPagination({
              ...pagination,
              page: +result.page,
              sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
              totalItem: +result.total,
              totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
          });

      
      } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setIsLoading(false);
  };

  useEffect(() => {
    if(onShow && params.fromNodeId){
      getListLinkNode(params)
    }
      
  }, [params, onShow, processId, dataNode])

  const titlesVariable = ["STT","LinkId", "FlowType", "FromNodeId", "ToNodeId"];
  const dataFormatVariable = [ "text-center", "", "", "", ""];

  const dataMappingArray = (item: any, index: number) => [
      getPageOffset(params) + index + 1,
      item.linkId,
      item.flowType,
      item.fromNodeId,
      item.toNodeId
  ];

  const actionsTable = (item: any): IAction[] => {
      
      return [
        //   {
        //       title: "Sửa",
        //       icon: <Icon name="Pencil" />,
        //       callback: () => {
        //           setData(item);
        //           setIsAddVariable(true);
        //       },
        //   },
          {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                  showDialogConfirmDelete(item);
              },
          },
      ];
  };

  const showDialogConfirmDelete = (item?: any) => {
      const contentDialog: IContentDialog = {
        color: "error",
        className: "dialog-delete",
        isCentered: true,
        isLoading: true,
        title: <Fragment>Xóa...</Fragment>,
        message: (
          <Fragment>
            Bạn có chắc chắn muốn xóa link đã chọn {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
          </Fragment>
        ),
        cancelText: "Hủy",
        cancelAction: () => {
          setShowDialog(false);
          setContentDialog(null);
        },
        defaultText: "Xóa",
        defaultAction: async () => {
            const response = await BusinessProcessService.bpmDeleteLinkNode(item.linkId);
            if (response.code === 0) {
              showToast("Xóa link thành công", "success");
              getListLinkNode(params)
            } else {
                showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
            }
            setShowDialog(false);
            setContentDialog(null);
        },
      };
      setContentDialog(contentDialog);
      setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
      () => ({
        actions_right: {
          buttons: [
            {
              title: "Đóng",
              color: "primary",
              variant: "outline",
              callback: () => {
                onHide();
              },
            },
          //   {
          //     title:  "Xác nhận",
          //     // type: "submit",
          //     color: "primary",
          //     disabled: lstAttributeSelected?.length > 0 ? false : true,
          //     // is_loading: isSubmit,
          //     callback: () => {
          //       handleSubmit(lstAttributeSelected)
          //     },
          //   },
          ],
        },
      }),
      []
    );


  


  const handleClearForm = () => {
    onHide(false);
    setLinkNodeList([]);
    setParams({
      name: "",
      limit: 10,
      fromNodeId: '',
    })
  };


  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-debug"
      >
        <form className="form-debug">
          <ModalHeader title={`Danh sách Link Node (fromNodeId: ${dataNode?.id})`} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
                <div style={{maxHeight:'48rem', overflow:'auto'}}>
                    {!isLoading && linkNodeList  && linkNodeList.length > 0 ? (
                      <BoxTable
                          name="Danh sách Link Node"
                          titles={titlesVariable}
                          items={linkNodeList}
                          isPagination={true}
                          dataPagination={pagination}
                          dataMappingArray={(item, index) => dataMappingArray(item, index)}
                          dataFormat={dataFormatVariable}
                          // listIdChecked={listIdChecked}
                          isBulkAction={true}
                          // bulkActionItems={bulkActionList}
                          striped={true}
                          // setListIdChecked={(listId) => setListIdChecked(listId)}
                          actions={actionsTable}
                          actionType="inline"
                      />
                      ) : isLoading ? (
                      <Loading />
                      ) : (
                      <SystemNotification description={<span>Hiện tại chưa có Link Node nào.</span>} type="no-item" />
                    )}
                </div>            
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
