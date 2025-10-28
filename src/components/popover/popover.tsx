import React, { Fragment, useEffect, useState } from "react";
import { Portal } from "react-overlays";
import { getParentByClassName } from "reborn-util";
import { useWindowDimensions } from "utils/hookCustom";
import "./popover.scss";

interface PopoverProps {
  className?: string;
  alignment: "left" | "right" | "center";
  direction?: "top" | "bottom";
  refContainer: any;
  refPopover: any;
  children?: any;
  isTriangle?: boolean;
  distance?: number;
}
export default function Popover(props: PopoverProps) {
  const { className, alignment, direction, refContainer, children, isTriangle, refPopover, distance } = props;
  const el = document.getElementsByTagName("body")[0];
  const { width, height } = useWindowDimensions();
  const [position, setPosition] = useState<any>(null);
  const scrollBar = getParentByClassName(refContainer?.current, "custom-scrollbar");

  useEffect(() => {
    if (refContainer && refContainer.current) {
      const rect = refContainer.current.getBoundingClientRect();
      const rectScrollbar = scrollBar ? scrollBar.getBoundingClientRect() : { x: 0, y: 0 };
      const childScrollbarScrollTop = scrollBar ? scrollBar.childNodes[0].scrollTop : 0;
      setPosition({
        left: alignment === "left" ? rect.x - rectScrollbar.x : alignment === "center" ? rect.x - rectScrollbar.x + rect.width / 2 : "auto",
        right: alignment === "right" ? width - rect.x - rect.width - 6 : "auto",
        top:
          !direction || direction === "bottom"
            ? rect.y + childScrollbarScrollTop - rectScrollbar.y + rect.height - (distance || 0)
            : rect.y + childScrollbarScrollTop - rectScrollbar.y - (distance || 0),
        transform:
          alignment === "center"
            ? `translateX(-50%)${direction === "top" ? ` translateY(-100%)` : ""}`
            : direction === "top"
            ? "translateY(-100%)"
            : "none",
      });
    }
  }, [refContainer, width, height, distance]);

  return (
    <Fragment>
      {refContainer ? (
        <Portal container={scrollBar ? scrollBar.childNodes[0] : el}>
          <div
            className={`popover popover-portal popover--alignment-${alignment} popover--direction-${direction ?? "bottom"}${
              isTriangle ? " has-triangle" : ""
            }${className ? " " + className : ""}`}
            ref={refPopover}
            style={position ? position : null}
          >
            {isTriangle && <span className="triangle"></span>}
            {children}
          </div>
        </Portal>
      ) : (
        <div className="popover-container">
          <div
            className={`popover popover--alignment-${alignment} popover--direction-${direction ?? "bottom"}${isTriangle ? " has-triangle" : ""}${
              className ? " " + className : ""
            }`}
            ref={refPopover}
            style={position ? position : null}
          >
            {isTriangle && <span className="triangle"></span>}
            {children}
          </div>
        </div>
      )}
    </Fragment>
  );
}
