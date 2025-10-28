import React, { Fragment, useEffect, useState } from "react";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, getPageOffset, trimContent } from "reborn-util";
import { IAction } from "model/OtherModel";
import { IListBillProps } from "model/customer/PropsModel";
import { IContractResponse } from "model/contract/ContractResponseModel";
import { IContractFilterRequest } from "model/contract/ContractRequestModel";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { showToast } from "utils/common";
import ContractService from "services/ContractService";
import Badge from "components/badge/badge";

export default function ContractCustomer(props) {
  const { tab } = props;
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listContract, setListContract] = useState<IContractResponse[]>([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [params, setParams] = useState<IContractFilterRequest>({
    name: "",
    limit: 100,
  });

  useEffect(() => {
    if (id || tab) {
      setParams({ ...params, customerId: +id });
    }
  }, [id, tab]);

  const getListContract = async (paramsSearch: IContractFilterRequest) => {
    setIsLoading(true);

    const response = await ContractService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListContract(result.items);

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (tab == "tab_five" && params?.customerId) {
      getListContract(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [tab, params]);

  const titles = ["STT", "Tên hợp đồng", "Giá trị hợp đồng", "Pha hợp đồng", "Quy trình hợp đồng", "Tên công ty", "Trạng thái"];

  const dataFormat = ["text-center", "", "text-right", "", "", "", "text-center"];

  const dataMappingArray = (item: IContractResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <span
      onClick={() => {
        navigate(`/detail_contract/contractId/${item.id}`);
      }}
      style={{cursor: 'pointer'}}
    >
      {item.name}
    </span>,
    formatCurrency(item.dealValue, ",", "đ"),
    item.pipelineName,
    item.approachName,
    item.customerName,
    <Badge
      key={item.id}
      text={!item.status ? "Chưa phê duyệt" : item.status === 1 ? "Đang xử lý" : item.status === 2 ? "Đã phê duyệt" : "Từ chối duyệt"}
      variant={!item.status ? "secondary" : item.status === 1 ? "primary" : item.status === 2 ? "success" : "error"}
    />,
  ];

  return (
    <Fragment>
      {!isLoading && listContract && listContract.length > 0 ? (
        <BoxTable
          name="Danh sách hợp đồng"
          titles={titles}
          items={listContract}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          striped={true}
        />
      ) : isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          {isNoItem && (
            <SystemNotification
              description={
                <span>
                  Hiện tại bạn chưa có hợp đồng nào. <br />
                </span>
              }
              type="no-item"
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
