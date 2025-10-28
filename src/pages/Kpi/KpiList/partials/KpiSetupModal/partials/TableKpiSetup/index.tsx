import React, { Fragment } from "react";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ITableKpiSetupProps } from "model/kpiSetup/PropsModel";

export default function TableKpiSetup(props: ITableKpiSetupProps) {
  const { isLoading, listKpiSetup, titles, dataFormat, dataMappingArray, actionsTable, setIsActiveForm, isPermissions } = props;

  return (
    <Fragment>
      {!isLoading && listKpiSetup && listKpiSetup.length > 0 ? (
        <BoxTable
          name="Thiết lập ngưỡng KPI"
          titles={titles}
          items={listKpiSetup}
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
              Hiện tại chưa có thiết lập ngưỡng KPI nào. <br />
              Hãy thêm mới ngưỡng KPI đầu tiên nhé!
            </span>
          }
          type="no-item"
          titleButton="Thêm mới ngưỡng KPI"
          action={() => {
            setIsActiveForm(true);
          }}
        />
      )}
    </Fragment>
  );
}
