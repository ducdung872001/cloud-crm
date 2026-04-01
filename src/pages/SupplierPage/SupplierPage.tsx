import React, {
  Fragment,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Badge from "components/badge/badge";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Input from "components/input/input";
import { showToast, formatCurrency } from "utils/common";
import { getPageOffset } from "reborn-util";
import InventorySupplierService, {
  ISupplierItem,
  ISupplierSummary,
} from "services/InventorySupplierService";
import AddSupplierModal from "./partials/AddSupplierModal";
import "./SupplierPage.scss";

// ── Màu avatar theo ký tự đầu ──────────────────────────────────
const AVATAR_COLORS: Record<string, string> = {
  A: "#ef4444", B: "#f97316", C: "#f59e0b", D: "#eab308",
  E: "#84cc16", F: "#22c55e", G: "#10b981", H: "#14b8a6",
  I: "#06b6d4", J: "#0ea5e9", K: "#3b82f6", L: "#6366f1",
  M: "#8b5cf6", N: "#a855f7", O: "#ec4899", P: "#f43f5e",
  Q: "#ef4444", R: "#f97316", S: "#f59e0b", T: "#22c55e",
  U: "#10b981", V: "#3b82f6", W: "#6366f1", X: "#8b5cf6",
  Y: "#a855f7", Z: "#ec4899",
};

function getAvatarColor(name: string) {
  const ch = (name ?? "").charAt(0).toUpperCase();
  return AVATAR_COLORS[ch] ?? "#6b7280";
}

// ── Mock fallback để tránh màn hình trắng khi API chưa live ────
const MOCK_SUMMARY: ISupplierSummary = {
  total: 0, active: 0, hasDebt: 0, overdueDebt: 0, totalDebt: 0,
};

export default function SupplierPage() {
  document.title = "Quản lý nhà cung cấp";

  const abortRef = useRef<AbortController | null>(null);

  const [list, setList]             = useState<ISupplierItem[]>([]);
  const [summary, setSummary]       = useState<ISupplierSummary>(MOCK_SUMMARY);
  const [dataItem, setDataItem]     = useState<ISupplierItem | null>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd]   = useState(false);
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [isNoItem, setIsNoItem]           = useState(false);

  const [params, setParams] = useState({
    keyword: "",
    groupId: 0,
    isActive: -1,
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nhà cung cấp",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((p) => ({ ...p, page })),
    chooseSizeLimit: (limit) => setParams((p) => ({ ...p, limit, page: 1 })),
  });

  // ── Fetch summary ──────────────────────────────────────────────
  const fetchSummary = useCallback(() => {
    InventorySupplierService.summary()
      .then((res) => {
        if (res?.code === 0 && res.result) setSummary(res.result);
      })
      .catch(() => {});
  }, []);

  // ── Fetch list ─────────────────────────────────────────────────
  const fetchList = useCallback((p: typeof params) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);

    InventorySupplierService.list(p, abortRef.current.signal)
      .then((res) => {
        if (res?.code === 0 && res.result) {
          const { items, total, page, size } = res.result;
          setList(items ?? []);
          setIsNoItem(!items?.length && !p.keyword);
          setPagination((prev) => ({
            ...prev,
            page:      page  ?? p.page,
            sizeLimit: size  ?? p.limit,
            totalItem: total ?? 0,
            totalPage: Math.ceil((total ?? 0) / (size ?? p.limit)),
          }));
        } else {
          setList([]);
          setIsNoItem(true);
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setList([]);
          setIsNoItem(true);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchList(params);
  }, []);

  useEffect(() => {
    fetchList(params);
  }, [params]);

  // ── Delete ─────────────────────────────────────────────────────
  const onDelete = async (id: number) => {
    const res = await InventorySupplierService.delete(id);
    if (res?.code === 0) {
      showToast("Xóa nhà cung cấp thành công", "success");
      fetchList(params);
      fetchSummary();
    } else {
      showToast(res?.message ?? "Có lỗi xảy ra", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ISupplierItem) => {
    setContentDialog({
      color:      "error",
      className:  "dialog-delete",
      isCentered: true,
      isLoading:  true,
      title:      "Xóa nhà cung cấp",
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa nhà cung cấp{" "}
          {item ? <strong>{item.name}</strong>
               : <strong>{listIdChecked.length} nhà cung cấp đã chọn</strong>}?{" "}
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText:    "Hủy",
      cancelAction:  () => { setShowDialog(false); setContentDialog(null); },
      defaultText:   "Xóa",
      defaultAction: () => { if (item?.id) onDelete(item.id); },
    });
    setShowDialog(true);
  };

  // ── Table ──────────────────────────────────────────────────────
  const titles = ["STT", "Nhà cung cấp", "Liên hệ", "Nhóm", "Công nợ", "Tổng nhập", "Trạng thái", ""];
  const dataFormat = ["text-center", "", "", "", "text-right", "text-right", "text-center", "text-center"];

  const dataMappingArray = (item: ISupplierItem, index: number) => {
    const stt       = getPageOffset(params) + index + 1;
    const initial   = (item.name ?? "?").charAt(0).toUpperCase();
    const bgColor   = getAvatarColor(item.name);
    const tags: string[] = (() => {
      try { return item.tags ? JSON.parse(item.tags) : []; }
      catch { return []; }
    })();

    return [
      stt,

      // Cột nhà cung cấp: avatar + tên + mã
      <div key="name" className="sup-name-cell">
        {item.avatar
          ? <img src={item.avatar} alt="" className="sup-avatar sup-avatar--img" />
          : <div className="sup-avatar" style={{ background: bgColor }}>{initial}</div>
        }
        <div className="sup-name-cell__info">
          <span className="sup-name-cell__name">{item.name}</span>
          {item.code && <span className="sup-name-cell__code">{item.code}</span>}
        </div>
      </div>,

      // Cột liên hệ: sđt + email
      <div key="contact" className="sup-contact-cell">
        {item.phone && (
          <span className="sup-contact-cell__row">
            <Icon name="Phone" /> {item.phone}
          </span>
        )}
        {item.email && (
          <span className="sup-contact-cell__row sup-contact-cell__row--muted">
            <Icon name="Mail" /> {item.email}
          </span>
        )}
        {!item.phone && !item.email && <span className="sup-muted">—</span>}
      </div>,

      // Cột nhóm + nhãn
      <div key="group" className="sup-group-cell">
        {item.groupName && (
          <Badge text={item.groupName} variant="primary" />
        )}
        {tags.map((tag, i) => (
          <Badge key={i} text={tag} variant="secondary" />
        ))}
        {!item.groupName && tags.length === 0 && <span className="sup-muted">—</span>}
      </div>,

      // Công nợ
      <span
        key="debt"
        className={`sup-debt-cell${item.debt > 0 ? " sup-debt-cell--red" : item.debt < 0 ? " sup-debt-cell--green" : ""}`}
      >
        {item.debt !== 0 ? formatCurrency(item.debt) : <span className="sup-muted">0</span>}
      </span>,

      // Tổng nhập
      <span key="total" className="sup-total-cell">
        {item.totalPurchase > 0
          ? formatCurrency(item.totalPurchase)
          : <span className="sup-muted">—</span>}
      </span>,

      // Trạng thái
      <Badge
        key="status"
        text={item.isActive ? "Đang hợp tác" : "Ngừng hợp tác"}
        variant={item.isActive ? "success" : "secondary"}
      />,

      null,
    ];
  };

  const actionsTable = (item: ISupplierItem) => {
    const isChecked = listIdChecked.length > 0;
    return [
      {
        title:    "Sửa",
        icon:     <Icon name="Edit" />,
        disabled: isChecked,
        callback: () => { if (!isChecked) { setDataItem(item); setShowModalAdd(true); } },
      },
      {
        title:    item.isActive ? "Ngừng hợp tác" : "Kích hoạt",
        icon:     <Icon name={item.isActive ? "EyeOff" : "Eye"} />,
        disabled: isChecked,
        callback: async () => {
          if (isChecked) return;
          const res = await InventorySupplierService.updateActive(item.id, !item.isActive);
          if (res?.code === 0) {
            showToast(item.isActive ? "Đã ngừng hợp tác" : "Đã kích hoạt", "success");
            fetchList(params);
            fetchSummary();
          } else {
            showToast(res?.message ?? "Có lỗi xảy ra", "error");
          }
        },
      },
      {
        title:    "Xóa",
        icon:     <Icon name="Trash" />,
        disabled: isChecked,
        callback: () => { if (!isChecked) showDialogConfirmDelete(item); },
      },
    ];
  };

  const bulkActionList: BulkActionItemModel[] = [
    { title: "Xóa nhà cung cấp", callback: () => showDialogConfirmDelete() },
  ];

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => { setDataItem(null); setShowModalAdd(true); },
      },
    ],
    actions_extra: [],
  };

  // ── KPI cards ──────────────────────────────────────────────────
  const statCards = [
    { dot: "#5b6af0", num: summary.total,    lbl: "Tổng NCC" },
    { dot: "#10b981", num: summary.active,   lbl: "Đang hợp tác" },
    { dot: "#8b5cf6", num: summary.hasDebt,  lbl: "Có công nợ" },
    {
      dot: "#ef4444",
      num: summary.totalDebt > 0 ? formatCurrency(summary.totalDebt) : "0",
      lbl: "Tổng công nợ",
      red: summary.totalDebt > 0,
    },
  ];

  // ── Render ─────────────────────────────────────────────────────
  return (
    <Fragment>
      <div className={`page-content page-supplier${isNoItem ? " bg-white" : ""}`}>
        <TitleAction title="Quản lý nhà cung cấp" titleActions={titleActions} />

        <div className="card-box d-flex flex-column">
          {/* ── Search + filter chips ── */}
          <div className="quick__search">
            <div className="quick__search--start">
              <Input
                name="keyword"
                className="input-search"
                value={params.keyword}
                fill={true}
                required={true}
                icon={<Icon name="Search" />}
                placeholder="Tìm kiếm theo tên, SĐT, mã, mã số thuế..."
                onChange={(e) =>
                  setParams((p) => ({ ...p, keyword: e.target.value, page: 1 }))
                }
              />
            </div>
            <div className="quick__search--right">
              <button
                className={`filter-chip${params.isActive === 1 ? " filter-chip--active" : ""}`}
                onClick={() =>
                  setParams((p) => ({
                    ...p,
                    isActive: p.isActive === 1 ? -1 : 1,
                    page: 1,
                  }))
                }
              >
                ✅ Đang hợp tác
              </button>
              <button
                className={`filter-chip${params.isActive === 0 ? " filter-chip--active" : ""}`}
                onClick={() =>
                  setParams((p) => ({
                    ...p,
                    isActive: p.isActive === 0 ? -1 : 0,
                    page: 1,
                  }))
                }
              >
                ⏸ Ngừng hợp tác
              </button>
            </div>
          </div>

          {/* ── KPI stats ── */}
          <div className="stats-row">
            {statCards.map((c, i) => (
              <div key={i} className="stat-pill">
                <div className="dot" style={{ background: c.dot }} />
                <div>
                  <div className="num" style={c.red ? { color: "#ef4444" } : undefined}>
                    {c.num}
                  </div>
                  <div className="lbl">{c.lbl}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Table ── */}
          {!isLoading && list.length > 0 ? (
            <BoxTable
              name="Nhà cung cấp"
              titles={titles}
              items={list}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={dataMappingArray}
              dataFormat={dataFormat}
              isBulkAction={true}
              listIdChecked={listIdChecked}
              bulkActionItems={bulkActionList}
              striped={true}
              setListIdChecked={setListIdChecked}
              actions={actionsTable}
              actionType="inline"
            />
          ) : isLoading ? (
            <Loading />
          ) : (
            <Fragment>
              {isNoItem ? (
                <SystemNotification
                  description={
                    <span>
                      Chưa có nhà cung cấp nào.
                      <br />
                      Hãy thêm nhà cung cấp đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm nhà cung cấp"
                  action={() => { setDataItem(null); setShowModalAdd(true); }}
                />
              ) : (
                <SystemNotification
                  description={
                    <span>
                      Không có dữ liệu trùng khớp.
                      <br />
                      Hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                    </span>
                  }
                  type="no-result"
                />
              )}
            </Fragment>
          )}
        </div>

        {/* ── Modals ── */}
        <AddSupplierModal
          onShow={showModalAdd}
          data={dataItem}
          onHide={(reload) => {
            if (reload) { fetchList(params); fetchSummary(); }
            setShowModalAdd(false);
            setDataItem(null);
          }}
        />

        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </Fragment>
  );
}
