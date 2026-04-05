import { useEffect, useState } from "react";

interface IDataSales {
  employee: {
    value: number;
    label: string;
    avatar: string;
  };
  rank: {
    value: number;
    label: string;
  };
}

export default function useSalesAllocation() {
  const [listSales, setListSales] = useState<IDataSales[]>([]);
  const [allSales, setAllSales] = useState([{ employeeId: -1, rank: -1 }]);
  const [selectAllSales, setSelectAllSales] = useState(false);
  const [checkFieldSales, setCheckFieldSales] = useState<boolean>(false);
  const [lstIdSale, setLstIdSale] = useState([]);

  useEffect(() => {
    if (listSales.length > 0) {
      const result = listSales.map((item) => {
        if (item.employee) {
          return item.employee?.value;
        } else {
          return [];
        }
      });
      setLstIdSale([...result]);
    }
  }, [listSales]);

  return {
    listSales,
    setListSales,
    allSales,
    setAllSales,
    selectAllSales,
    setSelectAllSales,
    checkFieldSales,
    setCheckFieldSales,
    lstIdSale,
    setLstIdSale,
  };
}
