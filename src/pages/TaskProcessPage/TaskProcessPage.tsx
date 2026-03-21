import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./TaskProcessPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import ProcessedObjectList from "../SettingProcess/partials/ProcessedObjectList";
import UserTaskList from "../UserTaskList";

export default function TaskProcessPage() {
  document.title = "Hồ sơ & tác vụ";

  const [tab, setTab] = useState(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Danh sách hồ sơ",
      is_tab: 1,
      icon: "ObjectProcess",
      backgroundColor: "#e0f2f1",
      des: "Xem và quản lý toàn bộ hồ sơ trong hệ thống, theo dõi trạng thái xử lý từng hồ sơ"
    },
    {
        title: "Tác vụ",
        is_tab: 2,
        icon: "TaskProcess",
        backgroundColor: "#f0fdf4",
        des: "Quản lý các tác vụ cần thực hiện, phân công và theo dõi tiến độ xử lý công việc"

      },
 
  ].filter((e) => e);

  return (
    <div className="task-process-page">
      {!isDetail && <TitleAction title="Hồ sơ & tác vụ" />}
      <div className="d-flex flex-column">
        {!isDetail && (
            <TabMenuList
                listTab={listTab}
                onClick={(item) => {
                    setTab(item.is_tab);
                    setIsDetail(true);
                }}
            />
        )}
      </div>
      
      {isDetail && tab === 1 ? (
        <ProcessedObjectList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}

      {isDetail && tab === 2 ? (
        <UserTaskList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}
