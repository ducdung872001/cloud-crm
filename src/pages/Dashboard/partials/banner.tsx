import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";

export default function Banner() {
  const dataBanner = [
    {
      image: "https://vienthammys-one.vn/wp-content/uploads/2022/04/banner-3.jpg",
    },
    {
      image: "https://intphcm.com/data/upload/banner-spa-mun.jpg",
    },
    {
      image: "https://intphcm.com/data/upload/in-banner-spa.jpg",
    },
  ];

  return (
    <Fragment>
      <Swiper
        pagination={{
          dynamicBullets: true,
          clickable: true,
        }}
        autoplay={true}
        className="banner__swiper"
        keyboard={{
          enabled: true,
        }}
        modules={[Keyboard, Pagination]}
      >
        {dataBanner.map((item, idx) => {
          return (
            <SwiperSlide key={idx}>
              <img src={item.image} alt="banner" />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Fragment>
  );
}
