// CHUNG: Admin-side — xem + duyệt/từ chối bằng chứng thanh toán.
import React, { useState } from "react";
import type { PaymentProof } from "../types";
import { THEME } from "../shared";

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  not_required: { label: "Miễn phí", bg: "#F3F4F6", color: "#6B7280" },
  pending: { label: "Chưa upload", bg: "#FEF3C7", color: "#92400E" },
  submitted: { label: "Chờ duyệt", bg: "#DBEAFE", color: "#1E40AF" },
  approved: { label: "Đã duyệt", bg: "#D1FAE5", color: "#065F46" },
  rejected: { label: "Từ chối", bg: "#FEE2E2", color: "#991B1B" },
};

interface Props {
  proof?: PaymentProof;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export default function PaymentProofReview({ proof, onApprove, onReject }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!proof) {
    return <Badge status="pending" />;
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Badge status={proof.status} />
        {proof.status === "submitted" && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "3px 8px",
              fontSize: 11,
              background: THEME.info,
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Xem
          </button>
        )}
      </div>

      {/* Modal xem ảnh + duyệt */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              maxWidth: 520,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: THEME.primaryDark }}>
              Bằng chứng thanh toán
            </h3>

            <img
              src={proof.imageUrl}
              alt="Payment proof"
              style={{
                width: "100%",
                borderRadius: 8,
                border: `1px solid ${THEME.border}`,
              }}
            />

            <p style={{ fontSize: 11, color: THEME.textMuted, margin: "8px 0" }}>
              Upload lúc: {new Date(proof.submittedAt).toLocaleString("vi-VN")}
            </p>

            {proof.status === "submitted" && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => {
                    onApprove();
                    setShowModal(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: THEME.success,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Duyệt thanh toán
                </button>
                <div style={{ flex: 1 }}>
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Lý do từ chối..."
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 4,
                      fontSize: 12,
                      marginBottom: 6,
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={() => {
                      onReject(rejectReason || "Không hợp lệ");
                      setShowModal(false);
                      setRejectReason("");
                    }}
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: THEME.danger,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            )}

            {proof.status === "rejected" && proof.rejectReason && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 10px",
                  background: "#FEE2E2",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#991B1B",
                }}
              >
                Lý do từ chối: {proof.rejectReason}
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "8px",
                background: THEME.bg,
                border: `1px solid ${THEME.border}`,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Badge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}
