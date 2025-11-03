import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { formatCurrency, getPageOffset } from "reborn-util";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { ExportExcel } from "exports";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";
import { showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import CustomerService from "services/CustomerService";
import BeautyBranchService from "services/BeautyBranchService";
import ReportRevenue from "./partials/ReportRevenue/ReportRevenue";
import ReportEmployee from "./partials/ReportEmployee/ReportEmployee";
import ReportCity from "./partials/ReportCity/ReportCity";
import ReportProduct from "./partials/ReportProduct/ReportProduct";
import ReportService from "./partials/ReportService/ReportService";
import ReportCardService from "./partials/ReportCardService/ReportCardService";
import "./ReportCommon.scss";

export default function ReportCommon() {
  document.title = "Doanh thu";

  const { name, dataBranch } = useContext(UserContext) as ContextType;

  const [valueBranch, setValueBranch] = useState(null);  

  const [params, setParams] = useState<IReportCommonFilterRequest>({
    fromTime: "",
    toTime: "",
  });

  const branchList = async () => {
    const param: IBeautyBranchFilterRequest = {
      name: '',
      page: 1,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);
    
    if (response.code === 0){
      const dataOption = response.result.items;
      if(dataOption?.length === 1){     
        setValueBranch({value: dataOption[0].id, label: dataOption[0].name})    
      }
    }
  }

  useEffect(() => {
    branchList()
  }, []) 

  //? đoạn này xử lý vấn đề call api lấy ra danh sách chi nhánh
  const loadOptionBranch = async (search, loadedOptions, { page }) => {
    const param: IBeautyBranchFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IBeautyBranchResponse) => {
                return {
                  value: item.id,
                  label: item.name,
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

  // thay đổi giá trị branch
  const handleChangeValueBranch = (e) => {
    setValueBranch(e);
  };


  useEffect(() => {
    if(dataBranch){    
      setValueBranch(dataBranch)
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value}));
    }
  }, [dataBranch]);

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, fromTime: fromTime, toTime: toTime });
    }
  };

  const lstOptionReport = [
    {
      value: 1,
      label: "Báo cáo doanh thu thực",
    },
    {
      value: 2,
      label: "Báo cáo theo nhân viên",
    },
    {
      value: 3,
      label: "Báo cáo theo chi nhánh",
    },
    {
      value: 4,
      label: "Báo cáo theo sản phẩm",
    },
    {
      value: 5,
      label: "Báo cáo theo dịch vụ",
    },
    {
      value: 6,
      label: "Báo cáo theo thẻ dịch vụ",
    },
  ];

  const [optionReport, setOptionReport] = useState({
    value: 1,
    label: "Báo cáo doanh thu thực",
  });

  const handleChangeValueOptionReport = (e) => {
    const value = e;
    setOptionReport(value);
  };

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [dataExport, setDataExport] = useState([]);

  const takeDataExport = (data) => {
    setDataExport(data);
  };

  const titleExports = ["STT", "Ngày", "Doanh thu", "Chi phí", "Lợi nhuận", "Công nợ"];

  const formatExcel = ["center", "center", "right", "right", "right", "right"];

  const dataMappingArray = (item, idx: number) => [
    getPageOffset(params) + idx + 1,
    moment(item.time).format("DD/MM/yyyy"),
    item.revenue,
    item.income,
    item.expense,
    item.debt,
  ];

  //TODO: xuất file báo cáo
  const handleExportFile = async () => {
    setIsSubmit(true);

    if (dataExport.length > 0) {
      const totalSummary = [
        "Tổng tiền",
        "",
        dataExport.map((item) => item.revenue).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        dataExport.map((item) => item.income).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        dataExport.map((item) => item.expense).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        dataExport.map((item) => item.debt).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
      ];

      ExportExcel({
        fileName: "BaoCaoDoanhThu",
        title: "Báo cáo doanh thu thực",
        header: titleExports,
        formatExcel: formatExcel,
        data: dataExport.map((item, idx) => dataMappingArray(item, idx)),
        info: { name },
        footer: totalSummary,
      });
      showToast("Xuất file thành công", "success");
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  return (
    <div className="page-content page__report--common">
      <div className="card-box d-flex flex-column common">
        <div className="box__filter">
          <div className="box__filter--left">
            <h2 style={optionReport.value !== 1 ? { marginBottom: "2.5rem" } : {}}>{optionReport.label}</h2>
            {optionReport.value === 1 && (
              <div className="action__export" onClick={() => handleExportFile()}>
                <Icon name={isSubmit ? "Loading" : "Download"} />
                Xuất báo cáo
              </div>
            )}
          </div>
          <div className="box__filter--right">
            <div className="form-group">
              <SelectCustom
                id="optionReport"
                name="optionReport"
                fill={true}
                options={lstOptionReport}
                value={optionReport}
                special={true}
                onChange={(e) => handleChangeValueOptionReport(e)}
                placeholder="Chọn loại báo cáo"
              />
            </div>
            {/* <div className="form-group">
              <SelectCustom
                id="branchId"
                name="branchId"
                fill={true}
                required={true}
                options={[]}
                value={valueBranch}
                onChange={(e) => handleChangeValueBranch(e)}
                isAsyncPaginate={true}
                placeholder="Chọn chi nhánh"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadOptionBranch}
              />
            </div> */}
            <div className="form-group">
              <AdvancedDateFilter updateParams={takeFromTimeAndToTime} />
            </div>
          </div>
        </div>

        <div className="box__option--report">
          {optionReport.value == 1 ? (
            <ReportRevenue params={params} callback={(data) => takeDataExport(data)} />
          ) : optionReport.value == 2 ? (
            <ReportEmployee params={params} />
          ) : optionReport.value == 3 ? (
            <ReportCity params={params} />
          ) : optionReport.value == 4 ? (
            <ReportProduct params={params} />
          ) : optionReport.value == 5 ? (
            <ReportService params={params} />
          ) : (
            <ReportCardService params={params} />
          )}
        </div>
      </div>
    </div>
  );
}
