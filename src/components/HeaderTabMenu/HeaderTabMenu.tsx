import React, {useRef, memo} from "react";
import _ from "lodash";
import Icon from "components/icon";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import "./HeaderTabMenu.scss";

interface IHeaderTab {
  onBackProps?: (value: boolean) => void;
  callBack?: () => void;
  titleActions?: ITitleActions;
  titleBack?: string
  title?: string
}

function HeaderTabMenu(props: IHeaderTab) {
  const { onBackProps, titleActions, titleBack, title, callBack } = props;

  const clickBack = () => {
    if(callBack) {
      callBack();
    } else {
      onBackProps(true);
    }
  }
  return (
    <div className="header-tab-menu">
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

export default memo(HeaderTabMenu);
