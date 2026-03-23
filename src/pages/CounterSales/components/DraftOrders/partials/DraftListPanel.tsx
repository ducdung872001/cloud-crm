import React from "react";
import Input from "@/components/input/input";
import Icon from "@/components/icon";
import { DraftOrder } from "../types";
import DraftListItem from "./DraftListItem";

type Props = {
  items: DraftOrder[];
  selectedId: string | null;
  query: string;
  onQueryChange: (v: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void; // giữ prop để không break useDraftOrders, nhưng không dùng nút nữa
};

const DraftListPanel: React.FC<Props> = ({ items, selectedId, query, onQueryChange, onSelect }) => {
  return (
    <div className="draft-left">
      <div className="draft-left__head">
        <div className="ttl">
          Danh sách đơn tạm <span className="badge">{items.length}</span>
        </div>

        {/* Chỉ giữ ô tìm kiếm — bỏ nút "Tạo mới" */}
        <div className="search-wrap" style={{ width: "100%", marginTop: 10 }}>
          <Input
            type="text"
            placeholder="Tìm mã đơn, khách hàng..."
            icon={<Icon name="Search" />}
            iconPosition="left"
            value={query}
            fill={true}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>       
      </div>

      <div className="draft-left__list">
        {items.map((d) => (
          <DraftListItem key={d.id} order={d} active={d.id === selectedId} onClick={() => onSelect(d.id)} />
        ))}

        {items.length === 0 && (
          <div className="empty">
            {query ? "Không tìm thấy đơn tạm nào" : "Chưa có đơn tạm nào"}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftListPanel;