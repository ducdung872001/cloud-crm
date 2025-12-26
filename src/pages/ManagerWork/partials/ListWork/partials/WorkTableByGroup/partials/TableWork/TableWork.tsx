import React, { Fragment } from "react";
import { ITableWorkOrderProps } from "model/workOrder/PropsModel";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";

export default function TableWork(props: ITableWorkOrderProps) {
  const {
    listSaveSearch,
    customerFilterList,
    params,
    setParams,
    titles,
    listWork,
    pagination,
    dataMappingArray,
    dataFormat,
    listIdChecked,
    bulkActionList,
    setListIdChecked,
    actionsTable,
    isLoading,
    setIdWork,
    setShowModalAdd,
    isNoItem,
  } = props;

  return (
    <Fragment>
      {/* <SearchBox
        key={customerFilterList.length}
        name="Tên công việc"
        params={params}
        isFilter={true}
        isSaveSearch={true}
        listSaveSearch={listSaveSearch}
        listFilterItem={customerFilterList}
        updateParams={(paramsNew) => setParams(paramsNew)}
      /> */}
      {!isLoading && listWork && listWork.length > 0 ? (
        <BoxTable
          name="Công việc"
          titles={titles}
          items={listWork}
          isPagination={true}
          dataPagination={pagination}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          isBulkAction={true}
          listIdChecked={listIdChecked}
          bulkActionItems={bulkActionList}
          striped={true}
          setListIdChecked={(listId) => setListIdChecked(listId)}
          actions={actionsTable}
          actionType="inline"
        />
      ) : isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          {isNoItem ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100px",
                fontSize: "18px",
                color: "#555",
              }}
            >
              <span>
                Hiện tại chưa có công việc nào. <br />
              </span>
            </div>
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
