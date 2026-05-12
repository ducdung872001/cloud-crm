// Strip chạy ảnh ngang dùng cho banner đầu trang public events.
// Cùng pattern animation với GalleryStrip trong ShareEventPage (auto-scroll
// trái-phải, pause khi hover) — nhưng KHÔNG dùng Fancybox lightbox: click
// banner sẽ mở link (nếu có) thay vì zoom ảnh.
//
// CSS: prefix `tgs-` (top gallery strip) để không xung đột `.se-gallery-*`
// của ShareEventPage.

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface TopGalleryItem {
  url: string;
  linkUrl?: string;
}

interface Props {
  items: TopGalleryItem[];
  /** Chiều cao ảnh (px). Default 180px — banner thường thấp hơn gallery event. */
  imageHeight?: number;
  /** Tốc độ ticker — px/giây. */
  speedPxPerSec?: number;
}

export default function TopGalleryStrip({
  items,
  imageHeight = 180,
  speedPxPerSec = 50,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  const loop = items.length >= 2;
  const [needsScroll, setNeedsScroll] = useState(true);
  const needsScrollRef = useRef(true);
  useEffect(() => { needsScrollRef.current = needsScroll; }, [needsScroll]);

  const renderItems = (loop && needsScroll) ? [...items, ...items] : items;

  useLayoutEffect(() => {
    if (!loop) { setNeedsScroll(false); return; }
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const check = () => {
      const lastOriginal = track.children[items.length - 1] as HTMLElement | undefined;
      if (!lastOriginal) return;
      const originalsRight = lastOriginal.offsetLeft + lastOriginal.offsetWidth;
      setNeedsScroll(originalsRight > wrap.clientWidth + 4);
    };
    check();

    const wrapObs = new ResizeObserver(check);
    const trackObs = new ResizeObserver(check);
    wrapObs.observe(wrap);
    trackObs.observe(track);
    return () => { wrapObs.disconnect(); trackObs.disconnect(); };
  }, [loop, items]);

  useEffect(() => {
    if (!loop || !needsScroll) return;
    const track = trackRef.current;
    if (!track) return;

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current && needsScrollRef.current) {
        offsetRef.current += speedPxPerSec * dt;
        const cloneStart = track.children[items.length] as HTMLElement | undefined;
        const halfPx = cloneStart ? cloneStart.offsetLeft : 0;
        if (halfPx > 0 && offsetRef.current >= halfPx) offsetRef.current -= halfPx;
        track.style.transform = `translateX(${-offsetRef.current}px)`;
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [loop, items, needsScroll, speedPxPerSec]);

  if (!items.length) return null;

  return (
    <div
      ref={wrapRef}
      className="tgs-wrap"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={() => { pausedRef.current = false; }}
      style={{ "--tgs-img-h": `${imageHeight}px` } as React.CSSProperties}
    >
      <div ref={trackRef} className="tgs-track">
        {renderItems.map((it, i) => {
          const node = (
            <img
              src={it.url}
              alt=""
              className="tgs-img"
              loading="lazy"
              draggable={false}
              translate="no"
            />
          );
          if (it.linkUrl) {
            return (
              <a
                key={i}
                href={it.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tgs-item tgs-item--link"
                aria-label="Banner"
              >
                {node}
              </a>
            );
          }
          return (
            <div key={i} className="tgs-item">
              {node}
            </div>
          );
        })}
      </div>
    </div>
  );
}
