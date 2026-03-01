import React from "react";

interface VoucherSectionProps {
  voucherCode: string;
  loyaltyPoints: number;
  labels: {
    voucherTitle: string;
    voucherPlaceholder: string;
    loyaltyLabel: string;
  };
  onVoucherChange: (value: string) => void;
}

export default function VoucherSection(props: VoucherSectionProps) {
  const { voucherCode, loyaltyPoints, labels, onVoucherChange } = props;

  return (
    <div className="order-card">
      <h3>{labels.voucherTitle}</h3>
      <input value={voucherCode} onChange={(e) => onVoucherChange(e.target.value)} placeholder={labels.voucherPlaceholder} />
      <div className="loyalty-line">
        {labels.loyaltyLabel}: {loyaltyPoints}
      </div>
    </div>
  );
}
