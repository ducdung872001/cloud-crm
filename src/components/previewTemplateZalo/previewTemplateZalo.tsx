import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";

import "./previewTemplateZalo.scss";



export default function PreviewTemplateZalo(props: any) {
  const { dataTemplateZalo } = props;


  return (
    <div className="box__preview">
        {dataTemplateZalo && dataTemplateZalo.map((item, idx) => {
            return (
                <div key={idx} className="item__preview">
                {item.type === "banner" ? (
                    <div className="item__banner">{item.image_url ? <img src={item.image_url} alt="banner-zalo" /> : ""}</div>
                ) : item.type === "header" ? (
                    <h3 className="title-zalo" style={{ textAlign: `${item.align}` } as any}>
                    {item.content}
                    </h3>
                ) : item.type === "table" ? (
                    item.content.map((el, index) => {
                    return (
                        <div key={index} className="item__table">
                        <h4 className="key">{el.key}</h4>
                        <h4 className="value">{el.value}</h4>
                        </div>
                    );
                    })
                ) : item.type === "text" ? (
                    <p className="item__content" style={{ textAlign: `${item.align}` } as any}>
                    {item.content}
                    </p>
                ) : (
                    item.content.map((ol, ilx) => {
                    return (
                        <div key={ilx} className={ol.title ? "item__buttons" : "d-none"}>
                            <h4 className="name-buttons">{ol.title}</h4>
                            <Icon name="ChevronRight" />
                        </div>
                    );
                    })
                )}
                </div>
            );
        })}
    </div>
  );
}
