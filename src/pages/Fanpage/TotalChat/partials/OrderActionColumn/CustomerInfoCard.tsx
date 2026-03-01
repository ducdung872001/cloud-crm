import React, { useEffect, useMemo, useState } from "react";

interface CustomerInfoCardProps {
  customerName: string;
  phone: string;
  address: string;
  customerTier: string;
  labels: {
    customerInfoTitle: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerTier: string;
  };
  onSave: (data: { customerName: string; phone: string; address: string; customerTier: string }) => void;
}

export default function CustomerInfoCard(props: CustomerInfoCardProps) {
  const { customerName, phone, address, customerTier, labels, onSave } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    customerName,
    phone,
    address,
    customerTier,
  });

  useEffect(() => {
    if (!isEditing) {
      setFormData({
        customerName,
        phone,
        address,
        customerTier,
      });
    }
  }, [customerName, phone, address, customerTier, isEditing]);

  const hasChanges = useMemo(() => {
    return (
      formData.customerName !== customerName ||
      formData.phone !== phone ||
      formData.address !== address ||
      formData.customerTier !== customerTier
    );
  }, [formData, customerName, phone, address, customerTier]);

  const handleCancel = () => {
    setFormData({
      customerName,
      phone,
      address,
      customerTier,
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const renderField = (key: keyof typeof formData, label: string, value: string) => {
    if (!isEditing) {
      return (
        <div>
          <label>{label}</label>
          <strong>{value}</strong>
        </div>
      );
    }

    return (
      <div>
        <label>{label}</label>
        <input value={formData[key]} onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))} />
      </div>
    );
  };

  return (
    <div className="info-card">
      <div className="info-card__header">
        <h3>{labels.customerInfoTitle}</h3>

        {!isEditing && (
          <button type="button" className="info-card__action info-card__action--edit" onClick={() => setIsEditing(true)}>
            Sửa
          </button>
        )}

        {isEditing && !hasChanges && (
          <button type="button" className="info-card__action info-card__action--cancel" onClick={handleCancel}>
            Hủy
          </button>
        )}

        {isEditing && hasChanges && (
          <div className="info-card__actions">
            <button type="button" className="info-card__action info-card__action--cancel" onClick={handleCancel}>
              Hủy
            </button>
            <button type="button" className="info-card__action info-card__action--save" onClick={handleSave}>
              Lưu
            </button>
          </div>
        )}
      </div>

      <div className="info-grid">
        {renderField("customerName", labels.customerName, customerName)}
        {renderField("phone", labels.customerPhone, phone)}
        {renderField("address", labels.customerAddress, address)}
        {renderField("customerTier", labels.customerTier, customerTier)}
      </div>
    </div>
  );
}
