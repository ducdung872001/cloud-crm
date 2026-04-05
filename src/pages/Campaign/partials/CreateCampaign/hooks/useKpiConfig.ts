import { useEffect, useState } from "react";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";

export default function useKpiConfig() {
  const [tabKpi, setTabKpi] = useState(1);
  const [dataKpi, setDataKpi] = useState(null);
  const [dataKpiGoal, setDataKpiGoal] = useState([]);
  const [sumWeight, setSumWeight] = useState(0);
  const [kayId, setKayId] = useState(null);
  const [dataKpiEmployee, setDataKpiEmployee] = useState([]);
  const [isLoadingKpiEmployee, setIsLoadingKpiEmployee] = useState(false);
  const [kpiEmployeeData, setKpiEmployeeData] = useState(null);
  const [showModalConfigKpi, setShowModalConfigKpi] = useState(false);

  const [paramsKpi, setParamsKpi] = useState({
    name: "",
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "kpi cho nhân viên",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParamsKpi((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParamsKpi((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  useEffect(() => {
    if (dataKpiGoal.length > 0) {
      let sumWeight = 0;
      dataKpiGoal.map((item) => {
        sumWeight += item.weight;
      });
      setSumWeight(sumWeight);
    }
  }, [dataKpiGoal]);

  return {
    tabKpi,
    setTabKpi,
    dataKpi,
    setDataKpi,
    dataKpiGoal,
    setDataKpiGoal,
    sumWeight,
    setSumWeight,
    kayId,
    setKayId,
    dataKpiEmployee,
    setDataKpiEmployee,
    isLoadingKpiEmployee,
    setIsLoadingKpiEmployee,
    kpiEmployeeData,
    setKpiEmployeeData,
    showModalConfigKpi,
    setShowModalConfigKpi,
    paramsKpi,
    setParamsKpi,
    pagination,
    setPagination,
  };
}
