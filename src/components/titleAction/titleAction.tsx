/* eslint-disable prefer-const */
import React, { Fragment, useRef, useState } from "react";
import Button from "components/button/button";
import Icon from "components/icon";
import Popover from "components/popover/popover";
import { IAction } from "model/OtherModel";
import { useOnClickOutside, useWindowDimensions } from "utils/hookCustom";
import "./titleAction.scss";

interface TitleActionProps {
  title: string;
  to?: string;
  toChildren?: string;
  titleChildren?: string;
  isChildrenTitle?: boolean;
  titleDescendant?: string;
  isDescendantTitle?: boolean;
  titleActions?: ITitleActions;
  callback?: () => void;
  disableIcon?: boolean;
}

export interface ITitleActions {
  actions?: IAction[];
  actions_extra?: IAction[];
}

export default function TitleAction(props: TitleActionProps) {
  const { width } = useWindowDimensions();
  const { title } = props;
  let { titleActions } = props;

  //Loại bỏ phần tử null hoặc undefined
  if (titleActions) {
    titleActions.actions = (titleActions.actions || []).filter((item) => item);
  }

  const refActions = useRef();
  const refActionsContainer = useRef();
  const [showPopoverActions, setShowPopoverActions] = useState<boolean>(false);
  useOnClickOutside(refActions, () => setShowPopoverActions(false), ["actions-extra"]);

  return (
    <div className="title-action d-flex align-items-start justify-content-between">
      <div className="title d-flex flex-column">
        <div className="title d-flex align-items-start">
          <h1>{title}</h1>
        </div>
        {titleActions?.actions_extra && titleActions?.actions_extra.length > 0 && (
          <Fragment>
            {width < 768 ? (
              <div className="d-flex align-items-start justify-content-between">
                <div className="actions-extra d-flex align-items-center" ref={refActionsContainer}>
                  <Button type="button" color="secondary" hasIcon={true} onClick={() => setShowPopoverActions(!showPopoverActions)}>
                    Thao tác <Icon name="CaretDown" />
                  </Button>
                  {showPopoverActions && (
                    <Popover
                      alignment="left"
                      isTriangle={true}
                      className="popover-title-actions"
                      refContainer={refActionsContainer}
                      refPopover={refActions}
                    >
                      <ul>
                        {titleActions.actions_extra.map((a, idx) => (
                          <li key={idx} onClick={() => a.callback()}>
                            {a.icon}
                            {a.title}
                          </li>
                        ))}
                      </ul>
                    </Popover>
                  )}
                </div>
                <div className="actions d-flex align-items-center">
                  {titleActions.actions.map((a, idx) => (
                    <Button type="button" color={a.color} disabled={a.disabled} variant={a.variant} key={idx} onClick={() => a.callback()}>
                      {a.icon}
                      {a.title}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="actions-extra d-flex align-items-center">
                {titleActions.actions_extra.map((a, idx) => (
                  <Button key={idx} type="button" color="link" variant="outline" onClick={() => a.callback()}>
                    {a.icon}
                    {a.title}
                  </Button>
                ))}
              </div>
            )}
          </Fragment>
        )}
      </div>
      {titleActions?.actions.length > 0 && (titleActions?.actions_extra?.length > 0 ? width > 768 : true) && (
        <div className="actions d-flex align-items-center">
          {titleActions.actions.map((a, idx) => (
            <Button type="button" color={a.color} disabled={a.disabled} variant={a.variant} key={idx} onClick={() => a.callback()}>
              {a.icon}
              {a.title}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
