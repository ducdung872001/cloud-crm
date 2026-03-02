import React from "react";
import { ConversationFilter, filterOptionLabels } from "../../data";

interface FilterBarProps {
  activeFilter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
}

const filterOptions: ConversationFilter[] = ["all", "unread", "consulting"];

export default function FilterBar(props: FilterBarProps) {
  const { activeFilter, onFilterChange } = props;

  return (
    <div className="omni-filter-bar">
      {filterOptions.map((item) => (
        <button
          key={item}
          type="button"
          className={activeFilter === item ? "active" : ""}
          onClick={() => onFilterChange(item)}
        >
          {filterOptionLabels[item]}
        </button>
      ))}
    </div>
  );
}
