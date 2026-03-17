import React, { useState } from "react";
import Icon from "../icon";
import "./TabMenuList.scss";

export default function TabMenuList(props) {
  const {listTab, onClick} = props;

  return (
    <div className="menu">
        {listTab.map((item, idx) => {
        return (
            <div
            key={idx}
            className="item-menu"
            onClick={(e) => {
                onClick(item);
            }}
            >
            <div className="item-icon">
                <Icon name={item.icon}/>
            </div>
            <div className="item-body">
                <span style={{fontSize: 14, fontWeight: '500'}}>{item.title}</span>
                {item?.des ?
                    <div>
                        <span style={{fontSize: 12, fontWeight: '400'}}>{item.des}</span>
                    </div>
                : null}
            </div>
            </div>
        );
        })}
    </div>
  );
}
