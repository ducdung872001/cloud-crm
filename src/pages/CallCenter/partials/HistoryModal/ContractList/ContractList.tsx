import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { handDownloadFileOrigin, showToast } from "utils/common";
import "./ContractList.scss";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { formatCurrency, getPageOffset } from "reborn-util";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Badge from "components/badge/badge";
import { IContractFilterRequest } from "model/contract/ContractRequestModel";
import ContractService from "services/ContractService";
import { IAction } from "model/OtherModel";

export default function ContractList(props: any) {
    const { dataCustomer,} = props;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [contratList, setContractList] = useState([]);
    const [isNoItemCall, setIsNoItemCall] = useState<boolean>(false);

    const [params, setParamsCall] = useState<IContractFilterRequest>({
      name: "",
    });

    const [pagination, setPagination] = useState<PaginationProps>({
      ...DataPaginationDefault,
      name: "hợp đồng",
      isChooseSizeLimit: true,
      setPage: (page) => {
        setParamsCall((prevParams) => ({ ...prevParams, page: page }));
      },
      chooseSizeLimit: (limit) => {
        setParamsCall((prevParams) => ({ ...prevParams, limit: limit }));
      },
    });

    const getListContract = async (paramsSearch: any, customerId: number) => {
      const param = {
        ...paramsSearch,
        customerId: customerId
      }

      setIsLoading(true);
  
      const response = await ContractService.list(param);
  
      if (response.code === 0) {
        const result = response.result;
        setContractList(result.items);
  
        setPagination({
          ...pagination,
          page: +result.page,
          sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
        });
        if (+result.total === 0 && params.name !== "" && +params.page === 1) {
          setIsNoItemCall(true);
        }
      } else if (response.code == 400) {
        // setIsPermissions(true);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setIsLoading(false);
    };

    
    useEffect(() => {
      if(dataCustomer){
        getListContract(params, dataCustomer?.id)
      }

    }, [ params, dataCustomer])

    const getStatus = (code: number) => {
        switch (code) {
          case 0:
            return "Chưa phê duyệt";
          case 1:
            return "Đang phê duyệt";
          case 2:
            return "Đang thực hiện";
          case 3:
            return "Đóng hợp đồng";
          case 4:
            return "Lưu trữ (Thất bại)";
          case 5:
            return "Lưu trữ (Thành công)";
          default:
            return "Chưa phê duyệt";
        }
      };
  
      const getStatusColor = (code: number) => {
        switch (code) {
          case 0:
            return "secondary";
          case 1:
            return "primary";
          case 2:
            return "primary";
          case 3:
            return "error";
          case 4:
            return "warning";
          case 5:
            return "warning";
          default:
            return "secondary";
        }
      };

    const titlesCall = ["STT", "Tên hợp đồng", "Giá trị hợp đồng", "Pha hợp đồng", "Tên công ty", "Trạng thái ký", "Trạng thái hợp đồng"];
    const dataFormatCall = ["text-center", "", "", "", "    ", "", ""];

    const dataMappingArray = (item: any, index: number) => [
      getPageOffset(params) + index + 1,
      item.name,
      item.dealValue == null ? null : item.dealValue == 0 ? "0đ" : formatCurrency(+item.dealValue, ","),
      item.approachName,
      item.customerName || item.businessPartnerName,
      <Badge
        key={item.id}
        text={!item.status ? "Chưa trình ký" : item.status === 1 ? "Đã trình ký" : item.status === 2 ? "Đã phê duyệt" : item.status === 3 ? "Từ chối phê duyệt" : item.status === 4 ? "Tạm dưng luồng ký" : ''}
        variant={!item.status ? "secondary" : item.status === 1 ? "primary" : item.status === 2 ? "success" : item.status === 3 ? "error" : "warning"}
      />,
      <Badge
        key={item.id}
        text={getStatus(item.contractStatus)}
        variant={getStatusColor(item.contractStatus)}
      />,
    ];

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



  return (
    <div className="contract-list">
        {!isLoading && contratList && contratList.length > 0 ? (
            <BoxTable
                name="Danh sách hợp đồng"
                titles={titlesCall}
                items={contratList}
                isPagination={true}
                dataPagination={pagination}
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
            <SystemNotification description={<span>Hiện tại chưa có hợp đồng nào.</span>} type="no-item" />
        )}
            
    </div>
  );
}
