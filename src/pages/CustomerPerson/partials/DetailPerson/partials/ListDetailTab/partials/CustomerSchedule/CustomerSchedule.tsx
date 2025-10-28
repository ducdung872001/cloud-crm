import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import Badge from "components/badge/badge";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Button from "components/button/button";
import { PaginationProps, DataPaginationDefault } from "components/pagination/pagination";
import { showToast } from "utils/common";
import _ from "lodash";
import { getPageOffset } from "reborn-util";
import moment from "moment";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import { ContextType, UserContext } from "contexts/userContext";
import ScheduleCommonService from "services/ScheduleCommonService";
import AddConsultationScheduleModal from "pages/CalendarCommon/partials/AddConsultationScheduleModal/AddConsultationScheduleModal";

import "./CustomerSchedule.scss";

export default function CustomerSchedule({ idCustomer }) {
  const isMounted = useRef(false);

  const [listSchedule, setListSchedule] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { dataBranch, idEmployee } = useContext(UserContext) as ContextType;

  const [params, setParams] = useState<any>({
    name: "",
    startTime: "",
    endTime: "",
    lstCustomerId: idCustomer,
    types: "1,2",
    sources: 2,
    branchId: dataBranch?.value,
    lstId: idEmployee,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Lịch hẹn",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListSchedule = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ScheduleCommonService.listCommon(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = (response.result || []).map((item) => {
        return {
          id: item.id,
          title: item.title,
          start: new Date(moment(item.startTime).format()),
          end: new Date(moment(item.endTime).format()),
          type: item.type,
          employeeId: item.employeeId,
          employeeName: item.employeeName,
          employeeAvatar: item.employeeAvatar,
          status: item.status,
        };
      });
      setListSchedule(result);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && !params?.name && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListSchedule(params);
      const paramsTemp = _.cloneDeep(params);

      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }

    return () => {
      abortController.abort();
    };
  }, [params]);

  const titles = ["STT", "Tiêu đề lịch hẹn", "Nhân viên thực hiện", "Thời gian bắt đầu", "Thời gian kết thúc", "Loại lịch hẹn"];

  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.title,
    item.employeeName,
    moment(item.startTime).format("DD/MM/YYYY"),
    moment(item.endTime).format("DD/MM/YYYY"),
    <Badge
      key={item.id}
      variant={item.type === 2 ? "primary" : item.type === 3 ? "secondary" : "warning"}
      text={item.type === 2 ? "Lịch tư vấn" : item.type === 3 ? "Lịch điều trị" : "Lịch công việc"}
    />,
  ];

  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  return (
    <div className={`page-content customer__job${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách lịch hẹn</li>
            </ul>
            <Tippy content="Thêm mới lịch hẹn" delay={[100, 0]} animation="scale-extreme">
              <div className="add-ticket">
                <Button
                  color="success"
                  onClick={() => {
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
        </div>
        {!isLoading && listSchedule && listSchedule.length > 0 ? (
          <BoxTable
            name="Lịch hẹn"
            titles={titles}
            items={listSchedule}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            <SystemNotification
              description={
                <span>
                  Hiện tại chưa có lịch hẹn nào. <br />
                  Hãy thêm mới lịch hẹn đầu tiên nhé!
                </span>
              }
              type="no-item"
            />
          </Fragment>
        )}
      </div>
      <AddConsultationScheduleModal
        onShow={showModalAdd}
        onHide={(reload) => {
          if (reload) {
            getListSchedule(params);
          }

          setShowModalAdd(false);
        }}
        idCustomer={idCustomer}
        startDate={new Date()}
      />
    </div>
  );
}
