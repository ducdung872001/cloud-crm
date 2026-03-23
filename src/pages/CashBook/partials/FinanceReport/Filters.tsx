import React from "react";
import SearchBox from "components/searchBox/searchBox";
import { IFilterItem } from "model/OtherModel";
import { ICashbookFilterRequest } from "model/cashbook/CashbookRequestModel";

interface FiltersProps {
  listTabs: { title: string; is_active: string; type: number }[];
  activeTabName: string;
  params: ICashbookFilterRequest;
  filterList: IFilterItem[];
  onChangeTab: (nextTab: { name: string; type: number }) => void;
  onUpdateParams: (params: ICashbookFilterRequest) => void;
}

export default function Filters(props: FiltersProps) {
  const { listTabs, activeTabName, params, filterList, onChangeTab, onUpdateParams } = props;

  return (
    <div className="finance-report__filters">
      <div className="action-header">
        <div className="title__actions">
          <ul className="menu-list">
            {listTabs.map((item, idx) => (
              <li
                key={idx}
                className={item.is_active == activeTabName ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  onChangeTab({ name: item.is_active, type: item.type });
                }}
              >
                {item.title}
              </li>
            ))}
          </ul>
        </div>
        <SearchBox
          name="Báo cáo tài chính"
          placeholderSearch="Tìm kiếm theo Ghi chú"
          params={params}
          isFilter={true}
          listFilterItem={filterList}
          updateParams={onUpdateParams}
        />
      </div>
    </div>
  );
}
