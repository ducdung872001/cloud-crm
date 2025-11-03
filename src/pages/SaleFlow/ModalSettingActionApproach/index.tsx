import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import { IAction, IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import "./index.scss";
import _ from "lodash";
import Icon from "components/icon";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Button from "components/button/button";
import ModalAddAction from "./partials/ModalAddAction";
import Loading from "components/loading";
import SaleflowApproachService from "services/SaleflowApproachService";

export default function ModalSettingActionApproach(props: any) {
    const { onShow, onHide, approachData } = props;  
    // console.log('approachData', approachData);
    
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showModalAddAction, setShowModalAddAction] = useState(false);
    const [activityData, setActivityData] = useState(null);
    const [params, setParams] = useState({
        name: "",
        limit: 10,
    });

    useEffect(() => {
        if(approachData){
            setParams((preState) => ({...preState, approachId: approachData?.id}))
        }
    }, [approachData])
    

    const [pagination, setPagination] = useState<PaginationProps>({
        ...DataPaginationDefault,
        name: "hành động",
        isChooseSizeLimit: true,
        setPage: (page) => {
            setParams((prevParams) => ({ ...prevParams, page: page }));
        },
        chooseSizeLimit: (limit) => {
            setParams((prevParams) => ({ ...prevParams, limit: limit }));
        },
    });
    
    const [actionList, setActionList] = useState([])


    const abortController = new AbortController();

    const getListActivityApproach = async (paramsSearch: any) => {
        setIsLoading(true);

        const response = await SaleflowApproachService.activityList(paramsSearch, abortController.signal);

        if (response.code == 0) {
        const result = response.result;
        setActionList(result);

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
        getListActivityApproach(params)
    }, [params])

    const titles = ["STT", "Hành động", "Bắt buộc", "Thu thập VOC"];

    const dataFormat = ["text-center", "", "text-center", "text-center",];

    const dataMappingArray = (item: any, index: number) => [
        getPageOffset(params) + index + 1,
        item.code === 'create_invoice' ? 'Tạo đơn hàng' 
            : item.code === 'create_export' ? 'Tạo phiếu xuất kho' 
                : item.code === 'delivery_info' ? 'Nhập thông tin giao vận' 
                    : item.code === 'create_warranty' ? 'Tạo phiếu bảo hành' 
                        : item.code === 'create_ticket' ? 'Tạo phiếu hỗ trợ' 
                            : item.code === 'detail_warranty' ? 'Xem chi tiết bảo hành' 
                                : item.code === 'detail_ticket' ? 'Xem chi tiết hỗ trợ' 
                                    : '',
        <div>
            {item.required === 1 ? 
                <div className="icon-checked">
                    <Icon name="Checked" style={{width: 18}} />
                </div>
             : null
            }
        </div>,
        <div>
            {item.hasVoc === 1 ? 
                <div className="icon-checked">
                    <Icon name="Checked" style={{width: 18}} />
                </div>
            : null
            }
        </div>,
       
    ];


    const actionsTable = (item: any): IAction[] => {
        
        return [
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
                setShowModalAddAction(true);
                setActivityData(item);
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
              Bạn có chắc chắn muốn xóa hành động đã chọn
              {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
            </Fragment>
          ),
          cancelText: "Hủy",
          cancelAction: () => {
            setShowDialog(false);
            setContentDialog(null);
          },
          defaultText: "Xóa",
          defaultAction: async () => {
            const response = await SaleflowApproachService.deleteActivity(item.id);
            if (response.code === 0) {
                showToast("Xóa hành động thành công", "success");
                getListActivityApproach(params)
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


    const onSubmit = async (e) => {
        e && e.preventDefault();

        // const body = {
        //     id: formData.values.id,
        //     slaConfig: JSON.stringify(formData.values.slaConfig)
        // };

        // console.log('body', body);

        
        // const response = await CampaignApproachService.updateSLA(body);
        // if (response.code === 0) {
        //     onHide(true);
        //     showToast(`Cài đặt SLA thành công`, "success");
        // } else {
        //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        //   setIsSubmit(false);
        // }
    };

    const handClearForm = () => {
        onHide(false);
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
                    // _.isEqual(formData, valueConfig) ? handClearForm() : showDialogConfirmCancel();
                    handClearForm()
                },
            },
            // {
            //   title: 'Cập nhật',
            //   type: "submit",
            //   color: "primary",
            //   disabled:
            //     isSubmit ||
            //   //   !isDifferenceObj(formData.values, valueSetting),
            //   _.isEqual(formData, valueConfig),
            //   is_loading: isSubmit,
            // },
            ],
        },
        }),
        []
    );

    const showDialogConfirmCancel = () => {
        const contentDialog: IContentDialog = {
        color: "warning",
        className: "dialog-cancel",
        isCentered: true,
        isLoading: false,
        title: <Fragment>{`Hủy bỏ thao tác cài đặt`}</Fragment>,
        message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
        cancelText: "Quay lại",
        cancelAction: () => {
            setShowDialog(false);
            setContentDialog(null);
        },
        defaultText: "Xác nhận",
        defaultAction: () => {
            setShowDialog(false);
            setContentDialog(null);
            handClearForm();
        },
        };
        setContentDialog(contentDialog);
        setShowDialog(true);
    };


  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() =>  onHide(false)}
        className="modal-setting-action-approach"
        size="lg"
      >
        <form className="form-setting-action-approach" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cài đặt hành động`} toggle={() =>  handClearForm()} />
          <ModalBody>
            <div className="container-setting-action-approach">
                <div style={{justifyContent:'flex-end', display:'flex'}}>
                    <Button
                        onClick={(e) => {
                            setShowModalAddAction(true);
                        }}
                    >
                        Thêm hành động
                    </Button>
                </div>
                {!isLoading && actionList && actionList.length > 0 ? 
                    <BoxTable
                        name=""
                        // className="table__document"
                        titles={titles}
                        items={actionList}
                        isPagination={false}
                        dataPagination={pagination}
                        dataMappingArray={(item, index) => dataMappingArray(item, index)}
                        dataFormat={dataFormat}
                        // listIdChecked={listIdChecked}
                        isBulkAction={true}
                        // bulkActionItems={bulkActionList}
                        striped={true}
                        // setListIdChecked={(listId) => setListIdChecked(listId)}
                        actions={actionsTable}
                        actionType="inline"
                    />
                    : isLoading ? (
                        <Loading />
                      )
                    :
                    <SystemNotification
                        description={
                            <span>
                                Hiện tại chưa có hành động nào. <br />
                                Hãy thêm mới hành động đầu tiên nhé!
                            </span>
                        }
                        type="no-item"
                        // titleButton="Thêm mới chiến dịch bán hàng"
                        // action={() => {
                        //     setIdCampaign(null);
                        //     // setShowModalAdd(true);
                        //     navigate("/create_sale_campaign");
                        // }}
                    />
                }
                
            </div>
            
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalAddAction
            onShow={showModalAddAction}
            approachData = {approachData}
            activityData = {activityData}
            actionList = {actionList}
            onHide={(reload) => {
            if (reload) {
                getListActivityApproach(params)
            }
                setShowModalAddAction(false);
                setActivityData(null);
            }}
        />
    </Fragment>
  );
}
