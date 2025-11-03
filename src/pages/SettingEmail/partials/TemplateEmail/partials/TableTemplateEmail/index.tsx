import React, { Fragment } from "react";
import { ITableTemplateEmailProps } from "model/templateEmail/PropsModel";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";

export default function TableTemplateEmail(props: ITableTemplateEmailProps) {
  const {
    params,
    setParams,
    isNoItem,
    listSaveSearch,
    listFilterItem,
    isLoading,
    listTemplateEmail,
    titles,
    pagination,
    dataFormat,
    dataMappingArray,
    listIdChecked,
    bulkActionItems,
    setListIdChecked,
    actionsTable,
    isPermissions,
    setDataTemplateEmail,
  } = props;

  return (
    <Fragment>
      <SearchBox
        name="Tên mẫu"
        params={params}
        isFilter={true}
        isSaveSearch={true}
        listSaveSearch={listSaveSearch}
        listFilterItem={listFilterItem}
        updateParams={(paramsNew) => setParams(paramsNew)}
      />
      {!isLoading && listTemplateEmail && listTemplateEmail.length > 0 ? (
        <BoxTable
          name="Mẫu email"
          titles={titles}
          items={listTemplateEmail}
          isPagination={true}
          dataPagination={pagination}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          isBulkAction={true}
          listIdChecked={listIdChecked}
          bulkActionItems={bulkActionItems}
          striped={true}
          setListIdChecked={(listId) => setListIdChecked(listId)}
          actions={actionsTable}
          actionType="inline"
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
                  Hiện tại chưa có mẫu email nào. <br />
                  Hãy thêm mới mẫu email đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm mới mẫu email"
              action={() => {
                setDataTemplateEmail(null);
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
