// [CH] Community Hub - Thêm nhanh thành viên (Slide-in panel)
import React, { useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SlidePanel from "@/components/SlidePanel";
import { showToast } from "utils/common";
import CustomerService from "services/CustomerService";
import { UserContext, ContextType } from "contexts/userContext";
import "./index.scss";

interface QuickAddMemberProps {
  isOpen: boolean;
  onClose: (reload?: boolean) => void;
}

export default function QuickAddMember({ isOpen, onClose }: QuickAddMemberProps) {
  const { dataBranch } = useContext(UserContext) as ContextType;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    type: "personal" as "personal" | "company",
    gender: "male" as "male" | "female" | "other",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast("Vui lòng nhập tên thành viên", "error");
      return;
    }
    if (!formData.phone.trim()) {
      showToast("Vui lòng nhập số điện thoại", "error");
      return;
    }

    // branchId là bắt buộc cho BE. UserContext type khai boolean nhưng runtime là object.
    // Fallback: đọc localStorage "valueBranch" đã được layout.tsx set.
    const branchFromCtx = (dataBranch as unknown as { value?: number; id?: number } | null)?.value
      ?? (dataBranch as unknown as { id?: number } | null)?.id;
    let branchId: number | undefined = typeof branchFromCtx === "number" ? branchFromCtx : undefined;
    if (branchId == null) {
      try {
        const raw = localStorage.getItem("valueBranch");
        if (raw) {
          const parsed = JSON.parse(raw);
          branchId = parsed?.value ?? parsed?.id;
        }
      } catch { /* ignore */ }
    }
    if (branchId == null) {
      showToast("Chưa chọn chi nhánh — vui lòng chọn chi nhánh ở thanh menu trên", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        gender: formData.type === "personal" ? (formData.gender === "male" ? "1" : formData.gender === "female" ? "2" : "3") : undefined,
        custType: formData.type === "personal" ? 0 : 1,
        note: formData.note || undefined,
        branchId,
        avatar: "",
        firstCall: "",
        height: "",
        weight: "",
        trademark: "",
        taxCode: "",
        careerId: 0,
      };
      const response = await CustomerService.update(body);
      if (response?.code === 0) {
        showToast(`Đã tạo thành viên "${formData.name}" thành công`, "success");
        setFormData({ name: "", phone: "", email: "", type: "personal", gender: "male", note: "" });
        onClose(true);
      } else {
        const errMsg = response?.message ?? response?.error ?? "Tạo thành viên thất bại. Vui lòng thử lại";
        showToast(errMsg, "error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpandFull = () => {
    onClose(false);
    // [CH] Navigate đến trang tạo mới thành viên full page
    navigate("/detail_person/customerId/new");
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title="Thêm nhanh thành viên"
      width="42rem"
      footer={
        <>
          <button className="qam-btn qam-btn--link" onClick={handleExpandFull}>
            Nhập đầy đủ →
          </button>
          <div style={{ flex: 1 }} />
          <button className="qam-btn qam-btn--outline" onClick={() => onClose(false)}>
            Hủy
          </button>
          <button
            className="qam-btn qam-btn--primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo nhanh"}
          </button>
        </>
      }
    >
      <div className="qam-form">
        {/* Loại thành viên */}
        <div className="qam-field">
          <label>Loại thành viên</label>
          <div className="qam-radio-group">
            <label className={`qam-radio ${formData.type === "personal" ? "active" : ""}`}>
              <input type="radio" name="type" checked={formData.type === "personal"} onChange={() => updateField("type", "personal")} />
              <span>Cá nhân</span>
            </label>
            <label className={`qam-radio ${formData.type === "company" ? "active" : ""}`}>
              <input type="radio" name="type" checked={formData.type === "company"} onChange={() => updateField("type", "company")} />
              <span>Doanh nghiệp</span>
            </label>
          </div>
        </div>

        {/* Tên */}
        <div className="qam-field">
          <label>{formData.type === "personal" ? "Họ tên" : "Tên công ty"} <span className="req">*</span></label>
          <input
            type="text"
            placeholder={formData.type === "personal" ? "Nhập họ tên thành viên" : "Nhập tên công ty"}
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            autoFocus
          />
        </div>

        {/* SĐT */}
        <div className="qam-field">
          <label>Số điện thoại <span className="req">*</span></label>
          <input
            type="tel"
            placeholder="0912 345 678"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="qam-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>

        {/* Giới tính (chỉ cá nhân) */}
        {formData.type === "personal" && (
          <div className="qam-field">
            <label>Giới tính</label>
            <div className="qam-radio-group">
              {([["male", "Nam"], ["female", "Nữ"], ["other", "Khác"]] as const).map(([val, lbl]) => (
                <label key={val} className={`qam-radio ${formData.gender === val ? "active" : ""}`}>
                  <input type="radio" name="gender" checked={formData.gender === val} onChange={() => updateField("gender", val)} />
                  <span>{lbl}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Ghi chú */}
        <div className="qam-field">
          <label>Ghi chú</label>
          <textarea
            rows={2}
            placeholder="Ghi chú nhanh (nếu có)..."
            value={formData.note}
            onChange={(e) => updateField("note", e.target.value)}
          />
        </div>

        {/* Hint */}
        <div className="qam-hint">
          Bạn có thể bổ sung thêm thông tin chi tiết sau khi tạo.
          <button type="button" className="qam-hint__link" onClick={handleExpandFull}>
            Hoặc nhập đầy đủ ngay →
          </button>
        </div>
      </div>
    </SlidePanel>
  );
}
