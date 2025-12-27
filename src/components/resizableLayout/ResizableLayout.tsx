import React, { useState, useCallback, useEffect, useRef } from "react";
import "./ResizableLayout.scss";

interface ResizableLayoutProps {
  leftComponent: React.ReactNode;
  rightComponent: React.ReactNode;
  initialLeftWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
}

const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  leftComponent,
  rightComponent,
  initialLeftWidth = 65,
  minWidth = 20,
  maxWidth = 80,
  storageKey = "resizable-layout-width",
}) => {
  const [leftWidth, setLeftWidth] = useState(() => {
    const savedWidth = localStorage.getItem(storageKey);
    if (savedWidth) {
      const parsedWidth = parseFloat(savedWidth);
      if (parsedWidth >= minWidth && parsedWidth <= maxWidth) {
        return parsedWidth;
      }
    }
    return initialLeftWidth;
  });

  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
          setLeftWidth(newLeftWidth);
        }
      }
    },
    [isResizing, minWidth, maxWidth]
  );

  useEffect(() => {
    localStorage.setItem(storageKey, leftWidth.toString());
  }, [leftWidth, storageKey]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div className={`resizable-container ${isResizing ? "resizing" : ""}`} ref={containerRef}>
      <div className="resizable-left" style={{ width: `${leftWidth}%` }}>
        {leftComponent}
      </div>

      <div className={`resizer-bar ${isResizing ? "active" : ""}`} onMouseDown={startResizing}>
        <div className="resizer-line" />
        <div className="resizer-handle">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="resizable-right" style={{ width: `${100 - leftWidth}%` }}>
        {rightComponent}
      </div>
    </div>
  );
};

export default ResizableLayout;
