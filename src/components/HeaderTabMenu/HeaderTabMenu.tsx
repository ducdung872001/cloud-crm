import React, { useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import TitleAction from "components/titleAction/titleAction";
import "./HeaderTabMenu.scss";

interface IHeaderTab {
  onBackProps?: any;
  callBack?: () => void;
  titleActions?: any;
  titleBack?: string
  title?: string
}

export default function HeaderTabMenu(props: IHeaderTab) {
  const { onBackProps, titleActions, titleBack, title, callBack } = props;

  const clickBack = () => {
    if(callBack) {
      callBack();
    } else {
      onBackProps(true);
    }
  }
  return (
    <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              clickBack();
            }}
            className="title-first"
            title="Quay lại"
          >
            {titleBack}
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              clickBack();
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
