import React, { Fragment } from "react";
import { ITableTicketProps } from "model/ticket/PropsModel";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";

export default function TableTicket(props: ITableTicketProps) {
  const {
    listSaveSearch,
    customerFilterList,
    params,
    setParams,
    titles,
    listTicket,
    pagination,
    dataMappingArray,
    dataFormat,
    listIdChecked,
    bulkActionList,
    setListIdChecked,
    actionsTable,
    isLoading,
    setDataTicket,
    setShowModalAdd,
    isNoItem,
    isPermissions,
    isService,
    dataSize,
  } = props;

  return (
    <Fragment>
      <SearchBox
        name="Số điện thoại"
        params={params}
        isFilter={true}
        isSaveSearch={true}
        listSaveSearch={listSaveSearch}
        listFilterItem={customerFilterList}
        updateParams={(paramsNew) => setParams(paramsNew)}
      />
      {!isLoading && listTicket && listTicket.length > 0 ? (
        <BoxTable
          name="ticket"
          titles={titles}
          items={listTicket}
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
          dataSize={dataSize}
        />
      ) : isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          {isPermissions ? (
            <SystemNotification type="no-permission" />
          ) : isService ? (
            <SystemNotification
              type="no-service"
              description={
                <span>
                  Hiện tại hệ thống đang gặp sự cố. <br />
                  Bạn vui lòng thử lại sau nhé!
                </span>
              }
            />
          ) : isNoItem ? (
            <SystemNotification
              description={
                <span>
                  Hiện tại chưa có ticket nào. <br />
                  Hãy thêm mới ticket đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm mới ticket"
              action={() => {
                setDataTicket(null);
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
