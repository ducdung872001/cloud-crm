import React, { Fragment } from "react";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ITableContractStageProps } from "model/contractApproach/PropsModel";

export default function TableContractStage(props: ITableContractStageProps) {
  const { isLoading, listContractStage, titles, dataFormat, dataMappingArray, actionsTable, setIsActiveForm, isPermissions } = props;

  return (
    <Fragment>
      {!isLoading && listContractStage && listContractStage.length > 0 ? (
        <BoxTable
          name="ContractStage"
          titles={titles}
          items={listContractStage}
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
              Hiện tại chưa có pha nào. <br />
              Hãy thêm mới pha đầu tiên nhé!
            </span>
          }
          type="no-item"
          titleButton="Thêm mới pha"
          action={() => {
            setIsActiveForm(true);
          }}
        />
      )}
    </Fragment>
  );
}
