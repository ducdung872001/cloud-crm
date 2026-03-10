import React, { useState, useEffect } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import CategoryService from "services/CategoryService";
import { ICategoryResponse } from "model/category/CategoryResponse";
import { IProductResponse } from "model/product/ProductResponseModel";
import { showToast } from "utils/common";
import "./CategoryModal.scss";

interface CategoryModalProps {
  onShow: boolean;
  onHide: () => void;
  listProduct: IProductResponse[];
}

type TabType = "category" | "group";

const CATEGORY_ICONS = ["🍹", "🍜", "🧻", "🍎", "🥛", "🧴", "🍫", "🥩", "🛒", "📦"];

export default function CategoryModal({ onShow, onHide, listProduct }: CategoryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("category");
  const [listCategory, setListCategory] = useState<ICategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    setIsLoading(true);
    const response = await CategoryService.list({ name: "", type: 1 });
    if (response.code === 0) {
      const categoryList = response.result?.items
      console.log("CATEGORIES", categoryList);
      setListCategory(categoryList || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow) {
      fetchCategories();
      setNewName("");
      setEditingId(null);
    }
  }, [onShow]);

  const getProductCount = (categoryId: number) => listProduct.filter((p) => p.categoryId === categoryId).length;

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const response = await CategoryService.update({
      id: 0,
      name: newName.trim(),
      position: listCategory.length + 1,
      type: 1,
      bsnId: 0,
    });
    if (response.code === 0) {
      showToast("Thêm danh mục thành công", "success");
      setNewName("");
      fetchCategories();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra", "error");
    }
  };

  const handleSave = async (item: ICategoryResponse) => {
    if (!editingName.trim()) return;
    const response = await CategoryService.update({ ...item, name: editingName.trim() });
    if (response.code === 0) {
      showToast("Cập nhật danh mục thành công", "success");
      setEditingId(null);
      fetchCategories();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const response = await CategoryService.delete(id);
    if (response.code === 0) {
      showToast("Xóa danh mục thành công", "success");
      fetchCategories();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra", "error");
    }
  };

  return (
    <Modal isOpen={onShow} toggle={onHide} isCentered size="md">
      <ModalHeader toggle={onHide}>📦 Quản lý Danh mục & Nhóm</ModalHeader>

      <ModalBody>
        {/* Tabs */}
        <div className="cat-modal__tabs">
          <button className={`cat-modal__tab${activeTab === "category" ? " cat-modal__tab--active" : ""}`} onClick={() => setActiveTab("category")}>
            📋 Danh mục ({listCategory.length})
          </button>
          <button className={`cat-modal__tab${activeTab === "group" ? " cat-modal__tab--active" : ""}`} onClick={() => setActiveTab("group")}>
            📌 Nhóm (0)
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

            {/* List */}
            <div className="cat-modal__list">
              {isLoading ? (
                <p className="cat-modal__empty">Đang tải...</p>
              ) : listCategory.length === 0 ? (
                <p className="cat-modal__empty">Chưa có danh mục nào.</p>
              ) : (
                listCategory.map((item, idx) => (
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
                          <span className="cat-modal__item-icon">{CATEGORY_ICONS[idx % CATEGORY_ICONS.length]}</span>
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
                ))
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
