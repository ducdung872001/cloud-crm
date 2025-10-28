import React, { useState } from "react";
import Fancybox from "components/fancybox/fancybox";
import Icon from "components/icon";
import { useTranslation } from "react-i18next";
import { IVideoHelp } from "model/dashboard/DashboardModel";
import LstVideoSupport from "./partials/lstVideoSupport";

interface VideoHelpProps {
  classNames?: string;
}

export default function VideoHelp(props: VideoHelpProps) {
  const { classNames } = props;

  const { t } = useTranslation();

  const [isShowMore, setIsShowMore] = useState<boolean>(false);

  const [videos] = useState<IVideoHelp[]>([
    {
      title: "REBORN CRM - Hướng dẫn cài đặt, cấu hình thông tin khách hàng cơ bản",
      image: "https://i.ytimg.com/vi/hrqChrN58wk/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=hrqChrN58wk",
    },
    {
      title: "REBORN CRM - Hướng dẫn thêm mới và chỉnh sửa thông tin khách hàng",
      image: "https://i.ytimg.com/vi/IEk0nsLWMPI/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=IEk0nsLWMPI",
    },
  ]);

  return (
    <div className={`card-box video-help${classNames ? ` ${classNames}` : ""}`}>
      <div className="title d-flex align-items-start justify-content-between">
        <h2>{t(`pageDashboard.userManual`)}</h2>
      </div>
      <div className="video-help__list d-flex justify-content-between">
        <Fancybox>
          <ul>
            {videos.map((v, index) => (
              <li key={index}>
                <a data-fancybox="video" href={v.url}>
                  <span className="video-help--image">
                    <img src={v.image} alt={v.title} />
                    <span className="icon-play">
                      <Icon name="Play" />
                    </span>
                  </span>
                  <span className="video-help--title">{v.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </Fancybox>
      </div>
      <div className="btn-more" onClick={() => setIsShowMore(true)}>
        {t(`common.seeMore`)}
      </div>
      <LstVideoSupport onShow={isShowMore} onHide={() => setIsShowMore(false)} />
    </div>
  );
}
