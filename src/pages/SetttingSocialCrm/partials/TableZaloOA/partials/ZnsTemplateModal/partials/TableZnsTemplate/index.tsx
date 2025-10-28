import React, { Fragment } from "react";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ITableZnsTemplateProps } from "model/znsTemplate/PropsModel";

export default function TableZnsTemplate(props: ITableZnsTemplateProps) {
  const { isLoading, listZnsTemplate, titles, dataFormat, dataMappingArray, actionsTable, setIsActiveForm, isPermissions } = props;

  return (
    <Fragment>
      {!isLoading && listZnsTemplate && listZnsTemplate.length > 0 ? (
        <BoxTable
          name="ZnsTemplate"
          titles={titles}
          items={listZnsTemplate}
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
              Hiện tại chưa có mẫu ZNS nào. <br />
              Hãy thêm mới mẫu ZNS đầu tiên nhé!
            </span>
          }
          type="no-item"
          titleButton="Tải mới mẫu Zalo ZNS"
          action={() => {
            setIsActiveForm(true);
          }}
        />
      )}
    </Fragment>
  );
}
