import React from "react";
import { ConversationFilter, IConversationThread, totalChatLabels } from "../../data";
import ConversationList from "./ConversationList";
import FilterBar from "./FilterBar";

interface ChannelInboxColumnProps {
  threads: IConversationThread[];
  selectedId: number;
  searchValue: string;
  activeFilter: ConversationFilter;
  onSelect: (id: number) => void;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: ConversationFilter) => void;
}

export default function ChannelInboxColumn(props: ChannelInboxColumnProps) {
  const { threads, selectedId, searchValue, activeFilter, onSelect, onSearchChange, onFilterChange } = props;

  return (
    <section className="omni-panel omni-panel--inbox">
      <div className="omni-panel__header">
        <div>
          <p className="eyebrow">{totalChatLabels.channelInbox.eyebrow}</p>
          <h2>{totalChatLabels.channelInbox.title}</h2>
        </div>
        <span className="omni-counter">{threads.length}</span>
      </div>

      <div className="omni-search">
        <input value={searchValue} onChange={(e) => onSearchChange(e.target.value)} placeholder={totalChatLabels.channelInbox.searchPlaceholder} />
      </div>

      <FilterBar activeFilter={activeFilter} onFilterChange={onFilterChange} />

      <ConversationList threads={threads} selectedId={selectedId} onSelect={onSelect} />
    </section>
  );
}
