import React, { Fragment } from "react";
import { ITableWarrantyProps } from "model/warranty/PropsModel";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";

export default function TableWarranty(props: ITableWarrantyProps) {
  const {
    listSaveSearch,
    customerFilterList,
    params,
    setParams,
    titles,
    listWarranty,
    pagination,
    dataMappingArray,
    dataFormat,
    listIdChecked,
    bulkActionList,
    setListIdChecked,
    actionsTable,
    isLoading,
    setDataWarranty,
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
        isSaveSearch={true}
        listSaveSearch={listSaveSearch}
        isFilter={true}
        listFilterItem={customerFilterList}
        updateParams={(paramsNew) => setParams(paramsNew)}
      />
      {!isLoading && listWarranty && listWarranty.length > 0 ? (
        <BoxTable
          name="Phiếu bảo hành"
          titles={titles}
          items={listWarranty}
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
                  Hiện tại chưa có phiếu bảo hành nào. <br />
                  Hãy thêm mới phiếu bảo hành đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm mới phiếu bảo hành"
              action={() => {
                setDataWarranty(null);
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
