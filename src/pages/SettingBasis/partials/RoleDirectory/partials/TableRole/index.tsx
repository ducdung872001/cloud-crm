import React, { Fragment, useEffect, useState } from "react";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { Chart } from "react-google-charts";
import "./index.scss";

export default function TableRole(props: any) {
  const {
    titles,
    listRole,
    params,
    setParams,
    pagination,
    dataMappingArray,
    dataFormat,
    listIdChecked,
    setListIdChecked,
    bulkActionList,
    actionsTable,
    isLoading,
    setIsLoading,
    setShowModalAdd,
    setIdRole,
    departmentFilterList,
    isNoItem,
    listSaveSearch,
    listTabs,
    tab,
    setTab,
    isPermissions,
    dataSize,
    setShowModalEditParentDepartment,
    loadOptionBranch,
    handleChangeValueBranch,
    valueBranch,
    setValueBranch,
  } = props;

  const [dataChart, setDataChart] = useState([]);
  const [parentArray, setParentArray] = useState([]);

  useEffect(() => {
    if (listRole) {
      let parentArray = [];
      let newArray = [
        [
          {
            v: "",
            f: "",
          },
          "",
          "",
        ],
      ];

      listRole.map((item) => {
        if (!item.parentId) {
          newArray.push([
            {
              v: item.name,
              f: `${item.name}`,
            },
            "",
            `${item.id}`,
          ]);

          parentArray.push([
            {
              v: item.name,
              f: `${item.name}
                    <div style="font-style:italic; font-size: 10px">${item.managerName ? `Phụ trách: ${item.managerName}` : ""}</div>
                    <div style="font-style:italic; font-size: 10px">${item.totalEmployee ? `Số NV: ${item.totalEmployee}` : ""}</div>
                  `,
            },
            "",
            "",
          ]);

          setParentArray(parentArray);
        } else {
          newArray.push([
            {
              v: item.name,
              f: `${item.name}`,
            },
            item.parentName,
            `${item.id}`,
          ]);
        }
      });

      setDataChart(newArray);
    }
  }, [listRole]);

  const options = {
    allowHtml: true,
  };

  return (
    <Fragment>
      <div className="action-header-tab">
        <div className="title__actions">
          <ul className="menu-list">
            {listTabs.map((item, idx) => (
              <li
                key={idx}
                className={item.is_active == tab.name ? "active" : ""}
                onClick={(e) => {
                  e && e.preventDefault();
                  setIsLoading(true);
                  if (tab.type == 1) {
                    setParams({
                      ...params,
                      name: "",
                      limit: 1000,
                    });
                  } else {
                    setParams({
                      ...params,
                      name: "",
                      limit: 10,
                      // page: 1
                    });
                  }
                  setTab({ name: item.is_active, type: item.type });
                }}
              >
                {item.title}
              </li>
            ))}
          </ul>
        </div>
        {/* {tab.type == 1 ?  */}
        <div className={tab.type == 1 ? "" : "d-none"}>
          <SearchBox name="Tên nhóm quyền" params={params} updateParams={(paramsNew) => setParams(paramsNew)} />
        </div>
        {/* : null} */}
      </div>
      {tab.type == 1 ? (
        !isLoading && listRole && listRole.length > 0 ? (
          <BoxTable
            name="Nhóm quyền"
            titles={titles}
            items={listRole}
            isPagination={false}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            striped={true}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
            dataSize={dataSize}
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isPermissions ? (
              <SystemNotification type="no-permission" />
            ) : isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có nhóm quyền nào. <br />
                    Hãy thêm mới nhóm quyền đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới nhóm quyền"
                action={() => {
                  setIdRole(null);
                  setShowModalAdd(true);
                }}
              />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Không có dữ liệu trùng khớp.
                    <br />
                    Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                  </span>
                }
                type="no-result"
              />
            )}
          </Fragment>
        )
      ) : !isLoading && listRole && listRole.length > 0 ? (
        <div style={{ marginTop: 40, backgroundColor: "white", minHeight: "50rem", overflow: "auto", maxHeight: "55rem", padding: "0 2rem" }}>
          <Chart
            chartType="OrgChart"
            data={dataChart}
            options={options}
            width={"100%"}
            // width={parentArray.length > 0 ? `${parentArray.length <= 3  ? (parentArray.length * 40) : (parentArray.length * 20)}rem` : '100%'}
            // height="400px"
            chartEvents={[
              {
                eventName: "select",
                callback({ chartWrapper }) {
                  const chart = chartWrapper.getChart();
                  chart.container.addEventListener("click", (ev) => {
                    console.log(ev.target.attributes?.title?.value);
                    console.log("ev", ev);

                    setIdRole(ev.target.attributes.title.value);
                    setShowModalEditParentDepartment(true);
                  });
                },
              },
            ]}
          />
        </div>
      ) : isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          {isPermissions ? (
            <SystemNotification type="no-permission" />
          ) : isNoItem ? (
            <SystemNotification
              description={
                <span>
                  Hiện tại chưa có nhóm quyền nào. <br />
                  Hãy thêm mới nhóm quyền đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm mới nhóm quyền"
              action={() => {
                setIdRole(null);
                setShowModalAdd(true);
              }}
            />
          ) : (
            <SystemNotification
              description={
                <span>
                  Không có dữ liệu trùng khớp.
                  <br />
                  Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                </span>
              }
              type="no-result"
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
