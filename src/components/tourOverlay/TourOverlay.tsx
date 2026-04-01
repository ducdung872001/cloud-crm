// src/components/tourOverlay/TourOverlay.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { TourStep, TargetInfo } from "hooks/useOnboarding";
import "./TourOverlay.scss";

const PAD = 10; // padding quanh element được highlight (px)

interface Props {
  active:      boolean;
  step:        TourStep | null;
  stepIdx:     number;
  totalSteps:  number;
  target:      TargetInfo | null;
  isFirst:     boolean;
  isLast:      boolean;
  onNext:      () => void;
  onPrev:      () => void;
  onSkip:      () => void;
}

export default function TourOverlay({
  active, step, stepIdx, totalSteps, target,
  isFirst, isLast, onNext, onPrev, onSkip,
}: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Xử lý phím tắt
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onSkip();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft" && !isFirst) onPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, isFirst, onNext, onPrev, onSkip]);

  const spotlightStyle = useMemo(() => {
    if (!target?.rect) return null;
    const { top, left, width, height } = target.rect;
    return {
      top:    top    - PAD,
      left:   left   - PAD,
      width:  width  + PAD * 2,
      height: height + PAD * 2,
    };
  }, [target]);

  // Tính vị trí tooltip
  const tooltipStyle = useMemo((): React.CSSProperties => {
    if (!target?.rect || step?.position === "center" || !step) {
      return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
    const { top, left, right, bottom, width } = target.rect;
    const TOOLTIP_W = 320;
    const GAP = 16;

    switch (step.position ?? "bottom") {
      case "bottom": return {
        position: "fixed",
        top:  bottom + GAP,
        left: Math.max(8, Math.min(left + width / 2 - TOOLTIP_W / 2, window.innerWidth - TOOLTIP_W - 8)),
      };
      case "top": return {
        position: "fixed",
        bottom:   window.innerHeight - top + GAP,
        left: Math.max(8, Math.min(left + width / 2 - TOOLTIP_W / 2, window.innerWidth - TOOLTIP_W - 8)),
      };
      case "right": return {
        position: "fixed",
        top:  Math.max(8, top),
        left: right + GAP,
      };
      case "left": return {
        position: "fixed",
        top:  Math.max(8, top),
        right: window.innerWidth - left + GAP,
      };
      default: return {
        position: "fixed",
        top:  bottom + GAP,
        left: Math.max(8, Math.min(left + width / 2 - TOOLTIP_W / 2, window.innerWidth - TOOLTIP_W - 8)),
      };
    }
  }, [target, step]);

  if (!active || !step) return null;

  const isCentered = !target || step.position === "center";

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-label="Hướng dẫn sử dụng">
      {/* ── Backdrop 4 mảnh tạo spotlight ── */}
      {spotlightStyle && !isCentered ? (
        <>
          {/* top */}
          <div className="tour-overlay__mask" style={{ top: 0, left: 0, right: 0, height: spotlightStyle.top }} />
          {/* bottom */}
          <div className="tour-overlay__mask" style={{ top: spotlightStyle.top + spotlightStyle.height, left: 0, right: 0, bottom: 0 }} />
          {/* left */}
          <div className="tour-overlay__mask" style={{ top: spotlightStyle.top, left: 0, width: spotlightStyle.left, height: spotlightStyle.height }} />
          {/* right */}
          <div className="tour-overlay__mask" style={{ top: spotlightStyle.top, left: spotlightStyle.left + spotlightStyle.width, right: 0, height: spotlightStyle.height }} />
          {/* spotlight border */}
          <div className="tour-overlay__spotlight" style={spotlightStyle} />
        </>
      ) : (
        /* Full backdrop khi centered */
        <div className="tour-overlay__mask tour-overlay__mask--full" />
      )}

      {/* ── Tooltip bubble ── */}
      <div
        ref={tooltipRef}
        className={`tour-tooltip${isCentered ? " tour-tooltip--center" : ""}`}
        style={isCentered ? undefined : tooltipStyle}
      >
        {/* Arrow chỉ hiện khi có target */}
        {!isCentered && (
          <div className={`tour-tooltip__arrow tour-tooltip__arrow--${step.position ?? "bottom"}`} />
        )}

        {/* Header */}
        <div className="tour-tooltip__header">
          <span className="tour-tooltip__progress">{stepIdx + 1} / {totalSteps}</span>
          <button className="tour-tooltip__skip" onClick={onSkip} title="Bỏ qua (Esc)">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="tour-tooltip__title">{step.title}</div>
        <div className="tour-tooltip__body">{step.content}</div>

        {/* Step dots */}
        <div className="tour-tooltip__dots">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span key={i} className={`tour-tooltip__dot${i === stepIdx ? " active" : ""}`} />
          ))}
        </div>

        {/* Footer actions */}
        <div className="tour-tooltip__footer">
          <button
            className="tour-btn tour-btn--ghost"
            onClick={isFirst ? onSkip : onPrev}
          >
            {isFirst ? "Bỏ qua" : "← Quay lại"}
          </button>
          <button className="tour-btn tour-btn--primary" onClick={onNext}>
            {isLast ? "✓ Hoàn thành" : "Tiếp theo →"}
          </button>
        </div>
      </div>
    </div>
  );
}
