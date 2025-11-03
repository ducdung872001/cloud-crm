import React from "react";
import moment from "moment";

interface PrettyTimeProps {
  time: any;
  className?: string;
}

export default function PrettyTime(props: PrettyTimeProps) {
  const { time, className } = props;

  const currentTime = new Date().getTime();
  const times = new Date(time).getTime();

  let offset = currentTime - times;
  offset = offset / 1000; //Quy đổi ra giây

  //Dưới 5 phút => Vừa xong
  if (offset < 5 * 60) {
    return <span className={`time ${className ? className : ""}`}>Vừa xong</span>;
  }

  if (offset < 59 * 60) {
    return <span className={`time ${className ? className : ""}`}>{Math.round(offset / 60)} phút trước</span>;
  }

  if (offset < 24 * 3600) {
    return <span className={`time ${className ? className : ""}`}>{Math.round(offset / 3600)} giờ trước</span>;
  }

  if (offset < 5 * 24 * 3600) {
    return <span className={`time ${className ? className : ""}`}>{Math.round(offset / 3600 / 24)} ngày trước</span>;
  }

  return <span className={`time ${className ? className : ""}`}>{moment(time).format("DD/MM/YYYY HH:mm:ss")}</span>;
}
