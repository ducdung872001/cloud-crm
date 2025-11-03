import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Loading from "components/loading";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import CampaignService from "services/CampaignService";
import "./DetailCampaign.scss";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import DetailEmployeeModal from "./partials/DetailEmployeeModal/DetailEmployeeModal";
import SelectCustom from "components/selectCustom/selectCustom";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";
import Tippy from "@tippyjs/react";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { ISaveSearch } from "model/OtherModel";
import { formatCurrency, getPageOffset } from "reborn-util";
import KpiDiagram from "./partials/KpiDiagram/KpiDiagram";

function DetailCampaign(props: any) {
  const { idCampaign, onShow } = props;

  const colorData = [
    "#E98E4C",
    "#ED6665",
    "#FFBF00",
    "#9966CC",
    "#6A5ACD",
    "#FFFFFF",
    "#007FFF",
    "#993300",
    "#F0DC82",
    "#CC5500",
    "#C41E3A",
    "#ACE1AF",
    "#7FFF00",
    "#FF7F50",
    "#BEBEBE",
    "#FF00FF",
    "#C3CDE6",
    "#FFFF00",
    "#40826D",
    "#704214",
  ];

  const tabData = [
    // {
    //   value: 1,
    //   name: "Hiệu quả bán hàng",
    // },
    // {
    //   value: 2,
    //   name: "Phân bổ/Thu hồi cơ hội",
    // },
    // {
    //   value: 3,
    //   name: "Vinh danh bán hàng",
    // },
    // {
    //   value: 4,
    //   name: "Nguồn khách hàng",
    // },
    {
      value: 1,
      name: "Báo cáo tổng quan chiến dịch",
    },
    {
      value: 2,
      name: "Báo cáo hiệu suất nhân viên",
    },
  ];

  

  const [tabStep, setTabStep] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState(null);

  //   console.log("approachData", approachData);

  const [approachName, setApproachName] = useState([]);
  const [formatApproach, setFormatApproach] = useState([]);

  const [saleData, setSaleData] = useState([]);
  //   console.log("saleData", saleData);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const [showModalDetailEmployee, setShowModalDetailEmployee] = useState<boolean>(false);
  const [employeeDetail, setEmployeeDetail] = useState(null);

  const getDetailManagementOpportunity = async () => {
    setIsLoading(true);

    const response = await CampaignService.detail(idCampaign);
    // console.log('response', response);

    if (response.code === 0) {
      const result = response.result;
      const approach = result?.approach ? JSON.parse(result?.approach) : [];
      const sales = result?.approach ? JSON.parse(result?.sales) : [];
      // if (approach && approach.length > 0) {
      //   const approachName = [];
      //   const format = [];
      //   approach.map((item) => {
      //     approachName.push(item.name);
      //     format.push("text-center");
      //   });
      //   setApproachName(approachName);
      //   setFormatApproach(format);
      // }
      // if (sales && sales.length > 0) {
      //   const salesData = sales.map((item) => {
      //     return {
      //       employeeName: item.employeeName,
      //       method1: "100/80",
      //       method2: "90/80",
      //       method3: "85/60",
      //       method4: "70/40",
      //       method5: "50/20",
      //     };
      //   });
      //   setSaleData(salesData);
      // }
      setDataDetail(result);
      // setApproachData(result?.approach ? JSON.parse(result?.approach) : []);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  const getStatisticConvertRate = async () => {
    const response = await CampaignService.statisticConvertRate({ campaignId: idCampaign });
    // console.log('response', response);

    if (response.code === 0) {
      const result = response.result;
      const approach = result?.approaches || [];
      const sales = result?.data || [];
      if (approach && approach.length > 0) {
        const approachName = [];
        const format = [];
        approach.map((item) => {
          approachName.push(item.name);
          format.push("text-center");
        });
        setApproachName(approachName);
        setFormatApproach(format);
      }
      if (sales && sales.length > 0 && sales[0] !== null ) {
        const salesData = sales.map((item) => {
          const rateData = item.opportunityRates?.map((el) => {
            return el.rate;
          });

          return {
            employeeName: item.name,
            rateData: rateData,
          };
        });
        setSaleData(salesData);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //Tỉ lệ chuyển đổi qua từng phương pháp
  const [approachData, setApproachData] = useState([]);
  const getlManagementstatisticApproach = async () => {
    const response = await CampaignService.statisticApproach({ campaignId: idCampaign });
    if (response.code === 0) {
      const result = response.result;

      let newArray = [];
      let sum = 0;
      if (result && result.length > 0) {
        result.map((item) => {
          sum += item.numOpportunity;
          newArray.push({
            name: item.name,
            numOpportunity: item.numOpportunity,
          });
        });
      }

      const approachData = [];
      if (newArray.length > 0) {
        newArray.map((item, index) => {
          approachData.push({
            name: item.name,
            y: +((item.numOpportunity / sum) * 100).toFixed(2) || 0,
            color: colorData[index],
          });
        });
      }

      setApproachData(approachData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //Tỉ lệ phân bổ cơ hội bán hàng cho từng nhân viên
  const [employeeData, setEmployeeData] = useState([]);

  const getlManagementstatisticSale = async () => {
    const response = await CampaignService.statisticSale({ campaignId: idCampaign });
    if (response.code === 0) {
      const result = response.result;

      let newArray = [];
      let sum = 0;
      if (result && result.length > 0) {
        result.map((item) => {
          sum += item.numOpportunity;
          newArray.push({
            name: item.name,
            numOpportunity: item.numOpportunity,
          });
        });
      }

      const approachData = [];
      if (newArray.length > 0) {
        newArray.map((item, index) => {
          approachData.push({
            name: item.name,
            count: +((item.numOpportunity / sum) * 100).toFixed(2) || 0,
          });
        });
      }

      setEmployeeData(approachData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (idCampaign && onShow) {
      getStatisticConvertRate();
      getDetailManagementOpportunity();
      getlManagementstatisticApproach();
      getlManagementstatisticSale();
      getListTopSale();
    }
  }, [onShow, idCampaign]);

  const titles = ["STT", "Nhân viên", ...approachName];

  const dataFormat = ["text-center", "", ...formatApproach];

  const dataMappingArray = (item: any, index: number) => [
    index + 1,
    <span
      key={index}
      className="employee_name"
      onClick={() => {
        setShowModalDetailEmployee(true);
        setEmployeeDetail(item);
      }}
    >
      {item.employeeName}
    </span>,
    ...item.rateData,
  ];

  // đoạn này là biểu đồ tỉ lệ chuyển đổi qua từng phương pháp
  const chartDataApproach = {
    chart: {
      type: "bar",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    accessibility: {
      announceNewData: {
        enabled: true,
      },
    },
    xAxis: {
      type: "category",
    },
    yAxis: {
      title: {
        text: "",
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      column: {
        colorByPoint: true,
      },
      series: {
        borderWidth: 0.3,
        dataLabels: {
          enabled: true,
          format: "{point.y:.1f}%",
          style: {
            fontWeight: "bold",
          },
        },
      },
    },

    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b>',
    },

    series: [
      {
        name: "",
        colorByPoint: true,
        data: approachData,
      },
    ],
  };

  const ageData = [
    { range: "Chưa phân bổ", count: 80 },
    { range: "Phan Đức Dũng", count: 50 },
    { range: "Nguyễn Thanh Tùng", count: 35 },
    { range: "Nguyễn Ngọc Trung", count: 70 },
  ];

  // đoạn này là biểu đồ tỉ lệ phân bổ cơ hội bán hàng cho từng nhân viên
  const chartDataEmployee = {
    chart: {
      type: "bar",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: employeeData.map((item) => item.name),
      title: {
        text: "",
      },
    },
    yAxis: {
      title: {
        text: "",
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: "Số lượng",
        data: employeeData.map((item) => item.count),
        dataLabels: {
          enabled: true,
          format: "{y}%",
        },
      },
    ],
  };

  const [dataEmployee, setDataEmployee] = useState(null);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items || [];

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
  };

  const chartDataTab2 = {
    chart: {
      type: "column",
    },
    title: {
      text: "",
      align: "left",
    },
    subtitle: {
      text: "",
      align: "left",
    },
    xAxis: {
      categories: ["Trung Nguyen", "Tùng Nguyen", "Dung Phan", "Cương Bá"],
      crosshair: true,
      accessibility: {
        description: "employee",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "",
      },
    },
    tooltip: {
      valueSuffix: "",
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [
      {
        name: "Phân bổ",
        data: [20, 10, 10, 30],
        color: "green",
      },
      {
        name: "Thu hồi",
        data: [10, 5, 7, 10],
        color: "red",
      },
    ],
  };


  ////tab 3: vinh danh bán hàng

  const [params, setParams] = useState<any>({
    name: "",
  });
  const [listTopSale, setListTopSale] = useState([]);
  const [isLoadingTopSale, setIsLoadingTopSale] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "nhân viên",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });


  const getListTopSale = async () => {
    setIsLoadingTopSale(true);

    // const response = await CampaignService.list(paramsSearch);

    // if (response.code == 0) {
    //   const result = response.result;
    //   setListTopSale(result.items);

    //   setPagination({
    //     ...pagination,
    //     page: +result.page,
    //     sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
    //     totalItem: +result.total,
    //     totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
    //   });

    //   if (+result.total === 0 && !params?.name && +result.page === 1) {
    //     setIsNoItem(true);
    //   }
    // } else if (response.code == 400) {
    //   setIsPermissions(true);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }

    setListTopSale([
      {
        employeeName: 'Trung Nguyen',
        departmentName:'Công nghệ thông tin',
        branchName: 'Hà Nội',
        revenue: '50000000'
      },
      {
        employeeName: 'Duc Dung',
        departmentName:'Ban lãnh đạo',
        branchName: 'Hà Nội',
        revenue: '40000000'
      },
      {
        employeeName: 'Nguyen Tung',
        departmentName:'Chăm sóc khách hàng',
        branchName: 'Hà Nội',
        revenue: '30000000'
      },
    ])
    setIsLoadingTopSale(false);
  };

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách chiến dịch",
      is_active: true,
    },
  ]);

  const titlesTopSale = [
    "STT",
    "Tên nhân viên",
    "Phòng ban",
    "Chi nhánh",
    "Doanh thu",
  ];
  const dataFormatTopSale = ["text-center", "", "", "", "text-right",];

  const dataMappingArrayTopSale = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.employeeName,
    item.departmentName,
    item.branchName,
    formatCurrency(item.revenue)
    
  ];

  ///biểu đồ kpi nhân viên
  const [kpiEmployeeList, setKpiEmployeeList] = useState([
    {
      employeeName: 'Trung Nguyen',
      departmentName:'Công nghệ thông tin',
      branchName: 'Hà Nội',
      revenue: '50000000'
    },
    {
      employeeName: 'Duc Dung',
      departmentName:'Ban lãnh đạo',
      branchName: 'Hà Nội',
      revenue: '40000000'
    },
    {
      employeeName: 'Nguyen Tung',
      departmentName:'Chăm sóc khách hàng',
      branchName: 'Hà Nội',
      revenue: '30000000'
    },
  ]);

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

  return (
    <div className="card-box detail__campaign-page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* <div style={{ display: "flex", alignItems: "center"}}>
          <span style={{ fontWeight: "600", fontSize: 18 }}>{`Tên chiến dịch:`}</span>
          {dataDetail?.name.length > 22 ? 
            <Tippy content={dataDetail?.name}>
              <div>
                <span style={{ fontWeight: "600", fontSize: 18, color: "#3d69ce", marginLeft: 5, cursor:'pointer' }}>{dataDetail?.name.substring(0, 22)}...</span>
              </div>
            </Tippy>
            : 
            <span style={{ fontWeight: "600", fontSize: 18, color: "#3d69ce", marginLeft: 5}}>{dataDetail?.name}</span>
          }
        </div> */}

        <div style={{ display: "flex", alignItems: "center" }}>
          {tabData.map((item, index) => (
            <div
              key={index}
              style={{ paddingLeft: 12, paddingRight: 12, borderBottom: tabStep === item.value ? "1px solid" : "", cursor: "pointer" }}
              onClick={() => {
                setTabStep(item.value);
              }}
            >
              <span style={{ fontSize: 16, fontWeight: "400", color: tabStep === item.value ? "" : "#d3d5d7" }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {tabStep === 1 && (
        <div>
          <div className="card-box box__item">
            <div className="title d-flex align-items-start justify-content-between">
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3>Tỉ lệ chuyển đổi qua từng phương pháp</h3>
              </div>
            </div>
            {approachData && approachData.length > 0 ? (
              <div className="funnel_chart">
                <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={chartDataApproach} />
              </div>
            ) : (
              <Fragment>
                {<SystemNotification description={<span>Hiện tại chưa có tỉ lệ chuyển đổi qua từng phương pháp.</span>} type="no-item" />}
              </Fragment>
            )}
          </div>
          <div className="card-box box__item">
            <div className="title d-flex align-items-start justify-content-between">
              <div className="sales__allocation">
                <h3>Tỉ lệ phân bổ cơ hội bán hàng cho từng nhân viên</h3>

                <div className="filter__employee">
                  <SelectCustom
                    id="lstEmployeeId"
                    name="lstEmployeeId"
                    fill={true}
                    options={[]}
                    value={dataEmployee}
                    onChange={(e) => handleChangeValueEmployee(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    loadOptionsPaginate={loadedOptionEmployee}
                    placeholder="Chọn nhân viên"
                    additional={{
                      page: 1,
                    }}
                    formatOptionLabel={formatOptionLabelEmployee}
                  />
                </div>
              </div>
            </div>

            {approachData && approachData.length > 0 ? (
              <div className="funnel_chart">
                <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={chartDataEmployee} />
              </div>
            ) : (
              <Fragment>
                {<SystemNotification description={<span>Hiện tại chưa có tỉ lệ phân bổ cơ hội bán hàng cho từng nhân viên.</span>} type="no-item" />}
              </Fragment>
            )}
          </div>
          {/* {!isLoading && dataDetail ? ( */}
          <div className="card-box box__item">
            <div className="title d-flex align-items-start justify-content-between">
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3>Tỉ lệ chuyển đổi theo từng nhân viên</h3>
              </div>
            </div>
            <div>
              {!isLoading && saleData && saleData.length > 0 ? (
                <BoxTable
                  name=""
                  // className="table__document"
                  titles={titles}
                  items={saleData}
                  isPagination={false}
                  //   dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  // listIdChecked={listIdChecked}
                  isBulkAction={true}
                  // bulkActionItems={bulkActionList}
                  striped={true}
                  // setListIdChecked={(listId) => setListIdChecked(listId)}
                  // actions={actionsTable}
                  actionType="inline"
                />
              ) : isLoading ? (
                <Loading />
              ) : (
                <Fragment>
                  {<SystemNotification description={<span>Hiện tại chưa có tỉ lệ chuyển đổi theo từng nhân viên nào.</span>} type="no-item" />}
                </Fragment>
              )}
            </div>
          </div>
          {/* ) : (
                <Loading />
            )} */}
          <div className="card-box box__item">
            <div className="title d-flex align-items-start justify-content-between">
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3>Phân bổ/Thu hồi cơ hội</h3>
              </div>
            </div>
            <div className="funnel_chart">
              <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={chartDataTab2} />
            </div>
          </div>
         
        </div>
      )}

      {tabStep === 2 && (
        <div>
          <div className="card-box box__item">
            <div style={{display:'flex', marginBottom: '1.2rem', justifyContent:'space-between'}}>
              <div>
                <h3>Bộ chỉ tiêu chiến dịch</h3>
              </div>
              <div className="button_view">
                {dataView.map((item, index) => (
                  <div 
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
            
            <div>
                <div className={typeView === 1 ? "" : 'd-none'}>
                  <KpiDiagram/>
                </div>

              {typeView === 2 &&
                <div className="d-flex align-items-start box_item ">
                  <div className="box_item--left">
                    <div className="info__basic">
                      <div className="info__basic--header">
                        <h3 className="title-basic">Danh sách chỉ tiêu</h3>
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
                  <div className="box_item--right">
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

          <div className="card-box box__item">
            <div className="title d-flex align-items-start justify-content-between">
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3>Vinh danh bán hàng xuất sắc</h3>
              </div>
            </div>
            <div>
              {!isLoadingTopSale && listTopSale && listTopSale.length > 0 ? (
                <BoxTable
                  name=""
                  // className="table__document"
                  titles={titlesTopSale}
                  items={listTopSale}
                  isPagination={false}
                  //   dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArrayTopSale(item, index)}
                  dataFormat={dataFormatTopSale}
                  // listIdChecked={listIdChecked}
                  isBulkAction={true}
                  // bulkActionItems={bulkActionList}
                  striped={true}
                  // setListIdChecked={(listId) => setListIdChecked(listId)}
                  // actions={actionsTable}
                  actionType="inline"
                />
              ) : isLoadingTopSale ? (
                <Loading />
              ) : (
                <Fragment>
                  {<SystemNotification description={<span>Hiện tại chưa có nhân viên nào.</span>} type="no-item" />}
                </Fragment>
              )}
            </div>
          </div>

          <div className="card-box box__item">
            <div className="title d-flex align-items-start justify-content-between">
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3>Nguồn khách hàng</h3>
              </div>
            </div>
            <div>
              
            </div>
          </div>
        </div>
      )}

      <DetailEmployeeModal
        onShow={showModalDetailEmployee}
        data={employeeDetail}
        onHide={(reload, nextModal) => {
          setShowModalDetailEmployee(false);
          setEmployeeDetail(null);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

export default memo(DetailCampaign);
