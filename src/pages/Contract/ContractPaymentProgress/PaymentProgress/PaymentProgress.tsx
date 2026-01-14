import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, getPageOffset, getSearchParameters, isDifferenceObj } from "reborn-util";
import { showToast } from "utils/common";
import "./PaymentProgress.scss";
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
import Badge from "components/badge/badge";
import AddPaymentProgressModal from "./partials/AddPaymentProgressModal";
import AddCashBookModal from "pages/Contract/PaymentProgress/AddCashBookModal/AddCashBookModal";
import { getPermissions } from "utils/common";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";

export default function PaymentProgress (props: any) {
  const { contractId, dataContract } = props;
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentProgressList, setPaymentProgressList] = useState([]);
  const [isAddPaymentProgress, setIsAddPaymentProgress] = useState(false);
  const [dataPaymentProgress, setDataPaymentProgress] = useState(null);
  const [isModalCashBook, setIsModalCashBook] = useState(false);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [permissions, setPermissions] = useState(getPermissions());
  
  const [params, setParams] = useState({
    keyword: "",
    limit: 10,
    contractId: contractId,
  });

    // useEffect(() => {
    //     if(contractId){
    //         setParams((preState) => ({...preState, contractId: contractId}))
    //     }
    // }, [contractId])

    const [pagination, setPagination] = useState<PaginationProps>({
        ...DataPaginationDefault,
        name: "kỳ thanh toán",
        isChooseSizeLimit: true,
        setPage: (page) => {
            setParams((prevParams) => ({ ...prevParams, page: page }));
        },
        chooseSizeLimit: (limit) => {
            setParams((prevParams) => ({ ...prevParams, limit: limit }));
        },
    });

    const getListPaymentProgress = async (paramsSearch: any) => {
        setIsLoading(true);

        const response = await ContractPaymentService.list(paramsSearch);

        if (response.code == 0) {
            const result = response.result;
            setPaymentProgressList(result.items);

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
        getListPaymentProgress(params)
    }, [params])

    const titles = ["STT","Kỳ thanh toán", "Ngày thanh toán", "Ngày bàn giao/nhận hồ sơ", "Số tiền thanh toán", "Số tiền thực trả", "Trạng thái"];
    const dataFormat = ["text-center","", "text-center", "text-center", "text-right", "text-right", "text-center"];

    const dataMappingArray = (item: any, index: number) => [
        getPageOffset(params) + index + 1,
        item.paymentBatch,
        item.paymentDate ? moment(item.paymentDate).format('DD/MM/YYYY') : '',
        item.taskAssignDate ? moment(item.taskAssignDate).format('DD/MM/YYYY') : '',
        formatCurrency(item.amount || 0),
        formatCurrency(item.paid || 0),
        <Badge
            key={index}
            variant={item.status === 1 ? "success" : item.status === 0 ? "warning" : item.status === 2 ? "error" : "transparent"}
            text={item.status === 1 ? "Đã thanh toán" : item.status === 0 ? "Chưa thanh toán" : item.status === 2 ? "Còn nợ" : ""}
        />,
    ];

    const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
        
        return [
            ...(item.status !== 1 ? [
                {
                    title: "Thanh toán",
                    icon: <Icon name="ReceiveMoney" className={isCheckedItem ? "icon-disabled" : ""}/>,
                    disabled: isCheckedItem,
                    callback: () => {
                        if (!isCheckedItem) {
                        setDataPaymentProgress(item);
                        setIsModalCashBook(true);
                        }
                    },
                },
                {
                    title: "Sửa",
                    icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
                    disabled: isCheckedItem,
                    callback: () => {
                        if (!isCheckedItem) {
                        setDataPaymentProgress(item);
                        setIsAddPaymentProgress(true);
                        }
                    },
                },
                {
                    title: "Xóa",
                    icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
                    disabled: isCheckedItem,
                    callback: () => {
                        if (!isCheckedItem) {
                        showDialogConfirmDelete(item);
                        }
                    },
                },
            ] : []),
            
        ];
    };
    const onDeleteAll = () => {
              const selectedIds = listIdChecked || [];
              if (!selectedIds.length) return;
          
              const arrPromises = selectedIds.map((selectedId) => {
                const found = paymentProgressList.find((item) => item.id === selectedId);
                if (found?.id) {
                  return ContractPaymentService.delete(found.id);
                } else {
                  return Promise.resolve(null);
                }
              });
              Promise.all(arrPromises)
              .then((results) => {
                const checkbox = results.filter (Boolean)?.length ||0;
                if (checkbox > 0) {
                  showToast(`Xóa thành công ${checkbox} kỳ thanh toán`, "success");
                  getListPaymentProgress(params);
                  setListIdChecked([]);
                } else {
                  showToast("Không có kỳ thanh toán nào được xóa", "error");
                }
             })
              .finally(() => {
                setShowDialog(false);
                setContentDialog(null);
              });
            }

    const showDialogConfirmDelete = (item?: any) => {
        const contentDialog: IContentDialog = {
          color: "error",
          className: "dialog-delete",
          isCentered: true,
          isLoading: true,
          title: <Fragment>Xóa...</Fragment>,
          message: (
            <Fragment>
              Bạn có chắc chắn muốn xóa kỳ thanh toán đã chọn
              {item ? <strong> {item.name} </strong> : ""}? Thao tác này không thể khôi phục.
            </Fragment>
          ),
          cancelText: "Hủy",
          cancelAction: () => {
            setShowDialog(false);
            setContentDialog(null);
          },
          defaultText: "Xóa",
          defaultAction: async () => {

        if (listIdChecked.length>0) {
          onDeleteAll();
          return;
        }
            const response = await ContractPaymentService.delete(item.id);
            if (response.code === 0) {
                showToast("Xóa kỳ thanh toán thành công", "success");
                getListPaymentProgress(params)
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

    const bulkActionList: BulkActionItemModel[] = [
              permissions["CONTRACT_DELETE"] == 1 && {
                title: "Xóa tiến độ thanh toán",
                callback: () => showDialogConfirmDelete(),
              },
            ];

    return (
        <div className="payment-progress">
            <div style={{marginRight: '2rem', display:'flex', justifyContent:'flex-end', marginTop: -40}}>
                <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick = {() => {
                        setDataPaymentProgress(null);
                        setIsAddPaymentProgress(true)
                    }}
                >
                    Thêm kỳ thanh toán
                </Button>
            </div>
            <div>
                <SearchBox
                    name="Kỳ thanh toán"
                    params={params}
                    // isSaveSearch={true}
                    // listSaveSearch={listSaveSearch}
                    updateParams={(paramsNew) => setParams(paramsNew)}
                />
                <div style={{padding: '2rem'}}>
                    {!isLoading && paymentProgressList && paymentProgressList.length > 0 ? (
                        <BoxTable
                            name="Tiến độ thanh toán"
                            titles={titles}
                            items={paymentProgressList}
                            isPagination={true}
                            dataPagination={pagination}
                            dataMappingArray={(item, index) => dataMappingArray(item, index)}
                            dataFormat={dataFormat}
                            listIdChecked={listIdChecked}
                            isBulkAction={true}
                            bulkActionItems={bulkActionList}
                            striped={true}
                            setListIdChecked={(listId) => setListIdChecked(listId)}
                            actions={actionsTable}
                            actionType="inline"
                        />
                        ) : isLoading ? (
                        <Loading />
                        ) : (
                        <SystemNotification description={<span>Hiện tại chưa có kỳ thanh toán nào.</span>} type="no-item" />
                    )}
                </div>
            </div>

            <Dialog content={contentDialog} isOpen={showDialog} />
            <AddPaymentProgressModal
                onShow={isAddPaymentProgress}
                data={dataPaymentProgress}
                contractId={contractId}
                onHide={(reload) => {
                    if (reload) {
                        getListPaymentProgress(params);
                        setDataPaymentProgress(null);
                    }
                    setIsAddPaymentProgress(false);
                }}
            />
            <AddCashBookModal
                onShow={isModalCashBook}
                dataContract={dataContract}
                dataCashBook={null}
                dataContractPayment={dataPaymentProgress}
                type={1}
                onHide={(reload) => {
                if (reload) {
                    getListPaymentProgress(params);
                    setDataPaymentProgress(null);
                }
                    setIsModalCashBook(false);
                }}
            />
        </div>
    );
}
