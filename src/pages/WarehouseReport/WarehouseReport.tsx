import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./WarehouseReport.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function WarehouseReport() {
  document.title = "Báo cáo kho";

  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTabReport = [
    {
      title: "Báo cáo nhập xuất tồn",
      des: "Tổng hợp biến động theo kỳ, theo kho, theo sản phẩm",
      tab: 1,
    },

    {
      title: "Giá vốn hàng tồn",
      des: "Tính giá vốn theo phương pháp bình quân/FIFO",
      tab: 2,
    },
    {
      title: "Hàng chậm luân chuyển",
      des: "Sản phẩm tồn lâu ngày không xuất",
      tab: 3,
    },
    {
      title: "Lịch sử theo sản phẩm",
      des: "Toàn bộ biến động của một sản phẩm cụ thể",
      tab: 4,
    },
  ];

  return (
    <div className="page-content page-warehouse-report">
      {!isDetail && <TitleAction title="Báo cáo kho" />}
      <div className="d-flex flex-column">
        {!isDetail && (
            <TabMenuList
                listTab={listTabReport}
                onClick={(item) => {
                    setTab(item.tab);
                    setIsDetail(true);
                }}
            />
        )}
      </div>
    </div>
  );
}
