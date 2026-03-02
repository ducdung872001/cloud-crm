import React from "react";
import { IConversationTag } from "../../data";

interface TagBadgeProps {
  tag: IConversationTag;
}

export default function TagBadge(props: TagBadgeProps) {
  const { tag } = props;

  return <span className={`tag-badge ${tag.tone}`}>{tag.label}</span>;
}
