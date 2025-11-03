import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { IReportServiceResponse } from "model/report/ReportResponse";
import SelectCustom from "components/selectCustom/selectCustom";
import CustomChartBasic from "components/customChartBasic/customChartBasic";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";
import ReportService from "services/ReportService";
import BeautyBranchService from "services/BeautyBranchService";
import { useWindowDimensions } from "utils/hookCustom";
import { showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";

interface ReportProductProps {
  classNames?: string;
}

export default function ReportProduct(props: ReportProductProps) {
  const { classNames } = props;

  const { t } = useTranslation();

  const { width } = useWindowDimensions();
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [valueBranch, setValueBranch] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listService, setListService] = useState<IReportServiceResponse[]>([]);
  const [maxTotalService, setMaxTotalService] = useState<number>(0);

  const [params, setParams] = useState<IReportCommonFilterRequest>({
    fromTime: "",
    toTime: "",
  });

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
    if (dataBranch) {
      setParams({ ...params, branchId: dataBranch.value });
      setValueBranch(dataBranch);
    }
  }, [dataBranch]);

  const getService = async (paramsSearch: IReportCommonFilterRequest) => {
    setIsLoading(true);

    const response = await ReportService.service(paramsSearch);

    if (response.code == 0) {
      const result = response.result;

      setListService(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (params.fromTime && params.toTime) {
      getService(params);
    }
  }, [params]);

  useEffect(() => {
    let takeMaxTotalService = 0;

    if (listService.length > 0) {
      listService.filter((item) => {
        if (takeMaxTotalService < item.amount) {
          return (takeMaxTotalService = item.amount);
        }
      });

      setMaxTotalService(takeMaxTotalService);
    }
  }, [listService]);

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, fromTime: fromTime, toTime: toTime });
    }
  };

  return (
    <div className={`card-box report-selling-product${classNames ? ` ${classNames}` : ""}`}>
      <div className="title d-flex align-items-start justify-content-between">
        <h2>{t(`pageDashboard.topServices`)}</h2>
        <div className="report-filter">
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
              disabled={true}
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
      <div className="chart-selling-service">
        <CustomChartBasic isLoading={isLoading} totalMax={maxTotalService} lstData={listService} nameNotification="dịch vụ" />
      </div>
    </div>
  );
}
