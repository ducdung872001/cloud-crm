import React from "react";
import { ITabContent } from "model/OtherModel";

interface TabContentProps {
  listTab: ITabContent[];
  onChangeTab: (tabContent: ITabContent) => void;
  children?: React.ReactElement | React.ReactElement[];
}

export default function TabContent(props: TabContentProps) {
  const { listTab, onChangeTab, children } = props;
  return (
    <>
      <div className="tab-nav">
        <ul className="d-flex align-items-center">
          {listTab
            .filter((t) => !t.show || t.show === true)
            .map((t, idx) => (
              <li key={idx} className={t.active === true ? "active" : ""} onClick={() => onChangeTab(t)}>
                {t.label}
              </li>
            ))}
        </ul>
      </div>
      {children && <div className="tab-content">{children}</div>}
    </>
  );
}
