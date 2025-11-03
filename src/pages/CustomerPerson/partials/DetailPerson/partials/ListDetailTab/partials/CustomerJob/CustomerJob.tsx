import React, { Fragment, useEffect, useRef, useState } from "react";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Button from "components/button/button";
import WorkOrderService from "services/WorkOrderService";
import AddWorkModal from "pages/MiddleWork/partials/ListWork/partials/AddWorkModal/AddWorkModal";
import { IAction } from "model/OtherModel";
import { PaginationProps, DataPaginationDefault } from "components/pagination/pagination";
import { showToast } from "utils/common";
import _ from "lodash";
import { getPageOffset } from "reborn-util";
import moment from "moment";
import { CircularProgressbar } from "react-circular-progressbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import Badge from "components/badge/badge";

import "./CustomerJob.scss";

export default function CustomerJob({ dataCustomer }) {
  const [listWork, setListWork] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
    projectId: -1,
    customerId: dataCustomer.id,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Công việc",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const isMounted = useRef(false);

  const abortController = new AbortController();

  const getListWork = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await WorkOrderService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListWork(result.items);
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
      getListWork(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  const titles = ["STT", "Tên công việc", "Người nhận việc", "Thời gian", "Thuộc dự án", "Tiến độ", "Trạng thái công việc"];

  const dataFormat = ["text-center", "", "", "", "", "text-center", "text-center"];

  //! đoạn này xử lý vấn đề hiển thị thông tin xem bao giờ thực hiện
  const handleUnfulfilled = (time) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(time).getTime();

    if (currentTime < startTime) {
      if ((startTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((startTime - currentTime) / (60 * 60 * 1000) >= 1) {
        return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return <span className="status-unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 1000))} phút`}</span>;
      }
    } else {
      if ((currentTime - startTime) / (24 * 60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 ngày thì trả về ngày, không thì trả về giờ
        return <span className="status-cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - startTime) / (60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 giờ thì trả về giờ, không thì trả về phút
        return <span className="status-cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return <span className="status-cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 1000))} phút`}</span>;
      }
    }
  };

  const handleProcessing = (start, end) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const calculatorTime = (endTime - startTime) / 3;

    if (startTime > currentTime) {
      return <span className="status-processing">Đang thực hiện</span>;
    } else if (currentTime >= startTime && currentTime <= endTime) {
      if (endTime - currentTime >= calculatorTime) {
        return <span className="status-processing">Đang thực hiện</span>;
      } else {
        if ((endTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
          return <span className="status-processing--waring">{`Còn ${Math.round((endTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
        } else if ((endTime - currentTime) / (60 * 60 * 1000) >= 1) {
          return <span className="status-processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
        } else {
          return <span className="status-processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 1000))} phút`}</span>;
        }
      }
    } else {
      if ((currentTime - endTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="status-cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - endTime) / (60 * 60 * 1000) >= 1) {
        return <span className="status-cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return (
          <span className="status-cancelled">{`Quá hạn ${
            Math.round((currentTime - endTime) / (60 * 1000)) === 0 ? 1 : Math.round((currentTime - endTime) / (60 * 1000))
          } phút`}</span>
        );
      }
    }
  };

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.employeeName,
    item.startTime || item.endTime ? `${moment(item.startTime).format("DD/MM/YYYY")} - ${moment(item.endTime).format("DD/MM/YYYY")}` : "",
    item.projectName,
    <div key={item.id} className="percent__finish--work">
      <CircularProgressbar value={item.percent || 0} text={`${item.percent || 0}%`} className="value-percent" />
    </div>,
    item.status == 0 ? (
      handleUnfulfilled(item.startTime)
    ) : item.status == 1 ? (
      handleProcessing(item.startTime, item.endTime)
    ) : item.status == 2 ? (
      <Badge key={item.id} text="Đã hoàn thành" variant="success" />
    ) : item.status == 3 ? (
      <Badge key={item.id} text="Đã hủy" variant="error" />
    ) : (
      <Badge key={item.id} text="Tạm dừng" variant="warning" />
    ),
  ];

  const [idWork, setIdWork] = useState<number>(null);

  const actionsTable = (item: any): IAction[] => {
    return [
      ...(item.status == 2 || item.status == 3
        ? []
        : [
            {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setIdWork(item.id);
                setShowModalAdd(true);
              },
            },
            {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]),
    ];
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const onDelete = async (id: number) => {
    const response = await WorkOrderService.delete(id);

    if (response.code === 0) {
      showToast("Xóa công việc thành công", "success");
      getListWork(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa công việc
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <div className={`page-content customer__job${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách công việc</li>
            </ul>
            <Tippy content="Thêm mới công việc" delay={[100, 0]} animation="scale-extreme">
              <div className="add-ticket">
                <Button
                  color="success"
                  onClick={() => {
                    setIdWork(null);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="PlusCircle" />
                </Button>
              </div>
            </Tippy>
          </div>
        </div>
        {!isLoading && listWork && listWork.length > 0 ? (
          <BoxTable
            name="Công việc"
            titles={titles}
            items={listWork}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            <SystemNotification
              description={
                <span>
                  Hiện tại chưa có công việc nào. <br />
                  Hãy thêm mới công việc đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm mới công việc"
              action={() => {
                setIdWork(null);
                setShowModalAdd(true);
              }}
            />
          </Fragment>
        )}
      </div>
      <AddWorkModal
        type="project"
        onShow={showModalAdd}
        idWork={idWork}
        onHide={(reload) => {
          if (reload) {
            getListWork(params);
          }
          setShowModalAdd(false);
        }}
        customerId={dataCustomer.id}
        customerName={dataCustomer.name}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
