import Icon from "components/icon";
import { IActionModal } from "model/OtherModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import moment from "moment";
import React, { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import EmployeeService from "services/EmployeeService";
import WorkOrderService from "services/WorkOrderService";
import { showToast } from "utils/common";
import UpdatePeopleInvolved from "./partials/UpdatePeopleInvolved/UpdatePeopleInvolved";
import UpdateRelatedWork from "./partials/UpdateRelatedWork/UpdateRelatedWork";
import Loading from "components/loading";
import "./index.scss";
import StatusTask from "../../../StatusTask";

export default function InfoWorkArea(props: any) {
  const { idData, onShow, onHide } = props;
  const [dataEmployee, setDataEmployee] = useState(null);
  const [data, setData] = useState<IWorkOrderResponseModel>(null);
  console.log("data", data);

  const [isInvolveWorks, setIsInvolveWorks] = useState<boolean>(true);
  const [isInvolveCustomer, setIsInvolveCustomer] = useState<boolean>(true);
  // const checkShowFullScreen = localStorage.getItem("showFullScreenModalPartnerEform");
  // const [showFullScreen, setShowFullScreen] = useState<boolean>(checkShowFullScreen ? JSON.parse(checkShowFullScreen) : false);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => onHide(),
          },
        ],
      },
    }),
    [onHide]
  );

  const takeDataEmployee = async () => {
    const response = await EmployeeService.info();
    if (response.code === 0) setDataEmployee(response.result);
  };

  const handGetDetailWork = async (id: number) => {
    if (!id) return;
    const response = await WorkOrderService.detail(id);
    if (response.code === 0) {
      setData(response.result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  useEffect(() => {
    if (onShow && idData) {
      takeDataEmployee();
      handGetDetailWork(idData);
    } else {
      setData(null);
    }
  }, [idData, onShow]);

  const convertTime = (time: string) => {
    if (!time) return "";
    return moment(time).format("DD/MM/YYYY HH:mm");
  };

  const convertWorkLoadUnit = (workLoad: number, unit: string) => {
    if (workLoad) {
      if (unit === "D") {
        return `${workLoad} ngày`;
      } else if (unit === "H") {
        return `${workLoad} giờ`;
      } else if (unit === "M") {
        return `${workLoad} phút`;
      }
    } else {
      return "";
    }
  };

  const listInfoBasicItem = [
    {
      className: "in-project",
      title: data?.opportunityId ? "Cơ hội" : "Dự án",
      name: data?.projectName,
    },
    {
      className: "type-work",
      title: "Loại công việc",
      name: data?.workTypeName ? data?.workTypeName : "",
    },
    {
      className: "time-start",
      title: "Thời gian bắt đầu",
      name: data?.startTime ? data?.startTime : "Chưa xác định",
    },
    {
      className: "time-end",
      title: "Thời gian kết thúc",
      name: data?.endTime ? data?.endTime : "Chưa xác định",
    },
    {
      className: "amount-work",
      title: "Khối lượng công việc",
      name: data?.workLoad ? data?.workLoadUnit ? convertWorkLoadUnit(data?.workLoad, data?.workLoadUnit) : `${data?.workLoad}` : "Chưa xác định",
    },
    {
      className: JSON.parse(data?.docLink || "[]").length > 0 ? "related-document" : "",
      title: "Tài liệu liên quan",
      name: JSON.parse(data?.docLink || "[]").length > 0 ? data?.docLink : "",
    },
  ];

  //! đoạn này xử lý vấn đề hiển thị thông tin xem bao giờ thực hiện
  const handleUnfulfilled = (time) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(time).getTime();
    console.log();

    if (currentTime < startTime) {
      if ((startTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="__unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((startTime - currentTime) / (60 * 60 * 1000) >= 1) {
        return <span className="__unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return <span className="__unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 1000))} phút`}</span>;
      }
    } else {
      if ((currentTime - startTime) / (24 * 60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 ngày thì trả về ngày, không thì trả về giờ
        return <span className="__cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - startTime) / (60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 giờ thì trả về giờ, không thì trả về phút
        return <span className="__cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return <span className="__cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 1000))} phút`}</span>;
      }
    }
  };

  //! đoạn này xử lý trong quá trình thực hiện
  const handleProcessing = (start, end) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const calculatorTime = (endTime - startTime) / 3;

    if (startTime > currentTime) {
      return <span className="__processing">Đang thực hiện</span>;
    } else if (currentTime >= startTime && currentTime <= endTime) {
      if (endTime - currentTime >= calculatorTime) {
        return <span className="__processing">Đang thực hiện</span>;
      } else {
        if ((endTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
          return <span className="__processing--waring">{`Còn ${Math.round((endTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
        } else if ((endTime - currentTime) / (60 * 60 * 1000) >= 1) {
          return <span className="__processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
        } else {
          return <span className="__processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 1000))} phút`}</span>;
        }
      }
    } else {
      if ((currentTime - endTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="__cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - endTime) / (60 * 60 * 1000) >= 1) {
        return <span className="__cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return (
          <span className="__cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (60 * 1000)) === 0 ? 1 : Math.round((currentTime - endTime) / (60 * 1000))
            } phút`}</span>
        );
      }
    }
  };

  const COLLAPSE_MAX_HEIGHT = 150;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);

  const contentText = useMemo(() => data?.content || "", [data?.content]);
  const isOverflowRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const measureOverflow = () => {
    const el = contentRef.current;
    if (!el) return;

    if (isExpanded) return;

    const overflow = el.scrollHeight > el.clientHeight + 1;

    if (overflow !== isOverflowRef.current) {
      isOverflowRef.current = overflow;
      setIsOverflow(overflow);
    }
  };


  const scheduleMeasure = () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      measureOverflow();
    });
  };


  useLayoutEffect(() => {
    scheduleMeasure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentText, isExpanded]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const ro = new ResizeObserver(() => {
      scheduleMeasure();
    });

    ro.observe(wrap);

    return () => {
      ro.disconnect();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (prev === true && contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      return next;
    });
  };

  if (!onShow && !data) return null;
  return (
    <>
      {data ? (
        <div className="info__work--area" style={{ padding: "15px" }}>
          <div className="info__basic">
            <h3 className="title-basic">{data?.name ?? ""}</h3>
            <div className="info__basic--item">
              {listInfoBasicItem.map((item, idx) => (
                <div key={idx} className={`item ${item.className}`}>
                  <h4 className="title">{item.title}</h4>
                  {item.className === "content-work" ? (
                    <p className="content">{item.name}</p>
                  ) : (
                    <h4 className="name">{typeof item.name === "string" && item.name.includes("[") ? "Có tài liệu" : item.name}</h4>
                  )}
                </div>
              ))}

              <div className="item content-work">
                <h4 className="title">Nội dung công việc</h4>

                <div className={`content-wrap 
                  ${!isExpanded ? "is-collapsed" : ""}
                  ${isOverflow ? "has-overflow" : ""}
                  `} ref={wrapRef}>
                  <div
                    ref={contentRef}
                    className={`content 
                      ${isExpanded ? "is-expanded" : "is-collapsed"}
                      ${isOverflow ? "has-border" : "no-border"}`}
                    style={!isExpanded ? { maxHeight: `${COLLAPSE_MAX_HEIGHT}px` } : undefined}
                  >
                    {contentText || ""}
                  </div>
                </div>

                {(isExpanded || isOverflow) && (
                  <button type="button" className="btn-toggle-content" onClick={toggleExpand}>
                    {isExpanded ? "Thu gọn" : "Xem thêm"}
                  </button>
                )}

              </div>

              <div className="item inprogress-work">
                <h4 className="title">Tiến độ</h4>
                <div className="show-inprogress">
                  <CircularProgressbar value={data?.percent || 0} text={`${data?.percent || 0}%`} className="value-percent" />
                </div>
              </div>

              <div className="item status-work">
                <h4 className="title">Trạng thái</h4>
                <StatusTask {...data} />
              </div>
            </div>
          </div>

          <div className="involve-customers mt-3">
            <div
              className="title-item title-customers"
              onClick={() => setIsInvolveCustomer(!isInvolveCustomer)}
              style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
            >
              <span>Người liên quan</span>
              <span>{isInvolveCustomer ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
            </div>
            {isInvolveCustomer && data?.id && <UpdatePeopleInvolved data={data} />}
          </div>

          <div className="involve-works mt-3">
            <div
              className="title-item title-works"
              onClick={() => setIsInvolveWorks(!isInvolveWorks)}
              style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
            >
              <span>Công việc liên quan</span>
              <span>{isInvolveWorks ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
            </div>
            {isInvolveWorks && data?.id && <UpdateRelatedWork data={data} />}
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Loading />
        </div>
      )}
    </>
  );
}
