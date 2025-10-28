import Badge from "components/badge/badge";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import Modal, { ModalHeader } from "components/modal/modal";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import _ from "lodash";
import moment from "moment";
import React, { Fragment, useEffect, useState } from "react";
import BusinessProcessService from "services/BusinessProcessService";

export const LogErrorTableModal: React.FC = (props: any) => {
  const { isOpen, processDetail = {}, setIsOpen } = props;
  const { nodeId, processId, potId } = processDetail;

  const [data, setData] = useState([]);
  const [params, setParams] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Lỗi",
    isChooseSizeLimit: true,
  });

  const abortController = new AbortController();

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams: any) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const logParams = {
      page: params.page || 1,
      size: params.limit || 10,
      nodeId,
      processId,
      potId,
    };

    const fetchLog = async () => {
      try {
        const response = await BusinessProcessService.onGetErrorLog(logParams, abortController.signal);
        if (response.code === 0) {
          const result = response?.result?.data;
          const size = response?.result?.size;
          const total = response?.result?.total;
          const page = response?.result?.page;

          setData(result);
          setPagination({
            ...pagination,
            page,
            sizeLimit: size ?? DataPaginationDefault.sizeLimit,
            totalItem: total,
            totalPage: Math.ceil(+total / +(size ?? DataPaginationDefault.sizeLimit)),
            setPage: (page: number) => {
              setParams((prev: any) => ({ ...prev, page: page }));
            },
            chooseSizeLimit: (limit: number) => {
              setParams((prev: any) => ({ ...prev, page: 1, limit: limit }));
            },
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") console.error("Error:", error);
      } finally {
        if (!abortController.signal.aborted) setIsLoading(false);
      }
    };
    fetchLog();
    return () => abortController.abort();
  }, [isOpen === true, params]);

  const titles = ["Node ID", "Type Node", "Pot ID", "Process ID", "Trạng thái", "Payload", "Attempt number", "Retry Time"];
  const dataFormat = ["", "", "", "", "text-center", "text-center", "text-center", ""];
  const dataMappingArray = (item: any, index: number) => [
    item.nodeId,
    item.typeNode,
    item.potId,
    item.processId,
    <Badge
      variant={item.status === 3 ? "success" : item.status === 2 ? "error" : "primary"}
      text={item.status === 3 ? "Success" : item.status === 2 ? "Failed" : "Retrying"}
      key={index}
    />,
    item.payload,
    item.attemptNumber,
    // Format theo GMT + 7
    item.retryTime ? moment(item.retryTime).utcOffset(7).format("DD/MM/YYYY HH:mm:ss") : "",
  ];

  return (
    <Modal isOpen={isOpen} isCentered={true} staticBackdrop={true} size={"xxl"} className={"modal-handle-task"} toggle={() => setIsOpen(false)}>
      {isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          <ModalHeader title="Errors Log" toggle={() => setIsOpen(false)} />
          {
            <BoxTable
              name="Errors Log"
              titles={titles}
              items={data}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              isPagination={true}
              dataPagination={pagination}
            />
          }
        </Fragment>
      )}
    </Modal>
  );
};
