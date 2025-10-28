import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, getPageOffset } from "reborn-util";
import "./ModalListGrid.scss";
import { showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import ModalSettingGrid from "./ModalSettingGrid/ModalSettingGrid";

export default function ModalListGrid({ onShow, onHide, data }) {
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isSettingGrid, setIsSettingGrid] = useState(false);
  const [dataGrid, setDataGrid] = useState(null);
  const [params, setParams] = useState({
      name: "",
      limit: 1000,
      processId: '',
      // nodeId: dataNode?.id
  });  

  useEffect(() => {
      if(data && onShow){
          setParams((preState) => ({...preState, processId: data?.id, }))
      }
  }, [data, onShow])

  const [pagination, setPagination] = useState<PaginationProps>({
      ...DataPaginationDefault,
      name: "",
      isChooseSizeLimit: true,
      setPage: (page) => {
          setParams((prevParams) => ({ ...prevParams, page: page }));
      },
      chooseSizeLimit: (limit) => {
          setParams((prevParams) => ({ ...prevParams, limit: limit }));
      },
  });


  const [listGrid, setListGrid] = useState([])

  const abortController = new AbortController();

  const getListGrid= async (paramsSearch: any) => {
      setIsLoading(true);

      const response = await BusinessProcessService.listArtifactMetadata(paramsSearch, abortController.signal);

      if (response.code == 0) {
          const result = response.result.items;
          setListGrid(result);

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
    if(onShow && params.processId){
        getListGrid(params)
    }
  }, [onShow, params])

  const titlesVariable = ["STT","Tên Artifact", "Tên Node", "NodeId", "Loại Artifact", "Link"];
  const dataFormatVariable = [ "text-center", "", "", "", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.fieldName,
    item.nodeName,
    item.nodeId,
    item.type,
    item.link
  ];

  const actionsTable = (item: any): IAction[] => {
      
      return [
          {
              title: "Cài đặt",
              icon: <Icon name="Settings" />,
              callback: () => {
                setDataGrid(item);
                setIsSettingGrid(true);
              },
          },
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
            Bạn có chắc chắn muốn xóa Grid đã chọn {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
          </Fragment>
        ),
        cancelText: "Hủy",
        cancelAction: () => {
          setShowDialog(false);
          setContentDialog(null);
        },
        defaultText: "Xóa",
        defaultAction: async () => {
            
            const response = await BusinessProcessService.deleteArtifactMetadata(item.nodeId, item.fieldName);
            if (response.code === 0) {
              showToast("Xóa Grid thành công", "success");
              getListGrid(params)
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
    setListGrid([]);
    setDataGrid(null);
    setParams({
      name: "",
      limit: 1000,
      processId: '',
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
        className="modal-list-grid"
      >
        <form className="form-list-grid">
          <ModalHeader title={`Danh sách Grid`} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
                <div style={{maxHeight:'calc(100vh - 185px)', overflow:'auto'}}>
                    {!isLoading && listGrid  && listGrid.length > 0 ? (
                      <BoxTable
                          name="Danh sách Grid"
                          titles={titlesVariable}
                          items={listGrid}
                          isPagination={true}
                          dataPagination={pagination}
                          dataMappingArray={(item, index) => dataMappingArray(item, index)}
                          dataFormat={dataFormatVariable}
                          // listIdChecked={listIdChecked}
                          isBulkAction={false}
                          // bulkActionItems={bulkActionList}
                          striped={true}
                          // setListIdChecked={(listId) => setListIdChecked(listId)}
                          actions={actionsTable}
                          actionType="inline"
                      />
                      ) : isLoading ? (
                      <Loading />
                      ) : (
                      <SystemNotification description={<span>Hiện tại chưa có Grid nào.</span>} type="no-item" />
                    )}
                </div>            
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />

      <ModalSettingGrid
        onShow={isSettingGrid}
        data={dataGrid}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsSettingGrid(false);
        }}
      />
    </Fragment>
  );
}
