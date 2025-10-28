import React, { Fragment } from "react";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ITablePomProps } from "model/pom/PropsModel";

export default function TablePom(props: ITablePomProps) {
  const { isLoading, listPom, titles, dataFormat, dataMappingArray, actionsTable, setIsActiveForm, isPermissions } = props;

  return (
    <Fragment>
      {!isLoading && listPom && listPom.length > 0 ? (
        <BoxTable
          name="Pom"
          titles={titles}
          items={listPom}
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
              Hiện tại chưa có vật tư tiêu hao nào. <br />
              Hãy thêm mới vật tư tiêu hao đầu tiên nhé!
            </span>
          }
          type="no-item"
          titleButton="Thêm mới vật tư tiêu hao"
          action={() => {
            setIsActiveForm(true);
          }}
        />
      )}
    </Fragment>
  );
}
