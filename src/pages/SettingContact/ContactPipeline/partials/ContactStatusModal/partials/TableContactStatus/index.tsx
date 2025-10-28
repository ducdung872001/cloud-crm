import React, { Fragment } from "react";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ITableContactStatusProps } from "model/contactStatus/PropsModel";

export default function TableContactStatus(props: ITableContactStatusProps) {
  const { isLoading, listContactStatus, titles, dataFormat, dataMappingArray, actionsTable, setIsActiveForm, isPermissions } = props;

  return (
    <Fragment>
      {!isLoading && listContactStatus && listContactStatus.length > 0 ? (
        <BoxTable
          name="ContactStatus"
          titles={titles}
          items={listContactStatus}
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
              Hiện tại chưa có trạng thái nào. <br />
              Hãy thêm mới trạng thái đầu tiên nhé!
            </span>
          }
          type="no-item"
          titleButton="Thêm mới trạng thái"
          action={() => {
            setIsActiveForm(true);
          }}
        />
      )}
    </Fragment>
  );
}
