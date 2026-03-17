import React, { useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import TitleAction from "components/titleAction/titleAction";
import "./HeaderTabMenu.scss";

export default function HeaderTabMenu(props: any) {
  const { onBackProps, titleActions, titleBack, title } = props;

  return (
    <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            {titleBack}
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">{title}</h1>
        </div>
        {titleActions ? 
            <TitleAction title="" titleActions={titleActions} />
        : null}
    </div>
  );
}
