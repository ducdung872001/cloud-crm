import React from "react";
import "./index.scss";

type Props = {
  title?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children?: React.ReactNode;
  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;
  onToggle?: (open: boolean) => void;
  header?: (item: any, idx?: number) => React.ReactNode;
  dataItems?: any;
};

/**
 * Collapsible with smooth open/close animation and ResizeObserver support.
 *
 * - Uses max-height + opacity for animation.
 * - ResizeObserver updates max-height when children change (e.g. async data).
 * - All updates that could trigger ResizeObserver are deferred via requestAnimationFrame
 *   and guarded to avoid "ResizeObserver loop completed..." warnings.
 */
const Collapsible: React.FC<Props> = ({
  title = null,
  defaultOpen = false,
  className = "",
  children,
  animationDuration = 300,
  onToggle,
  header,
  dataItems,
}) => {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);
  const [maxHeight, setMaxHeight] = React.useState<string>(defaultOpen ? "auto" : "0px");
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const idRef = React.useRef<string>("collapsible-" + Math.random().toString(36).slice(2, 9));
  const maxHeightRef = React.useRef<string>(maxHeight);

  // keep ref in sync to use inside observers/callbacks without stale closures
  React.useEffect(() => {
    maxHeightRef.current = maxHeight;
  }, [maxHeight]);

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      onToggle?.(next);
      return next;
    });
  };

  // Manage measured max-height to drive CSS transition on open/close
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // Defer changes to avoid synchronous ResizeObserver notifications
    const applyOpen = () => {
      const scrollH = el.scrollHeight;
      const newMax = `${scrollH}px`;
      if (maxHeightRef.current !== newMax) {
        setMaxHeight(newMax);
      }
    };

    const applyClose = () => {
      const scrollH = el.scrollHeight;
      const startMax = `${scrollH}px`;
      // If already same, still need to transition to 0
      if (maxHeightRef.current !== startMax) {
        setMaxHeight(startMax);
        // ensure the start px is applied before animating to 0
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setMaxHeight("0px");
          });
        });
      } else {
        // start is same: just schedule collapse in next frame
        requestAnimationFrame(() => {
          setMaxHeight("0px");
        });
      }
    };

    if (open) {
      requestAnimationFrame(applyOpen);
    } else {
      requestAnimationFrame(applyClose);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // After opening animation completes, switch max-height to 'auto'
  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== contentRef.current || e.propertyName !== "max-height") return;
    if (open) {
      // set to 'auto' only if it's currently not already 'auto'
      if (maxHeightRef.current !== "auto") {
        setMaxHeight("auto");
      }
    }
  };

  // Use ResizeObserver to detect content size changes (e.g. after async children load)
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el || typeof window === "undefined" || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      // Only react if open. If closed, ignore.
      if (!open) return;

      const newScroll = el.scrollHeight;
      const newMax = `${newScroll}px`;
      const currentMax = maxHeightRef.current;

      // If already at same pixel value, nothing to do
      if (currentMax === newMax) return;

      // If currently 'auto', start from current rendered height in px then animate to new scroll
      if (currentMax === "auto") {
        const currentHeight = Math.round(el.getBoundingClientRect().height);
        const startPx = `${currentHeight}px`;

        // If startPx equals newMax, no animation needed
        if (startPx === newMax) return;

        // Defer updates to break potential ResizeObserver loop
        requestAnimationFrame(() => {
          // set starting px (forces a measurable start)
          setMaxHeight(startPx);
          // next frame animate to new scrollHeight
          requestAnimationFrame(() => {
            setMaxHeight(newMax);
          });
        });
      } else {
        // Already in px mode; defer setting new px to avoid synchronous loop
        requestAnimationFrame(() => {
          setMaxHeight(newMax);
        });
      }
      // transitionend will set back to 'auto' after animation completes
    });

    ro.observe(el);

    return () => {
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, animationDuration]);

  return (
    <div className={`collapsible ${className}`}>
      <button type="button" className="collapsible__header" aria-expanded={open} aria-controls={idRef.current}>
        {header ? header(dataItems) : <span className="collapsible__title">{title}</span>}
        <div className="icon-area" onClick={handleToggle}>
          <svg className={`collapsible__icon ${open ? "open" : ""}`} width="25" height="25" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" fill="currentColor" />
          </svg>
        </div>
      </button>

      <div
        id={idRef.current}
        ref={contentRef}
        className={`collapsible__content ${open ? "is-open" : "is-closed"}`}
        aria-hidden={!open}
        onTransitionEnd={handleTransitionEnd}
        style={{
          maxHeight: maxHeight,
          transitionDuration: `${animationDuration}ms`,
        }}
      >
        <div className="collapsible__inner">{children}</div>
      </div>
    </div>
  );
};

export default Collapsible;
