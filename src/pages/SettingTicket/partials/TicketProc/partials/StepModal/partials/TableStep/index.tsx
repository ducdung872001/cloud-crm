import React, { Fragment } from "react";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ITableStepProps } from "model/ticketStep/PropsModel";

export default function TableStep(props: ITableStepProps) {
  const { isLoading, listStep, titles, dataFormat, dataMappingArray, actionsTable, setIsActiveForm, isPermissions } = props;

  return (
    <Fragment>
      {!isLoading && listStep && listStep.length > 0 ? (
        <BoxTable
          name="Bước xử lý"
          titles={titles}
          items={listStep}
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
              Hiện tại chưa có bước xử lý nào. <br />
              Hãy thêm mới bước xử lý đầu tiên nhé!
            </span>
          }
          type="no-item"
          titleButton="Thêm mới bước xử lý"
          action={() => {
            setIsActiveForm(true);
          }}
        />
      )}
    </Fragment>
  );
}
