import Icon from "components/icon";
import { IActionModal } from "model/OtherModel";
import { IWorkOrderDocFile, IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
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

  const docFiles = useMemo<IWorkOrderDocFile[]>(() => {
    try {
      const raw = JSON.parse(data?.docLink || "[]");
      if (!Array.isArray(raw)) return [];

      return raw
        .filter((x: any) => x && typeof x.url === "string")
        .map((x: any) => ({
          url: x.url,
          type: x.type,
          name: x.name,
          size: typeof x.size === "number" ? x.size : undefined,
        }));
    } catch {
      return [];
    }
  }, [data?.docLink]);

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
      className: docFiles.length > 0 ? "related-document" : "",
      title: "Tài liệu liên quan",
      name: docFiles.length > 0 ? data?.docLink : "",
    },
  ];

  const [isOpenDoc, setIsOpenDoc] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openDocs = () => {
    if (docFiles.length === 0) return;
    setActiveIndex(0);
    setIsOpenDoc(true);
  };
  const closeDocs = () => setIsOpenDoc(false);

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

  const [docShowRows, setDocShowRows] = useState(1); // mặc định 1 hàng
  const DOC_PER_ROW = 4;

  const totalDocs = docFiles.length;
  const totalRows = Math.ceil(totalDocs / DOC_PER_ROW);

  const visibleCount = Math.min(totalDocs, docShowRows * DOC_PER_ROW);
  const visibleDocs = docFiles.slice(0, visibleCount);

  const canToggleRows = totalRows > 1;
  const isExpandedRows = docShowRows >= totalRows;

  const toggleDocRows = () => {
    if (!canToggleRows) return;
    setDocShowRows((prev) => (prev >= totalRows ? 1 : prev + 1));
  };

  useEffect(() => {
    if (!isOpenDoc) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // tránh bắt phím khi đang nhập liệu
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || (e.target as HTMLElement | null)?.isContentEditable;
      if (isTyping) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeDocs();
        return;
      }

      if (docFiles.length <= 1) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + docFiles.length) % docFiles.length);
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % docFiles.length);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpenDoc, docFiles.length, closeDocs]);

  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpenDoc) {
      requestAnimationFrame(() => modalRef.current?.focus());
    }
  }, [isOpenDoc]);



  if (!onShow && !data) return null;
  return (
    <>
      {data ? (
        <div className="info__work--area" style={{ padding: "15px" }}>
          <div className="info__basic">
            <h3 className="title-basic">{data?.name ?? ""}</h3>
            <div className="info__basic--item">
              {listInfoBasicItem.map((item, idx) => {
                const isDocItem = item.className === "related-document";

                return (
                  <div
                    key={idx}
                    className={`item ${item.className}`}
                    role={isDocItem ? "button" : undefined}
                    tabIndex={isDocItem ? 0 : undefined}
                    onClick={() => {
                      if (isDocItem) openDocs();
                    }}
                    onKeyDown={(e) => {
                      if (!isDocItem) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDocs();
                      }
                    }}
                    style={isDocItem ? { cursor: "pointer" } : undefined}
                  >
                    <h4 className="title">{item.title}</h4>

                    <h4 className="name">
                      {isDocItem && docFiles.length > 0 ? "Có " + docFiles.length + " ảnh" : ""}
                    </h4>

                    {isDocItem && docFiles.length > 0 && (
                      <div className="doc-preview" onClick={(e) => e.stopPropagation()}>
                        <div className="list-document">
                          {visibleDocs.map((f, i) => (
                            <button
                              key={f.url + i}
                              type="button"
                              className="image-item"
                              onClick={() => {
                                const globalIndex = docFiles.findIndex((x) => x.url === f.url);
                                setActiveIndex(globalIndex >= 0 ? globalIndex : 0);
                                setIsOpenDoc(true);
                              }}
                              title={f.name || `Tài liệu ${i + 1}`}
                            >
                              <img src={f.url} alt={f.name || `doc-${i + 1}`} loading="lazy" />
                            </button>
                          ))}
                        </div>

                        {canToggleRows && (
                          <button type="button" className="btn-toggle-docs" onClick={toggleDocRows}>
                            {isExpandedRows ? "Rút gọn" : "Xem thêm"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}


              {isOpenDoc && (
                <div className="doc-modal-backdrop" onClick={closeDocs}>
                  <div className="doc-modal" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
                    <div className="doc-modal__header">
                      <h3>Tài liệu liên quan ({docFiles.length})</h3>
                      <button type="button" className="doc-modal__close" onClick={closeDocs}>
                        ✕
                      </button>
                    </div>

                    <div className="doc-modal__body">
                      <div className="doc-viewer">
                        <button
                          type="button"
                          className="nav-btn"
                          onClick={() => setActiveIndex((i) => (i - 1 + docFiles.length) % docFiles.length)}
                          disabled={docFiles.length <= 1}
                        >
                          ‹
                        </button>

                        <div className="doc-image-wrap">
                          <img
                            src={docFiles[activeIndex]?.url}
                            alt={docFiles[activeIndex]?.name || `Tài liệu ${activeIndex + 1}`}
                            className="doc-image"
                            loading="lazy"
                          />
                          <div className="doc-meta">
                            {/* <div className="doc-name">{docFiles[activeIndex]?.name || `Tài liệu ${activeIndex + 1}`}</div> */}
                            <div className="doc-sub">
                              {docFiles[activeIndex]?.type ? docFiles[activeIndex]?.type.toUpperCase() : ""}
                              {typeof docFiles[activeIndex]?.size === "number"
                                ? ` • ${(docFiles[activeIndex].size / 1024).toFixed(1)} KB`
                                : ""}
                            </div>
                            {/* <a
                              href={docFiles[activeIndex]?.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="doc-open"
                            >
                              Mở ảnh trong tab mới
                            </a> */}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="nav-btn"
                          onClick={() => setActiveIndex((i) => (i + 1) % docFiles.length)}
                          disabled={docFiles.length <= 1}
                        >
                          ›
                        </button>
                      </div>
                      {docFiles.length > 1 && (
                        <div className="doc-thumbs">
                          {docFiles.map((f, i) => (
                            <button
                              key={f.url + i}
                              type="button"
                              className={`thumb ${i === activeIndex ? "active" : ""}`}
                              onClick={() => setActiveIndex(i)}
                              title={f.name || `Tài liệu ${i + 1}`}
                            >
                              <img src={f.url} alt={f.name || `thumb-${i + 1}`} loading="lazy" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="doc-modal__footer">
                      <button type="button" onClick={closeDocs}>
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}


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
