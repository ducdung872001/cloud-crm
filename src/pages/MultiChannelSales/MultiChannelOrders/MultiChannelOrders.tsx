import React, { useState } from "react";
import _ from "lodash";
import "./MultiChannelOrders.scss";
import BoxTable from "@/components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "@/components/pagination/pagination";
import Badge from "@/components/badge/badge";
import { BulkActionItemModel } from "@/components/bulkAction/bulkAction";
import { IAction } from "@/model/OtherModel";
import Icon from "@/components/icon";

export default function MultiChannelOrders() {
  document.title = "Đơn hàng đa kênh";

  /**
   * status: 
   * 1 - Chờ xử lý, 
   * 2 - Đang giao, 
   * 3 - Hoàn thành, 
   * 4 - Đã huỷ
   */

  const [listOrder, setListOrder] = useState([
    {
        code: '#SPE-20240228-001',
        app: 'Shopee',
        customer: 'Trần Văn Bình',
        customerPhone: '0912345678',
        product: 'Áo thun oversize',
        productDes: 'SL: 2 · Size L, M',
        productValue: '490.000₫',
        status: 1,
        time: '08:34 hôm nay'
    },
    {
        code: '#LZD-20240228-034',
        app: 'Lazada',
        customer: 'Nguyễn Thị Mai',
        customerPhone: '0987654321',
        product: 'Quần jogger thể thao',
        productDes: 'SL: 1 · Đen - L',
        productValue: '320.000₫',
        status: 2,
        time: '07:12 hôm nay'
    },
    {
        code: '#TKI-20240228-012',
        app: 'Tiki',
        customer: 'Lê Hoàng Phúc',
        customerPhone: '0933111222',
        product: 'Giày sneaker trắng',
        productDes: 'SL: 1 · Size 42',
        productValue: '780.000₫',
        status: 3,
        time: 'Hôm qua, 19:45'
    },
    {
        code: '#FB-20240228-007',
        app: 'Facebook',
        customer: 'Phạm Thùy Linh',
        customerPhone: '0908765432',
        product: 'Váy hoa midi',
        productDes: 'SL: 2 · Size S, M',
        productValue: '650.000₫',
        status: 1,
        time: '09:15 hôm nay'
    },
    {
        code: '#WEB-20240228-003',
        app: 'Website',
        customer: 'Vũ Minh Tuấn',
        customerPhone: '0908764531',
        product: 'Áo polo nam',
        productDes: 'SL: 2 · Size S, M',
        productValue: '650.000₫',
        status: 4,
        time: '09:15 hôm nay'
    },
  ]);

  const [params, setParams] = useState({
    name: "",
    limit: 10,
    page: 1,
  });

  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "đơn hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });


  const titles = ["Mã đơn", "Kênh", "Khách hàng", "Sản phẩm", "Giá trị", "Trạng thái", "Thời gian", ""];
  const dataFormat = [ "", "", "t", "", "", "text-center", ""];

  const dataMappingArray = (item: any, index: number) => [
    // index + 1,
    <div style={{width: '15rem'}}>
        {item.code}
    </div>,
    item.app,
    <div style={{width: '15rem'}}>
        <span style={{fontSize: 14, fontWeight: '600'}}>{item.customer}</span>
        <div><span style={{fontSize: 12, fontWeight: '400'}}>{item.customerPhone}</span></div>
    </div>,
    <div style={{width: '15rem'}}>
        <span style={{fontSize: 14, fontWeight: '600'}}>{item.product}</span>
        <div><span style={{fontSize: 12, fontWeight: '400'}}>{item.productDes}</span></div>
    </div>,
    item.productValue,
    <Badge
      key={item.id}
      text={item?.status === 1 ? "Chờ xử lý" : item.status === 2 ? "Đang giao" : item.status === 3 ? "Đang giao" : "Đã hủy"}
      variant={item.status === 1 ? "warning" : item.status === 2 ? "primary" : item.status === 3 ? "success" : "error"}
    />,
    <div style={{width: '10rem'}}>
        {item.time}
    </div>,
    <div style={{width: '10rem'}}>
        {item.status === 1 ? 
            <div style={{backgroundColor: '#FF6633', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '10px'}}>
                <span style={{fontSize: 12, fontWeight: '500', color: 'white'}}>Xác nhận</span>
            </div>
        : null}

        {item.status === 2 ? 
            <div style={{backgroundColor: 'green', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '10px'}}>
                <span style={{fontSize: 12, fontWeight: '500', color: 'white'}}>Theo dõi</span>
            </div>
        : null}

        {item.status === 3 ? 
            <div style={{backgroundColor: 'green', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '10px'}}>
                <span style={{fontSize: 12, fontWeight: '500', color: 'white'}}>Xem chi tiết</span>
            </div>
        : null}

        {item.status === 4 ? 
            <div style={{backgroundColor: 'var(--extra-color-20)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '10px'}}>
                <span style={{fontSize: 12, fontWeight: '500'}}>Hoàn tiền</span>
            </div>
        : null}
    </div>
  ];

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa hoá đơn",
      callback: () => {},
    },
  ];

  const actionsTable = (item: any): IAction[] => {
    return [

    //   {
    //     title: "Xem chi tiết",
    //     icon: <Icon name="Eye" />,
    //     callback: () => {
    //     },
    //   },
    //   {
    //     title: "Xem chi tiết",
    //     icon: <Icon name="Checked" style={{width: 0}}/>,
    //     callback: () => {
    //     },
    //   },
    ];
  };

  return (
    <div className="multi-channel-orders-page">
        <div className="conatiner-header">
            <div>
                <span style={{fontSize: 24, fontWeight: '700', color: 'var(--text-primary-color)'}}>Đơn hàng đa kênh</span>
                <div>
                    <span style={{fontSize: 16, fontWeight: '500', color: '#939394', fontFamily: 'none'}}>Tổng hợp đơn từ tất cả kênh bán hàng</span>
                </div>
            </div>

            <div className="conatiner-button">
                <div className="button-export">
                    <span style={{fontSize: 14, fontWeight: '500'}}>Xuất Excel</span>
                </div>
            </div>
        </div>

        <div className="table-order card-box">
            <BoxTable
              name="Đơn hàng đa kênh"
              titles={titles}
              items={listOrder}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              striped={true}
              isBulkAction={false}
              bulkActionItems={bulkActionList}
              listIdChecked={listIdChecked}
              setListIdChecked={(listId) => setListIdChecked(listId)}
              actions={actionsTable}
              actionType="inline"
            />
        </div>


    </div>
  );
}
