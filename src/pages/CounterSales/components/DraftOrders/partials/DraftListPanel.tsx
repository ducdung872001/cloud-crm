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
  onCreate: () => void;
};

const DraftListPanel: React.FC<Props> = ({ items, selectedId, query, onQueryChange, onSelect, onCreate }) => {
  return (
    <div className="draft-left">
      <div className="draft-left__head">
        <div className="ttl">
          Danh sách đơn tạm <span className="badge">{items.length}</span>
        </div>

        <div className="search-row">
          <div className="search-wrap">
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

          <button className="btn btn--ink btn--sm" onClick={onCreate}>
            ＋ Tạo mới
          </button>
        </div>
      </div>

      <div className="draft-left__list">
        {items.map((d) => (
          <DraftListItem key={d.id} order={d} active={d.id === selectedId} onClick={() => onSelect(d.id)} />
        ))}

        {items.length === 0 && <div className="empty">Không tìm thấy đơn tạm nào</div>}
      </div>
    </div>
  );
};

export default DraftListPanel;
