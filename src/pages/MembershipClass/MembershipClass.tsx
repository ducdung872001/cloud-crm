import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import "./MembershipClass.scss";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "@/components/icon";
import Button from "@/components/button/button";
import { DataPaginationDefault, PaginationProps } from "@/components/pagination/pagination";
import { IRoyaltyFilterRequest } from "@/model/loyalty/RoyaltyRequest";
import { ILoyaltySegmentResposne } from "@/model/loyalty/RoyaltyResposne";
import LoyaltyService from "@/services/LoyaltyService";
import { formatCurrency, showToast } from "@/utils/common";
import Tippy from "@tippyjs/react";
import AddLoyaltySegmentModal from "./AddLoyaltySegmentModal";
import Dialog, { IContentDialog } from "@/components/dialog/dialog";
import { ITitleActions } from "@/components/titleAction/titleAction";

// ── UI style dựa theo điểm (chỉ giữ màu sắc / icon, KHÔNG mock rate/desList) ──
const getStyle = (point: number) => {
  if (point <= 100)
    return {
      icon: "🥉",
      borderColor: "#fed7aa",
      backgroundColor: "linear-gradient(to right, #fb923c, #f59e0b)",
    };
  if (point <= 450)
    return {
      icon: "🥈",
      borderColor: "#e2e8f0",
      backgroundColor: "linear-gradient(to right, #94a3b8, #64748b)",
    };
  if (point <= 800)
    return {
      icon: "🥇",
      borderColor: "#fef08a",
      backgroundColor: "linear-gradient(to right, #facc15, #f59e0b)",
    };
  return {
    icon: "💎",
    borderColor: "#a5f3fc",
    backgroundColor: "linear-gradient(to right, #22d3ee, #0ea5e9)",
  };
};

// Parse benefits JSON string → string[]
function parseBenefits(jsonStr?: string): string[] {
  if (!jsonStr) return [];
  try {
    const arr = JSON.parse(jsonStr);
    if (Array.isArray(arr)) return arr.map(String).filter(Boolean);
  } catch { }
  return [];
}

export default function MembershipClass(props) {
  document.title = "Hạng thành viên";
  const { onBackProps } = props;
  const isMounted = useRef(false);

  const [listData, setListData] = useState<ILoyaltySegmentResposne[]>([]);
  const [params, setParams] = useState<IRoyaltyFilterRequest>({ name: "", limit: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [isNoItem, setIsNoItem] = useState(false);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ILoyaltySegmentResposne>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Hạng hội viên",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  const abortController = new AbortController();

  const fetchList = async (paramsSearch: IRoyaltyFilterRequest) => {
    setIsLoading(true);
    const response = await LoyaltyService.listLoyaltySegment(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      // Merge UI style vào item, KHÔNG override rate/desList từ DB
      const data = (result?.items || []).map((item) => ({
        ...getStyle(item.point),
        ...item,
        desList: parseBenefits(item.benefits),
      }));
      setListData(data);
      setPagination((prev) => ({
        ...prev,
        page: +result.page,
        sizeLimit: paramsSearch.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(paramsSearch.limit ?? DataPaginationDefault.sizeLimit)),
      }));
      if (+result.total === 0 && +result.page === 1) setIsNoItem(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => { setParams((prev) => ({ ...prev })); }, []);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    fetchList(params);
    return () => { abortController.abort(); };
  }, [params]);

  const onDelete = async (id: number) => {
    const response = await LoyaltyService.deleteLoyaltySegment(id);
    if (response.code === 0) {
      showToast("Xóa hạng hội viên thành công", "success");
      fetchList(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item: ILoyaltySegmentResposne) => {
    const content: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa hạng hội viên</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa hạng <strong>{item.name}</strong>?
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => { if (item?.id) onDelete(item.id); },
    };
    setContentDialog(content);
    setShowDialog(true);
  };

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => { setSelectedItem(null); setShowModalAdd(true); },
      },
    ],
  };

  return (
    <Fragment>
      <div className="page-content page-membership-class">
        <HeaderTabMenu
          title="Hạng thành viên"
          titleBack="Khách hàng thành viên"
          onBackProps={onBackProps}
          titleActions={titleActions}
        />

        {isLoading && (
          <div className="membership-loading">
            <Icon name="Loading" style={{ width: 32, height: 32 }} />
          </div>
        )}

        {!isLoading && listData.length === 0 && (
          <div className="membership-empty">
            <Icon name="MembershipClass" style={{ width: 48, opacity: 0.3 }} />
            <p>Chưa có hạng hội viên nào. Bấm <strong>Thêm mới</strong> để bắt đầu.</p>
          </div>
        )}

        {listData.length > 0 && (
          <div className="package-list">
            {listData.map((item, index) => (
              <div key={index} className="package-item" style={{ borderColor: item.borderColor }}>
                {/* Header */}
                <div className="header-item" style={{ background: item.backgroundColor }}>
                  <div style={{ fontSize: 35 }}>{item.icon}</div>
                  <h3 style={{ fontWeight: "700", fontSize: 18, color: "#FFFFFF" }}>{item.name}</h3>
                  {/* Badge tỷ lệ tích điểm từ DB */}
                  {item.rate && (
                    <span className="segment-rate-badge">{item.rate}</span>
                  )}
                </div>

                {/* Body */}
                <div className="body-item">
                  <div>
                    <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: "500" }}>Chỉ tiêu yêu cầu</p>
                    <p style={{ fontSize: 16, fontWeight: "600" }}>
                      {formatCurrency(item.point, ",", "")} điểm
                    </p>
                  </div>

                  {item.rate && (
                    <div style={{ marginTop: "1rem" }}>
                      <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: "500" }}>Tỷ lệ tích điểm</p>
                      <p style={{ fontSize: 20, color: "#f97316", fontWeight: "800" }}>{item.rate}</p>
                    </div>
                  )}

                  {/* Quyền lợi từ DB (benefits) */}
                  {item.desList && item.desList.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      {item.desList.map((el, idx) => (
                        <p key={idx} style={{ fontSize: 14, fontWeight: "400" }}>
                          <span style={{ color: "#10b981", fontWeight: "700" }}>✓</span> {el}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Nếu chưa có dữ liệu rate/benefits → nhắc cấu hình */}
                  {!item.rate && (!item.desList || item.desList.length === 0) && (
                    <p className="segment-no-config">
                      Chưa cấu hình quyền lợi —{" "}
                      <button
                        type="button"
                        className="segment-config-link"
                        onClick={() => { setSelectedItem(item); setShowModalAdd(true); }}
                      >
                        Thiết lập ngay
                      </button>
                    </p>
                  )}
                </div>

                {/* Footer actions */}
                <div className="footer-item">
                  <Tippy content="Sửa">
                    <div onClick={() => { setSelectedItem(item); setShowModalAdd(true); }}>
                      <Icon name="Pencil" style={{ width: 17, fill: "var(--primary-color)" }} />
                    </div>
                  </Tippy>
                  <Tippy content="Xoá">
                    <div onClick={() => showDialogConfirmDelete(item)}>
                      <Icon name="Trash" style={{ width: 19, fill: "var(--error-darker-color)" }} />
                    </div>
                  </Tippy>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddLoyaltySegmentModal
        onShow={showModalAdd}
        data={selectedItem}
        onHide={(reload) => { if (reload) fetchList(params); setShowModalAdd(false); }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}