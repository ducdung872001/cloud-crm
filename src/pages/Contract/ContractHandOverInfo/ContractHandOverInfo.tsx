import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { convertToId, formatCurrency, getPageOffset, getSearchParameters, isDifferenceObj } from "reborn-util";
import { handDownloadFileOrigin, showToast } from "utils/common";
import "./ContractHandOver.scss";
import Button from "components/button/button";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import moment from "moment";
import { IAction } from "model/OtherModel";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import SearchBox from "components/searchBox/searchBox";
import ContractPaymentService from "services/ContractPaymentService";
import ContractAttachmentService from "services/ContractAttachmentService";
import ModalAddHandover from "./partials/ModalAddHandOver";
import Badge from "components/badge/badge";
import ModalHandoverProgress from "./ModalPaymentProgress/ModalHandoverProgress";
// import ModalAddAttachment from "./partials/ModalAddAttachment";

export default function ContractHandOver (props: any) {
  const { contractId, detailContract, detailContractData, reLoad } = props;
  
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [handoverList, setHandoverList] = useState([])
  const [dataHandover, setDataHandover] = useState(null);
  const [isAddHandover, setIsAddHandover] = useState(false);
  const [isModalHandoverProgress, setIsModalHandoverProgress] = useState(false);

  useEffect(() => {
    if(detailContractData && detailContractData.products && detailContractData.products.length > 0){
        setHandoverList(detailContractData.products);
    }

  }, [detailContractData])

//   const [params, setParams] = useState({
//     name: "",
//     limit: 10,
//   });

    // useEffect(() => {
    //     if(contractId){
    //         setParams((preState) => ({...preState, contractId: contractId}))
    //     }
    // }, [contractId])

    // const [pagination, setPagination] = useState<PaginationProps>({
    //     ...DataPaginationDefault,
    //     name: "",
    //     isChooseSizeLimit: true,
    //     setPage: (page) => {
    //         setParams((prevParams) => ({ ...prevParams, page: page }));
    //     },
    //     chooseSizeLimit: (limit) => {
    //         setParams((prevParams) => ({ ...prevParams, limit: limit }));
    //     },
    // });

    // const getListHandover = async (paramsSearch: any) => {
    //     setIsLoading(true);

    //     const response = await ContractAttachmentService.contractAttachmentList(paramsSearch);

    //     if (response.code == 0) {
    //         const result = response.result;
    //         setHandoverList(result.items);

    //         setPagination({
    //             ...pagination,
    //             page: +result.page,
    //             sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
    //             totalItem: +result.total,
    //             totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
    //         });

        
    //     } else {
    //         showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //     }
    //     setIsLoading(false);
    // };

    // useEffect(() => {
    //     getListHandover(params)
    // }, [params])

    const titles = ["STT", "Tên mặt hàng/dịch vụ", "Ngày bàn giao dự kiến", "Tổng số lượng cần nhận", "Số lượng còn lại", "Trạng thái"];
    const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "text-center"]

    const dataMappingArray = (item: any, index: number) => [
        // getPageOffset(params) + index + 1,
        index + 1,
        item.item?.name,
        item.handoverExpectedAt ? moment(item.handoverExpectedAt).format('DD/MM/YYYY') : '' ,
        item.quantity,
        item.quantity - item.handoverQuantity,
        <Badge
            key={index}
            variant={(item.quantity - item.handoverQuantity) === 0 ? "success" : (item.quantity - item.handoverQuantity) === item.quantity ? "primary" : "warning"}
            text={(item.quantity - item.handoverQuantity) === 0 ? "Hoàn thành" : (item.quantity - item.handoverQuantity) === item.quantity ? "Đã tạo" : "Đang bàn giao"}
        />,
    ];

    const actionsTable = (item: any): IAction[] => {
        return [

            ...((item.quantity - item.handoverQuantity) !== 0 ? [
                {
                    title: "Thêm đợt bàn giao",
                    icon: <Icon name="Handover" style={{width: 18, height: 18}}/>,
                    callback: () => {
                        setDataHandover(item);
                        setIsModalHandoverProgress(true);
                    },
                },
                
                {
                    title: "Cập nhật ngày bàn giao dự kiến",
                    icon: <Icon name="Pencil" />,
                    callback: () => {
                        setDataHandover(item);
                        setIsAddHandover(true);
                    },
                },
            ] : []),
            
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
              Bạn có chắc chắn muốn xóa mục bàn giao đã chọn
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
            const response = await ContractAttachmentService.contractAttachmentDelete(item.id);
            if (response.code === 0) {
                showToast("Xóa tài mục bàn giao thành công", "success");
                // getListHandover(params)
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

    return (
        <div className="card-box wrapper__info--attachment">
        
            <div className="action-header-attachment">
                <div className="title__actions">
                    <ul className="menu-list">
                        <li
                            className={ "active"}
                            onClick={(e) => { }}
                            >
                            {'Thông tin bàn giao'}
                        </li>
                    </ul>
                    {/* <div style={{marginRight: '2rem'}}>
                        <Button
                            // type="submit"
                            color="primary"
                            // disabled={}
                            onClick = {() => {
                                setIsAddHandover(true)
                            }}
                        >
                            Thêm mục bàn giao
                        </Button>
                    </div> */}
                </div>
                {/* <SearchBox
                    name="Tên tài sản/thiết bị"
                    params={params}
                    // isSaveSearch={true}
                    // listSaveSearch={listSaveSearch}
                    updateParams={(paramsNew) => setParams(paramsNew)}
                /> */}
            </div>
            <div style={{padding: '2rem'}}>
                {!isLoading && handoverList && handoverList.length > 0 ? (

                    <BoxTable
                        name="Thông tin bàn giao"
                        titles={titles}
                        items={handoverList}
                        isPagination={false}
                        // dataPagination={pagination}
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
                    ) : isLoading ? (
                    <Loading />
                    ) : (
                    <SystemNotification description={<span>Hiện tại chưa có mục bàn giao nào.</span>} type="no-item" />
                )}
            </div>
            {detailContract ? null :
                <div style={{display:'flex', justifyContent:'flex-end', padding:'0 1.6rem 1.6rem 0'}}>
                    <Button
                        color="primary"
                        variant="outline"
                        onClick={(e) => {
                        e.preventDefault();
                        navigate("/contract");
                        }}
                    >
                        Danh sách hợp đồng
                    </Button>
                </div>
            }
            <Dialog content={contentDialog} isOpen={showDialog} />
            <ModalAddHandover
                onShow={isAddHandover}
                data={dataHandover}
                contractId={contractId}
                detailContractData={detailContractData}
                onHide={(reload) => {
                    if (reload) {
                        // getListHandover(params);
                        reLoad(true)
                        setDataHandover(null);
                    }
                    setIsAddHandover(false);
                    setDataHandover(null);
                }}
            />

            <ModalHandoverProgress
                onShow={isModalHandoverProgress}
                data={dataHandover}
                onHide={(reload) => {
                    if (reload) {
                        reLoad(true)
                    } 
                    if(reload !== 'no_close'){
                        setIsModalHandoverProgress(false);
                        setDataHandover(null);
                    }
                    
                }}
            />
            
        </div>
    );
}
