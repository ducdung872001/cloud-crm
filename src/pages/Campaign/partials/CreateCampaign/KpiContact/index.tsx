import React, { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPermissions, showToast } from "utils/common";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { ContextType, UserContext } from "contexts/userContext";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import "./index.scss";
import Icon from "components/icon";
import { IAction, IActionModal } from "model/OtherModel";
import Button from "components/button/button";
import { getPageOffset } from "reborn-util";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import BoxTable from "components/boxTable/boxTable";
import KpiService from "services/KpiService";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import ModalConfigContactGoal from "../ModalConfigContactGoal";


export default function KpiContact(props) {
  const { campaignId } = props;  

  const navigate = useNavigate();

  const focusedElement = useActiveElement();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoadingEmployeeContactGoal, setIsLoadingEmployeeContactGoal] = useState(false);
  const [showModalContactGoal, setShowModalContactGoal] = useState(false);
  const [dataEmployeeContactGoal, setDataEmployeeContactGoal] = useState([]);
  const [kpiEmployeeData, setKpiEmployeeData] = useState(null);
  console.log("kpiEmployeeData", kpiEmployeeData);
  const [paramsKpi, setParamsKpi] = useState({
    name: "",
    campaignId: null,
    page:1,
    limit: 10
  });

  useEffect(() => {
    if(campaignId){
        setParamsKpi((preState) => ({...preState, campaignId: campaignId}));
    }
  }, [campaignId])


  //lấy danh sách kpi của nhân viên
  const getListEmployeeKpiContact = async (paramsKpi: any) => {
    
    setIsLoadingEmployeeContactGoal(true);

    const response = await KpiService.listEmployeeKpiContact(paramsKpi);
    // console.log('response', response);

    if (response.code == 0) {
      const result = response.result;
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: paramsKpi.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(paramsKpi.limit ?? DataPaginationDefault.sizeLimit)),
      });
    
      setDataEmployeeContactGoal(result.items);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoadingEmployeeContactGoal(false);
  };

  useEffect(() => {
    if(paramsKpi?.campaignId){
        getListEmployeeKpiContact(paramsKpi);
    }
  }, [paramsKpi])
  

  
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "nhân viên",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParamsKpi((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParamsKpi((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });


  const titles = ["STT", "Tên nhân viên", "Phòng ban", "Chi nhánh", "Chỉ tiêu tương tác"];

  const dataFormat = ["text-center", "", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number, type) => [
    getPageOffset(paramsKpi) + index + 1,
    item.name,
    item.departmentName,
    item.branchName,
    <a
        key={item.id}
        onClick={(e) => {
            setShowModalContactGoal(true);
            setKpiEmployeeData(item);
        }}
    >
        Xem chi tiết
    </a>,
  ];

  const actionsTable = (item: any): IAction[] => {
    console.log("item", item);

    return [
      //   {
      //     title: "Sửa",
      //     icon: <Icon name="Pencil" />,
      //     callback: () => {
      //         setShowModalConfigKpi(true);
      //         setKpiEmployeeData(item);
      //     },
      //   },
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
          Bạn có chắc chắn muốn xóa nhân viên đã chọn
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
        const response = await KpiService.deleteEmployeeKpiContact(item.id, campaignId);
        if (response.code === 0) {
          showToast("Xóa nhân viên thành công", "success");
          getListEmployeeKpiContact(paramsKpi);
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
    <div>
        <div style={{ justifyContent: "flex-end", display: "flex" }}>
            <Button
            onClick={(e) => {
                setShowModalContactGoal(true);
            }}
            >
            Thêm nhân viên
            </Button>
        </div>

        {!isLoadingEmployeeContactGoal && dataEmployeeContactGoal && dataEmployeeContactGoal.length > 0 ? (
            <BoxTable
                name=""
                // className="table__document"
                titles={titles}
                items={dataEmployeeContactGoal}
                isPagination={true}
                dataPagination={pagination}
                dataMappingArray={(item, index) => dataMappingArray(item, index, 'contact')}
                dataFormat={dataFormat}
                // listIdChecked={listIdChecked}
                isBulkAction={true}
                // bulkActionItems={bulkActionList}
                striped={true}
                // setListIdChecked={(listId) => setListIdChecked(listId)}
                actions={actionsTable}
                actionType="inline"
            />
            ) : isLoadingEmployeeContactGoal ? (
                <Loading />
            ) : (
                <SystemNotification
                    description={
                        <span>
                        Hiện tại chưa có nhân viên nào. <br />
                        Hãy thêm mới nhân viên đầu tiên nhé!
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
        )}
        <ModalConfigContactGoal
            onShow={showModalContactGoal}
            data={kpiEmployeeData}
            campaignId={campaignId}
            onHide={(reload) => {
                if (reload) {
                  setTimeout(() => {
                    getListEmployeeKpiContact(paramsKpi);
                  }, 1000)
                } 
                setShowModalContactGoal(false);
                setKpiEmployeeData(null);
            }}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
