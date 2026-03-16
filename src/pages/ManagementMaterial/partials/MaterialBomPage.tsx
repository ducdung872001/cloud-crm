import React, { Fragment, useState, useMemo } from "react";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Badge from "components/badge/badge";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { IBomResponse } from "@/model/material/BomModel";
import { MOCK_BOM_LIST } from "@/assets/mock/Material";
import "./MaterialBomPage.scss";

type BomSegment = "all" | "active" | "draft" | "inactive";

interface MaterialBomPageProps {
  onBackProps?: (isBack: boolean) => void;
}

// ── Status helpers ───────────────────────────────────────────
const STATUS_LABEL: Record<IBomResponse["status"], string> = {
  active: "Đang dùng",
  draft: "Bản nháp",
  inactive: "Ngừng dùng",
};
const STATUS_VARIANT: Record<IBomResponse["status"], "success" | "warning" | "secondary"> = {
  active: "success",
  draft: "warning",
  inactive: "secondary",
};

// ── BOM detail panel (inline sub-component) ──────────────────
function BomDetailPanel({
  bom,
  onClose,
  onEdit,
}: {
  bom: IBomResponse;
  onClose: () => void;
  onEdit: (b: IBomResponse) => void;
}) {
  return (
    <div className="bom-detail-panel">
      <div className="bom-detail-panel__header">
        <button className="bom-detail-panel__close" onClick={onClose} title="Đóng">
          <Icon name="X" />
        </button>
        <div className="bom-detail-panel__code">{bom.code}</div>
        <div className="bom-detail-panel__name">{bom.productName}</div>
        <div className="bom-detail-panel__meta">
          <Badge text={STATUS_LABEL[bom.status]} variant={STATUS_VARIANT[bom.status]} />
          <span className="bom-detail-panel__ver">{bom.version}</span>
        </div>
      </div>

      <div className="bom-detail-panel__qs">
        <div className="bom-detail-panel__qs-i">
          <div className="bom-detail-panel__qs-v">{bom.outputQty.toLocaleString("vi")}</div>
          <div className="bom-detail-panel__qs-l">Sản lượng/mẻ</div>
        </div>
        <div className="bom-detail-panel__qs-i">
          <div className="bom-detail-panel__qs-v">{bom.outputUnit}</div>
          <div className="bom-detail-panel__qs-l">Đơn vị</div>
        </div>
        <div className="bom-detail-panel__qs-i">
          <div className="bom-detail-panel__qs-v" style={{ color: "var(--primary-color)" }}>
            {bom.ingredients.length}
          </div>
          <div className="bom-detail-panel__qs-l">Nguyên liệu</div>
        </div>
      </div>

      <div className="bom-detail-panel__section-title">Danh sách nguyên liệu</div>
      <div className="bom-detail-panel__ingredients">
        {bom.ingredients.map((ing, i) => (
          <div key={ing.materialId} className="bom-ing-row">
            <div className="bom-ing-row__idx">{i + 1}</div>
            <div className="bom-ing-row__body">
              <div className="bom-ing-row__name">{ing.materialName}</div>
              <div className="bom-ing-row__code">{ing.materialCode}</div>
            </div>
            <div className="bom-ing-row__qty">
              <span className="bom-ing-row__qty-val">{ing.qty}</span>
              <span className="bom-ing-row__qty-unit">{ing.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {bom.note && (
        <div className="bom-detail-panel__note">
          <Icon name="Info" />
          <span>{bom.note}</span>
        </div>
      )}

      <div className="bom-detail-panel__dates">
        {bom.createdAt && <span>Tạo: {bom.createdAt}</span>}
        {bom.updatedAt && <span>Cập nhật: {bom.updatedAt}</span>}
      </div>

      <div className="bom-detail-panel__actions">
        <button className="bom-detail-panel__btn bom-detail-panel__btn--outline" onClick={() => onEdit(bom)}>
          <Icon name="Edit" /> Chỉnh sửa
        </button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function MaterialBomPage({ onBackProps }: MaterialBomPageProps) {
  document.title = "Công thức (BOM)";

  const [allBom] = useState<IBomResponse[]>(MOCK_BOM_LIST);
  const [detailBom, setDetailBom] = useState<IBomResponse | null>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading] = useState<boolean>(false);
  const [segment, setSegment] = useState<BomSegment>("all");
  const [searchVal, setSearchVal] = useState<string>("");
  const [params, setParams] = useState({ name: "", limit: 10, page: 1 });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    { key: "all", name: "Công thức BOM", is_active: true },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Công thức",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((p) => ({ ...p, page })),
    chooseSizeLimit: (limit) => setParams((p) => ({ ...p, limit })),
  });

  // Filter + search
  const filtered = useMemo(() => {
    let data = allBom;
    if (params.name) {
      const q = params.name.toLowerCase();
      data = data.filter(
        (b) => b.productName.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)
      );
    }
    if (segment !== "all") {
      data = data.filter((b) => b.status === segment);
    }
    return data;
  }, [allBom, params.name, segment]);

  // Paginate
  const paged = useMemo(() => {
    const start = (params.page - 1) * params.limit;
    return filtered.slice(start, start + params.limit);
  }, [filtered, params.page, params.limit]);

  // Stats
  const stats = useMemo(() => {
    const active = allBom.filter((b) => b.status === "active").length;
    const draft = allBom.filter((b) => b.status === "draft").length;
    const inactive = allBom.filter((b) => b.status === "inactive").length;
    return { total: allBom.length, active, draft, inactive };
  }, [allBom]);

  // TitleActions
  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm công thức",
        color: "primary",
        callback: () => showToast("Tính năng thêm công thức đang được phát triển", "info"),
      },
    ],
  };

  // Table config
  const titles = ["STT", "Mã CT", "Tên thành phẩm", "Số NVL", "Sản lượng / mẻ", "Phiên bản", "Trạng thái", ""];
  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: IBomResponse, index: number) => {
    const stt = (params.page - 1) * params.limit + index + 1;
    return [
      stt,
      <span key="code" className="bom-code-col">{item.code}</span>,
      <div key="name" className="bom-name-cell">
        <div className="bom-name-cell__name">{item.productName}</div>
        {item.note && <div className="bom-name-cell__note">{item.note}</div>}
      </div>,
      <span key="ing-count" className="bom-ing-count">{item.ingredients.length} NVL</span>,
      <span key="output">
        {item.outputQty.toLocaleString("vi")} {item.outputUnit}
      </span>,
      <span key="ver" className="bom-ver-badge">{item.version}</span>,
      <Badge key="status" text={STATUS_LABEL[item.status]} variant={STATUS_VARIANT[item.status]} />,
      null,
    ];
  };

  const actionsTable = (item: IBomResponse): IAction[] => {
    const isChecked = listIdChecked?.length > 0;
    return [
      {
        title: "Chi tiết",
        icon: <Icon name="Eye" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => { if (!isChecked) setDetailBom(item); },
      },
      {
        title: "Kiểm tra đủ NVL",
        icon: <Icon name="Search" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => {
          if (!isChecked) showToast(`Tính năng kiểm tra đủ NVL cho "${item.code}" đang được phát triển`, "info");
        },
      },
      {
        title: "Sao chép",
        icon: <Icon name="Copy" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => {
          if (!isChecked) showToast("Tính năng sao chép công thức đang được phát triển", "info");
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isChecked ? "icon-disabled" : "icon-error"} />,
        disabled: isChecked,
        callback: () => { if (!isChecked) showDialogConfirmDelete(item); },
      },
    ];
  };

  const showDialogConfirmDelete = (item?: IBomResponse) => {
    setContentDialog({
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: "Xóa công thức",
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa công thức{" "}
          <strong>{item?.productName ?? ""}</strong>? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => {
        showToast("Xóa công thức thành công", "success");
        if (detailBom?.id === item?.id) setDetailBom(null);
        setShowDialog(false);
        setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  return (
    <div className="page-content page-bom-list">
      {/* ── HEADER ── */}
      <div className="action-navigation">
        <div className="action-backup">
          {onBackProps ? (
            <>
              <h1 className="title-first" onClick={() => onBackProps(true)} title="Quay lại">
                Nguyên vật liệu
              </h1>
              <Icon name="ChevronRight" onClick={() => onBackProps(true)} />
              <h1 className="title-last">Công thức (BOM)</h1>
            </>
          ) : (
            <h1 className="title-last" style={{ color: "var(--text-primary-color)" }}>
              Công thức (BOM)
            </h1>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      {/* ── STAT CARDS ── */}
      <div className="bom-stat-row">
        <div className="bom-stat-card">
          <div className="bom-stat-card__icon bom-stat-card__icon--blue">🧪</div>
          <div>
            <div className="bom-stat-card__val">{stats.total}</div>
            <div className="bom-stat-card__lbl">Tổng công thức</div>
          </div>
        </div>
        <div className="bom-stat-card">
          <div className="bom-stat-card__icon bom-stat-card__icon--green">✅</div>
          <div>
            <div className="bom-stat-card__val bom-stat-card__val--green">{stats.active}</div>
            <div className="bom-stat-card__lbl">Đang sử dụng</div>
          </div>
        </div>
        <div className="bom-stat-card">
          <div className="bom-stat-card__icon bom-stat-card__icon--amber">📝</div>
          <div>
            <div className="bom-stat-card__val bom-stat-card__val--amber">{stats.draft}</div>
            <div className="bom-stat-card__lbl">Bản nháp</div>
          </div>
        </div>
        <div className="bom-stat-card">
          <div className="bom-stat-card__icon bom-stat-card__icon--grey">🚫</div>
          <div>
            <div className="bom-stat-card__val">{stats.inactive}</div>
            <div className="bom-stat-card__lbl">Ngừng dùng</div>
          </div>
        </div>
      </div>

      <div className="card-box bom-list-card">
        <SearchBox
          name="Công thức BOM"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(p) => setParams(p)}
          placeholderSearch="Tìm tên thành phẩm hoặc mã công thức..."
        />

        <div className="bom-list-toolbar">
          <div className="bom-list-seg">
            {(
              [
                { key: "all",      label: "Tất cả",     count: allBom.length },
                { key: "active",   label: "Đang dùng",  count: stats.active },
                { key: "draft",    label: "Bản nháp",   count: stats.draft },
                { key: "inactive", label: "Ngừng dùng", count: stats.inactive },
              ] as { key: BomSegment; label: string; count: number }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`bom-list-segb ${segment === tab.key ? "active" : ""}`}
                onClick={() => setSegment(tab.key)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="bom-list-body">
          <div className={`bom-list-table-wrap${detailBom ? " has-detail" : ""}`}>
            {!isLoading && paged.length > 0 ? (
              <BoxTable
                name="Công thức BOM"
                titles={titles}
                items={paged}
                isPagination={true}
                dataPagination={{
                  ...pagination,
                  page: params.page,
                  sizeLimit: params.limit,
                  totalItem: filtered.length,
                  totalPage: Math.ceil(filtered.length / params.limit),
                }}
                dataMappingArray={dataMappingArray}
                dataFormat={dataFormat}
                isBulkAction={true}
                listIdChecked={listIdChecked}
                bulkActionItems={[
                  {
                    title: "Xóa công thức đã chọn",
                    callback: () => {
                      showToast("Tính năng xóa nhiều đang được phát triển", "info");
                    },
                  },
                ]}
                striped={true}
                setListIdChecked={setListIdChecked}
                actions={actionsTable}
                actionType="inline"
                onClickRow={(row: IBomResponse) => setDetailBom(row)}
              />
            ) : isLoading ? (
              <Loading />
            ) : (
              <Fragment>
                {filtered.length === 0 && !params.name ? (
                  <SystemNotification
                    description={
                      <span>
                        Chưa có công thức nào.
                        <br />
                        Hãy thêm công thức sản xuất đầu tiên!
                      </span>
                    }
                    type="no-item"
                    titleButton="Thêm công thức"
                    action={() => showToast("Tính năng đang được phát triển", "info")}
                  />
                ) : (
                  <SystemNotification
                    description={
                      <span>
                        Không tìm thấy công thức phù hợp.
                        <br />
                        Hãy thử tìm kiếm với từ khóa khác.
                      </span>
                    }
                    type="no-result"
                  />
                )}
              </Fragment>
            )}
          </div>

          {/* ── DETAIL PANEL ── */}
          <div className={`bom-list-detail-panel${detailBom ? "" : " hidden"}`}>
            {detailBom && (
              <BomDetailPanel
                bom={detailBom}
                onClose={() => setDetailBom(null)}
                onEdit={(b) => {
                  showToast(`Tính năng sửa công thức "${b.code}" đang được phát triển`, "info");
                }}
              />
            )}
          </div>
        </div>
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
