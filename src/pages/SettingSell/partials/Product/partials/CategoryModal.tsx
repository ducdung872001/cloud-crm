import React, { useState, useEffect, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import CategoryServiceService from "services/CategoryServiceService";
import { ICategoryServiceResponseModel } from "model/categoryService/CategoryServiceResponseModel";
import { IProductResponse } from "model/product/ProductResponseModel";
import { showToast } from "utils/common";
import "./CategoryModal.scss";
import Loading from "@/components/loading";

interface CategoryModalProps {
  onShow: boolean;
  onHide: () => void;
  listProduct: IProductResponse[];
}

type TabType = "category" | "group";

const PAGE_SIZE = 20;

export default function CategoryModal({ onShow, onHide, listProduct }: CategoryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("category");
  const [listCategory, setListCategory] = useState<ICategoryServiceResponseModel[]>([]);
  const [totalCategory, setTotalCategory] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMoreRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const pageRef = useRef(1);

  const fetchCategories = async (pageNum: number, reset = false) => {
    if (pageNum === 1) setIsLoading(true);
    else {
      setIsLoadingMore(true);
      isLoadingMoreRef.current = true;
    }

    const response = await CategoryServiceService.list({ keyword: "", type: 2, page: pageNum, limit: PAGE_SIZE });
    if (response.code === 0) {
      const items: ICategoryServiceResponseModel[] = response.result?.items || [];
      const total: number = +response.result?.total || 0;

      setTotalCategory(total);
      setListCategory((prev) => (reset || pageNum === 1 ? items : [...prev, ...items]));

      const loaded = (pageNum - 1) * PAGE_SIZE + items.length;
      const more = loaded < total;
      setHasMore(more);
      hasMoreRef.current = more;
    }

    if (pageNum === 1) setIsLoading(false);
    else {
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  };

  useEffect(() => {
    if (onShow) {
      setPage(1);
      pageRef.current = 1;
      setHasMore(true);
      hasMoreRef.current = true;
      fetchCategories(1, true);
      setNewName("");
      setEditingId(null);
    }
  }, [onShow]);

  // Infinity scroll: dùng IntersectionObserver trên sentinel element cuối list
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isLoadingMoreRef.current) {
          const nextPage = pageRef.current + 1;
          pageRef.current = nextPage;
          setPage(nextPage);
          fetchCategories(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [listCategory]); // re-observe sau mỗi lần list thay đổi

  const getProductCount = (categoryId: number) => listProduct.filter((p) => p.categoryId === categoryId).length;

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const response = await CategoryServiceService.update({
      name: newName.trim(),
      position: listCategory.length + 1,
      type: 2,
    });
    if (response.code === 0) {
      showToast("Thêm danh mục thành công", "success");
      setNewName("");
      setPage(1);
      fetchCategories(1, true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra", "error");
    }
  };

  const handleSave = async (item: ICategoryServiceResponseModel) => {
    if (!editingName.trim()) return;
    const response = await CategoryServiceService.update({ ...item, name: editingName.trim(), type: 2 });
    if (response.code === 0) {
      showToast("Cập nhật danh mục thành công", "success");
      setEditingId(null);
      setPage(1);
      fetchCategories(1, true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const response = await CategoryServiceService.delete(id);
    if (response.code === 0) {
      showToast("Xóa danh mục thành công", "success");
      setPage(1);
      fetchCategories(1, true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra", "error");
    }
  };

  return (
    <Modal isOpen={onShow} toggle={onHide} isCentered size="md">
      <ModalHeader toggle={onHide}>Quản lý Danh mục & Nhóm</ModalHeader>

      <ModalBody>
        {/* Tabs */}
        <div className="cat-modal__tabs">
          <button className={`cat-modal__tab${activeTab === "category" ? " cat-modal__tab--active" : ""}`} onClick={() => setActiveTab("category")}>
            Danh mục ({totalCategory})
          </button>
          <button className={`cat-modal__tab${activeTab === "group" ? " cat-modal__tab--active" : ""}`} onClick={() => setActiveTab("group")}>
            Nhóm (0)
          </button>
        </div>

        {activeTab === "category" && (
          <>
            {/* Add row */}
            <div className="cat-modal__add-row">
              <input
                className="cat-modal__input"
                placeholder="Tên danh mục mới..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <button className="cat-modal__btn cat-modal__btn--primary" onClick={handleAdd}>
                + Thêm
              </button>
            </div>

            {/* List với infinity scroll */}
            <div className="cat-modal__list" ref={listRef}>
              {isLoading ? (
                <Loading />
              ) : listCategory.length === 0 ? (
                <p className="cat-modal__empty">Chưa có danh mục nào.</p>
              ) : (
                <>
                  {listCategory.map((item) => (
                    <div className="cat-modal__item" key={item.id}>
                      {editingId === item.id ? (
                        <div className="cat-modal__item-edit">
                          <input
                            className="cat-modal__input"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleSave(item)}
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
                          <div className="cat-modal__item-info">
                            <div>
                              <p className="cat-modal__item-name">{item.name}</p>
                              <p className="cat-modal__item-count">{getProductCount(item.id)} sản phẩm</p>
                            </div>
                          </div>
                          <div className="cat-modal__item-actions">
                            <button
                              className="cat-modal__btn"
                              onClick={() => {
                                setEditingId(item.id);
                                setEditingName(item.name);
                              }}
                            >
                              Sửa
                            </button>
                            <button className="cat-modal__btn cat-modal__btn--danger" onClick={() => handleDelete(item.id)}>
                              Xóa
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Loading more indicator */}
                  {isLoadingMore && (
                    <div className="cat-modal__loading-more">
                      <span>Đang tải thêm...</span>
                    </div>
                  )}

                  {/* End of list */}
                  {!hasMore && listCategory.length > 0 && (
                    <p className="cat-modal__end">Đã hiển thị tất cả {totalCategory} danh mục</p>
                  )}

                  {/* Sentinel: IntersectionObserver bắt khi xuất hiện → load thêm */}
                  <div ref={sentinelRef} style={{ height: 1 }} />
                </>
              )}
            </div>
          </>
        )}

        {activeTab === "group" && <p className="cat-modal__empty">Chức năng nhóm đang được phát triển.</p>}
      </ModalBody>

      <ModalFooter>
        <button className="cat-modal__btn" onClick={onHide}>
          Đóng
        </button>
      </ModalFooter>
    </Modal>
  );
}
