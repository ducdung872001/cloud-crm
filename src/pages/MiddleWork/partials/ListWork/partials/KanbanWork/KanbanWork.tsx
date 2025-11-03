import React, { useEffect, useState } from "react";
import { getSearchParameters } from "reborn-util";
import SearchBox from "components/searchBox/searchBox";
import KanbanStatusWork from "./partials/KanbanStatusWork";
import KanbanEmployee from "./partials/KanbanEmployee";
import KanbanProject from "./partials/KanbanProject";
import "./KanbanWork.scss";

export default function KanbanWork(props: any) {
  const {
    type,
    data,
    dataStart,
    setDataStart,
    dataDo,
    setDataDo,
    dataFail,
    setDataFail,
    dataSuccess,
    setDataSuccess,
    dataPending,
    setDataPending,
    onReload,
    params,
    setParams,
    customerFilterList,
    isKanban,
    changeValueFilterByKanban,
  } = props;

  const paramsUrl = getSearchParameters();

  const lstTab =
    paramsUrl && paramsUrl.projectId === "-1"
      ? [
          {
            id: 1,
            name: "trạng thái công việc",
          },
        ]
      : [
          {
            id: 1,
            name: "trạng thái",
          },
          {
            id: 2,
            name: "nhân viên",
          },
          {
            id: 3,
            name: "của tôi",
          },
        ];

  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    if (activeTab === 1) {
      changeValueFilterByKanban("kanbanStatus");
    } else if (activeTab === 2) {
      changeValueFilterByKanban("kanbanEmployee");
    } else {
      changeValueFilterByKanban("kanbanProject");
    }
  }, [activeTab]);

  return (
    <div className="wrapper__kanban-work">
      <div className="header__kanban">
        <ul className="lst__tab">
          {lstTab.map((item, idx) => {
            return (
              <li key={idx} className={`tab__item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
                {`Công việc ${item.id === 1 || item.id === 2 ? "theo" : ""} ${item.name}`}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="content__kanban--work">
        <div className="search__kanban">
          <SearchBox
            key={customerFilterList.length}
            name="Tên công việc"
            params={params}
            isFilter={true}
            listFilterItem={customerFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
        </div>

        <div className="condition__kanban">
          {activeTab === 1 ? (
            <KanbanStatusWork
              type={type}
              isShow={isKanban}
              data={data}
              onReload={onReload}
              dataStart={dataStart}
              setDataStart={setDataStart}
              dataDo={dataDo}
              setDataDo={setDataDo}
              dataFail={dataFail}
              setDataFail={setDataFail}
              dataSuccess={dataSuccess}
              setDataSuccess={setDataSuccess}
              dataPending={dataPending}
              setDataPending={setDataPending}
            />
          ) : activeTab === 2 ? (
            <KanbanEmployee type={type} isShow={isKanban} />
          ) : (
            <KanbanProject isShow={isKanban} type={type} />
          )}
        </div>
      </div>
    </div>
  );
}
