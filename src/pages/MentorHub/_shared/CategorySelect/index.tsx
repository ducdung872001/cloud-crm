// [MH] CategorySelect — async paginated picker cho khoá học MentorHub.
//
// Lịch sử:
// - Bản đầu giả định taxonomy ở /inventory/category/* (CategoryServiceService).
// - 2026-05-08: BE inventory close cloud-crm#226 + cloud-inventory-master#43,
//   re-route sang sales. Permission đổi: INVENTORY_CATEGORY_WRITE → SALES_SERVICE_CATEGORY_WRITE.
// - 2026-05-09: BE sales ship cloud-sales-master#23 — endpoint sống tại
//   /sales/category-item/* (CategoryItemResource.java).
//
// Component dùng ServiceCategoryService gọi /sales/category-item/* (sales owner).
// loadOptions fail-soft sang MENTORHUB_DEFAULT_CATEGORIES mock khi BE lỗi/404.
//
// Spec UI: dropdown async + inline "+ Tạo danh mục mới" mở modal-in-modal.
// Wire vào CourseEdit Step 1 (replace <select> hardcoded CATEGORIES) cần làm sau khi:
//   1. RBAC seed permission SALES_SERVICE_CATEGORY_WRITE cho mentorhub tenant
//   2. Default categories đã seed cho tenant (qua bulk-create endpoint)

import React, { useState, useCallback, useContext } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import ServiceCategoryService from "services/ServiceCategoryService";
import { UserContext, ContextType } from "contexts/userContext";
import { showToast } from "utils/common";
import { MENTORHUB_DEFAULT_CATEGORIES } from "@/mocks/mentorhub";

// Permission key mới (sau re-route từ inventory sang sales).
// Trước: "INVENTORY_CATEGORY_WRITE" — đã deprecated theo cloud-crm#226 reply.
const PERMISSION_CREATE_CATEGORY = "SALES_SERVICE_CATEGORY_WRITE";

export interface CategoryOption {
  value: number;
  label: string;
}

interface CategorySelectProps {
  value: CategoryOption | null;
  onChange: (option: CategoryOption | null) => void;
  /** Mock fallback khi BE 401 / chưa setup categoryService. Default true cho dev. */
  enableMockFallback?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
}

interface LoadResult {
  options: CategoryOption[];
  hasMore: boolean;
  additional: { page: number };
}

const PAGE_SIZE = 20;

export default function CategorySelect({
  value,
  onChange,
  enableMockFallback = true,
  placeholder = "Chọn chuyên mục",
  isDisabled = false,
  className,
}: CategorySelectProps) {
  const ctx = useContext(UserContext) as ContextType;
  const canCreate = ctx?.permissions?.[PERMISSION_CREATE_CATEGORY] === true;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // bump để force AsyncPaginate refetch

  const loadOptions = useCallback(
    async (
      keyword: string,
      _prev: unknown,
      additional?: { page: number }
    ): Promise<LoadResult> => {
      const page = additional?.page ?? 1;
      try {
        const res = await ServiceCategoryService.list({
          keyword,
          page,
          limit: PAGE_SIZE,
        });
        const items = (res?.result?.items as Array<{ id: number; name: string }>) || [];
        const options = items.map((it) => ({ value: it.id, label: it.name }));
        const total = Number(res?.result?.total ?? 0);
        const hasMore = page * PAGE_SIZE < total;
        return { options, hasMore, additional: { page: page + 1 } };
      } catch {
        // Mock fallback — BE chưa mở 401 hoặc dev offline
        if (enableMockFallback && page === 1) {
          const filtered = MENTORHUB_DEFAULT_CATEGORIES.filter((c) =>
            !keyword || c.name.toLowerCase().includes(keyword.toLowerCase())
          );
          return {
            options: filtered.map((c) => ({ value: c.id, label: c.name })),
            hasMore: false,
            additional: { page: page + 1 },
          };
        }
        return { options: [], hasMore: false, additional: { page: page + 1 } };
      }
    },
    [enableMockFallback, refreshKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleCreated = (newCat: CategoryOption) => {
    onChange(newCat);
    setRefreshKey((k) => k + 1);
    setShowCreateModal(false);
  };

  return (
    <div className={className} style={{ position: "relative" }}>
      <AsyncPaginate
        key={refreshKey}
        value={value}
        loadOptions={loadOptions}
        onChange={(opt) => onChange(opt as CategoryOption | null)}
        additional={{ page: 1 }}
        debounceTimeout={300}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable
        noOptionsMessage={({ inputValue }) =>
          inputValue ? `Không có chuyên mục match "${inputValue}"` : "Chưa có chuyên mục"
        }
      />
      {canCreate && !isDisabled && (
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          style={{
            marginTop: 4,
            background: "transparent",
            border: "none",
            color: "#0F766E",
            cursor: "pointer",
            fontSize: 12,
            padding: "2px 4px",
          }}
        >
          + Tạo danh mục mới
        </button>
      )}
      {showCreateModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Inline create modal (modal-in-modal pattern). z-index cao để nằm trên CourseEdit.
// CHƯA confirm BE: endpoint update có làm create không. Đang giả định id=0 = create.
// Nếu BE expose endpoint riêng /category/create thì swap method ở đây.
// ────────────────────────────────────────────────────────────────────────────

interface CreateCategoryModalProps {
  onClose: () => void;
  onCreated: (option: CategoryOption) => void;
}

function CreateCategoryModal({ onClose, onCreated }: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast("Tên danh mục không được trống", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await ServiceCategoryService.update({
        name: trimmed,
        avatar: "",
        parentId: 0,
        position: 0,
        active: 1,
      });
      const newId =
        typeof res?.result === "object"
          ? (res.result as { id?: number })?.id
          : typeof res?.result === "number"
          ? (res.result as number)
          : null;
      if (!newId) {
        showToast(res?.message || "Tạo danh mục thất bại", "error");
        return;
      }
      onCreated({ value: newId, label: trimmed });
      showToast("Đã tạo danh mục", "success");
    } catch {
      showToast("Lỗi kết nối khi tạo danh mục", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100, // > CourseEdit modal
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          width: 420,
          maxWidth: "90vw",
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Tạo danh mục mới</h3>
        <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
          Tên danh mục <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !submitting) handleSubmit();
            if (e.key === "Escape" && !submitting) onClose();
          }}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid #d1d5db",
            borderRadius: 4,
            fontSize: 14,
          }}
          placeholder="Vd: Data & AI"
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            style={{
              padding: "8px 14px",
              background: "#0F766E",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: submitting || !name.trim() ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Đang tạo..." : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
}
