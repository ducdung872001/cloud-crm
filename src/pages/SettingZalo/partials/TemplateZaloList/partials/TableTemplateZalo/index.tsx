import React, { Fragment } from "react";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ITableTemplateZaloProps } from "model/templateZalo/PropsModel";

export default function TableTemplateZalo(props: ITableTemplateZaloProps) {
  const {
    params,
    setParams,
    isNoItem,
    listSaveSearch,
    listFilterItem,
    isLoading,
    listTemplateZalo,
    titles,
    pagination,
    dataFormat,
    dataMappingArray,
    listIdChecked,
    bulkActionItems,
    setListIdChecked,
    actionsTable,
    isPermissions,
    setDataTemplateZalo,
    setIsAddEditTemplateZalo
  } = props;

  return (
    <Fragment>
      <SearchBox
        name="Tiêu đề tin"
        params={params}
        isFilter={true}
        isSaveSearch={true}
        listSaveSearch={listSaveSearch}
        listFilterItem={listFilterItem}
        updateParams={(paramsNew) => setParams(paramsNew)}
      />
      {!isLoading && listTemplateZalo && listTemplateZalo.length > 0 ? (
        <BoxTable
          name="Mẫu Zalo"
          titles={titles}
          items={listTemplateZalo}
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
                  Hiện tại chưa có mẫu Zalo nào. <br />
                  Hãy thêm mới mẫu Zalo đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm mới mẫu Zalo"
              action={() => {
                setDataTemplateZalo(null);
                setIsAddEditTemplateZalo(true);
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
