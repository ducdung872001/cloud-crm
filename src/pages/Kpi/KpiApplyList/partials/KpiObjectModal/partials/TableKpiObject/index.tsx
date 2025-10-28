import React, { Fragment } from "react";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ITableKpiObjectProps } from "model/kpiObject/PropsModel";

export default function TableKpiObject(props: ITableKpiObjectProps) {
  const { isLoading, listKpiObject, titles, dataFormat, dataMappingArray, actionsTable, setIsActiveForm, isPermissions } = props;

  return (
    <Fragment>
      {!isLoading && listKpiObject && listKpiObject.length > 0 ? (
        <BoxTable
          name="Đối tượng áp dụng"
          titles={titles}
          items={listKpiObject}
          dataFormat={dataFormat}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          striped={true}
          actions={actionsTable}
          actionType="inline"
        />
      ) : isLoading ? (
        <Loading />
      ) : isPermissions ? (
        <SystemNotification type="no-permission" />
      ) : (
        <SystemNotification
          description={
            <span>
              Hiện tại chưa có đối tượng áp dụng nào. <br />
              Hãy thêm mới đối tượng áp dụng đầu tiên nhé!
            </span>
          }
          type="no-item"
          // titleButton="Thêm mới đối tượng"
          // action={() => {
          //   setIsActiveForm(true);
          // }}
        />
      )}
    </Fragment>
  );
}
