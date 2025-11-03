import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { useActiveElement } from "utils/hookCustom";
import { handDownloadFileOrigin, showToast } from "utils/common";
import "./HistoryModal.scss";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import ContractService from "services/ContractService";
import moment from "moment";
import { formatCurrency, getPageOffset } from "reborn-util";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IInvoiceResponse } from "model/invoice/InvoiceResponse";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import InvoiceService from "services/InvoiceService";
import Badge from "components/badge/badge";
import { ICallHistoryListFilterRequest } from "model/callCenter/CallCenterRequestModel";
import CallCenterService from "services/CallCenterService";
import Image from "components/image";
import ContractList from "./ContractList/ContractList";

export default function HistoryModal(props: any) {
    const { onShow, onHide, dataCustomer,} = props;

    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    

    const [tab, setTab] = useState(1);
    const dataTab = [
      {
        value: 1,
        label: 'Cuộc gọi'
      },
      {
        value: 2,
        label: 'Đơn hàng liên quan'
      },
      {
        value: 3,
        label: 'Hợp đồng liên quan'
      }
    ]

    const [callHistory, setCallHistory] = useState([]);
    const [isNoItemCall, setIsNoItemCall] = useState<boolean>(false);
    console.log('callHistory', callHistory);

    const [paramsCall, setParamsCall] = useState<ICallHistoryListFilterRequest>({
      keyword: "",
    });

    const [paginationCall, setPaginationCall] = useState<PaginationProps>({
      ...DataPaginationDefault,
      name: "Cuộc gọi",
      isChooseSizeLimit: true,
      setPage: (page) => {
        setParamsCall((prevParams) => ({ ...prevParams, page: page }));
      },
      chooseSizeLimit: (limit) => {
        setParamsCall((prevParams) => ({ ...prevParams, limit: limit }));
      },
    });

    const getListCallHistory = async (paramsSearch: ICallHistoryListFilterRequest, customerId: number) => {
      const param = {
        ...paramsSearch,
        customerId: customerId
      }

      setIsLoading(true);
  
      const response = await CallCenterService.callHistoryList(param);
  
      if (response.code === 0) {
        const result = response.result;
        setCallHistory(result.items);
  
        setPaginationCall({
          ...paginationCall,
          page: +result.page,
          sizeLimit: paramsCall.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(paramsCall.limit ?? DataPaginationDefault.sizeLimit)),
        });
        if (+result.total === 0 && paramsCall.keyword !== "" && +paramsCall.page === 1) {
          setIsNoItemCall(true);
        }
      } else if (response.code == 400) {
        // setIsPermissions(true);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setIsLoading(false);
    };


    ///Lịch sử giao dịch
    const [listSaleInvoice, setListSaleInvoice] = useState<IInvoiceResponse[]>([]);
    const [isNoItemInvoice, setIsNoItemInvoice] = useState<boolean>(false);

    const [paramsInvoice, setParamsInvoice] = useState<any>({
      invoiceCode: "",
      invoiceTypes: JSON.stringify(["IV1", "IV3"]),
    });

    const [paginationInvoice, setPaginationInvoice] = useState<PaginationProps>({
      ...DataPaginationDefault,
      name: "Hóa đơn",
      isChooseSizeLimit: true,
      setPage: (page) => {
        setParamsInvoice((prevParams) => ({ ...prevParams, page: page }));
      },
      chooseSizeLimit: (limit) => {
        setParamsInvoice((prevParams) => ({ ...prevParams, limit: limit }));
      },
    });

    const abortController = new AbortController();

  const getListSaleInvoice = async (paramsSearch: IInvoiceFilterRequest, customerId?: number) => {
    const param = {
      ...paramsSearch,
      customerId: customerId
    }
    setIsLoading(true);

    const response = await InvoiceService.list(param, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListSaleInvoice(result.pagedLst.items);

      setPaginationInvoice({
        ...paginationInvoice,
        page: +result.pagedLst.page,
        sizeLimit: paramsInvoice.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.pagedLst.total,
        totalPage: Math.ceil(+result.pagedLst.total / +(paramsInvoice.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.pagedLst.total === 0 && !paramsInvoice?.invoiceCode && +result.pagedLst.page === 1) {
        setIsNoItemInvoice(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };
    
    useEffect(() => {
      if(onShow && dataCustomer){
        getListSaleInvoice(paramsInvoice, dataCustomer?.id)
        getListCallHistory(paramsCall, dataCustomer?.id)
      }
      // setCallHistory([
      //   {
      //     phone: '0962829352',
      //     time: '31/07/2024',
      //     call: 'Gọi đi',
      //     status: 'Lỡ',
      //     employee: 'Hoà Phạm',
      //     content: 'Gọi điện tư vấn gói vay'
      //   }
      // ])
    }, [onShow, paramsInvoice, paramsCall, dataCustomer])

    const titlesInvoice = ["STT", "Mã hóa đơn", "Ngày bán", "Tổng tiền", "VAT", "Giảm giá", "Đã thanh toán", "Trả từ thẻ", "Công nợ", "Trạng thái hóa đơn"];
    const dataFormatInvoice = ["text-center", "", "", "text-right", "text-right", "text-right", "text-right", "text-right", "text-right", "text-center"];
    const dataMappingArrayInvoice = (item: IInvoiceResponse, index: number, type?: string) =>
    [
      getPageOffset(paramsInvoice) + index + 1,
      <span key={index}>
        {item.invoiceCode}
      </span>,
      moment(item.receiptDate).format("DD/MM/YYYY"),
      formatCurrency(item.amount),
      "0",
      formatCurrency(item.discount ? item.discount : "0"),
      formatCurrency(item.paid),
      formatCurrency(item.amountCard ? item.amountCard : "0"),
      formatCurrency(item.debt ? item.debt : "0"),
      <Badge
        key={item.id}
        text={item.status === 1 ? "Hoàn thành" : item.status === 2 ? "Chưa hoàn thành" : "Đã hủy"}
        variant={item.status === 1 ? "success" : item.status === 2 ? "warning" : "error"}
      />,
    ]
    

    const titlesCall = ["STT", "Ảnh khách hàng", "Tên khách hàng", "Điện thoại", "Cuộc gọi", "Nhân viên chăm sóc", "Thời gian cuộc gọi"];
    const dataFormatCall = ["text-center", "text-center", "", "text-center", "text-center", "", "text-center"];

    const dataMappingArray = (item: any, index: number) => [
      getPageOffset(paramsCall) + index + 1,
      <Image key={item.id} src={item.customerAvatar} alt={item.customerName} />,
      item.customerName,
      item.phone,
      item.callStatus == 1 ? "Gọi đi" : item.callStatus == 2 ? "Gọi đến" : item.callStatus == 3 ? "Gọi đi lỡ" : "Gọi đến lỡ",
      item.employeeName,
      item.endTime ? getRealTimeCall(item.createdTime, item.endTime) : "",
    ];

    const getRealTimeCall = (start, end) => {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      let distance = Math.abs(endTime - startTime);
      const minutes = Math.floor(distance / 60000);
      distance -= minutes * 60000;
      const seconds = Math.floor(distance / 1000);
  
      const result = `${minutes} phút - ${seconds} giây`;
  
      return (
        <div className="d-flex align-items-center flex-column view__time--call">
          <span className="time-end">{moment(end.endTime).format("DD/MM/YYYY HH:mm")}</span>
          <span className="total-item">{result}</span>
        </div>
      );
    };

    const actionsTable = (item: any): IAction[] => {
        
        return [
            // {
            //     title: "Sửa",
            //     icon: <Icon name="Pencil" />,
            //     callback: () => {
            //         setDataAppendix(item);
            //         setIsAddAppendix(true);
            //     },
            // },
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
              Bạn có chắc chắn muốn xóa phụ lục đã chọn {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
            </Fragment>
          ),
          cancelText: "Hủy",
          cancelAction: () => {
            setShowDialog(false);
            setContentDialog(null);
          },
          defaultText: "Xóa",
          defaultAction: async () => {
            const response = await ContractService.contractAppendixDelete(item.id);
            if (response.code === 0) {
                showToast("Xóa phụ lục thành công", "success");
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
    setTab(1);
  };
  

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => handleClearForm()}
        className="modal-history"
        size="xl"
      >
        <div className="container-history">
          <ModalHeader
            title={'Lịch sử giao dịch'} 
            toggle={() => handleClearForm()}
          />
          <ModalBody>
            <div className="body-history">
              <div style={{display: 'flex', marginBottom: '1.2rem'}}>
                {dataTab.map((item, index) => (
                    <div 
                      key={index}
                      style={{borderBottom: tab === item.value ? '1px solid' : '', paddingLeft: 12, paddingRight: 12, paddingBottom: 3, cursor:'pointer'}}
                      onClick = {() => {
                        setTab(item.value)
                      }}
                  >
                      <span style={{fontSize: 16, fontWeight:'500', color: tab === item.value ? '' : '#d3d5d7'}}>{item.label}</span>
                  </div>
                ))}
              </div>

              <div>
                {tab === 1 ? 
                  (!isLoading && callHistory && callHistory.length > 0 ? (
                      <BoxTable
                          name="Lịch sử cuộc gọi"
                          titles={titlesCall}
                          items={callHistory}
                          isPagination={true}
                          dataPagination={paginationCall}
                          dataMappingArray={(item, index) => dataMappingArray(item, index)}
                          dataFormat={dataFormatCall}
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
                      <SystemNotification description={<span>Hiện tại chưa có cuộc gọi nào.</span>} type="no-item" />
                  ))
                  : tab == 2 ?
                  (!isLoading && listSaleInvoice && listSaleInvoice.length > 0 ? (
                    <BoxTable
                        name="Lịch sử giao dịch"
                        titles={titlesInvoice}
                        items={listSaleInvoice}
                        isPagination={true}
                        dataPagination={paginationInvoice}
                        dataMappingArray={(item, index) => dataMappingArrayInvoice(item, index)}
                        dataFormat={dataFormatInvoice}
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
                    <SystemNotification description={<span>Hiện tại chưa có hoá đơn nào.</span>} type="no-item" />
                  ))
                  : 
                    <ContractList
                      dataCustomer ={dataCustomer}
                    />
                }
              </div>
            </div>

          </ModalBody>
          <ModalFooter actions={ actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      
    </Fragment>
  );
}
