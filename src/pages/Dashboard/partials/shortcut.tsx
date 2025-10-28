import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IShortcut } from "model/dashboard/DashboardModel";
import Icon from "components/icon";
import { showToast } from "utils/common";

interface ShortcutProps {
  classNames?: string;
}

export default function Shortcut(props: ShortcutProps) {
  const { classNames } = props;

  const { t } = useTranslation();

  const [shortcut] = useState<IShortcut[]>([
    {
      title: "Tạo đơn",
      path: "/create_sale_add",
      icon: <Icon name="PlusCircleFill" />,
      background: "#3a7507",
      target: "_blank",
    },
    {
      title: "Chấm công",
      path: "",
      icon: <Icon name="CalendarTime" />,
      background: "#ED6E02",
      target: "",
    },
  ]);

  return (
    <div className={`card-box shortcut${classNames ? ` ${classNames}` : ""}`}>
      <div className="title d-flex align-items-start justify-content-between">
        <h2>{t(`pageDashboard.fastRetrieval`)}</h2>
      </div>
      <div className="shortcut__list d-flex justify-content-between">
        {shortcut.map((s, index) => (
          <Link
            key={index}
            className="d-flex flex-column align-items-center"
            to={s.path ? s.path : ""}
            title={s.title}
            target={s.target ?? ""}
            style={{ backgroundColor: s.background }}
            onClick={() => {
              if (!s.path) {
                showToast("Tính năng đang trong quá trình phát triển !", "warning");
              }
            }}
          >
            {s.icon}
            <span>{s.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
