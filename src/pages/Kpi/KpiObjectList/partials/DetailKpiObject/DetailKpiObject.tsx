import React, { Fragment, memo, useEffect, useState } from "react";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { formatCurrency } from "reborn-util";
import { CircularProgressbar } from "react-circular-progressbar";
import Icon from "components/icon";
import Loading from "components/loading";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import { ICampaignResponseModel } from "model/campaign/CampaignResponseModel";
import { IDetailManagementOpportunityProps } from "model/campaignOpportunity/PropsModel";
import { ICampaignOpportunityResponseModel } from "model/campaignOpportunity/CampaignOpportunityResponseModel";
import CampaignService from "services/CampaignService";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import "tippy.js/animations/scale-extreme.css";
import "./DetailKpiObject.scss";
import ContentExchange from "./partials/ContentExchange/ContentExchange";
import EmployeeService from "services/EmployeeService";
import KpiObjectService from "services/KpiObjectService";
import KpiDiagram from "./partials/KpiDiagram/KpiDiagram";
import SelectCustom from "components/selectCustom/selectCustom";

function DetailKpiObject(props: any) {
  const { idData, onShow, onHide, dataKpi } = props;

  const [dataEmployee, setDataEmployee] = useState(null);

  // lấy thông tin nhân viên
  const takeDataEmployee = async () => {
    const response = await EmployeeService.info();

    if (response.code === 0) {
      const result = response.result;
      setDataEmployee(result);
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState(null);
  const [detailKpiEmployee, setDetailKpiEmployee] = useState(null);
  const [listKpiEmployee, setListKpiEmployee] = useState(null);
  
  const [showModalEdit, setShowModalEdit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [dataStep, setDataStep] = useState(null);
  const [valueKpi, setValueKpi] = useState(
    {
      value: 1,
      label: 'Bộ chỉ tiêu KPI năm 2024'
    }
  )
  const [typeView, setTypeView] = useState(1);
  const [typeGoal, setTypeGoal] = useState(1);

  const dataView  = [
    {
      value: 1,
      label: 'Sơ đồ'
    },
    {
      value: 2,
      label: 'Diễn giải'
    }
  ]

  const listGoal = [
    {
      value: 1,
      title: "Tài chính",
    },
    {
      value: 2,
      title: "Khách hàng",
    },
   
  ];

  const dataFinance = [
    {
      value: 1,
      label: 'Doanh thu trong',
      data: [
        {
          label:'Doanh thu thực hiện',
          value: '50.000.000'
        },
        {
          label:'Doanh thu ước',
          value: '150.000.000'
        }
      ]
    },
    {
      value: 2,
      label: 'Doanh thu ngoài',
      data: [
        {
          label:'Doanh thu thực hiện',
          value: '70.000.000'
        },
        {
          label:'Doanh thu ước',
          value: '30.000.000'
        }
      ]
    },
    {
      value: 3,
      label: 'Doanh thu thực hiện',
      data: [
        {
          label:'Doanh thu trong',
          value: '30.000.000'
        },
        {
          label:'Doanh thu ngoài',
          value: '20.000.000'
        }
      ]
    },
    {
      value: 4,
      label: 'Doanh thu ước',
      data: [
        {
          label:'Doanh thu trong',
          value: '50.000.000'
        },
        {
          label:'Doanh thu ngoài',
          value: '50.000.000'
        }
      ]
    },
  ]

  const dataCustomer = [
    {
      value: 1,
      label: 'Khách hàng trong',
      data: [
        {
          label:'Khách hàng mới',
          value: '500'
        },
        {
          label:'Khách hàng bán lại',
          value: '1.500'
        }
      ]
    },
    {
      value: 2,
      label: 'Khách hàng ngoài',
      data: [
        {
          label:'Khách hàng mới',
          value: '500'
        },
        {
          label:'Khách hàng bán lại',
          value: '500'
        }
      ]
    },
    {
      value: 3,
      label: 'Khách hàng mới',
      data: [
        {
          label:'Khách hàng trong',
          value: '500'
        },
        {
          label:'Khách hàng ngoài',
          value: '500'
        }
      ]
    },
    {
      value: 4,
      label: 'Khách hàng bán lại',
      data: [
        {
          label:'Khách hàng trong',
          value: '300'
        },
        {
          label:'Khách hàng ngoài',
          value: '200'
        }
      ]
    },
  ]

  const getDetailKpiObject = async () => {
    setIsLoading(true);

    const response = await KpiObjectService.detail(idData);
    
    if (response.code === 0) {
      const result = response.result;
      setDataDetail(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  const getDetailKpiEmployee = async (dataKpi) => {
    const params = {
      kotId: dataKpi.id,
      employeeId: dataKpi.receiverId
    }

    const response = await KpiObjectService.detailKpiEmployee(params);
    
    if (response.code === 0) {
      const result = response.result;
      setDetailKpiEmployee(result.kpi);
      setListKpiEmployee(result.result)
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

  };

  useEffect(() => {
    if (idData && onShow) {
      takeDataEmployee();
      getDetailKpiObject();
      getDetailKpiEmployee(dataKpi);
    }
  }, [onShow, idData]);

 

  const notData = "...............................";

//   const checkCls =
//     dataDetail?.status == 1
//       ? "status status-processing"
//       : dataDetail?.status == 2
//       ? "status status-success"
//       : dataDetail?.status == 3
//       ? "status status-cancelled"
//       : dataDetail?.status == 4
//       ? "status status-failure"
//       : "status status-not-started-yet";

//   const checkNameStatus =
//     dataDetail?.status == 1
//       ? "Đang sử lý"
//       : dataDetail?.status == 2
//       ? "Thành công"
//       : dataDetail?.status == 3
//       ? "Đã hủy"
//       : dataDetail?.status == 4
//       ? "Thất bại"
//       : "Chưa bắt đầu";



  const onDelete = async (id: number) => {
    const response = await KpiObjectService.delete(id);

    if (response.code === 0) {
      showToast("Xóa cơ hội thành công", "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
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
          Bạn có chắc chắn muốn xóa cơ hội của chiến dịch
          {item ? <strong> {item.campaignName}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };



  return (
    <div className="detail__item_kpi">
      {!isLoading && dataDetail ? (
        // <div className="card-box d-flex align-items-start box__item">
        <div>
          <div style={{display:'flex', marginTop: '1.2rem', marginBottom: '1.2rem', justifyContent:'space-between' }}>
            <div style={{ width: "30rem"}}>
              <SelectCustom
                id="kpiId"
                name="kpiId"
                fill={true}
                required={true}
                special={true}
                options={[
                  {
                    value: 1,
                    label: 'Bộ chỉ tiêu KPI năm 2024'
                  },
                  {
                    value: 2,
                    label: 'Bộ chỉ tiêu chiến dịch'
                  }
                ]}
                value={valueKpi}
                // onChange={(e) => handleChangeValueCampaign(e)}
                // isAsyncPaginate={true}
                placeholder="Chọn bộ chỉ tiêu"
                // additional={{
                //   page: 1,
                // }}
                // loadOptionsPaginate={loadOptionCampaign}
              />
            </div>
            <div className="button_view">
              {dataView.map((item, index) => (
                <div 
                  key={index}
                  className="item_button"
                  style={item.value === typeView ? {backgroundColor: '#10519f', color:'white'} : {}}
                  onClick={() => {
                    setTypeView(item.value)
                  }}
                >
                  <span style={{fontSize: 14, fontWeight:'400'}}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="box_kpi_diagram">
            {/* {typeView === 1 && */}
              <div className={typeView === 1 ? "" : 'd-none'}>
                <KpiDiagram 
                  listKpiEmployee={listKpiEmployee}
                  detailKpiEmployee={detailKpiEmployee}
                />
              </div>
            {/* } */}

            {typeView === 2 &&
              <div className="card-box d-flex align-items-start box__item">
                <div className="box__item--left">
                  <div className="info__basic">
                    <div className="info__basic--header">
                      <h3 className="title-basic">Danh sách chỉ tiêu</h3>

                      {/* <div className="actions">
                        <div className="btn-update" onClick={() => setShowModalEdit(true)}>
                          <Tippy content="Sửa" delay={[100, 0]} animation="scale-extreme">
                            <span>
                              <Icon name="Pencil" />
                            </span>
                          </Tippy>
                        </div>
                        <div className="btn-delete" onClick={() => showDialogConfirmDelete(dataDetail)}>
                          <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                            <span>
                              <Icon name="Trash" />
                            </span>
                          </Tippy>
                        </div>
                      </div> */}
                    </div>
                    
                      {listGoal.map((item, index) => (
                        <div 
                          key={index}
                          className="info__basic--body"
                          style={item.value === typeGoal ? {backgroundColor:'var(--extra-color-20)'} : {}}
                          onClick={() => {
                            setTypeGoal(item.value)
                          }}
                        >
                          <div className="list__info">
                            <span style={{fontSize: 14, fontWeight:'500'}}>{item.title}</span>
                          </div>
                        </div>
                      ))}
                    
                  </div>  
                </div>
                <div className="box__item--right">
                  {typeGoal === 1 ? 
                    <div>
                      {dataFinance && dataFinance.map((item,index) => (
                        <div className="box_goal" key={index}>
                          <div>
                            <span style={{fontSize: 16, fontWeight: '500'}}>{item.label}</span>
                          </div>
                          <div className="box_attribute">
                            {item.data.map((el, idx) => (
                              <div className="item_attribute" key={idx}>
                                <div className="title_attribute">
                                  <span style={{fontSize: 14, fontWeight:'400'}}>{el.label}</span>
                                </div>
                                <div>
                                  <span style={{fontSize: 14, fontWeight:'400'}}>: {el.value}</span>
                                </div>
                              </div>
                            ))}
                            
                          </div>
                        </div>
                      ))}
                    </div>
                  : null}

                  {typeGoal === 2 ? 
                    <div>
                      {dataCustomer && dataCustomer.map((item,index) => (
                        <div className="box_goal" key={index}>
                          <div>
                            <span style={{fontSize: 16, fontWeight: '500'}}>{item.label}</span>
                          </div>
                          <div className="box_attribute">
                            {item.data.map((el, idx) => (
                              <div className="item_attribute" key={idx}>
                                <div className="title_attribute">
                                  <span style={{fontSize: 14, fontWeight:'400'}}>{el.label}</span>
                                </div>
                                <div>
                                  <span style={{fontSize: 14, fontWeight:'400'}}>: {el.value}</span>
                                </div>
                              </div>
                            ))}
                            
                          </div>
                        </div>
                      ))}
                    </div>
                  : null}
                  
                </div>
              </div>
            }
          </div>
        </div>
      ) : (
        <Loading />
      )}
      
      
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

export default memo(DetailKpiObject);
