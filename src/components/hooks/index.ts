import { useEffect, useRef, useState } from "react";

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};

/**
 * Tạo interval
 * @param {any} ref
 * @param {any} handler
 * @param {string[]} classList
 */
export const useOnClickOutside = (ref: any, handler: any, classList: string[]) => {
  const listener = (event) => {
    // Fix path in safari
    if (!("path" in Event.prototype)) {
      Object.defineProperty(Event.prototype, "path", {
        get: function () {
          const path = [];
          let currentElem = this.target;
          while (currentElem) {
            path.push(currentElem);
            currentElem = currentElem.parentElement;
          }
          if (path.indexOf(window) === -1 && path.indexOf(document) === -1) path.push(document);
          if (path.indexOf(window) === -1) path.push(window);
          return path;
        },
      });
    }
    if (
      ref.current &&
      !ref.current.contains(event.target) &&
      event.composedPath().filter((i) => i.classList && classList.some((clas) => i.classList.contains(clas))).length ===
        0
    ) {
      handler(event);
      return;
    }
    return;
  };
  useEffect(() => {
    window.addEventListener("mousedown", listener, false);
    return () => {
      window.removeEventListener("mousedown", listener, false);
    };
  }, [ref, handler]);
};

/**
 * Tạo interval
 * @param {any} value
 * @param {number} delay
 * @param {function} callback
 * @return {any}
 */
export const useDebounce = (value: any, delay: number, callback = (f) => f) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      callback(null);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Tạo interval
 * @param {any} callback
 * @param {number} delay
 */
export const useInterval = (callback: any, delay: number) => {
  const savedCallback = useRef<any>();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    function tick() {
      if (savedCallback) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

/**
 * Lấy chiều cao, rộng của window
 * @returns {}
 */
export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};

/**
 * Trả về element đang focus
 * @returns {HTMLElement}
 */
export const useActiveElement = () => {
  const [active, setActive] = useState(document.activeElement);

  const handleFocusIn = () => {
    setActive(document.activeElement);
  };

  useEffect(() => {
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  return active;
};
