import React, { useState, useEffect, useRef, useCallback } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import CategoryServiceService from "services/CategoryServiceService";
import { showToast } from "utils/common";
import Loading from "@/components/loading";
import "./CategoryModal.scss";

// TYPE constants — khớp với backend ProductTaxonomyConstant
const TYPE_CATEGORY = 1; // Danh mục sản phẩm
const TYPE_TAG      = 3; // Tags sản phẩm

interface CategoryItem {
  id: number;
  name: string;
  position: number;
  status: number;
  remainingProductCount?: number;
}

interface TabConfig {
  key: "category" | "tag";
  label: string;
  type: number;
  placeholder: string;
  emptyText: string;
}

const TABS: TabConfig[] = [
  { key: "category", label: "Danh mục",      type: TYPE_CATEGORY, placeholder: "Tên danh mục mới...", emptyText: "Chưa có danh mục nào." },
  { key: "tag",      label: "Tags sản phẩm", type: TYPE_TAG,      placeholder: "Tên tag mới...",      emptyText: "Chưa có tag nào." },
];

const PAGE_SIZE = 100; // load hết để drag-drop position

interface CategoryModalProps {
  onShow: boolean;
  onHide: () => void;
  listProduct?: any[];
}

export default function CategoryModal({ onShow, onHide, listProduct = [] }: CategoryModalProps) {
  const [activeTab, setActiveTab]       = useState<"category" | "tag">("category");
  const [items, setItems]               = useState<CategoryItem[]>([]);
  const [total, setTotal]               = useState(0);
  const [isLoading, setIsLoading]       = useState(false);
  const [newName, setNewName]           = useState("");
  const [editingId, setEditingId]       = useState<number | null>(null);
  const [editingName, setEditingName]   = useState("");
  const [isSavingPos, setIsSavingPos]   = useState(false);

  // Drag state
  const dragIndexRef  = useRef<number | null>(null);
  const dragOverRef   = useRef<number | null>(null);

  const currentTab = TABS.find((t) => t.key === activeTab)!;

  // ── Fetch ──
  const fetchItems = useCallback(async (type: number) => {
    setIsLoading(true);
    try {
      const res = await CategoryServiceService.list({
        type,
        page: 1,
        limit: PAGE_SIZE,
      });
      if (res.code === 0) {
        const list: CategoryItem[] = (res.result?.items || []).map((i: any) => ({
          id: i.id,
          name: i.name,
          position: i.position ?? 0,
          status: i.status ?? 1,
          remainingProductCount: i.remainingProductCount ?? 0,
        }));
        setItems(list);
        setTotal(+res.result?.total || list.length);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (onShow) {
      setNewName("");
      setEditingId(null);
      fetchItems(currentTab.type);
    }
  }, [onShow]);

  useEffect(() => {
    if (onShow) {
      setNewName("");
      setEditingId(null);
      fetchItems(currentTab.type);
    }
  }, [activeTab]);

  // ── CRUD ──
  const handleAdd = async () => {
    if (!newName.trim()) return;
    const res = await CategoryServiceService.update({
      name: newName.trim(),
      position: items.length + 1,
      type: currentTab.type,
      status: 1,
      active: 1,
      avatar: "",
      parentId: 0,
      featured: 0,
    } as any);
    if (res.code === 0) {
      showToast(`Thêm ${currentTab.label.toLowerCase()} thành công`, "success");
      setNewName("");
      fetchItems(currentTab.type);
    } else {
      showToast(res.message ?? "Có lỗi xảy ra", "error");
    }
  };

  const handleSave = async (item: CategoryItem) => {
    if (!editingName.trim()) return;
    const res = await CategoryServiceService.update({
      id: item.id,
      name: editingName.trim(),
      position: item.position,
      type: currentTab.type,
      status: item.status,
      active: item.status,
      avatar: "",
      parentId: 0,
      featured: 0,
    } as any);
    if (res.code === 0) {
      showToast("Cập nhật thành công", "success");
      setEditingId(null);
      fetchItems(currentTab.type);
    } else {
      showToast(res.message ?? "Có lỗi xảy ra", "error");
    }
  };

  const handleDelete = async (item: CategoryItem) => {
    if (item.remainingProductCount && item.remainingProductCount > 0) {
      showToast(`Không thể xóa — đang có ${item.remainingProductCount} sản phẩm`, "error");
      return;
    }
    const res = await CategoryServiceService.delete(item.id);
    if (res.code === 0) {
      showToast("Xóa thành công", "success");
      fetchItems(currentTab.type);
    } else {
      showToast(res.message ?? "Có lỗi xảy ra", "error");
    }
  };

  // ── Drag & Drop để sắp xếp position ──
  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverRef.current = index;
    if (dragIndexRef.current === null || dragIndexRef.current === index) return;

    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndexRef.current!, 1);
      next.splice(index, 0, moved);
      dragIndexRef.current = index;
      return next;
    });
  };

  const handleDragEnd = async () => {
    dragIndexRef.current = null;
    dragOverRef.current = null;

    // Gán lại position theo thứ tự hiện tại và lưu lên server
    const updated = items.map((item, idx) => ({ ...item, position: idx + 1 }));
    setItems(updated);
    setIsSavingPos(true);
    try {
      await CategoryServiceService.updatePositions(
        updated.map((item) => ({ id: item.id, position: item.position }))
      );
    } catch {
      showToast("Không thể lưu thứ tự. Vui lòng thử lại", "error");
    } finally {
      setIsSavingPos(false);
    }
  };

  const getProductCount = (item: CategoryItem) => {
    // Ưu tiên từ API, fallback sang đếm từ listProduct
    if (item.remainingProductCount !== undefined) return item.remainingProductCount;
    return listProduct.filter((p) => p.categoryId === item.id).length;
  };

  return (
    <Modal isOpen={onShow} toggle={onHide} isCentered size="md">
      <ModalHeader title="Quản lý Danh mục & Tags" toggle={onHide} />

      <ModalBody>
        {/* Tabs */}
        <div className="cat-modal__tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`cat-modal__tab${activeTab === tab.key ? " cat-modal__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {activeTab === tab.key && <span className="cat-modal__tab-count">{total}</span>}
            </button>
          ))}
        </div>

        {/* Add row */}
        <div className="cat-modal__add-row">
          <input
            className="cat-modal__input"
            placeholder={currentTab.placeholder}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="cat-modal__btn cat-modal__btn--primary" onClick={handleAdd} disabled={!newName.trim()}>
            + Thêm
          </button>
        </div>

        {/* Drag hint */}
        {items.length > 1 && (
          <div className="cat-modal__drag-hint">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
            Kéo để sắp xếp thứ tự
            {isSavingPos && <span className="cat-modal__saving"> · Đang lưu...</span>}
          </div>
        )}

        {/* List */}
        <div className="cat-modal__list">
          {isLoading ? (
            <Loading />
          ) : items.length === 0 ? (
            <p className="cat-modal__empty">{currentTab.emptyText}</p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className="cat-modal__item"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                {editingId === item.id ? (
                  <div className="cat-modal__item-edit">
                    <input
                      className="cat-modal__input"
                      value={editingName}
                      autoFocus
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave(item);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button className="cat-modal__btn cat-modal__btn--primary" onClick={() => handleSave(item)}>
                      Lưu
                    </button>
                    <button className="cat-modal__btn" onClick={() => setEditingId(null)}>
                      Hủy
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Drag handle */}
                    <div className="cat-modal__drag-handle" title="Kéo để sắp xếp">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="5" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="19" r="1.2" fill="currentColor"/>
                        <circle cx="15" cy="5" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="19" r="1.2" fill="currentColor"/>
                      </svg>
                    </div>

                    <div className="cat-modal__item-info">
                      <p className="cat-modal__item-name">{item.name}</p>
                      {currentTab.type === TYPE_CATEGORY && (
                        <p className="cat-modal__item-count">{getProductCount(item)} sản phẩm</p>
                      )}
                    </div>

                    <div className="cat-modal__item-actions">
                      <button
                        className="cat-modal__btn"
                        onClick={() => { setEditingId(item.id); setEditingName(item.name); }}
                      >
                        Sửa
                      </button>
                      <button
                        className="cat-modal__btn cat-modal__btn--danger"
                        onClick={() => handleDelete(item)}
                        title={item.remainingProductCount! > 0 ? "Không thể xóa khi còn sản phẩm" : ""}
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <button className="cat-modal__btn" onClick={onHide}>Đóng</button>
      </ModalFooter>
    </Modal>
  );
}