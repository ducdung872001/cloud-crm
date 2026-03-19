import React, { useState, useCallback } from "react";
import "./index.scss";
import { ReturnProduct } from "@/types/returnProduct";
import ReturnStats from "./components/ReturnStats";
import ReturnTable from "./components/ReturnTable";
import CreateReturnModal from "./modals/CreateReturnModal";
import ReturnDetailModal from "./modals/ReturnDetailModal";
import ReturnTopbar from "./components/ReturnTopbar";

const INITIAL_DATA: ReturnProduct[] = [
  {
    id: "1",
    code: "PTH-2026-001",
    time: "19/03/2026 09:15",
    customerName: "Nguyễn Văn A",
    originalOrderCode: "HD-2241",
    type: "return",
    productSummary: "Áo thun nam cổ tròn (x2)",
    refundAmount: 240000,
    status: "done",
    reason: "Sản phẩm bị lỗi / hư hỏng",
    staffName: "Hòa Phạm",
    paymentMethod: "Tiền mặt",
  },
  {
    id: "2",
    code: "PTH-2026-002",
    time: "18/03/2026 14:30",
    customerName: "Trần Thị B",
    originalOrderCode: "HD-2235",
    type: "exchange",
    productSummary: "Quần jeans slim (x1)",
    refundAmount: 0,
    status: "processing",
    reason: "Không đúng size",
    staffName: "Minh Tuấn",
    paymentMethod: "–",
  },
  {
    id: "3",
    code: "PTH-2026-003",
    time: "17/03/2026 11:00",
    customerName: "Lê Minh C",
    originalOrderCode: "HD-2220",
    type: "return",
    productSummary: "Giày thể thao nam (x1)",
    refundAmount: 580000,
    status: "pending",
    reason: "Sản phẩm hết hạn sử dụng",
    staffName: "Thu Hương",
    paymentMethod: "Chuyển khoản",
  },
  {
    id: "4",
    code: "PTH-2026-004",
    time: "15/03/2026 16:45",
    customerName: "Phạm Thị D",
    originalOrderCode: "HD-2198",
    type: "exchange",
    productSummary: "Váy đầm hoa nhí (x1)",
    refundAmount: 0,
    status: "done",
    reason: "Khách hàng đổi ý",
    staffName: "Hòa Phạm",
    paymentMethod: "–",
  },
  {
    id: "5",
    code: "PTH-2026-005",
    time: "12/03/2026 08:20",
    customerName: "Hoàng Văn E",
    originalOrderCode: "HD-2180",
    type: "return",
    productSummary: "Túi xách da tổng hợp (x1)",
    refundAmount: 350000,
    status: "cancel",
    reason: "Sản phẩm bị lỗi / hư hỏng",
    staffName: "Minh Tuấn",
    paymentMethod: "Tiền mặt",
  },
  {
    id: "6",
    code: "PTH-2026-006",
    time: "10/03/2026 13:10",
    customerName: "Vũ Thị F",
    originalOrderCode: "HD-2165",
    type: "return",
    productSummary: "Áo khoác dù (x1)",
    refundAmount: 420000,
    status: "done",
    reason: "Không đúng mô tả",
    staffName: "Thu Hương",
    paymentMethod: "Hoàn ví",
  },
];

const ReturnProductPage: React.FC = () => {
  const [data, setData] = useState<ReturnProduct[]>(INITIAL_DATA);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReturnProduct | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const filtered = data.filter((r) => {
    const q = search.toLowerCase();
    const matchQ =
      !q || r.code.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q) || r.originalOrderCode.toLowerCase().includes(q);
    const matchT = !filterType || r.type === filterType;
    const matchS = !filterStatus || r.status === filterStatus;
    return matchQ && matchT && matchS;
  });

  const handleViewDetail = useCallback((item: ReturnProduct) => {
    setSelectedItem(item);
    setDetailOpen(true);
  }, []);

  const handleCreate = useCallback((newItem: ReturnProduct) => {
    setData((prev) => [newItem, ...prev]);
    setCreateOpen(false);
  }, []);

  return (
    <div className="return-product">
      {/* <Sidebar /> */}
      <div className="return-product__main">
        <ReturnTopbar onCreateClick={() => setCreateOpen(true)} />

        <div className="return-product__content">
          <div className="return-product__inner">
            {/* Stats */}
            <ReturnStats data={data} />

            {/* Table panel */}
            <ReturnTable
              data={filtered}
              filterType={filterType}
              filterStatus={filterStatus}
              search={search}
              onFilterType={setFilterType}
              onFilterStatus={setFilterStatus}
              onSearch={setSearch}
              onViewDetail={handleViewDetail}
              onCreateClick={() => setCreateOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateReturnModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} totalExisting={data.length} />

      <ReturnDetailModal open={detailOpen} item={selectedItem} onClose={() => setDetailOpen(false)} />
    </div>
  );
};

export default ReturnProductPage;
