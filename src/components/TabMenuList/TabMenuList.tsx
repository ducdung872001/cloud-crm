import React, {useState, memo} from "react";
import Icon from "../icon";
import "./TabMenuList.scss";

/**
 * TabMenuList — hiển thị danh sách card chức năng.
 *
 * Props:
 *   listTab   – flat array (cũ, vẫn hỗ trợ 100%)
 *   groups    – array of { label, items[] } để hiển thị section headers
 *   onClick   – callback khi click card
 */

const style_fontSize_fontWeight: React.CSSProperties = { fontSize: 14, fontWeight: "500" };
const style_fontSize_fontWeight_1: React.CSSProperties = { fontSize: 12, fontWeight: "400" };
function TabMenuList(props: Record<string, unknown>) {
  const { listTab, groups, onClick } = props;

  // ── Render một card ──────────────────────────────────────────────────────────
  const renderCard = (item: Record<string, unknown>, idx: number) => (
    <div
      key={idx}
      className="item-menu"
      onClick={() => onClick(item)}
    >
      <div className="item-icon" style={{ backgroundColor: item.backgroundColor }}>
        <Icon name={item.icon} style={{ stroke: item.strokeColor }} />
      </div>
      <div className="item-body">
        <span style={style_fontSize_fontWeight}>{item.title}</span>
        {item?.des && (
          <div>
            <span style={style_fontSize_fontWeight_1}>{item.des}</span>
          </div>
        )}
      </div>
    </div>
  );

  // ── Grouped mode ────────────────────────────────────────────────────────────
  if (groups && groups.length > 0) {
    return (
      <div className="tab-menu-grouped">
        {groups.map((group: Record<string, unknown>, gi: number) => (
          <div key={gi} className="tab-menu-group">
            {group.label && (
              <div className="tab-menu-group__label">{group.label}</div>
            )}
            <div className="menu">
              {group.items.map((item: Record<string, unknown>, idx: number) => renderCard(item, idx))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Flat mode (cũ, backward compatible) ─────────────────────────────────────
  return (
    <div className="menu">
      {listTab.map((item: Record<string, unknown>, idx: number) => renderCard(item, idx))}
    </div>
  );
}

export default memo(TabMenuList);
