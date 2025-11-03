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
import SearchBox from "components/searchBox/searchBox";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import ModalValueVar from "./ModalValueVar";
import ModalValueForm from "./ModalValueForm";

export default function ModalDebugObject({ onShow, onHide, dataObject }) {
    console.log('dataObject', dataObject);
    
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showValue, setShowValue] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [processId, setProcessId] = useState(null);

  const [tab, setTab] = useState(1);
  const dataTab = [
    {
      value: 1,
      label: 'Danh sách biến'
    },
    {
      value: 2,
      label: 'Danh sách Form'
    },
  ]

  const [params, setParams] = useState({
    name: "",
    limit: 10,
    potId: '',
  });  

  const [paramsForm, setParamsForm] = useState({
    fromNodeId: "",
    limit: 10,
    processId: '',
  });  

  useEffect(() => {
      if(dataObject && onShow){
          setParams((preState) => ({...preState, 
                                        potId: dataObject?.id, 
                                    }))
          setParamsForm((preState) => ({...preState, 
                                        processId: processId, 
                                      }))                         
      }
  }, [dataObject, onShow, processId])

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

  const [paginationForm, setPaginationForm] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "",
    isChooseSizeLimit: true,
    setPage: (page) => {
        setParamsForm((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
        setParamsForm((prevParams) => ({ ...prevParams, limit: limit }));
    },
});


  const [varList, setVarList] = useState([]);
  const [formList, setFormList] = useState([]);

  const abortController = new AbortController();

  const getListVar = async (paramsSearch: any) => {
      setIsLoading(true);

      const response = await BusinessProcessService.listVariableDeclareGlobal(paramsSearch, abortController.signal);

      if (response.code == 0) {
          const result = response.result;
          setVarList(result.items);

          setPagination({
              ...pagination,
              page: +result.page,
              sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
              totalItem: +result.total,
              totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
          });

          setProcessId(result.items[0]?.processId);

      
      } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setIsLoading(false);
  };

  const getListForm = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await BusinessProcessService.listBpmFormGlobal(paramsSearch, abortController.signal);

    if (response.code == 0) {
        const result = response.result;
        setFormList(result.items);

        setPaginationForm({
            ...paginationForm,
            page: +result.page,
            sizeLimit: paramsForm.limit ?? DataPaginationDefault.sizeLimit,
            totalItem: +result.total,
            totalPage: Math.ceil(+result.total / +(paramsForm.limit ?? DataPaginationDefault.sizeLimit)),
        });

    
    } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
};

  useEffect(() => {
    if(onShow && params.potId){
        if(tab === 1){
          getListVar(params);
        } else {
            getListForm(paramsForm);
        }
    }
      
  }, [params, onShow, dataObject, paramsForm, tab])

  const titlesNode = ["STT","Tên biến", "ProcessId", "Giá trị"];
  const dataFormatNode = [ "text-center", "", "", "text-center",];

  const titlesLinkNode = ["STT", "FormId", "NodeId", "ProcessId", "Giá trị"];
  const dataFormatLinkNode = [ "text-center", "", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number, type) => [
      
      ...(type === 'var' 
      ? 
        [
          getPageOffset(params) + index + 1,
          item.name,
          item.processId,
          <a
            key={item.id}
            onClick={() => {
              setShowValue(true);
              setData(item);
            }}
          >
            Xem thêm
          </a>,
          
        ] 
      : 
        [
          getPageOffset(paramsForm) + index + 1,
          item.code,
          item.nodeId,
          item.processId,
          <a
            key={item.id}
            onClick={() => {
              setShowForm(true);
              setData(item);
            }}
          >
            Xem thêm
          </a>,
        ]
    ),
      
  ];

  const actionsTable = (item: any): IAction[] => {
      
      return [
        //   {
        //       title: tab === 1 ? 'Lưu Node vào CSDL' : 'Lưu Link vào CSDL',
        //       icon: <Icon name="CheckedCircle" />,
        //       callback: () => {
        //         showDialogConfirmSave(item);
        //       },
        //   },
          // {
          //     title: "Xóa",
          //     icon: <Icon name="Trash" className="icon-error" />,
          //     callback: () => {
          //         showDialogConfirmDelete(item);
          //     },
          // },
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
            Bạn có chắc chắn muốn xóa {item ? '' : `${listIdChecked.length}`} {tab === 1 ? 'Node' : 'Link'} đã chọn {item ? <strong>{tab === 1 ? (item.name || item.nodeId) : item.linkId}</strong> : ""}? Thao tác này không thể khôi phục.
          </Fragment>
        ),
        cancelText: "Hủy",
        cancelAction: () => {
          setShowDialog(false);
          setContentDialog(null);
        },
        defaultText: "Xóa",
        defaultAction: async () => {
            if(tab === 1){
                const response = await BusinessProcessService.bpmDeleteNode(item.nodeId);
                if (response.code === 0) {
                  showToast(`Xóa Node thành công`, "success");
                  getListVar(params)
                } else {
                    showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
                }
            } else {
                const param = {
                  ...(item.linkId ? {linkId: item.linkId} : {}),
                  fromNodeId: item.fromNodeId,
                  toNodeId: item.toNodeId
                }
                const response = await BusinessProcessService.bpmDeleteLinkNode(param);
                if (response.code === 0) {
                showToast(`Xóa Link thành công`, "success");
                getListForm(paramsForm)
                } else {
                    showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
                }
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
                handleClearForm();
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
    setTab(1);
    setVarList([]);
    setFormList([]);
    setParams({
      name: "",
      limit: 10,
      potId: '',
    })
    setParamsForm({
      fromNodeId: "",
      limit: 10,
      processId: '',
    })
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-debug-object"
      >
        <form className="form-debug-object">
          <ModalHeader title={`${dataObject?.name} (PotId: ${dataObject?.id})`} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
              <div style={{display: 'flex', marginTop: '1rem', marginLeft: '2rem'}}>
                {dataTab.map((item, index) => (
                    <div 
                      key={index}
                      style={{borderBottom: tab === item.value ? '1px solid' : '', paddingLeft: 12, paddingRight: 12, paddingBottom: 3, cursor:'pointer'}}
                      onClick = {() => {
                        setTab(item.value);
                        setListIdChecked([]);
                      }}
                  >
                      <span style={{fontSize: 16, fontWeight:'500', color: tab === item.value ? '' : '#d3d5d7'}}>{item.label}</span>
                  </div>
                ))}
              </div>
                <div style={{maxHeight:'48rem', overflow:'auto'}}>
                    <SearchBox
                        name={tab === 1 ? "tên biến" : 'nodeId'}
                        params={tab === 1 ? params : paramsForm}
                        isSaveSearch={false}
                        // listSaveSearch={listSaveSearch}
                        updateParams={(paramsNew) => {
                            if(tab === 1){
                                setParams(paramsNew)
                            } else {
                                setParamsForm(paramsNew)
                            }
                        }}
                    />
                    {!isLoading && (tab === 1 ? (varList  && varList.length > 0) : (formList  && formList.length > 0)) ? (
                        <BoxTable
                            name="Danh sách Node"
                            titles={tab === 1 ? titlesNode : titlesLinkNode}
                            items={tab === 1 ? varList : formList}
                            isPagination={true}
                            dataPagination={tab === 1 ? pagination : paginationForm}
                            dataMappingArray={(item, index) => dataMappingArray(item, index, tab === 1 ? 'var' : 'node')}
                            dataFormat={tab === 1 ? dataFormatNode : dataFormatLinkNode}
                            listIdChecked={listIdChecked}
                            isBulkAction={false}
                            bulkActionItems={bulkActionList}
                            striped={true}
                            setListIdChecked={(listId) => setListIdChecked(listId)}
                            actions={actionsTable}
                            actionType="inline"
                        />
                        ) : isLoading ? (
                        <Loading />
                        ) : (
                        <SystemNotification description={<span>Hiện tại chưa có {tab === 1 ? 'Node' : 'Link'} nào.</span>} type="no-item" />
                    )}
                </div>            
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalValueVar
        onShow={showValue}
        data={data}
        dataObject={dataObject}
        onHide={(reload) => {
          if (reload) {
            // getListBusinessProcess(params);
          } 
          setShowValue(false);
          setData(null);
        }}
      />
      <ModalValueForm
        onShow={showForm}
        data={data}
        dataObject={dataObject}
        onHide={(reload) => {
          if (reload) {
            // getListBusinessProcess(params);
          } 
          setShowForm(false);
          setData(null);
        }}
      />
    </Fragment>
  );
}
