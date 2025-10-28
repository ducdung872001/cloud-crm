import BoxTable from "components/boxTable/boxTable";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IContractPipelineResponse } from "model/contractPipeline/ContractPipelineResponseModel";
import { IAction } from "model/OtherModel";
import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import SegmentFilterService from "services/SegmentFilterService";
import { showToast } from "utils/common";
import "./TeamEmployeeAdvance.scss";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import ModalAddFilter from "./ModalAddFilter/ModalAddFilter";


export default function TeamEmployeeAdvance({ dataNode, processId }) {
    
    const [listFilter, setListFilter] = useState([]);
    const [dataFilter, setDataFilter] = useState(null);
    const [listIdChecked, setListIdChecked] = useState<number[]>([]);
    const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [contentDialog, setContentDialog] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isNoItem, setIsNoItem] = useState<boolean>(false);
    const [isPermissions, setIsPermissions] = useState<boolean>(false);

    // const [params, setParams] = useState({
    //     nodeId: nodeId,
    //     page: 1,
    //     limit: 100
    // })

    const getListFilter = async (nodeId: any, disableLoading?: boolean) => {
        if(!disableLoading){
            setIsLoading(true);
        }

        const params = {
            nodeId: nodeId,
            page: 1,
            limit: 100
        }
        
        const response = await SegmentFilterService.listSegmentMapping(params);
    
        if (response.code === 0) {
          const result = response.result;
          setListFilter(result?.items);
    
          
        } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getListFilter(dataNode?.id);
    }, [dataNode])

    const titleActions: ITitleActions = {
        actions: [            {
              icon: <Icon name="Plus" style={{width: 13, height: 13}} />,
              title: "Thêm mới",
              callback: () => {
                setDataFilter(null);
                setShowModalAdd(true);
              },
            },
        ],
    };

    const titles = ["Id", "Tên nhóm hồ sơ", "Tên nhóm nhân viên", "Phương pháp lọc"];

  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: any, index: number) => [
    // getPageOffset(params) + index + 1,
    item.id,
    item.potSegmentName,
    item.employeeSegmentName,
    item.pickMode
    
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
        {
          title: listIdChecked.length > 0 ? '' : "Sửa",
          disabled: listIdChecked.length > 0 ? true : false,
          icon: <Icon name="PencilSimpleLine" className={listIdChecked.length > 0 ? "icon-edit-inactive" : "icon-edit-active"}/>,
          callback: () => {
            if(listIdChecked.length === 0){
              setDataFilter(item);
              setShowModalAdd(true);
            }
          },
        },
       
        {
          title: listIdChecked.length > 0 ? '' : "Xóa",
          disabled: listIdChecked.length > 0 ? true : false,
          icon: <Icon name="TrashRox" className={listIdChecked.length > 0 ? "icon-delete-inactive" : "icon-delete-active"} />,
          callback: () => {
            if(listIdChecked.length === 0){
                showDialogConfirmDelete(item);
            }
          },
        },
      
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await SegmentFilterService.deleteSegmentMapping(id);

    if (response.code === 0) {
      showToast("Xóa điều kiện thành công", "success");
      getListFilter(dataNode?.id);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        SegmentFilterService.deleteSegmentMapping(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa điều kiện thành công", "success");
        getListFilter(dataNode?.id);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IContractPipelineResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "điều kiện " : `${listIdChecked.length} điều kiện đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (listIdChecked.length > 0) {
          onDeleteAll();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa điều kiện",
      callback: () => showDialogConfirmDelete(),
    },
  ];
    
    return (
        <div className="team-employee-advance">
            <div className="button-add">
                <TitleAction
                    title="" 
                    titleActions={titleActions} 
                    disableIcon={true}
                />
            </div>
            {!isLoading && listFilter && listFilter.length > 0 ? (
                <BoxTable
                    name="Danh sách điều kiện"
                    titles={titles}
                    items={listFilter}
                    isPagination={false}
                    // dataPagination={pagination}
                    dataMappingArray={(item, index) => dataMappingArray(item, index)}
                    dataFormat={dataFormat}
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
                <Fragment>
                    { (
                        <SystemNotification
                            description={
                                <span>
                                    Hiện tại chưa có điều kiện nào. <br />
                                </span>
                            }
                            type="no-item"
                        />
                    )}
                </Fragment>
            )}

          <ModalAddFilter
            onShow={showModalAdd}
            dataNode={dataNode}
            processId={processId}
            onHide={(reload) => {
              if (reload) {
                getListFilter(dataNode?.id);
              }
              setShowModalAdd(false);
            }}
          />
        </div>
    );
}
