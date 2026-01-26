import React, { useEffect, useRef, useState } from "react";

interface StopwatchProps {
  isStart: boolean; // true -> bắt đầu/tiếp tục đếm, false -> tạm dừng
  isClear?: boolean; // true -> reset về 00:00:00 (khi prop chuyển từ false -> true)
  className?: string; // tuỳ chọn để gắn css
}

/**
 * Stopwatch component
 * - isStart === true: bắt đầu hoặc tiếp tục đếm (tăng theo giây)
 * - isStart === false: tạm dừng giữ nguyên thời gian
 * - isClear === true: reset về 00:00:00 (thao tác reset sẽ thực hiện khi prop thay đổi sang true)
 *
 * Lưu ý: component chỉ quan sát sự chuyển đổi của isClear. Nếu cần reset nhiều lần từ parent,
 * parent nên chuyển isClear: false -> true -> false theo thứ tự mong muốn.
 */
const Stopwatch: React.FC<StopwatchProps> = ({ isStart, isClear = false, className }) => {
  const [seconds, setSeconds] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);
  const prevIsClearRef = useRef<boolean>(false);

  // Khi isClear chuyển từ false -> true thì reset seconds về 0
  useEffect(() => {
    if (isClear && !prevIsClearRef.current) {
      setSeconds(0);
    }
    prevIsClearRef.current = isClear;
  }, [isClear]);

  // Bắt đầu / dừng interval dựa vào isStart
  useEffect(() => {
    // nếu isStart true và chưa có interval thì tạo interval mới
    if (isStart) {
      if (intervalRef.current === null) {
        intervalRef.current = window.setInterval(() => {
          setSeconds((s) => s + 1);
        }, 1000);
      }
    } else {
      // nếu isStart false thì dừng interval (tạm dừng)
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // cleanup khi unmount
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStart]);

  // format hh:mm:ss với padding 2 chữ số
  const formatHHMMSS = (totalSeconds: number) => {
    const hh = Math.floor(totalSeconds / 3600);
    const mm = Math.floor((totalSeconds % 3600) / 60);
    const ss = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  };

  return <div className={className}>{formatHHMMSS(seconds)}</div>;
};

export default Stopwatch;
