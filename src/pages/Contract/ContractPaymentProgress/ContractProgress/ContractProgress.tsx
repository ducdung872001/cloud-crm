import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, getPageOffset, getSearchParameters, isDifferenceObj } from "reborn-util";
import { showToast } from "utils/common";
import "./ContractProgress.scss";
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
import Badge from "components/badge/badge";
import AddContractProgressModal from "./partials/AddContractProgressModal";
import ContractProgressService from "services/ContractProgressService";
import { getPermissions } from "utils/common";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";

export default function ContractProgress (props: any) {
  const { contractId } = props;
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressList, setProgressList] = useState([]);
  const [isAddProgress, setIsAddProgress] = useState(false);
  const [dataProgress, setDataProgress] = useState(null);
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
        name: "giai đoạn",
        isChooseSizeLimit: true,
        setPage: (page) => {
            setParams((prevParams) => ({ ...prevParams, page: page }));
        },
        chooseSizeLimit: (limit) => {
            setParams((prevParams) => ({ ...prevParams, limit: limit }));
        },
    });

    const getListProgress = async (paramsSearch: any) => {
        setIsLoading(true);

        const response = await ContractProgressService.list(paramsSearch);

        if (response.code == 0) {
            const result = response.result;
            setProgressList(result.items);

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
        getListProgress(params)
    }, [params])

    const titles = ["STT","Giai đoạn", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái"];
    const dataFormat = ["text-center", "", "text-center", "text-center", ""];

    const dataMappingArray = (item: any, index: number) => [
        getPageOffset(params) + index + 1,
        item.term,
        item.startDate ? moment(item.startDate).format('DD/MM/YYYY') : '',
        item.endDate ? moment(item.endDate).format('DD/MM/YYYY') : '',
        item.status
        // <Badge
        //     key={index}
        //     variant={item.status === 1 ? "success" : item.status === 0 ? "warning" : item.status === 2 ? "error" : "transparent"}
        //     text={item.status === 1 ? "Đã thanh toán" : item.status === 0 ? "Chưa thanh toán" : item.status === 2 ? "Còn nợ" : ""}
        // />,
    ];

    const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
        
        return [
                {
                    title: "Sửa",
                    icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
                    callback: () => {
                        setDataProgress(item);
                        setIsAddProgress(true);
                    },
                },
                {
                    title: "Xóa",
                    icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
                    callback: () => {
                        showDialogConfirmDelete(item);
                    },
                },
            
        ];
    };

    const onDeleteAll = () => {
              const selectedIds = listIdChecked || [];
              if (!selectedIds.length) return;
          
              const arrPromises = selectedIds.map((selectedId) => {
                const found = progressList.find((item) => item.id === selectedId);
                if (found?.id) {
                  return ContractProgressService.delete(found.id);
                } else {
                  return Promise.resolve(null);
                }
              });
              Promise.all(arrPromises)
              .then((results) => {
                const checkbox = results.filter (Boolean)?.length ||0;
                if (checkbox > 0) {
                  showToast(`Xóa thành công ${checkbox} giai đoạn`, "success");
                  getListProgress(params);
                  setListIdChecked([]);
                } else {
                  showToast("Không có giai đoạn nào được xóa", "error");
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
              Bạn có chắc chắn muốn xóa giai đoạn đã chọn
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
            const response = await ContractProgressService.delete(item.id);
            if (response.code === 0) {
                showToast("Xóa giai đoạn thành công", "success");
                getListProgress(params)
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
                title: "Xóa giai đoạn",
                callback: () => showDialogConfirmDelete(),
              },
            ];

    return (
        <div className="contract-progress">
            <div style={{marginRight: '2rem', display:'flex', justifyContent:'flex-end', marginTop: -40}}>
                <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick = {() => {
                        setDataProgress(null);
                        setIsAddProgress(true)
                    }}
                >
                    Thêm giai đoạn
                </Button>
            </div>
            <div>
                <SearchBox
                    name="Giai đoạn"
                    params={params}
                    // isSaveSearch={true}
                    // listSaveSearch={listSaveSearch}
                    updateParams={(paramsNew) => setParams(paramsNew)}
                />
                <div style={{padding: '2rem'}}>
                    {!isLoading && progressList && progressList.length > 0 ? (
                        <BoxTable
                            name="Giai đoạn"
                            titles={titles}
                            items={progressList}
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
                        <SystemNotification description={<span>Hiện tại chưa có giai đoạn nào.</span>} type="no-item" />
                    )}
                </div>
            </div>

            <Dialog content={contentDialog} isOpen={showDialog} />
            <AddContractProgressModal
                onShow={isAddProgress}
                data={dataProgress}
                contractId={contractId}
                onHide={(reload) => {
                    if (reload) {
                        getListProgress(params);
                        setDataProgress(null);
                    }
                    setIsAddProgress(false);
                }}
            />
        </div>
    );
}
