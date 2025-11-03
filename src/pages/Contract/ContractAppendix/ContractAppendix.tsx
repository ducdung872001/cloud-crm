import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, getPageOffset, getSearchParameters, isDifferenceObj } from "reborn-util";
import { showToast } from "utils/common";
import ContractService from "services/ContractService";
import "./ContractAppendix.scss";
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
import ModalAddAppendix from "./patials/ModalAddAppendix";


export default function ContractAppendix (props: any) {
  const { contractId, detailContract } = props;
 
  const navigate = useNavigate();
  const [showDialogAppendix, setShowDialogAppendix] = useState<boolean>(false);
  const [contentDialogAppendix, setContentDialogAppendix] = useState<IContentDialog>(null);
  const [isLoadingAppendix, setIsLoadingAppendix] = useState<boolean>(false);
  const [listContractAppendix, setListContractAppendix] = useState([]);
  const [isAddAppendixModal, setIsAddAppendixModal] = useState(false);
  const [dataContractAppendix, setDataContractAppendix] = useState(null);

  const [paramsAppendix, setParamsAppendix] = useState({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    if(contractId){
        setParamsAppendix((preState) => ({...preState, contractId: contractId}))
    }
  }, [contractId])

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "báo giá",
    isChooseSizeLimit: true,
    setPage: (page) => {
        setParamsAppendix((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParamsAppendix((prevParams) => ({ ...prevParams, limit: limit }));
    },
});

  const getListContractAppendix = async (paramsSearch: any) => {
    setIsLoadingAppendix(true);

    const response = await ContractService.contractAppendixList(paramsSearch);

    if (response.code == 0) {
        const result = response.result;
        setListContractAppendix(result.items);

        setPagination({
            ...pagination,
            page: +result.page,
            sizeLimit: paramsAppendix.limit ?? DataPaginationDefault.sizeLimit,
            totalItem: +result.total,
            totalPage: Math.ceil(+result.total / +(paramsAppendix.limit ?? DataPaginationDefault.sizeLimit)),
        });

    
    } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoadingAppendix(false);
};

    useEffect(() => {
        getListContractAppendix(paramsAppendix)
    }, [paramsAppendix])

    const titlesAppendx = ["STT","Tên phụ lục", "Số phụ lục", "Ngày hiệu lực"];
    const dataFormatAppendix = [ "text-center", "", "", "text-center"];

    const dataMappingArray = (item: any, index: number) => [
        getPageOffset(paramsAppendix) + index + 1,
        item.name,
        item.appendixNo,
        item.affectedDate ? moment(item.affectedDate).format('DD/MM/YYYY') : '',
    ];

    const actionsTable = (item: any): IAction[] => {
        
        return [
            {
                title: "Sửa",
                icon: <Icon name="Pencil" />,
                callback: () => {
                    setDataContractAppendix(item);
                    setIsAddAppendixModal(true);
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
              Bạn có chắc chắn muốn xóa mốc thanh toán đã chọn
              {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
            </Fragment>
          ),
          cancelText: "Hủy",
          cancelAction: () => {
            setShowDialogAppendix(false);
            setContentDialogAppendix(null);
          },
          defaultText: "Xóa",
          defaultAction: async () => {
            const response = await ContractService.contractAppendixDelete(item.id);
            if (response.code === 0) {
                showToast("Xóa tài liệu thành công", "success");
                getListContractAppendix(paramsAppendix)
            } else {
                showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
            }
                setShowDialogAppendix(false);
                setContentDialogAppendix(null);
          },
        };
        setContentDialogAppendix(contentDialog);
        setShowDialogAppendix(true);
    };

    return (
        <div className="card-box wrapper__info--appendix">
        
            <div className="action-header-appendix">
                <div className="title__actions">
                    <ul className="menu-list">
                        <li
                            className={ "active"}
                            onClick={(e) => { }}
                            >
                            {'Danh sách phụ lục hợp đồng'}
                        </li>
                    </ul>
                    <div style={{marginRight: '2rem'}}>
                        <Button
                            // type="submit"
                            color="primary"
                            // disabled={}
                            onClick = {() => {
                                setDataContractAppendix(null);
                                setIsAddAppendixModal(true)
                            }}
                        >
                            Thêm phụ lục
                        </Button>
                    </div>
                </div>
                <SearchBox
                    name="Tên phụ lục hợp đồng"
                    params={paramsAppendix}
                    // isSaveSearch={true}
                    // listSaveSearch={listSaveSearch}
                    updateParams={(paramsNew) => setParamsAppendix(paramsNew)}
                />
            </div>
            <div style={{padding: '2rem'}}>
                {!isLoadingAppendix && listContractAppendix && listContractAppendix.length > 0 ? (

                    <BoxTable
                        name="Danh sách báo giá"
                        titles={titlesAppendx}
                        items={listContractAppendix}
                        isPagination={true}
                        dataPagination={pagination}
                        dataMappingArray={(item, index) => dataMappingArray(item, index)}
                        dataFormat={dataFormatAppendix}
                        // listIdChecked={listIdChecked}
                        isBulkAction={true}
                        // bulkActionItems={bulkActionList}
                        striped={true}
                        // setListIdChecked={(listId) => setListIdChecked(listId)}
                        actions={actionsTable}
                        actionType="inline"
                    />
                    ) : isLoadingAppendix ? (
                    <Loading />
                    ) : (
                    <SystemNotification description={<span>Hiện tại chưa có phụ lục nào.</span>} type="no-item" />
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
            <Dialog content={contentDialogAppendix} isOpen={showDialogAppendix} />
            <ModalAddAppendix
                onShow={isAddAppendixModal}
                data={dataContractAppendix}
                contractId={contractId}
                onHide={(reload) => {
                    if (reload) {
                        getListContractAppendix(paramsAppendix);
                        setDataContractAppendix(null);
                    }
                    setIsAddAppendixModal(false);
                    setDataContractAppendix(null);
                }}
            />
        </div>
    );
}
